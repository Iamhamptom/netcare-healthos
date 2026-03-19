"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  ClipboardCheck,
  MessageSquare,
  Search,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Building2,
} from "lucide-react";
import type { Metadata } from "next";

const benefits = [
  {
    icon: Send,
    title: "Digital Referral Submission",
    description:
      "Submit structured referral forms digitally — patient details, clinical notes, ICD-10 codes, and imaging history. No more faxes, phone calls, or paper forms.",
  },
  {
    icon: ClipboardCheck,
    title: "Referral Status Tracking",
    description:
      "Track every referral in real time. See when the patient has been seen, whether the specialist has accepted, and when the appointment is booked.",
  },
  {
    icon: MessageSquare,
    title: "Specialist Feedback Loop",
    description:
      "Receive structured feedback from specialists after consultations — findings, treatment plans, and follow-up recommendations sent directly to your dashboard.",
  },
  {
    icon: Search,
    title: "Specialist Directory Access",
    description:
      "Search for specialist practices on the Netcare Health OS network by type and location. ENT, dental, oncology, radiology, and more — all verified and accessible.",
  },
  {
    icon: ShieldCheck,
    title: "POPIA-Compliant Data Sharing",
    description:
      "All patient data shared through referrals is encrypted and POPIA-compliant. Consent tracking built into every referral submission.",
  },
  {
    icon: Building2,
    title: "Full Practice Management (Upgrade)",
    description:
      "Ready to manage your own practice digitally? Upgrade to a paid Netcare Health OS plan for booking, billing, WhatsApp integration, and AI-powered patient management.",
  },
];

const steps = [
  {
    step: "01",
    title: "Submit Referral",
    description:
      "Complete a digital referral form with patient details, clinical notes, urgency level, and relevant ICD-10 codes. Attach imaging or test results.",
  },
  {
    step: "02",
    title: "Patient Is Seen",
    description:
      "The specialist practice receives the referral, contacts the patient, and schedules the appointment. You see status updates in real time.",
  },
  {
    step: "03",
    title: "Receive Feedback",
    description:
      "After the consultation, the specialist sends structured feedback — diagnosis, treatment plan, and follow-up recommendations — directly to your GP dashboard.",
  },
];

const specialties = [
  { name: "ENT / Otolaryngology", description: "Ear, nose, and throat specialists" },
  { name: "Dental & Oral Surgery", description: "General dentistry and maxillofacial surgery" },
  { name: "Radiology", description: "Diagnostic imaging and interventional radiology" },
  { name: "Oncology", description: "Medical and surgical oncology" },
  { name: "Orthopaedics", description: "Musculoskeletal conditions and surgery" },
  { name: "Ophthalmology", description: "Eye conditions and vision care" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function GPReferralPage() {
  return (
    <main className="min-h-screen bg-[#1D3443] text-white selection:bg-[#86EFAC]/15">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1D3443]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#3DA9D1] hover:text-[#3DA9D1] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Netcare Health OS
          </Link>
          <Link
            href="/gp/register"
            className="px-5 py-2 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#3DA9D1] transition-colors"
          >
            Register as GP
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 md:py-36 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#3DA9D1] font-mono mb-5 block">
              GP Referral Portal
            </span>
            <h1 className="text-4xl md:text-6xl font-light tracking-[-0.03em] text-white mb-6 leading-tight">
              Refer smarter.<br />
              <span className="text-[#3DA9D1]">
                Your patients deserve the right specialist.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#3DA9D1]/60 max-w-2xl mx-auto leading-relaxed">
              Submit digital referrals to verified specialist practices across South Africa.
              Track outcomes. Receive feedback. No more fax machines or unreturned calls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/gp/register"
                className="px-8 py-3.5 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#3DA9D1] transition-colors shadow-lg shadow-[#3DA9D1]/20 flex items-center gap-2"
              >
                Register as a Referring GP
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 bg-white/5 text-[#3DA9D1] font-medium text-sm rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Keywords bar */}
      <section className="border-y border-white/5 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-[#3DA9D1]/50 font-mono">
          <span>GP referral portal</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>Digital referral system</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>South Africa</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>Specialist directory</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>POPIA compliant</span>
        </div>
      </section>

      {/* Why use Netcare Health OS referrals */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#3DA9D1] font-mono mb-5 block">
              Why Netcare Health OS Referrals
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white max-w-xl">
              Replace phone calls and faxes with a digital referral workflow.
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={itemVariants}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-[#3DA9D1]/20 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center mb-5">
                  <b.icon className="w-5 h-5 text-[#3DA9D1]" />
                </div>
                <h3 className="text-white font-medium text-base mb-3">{b.title}</h3>
                <p className="text-[#3DA9D1]/40 text-sm leading-relaxed">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-24 md:py-32 px-6 md:px-12 bg-white/[0.02]"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#3DA9D1] font-mono mb-5 block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white max-w-xl">
              Three steps. Full visibility.
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {steps.map((s) => (
              <motion.div
                key={s.step}
                variants={itemVariants}
                className="flex items-start gap-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#3DA9D1] font-mono text-sm font-bold">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-base mb-2">{s.title}</h3>
                  <p className="text-[#3DA9D1]/40 text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specialist Directory Preview */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#3DA9D1] font-mono mb-5 block">
              Specialist Directory
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white max-w-xl">
              Specialist practices on the Netcare Health OS network.
            </h2>
            <p className="text-[#3DA9D1]/50 text-base mt-4 max-w-lg">
              Search by specialty type and location. All practices on the network use
              Netcare Health OS for structured referral intake and feedback.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {specialties.map((s) => (
              <motion.div
                key={s.name}
                variants={itemVariants}
                className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-[#3DA9D1]/20 transition-all duration-500"
              >
                <div className="w-9 h-9 rounded-lg bg-[#3DA9D1]/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-[#3DA9D1]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">{s.name}</h3>
                  <p className="text-[#3DA9D1]/40 text-xs">{s.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Free tier + Upsell */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.03] border border-[#3DA9D1]/20 rounded-2xl p-8"
            >
              <div className="mb-6">
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-[#3DA9D1] bg-[#3DA9D1]/10 rounded-full">
                  Free for GPs
                </span>
              </div>
              <h3 className="text-2xl font-light text-white mb-3">
                GP Referral Portal
              </h3>
              <p className="text-4xl font-extralight text-white mb-1">
                R0<span className="text-sm text-[#3DA9D1]/50 font-mono">/month</span>
              </p>
              <p className="text-[#3DA9D1]/40 text-sm mb-6">
                No setup fee. No commitment.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Submit digital referrals to specialists",
                  "Track referral status in real time",
                  "Receive specialist feedback",
                  "Access the specialist directory",
                  "POPIA-compliant data sharing",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] mt-2 shrink-0" />
                    <span className="text-[#3DA9D1]/60 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/gp/register"
                className="block text-center py-3 text-sm font-mono rounded-full bg-[#3DA9D1] text-white hover:bg-[#3DA9D1] transition-all"
              >
                Register Free
              </Link>
            </motion.div>

            {/* Paid upsell */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
            >
              <div className="mb-6">
                <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-[#3DA9D1]/40 bg-white/5 rounded-full">
                  For Growing Practices
                </span>
              </div>
              <h3 className="text-2xl font-light text-white mb-3">
                Full Practice Management
              </h3>
              <p className="text-4xl font-extralight text-white mb-1">
                From R15,000
                <span className="text-sm text-[#3DA9D1]/50 font-mono">/month</span>
              </p>
              <p className="text-[#3DA9D1]/40 text-sm mb-6">
                Upgrade when you are ready.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Everything in the free GP tier",
                  "Patient management and records",
                  "ICD-10 billing and invoicing",
                  "WhatsApp AI front desk",
                  "Booking engine with reminders",
                  "Chronic care recall automation",
                  "White-label your brand",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1]/20 mt-2 shrink-0" />
                    <span className="text-[#3DA9D1]/40 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/#pricing"
                className="block text-center py-3 text-sm font-mono rounded-full border border-white/10 text-[#3DA9D1] hover:bg-white/5 transition-all"
              >
                View Pricing Plans
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white mb-6">
              Join the Netcare Health OS referral network.
            </h2>
            <p className="text-[#3DA9D1]/50 text-base mb-10 max-w-lg mx-auto">
              Register free. Submit your first referral in under 2 minutes.
              Your patients get to the right specialist, faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/gp/register"
                className="px-8 py-3.5 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#3DA9D1] transition-colors shadow-lg shadow-[#3DA9D1]/20"
              >
                Register as a Referring GP
              </Link>
              <Link
                href="/how-it-works/gp"
                className="px-8 py-3.5 bg-white/5 text-[#3DA9D1] font-medium text-sm rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                GP Practice Management
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer SEO */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#3DA9D1]/20 text-xs leading-relaxed max-w-2xl mx-auto">
            Netcare Health OS GP Referral Portal enables general practitioners to submit digital
            referrals to specialist practices across South Africa. Available in Johannesburg,
            Cape Town, Durban, Pretoria, and across Gauteng, Western Cape, and KwaZulu-Natal.
            POPIA-compliant digital referral system with structured intake forms, status tracking,
            and specialist feedback. Free for referring GPs.
          </p>
          <p className="text-[#3DA9D1]/15 text-[11px] font-mono mt-6">
            &copy; {new Date().getFullYear()} Netcare Technology
          </p>
        </div>
      </footer>
    </main>
  );
}
