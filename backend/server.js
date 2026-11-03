const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const memberRoutes = require("./routes/memberRoutes");
const donationRoutes = require("./routes/donationRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const leadRoutes = require("./routes/leadRoutes");
const whatsappCrmRoutes = require("./routes/whatsappCrmRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Trust first proxy hop when behind reverse proxy (DigitalOcean App Platform / Nginx)
app.set("trust proxy", 1);

const isTestEnv =
  process.env.NODE_ENV === "test" ||
  Boolean(process.env.NODE_TEST_CONTEXT) ||
  process.argv.some((arg) => arg.includes("test")) ||
  Boolean(process.env.VITEST);

// Connect to MongoDB (skip during unit tests)
if (!isTestEnv) {
  connectDB();
}
// ─── Security Headers (Helmet) ─────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── Middleware ───────────────────────────────────────────────
const parseAllowedOrigins = () => {
  const envList = [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  ];
  const list = [
    "https://mahasevadal.com",
    "https://www.mahasevadal.com",
    ...envList
      .filter(Boolean)
      .map((o) => o.trim().replace(/\/+$/, "")),
  ];

  if (process.env.NODE_ENV !== "production") {
    list.push(
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3000"
    );
  }
  return [...new Set(list)];
};

const isOriginAllowed = (origin, allowedList, isDev) => {
  // Allow non-browser requests (tools, curl, server-to-server health checks)
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/+$/, "");

  if (isDev) {
    if (cleanOrigin.includes("localhost") || cleanOrigin.includes("127.0.0.1")) {
      return true;
    }
  }
  return allowedList.includes(cleanOrigin);
};

const allowedOrigins = parseAllowedOrigins();
const isDev = process.env.NODE_ENV !== "production";

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, allowedOrigins, isDev)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy violation: Origin not allowed"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
})); 

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Real-Time Request & Traffic Logger (Pass / Fail Detection) ────────
app.use((req, res, next) => {
  const start = Date.now();
  const headerChannel = req.headers["x-client-channel"];
  const inferredChannel = headerChannel ||
    (req.originalUrl.includes("/admin") ? "ADMIN" :
     req.originalUrl.includes("/flow") ? "WHATSAPP" : "WEB");

  // Track response completion
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const isPass = status >= 200 && status < 400;
    const resultTag = isPass
      ? `\x1b[32m[PASS ✅ ${status}]\x1b[0m`
      : `\x1b[31m[FAIL ❌ ${status}]\x1b[0m`;
    
    const icon = inferredChannel.toUpperCase().includes("WHATSAPP")
      ? "📱"
      : inferredChannel.toUpperCase().includes("ADMIN")
      ? "🛡️"
      : "🌐";

    const channelTag = `\x1b[36m${icon} [${inferredChannel.toUpperCase()}]\x1b[0m`;
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour12: false });
    const methodTag = `\x1b[1m${req.method}\x1b[0m`;

    console.log(`[${timeStr}] ${channelTag} ${resultTag} ${methodTag} ${req.originalUrl} (${duration}ms)`);
  });

  next();
});

// ─── Dedicated Live Activity & Component Logger (Web + WhatsApp) ──────
app.post("/api/logs/activity", (req, res) => {
  const {
    channel = "WEB",
    component = "General",
    action = "Action",
    status = "PASS",
    details = {},
  } = req.body || {};

  const timeStr = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const isPass = String(status).toUpperCase() === "PASS" || String(status).startsWith("20");
  const resultTag = isPass
    ? `\x1b[32m[PASS ✅]\x1b[0m`
    : `\x1b[31m[FAIL ❌]\x1b[0m`;

  const icon = channel.toUpperCase().includes("WHATSAPP")
    ? "📱"
    : channel.toUpperCase().includes("ADMIN")
    ? "🛡️"
    : "🌐";

  const channelTag = `\x1b[35m${icon} [${channel.toUpperCase()}]\x1b[0m`;
  const compTag = `\x1b[33m[${component}]\x1b[0m`;
  const detailsStr = details && Object.keys(details).length > 0
    ? ` | \x1b[90m${JSON.stringify(details)}\x1b[0m`
    : "";

  console.log(`[${timeStr}] ${channelTag} ${compTag} ${resultTag} ${action}${detailsStr}`);
  res.status(200).json({ success: true, loggedAt: new Date().toISOString() });
});

// ─── Static Uploads (Photos & ID Cards on https://mahasevadal.com) ───
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/upload", uploadRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/whatsapp-crm", whatsappCrmRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    message: "Maha Seva Dal Backend API is running ✅",
    environment: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    error: isProd ? "Internal Server Error" : (err.message || "Internal Server Error"),
  });
});

const validateJwtSecret = (secret, isProd = process.env.NODE_ENV === "production") => {
  if (isProd) {
    if (!secret || typeof secret !== "string" || secret.trim().length < 32) {
      return {
        valid: false,
        error: "FATAL: JWT_SECRET must be configured with at least 32 characters in production.",
      };
    }
  }
  return { valid: true };
};

// ─── Start Server & Process Handlers ──────────────────────────
let server = null;
if (require.main === module) {
  const secretCheck = validateJwtSecret(process.env.JWT_SECRET, process.env.NODE_ENV === "production");
  if (!secretCheck.valid) {
    console.error(secretCheck.error);
    process.exit(1);
  }

  const startTime = Date.now();
  server = app.listen(PORT, HOST, () => {
    const bootDuration = Date.now() - startTime;
    console.log(
      `\x1b[32m⚡ [PASS] MSD High-Speed Backend Server Ready in ${bootDuration}ms: http://${HOST}:${PORT}\x1b[0m`
    );
    console.log(
      `\x1b[36m📊 [INFO] Live Real-Time Web & WhatsApp Activity Logger Active\x1b[0m`
    );
  });

  // Dual-bind port 3000 so that `ngrok http 3000` connects seamlessly
  let companionServer = null;
  if (Number(PORT) !== 3000) {
    try {
      companionServer = app.listen(3000, HOST, () => {
        console.log(
          `\x1b[32m⚡ [PASS] Companion Port 3000 Active (supports ngrok http 3000)\x1b[0m`
        );
      });
      companionServer.on("error", () => {});
    } catch (e) {}
  }

  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (companionServer) companionServer.close();
    if (server) {
      server.close(async () => {
        console.log("HTTP server closed.");
        try {
          const mongoose = require("mongoose");
          await mongoose.disconnect();
          console.log("MongoDB connection closed.");
        } catch (e) {
          console.error("Error during MongoDB disconnection:", e.message);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    console.error("FATAL Uncaught Exception:", err.message);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("FATAL Unhandled Rejection:", reason);
    process.exit(1);
  });
}

module.exports = { app, parseAllowedOrigins, isOriginAllowed, validateJwtSecret };

