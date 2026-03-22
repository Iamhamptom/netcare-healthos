"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Brain, BarChart3, FileText, Zap, Building2,
  CheckCircle2, Lock, Clock, Users, TrendingDown, ArrowRight,
  Sparkles, Target, Globe, Award, ChevronRight, Download,
  AlertTriangle, Database, Cpu, Eye, Heart,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function ClaimsIntelligenceResearchPage() {
  const [claimsPerMonth, setClaimsPerMonth] = useState(500);
  const [avgClaimValue, setAvgClaimValue] = useState(800);
  const [rejectionRate, setRejectionRate] = useState(15);

  const monthlyAtRisk = Math.round(claimsPerMonth * (rejectionRate / 100) * avgClaimValue);
  const monthlyRecovery = Math.round(monthlyAtRisk * 0.85);
  const annualSavings = monthlyRecovery * 12;
  const networkAnnual = annualSavings * 88;

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
        <Link href="/dashboard" className="text-[11px] text-white/60 hover:text-white/70 transition-colors">
          Dashboard
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
              VRL-002 | MARCH 2026
            </div>
          </motion.div>

          <motion.h1 {...fadeIn} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Claims Intelligence Engine
          </motion.h1>
          <motion.p {...fadeIn} transition={{ delay: 0.2 }} className="text-lg text-white/60 max-w-2xl mb-8 leading-relaxed">
            Pre-submission validation that catches claim rejections before they cost you money.
            Built for South African healthcare. Powered by AI.
          </motion.p>

          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "427", label: "ICD-10-ZA Codes", color: "#3DA9D1" },
              { value: "276", label: "NHRPL Tariff Codes", color: "#E3964C" },
              { value: "7", label: "Scheme Profiles", color: "#10B981" },
              { value: "13+", label: "Validation Rules", color: "#8B5CF6" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[11px] text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.div {...fadeIn}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-semibold text-red-500 tracking-wide uppercase">The Problem</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1D3443] mb-4">
            South African practices lose 15-20% of revenue to claim rejections
          </h2>
          <p className="text-[14px] text-gray-600 leading-relaxed mb-8 max-w-3xl">
            Every rejected claim means delayed payment, increased admin burden, and cash flow pressure. For a practice processing 500 claims per month, that is R60,000-R80,000 in revenue sitting in limbo — every month.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Missing External Cause Codes", desc: "SA mandates V/W/X/Y codes for all injury claims. This is the #1 rejection reason — practitioners remove them to simplify coding.", pct: "35%", color: "#EF4444" },
            { title: "Insufficient Code Specificity", desc: "Using E11 instead of E11.9. Schemes require maximum specificity — 3-character codes are rejected when 4th/5th characters exist.", pct: "25%", color: "#F59E0B" },
            { title: "Gender & Age Mismatches", desc: "Prostate codes on female patients. Pregnancy codes on males. Perinatal codes on adults. Often just data entry errors.", pct: "15%", color: "#8B5CF6" },
          ].map((item, i) => (
            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</span>
                <span className="text-[10px] font-medium text-gray-400">of rejections</span>
              </div>
              <h3 className="text-[14px] font-semibold text-[#1D3443] mb-2">{item.title}</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">How It Works</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Three steps to zero rejections</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: FileText, title: "Upload", desc: "Upload your claims CSV or Healthbridge EDI export. Auto-detects format, maps columns, and parses data. Supports standard CSV, TSV, and Healthbridge switching format.", color: "#3DA9D1" },
              { step: "02", icon: Shield, title: "Analyze", desc: "13 core ICD-10 rules + 276 tariff codes + 7 scheme profiles + AI suggestions. Checks gender, age, specificity, external causes, unbundling, discipline, PMB eligibility, and more.", color: "#E3964C" },
              { step: "03", icon: Zap, title: "Fix & Learn", desc: "Auto-corrects high-confidence issues. Downloads corrected CSV. Saves results for trend tracking. Pattern learning gets smarter with every analysis.", color: "#10B981" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.15 }} className="relative">
                <div className="text-[48px] font-black text-gray-100 leading-none mb-4">{item.step}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="text-[16px] font-bold text-[#1D3443] mb-2">{item.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-16 -right-5 w-5 h-5 text-gray-200" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINANCIAL IMPACT CALCULATOR ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#E3964C] tracking-wide uppercase">Financial Impact</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Calculate your savings</h2>
          </motion.div>

          <motion.div {...fadeIn} className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Claims per month</label>
                <input type="range" min={100} max={2000} step={50} value={claimsPerMonth}
                  onChange={e => setClaimsPerMonth(Number(e.target.value))}
                  className="w-full accent-[#3DA9D1]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">{claimsPerMonth.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Average claim value (R)</label>
                <input type="range" min={200} max={2000} step={50} value={avgClaimValue}
                  onChange={e => setAvgClaimValue(Number(e.target.value))}
                  className="w-full accent-[#E3964C]" />
                <div className="text-[20px] font-bold text-[#1D3443] mt-1">R{avgClaimValue.toLocaleString()}</div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-500 mb-2 block">Current rejection rate (%)</label>
                <input type="range" min={5} max={35} step={1} value={rejectionRate}
                  onChange={e => setRejectionRate(Number(e.target.value))}
                  className="w-full accent-[#EF4444]" />
                <div className="text-[20px] font-bold text-[#EF4444] mt-1">{rejectionRate}%</div>
              </div>
            </div>

            <div className="h-px bg-gray-100 mb-8" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ResultCard label="Monthly revenue at risk" value={`R${monthlyAtRisk.toLocaleString()}`} color="#EF4444" />
              <ResultCard label="Monthly recovery (85%)" value={`R${monthlyRecovery.toLocaleString()}`} color="#10B981" />
              <ResultCard label="Annual savings" value={`R${annualSavings.toLocaleString()}`} color="#3DA9D1" />
              <ResultCard label="88 clinics / year" value={`R${(networkAnnual / 1000000).toFixed(1)}M`} color="#E3964C" large />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALIDATION LAYERS ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">Validation Engine</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Three layers of protection</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Layer 1: ICD-10 Core", icon: Shield, color: "#3DA9D1", rules: ["Code format & existence", "Specificity requirements", "Asterisk/dagger conventions", "External cause codes (SA mandatory)", "Gender & age validation", "PMB eligibility", "Duplicate detection"] },
              { title: "Layer 2: Tariff Cross-Validation", icon: Target, color: "#E3964C", rules: ["276 NHRPL tariff codes", "40 unbundling rules", "29 discipline restrictions", "Diagnosis-procedure matching", "Max units per day", "Pre-authorisation flags", "Amount validation"] },
              { title: "Layer 3: Scheme Rules", icon: Building2, color: "#10B981", rules: ["Discovery Health rules", "GEMS rules", "Bonitas, Medshield, Momentum, Bestmed", "Submission window (120 days)", "CDL chronic authorization", "Consultation limits", "Follow-up bundling"] },
            ].map((layer, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${layer.color}10` }}>
                    <layer.icon className="w-4 h-4" style={{ color: layer.color }} />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#1D3443]">{layer.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {layer.rules.map((rule, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px] text-gray-600">
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: layer.color }} />
                      {rule}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI FEATURES ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#8B5CF6] tracking-wide uppercase">AI Intelligence</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Gets smarter with every analysis</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Brain, title: "AI Code Suggestions", desc: "Our fine-tuned medical coding models analyze flagged codes and suggest the correct ICD-10-ZA code with confidence levels and reasons. Dual-provider architecture ensures 99.9% availability.", color: "#8B5CF6" },
              { icon: Zap, title: "Auto-Correction", desc: "High-confidence deterministic fixes applied automatically: non-specific codes get .9 appended, missing ECCs get X59 added, format typos (J069 → J06.9) are corrected. Medium-confidence fixes flagged for review.", color: "#10B981" },
              { icon: TrendingDown, title: "Pattern Learning", desc: "Analyzes saved rejection history to identify recurring patterns. Predicts rejection probability for any code based on scheme + historical data. Gets more accurate with every analysis.", color: "#3DA9D1" },
              { icon: BarChart3, title: "Practice Insights", desc: "Compares your rejection rate to the network average. Identifies your worst-performing schemes and most common coding errors. Generates actionable recommendations with Rand impact estimates.", color: "#E3964C" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}10` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1D3443] mb-1">{item.title}</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ARCHITECTURE ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#3DA9D1] tracking-wide uppercase">Architecture</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">Enterprise-grade infrastructure</h2>
          </motion.div>

          <motion.div {...fadeIn} className="bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] rounded-2xl p-8 text-white">
            <div className="space-y-4">
              {[
                { layer: "Dashboard Layer", color: "#3DA9D1", items: "Claims Analyzer  |  Network Dashboard  |  POPIA Consent Gate" },
                { layer: "API Layer (10 endpoints)", color: "#E3964C", items: "Validate  |  AutoCorrect  |  Search  |  Suggest  |  Report  |  History  |  Network  |  Patterns  |  Rules  |  Retention" },
                { layer: "Engine Layer (13 libraries)", color: "#10B981", items: "ICD-10 DB  |  Tariff DB  |  NAPPI DB  |  Scheme Rules  |  Validation Engine  |  Auto-Correct  |  Pattern Learning  |  AI Suggest  |  PDF Report  |  CSV Export  |  Healthbridge Parser  |  Auth Guard  |  Types" },
                { layer: "Database + Security", color: "#8B5CF6", items: "ClaimsAnalysis  |  ClaimsRule  |  JWT Auth  |  Rate Limiting  |  PII Sanitization  |  CRON Retention" },
              ].map((l, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-[13px] font-bold">{l.layer}</span>
                  </div>
                  <div className="ml-6 px-4 py-3 bg-white/[0.06] rounded-lg text-[11px] text-white/50 font-mono">
                    {l.items}
                  </div>
                  {i < 3 && (
                    <div className="ml-7 w-px h-4 bg-white/10" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Files", value: "26" },
                { label: "Lines of Code", value: "~10,000" },
                { label: "API Routes", value: "10" },
                { label: "Validation Rules", value: "50+" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-[20px] font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-10">
            <span className="text-[10px] font-semibold text-[#10B981] tracking-wide uppercase">Security & Compliance</span>
            <h2 className="text-2xl font-bold text-[#1D3443] mt-2">POPIA compliant from day one</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Lock, label: "JWT Authentication", desc: "Every API route" },
              { icon: Shield, label: "Middleware Protection", desc: "/api/claims/* guarded" },
              { icon: Users, label: "Role-Based Access", desc: "Admin, receptionist, platform_admin" },
              { icon: Clock, label: "Rate Limiting", desc: "10-60 req/min per endpoint" },
              { icon: Eye, label: "PII Anonymization", desc: "Names → initials before storage" },
              { icon: Heart, label: "POPIA Consent", desc: "Checkbox required before upload" },
              { icon: Database, label: "12-Month Retention", desc: "Auto-delete cron monthly" },
              { icon: FileText, label: "Audit Trail", desc: "userId on every analysis" },
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

      {/* ═══ VISIOCORP INNOVATION ═══ */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1D3443] via-[#1D3443] to-[#2a4a5e] text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E3964C]/20 rounded-full mb-4">
              <Award className="w-3.5 h-3.5 text-[#E3964C]" />
              <span className="text-[10px] font-semibold text-[#E3964C] tracking-wide">VISIOCORP INNOVATION</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Building intelligence for African healthcare
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-[14px] leading-relaxed">
              The Claims Intelligence Engine represents a breakthrough in South African healthcare technology.
              Built by Visio Research Labs, it is the first SA-built pre-submission validator with AI-powered
              coding assistance and scheme-specific rule intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { title: "First of its kind in SA", desc: "No existing SA tool validates claims against ICD-10-ZA specificity rules, external cause code requirements, AND scheme-specific rules in a single pass. International tools (Optum, Waystar) use ICD-10-CM — the US variant — and don't know Discovery's KeyCare GP referral rules or GEMS' 28-day chronic supply limit.", icon: Globe },
              { title: "AI that understands SA coding", desc: "The AI suggestion engine is prompted with SA medical coding expertise: ICD-10-ZA conventions, NHRPL tariff codes, CMS guidelines, PMB conditions, and dagger/asterisk rules. It doesn't just suggest any code — it suggests the right SA code with scheme-specific considerations.", icon: Brain },
              { title: "Pattern learning moat", desc: "Every analysis makes the system smarter. After 6 months of 88 Netcare clinics feeding real rejection data, the pattern engine will have a proprietary dataset no competitor can replicate. This is the real defensible advantage.", icon: Sparkles },
              { title: "Healthbridge native", desc: "Auto-detects and parses Healthbridge claims switch EDI format. No CSV export needed — practices can validate directly from their existing workflow. 50+ BHF provider type codes mapped to discipline names for accurate cross-validation.", icon: Cpu },
            ].map((item, i) => (
              <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-6 border border-white/[0.08]">
                <item.icon className="w-6 h-6 text-[#E3964C] mb-3" />
                <h3 className="text-[15px] font-bold mb-2">{item.title}</h3>
                <p className="text-[12px] text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="text-center">
            <div className="inline-flex items-center gap-6 text-[11px] text-white/70">
              <span>Visio Research Labs</span>
              <span className="text-white/70">|</span>
              <span>VisioCorp</span>
              <span className="text-white/70">|</span>
              <span>Hampton Group Associates</span>
              <span className="text-white/70">|</span>
              <span>Netcare Primary Healthcare</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-[#1D3443] mb-3">Ready to eliminate claim rejections?</h2>
          <p className="text-[13px] text-gray-500 mb-6">
            Access the Claims Intelligence Engine from your Netcare Health OS dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard/claims"
              className="px-6 py-2.5 bg-[#1D3443] text-white rounded-xl text-[13px] font-medium hover:bg-[#2a4a5e] transition-colors flex items-center gap-2">
              Open Claims Analyzer <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="/research/claims-intelligence-whitepaper.md" download
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[13px] font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Whitepaper
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-6 px-6 bg-[#1D3443] text-center">
        <div className="text-[10px] text-white/70">
          Claims Intelligence Engine v1.0.0 | Built by Visio Research Labs | Designed for Netcare Primary Healthcare
        </div>
        <div className="text-[9px] text-white/70 mt-1">
          Copyright 2026 VisioCorp (Pty) Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ResultCard({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div className={`p-4 rounded-xl ${large ? "bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] text-white" : "bg-gray-50"}`}>
      <div className={`${large ? "text-2xl" : "text-xl"} font-bold`} style={large ? undefined : { color }}>{value}</div>
      <div className={`text-[11px] mt-1 ${large ? "text-white/50" : "text-gray-500"}`}>{label}</div>
    </div>
  );
}
