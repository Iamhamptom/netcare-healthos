"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, AlertTriangle, Skull, BookOpen, Cpu, ArrowRight,
  TrendingUp, DollarSign, Rocket, ChevronLeft, ChevronRight,
  Activity, Users, Clock, Banknote, Baby, Brain,
  Shield, Stethoscope, Phone, BarChart3, Zap, Globe,
} from "lucide-react";

const TOTAL_SLIDES = 10;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function PresentationDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [direction, setDirection] = useState(0);

  const goTo = (slide: number) => {
    if (slide < 1 || slide > TOTAL_SLIDES) return;
    setDirection(slide > currentSlide ? 1 : -1);
    setCurrentSlide(slide);
  };

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`w-7 h-7 rounded-lg text-[11px] font-semibold transition-all ${
                n === currentSlide
                  ? "bg-[#D4AF37] text-black"
                  : "glass-panel text-[var(--text-tertiary)] hover:text-[var(--ivory)]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentSlide - 1)}
            disabled={currentSlide === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-panel text-[12px] text-[var(--text-secondary)] hover:text-[var(--ivory)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <button
            onClick={() => goTo(currentSlide + 1)}
            disabled={currentSlide === TOTAL_SLIDES}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-panel text-[12px] text-[var(--text-secondary)] hover:text-[var(--ivory)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentSlide === 1 && <Slide1 />}
            {currentSlide === 2 && <Slide2 />}
            {currentSlide === 3 && <Slide3 />}
            {currentSlide === 4 && <Slide4 />}
            {currentSlide === 5 && <Slide5 />}
            {currentSlide === 6 && <Slide6 />}
            {currentSlide === 7 && <Slide7 />}
            {currentSlide === 8 && <Slide8 />}
            {currentSlide === 9 && <Slide9 />}
            {currentSlide === 10 && <Slide10 />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide counter */}
      <div className="text-center">
        <span className="text-[11px] text-[var(--text-tertiary)]">
          Slide {currentSlide} of {TOTAL_SLIDES}
        </span>
      </div>
    </div>
  );
}

function SlideShell({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl glass-panel p-8 border border-[var(--border)] min-h-[560px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
          <span className="text-[11px] font-bold text-[#D4AF37]">{String(number).padStart(2, "0")}</span>
        </div>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* ─────────── SLIDE 1: Title ─────────── */
function Slide1() {
  return (
    <SlideShell number={1}>
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-[#ef4444]/10 flex items-center justify-center mb-6"
        >
          <Heart className="w-10 h-10 text-[#ef4444]" />
        </motion.div>
        <h1 className="text-3xl font-bold text-[var(--ivory)] mb-3">Netcare Health OSOS</h1>
        <p className="text-[18px] text-[var(--text-secondary)] mb-2">
          Saving Lives Through Digital Health Routing
        </p>
        <p className="text-[14px] text-[var(--text-tertiary)] mb-8">
          The AI-Powered Healthcare Operating System for Africa
        </p>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <span className="text-[12px] font-medium text-[#D4AF37]">Netcare Technology (Pty) Ltd</span>
          </div>
          <span className="text-[12px] text-[var(--text-tertiary)]">March 2026</span>
        </div>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 2: The Crisis ─────────── */
function Slide2() {
  const stats = [
    { value: "40M+", label: "South Africans depend on public healthcare", icon: Users, color: "#ef4444" },
    { value: "91.1%", label: "Public facility usage rate — severely strained", icon: Activity, color: "#E8C84A" },
    { value: "<1%", label: "Health budget allocated to mental health", icon: Brain, color: "#8B5CF6" },
    { value: "6 hours", label: "Average ambulance wait in rural areas", icon: Clock, color: "#ef4444" },
    { value: "R125.3B", label: "Outstanding medico-legal claims against state", icon: Banknote, color: "#10b981" },
    { value: "2.8M", label: "Orphans — many from AIDS-related deaths", icon: Baby, color: "#0ea5e9" },
  ];

  return (
    <SlideShell number={2}>
      <h2 className="text-xl font-bold text-[var(--ivory)] mb-2">The Crisis</h2>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-6">
        South Africa&apos;s public health system is under catastrophic pressure.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-[var(--border)] p-5 text-center"
          >
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 3: The Cost of Inaction ─────────── */
function Slide3() {
  const deaths = [
    { condition: "Emergency department delays", estimate: "8,000-12,000/year", basis: "UK NHS: 16,600 deaths from ED waits; SA has worse baselines" },
    { condition: "Sepsis (delayed detection)", estimate: "5,000-8,000/year", basis: "18.2% mortality reduction achievable with digital screening" },
    { condition: "Maternal complications", estimate: "1,500-2,500/year", basis: "119/100K maternal mortality — 3x WHO SDG target" },
    { condition: "Surgical backlog delays", estimate: "3,000-5,000/year", basis: "200,000+ on waiting lists with disease progression" },
    { condition: "TB missed cases", estimate: "10,000-15,000/year", basis: "39% of estimated TB cases undetected and untreated" },
    { condition: "Chronic disease mismanagement", estimate: "5,000-10,000/year", basis: "Fragmented care, poor adherence, no follow-up systems" },
  ];

  return (
    <SlideShell number={3}>
      <div className="flex items-center gap-3 mb-2">
        <Skull className="w-5 h-5 text-[#ef4444]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">The Cost of Inaction</h2>
      </div>
      <div className="rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/20 p-3 mb-5">
        <p className="text-[12px] text-[var(--text-secondary)]">
          The UK NHS reported <strong className="text-[var(--ivory)]">16,600 deaths</strong> attributable to emergency department
          waiting times in 2023. South Africa&apos;s public health system has <strong className="text-[#ef4444]">significantly worse</strong> baselines
          across every measured indicator.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 pr-3 text-[var(--text-tertiary)] font-semibold">Condition</th>
              <th className="text-left py-2 pr-3 text-[var(--text-tertiary)] font-semibold">Estimated Preventable Deaths</th>
              <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">Basis</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            {deaths.map((d, i) => (
              <tr key={i} className="border-b border-[var(--border)]/50">
                <td className="py-2.5 pr-3 text-[var(--ivory)] font-medium">{d.condition}</td>
                <td className="py-2.5 pr-3 font-semibold text-[#ef4444]">{d.estimate}</td>
                <td className="py-2.5 text-[11px]">{d.basis}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--border)]">
              <td className="py-3 font-bold text-[var(--ivory)] text-[13px]">Conservative Total</td>
              <td className="py-3 font-bold text-[#ef4444] text-[13px]">32,500-52,500/year</td>
              <td className="py-3 text-[11px] text-[var(--text-tertiary)] italic">Addressable through digital health interventions</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 4: Proven Solutions ─────────── */
function Slide4() {
  const evidence = [
    { intervention: "AI-assisted ED triage", reduction: "15-25%", source: "Liu et al., Nature Medicine (2023)" },
    { intervention: "Digital early warning scores", reduction: "20-30%", source: "Escobar et al., NEJM (2020)" },
    { intervention: "Automated sepsis screening", reduction: "18.2%", source: "Adams et al., Nature Medicine (2022)" },
    { intervention: "mHealth appointment reminders", reduction: "34% missed appt reduction", source: "Gurol-Urganci, Cochrane (2013)" },
    { intervention: "Clinical decision support", reduction: "12-20%", source: "Kawamoto et al., BMJ (2005)" },
    { intervention: "Digital referral management", reduction: "40% faster treatment", source: "WHO Digital Health Guidelines (2019)" },
    { intervention: "Real-time bed management", reduction: "15% less ED boarding", source: "Bai et al., Health Affairs (2021)" },
    { intervention: "Predictive readmission models", reduction: "21% fewer readmissions", source: "Rajkomar et al., npj Digital Med (2018)" },
  ];

  return (
    <SlideShell number={4}>
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-[#0ea5e9]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">Proven Solutions</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-5">
        Peer-reviewed evidence for digital health interventions.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 pr-3 text-[var(--text-tertiary)] font-semibold">Intervention</th>
              <th className="text-left py-2 pr-3 text-[var(--text-tertiary)] font-semibold">Impact</th>
              <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">Citation</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text-secondary)]">
            {evidence.map((e, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-[var(--border)]/50"
              >
                <td className="py-2.5 pr-3 text-[var(--ivory)]">{e.intervention}</td>
                <td className="py-2.5 pr-3 font-semibold text-[#10b981]">{e.reduction}</td>
                <td className="py-2.5 text-[11px] text-[var(--text-tertiary)] italic">{e.source}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 5: Netcare Health OSOS ─────────── */
function Slide5() {
  const features = [
    { name: "AI Triage", desc: "5-level acuity scoring", icon: Activity, color: "#ef4444" },
    { name: "Smart Scheduling", desc: "Resource-aware booking", icon: Clock, color: "#2DD4BF" },
    { name: "Patient Intake", desc: "Automated registration", icon: Users, color: "#0ea5e9" },
    { name: "ICD-10 Billing", desc: "Claim generation", icon: DollarSign, color: "#10b981" },
    { name: "Follow-up Engine", desc: "Recall & reminders", icon: Phone, color: "#8B5CF6" },
    { name: "Ops Dashboard", desc: "Real-time oversight", icon: BarChart3, color: "#E8C84A" },
    { name: "Voice AI", desc: "Accessible interface", icon: Zap, color: "#D4AF37" },
    { name: "POPIA Compliance", desc: "Consent & audit trail", icon: Shield, color: "#ef4444" },
    { name: "Multi-tenant", desc: "Isolated per facility", icon: Globe, color: "#2DD4BF" },
    { name: "WhatsApp Comms", desc: "95% reach in metros", icon: Phone, color: "#10b981" },
    { name: "Clinical AI", desc: "Decision support", icon: Stethoscope, color: "#8B5CF6" },
    { name: "Analytics", desc: "Revenue & population", icon: TrendingUp, color: "#0ea5e9" },
  ];

  return (
    <SlideShell number={5}>
      <div className="flex items-center gap-3 mb-2">
        <Cpu className="w-5 h-5 text-[#8B5CF6]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">Netcare Health OSOS</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-5">
        22 integrated features. 5 AI agents. One platform.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-lg border border-[var(--border)] p-3"
          >
            <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: `${f.color}15` }}>
              <f.icon className="w-4 h-4" style={{ color: f.color }} />
            </div>
            <div className="text-[12px] font-semibold text-[var(--ivory)]">{f.name}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 6: Feature → Lives Map ─────────── */
function Slide6() {
  const mappings = [
    { feature: "AI Triage Agent", impact: "Correct acuity scoring reduces mis-prioritization deaths", lives: "3,000-6,000/yr", color: "#ef4444" },
    { feature: "Automated Sepsis Screening", impact: "Early detection cuts sepsis mortality by 18%", lives: "900-1,500/yr", color: "#E8C84A" },
    { feature: "Digital Referral Routing", impact: "40% faster specialist access for critical cases", lives: "2,000-4,000/yr", color: "#2DD4BF" },
    { feature: "Appointment Reminders", impact: "34% reduction in missed follow-ups for chronic patients", lives: "1,500-3,000/yr", color: "#10b981" },
    { feature: "Maternal Care Pathway", impact: "Automated risk flagging for high-risk pregnancies", lives: "500-1,000/yr", color: "#8B5CF6" },
    { feature: "TB Case Finding", impact: "Digital symptom screening catches missed cases", lives: "2,000-5,000/yr", color: "#0ea5e9" },
    { feature: "Early Warning Scores", impact: "Predictive deterioration alerts on ward patients", lives: "3,000-5,000/yr", color: "#D4AF37" },
    { feature: "Real-time Bed Management", impact: "Reduces ED boarding and crowding deaths", lives: "1,000-2,000/yr", color: "#ef4444" },
  ];

  return (
    <SlideShell number={6}>
      <div className="flex items-center gap-3 mb-2">
        <ArrowRight className="w-5 h-5 text-[#10b981]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">Feature &rarr; Lives Map</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-5">
        How each capability translates to saved lives at national scale.
      </p>
      <div className="space-y-3">
        {mappings.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 rounded-lg border border-[var(--border)] p-3"
          >
            <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-[var(--ivory)]">{m.feature}</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">{m.impact}</div>
            </div>
            <div className="text-[13px] font-bold shrink-0" style={{ color: m.color }}>
              {m.lives}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 p-3 text-center">
        <span className="text-[12px] text-[var(--text-secondary)]">
          Combined at full scale: <strong className="text-[#10b981] text-[14px]">13,900-27,500 lives/year</strong>
        </span>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 7: The Projection ─────────── */
function Slide7() {
  const phases = [
    {
      phase: "Phase 1",
      period: "Months 1-6",
      facilities: "100 clinics",
      region: "Gauteng & Western Cape",
      lives: "500-1,000",
      families: "2,000-4,000",
      cost: "R15M",
      color: "#E8C84A",
    },
    {
      phase: "Phase 2",
      period: "Months 7-18",
      facilities: "1,000 clinics",
      region: "All 8 metros",
      lives: "5,000-12,000",
      families: "20,000-48,000",
      cost: "R75M",
      color: "#2DD4BF",
    },
    {
      phase: "Phase 3",
      period: "Months 19-36",
      facilities: "3,000+ facilities",
      region: "All 9 provinces",
      lives: "15,000-30,000",
      families: "60,000-120,000",
      cost: "R200M",
      color: "#8B5CF6",
    },
  ];

  return (
    <SlideShell number={7}>
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-5 h-5 text-[#2DD4BF]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">The Projection</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-6">
        Three phases. Measurable impact at every gate.
      </p>
      <div className="space-y-4">
        {phases.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border-2 p-5"
            style={{ borderColor: `${p.color}40` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                  {p.phase}
                </span>
                <span className="text-[12px] text-[var(--text-tertiary)]">{p.period}</span>
              </div>
              <span className="text-[14px] font-bold" style={{ color: p.color }}>{p.cost}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Facilities</div>
                <div className="text-[14px] font-bold text-[var(--ivory)]">{p.facilities}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Region</div>
                <div className="text-[14px] font-bold text-[var(--ivory)]">{p.region}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Lives Saved / Year</div>
                <div className="text-[14px] font-bold" style={{ color: p.color }}>{p.lives}</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Families Protected</div>
                <div className="text-[14px] font-bold" style={{ color: p.color }}>{p.families}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 8: 10-Year Impact ─────────── */
function Slide8() {
  return (
    <SlideShell number={8}>
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-5 h-5 text-[#ef4444]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">10-Year Impact</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-8">
        At full national deployment, the compounding effect over a decade.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border-2 border-[#ef4444]/30 p-8 text-center"
        >
          <Heart className="w-8 h-8 text-[#ef4444] mx-auto mb-3" />
          <div className="text-4xl font-bold text-[#ef4444] mb-2">100,000 - 200,000</div>
          <div className="text-[14px] text-[var(--ivory)] font-medium">Lives Saved</div>
          <div className="text-[12px] text-[var(--text-tertiary)] mt-1">Over 10 years at national scale</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-[#10b981]/30 p-8 text-center"
        >
          <DollarSign className="w-8 h-8 text-[#10b981] mx-auto mb-3" />
          <div className="text-4xl font-bold text-[#10b981] mb-2">R50B - R100B</div>
          <div className="text-[14px] text-[var(--ivory)] font-medium">Economic Value Created</div>
          <div className="text-[12px] text-[var(--text-tertiary)] mt-1">Medico-legal savings + productivity gains</div>
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-[var(--border)] p-4 text-center"
        >
          <div className="text-2xl font-bold text-[#E8C84A]">400,000-800,000</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Families kept whole</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-[var(--border)] p-4 text-center"
        >
          <div className="text-2xl font-bold text-[#2DD4BF]">3,000+</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Facilities digitized</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-[var(--border)] p-4 text-center"
        >
          <div className="text-2xl font-bold text-[#8B5CF6]">40M+</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Citizens served</div>
        </motion.div>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 9: Revenue Model ─────────── */
function Slide9() {
  const tiers = [
    { name: "Starter", price: "R15,000/mo", features: "Core triage, scheduling, billing", target: "Small clinics (<5 staff)", color: "#E8C84A" },
    { name: "Professional", price: "R35,000/mo", features: "Full AI suite, analytics, WhatsApp", target: "Medium practices (5-20 staff)", color: "#2DD4BF" },
    { name: "Enterprise", price: "R55,000/mo", features: "Multi-site, API, custom branding", target: "Hospital groups, provincial", color: "#8B5CF6" },
  ];

  return (
    <SlideShell number={9}>
      <div className="flex items-center gap-3 mb-2">
        <DollarSign className="w-5 h-5 text-[#10b981]" />
        <h2 className="text-xl font-bold text-[var(--ivory)]">Revenue Model</h2>
      </div>
      <p className="text-[13px] text-[var(--text-tertiary)] mb-6">
        SaaS subscription model — predictable, scalable revenue.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tiers.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border-2 p-5"
            style={{ borderColor: `${t.color}40` }}
          >
            <div className="px-3 py-1 rounded-full text-[11px] font-bold inline-block mb-3" style={{ backgroundColor: `${t.color}15`, color: t.color }}>
              {t.name}
            </div>
            <div className="text-2xl font-bold text-[var(--ivory)] mb-2">{t.price}</div>
            <div className="text-[11px] text-[var(--text-secondary)] mb-2">{t.features}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">{t.target}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] p-5">
        <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">ARR Projections</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { year: "Year 1 (100 clinics)", arr: "R18M-33M", color: "#E8C84A" },
            { year: "Year 2 (1,000 clinics)", arr: "R180M-330M", color: "#2DD4BF" },
            { year: "Year 3+ (3,000 facilities)", arr: "R540M-990M", color: "#8B5CF6" },
          ].map((p, i) => (
            <div key={i} className="text-center">
              <div className="text-[11px] text-[var(--text-tertiary)] mb-1">{p.year}</div>
              <div className="text-[18px] font-bold" style={{ color: p.color }}>{p.arr}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">ARR</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-3 text-center">
        <span className="text-[12px] text-[var(--text-secondary)]">
          Government contracts: <strong className="text-[#D4AF37]">per-facility licensing</strong> with volume discounts at 500+ and 2,000+ tiers
        </span>
      </div>
    </SlideShell>
  );
}

/* ─────────── SLIDE 10: The Ask ─────────── */
function Slide10() {
  return (
    <SlideShell number={10}>
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6"
        >
          <Rocket className="w-10 h-10 text-[#D4AF37]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[var(--ivory)] mb-4">The Ask</h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[16px] text-[var(--text-secondary)] max-w-lg mb-6 leading-relaxed"
        >
          The evidence is clear. The technology exists. The platform is built.
          The only question left is:
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border-2 border-[#D4AF37]/40 p-6 max-w-md"
        >
          <p className="text-[20px] font-bold text-[#D4AF37] italic leading-relaxed">
            &quot;How fast do we deploy it?&quot;
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 space-y-3"
        >
          <div className="flex items-center justify-center gap-6 text-[12px] text-[var(--text-tertiary)]">
            <span>100 clinics in 6 months</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>1,000 clinics in 18 months</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>National in 36 months</span>
          </div>
          <div className="mt-6 space-y-1">
            <p className="text-[14px] font-semibold text-[var(--ivory)]">Netcare Health OS Ops</p>
            <p className="text-[12px] text-[var(--text-secondary)]">Netcare Technology (Pty) Ltd</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">partnerships@visiohealth.co.za</p>
          </div>
        </motion.div>
      </div>
    </SlideShell>
  );
}
