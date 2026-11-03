const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Donation amount must be at least ₹1"],
    },
    utr: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cause: {
      type: String,
      default: "General Seva & Relief Fund",
      trim: true,
    },
    paymentMode: {
      type: String,
      default: "UPI",
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    isMember: {
      type: Boolean,
      default: false,
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    memberRegId: {
      type: String,
      default: "",
    },
    memberWing: {
      type: String,
      default: "",
    },
    screenshotUrl: {
      type: String,
      default: "",
    },
    screenshotPublicId: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    whatsappMessage: {
      type: String,
      default: "",
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
    whatsappSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);

