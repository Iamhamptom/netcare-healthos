
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Sparkles, ArrowRight, ChevronRight, Volume2, VolumeX, Minimize2, Maximize2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import GuidedTour from "./GuidedTour";

// ─── Jess's Welcome Sequence (plays once on first login) ──────
const WELCOME_SEQUENCE = [
  {
    text: "Welcome to Netcare Health OS. I’m Jess, your AI operations guide — built specifically for the Netcare leadership team.",
    delay: 0,
  },
  {
    text: "VisioHealth OS was built to solve the operational gap in Netcare’s primary care division. CareOn powers the hospitals. Healthbridge and GoodX power individual clinics. Nothing connects the 88-clinic network — until now. What we’ve built takes that fragmented landscape and unifies it with AI.",
    delay: 500,
  },
  {
    text: "Let me show you what we found and what we’ve built for Netcare. And remember — at any time, press the AI Assistant button in the bottom-right corner to ask me anything directly.",
    delay: 500,
  },
];

const SAVINGS_BRIEFING = [
  { label: "Claims Intelligence", value: "R21.6M/year", detail: "Your current 15% first-pass rejection rate costs the division R3.85M/month. Our AI pre-validates ICD-10-ZA codes, NAPPI codes, and PMB benefits before claims hit Altron SwitchOn. We bring that to under 5%." },
  { label: "eRA Reconciliation", value: "R10.1M/year", detail: "568 practitioners doing manual Excel-based eRA matching. We automate electronic Remittance Advice reconciliation across every clinic — your Excel-to-Oracle moment, but for the whole division." },
  { label: "Debtor Recovery", value: "R33M/year", detail: "Debtor days at 42 (target: 35). GEMS averages 21-day payment, Medihelp 24 days. Automated WhatsApp follow-up sequences and scheme-specific collection strategies." },
  { label: "Capitation Analytics", value: "R7.9M/year", detail: "Prime Cure 254,000 capitated lives at R287 PMPM. You’re R1.1M over cap this month. Real-time monitoring flags overspend before it hits the P&L — critical after the lost occ health contract." },
  { label: "Compliance Automation", value: "R5.8M/year", detail: "POPIA s18-s72 consent tracking, HPCSA Booklet 10 alignment, CMS reporting — automated across all 88 clinics in 8 provinces. Zero audit findings." },
  { label: "Pharmacy Optimisation", value: "R16.8M/year", detail: "R1.4M/month freed working capital across 37 Clicks-operated pharmacies. NAPPI code sync with scheme formularies, dead stock elimination, CDL monitoring." },
];

const INTEGRATIONS = [
  { name: "CareOn EMR", status: "Extends", detail: "34,000 users across 26 hospitals. We extend this intelligence to your 88 primary care clinics — the gap CareOn doesn’t cover." },
  { name: "SAP for Healthcare", status: "Connects", detail: "R100M investment. Patient ADT, billing, procurement, materials management. We add an AI analytics layer on top." },
  { name: "Altron SwitchOn", status: "Pre-validates", detail: "Claims switching — we catch rejection-worthy claims BEFORE they hit the switch. 75% of rejections are preventable." },
  { name: "MediSwitch EDI", status: "Auto-reconciles", detail: "eRA processing — we match payments to claims automatically, replacing manual reconciliation." },
  { name: "IBM Watson Micromedex", status: "Surfaces", detail: "1.8M+ scripts/year drug interaction checking. We surface these alerts in the booking and dispensing flow." },
  { name: "Corsano Wearables", status: "Integrates", detail: "6,000 beds with continuous vitals monitoring. We bring wearable alerts into primary care follow-up workflows." },
  { name: "Netcare App", status: "Extends", detail: "iOS/Android/Huawei — booking, 911, pre-admission, health records. We add WhatsApp as a parallel channel where your patients already are." },
];

const MARKET_GAPS = [
  "No WhatsApp patient routing in SA private healthcare — we’re first",
  "No AI claims pre-validation for primary care networks — hospitals have it, clinics don’t",
  "No real-time financial command center across fragmented clinic PMS systems",
  "Discovery launching Flexicare through Clicks — direct threat to Medicross walk-in model. We give you the tech moat.",
  "4+ separate booking systems (Appointmed, Medicross Online, VirtualCare, phone) — we unify into one WhatsApp + web channel",
  "CareOn covers hospitals. Primary Care has no unified digital layer. We are that layer.",
];

const FUTURE_ROADMAP = [
  { name: "Placeo Health", timeline: "Q3 2026", detail: "Patient marketplace — 3.5M patients can discover and book across the Netcare network. Uber for healthcare appointments." },
  { name: "Visio Integrator", timeline: "Q4 2026", detail: "Enterprise middleware connecting CareOn, SAP, Healthbridge, GoodX into one data layer. The missing bridge." },
  { name: "Visio Waiting Room", timeline: "Q3 2026", detail: "Digital check-in via WhatsApp. Real-time queue visibility. Solve the queue problem at busy Medicross clinics." },
  { name: "VisioMed AI", timeline: "Q1 2027", detail: "Clinical co-pilot — drug interaction checking (augments Micromedex), ICD-10-ZA coding assistance, treatment protocol suggestions." },
  { name: "Payer Connect", timeline: "Q4 2026", detail: "Live coordination with medical schemes. Real-time benefit checking, pre-auth before the patient sits down. Turn 21-day GEMS cycles into 7-day." },
  { name: "Predictive Analytics Suite", timeline: "Q2 2027", detail: "Budget variance prediction 60 days out. Cash flow forecasting. Staff cost optimisation. The tools Mayo Clinic and Cleveland Clinic use." },
];

const PAGE_CONTEXTS: Record<string, string> = {
  "/dashboard": "This is your operational command center. The welcome banner shows your Netcare brand with network-wide impact metrics. Below are 10 stat cards pulling live data — patients, bookings, revenue, tasks. The quick actions give you one-click access to every critical function.",
  "/dashboard/network": "This is where you’ll spend most of your time. Five tabs: Overview gives you the divisional KPIs at a glance — R55.2M MTD revenue, 24.5% EBITDA margin, 5,234 first-pass rejections. Clinic Performance ranks all 88 sites. Claims Intelligence shows the top rejection codes with AI fixes. Cost Savings breaks down the R8.4M/month opportunity. Medical Schemes tracks Discovery, GEMS, Bonitas payment performance.",
  "/dashboard/kpi": "These are YOUR KPIs — the ones Keith Gibson asks about in the quarterly divisional pack. 30+ metrics across revenue, profitability, working capital, managed care, and occupational health. Traffic lights show what needs attention. The bottom section shows exactly how VisioHealth OS moves each KPI.",
  "/dashboard/savings": "This is the most powerful number in your career right now. R7.6M+ saved in 9 months. Every Rand is traceable to a specific AI module. The Before/After comparison is what you present to the board — from Excel hell to real-time intelligence.",
  "/dashboard/suite": "Everything VisioHealth OS built for Netcare — 10 AI modules, the full value chain integration map showing how we connect to CareOn, SAP, SwitchOn, and the Netcare App. Plus the branch deployment model — every doctor uses this under the Netcare umbrella.",
  "/dashboard/pilot": "Start here. Pick a region, select clinics, launch an 8-week pilot. Data is isolated to your region. At week 8, you get a board-ready ROI report. This is zero risk — the pilot report becomes your business case for Keith Gibson.",
  "/dashboard/board-pack": "Your weapon for the next Finance and Investment Committee. CEO Quick View for Dr Friedland (one slide: R100M+, 8 weeks, <5%, 88 clinics). Full 6-section business case for Keith Gibson. 3-year scenario modelling: Conservative R105M, Base R220M, Aggressive R295M.",
  "/dashboard/intel": "Bloomberg-style health intelligence terminal. Market data, health news, research papers, SA competitive landscape, and global benchmarks — HCA Healthcare, Epic Systems, Mayo Clinic, Cleveland Clinic, NHS England. This positions you as the most informed FD in SA healthcare.",
  "/dashboard/daily": "Your structured Financial Director daily workflow. Morning: claims review, revenue dashboard, Prime Cure reports. Midday: tariff reconciliation, ICD-10 analytics, occ health billing. End of day: collection ratios, EBITDA variance, POPIA compliance.",
  "/dashboard/patients": "Unified patient records across Medicross clinics. Discovery, GEMS, Bonitas, Momentum, Polmed, Anglo Medical — all with medical history, medications, allergies, and POPIA consent. A patient at Sandton can be referenced at Fourways.",
  "/dashboard/conversations": "The WhatsApp Patient Router in action. Patients message one number, AI routes to the right Medicross branch. This is the feature Netcare doesn’t have today — and Discovery Flexicare doesn’t offer either.",
  "/dashboard/billing": "Claims and billing with ICD-10-ZA codes, NAPPI codes, medical aid status. See exactly which claims were rejected, why, and the AI recommendation to fix. R1.8M/month recoverable.",
  "/dashboard/analytics": "Practice-level analytics — patient counts, booking patterns, service popularity, review scores, recall management. Data-driven operational insights.",
};

// ─── Typing Effect ──────
function useTypingEffect(text: string, speed: number = 20) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ─── NDA Popup ──────
function NDAPopup({ onAccept }: { onAccept: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog" aria-modal="true" aria-label="Confidentiality Agreement">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1D3443]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#1D3443]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Confidentiality Agreement</h2>
            <p className="text-[11px] text-gray-400">VisioHealth OS x Netcare Primary Healthcare</p>
          </div>
        </div>
        <div className="text-[12px] text-gray-600 leading-relaxed space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          <p>This platform contains <span className="font-semibold">proprietary technology and confidential intelligence</span> developed by VisioHealth OS (Visio Research Labs).</p>
          <p>By accessing, you agree to: keep all features, data, and technology confidential; not share with third parties; use solely for evaluating a Netcare-VisioHealth OS partnership.</p>
          <p className="text-[11px] text-gray-400">Governed by SA law. High Court of Gauteng, Johannesburg.</p>
        </div>
        <button onClick={onAccept} className="w-full mt-5 py-3 bg-[#1D3443] text-white font-semibold text-[13px] rounded-xl hover:bg-[#152736] transition-colors">
          I Agree — Enter Platform
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Jess Welcome Sequence ──────
function JessWelcome({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [showSavings, setShowSavings] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showGaps, setShowGaps] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const currentMsg = step < WELCOME_SEQUENCE.length ? WELCOME_SEQUENCE[step].text : "";
  const { displayed, done } = useTypingEffect(currentMsg, 18);

  const nextStep = () => {
    if (step < WELCOME_SEQUENCE.length - 1) {
      setStep(s => s + 1);
    } else if (!showSavings) {
      setShowSavings(true);
    } else if (!showIntegrations) {
      setShowIntegrations(true);
    } else if (!showGaps) {
      setShowGaps(true);
    } else if (!showFuture) {
      setShowFuture(true);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-[#0a1520]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
      role="dialog" aria-modal="true" aria-label="Feature Guide">
      <div className="max-w-3xl w-full py-8">
        {/* Jess Avatar */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3DA9D1] to-[#E3964C] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-[15px]">Jess</div>
            <div className="text-white/70 text-[11px]">Your AI Operations Guide • VisioHealth OS</div>
          </div>
        </motion.div>

        {/* Welcome Messages */}
        {step < WELCOME_SEQUENCE.length && !showSavings && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 mb-4">
            <p className="text-white/80 text-[15px] leading-relaxed">{displayed}<span className={done ? "hidden" : "animate-pulse"}>|</span></p>
          </motion.div>
        )}

        {/* Savings Briefing */}
        {showSavings && !showIntegrations && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-white/80 text-[15px] leading-relaxed mb-2">Here is what we can save Netcare Primary Healthcare. Total: <span className="text-[#E3964C] font-bold">R95.2M per year</span>.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAVINGS_BRIEFING.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/8 hover:bg-white/8 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 text-[12px] font-medium">{s.label}</span>
                    <span className="text-[#E3964C] text-[13px] font-bold">{s.value}</span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">{s.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Integrations */}
        {showIntegrations && !showGaps && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-white/80 text-[15px] leading-relaxed">We integrate with every system Netcare already uses. Nothing gets replaced — everything gets enhanced.</p>
            </div>
            <div className="space-y-2">
              {INTEGRATIONS.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/8">
                  <span className="text-[11px] font-bold text-[#3DA9D1] bg-[#3DA9D1]/10 px-2 py-0.5 rounded uppercase">{s.status}</span>
                  <span className="text-white/80 text-[13px] font-medium">{s.name}</span>
                  <span className="text-white/70 text-[11px] flex-1">{s.detail}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Market Gaps */}
        {showGaps && !showFuture && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-white/80 text-[15px] leading-relaxed">These are the gaps we found in the market that nobody is filling. This is your competitive moat.</p>
            </div>
            <div className="space-y-2">
              {MARKET_GAPS.map((gap, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/8">
                  <span className="text-[#E3964C] text-[11px] font-bold mt-0.5 shrink-0">{i + 1}</span>
                  <span className="text-white/60 text-[12px]">{gap}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Future Roadmap */}
        {showFuture && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <p className="text-white/80 text-[15px] leading-relaxed">And this is what we are building next for Netcare. Each product makes the ecosystem stronger.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FUTURE_ROADMAP.map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/8">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-[12px] font-semibold">{item.name}</span>
                    <span className="text-[#3DA9D1] text-[10px] font-bold">{item.timeline}</span>
                  </div>
                  <p className="text-white/70 text-[11px]">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Next Button */}
        <motion.button
          onClick={nextStep}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#3DA9D1] to-[#E3964C] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
         
        >
          {!showSavings ? "Show Me the Savings" : !showIntegrations ? "Show Integrations" : !showGaps ? "Show Market Gaps" : !showFuture ? "Show the Future" : "Enter the Platform"}
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Skip */}
        <button onClick={onComplete} className="w-full py-2 mt-2 text-white/70 text-[11px] hover:text-white/60 transition-colors">
          Skip intro
        </button>
      </div>
    </motion.div>
  );
}

// ─── Jess Contextual Bar (top notification, non-blocking) ─────
function JessBar({ context, onClose, onNavigate }: { context: string; onClose: () => void; onNavigate: (path: string) => void }) {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-[52px] left-[240px] right-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-black/[0.04]"
    >
      <div className="px-5 py-2.5 flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-gray-500 leading-relaxed truncate">{context.slice(0, 200)}{context.length > 200 ? "..." : ""}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { label: "Finance", path: "/dashboard/network" },
            { label: "KPIs", path: "/dashboard/kpi" },
            { label: "Savings", path: "/dashboard/savings" },
            { label: "Board", path: "/dashboard/board-pack" },
          ].map(nav => (
            <button key={nav.path} onClick={() => onNavigate(nav.path)}
              className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors font-medium">
              {nav.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1 text-gray-300 hover:text-gray-500 rounded transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────
export default function FeatureGuide() {
  const pathname = usePathname();
  const router = useRouter();
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [welcomeDone, setWelcomeDone] = useState(true);
  const [jessOpen, setJessOpen] = useState(true);
  const [dismissedPages, setDismissedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const accepted = localStorage.getItem("netcare-nda-accepted");
    const welcomed = localStorage.getItem("netcare-welcome-done");
    const jessPref = localStorage.getItem("netcare-jess-open");
    setNdaAccepted(accepted === "true");
    setWelcomeDone(welcomed === "true");
    if (jessPref === "false") setJessOpen(false);
  }, []);

  const handleAcceptNDA = () => {
    setNdaAccepted(true);
    localStorage.setItem("netcare-nda-accepted", "true");
  };

  const handleWelcomeComplete = () => {
    setWelcomeDone(true);
    localStorage.setItem("netcare-welcome-done", "true");
  };

  const handleDismissJess = () => {
    setDismissedPages(prev => new Set([...prev, pathname]));
  };

  const toggleJess = () => {
    const next = !jessOpen;
    setJessOpen(next);
    localStorage.setItem("netcare-jess-open", String(next));
  };

  const handleNavigate = (path: string) => {
    setDismissedPages(prev => { const n = new Set(prev); n.delete(path); return n; });
    router.push(path);
  };

  const showPanel = jessOpen && !dismissedPages.has(pathname) && PAGE_CONTEXTS[pathname] && ndaAccepted && welcomeDone;

  return (
    <>
      <AnimatePresence>
        {!ndaAccepted && <NDAPopup onAccept={handleAcceptNDA} />}
      </AnimatePresence>

      <AnimatePresence>
        {ndaAccepted && !welcomeDone && <GuidedTour onComplete={handleWelcomeComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPanel && PAGE_CONTEXTS[pathname] && (
          <JessBar context={PAGE_CONTEXTS[pathname]} onClose={handleDismissJess} onNavigate={handleNavigate} />
        )}
      </AnimatePresence>

      {ndaAccepted && welcomeDone && (
        <button onClick={toggleJess}
          className="fixed bottom-20 right-6 z-[9989] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-black/[0.04] text-[11px] font-medium text-[#1D3443]/50 hover:text-[#1D3443]/80 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all">
          <Sparkles className="w-3 h-3" />
          Jess {jessOpen ? "On" : "Off"}
        </button>
      )}
    </>
  );
}
