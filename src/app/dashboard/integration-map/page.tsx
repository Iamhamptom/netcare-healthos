"use client";

import { useState } from "react";
import {
  Server, Shield, Brain, Activity, Layers, Zap, ArrowDown,
  ArrowRight, Network, Lock, Eye, Mic, FileText, CheckCircle2,
  DollarSign, RefreshCcw, Building2, Heart, MessageSquare,
  Users, Monitor, Stethoscope, Globe, Router, BarChart3
} from "lucide-react";

type ViewMode = "chain" | "agents" | "ecosystem";

function FlowNode({ icon: Icon, title, subtitle, color, badge, highlight }: {
  icon: typeof Server; title: string; subtitle: string; color: string; badge?: string; highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${highlight ? "ring-2 ring-[#3DA9D1] bg-[#3DA9D1]/5 border-[#3DA9D1]/30" : "bg-white/[0.03] border-white/10"}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${color}15`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{title}</span>
            {badge && <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}>{badge}</span>}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-px h-4 bg-white/20" />
      {label && <span className="text-[9px] font-bold text-slate-600 px-2 py-0.5 bg-white/5 rounded-full border border-white/10">{label}</span>}
      <div className="w-px h-4 bg-white/20" />
      <ArrowDown className="w-3 h-3 text-white/30" />
    </div>
  );
}

export default function IntegrationMapPage() {
  const [view, setView] = useState<ViewMode>("chain");

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(61,169,209,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl">
              <Network className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em]">System Architecture</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Integration Map</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400">Every agent, tool, and integration — how they connect end-to-end.</p>
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
          {[
            { id: "chain" as ViewMode, label: "13-Step Claims Chain" },
            { id: "agents" as ViewMode, label: "10 AI Agents" },
            { id: "ecosystem" as ViewMode, label: "Product Ecosystem" },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                view === t.id ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30" : "text-slate-500 hover:text-slate-300"
              }`}>{t.label}</button>
          ))}
        </div>

        {/* 13-STEP CHAIN */}
        {view === "chain" && (
          <div className="space-y-1">
            <FlowNode icon={Mic} title="1. Voice/Text Notes" subtitle="AI Scribe — Gemini transcription, ambient listening, SA accent trained" color="#3DA9D1" badge="INPUT" />
            <Connector label="audio → text" />
            <FlowNode icon={FileText} title="2. AI SOAP Generation" subtitle="VRL fine-tuned model — Subjective, Objective, Assessment, Plan" color="#3DA9D1" badge="AI" />
            <Connector label="notes → codes" />
            <FlowNode icon={Brain} title="3. ICD-10 Clinical Coding (VisiCode)" subtitle="41,009 ICD-10-ZA codes, max specificity (E11.40 not E11.9), PMB/CDL flagged" color="#10B981" badge="AI + DB" highlight />
            <Connector label="codes → record" />
            <FlowNode icon={Users} title="4. Save to Patient Record" subtitle="SOAP + ICD-10 + tariffs persisted to MedicalRecord. Claim draft created." color="#10B981" badge="AUTO" />
            <Connector label="claim → validate" />
            <FlowNode icon={Shield} title="5. Claims Validation" subtitle="13-rule engine: ICD-10 format, scheme rules, gender/age, PMB, unbundling" color="#8B5CF6" badge="13 RULES" highlight />
            <Connector label="errors → fix" />
            <FlowNode icon={Zap} title="6. Auto-Fix Suggestions" subtitle="AI suggests corrections with reasoning. Every fix traced to regulatory source." color="#8B5CF6" badge="AI" />
            <Connector label="fix → human" />
            <FlowNode icon={Eye} title="7. Human Approval" subtitle="Billing clerk reviews every flag. Approves, edits, or rejects. Full audit trail." color="#F59E0B" badge="HUMAN" />
            <Connector label="approved → EDIFACT" />
            <FlowNode icon={FileText} title="8. EDIFACT Generation" subtitle="MEDCLM v0:912:ZA format. Auto-formatted for the correct switch house." color="#F59E0B" badge="FORMAT" />
            <Connector label="EDIFACT → switch" />
            <FlowNode icon={Router} title="9. Switch Submission" subtitle="Healthbridge / SwitchOn / MediKredit. Circuit breaker failover. 30+ schemes." color="#EF4444" badge="3 SWITCHES" />
            <Connector label="response → match" />
            <FlowNode icon={DollarSign} title="10. eRA Reconciliation" subtitle="Electronic Remittance Advice matched to submitted claims. Discrepancies flagged." color="#EF4444" badge="AUTO" />
            <Connector label="rejected → analyze" />
            <FlowNode icon={BarChart3} title="11. Rejection Analysis" subtitle="Pattern engine: which codes, which schemes, which clinics. Trends over time." color="#7C3AED" badge="PATTERNS" />
            <Connector label="fixable → retry" />
            <FlowNode icon={RefreshCcw} title="12. Auto-Resubmission" subtitle="15 rejection codes eligible for auto-retry with corrections applied." color="#7C3AED" badge="SMART RETRY" />
            <Connector label="results → report" />
            <FlowNode icon={Building2} title="13. Revenue Recovery Report" subtitle="Leadership dashboard: R54.2M recoverable, per-clinic breakdown, quarterly trends." color="#10B981" badge="OUTPUT" highlight />

            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-sm text-emerald-300 font-bold">Nora AI stops at step 2. Healthbridge stops at step 9. Nobody else runs all 13.</p>
            </div>
          </div>
        )}

        {/* 10 AI AGENTS */}
        {view === "agents" && (
          <div className="space-y-3">
            {[
              { name: "Command Assistant", tools: "25 tools — full system access", role: "Leadership, power users", color: "#3DA9D1", badge: "FULL ACCESS" },
              { name: "Claims Copilot", tools: "ICD-10 lookup, NAPPI, scheme rules, knowledge base", role: "Billing clerks, doctors", color: "#10B981", badge: "CLAIMS" },
              { name: "VisiCode (AI Coder)", tools: "Clinical notes → ICD-10 + tariff codes, PMB/CDL", role: "Doctors, coding staff", color: "#8B5CF6", badge: "CODING" },
              { name: "Triage Agent", tools: "Patient lookup, escalation, KB search", role: "Reception, nurses", color: "#EF4444", badge: "URGENT" },
              { name: "Billing Agent", tools: "Invoices, claims, payments, scheme validation", role: "Billing department", color: "#F59E0B", badge: "FINANCE" },
              { name: "Intake Analyzer", tools: "Notes → SOAP → ICD-10 → claim draft", role: "Doctors during consultation", color: "#3DA9D1", badge: "CLINICAL" },
              { name: "Follow-up Agent", tools: "Patient recall, appointment scheduling, reminders", role: "Practice management", color: "#10B981", badge: "CARE" },
              { name: "Scheduler Agent", tools: "Booking optimization, availability, calendar sync", role: "Reception staff", color: "#7C3AED", badge: "SCHEDULE" },
              { name: "WhatsApp Agent", tools: "Patient comms, booking via chat, clinic finder", role: "Patient-facing", color: "#10B981", badge: "PATIENT" },
              { name: "Engagement Agent", tools: "Sequences, campaigns, chronic care, email triage", role: "Practice management", color: "#F59E0B", badge: "ENGAGE" },
            ].map((a, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0" style={{ backgroundColor: `${a.color}15`, color: a.color }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{a.name}</span>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${a.color}20`, color: a.color, border: `1px solid ${a.color}30` }}>{a.badge}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{a.tools}</div>
                </div>
                <div className="text-[10px] text-slate-600 text-right shrink-0">{a.role}</div>
              </div>
            ))}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mt-4">
              <h4 className="text-sm font-bold text-white mb-2">Shared AI Tools (Available to All Agents)</h4>
              <div className="flex flex-wrap gap-2">
                {["lookupICD10 (41K)", "lookupNAPPI (487K)", "lookupTariff", "checkClinicalPattern", "validateSchemeOption (6 schemes)", "searchKnowledgeBase (189K chunks)", "checkPromptInjection"].map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-slate-400">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT ECOSYSTEM */}
        {view === "ecosystem" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
                <Activity className="w-6 h-6 text-[#3DA9D1] mb-3" />
                <h3 className="font-bold text-white text-sm">Netcare Health OS</h3>
                <div className="text-[10px] text-[#3DA9D1] font-bold mt-1">healthos.visiocorp.co</div>
                <div className="mt-3 space-y-1 text-[10px] text-slate-400">
                  <div>239 API routes</div>
                  <div>161 pages</div>
                  <div>10 agents</div>
                  <div>48 data models</div>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <BarChart3 className="w-6 h-6 text-emerald-400 mb-3" />
                <h3 className="font-bold text-white text-sm">Patient Flow AI</h3>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">patient-flow-ai.vercel.app</div>
                <div className="mt-3 space-y-1 text-[10px] text-slate-400">
                  <div>11 API routes</div>
                  <div>11 pages</div>
                  <div>1 agent (FlowBot)</div>
                  <div>11 data models</div>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <Stethoscope className="w-6 h-6 text-[#8B5CF6] mb-3" />
                <h3 className="font-bold text-white text-sm">HealthOps Platform</h3>
                <div className="text-[10px] text-[#8B5CF6] font-bold mt-1">healthops-platform.vercel.app</div>
                <div className="mt-3 space-y-1 text-[10px] text-slate-400">
                  <div>41 API routes</div>
                  <div>24 pages</div>
                  <div>5 agents</div>
                  <div>19 data models</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h4 className="text-sm font-bold text-white mb-4">External Integrations</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "CareOn EMR", protocol: "HL7v2 MLLP", status: "live" },
                  { name: "HEAL Medicross", protocol: "REST API", status: "planned" },
                  { name: "Healthbridge", protocol: "XML / EDI", status: "live" },
                  { name: "SwitchOn (Altron)", protocol: "EDIFACT", status: "live" },
                  { name: "MediKredit", protocol: "HealthNet ST", status: "live" },
                  { name: "SAP Financials", protocol: "OData", status: "planned" },
                  { name: "Micromedex", protocol: "Drug DB", status: "live" },
                  { name: "CareConnect HIE", protocol: "FHIR R4", status: "ready" },
                ].map((int, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="text-xs font-bold text-white">{int.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{int.protocol}</div>
                    <span className={`text-[8px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                      int.status === "live" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      int.status === "ready" ? "bg-[#3DA9D1]/10 text-[#3DA9D1] border border-[#3DA9D1]/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>{int.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xs text-slate-500 mb-2">All products share one database, one AI engine, one agent communication bus</div>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-black text-[#3DA9D1]">291</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total APIs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-emerald-400">196</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#8B5CF6]">16</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">AI Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-[#F59E0B]">78</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">Data Models</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
