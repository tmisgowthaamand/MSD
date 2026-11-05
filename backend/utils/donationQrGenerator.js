/**
 * Official Donation UPI QR Card generator.
 * Produces a WhatsApp-ready PNG that matches the Flow Simulator's donation card:
 * green Maha Seva Dal Foundation header, a scannable UPI QR, a "Scan & Pay" badge,
 * and the UPI / beneficiary details.
 */
const sharp = require("sharp");
const QRCode = require("qrcode");

// Merchant UPI VPA used to actually receive the payment (matches the official QR),
// while mahasevadal@sbi is shown as the friendly ID (same as the web/simulator).
const UPI_PAY_STRING =
  "upi://pay?pa=MAB.037349044880004@AXISBANK&pn=Maha Seva Dal Foundation&cu=INR";
const DISPLAY_UPI_ID = "mahasevadal@sbi";

const xmlEscape = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * @returns {Promise<Buffer|null>} PNG buffer of the donation QR card
 */
const generateDonationQrCard = async () => {
  try {
    const qrDataUrl = await QRCode.toDataURL(UPI_PAY_STRING, {
      margin: 1,
      width: 520,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    const W = 760;
    const H = 980;
    const svg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f1f6f2"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" rx="28" fill="url(#bg)"/>
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="28" fill="none" stroke="#d6e4da" stroke-width="3"/>

      <!-- Header -->
      <circle cx="70" cy="74" r="34" fill="#047857"/>
      <text x="70" y="82" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">MSD</text>
      <text x="120" y="66" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#141413">Maha Seva Dal Foundation</text>
      <text x="120" y="94" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">Official Seva Registry · Estd. 1947</text>
      <line x1="34" y1="122" x2="${W - 34}" y2="122" stroke="#e5e7eb" stroke-width="2"/>

      <!-- QR container -->
      <rect x="110" y="150" width="540" height="580" rx="22" fill="#ffffff" stroke="#e5e7eb" stroke-width="2"/>
      <image href="${qrDataUrl}" x="150" y="172" width="460" height="460"/>
      <rect x="225" y="652" width="310" height="52" rx="26" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
      <text x="380" y="686" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#047857" text-anchor="middle">✓ Scan &amp; Pay via any UPI App</text>

      <!-- Status line -->
      <text x="40" y="762" font-family="Arial, sans-serif" font-size="21" font-weight="800" fill="#047857">● Official Seva Contribution &amp; Donation</text>
      <text x="40" y="790" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">Maha Seva Dal Foundation · General Welfare Fund</text>

      <!-- UPI details box -->
      <rect x="34" y="810" width="${W - 68}" height="130" rx="16" fill="#f8fafc" stroke="#e5e7eb" stroke-width="2"/>
      <text x="56" y="848" font-family="Arial, sans-serif" font-size="17" fill="#6b7280">Cause</text>
      <text x="${W - 56}" y="848" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#141413" text-anchor="end">General Seva &amp; Relief Fund</text>
      <text x="56" y="884" font-family="Arial, sans-serif" font-size="17" fill="#6b7280">UPI ID</text>
      <text x="${W - 56}" y="884" font-family="'Courier New', monospace" font-size="18" font-weight="700" fill="#047857" text-anchor="end">${xmlEscape(DISPLAY_UPI_ID)}</text>
      <text x="56" y="920" font-family="Arial, sans-serif" font-size="17" fill="#6b7280">Beneficiary</text>
      <text x="${W - 56}" y="920" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#141413" text-anchor="end">Maha Seva Dal Foundation</text>
    </svg>`;

    return await sharp(Buffer.from(svg)).png().toBuffer();
  } catch (e) {
    console.warn("[Donation QR] generation error:", e.message);
    return null;
  }
};

module.exports = { generateDonationQrCard, UPI_PAY_STRING, DISPLAY_UPI_ID };
