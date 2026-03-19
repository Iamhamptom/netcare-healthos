"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { blurPlaceholders } from "@/lib/blur-placeholders";

const steps = [
  {
    number: "01",
    title: "WhatsApp Patient Router",
    description:
      "Patients message one WhatsApp number. AI identifies the service needed, finds the nearest Medicross with availability, and routes them — GP, dental, optometry, pharmacy.",
    image: "/images/step-whatsapp.png",
  },
  {
    number: "02",
    title: "AI Claims Pre-Validation",
    description:
      "Before every claim hits Altron SwitchOn, our AI validates ICD-10-ZA codes, NAPPI codes, and PMB benefit limits. 75% of rejectable claims caught before submission.",
    image: "/images/step-ai-chat.png",
  },
  {
    number: "03",
    title: "Smart Booking Engine",
    description:
      "AI manages calendars across 568 practitioners. Patients book via WhatsApp or online. No-show prediction with automated reminders reduces missed appointments by 40%.",
    image: "/images/step-booking.png",
  },
  {
    number: "04",
    title: "Network Financial Dashboard",
    description:
      "Real-time divisional P&L across 88 clinics. Revenue by region, EBITDA tracking, debtor aging, claims analytics — replacing fragmented Excel reporting.",
    image: "/images/step-followup.png",
  },
  {
    number: "05",
    title: "Compliance Automation",
    description:
      "POPIA consent tracking, HPCSA Booklet 10 alignment, audit logging, and breach detection — automated across all 88 clinics in 8 provinces.",
    image: "/images/step-followup.png",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants = (i: number) => ({
  hidden: { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
});

const numberVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative w-full bg-white py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[#E0F2FE] rounded-full blur-[350px] opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-24"
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#1D8AB5] font-mono mb-5 block">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 max-w-lg mb-6">
            From fragmented to unified.
          </h2>
          <p className="text-gray-500 text-sm font-light leading-relaxed max-w-md">
            Five AI modules that transform Netcare Primary Healthcare operations — from claims to compliance.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-20" />

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-0"
        >
          {steps.map((step, i) => (
            <motion.div key={step.number} variants={stepVariants(i)}>
              {/* Step row */}
              <div className="group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-12 md:py-16 items-center">
                {/* Large number */}
                <motion.div
                  className="md:col-span-1 relative"
                  variants={numberVariants}
                >
                  <span className="text-[#E0F2FE] text-7xl md:text-8xl font-extralight leading-none select-none">
                    {step.number}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="md:col-span-4">
                  <h3 className="text-gray-900 font-medium text-xl mb-2 group-hover:text-[#1D3443] transition-colors duration-500">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Step image */}
                <div className="md:col-span-7 relative">
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-gray-100 group-hover:border-[#BAE6FD] group-hover:shadow-lg group-hover:shadow-[#F0F9FF] transition-all duration-500">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      placeholder="blur"
                      blurDataURL={blurPlaceholders[step.image.replace("/images/", "").replace(".png", "")]}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Connecting line between steps */}
              {i < steps.length - 1 && (
                <div className="relative h-px">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#BAE6FD] to-transparent" />
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#BAE6FD]" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 flex items-center gap-4"
        >
          <a
            href="/register"
            className="group px-7 py-3.5 border border-gray-200 text-gray-700 text-sm font-mono tracking-wide rounded-full hover:border-[#BAE6FD] hover:text-[#1D3443] hover:shadow-md hover:shadow-[#E0F2FE]/50 transition-all duration-500 inline-flex items-center gap-3"
          >
            Start Free Trial
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-[#3DA9D1] group-hover:translate-x-0.5 transition-all duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
              />
            </svg>
          </a>
          <a
            href="/how-it-works"
            className="px-7 py-3.5 text-gray-400 text-sm font-mono tracking-wide hover:text-[#1D8AB5] transition-colors duration-300"
          >
            Learn more
          </a>
        </motion.div>
      </div>
    </section>
  );
}
