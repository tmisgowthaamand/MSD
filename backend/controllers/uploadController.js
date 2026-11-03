const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.resolve(__dirname, "../uploads/general");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Upload image directly to DigitalOcean droplet disk
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const ext = req.file.mimetype.split("/")[1] || "jpg";
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, req.file.buffer);

    const baseUrl = process.env.STORAGE_BASE_URL || "https://mahasevadal.com";
    const publicUrl = `${baseUrl}/uploads/general/${filename}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      public_id: `do_${filename}`,
    });
  } catch (error) {
    console.error("Local/Droplet upload error:", error);
    res.status(500).json({ error: "Image upload failed", details: error.message });
  }
};

// Delete image from disk
const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ error: "public_id is required" });
    }

    const filename = public_id.replace(/^do_/, "");
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      result: "ok",
    });
  } catch (error) {
    console.error("Local/Droplet delete error:", error);
    res.status(500).json({ error: "Image deletion failed", details: error.message });
  }
};

module.exports = { uploadImage, deleteImage };
