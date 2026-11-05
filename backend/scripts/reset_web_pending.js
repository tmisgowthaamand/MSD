/**
 * One-time: set any web-registered members that are APPROVED but should have
 * awaited admin verification back to PENDING, so the approve/reject flow is visible.
 * (WhatsApp registrations stay auto-APPROVED.)
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/Member");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  // Reset the web test registrant Pornaa (MSD-IND-2026-0001) to PENDING.
  const res = await Member.updateOne(
    { mobile: "9122221121", channelSource: "web" },
    { $set: { status: "PENDING", approvedAt: null } }
  );
  console.log("Matched:", res.matchedCount, "Modified:", res.modifiedCount);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
