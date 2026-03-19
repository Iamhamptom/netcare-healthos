"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import dynamic from "next/dynamic";
import MarketDonutChart from "@/components/ecosystem/MarketDonutChart";

const JessPresenter = dynamic(() => import("@/components/voice-agent/JessPresenter"), { ssr: false });

const jessSections = [
  {
    id: "eco-hero",
    label: "The Vision",
    color: "#10b981",
    narration: "Welcome to the Netcare Health OS Ecosystem! I'm really glad you're here, because what you're about to see is something truly special. This isn't just a healthcare app — this is the entire operating system for healthcare in Africa. We're talking about a two hundred and fifty-nine billion dollar market that's growing eight percent every year, and right now, most of it still runs on paper, phone calls, and fax machines. There are over seventy-three thousand private practitioners in South Africa alone, and WhatsApp has ninety-eight percent penetration in the country. We built on what people already use. That's the foundation of everything you're about to see.",
  },
  {
    id: "eco-market",
    label: "Market Opportunity",
    color: "#3b82f6",
    narration: "Let me share the numbers with you, because they tell an incredible story. Africa's healthcare market is two hundred and fifty-nine billion dollars and growing rapidly. South Africa has the most sophisticated private healthcare system on the continent, with over seventy-three thousand practitioners. But here's the shocking part — eighty-four percent of South Africans rely on overcrowded public facilities, while only sixteen percent have private medical aid. That gap is massive, and it represents an enormous opportunity to bring modern, AI-powered tools to the practices that serve millions of people. The market is there. The need is urgent. And nobody else is building what we're building.",
  },
  {
    id: "eco-problem",
    label: "The Problem",
    color: "#ef4444",
    narration: "Now let me paint you a picture of what healthcare looks like on the ground in South Africa today. Most private practices still manage their patients with paper files and phone calls. Booking is done manually. Reminders are inconsistent or don't happen at all. Claims get rejected because of incorrect ICD-10 codes. Practices lose fifteen to twenty-five percent of their revenue to no-shows alone. And with twenty-seven percent of South African-trained doctors emigrating, the ones who stay need to do more with less. Load shedding means desktop software crashes and data is lost. POPIA compliance requires audit logs and consent tracking that paper can never provide. This is the reality — and this is exactly what we're solving.",
  },
  {
    id: "eco-products",
    label: "Product Ecosystem",
    color: "#10b981",
    narration: "This is my favourite part! Netcare Health OS isn't one product — it's six products that work together as a complete ecosystem. First, Netcare Health OS Ops — the core platform that runs your entire practice with AI-powered WhatsApp bookings, medical records, billing, and POPIA compliance. Then Placeo Health — a patient marketplace where people find practices near them, compare reviews, and book via WhatsApp. Visio Health Integrator is our enterprise middleware that connects to every existing healthcare system — GoodX, Healthbridge, hospital HL7 systems. Visio Waiting Room reimagines check-in with WhatsApp — patients wait in their car, fill forms on their phone, and get called when the doctor is ready. VisioMed AI is the doctor's co-pilot — auto ICD-10 coding, drug interaction checks, diagnostic pattern flagging. And Payer Connect coordinates the entire relationship between providers and funders. Six products, one patient journey, one ecosystem. That's the power of what we've built.",
  },
  {
    id: "eco-competitive",
    label: "Competition",
    color: "#8b5cf6",
    narration: "Let me be honest about the competitive landscape, because this is where our advantage becomes really clear. GoodX is desktop software — no AI, no WhatsApp, clunky interface, and they charge three to eight thousand Rand a month for it. Healthbridge focuses on claims processing but has very limited practice management and no patient engagement. Elixir Health is basic cloud practice management with no AI whatsoever. None of them — not a single one — does AI plus WhatsApp plus full practice management plus POPIA compliance together. We're the only full-stack solution in the market. And here's the thing — when you compare us to global players, Zocdoc was valued at over two billion dollars doing marketplace only in the US. MuleSoft sold for six and a half billion doing enterprise middleware. We're building both of those and more, specifically for the world's fastest-growing healthcare market. That's our position.",
  },
  {
    id: "eco-expansion",
    label: "Global Expansion",
    color: "#a855f7",
    narration: "Our expansion strategy is deliberate and ambitious. Phase one is South Africa — we prove the model in the most sophisticated private healthcare market in Africa. Seventy-three thousand practitioners, strong digital infrastructure, WhatsApp-native population. Phase two takes us across Sub-Saharan Africa — Nigeria with two hundred million people and only forty thousand doctors, Kenya, Ghana, Egypt. The same problems exist there, but the infrastructure is even worse, which makes our WhatsApp-first approach even more relevant. Phase three is the global play — India, Southeast Asia, Latin America. Massive private healthcare markets with similar fragmentation. And phase four is becoming the global standard for healthcare operations. The playbook scales because the problems are universal. We're not just building for South Africa. We're building the operating system for healthcare on the entire African continent, and beyond.",
  },
  {
    id: "eco-thesis",
    label: "Investment Thesis",
    color: "#10b981",
    narration: "Here's why this is a multi-billion dollar opportunity, and I want you to really feel the scale of what we're describing. A single practice could pay thirty thousand to over a hundred thousand Rand per month with the full product stack. One hundred practices gives you three to ten million Rand in monthly recurring revenue. One thousand practices across Africa — thirty to a hundred million Rand MRR. At ten thousand practices, this is a billion-plus Rand MRR business. That's over twelve billion Rand in annual recurring revenue. The ecosystem creates compounding network effects and massive switching costs. Every new practice makes the marketplace more valuable. Every new connection makes the integrator stickier. Every new consultation makes the AI smarter. This isn't a point solution that gets disrupted. This is infrastructure that becomes more valuable over time. Africa-first, then global. That's the thesis.",
  },
  {
    id: "eco-cta",
    label: "Join Us",
    color: "#10b981",
    narration: "So there you have it — the complete Netcare Health OS ecosystem. Six products, one vision, one unstoppable platform. Whether you're a healthcare provider looking to transform your practice, an investor looking for the next generational opportunity in African tech, or a partner who wants to build the future of healthcare with us — we'd absolutely love to connect. This is just the beginning, and the best is truly yet to come. Thank you so much for taking the time to explore what we're building. It means the world to us.",
  },
];
import ProblemBarChart from "@/components/ecosystem/ProblemBarChart";
import CompetitiveRadar from "@/components/ecosystem/CompetitiveRadar";
import RevenueGrowthChart from "@/components/ecosystem/RevenueGrowthChart";
import EcosystemOrbit from "@/components/ecosystem/EcosystemOrbit";
import ExpansionMap from "@/components/ecosystem/ExpansionMap";

/* ─── Animation helpers ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ─── Data ─── */

const marketStats = [
  { value: "$259B", label: "Africa healthcare market", sub: "growing 8% annually" },
  { value: "73,000+", label: "Private practitioners in SA", sub: "mostly still on paper" },
  { value: "98%", label: "WhatsApp penetration", sub: "23M daily users in SA" },
  { value: "84%", label: "Use public healthcare", sub: "SA's two-tier crisis" },
];

const products = [
  {
    name: "Netcare Health OS Ops",
    tagline: "The operating system.",
    description:
      "The core platform — AI-powered practice management that runs your entire operation. WhatsApp bookings, medical records, billing with ICD-10 codes, staff management, patient recall, POPIA compliance. Everything a practice needs, in one system.",
    investorAngle:
      "The anchor product. R7.5K–R30K/month per practice. Every other product in the ecosystem plugs into this. First-mover advantage in AI-first healthcare PM for Africa.",
    metrics: ["WhatsApp AI", "Full PM suite", "POPIA compliant", "5-min setup"],
    revenue: "R7.5K–R30K/mo",
    tam: "R5.5B+ (SA alone)",
    color: "#10b981",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    status: "Live",
  },
  {
    name: "Placeo Health",
    tagline: "Find. Compare. Book.",
    description:
      "The healthcare marketplace for Africa. Patients discover practices near them, compare ratings, read reviews, and book via WhatsApp. Every Netcare Health OS practice auto-listed. The network effect — more practices means more patients, means more practices.",
    investorAngle:
      "Captures the demand side. Booking fees + featured listings + patient acquisition leads. At scale, this becomes the Google Maps of African healthcare — the default entry point for 1.4 billion people seeking care.",
    metrics: ["Location search", "Instant WhatsApp booking", "Review system", "Auto-listings"],
    revenue: "Booking fees + ads",
    tam: "$4B+ (marketplace)",
    color: "#10b981",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    status: "2026",
  },
  {
    name: "Visio Health Integrator",
    tagline: "Connect anything. Break nothing.",
    description:
      "Enterprise middleware that bridges Netcare Health OS to every existing healthcare system — GoodX, Healthbridge, hospital HL7/FHIR, labs, radiology PACS, pharmacy dispensing. The universal healthcare API for Africa. Once connected, switching costs are massive.",
    investorAngle:
      "This is the moat. Per-connection licensing + data throughput fees + enterprise SaaS. MuleSoft sold for $6.5B solving this for general enterprise — we're solving it for the $259B African healthcare market specifically.",
    metrics: ["HL7/FHIR bridge", "GoodX connector", "Lab systems", "Universal API"],
    revenue: "Per-connection SaaS",
    tam: "$2B+ (health IT)",
    color: "#8b5cf6",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.915-3.173a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
      </svg>
    ),
    status: "2027",
  },
  {
    name: "Visio Waiting Room",
    tagline: "The waiting room, reimagined.",
    description:
      "Digital-first check-in via WhatsApp. Patients check in from their car, see live queue position, complete intake forms on their phone, get called when the doctor is ready. Zero crowding. Zero clipboards. Post-COVID, this is what patients demand.",
    investorAngle:
      "The Trojan horse. Standalone at R2,500/month — an easy first sale to practices not ready for full Netcare Health OS. Viral loop: patients experience it and demand it from their OTHER doctors. Land-and-expand at its finest.",
    metrics: ["WhatsApp check-in", "Live queue", "Digital intake", "Zero crowding"],
    revenue: "R2.5K/mo standalone",
    tam: "R900M+ (SA)",
    color: "#06b6d4",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    status: "2026",
  },
  {
    name: "VisioMed AI",
    tagline: "The doctor's AI co-pilot.",
    description:
      "Clinical decision support that transforms how doctors work. Auto-suggests ICD-10 codes from consultation notes, checks drug interactions in real-time, flags diagnostic patterns, generates referral letters. Trained on South African clinical guidelines. Every consultation makes it smarter.",
    investorAngle:
      "Premium pricing: R5K–R15K/month addon. Reduces medical errors, speeds consultations by 30%, improves claim accuracy (directly impacts practice revenue). The data flywheel means the AI improves with every consultation — compounding competitive advantage.",
    metrics: ["Auto ICD-10 coding", "Drug interactions", "Clinical AI", "SA guidelines"],
    revenue: "R5K–R15K/mo addon",
    tam: "$8B+ (clinical AI)",
    color: "#f59e0b",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    status: "2027",
  },
];

const expansionPhases = [
  {
    phase: "Phase 1",
    region: "South Africa",
    timeline: "2026",
    description: "73,000+ private practitioners. Most sophisticated private healthcare market in Africa. WhatsApp-native population. Prove the model here.",
    markets: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"],
    practitioners: "73,000+",
    opportunity: "R250B+ market",
    status: "active",
  },
  {
    phase: "Phase 2",
    region: "Sub-Saharan Africa",
    timeline: "2027–2028",
    description: "Nigeria (200M people, 40K doctors), Kenya, Ghana, Egypt. Same problems — worse infrastructure. WhatsApp-first is even more relevant where internet is spotty.",
    markets: ["Nigeria", "Kenya", "Ghana", "Egypt"],
    practitioners: "200,000+",
    opportunity: "$45B+ market",
    status: "planned",
  },
  {
    phase: "Phase 3",
    region: "Emerging Markets",
    timeline: "2028–2029",
    description: "India, Southeast Asia, Latin America — massive private healthcare markets with similar fragmentation. The playbook that works in Africa works globally.",
    markets: ["India", "Indonesia", "Brazil", "Mexico"],
    practitioners: "2M+",
    opportunity: "$180B+ market",
    status: "vision",
  },
  {
    phase: "Phase 4",
    region: "Global Platform",
    timeline: "2030+",
    description: "The healthcare operating system for the world. Regulatory frameworks for EU, UK, US. Enterprise partnerships. Public health infrastructure contracts.",
    markets: ["European Union", "United Kingdom", "United States", "Middle East"],
    practitioners: "10M+",
    opportunity: "$259B+ Africa + Global",
    status: "vision",
  },
];

const competitorComparison = [
  { feature: "AI-powered automation", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "WhatsApp-native", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "Full practice management", us: true, goodx: true, healthbridge: false, elixir: true },
  { feature: "POPIA compliance built-in", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "Patient marketplace", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "Clinical AI co-pilot", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "Enterprise integrations (HL7/FHIR)", us: true, goodx: false, healthbridge: true, elixir: false },
  { feature: "Digital waiting room", us: true, goodx: false, healthbridge: false, elixir: false },
  { feature: "Cloud-native (no local server)", us: true, goodx: false, healthbridge: true, elixir: true },
  { feature: "Multi-language support", us: true, goodx: false, healthbridge: false, elixir: false },
];

const revenueModel = [
  { product: "Netcare Health OS Ops", low: 7500, high: 30000, unit: "per practice/mo" },
  { product: "Placeo Health", low: 500, high: 5000, unit: "per listing/mo" },
  { product: "Visio Integrator", low: 15000, high: 50000, unit: "per connection/mo" },
  { product: "Waiting Room", low: 2500, high: 5000, unit: "per practice/mo" },
  { product: "VisioMed AI", low: 5000, high: 15000, unit: "per doctor/mo" },
];

/* ─── Page ─── */

export default function EcosystemPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // Still show success
    }
    setSubmitting(false);
    setSubmitted(true);
    setEmail("");
  }

  return (
    <main className="min-h-screen bg-[#1D3443] text-white">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — The Vision
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-hero" className="relative pt-40 pb-32 md:pt-48 md:pb-40 overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[#3DA9D1]/[0.04] rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/[0.03] rounded-full blur-[180px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[150px]" />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-6">
              The Ecosystem
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[-0.04em] leading-[0.95] mb-8">
              One platform.
              <br />
              <span className="text-[#3DA9D1]">Five products.</span>
              <br />
              A billion patients.
            </h1>
            <p className="text-lg md:text-xl text-white/35 font-light leading-relaxed max-w-2xl mb-12">
              Netcare Health OS isn&apos;t a single product — it&apos;s a healthcare operating
              system designed to capture every layer of the value chain, from patient
              discovery to clinical decision-making. Built for Africa. Scaling globally.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#3DA9D1] text-white text-sm font-mono hover:bg-[#3DA9D1] transition-all duration-300 shadow-lg shadow-[#3DA9D1]/20"
              >
                Start Free Trial
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#products"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white/50 text-sm font-mono hover:border-white/20 hover:text-white/70 transition-all duration-300"
              >
                Explore Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MARKET OPPORTUNITY — The Numbers
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-market" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              Market Opportunity
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-4">
              The numbers speak for themselves
            </h2>
            <p className="text-base text-white/30 font-light max-w-xl mx-auto">
              Africa&apos;s healthcare market is massive, fragmented, and desperate for digitization.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {marketStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="relative text-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] group hover:border-[#3DA9D1]/10 hover:bg-[#3DA9D1]/[0.02] transition-all duration-500"
              >
                <div className="text-4xl md:text-5xl font-extralight text-[#3DA9D1] mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 font-mono mb-1">{stat.label}</div>
                <div className="text-[11px] text-white/20 font-mono">{stat.sub}</div>
                {/* Animated accent bar */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#3DA9D1]/40 to-transparent"
                  initial={{ width: 0 }}
                  whileInView={{ width: "60%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Market Breakdown Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#3DA9D1] animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
                Market Breakdown
              </span>
            </div>
            <h3 className="text-xl font-light text-white mb-1">Africa Healthcare Market Distribution</h3>
            <p className="text-[12px] font-mono text-white/25 mb-8">
              Where the $259B flows — and where digital health captures the fastest-growing segment
            </p>
            <MarketDonutChart />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROBLEM — Why This Exists
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-problem" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Crisis vs Impact Infographic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-red-400/60 uppercase mb-4">
              The Problem &amp; The Solution
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-4">
              Healthcare in Africa — <span className="text-red-400/80">crisis</span> meets <span className="text-[#3DA9D1]">opportunity</span>
            </h2>
          </motion.div>

          <ProblemBarChart />

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-red-400/60 uppercase mb-4">
                The Problem
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] mb-6">
                Healthcare in Africa is broken at every layer
              </h2>
              <p className="text-base text-white/35 font-light leading-relaxed mb-8">
                84% of South Africans rely on overcrowded public facilities. Private practices
                still run on paper, fax machines, and phone calls. Patients can&apos;t find doctors.
                Doctors can&apos;t find patients. And the systems that exist don&apos;t talk to each other.
              </p>
              <div className="space-y-4">
                {[
                  { stat: "27%", text: "of SA-trained doctors leave the country — brain drain is accelerating" },
                  { stat: "15–25%", text: "of practice revenue lost to no-shows and admin inefficiency" },
                  { stat: "80+", text: "medical aid schemes in SA, each with different rules and codes" },
                  { stat: "11", text: "official languages — patients struggle to communicate with practices" },
                ].map((item) => (
                  <div key={item.stat} className="flex items-start gap-4">
                    <span className="text-lg font-light text-red-400/80 font-mono w-16 shrink-0 text-right">{item.stat}</span>
                    <span className="text-sm text-white/40 font-light leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
                Our Answer
              </span>
              <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] mb-6">
                WhatsApp + AI + Africa-first
              </h2>
              <p className="text-base text-white/35 font-light leading-relaxed mb-8">
                We didn&apos;t build another desktop app and hope Africa adopts it.
                We built on WhatsApp — the platform 98% of South Africans already live on.
                Then we added AI that actually understands the South African healthcare system:
                ICD-10 coding, medical aid rules, POPIA compliance, and 11 languages.
              </p>
              <div className="space-y-4">
                {[
                  { stat: "98%", text: "WhatsApp penetration — we build on what people already use" },
                  { stat: "60%", text: "reduction in no-shows with WhatsApp appointment reminders" },
                  { stat: "5 min", text: "setup time — register, import patients, you're live" },
                  { stat: "24/7", text: "AI receptionist never sleeps, never calls in sick, never quits" },
                ].map((item) => (
                  <div key={item.stat} className="flex items-start gap-4">
                    <span className="text-lg font-light text-[#3DA9D1]/80 font-mono w-16 shrink-0 text-right">{item.stat}</span>
                    <span className="text-sm text-white/40 font-light leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRODUCTS — The Ecosystem
      ═══════════════════════════════════════════════════════════ */}
      <section id="products" data-jess="eco-products" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#3DA9D1]/[0.03] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              Five Products, One Ecosystem
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-4">
              Every layer of healthcare, covered
            </h2>
            <p className="text-base text-white/30 font-light max-w-2xl mx-auto">
              One patient journey, five products: Placeo discovers → Netcare Health OS manages →
              Waiting Room checks in → VisioMed assists the doctor → Integrator connects everything.
            </p>
          </motion.div>

          {/* Ecosystem Orbit Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mb-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
          >
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
                Network Effect
              </span>
              <p className="text-[12px] font-mono text-white/25 mt-1">
                Every product strengthens the others — hover to explore connections
              </p>
            </div>
            <EcosystemOrbit />
          </motion.div>

          {/* Patient journey flow */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 md:gap-4 flex-wrap mb-16 py-6"
          >
            {["Patient searches", "→", "Finds practice", "→", "Checks in", "→", "Sees doctor", "→", "System syncs"].map((step, i) => (
              <span
                key={i}
                className={`text-[11px] md:text-[12px] font-mono ${
                  step === "→" ? "text-[#3DA9D1]/40" : "text-white/30 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {step}
              </span>
            ))}
          </motion.div>

          {/* Product cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-6"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product.name}
                variants={fadeUp}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${product.color}40, transparent)` }} />

                <div className="p-8 md:p-10 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left — Product info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${product.color}15`, color: product.color }}
                        >
                          {product.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-light text-white">{product.name}</h3>
                            <span
                              className={`text-[10px] font-mono tracking-[0.15em] uppercase px-3 py-1 rounded-full border ${
                                product.status === "Live"
                                  ? "text-[#3DA9D1] border-[#3DA9D1]/20 bg-[#3DA9D1]/5"
                                  : "text-white/30 border-white/[0.06]"
                              }`}
                            >
                              {product.status}
                            </span>
                          </div>
                          <p className="text-[13px] font-mono text-white/30">{product.tagline}</p>
                        </div>
                      </div>

                      <p className="text-[15px] text-white/45 font-light leading-relaxed mb-6">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {product.metrics.map((m) => (
                          <span
                            key={m}
                            className="text-[11px] font-mono text-white/25 px-3 py-1.5 rounded-full border border-white/[0.06]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right — Investor angle */}
                    <div className="lg:border-l lg:border-white/[0.04] lg:pl-8">
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-6 h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-3.5 h-3.5 text-[#3DA9D1]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                          </svg>
                          <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#3DA9D1]/50">
                            Investor Angle
                          </span>
                        </div>
                        <p className="text-[13px] text-white/35 leading-relaxed mb-4">
                          {product.investorAngle}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                          <div>
                            <div className="text-[10px] font-mono text-white/20 uppercase mb-0.5">Revenue</div>
                            <div className="text-[13px] font-mono text-white/50">{product.revenue}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-white/20 uppercase mb-0.5">TAM</div>
                            <div className="text-[13px] font-mono text-[#3DA9D1]/60">{product.tam}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product number */}
                <div className="absolute top-8 right-8 text-[80px] md:text-[100px] font-extralight text-white/[0.02] leading-none select-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Revenue stacking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 rounded-2xl border border-[#3DA9D1]/10 bg-[#3DA9D1]/[0.03] p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3DA9D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-light text-white">Revenue Stacking Per Practice</h3>
                <p className="text-[12px] font-mono text-white/30">Full ecosystem adoption = R30K–R105K/month per practice</p>
              </div>
            </div>
            <div className="space-y-3">
              {revenueModel.map((item) => {
                const maxHigh = Math.max(...revenueModel.map((r) => r.high));
                const widthPercent = (item.high / maxHigh) * 100;
                return (
                  <div key={item.product} className="flex items-center gap-4">
                    <span className="text-[12px] font-mono text-white/40 w-40 shrink-0 text-right">{item.product}</span>
                    <div className="flex-1 h-8 rounded-lg bg-white/[0.03] overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${widthPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-lg bg-gradient-to-r from-[#3DA9D1]/30 to-[#3DA9D1]/10 flex items-center px-3"
                      >
                        <span className="text-[11px] font-mono text-[#3DA9D1]/80 whitespace-nowrap">
                          R{(item.low / 1000).toFixed(1)}K – R{(item.high / 1000).toFixed(0)}K
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-[10px] font-mono text-white/20 w-28 shrink-0">{item.unit}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
                <span className="text-[12px] font-mono text-[#3DA9D1] w-40 shrink-0 text-right font-medium">Total Per Practice</span>
                <div className="flex-1">
                  <span className="text-lg font-light text-[#3DA9D1]">R30,500 – R105,000</span>
                  <span className="text-[12px] font-mono text-white/30 ml-2">/month</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-light text-white">100 practices</div>
                <div className="text-[12px] font-mono text-white/30">= R3M–R10.5M MRR</div>
              </div>
              <div>
                <div className="text-2xl font-light text-white">1,000 practices</div>
                <div className="text-[12px] font-mono text-white/30">= R30M–R105M MRR</div>
              </div>
              <div>
                <div className="text-2xl font-light text-[#3DA9D1]">10,000 practices</div>
                <div className="text-[12px] font-mono text-[#3DA9D1]/50">= R300M–R1B+ MRR</div>
              </div>
            </div>
          </motion.div>

          {/* Revenue Growth Trajectory Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[#3DA9D1]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
                Growth Trajectory
              </span>
            </div>
            <h3 className="text-lg font-light text-white mb-1">MRR Projection — Seed to Global Scale</h3>
            <p className="text-[12px] font-mono text-white/25 mb-6">
              Conservative (dashed) vs. optimistic (solid) — hover milestones for detail
            </p>
            <RevenueGrowthChart />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMPETITIVE LANDSCAPE
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-competitive" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              Competitive Landscape
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-4">
              No one else does all of this
            </h2>
            <p className="text-base text-white/30 font-light max-w-xl mx-auto">
              Existing players solve one piece. We&apos;re building the whole stack.
            </p>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 mb-8"
          >
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
                Feature Coverage Radar
              </span>
              <p className="text-[12px] font-mono text-white/25 mt-1">
                Click competitors to compare — the gap is the opportunity
              </p>
            </div>
            <CompetitiveRadar />
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-[12px] font-mono text-white/40 uppercase tracking-wider p-5 w-[260px]">Feature</th>
                    <th className="text-center text-[12px] font-mono text-[#3DA9D1] uppercase tracking-wider p-5">
                      Netcare Health OS
                    </th>
                    <th className="text-center text-[12px] font-mono text-white/30 uppercase tracking-wider p-5">GoodX</th>
                    <th className="text-center text-[12px] font-mono text-white/30 uppercase tracking-wider p-5">Healthbridge</th>
                    <th className="text-center text-[12px] font-mono text-white/30 uppercase tracking-wider p-5">Elixir</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorComparison.map((row, i) => (
                    <tr key={row.feature} className={i < competitorComparison.length - 1 ? "border-b border-white/[0.03]" : ""}>
                      <td className="text-[13px] text-white/50 font-light p-5">{row.feature}</td>
                      <td className="text-center p-5">
                        {row.us ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-[#3DA9D1]/10 items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-[#3DA9D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-white/10">—</span>
                        )}
                      </td>
                      <td className="text-center p-5">
                        {row.goodx ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-white/5 items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-white/10">—</span>
                        )}
                      </td>
                      <td className="text-center p-5">
                        {row.healthbridge ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-white/5 items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-white/10">—</span>
                        )}
                      </td>
                      <td className="text-center p-5">
                        {row.elixir ? (
                          <span className="inline-flex w-6 h-6 rounded-full bg-white/5 items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-white/10">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GLOBAL EXPANSION — The Roadmap
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-expansion" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/3 w-[800px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-purple-400/60 uppercase mb-4">
              Global Expansion
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em] mb-4">
              Built for Africa. Scaling globally.
            </h2>
            <p className="text-base text-white/30 font-light max-w-xl mx-auto">
              The playbook that works in South Africa works everywhere healthcare is fragmented.
            </p>
          </motion.div>

          {/* Interactive Expansion Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <ExpansionMap />
          </motion.div>

          {/* Phase details */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="space-y-6"
          >
            {expansionPhases.map((phase) => (
              <motion.div
                key={phase.phase}
                variants={fadeUp}
                className={`relative rounded-2xl border p-8 md:p-10 transition-all duration-500 ${
                  phase.status === "active"
                    ? "border-[#3DA9D1]/20 bg-[#3DA9D1]/[0.04]"
                    : phase.status === "planned"
                    ? "border-purple-400/10 bg-purple-400/[0.02]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[11px] font-mono tracking-[0.2em] uppercase px-3 py-1 rounded-full border ${
                        phase.status === "active"
                          ? "text-[#3DA9D1] border-[#3DA9D1]/20"
                          : phase.status === "planned"
                          ? "text-purple-400 border-purple-400/20"
                          : "text-white/30 border-white/[0.06]"
                      }`}>
                        {phase.phase}
                      </span>
                      <span className="text-[11px] font-mono text-white/20">{phase.timeline}</span>
                    </div>
                    <h3 className="text-2xl font-light text-white">{phase.region}</h3>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-[14px] text-white/40 font-light leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {phase.markets.map((m) => (
                        <span key={m} className="text-[11px] font-mono text-white/25 px-3 py-1 rounded-full border border-white/[0.06]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-mono text-white/20 uppercase mb-1">Practitioners</div>
                    <div className="text-lg font-light text-white/60 mb-2">{phase.practitioners}</div>
                    <div className="text-[10px] font-mono text-white/20 uppercase mb-1">Opportunity</div>
                    <div className={`text-lg font-light ${
                      phase.status === "active" ? "text-[#3DA9D1]" : "text-white/40"
                    }`}>{phase.opportunity}</div>
                  </div>
                </div>

                {phase.status === "active" && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3DA9D1] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#3DA9D1]/60">Active</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE THESIS — Why Now
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-thesis" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-amber-400/60 uppercase mb-4">
              The Thesis
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-[-0.03em]">
              Why this. Why now. Why us.
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Why this",
                color: "emerald",
                points: [
                  "Healthcare is 17% of global GDP — the largest industry on Earth",
                  "Africa is the fastest-growing healthcare market at 8% annually",
                  "Private healthcare in Africa is fragmented across 200,000+ practitioners with no dominant digital platform",
                  "WhatsApp is the internet in Africa — 98% penetration vs 30% for traditional apps",
                ],
              },
              {
                title: "Why now",
                color: "purple",
                points: [
                  "AI capabilities just crossed the threshold for clinical-grade automation",
                  "Post-COVID, patients demand digital-first healthcare experiences",
                  "African governments are mandating digital health records (SA NHI, Nigeria NHIA)",
                  "Mobile payment infrastructure (M-Pesa, Yoco) makes SaaS billing viable across Africa",
                ],
              },
              {
                title: "Why us",
                color: "amber",
                points: [
                  "Hampton Group Africa — operating across healthcare, music, and technology in Africa",
                  "Built by people who understand African infrastructure constraints (load shedding, bandwidth, language)",
                  "WhatsApp-native architecture — not an afterthought bolted onto a Western product",
                  "Five-product ecosystem creates compounding network effects and switching costs no point solution can match",
                ],
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10"
              >
                <h3 className={`text-2xl font-light mb-6 ${
                  card.color === "emerald" ? "text-[#3DA9D1]" :
                  card.color === "purple" ? "text-purple-400" : "text-amber-400"
                }`}>{card.title}</h3>
                <div className="space-y-4">
                  {card.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                        card.color === "emerald" ? "bg-[#3DA9D1]/40" :
                        card.color === "purple" ? "bg-purple-400/40" : "bg-amber-400/40"
                      }`} />
                      <p className="text-[13px] text-white/40 font-light leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Join the Movement
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="eco-cta" className="relative py-32 md:py-40 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#3DA9D1]/[0.05] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-6">
              Join the Movement
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] leading-tight mb-6">
              The healthcare operating system
              <br />
              <span className="text-[#3DA9D1]">Africa has been waiting for</span>
            </h2>
            <p className="text-base text-white/30 font-light leading-relaxed mb-12 max-w-xl mx-auto">
              Whether you&apos;re a practice owner, investor, or partner — the ecosystem is open.
              Start with Netcare Health OS Ops today, or talk to us about the bigger vision.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#3DA9D1] text-white text-sm font-mono hover:bg-[#3DA9D1] transition-all duration-300 shadow-lg shadow-[#3DA9D1]/20"
              >
                Start Free Trial
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/coming-soon"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-white/10 text-white/50 text-sm font-mono hover:border-white/20 hover:text-white/70 transition-all duration-300"
              >
                View Full Roadmap
              </Link>
            </div>

            {/* Newsletter */}
            <div className="max-w-md mx-auto">
              <p className="text-[12px] font-mono text-white/20 mb-4">Get investor updates and product launches</p>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-[#3DA9D1] font-mono text-sm py-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  You&apos;re on the list.
                </motion.div>
              ) : (
                <form onSubmit={handleNotify} className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/40 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-full bg-white/10 text-white/60 text-sm font-mono hover:bg-white/15 hover:text-white disabled:opacity-50 transition-all"
                  >
                    {submitting ? "..." : "Subscribe"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <JessPresenter sections={jessSections} />
      <Footer />
      <ChatbotWidget />
    </main>
  );
}
