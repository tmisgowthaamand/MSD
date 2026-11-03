const mongoose = require("mongoose");

const TelecallerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, default: "Senior Telecaller" },
    region: { type: String, default: "All India" },
    active: { type: Boolean, default: true },
    assignedCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    repliesReceived: { type: Number, default: 0 },
  },
  { _id: false }
);

const CrmConfigSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: "MSD_CRM_GLOBAL_CONFIG",
      unique: true,
    },
    autoAssignmentEnabled: {
      type: Boolean,
      default: true,
    },
    assignmentMode: {
      type: String,
      enum: ["ROUND_ROBIN", "MANUAL"],
      default: "ROUND_ROBIN",
    },
    roundRobinIndex: {
      type: Number,
      default: 0,
    },
    autoRegistrationConfirmation: {
      type: Boolean,
      default: true,
    },
    autoIncompleteReminder: {
      type: Boolean,
      default: true,
    },
    incompleteReminderDelayMinutes: {
      type: Number,
      default: 30,
    },
    metaMessagingLimitTier: {
      type: String,
      enum: ["TIER_1K", "TIER_10K", "TIER_100K", "TIER_UNLIMITED"],
      default: "TIER_100K",
    },
    metaRateLimitMps: {
      type: Number,
      default: 80,
    },
    workerConcurrency: {
      type: Number,
      default: 16,
    },
    batchChunkSize: {
      type: Number,
      default: 5000,
    },
    telecallers: {
      type: [TelecallerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CrmConfig", CrmConfigSchema);

