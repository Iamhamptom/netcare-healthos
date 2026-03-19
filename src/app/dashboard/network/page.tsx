"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, FileWarning, Activity, Users, Receipt, Shield, BarChart3,
  ArrowUpRight, ArrowDownRight, Clock, Zap, Globe, ChevronRight,
} from "lucide-react";

// ─── Netcare Primary Healthcare Division — Financial Command Center ──────
// Data modeled on real Netcare divisional reporting structure

const DIVISION_KPIs = [
  { label: "MTD Revenue", value: "R47.2M", target: "R55M", pct: 85.8, trend: "+12.3%", icon: DollarSign, color: "#3DA9D1", status: "on_track" },
  { label: "Claims Submitted", value: "34,892", target: "38,000", pct: 91.8, trend: "+8.1%", icon: Receipt, color: "#E3964C", status: "on_track" },
  { label: "Claims Rejected", value: "2,417", target: "<2,000", pct: 120.9, trend: "-3.2%", icon: FileWarning, color: "#EF4444", status: "attention" },
  { label: "Collection Ratio", value: "91.3%", target: "95%", pct: 96.1, trend: "+1.8%", icon: TrendingUp, color: "#10B981", status: "improving" },
  { label: "EBITDA Margin", value: "18.2%", target: "20%", pct: 91.0, trend: "+0.6%", icon: BarChart3, color: "#8B5CF6", status: "on_track" },
  { label: "Outstanding Debtors", value: "R8.9M", target: "<R7M", pct: 127.1, trend: "-5.4%", icon: Clock, color: "#F59E0B", status: "attention" },
];

const CLINIC_PERFORMANCE = [
  { name: "Medicross Sandton City", region: "Gauteng North", revenue: 2450000, target: 2800000, claims: 1890, rejected: 98, rejectionRate: 5.2, patients: 4250, collectionRatio: 94.1 },
  { name: "Medicross Fourways", region: "Gauteng North", revenue: 1980000, target: 2200000, claims: 1650, rejected: 132, rejectionRate: 8.0, patients: 3890, collectionRatio: 89.2 },
  { name: "Medicross Pretoria East", region: "Gauteng East", revenue: 1640000, target: 1800000, claims: 1340, rejected: 67, rejectionRate: 5.0, patients: 3120, collectionRatio: 93.8 },
  { name: "Medicross Rosebank", region: "Gauteng North", revenue: 1420000, target: 1600000, claims: 980, rejected: 45, rejectionRate: 4.6, patients: 2340, collectionRatio: 95.2 },
  { name: "Medicross Soweto", region: "Gauteng South", revenue: 1890000, target: 2000000, claims: 2890, rejected: 289, rejectionRate: 10.0, patients: 5670, collectionRatio: 86.4 },
  { name: "Prime Cure Occ Health", region: "National", revenue: 3200000, target: 3000000, claims: 2100, rejected: 42, rejectionRate: 2.0, patients: 8900, collectionRatio: 97.1 },
  { name: "Medicross Cape Town CBD", region: "Western Cape", revenue: 2100000, target: 2400000, claims: 1720, rejected: 86, rejectionRate: 5.0, patients: 4100, collectionRatio: 92.6 },
  { name: "Medicross Durban North", region: "KZN", revenue: 1560000, target: 1700000, claims: 1290, rejected: 71, rejectionRate: 5.5, patients: 2980, collectionRatio: 91.8 },
];

const TOP_REJECTION_CODES = [
  { code: "ICD-10 E11.9", desc: "Type 2 DM — missing HbA1c motivation", count: 342, value: "R1.2M", action: "Auto-attach HbA1c results to chronic claims" },
  { code: "ICD-10 Z00.0", desc: "General screening — not covered on plan", count: 287, value: "R890K", action: "Pre-check benefit limits before booking" },
  { code: "ICD-10 J06.9", desc: "Acute URTI — duplicate claim within 14 days", count: 198, value: "R420K", action: "Flag duplicate consultations in booking system" },
  { code: "ICD-10 K04.0", desc: "Dental benefits exhausted for year", count: 156, value: "R780K", action: "Alert patient of benefit status before treatment" },
  { code: "NAPPI mismatch", desc: "Pharmacy code not matching formulary", count: 134, value: "R560K", action: "Sync NAPPI codes with scheme formularies monthly" },
];

const COST_SAVINGS = [
  { area: "Claims Pre-validation AI", current: "R2.4M/month rejected", savings: "R1.8M/month recoverable", pct: 75, desc: "AI validates ICD-10, NAPPI, and benefit checks before submission — catching 75% of rejectable claims before they're sent." },
  { area: "Automated Tariff Reconciliation", current: "12 FTEs doing manual recon", savings: "R840K/month in labour", pct: 60, desc: "Automated matching of medical scheme payments to tariff schedules — replacing manual reconciliation across 88 clinics." },
  { area: "Real-time Debtor Tracking", current: "R8.9M outstanding > 60 days", savings: "R3.2M recoverable", pct: 36, desc: "AI-powered aging analysis with automated follow-up sequences — SMS, WhatsApp, and escalation workflows." },
  { area: "Capitation Utilisation Alerts", current: "Prime Cure over-cap: R1.1M", savings: "R660K/month flagged early", pct: 60, desc: "Real-time monitoring of per-member-per-month spend against capitation rates — alerting when clinics exceed thresholds." },
  { area: "POPIA Compliance Automation", current: "2 FTEs per region for audits", savings: "R480K/month in compliance labour", pct: 50, desc: "Automated consent tracking, audit logging, and breach detection across all 88 clinics — replacing manual compliance checks." },
  { area: "Pharmacy Stock Optimisation", current: "R2.1M dead stock across 37 pharmacies", savings: "R1.4M freed working capital", pct: 67, desc: "AI demand forecasting for pharmacy inventory — reducing overstocking while preventing stockouts of essential medications." },
];

const MEDICAL_SCHEMES = [
  { name: "Discovery Health", lives: 89000, claimsVolume: "R18.2M", rejectionRate: 4.8, avgDays: 14 },
  { name: "GEMS", lives: 42000, claimsVolume: "R8.6M", rejectionRate: 5.2, avgDays: 21 },
  { name: "Bonitas", lives: 31000, claimsVolume: "R6.1M", rejectionRate: 6.1, avgDays: 18 },
  { name: "Momentum Health", lives: 24000, claimsVolume: "R4.8M", rejectionRate: 5.5, avgDays: 16 },
  { name: "Medihelp", lives: 18000, claimsVolume: "R3.4M", rejectionRate: 7.3, avgDays: 24 },
  { name: "Prime Cure (capitated)", lives: 254000, claimsVolume: "R12.8M", rejectionRate: 2.0, avgDays: 7 },
  { name: "NetcarePlus (prepaid)", lives: 35000, claimsVolume: "R2.1M", rejectionRate: 0, avgDays: 0 },
];

function formatRand(n: number) {
  if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R${(n / 1000).toFixed(0)}K`;
  return `R${n.toLocaleString()}`;
}

export default function NetworkFinancialPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "clinics" | "claims" | "savings" | "schemes">("overview");

  const totalRevenue = CLINIC_PERFORMANCE.reduce((s, c) => s + c.revenue, 0);
  const totalTarget = CLINIC_PERFORMANCE.reduce((s, c) => s + c.target, 0);
  const totalClaims = CLINIC_PERFORMANCE.reduce((s, c) => s + c.claims, 0);
  const totalRejected = CLINIC_PERFORMANCE.reduce((s, c) => s + c.rejected, 0);
  const networkRejectionRate = ((totalRejected / totalClaims) * 100).toFixed(1);
  const totalSavings = COST_SAVINGS.reduce((s, c) => {
    const match = c.savings.match(/R([\d.]+)([MK])/);
    if (!match) return s;
    const val = parseFloat(match[1]) * (match[2] === "M" ? 1000000 : 1000);
    return s + val;
  }, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/netcare-logo.png" alt="Netcare" className="h-5" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Financial Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Network Financial Overview
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            88 Medicross clinics &middot; 37 pharmacies &middot; 568 practitioners &middot; 254,000 capitated lives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3DA9D1]/10 text-[#1D3443]">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">LIVE</span>
          </div>
          <span className="text-[11px] text-gray-400">March 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "overview" as const, label: "Overview", icon: BarChart3 },
          { key: "clinics" as const, label: "Clinic Performance", icon: Building2 },
          { key: "claims" as const, label: "Claims Intelligence", icon: FileWarning },
          { key: "savings" as const, label: "Cost Savings", icon: Zap },
          { key: "schemes" as const, label: "Medical Schemes", icon: Shield },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              selectedTab === tab.key ? "bg-white text-[#1D3443] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {DIVISION_KPIs.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border ${kpi.status === "attention" ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.trend.startsWith("+") ? "text-green-600" : kpi.trend.startsWith("-") && kpi.status === "attention" ? "text-green-600" : "text-red-500"}`}>
                    {kpi.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(kpi.pct, 100)}%`, backgroundColor: kpi.status === "attention" ? "#EF4444" : kpi.color }}
                  />
                </div>
                <div className="text-[9px] text-gray-400 mt-1">Target: {kpi.target}</div>
              </motion.div>
            ))}
          </div>

          {/* Two column — Revenue vs Savings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Summary */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3DA9D1]" /> Revenue by Region
              </h3>
              <div className="space-y-3">
                {["Gauteng North", "Gauteng South", "Gauteng East", "Western Cape", "KZN", "National"].map(region => {
                  const clinics = CLINIC_PERFORMANCE.filter(c => c.region === region);
                  const rev = clinics.reduce((s, c) => s + c.revenue, 0);
                  const tgt = clinics.reduce((s, c) => s + c.target, 0);
                  if (clinics.length === 0) return null;
                  return (
                    <div key={region}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-gray-700 font-medium">{region} <span className="text-gray-400">({clinics.length} {clinics.length === 1 ? "site" : "sites"})</span></span>
                        <span className="font-semibold text-gray-900">{formatRand(rev)}</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3DA9D1] rounded-full" style={{ width: `${(rev / tgt) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[13px] text-gray-500">Network Total (MTD)</span>
                <span className="text-lg font-bold text-[#1D3443]">{formatRand(totalRevenue)}</span>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="p-5 rounded-xl border border-[#E3964C]/20 bg-[#E3964C]/5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#E3964C]" /> AI Cost Savings Potential
              </h3>
              <div className="text-3xl font-bold text-[#E3964C] mb-1">{formatRand(totalSavings)}<span className="text-[13px] text-gray-500 font-normal">/month</span></div>
              <p className="text-[12px] text-gray-500 mb-4">Addressable through AI automation across 6 operational areas</p>
              <div className="space-y-2">
                {COST_SAVINGS.slice(0, 4).map(s => (
                  <div key={s.area} className="flex items-center justify-between">
                    <span className="text-[12px] text-gray-600">{s.area}</span>
                    <span className="text-[12px] font-semibold text-[#E3964C]">{s.savings}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedTab("savings")} className="mt-4 text-[12px] text-[#3DA9D1] font-semibold flex items-center gap-1 hover:underline">
                View full breakdown <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <h3 className="text-[13px] font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Financial Alerts — Requires Attention
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white border border-amber-200">
                <div className="text-[11px] text-amber-600 font-semibold uppercase">Claims Rejection Spike</div>
                <div className="text-[13px] text-gray-700 mt-1">Medicross Soweto: <span className="font-bold text-red-600">10% rejection rate</span> — double network average. ICD-10 coding errors on chronic scripts.</div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-amber-200">
                <div className="text-[11px] text-amber-600 font-semibold uppercase">Capitation Overspend</div>
                <div className="text-gray-700 text-[13px] mt-1">Prime Cure capitated patients exceeding R287 PMPM cap by <span className="font-bold text-red-600">R1.1M this month</span>. Actuarial review needed.</div>
              </div>
              <div className="p-3 rounded-lg bg-white border border-amber-200">
                <div className="text-[11px] text-amber-600 font-semibold uppercase">Debtor Aging</div>
                <div className="text-gray-700 text-[13px] mt-1"><span className="font-bold text-red-600">R3.2M</span> in claims outstanding &gt;90 days. Top debtor: GEMS (R890K, 21-day avg).</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Clinics Tab */}
      {selectedTab === "clinics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-600">Clinic</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Region</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Revenue (MTD)</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Target</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Claims</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Rejected</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Rej. Rate</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Collection</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Patients</th>
                </tr>
              </thead>
              <tbody>
                {CLINIC_PERFORMANCE.map((clinic, i) => (
                  <tr key={clinic.name} className={`border-b border-gray-100 hover:bg-gray-50/50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="p-3 font-medium text-gray-900">{clinic.name}</td>
                    <td className="p-3 text-gray-500">{clinic.region}</td>
                    <td className="p-3 text-right font-semibold">{formatRand(clinic.revenue)}</td>
                    <td className="p-3 text-right text-gray-400">{formatRand(clinic.target)}</td>
                    <td className="p-3 text-right">{clinic.claims.toLocaleString()}</td>
                    <td className="p-3 text-right text-red-600 font-medium">{clinic.rejected}</td>
                    <td className={`p-3 text-right font-semibold ${clinic.rejectionRate > 7 ? "text-red-600" : clinic.rejectionRate > 5 ? "text-amber-600" : "text-green-600"}`}>
                      {clinic.rejectionRate}%
                    </td>
                    <td className={`p-3 text-right font-semibold ${clinic.collectionRatio >= 95 ? "text-green-600" : clinic.collectionRatio >= 90 ? "text-amber-600" : "text-red-600"}`}>
                      {clinic.collectionRatio}%
                    </td>
                    <td className="p-3 text-right text-gray-600">{clinic.patients.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#1D3443] text-white font-semibold">
                  <td className="p-3" colSpan={2}>Network Total (8 of 88 clinics shown)</td>
                  <td className="p-3 text-right">{formatRand(totalRevenue)}</td>
                  <td className="p-3 text-right">{formatRand(totalTarget)}</td>
                  <td className="p-3 text-right">{totalClaims.toLocaleString()}</td>
                  <td className="p-3 text-right">{totalRejected.toLocaleString()}</td>
                  <td className="p-3 text-right">{networkRejectionRate}%</td>
                  <td className="p-3 text-right">91.3%</td>
                  <td className="p-3 text-right">35,250</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}

      {/* Claims Intelligence Tab */}
      {selectedTab === "claims" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="text-[11px] text-gray-500 uppercase font-semibold">Total Claims MTD</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">34,892</div>
              <div className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +8.1% vs prev month</div>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
              <div className="text-[11px] text-red-600 uppercase font-semibold">Rejected</div>
              <div className="text-2xl font-bold text-red-600 mt-1">2,417</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">6.9% rejection rate</div>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
              <div className="text-[11px] text-amber-600 uppercase font-semibold">Value at Risk</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">R3.85M</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">Rejected claim value</div>
            </div>
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/30">
              <div className="text-[11px] text-green-600 uppercase font-semibold">AI Preventable</div>
              <div className="text-2xl font-bold text-green-600 mt-1">R2.9M</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">75% recoverable with AI</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-[14px] font-semibold text-gray-900">Top Rejection Reasons — AI Action Plan</h3>
              <p className="text-[12px] text-gray-500">Claims rejected via MediSwitch EDI — ranked by recoverable value</p>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left p-3 font-semibold text-gray-600">Reason</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Count</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Value</th>
                  <th className="text-left p-3 font-semibold text-gray-600">AI Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {TOP_REJECTION_CODES.map((code, i) => (
                  <tr key={code.code} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="p-3 font-mono text-[12px] text-red-600 font-medium">{code.code}</td>
                    <td className="p-3 text-gray-700">{code.desc}</td>
                    <td className="p-3 text-right font-semibold">{code.count}</td>
                    <td className="p-3 text-right font-semibold text-red-600">{code.value}</td>
                    <td className="p-3 text-[12px] text-[#3DA9D1] font-medium">{code.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Cost Savings Tab */}
      {selectedTab === "savings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-5 rounded-xl border border-[#E3964C]/20 bg-gradient-to-br from-[#E3964C]/5 to-[#3DA9D1]/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Total Addressable Savings</h3>
              <span className="text-[11px] text-gray-500 uppercase font-semibold">Monthly Potential</span>
            </div>
            <div className="text-4xl font-bold text-[#E3964C]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{formatRand(totalSavings)}<span className="text-lg text-gray-400 font-normal">/month</span></div>
            <p className="text-[13px] text-gray-500 mt-1">= {formatRand(totalSavings * 12)}/year across claims, labour, compliance, and working capital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {COST_SAVINGS.map((item, i) => (
              <motion.div
                key={item.area}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-gray-200 bg-white hover:border-[#3DA9D1]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[14px] font-semibold text-gray-900">{item.area}</h4>
                  <span className="text-[12px] font-bold text-[#E3964C] bg-[#E3964C]/10 px-2 py-0.5 rounded">{item.savings}</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Current cost: {item.current}</span>
                  <span className="text-green-600 font-semibold">{item.pct}% reduction</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#3DA9D1] to-[#E3964C] rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Medical Schemes Tab */}
      {selectedTab === "schemes" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-[14px] font-semibold text-gray-900">Medical Scheme Performance — Netcare Primary Healthcare</h3>
              <p className="text-[12px] text-gray-500">Claims volume, rejection rates, and payment turnaround by scheme</p>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-600">Scheme</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Lives Covered</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Claims Volume (MTD)</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Rejection Rate</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Avg Payment (days)</th>
                </tr>
              </thead>
              <tbody>
                {MEDICAL_SCHEMES.map((scheme, i) => (
                  <tr key={scheme.name} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="p-3 font-medium text-gray-900">{scheme.name}</td>
                    <td className="p-3 text-right">{scheme.lives.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold">{scheme.claimsVolume}</td>
                    <td className={`p-3 text-right font-semibold ${scheme.rejectionRate > 6 ? "text-red-600" : scheme.rejectionRate > 4 ? "text-amber-600" : "text-green-600"}`}>
                      {scheme.rejectionRate}%
                    </td>
                    <td className={`p-3 text-right ${scheme.avgDays > 20 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                      {scheme.avgDays === 0 ? "N/A" : `${scheme.avgDays} days`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tech Stack Footer */}
      <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-[#3DA9D1]" />
          <span className="text-[12px] font-semibold text-gray-700">Connected Systems</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            "HEAL Platform (EMR)",
            "SAP IS-H (ERP)",
            "MediSwitch EDI (Claims)",
            "CareOn (Hospital EMR)",
            "A2D24 AWS (Cloud)",
            "POPIA Compliance Engine",
          ].map(sys => (
            <span key={sys} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> {sys}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
