"use client";

import { useState } from "react";
import {
  Building2, TrendingUp, Heart, Stethoscope, Globe, Users,
  ArrowRight, Target, DollarSign, BarChart3, Zap, Shield,
  Activity, Brain, Pill, CheckCircle2, ArrowUpRight, Layers
} from "lucide-react";

// Dr. Chris G. Mathew — MD Cancer Care & Business Development
// He wants: specialist claims complexity, oncology validation, expansion beyond Primary Care
// Show how the platform handles high-value multi-code cancer claims
// Business development angle: white-label for referring GP network

const BEYOND_PRIMARY_CARE = [
  {
    division: "Cancer Care",
    icon: Heart,
    color: "#EF4444",
    claims: "R2.1B",
    complexity: "Very High",
    opportunity: "Oncology claims are multi-code, multi-line, high-value. Rejection rates 12-18% due to staging codes, modifier stacking, pre-auth requirements. Our engine validates ICD-10 combinations (C-codes + Z51 + morphology), checks PMB CDL oncology coverage, and flags missing pre-authorizations.",
    scenarios: [
      "C50.9 (Breast) + Z51.1 (Chemo) + Z45.2 (Port flush) — validates full treatment protocol",
      "C34.1 (Lung) + missing staging → flags: Discovery requires T/N/M staging for oncology",
      "C61 (Prostate) + 4210 (Radical prostatectomy) → validates specialist tariff + CDL coverage",
    ],
  },
  {
    division: "Hospitals (56 facilities)",
    icon: Building2,
    color: "#3DA9D1",
    claims: "R18.4B",
    complexity: "High",
    opportunity: "Hospital claims involve DRG-like bundling, theatre time, ICU per-diem, prosthetics (NAPPI), and multi-provider billing. CareOn Bridge already translates HL7v2 from all 56 hospitals. Claims intelligence adds validation before hospital claims reach the switch.",
    scenarios: [
      "Theatre + anaesthesia + ICU bundle — validates modifier stacking and unbundling rules",
      "Prosthetic claim (NAPPI) + surgical procedure — cross-references formulary and pre-auth",
      "Multi-day admission — validates per-diem tariffs against scheme-specific limits",
    ],
  },
  {
    division: "Mental Health",
    icon: Brain,
    color: "#8B5CF6",
    claims: "R680M",
    complexity: "Medium-High",
    opportunity: "Mental health claims face unique challenges: session limits per scheme, DSM-5 to ICD-10 mapping, PMB prescribed minimum benefits for 27 CDL conditions including depression (F32) and bipolar (F31). Our engine validates session counts and PMB entitlements.",
    scenarios: [
      "F32.1 (Depression) — validates PMB CDL coverage, flags if exceeding scheme session limit",
      "F31.3 (Bipolar depressed) + psychotherapy — checks scheme allows combined treatment",
      "F41.1 (Generalized anxiety) — flags if claim exceeds allocated sessions without prior auth",
    ],
  },
  {
    division: "Pharmacy / Dispensing",
    icon: Pill,
    color: "#10B981",
    claims: "R3.2B",
    complexity: "High",
    opportunity: "487,086 NAPPI codes. SEP pricing compliance. Formulary checking across 6 schemes. Drug interaction screening (Micromedex). Chronic medication management for CDL conditions. Our engine validates every NAPPI code against scheme formularies and flags interactions.",
    scenarios: [
      "Chronic script (Tariff 0199) — validates CDL condition, NAPPI on formulary, refill interval",
      "Drug interaction: Warfarin + Ibuprofen → alerts before dispensing",
      "Generic substitution: Brand NAPPI submitted when scheme requires generic → auto-suggests",
    ],
  },
];

const REFERRAL_NETWORK = {
  gpPractices: 568,
  specialistReferrals: 24_000,
  referralLeakage: 15, // percent lost to competitors
  recoveryWithPlatform: 8, // percent recoverable
  annualValue: 28_000_000,
};

const EXPANSION_TIMELINE = [
  { phase: "Now", scope: "Primary Care (88 Medicross)", value: "R54.2M", status: "ready" },
  { phase: "Q3 2026", scope: "Cancer Care Pilot (5 centres)", value: "R12M", status: "planned" },
  { phase: "Q4 2026", scope: "Hospital Claims (10 facilities)", value: "R45M", status: "planned" },
  { phase: "2027", scope: "Full Network (all divisions)", value: "R180M+", status: "vision" },
];

export default function BusinessDevelopmentPage() {
  const [tab, setTab] = useState<"divisions" | "referrals" | "roadmap">("divisions");

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#eef6f9] via-[#f8fafc] to-[#f1f5f9] p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-2">
            <Target className="w-4 h-4" /> Business Development
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
            Beyond Primary Care — <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">Full Network Opportunity</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">How claims intelligence extends from 88 Medicross clinics to Cancer Care, Hospitals, Mental Health, and Pharmacy.</p>
        </div>

        {/* Summary Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#12232D] to-[#1D3443] text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="text-xs text-[#3DA9D1] font-bold uppercase tracking-wider mb-1">Total Addressable Claims Across Netcare</div>
              <div className="text-3xl font-black">R24.4B annual claims volume</div>
              <p className="text-sm text-white/50 mt-1">Primary Care is 2.7% of the opportunity. The real prize is the full network.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-black text-[#3DA9D1]">R54M</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Primary Care</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl font-black text-emerald-400">R180M+</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Full Network</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full p-1.5 w-max shadow-sm">
          {[
            { id: "divisions" as const, label: "Division Deep Dive", icon: Layers },
            { id: "referrals" as const, label: "Referral Network", icon: Users },
            { id: "roadmap" as const, label: "Expansion Roadmap", icon: TrendingUp },
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

        {/* DIVISIONS */}
        {tab === "divisions" && (
          <div className="space-y-6">
            {BEYOND_PRIMARY_CARE.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${d.color}10`, color: d.color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-lg font-bold text-slate-800">{d.division}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${d.color}10`, color: d.color, border: `1px solid ${d.color}20` }}>{d.claims} claims/yr</span>
                          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">Complexity: {d.complexity}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">{d.opportunity}</p>

                      <div className="mt-4 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Example Validation Scenarios</div>
                        {d.scenarios.map((s, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-slate-600 py-1.5 px-3 bg-slate-50 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="font-mono text-[11px]">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* REFERRALS */}
        {tab === "referrals" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "GP Practitioners", value: REFERRAL_NETWORK.gpPractices.toLocaleString(), color: "text-slate-800" },
                { label: "Annual Referrals", value: `${(REFERRAL_NETWORK.specialistReferrals / 1000).toFixed(0)}K`, color: "text-[#3DA9D1]" },
                { label: "Referral Leakage", value: `${REFERRAL_NETWORK.referralLeakage}%`, color: "text-red-600" },
                { label: "Recoverable Value", value: `R${(REFERRAL_NETWORK.annualValue / 1_000_000).toFixed(0)}M/yr`, color: "text-emerald-600" },
              ].map((k, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-center">
                  <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">White-Label Opportunity for Referring GPs</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">568 independent practitioners across the Medicross network refer patients to Netcare specialists and hospitals. 15% of referrals leak to competitors (Life Healthcare, Mediclinic) because GPs lack visibility into Netcare specialist availability and claims performance.</p>
              <p className="text-xs text-slate-500 leading-relaxed">By white-labeling the claims intelligence platform to referring GPs, Netcare can: (1) reduce referral leakage by giving GPs real-time Netcare specialist availability, (2) improve GP-to-specialist claims accuracy, and (3) create a sticky ecosystem where GPs prefer the Netcare network because the tools are better.</p>
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {tab === "roadmap" && (
          <div className="space-y-4">
            {EXPANSION_TIMELINE.map((p, i) => (
              <div key={i} className={`p-6 rounded-2xl border flex items-center justify-between ${
                p.status === "ready" ? "bg-emerald-50/80 border-emerald-100" :
                p.status === "planned" ? "bg-white/70 border-white/80 backdrop-blur-xl" :
                "bg-amber-50/50 border-amber-100"
              } shadow-sm`}>
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                    p.status === "ready" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "planned" ? "bg-[#3DA9D1]/10 text-[#3DA9D1]" :
                    "bg-amber-100 text-amber-700"
                  }`}>{p.phase}</div>
                  <div>
                    <div className="font-bold text-slate-800">{p.scope}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                        p.status === "planned" ? "bg-slate-50 text-slate-500 border border-slate-200" :
                        "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>{p.status}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-2xl font-black ${p.status === "ready" ? "text-emerald-600" : "text-slate-700"}`}>{p.value}</div>
              </div>
            ))}

            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#12232D] to-[#1D3443] text-white text-center">
              <div className="text-xs text-[#3DA9D1] font-bold uppercase tracking-wider mb-2">Cumulative 3-Year Opportunity</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DA9D1] to-emerald-400">R291M+</div>
              <p className="text-sm text-white/40 mt-2">Primary Care + Cancer Care + Hospitals + Full Network</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
