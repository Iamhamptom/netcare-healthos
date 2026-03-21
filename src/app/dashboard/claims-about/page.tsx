"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Upload,
  Brain,
  FileCheck,
  ArrowRight,
  Calculator,
  Lock,
  Shield,
  Eye,
  Clock,
  UserCheck,
  Layers,
  Cpu,
  Database,
  Globe,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  TrendingUp,
  Building2,
} from "lucide-react";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Financial Impact Calculator Logic ─── */
function useCalculator() {
  const [claimsPerMonth, setClaimsPerMonth] = useState(500);
  const [avgClaimValue, setAvgClaimValue] = useState(800);
  const [rejectionRate, setRejectionRate] = useState(15);

  const monthlyRevAtRisk = claimsPerMonth * avgClaimValue * (rejectionRate / 100);
  const recoveryRate = 0.85;
  const estimatedRecovery = monthlyRevAtRisk * recoveryRate;
  const annualSavings = estimatedRecovery * 12;
  const networkClinics = 88;
  const networkAnnual = annualSavings * networkClinics;

  return {
    claimsPerMonth, setClaimsPerMonth,
    avgClaimValue, setAvgClaimValue,
    rejectionRate, setRejectionRate,
    monthlyRevAtRisk,
    estimatedRecovery,
    annualSavings,
    networkAnnual,
  };
}

function formatRand(n: number): string {
  if (n >= 1_000_000_000) return `R${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
  return `R${n.toFixed(0)}`;
}

/* ─── Page ─── */
export default function ClaimsAboutPage() {
  const calc = useCalculator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">

        {/* ═══════════════════════════════════════════════════════
            1. HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center space-y-8"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              <Sparkles className="w-3.5 h-3.5" />
              Built by Visio Research Labs
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-5xl font-bold text-[#1D3443] leading-tight"
          >
            Claims Intelligence Engine
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Pre-submission validation that catches rejections before they cost you money
          </motion.p>

          {/* Big stat boxes */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto pt-4"
          >
            {[
              { value: "427", label: "ICD-10 Codes", color: "from-teal-500 to-cyan-500" },
              { value: "276", label: "Tariff Codes", color: "from-blue-500 to-indigo-500" },
              { value: "7", label: "Scheme Profiles", color: "from-violet-500 to-purple-500" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                <p className="text-3xl font-bold text-[#1D3443]">{stat.value}</p>
                <p className="text-[13px] text-slate-400 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            2. HOW IT WORKS — 3-step flow
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-[#1D3443] text-center">
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 items-start">
            {[
              {
                step: 1,
                title: "Upload",
                desc: "Upload your claims CSV or connect Healthbridge EDI",
                icon: Upload,
                color: "bg-teal-500",
              },
              {
                step: 2,
                title: "Analyze",
                desc: "13 core rules + tariff validation + scheme-specific checks + AI suggestions",
                icon: Brain,
                color: "bg-blue-500",
              },
              {
                step: 3,
                title: "Fix",
                desc: "Auto-correct high-confidence issues, download corrected CSV, track improvements",
                icon: FileCheck,
                color: "bg-emerald-500",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                custom={i + 1}
                className="flex flex-col items-center text-center px-6 relative"
              >
                {/* Connector line (between step 1-2 and 2-3) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px">
                    <div className="w-full h-px bg-gradient-to-r from-slate-200 to-slate-300 relative">
                      <ArrowRight className="w-4 h-4 text-slate-300 absolute -right-2 -top-2" />
                    </div>
                  </div>
                )}
                {/* Numbered circle */}
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-lg shadow-${step.color}/20 mb-4`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[12px] font-bold text-slate-500 -mt-2 mb-3 relative z-10">
                  {step.step}
                </div>
                <h3 className="text-[15px] font-semibold text-[#1D3443] mb-1">{step.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed max-w-[240px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            3. FINANCIAL IMPACT CALCULATOR
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-[#1D3443] text-center">
            Financial Impact Calculator
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-[13px] text-slate-400 text-center max-w-lg mx-auto">
            Adjust the inputs below to see the potential revenue recovery for your practice and the Netcare 88-clinic network.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* Inputs */}
              <div className="p-8 space-y-6">
                <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Your Practice Inputs
                </h3>
                {[
                  { label: "Claims per month", value: calc.claimsPerMonth, setter: calc.setClaimsPerMonth, min: 50, max: 5000, step: 50 },
                  { label: "Average claim value (R)", value: calc.avgClaimValue, setter: calc.setAvgClaimValue, min: 100, max: 5000, step: 50 },
                  { label: "Current rejection rate (%)", value: calc.rejectionRate, setter: calc.setRejectionRate, min: 1, max: 40, step: 1 },
                ].map((input) => (
                  <div key={input.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] text-slate-600 font-medium">{input.label}</label>
                      <span className="text-[14px] font-bold text-[#1D3443] tabular-nums">
                        {input.label.includes("(R)") ? `R${input.value}` : input.label.includes("(%)") ? `${input.value}%` : input.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => input.setter(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-500
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Outputs */}
              <div className="p-8 bg-gradient-to-br from-slate-50 to-teal-50/30 space-y-5">
                <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Projected Recovery
                </h3>
                {[
                  { label: "Monthly revenue at risk", value: formatRand(calc.monthlyRevAtRisk), color: "text-red-500" },
                  { label: "Estimated recovery (85%)", value: formatRand(calc.estimatedRecovery), color: "text-teal-600" },
                  { label: "Annual savings (per clinic)", value: formatRand(calc.annualSavings), color: "text-emerald-600" },
                ].map((output) => (
                  <div key={output.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-[13px] text-slate-500">{output.label}</span>
                    <span className={`text-[18px] font-bold tabular-nums ${output.color}`}>{output.value}</span>
                  </div>
                ))}

                {/* Network total */}
                <div className="mt-4 p-4 rounded-xl bg-[#1D3443] text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">88 Clinics Network-Wide</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{formatRand(calc.networkAnnual)}</p>
                  <p className="text-[12px] text-white/50 mt-0.5">Estimated annual recovery across Netcare PHC</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            4. VALIDATION RULES BREAKDOWN
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-[#1D3443] text-center">
            Validation Rules Breakdown
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "ICD-10 Core",
                count: "13 rules",
                example: "E11 \u2192 E11.9 (auto-specificity)",
                icon: CheckCircle2,
                color: "text-teal-500",
                bg: "bg-teal-50",
                border: "border-teal-100",
              },
              {
                title: "Tariff Cross-Validation",
                count: "276 codes",
                example: "Unbundling: 0190 + 0290 same day",
                icon: Layers,
                color: "text-blue-500",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                title: "Scheme-Specific",
                count: "7 schemes",
                example: "Discovery / GEMS / Bonitas / Medshield rules",
                icon: Shield,
                color: "text-violet-500",
                bg: "bg-violet-50",
                border: "border-violet-100",
              },
              {
                title: "AI-Powered Suggestions",
                count: "Gemini + Claude",
                example: "AI suggests the right ICD-10 code from notes",
                icon: Brain,
                color: "text-amber-500",
                bg: "bg-amber-50",
                border: "border-amber-100",
              },
              {
                title: "Auto-Correction",
                count: "Deterministic",
                example: "High-confidence fixes applied automatically",
                icon: Zap,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
              },
              {
                title: "Pattern Learning",
                count: "Adaptive",
                example: "Learns from your historical rejections over time",
                icon: BarChart3,
                color: "text-rose-500",
                bg: "bg-rose-50",
                border: "border-rose-100",
              },
            ].map((rule, i) => (
              <motion.div
                key={rule.title}
                variants={fadeUp}
                custom={i + 1}
                className={`rounded-2xl border ${rule.border} ${rule.bg} p-6 space-y-3`}
              >
                <div className="flex items-center gap-3">
                  <rule.icon className={`w-5 h-5 ${rule.color}`} />
                  <h3 className="text-[14px] font-semibold text-[#1D3443]">{rule.title}</h3>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-white/70 text-[11px] font-semibold text-slate-500 border border-white">
                  {rule.count}
                </span>
                <p className="text-[12px] text-slate-500 leading-relaxed italic">&ldquo;{rule.example}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            5. ARCHITECTURE DIAGRAM
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-[#1D3443] text-center">
            System Architecture
          </motion.h2>

          <motion.div variants={fadeUp} custom={1} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between gap-3">
              {/* Dashboard Layer */}
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white text-center shadow-lg">
                  <Globe className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[13px] font-bold">Dashboard</p>
                  <p className="text-[10px] text-white/70 mt-1">Next.js Frontend</p>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-medium">React + Tailwind</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-px bg-slate-200" />
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span className="text-[9px] text-slate-300 font-medium">REST</span>
              </div>

              {/* API Layer */}
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white text-center shadow-lg">
                  <Server className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[13px] font-bold">API Layer</p>
                  <p className="text-[10px] text-white/70 mt-1">Route Handlers + Auth</p>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-medium">JWT + Rate Limit</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-px bg-slate-200" />
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span className="text-[9px] text-slate-300 font-medium">Validate</span>
              </div>

              {/* Engine Layer */}
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white text-center shadow-lg">
                  <Cpu className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[13px] font-bold">Engine Layer</p>
                  <p className="text-[10px] text-white/70 mt-1">Rules + AI + Tariffs</p>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-medium">13 Rules + Gemini/Claude</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-16 h-px bg-slate-200" />
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span className="text-[9px] text-slate-300 font-medium">Store</span>
              </div>

              {/* Database */}
              <div className="flex-1 space-y-2">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white text-center shadow-lg">
                  <Database className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[13px] font-bold">Database</p>
                  <p className="text-[10px] text-white/70 mt-1">SQLite + Prisma</p>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-medium">Claims + Analyses</div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            6. SECURITY & POPIA COMPLIANCE
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-[#1D3443] text-center">
            Security &amp; POPIA Compliance
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Lock, label: "JWT Authentication", desc: "Secure token-based access" },
              { icon: Shield, label: "Rate Limiting", desc: "API abuse prevention" },
              { icon: Eye, label: "PII Anonymization", desc: "Patient data protected" },
              { icon: UserCheck, label: "POPIA Consent Gate", desc: "Explicit consent required" },
              { icon: Clock, label: "12-Month Retention", desc: "Automated data lifecycle" },
              { icon: FileCheck, label: "Audit Trail", desc: "Every action logged" },
              { icon: Layers, label: "Role-Based Access", desc: "admin / receptionist / doctor" },
              { icon: ShieldCheck, label: "Middleware Protection", desc: "Request validation layer" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                custom={i + 1}
                className="rounded-xl bg-white border border-slate-100 p-5 space-y-2 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto">
                  <item.icon className="w-5 h-5 text-[#1D3443]" />
                </div>
                <p className="text-[13px] font-semibold text-[#1D3443]">{item.label}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            7. VISIOCORP INNOVATION SECTION
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="space-y-8"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#152736] p-10 text-white space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Built by Visio Research Labs</h2>
                <p className="text-[12px] text-white/60">VisioCorp Innovation Division</p>
              </div>
            </div>

            <p className="text-[14px] text-white/60 leading-relaxed max-w-3xl">
              This tool represents VisioCorp&apos;s commitment to building practical AI that solves real
              problems in African healthcare. Rather than chasing theoretical innovation, we focused on
              the single highest-impact problem: claims rejections that drain revenue from every clinic,
              every month.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                "First SA-built ICD-10-ZA pre-submission validator",
                "AI-powered coding assistance (Gemini + Claude dual-provider)",
                "Scheme-specific rule engine covering 85%+ of SA medical scheme members",
                "Healthbridge EDI native integration",
                "Pattern learning that gets smarter with every analysis",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 1}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-white/70 leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>

            {/* Netcare badge */}
            <div className="pt-6 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white/60">Designed for Netcare Primary Healthcare</p>
                  <p className="text-[11px] text-white/70">88 clinics across South Africa</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

      </div>
    </div>
  );
}
