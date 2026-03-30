"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Building2, Users,
  AlertTriangle, Target, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, Shield, Zap, FileText
} from "lucide-react";

// Sara's executive view — financial impact across the division
const DIVISION_STATS = {
  revenue: { current: 662_000_000, previous: 712_000_000, label: "Division Revenue (FY)" },
  clinics: { count: 88, active: 85, label: "Active Clinics" },
  practitioners: { count: 568, label: "Independent Practitioners" },
  patients: { monthly: 254_000, label: "Capitated Lives" },
};

const CLINIC_DATA = [
  { name: "Medicross Sandton City", region: "Gauteng North", revenue: 2_450_000, target: 2_600_000, rejectionRate: 3.2, recoverable: 78_400, practitioners: 12, patients: 4250, trend: "up" },
  { name: "Medicross Fourways", region: "Gauteng North", revenue: 1_980_000, target: 2_100_000, rejectionRate: 4.1, recoverable: 81_180, practitioners: 9, patients: 3890, trend: "up" },
  { name: "Medicross Pretoria East", region: "Gauteng East", revenue: 1_640_000, target: 1_800_000, rejectionRate: 6.5, recoverable: 106_600, practitioners: 7, patients: 3120, trend: "down" },
  { name: "Medicross Rosebank", region: "Gauteng North", revenue: 1_420_000, target: 1_500_000, rejectionRate: 2.8, recoverable: 39_760, practitioners: 6, patients: 2340, trend: "stable" },
  { name: "Medicross Soweto", region: "Gauteng South", revenue: 2_180_000, target: 1_900_000, rejectionRate: 8.7, recoverable: 189_660, practitioners: 14, patients: 5200, trend: "down" },
  { name: "Medicross Benoni", region: "East Rand", revenue: 1_560_000, target: 1_600_000, rejectionRate: 3.8, recoverable: 59_280, practitioners: 7, patients: 2890, trend: "stable" },
  { name: "Medicross Boksburg", region: "East Rand", revenue: 1_340_000, target: 1_400_000, rejectionRate: 5.2, recoverable: 69_680, practitioners: 6, patients: 2560, trend: "down" },
  { name: "Medicross Durban North", region: "KZN", revenue: 1_780_000, target: 1_700_000, rejectionRate: 4.4, recoverable: 78_320, practitioners: 8, patients: 3450, trend: "up" },
];

const FINANCIAL_IMPACT = {
  totalRecoverable: 54_200_000,
  monthlyRejectionCost: 4_516_667,
  avgRejectionRate: 5.8,
  targetRejectionRate: 3.0,
  adminHoursWasted: 2_640,
  resubmissionCost: 12_400_000,
  cashFlowDelay: 45, // days
  cashFlowTarget: 30,
};

const QUARTERLY_TREND = [
  { quarter: "Q1 2025", rejections: 7.2, revenue: 165_000_000, recovered: 0 },
  { quarter: "Q2 2025", rejections: 6.8, revenue: 168_000_000, recovered: 0 },
  { quarter: "Q3 2025", rejections: 6.1, revenue: 164_000_000, recovered: 0 },
  { quarter: "Q4 2025", rejections: 5.8, revenue: 165_000_000, recovered: 0 },
  { quarter: "Q1 2026 (projected with AI)", rejections: 3.2, revenue: 172_000_000, recovered: 13_500_000 },
];

export default function ExecutivePage() {
  const [view, setView] = useState<"financial" | "clinics" | "strategy">("financial");

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
    return `R${n}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-[#3DA9D1] font-semibold uppercase tracking-widest mb-1">
          <Building2 className="w-4 h-4" /> Executive Dashboard
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Primary Care Division — Financial Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">Revenue impact, rejection costs, clinic performance — board-ready analytics</p>
      </div>

      {/* Top-level division stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-[#1D3443]" />
            <span className="flex items-center gap-1 text-xs text-red-500"><ArrowDownRight className="w-3 h-3" /> -7%</span>
          </div>
          <div className="text-xl font-bold text-gray-900">R662M</div>
          <div className="text-[10px] text-gray-500">Division Revenue (FY2025)</div>
        </div>
        <div className="p-4 rounded-xl border border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-600 font-bold">5.8%</span>
          </div>
          <div className="text-xl font-bold text-red-700">R54.2M</div>
          <div className="text-[10px] text-red-600">Annual Rejection Cost</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="flex items-center gap-1 text-xs text-emerald-600"><ArrowUpRight className="w-3 h-3" /> with AI</span>
          </div>
          <div className="text-xl font-bold text-emerald-700">R54.2M</div>
          <div className="text-[10px] text-emerald-600">Recoverable Revenue (AI Claims)</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700">45 → 30 days</div>
          <div className="text-[10px] text-amber-600">Cash Flow Cycle Acceleration</div>
        </div>
      </div>

      {/* The pitch number */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#1D3443] to-[#2a4f63] text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#3DA9D1] font-semibold uppercase tracking-wider mb-1">The Bottom Line</div>
            <div className="text-2xl font-bold">Revenue is down 7%. Claims intelligence recovers R54.2M.</div>
            <div className="text-sm text-white/70 mt-1">That&apos;s 8.2% of division revenue — more than enough to reverse the decline.</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-bold text-[#3DA9D1]">8.2%</div>
            <div className="text-xs text-white/60">of R662M</div>
          </div>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: "financial" as const, label: "Financial Impact", icon: DollarSign },
          { id: "clinics" as const, label: "Clinic Comparison", icon: Building2 },
          { id: "strategy" as const, label: "Strategic ROI", icon: Target },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                view === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* FINANCIAL */}
      {view === "financial" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
              <div className="text-lg font-bold text-red-600">{fmt(FINANCIAL_IMPACT.monthlyRejectionCost)}</div>
              <div className="text-[10px] text-gray-500">Monthly Rejection Cost</div>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
              <div className="text-lg font-bold text-amber-600">{FINANCIAL_IMPACT.adminHoursWasted.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">Admin Hours on Resubmissions/yr</div>
            </div>
            <div className="p-3 rounded-xl border border-gray-200 bg-white text-center">
              <div className="text-lg font-bold text-red-600">{fmt(FINANCIAL_IMPACT.resubmissionCost)}</div>
              <div className="text-[10px] text-gray-500">Resubmission Processing Cost/yr</div>
            </div>
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
              <div className="text-lg font-bold text-emerald-700">{FINANCIAL_IMPACT.targetRejectionRate}%</div>
              <div className="text-[10px] text-emerald-600">Target Rejection Rate (with AI)</div>
            </div>
          </div>

          {/* Quarterly trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quarterly Trend — Rejection Rate vs Revenue</h3>
            <div className="space-y-2">
              {QUARTERLY_TREND.map((q, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                  q.quarter.includes("projected") ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"
                }`}>
                  <div className="text-xs font-medium text-gray-900 w-48">{q.quarter}</div>
                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-center w-24">
                      <span className={q.rejections > 5 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                        {q.rejections}%
                      </span>
                      <div className="text-gray-400">rejections</div>
                    </div>
                    <div className="text-center w-24">
                      <span className="text-gray-900 font-bold">{fmt(q.revenue)}</span>
                      <div className="text-gray-400">revenue</div>
                    </div>
                    <div className="text-center w-24">
                      {q.recovered > 0 ? (
                        <span className="text-emerald-600 font-bold">+{fmt(q.recovered)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      <div className="text-gray-400">recovered</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLINICS */}
      {view === "clinics" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Clinic Performance Comparison (Top 8 by Revenue)</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-3 font-medium text-gray-500">Clinic</th>
                <th className="text-left p-3 font-medium text-gray-500">Region</th>
                <th className="text-center p-3 font-medium text-gray-500">Revenue</th>
                <th className="text-center p-3 font-medium text-gray-500">vs Target</th>
                <th className="text-center p-3 font-medium text-gray-500">Rejection %</th>
                <th className="text-center p-3 font-medium text-gray-500">Recoverable</th>
                <th className="text-center p-3 font-medium text-gray-500">Practitioners</th>
                <th className="text-center p-3 font-medium text-gray-500">Trend</th>
              </tr>
            </thead>
            <tbody>
              {CLINIC_DATA.sort((a, b) => b.revenue - a.revenue).map((c, i) => {
                const vsTarget = ((c.revenue / c.target) * 100 - 100);
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{c.name}</td>
                    <td className="p-3 text-gray-500">{c.region}</td>
                    <td className="p-3 text-center font-medium">{fmt(c.revenue)}</td>
                    <td className="p-3 text-center">
                      <span className={vsTarget >= 0 ? "text-emerald-600" : "text-red-600"}>
                        {vsTarget >= 0 ? "+" : ""}{vsTarget.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={c.rejectionRate > 6 ? "text-red-600 font-bold" : c.rejectionRate > 4 ? "text-amber-600" : "text-emerald-600"}>
                        {c.rejectionRate}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-emerald-600 font-medium">{fmt(c.recoverable)}</td>
                    <td className="p-3 text-center text-gray-600">{c.practitioners}</td>
                    <td className="p-3 text-center">
                      {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> :
                       c.trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-500 mx-auto" /> :
                       <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between text-xs text-gray-500">
            <span>Showing top 8 of 88 clinics</span>
            <span className="font-medium text-emerald-600">Total recoverable across 88: {fmt(FINANCIAL_IMPACT.totalRecoverable)}</span>
          </div>
        </div>
      )}

      {/* STRATEGY */}
      {view === "strategy" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[#3DA9D1]" />
                <h3 className="text-sm font-semibold text-gray-900">Year 1 — Pilot & Validate</h3>
              </div>
              <div className="text-2xl font-bold text-[#3DA9D1] mb-2">R13.5M</div>
              <div className="text-xs text-gray-500">projected recovery (3 pilot clinics → 20 clinics)</div>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-[#3DA9D1] mt-0.5 shrink-0" /> 3-clinic pilot (4 weeks, zero cost)</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-[#3DA9D1] mt-0.5 shrink-0" /> Validate 40%+ rejection reduction</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-[#3DA9D1] mt-0.5 shrink-0" /> Expand to 20 highest-rejection clinics</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-900">Year 2 — Scale</h3>
              </div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">R38M</div>
              <div className="text-xs text-gray-500">projected recovery (all 88 clinics)</div>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> Full 88-clinic deployment</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> CareOn + HEAL integration live</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> WhatsApp patient router network-wide</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-900">Year 3 — Transform</h3>
              </div>
              <div className="text-2xl font-bold text-amber-700 mb-2">R54M+</div>
              <div className="text-xs text-gray-500">full operational intelligence</div>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Predictive rejection prevention</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> Automated FHIR-based data exchange</li>
                <li className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" /> NHI readiness achieved</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Investment vs Return</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-2 text-gray-500">Year</th>
                  <th className="text-center p-2 text-gray-500">Investment</th>
                  <th className="text-center p-2 text-gray-500">Recovery</th>
                  <th className="text-center p-2 text-gray-500">Net Benefit</th>
                  <th className="text-center p-2 text-gray-500">ROI</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="p-2 font-medium">Year 1 (pilot + 20 clinics)</td>
                  <td className="p-2 text-center text-red-600">R2.4M</td>
                  <td className="p-2 text-center text-emerald-600">R13.5M</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">+R11.1M</td>
                  <td className="p-2 text-center font-bold text-emerald-700">463%</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="p-2 font-medium">Year 2 (all 88 clinics)</td>
                  <td className="p-2 text-center text-red-600">R4.8M</td>
                  <td className="p-2 text-center text-emerald-600">R38M</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">+R33.2M</td>
                  <td className="p-2 text-center font-bold text-emerald-700">692%</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Year 3 (full intelligence)</td>
                  <td className="p-2 text-center text-red-600">R5.2M</td>
                  <td className="p-2 text-center text-emerald-600">R54M+</td>
                  <td className="p-2 text-center text-emerald-700 font-bold">+R48.8M</td>
                  <td className="p-2 text-center font-bold text-emerald-700">938%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
