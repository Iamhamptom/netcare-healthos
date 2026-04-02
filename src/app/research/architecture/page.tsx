"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Shield, Brain, BarChart3, FileText, Zap, Building2,
  CheckCircle2, Lock, Clock, Users, TrendingDown, ArrowRight,
  Sparkles, Target, Globe, Award, ChevronRight, ChevronDown, Download,
  AlertTriangle, Database, Cpu, Eye, Heart, Server, ExternalLink,
  Network, Layers, GitBranch, Activity, Key, BookOpen,
  MonitorSmartphone, HardDrive, Wifi, CloudCog, FolderTree, Map,
  Stethoscope, FlaskConical, Microscope, LineChart, Copy, Check,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

// ── Expandable tree node ──
function TreeNode({ label, icon: Icon, color, children, defaultOpen, badge }: {
  label: string; icon: React.ElementType; color: string; children?: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const hasChildren = !!children;
  return (
    <div>
      <button onClick={() => hasChildren && setOpen(!open)}
        className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-colors ${hasChildren ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}>
        {hasChildren ? (open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />) : <div className="w-3.5" />}
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[12px] font-medium text-[#1D3443] flex-1">{label}</span>
        {badge && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>{badge}</span>}
      </button>
      <AnimatePresence>
        {open && children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="ml-6 pl-4 border-l border-gray-200 overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(d.value / d.max) * 100}%` }}
              viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }}
              className="h-full rounded-full" style={{ backgroundColor: d.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded hover:bg-white/10 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
    </button>
  );
}

export default function ArchitectureResearchPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [facilities, setFacilities] = useState(88);
  const [claimsPerFacility, setClaimsPerFacility] = useState(500);
  const [rejectionRate, setRejectionRate] = useState(14);

  const totalClaims = facilities * claimsPerFacility;
  const rejectValue = Math.round(totalClaims * (rejectionRate / 100)) * 800;
  const annualRecovery = Math.round(rejectValue * 0.85) * 12;
  const licenseCost = facilities * 5000 * 12;
  const aiCost = totalClaims * 0.016 * 12;
  const netBenefit = annualRecovery - licenseCost - aiCost;
  const roi = licenseCost > 0 ? (annualRecovery / licenseCost).toFixed(1) : "0";

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1D3443] via-[#1D3443] to-[#2a4a5e] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.08] max-w-md w-full text-center">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-5 brightness-[10] saturate-0 opacity-70 mx-auto mb-3" />
          <div className="text-[10px] tracking-[0.15em] text-white/50 font-semibold mb-6">HEALTH OS | VRL-003</div>
          <h1 className="text-xl font-bold text-white mb-2">Architecture & Integration Roadmap</h1>
          <p className="text-[12px] text-white/40 mb-6">This document is confidential. Enter the access code provided by VRL to continue.</p>
          <div className="flex gap-2">
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false); }} placeholder="Access code"
              onKeyDown={e => { if (e.key === "Enter") { if (pw === "Netcare2026!" || pw === "VRL003") { setAuthed(true); } else { setPwError(true); } } }}
              className={`flex-1 bg-white/[0.08] border ${pwError ? "border-red-500" : "border-white/[0.12]"} rounded-xl px-4 py-2.5 text-white text-[13px] placeholder:text-white/30 focus:outline-none focus:border-[#3DA9D1]`} />
            <button onClick={() => { if (pw === "Netcare2026!" || pw === "VRL003") { setAuthed(true); } else { setPwError(true); } }}
              className="px-5 py-2.5 bg-[#3DA9D1] text-white rounded-xl text-[13px] font-medium hover:bg-[#3DA9D1]/80 transition-colors">
              Enter
            </button>
          </div>
          {pwError && <div className="text-[11px] text-red-400 mt-2">Invalid access code</div>}
          <div className="text-[10px] text-white/20 mt-6">Prepared for Netcare AI Governance Committee | April 2026</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F4] text-[#1A1A1A]">
      {/* ═══ NAV ═══ */}
      <nav className="bg-[#1D3443] text-white py-3 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-4 brightness-[10] saturate-0 opacity-70" />
          <span className="text-[10px] tracking-[0.15em] text-white/70 font-semibold">HEALTH OS</span>
          <span className="text-white/70">|</span>
          <span className="text-[11px] text-white/50">Research VRL-003</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/research" className="text-[11px] text-white/60 hover:text-white/70 transition-colors">All Research</Link>
          <Link href="/dashboard" className="text-[11px] text-white/60 hover:text-white/70 transition-colors">Dashboard</Link>
        </div>
      </nav>

      {/* ═══ HERO — Addressed to Netcare ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D3443] via-[#1D3443] to-[#2a4a5e] text-white py-20 px-6">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-5xl mx-auto relative">
          <motion.div {...fadeIn} className="flex items-center gap-2 mb-6 flex-wrap">
            <div className="px-3 py-1 bg-[#3DA9D1]/20 rounded-full text-[10px] font-semibold text-[#3DA9D1] tracking-wide">VISIO RESEARCH LABS</div>
            <div className="px-3 py-1 bg-[#E3964C]/20 rounded-full text-[10px] font-semibold text-[#E3964C] tracking-wide">VRL-003 | APRIL 2026</div>
            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-semibold text-white/70 tracking-wide">PREPARED FOR NETCARE AI COMMITTEE</div>
          </motion.div>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Architecture, Compatibility &<br />Integration Roadmap
          </motion.h1>
          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg text-white/60 max-w-2xl mb-8 leading-relaxed">
            Prepared for Netcare&apos;s AI Governance Committee. This document details how VRL&apos;s
            AI claims intelligence integrates with CareOn, HEAL, Healthbridge, and SwitchOn.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { value: "5", label: "AI Products (Demo Available)", color: "#3DA9D1" },
              { value: "1.2M+", label: "Knowledge Data Points", color: "#E3964C" },
              { value: "10K+", label: "Validation Checks", color: "#10B981" },
              { value: "380+", label: "API Endpoints", color: "#8B5CF6" },
              { value: "Anti-Fraud", label: "8 Patterns | 15 Signals", color: "#EF4444" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[11px] text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Download PDFs */}
          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="flex items-center gap-3 flex-wrap">
            <a href="/docs/VRL-003-Architecture-Compatibility.pdf" download
              className="px-5 py-2.5 bg-white text-[#1D3443] rounded-xl text-[12px] font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Architecture PDF
            </a>
            <a href="/docs/VRL-Technical-Documentation-Pack.pdf" download
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-[12px] font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Technical Documentation PDF
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ DEMO ACCESS ═══ */}
      <section className="py-8 px-6 bg-gradient-to-r from-[#0a2540] to-[#1D3443]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-6 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-[#E3964C]" />
              <span className="text-[12px] font-semibold text-white">Demo Access — Netcare AI Committee</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white/[0.04] rounded-lg p-3">
                <div className="text-[10px] text-white/40 mb-1">Email</div>
                <div className="flex items-center gap-2">
                  <code className="text-[13px] text-[#3DA9D1] font-mono">netcare@visiocorp.co</code>
                  <CopyButton text="netcare@visiocorp.co" />
                </div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-3">
                <div className="text-[10px] text-white/40 mb-1">Password</div>
                <div className="flex items-center gap-2">
                  <code className="text-[13px] text-[#3DA9D1] font-mono">Netcare2026!</code>
                  <CopyButton text="Netcare2026!" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { name: "Doctor OS", url: "https://doctor-os.vercel.app", desc: "AI scribe + coding" },
                { name: "VisioCode", url: "https://visiocode.vercel.app", desc: "Clinical coding" },
                { name: "Health OS", url: "https://healthos.visiocorp.co", desc: "Enterprise platform" },
                { name: "Claims Analyzer", url: "https://claims-rejection-analyzer.vercel.app", desc: "Rejection analysis" },
                { name: "Patient Flow", url: "https://patient-flow-ai.vercel.app", desc: "Queue + no-show AI" },
              ].map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white/[0.06] hover:bg-white/[0.12] rounded-lg p-3 transition-colors group">
                  <div className="text-[11px] font-semibold text-white flex items-center gap-1">
                    {p.name} <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/60" />
                  </div>
                  <div className="text-[9px] text-white/40 mt-0.5">{p.desc}</div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ ARCHITECTURE TREE — Expandable ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">System Architecture</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Expandable architecture map</h2>
            <p className="text-[13px] text-gray-500 mt-2">Click any node to expand and explore the full system tree</p>
          </motion.div>

          <motion.div {...fadeIn} className="bg-white rounded-2xl border border-gray-200 p-6">
            <TreeNode label="VRL Advanced AI Systems" icon={Globe} color="#1D3443" defaultOpen>
              <TreeNode label="Netcare Integration Layer" icon={Network} color="#3DA9D1" defaultOpen>
                <TreeNode label="CareOn Bridge (Hospital EMR)" icon={MonitorSmartphone} color="#3DA9D1" badge="HL7v2 → FHIR R4">
                  <TreeNode label="HL7v2 Parser (ADT, ORU, ORM, DFT, SIU)" icon={FileText} color="#3DA9D1" />
                  <TreeNode label="FHIR R4 Mapper (Patient, Encounter, Observation)" icon={GitBranch} color="#3DA9D1" />
                  <TreeNode label="AI Advisory Engine (billing, eligibility, clinical)" icon={Brain} color="#3DA9D1" />
                  <TreeNode label="Audit Logger (5-year retention)" icon={Eye} color="#3DA9D1" />
                </TreeNode>
                <TreeNode label="HEAL Adapter (Medicross Primary Care)" icon={Wifi} color="#E3964C" badge="REST API">
                  <TreeNode label="Billing data sync" icon={BarChart3} color="#E3964C" />
                  <TreeNode label="Pathology results integration" icon={Microscope} color="#E3964C" />
                  <TreeNode label="Patient consent module" icon={Heart} color="#E3964C" />
                </TreeNode>
                <TreeNode label="Switching Engine (3 vendors)" icon={Layers} color="#10B981" badge="EDIFACT MEDCLM">
                  <TreeNode label="Healthbridge (Netcare subsidiary, ~7K practices)" icon={Building2} color="#10B981" />
                  <TreeNode label="SwitchOn / Altron HealthTech (8K+ practices)" icon={Building2} color="#10B981" />
                  <TreeNode label="MediKredit / AfroCentric (Discovery switch)" icon={Building2} color="#10B981" />
                  <TreeNode label="Real-time eligibility (MEDVAL)" icon={Zap} color="#10B981" />
                  <TreeNode label="Batch claims submission" icon={Database} color="#10B981" />
                  <TreeNode label="Electronic Remittance Advice (ERA)" icon={FileText} color="#10B981" />
                  <TreeNode label="Pre-authorisation requests" icon={Shield} color="#10B981" />
                </TreeNode>
                <TreeNode label="CareConnect HIE (FHIR + HL7)" icon={GitBranch} color="#8B5CF6" badge="5.2M lives" />
              </TreeNode>

              <TreeNode label="AI Reasoning Engine" icon={Brain} color="#E3964C" defaultOpen>
                <TreeNode label="Validation Rules (106 rules, legislation-traced)" icon={Shield} color="#E3964C">
                  <TreeNode label="ICD-10-ZA validation (41,009 codes, 36 columns)" icon={CheckCircle2} color="#E3964C" />
                  <TreeNode label="Tariff code validation (10,304 CCSA codes)" icon={CheckCircle2} color="#E3964C" />
                  <TreeNode label="NAPPI medicine lookup (487,086 records)" icon={CheckCircle2} color="#E3964C" />
                  <TreeNode label="Code pair violations (250+ rules)" icon={CheckCircle2} color="#E3964C" />
                  <TreeNode label="PMB/CDL validation (270 DTPs, 27 CDL)" icon={CheckCircle2} color="#E3964C" />
                  <TreeNode label="Scheme-specific rules (6 major schemes)" icon={CheckCircle2} color="#E3964C" />
                </TreeNode>
                <TreeNode label="Fraud Detection (8 patterns, 15 signals)" icon={AlertTriangle} color="#EF4444">
                  <TreeNode label="Unbundling detection" icon={Target} color="#EF4444" />
                  <TreeNode label="Upcoding (peer z-score analysis)" icon={TrendingDown} color="#EF4444" />
                  <TreeNode label="Phantom billing (cross-ref DHA)" icon={Eye} color="#EF4444" />
                  <TreeNode label="Duplicate detection (exact + fuzzy)" icon={Database} color="#EF4444" />
                  <TreeNode label="Benford's Law analysis" icon={BarChart3} color="#EF4444" />
                  <TreeNode label="Geographic impossibility" icon={Map} color="#EF4444" />
                  <TreeNode label="After-hours modifier fraud" icon={Clock} color="#EF4444" />
                  <TreeNode label="Prescription fraud (DDD analysis)" icon={FlaskConical} color="#EF4444" />
                </TreeNode>
                <TreeNode label="Multi-Model AI Chain" icon={Cpu} color="#8B5CF6">
                  <TreeNode label="Claude Opus 4.6 — Complex reasoning" icon={Brain} color="#8B5CF6" />
                  <TreeNode label="Claude Sonnet 4.6 — Standard processing" icon={Brain} color="#8B5CF6" />
                  <TreeNode label="Gemini 2.5 Flash — Cost-optimised bulk" icon={Zap} color="#8B5CF6" />
                  <TreeNode label="Med42-MLX + LoRA — SA fine-tuned (offline)" icon={HardDrive} color="#8B5CF6" />
                  <TreeNode label="Llama 3.1 8B — Air-gapped fallback" icon={Server} color="#8B5CF6" />
                  <TreeNode label="Deterministic rules — Zero hallucination" icon={Shield} color="#8B5CF6" />
                </TreeNode>
              </TreeNode>

              <TreeNode label="Data Layer (White-Label Ready)" icon={Database} color="#10B981">
                <TreeNode label="Supabase PostgreSQL (current — EU-West-1)" icon={Database} color="#10B981" badge="Default">
                  <TreeNode label="56 tables, pgvector (189K RAG chunks), RLS" icon={Layers} color="#10B981" />
                  <TreeNode label="Row Level Security (practice-scoped)" icon={Lock} color="#10B981" />
                  <TreeNode label="Audit logging on all writes" icon={Eye} color="#10B981" />
                </TreeNode>
                <TreeNode label="AWS RDS PostgreSQL (option — af-south-1 Cape Town)" icon={CloudCog} color="#F59E0B" badge="White-label">
                  <TreeNode label="Same schema, zero code changes" icon={CheckCircle2} color="#F59E0B" />
                  <TreeNode label="ECS Fargate + CloudFront + ElastiCache" icon={Server} color="#F59E0B" />
                  <TreeNode label="AWS Bedrock (Claude) + S3 + SES" icon={CloudCog} color="#F59E0B" />
                  <TreeNode label="Migration: 2-3 weeks" icon={Clock} color="#F59E0B" />
                </TreeNode>
                <TreeNode label="Azure Database for PostgreSQL (option — SA North)" icon={CloudCog} color="#0078D4" badge="White-label">
                  <TreeNode label="Same schema, zero code changes" icon={CheckCircle2} color="#0078D4" />
                  <TreeNode label="Container Apps + Front Door + Redis" icon={Server} color="#0078D4" />
                  <TreeNode label="Azure OpenAI Service" icon={Brain} color="#0078D4" />
                  <TreeNode label="Migration: 2-3 weeks" icon={Clock} color="#0078D4" />
                </TreeNode>
                <TreeNode label="On-Premise PostgreSQL (option — Netcare DC)" icon={HardDrive} color="#6B7280" badge="Air-gapped" />
              </TreeNode>

              <TreeNode label="AIRIA Orchestration & Governance" icon={Shield} color="#8B5CF6">
                <TreeNode label="Agent Constraints (policy engine)" icon={Lock} color="#8B5CF6" />
                <TreeNode label="Model Routing (task-based, cost-aware)" icon={GitBranch} color="#8B5CF6" />
                <TreeNode label="DLP / POPIA Security Layer" icon={Shield} color="#8B5CF6" />
                <TreeNode label="Cost Dashboard (per facility, per query)" icon={BarChart3} color="#8B5CF6" />
                <TreeNode label="Audit Trail (every AI decision logged)" icon={Eye} color="#8B5CF6" />
                <TreeNode label="MCP Gateway (1,000+ integrations)" icon={Network} color="#8B5CF6" />
              </TreeNode>
            </TreeNode>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRODUCT SITE MAP ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#E3964C] tracking-wide uppercase">Product Suite</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">5 live products — click to explore</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Netcare Health OS", url: "https://healthos.visiocorp.co", color: "#1D3443", pages: "181 pages", apis: "244 APIs", models: "56 DB models", features: ["CareOn Bridge", "FHIR R4 Hub", "Switching Engine", "Claims Analyzer", "WhatsApp Module", "Multi-tenant white-label"] },
              { name: "Doctor OS", url: "https://doctor-os.vercel.app", color: "#3DA9D1", pages: "15 pages", apis: "10 APIs", models: "18 DB models", features: ["AI medical scribe", "Real-time transcription", "38 AI tools", "ICD-10 auto-coding", "SOAP note generation", "Prescription + billing"] },
              { name: "VisioCode", url: "https://visiocode.vercel.app", color: "#E3964C", pages: "18 pages", apis: "24 APIs", models: "18 AI tools", features: ["41K ICD-10 codes", "487K NAPPI records", "10K tariff codes", "Fraud Sentinel (15 signals)", "Batch coding", "HMAC-SHA256 signing"] },
              { name: "Claims Analyzer", url: "https://claims-rejection-analyzer.vercel.app", color: "#EF4444", pages: "Standalone", apis: "10 APIs", models: "7 scheme profiles", features: ["Pre-submission validation", "Auto-correction engine", "Healthbridge EDI parsing", "PDF report generation", "Pattern learning", "R51-68K/month savings"] },
              { name: "Patient Flow AI", url: "https://patient-flow-ai.vercel.app", color: "#10B981", pages: "13 pages", apis: "45 FlowBot tools", models: "19 DB tables", features: ["No-show prediction (90%)", "Kanban patient flow", "WhatsApp + SMS + email", "Capacity forecasting", "Engagement sequences", "Morning briefing AI"] },
            ].map((p, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4" style={{ backgroundColor: `${p.color}08` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[14px] font-bold" style={{ color: p.color }}>{p.name}</h3>
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-medium flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/50 transition-colors" style={{ color: p.color }}>
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{p.pages}</span><span>|</span><span>{p.apis}</span><span>|</span><span>{p.models}</span>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-[11px] text-gray-600">
                        <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: p.color }} />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
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
                { label: "Gender/age cross-check", value: 99.9, max: 100, color: "#10B981" },
                { label: "ICD-10 code validation", value: 98.1, max: 100, color: "#3DA9D1" },
                { label: "Scheme rule compliance", value: 94.5, max: 100, color: "#E3964C" },
                { label: "Fraud scoring", value: 94.5, max: 100, color: "#8B5CF6" },
                { label: "Code suggestion from notes", value: 91.3, max: 100, color: "#EC4899" },
                { label: "Rejection prediction", value: 89.7, max: 100, color: "#F59E0B" },
              ]} />
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Knowledge Base (data points)</h3>
              <BarChart data={[
                { label: "VRL (SA-native)", value: 1.2, max: 1.3, color: "#3DA9D1", suffix: "M+" },
                { label: "US competitors (wrong codes for SA)", value: 0.2, max: 1.3, color: "#94A3B8", suffix: "M" },
                { label: "GoodX", value: 0.005, max: 1.3, color: "#D1D5DB", suffix: "M" },
                { label: "Healthbridge Nora", value: 0, max: 1.3, color: "#E5E7EB", suffix: " (none)" },
                { label: "Heidi Health", value: 0, max: 1.3, color: "#E5E7EB", suffix: " (none)" },
              ]} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FINANCIAL CALCULATOR ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#10B981] tracking-wide uppercase">Financial Impact</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">ROI calculator — Netcare Primary Care</h2>
          </motion.div>

          <motion.div {...fadeIn} className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Facilities</label>
                <input type="range" min={3} max={200} value={facilities} onChange={e => setFacilities(Number(e.target.value))} className="w-full accent-[#3DA9D1]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">{facilities}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Claims / facility / month</label>
                <input type="range" min={100} max={2000} step={50} value={claimsPerFacility} onChange={e => setClaimsPerFacility(Number(e.target.value))} className="w-full accent-[#E3964C]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">{claimsPerFacility.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Rejection rate (%)</label>
                <input type="range" min={5} max={25} value={rejectionRate} onChange={e => setRejectionRate(Number(e.target.value))} className="w-full accent-[#EF4444]" />
                <div className="text-[20px] font-bold text-[#EF4444] mt-1">{rejectionRate}%</div>
              </div>
            </div>
            <div className="h-px bg-gray-200 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-[10px] text-gray-500 mb-1">Annual leakage</div>
                <div className="text-xl font-bold text-red-500">R{(rejectValue * 12 / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-[10px] text-gray-500 mb-1">Annual recovery</div>
                <div className="text-xl font-bold text-green-500">R{(annualRecovery / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                <div className="text-[10px] text-gray-500 mb-1">License cost / year</div>
                <div className="text-xl font-bold text-gray-600">R{(licenseCost / 1000000).toFixed(1)}M</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                <div className="text-[10px] text-green-700 mb-1">ROI Multiple</div>
                <div className="text-2xl font-bold text-green-600">{roi}x</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ INTELLIGENCE MAP + RESEARCH + DOWNLOADS ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#8B5CF6] tracking-wide uppercase">Intelligence & Research</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">300MB of SA healthcare intelligence</h2>
          </motion.div>

          {/* Intelligence map */}
          <motion.div {...fadeIn} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-[14px] font-bold text-[#1D3443] mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-[#8B5CF6]" /> Intelligence Map — Knowledge Domains
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { domain: "Law & Regulation", files: "MSA, POPIA, HPCSA, SAHPRA, NHI", color: "#EF4444" },
                { domain: "Claims Adjudication", files: "25 rejection codes, decision flowcharts", color: "#F59E0B" },
                { domain: "Coding Standards", files: "ICD-10, CCSA tariffs, NAPPI, EDI", color: "#3DA9D1" },
                { domain: "PMB & CDL", files: "270 DTPs, 27 CDL, all subcodes", color: "#10B981" },
                { domain: "Scheme Profiles", files: "Discovery, GEMS, Bonitas + 3 more", color: "#8B5CF6" },
                { domain: "Pharmaceutical", files: "NAPPI spec, SEP, dispensing, DUR", color: "#EC4899" },
                { domain: "Fraud Detection", files: "R22-28B problem, 8 types, algorithms", color: "#EF4444" },
                { domain: "Compliance", files: "POPIA, SAHPRA SaMD, ISO, cross-border", color: "#F59E0B" },
                { domain: "Industry Landscape", files: "Vendors, tech, hospitals, startups", color: "#3DA9D1" },
                { domain: "Clinical Guidelines", files: "SA-specific treatment protocols", color: "#10B981" },
                { domain: "Competitor Analysis", files: "Nora, GoodX, Heidi, US players", color: "#8B5CF6" },
                { domain: "Enterprise Benchmarks", files: "CMS data, scheme rates, rejection %", color: "#EC4899" },
              ].map((d, i) => (
                <div key={i} className="rounded-lg p-3 border border-gray-100 hover:border-gray-300 transition-colors">
                  <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: d.color }} />
                  <div className="text-[11px] font-semibold text-[#1D3443]">{d.domain}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{d.files}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quarterly research publications */}
          <motion.div {...fadeIn} className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-[14px] font-bold text-[#1D3443] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E3964C]" /> Quarterly Research Publications
            </h3>
            <div className="space-y-3">
              {[
                { code: "VRL-001", title: "AI-Powered Healthcare Claims Intelligence: SA Medical Schemes Ecosystem", date: "Q1 2026", url: "/research/vrl-001", color: "#3DA9D1" },
                { code: "VRL-002", title: "106 Rules, 487K Medicines, Zero Tolerance: Claims Intelligence Engine", date: "Q1 2026", url: "/research/claims-intelligence", color: "#E3964C" },
                { code: "VRL-003", title: "Architecture Compatibility & Integration Roadmap (this document)", date: "Q2 2026", url: "#", color: "#8B5CF6" },
                { code: "VRL-004", title: "Global Claims Analysis & ICD Coding AI Research (ETH Zurich, MedCodER)", date: "Q2 2026", url: "/research/vrl-002", color: "#10B981" },
              ].map((pub, i) => (
                <Link key={i} href={pub.url}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: `${pub.color}15`, color: pub.color }}>{pub.code}</span>
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-[#1D3443] group-hover:text-[#3DA9D1] transition-colors">{pub.title}</div>
                    <div className="text-[10px] text-gray-400">{pub.date}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#3DA9D1] transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Downloads */}
          <motion.div {...fadeIn} className="bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] rounded-xl p-6 text-white">
            <h3 className="text-[14px] font-bold mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#E3964C]" /> Downloads — Prepared for Netcare AI Committee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Architecture & Compatibility Analysis", file: "/docs/VRL-003-Architecture-Compatibility.pdf", size: "627 KB", desc: "12 sections: tech stack, integration, fraud detection, cost projections, governance, benchmarks" },
                { name: "Technical Documentation Pack", file: "/docs/VRL-Technical-Documentation-Pack.pdf", size: "483 KB", desc: "Product specs: all 5 products, API surface, data models, deployment infrastructure" },
              ].map((dl, i) => (
                <a key={i} href={dl.file} download
                  className="bg-white/[0.06] hover:bg-white/[0.12] rounded-lg p-4 transition-colors border border-white/[0.08] group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold">{dl.name}</span>
                    <Download className="w-4 h-4 text-white/40 group-hover:text-white/80" />
                  </div>
                  <div className="text-[10px] text-white/40">{dl.desc}</div>
                  <div className="text-[9px] text-white/30 mt-2">PDF | {dl.size}</div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PER-TOOL SAVINGS PROJECTION ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#10B981] tracking-wide uppercase">Revenue Impact by Product</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Each tool pays for itself</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Doctor OS", url: "https://doctor-os.vercel.app", icon: Stethoscope, color: "#3DA9D1", saving: "R480K", per: "per practice / year", how: "AI scribe eliminates 3-5 min manual coding per consult. 30 consults/day = 2.5hrs saved daily. Reduces coding errors by 80%, directly cutting the #1 rejection cause.", features: ["Real-time transcription → SOAP notes", "Auto ICD-10 code assignment", "38 AI clinical tools", "Drug interaction checking (NAPPI)"] },
              { name: "VisioCode", url: "https://visiocode.vercel.app", icon: FileText, color: "#E3964C", saving: "R51-68K", per: "per practice / month", how: "Pre-submission validation catches 85% of preventable rejections before they cost money. 10K+ validation checks per claim across 6 SA medical schemes.", features: ["41K ICD-10 codes (36-column validation)", "487K NAPPI medicine lookup", "10K+ tariff codes with Rand rates", "Fraud Sentinel (15-signal scoring)"] },
              { name: "Claims Analyzer", url: "https://claims-rejection-analyzer.vercel.app", icon: Shield, color: "#EF4444", saving: "R54-72M", per: "across 88 Netcare clinics / year", how: "Auto-correction engine fixes high-confidence errors (missing ECCs, specificity, format). Pattern learning from historical rejections. Healthbridge EDI native parsing.", features: ["13 core validation rules + scheme-specific", "Auto-correction for deterministic fixes", "PDF rejection reports", "Healthbridge EDI auto-detection"] },
              { name: "Patient Flow AI", url: "https://patient-flow-ai.vercel.app", icon: Users, color: "#10B981", saving: "R1-2K", per: "per doctor / day recovered", how: "No-show prediction (90% accuracy) enables proactive interventions: automated reminders, overbooking optimisation, waitlist backfill. Reduces lost consultation revenue.", features: ["Dual-model no-show prediction", "WhatsApp + SMS + email reminders", "Capacity forecasting", "Morning briefing AI"] },
              { name: "Health OS Platform", url: "https://healthos.visiocorp.co", icon: Globe, color: "#1D3443", saving: "3-4%", per: "EBITDA margin improvement", how: "Full enterprise platform: CareOn Bridge, FHIR R4 Hub, Switching Engine, WhatsApp module. Multi-tenant white-label. 181 pages, 380+ API endpoints.", features: ["CareOn HL7v2 → FHIR R4 bridge", "3-vendor switching (EDIFACT)", "Multi-tenant white-label", "AI governance dashboard"] },
              { name: "Fraud Sentinel", url: "https://healthos.visiocorp.co/dashboard/claims", icon: AlertTriangle, color: "#F59E0B", saving: "R22-28B", per: "national FWA problem (our addressable share)", how: "8 fraud patterns, 15 detection signals, Benford's Law analysis, peer z-score comparison. Catches unbundling, upcoding, phantom billing, duplicate claims, after-hours fraud.", features: ["Composite scoring (0-100)", "Peer comparison (9 metrics)", "Geographic impossibility detection", "Temporal analysis (impossible schedules)"] },
            ].map((tool, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }} className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4" style={{ backgroundColor: `${tool.color}08` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <tool.icon className="w-4 h-4" style={{ color: tool.color }} />
                      <h3 className="text-[13px] font-bold" style={{ color: tool.color }}>{tool.name}</h3>
                    </div>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] font-medium flex items-center gap-1 px-2 py-1 rounded-full bg-white/50 hover:bg-white transition-colors" style={{ color: tool.color }}>
                      Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="text-xl font-bold" style={{ color: tool.color }}>{tool.saving}</div>
                  <div className="text-[9px] text-gray-500">{tool.per}</div>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{tool.how}</p>
                  <ul className="space-y-1">
                    {tool.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-[10px] text-gray-600">
                        <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: tool.color }} />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ UIS SOVEREIGN DATA + LOCAL INFERENCE ═══ */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#0a1628] to-[#1D3443]">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F59E0B]/20 rounded-full mb-4">
              <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-[10px] font-semibold text-[#F59E0B] tracking-wide">VALUE-ADDED PARTNERSHIP</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">UIS Sovereign Data Solutions + Local Inference</h2>
            <p className="text-[13px] text-white/40 mt-3 max-w-2xl mx-auto">
              VRL operates across South Africa, the United States (research consultancy to medical companies), and Dubai in partnership
              with UIS — delivering enterprise-grade sovereign data solutions and local AI inference capabilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { title: "Sovereign Data Hosting", icon: HardDrive, color: "#F59E0B", items: ["Data never leaves jurisdiction (SA POPIA, UAE PDPL, US HIPAA)", "On-premise PostgreSQL deployment option", "Air-gapped environments supported", "Full data residency compliance", "Encryption at rest (AES-256) and in transit (TLS 1.3)"] },
              { title: "Local AI Inference", icon: Cpu, color: "#10B981", items: ["Med42-MLX + LoRA (SA fine-tuned, runs on Apple Silicon)", "Llama 3.1 8B (quantised, any GPU/CPU)", "Zero external API dependency option", "80-90% cost reduction vs cloud inference", "Process 300 claims in <10 seconds locally"] },
              { title: "Global Operations", icon: Globe, color: "#3DA9D1", items: ["South Africa — Primary market, full product suite", "United States — Research consultancy to medical AI companies", "Dubai (UAE) — UIS partnership, sovereign cloud deployment", "Multi-jurisdiction compliance (POPIA, HIPAA, PDPL)", "Quarterly research publications (VRL-001 through VRL-004)"] },
            ].map((card, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-5 border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <h3 className="text-[13px] font-bold text-white">{card.title}</h3>
                </div>
                <ul className="space-y-2">
                  {card.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-[11px] text-white/50">
                      <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: card.color }} />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Cost comparison */}
          <motion.div {...fadeIn} className="bg-white/[0.04] rounded-xl p-6 border border-white/[0.08]">
            <h3 className="text-[13px] font-bold text-white mb-4">AI Inference Cost Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Cloud API (Claude/Gemini)", cost: "R0.016", per: "per claim", annual: "R8,448/yr (88 facilities)", color: "#94A3B8" },
                { label: "Local Inference (Med42/Llama)", cost: "R0.002", per: "per claim (electricity only)", annual: "R1,056/yr (88 facilities)", color: "#10B981", badge: "8x cheaper" },
                { label: "Hybrid (rules + local + cloud fallback)", cost: "R0.005", per: "per claim average", annual: "R2,640/yr (88 facilities)", color: "#3DA9D1", badge: "Recommended" },
              ].map((opt, i) => (
                <div key={i} className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/60 font-medium">{opt.label}</span>
                    {opt.badge && <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${opt.color}20`, color: opt.color }}>{opt.badge}</span>}
                  </div>
                  <div className="text-xl font-bold" style={{ color: opt.color }}>{opt.cost}</div>
                  <div className="text-[9px] text-white/30">{opt.per}</div>
                  <div className="text-[10px] text-white/40 mt-2">{opt.annual}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ API ACCESS (Model Stack) ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#8B5CF6] tracking-wide uppercase">API Access</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Access our model stack via API</h2>
            <p className="text-[13px] text-gray-500 mt-2">Enterprise API keys available for direct access to VRL&apos;s AI capabilities</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "ICD-10 Lookup API", desc: "Search and validate 41,009 SA WHO ICD-10 codes with 36-column validation (gender, age, PMB, CDL, specificity)", icon: Database, color: "#3DA9D1" },
              { name: "NAPPI Medicine API", desc: "Query 487,086 active medicine records — SEP pricing, dispensing fees, generic status, schedule, interactions", icon: FlaskConical, color: "#E3964C" },
              { name: "Claims Validation API", desc: "Submit a claim for pre-validation against 10K+ checks. Returns issues, corrections, and confidence scores", icon: Shield, color: "#10B981" },
              { name: "AI Code Suggestion API", desc: "Send clinical notes, receive suggested ICD-10 codes with reasoning chains and confidence levels", icon: Brain, color: "#8B5CF6" },
              { name: "Fraud Scoring API", desc: "Score a claim against 8 fraud patterns and 15 detection signals. Returns composite score 0-100 with explanations", icon: AlertTriangle, color: "#EF4444" },
              { name: "Scheme Rules API", desc: "Check claim compatibility against Discovery, GEMS, Bonitas, Momentum, Medihelp, Bestmed rules", icon: Building2, color: "#F59E0B" },
            ].map((api, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${api.color}10` }}>
                    <api.icon className="w-4 h-4" style={{ color: api.color }} />
                  </div>
                  <h3 className="text-[13px] font-bold text-[#1D3443]">{api.name}</h3>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{api.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
            <div className="text-[12px] text-gray-600">API pricing is custom per enterprise agreement. Contact <strong className="text-[#1D3443]">david@visiocorp.co</strong> for API key provisioning.</div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 bg-[#1D3443]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-[10px] text-white/30 mb-2">
            VRL-003 | Architecture Compatibility & Integration Roadmap | April 2026
          </div>
          <div className="text-[10px] text-white/20 mb-4">
            Prepared for Netcare AI Governance Committee | Confidential
          </div>
          <div className="text-[10px] text-white/40">
            Vision Research Labs | VisioCorp | Dr. D.H. Hampton | david@visiocorp.co
          </div>
        </div>
      </footer>
    </div>
  );
}
