"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroProps {
  onEnter: () => void;
}

/* Floating particle — reduced count, subtler */
function Particle({ delay, x, y, size, opacity, driftX, driftX2, duration }: {
  delay: number; x: number; y: number; size: number;
  opacity: number; driftX: number; driftX2: number; duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(61,169,209,${opacity}) 0%, transparent 70%)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        scale: [0, 1, 0.8, 1.1, 0],
        y: [0, -30, -15, -40, -60],
        x: [0, driftX, driftX2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* Glowing ring — more subtle opacity */
function GlowRing({ radius, delay, duration }: { radius: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full border"
      style={{
        width: radius,
        height: radius,
        marginLeft: -radius / 2,
        marginTop: -radius / 2,
        borderColor: "rgba(61,169,209,0.04)",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: [0.8, 1.05, 0.95, 1],
        opacity: [0, 0.2, 0.1, 0.15],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Seeded random for SSR/client consistency
function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function Intro({ onEnter }: IntroProps) {
  const [ready, setReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    const autoEnter = setTimeout(() => onEnter(), 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(autoEnter);
    };
  }, [onEnter]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  // 15 particles — deterministic so server/client match
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: i * 0.5 + seeded(i) * 2,
    x: seeded(i + 100) * 100,
    y: 30 + seeded(i + 200) * 60,
    size: 3 + seeded(i + 300) * 8,
    opacity: 0.15 + seeded(i + 400) * 0.25,
    driftX: seeded(i + 500) * 20 - 10,
    driftX2: seeded(i + 600) * 10 - 5,
    duration: 6 + seeded(i + 700) * 4,
  }));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[1000] bg-[#1D3443] flex items-center justify-center cursor-default overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic gradient that follows mouse */}
      <div
        className="absolute inset-0 transition-all duration-[2000ms] ease-out"
        style={{
          background: `radial-gradient(800px ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(61,169,209,0.05) 0%, transparent 60%)`,
        }}
      />

      {/* Ambient glow orbs — very subtle */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#3DA9D1] rounded-full blur-[280px]"
        animate={{
          opacity: [0.02, 0.05, 0.03, 0.04],
          scale: [1, 1.1, 0.95, 1.05],
          x: [0, 30, -20, 10],
          y: [0, -20, 15, -10],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E3964C] rounded-full blur-[240px]"
        animate={{
          opacity: [0.02, 0.04, 0.02, 0.03],
          scale: [1, 0.9, 1.1, 1],
          x: [0, -25, 20, -15],
          y: [0, 20, -10, 15],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} opacity={p.opacity} driftX={p.driftX} driftX2={p.driftX2} duration={p.duration} />
      ))}

      {/* Concentric glow rings — subtle */}
      <GlowRing radius={200} delay={0.5} duration={8} />
      <GlowRing radius={350} delay={1} duration={10} />
      <GlowRing radius={500} delay={1.5} duration={12} />
      <GlowRing radius={700} delay={2} duration={14} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(61,169,209,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(61,169,209,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Netcare logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <img
            src="/images/netcare-logo.png"
            alt="Netcare"
            className="h-12 md:h-16 mx-auto"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-4"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] text-white font-light leading-none">
            Health<span style={{
              textShadow: "0 0 30px rgba(61,169,209,0.6), 0 0 80px rgba(61,169,209,0.25)",
              color: "#3DA9D1",
            }}>OS</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-4"
        >
          <p className="text-sm text-white/40 font-medium tracking-[0.3em] uppercase">
            Primary Healthcare Operations
          </p>
        </motion.div>

        {/* Animated divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-px mx-auto mb-12 origin-center"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(227,150,76,0.4), transparent)",
          }}
        />

        {/* Enter button */}
        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.button
                onClick={onEnter}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className="group relative px-10 py-4 rounded-full text-sm font-medium border border-white/10 bg-transparent transition-all duration-300 hover:border-[#E3964C]/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 text-white/60 group-hover:text-white flex items-center gap-3 transition-colors duration-300">
                  Enter Platform
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    animate={{ x: hovering ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </span>
              </motion.button>

              {/* Auto-enter progress bar */}
              <motion.div
                className="mt-8 w-32 h-px mx-auto bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                <motion.div
                  className="h-full bg-[#3DA9D1]/50"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, delay: 0, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1D3443] to-transparent z-[3]" />

      {/* Corner decorative elements */}
      <motion.div
        className="absolute top-8 left-8 text-[11px] text-white/10 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
       
      >
        V1.0
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-8 text-[11px] text-white/10 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
       
      >
        NETCARE PRIMARY HEALTHCARE
      </motion.div>
    </motion.div>
  );
}
