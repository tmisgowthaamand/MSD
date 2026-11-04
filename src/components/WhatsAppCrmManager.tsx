import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getApiUrl } from "@/config/api";
import defaultFlowData from "@/data/defaultFlow.json";
import QRCode from "qrcode";
import DigitalIdCard, {
  generateIdCardPdf,
  generateCombinedIdCardCanvas,
  triggerDownload,
} from "@/components/DigitalIdCard";
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Smartphone,
  Globe,
  CheckCheck,
  ArrowUpRight,
  Inbox,
  UserPlus,
  CreditCard,
  Download,
  ShieldCheck,
  Eye,
  Sparkles,
  UserCheck,
  Copy,
  Tag,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Headphones,
  Zap,
  FileText,
  Filter,
  Bot,
  Paperclip,
  Smile,
  Bell,
  Megaphone,
  Users,
  MoreVertical,
  BarChart3,
  Settings,
  User,
  XCircle,
  X,
} from "lucide-react";

export const WhatsAppOfficialIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.5c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.18-.47-.31" />
  </svg>
);

export const WebPortalIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <circle cx="5" cy="6" r="1" fill="currentColor" />
    <circle cx="8" cy="6" r="1" fill="currentColor" />
    <circle cx="11" cy="6" r="1" fill="currentColor" />
  </svg>
);

export const IndiaFlag: React.FC<{ className?: string; width?: number; height?: number }> = ({
  className = "",
  width = 18,
  height = 12,
}) => (
  <svg
    viewBox="0 0 900 600"
    width={width}
    height={height}
    className={`inline-block rounded-[2px] shadow-2xs border border-stone-300/80 overflow-hidden shrink-0 ${className}`}
  >
    {/* Saffron Stripe */}
    <rect width="900" height="200" fill="#FF9933" />
    {/* White Stripe */}
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    {/* Green Stripe */}
    <rect y="400" width="900" height="200" fill="#138808" />
    {/* Ashoka Chakra */}
    <g transform="translate(450, 300)">
      {/* Outer Circle */}
      <circle r="75" fill="none" stroke="#000080" strokeWidth="8" />
      {/* Center Hub */}
      <circle r="16" fill="#000080" />
      {/* 24 Spokes */}
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="0"
          y2="-75"
          stroke="#000080"
          strokeWidth="4"
          transform={`rotate(${i * 15})`}
        />
      ))}
    </g>
  </svg>
);

export type WhatsAppCrmSubTab =
  | "bot-messages"
  | "inbox"
  | "leads"
  | "templates";

interface WhatsAppCrmManagerProps {
  initialSection?: WhatsAppCrmSubTab;
  initialMobile?: string;
  token?: string | null;
}

interface CardDataPayload {
  registrationId?: string;
  fullName?: string;
  fatherName?: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  whatsapp?: string;
  bloodGroup?: string;
  wing?: string;
  state?: string;
  district?: string;
  address?: string;
  pincode?: string;
  photoUrl?: string;
  status?: string;
  action?: string;
}

interface ConversationMessageItem {
  messageId?: string;
  direction: "INBOUND" | "OUTBOUND";
  senderName?: string;
  senderRole?: string;
  type?: string;
  templateName?: string | null;
  stepName?: string | null;
  buttonClicked?: string | null;
  channelSource?: "whatsapp" | "flow_simulator" | "web" | string;
  cardData?: CardDataPayload | null;
  content: string;
  status?: string;
  timestamp?: string;
}

interface StepHistoryItem {
  stepLabel: string;
  buttonClicked?: string | null;
  channelSource?: string;
  timestamp?: string;
}

interface ConversationItem {
  _id?: string;
  mobile: string;
  customerName: string;
  memberType?: "EXISTING_MEMBER" | "NEW_MEMBER" | string;
  registrationStatus: string;
  registrationId?: string | null;
  lastCompletedStep?: string;
  channel?: "whatsapp" | "flow_simulator" | "web" | string;
  wing?: string;
  state?: string;
  district?: string;
  cardViewed?: boolean;
  cardDownloaded?: boolean;
  cardDownloadedAt?: string | null;
  windowExpiresAt?: string;
  lastMessageAt?: string;
  stepHistory?: StepHistoryItem[];
  unreadCount: number;
  lastMessagePreview?: string;
  messages?: ConversationMessageItem[];
}

interface CrmLeadItem {
  id?: string;
  mobile: string;
  fullName: string;
  channel: "whatsapp" | "web" | string;
  leadCategory: "COMPLETED" | "INCOMPLETE" | string;
  registrationId?: string | null;
  lastStepLabel?: string;
  wing?: string;
  state?: string;
  district?: string;
  updatedAt?: string;
}

interface TemplateButtonItem {
  type: string;
  text: string;
  url?: string;
}

interface WhatsAppTemplateItem {
  _id?: string;
  name: string;
  displayName: string;
  language: string;
  category: string;
  useCase: string;
  headerType: string;
  headerText?: string;
  headerMediaUrl?: string;
  bodyText: string;
  footerText?: string;
  buttons?: TemplateButtonItem[];
  variables?: string[];
  metaStatus?: string;
  metaTemplateId?: string;
  rejectionReason?: string | null;
  isNew?: boolean;
}

interface BotFlowNodeItem {
  nodeId: string;
  name: string;
  type: string;
  data?: {
    interactiveType?: string;
    header?: { type?: string; text?: string };
    body?: string;
    footer?: string;
    mediaType?: string;
    link?: string;
  };
}

const USE_CASE_LABELS: Record<string, string> = {
  INCOMPLETE_REMINDER: "Incomplete Registration Reminder",
  REGISTRATION_CONFIRMATION: "Successful Registration Confirmation",
  FOLLOW_UP: "Registration Follow-Up",
  PAYMENT_REMINDER: "Payment / Seva Fund Reminder",
  GENERAL_NOTIFICATION: "General Notification",
};

const WhatsAppCrmManager: React.FC<WhatsAppCrmManagerProps> = ({
  initialSection = "inbox",
  initialMobile = "",
  token,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WhatsAppCrmSubTab>(initialSection);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [leads, setLeads] = useState<CrmLeadItem[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplateItem[]>([]);

  // Bot Messages & Media State
  const [botNodes, setBotNodes] = useState<BotFlowNodeItem[]>(() => {
    const raw = (defaultFlowData as { nodes?: BotFlowNodeItem[] }).nodes || [];
    return raw;
  });
  const [botSearch, setBotSearch] = useState<string>("");
  const [editingBotNode, setEditingBotNode] = useState<BotFlowNodeItem | null>(null);

  // 1. Inbox State & Pagination (WATI 3-Column Team Inbox Architecture)
  const [selectedMobile, setSelectedMobile] = useState<string | null>(initialMobile || null);
  const [inboxChannelTab, setInboxChannelTab] = useState<"ALL" | "whatsapp" | "web">("ALL");
  const [inboxSearchField, setInboxSearchField] = useState<"ALL" | "NAME" | "MOBILE" | "REG_ID">(
    "NAME"
  );
  const [inboxSearch, setInboxSearch] = useState<string>("");
  const [inboxFilterStatus, setInboxFilterStatus] = useState<string>("ALL");
  const [showQuickFilters, setShowQuickFilters] = useState<boolean>(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState<boolean>(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState<boolean>(false);
  const [newChatMobile, setNewChatMobile] = useState<string>("");
  const [newChatName, setNewChatName] = useState<string>("");
  const [newChatTemplate, setNewChatTemplate] = useState<string>(
    "msd_verification_followup_v1"
  );
  const [inboxPage, setInboxPage] = useState<number>(1);
  const [inboxPageSize, setInboxPageSize] = useState<number>(8);
  const [activeAgentDesk, setActiveAgentDesk] = useState<string>("National Secretariat");
  const [replyText, setReplyText] = useState<string>("");
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [chatActorMode, setChatActorMode] = useState<"ADMIN" | "USER">("ADMIN");
  const [showStepTracker, setShowStepTracker] = useState<boolean>(false);
  const [showQuickTemplatesDrawer, setShowQuickTemplatesDrawer] = useState<boolean>(false);
  const [showTemplatePickerPopover, setShowTemplatePickerPopover] = useState<boolean>(false);
  const [templatePickerSearch, setTemplatePickerSearch] = useState<string>("");
  const [selectedTemplateInComposer, setSelectedTemplateInComposer] =
    useState<WhatsAppTemplateItem | null>(null);
  const [contactInfoOpen, setContactInfoOpen] = useState<boolean>(true);
  const [contactAttrOpen, setContactAttrOpen] = useState<boolean>(true);
  const [tagsOpen, setTagsOpen] = useState<boolean>(true);
  const [notesOpen, setNotesOpen] = useState<boolean>(true);
  const [customTagsByMobile, setCustomTagsByMobile] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState<string>("");
  const [notesByMobile, setNotesByMobile] = useState<
    Record<string, { id: string; author: string; time: string; text: string }[]>
  >({});
  const [addingNote, setAddingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>("");
  const [previewCardMember, setPreviewCardMember] = useState<CardDataPayload | null>(null);
  const [previewCardQrUrl, setPreviewCardQrUrl] = useState<string>("");
  const [downloadingCardFormat, setDownloadingCardFormat] = useState<string | null>(null);

  // 2. Leads State & Pagination
  const [leadCategoryTab, setLeadCategoryTab] = useState<"ALL" | "COMPLETED" | "INCOMPLETE">("ALL");
  const [leadChannelFilter, setLeadChannelFilter] = useState<"ALL" | "whatsapp" | "web">("ALL");
  const [leadSearch, setLeadSearch] = useState<string>("");
  const [leadPage, setLeadPage] = useState<number>(1);
  const [leadPageSize, setLeadPageSize] = useState<number>(10);

  // Deletion States for WhatsApp CRM & Custom CRM
  const [selectedConvMobiles, setSelectedConvMobiles] = useState<string[]>([]);
  const [convToDelete, setConvToDelete] = useState<ConversationItem | null>(null);
  const [bulkConvDeleteOpen, setBulkConvDeleteOpen] = useState<boolean>(false);
  const [messageToDelete, setMessageToDelete] = useState<{ mobile: string; message: ConversationMessageItem } | null>(null);
  const [deleteActionLoading, setDeleteActionLoading] = useState<boolean>(false);

  // Leads Deletion States in CRM
  const [selectedCrmLeadIds, setSelectedCrmLeadIds] = useState<string[]>([]);
  const [crmLeadToDelete, setCrmLeadToDelete] = useState<CrmLeadItem | null>(null);
  const [bulkCrmLeadDeleteOpen, setBulkCrmLeadDeleteOpen] = useState<boolean>(false);

  // 3. Template Editor Modal State
  const [templateFilterStatus, setTemplateFilterStatus] = useState<string>("ALL");
  const [editingTemplate, setEditingTemplate] = useState<Partial<WhatsAppTemplateItem> | null>(
    null
  );
  const [templateForm, setTemplateForm] = useState({
    _id: "",
    name: "",
    displayName: "",
    language: "en",
    category: "UTILITY",
    useCase: "INCOMPLETE_REMINDER",
    headerType: "NONE",
    headerText: "",
    headerMediaUrl: "",
    bodyText:
      "Namaste {{1}} 🙏, please complete your Maha Seva Dal registration at {{2}} for {{3}}.",
    footerText: "Maha Seva Dal (Estd. 1947)",
    buttons: [
      { type: "QUICK_REPLY", text: "Resume Registration", url: "" },
      { type: "URL", text: "Visit Portal", url: "https://mahasevadal.com/register" },
    ],
    variables: ["Candidate Name", "Last Step", "Assigned Wing"],
  });
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [syncingMeta, setSyncingMeta] = useState<boolean>(false);

  useEffect(() => {
    setActiveSubTab(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (initialMobile) {
      setSelectedMobile(initialMobile.replace(/\D/g, "").slice(-10));
    }
  }, [initialMobile]);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setBannerMsg({ text, type });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Delete individual conversation from MongoDB
  const confirmDeleteConversation = async () => {
    if (!convToDelete) return;
    setDeleteActionLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/whatsapp-crm/inbox/${convToDelete.mobile}`), {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete conversation");

      setConversations((prev) => prev.filter((c) => c.mobile !== convToDelete.mobile));
      setSelectedConvMobiles((prev) => prev.filter((m) => m !== convToDelete.mobile));
      if (selectedMobile === convToDelete.mobile) {
        setSelectedMobile(null);
      }
      showNotice(`Chat with ${convToDelete.customerName} (+91 ${convToDelete.mobile}) permanently deleted from MongoDB.`);
      setConvToDelete(null);
    } catch (err: any) {
      alert(`Delete chat error: ${err.message}`);
    } finally {
      setDeleteActionLoading(false);
    }
  };

  // Bulk delete conversations from MongoDB
  const confirmBulkDeleteConversations = async () => {
    if (selectedConvMobiles.length === 0) return;
    setDeleteActionLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/whatsapp-crm/inbox/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobiles: selectedConvMobiles }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to bulk delete conversations");

      setConversations((prev) => prev.filter((c) => !selectedConvMobiles.includes(c.mobile)));
      if (selectedMobile && selectedConvMobiles.includes(selectedMobile)) {
        setSelectedMobile(null);
      }
      showNotice(`Successfully deleted ${selectedConvMobiles.length} conversation(s) from MongoDB.`);
      setSelectedConvMobiles([]);
      setBulkConvDeleteOpen(false);
    } catch (err: any) {
      alert(`Bulk delete error: ${err.message}`);
    } finally {
      setDeleteActionLoading(false);
    }
  };

  // Delete individual message (WhatsApp-style) from MongoDB
  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    setDeleteActionLoading(true);
    try {
      const msgId = messageToDelete.message.messageId;
      const res = await fetch(
        getApiUrl(`/api/whatsapp-crm/inbox/${messageToDelete.mobile}/messages/${msgId}`),
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete message");

      setConversations((prev) =>
        prev.map((c) => {
          if (c.mobile === messageToDelete.mobile) {
            const remainingMsgs = (c.messages || []).filter((m) => m.messageId !== msgId);
            const last = remainingMsgs[remainingMsgs.length - 1];
            return {
              ...c,
              messages: remainingMsgs,
              lastMessagePreview: last ? (last.content || `[${last.type || "media"}]`) : "",
              lastMessageAt: last?.timestamp || c.lastMessageAt,
            };
          }
          return c;
        })
      );
      showNotice("Message permanently deleted from MongoDB.");
      setMessageToDelete(null);
    } catch (err: any) {
      alert(`Delete message error: ${err.message}`);
    } finally {
      setDeleteActionLoading(false);
    }
  };

  // Delete individual lead from CRM leads tab
  const confirmDeleteCrmLead = async () => {
    if (!crmLeadToDelete) return;
    setDeleteActionLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/leads/${crmLeadToDelete.id || crmLeadToDelete.mobile}`), {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete lead");

      setLeads((prev) => prev.filter((l) => l.id !== crmLeadToDelete.id && l.mobile !== crmLeadToDelete.mobile));
      setSelectedCrmLeadIds((prev) => prev.filter((id) => id !== crmLeadToDelete.id));
      showNotice(`Lead ${crmLeadToDelete.fullName} (+91 ${crmLeadToDelete.mobile}) deleted from MongoDB.`);
      setCrmLeadToDelete(null);
    } catch (err: any) {
      alert(`Delete lead error: ${err.message}`);
    } finally {
      setDeleteActionLoading(false);
    }
  };

  // Bulk delete leads from CRM leads tab
  const confirmBulkDeleteCrmLeads = async () => {
    if (selectedCrmLeadIds.length === 0) return;
    setDeleteActionLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/leads/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCrmLeadIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to bulk delete leads");

      setLeads((prev) => prev.filter((l) => !selectedCrmLeadIds.includes(l.id)));
      showNotice(`Deleted ${selectedCrmLeadIds.length} lead(s) from MongoDB.`);
      setSelectedCrmLeadIds([]);
      setBulkCrmLeadDeleteOpen(false);
    } catch (err: any) {
      alert(`Bulk delete leads error: ${err.message}`);
    } finally {
      setDeleteActionLoading(false);
    }
  };

  const fetchCrmOverview = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(getApiUrl("/api/whatsapp-crm/overview"));
      if (!res.ok) throw new Error("Failed to load CRM data");
      const data = await res.json();
      if (data.success) {
        const cleanConvs = (data.conversations || []).filter(
          (c: any) => c.mobile !== "9871454424" && !/Deepu Kumar/i.test(c.customerName || "")
        );
        const cleanLeads = (data.leads || [])
          .filter((l: any) => l.mobile !== "9871454424" && !/Deepu Kumar/i.test(l.fullName || ""))
          .map((l: any) => ({
            ...l,
            channel:
              l.registrationId || String(l.channel || "").toLowerCase() === "web" || !String(l.channel || "").toLowerCase().includes("whatsapp")
                ? "web"
                : "whatsapp",
          }));
        setConversations(cleanConvs);
        setLeads(cleanLeads);
        setTemplates(data.templates || []);
        if (cleanConvs.length > 0) {
          setSelectedMobile((prev) => (prev === "9871454424" ? cleanConvs[0].mobile : prev || cleanConvs[0].mobile));
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      console.warn("[WhatsApp CRM Fetch Warning]:", message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCrmOverview();
  }, [fetchCrmOverview]);

  // Listen for global Header Refresh clicks from Admin header toolbar
  useEffect(() => {
    const handleAdminRefresh = () => {
      fetchCrmOverview(false);
    };
    window.addEventListener("msd:admin-refresh", handleAdminRefresh);
    return () => {
      window.removeEventListener("msd:admin-refresh", handleAdminRefresh);
    };
  }, [fetchCrmOverview]);

  // Active Conversation in Inbox (null if closed or not selected)
  const activeConversation = useMemo(() => {
    if (!selectedMobile) return null;
    return conversations.find((c) => c.mobile === selectedMobile) || null;
  }, [conversations, selectedMobile]);

  // Dynamic 24-hour Meta service window countdown timer
  const [windowCountdown, setWindowCountdown] = useState<string>("24:00");
  const [isWindowExpired, setIsWindowExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!activeConversation) return;

    const updateWindowTimer = () => {
      const expiresAt = activeConversation.windowExpiresAt
        ? new Date(activeConversation.windowExpiresAt).getTime()
        : activeConversation.lastMessageAt
        ? new Date(activeConversation.lastMessageAt).getTime() + 24 * 60 * 60 * 1000
        : null;

      if (!expiresAt) {
        setWindowCountdown("24:00");
        setIsWindowExpired(false);
        return;
      }

      const diffMs = expiresAt - Date.now();
      if (diffMs <= 0) {
        setWindowCountdown("Expired");
        setIsWindowExpired(true);
      } else {
        const totalMinutes = Math.floor(diffMs / (60 * 1000));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setWindowCountdown(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
        );
        setIsWindowExpired(false);
      }
    };

    updateWindowTimer();
    const interval = setInterval(updateWindowTimer, 15000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Handle selecting a conversation and immediately clearing its unread count
  const handleSelectConversation = async (conv: ConversationItem) => {
    setSelectedMobile(conv.mobile);
    setShowTemplatePickerPopover(false);
    setSelectedTemplateInComposer(null);

    // If this conversation has unread messages, clear badge immediately and update backend
    if (conv.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.mobile === conv.mobile ? { ...c, unreadCount: 0 } : c))
      );
      try {
        await fetch(getApiUrl(`/api/whatsapp-crm/inbox/${conv.mobile}/mark-read`), {
          method: "POST",
        });
      } catch (err) {
        console.error("Failed to mark conversation read:", err);
      }
    }
  };

  // Deduplicated messages for the active conversation
  const displayMessages = useMemo(() => {
    if (!activeConversation?.messages) return [];
    const list: ConversationMessageItem[] = [];
    for (let i = 0; i < activeConversation.messages.length; i++) {
      const cur = activeConversation.messages[i];
      const prev = list[list.length - 1];
      if (
        prev &&
        prev.direction === cur.direction &&
        prev.content === cur.content &&
        prev.templateName === cur.templateName
      ) {
        // Skip identical consecutive duplicate
        continue;
      }
      list.push(cur);
    }
    return list;
  }, [activeConversation]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeConversation?.mobile, displayMessages.length]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (c.mobile === "9871454424" || /Deepu Kumar/i.test(c.customerName || "")) {
        return false;
      }
      if (inboxChannelTab === "web") {
        if (c.channel !== "web") return false;
      } else if (inboxChannelTab === "whatsapp") {
        if (c.channel === "web") return false;
      }
      if (inboxFilterStatus === "EXISTING_MEMBER") {
        if (c.memberType !== "EXISTING_MEMBER") return false;
      } else if (inboxFilterStatus === "NEW_MEMBER") {
        if (c.memberType === "EXISTING_MEMBER") return false;
      } else if (inboxFilterStatus === "CARD_DOWNLOADED") {
        if (!c.cardDownloaded) return false;
      } else if (inboxFilterStatus === "UNREAD") {
        if (!c.unreadCount || c.unreadCount <= 0) return false;
      } else if (inboxFilterStatus !== "ALL" && c.registrationStatus !== inboxFilterStatus) {
        return false;
      }
      if (inboxSearch.trim()) {
        const q = inboxSearch.toLowerCase();
        if (inboxSearchField === "NAME") {
          return (c.customerName || "").toLowerCase().includes(q);
        }
        if (inboxSearchField === "MOBILE") {
          return (c.mobile || "").includes(q);
        }
        if (inboxSearchField === "REG_ID") {
          return (c.registrationId || "").toLowerCase().includes(q);
        }
        return (
          (c.customerName || "").toLowerCase().includes(q) ||
          (c.mobile || "").includes(q) ||
          (c.registrationId || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [conversations, inboxChannelTab, inboxFilterStatus, inboxSearch, inboxSearchField]);

  const totalUnreadCount = useMemo(() => {
    return filteredConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [filteredConversations]);

  const inboxTotalPages = Math.max(1, Math.ceil(filteredConversations.length / inboxPageSize));
  const safeInboxPage = Math.min(inboxPage, inboxTotalPages);
  const paginatedConversations = useMemo(() => {
    const start = (safeInboxPage - 1) * inboxPageSize;
    return filteredConversations.slice(start, start + inboxPageSize);
  }, [filteredConversations, safeInboxPage, inboxPageSize]);

  // Filtered Unified Leads (Completed vs Incomplete, Deduplicated)
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (l.mobile === "9871454424" || /Deepu Kumar/i.test(l.fullName || "")) {
        return false;
      }
      if (leadCategoryTab !== "ALL" && l.leadCategory !== leadCategoryTab) return false;
      if (leadChannelFilter !== "ALL" && l.channel !== leadChannelFilter) return false;
      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        return (
          (l.fullName || "").toLowerCase().includes(q) ||
          (l.mobile || "").includes(q) ||
          (l.registrationId || "").toLowerCase().includes(q) ||
          (l.state || "").toLowerCase().includes(q) ||
          (l.wing || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, leadCategoryTab, leadChannelFilter, leadSearch]);

  const leadTotalPages = Math.max(1, Math.ceil(filteredLeads.length / leadPageSize));
  const safeLeadPage = Math.min(leadPage, leadTotalPages);
  const paginatedLeads = useMemo(() => {
    const start = (safeLeadPage - 1) * leadPageSize;
    return filteredLeads.slice(start, start + leadPageSize);
  }, [filteredLeads, safeLeadPage, leadPageSize]);

  const filteredBotNodes = useMemo(() => {
    return botNodes.filter((n) => {
      if (!botSearch.trim()) return true;
      const q = botSearch.toLowerCase();
      return (
        (n.name || "").toLowerCase().includes(q) ||
        (n.nodeId || "").toLowerCase().includes(q) ||
        (n.data?.body || "").toLowerCase().includes(q)
      );
    });
  }, [botNodes, botSearch]);

  const fillTemplateVariables = useCallback(
    (tpl: WhatsAppTemplateItem, conv: ConversationItem) => {
      return (tpl.bodyText || "")
        .replace(/\{\{1\}\}/g, conv.customerName || "Cadre Member")
        .replace(
          /\{\{2\}\}/g,
          conv.registrationId || conv.lastCompletedStep || "MSD-IND-2026"
        )
        .replace(/\{\{3\}\}/g, conv.wing || "General Seva Cadre")
        .replace(/\{\{4\}\}/g, conv.state || "India");
    },
    []
  );

  // Approved templates sorted so the auto-matched template for the active member's status is first
  const approvedTemplatesForInbox = useMemo(() => {
    const approved = templates.filter((t) => t.metaStatus === "APPROVED");
    if (!activeConversation) return approved;
    const status = activeConversation.registrationStatus;
    const targetUseCase =
      status === "APPROVED"
        ? "REGISTRATION_CONFIRMATION"
        : status === "INCOMPLETE"
        ? "INCOMPLETE_REMINDER"
        : "FOLLOW_UP";

    return [...approved].sort((a, b) => {
      const aMatch = a.useCase === targetUseCase ? 1 : 0;
      const bMatch = b.useCase === targetUseCase ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [templates, activeConversation]);

  const autoMatchedTemplate = useMemo(() => {
    return approvedTemplatesForInbox[0] || null;
  }, [approvedTemplatesForInbox]);

  // ─── Action Handlers ────────────────────────────────────────────────────────

  const buildMemberCardPayload = (conv: ConversationItem, override?: CardDataPayload | null): CardDataPayload => {
    return {
      registrationId: override?.registrationId || conv.registrationId || `MSD-IND-2026-${conv.mobile.slice(-4)}`,
      fullName: override?.fullName || conv.customerName || "Cadre Member",
      fatherName: override?.fatherName || "—",
      dob: override?.dob || "1996-05-14",
      gender: override?.gender || "Male",
      mobile: override?.mobile || conv.mobile,
      whatsapp: override?.whatsapp || conv.mobile,
      bloodGroup: override?.bloodGroup || "O+",
      wing: override?.wing || conv.wing || "General Seva Cadre",
      state: override?.state || conv.state || "Tamil Nadu",
      district: override?.district || conv.district || "Chennai",
      address: override?.address || `${conv.district || "Central"}, ${conv.state || "Tamil Nadu"}`,
      pincode: override?.pincode || "600001",
      photoUrl: override?.photoUrl || "/founder-saragabani-gopu-portrait.jpg",
      status: override?.status || conv.registrationStatus || "APPROVED",
      action: override?.action || "VIEWED",
    };
  };

  const openFullCardPreviewModal = async (conv: ConversationItem, card?: CardDataPayload | null) => {
    const payload = buildMemberCardPayload(conv, card);
    setPreviewCardMember(payload);
    try {
      const qr = await QRCode.toDataURL(
        `https://mahasevadal.com/verify?id=${payload.registrationId}&name=${encodeURIComponent(
          payload.fullName || ""
        )}&wing=${encodeURIComponent(payload.wing || "")}`,
        { width: 180, margin: 1 }
      );
      setPreviewCardQrUrl(qr);
    } catch {
      setPreviewCardQrUrl("");
    }
  };

  const handleDownloadCardFromInbox = async (
    conv: ConversationItem,
    format: "pdf" | "png",
    card?: CardDataPayload | null
  ) => {
    const payload = buildMemberCardPayload(conv, card);
    const cleanRegId = (payload.registrationId || "MSD-IND-2026").replace(/[^a-zA-Z0-9_-]/g, "_");
    setDownloadingCardFormat(`${conv.mobile}_${format}`);
    try {
      const qr = await QRCode.toDataURL(
        `https://mahasevadal.com/verify?id=${payload.registrationId}&name=${encodeURIComponent(
          payload.fullName || ""
        )}&wing=${encodeURIComponent(payload.wing || "")}`,
        { width: 180, margin: 1 }
      );
      const strictMember = {
        registrationId: payload.registrationId || "MSD-IND-2026",
        fullName: payload.fullName || "Cadre Member",
        fatherName: payload.fatherName,
        dob: payload.dob,
        gender: payload.gender,
        mobile: payload.mobile,
        whatsapp: payload.whatsapp,
        bloodGroup: payload.bloodGroup,
        photoUrl: payload.photoUrl,
        state: payload.state || "Tamil Nadu",
        district: payload.district || "Chennai",
        address: payload.address,
        pincode: payload.pincode,
        wing: payload.wing || "General Seva Cadre",
        status: payload.status || "APPROVED",
      };

      if (format === "pdf") {
        await generateIdCardPdf(strictMember, qr);
      } else {
        const bothUrl = await generateCombinedIdCardCanvas(strictMember, qr);
        triggerDownload(bothUrl, `${cleanRegId}_Both.png`);
      }

      // Record download event in conversation
      const res = await fetch(getApiUrl("/api/whatsapp-crm/inbox/track-event"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: conv.mobile,
          customerName: conv.customerName,
          memberType: conv.memberType || "EXISTING_MEMBER",
          channelSource: conv.channel || "whatsapp",
          registrationStatus: conv.registrationStatus,
          registrationId: payload.registrationId,
          wing: payload.wing,
          state: payload.state,
          district: payload.district,
          stepLabel: `🪪 Downloaded Digital ID Card (${format.toUpperCase()}) in WhatsApp`,
          buttonClicked: format === "pdf" ? "Download PDF (A4)" : "Both Sides (PNG)",
          userMessage: `🪪 Viewed & Downloaded Digital ID Card (${cleanRegId}.${format})`,
          cardData: {
            ...payload,
            action: format === "pdf" ? "DOWNLOADED_PDF" : "DOWNLOADED_PNG",
          },
          cardViewed: true,
          cardDownloaded: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.mobile === conv.mobile ? data.conversation : c))
        );
      }
      showNotice(`Downloaded ${cleanRegId} (${format.toUpperCase()}) & logged in WhatsApp Inbox!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Download failed";
      showNotice(message, "error");
    } finally {
      setDownloadingCardFormat(null);
    }
  };

  // 1. Send Reply or User Message from Inbox (Two-Way Admin + User Chat & 24h Window)
  const handleSendReply = async (
    e?: React.FormEvent,
    overrideContent?: string,
    tplName?: string,
    overrideDirection?: "INBOUND" | "OUTBOUND",
    extraStep?: {
      stepName?: string;
      buttonClicked?: string;
      cardData?: CardDataPayload | null;
    }
  ) => {
    if (e) e.preventDefault();
    const textToSend = overrideContent || replyText;
    if (!activeConversation || !textToSend.trim()) return;

    const effectiveDirection =
      overrideDirection || (chatActorMode === "USER" ? "INBOUND" : "OUTBOUND");

    const effectiveTemplateName =
      tplName ||
      (effectiveDirection === "OUTBOUND" && selectedTemplateInComposer
        ? selectedTemplateInComposer.name
        : undefined);

    const effectiveCardData =
      extraStep?.cardData ||
      (effectiveDirection === "OUTBOUND" &&
      selectedTemplateInComposer &&
      (selectedTemplateInComposer.name === "msd_registration_confirmation_id_v1" ||
        selectedTemplateInComposer.useCase === "REGISTRATION_CONFIRMATION")
        ? buildMemberCardPayload(activeConversation)
        : null);

    const effectiveStepName =
      extraStep?.stepName ||
      (effectiveDirection === "OUTBOUND" && selectedTemplateInComposer
        ? `Sent 24h Template: ${selectedTemplateInComposer.displayName}`
        : null);

    setSendingReply(true);
    try {
      const res = await fetch(
        getApiUrl(`/api/whatsapp-crm/inbox/${activeConversation.mobile}/reply`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: textToSend.trim(),
            direction: effectiveDirection,
            type: effectiveTemplateName
              ? "template"
              : effectiveCardData
              ? "document"
              : "text",
            templateName: effectiveTemplateName || null,
            stepName: effectiveStepName,
            buttonClicked:
              extraStep?.buttonClicked ||
              (selectedTemplateInComposer ? selectedTemplateInComposer.displayName : null),
            cardData: effectiveCardData,
            channelSource: activeConversation.channel || "whatsapp",
            senderName:
              effectiveDirection === "INBOUND"
                ? activeConversation.customerName
                : activeAgentDesk || "Admin Desk",
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setSelectedTemplateInComposer(null);
        setShowTemplatePickerPopover(false);
        setConversations((prev) =>
          prev.map((c) => (c.mobile === activeConversation.mobile ? data.conversation : c))
        );
        showNotice(
          effectiveDirection === "INBOUND"
            ? `User message recorded (+91 ${activeConversation.mobile}) · 24-Hour Window Open!`
            : effectiveTemplateName
            ? `Approved Template "${effectiveTemplateName}" sent by Admin to ${activeConversation.customerName}`
            : `WhatsApp message sent to +91 ${activeConversation.mobile}`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      showNotice("Failed to send message: " + message, "error");
    } finally {
      setSendingReply(false);
    }
  };

  // 2. Upload Media for Template Header
  const handleTemplateMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setTemplateForm((prev) => ({ ...prev, headerMediaUrl: data.url }));
        showNotice("Template media header uploaded");
      } else {
        const localUrl = URL.createObjectURL(file);
        setTemplateForm((prev) => ({ ...prev, headerMediaUrl: localUrl }));
        showNotice("Media attached to template header");
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      setTemplateForm((prev) => ({ ...prev, headerMediaUrl: localUrl }));
      showNotice("Media attached to template header");
    } finally {
      setUploadingMedia(false);
    }
  };

  // 3. Save / Resubmit Template
  const handleSaveTemplate = async (resubmitToMeta = false) => {
    if (!templateForm.name.trim() || !templateForm.bodyText.trim()) {
      showNotice("Template name and body text are required", "error");
      return;
    }

    try {
      const isEdit = Boolean(templateForm._id);
      const url = isEdit
        ? getApiUrl(`/api/whatsapp-crm/templates/${templateForm._id}`)
        : getApiUrl("/api/whatsapp-crm/templates");

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateForm,
          resubmitToMeta,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingTemplate(null);
        await fetchCrmOverview(true);
        showNotice(
          resubmitToMeta
            ? "Template updated & resubmitted to Meta WABA for approval!"
            : "WhatsApp template saved successfully"
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      showNotice("Error saving template: " + message, "error");
    }
  };

  const handleDeleteTemplate = async (id?: string) => {
    if (!id) return;
    try {
      await fetch(getApiUrl(`/api/whatsapp-crm/templates/${id}`), { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t._id !== id));
      showNotice("Template deleted");
    } catch {
      // Ignore delete error
    }
  };

  const handleSubmitTemplateToMeta = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(getApiUrl(`/api/whatsapp-crm/templates/${id}/submit-meta`), {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchCrmOverview(true);
        showNotice("Template submitted to Meta WhatsApp Business Platform API!");
      }
    } catch {
      // Ignore submit error
    }
  };

  const handleSyncMetaTemplates = async () => {
    setSyncingMeta(true);
    try {
      const res = await fetch(getApiUrl("/api/whatsapp-crm/templates/sync-meta"), {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        showNotice("Synced template statuses from Meta WABA!");
      }
    } catch {
      showNotice("Failed to sync with Meta", "error");
    } finally {
      setSyncingMeta(false);
    }
  };

  const openEditTemplateModal = (tpl?: WhatsAppTemplateItem) => {
    if (tpl) {
      setTemplateForm({
        _id: tpl._id || "",
        name: tpl.name || "",
        displayName: tpl.displayName || "",
        language: tpl.language || "en",
        category: tpl.category || "UTILITY",
        useCase: tpl.useCase || "GENERAL_NOTIFICATION",
        headerType: tpl.headerType || "NONE",
        headerText: tpl.headerText || "",
        headerMediaUrl: tpl.headerMediaUrl || "",
        bodyText: tpl.bodyText || "",
        footerText: tpl.footerText || "Maha Seva Dal (Estd. 1947)",
        buttons:
          tpl.buttons && tpl.buttons.length > 0
            ? tpl.buttons.map((b) => ({ type: b.type, text: b.text, url: b.url || "" }))
            : [{ type: "QUICK_REPLY", text: "Confirm", url: "" }],
        variables: tpl.variables || ["Full Name", "Registration ID"],
      });
      setEditingTemplate(tpl);
    } else {
      setTemplateForm({
        _id: "",
        name: `msd_custom_template_${Date.now().toString().slice(-4)}`,
        displayName: "New Cadre Outreach Template",
        language: "en",
        category: "UTILITY",
        useCase: "INCOMPLETE_REMINDER",
        headerType: "IMAGE",
        headerText: "Maha Seva Dal Official Notice",
        headerMediaUrl: "https://mahasevadal.com/logo.png",
        bodyText:
          "Namaste {{1}} 🙏,\n\nYour Maha Seva Dal registration stopped at *{{2}}*. Complete your verification to receive your Cadre ID for *{{3}}*.",
        footerText: "Maha Seva Dal Secretariat · Reply STOP to opt out",
        buttons: [
          { type: "QUICK_REPLY", text: "Resume Now", url: "" },
          { type: "URL", text: "Open Web Portal", url: "https://mahasevadal.com/register" },
        ],
        variables: ["Candidate Name", "Last Step", "Assigned Wing"],
      });
      setEditingTemplate({ isNew: true });
    }
  };

  const handleSaveBotNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBotNode) return;
    setBotNodes((prev) =>
      prev.map((n) => (n.nodeId === editingBotNode.nodeId ? editingBotNode : n))
    );
    setEditingBotNode(null);
    showNotice("Bot message & media node updated");
  };

  return (
    <div
      className={`${
        activeSubTab === "inbox" ? "flex-1 min-h-0 flex flex-col h-full" : "space-y-4"
      } text-stone-800`}
    >
      {/* Notification Banner */}
      {bannerMsg && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs ${
            bannerMsg.type === "error"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-emerald-50 border-emerald-300 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMsg.type === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span>{bannerMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMsg(null)}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIEW 1: BOT MESSAGES & MEDIA
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "bot-messages" && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6200] border border-orange-200 flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                  Bot Messages & Media
                </h2>
                <p className="text-xs text-stone-500">
                  Manage interactive WhatsApp bot prompts, headers, media links, and step messages
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search bot nodes or messages..."
                value={botSearch}
                onChange={(e) => setBotSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:border-[#FF6200]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredBotNodes.map((node) => (
              <div
                key={node.nodeId}
                className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-stone-900">{node.name}</div>
                      <div className="font-mono text-[10px] text-stone-400 mt-0.5">
                        {node.nodeId}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200 uppercase">
                      {node.data?.interactiveType || node.type}
                    </span>
                  </div>

                  {node.data?.header?.text && (
                    <div className="text-[11px] font-bold text-stone-800 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/70">
                      {node.data.header.text}
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-[#EFEAE2]/70 border border-stone-200/60 text-xs text-stone-800 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                    {node.data?.body || (node.data?.link ? `Media URL: ${node.data.link}` : "—")}
                  </div>

                  {node.data?.footer && (
                    <div className="text-[10px] text-stone-500 truncate">{node.data.footer}</div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingBotNode(node)}
                    className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 text-stone-700 cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>Edit Message</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIEW 2: WATI-STYLE 3-COLUMN TEAM INBOX (IN MAHA SEVA DAL WEBSITE THEME)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "inbox" && (
        <div className="bg-white border border-[#E4D9C8] rounded-xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-0 h-full">
          {/* ─── TOP WATI NAVIGATION & CONNECTION HEADER BAR (SINGLE-LINE SPACIOUS) ─── */}
          <div className="px-3.5 py-2 bg-white border-b border-[#EAE0D2] flex items-center justify-between gap-2 shrink-0">
            {/* Left: Brand + Team Inbox Badge */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF6200] text-white flex items-center justify-center shadow-2xs">
                  <MessageSquare size={14} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-sm sm:text-base tracking-tight text-stone-900">
                    MSD<span className="text-[#FF6200]">Inbox</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF5EB] text-[#FF6200] border border-orange-200">
                    Team Inbox
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Notification Bell Dropdown + Connected Number + Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification Bell Icon with Professional Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotificationsPopover((prev) => !prev)}
                  className="w-7 h-7 rounded-full bg-[#FAF6F0] hover:bg-[#F3ECE1] border border-[#E4D9C8] flex items-center justify-center text-stone-600 relative cursor-pointer transition-colors"
                  title="View Live Notifications & Alerts"
                >
                  <Bell size={13} className={refreshing ? "animate-bounce text-[#FF6200]" : ""} />
                  {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#FF6200] text-white text-[8px] font-bold flex items-center justify-center ring-1 ring-white">
                      {totalUnreadCount}
                    </span>
                  )}
                </button>

                {showNotificationsPopover && (
                  <div className="absolute right-0 top-9 w-80 sm:w-88 rounded-2xl bg-white border border-[#E4D9C8] shadow-2xl z-50 overflow-hidden animate-fade-in text-left">
                    <div className="px-3.5 py-2.5 bg-[#FAF6F0] border-b border-[#EAE0D2] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bell size={13} className="text-[#FF6200]" />
                        <span className="font-serif font-bold text-xs text-stone-900">
                          Live Alerts & Notifications
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setConversations((prev) =>
                            prev.map((c) => ({ ...c, unreadCount: 0 }))
                          );
                          try {
                            await fetch(getApiUrl("/api/whatsapp-crm/inbox/all/mark-read"), {
                              method: "POST",
                            });
                          } catch (e) {
                            console.error(e);
                          }
                          setShowNotificationsPopover(false);
                          showNotice("All notifications marked as read");
                        }}
                        className="text-[10px] font-bold text-[#FF6200] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-stone-100">
                      {conversations.filter((c) => c.unreadCount > 0 || c.cardDownloaded).length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-400">
                          No unread notifications. All messages caught up!
                        </div>
                      ) : (
                        conversations
                          .filter((c) => c.unreadCount > 0 || c.cardDownloaded)
                          .slice(0, 10)
                          .map((c) => (
                            <button
                              key={c.mobile}
                              type="button"
                              onClick={() => {
                                handleSelectConversation(c);
                                setShowNotificationsPopover(false);
                              }}
                              className="w-full p-2.5 hover:bg-[#FAF6F0] text-left transition-colors flex items-start gap-2.5 cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-full bg-[#FF6200]/15 text-[#FF6200] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {c.customerName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-stone-900 truncate">
                                    {c.customerName}
                                  </span>
                                  {c.unreadCount > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-[#FF6200]" />
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                  {c.lastMessagePreview || c.lastCompletedStep}
                                </p>
                                <div className="text-[9.5px] text-stone-400 font-mono mt-0.5">
                                  +91 {c.mobile} · {c.registrationStatus}
                                </div>
                              </div>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* WATI Two-Line "CONNECTED / +91 9994625698" Block */}
              <div className="px-2.5 py-0.5 border-x border-[#EAE0D2] text-right leading-tight">
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>CONNECTED</span>
                </div>
                <div className="font-mono text-[10.5px] font-bold text-stone-700">
                  +91 9994625698
                </div>
              </div>

              {/* Admin Avatar Circle */}
              <div
                className="w-7 h-7 rounded-full bg-[#F3ECE1] border border-[#DFD2BE] text-[#7C2D12] flex items-center justify-center font-bold text-xs"
                title="National Secretariat Executive"
              >
                <User size={14} />
              </div>
            </div>
          </div>

          {/* ─── 3-COLUMN WATI TEAM INBOX WORKSPACE (FITS 67% TO 100% DESKTOP ZOOM) ─── */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_245px] xl:grid-cols-[265px_minmax(0,1fr)_275px] 2xl:grid-cols-[295px_minmax(0,1fr)_305px] overflow-hidden">
            {/* ═══════════════════════════════════════════════════════════════════════
                COLUMN 1 (LEFT PANE): WATI CHANNELS, SEARCH & ACTIVE CHATS
               ═══════════════════════════════════════════════════════════════════════ */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#EAE0D2] bg-white flex flex-col h-full min-h-0 overflow-hidden">
              {/* Top Channel Icon Tabs (All | WhatsApp | Web) */}
              <div className="grid grid-cols-3 border-b border-[#EAE0D2] bg-white px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setInboxChannelTab("ALL");
                    setInboxPage(1);
                  }}
                  className={`py-2 text-xs font-bold flex items-center justify-center border-b-2 transition-colors cursor-pointer ${
                    inboxChannelTab === "ALL"
                      ? "border-[#FF6200] text-stone-900"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInboxChannelTab("whatsapp");
                    setInboxPage(1);
                  }}
                  title="Official WhatsApp Conversations"
                  className={`py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                    inboxChannelTab === "whatsapp"
                      ? "border-[#FF6200] bg-[#FFF8F1]"
                      : "border-transparent hover:bg-stone-50"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                    <WhatsAppOfficialIcon size={11} className="text-white" />
                  </span>
                  <span className="text-[11px] font-bold text-stone-800">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInboxChannelTab("web");
                    setInboxPage(1);
                  }}
                  title="Website Registration Conversations"
                  className={`py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                    inboxChannelTab === "web"
                      ? "border-[#FF6200] bg-[#FFF8F1]"
                      : "border-transparent hover:bg-stone-50"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                    <WebPortalIcon size={11} className="text-white" />
                  </span>
                  <span className="text-[11px] font-bold text-stone-800">Web</span>
                </button>
              </div>

              {/* WATI Search Bar + Active Chats Filter Row */}
              <div className="p-2.5 border-b border-[#EAE0D2] space-y-2 shrink-0">
                {/* Search Input with Clear Button and Field Selector */}
                <div className="flex items-center rounded-lg border border-[#E4D9C8] bg-[#F9F6F1] focus-within:bg-white focus-within:border-[#FF6200] overflow-hidden">
                  <div className="pl-2 pr-1 text-stone-400">
                    <Search size={12} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search name, phone or ID..."
                    value={inboxSearch}
                    onChange={(e) => {
                      setInboxSearch(e.target.value);
                      setInboxPage(1);
                    }}
                    className="flex-1 py-1 text-xs bg-transparent focus:outline-none text-stone-800 min-w-0"
                  />
                  {inboxSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setInboxSearch("");
                        setInboxPage(1);
                      }}
                      className="px-1.5 text-stone-400 hover:text-stone-700 font-bold text-xs cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                  <div className="h-3.5 w-px bg-[#DFD3C3]" />
                  <select
                    value={inboxSearchField}
                    onChange={(e) =>
                      setInboxSearchField(
                        e.target.value as "ALL" | "NAME" | "MOBILE" | "REG_ID"
                      )
                    }
                    className="bg-transparent px-1.5 py-1 text-[10.5px] font-semibold text-stone-700 focus:outline-none cursor-pointer"
                  >
                    <option value="NAME">Name</option>
                    <option value="MOBILE">Phone</option>
                    <option value="REG_ID">Reg ID</option>
                    <option value="ALL">All</option>
                  </select>
                </div>

                {/* Active Chats Filter Selector + Toggle Pills Icon + Saffron Start Chat Plus Button */}
                <div className="flex items-center justify-between gap-1">
                  <select
                    value={inboxFilterStatus}
                    onChange={(e) => {
                      setInboxFilterStatus(e.target.value);
                      setInboxPage(1);
                    }}
                    className="text-xs font-bold text-stone-900 bg-transparent focus:outline-none cursor-pointer truncate max-w-[150px]"
                  >
                    <option value="ALL">Active Chats</option>
                    <option value="UNREAD">Unread Chats</option>
                    <option value="APPROVED">Open · Approved</option>
                    <option value="PENDING">Open · Pending</option>
                    <option value="CARD_DOWNLOADED">ID Downloaded</option>
                    <option value="EXISTING_MEMBER">Already Member</option>
                    <option value="NEW_MEMBER">New Member</option>
                    <option value="INCOMPLETE">Incomplete</option>
                    <option value="REJECTED">Solved / Rejected</option>
                  </select>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowQuickFilters((prev) => !prev)}
                      className={`p-1 rounded-md cursor-pointer transition-colors ${
                        showQuickFilters || inboxFilterStatus !== "ALL"
                          ? "text-[#FF6200] bg-orange-50 border border-orange-200"
                          : "text-stone-500 hover:bg-stone-100 border border-transparent"
                      }`}
                      title="Toggle Quick Filter Pills"
                    >
                      <Filter size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewChatModalOpen(true)}
                      className="w-5 h-5 rounded-full bg-[#FF6200] hover:bg-[#D65000] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Start New WhatsApp Conversation"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Quick Filter Pills Bar */}
                {showQuickFilters && (
                  <div className="flex flex-wrap gap-1 pt-0.5 pb-1">
                    {[
                      { id: "ALL", label: "All" },
                      { id: "UNREAD", label: `Unread (${totalUnreadCount})` },
                      { id: "APPROVED", label: "Approved" },
                      { id: "PENDING", label: "Pending" },
                      { id: "CARD_DOWNLOADED", label: "ID Issued" },
                      { id: "INCOMPLETE", label: "Incomplete" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => {
                          setInboxFilterStatus(pill.id);
                          setInboxPage(1);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          inboxFilterStatus === pill.id
                            ? "bg-[#FF6200] text-white shadow-2xs"
                            : "bg-[#F3ECE1] text-stone-700 hover:bg-[#EAE0D2]"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sub-line: Total chats + Unread status */}
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-stone-500">{filteredConversations.length} chats</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInboxFilterStatus((prev) => (prev === "UNREAD" ? "ALL" : "UNREAD"));
                      setInboxPage(1);
                    }}
                    className={`font-bold cursor-pointer transition-colors ${
                      totalUnreadCount > 0 ? "text-[#FF6200] hover:underline" : "text-stone-600"
                    }`}
                  >
                    {totalUnreadCount} Unread
                  </button>
                </div>
              </div>

              {/* Bulk Action Bar for Selected Chats */}
              {selectedConvMobiles.length > 0 && (
                <div className="p-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950 animate-fade-in shrink-0">
                  <span className="font-bold">{selectedConvMobiles.length} selected</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBulkConvDeleteOpen(true)}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      <span>Delete ({selectedConvMobiles.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedConvMobiles([])}
                      className="text-[11px] text-stone-600 hover:text-stone-900 px-1 cursor-pointer"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* Active Chats List (Fast Smooth Custom Scrollbar) */}
              <div className="divide-y divide-[#F3EDE3] overflow-y-auto custom-scrollbar scroll-smooth flex-1 min-h-0">
                {paginatedConversations.map((conv) => {
                  const isSelected = activeConversation?.mobile === conv.mobile;
                  const isChecked = selectedConvMobiles.includes(conv.mobile);
                  const isBotHandled = conv.registrationStatus === "INCOMPLETE";
                  const lastMsg =
                    conv.messages && conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1]
                      : null;
                  const timeLabel = lastMsg?.timestamp
                    ? new Date(lastMsg.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "09:10 PM";

                  const cleanPreview = (
                    conv.lastMessagePreview ||
                    conv.lastCompletedStep ||
                    "Tap to view conversation"
                  ).replace(/^[^\w\s]+\s*/, "");

                  return (
                    <div
                      key={conv.mobile}
                      onClick={() => handleSelectConversation(conv)}
                      className={`group relative w-full px-2.5 py-2.5 text-left transition-colors flex items-start gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-[#FFF7EE] border-l-4 border-l-[#FF6200]"
                          : "bg-white hover:bg-[#FAF6F0]/70"
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div
                        className="pt-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedConvMobiles((prev) => [...prev, conv.mobile]);
                            else setSelectedConvMobiles((prev) => prev.filter((m) => m !== conv.mobile));
                          }}
                          className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>

                      {/* Circular User Avatar with Official Channel Icon Sub-Badge */}
                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? "bg-[#FF6200]/15 border-[#FF6200] text-[#FF6200]"
                              : "bg-[#F5EFE6] border-[#DFD2BE] text-stone-700"
                          }`}
                        >
                          <User size={14} />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white ${
                            conv.channel === "web" ? "bg-[#0284c7] text-white" : "bg-[#25D366] text-white"
                          }`}
                        >
                          {conv.channel === "web" ? (
                            <WebPortalIcon size={8} className="text-white" />
                          ) : (
                            <WhatsAppOfficialIcon size={8} className="text-white" />
                          )}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        {/* Row 1: Name • Agent/Bot + Hover Delete Icon */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="font-bold text-xs text-stone-900 truncate">
                              {conv.customerName}
                            </span>
                            <span className="text-stone-300 text-[10px]">•</span>
                            <span className="text-[10px] text-stone-500 inline-flex items-center gap-0.5 shrink-0">
                              {isBotHandled ? (
                                <>
                                  <Bot size={10} className="text-stone-400" />
                                  <span>AI Agent</span>
                                </>
                              ) : (
                                <>
                                  <Headphones size={10} className="text-stone-400" />
                                  <span>Secretariat</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Hover Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConvToDelete(conv);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-opacity cursor-pointer"
                              title={`Delete chat with ${conv.customerName}`}
                            >
                              <Trash2 size={11} />
                            </button>
                            {conv.unreadCount > 0 && (
                              <span className="w-4 h-4 rounded-full bg-[#FF6200] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Row 2: Clean 1-Line Message Preview */}
                        <p className="text-[11px] text-stone-500 truncate">{cleanPreview}</p>

                        {/* Row 3: Single Clean Status Pill on Left + Timestamp on Right */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                                conv.registrationStatus === "APPROVED"
                                    ? "bg-emerald-100/90 text-emerald-800"
                                    : conv.registrationStatus === "INCOMPLETE"
                                    ? "bg-amber-100/90 text-amber-900"
                                    : conv.registrationStatus === "REJECTED"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-[#FFE8D6] text-[#C2410C]"
                              }`}
                            >
                              {conv.registrationStatus === "APPROVED"
                                ? "Open"
                                : conv.registrationStatus === "PENDING"
                                ? "Pending"
                                : conv.registrationStatus === "INCOMPLETE"
                                ? "Incomplete"
                                : "Solved"}
                            </span>
                            {conv.cardDownloaded && (
                              <span
                                className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 font-bold"
                                title="Digital ID Card Downloaded"
                              >
                                <CreditCard size={9} />
                                <span>ID</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">{timeLabel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Left Column Pagination Footer */}
              <div className="px-2.5 py-1.5 border-t border-[#EAE0D2] bg-[#FAF6F0] flex items-center justify-between gap-1 text-[10px] text-stone-600 shrink-0">
                <div className="flex items-center gap-1">
                  <span>
                    {filteredConversations.length === 0
                      ? 0
                      : (safeInboxPage - 1) * inboxPageSize + 1}
                    –{Math.min(safeInboxPage * inboxPageSize, filteredConversations.length)} of{" "}
                    {filteredConversations.length}
                  </span>
                  <select
                    value={inboxPageSize}
                    onChange={(e) => {
                      setInboxPageSize(Number(e.target.value));
                      setInboxPage(1);
                    }}
                    className="px-1 py-0.5 rounded border border-[#E4D9C8] bg-white text-[10px] font-semibold"
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInboxPage((p) => Math.max(1, p - 1))}
                    disabled={safeInboxPage <= 1}
                    className="px-1.5 py-0.5 rounded border border-[#E4D9C8] bg-white hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                  >
                    ‹
                  </button>
                  <span className="px-1 font-bold text-stone-800">
                    {safeInboxPage} / {inboxTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInboxPage((p) => Math.min(inboxTotalPages, p + 1))}
                    disabled={safeInboxPage >= inboxTotalPages}
                    className="px-1.5 py-0.5 rounded border border-[#E4D9C8] bg-white hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════
                COLUMN 2 (CENTER PANE): WATI SINGLE-LINE HEADER, THREAD & COMPOSER
               ═══════════════════════════════════════════════════════════════════════ */}
            {activeConversation ? (
              <div className="border-b lg:border-b-0 lg:border-r border-[#EAE0D2] flex flex-col justify-between h-full min-h-0 overflow-hidden bg-[#F7F3EC]">
                {/* Center Top Header Bar (Zero-Overlap Single Line like WATI) */}
                <div className="px-3.5 py-2.5 bg-white border-b border-[#EAE0D2] shrink-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-3 overflow-hidden">
                    {/* Left: Desk Selector & Steps Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Desk Selector Pill */}
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-[#EAE0D2] bg-[#FAF6F0] text-stone-800 shadow-2xs">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full border border-[#E4D9C8] bg-white text-stone-700 flex items-center justify-center">
                            <Headphones size={12} className="text-[#FF6200]" />
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="leading-tight">
                          <select
                            value={activeAgentDesk}
                            onChange={(e) => setActiveAgentDesk(e.target.value)}
                            className="font-bold text-xs text-stone-900 bg-transparent focus:outline-none cursor-pointer pr-1"
                          >
                            <option value="National Secretariat">Secretariat</option>
                            <option value="State Cadre Desk">Cadre Desk</option>
                            <option value="MSD AI Agent">AI Agent</option>
                          </select>
                          <div className="text-[9.5px] text-stone-400 font-medium">Available</div>
                        </div>
                      </div>

                      {/* Step Journey Tracker Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowStepTracker((prev) => !prev)}
                        className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                          showStepTracker
                            ? "bg-[#FFF5EB] text-[#FF6200] border-orange-200"
                            : "bg-[#FAF6F0] hover:bg-[#F2EAE0] text-stone-700 border-[#EAE0D2]"
                        }`}
                        title="Toggle User Step & Click Journey Tracker"
                      >
                        <Sparkles size={12} className={showStepTracker ? "text-[#FF6200]" : "text-stone-500"} />
                        <span className="text-xs font-bold hidden sm:inline">Steps</span>
                      </button>
                    </div>

                    {/* Right: Dynamic 24h Countdown Clock + Status Dropdown + Preview ID + Close Button */}
                    <div className="flex items-center gap-2 shrink-0 bg-white">
                      {/* Dynamic 24h Countdown Window Clock */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0 transition-colors ${
                          isWindowExpired
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-[#F3ECE1] text-stone-700 border border-[#DFD2BE]"
                        }`}
                        title={
                          isWindowExpired
                            ? "24-Hour WhatsApp Service Window has expired. Re-open by sending an approved Meta Template."
                            : "Remaining time in the 24-Hour WhatsApp customer service window"
                        }
                      >
                        <Clock
                          size={12}
                          className={isWindowExpired ? "text-amber-700" : "text-[#FF6200]"}
                        />
                        <span>{windowCountdown}</span>
                      </div>

                      {/* Ticket Status Select */}
                      <select
                        value={activeConversation.registrationStatus}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await fetch(getApiUrl("/api/whatsapp-crm/inbox/track-event"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              mobile: activeConversation.mobile,
                              customerName: activeConversation.customerName,
                              registrationStatus: newStatus,
                              stepLabel: `Ticket status set to ${newStatus} by ${activeAgentDesk}`,
                              buttonClicked: `Status: ${newStatus}`,
                            }),
                          });
                          await fetchCrmOverview(true);
                          showNotice(`Ticket status updated to ${newStatus}`);
                        }}
                        className="px-2.5 py-1 rounded-xl border border-[#E4D9C8] bg-white font-semibold text-xs text-stone-800 focus:outline-none focus:border-[#FF6200] cursor-pointer shrink-0"
                      >
                        <option value="APPROVED">Open (Approved)</option>
                        <option value="PENDING">Pending</option>
                        <option value="INCOMPLETE">Incomplete</option>
                        <option value="REJECTED">Solved</option>
                      </select>

                      {/* Preview Digital ID Card Button */}
                      <button
                        type="button"
                        onClick={() => openFullCardPreviewModal(activeConversation)}
                        className="p-1.5 rounded-lg border border-[#E4D9C8] hover:bg-stone-50 text-stone-500 hover:text-stone-800 cursor-pointer shrink-0 transition-colors"
                        title="Preview Official Digital ID Card"
                      >
                        <CreditCard size={14} />
                      </button>

                      {/* Delete Conversation Button */}
                      <button
                        type="button"
                        onClick={() => setConvToDelete(activeConversation)}
                        className="p-1.5 rounded-lg border border-[#E4D9C8] hover:bg-rose-50 text-stone-400 hover:text-rose-600 cursor-pointer shrink-0 transition-colors"
                        title="Permanently Delete this conversation"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Close Conversation (Return to Standby Inbox) Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedMobile(null)}
                        className="p-1.5 rounded-lg border border-[#E4D9C8] hover:bg-rose-50 text-stone-400 hover:text-rose-600 cursor-pointer shrink-0 transition-colors"
                        title="Close conversation and return to Team Inbox default standby"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Step & Click Tracker Bar (Toggled by Users/Steps icon) */}
                  {showStepTracker && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#EAE0D2] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#FF6200] flex items-center gap-1 shrink-0 mr-1">
                          <Sparkles size={11} />
                          <span>Steps:</span>
                        </span>
                        {(activeConversation.stepHistory &&
                        activeConversation.stepHistory.length > 0
                          ? activeConversation.stepHistory.filter(
                              (st, i, arr) =>
                                i === 0 || st.stepLabel !== arr[i - 1].stepLabel
                            )
                          : [
                              {
                                stepLabel: "User Sent 'Hi' (24h Window Open)",
                                buttonClicked: "Hi",
                              },
                              {
                                stepLabel:
                                  activeConversation.lastCompletedStep ||
                                  "Step 1: Personal Profile",
                                buttonClicked:
                                  activeConversation.memberType === "EXISTING_MEMBER"
                                    ? "My Cadre ID Card"
                                    : "Cadre Registration",
                              },
                            ]
                        ).map((st, idx) => (
                          <div
                            key={idx}
                            className="shrink-0 px-2 py-0.5 rounded bg-white border border-[#E4D9C8] text-[10px] flex items-center gap-1"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-[#FFF5EB] text-[#FF6200] font-bold text-[8.5px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-stone-700">{st.stepLabel}</span>
                            {st.buttonClicked && (
                              <span className="px-1 rounded bg-[#FAF6F0] text-[#9A3412] font-mono text-[9px] font-bold">
                                [{st.buttonClicked}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Chat Thread Canvas (Fast Smooth Custom Scrollbar) */}
                <div
                  key={activeConversation.mobile}
                  ref={chatContainerRef}
                  className="flex-1 min-h-0 px-4 sm:px-5 py-3 overflow-y-auto custom-scrollbar scroll-smooth space-y-3 bg-[#F7F3EC]"
                >
                  {/* Centered Date Badge (Exact WATI Style) */}
                  <div className="flex justify-center">
                    <span className="px-3 py-0.5 rounded-lg bg-[#EAE2D6] text-stone-700 text-[11px] font-semibold">
                      {new Date().toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {/* WATI Horizontal Divider System Audit Lines */}
                  <div className="space-y-1 py-0.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#E4D9C8]" />
                      <span className="text-[11px] text-stone-500">
                        The ticket status has been set as{" "}
                        <strong className="text-stone-700">Open</strong> by agent{" "}
                        <strong className="text-stone-700">{activeAgentDesk}</strong>{" "}
                        <span className="text-[10px] text-stone-400 ml-1">09:15 PM</span>
                      </span>
                      <div className="flex-1 h-px bg-[#E4D9C8]" />
                    </div>
                    <div className="text-center text-[11px] text-stone-500">
                      Chat is now assigned to{" "}
                      <strong className="text-stone-700">Agent {activeAgentDesk}</strong>{" "}
                      <span className="text-[10px] text-stone-400 ml-1">09:15 PM</span>
                    </div>
                  </div>

                  {/* Messages List (Clean Airy WATI Bubbles) */}
                  {displayMessages.map((msg: ConversationMessageItem, idx: number) => {
                    const isOutbound = msg.direction === "OUTBOUND";
                    const isCardMsg = Boolean(
                      isOutbound &&
                        (msg.cardData ||
                          msg.templateName === "msd_registration_confirmation_id_v1" ||
                          (msg.content &&
                            msg.content.toLowerCase().includes("digital pvc id card") &&
                            !msg.content.toLowerCase().includes("viewed & downloaded")))
                    );
                    const isLatestCard =
                      isCardMsg &&
                      idx ===
                        displayMessages
                          .map((m, i) => ({ m, i }))
                          .filter(
                            ({ m }) =>
                              m.direction === "OUTBOUND" &&
                              (m.cardData ||
                                m.templateName === "msd_registration_confirmation_id_v1" ||
                                (m.content &&
                                  m.content.toLowerCase().includes("digital pvc id card") &&
                                  !m.content.toLowerCase().includes("viewed & downloaded")))
                          )
                          .pop()?.i;

                    const cardObj = isLatestCard
                      ? buildMemberCardPayload(activeConversation, msg.cardData)
                      : null;

                    return (
                      <div
                        key={msg.messageId || idx}
                        className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`group relative max-w-[82%] sm:max-w-[72%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs space-y-1.5 ${
                            isOutbound
                              ? "bg-[#FDECD8] text-stone-900 rounded-tr-xs border border-[#F5CBA7]"
                              : "bg-white text-stone-900 rounded-tl-xs border border-[#EAE0D2]"
                          }`}
                        >
                          {(msg.buttonClicked || msg.templateName) && (
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#9A3412] font-semibold">
                              {msg.buttonClicked && (
                                <span className="px-1.5 py-0.2 rounded bg-[#FFF5EB] border border-orange-200/80">
                                  Clicked: {msg.buttonClicked}
                                </span>
                              )}
                              {msg.templateName && (
                                <span className="px-1.5 py-0.2 rounded bg-white/80 border border-orange-200/80 font-mono text-[9.5px]">
                                  Template: {msg.templateName}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="whitespace-pre-wrap leading-relaxed text-[12px] text-stone-800">
                            {msg.content}
                          </div>

                          {/* Sleek Compact Horizontal Official Digital PVC ID Card Bar */}
                          {cardObj && (
                            <div className="mt-2 bg-white rounded-xl border border-[#DFD2BE] overflow-hidden shadow-2xs">
                              <div className="h-0.5 w-full bg-gradient-to-r from-[#FF6200] via-[#F59E0B] to-[#138808]" />
                              <div className="px-2.5 py-1.5 flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={
                                      cardObj.photoUrl ||
                                      "/founder-saragabani-gopu-portrait.jpg"
                                    }
                                    alt={cardObj.fullName}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        "/founder-saragabani-gopu-portrait.jpg";
                                    }}
                                    className="w-7 h-8 rounded-md object-cover border border-[#FF6200] shrink-0"
                                  />
                                  <div className="min-w-0 text-left">
                                    <div className="font-bold text-[11px] text-stone-900 truncate flex items-center gap-1.5">
                                      <span>{cardObj.fullName}</span>
                                      <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                                        {cardObj.status || "APPROVED"}
                                      </span>
                                    </div>
                                    <div className="text-[9.5px] text-stone-500 font-mono truncate">
                                      {cardObj.registrationId} · {cardObj.wing}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 ml-auto">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFullCardPreviewModal(activeConversation, cardObj)
                                    }
                                    className="py-1 px-2 rounded-md bg-[#FFF5EB] hover:bg-orange-100 text-[#FF6200] border border-orange-200 font-bold text-[9.5px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye size={11} />
                                    <span>View</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadCardFromInbox(
                                        activeConversation,
                                        "pdf",
                                        cardObj
                                      )
                                    }
                                    className="py-1 px-2 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-bold text-[9.5px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download size={11} />
                                    <span>PDF</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadCardFromInbox(
                                        activeConversation,
                                        "png",
                                        cardObj
                                      )
                                    }
                                    className="py-1 px-2 rounded-md bg-[#FF6200] hover:bg-[#D65000] text-white font-bold text-[9.5px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download size={11} />
                                    <span>PNG</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1.5 text-[10px] text-stone-400">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMessageToDelete({ mobile: activeConversation.mobile, message: msg });
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5 cursor-pointer mr-0.5"
                              title="Delete message from MongoDB"
                            >
                              <Trash2 size={11} />
                            </button>
                            <span>
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "09:15 PM"}
                            </span>
                            {isOutbound && <CheckCheck size={12} className="text-[#FF6200]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ─── WATI BOTTOM COMPOSER AREA (PINNED AT BOTTOM) ─── */}
                <div className="p-2.5 bg-[#F7F3EC] border-t border-[#EAE0D2] space-y-2 relative shrink-0">
                  {/* 1. TEMPLATES ICON POPOVER (Opened by clicking the 📄 FileText icon in composer) */}
                  {showTemplatePickerPopover && (
                    <div className="rounded-2xl bg-white border-2 border-[#FF6200] shadow-xl overflow-hidden animate-fade-in">
                      {/* Popover Header */}
                      <div className="px-3.5 py-2.5 bg-[#FFF5EB] border-b border-[#FED7AA] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#FF6200] text-white flex items-center justify-center shrink-0">
                            <FileText size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5 flex-wrap">
                              <span>
                                Approved WhatsApp Templates ({approvedTemplatesForInbox.length})
                              </span>
                              <span className="text-[9.5px] font-sans font-bold px-2 py-0.2 rounded-full bg-white text-[#C2410C] border border-orange-200">
                                Auto-Matched for {activeConversation.customerName} (
                                {activeConversation.registrationStatus})
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500">
                              Select a template for{" "}
                              <strong>{activeConversation.customerName}</strong> to load into the
                              message box or send directly as Admin
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <Search
                              size={11}
                              className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400"
                            />
                            <input
                              type="text"
                              placeholder="Search templates..."
                              value={templatePickerSearch}
                              onChange={(e) => setTemplatePickerSearch(e.target.value)}
                              className="pl-6 pr-2 py-1 text-[11px] rounded-lg border border-orange-200 bg-white focus:outline-none focus:border-[#FF6200] w-36"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowTemplatePickerPopover(false);
                              openEditTemplateModal();
                            }}
                            className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="Create New Template (Will automatically appear here once approved)"
                          >
                            <Plus size={11} />
                            <span>New</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowTemplatePickerPopover(false)}
                            className="p-1 rounded-lg hover:bg-orange-100 text-stone-600 font-bold text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Approved Templates List (Current + Future Approved Templates) */}
                      <div className="max-h-56 overflow-y-auto custom-scrollbar scroll-smooth divide-y divide-[#F2EAE0]">
                        {approvedTemplatesForInbox
                          .filter((t) => {
                            if (!templatePickerSearch.trim()) return true;
                            const q = templatePickerSearch.toLowerCase();
                            return (
                              (t.displayName || "").toLowerCase().includes(q) ||
                              (t.name || "").toLowerCase().includes(q) ||
                              (t.bodyText || "").toLowerCase().includes(q)
                            );
                          })
                          .map((tpl, idx) => {
                            const isRecommended = idx === 0 && !templatePickerSearch.trim();
                            const filledMsg = fillTemplateVariables(tpl, activeConversation);
                            const isSelectedInBox =
                              selectedTemplateInComposer?.name === tpl.name;
                            const includesIdCard =
                              tpl.name === "msd_registration_confirmation_id_v1" ||
                              tpl.useCase === "REGISTRATION_CONFIRMATION";

                            return (
                              <div
                                key={tpl._id || tpl.name}
                                className={`p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                  isSelectedInBox
                                    ? "bg-[#FFF5EB]"
                                    : isRecommended
                                    ? "bg-[#FAF6F0]/90 hover:bg-[#FFF5EB]/70"
                                    : "hover:bg-stone-50"
                                }`}
                              >
                                <div
                                  onClick={() => {
                                    setChatActorMode("ADMIN");
                                    setSelectedTemplateInComposer(tpl);
                                    setReplyText(filledMsg);
                                    setShowTemplatePickerPopover(false);
                                  }}
                                  className="min-w-0 flex-1 space-y-1 cursor-pointer"
                                >
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {isRecommended && (
                                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#FF6200] text-white">
                                        ★ Best Match for {activeConversation.registrationStatus}
                                      </span>
                                    )}
                                    <span className="font-bold text-xs text-stone-900">
                                      {tpl.displayName}
                                    </span>
                                    <span className="font-mono text-[10px] text-stone-400">
                                      ({tpl.name})
                                    </span>
                                    {includesIdCard && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                        <CreditCard size={9} />
                                        <span>+ Digital ID Card</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-700 bg-white border border-[#EAE0D2] rounded-lg px-2.5 py-1.5 whitespace-pre-wrap leading-snug">
                                    {filledMsg}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setChatActorMode("ADMIN");
                                      setSelectedTemplateInComposer(tpl);
                                      setReplyText(filledMsg);
                                      setShowTemplatePickerPopover(false);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-[#FF6200] bg-white hover:bg-[#FFF5EB] text-[#FF6200] text-[10.5px] font-bold cursor-pointer"
                                  >
                                    Select to Box
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const attachCard = includesIdCard
                                        ? buildMemberCardPayload(activeConversation)
                                        : null;
                                      handleSendReply(
                                        undefined,
                                        filledMsg,
                                        tpl.name,
                                        "OUTBOUND",
                                        {
                                          stepName: `Sent 24h Template: ${tpl.displayName}`,
                                          buttonClicked: tpl.displayName,
                                          cardData: attachCard,
                                        }
                                      );
                                      setShowTemplatePickerPopover(false);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#FF6200] hover:bg-[#D65000] text-white text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                  >
                                    <Send size={10} />
                                    <span>Send Now</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Pending / Unapproved Future Templates Footer (1-Click Approve to Show Above) */}
                      {templates.some((t) => t.metaStatus !== "APPROVED") && (
                        <div className="px-3.5 py-2 bg-[#FAF6F0] border-t border-[#EAE0D2] flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-stone-600">
                            Pending Future Templates (Approve to enable in Inbox):
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {templates
                              .filter((t) => t.metaStatus !== "APPROVED")
                              .map((pt) => (
                                <button
                                  key={pt._id || pt.name}
                                  type="button"
                                  onClick={() => handleSubmitTemplateToMeta(pt._id)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <CheckCircle2 size={10} />
                                  <span>Approve &ldquo;{pt.displayName}&rdquo;</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. QUICK FLOW SIMULATOR ACTIONS DRAWER (Opened by clicking 🤖 Bot or ⚡ Zap icon) */}
                  {showQuickTemplatesDrawer && (
                    <div className="p-2.5 rounded-xl bg-white border border-[#E4D9C8] flex items-center justify-between gap-2 flex-wrap shadow-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-500 uppercase mr-1">
                          Simulate Flow Clicks:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleSendReply(undefined, "Hi", undefined, "INBOUND", {
                              stepName: "User Sent 'Hi' (24-Hour Window Opened)",
                              buttonClicked: "Hi",
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-orange-50 border border-[#E4D9C8] font-semibold text-stone-800 cursor-pointer"
                        >
                          User Sends &ldquo;Hi&rdquo;
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSendReply(
                              undefined,
                              "Tapped: My Cadre ID Card",
                              undefined,
                              "INBOUND",
                              {
                                stepName: "Already a Member -> My Cadre ID Card",
                                buttonClicked: "My Cadre ID Card",
                              }
                            )
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-orange-50 border border-[#E4D9C8] font-semibold text-stone-800 cursor-pointer"
                        >
                          Click: My Cadre ID Card
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSendReply(
                              undefined,
                              "Tapped: Cadre Registration",
                              undefined,
                              "INBOUND",
                              {
                                stepName: "New Member -> Cadre Registration",
                                buttonClicked: "Cadre Registration",
                              }
                            )
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-orange-50 border border-[#E4D9C8] font-semibold text-stone-800 cursor-pointer"
                        >
                          Click: Cadre Registration
                        </button>
                      </div>

                      {activeConversation.registrationStatus !== "APPROVED" &&
                        autoMatchedTemplate && (
                          <button
                            type="button"
                            onClick={async () => {
                              const approvalTpl =
                                templates.find(
                                  (t) =>
                                    t.name === "msd_registration_confirmation_id_v1" ||
                                    t.useCase === "REGISTRATION_CONFIRMATION"
                                ) || autoMatchedTemplate;
                              const updatedConv: ConversationItem = {
                                ...activeConversation,
                                registrationStatus: "APPROVED",
                                lastCompletedStep: "Completed All Steps (ID Issued)",
                              };
                              const cardObj = buildMemberCardPayload(updatedConv, {
                                status: "APPROVED",
                              });
                              const filled = fillTemplateVariables(approvalTpl, updatedConv);
                              await fetch(getApiUrl("/api/whatsapp-crm/inbox/track-event"), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  mobile: activeConversation.mobile,
                                  customerName: activeConversation.customerName,
                                  registrationStatus: "APPROVED",
                                  registrationId: cardObj.registrationId,
                                  stepLabel:
                                    "Admin Approved & Sent Confirmation + Digital ID Card",
                                  buttonClicked: "Approve & Send ID Card",
                                  botReply: filled,
                                  templateName: approvalTpl.name,
                                  cardData: cardObj,
                                  cardViewed: true,
                                }),
                              });
                              await fetchCrmOverview(true);
                              showNotice(
                                `Approved ${activeConversation.customerName} & sent Approval Template + ID Card!`
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={11} />
                            <span>Approve & Send ID</span>
                          </button>
                        )}
                    </div>
                  )}

                  {/* 3. EXACT WATI WHITE COMPOSER CARD WITH 6 BOTTOM ICONS + SEND BUTTON */}
                  <form
                    onSubmit={(e) => handleSendReply(e)}
                    className="rounded-xl border border-[#E4D9C8] bg-white shadow-2xs overflow-hidden focus-within:border-[#FF6200]"
                  >
                    {/* Active Selected Template Pill Inside Composer */}
                    {selectedTemplateInComposer && (
                      <div className="px-3.5 py-1.5 bg-[#FFF5EB] border-b border-[#FED7AA] flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-[#9A3412] font-bold truncate">
                          <FileText size={12} className="text-[#FF6200] shrink-0" />
                          <span>
                            Selected Template for {activeConversation.customerName}:{" "}
                            <strong className="text-stone-900">
                              {selectedTemplateInComposer.displayName}
                            </strong>
                          </span>
                          {(selectedTemplateInComposer.name ===
                            "msd_registration_confirmation_id_v1" ||
                            selectedTemplateInComposer.useCase ===
                              "REGISTRATION_CONFIRMATION") && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                              + Attaches Digital ID Card
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateInComposer(null);
                            setReplyText("");
                          }}
                          className="text-stone-400 hover:text-stone-700 font-bold text-xs cursor-pointer"
                          title="Clear Selected Template"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      placeholder={
                        chatActorMode === "USER"
                          ? `Chat as ${activeConversation.customerName} (type "Hi" to open 24h window)...`
                          : "Type your message here or press / key for quick replies..."
                      }
                      value={replyText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReplyText(val);
                        if (val === "/") {
                          setShowTemplatePickerPopover((prev) => !prev);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs bg-transparent focus:outline-none text-stone-800"
                    />

                    {/* Bottom Toolbar Inside Composer (Exact WATI 6-Icon Layout + Send Button) */}
                    <div className="px-2.5 py-1.5 border-t border-[#F2EAE0] flex items-center justify-between gap-1.5 bg-white">
                      <div className="flex items-center gap-1 text-stone-500 min-w-0 overflow-x-auto no-scrollbar">
                        {/* Icon 1: Bot / Flow Automation Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickTemplatesDrawer((prev) => !prev);
                            setShowTemplatePickerPopover(false);
                          }}
                          className={`p-1 rounded-lg cursor-pointer shrink-0 ${
                            showQuickTemplatesDrawer
                              ? "bg-[#FFF5EB] text-[#FF6200]"
                              : "hover:bg-[#FAF6F0] hover:text-[#FF6200]"
                          }`}
                          title="Bot & Flow Simulator Actions"
                        >
                          <Bot size={14} />
                        </button>

                        {/* Icon 2: Quick Replies Lightning Bolt */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuickTemplatesDrawer((prev) => !prev);
                            setShowTemplatePickerPopover(false);
                          }}
                          className="p-1 rounded-lg hover:bg-[#FAF6F0] hover:text-[#FF6200] cursor-pointer shrink-0"
                          title="Quick Flow Replies"
                        >
                          <Zap size={14} />
                        </button>

                        {/* Icon 3: TEMPLATES ICON (Opens Current & Future Approved Templates Selector for User) */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowTemplatePickerPopover((prev) => !prev);
                            setShowQuickTemplatesDrawer(false);
                          }}
                          className={`p-1 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 ${
                            showTemplatePickerPopover || selectedTemplateInComposer
                              ? "bg-[#FF6200] text-white"
                              : "hover:bg-[#FAF6F0] hover:text-[#FF6200]"
                          }`}
                          title="Click to View & Select Approved WhatsApp Templates for this User"
                        >
                          <FileText size={14} />
                        </button>

                        <div className="h-3.5 w-px bg-[#EAE0D2] mx-0.5 shrink-0" />

                        {/* Icon 4: Paperclip — Attach / Send Official Digital ID Card */}
                        <button
                          type="button"
                          onClick={() => {
                            const cardObj = buildMemberCardPayload(activeConversation);
                            handleSendReply(
                              undefined,
                              `Jai Hind ${activeConversation.customerName}! Here is your Official Maha Seva Dal Digital PVC ID Card (${cardObj.registrationId}). Tap View or Download below.`,
                              "msd_registration_confirmation_id_v1",
                              "OUTBOUND",
                              {
                                stepName: "Official Digital ID Card Sent in WhatsApp",
                                buttonClicked: "Send ID Card",
                                cardData: cardObj,
                              }
                            );
                          }}
                          className="p-1 rounded-lg hover:bg-[#FAF6F0] hover:text-[#FF6200] cursor-pointer shrink-0"
                          title="Send Official Digital PVC ID Card in Chat"
                        >
                          <Paperclip size={14} />
                        </button>

                        {/* Icon 5: Smile — Simulate User "Hi" */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSendReply(undefined, "Hi", undefined, "INBOUND", {
                              stepName: "User Sent 'Hi' (24-Hour Window Opened)",
                              buttonClicked: "Hi",
                            })
                          }
                          className="p-1 rounded-lg hover:bg-[#FAF6F0] hover:text-[#FF6200] cursor-pointer shrink-0"
                          title="Simulate User 'Hi' Message"
                        >
                          <Smile size={14} />
                        </button>

                        {/* Icon 6: Mode Switcher (Admin vs User) */}
                        <div className="flex items-center rounded-lg border border-[#EAE0D2] bg-[#FAF6F0] p-0.5 ml-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setChatActorMode("ADMIN")}
                            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold cursor-pointer ${
                              chatActorMode === "ADMIN"
                                ? "bg-stone-900 text-white"
                                : "text-stone-600"
                            }`}
                          >
                            Admin
                          </button>
                          <button
                            type="button"
                            onClick={() => setChatActorMode("USER")}
                            className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-bold cursor-pointer ${
                              chatActorMode === "USER"
                                ? "bg-[#FF6200] text-white"
                                : "text-stone-600"
                            }`}
                          >
                            User
                          </button>
                        </div>
                      </div>

                      {/* WATI Send Button (Always Visible & Never Clipped) */}
                      <button
                        type="submit"
                        disabled={sendingReply || !replyText.trim()}
                        className="px-3 py-1 rounded-lg bg-[#FF6200] hover:bg-[#D65000] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
                      >
                        <MessageSquare size={12} />
                        <span>{chatActorMode === "USER" ? "Send as User" : "Send"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="border-b lg:border-b-0 lg:border-r border-[#EAE0D2] flex flex-col items-center justify-center h-full min-h-0 p-6 sm:p-8 bg-gradient-to-b from-[#FAF6F0] via-white to-[#F7F3EC] text-center">
                <div className="max-w-md mx-auto space-y-4">
                  {/* Central WhatsApp + MSD Saffron Emblem */}
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFF5EB] to-[#FDE8D0] border border-[#FED7AA] flex items-center justify-center shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                      <WhatsAppOfficialIcon size={22} className="text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                  </div>

                  <div>
                    <h3 className="font-serif font-black text-lg text-stone-900">
                      National Secretariat Team Inbox
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Select any conversation from the list to view incoming WhatsApp messages, track registration steps, and send official digital ID cards.
                    </p>
                  </div>

                  {/* Standby Quick Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE0D2] shadow-2xs">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Active</div>
                      <div className="font-serif text-base font-bold text-stone-900 mt-0.5">{conversations.length}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilterStatus("UNREAD");
                        setInboxPage(1);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#EAE0D2] shadow-2xs hover:border-[#FF6200] cursor-pointer transition-colors"
                      title="Filter unread chats"
                    >
                      <div className="text-[10px] font-bold text-[#FF6200] uppercase tracking-wider">Unread</div>
                      <div className="font-serif text-base font-bold text-[#FF6200] mt-0.5">{totalUnreadCount}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilterStatus("PENDING");
                        setInboxPage(1);
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#EAE0D2] shadow-2xs hover:border-amber-400 cursor-pointer transition-colors"
                      title="Filter pending approvals"
                    >
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pending</div>
                      <div className="font-serif text-base font-bold text-amber-900 mt-0.5">
                        {conversations.filter((c) => c.registrationStatus === "PENDING").length}
                      </div>
                    </button>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewChatModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FF6200] hover:bg-[#D65000] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Plus size={13} />
                      <span>Start New Conversation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilterStatus("UNREAD");
                        setInboxPage(1);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#E4D9C8] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Filter size={13} className="text-[#FF6200]" />
                      <span>View Unread ({totalUnreadCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                COLUMN 3 (RIGHT PANE): WATI CONTACT INFO, ATTRIBUTES, TAGS & NOTES
               ═══════════════════════════════════════════════════════════════════════ */}
            {activeConversation ? (
              <div className="bg-white flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar scroll-smooth divide-y divide-[#EAE0D2]">
                {/* Top Contact Header Row (Avatar with WA Badge + Name + Preview/Download ID Card) */}
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-[#F5EFE6] border border-[#DFD2BE] text-[#7C2D12] flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white ${
                          activeConversation.channel === "web" ? "bg-[#0284c7] text-white" : "bg-[#25D366] text-white"
                        }`}
                      >
                        {activeConversation.channel === "web" ? (
                          <WebPortalIcon size={8} className="text-white" />
                        ) : (
                          <WhatsAppOfficialIcon size={8} className="text-white" />
                        )}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {activeConversation.customerName}
                      </h4>
                      <div className="text-[10.5px] font-mono text-[#FF6200] font-semibold truncate">
                        {activeConversation.registrationId || "MSD Cadre Lead"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openFullCardPreviewModal(activeConversation)}
                      className="p-1.5 rounded-lg bg-[#FFF5EB] hover:bg-orange-100 text-[#FF6200] border border-orange-200 cursor-pointer"
                      title="Preview Digital PVC ID Card"
                    >
                      <CreditCard size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCardFromInbox(activeConversation, "pdf")}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white cursor-pointer"
                      title="Download Official Digital ID Card PDF"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>

                {/* Section 1: Contact info */}
                <div className="p-3.5 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setContactInfoOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-stone-900 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCard size={14} className="text-stone-500" />
                      <span>Contact info</span>
                    </span>
                    {contactInfoOpen ? (
                      <ChevronUp size={14} className="text-stone-400" />
                    ) : (
                      <ChevronDown size={14} className="text-stone-400" />
                    )}
                  </button>

                  {contactInfoOpen && (
                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Phone Number</span>
                        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                          <IndiaFlag width={18} height={12} />
                          <span className="font-mono">+91 {activeConversation.mobile}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(`+91${activeConversation.mobile}`);
                              showNotice("Phone number copied!");
                            }}
                            className="text-stone-400 hover:text-[#FF6200] cursor-pointer"
                            title="Copy Phone Number"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Display name</span>
                        <span className="font-bold text-stone-900 truncate">
                          {activeConversation.customerName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Username</span>
                        <span className="font-mono text-stone-800 font-semibold truncate">
                          {activeConversation.registrationId ||
                            `msd_${activeConversation.mobile.slice(-4)}`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Source</span>
                        <span className="font-semibold text-stone-800 truncate max-w-[155px]">
                          {String(activeConversation.channel || "").toLowerCase().includes("web")
                            ? "Web Registration Portal"
                            : "WhatsApp Cloud Chat"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Contact Attributes */}
                <div className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setContactAttrOpen((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer"
                    >
                      <FileText size={14} className="text-stone-500" />
                      <span>Contact Attributes</span>
                    </button>
                    <div className="flex items-center gap-2 text-stone-400">
                      <Edit3 size={13} className="hover:text-stone-700 cursor-pointer" />
                      <button
                        type="button"
                        onClick={() => setContactAttrOpen((prev) => !prev)}
                        className="cursor-pointer"
                      >
                        {contactAttrOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {contactAttrOpen && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">New Lead</span>
                        <span className="font-bold text-stone-900">
                          {activeConversation.memberType === "EXISTING_MEMBER" ? "No (Member)" : "Yes"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Qualified</span>
                        <span className="font-bold text-stone-900">
                          {activeConversation.registrationStatus === "APPROVED"
                            ? "Yes (Approved)"
                            : activeConversation.registrationStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Assigned Wing</span>
                        <span className="font-bold text-stone-800 truncate max-w-[155px]">
                          {activeConversation.wing || "General Seva Cadre"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">Location</span>
                        <span className="font-semibold text-stone-800 truncate max-w-[155px]">
                          {activeConversation.district || "Central"},{" "}
                          {activeConversation.state || "India"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-500">ID Card Status</span>
                        <span className="font-bold text-emerald-700">
                          {activeConversation.cardDownloaded
                            ? "Downloaded ✓"
                            : activeConversation.cardViewed
                            ? "Viewed in Chat"
                            : "Ready"}
                        </span>
                      </div>

                      {autoMatchedTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            const filled = fillTemplateVariables(
                              autoMatchedTemplate,
                              activeConversation
                            );
                            const attachCard =
                              autoMatchedTemplate.name ===
                                "msd_registration_confirmation_id_v1" ||
                              autoMatchedTemplate.useCase === "REGISTRATION_CONFIRMATION"
                                ? buildMemberCardPayload(activeConversation)
                                : null;
                            handleSendReply(
                              undefined,
                              filled,
                              autoMatchedTemplate.name,
                              "OUTBOUND",
                              {
                                stepName: `Sent Approved Template: ${autoMatchedTemplate.displayName}`,
                                buttonClicked: autoMatchedTemplate.displayName,
                                cardData: attachCard,
                              }
                            );
                          }}
                          className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-[#FF6200] hover:bg-[#D65000] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Send size={11} />
                          <span>Send {autoMatchedTemplate.displayName}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 3: Tags */}
                <div className="p-3.5 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setTagsOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-stone-900 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tag size={14} className="text-stone-500" />
                      <span>Tags</span>
                    </span>
                    {tagsOpen ? (
                      <ChevronUp size={14} className="text-stone-400" />
                    ) : (
                      <ChevronDown size={14} className="text-stone-400" />
                    )}
                  </button>

                  {tagsOpen && (
                    <div className="space-y-2.5 pt-1">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!tagInput.trim()) return;
                          const mob = activeConversation.mobile;
                          setCustomTagsByMobile((prev) => ({
                            ...prev,
                            [mob]: [...(prev[mob] || []), tagInput.trim()],
                          }));
                          setTagInput("");
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E4D9C8] bg-[#FAF6F0] focus:bg-white focus:outline-none focus:border-[#FF6200]"
                        />
                      </form>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "VIP",
                          activeConversation.memberType === "EXISTING_MEMBER"
                            ? "Already Member"
                            : "New Member",
                          activeConversation.registrationStatus,
                          ...(customTagsByMobile[activeConversation.mobile] || []),
                        ].map((tg, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F2EAE0] text-[11px] font-bold text-stone-700"
                          >
                            <span>{tg}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (i >= 3) {
                                  const mob = activeConversation.mobile;
                                  setCustomTagsByMobile((prev) => ({
                                    ...prev,
                                    [mob]: (prev[mob] || []).filter((item) => item !== tg),
                                  }));
                                }
                              }}
                              className="text-stone-400 hover:text-stone-700 cursor-pointer"
                            >
                              <XCircle size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Notes (Exact WATI Note Card with User Circle + Edit/Trash Boxes) */}
                <div className="p-3.5 space-y-2.5 flex-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setNotesOpen((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-bold text-stone-900 cursor-pointer"
                    >
                      <StickyNote size={14} className="text-stone-500" />
                      <span>Notes</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingNote((prev) => !prev);
                          setNotesOpen(true);
                        }}
                        className="px-2 py-0.5 rounded border border-[#FF6200] text-[#FF6200] hover:bg-[#FFF5EB] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotesOpen((prev) => !prev)}
                        className="text-stone-400 cursor-pointer"
                      >
                        {notesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {notesOpen && (
                    <div className="space-y-2.5 pt-1">
                      {addingNote && (
                        <div className="p-2.5 rounded-xl bg-[#FBF6E3] border border-[#EFE2B2] space-y-2">
                          <textarea
                            rows={2}
                            placeholder="Write note..."
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            className="w-full text-xs bg-white p-2 rounded-lg border border-[#E4D9C8] focus:outline-none"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAddingNote(false);
                                setNoteInput("");
                              }}
                              className="px-2 py-1 rounded text-[10px] font-semibold text-stone-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!noteInput.trim()) return;
                                const mob = activeConversation.mobile;
                                const newNote = {
                                  id: String(Date.now()),
                                  author: activeAgentDesk,
                                  time: "Nov 02, 01:55 pm",
                                  text: noteInput.trim(),
                                };
                                setNotesByMobile((prev) => ({
                                  ...prev,
                                  [mob]: [newNote, ...(prev[mob] || [])],
                                }));
                                setNoteInput("");
                                setAddingNote(false);
                              }}
                              className="px-2.5 py-1 rounded bg-[#FF6200] text-white text-[10px] font-bold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}

                      {(
                        notesByMobile[activeConversation.mobile] || [
                          {
                            id: "default-1",
                            author: activeAgentDesk,
                            time: "Nov 02, 01:55 pm",
                            text: `${activeConversation.customerName} (${
                              activeConversation.registrationId || "New Lead"
                            }) — Last step: ${activeConversation.lastCompletedStep}.`,
                          },
                        ]
                      ).map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl bg-[#FBF6E3] border border-[#EFE2B2] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full border border-stone-500 text-stone-700 flex items-center justify-center shrink-0">
                                <User size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-stone-900 truncate">
                                  {note.author}
                                </div>
                                <div className="text-[10px] text-stone-500">{note.time}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setNoteInput(note.text);
                                  setAddingNote(true);
                                }}
                                className="w-6 h-6 rounded border border-stone-400/80 flex items-center justify-center text-stone-600 hover:bg-white cursor-pointer"
                                title="Edit Note"
                              >
                                <Edit3 size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (note.id !== "default-1") {
                                    const mob = activeConversation.mobile;
                                    setNotesByMobile((prev) => ({
                                      ...prev,
                                      [mob]: (prev[mob] || []).filter((n) => n.id !== note.id),
                                    }));
                                  }
                                }}
                                className="w-6 h-6 rounded border border-stone-400/80 flex items-center justify-center text-stone-600 hover:bg-white cursor-pointer"
                                title="Delete Note"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs font-medium text-stone-800 leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar divide-y divide-[#EAE0D2]">
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5EB] border border-orange-200 text-[#FF6200] flex items-center justify-center shrink-0">
                      <Headphones size={15} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">Cadre Desk Live Status</h4>
                      <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected & Ready</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EAE0D2] space-y-2 text-xs text-stone-700">
                    <div className="font-bold text-stone-900 text-[11px] flex items-center justify-between">
                      <span>WhatsApp Business Account</span>
                      <span className="font-mono text-[9.5px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">LIVE</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-stone-900">+91 9994625698</div>
                    <p className="text-[10.5px] text-stone-500 leading-relaxed">
                      WACTO Meta Cloud API webhook active. Inbound user messages, step clicks and card downloads update in real time.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
                    <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                      <Clock size={12} className="text-amber-700" />
                      <span>24-Hour Service Window Policy</span>
                    </div>
                    <p className="text-[10.5px] text-amber-800 leading-relaxed">
                      Meta allows free-form replies within 24 hours of the customer&apos;s last inbound message. After 24 hours, you can initiate conversation only with approved Meta Templates.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#EAE0D2] shadow-2xs space-y-2">
                    <div className="font-bold text-stone-900 text-[11px]">Quick Secretariat Actions</div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNewChatModalOpen(true)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#FF6200] hover:bg-[#D65000] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus size={12} />
                        <span>Start New Conversation</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("templates")}
                        className="w-full py-1.5 px-2.5 rounded-lg border border-[#E4D9C8] hover:bg-[#FAF6F0] text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={12} className="text-stone-500" />
                        <span>Approved Meta Templates</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIEW 3: LEADS (Completed & Incomplete Registration Leads)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "leads" && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLeadCategoryTab("ALL");
                    setLeadPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    leadCategoryTab === "ALL"
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  <UserPlus size={13} />
                  <span>All Leads</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                    {leads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeadCategoryTab("COMPLETED");
                    setLeadPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    leadCategoryTab === "COMPLETED"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Completed Registration Leads</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                    {leads.filter((l) => l.leadCategory === "COMPLETED").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeadCategoryTab("INCOMPLETE");
                    setLeadPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    leadCategoryTab === "INCOMPLETE"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  <Clock size={13} />
                  <span>Incomplete Registration Leads</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                    {leads.filter((l) => l.leadCategory === "INCOMPLETE").length}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => fetchCrmOverview()}
                disabled={refreshing}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 bg-white text-xs font-semibold flex items-center gap-1.5 text-stone-700 cursor-pointer self-start lg:self-auto"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin text-[#FF6200]" : ""} />
                <span>Refresh Leads</span>
              </button>
            </div>

            {/* Search & Channel Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  placeholder="Search by Name, Mobile, Reg ID, State, Wing..."
                  value={leadSearch}
                  onChange={(e) => {
                    setLeadSearch(e.target.value);
                    setLeadPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={leadChannelFilter}
                  onChange={(e) => {
                    setLeadChannelFilter(e.target.value as "ALL" | "whatsapp" | "web");
                    setLeadPage(1);
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 font-semibold"
                >
                  <option value="ALL">Channel: All (Web + WhatsApp)</option>
                  <option value="whatsapp">WhatsApp Leads</option>
                  <option value="web">Website Leads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Selection Bar for CRM Leads */}
          {selectedCrmLeadIds.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  {selectedCrmLeadIds.length}
                </span>
                <span>{selectedCrmLeadIds.length} lead(s) selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrmLeadIds([])}
                  className="px-2.5 py-1 rounded-lg text-stone-600 hover:bg-stone-200 text-xs font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => setBulkCrmLeadDeleteOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected ({selectedCrmLeadIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Leads Table */}
          <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/90 text-[10.5px] font-bold uppercase text-stone-500">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          paginatedLeads.length > 0 &&
                          paginatedLeads.every((l) =>
                            selectedCrmLeadIds.includes(l.id || l.mobile)
                          )
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            const ids = paginatedLeads.map((l) => l.id || l.mobile);
                            setSelectedCrmLeadIds((prev) => Array.from(new Set([...prev, ...ids])));
                          } else {
                            const ids = new Set(paginatedLeads.map((l) => l.id || l.mobile));
                            setSelectedCrmLeadIds((prev) => prev.filter((id) => !ids.has(id)));
                          }
                        }}
                        className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        title="Select All Leads on page"
                      />
                    </th>
                    <th className="py-3 px-4">Candidate & Mobile</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-3">Registration Category</th>
                    <th className="py-3 px-3">Last Completed Step</th>
                    <th className="py-3 px-3">State & Wing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedLeads.map((lead) => (
                    <tr
                      key={lead.mobile}
                      onDoubleClick={() => {
                        setSelectedMobile(lead.mobile);
                        setActiveSubTab("inbox");
                      }}
                      title="Double-click to open lead conversation"
                      className="hover:bg-stone-50/70 cursor-pointer select-none"
                    >
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCrmLeadIds.includes(lead.id || lead.mobile)}
                          onChange={(e) => {
                            const leadKey = lead.id || lead.mobile;
                            if (e.target.checked) {
                              setSelectedCrmLeadIds((prev) => [...prev, leadKey]);
                            } else {
                              setSelectedCrmLeadIds((prev) => prev.filter((id) => id !== leadKey));
                            }
                          }}
                          className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-stone-900">{lead.fullName}</div>
                        <div className="font-mono text-[11px] text-stone-500">+91 {lead.mobile}</div>
                        {lead.registrationId && (
                          <span className="font-mono text-[10px] text-[#FF6200] font-bold">
                            {lead.registrationId}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {lead.registrationId || String(lead.channel || "").toLowerCase() === "web" || !String(lead.channel || "").toLowerCase().includes("whatsapp") ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            <Globe size={11} />
                            <span>Web</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Smartphone size={11} />
                            <span>WhatsApp</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {lead.leadCategory === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-900">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-900">
                            <Clock size={11} /> Incomplete
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-stone-800">
                        {lead.lastStepLabel}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        <div>{lead.wing || "General Seva Cadre"}</div>
                        <div className="text-[10.5px] text-stone-400">{lead.state || "India"}</div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMobile(lead.mobile);
                              setActiveSubTab("inbox");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Open Chat
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCrmLeadToDelete(lead);
                            }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title="Delete Lead from MongoDB"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leads Table Pagination Footer */}
            <div className="px-4 py-3 border-t border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
              <div className="flex items-center gap-3">
                <span>
                  Showing{" "}
                  <strong>
                    {filteredLeads.length === 0 ? 0 : (safeLeadPage - 1) * leadPageSize + 1}
                  </strong>{" "}
                  to{" "}
                  <strong>{Math.min(safeLeadPage * leadPageSize, filteredLeads.length)}</strong> of{" "}
                  <strong>{filteredLeads.length}</strong> records
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500">Rows per page:</span>
                  <select
                    value={leadPageSize}
                    onChange={(e) => {
                      setLeadPageSize(Number(e.target.value));
                      setLeadPage(1);
                    }}
                    className="px-2 py-1 rounded-lg border border-stone-200 bg-white font-semibold text-xs"
                  >
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLeadPage(1)}
                  disabled={safeLeadPage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  « First
                </button>
                <button
                  type="button"
                  onClick={() => setLeadPage((p) => Math.max(1, p - 1))}
                  disabled={safeLeadPage <= 1}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  ‹ Prev
                </button>
                <span className="px-2.5 font-bold text-stone-900">
                  Page {safeLeadPage} of {leadTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setLeadPage((p) => Math.min(leadTotalPages, p + 1))}
                  disabled={safeLeadPage >= leadTotalPages}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  Next ›
                </button>
                <button
                  type="button"
                  onClick={() => setLeadPage(leadTotalPages)}
                  disabled={safeLeadPage >= leadTotalPages}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold cursor-pointer"
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIEW 4: TEMPLATES (WhatsApp Template Management & Meta Approval)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "templates" && (
        <div className="space-y-4">
          {/* Templates Top Bar */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {["ALL", "APPROVED", "PENDING", "REJECTED", "PAUSED", "DISABLED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTemplateFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    templateFilterStatus === st
                      ? "bg-[#FF6200] text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {st === "ALL" ? "All Templates" : st}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncMetaTemplates}
                disabled={syncingMeta}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={syncingMeta ? "animate-spin" : ""} />
                <span>{syncingMeta ? "Syncing Meta..." : "Sync Status from Meta"}</span>
              </button>

              <button
                type="button"
                onClick={() => openEditTemplateModal()}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Template</span>
              </button>
            </div>
          </div>

          {/* Templates Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates
              .filter(
                (t) => templateFilterStatus === "ALL" || t.metaStatus === templateFilterStatus
              )
              .map((tpl) => (
                <div
                  key={tpl._id || tpl.name}
                  className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-sm text-stone-900">
                            {tpl.displayName}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-50 text-[#FF6200] border border-orange-200 font-bold">
                            {USE_CASE_LABELS[tpl.useCase] || tpl.useCase}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-stone-500 mt-0.5">
                          {tpl.name} · {tpl.category} · Lang: {tpl.language} · Header: {tpl.headerType}
                        </div>
                      </div>

                      {/* Meta Approval Status Badge */}
                      <span
                        className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-mono font-bold border shrink-0 ${
                          tpl.metaStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : tpl.metaStatus === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : tpl.metaStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-stone-100 text-stone-700 border-stone-300"
                        }`}
                      >
                        ● {tpl.metaStatus}
                      </span>
                    </div>

                    {/* WhatsApp Preview Bubble */}
                    <div className="p-3 rounded-xl bg-[#EFEAE2] border border-stone-200/80 text-xs space-y-1.5">
                      {tpl.headerType !== "NONE" && (
                        <div className="text-[11px] font-bold text-stone-700 bg-white/80 px-2.5 py-1 rounded border border-stone-200/60 flex items-center justify-between">
                          <span>
                            [{tpl.headerType} HEADER] {tpl.headerText}
                          </span>
                          {tpl.headerMediaUrl && (
                            <span className="text-[10px] text-emerald-700 font-mono">
                              Media Attached ✓
                            </span>
                          )}
                        </div>
                      )}
                      <div className="bg-white p-2.5 rounded-lg text-stone-800 whitespace-pre-wrap leading-relaxed">
                        {tpl.bodyText}
                      </div>
                      {tpl.footerText && (
                        <div className="text-[10px] text-stone-500 px-1">{tpl.footerText}</div>
                      )}
                      {tpl.buttons && tpl.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tpl.buttons.map((b: TemplateButtonItem, i: number) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded bg-white text-sky-700 font-semibold text-[11px] border border-stone-200"
                            >
                              {b.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta Rejection Reason Box */}
                    {tpl.metaStatus === "REJECTED" && tpl.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                        <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">Meta Rejection Reason:</div>
                          <div>{tpl.rejectionReason}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-stone-500">
                      {tpl.metaStatus === "APPROVED"
                        ? "✓ Auto-Shown in Inbox 24h Bar"
                        : `WABA ID: ${tpl.metaTemplateId || "Pending Sync"}`}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openEditTemplateModal(tpl)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={12} />
                        <span>{tpl.metaStatus === "REJECTED" ? "Edit & Resubmit" : "Edit"}</span>
                      </button>

                      {tpl.metaStatus === "APPROVED" ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeConversation) {
                              setReplyText(fillTemplateVariables(tpl, activeConversation));
                            }
                            setActiveSubTab("inbox");
                            showNotice(
                              `Loaded "${tpl.displayName}" into WhatsApp Inbox ready to send!`
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Send size={11} />
                          <span>Send in Inbox</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSubmitTemplateToMeta(tpl._id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowUpRight size={12} />
                          <span>✅ Approve & Show in Inbox</span>
                        </button>
                      )}

                      {tpl._id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl._id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── BOT NODE EDIT MODAL ─── */}
      {editingBotNode && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingBotNode(null);
          }}
        >
          <form
            onSubmit={handleSaveBotNode}
            className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-5 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Edit Bot Message: {editingBotNode.name}
                </h3>
                <p className="text-[11px] text-stone-500 font-mono">{editingBotNode.nodeId}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBotNode(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Header Text (Optional)</label>
              <input
                type="text"
                value={editingBotNode.data?.header?.text || ""}
                onChange={(e) =>
                  setEditingBotNode({
                    ...editingBotNode,
                    data: {
                      ...editingBotNode.data,
                      header: { type: "text", text: e.target.value },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Message Body</label>
              <textarea
                rows={5}
                value={editingBotNode.data?.body || ""}
                onChange={(e) =>
                  setEditingBotNode({
                    ...editingBotNode,
                    data: {
                      ...editingBotNode.data,
                      body: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEditingBotNode(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF6200] hover:bg-[#D65000] text-white font-bold cursor-pointer"
              >
                Save Bot Message
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TEMPLATE CREATE / EDIT / RESUBMIT MODAL ─── */}
      {editingTemplate && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTemplate(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {templateForm._id
                    ? "Edit & Resubmit WhatsApp Template"
                    : "Create Meta WhatsApp Template"}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Configure header media, dynamic variables {"{{1}}"}, and interactive buttons
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Display Title</label>
                <input
                  type="text"
                  value={templateForm.displayName}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Meta Template Name (snake_case)
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Template Use-Case</label>
                <select
                  value={templateForm.useCase}
                  onChange={(e) => setTemplateForm({ ...templateForm, useCase: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  {Object.entries(USE_CASE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Meta Category</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="UTILITY">UTILITY</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Header Media Type</label>
                <select
                  value={templateForm.headerType}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, headerType: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="NONE">NONE</option>
                  <option value="TEXT">TEXT</option>
                  <option value="IMAGE">IMAGE</option>
                  <option value="DOCUMENT">DOCUMENT (PDF)</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
              </div>

              {templateForm.headerType !== "NONE" && (
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Header Text / Upload Media
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Header caption or URL..."
                      value={templateForm.headerText}
                      onChange={(e) =>
                        setTemplateForm({ ...templateForm, headerText: e.target.value })
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200"
                    />
                    <label className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold cursor-pointer shrink-0">
                      {uploadingMedia ? "..." : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleTemplateMediaUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Message Body (Supports {"{{1}}"}, {"{{2}}"}, {"{{3}}"} dynamic variables)
              </label>
              <textarea
                rows={4}
                value={templateForm.bodyText}
                onChange={(e) => setTemplateForm({ ...templateForm, bodyText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveTemplate(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold cursor-pointer"
              >
                Save Template
              </button>
              <button
                type="button"
                onClick={() => handleSaveTemplate(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Save & Submit to Meta WABA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          MODAL: START NEW WHATSAPP CONVERSATION (LOGICAL '+' ACTION)
         ═══════════════════════════════════════════════════════════════════════════ */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#EAE0D2] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xs">
                  <WhatsAppOfficialIcon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Start New WhatsApp Conversation
                  </h3>
                  <p className="text-xs text-stone-500">
                    Initiate an official Meta-approved conversation or message with a lead
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewChatModalOpen(false);
                  setNewChatMobile("");
                  setNewChatName("");
                }}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const cleanMob = newChatMobile.replace(/\D/g, "").slice(-10);
                if (cleanMob.length !== 10) {
                  showNotice("Please enter a valid 10-digit mobile number");
                  return;
                }
                const customerName = newChatName.trim() || `Cadre Lead (+91 ${cleanMob})`;
                const selectedTpl =
                  templates.find((t) => t.name === newChatTemplate) || templates[0];

                // Check if already in conversations
                const existing = conversations.find(
                  (c) => c.mobile.replace(/\D/g, "").slice(-10) === cleanMob
                );

                if (existing) {
                  handleSelectConversation(existing);
                  if (selectedTpl) {
                    const filled = fillTemplateVariables(selectedTpl, existing);
                    await handleSendReply(
                      undefined,
                      filled,
                      selectedTpl.name,
                      "OUTBOUND",
                      {
                        stepName: `Initiated Chat via Template: ${selectedTpl.displayName}`,
                        buttonClicked: "New Chat Modal",
                      }
                    );
                  }
                  setNewChatModalOpen(false);
                  setNewChatMobile("");
                  setNewChatName("");
                  showNotice(`Opened conversation with ${existing.customerName}`);
                  return;
                }

                // Create new conversation item
                const newConv: ConversationItem = {
                  mobile: cleanMob,
                  customerName,
                  registrationId: `MSD-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  channel: "whatsapp",
                  memberType: "NEW_MEMBER",
                  registrationStatus: "PENDING",
                  lastCompletedStep: "Admin Initiated WhatsApp Chat",
                  unreadCount: 0,
                  cardDownloaded: false,
                  windowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                  messages: [],
                  stepHistory: [
                    {
                      stepLabel: "Admin Initiated WhatsApp Chat",
                      buttonClicked: "New Conversation",
                      timestamp: new Date().toISOString(),
                    },
                  ],
                };

                // Track in MongoDB backend
                try {
                  const filledBody = selectedTpl
                    ? fillTemplateVariables(selectedTpl, newConv)
                    : "Jai Hind! Welcome to Maha Seva Dal.";
                  await fetch(getApiUrl("/api/whatsapp-crm/inbox/track-event"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mobile: cleanMob,
                      customerName,
                      registrationStatus: "PENDING",
                      registrationId: newConv.registrationId,
                      stepLabel: `Initiated via Template: ${selectedTpl?.displayName || "Default"}`,
                      buttonClicked: "Start New Chat",
                      botReply: filledBody,
                      templateName: selectedTpl?.name,
                    }),
                  });
                } catch (err) {
                  console.error("Error creating new chat:", err);
                }

                setConversations((prev) => [newConv, ...prev.filter((c) => c.mobile !== cleanMob)]);
                setSelectedMobile(cleanMob);
                setNewChatModalOpen(false);
                setNewChatMobile("");
                setNewChatName("");
                showNotice(`Started conversation with ${customerName}!`);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Customer Mobile Number *
                </label>
                <div className="flex rounded-xl border border-[#E4D9C8] overflow-hidden focus-within:border-[#FF6200] bg-[#FAF6F0]">
                  <span className="px-3 py-2 bg-[#F3ECE1] text-xs font-bold text-stone-700 border-r border-[#E4D9C8] flex items-center gap-1.5">
                    <IndiaFlag width={18} height={12} />
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="8903162114"
                    maxLength={10}
                    value={newChatMobile}
                    onChange={(e) => setNewChatMobile(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-3 py-2 text-xs bg-white focus:outline-none text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Customer / Cadre Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gowthaam"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4D9C8] focus:border-[#FF6200] bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Initial Meta-Approved WhatsApp Template
                </label>
                <select
                  value={newChatTemplate}
                  onChange={(e) => setNewChatTemplate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4D9C8] focus:border-[#FF6200] bg-white focus:outline-none cursor-pointer"
                >
                  {templates.map((tpl) => (
                    <option key={tpl._id || tpl.name} value={tpl.name}>
                      {tpl.displayName} ({tpl.language})
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Preview */}
              {(() => {
                const previewTpl =
                  templates.find((t) => t.name === newChatTemplate) || templates[0];
                return (
                  previewTpl && (
                    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EAE0D2] space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Template Preview
                      </div>
                      <p className="text-[11px] text-stone-700 leading-relaxed font-mono whitespace-pre-wrap">
                        {previewTpl.bodyText}
                      </p>
                    </div>
                  )
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE0D2]">
                <button
                  type="button"
                  onClick={() => {
                    setNewChatModalOpen(false);
                    setNewChatMobile("");
                    setNewChatName("");
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#FF6200] hover:bg-[#D65000] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <WhatsAppOfficialIcon size={14} className="text-white" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          MODAL: FULL DIGITAL PVC ID CARD PREVIEW & DOWNLOAD IN WHATSAPP INBOX
         ═══════════════════════════════════════════════════════════════════════════ */}
      {previewCardMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#FF6200]" />
                  <span>
                    WhatsApp Digital PVC ID Card Preview · {previewCardMember.fullName}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  Official Front & Reverse Cadre Identity Card ({previewCardMember.registrationId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCardMember(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center overflow-x-auto py-2">
              <DigitalIdCard
                member={{
                  registrationId: previewCardMember.registrationId || "MSD-IND-2026",
                  fullName: previewCardMember.fullName || "Cadre Member",
                  fatherName: previewCardMember.fatherName,
                  dob: previewCardMember.dob,
                  gender: previewCardMember.gender,
                  mobile: previewCardMember.mobile,
                  whatsapp: previewCardMember.whatsapp,
                  bloodGroup: previewCardMember.bloodGroup,
                  photoUrl: previewCardMember.photoUrl,
                  state: previewCardMember.state || "Tamil Nadu",
                  district: previewCardMember.district || "Chennai",
                  address: previewCardMember.address,
                  pincode: previewCardMember.pincode,
                  wing: previewCardMember.wing || "General Seva Cadre",
                  status: previewCardMember.status || "APPROVED",
                }}
                qrDataUrl={previewCardQrUrl}
                defaultView="both"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: WHATSAPP-STYLE DELETE CHAT CONFIRMATION ─── */}
      {convToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Delete chat?</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent Deletion from MongoDB</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
              <div><span className="text-stone-500">Contact:</span> <strong>{convToDelete.customerName}</strong></div>
              <div><span className="text-stone-500">Mobile:</span> <strong className="font-mono">+91 {convToDelete.mobile}</strong></div>
              <div><span className="text-stone-500">Messages:</span> <strong className="font-mono">{convToDelete.messages?.length || 0} messages</strong></div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Messages will be permanently deleted from MongoDB and the conversation history will be wiped. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setConvToDelete(null)}
                disabled={deleteActionLoading}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                disabled={deleteActionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: BULK DELETE CONVERSATIONS CONFIRMATION ─── */}
      {bulkConvDeleteOpen && selectedConvMobiles.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Delete Selected Chats</h3>
                <p className="text-xs text-rose-600 font-medium">Bulk Deletion ({selectedConvMobiles.length} Chats)</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-950">
              <p className="font-bold">⚠️ Permanently delete {selectedConvMobiles.length} chat conversation(s) from MongoDB?</p>
              <p className="text-stone-600 mt-1 leading-relaxed">
                All message histories, inbound replies, and conversation records will be permanently removed from MongoDB.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setBulkConvDeleteOpen(false)}
                disabled={deleteActionLoading}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDeleteConversations}
                disabled={deleteActionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete {selectedConvMobiles.length} Chats</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: WHATSAPP-STYLE DELETE MESSAGE CONFIRMATION ─── */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Delete message?</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent Deletion from MongoDB</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="text-stone-500 font-medium">Message preview:</div>
              <div className="text-stone-800 italic line-clamp-3 bg-white p-2 rounded border border-stone-200">
                &ldquo;{messageToDelete.message.content || `[${messageToDelete.message.type || "Media"}]`}&rdquo;
              </div>
              <div className="text-[10px] text-stone-400">
                {messageToDelete.message.timestamp
                  ? new Date(messageToDelete.message.timestamp).toLocaleString("en-IN")
                  : "Recent"}
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete this message? This message will be permanently removed from MongoDB.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={deleteActionLoading}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMessage}
                disabled={deleteActionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete for Everyone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CRM LEAD CONFIRMATION ─── */}
      {crmLeadToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Delete CRM Lead</h3>
                <p className="text-xs text-rose-600 font-medium">Permanent Deletion from MongoDB</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1 font-mono">
              <div><b>Candidate:</b> {crmLeadToDelete.fullName}</div>
              <div><b>Mobile:</b> +91 {crmLeadToDelete.mobile}</div>
              <div><b>Channel:</b> {crmLeadToDelete.channel}</div>
              <div><b>Category:</b> {crmLeadToDelete.leadCategory}</div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete this lead from MongoDB? All partial drop-off records will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCrmLeadToDelete(null)}
                disabled={deleteActionLoading}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCrmLead}
                disabled={deleteActionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: BULK DELETE CRM LEADS CONFIRMATION ─── */}
      {bulkCrmLeadDeleteOpen && selectedCrmLeadIds.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">Delete Selected Leads</h3>
                <p className="text-xs text-rose-600 font-medium">Bulk Deletion ({selectedCrmLeadIds.length} Leads)</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-950">
              <p className="font-bold">⚠️ Permanently delete {selectedCrmLeadIds.length} lead records from MongoDB?</p>
              <p className="text-stone-600 mt-1 leading-relaxed">
                All contact and registration progress history for these candidates will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setBulkCrmLeadDeleteOpen(false)}
                disabled={deleteActionLoading}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDeleteCrmLeads}
                disabled={deleteActionLoading}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deleteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete {selectedCrmLeadIds.length} Leads</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppCrmManager;
