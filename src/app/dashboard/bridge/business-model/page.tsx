"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Building2, Users, Zap, Shield,
  CheckCircle2, ArrowRight, Globe, Heart, Target, Layers,
  BarChart3, Clock, Brain, Radio, Rocket, Star,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

// ── Revenue Projection Data ──

const PROJECTIONS = [
  { year: "Year 1 (Pilot)", clinics: 5, saas: 270_000, share: 960_000, data: 0, total: 1_230_000 },
  { year: "Year 2 (Netcare)", clinics: 40, saas: 2_160_000, share: 7_700_000, data: 500_000, total: 10_360_000 },
  { year: "Year 3 (+ Life)", clinics: 120, saas: 6_480_000, share: 23_100_000, data: 3_000_000, total: 32_580_000 },
  { year: "Year 5 (Scale)", clinics: 400, saas: 21_600_000, share: 77_000_000, data: 10_000_000, total: 108_600_000 },
];

const TIERS = [
  { name: "Starter", price: "R2,500", target: "Independent GPs", features: ["Claims validation", "ICD-10 AI coding", "Basic analytics", "Email support"], color: "#3DA9D1" },
  { name: "Professional", price: "R4,500", target: "Clinic groups (5-20 sites)", features: ["Everything in Starter", "CareOn Bridge", "Rejection prediction", "Scheme rules engine", "Priority support"], color: "#E3964C", popular: true },
  { name: "Enterprise", price: "R8,500", target: "Hospital groups", features: ["Everything in Professional", "Full HL7v2 integration", "FHIR R4 endpoints", "Custom AI models", "Dedicated SLA", "On-site deployment"], color: "#1D3443" },
];

const SHARE_MODELS = [
  { mechanism: "Rejected claim recovery", cut: "15-20%", reason: "They weren't getting this money at all. 15% of something beats 100% of nothing.", value: "R3.24M/yr", icon: Target },
  { mechanism: "DRG coding uplift", cut: "10%", reason: "AI found codes they missed. Pure upside they didn't know existed.", value: "R5.94M/yr", icon: Brain },
  { mechanism: "CDL patient detection", cut: "R500/patient", reason: "You found the undiagnosed chronic patient. They get R8,400/yr ongoing.", value: "R7.65M/yr", icon: Heart },
];

const PHASES = [
  { phase: "Phase 1", title: "Netcare Pilot", timeline: "Month 1-3", clinics: 5, description: "5 Medicross clinics in Gauteng. Prove rejection rate drops from 15% to <5%. Revenue share = zero upfront risk. Sara Nayager champions internally.", color: "#3DA9D1" },
  { phase: "Phase 2", title: "Netcare Rollout", timeline: "Month 4-12", clinics: 88, description: "40 clinics, then 88. Add revenue share on DRG uplift. Thirushen Pillay sees R10M+ recovery in first year. Case study published.", color: "#E3964C" },
  { phase: "Phase 3", title: "Second Hospital Group", timeline: "Month 12-18", clinics: 186, description: "Life Healthcare (66 hospitals) or Mediclinic (52). Leverage Netcare case study. SaaS + revenue share model proven.", color: "#8B5CF6" },
  { phase: "Phase 4", title: "NHI Readiness", timeline: "Month 18-36", clinics: 400, description: "Government NHI requires FHIR interoperability. You're the only platform already speaking FHIR R4. Every public hospital and clinic becomes a customer.", color: "#1D3443" },
];

const MOATS = [
  { barrier: "CareOn Access", detail: "Relationship with Deutsche Telekom Clinical Solutions + Netcare IT. Takes 12-18 months to negotiate. We've already started.", icon: Shield },
  { barrier: "HL7v2 Parsing", detail: "No SA billing vendor has built an HL7v2 parser. They speak PHISC EDIFACT for claims, not hospital messaging.", icon: Radio },
  { barrier: "AI Coding Engine", detail: "Rule-based systems validate codes. Only AI can suggest codes the doctor missed. Requires LLM integration + SA medical coding expertise.", icon: Brain },
  { barrier: "Scheme Intelligence", detail: "AI knows Discovery vs Bonitas vs GEMS rejection patterns. Proprietary intelligence that improves with every claim processed.", icon: BarChart3 },
  { barrier: "FHIR R4 Readiness", detail: "When NHI rolls out requiring FHIR interoperability, we're already compliant. Competitors will scramble.", icon: Globe },
  { barrier: "Full Pipeline", detail: "Bridge (clinical data) + Healthbridge (claims validation) + Switch Engine (delivery). No one else in SA has all three connected.", icon: Layers },
];

const IMPACT_LAYERS = [
  { who: "CFO / Finance Director", icon: DollarSign, color: "#10B981", points: [
    "R139M/year total benefit at Netcare scale",
    "2,800% ROI on platform cost",
    "85 FTE equivalent in admin time returned to patient care",
    "Measurable KPI: rejection rate drops from 15% to <5% within 90 days",
  ]},
  { who: "MD / Clinical Lead", icon: Heart, color: "#EF4444", points: [
    "15,300 undiagnosed chronic patients detected per year",
    "Critical lab values flagged in real-time",
    "Doctors spend 15-20 min more per day on actual patient care",
    "CDL programme enrollment improves long-term health outcomes",
  ]},
  { who: "COO / Operations", icon: Building2, color: "#3DA9D1", points: [
    "Zero double-entry between CareOn and billing",
    "Automated pre-authorization compliance",
    "Real-time facility monitoring across the network",
    "Staff focus on exceptions, not routine processing",
  ]},
  { who: "Legal / POPIA Officer", icon: Shield, color: "#8B5CF6", points: [
    "Full audit trail on every patient data access",
    "Role-based de-identification (Section 14 & 19 compliant)",
    "Read-only architecture = zero data integrity risk",
    "5-year retention capability for regulatory requirements",
  ]},
];

export default function BusinessModelPage() {
  return (
    <div className="p-6 space-y-10 max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div {...fadeIn} className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-12 bg-[#E3964C]/30" />
          <span className="text-[10px] text-[#E3964C] uppercase tracking-[0.2em] font-semibold">Business Model</span>
          <div className="h-px w-12 bg-[#E3964C]/30" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          How We Make Money<br />
          <span className="text-[#3DA9D1]">and Change Healthcare</span>
        </h1>
        <p className="text-[14px] text-gray-500 mt-3 max-w-2xl mx-auto">
          Three revenue layers. Zero upfront risk for clients. Revenue share on money they weren&apos;t getting anyway.
          The pitch in one line: <em>&ldquo;Can we recover your R21M in rejected claims and keep 15%?&rdquo;</em>
        </p>
      </motion.div>

      {/* ── The Pipeline Explainer ── */}
      <Section icon={Layers} title="The Full Pipeline — Why All Three Tools Matter" color="#1D3443">
        <div className="p-5 rounded-xl bg-[#1D3443] text-white overflow-x-auto">
          <pre className="text-[11px] leading-relaxed font-mono text-white/70">
{`DOCTOR works in CareOn (clinical notes, labs, admissions)
        |
        | HL7v2 messages (automatic, real-time)
        v
  +-- CareOn BRIDGE --+     "Here's what the doctor did,
  |  AI reads clinical |      and here's how to bill for it"
  |  data and suggests |     Catches R21.6M in missed revenue
  |  billing codes     |     BEFORE anyone touches billing
  +--------+-----------+
           |  ICD-10 codes + advisories
           v
  +-- HEALTHBRIDGE ----+     The smart cash register
  |  Validate codes    |     Catches errors DURING billing
  |  Build the claim   |     AI autocorrect + scheme rules
  |  Check scheme rules|
  +--------+-----------+
           |  Clean, validated claim
           v
  +-- SWITCH ENGINE ---+     The delivery driver
  |  Route to Discovery|     Delivers claim AFTER billing
  |  Route to Bonitas  |     Brings back the eRA receipt
  |  Get eRA back      |
  +--------------------+
           |
           v
     MEDICAL AID PAYS (< 5% rejection rate)`}
          </pre>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <PipelineCard title="CareOn Bridge" timing="BEFORE billing" what="Listens to the doctor's clinical work and auto-generates billing advisories" color="#3DA9D1" />
          <PipelineCard title="Healthbridge" timing="DURING billing" what="Validates codes, catches errors, checks scheme rules as the claim is built" color="#E3964C" />
          <PipelineCard title="Switch Engine" timing="AFTER billing" what="Delivers the claim to the medical aid and brings back the payment receipt" color="#1D3443" />
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mt-4">
          <div className="text-[11px] text-amber-800 font-semibold">Why you need all three</div>
          <div className="text-[11px] text-amber-700 mt-1">
            Bridge without Healthbridge = great suggestions, nobody validates them.
            Healthbridge without Bridge = validates what the receptionist types, but misses what the doctor forgot.
            Both without Switch Engine = perfect claim sitting on a desk with no way to send it.
            <strong> Together: doctor finishes → AI prepares → system validates → claim delivered. End to end.</strong>
          </div>
        </div>
      </Section>

      {/* ── Revenue Model 1: SaaS ── */}
      <Section icon={DollarSign} title="Revenue Layer 1: SaaS Platform Fee" color="#3DA9D1">
        <p>The safe, predictable baseline. Monthly per-clinic subscription.</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`p-5 rounded-xl border-2 bg-white relative ${tier.popular ? "border-[#E3964C] shadow-lg" : "border-gray-200"}`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#E3964C] text-white text-[9px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-4">
                <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: tier.color }}>{tier.name}</div>
                <div className="text-3xl font-bold text-gray-900 mt-1 font-metric">{tier.price}</div>
                <div className="text-[11px] text-gray-400">per clinic / month</div>
                <div className="text-[11px] text-gray-500 mt-1">{tier.target}</div>
              </div>
              <div className="space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <span className="text-[12px] text-gray-500">At Netcare scale: 88 clinics x R4,500 = </span>
          <span className="text-[14px] font-bold text-[#1D3443]">R4.75M/year</span>
        </div>
      </Section>

      {/* ── Revenue Model 2: Revenue Share ── */}
      <Section icon={TrendingUp} title="Revenue Layer 2: Revenue Share (The Real Money)" color="#E3964C">
        <div className="p-4 rounded-xl bg-[#E3964C]/10 border border-[#E3964C]/20 mb-4">
          <div className="text-[13px] font-semibold text-[#E3964C]">The Pitch</div>
          <div className="text-[14px] text-gray-800 mt-1 italic">
            &ldquo;We don&apos;t charge you to fix your billing. We take 15% of the money you weren&apos;t getting anyway.&rdquo;
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            No budget approval needed. No capex. No procurement committee. Pure upside.
          </div>
        </div>

        <div className="space-y-3">
          {SHARE_MODELS.map((model) => (
            <div key={model.mechanism} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="w-10 h-10 rounded-lg bg-[#E3964C]/10 flex items-center justify-center shrink-0">
                <model.icon className="w-5 h-5 text-[#E3964C]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-gray-900">{model.mechanism}</span>
                  <span className="text-[14px] font-bold text-[#E3964C] font-metric">{model.value}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#E3964C]/10 text-[#E3964C] text-[11px] font-bold">{model.cut}</span>
                  <span className="text-[11px] text-gray-500">{model.reason}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4 p-4 rounded-xl bg-[#1D3443]">
          <span className="text-[12px] text-white/50">Total revenue share at Netcare scale: </span>
          <span className="text-2xl font-bold text-white font-metric">R16.83M/year</span>
        </div>
      </Section>

      {/* ── Revenue Model 3: Data Intelligence ── */}
      <Section icon={Globe} title="Revenue Layer 3: Data Intelligence Licensing (Long Game)" color="#8B5CF6">
        <p>Anonymized, aggregated insights from processing millions of claims. Only possible once you have 100+ clinics flowing data.</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { product: "Scheme rejection patterns", buyer: "Medical aids (Discovery, Bonitas, GEMS)", value: "Helps them reduce their own processing costs" },
            { product: "Clinical coding benchmarks", buyer: "CMS (Council for Medical Schemes)", value: "Industry-wide coding quality metrics" },
            { product: "Drug utilization patterns", buyer: "Pharmaceutical companies", value: "Anonymized prescribing trends by region" },
            { product: "Regional health trends", buyer: "Provincial DoH / NHI planning", value: "Population health intelligence for policy" },
          ].map((item) => (
            <div key={item.product} className="p-3 rounded-lg border border-purple-100 bg-purple-50/30">
              <div className="text-[12px] font-semibold text-purple-900">{item.product}</div>
              <div className="text-[11px] text-purple-700 mt-0.5">Buyer: {item.buyer}</div>
              <div className="text-[10px] text-gray-500 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-3">
          <span className="text-[12px] text-gray-500">Estimated: </span>
          <span className="text-[14px] font-bold text-[#8B5CF6]">R2-10M/year</span>
          <span className="text-[12px] text-gray-500"> (scales with clinic count)</span>
        </div>
      </Section>

      {/* ── Revenue Projection Table ── */}
      <Section icon={BarChart3} title="Revenue Projection" color="#10B981">
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Period", "Clinics", "SaaS", "Revenue Share", "Data Intel", "Total"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTIONS.map((row, i) => (
                <motion.tr key={row.year} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-[12px] font-medium text-gray-900">{row.year}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{row.clinics}</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">R{(row.saas / 1_000_000).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-[12px] text-[#E3964C] font-semibold">R{(row.share / 1_000_000).toFixed(1)}M</td>
                  <td className="px-4 py-3 text-[12px] text-gray-600">{row.data > 0 ? `R${(row.data / 1_000_000).toFixed(1)}M` : "—"}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#1D3443] font-metric">R{(row.total / 1_000_000).toFixed(1)}M</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual bar chart */}
        <div className="mt-6 space-y-3">
          {PROJECTIONS.map((row) => {
            const maxTotal = PROJECTIONS[PROJECTIONS.length - 1].total;
            const pctSaas = (row.saas / maxTotal) * 100;
            const pctShare = (row.share / maxTotal) * 100;
            const pctData = (row.data / maxTotal) * 100;
            return (
              <div key={row.year}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-gray-700">{row.year}</span>
                  <span className="text-[12px] font-bold text-gray-900 font-metric">R{(row.total / 1_000_000).toFixed(1)}M</span>
                </div>
                <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pctSaas}%` }} transition={{ duration: 0.8 }} className="h-full bg-[#3DA9D1]" title="SaaS" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pctShare}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full bg-[#E3964C]" title="Revenue Share" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pctData}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-[#8B5CF6]" title="Data Intel" />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-6 mt-2 justify-center">
            <Legend color="#3DA9D1" label="SaaS" />
            <Legend color="#E3964C" label="Revenue Share" />
            <Legend color="#8B5CF6" label="Data Intelligence" />
          </div>
        </div>
      </Section>

      {/* ── Go-To-Market ── */}
      <Section icon={Rocket} title="Go-To-Market: 4 Phases" color="#E3964C">
        <div className="space-y-4">
          {PHASES.map((p, i) => (
            <motion.div key={p.phase} {...fadeIn} transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[14px]" style={{ backgroundColor: p.color }}>
                  {p.clinics}
                </div>
                <div className="text-[9px] text-gray-400 text-center mt-1">clinics</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.phase}</span>
                  <span className="text-[13px] font-semibold text-gray-900">{p.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500 font-medium">{p.timeline}</span>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed">{p.description}</p>
              </div>
              {i < PHASES.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />}
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Competitive Moat ── */}
      <Section icon={Shield} title="Competitive Moat — Why No One Can Copy This" color="#1D3443">
        <div className="grid grid-cols-2 gap-3">
          {MOATS.map((moat) => (
            <div key={moat.barrier} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white">
              <div className="w-8 h-8 rounded-lg bg-[#1D3443]/10 flex items-center justify-center shrink-0">
                <moat.icon className="w-4 h-4 text-[#1D3443]" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-gray-900">{moat.barrier}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{moat.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Impact Layers ── */}
      <Section icon={Target} title="Impact by Stakeholder" color="#10B981">
        <div className="grid grid-cols-2 gap-4">
          {IMPACT_LAYERS.map((layer) => (
            <div key={layer.who} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${layer.color}15` }}>
                  <layer.icon className="w-3.5 h-3.5" style={{ color: layer.color }} />
                </div>
                <span className="text-[13px] font-semibold text-gray-900">{layer.who}</span>
              </div>
              <div className="space-y-2">
                {layer.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: layer.color }} />
                    <span className="text-[11px] text-gray-600">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── VisioCorp Innovation ── */}
      <motion.div {...fadeIn} className="p-6 rounded-xl bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] text-white">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-[#E3964C]" />
          <span className="text-[16px] font-semibold">VisioCorp — A South African Innovation Story</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              VisioCorp built what no SA company has: a <strong className="text-white">complete pipeline from hospital bedside to medical aid payment</strong>.
              Not a point solution. Not a feature. A platform that connects the entire healthcare billing
              chain — from the moment a doctor sees a patient in CareOn, through AI-powered coding,
              claims validation, and electronic submission.
            </p>
            <p className="text-[12px] text-white/70 leading-relaxed mt-3">
              This isn&apos;t incremental improvement. This is a new category — <strong className="text-white">Healthcare Revenue Intelligence</strong> —
              where AI doesn&apos;t just validate what humans typed, but discovers revenue the humans missed entirely.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Market First", stat: "Only SA platform parsing HL7v2 from hospital EMR with AI advisory" },
              { label: "NHI Ready", stat: "FHIR R4 compliant before the mandate. First-mover advantage." },
              { label: "Proven Model", stat: "Revenue share = zero risk adoption. Aligned incentives." },
              { label: "R108M+ by Year 5", stat: "Three revenue streams. Scales with every new hospital group." },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-white/[0.06]">
                <div className="text-[11px] font-semibold text-[#E3964C]">{item.label}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{item.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-200">
        <div className="text-[13px] font-semibold text-gray-900 mb-1">
          &ldquo;Can we recover your R21M in rejected claims and keep 15%?&rdquo;
        </div>
        <div className="text-[11px] text-gray-400">The answer is always yes.</div>
        <div className="text-[10px] text-gray-400 mt-4">
          Confidential — VisioCorp Business Model | March 2026
        </div>
      </div>
    </div>
  );
}

// ── Components ──

function Section({ icon: Icon, title, color, children }: {
  icon: typeof DollarSign; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h2 className="text-[18px] font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="text-[13px] text-gray-700 leading-relaxed">
        {children}
      </div>
    </motion.section>
  );
}

function PipelineCard({ title, timing, what, color }: { title: string; timing: string; what: string; color: string }) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white text-center">
      <div className="text-[12px] font-bold" style={{ color }}>{title}</div>
      <div className="px-2 py-0.5 rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider inline-block mt-1">{timing}</div>
      <div className="text-[11px] text-gray-500 mt-2">{what}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
