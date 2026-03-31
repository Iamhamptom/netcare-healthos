"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Zap, Shield, Brain, FileText, Activity, TrendingUp,
  Send, Search, DollarSign, BarChart3, Clock, AlertCircle,
  CheckCircle2, XCircle, Upload, Building2, Heart, Lock,
  Eye, Database, Layers, ArrowRight, ArrowDown, Sparkles,
  RefreshCw, FileUp, Pill, Users, Globe, Server, Code2,
  CircuitBoard, ChevronRight, Award, Cpu, Target, GitBranch,
  Workflow, ShieldCheck, KeyRound, BookOpen, Scale, Landmark,
  Banknote, CalendarClock, MailCheck, Receipt, ClipboardCheck,
  Stethoscope, HeartPulse, Timer, AlertTriangle, BadgeCheck,
  FileDown, Table2, Gauge, BrainCircuit, Router,
} from "lucide-react";
import Link from "next/link";

// ─── Animation Helpers ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3DA9D1]/20 to-transparent" />
      <div className="mx-4 w-2 h-2 rounded-full bg-[#3DA9D1]/30" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#3DA9D1]/20 to-transparent" />
    </div>
  );
}

// ─── SECTION 1: Hero ────────────────────────────────────────────

function HeroSection() {
  const stats = [
    { value: "22", label: "Lib Modules" },
    { value: "15", label: "API Endpoints" },
    { value: "4", label: "AI Engines" },
    { value: "6,500+", label: "Lines of Code" },
  ];

  return (
    <Section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D3443] via-[#1A2F3E] to-[#152736] p-8 md:p-12 mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "32px 32px",
      }} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3DA9D1]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E3964C]/8 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#3DA9D1]" />
          <span className="text-[11px] font-semibold text-[#3DA9D1] tracking-wide uppercase">VisioCorp Research Labs &times; Netcare Health OS</span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Healthbridge AI
          <span className="bg-gradient-to-r from-[#3DA9D1] to-[#E3964C] bg-clip-text text-transparent"> Claims Engine</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg text-white/60 max-w-2xl mb-10 leading-relaxed">
          The most advanced medical aid claims integration ever built for South Africa.
          AI-powered coding, multi-switch routing, PMB detection, and real-time analytics &mdash;
          unified in a single platform.
        </motion.p>

        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

// ─── SECTION 2: The Problem ─────────────────────────────────────

function ProblemSection() {
  const problems = [
    { icon: Banknote, value: "R40 Billion", label: "Paid out-of-pocket by members annually from denied or rejected medical aid claims", color: "#EF4444" },
    { icon: AlertTriangle, value: "R3 – R10", label: "Cost per failed EDI claim transaction — adds up to millions across large hospital groups", color: "#F59E0B" },
    { icon: FileText, value: "30%", label: "Of claim disputes involve incomplete or incorrect documentation submitted by practices", color: "#E3964C" },
    { icon: CalendarClock, value: "120 Days", label: "Submission deadline — miss it and the practice permanently loses that revenue", color: "#EF4444" },
    { icon: TrendingUp, value: "15 – 20%", label: "Of potential revenue lost by average practices to claim rejections and admin errors", color: "#F97316" },
    { icon: Clock, value: "45+ Min", label: "Average time per claim dispute — manual follow-up, resubmission, phone calls to schemes", color: "#8B5CF6" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 mb-3">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">The SA Healthcare Billing Crisis</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">Why This Matters: The Financial Impact</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          South African healthcare practices are haemorrhaging revenue through preventable claim failures.
          The existing billing infrastructure was built for a pre-digital era.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {problems.map((p) => (
          <motion.div
            key={p.value}
            variants={fadeUp}
            className="rounded-xl glass-panel p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}12` }}>
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: p.color }}>{p.value}</div>
                <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed mt-1">{p.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── SECTION 3: Architecture Flow ───────────────────────────────

function ArchitectureSection() {
  const layers = [
    { label: "Clinical Notes", sub: "Doctor consultation input", icon: Stethoscope, color: "#3DA9D1", bg: "#3DA9D1" },
    { label: "AI Autofill", sub: "ICD-10 + CPT coding", icon: BrainCircuit, color: "#3DA9D1", bg: "#3DA9D1" },
    { label: "Claim Form", sub: "Structured PHISC fields", icon: FileText, color: "#3DA9D1", bg: "#3DA9D1" },
    { label: "Validator", sub: "20+ pre-submission rules", icon: ShieldCheck, color: "#10B981", bg: "#10B981" },
    { label: "PMB / CDL Check", sub: "271 PMB + 26 CDL conditions", icon: HeartPulse, color: "#10B981", bg: "#10B981" },
    { label: "Rejection Predictor", sub: "AI probability scoring", icon: Brain, color: "#8B5CF6", bg: "#8B5CF6" },
    { label: "Switch Router", sub: "Scheme → correct switch", icon: Router, color: "#E3964C", bg: "#E3964C" },
    { label: "XML Builder", sub: "PHISC-compliant XML + retry logic", icon: Code2, color: "#E3964C", bg: "#E3964C" },
    { label: "Switch API", sub: "Healthbridge / MediSwitch / MediKredit", icon: Send, color: "#E3964C", bg: "#E3964C" },
    { label: "Safe XML Parser", sub: "XXE-safe response parsing", icon: Shield, color: "#EF4444", bg: "#EF4444" },
    { label: "Claim Status Update", sub: "State machine transition", icon: RefreshCw, color: "#10B981", bg: "#10B981" },
    { label: "Audit Log + Encryption", sub: "AES-256-GCM at rest", icon: Lock, color: "#EF4444", bg: "#EF4444" },
    { label: "eRA Fetch", sub: "Idempotent reconciliation", icon: Database, color: "#3DA9D1", bg: "#3DA9D1" },
    { label: "Scheme Analytics", sub: "Per-scheme performance", icon: BarChart3, color: "#E3964C", bg: "#E3964C" },
    { label: "AI Follow-ups", sub: "30 / 60 / 90 / 120-day escalation", icon: Timer, color: "#8B5CF6", bg: "#8B5CF6" },
    { label: "CSV Export", sub: "Board report generation", icon: FileDown, color: "#E3964C", bg: "#E3964C" },
  ];

  const colorLabels = [
    { color: "#3DA9D1", label: "AI & Data" },
    { color: "#E3964C", label: "Switching & Analytics" },
    { color: "#10B981", label: "Validation" },
    { color: "#8B5CF6", label: "Intelligence" },
    { color: "#EF4444", label: "Security" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 mb-3">
          <Workflow className="w-3.5 h-3.5 text-[#3DA9D1]" />
          <span className="text-[11px] font-semibold text-[#3DA9D1] uppercase tracking-wide">System Architecture</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">How It Works: End-to-End Flow</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          From clinical notes to board report &mdash; every claim passes through 16 stages of validation,
          AI enrichment, switching, and analytics.
        </p>
      </motion.div>

      {/* Color legend */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-6">
        {colorLabels.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">{c.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Flow */}
      <div className="relative">
        {layers.map((step, i) => (
          <motion.div key={step.label} variants={fadeUp}>
            <div className="flex items-center gap-3 mb-1">
              {/* Connector line */}
              {i > 0 && (
                <div className="absolute ml-[19px] -mt-[30px] w-px h-[14px]" style={{ backgroundColor: `${step.bg}30` }} />
              )}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative z-10"
                style={{ backgroundColor: `${step.bg}12`, border: `1px solid ${step.bg}25` }}
              >
                <step.icon className="w-4.5 h-4.5" style={{ color: step.color }} />
              </div>
              <div className="flex-1 rounded-lg glass-panel px-4 py-2.5 flex items-center justify-between group hover:shadow-sm transition-shadow">
                <div>
                  <div className="text-[13px] font-semibold text-[var(--ivory)]">{step.label}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{step.sub}</div>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ backgroundColor: `${step.bg}10`, color: step.color }}>
                  Step {i + 1}
                </div>
              </div>
            </div>
            {i < layers.length - 1 && (
              <div className="flex items-center ml-[15px] py-0.5">
                <ArrowDown className="w-3 h-3 text-[var(--text-secondary)] opacity-30" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── SECTION 4: 17 Capabilities ─────────────────────────────────

function CapabilitiesSection() {
  const capabilities = [
    { icon: Send, title: "Real-time Claim Submission", desc: "Submit to 3 switches — Healthbridge, MediSwitch, MediKredit", color: "#3DA9D1" },
    { icon: ShieldCheck, title: "Pre-submission Validation", desc: "20+ rules catch errors before they become rejections", color: "#10B981" },
    { icon: HeartPulse, title: "PMB Auto-detection", desc: "271 Prescribed Minimum Benefit conditions flagged automatically", color: "#EF4444" },
    { icon: Activity, title: "CDL Chronic Detection", desc: "26 Chronic Disease List conditions identified from ICD-10 codes", color: "#8B5CF6" },
    { icon: BrainCircuit, title: "AI ICD-10 + CPT Coding", desc: "AI-powered clinical note analysis for accurate coding", color: "#3DA9D1" },
    { icon: Sparkles, title: "Clinical Notes Autofill", desc: "Natural language to structured claim — one-click from consultation", color: "#3DA9D1" },
    { icon: Brain, title: "AI Rejection Predictor", desc: "Pre-submission probability scoring — fix issues before they reject", color: "#8B5CF6" },
    { icon: MailCheck, title: "Smart Follow-up Generator", desc: "AI-drafted appeal letters with scheme-specific regulatory citations", color: "#8B5CF6" },
    { icon: Router, title: "Multi-switch Routing", desc: "Intelligent routing to Healthbridge, MediSwitch, or MediKredit per scheme", color: "#E3964C" },
    { icon: Pill, title: "NAPPI Medicine Lookup", desc: "Real-time medicine search with Single Exit Price + dispensing fees", color: "#10B981" },
    { icon: BadgeCheck, title: "Eligibility Verification", desc: "Real-time member and benefit check before submission", color: "#3DA9D1" },
    { icon: Database, title: "eRA Auto-reconciliation", desc: "Idempotent remittance advice fetch and claim matching", color: "#E3964C" },
    { icon: BarChart3, title: "Scheme-specific Analytics", desc: "Per-scheme acceptance rates, rejection patterns, payment trends", color: "#E3964C" },
    { icon: Timer, title: "Claims Aging Reports", desc: "30 / 60 / 90 / 120+ day buckets with escalation workflows", color: "#F59E0B" },
    { icon: DollarSign, title: "Patient Cost Estimation", desc: "Real-time gap cover and out-of-pocket calculation for patients", color: "#10B981" },
    { icon: Upload, title: "Batch CSV Upload", desc: "Upload and submit up to 500 claims at once with validation", color: "#E3964C" },
    { icon: FileDown, title: "CSV Data Export", desc: "Export claims, analytics, and aging data for board reports", color: "#E3964C" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">17 Integrated Capabilities</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">Everything a Practice Needs. Nothing Left Out.</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          Every capability is built in-house, fully integrated, and available from day one.
          No bolt-on modules, no extra licensing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.title}
            variants={fadeUp}
            className="rounded-xl glass-panel p-4 hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${cap.color}12` }}>
              <cap.icon className="w-4.5 h-4.5" style={{ color: cap.color }} />
            </div>
            <div className="text-[13px] font-semibold text-[var(--ivory)] mb-1">{cap.title}</div>
            <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{cap.desc}</div>
            <div className="mt-2 text-[10px] font-mono text-[var(--text-secondary)] opacity-50">#{String(i + 1).padStart(2, "0")}</div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── SECTION 5: Competitive Comparison ──────────────────────────

function ComparisonSection() {
  type Status = "yes" | "no" | "partial";
  const features: { feature: string; us: Status; goodx: Status; nova: Status; elixir: Status }[] = [
    { feature: "Pre-submission validation (20+ rules)", us: "yes", goodx: "partial", nova: "partial", elixir: "no" },
    { feature: "AI ICD-10 + CPT coding", us: "yes", goodx: "no", nova: "no", elixir: "no" },
    { feature: "PMB auto-detection (271 conditions)", us: "yes", goodx: "no", nova: "partial", elixir: "no" },
    { feature: "NAPPI API with SEP pricing", us: "yes", goodx: "partial", nova: "yes", elixir: "partial" },
    { feature: "Per-scheme analytics dashboard", us: "yes", goodx: "no", nova: "partial", elixir: "no" },
    { feature: "Claims aging (30/60/90/120+)", us: "yes", goodx: "partial", nova: "yes", elixir: "partial" },
    { feature: "Patient cost estimation + gap cover", us: "yes", goodx: "no", nova: "no", elixir: "no" },
    { feature: "Batch CSV upload (500 claims)", us: "yes", goodx: "no", nova: "partial", elixir: "no" },
    { feature: "Multi-switch routing", us: "yes", goodx: "partial", nova: "no", elixir: "partial" },
    { feature: "AI rejection predictor", us: "yes", goodx: "no", nova: "no", elixir: "no" },
    { feature: "AI follow-up & appeal generator", us: "yes", goodx: "no", nova: "no", elixir: "no" },
    { feature: "eRA auto-reconciliation", us: "yes", goodx: "partial", nova: "yes", elixir: "partial" },
    { feature: "CDL chronic disease detection", us: "yes", goodx: "no", nova: "no", elixir: "no" },
  ];

  function StatusCell({ status }: { status: Status }) {
    if (status === "yes") return <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />;
    if (status === "no") return <XCircle className="w-4 h-4 text-red-400 mx-auto" />;
    return <div className="mx-auto w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /></div>;
  }

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 mb-3">
          <Target className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">Competitive Advantage</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">How We Compare</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          Feature-by-feature comparison against the leading practice management and switching solutions in South Africa.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-[12px] font-semibold text-[var(--ivory)]">Feature</th>
                <th className="text-center py-3 px-3 text-[12px] font-semibold text-[#3DA9D1] min-w-[100px]">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Visio Health OS</span>
                    <span className="text-[9px] font-normal text-[#3DA9D1]/60">Healthbridge AI</span>
                  </div>
                </th>
                <th className="text-center py-3 px-3 text-[12px] font-medium text-[var(--text-secondary)] min-w-[80px]">GoodX</th>
                <th className="text-center py-3 px-3 text-[12px] font-medium text-[var(--text-secondary)] min-w-[80px]">
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Healthbridge</span>
                    <span className="text-[9px] font-normal text-[var(--text-secondary)]">Nova</span>
                  </div>
                </th>
                <th className="text-center py-3 px-3 text-[12px] font-medium text-[var(--text-secondary)] min-w-[80px]">Elixir Live</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.feature} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/30" : ""}`}>
                  <td className="py-2.5 px-4 text-[12px] text-[var(--ivory)] font-medium">{f.feature}</td>
                  <td className="py-2.5 px-3 bg-[#3DA9D1]/[0.03]"><StatusCell status={f.us} /></td>
                  <td className="py-2.5 px-3"><StatusCell status={f.goodx} /></td>
                  <td className="py-2.5 px-3"><StatusCell status={f.nova} /></td>
                  <td className="py-2.5 px-3"><StatusCell status={f.elixir} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /><span className="text-[10px] text-[var(--text-secondary)]">Full support</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-amber-400 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-amber-400" /></div><span className="text-[10px] text-[var(--text-secondary)]">Partial</span></div>
          <div className="flex items-center gap-1.5"><XCircle className="w-3 h-3 text-red-400" /><span className="text-[10px] text-[var(--text-secondary)]">Not available</span></div>
        </div>
      </motion.div>
    </Section>
  );
}

// ─── SECTION 6: Netcare Specific ────────────────────────────────

function NetcareSection() {
  const metrics = [
    { icon: Building2, label: "88 Medicross Clinics", value: "~50 claims/day each", sub: "4,400 claims/day total capacity", color: "#3DA9D1" },
    { icon: Stethoscope, label: "CareOn EMR Integration", value: "One-click claim", sub: "Submit directly from consultation screen", color: "#10B981" },
    { icon: BarChart3, label: "Centralized Analytics", value: "All 88 clinics", sub: "Scheme performance across entire network", color: "#E3964C" },
    { icon: Shield, label: "POPIA Compliance", value: "Full audit trail", sub: "AES-256 encryption, data retention policies", color: "#EF4444" },
    { icon: Landmark, label: "NHI Readiness", value: "DRG-capable", sub: "Architecture ready for National Health Insurance", color: "#8B5CF6" },
    { icon: Receipt, label: "Revenue Recovery", value: "R12 – R18M/yr", sub: "Estimated at 15% rejection prevention across 88 clinics", color: "#10B981" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 mb-3">
          <Building2 className="w-3.5 h-3.5 text-[#3DA9D1]" />
          <span className="text-[11px] font-semibold text-[#3DA9D1] uppercase tracking-wide">For Netcare Specifically</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">Built for Netcare Scale</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          Purpose-built for the Medicross primary care network &mdash; from single-clinic workflows
          to group-wide analytics and NHI readiness.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <motion.div key={m.label} variants={fadeUp} className="rounded-xl glass-panel p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}12` }}>
                <m.icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--ivory)]">{m.label}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{m.value}</div>
              </div>
            </div>
            <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Impact Highlight */}
      <motion.div variants={fadeUp} className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-emerald-800 mb-1">Revenue Impact Projection</div>
            <div className="text-[12px] text-emerald-700 leading-relaxed">
              At a conservative 15% rejection prevention rate across 88 Medicross clinics processing ~4,400 claims/day,
              the estimated annual revenue recovery is <span className="font-bold">R12 &ndash; R18 million</span>. This
              excludes additional savings from reduced admin time, faster payment cycles, and lower per-claim EDI costs.
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

// ─── SECTION 7: VisioCorp Innovation ────────────────────────────

function VisiocorpSection() {
  const techStack = [
    { label: "Next.js 16", icon: Globe, desc: "App Router + RSC" },
    { label: "Prisma ORM", icon: Database, desc: "Type-safe data layer" },
    { label: "TypeScript", icon: Code2, desc: "Strict mode, end-to-end" },
    { label: "VRL AI Engine", icon: BrainCircuit, desc: "ICD-10 / CPT coding" },
    { label: "PHISC XML", icon: FileText, desc: "SA standard protocol" },
    { label: "AES-256-GCM", icon: Lock, desc: "Encryption at rest" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-br from-[#1D3443] via-[#1A2F3E] to-[#152736] p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E3964C]/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#3DA9D1]/8 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E3964C]/10 border border-[#E3964C]/20 mb-4">
            <Award className="w-3.5 h-3.5 text-[#E3964C]" />
            <span className="text-[11px] font-semibold text-[#E3964C] uppercase tracking-wide">VisioCorp Research Labs</span>
          </motion.div>

          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-white mb-3">
            The First AI-Native Healthcare Switching Integration in South Africa
          </motion.h2>

          <motion.div variants={fadeUp} className="space-y-3 mb-8">
            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
              VisioCorp operates as a chairman&rsquo;s operating system &mdash; a unified intelligence layer
              that connects AI, analytics, and automation across every business vertical. The Healthbridge
              AI Claims Engine is the healthcare arm of this system.
            </p>
            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
              No external vendor has achieved this combination: <span className="text-white/80 font-medium">AI-powered coding +
              multi-switch routing + real-time analytics + regulatory compliance</span> &mdash; unified in a single,
              white-label platform built from the ground up in South Africa, for South Africa.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {techStack.map((t) => (
              <div key={t.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
                <t.icon className="w-5 h-5 text-[#3DA9D1] mx-auto mb-2" />
                <div className="text-[12px] font-semibold text-white">{t.label}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{t.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </Section>
  );
}

// ─── SECTION 8: Security & Compliance ───────────────────────────

function SecuritySection() {
  const items = [
    { icon: Shield, title: "POPIA Health Data Compliance", desc: "Full compliance with the Protection of Personal Information Act, including March 2026 health-specific regulations. Consent tracking, data subject access requests, and purpose limitation.", color: "#10B981" },
    { icon: Lock, title: "AES-256-GCM Encryption", desc: "All sensitive claim data encrypted at rest using AES-256-GCM with per-record unique initialisation vectors. Keys managed via secure environment variables.", color: "#3DA9D1" },
    { icon: BookOpen, title: "HPCSA Booklet 9 Audit Trail", desc: "Complete audit logging of every claim action — creation, modification, submission, status change. Full traceability for HPCSA and CMS audit requirements.", color: "#8B5CF6" },
    { icon: Workflow, title: "Claim State Machine", desc: "Enforced state transitions prevent fraudulent or accidental claim status changes. Only valid transitions are permitted (e.g., draft → submitted, never paid → draft).", color: "#E3964C" },
    { icon: ShieldCheck, title: "XXE-Safe XML Parsing", desc: "Custom XML parser with entity expansion disabled, external DTD resolution blocked, and configurable maximum document depth. Prevents XML injection attacks.", color: "#EF4444" },
    { icon: ClipboardCheck, title: "Input Validation (20+ Rules)", desc: "Every field validated before submission: ICD-10 format, CPT ranges, NAPPI checksums, date logic, amount limits, member number patterns, and dependency codes.", color: "#10B981" },
    { icon: Database, title: "CMS 6-Year Data Retention", desc: "Claims data retained for the Council for Medical Schemes mandated 6-year period. Automated archival policies with compliant deletion workflows.", color: "#3DA9D1" },
    { icon: Scale, title: "King IV Governance Ready", desc: "Architecture supports King IV corporate governance reporting — board-level analytics, risk registers, and compliance dashboards for listed entities.", color: "#E3964C" },
  ];

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Security & Compliance</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">Enterprise-Grade Security. Full Regulatory Compliance.</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          Built for regulated healthcare environments. Every layer designed for POPIA, HPCSA, CMS, and King IV requirements.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            className="rounded-xl glass-panel p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}12` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--ivory)] mb-1">{item.title}</div>
                <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ─── SECTION 9: Roadmap ─────────────────────────────────────────

function RoadmapSection() {
  const milestones = [
    { quarter: "Q2 2026", title: "MediKredit Switch Accreditation", desc: "Complete accreditation process for MediKredit switching — expanding to all three major SA healthcare switches.", icon: Router, color: "#3DA9D1", status: "upcoming" as const },
    { quarter: "Q3 2026", title: "FHIR R4 Bridge for HNSF", desc: "HL7 FHIR R4 interoperability bridge for Health Normative Standards Framework compliance. Future-proofing for international health data exchange.", icon: GitBranch, color: "#10B981", status: "planned" as const },
    { quarter: "Q4 2026", title: "NHI DRG Reimbursement Engine", desc: "Diagnosis-Related Group (DRG) pricing engine for National Health Insurance submissions. Ready for NHI rollout.", icon: Landmark, color: "#8B5CF6", status: "planned" as const },
    { quarter: "2027", title: "Fraud Detection AI", desc: "Machine learning model trained on historical claim patterns to flag suspicious submissions, duplicate billing, and upcoding.", icon: Eye, color: "#EF4444", status: "future" as const },
    { quarter: "2027", title: "WhatsApp Patient Cost Communicator", desc: "Automated WhatsApp messages to patients with real-time cost estimates, gap cover calculations, and payment plan options.", icon: Users, color: "#E3964C", status: "future" as const },
  ];

  const statusColors = {
    upcoming: { bg: "bg-[#3DA9D1]/10", text: "text-[#3DA9D1]", dot: "bg-[#3DA9D1]" },
    planned: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
    future: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  };

  return (
    <Section className="mb-8">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 mb-3">
          <Gauge className="w-3.5 h-3.5 text-[#3DA9D1]" />
          <span className="text-[11px] font-semibold text-[#3DA9D1] uppercase tracking-wide">Product Roadmap</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--ivory)]">What&apos;s Next</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl">
          Continuous development to stay ahead of regulatory changes and expand platform capabilities.
        </p>
      </motion.div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-[#3DA9D1]/30 via-purple-300/30 to-gray-200/30" />

        <div className="min-h-screen bg-[#0f1721] space-y-4">
          {milestones.map((m, i) => {
            const sc = statusColors[m.status];
            return (
              <motion.div key={m.title} variants={fadeUp} className="flex items-start gap-4 relative">
                {/* Timeline dot */}
                <div className={`w-10 h-10 rounded-full ${sc.bg} flex items-center justify-center shrink-0 relative z-10 border-2 border-white`}>
                  <m.icon className="w-4.5 h-4.5" style={{ color: m.color }} />
                </div>

                <div className="flex-1 rounded-xl glass-panel p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.text} px-2 py-0.5 rounded-full ${sc.bg}`}>
                      {m.quarter}
                    </span>
                  </div>
                  <div className="text-[14px] font-semibold text-[var(--ivory)] mb-1">{m.title}</div>
                  <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{m.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────

export default function HealthbridgeAboutPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] mb-6">
        <Link href="/dashboard" className="hover:text-[var(--ivory)] transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/dashboard/healthbridge" className="hover:text-[var(--ivory)] transition-colors">Healthbridge</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[var(--ivory)] font-medium">About</span>
      </div>

      <HeroSection />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <ArchitectureSection />
      <SectionDivider />
      <CapabilitiesSection />
      <SectionDivider />
      <ComparisonSection />
      <SectionDivider />
      <NetcareSection />
      <SectionDivider />
      <VisiocorpSection />
      <SectionDivider />
      <SecuritySection />
      <SectionDivider />
      <RoadmapSection />

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-gradient-to-r from-[#1D3443] to-[#1A2F3E] p-8 text-center relative overflow-hidden mb-4"
      >
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }} />
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Transform Claims Processing?</h3>
          <p className="text-sm text-white/50 mb-6 max-w-lg mx-auto">
            Schedule a demo with the VisioCorp team to see the Healthbridge AI Claims Engine in action
            with your clinic&apos;s data.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/healthbridge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3DA9D1] text-white text-sm font-medium hover:bg-[#3DA9D1]/90 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Open Claims Engine
            </Link>
            <Link
              href="/dashboard/bridge"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.1] transition-colors"
            >
              <Activity className="w-4 h-4" />
              View Switch Status
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
