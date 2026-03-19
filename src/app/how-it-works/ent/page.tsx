"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Stethoscope, CalendarCheck, FileText, Bell, Users, ShieldCheck } from "lucide-react";

const workflows = [
  {
    icon: Users,
    title: "GP Referral Management",
    description: "Automatically receive and process patient referrals from general practitioners. Structured intake forms capture symptoms, previous treatments, and imaging — so your team is prepared before the patient arrives.",
  },
  {
    icon: CalendarCheck,
    title: "Tonsillectomy & Surgery Scheduling",
    description: "Smart scheduling for tonsillectomies, septoplasties, and sinus surgeries. Pre-op instructions sent automatically via WhatsApp. Post-op follow-ups scheduled at booking time.",
  },
  {
    icon: Stethoscope,
    title: "Hearing Assessments & Audiometry",
    description: "Book and manage hearing assessments with dedicated audiometry slots. Automated recall for annual hearing checks. Results delivered to referring GPs automatically.",
  },
  {
    icon: Bell,
    title: "Post-Op WhatsApp Reminders",
    description: "Automated post-operative reminders for sinus surgery recovery, tonsillectomy care instructions, and follow-up appointments. Patients stay informed without burdening your front desk.",
  },
  {
    icon: FileText,
    title: "ICD-10 Codes for ENT Procedures",
    description: "Pre-configured ICD-10 coding for common ENT procedures — J32.9 (sinusitis), J35.1 (tonsillar hypertrophy), H91.9 (hearing loss), J34.2 (deviated septum). Accurate billing from day one.",
  },
  {
    icon: ShieldCheck,
    title: "Medical Aid Pre-Authorisation",
    description: "Streamlined pre-authorisation workflows for ENT surgeries. Track approval status, attach clinical motivation, and manage Discovery, Bonitas, and Gems submissions in one place.",
  },
];

const paediatricFeatures = [
  "Paediatric ENT appointment types with longer consultation slots",
  "Child-friendly WhatsApp reminders sent to parents",
  "Grommets and adenoidectomy scheduling with anaesthetist coordination",
  "Growth tracking for recurrent tonsillitis cases",
  "Referral tracking from paediatricians and GPs",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function ENTPage() {
  return (
    <main className="min-h-screen bg-[#1D3443] text-white selection:bg-[#86EFAC]/15">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1D3443]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#3DA9D1] hover:text-[#3DA9D1] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Netcare Health OS
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#3DA9D1] transition-colors"
          >
            Start Free Trial
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
              ENT Practice Management
            </span>
            <h1 className="text-4xl md:text-6xl font-light tracking-[-0.03em] text-white mb-6 leading-tight">
              AI-powered practice management<br />
              <span className="text-[#3DA9D1]">for ENT specialists.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#3DA9D1]/60 max-w-2xl mx-auto leading-relaxed">
              Purpose-built for otolaryngology practices in South Africa. From GP referrals to post-op follow-ups,
              Netcare Health OS handles the admin so you can focus on patients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Keywords bar */}
      <section className="border-y border-white/5 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-[#3DA9D1]/50 font-mono">
          <span>ENT specialist software</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>Otolaryngology practice management</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>South Africa</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>ICD-10 ENT billing</span>
          <span className="text-[#3DA9D1]">|</span>
          <span>POPIA compliant</span>
        </div>
      </section>

      {/* Workflows */}
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
              ENT Workflows
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white max-w-xl">
              Every ENT workflow, automated.
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {workflows.map((w) => (
              <motion.div
                key={w.title}
                variants={itemVariants}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-[#3DA9D1]/20 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center mb-5">
                  <w.icon className="w-5 h-5 text-[#3DA9D1]" />
                </div>
                <h3 className="text-white font-medium text-base mb-3">{w.title}</h3>
                <p className="text-[#3DA9D1]/40 text-sm leading-relaxed">{w.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Paediatric ENT */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[#3DA9D1] font-mono mb-5 block">
              Paediatric ENT
            </span>
            <h2 className="text-3xl md:text-4xl font-light tracking-[-0.03em] text-white max-w-xl">
              Built for paediatric ENT too.
            </h2>
            <p className="text-[#3DA9D1]/50 text-base mt-4 max-w-lg">
              Children need different workflows. Netcare Health OS adapts appointment types, reminder messaging,
              and follow-up schedules for paediatric patients.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {paediatricFeatures.map((f) => (
              <motion.div
                key={f}
                variants={itemVariants}
                className="flex items-start gap-4 py-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] mt-2 shrink-0" />
                <span className="text-[#3DA9D1]/60 text-sm leading-relaxed">{f}</span>
              </motion.div>
            ))}
          </motion.div>
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
              Ready to automate your ENT practice?
            </h2>
            <p className="text-[#3DA9D1]/50 text-base mb-10 max-w-lg mx-auto">
              14-day free trial. No credit card required. Set up in under 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#3DA9D1] transition-colors shadow-lg shadow-[#3DA9D1]/20"
              >
                Start Free Trial
              </Link>
              <Link
                href="/#pricing"
                className="px-8 py-3.5 bg-white/5 text-[#3DA9D1] font-medium text-sm rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer SEO text */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#3DA9D1]/20 text-xs leading-relaxed max-w-2xl mx-auto">
            Netcare Health OS OS is South Africa&apos;s leading AI-powered practice management software for ENT specialists
            and otolaryngologists. Serving practices in Johannesburg, Cape Town, Durban, Pretoria, and across
            Gauteng, Western Cape, and KwaZulu-Natal. POPIA-compliant healthcare software with ICD-10 billing,
            medical aid integration, and WhatsApp patient communication.
          </p>
          <p className="text-[#3DA9D1]/15 text-[11px] font-mono mt-6">
            &copy; {new Date().getFullYear()} Netcare Technology
          </p>
        </div>
      </footer>
    </main>
  );
}
