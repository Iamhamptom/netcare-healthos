"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { blurPlaceholders } from "@/lib/blur-placeholders";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

const values = [
  {
    title: "Network-Wide Intelligence",
    description:
      "Purpose-built for Netcare Primary Healthcare — 88 clinics, one unified command center for claims, billing, and operations.",
  },
  {
    title: "Financial-First Design",
    description:
      "Every feature is designed for the Financial Director's desk. Claims recovery, revenue tracking, cost reduction — the metrics that matter.",
  },
  {
    title: "AI That Actually Works",
    description:
      "Our AI validates claims before submission, predicts rejections, and identifies revenue leaks across the entire network.",
  },
  {
    title: "Compliance Built In",
    description:
      "POPIA, HPCSA, and CPA compliance tracking across every clinic — automated audits, consent management, and data protection.",
  },
];

const aiCapabilities = [
  {
    title: "Signal Lead Gen Agent",
    description:
      "Scans the market to identify high-intent prospects who need healthcare services in your area.",
  },
  {
    title: "Outreach Automation Agent",
    description:
      "Multi-channel outreach via WhatsApp, SMS, and automated calls — personalized messages at scale.",
  },
  {
    title: "Booking & Calendar Agent",
    description:
      "Manages your entire calendar — instant booking, conflict prevention, and slot optimization.",
  },
  {
    title: "Reminder & Callback Agent",
    description:
      "Automated reminders, confirmations, and callback sequences that reduce no-shows by up to 60%.",
  },
  {
    title: "Newsletter Agent",
    description:
      "Sends automated newsletters, health tips, seasonal campaigns, and recall reminders to keep patients engaged.",
  },
  {
    title: "Intake & Triage Agent",
    description:
      "Pre-appointment data collection, urgency assessment, and 24/7 patient inquiry handling.",
  },
];

const clinicalFeatures = [
  {
    title: "Patient Records",
    description:
      "Full medical history — consultations, procedures, lab results, imaging, referrals.",
  },
  {
    title: "Vitals Tracking",
    description:
      "Blood pressure, heart rate, SpO2, glucose, pain scale — all charted over time.",
  },
  {
    title: "Allergy Alerts",
    description:
      "Critical allergy banners on every patient view. Severity tracking.",
  },
  {
    title: "Medical Records",
    description: "Structured records with diagnosis, treatment, and provider.",
  },
  {
    title: "Medication Management",
    description:
      "Active/stopped medications, dosages, frequencies. Full prescriber history.",
  },
  {
    title: "Multi-Role Access",
    description:
      "Admin, doctor, receptionist, nurse — each role sees what they need.",
  },
];

const timeline = [
  {
    phase: "Research",
    title: "Deep market research across Gauteng healthcare verticals.",
  },
  {
    phase: "Build",
    title: "Core platform: WhatsApp AI, booking automation, patient records.",
  },
  {
    phase: "AI Agents",
    title:
      "Deployed triage, intake, follow-up agents. ElevenLabs voice integration.",
  },
  {
    phase: "Launch",
    title: "First 50 practices onboarded with the Full Suite.",
  },
  {
    phase: "Scale",
    title: "Multi-location support, hospital features, radiology ops.",
  },
];

const researchCapabilities = [
  {
    title: "Real-Time Data Collection",
    description: "Our AI agents continuously gather and analyze healthcare market data across South Africa — practice availability, patient demand patterns, and service gaps.",
  },
  {
    title: "Multi-Agent Intelligence",
    description: "Powered by the world's most advanced AI models — Claude, GPT-4, and Gemini working in concert. Each agent specializes in a domain: clinical research, market analysis, and operational optimization.",
  },
  {
    title: "Healthcare Market Research",
    description: "We study how patients interact with healthcare systems across Africa. Our findings drive every feature we build — from WhatsApp triage to smart recall.",
  },
  {
    title: "Predictive Analytics",
    description: "Machine learning models trained on South African healthcare patterns predict patient no-shows, optimal scheduling, and revenue opportunities.",
  },
  {
    title: "Autonomous Operations",
    description: "Our research agents run 24/7 — monitoring healthcare trends, analyzing patient behavior, and feeding insights directly into the Netcare Health OS platform.",
  },
  {
    title: "African-First Research",
    description: "Every model, every insight, every feature is built for the African context first. We understand the unique challenges of healthcare delivery on this continent.",
  },
];

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="bg-white">
      <Navbar />

      {/* ── 1. Hero (dark) ── */}
      <section
        ref={heroRef}
        className="pt-32 pb-20 relative"
        style={{ backgroundColor: "#1D3443" }}
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#3DA9D1] rounded-full blur-[300px] opacity-[0.06] pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono mb-6"
          >
            About Netcare Health OS
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-light tracking-[-0.03em] text-white mb-6 leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            AI-Powered Operations
            <br />
            for Primary Healthcare
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Netcare Health OS is an AI-powered operations platform that unifies
            claims intelligence, financial analytics, and practice management
            across 88 clinics in the Netcare Primary Healthcare network.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-12"
          >
            {["AI Claims Engine", "88 Clinics", "POPIA Compliant", "Real-Time Analytics"].map((tech) => (
              <span
                key={tech}
                className="text-[11px] text-white/25 font-mono tracking-wider uppercase"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. Team Image Banner (dark → white transition) ── */}
      <section className="relative pb-0" style={{ backgroundColor: "#1D3443" }}>
        <div className="max-w-6xl mx-auto px-6 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-white/[0.06]"
          >
            <Image
              src="/images/about-team.png"
              alt="Our diverse healthcare team"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={blurPlaceholders["about-team"]}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            <div className="absolute bottom-6 left-8">
              <p className="text-white/70 text-sm font-mono">
                Our team — built across cultures, united by care.
              </p>
            </div>
          </motion.div>
        </div>
        {/* Gradient fade to white */}
        <div className="h-24 bg-gradient-to-b from-[#1D3443] to-white" />
      </section>

      {/* ── 3. Our Story (white) ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Our Story
            </span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                88 clinics deserve
                <br />
                smarter operations
              </h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">
                Netcare Primary Healthcare operates 88 clinics across South Africa,
                serving millions of patients annually. Managing claims, billing,
                compliance, and operations across this network requires intelligent
                automation — not more spreadsheets and manual processes.
              </p>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                Netcare Health OS brings AI-powered claims intelligence, real-time
                financial dashboards, and automated compliance tracking to every
                clinic in the network. One platform, one command center, total visibility.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <Image
                src="/images/about-clinic.png"
                alt="Modern African healthcare clinic"
                fill
                className="object-cover rounded-2xl"
                placeholder="blur"
                blurDataURL={blurPlaceholders["about-clinic"]}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. AI Capabilities (off-white) ── */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mb-4">
              AI Agent Suite
            </h2>
            <p className="text-[15px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              Six autonomous AI agents work around the clock — finding patients,
              automating outreach, managing bookings, and running your operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
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
                  {cap.title}
                </h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Clinical Features (dark) ── */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: "#1D3443" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono block mb-4">
              Clinical
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white mb-4">
              Clinical Intelligence
            </h2>
            <p className="text-[15px] text-white/40 max-w-xl mx-auto leading-relaxed">
              Complete patient management with medical records, vitals tracking,
              allergy alerts, and medication management.
            </p>
          </motion.div>

          {/* Clinic image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-12 border border-white/[0.06]"
          >
            <Image
              src="/images/about-clinic.png"
              alt="Modern African dental clinic"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={blurPlaceholders["about-clinic"]}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1D3443]/40 via-transparent to-[#1D3443]/40" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clinicalFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-[#3DA9D1]/20 transition-all duration-300"
              >
                <h3 className="font-semibold text-white text-[14px] mb-1">
                  {feat.title}
                </h3>
                <p className="text-[13px] text-white/30 leading-relaxed">
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Values (white) ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Values
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900">
              What Drives Us
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BAE6FD] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3DA9D1]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-[15px]">
                  {value.title}
                </h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Journey Timeline (off-white) ── */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono block mb-4">
              Timeline
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900">
              Our Journey
            </h2>
          </motion.div>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-6 py-6 border-b border-gray-200 last:border-0"
              >
                <div className="shrink-0 w-20 text-right">
                  <span className="text-[12px] font-semibold text-[#1D8AB5] font-mono uppercase tracking-wider">
                    {item.phase}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#3DA9D1]/30" />
                  <p className="text-[14px] text-gray-500 pl-6">
                    {item.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Legal & Compliance ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono block mb-4">
              Compliance & Data Protection
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mb-5">
              Built to Protect
            </h2>
            <p className="text-[15px] text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Healthcare data demands the highest standard of protection. Netcare Health OS OS
              is designed for POPIA, HPCSA, and CPA compliance from the ground up — not
              as an afterthought.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {[
              {
                title: "POPIA Compliant",
                description:
                  "Full Protection of Personal Information Act compliance — consent tracking, data subject rights, breach notification procedures, Information Officer designated.",
                stat: "s18-s72",
              },
              {
                title: "HPCSA Aligned",
                description:
                  "AI clinical disclaimer on all outputs, audit logging for patient data access, role-based access controls, HPCSA data retention standards.",
                stat: "Booklet 10",
              },
              {
                title: "Health Data (s26)",
                description:
                  "Patient health information classified as Special Personal Information. Encryption at rest and in transit, practice-scoped isolation, no client-side storage.",
                stat: "Highest tier",
              },
              {
                title: "Consent Management",
                description:
                  "4-type consent tracking (treatment, data processing, marketing, research). Digital, paper, and verbal methods. Full revocation audit trail.",
                stat: "4 types",
              },
              {
                title: "Data Subject Rights",
                description:
                  "Public data request form for access, correction, deletion, and objection. 30-day response guarantee per POPIA s23-25.",
                stat: "30 days",
              },
              {
                title: "Corporate Legal Framework",
                description:
                  "Terms of Service, Privacy Policy, Cookie Policy, PAIA s51 Manual, Data Processing Agreement, Incident Response Plan — all documented.",
                stat: "7 docs",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-200 hover:border-[#3DA9D1] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3DA9D1] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3DA9D1]" />
                  </div>
                  <span className="text-[11px] font-mono text-[#3DA9D1] bg-[#3DA9D1] px-2 py-1 rounded">
                    {item.stat}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-[15px] mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            {[
              { value: "7", label: "Regulations Covered" },
              { value: "90%+", label: "Compliance Score" },
              { value: "4", label: "Legal Pages Live" },
              { value: "30d", label: "Data Request SLA" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extralight text-[#3DA9D1] mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          <div className="text-center">
            <p className="text-[13px] text-gray-400">
              Operated by Netcare Limited · Sandton, Gauteng, South Africa ·{" "}
              <a href="/privacy" className="text-[#3DA9D1] hover:underline">Privacy Policy</a>
              {" · "}
              <a href="/terms" className="text-[#3DA9D1] hover:underline">Terms</a>
              {" · "}
              <a href="/cookies" className="text-[#3DA9D1] hover:underline">Cookies</a>
              {" · "}
              <a href="/data-request" className="text-[#3DA9D1] hover:underline">Data Request</a>
              {" · "}
              <a href="/investor/compliance" className="text-[#3DA9D1] hover:underline">Full Compliance Map</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. Netcare Technology — Research Focus (dark) ── */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: "#1D3443" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono block mb-4">
              Our Research Lab
            </span>
            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white mb-5">
              Powered by AI Intelligence
            </h2>
            <p className="text-[15px] text-white/40 max-w-3xl mx-auto leading-relaxed">
              Netcare Health OS is powered by advanced AI systems purpose-built
              for healthcare operations. Our technology analyses claims patterns,
              predicts rejection risks, and optimizes revenue recovery across
              the entire primary healthcare network — 24/7.
            </p>
          </motion.div>

          {/* Research philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <p className="text-[14px] text-white/30 leading-relaxed">
              We don&apos;t guess — we research. Every feature in Netcare Health OS is
              backed by real data from real healthcare environments across South
              Africa. Our autonomous agents monitor patient behavior, practice
              operations, and market dynamics around the clock, feeding insights
              directly into the platform. The result: technology that actually
              solves the problems African healthcare faces today.
            </p>
          </motion.div>

          {/* Research capabilities grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {researchCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-[#3DA9D1]/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3DA9D1]" />
                </div>
                <h3 className="font-semibold text-white text-[15px] mb-2">
                  {cap.title}
                </h3>
                <p className="text-[13px] text-white/30 leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Lab stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { value: "15+", label: "AI Agents Active" },
              { value: "24/7", label: "Real-Time Monitoring" },
              { value: "5", label: "AI Models in Use" },
              { value: "100%", label: "African-First Research" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extralight text-[#3DA9D1] mb-1">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/25 font-mono uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1]" />
              <span className="text-[13px] text-white/30 font-mono">
                Netcare Health OS — Sandton, South Africa
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
