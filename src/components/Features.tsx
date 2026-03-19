"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "AI Claims Intelligence",
    description:
      "Pre-validates ICD-10-ZA codes, NAPPI codes, and PMB benefits before claims hit Altron SwitchOn. Turns your 15-25% first-pass rejection rate into under 5%.",
    tag: "R1.8M/month recovered",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "WhatsApp Patient Router",
    description:
      "One WhatsApp number for all 88 clinics. AI routes patients to the nearest Medicross based on location, service needed, and real-time availability.",
    tag: "24/7 access, 60% fewer calls",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: "Network Financial Dashboard",
    description:
      "Real-time divisional P&L across 88 clinics, 41 pharmacies, 12 day theatres. EBITDA tracking, debtor aging, and eRA reconciliation — replacing fragmented Excel reporting.",
    tag: "R840K/month saved",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: "Smart Booking Engine",
    description:
      "AI manages calendars across 568 practitioners. Patients book via WhatsApp or online, no-shows are predicted and prevented with automated reminders.",
    tag: "40% fewer no-shows",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "POPIA Compliance Engine",
    description:
      "Automated consent tracking (s18-s72 POPIA), HPCSA Booklet 10 alignment, audit logging, and breach detection across all clinics in 8 provinces.",
    tag: "100% audit-ready",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Capitation Analytics",
    description:
      "Real-time monitoring of Prime Cure per-member-per-month spend vs capitation rates. Fee-for-service vs capitation comparison with actuarial-grade reporting.",
    tag: "R660K/month early detection",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V19a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.5" />
      </svg>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function Features() {
  return (
    <section
      id="features"
      className="relative w-full bg-white py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-20 text-center"
        >
          <span className="inline-block uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-semibold mb-6">
            Built for Netcare by VisioHealth OS
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Your AI operations{" "}
            <span className="text-[#1D3443]">suite.</span>
          </h2>
          <p className="text-[15px] text-gray-400 mt-4 max-w-xl mx-auto">
            6 AI-powered modules purpose-built for Netcare Primary Healthcare — integrating with CareOn, SwitchOn, MediSwitch, and your existing systems.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3DA9D1]/20 to-transparent mb-16 md:mb-20" />

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="group bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-[#3DA9D1]/5 hover:bg-gradient-to-br hover:from-[#F0F9FF]/30 hover:to-white hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1D3443]/5 flex items-center justify-center text-[#3DA9D1] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-gray-900 font-medium text-base mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light mb-3">
                {feature.description}
              </p>
              <span className="inline-block text-[11px] font-semibold text-[#E3964C] bg-[#E3964C]/10 px-2 py-0.5 rounded-full">
                {feature.tag}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Powered by */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-[12px] text-gray-300">
            Powered by <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> &middot; Built by <span className="text-[#3DA9D1] font-semibold">Visio Research Labs</span> &middot; 120+ peer-reviewed citations
          </p>
        </motion.div>
      </div>
    </section>
  );
}
