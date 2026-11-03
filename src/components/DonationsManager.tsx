import React, { useState, useEffect, useCallback } from "react";
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  FileJson,
  Eye,
  X,
  IndianRupee,
  Coins,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getApiUrl } from "@/config/api";

export interface Donation {
  _id: string;
  receiptNo: string;
  donorName: string;
  mobile: string;
  amount: number;
  utr: string;
  cause: string;
  paymentMode: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  isMember: boolean;
  memberRegId?: string;
  memberWing?: string;
  screenshotUrl?: string;
  adminNotes?: string;
  verifiedAt?: string | null;
  whatsappMessage?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DonationStats {
  totalAmount: number;
  verifiedAmount: number;
  totalCount: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  memberDonationsCount: number;
  publicDonationsCount: number;
}

interface DonationsManagerProps {
  token: string;
  onPendingCountChange?: (count: number) => void;
}

const DEMO_DONATIONS: Donation[] = [
  {
    _id: "demo_1",
    receiptNo: "MSD-DON-2026-0001",
    donorName: "Jaysurya S",
    mobile: "9888888888",
    amount: 1000,
    utr: "432109876543",
    cause: "General Community Welfare & Annadanam",
    paymentMode: "UPI",
    status: "PENDING",
    isMember: true,
    memberRegId: "MSD-IND-2026-0001",
    memberWing: "Education & Child Welfare",
    adminNotes: "Submitted via WhatsApp Bot Flow",
    whatsappMessage:
      "🚩 *MAHA SEVA DAL FOUNDATION*\n*Official Seva Registry · Estd. 1947*\n───────────────────────\n🙏 *Thank You, Jaysurya S!*\n\nYour voluntary contribution to Maha Seva Dal has been successfully received & recorded.\n\n📋 *DONATION INVOICE DETAILS:*\n  • *Receipt No:* MSD-DON-2026-0001\n  • *Donor Name:* Jaysurya S\n  • *Cadre ID:* MSD-IND-2026-0001 (Education & Child Welfare)\n  • *Amount Paid:* ₹1,000\n  • *UTR / Txn ID:* 432109876543\n  • *Date:* 31 Oct 2026\n  • *Cause:* General Community Welfare & Annadanam\n  • *UPI Beneficiary:* mahasevadal@sbi\n\n🌟 *Impact of your Seva:*\nYour noble donation directly funds daily Annadanam, free medical checkup camps, and educational mentorship for children.\n\n\"Service to Humanity is Service to the Nation.\"\n\nOfficial computer-generated receipt.\n🌐 https://mahasevadal.com | support@mahasevadal.com\n───────────────────────",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "demo_2",
    receiptNo: "MSD-DON-2026-0002",
    donorName: "Suresh Kumar",
    mobile: "9876543210",
    amount: 5000,
    utr: "987654321098",
    cause: "Free Health Checkup Camps & Medicine",
    paymentMode: "UPI",
    status: "VERIFIED",
    isMember: false,
    verifiedAt: new Date().toISOString(),
    whatsappMessage:
      "🚩 *MAHA SEVA DAL FOUNDATION*\n*Official Seva Registry · Estd. 1947*\n───────────────────────\n🙏 *Thank You, Suresh Kumar!*\n\nYour voluntary contribution to Maha Seva Dal has been successfully received & recorded.\n\n📋 *DONATION INVOICE DETAILS:*\n  • *Receipt No:* MSD-DON-2026-0002\n  • *Donor Name:* Suresh Kumar\n  • *Amount Paid:* ₹5,000\n  • *UTR / Txn ID:* 987654321098\n  • *Date:* 31 Oct 2026\n  • *Cause:* Free Health Checkup Camps & Medicine\n  • *UPI Beneficiary:* mahasevadal@sbi\n\n🌟 *Impact of your Seva:*\nYour noble donation directly funds daily Annadanam, free medical checkup camps, and educational mentorship for children.\n\n\"Service to Humanity is Service to the Nation.\"\n\nOfficial computer-generated receipt.\n🌐 https://mahasevadal.com | support@mahasevadal.com\n───────────────────────",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DonationsManager: React.FC<DonationsManagerProps> = ({
  token,
  onPendingCountChange,
}) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalAmount: 0,
    verifiedAmount: 0,
    totalCount: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    memberDonationsCount: 0,
    publicDonationsCount: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [copiedReceiptText, setCopiedReceiptText] = useState<boolean>(false);

  // Modals
  const [whatsappModalDonation, setWhatsappModalDonation] = useState<Donation | null>(null);
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [rejectModalDonation, setRejectModalDonation] = useState<Donation | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const fetchDonations = useCallback(
    async (targetPage = page) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: String(targetPage),
          limit: "15",
          status: statusFilter,
        });

        if (search.trim()) {
          queryParams.append("search", search.trim());
        }

        const res = await fetch(getApiUrl(`/api/donations/admin/all?${queryParams.toString()}`), {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-client-channel": "ADMIN",
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError(
              "Backend server needs a restart to load the new '/api/donations' route (HTTP 404). Please stop your backend terminal (Ctrl + C) and run 'npm start' in the backend directory."
            );
            return;
          }
          throw new Error(`Failed to load donations (HTTP ${res.status})`);
        }

        const data = await res.json();
        setDonations(data.donations || []);
        setTotalPages(data.pages || 1);
        setTotalRecords(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
          if (onPendingCountChange) {
            onPendingCountChange(data.stats.pendingCount || 0);
          }
        }
      } catch (err: any) {
        console.error("Donation fetch error:", err);
        setError(err.message || "Unable to fetch donation records.");
      } finally {
        setLoading(false);
      }
    },
    [token, page, statusFilter, search, onPendingCountChange]
  );

  useEffect(() => {
    fetchDonations(1);
    setPage(1);
  }, [statusFilter]);

  // Handle Verify Action
  const handleVerifyDonation = async (donation: Donation) => {
    setActionLoadingId(donation._id);
    setStatusMessage(null);
    try {
      const res = await fetch(getApiUrl(`/api/donations/admin/${donation._id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-client-channel": "ADMIN",
        },
        body: JSON.stringify({
          status: "VERIFIED",
          adminNotes: "Verified via Admin Portal",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to verify donation.");
      }

      const data = await res.json();
      setStatusMessage(`Receipt ${donation.receiptNo} verified successfully! Official WhatsApp invoice generated.`);

      // Update in state
      setDonations((prev) =>
        prev.map((d) => (d._id === donation._id ? data.donation : d))
      );

      // Open WhatsApp modal to review message or send
      setWhatsappModalDonation(data.donation);
      fetchDonations(page);
    } catch (err: any) {
      alert(`Error verifying donation: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Action
  const handleConfirmReject = async () => {
    if (!rejectModalDonation) return;
    setActionLoadingId(rejectModalDonation._id);
    try {
      const res = await fetch(getApiUrl(`/api/donations/admin/${rejectModalDonation._id}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-client-channel": "ADMIN",
        },
        body: JSON.stringify({
          status: "REJECTED",
          adminNotes: rejectReason.trim() || "Payment UTR could not be verified in bank statement.",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to reject donation.");
      }

      const data = await res.json();
      setStatusMessage(`Donation ${rejectModalDonation.receiptNo} marked as REJECTED.`);
      setDonations((prev) =>
        prev.map((d) => (d._id === rejectModalDonation._id ? data.donation : d))
      );
      setRejectModalDonation(null);
      setRejectReason("");
      fetchDonations(page);
    } catch (err: any) {
      alert(`Error rejecting donation: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy UTR helper
  const handleCopyUtr = (utr: string, id: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtrId(id);
    setTimeout(() => setCopiedUtrId(null), 2000);
  };

  // Copy WhatsApp Receipt Text
  const handleCopyReceiptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceiptText(true);
    setTimeout(() => setCopiedReceiptText(false), 2500);
  };

  // Export JSON
  const handleExportJson = () => {
    window.open(getApiUrl(`/api/donations/admin/export-json?token=${encodeURIComponent(token)}`), "_blank");
  };

  return (
    <div className="space-y-4">
      {/* ── Status Alert Banner ── */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Summary KPI Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Verified Seva Fund */}
        <div className="bg-white border border-hairline p-3 sm:p-3.5 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-editorial mb-1">
            <span className="font-bold uppercase tracking-wider">Verified Seva Fund</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee size={13} />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-emerald-700">
            ₹{Number(stats.verifiedAmount || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
            <span>Total Logged: ₹{Number(stats.totalAmount || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs select-none ${
            statusFilter === "PENDING"
              ? "border-amber-500 ring-1.5 ring-amber-400/40 bg-amber-50/70"
              : "border-hairline hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-editorial mb-1">
            <span className="font-bold uppercase tracking-wider">Pending UTRs</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={13} />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-amber-700">
            {stats.pendingCount || 0}
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-1">
            Needs bank matching review
          </div>
        </div>

        {/* Verified Receipts */}
        <div
          onClick={() => setStatusFilter("VERIFIED")}
          className={`bg-white border p-3 sm:p-3.5 rounded-xl shadow-2xs cursor-pointer transition-all hover:shadow-xs select-none ${
            statusFilter === "VERIFIED"
              ? "border-emerald-500 ring-1.5 ring-emerald-400/40 bg-emerald-50/70"
              : "border-hairline hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-muted-editorial mb-1">
            <span className="font-bold uppercase tracking-wider">Verified Invoices</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={13} />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-ink">
            {stats.verifiedCount || 0}
          </div>
          <div className="text-[10px] text-emerald-800 font-medium mt-1">
            WhatsApp receipt dispatched
          </div>
        </div>

        {/* Cadre vs Public Supporter Ratio */}
        <div className="bg-white border border-hairline p-3 sm:p-3.5 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-muted-editorial mb-1">
            <span className="font-bold uppercase tracking-wider">Donor Breakdown</span>
            <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#FF6200] flex items-center justify-center">
              <Coins size={13} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 font-serif text-xl sm:text-2xl font-black text-ink">
            <span>{stats.memberDonationsCount || 0}</span>
            <span className="text-xs text-stone-400 font-sans font-normal">Cadre</span>
            <span className="text-stone-300">/</span>
            <span>{stats.publicDonationsCount || 0}</span>
            <span className="text-xs text-stone-400 font-sans font-normal">Public</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Both registered cadres & supporters
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar ── */}
      <div className="bg-white border border-hairline rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="flex-1 flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchDonations(1);
              }}
              placeholder="Search by Donor Name, Mobile, UTR, or Receipt No..."
              className="w-full text-xs pl-8 pr-3 py-1.5 h-9 rounded-lg border border-hairline bg-surface-soft/60 focus:bg-white focus:border-[#FF6200] focus:ring-1 focus:ring-[#FF6200]/25 outline-none transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchDonations(1)}
            className="text-xs px-3 h-9 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg border border-hairline flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#FF6200] text-white shadow-2xs"
                  : "bg-surface-soft text-stone-600 hover:bg-stone-200/80 border border-hairline"
              }`}
            >
              {st === "ALL" ? "All Donations" : st}
            </button>
          ))}

          <button
            type="button"
            onClick={() => fetchDonations(page)}
            disabled={loading}
            className="text-xs p-2 text-stone-600 hover:text-stone-900 bg-surface-soft hover:bg-stone-200/80 rounded-lg border border-hairline transition-colors cursor-pointer shrink-0"
            title="Refresh donations table"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="text-xs px-2.5 py-1.5 text-stone-700 hover:text-ink bg-surface-soft hover:bg-stone-200/80 rounded-lg border border-hairline font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Export all donations as JSON backup"
          >
            <FileJson size={13} className="text-[#FF6200]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Donations Table ── */}
      <div className="bg-white border border-hairline rounded-xl shadow-2xs overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
            <RefreshCw size={15} className="animate-spin text-[#FF6200]" />
            <span>Loading donation records...</span>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 text-center text-xs text-rose-800 bg-rose-50/70 border-b border-rose-200 space-y-3">
            <AlertCircle size={22} className="mx-auto text-rose-600" />
            <p className="font-bold text-sm text-rose-900">Backend Server Restart Required</p>
            <p className="text-xs text-stone-700 max-w-md mx-auto leading-relaxed">
              Your Node.js backend server was started before the new donation endpoints were registered in <code>server.js</code>. Node keeps routes in memory and does not load new routes until restarted.
            </p>
            <div className="bg-white p-3 rounded-xl border border-rose-200 text-left font-mono text-[11px] max-w-sm mx-auto text-stone-800 shadow-2xs space-y-1">
              <div className="text-stone-500 font-sans text-[10px] font-bold uppercase tracking-wider">In your backend terminal:</div>
              <div className="text-rose-700">1. Press <kbd className="px-1 py-0.5 bg-stone-100 border rounded text-[10px]">Ctrl + C</kbd> to stop</div>
              <div className="text-emerald-700 font-bold">2. Run <span className="underline">npm start</span> (or npm run dev)</div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fetchDonations(1)}
                className="px-3.5 py-1.5 bg-[#FF6200] hover:bg-[#e05600] text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Try Again After Restart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDonations(DEMO_DONATIONS);
                  setStats({
                    totalAmount: 6000,
                    verifiedAmount: 5000,
                    totalCount: 2,
                    pendingCount: 1,
                    verifiedCount: 1,
                    rejectedCount: 0,
                    memberDonationsCount: 1,
                    publicDonationsCount: 1,
                  });
                  if (onPendingCountChange) onPendingCountChange(1);
                  setError(null);
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg border border-stone-300 transition-colors cursor-pointer"
              >
                Load Preview Data
              </button>
            </div>
          </div>
        )}

        {!loading && !error && donations.length === 0 && (
          <div className="p-10 text-center text-stone-500 space-y-2">
            <HeartHandshake size={32} className="mx-auto text-stone-300" />
            <p className="text-sm font-serif font-bold text-ink">No donation records found</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {search
                ? `No donations match "${search}". Try resetting your search filters.`
                : "Voluntary seva contributions submitted via WhatsApp flow or website will appear here in real time."}
            </p>
          </div>
        )}

        {!loading && !error && donations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-soft/80 border-b border-hairline text-stone-500 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Receipt / Date</th>
                  <th className="py-2.5 px-3">Donor & Identity</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Transaction UTR</th>
                  <th className="py-2.5 px-3 text-center">Proof</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {donations.map((d) => {
                  const isPending = d.status === "PENDING";
                  const isVerified = d.status === "VERIFIED";
                  const isRejected = d.status === "REJECTED";

                  return (
                    <tr
                      key={d._id}
                      className="hover:bg-amber-50/20 transition-colors group"
                    >
                      {/* Receipt & Date */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-ink flex items-center gap-1">
                          <FileText size={12} className="text-blue-600 shrink-0" />
                          <span>{d.receiptNo}</span>
                        </div>
                        <div className="text-[10.5px] text-stone-400 font-mono">
                          {new Date(d.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Donor & Mobile */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <span>{d.donorName}</span>
                          {d.isMember && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-orange-100 text-[#FF6200] border border-orange-200"
                              title={`Verified Cadre: ${d.memberRegId} (${d.memberWing})`}
                            >
                              Cadre
                            </span>
                          )}
                          {!d.isMember && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-medium bg-stone-100 text-stone-600 border border-stone-200">
                              Public
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-stone-400" />
                          <span>+91 {d.mobile}</span>
                          {d.memberRegId && (
                            <span className="text-[10px] text-stone-400">· {d.memberRegId}</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3 font-serif font-black text-sm text-emerald-700">
                        ₹{Number(d.amount).toLocaleString("en-IN")}
                      </td>

                      {/* UTR with copy */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            {d.utr}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(d.utr, d._id)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                            title="Copy UTR transaction number"
                          >
                            {copiedUtrId === d._id ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[150px]">
                          {d.cause}
                        </div>
                      </td>

                      {/* Screenshot proof */}
                      <td className="py-2.5 px-3 text-center">
                        {d.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setScreenshotModalUrl(d.screenshotUrl || null)}
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <Eye size={11} />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-mono">UPI Ref</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            Verified
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle size={11} className="text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoadingId === d._id}
                                onClick={() => handleVerifyDonation(d)}
                                className="text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Verify bank payment and generate official WhatsApp receipt"
                              >
                                <Check size={12} />
                                <span>Verify</span>
                              </button>
                              <button
                                type="button"
                                disabled={actionLoadingId === d._id}
                                onClick={() => {
                                  setRejectModalDonation(d);
                                  setRejectReason("");
                                }}
                                className="text-[11px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer"
                                title="Reject invalid UTR"
                              >
                                <X size={12} />
                              </button>
                            </>
                          )}

                          {isVerified && (
                            <button
                              type="button"
                              onClick={() => setWhatsappModalDonation(d)}
                              className="text-[11px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              title="View or send WhatsApp Invoice receipt"
                            >
                              <MessageCircle size={12} className="text-emerald-600" />
                              <span>WhatsApp Receipt</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleVerifyDonation(d)}
                              className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded font-semibold transition-colors"
                              title="Re-verify donation if settled"
                            >
                              Re-verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-3 py-2.5 border-t border-hairline flex items-center justify-between bg-surface-soft/40 text-xs text-stone-500">
            <div>
              Showing page <span className="font-bold text-ink">{page}</span> of{" "}
              <span className="font-bold text-ink">{totalPages}</span> ({totalRecords} records)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                  fetchDonations(p);
                }}
                className="p-1 rounded border border-hairline bg-white hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => {
                  const p = Math.min(totalPages, page + 1);
                  setPage(p);
                  fetchDonations(p);
                }}
                className="p-1 rounded border border-hairline bg-white hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── WHATSAPP RECEIPT MODAL ── */}
      {whatsappModalDonation && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setWhatsappModalDonation(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-3 border-b border-hairline flex items-center justify-between bg-emerald-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink">
                    Official WhatsApp Donation Invoice
                  </h3>
                  <p className="text-[10px] text-emerald-800 font-mono">
                    Receipt #{whatsappModalDonation.receiptNo} · +91 {whatsappModalDonation.mobile}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappModalDonation(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Body Preview */}
            <div className="p-4 sm:p-5 bg-stone-50">
              <div className="text-[11px] text-stone-500 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-[#FF6200]" />
                <span>Exact WhatsApp message delivered to donor:</span>
              </div>
              <div className="bg-[#efeae2] p-3.5 rounded-xl border border-[#d1d7db] shadow-inner font-sans text-xs leading-relaxed text-stone-900 whitespace-pre-wrap select-all">
                {whatsappModalDonation.whatsappMessage}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-hairline flex flex-wrap items-center justify-between gap-2 bg-white">
              <div className="text-[10.5px] text-stone-500">
                Donor: <span className="font-bold text-ink">{whatsappModalDonation.donorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyReceiptText(whatsappModalDonation.whatsappMessage || "")
                  }
                  className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg border border-hairline flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedReceiptText ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://api.whatsapp.com/send?phone=91${whatsappModalDonation.mobile}&text=${encodeURIComponent(
                    whatsappModalDonation.whatsappMessage || ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>Send on WhatsApp</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREENSHOT PROOF ZOOM MODAL ── */}
      {screenshotModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setScreenshotModalUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2 animate-in zoom-in-95">
            <button
              onClick={() => setScreenshotModalUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-black text-white rounded-full z-10 transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={screenshotModalUrl}
              alt="Payment Proof Screenshot"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModalDonation && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModalDonation(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-md w-full p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle size={18} />
              <h3 className="font-serif font-bold text-ink">Reject Donation Record</h3>
            </div>
            <p className="text-xs text-stone-600">
              Rejecting receipt <span className="font-mono font-bold text-ink">{rejectModalDonation.receiptNo}</span> (UTR: {rejectModalDonation.utr}).
            </p>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Reason for Rejection (Notes)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR 432109876543 not found in SBI bank statement, or amount mismatch."
                className="w-full text-xs p-2.5 rounded-lg border border-hairline bg-surface-soft/60 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setRejectModalDonation(null)}
                className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="text-xs px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-2xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsManager;

