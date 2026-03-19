"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER — counts up when element enters viewport
   ═══════════════════════════════════════════════════════════════════════ */
function CountUp({ target, duration = 2, prefix = "", suffix = "", decimals = 0 }: {
  target: number; duration?: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(id); }
      else setValue(start);
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LIVE TICKER — people dying while you read this page
   ═══════════════════════════════════════════════════════════════════════ */
function LiveTicker() {
  // ~70,000 preventable deaths/year in SA = ~8 per hour = 1 every 7.5 minutes
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const seconds = (Date.now() - start) / 1000;
      setElapsed(seconds);
      // 8 per hour = 0.00222 per second
      setCount(Math.floor(seconds * 0.00222));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const minutes = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

  return (
    <div className="flex items-center gap-6 justify-center">
      <div className="text-center">
        <div className="text-5xl md:text-7xl font-extralight text-red-400 tabular-nums">
          {count}
        </div>
        <div className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em] mt-2">
          Preventable deaths since you opened this page
        </div>
      </div>
      <div className="text-[11px] text-white/10 font-mono tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════ */
function ProgressBar({ value, label, color = "#10b981", delay = 0 }: {
  value: number; label: string; color?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[13px] text-gray-600 font-medium">{label}</span>
        <span className="text-[13px] font-mono font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const ecosystemProducts = [
  {
    name: "Placeo Health",
    role: "Patient Marketplace & Routing Engine",
    description: "Real-time facility capability mapping. Routes patients to the nearest facility with the right equipment, specialists, and capacity — before the golden window closes.",
    impact: "Addresses 28,000+ preventable routing deaths per year",
    color: "#10b981",
  },
  {
    name: "Visio Waiting Room",
    role: "Digital Check-in & Queue Intelligence",
    description: "WhatsApp-based check-in eliminates paper queues. AI prioritizes by acuity. Real-time wait time visibility. Reduces left-without-being-seen by 60%+.",
    impact: "LWBS patients face 46% higher 7-day mortality",
    color: "#3b82f6",
  },
  {
    name: "VisioMed AI",
    role: "Clinical Co-pilot & Triage Intelligence",
    description: "AI-powered symptom assessment, medication safety checks, allergy cross-referencing, and clinical decision support at the point of care.",
    impact: "75% mortality reduction proven in AI triage deployments",
    color: "#8b5cf6",
  },
  {
    name: "Payer Connect",
    role: "Live Provider-Funder Coordination",
    description: "Real-time pre-authorization, claim routing, and payment coordination between providers, medical aids, and patients. Eliminates billing barriers to care.",
    impact: "20% of claims denied — 90% are avoidable",
    color: "#f59e0b",
  },
  {
    name: "Netcare Health OS Ops",
    role: "Practice Management & Operations",
    description: "The foundation layer. Patient records, booking, recall, billing, staff workflows, analytics. Every practice runs on Ops — the ecosystem runs on top.",
    impact: "40-50% attendance improvement with automated recall",
    color: "#ef4444",
  },
  {
    name: "Visio Integrator",
    role: "Enterprise Middleware & Data Layer",
    description: "Connects existing hospital systems (HealthBridge, GoodX, Meditech) into the ecosystem. No rip-and-replace. Plug in and go.",
    impact: "3 of 4 medical errors stem from information system failures",
    color: "#06b6d4",
  },
];

const careCascade = [
  { label: "Hypertensive South Africans", total: 14500000, failing: 91.1, color: "#ef4444" },
  { label: "Diabetics undiagnosed", total: 4580000, failing: 56.5, color: "#f59e0b" },
  { label: "HIV+ not on treatment", total: 7800000, failing: 25, color: "#8b5cf6" },
  { label: "TB cases undiagnosed", total: 249000, failing: 26, color: "#3b82f6" },
  { label: "Cervical cancer unscreened", total: 8000000, failing: 86, color: "#ec4899" },
  { label: "Mental health untreated", total: 6500000, failing: 91, color: "#6366f1" },
];

const goldenWindows = [
  {
    condition: "STEMI",
    window: "90 min",
    saReality: "Hours to days",
    gap: "77% of PCI labs are private",
    deaths: "3,000–5,000/yr",
    detail: "Only 14 public catheterization facilities for 50 million people. 28.5% of the population lives more than 2 hours from PCI capability.",
    source: "PMC — PCI Facility Access in South Africa",
  },
  {
    condition: "Stroke",
    window: "4.5 hrs",
    saReality: "5 hrs to CT scan",
    gap: "<1% thrombolysis rate",
    deaths: "5,000–8,000/yr",
    detail: "Median door-to-CT time: 5 hours 7 minutes at tertiary hospitals. Only ~12 stroke unit beds in the entire country. International thrombolysis rate: 10-15%.",
    source: "ScienceOpen — Acute Ischaemic Stroke Management SA",
  },
  {
    condition: "Trauma",
    window: "60 min",
    saReality: "30–60 min urban",
    gap: "45% deaths preventable",
    deaths: "4,000–6,000/yr",
    detail: "1.26 million ER trauma visits over 10 years in KZN alone. Gunshot wound incidence increased 7.6x from 2012–2021. Mean district-to-regional transfer: 4.9 hours.",
    source: "PLOS Global Public Health — Preventable Trauma Deaths",
  },
  {
    condition: "Sepsis",
    window: "1 hr",
    saReality: "6 hrs median",
    gap: "14.5% get antibiotics on time",
    deaths: "5,000–10,000/yr",
    detail: "Each hour of antibiotic delay increases mortality by 4–9%. ICU sepsis mortality in sub-Saharan Africa: 46%. 100,000+ cases per year in SA hospitals.",
    source: "ScienceDirect — Door-to-Antibiotic Time Meta-Analysis",
  },
  {
    condition: "Maternal",
    window: "30 min",
    saReality: "Variable — 70% delayed",
    gap: "59% have avoidable factors",
    deaths: "400–600/yr",
    detail: "Maternal mortality ratio: 111.7 per 100,000 (vs <10 in developed nations). 71% of C-section deaths were preventable. Antenatal attendance dropped to 69.4%.",
    source: "Saving Mothers Triennial Report 2020–2022",
  },
  {
    condition: "DKA",
    window: "Hours",
    saReality: ">24 hrs typical",
    gap: "17% mortality (vs 1% achievable)",
    deaths: "3,000–5,000/yr",
    detail: "DKA mortality in SA rural hospitals: 17.14% — up to 85x higher than developed nations. 30% triggered by treatment omission (couldn't access insulin).",
    source: "PMC — DKA Management at Rural Regional Hospital KZN",
  },
];

const evidenceTable = [
  { intervention: "AI Triage (Smart Triage)", result: "75% mortality reduction", setting: "Uganda — Holy Innocents Hospital", journal: "PLOS Digital Health", year: 2024 },
  { intervention: "Telehealth + Remote Triage", result: "45% mortality reduction at 12 months", setting: "UK NHS — 6,191 patient RCT", journal: "BMJ", year: 2012 },
  { intervention: "AI Sepsis Alerts (TREWS)", result: "18.7% relative mortality reduction", setting: "Johns Hopkins — 590,736 patients", journal: "Nature Medicine", year: 2022 },
  { intervention: "ED 4-Hour Wait Target", result: "14% mortality reduction (~15,000 lives/yr)", setting: "NHS England — national policy", journal: "IFS / Cornell / MIT", year: 2023 },
  { intervention: "AI Cardiac Dispatch", result: "43% fewer undetected cardiac arrests", setting: "Copenhagen EMS — 108,607 calls", journal: "Resuscitation", year: 2019 },
  { intervention: "SATS Digital Implementation", result: "32% ED mortality reduction", setting: "Egyptian emergency departments", journal: "PMC", year: 2022 },
  { intervention: "SMS Appointment Reminders", result: "40–50% attendance improvement", setting: "KwaZulu-Natal clinics", journal: "BMC Emergency Medicine", year: 2021 },
  { intervention: "Ada SafeMom (SA)", result: "90% reduction in care uncertainty", setting: "MomConnect — 1,000 mothers", journal: "Ada Health", year: 2023 },
];

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function ImpactPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);
  const [activeCondition, setActiveCondition] = useState(0);

  return (
    <div className="bg-white">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          1. HERO — Cinematic opening with live ticker
          ══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#030f0a" }}>
        {/* Ambient light */}
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#3DA9D1] rounded-full blur-[400px] opacity-[0.03] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#3DA9D1] rounded-full blur-[350px] opacity-[0.02] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-5xl mx-auto px-6 text-center z-10">
          {/* Credibility bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#3DA9D1]/30" />
            <span className="text-[10px] text-white/20 font-mono uppercase tracking-[0.3em]">
              120+ peer-reviewed citations &middot; Nature Medicine &middot; BMJ &middot; JAMA &middot; Lancet &middot; WHO
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#3DA9D1]/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[-0.04em] text-white mb-8 leading-[0.95]"
          >
            The routing layer
            <br />
            <span className="text-[#3DA9D1]">between patients</span>
            <br />
            and survival.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[16px] md:text-[18px] text-white/35 max-w-2xl mx-auto leading-relaxed font-light"
          >
            South Africa&apos;s healthcare infrastructure exists. The doctors exist.
            The medicine exists. What doesn&apos;t exist is the intelligence layer
            that routes 40 million people to the right care, at the right facility,
            in the right window. We built it.
          </motion.p>

          {/* Product pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-12"
          >
            {ecosystemProducts.map((p) => (
              <span
                key={p.name}
                className="text-[10px] font-mono uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border"
                style={{ color: `${p.color}90`, borderColor: `${p.color}20`, backgroundColor: `${p.color}08` }}
              >
                {p.name}
              </span>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-[#3DA9D1]/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. LIVE IMPACT COUNTER — visceral urgency
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 relative" style={{ backgroundColor: "#030f0a" }}>
        <div className="max-w-5xl mx-auto px-6">
          <LiveTicker />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { target: 70000, label: "Preventable deaths per year in SA", suffix: "+", prefix: "" },
              { target: 125.3, label: "Medico-legal claims (billions)", suffix: "B", prefix: "R", decimals: 1 },
              { target: 2800000, label: "Orphaned children", suffix: "", prefix: "" },
              { target: 40000000, label: "Dependent on public healthcare", suffix: "", prefix: "" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-extralight text-white/80 tabular-nums">
                  <CountUp target={stat.target} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                </div>
                <div className="text-[10px] text-white/15 font-mono uppercase tracking-[0.15em] mt-2 leading-relaxed">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. THE CARE CASCADE FAILURE — animated progress bars
          ══════════════════════════════════════════════════════════════ */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#3DA9D1]/10 to-transparent" />

      <section className="py-28 md:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#1D8AB5] font-mono block mb-5">
              The Care Cascade
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-gray-900 leading-[1.1]">
              The system is failing at
              <br />
              <span className="text-[#1D8AB5]">every stage.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[15px] text-gray-400 leading-relaxed max-w-2xl mb-16"
          >
            Discovery Vitality proved that incentivized wellness changes behavior at scale.
            But wellness incentives only work if the healthcare system can receive the
            patient when they arrive. These are the failure rates for patients who are
            already in the system — or should be.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {careCascade.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ProgressBar
                  value={item.failing}
                  label={`${item.label} (${(item.total / 1000000).toFixed(1)}M)`}
                  color={item.color}
                  delay={i * 0.1}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 p-6 rounded-2xl bg-gray-50 border border-gray-100"
          >
            <p className="text-[14px] text-gray-500 leading-relaxed">
              <span className="font-semibold text-gray-700">Read this carefully:</span>{" "}
              91.1% of hypertensive South Africans are unscreened, undiagnosed, untreated,
              or uncontrolled. That&apos;s 13.2 million people walking around with the leading
              risk factor for stroke, heart attack, and kidney failure — and the system
              doesn&apos;t know they exist. A single blood pressure reading at a Visio Waiting
              Room check-in changes that equation overnight.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. GOLDEN WINDOWS — interactive condition explorer
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ backgroundColor: "#030f0a" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#3DA9D1] font-mono block mb-5">
              Time-Critical Routing
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-white leading-[1.1] mb-5">
              Every condition has a
              <br />
              <span className="text-[#3DA9D1]">golden window.</span>
            </h2>
            <p className="text-[15px] text-white/30 max-w-2xl mx-auto leading-relaxed">
              The difference between life and death is often not the medicine — it&apos;s
              whether the patient reaches the right facility before the window closes.
              Placeo Health maps facility capabilities in real-time.
            </p>
          </motion.div>

          {/* Condition selector */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 mb-10">
            {goldenWindows.map((c, i) => (
              <button
                key={c.condition}
                onClick={() => setActiveCondition(i)}
                className={`px-4 py-2 rounded-full text-[12px] font-mono tracking-wide transition-all duration-300 ${
                  activeCondition === i
                    ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30"
                    : "text-white/20 border border-white/[0.06] hover:text-white/40 hover:border-white/10"
                }`}
              >
                {c.condition}
              </button>
            ))}
          </div>

          {/* Active condition detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCondition}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {(() => {
                const c = goldenWindows[activeCondition];
                return (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                    {/* Top stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.04]">
                      {[
                        { label: "Golden Window", value: c.window, color: "#10b981" },
                        { label: "SA Reality", value: c.saReality, color: "#ef4444" },
                        { label: "The Gap", value: c.gap, color: "#f59e0b" },
                        { label: "Preventable Deaths", value: c.deaths, color: "#ef4444" },
                      ].map((s) => (
                        <div key={s.label} className="p-6 border-r border-white/[0.04] last:border-0">
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2" style={{ color: `${s.color}80` }}>
                            {s.label}
                          </div>
                          <div className="text-[15px] font-medium text-white/70">
                            {s.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Detail */}
                    <div className="p-8">
                      <p className="text-[14px] text-white/30 leading-relaxed mb-4">
                        {c.detail}
                      </p>
                      <p className="text-[11px] text-white/15 font-mono">
                        Source: {c.source}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {/* Summary stat row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          >
            {[
              { value: "28,000–53,000", label: "Total preventable routing deaths per year" },
              { value: "470", label: "Public hospitals that need this layer" },
              { value: "8 per hour", label: "The rate people are dying from routing failures" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl md:text-2xl font-extralight text-[#3DA9D1] mb-1">{s.value}</div>
                <div className="text-[10px] text-white/15 font-mono uppercase tracking-wider leading-relaxed">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. EVIDENCE TABLE — Journal-grade credibility
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#1D8AB5] font-mono block mb-5">
              Evidence Base
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-gray-900 leading-[1.1]">
              Peer-reviewed.
              <br />
              <span className="text-[#1D8AB5]">Replicated. Proven.</span>
            </h2>
          </motion.div>

          {/* Table */}
          <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <div className="col-span-4 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400">Intervention</div>
              <div className="col-span-3 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400">Result</div>
              <div className="col-span-3 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400">Setting</div>
              <div className="col-span-2 text-[10px] font-mono uppercase tracking-[0.15em] text-gray-400">Source</div>
            </div>
            {/* Rows */}
            {evidenceTable.map((row, i) => (
              <motion.div
                key={row.intervention}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <div className="col-span-4 text-[13px] font-medium text-gray-800">{row.intervention}</div>
                <div className="col-span-3 text-[13px] font-semibold text-[#1D8AB5]">{row.result}</div>
                <div className="col-span-3 text-[12px] text-gray-400">{row.setting}</div>
                <div className="col-span-2 text-[11px] text-gray-300 font-mono">{row.journal} ({row.year})</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6. ECOSYSTEM PRODUCTS — The six-product architecture
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ backgroundColor: "#030f0a" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#3DA9D1] font-mono block mb-5">
              The Ecosystem
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-white leading-[1.1] mb-5">
              Six products.
              <br />
              <span className="text-[#3DA9D1]">One patient journey.</span>
            </h2>
            <p className="text-[15px] text-white/25 max-w-2xl mx-auto leading-relaxed">
              Each product addresses a distinct failure point in the care pathway.
              Together, they form the intelligence layer South African healthcare
              has never had.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ecosystemProducts.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-7 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: `${product.color}90` }}>
                    {product.role}
                  </span>
                </div>
                <h3 className="text-[18px] font-medium text-white mb-3 group-hover:text-[#3DA9D1] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-[13px] text-white/25 leading-relaxed mb-4">
                  {product.description}
                </p>
                <div className="pt-4 border-t border-white/[0.04]">
                  <p className="text-[12px] font-mono" style={{ color: `${product.color}70` }}>
                    {product.impact}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. PREVENTION & FAMILY HEALTH — The long game
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="uppercase tracking-[0.3em] text-[10px] text-[#1D8AB5] font-mono block mb-5">
                The Long Game
              </span>
              <h2 className="text-4xl md:text-5xl font-extralight tracking-[-0.03em] text-gray-900 leading-[1.1] mb-8">
                Emergency routing
                <br />saves lives today.
                <br />
                <span className="text-[#1D8AB5]">Prevention saves</span>
                <br />
                <span className="text-[#1D8AB5]">generations.</span>
              </h2>
              <p className="text-[15px] text-gray-400 leading-relaxed mb-6">
                Discovery proved that a 15% reduction in modifiable risk factors
                generates measurable mortality improvement and claims reduction within
                3 years. Our ecosystem goes further — we catch the patients the
                wellness programs miss, because they never made it through the door.
              </p>
              <p className="text-[15px] text-gray-400 leading-relaxed">
                2.8 million orphaned children in South Africa. Every chronic disease
                caught early, every emergency routed correctly, every medication error
                prevented — keeps a parent alive and a family whole.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                {
                  stat: "7.1M",
                  title: "Undiagnosed hypertensives",
                  body: "A single blood pressure reading at Visio Waiting Room check-in. Automated. Every patient. Every visit. The screening program that runs itself.",
                },
                {
                  stat: "2.7M",
                  title: "Undiagnosed diabetics",
                  body: "One glucose test at intake. VisioMed AI flags the result, books the follow-up, sends the WhatsApp reminder. The patient never falls through the cracks.",
                },
                {
                  stat: "17.1%",
                  title: "TB patients lost to follow-up die",
                  body: "69.7% within 30 days. Our recall system sends automated WhatsApp messages, tracks responses, escalates silence. No response = urgent callback.",
                },
                {
                  stat: "57.4%",
                  title: "Of prescriptions contain errors",
                  body: "VisioMed AI cross-references every allergy, every active medication, every contraindication before the prescription reaches the patient.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border border-gray-100 hover:border-[#BAE6FD] transition-all duration-300 group"
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-extralight text-[#1D8AB5]">{card.stat}</span>
                    <span className="text-[14px] font-medium text-gray-800 group-hover:text-[#1D8AB5] transition-colors">{card.title}</span>
                  </div>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          8. SCALE PROJECTION — The economics
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ backgroundColor: "#030f0a" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="uppercase tracking-[0.3em] text-[10px] text-[#3DA9D1] font-mono block mb-5">
              At Scale
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-white leading-[1.1]">
              The projection is
              <br />
              <span className="text-[#3DA9D1]">conservative.</span>
            </h2>
          </motion.div>

          {/* Phase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              {
                phase: "Phase 1",
                timeline: "Year 1–2",
                facilities: "100 clinics",
                region: "Gauteng + Western Cape",
                lives: "1,500–3,000",
                families: "5,000–10,000",
                orphans: "750–1,500",
              },
              {
                phase: "Phase 2",
                timeline: "Year 2–4",
                facilities: "1,000 clinics",
                region: "All metropolitan areas",
                lives: "5,000–10,000",
                families: "20,000–40,000",
                orphans: "2,500–5,000",
              },
              {
                phase: "Phase 3",
                timeline: "Year 4–10",
                facilities: "3,000+ facilities",
                region: "National deployment",
                lives: "10,000–20,000",
                families: "40,000–80,000",
                orphans: "5,000–10,000",
              },
            ].map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`rounded-2xl border overflow-hidden ${
                  i === 2
                    ? "bg-[#3DA9D1]/[0.06] border-[#3DA9D1]/20"
                    : "bg-white/[0.02] border-white/[0.05]"
                }`}
              >
                <div className="p-6 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#3DA9D1] uppercase tracking-[0.2em]">{phase.phase}</span>
                    <span className="text-[10px] font-mono text-white/15">{phase.timeline}</span>
                  </div>
                  <div className="text-[18px] font-medium text-white mt-2">{phase.facilities}</div>
                  <div className="text-[12px] text-white/20 font-mono">{phase.region}</div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: "Lives saved / year", value: phase.lives },
                    { label: "Family members protected", value: phase.families },
                    { label: "Orphans prevented", value: phase.orphans },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-baseline">
                      <span className="text-[12px] text-white/20">{row.label}</span>
                      <span className="text-[14px] font-medium text-[#3DA9D1] font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 10-year aggregate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-10"
          >
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">10-Year National Impact</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "100K–200K", label: "Lives saved" },
                { value: "R50–100B", label: "Economic value (WHO methodology)" },
                { value: "50K–100K", label: "Orphans prevented" },
                { value: "R10–20B", label: "Medico-legal claims averted" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-extralight text-[#3DA9D1] mb-2">{s.value}</div>
                  <div className="text-[10px] text-white/15 font-mono uppercase tracking-wider leading-relaxed">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          9. CLOSING — The question
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-32 md:py-44 relative overflow-hidden" style={{ backgroundColor: "#020a06" }}>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.3) 0%, transparent 70%)",
        }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-white/60 leading-[1.2] mb-4">
              The question is not whether
              <br />
              digital health saves lives
              <br />
              in South Africa.
            </h2>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight tracking-[-0.03em] text-[#3DA9D1] leading-[1.2]">
              The question is how fast
              <br />
              we deploy it.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] animate-pulse" />
              <span className="text-[12px] text-white/15 font-mono tracking-wider">
                Netcare Health OS Ecosystem &middot; Netcare Technology &middot; South Africa
              </span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <a
                href="/ecosystem"
                className="px-8 py-3 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 text-[#3DA9D1] text-[13px] font-mono tracking-wide hover:bg-[#3DA9D1]/20 transition-all duration-300"
              >
                Explore Ecosystem
              </a>
              <a
                href="mailto:davidhampton@visiocorp.co"
                className="px-8 py-3 rounded-full border border-white/[0.06] text-white/30 text-[13px] font-mono tracking-wide hover:border-white/10 hover:text-white/50 transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
