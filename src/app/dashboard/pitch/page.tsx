"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight, ChevronLeft, Shield, Zap, Users, Server,
  Activity, Brain, FileText, CheckCircle2, Building2, Lock,
  Globe, Heart, Mic, Stethoscope, Pill, BarChart3, Target,
  ArrowRight, Layers, Network, Router, Calendar, MessageSquare,
  DollarSign, TrendingUp, Eye, AlertTriangle, RefreshCcw,
  Smartphone, Monitor, Headphones
} from "lucide-react";

// Detect who's logged in and highlight their role
function useCurrentUser() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) setUser(d.user);
    }).catch(() => {});
  }, []);
  return user;
}

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  phase?: string;
  content: React.ReactNode;
  highlightRoles?: string[]; // emails that should see "YOUR ROLE" badge
}

function Badge({ children, color = "#3DA9D1" }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}>
      {children}
    </span>
  );
}

function Step({ icon: Icon, title, detail, color = "#3DA9D1" }: { icon: typeof Zap; title: string; detail: string; color?: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${color}15`, color }}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{detail}</div>
      </div>
    </div>
  );
}

const SLIDES: Slide[] = [
  // === SLIDE 1: TITLE ===
  {
    id: "title",
    title: "Netcare Health OS",
    subtitle: "The AI Intelligence Layer for South African Healthcare",
    content: (
      <div className="flex flex-col items-center justify-center text-center py-12 space-y-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] flex items-center justify-center shadow-2xl">
          <Activity className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white tracking-tight">Health OS</h1>
          <p className="text-xl text-[#3DA9D1] font-bold">by Visio Research Labs</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Badge color="#10B981">POPIA Certified</Badge>
          <Badge color="#3DA9D1">FHIR R4 Ready</Badge>
          <Badge color="#8B5CF6">King V Compliant</Badge>
          <Badge color="#10B981">HPCSA Aligned</Badge>
          <Badge color="#F59E0B">First in SA</Badge>
        </div>
        <p className="text-sm text-slate-400 max-w-lg">We sit on top of CareOn, HEAL, Healthbridge, and SwitchOn. We replace nothing. We add the intelligence layer that connects them all.</p>
      </div>
    ),
  },

  // === SLIDE 2: SET UP ===
  {
    id: "setup",
    title: "Set Up Is Easy",
    phase: "PHASE 1",
    highlightRoles: ["muhammad_simjee@a2d24.com", "travis.dewing@netcare.co.za", "gurshen@netcare.co.za"],
    content: (
      <div className="space-y-4">
        <Step icon={Shield} title="Security review shared with your tech team" detail="Full compliance pack: POPIA health regs, SAHPRA classification, King V framework, HPCSA alignment, ISO 27001 roadmap. All documentation available in Resources." color="#10B981" />
        <Step icon={Lock} title="Multi-level approval" detail="Your AI committee approves the governance framework. Your CIO approves integration adapters. Your FD approves the investment model. Each level gets their own dashboard." color="#8B5CF6" />
        <Step icon={Globe} title="Connection link sent — one click to connect" detail="System connects to CareOn (HL7v2), HEAL (REST), Healthbridge (EDI), SwitchOn (EDIFACT). Zero changes to your existing systems. Passive listeners only." color="#3DA9D1" />
        <Step icon={Users} title="Auto-discovers your staff" detail="Finds your employees, doctors, billing clerks, reception staff. Maps roles automatically. Shares assignment plan: who needs which tools for what." color="#F59E0B" />
        <Step icon={Eye} title="Full backend shared with every department" detail="Finance tracks ROI. IT monitors integrations. Clinical reviews accuracy. Security audits everything. Real-time, role-based, transparent." color="#EF4444" />
      </div>
    ),
  },

  // === SLIDE 3: DEPLOY ===
  {
    id: "deploy",
    title: "Deploy",
    phase: "PHASE 2",
    highlightRoles: ["travis.dewing@netcare.co.za", "muhammad_simjee@a2d24.com"],
    content: (
      <div className="space-y-4">
        <Step icon={Zap} title="Deployed with your approval" detail="System goes live for approved staff members. Including leadership. Agents understand everyone's roles from day one." color="#3DA9D1" />
        <Step icon={FileText} title="Everyone gets onboarding" detail="Email with download link. Log in. Sync. Done. Our AI walks them through setup — no IT support needed." color="#10B981" />
        <Step icon={Network} title="Syncs with your existing systems" detail="CareOn, Microsoft 365, HEAL, Healthbridge — connects at the individual level. Every interaction tracked from the grass roots up." color="#8B5CF6" />
        <Step icon={Monitor} title="Available everywhere" detail="Web app, iPad, iOS, Android. Same experience. Same data. Same AI assistant. Works offline for core functions." color="#F59E0B" />
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-300 font-bold">Once synced — everyone is live. Zero downtime. Zero disruption to your current operations.</p>
        </div>
      </div>
    ),
  },

  // === SLIDE 4: WHAT THEY GET ===
  {
    id: "what-they-get",
    title: "What Everyone Gets",
    phase: "PHASE 3",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Step icon={Monitor} title="Health OS Dashboard" detail="Role-specific. Synced in real-time. KPIs, tasks, alerts — personalized to what you do." color="#3DA9D1" />
          <Step icon={Brain} title="AI Assistant" detail="Trained on SA healthcare data. 300MB knowledge base. 41K ICD-10 codes. 487K NAPPI records. 6 scheme profiles. Knows YOUR patients." color="#8B5CF6" />
          <Step icon={Headphones} title="Voice Interface" detail="Just talk to it. Speech-to-text. Text-to-speech. Works on iPad, phone, desktop. SA accent trained." color="#10B981" />
          <Step icon={Smartphone} title="Mobile App" detail="iPad for consultations. Phone for on-the-go. Everything synced. Push notifications for urgent items." color="#F59E0B" />
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <h4 className="text-sm font-bold text-white mb-2">The AI auto-updates based on your role:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div><span className="text-[#3DA9D1] font-bold">Doctor:</span> Patients, scribe, coding, referrals</div>
            <div><span className="text-[#3DA9D1] font-bold">Clerk:</span> Claims, validation, submissions</div>
            <div><span className="text-[#3DA9D1] font-bold">Reception:</span> Check-in, bookings, reminders</div>
            <div><span className="text-[#3DA9D1] font-bold">Leadership:</span> Revenue, KPIs, compliance</div>
          </div>
        </div>
        <p className="text-xs text-slate-500">It picks up where you left off. Makes suggestions. Your assistant moves files, creates docs, verifies information, sends, updates, automates. And you can just talk to it.</p>
      </div>
    ),
  },

  // === SLIDE 5: THE DOCTOR'S WORKFLOW ===
  {
    id: "doctor-workflow",
    title: "A Doctor's Day",
    phase: "PHASE 4",
    highlightRoles: ["cathelijn.zeijlemaker@netcare.co.za", "drrahul.gathiram@medicross.co.za"],
    content: (
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 text-xs text-[#3DA9D1] font-bold">Doctor drives in. Opens app. Sees who&apos;s next. All their details. Gets a briefing. Says &quot;starting consultation.&quot; The AI knows what to do.</div>
        <Step icon={Mic} title="A) Starts recording" detail="Ambient listening. Captures everything. Calls CareOn data in real-time. No typing." color="#3DA9D1" />
        <Step icon={FileText} title="B) Transcribes live" detail="SOAP notes build in real-time. ICD-10 codes suggested as you speak. Red flags highlighted." color="#10B981" />
        <Step icon={CheckCircle2} title="C) Consultation ends" detail="Summary ready for review. Doctor can listen back or read. Edit anything." color="#8B5CF6" />
        <Step icon={Eye} title="D) Doctor reviews and approves" detail="By voice or click. Codes confirmed. Referral letters, prescriptions, sick notes generated instantly." color="#F59E0B" />
        <Step icon={Brain} title="E) AI clinical coding (VisiCode)" detail="Our fine-tuned models code to maximum ICD-10-ZA specificity. E11.40 not E11.9. PMB/CDL flagged. Motivation letters auto-generated." color="#EF4444" />
        <Step icon={ArrowRight} title="F) Sent to billing clerk" detail="Pre-coded, pre-validated. Clerk gets it ready to submit. AI assists every step." color="#3DA9D1" />
      </div>
    ),
  },

  // === SLIDE 6: THE CLAIMS CHAIN ===
  {
    id: "claims-chain",
    title: "The Full Claims Chain",
    subtitle: "Nobody else in SA connects all 13 steps",
    phase: "PHASE 4 (continued)",
    highlightRoles: ["thirushen.pillay@netcare.co.za", "matsie.mpshane@netcare.co.za", "sara.nayager@netcare.co.za"],
    content: (
      <div className="space-y-2">
        {[
          { step: "1", label: "Voice/Text Notes", tool: "AI Scribe", color: "#3DA9D1" },
          { step: "2", label: "AI SOAP Generation", tool: "VRL Fine-tuned Model", color: "#3DA9D1" },
          { step: "3", label: "ICD-10 Clinical Coding", tool: "VisiCode Engine", color: "#10B981" },
          { step: "4", label: "Save to Patient Record", tool: "Auto-persist", color: "#10B981" },
          { step: "5", label: "Claims Validation", tool: "13-Rule Engine + AI", color: "#8B5CF6" },
          { step: "6", label: "Auto-Fix Suggestions", tool: "AI Coder", color: "#8B5CF6" },
          { step: "7", label: "Human Approval", tool: "Clerk reviews", color: "#F59E0B" },
          { step: "8", label: "EDIFACT Generation", tool: "Switching Engine", color: "#F59E0B" },
          { step: "9", label: "Switch Submission", tool: "Healthbridge / SwitchOn / MediKredit", color: "#EF4444" },
          { step: "10", label: "eRA Reconciliation", tool: "Auto-match", color: "#EF4444" },
          { step: "11", label: "Rejection Analysis", tool: "Pattern Engine", color: "#7C3AED" },
          { step: "12", label: "Auto-Resubmission", tool: "Smart retry", color: "#7C3AED" },
          { step: "13", label: "Revenue Recovery Report", tool: "Leadership Dashboard", color: "#10B981" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ backgroundColor: `${s.color}20`, color: s.color }}>{s.step}</div>
            <div className="flex-1 text-sm font-bold text-white">{s.label}</div>
            <div className="text-[10px] font-bold text-slate-500">{s.tool}</div>
          </div>
        ))}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-bold mt-2">
          Nora AI stops at step 2. Healthbridge stops at step 9. We run all 13. And it repeats for every patient, every day.
        </div>
      </div>
    ),
  },

  // === SLIDE 7: PATIENT ENGAGEMENT ===
  {
    id: "engagement",
    title: "Patient Engagement",
    subtitle: "Automated follow-ups, reminders, and recall",
    phase: "ADMIN SIDE",
    highlightRoles: ["cathelijn.zeijlemaker@netcare.co.za", "sara.nayager@netcare.co.za"],
    content: (
      <div className="space-y-4">
        <Step icon={MessageSquare} title="WhatsApp integration" detail="Patients book, confirm, reschedule via WhatsApp. No app download needed. 95% of SA patients use WhatsApp." color="#10B981" />
        <Step icon={Calendar} title="Calendars synced" detail="Integrates with existing calendars. CareOn, Microsoft 365. No double-booking. Collision detection." color="#3DA9D1" />
        <Step icon={Heart} title="Automated follow-ups" detail="Day 1: prescription ready. Day 7: side effects check. Day 25: refill reminder. Monthly: chronic care. Annually: screening." color="#EF4444" />
        <Step icon={RefreshCcw} title="Recall engine" detail="System identifies patients overdue for care. Sends personalised reminders. Brings them back in. Tracks outcomes." color="#8B5CF6" />
        <Step icon={Users} title="Secure patient communication" detail="WhatsApp, email, and patient portal. All POPIA compliant. Patient receives their information on request." color="#F59E0B" />
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400">
          <span className="text-white font-bold">The great thing:</span> you do all this by just chatting to your agent. No training needed. Once set up is done, you&apos;re live.
        </div>
      </div>
    ),
  },

  // === SLIDE 8: LEADERSHIP VIEW ===
  {
    id: "leadership",
    title: "Leadership Intelligence",
    phase: "LEADERSHIP",
    highlightRoles: ["sara.nayager@netcare.co.za", "thirushen.pillay@netcare.co.za", "chris.mathew@netcare.co.za"],
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-3xl font-black text-[#3DA9D1]">R54.2M</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Recoverable Revenue</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-3xl font-black text-emerald-400">R449M</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">New Digital Dividend</div>
          </div>
        </div>
        <Step icon={BarChart3} title="Real-time clinic performance" detail="88 clinics. Revenue, rejection rates, recovery pipeline. Drill down to individual practitioners." color="#3DA9D1" />
        <Step icon={TrendingUp} title="Revenue recovery tracking" detail="See exactly how much AI is saving per clinic, per month, per scheme. Board-reportable." color="#10B981" />
        <Step icon={Target} title="Gap detection" detail="AI finds patterns humans miss. Which clinics have high rejection rates? Which codes get rejected most? Where is money leaking?" color="#EF4444" />
        <Step icon={RefreshCcw} title="Reinforcement learning" detail="System gets smarter every day. Every claim outcome feeds back. Scheme rules auto-update. Error patterns learned." color="#8B5CF6" />
      </div>
    ),
  },

  // === SLIDE 9: RESOURCES & SECURITY ===
  {
    id: "resources",
    title: "Resources & Security",
    phase: "DOCUMENTATION",
    highlightRoles: ["gurshen@netcare.co.za", "muhammad_simjee@a2d24.com", "travis.dewing@netcare.co.za"],
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-black text-emerald-400">25</div>
            <div className="text-[9px] font-bold text-emerald-300/60 uppercase tracking-wider">Documents</div>
          </div>
          <div className="p-3 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 text-center">
            <div className="text-2xl font-black text-[#3DA9D1]">15</div>
            <div className="text-[9px] font-bold text-[#3DA9D1]/60 uppercase tracking-wider">Benchmarks</div>
          </div>
          <div className="p-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-center">
            <div className="text-2xl font-black text-[#8B5CF6]">6</div>
            <div className="text-[9px] font-bold text-[#8B5CF6]/60 uppercase tracking-wider">Research Papers</div>
          </div>
        </div>
        <Step icon={Shield} title="Neuro-Funnelling Security Architecture" detail="PII stripped before any AI processing. 5-tier precedence: SA law is immutable. 37 hard-gate codes AI can never override. Every decision audited." color="#10B981" />
        <Step icon={Brain} title="Fine-tuned for SA healthcare" detail="300MB knowledge base. 41K ICD-10-ZA codes. 487K NAPPI records. 6 scheme profiles. Trained on real SA claims data. Zero hallucinations on coded data." color="#8B5CF6" />
        <Step icon={CheckCircle2} title="Benchmarks that matter" detail="95%+ accuracy vs 70% manual. <2% false positives. 60x faster than manual coding. 8x more ICD-10 codes than any general AI." color="#3DA9D1" />
        <Step icon={Lock} title="Human approval at every step" detail="We encourage staff to read and approve everything at every key step. Highly interactive. AI suggests, humans decide." color="#F59E0B" />
      </div>
    ),
  },

  // === SLIDE 10: THE ASK ===
  {
    id: "the-ask",
    title: "The Pilot",
    phase: "NEXT STEPS",
    content: (
      <div className="flex flex-col items-center justify-center text-center py-8 space-y-8">
        <div className="space-y-4">
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3DA9D1] to-emerald-400">3 Clinics. 4 Weeks.</div>
          <div className="text-3xl font-black text-white">Zero Cost. Zero Risk.</div>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-lg">
          <div className="text-center">
            <div className="text-2xl font-black text-[#3DA9D1]">Week 1</div>
            <div className="text-xs text-slate-400 mt-1">Shadow mode. We watch and report.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-400">Week 2-3</div>
            <div className="text-xs text-slate-400 mt-1">Active validation. Staff uses tools.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#8B5CF6]">Week 4</div>
            <div className="text-xs text-slate-400 mt-1">Results review. Go/no-go.</div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 max-w-lg text-sm text-slate-400">
          <p>We need three things from you:</p>
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
            <div className="p-2 rounded-lg bg-[#3DA9D1]/10 text-[#3DA9D1] font-bold text-center">3 pilot clinics</div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-center">Read-only API access</div>
            <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold text-center">1 champion per clinic</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 max-w-md">If the numbers don&apos;t speak for themselves after 4 weeks, we walk away. No commitment. No contract. No invoice.</p>
        <p className="text-lg text-white/40 italic mt-4">And we&apos;ll send you a Tony Duardo playlist whilst our AI does the work for you.</p>
      </div>
    ),
  },
];

export default function PitchPage() {
  const [current, setCurrent] = useState(0);
  const user = useCurrentUser();
  const slide = SLIDES[current];

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const isHighlighted = user && slide.highlightRoles?.includes(user.email);

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#3DA9D1]" />
          <span className="text-sm font-bold text-white">Health OS</span>
          {slide.phase && <Badge>{slide.phase}</Badge>}
        </div>
        <div className="flex items-center gap-4">
          {isHighlighted && (
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              YOUR ROLE IN THIS STEP
            </span>
          )}
          {user && <span className="text-xs text-slate-500">Viewing as: <span className="text-white font-bold">{user.name}</span></span>}
          <span className="text-xs text-slate-500 font-mono">{current + 1} / {SLIDES.length}</span>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col px-6 lg:px-16 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-3xl font-black text-white tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-sm text-slate-400 mt-1">{slide.subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto">{slide.content}</div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <button onClick={prev} disabled={current === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            current === 0 ? "text-slate-600 cursor-not-allowed" : "text-white bg-white/10 hover:bg-white/20"
          }`}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-[#3DA9D1] scale-125" : i < current ? "bg-emerald-500/50" : "bg-white/20"
              }`} />
          ))}
        </div>

        <button onClick={next} disabled={current === SLIDES.length - 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            current === SLIDES.length - 1 ? "text-slate-600 cursor-not-allowed" : "text-white bg-[#3DA9D1] hover:bg-[#3DA9D1]/80"
          }`}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
