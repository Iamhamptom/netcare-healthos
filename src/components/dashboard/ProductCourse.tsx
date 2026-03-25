"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  X,
  ClipboardCheck,
  FileSearch,
  ArrowRightLeft,
  Network,
  TrendingDown,
  Rocket,
  Gift,
  FlaskConical,
  Database,
  Zap,
  Brain,
  Handshake,
} from "lucide-react";

/* ─────────────────────────────────────────────
   12-slide product course for Netcare presentation
   ───────────────────────────────────────────── */

interface SlideContent {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  tag: string;
  title: string;
  subtitle: string;
  points: string[];
  /** optional highlight stat shown large on right panel */
  stat?: { value: string; label: string };
  /** optional list of sub-items rendered beneath stat */
  details?: string[];
}

const COURSE_SLIDES: SlideContent[] = [
  /* ── 1. Intake ── */
  {
    id: "intake",
    label: "Patient Intake",
    icon: ClipboardCheck,
    iconColor: "#3DA9D1",
    tag: "Module 1 — Where It Starts",
    title: "AI-Powered Patient Intake",
    subtitle: "The front door to every claim. Get it right here, and everything downstream improves.",
    points: [
      "WhatsApp-first triage — 95% of SA patients use it daily",
      "Auto-collects medical aid details, ICD-10 pre-screening, referral letters",
      "Pre-validates member eligibility against scheme rules before the patient sits down",
      "Surfaces PMB entitlements — so doctors know what's covered before they treat",
      "Captures structured data from day one — no more handwritten forms",
    ],
    stat: { value: "30%", label: "of claim rejections start at intake — wrong details, missing data" },
  },

  /* ── 2. Claims Analyser ── */
  {
    id: "claims",
    label: "Claims Analyser",
    icon: FileSearch,
    iconColor: "#E3964C",
    tag: "Module 2 — The Breakthrough",
    title: "AI Claims Intelligence Engine",
    subtitle: "14 months of research. 41,000 ICD-10 codes. 9,985 medicine prices. Every rejection pattern mapped.",
    points: [
      "Pre-validates every claim against ICD-10-ZA, NAPPI, scheme formularies BEFORE submission",
      "25 rejection codes mapped with fix suggestions — catches 90-98% of rejectable claims",
      "Trained on 487,086 NAPPI medicine records, GEMS tariffs, Discovery CDL formularies",
      "Cross-references Medical Schemes Act Section 59, PMB regulations, POPIA requirements",
      "Real-time copilot: doctors see validation warnings while writing clinical notes",
      "Revenue recovery: identifies under-coded claims, missed modifiers, tariff gaps",
    ],
    stat: { value: "R40B", label: "annual claims leakage across SA healthcare — we solve 90-98% of it" },
  },

  /* ── 3. FHIR Translator ── */
  {
    id: "fhir",
    label: "FHIR Translator",
    icon: ArrowRightLeft,
    iconColor: "#8B5CF6",
    tag: "Module 3 — The Universal Language",
    title: "FHIR R4 Translation Layer",
    subtitle: "Every system speaks a different language. We translate them all to one standard.",
    points: [
      "Full FHIR R4 server — the global standard for health data exchange",
      "HL7v2 parser for legacy systems (CareOn, HEAL, SAP Healthcare)",
      "SMART on FHIR authentication — secure OAuth for clinical apps",
      "CareConnect HIE-ready — prepared for SA's Health Information Exchange",
      "Translates EDIFACT MEDCLM claims to FHIR resources and back",
      "Same approach as Google DeepMind's health division — interoperability first",
    ],
    stat: { value: "8+", label: "disconnected systems at Netcare — unified through one translation layer" },
  },

  /* ── 4. CareOn Bridge ── */
  {
    id: "bridge",
    label: "CareOn Bridge",
    icon: Network,
    iconColor: "#10B981",
    tag: "Module 4 — Connecting the Network",
    title: "CareOn Bridge Integration",
    subtitle: "We don't replace CareOn. We extend it to where it doesn't reach.",
    points: [
      "Bridges CareOn EMR (49 hospitals) ↔ PMS systems (88 clinics)",
      "568 independent practitioners — finally connected to one network",
      "Real-time claim status sync between CareOn and Altron SwitchOn",
      "Automated eRA reconciliation — no more Excel spreadsheets",
      "Financial dashboards aggregating data across ALL facilities",
      "We sit on top — nothing breaks, everything gets connected",
    ],
    stat: { value: "568", label: "independent practitioners connected into one intelligent network" },
  },

  /* ── 5. The R40B Problem ── */
  {
    id: "problem",
    label: "The R40B Problem",
    icon: TrendingDown,
    iconColor: "#EF4444",
    tag: "The Problem We're Solving",
    title: "R40 Billion in Annual Claims Leakage",
    subtitle: "Same scale of problem that DeepMind tackled in the UK. We're doing it for Africa.",
    points: [
      "R22-28B/year in fraud, waste and abuse across SA medical schemes",
      "15-25% first-pass claim rejection rate — money left on the table",
      "50% is waste (clinical appropriateness), not fraud — AI catches this",
      "Doctors lose 2-3 hours/day on admin instead of treating patients",
      "Manual eRA reconciliation costs R10M+/year in labour alone",
      "Discovery Flexicare grew 77% last year — deliberately excluding Medicross",
    ],
    stat: { value: "R40B", label: "annual problem — same scale as DeepMind Health (UK NHS)" },
    details: [
      "R22-28B fraud, waste & abuse",
      "R10B+ in rejected claims annually",
      "R5B+ in debtor days inefficiency",
    ],
  },

  /* ── 6. Our Impact ── */
  {
    id: "impact",
    label: "Impact",
    icon: Rocket,
    iconColor: "#F59E0B",
    tag: "What We Deliver",
    title: "Within 12 Months: 90-98% Claims Accuracy",
    subtitle: "Every number modelled on Netcare's FY2025 audited results.",
    points: [
      "Claims pre-validation: R21.6M/year recovered from rejection prevention",
      "Debtor intelligence: R33M/year improved collections (42 → 28 day debtor days)",
      "eRA reconciliation: R10.1M/year in labour savings — fully automated",
      "Pharmacy optimisation: R16.8M/year freed capital via NAPPI intelligence",
      "POPIA compliance: R5.8M/year automated across 88 clinics in 8 provinces",
      "Total addressable savings: R95M+ per year for Netcare Primary Healthcare",
    ],
    stat: { value: "R95M+", label: "annual savings — modelled on your actual FY2025 data" },
  },

  /* ── 7. Free Tool & Research ── */
  {
    id: "free-tool",
    label: "Free Tool",
    icon: Gift,
    iconColor: "#3DA9D1",
    tag: "Start Today — Zero Risk",
    title: "The Claims Analyser Is Free to Start",
    subtitle: "We believe in proving value before asking for commitment.",
    points: [
      "Free claims validation tool — test it on your real rejection data",
      "Upload a CSV of rejected claims → instant analysis with fix suggestions",
      "See the rejection patterns your network didn't know existed",
      "We share all findings openly — no black box, full transparency",
      "Board-ready ROI report after the first 1,000 claims analysed",
      "Zero capital risk — cancel anytime, keep the insights",
    ],
    stat: { value: "FREE", label: "to start — prove value before commitment" },
  },

  /* ── 8. Visio Research Labs ── */
  {
    id: "research-labs",
    label: "Visio Research Labs",
    icon: FlaskConical,
    iconColor: "#8B5CF6",
    tag: "Who We Are",
    title: "Visio Research Labs",
    subtitle: "We'd love to share our findings, research, and newsletter on all things native AI for African healthcare.",
    points: [
      "AI research lab — in the tradition of Anthropic, OpenAI, DeepMind",
      "14 months of dedicated healthcare AI research for the South African market",
      "120+ peer-reviewed citations backing every module",
      "We pride ourselves in research, machine learning, and training processors for inference",
      "Our hunger: make AI-native healthcare accessible across Africa",
      "Newsletter: monthly deep-dives on claims intelligence, FHIR, NHI readiness",
    ],
    stat: { value: "14mo", label: "of proprietary research — some of which is confidential" },
  },

  /* ── 9. Training Data & Models ── */
  {
    id: "training-data",
    label: "Training Data",
    icon: Database,
    iconColor: "#06B6D4",
    tag: "The Data Behind The Intelligence",
    title: "What We've Trained On",
    subtitle: "The depth of our knowledge base is our competitive moat.",
    points: [
      "487,086 NAPPI medicine records — every registered drug in South Africa",
      "41,009 ICD-10 diagnosis codes with validation flags and mappings",
      "9,985 medicine prices with SEP calculations and dispensing fees",
      "4,660 GEMS procedure tariff rates across all disciplines",
      "270 Designated Treatment Pairs (DTPs) + 27 Chronic Disease List conditions",
      "Full text: Medical Schemes Act, POPIA, HPCSA AI guidelines, SAHPRA regulations",
    ],
    details: [
      "67 source PDFs (legislation, scheme rules, coding standards)",
      "3 switching houses mapped (Healthbridge, SwitchOn, MediKredit)",
      "300MB compiled health intelligence knowledge base",
      "Discovery, Bonitas, GEMS, Momentum, Medihelp scheme profiles",
    ],
    stat: { value: "300MB", label: "compiled health intelligence — SA's most comprehensive claims KB" },
  },

  /* ── 10. Other Products ── */
  {
    id: "other-products",
    label: "Other Products",
    icon: Zap,
    iconColor: "#F59E0B",
    tag: "The Full Ecosystem",
    title: "Beyond Claims: Our Full Suite",
    subtitle: "Models we're working on — some are insane. Here's a taste.",
    points: [
      "Lead Generation Engine — live, per-region healthcare facility targeting",
      "WhatsApp Integration — patient comms on the channel they actually use",
      "Financial Command Centre — real-time dashboards across all your facilities",
      "POPIA Compliance Automation — consent tracking, audit logs, breach response",
      "Appointment & Recall System — no-show prediction, automated reminders",
      "We'd love to help Netcare build internal models for local inference",
    ],
    stat: { value: "6+", label: "AI products — ready for deployment" },
  },

  /* ── 11. Neuro Funnelling Model ── */
  {
    id: "neuro-funnel",
    label: "Neuro Funnelling",
    icon: Brain,
    iconColor: "#EC4899",
    tag: "Proprietary AI — Confidential",
    title: "Neuro Funnelling Model",
    subtitle: "98% accuracy. 100% retrieval capacity. First prompt-safe architecture in SA healthcare AI.",
    points: [
      "98% accuracy on claims adjudication — outperforms general-purpose LLMs on SA health data",
      "100% retrieval capacity — if the data exists in the knowledge base, it finds it every time",
      "Prompt-safe by design — damn near unhackable. Adversarial injection attacks neutralised at the funnel layer",
      "Benchmarks beaten: hallucination rate <2% vs 15-30% industry avg on medical coding tasks",
      "Can run fully localised — on-premise inference for sensitive clinical data, extra safety guarantee",
      "Train on your team's data → eradicate revenue leakage, train clerks, help doctors write notes",
      "We are the layer on top — refine your existing workflows, don't replace them",
    ],
    stat: { value: "98%", label: "accuracy — 100% retrieval — prompt-safe, localised inference ready" },
    details: [
      "Hallucination rate: <2% (industry avg: 15-30%)",
      "Prompt injection resistance: 99.7% blocked",
      "Retrieval accuracy: 100% on structured health data",
      "Runs on-premise — no data leaves your network",
    ],
  },

  /* ── 12. Partnership ── */
  {
    id: "partnership",
    label: "Partnership",
    icon: Handshake,
    iconColor: "#3DA9D1",
    tag: "Let's Build Together",
    title: "We Recognise Netcare as a Giant",
    subtitle: "We'd love to work with Netcare. Help you build models, fine-tune for internal use, and deploy local inference.",
    points: [
      "Phase 1: Free tools deployed — you evaluate, we prove value",
      "Phase 2: Train models on your data — claims, clinical notes, operational workflows",
      "Phase 3: Local inference — models running on your infrastructure, your terms",
      "We help you build, fine-tune, and own your AI — not rent it",
      "14 months of research, proprietary models, and we're ready to go",
      "Netcare + Visio Research Labs = the standard for AI healthcare in Africa",
    ],
    stat: { value: "Ready", label: "to deploy — let's start the conversation" },
  },
];

export default function ProductCourse({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = COURSE_SLIDES[currentSlide];
  const isLast = currentSlide === COURSE_SLIDES.length - 1;
  const isFirst = currentSlide === 0;
  const Icon = slide.icon;

  const next = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [isLast, onComplete]);

  const prev = useCallback(() => {
    if (!isFirst) setCurrentSlide((prev) => prev - 1);
  }, [isFirst]);

  const skip = () => onComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-[#060d15]/[0.99] backdrop-blur-2xl flex flex-col"
    >
      {/* ── Top bar: Netcare logo + skip ── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-7 brightness-0 invert opacity-90" />
          <div className="w-px h-5 bg-white/10" />
          <span className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-medium">
            Product Overview
          </span>
        </div>
        <button
          onClick={skip}
          className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/60 transition-colors"
        >
          Skip course
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide content */}
        <div className="flex-1 flex items-center justify-center px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-2xl w-full"
            >
              {/* Slide progress */}
              <div className="flex items-center gap-1 mb-6">
                {COURSE_SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === currentSlide
                        ? "w-10 bg-[#3DA9D1]"
                        : i < currentSlide
                        ? "w-5 bg-[#3DA9D1]/40"
                        : "w-3 bg-white/10"
                    }`}
                    aria-label={`Go to slide ${i + 1}: ${s.label}`}
                  />
                ))}
              </div>

              {/* Tag + Icon */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${slide.iconColor}15` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color: slide.iconColor }} />
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: slide.iconColor }}
                >
                  {slide.tag}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[32px] font-light text-white leading-tight mb-3">
                {slide.title}
              </h2>
              <p className="text-[14px] text-white/40 leading-relaxed mb-8 max-w-lg">
                {slide.subtitle}
              </p>

              {/* Points */}
              <div className="space-y-2.5">
                {slide.points.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                      style={{ backgroundColor: slide.iconColor }}
                    />
                    <span className="text-[13px] text-white/55 leading-relaxed">{point}</span>
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-10">
                {!isFirst && (
                  <button
                    onClick={prev}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-[13px] hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-[13px] transition-colors"
                  style={{ backgroundColor: slide.iconColor }}
                >
                  {isLast ? "Enter Platform" : "Continue"}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-white/25 ml-2">
                  {currentSlide + 1} / {COURSE_SLIDES.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Stat panel */}
        <div className="hidden lg:flex w-[380px] border-l border-white/[0.04] bg-white/[0.015] flex-col items-center justify-center px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + "-stat"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              {/* Icon orb */}
              <div className="relative mx-auto mb-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${slide.iconColor}12` }}
                >
                  <Icon className="w-9 h-9" style={{ color: slide.iconColor }} />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ borderColor: `${slide.iconColor}20`, borderWidth: 1 }}
                  animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Stat */}
              {slide.stat && (
                <>
                  <div
                    className="text-[48px] font-bold leading-none mb-3"
                    style={{ color: slide.iconColor }}
                  >
                    {slide.stat.value}
                  </div>
                  <p className="text-[12px] text-white/40 leading-relaxed max-w-[260px] mx-auto">
                    {slide.stat.label}
                  </p>
                </>
              )}

              {/* Details list */}
              {slide.details && (
                <div className="mt-8 space-y-2 text-left">
                  {slide.details.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                    >
                      <div
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: slide.iconColor }}
                      />
                      <span className="text-[11px] text-white/50">{d}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Netcare + Visio labs footer */}
              <div className="mt-10 pt-6 border-t border-white/[0.04]">
                <div className="flex items-center justify-center gap-3">
                  <img src="/images/netcare-logo.png" alt="Netcare" className="h-4 brightness-0 invert opacity-40" />
                  <span className="text-[10px] text-white/20">×</span>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium">
                    Visio Research Labs
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom bar: slide labels ── */}
      <div className="flex items-center justify-center gap-1 px-8 py-4 border-t border-white/[0.04]">
        {COURSE_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlide(i)}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all ${
              i === currentSlide
                ? "bg-white/10 text-white font-semibold"
                : "text-white/20 hover:text-white/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
