"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2, BarChart3, TrendingDown, TrendingUp, AlertTriangle,
  CheckCircle2, Activity, DollarSign, ArrowUpRight, Clock,
  ChevronUp, ChevronDown, Shield, Sparkles, FileBarChart,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
interface ClinicStat {
  practiceId: string;
  practiceName: string;
  practiceType: string;
  totalAnalyses: number;
  totalClaims: number;
  totalRejected: number;
  avgRejectionRate: number;
  totalSavings: number;
  lastAnalysis: string;
  topScheme: string;
}

interface TrendEntry {
  month: string;
  totalClaims: number;
  totalRejected: number;
  rejectionRate: number;
  totalSavings: number;
  analysisCount: number;
}

interface NetworkData {
  network: {
    totalClinics: number;
    clinicsWithData: number;
    totalAnalyses: number;
    totalClaims: number;
    totalRejected: number;
    avgRejectionRate: number;
    totalSavings: number;
    topSchemes: [string, number][];
  };
  clinicStats: ClinicStat[];
  worstClinics: ClinicStat[];
  bestClinics: ClinicStat[];
  trend: TrendEntry[];
}

type SortKey = "practiceName" | "practiceType" | "totalAnalyses" | "totalClaims" | "totalRejected" | "avgRejectionRate" | "totalSavings" | "lastAnalysis";

// ─── Helpers ─────────────────────────────────────────────────────
function rateColor(rate: number) {
  if (rate > 20) return { text: "text-red-600", bg: "bg-red-50", dot: "#EF4444" };
  if (rate > 10) return { text: "text-amber-600", bg: "bg-amber-50", dot: "#F59E0B" };
  return { text: "text-green-600", bg: "bg-green-50", dot: "#10B981" };
}

function formatRand(val: number) {
  if (val >= 1_000_000) return `R${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R${(val / 1_000).toFixed(0)}K`;
  return `R${val.toLocaleString()}`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function practiceTypeLabel(type: string) {
  const map: Record<string, string> = {
    gp: "GP", specialist: "Specialist", dental: "Dental", optometry: "Optometry",
    physio: "Physio", hospital: "Hospital", clinic: "Clinic",
  };
  return map[type] || type;
}

// ─── Main Component ──────────────────────────────────────────────
export default function ClaimsNetworkPage() {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("avgRejectionRate");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch("/api/claims/network")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load network claims data."))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "practiceName" || key === "practiceType");
    }
  }

  const sortedClinics = useMemo(() => {
    if (!data) return [];
    const clinics = data.clinicStats.filter(c => c.totalAnalyses > 0);
    return [...clinics].sort((a, b) => {
      let aVal: string | number = a[sortKey] ?? "";
      let bVal: string | number = b[sortKey] ?? "";
      if (typeof aVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [data, sortKey, sortAsc]);

  // ── Loading / Error ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-5 h-5 border-2 border-[#3DA9D1]/30 border-t-[#3DA9D1] rounded-full animate-spin" />
        <span className="ml-3 text-[13px] text-gray-400">Loading network data...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-[13px] text-gray-500">{error || "No data available"}</p>
      </div>
    );
  }

  const { network, worstClinics, bestClinics, trend } = data;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3DA9D1]/10 to-[#E3964C]/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#3DA9D1]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Claims Network Dashboard</h1>
          <p className="text-[12px] text-gray-500">Multi-clinic rejection analytics across all {network.totalClinics} Netcare facilities</p>
        </div>
      </motion.div>

      {/* ═══ HERO KPI STRIP ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        {[
          { label: "Total Clinics", value: network.totalClinics.toString(), sub: "in network", icon: Building2, color: "#3DA9D1" },
          { label: "Clinics Reporting", value: network.clinicsWithData.toString(), sub: `of ${network.totalClinics} active`, icon: Activity, color: "#6366F1" },
          { label: "Claims Analyzed", value: network.totalClaims.toLocaleString(), sub: `${network.totalAnalyses} analyses run`, icon: FileBarChart, color: "#3DA9D1" },
          { label: "Network Rejection Rate", value: `${network.avgRejectionRate}%`, sub: `${network.totalRejected.toLocaleString()} rejected`, icon: TrendingDown, color: network.avgRejectionRate > 20 ? "#EF4444" : network.avgRejectionRate > 10 ? "#F59E0B" : "#10B981" },
          { label: "Recoverable Savings", value: formatRand(network.totalSavings), sub: "estimated across network", icon: DollarSign, color: "#E3964C" },
        ].map((kpi, idx) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.04 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              <span className="text-[11px] text-gray-500 font-medium">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900" style={kpi.label === "Network Rejection Rate" ? { color: kpi.color } : undefined}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ TREND CHART + SCHEME BREAKDOWN ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Trend chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-[13px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#3DA9D1]" />
            Monthly Network Rejection Rate
          </h3>
          <p className="text-[11px] text-gray-400 mb-4">Aggregated rejection trends across all reporting clinics</p>
          {trend.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {trend.map((t, idx) => {
                const maxRate = Math.max(...trend.map(x => x.rejectionRate), 1);
                const height = (t.rejectionRate / maxRate) * 100;
                const color = t.rejectionRate > 20 ? "#EF4444" : t.rejectionRate > 10 ? "#F59E0B" : "#10B981";
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <span className="text-[10px] font-bold" style={{ color }}>{t.rejectionRate}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: 0.2 + idx * 0.08, duration: 0.5, ease: "easeOut" }}
                      className="w-full rounded-t-md cursor-pointer"
                      style={{ backgroundColor: color, minHeight: 4 }}
                    />
                    <span className="text-[9px] text-gray-400">{t.month.substring(5)}</span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 bg-[#1D3443] text-white px-3 py-2 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      <div className="font-semibold mb-1">{t.month}</div>
                      <div>{t.totalClaims.toLocaleString()} claims</div>
                      <div>{t.totalRejected.toLocaleString()} rejected</div>
                      <div>{formatRand(t.totalSavings)} savings</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-[12px] text-gray-400">No trend data yet</div>
          )}
        </motion.div>

        {/* Scheme breakdown */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-[13px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#E3964C]" />
            Top Schemes
          </h3>
          <p className="text-[11px] text-gray-400 mb-4">Most analyzed medical schemes across network</p>
          {network.topSchemes.length > 0 ? (
            <div className="space-y-3">
              {network.topSchemes.map(([scheme, count], idx) => {
                const maxCount = network.topSchemes[0]?.[1] || 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={scheme}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-gray-700">{scheme || "Generic"}</span>
                      <span className="text-[11px] text-gray-400">{count} analyses</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + idx * 0.08, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: idx === 0 ? "#3DA9D1" : idx === 1 ? "#E3964C" : "#6366F1" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-[12px] text-gray-400">No scheme data</div>
          )}
        </motion.div>
      </div>

      {/* ═══ WORST + BEST CLINICS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Worst 5 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-[13px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Highest Rejection Rates
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">Clinics requiring immediate attention</p>
          {worstClinics.length > 0 ? (
            <div className="space-y-1.5">
              {worstClinics.map((c, idx) => {
                const rc = rateColor(c.avgRejectionRate);
                return (
                  <motion.div key={c.practiceId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rc.bg}`}>
                      <span className={`text-[11px] font-bold ${rc.text}`}>{c.avgRejectionRate}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate">{c.practiceName}</p>
                      <p className="text-[10px] text-gray-400">
                        {practiceTypeLabel(c.practiceType)} · {c.totalClaims.toLocaleString()} claims · {formatRand(c.totalSavings)} at risk
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[12px] text-gray-400">No clinic data available</div>
          )}
        </motion.div>

        {/* Best 5 */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <h3 className="text-[13px] font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Lowest Rejection Rates
          </h3>
          <p className="text-[11px] text-gray-400 mb-3">Network benchmarks — cleanest claim submissions</p>
          {bestClinics.length > 0 ? (
            <div className="space-y-1.5">
              {bestClinics.map((c, idx) => {
                const rc = rateColor(c.avgRejectionRate);
                return (
                  <motion.div key={c.practiceId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50/50 transition-colors cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rc.bg}`}>
                      <span className={`text-[11px] font-bold ${rc.text}`}>{c.avgRejectionRate}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate">{c.practiceName}</p>
                      <p className="text-[10px] text-gray-400">
                        {practiceTypeLabel(c.practiceType)} · {c.totalClaims.toLocaleString()} claims · {formatRand(c.totalSavings)} saved
                      </p>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-400 transition-colors shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[12px] text-gray-400">No clinic data available</div>
          )}
        </motion.div>
      </div>

      {/* ═══ ALL CLINICS TABLE ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-5 pb-3">
          <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#3DA9D1]" />
            All Reporting Clinics
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {sortedClinics.length} of {network.totalClinics} clinics with claims data — click column headers to sort
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-t border-b border-gray-100">
                {([
                  ["practiceName", "Clinic"],
                  ["practiceType", "Type"],
                  ["totalAnalyses", "Analyses"],
                  ["totalClaims", "Claims"],
                  ["totalRejected", "Rejected"],
                  ["avgRejectionRate", "Rate %"],
                  ["totalSavings", "Savings"],
                  ["lastAnalysis", "Last Analysis"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortKey === key && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedClinics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[12px] text-gray-400">
                    No clinics have run claims analyses yet
                  </td>
                </tr>
              ) : (
                sortedClinics.map((c, idx) => {
                  const rc = rateColor(c.avgRejectionRate);
                  return (
                    <motion.tr key={c.practiceId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 + idx * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-medium text-gray-800">{c.practiceName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {practiceTypeLabel(c.practiceType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 tabular-nums">{c.totalAnalyses}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 tabular-nums">{c.totalClaims.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 tabular-nums">{c.totalRejected.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rc.dot }} />
                          {c.avgRejectionRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-medium text-gray-700 tabular-nums">{formatRand(c.totalSavings)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(c.lastAnalysis)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ─── Footer ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-[10px] text-gray-300 pb-4"
      >
        Netcare Health OS — Claims Network Intelligence · Data refreshes on each analysis run
      </motion.div>
    </div>
  );
}
