"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const problems = [
  { label: "Revenue lost to no-shows", value: 25, display: "15–25%", color: "#ef4444" },
  { label: "Doctors leaving SA", value: 27, display: "27%", color: "#f97316" },
  { label: "Still on paper systems", value: 65, display: "65%+", color: "#f59e0b" },
  { label: "Use public healthcare", value: 84, display: "84%", color: "#dc2626" },
  { label: "Medical aid scheme complexity", value: 80, display: "80+ schemes", color: "#fb923c" },
];

const solutions = [
  { label: "WhatsApp penetration", value: 98, display: "98%", color: "#10b981" },
  { label: "No-show reduction", value: 60, display: "60%", color: "#22c55e" },
  { label: "Setup time", value: 95, display: "5 min", color: "#34d399" },
  { label: "AI uptime", value: 100, display: "24/7", color: "#6ee7b7" },
  { label: "Cost reduction", value: 40, display: "40%+", color: "#4ade80" },
];

function AnimatedBar({ item, index, inView, maxVal, isGreen }: {
  item: typeof problems[0];
  index: number;
  inView: boolean;
  maxVal: number;
  isGreen?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const widthPercent = (item.value / maxVal) * 100;

  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, x: isGreen ? 20 : -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-mono text-white/40">{item.label}</span>
        <motion.span
          className="text-[13px] font-mono font-medium"
          style={{ color: item.color }}
          animate={hovered ? { scale: 1.15 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {item.display}
        </motion.span>
      </div>
      <div className="h-6 rounded-lg bg-white/[0.03] overflow-hidden relative">
        <motion.div
          className="h-full rounded-lg relative overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${item.color}50, ${item.color}20)`,
          }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${widthPercent}%` } : {}}
          transition={{ duration: 1, delay: 0.3 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${item.color}30, transparent)`,
              backgroundSize: "200% 100%",
            }}
            animate={inView ? { backgroundPosition: ["200% 0", "-200% 0"] } : {}}
            transition={{ duration: 3, delay: 1.5 + index * 0.12, repeat: Infinity, repeatDelay: 4 }}
          />
        </motion.div>

        {/* Pulse dot at end of bar */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: item.color,
            boxShadow: `0 0 8px ${item.color}`,
            left: `${widthPercent}%`,
            marginLeft: "-4px",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: [0, 1], scale: [0, 1] } : {}}
          transition={{ duration: 0.4, delay: 1.2 + index * 0.12 }}
        />
      </div>
    </motion.div>
  );
}

export default function ProblemBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Problems */}
      <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.02] p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.3em] text-red-400/60 uppercase">
            The Crisis
          </span>
        </div>
        <div className="space-y-5">
          {problems.map((item, i) => (
            <AnimatedBar key={item.label} item={item} index={i} inView={inView} maxVal={100} />
          ))}
        </div>
      </div>

      {/* Solutions */}
      <div className="rounded-2xl border border-[#3DA9D1]/10 bg-[#3DA9D1]/[0.02] p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-[#3DA9D1] animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.3em] text-[#3DA9D1]/60 uppercase">
            Our Impact
          </span>
        </div>
        <div className="space-y-5">
          {solutions.map((item, i) => (
            <AnimatedBar key={item.label} item={item} index={i} inView={inView} maxVal={100} isGreen />
          ))}
        </div>
      </div>
    </div>
  );
}
