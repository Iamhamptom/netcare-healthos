"use client";

import { motion } from "framer-motion";
import { useBrand, useLabels } from "@/lib/tenant-context";

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
  const brand = useBrand();
  const labels = useLabels();
  const stats = [
    labels.heroStat1,
    labels.heroStat2,
    labels.heroStat3,
  ].map(s => ({ number: s.value, label: s.label }));
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
          Your specialist practice{" "}
          <span style={{ color: brand.primaryColor }}>deserves</span>
          <br />
          the best technology.
        </motion.h2>

        {/* Body text */}
        <motion.p
          variants={fadeUp}
          className="text-gray-600 text-base md:text-lg font-light leading-relaxed mt-10 max-w-2xl mx-auto"
        >
          {brand.name} operates across multiple locations — but specialist practices run on
          fragmented systems. Billing is manual. Pre-authorisations take days. GP referral tracking is non-existent.
          Nothing connects the practice.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-gray-500 text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl mx-auto"
        >
          <span className="text-[#1D3443] font-semibold">{brand.name}</span> was built to fill that gap —
          unifying claims intelligence, financial analytics, patient routing, and compliance
          across your entire practice. One platform. One command center.
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
