const mongoose = require("mongoose");
const IncompleteLead = require("../models/IncompleteLead");
const Member = require("../models/Member");
const WhatsAppConversation = require("../models/WhatsAppConversation");
const { sendMetaWhatsAppMessage } = require("./whatsappController");

// Helper to track lead internally
const trackLeadInternal = async ({
  mobile,
  fullName,
  channel = "web",
  lastStepCompleted = "STEP_1_PROFILE",
  lastStepLabel = "Step 1: Personal Details",
  partialData = {},
}) => {
  try {
    let cleanPhone = String(mobile || "").replace(/\D/g, "");
    if (cleanPhone.length > 10) cleanPhone = cleanPhone.slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) return null;

    const updateFields = {
      mobile: cleanPhone,
      channel,
      lastStepCompleted,
      lastStepLabel,
      abandonedAt: new Date(),
      status: "ABANDONED",
      leadCategory: "INCOMPLETE",
    };

    if (fullName && fullName.trim()) {
      updateFields.fullName = fullName.trim();
    }

    // Check if auto-assignment is needed for telecaller
    const existingLead = await IncompleteLead.findOne({ mobile: cleanPhone }).lean();
    if (!existingLead || !existingLead.assignedTelecaller?.id) {
      updateFields.assignedTelecaller = {
        id: "tc_01",
        name: "Ananya Rao",
        mobile: "9876543201",
      };
      updateFields.assignedAt = new Date();
      updateFields.assignmentMode = "ROUND_ROBIN";
    }

    const lead = await IncompleteLead.findOneAndUpdate(
      { mobile: cleanPhone },
      {
        $setOnInsert: { nudgeCount: 0, lastNudgedAt: null },
        $set: { ...updateFields, partialData },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync with WhatsApp Inbox Conversation
    try {
      await WhatsAppConversation.findOneAndUpdate(
        { mobile: cleanPhone },
        {
          $set: {
            customerName: lead.fullName || "Candidate",
            registrationStatus: "INCOMPLETE",
            lastRegistrationStep: lastStepLabel,
            channel,
            state: partialData?.state || "",
            district: partialData?.district || "",
            wing: partialData?.wing || "",
            ...(lead.assignedTelecaller?.id ? { assignedTelecaller: lead.assignedTelecaller } : {}),
          },
          $setOnInsert: {
            mobile: cleanPhone,
            conversationStatus: "PENDING",
            unreadCount: 1,
            lastMessagePreview: `Started ${channel.toUpperCase()} registration (${lastStepLabel})`,
            lastMessageAt: new Date(),
            windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000),
            messages: [
              {
                messageId: `wamid.track_${cleanPhone}_${Date.now()}`,
                direction: "INBOUND",
                senderName: lead.fullName || "Candidate",
                senderRole: "CUSTOMER",
                type: "TEXT",
                content: `Started ${channel.toUpperCase()} registration — currently at ${lastStepLabel}`,
                status: "READ",
                timestamp: new Date(),
              },
            ],
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } catch (convErr) {}

    console.log(
      `\x1b[33m[Lead Tracker] Recorded Drop-off: +91 ${cleanPhone} (${channel.toUpperCase()}) @ ${lastStepLabel}\x1b[0m`
    );
    return lead;
  } catch (err) {
    console.error("[Lead Track Error]:", err.message);
    return null;
  }
};

// API: Track incomplete lead from Web or Client
const trackLead = async (req, res) => {
  try {
    const { mobile, fullName, channel, lastStepCompleted, lastStepLabel, partialData } = req.body;
    if (!mobile) {
      return res.status(400).json({ error: "Mobile number is required" });
    }

    const lead = await trackLeadInternal({
      mobile,
      fullName,
      channel,
      lastStepCompleted,
      lastStepLabel,
      partialData,
    });

    return res.status(200).json({ success: true, lead });
  } catch (error) {
    console.error("Track Lead API Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// API: Get all incomplete leads
const getAllLeads = async (req, res) => {
  try {
    const { channel, status, search } = req.query;
    const filter = {};

    if (channel && channel !== "all") {
      filter.channel = channel;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { mobile: new RegExp(q, "i") },
        { fullName: new RegExp(q, "i") },
        { "partialData.state": new RegExp(q, "i") },
        { "partialData.district": new RegExp(q, "i") },
        { "partialData.wing": new RegExp(q, "i") },
      ];
    }

    const rawLeads = await IncompleteLead.find(filter).sort({ abandonedAt: -1 }).limit(100);
    const mobiles = rawLeads.map((l) => l.mobile);

    // Cross-check with Member collection to detect if any lead has already completed
    const members = await Member.find({
      $or: [
        { mobile: { $in: mobiles } },
        { mobile: { $in: mobiles.map((m) => `91${m}`) } },
        { mobile: { $in: mobiles.map((m) => `+91 ${m}`) } },
      ],
    })
      .select("registrationId fullName status mobile photoUrl wing state district pincode")
      .lean();

    const memberMap = new Map();
    members.forEach((m) => {
      const clean = String(m.mobile).replace(/\D/g, "").slice(-10);
      memberMap.set(clean, m);
    });

    const leads = rawLeads.map((l) => {
      const cleanPhone = String(l.mobile).replace(/\D/g, "").slice(-10);
      const matchedMember = memberMap.get(cleanPhone);
      const isCompleted = !!matchedMember || l.status === "RECOVERED";
      return {
        ...l.toObject(),
        id: l._id.toString(),
        status: isCompleted ? "RECOVERED" : l.status,
        isCompleted,
        registrationId: matchedMember?.registrationId || null,
        memberStatus: matchedMember?.status || null,
        memberPhotoUrl: matchedMember?.photoUrl || null,
      };
    });

    return res.status(200).json({ success: true, count: leads.length, leads });
  } catch (error) {
    console.error("Get All Leads Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// API: Send WhatsApp Recovery Nudge
const sendLeadNudge = async (req, res) => {
  try {
    const { id } = req.params;
    let lead = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      lead = await IncompleteLead.findById(id);
    }
    if (!lead) {
      const cleanId = String(id).replace(/\D/g, "");
      if (cleanId.length >= 10) {
        lead = await IncompleteLead.findOne({ mobile: cleanId.slice(-10) });
      }
    }
    if (!lead && req.body?.mobile) {
      const bodyPhone = String(req.body.mobile).replace(/\D/g, "");
      if (bodyPhone.length >= 10) {
        lead = await IncompleteLead.findOne({ mobile: bodyPhone.slice(-10) });
      }
    }

    if (!lead) {
      // If still not found, construct a temporary lead for the target phone
      const targetPhone = req.body?.mobile || id;
      const cleanPhone = String(targetPhone).replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        lead = await IncompleteLead.findOneAndUpdate(
          { mobile: cleanPhone },
          {
            $set: {
              mobile: cleanPhone,
              fullName: req.body?.fullName || "Candidate",
              channel: req.body?.channel || "whatsapp",
              lastStepCompleted: req.body?.lastStepCompleted || "INCOMPLETE",
              lastStepLabel: req.body?.lastStepLabel || "Incomplete Registration",
              partialData: req.body?.partialData || {},
              status: "ABANDONED",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const recipientName = lead.fullName || "Volunteer";
    const prefillParams = new URLSearchParams({
      tab: "register",
      resume: "true",
      mobile: lead.mobile,
      fullName: lead.fullName || "",
      wing: lead.partialData?.wing || "",
      state: lead.partialData?.state || "",
      district: lead.partialData?.district || "",
    }).toString();
    const resumeUrl = `https://mahasevadal.com/register?${prefillParams}`;

    const nudgeMessage =
      `🇮🇳 *Maha Seva Dal (Estd. 1947)*\n\n` +
      `Namaste *${recipientName}*! 🙏\n\n` +
      `We noticed you started your official National Cadre Enrollment (${lead.lastStepLabel}), but have not completed it yet.\n\n` +
      `Your cadre position in the *${lead.partialData?.wing || "Volunteer Cadre"}* is reserved.\n\n` +
      `👉 *Complete your enrollment & get your Card instantly:* ${resumeUrl}\n\n` +
      `Or reply *Hi* directly in this WhatsApp chat to resume right here!\n\n` +
      `_Unity, Service & Discipline · 1947 Pledge_`;

    // Send WhatsApp nudge
    await sendMetaWhatsAppMessage(lead.mobile, nudgeMessage);

    lead.nudgeCount = (lead.nudgeCount || 0) + 1;
    lead.lastNudgedAt = new Date();
    await lead.save();

    console.log(`\x1b[32m[PASS ✅] Recovery Nudge sent to +91 ${lead.mobile} (Nudge #${lead.nudgeCount})\x1b[0m`);

    return res.status(200).json({
      success: true,
      message: `Nudge message successfully dispatched to +91 ${lead.mobile}`,
      lead: {
        ...lead.toObject(),
        id: lead._id.toString(),
      },
    });
  } catch (error) {
    console.error("Send Lead Nudge Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// API: Delete an incomplete lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await IncompleteLead.findByIdAndDelete(id);
    }
    if (!deleted) {
      const cleanPhone = String(id).replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        deleted = await IncompleteLead.findOneAndDelete({ mobile: cleanPhone });
      }
    }

    // Also remove from cadres table if it is an incomplete lead
    const cleanPhone = deleted?.mobile || String(id).replace(/\D/g, "").slice(-10);
    if (cleanPhone && cleanPhone.length === 10) {
      await Member.deleteMany({
        mobile: cleanPhone,
        status: { $in: ["INCOMPLETE", "ABANDONED"] },
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, message: "Lead removed from recovery CRM" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// API: Bulk delete incomplete leads
const bulkDeleteLeads = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No lead IDs provided for bulk deletion." });
    }

    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    const phones = ids.map((id) => String(id).replace(/\D/g, "").slice(-10)).filter((p) => p.length === 10);

    const deleteResult = await IncompleteLead.deleteMany({
      $or: [
        { _id: { $in: objectIds } },
        { mobile: { $in: phones } },
      ],
    });

    // Also remove any matching incomplete leads from cadres table
    if (phones.length > 0) {
      await Member.deleteMany({
        mobile: { $in: phones },
        status: { $in: ["INCOMPLETE", "ABANDONED"] },
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: `Successfully deleted ${deleteResult.deletedCount} lead record(s).`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  trackLeadInternal,
  trackLead,
  getAllLeads,
  sendLeadNudge,
  deleteLead,
  bulkDeleteLeads,
};
