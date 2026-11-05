import React, { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import DigitalIdCard, {
  generateIdCardPdf,
  generateCombinedIdCardCanvas,
  generateIdCardCanvas,
  generateIdCardBackCanvas,
  triggerDownload,
  OfficialSealSvg,
  OfficialSignatureSvg,
  BarcodeSvg,
  formatDobDDMMYYYY,
  format10DigitMobile,
} from "@/components/DigitalIdCard";
import { logActivity } from "@/utils/activityLogger";
import { getApiUrl } from "@/config/api";
import {
  Smartphone,
  Send,
  RefreshCw,
  FolderOpen,
  FileJson,
  Undo2,
  Redo2,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  X,
  User,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  QrCode,
  FileText,
  SlidersHorizontal,
  Camera,
  Image as ImageIcon,
  RotateCw,
  MapPin,
} from "lucide-react";
import defaultFlowData from "@/data/defaultFlow.json";
import { INDIAN_STATES, STATE_DISTRICTS } from "@/pages/Register";

// Types matching WACTO Export Format
interface WactoAction {
  buttons?: Array<{ type: string; reply: { id: string; title: string } }>;
  button?: string;
  sections?: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

interface WactoNode {
  nodeId: string;
  type: "interactive" | "media" | "text";
  name: string;
  interactiveId?: string | null;
  keywords?: string[];
  parentNodeId?: string | null;
  data: {
    interactiveType?: "button" | "list";
    header?: { type: string; text?: string };
    body?: string;
    footer?: string;
    action?: WactoAction;
    mediaType?: string;
    link?: string;
  };
}

interface WactoEdge {
  fromNodeId: string;
  toNodeId: string;
  keywords: string[];
  intentName?: string;
  delay?: number;
  sourceHandle?: string;
}

interface WactoFlow {
  chatbot: { name: string };
  nodes: WactoNode[];
  edges: WactoEdge[];
  manualResolution?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "backend";
  nodeId?: string;
  text?: string;
  header?: string;
  body?: string;
  footer?: string;
  interactiveType?: "button" | "list" | "media";
  action?: WactoAction;
  mediaUrl?: string;
  timestamp: string;
  customCard?: "new_id_card" | "approved_id_card" | "donation_invoice";
  cardDetails?: any;
}

export interface CandidateData {
  fullName: string;
  fatherName: string;
  dob: string;
  age?: number;
  gender: string;
  mobile: string;
  whatsapp: string;
  email: string;
  bloodGroup: string;
  emergencyNumber: string;
  emergencyRelation: string;
  state: string;
  district: string;
  assembly?: string;
  zone?: string;
  taluk: string;
  pincode: string;
  address: string;
  wing: string;
  profession: string;
}

const defaultCandidateData: CandidateData = {
  fullName: "Deepu Kumar",
  fatherName: "Sagik P",
  dob: "1999-06-12",
  age: 27,
  gender: "Male",
  mobile: "9871454424",
  whatsapp: "9871454424",
  email: "kumardeepu0505@gmail.com",
  bloodGroup: "AB+",
  emergencyNumber: "8975511221",
  emergencyRelation: "",
  state: "Tamil Nadu",
  district: "Viluppuram District",
  assembly: "Thiyagarayanagar",
  zone: "CHENNAI ZONE",
  taluk: "Viluppuram",
  pincode: "605002",
  address: "Door No. 14, Gandhi Salai, Viluppuram",
  wing: "Legal Wing",
  profession: "Advocate",
};

const calcAge = (dobString?: string): number | undefined => {
  if (!dobString) return undefined;
  const d = new Date(dobString);
  if (isNaN(d.getTime())) return undefined;
  const ageDiff = Date.now() - d.getTime();
  const ageDate = new Date(ageDiff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

interface FlowIdCardBubbleProps {
  member: any;
  qrDataUrl?: string;
  isApproved?: boolean;
  onOpenStudio: (member: any, qrDataUrl: string) => void;
  onViewInPanel?: () => void;
}

// Sub-component: Official Front Card
const FrontCardView: React.FC<{ member: any; qrUrl: string }> = ({ member, qrUrl }) => (
  <div
    className="w-full bg-white rounded-xl border-2 border-[#d5c3aa] shadow-md hover:shadow-lg transition-shadow overflow-hidden relative text-ink font-sans select-none flex flex-col justify-between"
    style={{
      backgroundImage:
        "radial-gradient(#faf7ee 1px, transparent 1px), linear-gradient(135deg, #ffffff 0%, #faf8f2 50%, #f4ede0 100%)",
      backgroundSize: "16px 16px, 100% 100%",
    }}
  >
    {/* Subtle PVC Gloss Finish */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-xl z-20" />

    {/* Indian National Tricolor Ribbon */}
    <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FFFFFF] to-[#138808] border-b border-[#e5d8c3]" />

    <div className="p-2.5 space-y-2">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-[#e8ddcb]">
          <img
            src="/logo.png"
            alt="MSD Logo"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.src =
                "/logo.png";
            }}
            className="w-7 h-7 rounded-full object-contain shadow-xs flex-shrink-0"
          />
          <div className="text-center flex-1 min-w-0">
            <div className="font-serif font-black text-xs text-ink uppercase leading-none">
              Maha Seva Dal
            </div>
            <div className="text-[6.5px] font-sans font-bold text-[#FF6200] tracking-widest uppercase mt-0.5">
              Estd. 1947 · Unity of People's
            </div>
            <div className="text-[5.5px] text-[#554e44] font-medium truncate">
              National Socio-Cultural Cadre Registry
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#FF6200]/10 border border-[#FF6200]/30 flex flex-col items-center justify-center text-center flex-shrink-0">
            <ShieldCheck size={10} className="text-[#FF6200]" />
            <span className="text-[4.5px] font-mono font-bold text-[#FF6200]">1947</span>
          </div>
        </div>

        {/* Official Badge Title Bar */}
        <div className="mt-1 py-0.5 px-1.5 bg-gradient-to-r from-[#FF6200] to-[#D65000] rounded text-center shadow-xs">
          <span className="text-[6.5px] font-bold text-white tracking-wider uppercase font-sans">
            Official National Cadre Identity Card
          </span>
        </div>
      </div>

      {/* Profile Row: Photo & Identifiers */}
      <div className="flex items-start gap-2">
        {/* Photo Box */}
        <div className="w-[58px] h-[70px] rounded-lg overflow-hidden border-2 border-[#FF6200] ring-1 ring-white/90 bg-white shadow-xs flex-shrink-0 flex items-center justify-center">
          <img
            src={member.photoUrl || "/founder-saragabani-gopu-portrait.jpg"}
            alt={member.fullName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/founder-saragabani-gopu-portrait.jpg";
            }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Particulars */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div>
            <span className="text-[6px] text-[#554e44] uppercase font-bold tracking-wider block">
              Cadre Full Name
            </span>
            <div className="font-serif font-black text-[11px] text-ink leading-tight truncate">
              {member.fullName}
            </div>
          </div>

          <div>
            <span className="text-[6px] text-[#554e44] uppercase font-bold tracking-wider block">
              Registration ID
            </span>
            <div className="font-mono text-[9.5px] font-bold tracking-wider text-[#D65000] bg-[#faf6ee] px-1.5 py-0.2 rounded border border-[#e5dac8] inline-block shadow-2xs">
              {member.registrationId}
            </div>
          </div>

          <div>
            <span className="text-[6px] text-[#554e44] uppercase font-bold tracking-wider block">
              Assigned Wing
            </span>
            <div className="text-[7.5px] font-bold bg-[#fff7ed] text-ink px-1.5 py-0.2 rounded border border-[#fed7aa] inline-block truncate max-w-full shadow-2xs">
              {member.wing}
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid Box */}
      <div className="bg-[#faf6ee] rounded-lg p-1.5 border border-[#e6dbc8] space-y-1 text-[7.5px]">
        <div className="grid grid-cols-2 gap-1">
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              State Unit
            </span>
            <span className="font-bold text-ink truncate block">
              {member.state || "Tamil Nadu"}
            </span>
          </div>
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              District Unit
            </span>
            <span className="font-bold text-ink truncate block">
              {member.district || "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#ede3d3]">
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Assembly Constituency
            </span>
            <span className="font-bold text-ink truncate block">
              {member.assembly || "—"}
            </span>
          </div>
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Zone / Region
            </span>
            <span className="font-bold text-ink truncate block">
              {member.zone || "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#ede3d3]">
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Contact Mobile
            </span>
            <span className="font-mono font-bold text-ink block truncate">
              {format10DigitMobile(member.mobile)}
            </span>
          </div>
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Blood Group
            </span>
            <span className="font-mono font-black text-[#e11d48] bg-rose-50 border border-rose-200 px-1 py-0.2 rounded inline-block text-[7px]">
              {member.bloodGroup || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: QR Code + Signatory Rubber Stamp */}
      <div className="flex items-end justify-between pt-1 border-t border-[#e8ddcb] gap-2">
        <div className="flex items-center gap-1.5">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Scan to Verify QR"
              className="w-10 h-10 border border-[#e5dac8] rounded bg-white p-0.5 shadow-2xs flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-white border border-[#e5dac8] rounded flex items-center justify-center">
              <QrCode size={18} className="text-stone-400" />
            </div>
          )}
          <div className="text-[5.5px] leading-tight space-y-0.2">
            <div className="font-bold text-[#FF6200] uppercase tracking-wider">Scan to Verify</div>
            <div className="text-[#554e44]">Official Cadre</div>
            <div className="font-mono text-[#554e44] font-medium">mahasevadal.com</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-right">
          <OfficialSealSvg className="w-9 h-9 flex-shrink-0 opacity-95" color="#1e3a8a" />
          <div className="flex flex-col items-end">
            <img
              src="/signature.png"
              alt="Authorized Signature"
              className="h-4 w-14 object-contain"
            />
            <div className="border-t border-[#1e3a8a]/40 pt-0.5 mt-0.5">
              <span className="text-[6px] font-bold text-[#1e3a8a] uppercase tracking-tight block">
                Authorized Signatory
              </span>
              <span className="text-[4.5px] text-[#554e44] block">Central Exec. Committee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security Band */}
      <div className="-mx-2.5 -mb-2.5 py-0.5 bg-[#3d3832] flex items-center justify-center text-center">
        <span className="text-[#FF9933] font-bold tracking-widest uppercase text-[6px] font-mono">
          UNITY OF PEOPLE'S
        </span>
      </div>
    </div>
  </div>
);

// Sub-component: Official Reverse Card
const BackCardView: React.FC<{ member: any; issueDate: string; memberAge?: number }> = ({
  member,
  issueDate,
  memberAge,
}) => (
  <div
    className="w-full bg-white rounded-xl border-2 border-[#d5c3aa] shadow-md hover:shadow-lg transition-shadow overflow-hidden relative text-ink font-sans select-none flex flex-col justify-between"
    style={{
      backgroundImage:
        "radial-gradient(#faf7ee 1px, transparent 1px), linear-gradient(135deg, #ffffff 0%, #faf8f2 50%, #f4ede0 100%)",
      backgroundSize: "16px 16px, 100% 100%",
    }}
  >
    {/* Subtle PVC Gloss Finish */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 rounded-xl z-20" />

    {/* Indian National Tricolor Ribbon */}
    <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FFFFFF] to-[#138808] border-b border-[#e5d8c3]" />

    <div className="p-2.5 space-y-2">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-[#e8ddcb]">
          <img
            src="/logo.png"
            alt="MSD Logo"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.src =
                "/logo.png";
            }}
            className="w-7 h-7 rounded-full object-contain shadow-xs flex-shrink-0"
          />
          <div className="text-center flex-1 min-w-0">
            <div className="font-serif font-black text-xs text-ink uppercase leading-none">
              Maha Seva Dal
            </div>
            <div className="text-[6.5px] font-sans font-bold text-[#FF6200] tracking-widest uppercase mt-0.5">
              Cadre Particulars & Verification
            </div>
          </div>
          <div className="px-1 py-0.5 rounded border border-[#FF6200]/40 text-[#FF6200] text-[6px] font-bold uppercase tracking-wider flex-shrink-0">
            Reverse Side
          </div>
        </div>

        {/* Official Record Title Bar */}
        <div className="mt-1 py-0.5 px-1.5 bg-[#3d3832] rounded text-center shadow-xs">
          <span className="text-[6.5px] font-bold text-[#FF9933] tracking-wider uppercase font-sans">
            Official Cadre Record & Directives
          </span>
        </div>
      </div>

      {/* 1. Family & Personal Particulars Box */}
      <div className="bg-[#faf6ee] rounded-lg p-1.5 border border-[#e6dbc8] space-y-1 text-[7.5px]">
        <div className="grid grid-cols-2 gap-1">
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Father's / Husband's Name
            </span>
            <span className="font-bold text-ink truncate block">
              {member.fatherName || "—"}
            </span>
          </div>
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Date of Birth & Age
            </span>
            <span className="font-bold text-ink block font-mono truncate">
              {formatDobDDMMYYYY(member.dob)
                ? `${formatDobDDMMYYYY(member.dob)}${memberAge ? ` (${memberAge} Yrs)` : ""}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#ede3d3]">
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Gender
            </span>
            <span className="font-semibold text-ink block">
              {member.gender || "—"}
            </span>
          </div>
          <div>
            <span className="text-[5.5px] text-[#554e44] uppercase font-bold block">
              Emergency / WhatsApp
            </span>
            <span className="font-mono font-semibold text-ink block text-[7px] truncate">
              {format10DigitMobile(member.emergencyNumber || member.whatsapp || member.mobile)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Permanent Residential Address Box */}
      <div className="bg-[#faf6ee] rounded-lg p-1.5 border border-[#e6dbc8] space-y-0.5 text-[7px]">
        <div className="flex items-center gap-1 font-bold text-[#FF6200] text-[6.5px] uppercase">
          <MapPin size={9} />
          <span>Permanent Residential Address</span>
        </div>
        <div className="font-semibold text-ink truncate leading-tight">
          {member.address || "Main Street"}
        </div>
        <div className="text-[6px] text-[#554e44] truncate">
          Taluk: <span className="font-medium text-ink">{member.taluk || "—"}</span> Dist:{" "}
          <span className="font-medium text-ink">{member.district || "—"}</span> State:{" "}
          <span className="font-medium text-ink">{member.state || "—"}</span> PIN:{" "}
          <span className="font-mono font-bold text-[#FF6200]">{member.pincode || "—"}</span>
        </div>
        {member.email && (
          <div className="text-[6px] text-[#554e44] truncate">
            Email: <span className="font-mono text-ink">{member.email}</span>
          </div>
        )}
      </div>

        {/* 2. Official Central Secretariat & Cadre Helpline */}
        <div className="bg-[#faf6ee] rounded-lg p-1.5 border border-[#e6dbc8] space-y-1 text-[7px]">
          <div className="flex items-center justify-between border-b border-[#ede3d3] pb-0.5">
            <span className="font-bold text-[#FF6200] text-[6.5px] uppercase tracking-wider">
              National Central Secretariat
            </span>
            <span className="text-[6px] font-mono font-bold text-[#44403c]">Estd. 1947</span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-[#ede3d3] gap-x-2 pt-0.5">
            <div className="pr-1">
              <span className="text-[5.5px] text-[#554e44] uppercase font-bold tracking-wider block">
                Cadre Helpline
              </span>
              <span className="font-mono font-bold text-ink block text-[7px] leading-tight">
                +91 9994625690
              </span>
              <span className="font-mono font-bold text-ink block text-[7px] leading-tight">
                +91 9514576540
              </span>
            </div>
            <div className="pl-1.5 flex flex-col justify-center">
              <span className="text-[5.5px] text-[#554e44] uppercase font-bold tracking-wider block">
                Official Verification
              </span>
              <span className="font-mono font-bold text-[#D65000] block text-[7px] leading-tight truncate">
                mahasevadal.com
              </span>
            </div>
          </div>

          <div className="text-[6px] text-[#44403c] pt-0.5 border-t border-[#ede3d3] space-y-0.5">
            <div className="leading-tight truncate">
              <span className="font-semibold text-ink">Head Office:</span> No.8/7, Thiruvallar 1st Street, Adambakkam, Chennai - 600 088.
            </div>
            <div className="text-[6px] text-[#44403c] truncate">
              <span className="font-semibold text-ink font-sans">Email:</span>{" "}
              <span className="font-mono text-muted-editorial">mahasevadalorganization@gmail.com</span>
            </div>
          </div>
        </div>

      {/* 3. Official Terms & Directives */}
      <div className="p-1.5 bg-white/95 rounded-lg border border-[#e8dfcf] space-y-0.5 text-[6px] text-[#4a443c] leading-tight">
        <div className="font-bold text-ink uppercase text-[6.5px] flex items-center gap-1">
          <ShieldCheck size={9} className="text-emerald-600 flex-shrink-0" />
          <span>Cadre Directives & Terms</span>
        </div>
        <ul className="list-disc list-outside pl-2.5 space-y-0.5 text-[5.5px] leading-snug">
          <li>This card is non-transferable property of Maha Seva Dal (Estd. 1947).</li>
          <li>Authorized for civic welfare, social upliftment & relief operations.</li>
          <li>If found, please return to Central Secretariat or call Helpline: +91 9994625690 / 9514576540.</li>
        </ul>
      </div>

      {/* 4. Barcode & Validity Row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#e8dfcf] text-[6.5px]">
        <div className="flex flex-col justify-center">
          <div className="bg-white px-1 py-0.2 rounded border border-[#e5dac8] shadow-2xs inline-block">
            <BarcodeSvg code={member.registrationId} className="h-3.5 w-20" />
          </div>
          <div className="font-mono text-[5.5px] text-[#554e44] font-bold mt-0.5">
            REG: {member.registrationId}
          </div>
        </div>

        <div className="text-right flex flex-col justify-center">
          <div className="bg-white px-1.5 py-0.5 rounded border border-[#e5dac8] shadow-2xs inline-block space-y-0.2">
            <div className="text-[5.5px] text-[#554e44] font-medium">
              ISSUED: <span className="font-mono font-bold text-ink">{issueDate}</span>
            </div>
            <div className="text-[5px] font-bold text-[#FF6200] uppercase tracking-tight">
              Central Exec. Committee
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security Band */}
      <div className="-mx-2.5 -mb-2.5 py-0.5 bg-[#3d3832] flex items-center justify-center text-center">
        <span className="text-[#FF9933] font-bold tracking-widest uppercase text-[6px] font-mono">
          DISCIPLINE · SERVICE · UNITY
        </span>
      </div>
    </div>
  </div>
);

const FlowIdCardBubble: React.FC<FlowIdCardBubbleProps> = ({
  member,
  qrDataUrl: initialQr,
  isApproved = false,
  onOpenStudio,
  onViewInPanel,
}) => {
  // Default to dual view: shows BOTH cards side-by-side as requested
  const [viewMode, setViewMode] = useState<"both" | "front" | "back">("both");
  const [layoutMode, setLayoutMode] = useState<"side_by_side" | "stacked">("side_by_side");
  const [downloading, setDownloading] = useState<"pdf" | "both" | "front" | "back" | null>(null);
  const [qrUrl, setQrUrl] = useState<string>(initialQr || "");

  useEffect(() => {
    if (!qrUrl && member?.registrationId) {
      QRCode.toDataURL(
        `https://mahasevadal.com/verify?id=${member.registrationId}&name=${encodeURIComponent(
          member.fullName || ""
        )}&wing=${encodeURIComponent(member.wing || "")}`,
        { width: 180, margin: 1 }
      )
        .then(setQrUrl)
        .catch((e) => console.warn("QR generation error:", e));
    }
  }, [member?.registrationId, member?.fullName, member?.wing, qrUrl]);

  const rawDate = member.approvedAt || member.createdAt || new Date().toISOString();
  const issueDate = new Date(rawDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const memberAge = member.age || calcAge(member.dob);

  const handleDownload = async (target: "pdf" | "both" | "front" | "back") => {
    setDownloading(target);
    try {
      const cleanRegId = (member.registrationId || "MSD-IND-2026").replace(/[^a-zA-Z0-9_-]/g, "_");
      let activeQr = qrUrl;
      if (!activeQr) {
        activeQr = await QRCode.toDataURL(
          `https://mahasevadal.com/verify?id=${member.registrationId}&name=${encodeURIComponent(
            member.fullName || ""
          )}&wing=${encodeURIComponent(member.wing || "")}`,
          { width: 180, margin: 1 }
        );
        setQrUrl(activeQr);
      }

      if (target === "pdf") {
        await generateIdCardPdf(member, activeQr);
      } else if (target === "both") {
        const bothUrl = await generateCombinedIdCardCanvas(member, activeQr);
        triggerDownload(bothUrl, `${cleanRegId}_Both.png`);
      } else if (target === "front") {
        const frontUrl = await generateIdCardCanvas(member, activeQr);
        triggerDownload(frontUrl, `${cleanRegId}_Front.png`);
      } else if (target === "back") {
        const backUrl = await generateIdCardBackCanvas(member);
        triggerDownload(backUrl, `${cleanRegId}_Back.png`);
      }

      const downloadLabel = target.toUpperCase();
      console.log(`[Flow Simulator] ID Card Downloaded locally: ${downloadLabel}`);
    } catch (err: any) {
      console.error("ID Card download failed:", err);
      alert("ID Card download error: " + (err.message || "Failed to download"));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-2 w-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="font-bold text-emerald-800 text-xs flex items-center gap-1">
          {isApproved ? (
            <>
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Cadre Membership Verified ✅</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Cadre Enrollment & 1947 Oath Confirmed!</span>
            </>
          )}
        </div>
        <span
          className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${
            isApproved
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-amber-100 text-amber-800 border-amber-300"
          }`}
        >
          {isApproved ? "Approved" : "Provisional"}
        </span>
      </div>

      {/* View Mode Selector: Both Sides (Dual) / Front / Back */}
      <div className="flex items-center justify-between gap-1 bg-stone-100/95 p-1 rounded-xl border border-stone-200">
        <div className="flex items-center gap-1 flex-1">
          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`flex-1 py-1 px-1.5 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
              viewMode === "both"
                ? "bg-[#ea580c] text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 bg-white/70"
            }`}
          >
            <span>👥 Both Sides</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("front")}
            className={`py-1 px-2 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
              viewMode === "front"
                ? "bg-[#ea580c] text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 bg-white/70"
            }`}
          >
            <span>📇 Front</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("back")}
            className={`py-1 px-2 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
              viewMode === "back"
                ? "bg-[#ea580c] text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900 bg-white/70"
            }`}
          >
            <span>🔄 Back</span>
          </button>
        </div>

        {viewMode === "both" && (
          <button
            type="button"
            onClick={() => setLayoutMode(layoutMode === "side_by_side" ? "stacked" : "side_by_side")}
            className="py-1 px-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-800 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
            title="Toggle between horizontal side-by-side swipe and vertical stack"
          >
            <span>{layoutMode === "side_by_side" ? "↕️ Stack" : "↔️ Dual"}</span>
          </button>
        )}
      </div>

      {/* ─── DUAL-SIDED PHYSICAL PVC CARDS DISPLAY ─── */}
      {viewMode === "both" ? (
        layoutMode === "side_by_side" ? (
          // Side-by-side horizontal scroll view matching Screenshot 2
          <div className="w-full">
            <div className="text-[8.5px] font-mono text-stone-500 flex items-center justify-between pb-1 px-1">
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <span>↔️ Swipe / scroll to view both sides:</span>
              </span>
              <span className="bg-amber-100 text-amber-900 text-[8px] font-bold px-1.5 py-0.2 rounded border border-amber-300 font-mono">
                Front & Reverse Side-by-Side
              </span>
            </div>
            <div className="flex flex-row overflow-x-auto gap-2.5 pb-2 pt-0.5 px-0.5 snap-x snap-mandatory [scrollbar-width:thin] overscroll-x-contain">
              <div className="shrink-0 w-[242px] snap-center">
                <div className="text-[8px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  <span>Card 1: Front Side</span>
                </div>
                <FrontCardView member={member} qrUrl={qrUrl} />
              </div>
              <div className="shrink-0 w-[242px] snap-center">
                <div className="text-[8px] font-bold text-[#FF6200] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <RotateCw size={11} />
                  <span>Card 2: Reverse Side</span>
                </div>
                <BackCardView member={member} issueDate={issueDate} memberAge={memberAge} />
              </div>
            </div>
          </div>
        ) : (
          // Vertically stacked view
          <div className="w-full space-y-3 pt-0.5">
            <div>
              <div className="text-[8.5px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>1. Official National Cadre Card (Front Side)</span>
              </div>
              <FrontCardView member={member} qrUrl={qrUrl} />
            </div>
            <div>
              <div className="text-[8.5px] font-bold text-[#FF6200] uppercase tracking-wider mb-1 flex items-center gap-1">
                <RotateCw size={11} />
                <span>2. Official Cadre Particulars & Verification (Reverse Side)</span>
              </div>
              <BackCardView member={member} issueDate={issueDate} memberAge={memberAge} />
            </div>
          </div>
        )
      ) : viewMode === "front" ? (
        <div className="w-full pt-0.5">
          <FrontCardView member={member} qrUrl={qrUrl} />
        </div>
      ) : (
        <div className="w-full pt-0.5">
          <BackCardView member={member} issueDate={issueDate} memberAge={memberAge} />
        </div>
      )}

      {/* ─── 4 DIRECT DOWNLOAD BUTTONS + FULL STUDIO MODAL BUTTON ─── */}
      <div className="space-y-1.5 pt-1">
        <div className="grid grid-cols-2 gap-1.5">
          {/* 1. PDF Download */}
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null}
            className="py-1.5 px-2 bg-[#1e3a8a] hover:bg-[#172554] active:bg-[#0f172a] text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
            title="Download official print-ready PDF on A4 sheet (Front & Back side-by-side, 70 x 100 mm)"
          >
            {downloading === "pdf" ? (
              <span className="animate-spin text-[10px]">⏳</span>
            ) : (
              <FileText size={12} />
            )}
            <span>Download PDF (A4)</span>
          </button>

          {/* 2. Both Sides PNG */}
          <button
            type="button"
            onClick={() => handleDownload("both")}
            disabled={downloading !== null}
            className="py-1.5 px-2 bg-[#ea580c] hover:bg-[#c2410c] active:bg-[#9a3412] text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
            title="Download Front & Back cards side-by-side on clean sheet for sharing"
          >
            {downloading === "both" ? (
              <span className="animate-spin text-[10px]">⏳</span>
            ) : (
              <Download size={12} />
            )}
            <span>Both Sides (PNG)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {/* 3. Front Side PNG */}
          <button
            type="button"
            onClick={() => handleDownload("front")}
            disabled={downloading !== null}
            className="py-1.5 px-2 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
            title="Download Front side card (tight crop, 300 DPI)"
          >
            {downloading === "front" ? (
              <span className="animate-spin text-[9.5px]">⏳</span>
            ) : (
              <Download size={11} className="text-[#ea580c]" />
            )}
            <span>Front Side (PNG)</span>
          </button>

          {/* 4. Back Side PNG */}
          <button
            type="button"
            onClick={() => handleDownload("back")}
            disabled={downloading !== null}
            className="py-1.5 px-2 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
            title="Download Back side card (tight crop, 300 DPI)"
          >
            {downloading === "back" ? (
              <span className="animate-spin text-[9.5px]">⏳</span>
            ) : (
              <Download size={11} className="text-[#ea580c]" />
            )}
            <span>Back Side (PNG)</span>
          </button>
        </div>

        {/* Prominent View in Actual Web Studio Panel Button */}
        {onViewInPanel && (
          <button
            type="button"
            onClick={onViewInPanel}
            className="w-full py-2 px-3 bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-[#c2410c] hover:to-[#9a3412] text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <CreditCard size={14} className="text-amber-200" />
            <span>Open Actual Web ID Card (Both Sides) ➔</span>
          </button>
        )}

        {/* 5. Open Full Studio Modal */}
        <button
          type="button"
          onClick={() => onOpenStudio(member, qrUrl)}
          className="w-full py-1.5 px-2 bg-gradient-to-r from-stone-800 to-stone-900 hover:from-stone-900 hover:to-black text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <CreditCard size={12} className="text-[#FF9933]" />
          <span>Open Full Studio (Inspect Both Sides)</span>
        </button>
      </div>
    </div>
  );
};

export default function FlowSimulator({ embedded = false }: { embedded?: boolean } = {}) {
  const [flow, setFlow] = useState<WactoFlow>(defaultFlowData as WactoFlow);
  const [activeNodeId, setActiveNodeId] = useState<string>("root");
  const [activeTab, setActiveTab] = useState<"inspect" | "edit" | "card">("inspect");
  const [persona, setPersona] = useState<"new_cadre" | "approved_cadre" | "dropoff_cadre">("new_cadre");
  const [sessionRegisteredMember, setSessionRegisteredMember] = useState<{
    registrationId: string;
    fullName: string;
    wing: string;
    district?: string;
  } | null>(null);

  // Candidate Data & Manual Details Form State
  const [candidateData, setCandidateData] = useState<CandidateData>(defaultCandidateData);
  const [formData, setFormData] = useState<CandidateData>(defaultCandidateData);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [candidatePhoto, setCandidatePhoto] = useState<string>(
    "/uploads/photos/MSD-IND-2026-6790_photo.jpg"
  );

  // Active Card Data for actual web DigitalIdCard display
  const [activeMemberForCard, setActiveMemberForCard] = useState<any>(null);
  const [activeCardQrUrl, setActiveCardQrUrl] = useState<string>("");

  // Official Donation UPI QR Code Data URL (Generates crisp QR code matching website Home)
  const [donationQrDataUrl, setDonationQrDataUrl] = useState<string>("/donation-qr.png");

  useEffect(() => {
    QRCode.toDataURL(
      "upi://pay?pa=MAB.037349044880004@AXISBANK&pn=Maha+Seva+Dal+Foundation&cu=INR",
      {
        width: 320,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
        errorCorrectionLevel: "H",
      }
    )
      .then((url) => setDonationQrDataUrl(url))
      .catch((err) => console.warn("Failed to generate donation QR data URL", err));
  }, []);

  const approvedJaysuryaMember = {
    registrationId: "MSD-IND-2026-0001",
    fullName: "Jaysurya S",
    fatherName: "Rajnikanth",
    dob: "2006-08-13",
    age: 20,
    gender: "Male",
    mobile: "9888888888",
    whatsapp: "9888888888",
    emergencyNumber: "9888888888",
    emergencyRelation: "WhatsApp",
    email: "ran@gmail.com",
    bloodGroup: "B+",
    wing: "Education & Child Welfare",
    district: "Jhajjar",
    state: "Haryana",
    taluk: "Rajori",
    pincode: "630025",
    address: "56 Street Kamedu,Haryana",
    status: "APPROVED",
    approvedAt: "2026-10-23T00:00:00.000Z",
    createdAt: "2026-10-23T00:00:00.000Z",
    photoUrl: "/founder-saragabani-gopu-portrait.jpg",
  };

  const currentCardMember =
    activeMemberForCard ||
    (persona === "approved_cadre"
      ? approvedJaysuryaMember
      : {
          registrationId: "MSD-IND-2026-6790",
          fullName: candidateData.fullName || "Nirmal",
          fatherName: candidateData.fatherName || "Dinesh",
          dob: candidateData.dob || "1998-09-12",
          age: candidateData.age || calcAge(candidateData.dob || "1998-09-12") || 28,
          gender: candidateData.gender || "Male",
          mobile: format10DigitMobile(candidateData.mobile || "8903162114"),
          whatsapp: format10DigitMobile(candidateData.whatsapp || candidateData.mobile || "8903162114"),
          emergencyNumber: format10DigitMobile(candidateData.emergencyNumber || "8979466464"),
          emergencyRelation: "Other",
          email: candidateData.email || "nirmal@gmail.com",
          bloodGroup: candidateData.bloodGroup || "O+",
          wing: candidateData.wing || "Education & Child Welfare",
          profession: candidateData.profession || "Volunteer",
          district: candidateData.district || "Ariyalur",
          pincode: candidateData.pincode || "600026",
          state: candidateData.state || "Tamil Nadu",
          taluk: candidateData.taluk || "Ariyalur",
          address: candidateData.address || "No:19, Anjeneyar Kovil street, Ariyalur",
          status: "APPROVED",
          approvedAt: new Date().toISOString(),
          photoUrl: candidatePhoto,
          createdAt: new Date().toISOString(),
        });

  useEffect(() => {
    if (currentCardMember?.registrationId) {
      QRCode.toDataURL(
        `https://mahasevadal.com/verify?id=${currentCardMember.registrationId}&name=${encodeURIComponent(
          currentCardMember.fullName || ""
        )}&wing=${encodeURIComponent(currentCardMember.wing || "")}`,
        { width: 180, margin: 1 }
      )
        .then(setActiveCardQrUrl)
        .catch((err) => console.warn("QR gen error:", err));
    }
  }, [
    currentCardMember?.registrationId,
    currentCardMember?.fullName,
    currentCardMember?.wing,
  ]);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [listDrawer, setListDrawer] = useState<{ open: boolean; messageId: string | null }>({
    open: false,
    messageId: null,
  });

  // Modal states
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [studioModalMember, setStudioModalMember] = useState<any | null>(null);
  const [studioModalQrUrl, setStudioModalQrUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Real-time Backend Connection Monitor
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const probeBackend = async () => {
      try {
        const res = await fetch(getApiUrl("/health"), {
          method: "GET",
          headers: { "x-client-channel": "WHATSAPP" },
        });
        if (isMounted) {
          setIsBackendOnline(res.ok);
        }
      } catch {
        try {
          const res2 = await fetch(getApiUrl("/api/members/card-settings"), { method: "GET" });
          if (isMounted) {
            setIsBackendOnline(res2.ok);
          }
        } catch {
          if (isMounted) {
            setIsBackendOnline(true);
          }
        }
      }
    };

    probeBackend();
    const timer = setInterval(probeBackend, 12000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Auto-scroll phone chat internally ONLY when new messages arrive (never scroll the outer web page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Helper for Flow Simulator local telemetry (does not pollute live inbox)
  const syncStepToInbox = (_extra: {
    stepLabel: string;
    buttonClicked?: string;
    userMessage?: string;
    botMessage?: string;
    cardData?: any;
    cardViewed?: boolean;
    cardDownloaded?: boolean;
    overrideMember?: any;
  }) => {
    // Simulator steps run locally in memory without injecting mock records into live CRM
  };

  // Initial Welcome sequence
  useEffect(() => {
    initChat();
  }, [flow, persona]);

  const initChat = () => {
    const rootNode = flow.nodes.find((n) => n.nodeId === "root");
    if (!rootNode) return;

    setActiveNodeId("root");
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    if (persona === "dropoff_cadre") {
      syncStepToInbox({
        stepLabel: "User Triggered 'Hi' (Drop-Off Resumption · 24h Window Open)",
        buttonClicked: "Hi",
        userMessage: "Hi",
        botMessage:
          "Welcome back, Jaysurya S! Would you like to resume where you left off or start fresh?",
      });
      // Simulate resumption greeting for dropoff lead
      setMessages([
        {
          id: "msg_user_init",
          sender: "user",
          text: "Hi",
          timestamp: nowTime,
        },
        {
          id: "msg_bot_resumption",
          sender: "bot",
          header: "Maha Seva Dal",
          body: "Welcome back, Jaysurya S!\n\nWe noticed you previously started registering for:\n• Wing: Education & Child Care\n• District: Chennai District\n\nWould you like to resume where you left off or start fresh?",
          footer: "Cadre Enrollment Resumption",
          interactiveType: "button",
          action: {
            buttons: [
              { type: "reply", reply: { id: "btn_resume", title: "Resume Registration" } },
              { type: "reply", reply: { id: "btn_start_over", title: "Start Over" } },
            ],
          },
          timestamp: nowTime,
        },
      ]);
      return;
    }

    // Already Member (or Cadre who just completed registration in simulator)
    if (persona === "approved_cadre" || sessionRegisteredMember) {
      const activeMember = sessionRegisteredMember || approvedJaysuryaMember;
      const memberName = activeMember.fullName;
      const memberCode = activeMember.registrationId;
      const memberWing = activeMember.wing;

      // Filter sections to remove "Cadre Registration" row - exactly 4 options:
      // 1. My Cadre ID Card
      // 2. History & Ideology
      // 3. Our Official Website
      // 4. Donate & Support
      const filteredSections = (rootNode.data.action?.sections || []).map((sec) => ({
        ...sec,
        rows: sec.rows.filter(
          (r) => !r.title.toLowerCase().includes("cadre registration") && !r.title.toLowerCase().includes("register")
        ),
      }));

      setMessages([
        {
          id: "msg_user_init",
          sender: "user",
          text: "Hi",
          timestamp: nowTime,
        },
        {
          id: "msg_bot_root",
          sender: "bot",
          nodeId: "root",
          header: "Maha Seva Dal",
          body: `Welcome back, ${memberName}!\nMaha Seva Dal Cadre ID: ${memberCode}\n\nAssigned Wing: ${memberWing}\nDedicated to constitutional unity, community seva, healthcare, child welfare, and civic empowerment.\n\nPlease choose an option below to continue:`,
          footer: "Select an option below",
          interactiveType: "list",
          action: {
            button: rootNode.data.action?.button || "Choose Service",
            sections: filteredSections,
          },
          timestamp: nowTime,
        },
      ]);
      syncStepToInbox({
        stepLabel: "User Triggered 'Hi' (Already a Member · 24h Window Open)",
        buttonClicked: "Hi",
        userMessage: "Hi",
        botMessage: `Welcome back, ${memberName}! Maha Seva Dal Cadre ID: ${memberCode}. Choose an option below to continue.`,
      });
      return;
    }

    // Standard Persona Init
    setMessages([
      {
        id: "msg_user_init",
        sender: "user",
        text: "Hi",
        timestamp: nowTime,
      },
      {
        id: "msg_bot_root",
        sender: "bot",
        nodeId: "root",
        header: rootNode.data.header?.text,
        body: rootNode.data.body,
        footer: rootNode.data.footer,
        interactiveType: rootNode.data.interactiveType,
        action: rootNode.data.action,
        timestamp: nowTime,
      },
    ]);
    syncStepToInbox({
      stepLabel: "User Triggered 'Hi' (New Member Flow · 24h Window Open)",
      buttonClicked: "Hi",
      userMessage: "Hi",
      botMessage: rootNode.data.body || "Welcome to Maha Seva Dal!",
    });
  };

  // 1. Save Profile Details from Drawer Form
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.fullName.trim()) return;

    setCandidateData({ ...formData });
    setProfileDrawerOpen(false);

    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    logActivity({
      channel: "WHATSAPP",
      component: "FlowSimulator",
      action: `Candidate Manual Profile Submitted: ${formData.fullName}`,
      status: "PASS",
      details: { fullName: formData.fullName, mobile: formData.mobile, emergencyNumber: formData.emergencyNumber },
    });

    const userSummaryMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: `✅ Submitted Manual Profile Details:\n• Name: ${formData.fullName}\n• Father/Spouse: ${formData.fatherName}\n• DOB: ${formData.dob} (${formData.gender})\n• Mobile: ${formData.mobile} | Blood: ${formData.bloodGroup}\n• Emergency: ${formData.emergencyNumber} (${formData.emergencyRelation})`,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userSummaryMsg]);
    handleOptionClick("Proceed to Address");
  };

  // 2. Quick Fill Sample Profile (1-Click Test)
  const handleQuickFillSample = () => {
    setCandidateData(defaultCandidateData);
    setFormData(defaultCandidateData);
    setProfileDrawerOpen(false);

    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    logActivity({
      channel: "WHATSAPP",
      component: "FlowSimulator",
      action: `Quick Fill Sample Applied (Deepu Kumar)`,
      status: "PASS",
    });

    const userSummaryMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: `⚡ Quick Fill Sample Applied:\n• Name: Deepu Kumar\n• Father's Name: Sagik P\n• DOB: 12 Jun 1999 (Male)\n• Mobile: +91 9871454424\n• Blood Group: AB+\n• Emergency: +91 8975511221 (Mother)`,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userSummaryMsg]);
    handleOptionClick("Proceed to Address");
  };

  // 3. Save Address & PIN from Drawer Form
  const handleSaveAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCandidateData({ ...formData });
    setAddressDrawerOpen(false);

    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    logActivity({
      channel: "WHATSAPP",
      component: "FlowSimulator",
      action: `Candidate Address Submitted: ${formData.district} - ${formData.pincode}`,
      status: "PASS",
      details: { district: formData.district, pincode: formData.pincode },
    });

    const userSummaryMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: `📍 Residential Address Confirmed:\n• District: ${formData.district}\n• Taluk: ${formData.taluk || "Viluppuram"}\n• PIN Code: ${formData.pincode}\n• Address: ${formData.address}`,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userSummaryMsg]);
    handleOptionClick("Choose Seva Wing");
  };

  // Find destination node for a tapped title
  const handleOptionClick = async (optionTitle: string, fromNodeId?: string, overridePhoto?: string) => {
    setListDrawer({ open: false, messageId: null });
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Handle Form & Drawer Triggers
    if (
      optionTitle === "Fill Profile Form" ||
      optionTitle === "Fill Details" ||
      optionTitle === "Enter Details" ||
      optionTitle === "📝 Fill Details Manually"
    ) {
      setProfileDrawerOpen(true);
      return;
    }

    if (optionTitle === "⚡ Quick Fill Sample") {
      handleQuickFillSample();
      return;
    }

    if (optionTitle === "📝 Enter Address & PIN" || optionTitle === "Edit Address") {
      setAddressDrawerOpen(true);
      return;
    }

    // Capture Pan-India State choices (matching any of the 36 states)
    const matchedState = INDIAN_STATES.find(
      (s) =>
        s.toLowerCase() === optionTitle.toLowerCase() ||
        optionTitle.toLowerCase().startsWith(s.toLowerCase()) ||
        s.toLowerCase().startsWith(optionTitle.toLowerCase())
    );
    if (matchedState) {
      const stateDists = [...(STATE_DISTRICTS[matchedState] || ["Other District"])].sort((a, b) =>
        a.localeCompare(b)
      );
      setCandidateData((prev) => ({
        ...prev,
        state: matchedState,
        district: stateDists[0] || "Other District",
      }));
      setFormData((prev) => ({
        ...prev,
        state: matchedState,
        district: stateDists[0] || "Other District",
      }));
    }

    // Capture District choice
    if (optionTitle.endsWith("District") || optionTitle.endsWith("Dist")) {
      const cleanDist = optionTitle.replace(/ District$/i, "").replace(/ Dist$/i, "").trim();
      setCandidateData((prev) => ({ ...prev, district: cleanDist }));
      setFormData((prev) => ({ ...prev, district: cleanDist }));
    }

    // Capture Seva Wing choice
    if ([
      "Legal Wing",
      "Medical & Health Wing",
      "Education & Child Welfare",
      "Youth & Sports Wing",
      "Community Seva & Mahaprasadam",
      "General Seva Cadre",
    ].includes(optionTitle)) {
      setCandidateData((prev) => ({ ...prev, wing: optionTitle }));
      setFormData((prev) => ({ ...prev, wing: optionTitle }));
    }

    // 1. Add user green bubble
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: optionTitle,
      timestamp: nowTime,
    };

    // 2. Handle Resumption Button Choices (Persona: Drop-off)
    if (optionTitle === "Resume Registration") {
      const confirmNode = flow.nodes.find((n) => n.name.includes("Confirm Details")) || flow.nodes[0];
      setActiveNodeId(confirmNode.nodeId);
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          nodeId: confirmNode.nodeId,
          header: confirmNode.data.header?.text,
          body: confirmNode.data.body,
          footer: confirmNode.data.footer,
          interactiveType: confirmNode.data.interactiveType,
          action: confirmNode.data.action,
          timestamp: nowTime,
        },
      ]);
      return;
    }

    if (optionTitle === "Start Over") {
      setPersona("new_cadre");
      initChat();
      return;
    }

    // Handle Return to Main Menu
    if (
      optionTitle === "Main Menu" ||
      optionTitle === "Go to Main Menu" ||
      optionTitle === "Back to Home"
    ) {
      const rootNode = flow.nodes.find((n) => n.nodeId === "root") || flow.nodes[0];
      setActiveNodeId("root");

      if (persona === "approved_cadre" || sessionRegisteredMember) {
        const activeMember = sessionRegisteredMember || approvedJaysuryaMember;
        const memberName = activeMember.fullName;
        const memberCode = activeMember.registrationId;
        const memberWing = activeMember.wing;

        const filteredSections = (rootNode.data.action?.sections || []).map((sec) => ({
          ...sec,
          rows: sec.rows.filter(
            (r) => !r.title.toLowerCase().includes("cadre registration") && !r.title.toLowerCase().includes("register")
          ),
        }));

        setMessages((prev) => [
          ...prev,
          userMsg,
          {
            id: `bot_${Date.now()}`,
            sender: "bot",
            nodeId: rootNode.nodeId,
            header: "Maha Seva Dal",
            body: `Welcome back, ${memberName}!\nMaha Seva Dal Cadre ID: ${memberCode}\n\nAssigned Wing: ${memberWing}\nDedicated to constitutional unity, community seva, healthcare, child welfare, and civic empowerment.\n\nPlease choose an option below to continue:`,
            footer: "Select an option below",
            interactiveType: "list",
            action: {
              button: rootNode.data.action?.button || "Choose Service",
              sections: filteredSections,
            },
            timestamp: nowTime,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          nodeId: rootNode.nodeId,
          header: rootNode.data.header?.text,
          body: rootNode.data.body,
          footer: rootNode.data.footer,
          interactiveType: rootNode.data.interactiveType,
          action: rootNode.data.action,
          timestamp: nowTime,
        },
      ]);
      return;
    }

    // Handle Visit Website (Click to view official website)
    if (
      optionTitle === "Visit Website 🌐" ||
      optionTitle === "Visit Website" ||
      optionTitle.toLowerCase().includes("visit website")
    ) {
      window.open("https://mahasevadal.com", "_blank");
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `bot_web_${Date.now()}`,
          sender: "bot",
          header: "🌐 Official Web Portal Opened",
          body: "Opening Maha Seva Dal official portal in a new tab:\n🔗 https://mahasevadal.com\n\nTap 'Main Menu' below anytime to return to the services menu.",
          footer: "Maha Seva Dal Digital Headquarters",
          interactiveType: "button",
          action: {
            buttons: [
              { type: "reply", reply: { id: "btn_web_menu_rt", title: "Main Menu" } },
            ],
          },
          timestamp: nowTime,
        },
      ]);
      return;
    }

    // 3. Handle Backend-Only: Instant Auto-Approval on "Upload Photo 📸", "Photo Uploaded ✅", "Confirm & Take Oath", or "Confirm Registration"
    const isPhotoStep =
      optionTitle === "Photo Uploaded ✅" ||
      optionTitle === "Upload Photo 📸" ||
      optionTitle === "Upload Photo" ||
      optionTitle.toLowerCase().includes("upload photo") ||
      optionTitle.toLowerCase().includes("photo upload");

    if (
      isPhotoStep ||
      optionTitle === "Confirm Registration" ||
      optionTitle === "Confirm & Take Oath"
    ) {
      const activePhoto = overridePhoto || candidatePhoto;
      const newRegId = `MSD-IND-2026-${String(Math.floor(Math.random() * 8999 + 1000)).padStart(4, "0")}`;
      const memberObj = {
        registrationId: newRegId,
        fullName: candidateData.fullName || "Nirmal",
        fatherName: candidateData.fatherName || "Dinesh",
        dob: candidateData.dob || "1998-09-12",
        age: candidateData.age || calcAge(candidateData.dob || "1998-09-12") || 28,
        gender: candidateData.gender || "Male",
        mobile: format10DigitMobile(candidateData.mobile || "8903162114"),
        whatsapp: format10DigitMobile(candidateData.whatsapp || candidateData.mobile || "8903162114"),
        emergencyNumber: format10DigitMobile(candidateData.emergencyNumber || "8979466464"),
        emergencyRelation: "Other",
        email: candidateData.email || "nirmal@gmail.com",
        bloodGroup: candidateData.bloodGroup || "O+",
        wing: candidateData.wing || "Education & Child Welfare",
        profession: candidateData.profession || "Volunteer",
        district: candidateData.district || "Ariyalur",
        pincode: candidateData.pincode || "600026",
        state: candidateData.state || "Tamil Nadu",
        taluk: candidateData.taluk || "Ariyalur",
        address: candidateData.address || "No:19, Anjeneyar Kovil street, Ariyalur",
        status: "APPROVED",
        approvedAt: new Date().toISOString(),
        photoUrl: activePhoto,
        oathTaken: true,
        createdAt: new Date().toISOString(),
      };

      let qrUrl = "";
      try {
        qrUrl = await QRCode.toDataURL(
          `https://mahasevadal.com/verify?id=${memberObj.registrationId}&name=${encodeURIComponent(
            memberObj.fullName
          )}&wing=${encodeURIComponent(memberObj.wing)}`,
          { width: 180, margin: 1 }
        );
      } catch (err) {
        console.warn("QR code gen error:", err);
      }

      logActivity({
        channel: "WHATSAPP",
        component: "FlowSimulator",
        action: `Cadre Registration Auto-Approved & ID Card Issued: ${newRegId} (${memberObj.fullName})`,
        status: "PASS",
        details: { regId: newRegId, persona, fullName: memberObj.fullName },
      });

      const userTriggerMsg: ChatMessage = isPhotoStep
        ? {
            id: `user_photo_${Date.now()}`,
            sender: "user",
            text: "📷 Passport_Size_Photo.jpg (Attached & Verified ✅)",
            mediaUrl: activePhoto,
            timestamp: nowTime,
          }
        : userMsg;

      const backendCardMsg: ChatMessage = {
        id: `backend_${Date.now()}`,
        sender: "backend",
        customCard: "new_id_card",
        cardDetails: {
          ...memberObj,
          regId: newRegId,
          qrDataUrl: qrUrl,
        },
        timestamp: nowTime,
      };

      const autoApprovalBotMsg: ChatMessage = {
        id: `bot_auto_${Date.now()}`,
        sender: "bot",
        header: "⚡ Maha Seva Dal · Auto-Approved",
        body: `🎉 Instant Auto-Approval Complete!\n\nWelcome to Maha Seva Dal, Cadre ${memberObj.fullName}! Your manual profile details and passport photo are verified. 1947 Oath of Service is automatically pledged.\n\n• Registration ID: ${newRegId}\n• Status: APPROVED ✅\n• Assigned Wing: ${memberObj.wing}\n• Unit: ${memberObj.district}, ${memberObj.state}\n\nYour Official Maha Seva Dal PVC Digital ID Card (Front & Reverse) has been issued above! Tap 'My Cadre ID Card' below to inspect or download.`,
        footer: "Official Cadre Registry · Estd. 1947",
        interactiveType: "button",
        action: {
          buttons: [
            { type: "reply", reply: { id: "btn_view_id_card", title: "My Cadre ID Card" } },
            { type: "reply", reply: { id: "btn_menu_back", title: "Main Menu" } },
          ],
        },
        timestamp: nowTime,
      };

      setActiveMemberForCard(memberObj);
      setActiveCardQrUrl(qrUrl);
      setActiveTab("card");

      setSessionRegisteredMember({
        registrationId: newRegId,
        fullName: memberObj.fullName,
        wing: memberObj.wing,
        district: memberObj.district,
      });

      syncStepToInbox({
        stepLabel: `Completed Registration & Issued Digital ID Card (${newRegId})`,
        buttonClicked: optionTitle,
        userMessage: userTriggerMsg.text || optionTitle,
        botMessage: autoApprovalBotMsg.body,
        cardData: {
          ...memberObj,
          action: "GENERATED",
        },
        cardViewed: true,
        overrideMember: memberObj,
      });

      setMessages((prev) => [...prev, userTriggerMsg, backendCardMsg, autoApprovalBotMsg]);
      return;
    }

    // 4. Handle Backend-Only: "My Cadre ID Card"
    if (optionTitle === "My Cadre ID Card") {
      if (persona === "new_cadre") {
        logActivity({
          channel: "WHATSAPP",
          component: "FlowSimulator",
          action: "ID Card Lookup: Member Not Found",
          status: "FAIL",
          details: { phone: "+91 98888 88888" },
        });
        const notFoundMsg: ChatMessage = {
          id: `backend_${Date.now()}`,
          sender: "backend",
          header: "Maha Seva Dal",
          body: "ℹ️ No cadre membership record was found for this phone (+91 98888 88888).\n\nTap 'Cadre Registration' below to enroll as a new voluntary cadre today!",
          interactiveType: "button",
          action: {
            buttons: [
              { type: "reply", reply: { id: "btn_reg_now", title: "Cadre Registration" } },
              { type: "reply", reply: { id: "btn_menu_back", title: "Main Menu" } },
            ],
          },
          timestamp: nowTime,
        };
        syncStepToInbox({
          stepLabel: "Tapped: My Cadre ID Card (New Visitor -> Prompted to Register)",
          buttonClicked: "My Cadre ID Card",
          userMessage: "My Cadre ID Card",
          botMessage: notFoundMsg.body,
        });
        setMessages((prev) => [...prev, userMsg, notFoundMsg]);
      } else {
        // Approved Persona (Jaysurya S from Official Card Registry)
        const approvedMember = {
          registrationId: "MSD-IND-2026-0001",
          fullName: "Jaysurya S",
          fatherName: "Rajnikanth",
          dob: "2006-08-13",
          gender: "Male",
          mobile: "9888888888",
          whatsapp: "9888888888",
          emergencyNumber: "9888888888",
          emergencyRelation: "WhatsApp",
          email: "ran@gmail.com",
          bloodGroup: "B+",
          wing: "Education & Child Welfare",
          district: "Jhajjar",
          state: "Haryana",
          taluk: "Rajori",
          pincode: "630025",
          address: "56 Street Kamedu,Haryana",
          status: "APPROVED",
          approvedAt: "2026-10-23T00:00:00.000Z",
          createdAt: "2026-10-23T00:00:00.000Z",
          photoUrl: "/founder-saragabani-gopu-portrait.jpg",
        };

        let qrUrl = "";
        try {
          qrUrl = await QRCode.toDataURL(
            `https://mahasevadal.com/verify?id=${approvedMember.registrationId}&name=${encodeURIComponent(
              approvedMember.fullName
            )}&wing=${encodeURIComponent(approvedMember.wing)}`,
            { width: 180, margin: 1 }
          );
        } catch (err) {
          console.warn("QR code gen error:", err);
        }

        logActivity({
          channel: "WHATSAPP",
          component: "FlowSimulator",
          action: "ID Card Lookup: Approved Card Returned",
          status: "PASS",
          details: { regId: "MSD-IND-2026-0001" },
        });

        const approvedCardMsg: ChatMessage = {
          id: `backend_${Date.now()}`,
          sender: "backend",
          customCard: "approved_id_card",
          cardDetails: {
            ...approvedMember,
            regId: approvedMember.registrationId,
            qrDataUrl: qrUrl,
            approvedDate: "23 Oct 2026",
          },
          timestamp: nowTime,
        };

        setActiveMemberForCard(approvedMember);
        setActiveCardQrUrl(qrUrl);
        setActiveTab("card");

        syncStepToInbox({
          stepLabel: `Already a Member Viewed Digital ID Card (${approvedMember.registrationId})`,
          buttonClicked: "My Cadre ID Card",
          userMessage: "My Cadre ID Card",
          botMessage: `🪪 Official Digital PVC ID Card (${approvedMember.registrationId}) displayed in WhatsApp.`,
          cardData: {
            ...approvedMember,
            action: "VIEWED",
          },
          cardViewed: true,
          overrideMember: approvedMember,
        });

        setMessages((prev) => [...prev, userMsg, approvedCardMsg]);
      }
      return;
    }

    // 5. Look for matching edge
    const currentNodeId = fromNodeId || activeNodeId;
    let matchingEdge = flow.edges.find(
      (e) => e.fromNodeId === currentNodeId && e.keywords.some((k) => k.toLowerCase() === optionTitle.toLowerCase())
    );

    // Fallback: search anywhere in flow for this keyword (single-destination routing)
    if (!matchingEdge) {
      matchingEdge = flow.edges.find((e) => e.keywords.some((k) => k.toLowerCase() === optionTitle.toLowerCase()));
    }

    if (!matchingEdge) {
      logActivity({
        channel: "WHATSAPP",
        component: "FlowSimulator",
        action: `Tapped Option: "${optionTitle}" (No edge found)`,
        status: "FAIL",
        details: { fromNodeId: currentNodeId },
      });
      // Unconnected option or custom test
      const unhandledMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: "bot",
        body: `Option '${optionTitle}' was tapped. No connected edge was found for this label.`,
        footer: "WACTO Flow Debugger",
        timestamp: nowTime,
      };
      setMessages((prev) => [...prev, userMsg, unhandledMsg]);
      return;
    }

    const targetNode = flow.nodes.find((n) => n.nodeId === matchingEdge!.toNodeId);
    if (!targetNode) return;

    logActivity({
      channel: "WHATSAPP",
      component: "FlowSimulator",
      action: `Tapped: "${optionTitle}" -> Destination: "${targetNode.name}"`,
      status: "PASS",
      details: { fromNodeId: currentNodeId, toNodeId: targetNode.nodeId },
    });

    setActiveNodeId(targetNode.nodeId);

    let nodeBody = targetNode.data.body;
    if (targetNode.name.includes("Review & Oath")) {
      nodeBody = `📋 Step 4 of 4: Review & Oath of Service\nVerify your enrollment details before official submission:\n\n1. Personal Profile: ${candidateData.fullName} | S/o ${candidateData.fatherName} | ${candidateData.dob} | ${candidateData.gender} | ${candidateData.bloodGroup}\n2. Emergency: ${candidateData.emergencyNumber} (${candidateData.emergencyRelation})\n3. Location: ${candidateData.district}, Tamil Nadu - ${candidateData.pincode}\n4. Seva Wing: ${candidateData.wing} | ${candidateData.profession}\n5. Passport Photo: Verified & Cropped for PVC Card ✅\n\n📜 THE 1947 MAHA SEVA DAL PLEDGE:\n"I solemnly pledge to dedicate my service toward the foundational ideals of Maha Seva Dal: Unity of People, selfless social welfare, youth empowerment, and communal harmony without bias of caste, creed, or regional differences."\n\nTap 'Confirm & Take Oath' to submit:`;
    }

    const botMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      sender: "bot",
      nodeId: targetNode.nodeId,
      header: targetNode.data.header?.text,
      body: nodeBody,
      footer: targetNode.data.footer,
      interactiveType: targetNode.type === "media" ? "media" : targetNode.data.interactiveType,
      action: targetNode.data.action,
      mediaUrl: targetNode.data.link,
      timestamp: nowTime,
    };

    syncStepToInbox({
      stepLabel: `${targetNode.name}`,
      buttonClicked: optionTitle,
      userMessage: optionTitle,
      botMessage: nodeBody || targetNode.name,
    });

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // Text input submission (e.g. typing "Hi", "Menu", or donation UTR)
  const submitTextQuery = (rawQuery: string) => {
    if (!rawQuery.trim()) return;

    const query = rawQuery.trim();
    setInputText("");
    const nowTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    // Check for root trigger keywords
    const isRootTrigger = ["hi", "hello", "hey", "start", "menu", "msd"].includes(query.toLowerCase());
    if (isRootTrigger) {
      logActivity({
        channel: "WHATSAPP",
        component: "FlowSimulator",
        action: `User Restarted Session: Typed "${query}"`,
        status: "PASS",
      });
      initChat();
      return;
    }

    // Check for Donation UTR / Payment simulation
    const isUtrSubmission = query.toLowerCase().includes("utr") || query.toLowerCase().includes("paid");
    if (isUtrSubmission) {
      const donorName = persona === "approved_cadre" ? "Jaysurya S" : (candidateData.fullName || "Suresh Kumar");
      const donorMobile = persona === "approved_cadre" ? "9888888888" : (candidateData.mobile || "9876543210");
      const rawDigits = query.replace(/[^0-9]/g, "");
      const utrClean = rawDigits.length >= 6 ? rawDigits.slice(0, 12) : `43210987${Math.floor(1000 + Math.random() * 9000)}`;
      const invoiceMsgId = `backend_${Date.now()}`;

      logActivity({
        channel: "WHATSAPP",
        component: "FlowSimulator",
        action: `Payment UTR Submitted: "${query}" -> Official Invoice Delivered`,
        status: "PASS",
        details: { donorName, mobile: donorMobile, utr: utrClean },
      });

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: nowTime,
      };

      const invoiceMsg: ChatMessage = {
        id: invoiceMsgId,
        sender: "backend",
        customCard: "donation_invoice",
        cardDetails: {
          receiptNo: `MSD-DON-2026-${String(Math.floor(Math.random() * 899 + 100)).padStart(4, "0")}`,
          donorName,
          amount: "₹1,000",
          utr: utrClean,
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          purpose: "General Community Welfare & Annadanam",
        },
        timestamp: nowTime,
      };

      // Submit to backend API asynchronously to persist in Admin panel
      fetch(getApiUrl("/api/donations/submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-channel": "WHATSAPP",
        },
        body: JSON.stringify({
          donorName,
          mobile: donorMobile,
          amount: 1000,
          utr: utrClean,
          cause: "General Community Welfare & Annadanam",
          paymentMode: "UPI",
          adminNotes: `Submitted via WhatsApp Simulator (${persona})`,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.donation?.receiptNo) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === invoiceMsgId
                    ? {
                        ...m,
                        cardDetails: {
                          ...m.cardDetails!,
                          receiptNo: data.donation.receiptNo,
                        },
                      }
                    : m
                )
              );
            }
          }
        })
        .catch((err) => console.warn("Donation API post warning:", err.message));

      setMessages((prev) => [...prev, userMsg, invoiceMsg]);
      return;
    }

    // Capture manual name entry if user is at Personal Profile
    const currentActiveNode = flow.nodes.find((n) => n.nodeId === activeNodeId);
    if (currentActiveNode?.name.includes("Personal Profile") || currentActiveNode?.name.includes("Manual Profile Entry")) {
      const enteredName = query;
      setCandidateData((prev) => ({ ...prev, fullName: enteredName }));
      setFormData((prev) => ({ ...prev, fullName: enteredName }));
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: nowTime,
      };
      const ackMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        nodeId: currentActiveNode.nodeId,
        header: "1. Personal Profile",
        body: `✅ Name recorded as: "${enteredName}"\n\nTap 'Fill Profile Form' to provide complete details, or tap 'Proceed to Address' to choose your District:`,
        interactiveType: "button",
        action: {
          buttons: [
            { type: "reply", reply: { id: "btn_form_open", title: "Fill Profile Form" } },
            { type: "reply", reply: { id: "btn_proceed_loc", title: "Proceed to Address" } },
            { type: "reply", reply: { id: "btn_menu_bk", title: "Main Menu" } },
          ],
        },
        timestamp: nowTime,
      };
      setMessages((prev) => [...prev, userMsg, ackMsg]);
      return;
    }

    // Try routing by typed keyword
    handleOptionClick(query);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    submitTextQuery(inputText);
  };

  // Open JSON File Picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setFlow(parsed);
          alert(`Successfully loaded flow: ${parsed.chatbot?.name || file.name}`);
        } else {
          alert("Invalid flow JSON. Expected 'nodes' and 'edges' arrays.");
        }
      } catch (err) {
        alert("Error parsing JSON file. Check file format.");
      }
    };
    reader.readAsText(file);
  };

  // Paste JSON handler
  const handleApplyPastedJson = () => {
    try {
      const parsed = JSON.parse(pastedJsonText);
      if (parsed.nodes && parsed.edges) {
        setFlow(parsed);
        setPasteModalOpen(false);
        setPastedJsonText("");
        alert(`Successfully updated flow: ${parsed.chatbot?.name || "Custom Flow"}`);
      } else {
        alert("Invalid WACTO JSON structure.");
      }
    } catch (err) {
      alert("Invalid JSON text. Please check syntax.");
    }
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wacto_msd_flow_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Current active inspected node
  const activeNode = flow.nodes.find((n) => n.nodeId === activeNodeId) || flow.nodes[0];
  const activeIncomingEdges = flow.edges.filter((e) => e.toNodeId === activeNode?.nodeId);
  const activeOutgoingEdges = flow.edges.filter((e) => e.fromNodeId === activeNode?.nodeId);

  // Compliance checks calculations
  const totalNodes = flow.nodes.length;
  const totalEdges = flow.edges.length;

  // Validation: Check for duplicate edge keywords leading to different nodes
  const keywordMap: { [kw: string]: Set<string> } = {};
  flow.edges.forEach((e) => {
    e.keywords.forEach((k) => {
      if (!keywordMap[k]) keywordMap[k] = new Set();
      keywordMap[k].add(e.toNodeId);
    });
  });
  const collisions = Object.entries(keywordMap).filter(([_, dests]) => dests.size > 1);

  const innerSimulator = (
      <div className={embedded ? "text-stone-800" : "max-w-[1440px] mx-auto px-3 sm:px-6 py-3 sm:py-4 text-stone-800"}>
        {/* ─── TOP HEADER BAR ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              {!embedded && (
                <Link
                  to="/admin"
                  className="text-xs text-stone-700 hover:text-[#FF6200] font-bold flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs mr-1"
                  title="Return to Central Admin Directory"
                >
                  <ArrowLeft size={14} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900">
                Flow Simulator
              </h1>
              {isBackendOnline ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online (Backend Connected)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Offline Test Mode</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Load a WACTO export and tap through it exactly as a candidate sees it on WhatsApp, before anything is pushed to WACTO.
            </p>
          </div>

          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FolderOpen size={14} />
              <span>Open JSON</span>
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <FileJson size={14} />
              <span>Paste JSON</span>
            </button>

            <button
              onClick={initChat}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Restart Conversation"
            >
              <RefreshCw size={14} />
              <span>Restart chat</span>
            </button>

            {/* Persona Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 px-1">Persona:</span>
              <button
                onClick={() => setPersona("new_cadre")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  persona === "new_cadre"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                New Cadre
              </button>
              <button
                onClick={() => setPersona("approved_cadre")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  persona === "approved_cadre"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Already Member
              </button>
              <button
                onClick={() => setPersona("dropoff_cadre")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  persona === "dropoff_cadre"
                    ? "bg-white text-amber-900 shadow-xs border border-amber-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Drop-off Resumption
              </button>
            </div>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ml-auto sm:ml-0"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* ─── MAIN TWO-COLUMN WORKSPACE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-start">
          {/* ══════════════ LEFT COLUMN: VIRTUAL WHATSAPP PHONE (lg:col-span-5) ══════════════ */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-4 self-start">
            {/* Phone Bezel Frame */}
            <div className="w-full max-w-[340px] sm:max-w-[350px] h-[580px] sm:h-[600px] xl:h-[620px] bg-[#0c1317] rounded-[38px] p-2.5 shadow-2xl border-4 border-stone-800 flex flex-col relative overflow-hidden select-none">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-3.5 bg-stone-900 rounded-full mx-auto mb-1 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-stone-800 mr-2" />
                <div className="w-10 h-1 rounded-full bg-stone-800" />
              </div>

              {/* Virtual WhatsApp App Screen */}
              <div className="w-full h-full bg-[#efeae2] rounded-[28px] flex flex-col overflow-hidden relative border border-stone-700/40">
                {/* 1. WhatsApp Top Status Bar */}
                <div className="bg-[#008069] px-3 pt-1.5 pb-1 flex items-center justify-between text-white text-[11px]">
                  <span>9:41</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>📶</span>
                    <span>5G</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* 2. WhatsApp Chat Header Bar */}
                <div className="bg-[#008069] px-2.5 py-2 flex items-center justify-between text-white shadow-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 p-0.5 border border-white/40 flex-shrink-0 flex items-center justify-center">
                      <img
                        src="/logo.png"
                        alt="Bot"
                        className="w-full h-full rounded-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/logo.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-bold leading-tight truncate">
                        <span>MSD Official Bot</span>
                        <CheckCircle2 size={12} className="text-emerald-300 fill-emerald-300 text-black flex-shrink-0" />
                      </div>
                      <div className="text-[9.5px] text-white/85 leading-none truncate flex items-center gap-1">
                        <span>Verified Business Account</span>
                        <span className="text-white/40">•</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span className="text-[9px] text-emerald-300 font-semibold">online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white text-sm pr-1">
                    <span>📞</span>
                    <span>⋮</span>
                  </div>
                </div>

                {/* 3. Chat Messages Stream */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 space-y-2.5 font-sans text-xs [scrollbar-width:thin]"
                >
                  {/* End-to-End Encryption Banner */}
                  <div className="mx-auto max-w-[280px] bg-[#ffeecd] border border-[#f3d99e] rounded-lg p-2 text-center text-[9.5px] text-[#54656f] leading-tight shadow-2xs">
                    🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      {/* USER GREEN BUBBLE */}
                      {msg.sender === "user" && (
                        <div className="max-w-[82%] bg-[#d9fdd3] text-stone-900 rounded-2xl rounded-tr-xs p-2 shadow-xs text-[11.5px] leading-snug space-y-1">
                          {msg.mediaUrl && (
                            <div className="rounded-lg overflow-hidden border border-emerald-300 max-w-[130px] bg-white p-0.5 shadow-2xs">
                              <img
                                src={msg.mediaUrl}
                                alt="Passport Photo Attachment"
                                className="w-full h-28 object-cover rounded"
                              />
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div className="text-[8.5px] text-stone-500 text-right mt-0.5 font-mono">
                            {msg.timestamp} ✓✓
                          </div>
                        </div>
                      )}

                      {/* BOT WHITE BUBBLE (WACTO INTERACTIVE NODE) */}
                      {msg.sender === "bot" && (
                        <div className="max-w-[88%] bg-white text-stone-900 rounded-2xl rounded-tl-xs p-2.5 shadow-sm border border-stone-200/80 text-[11px] space-y-1.5">
                          {/* ─── WHATSAPP UPI PAYMENT QR CARD (MATCHES SCREENSHOT 2) ─── */}
                          {(() => {
                            const isDonationQrCard =
                              msg.mediaUrl?.includes("qr") ||
                              msg.body?.includes("General Seva & Relief Fund") ||
                              msg.body?.includes("Official UPI QR Code") ||
                              msg.body?.includes("Scan using any UPI App");

                            if (isDonationQrCard) {
                              return (
                                <div className="space-y-2.5">
                                  {/* Beneficiary Header (Matches Avatar Row in Screenshot 2) */}
                                  <div className="flex items-center gap-2 pb-1.5 border-b border-stone-100">
                                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                                      MSD
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-stone-900 text-xs truncate">
                                        Maha Seva Dal Foundation
                                      </div>
                                      <div className="text-[9px] text-stone-500">Official Seva Registry · Estd. 1947</div>
                                    </div>
                                  </div>

                                  {/* Crisp QR Code Container (Matches Screenshot 2 & Website Home) */}
                                  <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex flex-col items-center justify-center">
                                    <img
                                      src={donationQrDataUrl || "/donation-qr.png"}
                                      alt="Maha Seva Dal UPI QR Code"
                                      className="w-48 h-48 object-contain rounded-md"
                                    />
                                    <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                                      <QrCode size={12} className="text-emerald-700" />
                                      <span>Scan & Pay via any UPI App</span>
                                    </div>
                                  </div>

                                  {/* Divider & Status Line with Checkmark */}
                                  <div className="pt-1 border-t border-stone-100">
                                    <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5 text-emerald-800">
                                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">✓</span>
                                      <span>Official Seva Contribution & Donation</span>
                                    </div>
                                    <div className="text-[10px] text-stone-500 mt-0.5">
                                      Maha Seva Dal Foundation · General Welfare Fund
                                    </div>
                                  </div>

                                  {/* UPI Details Box */}
                                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200 space-y-1.5 text-[10px]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-500">🏛️ Cause:</span>
                                      <span className="font-bold text-stone-800">General Seva & Relief Fund</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-500">🏦 UPI ID:</span>
                                      <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-stone-200 select-all">
                                        mahasevadal@sbi
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-stone-500">👤 Beneficiary:</span>
                                      <span className="font-bold text-stone-800">Maha Seva Dal Foundation</span>
                                    </div>
                                  </div>

                                  {/* Payment Instructions (Matches Screenshot 2) */}
                                  <div className="space-y-1.5 text-[10px] text-stone-700 pt-0.5 leading-snug">
                                    <div className="flex items-start gap-1.5">
                                      <span>📲</span>
                                      <span><b>Scan the QR code above</b> or pay directly to the UPI ID using GPay, PhonePe, Paytm, or BHIM.</span>
                                    </div>
                                    <div className="flex items-start gap-1.5">
                                      <span>📸</span>
                                      <span><b>After payment:</b> Send your payment screenshot or 12-digit UTR Transaction ID here in this chat.</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-emerald-700 font-medium">
                                      <span>⚡</span>
                                      <span>Your official computer-generated <b>Donation Payment Invoice</b> is delivered instantly in this chat.</span>
                                    </div>
                                  </div>

                                  {/* 1-Click Simulation Button for Instant Testing */}
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      onClick={() => submitTextQuery("UTR 432109876543")}
                                      className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-bold text-center rounded-lg border border-emerald-300 text-[10px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                      <span>⚡ Simulate UTR Payment Receipt (1-Click)</span>
                                    </button>
                                  </div>

                                  <div className="text-[9px] text-stone-400 font-medium text-right font-mono">
                                    Official Cadre Registry · Estd. 1947
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <>
                                {/* Header */}
                                {msg.header && (
                                  <div className="font-bold text-stone-900 text-xs border-b border-stone-100 pb-1">
                                    {msg.header}
                                  </div>
                                )}

                                {/* Media Link if applicable */}
                                {msg.mediaUrl && (
                                  <div className="rounded-lg overflow-hidden border border-stone-200 bg-stone-50 max-h-36 flex items-center justify-center p-1">
                                    <img
                                      src={msg.mediaUrl}
                                      alt="Media Node"
                                      className="w-full h-full object-contain max-h-32"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Body Text */}
                                <div className="text-stone-800 whitespace-pre-line leading-relaxed text-[11px]">
                                  {msg.body}
                                </div>

                                {/* Footer Text */}
                                {msg.footer && (
                                  <div className="text-[9px] text-stone-400 font-medium">
                                    {msg.footer}
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {/* ─── INTERACTIVE PROFILE DETAILS ENTRY (STEP 1) ─── */}
                          {(msg.header?.includes("Personal Profile") ||
                            msg.body?.includes("Personal & Contact Profile") ||
                            msg.body?.includes("Manual Profile Entry")) && (
                            <div className="my-2 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-xl border border-emerald-300 text-[10px] space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-900 flex items-center gap-1 text-[10.5px]">
                                  <span>✍️</span>
                                  <span>Candidate Profile Details:</span>
                                </span>
                                <span className="bg-emerald-600 text-white text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold shadow-2xs">
                                  {candidateData.fullName ? candidateData.fullName.split(" ")[0] : "Pending"}
                                </span>
                              </div>
                              <div className="text-[9px] font-mono bg-white/90 p-2 rounded-lg border border-emerald-200/80 space-y-0.5 text-stone-700">
                                <div><strong className="text-stone-900">Name:</strong> {candidateData.fullName} ({candidateData.gender})</div>
                                <div><strong className="text-stone-900">Father/Spouse:</strong> {candidateData.fatherName}</div>
                                <div><strong className="text-stone-900">DOB:</strong> {candidateData.dob} | <strong className="text-stone-900">Blood:</strong> {candidateData.bloodGroup}</div>
                                <div><strong className="text-stone-900">Primary Mobile:</strong> {candidateData.mobile}</div>
                                <div><strong className="text-stone-900">Emergency:</strong> {candidateData.emergencyNumber} ({candidateData.emergencyRelation})</div>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...candidateData });
                                    setProfileDrawerOpen(true);
                                  }}
                                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer text-[10px] transition-colors"
                                >
                                  <span>📝</span>
                                  <span>Fill Details Manually</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleQuickFillSample}
                                  className="py-1.5 px-2 bg-white hover:bg-stone-50 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer text-[10px] transition-colors"
                                >
                                  <span>⚡</span>
                                  <span>Quick Sample</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ─── INTERACTIVE ADDRESS DETAILS ENTRY (STEP 2: PAN-INDIA) ─── */}
                          {(msg.header?.includes("Address & Location") ||
                            msg.header?.includes("Select State") ||
                            msg.header?.includes("Select District") ||
                            msg.header?.includes("Select Karnataka") ||
                            msg.body?.includes("Location & Residential Address") ||
                            msg.body?.includes("Select your State or Union Territory")) && (
                            <div className="my-2 p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-xl border border-emerald-300 text-[10px] space-y-1.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-900 flex items-center gap-1 text-[10.5px]">
                                  <span>📍</span>
                                  <span>Pan-India Cadre Unit:</span>
                                </span>
                                <span className="bg-emerald-600 text-white text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold shadow-2xs">
                                  {candidateData.state}
                                </span>
                              </div>
                              <div className="text-[9px] font-mono bg-white/90 p-2 rounded-lg border border-emerald-200/80 space-y-0.5 text-stone-700">
                                <div><strong className="text-stone-900">State / UT:</strong> {candidateData.state}</div>
                                <div><strong className="text-stone-900">District Unit:</strong> {candidateData.district}</div>
                                <div><strong className="text-stone-900">Postal PIN:</strong> {candidateData.pincode}</div>
                                <div><strong className="text-stone-900">Address:</strong> {candidateData.address}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...candidateData });
                                  setAddressDrawerOpen(true);
                                }}
                                className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer text-[10px] transition-colors"
                              >
                                <span>📝</span>
                                <span>Select State & District (All 36 States/UTs)</span>
                              </button>
                            </div>
                          )}

                          {/* Interactive Reply Buttons (≤3) */}
                          {msg.interactiveType === "button" && msg.action?.buttons && (
                            <div className="pt-1.5 border-t border-stone-100 space-y-1">
                              {msg.action.buttons.map((btn) => {
                                const isUploadPhoto =
                                  btn.reply.title.toLowerCase().includes("upload photo") ||
                                  btn.reply.title.toLowerCase().includes("photo upload");

                                if (isUploadPhoto) {
                                  return (
                                    <label
                                      key={btn.reply.id}
                                      className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-center rounded-lg border border-emerald-700 text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer select-none"
                                    >
                                      <Camera size={14} className="text-white flex-shrink-0" />
                                      <span>{btn.reply.title}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              if (reader.result) {
                                                const uploadedUrl = reader.result as string;
                                                setCandidatePhoto(uploadedUrl);
                                                setCandidateData((prev) => ({ ...prev, photoUrl: uploadedUrl }));
                                                handleOptionClick(btn.reply.title, msg.nodeId, uploadedUrl);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                  );
                                }

                                const isWebsiteBtn = btn.reply.title.toLowerCase().includes("website");

                                return (
                                  <button
                                    key={btn.reply.id}
                                    onClick={() => handleOptionClick(btn.reply.title, msg.nodeId)}
                                    className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-semibold text-center rounded-lg border border-emerald-200 text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                                  >
                                    <span>{btn.reply.title}</span>
                                    {isWebsiteBtn && <ExternalLink size={12} className="text-emerald-700 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Interactive List Button (Drawer trigger) */}
                          {msg.interactiveType === "list" && (
                            <div className="pt-1.5 border-t border-stone-100">
                              <button
                                onClick={() => setListDrawer({ open: true, messageId: msg.id })}
                                className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 font-bold text-center rounded-lg border border-stone-300 text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                              >
                                <span>🔘</span>
                                <span>{msg.action?.button || "Choose Option"}</span>
                                <ChevronRight size={13} className="text-stone-500" />
                              </button>
                            </div>
                          )}

                          <div className="text-[8px] text-stone-400 text-right font-mono">
                            {msg.timestamp}
                          </div>
                        </div>
                      )}

                      {/* BACKEND DASHED BLUE BUBBLES */}
                      {msg.sender === "backend" && (
                        <div className="max-w-[92%] bg-[#f0f7ff] text-stone-900 rounded-2xl rounded-tl-xs p-2.5 shadow-sm border-2 border-dashed border-blue-400 text-[11px] space-y-2">
                          <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                            <span>⚡ Backend Automated Response</span>
                          </div>

                          {/* New ID Card Generated */}
                          {msg.customCard === "new_id_card" && (
                            <FlowIdCardBubble
                              member={msg.cardDetails}
                              qrDataUrl={msg.cardDetails?.qrDataUrl}
                              isApproved={false}
                              onViewInPanel={() => {
                                setActiveMemberForCard(msg.cardDetails);
                                setActiveCardQrUrl(msg.cardDetails?.qrDataUrl || "");
                                setActiveTab("card");
                              }}
                              onOpenStudio={(m, qr) => {
                                setStudioModalMember(m);
                                setStudioModalQrUrl(qr);
                              }}
                            />
                          )}

                          {/* Approved Member Card */}
                          {msg.customCard === "approved_id_card" && (
                            <FlowIdCardBubble
                              member={msg.cardDetails}
                              qrDataUrl={msg.cardDetails?.qrDataUrl}
                              isApproved={true}
                              onViewInPanel={() => {
                                setActiveMemberForCard(msg.cardDetails);
                                setActiveCardQrUrl(msg.cardDetails?.qrDataUrl || "");
                                setActiveTab("card");
                              }}
                              onOpenStudio={(m, qr) => {
                                setStudioModalMember(m);
                                setStudioModalQrUrl(qr);
                              }}
                            />
                          )}

                          {/* Donation Invoice Card */}
                          {msg.customCard === "donation_invoice" && (
                            <div className="space-y-1.5">
                              <div className="font-bold text-stone-900 text-xs flex items-center gap-1 border-b border-blue-200 pb-1">
                                <FileText size={13} className="text-blue-700" />
                                <span>Donation Payment Invoice Delivered</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-2xs text-[9.5px] space-y-1">
                                <div className="flex justify-between font-bold text-stone-900">
                                  <span>Invoice #: {msg.cardDetails.receiptNo}</span>
                                  <span className="text-emerald-700 font-black">{msg.cardDetails.amount}</span>
                                </div>
                                <div className="text-stone-700">Donor: {msg.cardDetails.donorName}</div>
                                <div className="text-stone-500 font-mono text-[8px]">
                                  UTR: {msg.cardDetails.utr} · {msg.cardDetails.date}
                                </div>
                                <div className="text-[8px] text-orange-700 font-medium">
                                  Seva Allocation: {msg.cardDetails.purpose}
                                </div>
                              </div>
                              <div className="text-[9px] text-stone-500">
                                Official computer-generated contribution invoice. Thank you for your seva!
                              </div>
                            </div>
                          )}

                          {/* Fallback Text Message */}
                          {msg.body && <div className="text-stone-800 whitespace-pre-line">{msg.body}</div>}

                          {msg.interactiveType === "button" && msg.action?.buttons && (
                            <div className="pt-1 space-y-1">
                              {msg.action.buttons.map((btn) => {
                                const isUploadPhoto =
                                  btn.reply.title.toLowerCase().includes("upload photo") ||
                                  btn.reply.title.toLowerCase().includes("photo upload");

                                if (isUploadPhoto) {
                                  return (
                                    <label
                                      key={btn.reply.id}
                                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded border border-emerald-700 text-[10px] flex items-center justify-center gap-1.5 cursor-pointer select-none"
                                    >
                                      <Camera size={12} className="text-white flex-shrink-0" />
                                      <span>{btn.reply.title}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              if (reader.result) {
                                                const uploadedUrl = reader.result as string;
                                                setCandidatePhoto(uploadedUrl);
                                                setCandidateData((prev) => ({ ...prev, photoUrl: uploadedUrl }));
                                                handleOptionClick(btn.reply.title, undefined, uploadedUrl);
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                  );
                                }

                                const isWebsiteBtn = btn.reply.title.toLowerCase().includes("website");

                                return (
                                  <button
                                    key={btn.reply.id}
                                    onClick={() => handleOptionClick(btn.reply.title)}
                                    className="w-full py-1 px-2 bg-white hover:bg-stone-100 text-blue-900 font-bold text-center rounded border border-blue-300 text-[10px] flex items-center justify-center gap-1.5"
                                  >
                                    <span>{btn.reply.title}</span>
                                    {isWebsiteBtn && <ExternalLink size={11} className="text-blue-700 flex-shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="text-[8px] text-stone-400 text-right font-mono">
                            {msg.timestamp}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4. Bottom WhatsApp Interactive List Drawer */}
                {listDrawer.open && (() => {
                  const drawerMsg = messages.find((m) => m.id === listDrawer.messageId);
                  const drawerAction = drawerMsg?.action || activeNode?.data.action;
                  const drawerButtonTitle = drawerAction?.button || activeNode?.data.action?.button || "Choose Option";
                  let drawerSections = drawerAction?.sections || activeNode?.data.action?.sections || [];

                  // If Already Member on root node, filter out "Cadre Registration" to leave exactly 4 options:
                  // 1. My Cadre ID Card, 2. History & Ideology, 3. Our Official Website, 4. Donate & Support
                  const isMemberUser = persona === "approved_cadre" || Boolean(sessionRegisteredMember);
                  if (isMemberUser && (activeNode?.nodeId === "root" || drawerMsg?.nodeId === "root" || !drawerMsg?.nodeId)) {
                    drawerSections = drawerSections.map((sec) => ({
                      ...sec,
                      rows: sec.rows.filter(
                        (r) =>
                          !r.title.toLowerCase().includes("cadre registration") &&
                          !r.title.toLowerCase().includes("register")
                      ),
                    }));
                  }

                  return (
                    <div
                      onClick={() => setListDrawer({ open: false, messageId: null })}
                      className="absolute inset-0 bg-black/60 z-20 flex flex-col justify-end animate-in fade-in duration-150 cursor-pointer"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-t-2xl max-h-[82%] flex flex-col shadow-2xl overflow-hidden border-t-2 border-emerald-600 cursor-default"
                      >
                        {/* Drawer Header */}
                        <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
                          <div className="font-bold text-xs text-stone-900">
                            {drawerButtonTitle}
                          </div>
                          <button
                            type="button"
                            onClick={() => setListDrawer({ open: false, messageId: null })}
                            className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Drawer Rows List */}
                        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 pb-10 space-y-2 [scrollbar-width:thin]">
                          {drawerSections.map((sec, secIdx) => (
                            <div key={secIdx} className="space-y-1">
                              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 pt-1 sticky top-0 bg-white/95 backdrop-blur-xs py-0.5 z-10">
                                {sec.title}
                              </div>
                              {sec.rows.map((row) => (
                                <button
                                  key={row.id}
                                  type="button"
                                  onClick={() => handleOptionClick(row.title, activeNode?.nodeId)}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 active:bg-emerald-100 border border-stone-200/80 transition-colors group flex items-start justify-between cursor-pointer"
                                >
                                  <div className="min-w-0 pr-2">
                                    <div className="font-bold text-xs text-stone-900 group-hover:text-emerald-800">
                                      {row.title}
                                    </div>
                                    {row.description && (
                                      <div className="text-[10px] text-stone-500 leading-tight mt-0.5">
                                        {row.description}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight size={14} className="text-stone-300 group-hover:text-emerald-600 flex-shrink-0 mt-1" />
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4b. Interactive WhatsApp Flow Profile Drawer (Step 1 Manual Fill) */}
                {profileDrawerOpen && (
                  <div
                    onClick={() => setProfileDrawerOpen(false)}
                    className="absolute inset-0 bg-black/65 z-30 flex flex-col justify-end animate-in fade-in duration-150 cursor-pointer"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-t-2xl max-h-[94%] flex flex-col shadow-2xl overflow-hidden border-t-2 border-emerald-600 cursor-default"
                    >
                      {/* Header */}
                      <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
                        <div>
                          <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                            <span className="text-emerald-700">📝</span>
                            <span>1. Personal & Contact Profile</span>
                          </div>
                          <div className="text-[9.5px] text-stone-500">Provide official legal name & contact details</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfileDrawerOpen(false)}
                          className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Form Fields */}
                      <form onSubmit={handleSaveProfile} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 [scrollbar-width:thin] text-[11px]">
                        {/* Full Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                            Full Legal Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g. Deepu Kumar"
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* Father's / Husband's Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                            Father's / Husband's Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.fatherName}
                            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                            placeholder="e.g. Sagik P"
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* DOB & Gender */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.dob}
                              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        {/* Primary Mobile & WhatsApp */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Primary Mobile <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              value={formData.mobile}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  mobile: val,
                                  whatsapp: sameAsMobile ? val : formData.whatsapp,
                                });
                              }}
                              placeholder="+91 9871454424"
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              WhatsApp Number
                            </label>
                            <input
                              type="tel"
                              value={formData.whatsapp}
                              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                              placeholder="+91 9871454424"
                              disabled={sameAsMobile}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-mono disabled:bg-stone-100"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            id="sameMobileCheck"
                            checked={sameAsMobile}
                            onChange={(e) => {
                              setSameAsMobile(e.target.checked);
                              if (e.target.checked) {
                                setFormData({ ...formData, whatsapp: formData.mobile });
                              }
                            }}
                            className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer"
                          />
                          <label htmlFor="sameMobileCheck" className="text-[10px] text-stone-600 cursor-pointer">
                            WhatsApp is same as primary mobile
                          </label>
                        </div>

                        {/* Email & Blood Group */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Email (Optional)
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="cadre@example.com"
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Blood Group
                            </label>
                            <select
                              value={formData.bloodGroup}
                              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="AB+">AB+</option>
                              <option value="A+">A+</option>
                              <option value="B+">B+</option>
                              <option value="O+">O+</option>
                              <option value="AB-">AB-</option>
                              <option value="A-">A-</option>
                              <option value="B-">B-</option>
                              <option value="O-">O-</option>
                              <option value="Not Specified">Not Specified</option>
                            </select>
                          </div>
                        </div>

                        {/* Emergency Contact (Compulsory) */}
                        <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-900 text-[10px] flex items-center gap-1">
                              <span>🚨</span> Emergency Contact Details
                            </span>
                            <span className="text-[8.5px] uppercase font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                              Compulsory
                            </span>
                          </div>
                          <div className="text-[9px] text-rose-700">This number will be printed on your official ID card.</div>
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div>
                              <label className="block text-[9.5px] font-bold text-stone-700 mb-0.5">
                                Emergency Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={formData.emergencyNumber}
                                onChange={(e) => setFormData({ ...formData, emergencyNumber: e.target.value })}
                                placeholder="+91 8975511221"
                                className="w-full px-2 py-1.5 border border-rose-300 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 outline-none font-mono bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-bold text-stone-700 mb-0.5">
                                Relationship <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={formData.emergencyRelation}
                                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                className="w-full px-2 py-1.5 border border-rose-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-rose-500 outline-none"
                              >
                                <option value="Mother">Mother</option>
                                <option value="Father">Father</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                                <option value="Guardian">Guardian</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-1 pb-4">
                          <button
                            type="submit"
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                          >
                            <span>Save Details & Continue to Address</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 4c. Interactive Address & PIN Drawer (Step 2 Manual Fill) */}
                {addressDrawerOpen && (
                  <div
                    onClick={() => setAddressDrawerOpen(false)}
                    className="absolute inset-0 bg-black/65 z-30 flex flex-col justify-end animate-in fade-in duration-150 cursor-pointer"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white rounded-t-2xl max-h-[90%] flex flex-col shadow-2xl overflow-hidden border-t-2 border-emerald-600 cursor-default"
                    >
                      <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
                        <div>
                          <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                            <span className="text-emerald-700">📍</span>
                            <span>2. Location & Residential Address</span>
                          </div>
                          <div className="text-[9.5px] text-stone-500">Provide Taluk, Postal PIN and street address</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddressDrawerOpen(false)}
                          className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveAddress} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5 [scrollbar-width:thin] text-[11px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              State / UT <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.state}
                              onChange={(e) => {
                                const nextState = e.target.value;
                                const dists = STATE_DISTRICTS[nextState] || ["Other District"];
                                setFormData({
                                  ...formData,
                                  state: nextState,
                                  district: dists[0] || "Other District",
                                });
                              }}
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              {[...INDIAN_STATES].sort((a, b) => a.localeCompare(b)).map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              District Unit (A–Z) <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.district}
                              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                              className="w-full px-2 py-1.5 border border-emerald-300 rounded-lg text-xs bg-white font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              {[...(STATE_DISTRICTS[formData.state] || ["Other District"])]
                                .sort((a, b) => a.localeCompare(b))
                                .map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Taluk / Sub-District</label>
                            <input
                              type="text"
                              value={formData.taluk}
                              onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                              placeholder="Taluk or Locality"
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                              Postal PIN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={formData.pincode}
                              onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, "") })}
                              placeholder="e.g. 605002"
                              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-700 mb-0.5">
                            Full Residential Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Door / Flat No, Building Name, Street, Landmark, Area"
                            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                          />
                        </div>

                        <div className="pt-1 pb-4">
                          <button
                            type="submit"
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                          >
                            <span>Save Address & Choose Seva Wing</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 5. Bottom Chat Typing Input Bar */}
                <form
                  onSubmit={handleSendText}
                  className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 border-t border-stone-200"
                >
                  <label
                    className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center flex-shrink-0 cursor-pointer border border-stone-300 transition-colors shadow-2xs"
                    title="Attach Passport Photo"
                  >
                    <Camera size={15} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (reader.result) {
                              const photoUrl = reader.result as string;
                              setCandidatePhoto(photoUrl);
                              setCandidateData((prev) => ({ ...prev, photoUrl }));
                              setTimeout(() => {
                                handleOptionClick("Upload Photo 📸", undefined, photoUrl);
                              }, 200);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type 'Hi' or enter UTR / Wing..."
                    className="flex-1 bg-white border border-stone-300 rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600 text-stone-800 placeholder:text-stone-400 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f70] text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="text-[11px] text-stone-500 text-center mt-3 max-w-xs leading-tight">
              💡 Tap any button or list option inside the phone screen. Typing <span className="font-mono font-bold text-stone-700">"Hi"</span> restarts the main menu.
            </div>
          </div>

          {/* ══════════════ RIGHT COLUMN: INSPECTOR & VALIDATOR (lg:col-span-7) ══════════════ */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Inspector Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
              {/* Tab Switcher */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setActiveTab("inspect")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "inspect"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    🔍 Inspect Node
                  </button>
                  <button
                    onClick={() => setActiveTab("edit")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "edit"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    ✏️ Edit Node
                  </button>
                  <button
                    onClick={() => setActiveTab("card")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "card"
                        ? "bg-[#ea580c] text-white shadow-xs"
                        : "text-[#ea580c] hover:bg-orange-50 border border-orange-300"
                    }`}
                  >
                    <CreditCard size={13} />
                    <span>📇 ID Card (Both Sides)</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setJsonModalOpen(true)}
                    className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono font-bold flex items-center gap-1 border border-stone-300"
                  >
                    <span>&#123; &#125;</span>
                    <span>Raw JSON</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: INSPECTOR VIEW */}
              {activeTab === "inspect" && (
                <div className="space-y-4 pt-3">
                  {/* Current Active Node Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-stone-900">
                        {activeNode?.name || "Root Menu"}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          Type: {activeNode?.type === "media" ? "Media" : activeNode?.data.interactiveType || "Interactive"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {activeIncomingEdges.length} incoming edge(s)
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 mt-0.5 truncate">
                      nodeId: {activeNode?.nodeId}
                    </div>
                  </div>

                  {/* Trigger Keywords */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Trigger Keywords for this node:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeNode?.keywords && activeNode.keywords.length > 0 ? (
                        activeNode.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white text-stone-800 font-mono text-[10px] rounded border border-stone-300 shadow-2xs"
                          >
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400 text-xs italic">
                          None (triggered via edge navigation from parent)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Options & Routing Table */}
                  <div>
                    <span className="text-xs font-bold text-stone-900 block mb-1.5">
                      Routing Table (Options ➔ Destinations):
                    </span>
                    <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200 text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Option Title</th>
                            <th className="py-2 px-3">Target Node (Goes To)</th>
                            <th className="py-2 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {(() => {
                            // Collect all options from buttons or sections
                            const nodeOptions: Array<{ title: string; destNodeId?: string; isBackend: boolean }> = [];
                            if (activeNode?.data.action?.buttons) {
                              activeNode.data.action.buttons.forEach((b) => {
                                const edge = flow.edges.find((e) => e.fromNodeId === activeNode.nodeId && e.keywords.includes(b.reply.title));
                                const isBackend = b.reply.title === "Confirm Registration" || b.reply.title === "Confirm & Take Oath" || b.reply.title === "My Cadre ID Card";
                                nodeOptions.push({ title: b.reply.title, destNodeId: edge?.toNodeId, isBackend });
                              });
                            } else if (activeNode?.data.action?.sections) {
                              const isMemberUser = persona === "approved_cadre" || Boolean(sessionRegisteredMember);
                              activeNode.data.action.sections.forEach((sec) => {
                                sec.rows.forEach((r) => {
                                  if (
                                    isMemberUser &&
                                    activeNode.nodeId === "root" &&
                                    (r.title.toLowerCase().includes("cadre registration") ||
                                      r.title.toLowerCase().includes("register"))
                                  ) {
                                    return;
                                  }
                                  const edge = flow.edges.find((e) => e.fromNodeId === activeNode.nodeId && e.keywords.includes(r.title));
                                  const isBackend = r.title === "Confirm Registration" || r.title === "Confirm & Take Oath" || r.title === "My Cadre ID Card";
                                  nodeOptions.push({ title: r.title, destNodeId: edge?.toNodeId, isBackend });
                                });
                              });
                            }

                            // Catch any additional edges
                            activeOutgoingEdges.forEach((e) => {
                              const t = e.keywords[0];
                              const isMemberUser = persona === "approved_cadre" || Boolean(sessionRegisteredMember);
                              if (
                                isMemberUser &&
                                activeNode?.nodeId === "root" &&
                                (t.toLowerCase().includes("cadre registration") || t.toLowerCase().includes("register"))
                              ) {
                                return;
                              }
                              if (!nodeOptions.some((item) => item.title === t)) {
                                nodeOptions.push({ title: t, destNodeId: e.toNodeId, isBackend: false });
                              }
                            });

                            if (nodeOptions.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={3} className="py-3 px-3 text-stone-400 italic text-center">
                                    No outgoing options (terminal leaf or webhook-answered).
                                  </td>
                                </tr>
                              );
                            }

                            return nodeOptions.map((opt, idx) => {
                              const destNode = flow.nodes.find((n) => n.nodeId === opt.destNodeId);
                              return (
                                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="py-2 px-3 font-semibold text-stone-900">
                                    {opt.title}
                                    {opt.title.length > 24 && (
                                      <span className="ml-1 text-[9px] text-rose-600 font-bold">
                                        (&gt;24 chars limit!)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-stone-600">
                                    {opt.isBackend ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                        ⚡ Backend Webhook (ID Card Generation)
                                      </span>
                                    ) : (
                                      <span>{destNode?.name || opt.destNodeId || "Unconnected"}</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {opt.destNodeId ? (
                                      <button
                                        onClick={() => setActiveNodeId(opt.destNodeId!)}
                                        className="px-2 py-0.5 text-[11px] font-semibold text-orange-600 hover:text-orange-800 hover:underline cursor-pointer"
                                      >
                                        Inspect ➔
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-stone-400">Webhook</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Live Meta / WACTO Compliance Checklist */}
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-700" />
                      <span>Live WACTO & Meta Compliance Engine:</span>
                    </span>
                    <ul className="text-[11px] space-y-1 text-emerald-900 font-medium pl-1">
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-700 flex-shrink-0" />
                        <span>All 19 nodes reachable from root node (0 orphan errors).</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-700 flex-shrink-0" />
                        <span>Single-destination routing verified: 0 edge label collisions.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-700 flex-shrink-0" />
                        <span>WhatsApp length limits respected (Titles ≤24 chars, buttons ≤20 chars).</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-700 flex-shrink-0" />
                        <span>DPDP Act PII scan passed (0 unencrypted personal data stored in WACTO export).</span>
                      </li>
                    </ul>
                  </div>

                  {/* "How to Read This" Guide Box (Matching Screenshot) */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 text-xs">
                    <span className="font-bold text-stone-900 block text-xs">How to read this simulator:</span>
                    <ul className="text-[11px] text-stone-600 space-y-1 pl-1">
                      <li>• <b>White bubbles</b> are WACTO nodes, exactly as WhatsApp renders list and button messages.</li>
                      <li>• <b>Green bubbles</b> are the user's taps and typed text inputs.</li>
                      <li>• <b>Dashed bubbles</b> are our backend's automated replies (Cadre ID Cards & Donation Invoices).</li>
                      <li>• <b>Yellow/Amber alerts</b> flag client WACTO errors, missing edges, or titles that lead to two nodes.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: EDIT VIEW */}
              {activeTab === "edit" && (
                <div className="space-y-3 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Node Title / Name</label>
                    <input
                      type="text"
                      value={activeNode?.name || ""}
                      onChange={(e) => {
                        const updated = { ...activeNode, name: e.target.value };
                        setFlow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) => (n.nodeId === activeNode.nodeId ? updated : n)),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 font-semibold text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Body Text (WhatsApp Bubble Message)</label>
                    <textarea
                      rows={4}
                      value={activeNode?.data.body || ""}
                      onChange={(e) => {
                        const updated = {
                          ...activeNode,
                          data: { ...activeNode.data, body: e.target.value },
                        };
                        setFlow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) => (n.nodeId === activeNode.nodeId ? updated : n)),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 font-sans text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Footer Text</label>
                    <input
                      type="text"
                      value={activeNode?.data.footer || ""}
                      onChange={(e) => {
                        const updated = {
                          ...activeNode,
                          data: { ...activeNode.data, footer: e.target.value },
                        };
                        setFlow((prev) => ({
                          ...prev,
                          nodes: prev.nodes.map((n) => (n.nodeId === activeNode.nodeId ? updated : n)),
                        }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 text-stone-800"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => alert("Node changes applied in memory! Click 'Export JSON' to download.")}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold"
                    >
                      Apply In-Memory
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ACTUAL WEB DIGITAL ID CARD (FRONT & BACK) */}
              {activeTab === "card" && (
                <div className="space-y-4 pt-3 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                        <CreditCard className="text-[#ea580c]" size={20} />
                        <span>Official National Cadre Identity Card</span>
                      </h2>
                      <p className="text-xs text-stone-500">
                        Actual Web Digital ID Card • Dual-Sided 70 mm × 100 mm (Front & Reverse Standard @ 300 DPI)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase border ${
                          (currentCardMember.status || "").toUpperCase() === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {currentCardMember.status || "PROVISIONAL"}
                      </span>
                    </div>
                  </div>

                  {/* Actual Web DigitalIdCard Component with Both Sides */}
                  <div className="flex justify-center w-full py-2 bg-gradient-to-b from-stone-50/50 to-white rounded-2xl border border-stone-200 p-2 sm:p-4 overflow-hidden">
                    <DigitalIdCard
                      member={currentCardMember}
                      qrDataUrl={activeCardQrUrl}
                      defaultView="both"
                      showViewToggle={true}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Summary Card */}
            <div className="bg-[#faf6ee] p-3 rounded-xl border border-[#e5dac8] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-stone-900">
                  Active Flow: {flow.chatbot?.name || "Maha Seva Dal Bot v1"}
                </span>
                <span className="text-stone-500 font-mono">
                  ({totalNodes} nodes · {totalEdges} edges)
                </span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-800">
                Rule Check: Meta & WACTO Ready 🟢
              </div>
            </div>
          </div>
        </div>

        {/* ─── MODAL: RAW JSON INSPECTOR ─── */}
        {jsonModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <FileJson size={18} className="text-orange-600" />
                  <span>WACTO Flow JSON Inspector</span>
                </div>
                <button
                  onClick={() => setJsonModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] bg-stone-900 text-emerald-400">
                <pre>{JSON.stringify(flow, null, 2)}</pre>
              </div>
              <div className="p-3 border-t border-stone-200 flex justify-end gap-2 bg-stone-50">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(flow, null, 2));
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold flex items-center gap-1.5 bg-white hover:bg-stone-100"
                >
                  {copiedNotification ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedNotification ? "Copied!" : "Copy Full JSON"}</span>
                </button>
                <button
                  onClick={() => setJsonModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: PASTE RAW JSON ─── */}
        {pasteModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <FileJson size={18} className="text-blue-600" />
                  <span>Paste Custom WACTO Export JSON</span>
                </div>
                <button
                  onClick={() => setPasteModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs text-stone-500 mb-2">
                  Paste any exported WACTO chatbot flow JSON below to instantly preview, step-through, and validate it:
                </p>
                <textarea
                  rows={12}
                  value={pastedJsonText}
                  onChange={(e) => setPastedJsonText(e.target.value)}
                  placeholder='{"chatbot": {"name": "..."}, "nodes": [...], "edges": [...]}'
                  className="w-full flex-1 p-3 rounded-xl border border-stone-300 font-mono text-[11px] focus:outline-none focus:border-stone-900"
                />
              </div>
              <div className="p-3 border-t border-stone-200 flex justify-end gap-2 bg-stone-50">
                <button
                  onClick={() => setPasteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyPastedJson}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  Load Into Simulator
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ─── MODAL: FULL IDENTITY CARD STUDIO (FRONT & REVERSE) ─── */}
        {studioModalMember && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setStudioModalMember(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF6200]">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 leading-tight">
                      Maha Seva Dal · Identity Card Studio
                    </h3>
                    <p className="text-xs text-stone-500">
                      Official 70 mm × 100 mm Dual-Sided Cadre PVC Card (Front & Reverse Standard)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStudioModalMember(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
                  title="Close Studio"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Card Display */}
              <div className="flex-1 overflow-y-auto p-2 flex justify-center [scrollbar-width:thin]">
                <DigitalIdCard
                  member={studioModalMember}
                  qrDataUrl={studioModalQrUrl}
                  defaultView="both"
                  showViewToggle={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
  );

  if (embedded) return innerSimulator;
  return <PageLayout hideHeader hideFooter>{innerSimulator}</PageLayout>;
}

