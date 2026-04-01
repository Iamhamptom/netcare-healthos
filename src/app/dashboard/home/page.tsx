"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Shield, Brain, Heart, BarChart3, MessageSquare,
  Building2, FileText, Users, Calendar, Receipt, Network,
  ArrowRight, X, CheckCircle2, Zap, Activity, Lock,
  Globe, Stethoscope, Bot, Layers, BookOpen, Target,
  Router, RefreshCcw, Eye, Pill
} from "lucide-react";

interface Tool {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof Mic;
  color: string;
  href: string;
  description: string;
  features: string[];
  stats?: { label: string; value: string }[];
}

const TOOLS: Tool[] = [
  {
    id: "scribe",
    name: "AI Medical Scribe",
    subtitle: "Record. Transcribe. Code.",
    icon: Mic,
    color: "#3DA9D1",
    href: "/dashboard/scribe",
    description: "Start a consultation and the AI records everything. Live transcription builds SOAP notes in real-time. ICD-10 codes suggested as you speak. Review, approve, and it's saved to the patient record with a claim draft ready.",
    features: ["Ambient recording", "Live SOAP notes", "ICD-10 auto-coding", "Doctor approval flow", "Saves to patient record"],
    stats: [{ label: "Time saved", value: "15 min/consult" }, { label: "Accuracy", value: "95%+" }],
  },
  {
    id: "claims",
    name: "Claims Intelligence",
    subtitle: "Validate. Fix. Submit.",
    icon: Shield,
    color: "#10B981",
    href: "/dashboard/claims",
    description: "Upload a CSV of claims. 13 validation rules check every line in under 2 seconds. Auto-fix suggestions for coding errors. Human approves, then EDIFACT is generated and routed to the correct switch. R54.2M recoverable across 88 clinics.",
    features: ["13-rule validation", "6 scheme profiles", "Auto-fix suggestions", "PMB/CDL detection", "EDIFACT generation", "Multi-switch routing"],
    stats: [{ label: "Recoverable", value: "R54.2M/yr" }, { label: "False positive", value: "<2%" }],
  },
  {
    id: "coding",
    name: "VisiCode AI Coder",
    subtitle: "Notes to codes. Instantly.",
    icon: Brain,
    color: "#8B5CF6",
    href: "/dashboard/healthbridge/ai-coder",
    description: "Paste clinical notes and get ICD-10-ZA codes at maximum specificity. Not E11.9 — E11.40 (diabetes with neuropathy). PMB and CDL conditions flagged automatically. Motivation letters generated for medical aid funders.",
    features: ["41,009 ICD-10-ZA codes", "Max specificity coding", "PMB/CDL auto-detection", "Motivation letter generation", "6 scheme rule sets"],
    stats: [{ label: "Codes", value: "41K ICD-10" }, { label: "Medicines", value: "487K NAPPI" }],
  },
  {
    id: "engagement",
    name: "Patient Engagement",
    subtitle: "Follow up. Remind. Recall.",
    icon: Heart,
    color: "#EF4444",
    href: "/dashboard/engagement",
    description: "Automated patient journeys via WhatsApp and email. Medication reminders, chronic care check-ins, post-surgical follow-ups, screening recalls. The system identifies overdue patients and brings them back — automatically.",
    features: ["WhatsApp sequences", "Chronic care reminders", "Recall automation", "Campaign builder", "POPIA consent enforced"],
    stats: [{ label: "Channels", value: "WhatsApp + Email" }, { label: "Automation", value: "24/7" }],
  },
  {
    id: "flow",
    name: "Patient Flow AI",
    subtitle: "Predict. Schedule. Optimise.",
    icon: BarChart3,
    color: "#F59E0B",
    href: "/dashboard/checkin",
    description: "No-show prediction scores every booking. High-risk patients get extra reminders. Schedule optimization fills predicted gaps. Real-time flow board shows who's waiting, who's with the doctor, and where the bottlenecks are.",
    features: ["No-show prediction", "Smart scheduling", "Flow board (Kanban)", "Wait time tracking", "Doctor pattern analysis"],
    stats: [{ label: "Recovery", value: "R792K/yr per GP" }, { label: "Accuracy", value: "90%" }],
  },
  {
    id: "assistant",
    name: "AI Assistant",
    subtitle: "Ask anything. Do anything.",
    icon: MessageSquare,
    color: "#3DA9D1",
    href: "/dashboard/assistant",
    description: "Talk to it by voice or text. It knows your patients, your schedule, your claims. Pull up any tool, generate documents, check codes, run reports. Say 'start a consultation' and the scribe activates. Say 'pull up claims' and it navigates there.",
    features: ["Voice + text interface", "25+ tools", "Navigates the platform", "Thread memory", "Role-aware responses"],
    stats: [{ label: "Tools", value: "25+" }, { label: "Knowledge", value: "300MB" }],
  },
];

interface Mode {
  id: string;
  name: string;
  desc: string;
  icon: typeof Mic;
  color: string;
  href: string;
  description: string;
  features: string[];
}

const MODES: Mode[] = [
  { id: "doctor", name: "Doctor OS", desc: "Consultation to claim — end to end", icon: Stethoscope, color: "#8B5CF6", href: "/dashboard/scribe",
    description: "Drive into the hospital, see who's next, get a briefing. Say 'starting consultation' — the scribe activates, records everything, builds SOAP notes live, suggests ICD-10 codes. Approve by voice, and it generates referral letters, prescriptions, sick notes. The claim draft is ready before the patient leaves.",
    features: ["AI Medical Scribe (ambient recording)", "Live SOAP + ICD-10 coding", "VisiCode clinical coding (max specificity)", "Document generation (referrals, scripts, sick notes)", "Motivation letter auto-generation", "Patient record auto-save", "Claim draft creation", "CareOn Bridge data (hospital patients)"] },
  { id: "frontdesk", name: "Front Desk", desc: "Check-in to checkout — reception workflow", icon: Users, color: "#10B981", href: "/dashboard/front-desk",
    description: "Patients arrive, check in via the Kanban queue. See today's bookings auto-populated. Verify medical aid eligibility in real-time. WhatsApp confirmations sent automatically. Track wait times. When the doctor is ready, move the patient to 'with doctor'. After — trigger the engagement sequence.",
    features: ["Patient check-in (Kanban queue)", "Booking management + calendar", "Medical aid eligibility check", "WhatsApp confirmations + reminders", "Patient record lookup", "Wait time tracking", "Engagement sequence enrollment", "Recall management"] },
  { id: "billing", name: "Claims & Billing", desc: "Validate, fix, submit, reconcile", icon: Receipt, color: "#F59E0B", href: "/dashboard/claims",
    description: "Upload a CSV of claims — 13 rules validate every line in under 2 seconds. Auto-fix suggestions for coding errors. PMB/CDL detected automatically. Human approves, EDIFACT is generated, routed to the correct switch (Healthbridge/SwitchOn/MediKredit). eRA reconciliation matches payments. Rejections analyzed and auto-resubmitted.",
    features: ["13-rule claims validation", "6 scheme profiles (Discovery, GEMS, etc.)", "Auto-fix suggestions with reasoning", "PMB/CDL auto-detection", "EDIFACT generation", "Multi-switch routing + circuit breaker", "eRA reconciliation", "Rejection analysis + auto-resubmission", "Revenue recovery dashboard"] },
  { id: "practice", name: "Practice Manager", desc: "Daily operations — open to close", icon: Building2, color: "#3DA9D1", href: "/dashboard/modules/practice-manager",
    description: "Morning checklist to end-of-day close. Manage staff, practice branding, recall campaigns, patient engagement sequences, reviews, POPIA compliance, and audit logs. Everything a practice manager needs to run the clinic efficiently.",
    features: ["Morning + end-of-day checklists", "Team management", "Practice branding (white-label)", "Recall management + auto-send", "WhatsApp campaigns", "Engagement sequences", "Patient reviews", "POPIA compliance dashboard", "Audit log"] },
  { id: "executive", name: "Executive", desc: "Revenue, KPIs, compliance, board pack", icon: Target, color: "#EF4444", href: "/dashboard/executive",
    description: "R662M division revenue. R54.2M recoverable. Clinic-by-clinic P&L. 3-year ROI projection. Quarterly velocity matrix. Board-ready analytics. Financial director view with EBITDA impact model. CIO dashboard with R449M digital dividend story.",
    features: ["Executive dashboard (R54.2M story)", "Financial Director view (EBITDA model)", "CIO dashboard (digital dividend)", "Clinic performance comparison", "Revenue recovery tracking", "Board pack generator", "3-year transformation ROI"] },
  { id: "governance", name: "IT / Governance", desc: "Architecture, security, compliance, research", icon: Lock, color: "#64748B", href: "/dashboard/ai-governance",
    description: "Full technical architecture. 5-tier AI governance framework. 10 certifications (POPIA, HPCSA Booklet 20, King V, SAHPRA, CareConnect). Security headers, PII stripping, prompt injection detection. Integration map across 7 adapters. 25 research and compliance documents.",
    features: ["Architecture overview (tech stack, APIs, adapters)", "5-tier AI governance framework", "10 certifications + benchmarks", "SAHPRA classification (Not SaMD)", "POPIA health data compliance", "King V Principle 10 alignment", "Resources & research library (25 docs)", "Integration map (7 adapters)"] },
];

function useCurrentUser() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) setUser(d.user);
    }).catch(() => {});
  }, []);
  return user;
}

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const router = useRouter();
  const user = useCurrentUser();
  const tool = TOOLS.find(t => t.id === selected);
  const mode = MODES.find(m => m.id === selectedMode);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(61,169,209,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-[#3DA9D1]" />
            <h1 className="text-3xl font-black tracking-tight">Health OS</h1>
          </div>
          {user && (
            <p className="text-slate-400 text-sm">Welcome back, <span className="text-white font-semibold">{user.name}</span></p>
          )}
        </div>

        {/* Tool Grid — 3x2 */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                onClick={() => setSelected(t.id)}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-left transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `${t.color}15` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.subtitle}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Modes */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Staff Deployment Modes</h2>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.button key={i} onClick={() => setSelectedMode(m.id)} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] flex items-center gap-3 text-left transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}10`, color: m.color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-500">{m.desc}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Engines — Infrastructure Products */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Infrastructure Engines</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "CareOn Bridge", desc: "HL7v2 → FHIR R4 translation", href: "/dashboard/bridge", color: "#10B981", icon: Router },
              { name: "FHIR R4 Hub", desc: "12 resource types, CareConnect HIE", href: "/dashboard/fhir-hub", color: "#3DA9D1", icon: Globe },
              { name: "Switching Engine", desc: "EDIFACT, 3 switches, 30+ schemes", href: "/dashboard/switching", color: "#F59E0B", icon: Network },
              { name: "Claims AI Engine", desc: "20+ rules, PMB/CDL, auto-fix", href: "/dashboard/healthbridge", color: "#8B5CF6", icon: Shield },
              { name: "RL Engine", desc: "Self-improving — gets smarter daily", href: "/dashboard/agents", color: "#EF4444", icon: RefreshCcw },
              { name: "Engagement Engine", desc: "Sequences, campaigns, recall", href: "/dashboard/engagement", color: "#10B981", icon: Heart },
              { name: "Scribe Engine", desc: "Voice → SOAP → codes → record", href: "/dashboard/scribe", color: "#3DA9D1", icon: Mic },
              { name: "Knowledge Base", desc: "41K ICD-10, 487K NAPPI, 189K RAG", href: "/dashboard/claims-copilot", color: "#64748B", icon: BookOpen },
            ].map((e, i) => {
              const Icon = e.icon;
              return (
                <button key={i} onClick={() => router.push(e.href)}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 text-left transition-all flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${e.color}10`, color: e.color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{e.name}</div>
                    <div className="text-[9px] text-slate-500">{e.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Standalone Products */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Standalone Products</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "VisioCode", desc: "AI Clinical Coding Platform", url: "https://visiocode.vercel.app", color: "#8B5CF6" },
              { name: "Patient Flow AI", desc: "No-show prediction + scheduling", url: "https://patient-flow-ai.vercel.app", color: "#10B981" },
              { name: "Doctor OS", desc: "Doctor consultation workflow", url: "https://doctor-os.vercel.app", color: "#3DA9D1" },
            ].map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 text-left transition-all block group">
                <div className="text-sm font-bold text-white group-hover:text-[#3DA9D1] transition-colors">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                <div className="text-[9px] mt-2 font-mono truncate" style={{ color: p.color }}>{p.url.replace('https://', '')}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Enter Dashboard — BIG BUTTON */}
        <div className="flex justify-center mb-6">
          <button onClick={() => router.push("/dashboard")}
            className="px-8 py-3 rounded-xl bg-[#3DA9D1] hover:bg-[#3DA9D1]/80 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#3DA9D1]/20">
            <Layers className="w-5 h-5" /> Enter Full Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-3 text-[11px]">
          {[
            { label: "Resources & Research", href: "/dashboard/resources" },
            { label: "Product Map", href: "/dashboard/product-map" },
            { label: "Integration Map", href: "/dashboard/integration-map" },
            { label: "AI Governance", href: "/dashboard/ai-governance" },
            { label: "Pitch Deck", href: "/dashboard/pitch" },
          ].map((link, i) => (
            <button key={i} onClick={() => router.push(link.href)} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Detail Modal */}
      <AnimatePresence>
        {tool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{tool.name}</h2>
                  <p className="text-xs text-slate-400">{tool.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">{tool.description}</p>

              {tool.stats && (
                <div className="flex gap-3 mb-6">
                  {tool.stats.map((s, i) => (
                    <div key={i} className="flex-1 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                      <div className="text-lg font-black" style={{ color: tool.color }}>{s.value}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 mb-6">
                {tool.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: tool.color }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setSelected(null); router.push(tool.href); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ backgroundColor: tool.color }}
              >
                Open {tool.name} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mode Detail Modal */}
      <AnimatePresence>
        {mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setSelectedMode(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedMode(null)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${mode.color}15`, color: mode.color }}>
                  <mode.icon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{mode.name}</h2>
                  <p className="text-xs text-slate-400">{mode.desc}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">{mode.description}</p>

              <div className="space-y-2 mb-6">
                {mode.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: mode.color }} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setSelectedMode(null); router.push(mode.href); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ backgroundColor: mode.color }}
              >
                Open {mode.name} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
