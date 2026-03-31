"use client";

import { useState } from "react";
import {
  Server, Shield, Activity, Layers, Zap, ArrowRight,
  CheckCircle2, Globe, Cloud, Database, Lock, Router,
  FileJson, Eye, TrendingUp, DollarSign, Building2, Network,
  Cpu, BarChart3, GitBranch
} from "lucide-react";

// Travis Dewing — CIO of Netcare + CEO of Netcare Digital
// Built CareOn (R82M, 34K users, 13K iPads). Claims R256M "digital dividend"
// He cares about: protecting CareOn investment, next digital dividend, not fragmenting the stack
// Frame EVERYTHING as extending CareOn, not competing

const CAREON_INTEGRATION = {
  investment: 82_000_000,
  users: 34_000,
  ipads: 13_000,
  messageTypes: ["ADT (Admit/Discharge/Transfer)", "ORU (Lab Results)", "ORM (Orders)", "DFT (Financial)", "SIU (Scheduling)", "MDM (Documents)"],
  fhirMappings: [
    { hl7: "PID (Patient ID)", fhir: "Patient", fields: "Name, DOB, Gender, SA ID, Contact", status: "live" },
    { hl7: "PV1 (Patient Visit)", fhir: "Encounter", fields: "Admit date, ward, attending, discharge", status: "live" },
    { hl7: "OBX (Observations)", fhir: "Observation", fields: "Lab values, vitals, abnormal flags", status: "live" },
    { hl7: "DG1 (Diagnosis)", fhir: "Condition", fields: "ICD-10 code, onset, clinical status", status: "live" },
  ],
};

const DIGITAL_DIVIDEND_MODEL = {
  existing: 256_000_000,
  claimsIntelligence: 54_200_000,
  careOnBridge: 139_000_000,
  combined: 193_200_000,
  newTotal: 449_200_000,
  percentIncrease: 75.5,
};

const ZERO_DISRUPTION = [
  { system: "CareOn / iMedOne", change: "None", detail: "Passive HL7v2 listener. CareOn doesn't know we exist. Deutsche Telekom not involved." },
  { system: "HEAL EMR", change: "None (Phase 1)", detail: "Phase 2: Adapter ready, awaiting A2D24 API specs. Same passive pattern." },
  { system: "SwitchOn (Altron)", change: "None", detail: "We validate before the switch. Claims still flow through SwitchOn as primary." },
  { system: "Healthbridge", change: "None", detail: "We auto-detect Healthbridge EDI format. No configuration changes." },
  { system: "MediKredit", change: "None", detail: "Fallback switch. Circuit breaker routes automatically. Transparent to billing." },
  { system: "SAP Financials", change: "None (Phase 1)", detail: "Phase 2: Read-only adapter for revenue, debtors, capitation data." },
  { system: "VirtualCare", change: "None", detail: "Not in scope. Telehealth is separate from claims intelligence." },
  { system: "Netcare 911", change: "None", detail: "Emergency services unaffected. Not in scope." },
];

const DEPLOYMENT_OPTIONS = [
  { option: "Vercel Cloud (Current)", latency: "<100ms (edge)", scaling: "Auto (serverless)", cost: "Included in license", suitable: "Demo, pilot, production" },
  { option: "Azure South Africa North", latency: "<20ms (JHB)", scaling: "Container auto-scale", cost: "Netcare Azure tenant", suitable: "Production (data sovereignty)" },
  { option: "AWS Cape Town (af-south-1)", latency: "<30ms (CPT)", scaling: "ECS/Fargate", cost: "Netcare AWS tenant", suitable: "Production (AWS-native)" },
  { option: "On-Premise (Docker)", latency: "<5ms", scaling: "Fixed capacity", cost: "Hardware + ops", suitable: "Maximum isolation" },
];

export default function CIOPage() {
  const [tab, setTab] = useState<"careon" | "dividend" | "zero" | "deploy">("careon");

  const fmt = (n: number) => {
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(0)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
    return `R${n}`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1b2d] via-[#111827] to-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(61,169,209,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl">
              <Server className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em]">CIO Technical Brief</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">CareOn Integration & Digital Dividend Extension</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            How VRL&apos;s claims intelligence layer sits on top of your R82M CareOn investment —
            extending the digital dividend by R193M without touching a single existing system.
          </p>
        </div>

        {/* CareOn ROI Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1D3443] to-[#2a4f63] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(61,169,209,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em] mb-2">The Next Digital Dividend</div>
              <div className="text-3xl font-black text-white">Your R256M dividend becomes <span className="text-[#3DA9D1]">R449M</span></div>
              <p className="text-sm text-white/50 mt-2">Claims intelligence + CareOn Bridge = R193M additional value on top of existing digitization returns</p>
            </div>
            <div className="shrink-0 text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-4xl font-black text-[#3DA9D1]">+75%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Dividend Increase</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
          {[
            { id: "careon" as const, label: "CareOn Bridge", icon: Router },
            { id: "dividend" as const, label: "Digital Dividend", icon: TrendingUp },
            { id: "zero" as const, label: "Zero Disruption", icon: Shield },
            { id: "deploy" as const, label: "Deployment Options", icon: Cloud },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider ${
                  tab === t.id ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30" : "text-slate-500 hover:text-slate-300"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* CAREON BRIDGE */}
        {tab === "careon" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-3xl font-black text-[#3DA9D1]">{fmt(CAREON_INTEGRATION.investment)}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">CareOn Investment</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-3xl font-black text-white">{(CAREON_INTEGRATION.users / 1000).toFixed(0)}K</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active Users</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-3xl font-black text-white">{(CAREON_INTEGRATION.ipads / 1000).toFixed(0)}K</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">iPads Deployed</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-bold">We receive standard HL7v2 messages over CareOn&apos;s existing MLLP interface. CareOn doesn&apos;t know we exist. No code changes, no iMedOne configuration, Deutsche Telekom&apos;s support team is not involved.</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">HL7v2 → FHIR R4 Translation Matrix</h3>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">HL7v2 Segment</th>
                  <th className="text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider"><ArrowRight className="w-3 h-3 inline" /></th>
                  <th className="text-left p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">FHIR R4 Resource</th>
                  <th className="text-left p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fields Mapped</th>
                  <th className="text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr></thead>
                <tbody>
                  {CAREON_INTEGRATION.fhirMappings.map((m, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-3 font-mono font-bold text-amber-400">{m.hl7}</td>
                      <td className="p-3 text-center text-slate-500"><ArrowRight className="w-3 h-3 inline" /></td>
                      <td className="p-3 font-mono font-bold text-[#3DA9D1]">{m.fhir}</td>
                      <td className="p-3 text-slate-400">{m.fields}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="font-bold text-white text-sm mb-2">Supported HL7v2 Message Types</h4>
              <div className="flex flex-wrap gap-2">
                {CAREON_INTEGRATION.messageTypes.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-400">{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIGITAL DIVIDEND */}
        {tab === "dividend" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Existing Digital Dividend</div>
                <div className="text-3xl font-black text-white">{fmt(DIGITAL_DIVIDEND_MODEL.existing)}</div>
                <div className="text-xs text-slate-500 mt-1">From CareOn, HEAL, VirtualCare digitization</div>
              </div>
              <div className="p-6 rounded-2xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
                <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-wider mb-2">+ Claims Intelligence</div>
                <div className="text-3xl font-black text-[#3DA9D1]">+{fmt(DIGITAL_DIVIDEND_MODEL.claimsIntelligence)}</div>
                <div className="text-xs text-[#3DA9D1]/60 mt-1">Rejected claims recovery across 88 clinics</div>
              </div>
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">+ CareOn Bridge Value</div>
                <div className="text-3xl font-black text-emerald-400">+{fmt(DIGITAL_DIVIDEND_MODEL.careOnBridge)}</div>
                <div className="text-xs text-emerald-400/60 mt-1">Bed mgmt, clinical decision support, discharge</div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 text-center">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-2">New Combined Digital Dividend</div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{fmt(DIGITAL_DIVIDEND_MODEL.newTotal)}</div>
              <div className="text-sm text-emerald-300/60 mt-2">R256M existing + R193M VRL contribution = R449M total value</div>
            </div>
          </div>
        )}

        {/* ZERO DISRUPTION */}
        {tab === "zero" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-300 font-bold">Zero systems modified. Zero downtime. Zero migration. We are a passive intelligence layer that reads from existing systems and writes validated claims to existing switches.</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  <th className="text-left p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Existing System</th>
                  <th className="text-center p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Changes Required</th>
                  <th className="text-left p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Integration Detail</th>
                </tr></thead>
                <tbody>
                  {ZERO_DISRUPTION.map((s, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 font-bold text-white">{s.system}</td>
                      <td className="p-4 text-center"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s.change}</span></td>
                      <td className="p-4 text-slate-400 text-xs">{s.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPLOYMENT OPTIONS */}
        {tab === "deploy" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {DEPLOYMENT_OPTIONS.map((d, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${i === 0 ? "bg-[#3DA9D1]/10 border-[#3DA9D1]/20" : "bg-white/[0.03] border-white/10"}`}>
                <h3 className="font-bold text-white text-sm mb-4">{d.option}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Latency</span><span className="text-white font-bold">{d.latency}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Scaling</span><span className="text-white font-bold">{d.scaling}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Cost</span><span className="text-white font-bold">{d.cost}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Suitable for</span><span className="text-[#3DA9D1] font-bold">{d.suitable}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
