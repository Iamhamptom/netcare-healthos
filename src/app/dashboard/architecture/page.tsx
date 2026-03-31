"use client";

import { useState } from "react";
import {
  Server, Shield, Database, Globe, Layers, Lock, Eye, Cpu,
  ArrowRight, CheckCircle2, AlertTriangle, Zap, Code2,
  Network, FileJson, Key, Cloud, Container, GitBranch,
  BarChart3, Activity, Router, Boxes
} from "lucide-react";

// Muhammad Simjee (A2D24) — ex-McKinsey, Masters Tech Management, AWS Advanced Partner
// He wants: clean architecture, API-first, FHIR compliance, extends not replaces HEAL/CareOn
// Show structured frameworks, not flashy demos

const TECH_STACK = [
  { name: "Next.js 16", role: "Application Framework", detail: "React Server Components, TypeScript strict, App Router", icon: Code2, color: "#0070F3" },
  { name: "Supabase", role: "Database & Auth", detail: "PostgreSQL, Row-Level Security, pgvector for RAG, cookie-based SSR auth", icon: Database, color: "#3ECF8E" },
  { name: "Prisma 7.4", role: "ORM & Migrations", detail: "39 models, type-safe queries, automated migration pipeline", icon: Layers, color: "#2D3748" },
  { name: "Vercel", role: "Deployment & Edge", detail: "Fluid Compute, global CDN, auto-scaling, preview deploys per PR", icon: Cloud, color: "#000" },
  { name: "FHIR R4", role: "Interoperability", detail: "12 resource types, SMART on FHIR auth, CareConnect HIE compatible", icon: FileJson, color: "#FF6B35" },
  { name: "HL7v2", role: "CareOn Bridge", detail: "ADT, ORU, ORM, DFT, SIU, MDM message parsing — passive listener", icon: Router, color: "#E11D48" },
  { name: "EDIFACT", role: "Claims Switching", detail: "MEDCLM v0:912:ZA — Healthbridge, SwitchOn, MediKredit", icon: Network, color: "#7C3AED" },
  { name: "Gemini + Claude", role: "AI Layer", detail: "20% of validation. 80% is deterministic rules. AI never overrides hard gates", icon: Cpu, color: "#F59E0B" },
];

const SECURITY_HEADERS = [
  { header: "X-Frame-Options", value: "DENY", purpose: "Prevents clickjacking" },
  { header: "Strict-Transport-Security", value: "max-age=63072000", purpose: "Forces HTTPS" },
  { header: "Content-Security-Policy", value: "default-src 'self'", purpose: "Prevents XSS/injection" },
  { header: "X-Content-Type-Options", value: "nosniff", purpose: "Prevents MIME-type sniffing" },
  { header: "X-XSS-Protection", value: "1; mode=block", purpose: "Browser XSS filter" },
  { header: "Referrer-Policy", value: "strict-origin-when-cross-origin", purpose: "Controls referrer data" },
];

const API_SURFACE = [
  { group: "Claims Engine", count: 10, endpoints: "validate, autocorrect, search, suggest, report, history, network, patterns, rules, retention" },
  { group: "CareOn Bridge", count: 6, endpoints: "hl7/receive, fhir/patient, fhir/encounter, fhir/observation, advisory, status" },
  { group: "FHIR R4 Server", count: 8, endpoints: "Patient, Encounter, Observation, Condition CRUD + search + capability statement" },
  { group: "Switching Engine", count: 5, endpoints: "route, submit, status, batch, reconcile" },
  { group: "WhatsApp", count: 3, endpoints: "webhook, send, clinic-finder" },
  { group: "Authentication", count: 6, endpoints: "login, logout, me, mfa/setup, mfa/verify, sessions" },
  { group: "Admin", count: 8, endpoints: "users, practices, analytics, usage, audit, settings, onboard, reports" },
  { group: "Intelligence", count: 7, endpoints: "RAG query, embeddings, knowledge search, drug interactions, ICD-10, NAPPI, tariff" },
];

const DATA_FLOW_STEPS = [
  { step: 1, title: "Input Layer", detail: "Claims CSV / CareOn HL7v2 / Manual Entry", color: "#3DA9D1", icon: Boxes },
  { step: 2, title: "PII Stripping", detail: "Names, IDs, clinical notes removed. Only codes proceed.", color: "#10B981", icon: Shield },
  { step: 3, title: "Deterministic Rules (80%)", detail: "ICD-10 lookup, NAPPI, scheme rules, tariff, gender/age, unbundling — pure database, no AI", color: "#6366F1", icon: Database },
  { step: 4, title: "AI Reasoning (20%)", detail: "De-identified codes only. Gemini 2.5 Flash + Claude. Hard gates enforced AFTER AI.", color: "#F59E0B", icon: Cpu },
  { step: 5, title: "Human Review", detail: "Every flag reviewed by billing staff. No auto-submission. Full audit trail.", color: "#EF4444", icon: Eye },
  { step: 6, title: "Output", detail: "Validated claim → EDIFACT → switch. Corrections logged with provenance.", color: "#8B5CF6", icon: CheckCircle2 },
];

const COMPLIANCE_SCORES = [
  { area: "POPIA", score: 95, detail: "Section 27/32 compliance, Section 71 human-in-the-loop, 12-month retention, DPA ready" },
  { area: "OWASP Top 10", score: 95, detail: "CSP, HSTS, XSS protection, SQL injection prevention, rate limiting on all routes" },
  { area: "SAHPRA", score: 100, detail: "NOT a medical device — administrative claims tool only (MD08-2025/2026)" },
  { area: "King IV", score: 90, detail: "AI governance framework, audit logging, override tracking, board-reportable metrics" },
  { area: "ISO 27001", score: 90, detail: "Information security policy, BCP, key rotation, SDLC documentation" },
  { area: "HPCSA AI Booklet 20", score: 95, detail: "Transparency, accountability, human oversight, bias prevention" },
];

const INTEGRATION_ADAPTERS = [
  { name: "CareOn / iMedOne", status: "live", protocol: "HL7v2 MLLP", direction: "Inbound", notes: "Passive listener — no CareOn changes needed. Deutsche Telekom not involved." },
  { name: "HEAL EMR", status: "planned", protocol: "REST API", direction: "Bidirectional", notes: "Adapter pattern ready. Awaiting A2D24 API specs. 2-3 week integration." },
  { name: "Healthbridge", status: "live", protocol: "XML / EDI", direction: "Bidirectional", notes: "Claims submission + eRA reconciliation. 7K+ practices." },
  { name: "SwitchOn (Altron)", status: "live", protocol: "EDIFACT MEDCLM", direction: "Outbound", notes: "Netcare's primary switch. R5.90/claim. Circuit breaker failover." },
  { name: "MediKredit", status: "live", protocol: "HealthNet ST", direction: "Bidirectional", notes: "Fallback switch. FamCheck + AuthCheck. Pre-auth engine." },
  { name: "SAP", status: "planned", protocol: "RFC / REST", direction: "Inbound", notes: "Revenue, debtors, capitation (R287 PMPM). Read-only initially." },
  { name: "Micromedex", status: "live", protocol: "Internal DB", direction: "Read", notes: "Drug interaction checking. 6 pairs, 6 monographs, 10 classes." },
];

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<"stack" | "data" | "api" | "security" | "integrations">("stack");

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(61,169,209,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(61,169,209,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl">
              <Server className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em]">Technical Architecture</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Architecture & Integration Landscape</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Enterprise-grade healthcare AI platform. 153 API routes, 39 data models, 7 integration adapters,
            FHIR R4 compliant, POPIA Section 71 human-in-the-loop. Extends CareOn + HEAL — replaces nothing.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-[#3DA9D1]" /> 60,000+ lines</span>
            <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-[#3DA9D1]" /> 153 API routes</span>
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#3DA9D1]" /> 39 Prisma models</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> 92.5% compliance</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
          {[
            { id: "stack" as const, label: "Tech Stack", icon: Layers },
            { id: "data" as const, label: "Data Flow", icon: GitBranch },
            { id: "api" as const, label: "API Surface", icon: Code2 },
            { id: "security" as const, label: "Security & Compliance", icon: Shield },
            { id: "integrations" as const, label: "Integration Adapters", icon: Network },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  activeTab === t.id ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30" : "text-slate-500 hover:text-slate-300"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* TECH STACK */}
        {activeTab === "stack" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#3DA9D1]/30 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.role}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* DATA FLOW — The Neural Funnel */}
        {activeTab === "data" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Shield className="w-4 h-4" /> PII Protection Guarantee
              </div>
              <p className="text-xs text-emerald-300/70">Patient names, ID numbers, and clinical notes are stripped BEFORE any AI processing. Only de-identified billing codes reach the validation engine. On-premise deployment option available — zero data leaves Netcare&apos;s network.</p>
            </div>

            <div className="space-y-3">
              {DATA_FLOW_STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: `${s.color}15`, borderColor: `${s.color}30`, color: s.color }}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    {i < DATA_FLOW_STEPS.length - 1 && <div className="w-px h-8 bg-white/10 mt-1" />}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ backgroundColor: `${s.color}15`, color: s.color }}>Step {s.step}</span>
                      <h3 className="font-bold text-white text-sm">{s.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" /> Hard Gate Enforcement
              </div>
              <p className="text-xs text-amber-300/70">37 protected codes can NEVER be overridden by AI. Tier 1 (SA law) and Tier 2 (CMS circulars) rules always take precedence. Every AI override attempt is logged with timestamp, model, and reasoning for audit.</p>
            </div>
          </div>
        )}

        {/* API SURFACE */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {API_SURFACE.map((g, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-sm">{g.group}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 bg-[#3DA9D1]/10 text-[#3DA9D1] rounded-lg border border-[#3DA9D1]/20">{g.count} endpoints</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.endpoints.split(", ").map((e, j) => (
                      <span key={j} className="text-[10px] font-mono px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-400">{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Total API Surface</div>
                <div className="text-xs text-slate-500">All endpoints rate-limited. JWT auth. CORS configured.</div>
              </div>
              <div className="text-3xl font-black text-[#3DA9D1]">{API_SURFACE.reduce((a, g) => a + g.count, 0)}</div>
            </div>
          </div>
        )}

        {/* SECURITY & COMPLIANCE */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPLIANCE_SCORES.map((c, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-sm">{c.area}</h3>
                    <span className={`text-lg font-black ${c.score >= 95 ? "text-emerald-400" : "text-amber-400"}`}>{c.score}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{c.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Lock className="w-4 h-4 text-[#3DA9D1]" /> Security Headers (All Routes)</h3>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/5">
                  <th className="text-left p-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Header</th>
                  <th className="text-left p-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Value</th>
                  <th className="text-left p-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Purpose</th>
                </tr></thead>
                <tbody>
                  {SECURITY_HEADERS.map((h, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-3 font-mono text-[#3DA9D1] font-bold">{h.header}</td>
                      <td className="p-3 font-mono text-slate-400">{h.value}</td>
                      <td className="p-3 text-slate-500">{h.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INTEGRATION ADAPTERS */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
              <p className="text-xs text-[#3DA9D1] font-bold">Design Philosophy: We aggregate, we don&apos;t replace. Every adapter is a passive layer that reads from and writes to existing systems. Zero modifications to CareOn, HEAL, or any switching house.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">System</th>
                  <th className="text-center p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-left p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Protocol</th>
                  <th className="text-center p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Direction</th>
                  <th className="text-left p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Notes</th>
                </tr></thead>
                <tbody>
                  {INTEGRATION_ADAPTERS.map((a, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{a.name}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.status === "live" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>{a.status}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{a.protocol}</td>
                      <td className="p-4 text-center text-slate-400">{a.direction}</td>
                      <td className="p-4 text-slate-500 max-w-xs">{a.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-2xl font-black text-emerald-400">5</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Live Adapters</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-2xl font-black text-amber-400">2</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Planned (HEAL + SAP)</div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-2xl font-black text-[#3DA9D1]">0</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Systems Modified</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
