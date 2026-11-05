import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCw,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { getApiUrl } from "@/config/api";

export interface DigitalIdCardProps {
  member: {
    registrationId: string;
    fullName: string;
    fatherName?: string;
    dob?: string;
    age?: number;
    gender?: string;
    mobile?: string;
    whatsapp?: string;
    // Emergency contact fields
    emergencyNumber?: string;
    emergencyRelation?: string;
    email?: string;
    bloodGroup?: string;
    photoUrl?: string;
    state: string;
    district: string;
    assembly?: string;
    zone?: string;
    taluk?: string;
    address?: string;
    pincode?: string;
    wing: string;
    profession?: string;
    createdAt?: string;
    approvedAt?: string;
    status?: string;
  };
  qrDataUrl: string;
  customSealUrl?: string;
  customSignatureUrl?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  hideActionButtons?: boolean;
  stacked?: boolean;
  defaultView?: "both" | "front" | "back";
  showViewToggle?: boolean;
  compact?: boolean;
}

export interface CardSettings {
  customSealUrl?: string;
  customSignatureUrl?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

/**
 * Safely load an image with explicit timeout to prevent hanging on network or CORS stalls
 */
const safeLoadImage = (src: string, timeoutMs = 2500): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src || src.trim().length === 0) return resolve(null);
    let done = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(img);
      }
    };
    img.onerror = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(null);
      }
    };
    img.src = src;
  });
};

/**
 * Official SVG Seal Stamp Component (Realistic Blue Rubber Stamp)
 */
/**
 * Helper to validate and return standardized blood group or null if unspecified
 */
export const getValidBloodGroup = (bloodGroup?: string): string | null => {
  if (!bloodGroup) return null;
  const bg = bloodGroup.trim();
  if (
    !bg ||
    bg.toLowerCase() === "don't know" ||
    bg.toLowerCase() === "not specified" ||
    bg.toLowerCase() === "not provided" ||
    bg === "—" ||
    bg === "-"
  ) {
    return null;
  }
  return bg;
};

export const OfficialSealSvg: React.FC<{ className?: string; color?: string }> = ({
  className = "w-16 h-16",
  color = "#1d4ed8",
}) => {
  // 48 security beaded teeth along perimeter (r = 74)
  const beads = Array.from({ length: 48 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 48;
    return {
      cx: (80 + 74 * Math.cos(angle)).toFixed(2),
      cy: (80 + 74 * Math.sin(angle)).toFixed(2),
    };
  });

  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible", mixBlendMode: "multiply" }}
    >
      <defs>
        {/* Top Arc for curved text */}
        <path id="sealTopArcBlue" d="M 23,80 A 57,57 0 0,1 137,80" fill="none" />
        {/* Bottom Arc for curved text */}
        <path id="sealBottomArcBlue" d="M 137,80 A 57,57 0 0,1 23,80" fill="none" />
      </defs>

      {/* 1. Outer Beaded Rim (48 security dots) */}
      <g fill={color} opacity="0.9">
        {beads.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r="1.3" />
        ))}
      </g>

      {/* 2. Outer Solid Ring */}
      <circle cx="80" cy="80" r="70" stroke={color} strokeWidth="2.4" opacity="0.95" />

      {/* 3. Outer Fine Concentric Dashed Ring */}
      <circle
        cx="80"
        cy="80"
        r="66"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="3 1.8"
        opacity="0.85"
      />

      {/* 4. Inner Boundary Double Ring */}
      <circle cx="80" cy="80" r="46" stroke={color} strokeWidth="1.8" opacity="0.95" />
      <circle cx="80" cy="80" r="42.5" stroke={color} strokeWidth="0.9" opacity="0.8" />

      {/* 5. Circular Arched Typography */}
      {/* Top Arc: MAHA SEVA DAL */}
      <text
        fontSize="9.2"
        fontWeight="900"
        fontFamily="'Arial Black', Arial, 'Helvetica Neue', sans-serif"
        fill={color}
        letterSpacing="1.4"
      >
        <textPath href="#sealTopArcBlue" startOffset="50%" textAnchor="middle">
          ★ MAHA SEVA DAL ★
        </textPath>
      </text>

      {/* Bottom Arc: AUTHORISED CADRE SEAL */}
      <text
        fontSize="7.4"
        fontWeight="800"
        fontFamily="Arial, 'Helvetica Neue', sans-serif"
        fill={color}
        letterSpacing="1.1"
      >
        <textPath href="#sealBottomArcBlue" startOffset="50%" textAnchor="middle">
          ★ AUTHORISED CADRE SEAL ★
        </textPath>
      </text>

      {/* 6. Center Emblem & Engraved Authorised Banner */}
      <g textAnchor="middle">
        {/* Triple Stars above banner */}
        <text x="80" y="58" fontSize="8" fontWeight="bold" fill="#1e3a8a">
          ★  ★  ★
        </text>

        {/* Double engraved parallel rules enclosing AUTHORISED */}
        <line x1="47" y1="64" x2="113" y2="64" stroke={color} strokeWidth="1.4" />
        <line x1="47" y1="66.5" x2="113" y2="66.5" stroke={color} strokeWidth="0.7" />

        <text
          x="80"
          y="77.5"
          fontSize="10.8"
          fontWeight="900"
          fontFamily="'Arial Black', Arial, 'Helvetica Neue', sans-serif"
          letterSpacing="1.2"
          fill="#1e3a8a"
        >
          AUTHORISED
        </text>

        <line x1="47" y1="81.5" x2="113" y2="81.5" stroke={color} strokeWidth="0.7" />
        <line x1="47" y1="84" x2="113" y2="84" stroke={color} strokeWidth="1.4" />

        {/* Subtitle badge */}
        <text
          x="80"
          y="94"
          fontSize="7.5"
          fontWeight="800"
          fontFamily="sans-serif"
          letterSpacing="0.8"
          fill={color}
        >
          ★ VERIFIED ★
        </text>

        {/* Established Year */}
        <text
          x="80"
          y="104"
          fontSize="6.8"
          fontWeight="700"
          fontFamily="'Courier New', monospace"
          letterSpacing="0.6"
          fill="#1e3a8a"
        >
          ESTD. 1947
        </text>
      </g>
    </svg>
  );
};

/**
 * Official Cursive Signature SVG
 */
export const OfficialSignatureSvg: React.FC<{ className?: string; color?: string }> = ({
  className = "h-10 w-28",
  color = "#1e3a8a",
}) => (
  <svg
    viewBox="0 0 200 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ overflow: "visible" }}
  >
    {/* First initial loop */}
    <path
      d="M18 45 C15 32, 22 15, 28 8 C30 6, 32 9, 29 18 C25 29, 20 48, 19 56"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Uppercase flourish */}
    <path
      d="M20 22 C32 16, 42 12, 45 20 C47 25, 41 30, 31 33 C42 36, 52 48, 56 55"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Connecting cursive body */}
    <path
      d="M54 36 C58 32, 63 30, 67 34 C70 38, 73 35, 78 30 C82 26, 85 33, 89 31 C94 28, 98 34, 103 29 C108 24, 112 30, 116 28 C121 26, 126 31, 131 27 C138 21, 145 28, 150 25 C156 22, 162 26, 168 22"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Upper ascender flourish */}
    <path
      d="M102 30 C104 18, 107 10, 110 12 C113 14, 111 25, 109 35"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Sweeping underline flourish that touches baseline */}
    <path
      d="M25 58 C65 52, 125 50, 185 46 C192 45, 188 52, 172 55 C145 60, 95 62, 55 60"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Official 1D Barcode SVG Component for Card Back Side
 */
export const BarcodeSvg: React.FC<{ code: string; className?: string }> = ({
  code,
  className = "h-6 w-36",
}) => {
  const bars = React.useMemo(() => {
    const pattern: number[] = [2, 1, 1, 2]; // start guard
    const clean = (code || "MSD-IND-2026-0001").replace(/[^a-zA-Z0-9]/g, "");
    for (let i = 0; i < clean.length; i++) {
      const c = clean.charCodeAt(i);
      pattern.push(
        (c % 3) + 1,
        ((c >> 1) % 2) + 1,
        ((c >> 2) % 3) + 1,
        1
      );
    }
    pattern.push(2, 1, 2, 2); // stop guard
    return pattern;
  }, [code]);

  let currentX = 0;
  const elements = bars.map((w, idx) => {
    const x = currentX;
    currentX += w;
    if (idx % 2 === 0) {
      return (
        <rect
          key={idx}
          x={x}
          y="0"
          width={w}
          height="28"
          fill="#111827"
          shapeRendering="crispEdges"
        />
      );
    }
    return null;
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${currentX} 28`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block" }}
    >
      {elements}
    </svg>
  );
};

/**
 * Draws the high-resolution vector official seal on HTML5 canvas
 * Uses authentic stamp pad blue ink and true circular curved typography
 */
const drawOfficialSeal = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-0.1); // -6 degrees realistic hand-stamp tilt

  const primaryBlue = "#1d4ed8";
  const deepIndigo = "#1e3a8a";

  ctx.globalAlpha = 0.94;

  // 1. Outer Beaded Rim (48 perimeter dots)
  ctx.fillStyle = primaryBlue;
  for (let i = 0; i < 48; i++) {
    const ang = (i * 2 * Math.PI) / 48;
    const bx = 74 * Math.cos(ang);
    const by = 74 * Math.sin(ang);
    ctx.beginPath();
    ctx.arc(bx, by, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Outer Solid Circle
  ctx.strokeStyle = primaryBlue;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Outer Fine Concentric Dashed Ring
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 2.5]);
  ctx.beginPath();
  ctx.arc(0, 0, 66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Inner Boundary Double Ring
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(0, 0, 42.5, 0, Math.PI * 2);
  ctx.stroke();

  // 5. TRUE CURVED TEXT ON TOP ARC: "★ MAHA SEVA DAL ★"
  ctx.fillStyle = primaryBlue;
  ctx.font = "900 12px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const topText = "★ MAHA SEVA DAL ★";
  const topRadius = 56;
  const topSpan = 1.85; // radians span (~106°)
  const topChars = topText.length;
  for (let i = 0; i < topChars; i++) {
    const char = topText[i];
    const charAngle = -Math.PI / 2 - topSpan / 2 + (i / (topChars - 1)) * topSpan;
    const cx = topRadius * Math.cos(charAngle);
    const cy = topRadius * Math.sin(charAngle);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(charAngle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  // 6. TRUE CURVED TEXT ON BOTTOM ARC: "★ AUTHORISED CADRE SEAL ★"
  ctx.fillStyle = primaryBlue;
  ctx.font = "bold 9.5px Arial, sans-serif";
  const btmText = "★ AUTHORISED CADRE SEAL ★";
  const btmRadius = 56;
  const btmSpan = 2.15; // radians span (~123°)
  const btmChars = btmText.length;
  for (let i = 0; i < btmChars; i++) {
    const char = btmText[i];
    const charAngle = Math.PI / 2 + btmSpan / 2 - (i / (btmChars - 1)) * btmSpan;
    const cx = btmRadius * Math.cos(charAngle);
    const cy = btmRadius * Math.sin(charAngle);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(charAngle - Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  // 7. CENTER EMBLEM & BANNER
  ctx.fillStyle = deepIndigo;
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("★   ★   ★", 0, -21);

  // Double horizontal engraved rules
  ctx.strokeStyle = primaryBlue;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-33, -12);
  ctx.lineTo(33, -12);
  ctx.moveTo(-33, 10.5);
  ctx.lineTo(33, 10.5);
  ctx.stroke();

  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-33, -9.5);
  ctx.lineTo(33, -9.5);
  ctx.moveTo(-33, 8);
  ctx.lineTo(33, 8);
  ctx.stroke();

  // Bold AUTHORISED
  ctx.fillStyle = deepIndigo;
  ctx.font = "900 12.5px 'Arial Black', Arial, sans-serif";
  ctx.fillText("AUTHORISED", 0, -0.5);

  // Subtitle
  ctx.fillStyle = primaryBlue;
  ctx.font = "bold 9.5px sans-serif";
  ctx.fillText("★ VERIFIED ★", 0, 20);

  // ESTD. 1947
  ctx.fillStyle = deepIndigo;
  ctx.font = "bold 8.5px monospace";
  ctx.fillText("ESTD. 1947", 0, 31);

  ctx.restore();
};

/**
 * Draws the cursive vector signature directly on HTML5 canvas
 */
const drawVectorSignature = (ctx: CanvasRenderingContext2D, startX: number, startY: number, color = "#1e3a8a") => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Initial flourish
  ctx.beginPath();
  ctx.moveTo(startX + 18, startY + 45);
  ctx.bezierCurveTo(startX + 15, startY + 32, startX + 22, startY + 15, startX + 28, startY + 8);
  ctx.bezierCurveTo(startX + 30, startY + 6, startX + 32, startY + 9, startX + 29, startY + 18);
  ctx.bezierCurveTo(startX + 25, startY + 29, startX + 20, startY + 48, startX + 19, startY + 56);
  ctx.stroke();

  // Cross stroke / loop
  ctx.beginPath();
  ctx.moveTo(startX + 20, startY + 22);
  ctx.bezierCurveTo(startX + 32, startY + 16, startX + 42, startY + 12, startX + 45, startY + 20);
  ctx.bezierCurveTo(startX + 47, startY + 25, startX + 41, startY + 30, startX + 31, startY + 33);
  ctx.bezierCurveTo(startX + 42, startY + 36, startX + 52, startY + 48, startX + 56, startY + 55);
  ctx.stroke();

  // Cursive word body
  ctx.beginPath();
  ctx.lineWidth = 2.8;
  ctx.moveTo(startX + 54, startY + 36);
  ctx.bezierCurveTo(startX + 58, startY + 32, startX + 63, startY + 30, startX + 67, startY + 34);
  ctx.bezierCurveTo(startX + 70, startY + 38, startX + 73, startY + 35, startX + 78, startY + 30);
  ctx.bezierCurveTo(startX + 82, startY + 26, startX + 85, startY + 33, startX + 89, startY + 31);
  ctx.bezierCurveTo(startX + 94, startY + 28, startX + 98, startY + 34, startX + 103, startY + 29);
  ctx.bezierCurveTo(startX + 108, startY + 24, startX + 112, startY + 30, startX + 116, startY + 28);
  ctx.bezierCurveTo(startX + 121, startY + 26, startX + 126, startY + 31, startX + 131, startY + 27);
  ctx.bezierCurveTo(startX + 138, startY + 21, startX + 145, startY + 28, startX + 150, startY + 25);
  ctx.bezierCurveTo(startX + 156, startY + 22, startX + 162, startY + 26, startX + 168, startY + 22);
  ctx.stroke();

  // Upper loop
  ctx.beginPath();
  ctx.moveTo(startX + 102, startY + 30);
  ctx.bezierCurveTo(startX + 104, startY + 18, startX + 107, startY + 10, startX + 110, startY + 12);
  ctx.bezierCurveTo(startX + 113, startY + 14, startX + 111, startY + 25, startX + 109, startY + 35);
  ctx.stroke();

  // Sweeping underline flourish
  ctx.beginPath();
  ctx.lineWidth = 2.4;
  ctx.moveTo(startX + 25, startY + 58);
  ctx.bezierCurveTo(startX + 65, startY + 52, startX + 125, startY + 50, startX + 185, startY + 46);
  ctx.bezierCurveTo(startX + 192, startY + 45, startX + 188, startY + 52, startX + 172, startY + 55);
  ctx.bezierCurveTo(startX + 145, startY + 60, startX + 95, startY + 62, startX + 55, startY + 60);
  ctx.stroke();

  ctx.restore();
};

/**
 * Safely resolve brand logo image and generate high-res circular DataURL
 */
const resolveBrandLogo = async (): Promise<{
  img: HTMLImageElement | null;
  circularDataUrl: string;
}> => {
  // First attempt to load local /logo.png directly
  let img = await safeLoadImage("/logo.png", 2000);

  const brandLogoUrl =
    "/logo.png";
  if (!img) {
    let proxyLogoUrl = brandLogoUrl;
    if (proxyLogoUrl.startsWith("http") && !proxyLogoUrl.includes("/api/members/proxy-photo")) {
      proxyLogoUrl = getApiUrl(
        `/api/members/proxy-photo?url=${encodeURIComponent(brandLogoUrl)}`
      );
    }
    img = await safeLoadImage(proxyLogoUrl, 2500);
    if (!img) {
      img = await safeLoadImage(brandLogoUrl, 2000);
    }
  }

  let circularDataUrl = "";
  if (img && img.width > 0) {
    try {
      const c = document.createElement("canvas");
      const s = 240;
      c.width = s;
      c.height = s;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, s, s);

        circularDataUrl = c.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("Could not create circular logo DataURL:", e);
    }
  }

  return { img, circularDataUrl };
};

/**
 * Direct HTML5 Canvas generator for 100% reliable, zero-CORS-failure ID card downloads (800x1200px)
 */
export const generateIdCardCanvas = async (
  member: DigitalIdCardProps["member"],
  qrDataUrl: string,
  settings?: CardSettings,
  hideSlotPill = true
): Promise<string> => {
  try {
    const isPending = (member.status || "").toUpperCase() === "PENDING";
    const isApproved = !isPending;

    // 1. Resolve QR code image safely
    let qrImg: HTMLImageElement | null = null;
    if (qrDataUrl) {
      qrImg = await safeLoadImage(qrDataUrl, 2000);
    }

    // 2. Resolve Member Photo safely via proxy to eliminate cross-origin taint
    let photoImg: HTMLImageElement | null = null;
    if (member.photoUrl) {
      let loadUrl = member.photoUrl;
      if (loadUrl.startsWith("http") && !loadUrl.includes("/api/members/proxy-photo")) {
        loadUrl = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(member.photoUrl)}`);
      }
      photoImg = await safeLoadImage(loadUrl, 2500);

      // If proxy failed, try direct URL
      if (!photoImg && member.photoUrl !== loadUrl) {
        photoImg = await safeLoadImage(member.photoUrl, 2000);
      }
    }

    // 3. Resolve Custom Seal Image (if configured)
    let sealImg: HTMLImageElement | null = null;
    if (settings?.customSealUrl) {
      let loadSealUrl = settings.customSealUrl;
      if (loadSealUrl.startsWith("http") && !loadSealUrl.includes("/api/members/proxy-photo")) {
        loadSealUrl = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(settings.customSealUrl)}`);
      }
      sealImg = await safeLoadImage(loadSealUrl, 2000);
      if (!sealImg && settings.customSealUrl !== loadSealUrl) {
        sealImg = await safeLoadImage(settings.customSealUrl, 2000);
      }
    }

    // 4. Resolve Custom Signature Image (defaults to /signature.png)
    let sigImg: HTMLImageElement | null = null;
    const sigUrlToLoad = settings?.customSignatureUrl || "/signature.png";
    if (sigUrlToLoad) {
      let loadSigUrl = sigUrlToLoad;
      if (loadSigUrl.startsWith("http") && !loadSigUrl.includes("/api/members/proxy-photo")) {
        loadSigUrl = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(sigUrlToLoad)}`);
      }
      sigImg = await safeLoadImage(loadSigUrl, 2000);
      if (!sigImg && sigUrlToLoad !== loadSigUrl) {
        sigImg = await safeLoadImage(sigUrlToLoad, 2000);
      }
      if (!sigImg) {
        sigImg = await safeLoadImage("/signature.png", 2000);
      }
    }

    // 5. Resolve Official Organization Logo
    const { img: logoImg } = await resolveBrandLogo();

    // Function to render card on canvas
    const drawCard = (includePhoto: boolean): string => {
      const canvas = document.createElement("canvas");
      // Standard 70 mm x 100 mm at 300 DPI = 827 x 1181 px
      canvas.width = 827;
      canvas.height = 1181;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.scale(827 / 800, 1181 / 1200);

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
      bgGrad.addColorStop(0, "#ffffff");
      bgGrad.addColorStop(0.5, "#faf7f0");
      bgGrad.addColorStop(1, "#f3ebe0");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 800, 1200);

      // Card Outer Border
      ctx.strokeStyle = "#FF6200";
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 792, 1192);

      // 2. Lanyard Slot (punch area margin preserved, pill mockup hidden for print)
      ctx.fillStyle = "#faf5ea";
      ctx.fillRect(8, 8, 784, 50);
      if (!hideSlotPill) {
        ctx.fillStyle = "#4a443c";
        ctx.beginPath();
        ctx.arc(330, 28, 10, Math.PI / 2, (Math.PI * 3) / 2);
        ctx.arc(470, 28, 10, (Math.PI * 3) / 2, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
      }

      // 3. Indian National Tricolor Ribbon
      ctx.fillStyle = "#FF6200";
      ctx.fillRect(0, 58, 800, 10);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 68, 800, 6);
      ctx.fillStyle = "#138808";
      ctx.fillRect(0, 74, 800, 10);

      // 4. Header Bar
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 84, 800, 131);

      // Subtle warm gradient behind header
      const headerGrad = ctx.createLinearGradient(0, 84, 0, 215);
      headerGrad.addColorStop(0, "#ffffff");
      headerGrad.addColorStop(1, "#faf6ef");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 84, 800, 131);

      // Header bottom border
      ctx.fillStyle = "#e8ddcb";
      ctx.fillRect(0, 214, 800, 1);

      // ─── 4A. Left Brand Logo ───
      const logoCenterX = 90;
      const logoCenterY = 149;
      const logoRadius = 45;

      if (logoImg && logoImg.width > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          logoImg,
          logoCenterX - logoRadius,
          logoCenterY - logoRadius,
          logoRadius * 2,
          logoRadius * 2
        );
        ctx.restore();
      } else {
        // High-fidelity vector fallback logo
        ctx.beginPath();
        ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#faf3ee";
        ctx.fill();
        ctx.strokeStyle = "#FF6200";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = "#FF6200";
        ctx.font = "bold 20px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("MSD", logoCenterX, logoCenterY + 7);
      }

      // ─── 4B. Center Titles & Motto ───
      ctx.textAlign = "center";
      ctx.fillStyle = "#141413";
      ctx.font = "bold 34px Georgia, serif";
      ctx.fillText("MAHA SEVA DAL", 400, 135);

      ctx.fillStyle = "#FF6200";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("ESTD. 1947 · UNITY OF PEOPLE", 400, 165);

      ctx.fillStyle = "#736b5e";
      ctx.font = "13px sans-serif";
      ctx.fillText("National Socio-Cultural Cadre Registry", 400, 191);

      // ─── 4C. Right Official 1947 Emblem Badge ───
      const emblemCenterX = 710;
      const emblemCenterY = 149;
      const emblemRadius = 42;

      // Outer circle
      ctx.beginPath();
      ctx.arc(emblemCenterX, emblemCenterY, emblemRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#faf5ea";
      ctx.fill();
      ctx.strokeStyle = "#e8d2be";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner saffron ring
      ctx.beginPath();
      ctx.arc(emblemCenterX, emblemCenterY, emblemRadius - 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#FF6200";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Badge texts
      ctx.fillStyle = "#FF6200";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ESTD", emblemCenterX, emblemCenterY - 14);

      ctx.fillStyle = "#141413";
      ctx.font = "bold 17px Georgia, serif";
      ctx.fillText("1947", emblemCenterX, emblemCenterY + 4);

      ctx.fillStyle = "#138808";
      ctx.font = "bold 8.5px sans-serif";
      ctx.fillText("CADRE", emblemCenterX, emblemCenterY + 17);

      // ─── 4D. Title Banner ───
      ctx.fillStyle = "#FF6200";
      ctx.fillRect(60, 222, 680, 36);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("OFFICIAL NATIONAL CADRE IDENTITY CARD", 400, 246);

      // Photo Frame
      ctx.fillStyle = "#f5efe6";
      ctx.strokeStyle = "#FF6200";
      ctx.lineWidth = 4;
      ctx.strokeRect(50, 275, 220, 260);
      ctx.fillRect(52, 277, 216, 256);

      if (includePhoto && photoImg && photoImg.width > 0) {
        // Center-crop (object-fit: cover) so square photos never stretch or distort
        const frameW = 216;
        const frameH = 256;
        const imgRatio = photoImg.width / photoImg.height;
        const frameRatio = frameW / frameH;
        let sx = 0;
        let sy = 0;
        let sw = photoImg.width;
        let sh = photoImg.height;

        if (imgRatio > frameRatio) {
          sw = photoImg.height * frameRatio;
          sx = (photoImg.width - sw) / 2;
        } else {
          sh = photoImg.width / frameRatio;
          sy = (photoImg.height - sh) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(52, 277, frameW, frameH);
        ctx.clip();
        ctx.drawImage(photoImg, sx, sy, sw, sh, 52, 277, frameW, frameH);
        ctx.restore();
      } else {
        // Placeholder Avatar
        ctx.fillStyle = "#faede3";
        ctx.fillRect(52, 277, 216, 256);
        ctx.fillStyle = "#FF6200";
        ctx.font = "bold 96px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText((member.fullName || "M").charAt(0).toUpperCase(), 160, 420);
        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#8a7e70";
        ctx.fillText("CADRE MEMBER", 160, 470);
      }

      // Details Block
      ctx.textAlign = "left";

      // Full Name
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("CADRE FULL NAME", 300, 305);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 30px Georgia, serif";
      ctx.fillText(member.fullName, 300, 340);

      // Registration ID
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("REGISTRATION ID", 300, 385);
      ctx.fillStyle = "#faede3";
      ctx.fillRect(300, 395, 380, 40);
      ctx.strokeStyle = "#e8d2be";
      ctx.lineWidth = 2;
      ctx.strokeRect(300, 395, 380, 40);
      ctx.fillStyle = "#D65000";
      ctx.font = "bold 22px monospace";
      ctx.fillText(member.registrationId, 315, 423);

      // Assigned Wing (Badge with Peach Background, subtle border, Black text font matching Screenshot 1)
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("ASSIGNED WING", 300, 475);

      ctx.font = "bold 20px sans-serif";
      const wingMetrics = ctx.measureText(member.wing);
      const wingBadgeW = Math.min(wingMetrics.width + 24, 450);
      const wingBadgeH = 36;
      const wingBadgeX = 300;
      const wingBadgeY = 486;

      ctx.beginPath();
      ctx.roundRect(wingBadgeX, wingBadgeY, wingBadgeW, wingBadgeH, 6);
      ctx.fillStyle = "#fff7ed";
      ctx.fill();
      ctx.strokeStyle = "#fed7aa";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#1b1b1b";
      ctx.fillText(member.wing, wingBadgeX + 12, wingBadgeY + 25);

      // Jurisdiction Box (Expanded to 195px to accommodate Assembly & Zone)
      ctx.fillStyle = "#faf5ea";
      ctx.fillRect(50, 538, 700, 195);
      ctx.strokeStyle = "#e3d7c5";
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 538, 700, 195);

      // Row 1: State & District Unit
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("STATE UNIT", 75, 564);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(member.state, 75, 588);

      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("DISTRICT UNIT", 420, 564);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(member.district, 420, 588);

      // Row 2: Assembly Constituency & Zone / Region
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("ASSEMBLY CONSTITUENCY", 75, 622);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(member.assembly || "—", 75, 646);

      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("ZONE / REGION", 420, 622);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(member.zone || "—", 420, 646);

      // Row 3: Contact Mobile & Blood Group
      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("CONTACT MOBILE", 75, 680);
      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 17px monospace";
      ctx.fillText(format10DigitMobile(member.mobile), 75, 704);

      ctx.fillStyle = "#38332c";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("BLOOD GROUP", 420, 680);
      const validBg = getValidBloodGroup(member.bloodGroup);
      if (validBg) {
        ctx.fillStyle = "#be123c";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(validBg, 420, 704);
      } else {
        ctx.fillStyle = "#1b1b1b";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("—", 420, 704);
      }

      // Security QR Code
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(50, 750, 210, 210);
      ctx.strokeStyle = "#e3d7c5";
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 750, 210, 210);

      if (qrImg && qrImg.width > 0) {
        ctx.drawImage(qrImg, 60, 760, 190, 190);
      } else {
        ctx.fillStyle = "#8a7e70";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("QR VERIFIED", 155, 855);
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "#FF6200";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("SCAN TO VERIFY", 285, 820);
      ctx.fillStyle = "#736b5e";
      ctx.font = "15px sans-serif";
      ctx.fillText("Official Cadre Registry", 285, 848);
      ctx.font = "14px monospace";
      ctx.fillText("mahasevadal.com", 285, 873);

      // ─── SEAL & SIGNATURE SECTION ─────────────────────────────
      // Always draw Official Seal Stamp & Authorized Signature
      if (sealImg && sealImg.width > 0) {
        ctx.save();
        ctx.translate(635, 850);
        ctx.rotate(-0.08);
        ctx.drawImage(sealImg, -70, -70, 140, 140);
        ctx.restore();
      } else {
        drawOfficialSeal(ctx, 635, 850);
      }

      // 2. Official Authorized Signature (positioned naturally above the line)
      if (sigImg && sigImg.width > 0) {
        ctx.drawImage(sigImg, 510, 915, 180, 68);
      } else {
        drawVectorSignature(ctx, 490, 915, "#1e3a8a");
      }

      // 3. Signatory Line
      ctx.strokeStyle = "#1b1b1b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(470, 985);
      ctx.lineTo(750, 985);
      ctx.stroke();

      ctx.fillStyle = "#1b1b1b";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(settings?.signatoryName || "Authorized Signatory", 610, 1010);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#736b5e";
      ctx.fillText(settings?.signatoryTitle || "Central Executive Committee", 610, 1030);

      // Bottom Strip (Only Saffron Text)
      ctx.fillStyle = "#2c2824";
      ctx.fillRect(0, 1140, 800, 60);

      ctx.fillStyle = "#FF9933";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("UNITY OF PEOPLE", 400, 1175);

      return setPng300Dpi(canvas.toDataURL("image/png"), 300);
    };

    // First attempt: draw with photo (clean via proxy)
    try {
      const dataUrl = drawCard(true);
      if (dataUrl && dataUrl.length > 500) {
        return dataUrl;
      }
    } catch (taintErr) {
      console.warn("Canvas tainted by photo, falling back to clean avatar card:", taintErr);
    }

    // Guaranteed fallback: draw with avatar (never tainted)
    return drawCard(false);
  } catch (err) {
    console.error("generateIdCardCanvas error:", err);
    return "";
  }
};

/**
 * Clean & Simple PDF generator:
 * - Single-page dual-sided layout (Front & Back side-by-side like PNG format)
 * - Standard 70 mm × 100 mm physical dimensions, clean with zero crop marks or extra text
 * - Simple, uncluttered presentation without extra paragraphs
 */
export const generateIdCardPdf = async (
  member: DigitalIdCardProps["member"],
  qrDataUrl: string,
  settings?: CardSettings,
  capturedFrontUrl?: string,
  capturedBackUrl?: string,
  _mode: "both" | "front" | "back" = "both"
): Promise<void> => {
  // [CHANGE 6: 2-PAGE 70x100mm FULL BLEED PDF]
  let frontDataUrl = capturedFrontUrl || "";
  let backDataUrl = capturedBackUrl || "";

  if (!frontDataUrl) {
    try {
      frontDataUrl = await renderCleanCardOffscreen("msd-pvc-card-front", "print");
    } catch {
      frontDataUrl = await generateIdCardCanvas(member, qrDataUrl, settings);
    }
  }

  if (!backDataUrl) {
    try {
      backDataUrl = await renderCleanCardOffscreen("msd-pvc-card-back", "print");
    } catch {
      backDataUrl = await generateIdCardBackCanvas(member);
    }
  }

  if (!frontDataUrl || !backDataUrl) {
    throw new Error("Could not render card graphics for PDF.");
  }

  const cardW = 70;
  const cardH = 100;

  // Standard A4 PDF (210 x 297 mm) with Front and Back side-by-side like PNG
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Standard 70 mm x 100 mm cards placed side-by-side, centered on the A4 page
  const gap = 14;
  const totalW = cardW * 2 + gap; // 154 mm
  const startX = (pageWidth - totalW) / 2; // 28 mm
  const frontCardX = startX;
  const backCardX = startX + cardW + gap;
  const cardY = (pageHeight - cardH) / 2; // centered vertically (98.5 mm)

  // Draw Front Card on left
  doc.addImage(frontDataUrl, "PNG", frontCardX, cardY, cardW, cardH, undefined, "FAST");

  // Draw Back Card on right
  doc.addImage(backDataUrl, "PNG", backCardX, cardY, cardW, cardH, undefined, "FAST");

  // File name: MSD-IND-2026-0001.pdf dynamically
  const cleanRegId = (member.registrationId || "member").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${cleanRegId}.pdf`);
};

/**
 * Helper to safely format gender to Male / Female / Other
 */
/**
 * Helper to format Date of Birth to standard DD/MM/YYYY format
 */
export const formatDobDDMMYYYY = (dobString?: string): string => {
  if (!dobString) return "";
  const str = String(dobString).trim();
  if (!str) return "";
  const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, "0");
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const y = String(parsed.getFullYear());
    return `${d}/${m}/${y}`;
  }
  return str;
};

export const calcMemberAge = (dobString?: string): number | undefined => {
  if (!dobString) return undefined;
  const str = String(dobString).trim();
  if (!str) return undefined;
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  let parsed: Date;
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    parsed = new Date(Number(y), Number(m) - 1, Number(d));
  } else {
    parsed = new Date(str);
  }
  if (isNaN(parsed.getTime())) return undefined;
  const now = new Date();
  let years = now.getFullYear() - parsed.getFullYear();
  const m = now.getMonth() - parsed.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < parsed.getDate())) {
    years--;
  }
  return years >= 0 && years <= 125 ? years : undefined;
};

/**
 * Helper to format contact number to 10 digits alone (stripping +91 / country code prefix)
 */
export const format10DigitMobile = (mobile?: string): string => {
  if (!mobile) return "—";
  const digits = String(mobile).replace(/\D/g, "");
  if (!digits) return String(mobile).trim() || "—";
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

const getDisplayGender = (gender?: string): string => {
  if (!gender || typeof gender !== "string" || !gender.trim()) return "Male";
  const lower = gender.trim().toLowerCase();
  if (lower === "male" || lower === "m") return "Male";
  if (lower === "female" || lower === "f") return "Female";
  if (lower === "other" || lower === "o") return "Other";
  return gender.trim().charAt(0).toUpperCase() + gender.trim().slice(1);
};

/**
 * Direct HTML5 Canvas generator for Back Side of ID Card (800x1200px)
 */
export const generateIdCardBackCanvas = async (
  member: DigitalIdCardProps["member"],
  hideSlotPill = true
): Promise<string> => {
  try {
    const canvas = document.createElement("canvas");
    // Standard 70 mm x 100 mm at 300 DPI = 827 x 1181 px
    canvas.width = 827;
    canvas.height = 1181;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.scale(827 / 800, 1181 / 1200);

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGrad.addColorStop(0, "#ffffff");
    bgGrad.addColorStop(0.5, "#faf7f0");
    bgGrad.addColorStop(1, "#f3ebe0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1200);

    // Outer Border
    ctx.strokeStyle = "#FF6200";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 792, 1192);

    // 2. Lanyard Slot (punch area margin preserved, pill mockup hidden for print)
    ctx.fillStyle = "#faf5ea";
    ctx.fillRect(8, 8, 784, 50);
    if (!hideSlotPill) {
      ctx.fillStyle = "#4a443c";
      ctx.beginPath();
      ctx.arc(330, 28, 10, Math.PI / 2, (Math.PI * 3) / 2);
      ctx.arc(470, 28, 10, (Math.PI * 3) / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
    }

    // 3. Indian National Tricolor Ribbon
    const triGrad = ctx.createLinearGradient(8, 0, 792, 0);
    triGrad.addColorStop(0, "#FF6200");
    triGrad.addColorStop(0.48, "#ffffff");
    triGrad.addColorStop(1, "#138808");
    ctx.fillStyle = triGrad;
    ctx.fillRect(8, 58, 784, 18);

    // 4. Header Bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(8, 76, 784, 110);
    ctx.strokeStyle = "#e8ddcb";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 76, 784, 110);

    // Logo
    const { img: logoImg } = await resolveBrandLogo();
    if (logoImg) {
      const bLogoCenterX = 35 + 75 / 2;
      const bLogoCenterY = 92 + 75 / 2;
      const bLogoRadius = 75 / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bLogoCenterX, bLogoCenterY, bLogoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, 35, 92, 75, 75);
      ctx.restore();
    }

    // Header Titles
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 32px Georgia, serif";
    ctx.fillText("MAHA SEVA DAL", 130, 125);

    ctx.fillStyle = "#FF6200";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("CADRE PARTICULARS & VERIFICATION", 130, 150);

    ctx.fillStyle = "#777064";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText("National Socio-Cultural Cadre Registry · Estd. 1947", 130, 170);

    // Top right: REVERSE SIDE Pill (matches Screenshot 1)
    const pillX = 625;
    const pillY = 120;
    const pillW = 140;
    const pillH = 34;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 8);
    ctx.fillStyle = "#fff8f0";
    ctx.fill();
    ctx.strokeStyle = "#FF6200";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#FF6200";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("REVERSE SIDE", pillX + pillW / 2, pillY + 22);
    ctx.textAlign = "left";

    // 4D. Back Sub-Header Banner (Official Cadre Record & Directives)
    ctx.fillStyle = "#2c2824";
    ctx.fillRect(35, 192, 730, 34);

    ctx.fillStyle = "#FF9933";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL CADRE RECORD & DIRECTIVES", 400, 214);
    ctx.textAlign = "left";

    // 5. Section 1: Member Personal & Family Particulars (Card Box)
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(35, 238, 730, 168);
    ctx.strokeStyle = "#e6dbc8";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 238, 730, 168);

    // Father's Name
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("FATHER'S / HUSBAND'S NAME", 60, 268);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText(member.fatherName || "—", 60, 296);

    // DOB
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("DATE OF BIRTH", 430, 268);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 19px Courier, monospace";
    const formattedDob = formatDobDDMMYYYY(member.dob);
    const dobStr = formattedDob || "—";
    ctx.fillText(dobStr, 430, 296);

    // Divider line
    ctx.strokeStyle = "#e8dfcf";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 320);
    ctx.lineTo(735, 320);
    ctx.stroke();

    // Gender
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("GENDER", 60, 350);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillText(getDisplayGender(member.gender), 60, 378);

    // Emergency Contact / WhatsApp
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("EMERGENCY / WHATSAPP", 430, 350);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 18px Courier, monospace";
    const emergencyCanvasText = member.emergencyNumber
      ? `${format10DigitMobile(member.emergencyNumber)}${member.emergencyRelation ? ` (${member.emergencyRelation})` : ""}`
      : format10DigitMobile(member.whatsapp || member.mobile);
    ctx.fillText(emergencyCanvasText, 430, 378);

    // 6. Section 2: National Central Secretariat & Official Helpline Box
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(35, 418, 730, 185);
    ctx.strokeStyle = "#e6dbc8";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 418, 730, 185);

    // Title & Foundation Year
    ctx.fillStyle = "#FF6200";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.fillText("NATIONAL CENTRAL SECRETARIAT", 60, 448);
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 12px Courier, monospace";
    ctx.fillText("ESTD. 1947", 655, 448);

    // Divider line
    ctx.strokeStyle = "#ede3d3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 465);
    ctx.lineTo(735, 465);
    ctx.stroke();

    // Official Helpline
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("OFFICIAL CADRE HELPLINE", 60, 488);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 15px Courier, monospace";
    ctx.fillText("+91 9994625690", 60, 510);
    ctx.fillText("+91 9514576540", 60, 530);

    // Verification Portal
    ctx.fillStyle = "#38332c";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("OFFICIAL VERIFICATION PORTAL", 430, 492);
    ctx.fillStyle = "#FF6200";
    ctx.font = "bold 19px Courier, monospace";
    ctx.fillText("mahasevadal.com", 430, 520);

    // Bottom Head Office Note
    ctx.fillStyle = "#2d2720";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("Head Office: No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.", 60, 554);
    ctx.fillStyle = "#554e42";
    ctx.font = "11px Courier, monospace";
    ctx.fillText("Email: mahasevadalorganization@gmail.com", 60, 576);

    // 7. Section 3: Cadre Directives & Terms (3 Official Bullets)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(35, 615, 730, 315);
    ctx.strokeStyle = "#e6dbc8";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 615, 730, 315);

    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("CADRE DIRECTIVES & TERMS", 60, 652);

    ctx.fillStyle = "#4a443c";
    ctx.font = "14.5px Arial, sans-serif";
    const bullets = [
      "• This card is non-transferable property of Maha Seva Dal (Estd. 1947).",
      "• Authorized for civic welfare, social upliftment & relief operations.",
      "• If found, please return to Central Secretariat or call Helpline: 9994625690, 9514576540.",
    ];
    bullets.forEach((b, idx) => {
      ctx.fillText(b, 60, 706 + idx * 56);
    });

    // 8. Section 4: 1D Barcode & Validity Row
    ctx.fillStyle = "#faf6ee";
    ctx.fillRect(35, 955, 730, 160);
    ctx.strokeStyle = "#e6dbc8";
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 955, 730, 160);

    // Draw Barcode on left
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(60, 975, 340, 75);
    ctx.strokeStyle = "#d6caba";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, 975, 340, 75);

    ctx.fillStyle = "#111827";
    const regId = member.registrationId || "MSD-IND-2026-0001";
    let bx = 75;
    for (let i = 0; i < regId.length; i++) {
      const code = regId.charCodeAt(i);
      const w1 = (code % 3) + 1.5;
      const w2 = ((code >> 1) % 3) + 1.5;
      ctx.fillRect(bx, 985, w1, 40);
      bx += w1 + ((code >> 2) % 2 + 1.5);
      ctx.fillRect(bx, 985, w2, 40);
      bx += w2 + 2.5;
    }

    ctx.fillStyle = "#333333";
    ctx.font = "bold 13px Courier, monospace";
    ctx.fillText(regId, 130, 1042);

    // Validity & Issuance Details on right - enclosed in matching box
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(430, 975, 310, 75);
    ctx.strokeStyle = "#d6caba";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(430, 975, 310, 75);

    const rawDate = member.approvedAt || member.createdAt || new Date().toISOString();
    const issueDate = new Date(rawDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    ctx.fillStyle = "#554e44";
    ctx.font = "bold 13px Arial, sans-serif";
    ctx.fillText("DATE OF ISSUE:", 450, 1008);
    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 15px Courier, monospace";
    ctx.fillText(issueDate, 575, 1008);

    ctx.fillStyle = "#FF6200";
    ctx.font = "bold 12.5px Arial, sans-serif";
    ctx.fillText("CENTRAL EXECUTIVE COMMITTEE", 450, 1035);

    // 9. Bottom Dark Security Band (Only Saffron Text)
    ctx.fillStyle = "#2c2824";
    ctx.fillRect(8, 1140, 784, 52);

    ctx.fillStyle = "#FF9933";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DISCIPLINE · SERVICE · UNITY", 400, 1172);

    return setPng300Dpi(canvas.toDataURL("image/png"), 300);
  } catch (err) {
    console.error("Back Canvas Generation Error:", err);
    return "";
  }
};

/**
 * Direct HTML5 Canvas generator for Combined Both Sides (Front + Back) on a single high-res print sheet
 */
export const generateCombinedIdCardCanvas = async (
  member: DigitalIdCardProps["member"],
  qrDataUrl: string,
  settings?: CardSettings,
  padding = 48,
  gap = 48,
  hideSlotPill = true
): Promise<string> => {
  try {
    const [frontDataUrl, backDataUrl] = await Promise.all([
      generateIdCardCanvas(member, qrDataUrl, settings, hideSlotPill),
      generateIdCardBackCanvas(member, hideSlotPill),
    ]);

    if (!frontDataUrl || !backDataUrl) {
      throw new Error("Failed to render front or back card canvas");
    }

    const [frontImg, backImg] = await Promise.all([
      safeLoadImage(frontDataUrl),
      safeLoadImage(backDataUrl),
    ]);

    if (!frontImg || !backImg) {
      throw new Error("Failed to load front or back card image");
    }

    const width = frontImg.width + backImg.width + gap + padding * 2;
    const height = Math.max(frontImg.height, backImg.height) + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Clean white background with space around the cards - absolutely NO cutting marks, NO scissors, NO badges, NO extra text
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw Front Card on the left and Back Card on the right with space around
    ctx.drawImage(frontImg, padding, padding);
    ctx.drawImage(backImg, padding + frontImg.width + gap, padding);

    return setPng300Dpi(canvas.toDataURL("image/png"), 300);
  } catch (err) {
    console.error("Combined Canvas Generation Error:", err);
    return "";
  }
};

/**
 * Embed 300 DPI resolution metadata into a PNG base64 data URL.
 * Injects the standard PNG physical pixel dimensions (pHYs) chunk (11,811 pixels/meter = 300 DPI).
 * Enables professional print shops, Photoshop, and PVC card printers to recognize exact 300 DPI resolution.
 */
export const setPng300Dpi = (dataUrl: string, dpi = 300): string => {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:image/png")) return dataUrl;

    const base64Index = dataUrl.indexOf(",");
    if (base64Index === -1) return dataUrl;

    const base64 = dataUrl.slice(base64Index + 1);
    const binaryString = atob(base64);
    const len = binaryString.length;
    if (len < 33) return dataUrl;

    // Verify PNG signature: 0x89, 0x50, 0x4E, 0x47
    if (
      binaryString.charCodeAt(0) !== 0x89 ||
      binaryString.charCodeAt(1) !== 0x50 ||
      binaryString.charCodeAt(2) !== 0x4e ||
      binaryString.charCodeAt(3) !== 0x47
    ) {
      return dataUrl;
    }

    // Calculate pixels per meter for the requested DPI: DPI / 0.0254
    const pxPerMeter = Math.round(dpi / 0.0254); // 11811 for 300 DPI

    const p1 = (pxPerMeter >>> 24) & 0xff;
    const p2 = (pxPerMeter >>> 16) & 0xff;
    const p3 = (pxPerMeter >>> 8) & 0xff;
    const p4 = pxPerMeter & 0xff;

    // CRC-32 table for PNG chunk verification
    const crcTable: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }

    const calcCrc32 = (chunkTypeAndData: number[]): number => {
      let crc = 0xffffffff;
      for (let i = 0; i < chunkTypeAndData.length; i++) {
        crc = crcTable[(crc ^ chunkTypeAndData[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    };

    const typeAndData = [
      0x70, 0x48, 0x59, 0x73, // 'p', 'H', 'Y', 's'
      p1, p2, p3, p4,         // X pixels per unit
      p1, p2, p3, p4,         // Y pixels per unit
      0x01,                   // Unit specifier: 1 = meter
    ];

    const crcVal = calcCrc32(typeAndData);
    const crcBytes = [
      (crcVal >>> 24) & 0xff,
      (crcVal >>> 16) & 0xff,
      (crcVal >>> 8) & 0xff,
      crcVal & 0xff,
    ];

    // 4 bytes length (9) + 4 bytes type ('pHYs') + 9 bytes data + 4 bytes CRC = 21 bytes
    const physChunk = new Uint8Array([
      0x00, 0x00, 0x00, 0x09,
      ...typeAndData,
      ...crcBytes,
    ]);

    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check if pHYs chunk already exists
    let existingPhysIndex = -1;
    for (let i = 8; i < len - 12; i++) {
      if (
        bytes[i] === 0x70 &&
        bytes[i + 1] === 0x48 &&
        bytes[i + 2] === 0x59 &&
        bytes[i + 3] === 0x73
      ) {
        existingPhysIndex = i - 4; // Start of length
        break;
      }
    }

    let finalBytes: Uint8Array;
    if (existingPhysIndex !== -1) {
      finalBytes = new Uint8Array(len);
      finalBytes.set(bytes.subarray(0, existingPhysIndex), 0);
      finalBytes.set(physChunk, existingPhysIndex);
      finalBytes.set(bytes.subarray(existingPhysIndex + 21), existingPhysIndex + 21);
    } else {
      // Standard IHDR chunk ends at byte 33 (8 bytes signature + 4 length + 4 type + 13 data + 4 CRC)
      finalBytes = new Uint8Array(len + 21);
      finalBytes.set(bytes.subarray(0, 33), 0);
      finalBytes.set(physChunk, 33);
      finalBytes.set(bytes.subarray(33), 54);
    }

    // Convert back to base64 in safe chunks
    let binary = "";
    const chunkSize = 16384;
    for (let i = 0; i < finalBytes.length; i += chunkSize) {
      const chunk = finalBytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    return `data:image/png;base64,${btoa(binary)}`;
  } catch (err) {
    console.warn("Could not embed 300 DPI PNG metadata:", err);
    return dataUrl;
  }
};

/**
 * Capture an on-screen DOM card element exactly as displayed using html-to-image
 * Outputs a crisp 300+ DPI data URL (pixelRatio: 3) with official 300 DPI metadata
 */
/**
 * [CHANGE 1: TIGHT CROP & OFF-SCREEN RENDER]
 * Renders an exact 70 x 100 mm (aspect 7:10) clean off-screen clone of the card element.
 * - Cropped exactly to the card edge with NO outer padding, NO white margins, and NO drop shadow.
 * - Rendered at scale 3 (315x450px * 3 = 945x1350px, well above 827x1181px at 300 DPI).
 * - PRINT mode: square corners (borderRadius: 0), fills edge-to-edge, solid #ffffff background, slot pill removed.
 * - SHARE mode: rounded corners (16px), transparent background outside corners, slot pill removed for clean look.
 */
export const renderCleanCardOffscreen = async (
  elementId: string,
  mode: "print" | "share" = "share"
): Promise<string> => {
  const original = document.getElementById(elementId);
  if (!original) {
    throw new Error(`Element #${elementId} not found in DOM`);
  }

  // Pre-wait for fonts to be ready
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Fonts ready check failed:", e);
    }
  }

  // Wait a tick for paint to settle
  await new Promise((resolve) => setTimeout(resolve, 35));

  // In all download formats, keep the exact same sleek rounded corners, border, and tight crop
  original.classList.add("card-export-active", "card-export-share");

  try {
    // Primary: capture directly from live DOM using html-to-image (toPng)
    // toPng uses native SVG <foreignObject> rasterization,
    // which guarantees pixel-perfect typography, sharp letter kerning, accurate flex alignment,
    // and crisp vector barcode lines at 3x resolution without squishing!
    let dataUrl = "";
    try {
      dataUrl = await toPng(original, {
        pixelRatio: 3, // 315 * 3 = 945px, 450 * 3 = 1350px (exceeds 827x1181px at 300 DPI)
        quality: 1.0,
        cacheBust: false,
        style: {
          transform: "none",
          transition: "none",
          margin: "0",
        },
      });
    } catch (toPngErr) {
      console.warn("Live DOM toPng error, falling back to off-screen capture:", toPngErr);
    }

    if (!dataUrl || dataUrl.length < 100) {
      // Fallback: clone node and capture in an invisible in-document container
      const clone = original.cloneNode(true) as HTMLElement;
      clone.id = `${elementId}-export-clone`;
      clone.style.width = "315px";
      clone.style.height = "450px";
      clone.style.minWidth = "315px";
      clone.style.maxWidth = "315px";
      clone.style.minHeight = "450px";
      clone.style.maxHeight = "450px";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.filter = "none";
      clone.style.transform = "none";
      clone.style.borderRadius = "16px";

      const pill = clone.querySelector('[data-slot-pill="true"], [data-slot="lanyard"] > div, .card-lanyard-slot > div');
      if (pill) {
        (pill as HTMLElement).style.visibility = "hidden";
        (pill as HTMLElement).style.opacity = "0";
      }

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-9999";
      container.style.width = "315px";
      container.style.height = "450px";
      container.style.backgroundColor = "transparent";
      container.appendChild(clone);
      document.body.appendChild(container);

      try {
        dataUrl = await toPng(clone, {
          pixelRatio: 3,
          quality: 1.0,
          cacheBust: false,
        });
      } finally {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    }

    if (!dataUrl) {
      throw new Error(`Failed to render clean card #${elementId}`);
    }

    // Ensure exact 827 x 1181 px at 300 DPI (70 mm x 100 mm commercial PVC standard)
    try {
      const img = await safeLoadImage(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 827;
      canvas.height = 1181;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, 827, 1181);
        dataUrl = canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("Could not scale to exact 827x1181:", e);
    }

    // Embed 300 DPI metadata
    return setPng300Dpi(dataUrl, 300);
  } finally {
    original.classList.remove("card-export-active", "card-export-print", "card-export-share");
  }
};

/**
 * Backward-compatible wrapper for captureCardElement
 */
export const captureCardElement = async (
  elementId: string,
  mode: "print" | "share" = "print"
): Promise<string> => {
  return renderCleanCardOffscreen(elementId, mode);
};

/**
 * Backward-compatible helper for addPaddingToCardDataUrl
 */
export const addPaddingToCardDataUrl = async (
  cardDataUrl: string,
  padding = 0
): Promise<string> => {
  if (!cardDataUrl || padding <= 0) return cardDataUrl;
  const img = await safeLoadImage(cardDataUrl);
  if (!img) return cardDataUrl;

  const canvas = document.createElement("canvas");
  const width = img.width + padding * 2;
  const height = img.height + padding * 2;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return cardDataUrl;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, padding, padding);

  return setPng300Dpi(canvas.toDataURL("image/png"), 300);
};

/**
 * [CHANGE 5: BOTH SIDES COMBINED PNG]
 * Combines Front and Back captured cards side-by-side with a clean gap for sharing.
 */
export const combineCapturedCards = async (
  frontDataUrl: string,
  backDataUrl: string,
  padding = 32,
  gap = 24,
  mode: "print" | "share" = "share"
): Promise<string> => {
  const [frontImg, backImg] = await Promise.all([
    safeLoadImage(frontDataUrl),
    safeLoadImage(backDataUrl),
  ]);

  if (!frontImg || !backImg) {
    throw new Error("Could not load captured card images for combination");
  }

  const canvas = document.createElement("canvas");
  const width = frontImg.width + backImg.width + gap + padding * 2;
  const height = Math.max(frontImg.height, backImg.height) + padding * 2;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (mode === "print") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else {
    // Transparent background for share mode
    ctx.clearRect(0, 0, width, height);
  }

  ctx.drawImage(frontImg, padding, padding);
  ctx.drawImage(backImg, padding + frontImg.width + gap, padding);

  return setPng300Dpi(canvas.toDataURL("image/png"), 300);
};

/**
 * Helper to trigger browser download via Blob URL
 */
export const triggerDownload = (dataUrl: string, filename: string): void => {
  let downloadUrl = dataUrl;
  let blobUrl = "";
  if (dataUrl.startsWith("data:")) {
    try {
      const parts = dataUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      blobUrl = URL.createObjectURL(blob);
      downloadUrl = blobUrl;
    } catch (e) {
      console.warn("Blob conversion fallback:", e);
      downloadUrl = dataUrl;
    }
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (blobUrl) {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  }
};

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  member,
  qrDataUrl,
  customSealUrl,
  customSignatureUrl,
  signatoryName,
  signatoryTitle,
  hideActionButtons = false,
  stacked = false,
  defaultView = "both",
  showViewToggle = false,
  compact = false,
}) => {
  const [activeView, setActiveView] = useState<"both" | "front" | "back">(defaultView);
  const [downloadingMode, setDownloadingMode] = useState<
    "pdf" | "both" | "front_print" | "back_print" | "front_share" | "back_share" | null
  >(null);

  // Local card settings state, initialized from props or localStorage
  const [cardSettings, setCardSettings] = useState<CardSettings>({
    customSealUrl: customSealUrl || localStorage.getItem("msd_seal_image_url") || "",
    customSignatureUrl: customSignatureUrl || localStorage.getItem("msd_signature_image_url") || "",
    signatoryName: signatoryName || localStorage.getItem("msd_signatory_name") || "Authorized Signatory",
    signatoryTitle: signatoryTitle || localStorage.getItem("msd_signatory_title") || "Central Executive Committee",
  });

  // Preload and convert member photo to base64 Data URL or proxy URL to eliminate CORS blocks in preview & export
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!member.photoUrl) {
      setPhotoDataUrl(null);
      return;
    }

    if (member.photoUrl.startsWith("data:image")) {
      setPhotoDataUrl(member.photoUrl);
      return;
    }

    const loadPhoto = async () => {
      try {
        const proxyUrl = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(member.photoUrl!)}`);
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (active && reader.result) {
              setPhotoDataUrl(reader.result as string);
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      } catch (e) {
        // Fallback to direct URL
      }
    };

    loadPhoto();
    return () => {
      active = false;
    };
  }, [member.photoUrl]);

  // Fetch settings from API on mount
  useEffect(() => {
    fetch(getApiUrl("/api/members/card-settings"))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.settings) {
          setCardSettings((prev) => ({
            customSealUrl: customSealUrl || data.settings.customSealUrl || prev.customSealUrl,
            customSignatureUrl: customSignatureUrl || data.settings.customSignatureUrl || prev.customSignatureUrl,
            signatoryName: signatoryName || data.settings.signatoryName || prev.signatoryName,
            signatoryTitle: signatoryTitle || data.settings.signatoryTitle || prev.signatoryTitle,
          }));
        }
      })
      .catch(() => {});
  }, [customSealUrl, customSignatureUrl, signatoryName, signatoryTitle]);

  const isPending = (member.status || "").toUpperCase() === "PENDING";
  const isApproved = !isPending;

  const rawDate = member.approvedAt || member.createdAt || new Date().toISOString();
  const issueDate = new Date(rawDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const ensureCardsRendered = async (): Promise<() => void> => {
    if (activeView === "both") return () => {};
    const prev = activeView;
    setActiveView("both");
    await new Promise((resolve) => setTimeout(resolve, 80));
    return () => setActiveView(prev);
  };

  /**
   * [CHANGE 7: ENHANCED PNG & PDF DOWNLOAD HANDLERS]
   * File names:
   * - Front Side (PNG): ${regId}_Front.png
   * - Back Side (PNG): ${regId}_Back.png
   * - Both Sides (PNG): ${regId}_Both.png
   * - PDF: ${regId}.pdf
   * - Optional Share: ${regId}_Front_Share.png, ${regId}_Back_Share.png
   */
  const handleDownloadImage = async (
    target: "both" | "front" | "back",
    exportMode: "print" | "share" = "print"
  ) => {
    const modeKey =
      target === "both"
        ? "both"
        : target === "front"
        ? exportMode === "print" ? "front_print" : "front_share"
        : exportMode === "print" ? "back_print" : "back_share";

    setDownloadingMode(modeKey);
    let cleanup = () => {};
    try {
      if (activeView !== "both") {
        cleanup = await ensureCardsRendered();
      }

      const cleanRegId = (member.registrationId || "member").replace(/[^a-zA-Z0-9_-]/g, "_");
      let dataUrl = "";
      let filename = "";

      if (target === "front") {
        try {
          dataUrl = await renderCleanCardOffscreen("msd-pvc-card-front", "share");
        } catch (e) {
          console.warn("DOM capture fallback:", e);
          dataUrl = await generateIdCardCanvas(member, qrDataUrl, cardSettings);
        }
        filename = exportMode === "share" && modeKey === "front_share"
          ? `${cleanRegId}_Front_Share.png`
          : `${cleanRegId}_Front.png`;
      } else if (target === "back") {
        try {
          dataUrl = await renderCleanCardOffscreen("msd-pvc-card-back", "share");
        } catch (e) {
          console.warn("DOM capture fallback:", e);
          dataUrl = await generateIdCardBackCanvas(member);
        }
        filename = exportMode === "share" && modeKey === "back_share"
          ? `${cleanRegId}_Back_Share.png`
          : `${cleanRegId}_Back.png`;
      } else {
        // Both sides side-by-side (share mode)
        let frontUrl = "";
        let backUrl = "";
        try {
          [frontUrl, backUrl] = await Promise.all([
            renderCleanCardOffscreen("msd-pvc-card-front", "share"),
            renderCleanCardOffscreen("msd-pvc-card-back", "share"),
          ]);
        } catch (e) {
          console.warn("Dual DOM capture fell back to canvas:", e);
          frontUrl = await generateIdCardCanvas(member, qrDataUrl, cardSettings);
          backUrl = await generateIdCardBackCanvas(member);
        }

        dataUrl = await combineCapturedCards(frontUrl, backUrl, 32, 24, "share");
        filename = `${cleanRegId}_Both.png`;
      }

      if (!dataUrl) {
        throw new Error("Could not render card image.");
      }

      triggerDownload(dataUrl, filename);
    } catch (err: any) {
      console.error("Download error:", err);
      alert("Download error: " + (err.message || "Failed to download card"));
    } finally {
      cleanup();
      setDownloadingMode(null);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingMode("pdf");
    let cleanup = () => {};
    try {
      if (activeView !== "both") {
        cleanup = await ensureCardsRendered();
      }

      let frontUrl = "";
      let backUrl = "";
      try {
        [frontUrl, backUrl] = await Promise.all([
          renderCleanCardOffscreen("msd-pvc-card-front", "share"),
          renderCleanCardOffscreen("msd-pvc-card-back", "share"),
        ]);
      } catch (e) {
        console.warn("PDF capture fallback:", e);
      }

      await generateIdCardPdf(member, qrDataUrl, cardSettings, frontUrl, backUrl);
    } catch (err: any) {
      console.error("PDF download error:", err);
      alert("PDF download failed: " + (err.message || "Unknown error"));
    } finally {
      cleanup();
      setDownloadingMode(null);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">

      {/* ─── CARDS CONTAINER ─── */}
      <div
        className={`flex ${
          stacked ? "flex-col" : "flex-col lg:flex-row"
        } items-center lg:items-stretch justify-center gap-6 lg:gap-8 max-w-full w-full`}
      >
        {/* ══════════════ 1. FRONT SIDE ══════════════ */}
        {(activeView === "both" || activeView === "front") && (
          <div className="flex flex-col items-center flex-1 w-full max-w-[315px]">
            {/* Front Header Badge */}
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 mb-3 bg-[#faf6ee] border border-[#e5dac8] rounded-full text-[11px] font-bold tracking-wider text-[#ea580c] shadow-2xs">
              <ShieldCheck size={13} className="text-[#ea580c]" />
              <span>FRONT SIDE</span>
            </div>

            {/* Physical PVC Card - Front (70mm x 100mm -> 315px x 450px, 7:10 ratio) */}
            <div
              id="msd-pvc-card-front"
              className="w-full max-w-[315px] h-[450px] aspect-[7/10] flex flex-col justify-between bg-white rounded-2xl border-2 border-[#d5c3aa] shadow-xl hover:shadow-2xl transition-shadow overflow-hidden relative text-ink font-sans select-none"
              style={{
                backgroundImage:
                  "radial-gradient(#faf7ee 1px, transparent 1px), linear-gradient(135deg, #ffffff 0%, #faf8f2 50%, #f4ede0 100%)",
                backgroundSize: "20px 20px, 100% 100%",
              }}
            >
              {/* Subtle PVC Gloss Finish */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-2xl z-30" />

              {/* Indian National Tricolor Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FFFFFF] to-[#138808] border-b border-[#e5d8c3]" />

              {/* Card Header */}
              <div className="px-3 pt-2 pb-1.5 border-b border-[#e8ddcb] bg-gradient-to-b from-white to-[#faf6ef]">
                <div className="flex items-center justify-between gap-1.5">
                  <img
                    src="/logo.png"
                    alt="MSD Logo"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                    }}
                    className="w-8 h-8 rounded-full object-contain shadow-xs flex-shrink-0"
                  />
                  <div className="text-center flex-1 min-w-0">
                    <div className="font-serif font-black text-sm tracking-tight text-ink uppercase leading-none">
                      Maha Seva Dal
                    </div>
                    <div className="text-[7.5px] font-sans font-bold text-[#FF6200] tracking-widest uppercase mt-0.5">
                      Estd. 1947 · Unity of People
                    </div>
                    <div className="text-[6.5px] text-muted-editorial font-medium">
                      National Socio-Cultural Cadre Registry
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#FF6200]/10 border border-[#FF6200]/30 flex flex-col items-center justify-center text-center flex-shrink-0">
                    <ShieldCheck size={12} className="text-[#FF6200]" />
                    <span className="text-[5px] font-mono font-bold text-[#FF6200]">1947</span>
                  </div>
                </div>

                {/* Official Badge Title Bar */}
                <div className="mt-1.5 py-0.5 px-2 bg-gradient-to-r from-[#FF6200] to-[#D65000] rounded text-center shadow-xs">
                  <span className="text-[7.5px] font-bold text-white tracking-wider uppercase font-sans">
                    Official National Cadre Identity Card
                  </span>
                </div>
              </div>

              {/* Card Body Profile Section */}
              <div className="p-2.5 space-y-2 relative flex-1 flex flex-col justify-between">
                {/* Watermark when not approved */}
                {!isApproved && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    <div className="transform -rotate-25 border-2 border-dashed border-amber-600/50 text-amber-800/40 font-mono font-black text-base px-3 py-1 uppercase tracking-widest select-none bg-amber-50/20 rounded-lg">
                      PROVISIONAL · PENDING
                    </div>
                  </div>
                )}

                {/* Top Row: Photo & Core Identifiers */}
                <div className="flex items-start gap-2.5">
                  {/* Photo Box — shows ONLY the member's own uploaded photo.
                      If none (or it fails to load), a neutral initial avatar is shown
                      behind it, never another person's portrait. */}
                  <div className="relative flex-shrink-0">
                    <div className="w-[78px] h-[94px] rounded-lg overflow-hidden border-2 border-[#FF6200] ring-2 ring-white/90 ring-inset bg-[#faede3] shadow-xs flex items-center justify-center relative">
                      <span className="absolute inset-0 flex items-center justify-center text-[#FF6200] font-serif font-black text-2xl select-none">
                        {(member.fullName || "M").charAt(0).toUpperCase()}
                      </span>
                      {(photoDataUrl || member.photoUrl) && (
                        <img
                          src={photoDataUrl || member.photoUrl}
                          alt={member.fullName}
                          onError={(e) => {
                            if (!e.currentTarget.dataset.retried && member.photoUrl) {
                              e.currentTarget.dataset.retried = "1";
                              e.currentTarget.src = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(member.photoUrl)}`);
                              return;
                            }
                            e.currentTarget.onerror = null;
                            // Reveal the neutral initial avatar behind — never another person's photo
                            e.currentTarget.style.display = "none";
                          }}
                          className="w-full h-full object-cover relative"
                        />
                      )}
                    </div>
                  </div>

                  {/* Identity Details - Clean, spacious typographic hierarchy */}
                  <div className="flex-1 min-w-0 h-[94px] flex flex-col justify-between py-0.5 pl-1">
                    <div>
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block mb-0.5">
                        Cadre Full Name
                      </span>
                      <div className="font-sans font-black text-[13px] text-ink leading-tight tracking-normal truncate uppercase">
                        {member.fullName}
                      </div>
                    </div>

                    <div className="my-auto pt-1 pb-1.5">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block mb-1">
                        Registration ID
                      </span>
                      <div className="font-mono text-[9.5px] font-bold tracking-wider text-[#D65000] bg-[#fff8f0] px-2.5 py-1 rounded-lg border border-[#fed7aa] inline-block shadow-2xs leading-none">
                        {member.registrationId}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1.5" title={member.wing}>
                      <span className="text-[6.5px] text-[#44403c] uppercase font-bold tracking-wider shrink-0">
                        Wing:
                      </span>
                      <span className="text-[10px] font-bold text-ink truncate leading-tight">
                        {member.wing}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Information Grid with Balanced Two-Column Ledger */}
                <div className="bg-[#faf6ee] rounded-lg p-2 border border-[#e6dbc8] space-y-1 text-[8.5px]">
                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        State Unit
                      </span>
                      <span className="font-bold text-ink truncate block leading-tight">{member.state}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        District Unit
                      </span>
                      <span className="font-bold text-ink truncate block leading-tight">{member.district}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2 pt-1 border-t border-[#ede3d3]">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block truncate" title="Assembly Constituency">
                        Assembly Constituency
                      </span>
                      <span className="font-bold text-ink truncate block leading-tight">{member.assembly || "—"}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block truncate" title="Zone / Region">
                        Zone / Region
                      </span>
                      <span className="font-bold text-ink truncate block leading-tight">{member.zone || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2 pt-1 border-t border-[#ede3d3]">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Contact Mobile
                      </span>
                      <span className="font-mono font-bold text-ink block leading-tight">{format10DigitMobile(member.mobile)}</span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Blood Group
                      </span>
                      {getValidBloodGroup(member.bloodGroup) ? (
                        <span className="font-extrabold text-red-800 bg-red-100/90 px-1.5 py-0.2 rounded border border-red-300 inline-block min-w-[14px] text-center shadow-2xs leading-tight">
                          {getValidBloodGroup(member.bloodGroup)}
                        </span>
                      ) : (
                        <span className="font-mono font-semibold text-ink block leading-tight">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security QR Code & Official Signatory Seal Row */}
                <div className="flex items-center justify-between pt-1 border-t border-[#e8dfcf]">
                  {/* QR Code Container */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-12 bg-white p-0.5 rounded-md border border-[#e3d7c5] shadow-xs flex items-center justify-center flex-shrink-0">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="Verify QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[7px] text-center text-[#554e44] font-mono">QR</div>
                      )}
                    </div>
                    <div className="text-[7px] leading-tight text-[#554e44]">
                      <div className="font-bold text-[#FF6200]">SCAN TO VERIFY</div>
                      <div>Official Cadre</div>
                      <div className="font-mono text-[6px]">mahasevadal.com</div>
                    </div>
                  </div>

                  {/* Authorized Seal & Stamp & Signature Container */}
                  {isApproved ? (
                    <div className="relative flex flex-col items-end min-w-[110px]">
                      {/* Seal and Signature Overlap Zone */}
                      <div className="relative w-28 h-10 flex items-center justify-end">
                        {/* Official Stamp */}
                        <div
                          className="absolute right-[-2px] top-[-6px] pointer-events-none rotate-[-6deg] drop-shadow-xs"
                          style={{ mixBlendMode: "multiply" }}
                        >
                          {cardSettings.customSealUrl ? (
                            <img
                              src={cardSettings.customSealUrl}
                              alt="Official Seal"
                              crossOrigin="anonymous"
                              className="w-[44px] h-[44px] object-contain"
                            />
                          ) : (
                            <OfficialSealSvg className="w-[44px] h-[44px]" />
                          )}
                        </div>

                        {/* Flowing Authorized Signature */}
                        <div className="absolute right-1 bottom-[-2px] z-10 pointer-events-none">
                          <img
                            src={cardSettings.customSignatureUrl || "/signature.png"}
                            alt="Authorized Signature"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.currentTarget.src = "/signature.png";
                            }}
                            className="h-7 max-w-[90px] object-contain drop-shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Signatory Underline & Designation */}
                      <div className="mt-0.5 border-t border-ink/80 w-24 text-right pt-0.5">
                        <span className="text-[6.5px] font-bold text-ink uppercase tracking-wider block leading-tight truncate">
                          {cardSettings.signatoryName || "Authorized Signatory"}
                        </span>
                        <span className="text-[5.5px] text-[#554e44] block leading-tight truncate">
                          {cardSettings.signatoryTitle || "Central Executive Committee"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Provisional Unapproved Indicator */
                    <div className="text-right flex flex-col items-end min-w-[100px]">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-600/70 flex flex-col items-center justify-center text-center p-0.5 rotate-[-4deg] bg-amber-50/60">
                        <span className="text-[4.5px] font-black uppercase text-amber-800 leading-tight">
                          MAHA SEVA DAL
                        </span>
                        <span className="text-[5px] font-black uppercase text-amber-700">PROVISIONAL</span>
                        <span className="text-[4px] font-mono text-amber-800 leading-tight">PENDING</span>
                      </div>
                      <div className="mt-0.5 border-t border-dashed border-ink/30 w-20 text-right pt-0.5">
                        <span className="text-[6px] font-bold text-muted-editorial uppercase tracking-wider block">
                          Pending Sanction
                        </span>
                        <span className="text-[5px] text-muted-editorial block">Awaiting Committee</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Security Band */}
              <div className="py-1 px-2 bg-[#3d3832] flex items-center justify-center text-center text-[7px] font-mono">
                <span className="text-[#FF9933] font-bold tracking-widest uppercase">
                  UNITY OF PEOPLE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ 2. BACK SIDE ══════════════ */}
        {(activeView === "both" || activeView === "back") && (
          <div className="flex flex-col items-center flex-1 w-full max-w-[315px]">
            {/* Back Header Badge */}
            <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 mb-3 bg-[#faf6ee] border border-[#e5dac8] rounded-full text-[11px] font-bold tracking-wider text-[#ea580c] shadow-2xs">
              <FileText size={13} className="text-[#ea580c]" />
              <span>BACK SIDE</span>
            </div>

            {/* Physical PVC Card - Back (70mm x 100mm -> 315px x 450px, 7:10 ratio) */}
            <div
              id="msd-pvc-card-back"
              className="w-full max-w-[315px] h-[450px] aspect-[7/10] flex flex-col justify-between bg-white rounded-2xl border-2 border-[#d5c3aa] shadow-xl hover:shadow-2xl transition-shadow overflow-hidden relative text-ink font-sans select-none"
              style={{
                backgroundImage:
                  "radial-gradient(#faf7ee 1px, transparent 1px), linear-gradient(135deg, #ffffff 0%, #faf8f2 50%, #f4ede0 100%)",
                backgroundSize: "20px 20px, 100% 100%",
              }}
            >
              {/* Subtle PVC Gloss Finish */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-2xl z-30" />

              {/* Indian National Tricolor Ribbon */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FFFFFF] to-[#138808] border-b border-[#e5d8c3]" />

              {/* Back Header */}
              <div className="px-3 pt-2 pb-1.5 border-b border-[#e8ddcb] bg-gradient-to-b from-white to-[#faf6ef]">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/logo.png"
                      alt="MSD Logo"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png";
                      }}
                      className="w-7 h-7 rounded-full object-contain shadow-xs flex-shrink-0"
                    />
                    <div>
                      <div className="font-serif font-black text-sm tracking-tight text-ink uppercase leading-none">
                        Maha Seva Dal
                      </div>
                      <div className="text-[7.5px] font-sans font-bold text-[#FF6200] tracking-wider uppercase mt-0.5">
                        Cadre Particulars & Verification
                      </div>
                      <div className="text-[6.5px] text-[#554e44] font-medium">
                        National Socio-Cultural Cadre Registry · Estd. 1947
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded border border-[#FF6200]/40 bg-[#FF6200]/5 text-[#FF6200] text-[6.5px] font-bold font-mono tracking-wider uppercase flex-shrink-0">
                    REVERSE SIDE
                  </div>
                </div>

                <div className="mt-1.5 py-0.5 px-2 bg-[#2c2824] rounded text-center shadow-xs">
                  <span className="text-[7px] font-bold text-[#FF9933] tracking-widest uppercase font-mono">
                    Official Cadre Record & Directives
                  </span>
                </div>
              </div>

              {/* Back Content Body */}
              <div className="p-2.5 space-y-1.5 text-ink flex-1 flex flex-col justify-between">
                {/* 1. Family & Personal Particulars Box */}
                <div className="bg-[#faf6ee] rounded-lg p-2 border border-[#e6dbc8] space-y-1 text-[8.5px]">
                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Father's / Husband's Name
                      </span>
                      <span className="font-bold text-ink truncate block leading-tight">
                        {member.fatherName || "—"}
                      </span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Date of Birth
                      </span>
                      <span className="font-bold text-ink block font-mono leading-tight">
                        {formatDobDDMMYYYY(member.dob) || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2 pt-1 border-t border-[#ede3d3]">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Gender
                      </span>
                      <span className="font-semibold text-ink block leading-tight">
                        {getDisplayGender(member.gender)}
                      </span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        <span className="sr-only">Emergency Contact</span>
                        <span aria-hidden="true">Emergency / WhatsApp</span>
                      </span>
                      <span
                        className="font-mono font-semibold text-ink block text-[8px] leading-tight truncate"
                        title={
                          member.emergencyNumber
                            ? `${format10DigitMobile(member.emergencyNumber)}${member.emergencyRelation ? ` (${member.emergencyRelation})` : ""}`
                            : format10DigitMobile(member.whatsapp || member.mobile)
                        }
                      >
                        {member.emergencyNumber ? (
                          <>
                            {format10DigitMobile(member.emergencyNumber)}
                            {member.emergencyRelation && (
                              <span className="font-sans font-medium text-[7px] text-[#44403c] ml-1">
                                ({member.emergencyRelation})
                              </span>
                            )}
                          </>
                        ) : (
                          format10DigitMobile(member.whatsapp || member.mobile)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Official Central Secretariat & Cadre Helpline */}
                <div className="bg-[#faf6ee] rounded-lg p-2 border border-[#e6dbc8] space-y-1 text-[8px]">
                  <div className="flex items-center justify-between border-b border-[#ede3d3] pb-1">
                    <span className="font-bold text-[#FF6200] text-[7.5px] uppercase tracking-wider">
                      National Central Secretariat
                    </span>
                    <span className="text-[6.5px] font-mono font-bold text-[#44403c]">Estd. 1947</span>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2 pt-0.5">
                    <div className="pr-1">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Cadre Helpline
                      </span>
                      <span className="font-mono font-bold text-ink block text-[7.5px] leading-tight">
                        +91 9994625690
                      </span>
                      <span className="font-mono font-bold text-ink block text-[7.5px] leading-tight">
                        +91 9514576540
                      </span>
                    </div>
                    <div className="pl-2">
                      <span className="text-[6px] text-[#44403c] uppercase font-bold tracking-wider block">
                        Official Verification
                      </span>
                      <span className="font-mono font-bold text-[#D65000] block text-[8px] leading-tight truncate">
                        mahasevadal.com
                      </span>
                    </div>
                  </div>

                  <div className="text-[6.5px] text-[#44403c] pt-0.5 border-t border-[#ede3d3] space-y-0.5">
                    <div className="leading-tight">
                      <span className="font-semibold text-ink">Head Office:</span> No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.
                    </div>
                    <div className="text-[6px] text-[#44403c] truncate">
                      <span className="font-semibold text-ink font-sans">Email:</span>{" "}
                      <span className="font-mono text-muted-editorial">mahasevadalorganization@gmail.com</span>
                    </div>
                  </div>
                </div>

                {/* 3. Official Terms & Directives */}
                <div className="p-2 bg-white/95 rounded-lg border border-[#e8dfcf] space-y-1 text-[7px] text-[#4a443c] leading-relaxed">
                  <div className="font-bold text-ink uppercase text-[7.5px] tracking-wider">
                    Cadre Directives & Terms
                  </div>
                  <ul className="list-disc list-outside pl-3 space-y-0.5 text-[6.5px] leading-tight">
                    <li>This card is non-transferable property of Maha Seva Dal (Estd. 1947).</li>
                    <li>Authorized for civic welfare, social upliftment & relief operations.</li>
                    <li>If found, please return to Central Secretariat or call Helpline: +91 9994625690 / 9514576540.</li>
                  </ul>
                </div>

                {/* 4. 1D Barcode & Validity Row */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#e8dfcf] text-[7.5px]">
                  <div className="flex flex-col justify-center">
                    <div className="bg-white px-2 py-0.5 rounded border border-[#e5dac8] shadow-2xs inline-block">
                      <BarcodeSvg code={member.registrationId} className="h-4.5 w-28" />
                    </div>
                    <div className="font-mono text-[6.5px] text-[#44403c] font-bold mt-0.5 tracking-wider">
                      REG: {member.registrationId}
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-center">
                    <div className="bg-white px-2.5 py-1 rounded border border-[#e5dac8] shadow-2xs inline-block space-y-0.5">
                      <div className="text-[6.5px] text-[#44403c] font-medium">
                        ISSUED: <span className="font-mono font-bold text-ink">{issueDate}</span>
                      </div>
                      <div className="text-[6px] font-extrabold text-[#FF6200] uppercase tracking-wider">
                        Central Exec. Committee
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Band */}
              <div className="py-1 px-2 bg-[#3d3832] flex items-center justify-center text-center text-[7px] font-mono">
                <span className="text-[#FF9933] font-bold tracking-widest uppercase">
                  DISCIPLINE · SERVICE · UNITY
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── ACTION BUTTONS (DOWNLOAD PDF & IMAGES) ─── */}
      {!hideActionButtons && (
        <div className="flex flex-col gap-3 w-full max-w-[356px] sm:max-w-xl mt-6">
          {/* Card Dimensions Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-editorial bg-[#faf7ee] px-3 sm:px-4 py-2 rounded-xl border border-[#e5dac8] shadow-2xs text-center">
            <span className="font-bold text-[#FF6200]">Card Dimensions:</span>
            <span className="font-mono font-bold text-ink">70 mm × 100 mm (2.76" × 3.94")</span>
            <span className="text-muted-editorial/40 hidden sm:inline">•</span>
            <span className="text-[11px] block sm:inline">827 × 1181 px • 300 DPI Commercial Print Standard</span>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Dual-Sided Options (PDF 2-Pages & Combined Both Sides PNG) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Download PDF (Standard A4 Page, Front & Back side-by-side) */}
              <button
                onClick={() => handleDownloadPdf()}
                disabled={downloadingMode !== null}
                className="bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs sm:text-sm py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer w-full text-center"
                title="Download official print-ready PDF on A4 sheet (Front & Back side-by-side, 70 x 100 mm)"
              >
                {downloadingMode === "pdf" ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              {/* 2. Both Sides (PNG) */}
              <button
                onClick={() => handleDownloadImage("both", "share")}
                disabled={downloadingMode !== null}
                className="btn-primary-coral text-xs sm:text-sm py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer w-full text-center"
                title="Download Front & Back cards side-by-side on a clean sheet for quick sharing"
              >
                {downloadingMode === "both" ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Saving Both Sides...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Both Sides (PNG)</span>
                  </>
                )}
              </button>
            </div>

            {/* Row 2: Print-Ready Single Sides (Square Corners, Tight Crop, 300 DPI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 3. Front Side (PNG) */}
              <button
                onClick={() => handleDownloadImage("front", "print")}
                disabled={downloadingMode !== null}
                className="bg-white hover:bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] hover:border-[#ea580c] text-xs sm:text-sm py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md disabled:opacity-50 transition-all cursor-pointer w-full text-center"
                title="Download Front side card (tight crop, rounded corners, 300 DPI)"
              >
                {downloadingMode === "front_print" || downloadingMode === "front_share" ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Saving Front...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Front Side (PNG)</span>
                  </>
                )}
              </button>

              {/* 4. Back Side (PNG) */}
              <button
                onClick={() => handleDownloadImage("back", "print")}
                disabled={downloadingMode !== null}
                className="bg-white hover:bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] hover:border-[#ea580c] text-xs sm:text-sm py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs hover:shadow-md disabled:opacity-50 transition-all cursor-pointer w-full text-center"
                title="Download Back side card (tight crop, rounded corners, 300 DPI)"
              >
                {downloadingMode === "back_print" || downloadingMode === "back_share" ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Saving Back...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Back Side (PNG)</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DigitalIdCard;
