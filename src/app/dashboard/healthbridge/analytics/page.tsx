"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Loader2, Building2, Clock, DollarSign, TrendingUp,
  AlertCircle, ArrowRight, CheckCircle2, XCircle,
} from "lucide-react";

interface SchemeAnalytic {
  scheme: string;
  totalClaims: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  rejectionRate: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  collectionRate: number;
  avgDaysToPayment: number;
  topRejections: { code: string; reason: string; count: number }[];
}

interface AgingBucket {
  bucket: string;
  count: number;
  amount: number;
  amountFormatted: string;
}

interface AnalyticsSummary {
  totalClaims: number;
  totalBilled: string;
  totalPaid: string;
  totalOutstanding: string;
  collectionRate: string;
  totalBilledCents: number;
  totalPaidCents: number;
  totalOutstandingCents: number;
}

export default function SchemeAnalyticsPage() {
  const [period, setPeriod] = useState("all");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [schemes, setSchemes] = useState<SchemeAnalytic[]>([]);
  const [aging, setAging] = useState<AgingBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/healthbridge/analytics?period=${period}`);
      const data = await res.json();
      setSummary(data.summary || null);
      setSchemes(data.schemeAnalytics || []);
      setAging(data.aging || []);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--teal)]" />
        <span className="ml-2 text-[13px] text-[var(--text-secondary)]">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="text-lg font-semibold text-[var(--ivory)]">Scheme Analytics</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">Revenue Intelligence</span>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-glass text-[12px] w-36">
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mb-5">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Summary KPIs */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total Claims", value: String(summary.totalClaims), icon: BarChart3, color: "#3DA9D1" },
              { label: "Total Billed", value: summary.totalBilled, icon: DollarSign, color: "#D4AF37" },
              { label: "Total Collected", value: summary.totalPaid, icon: TrendingUp, color: "#10b981" },
              { label: "Outstanding", value: summary.totalOutstanding, icon: AlertCircle, color: "#ef4444" },
              { label: "Collection Rate", value: summary.collectionRate, icon: CheckCircle2, color: "#3DA9D1" },
            ].map((kpi) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="text-xl font-bold text-[var(--ivory)]">{kpi.value}</div>
                <div className="text-[11px] text-[var(--text-tertiary)]">{kpi.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Scheme Breakdown */}
        <div className="mb-6">
          <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--gold)]" /> Revenue by Scheme
          </h3>
          <div className="space-y-3">
            {schemes.map((scheme) => (
              <motion.div key={scheme.scheme} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-[var(--gold)]" />
                    <span className="text-[13px] font-semibold text-[var(--ivory)]">{scheme.scheme}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)]">{scheme.totalClaims} claims</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-emerald-400">{scheme.acceptanceRate}% accepted</span>
                    <span className="text-red-400">{scheme.rejectionRate}% rejected</span>
                    {scheme.avgDaysToPayment > 0 && (
                      <span className="text-[var(--text-tertiary)]">{scheme.avgDaysToPayment}d avg payment</span>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 rounded-full bg-[var(--charcoal)]/30 overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--teal)]" style={{ width: `${scheme.collectionRate}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
                  <span>Billed: R{(scheme.totalBilled / 100).toLocaleString()}</span>
                  <span>Collected: R{(scheme.totalPaid / 100).toLocaleString()} ({scheme.collectionRate}%)</span>
                  <span>Outstanding: R{(scheme.totalOutstanding / 100).toLocaleString()}</span>
                </div>
                {/* Top rejections */}
                {scheme.topRejections.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Top rejection reasons:</div>
                    {scheme.topRejections.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-[10px] text-red-400 flex items-center gap-1">
                        <ArrowRight className="w-2.5 h-2.5" /> Code {r.code}: {r.reason} ({r.count}x)
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
            {schemes.length === 0 && (
              <div className="rounded-xl glass-panel p-8 text-center text-[13px] text-[var(--text-tertiary)]">
                No scheme data available for this period
              </div>
            )}
          </div>
        </div>

        {/* Aging Report */}
        {aging.length > 0 && (
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f59e0b]" /> Outstanding Claims Aging
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {aging.map((bucket) => {
                const isAlert = bucket.bucket.includes("91") || bucket.bucket.includes("120+");
                return (
                  <motion.div key={bucket.bucket} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-xl glass-panel p-4 text-center ${isAlert ? "border border-red-500/20" : ""}`}
                  >
                    <div className={`text-[18px] font-bold ${isAlert ? "text-red-400" : "text-[var(--ivory)]"}`}>{bucket.count}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{bucket.bucket}</div>
                    <div className={`text-[12px] font-medium mt-1 ${isAlert ? "text-red-400" : "text-[var(--gold)]"}`}>{bucket.amountFormatted}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
