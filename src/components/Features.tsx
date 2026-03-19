"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Signal Lead Gen",
    description:
      "Our AI scans the market to find people who need your services. We identify high-intent prospects and bring them directly to your practice.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    title: "Automated Outreach",
    description:
      "Reach new and existing patients via WhatsApp, SMS, and automated calls. Personalized messages at scale — no manual effort required.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    title: "Smart Booking Engine",
    description:
      "AI manages your entire calendar. Patients book instantly, conflicts are prevented, and slots are optimized for maximum revenue.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: "Reminder System",
    description:
      "Automated reminders via SMS, WhatsApp, and calls. Patients confirm, reschedule, or cancel — reducing no-shows by up to 60%.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    title: "Newsletter & Campaigns",
    description:
      "Keep patients engaged with automated newsletters, health tips, seasonal campaigns, and recall reminders. Build loyalty on autopilot.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
  {
    title: "AI Practice Assistant",
    description:
      "A fully autonomous agent that handles triage, intake, follow-ups, and patient inquiries 24/7. Your practice never sleeps.",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V19a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.5"
        />
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
          <span className="inline-block uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono mb-6">
            Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900">
            Everything to grow your{" "}
            <span className="text-[#1D3443]">practice.</span>
          </h2>
        </motion.div>

        {/* Green gradient divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#BAE6FD] to-transparent mb-16 md:mb-20" />

        {/* Feature cards — 3 columns on large, wrapping naturally for 8 items */}
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
              <div className="w-10 h-10 rounded-xl bg-[#F0F9FF] flex items-center justify-center text-[#1D8AB5] mb-4">
                {feature.icon}
              </div>
              <h3 className="text-gray-900 font-medium text-base mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
