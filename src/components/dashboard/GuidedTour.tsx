"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, ChevronRight, Volume2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBrand } from "@/lib/tenant-context";

function getTourSlides(brandName: string) {
  return [
    {
      id: "welcome",
      label: "Welcome",
      narration: `Welcome to ${brandName}. I am Jess, your AI operations guide. What you are about to see is a platform designed specifically for your practice — built by a specialist AI healthcare team based in Johannesburg. Let me walk you through what we have built and why it matters.`,
      content: {
        title: brandName,
        subtitle: "AI Healthcare Operations Platform",
        points: [
          "Purpose-built AI for South African private healthcare",
          "Focused on making advanced machine learning accessible for African healthcare",
          "120+ peer-reviewed citations backing every module we build",
          "We researched your practice, your market, and built this platform for you",
        ],
      },
    },
    {
      id: "problem",
      label: "The Problem",
      narration: "Private healthcare practices face operational gaps. Claims rejection runs at 15 to 25 percent. Patient communication falls through cracks between facilities. Manual processes drain time that could be spent with patients. These are the problems we solve.",
      content: {
        title: "The Gaps We Found",
        subtitle: "Common across SA private practices",
        points: [
          "15-25% first-pass claims rejection rate is the industry norm",
          "Practitioners work across systems with zero integration",
          "No WhatsApp integration \u2014 the channel 95% of patients use daily",
          "Manual eRA reconciliation wastes hours per week",
          "POPIA compliance is complex and underserved",
          "No unified view of practice performance across locations",
        ],
      },
    },
    {
      id: "solution",
      label: "Our Solution",
      narration: "We built 5 AI agents that run autonomously across your practice. A triage agent that handles patient intake via WhatsApp. A scheduling agent that manages your calendars. A billing agent that pre-validates every claim \u2014 catching 75 percent of rejectable claims. A follow-up agent that ensures no patient falls through the cracks. And a compliance agent that automates POPIA.",
      content: {
        title: "5 AI Agents for Your Practice",
        subtitle: "Running autonomously across all locations",
        points: [
          "Triage Agent \u2014 WhatsApp-based patient routing",
          "Scheduling Agent \u2014 calendar management, no-show prediction",
          "Billing Agent \u2014 ICD-10-ZA + NAPPI pre-validation",
          "Follow-up Agent \u2014 post-visit check-ins, recall, medication reminders",
          "Compliance Agent \u2014 POPIA consent tracking across all locations",
        ],
      },
    },
    {
      id: "integration",
      label: "Integration",
      narration: "We do not replace anything in your stack. Your EMR stays. Your billing system stays. We sit as an aggregation layer on top, connecting what is already there. We add AI pre-validation before claims hit the switch. We add WhatsApp as a patient channel. Nothing breaks. Everything gets connected.",
      content: {
        title: "We Aggregate. We Do Not Replace.",
        subtitle: "Connecting your existing systems",
        points: [
          "Your EMR \u2014 we extend with AI insights",
          "Your billing system \u2014 we pre-validate before submission",
          "Medical scheme switches \u2014 automated reconciliation",
          "Drug interaction databases \u2014 surfaced in booking flow",
          "WhatsApp \u2014 added as a parallel patient channel",
          "All existing workflows preserved and enhanced",
        ],
      },
    },
    {
      id: "impact",
      label: "Impact",
      narration: "The impact is measurable from day one. Claims recovery improves immediately. Debtor days drop significantly. Manual reconciliation becomes automated. And POPIA compliance is handled across all locations. Every number is modelled on real SA private practice data.",
      content: {
        title: "Measurable Impact",
        subtitle: "Modelled on real SA private practice data",
        points: [
          "Claims pre-validation: significant recovery improvement",
          "Debtor intelligence: improved collections and cash flow",
          "eRA reconciliation: automated, saving hours weekly",
          "Compliance automation: POPIA across all locations",
          "Patient retention: automated follow-up and recall",
          "Operational visibility: real-time practice analytics",
        ],
      },
    },
    {
      id: "partnership",
      label: "Partnership",
      narration: "We are not here to sell you software. We are here to partner with you. We deploy the tools. You cover the data hosting and compute. We provide ongoing best practices, new features, and monthly audits on a reasonable retainer. The goal? Your practice becomes a flagship partner in making AI accessible for African healthcare.",
      content: {
        title: "A Partnership, Not a Vendor",
        subtitle: `Your AI Healthcare Partner`,
        points: [
          "Phase 1: We deploy tools. You cover hosting and compute.",
          "Phase 2: Ongoing retainer \u2014 your AI partner, monthly audits, new features",
          "Phase 3: Scale together \u2014 co-publish research, joint ventures",
          "Doctor-consulted development \u2014 you can make requests",
          "Reasonable pricing for tools, research, and insights shared openly",
          "We partner with practices that want to lead with technology",
        ],
      },
    },
    {
      id: "next",
      label: "Next Steps",
      narration: "Here is what I recommend. Start with an 8-week pilot. We connect to your systems in 48 hours. AI claims validation, WhatsApp routing, and financial dashboards go live immediately. At week 8, you get a board-ready ROI report. Zero capital risk. The platform you are about to explore has everything you need to evaluate this. I will be here to answer any questions.",
      content: {
        title: "Start in 8 Weeks",
        subtitle: "Zero capital risk. Board-ready results.",
        points: [
          "We connect to your systems in 48 hours",
          "6 weeks of live AI operations with weekly reports",
          "Board-ready ROI report at week 8",
          "Full rollout plan if pilot succeeds",
          "Cancel anytime \u2014 no commitment beyond pilot",
          "Your patients benefit from day one",
        ],
      },
    },
  ];
}

export default function GuidedTour({ onComplete }: { onComplete: () => void }) {
  const brand = useBrand();
  const TOUR_SLIDES = getTourSlides(brand.name);
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
              <button onClick={skip} className="text-[12px] text-white/70 hover:text-white/60 transition-colors">
                Skip tour
              </button>
            </div>

            {/* Slide label */}
            <div className="mt-8 text-[11px] text-white/70">
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
          <p className="text-white/70 text-[12px] mt-1">AI Operations Guide</p>
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
            <p className="text-[12px] text-white/70 leading-relaxed italic">
              &ldquo;{slide.narration.slice(0, 150)}...&rdquo;
            </p>
          </div>

          {/* Call controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white/60 transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={skip}
              className="w-14 h-14 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[10px] text-white/70 mt-6">Health OS Voice AI \u2022 Claire (SA)</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
