const express = require("express");
const multer = require("multer");
const {
  submitDonation,
  getAllDonations,
  updateDonationStatus,
  bulkUpdateDonationStatus,
  deleteDonation,
  bulkDeleteDonations,
  exportDonationsJson,
  verifyDonationQuery,
} = require("../controllers/donationController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max screenshot
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG/PNG/WEBP) are allowed for payment screenshots."), false);
    }
  },
});

// ── Public Routes (WhatsApp Webhook / Web Form / Status Check) ──
router.post("/submit", upload.single("screenshot"), submitDonation);
router.get("/verify/:query", verifyDonationQuery);

// ── Protected Admin Routes ──
router.get("/admin/all", verifyToken, getAllDonations);
router.get("/admin/export-json", verifyToken, exportDonationsJson);
router.patch("/admin/bulk-status", verifyToken, bulkUpdateDonationStatus);
router.patch("/admin/:id/status", verifyToken, updateDonationStatus);
router.put("/admin/:id/status", verifyToken, updateDonationStatus);
router.delete("/admin/:id", verifyToken, deleteDonation);
router.post("/admin/bulk-delete", verifyToken, bulkDeleteDonations);
router.delete("/admin/bulk", verifyToken, bulkDeleteDonations);

module.exports = router;

