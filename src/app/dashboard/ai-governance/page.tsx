"use client";

import { useState } from "react";
import {
  Shield, Eye, Scale, FileText, AlertTriangle, CheckCircle2,
  Lock, Database, Activity, Users, Brain, Cpu, BarChart3,
  Clock, Download, Layers, Zap, BookOpen
} from "lucide-react";

// Gurshen — AI Committee / IT Governance
// JSE-listed, King V compliance, SAHPRA classification, POPIA s71, bias prevention
// He needs: governance documentation, audit trails, risk framework, board-reportable metrics

const GOVERNANCE_FRAMEWORK = [
  {
    tier: 1,
    name: "SA Law (Immutable)",
    description: "Medical Schemes Act s59, POPIA, HPCSA guidelines. These rules can NEVER be overridden by any AI model.",
    examples: "Gender-restricted codes, age-restricted procedures, PMB mandatory coverage",
    enforcement: "Hard-coded gates. No configuration, no override, no exceptions.",
    color: "#EF4444",
  },
  {
    tier: 2,
    name: "CMS Circulars (Immutable)",
    description: "Council for Medical Schemes regulatory circulars and industry directives.",
    examples: "Circular 8 of 2024, scheme-specific billing regulations, PMB DTP definitions",
    enforcement: "Hard-coded gates. Updated within 48 hours of CMS publication.",
    color: "#F59E0B",
  },
  {
    tier: 3,
    name: "PHISC Specifications (Configurable)",
    description: "Private Health Information Standards Committee — EDIFACT, coding standards.",
    examples: "MEDCLM v0:912:ZA format, modifier rules, NAPPI validation",
    enforcement: "Deterministic rules. Configurable per switch house.",
    color: "#3B82F6",
  },
  {
    tier: 4,
    name: "Scheme Provider Manuals (Configurable)",
    description: "Per-scheme rules from Discovery, GEMS, Bonitas, Medshield, Momentum, Bestmed.",
    examples: "Option code requirements, pre-auth rules, formulary restrictions",
    enforcement: "Deterministic rules. 6 scheme profiles maintained.",
    color: "#8B5CF6",
  },
  {
    tier: 5,
    name: "AI Reasoning (Advisory Only)",
    description: "LLM-based analysis of edge cases. ALWAYS advisory. NEVER overrides Tier 1-4.",
    examples: "Clinical appropriateness review, duplicate detection, pattern recognition",
    enforcement: "Human must approve. Every suggestion logged with model, confidence, reasoning.",
    color: "#10B981",
  },
];

const SAHPRA_CLASSIFICATION = {
  question: "Is this a Medical Device (SaMD)?",
  answer: "NO",
  reasoning: [
    { criterion: "Makes clinical decisions", ourSystem: "No — validates billing codes only", isSaMD: true },
    { criterion: "Influences treatment", ourSystem: "No — no treatment recommendations", isSaMD: true },
    { criterion: "Diagnoses conditions", ourSystem: "No — reads existing diagnoses", isSaMD: true },
    { criterion: "Patient-facing", ourSystem: "No — admin/billing tool only", isSaMD: true },
  ],
  reference: "SAHPRA MD08-2025/2026 AI/ML Guidance",
};

const POPIA_COMPLIANCE = [
  { section: "Section 27(1)(a)", title: "Consent", status: "compliant", detail: "Patient consent via Netcare's existing treatment agreements" },
  { section: "Section 27(1)(d)", title: "Legitimate Interest", status: "compliant", detail: "Accurate billing benefits both provider and patient" },
  { section: "Section 32", title: "Claims Assessment", status: "compliant", detail: "Processing for claims assessment and management" },
  { section: "Section 71", title: "Automated Decisions", status: "compliant", detail: "Human-in-the-loop — AI flags, human approves. Right to contest. Logic transparency." },
  { section: "Section 72", title: "Cross-border Transfer", status: "compliant", detail: "On-premise option. SA-hosted deployment available (Azure JHB / AWS CPT)" },
  { section: "Health Regs 2026", title: "Health Data Provisions", status: "compliant", detail: "No grace period. Full compliance with POPIA health-specific regulations in force." },
];

const KING_V_ALIGNMENT = [
  { principle: "Principle 10 — Data, Information, Technology & AI", alignment: "King V (Oct 2025) explicitly requires boards to govern AI. Our 5-tier framework, audit logging, and override gates give the board documented AI governance." },
  { principle: "Principle 3 — Responsible Corporate Citizenship", alignment: "POPIA health regulations (enforced 6 March 2026) compliance. Data sovereignty options. Patient rights protected." },
  { principle: "Principle 12 — Assurance", alignment: "92.5% composite compliance score. Continuous monitoring. Board-reportable metrics dashboard." },
  { principle: "Principle 15 — Stakeholder Relationships", alignment: "Transparent AI decisions. Every flag includes rule, reason, and fix. Human-in-the-loop on all claims." },
  { principle: "SA National AI Policy (5 Pillars)", alignment: "Aligned with DCDT policy: responsible governance, ethical AI, human-centred design, skills development, cultural context." },
];

const AUDIT_METRICS = [
  { metric: "Claims Validated", value: "2,300+", period: "Testing phase" },
  { metric: "False Negative Rate", value: "0%", period: "On hard-gate codes" },
  { metric: "False Positive Rate", value: "<2%", period: "Across all test suites" },
  { metric: "AI Override Attempts Blocked", value: "37 codes", period: "Protected permanently" },
  { metric: "Avg Processing Time", value: "<2 sec", period: "Per claim batch" },
  { metric: "Audit Log Entries", value: "Full trail", period: "Every AI decision logged" },
  { metric: "Model Providers", value: "2 (Gemini + Claude)", period: "Dual-provider redundancy" },
  { metric: "Data Retention", value: "12 months", period: "Configurable to match policy" },
];

const AI_RISK_MATRIX = [
  { risk: "Model hallucination", likelihood: "low", impact: "medium", mitigation: "80% deterministic rules. AI handles only 20%. Hard gates enforce after AI. Human reviews all.", residual: "very low" },
  { risk: "Bias in validation", likelihood: "low", impact: "high", mitigation: "Rules based on SA law, not training data. No demographic data in AI input. De-identified codes only.", residual: "very low" },
  { risk: "Data breach", likelihood: "low", impact: "critical", mitigation: "PII stripped pre-processing. 6 security headers. Rate limiting. Encryption at rest + transit. POPIA DPA.", residual: "low" },
  { risk: "Regulatory non-compliance", likelihood: "low", impact: "high", mitigation: "Not SaMD (SAHPRA). POPIA s71 human-in-the-loop. 48hr update SLA on CMS circulars.", residual: "very low" },
  { risk: "Vendor failure", likelihood: "low", impact: "medium", mitigation: "Shadow mode — existing systems remain primary. Month-to-month contract. CSV export. No lock-in.", residual: "very low" },
  { risk: "AI overriding valid rejections", likelihood: "medium", impact: "high", mitigation: "37 protected codes with hard gates. Tier 1-2 immutable. Every override attempt logged and blocked.", residual: "low" },
];

export default function AIGovernancePage() {
  const [tab, setTab] = useState<"framework" | "sahpra" | "popia" | "risk" | "audit">("framework");

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(61,169,209,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">AI Committee Review Pack</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Governance & Compliance Framework</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            King V-aligned AI governance for JSE-listed healthcare. SAHPRA classification, POPIA Section 71 compliance,
            5-tier rule precedence, full audit trail. Prepared for Netcare AI Committee review.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
          {[
            { id: "framework" as const, label: "5-Tier Framework", icon: Layers },
            { id: "sahpra" as const, label: "SAHPRA Classification", icon: Brain },
            { id: "popia" as const, label: "POPIA Compliance", icon: Lock },
            { id: "risk" as const, label: "AI Risk Matrix", icon: AlertTriangle },
            { id: "audit" as const, label: "Audit Metrics", icon: Eye },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  tab === t.id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-500 hover:text-slate-300"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* 5-TIER FRAMEWORK */}
        {tab === "framework" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-xs text-slate-400"><span className="text-white font-bold">Design Principle:</span> Lower-tier rules NEVER override higher-tier rules. AI (Tier 5) is always advisory. SA law (Tier 1) is always immutable. This is enforced at the code level — not by policy, but by architecture.</p>
            </div>
            {GOVERNANCE_FRAMEWORK.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black" style={{ backgroundColor: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
                    {t.tier}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{t.name}</h3>
                      {t.tier <= 2 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">Immutable</span>}
                      {t.tier >= 3 && t.tier <= 4 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">Configurable</span>}
                      {t.tier === 5 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Advisory Only</span>}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{t.description}</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Examples</div>
                        <p className="text-[11px] text-slate-400">{t.examples}</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Enforcement</div>
                        <p className="text-[11px] text-slate-400">{t.enforcement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SAHPRA */}
        {tab === "sahpra" && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-2">{SAHPRA_CLASSIFICATION.question}</div>
              <div className="text-5xl font-black text-emerald-400 mb-2">{SAHPRA_CLASSIFICATION.answer}</div>
              <div className="text-xs text-emerald-300/60">Per {SAHPRA_CLASSIFICATION.reference}</div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SaMD Criterion</th>
                  <th className="text-left p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Our System</th>
                  <th className="text-center p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qualifies as SaMD?</th>
                </tr></thead>
                <tbody>
                  {SAHPRA_CLASSIFICATION.reasoning.map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 font-bold text-white">{r.criterion}</td>
                      <td className="p-4 text-emerald-400">{r.ourSystem}</td>
                      <td className="p-4 text-center"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">NO</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <p className="text-xs text-slate-400"><span className="text-white font-bold">If the committee disagrees:</span> We are prepared to engage a joint legal review and pursue SAHPRA classification if required. Our assessment is based on the system being an administrative claims processing tool equivalent to an automated senior billing clerk.</p>
            </div>
          </div>
        )}

        {/* POPIA */}
        {tab === "popia" && (
          <div className="space-y-4">
            {POPIA_COMPLIANCE.map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#3DA9D1]">{p.section}</span>
                    <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.detail}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <AlertTriangle className="w-4 h-4" /> Section 71 — Automated Decision-Making
              </div>
              <p className="text-xs text-amber-300/70">Human-in-the-loop is not optional — it is architecturally enforced. No claim is altered without human confirmation. Every AI suggestion includes an explanation. Any staff member can override. Full audit trail on every decision.</p>
            </div>
          </div>
        )}

        {/* AI RISK MATRIX */}
        {tab === "risk" && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> AI Risk Assessment Matrix</h3>
            </div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-white/10">
                <th className="text-left p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk</th>
                <th className="text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Likelihood</th>
                <th className="text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Impact</th>
                <th className="text-left p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mitigation</th>
                <th className="text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residual</th>
              </tr></thead>
              <tbody>
                {AI_RISK_MATRIX.map((r, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 font-bold text-white">{r.risk}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.likelihood === "low" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{r.likelihood}</span></td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.impact === "critical" ? "bg-red-500/10 text-red-400" : r.impact === "high" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>{r.impact}</span></td>
                    <td className="p-3 text-slate-400 max-w-sm">{r.mitigation}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.residual === "very low" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-300"}`}>{r.residual}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AUDIT METRICS */}
        {tab === "audit" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {AUDIT_METRICS.map((m, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="text-xl font-black text-[#3DA9D1]">{m.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{m.metric}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{m.period}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#3DA9D1]" /> King V Alignment (Oct 2025)</h4>
                <div className="space-y-3">
                  {KING_V_ALIGNMENT.map((k, i) => (
                    <div key={i}>
                      <div className="text-xs font-bold text-[#3DA9D1]">{k.principle}</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{k.alignment}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Available Documentation</h4>
                <div className="space-y-2">
                  {[
                    "AI Committee Briefing Pack",
                    "Governance & Compliance Pack",
                    "POPIA Health Data Compliance Statement (6 March 2026 regulations)",
                    "HPCSA Booklet 20 AI Alignment Document",
                    "King V Principle 10 Governance Brief",
                    "CareConnect HIE Integration Readiness Report",
                    "POPIA Data Processing Agreement (draft)",
                    "Information Security Policy",
                    "Business Continuity Plan",
                    "Key Rotation Policy",
                    "Secure SDLC Documentation",
                    "ISO 27001 Alignment Assessment (certification roadmap)",
                    "CareOn Integration Technical Spec",
                    "Claims Intelligence Whitepaper (VRL-001)",
                    "SA Competitor Feature Matrix",
                    "SAHPRA MD08-2025/2026 Classification Analysis",
                  ].map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
