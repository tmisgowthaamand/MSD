const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const isTest =
    process.env.NODE_ENV === "test" ||
    Boolean(process.env.NODE_TEST_CONTEXT) ||
    Boolean(process.env.VITEST);

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      if (isTest) return null;
      console.error("❌ Fatal: MONGODB_URI is not defined in environment variables.");
      process.exit(1);
    }
    const startTime = Date.now();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      family: 4, // Fast IPv4 resolution on Windows & Cloud
    });
    const duration = Date.now() - startTime;
    console.log(`✅ [PASS] MongoDB Connected in ${duration}ms: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ Fatal MongoDB Connection Error: ${error.message}`);
    if (!isTest) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
