const mongoose = require("mongoose");

const WhatsAppTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      default: "en",
    },
    category: {
      type: String,
      enum: ["UTILITY", "MARKETING", "AUTHENTICATION"],
      default: "UTILITY",
    },
    useCase: {
      type: String,
      enum: [
        "INCOMPLETE_REMINDER",
        "REGISTRATION_CONFIRMATION",
        "FOLLOW_UP",
        "PAYMENT_REMINDER",
        "GENERAL_NOTIFICATION",
      ],
      default: "GENERAL_NOTIFICATION",
      index: true,
    },
    headerType: {
      type: String,
      enum: ["NONE", "TEXT", "IMAGE", "DOCUMENT", "VIDEO"],
      default: "NONE",
    },
    headerText: {
      type: String,
      default: "",
    },
    headerMediaUrl: {
      type: String,
      default: "",
    },
    bodyText: {
      type: String,
      required: true,
    },
    footerText: {
      type: String,
      default: "Maha Seva Dal (Estd. 1947)",
    },
    buttons: {
      type: [
        {
          type: { type: String, enum: ["QUICK_REPLY", "URL", "PHONE_NUMBER"], default: "QUICK_REPLY" },
          text: { type: String, required: true },
          url: { type: String, default: "" },
          phoneNumber: { type: String, default: "" },
        },
      ],
      default: [],
    },
    variables: {
      type: [String],
      default: [],
    },
    // Direct Meta Approval Integration (Req 5)
    metaStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAUSED", "DISABLED"],
      default: "APPROVED",
      index: true,
    },
    metaTemplateId: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhatsAppTemplate", WhatsAppTemplateSchema);

