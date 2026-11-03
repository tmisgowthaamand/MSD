const express = require("express");
const multer = require("multer");
const {
  registerMember,
  checkMobileExists,
  getAllMembers,
  updateMemberStatus,
  bulkUpdateMemberStatus,
  resubmitMemberPhoto,
  deleteMember,
  bulkDeleteMembers,
  exportMembersJson,
  adminLogin,
  verifyAdminToken,
  checkMemberStatus,
  proxyPhoto,
  getCardSettings,
  updateCardSettings,
} = require("../controllers/memberController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Multer memory storage for member photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB photo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG/PNG/WEBP) are allowed."), false);
    }
  },
});

const rateLimit = require("express-rate-limit");

const isTest =
  process.env.NODE_ENV === "test" ||
  Boolean(process.env.NODE_TEST_CONTEXT) ||
  process.argv.some((arg) => arg.includes("test")) ||
  Boolean(process.env.VITEST);

// Rate limiter for admin login (10 attempts per 15 minutes)
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again after 15 minutes." },
});

// Rate limiter for public status check (30 requests per 15 minutes)
const statusCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many status check requests. Please try again after 15 minutes." },
});

// ─── Public Member Registration & Status Verification ───
router.post("/register", upload.single("photo"), registerMember);
router.post("/resubmit-photo", upload.single("photo"), resubmitMemberPhoto);
router.get("/check-mobile", checkMobileExists);
router.get("/status", statusCheckLimiter, checkMemberStatus);
router.get("/proxy-photo", proxyPhoto);
router.get("/card-settings", getCardSettings);

// ─── Admin Auth ───
router.post("/admin/login", adminLoginLimiter, adminLogin);
router.get("/admin/verify", verifyToken, verifyAdminToken);

// ─── Admin Member Management (Protected) ───
router.get("/admin/all", verifyToken, getAllMembers);
router.get("/admin/export-json", verifyToken, exportMembersJson);
router.patch("/admin/bulk-status", verifyToken, bulkUpdateMemberStatus);
router.patch("/admin/:id/status", verifyToken, updateMemberStatus);
router.put("/admin/:id/status", verifyToken, updateMemberStatus);
router.delete("/admin/:id", verifyToken, deleteMember);
router.post("/admin/bulk-delete", verifyToken, bulkDeleteMembers);
router.delete("/admin/bulk", verifyToken, bulkDeleteMembers);
router.post("/admin/card-settings", verifyToken, updateCardSettings);

module.exports = router;
