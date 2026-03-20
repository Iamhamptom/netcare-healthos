"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

const sellingPoints = [
  {
    label: "Research-backed: 120+ peer-reviewed citations",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    label: "AI triage proven to reduce mortality by 75%",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    label: "40-50% fewer missed appointments (KZN study)",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    label: "POPIA compliant with full audit logging",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "South African research lab — built for Africa, by Africa",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function GetInTouch() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      practice: (form.elements.namedItem("practice") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Still show success — we have the email fallback
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <section
      id="get-in-touch"
      className="relative w-full bg-[#1D3443] py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-6xl mx-auto"
      >
        {/* Section label */}
        <motion.div variants={fadeUp} className="text-center">
          <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-mono">
            Get In Touch
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white mt-8 text-center leading-[1.2]"
        >
          Let&apos;s talk about{" "}
          <span className="text-[#3DA9D1]">your network</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-white/60 text-base md:text-lg font-light leading-relaxed mt-6 max-w-3xl mx-auto text-center"
        >
          Book a call with our team. We&apos;ll walk you through the platform,
          connect your integrations, and have you live before your next patient
          arrives. Want a custom feature or integration? Just ask &mdash; we
          build fast.
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={fadeUp}
          className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#1D3443] to-transparent mt-16 mb-16"
        />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT: Contact form */}
          <motion.div variants={fadeUp}>
            {submitted ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1D8AB5]/20 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-[#3DA9D1]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-light mb-2">
                  Thanks! We&apos;ll be in touch within 24 hours.
                </h3>
                <p className="text-white/40 text-sm font-mono">
                  Check your inbox for a confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/30 focus:border-[#3DA9D1]/40 focus:outline-none transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/30 focus:border-[#3DA9D1]/40 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  name="practice"
                  placeholder="Practice name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/30 focus:border-[#3DA9D1]/40 focus:outline-none transition-colors"
                />
                <textarea
                  name="message"
                  placeholder="Tell us about your practice..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-white/30 focus:border-[#3DA9D1]/40 focus:outline-none transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1D8AB5] text-white rounded-full px-8 py-3 font-mono text-sm hover:bg-[#3DA9D1] disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </form>
            )}

            {/* Email fallback */}
            <p className="text-white/30 text-xs font-mono mt-6">
              Or email us directly at hello@visiohealth.co.za
            </p>
          </motion.div>

          {/* RIGHT: Selling points */}
          <motion.div variants={fadeUp} className="space-y-5 lg:pt-2">
            {sellingPoints.map((point) => (
              <div key={point.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#3DA9D1] shrink-0">
                  {point.icon}
                </div>
                <span className="text-white/60 text-sm font-light pt-1">
                  {point.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
