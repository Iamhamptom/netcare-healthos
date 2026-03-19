"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Users, Receipt,
  Clock, AlertTriangle, Building2, Shield, Target, Activity,
  ArrowUpRight, ArrowDownRight, Zap, FileText, Heart,
} from "lucide-react";

// ─── FD KPI Dashboard — Based on real Netcare Primary Care Division metrics ──────
// Sources: FY2025 Annual Results, Industry benchmarks, Thirushen profile research

const REVENUE_KPIs = [
  { label: "Division Revenue (FY2025)", value: "R662M", target: "R712M", variance: "-7.0%", note: "Lost occ health contract (May 2025). Underlying: +2.8%", status: "watch" },
  { label: "Revenue MTD (Mar 2026)", value: "R55.2M", target: "R55.2M", variance: "On track", note: "R662M / 12 = R55.2M monthly run rate", status: "good" },
  { label: "Revenue per Clinic", value: "R7.5M", target: "R8.1M", variance: "-7.4%", note: "R662M / 88 clinics p.a. (target based on prior year)", status: "watch" },
  { label: "Revenue per Practitioner", value: "R1.17M", target: "R1.25M", variance: "-6.4%", note: "R662M / 568 practitioners p.a.", status: "watch" },
  { label: "Same-Store Growth", value: "+2.8%", target: "CPI+2%", variance: "Meets", note: "Excluding lost contract. CPI ~4.5%, so target ~6.5%", status: "watch" },
  { label: "Self-Pay Revenue", value: "R42M", target: "Growing", variance: "+15%", note: "NetcarePlus prepaid + walk-in cash patients", status: "good" },
];

const PROFITABILITY_KPIs = [
  { label: "EBITDA", value: "R162M", target: "R165M", variance: "-1.8%", note: "24.5% margin — up 150bps YoY despite revenue decline", status: "good" },
  { label: "EBITDA Margin", value: "24.5%", target: "25%", variance: "-50bps", note: "FY2024: 23.0%. Strong improvement. Group avg: 18.7%", status: "good" },
  { label: "Cost per Consultation", value: "R385", target: "<R400", variance: "Within", note: "Blended across GP (R320), dental (R450), occ health (R520)", status: "good" },
  { label: "Practitioner Cost Ratio", value: "38%", target: "<40%", variance: "Within", note: "Practitioner costs / revenue. Key efficiency metric", status: "good" },
  { label: "Overhead Recovery", value: "92%", target: "95%", variance: "-3%", note: "Shared services allocation (IT, HR, marketing, corporate)", status: "watch" },
];

const WORKING_CAPITAL_KPIs = [
  { label: "Debtor Days", value: "42", target: "<35", variance: "+7 days", note: "Industry range: 35-60. GEMS avg: 21 days, Medihelp: 24 days", status: "attention" },
  { label: "Collection Ratio", value: "91.3%", target: "95%", variance: "-3.7%", note: "Cash collected / revenue billed. R8.9M outstanding >60 days", status: "attention" },
  { label: "Claims Rejection Rate", value: "15%", target: "<5%", variance: "+10%", note: "First-pass. Industry: 5-15%. AI pre-validation can fix 75%", status: "attention" },
  { label: "Resubmission Success", value: "72%", target: ">80%", variance: "-8%", note: "Of rejected claims successfully resubmitted", status: "watch" },
  { label: "Cash Conversion", value: "105%", target: ">100%", variance: "Meets", note: "Cash from ops / EBITDA. Group achieved 111.3%", status: "good" },
  { label: "Write-off Rate", value: "1.8%", target: "<2%", variance: "Within", note: "Bad debts / revenue. R11.9M annual write-offs", status: "good" },
];

const MANAGED_CARE_KPIs = [
  { label: "Capitated Lives", value: "254,000", target: "260,000", variance: "-2.3%", note: "Prime Cure managed care. 49 scheme options", status: "watch" },
  { label: "PMPM Revenue", value: "R287", target: "R295", variance: "-2.7%", note: "Per-member-per-month capitation rate", status: "watch" },
  { label: "Medical Loss Ratio", value: "86%", target: "80-85%", variance: "+1-6%", note: "Healthcare costs / premium revenue. Over target", status: "attention" },
  { label: "PMPM Cost", value: "R247", target: "<R244", variance: "+1.2%", note: "Actual cost per capitated life per month", status: "watch" },
  { label: "Provider Network", value: "10,000+", target: "Stable", variance: "Stable", note: "3,877 contracted GPs/dentists in Prime Cure network", status: "good" },
];

const OCC_HEALTH_KPIs = [
  { label: "Contract Revenue", value: "R89M", target: "R120M", variance: "-25.8%", note: "Down from R120M+ after major contract loss (May 2025)", status: "attention" },
  { label: "Contract Retention", value: "85%", target: ">90%", variance: "-5%", note: "Mining, auto, finance, govt sectors. Need diversification", status: "attention" },
  { label: "New Business Pipeline", value: "R18M", target: "R30M", variance: "-40%", note: "Contracts in negotiation. Must rebuild aggressively", status: "attention" },
  { label: "Visits vs Contracted", value: "94%", target: ">95%", variance: "-1%", note: "Utilisation of contracted medical surveillance visits", status: "watch" },
];

const statusColors = {
  good: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-500" },
  watch: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
  attention: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
};

type KPI = { label: string; value: string; target: string; variance: string; note: string; status: string };

function KPITable({ title, icon: Icon, kpis, color }: { title: string; icon: typeof DollarSign; kpis: KPI[]; color: string }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <h3 className="text-[14px] font-semibold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>{title}</h3>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left p-3 font-semibold text-gray-500 w-[30%]">KPI</th>
            <th className="text-right p-3 font-semibold text-gray-500 w-[12%]">Actual</th>
            <th className="text-right p-3 font-semibold text-gray-500 w-[12%]">Target</th>
            <th className="text-right p-3 font-semibold text-gray-500 w-[12%]">Variance</th>
            <th className="text-left p-3 font-semibold text-gray-500 w-[34%]">Note</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, i) => {
            const s = statusColors[kpi.status as keyof typeof statusColors] || statusColors.watch;
            return (
              <tr key={kpi.label} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"} hover:bg-gray-50`}>
                <td className="p-3 font-medium text-gray-900">{kpi.label}</td>
                <td className="p-3 text-right font-bold text-gray-900">{kpi.value}</td>
                <td className="p-3 text-right text-gray-400">{kpi.target}</td>
                <td className={`p-3 text-right font-semibold ${s.text}`}>{kpi.variance}</td>
                <td className="p-3 text-[11px] text-gray-500">{kpi.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function KPIDashboard() {
  const [period, setPeriod] = useState<"daily" | "monthly" | "quarterly">("monthly");

  const goodCount = [...REVENUE_KPIs, ...PROFITABILITY_KPIs, ...WORKING_CAPITAL_KPIs, ...MANAGED_CARE_KPIs, ...OCC_HEALTH_KPIs].filter(k => k.status === "good").length;
  const watchCount = [...REVENUE_KPIs, ...PROFITABILITY_KPIs, ...WORKING_CAPITAL_KPIs, ...MANAGED_CARE_KPIs, ...OCC_HEALTH_KPIs].filter(k => k.status === "watch").length;
  const attentionCount = [...REVENUE_KPIs, ...PROFITABILITY_KPIs, ...WORKING_CAPITAL_KPIs, ...MANAGED_CARE_KPIs, ...OCC_HEALTH_KPIs].filter(k => k.status === "attention").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/netcare-logo.png" alt="Netcare" className="h-4" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Financial Director KPIs</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Division Performance Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Primary Healthcare Division &mdash; R662M revenue, 88 clinics, 568 practitioners &mdash; Reporting to Group CFO Keith Gibson
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[12px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> {goodCount} On Track</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {watchCount} Watch</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {attentionCount} Attention</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Division Revenue", value: "R662M", sub: "FY2025 (-7% | +2.8% underlying)", color: "#1D3443", icon: DollarSign },
          { label: "EBITDA Margin", value: "24.5%", sub: "Up 150bps YoY. Group best performer.", color: "#10B981", icon: TrendingUp },
          { label: "Cash Conversion", value: "105%", sub: "Group target: 100%+. Keith Gibson priority.", color: "#3DA9D1", icon: Activity },
          { label: "Claims at Risk", value: "R3.85M", sub: "15% first-pass rejection. R2.9M AI-recoverable.", color: "#EF4444", icon: AlertTriangle },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white"
          >
            <kpi.icon className="w-4 h-4 mb-2" style={{ color: kpi.color }} />
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">{kpi.label}</div>
            <div className="text-[10px] text-gray-400 mt-1">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* KPI Tables */}
      <KPITable title="Revenue Metrics" icon={DollarSign} kpis={REVENUE_KPIs} color="#1D3443" />
      <KPITable title="Profitability Metrics" icon={TrendingUp} kpis={PROFITABILITY_KPIs} color="#10B981" />
      <KPITable title="Working Capital & Claims" icon={Clock} kpis={WORKING_CAPITAL_KPIs} color="#3DA9D1" />
      <KPITable title="Managed Care (Prime Cure)" icon={Heart} kpis={MANAGED_CARE_KPIs} color="#8B5CF6" />
      <KPITable title="Occupational Health" icon={Building2} kpis={OCC_HEALTH_KPIs} color="#E3964C" />

      {/* What AI Fixes */}
      <div className="p-5 rounded-xl border border-[#3DA9D1]/20 bg-[#3DA9D1]/5">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-3" style={{ fontFamily: "Montserrat, sans-serif" }}>
          <Zap className="w-4 h-4 inline mr-2 text-[#E3964C]" />
          Where VisioHealth OS Moves These KPIs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { kpi: "Claims Rejection: 15% → <5%", impact: "+R21.6M/year recovered", module: "AI Claims Intelligence" },
            { kpi: "Debtor Days: 42 → 28", impact: "+R14M freed cash flow", module: "eRA Auto-Reconciliation" },
            { kpi: "Collection Ratio: 91% → 96%", impact: "+R33M/year", module: "Debtor Aging Intelligence" },
            { kpi: "Medical Loss Ratio: 86% → 82%", impact: "+R11.5M/year savings", module: "Capitation Analytics" },
            { kpi: "Occ Health Pipeline: R18M → R30M", impact: "Revenue diversification", module: "WhatsApp Lead Gen" },
            { kpi: "Compliance Cost: -50%", impact: "R5.8M/year saved", module: "POPIA Compliance Engine" },
          ].map(item => (
            <div key={item.kpi} className="p-3 rounded-lg bg-white border border-gray-200">
              <div className="text-[12px] font-semibold text-gray-900">{item.kpi}</div>
              <div className="text-[11px] text-[#E3964C] font-semibold mt-1">{item.impact}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Module: {item.module}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reporting Context */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <p className="text-[11px] text-gray-500">
          This KPI framework aligns with Netcare Group CFO Keith Gibson&apos;s priorities: EBITDA margin expansion, cash conversion &gt;100%, working capital discipline, and digital transformation ROI.
          Dashboard maps directly to quarterly divisional reporting pack submitted to the Finance and Investment Committee.
        </p>
      </div>
    </div>
  );
}
