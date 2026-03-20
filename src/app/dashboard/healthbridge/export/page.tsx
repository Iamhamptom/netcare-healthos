"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, Loader2, FileText, Calendar, Filter, CheckCircle2, AlertCircle,
} from "lucide-react";

const SCHEMES = [
  "", "Discovery Health", "GEMS", "Bonitas", "Medihelp",
  "Momentum Health", "Bestmed", "Fedhealth", "CompCare", "Sizwe Hosmed",
];

const STATUSES = [
  "", "draft", "submitted", "accepted", "rejected",
  "partial", "pending_payment", "paid", "short_paid", "reversed", "resubmitted",
];

const STATUS_LABELS: Record<string, string> = {
  "": "All Statuses",
  draft: "Draft",
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
  partial: "Partial",
  pending_payment: "Awaiting Payment",
  paid: "Paid",
  short_paid: "Short Paid",
  reversed: "Reversed",
  resubmitted: "Resubmitted",
};

export default function ExportDataPage() {
  const [period, setPeriod] = useState("all");
  const [status, setStatus] = useState("");
  const [scheme, setScheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const params = new URLSearchParams({ format: "csv", period });
      if (status) params.set("status", status);
      if (scheme) params.set("scheme", scheme);

      const res = await fetch(`/api/healthbridge/export?${params}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Export failed" }));
        setError(data.error || "Export failed");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      a.download = filenameMatch ? filenameMatch[1] : `claims-export-${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Export downloaded: ${a.download}`);
    } catch {
      setError("Export failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Download className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">Export Claims Data</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">CSV Download</span>
        </div>

        {/* Filters */}
        <div className="rounded-xl glass-panel p-5 space-y-5">
          <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Export Filters</div>

          <div className="grid grid-cols-3 gap-4">
            {/* Period */}
            <div className="space-y-2">
              <label className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date Range
              </label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-glass w-full text-[13px]">
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Claim Status
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-glass w-full text-[13px]">
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
              </select>
            </div>

            {/* Scheme */}
            <div className="space-y-2">
              <label className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Medical Aid Scheme
              </label>
              <select value={scheme} onChange={(e) => setScheme(e.target.value)} className="input-glass w-full text-[13px]">
                <option value="">All Schemes</option>
                {SCHEMES.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Export Info */}
          <div className="rounded-lg p-3 bg-white/[0.02] border border-[var(--border)]">
            <div className="text-[11px] text-[var(--text-tertiary)] space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3" />
                <span>CSV format with columns: Date, Patient, Scheme, Membership, ICD10, CPT, Description, Amount, Approved, Paid, Status, Reference</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-3 h-3" />
                <span>One row per line item — claims with multiple procedures appear as multiple rows</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button onClick={handleExport} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-[var(--gold)] rounded-lg text-[14px] font-medium text-[var(--obsidian)] disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? "Exporting..." : "Download CSV Export"}
          </button>
        </div>

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[13px] text-emerald-400 font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Tips */}
        <div className="rounded-xl glass-panel p-5">
          <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-3">Export Tips</div>
          <div className="grid grid-cols-2 gap-4 text-[12px] text-[var(--text-tertiary)]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Use &ldquo;This Month&rdquo; exports for monthly reconciliation with your accounting software</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Filter by &ldquo;Rejected&rdquo; status to review all rejected claims for resubmission</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>Export per-scheme data for medical aid reconciliation and audit trails</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>CSV files can be opened in Excel, Google Sheets, or imported into any accounting system</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
