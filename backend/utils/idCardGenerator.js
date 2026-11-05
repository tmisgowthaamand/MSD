/**
 * Official Digital Cadre ID Card Generator
 * Produces pixel-accurate dual-sided 827 x 1181 vertical cards (70mm x 100mm @ 300 DPI) and
 * a combined side-by-side PNG (1742 x 1245 @ 300 DPI) with transparent canvas background
 * matching C:\Users\Admin\Downloads\MSD-IND-2026-6790_Both.png and DigitalIdCard.tsx.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const QRCode = require("qrcode");

// Pre-load official brand logo, signature, and founder portrait
let cachedLogoB64 = "";
let cachedSignatureB64 = "";
let cachedFounderB64 = "";

try {
  const logoPath = path.resolve(__dirname, "../../public/logo.png");
  if (fs.existsSync(logoPath)) {
    cachedLogoB64 = fs.readFileSync(logoPath).toString("base64");
  }
  const sigPath = path.resolve(__dirname, "../../public/signature.png");
  if (fs.existsSync(sigPath)) {
    cachedSignatureB64 = fs.readFileSync(sigPath).toString("base64");
  }
  const founderPath = path.resolve(__dirname, "../../public/founder-saragabani-gopu-portrait.jpg");
  if (fs.existsSync(founderPath)) {
    cachedFounderB64 = fs.readFileSync(founderPath).toString("base64");
  }
} catch (e) {
  console.warn("[idCardGenerator] Could not load local assets:", e.message);
}

const xmlEscape = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const format10DigitMobile = (num) => {
  if (!num) return "+91 9994625690";
  const cleaned = String(num).replace(/\D/g, "");
  if (cleaned.length === 10) return `+91 ${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  return String(num);
};

const formatDateDDMMYYYY = (raw) => {
  if (!raw) return "—";
  try {
    const s = String(raw).trim();
    if (s.includes("/")) return s;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const mon = String(d.getMonth() + 1).padStart(2, "0");
      const yr = d.getFullYear();
      return `${day}/${mon}/${yr}`;
    }
    return s;
  } catch (e) {
    return String(raw);
  }
};

function generateBarcodeBars(code) {
  const pattern = [2, 1, 1, 2];
  const clean = (code || "MSD-IND-2026-0001").replace(/[^a-zA-Z0-9]/g, "");
  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    pattern.push((c % 3) + 1, ((c >> 1) % 2) + 1, ((c >> 2) % 3) + 1, 1);
  }
  pattern.push(2, 1, 2, 2);

  let currentX = 0;
  let rects = "";
  pattern.forEach((w, idx) => {
    const x = currentX;
    currentX += w;
    if (idx % 2 === 0) {
      rects += `<rect x="${x}" y="0" width="${w}" height="32" fill="#111827"/>`;
    }
  });
  return { svg: rects, totalWidth: currentX };
}

function getOfficialSealSvg() {
  const beads = [];
  for (let i = 0; i < 48; i++) {
    const angle = (i * 2 * Math.PI) / 48;
    beads.push({
      cx: (80 + 74 * Math.cos(angle)).toFixed(2),
      cy: (80 + 74 * Math.sin(angle)).toFixed(2),
    });
  }
  const beadsSvg = beads.map((b) => `<circle cx="${b.cx}" cy="${b.cy}" r="1.4" fill="#1d4ed8"/>`).join("");

  return `
    <g transform="scale(0.85)">
      <defs>
        <path id="sealTopArcBlue" d="M 23,80 A 57,57 0 0,1 137,80" fill="none" />
        <path id="sealBottomArcBlue" d="M 137,80 A 57,57 0 0,1 23,80" fill="none" />
      </defs>
      ${beadsSvg}
      <circle cx="80" cy="80" r="70" stroke="#1d4ed8" stroke-width="2.4" fill="none" opacity="0.95" />
      <circle cx="80" cy="80" r="66" stroke="#1d4ed8" stroke-width="1" stroke-dasharray="3,1.8" fill="none" opacity="0.85" />
      <circle cx="80" cy="80" r="46" stroke="#1d4ed8" stroke-width="1.8" fill="none" opacity="0.95" />
      <circle cx="80" cy="80" r="42.5" stroke="#1d4ed8" stroke-width="0.9" fill="none" opacity="0.8" />
      <text font-size="9.2" font-weight="900" font-family="'Arial Black', Arial, sans-serif" fill="#1d4ed8" letter-spacing="1.4">
        <textPath href="#sealTopArcBlue" startOffset="50%" text-anchor="middle">★ MAHA SEVA DAL ★</textPath>
      </text>
      <text font-size="7.4" font-weight="800" font-family="Arial, sans-serif" fill="#1d4ed8" letter-spacing="1.1">
        <textPath href="#sealBottomArcBlue" startOffset="50%" text-anchor="middle">★ AUTHORISED CADRE SEAL ★</textPath>
      </text>
      <g text-anchor="middle">
        <text x="80" y="58" font-size="8" font-weight="bold" fill="#1e3a8a">★  ★  ★</text>
        <line x1="47" y1="64" x2="113" y2="64" stroke="#1d4ed8" stroke-width="1.4" />
        <line x1="47" y1="66.5" x2="113" y2="66.5" stroke="#1d4ed8" stroke-width="0.7" />
        <text x="80" y="77.5" font-size="10.8" font-weight="900" font-family="'Arial Black', Arial, sans-serif" letter-spacing="1.2" fill="#1e3a8a">AUTHORISED</text>
        <line x1="47" y1="81.5" x2="113" y2="81.5" stroke="#1d4ed8" stroke-width="0.7" />
        <line x1="47" y1="84" x2="113" y2="84" stroke="#1d4ed8" stroke-width="1.4" />
        <text x="80" y="94" font-size="7.5" font-weight="800" font-family="sans-serif" letter-spacing="0.8" fill="#1d4ed8">★ VERIFIED ★</text>
        <text x="80" y="104" font-size="6.8" font-weight="700" font-family="'Courier New', monospace" letter-spacing="0.6" fill="#1e3a8a">ESTD. 1947</text>
      </g>
    </g>
  `;
}

/**
 * Generates official Vertical Front, Back and Combined Digital Cadre ID Card PNG buffers
 * Matching exactly C:\Users\Admin\Downloads\MSD-IND-2026-6790_Both.png (1742 x 1245 @ 300 DPI)
 */
const generateCadreIdCards = async (member, photoBuffer = null) => {
  const regId = member.registrationId || "MSD-IND-2026-ACTIVE";
  const safeRegId = regId.replace(/[^a-zA-Z0-9_-]/g, "");

  // 1. Process candidate headshot photo
  let photoDataUri = null;
  let hasRealPhoto = false;

  // Try memory buffer first
  if (photoBuffer && Buffer.isBuffer(photoBuffer) && photoBuffer.length > 0) {
    try {
      const cropped = await sharp(photoBuffer)
        .resize(233, 286, { fit: "cover", position: "center" })
        .jpeg({ quality: 95 })
        .toBuffer();
      photoDataUri = `data:image/jpeg;base64,${cropped.toString("base64")}`;
      hasRealPhoto = true;
    } catch (photoErr) {
      console.warn("[idCardGenerator] Buffer crop error:", photoErr.message);
    }
  }

  // If no memory buffer, check disk file from photoUrl or fetch remote photo URL
  if (!hasRealPhoto && member.photoUrl) {
    try {
      const localFile = path.resolve(__dirname, `../uploads/photos/${safeRegId}_photo.jpg`);
      const publicLocalFile = path.resolve(__dirname, `../../public/uploads/photos/${safeRegId}_photo.jpg`);
      let fileBuf = null;

      if (fs.existsSync(localFile)) {
        fileBuf = fs.readFileSync(localFile);
      } else if (fs.existsSync(publicLocalFile)) {
        fileBuf = fs.readFileSync(publicLocalFile);
      } else {
        const photoBasename = path.basename(String(member.photoUrl).split("?")[0]);
        const customLocal = path.resolve(__dirname, `../uploads/photos/${photoBasename}`);
        const customPublic = path.resolve(__dirname, `../../public/uploads/photos/${photoBasename}`);
        if (fs.existsSync(customLocal)) {
          fileBuf = fs.readFileSync(customLocal);
        } else if (fs.existsSync(customPublic)) {
          fileBuf = fs.readFileSync(customPublic);
        }
      }

      if (!fileBuf && member.photoUrl.startsWith("data:image")) {
        const base64Data = member.photoUrl.split(",")[1];
        if (base64Data) {
          fileBuf = Buffer.from(base64Data, "base64");
        }
      } else if (!fileBuf && (member.photoUrl.startsWith("http://") || member.photoUrl.startsWith("https://"))) {
        try {
          const res = await fetch(member.photoUrl, { signal: AbortSignal.timeout(6000) });
          if (res.ok) {
            fileBuf = Buffer.from(await res.arrayBuffer());
            try {
              const photosDir = path.resolve(__dirname, "../uploads/photos");
              if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
              fs.writeFileSync(localFile, fileBuf);
            } catch (saveErr) {}
          }
        } catch (fetchErr) {
          console.warn("[idCardGenerator] Failed to fetch remote photoUrl:", member.photoUrl, fetchErr.message);
        }
      }

      if (fileBuf && Buffer.isBuffer(fileBuf) && fileBuf.length > 0) {
        const cropped = await sharp(fileBuf)
          .resize(233, 286, { fit: "cover", position: "center" })
          .jpeg({ quality: 95 })
          .toBuffer();
        photoDataUri = `data:image/jpeg;base64,${cropped.toString("base64")}`;
        hasRealPhoto = true;
      }
    } catch (e) {
      console.warn("[idCardGenerator] Photo load/crop error:", e.message);
    }
  }

  // Fallback to founder portrait if candidate has no uploaded photo
  if (!photoDataUri && cachedFounderB64) {
    photoDataUri = `data:image/jpeg;base64,${cachedFounderB64}`;
  }

  // 2. Generate Verification QR code data URL
  const verifyUrl = `https://mahasevadal.com/verify?id=${encodeURIComponent(regId)}&name=${encodeURIComponent(
    member.fullName || ""
  )}&wing=${encodeURIComponent(member.wing || member.assignedWing || "")}`;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 250,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch (qrErr) {
    console.error("[idCardGenerator] QR generation error:", qrErr.message);
  }

  // Format and XML-escape data fields
  const memberName = xmlEscape((member.fullName || "Volunteer Cadre").toUpperCase());
  const memberRegId = xmlEscape(regId);
  const memberWing = xmlEscape(member.wing || member.assignedWing || "General Seva Cadre");
  const memberState = xmlEscape(member.state || member.stateUnit || "Tamil Nadu");
  const memberDistrict = xmlEscape(member.district || member.districtUnit || "Chennai");
  const memberBlood = xmlEscape(member.bloodGroup || "O+");
  const memberEmergency = xmlEscape(
    member.emergencyNumber ? format10DigitMobile(member.emergencyNumber) : format10DigitMobile(member.mobile)
  );
  const emergencyRel = xmlEscape(member.emergencyRelation ? ` (${member.emergencyRelation})` : "");
  const memberFather = xmlEscape(member.fatherName || "—");
  const memberDob = xmlEscape(formatDateDDMMYYYY(member.dob));
  const memberGender = xmlEscape(member.gender || "Male");
  const memberMobile = xmlEscape(format10DigitMobile(member.mobile));
  const memberAssembly = xmlEscape(member.assembly || member.assemblyAssm || "—");
  const memberZone = xmlEscape(member.zone || member.zoneRegion || "—");

  const rawIssueDate = member.approvedAt || member.createdAt || new Date();
  const issueDateFormatted = new Date(rawIssueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const barcodeData = generateBarcodeBars(regId);

  // ─── 3. OFFICIAL VERTICAL FRONT CARD SVG (827 x 1181) ─────────────
  const frontSvg = `
  <svg width="827" height="1181" viewBox="0 0 827 1181" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="frontCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#faf8f2"/>
        <stop offset="100%" stop-color="#f4ede0"/>
      </linearGradient>
      <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FF6200"/>
        <stop offset="50%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#138808"/>
      </linearGradient>
      <linearGradient id="headerBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#faf6ef"/>
      </linearGradient>
      <linearGradient id="orangeBannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FE7118"/>
        <stop offset="100%" stop-color="#DF702D"/>
      </linearGradient>
      <clipPath id="frontCardClip">
        <rect x="0" y="0" width="827" height="1181" rx="42"/>
      </clipPath>
      <clipPath id="photoInnerClip">
        <rect x="34" y="273" width="233" height="286" rx="17"/>
      </clipPath>
      <clipPath id="logoClip">
        <circle cx="76" cy="88" r="42"/>
      </clipPath>
    </defs>

    <g clip-path="url(#frontCardClip)">
      <rect width="827" height="1181" fill="url(#frontCardBg)"/>

      <!-- Top Tricolor Ribbon -->
      <rect x="0" y="0" width="827" height="16" fill="url(#ribbonGrad)"/>
      <line x1="0" y1="16" x2="827" y2="16" stroke="#e5d8c3" stroke-width="2"/>

      <!-- Header Panel -->
      <rect x="0" y="17" width="827" height="213" fill="url(#headerBg)"/>
      <line x1="0" y1="230" x2="827" y2="230" stroke="#e8ddcb" stroke-width="2"/>

      <!-- Logo -->
      ${
        cachedLogoB64
          ? `<image href="data:image/png;base64,${cachedLogoB64}" x="34" y="46" width="84" height="84" clip-path="url(#logoClip)"/>`
          : `<circle cx="76" cy="88" r="42" fill="#faf3ee" stroke="#FF6200" stroke-width="3"/><text x="76" y="96" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#FF6200" text-anchor="middle">MSD</text>`
      }

      <!-- Center Header Text -->
      <text x="413" y="68" font-family="Georgia, 'Times New Roman', serif" font-size="37" font-weight="900" fill="#141413" text-anchor="middle" letter-spacing="0.5">MAHA SEVA DAL</text>
      <text x="413" y="98" font-family="Arial, 'Helvetica Neue', sans-serif" font-size="20" font-weight="bold" fill="#FF6200" letter-spacing="2" text-anchor="middle">ESTD. 1947 · UNITY OF PEOPLE</text>
      <text x="413" y="126" font-family="Arial, 'Helvetica Neue', sans-serif" font-size="17" font-weight="500" fill="#736b5e" text-anchor="middle">National Socio-Cultural Cadre Registry</text>

      <!-- Right 1947 Shield -->
      <g transform="translate(752, 88)">
        <circle cx="0" cy="0" r="37" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.8"/>
        <!-- Shield icon -->
        <path d="M -12 -14 L 12 -14 C 12 5 0 15 0 15 C 0 15 -12 5 -12 -14 Z" fill="none" stroke="#FF6200" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M -5 -2 L -1 3 L 7 -5" fill="none" stroke="#FF6200" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="0" y="27" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#FF6200" text-anchor="middle">1947</text>
      </g>

      <!-- Orange Banner -->
      <rect x="29" y="153" width="764" height="71" rx="10" fill="url(#orangeBannerGrad)"/>
      <text x="413" y="200" font-family="Arial, 'Helvetica Neue', sans-serif" font-size="19.5" font-weight="bold" fill="#ffffff" letter-spacing="2" text-anchor="middle">OFFICIAL NATIONAL CADRE IDENTITY CARD</text>

      <!-- Profile Section: Photo Box -->
      <rect x="29" y="268" width="243" height="296" rx="21" fill="#f8f6f0" stroke="#FF6200" stroke-width="5"/>
      ${
        photoDataUri
          ? `<image href="${photoDataUri}" x="34" y="273" width="233" height="286" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoInnerClip)"/>`
          : `<rect x="34" y="273" width="233" height="286" rx="17" fill="#faede3"/><text x="150" y="430" font-family="Georgia, serif" font-size="70" font-weight="bold" fill="#FF6200" text-anchor="middle">${memberName.charAt(0)}</text>`
      }

      <!-- Identity Details beside Photo -->
      <g transform="translate(295, 275)">
        <text x="0" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">CADRE FULL NAME</text>
        <text x="0" y="85" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#141413">${memberName}</text>

        <text x="0" y="150" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">REGISTRATION ID</text>
        <rect x="0" y="165" width="306" height="42" rx="12" fill="#fff8f0" stroke="#fed7aa" stroke-width="2"/>
        <text x="153" y="195" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#D65000" letter-spacing="1.5" text-anchor="middle">${memberRegId}</text>

        <text x="0" y="255" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="#44403c" letter-spacing="1">WING:</text>
        <text x="65" y="255" font-family="Arial, sans-serif" font-size="25" font-weight="bold" fill="#141413">${memberWing}</text>
      </g>

      <!-- 2-Column Info Grid -->
      <g transform="translate(29, 598)">
        <rect width="764" height="252" rx="21" fill="#faf6ee" stroke="#e6dbc8" stroke-width="2"/>
        <line x1="382" y1="10" x2="382" y2="242" stroke="#ede3d3" stroke-width="2"/>
        <line x1="10" y1="84" x2="754" y2="84" stroke="#ede3d3" stroke-width="2"/>
        <line x1="10" y1="168" x2="754" y2="168" stroke="#ede3d3" stroke-width="2"/>

        <!-- Row 1: State & District -->
        <text x="25" y="36" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">STATE UNIT</text>
        <text x="25" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#141413">${memberState}</text>

        <text x="407" y="36" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">DISTRICT UNIT</text>
        <text x="407" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#141413">${memberDistrict}</text>

        <!-- Row 2: Assembly & Zone -->
        <text x="25" y="118" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">ASSEMBLY CONSTITUENCY</text>
        <text x="25" y="150" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#141413">${memberAssembly}</text>

        <text x="407" y="118" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">ZONE / REGION</text>
        <text x="407" y="150" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#141413">${memberZone}</text>

        <!-- Row 3: Contact & Blood Group -->
        <text x="25" y="202" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">CONTACT MOBILE</text>
        <text x="25" y="234" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#141413">${memberMobile}</text>

        <text x="407" y="202" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">BLOOD GROUP</text>
        <rect x="407" y="210" width="70" height="34" rx="7" fill="#fee2e2" stroke="#fca5a5" stroke-width="2"/>
        <text x="442" y="235" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#991b1b" text-anchor="middle">${memberBlood}</text>
      </g>

      <!-- Security QR Code & Signatory Row -->
      <g transform="translate(29, 995)">
        <line x1="0" y1="-25" x2="764" y2="-25" stroke="#e8dfcf" stroke-width="2"/>

        <!-- Left: QR Code Box -->
        <rect x="3" y="2" width="120" height="120" rx="16" fill="#ffffff" stroke="#e3d7c5" stroke-width="2"/>
        <image href="${qrDataUrl}" x="8" y="7" width="110" height="110"/>

        <g transform="translate(136, 12)">
          <text x="0" y="28" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FF6200">SCAN TO VERIFY</text>
          <text x="0" y="58" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#554e44">Official Cadre</text>
          <text x="0" y="86" font-family="'Courier New', monospace" font-size="16" fill="#554e44">mahasevadal.com</text>
        </g>

        <!-- Right: Authorized Signatory & Official Seal (kept fully inside the card edge) -->
        <g transform="translate(470, -28)">
          <!-- Stamp: sits top-right above the signature, fully within the card -->
          <g transform="translate(175, 6) scale(0.82) rotate(-6)">
            ${getOfficialSealSvg()}
          </g>

          <!-- Signature -->
          ${cachedSignatureB64 ? `<image href="data:image/png;base64,${cachedSignatureB64}" x="92" y="40" width="200" height="64"/>` : ""}

          <!-- Underline -->
          <line x1="52" y1="110" x2="293" y2="110" stroke="#141413" stroke-width="2"/>
          <text x="293" y="132" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#141413" text-anchor="end">AUTHORIZED SIGNATORY</text>
          <text x="293" y="153" font-family="Arial, sans-serif" font-size="14" fill="#554e44" text-anchor="end">Central Executive Committee</text>
        </g>
      </g>

      <!-- Bottom Security Band -->
      <rect x="0" y="1130" width="827" height="51" fill="#3d3832"/>
      <text x="413" y="1162" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#FF9933" letter-spacing="3.5" text-anchor="middle">UNITY OF PEOPLE</text>
    </g>

    <!-- Outer border -->
    <rect x="2.5" y="2.5" width="822" height="1176" rx="42" fill="none" stroke="#d5c3aa" stroke-width="5"/>
  </svg>
  `;

  // ─── 4. OFFICIAL VERTICAL BACK CARD SVG (827 x 1181) ──────────────
  const backSvg = `
  <svg width="827" height="1181" viewBox="0 0 827 1181" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="backCardClip">
        <rect x="0" y="0" width="827" height="1181" rx="42"/>
      </clipPath>
      <clipPath id="backLogoClip">
        <circle cx="37" cy="37" r="37"/>
      </clipPath>
    </defs>

    <g clip-path="url(#backCardClip)">
      <rect width="827" height="1181" fill="url(#frontCardBg)"/>

      <!-- Top Tricolor Ribbon -->
      <rect x="0" y="0" width="827" height="16" fill="url(#ribbonGrad)"/>
      <line x1="0" y1="16" x2="827" y2="16" stroke="#e5d8c3" stroke-width="2"/>

      <!-- Back Header Panel -->
      <rect x="0" y="17" width="827" height="213" fill="url(#headerBg)"/>
      <line x1="0" y1="230" x2="827" y2="230" stroke="#e8ddcb" stroke-width="2"/>

      <!-- Logo & Header Titles -->
      <g transform="translate(31, 48)">
        ${
          cachedLogoB64
            ? `<image href="data:image/png;base64,${cachedLogoB64}" x="0" y="0" width="74" height="74" clip-path="url(#backLogoClip)"/>`
            : `<circle cx="37" cy="37" r="37" fill="#faf3ee" stroke="#FF6200" stroke-width="2.5"/>`
        }
        <g transform="translate(90, 8)">
          <text x="0" y="18" font-family="Georgia, serif" font-size="37" font-weight="900" fill="#141413">MAHA SEVA DAL</text>
          <text x="0" y="44" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FF6200" letter-spacing="1">CADRE PARTICULARS &amp; VERIFICATION</text>
          <text x="0" y="68" font-family="Arial, sans-serif" font-size="17" font-weight="500" fill="#554e44">National Socio-Cultural Cadre Registry · Estd. 1947</text>
        </g>
      </g>

      <!-- REVERSE SIDE Badge -->
      <rect x="675" y="70" width="118" height="38" rx="6" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5"/>
      <text x="734" y="95" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#ea580c" text-anchor="middle">REVERSE SIDE</text>

      <!-- Dark Banner -->
      <rect x="29" y="153" width="764" height="71" rx="10" fill="#2c2824"/>
      <text x="413" y="198" font-family="'Courier New', monospace" font-size="19" font-weight="bold" fill="#FF9933" letter-spacing="2.5" text-anchor="middle">OFFICIAL CADRE RECORD &amp; DIRECTIVES</text>

      <!-- Section 1: Family & Personal Particulars -->
      <g transform="translate(29, 242)">
        <rect width="764" height="200" rx="21" fill="#faf6ee" stroke="#e6dbc8" stroke-width="2"/>
        <line x1="382" y1="10" x2="382" y2="190" stroke="#ede3d3" stroke-width="2"/>
        <line x1="10" y1="100" x2="754" y2="100" stroke="#ede3d3" stroke-width="2"/>

        <!-- Col 1: Father / Husband -->
        <text x="25" y="38" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">FATHER&apos;S / HUSBAND&apos;S NAME</text>
        <text x="25" y="74" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#141413">${memberFather}</text>

        <!-- Col 2: Date of Birth -->
        <text x="407" y="38" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">DATE OF BIRTH</text>
        <text x="407" y="74" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#141413">${memberDob}</text>

        <!-- Col 1: Gender -->
        <text x="25" y="138" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">GENDER</text>
        <text x="25" y="174" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#141413">${memberGender}</text>

        <!-- Col 2: Emergency / WhatsApp -->
        <text x="407" y="138" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">EMERGENCY / WHATSAPP</text>
        <text x="407" y="174" font-family="'Courier New', monospace" font-size="21" font-weight="bold" fill="#141413">${memberEmergency}<tspan font-family="Arial, sans-serif" font-size="18" font-weight="normal" fill="#44403c">${emergencyRel}</tspan></text>
      </g>

      <!-- Section 2: National Central Secretariat -->
      <g transform="translate(29, 471)">
        <rect width="764" height="248" rx="21" fill="#faf6ee" stroke="#e6dbc8" stroke-width="2"/>
        <line x1="20" y1="46" x2="744" y2="46" stroke="#ede3d3" stroke-width="2"/>
        <line x1="382" y1="52" x2="382" y2="155" stroke="#ede3d3" stroke-width="2"/>
        <line x1="20" y1="162" x2="744" y2="162" stroke="#ede3d3" stroke-width="2"/>

        <!-- Top sub-header -->
        <text x="25" y="32" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#FF6200" letter-spacing="1">NATIONAL CENTRAL SECRETARIAT</text>
        <text x="740" y="32" font-family="'Courier New', monospace" font-size="17" font-weight="bold" fill="#44403c" text-anchor="end">Estd. 1947</text>

        <!-- Helpline -->
        <text x="25" y="78" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">CADRE HELPLINE</text>
        <text x="25" y="112" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#141413">+91 9994625690</text>
        <text x="25" y="142" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#141413">+91 9514576540</text>

        <!-- Verification -->
        <text x="407" y="78" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#44403c" letter-spacing="1">OFFICIAL VERIFICATION</text>
        <text x="407" y="116" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#D65000">mahasevadal.com</text>

        <!-- Address & Email -->
        <text x="25" y="196" font-family="Arial, sans-serif" font-size="17" fill="#44403c"><tspan font-weight="bold" fill="#141413">Head Office:</tspan> No.8/7, Thiruvallur 1st Street, Adambakkam, Chennai - 600 088.</text>
        <text x="25" y="226" font-family="Arial, sans-serif" font-size="16" fill="#44403c"><tspan font-weight="bold" fill="#141413">Email:</tspan> <tspan font-family="'Courier New', monospace" fill="#736b5e">mahasevadalorganization@gmail.com</tspan></text>
      </g>

      <!-- Section 3: Cadre Directives & Terms -->
      <g transform="translate(29, 746)">
        <rect width="764" height="200" rx="21" fill="#ffffff" stroke="#e8dfcf" stroke-width="2"/>
        <text x="25" y="38" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#141413" letter-spacing="1">CADRE DIRECTIVES &amp; TERMS</text>

        <text x="25" y="80" font-family="Arial, sans-serif" font-size="17" fill="#4a443c">• This card is non-transferable property of Maha Seva Dal (Estd. 1947).</text>
        <text x="25" y="122" font-family="Arial, sans-serif" font-size="17" fill="#4a443c">• Authorized for civic welfare, social upliftment &amp; relief operations.</text>
        <text x="25" y="164" font-family="Arial, sans-serif" font-size="17" fill="#4a443c">• If found, please return to Central Secretariat or call Helpline: +91 9994625690 / 9514576540.</text>
      </g>

      <!-- Section 4: Barcode & Issued Date -->
      <g transform="translate(29, 978)">
        <line x1="0" y1="-20" x2="764" y2="-20" stroke="#e8dfcf" stroke-width="2"/>

        <!-- Barcode Box Left -->
        <rect x="0" y="0" width="340" height="94" rx="12" fill="#ffffff" stroke="#e5dac8" stroke-width="2"/>
        <g transform="translate(18, 14)">
          <svg viewBox="0 0 ${barcodeData.totalWidth} 32" width="304" height="42" preserveAspectRatio="none">
            ${barcodeData.svg}
          </svg>
        </g>
        <text x="170" y="80" font-family="'Courier New', monospace" font-size="17" font-weight="bold" fill="#44403c" letter-spacing="1" text-anchor="middle">REG: ${memberRegId}</text>

        <!-- Issued Date Box Right -->
        <rect x="463" y="21" width="301" height="73" rx="12" fill="#ffffff" stroke="#e5dac8" stroke-width="2"/>
        <text x="613" y="50" font-family="Arial, sans-serif" font-size="17" fill="#44403c" text-anchor="middle">ISSUED: <tspan font-family="'Courier New', monospace" font-weight="bold" fill="#141413">${issueDateFormatted}</tspan></text>
        <text x="613" y="78" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#FF6200" letter-spacing="1" text-anchor="middle">CENTRAL EXEC. COMMITTEE</text>
      </g>

      <!-- Bottom Security Band -->
      <rect x="0" y="1130" width="827" height="51" fill="#3d3832"/>
      <text x="413" y="1162" font-family="'Courier New', monospace" font-size="18" font-weight="bold" fill="#FF9933" letter-spacing="3.5" text-anchor="middle">DISCIPLINE · SERVICE · UNITY</text>
    </g>

    <!-- Outer border -->
    <rect x="2.5" y="2.5" width="822" height="1176" rx="42" fill="none" stroke="#d5c3aa" stroke-width="5"/>
  </svg>
  `;

  // ─── 5. COMBINED BOTH SIDES CARD SVG (1742 x 1245) ────────────────
  // Transparent background matching C:\Users\Admin\Downloads\MSD-IND-2026-6790_Both.png
  const combinedSvg = `
  <svg width="1742" height="1245" viewBox="0 0 1742 1245" xmlns="http://www.w3.org/2000/svg">
    <!-- Front Side Card (Left: x=32, y=32, w=827, h=1181) -->
    <g transform="translate(32, 32)">
      ${frontSvg}
    </g>

    <!-- Back Side Card (Right: x=883, y=32, w=827, h=1181) -->
    <g transform="translate(883, 32)">
      ${backSvg}
    </g>
  </svg>
  `;

  // ─── 6. RASTERIZE TO HIGH-RES 300 DPI PNG BUFFERS ─────────────────
  let frontPngBuffer = null;
  let backPngBuffer = null;
  let combinedPngBuffer = null;

  try {
    frontPngBuffer = await sharp(Buffer.from(frontSvg))
      .withMetadata({ density: 300 })
      .png()
      .toBuffer();
  } catch (e) {
    console.warn("[idCardGenerator] Front card render error:", e.message);
  }

  try {
    backPngBuffer = await sharp(Buffer.from(backSvg))
      .withMetadata({ density: 300 })
      .png()
      .toBuffer();
  } catch (e) {
    console.warn("[idCardGenerator] Back card render error:", e.message);
  }

  try {
    combinedPngBuffer = await sharp(Buffer.from(combinedSvg))
      .withMetadata({ density: 300 })
      .png()
      .toBuffer();
  } catch (e) {
    console.warn("[idCardGenerator] Combined card render error:", e.message);
  }

  return {
    frontPngBuffer,
    backPngBuffer,
    combinedPngBuffer: combinedPngBuffer || frontPngBuffer,
  };
};

module.exports = {
  generateCadreIdCards,
  xmlEscape,
};
