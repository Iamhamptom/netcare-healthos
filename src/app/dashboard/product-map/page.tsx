"use client";

import { useState } from "react";
import {
  Activity, Brain, Shield, DollarSign, Heart, Users, Building2,
  ArrowRight, ArrowDown, Zap, TrendingUp, Lock, Globe, Mic,
  FileText, CheckCircle2, BarChart3, Target, RefreshCcw,
  Stethoscope, Pill, Calendar, MessageSquare, Router, Network,
  Layers, Eye, Server, Monitor, Clock, AlertTriangle
} from "lucide-react";

type MapView = "value-chain" | "product-suite" | "roi-flow" | "data-flow";

export default function ProductMapPage() {
  const [view, setView] = useState<MapView>("value-chain");

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.03)_1px,transparent_1px),linear_gradient(90deg,rgba(61,169,209,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl">
              <Layers className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em]">Visio Research Labs</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Product Map & Value Chain</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400">How every product, tool, and agent creates value across the healthcare workflow.</p>
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
          {[
            { id: "value-chain" as MapView, label: "Value Chain" },
            { id: "product-suite" as MapView, label: "Product Suite" },
            { id: "roi-flow" as MapView, label: "ROI Flow" },
            { id: "data-flow" as MapView, label: "Data Flow" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                view === t.id ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30" : "text-slate-500 hover:text-slate-300"
              }`}>{t.label}</button>
          ))}
        </div>

        {/* VALUE CHAIN */}
        {view === "value-chain" && (
          <div className="space-y-6">
            {/* The chain */}
            {[
              {
                phase: "CAPTURE",
                color: "#3DA9D1",
                icon: Mic,
                title: "Clinical Encounter",
                products: [
                  { name: "AI Medical Scribe", detail: "Ambient recording → live transcription → SOAP notes", saves: "15 min/consultation" },
                  { name: "Clinical Intake", detail: "Text/photo/voice → structured clinical data → ICD-10", saves: "10 min/patient" },
                  { name: "CareOn Bridge", detail: "HL7v2 from hospitals → FHIR R4 translation → drug alerts", saves: "Zero manual data entry" },
                ],
                valueCreated: "Doctor spends time with patient, not typing. 40 minutes saved per doctor per day.",
              },
              {
                phase: "CODE",
                color: "#10B981",
                icon: Brain,
                title: "AI Clinical Coding",
                products: [
                  { name: "VisiCode Engine", detail: "Clinical notes → ICD-10-ZA (41K codes) at max specificity", saves: "E11.40 not E11.9" },
                  { name: "NAPPI Validator", detail: "487K medicine records → formulary check → interaction screening", saves: "Zero medication errors" },
                  { name: "PMB/CDL Detector", detail: "270 DTPs + 27 CDL conditions flagged automatically", saves: "Patients get entitled benefits" },
                ],
                valueCreated: "Coding accuracy from 70% to 95%+. Every code at maximum specificity. PMB never missed.",
              },
              {
                phase: "VALIDATE",
                color: "#8B5CF6",
                icon: Shield,
                title: "Claims Intelligence",
                products: [
                  { name: "13-Rule Validation Engine", detail: "ICD-10 format, scheme rules, gender/age, unbundling, duplicates", saves: "Catches errors before submission" },
                  { name: "6 Scheme Profiles", detail: "Discovery, GEMS, Bonitas, Medshield, Momentum, Bestmed — specific rules each", saves: "No more generic validation" },
                  { name: "Auto-Fix Suggestions", detail: "AI suggests corrections with reasoning + regulatory source", saves: "R54.2M recoverable annually" },
                ],
                valueCreated: "Claims rejection rate from 5.8% → 3.0%. R54.2M in recoverable revenue across 88 clinics.",
              },
              {
                phase: "SUBMIT",
                color: "#F59E0B",
                icon: Router,
                title: "Claims Switching",
                products: [
                  { name: "Multi-Switch Router", detail: "Healthbridge / SwitchOn / MediKredit — auto-routes by scheme", saves: "Always the right switch" },
                  { name: "EDIFACT Generator", detail: "MEDCLM v0:912:ZA format — auto-generated from validated claim", saves: "Zero format errors" },
                  { name: "Circuit Breaker", detail: "3 failures → auto-failover to next switch. Billing never stops.", saves: "99.9% uptime" },
                ],
                valueCreated: "Claims reach the switch correctly formatted, on the first try, through the right channel.",
              },
              {
                phase: "RECOVER",
                color: "#EF4444",
                icon: RefreshCcw,
                title: "Revenue Recovery",
                products: [
                  { name: "eRA Reconciliation", detail: "Electronic remittance matched to submitted claims. Discrepancies flagged.", saves: "No lost payments" },
                  { name: "Rejection Analyzer", detail: "Pattern engine: which codes, schemes, clinics have highest rejection", saves: "Root cause identified" },
                  { name: "Auto-Resubmission", detail: "15 rejection codes eligible for smart retry with corrections applied", saves: "Revenue recovered automatically" },
                ],
                valueCreated: "Money that was leaving the system comes back. R54.2M/year across the Primary Care division.",
              },
              {
                phase: "ENGAGE",
                color: "#10B981",
                icon: Heart,
                title: "Patient Engagement",
                products: [
                  { name: "WhatsApp Router", detail: "Patient books, confirms, reschedules via WhatsApp. NLP intent parsing.", saves: "No missed appointments" },
                  { name: "Recall Engine", detail: "AI identifies patients overdue for care. Sends personalised reminders.", saves: "Patients come back" },
                  { name: "Engagement Sequences", detail: "Medication adherence, chronic care, post-surgical follow-up — automated", saves: "Continuous care, not episodic" },
                ],
                valueCreated: "From episodic care to engagement-led care. Patients stay connected. Outcomes improve.",
              },
              {
                phase: "PREDICT",
                color: "#7C3AED",
                icon: BarChart3,
                title: "Predictive Intelligence",
                products: [
                  { name: "Patient Flow AI", detail: "No-show prediction, schedule optimization, wait time management", saves: "R792K/year per doctor recovered" },
                  { name: "Revenue Forecasting", detail: "Claims patterns → rejection trends → revenue projections", saves: "Board-level visibility" },
                  { name: "Reinforcement Learning", detail: "Every claim outcome feeds back. System gets smarter daily.", saves: "Continuous improvement" },
                ],
                valueCreated: "The system learns. Gets smarter. Finds patterns humans miss. Predicts before problems happen.",
              },
              {
                phase: "GOVERN",
                color: "#1D3443",
                icon: Lock,
                title: "Compliance & Governance",
                products: [
                  { name: "5-Tier Rule Framework", detail: "SA law immutable → CMS circulars → PHISC → schemes → AI advisory only", saves: "Regulatory compliance guaranteed" },
                  { name: "Audit Trail", detail: "Every AI decision logged: agent, confidence, tools, verdict, PII stripped", saves: "King V Principle 10 ready" },
                  { name: "Neuro-Funnelling Security", detail: "PII stripped before AI. 37 hard gates. Injection detection. AES-256.", saves: "POPIA health regs (6 Mar 2026)" },
                ],
                valueCreated: "Board-level assurance. POPIA, HPCSA, King V, SAHPRA — all documented and enforced architecturally.",
              },
            ].map((phase, i) => (
              <div key={i}>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4">
                    {/* Phase indicator */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${phase.color}15`, color: phase.color, border: `1px solid ${phase.color}30` }}>
                        <phase.icon className="w-6 h-6" />
                      </div>
                      <div className="text-[9px] font-black mt-2 uppercase tracking-wider" style={{ color: phase.color }}>{phase.phase}</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-3">{phase.title}</h3>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {phase.products.map((p, j) => (
                          <div key={j} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                            <div className="text-xs font-bold text-white mb-1">{p.name}</div>
                            <div className="text-[10px] text-slate-500 leading-relaxed">{p.detail}</div>
                            <div className="text-[9px] font-bold mt-2" style={{ color: phase.color }}>{p.saves}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 rounded-lg text-[11px] font-bold" style={{ backgroundColor: `${phase.color}10`, color: phase.color, border: `1px solid ${phase.color}20` }}>
                        {phase.valueCreated}
                      </div>
                    </div>
                  </div>
                </div>
                {i < 7 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="w-4 h-4 text-white/20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PRODUCT SUITE */}
        {view === "product-suite" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Core Products */}
              <div className="col-span-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Core Platform</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
                    <Activity className="w-6 h-6 text-[#3DA9D1] mb-2" />
                    <h4 className="font-bold text-white">Netcare Health OS</h4>
                    <div className="text-[10px] text-[#3DA9D1] font-bold mt-1">healthos.visiocorp.co</div>
                    <div className="mt-3 text-[10px] text-slate-400 space-y-1">
                      <div>239 APIs | 161 pages | 10 agents</div>
                      <div>Claims | Coding | FHIR | Switching</div>
                      <div>Engagement | Documents | Billing</div>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
                    <h4 className="font-bold text-white">Patient Flow AI</h4>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">patient-flow-ai.vercel.app</div>
                    <div className="mt-3 text-[10px] text-slate-400 space-y-1">
                      <div>11 APIs | 11 pages | 1 agent</div>
                      <div>No-show prediction | Flow board</div>
                      <div>Schedule optimizer | Forecasting</div>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                    <Stethoscope className="w-6 h-6 text-[#8B5CF6] mb-2" />
                    <h4 className="font-bold text-white">HealthOps Platform</h4>
                    <div className="text-[10px] text-[#8B5CF6] font-bold mt-1">healthops-platform.vercel.app</div>
                    <div className="mt-3 text-[10px] text-slate-400 space-y-1">
                      <div>41 APIs | 24 pages | 5 agents</div>
                      <div>White-label | Multi-tenant</div>
                      <div>POPIA consent | Voice/TTS</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Engines */}
              <div className="col-span-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">AI Engines</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: "VisiCode", desc: "Clinical coding AI", metric: "95%+ accuracy", color: "#10B981" },
                    { name: "Claims Validator", desc: "13-rule engine", metric: "<2% false positives", color: "#8B5CF6" },
                    { name: "Neuro-Funnel", desc: "Security layer", metric: "0% PII leakage", color: "#EF4444" },
                    { name: "RL Engine", desc: "Self-improvement", metric: "Daily learning cycle", color: "#F59E0B" },
                  ].map((e, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                      <div className="text-sm font-bold text-white">{e.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{e.desc}</div>
                      <div className="text-[10px] font-bold mt-2" style={{ color: e.color }}>{e.metric}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Base */}
              <div className="col-span-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Knowledge Base (300MB)</h3>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { name: "ICD-10-ZA", count: "41,009", desc: "SA diagnosis codes" },
                    { name: "NAPPI", count: "487,086", desc: "Medicine records" },
                    { name: "RAG Chunks", count: "189,000", desc: "Searchable knowledge" },
                    { name: "Scheme Rules", count: "6 profiles", desc: "Discovery, GEMS, etc." },
                    { name: "Tariff Codes", count: "4,660+", desc: "CCSA + NHRPL" },
                  ].map((k, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                      <div className="text-lg font-black text-[#3DA9D1]">{k.count}</div>
                      <div className="text-[10px] font-bold text-white mt-1">{k.name}</div>
                      <div className="text-[9px] text-slate-500">{k.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROI FLOW */}
        {view === "roi-flow" && (
          <div className="space-y-4">
            {[
              { from: "Manual coding errors", problem: "15-20% rejection rate industry average", solution: "AI validates before submission", saving: "R54.2M/year", color: "#EF4444" },
              { from: "Resubmission processing", problem: "146,000 resubmissions/year × R85 each", solution: "Auto-fix catches errors pre-submission", saving: "R12.4M/year", color: "#F59E0B" },
              { from: "Admin labour on rework", problem: "44 FTEs dedicated to claims rework", solution: "AI handles validation, humans approve", saving: "R12.3M/year", color: "#8B5CF6" },
              { from: "Cash flow delay", problem: "45-day average payment cycle", solution: "First-time-right claims = faster payment", saving: "R24.1M working capital freed", color: "#3DA9D1" },
              { from: "Doctor admin time", problem: "15 min/consultation on notes + coding", solution: "AI scribe + VisiCode = 2 minutes", saving: "40 min/day per doctor", color: "#10B981" },
              { from: "No-show revenue loss", problem: "5 no-shows/day × R600/consult", solution: "Prediction + double-booking + reminders", saving: "R792K/year per doctor", color: "#7C3AED" },
              { from: "Patient leakage", problem: "Patients don't return for chronic care", solution: "Engagement sequences + recall engine", saving: "15-20% reduction in no-return", color: "#10B981" },
              { from: "CareOn data unused", problem: "HL7v2 data flows but nobody acts on it", solution: "Bridge translates + AI interprets", saving: "R139M operational value", color: "#3DA9D1" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-48 shrink-0 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Problem</div>
                  <div className="text-xs font-bold text-white mt-1">{row.from}</div>
                  <div className="text-[10px] text-red-300/60 mt-0.5">{row.problem}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-wider">Solution</div>
                  <div className="text-xs text-white mt-1">{row.solution}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
                <div className="w-40 shrink-0 p-3 rounded-xl border" style={{ backgroundColor: `${row.color}10`, borderColor: `${row.color}20` }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: row.color }}>Value</div>
                  <div className="text-lg font-black text-white mt-1">{row.saving}</div>
                </div>
              </div>
            ))}

            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1D3443] to-[#2a4f63] text-center mt-6">
              <div className="text-xs text-[#3DA9D1] font-bold uppercase tracking-wider mb-2">Total Value Created</div>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DA9D1] to-emerald-400">R254M+</div>
              <div className="text-sm text-white/40 mt-2">Claims recovery + CareOn Bridge + admin savings + patient retention</div>
            </div>
          </div>
        )}

        {/* DATA FLOW */}
        {view === "data-flow" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-bold">All patient data is stripped of PII before AI processing. Names become initials. IDs are redacted. The AI only sees de-identified billing codes. This is enforced at the architecture level — not by policy.</p>
            </div>

            {[
              { source: "Doctor (Voice/Text)", data: "Clinical notes, symptoms, findings", destination: "AI Scribe → SOAP Generator", security: "Browser-only recording, no server storage of audio", color: "#3DA9D1" },
              { source: "SOAP Notes", data: "Structured clinical data + ICD-10 suggestions", destination: "VisiCode Engine → Patient Record", security: "PII stripped before AI coding. Names → initials.", color: "#10B981" },
              { source: "Patient Record", data: "ICD-10 codes, tariffs, scheme info", destination: "Claims Validator → 13-Rule Engine", security: "Deterministic rules (80%). No AI needed for validation.", color: "#8B5CF6" },
              { source: "Validated Claim", data: "EDIFACT-formatted claim data", destination: "Switch Router → Healthbridge/SwitchOn/MediKredit", security: "Encrypted in transit (TLS 1.3). Circuit breaker failover.", color: "#F59E0B" },
              { source: "Switch Response", data: "eRA (Electronic Remittance Advice)", destination: "Reconciliation Engine → Revenue Dashboard", security: "Matched to submitted claims. Discrepancies auto-flagged.", color: "#EF4444" },
              { source: "CareOn EMR", data: "HL7v2 messages (ADT, ORU, ORM)", destination: "FHIR Bridge → Normalised Resources", security: "Passive listener. CareOn unchanged. Deutsche Telekom not involved.", color: "#3DA9D1" },
              { source: "Patient (WhatsApp)", data: "Booking requests, confirmations, replies", destination: "WhatsApp Agent → Booking Engine", security: "POPIA consent enforced. Only booking data stored.", color: "#10B981" },
              { source: "All Outcomes", data: "Claim results, corrections, overrides", destination: "Reinforcement Learning → RAG Update", security: "PII scrubbed by pii-scrubber.ts before learning.", color: "#7C3AED" },
            ].map((flow, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-36 shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-bold" style={{ color: flow.color }}>SOURCE</div>
                  <div className="text-xs font-bold text-white mt-1">{flow.source}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">{flow.data}</div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${flow.color}40, ${flow.color}10)` }} />
                  <ArrowRight className="w-3 h-3 shrink-0" style={{ color: flow.color }} />
                </div>
                <div className="w-44 shrink-0 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="text-[10px] font-bold" style={{ color: flow.color }}>DESTINATION</div>
                  <div className="text-xs font-bold text-white mt-1">{flow.destination}</div>
                </div>
                <div className="w-48 shrink-0 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-[9px] text-slate-500">{flow.security}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
