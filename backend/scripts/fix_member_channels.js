/**
 * One-time data correction: set each Member's channelSource from their reliable
 * WhatsApp conversation entry channel (whatsapp / web). Legacy members created
 * before channel tagging defaulted to "web" even when they came via WhatsApp.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Member = require("../models/Member");
const WhatsAppConversation = require("../models/WhatsAppConversation");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  const members = await Member.find({}).select("fullName mobile channelSource").lean();
  const convos = await WhatsAppConversation.find({}).select("mobile channel").lean();

  const convoChannelByMobile = new Map();
  convos.forEach((c) => {
    const m = String(c.mobile || "").replace(/\D/g, "").slice(-10);
    if (m) convoChannelByMobile.set(m, String(c.channel || "").toLowerCase());
  });

  let updated = 0;
  for (const m of members) {
    const mob = String(m.mobile || "").replace(/\D/g, "").slice(-10);
    const convoChannel = convoChannelByMobile.get(mob);
    if (!convoChannel) continue; // no conversation record -> leave as-is
    const desired = convoChannel.includes("whatsapp") ? "whatsapp" : "web";
    if (m.channelSource !== desired) {
      await Member.updateOne({ _id: m._id }, { $set: { channelSource: desired } });
      console.log(`  ${m.fullName} (${mob}): ${m.channelSource} -> ${desired}`);
      updated++;
    }
  }

  console.log(`Done. Updated ${updated} member(s).`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
