const mongoose = require("mongoose");
const Donation = require("../models/Donation");
const Member = require("../models/Member");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const { sendMetaWhatsAppMessage } = require("./whatsappController");

// Escape regex helper
const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Generate clean unique receipt number: MSD-DON-YYYY-XXXX
const generateReceiptNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `MSD-DON-${year}-`;
  
  // Find highest receiptNo with prefix
  const latest = await Donation.findOne({ receiptNo: new RegExp(`^${prefix}`) })
    .sort({ receiptNo: -1 })
    .lean();

  let nextSeq = 1;
  if (latest && latest.receiptNo) {
    const parts = latest.receiptNo.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  // Ensure uniqueness
  let candidate = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  while (await Donation.exists({ receiptNo: candidate })) {
    nextSeq += 1;
    candidate = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  }

  return candidate;
};

// Formats the official WhatsApp confirmation / invoice text
const formatWhatsAppReceipt = (donation) => {
  const dateStr = donation.createdAt
    ? new Date(donation.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const memberInfo = donation.isMember && donation.memberRegId
    ? `\n  • *Cadre ID:* ${donation.memberRegId} (${donation.memberWing || "Cadre Member"})`
    : "";

  return (
    `🚩 *MAHA SEVA DAL FOUNDATION*\n` +
    `*Official Seva Registry · Estd. 1947*\n` +
    `───────────────────────\n` +
    `🙏 *Thank You, ${donation.donorName}!* \n\n` +
    `Your voluntary contribution to Maha Seva Dal has been successfully received & recorded.\n\n` +
    `📋 *DONATION INVOICE DETAILS:*\n` +
    `  • *Receipt No:* ${donation.receiptNo}\n` +
    `  • *Donor Name:* ${donation.donorName}${memberInfo}\n` +
    `  • *Amount Paid:* ₹${Number(donation.amount).toLocaleString("en-IN")}\n` +
    `  • *UTR / Txn ID:* ${donation.utr}\n` +
    `  • *Date:* ${dateStr}\n` +
    `  • *Cause:* ${donation.cause || "General Seva & Relief Fund"}\n` +
    `  • *UPI Beneficiary:* mahasevadal@sbi\n\n` +
    `🌟 *Impact of your Seva:*\n` +
    `Your noble donation directly funds daily Annadanam, free medical checkup camps, and educational mentorship for children.\n\n` +
    `"Service to Humanity is Service to the Nation."\n\n` +
    `Official computer-generated receipt.\n` +
    `🌐 https://mahasevadal.com | support@mahasevadal.com\n` +
    `───────────────────────`
  );
};

// Submit Donation (Public: from WhatsApp, Simulator, or Web)
const submitDonation = async (req, res) => {
  try {
    const {
      donorName,
      mobile,
      amount,
      utr,
      cause = "General Seva & Relief Fund",
      paymentMode = "UPI",
      adminNotes = "",
    } = req.body;

    const cleanMobile = String(mobile || "").replace(/[^0-9]/g, "").slice(-10);
    const cleanUtr = String(utr || "").trim().toUpperCase();

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({ error: "A valid 10-digit mobile number is required." });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "A valid donation amount (at least ₹1) is required." });
    }

    if (!cleanUtr || cleanUtr.length < 6) {
      return res.status(400).json({ error: "A valid Transaction UTR (at least 6 characters) is required." });
    }

    // Check if duplicate UTR submitted
    const existingUtr = await Donation.findOne({ utr: cleanUtr });
    if (existingUtr) {
      return res.status(200).json({
        success: true,
        isExisting: true,
        message: "This transaction UTR has already been recorded.",
        donation: existingUtr,
        whatsappReceipt: existingUtr.whatsappMessage || formatWhatsAppReceipt(existingUtr),
      });
    }

    // Auto-match if member exists in MongoDB
    const member = await Member.findOne({
      $or: [{ mobile: cleanMobile }, { whatsapp: cleanMobile }],
    });

    let isMember = false;
    let memberId = null;
    let memberRegId = "";
    let memberWing = "";
    let resolvedName = (donorName || "").trim();

    if (member) {
      isMember = true;
      memberId = member._id;
      memberRegId = member.registrationId;
      memberWing = member.wing;
      if (!resolvedName || resolvedName.toLowerCase() === "donor" || resolvedName.toLowerCase() === "user") {
        resolvedName = member.fullName;
      }
    }

    if (!resolvedName) {
      resolvedName = `Donor (${cleanMobile.slice(-4)})`;
    }

    // Handle optional screenshot upload
    let screenshotUrl = "";
    let screenshotPublicId = "";

    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "msd/donations",
              transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
            },
            (error, uploaded) => {
              if (error) reject(error);
              else resolve(uploaded);
            }
          );
          uploadStream.end(req.file.buffer);
        });

        screenshotUrl = result.secure_url;
        screenshotPublicId = result.public_id;
      } catch (uploadErr) {
        console.warn("Screenshot upload warning:", uploadErr.message);
      }
    }

    const receiptNo = await generateReceiptNo();

    const newDonation = new Donation({
      receiptNo,
      donorName: resolvedName,
      mobile: cleanMobile,
      amount: numAmount,
      utr: cleanUtr,
      cause,
      paymentMode,
      status: "PENDING",
      isMember,
      memberId,
      memberRegId,
      memberWing,
      screenshotUrl,
      screenshotPublicId,
      adminNotes,
    });

    newDonation.whatsappMessage = formatWhatsAppReceipt(newDonation);
    await newDonation.save();

    console.log(
      `\x1b[32m[PASS] New Donation Recorded: ${receiptNo} | ₹${numAmount} | UTR: ${cleanUtr} | Donor: ${resolvedName} (Member: ${isMember})\x1b[0m`
    );

    return res.status(201).json({
      success: true,
      donation: newDonation,
      whatsappReceipt: newDonation.whatsappMessage,
      message: "Donation recorded successfully. Awaiting admin verification.",
    });
  } catch (error) {
    console.error("Submit Donation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to submit donation." });
  }
};

// Admin: Get all donations with pagination, filters and summary stats
const getAllDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      status = "ALL",
      startDate = "",
      endDate = "",
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { donorName: { $regex: escaped, $options: "i" } },
        { mobile: { $regex: escaped, $options: "i" } },
        { utr: { $regex: escaped, $options: "i" } },
        { receiptNo: { $regex: escaped, $options: "i" } },
        { memberRegId: { $regex: escaped, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const sortObj = {};
    sortObj[sortField] = sortOrder === "asc" ? 1 : -1;

    const [donations, total, statsAggregation] = await Promise.all([
      Donation.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Donation.countDocuments(filter),
      Donation.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            verifiedAmount: {
              $sum: { $cond: [{ $eq: ["$status", "VERIFIED"] }, "$amount", 0] },
            },
            totalCount: { $sum: 1 },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
            },
            verifiedCount: {
              $sum: { $cond: [{ $eq: ["$status", "VERIFIED"] }, 1, 0] },
            },
            rejectedCount: {
              $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
            },
            memberDonationsCount: {
              $sum: { $cond: [{ $eq: ["$isMember", true] }, 1, 0] },
            },
            publicDonationsCount: {
              $sum: { $cond: [{ $eq: ["$isMember", false] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = statsAggregation[0] || {
      totalAmount: 0,
      verifiedAmount: 0,
      totalCount: 0,
      pendingCount: 0,
      verifiedCount: 0,
      rejectedCount: 0,
      memberDonationsCount: 0,
      publicDonationsCount: 0,
    };

    return res.status(200).json({
      success: true,
      donations,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      stats,
    });
  } catch (error) {
    console.error("Get All Donations Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch donations." });
  }
};

// Admin: Update Donation Status (VERIFIED / REJECTED)
const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!["VERIFIED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be VERIFIED, REJECTED, or PENDING." });
    }

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ error: "Donation record not found." });
    }

    donation.status = status;
    if (adminNotes !== undefined) donation.adminNotes = adminNotes;

    if (status === "VERIFIED") {
      donation.verifiedAt = new Date();
      donation.whatsappSent = true;
      donation.whatsappSentAt = new Date();
    } else if (status === "REJECTED") {
      donation.verifiedAt = null;
    }

    donation.whatsappMessage = formatWhatsAppReceipt(donation);
    await donation.save();

    if (status === "VERIFIED") {
      // Dispatch live receipt via Meta WhatsApp Cloud API (asynchronous)
      sendMetaWhatsAppMessage(donation.mobile, donation.whatsappMessage).catch((e) =>
        console.error("[Donation Verify] WhatsApp dispatch error:", e.message)
      );
    }

    console.log(
      `\x1b[32m[PASS] Donation Status Updated: ${donation.receiptNo} -> ${status}\x1b[0m`
    );

    return res.status(200).json({
      success: true,
      donation,
      whatsappReceipt: donation.whatsappMessage,
      message: `Donation marked as ${status} successfully.`,
    });
  } catch (error) {
    console.error("Update Donation Status Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update donation status." });
  }
};

// Admin: Bulk update status
const bulkUpdateDonationStatus = async (req, res) => {
  try {
    const { ids, status, adminNotes = "" } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Array of donation IDs is required." });
    }
    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Status must be VERIFIED or REJECTED." });
    }

    const updateFields = {
      status,
      adminNotes,
    };

    if (status === "VERIFIED") {
      updateFields.verifiedAt = new Date();
      updateFields.whatsappSent = true;
      updateFields.whatsappSentAt = new Date();
    }

    const result = await Donation.updateMany(
      { _id: { $in: ids } },
      { $set: updateFields }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} donations to ${status}.`,
    });
  } catch (error) {
    console.error("Bulk Update Donations Error:", error);
    return res.status(500).json({ error: error.message || "Failed to bulk update donations." });
  }
};

// Admin: Delete donation record
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findByIdAndDelete(id);
    if (!donation) {
      return res.status(404).json({ error: "Donation record not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Donation ${donation.receiptNo} deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete Donation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete donation." });
  }
};

// Admin: Export all donations as JSON
const exportDonationsJson = async (req, res) => {
  try {
    const donations = await Donation.find({}).sort({ createdAt: -1 }).lean();
    res.setHeader("Content-Disposition", 'attachment; filename="msd_donations_export.json"');
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(donations, null, 2));
  } catch (error) {
    console.error("Export Donations Error:", error);
    return res.status(500).json({ error: error.message || "Failed to export donations." });
  }
};

// Public Lookup: Verify donation by UTR or Receipt No
const verifyDonationQuery = async (req, res) => {
  try {
    const { query } = req.params;
    const clean = (query || "").trim();
    if (!clean) {
      return res.status(400).json({ error: "UTR or Receipt Number is required." });
    }

    const donation = await Donation.findOne({
      $or: [
        { receiptNo: { $regex: `^${escapeRegex(clean)}$`, $options: "i" } },
        { utr: { $regex: `^${escapeRegex(clean)}$`, $options: "i" } },
      ],
    }).lean();

    if (!donation) {
      return res.status(404).json({ error: "No donation found matching the reference." });
    }

    return res.status(200).json({
      success: true,
      donation: {
        receiptNo: donation.receiptNo,
        donorName: donation.donorName,
        amount: donation.amount,
        utr: donation.utr,
        status: donation.status,
        cause: donation.cause,
        createdAt: donation.createdAt,
        verifiedAt: donation.verifiedAt,
      },
      whatsappReceipt: formatWhatsAppReceipt(donation),
    });
  } catch (error) {
    console.error("Verify Donation Query Error:", error);
    return res.status(500).json({ error: error.message || "Failed to verify donation." });
  }
};

module.exports = {
  submitDonation,
  getAllDonations,
  updateDonationStatus,
  bulkUpdateDonationStatus,
  deleteDonation,
  exportDonationsJson,
  verifyDonationQuery,
  formatWhatsAppReceipt,
  generateReceiptNo,
};

