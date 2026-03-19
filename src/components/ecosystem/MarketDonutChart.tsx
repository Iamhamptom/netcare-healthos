"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const segments = [
  { label: "Hospital Care", value: 42, color: "#10b981", glow: "rgba(16,185,129,0.4)" },
  { label: "Pharmaceuticals", value: 23, color: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  { label: "Medical Devices", value: 15, color: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
  { label: "Digital Health", value: 12, color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  { label: "Diagnostics", value: 8, color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
];

const totalValue = segments.reduce((s, seg) => s + seg.value, 0);

export default function MarketDonutChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  const cx = 160, cy = 160, r = 120, strokeW = 32;
  const circumference = 2 * Math.PI * r;

  let accumulated = 0;
  const arcs = segments.map((seg, i) => {
    const fraction = seg.value / totalValue;
    const dashLen = fraction * circumference;
    const dashGap = circumference - dashLen;
    const offset = -(accumulated * circumference) + circumference * 0.25; // start from top
    accumulated += fraction;
    return { ...seg, dashLen, dashGap, offset, index: i };
  });

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <svg viewBox="0 0 320 320" className="w-full max-w-[320px]">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeW} />

        {arcs.map((arc) => (
          <motion.circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.index ? strokeW + 6 : strokeW}
            strokeLinecap="round"
            strokeDasharray={`${arc.dashLen - 4} ${arc.dashGap + 4}`}
            strokeDashoffset={arc.offset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={inView ? { strokeDasharray: `${arc.dashLen - 4} ${arc.dashGap + 4}` } : {}}
            transition={{ duration: 1.2, delay: arc.index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: hovered === arc.index ? `drop-shadow(0 0 12px ${arc.glow})` : "none",
              cursor: "pointer",
              transition: "stroke-width 0.3s, filter 0.3s",
            }}
            onMouseEnter={() => setHovered(arc.index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* Center text */}
        <motion.text
          x={cx} y={cy - 10}
          textAnchor="middle"
          className="fill-[#3DA9D1] font-mono"
          fontSize="36"
          fontWeight="200"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          $259B
        </motion.text>
        <motion.text
          x={cx} y={cy + 16}
          textAnchor="middle"
          className="fill-white/30 font-mono"
          fontSize="10"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          AFRICA HEALTHCARE
        </motion.text>
        <motion.text
          x={cx} y={cy + 32}
          textAnchor="middle"
          className="fill-white/20 font-mono"
          fontSize="9"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          8% CAGR
        </motion.text>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 w-full max-w-[400px]">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 cursor-pointer ${
              hovered === i
                ? "border-white/20 bg-white/[0.06]"
                : "border-white/[0.04] bg-white/[0.02]"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.2 + i * 0.08 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <div>
              <div className="text-[10px] font-mono text-white/50 leading-tight">{seg.label}</div>
              <div className="text-[11px] font-mono text-white/70">{seg.value}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
