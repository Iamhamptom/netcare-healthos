"use client";

import { motion } from "framer-motion";

const verticals = [
  {
    id: "dentist",
    title: "Dentists",
    subtitle: "Private Practice Suite",
    icon: (
      <svg className="w-6 h-6 text-[#1D8AB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
    features: [
      "WhatsApp AI receptionist with dental FAQ",
      "6-month recall automation",
      "Invisalign & whitening follow-ups",
      "Deposit enforcement for implants/cosmetic",
      "Post-treatment review requests",
      "Waitlist fill for cancellations",
    ],
    stat: "35%",
    statLabel: "fewer no-shows on average",
  },
  {
    id: "radiology",
    title: "Radiology",
    subtitle: "Imaging Ops Suite",
    icon: (
      <svg className="w-6 h-6 text-[#1D8AB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    features: [
      "Referral intake router (email/WhatsApp/web)",
      "Structured job card creation",
      "Automated prep instructions (contrast/fasting)",
      "Missing info requests to referring docs",
      "Report delivery confirmation",
      "Urgent findings escalation workflow",
    ],
    stat: "60%",
    statLabel: "faster referral processing",
  },
  {
    id: "wellness",
    title: "Spas & Wellness",
    subtitle: "Wellness Edition",
    icon: (
      <svg className="w-6 h-6 text-[#1D8AB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    features: [
      "Treatment rebooking reminders",
      "Package expiry nudges",
      "Membership renewal automation",
      "Seasonal promo campaign blasts",
      "WhatsApp booking + gift vouchers",
      "Client retention scoring",
    ],
    stat: "28%",
    statLabel: "increase in rebookings",
  },
  {
    id: "hospital",
    title: "Hospitals",
    subtitle: "Enterprise Suite",
    icon: (
      <svg className="w-6 h-6 text-[#1D8AB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    features: [
      "Multi-department triage bots",
      "Patient queue & flow updates",
      "Complaint routing & resolution",
      "Staff SOP assistant",
      "Bulk patient communications",
      "Executive KPI dashboards",
    ],
    stat: "40%",
    statLabel: "reduction in call volume",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function Verticals() {
  return (
    <section className="relative w-full bg-[#FAFAFA] py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden">
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
            Verticals
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 max-w-xl">
            Built for every corner of healthcare.
          </h2>
        </motion.div>

        {/* Green gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#BAE6FD] to-transparent mb-16" />

        {/* Vertical cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {verticals.map((v) => (
            <motion.div
              key={v.id}
              variants={cardVariants}
              className="group relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:shadow-[#3DA9D1]/5 hover:border-[#E0F2FE] hover:bg-gradient-to-br hover:from-[#F0F9FF]/30 hover:to-white hover:-translate-y-0.5 transition-all duration-500"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#F0F9FF] flex items-center justify-center mb-6">
                {v.icon}
              </div>

              {/* Title + subtitle */}
              <h3 className="text-gray-900 font-medium text-lg mb-1">{v.title}</h3>
              <p className="text-gray-400 text-xs font-mono tracking-wide mb-6">
                {v.subtitle}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {v.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-[#3DA9D1] mt-2 shrink-0" />
                    <span className="text-gray-500 text-sm font-light leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stat */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-[#1D3443]/15 text-6xl font-extralight tracking-tight">
                    {v.stat}
                  </span>
                  <span className="text-gray-400 text-xs font-mono">
                    {v.statLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
