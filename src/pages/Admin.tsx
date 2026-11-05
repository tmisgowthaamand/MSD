import React, { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import { logActivity } from "@/utils/activityLogger";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  ShieldCheck,
  Shield,
  Lock,
  ArrowLeft,
  X,
  LogOut,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Scale,
  Sparkles,
  FileJson,
  RotateCcw,
  Award,
  Smartphone,
  Upload,
  CreditCard,
  Check,
  FileText,
  Copy,
  ExternalLink,
  Droplet,
  User,
  Calendar,
  MessageCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PieChart,
  Activity,
  LayoutGrid,
  MoreVertical,
  AlertTriangle,
  Maximize2,
  CheckSquare,
  HeartHandshake,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  MessageSquare,
  Inbox,
  UserPlus,
  Layout,
} from "lucide-react";
import DonationsManager from "@/components/DonationsManager";
import FlowSimulator from "@/pages/FlowSimulator";
import IncompleteLeads from "@/pages/IncompleteLeads";
import WhatsAppCrmManager from "@/components/WhatsAppCrmManager";
import QRCode from "qrcode";
import DigitalIdCard, {
  OfficialSealSvg,
  OfficialSignatureSvg,
  generateIdCardPdf,
  generateIdCardCanvas,
  generateIdCardBackCanvas,
  generateCombinedIdCardCanvas,
  captureCardElement,
  combineCapturedCards,
  addPaddingToCardDataUrl,
  setPng300Dpi,
  getValidBloodGroup,
} from "@/components/DigitalIdCard";
import { STATE_PIN_PREFIXES, DISTRICT_PIN_PREFIXES } from "@/pages/Register";

// Helper: Verify PIN code against selected state and district
export const getPincodeWarning = (pincode?: string, state?: string, district?: string): string | null => {
  if (!pincode) return null;
  const pin = String(pincode).trim();
  if (!/^\d{6}$/.test(pin) || pin.startsWith("0")) {
    return "Invalid 6-digit PIN code format";
  }
  if (state && STATE_PIN_PREFIXES[state]) {
    const validStatePrefixes = STATE_PIN_PREFIXES[state];
    if (!validStatePrefixes.some((pref) => pin.startsWith(pref))) {
      return `PIN code does not match ${state} (expected circle: ${validStatePrefixes.join(", ")})`;
    }
  }
  if (district && district !== "Other District" && DISTRICT_PIN_PREFIXES[district]) {
    const validDistPrefixes = DISTRICT_PIN_PREFIXES[district];
    if (!validDistPrefixes.some((pref) => pin.startsWith(pref))) {
      return `PIN code does not match district ${district} (expected prefix: ${validDistPrefixes.join(", ")})`;
    }
  }
  return null;
};

export const REJECTION_PRESETS = [
  "Passport photograph blurred or invalid",
  "Incomplete address or invalid pincode",
  "Duplicate registration detected",
  "Age eligibility criteria not met (Below 18)",
  "Contact phone number unreachable or invalid",
  "Wing qualification mismatch",
];

interface Member {
  _id: string;
  registrationId: string;
  fullName: string;
  fatherName: string;
  dob: string;
  age?: number;
  gender: string;
  mobile: string;
  whatsapp?: string;
  emergencyNumber?: string;
  emergencyRelation?: string;
  email?: string;
  bloodGroup: string;
  photoUrl: string;
  state: string;
  district: string;
  assembly?: string;
  zone?: string;
  taluk?: string;
  address: string;
  pincode: string;
  profession?: string;
  wing: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  createdAt: string;
  approvedAt?: string;
}

const INDIAN_STATES = [
  "ALL",
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const WINGS = [
  "ALL",
  "Legal Wing",
  "Medical & Health Wing",
  "Education & Child Welfare",
  "Youth & Sports Wing",
  "Community Seva & Mahaprasadam",
  "General Seva Cadre",
];

const formatDobDisplay = (dobString?: string): string => {
  if (!dobString) return "—";
  const parts = dobString.split("-");
  if (parts.length !== 3) return dobString;
  const [y, m, d] = parts;
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const getMemberWhatsAppUrl = (member: { whatsapp?: string; mobile?: string; fullName: string; registrationId: string }) => {
  const raw = member.whatsapp && member.whatsapp.trim() && member.whatsapp.toLowerCase() !== "same"
    ? member.whatsapp
    : member.mobile;
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  const full = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(
    `Namaste ${member.fullName}, reaching out from Maha Seva Dal Secretariat regarding your registration (${member.registrationId}).`
  );
  return `https://wa.me/${full}?text=${text}`;
};

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of idle window timeout

const Admin = ({
  defaultTab = "dashboard",
}: {
  defaultTab?: "dashboard" | "directory" | "analytics" | "donations" | "simulator" | "leads";
} = {}) => {
  const [sessionTimeoutMsg, setSessionTimeoutMsg] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("msd_admin_token");
      const lastActive = localStorage.getItem("msd_admin_last_activity");
      if (stored && lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem("msd_admin_token");
          localStorage.removeItem("msd_admin_last_activity");
          return "Session expired due to 30 minutes of inactivity. Please sign in again.";
        }
      }
    } catch (e) {}
    return "";
  });

  const [token, setToken] = useState<string | null>(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) {
      localStorage.setItem("msd_admin_token", urlToken);
      localStorage.setItem("msd_admin_last_activity", String(Date.now()));
      return urlToken;
    }
    const stored = localStorage.getItem("msd_admin_token");
    const lastActive = localStorage.getItem("msd_admin_last_activity");
    if (stored && lastActive) {
      const elapsed = Date.now() - parseInt(lastActive, 10);
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        return null;
      }
    }
    if (stored && !lastActive) {
      localStorage.setItem("msd_admin_last_activity", String(Date.now()));
    }
    return stored;
  });

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard Data State
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    wingBreakdown?: Array<{ _id: string; count: number }>;
    stateBreakdown?: Array<{ _id: string; count: number }>;
    genderBreakdown?: Array<{ _id: string; count: number }>;
  }>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    wingBreakdown: [],
    stateBreakdown: [],
    genderBreakdown: [],
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Tab & Portal View Navigation State
  const [activeAdminTab, setActiveAdminTab] = useState<
    | "dashboard"
    | "directory"
    | "analytics"
    | "donations"
    | "bot-messages"
    | "simulator"
    | "crm-inbox"
    | "crm-leads"
    | "leads"
    | "crm-templates"
  >(defaultTab);
  const [pendingDonationsCount, setPendingDonationsCount] = useState<number>(0);
  const [selectedInboxMobile, setSelectedInboxMobile] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const desktopSidebarNavRef = useRef<HTMLDivElement>(null);
  const mobileSidebarNavRef = useRef<HTMLDivElement>(null);

  // Stop Lenis while in Admin Portal so nested sidebars, inboxes, and tables scroll with native 60fps wheel
  useEffect(() => {
    const lenisInstance = (window as any).lenis;
    if (lenisInstance && typeof lenisInstance.stop === "function") {
      lenisInstance.stop();
    }
    return () => {
      if (lenisInstance && typeof lenisInstance.start === "function") {
        lenisInstance.start();
      }
    };
  }, []);

  useEffect(() => {
    setActiveAdminTab(defaultTab);
  }, [defaultTab]);

  // Server-Side Pagination State (Requirement 7: 20 per page default)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters State (Requirement 9: District, Date Range, Status, Wing, State)
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("ALL");
  const [filterDistrict, setFilterDistrict] = useState("ALL");
  const [filterWing, setFilterWing] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Column Sorting State (Requirement 7: Name, Enrolled, Status)
  const [sortField, setSortField] = useState<"fullName" | "createdAt" | "status" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Row Selection & Bulk Actions State (Requirement 8)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkApproveModalOpen, setBulkApproveModalOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Row "⋯" Actions Dropdown Menu State (Requirement 1)
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);

  // Selected Member for Dossier Modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Remarks Popup Modal State (Shows ONLY remarks)
  const [remarkModalMember, setRemarkModalMember] = useState<Member | null>(null);

  // ID Card Seal & Signature Settings State
  const [cardSettingsModalOpen, setCardSettingsModalOpen] = useState(false);
  const [cardSettings, setCardSettings] = useState({
    customSealUrl: localStorage.getItem("msd_seal_image_url") || "",
    customSignatureUrl: localStorage.getItem("msd_signature_image_url") || "",
    signatoryName: localStorage.getItem("msd_signatory_name") || "Authorized Signatory",
    signatoryTitle: localStorage.getItem("msd_signatory_title") || "Central Executive Committee",
  });
  const [savingCardSettings, setSavingCardSettings] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Dossier Tab & QR State ('dossier' shows review & verification records, 'card' shows ID card)
  const [dossierTab, setDossierTab] = useState<"dossier" | "card">("dossier");
  const [selectedMemberQr, setSelectedMemberQr] = useState<string>("");

  // Status Confirmation Modal State (Prevents Accidental One-Click Actions)
  const [statusActionTarget, setStatusActionTarget] = useState<{
    member: Member;
    targetStatus: "PENDING" | "APPROVED" | "REJECTED";
  } | null>(null);
  const [statusActionNote, setStatusActionNote] = useState<string>("");
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Card Download & Copy State inside Modal
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Verification Modal Polish State
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [isDuplicateMobile, setIsDuplicateMobile] = useState(false);

  const handleDownloadPdf = async (member: Member) => {
    setDownloadingPdf(true);
    try {
      let frontUrl = "";
      let backUrl = "";
      try {
        frontUrl = await captureCardElement("msd-pvc-card-front");
        backUrl = await captureCardElement("msd-pvc-card-back");
      } catch (e) {
        console.warn("DOM capture fallback for Admin PDF:", e);
      }
      await generateIdCardPdf(member, selectedMemberQr, cardSettings, frontUrl, backUrl);
    } catch (err: any) {
      alert("PDF download failed: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async (member: Member, mode: "both" | "front" | "back" = "both") => {
    setDownloadingPng(true);
    try {
      let dataUrl = "";
      let filenameSuffix = "BothSides";
      if (mode === "front") {
        try {
          dataUrl = await captureCardElement("msd-pvc-card-front");
        } catch {
          dataUrl = await generateIdCardCanvas(member, selectedMemberQr, cardSettings);
        }
        dataUrl = await addPaddingToCardDataUrl(dataUrl, 0);
        filenameSuffix = "Front";
      } else if (mode === "back") {
        try {
          dataUrl = await captureCardElement("msd-pvc-card-back");
        } catch {
          dataUrl = await generateIdCardBackCanvas(member);
        }
        dataUrl = await addPaddingToCardDataUrl(dataUrl, 0);
        filenameSuffix = "Back";
      } else {
        try {
          const frontUrl = await captureCardElement("msd-pvc-card-front");
          const backUrl = await captureCardElement("msd-pvc-card-back");
          if (frontUrl && backUrl) {
            dataUrl = await combineCapturedCards(frontUrl, backUrl, 32, 24, "share");
          } else {
            throw new Error("Incomplete DOM capture");
          }
        } catch {
          dataUrl = await generateCombinedIdCardCanvas(member, selectedMemberQr, cardSettings, 48, 48);
        }
        filenameSuffix = "BothSides";
      }
      if (!dataUrl) throw new Error("Could not render card canvas.");
      dataUrl = setPng300Dpi(dataUrl, 300);

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
          downloadUrl = dataUrl;
        }
      }

      const cleanRegId = (member.registrationId || "member").replace(/[^a-zA-Z0-9_-]/g, "_");
      const link = document.createElement("a");
      link.download = filenameSuffix === "BothSides" ? `${cleanRegId}_Both.png` : filenameSuffix === "Front" ? `${cleanRegId}_Front.png` : `${cleanRegId}_Back.png`;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (blobUrl) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      }
    } catch (err: any) {
      alert("Download error: " + (err.message || "Failed to download card"));
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleCopyRegistrationId = (regId: string) => {
    navigator.clipboard.writeText(regId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Fetch Card Settings from API
  const fetchCardSettings = async () => {
    try {
      const res = await fetch(getApiUrl("/api/members/card-settings"));
      const data = await res.json();
      if (data && data.success && data.settings) {
        setCardSettings({
          customSealUrl: data.settings.customSealUrl || "",
          customSignatureUrl: data.settings.customSignatureUrl || "",
          signatoryName: data.settings.signatoryName || "Authorized Signatory",
          signatoryTitle: data.settings.signatoryTitle || "Central Executive Committee",
        });
      }
    } catch (e) {
      console.warn("Could not load card settings:", e);
    }
  };

  useEffect(() => {
    fetchCardSettings();
  }, []);

  // Generate QR code for selected member in dossier
  useEffect(() => {
    if (selectedMember) {
      const qrText = `https://mahasevadal.com/verify?id=${selectedMember.registrationId}&name=${encodeURIComponent(
        selectedMember.fullName
      )}&wing=${encodeURIComponent(selectedMember.wing)}`;
      QRCode.toDataURL(qrText, { width: 180, margin: 1 })
        .then(setSelectedMemberQr)
        .catch(() => setSelectedMemberQr(""));
    } else {
      setSelectedMemberQr("");
      setDossierTab("dossier");
    }
  }, [selectedMember]);

  // Check if primary mobile number of selected member already exists (duplicate warning)
  useEffect(() => {
    if (!selectedMember || !selectedMember.mobile) {
      setIsDuplicateMobile(false);
      return;
    }
    const clean = String(selectedMember.mobile).replace(/\D/g, "").slice(-10);
    if (!clean) {
      setIsDuplicateMobile(false);
      return;
    }

    // 1. Check local loaded members list first
    const localMatch = members.some(
      (m) =>
        m._id !== selectedMember._id &&
        m.mobile &&
        String(m.mobile).replace(/\D/g, "").slice(-10) === clean
    );
    if (localMatch) {
      setIsDuplicateMobile(true);
      return;
    }

    // 2. Check database via check-mobile API for global duplicates
    let active = true;
    fetch(getApiUrl(`/api/members/check-mobile?mobile=${clean}`))
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          if (data.registered && data.registrationId !== selectedMember.registrationId) {
            setIsDuplicateMobile(true);
          } else {
            setIsDuplicateMobile(false);
          }
        }
      })
      .catch(() => {
        if (active) setIsDuplicateMobile(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMember, members]);

  // Upload Custom Seal
  const handleSealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingSeal(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCardSettings((prev) => ({ ...prev, customSealUrl: data.url }));
        setStatusMessage("Official seal image uploaded successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert("Seal upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Seal upload failed: " + err.message);
    } finally {
      setUploadingSeal(false);
    }
  };

  // Upload Custom Signature
  const handleSignatureFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingSignature(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCardSettings((prev) => ({ ...prev, customSignatureUrl: data.url }));
        setStatusMessage("Official signature image uploaded successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert("Signature upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Signature upload failed: " + err.message);
    } finally {
      setUploadingSignature(false);
    }
  };

  // Save Card Settings to Backend
  const handleSaveCardSettings = async () => {
    if (!token) return;
    setSavingCardSettings(true);
    try {
      const res = await fetch(getApiUrl("/api/members/admin/card-settings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cardSettings),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("msd_seal_image_url", cardSettings.customSealUrl || "");
        localStorage.setItem("msd_signature_image_url", cardSettings.customSignatureUrl || "");
        localStorage.setItem("msd_signatory_name", cardSettings.signatoryName || "");
        localStorage.setItem("msd_signatory_title", cardSettings.signatoryTitle || "");
        setStatusMessage("ID Card seal & signature settings saved successfully!");
        setTimeout(() => setStatusMessage(null), 4000);
        setCardSettingsModalOpen(false);
      } else {
        alert("Error saving settings: " + (data.error || "Failed"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setSavingCardSettings(false);
    }
  };

  // Available Districts derived from current dataset or state (Requirement 9)
  const availableDistricts = React.useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.district && m.district.trim()) {
        if (filterState === "ALL" || m.state === filterState) {
          set.add(m.district.trim());
        }
      }
    });
    return Array.from(set).sort();
  }, [members, filterState]);

  // Client-side Sort & Default Sort (Pending first, newest first so new registrations appear at the top)
  const sortedMembers = React.useMemo(() => {
    if (!sortField) {
      // Default sort: Pending first, newest first
      const statusWeight: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
      return [...members].sort((a, b) => {
        const diff = (statusWeight[a.status] ?? 3) - (statusWeight[b.status] ?? 3);
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return [...members].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";
      if (sortField === "fullName") {
        valA = (a.fullName || "").toLowerCase();
        valB = (b.fullName || "").toLowerCase();
      } else if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortField === "status") {
        valA = a.status || "";
        valB = b.status || "";
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [members, sortField, sortOrder]);

  // Toggle selection for bulk actions (Requirement 8)
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Column Sort Handler (Requirement 7: Name, Enrolled, Status)
  const handleSortColumn = (field: "fullName" | "createdAt" | "status") => {
    if (sortField !== field) {
      setSortField(field);
      // For date/enrolled, default initial sort to newest first (desc)
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortField("");
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Close row "⋯" menu when clicking anywhere outside
  useEffect(() => {
    if (!activeRowMenuId) return;
    const handleOutsideClick = () => setActiveRowMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [activeRowMenuId]);

  // Fetch Members (Supports Server-Side Pagination, Filters, Sorting & Aggregations)
  const fetchMembers = async (targetPage = page, targetLimit = limit, silent = false) => {
    if (!token) return;
    if (!silent) {
      if (members.length === 0) setLoading(true);
      else setRefreshing(true);
    }
    try {
      const queryParams = new URLSearchParams({
        search,
        state: filterState,
        district: filterDistrict,
        wing: filterWing,
        status: filterStatus,
        page: String(targetPage),
        limit: String(targetLimit),
      });

      if (startDate) queryParams.set("startDate", startDate);
      if (endDate) queryParams.set("endDate", endDate);
      if (sortField) {
        queryParams.set("sortField", sortField);
        queryParams.set("sortOrder", sortOrder);
      }

      const res = await fetch(
        getApiUrl(`/api/members/admin/all?${queryParams.toString()}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("msd_admin_token");
        setToken(null);
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load members.");
      }

      setMembers(json.data || []);
      if (json.meta) {
        setPage(json.meta.page || 1);
        setTotalPages(json.meta.totalPages || 1);
        setTotalCount(json.meta.total || 0);
      }
      if (json.stats) {
        setStats((prev) => ({
          ...prev,
          total: json.stats.total ?? prev.total,
          pending: json.stats.pending ?? prev.pending,
          approved: json.stats.approved ?? prev.approved,
          rejected: json.stats.rejected ?? prev.rejected,
          wingBreakdown: json.stats.wingBreakdown || prev.wingBreakdown,
          stateBreakdown: json.stats.stateBreakdown || prev.stateBreakdown,
          genderBreakdown: json.stats.genderBreakdown || prev.genderBreakdown,
        }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      setPage(1);
      fetchMembers(1, limit);
    }
  }, [token, filterState, filterDistrict, filterWing, filterStatus, limit, startDate, endDate, sortField, sortOrder]);

  // Debounced Search Trigger
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      setPage(1);
      fetchMembers(1, limit);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Global Header Refresh Trigger across all Admin views (Directory, CRM Leads, Inbox, Drop-offs, Donations)
  const [refreshKey, setRefreshKey] = useState(0);

  const handleHeaderRefresh = async () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    try {
      await fetchMembers(page, limit, true);
      window.dispatchEvent(new CustomEvent("msd:admin-refresh"));
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // Lock body & html scroll, pause Lenis, and handle Escape key when modals are open
  useEffect(() => {
    if (selectedMember || cardSettingsModalOpen || memberToDelete || remarkModalMember || statusActionTarget || lightboxPhoto || moreMenuOpen || bulkApproveModalOpen || activeRowMenuId) {
      if ((window as any).lenis && typeof (window as any).lenis.stop === "function") {
        (window as any).lenis.stop();
      }

      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (bulkApproveModalOpen) {
            setBulkApproveModalOpen(false);
          } else if (activeRowMenuId) {
            setActiveRowMenuId(null);
          } else if (lightboxPhoto) {
            setLightboxPhoto(null);
          } else if (moreMenuOpen) {
            setMoreMenuOpen(false);
          } else if (statusActionTarget) {
            setStatusActionTarget(null);
          } else if (remarkModalMember) {
            setRemarkModalMember(null);
          } else if (memberToDelete) {
            setMemberToDelete(null);
          } else if (cardSettingsModalOpen) {
            setCardSettingsModalOpen(false);
          } else if (selectedMember) {
            setSelectedMember(null);
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        if ((window as any).lenis && typeof (window as any).lenis.start === "function") {
          (window as any).lenis.start();
        }
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedMember, cardSettingsModalOpen, memberToDelete, remarkModalMember, statusActionTarget, lightboxPhoto, moreMenuOpen, bulkApproveModalOpen, activeRowMenuId]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(getApiUrl("/api/members/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 401 || res.status === 403) {
        setLoginError("Invalid username or password");
        return;
      }

      if (!res.ok) {
        setLoginError("Something went wrong. Please try again.");
        return;
      }

      const json = await res.json();
      if (!json?.token) {
        setLoginError("Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("msd_admin_token", json.token);
      localStorage.setItem("msd_admin_last_activity", String(Date.now()));
      setSessionTimeoutMsg("");
      setToken(json.token);
      logActivity({
        channel: "ADMIN",
        component: "Auth",
        action: `Super Admin Logged In: ${username}`,
        status: "PASS",
      });
    } catch {
      logActivity({
        channel: "ADMIN",
        component: "Auth",
        action: `Admin Login Failed: ${username}`,
        status: "FAIL",
      });
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = (reason?: string | React.SyntheticEvent) => {
    localStorage.removeItem("msd_admin_token");
    localStorage.removeItem("msd_admin_last_activity");
    setToken(null);
    setMembers([]);
    const reasonStr = typeof reason === "string" ? reason : undefined;
    if (reasonStr) {
      setSessionTimeoutMsg(reasonStr);
    }
    logActivity({
      channel: "ADMIN",
      component: "Auth",
      action: reasonStr ? `Admin Session Ended: ${reasonStr}` : "Admin Logged Out",
      status: "PASS",
    });
  };

  // ─── 30-Minute Inactivity / Idle Session Timeout ───────────────────────────
  useEffect(() => {
    if (!token) return;

    // Check if idle time exceeded 30 minutes
    const checkInactivity = () => {
      try {
        const storedLast = localStorage.getItem("msd_admin_last_activity");
        const lastActive = storedLast ? parseInt(storedLast, 10) : Date.now();
        const elapsed = Date.now() - lastActive;

        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          handleLogout("Session expired due to 30 minutes of inactivity. Please sign in again.");
        }
      } catch (e) {}
    };

    // Throttled activity recorder (updates localStorage at most once every 15s to keep I/O light)
    let lastRecorded = Date.now();
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 15000) {
        lastRecorded = now;
        try {
          localStorage.setItem("msd_admin_last_activity", String(now));
        } catch (e) {}
      }
    };

    // User activity events that reset the 30-minute idle timer
    const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Check immediately when returning to tab or waking computer
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Multi-tab synchronization: if logged out or timed out in another tab, log out immediately here
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "msd_admin_token" && !e.newValue) {
        setToken(null);
        setMembers([]);
        setSessionTimeoutMsg("Session expired due to 30 minutes of inactivity. Please sign in again.");
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Periodic check every 15 seconds
    const intervalId = setInterval(checkInactivity, 15000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [token]);

  // Open Member Dossier
  const handleOpenMember = (member: Member, initialTab: "dossier" | "card" = "dossier") => {
    setSelectedMember(member);
    setDossierTab(initialTab);
    logActivity({
      channel: "ADMIN",
      component: "CadreDossier",
      action: `Inspected Dossier: ${member.registrationId} (${member.fullName})`,
      status: "PASS",
    });
  };

  // Trigger Status Confirmation Modal (Prevents Unintended One-Click Approval / Rejection)
  const handlePromptStatusChange = (
    member: Member,
    targetStatus: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    setStatusActionTarget({ member, targetStatus });
    setStatusActionNote(member.adminNotes || "");
    setStatusActionError(null);
  };

  // Toggle Rejection Reason Preset (Allows Adding One or More Reasons)
  const handleToggleRejectionPreset = (preset: string) => {
    setStatusActionError(null);
    const current = statusActionNote.trim();
    if (!current) {
      setStatusActionNote(preset);
      return;
    }

    const lowerPreset = preset.toLowerCase();
    const usesNewlines = current.includes("\n");
    const separator = usesNewlines ? "\n" : ", ";

    // Split current note by comma or newline, preserving non-empty entries
    const items = current
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const matchIndex = items.findIndex((item) => item.toLowerCase() === lowerPreset);

    if (matchIndex >= 0) {
      items.splice(matchIndex, 1);
      setStatusActionNote(items.join(separator));
    } else {
      items.push(preset);
      setStatusActionNote(items.join(separator));
    }
  };

  // Perform Confirmed Status Update (Supports PENDING, APPROVED, REJECTED)
  const confirmStatusChange = async () => {
    if (!token || !statusActionTarget) return;
    const { member, targetStatus } = statusActionTarget;
    const memberId = member._id;

    // Compulsory rejection remarks validation
    if (targetStatus === "REJECTED" && !statusActionNote.trim()) {
      setStatusActionError("Rejection remarks are compulsory. Please select a preset or type a reason.");
      return;
    }

    setActionLoading(true);
    setStatusMessage(null);
    setStatusActionError(null);

    try {
      const payload: { status: "PENDING" | "APPROVED" | "REJECTED"; adminNotes?: string } = {
        status: targetStatus,
      };
      if (targetStatus === "PENDING") {
        payload.adminNotes = "";
      } else {
        payload.adminNotes = statusActionNote.trim();
      }

      const res = await fetch(
        getApiUrl(`/api/members/admin/${memberId}/status`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");

      // Update in local members list
      setMembers((prev) =>
        prev.map((m) => (m._id === memberId ? json.member : m))
      );

      // If currently opened in modal, update selectedMember
      if (selectedMember && selectedMember._id === memberId) {
        setSelectedMember(json.member);
      }

      setStatusMessage(
        targetStatus === "APPROVED"
          ? `Cadre ${json.member.fullName} (${json.member.registrationId}) approved successfully! Official ID card activated.`
          : targetStatus === "REJECTED"
          ? `Application ${json.member.registrationId} marked as Rejected.`
          : `Application ${json.member.registrationId} reset to Pending Review.`
      );
      setTimeout(() => setStatusMessage(null), 4000);

      setStatusActionTarget(null);
      setStatusActionNote("");
      setStatusActionError(null);
      fetchMembers(page, limit);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Quick Remarks Popup Modal
  const handleOpenQuickRemarks = (member: Member) => {
    setRemarkModalMember(member);
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
  };

  // Perform Permanent Member Deletion
  const confirmDeleteMember = async () => {
    if (!token || !memberToDelete) return;
    setDeleteLoading(true);

    try {
      const id = memberToDelete._id;
      const res = await fetch(getApiUrl(`/api/members/admin/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete member");

      setMembers((prev) => prev.filter((m) => m._id !== id));
      if (selectedMember?._id === id) {
        setSelectedMember(null);
      }
      setStatusMessage(`Member ${memberToDelete.fullName} (${memberToDelete.registrationId}) has been permanently deleted.`);
      setTimeout(() => setStatusMessage(null), 4000);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Perform Bulk Member Deletion from MongoDB
  const confirmBulkDeleteMembers = async () => {
    if (!token || selectedMemberIds.length === 0) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/members/admin/bulk-delete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedMemberIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to bulk delete members");

      setMembers((prev) => prev.filter((m) => !selectedMemberIds.includes(m._id)));
      if (selectedMember && selectedMemberIds.includes(selectedMember._id)) {
        setSelectedMember(null);
      }
      setStatusMessage(`Successfully deleted ${selectedMemberIds.length} member record(s) from MongoDB.`);
      setTimeout(() => setStatusMessage(null), 4000);
      setSelectedMemberIds([]);
      setBulkDeleteModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(`Bulk delete error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };


  // Download MongoDB Data Backup File (.json)
  const handleDownloadMongoBackup = async () => {
    if (!token) return;
    try {
      const res = await fetch(getApiUrl("/api/members/admin/export-json"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to export MongoDB data");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `msd_members_mongodb_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Generic CSV Export Helper (Requirement 9)
  const exportMembersToCsv = (dataList: Member[], filenamePrefix = "msd_members_export") => {
    if (dataList.length === 0) {
      alert("No records to export.");
      return;
    }

    const headers = [
      "Registration ID",
      "Full Name",
      "Father Name",
      "Mobile",
      "WhatsApp",
      "Emergency Number",
      "Emergency Relation",
      "Email",
      "Blood Group",
      "State",
      "District",
      "Assembly Constituency",
      "Zone / Region",
      "Address",
      "Pincode",
      "Wing",
      "Profession",
      "Status",
      "Admin Notes",
      "Date Enrolled",
    ];

    const rows = dataList.map((m) => [
      `"${m.registrationId}"`,
      `"${m.fullName}"`,
      `"${m.fatherName}"`,
      `"${m.mobile}"`,
      `"${m.whatsapp || ""}"`,
      `"${m.emergencyNumber || ""}"`,
      `"${m.emergencyRelation || ""}"`,
      `"${m.email || ""}"`,
      `"${m.bloodGroup}"`,
      `"${m.state}"`,
      `"${m.district}"`,
      `"${m.assembly || ""}"`,
      `"${m.zone || ""}"`,
      `"${(m.address || "").replace(/"/g, '""')}"`,
      `"${m.pincode}"`,
      `"${m.wing}"`,
      `"${m.profession || ""}"`,
      `"${m.status}"`,
      `"${(m.adminNotes || "").replace(/"/g, '""')}"`,
      `"${new Date(m.createdAt).toLocaleDateString("en-IN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to CSV respecting Active Filters (Requirement 9)
  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        search,
        state: filterState,
        district: filterDistrict,
        wing: filterWing,
        status: filterStatus,
        page: "1",
        limit: "1000",
      });
      if (startDate) queryParams.set("startDate", startDate);
      if (endDate) queryParams.set("endDate", endDate);
      if (sortField) {
        queryParams.set("sortField", sortField);
        queryParams.set("sortOrder", sortOrder);
      }

      const res = await fetch(getApiUrl(`/api/members/admin/all?${queryParams.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        exportMembersToCsv(json.data, "msd_members_filtered_export");
        return;
      }
    } catch (e) {
      console.warn("Could not fetch full filtered dataset for CSV, falling back to local list:", e);
    }
    exportMembersToCsv(members, "msd_members_export");
  };

  // Export Selected Members to CSV (Requirement 8)
  const handleExportSelected = () => {
    const selected = members.filter((m) => selectedMemberIds.includes(m._id));
    if (selected.length === 0) {
      alert("No members selected for export.");
      return;
    }
    exportMembersToCsv(selected, `msd_members_selected_${selected.length}`);
  };

  // Confirm Bulk Member Approval (Requirement 8)
  const handleConfirmBulkApprove = async () => {
    if (!token || selectedMemberIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/members/admin/bulk-status"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberIds: selectedMemberIds,
          status: "APPROVED",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Bulk approval failed");

      setStatusMessage(`Successfully approved ${selectedMemberIds.length} members! Official ID cards activated.`);
      setTimeout(() => setStatusMessage(null), 4000);
      setSelectedMemberIds([]);
      setBulkApproveModalOpen(false);
      fetchMembers(page, limit);
    } catch (err: any) {
      alert("Bulk approve failed: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };



  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!token) {
    return (
      <PageLayout hideHeader hideFooter>
        <section className="relative h-screen max-h-screen bg-[#faf9f5] flex flex-col justify-between overflow-hidden">
          {/* Subtle Ambient Background Lighting & Architectural Dot Grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Architectural Matrix Grid */}
            <div
              className="absolute inset-0 opacity-[0.4]"
              style={{
                backgroundImage: `radial-gradient(#d6cfc4 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
              }}
            />
            {/* Tricolor Ambient Glow Orbs */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-gradient-to-b from-[#FF6200]/12 via-[#FF9933]/6 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-[360px] h-[360px] bg-[#138808]/8 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-24 w-[300px] h-[300px] bg-[#FF9933]/7 rounded-full blur-3xl" />
          </div>

          {/* Top Executive Navigation Bar */}
          <header className="relative z-10 w-full px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-stone-200/60 bg-white/70 backdrop-blur-md shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-[#FF6200] transition-colors py-1 px-2.5 rounded-lg hover:bg-stone-100/80 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Return to Public Portal</span>
            </Link>
          </header>

          {/* Main Login Card Container */}
          <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-2 sm:py-4 overflow-y-auto no-scrollbar">
            <div className="max-w-[420px] w-full mx-auto my-auto">
              {/* Card Container */}
              <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-[0_20px_50px_rgba(20,20,19,0.07)] rounded-2xl p-6 sm:p-7 relative overflow-hidden transition-all">
                {/* Tricolor National Stripe */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FF9933] to-[#138808] absolute top-0 left-0 right-0" />

                {/* Header Branding */}
                <div className="flex flex-col items-center text-center mb-5 pt-0.5">
                  {/* Emblem */}
                  <div className="mb-2.5">
                    <img
                      src="/logo.png"
                      alt="MSD Official Logo"
                      className="w-14 h-14 rounded-full mx-auto object-contain"
                    />
                  </div>

                  {/* Restricted Access Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[10px] font-bold tracking-wider uppercase text-[#c74c00] mb-2.5 shadow-2xs">
                    <Shield size={11} className="text-[#FF6200]" />
                    <span>Restricted Cadre Access</span>
                  </div>

                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    Maha Seva Dal
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#FF6200] uppercase tracking-wider mt-0.5">
                    Central Cadre Administration Portal
                  </p>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                    Official Member Registry & Credential Management
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="admin-username"
                      className="block text-xs font-semibold text-stone-700 mb-1"
                    >
                      Admin Username
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                        <User size={15} />
                      </div>
                      <input
                        id="admin-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Enter admin username"
                        value={username}
                        disabled={loginLoading}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (loginError) setLoginError("");
                        }}
                        required
                        className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#FF6200] focus:ring-4 focus:ring-[#FF6200]/15 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-password"
                      className="block text-xs font-semibold text-stone-700 mb-1"
                    >
                      Security Password
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter security password"
                        value={password}
                        disabled={loginLoading}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError("");
                        }}
                        required
                        className="w-full text-sm pl-10 pr-11 py-2.5 rounded-xl border border-stone-300 bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#FF6200] focus:ring-4 focus:ring-[#FF6200]/15 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      />
                      <button
                        type="button"
                        disabled={loginLoading}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 p-1 text-stone-400 hover:text-stone-700 focus:text-[#FF6200] focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Session */}
                  <div className="flex items-center text-[11px] pt-0.5">
                    <label className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-stone-300 text-[#FF6200] focus:ring-[#FF6200]/30 accent-[#FF6200] cursor-pointer"
                        defaultChecked
                      />
                      <span>Remember session</span>
                    </label>
                  </div>

                  {sessionTimeoutMsg && (
                    <div
                      role="alert"
                      className="flex items-center gap-2.5 p-2.5 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200/90 rounded-xl shadow-xs transition-all duration-200"
                    >
                      <Clock size={15} className="shrink-0 text-amber-600" />
                      <span>{sessionTimeoutMsg}</span>
                    </div>
                  )}

                  {loginError && (
                    <div
                      role="alert"
                      className="flex items-center gap-2.5 p-2.5 text-xs font-medium text-[#d92d20] bg-[#fef3f2] border border-[#fecdca] rounded-xl shadow-xs transition-all duration-200"
                    >
                      <AlertCircle size={15} className="shrink-0 text-[#d92d20]" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full text-xs sm:text-sm py-2.5 sm:py-3 font-semibold text-white bg-gradient-to-r from-[#FF6200] to-[#E55500] hover:from-[#E55500] hover:to-[#CC4400] rounded-xl flex justify-center items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Sign In to Admin Portal</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Security Advisory */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[11px] text-stone-500 text-center">
                  <Shield size={12} className="text-stone-400 shrink-0" />
                  <span>Authorized Central Secretariat & State Cadre Incharges Only</span>
                </div>
              </div>
            </div>
          </main>

          {/* Minimalist Dedicated Admin Footer */}
          <footer className="relative z-10 py-2.5 px-4 sm:px-8 text-center text-[11px] text-stone-500 border-t border-stone-200/60 bg-white/60 backdrop-blur-sm shrink-0">
            <span>
              Maha Seva Dal (Estd. 1947) · National Cadre Management System · All rights reserved
            </span>
          </footer>


        </section>
      </PageLayout>
    );
  }

  // ─── AUTHENTICATED DASHBOARD ───────────────────────────────────────────────
  const navItems: Array<{
    id:
      | "dashboard"
      | "directory"
      | "analytics"
      | "donations"
      | "bot-messages"
      | "simulator"
      | "crm-inbox"
      | "crm-leads"
      | "leads"
      | "crm-templates";
    label: string;
    shortLabel: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
    section?: "main" | "bot" | "crm";
  }> = [
    {
      id: "dashboard",
      label: "Dashboard",
      shortLabel: "Dashboard",
      subtitle: "Executive Command Center · National Cadre Overview & Quick Actions",
      icon: <LayoutGrid size={16} className="shrink-0" />,
      section: "main",
    },
    {
      id: "directory",
      label: "Cadre Directory",
      shortLabel: "Cadre Directory",
      subtitle: "National Cadre Management, Verification & Digital ID Issuance",
      icon: <Users size={16} className="shrink-0" />,
      section: "main",
      badge: (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold transition-colors shrink-0 ${
            activeAdminTab === "directory"
              ? "bg-white/25 text-white"
              : "bg-amber-100 text-amber-900 border border-amber-300"
          }`}
          title={`${stats.pending} pending applications awaiting review`}
        >
          {stats.pending}
        </span>
      ),
    },
    {
      id: "analytics",
      label: "Cadre Intelligence & Demographics",
      shortLabel: "Intelligence",
      subtitle: "Real-Time Territorial Footprint, Operational Wings & Demographics",
      icon: <BarChart3 size={16} className="shrink-0" />,
      section: "main",
      badge: (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 whitespace-nowrap ${
            activeAdminTab === "analytics"
              ? "bg-white/25 text-white"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          Live Metrics
        </span>
      ),
    },
    {
      id: "donations",
      label: "Donations & Seva Fund",
      shortLabel: "Donations",
      subtitle: "Financial Contributions, Seva Fund Ledger & 80G Receipts",
      icon: <HeartHandshake size={16} className="shrink-0" />,
      section: "main",
      badge:
        pendingDonationsCount > 0 ? (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
              activeAdminTab === "donations"
                ? "bg-white/25 text-white"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
            title={`${pendingDonationsCount} pending donations awaiting review`}
          >
            {pendingDonationsCount}
          </span>
        ) : undefined,
    },
    {
      id: "bot-messages",
      label: "Bot Messages & Media",
      shortLabel: "Bot Messages",
      subtitle: "Manage WhatsApp Bot Interactive Messages, Prompts & Media",
      icon: <MessageSquare size={16} className="shrink-0" />,
      section: "bot",
    },
    {
      id: "simulator",
      label: "Flow Simulator",
      shortLabel: "Flow Simulator",
      subtitle: "Interactive WhatsApp Bot Flow Simulator & Meta Webhook Tester",
      icon: <Smartphone size={16} className="shrink-0" />,
      section: "bot",
    },
    {
      id: "crm-inbox",
      label: "Inbox",
      shortLabel: "Inbox",
      subtitle: "WhatsApp Incoming & Outgoing Customer Conversations",
      icon: <Inbox size={16} className="shrink-0" />,
      section: "crm",
    },
    {
      id: "crm-leads",
      label: "Leads",
      shortLabel: "Leads",
      subtitle: "Completed & Incomplete Registration Leads Across Web & WhatsApp",
      icon: <UserPlus size={16} className="shrink-0" />,
      section: "crm",
    },
    {
      id: "leads",
      label: "Incomplete Registrations",
      shortLabel: "Incomplete",
      subtitle: "Track & Recover Drop-off Candidates Across Web & WhatsApp",
      icon: <Clock size={16} className="shrink-0" />,
      section: "crm",
    },
    {
      id: "crm-templates",
      label: "Templates",
      shortLabel: "Templates",
      subtitle: "WhatsApp Message Templates & Direct Meta Approval Status",
      icon: <Layout size={16} className="shrink-0" />,
      section: "crm",
    },
  ];

  const activeNavMeta = navItems.find((item) => item.id === activeAdminTab) || navItems[0];
  const approvalRatePct = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  const handleSidebarWheel = (isMobile: boolean) => (e: React.WheelEvent<HTMLDivElement>) => {
    const navRef = isMobile ? mobileSidebarNavRef.current : desktopSidebarNavRef.current;
    if (!navRef) return;
    if (!navRef.contains(e.target as Node)) {
      navRef.scrollTop += e.deltaY;
    }
  };

  const renderSidebarContent = (isMobileDrawer = false) => {
    const collapsed = !isMobileDrawer && sidebarCollapsed;
    const navRef = isMobileDrawer ? mobileSidebarNavRef : desktopSidebarNavRef;

    return (
      <div
        data-lenis-prevent
        onWheel={handleSidebarWheel(isMobileDrawer)}
        className="flex flex-col h-full justify-between bg-white text-ink select-none overflow-hidden"
      >
        {/* Top Pinned Header: Tricolor Bar + Brand Identity */}
        <div className="shrink-0">
          {/* Tricolor Accent Stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF6200] via-[#FF9933] to-[#138808]" />

          {/* Brand Header */}
          <div
            className={`flex items-center ${
              collapsed ? "justify-center px-2 py-3" : "justify-between px-3.5 py-3"
            } border-b border-stone-200/80`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src="/logo.png"
                  alt="Maha Seva Dal"
                  className="w-8 h-8 rounded-full object-contain ring-2 ring-[#FF6200]/20 bg-orange-50/40 p-0.5 shadow-2xs"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                  title="System Online"
                />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h2 className="font-serif text-sm font-black text-stone-900 leading-tight truncate">
                    Maha Seva Dal
                  </h2>
                  <p className="text-[9.5px] font-bold tracking-wider uppercase text-[#FF6200] truncate mt-0.5">
                    Central Admin · 1947
                  </p>
                </div>
              )}
            </div>

            {isMobileDrawer ? (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            ) : (
              !collapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose size={15} />
                </button>
              )
            )}
          </div>

          {collapsed && !isMobileDrawer && (
            <div className="flex justify-center py-2 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-[#FF6200] hover:bg-orange-50/60 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <PanelLeftOpen size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Middle Navigation Menu with Soft Gradient Fade */}
        <div data-lenis-prevent className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Subtle top & bottom edge gradient fade so scrolled items never look chopped off */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-stone-200/40 to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-stone-200/40 to-transparent z-10" />

          <div
            ref={navRef}
            data-lenis-prevent
            onWheel={(e) => {
              // Ensure smooth, immediate 60fps wheel scrolling across all Windows browsers
              e.currentTarget.scrollTop += e.deltaY;
            }}
            className="flex flex-col min-h-0 flex-1 overflow-y-auto custom-scrollbar sidebar-scrollbar py-1"
            style={{ overscrollBehavior: "contain" }}
          >
            {/* Primary Navigation Menu */}
            <div className="px-2.5 py-2.5 space-y-3.5 flex-1">
              <div>
                {!collapsed && (
                  <div className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Main Navigation
                  </div>
                )}
                <nav className="space-y-1.5" aria-label="Admin Portal Navigation">
                {navItems
                  .filter((item) => item.section === "main")
                  .map((item) => {
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveAdminTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        title={collapsed ? `${item.label} — ${item.subtitle}` : item.subtitle}
                        className={`w-full flex items-center ${
                          collapsed ? "justify-center px-2 py-2.5" : "justify-between gap-2 px-3 py-2.5"
                        } rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer group text-left ${
                          isActive
                            ? "bg-gradient-to-r from-[#FF6200] to-[#E55500] text-white shadow-sm shadow-[#FF6200]/25"
                            : "bg-white text-stone-700 hover:text-stone-950 hover:bg-stone-100/90 border border-stone-200/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`transition-colors ${
                              isActive ? "text-white" : "text-[#FF6200] group-hover:text-[#D65000]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && <span className="leading-snug">{item.label}</span>}
                        </div>
                        {!collapsed && item.badge}
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* WHATSAPP BOT Section */}
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  WHATSAPP BOT
                </div>
              )}
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.section === "bot")
                  .map((item) => {
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveAdminTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        title={collapsed ? `${item.label} — ${item.subtitle}` : item.subtitle}
                        className={`w-full flex items-center ${
                          collapsed ? "justify-center px-2 py-2.5" : "justify-between gap-2 px-3 py-2.5"
                        } rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group text-left ${
                          isActive
                            ? "bg-gradient-to-r from-[#FF6200] to-[#E55500] text-white shadow-sm shadow-[#FF6200]/25 font-bold"
                            : "text-stone-700 hover:text-stone-950 hover:bg-stone-100/90"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`transition-colors ${
                              isActive ? "text-white" : "text-stone-500 group-hover:text-[#FF6200]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && <span className="leading-snug">{item.label}</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* CRM Section */}
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  CRM
                </div>
              )}
              <div className="space-y-1">
                {navItems
                  .filter((item) => item.section === "crm")
                  .map((item) => {
                    const isActive = activeAdminTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveAdminTab(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        title={collapsed ? `${item.label} — ${item.subtitle}` : item.subtitle}
                        className={`w-full flex items-center ${
                          collapsed ? "justify-center px-2 py-2.5" : "justify-between gap-2 px-3 py-2.5"
                        } rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group text-left ${
                          isActive
                            ? "bg-gradient-to-r from-[#FF6200] to-[#E55500] text-white shadow-sm shadow-[#FF6200]/25 font-bold"
                            : "text-stone-700 hover:text-stone-950 hover:bg-stone-100/90"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`transition-colors ${
                              isActive ? "text-white" : "text-stone-500 group-hover:text-[#FF6200]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && <span className="leading-snug">{item.label}</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Quick System Directives */}
            <div>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Quick Actions
                </div>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setCardSettingsModalOpen(true);
                    setMobileSidebarOpen(false);
                  }}
                  title="Configure Official ID Card Seal & Authorized Signatory"
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
                  } rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-colors cursor-pointer group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Award size={15} className="text-stone-500 group-hover:text-[#FF6200] shrink-0 transition-colors" />
                    {!collapsed && <span className="truncate">ID Seal & Signatory</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleExportCSV();
                    setMobileSidebarOpen(false);
                  }}
                  title="Download Cadre Directory CSV"
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
                  } rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-colors cursor-pointer group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Download size={15} className="text-stone-500 group-hover:text-[#FF6200] shrink-0 transition-colors" />
                    {!collapsed && <span className="truncate">Export Cadre CSV</span>}
                  </div>
                </button>

                <Link
                  to="/"
                  title="Open Public Website Portal"
                  className={`w-full flex items-center ${
                    collapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-2"
                  } rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 transition-colors group`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ExternalLink size={15} className="text-stone-500 group-hover:text-[#FF6200] shrink-0 transition-colors" />
                    {!collapsed && <span className="truncate">Public Portal</span>}
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Bottom Admin Session Footer & Logout */}
        <div className="p-3 border-t border-stone-200/80 bg-stone-50/60 shrink-0">
          {collapsed ? (
            <button
              type="button"
              onClick={() => handleLogout()}
              title="Logout of Admin Portal"
              className="w-full flex items-center justify-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FF6200]/10 border border-[#FF6200]/25 text-[#FF6200] flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate">National Executive</div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Authorized Session</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleLogout()}
                title="Sign Out"
                className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageLayout hideHeader hideFooter>
      <div data-lenis-prevent className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[#F7F6F2] text-ink">
        {/* ─── MOBILE SLIDE-OVER SIDEBAR DRAWER ─── */}
        {mobileSidebarOpen && (
          <div data-lenis-prevent className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside
              data-lenis-prevent
              onWheel={handleSidebarWheel(true)}
              className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl"
            >
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* ─── DESKTOP PERSISTENT LEFT SIDEBAR (100% FULL SCREEN HEIGHT) ─── */}
        <aside
          data-lenis-prevent
          onWheel={handleSidebarWheel(false)}
          className={`hidden lg:flex flex-col shrink-0 h-screen z-30 border-r border-stone-200/90 bg-white shadow-2xs transition-all duration-200 ${
            sidebarCollapsed ? "w-[68px]" : "w-56 xl:w-64"
          }`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* ─── MAIN WORKSPACE COLUMN (ALIGNED TOP-TO-BOTTOM WITH SIDEBAR) ─── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-screen lg:overflow-hidden">
          {/* Top Pinned Workspace Header */}
          <header className="shrink-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-3 sm:px-4 py-2">
            <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Hamburger Trigger */}
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 shadow-2xs shrink-0"
                  aria-label="Open navigation menu"
                >
                  <Menu size={18} />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-serif text-base sm:text-xl font-bold text-stone-900 leading-tight truncate">
                      {activeNavMeta.label}
                    </h1>
                    <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6200] border border-orange-200/80">
                      Central Secretariat
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-editorial truncate hidden sm:block">
                    {activeNavMeta.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Action Toolbar */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleHeaderRefresh}
                  className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                  title="Refresh active view"
                >
                  <RefreshCw size={13} className={refreshing || loading ? "animate-spin text-[#FF6200]" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLogout()}
                  className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile & Tablet Horizontal Scrollable Navigation Strip (Responsive Touch Bar) */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 mt-2 border-t border-stone-200/70 -mx-1 px-1">
              {navItems.map((item) => {
                const isActive = activeAdminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveAdminTab(item.id)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#FF6200] text-white shadow-xs"
                        : "bg-stone-100/90 text-stone-600 hover:text-stone-900 border border-stone-200/80"
                    }`}
                  >
                    {item.icon}
                    <span>{item.shortLabel}</span>
                    {item.badge}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Main Workspace Body */}
          <div
            className={`flex-1 min-h-0 w-full ${
              activeAdminTab === "crm-inbox"
                ? "px-2 sm:px-3 py-1.5 flex flex-col lg:overflow-hidden"
                : "px-3 sm:px-5 py-3 sm:py-4 overflow-y-auto custom-scrollbar scroll-smooth"
            }`}
          >
            {/* Status Alert Banner */}
            {statusMessage && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {activeAdminTab === "dashboard" ? (
              /* ─── VIEW MODE 0: EXECUTIVE COMMAND DASHBOARD ─── */
              <div className="space-y-5">
                {/* Top KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div
                    onClick={() => {
                      setFilterStatus("ALL");
                      setActiveAdminTab("directory");
                    }}
                    className="bg-white border border-stone-200/90 hover:border-[#FF6200] p-4 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        Total Registrations
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6200] flex items-center justify-center">
                        <Users size={15} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="font-serif text-2xl sm:text-3xl font-black text-ink leading-none">
                        {stats.total}
                      </div>
                      <span className="text-[11px] text-[#FF6200] font-semibold hover:underline">
                        Open Directory →
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterStatus("PENDING");
                      setActiveAdminTab("directory");
                    }}
                    className="bg-white border border-amber-200/90 hover:border-amber-500 p-4 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Pending Verification
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={15} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="font-serif text-2xl sm:text-3xl font-black text-amber-900 leading-none">
                        {stats.pending}
                      </div>
                      <span className="text-[11px] text-amber-700 font-semibold hover:underline">
                        Review Queue →
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterStatus("APPROVED");
                      setActiveAdminTab("directory");
                    }}
                    className="bg-white border border-emerald-200/90 hover:border-emerald-500 p-4 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Approved Members
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={15} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="font-serif text-2xl sm:text-3xl font-black text-emerald-900 leading-none">
                        {stats.approved}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold hover:underline">
                        View Verified →
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setFilterStatus("REJECTED");
                      setActiveAdminTab("directory");
                    }}
                    className="bg-white border border-rose-200/90 hover:border-rose-500 p-4 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5 select-none"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                        Rejected
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <XCircle size={15} />
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="font-serif text-2xl sm:text-3xl font-black text-rose-900 leading-none">
                        {stats.rejected}
                      </div>
                      <span className="text-[11px] text-rose-700 font-semibold hover:underline">
                        View Rejected →
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5 Core Operational Modules Quick-Access Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h2 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                      Portal Modules & Command Suites
                    </h2>
                    <span className="text-[11px] text-stone-500">Select a module to manage operations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {navItems
                      .filter((item) => item.id !== "dashboard")
                      .map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveAdminTab(item.id)}
                          className="bg-white hover:bg-orange-50/30 border border-stone-200/90 hover:border-[#FF6200] rounded-xl p-3.5 text-left transition-all shadow-2xs hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <div className="w-8 h-8 rounded-lg bg-[#FF6200]/10 text-[#FF6200] group-hover:bg-[#FF6200] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                              {item.icon}
                            </div>
                            {item.badge}
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-[13px] text-stone-900 group-hover:text-[#FF6200] transition-colors leading-snug">
                              {item.label}
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Two-Column Snapshot: Recent Enrollments Queue + Wing Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Recent / Pending Cadre Enrollments */}
                  <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-stone-200/80 flex items-center justify-between gap-2 bg-stone-50/50">
                      <div className="flex items-center gap-2">
                        <Users size={15} className="text-[#FF6200]" />
                        <h3 className="font-serif font-bold text-sm text-stone-900">
                          Recent Cadre Enrollments
                        </h3>
                        {stats.pending > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {stats.pending} Pending
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveAdminTab("directory")}
                        className="text-xs font-semibold text-[#FF6200] hover:underline cursor-pointer"
                      >
                        View All ({stats.total}) →
                      </button>
                    </div>

                    <div className="divide-y divide-stone-100 flex-1">
                      {members.slice(0, 6).map((member) => (
                        <div
                          key={member._id}
                          onClick={() => handleOpenMember(member)}
                          className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.fullName}
                                className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-orange-50 text-[#FF6200] border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {member.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-stone-900 truncate">
                                {member.fullName}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                <span className="font-mono text-stone-600">{member.registrationId}</span>
                                {" · "}
                                {member.district ? `${member.district}, ${member.state}` : member.state}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {member.status === "PENDING" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenMember(member)}
                                className="px-2.5 py-1 rounded-md bg-[#FF6200] hover:bg-[#D65000] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldCheck size={12} />
                                <span>Review</span>
                              </button>
                            ) : (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                  member.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {member.status === "APPROVED" ? "Approved" : "Rejected"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {members.length === 0 && (
                        <div className="p-8 text-center text-xs text-stone-500">
                          No cadre records found.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Wing Summary */}
                  <div className="bg-white border border-stone-200/90 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3">
                        <div className="flex items-center gap-2">
                          <Briefcase size={15} className="text-[#FF6200]" />
                          <h3 className="font-serif font-bold text-sm text-stone-900">
                            Wing Distribution
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveAdminTab("analytics")}
                          className="text-[11px] font-semibold text-[#FF6200] hover:underline cursor-pointer"
                        >
                          Full Analytics →
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {WINGS.filter((w) => w !== "ALL").map((wingName) => {
                          const match = (stats.wingBreakdown || []).find((w) => w._id === wingName);
                          const count = match ? match.count : 0;
                          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                          return (
                            <div key={wingName} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-stone-700 font-medium truncate pr-2">{wingName}</span>
                                <span className="font-mono font-bold text-[#FF6200] shrink-0">
                                  {count} <span className="text-stone-400 font-normal text-[10px]">({pct}%)</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#FF6200] to-[#E05500] rounded-full"
                                  style={{ width: `${Math.max(3, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500">Verification Rate</span>
                      <span className="font-mono font-bold text-emerald-700">{approvalRatePct}% Approved</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeAdminTab === "directory" ? (
              <>
                {/* KPI Statistics Row (Clickable to Filter) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3">
            <div
              onClick={() => setFilterStatus("ALL")}
              className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 select-none ${
                filterStatus === "ALL"
                  ? "border-[#FF6200] ring-1.5 ring-[#FF6200]/30 bg-[#faf6ee]/50"
                  : "border-hairline hover:border-[#FF6200]/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-bold text-muted-editorial uppercase tracking-wider">
                  Total Registrations
                </span>
                <Users size={15} className="text-[#FF6200]" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-2xl font-black text-ink leading-none">{stats.total}</div>
                <span className="text-[10px] text-[#FF6200] font-semibold hover:underline">View All →</span>
              </div>
            </div>

            <div
              onClick={() => setFilterStatus("PENDING")}
              className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 select-none ${
                filterStatus === "PENDING"
                  ? "border-amber-500 ring-1.5 ring-amber-400/40 bg-amber-50/70"
                  : "border-amber-200/80 hover:border-amber-400 bg-amber-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">
                  Pending Verification
                </span>
                <Clock size={15} className="text-amber-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-2xl font-black text-amber-900 leading-none">{stats.pending}</div>
                <span className="text-[10px] text-amber-700 font-semibold hover:underline">Filter Pending →</span>
              </div>
            </div>

            <div
              onClick={() => setFilterStatus("APPROVED")}
              className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 select-none ${
                filterStatus === "APPROVED"
                  ? "border-emerald-500 ring-1.5 ring-emerald-400/40 bg-emerald-50/70"
                  : "border-emerald-200/80 hover:border-emerald-400 bg-emerald-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider">
                  Approved Members
                </span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-2xl font-black text-emerald-900 leading-none">{stats.approved}</div>
                <span className="text-[10px] text-emerald-700 font-semibold hover:underline">Filter Approved →</span>
              </div>
            </div>

            <div
              onClick={() => setFilterStatus("REJECTED")}
              className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs hover:-translate-y-0.5 select-none ${
                filterStatus === "REJECTED"
                  ? "border-rose-500 ring-1.5 ring-rose-400/40 bg-rose-50/70"
                  : "border-rose-200/80 hover:border-rose-400 bg-rose-50/20"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10.5px] font-bold text-rose-800 uppercase tracking-wider">
                  Rejected
                </span>
                <XCircle size={15} className="text-rose-600" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-serif text-2xl font-black text-rose-900 leading-none">{stats.rejected}</div>
                <span className="text-[10px] text-rose-700 font-semibold hover:underline">Filter Rejected →</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls Panel */}
          <div className="bg-white border border-hairline rounded-xl p-3 shadow-2xs mb-3 space-y-2.5">
            {/* Top Row: Search Input (left) + Match Counter & Reset Action (right) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-editorial" />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, Reg ID, District, Wing..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-8 py-2 h-9 rounded-lg border border-hairline bg-surface-soft/60 hover:bg-surface-soft text-ink placeholder:text-muted-editorial focus:outline-none focus:border-[#FF6200] focus:bg-white focus:ring-1 focus:ring-[#FF6200]/25 transition-all font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-editorial hover:text-ink text-xs font-bold p-0.5"
                    title="Clear search text"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Matching Records Pill & Quick Clear */}
              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                <div className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-surface-soft/80 border border-hairline text-xs font-medium text-stone-600 select-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-ink font-bold">{totalCount}</strong> matching records
                  </span>
                </div>

                {(search || filterState !== "ALL" || filterDistrict !== "ALL" || filterWing !== "ALL" || filterStatus !== "ALL" || startDate || endDate || sortField) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilterState("ALL");
                      setFilterDistrict("ALL");
                      setFilterWing("ALL");
                      setFilterStatus("ALL");
                      setStartDate("");
                      setEndDate("");
                      setSortField("");
                      setSortOrder("asc");
                      setPage(1);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
                    title="Clear all active filters"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Row: Unified Filter Strip (Aligned & Styled) */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-hairline/60">
              <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-muted-editorial uppercase tracking-wider mr-1 select-none">
                <Filter size={12} className="text-[#FF6200]" />
                <span>Filters:</span>
              </div>

              {/* State Filter */}
              <div className="relative">
                <select
                  value={filterState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setFilterState(st);
                    setFilterDistrict("ALL");
                  }}
                  className="appearance-none text-xs pl-3 pr-7 py-1.5 h-9 rounded-lg border border-hairline bg-surface-soft/60 hover:bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200]/25 font-medium cursor-pointer transition-colors"
                >
                  <option value="ALL">All States</option>
                  {INDIAN_STATES.filter((s) => s !== "ALL").map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-editorial pointer-events-none" />
              </div>

              {/* District Filter */}
              <div className="relative">
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="appearance-none text-xs pl-3 pr-7 py-1.5 h-9 rounded-lg border border-hairline bg-surface-soft/60 hover:bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200]/25 font-medium cursor-pointer max-w-[160px] truncate transition-colors"
                >
                  <option value="ALL">All Districts</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-editorial pointer-events-none" />
              </div>

              {/* Wing Filter */}
              <div className="relative">
                <select
                  value={filterWing}
                  onChange={(e) => setFilterWing(e.target.value)}
                  className="appearance-none text-xs pl-3 pr-7 py-1.5 h-9 rounded-lg border border-hairline bg-surface-soft/60 hover:bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200]/25 font-medium cursor-pointer transition-colors"
                >
                  <option value="ALL">All Assigned Wings</option>
                  {WINGS.filter((w) => w !== "ALL").map((wg) => (
                    <option key={wg} value={wg}>
                      {wg}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-editorial pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none text-xs pl-3 pr-7 py-1.5 h-9 rounded-lg border border-hairline bg-surface-soft/60 hover:bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200]/25 font-semibold cursor-pointer transition-colors"
                >
                  <option value="ALL">Status: All</option>
                  <option value="PENDING">🟡 Pending</option>
                  <option value="APPROVED">🟢 Approved</option>
                  <option value="REJECTED">🔴 Rejected</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-editorial pointer-events-none" />
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-1.5 bg-surface-soft/60 hover:bg-surface-soft border border-hairline rounded-lg px-2.5 h-9 text-xs transition-colors">
                <Calendar size={13} className="text-muted-editorial shrink-0" />
                <span className="text-[10px] font-semibold text-muted-editorial uppercase">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-ink text-xs focus:outline-none cursor-pointer"
                  title="Filter enrollments from date"
                />
                <span className="text-[10px] font-semibold text-muted-editorial uppercase ml-1">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-ink text-xs focus:outline-none cursor-pointer"
                  title="Filter enrollments up to date"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions Floating Bar (Requirement 8) */}
          {selectedMemberIds.length > 0 && (
            <div className="bg-amber-50/90 border border-amber-300 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold">
                  {selectedMemberIds.length}
                </span>
                <span>
                  {selectedMemberIds.length === 1
                    ? "1 member selected"
                    : `${selectedMemberIds.length} members selected`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkApproveModalOpen(true)}
                  disabled={bulkActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} />
                  <span>Approve Selected ({selectedMemberIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportSelected}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export Selected</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkDeleteModalOpen(true)}
                  disabled={bulkActionLoading || deleteLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  title={`Delete all ${selectedMemberIds.length} selected members from MongoDB`}
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedMemberIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMemberIds([])}
                  className="text-xs text-muted-editorial hover:text-ink px-2 py-1 font-medium cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* VIEW MODE 1: CADRE DIRECTORY TABLE & CARDS */}
          <div className="bg-white border border-hairline rounded-xl shadow-xs overflow-hidden mb-6">
              {loading && members.length === 0 ? (
                <div className="p-16 text-center text-muted-editorial text-sm">
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  <span>Loading member records from MongoDB...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="p-16 text-center">
                  <Users size={36} className="mx-auto text-muted-editorial mb-3" />
                  <h3 className="font-serif font-bold text-base text-ink mb-1">No Members Found</h3>
                  <p className="text-xs text-muted-editorial mb-4">
                    There are no registrations matching your active filters.
                  </p>
                  {(search || filterState !== "ALL" || filterDistrict !== "ALL" || filterWing !== "ALL" || filterStatus !== "ALL" || startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setFilterState("ALL");
                        setFilterDistrict("ALL");
                        setFilterWing("ALL");
                        setFilterStatus("ALL");
                        setStartDate("");
                        setEndDate("");
                        setSortField("");
                        setSortOrder("asc");
                        setPage(1);
                      }}
                      className="btn-secondary text-xs px-4 py-2 inline-flex mr-2"
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link to="/register" className="btn-primary-coral text-xs px-4 py-2 inline-flex">
                    Enroll First Member
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table View (hidden on mobile, visible on md+) (Requirement 7: Sticky Header, Equal Height, Hover Highlight) */}
                  <div className="hidden md:block overflow-x-auto w-full" data-lenis-prevent>
                    <table
                      className="w-full text-left border-collapse table-auto"
                      style={{ tableLayout: "auto", width: "100%" }}
                    >
                      <thead className="sticky top-0 z-10 bg-surface-soft border-b border-hairline shadow-2xs">
                        <tr className="bg-surface-soft text-[11px] font-semibold text-muted-editorial uppercase tracking-wider">
                          {/* Checkbox (Requirement 8) */}
                          <th className="py-3 px-2 text-center w-9 shrink-0">
                            <input
                              type="checkbox"
                              aria-label="Select all members on this page"
                              checked={members.length > 0 && selectedMemberIds.length === members.length}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedMemberIds(members.map((m) => m._id));
                                else setSelectedMemberIds([]);
                              }}
                              className="rounded border-hairline text-[#FF6200] focus:ring-[#FF6200] w-4 h-4 cursor-pointer accent-[#FF6200]"
                            />
                          </th>
                          {/* Member Profile */}
                          <th className="py-3 px-3 text-left min-w-[145px] xl:min-w-[170px]">
                            <span>Member Profile</span>
                          </th>
                          {/* Reg ID */}
                          <th className="py-3 px-2 text-left min-w-[125px] xl:min-w-[140px] whitespace-nowrap" style={{ whiteSpace: "nowrap" }}>Reg ID</th>
                          {/* State & District */}
                          <th className="py-3 px-2 text-left min-w-[115px] xl:min-w-[130px]">State & District</th>
                          {/* Wing */}
                          <th className="py-3 px-2 text-left min-w-[110px] xl:min-w-[125px]">Wing</th>
                          {/* Contact */}
                          <th className="py-3 px-2 text-left min-w-[120px] xl:min-w-[135px]">Contact</th>
                          {/* Enrolled */}
                          <th
                            className="py-3 px-2 text-left min-w-[85px] xl:min-w-[100px] whitespace-nowrap"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <span>Enrolled</span>
                          </th>
                          {/* Status */}
                          <th
                            className="py-3 px-2 text-center min-w-[95px] xl:min-w-[110px] whitespace-nowrap"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <span>Status</span>
                          </th>
                          {/* Actions (Requirement 1) */}
                          <th className="py-3 px-2 text-center min-w-[155px] whitespace-nowrap" style={{ whiteSpace: "nowrap" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline text-[13px]">
                        {sortedMembers.map((member) => {
                          return (
                            <tr
                              key={member._id}
                              onDoubleClick={() => handleOpenMember(member)}
                              title="Double-click to view complete member dossier & ID card"
                              className="hover:bg-amber-50/40 transition-colors h-16 cursor-pointer select-none"
                            >
                              {/* Checkbox (Requirement 8) */}
                              <td className="py-2.5 px-2 text-center w-9 shrink-0 align-middle" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${member.fullName}`}
                                  checked={selectedMemberIds.includes(member._id)}
                                  onChange={() => toggleSelectMember(member._id)}
                                  className="rounded border-hairline text-[#FF6200] focus:ring-[#FF6200] w-4 h-4 cursor-pointer accent-[#FF6200]"
                                />
                              </td>

                              {/* Member Profile (Requirement 4: No profession line if empty) */}
                              <td className="py-2.5 px-3 min-w-[145px] xl:min-w-[170px] align-middle">
                                <div className="flex items-center gap-2.5">
                                  {member.photoUrl ? (
                                    <img
                                      src={member.photoUrl}
                                      alt={member.fullName}
                                      onError={(e) => {
                                        if (!e.currentTarget.dataset.retried && member.photoUrl) {
                                          e.currentTarget.dataset.retried = "1";
                                          e.currentTarget.src = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(member.photoUrl)}`);
                                        }
                                      }}
                                      className="w-9 h-9 rounded-full object-cover border border-hairline shadow-2xs flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-surface-soft border border-hairline flex items-center justify-center font-bold text-[#FF6200] text-xs flex-shrink-0">
                                      {member.fullName.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-ink font-sans text-[13px] leading-tight truncate" title={member.fullName}>
                                      {member.fullName}
                                    </div>
                                    {member.profession && member.profession.trim() && (
                                      <div className="text-[11px] text-muted-editorial leading-tight truncate mt-0.5" title={member.profession.trim()}>
                                        {member.profession.trim()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Reg ID */}
                              <td className="py-2.5 px-2 font-mono font-semibold text-ink text-[12px] whitespace-nowrap min-w-[125px] xl:min-w-[140px] align-middle" style={{ whiteSpace: "nowrap" }}>
                                <span className="bg-surface-soft px-2 py-1 rounded border border-hairline whitespace-nowrap">
                                  {member.registrationId}
                                </span>
                              </td>

                              {/* State & District */}
                              <td className="py-2.5 px-2 min-w-[115px] xl:min-w-[130px] align-middle">
                                <div className="font-medium text-ink text-[13px] leading-tight truncate">{member.state}</div>
                                <div className="text-[11px] text-muted-editorial leading-tight truncate">{member.district}</div>
                              </td>

                              {/* Wing Badge (Requirement 3: light orange bg, orange text, single line, max-w with ellipsis, full name on hover) */}
                              <td className="py-2.5 px-2 min-w-[110px] xl:min-w-[125px] align-middle">
                                <span
                                  className="inline-block max-w-[125px] truncate text-[11px] font-semibold text-[#FF6200] bg-orange-50/90 border border-orange-200/80 px-2 py-0.5 rounded-full whitespace-nowrap leading-tight"
                                  title={member.wing}
                                >
                                  {member.wing}
                                </span>
                              </td>

                              {/* Contact (Requirement 4: No email line if empty) */}
                              <td className="py-2.5 px-2 min-w-[120px] xl:min-w-[135px] align-middle">
                                {member.mobile && (
                                  <div className="text-ink font-medium text-[12px] leading-tight truncate">
                                    +91 {member.mobile}
                                  </div>
                                )}
                                {member.email && member.email.trim() && (
                                  <div className="text-[11px] text-muted-editorial truncate max-w-[140px] leading-tight mt-0.5" title={member.email.trim()}>
                                    {member.email.trim()}
                                  </div>
                                )}
                              </td>

                              {/* Enrolled */}
                              <td className="py-2.5 px-2 text-muted-editorial whitespace-nowrap text-[12px] min-w-[85px] xl:min-w-[100px] align-middle" style={{ whiteSpace: "nowrap" }}>
                                {new Date(member.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>

                              {/* Status Badge & Admin Note Preview */}
                              <td className="py-2.5 px-2 text-center whitespace-nowrap min-w-[95px] xl:min-w-[110px] align-middle" style={{ whiteSpace: "nowrap" }}>
                                <div className="flex flex-col items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  {member.status === "APPROVED" ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                                      <CheckCircle2 size={12} className="shrink-0" /> Approved
                                    </span>
                                  ) : member.status === "REJECTED" ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickRemarks(member)}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap cursor-pointer transition-all active:scale-95"
                                      title={member.adminNotes ? `Click to view rejection reason: "${member.adminNotes}"` : "Click to view rejection reason"}
                                    >
                                      <XCircle size={12} className="shrink-0" /> Rejected
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                                      <Clock size={12} className="shrink-0" /> Pending
                                    </span>
                                  )}
                                  {member.status === "REJECTED" && member.adminNotes && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickRemarks(member)}
                                      className="inline-flex items-center gap-1 max-w-[125px] text-[10px] font-medium text-rose-800 bg-rose-50/90 hover:bg-rose-100 hover:border-rose-300 border border-rose-200 px-2 py-0.5 rounded-full shadow-2xs truncate cursor-pointer transition-all active:scale-95"
                                      title={`Click to view reason: "${member.adminNotes}"`}
                                    >
                                      <FileText size={9} className="shrink-0 text-rose-600" />
                                      <span className="truncate">{member.adminNotes}</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Member Actions: Review/View, Call, WhatsApp, Direct Delete (Requirements 1, 2, 6) */}
                              <td className="py-2.5 px-2 text-center whitespace-nowrap min-w-[155px] align-middle" style={{ whiteSpace: "nowrap" }}>
                                <div
                                  className="flex items-center justify-center gap-1.5 flex-nowrap"
                                  style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", flexWrap: "nowrap" }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Requirement 6: "Review" (orange primary) for Pending, "View" (outline) for Approved/Rejected */}
                                  {member.status === "PENDING" ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMember(member)}
                                      className="flex-shrink-0 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md bg-[#FF6200] hover:bg-[#D65000] text-white font-semibold text-xs shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                                      style={{ flexShrink: 0 }}
                                      title="Review & Verify Member Application"
                                    >
                                      <ShieldCheck size={13} className="shrink-0" />
                                      <span>Review</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenMember(member)}
                                      className="flex-shrink-0 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-md bg-white hover:bg-surface-soft text-ink hover:text-[#FF6200] border border-hairline hover:border-[#FF6200]/40 font-medium text-xs shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                                      style={{ flexShrink: 0 }}
                                      title={`View Official Dossier & ID Card (${member.status})`}
                                    >
                                      <Eye size={13} className="shrink-0" />
                                      <span>View</span>
                                    </button>
                                  )}

                                  {/* Requirement 2: Disable (grey out) Call icon when mobile missing */}
                                  {member.mobile && member.mobile.trim() ? (
                                    <a
                                      href={`tel:+91${member.mobile.replace(/\D/g, "")}`}
                                      className="flex-shrink-0 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
                                      style={{ flexShrink: 0 }}
                                      title={`Direct Call: ${member.fullName} (+91 ${member.mobile})`}
                                      aria-label="Call Member"
                                    >
                                      <Phone size={13} className="shrink-0" />
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="flex-shrink-0 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 text-stone-400 border border-stone-200 opacity-50 cursor-not-allowed pointer-events-none"
                                      style={{ flexShrink: 0 }}
                                      title="No mobile number provided"
                                      aria-label="Call Member (Disabled)"
                                    >
                                      <Phone size={13} className="shrink-0" />
                                    </button>
                                  )}

                                  {/* Requirement 2: Open WhatsApp CRM Inbox on click (grey out when number missing) */}
                                  {(member.whatsapp && member.whatsapp.trim()) || (member.mobile && member.mobile.trim()) ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const mob = (member.whatsapp || member.mobile || "")
                                          .replace(/\D/g, "")
                                          .slice(-10);
                                        setSelectedInboxMobile(mob);
                                        setActiveAdminTab("crm-inbox");
                                      }}
                                      className="flex-shrink-0 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
                                      style={{ flexShrink: 0 }}
                                      title={`Open WhatsApp CRM Inbox Chat: ${member.fullName}`}
                                      aria-label="WhatsApp Member"
                                    >
                                      <WhatsAppIcon size={13} />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled
                                      className="flex-shrink-0 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 text-stone-400 border border-stone-200 opacity-50 cursor-not-allowed pointer-events-none"
                                      style={{ flexShrink: 0 }}
                                      title="No WhatsApp number provided"
                                      aria-label="WhatsApp Member (Disabled)"
                                    >
                                      <WhatsAppIcon size={13} />
                                    </button>
                                  )}

                                  {/* Direct Delete Symbol Button with confirmation modal */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMember(member)}
                                    className="flex-shrink-0 shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
                                    style={{ flexShrink: 0 }}
                                    title={`Delete Record: ${member.fullName}`}
                                    aria-label={`Delete ${member.fullName}`}
                                  >
                                    <Trash2 size={13} className="shrink-0" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Requirement 10: Mobile Card Layout (block on mobile, hidden on md+) */}
                  <div className="block md:hidden divide-y divide-hairline">
                    {sortedMembers.map((member) => (
                      <div
                        key={member._id}
                        onDoubleClick={() => handleOpenMember(member)}
                        title="Double-click to view complete member dossier & ID card"
                        className="p-3.5 bg-white hover:bg-stone-50/60 transition-colors cursor-pointer select-none"
                      >
                        {/* Card Header: Checkbox + Avatar + Name + RegID + Status */}
                        <div className="flex items-start justify-between gap-2.5 mb-2.5">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              aria-label={`Select ${member.fullName}`}
                              checked={selectedMemberIds.includes(member._id)}
                              onChange={() => toggleSelectMember(member._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 rounded border-hairline text-[#FF6200] focus:ring-[#FF6200] w-4 h-4 cursor-pointer accent-[#FF6200]"
                            />
                            {member.photoUrl ? (
                              <img
                                src={member.photoUrl}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-hairline shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-soft border border-hairline flex items-center justify-center font-bold text-[#FF6200] text-sm shrink-0">
                                {member.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-ink text-[13px] leading-tight truncate" title={member.fullName}>
                                {member.fullName}
                              </h4>
                              {member.profession && member.profession.trim() && (
                                <p className="text-[11px] text-muted-editorial leading-tight truncate mt-0.5">
                                  {member.profession.trim()}
                                </p>
                              )}
                              <span className="font-mono text-[11px] text-stone-600 bg-surface-soft px-1.5 py-0.5 rounded border border-hairline mt-1 inline-block">
                                {member.registrationId}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            {member.status === "APPROVED" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            ) : member.status === "REJECTED" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenQuickRemarks(member)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full"
                              >
                                <XCircle size={11} /> Rejected
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Clock size={11} /> Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Details Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs py-2 my-1 border-t border-b border-hairline/60">
                          <div>
                            <span className="text-muted-editorial text-[10px] uppercase font-bold block">Wing</span>
                            <span
                              className="inline-block max-w-[130px] truncate text-[11px] font-semibold text-[#FF6200] bg-orange-50/90 border border-orange-200/80 px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5"
                              title={member.wing}
                            >
                              {member.wing}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-editorial text-[10px] uppercase font-bold block">Location</span>
                            <span className="text-ink text-[11px] font-medium block truncate">
                              {member.district ? `${member.district}, ${member.state}` : member.state}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-editorial text-[10px] uppercase font-bold block">Contact</span>
                            {member.mobile && (
                              <span className="text-ink text-[11px] font-medium block font-mono">
                                +91 {member.mobile}
                              </span>
                            )}
                            {member.email && member.email.trim() && (
                              <span className="text-muted-editorial text-[10px] block truncate" title={member.email.trim()}>
                                {member.email.trim()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-muted-editorial text-[10px] uppercase font-bold block">Enrolled</span>
                            <span className="text-muted-editorial text-[11px] block">
                              {new Date(member.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {member.status === "PENDING" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenMember(member)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FF6200] hover:bg-[#D65000] text-white font-semibold text-xs shadow-2xs"
                              >
                                <ShieldCheck size={13} />
                                <span>Review</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenMember(member)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-surface-soft text-ink hover:text-[#FF6200] border border-hairline font-medium text-xs shadow-2xs"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {member.mobile && member.mobile.trim() ? (
                              <a
                                href={`tel:+91${member.mobile.replace(/\D/g, "")}`}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-sky-50 text-sky-600 border border-sky-200"
                                title="Call"
                              >
                                <Phone size={13} />
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 text-stone-400 border border-stone-200 opacity-50 cursor-not-allowed"
                              >
                                <Phone size={13} />
                              </button>
                            )}

                            {(member.whatsapp && member.whatsapp.trim()) || (member.mobile && member.mobile.trim()) ? (
                              <a
                                href={getMemberWhatsAppUrl(member)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200"
                                title="WhatsApp"
                              >
                                <WhatsAppIcon size={13} />
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 text-stone-400 border border-stone-200 opacity-50 cursor-not-allowed"
                              >
                                <WhatsAppIcon size={13} />
                              </button>
                            )}

                            {/* Direct Delete Record Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
                              title={`Delete Record: ${member.fullName}`}
                              aria-label={`Delete ${member.fullName}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Server-Side Pagination Bar (Requirement 7: 20 per page default) */}
              <div className="px-4 py-3 bg-white border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-muted-editorial">
                  <span>
                    Showing{" "}
                    <strong className="text-ink font-semibold">
                      {totalCount === 0 ? 0 : (page - 1) * limit + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-ink font-semibold">
                      {Math.min(page * limit, totalCount)}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-ink font-semibold">{totalCount}</strong>{" "}
                    records
                  </span>
                  <div className="h-3 w-px bg-hairline hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        const newLim = parseInt(e.target.value, 10);
                        setLimit(newLim);
                        setPage(1);
                        fetchMembers(1, newLim);
                      }}
                      className="text-xs px-2 py-1 rounded border border-hairline bg-surface-soft text-ink font-medium focus:outline-none focus:border-[#FF6200]"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => {
                      setPage(1);
                      fetchMembers(1, limit);
                    }}
                    className="px-2 py-1 rounded border border-hairline bg-surface-soft hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                    title="First Page"
                  >
                    « First
                  </button>
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => {
                      const prev = Math.max(1, page - 1);
                      setPage(prev);
                      fetchMembers(prev, limit);
                    }}
                    className="px-2.5 py-1 rounded border border-hairline bg-surface-soft hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
                    title="Previous Page"
                  >
                    <ChevronLeft size={13} />
                    <span>Prev</span>
                  </button>

                  <span className="px-2.5 py-1 font-semibold text-ink">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => {
                      const next = Math.min(totalPages, page + 1);
                      setPage(next);
                      fetchMembers(next, limit);
                    }}
                    className="px-2.5 py-1 rounded border border-hairline bg-surface-soft hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-1"
                    title="Next Page"
                  >
                    <span>Next</span>
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => {
                      setPage(totalPages);
                      fetchMembers(totalPages, limit);
                    }}
                    className="px-2 py-1 rounded border border-hairline bg-surface-soft hover:bg-white text-ink disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                    title="Last Page"
                  >
                    Last »
                  </button>
                </div>
              </div>
            </div>
            </>
          ) : activeAdminTab === "analytics" ? (
            /* VIEW MODE 2: CADRE INTELLIGENCE & DEMOGRAPHICS ANALYTICS TAB */
            <div className="space-y-4 mb-6">
              {/* Analytics Top KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white border border-hairline p-4 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-muted-editorial text-xs mb-1">
                    <span className="uppercase font-bold tracking-wider">Total Enrolled</span>
                    <Users size={16} className="text-[#FF6200]" />
                  </div>
                  <div className="font-serif text-3xl font-black text-ink">{stats.total}</div>
                  <div className="text-[11px] text-muted-editorial mt-1">
                    National cadre registry baseline
                  </div>
                </div>

                <div className="bg-white border border-hairline p-4 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
                    <span className="uppercase font-bold tracking-wider">Approval Rate</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div className="font-serif text-3xl font-black text-emerald-900">
                    {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}%` : "0%"}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {stats.approved} approved verified cadres
                  </div>
                </div>

                <div className="bg-white border border-hairline p-4 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
                    <span className="uppercase font-bold tracking-wider">Pending Review</span>
                    <Clock size={16} className="text-amber-600" />
                  </div>
                  <div className="font-serif text-3xl font-black text-amber-900">
                    {stats.pending}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    Awaiting committee clearance
                  </div>
                </div>

                <div className="bg-white border border-hairline p-4 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-rose-800 text-xs mb-1">
                    <span className="uppercase font-bold tracking-wider">Rejected Queue</span>
                    <XCircle size={16} className="text-rose-600" />
                  </div>
                  <div className="font-serif text-3xl font-black text-rose-900">
                    {stats.rejected}
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1">
                    Requiring applicant rectifications
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Columns: Wing Distribution & Top States */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Wing Distribution Card */}
                <div className="bg-white border border-hairline rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-[#FF6200]" />
                      <h3 className="font-serif font-bold text-sm text-ink">
                        MSD Operational Wing Distribution
                      </h3>
                    </div>
                    <span className="text-[11px] text-muted-editorial">All Wings</span>
                  </div>

                  <div className="space-y-3">
                    {WINGS.filter((w) => w !== "ALL").map((wingName) => {
                      const match = (stats.wingBreakdown || []).find((w) => w._id === wingName);
                      const count = match ? match.count : 0;
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={wingName} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-ink">{wingName}</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-[#FF6200]">{count}</span>
                              <span className="text-muted-editorial text-[11px]">({pct}%)</span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-soft overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF6200] to-[#E05500] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(2, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top States & Territorial Footprint */}
                <div className="bg-white border border-hairline rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#FF6200]" />
                      <h3 className="font-serif font-bold text-sm text-ink">
                        Top States & Territorial Footprint
                      </h3>
                    </div>
                    <span className="text-[11px] text-muted-editorial">Top 10 Regions</span>
                  </div>

                  <div className="space-y-2.5">
                    {(stats.stateBreakdown || []).length === 0 ? (
                      <p className="text-xs text-muted-editorial py-6 text-center">No state data available yet.</p>
                    ) : (
                      (stats.stateBreakdown || []).slice(0, 8).map((st, idx) => {
                        const pct = stats.total > 0 ? Math.round((st.count / stats.total) * 100) : 0;
                        return (
                          <div key={st._id} className="flex items-center gap-3 text-xs">
                            <span className="w-5 text-right font-mono font-bold text-muted-editorial text-[11px]">
                              #{idx + 1}
                            </span>
                            <span className="w-36 truncate font-medium text-ink">{st._id || "Unspecified"}</span>
                            <div className="flex-1 h-2 rounded-full bg-surface-soft overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(3, pct)}%` }}
                              />
                            </div>
                            <span className="w-12 text-right font-mono font-bold text-ink">{st.count}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Demographics Card */}
              <div className="bg-white border border-hairline rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#FF6200]" />
                    <h3 className="font-serif font-bold text-sm text-ink">
                      Demographic & Gender Diversity Ratio
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab("directory")}
                    className="text-xs text-[#FF6200] font-semibold hover:underline"
                  >
                    View in Cadre Table →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Male", "Female", "Other"].map((gender) => {
                    const match = (stats.genderBreakdown || []).find((g) => g._id === gender);
                    const count = match ? match.count : 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={gender} className="p-3.5 bg-surface-soft/60 rounded-xl border border-hairline">
                        <div className="flex items-center justify-between text-xs text-muted-editorial mb-1">
                          <span className="font-bold uppercase tracking-wider">{gender} Cadres</span>
                          <span className="font-mono text-ink font-bold">{pct}%</span>
                        </div>
                        <div className="font-serif text-2xl font-black text-ink">{count}</div>
                        <div className="w-full h-1.5 rounded-full bg-hairline/80 mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              gender === "Male"
                                ? "bg-sky-600"
                                : gender === "Female"
                                ? "bg-rose-500"
                                : "bg-purple-600"
                            }`}
                            style={{ width: `${Math.max(2, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            ) : activeAdminTab === "donations" ? (
              <DonationsManager
                key={`donations-${refreshKey}`}
                token={token}
                onPendingCountChange={(cnt) => setPendingDonationsCount(cnt)}
              />
            ) : activeAdminTab === "bot-messages" ? (
              <WhatsAppCrmManager key={`bot-messages-${refreshKey}`} initialSection="bot-messages" token={token} />
            ) : activeAdminTab === "simulator" ? (
              <FlowSimulator embedded />
            ) : activeAdminTab === "crm-inbox" ? (
              <WhatsAppCrmManager
                key={`crm-inbox-${refreshKey}`}
                initialSection="inbox"
                initialMobile={selectedInboxMobile || undefined}
                token={token}
              />
            ) : activeAdminTab === "crm-leads" ? (
              <WhatsAppCrmManager key={`crm-leads-${refreshKey}`} initialSection="leads" token={token} />
            ) : activeAdminTab === "crm-templates" ? (
              <WhatsAppCrmManager key={`crm-templates-${refreshKey}`} initialSection="templates" token={token} />
            ) : (
              <IncompleteLeads key={`incomplete-leads-${refreshKey}`} embedded />
            )}
          </div>

          {/* Dedicated Minimalist Admin Footer */}
          <footer className="py-3 px-4 sm:px-6 border-t border-stone-200/80 bg-white/70 text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <span>Maha Seva Dal (Estd. 1947) · Central Cadre Administration System</span>
            <span className="font-mono text-[10px] text-stone-400">Authorized National Secretariat Portal</span>
          </footer>
        </div>
      </div>

      {/* ─── MEMBER REVIEW DOSSIER & DIGITAL ID MODAL ───────────────────────── */}
      {selectedMember && (
        <div
          data-lenis-prevent
          style={{ overscrollBehavior: "contain" }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMoreMenuOpen(false);
              setSelectedMember(null);
            }
          }}
        >
          <div
            data-lenis-prevent
            style={{ overscrollBehavior: "contain" }}
            className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-6xl xl:max-w-7xl w-full flex flex-col h-[94vh] max-h-[890px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={() => {
              if (moreMenuOpen) setMoreMenuOpen(false);
            }}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-soft/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FF6200]/10 text-[#FF6200] flex items-center justify-center border border-[#FF6200]/20 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-ink leading-tight">
                      Official Member Verification
                    </h3>
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-hairline shadow-2xs">
                      <span className="font-mono text-xs font-bold text-[#FF6200]">
                        {selectedMember.registrationId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyRegistrationId(selectedMember.registrationId)}
                        className="text-[#FF6200] hover:text-[#d95300] cursor-pointer transition-colors p-0.5"
                        title="Copy Registration ID"
                      >
                        {copiedId ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    </div>

                    {/* Possible duplicate warning badge */}
                    {isDuplicateMobile && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full"
                        title="Another member record exists with the same mobile number"
                      >
                        <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                        <span>Possible duplicate</span>
                      </span>
                    )}

                    {selectedMember.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Approved
                      </span>
                    ) : selectedMember.status === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                        <XCircle size={11} /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        <Clock size={11} /> Pending Review
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-editorial truncate hidden sm:block">
                    National Socio-Cultural Cadre Registry · Verification, PVC ID Card & Directives Management
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs, More Options & Close Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-hairline shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setDossierTab("dossier")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      dossierTab === "dossier"
                        ? "bg-[#FF6200] text-white shadow-xs font-bold"
                        : "text-muted-editorial hover:text-ink hover:bg-surface-soft"
                    }`}
                    title="Review & Verify Member Details & Official Dossier"
                  >
                    <ShieldCheck size={13} />
                    <span>Review & Verify</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDossierTab("card")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      dossierTab === "card"
                        ? "bg-[#FF6200] text-white shadow-xs font-bold"
                        : "text-muted-editorial hover:text-ink hover:bg-surface-soft"
                    }`}
                    title="Official PVC ID Card Preview Studio"
                  >
                    <CreditCard size={13} />
                    <span>Official ID Card</span>
                  </button>
                </div>

                {/* Direct Delete Record Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteMember(selectedMember)}
                  className="p-1.5 rounded-full text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                  title="Delete Record"
                  aria-label="Delete Record"
                >
                  <Trash2 size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setSelectedMember(null);
                  }}
                  className="p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft border border-hairline transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div data-lenis-prevent style={{ overscrollBehavior: "contain" }} className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface-soft/30">
              {/* VIEW MODE 1: COMPREHENSIVE REVIEW & VERIFICATION DOSSIER */}
              {dossierTab === "dossier" && (
                <div
                  tabIndex={0}
                  data-lenis-prevent
                  style={{ overscrollBehavior: "contain" }}
                  className="p-4 sm:p-6 pb-14 sm:pb-16 overflow-y-auto flex-1 min-h-0 custom-scrollbar space-y-4 focus:outline-none"
                >
                  {/* SECTION 1: Personal & Contact Profile (with Passport Photo) */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs">
                    <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-hairline/60">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-[#FF6200]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">
                          1. Personal & Contact Profile
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      {/* Cadre Passport Photo Preview with Lightbox Trigger */}
                      <div className="flex-shrink-0 self-center sm:self-start flex flex-col items-center">
                        {selectedMember.photoUrl ? (
                          <div
                            onClick={() => setLightboxPhoto(selectedMember.photoUrl)}
                            className="relative group cursor-pointer"
                            title="Click to view full photo in larger lightbox"
                          >
                            <img
                              src={selectedMember.photoUrl}
                              alt={selectedMember.fullName}
                              onError={(e) => {
                                if (!e.currentTarget.dataset.retried && selectedMember.photoUrl) {
                                  e.currentTarget.dataset.retried = "1";
                                  e.currentTarget.src = getApiUrl(`/api/members/proxy-photo?url=${encodeURIComponent(selectedMember.photoUrl)}`);
                                }
                              }}
                              className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl object-cover border-2 border-[#FF6200] shadow-sm bg-white transition-transform group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white">
                              <Maximize2 size={20} className="drop-shadow" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-surface-card border-2 border-dashed border-hairline flex flex-col items-center justify-center text-muted-editorial text-center p-2">
                            <User size={28} className="text-muted-editorial/60" />
                            <span className="text-[9px] mt-1 font-medium text-rose-500">No Photo</span>
                          </div>
                        )}
                        <span className="text-[9px] font-semibold text-muted-editorial mt-1.5 uppercase tracking-wider">
                          Cadre Photo
                        </span>
                      </div>

                      {/* Personal Details Grid */}
                      <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3.5 text-xs">
                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Full Legal Name
                          </span>
                          <span className="font-bold text-ink text-sm sm:text-base leading-tight block">
                            {selectedMember.fullName || (
                              <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Father / Husband Name
                          </span>
                          <span className="font-semibold text-ink text-xs sm:text-sm block">
                            {selectedMember.fatherName?.trim() || (
                              <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Date of Birth & Age
                          </span>
                          <span className="font-semibold text-ink text-xs sm:text-sm block">
                            {selectedMember.dob ? (
                              <>
                                {formatDobDisplay(selectedMember.dob)}
                                {selectedMember.age ? ` (${selectedMember.age} Yrs)` : ""}
                              </>
                            ) : (
                              <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Gender
                          </span>
                          <span className="font-semibold text-ink text-xs sm:text-sm block">
                            {selectedMember.gender || (
                              <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Blood Group
                          </span>
                          {getValidBloodGroup(selectedMember.bloodGroup) ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {getValidBloodGroup(selectedMember.bloodGroup)}
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF] italic text-xs font-normal block">Not provided</span>
                          )}
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Primary Mobile
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {selectedMember.mobile && selectedMember.mobile.trim() ? (
                              <>
                                <span className="font-mono font-bold text-ink text-xs sm:text-sm block">
                                  +91 {selectedMember.mobile.trim()}
                                </span>
                                <a
                                  href={`tel:+91${selectedMember.mobile.replace(/\D/g, "")}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 text-[10px] font-semibold transition-all shadow-2xs"
                                  title={`Call +91 ${selectedMember.mobile.trim()}`}
                                >
                                  <Phone size={10} />
                                  <span>Call</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[#9CA3AF] italic text-xs font-normal block">Not provided</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            WhatsApp Number
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {selectedMember.whatsapp && selectedMember.whatsapp.trim() ? (
                              <>
                                <span className="font-mono font-bold text-ink text-xs sm:text-sm block">
                                  +91 {selectedMember.whatsapp.trim()}
                                </span>
                                <a
                                  href={getMemberWhatsAppUrl(selectedMember)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[10px] font-semibold transition-all shadow-2xs"
                                  title={`WhatsApp +91 ${selectedMember.whatsapp.trim()}`}
                                >
                                  <WhatsAppIcon size={11} />
                                  <span>WhatsApp</span>
                                </a>
                              </>
                            ) : (
                              <span className="text-[#9CA3AF] italic text-xs font-normal block">Not provided</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Emergency Contact
                          </span>
                          <span className="font-mono font-bold text-ink text-xs sm:text-sm block">
                            {selectedMember.emergencyNumber ? (
                              <>
                                +91 {selectedMember.emergencyNumber}{" "}
                                {selectedMember.emergencyRelation && (
                                  <span className="text-muted-editorial font-sans text-xs font-normal">
                                    ({selectedMember.emergencyRelation})
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[#9CA3AF] italic text-xs font-normal font-sans">Not provided</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                            Email Address
                          </span>
                          <span className="font-medium text-ink text-xs sm:text-sm block break-all">
                            {selectedMember.email && selectedMember.email.trim() ? (
                              selectedMember.email.trim()
                            ) : (
                              <span className="text-[#9CA3AF] italic text-xs font-normal block">Not provided</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Address & Location */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-[#FF6200]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">
                          2. Address & Location
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3.5 text-xs">
                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          State Unit
                        </span>
                        <span className="font-bold text-ink text-sm sm:text-base block leading-snug">
                          {selectedMember.state || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          District Unit
                        </span>
                        <span className="font-bold text-ink text-sm sm:text-base block leading-snug">
                          {selectedMember.district || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Assembly Constituency
                        </span>
                        <span className="font-bold text-ink text-sm sm:text-base block leading-snug">
                          {selectedMember.assembly || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Zone / Region
                        </span>
                        <span className="font-bold text-ink text-sm sm:text-base block leading-snug">
                          {selectedMember.zone || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Taluk / Tehsil / Area
                        </span>
                        <span className="font-semibold text-ink text-xs sm:text-sm block leading-snug">
                          {selectedMember.taluk?.trim() || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Postal PIN Code
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {selectedMember.pincode && selectedMember.pincode.trim() ? (
                            <>
                              <span className="font-mono font-bold text-ink text-sm block">
                                {selectedMember.pincode.trim()}
                              </span>
                              {(() => {
                                const pinWarning = getPincodeWarning(
                                  selectedMember.pincode,
                                  selectedMember.state,
                                  selectedMember.district
                                );
                                if (!pinWarning) return null;
                                return (
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-300"
                                    title={pinWarning}
                                  >
                                    <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                                    <span>PIN mismatch</span>
                                  </span>
                                );
                              })()}
                            </>
                          ) : (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-4 pt-3 border-t border-hairline/60">
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Full Permanent Residential Address
                        </span>
                        <span className="font-medium text-ink text-xs sm:text-sm block leading-relaxed">
                          {selectedMember.address?.trim() || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Cadre Wing & Professional Details */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                      <div className="flex items-center gap-2">
                        <Briefcase size={15} className="text-[#FF6200]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">
                          3. Cadre Wing & Professional Details
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3.5 text-xs">
                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Assigned MSD Wing
                        </span>
                        <span className="font-serif font-black text-[#FF6200] text-sm sm:text-base block">
                          {selectedMember.wing || (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Current Profession / Occupation
                        </span>
                        <span className="text-xs sm:text-sm block">
                          {selectedMember.profession?.trim() ? (
                            <span className="font-semibold text-ink">{selectedMember.profession.trim()}</span>
                          ) : (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Cadre Pledge Status
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-xs">
                          <CheckCircle2 size={12} />
                          <span>Accepted Maha Seva Dal Oath</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Registration & Audit Details */}
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-hairline shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[#FF6200]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-ink font-serif">
                          4. Registration & Enrollment Details
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3.5 text-xs">
                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Cadre Registry ID
                        </span>
                        <span className="font-mono font-bold text-ink text-sm sm:text-base block">
                          {selectedMember.registrationId}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Application Date
                        </span>
                        <span className="font-semibold text-ink text-xs sm:text-sm block">
                          {selectedMember.createdAt ? (
                            new Date(selectedMember.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          ) : (
                            <span className="text-[#9CA3AF] italic text-xs font-normal">Not provided</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-editorial block text-[10px] uppercase font-bold tracking-wider mb-1">
                          Approval Date & Status
                        </span>
                        {selectedMember.status === "APPROVED" ? (
                          <span className="inline-flex items-center w-fit gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>
                              {selectedMember.approvedAt
                                ? new Date(selectedMember.approvedAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Approved"}
                            </span>
                          </span>
                        ) : selectedMember.status === "REJECTED" ? (
                          <button
                            type="button"
                            onClick={() => handlePromptStatusChange(selectedMember, "REJECTED")}
                            className="inline-flex items-center w-fit gap-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 hover:border-rose-300 cursor-pointer transition-all"
                            title="Click to modify rejection remarks"
                          >
                            <XCircle size={13} className="text-rose-600" />
                            <span>Rejected (Click to Edit Remarks)</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center w-fit gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <Clock size={13} className="text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW MODE 2: ID CARD ONLY (LARGE STUDIO) */}
              {dossierTab === "card" && (
                <div className="flex-1 min-h-0 flex flex-col justify-between p-3.5 sm:p-5 bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#e5dac8]/80 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-ink text-xs sm:text-sm">
                        Official PVC Identity Card Studio (Front & Back)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-muted-editorial bg-[#faf7ee] px-2 py-0.5 rounded border border-[#e5dac8]">
                        70 mm × 100 mm • 300 DPI High-Resolution Standard
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 w-full min-h-0 flex items-center justify-center overflow-hidden py-1">
                    <div className="transform scale-[0.82] sm:scale-[0.88] xl:scale-[0.95] 2xl:scale-100 origin-center transition-transform">
                      <DigitalIdCard
                        member={selectedMember}
                        qrDataUrl={selectedMemberQr}
                        customSealUrl={cardSettings.customSealUrl}
                        customSignatureUrl={cardSettings.customSignatureUrl}
                        signatoryName={cardSettings.signatoryName}
                        signatoryTitle={cardSettings.signatoryTitle}
                        hideActionButtons={true}
                        stacked={false}
                        defaultView="both"
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Bottom Action Footer: Perfectly Aligned & Context-Aware */}
            <div className="px-5 py-2.5 sm:py-3 border-t border-hairline bg-surface-soft/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              {/* Left Section: Card Seal Settings (when on ID card tab) */}
              <div className="flex items-center gap-2">
                {dossierTab === "card" ? (
                  <button
                    onClick={() => setCardSettingsModalOpen(true)}
                    className="text-xs font-medium px-3 py-1.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all border border-hairline bg-white hover:bg-surface-soft text-ink cursor-pointer shadow-2xs active:scale-95"
                    title="Configure Authorized Seal & Signatory on ID Cards"
                  >
                    <Award size={13} className="text-[#FF6200]" />
                    <span className="hidden sm:inline">Seal & Signatory</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-editorial hidden sm:inline">
                    National Socio-Cultural Cadre Registry
                  </span>
                )}
              </div>

              {/* Right Section: Contextual Tab Actions & Close */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* REVIEW & VERIFY TAB ACTIONS: Approve & Reject */}
                {dossierTab === "dossier" && (
                  <>
                    {selectedMember.status !== "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handlePromptStatusChange(selectedMember, "PENDING")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Reset status back to Pending Review"
                      >
                        <Clock size={13} />
                        <span>Reset to Pending</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePromptStatusChange(selectedMember, "REJECTED")}
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                        selectedMember.status === "REJECTED"
                          ? "bg-rose-700 text-white ring-2 ring-rose-500/30"
                          : "bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-600"
                      }`}
                      title="Reject Member Application with Remarks"
                    >
                      <XCircle size={14} />
                      <span>{selectedMember.status === "REJECTED" ? "✕ Rejected (Edit)" : "Reject"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePromptStatusChange(selectedMember, "APPROVED")}
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                        selectedMember.status === "APPROVED"
                          ? "bg-emerald-700 text-white ring-2 ring-emerald-500/30"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      }`}
                      title="Approve Member and Activate Official Cadre Status"
                    >
                      <CheckCircle2 size={14} />
                      <span>{selectedMember.status === "APPROVED" ? "✓ Approved" : "Approve"}</span>
                    </button>
                  </>
                )}

                {/* OFFICIAL ID CARD TAB ACTIONS: Download PDF & Download PNG */}
                {dossierTab === "card" && (
                  <>
                    <button
                      onClick={() => handleDownloadPdf(selectedMember)}
                      disabled={downloadingPdf || downloadingPng}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Download Official Clean PDF containing Front & Back ID cards side-by-side"
                    >
                      <FileText size={14} />
                      <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(selectedMember, "both")}
                      disabled={downloadingPng}
                      className="btn-primary-coral inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Download Ultra-crisp PNG sheet with Front & Back ID cards"
                    >
                      <Download size={14} />
                      <span>{downloadingPng ? "Rendering..." : "Download Both Side PNG"}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(selectedMember, "front")}
                      disabled={downloadingPdf || downloadingPng}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-orange-50 text-[#ea580c] border border-orange-200 text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Download Front side of ID card as PNG"
                    >
                      <Download size={13} />
                      <span>Front PNG</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(selectedMember, "back")}
                      disabled={downloadingPdf || downloadingPng}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-orange-50 text-[#ea580c] border border-orange-200 text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      title="Download Back side of ID card as PNG"
                    >
                      <Download size={13} />
                      <span>Back PNG</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CARD SEAL & SIGNATURE CONFIGURATION MODAL ───────────────────────── */}
      {cardSettingsModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCardSettingsModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-xl w-full flex flex-col max-h-[88vh] overflow-hidden relative"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-surface-soft/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6200]/10 text-[#FF6200] flex items-center justify-center border border-[#FF6200]/20 flex-shrink-0">
                  <Award size={19} />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-ink">ID Card Seal & Signature Settings</h3>
                  <p className="text-[11px] sm:text-xs text-muted-editorial">
                    Configure authorized seal and digital signature applied to ID cards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCardSettingsModalOpen(false)}
                className="p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft border border-hairline transition-colors cursor-pointer flex-shrink-0"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div
              tabIndex={0}
              className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 max-h-[calc(88vh-130px)] custom-scrollbar overscroll-contain space-y-5 focus:outline-none"
            >
              {/* Live Preview Card Box */}
              <div className="p-4 rounded-xl bg-surface-soft border border-hairline">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-editorial block mb-2">
                  Live Stamp & Signature Preview
                </span>
                <div className="bg-white p-4 rounded-lg border border-[#e8ddcb] flex items-center justify-around gap-4">
                  {/* Seal Preview */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-muted-editorial mb-1">Official Seal</span>
                    {cardSettings.customSealUrl ? (
                      <div className="relative group">
                        <img
                          src={cardSettings.customSealUrl}
                          alt="Custom Seal"
                          className="w-16 h-16 object-contain rounded-full border border-hairline p-0.5"
                        />
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded block text-center mt-1">
                          Custom Image
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <OfficialSealSvg className="w-16 h-16" />
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded block text-center mt-1">
                          Official Digital Stamp
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-16 w-px bg-hairline" />

                  {/* Signature Preview */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-muted-editorial mb-1">Authorized Signature</span>
                    {cardSettings.customSignatureUrl ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={cardSettings.customSignatureUrl}
                          alt="Custom Signature"
                          className="h-10 max-w-[130px] object-contain"
                        />
                        <div className="w-24 border-t border-ink/70 mt-1" />
                        <span className="text-[8px] font-bold text-ink mt-0.5">{cardSettings.signatoryName}</span>
                        <span className="text-[7px] text-muted-editorial">{cardSettings.signatoryTitle}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded block text-center mt-1">
                          Custom Image
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <OfficialSignatureSvg className="h-10 w-28 text-blue-900" />
                        <div className="w-24 border-t border-ink/70 mt-1" />
                        <span className="text-[8px] font-bold text-ink mt-0.5">{cardSettings.signatoryName}</span>
                        <span className="text-[7px] text-muted-editorial">{cardSettings.signatoryTitle}</span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded block text-center mt-1">
                          Official Digital Signature
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Official Seal Image */}
              <div className="border border-hairline rounded-xl p-3.5 bg-white">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <label className="text-xs font-bold text-ink block">Official Organization Seal (Stamp)</label>
                    <p className="text-[11px] text-muted-editorial">
                      Upload your high-res seal (PNG with transparent background recommended) or leave empty for the built-in official seal.
                    </p>
                  </div>
                  {cardSettings.customSealUrl && (
                    <button
                      type="button"
                      onClick={() => setCardSettings((p) => ({ ...p, customSealUrl: "" }))}
                      className="text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Use Default Stamp</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5 hover:bg-surface-soft">
                    <Upload size={13} />
                    <span>{uploadingSeal ? "Uploading..." : "Upload Seal Image (PNG)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSealFileUpload}
                      disabled={uploadingSeal}
                      className="hidden"
                    />
                  </label>
                  {cardSettings.customSealUrl && (
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium truncate">
                      <Check size={12} /> Custom seal active
                    </span>
                  )}
                </div>
              </div>

              {/* Upload Authorized Signature Image */}
              <div className="border border-hairline rounded-xl p-3.5 bg-white">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <label className="text-xs font-bold text-ink block">Authorized Signature</label>
                    <p className="text-[11px] text-muted-editorial">
                      Upload scanned signature (transparent PNG recommended) or leave empty for the built-in authorized digital signature.
                    </p>
                  </div>
                  {cardSettings.customSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => setCardSettings((p) => ({ ...p, customSignatureUrl: "" }))}
                      className="text-[10px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Use Default Signature</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5 hover:bg-surface-soft">
                    <Upload size={13} />
                    <span>{uploadingSignature ? "Uploading..." : "Upload Signature (PNG)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureFileUpload}
                      disabled={uploadingSignature}
                      className="hidden"
                    />
                  </label>
                  {cardSettings.customSignatureUrl && (
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium truncate">
                      <Check size={12} /> Custom signature active
                    </span>
                  )}
                </div>
              </div>

              {/* Signatory Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Signatory Title / Name</label>
                  <input
                    type="text"
                    value={cardSettings.signatoryName}
                    onChange={(e) => setCardSettings((p) => ({ ...p, signatoryName: e.target.value }))}
                    placeholder="Authorized Signatory"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Committee / Designation</label>
                  <input
                    type="text"
                    value={cardSettings.signatoryTitle}
                    onChange={(e) => setCardSettings((p) => ({ ...p, signatoryTitle: e.target.value }))}
                    placeholder="Central Executive Committee"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-hairline bg-surface-soft text-ink focus:outline-none focus:border-[#FF6200]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Sticky Bottom Action Footer */}
            <div className="px-6 py-3.5 border-t border-hairline bg-surface-soft/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setCardSettings({
                    customSealUrl: "",
                    customSignatureUrl: "",
                    signatoryName: "Authorized Signatory",
                    signatoryTitle: "Central Executive Committee",
                  })
                }
                className="text-xs text-muted-editorial hover:text-ink hover:underline cursor-pointer"
              >
                Reset all to defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardSettingsModalOpen(false)}
                  className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCardSettings}
                  disabled={savingCardSettings}
                  className="btn-primary-coral text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {savingCardSettings ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check size={13} />
                      <span>Save & Apply Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK APPROVE CONFIRMATION MODAL (Requirement 8) ──────────────── */}
      {bulkApproveModalOpen && (
        <div
          className="fixed inset-0 z-[75] bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !bulkActionLoading) setBulkApproveModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-emerald-300 shadow-2xl max-w-md w-full p-6 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBulkApproveModalOpen(false)}
              disabled={bulkActionLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Approve Selected Members</h3>
                <p className="text-xs text-emerald-700 font-medium">
                  Bulk ID Card Generation ({selectedMemberIds.length} selected)
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 mb-5 leading-relaxed">
              Are you sure you want to approve all <strong>{selectedMemberIds.length}</strong> selected registrations?
              This will update their official status to <strong>Approved</strong>, generate their digital PVC credentials, and activate live verification QR codes.
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkApproveModalOpen(false)}
                disabled={bulkActionLoading}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkApprove}
                disabled={bulkActionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {bulkActionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Approving Members...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Approve All {selectedMemberIds.length} Members</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      {memberToDelete && (
        <div
          className="fixed inset-0 z-[75] bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteLoading) setMemberToDelete(null);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-6 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMemberToDelete(null)}
              disabled={deleteLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Delete Member Record</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent & Irreversible Action</p>
              </div>
            </div>

            <div className="bg-surface-soft p-3.5 rounded-xl border border-hairline mb-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-editorial">Cadre Name:</span>
                <span className="font-bold text-ink">{memberToDelete.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-editorial">Registration ID:</span>
                <span className="font-mono font-bold text-[#FF6200]">{memberToDelete.registrationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-editorial">Wing / Region:</span>
                <span className="text-ink">
                  {memberToDelete.wing} ({memberToDelete.district})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-editorial">Current Status:</span>
                <span className="font-semibold">{memberToDelete.status}</span>
              </div>
            </div>

            <p className="text-xs text-muted-editorial mb-6 leading-relaxed">
              Are you sure you want to permanently delete this member record? This will remove all personal details, ID card registration, and stored photo from the database.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={deleteLoading}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                disabled={deleteLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? (
                  <span>Deleting Record...</span>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK DELETE CONFIRMATION MODAL ─────────────────────────────────── */}
      {bulkDeleteModalOpen && selectedMemberIds.length > 0 && (
        <div
          className="fixed inset-0 z-[75] bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteLoading) setBulkDeleteModalOpen(false);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full p-6 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={deleteLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 flex-shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Delete Selected Members</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent Bulk Deletion ({selectedMemberIds.length} Records)</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 mb-4 text-xs text-rose-950 space-y-1.5">
              <p className="font-bold">
                ⚠️ You are about to permanently delete {selectedMemberIds.length} member records from MongoDB.
              </p>
              <p className="text-stone-600 leading-relaxed">
                This will remove their profile information, generated 2-sided ID cards, and stored photographs from the DigitalOcean server. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDeleteMembers}
                disabled={deleteLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? (
                  <span>Deleting Records...</span>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Permanently Delete ({selectedMemberIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATUS ACTION CONFIRMATION MODAL (APPROVE / REJECT / PENDING) ─── */}
      {statusActionTarget && (
        <div
          className="fixed inset-0 z-[75] bg-black/65 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) {
              setStatusActionTarget(null);
              setStatusActionError(null);
            }
          }}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border animate-scale-up ${
              statusActionTarget.targetStatus === "APPROVED"
                ? "border-emerald-300"
                : statusActionTarget.targetStatus === "REJECTED"
                ? "border-rose-300"
                : "border-amber-300"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setStatusActionTarget(null);
                setStatusActionError(null);
              }}
              disabled={actionLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer disabled:opacity-40"
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
                  statusActionTarget.targetStatus === "APPROVED"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : statusActionTarget.targetStatus === "REJECTED"
                    ? "bg-rose-100 text-rose-700 border-rose-300"
                    : "bg-amber-100 text-amber-700 border-amber-300"
                }`}
              >
                {statusActionTarget.targetStatus === "APPROVED" ? (
                  <CheckCircle2 size={24} />
                ) : statusActionTarget.targetStatus === "REJECTED" ? (
                  <XCircle size={24} />
                ) : (
                  <RotateCcw size={24} />
                )}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {statusActionTarget.targetStatus === "APPROVED"
                    ? "Approve this member and generate ID card?"
                    : statusActionTarget.targetStatus === "REJECTED"
                    ? "Confirm Application Rejection"
                    : "Reset Application to Pending"}
                </h3>
                <p
                  className={`text-xs font-medium ${
                    statusActionTarget.targetStatus === "APPROVED"
                      ? "text-emerald-700"
                      : statusActionTarget.targetStatus === "REJECTED"
                      ? "text-rose-600"
                      : "text-amber-700"
                  }`}
                >
                  {statusActionTarget.targetStatus === "APPROVED"
                    ? "Approve this member and generate their official PVC identity card?"
                    : statusActionTarget.targetStatus === "REJECTED"
                    ? "Application will be marked rejected with official reason"
                    : "Move application back to pending queue for review"}
                </p>
              </div>
            </div>

            {/* Member Details Brief */}
            <div className="bg-surface-soft/80 p-3.5 rounded-xl border border-hairline mb-4 text-xs space-y-2">
              <div className="flex items-center gap-3">
                {statusActionTarget.member.photoUrl ? (
                  <img
                    src={statusActionTarget.member.photoUrl}
                    alt={statusActionTarget.member.fullName}
                    className="w-11 h-11 rounded-full object-cover border border-hairline shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-surface-soft border border-hairline flex items-center justify-center font-bold text-[#FF6200] text-sm shrink-0">
                    {statusActionTarget.member.fullName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink text-sm truncate">
                      {statusActionTarget.member.fullName}
                    </span>
                    <span className="font-mono font-bold text-[#FF6200] text-xs shrink-0">
                      {statusActionTarget.member.registrationId}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-editorial truncate mt-0.5">
                    {statusActionTarget.member.wing} · {statusActionTarget.member.district}, {statusActionTarget.member.state}
                  </div>
                  <div className="text-[11px] text-muted-editorial mt-0.5">
                    Mobile: <span className="font-mono text-ink font-medium">+91 {statusActionTarget.member.mobile}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection / Note Input */}
            {statusActionTarget.targetStatus === "REJECTED" ? (
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink flex items-center gap-1.5 flex-wrap">
                    <span>Rejection Reason (Displayed to Applicant):</span>
                    <span className="text-rose-600 font-bold">*</span>
                    <span className="text-[10.5px] text-muted-editorial font-normal">(Select one or more)</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase tracking-wide">
                    Compulsory
                  </span>
                </div>
                
                {/* Reason Presets: Addable One or More Reasons */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-semibold text-muted-editorial">
                      Click reasons below to add or remove:
                    </span>
                    {statusActionNote.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setStatusActionNote("");
                          setStatusActionError(null);
                        }}
                        className="text-[10.5px] text-muted-editorial hover:text-rose-600 transition-colors cursor-pointer underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {REJECTION_PRESETS.map((preset) => {
                      const isSelected = statusActionNote.toLowerCase().includes(preset.toLowerCase());
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleToggleRejectionPreset(preset)}
                          className={`text-[10px] sm:text-[10.5px] font-medium px-2.5 py-1 rounded-lg transition-all text-left cursor-pointer border flex items-center gap-1 shadow-2xs active:scale-95 ${
                            isSelected
                              ? "bg-rose-100 text-rose-900 border-rose-400 font-semibold ring-1 ring-rose-400/40"
                              : "bg-surface-soft hover:bg-rose-50 hover:text-rose-800 border-hairline hover:border-rose-200 text-ink/80"
                          }`}
                          title={isSelected ? "Click to remove this reason" : "Click to add this reason"}
                        >
                          {isSelected ? (
                            <Check size={11} className="text-rose-700 shrink-0 stroke-[2.5]" />
                          ) : (
                            <span className="text-muted-editorial font-bold text-xs shrink-0">+</span>
                          )}
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={statusActionNote}
                  onChange={(e) => {
                    setStatusActionNote(e.target.value);
                    if (e.target.value.trim()) setStatusActionError(null);
                  }}
                  placeholder="Select one or more reasons above, or type custom rejection remarks (compulsory)..."
                  className={`w-full text-xs p-2.5 rounded-lg border outline-none transition resize-y placeholder:text-muted-editorial/60 ${
                    statusActionError
                      ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/20"
                      : "border-hairline focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-surface-soft/40"
                  }`}
                />

                {statusActionError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} className="text-rose-600 shrink-0" />
                    <span>{statusActionError}</span>
                  </div>
                )}

                <p className="text-[11px] text-muted-editorial">
                  The applicant will see this reason on their public status check page and can contact secretariat support.
                </p>
              </div>
            ) : statusActionTarget.targetStatus === "APPROVED" ? (
              <div className="space-y-2 mb-4">
                <label className="text-xs font-semibold text-ink flex items-center justify-between">
                  <span>Administrative Verification Remarks (Optional):</span>
                  <span className="text-[10.5px] text-muted-editorial font-normal">Internal note</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {[
                    "Photograph & details verified",
                    "Phone contact verified",
                    "State / District unit cleared",
                    "Approved for official ID card",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setStatusActionNote(preset)}
                      className={`text-[10px] font-medium px-2 py-1 rounded transition-colors text-left cursor-pointer border ${
                        statusActionNote === preset
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold shadow-2xs"
                          : "bg-surface-soft hover:bg-emerald-50 hover:text-emerald-700 border-hairline hover:border-emerald-200"
                      }`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={statusActionNote}
                  onChange={(e) => setStatusActionNote(e.target.value)}
                  placeholder="Optional internal remark (e.g. Details verified by state team)..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-surface-soft/40 placeholder:text-muted-editorial/60"
                />
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Confirming approval will immediately generate official PVC digital ID card credentials and activate the live verification QR code.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 mb-4 flex items-start gap-2">
                <RotateCcw size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to move this member back to <strong>Pending Verification</strong>? Any active approval or rejection note will be cleared.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => {
                  setStatusActionTarget(null);
                  setStatusActionError(null);
                }}
                disabled={actionLoading}
                className="btn-secondary text-xs px-4 py-2 cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusChange}
                disabled={
                  actionLoading ||
                  (statusActionTarget.targetStatus === "REJECTED" && !statusActionNote.trim())
                }
                title={
                  statusActionTarget.targetStatus === "REJECTED" && !statusActionNote.trim()
                    ? "Rejection remarks are compulsory before confirming rejection"
                    : undefined
                }
                className={`text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow-sm transition-all text-white ${
                  statusActionTarget.targetStatus === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer"
                    : statusActionTarget.targetStatus === "REJECTED"
                    ? !statusActionNote.trim()
                      ? "bg-rose-300 cursor-not-allowed opacity-75"
                      : "bg-rose-600 hover:bg-rose-700 active:scale-95 cursor-pointer"
                    : "bg-amber-600 hover:bg-amber-700 active:scale-95 cursor-pointer"
                } disabled:cursor-not-allowed`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : statusActionTarget.targetStatus === "APPROVED" ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Approve & Generate ID Card</span>
                  </>
                ) : statusActionTarget.targetStatus === "REJECTED" ? (
                  <>
                    <XCircle size={13} />
                    <span>Confirm Rejection</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUICK REMARKS POPUP (SHOWS ONLY REASON TEXT, NO EXTRA) ─── */}
      {remarkModalMember && (
        <div
          className="fixed inset-0 z-[85] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRemarkModalMember(null);
          }}
        >
          <div
            className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-md w-full overflow-hidden relative"
          >
            {/* Tricolor Top Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6200] via-[#FF9933] to-[#138808]" />

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-hairline flex items-center justify-between gap-3 bg-surface-soft/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-sm font-bold text-ink">
                    {remarkModalMember.status === "REJECTED" ? "Rejection Reason" : "Administrative Remark"}
                  </h3>
                  <p className="text-[11px] text-muted-editorial font-mono truncate">
                    {remarkModalMember.registrationId} · {remarkModalMember.fullName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRemarkModalMember(null)}
                className="p-1.5 rounded-full text-muted-editorial hover:text-ink hover:bg-surface-soft transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content: ONLY the reason text, clean and readable */}
            <div className="p-5">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-ink text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
                {remarkModalMember.adminNotes || "No remark recorded."}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-hairline bg-surface-soft/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setRemarkModalMember(null)}
                className="btn-primary-coral text-xs px-4 py-1.5 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CADRE PHOTO LIGHTBOX MODAL ────────────────────────────────────── */}
      {lightboxPhoto && (
        <div
          data-lenis-prevent
          style={{ overscrollBehavior: "contain" }}
          className="fixed inset-0 z-[95] bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Close Lightbox (Esc)"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxPhoto}
              alt="Cadre Member Large Preview"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border-2 border-white/20 bg-black/40"
            />
            {selectedMember && (
              <div className="mt-3 text-center text-white/90 text-xs font-medium">
                {selectedMember.fullName} · {selectedMember.registrationId}
              </div>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Admin;
