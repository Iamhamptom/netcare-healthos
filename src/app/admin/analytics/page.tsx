"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Building2, DollarSign, TrendingUp, Users } from "lucide-react";

interface Overview {
  totalPractices: number;
  activePractices: number;
  trialPractices: number;
  totalPatients: number;
  totalBookings: number;
  totalRevenue: number;
  totalMRR: number;
}

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byPlan, setByPlan] = useState<Record<string, number>>({});
  const [byType, setByType] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => {
      setOverview(d.overview || null);
      setByPlan(d.byPlan || {});
      setByType(d.byType || {});
    }).catch(() => setOverview(null));
  }, []);

  const planColors: Record<string, string> = { starter: "#E8C84A", professional: "#2DD4BF", enterprise: "#8B5CF6" };
  const planPrices: Record<string, number> = { starter: 15000, professional: 35000, enterprise: 55000 };

  // Calculate revenue projections
  const projectedMRR = Object.entries(byPlan).reduce((sum, [plan, count]) => sum + (planPrices[plan] || 0) * count, 0);
  const projectedARR = projectedMRR * 12;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-[#ef4444]" />
        <h2 className="text-lg font-semibold">Platform Analytics</h2>
      </div>

      {/* Revenue metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Monthly Recurring Revenue" value={`R${(overview?.totalMRR ?? 0).toLocaleString()}`} subtext="Current MRR" color="#10b981" icon={DollarSign} />
        <MetricCard label="Projected MRR" value={`R${projectedMRR.toLocaleString()}`} subtext="At full pricing" color="#2DD4BF" icon={TrendingUp} />
        <MetricCard label="Projected ARR" value={`R${projectedARR.toLocaleString()}`} subtext="Annual run rate" color="#8B5CF6" icon={TrendingUp} />
        <MetricCard label="Total Revenue" value={`R${(overview?.totalRevenue ?? 0).toLocaleString()}`} subtext="All-time practice revenue" color="#D4AF37" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue by Plan */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5">
          <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">Revenue Breakdown by Plan</h3>
          <div className="space-y-4">
            {Object.entries(byPlan).map(([plan, count]) => {
              const price = planPrices[plan] || 0;
              const revenue = price * count;
              const maxRevenue = Math.max(...Object.entries(byPlan).map(([p, c]) => (planPrices[p] || 0) * c), 1);
              const width = Math.round((revenue / maxRevenue) * 100);

              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-[var(--text-secondary)] capitalize">{plan}</span>
                    <span className="text-[13px] font-semibold text-[var(--ivory)]">R{revenue.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-lg flex items-center justify-end pr-2"
                        style={{ backgroundColor: `${planColors[plan]}30` }}
                      >
                        <span className="text-[10px] font-medium" style={{ color: planColors[plan] }}>
                          {count} {count === 1 ? "practice" : "practices"}
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-[11px] text-[var(--text-tertiary)] w-20 text-right">
                      R{price}/mo ea.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between">
            <span className="text-[12px] text-[var(--text-tertiary)]">Total MRR potential</span>
            <span className="text-[14px] font-bold text-[var(--gold)]">R{projectedMRR.toLocaleString()}/mo</span>
          </div>
        </motion.div>

        {/* Practice types distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-5">
          <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">Practice Type Distribution</h3>
          <div className="space-y-3">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
              const total = overview?.totalPractices || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-20 text-[13px] text-[var(--text-secondary)] capitalize">{type}</div>
                  <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-[#ef4444]/30"
                    />
                  </div>
                  <span className="text-[12px] text-[var(--ivory)] font-medium w-8 text-right">{count}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>

          {/* Key metrics */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg glass-panel text-center">
              <Users className="w-4 h-4 mx-auto text-[var(--text-tertiary)] mb-1" />
              <div className="text-lg font-bold text-[var(--ivory)]">{overview?.totalPatients ?? 0}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Total Patients (all practices)</div>
            </div>
            <div className="p-3 rounded-lg glass-panel text-center">
              <Building2 className="w-4 h-4 mx-auto text-[var(--text-tertiary)] mb-1" />
              <div className="text-lg font-bold text-[var(--ivory)]">
                {overview && overview.totalPractices > 0 ? Math.round(overview.totalPatients / overview.totalPractices) : 0}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Avg Patients/Practice</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, color, icon: Icon }: { label: string; value: string; subtext: string; color: string; icon: typeof DollarSign }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{subtext}</div>
    </motion.div>
  );
}
