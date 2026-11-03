const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not defined in backend/.env");
      process.exit(1);
    }

    const conn = await mongoose.createConnection(
      mongoUri,
      { serverSelectionTimeoutMS: 5000 }
    ).asPromise();

    const coll = conn.db.collection("cadres");
    const count = await coll.countDocuments();
    console.log("Total documents in 'cadres' table:", count);

    const sample = await coll.findOne({ registrationId: "MSD-IND-2026-0001" });
    if (sample) {
      console.log("\n--- Sample Document Verification (MSD-IND-2026-0001) ---");
      console.log("Registration ID   :", sample.registrationId);
      console.log("Full Name         :", sample.fullName);
      console.log("Mobile            :", sample.mobile);
      console.log("Status            :", sample.status);
      console.log("Photo URL         :", sample.photoUrl);
      console.log("Card URL          :", sample.cardUrl);
      console.log("CRM Messages Count:", sample.whatsappCrm?.messages?.length || 0);
      console.log("Donations Count   :", sample.donations?.length || 0);
    } else {
      console.log("\nTable 'cadres' currently has 0 documents (Clean state).");
    }

    const visitor = await coll.findOne({ registrationId: { $exists: false } });
    if (visitor) {
      console.log("\n--- Visitor / Lead Document (Incomplete Lead in Same Table) ---");
      console.log("Name              :", visitor.fullName);
      console.log("Mobile            :", visitor.mobile);
      console.log("Status            :", visitor.status);
      console.log("Lead Status       :", visitor.leadStatus);
      console.log("Last Step         :", visitor.lastStepCompleted);
      console.log("Channel Source    :", visitor.channelSource);
      console.log("Chat Messages     :", visitor.whatsappCrm?.messages?.length || 0);
    }

    await conn.close();
  } catch (e) {
    console.error("Verification error:", e);
  }
})();

