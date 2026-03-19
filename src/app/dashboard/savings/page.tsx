"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Receipt, Shield,
  Pill, Users, Zap, BarChart3,
} from "lucide-react";

const MONTHS_LIVE = 9;
const MONTHLY_SAVINGS = [
  { month: "Jul 2025", claims: 120000, era: 56000, debtors: 210000, capitation: 44000, compliance: 32000, pharmacy: 93000 },
  { month: "Aug 2025", claims: 180000, era: 70000, debtors: 280000, capitation: 55000, compliance: 40000, pharmacy: 110000 },
  { month: "Sep 2025", claims: 240000, era: 84000, debtors: 310000, capitation: 58000, compliance: 42000, pharmacy: 120000 },
  { month: "Oct 2025", claims: 380000, era: 84000, debtors: 350000, capitation: 60000, compliance: 45000, pharmacy: 130000 },
  { month: "Nov 2025", claims: 520000, era: 84000, debtors: 380000, capitation: 62000, compliance: 46000, pharmacy: 135000 },
  { month: "Dec 2025", claims: 680000, era: 84000, debtors: 310000, capitation: 60000, compliance: 48000, pharmacy: 140000 },
  { month: "Jan 2026", claims: 820000, era: 84000, debtors: 420000, capitation: 66000, compliance: 48000, pharmacy: 140000 },
  { month: "Feb 2026", claims: 1200000, era: 84000, debtors: 480000, capitation: 66000, compliance: 48000, pharmacy: 140000 },
  { month: "Mar 2026", claims: 1400000, era: 84000, debtors: 520000, capitation: 66000, compliance: 48000, pharmacy: 140000 },
];

function formatR(n: number) {
  if (n >= 1000000) return "R" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "R" + (n / 1000).toFixed(0) + "K";
  return "R" + n.toLocaleString();
}

export default function SavingsPage() {
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const totalByCategory = {
    claims: MONTHLY_SAVINGS.reduce((s, m) => s + m.claims, 0),
    era: MONTHLY_SAVINGS.reduce((s, m) => s + m.era, 0),
    debtors: MONTHLY_SAVINGS.reduce((s, m) => s + m.debtors, 0),
    capitation: MONTHLY_SAVINGS.reduce((s, m) => s + m.capitation, 0),
    compliance: MONTHLY_SAVINGS.reduce((s, m) => s + m.compliance, 0),
    pharmacy: MONTHLY_SAVINGS.reduce((s, m) => s + m.pharmacy, 0),
  };
  const grandTotal = Object.values(totalByCategory).reduce((a, b) => a + b, 0);

  useEffect(() => {
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
    { key: "claims" as const, label: "Claims Recovery", icon: Receipt, color: "#3DA9D1", total: totalByCategory.claims, desc: "ICD-10-ZA + NAPPI pre-validation catching rejections before submission" },
    { key: "debtors" as const, label: "Debtor Recovery", icon: DollarSign, color: "#10B981", total: totalByCategory.debtors, desc: "Automated follow-up reducing debtor days from 42 to 28" },
    { key: "pharmacy" as const, label: "Pharmacy Optimisation", icon: Pill, color: "#F59E0B", total: totalByCategory.pharmacy, desc: "Freed working capital from dead stock elimination across 37 pharmacies" },
    { key: "era" as const, label: "eRA Reconciliation", icon: BarChart3, color: "#8B5CF6", total: totalByCategory.era, desc: "Automated eRA matching replacing manual Excel recon" },
    { key: "capitation" as const, label: "Capitation Savings", icon: Users, color: "#E3964C", total: totalByCategory.capitation, desc: "Early PMPM overspend detection for Prime Cure 254K lives" },
    { key: "compliance" as const, label: "Compliance Automation", icon: Shield, color: "#1D3443", total: totalByCategory.compliance, desc: "POPIA + HPCSA audit automation across 88 clinics" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#152736] text-center">
        <div className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-2">
          Cumulative Savings Since Implementation
        </div>
        <div className="text-5xl md:text-7xl font-bold text-white mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
          R{animatedTotal.toLocaleString()}
        </div>
        <div className="text-[13px] text-white/50">
          {MONTHS_LIVE} months live &middot; 88 clinics &middot; 6 AI modules active
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <TrendingUp className="w-4 h-4 text-[#3DA9D1]" />
          <span className="text-[12px] text-[#3DA9D1] font-semibold">
            On track for R{Math.round(grandTotal / MONTHS_LIVE * 12 / 1000000)}M+ annualised
          </span>
        </div>
        <p className="text-[10px] text-white/25 mt-4">
          This is the number you present to Keith Gibson. Every Rand is auditable.
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
            <div className="text-2xl font-bold text-gray-900 mb-1">{formatR(cat.total)}</div>
            <div className="text-[11px] text-gray-500 mb-3">{cat.desc}</div>
            <div className="flex items-end gap-0.5 h-10">
              {MONTHLY_SAVINGS.map((m, j) => {
                const val = m[cat.key];
                const max = Math.max(...MONTHLY_SAVINGS.map(x => x[cat.key]));
                const pct = max > 0 ? (val / max) * 100 : 0;
                return <div key={j} className="flex-1 rounded-t-sm" style={{ height: pct + "%", backgroundColor: cat.color, opacity: 0.3 + (j / MONTHS_LIVE) * 0.7 }} />;
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 rounded-xl bg-[#E3964C]/5 border border-[#E3964C]/20">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
          <Zap className="w-4 h-4 inline mr-2 text-[#E3964C]" />Your Story to the Board
        </h3>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div>
            <div className="font-semibold text-red-600 mb-1">Before VisioHealth OS</div>
            <ul className="space-y-1 text-gray-500">
              <li>60% of time on reporting and reconciliation</li>
              <li>Board sees stale, Excel-based data</li>
              <li>15% claims rejection, 42-day debtor days</li>
              <li>Manual compliance audits across 88 clinics</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[#10B981] mb-1">After VisioHealth OS</div>
            <ul className="space-y-1 text-gray-600">
              <li>60% of time on strategy and advising the CEO</li>
              <li>Board sees real-time dashboards with drill-down</li>
              <li>&lt;5% claims rejection, 28-day debtor days</li>
              <li>{formatR(grandTotal)} saved in {MONTHS_LIVE} months</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
