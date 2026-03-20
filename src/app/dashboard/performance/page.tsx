"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Users,
  Clock, Shield, Loader2, AlertTriangle, BarChart3, Network,
  Zap, MessageSquare, Cable, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, ChevronRight, RefreshCw,
} from "lucide-react";

/* ─── Types ─── */

interface PerformanceData {
  overview: {
    totalClaimsProcessed: number;
    rejectionRate: number;
    rejectionRateTarget: number;
    revenueRecovered: number;
    activeUsers: number;
    systemUptimePct: number;
    avgResponseTimeMs: number;
    totalRevenue: number;
    totalTarget: number;
    totalClinics: number;
  };
  claims?: {
    claimsValidatedThisMonth: number;
    rejectionRate: number;
    rejectionRateTarget: number;
    rejectionTrend: Array<{ month: string; rate: number }>;
    topRejectionReasons: Array<{ reason: string; count: number; value: number; code: string }>;
    autoFixRate: number;
    revenueSaved: number;
  };
  switching?: {
    claimsRoutedPerSwitch: Array<{ name: string; claims: number; pct: number; health: string; rejectionRate: number; avgRoutingTimeMs: number }>;
    avgRoutingTimeMs: number;
    switchHealth: Array<{ provider: string; status: string }>;
    rejectionRateBySwitch: Array<{ provider: string; rate: number }>;
    eraReconciliationRate: number;
  };
  bridge?: {
    hl7MessagesProcessed: number;
    advisoriesGenerated: { critical: number; warning: number; info: number };
    advisoryResolutionRate: number;
    aiCodingSuggestionsAccepted: number;
    revenueFromMissedCodes: number;
  };
  whatsapp?: {
    messagesReceived: number;
    messagesSent: number;
    bookingsMade: number;
    avgResponseTimeSec: number;
    topServicesRequested: Array<{ service: string; count: number }>;
    clinicUtilizationPct: number;
  };
  fhir?: {
    apiCalls: Record<string, number>;
    resourcesStored: number;
    integrationChannelsActive: number;
    errorRate: number;
  };
}

/* ─── Helpers ─── */

function formatRand(n: number) {
  if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R${(n / 1000).toFixed(0)}K`;
  return `R${n.toLocaleString()}`;
}

function formatNum(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function StatusDot({ status }: { status: string }) {
  const color = status === "green" ? "bg-emerald-400" : status === "amber" ? "bg-amber-400" : "bg-red-400";
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

/* ─── Product Tabs ─── */

const PRODUCT_TABS = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "claims", label: "Claims Analyzer", icon: Shield },
  { key: "switching", label: "Switch Engine", icon: Network },
  { key: "bridge", label: "CareOn Bridge", icon: Zap },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "fhir", label: "FHIR Hub", icon: Cable },
] as const;

type ProductTab = typeof PRODUCT_TABS[number]["key"];

/* ─── Main Component ─── */

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/performance?product=all");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const d = await res.json();
      setData(d);
    } catch (err) {
      void err;
      setError("Failed to load performance data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#1D3443]/30" />
          <span className="ml-3 text-[14px] text-[#1D3443]/40">Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-[14px] text-red-600">{error || "No data available"}</p>
          <button onClick={fetchData} className="mt-3 text-[12px] text-red-500 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D3443]">Performance Tracker</h1>
            <p className="text-sm text-[#1D3443]/50 mt-1">End-to-end performance across all products</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-lg border border-black/[0.06] text-[#1D3443]/50 hover:bg-black/[0.02] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Claims Processed", value: formatNum(data.overview.totalClaimsProcessed), icon: Shield, color: "from-teal-500 to-emerald-500" },
          { label: "Rejection Rate", value: `${data.overview.rejectionRate}%`, icon: data.overview.rejectionRate <= data.overview.rejectionRateTarget ? TrendingDown : TrendingUp, color: data.overview.rejectionRate <= data.overview.rejectionRateTarget ? "from-emerald-500 to-green-500" : "from-rose-500 to-pink-500", subtitle: `Target: ${data.overview.rejectionRateTarget}%` },
          { label: "Revenue Recovered", value: formatRand(data.overview.revenueRecovered), icon: DollarSign, color: "from-blue-500 to-indigo-500" },
          { label: "Active Users", value: formatNum(data.overview.activeUsers), icon: Users, color: "from-violet-500 to-purple-500" },
          { label: "System Uptime", value: `${data.overview.systemUptimePct}%`, icon: Activity, color: "from-emerald-500 to-teal-500" },
          { label: "Avg Response", value: `${data.overview.avgResponseTimeMs}ms`, icon: Clock, color: "from-amber-500 to-orange-500" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-black/[0.04] p-4 hover:shadow-lg hover:shadow-black/[0.03] transition-all"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[20px] font-bold text-[#1D3443]">{kpi.value}</p>
              <p className="text-[11px] text-[#1D3443]/40 mt-0.5">{kpi.label}</p>
              {"subtitle" in kpi && kpi.subtitle && (
                <p className="text-[10px] text-[#1D3443]/25 mt-0.5">{kpi.subtitle}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Product Tabs */}
      <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-black/[0.04] overflow-x-auto">
        {PRODUCT_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
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

      {/* Product Sections */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && <OverviewSection data={data} key="overview" />}
        {activeTab === "claims" && data.claims && <ClaimsSection data={data.claims} key="claims" />}
        {activeTab === "switching" && data.switching && <SwitchingSection data={data.switching} key="switching" />}
        {activeTab === "bridge" && data.bridge && <BridgeSection data={data.bridge} key="bridge" />}
        {activeTab === "whatsapp" && data.whatsapp && <WhatsAppSection data={data.whatsapp} key="whatsapp" />}
        {activeTab === "fhir" && data.fhir && <FHIRSection data={data.fhir} key="fhir" />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Overview Section ─── */

function OverviewSection({ data }: { data: PerformanceData }) {
  const o = data.overview;
  const revenueAchievement = o.totalTarget > 0 ? ((o.totalRevenue / o.totalTarget) * 100).toFixed(1) : "0";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Revenue & Network Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Revenue Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#1D3443]/40">Total Revenue</span>
              <span className="text-[16px] font-bold text-[#1D3443]">{formatRand(o.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#1D3443]/40">Target</span>
              <span className="text-[14px] font-medium text-[#1D3443]/60">{formatRand(o.totalTarget)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(Number(revenueAchievement), 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#1D3443]/30">Achievement</span>
              <span className={`text-[13px] font-bold ${Number(revenueAchievement) >= 90 ? "text-emerald-500" : Number(revenueAchievement) >= 70 ? "text-amber-500" : "text-red-500"}`}>
                {revenueAchievement}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Network Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[24px] font-bold text-[#1D3443]">{o.totalClinics}</p>
              <p className="text-[11px] text-[#1D3443]/40">Active Clinics</p>
            </div>
            <div>
              <p className="text-[24px] font-bold text-emerald-500">{o.systemUptimePct}%</p>
              <p className="text-[11px] text-[#1D3443]/40">System Uptime</p>
            </div>
            <div>
              <p className="text-[24px] font-bold text-[#1D3443]">{formatNum(o.activeUsers)}</p>
              <p className="text-[11px] text-[#1D3443]/40">Active Users</p>
            </div>
            <div>
              <p className="text-[24px] font-bold text-[#1D3443]">{o.avgResponseTimeMs}ms</p>
              <p className="text-[11px] text-[#1D3443]/40">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: "Claims Analyzer", status: "operational", metric: `${data.claims?.rejectionRate ?? 0}% rejection`, icon: Shield },
          { name: "Switching Engine", status: "operational", metric: `${data.switching?.avgRoutingTimeMs ?? 0}ms avg routing`, icon: Network },
          { name: "CareOn Bridge", status: "operational", metric: `${data.bridge?.advisoryResolutionRate ?? 0}% resolution`, icon: Zap },
          { name: "WhatsApp Channel", status: "operational", metric: `${data.whatsapp?.avgResponseTimeSec ?? 0}s response`, icon: MessageSquare },
          { name: "FHIR Hub", status: "operational", metric: `${data.fhir?.errorRate ?? 0}% error rate`, icon: Cable },
        ].map((product, i) => {
          const Icon = product.icon;
          return (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-black/[0.04] p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#1D3443]">{product.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-[#1D3443]/40">{product.metric}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1D3443]/15" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Claims Section ─── */

function ClaimsSection({ data }: { data: NonNullable<PerformanceData["claims"]> }) {
  const maxCount = Math.max(...data.topRejectionReasons.map(r => r.count), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Claims Validated" value={formatNum(data.claimsValidatedThisMonth)} icon={Shield} color="teal" />
        <MetricCard label="Rejection Rate" value={`${data.rejectionRate}%`} icon={TrendingDown} color={data.rejectionRate <= data.rejectionRateTarget ? "emerald" : "rose"} subtitle={`Target: ${data.rejectionRateTarget}%`} />
        <MetricCard label="Auto-Fix Rate" value={`${data.autoFixRate}%`} icon={Zap} color="violet" />
        <MetricCard label="Revenue Saved" value={formatRand(data.revenueSaved)} icon={DollarSign} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rejection Trend */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Rejection Rate Trend</h3>
          <div className="flex items-end gap-2 h-40">
            {data.rejectionTrend.map((point, i) => {
              const maxRate = Math.max(...data.rejectionTrend.map(p => p.rate), 1);
              const height = (point.rate / maxRate) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-[#1D3443]/40">{point.rate}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${point.rate <= data.rejectionRateTarget ? "bg-emerald-400" : "bg-rose-400"}`}
                    style={{ minHeight: 4 }}
                  />
                  <span className="text-[10px] text-[#1D3443]/30">{point.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 border-t border-dashed border-amber-300" />
            <span className="text-[10px] text-amber-500">Target: {data.rejectionRateTarget}%</span>
          </div>
        </div>

        {/* Top Rejection Reasons */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Top 5 Rejection Reasons</h3>
          <div className="space-y-3">
            {data.topRejectionReasons.map((reason, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#1D3443]/60 flex-1 truncate">{reason.reason}</span>
                  <span className="text-[11px] font-medium text-[#1D3443]/40 ml-2">{reason.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(reason.count / maxCount) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Switching Section ─── */

function SwitchingSection({ data }: { data: NonNullable<PerformanceData["switching"]> }) {
  const totalClaims = data.claimsRoutedPerSwitch.reduce((s, sw) => s + sw.claims, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Avg Routing Time" value={`${data.avgRoutingTimeMs}ms`} icon={Clock} color="blue" />
        <MetricCard label="eRA Reconciliation" value={`${data.eraReconciliationRate}%`} icon={CheckCircle2} color="emerald" />
        <MetricCard label="Total Claims Routed" value={formatNum(totalClaims)} icon={Network} color="violet" />
        <MetricCard label="Switch Providers" value={String(data.claimsRoutedPerSwitch.length)} icon={Activity} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Claims per Switch */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Claims Routed per Switch</h3>
          <div className="space-y-4">
            {data.claimsRoutedPerSwitch.map((sw, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <StatusDot status={sw.health} />
                    <span className="text-[13px] font-medium text-[#1D3443]">{sw.name}</span>
                  </div>
                  <span className="text-[12px] text-[#1D3443]/50">{formatNum(sw.claims)} ({sw.pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sw.pct}%` }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className={`h-full rounded-full ${
                      sw.health === "green" ? "bg-gradient-to-r from-emerald-400 to-teal-400" :
                      sw.health === "amber" ? "bg-gradient-to-r from-amber-400 to-orange-400" :
                      "bg-gradient-to-r from-rose-400 to-red-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rejection by Switch */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Rejection Rate by Switch</h3>
          <div className="space-y-4">
            {data.claimsRoutedPerSwitch.map((sw, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <StatusDot status={sw.health} />
                  <div>
                    <p className="text-[13px] font-medium text-[#1D3443]">{sw.name}</p>
                    <p className="text-[11px] text-[#1D3443]/30">{sw.avgRoutingTimeMs}ms avg</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[16px] font-bold ${sw.rejectionRate <= 4 ? "text-emerald-500" : sw.rejectionRate <= 5 ? "text-amber-500" : "text-rose-500"}`}>
                    {sw.rejectionRate}%
                  </p>
                  <p className="text-[10px] text-[#1D3443]/25">rejection rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Bridge Section ─── */

function BridgeSection({ data }: { data: NonNullable<PerformanceData["bridge"]> }) {
  const totalAdvisories = data.advisoriesGenerated.critical + data.advisoriesGenerated.warning + data.advisoriesGenerated.info;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="HL7v2 Messages" value={formatNum(data.hl7MessagesProcessed)} icon={Zap} color="violet" />
        <MetricCard label="Advisories Generated" value={formatNum(totalAdvisories)} icon={AlertTriangle} color="amber" />
        <MetricCard label="Resolution Rate" value={`${data.advisoryResolutionRate}%`} icon={CheckCircle2} color="emerald" />
        <MetricCard label="Revenue (Missed Codes)" value={formatRand(data.revenueFromMissedCodes)} icon={DollarSign} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Advisory Breakdown */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Advisories by Severity</h3>
          <div className="space-y-4">
            {[
              { label: "Critical", count: data.advisoriesGenerated.critical, color: "bg-red-400", total: totalAdvisories },
              { label: "Warning", count: data.advisoriesGenerated.warning, color: "bg-amber-400", total: totalAdvisories },
              { label: "Info", count: data.advisoriesGenerated.info, color: "bg-blue-400", total: totalAdvisories },
            ].map((adv, i) => (
              <div key={adv.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#1D3443]/50">{adv.label}</span>
                  <span className="text-[12px] font-medium text-[#1D3443]">{adv.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(adv.count / adv.total) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${adv.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Coding Performance */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">AI Coding Performance</h3>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(data.aiCodingSuggestionsAccepted / 100) * 327} 327`}
                  initial={{ strokeDasharray: "0 327" }}
                  animate={{ strokeDasharray: `${(data.aiCodingSuggestionsAccepted / 100) * 327} 327` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[24px] font-bold text-[#1D3443]">{data.aiCodingSuggestionsAccepted}%</span>
                <span className="text-[10px] text-[#1D3443]/30">acceptance rate</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[12px] text-[#1D3443]/40">AI coding suggestions accepted by practitioners</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── WhatsApp Section ─── */

function WhatsAppSection({ data }: { data: NonNullable<PerformanceData["whatsapp"]> }) {
  const maxCount = Math.max(...data.topServicesRequested.map(s => s.count), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Messages Received" value={formatNum(data.messagesReceived)} icon={MessageSquare} color="emerald" />
        <MetricCard label="Messages Sent" value={formatNum(data.messagesSent)} icon={MessageSquare} color="teal" />
        <MetricCard label="Bookings Made" value={formatNum(data.bookingsMade)} icon={CheckCircle2} color="blue" />
        <MetricCard label="Avg Response" value={`${data.avgResponseTimeSec}s`} icon={Clock} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Services */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Top Services Requested</h3>
          <div className="space-y-3">
            {data.topServicesRequested.map((service, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#1D3443]/60">{service.service}</span>
                  <span className="text-[11px] font-medium text-[#1D3443]/40">{service.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(service.count / maxCount) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinic Utilization */}
        <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
          <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">Clinic Utilization from WhatsApp</h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-[48px] font-bold text-emerald-500">{data.clinicUtilizationPct}%</p>
              <p className="text-[13px] text-[#1D3443]/40 mt-1">of WhatsApp bookings utilized</p>
              <p className="text-[11px] text-[#1D3443]/25 mt-2">{data.bookingsMade} bookings from {data.messagesReceived} conversations</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── FHIR Section ─── */

function FHIRSection({ data }: { data: NonNullable<PerformanceData["fhir"]> }) {
  const totalApiCalls = Object.values(data.apiCalls).reduce((s, v) => s + v, 0);
  const maxCalls = Math.max(...Object.values(data.apiCalls), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total API Calls" value={formatNum(totalApiCalls)} icon={Cable} color="violet" />
        <MetricCard label="Resources Stored" value={formatNum(data.resourcesStored)} icon={BarChart3} color="blue" />
        <MetricCard label="Active Channels" value={String(data.integrationChannelsActive)} icon={Activity} color="emerald" />
        <MetricCard label="Error Rate" value={`${data.errorRate}%`} icon={data.errorRate <= 1 ? CheckCircle2 : XCircle} color={data.errorRate <= 1 ? "emerald" : "rose"} />
      </div>

      {/* API Calls by Resource */}
      <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
        <h3 className="text-[14px] font-semibold text-[#1D3443] mb-4">API Calls by Resource Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.apiCalls).map(([resource, count], i) => (
            <div key={resource} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Cable className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#1D3443]">{resource}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxCalls) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="h-full bg-violet-400 rounded-full"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[#1D3443]/40">{formatNum(count)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Shared Metric Card ─── */

function MetricCard({ label, value, icon: Icon, color, subtitle }: {
  label: string;
  value: string;
  icon: typeof Activity;
  color: string;
  subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    teal: "bg-teal-50 text-teal-500",
    emerald: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
    violet: "bg-violet-50 text-violet-500",
    amber: "bg-amber-50 text-amber-500",
    rose: "bg-rose-50 text-rose-500",
  };
  const classes = colorMap[color] || "bg-gray-50 text-gray-500";

  return (
    <div className="bg-white rounded-2xl border border-black/[0.04] p-4">
      <div className={`w-8 h-8 rounded-lg ${classes.split(" ")[0]} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${classes.split(" ").slice(1).join(" ")}`} />
      </div>
      <p className="text-[18px] font-bold text-[#1D3443]">{value}</p>
      <p className="text-[11px] text-[#1D3443]/40 mt-0.5">{label}</p>
      {subtitle && <p className="text-[10px] text-[#1D3443]/25 mt-0.5">{subtitle}</p>}
    </div>
  );
}
