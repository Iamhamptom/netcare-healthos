"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const regions = [
  {
    name: "South Africa",
    phase: "Phase 1",
    year: "2026",
    practitioners: "73K+",
    market: "R250B+",
    status: "active",
    position: { x: 52, y: 72 },
    dots: [
      { x: 50, y: 68, label: "Gauteng" },
      { x: 47, y: 74, label: "W. Cape" },
      { x: 53, y: 72, label: "KZN" },
    ],
    color: "#10b981",
  },
  {
    name: "West Africa",
    phase: "Phase 2",
    year: "2027",
    practitioners: "120K+",
    market: "$25B+",
    status: "planned",
    position: { x: 38, y: 52 },
    dots: [
      { x: 36, y: 50, label: "Nigeria" },
      { x: 33, y: 48, label: "Ghana" },
    ],
    color: "#8b5cf6",
  },
  {
    name: "East Africa",
    phase: "Phase 2",
    year: "2028",
    practitioners: "80K+",
    market: "$20B+",
    status: "planned",
    position: { x: 56, y: 55 },
    dots: [
      { x: 57, y: 52, label: "Kenya" },
      { x: 55, y: 58, label: "Tanzania" },
    ],
    color: "#8b5cf6",
  },
  {
    name: "Asia",
    phase: "Phase 3",
    year: "2029",
    practitioners: "2M+",
    market: "$120B+",
    status: "vision",
    position: { x: 75, y: 45 },
    dots: [
      { x: 72, y: 42, label: "India" },
      { x: 80, y: 48, label: "SEA" },
    ],
    color: "#06b6d4",
  },
  {
    name: "Americas",
    phase: "Phase 3",
    year: "2029",
    practitioners: "500K+",
    market: "$60B+",
    status: "vision",
    position: { x: 22, y: 55 },
    dots: [
      { x: 20, y: 52, label: "Brazil" },
      { x: 18, y: 48, label: "Mexico" },
    ],
    color: "#06b6d4",
  },
  {
    name: "Global",
    phase: "Phase 4",
    year: "2030+",
    practitioners: "10M+",
    market: "$259B+",
    status: "vision",
    position: { x: 48, y: 35 },
    dots: [
      { x: 44, y: 32, label: "EU" },
      { x: 52, y: 30, label: "UK" },
      { x: 16, y: 35, label: "US" },
    ],
    color: "#f59e0b",
  },
];

export default function ExpansionMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);

  return (
    <div ref={ref}>
      {/* Map visualization */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden p-6 md:p-8">
        <svg viewBox="0 0 100 90" className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Simplified world map outline - abstract grid */}
          <defs>
            <pattern id="mapGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.2" />
            </pattern>
            <radialGradient id="activeGlow">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="100" height="90" fill="url(#mapGrid)" />

          {/* Continental outlines - abstract shapes */}
          <motion.path
            d="M10,25 Q15,20 25,22 Q30,18 35,22 L32,35 Q28,45 20,48 L15,52 Q12,48 10,40 Z"
            fill="rgba(255,255,255,0.015)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2 }}
          />
          <motion.path
            d="M25,20 Q35,15 48,18 Q52,15 55,20 L58,22 Q60,18 65,22 Q68,25 65,30 L55,28 Q48,32 42,35 L38,40 Q30,45 28,50 L32,55 Q35,62 40,68 L45,72 Q50,78 48,82 L52,76 Q56,68 58,62 L56,55 Q58,48 62,42 L68,38 Q72,35 75,30 L70,25 Q65,22 60,22"
            fill="rgba(255,255,255,0.015)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, delay: 0.3 }}
          />
          <motion.path
            d="M65,25 Q72,20 80,22 Q85,25 88,30 L90,40 Q88,50 85,55 L80,52 Q78,48 75,45 Q72,42 70,38 Q68,35 65,30 Z"
            fill="rgba(255,255,255,0.015)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, delay: 0.5 }}
          />

          {/* Connection lines from SA to regions */}
          {regions.slice(1).map((region, i) => (
            <motion.line
              key={region.name}
              x1={regions[0].position.x}
              y1={regions[0].position.y}
              x2={region.position.x}
              y2={region.position.y}
              stroke={region.color}
              strokeOpacity={hoveredRegion === i + 1 ? 0.4 : 0.08}
              strokeWidth={hoveredRegion === i + 1 ? 0.6 : 0.3}
              strokeDasharray="1 1.5"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
              style={{ transition: "stroke-opacity 0.3s, stroke-width 0.3s" }}
            />
          ))}

          {/* Region markers */}
          {regions.map((region, i) => {
            const isHovered = hoveredRegion === i;
            const isActive = region.status === "active";
            return (
              <g
                key={region.name}
                onMouseEnter={() => setHoveredRegion(i)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulse ring for active */}
                {isActive && (
                  <motion.circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={3}
                    fill="none"
                    stroke={region.color}
                    strokeWidth={0.3}
                    animate={{ r: [3, 8], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Glow */}
                {(isHovered || isActive) && (
                  <circle
                    cx={region.position.x}
                    cy={region.position.y}
                    r={isHovered ? 5 : 3}
                    fill={`${region.color}20`}
                    style={{ filter: `blur(${isHovered ? 3 : 1}px)` }}
                  />
                )}

                {/* Main dot */}
                <motion.circle
                  cx={region.position.x}
                  cy={region.position.y}
                  r={isHovered ? 2.5 : isActive ? 2 : 1.5}
                  fill={region.color}
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                  style={{
                    transformOrigin: `${region.position.x}px ${region.position.y}px`,
                    filter: `drop-shadow(0 0 ${isHovered ? 4 : 2}px ${region.color})`,
                    transition: "r 0.3s, filter 0.3s",
                  }}
                />

                {/* Sub-dots */}
                {region.dots.map((dot, di) => (
                  <motion.circle
                    key={dot.label}
                    cx={dot.x}
                    cy={dot.y}
                    r={0.8}
                    fill={region.color}
                    fillOpacity={isHovered ? 0.7 : 0.3}
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ delay: 1 + i * 0.15 + di * 0.05 }}
                    style={{
                      transformOrigin: `${dot.x}px ${dot.y}px`,
                      transition: "fill-opacity 0.3s",
                    }}
                  />
                ))}

                {/* Label */}
                <motion.text
                  x={region.position.x}
                  y={region.position.y - 5}
                  textAnchor="middle"
                  fill={isHovered ? region.color : "rgba(255,255,255,0.3)"}
                  fontSize={isHovered ? "3" : "2.5"}
                  className="font-mono pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  style={{ transition: "fill 0.3s, font-size 0.3s" }}
                >
                  {region.name}
                </motion.text>
              </g>
            );
          })}
        </svg>

        {/* Region detail cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {regions.map((region, i) => (
            <motion.div
              key={region.name}
              className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                hoveredRegion === i
                  ? "border-white/15 bg-white/[0.06] scale-105"
                  : region.status === "active"
                  ? "border-[#3DA9D1]/15 bg-[#3DA9D1]/[0.03]"
                  : "border-white/[0.04] bg-white/[0.02]"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.5 + i * 0.08 }}
              onMouseEnter={() => setHoveredRegion(i)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                <span className="text-[9px] font-mono text-white/70">{region.phase}</span>
              </div>
              <div className="text-[11px] font-mono text-white/60 mb-0.5">{region.name}</div>
              <div className="text-[10px] font-mono text-white/70">{region.practitioners}</div>
              <div className="text-[10px] font-mono" style={{ color: region.color }}>{region.market}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
