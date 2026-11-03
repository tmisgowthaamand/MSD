/**
 * MongoDB Live Status & Diagnostic Check for Maha Seva Dal (MSD)
 * Run: node backend/data/seedDatabase.js
 * Queries live DigitalOcean MongoDB directly (Zero local JSON file persistence)
 */
const mongoose = require("mongoose");
const path = require("path");
const Member = require("../models/Member");
const IncompleteLead = require("../models/IncompleteLead");
const WhatsAppConversation = require("../models/WhatsAppConversation");
const Donation = require("../models/Donation");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in backend/.env");
    process.exit(1);
  }

  console.log("Connecting to DigitalOcean MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected successfully to DB:", mongoose.connection.name);

  const [cadresCount, leadsCount, convsCount, donationsCount] = await Promise.all([
    Member.countDocuments(),
    IncompleteLead.countDocuments(),
    WhatsAppConversation.countDocuments(),
    Donation.countDocuments(),
  ]);

  console.log("\n--- Live DigitalOcean MongoDB Counts ---");
  console.log(` • Cadres / Members    : ${cadresCount} records`);
  console.log(` • Incomplete Leads    : ${leadsCount} records`);
  console.log(` • WhatsApp Chats      : ${convsCount} records`);
  console.log(` • Donations           : ${donationsCount} records`);

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
