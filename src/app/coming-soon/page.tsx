"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

type Status = "Beta" | "In Development" | "Planned" | "Research" | "Concept";

interface RoadmapItem {
  title: string;
  status: Status;
  description: string;
  timeline: string;
}

const statusStyles: Record<Status, string> = {
  Beta: "bg-[#F0F9FF] text-[#1D3443] border border-[#BAE6FD]",
  "In Development": "bg-blue-50 text-blue-700 border border-blue-200",
  Planned: "bg-amber-50 text-amber-700 border border-amber-200",
  Research: "bg-purple-50 text-purple-700 border border-purple-200",
  Concept: "bg-cyan-50 text-cyan-700 border border-cyan-200",
};

const roadmapItems: RoadmapItem[] = [
  {
    title: "AI Voice Receptionist",
    status: "In Development",
    description:
      "Full phone call handling with natural voice AI. Patients call, the AI answers, books appointments, and triages emergencies. Powered by ElevenLabs.",
    timeline: "Q2 2026",
  },
  {
    title: "Smart Recall Engine",
    status: "In Development",
    description:
      "Automated patient recall based on treatment history, overdue checkups, and predictive health analytics. WhatsApp + SMS + Email.",
    timeline: "Q2 2026",
  },
  {
    title: "Practice Analytics Dashboard",
    status: "Beta",
    description:
      "Real-time revenue analytics, patient flow optimization, no-show prediction, and staff utilization metrics.",
    timeline: "Live Q1 2026",
  },
  {
    title: "Multi-Location Support",
    status: "Planned",
    description:
      "Manage multiple practice locations from a single dashboard. Cross-location patient records, unified billing, and staff scheduling.",
    timeline: "Q3 2026",
  },
  {
    title: "Patient Portal",
    status: "Planned",
    description:
      "Self-service portal for patients to view appointments, pay invoices, access medical records, and communicate with their practice.",
    timeline: "Q3 2026",
  },
  {
    title: "AI Medical Coding",
    status: "Research",
    description:
      "Automated ICD-10 coding suggestions from consultation notes. Medical aid claim optimization and pre-authorization.",
    timeline: "Q4 2026",
  },
  {
    title: "Hospital Integration",
    status: "Research",
    description:
      "HL7/FHIR interoperability for hospital systems. Lab result imports, radiology report integration, referral management.",
    timeline: "2027",
  },
  {
    title: "African Language Support",
    status: "Research",
    description:
      "AI chatbot and voice support in Zulu, Xhosa, Sotho, Afrikaans, Swahili, and Yoruba. Making healthcare truly accessible.",
    timeline: "2027",
  },
];

interface NextLevelProduct {
  title: string;
  tagline: string;
  description: string;
  investorAngle: string;
  timeline: string;
  color: string;
}

const nextLevelProducts: NextLevelProduct[] = [
  {
    title: "Placeo Health",
    tagline: "Find. Compare. Book.",
    description: "A location-based healthcare marketplace. Patients discover practices near them, compare ratings and services, and book instantly via WhatsApp. Every Netcare Health OS practice becomes a listing automatically.",
    investorAngle: "Captures the demand side of the market. Revenue from booking fees, featured listings, and patient acquisition leads. The more practices on Netcare Health OS, the more valuable Placeo becomes — classic network effect.",
    timeline: "2026–2027",
    color: "#10b981",
  },
  {
    title: "Visio Health Integrator",
    tagline: "Connect anything. Break nothing.",
    description: "Enterprise middleware that bridges Netcare Health OS to existing healthcare systems — GoodX, Healthbridge, hospital HL7/FHIR, lab systems, radiology PACS, and pharmacy dispensing. The universal healthcare API for Africa.",
    investorAngle: "This is the moat. Once connected, switching costs are massive. Per-connection licensing + enterprise SaaS. Think MuleSoft for African healthcare — the plumbing layer every hospital needs.",
    timeline: "2027",
    color: "#8b5cf6",
  },
  {
    title: "Visio Waiting Room",
    tagline: "The waiting room, reimagined.",
    description: "Digital-first waiting experience. Patients check in from their car via WhatsApp, see live queue position, complete intake forms on their phone, and get called when ready. Zero crowding. Zero paper clipboards.",
    investorAngle: "Standalone at R2,500/month — an easy first sale that upsells to the full platform. Viral loop: patients experience it and ask their OTHER doctors why they don't have it.",
    timeline: "2026",
    color: "#06b6d4",
  },
  {
    title: "VisioMed AI",
    tagline: "The doctor's AI co-pilot.",
    description: "Clinical decision support: auto-suggests ICD-10 codes from consultation notes, checks drug interactions, flags diagnostic patterns, and generates referral letters. Trained on South African clinical guidelines.",
    investorAngle: "Premium addon (R5K–R15K/month). Reduces medical errors, speeds consultations by 30%, improves claim accuracy. Data flywheel: every consultation makes the AI smarter. This is where the real margin lives.",
    timeline: "2027",
    color: "#f59e0b",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
} as const;

export default function ComingSoonPage() {
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
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-[#1D3443] pt-32 pb-16 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#3DA9D1]/[0.04] blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/80 uppercase mb-6">
              Coming Soon
            </span>
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.1] mb-6">
              The future of
              <br />
              healthcare AI
            </h1>
            <p className="text-base md:text-lg text-white/60 font-light leading-relaxed max-w-2xl">
              We&apos;re building the next generation of tools to transform
              healthcare operations across Africa. Here&apos;s what&apos;s on
              our roadmap.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Roadmap Grid ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.3em] text-[#1D8AB5] uppercase mb-4">
              Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
              What we&apos;re building
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {roadmapItems.map((item) => (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Status badge */}
                <span
                  className={`absolute top-6 right-6 text-[11px] font-mono tracking-wide px-3 py-1 rounded-full ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>

                <h3 className="text-lg font-medium text-gray-900 pr-24 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-[12px] font-mono text-gray-400 tracking-wide">
                  <svg
                    className="w-3.5 h-3.5 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  {item.timeline}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Next-Level Products ── */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1] uppercase mb-4">
              Next-Level
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-3">
              The ecosystem is expanding
            </h2>
            <p className="text-sm text-gray-500 font-light max-w-xl">
              Four new products joining the Netcare Health OS platform — each capturing a different layer of the healthcare value chain.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {nextLevelProducts.map((product) => (
              <motion.div
                key={product.title}
                variants={cardVariants}
                className="relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: product.color }}
                  >
                    {product.title[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                    <p className="text-[12px] font-mono text-gray-400">{product.tagline}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500 font-light leading-relaxed mb-5">
                  {product.description}
                </p>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <svg className="w-3.5 h-3.5 text-[#3DA9D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    <span className="text-[11px] font-mono tracking-wide text-[#3DA9D1] uppercase">Investor Angle</span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{product.investorAngle}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {product.timeline}
                  </span>
                  <span className={`text-[11px] font-mono tracking-wide px-3 py-1 rounded-full ${statusStyles["Concept"]}`}>
                    Concept
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter / Stay Updated ── */}
      <section className="bg-[#1D3443] py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-lg mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-4">
              Stay in the loop
            </h2>
            <p className="text-sm text-white/60 font-light leading-relaxed mb-10">
              Get notified when new features launch.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2 text-[#3DA9D1] font-mono text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Thanks! We&apos;ll keep you posted.
              </motion.div>
            ) : (
              <form
                onSubmit={handleNotify}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@practice.co.za"
                  required
                  className="flex-1 w-full sm:w-auto px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/70 focus:outline-none focus:border-[#3DA9D1]/40 transition-colors duration-300"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#1D8AB5] text-white text-sm font-mono tracking-wide hover:bg-[#3DA9D1] disabled:opacity-50 transition-colors duration-300"
                >
                  {submitting ? "..." : "Notify Me"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </main>
  );
}
