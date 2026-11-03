const https = require("https");
const Member = require("../models/Member");
const Donation = require("../models/Donation");
const IncompleteLead = require("../models/IncompleteLead");
const WhatsAppConversation = require("../models/WhatsAppConversation");
const { getDistrictDataSource } = require("./whatsappFlowEndpoint");
const { generateCadreIdCards } = require("../utils/idCardGenerator");
const { fetchMetaMediaBuffer, uploadMetaMedia, sendMetaImageMessage } = require("../utils/metaMedia");

/**
 * Helper to dispatch an outbound text message via Meta WhatsApp Cloud API
 */
const sendMetaWhatsAppMessage = async (toPhone, messageText) => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn(
      "\x1b[33m[Meta WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env. Skipping cloud dispatch.\x1b[0m"
    );
    return { success: false, reason: "CREDENTIALS_MISSING" };
  }

  // Clean phone number: remove non-digits, ensure country code (default to India 91 if 10 digits)
  let cleanPhone = String(toPhone).replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "text",
    text: { preview_url: false, body: messageText },
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${phoneId}/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\x1b[32m[PASS ✅] Meta WhatsApp message dispatched to +${cleanPhone}\x1b[0m`);
            resolve({ success: true, response: parsed });
          } else {
            console.error(`\x1b[31m[FAIL ❌] Meta WhatsApp API Error (${res.statusCode}):\x1b[0m`, parsed);
            resolve({ success: false, error: parsed, statusCode: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, error: data, statusCode: res.statusCode });
        }
      });
    });

    req.on("error", (error) => {
      console.error("\x1b[31m[FAIL ❌] Meta WhatsApp Request Network Error:\x1b[0m", error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Helper to dispatch an interactive List Message with "Choose Service" button
 */
const sendMetaInteractiveList = async (toPhone, isExistingMember = false, memberData = null) => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.warn("\x1b[33m[Meta Interactive List] Missing token or phoneId.\x1b[0m");
    return { success: false };
  }

  let cleanPhone = String(toPhone).replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  let bodyText = "";
  let sectionTitle = "";
  let rows = [];

  if (isExistingMember && memberData) {
    bodyText =
      `🇮🇳 *Maha Seva Dal (Estd. 1947)*\n\n` +
      `*Welcome back, ${memberData.fullName}!* 🎉\n` +
      `*Maha Seva Dal Cadre ID:* \`${memberData.registrationId || "MSD-IND-2026-ACTIVE"}\`\n` +
      `*Assigned Wing:* ${memberData.assignedWing || "General Cadre"}\n\n` +
      `Please tap *Choose Service* below to continue:`;
    sectionTitle = "Cadre Member Services";
    // For already members, remove "Cadre Registration" (show 4 alone)
    rows = [
      {
        id: "opt_card",
        title: "My Cadre ID Card",
        description: "Check approval & get Digital ID Card",
      },
      {
        id: "opt_history",
        title: "History & Ideology",
        description: "Estd. 1947 · Unity of People & Patel",
      },
      {
        id: "opt_website",
        title: "Our Official Website",
        description: "Visit mahasevadal.com portal",
      },
      {
        id: "opt_donate",
        title: "Donate & Support",
        description: "Official UPI QR & Donation Invoice",
      },
    ];
  } else {
    bodyText =
      `🇮🇳 *Maha Seva Dal (Estd. 1947)*\n` +
      `_National Socio-Cultural Cadre Registry_\n\n` +
      `Welcome to Maha Seva Dal (Unity of People's).\n` +
      `Dedicated to constitutional unity, community seva, healthcare, child welfare, and civic empowerment.\n\n` +
      `Please choose an option below to continue:`;
    sectionTitle = "Cadre Services & Portal";
    // For new visitors, show all 5 options
    rows = [
      {
        id: "opt_register",
        title: "Cadre Registration",
        description: "New volunteer cadre enrollment",
      },
      {
        id: "opt_card",
        title: "My Cadre ID Card",
        description: "Check approval & get Digital ID Card",
      },
      {
        id: "opt_history",
        title: "History & Ideology",
        description: "Estd. 1947 · Unity of People & Patel",
      },
      {
        id: "opt_website",
        title: "Our Official Website",
        description: "Visit mahasevadal.com portal",
      },
      {
        id: "opt_donate",
        title: "Donate & Support",
        description: "Official UPI QR & Donation Invoice",
      },
    ];
  }

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "Maha Seva Dal (Estd. 1947)",
      },
      body: {
        text: bodyText,
      },
      footer: {
        text: "Select an option below",
      },
      action: {
        button: "Choose Service",
        sections: [
          {
            title: sectionTitle,
            rows: rows,
          },
        ],
      },
    },
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${phoneId}/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\x1b[32m[PASS ✅] Interactive Choose Service List dispatched to +${cleanPhone}\x1b[0m`);
            resolve({ success: true, response: parsed });
          } else {
            console.error(`\x1b[31m[FAIL ❌] Interactive List Error:\x1b[0m`, parsed);
            resolve({ success: false, error: parsed });
          }
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on("error", (e) => resolve({ success: false, error: e.message }));
    req.write(payload);
    req.end();
  });
};

/**
 * Helper to dispatch an interactive WhatsApp Flow message
 */
const sendMetaFlowMessage = async (toPhone) => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  const flowId = process.env.WHATSAPP_FLOW_ID || "1126482169890474";

  if (!token || !phoneId) {
    console.warn("\x1b[33m[Meta Flow] Missing token or phoneId.\x1b[0m");
    return { success: false };
  }

  let cleanPhone = String(toPhone).replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "interactive",
    interactive: {
      type: "flow",
      header: {
        type: "text",
        text: "Maha Seva Dal (Estd. 1947)",
      },
      body: {
        text: "Welcome! Tap below to open your official National Cadre Enrollment form directly in WhatsApp.",
      },
      footer: {
        text: "Official Socio-Cultural Cadre Registry",
      },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: `msd_${cleanPhone}_${Date.now()}`,
          flow_id: flowId,
          flow_cta: "Enroll as Cadre",
          flow_action: "navigate",
          flow_action_payload: {
            screen: "CADRE_PROFILE",
            data: {
              districts: getDistrictDataSource("Tamil Nadu"),
            },
          },
        },
      },
    },
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "graph.facebook.com",
      path: `/v21.0/${phoneId}/messages`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\x1b[32m[PASS ✅] Flow button dispatched to +${cleanPhone}\x1b[0m`);
            resolve({ success: true, response: parsed });
          } else {
            console.error(`\x1b[31m[FAIL ❌] Flow Dispatch Error:\x1b[0m`, parsed);
            resolve({ success: false, error: parsed });
          }
        } catch (e) {
          resolve({ success: false });
        }
      });
    });

    req.on("error", (e) => resolve({ success: false, error: e.message }));
    req.write(payload);
    req.end();
  });
};

/**
 * Meta Webhook Verification Handshake (GET)
 */
const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    "HOMESERVE_BOT_VERIFY_TOKEN";

  if (mode && token) {
    if (mode === "subscribe" && token === expectedToken) {
      console.log("\x1b[32m[PASS ✅] Meta Webhook verified successfully challenge accepted!\x1b[0m");
      return res.status(200).send(challenge);
    } else {
      console.warn(`\x1b[31m[FAIL ❌] Meta Webhook token mismatch. Expected: ${expectedToken}, Received: ${token}\x1b[0m`);
      return res.sendStatus(403);
    }
  }

  return res.sendStatus(400);
};

/**
 * Meta Incoming Webhook Events (POST)
 */
const handleIncomingWebhook = async (req, res) => {
  // Acknowledge receipt to Meta immediately (prevents duplicate retries)
  res.status(200).json({ status: "EVENT_RECEIVED" });

  try {
    const body = req.body;
    if (body.object !== "whatsapp_business_account") return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const val = change.value || {};
        const messages = val.messages || [];

        for (const msg of messages) {
          const from = msg.from; // e.g. "919994625690"
          const cleanPhone = from.startsWith("91") && from.length === 12 ? from.slice(2) : from;
          const msgType = msg.type;
          let textBody = "";
          let listId = "";

          if (msgType === "text" && msg.text) {
            textBody = msg.text.body.trim();
          } else if (msgType === "button" && msg.button) {
            textBody = msg.button.text;
          } else if (msgType === "interactive") {
            if (msg.interactive?.list_reply) {
              listId = msg.interactive.list_reply.id || "";
              textBody = msg.interactive.list_reply.title || "";
            } else if (msg.interactive?.button_reply) {
              textBody = msg.interactive.button_reply.title || "";
            }
          }

          console.log(
            `\x1b[35m📱 [WHATSAPP INCOMING]\x1b[0m From: +${from} | Type: ${msgType} | ListId: "${listId}" | Text: "${textBody}"`
          );

          const lower = textBody.toLowerCase();

          // Handle Native Flow Message Submission (completed Flow form)
          if (msgType === "interactive" && msg.interactive?.type === "nfm_reply") {
            try {
              const responseJson = JSON.parse(msg.interactive.nfm_reply.response_json || "{}");
              console.log("\x1b[32m[PASS ✅] Received Flow Completion Payload:\x1b[0m", responseJson);

              const regId = `MSD-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;

              // Sanitize emergency contact to strictly 10 digits
              let cleanEmergency = String(responseJson.emergency_contact || cleanPhone).replace(/\D/g, "");
              if (cleanEmergency.length > 10) cleanEmergency = cleanEmergency.slice(-10);

              // Helper to map flow wing title to valid Member schema enum
              const mapToValidWing = (rawWing) => {
                const s = String(rawWing || "").toLowerCase();
                if (s.includes("legal") || s.includes("civic")) return "Legal Wing";
                if (s.includes("health") || s.includes("medic")) return "Medical & Health Wing";
                if (s.includes("educat") || s.includes("child")) return "Education & Child Welfare";
                if (s.includes("youth") || s.includes("sport") || s.includes("yuva")) return "Youth & Sports Wing";
                if (s.includes("community") || s.includes("mahaprasadam") || s.includes("cultural") || s.includes("women") || s.includes("mahila"))
                  return "Community Seva & Mahaprasadam";
                return "General Seva Cadre";
              };

              const assignedWing = mapToValidWing(responseJson.assigned_wing);
              const fatherName = responseJson.father_or_husband_name || responseJson.fatherName || "N/A";
              const state = responseJson.state || "Tamil Nadu";
              const district = responseJson.district || "Chennai";
              const assembly = responseJson.assembly || responseJson.assembly_assm || "";
              const zone = responseJson.zone || responseJson.zone_region || "";
              const address = responseJson.address || "N/A";

              // Extract 6-digit pin code from responseJson.pincode or address
              let pincode = String(responseJson.pincode || "").replace(/\D/g, "");
              if (pincode.length !== 6) {
                const pinMatch = String(address).match(/\b\d{6}\b/);
                pincode = pinMatch ? pinMatch[0] : "600001";
              }

              const newMember = new Member({
                fullName: responseJson.full_name || "Volunteer Cadre",
                fatherName,
                dob: responseJson.dob || "01/01/1995",
                gender: ["Male", "Female", "Other"].includes(responseJson.gender) ? responseJson.gender : "Other",
                bloodGroup: responseJson.blood_group || "O+",
                mobile: cleanPhone,
                emergencyNumber: cleanEmergency || cleanPhone,
                emergencyRelation: "Other",
                state,
                district,
                assembly,
                zone,
                wing: assignedWing,
                address,
                pincode,
                registrationId: regId,
                status: "APPROVED",
                approvedAt: new Date(),
              });
              // Attempt to download candidate photo from WhatsApp CDN if provided
              let candidatePhotoBuffer = null;
              try {
                const photoHandles = responseJson.photo;
                const mediaHandle = Array.isArray(photoHandles) ? photoHandles[0] : photoHandles;
                if (mediaHandle && typeof mediaHandle === "string" && mediaHandle.trim()) {
                  console.log(`[Flow] Fetching candidate photo from Meta CDN: ${mediaHandle}...`);
                  candidatePhotoBuffer = await fetchMetaMediaBuffer(mediaHandle);
                  if (candidatePhotoBuffer) {
                    newMember.photoUrl = `data:image/jpeg;base64,${candidatePhotoBuffer.toString("base64")}`;
                  }
                }
              } catch (photoFetchErr) {
                console.warn("[Flow] Could not fetch candidate photo:", photoFetchErr.message);
              }

              await newMember.save();

              const confirmMsg =
                `🇮🇳 *Maha Seva Dal (Estd. 1947)*\n\n` +
                `*Cadre Enrollment Successful!* 🎉\n` +
                `*Name:* ${newMember.fullName}\n` +
                `*Official Cadre ID:* \`${regId}\`\n` +
                `*Assigned Wing:* ${newMember.wing}\n` +
                `*Unit:* ${newMember.state} / ${newMember.district}\n` +
                `*PIN Code:* ${newMember.pincode}\n\n` +
                `Your official Cadre Membership has been approved! Your Digital Cadre ID Card (Front & Back) is attached below.\n\n` +
                `Reply *1* or *Hi* anytime to view your Digital ID Card.\n\n` +
                `_Vande Mataram · Unity of People_`;

              await sendMetaWhatsAppMessage(from, confirmMsg);

              // Sync completed Meta Flow + Digital ID Card into WhatsApp CRM Inbox
              try {
                const clean10 = String(cleanPhone).replace(/\D/g, "").slice(-10);
                await WhatsAppConversation.findOneAndUpdate(
                  { mobile: clean10 },
                  {
                    $set: {
                      customerName: newMember.fullName,
                      memberType: "NEW_MEMBER",
                      channel: "whatsapp",
                      registrationStatus: "APPROVED",
                      registrationId: regId,
                      lastCompletedStep: "Completed All Steps (ID Card Dispatched on WhatsApp)",
                      wing: newMember.wing,
                      state: newMember.state,
                      district: newMember.district,
                      cardViewed: true,
                      windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000),
                      lastMessageAt: new Date(),
                      lastMessagePreview: `🪪 Digital ID Card (${regId}) Issued on WhatsApp`,
                    },
                    $push: {
                      messages: {
                        $each: [
                          {
                            messageId: `msg_in_flow_${Date.now()}`,
                            direction: "INBOUND",
                            type: "interactive",
                            content: `Completed Meta WhatsApp Registration Flow (${newMember.fullName} · ${newMember.wing})`,
                            stepName: "Step 4: Flow Completed & Oath Pledged",
                            buttonClicked: "Submit WhatsApp Flow",
                            channelSource: "whatsapp",
                            status: "RECEIVED",
                            senderName: newMember.fullName,
                            timestamp: new Date(),
                          },
                          {
                            messageId: `msg_out_card_${Date.now() + 1}`,
                            direction: "OUTBOUND",
                            type: "document",
                            content: confirmMsg,
                            stepName: "Official Digital ID Card Dispatched",
                            channelSource: "whatsapp",
                            cardData: {
                              registrationId: regId,
                              fullName: newMember.fullName,
                              fatherName: newMember.fatherName,
                              dob: newMember.dob,
                              gender: newMember.gender,
                              mobile: clean10,
                              bloodGroup: newMember.bloodGroup,
                              wing: newMember.wing,
                              state: newMember.state,
                              district: newMember.district,
                              address: newMember.address,
                              pincode: newMember.pincode,
                              photoUrl: newMember.photoUrl || "/founder-saragabani-gopu-portrait.jpg",
                              status: "APPROVED",
                              action: "GENERATED",
                            },
                            status: "DELIVERED",
                            senderName: "MSD WhatsApp Bot",
                            timestamp: new Date(Date.now() + 200),
                          },
                        ],
                      },
                      stepHistory: {
                        stepLabel: "Meta Flow Completed & Digital ID Card Dispatched",
                        buttonClicked: "Submit WhatsApp Flow",
                        channelSource: "whatsapp",
                        timestamp: new Date(),
                      },
                    },
                  },
                  { upsert: true }
                );
              } catch (crmErr) {}

              // Instantly generate and dispatch Front & Back Digital ID Cards into WhatsApp chat
              try {
                console.log(`[Flow] Generating Official Cadre ID Cards for ${newMember.fullName}...`);
                const { frontPngBuffer, backPngBuffer } = await generateCadreIdCards(newMember, candidatePhotoBuffer);

                // Dispatch Front ID Card
                const frontUpload = await uploadMetaMedia(frontPngBuffer, `${regId}_front.png`, "image/png");
                if (frontUpload.success && frontUpload.mediaId) {
                  await sendMetaImageMessage(
                    from,
                    frontUpload.mediaId,
                    `🪪 *Official Cadre ID Card (FRONT)*\n*Name:* ${newMember.fullName}\n*ID:* \`${regId}\``
                  );
                } else {
                  console.warn("[Flow] Front card upload to Meta failed:", frontUpload);
                }

                // Dispatch Back ID Card
                const backUpload = await uploadMetaMedia(backPngBuffer, `${regId}_back.png`, "image/png");
                if (backUpload.success && backUpload.mediaId) {
                  await sendMetaImageMessage(
                    from,
                    backUpload.mediaId,
                    `🪪 *Official Cadre ID Card (BACK)*\n*Terms & 1947 Cadre Oath*`
                  );
                } else {
                  console.warn("[Flow] Back card upload to Meta failed:", backUpload);
                }
              } catch (cardErr) {
                console.error("[Flow] Cadre ID Card Generation/Dispatch Error:", cardErr);
              }

              // Mark lead as RECOVERED in Incomplete Leads recovery CRM
              try {
                await IncompleteLead.findOneAndUpdate(
                  { mobile: cleanPhone },
                  {
                    $set: {
                      status: "RECOVERED",
                      lastStepLabel: "Completed & Approved (Recovered)",
                    },
                  }
                );
              } catch (recErr) {}

              continue;
            } catch (flowErr) {
              console.error("[Flow Completion Error]:", flowErr);
            }
          }

          // 1. Check if user is an existing cadre member
          const existingMember = await Member.findOne({
            $or: [{ mobile: cleanPhone }, { mobile: from }, { emergencyContact: cleanPhone }],
          });

          // Track incoming user step / click & open 24-hour customer service window in WhatsApp CRM Inbox
          try {
            const clean10 = String(cleanPhone).replace(/\D/g, "").slice(-10);
            if (clean10.length === 10 && textBody) {
              const stepDesc =
                ["hi", "hello", "hey", "start", "menu", "msd"].includes(lower)
                  ? `User Sent "${textBody}" (24h Window Opened)`
                  : listId
                  ? `Clicked Menu Option: ${textBody}`
                  : `User Message: ${textBody}`;
              await WhatsAppConversation.findOneAndUpdate(
                { mobile: clean10 },
                {
                  $set: {
                    customerName: existingMember?.fullName || "WhatsApp Visitor",
                    memberType: existingMember ? "EXISTING_MEMBER" : "NEW_MEMBER",
                    channel: "whatsapp",
                    registrationStatus: existingMember?.status || "INCOMPLETE",
                    ...(existingMember?.registrationId ? { registrationId: existingMember.registrationId } : {}),
                    lastCompletedStep: stepDesc,
                    windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000),
                    lastMessageAt: new Date(),
                    lastMessagePreview: textBody,
                    unreadCount: 1,
                    conversationState: "OPEN",
                  },
                  $push: {
                    messages: {
                      messageId: `msg_in_wa_${Date.now()}`,
                      direction: "INBOUND",
                      type: listId ? "interactive" : "text",
                      content: textBody,
                      stepName: stepDesc,
                      buttonClicked: listId ? textBody : null,
                      channelSource: "whatsapp",
                      status: "RECEIVED",
                      senderName: existingMember?.fullName || "WhatsApp User",
                      timestamp: new Date(),
                    },
                    stepHistory: {
                      stepLabel: stepDesc,
                      buttonClicked: textBody,
                      channelSource: "whatsapp",
                      timestamp: new Date(),
                    },
                  },
                },
                { upsert: true }
              );
            }
          } catch (waTrackErr) {}

          // 2. Main menu greeting or "Hi" -> Send Interactive "Choose Service" List
          if (["hi", "hello", "hey", "start", "menu", "msd"].includes(lower)) {
            await sendMetaInteractiveList(from, !!existingMember, existingMember);
            continue;
          }

          // 3. Cadre Registration Flow
          if (
            listId === "opt_register" ||
            lower === "cadre registration" ||
            (!existingMember && (lower === "1" || lower.includes("register")))
          ) {
            if (existingMember) {
              const alreadyMsg =
                `ℹ️ *You are already an active Cadre Member!*\n\n` +
                `*Name:* ${existingMember.fullName}\n` +
                `*Cadre ID:* \`${existingMember.registrationId}\`\n` +
                `*Wing:* ${existingMember.assignedWing}\n\n` +
                `_Reply "Hi" to open your Cadre services._`;
              await sendMetaWhatsAppMessage(from, alreadyMsg);
            } else {
              const clean10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
              try {
                await IncompleteLead.findOneAndUpdate(
                  { mobile: clean10 },
                  {
                    $set: {
                      mobile: clean10,
                      fullName: "WhatsApp Cadre Applicant",
                      channel: "whatsapp",
                      lastStepCompleted: "WA_STEP_1_FLOW",
                      lastStepLabel: "WA Step 1: Flow Initiated (Form Dispatched)",
                      status: "ABANDONED",
                      abandonedAt: new Date(),
                    },
                    $setOnInsert: { nudgeCount: 0, lastNudgedAt: null },
                  },
                  { upsert: true }
                );
              } catch (trackErr) {
                console.error("[Lead Track Err]:", trackErr.message);
              }
              await sendMetaFlowMessage(from);
            }
            continue;
          }

          // 4. Cadre ID Card request
          if (
            listId === "opt_card" ||
            lower === "my cadre id card" ||
            lower.includes("card") ||
            (existingMember && lower === "1") ||
            (!existingMember && lower === "2")
          ) {
            if (existingMember) {
              const wingName = existingMember.wing || existingMember.assignedWing || "General Seva Cadre";
              const stateName = existingMember.state || existingMember.stateUnit || "Tamil Nadu";
              const districtName = existingMember.district || existingMember.districtUnit || "Chennai";

              const cardMsg =
                `🪪 *Maha Seva Dal - Official Cadre ID*\n\n` +
                `*Cadre Name:* ${existingMember.fullName}\n` +
                `*Reg ID:* \`${existingMember.registrationId}\`\n` +
                `*Status:* ✅ *APPROVED*\n` +
                `*Assigned Wing:* ${wingName}\n` +
                `*State / District:* ${stateName} / ${districtName}\n\n` +
                `Your official Cadre ID Card (Front & Back) is attached below:\n\n` +
                `_Type "Hi" to return to the main menu._`;
              await sendMetaWhatsAppMessage(from, cardMsg);

              // Generate and dispatch Front & Back Card images
              try {
                let memberPhotoBuf = null;
                if (existingMember.photoUrl && existingMember.photoUrl.startsWith("data:image")) {
                  try {
                    const base64Data = existingMember.photoUrl.split(",")[1];
                    if (base64Data) memberPhotoBuf = Buffer.from(base64Data, "base64");
                  } catch (e) {}
                }

                const { frontPngBuffer, backPngBuffer } = await generateCadreIdCards(existingMember, memberPhotoBuf);

                const frontUpload = await uploadMetaMedia(frontPngBuffer, `${existingMember.registrationId}_front.png`, "image/png");
                if (frontUpload.success && frontUpload.mediaId) {
                  await sendMetaImageMessage(
                    from,
                    frontUpload.mediaId,
                    `🪪 *Official Cadre ID Card (FRONT)*\n*Name:* ${existingMember.fullName}\n*ID:* \`${existingMember.registrationId}\``
                  );
                }

                const backUpload = await uploadMetaMedia(backPngBuffer, `${existingMember.registrationId}_back.png`, "image/png");
                if (backUpload.success && backUpload.mediaId) {
                  await sendMetaImageMessage(
                    from,
                    backUpload.mediaId,
                    `🪪 *Official Cadre ID Card (BACK)*\n*Terms & 1947 Cadre Oath*`
                  );
                }
              } catch (cardErr) {
                console.error("[Card Query Image Dispatch Error]:", cardErr);
              }
            } else {
              const noCardMsg =
                `ℹ️ *No Cadre ID Record Found*\n\n` +
                `There is no active membership registered under +${cleanPhone}.\n\n` +
                `Tap *Cadre Registration* from the *Choose Service* menu to enroll today!\n\n` +
                `_Type "Hi" to view services._`;
              await sendMetaWhatsAppMessage(from, noCardMsg);
            }
            continue;
          }

          // 5. History & Ideology
          if (
            listId === "opt_history" ||
            lower === "history & ideology" ||
            lower.includes("history") ||
            lower.includes("ideology") ||
            (existingMember && lower === "2") ||
            (!existingMember && lower === "3")
          ) {
            const historyMsg =
              `🏛️ *Maha Seva Dal - Origins & Ideology (Estd. 1947)*\n\n` +
              `Founded on August 8, 1947, by Saragabani Gopu under the inspiring guidance of Sardar Vallabhbhai Patel during the dawn of Indian Independence.\n\n` +
              `*Our Guiding Pillars:*\n` +
              `🤝 *Unity (Ekta):* Transcending caste, creed, and regional divides.\n` +
              `🇮🇳 *Selfless Seva:* Free healthcare camps, education kits for underprivileged children, and disaster relief.\n` +
              `⚖️ *Discipline & Civic Duty:* Safeguarding constitutional values.\n\n` +
              `_Type "Hi" anytime to open the service menu._`;
            await sendMetaWhatsAppMessage(from, historyMsg);
            continue;
          }

          // 6. Our Official Website
          if (
            listId === "opt_website" ||
            lower === "our official website" ||
            lower.includes("website") ||
            lower.includes("portal") ||
            (existingMember && lower === "3") ||
            (!existingMember && lower === "4")
          ) {
            const websiteMsg =
              `🌐 *Maha Seva Dal - Official Portal*\n\n` +
              `Explore our national programs, leadership lineage, and digital portals:\n\n` +
              `🔗 *Official Website:* https://mahasevadal.com\n` +
              `🪪 *ID Card Verification:* https://mahasevadal.com/status\n` +
              `🤝 *Cadre Registration:* https://mahasevadal.com/register\n\n` +
              `_Type "Hi" to return to the service menu._`;
            await sendMetaWhatsAppMessage(from, websiteMsg);
            continue;
          }

          // 7. Donation request
          if (
            listId === "opt_donate" ||
            lower === "donate & support" ||
            lower.includes("donate") ||
            (existingMember && lower === "4") ||
            (!existingMember && lower === "5")
          ) {
            const donateMsg =
              `🙏 *Maha Seva Dal - Seva Fund & Support*\n\n` +
              `Your contribution directly funds community healthcare camps, education kits for underprivileged children, and disaster relief seva.\n\n` +
              `💳 *Official UPI ID:* \`mahasevadal@sbi\`\n` +
              `🏦 *Account Name:* Maha Seva Dal Central Trust\n` +
              `🏦 *Bank:* State Bank of India\n\n` +
              `After making payment, please send your *12-digit UTR / Transaction Reference Number* here to receive your official 80G tax-exempt receipt!\n\n` +
              `_Example: UTR 429188291045_`;
            await sendMetaWhatsAppMessage(from, donateMsg);
            continue;
          }

          // 5. UTR submission detection (12 digit numeric)
          const utrMatch = textBody.match(/\b\d{12}\b/);
          if (utrMatch) {
            const utrNumber = utrMatch[0];
            // Check if donation already logged
            const existingDonation = await Donation.findOne({ utr: utrNumber });
            if (existingDonation) {
              const reply =
                `ℹ️ *UTR ${utrNumber} is already recorded!*\n` +
                `Current status: *${existingDonation.status}*\n` +
                `Receipt No: \`${existingDonation.receiptNo}\``;
              await sendMetaWhatsAppMessage(from, reply);
            } else {
              // Create pending donation
              const newDonation = new Donation({
                donorName: existingMember ? existingMember.fullName : `Donor (${cleanPhone})`,
                mobile: cleanPhone,
                amount: 1000,
                utr: utrNumber,
                isMember: !!existingMember,
                memberRegId: existingMember?.registrationId || null,
                memberWing: existingMember?.assignedWing || null,
                status: "PENDING",
              });
              await newDonation.save();

              const ackMsg =
                `✅ *UTR ${utrNumber} Received!*\n\n` +
                `Thank you for supporting Maha Seva Dal. Our National Executive Treasury team will verify the payment against bank records.\n\n` +
                `Receipt Tracking No: \`${newDonation.receiptNo}\`\n` +
                `You will receive your verified receipt message right here upon bank confirmation.`;
              await sendMetaWhatsAppMessage(from, ackMsg);
            }
            continue;
          }
        }
      }
    }
  } catch (err) {
    console.error("[Meta WhatsApp Webhook Error]:", err);
  }
};

/**
 * Test WhatsApp dispatch endpoint (for admin verification)
 */
const sendTestMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    const text = message || "🇮🇳 *Maha Seva Dal*: Meta WhatsApp Cloud API connection test successful! ✅";
    const result = await sendMetaWhatsAppMessage(phone, text);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  sendMetaWhatsAppMessage,
  verifyWebhook,
  handleIncomingWebhook,
  sendTestMessage,
};

