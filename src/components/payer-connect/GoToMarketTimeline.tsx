"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Phase {
  phase: string;
  title: string;
  description: string;
  timeline: string;
  status: string;
}

const phaseColors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"];

export default function GoToMarketTimeline({ phases }: { phases: Phase[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activePhase, setActivePhase] = useState(0);

  const svgW = 800, svgH = 140;
  const padL = 50, padR = 50;
  const chartW = svgW - padL - padR;
  const lineY = 60;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Main timeline line */}
        <motion.line
          x1={padL} y1={lineY} x2={padL + chartW} y2={lineY}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.2 }}
        />

        {/* Progress fill */}
        <motion.line
          x1={padL} y1={lineY}
          x2={padL + (chartW / (phases.length - 1)) * activePhase}
          y2={lineY}
          stroke={phaseColors[activePhase]}
          strokeWidth={2}
          strokeOpacity={0.5}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        {phases.map((phase, i) => {
          const x = padL + (chartW / (phases.length - 1)) * i;
          const isActive = i === activePhase;
          const isPast = i <= activePhase;
          const color = phaseColors[i];

          return (
            <g
              key={phase.phase}
              onMouseEnter={() => setActivePhase(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Vertical tick */}
              <motion.line
                x1={x} y1={lineY - 10} x2={x} y2={lineY + 10}
                stroke={color}
                strokeOpacity={isPast ? 0.4 : 0.1}
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.15 }}
              />

              {/* Node circle */}
              <motion.circle
                cx={x} cy={lineY}
                r={isActive ? 10 : 7}
                fill={isActive ? `${color}30` : isPast ? `${color}15` : "rgba(255,255,255,0.03)"}
                stroke={color}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isPast ? 0.6 : 0.15}
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: 0.6 + i * 0.15, type: "spring" }}
                style={{
                  transformOrigin: `${x}px ${lineY}px`,
                  filter: isActive ? `drop-shadow(0 0 10px ${color}50)` : "none",
                  transition: "all 0.3s",
                }}
              />

              {/* Inner dot */}
              {isPast && (
                <motion.circle
                  cx={x} cy={lineY}
                  r={3}
                  fill={color}
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  style={{ transformOrigin: `${x}px ${lineY}px` }}
                />
              )}

              {/* Active pulse */}
              {isActive && (
                <motion.circle
                  cx={x} cy={lineY} r={10}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  animate={{ r: [10, 22], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Phase label (above) */}
              <motion.text
                x={x} y={lineY - 22}
                textAnchor="middle"
                fill={isActive ? color : "rgba(255,255,255,0.25)"}
                fontSize={isActive ? "10" : "9"}
                className="font-mono"
                fontWeight={isActive ? "500" : "400"}
                initial={{ opacity: 0, y: 5 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.15 }}
                style={{ transition: "fill 0.3s, font-size 0.3s" }}
              >
                {phase.phase}
              </motion.text>

              {/* Timeline label (below) */}
              <motion.text
                x={x} y={lineY + 30}
                textAnchor="middle"
                fill="rgba(255,255,255,0.2)"
                fontSize="8"
                className="font-mono"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.9 + i * 0.15 }}
              >
                {phase.timeline}
              </motion.text>

              {/* Short title (below timeline) */}
              <motion.text
                x={x} y={lineY + 44}
                textAnchor="middle"
                fill={isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"}
                fontSize="7"
                className="font-mono"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 1 + i * 0.15 }}
                style={{ transition: "fill 0.3s" }}
              >
                {phase.title.length > 25 ? phase.title.substring(0, 22) + "..." : phase.title}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Active phase detail card */}
      <motion.div
        key={activePhase}
        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phaseColors[activePhase] }} />
          <span className="text-[11px] font-mono text-white/70">{phases[activePhase].phase} — {phases[activePhase].timeline}</span>
        </div>
        <h4 className="text-lg font-light text-white mb-2">{phases[activePhase].title}</h4>
        <p className="text-[13px] text-white/60 font-light leading-relaxed">{phases[activePhase].description}</p>
      </motion.div>
    </div>
  );
}
