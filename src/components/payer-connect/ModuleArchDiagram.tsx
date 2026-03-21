"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const layers = [
  {
    name: "Intelligence Layer",
    color: "#8b5cf6",
    modules: [
      { letter: "J", name: "AI Copilot", x: 25 },
      { letter: "C", name: "Smart Routing", x: 55 },
    ],
  },
  {
    name: "Workflow Layer",
    color: "#10b981",
    modules: [
      { letter: "A", name: "Eligibility", x: 12 },
      { letter: "B", name: "Pre-Auth", x: 38 },
      { letter: "D", name: "Referral & Transfer", x: 65 },
      { letter: "E", name: "Claims Ready", x: 88 },
    ],
  },
  {
    name: "Interface Layer",
    color: "#06b6d4",
    modules: [
      { letter: "G", name: "Patient Portal", x: 18 },
      { letter: "H", name: "Provider Portal", x: 50 },
      { letter: "I", name: "Payer Portal", x: 82 },
    ],
  },
  {
    name: "Data Layer",
    color: "#f59e0b",
    modules: [
      { letter: "F", name: "Shared Case Timeline", x: 50 },
    ],
  },
];

export default function ModuleArchDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const svgW = 800, svgH = 400;
  const layerH = 80;
  const startY = 30;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="module-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {layers.map((layer, li) => {
          const ly = startY + li * (layerH + 15);

          return (
            <g key={layer.name}>
              {/* Layer background */}
              <motion.rect
                x={20} y={ly}
                width={svgW - 40} height={layerH}
                rx={12}
                fill={`${layer.color}06`}
                stroke={`${layer.color}15`}
                strokeWidth={1}
                strokeDasharray="4 4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: li * 0.15 }}
                style={{ transformOrigin: `${svgW / 2}px ${ly + layerH / 2}px` }}
              />

              {/* Layer label */}
              <motion.text
                x={40} y={ly + 18}
                className="font-mono" fontSize="8"
                fill={`${layer.color}60`}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + li * 0.15 }}
              >
                {layer.name.toUpperCase()}
              </motion.text>

              {/* Module nodes */}
              {layer.modules.map((mod, mi) => {
                const mx = (mod.x / 100) * (svgW - 100) + 50;
                const my = ly + layerH / 2 + 6;
                const isHovered = hoveredModule === mod.letter;

                return (
                  <g
                    key={mod.letter}
                    onMouseEnter={() => setHoveredModule(mod.letter)}
                    onMouseLeave={() => setHoveredModule(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Module circle */}
                    <motion.circle
                      cx={mx} cy={my}
                      r={isHovered ? 24 : 20}
                      fill={`${layer.color}${isHovered ? "20" : "10"}`}
                      stroke={layer.color}
                      strokeWidth={isHovered ? 2 : 1}
                      strokeOpacity={isHovered ? 0.6 : 0.25}
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: 0.6 + li * 0.15 + mi * 0.08, type: "spring" }}
                      style={{
                        transformOrigin: `${mx}px ${my}px`,
                        filter: isHovered ? `drop-shadow(0 0 10px ${layer.color}40)` : "none",
                        transition: "all 0.3s ease",
                      }}
                    />

                    {/* Letter */}
                    <motion.text
                      x={mx} y={my - 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={layer.color}
                      fontSize={isHovered ? "14" : "12"}
                      fontWeight="300"
                      className="font-mono pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.8 + li * 0.15 + mi * 0.08 }}
                      style={{ transition: "font-size 0.3s" }}
                    >
                      {mod.letter}
                    </motion.text>

                    {/* Name label */}
                    <motion.text
                      x={mx} y={my + 10}
                      textAnchor="middle"
                      fill={isHovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"}
                      fontSize="6"
                      className="font-mono pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.9 + li * 0.15 + mi * 0.08 }}
                      style={{ transition: "fill 0.3s" }}
                    >
                      {mod.name}
                    </motion.text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Vertical connection lines between layers */}
        {[
          { from: { x: 50, layer: 0 }, to: { x: 38, layer: 1 } },
          { from: { x: 55, layer: 0 }, to: { x: 65, layer: 1 } },
          { from: { x: 12, layer: 1 }, to: { x: 18, layer: 2 } },
          { from: { x: 38, layer: 1 }, to: { x: 50, layer: 2 } },
          { from: { x: 65, layer: 1 }, to: { x: 50, layer: 2 } },
          { from: { x: 88, layer: 1 }, to: { x: 82, layer: 2 } },
          { from: { x: 18, layer: 2 }, to: { x: 50, layer: 3 } },
          { from: { x: 50, layer: 2 }, to: { x: 50, layer: 3 } },
          { from: { x: 82, layer: 2 }, to: { x: 50, layer: 3 } },
        ].map((conn, ci) => {
          const x1 = (conn.from.x / 100) * (svgW - 100) + 50;
          const y1 = startY + conn.from.layer * (layerH + 15) + layerH / 2 + 6 + 20;
          const x2 = (conn.to.x / 100) * (svgW - 100) + 50;
          const y2 = startY + conn.to.layer * (layerH + 15) + layerH / 2 + 6 - 20;

          return (
            <motion.line
              key={ci}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
              strokeDasharray="3 4"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, delay: 1 + ci * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Layer legend */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.name}
            className="flex items-center gap-2 text-[10px] font-mono text-white/70"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5 + i * 0.1 }}
          >
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: layer.color }} />
            {layer.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
