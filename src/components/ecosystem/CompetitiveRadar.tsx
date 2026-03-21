"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const categories = [
  "AI Automation",
  "WhatsApp Native",
  "Full PM Suite",
  "Compliance",
  "Marketplace",
  "Clinical AI",
  "Integrations",
  "Cloud Native",
];

const competitors = [
  {
    name: "Netcare Health OS",
    scores: [95, 100, 90, 95, 100, 95, 85, 100],
    color: "#10b981",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    name: "GoodX",
    scores: [10, 5, 80, 20, 5, 5, 30, 20],
    color: "rgba(255,255,255,0.2)",
    glow: "transparent",
  },
  {
    name: "Healthbridge",
    scores: [15, 10, 40, 25, 10, 10, 70, 70],
    color: "rgba(255,255,255,0.15)",
    glow: "transparent",
  },
];

function polarToCartesian(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (2 * Math.PI * angleIndex) / total - Math.PI / 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function getPolygonPoints(scores: number[], cx: number, cy: number, maxR: number, total: number) {
  return scores
    .map((score, i) => {
      const r = (score / 100) * maxR;
      const p = polarToCartesian(cx, cy, r, i, total);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

export default function CompetitiveRadar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeCompetitor, setActiveCompetitor] = useState(0);

  const cx = 200, cy = 200, maxR = 150;
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-[420px]">
        {/* Concentric rings */}
        {rings.map((scale) => (
          <motion.circle
            key={scale}
            cx={cx}
            cy={cy}
            r={maxR * scale}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: scale * 0.15 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, i) => {
          const p = polarToCartesian(cx, cy, maxR, i, categories.length);
          return (
            <motion.line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
            />
          );
        })}

        {/* Competitor polygons */}
        {competitors.map((comp, ci) => {
          const points = getPolygonPoints(comp.scores, cx, cy, maxR, categories.length);
          const isActive = ci === activeCompetitor;
          return (
            <motion.polygon
              key={comp.name}
              points={points}
              fill={isActive ? `${comp.color}15` : "transparent"}
              stroke={comp.color}
              strokeWidth={isActive ? 2.5 : 1}
              strokeLinejoin="round"
              style={{
                filter: isActive ? `drop-shadow(0 0 10px ${comp.glow})` : "none",
                cursor: "pointer",
                transition: "all 0.4s ease",
              }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: isActive ? 1 : 0.4 } : {}}
              transition={{ duration: 0.8, delay: 0.6 + ci * 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setActiveCompetitor(ci)}
            />
          );
        })}

        {/* Score dots for active competitor */}
        {competitors[activeCompetitor].scores.map((score, i) => {
          const r = (score / 100) * maxR;
          const p = polarToCartesian(cx, cy, r, i, categories.length);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={competitors[activeCompetitor].color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 1 + i * 0.05, type: "spring" }}
              style={{
                filter: `drop-shadow(0 0 6px ${competitors[activeCompetitor].glow})`,
              }}
            />
          );
        })}

        {/* Category labels */}
        {categories.map((cat, i) => {
          const labelR = maxR + 22;
          const p = polarToCartesian(cx, cy, labelR, i, categories.length);
          return (
            <motion.text
              key={cat}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white/30 font-mono"
              fontSize="8"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.05 }}
            >
              {cat}
            </motion.text>
          );
        })}
      </svg>

      {/* Competitor selector */}
      <div className="flex gap-3 mt-4">
        {competitors.map((comp, i) => (
          <motion.button
            key={comp.name}
            onClick={() => setActiveCompetitor(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-[11px] transition-all duration-300 ${
              activeCompetitor === i
                ? "border-white/20 bg-white/[0.06] text-white/80"
                : "border-white/[0.04] bg-transparent text-white/70 hover:border-white/10"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp.color }} />
            {comp.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
