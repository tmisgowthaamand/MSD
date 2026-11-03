const mongoose = require("mongoose");

const WhatsAppCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    triggerType: {
      type: String,
      enum: [
        "MANUAL_BULK",
        "SCHEDULED",
        "AUTO_INCOMPLETE_REMINDER",
        "AUTO_REGISTRATION_CONFIRMATION",
        "AUTO_FOLLOW_UP",
      ],
      default: "MANUAL_BULK",
    },
    templateName: {
      type: String,
      required: true,
    },
    templateDisplayName: {
      type: String,
      default: "",
    },
    targetAudience: {
      type: String,
      enum: ["ALL_LEADS", "INCOMPLETE_LEADS", "COMPLETED_LEADS", "SELECTED_LEADS"],
      default: "INCOMPLETE_LEADS",
    },
    selectedMobiles: {
      type: [String],
      default: [],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "RUNNING", "COMPLETED", "PAUSED", "FAILED"],
      default: "COMPLETED",
      index: true,
    },
    rateLimitMps: {
      type: Number,
      default: 80, // Meta Cloud API default tier throughput (80 msgs/sec)
    },
    stats: {
      totalTargets: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      replied: { type: Number, default: 0 },
    },
    createdBy: {
      type: String,
      default: "National Executive",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppCampaign", WhatsAppCampaignSchema);

