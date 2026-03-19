"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const products = [
  { name: "Netcare Health OS\nOps", short: "Ops", color: "#10b981", angle: 0, description: "Core PM" },
  { name: "Placeo\nHealth", short: "Placeo", color: "#22c55e", angle: 72, description: "Marketplace" },
  { name: "Visio\nIntegrator", short: "Integrator", color: "#8b5cf6", angle: 144, description: "Middleware" },
  { name: "Waiting\nRoom", short: "WR", color: "#06b6d4", angle: 216, description: "Check-in" },
  { name: "VisioMed\nAI", short: "AI", color: "#f59e0b", angle: 288, description: "Clinical AI" },
];

export default function EcosystemOrbit() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cx = 200, cy = 200, orbitR = 130;

  return (
    <div ref={ref} className="flex justify-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-[420px]">
        {/* Orbit ring */}
        <motion.circle
          cx={cx} cy={cy} r={orbitR}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Inner orbit ring */}
        <motion.circle
          cx={cx} cy={cy} r={orbitR * 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={1}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Connection lines between products */}
        {products.map((p1, i) => {
          const a1 = (p1.angle * Math.PI) / 180 - Math.PI / 2;
          const x1 = cx + orbitR * Math.cos(a1);
          const y1 = cy + orbitR * Math.sin(a1);
          return products.slice(i + 1).map((p2, j) => {
            const a2 = (p2.angle * Math.PI) / 180 - Math.PI / 2;
            const x2 = cx + orbitR * Math.cos(a2);
            const y2 = cy + orbitR * Math.sin(a2);
            return (
              <motion.line
                key={`${i}-${j}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(16,185,129,0.06)"
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 1, delay: 1 + (i + j) * 0.05 }}
              />
            );
          });
        })}

        {/* Center hub */}
        <motion.circle
          cx={cx} cy={cy} r={36}
          fill="rgba(16,185,129,0.08)"
          stroke="rgba(16,185,129,0.2)"
          strokeWidth={1.5}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <motion.text
          x={cx} y={cy - 6}
          textAnchor="middle"
          className="fill-[#3DA9D1] font-mono"
          fontSize="9"
          fontWeight="500"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          VISIO
        </motion.text>
        <motion.text
          x={cx} y={cy + 6}
          textAnchor="middle"
          className="fill-[#3DA9D1]/60 font-mono"
          fontSize="7"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          ECOSYSTEM
        </motion.text>

        {/* Animated pulse ring */}
        <motion.circle
          cx={cx} cy={cy} r={36}
          fill="none"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth={1}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={inView ? { scale: [1, 2.5], opacity: [0.4, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Product nodes */}
        {products.map((product, i) => {
          const angle = (product.angle * Math.PI) / 180 - Math.PI / 2;
          const x = cx + orbitR * Math.cos(angle);
          const y = cy + orbitR * Math.sin(angle);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={product.short}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Glow */}
              {isHovered && (
                <circle
                  cx={x} cy={y} r={32}
                  fill="none"
                  stroke={product.color}
                  strokeOpacity={0.2}
                  strokeWidth={1}
                  style={{ filter: `drop-shadow(0 0 15px ${product.color}40)` }}
                />
              )}

              {/* Node circle */}
              <motion.circle
                cx={x} cy={y}
                r={isHovered ? 28 : 24}
                fill={`${product.color}15`}
                stroke={product.color}
                strokeWidth={isHovered ? 2 : 1.5}
                strokeOpacity={isHovered ? 0.8 : 0.4}
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12, type: "spring" }}
                style={{
                  transformOrigin: `${x}px ${y}px`,
                  filter: isHovered ? `drop-shadow(0 0 10px ${product.color}50)` : "none",
                  transition: "all 0.3s ease",
                }}
              />

              {/* Node label */}
              <motion.text
                x={x} y={y - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono pointer-events-none"
                fill={product.color}
                fontSize={isHovered ? "8" : "7"}
                fontWeight="500"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                {product.short}
              </motion.text>

              {/* Description on hover */}
              <motion.text
                x={x} y={y + 8}
                textAnchor="middle"
                className="fill-white/30 font-mono pointer-events-none"
                fontSize="6"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {product.description}
              </motion.text>

              {/* Orbiting dot animation */}
              <motion.circle
                cx={x + 18}
                cy={y}
                r={2}
                fill={product.color}
                initial={{ opacity: 0 }}
                animate={inView ? {
                  opacity: [0, 0.6, 0],
                  cx: [x + 18, x, x - 18, x, x + 18],
                  cy: [y, y - 18, y, y + 18, y],
                } : {}}
                transition={{
                  duration: 4 + i * 0.5,
                  delay: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
