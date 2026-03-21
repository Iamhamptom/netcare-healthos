"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useBrand } from "@/lib/tenant-context";

const swapWords = ["claims intelligence", "financial analytics", "operational efficiency", "network oversight"];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  const brand = useBrand();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse-following glow
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  // Word swap state
  const [wordIndex, setWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const cycleWord = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setWordIndex((prev) => (prev + 1) % swapWords.length);
      setIsAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleWord, 3000);
    return () => clearInterval(interval);
  }, [cycleWord]);

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center bg-[#1D3443]"
    >
      {/* Floating gradient orbs — warm teal + amber */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#3DA9D1]/[0.06] rounded-full blur-[200px] pointer-events-none"
        animate={{
          x: [0, 50, -30, 20, 0],
          y: [0, -40, 20, -20, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#E3964C]/[0.05] rounded-full blur-[180px] pointer-events-none"
        animate={{
          x: [0, -40, 30, -10, 0],
          y: [0, 30, -20, 40, 0],
          scale: [1, 0.9, 1.15, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-[#3DA9D1]/[0.025] rounded-full blur-[160px] pointer-events-none"
        animate={{
          x: [0, 60, -20, 40, 0],
          y: [0, -30, 50, -10, 0],
          scale: [1, 1.1, 0.85, 1.05, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Mouse-following radial glow */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: useTransform(
            [smoothX, smoothY],
            ([x, y]: number[]) =>
              `radial-gradient(600px circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(61,169,209,0.06), transparent 60%)`
          ),
        }}
      />

      {/* Subtle animated grid overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(61,169,209,0.03) 45%, rgba(61,169,209,0.05) 50%, rgba(61,169,209,0.03) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
      />

      {/* Radial gradient glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(61,169,209,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Edge fades */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-[#1D3443] via-transparent to-transparent pointer-events-none" />

      {/* Bottom gradient transition to white */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white z-[3]" />

      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto py-40 md:py-52"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Tenant logo */}
        <motion.div variants={fadeUp} className="mb-8">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="h-8 mx-auto mb-4" />
          ) : (
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: brand.primaryColor }}>
              {brand.name.charAt(0)}
            </div>
          )}
          <span className="uppercase tracking-[0.3em] text-xs text-white/70 font-semibold">
            {brand.tagline || "AI Healthcare Operations"}
          </span>
        </motion.div>

        {/* Main heading with word swap */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-light tracking-[-0.04em] text-white mb-8"
         
        >
          {"88 clinics.".split(" ").map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.35em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          ))}
          <br />
          <span className="relative inline-block">
            One{" "}
            <span className="relative inline-block overflow-hidden align-bottom min-w-[200px] md:min-w-[320px]">
              <span
                className={`inline-block ${
                  isAnimating ? "word-exit" : "word-enter"
                }`}
                style={{
                  textShadow: "0 0 40px rgba(61,169,209,0.3), 0 0 80px rgba(61,169,209,0.15)",
                  color: "white",
                }}
              >
                {swapWords[wordIndex]}
              </span>
            </span>
            <span style={{ textShadow: "0 0 30px rgba(227,150,76,0.3)" }}>.</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-lg text-white/60 font-light max-w-2xl mx-auto mt-8 leading-relaxed"
        >
          {brand.name} is an AI-powered operations platform that unifies
          claims intelligence, financial analytics, and practice management
          across your entire primary healthcare network.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#E3964C] text-white text-sm font-semibold hover:bg-[#D4843A] hover:shadow-[0_0_40px_rgba(227,150,76,0.15)] transition-all duration-300"
          >
            Access Dashboard
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/20 hover:text-white transition-all duration-300"
          >
            Learn More
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          variants={fadeUp}
          className="mt-20 flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/70 font-medium"
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            POPIA Compliant
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>88 Clinics Nationwide</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>R33M+ Claims Addressable</span>
        </motion.div>

        {/* Network stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex items-center justify-center gap-8 md:gap-12 mt-16 pt-16 border-t border-white/[0.06]"
        >
          {[
            { value: "88", label: "Clinics in Network" },
            { value: "R33M+", label: "Claims Addressable" },
            { value: "50%", label: "Faster Processing" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extralight text-white mb-1">{stat.value}</div>
              <div className="text-[11px] text-white/70 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Research link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-8 text-center"
        >
          <a href="/research/vrl-001" className="text-[12px] text-white/70 font-medium hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/10">
            Visio Research Labs — VRL-001: The Routing Crisis (120+ citations) →
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-5 h-5 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
