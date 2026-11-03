const express = require("express");
const router = express.Router();
const {
  trackLead,
  getAllLeads,
  sendLeadNudge,
  deleteLead,
} = require("../controllers/leadController");

// Public / Internal tracking endpoint
router.post("/track", trackLead);

// Admin CRM endpoints
router.get("/all", getAllLeads);
router.post("/nudge/:id", sendLeadNudge);
router.delete("/:id", deleteLead);

module.exports = router;

