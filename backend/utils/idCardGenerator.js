const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

// Pre-load official brand logo & signature
let cachedLogoB64 = "";
let cachedSignatureB64 = "";
try {
  const logoPath = path.resolve(__dirname, "../../public/logo.png");
  if (fs.existsSync(logoPath)) {
    cachedLogoB64 = fs.readFileSync(logoPath).toString("base64");
  }
  const sigPath = path.resolve(__dirname, "../../public/signature.png");
  if (fs.existsSync(sigPath)) {
    cachedSignatureB64 = fs.readFileSync(sigPath).toString("base64");
  }
} catch (e) {
  console.warn("[idCardGenerator] Could not load local logo/signature:", e.message);
}

/**
 * Escapes special XML/SVG characters to prevent SVG markup injection / parser errors
 */
const xmlEscape = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Generates Front & Back Digital Cadre ID Card PNG buffers
 * @param {Object} member - Member record with personal & cadre details
 * @param {Buffer|null} photoBuffer - Raw buffer of candidate passport photo (optional)
 * @returns {Promise<{ frontPngBuffer: Buffer, backPngBuffer: Buffer }>}
 */
const generateCadreIdCards = async (member, photoBuffer = null) => {
  // 1. Process candidate headshot photo
  let photoDataUri = null;
  if (photoBuffer && Buffer.isBuffer(photoBuffer) && photoBuffer.length > 0) {
    try {
      const cropped = await sharp(photoBuffer)
        .resize(300, 370, { fit: "cover", position: "attention" })
        .jpeg({ quality: 85 })
        .toBuffer();
      photoDataUri = `data:image/jpeg;base64,${cropped.toString("base64")}`;
    } catch (photoErr) {
      console.warn("[idCardGenerator] Could not crop photoBuffer, fallback to avatar:", photoErr.message);
      photoDataUri = null;
    }
  }

  // 2. Generate Verification QR code data URL
  const regId = member.registrationId || "MSD-IND-2026-ACTIVE";
  const verifyUrl = `https://mahasevadal.com/verify/${encodeURIComponent(regId)}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 220,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch (qrErr) {
    console.error("[idCardGenerator] QR generation error:", qrErr.message);
  }

  // Format data fields
  const memberName = xmlEscape((member.fullName || "Volunteer Cadre").toUpperCase());
  const memberRegId = xmlEscape(regId);
  const memberWing = xmlEscape(member.wing || member.assignedWing || "General Seva Cadre");
  const memberState = xmlEscape(member.state || member.stateUnit || "Tamil Nadu");
  const memberDistrict = xmlEscape(member.district || member.districtUnit || "Chennai");
  const memberBlood = xmlEscape(member.bloodGroup || "O+");
  const memberPin = xmlEscape(member.pincode || "600001");
  const memberAddress = xmlEscape(member.address || "Main Seva Secretariat");
  const memberEmergency = xmlEscape(member.emergencyNumber || member.mobile || "+91 9994625690, +91 9514576540");
  const memberAssembly = xmlEscape(member.assembly || member.assemblyAssm || "—");
  const memberZone = xmlEscape(member.zone || member.zoneRegion || "—");

  // Photo rendering component in SVG
  let photoElement = "";
  if (photoDataUri) {
    photoElement = `
      <g clip-path="url(#photoRound)">
        <image href="${photoDataUri}" x="0" y="0" width="150" height="185" preserveAspectRatio="xMidYMid slice"/>
      </g>
    `;
  } else {
    // Elegant fallback volunteer vector silhouette
    photoElement = `
      <circle cx="75" cy="70" r="38" fill="#cbd5e1"/>
      <path d="M 22 170 C 22 120, 128 120, 128 170 Z" fill="#94a3b8"/>
    `;
  }

  // FRONT CARD SVG TEMPLATE (800x500)
  const frontSvg = `
  <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#fdfbf7"/>
        <stop offset="100%" stop-color="#f5efe6"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FF9933"/>
        <stop offset="100%" stop-color="#E65100"/>
      </linearGradient>
      <linearGradient id="goldBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fde68a"/>
      </linearGradient>
      <clipPath id="photoRound">
        <rect x="0" y="0" width="150" height="185" rx="14" />
      </clipPath>
    </defs>

    <!-- Outer Rounded Card Base -->
    <rect x="0" y="0" width="800" height="500" rx="28" fill="url(#cardBg)" stroke="#d6d3cb" stroke-width="2"/>

    <!-- National Tricolor Top Bar -->
    <path d="M 0 28 Q 0 0 28 0 L 772 0 Q 800 0 800 28 L 800 12 L 0 12 Z" fill="url(#saffronGrad)"/>
    <rect x="0" y="12" width="800" height="4" fill="#ffffff"/>
    <rect x="0" y="16" width="800" height="6" fill="#138808"/>

    <!-- Header Navy Panel -->
    <rect x="0" y="22" width="800" height="88" fill="url(#headerGrad)"/>
    
    <!-- Emblem / Official Logo -->
    ${
      cachedLogoB64
        ? `<image href="data:image/png;base64,${cachedLogoB64}" x="25" y="33" width="66" height="66" />`
        : `
      <circle cx="58" cy="66" r="30" fill="#FF9933" stroke="#ffffff" stroke-width="2"/>
      <circle cx="58" cy="66" r="22" fill="#0f172a"/>
      <text x="58" y="73" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#FF9933" text-anchor="middle">MSD</text>
    `
    }

    <!-- Header Titles -->
    <text x="105" y="58" font-family="'Georgia', serif" font-size="26" font-weight="900" fill="#ffffff" letter-spacing="1">MAHA SEVA DAL</text>
    <text x="105" y="78" font-family="'Arial', sans-serif" font-size="11" font-weight="700" fill="#94a3b8" letter-spacing="2">NATIONAL SOCIO-CULTURAL CADRE REGISTRY</text>
    <text x="105" y="94" font-family="'Arial', sans-serif" font-size="10" font-weight="600" fill="#f59e0b">ESTD. 1947 · GOVERNMENT AFFILIATED VOLUNTEER REGISTRY</text>

    <!-- Right Header Badge -->
    <rect x="640" y="44" width="135" height="44" rx="10" fill="url(#goldBadge)" stroke="#d97706" stroke-width="1.5"/>
    <text x="707" y="61" font-family="Arial, sans-serif" font-size="10" font-weight="800" fill="#92400e" text-anchor="middle">OFFICIAL</text>
    <text x="707" y="78" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">CADRE PVC</text>

    <!-- Photo Container -->
    <g transform="translate(36, 126)">
      <rect x="0" y="0" width="150" height="185" rx="14" fill="#f1f5f9" stroke="#0f172a" stroke-width="2"/>
      ${photoElement}
      <rect x="0" y="155" width="150" height="30" rx="0" fill="#0f172a"/>
      <text x="75" y="175" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">VERIFIED CADRE</text>
    </g>

    <!-- Member Details Grid -->
    <g transform="translate(210, 130)">
      <!-- Candidate Name -->
      <text x="0" y="24" font-family="'Georgia', serif" font-size="28" font-weight="900" fill="#0f172a">${memberName}</text>

      <!-- Registration ID Box -->
      <rect x="0" y="38" width="300" height="34" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      <text x="14" y="61" font-family="'Courier New', monospace" font-size="17" font-weight="900" fill="#0369a1">ID: ${memberRegId}</text>

      <!-- Details Grid -->
      <text x="0" y="96" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">ASSIGNED WING:</text>
      <text x="145" y="96" font-family="Arial, sans-serif" font-size="12.5" font-weight="900" fill="#b45309">${memberWing}</text>

      <text x="0" y="119" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">STATE / UNIT:</text>
      <text x="145" y="119" font-family="Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1e293b">${memberState}</text>

      <text x="0" y="142" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">DISTRICT:</text>
      <text x="145" y="142" font-family="Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1e293b">${memberDistrict}</text>

      <text x="0" y="165" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">ASSEMBLY CONSTITUENCY:</text>
      <text x="145" y="165" font-family="Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1e293b">${memberAssembly}</text>

      <text x="0" y="188" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">ZONE / REGION:</text>
      <text x="145" y="188" font-family="Arial, sans-serif" font-size="12.5" font-weight="800" fill="#1e293b">${memberZone}</text>

      <text x="0" y="211" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">BLOOD GROUP:</text>
      <text x="145" y="211" font-family="Arial, sans-serif" font-size="12.5" font-weight="900" fill="#dc2626">${memberBlood}</text>

      <text x="0" y="234" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#64748b">PIN CODE:</text>
      <text x="145" y="234" font-family="'Courier New', monospace" font-size="12.5" font-weight="900" fill="#0f172a">${memberPin}</text>
    </g>

    <!-- Verification QR Code -->
    <g transform="translate(36, 332)">
      <rect x="0" y="0" width="150" height="138" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      ${qrDataUrl ? `<image href="${qrDataUrl}" x="12" y="8" width="126" height="104"/>` : ""}
      <text x="75" y="126" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">SCAN TO VERIFY</text>
    </g>

    <!-- Authorized Signatory on Front Card -->
    <g transform="translate(470, 410)">
      ${
        cachedSignatureB64
          ? `<image href="data:image/png;base64,${cachedSignatureB64}" x="0" y="-28" width="130" height="40" />`
          : ""
      }
      <line x1="0" y1="12" x2="130" y2="12" stroke="#475569" stroke-width="1.2"/>
      <text x="65" y="26" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="#0f172a" text-anchor="middle">AUTHORIZED SIGNATORY</text>
      <text x="65" y="37" font-family="Arial, sans-serif" font-size="7.5" font-weight="600" fill="#64748b" text-anchor="middle">Central Executive</text>
    </g>

    <!-- Official Blue Rubber Stamp Seal -->
    <g transform="translate(670, 395)">
      <circle cx="0" cy="0" r="62" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-dasharray="8 4" opacity="0.88"/>
      <circle cx="0" cy="0" r="54" fill="none" stroke="#1d4ed8" stroke-width="1.5" opacity="0.88"/>
      <text x="0" y="-30" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="#1d4ed8" text-anchor="middle" letter-spacing="1">MAHA SEVA DAL</text>
      <text x="0" y="-8" font-family="Arial, sans-serif" font-size="13" font-weight="900" fill="#1d4ed8" text-anchor="middle">★ VERIFIED ★</text>
      <text x="0" y="14" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="#1d4ed8" text-anchor="middle">OFFICIAL CADRE</text>
      <text x="0" y="32" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#1d4ed8" text-anchor="middle">ESTD. 1947</text>
    </g>

    <!-- Bottom Tricolor Strip -->
    <path d="M 0 492 L 800 492 L 800 472 Q 800 500 772 500 L 28 500 Q 0 500 0 472 Z" fill="#138808"/>
    <rect x="0" y="488" width="800" height="4" fill="#ffffff"/>
    <rect x="0" y="482" width="800" height="6" fill="#FF9933"/>
  </svg>
  `;

  // BACK CARD SVG TEMPLATE (800x500)
  const backSvg = `
  <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="backBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#fbfaf7"/>
        <stop offset="100%" stop-color="#f3ede2"/>
      </linearGradient>
      <linearGradient id="headerBackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>

    <!-- Outer Rounded Base -->
    <rect x="0" y="0" width="800" height="500" rx="28" fill="url(#backBg)" stroke="#d6d3cb" stroke-width="2"/>

    <!-- Top Tricolor Bar -->
    <path d="M 0 28 Q 0 0 28 0 L 772 0 Q 800 0 800 28 L 800 12 L 0 12 Z" fill="#FF9933"/>
    <rect x="0" y="12" width="800" height="4" fill="#ffffff"/>
    <rect x="0" y="16" width="800" height="6" fill="#138808"/>

    <!-- Header Strip -->
    <rect x="0" y="22" width="800" height="60" fill="url(#headerBackGrad)"/>
    ${cachedLogoB64 ? `<image href="data:image/png;base64,${cachedLogoB64}" x="25" y="28" width="48" height="48" />` : ""}
    <text x="415" y="58" font-family="'Georgia', serif" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">MAHA SEVA DAL · 1947 CADRE OATH &amp; INSTRUCTIONS</text>

    <!-- 1947 Pledge Quote Box -->
    <g transform="translate(40, 105)">
      <rect x="0" y="0" width="720" height="96" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="360" y="32" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">"1947 CADRE OATH OF DEDICATED SERVICE"</text>
      <text x="360" y="56" font-family="Arial, sans-serif" font-size="12" font-style="italic" fill="#334155" text-anchor="middle">"I solemnly affirm to uphold constitutional unity, social justice, secular harmony, and"</text>
      <text x="360" y="76" font-family="Arial, sans-serif" font-size="12" font-style="italic" fill="#334155" text-anchor="middle">"selfless grassroots seva under the timeless ideals of Maha Seva Dal."</text>
    </g>

    <!-- Residential Address & Emergency Details -->
    <g transform="translate(50, 225)">
      <text x="0" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#64748b">RESIDENTIAL ADDRESS:</text>
      <text x="0" y="44" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">${memberAddress}</text>
      <text x="0" y="68" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#0f172a">${memberDistrict}, ${memberState} - PIN: ${memberPin}</text>

      <text x="0" y="110" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#64748b">EMERGENCY CONTACT / HELPLINE:</text>
      <text x="0" y="134" font-family="'Courier New', monospace" font-size="15" font-weight="900" fill="#b91c1c">${memberEmergency}</text>

      <text x="0" y="170" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#64748b">OFFICIAL PORTAL: https://mahasevadal.com</text>
    </g>

    <!-- Signature & Authority Block -->
    <g transform="translate(540, 305)">
      ${
        cachedSignatureB64
          ? `<image href="data:image/png;base64,${cachedSignatureB64}" x="15" y="-15" width="190" height="55" />`
          : `<text x="110" y="30" font-family="'Brush Script MT', cursive, Georgia, serif" font-size="28" font-weight="700" fill="#1e3a8a" text-anchor="middle">Authorized Signatory</text>`
      }
      <line x1="10" y1="42" x2="210" y2="42" stroke="#475569" stroke-width="1.5"/>
      <text x="110" y="62" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">AUTHORIZED SIGNATORY</text>
      <text x="110" y="78" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#64748b" text-anchor="middle">Head Office Secretariat • Chennai</text>
    </g>

    <!-- Bottom Tricolor Strip -->
    <path d="M 0 492 L 800 492 L 800 472 Q 800 500 772 500 L 28 500 Q 0 500 0 472 Z" fill="#138808"/>
    <rect x="0" y="488" width="800" height="4" fill="#ffffff"/>
    <rect x="0" y="482" width="800" height="6" fill="#FF9933"/>
  </svg>
  `;

  // Render both cards to PNG
  const frontPngBuffer = await sharp(Buffer.from(frontSvg)).png().toBuffer();
  const backPngBuffer = await sharp(Buffer.from(backSvg)).png().toBuffer();

  return { frontPngBuffer, backPngBuffer };
};

module.exports = {
  generateCadreIdCards,
  xmlEscape,
};

