"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const providerNodes = [
  { label: "Hospitals", y: 15 },
  { label: "Clinics", y: 30 },
  { label: "Specialists", y: 45 },
  { label: "Day Hospitals", y: 60 },
  { label: "Labs & Diagnostics", y: 75 },
];

const payerNodes = [
  { label: "Medical Aids", y: 18 },
  { label: "Health Insurers", y: 36 },
  { label: "HMOs", y: 54 },
  { label: "Scheme Admins", y: 72 },
];

const flowTypes = [
  { label: "Eligibility", color: "#3b82f6", dashOffset: 0 },
  { label: "Authorisation", color: "#10b981", dashOffset: 8 },
  { label: "Claims", color: "#f59e0b", dashOffset: 16 },
  { label: "Referrals", color: "#8b5cf6", dashOffset: 24 },
];

export default function PayerProviderFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeFlow, setActiveFlow] = useState<number | null>(null);

  const svgW = 800, svgH = 400;
  const leftX = 140, rightX = 660, midX = 400;
  const hubW = 120, hubH = 180;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {flowTypes.map((flow) => (
            <linearGradient key={flow.label} id={`flow-${flow.label}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={flow.color} stopOpacity="0.6" />
              <stop offset="50%" stopColor={flow.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={flow.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ─── Provider Side ─── */}
        <motion.text
          x={leftX} y={8} textAnchor="middle"
          className="fill-[#3DA9D1]/60 font-mono" fontSize="10" fontWeight="500"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          PROVIDER SIDE
        </motion.text>

        {providerNodes.map((node, i) => {
          const ny = (node.y / 100) * svgH;
          return (
            <g key={node.label}>
              <motion.rect
                x={leftX - 65} y={ny - 14} width={130} height={28} rx={8}
                fill="rgba(16,185,129,0.06)"
                stroke="rgba(16,185,129,0.15)"
                strokeWidth={1}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
              />
              <motion.text
                x={leftX} y={ny + 4} textAnchor="middle"
                className="fill-white/50 font-mono" fontSize="9"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}

        {/* ─── Payer Side ─── */}
        <motion.text
          x={rightX} y={8} textAnchor="middle"
          className="fill-blue-400/60 font-mono" fontSize="10" fontWeight="500"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          PAYER SIDE
        </motion.text>

        {payerNodes.map((node, i) => {
          const ny = (node.y / 100) * svgH;
          return (
            <g key={node.label}>
              <motion.rect
                x={rightX - 65} y={ny - 14} width={130} height={28} rx={8}
                fill="rgba(59,130,246,0.06)"
                stroke="rgba(59,130,246,0.15)"
                strokeWidth={1}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
              />
              <motion.text
                x={rightX} y={ny + 4} textAnchor="middle"
                className="fill-white/50 font-mono" fontSize="9"
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}

        {/* ─── Central Hub ─── */}
        <motion.rect
          x={midX - hubW / 2} y={svgH / 2 - hubH / 2}
          width={hubW} height={hubH} rx={16}
          fill="rgba(59,130,246,0.08)"
          stroke="rgba(59,130,246,0.25)"
          strokeWidth={1.5}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
          style={{ transformOrigin: `${midX}px ${svgH / 2}px` }}
        />

        {/* Hub pulse */}
        <motion.rect
          x={midX - hubW / 2} y={svgH / 2 - hubH / 2}
          width={hubW} height={hubH} rx={16}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth={1}
          animate={inView ? { scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${midX}px ${svgH / 2}px` }}
        />

        <motion.text
          x={midX} y={svgH / 2 - 30} textAnchor="middle"
          className="fill-blue-400 font-mono" fontSize="10" fontWeight="600"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          PAYER
        </motion.text>
        <motion.text
          x={midX} y={svgH / 2 - 16} textAnchor="middle"
          className="fill-blue-400 font-mono" fontSize="10" fontWeight="600"
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.95 }}
        >
          CONNECT
        </motion.text>

        {/* Hub divider */}
        <motion.line
          x1={midX - 35} y1={svgH / 2 - 4}
          x2={midX + 35} y2={svgH / 2 - 4}
          stroke="rgba(59,130,246,0.15)" strokeWidth={0.5}
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 1 }}
        />

        {/* Flow type labels inside hub */}
        {flowTypes.map((flow, i) => (
          <motion.g
            key={flow.label}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveFlow(i)}
            onMouseLeave={() => setActiveFlow(null)}
          >
            <motion.circle
              cx={midX - 30} cy={svgH / 2 + 8 + i * 18}
              r={3} fill={flow.color}
              initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 1.1 + i * 0.08 }}
            />
            <motion.text
              x={midX - 22} y={svgH / 2 + 12 + i * 18}
              className="fill-white/40 font-mono" fontSize="8"
              initial={{ opacity: 0 }} animate={inView ? { opacity: activeFlow === i ? 1 : 0.5 } : {}}
              transition={{ delay: 1.1 + i * 0.08 }}
              style={{ transition: "opacity 0.3s" }}
            >
              {flow.label}
            </motion.text>
          </motion.g>
        ))}

        {/* ─── Flow Lines: Provider → Hub ─── */}
        {providerNodes.map((pNode, pi) => {
          const ny = (pNode.y / 100) * svgH;
          const flow = flowTypes[pi % flowTypes.length];
          const isActive = activeFlow === null || activeFlow === pi % flowTypes.length;
          return (
            <g key={`p-${pi}`}>
              <motion.path
                d={`M ${leftX + 65} ${ny} Q ${midX - hubW / 2 - 40} ${ny} ${midX - hubW / 2} ${svgH / 2}`}
                fill="none"
                stroke={flow.color}
                strokeWidth={isActive ? 1.5 : 0.5}
                strokeOpacity={isActive ? 0.3 : 0.05}
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.8 + pi * 0.1 }}
                style={{ transition: "stroke-width 0.3s, stroke-opacity 0.3s" }}
              />
              {/* Animated particle */}
              <motion.circle
                r={2.5} fill={flow.color}
                initial={{ opacity: 0 }}
                animate={inView ? {
                  opacity: [0, 0.8, 0],
                  offsetDistance: ["0%", "100%"],
                } : {}}
                transition={{ duration: 2.5 + pi * 0.3, delay: 1.5 + pi * 0.2, repeat: Infinity, ease: "linear" }}
                style={{
                  offsetPath: `path("M ${leftX + 65} ${ny} Q ${midX - hubW / 2 - 40} ${ny} ${midX - hubW / 2} ${svgH / 2}")`,
                  filter: `drop-shadow(0 0 4px ${flow.color})`,
                }}
              />
            </g>
          );
        })}

        {/* ─── Flow Lines: Hub → Payer ─── */}
        {payerNodes.map((pNode, pi) => {
          const ny = (pNode.y / 100) * svgH;
          const flow = flowTypes[pi % flowTypes.length];
          const isActive = activeFlow === null || activeFlow === pi % flowTypes.length;
          return (
            <g key={`pay-${pi}`}>
              <motion.path
                d={`M ${midX + hubW / 2} ${svgH / 2} Q ${midX + hubW / 2 + 40} ${ny} ${rightX - 65} ${ny}`}
                fill="none"
                stroke={flow.color}
                strokeWidth={isActive ? 1.5 : 0.5}
                strokeOpacity={isActive ? 0.3 : 0.05}
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.2, delay: 1 + pi * 0.1 }}
                style={{ transition: "stroke-width 0.3s, stroke-opacity 0.3s" }}
              />
              <motion.circle
                r={2.5} fill={flow.color}
                initial={{ opacity: 0 }}
                animate={inView ? {
                  opacity: [0, 0.8, 0],
                  offsetDistance: ["0%", "100%"],
                } : {}}
                transition={{ duration: 2.5 + pi * 0.3, delay: 2 + pi * 0.2, repeat: Infinity, ease: "linear" }}
                style={{
                  offsetPath: `path("M ${midX + hubW / 2} ${svgH / 2} Q ${midX + hubW / 2 + 40} ${ny} ${rightX - 65} ${ny}")`,
                  filter: `drop-shadow(0 0 4px ${flow.color})`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Flow type legend */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {flowTypes.map((flow, i) => (
          <motion.button
            key={flow.label}
            onClick={() => setActiveFlow(activeFlow === i ? null : i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all duration-300 ${
              activeFlow === i
                ? "border-white/15 bg-white/[0.06] text-white/70"
                : "border-white/[0.04] text-white/70 hover:border-white/10"
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.5 + i * 0.08 }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: flow.color }} />
            {flow.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
