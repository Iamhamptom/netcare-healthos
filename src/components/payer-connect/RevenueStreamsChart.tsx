"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Stream {
  stream: string;
  description: string;
}

const streamWeights = [25, 20, 8, 10, 15, 12, 5, 5]; // relative revenue contribution
const streamColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#22c55e", "#f97316", "#a855f7",
];

export default function RevenueStreamsChart({ streams }: { streams: Stream[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = streamWeights.reduce((a, b) => a + b, 0);

  return (
    <div ref={ref}>
      {/* Stacked horizontal bar */}
      <div className="relative h-14 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] mb-6">
        <div className="absolute inset-0 flex">
          {streams.map((stream, i) => {
            const widthPct = (streamWeights[i] / total) * 100;
            const isHovered = hoveredIdx === i;
            return (
              <motion.div
                key={stream.stream}
                className="h-full relative cursor-pointer overflow-hidden"
                style={{
                  backgroundColor: `${streamColors[i]}${isHovered ? "35" : "18"}`,
                  borderRight: i < streams.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  transition: "background-color 0.3s",
                }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${widthPct}%` } : {}}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${streamColors[i]}20, transparent)`,
                    backgroundSize: "200% 100%",
                  }}
                  animate={inView ? { backgroundPosition: ["200% 0", "-200% 0"] } : {}}
                  transition={{ duration: 4, delay: 1.5 + i * 0.1, repeat: Infinity, repeatDelay: 6 }}
                />

                {/* Label inside bar if wide enough */}
                {widthPct > 10 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 1 + i * 0.08 }}
                  >
                    <span className="text-[8px] font-mono text-white/40 truncate px-1">
                      {stream.stream}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {streams.map((stream, i) => {
          const isHovered = hoveredIdx === i;
          const pct = Math.round((streamWeights[i] / total) * 100);
          return (
            <motion.div
              key={stream.stream}
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                isHovered
                  ? "border-white/15 bg-white/[0.06] scale-[1.03]"
                  : "border-white/[0.04] bg-white/[0.02]"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 + i * 0.06 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: streamColors[i],
                    boxShadow: isHovered ? `0 0 8px ${streamColors[i]}60` : "none",
                    transition: "box-shadow 0.3s",
                  }}
                />
                <span className="text-[10px] font-mono text-white/20">{pct}%</span>
              </div>
              <h4 className="text-[12px] font-mono text-white/60 mb-1 leading-tight">{stream.stream}</h4>
              <p className="text-[10px] text-white/25 font-light leading-relaxed">{stream.description}</p>

              {/* Mini bar */}
              <div className="mt-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: `${streamColors[i]}50` }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : {}}
                  transition={{ duration: 0.6, delay: 1 + i * 0.06 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
