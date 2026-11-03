const mongoose = require("mongoose");

const MessageSubSchema = new mongoose.Schema(
  {
    messageId: { type: String, default: () => `msg_${Date.now()}` },
    direction: { type: String, enum: ["INBOUND", "OUTBOUND"], default: "INBOUND" },
    type: { type: String, default: "text" },
    content: { type: String, default: "" },
    stepName: { type: String, default: null },
    buttonClicked: { type: String, default: null },
    channelSource: { type: String, default: "whatsapp" },
    status: { type: String, default: "DELIVERED" },
    senderName: { type: String, default: "System" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DonationSubSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true },
    amount: { type: Number, required: true },
    utr: { type: String, default: "" },
    cause: { type: String, default: "General Seva & Relief Fund" },
    paymentMode: { type: String, default: "UPI" },
    status: { type: String, enum: ["PENDING", "VERIFIED", "REJECTED"], default: "VERIFIED" },
    verifiedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CadreSchema = new mongoose.Schema(
  {
    // ─── 1. Identity & Registration ───────────────────────────
    registrationId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      default: "N/A",
      trim: true,
    },
    dob: {
      type: String,
      default: "01/01/1995",
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    bloodGroup: {
      type: String,
      default: "O+",
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    profession: {
      type: String,
      default: "",
    },

    // ─── 2. Emergency Contacts ───────────────────────────────
    emergencyNumber: {
      type: String,
      default: "",
      trim: true,
    },
    emergencyRelation: {
      type: String,
      enum: ["Father", "Mother", "Spouse", "Sibling", "Friend", "Other", ""],
      default: "",
    },

    // ─── 3. Location / Jurisdiction ───────────────────────────
    state: {
      type: String,
      required: true,
      default: "Tamil Nadu",
    },
    district: {
      type: String,
      required: true,
      default: "Chennai",
    },
    assembly: {
      type: String,
      default: "",
      trim: true,
    },
    zone: {
      type: String,
      default: "",
      trim: true,
    },
    taluk: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
      default: "N/A",
    },
    pincode: {
      type: String,
      required: true,
      default: "600001",
    },

    // ─── 4. Assigned Wing & Status ────────────────────────────
    wing: {
      type: String,
      required: true,
      default: "General Seva Cadre",
      enum: [
        "Legal Wing",
        "Medical & Health Wing",
        "Education & Child Welfare",
        "Youth & Sports Wing",
        "Community Seva & Mahaprasadam",
        "General Seva Cadre",
      ],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "INCOMPLETE"],
      default: "PENDING",
      index: true,
    },
    pledgeAccepted: {
      type: Boolean,
      default: true,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    approvedAt: {
      type: Date,
      default: null,
    },

    // ─── 5. Images Hosted on https://mahasevadal.com/ ────────
    photoUrl: {
      type: String,
      default: "",
    },
    photoPublicId: {
      type: String,
      default: "",
    },
    cardUrl: {
      type: String,
      default: "",
    },
    cardIssuedAt: {
      type: Date,
      default: null,
    },

    // ─── 6. Lead Recovery & Progress (End-to-End) ─────────────
    leadStatus: {
      type: String,
      enum: ["IN_PROGRESS", "ABANDONED", "RECOVERED"],
      default: "IN_PROGRESS",
    },
    lastStepCompleted: {
      type: String,
      default: "Step 1: Personal Profile",
    },
    channelSource: {
      type: String,
      enum: ["web", "whatsapp"],
      default: "web",
    },
    assignedTelecaller: {
      id: { type: String, default: null },
      name: { type: String, default: null },
      mobile: { type: String, default: null },
    },

    // ─── 7. WhatsApp Chat Transcript & Window (End-to-End) ────
    whatsappCrm: {
      conversationState: {
        type: String,
        enum: ["OPEN", "PENDING_REPLY", "RESOLVED"],
        default: "OPEN",
      },
      assignedDesk: {
        type: String,
        default: "Secretariat",
      },
      unreadCount: {
        type: Number,
        default: 0,
      },
      windowExpiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      lastMessagePreview: {
        type: String,
        default: "",
      },
      lastMessageAt: {
        type: Date,
        default: Date.now,
      },
      messages: {
        type: [MessageSubSchema],
        default: [],
      },
    },

    // ─── 8. Donations History (End-to-End) ────────────────────
    donations: {
      type: [DonationSubSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "cadres",
  }
);

// High-performance search indexes
CadreSchema.index({ status: 1, state: 1, district: 1 });
CadreSchema.index({ "whatsappCrm.lastMessageAt": -1 });

module.exports = mongoose.model("Cadre", CadreSchema);

