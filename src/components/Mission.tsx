"use client";

import { motion } from "framer-motion";

const stats = [
  { number: "72%", label: "of adults skip routine checkups" },
  { number: "1 in 3", label: "avoid the dentist entirely" },
  { number: "We're", label: "changing that" },
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
          <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono">
            Our Mission
          </span>
        </motion.div>

        {/* Heading — dark gray with green accent */}
        <motion.h2
          variants={fadeUp}
          className="text-3xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mt-8 leading-[1.2]"
        >
          Getting{" "}
          <span className="text-[#1D8AB5]">Africa healthy</span>,
          <br />
          one person at a time.
        </motion.h2>

        {/* Body text — readable on white */}
        <motion.p
          variants={fadeUp}
          className="text-gray-600 text-base md:text-lg font-light leading-relaxed mt-10 max-w-2xl mx-auto"
        >
          Studies show most people find it hard to walk through that door
          — whether it&apos;s blood tests, dental checkups, or routine
          screenings. Healthcare should be accessible to everyone, everywhere.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-gray-500 text-base md:text-lg font-light leading-relaxed mt-6 max-w-2xl mx-auto"
        >
          Netcare Health OS exists to bridge that gap. We help practices and health
          centres reach the right people, fill their bookings, and make
          healthcare less intimidating. From Johannesburg to Lagos, we&apos;re
          on a mission to get people through that door.
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
