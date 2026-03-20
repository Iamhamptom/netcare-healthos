"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Send, Search, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, XCircle, Clock, ArrowRight,
  Activity, RefreshCw, Building2, Zap, Network, Router,
  FileText, BarChart3, Upload, Layers, Users, BadgeCheck,
  ArrowUpDown, Inbox, AlertTriangle, TrendingUp, CircleDot,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface SwitchStatus {
  provider: string;
  configured: boolean;
  healthy: boolean;
  latencyMs: number;
  errorRate: number;
  schemes: string[];
}

interface PreAuthItem {
  id: string;
  patientName: string;
  scheme: string;
  status: string;
  urgency: string;
  estimatedCost: number;
  requestedAt: string;
}

interface BatchItem {
  id: string;
  status: string;
  totalClaims: number;
  successfulClaims: number;
  failedClaims: number;
  completedAt: string | null;
}

interface ERAItem {
  remittanceRef: string;
  scheme: string;
  totalPaid: number;
  reconciliationStatus: string;
  receivedAt: string;
}

type TabId = "overview" | "preauth" | "batch" | "era" | "vendors";

// ─── Component ───────────────────────────────────────────────────

export default function SwitchingDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [switches, setSwitches] = useState<SwitchStatus[]>([]);
  const [preAuths, setPreAuths] = useState<PreAuthItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [eras, setEras] = useState<ERAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimsToday, setClaimsToday] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/switching/route");
      if (res.ok) {
        const data = await res.json();
        setSwitches(data.switches || []);
        const configured = (data.switches || []).filter((s: SwitchStatus) => s.configured);
        setAvgLatency(configured.length > 0 ? Math.round(configured.reduce((s: number, sw: SwitchStatus) => s + sw.latencyMs, 0) / configured.length) : 0);
      }
    } catch { /* silent */ }

    // Demo stats
    setClaimsToday(Math.floor(Math.random() * 80) + 40);
    setAcceptanceRate(Math.floor(Math.random() * 8) + 88);
    setTotalPending(Math.floor(Math.random() * 12) + 3);

    // Demo pre-auths
    setPreAuths([
      { id: "PA-001", patientName: "John Mokoena", scheme: "Discovery Health", status: "approved", urgency: "elective", estimatedCost: 350000, requestedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "PA-002", patientName: "Priya Naidoo", scheme: "GEMS", status: "pending", urgency: "urgent", estimatedCost: 1200000, requestedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "PA-003", patientName: "Sarah van der Merwe", scheme: "Bonitas", status: "denied", urgency: "elective", estimatedCost: 85000, requestedAt: new Date(Date.now() - 172800000).toISOString() },
      { id: "PA-004", patientName: "Thabo Dlamini", scheme: "Momentum Health", status: "approved", urgency: "emergency", estimatedCost: 450000, requestedAt: new Date(Date.now() - 7200000).toISOString() },
    ]);

    setBatches([
      { id: "BATCH-001", status: "completed", totalClaims: 47, successfulClaims: 44, failedClaims: 3, completedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "BATCH-002", status: "processing", totalClaims: 23, successfulClaims: 15, failedClaims: 0, completedAt: null },
      { id: "BATCH-003", status: "completed", totalClaims: 89, successfulClaims: 86, failedClaims: 3, completedAt: new Date(Date.now() - 86400000).toISOString() },
    ]);

    setEras([
      { remittanceRef: "ERA-DH-20260320", scheme: "Discovery Health", totalPaid: 14500000, reconciliationStatus: "matched", receivedAt: new Date().toISOString() },
      { remittanceRef: "ERA-GEM-20260319", scheme: "GEMS", totalPaid: 8200000, reconciliationStatus: "partial", receivedAt: new Date(Date.now() - 86400000).toISOString() },
      { remittanceRef: "ERA-BON-20260318", scheme: "Bonitas", totalPaid: 5600000, reconciliationStatus: "pending", receivedAt: new Date(Date.now() - 172800000).toISOString() },
    ]);

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const fmtZAR = (cents: number) => `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const fmtTime = (iso: string) => new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      approved: "text-emerald-400", accepted: "text-emerald-400", matched: "text-emerald-400", completed: "text-emerald-400", accredited: "text-emerald-400",
      pending: "text-amber-400", processing: "text-amber-400", partial: "text-amber-400", testing: "text-amber-400",
      denied: "text-red-400", rejected: "text-red-400", failed: "text-red-400", unmatched: "text-red-400",
    };
    return map[s] || "text-zinc-400";
  };

  const statusIcon = (s: string) => {
    if (["approved", "accepted", "matched", "completed", "accredited"].includes(s)) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (["pending", "processing", "partial", "testing"].includes(s)) return <Clock className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Switch Status", icon: <Router className="w-4 h-4" /> },
    { id: "preauth", label: "Pre-Authorizations", icon: <Shield className="w-4 h-4" />, count: preAuths.filter(p => p.status === "pending").length },
    { id: "batch", label: "Batch Jobs", icon: <Layers className="w-4 h-4" />, count: batches.filter(b => b.status === "processing").length },
    { id: "era", label: "Remittance (eRA)", icon: <Inbox className="w-4 h-4" />, count: eras.filter(e => e.reconciliationStatus === "pending").length },
    { id: "vendors", label: "PMS Vendors", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Network className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Medical Aid Switching Engine</h1>
                <p className="text-xs text-zinc-500">PHISC MEDCLM v0:912:ZA — Multi-Switch Router</p>
              </div>
            </div>
            <button onClick={loadData} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Claims Today", value: String(claimsToday), icon: <Send className="w-4 h-4" />, color: "text-blue-400" },
            { label: "Acceptance Rate", value: `${acceptanceRate}%`, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400" },
            { label: "Avg Latency", value: `${avgLatency || "<1"}ms`, icon: <Zap className="w-4 h-4" />, color: "text-amber-400" },
            { label: "Pending Claims", value: String(totalPending), icon: <Clock className="w-4 h-4" />, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count ? (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">{tab.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Connected Switches</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {(switches.length > 0 ? switches : [
                    { provider: "healthbridge", configured: true, healthy: true, latencyMs: 0, errorRate: 0, schemes: ["Discovery Health", "Bonitas", "Medihelp", "Anglo Medical", "Bankmed", "LA Health"] },
                    { provider: "medikredit", configured: false, healthy: false, latencyMs: 0, errorRate: 0, schemes: ["CompCare", "Medshield", "PPS Healthcare", "Profmed", "KeyHealth"] },
                    { provider: "switchon", configured: false, healthy: false, latencyMs: 0, errorRate: 0, schemes: ["GEMS", "Momentum", "Bestmed", "Fedhealth", "Sizwe Hosmed", "Polmed", "Liberty"] },
                  ]).map((sw) => (
                    <div key={sw.provider} className={`bg-zinc-900 border rounded-xl p-5 ${sw.configured ? "border-emerald-500/30" : "border-zinc-800"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CircleDot className={`w-3 h-3 ${sw.configured ? (sw.healthy ? "text-emerald-400" : "text-red-400") : "text-zinc-600"}`} />
                          <h3 className="font-semibold capitalize">{sw.provider === "switchon" ? "SwitchOn (Altron)" : sw.provider === "medikredit" ? "MediKredit" : "Healthbridge"}</h3>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sw.configured ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                          {sw.configured ? "Connected" : "Sandbox"}
                        </span>
                      </div>
                      {sw.configured && (
                        <div className="flex gap-4 text-xs text-zinc-500 mb-3">
                          <span>Latency: <span className="text-zinc-300 font-mono">{sw.latencyMs}ms</span></span>
                          <span>Errors: <span className="text-zinc-300 font-mono">{(sw.errorRate * 100).toFixed(1)}%</span></span>
                        </div>
                      )}
                      <div className="mt-2">
                        <p className="text-xs text-zinc-500 mb-1">Routes {sw.schemes.length} schemes:</p>
                        <div className="flex flex-wrap gap-1">
                          {sw.schemes.slice(0, 5).map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{s}</span>
                          ))}
                          {sw.schemes.length > 5 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">+{sw.schemes.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Protocol Support */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Protocol Support</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { name: "EDIFACT MEDCLM", version: "v0:912:ZA", status: "Full", icon: <FileText className="w-4 h-4" />, desc: "PHISC standard — generate, parse, validate" },
                      { name: "XML/XSD Claims", version: "v2.0", status: "Full", icon: <FileText className="w-4 h-4" />, desc: "MediKredit/Healthbridge XML protocol" },
                      { name: "eRA Reconciliation", version: "v1.0", status: "Full", icon: <ArrowUpDown className="w-4 h-4" />, desc: "Parse, match, dispute, auto-reconcile" },
                    ].map((p) => (
                      <div key={p.name} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
                        <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">{p.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className="text-xs text-zinc-500 font-mono">{p.version}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
                          <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preauth" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Pre-Authorization Requests</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                    + New Request
                  </button>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-800/50">
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Patient</th>
                        <th className="text-left px-4 py-3">Scheme</th>
                        <th className="text-left px-4 py-3">Urgency</th>
                        <th className="text-right px-4 py-3">Est. Cost</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Requested</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preAuths.map((pa) => (
                        <tr key={pa.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{pa.patientName}</td>
                          <td className="px-4 py-3 text-zinc-400">{pa.scheme}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              pa.urgency === "emergency" ? "bg-red-500/10 text-red-400" :
                              pa.urgency === "urgent" ? "bg-amber-500/10 text-amber-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>{pa.urgency}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-300">{fmtZAR(pa.estimatedCost)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(pa.status)}
                              <span className={`capitalize ${statusColor(pa.status)}`}>{pa.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{fmtTime(pa.requestedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "batch" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Batch Processing Jobs</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                    + Submit Batch
                  </button>
                </div>
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div key={batch.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-zinc-400">{batch.id}</span>
                          <div className="flex items-center gap-1.5">
                            {statusIcon(batch.status)}
                            <span className={`text-sm capitalize ${statusColor(batch.status)}`}>{batch.status}</span>
                          </div>
                        </div>
                        {batch.completedAt && <span className="text-xs text-zinc-500">{fmtTime(batch.completedAt)}</span>}
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span className="text-zinc-500">Total: <span className="text-zinc-300 font-mono">{batch.totalClaims}</span></span>
                        <span className="text-zinc-500">Accepted: <span className="text-emerald-400 font-mono">{batch.successfulClaims}</span></span>
                        <span className="text-zinc-500">Failed: <span className={`font-mono ${batch.failedClaims > 0 ? "text-red-400" : "text-zinc-400"}`}>{batch.failedClaims}</span></span>
                        <span className="text-zinc-500">Rate: <span className="text-zinc-300 font-mono">{batch.totalClaims > 0 ? Math.round((batch.successfulClaims / batch.totalClaims) * 100) : 0}%</span></span>
                      </div>
                      {batch.status === "processing" && (
                        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${batch.totalClaims > 0 ? (batch.successfulClaims / batch.totalClaims) * 100 : 0}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "era" && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Electronic Remittance Advice (eRA)</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-800/50">
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Reference</th>
                        <th className="text-left px-4 py-3">Scheme</th>
                        <th className="text-right px-4 py-3">Total Paid</th>
                        <th className="text-left px-4 py-3">Reconciliation</th>
                        <th className="text-left px-4 py-3">Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eras.map((era) => (
                        <tr key={era.remittanceRef} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono text-zinc-300">{era.remittanceRef}</td>
                          <td className="px-4 py-3 text-zinc-400">{era.scheme}</td>
                          <td className="px-4 py-3 text-right font-mono font-medium text-emerald-400">{fmtZAR(era.totalPaid)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(era.reconciliationStatus)}
                              <span className={`capitalize ${statusColor(era.reconciliationStatus)}`}>{era.reconciliationStatus}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{fmtTime(era.receivedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "vendors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">PMS Vendor Accreditation</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                    + Register Vendor
                  </button>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="text-center py-8">
                    <BadgeCheck className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">Vendor Accreditation Portal</h3>
                    <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
                      Third-party practice management software vendors can register, run the accreditation test suite (12 tests), and get certified to route claims through our switching engine.
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      {[
                        { label: "Format Tests", count: 3 },
                        { label: "Content Tests", count: 3 },
                        { label: "Response Tests", count: 3 },
                        { label: "Edge Cases", count: 3 },
                      ].map((cat) => (
                        <div key={cat.label} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
                          <div className="text-lg font-bold font-mono text-purple-400">{cat.count}</div>
                          <div className="text-xs text-zinc-500">{cat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accreditation flow */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-4">Accreditation Process</h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {["Register", "Integration Pack", "Implement", "Test Suite", "Review", "Accredited"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700">
                          <span className="w-5 h-5 rounded-full bg-zinc-700 text-xs flex items-center justify-center font-mono">{i + 1}</span>
                          <span className="text-xs text-zinc-300">{step}</span>
                        </div>
                        {i < 5 && <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
