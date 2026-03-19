"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

// ─── Publications ────────────────────────────────────────
const publications = [
  {
    id: "vrl-001",
    date: "March 2026",
    title:
      "The Routing Crisis: Preventable Deaths from Healthcare System Navigation Failures in South Africa",
    authors: "Netcare Technology",
    abstract:
      "A comprehensive analysis of 120+ peer-reviewed sources examining how failures in healthcare system navigation — from misrouted referrals to fragmented patient pathways — contribute to preventable mortality across South Africa's public and private healthcare sectors.",
    categories: ["Digital Health", "Public Health", "Health Systems"],
    status: "published" as const,
    citations: "120+",
    href: "/research/vrl-001",
  },
  {
    id: "vrl-002",
    date: "Q2 2026",
    title:
      "AI Triage Accuracy in Low-Resource Settings: A Systematic Review",
    authors: "Netcare Technology",
    abstract:
      "A systematic review evaluating the diagnostic accuracy and clinical safety of AI-powered triage systems deployed in low-resource healthcare environments across sub-Saharan Africa.",
    categories: ["AI in Healthcare", "Clinical Safety", "Systematic Review"],
    status: "in-progress" as const,
    citations: null,
    href: null,
  },
  {
    id: "vrl-003",
    date: "Q3 2026",
    title:
      "The Economic Case for Digital Patient Routing in Sub-Saharan Africa",
    authors: "Netcare Technology",
    abstract:
      "An economic analysis quantifying the cost savings and efficiency gains achievable through digital patient routing systems in sub-Saharan African healthcare networks.",
    categories: ["Health Economics", "Digital Health", "Policy"],
    status: "planned" as const,
    citations: null,
    href: null,
  },
  {
    id: "vrl-004",
    date: "Q3 2026",
    title:
      "WhatsApp as Healthcare Infrastructure: Lessons from South African Deployments",
    authors: "Netcare Technology",
    abstract:
      "An examination of WhatsApp-based healthcare delivery models in South Africa — analyzing patient engagement, clinical outcomes, and scalability lessons from real-world deployments.",
    categories: ["mHealth", "Patient Engagement", "Case Study"],
    status: "planned" as const,
    citations: null,
    href: null,
  },
];

// ─── Research Areas ──────────────────────────────────────
const researchAreas = [
  {
    title: "Market Structure Research",
    description:
      "Mapping the competitive landscape, payer ecosystems, and referral networks across South African healthcare verticals.",
  },
  {
    title: "Buyer & Demand Research",
    description:
      "Understanding patient acquisition costs, decision journeys, and demand signals in private and public healthcare.",
  },
  {
    title: "Company Intelligence",
    description:
      "Deep profiling of healthcare groups, hospital networks, and practice management companies operating in Africa.",
  },
  {
    title: "Product & Workflow Research",
    description:
      "Analyzing clinical workflows, admin bottlenecks, and technology adoption patterns to inform product development.",
  },
  {
    title: "Vertical Opportunity Research",
    description:
      "Identifying underserved healthcare verticals — dental, ENT, radiology, wellness — and sizing market opportunities.",
  },
  {
    title: "Commercialization Research",
    description:
      "Pricing strategy, go-to-market playbooks, and distribution channel analysis for healthcare SaaS in Africa.",
  },
];

const statusConfig = {
  published: {
    label: "Published",
    bg: "bg-[#F0F9FF]",
    text: "text-[#1D3443]",
    border: "border-[#BAE6FD]",
  },
  "in-progress": {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  planned: {
    label: "Planned",
    bg: "bg-gray-50",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};

export default function ResearchPage() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "vrl-research" }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubscribeStatus("success");
      setEmail("");
    } catch {
      setSubscribeStatus("error");
    }
  }

  return (
    <div className="bg-white">
      <Navbar />

      {/* ── 1. Hero (dark) ── */}
      <section className="pt-32 pb-20 relative" style={{ backgroundColor: "#030f0a" }}>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#3DA9D1] rounded-full blur-[300px] opacity-[0.06] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono mb-6"
          >
            Netcare Technology
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-light tracking-[-0.03em] text-white mb-6 leading-tight"
          >
            Research & Publications
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Original research from Netcare Technology — data-driven insights
            shaping the future of healthcare technology in Africa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-12"
          >
            {["Peer-Reviewed", "Open Access", "African-First"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-white/25 font-mono tracking-wider uppercase"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. Publications (white) ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Publications
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-gray-900">
              Research Papers
            </h2>
          </motion.div>

          <div className="space-y-6">
            {publications.map((pub, i) => {
              const status = statusConfig[pub.status];
              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BAE6FD] transition-all duration-300"
                >
                  {/* Top row: date + status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] text-gray-400 font-mono uppercase tracking-wider">
                      {pub.id} &middot; {pub.date}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${status.bg} ${status.text} ${status.border}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 leading-snug group-hover:text-[#1D3443] transition-colors">
                    {pub.href ? (
                      <Link href={pub.href}>{pub.title}</Link>
                    ) : (
                      pub.title
                    )}
                  </h3>

                  {/* Authors */}
                  <p className="text-[13px] text-gray-400 mb-3">{pub.authors}</p>

                  {/* Abstract */}
                  <p className="text-[14px] text-gray-500 leading-relaxed mb-4">
                    {pub.abstract}
                  </p>

                  {/* Bottom row: categories + citations + link */}
                  <div className="flex flex-wrap items-center gap-2">
                    {pub.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                      >
                        {cat}
                      </span>
                    ))}
                    {pub.citations && (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0F9FF] text-[#1D8AB5] border border-[#E0F2FE] font-medium">
                        {pub.citations} sources
                      </span>
                    )}
                    {pub.href && (
                      <Link
                        href={pub.href}
                        className="ml-auto text-[13px] font-medium text-[#1D8AB5] hover:text-[#1D3443] transition-colors"
                      >
                        Read paper &rarr;
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Newsletter Signup (dark) ── */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "#030f0a" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono block mb-4">
              Stay Updated
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white mb-4">
              Subscribe to VRL Research
            </h2>
            <p className="text-[15px] text-white/40 max-w-lg mx-auto leading-relaxed mb-10">
              Be the first to receive our research papers, market intelligence,
              and healthcare insights.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/25 text-[14px] focus:outline-none focus:border-[#3DA9D1]/40 transition-colors"
              />
              <button
                type="submit"
                disabled={subscribeStatus === "loading"}
                className="px-6 py-3 rounded-xl bg-[#1D8AB5] hover:bg-[#3DA9D1] text-white text-[14px] font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {subscribeStatus === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            {subscribeStatus === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-[13px] text-[#3DA9D1]"
              >
                Subscribed successfully. Welcome to VRL Research.
              </motion.p>
            )}
            {subscribeStatus === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-[13px] text-red-400"
              >
                Something went wrong. Please try again.
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 4. Research Areas (off-white) ── */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Focus Areas
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-gray-900 mb-4">
              VRL Research Pillars
            </h2>
            <p className="text-[15px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              Six research pillars that drive our understanding of African
              healthcare markets and inform every product we build.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {researchAreas.map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BAE6FD] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-4 group-hover:bg-[#E0F2FE] transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3DA9D1] group-hover:bg-[#3DA9D1] transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[15px] group-hover:text-[#1D8AB5] transition-colors">
                  {area.title}
                </h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  {area.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer row ── */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1]" />
            <span className="text-[13px] text-gray-400 font-mono">
              Netcare Technology — Johannesburg, South Africa
            </span>
          </div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
