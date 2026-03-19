"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface ComplianceShieldProps {
  features: string[];
}

export default function ComplianceShield({ features }: ComplianceShieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cx = 150, cy = 160;
  const layers = [120, 95, 70, 45];
  const amberShades = ["rgba(245,158,11,0.04)", "rgba(245,158,11,0.06)", "rgba(245,158,11,0.08)", "rgba(245,158,11,0.12)"];

  // Split features into quadrants
  const quads = [
    features.slice(0, 3),
    features.slice(3, 6),
    features.slice(6, 9),
    features.slice(9, 12),
  ];

  const quadLabels = ["Access Control", "Data Protection", "Audit & Tracking", "Operations"];
  const quadAngles = [-45, 45, 135, 225];

  return (
    <div ref={ref} className="flex flex-col lg:flex-row items-center gap-8">
      {/* Shield SVG */}
      <div className="w-full max-w-[320px] shrink-0">
        <svg viewBox="0 0 300 320" className="w-full">
          {/* Concentric shield rings */}
          {layers.map((r, i) => (
            <motion.path
              key={i}
              d={`M ${cx} ${cy - r}
                  Q ${cx + r * 1.1} ${cy - r * 0.3} ${cx + r * 0.8} ${cy + r * 0.6}
                  Q ${cx} ${cy + r * 1.1} ${cx - r * 0.8} ${cy + r * 0.6}
                  Q ${cx - r * 1.1} ${cy - r * 0.3} ${cx} ${cy - r} Z`}
              fill={amberShades[i]}
              stroke="rgba(245,158,11,0.12)"
              strokeWidth={i === 0 ? 1.5 : 0.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.8, type: "spring" }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
          ))}

          {/* Center icon */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8, type: "spring" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <circle cx={cx} cy={cy - 10} r={18} fill="rgba(245,158,11,0.15)" />
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-amber-400 font-mono" fontSize="14" fontWeight="300">
              ✓
            </text>
          </motion.g>

          {/* Label */}
          <motion.text
            x={cx} y={cy + 18}
            textAnchor="middle"
            className="fill-amber-400/60 font-mono" fontSize="8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
          >
            COMPLIANCE
          </motion.text>
          <motion.text
            x={cx} y={cy + 30}
            textAnchor="middle"
            className="fill-amber-400/40 font-mono" fontSize="7"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.1 }}
          >
            BY DESIGN
          </motion.text>

          {/* Pulse ring */}
          <motion.path
            d={`M ${cx} ${cy - layers[0]}
                Q ${cx + layers[0] * 1.1} ${cy - layers[0] * 0.3} ${cx + layers[0] * 0.8} ${cy + layers[0] * 0.6}
                Q ${cx} ${cy + layers[0] * 1.1} ${cx - layers[0] * 0.8} ${cy + layers[0] * 0.6}
                Q ${cx - layers[0] * 1.1} ${cy - layers[0] * 0.3} ${cx} ${cy - layers[0]} Z`}
            fill="none"
            stroke="rgba(245,158,11,0.15)"
            strokeWidth={1}
            animate={inView ? { scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Orbiting dots */}
          {[0, 1, 2].map((dotI) => (
            <motion.circle
              key={dotI}
              r={2.5}
              fill="#f59e0b"
              fillOpacity={0.6}
              animate={inView ? {
                cx: [cx + layers[1] * Math.cos((dotI * 120 * Math.PI) / 180), cx + layers[1] * Math.cos(((dotI * 120 + 360) * Math.PI) / 180)],
                cy: [cy + layers[1] * Math.sin((dotI * 120 * Math.PI) / 180) * 0.7, cy + layers[1] * Math.sin(((dotI * 120 + 360) * Math.PI) / 180) * 0.7],
              } : {}}
              transition={{ duration: 8 + dotI, repeat: Infinity, ease: "linear" }}
              style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }}
            />
          ))}
        </svg>
      </div>

      {/* Feature quadrants */}
      <div className="grid grid-cols-2 gap-4 flex-1 w-full">
        {quads.map((quad, qi) => (
          <motion.div
            key={qi}
            className="rounded-xl border border-amber-400/[0.06] bg-amber-400/[0.02] p-4"
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2 + qi * 0.1 }}
          >
            <div className="text-[9px] font-mono text-amber-400/50 uppercase tracking-wider mb-3">
              {quadLabels[qi]}
            </div>
            <div className="space-y-2">
              {quad.map((feature, fi) => {
                const globalIdx = qi * 3 + fi;
                return (
                  <motion.div
                    key={feature}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                      hoveredIdx === globalIdx
                        ? "bg-amber-400/[0.08] border border-amber-400/[0.15]"
                        : "border border-transparent"
                    }`}
                    onMouseEnter={() => setHoveredIdx(globalIdx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.4 + globalIdx * 0.04 }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-amber-400/40 shrink-0"
                      animate={hoveredIdx === globalIdx ? { scale: 1.5, backgroundColor: "rgba(245,158,11,0.8)" } : {}}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="text-[11px] text-white/40 font-light">{feature}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
