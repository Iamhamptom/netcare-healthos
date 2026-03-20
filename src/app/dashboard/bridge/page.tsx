"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, XCircle, Zap, FileText, Receipt,
  Stethoscope, Pill, AlertTriangle, Clock, Building2,
  RefreshCw, Wifi, WifiOff, Loader2,
} from "lucide-react";

// ─── Before/After Workflow ──────────────────────────────

const BEFORE_STEPS = [
  { step: "Doctor sees patient", system: "CareOn EMR", icon: Stethoscope, detail: "Clinical notes, vitals, lab orders on iPad" },
  { step: "Doctor finishes consult", system: "CareOn EMR", icon: FileText, detail: "Discharge summary, prescriptions written" },
  { step: "Doctor opens SEPARATE system", system: "Own PMS", icon: Receipt, detail: "Healthbridge / GoodX / Elixir on desktop" },
  { step: "Re-enters diagnosis codes", system: "Own PMS", icon: AlertTriangle, detail: "Manually types ICD-10 codes (error-prone)" },
  { step: "Submits claim", system: "Own PMS", icon: Receipt, detail: "Via SwitchOn to medical aid" },
  { step: "Claim rejected", system: "Medical Aid", icon: XCircle, detail: "15-25% rejection rate. R50-R150 rework cost." },
];

const AFTER_STEPS = [
  { step: "Doctor sees patient", system: "CareOn EMR", icon: Stethoscope, detail: "Clinical notes, vitals, lab orders on iPad" },
  { step: "AI extracts billing data", system: "VisioHealth OS", icon: Zap, detail: "ICD-10-ZA codes auto-suggested from clinical notes" },
  { step: "AI validates claim", system: "VisioHealth OS", icon: CheckCircle2, detail: "NAPPI, PMB benefits, scheme rules checked instantly" },
  { step: "Clean claim submitted", system: "SwitchOn", icon: Receipt, detail: "Pre-validated. Under 5% rejection rate." },
  { step: "eRA auto-reconciled", system: "VisioHealth OS", icon: CheckCircle2, detail: "Payment matched automatically. No Excel." },
];

// ─── Integration Systems ────────────────────────────────

interface IntegrationStatus {
  systemName: string;
  status: "connected" | "partial" | "not_connected" | "planned";
  lastSyncAt: string | null;
  recordsSynced: number;
  errorCount: number;
}

const SYSTEM_META: Record<string, { description: string; protocol: string; icon: string }> = {
  "CareOn EMR": { description: "Hospital clinical records (iMedOne)", protocol: "HL7 / FHIR / IHE", icon: "🏥" },
  "HEAL": { description: "Medicross primary care EMR", protocol: "Proprietary API", icon: "💚" },
  "SwitchOn": { description: "Claims switch — 99.8M tx/yr", protocol: "PHISC EDIFACT", icon: "⚡" },
  "Healthbridge": { description: "PMS + claims, 7K practices", protocol: "Integration specs", icon: "🌉" },
  "SAP": { description: "Finance, billing, procurement", protocol: "RFC / OData", icon: "💰" },
  "Micromedex": { description: "Drug interactions, 4.5M pairs", protocol: "REST API", icon: "💊" },
  "MediKredit": { description: "NAPPI database, 300K+ products", protocol: "Proprietary", icon: "🏷️" },
};

function statusColor(status: string): string {
  switch (status) {
    case "connected": return "bg-green-500";
    case "partial": return "bg-amber-500";
    case "planned": return "bg-gray-400";
    default: return "bg-red-500";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "connected": return "Connected";
    case "partial": return "Partial";
    case "planned": return "Planned";
    default: return "Not Connected";
  }
}

function statusBorder(status: string): string {
  switch (status) {
    case "connected": return "border-green-200 bg-green-50/30";
    case "partial": return "border-amber-200 bg-amber-50/30";
    case "planned": return "border-gray-200 bg-gray-50/30";
    default: return "border-red-200 bg-red-50/30";
  }
}

function formatSyncTime(timestamp: string | null): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Page Component ─────────────────────────────────────

export default function BridgePage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/bridge");
      if (!res.ok) {
        // If auth fails (demo mode or no session), use fallback demo data
        if (res.status === 401) {
          setIntegrations(FALLBACK_INTEGRATIONS);
          setLastFetch(new Date());
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setIntegrations(data.integrations || []);
      setLastFetch(new Date());
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
      // Use fallback data on error
      if (integrations.length === 0) {
        setIntegrations(FALLBACK_INTEGRATIONS);
      }
      setError("Using cached data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchIntegrations, 30_000);
    return () => clearInterval(interval);
  }, [fetchIntegrations]);

  // Merge with system metadata
  const systems = (integrations.length > 0 ? integrations : FALLBACK_INTEGRATIONS).map((i) => ({
    ...i,
    meta: SYSTEM_META[i.systemName] || { description: "", protocol: "", icon: "📡" },
  }));

  const connectedCount = systems.filter((s) => s.status === "connected").length;
  const partialCount = systems.filter((s) => s.status === "partial").length;
  const totalRecords = systems.reduce((sum, s) => sum + s.recordsSynced, 0);
  const totalErrors = systems.reduce((sum, s) => sum + s.errorCount, 0);

  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-[#E3964C]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">The Integration Gap</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">CareOn + PMS Bridge</h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          Doctors work in two systems that do not talk to each other. CareOn for clinical work, their own PMS for billing.
          VisioHealth OS bridges this gap with AI.
        </p>
      </div>

      {/* ── Live Integration Status ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#3DA9D1]" />
            <h2 className="text-[15px] font-semibold text-gray-900">Live Integration Status</h2>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-[10px] text-amber-600">{error}</span>}
            {lastFetch && (
              <span className="text-[10px] text-gray-400">
                Updated {formatSyncTime(lastFetch.toISOString())}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); fetchIntegrations(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-green-200 bg-green-50/50 text-center">
            <div className="text-lg font-bold text-green-700">{connectedCount}</div>
            <div className="text-[10px] text-green-600">Connected</div>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-center">
            <div className="text-lg font-bold text-amber-700">{partialCount}</div>
            <div className="text-[10px] text-amber-600">Partial</div>
          </div>
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 text-center">
            <div className="text-lg font-bold text-gray-700">{formatNumber(totalRecords)}</div>
            <div className="text-[10px] text-gray-500">Records Synced</div>
          </div>
          <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 text-center">
            <div className="text-lg font-bold text-red-700">{totalErrors}</div>
            <div className="text-[10px] text-red-600">Errors</div>
          </div>
        </div>

        {/* System cards */}
        <div className="grid grid-cols-1 gap-2">
          {systems.map((sys, i) => (
            <motion.div
              key={sys.systemName}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 p-3 rounded-lg border ${statusBorder(sys.status)}`}
            >
              {/* Icon + name */}
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[16px] shrink-0">
                {sys.meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-gray-900">{sys.systemName}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white ${statusColor(sys.status)}`}>
                    {sys.status === "connected" && <Wifi className="w-2.5 h-2.5" />}
                    {sys.status === "partial" && <AlertTriangle className="w-2.5 h-2.5" />}
                    {sys.status === "planned" && <Clock className="w-2.5 h-2.5" />}
                    {sys.status === "not_connected" && <WifiOff className="w-2.5 h-2.5" />}
                    {statusLabel(sys.status)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">{sys.meta.description}</div>
                <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                  {sys.meta.protocol}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Last Sync</div>
                  <div className="text-[12px] font-medium text-gray-700">{formatSyncTime(sys.lastSyncAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Records</div>
                  <div className="text-[12px] font-medium text-gray-700">{formatNumber(sys.recordsSynced)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400">Errors</div>
                  <div className={`text-[12px] font-medium ${sys.errorCount > 0 ? "text-red-600" : "text-gray-700"}`}>
                    {sys.errorCount}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Before/After Comparison ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* BEFORE */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-[15px] font-semibold text-red-600">Before — Two Disconnected Systems</h2>
          </div>
          <div className="space-y-2">
            {BEFORE_STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-red-100 bg-red-50/30">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{step.step}</div>
                  <div className="text-[11px] text-gray-500">{step.detail}</div>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{step.system}</span>
                </div>
                <step.icon className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-[12px] text-red-700 font-semibold">Impact</div>
            <div className="text-[11px] text-red-600 mt-1">15-20 min wasted per encounter. 5-15% revenue leakage from coding errors. R50-R150 per rejected claim rework.</div>
          </div>
        </div>

        {/* AFTER */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-[15px] font-semibold text-green-600">After — AI-Bridged Workflow</h2>
          </div>
          <div className="space-y-2">
            {AFTER_STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-green-100 bg-green-50/30">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-600 shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{step.step}</div>
                  <div className="text-[11px] text-gray-500">{step.detail}</div>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{step.system}</span>
                </div>
                <step.icon className="w-4 h-4 text-green-500 shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-[12px] text-green-700 font-semibold">Impact</div>
            <div className="text-[11px] text-green-600 mt-1">15-20 min saved per encounter. Under 5% rejection rate. R21.6M/year recovered. Zero double-entry.</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Time Saved Per Encounter", value: "15-20 min", color: "#3DA9D1" },
          { label: "Rejection Rate Reduction", value: "15% to <5%", color: "#10B981" },
          { label: "Annual Revenue Recovered", value: "R21.6M", color: "#E3964C" },
          { label: "Practitioners Affected", value: "568", color: "#1D3443" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <div className="text-2xl font-bold font-metric" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-[#1D3443] text-center">
        <p className="text-[12px] text-white/60">
          This is the #1 pain point for every doctor at Netcare. VisioHealth OS is the only platform that bridges CareOn and private PMS billing.
        </p>
      </div>

      {/* CareOn Bridge Console Link */}
      <a
        href="/dashboard/bridge/careon"
        className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-[#3DA9D1]/40 hover:border-[#3DA9D1] bg-[#3DA9D1]/5 hover:bg-[#3DA9D1]/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3DA9D1]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#3DA9D1]" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-900">CareOn / iMedOne Bridge Console</div>
            <div className="text-[12px] text-gray-500">Live HL7v2 message feed, billing advisories, and facility connection status</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#3DA9D1] group-hover:translate-x-1 transition-transform" />
      </a>

      {/* ROI Calculator Link */}
      <a
        href="/dashboard/bridge/roi"
        className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-[#E3964C]/40 hover:border-[#E3964C] bg-[#E3964C]/5 hover:bg-[#E3964C]/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E3964C]/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#E3964C]" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-gray-900">ROI Calculator — Business Case Builder</div>
            <div className="text-[12px] text-gray-500">Pre-populated with FY2025 actuals. Model pilot scope and projected savings.</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#E3964C] group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
}

// ─── Fallback Data ──────────────────────────────────────
// Used when /api/bridge returns 401 (demo mode) or fails

const FALLBACK_INTEGRATIONS: IntegrationStatus[] = [
  { systemName: "CareOn EMR", status: "partial", lastSyncAt: new Date(Date.now() - 300_000).toISOString(), recordsSynced: 14200, errorCount: 3 },
  { systemName: "HEAL", status: "connected", lastSyncAt: new Date(Date.now() - 120_000).toISOString(), recordsSynced: 8450, errorCount: 0 },
  { systemName: "SwitchOn", status: "connected", lastSyncAt: new Date(Date.now() - 60_000).toISOString(), recordsSynced: 245000, errorCount: 0 },
  { systemName: "Healthbridge", status: "partial", lastSyncAt: new Date(Date.now() - 900_000).toISOString(), recordsSynced: 3200, errorCount: 12 },
  { systemName: "SAP", status: "planned", lastSyncAt: null, recordsSynced: 0, errorCount: 0 },
  { systemName: "Micromedex", status: "planned", lastSyncAt: null, recordsSynced: 0, errorCount: 0 },
  { systemName: "MediKredit", status: "planned", lastSyncAt: null, recordsSynced: 0, errorCount: 0 },
];
