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

    console.log("Connecting to MongoDB:", mongoUri.replace(/:([^@]+)@/, ":****@"));
    const conn = await mongoose.createConnection(mongoUri, { serverSelectionTimeoutMS: 8000 }).asPromise();
    console.log(" Connected to MongoDB!");

    const cadresColl = conn.db.collection("cadres");
    const leadsColl = conn.db.collection("incompleteleads");
    const convsColl = conn.db.collection("whatsappconversations");

    // 1. Delete Deepu Kumar from whatsappconversations, incompleteleads, cadres
    const delConvResult = await convsColl.deleteMany({
      $or: [
        { mobile: "9871454424" },
        { customerName: { $regex: /Deepu Kumar/i } },
      ],
    });
    console.log(` Deleted Deepu Kumar conversations: ${delConvResult.deletedCount}`);

    const delLeadResult = await leadsColl.deleteMany({
      $or: [
        { mobile: "9871454424" },
        { fullName: { $regex: /Deepu Kumar/i } },
      ],
    });
    console.log(` Deleted Deepu Kumar incomplete leads: ${delLeadResult.deletedCount}`);

    const delCadreResult = await cadresColl.deleteMany({
      $or: [
        { mobile: "9871454424" },
        { fullName: { $regex: /Deepu Kumar/i } },
      ],
    });
    console.log(` Deleted Deepu Kumar cadre records: ${delCadreResult.deletedCount}`);

    // 2. Check and fix Pornaa (mobile: 9122221121)
    const pornaaCadre = await cadresColl.findOne({
      $or: [{ mobile: "9122221121" }, { registrationId: "MSD-IND-2026-0003" }, { fullName: { $regex: /Pornaa/i } }],
    });
    if (pornaaCadre) {
      console.log("\nFound Pornaa in 'cadres':", {
        fullName: pornaaCadre.fullName,
        mobile: pornaaCadre.mobile,
        registrationId: pornaaCadre.registrationId,
        channelSource: pornaaCadre.channelSource,
        registrationSource: pornaaCadre.registrationSource,
      });

      const updateCadre = await cadresColl.updateOne(
        { _id: pornaaCadre._id },
        { $set: { channelSource: "web", registrationSource: "web" } }
      );
      console.log(" Updated Pornaa channelSource to 'web' in 'cadres':", updateCadre.modifiedCount);
    } else {
      console.log("\nPornaa not found in 'cadres' table directly.");
    }

    // 3. Update all cadres with official registration IDs to channelSource: 'web' unless explicitly whatsapp_bot
    const bulkCadreUpdate = await cadresColl.updateMany(
      {
        registrationId: { $exists: true, $ne: null },
        registrationSource: { $ne: "whatsapp_bot" },
      },
      { $set: { channelSource: "web", registrationSource: "web" } }
    );
    console.log(` Updated ${bulkCadreUpdate.modifiedCount} cadres to channelSource: 'web'.`);

    // 4. Update Pornaa in incompleteleads if present
    const pornaaLead = await leadsColl.findOne({
      $or: [{ mobile: "9122221121" }, { fullName: { $regex: /Pornaa/i } }],
    });
    if (pornaaLead) {
      console.log("\nFound Pornaa in 'incompleteleads':", {
        fullName: pornaaLead.fullName,
        channel: pornaaLead.channel,
        status: pornaaLead.status,
      });
      await leadsColl.updateOne(
        { _id: pornaaLead._id },
        { $set: { channel: "web", status: "RECOVERED" } }
      );
      console.log(" Updated Pornaa in 'incompleteleads' to channel: 'web', status: 'RECOVERED'");
    }

    // 5. Update Pornaa in whatsappconversations if present
    const pornaaConv = await convsColl.findOne({
      $or: [{ mobile: "9122221121" }, { customerName: { $regex: /Pornaa/i } }],
    });
    if (pornaaConv) {
      console.log("\nFound Pornaa in 'whatsappconversations':", {
        customerName: pornaaConv.customerName,
        channel: pornaaConv.channel,
      });
      await convsColl.updateOne(
        { _id: pornaaConv._id },
        { $set: { channel: "web" } }
      );
      console.log(" Updated Pornaa in 'whatsappconversations' to channel: 'web'");
    }

    // Summary of remaining conversations
    const remainingConvs = await convsColl.find({}, { projection: { customerName: 1, mobile: 1, channel: 1 } }).toArray();
    console.log("\nRemaining WhatsApp Conversations:", remainingConvs);

    // Summary of leads in cadres
    const allCadres = await cadresColl.find({}, { projection: { fullName: 1, mobile: 1, channelSource: 1, registrationId: 1 } }).toArray();
    console.log("\nCurrent Cadres in DB:", allCadres);

    await conn.close();
    console.log("\n All DB updates completed successfully!");
  } catch (err) {
    console.error("❌ Error running script:", err);
    process.exit(1);
  }
})();

