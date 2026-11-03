const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    // Personal Details
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true, default: "N/A" },
    dob: { type: String, required: true, default: "01/01/1995" },
    age: { type: Number },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"], default: "Other" },
    mobile: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    // Emergency Contact Details (Separate fields)
    emergencyNumber: { type: String, trim: true, default: "" },
    emergencyRelation: {
      type: String,
      trim: true,
      enum: ["Father", "Mother", "Spouse", "Sibling", "Friend", "Other", ""],
      default: "",
    },
    email: { type: String, trim: true, lowercase: true },
    bloodGroup: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },

    // Location / Jurisdiction
    state: { type: String, required: true, default: "Tamil Nadu" },
    district: { type: String, required: true, default: "Chennai" },
    assembly: { type: String, default: "", trim: true },
    zone: { type: String, default: "", trim: true },
    taluk: { type: String, default: "" },
    address: { type: String, required: true, default: "N/A" },
    pincode: { type: String, required: true, default: "600001" },

    // Professional & Wing
    profession: { type: String, default: "" },
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

    // Status & System
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    pledgeAccepted: { type: Boolean, default: true },
    adminNotes: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
