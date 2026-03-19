"use client";

import { motion } from "framer-motion";

const stats = [
  { number: "R662M", label: "Primary Care division revenue" },
  { number: "3.5M", label: "patients served annually" },
  { number: "24.5%", label: "EBITDA margin — and growing" },
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

const statVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function Mission() {
  return (
    <section
      className="relative w-full bg-white py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Section label */}
        <motion.div variants={fadeUp}>
          <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-semibold">
            The Opportunity
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mt-8 leading-[1.2]"
         
        >
          South Africa&apos;s largest{" "}
          <span className="text-[#3DA9D1]">primary care network</span>
          <br />
          deserves the best technology.
        </motion.h2>

        {/* Body text */}
        <motion.p
          variants={fadeUp}
          className="text-gray-600 text-base md:text-lg font-light leading-relaxed mt-10 max-w-2xl mx-auto"
        >
          Netcare Primary Healthcare operates 88 clinics, 41 pharmacies, and 12 day theatres with 568 practitioners
          — but the primary care division runs on fragmented systems. CareOn powers the hospitals. Healthbridge and GoodX
          power individual clinics. Nothing connects the network.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-gray-500 text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl mx-auto"
        >
          <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> was built to fill that gap —
          unifying claims intelligence, financial analytics, patient routing, and compliance
          across the entire Netcare Primary Healthcare division. One platform. One command center.
        </motion.p>

        {/* Divider — subtle on white */}
        <motion.div
          variants={fadeUp}
          className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-16 mb-16"
        />

        {/* Stats — white region, green numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="text-center"
            >
              <div className="text-[#1D8AB5] text-5xl md:text-6xl font-extralight tracking-tight leading-none mb-3">
                {stat.number}
              </div>
              <div className="text-gray-500 text-xs font-mono tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
