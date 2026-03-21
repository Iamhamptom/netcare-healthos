"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart, Download, Mail, Loader2, CheckCircle2,
  AlertTriangle, Clock, Calendar, Plus, Trash2, Play,
  FileText, Shield, DollarSign, Users, TrendingDown,
  Building2, X, ChevronDown, RefreshCw, History,
  BarChart3, FileDown,
} from "lucide-react";

/* ─── Types ─── */

interface ReportPreview {
  title: string;
  type: string;
  data: Record<string, unknown>;
  generatedAt: string;
  generatedBy: string;
}

interface ReportSchedule {
  id: string;
  reportType: string;
  reportName: string;
  frequency: string;
  recipients: string[];
  time: string;
  lastSentAt: string | null;
  nextSendAt: string;
  createdBy: string;
  active: boolean;
}

interface ReportHistory {
  id: string;
  reportName: string;
  reportType: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  format: string;
  sizeKb: number;
}

/* ─── Report Definitions ─── */

const REPORT_TYPES = [
  { type: "claims_summary", label: "Claims Summary", description: "Claims processed, rejected, and revenue this month", icon: Shield, color: "from-teal-500 to-emerald-500" },
  { type: "revenue", label: "Revenue Report", description: "MTD/QTD/YTD revenue vs targets across all clinics", icon: DollarSign, color: "from-blue-500 to-indigo-500" },
  { type: "rejection_analysis", label: "Rejection Analysis", description: "Top rejection reasons, patterns, and cost impact", icon: TrendingDown, color: "from-rose-500 to-pink-500" },
  { type: "scheme_performance", label: "Scheme Performance", description: "Medical scheme metrics — volumes, rejection rates, payment days", icon: Building2, color: "from-violet-500 to-purple-500" },
  { type: "team_activity", label: "Team Activity", description: "User actions, audit trail, and productivity metrics", icon: Users, color: "from-amber-500 to-orange-500" },
  { type: "popia_compliance", label: "POPIA Compliance", description: "Consent rates, audit scores, and compliance status", icon: Shield, color: "from-emerald-500 to-green-500" },
];

/* ─── Helpers ─── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatRand(n: number) {
  if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R${(n / 1000).toFixed(0)}K`;
  return `R${n.toLocaleString()}`;
}

/* ─── Component ─── */

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"quick" | "scheduled" | "history">("quick");
  const [generating, setGenerating] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedules
  useEffect(() => {
    if (activeTab === "scheduled") {
      setLoadingSchedules(true);
      fetch("/api/reports/schedule")
        .then(r => r.json())
        .then(d => setSchedules(d.schedules || []))
        .catch(() => setError("Failed to load schedules"))
        .finally(() => setLoadingSchedules(false));
    }
  }, [activeTab]);

  // Fetch history
  useEffect(() => {
    if (activeTab === "history") {
      setLoadingHistory(true);
      fetch("/api/reports/history")
        .then(r => r.json())
        .then(d => setHistory(d.history || []))
        .catch(() => setError("Failed to load history"))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab]);

  const generateReport = useCallback(async (type: string, format: string = "json") => {
    setGenerating(type);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, format, period: "mtd" }),
      });
      if (!res.ok) throw new Error("Generation failed");

      if (format === "csv") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        setPreview(data);
      }
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setGenerating(null);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await fetch(`/api/reports/schedule?id=${id}`, { method: "DELETE" });
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch {
      setError("Failed to delete schedule");
    }
  }, []);

  const tabs = [
    { key: "quick" as const, label: "Quick Reports", icon: Play },
    { key: "scheduled" as const, label: "Scheduled Reports", icon: Calendar },
    { key: "history" as const, label: "Report History", icon: History },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D3443]">Reports Hub</h1>
            <p className="text-sm text-[#1D3443]/50 mt-1">Generate, schedule, and track reports across all operations</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-[#1D3443]/30 bg-[#1D3443]/[0.04] px-2.5 py-1 rounded-full">
              6 report types available
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-black/[0.04] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#1D3443] shadow-sm"
                : "text-[#1D3443]/40 hover:text-[#1D3443]/60"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Quick Reports ─── */}
      {activeTab === "quick" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TYPES.map((report, i) => {
              const Icon = report.icon;
              const isGenerating = generating === report.type;
              return (
                <motion.div
                  key={report.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg shadow-black/10`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[14px] text-[#1D3443]">{report.label}</h3>
                      <p className="text-[11px] text-[#1D3443]/40 mt-0.5 leading-relaxed">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateReport(report.type)}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1D3443] text-white text-[12px] font-medium rounded-lg hover:bg-[#1D3443]/90 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
                      ) : (
                        <><Play className="w-3.5 h-3.5" />Generate</>
                      )}
                    </button>
                    <button
                      onClick={() => generateReport(report.type, "csv")}
                      disabled={!!generating}
                      className="p-2 rounded-lg border border-black/[0.06] text-[#1D3443]/40 hover:text-[#1D3443]/70 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
                      title="Download CSV"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Report Preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl border border-black/[0.04] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h3 className="font-semibold text-[15px] text-[#1D3443]">{preview.title}</h3>
                      <p className="text-[11px] text-[#1D3443]/40">
                        Generated {formatDateTime(preview.generatedAt)} by {preview.generatedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateReport(preview.type, "csv")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-black/[0.06] text-[#1D3443]/60 hover:bg-black/[0.02] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />CSV
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-black/[0.06] text-[#1D3443]/60 hover:bg-black/[0.02] transition-colors">
                      <Mail className="w-3.5 h-3.5" />Email
                    </button>
                    <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg text-[#1D3443]/30 hover:text-[#1D3443]/60 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview Data */}
                <div className="bg-[#f8f9fa] rounded-xl p-4 max-h-[400px] overflow-y-auto">
                  <ReportDataView data={preview.data} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── Scheduled Reports ─── */}
      {activeTab === "scheduled" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-[#1D3443]/50">{schedules.length} scheduled report{schedules.length !== 1 ? "s" : ""}</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1D3443] text-white text-[12px] font-medium rounded-lg hover:bg-[#1D3443]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />Create Schedule
            </button>
          </div>

          {loadingSchedules ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-black/[0.04]" />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center">
              <Calendar className="w-10 h-10 text-[#1D3443]/15 mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[#1D3443]/40">No scheduled reports</p>
              <p className="text-[12px] text-[#1D3443]/25 mt-1">Create a schedule to automate report generation</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Report</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Frequency</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Recipients</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Last Sent</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Next Send</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(schedule => (
                    <tr key={schedule.id} className="border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-medium text-[#1D3443]">{schedule.reportName}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          schedule.frequency === "daily" ? "bg-blue-50 text-blue-600" :
                          schedule.frequency === "weekly" ? "bg-violet-50 text-violet-600" :
                          "bg-amber-50 text-amber-600"
                        }`}>
                          {schedule.frequency} at {schedule.time}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-[#1D3443]/50">{schedule.recipients.length} recipient{schedule.recipients.length !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-[#1D3443]/40">{schedule.lastSentAt ? formatDate(schedule.lastSentAt) : "Never"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-[#1D3443]/40">{formatDate(schedule.nextSendAt)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="p-1.5 rounded-lg text-[#1D3443]/20 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Report History ─── */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-black/[0.04]" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.04] p-12 text-center">
              <History className="w-10 h-10 text-[#1D3443]/15 mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[#1D3443]/40">No report history</p>
              <p className="text-[12px] text-[#1D3443]/25 mt-1">Generated reports will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04]">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Report</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Period</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Generated</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">By</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Format</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#1D3443]/40 uppercase tracking-wider">Size</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {history.map(entry => (
                    <tr key={entry.id} className="border-b border-black/[0.02] hover:bg-black/[0.01] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1D3443]/20" />
                          <span className="text-[13px] font-medium text-[#1D3443]">{entry.reportName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1D3443]/[0.04] text-[#1D3443]/50 uppercase">{entry.period}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#1D3443]/40">{formatDate(entry.generatedAt)}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#1D3443]/40">{entry.generatedBy}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          entry.format === "csv" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        }`}>
                          {entry.format}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#1D3443]/30">{entry.sizeKb} KB</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => generateReport(entry.reportType, entry.format)}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-black/[0.06] text-[#1D3443]/50 hover:bg-black/[0.02] transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />Re-generate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Schedule Modal ─── */}
      <AnimatePresence>
        {showScheduleModal && (
          <ScheduleModal
            onClose={() => setShowScheduleModal(false)}
            onCreated={(s) => { setSchedules(prev => [...prev, s]); setShowScheduleModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Report Data Viewer ─── */

function ReportDataView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
          const items = value as Record<string, unknown>[];
          const headers = Object.keys(items[0]);
          return (
            <div key={key}>
              <h4 className="text-[11px] font-semibold text-[#1D3443]/50 uppercase tracking-wider mb-2">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="text-left px-3 py-1.5 text-[10px] font-semibold text-[#1D3443]/30 uppercase">
                          {h.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 10).map((item, i) => (
                      <tr key={i} className="border-t border-black/[0.03]">
                        {headers.map(h => (
                          <td key={h} className="px-3 py-1.5 text-[#1D3443]/60">
                            {typeof item[h] === "number"
                              ? (item[h] as number) > 10000
                                ? formatRand(item[h] as number)
                                : String(item[h])
                              : String(item[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          return (
            <div key={key}>
              <h4 className="text-[11px] font-semibold text-[#1D3443]/50 uppercase tracking-wider mb-1">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="bg-white rounded-lg px-3 py-2">
                    <p className="text-[10px] text-[#1D3443]/30">{k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</p>
                    <p className="text-[14px] font-semibold text-[#1D3443]">
                      {typeof v === "number" ? (v > 10000 ? formatRand(v) : v.toLocaleString()) : String(v)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
            <span className="text-[11px] text-[#1D3443]/40">{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</span>
            <span className="text-[13px] font-medium text-[#1D3443]">
              {typeof value === "number" ? (value > 10000 ? formatRand(value) : value.toLocaleString()) : String(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Schedule Modal ─── */

function ScheduleModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: ReportSchedule) => void }) {
  const [formData, setFormData] = useState({
    reportType: "claims_summary",
    frequency: "daily",
    time: "07:00",
    recipients: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const recipientList = formData.recipients.split(",").map(r => r.trim()).filter(Boolean);
      if (recipientList.length === 0) return;

      const reportDef = REPORT_TYPES.find(r => r.type === formData.reportType);
      const res = await fetch("/api/reports/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: formData.reportType,
          reportName: reportDef?.label || formData.reportType,
          frequency: formData.frequency,
          recipients: recipientList,
          time: formData.time,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const { schedule } = await res.json();
      onCreated(schedule);
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Generate Report"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-[#1D3443]">Create Report Schedule</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#1D3443]/30 hover:text-[#1D3443]/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#1D3443]/60 block mb-1">Report Type</label>
            <select
              value={formData.reportType}
              onChange={e => setFormData(p => ({ ...p, reportType: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D3443]/10"
            >
              {REPORT_TYPES.map(r => (
                <option key={r.type} value={r.type}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#1D3443]/60 block mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D3443]/10"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#1D3443]/60 block mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D3443]/10"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#1D3443]/60 block mb-1">Recipients (comma-separated emails)</label>
            <input
              type="text"
              value={formData.recipients}
              onChange={e => setFormData(p => ({ ...p, recipients: e.target.value }))}
              placeholder="ops@netcare.co.za, finance@netcare.co.za"
              className="w-full px-3 py-2 rounded-lg border border-black/[0.08] text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D3443]/10"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-[13px] font-medium rounded-lg border border-black/[0.08] text-[#1D3443]/50 hover:bg-black/[0.02] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.recipients.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1D3443] text-white text-[13px] font-medium rounded-lg hover:bg-[#1D3443]/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Schedule
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
