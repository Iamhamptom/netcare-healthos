"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Brain, BarChart3, FileText, Zap, Building2,
  CheckCircle2, Lock, Clock, Users, TrendingDown, ArrowRight,
  Sparkles, Target, Globe, Award, ChevronRight, Download,
  AlertTriangle, Database, Cpu, Eye, Heart, Server,
  Network, Layers, GitBranch, Activity, Settings, Key,
  MonitorSmartphone, HardDrive, Wifi, CloudCog,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

function StatCard({ value, label, color, large }: { value: string; label: string; color: string; large?: boolean }) {
  return (
    <div className={`text-center ${large ? "md:col-span-1" : ""}`}>
      <div className={`${large ? "text-3xl" : "text-2xl"} font-bold`} style={{ color }}>{value}</div>
      <div className="text-[11px] text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; max: number; color: string; suffix?: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-600 font-medium">{d.label}</span>
            <span className="text-[12px] font-bold" style={{ color: d.color }}>{d.value}{d.suffix || "%"}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(d.value / d.max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArchitectureResearchPage() {
  const [facilities, setFacilities] = useState(88);
  const [claimsPerFacility, setClaimsPerFacility] = useState(500);
  const [rejectionRate, setRejectionRate] = useState(14);

  const totalClaims = facilities * claimsPerFacility;
  const rejections = Math.round(totalClaims * (rejectionRate / 100));
  const rejectValue = rejections * 800;
  const recoverable = Math.round(rejectValue * 0.85);
  const annualRecovery = recoverable * 12;
  const licenseCost = facilities * 5000 * 12;
  const aiCost = totalClaims * 0.016 * 12;
  const netBenefit = annualRecovery - licenseCost - aiCost;
  const roi = licenseCost > 0 ? (annualRecovery / licenseCost).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A]">
      {/* ═══ NAV ═══ */}
      <nav className="bg-[#1D3443] text-white py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-4 brightness-[10] saturate-0 opacity-70" />
          <span className="text-[10px] tracking-[0.15em] text-white/70 font-semibold">HEALTH OS</span>
          <span className="text-white/70">|</span>
          <span className="text-[11px] text-white/50">Research</span>
        </div>
        <Link href="/research" className="text-[11px] text-white/60 hover:text-white/70 transition-colors">
          All Research
        </Link>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D3443] via-[#1D3443] to-[#2a4a5e] text-white py-20 px-6">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeIn} className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 bg-[#3DA9D1]/20 rounded-full text-[10px] font-semibold text-[#3DA9D1] tracking-wide">
              VISIO RESEARCH LABS
            </div>
            <div className="px-3 py-1 bg-[#E3964C]/20 rounded-full text-[10px] font-semibold text-[#E3964C] tracking-wide">
              VRL-003 | APRIL 2026
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-semibold text-white/70 tracking-wide">
              CONFIDENTIAL — AI COMMITTEE
            </div>
          </motion.div>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Architecture Compatibility &<br />Integration Roadmap
          </motion.h1>
          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg text-white/60 max-w-2xl mb-8 leading-relaxed">
            How VRL&apos;s AI claims intelligence integrates with Netcare&apos;s CareOn, HEAL,
            and switching infrastructure. White-label ready. Multi-cloud deployable.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { value: "5", label: "AI Products", color: "#3DA9D1" },
              { value: "557K", label: "Knowledge Records", color: "#E3964C" },
              { value: "106", label: "Validation Rules", color: "#10B981" },
              { value: "244", label: "API Endpoints", color: "#8B5CF6" },
              { value: "56", label: "Database Models", color: "#EC4899" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[11px] text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ NETCARE'S TECH LANDSCAPE ═══ */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div {...fadeIn}>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-[#3DA9D1]" />
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">Netcare Technology Estate</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1D3443] mb-4">
            We mapped your infrastructure. Here&apos;s how we fit.
          </h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-8 max-w-3xl">
            Netcare operates a R572M+ technology ecosystem across hospitals (CareOn/iMedOne), primary care (HEAL/AWS),
            claims switching (Healthbridge + SwitchOn), and health information exchange (CareConnect HIE).
            VRL is designed to complement each layer — not replace any of them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "CareOn (Hospitals)", icon: MonitorSmartphone, color: "#3DA9D1", desc: "iMedOne HIS by Deutsche Telekom. R572M invested. 34K users, 13K iPads, 45 hospitals. HL7v2 + FHIR via IM4HC (Java ESB). Capsule MDIP for device integration. Merative Micromedex for drug safety.", badge: "R572M invested" },
            { title: "HEAL (Medicross)", icon: Wifi, color: "#E3964C", desc: "Built by Netcare Digital + A2D24 (Africa's first AWS Advanced Partner). React frontend, AWS serverless, AI/ML/NLP, Elasticsearch. Billing, pathology, consent, virtual care modules.", badge: "AWS Serverless" },
            { title: "Switching Infrastructure", icon: Network, color: "#10B981", desc: "Healthbridge (Netcare subsidiary, ~7K practices) + SwitchOn (formerly MediSwitch, 8K+ practices). PHISC MEDCLM protocol. Real-time eligibility + batch claims + ERA processing.", badge: "Netcare-owned" },
            { title: "CareConnect HIE", icon: GitBranch, color: "#8B5CF6", desc: "Netcare is founding member. InterSystems HealthShare platform. FHIR + HL7. 5.2M+ consented lives. ISO 27001/27701 compliant. Co-founded with Discovery, Life, Mediclinic, Medscheme.", badge: "5.2M lives" },
          ].map((item, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}10` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1D3443]">{item.title}</h3>
                </div>
                <span className="text-[9px] font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${item.color}15`, color: item.color }}>{item.badge}</span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeIn} className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] font-semibold text-amber-800">AI Governance Committee — Perfect Timing</div>
            <div className="text-[11px] text-amber-700 mt-1">Netcare&apos;s Social and Ethics Committee approved an AI Governance Policy in FY2024. The AI Governance Committee is being established now (Q2 FY2025). This documentation is prepared for that review.</div>
          </div>
        </motion.div>
      </section>

      {/* ═══ ARCHITECTURE DIAGRAM ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">Integration Architecture</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">How VRL connects to Netcare</h2>
          </motion.div>

          <motion.div {...fadeIn} className="bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] rounded-2xl p-8 text-white">
            <div className="space-y-3">
              {[
                { layer: "Netcare Systems", color: "#3DA9D1", items: "CareOn (HL7v2)  |  HEAL (REST/AWS)  |  Healthbridge (EDIFACT)  |  SwitchOn (EDIFACT)  |  CareConnect HIE (FHIR)" },
                { layer: "VRL Integration Layer", color: "#E3964C", items: "CareOn Bridge (HL7v2 → FHIR R4 → Advisory)  |  HEAL Adapter (REST)  |  Switching Engine (3-vendor router, EDIFACT MEDCLM)" },
                { layer: "AIRIA Orchestration", color: "#8B5CF6", items: "Agent Constraints (Policy Engine)  |  Model Routing  |  DLP / POPIA Security  |  Cost Dashboard  |  Audit Trail  |  Governance Console" },
                { layer: "AI Reasoning Engine", color: "#10B981", items: "106 Validation Rules  |  ICD-10 (41K)  |  NAPPI (487K)  |  Tariffs (10K)  |  Fraud Sentinel (15 signals)  |  Scheme Rules (6 schemes)" },
                { layer: "Multi-Model AI Chain", color: "#EC4899", items: "Claude Opus 4.6 (reasoning)  |  Claude Sonnet 4.6 (default)  |  Gemini 2.5 Flash (bulk)  |  Med42-MLX+LoRA (SA-tuned)  |  Llama 3.1 (offline)" },
                { layer: "Data Layer (PostgreSQL)", color: "#F59E0B", items: "Supabase (current)  |  AWS RDS af-south-1 (option)  |  Azure SA North (option)  |  On-premise (option)  |  56 tables  |  189K RAG chunks  |  RLS + Audit" },
              ].map((l, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[13px] font-bold">{l.layer}</span>
                  </div>
                  <div className="ml-6 px-4 py-3 bg-white/[0.06] rounded-lg text-[11px] text-white/50 font-mono">
                    {l.items}
                  </div>
                  {i < 5 && <div className="ml-7 flex items-center gap-1 py-1"><div className="w-px h-3 bg-white/10" /><span className="text-[9px] text-white/20 ml-1">▼</span></div>}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: "Pages", value: "181" },
                { label: "API Routes", value: "244" },
                { label: "DB Models", value: "56" },
                { label: "AI Tools", value: "38+" },
                { label: "Cron Jobs", value: "7" },
                { label: "Lines", value: "60K+" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-[18px] font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ BENCHMARKS ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#E3964C] tracking-wide uppercase">Performance Benchmarks</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Validated accuracy across every task</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div {...fadeIn} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Accuracy by Task Type</h3>
              <BarChart data={[
                { label: "Gender/age cross-check (deterministic)", value: 99.9, max: 100, color: "#10B981" },
                { label: "ICD-10 code validation", value: 98.1, max: 100, color: "#3DA9D1" },
                { label: "Scheme rule compliance", value: 94.5, max: 100, color: "#E3964C" },
                { label: "Fraud scoring", value: 94.5, max: 100, color: "#8B5CF6" },
                { label: "Code suggestion from notes", value: 91.3, max: 100, color: "#EC4899" },
                { label: "Rejection prediction", value: 89.7, max: 100, color: "#F59E0B" },
              ]} />
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Error Detection Rate</h3>
              <BarChart data={[
                { label: "VRL AI Engine", value: 92, max: 100, color: "#10B981" },
                { label: "Basic PMS rules", value: 75, max: 100, color: "#F59E0B" },
                { label: "Manual review", value: 55, max: 100, color: "#EF4444" },
              ]} />
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-[12px] font-semibold text-gray-500 mb-3">Validation Checks per Code</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-500 mb-1">Standard PMS</div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-300 rounded-full" style={{ width: `${(2/36)*100}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">2 checks</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-500 mb-1">VRL Engine</div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 1.2 }}
                        className="h-full bg-[#3DA9D1] rounded-full" />
                    </div>
                    <div className="text-[10px] text-[#3DA9D1] font-semibold mt-1">36 checks (18x more)</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Processing Speed</h3>
              <div className="space-y-4">
                {[
                  { label: "Human coder", time: "3-5 min", width: "100%", color: "#EF4444" },
                  { label: "Billing software", time: "5-10 sec", width: "3%", color: "#F59E0B" },
                  { label: "VRL AI Engine", time: "0.03 sec", width: "0.3%", color: "#10B981" },
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-600 font-medium">{d.label}</span>
                      <span className="text-[12px] font-bold" style={{ color: d.color }}>{d.time}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: d.width, backgroundColor: d.color, minWidth: d.width === "0.3%" ? "4px" : undefined }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-[11px] text-gray-400">300 claims processed in under 10 seconds</div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Knowledge Base Size</h3>
              <BarChart data={[
                { label: "VRL", value: 557, max: 560, color: "#3DA9D1", suffix: "K records" },
                { label: "US competitors (wrong codes)", value: 200, max: 560, color: "#94A3B8", suffix: "K records" },
                { label: "GoodX", value: 5, max: 560, color: "#D1D5DB", suffix: "K records" },
                { label: "Healthbridge Nora", value: 0, max: 560, color: "#E5E7EB", suffix: " (none)" },
                { label: "Heidi Health", value: 0, max: 560, color: "#E5E7EB", suffix: " (none)" },
              ]} />
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <div className="text-[10px] text-blue-800 font-semibold">557,345 SA-specific records</div>
                <div className="text-[10px] text-blue-600 mt-1">41K ICD-10 | 487K NAPPI | 10K tariffs | 10K formulary | 270 DTPs | 27 CDL | 6 scheme profiles</div>
              </div>
            </motion.div>
          </div>

          {/* Global benchmark table */}
          <motion.div {...fadeIn} className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-[14px] font-bold text-[#1D3443]">Global Benchmark Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#1D3443] text-white">
                    <th className="px-4 py-3 text-left font-semibold">System</th>
                    <th className="px-4 py-3 text-left font-semibold">Origin</th>
                    <th className="px-4 py-3 text-left font-semibold">Accuracy</th>
                    <th className="px-4 py-3 text-left font-semibold">SA Compatible</th>
                    <th className="px-4 py-3 text-left font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sys: "Fathom Health", origin: "US", acc: "98.3%", sa: false, method: "750M+ encounters, proprietary NLP" },
                    { sys: "CodaMetrix", origin: "US", acc: "98%", sa: false, method: "ML on US claims data" },
                    { sys: "Nym Health", origin: "US/Israel", acc: "95%+", sa: false, method: "Deterministic + NLP hybrid" },
                    { sys: "VRL Claims Engine", origin: "South Africa", acc: "92%+ / 98% ICD", sa: true, method: "106 rules + multi-model AI + 557K records" },
                    { sys: "PLM-ICD (ETH Zurich)", origin: "Academic", acc: "60.8% F1", sa: false, method: "Transformer, MIMIC-III benchmark" },
                  ].map((r, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${r.sa ? "bg-green-50" : ""}`}>
                      <td className={`px-4 py-3 ${r.sa ? "font-bold text-[#1D3443]" : "text-gray-700"}`}>{r.sys}</td>
                      <td className="px-4 py-3 text-gray-500">{r.origin}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: r.sa ? "#10B981" : "#1D3443" }}>{r.acc}</td>
                      <td className="px-4 py-3">{r.sa ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <span className="text-red-400 text-[10px]">US codes only</span>}</td>
                      <td className="px-4 py-3 text-gray-500">{r.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ AI GOVERNANCE ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#8B5CF6] tracking-wide uppercase">AI Governance Framework</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">For Netcare&apos;s AI Committee</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Eye, label: "Transparency", desc: "Every AI decision logged with input, model, output, confidence, cost", color: "#3DA9D1" },
              { icon: Brain, label: "Explainability", desc: "Code suggestions cite specific legislation. Reasoning chains visible.", color: "#E3964C" },
              { icon: Users, label: "Human Oversight", desc: "AI suggests, humans decide. No automated submissions without review.", color: "#10B981" },
              { icon: Shield, label: "Safety", desc: "90% deterministic rules. <2% hallucination rate on AI tasks.", color: "#8B5CF6" },
              { icon: Heart, label: "Fairness", desc: "Fraud detection requires multiple signals. No single-factor demographic flags.", color: "#EC4899" },
              { icon: Lock, label: "Privacy", desc: "PII stripped before AI. POPIA s26-33 health data protections. DLP via AIRIA.", color: "#F59E0B" },
              { icon: Database, label: "Accountability", desc: "All writes require data_source provenance. Fabrication blocked.", color: "#EF4444" },
              { icon: Activity, label: "Monitoring", desc: "AIRIA drift detection. Accuracy tracked per model, per task, per scheme.", color: "#14B8A6" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-gray-200 p-4">
                <item.icon className="w-5 h-5 mb-2" style={{ color: item.color }} />
                <div className="text-[12px] font-semibold text-[#1D3443]">{item.label}</div>
                <div className="text-[10px] text-gray-400 mt-1 leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Risk classification */}
          <motion.div {...fadeIn} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-[14px] font-bold text-[#1D3443]">AI Risk Classification (SAHPRA / EU AI Act aligned)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[#1D3443] text-white">
                    <th className="px-4 py-3 text-left font-semibold">Product</th>
                    <th className="px-4 py-3 text-left font-semibold">Risk Level</th>
                    <th className="px-4 py-3 text-left font-semibold">Rationale</th>
                    <th className="px-4 py-3 text-left font-semibold">SaMD?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { prod: "VisioCode (ICD-10 coding)", risk: "Limited", color: "#F59E0B", reason: "Administrative coding. Clinician reviews all suggestions.", samd: "No" },
                    { prod: "Doctor OS (scribe)", risk: "Limited", color: "#F59E0B", reason: "Transcription + note generation. Clinician signs off.", samd: "No" },
                    { prod: "Claims Analyzer", risk: "Limited", color: "#F59E0B", reason: "Pre-submission validation. Billing workflow only.", samd: "No" },
                    { prod: "Patient Flow AI", risk: "Minimal", color: "#10B981", reason: "Queue management and scheduling. No clinical decisions.", samd: "No" },
                    { prod: "CareOn Bridge", risk: "Minimal", color: "#10B981", reason: "Read-only advisory. Does not write to CareOn.", samd: "No" },
                    { prod: "Fraud Sentinel", risk: "Limited", color: "#F59E0B", reason: "Statistical flagging for human review. No automated actions.", samd: "No" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium text-[#1D3443]">{r.prod}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${r.color}20`, color: r.color }}>{r.risk}</span></td>
                      <td className="px-4 py-3 text-gray-500">{r.reason}</td>
                      <td className="px-4 py-3 text-gray-400">{r.samd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FINANCIAL IMPACT CALCULATOR ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#10B981] tracking-wide uppercase">Financial Impact</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">ROI calculator for Netcare Primary Care</h2>
          </motion.div>

          <motion.div {...fadeIn} className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Facilities</label>
                <input type="range" min={3} max={200} step={1} value={facilities}
                  onChange={e => setFacilities(Number(e.target.value))}
                  className="w-full accent-[#3DA9D1]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">{facilities}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Claims per facility / month</label>
                <input type="range" min={100} max={2000} step={50} value={claimsPerFacility}
                  onChange={e => setClaimsPerFacility(Number(e.target.value))}
                  className="w-full accent-[#E3964C]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">{claimsPerFacility.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Current rejection rate (%)</label>
                <input type="range" min={5} max={25} step={1} value={rejectionRate}
                  onChange={e => setRejectionRate(Number(e.target.value))}
                  className="w-full accent-[#EF4444]" />
                <div className="text-[20px] font-bold text-[#EF4444] mt-1">{rejectionRate}%</div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 mb-1">Annual rejection leakage</div>
                <div className="text-xl font-bold text-red-500">R{(rejectValue * 12 / 1000000).toFixed(1)}M</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 mb-1">Annual recovery (85%)</div>
                <div className="text-xl font-bold text-green-500">R{(annualRecovery / 1000000).toFixed(1)}M</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500 mb-1">Annual license cost</div>
                <div className="text-xl font-bold text-gray-600">R{(licenseCost / 1000000).toFixed(1)}M</div>
              </div>
              <div className="text-center bg-green-50 rounded-xl p-3">
                <div className="text-[10px] text-green-700 mb-1">ROI Multiple</div>
                <div className="text-2xl font-bold text-green-600">{roi}x</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500">AI inference cost / year</div>
                <div className="text-[14px] font-bold text-gray-600">R{Math.round(aiCost).toLocaleString()}</div>
                <div className="text-[9px] text-gray-400">R0.016 per claim</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500">Net EBITDA improvement</div>
                <div className="text-[14px] font-bold text-green-600">R{(netBenefit / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-gray-500">EBITDA margin impact</div>
                <div className="text-[14px] font-bold text-[#3DA9D1]">{((netBenefit / 662000000) * 100).toFixed(1)}%</div>
                <div className="text-[9px] text-gray-400">on R662M primary care revenue</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ COMPETITOR MATRIX ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#EF4444] tracking-wide uppercase">Competitive Landscape</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Nobody else does what we do in SA</h2>
          </motion.div>

          <motion.div {...fadeIn} className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-[#1D3443] text-white">
                  <th className="px-3 py-3 text-left font-semibold">Capability</th>
                  <th className="px-3 py-3 text-center font-semibold bg-[#3DA9D1]/30">VRL</th>
                  <th className="px-3 py-3 text-center font-semibold">Nora</th>
                  <th className="px-3 py-3 text-center font-semibold">GoodX</th>
                  <th className="px-3 py-3 text-center font-semibold">CareOn</th>
                  <th className="px-3 py-3 text-center font-semibold">Heidi</th>
                  <th className="px-3 py-3 text-center font-semibold">US (Olive/Waystar)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: "AI clinical transcription", vrl: true, nora: true, goodx: "~", careon: false, heidi: true, us: false },
                  { cap: "AI ICD-10 coding from notes", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: "US only" },
                  { cap: "Claims pre-validation", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: "US only" },
                  { cap: "SA scheme rules (6 schemes)", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: false },
                  { cap: "Fraud detection (FWA)", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: "~" },
                  { cap: "CareOn HL7v2 bridge", vrl: true, nora: false, goodx: false, careon: "Native", heidi: false, us: false },
                  { cap: "FHIR R4 server", vrl: true, nora: false, goodx: false, careon: "~", heidi: false, us: true },
                  { cap: "NAPPI database (487K)", vrl: true, nora: false, goodx: "~", careon: false, heidi: false, us: false },
                  { cap: "PMB/CDL validation", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: false },
                  { cap: "EDIFACT switching", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: false },
                  { cap: "SA WHO ICD-10 (not US)", vrl: true, nora: false, goodx: false, careon: false, heidi: false, us: false },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2.5 text-gray-700 font-medium">{r.cap}</td>
                    {[r.vrl, r.nora, r.goodx, r.careon, r.heidi, r.us].map((v, j) => (
                      <td key={j} className={`px-3 py-2.5 text-center ${j === 0 ? "bg-green-50" : ""}`}>
                        {v === true ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> :
                         v === false ? <span className="text-gray-300">—</span> :
                         <span className="text-[10px] text-gray-400">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══ SDK SECURITY ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#10B981] tracking-wide uppercase">Security & SDK Safety</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">How we access AI models safely</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Lock, label: "TLS 1.3", desc: "All API calls encrypted in transit" },
              { icon: Key, label: "API Keys in Env Vars", desc: "Never committed to source code" },
              { icon: Shield, label: "No Training on Data", desc: "Anthropic + Google do not train on API data" },
              { icon: Eye, label: "PII Stripped", desc: "Patient identifiers removed before AI" },
              { icon: Server, label: "HMAC-SHA256", desc: "Claim signing and verification" },
              { icon: HardDrive, label: "Offline Fallback", desc: "Med42-MLX + Llama 3.1 run locally" },
              { icon: Layers, label: "90% Deterministic", desc: "Rules engine has zero hallucination risk" },
              { icon: CloudCog, label: "AIRIA DLP", desc: "Real-time data loss prevention layer" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <item.icon className="w-5 h-5 text-[#10B981] mx-auto mb-2" />
                <div className="text-[12px] font-semibold text-[#1D3443]">{item.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1D3443] via-[#1D3443] to-[#2a4a5e] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E3964C]/20 rounded-full mb-4">
              <Award className="w-3.5 h-3.5 text-[#E3964C]" />
              <span className="text-[10px] font-semibold text-[#E3964C] tracking-wide">VISIO RESEARCH LABS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to integrate with Netcare
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-[14px] leading-relaxed mb-8">
              5 products live. 557,345 knowledge records. 106 validation rules traced to SA legislation.
              Built to complement CareOn, HEAL, and your switching infrastructure.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/dashboard"
                className="px-6 py-2.5 bg-white text-[#1D3443] rounded-xl text-[13px] font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
                Explore Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/research/claims-intelligence"
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-[13px] font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> Claims Intelligence Paper
              </Link>
              <Link href="/research/vrl-001"
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-[13px] font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" /> VRL-001 Whitepaper
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-6 px-6 bg-[#1D3443] text-center">
        <div className="text-[10px] text-white/30">
          VRL-003 | Architecture Compatibility & Integration Roadmap | April 2026 | Confidential — Netcare AI Committee
        </div>
        <div className="text-[10px] text-white/20 mt-1">
          Vision Research Labs | VisioCorp | Dr. D.H. Hampton | david@visiocorp.co
        </div>
      </footer>
    </div>
  );
}
