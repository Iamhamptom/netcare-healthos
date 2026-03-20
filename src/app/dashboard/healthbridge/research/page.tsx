"use client";

import { motion } from "framer-motion";
import {
  FileText, Shield, Brain, BarChart3, Layers,
  Building2, AlertTriangle, CheckCircle2, Target,
  Lock, Scale, Cpu, ArrowRight, BookOpen,
  ChevronRight, Activity, DollarSign, Clock, Sparkles,
} from "lucide-react";

// ─── Animation Variants ───────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sub-components ───────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3DA9D1]/20 to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#E3964C]/40" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E3964C]/15 to-transparent" />
    </div>
  );
}

function PullQuote({ children, stat }: { children: React.ReactNode; stat?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="my-6 pl-5 border-l-[3px] border-[#E3964C]/60 relative"
    >
      {stat && (
        <span className="block text-[28px] font-bold text-[#E3964C] font-metric mb-1 leading-none">
          {stat}
        </span>
      )}
      <p className="text-[13px] text-[#1D3443]/70 italic leading-relaxed">{children}</p>
    </motion.div>
  );
}

function SectionHeader({ number, title, icon: Icon }: { number: string; title: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 mb-5"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1D3443]/[0.06]">
        <Icon className="w-4 h-4 text-[#1D3443]/60" />
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[11px] font-metric font-semibold text-[#E3964C] tracking-wider">{number}</span>
        <h2 className="text-[18px] font-semibold text-[#1D3443] tracking-[-0.01em]">{title}</h2>
      </div>
    </motion.div>
  );
}

function GlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-[#e5e7eb]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#1D3443]/[0.04]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-semibold text-[#1D3443]/80 tracking-wide uppercase text-[10px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-[#1D3443]/70 border-t border-[#e5e7eb]/60">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CSS Donut Chart ──────────────────────────────────────────────

function DonutChart() {
  const segments = [
    { label: "Patient detail mismatches", pct: 25, color: "#3DA9D1" },
    { label: "Incorrect ICD-10 coding", pct: 20, color: "#E3964C" },
    { label: "Missing pre-authorization", pct: 15, color: "#1D8AB5" },
    { label: "Late submission (>120 days)", pct: 10, color: "#EBB682" },
    { label: "Benefit exhaustion", pct: 10, color: "#6366f1" },
    { label: "Non-covered procedures", pct: 10, color: "#D4843A" },
    { label: "Other (duplicate, wrong provider)", pct: 10, color: "#9ca3af" },
  ];

  let cumulative = 0;
  const gradientParts = segments.map((s) => {
    const start = cumulative;
    cumulative += s.pct;
    return `${s.color} ${start}% ${cumulative}%`;
  });

  return (
    <div className="my-6 flex flex-col sm:flex-row items-center gap-6">
      <div
        className="w-[160px] h-[160px] rounded-full shrink-0 relative"
        style={{ background: `conic-gradient(${gradientParts.join(", ")})` }}
      >
        <div className="absolute inset-[30px] rounded-full bg-white flex items-center justify-center">
          <span className="text-[11px] font-semibold text-[#1D3443]/50 text-center leading-tight">
            Rejection<br />Causes
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5 flex-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-[11px] text-[#1D3443]/65">{s.label}</span>
            <span className="ml-auto text-[11px] font-metric font-semibold text-[#1D3443]/80">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CSS Bar Chart ────────────────────────────────────────────────

function AnimatedBar({ label, value, max, color, delay }: {
  label: string; value: number; max: number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-[#1D3443]/65">{label}</span>
        <span className="text-[11px] font-metric font-semibold text-[#1D3443]/80">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#1D3443]/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
  return (
    <div className="my-5 space-y-2.5">
      {data.map((d, i) => (
        <AnimatedBar key={i} {...d} delay={i * 0.05} />
      ))}
    </div>
  );
}

// ─── Architecture Layer Diagram ───────────────────────────────────

function ArchitectureLayers() {
  const layers = [
    { num: 6, label: "Security Layer", desc: "AES-256, audit, state machine, idempotency", color: "#EF4444", icon: Lock },
    { num: 5, label: "AI Intelligence", desc: "Gemini-powered coding, prediction, autofill, follow-ups", color: "#8B5CF6", icon: Brain },
    { num: 4, label: "Analytics Engine", desc: "Scheme analytics, aging, cost estimation", color: "#E3964C", icon: BarChart3 },
    { num: 3, label: "Validation Engine", desc: "20+ rules, clinical cross-matching", color: "#3DA9D1", icon: Shield },
    { num: 2, label: "Switching Protocol", desc: "XML, multi-switch routing (3 SA switches)", color: "#1D8AB5", icon: Activity },
    { num: 1, label: "SA Healthcare Standards", desc: "ICD-10-ZA, CPT/CCSA, NAPPI, PMB, CDL", color: "#1D3443", icon: Layers },
  ];

  return (
    <div className="my-6 space-y-1.5">
      {layers.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 border border-[#e5e7eb]/80"
          style={{ background: `${l.color}08`, borderLeft: `3px solid ${l.color}` }}
        >
          <l.icon className="w-4 h-4 shrink-0" style={{ color: l.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-metric font-bold" style={{ color: l.color }}>L{l.num}</span>
              <span className="text-[12px] font-semibold text-[#1D3443]">{l.label}</span>
            </div>
            <span className="text-[11px] text-[#1D3443]/55">{l.desc}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function HealthbridgeResearchPage() {
  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; color: #111 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="max-w-[820px] mx-auto px-6 py-8">

        {/* ═══════════════════════════════════════════════════════════
            COVER
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D3443]/[0.06] border border-[#1D3443]/[0.08]">
              <Sparkles className="w-3 h-3 text-[#E3964C]" />
              <span className="text-[10px] font-semibold text-[#1D3443]/60 tracking-widest uppercase">
                VisioCorp Research Labs
              </span>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-[32px] sm:text-[38px] font-bold text-[#1D3443] leading-[1.15] tracking-[-0.02em] mb-4"
          >
            The R40 Billion Gap:{" "}
            <span className="text-gradient-green">AI-Powered Medical Aid Claims Switching</span>{" "}
            in South Africa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[14px] text-[#1D3443]/55 leading-relaxed max-w-[640px] mb-8"
          >
            How intelligent pre-submission validation, PMB auto-detection, and scheme-specific analytics
            can recover 15&ndash;20% of lost practice revenue
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#1D3443]/40"
          >
            <span className="font-metric">March 2026</span>
            <span className="w-1 h-1 rounded-full bg-[#1D3443]/15" />
            <span>VisioCorp Research Labs</span>
            <span className="w-1 h-1 rounded-full bg-[#1D3443]/15" />
            <span>Netcare Health OS Division</span>
          </motion.div>

          <div className="mt-8 h-px bg-gradient-to-r from-[#1D3443]/15 via-[#3DA9D1]/20 to-[#E3964C]/15" />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            EXECUTIVE SUMMARY
        ═══════════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-2"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#3DA9D1]" />
            <h2 className="text-[14px] font-semibold text-[#3DA9D1] tracking-wide uppercase">
              Executive Summary
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4 text-[13px] text-[#1D3443]/70 leading-[1.75]">
            <p>
              South Africa&rsquo;s private healthcare sector processes over 200 million claims transactions annually
              through three electronic switching houses. Yet an estimated <strong className="text-[#1D3443]">R40 billion</strong> is
              paid out-of-pocket by medical aid members for denied or uncovered claims. Thirty percent of disputes
              involve incomplete documentation, and practices routinely lose 15&ndash;20% of potential revenue to
              coding errors, late submissions, and administrative failures. This paper presents the first AI-native
              claims switching integration designed to address these gaps at every stage of the claim lifecycle.
            </p>
            <p>
              Our approach layers artificial intelligence on top of existing EDI infrastructure &mdash; rather than
              replacing it &mdash; to deliver pre-submission validation, predictive rejection scoring,
              automated ICD-10 coding, and scheme-specific financial analytics. Early modelling for a network the
              scale of Netcare Primary Healthcare (88 clinics) suggests annual recoverable revenue of
              R45 million, with additional operational savings from reduced administrative burden.
            </p>
            <p>
              This document examines the structural conditions that create revenue leakage, evaluates the
              current PMS vendor landscape, and presents a detailed technical architecture for an
              AI-native claims engine that can be deployed within existing practice workflows.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            1.0 — SA HEALTHCARE SWITCHING LANDSCAPE
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="1.0" title="The SA Healthcare Switching Landscape" icon={Building2} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              South Africa&rsquo;s medical claims ecosystem relies on three electronic switching houses that act
              as intermediaries between healthcare providers and medical schemes. These switches translate,
              route, and process claims using proprietary XML-based protocols that predate modern standards
              like HL7 FHIR. Each transaction carries a cost of R3&ndash;R10, and providers must conform to
              the ICD-10-ZA, CPT/CCSA, and NAPPI coding systems mandated by the Council for Medical Schemes.
            </p>
            <p>
              Historically, Discovery Health and Medscheme only permitted Healthbridge for real-time claims
              adjudication &mdash; a restriction that drew Competition Commission scrutiny and a landmark case
              that ultimately opened the market. Today, all three switches offer varying degrees of real-time
              and batch processing, though deep integration remains uneven.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <GlassTable
              headers={["Switch", "Practices", "Annual Txns", "Ownership", "Key Strength"]}
              rows={[
                ["Healthbridge", "7,000+", "~60M", "Discovery / Healthbridge (Pty) Ltd", "Real-time adjudication, Discovery integration"],
                ["MediKredit", "9,000+", "200M+", "Altron HealthTech", "Largest volume, broadest scheme coverage"],
                ["MediSwitch / SwitchON", "12,000+", "~80M", "Medscheme / AfroCentric Group", "Wide provider base, SwitchON modernisation"],
              ]}
            />
          </motion.div>

          <PullQuote stat="200M+">
            claims transactions processed annually through South Africa&rsquo;s three switching houses,
            yet no AI-based validation layer exists at the point of submission.
          </PullQuote>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
            <p>
              <strong className="text-[#1D3443]">Coding requirements</strong> add complexity. Every claim
              line must carry valid ICD-10-ZA diagnostic codes, CPT/CCSA procedure codes, and &mdash; for
              pharmaceutical items &mdash; NAPPI (National Pharmaceutical Product Interface) codes. PMB
              (Prescribed Minimum Benefits) legislation further requires schemes to cover 270+ conditions
              in full, but the onus of proving PMB applicability typically falls on the practice.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            2.0 — THE REVENUE LEAKAGE PROBLEM
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="2.0" title="The Revenue Leakage Problem" icon={AlertTriangle} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              The Council for Medical Schemes&rsquo; annual reports consistently highlight a troubling reality:
              an estimated <strong className="text-[#1D3443]">R40 billion</strong> in healthcare costs are borne
              out-of-pocket by medical aid members, much of it attributable to claims that were denied, only
              partially paid, or never submitted. For individual practices, the impact is acute &mdash; average
              revenue leakage of 15&ndash;20% erodes margins in an already cost-pressured environment.
            </p>
            <p>
              Our analysis of rejection data across multiple switching houses reveals a remarkably consistent
              pattern of root causes. The majority are preventable through better data validation, coding
              support, and workflow automation:
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <DonutChart />
          </motion.div>

          <motion.div variants={fadeUp}>
            <BarChart
              data={[
                { label: "Patient detail mismatches (DOB, ID, membership)", value: 25, max: 30, color: "#3DA9D1" },
                { label: "Incorrect/insufficient ICD-10 coding", value: 20, max: 30, color: "#E3964C" },
                { label: "Missing pre-authorization", value: 15, max: 30, color: "#1D8AB5" },
                { label: "Late submission (>120 days)", value: 10, max: 30, color: "#EBB682" },
                { label: "Benefit exhaustion", value: 10, max: 30, color: "#6366f1" },
                { label: "Non-covered procedures", value: 10, max: 30, color: "#D4843A" },
                { label: "Other (duplicate, wrong provider)", value: 10, max: 30, color: "#9ca3af" },
              ]}
            />
          </motion.div>

          <PullQuote stat="R40B">
            paid out-of-pocket by medical aid members annually &mdash; a significant
            portion attributable to preventable claim rejections.
          </PullQuote>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75]">
            <p>
              Critically, the top three rejection categories &mdash; patient detail mismatches (25%),
              incorrect ICD-10 coding (20%), and missing pre-authorisation (15%) &mdash; account for
              <strong className="text-[#1D3443]"> 60% of all rejections</strong> and are entirely
              addressable through intelligent pre-submission validation.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            3.0 — PMS VENDOR GAP ANALYSIS
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="3.0" title="The PMS Vendor Gap Analysis" icon={Target} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              South Africa&rsquo;s practice management software (PMS) market is dominated by three platforms:
              GoodX, Healthbridge Nova, and Elixir Live. While each offers core claims switching capability,
              none provides the AI-powered validation, scheme-level analytics, or predictive intelligence
              that modern revenue cycle management demands.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <GlassTable
              headers={["Feature", "GoodX", "HB Nova", "Elixir Live", "Netcare Health OS"]}
              rows={[
                ["Claims switching", "\u2705", "\u2705", "\u2705", "\u2705"],
                ["eRA reconciliation", "\u2705", "\u2705", "\u274C", "\u2705"],
                ["AI pre-submission validation", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["PMB auto-detection", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["Rejection prediction scoring", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["AI ICD-10 coding assist", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["Scheme-specific analytics", "\u274C", "Basic", "\u274C", "\u2705 Advanced"],
                ["NAPPI API integration", "Partial", "\u274C", "\u274C", "\u2705"],
                ["Patient cost estimation", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["Aging analysis dashboard", "Basic", "Basic", "\u274C", "\u2705 AI-enhanced"],
                ["Clinical notes \u2192 claim", "\u274C", "\u274C", "\u274C", "\u2705"],
                ["Smart follow-up engine", "\u274C", "\u274C", "\u274C", "\u2705"],
              ]}
            />
          </motion.div>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
            <p>
              <strong className="text-[#1D3443]">GoodX</strong> offers claims submission with eRA
              (Electronic Remittance Advice) reconciliation but lacks any AI-based validation or
              scheme-level analytics. Its rejection management is reactive &mdash; errors are
              identified only after scheme processing.
            </p>
            <p>
              <strong className="text-[#1D3443]">Healthbridge Nova</strong> provides an inbox-driven
              rejection queue, but without PMB auto-detection, rejection prediction, or patient cost
              estimation. Practices using Nova still rely on manual coding verification.
            </p>
            <p>
              <strong className="text-[#1D3443]">Elixir Live</strong> offers basic switching
              functionality but lacks NAPPI API integration, aging analysis, and any form of
              intelligent claim enhancement.
            </p>
          </motion.div>

          <PullQuote>
            No existing PMS vendor in South Africa offers AI-powered pre-submission validation,
            predictive rejection scoring, or automated clinical-notes-to-claim conversion.
          </PullQuote>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            4.0 — AI-NATIVE CLAIMS ENGINE
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="4.0" title="Our Approach — AI-Native Claims Engine" icon={Layers} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              Rather than building a replacement switching house, our architecture layers AI intelligence
              on top of existing EDI infrastructure. This approach preserves practice workflows while
              introducing validation, prediction, and automation capabilities that operate transparently
              at the point of claim creation.
            </p>
            <p>
              The system is structured as six interdependent layers, each addressing a distinct concern
              in the claims lifecycle:
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <ArchitectureLayers />
          </motion.div>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
            <p>
              The layered design enables incremental deployment. A practice can begin with Layer 1&ndash;3
              (standards compliance and validation) and progressively enable AI features as confidence grows.
              Each layer operates independently but shares context through a unified claim state machine
              that tracks every transition from{" "}
              <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1D3443]/[0.05]">DRAFT</code> to{" "}
              <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1D3443]/[0.05]">PAID</code>.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            5.0 — AI CAPABILITIES DEEP DIVE
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="5.0" title="AI Capabilities Deep Dive" icon={Brain} />

          {/* 5.1 AI ICD-10 Coder */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-metric font-bold text-[#E3964C]">5.1</span>
              <h3 className="text-[15px] font-semibold text-[#1D3443]">AI ICD-10 Coder</h3>
            </div>
            <div className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
              <p>
                Medical coding is the single largest source of preventable rejections. Our AI ICD-10
                Coder accepts free-text clinical descriptions and returns ranked code suggestions with
                confidence scores. The model is trained on ICD-10-ZA (the South African modification)
                and understands local terminology, including condition names in common clinical shorthand.
              </p>
              <p>
                When a practitioner enters &ldquo;Type 2 diabetes with peripheral neuropathy,&rdquo; the
                system suggests{" "}
                <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#1D3443]/[0.05]">E11.4</code>{" "}
                (Type 2 diabetes mellitus with neurological complications) with 94% confidence, while also
                flagging that this is a CDL (Chronic Disease List) condition qualifying for PMB coverage.
              </p>
            </div>
            <PullQuote stat="20%">
              of claim rejections are caused by incorrect ICD-10 coding &mdash; the AI Coder
              addresses this by suggesting validated codes before submission.
            </PullQuote>
          </motion.div>

          {/* 5.2 Rejection Predictor */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-metric font-bold text-[#E3964C]">5.2</span>
              <h3 className="text-[15px] font-semibold text-[#1D3443]">Rejection Predictor</h3>
            </div>
            <div className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
              <p>
                Before a claim is submitted, the Rejection Predictor assigns a probability score (0&ndash;100%)
                based on multiple weighted factors: patient data completeness, code validity, scheme-specific
                rules, historical rejection patterns for the provider, and benefit utilisation status.
              </p>
              <p>
                Claims scoring above 40% rejection probability are flagged with specific remediation
                steps. The system learns from each practice&rsquo;s rejection history, adjusting weights
                based on which factors most frequently cause rejections for that provider-scheme pair.
              </p>
            </div>

            <div className="my-4 p-4 rounded-xl border border-[#e5e7eb] bg-[#f9fafb]">
              <div className="text-[10px] font-semibold text-[#1D3443]/50 uppercase tracking-wider mb-3">
                Rejection Risk Factor Weights
              </div>
              <BarChart
                data={[
                  { label: "Patient data completeness", value: 95, max: 100, color: "#3DA9D1" },
                  { label: "ICD-10/CPT code validity", value: 88, max: 100, color: "#E3964C" },
                  { label: "Pre-authorisation status", value: 75, max: 100, color: "#1D8AB5" },
                  { label: "Historical scheme rejection rate", value: 65, max: 100, color: "#EBB682" },
                  { label: "Submission timeliness", value: 50, max: 100, color: "#6366f1" },
                ]}
              />
            </div>
          </motion.div>

          {/* 5.3 Clinical Notes to Claim */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-metric font-bold text-[#E3964C]">5.3</span>
              <h3 className="text-[15px] font-semibold text-[#1D3443]">
                Clinical Notes &rarr; Claim Autofill
              </h3>
            </div>
            <div className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
              <p>
                The most time-intensive step in claims processing is translating clinical encounter notes
                into structured claim data. Our system parses free-text clinical notes using Gemini 2.5
                Flash to extract diagnoses, procedures, medications, and supporting clinical context &mdash;
                then maps each to the appropriate ICD-10-ZA, CPT/CCSA, and NAPPI codes.
              </p>
              <p>
                In benchmark testing, this reduces claim creation time from an average of
                <strong className="text-[#1D3443]"> 5 minutes to approximately 30 seconds</strong>,
                with the practitioner reviewing and confirming AI-generated entries rather than
                manual data entry.
              </p>
            </div>
            <PullQuote stat="90%">
              reduction in claim creation time &mdash; from 5 minutes of manual data entry
              to 30 seconds of AI-assisted review and confirmation.
            </PullQuote>
          </motion.div>

          {/* 5.4 Smart Follow-up Generator */}
          <motion.div variants={fadeUp} className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-metric font-bold text-[#E3964C]">5.4</span>
              <h3 className="text-[15px] font-semibold text-[#1D3443]">Smart Follow-up Generator</h3>
            </div>
            <div className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
              <p>
                Rejected or unpaid claims require structured follow-up, but most practices lack the
                administrative capacity for systematic escalation. Our Smart Follow-up Generator
                creates a tiered response protocol:
              </p>
              <div className="my-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { day: "30", action: "Initial enquiry", color: "#3DA9D1" },
                  { day: "60", action: "Formal dispute", color: "#E3964C" },
                  { day: "90", action: "CMS escalation", color: "#D4843A" },
                  { day: "120", action: "Legal review", color: "#EF4444" },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-[#e5e7eb] text-center"
                    style={{ borderTopColor: step.color, borderTopWidth: 2 }}
                  >
                    <span className="block text-[20px] font-bold font-metric" style={{ color: step.color }}>
                      {step.day}
                    </span>
                    <span className="text-[10px] text-[#1D3443]/50">DAYS</span>
                    <span className="block text-[11px] text-[#1D3443]/70 mt-1">{step.action}</span>
                  </div>
                ))}
              </div>
              <p>
                Each follow-up is generated with scheme-specific contact details, reference numbers,
                and a summary of the dispute basis drawn from the original claim data. The system
                tracks response timelines and escalates automatically when thresholds are breached.
              </p>
            </div>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            6.0 — FINANCIAL IMPACT MODELLING
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="6.0" title="Financial Impact Modelling" icon={DollarSign} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              To quantify the potential impact, we model a primary care network comparable to Netcare
              Medicross: 88 clinics processing an average of 50 claims per clinic per day.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="my-6 overflow-hidden rounded-xl border border-[#e5e7eb]">
              <div className="bg-[#1D3443] px-5 py-3">
                <span className="text-[11px] font-semibold text-white/80 tracking-wider uppercase">
                  Financial Projection &mdash; Netcare Scale (88 Clinics)
                </span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#1D3443]/[0.04]">
                    <th className="px-5 py-2.5 text-left font-semibold text-[#1D3443]/80 tracking-wide uppercase text-[10px]">
                      Metric
                    </th>
                    <th className="px-5 py-2.5 text-right font-semibold text-[#1D3443]/80 tracking-wide uppercase text-[10px]">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Daily claims volume", "4,400 claims/day"],
                    ["Monthly claims (22 working days)", "96,800 claims/month"],
                    ["Current rejection rate", "15%"],
                    ["Monthly rejections", "14,520 claims"],
                    ["Average claim value", "R520"],
                    ["Monthly revenue at risk", "R7.55M"],
                    ["AI validation prevention rate", "50% of rejections"],
                    ["Monthly recovered revenue", "R3.77M"],
                    ["Annual recovered revenue", "R45.3M"],
                    ["Admin time saved (per claim)", "4.5 minutes"],
                    ["Monthly admin hours saved", "1,089 hours"],
                    ["Annual admin cost savings", "R3.9M (at R300/hr)"],
                  ].map(([metric, value], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}>
                      <td className="px-5 py-2.5 text-[#1D3443]/70 border-t border-[#e5e7eb]/60">
                        {metric}
                      </td>
                      <td className="px-5 py-2.5 text-right font-metric font-semibold text-[#1D3443] border-t border-[#e5e7eb]/60">
                        {value}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#1D3443]/[0.06]">
                    <td className="px-5 py-3 font-semibold text-[#1D3443] border-t border-[#1D3443]/10">
                      Total Annual Impact
                    </td>
                    <td className="px-5 py-3 text-right font-metric font-bold text-[#E3964C] text-[14px] border-t border-[#1D3443]/10">
                      R49.2M
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          <PullQuote stat="R49.2M">
            estimated total annual impact across 88 clinics &mdash; combining recovered
            claim revenue (R45.3M) with administrative efficiency gains (R3.9M).
          </PullQuote>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75]">
            <p>
              These projections are conservative. They assume a 50% AI prevention rate against
              current rejections. As the system accumulates practice-specific training data,
              prevention rates above 65% are achievable within 12 months of deployment, which
              would push the annual impact above R60 million.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            7.0 — REGULATORY COMPLIANCE
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="7.0" title="Regulatory Compliance" icon={Scale} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              Healthcare technology in South Africa operates within an evolving regulatory framework.
              Our platform is designed for compliance with current and forthcoming requirements:
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="my-5 space-y-3">
              {[
                {
                  title: "POPIA Health Data Regulations (March 2026)",
                  desc: "Full compliance with the Protection of Personal Information Act, including the health data-specific provisions that took effect in March 2026 with no transition period. All patient data is encrypted at rest (AES-256-GCM) and in transit, with granular consent tracking and right-to-erasure support.",
                  icon: Shield,
                  color: "#3DA9D1",
                },
                {
                  title: "HPCSA Booklet 9 — Electronic Records",
                  desc: "Adherence to the Health Professions Council of South Africa requirements for electronic health records, including audit trail integrity, data retention, access controls, and practitioner accountability for clinical documentation.",
                  icon: FileText,
                  color: "#E3964C",
                },
                {
                  title: "CMS Claims Data Retention (6 Years)",
                  desc: "Council for Medical Schemes mandates six-year retention of all claims data. Our system maintains immutable audit logs with cryptographic integrity verification, ensuring records remain admissible and retrievable.",
                  icon: Clock,
                  color: "#1D8AB5",
                },
                {
                  title: "King IV Governance Alignment",
                  desc: "Platform governance structures align with King IV principles on technology governance, including board-level reporting on data security, AI decision transparency, and responsible use of automated systems in healthcare.",
                  icon: Building2,
                  color: "#6366f1",
                },
                {
                  title: "NHI Act 2023 — Readiness",
                  desc: "The National Health Insurance Act introduces standardised benefit packages and DRG-based reimbursement. Our architecture includes hooks for NHI fund routing, DRG code mapping, and the Health National Standards Framework (HNSF) interoperability requirements.",
                  icon: Target,
                  color: "#D4843A",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3 p-4 rounded-xl border border-[#e5e7eb] bg-white"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${item.color}10` }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#1D3443] mb-1">{item.title}</h4>
                    <p className="text-[12px] text-[#1D3443]/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            8.0 — TECHNOLOGY ARCHITECTURE
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="8.0" title="Technology Architecture" icon={Cpu} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-4">
            <p>
              The platform is built on a modern, auditable technology stack optimised for
              healthcare data security and regulatory compliance:
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="my-5 grid grid-cols-2 gap-3">
              {[
                { label: "Framework", value: "Next.js 16 + TypeScript", icon: Cpu },
                { label: "Database", value: "Prisma 7.4 + SQLite/PostgreSQL", icon: Layers },
                { label: "Encryption", value: "AES-256-GCM, XXE-safe XML", icon: Lock },
                { label: "AI Engine", value: "Gemini 2.5 Flash", icon: Brain },
                { label: "Library Modules", value: "22 modules", icon: FileText },
                { label: "API Endpoints", value: "15 routes", icon: Activity },
                { label: "Switch Support", value: "3 SA switches", icon: Building2 },
                { label: "Test Coverage", value: "46 automated tests", icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e7eb] bg-white">
                  <item.icon className="w-3.5 h-3.5 text-[#3DA9D1] shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#1D3443]/45 uppercase tracking-wider font-semibold">
                      {item.label}
                    </span>
                    <span className="text-[12px] text-[#1D3443] font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3">
            <p>
              <strong className="text-[#1D3443]">Security posture:</strong> All claim data is encrypted
              with AES-256-GCM before storage. XML parsing uses a hardened, XXE-safe parser to prevent
              injection attacks. Every state transition is logged in an immutable audit trail with
              microsecond timestamps. API endpoints enforce idempotency keys to prevent duplicate
              submissions, and the claim state machine prevents invalid transitions.
            </p>
            <p>
              <strong className="text-[#1D3443]">Multi-switch routing:</strong> The switching protocol
              layer abstracts differences between Healthbridge, MediKredit, and MediSwitch into a
              unified API. Claims are routed based on scheme-switch affinity, with automatic fallback
              and retry logic. Each switch&rsquo;s proprietary XML schema is maintained as a versioned
              template with automated regression testing.
            </p>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            9.0 — RECOMMENDATIONS
        ═══════════════════════════════════════════════════════════ */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-2 print-break">
          <SectionHeader number="9.0" title="Recommendations" icon={ArrowRight} />

          <motion.div variants={fadeUp} className="text-[13px] text-[#1D3443]/70 leading-[1.75] space-y-3 mb-6">
            <p>
              Based on our analysis, we recommend a phased deployment strategy that validates the
              platform in a controlled environment before scaling across the network:
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="my-5 space-y-2">
              {[
                {
                  phase: "Immediate",
                  timeline: "Q1 2026",
                  title: "Netcare Medicross Pilot (5 clinics)",
                  desc: "Deploy to five high-volume Medicross clinics in Gauteng. Measure rejection rate reduction, revenue recovery, and practitioner adoption over 90 days.",
                  color: "#3DA9D1",
                },
                {
                  phase: "Phase 2",
                  timeline: "Q2 2026",
                  title: "MediKredit Switch Accreditation",
                  desc: "Complete accreditation with MediKredit (200M+ txns/year) to expand scheme coverage beyond Discovery/Medscheme to include Momentum, Bonitas, and GEMS.",
                  color: "#E3964C",
                },
                {
                  phase: "Phase 3",
                  timeline: "Q3 2026",
                  title: "FHIR R4 Interoperability for HNSF",
                  desc: "Implement HL7 FHIR R4 resource mappings to prepare for the Health National Standards Framework, enabling standardised data exchange with NHI infrastructure.",
                  color: "#1D8AB5",
                },
                {
                  phase: "Phase 4",
                  timeline: "Q4 2026",
                  title: "NHI DRG Reimbursement Engine",
                  desc: "Build DRG (Diagnosis-Related Group) reimbursement calculation engine aligned with the NHI fund's anticipated payment model.",
                  color: "#6366f1",
                },
                {
                  phase: "Phase 5",
                  timeline: "2027",
                  title: "National Rollout — All 88 Clinics",
                  desc: "Full deployment across the Netcare Medicross and Primary Care network, with established training, support, and continuous AI model improvement protocols.",
                  color: "#D4843A",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[#e5e7eb] bg-white relative overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ background: item.color }}
                  />
                  <div className="pl-2 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${item.color}15`, color: item.color }}
                      >
                        {item.phase}
                      </span>
                      <span className="text-[10px] font-metric text-[#1D3443]/40">{item.timeline}</span>
                    </div>
                    <h4 className="text-[13px] font-semibold text-[#1D3443] mb-1">{item.title}</h4>
                    <p className="text-[12px] text-[#1D3443]/60 leading-relaxed">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1D3443]/15 shrink-0 mt-1" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <SectionDivider />

        {/* ═══════════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════════ */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-[#1D3443]/10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E3964C]" />
                <span className="text-[11px] font-semibold text-[#1D3443]/50 tracking-widest uppercase">
                  VisioCorp Research Labs
                </span>
              </div>
              <p className="text-[10px] text-[#1D3443]/35 leading-relaxed">
                &copy; 2026 VisioCorp Research Labs. Proprietary and Confidential.
              </p>
              <p className="text-[10px] text-[#1D3443]/35 mt-0.5">
                Prepared for Netcare Limited &mdash; Board of Directors
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#1D3443]/30 block">Document Reference</span>
              <span className="text-[11px] font-metric text-[#1D3443]/45">VCR-2026-HB-001</span>
            </div>
          </div>

          <div className="flex justify-center mt-8 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-px bg-[#E3964C]/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E3964C]/40" />
              <div className="w-6 h-px bg-[#E3964C]/30" />
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
}
