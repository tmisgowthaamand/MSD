const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    messageId: { type: String, required: true },
    direction: {
      type: String,
      enum: ["INBOUND", "OUTBOUND"],
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "template", "image", "document", "video", "interactive"],
      default: "text",
    },
    content: { type: String, required: true },
    templateName: { type: String, default: null },
    mediaUrl: { type: String, default: null },
    stepName: { type: String, default: null },
    buttonClicked: { type: String, default: null },
    channelSource: {
      type: String,
      enum: ["whatsapp", "flow_simulator", "web"],
      default: "whatsapp",
    },
    cardData: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["RECEIVED", "SENT", "DELIVERED", "READ", "FAILED"],
      default: "SENT",
    },
    senderName: { type: String, default: "System" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StepHistorySchema = new mongoose.Schema(
  {
    stepLabel: { type: String, required: true },
    buttonClicked: { type: String, default: null },
    channelSource: { type: String, default: "whatsapp" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WhatsAppConversationSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "Cadre Applicant",
      trim: true,
    },
    memberType: {
      type: String,
      enum: ["NEW_MEMBER", "EXISTING_MEMBER"],
      default: "NEW_MEMBER",
      index: true,
    },
    channel: {
      type: String,
      enum: ["whatsapp", "flow_simulator", "web"],
      default: "whatsapp",
    },
    registrationStatus: {
      type: String,
      enum: ["COMPLETED", "INCOMPLETE", "APPROVED", "PENDING", "REJECTED"],
      default: "INCOMPLETE",
      index: true,
    },
    registrationId: {
      type: String,
      default: null,
    },
    lastCompletedStep: {
      type: String,
      default: "Step 1: Personal Profile",
    },
    wing: { type: String, default: null },
    state: { type: String, default: null },
    district: { type: String, default: null },
    cardViewed: { type: Boolean, default: false },
    cardDownloaded: { type: Boolean, default: false },
    cardDownloadedAt: { type: Date, default: null },
    stepHistory: {
      type: [StepHistorySchema],
      default: [],
    },
    assignedTelecaller: {
      id: { type: String, default: null, index: true },
      name: { type: String, default: null },
      assignedAt: { type: Date, default: null },
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    conversationState: {
      type: String,
      enum: ["OPEN", "PENDING_REPLY", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    optInStatus: {
      type: String,
      enum: ["OPTED_IN", "OPTED_OUT"],
      default: "OPTED_IN",
    },
    windowExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessagePreview: {
      type: String,
      default: "",
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

WhatsAppConversationSchema.index({ lastMessageAt: -1, registrationStatus: 1 });

module.exports = mongoose.model("WhatsAppConversation", WhatsAppConversationSchema);

