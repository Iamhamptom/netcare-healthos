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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#eef6f9] via-[#f8fafc] to-[#f1f5f9] p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3DA9D1]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3DA9D1] uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
            <Building2 className="w-4 h-4" /> <span>Executive Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
            Primary Care <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D3443] to-[#3DA9D1]">Financial Intelligence</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl text-sm leading-relaxed">
            Revenue impact, AI-driven claim recovery, and clinic-level performance analytics dynamically synthesized for board-level review.
          </p>
        </div>

        {/* Top-level division stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(30,52,67,0.12)] group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 ease-out fill-mode-both">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-slate-100/80 text-slate-600 group-hover:bg-[#1D3443] group-hover:text-white transition-colors duration-300">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100"><ArrowDownRight className="w-3 h-3" /> -7%</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight drop-shadow-sm">R662M</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Division Revenue (FY25)</div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-red-100/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(239,68,68,0.15)] group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ease-out fill-mode-both">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-red-600 px-2.5 py-1 bg-white rounded-full border border-red-100 shadow-sm">5.8% avg</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-black text-red-600 tracking-tight drop-shadow-sm">R54.2M</div>
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Annual Rejection Cost</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/50 backdrop-blur-xl border border-emerald-200/50 shadow-[0_4px_24px_-8px_rgba(16,185,129,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(16,185,129,0.25)] group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ease-out fill-mode-both">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-white text-emerald-700 border border-emerald-100 shadow-sm"><ArrowUpRight className="w-3 h-3" /> via AI</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight drop-shadow-sm">R54.2M</div>
              <div className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest">Recoverable Revenue</div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-amber-100/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(245,158,11,0.15)] group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250 ease-out fill-mode-both">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight drop-shadow-sm flex items-center gap-1">45 <ArrowDownRight className="w-4 h-4 text-amber-400 mx-0.5" /> 30 d</div>
              <div className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Cash Cycle Accelerated</div>
            </div>
          </div>
        </div>

        {/* The Pitch Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#12232D] shadow-[0_20px_40px_-15px_rgba(29,52,67,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-out fill-mode-both border border-white/10 group">
          {/* Decorative background effects for deep rich look */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1D3443]/80 via-transparent to-[#2A4A5D]/50 pointer-events-none" />
          <div className="absolute top-0 right-0 p-32 bg-[radial-gradient(circle,_rgba(61,169,209,0.25)_0%,_transparent_60%)] opacity-80 blur-2xl pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1D3443]/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-full text-[11px] font-bold text-[#8be0ff] uppercase tracking-[0.2em] backdrop-blur-md">
                <Target className="w-3.5 h-3.5" /> The Bottom Line
              </div>
              <h2 className="text-3xl md:text-[40px] font-light text-white leading-[1.2]">
                Revenue is down <span className="font-bold text-red-400">7%</span>.<br/> 
                Claims intelligence recovers <span className="font-extrabold text-[#3DA9D1] drop-shadow-[0_0_15px_rgba(61,169,209,0.6)]">R54.2M</span>.
              </h2>
              <p className="text-[15px] text-[#94a3b8] font-medium leading-relaxed max-w-xl">
                That equates to <span className="text-white font-bold">8.2% of total division revenue</span> — more than enough to completely offset current market headwinds and structurally lower administrative costs.
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-center lg:items-end justify-center w-full lg:w-auto p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-500 shadow-inner">
              <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#3DA9D1] to-[#a5e8ff] drop-shadow-[0_2px_15px_rgba(61,169,209,0.4)]">
                8.2%
              </div>
              <div className="text-xs font-bold text-[#64748b] uppercase tracking-[0.25em] mt-3">of R662M Pipeline</div>
            </div>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex bg-white/60 backdrop-blur-xl border border-white/80 rounded-full p-1.5 w-max shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ease-out fill-mode-both relative">
          {[
            { id: "financial" as const, label: "Financial Impact", icon: DollarSign },
            { id: "clinics" as const, label: "Division Performance", icon: Building2 },
            { id: "strategy" as const, label: "Transformation ROI", icon: Target },
          ].map(t => {
            const Icon = t.icon;
            const isActive = view === t.id;
            return (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`flex-1 min-w-[180px] px-6 py-3 rounded-full text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2.5 z-10 relative uppercase tracking-wider ${
                  isActive ? "text-[#1D3443] shadow-[0_2px_15px_rgba(0,0,0,0.08)] bg-white border border-slate-100" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}>
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#3DA9D1]" : ""}`} /> 
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 ease-out fill-mode-both pb-12">
          {/* FINANCIAL VIEW */}
          {view === "financial" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] text-center transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-colors group-hover:bg-red-500/10"></div>
                  <div className="text-3xl lg:text-[32px] font-black text-slate-800 drop-shadow-sm mb-1.5 relative z-10">{fmt(FINANCIAL_IMPACT.monthlyRejectionCost)}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Monthly Rejection Cost</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] text-center transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-colors group-hover:bg-amber-500/10"></div>
                  <div className="text-3xl lg:text-[32px] font-black text-amber-600 drop-shadow-sm mb-1.5 relative z-10">{FINANCIAL_IMPACT.adminHoursWasted.toLocaleString()} h</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Admin Hours Wasted/yr</div>
                </div>
                <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] text-center transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -ml-16 -mb-16 transition-colors group-hover:bg-red-500/10"></div>
                  <div className="text-3xl lg:text-[32px] font-black text-red-600 drop-shadow-sm mb-1.5 relative z-10">{fmt(FINANCIAL_IMPACT.resubmissionCost)}</div>
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest relative z-10">Resubmission Cost/yr</div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 backdrop-blur-xl border border-emerald-200/60 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.2)] text-center transition-all hover:-translate-y-1 hover:shadow-[0_16px_50px_-12px_rgba(16,185,129,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_0%,_transparent_70%)] opacity-50" />
                  <div className="text-4xl lg:text-[40px] font-black text-emerald-600 drop-shadow-sm mb-1.5 relative z-10">{FINANCIAL_IMPACT.targetRejectionRate}%</div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.2em] relative z-10">Target AI Rejection Rate</div>
                </div>
              </div>

              {/* Quarterly trend */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] p-2">
                <div className="p-6 pb-5 border-b border-slate-100/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#1D3443] tracking-wide">
                    <BarChart3 className="w-5 h-5 text-[#3DA9D1]" /> QUARTERLY VELOCITY MATRIX: REJECTION VS REVENUE
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  {QUARTERLY_TREND.map((q, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 px-6 rounded-2xl transition-all duration-300 ${
                      q.quarter.includes("projected") 
                        ? "bg-gradient-to-r from-emerald-50/90 to-teal-50/60 border border-emerald-100/60 shadow-md relative overflow-hidden group hover:shadow-lg" 
                        : "hover:bg-slate-50/80 border border-transparent"
                    }`}>
                      {q.quarter.includes("projected") && (
                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-200/20 to-transparent mix-blend-overlay pointer-events-none" />
                      )}
                      
                      <div className="text-[13px] font-bold text-slate-800 w-48 relative z-10 flex items-center gap-3 tracking-wide">
                        {q.quarter}
                        {q.quarter.includes("projected") && (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-8 md:gap-20 text-sm relative z-10">
                        <div className="text-center w-28">
                          <span className={`text-[22px] font-black tracking-tight ${q.rejections > 5 ? "text-red-500" : "text-emerald-600"}`}>
                            {q.rejections}%
                          </span>
                          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">Rejections</div>
                        </div>
                        <div className="text-center w-32 border-l border-r border-slate-200/50 px-4">
                          <span className="text-[22px] text-slate-800 font-black tracking-tight drop-shadow-sm">{fmt(q.revenue)}</span>
                          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">Revenue</div>
                        </div>
                        <div className="text-center w-32">
                          {q.recovered > 0 ? (
                            <span className="text-[22px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-sm">
                              +{fmt(q.recovered)}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-bold text-[22px]">—</span>
                          )}
                          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">AI Recovered</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CLINICS VIEW */}
          {view === "clinics" && (
            <div className="bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 bg-white/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-[#1D3443] flex items-center gap-2 tracking-wide uppercase">
                    <Building2 className="w-5 h-5 text-[#3DA9D1]" /> Division Performance Matrix <span className="text-slate-400 font-medium ml-1 normal-case">(Top 8 of 88 Facilities)</span>
                  </h3>
                  <div className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 rounded-full border border-emerald-100/80 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    TOTAL RECOVERABLE YTD: <span className="text-emerald-600 font-black text-[13px]">{fmt(FINANCIAL_IMPACT.totalRecoverable)}</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/60">
                      <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Facility Matrix</th>
                      <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Region Zone</th>
                      <th className="text-right py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">FY25 Revenue</th>
                      <th className="text-center py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Target Var</th>
                      <th className="text-center py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Rejection Rate</th>
                      <th className="text-right py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-emerald-600">AI Recoverable</th>
                      <th className="text-center py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {CLINIC_DATA.sort((a, b) => b.revenue - a.revenue).map((c, i) => {
                      const vsTarget = ((c.revenue / c.target) * 100 - 100);
                      const isHighRejection = c.rejectionRate > 6;
                      return (
                        <tr key={i} className="group hover:bg-white transition-colors duration-300">
                          <td className="py-5 px-6">
                            <div className="font-extrabold text-[#1D3443] tracking-tight">{c.name}</div>
                            <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-wider">
                              <Users className="w-3 h-3 text-[#3DA9D1]" /> {c.practitioners} PRAC • {c.patients.toLocaleString()} LIVES
                            </div>
                          </td>
                          <td className="py-5 px-6 text-slate-500 font-bold text-[13px]">{c.region}</td>
                          <td className="py-5 px-6 text-right font-black text-slate-800 text-[15px]">{fmt(c.revenue)}</td>
                          <td className="py-5 px-6 text-center">
                            <span className={`inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full ${vsTarget >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                              {vsTarget >= 0 ? "+" : ""}{vsTarget.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <div className={`font-black tracking-tight text-[15px] px-3 py-1.5 inline-flex justify-center rounded-xl min-w-[70px] ${isHighRejection ? "bg-red-50 text-red-600 border border-red-100 shadow-sm" : "bg-slate-50/80 text-slate-700"}`}>
                              {c.rejectionRate}%
                            </div>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <span className="font-black text-[15px] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 drop-shadow-sm">
                              {fmt(c.recoverable)}
                            </span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex justify-center items-center h-full">
                              {c.trend === "up" ? (
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 shadow-sm group-hover:scale-110 transition-transform"><TrendingUp className="w-4 h-4" /></div>
                              ) : c.trend === "down" ? (
                                <div className="p-2 bg-red-50 rounded-xl text-red-500 shadow-sm group-hover:scale-110 transition-transform"><TrendingDown className="w-4 h-4" /></div>
                              ) : (
                                <div className="p-2 bg-slate-50 rounded-xl text-slate-400 flex items-center justify-center w-8 h-8">—</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STRATEGY VIEW */}
          {view === "strategy" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Y1 */}
                <div className="p-10 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#3DA9D1]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#3DA9D1]/20 transition-colors duration-500 pointer-events-none" />
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3.5 bg-[#3DA9D1]/10 rounded-2xl text-[#3DA9D1] group-hover:bg-[#3DA9D1] group-hover:text-white transition-colors duration-500 shadow-sm">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-[#3DA9D1] uppercase tracking-[0.25em]">Phase 1</h3>
                      <div className="text-[22px] font-extrabold text-[#1D3443] tracking-tight">Pilot & Validate</div>
                    </div>
                  </div>
                  <div className="text-[44px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] mb-2 drop-shadow-sm">R13.5M</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-6 border-b border-slate-100/80 mb-6">Recovered (20 Clinics)</div>
                  <ul className="space-y-4 text-[13px] text-slate-600 font-semibold tracking-wide relative z-10">
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-[#3DA9D1]/10 text-[#3DA9D1]"><Zap className="w-3 h-3" /></div> 3-clinic pilot (4 weeks, zero cost)</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-[#3DA9D1]/10 text-[#3DA9D1]"><Zap className="w-3 h-3" /></div> Validate 40%+ rejection reduction</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-[#3DA9D1]/10 text-[#3DA9D1]"><Zap className="w-3 h-3" /></div> Expand to 20 highest-rejection sites</li>
                  </ul>
                </div>

                {/* Y2 */}
                <div className="p-10 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_-12px_rgba(16,185,129,0.08)] relative overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.2)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.25em]">Phase 2</h3>
                      <div className="text-[22px] font-extrabold text-slate-800 tracking-tight">Network Scale</div>
                    </div>
                  </div>
                  <div className="text-[44px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-teal-500 mb-2 drop-shadow-sm">R38M</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-6 border-b border-slate-100/80 mb-6">Recovered (Network-Wide)</div>
                  <ul className="space-y-4 text-[13px] text-slate-600 font-semibold tracking-wide relative z-10">
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-emerald-50 text-emerald-600 border border-emerald-100"><Zap className="w-3 h-3" /></div> Full 88-clinic deployment</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-emerald-50 text-emerald-600 border border-emerald-100"><Zap className="w-3 h-3" /></div> CareOn + HEAL integration live</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-emerald-50 text-emerald-600 border border-emerald-100"><Zap className="w-3 h-3" /></div> WhatsApp patient router active</li>
                  </ul>
                </div>

                {/* Y3 */}
                <div className="p-10 rounded-[28px] bg-gradient-to-br from-amber-50/80 to-white/60 backdrop-blur-xl border border-amber-200/60 shadow-[0_12px_40px_-12px_rgba(245,158,11,0.12)] relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.3)] transition-all duration-500 scale-[1.03] z-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
                  
                  <div className="absolute top-4 right-6 pointer-events-none">
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-400 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-md">
                      Ultimate End-State
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3.5 bg-white shadow-md border border-amber-100 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-500">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.25em]">Phase 3</h3>
                      <div className="text-[22px] font-extrabold text-[#1D3443] tracking-tight">Transformation</div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <div className="text-[44px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500 drop-shadow-sm">R54.2M</div>
                    <div className="text-xl font-black text-amber-500/80">+</div>
                  </div>
                  <div className="text-xs font-bold text-amber-700/60 uppercase tracking-widest pb-6 border-b border-amber-200/50 mb-6">Optimized Operational Sync</div>
                  <ul className="space-y-4 text-[13px] text-amber-900/80 font-bold tracking-wide relative z-10">
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-white shadow-sm text-amber-500"><Zap className="w-3 h-3" /></div> Predictive rejection prevention</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-white shadow-sm text-amber-500"><Zap className="w-3 h-3" /></div> Automated FHIR data exchange</li>
                    <li className="flex items-center gap-3"><div className="rounded-full p-1 bg-white shadow-sm text-amber-500"><Zap className="w-3 h-3" /></div> SA NHI structural readiness</li>
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
