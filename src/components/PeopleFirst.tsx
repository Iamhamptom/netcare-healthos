"use client";

import { motion } from "framer-motion";

const values = [
  {
    number: "01",
    title: "We find your patients",
    description:
      "Our Signal Lead Gen system identifies people in your area who need healthcare but haven\u2019t booked. We bring them to your door through targeted, automated outreach across WhatsApp, SMS, and calls.",
  },
  {
    number: "02",
    title: "We fill your calendar",
    description:
      "From first contact to confirmed booking, our AI handles the entire journey. Smart scheduling, automated reminders, and no-show prevention mean your calendar stays full and your revenue grows.",
  },
  {
    number: "03",
    title: "We run your practice ops",
    description:
      "Newsletters, follow-ups, recall campaigns, patient communications \u2014 all automated. Your team focuses on care while our agents handle everything else.",
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

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function PeopleFirst() {
  return (
    <section className="relative w-full bg-white py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-6xl mx-auto"
      >
        {/* Section label */}
        <motion.div variants={fadeUp} className="text-center">
          <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono">
            People First
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mt-8 text-center leading-[1.2]"
        >
          We believe in <span className="text-[#1D8AB5]">people</span>
        </motion.h2>

        {/* Body */}
        <motion.p
          variants={fadeUp}
          className="text-gray-600 text-base md:text-lg font-light leading-relaxed mt-10 max-w-3xl mx-auto text-center"
        >
          Netcare Health OS is a people-first company. Behind every booking is a
          person who needs care. Behind every practice is a team that chose
          healthcare to make a difference. We build technology that serves both
          &mdash; making healthcare accessible, human, and effortless.
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={fadeUp}
          className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-16 mb-16"
        />

        {/* Value cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="bg-[#F0F9FF] border border-[#E0F2FE] rounded-2xl p-8"
            >
              <div className="text-[#1D8AB5] text-4xl font-extralight tracking-tight mb-5 font-mono">
                {value.number}
              </div>
              <h3 className="text-gray-900 font-medium text-lg mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed font-light">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
