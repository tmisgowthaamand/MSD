const express = require("express");
const router = express.Router();
const {
  getCrmOverview,
  sendInboxReply,
  markConversationRead,
  trackInboxEvent,
  assignLeads,
  updateCrmConfig,
  createOrUpdateTemplate,
  deleteTemplate,
  submitTemplateToMeta,
  syncTemplatesFromMeta,
  createAndLaunchCampaign,
  runHighScaleBenchmark,
} = require("../controllers/whatsappCrmController");

// 1. Unified Overview (Dashboard Analytics, Inbox, Leads, Templates, Campaigns, Config)
router.get("/overview", getCrmOverview);

// 2. WhatsApp Inbox Reply & Live Step/Card Event Tracking
router.post("/inbox/track-event", trackInboxEvent);
router.post("/inbox/:mobile/reply", sendInboxReply);
router.post("/inbox/:mobile/mark-read", markConversationRead);

// 3. Automatic & Manual Lead Assignment (Round-Robin + Manual + Atomic Lock)
router.post("/leads/assign", assignLeads);
router.put("/config", updateCrmConfig);

// 4 & 5. WhatsApp Templates & Direct Meta WABA Approval Integration
router.post("/templates", createOrUpdateTemplate);
router.put("/templates/:id", createOrUpdateTemplate);
router.delete("/templates/:id", deleteTemplate);
router.post("/templates/:id/submit-meta", submitTemplateToMeta);
router.post("/templates/sync-meta", syncTemplatesFromMeta);

// 6. Automated & Bulk WhatsApp Campaigns
router.post("/campaigns", createAndLaunchCampaign);

// 8 & 9. High-Performance 2 Lakh+ Lead Benchmark & Worker Queue Engine
router.post("/scale/benchmark", runHighScaleBenchmark);

module.exports = router;

