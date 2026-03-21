"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import dynamic from "next/dynamic";
import PayerProviderFlow from "@/components/payer-connect/PayerProviderFlow";
import JourneyTimeline from "@/components/payer-connect/JourneyTimeline";
import ModuleArchDiagram from "@/components/payer-connect/ModuleArchDiagram";
import RevenueStreamsChart from "@/components/payer-connect/RevenueStreamsChart";
import ComplianceShield from "@/components/payer-connect/ComplianceShield";
import ImpactMetrics from "@/components/payer-connect/ImpactMetrics";
import GoToMarketTimeline from "@/components/payer-connect/GoToMarketTimeline";

const JessPresenter = dynamic(() => import("@/components/voice-agent/JessPresenter"), { ssr: false });

const jessSections = [
  {
    id: "hero",
    label: "Overview",
    color: "#3b82f6",
    narration: "Welcome to Payer Connect! I'm so excited to walk you through this — it's honestly one of the most important things we've ever built. Payer Connect is the live coordination layer between healthcare providers and funders. Think about it — right now, hospitals, clinics, medical aids, and insurers are all speaking different languages. Different systems, different formats, different timelines. Payer Connect brings them all together into one real-time platform. For the first time in South African healthcare, everyone is finally on the same page. And that changes everything for patients and providers alike.",
  },
  {
    id: "flow",
    label: "How It Works",
    color: "#3b82f6",
    narration: "So here's how it actually works, and this is the beautiful part. Everything flows through one intelligent hub. When a patient walks into a clinic, we instantly check their medical aid coverage — no phone calls, no waiting on hold, no fax machines. The system verifies eligibility in seconds, handles pre-authorisation automatically, routes the patient to the right specialist or facility, and makes sure the claim is clean before it's even submitted. It's like having a brilliant coordinator who never sleeps, never makes mistakes, and works across every single provider and funder in the country. That's the power of what we've built here.",
  },
  {
    id: "problems",
    label: "The Problem",
    color: "#ef4444",
    narration: "Now, let me tell you why this matters so deeply. Right now, the healthcare coordination system in South Africa is broken. And I don't say that lightly. Providers spend hours — literally hours — on the phone trying to check if a patient is covered. Authorisations that should take minutes take days. Claims get rejected over and over because of missing codes or wrong formatting. And in the middle of all this chaos? The patient. Confused, frustrated, sometimes going without care because nobody can confirm their coverage in time. South Africa has over eighty medical aid schemes, each with different rules, different processes, different systems. It's an absolute maze. And the human cost of that complexity is real. We're here to fix that.",
  },
  {
    id: "journey",
    label: "Patient Journey",
    color: "#3b82f6",
    narration: "Let me walk you through a real patient journey on Payer Connect — and you'll see why this is so transformative. Step one: a patient arrives at a facility. Step two: we instantly verify their medical aid cover — which scheme, which plan, what's included, what's excluded. Step three: if they need a specialist, we route them to the best available option based on their cover and location. Step four: we handle the pre-authorisation automatically, in real time. Step five: during the consultation, the shared case timeline keeps everyone informed. Step six: at discharge, the claim is already validated and ready to submit. Step seven: the claim goes through clean, with correct ICD-10 codes. Step eight: payment reconciliation happens seamlessly. Eight steps, one platform, zero chaos. That's the future of healthcare coordination.",
  },
  {
    id: "modules",
    label: "10 Modules",
    color: "#10b981",
    narration: "This is where it gets really exciting! Payer Connect isn't just one feature — it's ten purpose-built modules that cover every single layer of the provider-funder relationship. Module A is our Eligibility Engine — instant cover verification. Module B is the Pre-Auth Engine — automated authorisation requests. Module C is Smart Routing — directing patients to the right facility. Module D handles Referrals and Transfers between providers. Module E is Claims Readiness — validating claims before submission so they don't get rejected. Module F is the Shared Case Timeline — everyone can see the patient's journey in real time. Then we have three beautiful portals: the Patient Portal, the Provider Portal, and the Payer Portal — each designed specifically for their users. And finally, Module J is our AI Copilot — intelligent assistance that gets smarter with every interaction. Ten modules, working together as one system. This is the full stack.",
  },
  {
    id: "users",
    label: "Who It Connects",
    color: "#10b981",
    narration: "Payer Connect is truly a two-sided platform, and that's what makes it so powerful. On the provider side, we're connecting hospitals, private clinics, specialist practices, pharmacies, pathology labs, radiology centres, and even ambulance services. These are the people delivering care every single day. On the payer side, we're connecting medical aid schemes — all eighty-plus of them — private health insurers, HMOs, government programmes, and scheme administrators. Every one of these entities currently operates in its own silo. Different systems, different data formats, different processes. Payer Connect breaks down those walls and creates one unified network. And the beautiful thing is — the more participants who join, the more valuable it becomes for everyone. That's the network effect at work.",
  },
  {
    id: "gtm",
    label: "Go-to-Market",
    color: "#a855f7",
    narration: "Our go-to-market strategy is really thoughtful — we're not trying to boil the ocean. Phase one is all about eligibility verification — it's the fastest win, the easiest sell. Every provider needs it, and the ROI is immediate. Once they see how fast we can verify a patient's cover, they want more. Phase two introduces pre-authorisation automation and our provider and payer portals. Phase three brings smart routing — directing patients to the right facility based on their cover. Phase four layers in the AI copilot for intelligent decision support. And phase five? That's when we become infrastructure for all of Africa. The same problems exist across Nigeria, Kenya, Ghana, Egypt — actually, they're even worse there. Our platform scales beautifully into those markets. This isn't just a South African product. This is health financing infrastructure for the continent.",
  },
  {
    id: "revenue",
    label: "Revenue Model",
    color: "#10b981",
    narration: "The revenue model is absolutely brilliant — and I love explaining this because it shows how sustainable this business is. We have eight distinct revenue streams from one product. First, provider SaaS subscriptions — monthly fees for clinics and hospitals. Second, payer enterprise licensing — medical aids and insurers pay for access. Third, integration fees — connecting legacy systems to our platform. Fourth, transaction fees — a small fee per eligibility check or authorisation processed. Fifth, AI premium features — advanced analytics and decision support. Sixth, data analytics packages — anonymised insights for the healthcare industry. Seventh, white-label licensing — letting large hospital groups or insurers brand it as their own. And eighth, implementation and training services. Eight streams, one platform. That kind of revenue diversity is exactly what makes this business resilient and scalable.",
  },
  {
    id: "compliance",
    label: "Compliance",
    color: "#f59e0b",
    narration: "Now this is something we take incredibly seriously, and I want you to feel confident about it. Healthcare data is some of the most sensitive information that exists. Payer Connect was built for regulated healthcare from day one — compliance isn't something we added later, it's woven into the foundation. We have role-based access control so every user only sees what they're supposed to see. End-to-end encryption protects data in transit and at rest. Full audit logging means every action is recorded and traceable. Consent management ensures patients have control over their data. Multi-factor authentication, breach detection and handling protocols, and full POPIA compliance — South Africa's data protection law. We're also building toward international standards like HIPAA and GDPR as we expand globally. When you trust us with patient data, you can trust that we're protecting it with the highest standards in the industry.",
  },
  {
    id: "thesis",
    label: "Investment Thesis",
    color: "#3b82f6",
    narration: "Let me leave you with the big picture, because this is where it all comes together. Payer Connect sits in the middle of the actual money flow of healthcare. Every claim, every authorisation, every eligibility check — it all flows through our platform. That's an incredibly powerful position. For providers, it means faster approvals, fewer rejected claims, and dramatically lower admin overhead. For payers, it means cleaner data, lower processing costs, and better risk management. For patients, it means they actually get the care they're entitled to, without the runaround. And here's the strategic insight — once providers and payers are connected through our platform, the switching costs are massive. This isn't a tool you try for a month. This becomes infrastructure. This is the financial plumbing of healthcare in Africa. And we're building it first.",
  },
];

/* ─── Animation helpers ─── */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ─── Data ─── */

const problems = [
  {
    title: "Slow eligibility checks",
    description: "Providers don't know if a patient is active, covered, or in-network until after delays — sometimes hours.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Broken authorisation workflows",
    description: "Approvals handled through fragmented portals, emails, PDFs, call centres, and endless back-and-forth.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Bad patient routing",
    description: "Patients sent to the wrong facility, wrong specialist, or non-optimal provider — even when a better covered option exists.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    title: "Weak transfer coordination",
    description: "Moving a patient between facilities or care levels is slow, manual, and badly documented.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Claims leakage & rejection",
    description: "Claims delayed or rejected from missing codes, bad attachments, missing auth, or benefit misalignment.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Poor payer-provider visibility",
    description: "Insurers can't see what's happening fast enough. Providers can't see payer logic fast enough. Everyone's blind.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
];

const modules = [
  {
    letter: "A",
    name: "Eligibility & Benefits Engine",
    phase: "Phase 1",
    tagline: "The fastest wedge.",
    description: "Instantly confirms whether a patient is covered and what they're entitled to. Active/inactive status, benefit availability, network match, co-pay warnings, plan limits, authorisation needs — all in seconds.",
    color: "#10b981",
  },
  {
    letter: "B",
    name: "Pre-Authorisation Engine",
    phase: "Phase 2",
    tagline: "The approval workflow layer.",
    description: "Digitises and structures medical approvals between providers and payers. Handles admissions, surgery, radiology, specialist referrals, high-cost treatments, chronic care, maternity, and oncology workflows.",
    color: "#10b981",
  },
  {
    letter: "C",
    name: "Smart Routing Engine",
    phase: "Phase 3",
    tagline: "The intelligence layer.",
    description: "Routes patients to the best covered provider or facility based on specialty, insurer network, distance, urgency, capacity, and cost efficiency. The right care at the right place, every time.",
    color: "#8b5cf6",
  },
  {
    letter: "D",
    name: "Referral & Transfer Engine",
    phase: "Phase 3",
    tagline: "The movement layer.",
    description: "Coordinates patient transfers and referrals safely. Provider-to-provider handoffs, facility acceptance, transfer approvals, care continuation documentation, and receiving facility confirmation.",
    color: "#8b5cf6",
  },
  {
    letter: "E",
    name: "Claims Readiness Engine",
    phase: "Phase 4",
    tagline: "The protection layer.",
    description: "Validates claims before submission. Checks authorisation presence, code alignment, benefit match, documentation completeness, policy validity, and rejection risk. Stops bad claims before they happen.",
    color: "#f59e0b",
  },
  {
    letter: "F",
    name: "Shared Case Timeline",
    phase: "Phase 2",
    tagline: "The visibility layer.",
    description: "A single live journey for every case — registration, eligibility, authorisation, referral, transfer, admission, treatment, discharge, claim status. Every party sees what they need, nothing more.",
    color: "#06b6d4",
  },
  {
    letter: "G",
    name: "Patient Portal",
    phase: "Phase 2",
    tagline: "The patient-facing layer.",
    description: "Keeps patients informed. Cover status, approval progress, required documents, where to go, next steps, transfer instructions, out-of-pocket warnings, and current case stage. No more confusion.",
    color: "#06b6d4",
  },
  {
    letter: "H",
    name: "Provider Portal",
    phase: "Phase 2",
    tagline: "The provider operations layer.",
    description: "Used by front desk, case managers, doctors, admissions, finance, and transfer coordinators. Verify cover, submit authorisation, upload documents, track responses, initiate referrals, validate claims.",
    color: "#10b981",
  },
  {
    letter: "I",
    name: "Payer Portal",
    phase: "Phase 2",
    tagline: "The funder-side layer.",
    description: "Used by authorisation teams, medical officers, claims teams, and case managers. Review requests, manage approvals, monitor urgent cases, track network usage, flag suspicious patterns.",
    color: "#f59e0b",
  },
  {
    letter: "J",
    name: "AI Copilot",
    phase: "Phase 4",
    tagline: "The Visio intelligence layer.",
    description: "Summarises clinical requests and benefit logic, flags missing items, suggests covered options, explains payer responses, identifies claim risks, recommends best next provider, surfaces delays and bottlenecks.",
    color: "#8b5cf6",
  },
];

const journeySteps = [
  { step: "01", title: "Patient enters system", description: "Arrives physically, books online, or is referred in" },
  { step: "02", title: "Eligibility checked live", description: "Membership, policy, benefits, network, co-pay, exclusions — all verified instantly" },
  { step: "03", title: "Best care route determined", description: "Medical need + payer rules + provider network + urgency + cost efficiency" },
  { step: "04", title: "Pre-authorisation triggered", description: "Structured request with diagnosis, notes, attachments, urgency" },
  { step: "05", title: "Payer reviews & responds", description: "Approve, reject, pend, request info, or escalate — with full context" },
  { step: "06", title: "Care proceeds", description: "Patient treated, referred, admitted, scanned, transferred, or discharged" },
  { step: "07", title: "Claim readiness checked", description: "Codes, attachments, auth status, benefit alignment, rejection risk — all validated" },
  { step: "08", title: "Case timeline stays live", description: "Provider, payer, patient, coordinator, billing — everyone sees progress" },
];

const providerUsers = [
  "Hospitals", "Private clinics", "Specialist groups", "GP networks", "Day hospitals",
  "Diagnostic centres", "Pharmacies", "Labs", "Emergency/ambulance", "Renal/oncology/maternity centres",
];

const payerUsers = [
  "Medical aid schemes", "Health insurers", "HMOs", "Scheme administrators",
  "Managed-care orgs", "TPAs / claims administrators", "Public-financing bodies",
];

const goToMarket = [
  {
    phase: "Phase 1",
    title: "Eligibility & Benefits Verification",
    description: "The easiest wedge. Fast ROI. Easy to demo. Easy to understand. Providers see value in minutes.",
    timeline: "2026",
    status: "first",
  },
  {
    phase: "Phase 2",
    title: "Pre-Auth + Provider & Payer Portals",
    description: "Removes the main workflow pain. This is where the real operational transformation begins.",
    timeline: "2026–2027",
    status: "second",
  },
  {
    phase: "Phase 3",
    title: "Smart Routing + Referral + Transfer",
    description: "Patient movement improves materially. The right patient at the right facility at the right time.",
    timeline: "2027",
    status: "third",
  },
  {
    phase: "Phase 4",
    title: "Claims Readiness + AI Copilot",
    description: "Deepens the moat. Increases stickiness. AI makes everyone faster and smarter.",
    timeline: "2027–2028",
    status: "fourth",
  },
  {
    phase: "Phase 5",
    title: "Network Intelligence + Regional Expansion",
    description: "Turns the product into infrastructure. Africa-wide payer-provider coordination layer.",
    timeline: "2028+",
    status: "fifth",
  },
];

const revenueStreams = [
  { stream: "Provider SaaS fee", description: "Monthly subscription per facility" },
  { stream: "Payer enterprise fee", description: "Annual contract per insurer/scheme" },
  { stream: "Implementation & setup", description: "Onboarding, training, integration" },
  { stream: "Integration fees", description: "Per-connection to existing systems" },
  { stream: "Transaction-based fees", description: "Per eligibility check or auth request" },
  { stream: "Premium AI usage", description: "Advanced copilot features" },
  { stream: "Analytics & reporting", description: "Network intelligence dashboards" },
  { stream: "White-label licensing", description: "Branded deployments for large groups" },
];

const complianceFeatures = [
  "Role-based access control", "Consent management", "Encryption at rest & in transit",
  "Secure API gateway", "Full audit logs", "Activity tracking", "Breach handling workflows",
  "Document-level permissions", "Retention controls", "Cross-border transfer controls",
  "Least-privilege access", "MFA / strong authentication",
];

/* ─── Page ─── */

export default function PayerConnectPage() {
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

      {/* Jess Presenter — sticky floating companion */}
      <JessPresenter sections={jessSections} />

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="hero" className="relative pt-40 pb-32 md:pt-48 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-500/[0.04] rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#3DA9D1]/[0.03] rounded-full blur-[180px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[150px]" />
        </div>

        {/* Grid overlay */}
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
            {/* Product badge */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <span className="text-[11px] font-mono tracking-[0.4em] text-blue-400/60 uppercase">
                Netcare Health OS Ecosystem
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-[-0.04em] leading-[0.9] mb-8">
              Payer
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">Connect</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed max-w-3xl mb-4">
              The live coordination layer between healthcare delivery
              and healthcare funding.
            </p>
            <p className="text-lg text-white/70 font-light leading-relaxed max-w-2xl mb-12">
              A secure, real-time platform connecting hospitals, clinics, specialists,
              medical aids, insurers, HMOs, and patients into one operating layer.
              Verify cover. Approve care. Route patients. Reduce claim friction. All live.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#modules"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white text-sm font-mono hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Explore the Platform
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </Link>
              <Link
                href="/ecosystem"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white/50 text-sm font-mono hover:border-white/20 hover:text-white/70 transition-all duration-300"
              >
                Full Ecosystem
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LIVE FLOW DIAGRAM
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="flow" className="relative py-20 md:py-28 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-blue-400/60 uppercase mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              One coordination layer. <span className="text-blue-400">Live.</span>
            </h2>
            <p className="text-base text-white/70 font-light max-w-2xl mx-auto">
              Eligibility, authorisation, claims, and referrals flow through a single intelligent hub —
              connecting every provider to every payer in real time. Hover the flow types to explore.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border border-blue-400/[0.08] bg-blue-400/[0.02] p-6 md:p-8"
          >
            <PayerProviderFlow />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CORE PROMISE
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { text: "Move the patient faster", color: "text-blue-400" },
              { text: "Approve care smarter", color: "text-[#3DA9D1]" },
              { text: "Reduce claim friction", color: "text-amber-400" },
              { text: "Connect payer & provider live", color: "text-purple-400" },
            ].map((item) => (
              <motion.div key={item.text} variants={fadeUp} className="text-center">
                <p className={`text-xl md:text-2xl font-extralight ${item.color}`}>{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE PROBLEM
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="problems" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-red-400/60 uppercase mb-4">
              The Problem
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              The space between payer and provider is <span className="text-red-400">chaos</span>
            </h2>
            <p className="text-base text-white/70 font-light max-w-2xl mx-auto">
              Every day, millions of healthcare interactions are slowed by manual processes,
              broken workflows, and zero shared visibility between the people providing care
              and the people funding it.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {problems.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="rounded-2xl border border-red-400/[0.08] bg-red-400/[0.02] p-8 hover:border-red-400/[0.15] transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-red-400/10 text-red-400/60 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-lg font-light text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-white/70 font-light leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </motion.div>


        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          THE JOURNEY — End to End
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="journey" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-blue-400/60 uppercase mb-4">
              End-to-End Journey
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              From patient entry to <span className="text-blue-400">claim resolution</span>
            </h2>
            <p className="text-base text-white/70 font-light max-w-xl mx-auto">
              Eight steps. One platform. Complete payer-provider coordination.
            </p>
          </motion.div>

          <JourneyTimeline steps={journeySteps} />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MODULES — The Product
      ═══════════════════════════════════════════════════════════ */}
      <section id="modules" data-jess="modules" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              10 Product Modules
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              Every layer of the <span className="text-[#3DA9D1]">coordination stack</span>
            </h2>
            <p className="text-base text-white/70 font-light max-w-2xl mx-auto">
              From eligibility verification to AI-powered decision support —
              ten modules that turn payer-provider chaos into a single live workflow.
            </p>
          </motion.div>

          {/* Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 mb-10"
          >
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
                System Architecture
              </span>
              <p className="text-[12px] font-mono text-white/70 mt-1">
                Four layers, ten modules — hover to explore how they connect
              </p>
            </div>
            <ModuleArchDiagram />
          </motion.div>

          {/* Module cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {modules.map((mod) => (
              <motion.div
                key={mod.letter}
                variants={fadeUp}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-light shrink-0"
                    style={{ backgroundColor: `${mod.color}12`, color: mod.color }}
                  >
                    {mod.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-light text-white">{mod.name}</h3>
                      <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/70 px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                        {mod.phase}
                      </span>
                    </div>
                    <p className="text-[12px] font-mono text-white/70 mb-3">{mod.tagline}</p>
                    <p className="text-[13px] text-white/60 font-light leading-relaxed">{mod.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHO IT'S FOR — Users
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="users" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              Who It Connects
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em]">
              Every party in <span className="text-[#3DA9D1]">healthcare financing</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl border border-[#3DA9D1]/[0.1] bg-[#3DA9D1]/[0.02] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#3DA9D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-[#3DA9D1]">Provider Side</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {providerUsers.map((u) => (
                  <span key={u} className="text-[12px] font-mono text-white/70 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                    {u}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl border border-blue-400/[0.1] bg-blue-400/[0.02] p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-blue-400">Payer Side</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {payerUsers.map((u) => (
                  <span key={u} className="text-[12px] font-mono text-white/70 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                    {u}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GO-TO-MARKET
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="gtm" className="relative py-24 md:py-32 border-t border-white/[0.04]">
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
              Go-to-Market
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              Five phases to <span className="text-purple-400">infrastructure</span>
            </h2>
            <p className="text-base text-white/70 font-light max-w-xl mx-auto">
              Start with the easiest wedge. End as the coordination layer for African healthcare.
            </p>
          </motion.div>

          <GoToMarketTimeline phases={goToMarket} />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          REVENUE MODEL
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="revenue" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
              Revenue Model
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              Eight revenue streams. <span className="text-[#3DA9D1]">One product.</span>
            </h2>
          </motion.div>

          <RevenueStreamsChart streams={revenueStreams} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COMPLIANCE
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="compliance" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-amber-400/60 uppercase mb-4">
              Compliance by Design
            </span>
            <h2 className="text-4xl md:text-5xl font-extralight tracking-[-0.03em] mb-4">
              Built for <span className="text-amber-400">regulated healthcare</span>
            </h2>
            <p className="text-base text-white/70 font-light">
              Not a feature set. Part of the product foundation.
              Every module is built for healthcare and insurance compliance from day one.
            </p>
          </motion.div>

          <ComplianceShield features={complianceFeatures} />

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHY IT'S BIG
      ═══════════════════════════════════════════════════════════ */}
      <section data-jess="thesis" className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-blue-400/60 uppercase mb-4">
              The Investment Thesis
            </span>
            <h2 className="text-4xl md:text-6xl font-extralight tracking-[-0.03em] mb-4">
              This product sits in the middle of the <span className="text-blue-400">money</span>
            </h2>
          </motion.div>

          {/* Before vs After Impact Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.3em] text-blue-400/60 uppercase">
                Before vs After
              </span>
            </div>
            <h3 className="text-lg font-light text-white mb-1">Measurable operational transformation</h3>
            <p className="text-[12px] font-mono text-white/70 mb-6">
              Every metric that matters — red bars (before) vs coloured bars (with Payer Connect)
            </p>
            <ImpactMetrics />
          </motion.div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-32 md:py-40 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-500/[0.05] rounded-full blur-[200px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-extralight tracking-[-0.04em] leading-[0.95] mb-6">
              The coordination layer
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">healthcare has been missing</span>
            </h2>
            <p className="text-base text-white/70 font-light leading-relaxed mb-12 max-w-xl mx-auto">
              Payer Connect is where healthcare delivery meets healthcare funding.
              One platform. Live. Secure. Intelligent.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/ecosystem"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-blue-600 text-white text-sm font-mono hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                View Full Ecosystem
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full border border-white/10 text-white/50 text-sm font-mono hover:border-white/20 hover:text-white/70 transition-all duration-300"
              >
                Get Started with Netcare Health OS
              </Link>
            </div>

            {/* Newsletter */}
            <div className="max-w-md mx-auto">
              <p className="text-[12px] font-mono text-white/70 mb-4">Get notified when Payer Connect launches</p>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-blue-400 font-mono text-sm py-3"
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
                    className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/70 focus:outline-none focus:border-blue-500/40 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-full bg-white/10 text-white/60 text-sm font-mono hover:bg-white/15 hover:text-white disabled:opacity-50 transition-all"
                  >
                    {submitting ? "..." : "Notify Me"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </main>
  );
}
