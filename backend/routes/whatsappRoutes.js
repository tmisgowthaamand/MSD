const express = require("express");
const router = express.Router();
const {
  verifyWebhook,
  handleIncomingWebhook,
  sendTestMessage,
} = require("../controllers/whatsappController");
const { handleFlowEndpoint } = require("../controllers/whatsappFlowEndpoint");

// Meta Cloud API Webhook handshake & incoming receiver
router.get("/webhook", verifyWebhook);
router.post("/webhook", handleIncomingWebhook);

// Meta WhatsApp Flows Endpoint (Health check & Decrypted data exchange)
router.get("/flow-endpoint", (req, res) => res.status(200).json({ data: { status: "active" } }));
router.post("/flow-endpoint", handleFlowEndpoint);

// Admin / Internal test dispatch
router.post("/send-test", sendTestMessage);

module.exports = router;

