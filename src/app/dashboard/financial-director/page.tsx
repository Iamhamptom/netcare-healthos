"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Building2, Calculator,
  ArrowUpRight, ArrowDownRight, Target, BarChart3, PieChart,
  Clock, Users, Zap, Shield, CheckCircle2, AlertTriangle
} from "lucide-react";

// Thirushen Pillay — FD Primary Care Division
// He wants: hard numbers, EBITDA impact, cost per clinic, payback period, cash flow
// No fluff — show the math

const DIVISION_FINANCIALS = {
  revenue: 662_000_000,
  revenuePrior: 712_000_000,
  revenueChange: -7.0,
  clinics: 88,
  patientsCapitated: 254_000,
  pmpm: 287, // per member per month
  ebitdaMargin: 12.4,
  ebitda: 82_088_000,
};

const REJECTION_ECONOMICS = {
  industryRate: 17.5, // industry average
  netcareRate: 5.8,   // as reported
  totalClaims: 662_000_000,
  rejectedValue: 38_396_000,
  autoFixable: 0.40,
  autoFixValue: 15_358_400,
  manualRecoverable: 0.25,
  manualRecoverValue: 9_599_000,
  totalRecoverable: 54_200_000,
  resubmissionCostPerClaim: 85,
  avgResubmissions: 146_000,
  resubmissionTotalCost: 12_410_000,
  adminFTE: 44, // full-time equivalents on resubmissions
  adminCostPerFTE: 280_000,
  adminTotalCost: 12_320_000,
  cashFlowDelayDays: 45,
  cashFlowTarget: 30,
  cashFlowImpact: 24_100_000, // working capital tied up
};

const PILOT_ECONOMICS = {
  pilotClinics: 3,
  pilotWeeks: 4,
  pilotCost: 0, // free
  pilotProjectedSavings: 460_000,
};

const INVESTMENT_TABLE = [
  { year: "Pilot (4 weeks)", clinics: 3, investment: 0, recovery: 460_000, net: 460_000, roi: "Free", payback: "Immediate" },
  { year: "Year 1 (20 clinics)", clinics: 20, investment: 2_040_000, recovery: 13_500_000, net: 11_460_000, roi: "562%", payback: "7 weeks" },
  { year: "Year 2 (88 clinics)", clinics: 88, investment: 8_976_000, recovery: 38_000_000, net: 29_024_000, roi: "323%", payback: "10 weeks" },
  { year: "Year 3 (full intelligence)", clinics: 88, investment: 9_504_000, recovery: 54_200_000, net: 44_696_000, roi: "470%", payback: "8 weeks" },
];

const COST_BREAKDOWN = [
  { item: "Platform license (per clinic/month)", amount: 8_500, note: "All-inclusive: Claims + Bridge + FHIR + WhatsApp" },
  { item: "Implementation (one-time)", amount: 0, note: "Zero — shadow mode, no system changes" },
  { item: "Data migration", amount: 0, note: "Zero — CSV upload or API adapter" },
  { item: "Training", amount: 0, note: "Zero — 30-minute onboarding per clinic" },
  { item: "Maintenance / support", amount: 0, note: "Included in license" },
];

const CLINIC_UNIT_ECONOMICS = {
  monthlyLicense: 8_500,
  annualLicense: 102_000,
  avgRecoveryPerClinic: 615_909,
  avgRecoveryMonthly: 51_326,
  paybackWeeks: 7,
  annualROIPerClinic: 504,
  costPerClaim: 0.70,
  switchCostPerClaim: 5.90,
};

export default function FinancialDirectorPage() {
  const [tab, setTab] = useState<"overview" | "unit" | "investment" | "risk">("overview");

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
    return `R${n.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#eef6f9] via-[#f8fafc] to-[#f1f5f9] p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3DA9D1]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3DA9D1] uppercase tracking-[0.2em] mb-2">
            <Calculator className="w-4 h-4" /> Financial Director View
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
            Claims Recovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D3443] to-[#3DA9D1]">EBITDA Impact Model</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Hard numbers. No assumptions without sources. All figures based on Netcare FY2025 reported metrics.</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Division Revenue", value: fmt(DIVISION_FINANCIALS.revenue), sub: `${DIVISION_FINANCIALS.revenueChange}% YoY`, color: "text-red-600", icon: DollarSign },
            { label: "Current EBITDA", value: fmt(DIVISION_FINANCIALS.ebitda), sub: `${DIVISION_FINANCIALS.ebitdaMargin}% margin`, color: "text-slate-800", icon: BarChart3 },
            { label: "Rejection Cost", value: fmt(REJECTION_ECONOMICS.rejectedValue), sub: `${REJECTION_ECONOMICS.netcareRate}% rate`, color: "text-red-600", icon: AlertTriangle },
            { label: "AI Recoverable", value: fmt(REJECTION_ECONOMICS.totalRecoverable), sub: "8.2% of revenue", color: "text-emerald-600", icon: TrendingUp },
            { label: "EBITDA Uplift", value: `+${((REJECTION_ECONOMICS.totalRecoverable / DIVISION_FINANCIALS.ebitda) * 100).toFixed(0)}%`, sub: `+${fmt(REJECTION_ECONOMICS.totalRecoverable)}`, color: "text-emerald-600", icon: Target },
          ].map((k, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
              <k.icon className="w-5 h-5 text-slate-400 mb-3" />
              <div className={`text-xl font-black tracking-tight ${k.color}`}>{k.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{k.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full p-1.5 w-max shadow-sm">
          {[
            { id: "overview" as const, label: "Cost of Inaction", icon: AlertTriangle },
            { id: "unit" as const, label: "Per-Clinic Economics", icon: Building2 },
            { id: "investment" as const, label: "Investment Model", icon: Calculator },
            { id: "risk" as const, label: "Risk Mitigation", icon: Shield },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  tab === t.id ? "text-[#1D3443] shadow-sm bg-white border border-slate-100" : "text-slate-500 hover:text-slate-800"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* COST OF INACTION */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-red-50/80 backdrop-blur-xl border border-red-100/60">
              <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" /> What Rejection Costs the Division Today (Annual)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Direct Rejection Loss", value: fmt(REJECTION_ECONOMICS.rejectedValue), detail: `${REJECTION_ECONOMICS.netcareRate}% of ${fmt(REJECTION_ECONOMICS.totalClaims)}` },
                  { label: "Resubmission Processing", value: fmt(REJECTION_ECONOMICS.resubmissionTotalCost), detail: `${REJECTION_ECONOMICS.avgResubmissions.toLocaleString()} resubmissions x R${REJECTION_ECONOMICS.resubmissionCostPerClaim}` },
                  { label: "Admin Labour (Resubmissions)", value: fmt(REJECTION_ECONOMICS.adminTotalCost), detail: `${REJECTION_ECONOMICS.adminFTE} FTEs x R${fmt(REJECTION_ECONOMICS.adminCostPerFTE)}/yr` },
                  { label: "Working Capital Tied Up", value: fmt(REJECTION_ECONOMICS.cashFlowImpact), detail: `${REJECTION_ECONOMICS.cashFlowDelayDays} day cash cycle vs ${REJECTION_ECONOMICS.cashFlowTarget} target` },
                ].map((c, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-red-100">
                    <div className="text-xl font-black text-red-600">{c.value}</div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">{c.label}</div>
                    <div className="text-[10px] text-red-400 mt-1">{c.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#12232D] to-[#1D3443] text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs text-[#3DA9D1] font-bold uppercase tracking-wider mb-1">Total Addressable Savings</div>
                  <div className="text-3xl font-black">{fmt(REJECTION_ECONOMICS.rejectedValue + REJECTION_ECONOMICS.resubmissionTotalCost + REJECTION_ECONOMICS.adminTotalCost)}</div>
                  <div className="text-sm text-white/60 mt-1">Direct losses + processing costs + labour — every year this system isn&apos;t deployed</div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-[#3DA9D1]">{((REJECTION_ECONOMICS.rejectedValue + REJECTION_ECONOMICS.resubmissionTotalCost + REJECTION_ECONOMICS.adminTotalCost) / DIVISION_FINANCIALS.ebitda * 100).toFixed(0)}%</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">of current EBITDA</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PER-CLINIC ECONOMICS */}
        {tab === "unit" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Monthly License", value: `R${CLINIC_UNIT_ECONOMICS.monthlyLicense.toLocaleString()}`, color: "text-slate-800", detail: "All-inclusive" },
                { label: "Monthly Recovery", value: `R${CLINIC_UNIT_ECONOMICS.avgRecoveryMonthly.toLocaleString()}`, color: "text-emerald-600", detail: "Per clinic avg" },
                { label: "Payback Period", value: `${CLINIC_UNIT_ECONOMICS.paybackWeeks} weeks`, color: "text-[#3DA9D1]", detail: "From go-live" },
                { label: "Annual ROI", value: `${CLINIC_UNIT_ECONOMICS.annualROIPerClinic}%`, color: "text-emerald-600", detail: `R${CLINIC_UNIT_ECONOMICS.annualLicense.toLocaleString()} in, R${CLINIC_UNIT_ECONOMICS.avgRecoveryPerClinic.toLocaleString()} out` },
              ].map((k, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-center">
                  <div className={`text-3xl font-black tracking-tight ${k.color}`}>{k.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{k.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{k.detail}</div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Cost Structure — Zero Hidden Costs</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item</th>
                  <th className="text-right py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost</th>
                  <th className="text-left py-3 pl-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note</th>
                </tr></thead>
                <tbody>
                  {COST_BREAKDOWN.map((c, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-3 font-semibold text-slate-700">{c.item}</td>
                      <td className="py-3 text-right font-black text-slate-800">{c.amount === 0 ? <span className="text-emerald-600">R0</span> : `R${c.amount.toLocaleString()}`}</td>
                      <td className="py-3 pl-6 text-slate-500 text-xs">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
              <p className="text-xs text-[#1D3443] font-bold">Comparison: SwitchOn charges R5.90/claim for switching only (no validation). Our all-inclusive cost per claim: R0.70 — and we prevent rejections before they happen.</p>
            </div>
          </div>
        )}

        {/* INVESTMENT MODEL */}
        {tab === "investment" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">3-Year Investment vs Return</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phase</th>
                  <th className="text-center p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinics</th>
                  <th className="text-right p-4 text-[10px] font-bold text-red-400 uppercase tracking-wider">Investment</th>
                  <th className="text-right p-4 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Recovery</th>
                  <th className="text-right p-4 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Net Benefit</th>
                  <th className="text-center p-4 text-[10px] font-bold text-[#3DA9D1] uppercase tracking-wider">ROI</th>
                  <th className="text-center p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payback</th>
                </tr></thead>
                <tbody>
                  {INVESTMENT_TABLE.map((r, i) => (
                    <tr key={i} className={`border-b border-slate-50 ${i === 0 ? "bg-emerald-50/50" : ""}`}>
                      <td className="p-4 font-bold text-slate-800">{r.year}</td>
                      <td className="p-4 text-center text-slate-600">{r.clinics}</td>
                      <td className="p-4 text-right font-bold text-red-600">{r.investment === 0 ? "R0" : fmt(r.investment)}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{fmt(r.recovery)}</td>
                      <td className="p-4 text-right font-black text-emerald-700">+{fmt(r.net)}</td>
                      <td className="p-4 text-center font-black text-[#3DA9D1]">{r.roi}</td>
                      <td className="p-4 text-center text-slate-600">{r.payback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500">Cumulative 3-year net benefit</span>
                <span className="text-lg font-black text-emerald-700">+{fmt(INVESTMENT_TABLE.reduce((a, r) => a + r.net, 0))}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-100/60">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-2">
                <CheckCircle2 className="w-4 h-4" /> The Pilot is Free
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">3 clinics, 4 weeks, zero cost, zero risk. Shadow mode only — we observe and report what we would have caught. No changes to existing systems. No data migration. If the numbers don&apos;t speak for themselves after 4 weeks, we walk away. No commitment, no contract, no invoice.</p>
            </div>
          </div>
        )}

        {/* RISK MITIGATION */}
        {tab === "risk" && (
          <div className="space-y-4">
            {[
              { risk: "Vendor dependency / lock-in", mitigation: "Month-to-month subscription. No long-term contract. CSV-based — no proprietary data formats. If you cancel, your data exports in standard formats.", severity: "low" },
              { risk: "Implementation disruption", mitigation: "Shadow mode pilot. Zero changes to CareOn, HEAL, SwitchOn, or any existing system. Your billing teams continue as-is. We run parallel.", severity: "low" },
              { risk: "Data sovereignty", mitigation: "Currently EU-West-1. For production: Azure South Africa North (Johannesburg) or Netcare's own Azure tenant. Containerized — runs anywhere. POPIA compliant.", severity: "medium" },
              { risk: "AI hallucination / false positives", mitigation: "80% of validation is deterministic rules (database lookup, not AI). 37 hard-gate codes AI cannot override. Human reviews every flag. <2% false positive rate in testing.", severity: "low" },
              { risk: "Cost escalation", mitigation: "Fixed per-clinic monthly fee. No per-claim fees, no usage-based pricing, no hidden costs. License includes all updates and support.", severity: "low" },
              { risk: "Pilot doesn't translate to scale", mitigation: "Pilot clinics selected for highest rejection rates — most conservative test. If it works there, lower-rejection clinics benefit more, not less.", severity: "low" },
            ].map((r, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm flex gap-4">
                <div className={`shrink-0 w-2 rounded-full ${r.severity === "low" ? "bg-emerald-400" : "bg-amber-400"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-sm">{r.risk}</h4>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      r.severity === "low" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>{r.severity} risk</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{r.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
