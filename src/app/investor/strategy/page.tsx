"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Layers, Shield, TrendingUp, Globe, Zap, Target,
  ChevronDown, CheckCircle2, Lock, Eye, Building2, Brain,
  Users, CreditCard, Plug, Clock, ArrowRight, Sparkles,
  BarChart3, Award, FileText, Scale, Server, Database,
  Network, Workflow, Package, ShieldCheck, AlertTriangle,
} from "lucide-react";

/* ───────────────────── Animations ───────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ───────────────────── Data ───────────────────── */
const products = [
  {
    name: "Netcare Health OS",
    mapsTo: "Command + Core Platform",
    memoProduct: "Netcare Health OS Command",
    icon: HeartPulse,
    color: "#10b981",
    status: "Market Ready",
    description: "Complete AI-powered practice management — patients, billing, compliance, AI agents, workflow automation.",
  },
  {
    name: "Placeo Health",
    mapsTo: "Route + Passport",
    memoProduct: "Netcare Health OS Route + Passport",
    icon: Building2,
    color: "#8B5CF6",
    status: "Concept",
    description: "Patient placement and referral network — intelligent matching based on specialty, location, availability, medical aid.",
  },
  {
    name: "Visio Health Integrator",
    mapsTo: "Connect",
    memoProduct: "Netcare Health OS Connect",
    icon: Plug,
    color: "#6366F1",
    status: "Concept",
    description: "Integration hub for labs (PathCare, Lancet), pharmacies (Dis-Chem), hospitals, and medical aid schemes.",
  },
  {
    name: "Visio Waiting Room",
    mapsTo: "New Product",
    memoProduct: "Digital Queue Experience",
    icon: Clock,
    color: "#0ea5e9",
    status: "Concept",
    description: "QR check-in, real-time queue display, digital intake forms, SMS notifications when doctor is ready.",
  },
  {
    name: "Netcare Health OS Payer Connect",
    mapsTo: "Claims Intelligence",
    memoProduct: "Claims/Institution Intelligence",
    icon: CreditCard,
    color: "#f59e0b",
    status: "Idea",
    description: "Medical aid bridge — real-time eligibility, automated ICD-10 claims, co-pay calculator, payment tracking.",
  },
  {
    name: "VisioMed AI",
    mapsTo: "Intelligence",
    memoProduct: "Netcare Health OS Intelligence",
    icon: Brain,
    color: "#ec4899",
    status: "Concept",
    description: "Clinical decision support — differential diagnosis, drug interactions, SA treatment guidelines, voice-to-notes.",
  },
];

const architectureLayers = [
  { layer: 8, name: "Product / Network", desc: "User interfaces, APIs, SDKs, marketplace, and network effects", color: "#8B5CF6", icon: Package },
  { layer: 7, name: "Workflow / Orchestration", desc: "Patient flows, referral workflows, billing pipelines, task management, agent coordination", color: "#7C3AED", icon: Workflow },
  { layer: 6, name: "Trust / Governance", desc: "Identity, RBAC, consent management, audit logging, POPIA/HPCSA compliance, trust scores", color: "#6D28D9", icon: ShieldCheck },
  { layer: 5, name: "Intelligence Graph", desc: "Knowledge graph connecting patients, providers, institutions, procedures, conditions, medications", color: "#5B21B6", icon: Network },
  { layer: 4, name: "Proprietary Data Layer", desc: "Healthcare ontology, entity resolution, data normalisation, master data model", color: "#4C1D95", icon: Database },
  { layer: 3, name: "AI / Knowledge Operations", desc: "LLM hosting, RAG pipelines, vector stores, agent orchestration, medical knowledge bases", color: "#3B0764", icon: Brain },
  { layer: 2, name: "Cloud-Native Operating", desc: "Containers, auto-scaling, CI/CD, observability, multi-region, no hyperscaler lock-in", color: "#2E1065", icon: Server },
  { layer: 1, name: "Sovereign Infrastructure", desc: "Compute, storage, networking, encryption, HSM key management, data residency", color: "#1E0A3E", icon: Lock },
];

const flywheelSteps = [
  { step: "Ingest", desc: "Raw data from practices, patients, labs, pharmacies, medical aids" },
  { step: "Validate", desc: "Completeness, accuracy, and compliance checks" },
  { step: "Normalise", desc: "Map to proprietary ontology — canonical entity resolution" },
  { step: "Link", desc: "Connect to intelligence graph — discover new relationships" },
  { step: "Govern", desc: "Access controls, consent checks, audit trails, provenance" },
  { step: "Enrich", desc: "Add risk scores, trust scores, recommendations, predictions" },
  { step: "Score", desc: "Rank providers, claims, patients — quality and engagement" },
  { step: "Activate", desc: "Power routing, workflows, notifications, dashboards" },
  { step: "Learn", desc: "Usage patterns and outcomes improve models continuously" },
];

const assetClasses = [
  { name: "Health Identity Framework", desc: "Cross-system patient & provider identity resolution", icon: Users },
  { name: "Healthcare Ontology", desc: "SA-specific classification beyond ICD-10 and SNOMED CT", icon: Database },
  { name: "Health Intelligence Graph", desc: "Network of relationships between all healthcare entities", icon: Network },
  { name: "Care-Routing Engine", desc: "Optimal patient-to-provider matching algorithms", icon: Target },
  { name: "Continuity-of-Care Engine", desc: "Cross-provider handoff protocols and follow-up triggers", icon: ArrowRight },
  { name: "Trust Engine", desc: "Computed trust and risk ratings for all entities", icon: Shield },
  { name: "Claims/Institution Intelligence", desc: "Aggregated medical aid and hospital performance data", icon: BarChart3 },
  { name: "Workflow Intelligence Library", desc: "Optimised workflow templates by specialty and scenario", icon: Workflow },
  { name: "Derived Intelligence Models", desc: "ML models for prediction, recommendation, and anomaly detection", icon: Sparkles },
  { name: "Cross-Border Operating Logic", desc: "Multi-jurisdiction rules for data, licensing, and compliance", icon: Globe },
];

const marketData = [
  { label: "SA Healthcare Market", value: "R180B+", detail: "Total addressable market — private healthcare spending" },
  { label: "ENT Market", value: "R3-5B", detail: "380-420 specialists nationally, highest tonsillectomy rate globally" },
  { label: "Oncology Market", value: "R12B+", detail: "Only ~200 oncologists in SA, growing at 14% CAGR" },
  { label: "Digital Competition", value: "Zero", detail: "No SA practice has AI triage, patient portals, or online booking" },
  { label: "POPIA Health Regs", value: "March 2026", detail: "New health data regulations just dropped — first-mover advantage" },
  { label: "Private Practices", value: "12,000+", detail: "Target addressable market for practice management" },
];

const unitEconomics = [
  { label: "COGS per Practice", value: "R440 – R1,450/mo" },
  { label: "Gross Margin", value: "97 – 98%" },
  { label: "Client ROI", value: "3 – 4.5x" },
  { label: "ROI Driver (GP)", value: "+4 patients/day" },
  { label: "ROI Driver (Specialist)", value: "+1-2 patients/day" },
  { label: "R1M MRR Target", value: "20 clients x R50K" },
  { label: "Annual Revenue Target", value: "R12M" },
  { label: "Annual Gross Profit", value: "R11.7M" },
];

const traction = [
  { label: "Platform Pages", value: "141", icon: Layers },
  { label: "API Routes", value: "50+", icon: Zap },
  { label: "AI Agents", value: "5", icon: Brain },
  { label: "Referral Leads", value: "108", icon: Users },
  { label: "Regulations Mapped", value: "7", icon: Shield },
  { label: "AI Courses Designed", value: "5", icon: Award },
];

/* ───────────────────── Collapsible Section ───────────────────── */
function Section({
  id,
  number,
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      custom={0}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#8B5CF6]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#8B5CF6] font-semibold uppercase tracking-wider mb-0.5">Section {number}</p>
          <h2 className="text-lg font-bold text-gray-900 font-serif">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────── Page ───────────────────── */
export default function InvestorStrategyPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <HeartPulse className="w-7 h-7 text-[#8B5CF6]" />
            <span className="text-[#8B5CF6] font-medium text-sm uppercase tracking-widest">Netcare Health OS</span>
            <span className="ml-auto bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/30">
              Confidential
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Proprietary Strategy Memorandum</h1>
          <p className="text-gray-400 text-sm">
            Sovereign AI-native healthcare intelligence infrastructure — extended with market validation, unit economics, and live traction data.
          </p>
          <p className="text-gray-500 text-xs mt-3">Prepared March 2026 | For authorised recipients only</p>
        </div>
      </motion.div>

      {/* ── Section 1: Strategic Thesis ── */}
      <Section id="thesis" number="1" title="Strategic Thesis" icon={Target} defaultOpen={true}>
        <div className="space-y-4">
          <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Netcare Health OS is positioned as a <strong>sovereign, AI-native healthcare intelligence infrastructure company</strong>.
              Not a telemedicine app or EMR clone — it is the underlying movement layer for healthcare data, permissions,
              workflows, and decision-making. Infrastructure categories own transformation logic, graph relationships, and trust controls.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Market Opportunity</p>
              <p className="text-2xl font-bold text-gray-900 font-serif">R180B+</p>
              <p className="text-sm text-gray-600 mt-1">SA private healthcare market. 12,000+ private practices. Zero digital competition in ENT, oncology, or dental AI.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Mission</p>
              <p className="text-lg font-bold text-[#8B5CF6] font-serif">&ldquo;Saving Time Saves Lives&rdquo;</p>
              <p className="text-sm text-gray-600 mt-1">Every minute a doctor spends on admin is a minute not spent on patients. We eliminate the admin layer entirely.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Not a feature", value: "An infrastructure layer" },
              { label: "Not a tool", value: "An intelligence engine" },
              { label: "Not a product", value: "A platform that generates products" },
              { label: "Not regional", value: "Architecturally global, Africa first" },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">{item.label}</p>
                <p className="text-xs text-gray-800 font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section 2: Product Ecosystem ── */}
      <Section id="products" number="2" title="The 6-Product Ecosystem" icon={Package}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Each product maps to a layer of the proprietary strategy memorandum. Together, they form a complete ecosystem from patient discovery to claim settlement.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {products.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-[#8B5CF6]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}15` }}>
                  <p.icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white ${p.status === "Market Ready" ? "bg-[#3DA9D1]" : p.status === "Idea" ? "bg-amber-500" : "bg-purple-500"}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B5CF6] font-medium mb-1">Maps to: {p.memoProduct}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Section 3: Architecture ── */}
      <Section id="architecture" number="3" title="8-Layer Architecture Stack" icon={Layers}>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-4">
            Full-stack architecture from sovereign infrastructure to product network. Each layer builds on the one below — creating compounding defensibility.
          </p>
          {architectureLayers.map((layer, i) => (
            <motion.div
              key={layer.layer}
              variants={fadeUp}
              custom={i}
              className="flex items-center gap-4 rounded-lg p-3 border transition-all hover:shadow-sm"
              style={{
                backgroundColor: `${layer.color}08`,
                borderColor: `${layer.color}25`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: layer.color }}
              >
                L{layer.layer}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">{layer.name}</h3>
                <p className="text-xs text-gray-600">{layer.desc}</p>
              </div>
              <layer.icon className="w-4 h-4 shrink-0" style={{ color: layer.color }} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Section 4: Flywheel ── */}
      <Section id="flywheel" number="4" title="Data Enrichment Flywheel" icon={TrendingUp}>
        <div className="space-y-5">
          {/* Original flywheel */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Platform Intelligence Cycle</p>
            <div className="flex flex-wrap gap-2 items-center">
              {flywheelSteps.map((s, i) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-lg px-3 py-2 text-center min-w-[90px]">
                    <p className="text-xs font-bold text-[#8B5CF6]">{s.step}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.desc}</p>
                  </div>
                  {i < flywheelSteps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B5CF6]/40 shrink-0" />
                  )}
                </div>
              ))}
              <ArrowRight className="w-3.5 h-3.5 text-[#8B5CF6]/40" />
              <span className="text-[11px] text-[#8B5CF6] font-bold italic">(repeat)</span>
            </div>
          </div>

          {/* Actual GP referral flywheel */}
          <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-4">
            <p className="text-xs text-[#1D3443] font-semibold uppercase tracking-wider mb-3">Live GP Referral Flywheel</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                "108 Leads Identified",
                "GPs Join Network",
                "Refer Patients",
                "Specialist Manages via OS",
                "Feedback Sent to GP",
                "More Referrals",
                "GPs Upgrade",
                "Network Grows",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="bg-[#3DA9D1] text-[#152736] px-3 py-1.5 rounded-md font-medium border border-[#3DA9D1]">
                    {step}
                  </span>
                  {i < 7 && <ArrowRight className="w-3 h-3 text-[#3DA9D1] shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#1D3443] mt-3">
              <strong>Compounding effect:</strong> More institutions = more data = better graph = better routing = harder to replace = more institutions join.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Section 5: Market Validation ── */}
      <Section id="market" number="5" title="Market Validation" icon={Globe}>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            {marketData.map((m) => (
              <div key={m.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium">{m.label}</p>
                <p className="text-xl font-bold text-gray-900 font-serif">{m.value}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">{m.detail}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">Why Now?</p>
            </div>
            <ul className="text-sm text-blue-800 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>POPIA Health Information Regulations dropped March 2026 — practices now legally required to digitise consent, audit trails, and data handling. We are already compliant.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>No SA competitor offers AI triage, online booking, or digital patient portals for specialists. The gap is massive.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>International tools (Jane App, Cliniko, SimplePractice) do not handle SA medical aids, ICD-10 SA MIT codes, or POPIA. They cannot compete here.</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Section 6: Unit Economics ── */}
      <Section id="economics" number="6" title="Unit Economics" icon={BarChart3}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {unitEconomics.map((u) => (
              <div key={u.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{u.label}</p>
                <p className="text-lg font-bold text-gray-900 font-serif mt-1">{u.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-4">
            <p className="text-sm text-[#152736]">
              <strong>Key insight:</strong> Infrastructure costs (Supabase, Anthropic API, Vercel, ElevenLabs) scale sub-linearly.
              At 20 clients, gross margin exceeds 97%. At 100 clients, COGS per client drops below R200/month as fixed costs are amortised.
              Software margins with near-zero marginal cost of delivery.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Section 7: Current Traction ── */}
      <Section id="traction" number="7" title="Current Traction" icon={Zap}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {traction.map((t) => (
              <div key={t.label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                  <t.icon className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 font-serif">{t.value}</p>
                  <p className="text-xs text-gray-500">{t.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">First Investor-Client</p>
              <p className="text-sm text-purple-800">
                <strong>Dr. Mogau Lamola</strong> — ENT Surgeon, Netcare Park Lane, Head of ENT at Nelson Mandela Children&apos;s Hospital.
                Active advisory role + investment discussions in progress.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">Live Platform Features</p>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>GP referral portal live and active</li>
                <li>108 referral leads identified (74 with contact details)</li>
                <li>Full POPIA compliance dashboard</li>
                <li>5 AI education courses designed</li>
                <li>7 SA healthcare regulations mapped</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 8: Ownership & IP ── */}
      <Section id="ownership" number="8" title="Ownership & Intellectual Property" icon={Lock}>
        <div className="space-y-4">
          <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>&ldquo;Open standards in, proprietary intelligence out.&rdquo;</strong> — We consume open standards (HL7 FHIR, ICD-10, SNOMED CT)
              but produce proprietary intelligence that cannot be replicated by adopting the same standards. Raw data may belong to patients and providers.
              The intelligence derived from patterns across that data belongs to the platform.
            </p>
          </div>

          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">10 Protected Asset Classes</p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-2"
          >
            {assetClasses.map((a, i) => (
              <motion.div
                key={a.name}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:border-[#8B5CF6]/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                  <a.icon className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{a.name}</p>
                  <p className="text-[11px] text-gray-500">{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#3DA9D1]" />
                <p className="text-sm font-semibold text-[#1A2F3E]">Open (Edges)</p>
              </div>
              <ul className="text-xs text-[#152736] space-y-1">
                <li>SDKs and client libraries</li>
                <li>API documentation and developer guides</li>
                <li>Integration connectors</li>
                <li>Data format specifications</li>
                <li>Educational content and training</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#8B5CF6]" />
                <p className="text-sm font-semibold text-white">Closed (Centre)</p>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>Healthcare ontology and graph</li>
                <li>Care-routing algorithms</li>
                <li>Trust scoring and risk models</li>
                <li>Workflow intelligence library</li>
                <li>Trained ML models and data</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 9: Trust & Governance ── */}
      <Section id="trust" number="9" title="Trust & Governance" icon={ShieldCheck}>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: "POPIA Compliance", desc: "Full consent tracking (treatment, data, marketing, research), automated audit logging, data minimisation, and breach notification protocols. POPIA Health Information Regulations (March 2026) — already compliant.", icon: Shield },
              { title: "Audit Logging", desc: "Every action logged immutably — patient record access, billing modifications, consent changes, system config. Complete data provenance for every record.", icon: FileText },
              { title: "Role-Based Access", desc: "Least-privilege access model. Doctor, receptionist, admin, platform admin roles. No blanket access. Emergency overrides with post-hoc review and full audit trail.", icon: Lock },
              { title: "AI as Decision Support", desc: "AI assists but humans decide on clinical diagnoses, treatment plans, billing disputes, consent withdrawal, and data deletion. Every AI recommendation includes explainability.", icon: Brain },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4 text-[#3DA9D1]" />
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-900">Risk Awareness</p>
            </div>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>Healthcare regulation changes (HPCSA, Medical Schemes Act, NHI) could impact design or market access</li>
              <li>Clinical AI carries inherent risk — platform designed as decision support only, never autonomous</li>
              <li>Cross-border expansion requires jurisdiction-specific legal and compliance work per country</li>
              <li>Healthcare procurement cycles are long (6-18 months) — revenue lags sales effort</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Section 10: Investment Terms ── */}
      <Section id="investment" number="10" title="Investment Terms" icon={Scale}>
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-5 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Round</p>
              <p className="text-2xl font-bold text-[#8B5CF6] font-serif mt-1">Pre-Seed</p>
            </div>
            <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-5 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Raising</p>
              <p className="text-2xl font-bold text-[#8B5CF6] font-serif mt-1">R1,000,000</p>
              <p className="text-xs text-gray-500 mt-1">for 10% equity</p>
            </div>
            <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-lg p-5 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pre-Money Valuation</p>
              <p className="text-2xl font-bold text-[#8B5CF6] font-serif mt-1">R10,000,000</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Use of Funds</p>
              <div className="space-y-2">
                {[
                  { label: "Client Acquisition", pct: "40%", desc: "Sales, onboarding, account management for first 20 clients" },
                  { label: "Platform Development", pct: "35%", desc: "Engineering, infrastructure, AI model costs, security audits" },
                  { label: "Team", pct: "15%", desc: "Key hires — full-stack engineer, sales lead, compliance specialist" },
                  { label: "Operations", pct: "10%", desc: "Legal, compliance, office, travel, professional services" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#8B5CF6] w-10 text-right">{item.pct}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">{item.label}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Current Investor Relations</p>
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                <p className="text-sm font-bold text-gray-900">Dr. Mogau Lamola</p>
                <p className="text-xs text-gray-500">ENT Surgeon, Netcare Park Lane</p>
                <p className="text-xs text-gray-500">Head of ENT, Nelson Mandela Children&apos;s Hospital</p>
                <p className="text-xs text-[#8B5CF6] font-medium mt-1">Advisory role + investment in discussion</p>
              </div>
              <p className="text-xs text-gray-600">
                First client-investor model — practitioners who use the platform invest in the ecosystem
                they depend on, creating strong alignment between product success and investor returns.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer: Confidential Disclaimer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gray-900 rounded-xl p-6 text-gray-400 text-[11px] leading-relaxed space-y-3"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-red-400" />
          <p className="text-red-400 font-bold text-xs uppercase tracking-wider">Confidential — For Authorised Recipients Only</p>
        </div>
        <p>
          This document contains confidential and proprietary information belonging to Netcare Health OS (Pty) Ltd.
          It is intended solely for the use of the individual(s) to whom it is addressed. If you are not the intended
          recipient, you are hereby notified that any disclosure, copying, distribution, or taking of any action in
          reliance on the contents of this document is strictly prohibited and may be unlawful.
        </p>
        <p>
          This memorandum is provided for informational and strategic planning purposes only. It does not constitute
          an offer to sell securities, a solicitation of investment, or a guarantee of future performance.
          Forward-looking statements contained herein are based on current expectations and assumptions and are
          subject to risks, uncertainties, and changes in circumstances.
        </p>
        <p className="text-gray-500">
          &copy; 2026 Netcare Health OS. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
