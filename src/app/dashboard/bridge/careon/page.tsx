"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Database,
  FileText, Heart, Radio, Server, Shield, Zap, ChevronRight,
  ArrowUpRight, Circle, RefreshCw, Filter, XCircle,
} from "lucide-react";

// ── Types ──

interface BridgeStats {
  connection: { status: string; facilitiesOnline: number; facilitiesTotal: number; lastHeartbeat: string | null };
  messages: { received24h: number; processed24h: number; errorRate: number; avgProcessingTimeMs: number };
  advisories: { total: number; critical: number; warning: number; actionRequired: number; totalClaimValue: number };
}

interface Advisory {
  id: string;
  timestamp: string;
  patientMRN: string;
  patientName: string;
  encounterType: string;
  facility: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  suggestedICD10: { code: string; description: string; confidence: number }[];
  estimatedValue: number;
  actionRequired: boolean;
  autoResolvable: boolean;
  sourceMessageType: string;
  sourceMessageId: string;
  resolution?: {
    action: string;
    resolvedBy: string;
    resolvedAt: string;
    notes?: string;
    claimDraftId?: string;
    notificationSent?: boolean;
  };
}

interface MessageLog {
  id: string;
  receivedAt: string;
  messageType: string;
  facility: string;
  patientMRN: string;
  status: string;
  advisoryCount: number;
  processingTimeMs: number;
}

interface FacilityStatus {
  name: string;
  code: string;
  connected: boolean;
  lastMessage: string | null;
  messageCount24h: number;
}

// ── Helpers ──

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatZAR(val: number): string {
  return `R${val.toLocaleString("en-ZA")}`;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  critical: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  warning: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  info: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: FileText },
  success: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
};

const categoryLabels: Record<string, string> = {
  billing: "Billing",
  coding: "Coding",
  compliance: "Compliance",
  clinical: "Clinical",
  eligibility: "Eligibility",
};

// ── Main Page ──

export default function CareOnBridgePage() {
  const [stats, setStats] = useState<BridgeStats | null>(null);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [facilities, setFacilities] = useState<FacilityStatus[]>([]);
  const [activeTab, setActiveTab] = useState<"advisories" | "messages" | "facilities">("advisories");
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [selectedAdvisory, setSelectedAdvisory] = useState<Advisory | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function handleResolve(advisoryId: string, action: string, notes?: string) {
    setResolving(advisoryId);
    try {
      const res = await fetch("/api/bridge/careon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisoryId, action, notes }),
      });
      const data = await res.json();
      if (data.success && data.advisory) {
        setAdvisories((prev) =>
          prev.map((a) => (a.id === advisoryId ? data.advisory : a))
        );
        setSelectedAdvisory(data.advisory);
      }
    } catch (err) {
      console.error("Failed to resolve advisory:", err);
    } finally {
      setResolving(null);
    }
  }

  async function fetchData() {
    try {
      const [statsRes, advRes, msgRes, connRes] = await Promise.all([
        fetch("/api/bridge/careon?view=stats"),
        fetch("/api/bridge/careon?view=advisories"),
        fetch("/api/bridge/careon?view=messages"),
        fetch("/api/bridge/careon?view=connection"),
      ]);
      const statsData = await statsRes.json();
      const advData = await advRes.json();
      const msgData = await msgRes.json();
      const connData = await connRes.json();

      setStats(statsData);
      setAdvisories(advData.advisories ?? []);
      setMessages(msgData.messages ?? []);
      setFacilities(connData.facilities ?? []);
    } catch (err) {
      console.error("Failed to fetch bridge data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Connecting to CareOn Bridge...</span>
        </div>
      </div>
    );
  }

  const filteredAdvisories = severityFilter
    ? advisories.filter((a) => a.severity === severityFilter)
    : advisories;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-[#3DA9D1]" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
              Hospital Bridge
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">CareOn / iMedOne Bridge Console</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Read-only bridge receiving HL7v2 messages from Netcare hospitals. AI generates billing and clinical advisories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats?.connection.status === "connected" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span className="text-[11px] font-semibold text-green-700">CONNECTED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" />
              <span className="text-[11px] font-semibold text-red-700">DISCONNECTED</span>
            </div>
          )}
          <button onClick={fetchData} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          label="Facilities Online"
          value={`${stats?.connection.facilitiesOnline ?? 0}/${stats?.connection.facilitiesTotal ?? 0}`}
          icon={Server}
          color="#3DA9D1"
          sub={stats?.connection.lastHeartbeat ? `Last heartbeat ${timeAgo(stats.connection.lastHeartbeat)}` : "No heartbeat"}
        />
        <StatCard
          label="Messages (24h)"
          value={(stats?.messages.received24h ?? 0).toLocaleString()}
          icon={Activity}
          color="#1D3443"
          sub={`${stats?.messages.avgProcessingTimeMs ?? 0}ms avg processing`}
        />
        <StatCard
          label="Advisories Generated"
          value={`${stats?.advisories.total ?? 0}`}
          icon={Zap}
          color="#E3964C"
          sub={`${stats?.advisories.actionRequired ?? 0} require action`}
        />
        <StatCard
          label="Critical Alerts"
          value={`${stats?.advisories.critical ?? 0}`}
          icon={AlertTriangle}
          color="#EF4444"
          sub={`${stats?.advisories.warning ?? 0} warnings`}
        />
        <StatCard
          label="Claim Value Identified"
          value={formatZAR(stats?.advisories.totalClaimValue ?? 0)}
          icon={Database}
          color="#10B981"
          sub="From bridge advisories"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {([
          { key: "advisories", label: "Advisories", icon: Zap, count: advisories.length },
          { key: "messages", label: "Message Log", icon: FileText, count: messages.length },
          { key: "facilities", label: "Facilities", icon: Server, count: facilities.length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#1D3443] text-[#1D3443]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              activeTab === tab.key ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "advisories" && (
        <div className="space-y-4">
          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] text-gray-500 font-medium">Filter:</span>
            {["critical", "warning", "info", "success"].map((sev) => {
              const conf = severityConfig[sev];
              const count = advisories.filter((a) => a.severity === sev).length;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    severityFilter === sev
                      ? `${conf.bg} ${conf.border} ${conf.color}`
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          {/* Advisory Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAdvisories.map((adv, i) => {
                const conf = severityConfig[adv.severity] ?? severityConfig.info;
                const Icon = conf.icon;
                return (
                  <motion.div
                    key={adv.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedAdvisory(selectedAdvisory?.id === adv.id ? null : adv)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${conf.border} ${conf.bg} hover:shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${conf.bg} shrink-0`}>
                        <Icon className={`w-4 h-4 ${conf.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[13px] font-semibold ${conf.color}`}>{adv.title}</span>
                          {adv.actionRequired && (
                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold uppercase">Action Required</span>
                          )}
                          {adv.autoResolvable && (
                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-bold uppercase">Auto</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                          <span>{adv.facility}</span>
                          <span>|</span>
                          <span>{adv.patientName} ({adv.patientMRN})</span>
                          <span>|</span>
                          <span>{adv.encounterType}</span>
                          <span>|</span>
                          <span>{timeAgo(adv.timestamp)}</span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed">{adv.description}</p>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {selectedAdvisory?.id === adv.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-gray-200/60 space-y-3">
                                {adv.suggestedICD10.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Suggested ICD-10 Codes</span>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                      {adv.suggestedICD10.map((code) => (
                                        <div key={code.code} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-gray-200">
                                          <span className="text-[12px] font-mono font-bold text-[#1D3443]">{code.code}</span>
                                          <span className="text-[11px] text-gray-500">{code.description}</span>
                                          <span className={`text-[9px] font-bold px-1 rounded ${
                                            code.confidence >= 0.95 ? "bg-green-100 text-green-700" : code.confidence >= 0.85 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                          }`}>
                                            {Math.round(code.confidence * 100)}%
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-6 text-[11px]">
                                  <div>
                                    <span className="text-gray-400">Estimated Claim Value: </span>
                                    <span className="font-semibold text-[#1D3443]">{formatZAR(adv.estimatedValue)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Source: </span>
                                    <span className="font-mono text-gray-600">{adv.sourceMessageType}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Category: </span>
                                    <span className="font-semibold text-gray-600">{categoryLabels[adv.category] ?? adv.category}</span>
                                  </div>
                                </div>

                                {/* Resolution Status or Action Buttons */}
                                {adv.resolution ? (
                                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50 border border-green-200">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                    <div className="flex-1 text-[11px]">
                                      <span className="font-semibold text-green-700">
                                        {adv.resolution.action === "generate_claim" ? "Claim Draft Generated" :
                                         adv.resolution.action === "notify_doctor" ? "Doctor Notified" :
                                         adv.resolution.action === "dismiss" ? "Dismissed" : "Resolved"}
                                      </span>
                                      <span className="text-green-600">
                                        {" "}by {adv.resolution.resolvedBy} — {timeAgo(adv.resolution.resolvedAt)}
                                      </span>
                                      {adv.resolution.claimDraftId && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded bg-white border border-green-200 font-mono text-[10px] text-green-700">
                                          {adv.resolution.claimDraftId}
                                        </span>
                                      )}
                                      {adv.resolution.notes && (
                                        <div className="mt-1 text-green-600/80 italic">{adv.resolution.notes}</div>
                                      )}
                                    </div>
                                  </div>
                                ) : adv.actionRequired ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mr-1">Actions:</span>
                                    <button
                                      disabled={resolving === adv.id}
                                      onClick={(e) => { e.stopPropagation(); handleResolve(adv.id, "generate_claim"); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1D3443] text-white text-[11px] font-medium hover:bg-[#1D3443]/90 transition-colors disabled:opacity-50"
                                    >
                                      <Database className="w-3 h-3" />
                                      Generate Claim
                                    </button>
                                    <button
                                      disabled={resolving === adv.id}
                                      onClick={(e) => { e.stopPropagation(); handleResolve(adv.id, "notify_doctor"); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3DA9D1] text-white text-[11px] font-medium hover:bg-[#3DA9D1]/90 transition-colors disabled:opacity-50"
                                    >
                                      <Heart className="w-3 h-3" />
                                      Notify Doctor
                                    </button>
                                    <button
                                      disabled={resolving === adv.id}
                                      onClick={(e) => { e.stopPropagation(); handleResolve(adv.id, "resolve", "Reviewed and confirmed"); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-[11px] font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Resolve
                                    </button>
                                    <button
                                      disabled={resolving === adv.id}
                                      onClick={(e) => { e.stopPropagation(); handleResolve(adv.id, "dismiss"); }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-[11px] font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      Dismiss
                                    </button>
                                    {resolving === adv.id && (
                                      <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin ml-1" />
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${selectedAdvisory?.id === adv.id ? "rotate-90" : ""}`} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Time", "Type", "Facility", "Patient", "Status", "Advisories", "Processing"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, i) => (
                <motion.tr
                  key={msg.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-[12px] text-gray-500">{timeAgo(msg.receivedAt)}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded bg-[#1D3443]/10 text-[#1D3443] text-[11px] font-mono font-medium">{msg.messageType}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-gray-700">{msg.facility}</td>
                  <td className="px-4 py-3 text-[12px] font-mono text-gray-500">{msg.patientMRN}</td>
                  <td className="px-4 py-3">
                    {msg.status === "advisory_generated" ? (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <Zap className="w-3 h-3" /> Advisory
                      </span>
                    ) : msg.status === "error" ? (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                        <XCircle className="w-3 h-3" /> Error
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-center">{msg.advisoryCount || "-"}</td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">{msg.processingTimeMs}ms</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "facilities" && (
        <div className="grid grid-cols-2 gap-3">
          {facilities.map((fac, i) => (
            <motion.div
              key={fac.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 rounded-xl border transition-colors ${
                fac.connected
                  ? "border-green-200 bg-green-50/30"
                  : "border-red-200 bg-red-50/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Circle className={`w-2 h-2 ${fac.connected ? "fill-green-500 text-green-500" : "fill-red-500 text-red-500"}`} />
                  <span className="text-[13px] font-semibold text-gray-900">{fac.name}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase ${fac.connected ? "text-green-600" : "text-red-600"}`}>
                  {fac.connected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span>Code: <span className="font-mono">{fac.code}</span></span>
                <span>Messages (24h): <span className="font-semibold text-gray-700">{fac.messageCount24h}</span></span>
                {fac.lastMessage && <span>Last: {timeAgo(fac.lastMessage)}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer — Technical Note */}
      <div className="p-4 rounded-xl bg-[#1D3443] mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-[#3DA9D1]" />
          <span className="text-[12px] font-semibold text-white">Read-Only Bridge — Advisory Mode</span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed">
          This bridge receives HL7v2 messages from CareOn/iMedOne and generates billing, coding, and clinical advisories using AI.
          It does <strong className="text-white/80">not</strong> write data back to CareOn or modify any hospital records.
          All advisories are recommendations for the billing team to review. FHIR R4 resource mapping ensures data portability.
          Production deployment requires Deutsche Telekom Clinical Solutions integration agreement and CAREON_BRIDGE_TOKEN configuration.
        </p>
      </div>
    </div>
  );
}

// ── Stat Card Component ──

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string; icon: typeof Activity; color: string; sub: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900 font-metric">{value}</div>
      <div className="text-[10px] text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
