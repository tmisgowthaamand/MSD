const mongoose = require("mongoose");

const IncompleteLeadSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      default: "Volunteer Cadre",
      trim: true,
    },
    channel: {
      type: String,
      enum: ["web", "whatsapp"],
      default: "web",
      index: true,
    },
    leadCategory: {
      type: String,
      enum: ["INCOMPLETE", "COMPLETED"],
      default: "INCOMPLETE",
      index: true,
    },
    registrationId: {
      type: String,
      default: null,
    },
    lastStepCompleted: {
      type: String,
      default: "STEP_1_PROFILE",
    },
    lastStepLabel: {
      type: String,
      default: "Step 1: Personal Profile",
    },
    partialData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "ABANDONED", "RECOVERED"],
      default: "ABANDONED",
      index: true,
    },
    // Telecaller Assignment & Atomic Claim Lock (Req 3)
    assignedTelecaller: {
      id: { type: String, default: null, index: true },
      name: { type: String, default: null },
      mobile: { type: String, default: null },
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    assignmentMode: {
      type: String,
      enum: ["UNASSIGNED", "ROUND_ROBIN", "MANUAL"],
      default: "UNASSIGNED",
    },
    lockedBy: {
      type: String,
      default: null,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    // Meta Compliance (Req 10)
    optInStatus: {
      type: String,
      enum: ["OPTED_IN", "OPTED_OUT"],
      default: "OPTED_IN",
    },
    nudgeCount: {
      type: Number,
      default: 0,
    },
    lastNudgedAt: {
      type: Date,
      default: null,
    },
    abandonedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high-concurrency CRM queries (Req 8)
IncompleteLeadSchema.index({ status: 1, channel: 1, abandonedAt: -1 });
IncompleteLeadSchema.index({ "assignedTelecaller.id": 1, status: 1 });

module.exports = mongoose.model("IncompleteLead", IncompleteLeadSchema);
