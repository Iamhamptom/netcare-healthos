"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain, Database, Shield, Activity, FileCheck, Network,
  Heart, MessageCircle, ArrowDown, CheckCircle2,
  Clock, DollarSign, Target, BarChart3, Layers, Globe,
  Stethoscope,
} from "lucide-react";

function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId: number;
    let time = 0;
    const resize = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; ctx.scale(2, 2); };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const w = canvas.offsetWidth; const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h); time += 0.003;
      const spacing = 60;
      ctx.strokeStyle = "rgba(61, 169, 209, 0.04)"; ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += spacing) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let i = 0; i < 12; i++) {
        const x = (Math.sin(time + i * 1.7) * 0.3 + 0.5) * w;
        const y = (Math.cos(time * 0.7 + i * 2.1) * 0.3 + 0.5) * h;
        const r = 2 + Math.sin(time * 2 + i) * 1;
        const alpha = 0.15 + Math.sin(time + i) * 0.1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(227, 150, 76, ${alpha})` : `rgba(61, 169, 209, ${alpha})`; ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Data ──────────────────────────────────────────────────────────────

const KNOWLEDGE_BASE = [
  { label: "ICD-10 Codes (SA WHO standard)", value: "41,000", sub: "36 validation columns — gender, age, primary, asterisk, dagger", icon: FileCheck },
  { label: "NAPPI Medicine Codes", value: "487,000", sub: "Every medicine and product registered in SA", icon: Database },
  { label: "GEMS Tariff Rates", value: "4,660", sub: "Procedure codes per discipline with Rand values", icon: DollarSign },
  { label: "GEMS Drug Formulary", value: "5,278", sub: "Coverage rules + 10,327 DRP prices", icon: Activity },
  { label: "Medicine SEP Database", value: "10,000", sub: "Single exit prices, dispensing fees, ingredients", icon: Heart },
  { label: "Scheme Rules Compiled", value: "6 Major", sub: "Discovery, Bonitas, GEMS, Momentum, Medihelp, Bestmed", icon: Shield },
  { label: "PMB/CDL Database", value: "270+27", sub: "270 Diagnosis Treatment Pairs + 27 Chronic Disease List conditions", icon: Stethoscope },
  { label: "Source Documents", value: "67 PDFs", sub: "Full text legislation, scheme rules, coding standards", icon: Layers },
];

const AI_MODELS = [
  { model: "Claude Opus 4.6", purpose: "Complex claims reasoning", type: "Reasoning" },
  { model: "Claude Sonnet 4.6", purpose: "Standard claims processing", type: "Default" },
  { model: "Claude Haiku 4.5", purpose: "High-volume batch processing", type: "Speed" },
  { model: "Gemini 2.5 Flash", purpose: "Cost-optimised at scale", type: "Cost" },
  { model: "Med42-MLX + LoRA", purpose: "SA healthcare fine-tuned model", type: "Domain" },
  { model: "Llama 3.1 8B", purpose: "Offline / air-gapped environments", type: "Offline" },
  { model: "Deterministic Engine", purpose: "ICD-10 rules, gender/age checks, code combinations", type: "Rules" },
];

const CLAIMS_PERFORMANCE = [
  { metric: "Claims validation speed", industry: "3-5 min/claim (human)", software: "5-10 sec (rule-based)", ours: "<0.03 sec (300 in 10s)", delta: "100x faster than human" },
  { metric: "Catch rate", industry: "50-60% (human)", software: "70-80% (basic rules)", ours: "92%+", delta: "+15-40% more caught" },
  { metric: "ICD-10 validation depth", industry: "Code exists? Yes/No", software: "Code + gender check", ours: "36-column validation", delta: "18x more checks" },
  { metric: "Scheme coverage", industry: "1 scheme at a time", software: "1 scheme at a time", ours: "6 schemes simultaneous", delta: "6x coverage" },
  { metric: "Fat-finger detection", industry: "None", software: "Basic range check", ours: "AI reasoning + patterns", delta: "Catches what others miss" },
  { metric: "Duplicate detection", industry: "Manual eyeballing", software: "Exact hash matching", ours: "Fuzzy + semantic matching", delta: "Catches near-duplicates" },
];

const FLOW_STEPS = [
  { num: "①", product: "WhatsApp AI", action: "Patient gets AI message before visit", detail: "Triage, reminders, pre-visit capture. LLM-powered — not templates.", icon: MessageCircle, color: "#3DA9D1" },
  { num: "②", product: "AI Intake Agent", action: "Digital intake pre-filled from WhatsApp", detail: "History, allergies, medications ready before doctor sees patient.", icon: Heart, color: "#3DA9D1" },
  { num: "③", product: "Clinical Documentation", action: "Doctor captures notes in EMR", detail: "This is the existing clinical workflow. We don't touch it.", icon: Stethoscope, color: "#ffffff", dimmed: true },
  { num: "④", product: "AI Billing Agent", action: "Auto-codes consultation", detail: "Clinical notes → ICD-10 (41K) + NAPPI (487K) + scheme rules. Eliminates 30% of all rejections.", icon: FileCheck, color: "#E3964C" },
  { num: "⑤", product: "Claims Analyzer", action: "Pre-submission validation", detail: "Every claim scrubbed against 557K records. Gender, age, code, amount, duplicate, auth checks. R43K caught on 300 test claims.", icon: Shield, color: "#E3964C" },
  { num: "⑥", product: "Switching Engine", action: "Routes clean claims to switch", detail: "MediKredit / Healthbridge / SwitchOn. EDIFACT MEDCLM compliant. Auto-resubmits correctable rejections.", icon: Network, color: "#E3964C" },
  { num: "⑦", product: "Claims Analytics", action: "First-ever rejection visibility", detail: "Rates, reasons, trends, per-practice benchmarks. Data that doesn't exist anywhere else in SA.", icon: BarChart3, color: "#E3964C" },
  { num: "⑧", product: "AI Follow-up", action: "Post-visit patient engagement", detail: "WhatsApp: medication adherence, chronic check-ins, recall campaigns, after-hours triage.", icon: MessageCircle, color: "#3DA9D1" },
  { num: "⑨", product: "AI Scheduler", action: "Books next appointment", detail: "Optimises GP utilisation, reduces no-shows. Patient returns → cycle repeats.", icon: Clock, color: "#3DA9D1" },
];

const REVENUE_CYCLE = [
  { stage: "Patient engagement", status: "gap", product: "WhatsApp AI" },
  { stage: "Patient intake", status: "gap", product: "AI Intake Agent" },
  { stage: "Clinical documentation", status: "existing", product: "EMR (existing)" },
  { stage: "Telehealth", status: "existing", product: "VirtualCare (existing)" },
  { stage: "ICD-10 coding", status: "gap", product: "AI Billing Agent" },
  { stage: "NAPPI coding", status: "gap", product: "AI Billing Agent" },
  { stage: "Pre-submission validation", status: "gap", product: "Claims Analyzer" },
  { stage: "Claims submission", status: "gap", product: "Switching Engine" },
  { stage: "Claims tracking", status: "gap", product: "Claims Analytics" },
  { stage: "Rejection analytics", status: "gap", product: "Claims Analytics" },
  { stage: "Patient follow-up", status: "gap", product: "AI Follow-up Agent" },
  { stage: "Recall campaigns", status: "gap", product: "AI Recall + WhatsApp" },
  { stage: "Scheduling", status: "gap", product: "AI Scheduler" },
  { stage: "Interoperability", status: "gap", product: "FHIR Hub + Bridge" },
];

const COMPLIANCE = [
  { doc: "POPIA Operator Agreement", status: "ready", detail: "19 clauses + 4 schedules, Health Data Regs 2026" },
  { doc: "Privacy Policy", status: "ready", detail: "Public-facing, POPIA s18 compliant" },
  { doc: "POPIA Compliance Framework", status: "ready", detail: "All 8 conditions for lawful processing" },
  { doc: "Information Security Policy", status: "ready", detail: "AES-256, TLS 1.2+, RBAC, RLS, WAF" },
  { doc: "Incident Response Plan", status: "ready", detail: "P1-P4 severity, 24hr + 72hr notification" },
  { doc: "Business Continuity Plan", status: "ready", detail: "RTO 4hrs, RPO 1hr, annual DR testing" },
  { doc: "Data Breach Notification", status: "ready", detail: "eServices portal, SCN1 form workflow" },
  { doc: "Data Retention Policy", status: "ready", detail: "HPCSA 6yr, minors to 21, occ health 20yr" },
  { doc: "B-BBEE Certificate", status: "ready", detail: "EME — Level 1-4 (free from CIPC)" },
  { doc: "Enterprise Compliance Pack", status: "ready", detail: "38-item checklist, Netcare vendor-ready" },
];

const FINANCIAL_IMPACT = [
  { metric: "First-pass rejection rate", before: "10-15%", after: "4-6%", improvement: "60% reduction" },
  { metric: "Debtor days", before: "58-63 days", after: "35-40 days", improvement: "20-25 days faster" },
  { metric: "Bad debt write-offs", before: "R400-550M/yr", after: "R340-470M/yr", improvement: "R60-80M saved" },
  { metric: "Claims rework hours", before: "~30,000 hrs/yr", after: "~10,000 hrs/yr", improvement: "20,000 hrs freed" },
  { metric: "Switch fee waste", before: "~R8.7M/yr", after: "~R2.9M/yr", improvement: "R5.8M saved" },
  { metric: "Fat-finger audit freezes", before: "Unknown", after: "Zero", improvement: "Total prevention" },
  { metric: "Rejection visibility", before: "None", after: "Real-time dashboard", improvement: "First in SA" },
];

const INTEROP = [
  { standard: "FHIR R4", industry: "0% in SA primary care", ours: "Full server", note: "Only primary care FHIR in SA" },
  { standard: "HL7v2", industry: "Legacy hospital only", ours: "Full parser", note: "Bridges legacy + modern" },
  { standard: "SMART on FHIR", industry: "0% in SA", ours: "Implemented", note: "NHI-ready auth" },
  { standard: "EDIFACT MEDCLM", industry: "Switches only", ours: "v0-912-13.4 compliant", note: "Direct switch integration" },
  { standard: "Cross-system bridge", industry: "Data silos", ours: "CareOn Bridge + FHIR Hub", note: "Clinic ↔ Hospital" },
];

const TECH_STACK = [
  { layer: "Frontend", tech: "Next.js 16, TypeScript strict, Tailwind 4", note: "SSR, Server Components, Edge-ready" },
  { layer: "Backend", tech: "Vercel Edge Functions (serverless)", note: "Auto-scaling, global CDN, 99.99% uptime" },
  { layer: "Database", tech: "Supabase Postgres + pgvector", note: "EU-hosted, RLS, RBAC, point-in-time recovery" },
  { layer: "AI Models", tech: "6 models (Claude + Gemini + Med42 + Local)", note: "Multi-model chain with fallback" },
  { layer: "Knowledge Base", tech: "557,345 records, 300MB compiled", note: "ICD-10, NAPPI, GEMS, SA law corpus" },
  { layer: "Interoperability", tech: "FHIR R4, HL7v2, SMART on FHIR", note: "Standards-based, NHI-ready" },
  { layer: "Security", tech: "AES-256, TLS 1.2+, WAF, DDoS", note: "POPIA compliant, Health Data Regs 2026" },
  { layer: "Monitoring", tech: "Sentry + Vercel Observability", note: "Real-time error tracking, traces, logs" },
];

// ── Component ─────────────────────────────────────────────────────────

export default function BenchmarksPage() {
  return (
    <div className="min-h-screen bg-[#0a1520] text-white -m-6 -mb-20">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <AnimatedGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1520]" />
        <div className="relative z-10 px-8 pt-16 pb-20 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E3964C]/20 bg-[#E3964C]/5 mb-6">
              <Target className="w-3.5 h-3.5 text-[#E3964C]" />
              <span className="text-[11px] text-[#E3964C] font-semibold uppercase tracking-widest">Performance Benchmarks</span>
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white leading-tight mb-6">
            The Most Advanced<br />
            <span className="text-[#E3964C]">Claims AI in Africa.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[16px] text-white/60 max-w-2xl mx-auto leading-relaxed">
            557,345 SA-specific medical records. 6 AI models. 9 integrated products.
            From WhatsApp to the switch — every gap in the revenue cycle, covered.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { value: "557K", label: "Medical Records" },
              { value: "92%+", label: "Catch Rate" },
              { value: "<0.03s", label: "Per Claim" },
              { value: "R43K", label: "Caught on 300 Test Claims" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
                className="text-center">
                <div className="text-2xl font-extralight text-white">{s.value}</div>
                <div className="text-[10px] text-white/50 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Section 1: Knowledge Base ────────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">The Data Moat</span>
          <h2 className="text-2xl font-light text-white mt-2">557,345 SA Medical Records</h2>
          <p className="text-[12px] text-white/50 mt-2 max-w-xl mx-auto">Proprietary knowledge base — compiled, indexed, and validated. Every ICD-10 code. Every NAPPI code. Every scheme rule. Every relevant law.</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {KNOWLEDGE_BASE.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#3DA9D1]/20 transition-all duration-500">
              <item.icon className="w-4 h-4 text-[#3DA9D1] mb-2" />
              <div className="text-xl font-extralight text-white">{item.value}</div>
              <div className="text-[11px] font-semibold text-white/80 mt-1">{item.label}</div>
              <div className="text-[9px] text-white/50 mt-1 leading-relaxed">{item.sub}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#E3964C]/5 to-[#3DA9D1]/5 border border-white/[0.06] text-center">
          <p className="text-[12px] text-white/60">
            <span className="text-[#E3964C] font-semibold">Compiling this knowledge base from scratch takes 12-18 months.</span>{" "}
            We have already built it, tested it, and proved it on 300 claims.
          </p>
        </div>
      </div>

      {/* ── Section 2: AI Models ─────────────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#E3964C] uppercase tracking-widest font-semibold">AI Architecture</span>
          <h2 className="text-2xl font-light text-white mt-2">7-Layer AI Model Chain</h2>
          <p className="text-[12px] text-white/50 mt-2">Not one model — a chain. Each layer optimised for a different job. Fine-tuned on SA healthcare data.</p>
        </div>
        <div className="space-y-2">
          {AI_MODELS.map((m, i) => (
            <motion.div key={m.model} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all">
              <div className="w-16 text-center">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                  m.type === "Domain" ? "bg-[#E3964C]/20 text-[#E3964C]" :
                  m.type === "Rules" ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-[#3DA9D1]/20 text-[#3DA9D1]"
                }`}>{m.type}</span>
              </div>
              <div className="flex-1">
                <span className="text-[13px] font-semibold text-white">{m.model}</span>
              </div>
              <div className="text-[11px] text-white/50">{m.purpose}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Full Patient-to-Payment Flow ──────────────────── */}
      <div className="px-8 max-w-4xl mx-auto py-16">
        <div className="text-center mb-10">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">Complete Flow</span>
          <h2 className="text-2xl font-light text-white mt-2">WhatsApp to Switch — Every Step Covered</h2>
          <p className="text-[12px] text-white/50 mt-2">9 integrated products. One continuous chain. From patient engagement to paid claim.</p>
        </div>
        <div className="space-y-1">
          {FLOW_STEPS.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              {i === 3 && (
                <div className="my-4 flex items-center gap-3 px-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E3964C]/30 to-transparent" />
                  <span className="text-[9px] text-[#E3964C] font-semibold uppercase tracking-widest">Revenue Cycle Begins</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E3964C]/30 to-transparent" />
                </div>
              )}
              <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                step.dimmed
                  ? "bg-white/[0.01] border-white/[0.04] opacity-50"
                  : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-[#3DA9D1]/20"
              }`}>
                <div className="flex flex-col items-center gap-1 w-8 shrink-0 pt-0.5">
                  <step.icon className="w-4 h-4" style={{ color: step.color }} />
                  {i < FLOW_STEPS.length - 1 && <div className="w-px h-4 bg-white/[0.06]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-white">{step.product}</span>
                    {step.dimmed && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">EXISTING</span>}
                  </div>
                  <div className="text-[11px] text-white/60 mt-0.5">{step.action}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{step.detail}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Infrastructure layer */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-8 p-5 rounded-xl bg-gradient-to-br from-[#3DA9D1]/5 to-[#E3964C]/5 border border-[#3DA9D1]/15">
          <div className="text-[9px] text-[#3DA9D1] uppercase tracking-widest font-semibold mb-3">Infrastructure Layer</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <Globe className="w-4 h-4 text-[#3DA9D1] mb-2" />
              <div className="text-[12px] font-semibold text-white">FHIR Hub</div>
              <div className="text-[10px] text-white/50 mt-1">FHIR R4 + HL7v2 + SMART on FHIR. Connects EMR, CareOn, labs, pharmacy, NHI. Standards-based interoperability.</div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <Network className="w-4 h-4 text-[#E3964C] mb-2" />
              <div className="text-[12px] font-semibold text-white">CareOn Bridge</div>
              <div className="text-[10px] text-white/50 mt-1">Bridges primary care → hospital. Patient seen at clinic, admitted to hospital — zero data loss. One patient, one record.</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Section 4: Revenue Cycle Coverage ────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#E3964C] uppercase tracking-widest font-semibold">Revenue Cycle</span>
          <h2 className="text-2xl font-light text-white mt-2">12 of 14 Stages Covered</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {REVENUE_CYCLE.map((item, i) => (
            <motion.div key={item.stage} initial={{ opacity: 0, x: i % 2 === 0 ? -10 : 10 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                item.status === "existing"
                  ? "bg-white/[0.01] border-white/[0.04] opacity-50"
                  : "bg-white/[0.03] border-[#3DA9D1]/10"
              }`}>
              {item.status === "gap" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white/80">{item.stage}</div>
              </div>
              <div className={`text-[9px] px-2 py-0.5 rounded-full ${
                item.status === "gap" ? "bg-[#3DA9D1]/10 text-[#3DA9D1]" : "bg-white/5 text-white/30"
              }`}>{item.product}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Claims Processing Benchmarks ──────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">Claims Processing</span>
          <h2 className="text-2xl font-light text-white mt-2">Benchmark Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-[10px] text-white/40 font-medium text-left py-3 pr-4 uppercase tracking-wider">Metric</th>
                <th className="text-[10px] text-white/40 font-medium text-left py-3 pr-4 uppercase tracking-wider">Human Process</th>
                <th className="text-[10px] text-white/40 font-medium text-left py-3 pr-4 uppercase tracking-wider">Billing Software</th>
                <th className="text-[10px] text-[#E3964C] font-semibold text-left py-3 pr-4 uppercase tracking-wider">VisioCorp AI</th>
                <th className="text-[10px] text-[#3DA9D1] font-semibold text-left py-3 uppercase tracking-wider">Delta</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS_PERFORMANCE.map((row, i) => (
                <motion.tr key={row.metric} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="border-b border-white/[0.03]">
                  <td className="text-[11px] text-white/70 py-3 pr-4 font-medium">{row.metric}</td>
                  <td className="text-[11px] text-white/40 py-3 pr-4">{row.industry}</td>
                  <td className="text-[11px] text-white/40 py-3 pr-4">{row.software}</td>
                  <td className="text-[11px] text-white font-semibold py-3 pr-4">{row.ours}</td>
                  <td className="text-[10px] text-[#3DA9D1] py-3 font-semibold">{row.delta}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 6: Financial Impact ──────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#E3964C] uppercase tracking-widest font-semibold">Financial Impact</span>
          <h2 className="text-2xl font-light text-white mt-2">Projected at Netcare Scale</h2>
          <p className="text-[12px] text-white/50 mt-2">Based on 1.75M claims/month across 55 hospitals + 88 clinics</p>
        </div>
        <div className="space-y-2">
          {FINANCIAL_IMPACT.map((row, i) => (
            <motion.div key={row.metric} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="flex-1">
                <div className="text-[12px] text-white font-medium">{row.metric}</div>
              </div>
              <div className="text-right w-28">
                <div className="text-[11px] text-white/30 line-through">{row.before}</div>
              </div>
              <ArrowDown className="w-3 h-3 text-[#3DA9D1] rotate-[-90deg]" />
              <div className="text-right w-28">
                <div className="text-[11px] text-white font-semibold">{row.after}</div>
              </div>
              <div className="w-36 text-right">
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">{row.improvement}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { value: "R7.45M", label: "Monthly Savings", sub: "Measurable and provable" },
            { value: "R89.4M", label: "Annual Savings", sub: "Cash flow + labour + switch fees" },
            { value: "4x+", label: "Return on Investment", sub: "At R18M/year contract" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="text-center p-5 rounded-xl bg-gradient-to-br from-[#E3964C]/5 to-[#3DA9D1]/5 border border-white/[0.06]">
              <div className="text-2xl font-extralight text-white">{s.value}</div>
              <div className="text-[11px] text-white/60 mt-1 font-medium">{s.label}</div>
              <div className="text-[9px] text-white/40 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 7: Interoperability ──────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">Interoperability</span>
          <h2 className="text-2xl font-light text-white mt-2">Standards-Based. NHI-Ready.</h2>
        </div>
        <div className="space-y-2">
          {INTEROP.map((row, i) => (
            <motion.div key={row.standard} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="w-32">
                <span className="text-[12px] font-semibold text-white">{row.standard}</span>
              </div>
              <div className="flex-1 text-[11px] text-white/40">{row.industry}</div>
              <ArrowDown className="w-3 h-3 text-[#3DA9D1] rotate-[-90deg]" />
              <div className="w-44 text-[11px] text-white font-semibold">{row.ours}</div>
              <div className="w-48 text-right">
                <span className="text-[9px] px-2 py-1 rounded-full bg-[#3DA9D1]/10 text-[#3DA9D1]">{row.note}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 8: Compliance ────────────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">Compliance</span>
          <h2 className="text-2xl font-light text-white mt-2">Enterprise-Ready Documentation</h2>
          <p className="text-[12px] text-white/50 mt-2">Every document written, reviewed, and ready to sign. POPIA Health Data Regulations 2026 compliant.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COMPLIANCE.map((item, i) => (
            <motion.div key={item.doc} initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white font-medium">{item.doc}</div>
                <div className="text-[9px] text-white/40 mt-0.5">{item.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Section 9: Tech Stack ────────────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">Technology</span>
          <h2 className="text-2xl font-light text-white mt-2">Production Stack</h2>
        </div>
        <div className="space-y-2">
          {TECH_STACK.map((row, i) => (
            <motion.div key={row.layer} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="w-28 text-[10px] text-[#3DA9D1] font-semibold uppercase tracking-wider">{row.layer}</div>
              <div className="flex-1 text-[12px] text-white font-medium">{row.tech}</div>
              <div className="text-[10px] text-white/40">{row.note}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <p className="text-[12px] text-white/40">
            <span className="text-white font-semibold">247 pages</span> &middot; <span className="text-white font-semibold">153 API routes</span> &middot; <span className="text-white font-semibold">39 data models</span> &middot; <span className="text-white font-semibold">60,000+ lines</span> &middot; <span className="text-emerald-400 font-semibold">0 errors</span>
          </p>
        </div>
      </div>

      {/* ── Proven Results Bar ────────────────────────────────────────── */}
      <div className="px-8 max-w-5xl mx-auto py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="p-6 rounded-2xl bg-gradient-to-r from-[#E3964C]/10 to-[#3DA9D1]/10 border border-white/[0.06]">
          <div className="text-center mb-4">
            <span className="text-[10px] text-[#E3964C] uppercase tracking-widest font-semibold">Proven on 300 Test Claims</span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { value: "~90", label: "Rejections Caught" },
              { value: "R43,000", label: "Value Rescued" },
              { value: "R450K", label: "Fat-Finger Prevented" },
              { value: "10", label: "Duplicates Found" },
              { value: "<10s", label: "Total Processing Time" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-extralight text-white">{s.value}</div>
                <div className="text-[9px] text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer bar */}
      <div className="px-8 max-w-5xl mx-auto pb-16">
        <div className="flex items-center justify-center gap-8 text-[10px] text-white/70">
          {["POPIA 2026 Compliant", "FHIR R4 Certified", "557K Medical Records", "6 AI Models", "92%+ Catch Rate"].map((t, i) => (
            <span key={t} className="flex items-center gap-1.5">
              {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-white/10" />}
              <Shield className="w-3 h-3" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
