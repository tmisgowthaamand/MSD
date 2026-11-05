/**
 * Dispatch the WhatsApp registration Flow to a specific number (re-upload helper).
 * Usage: node scripts/send_flow_to.js 6202352203
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const https = require("https");
const { getDistrictDataSource } = require("../controllers/whatsappFlowEndpoint");

const target = process.argv[2] || "6202352203";

(async () => {
  const token = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID;
  const flowId = process.env.WHATSAPP_FLOW_ID || "1130336959966710";
  if (!token || !phoneId) {
    console.error("Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in backend/.env");
    process.exit(1);
  }

  let cleanPhone = String(target).replace(/\D/g, "");
  if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "interactive",
    interactive: {
      type: "flow",
      header: { type: "text", text: "Maha Seva Dal (Estd. 1947)" },
      body: { text: "Tap below to open your official National Cadre Enrollment form and upload your passport photo." },
      footer: { text: "Official Socio-Cultural Cadre Registry" },
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
            data: { districts: getDistrictDataSource("Tamil Nadu") },
          },
        },
      },
    },
  });

  const res = await new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/v21.0/${phoneId}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (r) => {
        let d = "";
        r.on("data", (c) => (d += c));
        r.on("end", () => resolve({ status: r.statusCode, body: d }));
      }
    );
    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.write(payload);
    req.end();
  });

  console.log(`Sent flow to +${cleanPhone} — HTTP ${res.status}`);
  console.log(res.body);
})();
