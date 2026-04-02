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
              <h3 className="text-[14px] font-bold text-[#1D3443] mb-4">Knowledge Base (SA-specific records)</h3>
              <BarChart data={[
                { label: "VRL", value: 557, max: 560, color: "#3DA9D1", suffix: "K" },
                { label: "US competitors (wrong codes)", value: 200, max: 560, color: "#94A3B8", suffix: "K" },
                { label: "GoodX", value: 5, max: 560, color: "#D1D5DB", suffix: "K" },
                { label: "Healthbridge Nora", value: 0, max: 560, color: "#E5E7EB", suffix: "" },
                { label: "Heidi Health", value: 0, max: 560, color: "#E5E7EB", suffix: "" },
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
