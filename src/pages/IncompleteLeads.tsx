import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { getApiUrl } from "@/config/api";
import {
  Users,
  Search,
  Filter,
  Download,
  ArrowLeft,
  RefreshCw,
  Phone,
  MessageSquare,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  Check,
  Loader2,
  CreditCard,
} from "lucide-react";

interface IncompleteLead {
  id: string;
  fullName: string;
  mobile: string;
  channel: "web" | "whatsapp";
  lastStepCompleted: string;
  lastStepLabel: string;
  partialData: {
    wing?: string;
    state?: string;
    district?: string;
    dob?: string;
    gender?: string;
    pincode?: string;
    address?: string;
  };
  abandonedAt: string;
  nudgeCount: number;
  lastNudgedAt?: string | null;
  status: "IN_PROGRESS" | "ABANDONED" | "RECOVERED";
  isCompleted?: boolean;
  registrationId?: string | null;
  memberStatus?: string | null;
}

export default function IncompleteLeads({ embedded = false }: { embedded?: boolean } = {}) {
  const [leads, setLeads] = useState<IncompleteLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<"all" | "web" | "whatsapp">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ABANDONED" | "RECOVERED">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNudging, setIsNudging] = useState(false);

  // Nudge Modal
  const [selectedLead, setSelectedLead] = useState<IncompleteLead | null>(null);
  const [nudgeModalOpen, setNudgeModalOpen] = useState(false);
  const [nudgeSentAlert, setNudgeSentAlert] = useState(false);

  // Data view modal
  const [dataModalLead, setDataModalLead] = useState<IncompleteLead | null>(null);

  // Deletion States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [leadToDelete, setLeadToDelete] = useState<IncompleteLead | null>(null);
  const [bulkLeadDeleteOpen, setBulkLeadDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Load live leads from backend
  const fetchLiveLeads = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(getApiUrl("/api/leads/all"));
      if (!res.ok) {
        setLeads([]);
        return;
      }
      const json = await res.json();
      if (json.leads && Array.isArray(json.leads)) {
        const dbLeads: IncompleteLead[] = json.leads.map((l: any) => ({
          id: l._id || l.id,
          fullName: l.fullName || "Candidate",
          mobile: l.mobile,
          channel: String(l.channel || "web").toLowerCase().includes("whatsapp") ? "whatsapp" : "web",
          lastStepCompleted: l.lastStepCompleted || "INCOMPLETE",
          lastStepLabel: l.lastStepLabel || "Incomplete Registration",
          partialData: l.partialData || {},
          abandonedAt: l.abandonedAt
            ? new Date(l.abandonedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recently",
          nudgeCount: l.nudgeCount || 0,
          lastNudgedAt: l.lastNudgedAt
            ? new Date(l.lastNudgedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          status: l.status || "ABANDONED",
          isCompleted: !!l.isCompleted || l.status === "RECOVERED",
          registrationId: l.registrationId || null,
          memberStatus: l.memberStatus || null,
        }));

        setLeads(dbLeads);
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear any obsolete localStorage mock cache so only real database leads appear
    try {
      localStorage.removeItem("msd_incomplete_leads");
    } catch (e) {}
    fetchLiveLeads();
  }, []);

  // Listen for global Header Refresh clicks from Admin header toolbar
  useEffect(() => {
    const handleAdminRefresh = () => {
      fetchLiveLeads();
    };
    window.addEventListener("msd:admin-refresh", handleAdminRefresh);
    return () => {
      window.removeEventListener("msd:admin-refresh", handleAdminRefresh);
    };
  }, []);

  // Funnel calculations
  const totalLeads = leads.length;
  const webDropoffs = leads.filter((l) => l.channel === "web").length;
  const waDropoffs = leads.filter((l) => l.channel === "whatsapp").length;
  const recoveredCount = leads.filter((l) => l.status === "RECOVERED").length;
  const conversionRate = totalLeads > 0 ? Math.round((recoveredCount / totalLeads) * 100) : 0;

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    if (channelFilter !== "all" && lead.channel !== channelFilter) return false;
    if (statusFilter !== "all" && lead.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.fullName.toLowerCase().includes(q);
      const matchMobile = lead.mobile.includes(q);
      const matchWing = lead.partialData.wing?.toLowerCase().includes(q);
      const matchDist = lead.partialData.district?.toLowerCase().includes(q);
      return matchName || matchMobile || matchWing || matchDist;
    }
    return true;
  });

  // Action: Send Nudge
  const handleSendNudge = (lead: IncompleteLead) => {
    setSelectedLead(lead);
    setNudgeModalOpen(true);
  };

  const confirmDispatchNudge = async () => {
    if (!selectedLead) return;
    setIsNudging(true);

    try {
      await fetch(getApiUrl(`/api/leads/nudge/${selectedLead.id || selectedLead.mobile}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: selectedLead.mobile,
          fullName: selectedLead.fullName,
          channel: selectedLead.channel,
          lastStepLabel: selectedLead.lastStepLabel,
          partialData: selectedLead.partialData,
        }),
      });
    } catch (e) {
      console.warn("Backend nudge dispatch error, updating locally:", e);
    } finally {
      setIsNudging(false);
    }

    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id || l.mobile === selectedLead.mobile
          ? {
              ...l,
              nudgeCount: l.nudgeCount + 1,
              lastNudgedAt: "Just now",
            }
          : l
      )
    );
    setNudgeSentAlert(true);
    setTimeout(() => {
      setNudgeSentAlert(false);
      setNudgeModalOpen(false);
      setSelectedLead(null);
    }, 1500);
  };

  // Action: Export CSV
  const handleExportCsv = () => {
    const headers = ["Mobile", "Full Name", "Channel", "Last Step Left", "Wing", "District", "Status", "Nudges Sent"];
    const rows = filteredLeads.map((l) => [
      l.mobile,
      l.fullName || "Candidate",
      l.channel,
      l.lastStepLabel,
      l.partialData.wing || "-",
      l.partialData.district || "-",
      l.status,
      l.nudgeCount,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `msd_incomplete_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Action: Open Delete Confirmation Modal
  const handleDeleteLead = (lead: IncompleteLead) => {
    setLeadToDelete(lead);
  };

  // Action: Confirm Individual Lead Deletion from MongoDB
  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/leads/${leadToDelete.id}`), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete lead");
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id && l.mobile !== leadToDelete.mobile));
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadToDelete.id));
      setDeleteSuccessMsg(`Lead ${leadToDelete.fullName} (+91 ${leadToDelete.mobile}) permanently removed.`);
      setTimeout(() => setDeleteSuccessMsg(null), 3500);
      setLeadToDelete(null);
    } catch (err: any) {
      alert(`Delete lead error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Action: Confirm Bulk Lead Deletion from MongoDB
  const confirmBulkDeleteLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/leads/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedLeadIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to bulk delete leads");
      setLeads((prev) => prev.filter((l) => !selectedLeadIds.includes(l.id)));
      setDeleteSuccessMsg(`Successfully deleted ${selectedLeadIds.length} lead record(s) from MongoDB.`);
      setTimeout(() => setDeleteSuccessMsg(null), 3500);
      setSelectedLeadIds([]);
      setBulkLeadDeleteOpen(false);
    } catch (err: any) {
      alert(`Bulk delete leads error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const innerContent = (
      <div className={embedded ? "text-stone-800" : "max-w-[1440px] mx-auto px-3 sm:px-6 py-6 text-stone-800"}>
        {/* ─── HEADER & ACTIONS ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              {!embedded && (
                <Link to="/admin" className="text-stone-500 hover:text-stone-800 transition-colors p-1 -ml-1">
                  <ArrowLeft size={18} />
                </Link>
              )}
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-stone-900">
                Incomplete Registrations
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Track candidates who left mid-way on Web & WhatsApp. Send one-click WhatsApp nudges and convert drop-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchLiveLeads}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs text-stone-700 disabled:opacity-50"
              title="Sync latest live leads from database"
            >
              <RefreshCw size={14} className={`text-stone-600 ${isRefreshing ? "animate-spin text-orange-600" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync Live Leads"}</span>
            </button>

            {!embedded && (
              <Link
                to="/admin/flow-simulator"
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Smartphone size={14} className="text-emerald-600" />
                <span>Open Flow Simulator</span>
              </Link>
            )}

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ─── KPI SUMMARY METRICS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Drop-offs</span>
              <Users size={16} className="text-stone-400" />
            </div>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalLeads}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">Tracked across all channels</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
              <span>Web Portal Drops</span>
              <Globe size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">{webDropoffs}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {totalLeads > 0 ? Math.round((webDropoffs / totalLeads) * 100) : 0}% of all drop-offs
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
              <span>WhatsApp Drops</span>
              <Smartphone size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{waDropoffs}</div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              {totalLeads > 0 ? Math.round((waDropoffs / totalLeads) * 100) : 0}% of all drop-offs
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
              <span>Recovery Rate</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{conversionRate}%</div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
              {recoveredCount} successfully recovered
            </div>
          </div>
        </div>

        {/* ─── FILTER & SEARCH BAR ─── */}
        <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by phone, name, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-stone-900 w-60"
              />
            </div>

            {/* Channel Filters */}
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              <button
                onClick={() => setChannelFilter("all")}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  channelFilter === "all" ? "bg-white text-stone-900 shadow-2xs font-bold" : "text-stone-600"
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setChannelFilter("web")}
                className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                  channelFilter === "web" ? "bg-white text-blue-900 shadow-2xs font-bold" : "text-stone-600"
                }`}
              >
                <Globe size={12} />
                <span>Web Portal</span>
              </button>
              <button
                onClick={() => setChannelFilter("whatsapp")}
                className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                  channelFilter === "whatsapp" ? "bg-white text-emerald-900 shadow-2xs font-bold" : "text-stone-600"
                }`}
              >
                <Smartphone size={12} />
                <span>WhatsApp Bot</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-900">{filteredLeads.length}</span> lead(s)
          </div>
        </div>

        {/* Delete Success Alert */}
        {deleteSuccessMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{deleteSuccessMsg}</span>
            </div>
            <button onClick={() => setDeleteSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="mt-3 bg-amber-50/90 border border-amber-300 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold">
                {selectedLeadIds.length}
              </span>
              <span>{selectedLeadIds.length} lead(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkLeadDeleteOpen(true)}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLeadIds([])}
                className="text-xs text-stone-600 hover:text-stone-900 px-2 py-1 font-medium cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* ─── LEADS TABLE ─── */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6ee] text-stone-700 font-bold border-b border-stone-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLeadIds(filteredLeads.map((l) => l.id));
                        else setSelectedLeadIds([]);
                      }}
                      className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Candidate Details</th>
                  <th className="py-3 px-3">Channel</th>
                  <th className="py-3 px-4">Exact Step Left At</th>
                  <th className="py-3 px-3">Captured Data</th>
                  <th className="py-3 px-3">Time Elapsed</th>
                  <th className="py-3 px-3">Nudges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedLeadIds((prev) => [...prev, lead.id]);
                            else setSelectedLeadIds((prev) => prev.filter((id) => id !== lead.id));
                          }}
                          className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                        />
                      </td>

                      {/* Name & Phone */}
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        <div className="text-sm font-bold text-stone-900">{lead.fullName || "Candidate (Unspecified)"}</div>
                        <div className="font-mono text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-stone-400" />
                          <span>+91 {lead.mobile}</span>
                        </div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-3 px-3">
                        {lead.registrationId || String(lead.channel || "").toLowerCase() === "web" || !String(lead.channel || "").toLowerCase().includes("whatsapp") ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
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

                      {/* Step Left / Status */}
                      <td className="py-3 px-4">
                        {lead.isCompleted || lead.status === "RECOVERED" ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-700" />
                              <span>COMPLETED</span>
                            </span>
                            {lead.registrationId && (
                              <div className="font-mono text-[10px] text-emerald-900 font-bold">
                                {lead.registrationId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200 inline-block">
                            {lead.lastStepLabel}
                          </span>
                        )}
                      </td>

                      {/* Partial Info */}
                      <td className="py-3 px-3 text-stone-600">
                        <div className="space-y-0.5">
                          {lead.partialData.wing && (
                            <div className="font-semibold text-orange-700 text-[11px]">
                              {lead.partialData.wing}
                            </div>
                          )}
                          {lead.partialData.district && (
                            <div className="text-stone-500 text-[10px]">
                              {lead.partialData.district}
                            </div>
                          )}
                          {!lead.partialData.wing && !lead.partialData.district && (
                            <span className="text-stone-400 italic text-[11px]">No wing/district</span>
                          )}
                        </div>
                      </td>

                      {/* Elapsed Time */}
                      <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-stone-400" />
                          <span>{lead.abandonedAt}</span>
                        </div>
                      </td>

                      {/* Nudges Count */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {lead.nudgeCount} sent
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.isCompleted || lead.status === "RECOVERED" ? (
                            <Link
                              to={`/register?tab=status&id=${lead.registrationId || lead.mobile}`}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                              title="Instant Digital Cadre ID Card"
                            >
                              <CreditCard size={12} />
                              <span>Get Card</span>
                            </Link>
                          ) : (
                            <>
                              <Link
                                to={`/register?tab=register&resume=true&mobile=${lead.mobile}&name=${encodeURIComponent(
                                  lead.fullName || ""
                                )}&wing=${encodeURIComponent(
                                  lead.partialData.wing || ""
                                )}&state=${encodeURIComponent(
                                  lead.partialData.state || ""
                                )}&district=${encodeURIComponent(
                                  lead.partialData.district || ""
                                )}&dob=${encodeURIComponent(
                                  lead.partialData.dob || ""
                                )}&gender=${encodeURIComponent(
                                  lead.partialData.gender || ""
                                )}&pincode=${encodeURIComponent(
                                  lead.partialData.pincode || ""
                                )}`}
                                className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                                title="Automatically go to Registration Page with Prefilled Details"
                              >
                                <ExternalLink size={12} />
                                <span>Complete</span>
                              </Link>
                              <button
                                onClick={() => handleSendNudge(lead)}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                                title="Send WhatsApp Recovery Message"
                              >
                                <Send size={12} />
                                <span>Nudge</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDataModalLead(lead)}
                            className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-600"
                            title="View Captured Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead)}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 cursor-pointer"
                            title="Delete Lead from MongoDB"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-500">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 text-stone-600">
                          <Loader2 size={18} className="animate-spin text-orange-600" />
                          <span className="font-semibold text-xs">Loading live leads from database...</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-stone-700 text-sm">No incomplete leads tracked yet.</p>
                          <p className="text-xs text-stone-400">
                            When candidates leave mid-way during registration on Web or WhatsApp, they will appear here automatically in real time.
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── MODAL: DISPATCH RECOVERY NUDGE ─── */}
        {nudgeModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-stone-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                  <Smartphone size={16} className="text-emerald-600" />
                  <span>Send WhatsApp Recovery Nudge</span>
                </div>
                <button
                  onClick={() => setNudgeModalOpen(false)}
                  className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
                >
                  <X size={16} />
                </button>
              </div>

              {nudgeSentAlert ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 size={44} className="text-emerald-600 mx-auto animate-bounce" />
                  <div className="font-bold text-stone-900 text-sm">
                    WhatsApp Recovery Message Dispatched!
                  </div>
                  <div className="text-xs text-stone-500">
                    Lead counter updated. Candidate received direct resumption link.
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-3">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs space-y-1">
                    <div>
                      <b>Candidate:</b> {selectedLead.fullName || "Candidate"} (+91 {selectedLead.mobile})
                    </div>
                    <div>
                      <b>Last Step:</b> {selectedLead.lastStepLabel}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Meta-Approved WhatsApp Recovery Template Preview:
                    </label>
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-sans leading-relaxed">
                      "Namaste {selectedLead.fullName || "Volunteer"}, you recently started your cadre registration for Maha Seva Dal ({selectedLead.partialData.wing || "Community Seva"}). Tap the link below to finish your enrollment and receive your official Cadre Identity Card!
                      <br />
                      <span className="text-blue-700 underline font-semibold mt-1 block">
                        https://mahasevadal.com/register?resume={selectedLead.mobile}
                      </span>"
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setNudgeModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDispatchNudge}
                      disabled={isNudging}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {isNudging ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Send Recovery Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MODAL: VIEW CAPTURED DATA ─── */}
        {dataModalLead && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="font-bold text-sm text-stone-900">Captured Partial Payload</div>
                <button
                  onClick={() => setDataModalLead(null)}
                  className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="pt-3 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px]">
                  <div><b>Mobile:</b> {dataModalLead.mobile}</div>
                  <div><b>Channel:</b> {dataModalLead.channel}</div>
                  <div><b>Name:</b> {dataModalLead.fullName || "None"}</div>
                  <div><b>Gender:</b> {dataModalLead.partialData.gender || "None"}</div>
                  <div><b>Wing:</b> {dataModalLead.partialData.wing || "None"}</div>
                  <div><b>State:</b> {dataModalLead.partialData.state || "None"}</div>
                  <div><b>District:</b> {dataModalLead.partialData.district || "None"}</div>
                  <div><b>Nudges:</b> {dataModalLead.nudgeCount}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setDataModalLead(null)}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: DELETE INDIVIDUAL LEAD CONFIRMATION ─── */}
        {leadToDelete && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Delete Incomplete Lead</h3>
                  <p className="text-xs text-rose-600 font-medium">Permanent Deletion from MongoDB</p>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4 text-xs space-y-1 font-mono">
                <div><b>Candidate:</b> {leadToDelete.fullName || "Candidate"}</div>
                <div><b>Mobile:</b> +91 {leadToDelete.mobile}</div>
                <div><b>Channel:</b> {leadToDelete.channel}</div>
                <div><b>Step Left:</b> {leadToDelete.lastStepLabel}</div>
              </div>

              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Are you sure you want to permanently delete this incomplete registration lead? This will remove all captured drop-off details from MongoDB.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadToDelete(null)}
                  disabled={deleteLoading}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteLead}
                  disabled={deleteLoading}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {deleteLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>Permanently Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: BULK DELETE LEADS CONFIRMATION ─── */}
        {bulkLeadDeleteOpen && selectedLeadIds.length > 0 && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-rose-200 animate-scale-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Delete Selected Leads</h3>
                  <p className="text-xs text-rose-600 font-medium">Bulk Deletion ({selectedLeadIds.length} Records)</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4 text-xs text-rose-950">
                <p className="font-bold">⚠️ Permanently delete {selectedLeadIds.length} lead records from MongoDB?</p>
                <p className="text-stone-600 mt-1 leading-relaxed">
                  All partial contact info and drop-off tracking history for these candidates will be permanently removed.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkLeadDeleteOpen(false)}
                  disabled={deleteLoading}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBulkDeleteLeads}
                  disabled={deleteLoading}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {deleteLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>Permanently Delete ({selectedLeadIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );

  if (embedded) return innerContent;
  return <PageLayout hideHeader hideFooter>{innerContent}</PageLayout>;
}

