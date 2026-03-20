"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, ChevronRight, Volume2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

const TOUR_SLIDES = [
  {
    id: "welcome",
    label: "Welcome",
    narration: "Welcome to Netcare Health OS. I am Jess, your AI operations guide. What you are about to see is a platform designed specifically for Netcare Primary Healthcare — built by Visio Research Labs, an AI research company based in Johannesburg. Let me walk you through what we have built and why it matters for your division.",
    content: {
      title: "Visio Research Labs",
      subtitle: "AI Research \u2022 Healthcare Focus \u2022 African Native",
      points: [
        "An AI research lab in the tradition of Anthropic, OpenAI, and DeepMind",
        "Focused on making advanced machine learning accessible for African healthcare",
        "120+ peer-reviewed citations backing every module we build",
        "We used this same AI to research Netcare, read your annual reports, and build this platform",
      ],
    },
  },
  {
    id: "problem",
    label: "The Problem",
    narration: "Your division generates R662 million in revenue across 88 clinics with 568 independent practitioners. But there are gaps. Doctors work in two systems that do not talk to each other. Claims rejection runs at 15 to 25 percent. Patient communication falls through cracks between facilities. And Discovery Flexicare grew 77 percent last year, deliberately excluding Medicross. These are the problems we solve.",
    content: {
      title: "The Gaps We Found",
      subtitle: "Verified against your FY2025 annual report",
      points: [
        "R662M revenue, 24.5% EBITDA margin \u2014 but 7% revenue decline",
        "Doctors work in CareOn AND their own PMS with zero integration",
        "15-25% first-pass claims rejection rate across the network",
        "Discovery Flexicare grew 77% and deliberately excludes Medicross",
        "568 independent practitioners with no performance visibility",
        "No WhatsApp integration \u2014 the channel 95% of your patients use daily",
      ],
    },
  },
  {
    id: "solution",
    label: "Our Solution",
    narration: "We built 5 AI agents that run autonomously across your facilities. A triage agent that handles patient intake via WhatsApp. A scheduling agent that manages 568 practitioner calendars. A billing agent that pre-validates every claim before it hits Altron SwitchOn \u2014 catching 75 percent of rejectable claims. A follow-up agent that ensures no patient falls through the cracks. And a compliance agent that automates POPIA across all 88 clinics in 8 provinces.",
    content: {
      title: "5 AI Agents for Netcare",
      subtitle: "Running autonomously across all facilities",
      points: [
        "Triage Agent \u2014 WhatsApp-based patient routing to nearest Medicross",
        "Scheduling Agent \u2014 568 practitioner calendars, no-show prediction",
        "Billing Agent \u2014 ICD-10-ZA + NAPPI pre-validation before SwitchOn",
        "Follow-up Agent \u2014 post-visit check-ins, recall, medication reminders",
        "Compliance Agent \u2014 POPIA consent tracking across 8 provinces",
      ],
    },
  },
  {
    id: "integration",
    label: "Integration",
    narration: "We do not replace anything in your stack. CareOn stays. SAP stays. SwitchOn stays. We sit as an aggregation layer on top, connecting what is already there. We bridge the gap between CareOn and the doctor's PMS. We add AI pre-validation before claims hit the switch. We add WhatsApp as a parallel channel to the Netcare App. Nothing breaks. Everything gets connected.",
    content: {
      title: "We Aggregate. We Do Not Replace.",
      subtitle: "Connecting your existing 8 systems",
      points: [
        "CareOn EMR (49 hospitals) \u2014 we extend to primary care",
        "HEAL / A2D24 (55 clinics) \u2014 we bridge to CareOn",
        "SAP Healthcare (R100M ERP) \u2014 we add AI analytics on top",
        "Altron SwitchOn (claims) \u2014 we pre-validate before submission",
        "IBM Micromedex (drug safety) \u2014 we surface in booking flow",
        "Netcare App \u2014 we add WhatsApp as parallel channel",
      ],
    },
  },
  {
    id: "impact",
    label: "Impact",
    narration: "The total addressable savings across your division is R95 million per year. Claims recovery alone is R21.6 million. Debtor days drop from 42 to 28 \u2014 freeing R14 million in cash flow. The eRA reconciliation that 568 practitioners do manually in Excel? Automated. Saving R10 million a year in labour. And POPIA compliance across 88 clinics? Automated. Every number is modelled on your actual FY2025 data.",
    content: {
      title: "R95M+ Annual Savings",
      subtitle: "Modelled on Netcare FY2025 audited results",
      points: [
        "Claims pre-validation: R21.6M/year recovered",
        "Debtor intelligence: R33M/year improved collections",
        "Pharmacy optimisation: R16.8M/year freed capital",
        "eRA reconciliation: R10.1M/year in labour savings",
        "Capitation analytics: R7.9M/year early overspend detection",
        "Compliance automation: R5.8M/year across 88 clinics",
      ],
    },
  },
  {
    id: "partnership",
    label: "Partnership",
    narration: "We are not here to sell you software. We are here to partner with you. We deploy the tools at no cost. You cover the data hosting and compute. We provide ongoing best practices, new features, and monthly cost infrastructure audits on a reasonable retainer. We have worked with doctors who professionally consulted on these products. And you can make requests too \u2014 we can safely implement anything your teams need. The goal? Netcare becomes our flagship partner in making AI accessible for African healthcare.",
    content: {
      title: "A Partnership, Not a Vendor",
      subtitle: "Visio Research Labs x Netcare",
      points: [
        "Phase 1: We deploy tools free. You cover hosting and compute.",
        "Phase 2: Ongoing retainer \u2014 your AI partner, monthly audits, new features",
        "Phase 3: Scale together \u2014 co-publish research, joint ventures",
        "Doctor-consulted development \u2014 you can make requests",
        "Reasonable pricing for tools, research, and insights shared openly",
        "We chose Netcare because your scale + our AI = national impact",
      ],
    },
  },
  {
    id: "next",
    label: "Next Steps",
    narration: "Here is what I recommend. Start with an 8-week pilot in one region. Pick Gauteng North \u2014 5 clinics. We connect to your systems in 48 hours. AI claims validation, WhatsApp routing, and financial dashboards go live immediately. At week 8, you get a board-ready ROI report. Zero capital risk. That report becomes your business case for network-wide rollout. The platform you are about to explore has everything you need to evaluate this. I will be here to answer any questions.",
    content: {
      title: "Start in 8 Weeks",
      subtitle: "Zero capital risk. Board-ready results.",
      points: [
        "Choose a region (Gauteng North recommended \u2014 5 clinics)",
        "We connect to your systems in 48 hours",
        "6 weeks of live AI operations with weekly reports",
        "Board-ready ROI report at week 8",
        "Network-wide rollout plan if pilot succeeds",
        "Cancel anytime \u2014 no commitment beyond pilot",
      ],
    },
  },
];

export default function GuidedTour({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  const slide = TOUR_SLIDES[currentSlide];
  const isLast = currentSlide === TOUR_SLIDES.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  }, [isLast, onComplete]);

  const skip = () => {
    onComplete();
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-[#060d15]/98 backdrop-blur-xl flex"
    >
      {/* Left: Content */}
      <div className="flex-1 flex items-center justify-center p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            {/* Slide indicator */}
            <div className="flex items-center gap-1.5 mb-8">
              {TOUR_SLIDES.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === currentSlide ? "w-8 bg-[#3DA9D1]" : i < currentSlide ? "w-4 bg-[#3DA9D1]/40" : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">{slide.content.subtitle}</span>
            <h2 className="text-3xl font-light text-white mt-3 mb-6 leading-tight">{slide.content.title}</h2>

            <div className="space-y-3">
              {slide.content.points.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] mt-2 shrink-0" />
                  <span className="text-[14px] text-white/50 leading-relaxed">{point}</span>
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={next}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3DA9D1] text-white font-semibold text-[14px] hover:bg-[#3DA9D1]/90 transition-colors"
              >
                {isLast ? "Enter Platform" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={skip} className="text-[12px] text-white/20 hover:text-white/40 transition-colors">
                Skip tour
              </button>
            </div>

            {/* Slide label */}
            <div className="mt-8 text-[11px] text-white/15">
              {currentSlide + 1} of {TOUR_SLIDES.length} \u2022 {slide.label}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right: Phone call UI */}
      <div className="w-[380px] flex flex-col items-center justify-center border-l border-white/[0.04] bg-white/[0.02]">
        {/* Call status */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          {/* Avatar */}
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3DA9D1]/20 to-[#E3964C]/10 border border-white/[0.06] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#3DA9D1]" />
            </div>
            {/* Pulse rings */}
            {isCallActive && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#3DA9D1]/20"
                  animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#3DA9D1]/10"
                  animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </div>

          <h3 className="text-white font-semibold text-[16px]">Jess</h3>
          <p className="text-white/30 text-[12px] mt-1">AI Operations Guide</p>
          <p className="text-[#3DA9D1] text-[11px] mt-1 font-medium">
            {isCallActive ? "Speaking..." : "Call ended"}
          </p>

          {/* Audio visualizer bars */}
          {isCallActive && (
            <div className="flex items-center justify-center gap-1 mt-6 h-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-[#3DA9D1]"
                  animate={{
                    height: [4, 8 + Math.random() * 20, 4],
                  }}
                  transition={{
                    duration: 0.4 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}

          {/* Narration text */}
          <div className="mt-6 px-6 max-h-[200px] overflow-y-auto">
            <p className="text-[12px] text-white/25 leading-relaxed italic">
              &ldquo;{slide.narration.slice(0, 150)}...&rdquo;
            </p>
          </div>

          {/* Call controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/60 transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={skip}
              className="w-14 h-14 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[10px] text-white/10 mt-6">Powered by ElevenLabs \u2022 Claire (SA)</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
