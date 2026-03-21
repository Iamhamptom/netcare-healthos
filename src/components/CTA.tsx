"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ctaWords = ["Ready", "to", "transform", "your", "network", "with"];

export default function CTA() {
  return (
    <section className="relative w-full bg-[#1D3443] py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[350px] opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, #3DA9D1 0%, transparent 70%)" }} />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#3DA9D1]/[0.03] rounded-full blur-[180px] pointer-events-none"
        animate={{
          x: [0, 40, -20, 30, 0],
          y: [0, -30, 15, -10, 0],
          scale: [1, 1.15, 0.9, 1.05, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[#E3964C]/[0.025] rounded-full blur-[160px] pointer-events-none"
        animate={{
          x: [0, -35, 25, -15, 0],
          y: [0, 25, -20, 35, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white leading-[1.1]">
          {ctaWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="text-[#3DA9D1] inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: ctaWords.length * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ textShadow: "0 0 40px rgba(61,169,209,0.3), 0 0 80px rgba(61,169,209,0.15)" }}
          >
            AI intelligence?
          </motion.span>
        </h2>
        <p className="text-white/50 text-lg font-light mt-6 max-w-lg mx-auto leading-relaxed">
          88 clinics. R33M+ in addressable claims. 50% faster processing. One command center for your entire primary healthcare network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="/login"
            className="px-10 py-4 text-base font-semibold bg-[#E3964C] text-white rounded-full hover:bg-[#D4843A] transition-all duration-300 inline-flex items-center gap-2"
            style={{ animation: "breathingGlow 3s ease-in-out infinite" }}
          >
            Schedule a Demo
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="px-10 py-4 text-base font-medium text-white/60 rounded-full border border-white/10 hover:border-white/20 hover:text-white/60 transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
