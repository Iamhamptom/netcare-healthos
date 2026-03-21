"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Receipt, Shield,
  Pill, Users, Zap, BarChart3, Loader2,
} from "lucide-react";
import type { MonthlySavings } from "@/lib/data-sources/types";

function formatR(n: number) {
  if (n >= 1000000) return "R" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "R" + (n / 1000).toFixed(0) + "K";
  return "R" + n.toLocaleString();
}

interface SavingsResponse {
  monthly: MonthlySavings[];
  totals: Record<string, number>;
  grandTotal: number;
  annualized: number;
  monthCount: number;
}

export default function SavingsPage() {
  const [data, setData] = useState<SavingsResponse | null>(null);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/savings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grandTotal = data?.grandTotal || 0;
  const monthCount = data?.monthCount || 1;
  const annualized = data?.annualized || 0;
  const monthly = data?.monthly || [];
  const totals = data?.totals || { claims: 0, era: 0, debtors: 0, capitation: 0, compliance: 0, pharmacy: 0 };

  useEffect(() => {
    if (!grandTotal) return;
    const duration = 2500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotal(Math.floor(grandTotal * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [grandTotal]);

  const categories = [
    { key: "claims" as const, label: "Claims Recovery", icon: Receipt, color: "#3DA9D1", total: totals.claims, desc: "ICD-10-ZA + NAPPI pre-validation catching rejections before submission" },
    { key: "debtors" as const, label: "Debtor Recovery", icon: DollarSign, color: "#10B981", total: totals.debtors, desc: "Automated follow-up reducing debtor days from 42 to 28" },
    { key: "pharmacy" as const, label: "Pharmacy Optimisation", icon: Pill, color: "#F59E0B", total: totals.pharmacy, desc: "Freed working capital from dead stock elimination across pharmacies" },
    { key: "era" as const, label: "eRA Reconciliation", icon: BarChart3, color: "#8B5CF6", total: totals.era, desc: "Automated eRA matching replacing manual Excel recon" },
    { key: "capitation" as const, label: "Capitation Savings", icon: Users, color: "#E3964C", total: totals.capitation, desc: "Early PMPM overspend detection for Prime Cure lives" },
    { key: "compliance" as const, label: "Compliance Automation", icon: Shield, color: "#1D3443", total: totals.compliance, desc: "POPIA + HPCSA audit automation across clinics" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#152736] text-center">
        <div className="text-[11px] text-white/60 uppercase tracking-widest font-semibold mb-2">
          Projected Annual Savings — Modelled Estimate
        </div>
        <div className="text-5xl md:text-7xl font-bold text-white mb-2 font-metric">
          R{animatedTotal.toLocaleString()}
        </div>
        <div className="text-[13px] text-white/50">
          Modelled over {monthCount} months &middot; {monthly.length > 0 ? `${monthly.length} data points` : "—"} &middot; 6 categories
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <TrendingUp className="w-4 h-4 text-[#3DA9D1]" />
          <span className="text-[12px] text-[#3DA9D1] font-semibold">
            Potential: {formatR(annualized)} annualised if deployed
          </span>
        </div>
        <p className="text-[10px] text-white/70 mt-4 max-w-xl mx-auto">
          These are projected estimates based on Netcare FY2025 public data, SA industry benchmarks (CMS reports, BHF data), and verified gap analysis. Actual savings subject to integration scope, data access, and operational variables. Not based on live deployment data.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div key={cat.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="p-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
              <span className="text-[13px] font-semibold text-gray-900">{cat.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1 font-metric">{formatR(cat.total)}</div>
            <div className="text-[11px] text-gray-500 mb-3">{cat.desc}</div>
            <div className="flex items-end gap-0.5 h-10">
              {monthly.map((m, j) => {
                const val = m[cat.key];
                const max = Math.max(...monthly.map(x => x[cat.key]));
                const pct = max > 0 ? (val / max) * 100 : 0;
                return <div key={j} className="flex-1 rounded-t-sm" style={{ height: pct + "%", backgroundColor: cat.color, opacity: 0.3 + (j / monthly.length) * 0.7 }} />;
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-[#E3964C]/5 border border-[#E3964C]/20">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-2">
          <Zap className="w-4 h-4 inline mr-2 text-[#E3964C]" />Insights for Your Board
        </h3>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <div className="font-semibold text-red-600 mb-1">Before VisioHealth OS</div>
            <ul className="space-y-1 text-gray-500">
              <li>60% of time on reporting and reconciliation</li>
              <li>Board sees stale, Excel-based data</li>
              <li>15% claims rejection, 42-day debtor days</li>
              <li>Manual compliance audits across clinics</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[#10B981] mb-1">After VisioHealth OS</div>
            <ul className="space-y-1 text-gray-600">
              <li>60% of time on strategy and advising the CEO</li>
              <li>Board sees real-time dashboards with drill-down</li>
              <li>&lt;5% claims rejection, 28-day debtor days</li>
              <li>{formatR(grandTotal)} modelled savings over {monthCount} months</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
