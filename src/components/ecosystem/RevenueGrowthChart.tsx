"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const milestones = [
  { practices: 10, mrrLow: 305, mrrHigh: 1050, label: "Seed", year: "Y1 Q1" },
  { practices: 50, mrrLow: 1525, mrrHigh: 5250, label: "Early", year: "Y1 Q3" },
  { practices: 100, mrrLow: 3050, mrrHigh: 10500, label: "Growth", year: "Y2" },
  { practices: 500, mrrLow: 15250, mrrHigh: 52500, label: "Scale", year: "Y3" },
  { practices: 1000, mrrLow: 30500, mrrHigh: 105000, label: "Expand", year: "Y4" },
  { practices: 5000, mrrLow: 152500, mrrHigh: 525000, label: "Dominate", year: "Y5" },
  { practices: 10000, mrrLow: 305000, mrrHigh: 1050000, label: "Global", year: "Y6+" },
];

function formatRand(k: number) {
  if (k >= 1000) return `R${(k / 1000).toFixed(0)}M`;
  return `R${k}K`;
}

export default function RevenueGrowthChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const svgW = 700, svgH = 320;
  const padL = 70, padR = 30, padT = 30, padB = 50;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const maxVal = milestones[milestones.length - 1].mrrHigh;
  const logMax = Math.log10(maxVal);
  const logMin = Math.log10(milestones[0].mrrLow);

  function yScale(val: number) {
    const logVal = Math.log10(Math.max(val, 1));
    return padT + chartH - ((logVal - logMin) / (logMax - logMin)) * chartH;
  }

  const xStep = chartW / (milestones.length - 1);
  const points = milestones.map((m, i) => ({
    x: padL + i * xStep,
    yHigh: yScale(m.mrrHigh),
    yLow: yScale(m.mrrLow),
    ...m,
  }));

  const areaPath = [
    `M ${points[0].x} ${points[0].yHigh}`,
    ...points.slice(1).map((p) => `L ${p.x} ${p.yHigh}`),
    ...points.slice().reverse().map((p) => `L ${p.x} ${p.yLow}`),
    "Z",
  ].join(" ");

  const highLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yHigh}`).join(" ");
  const lowLine = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yLow}`).join(" ");

  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[100, 1000, 10000, 100000, 1000000].map((val) => {
          const y = yScale(val);
          if (y < padT || y > padT + chartH) return null;
          return (
            <g key={val}>
              <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <text x={padL - 8} y={y + 3} textAnchor="end" className="fill-white/20 font-mono" fontSize="8">
                {formatRand(val / 1000)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* High line */}
        <motion.path
          d={highLine}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Low line */}
        <motion.path
          d={lowLine}
          fill="none"
          stroke="#10b981"
          strokeOpacity={0.3}
          strokeWidth={1.5}
          strokeDasharray="4 6"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Data points & labels */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: "pointer" }}>
            {/* Vertical connector */}
            <motion.line
              x1={p.x} y1={p.yHigh} x2={p.x} y2={p.yLow}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1}
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 + i * 0.1 }}
            />

            {/* High dot */}
            <motion.circle
              cx={p.x} cy={p.yHigh} r={hoveredIdx === i ? 6 : 4}
              fill="#10b981"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              style={{ filter: hoveredIdx === i ? "drop-shadow(0 0 8px rgba(16,185,129,0.6))" : "none", transition: "all 0.3s" }}
              initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
            />

            {/* X labels */}
            <motion.text
              x={p.x} y={padT + chartH + 18}
              textAnchor="middle"
              className="fill-white/30 font-mono" fontSize="8"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1 + i * 0.08 }}
            >
              {p.year}
            </motion.text>
            <motion.text
              x={p.x} y={padT + chartH + 32}
              textAnchor="middle"
              className="fill-white/15 font-mono" fontSize="7"
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1.1 + i * 0.08 }}
            >
              {p.practices.toLocaleString()} practices
            </motion.text>

            {/* Hover tooltip */}
            {hoveredIdx === i && (
              <g>
                <rect
                  x={p.x - 55} y={p.yHigh - 42}
                  width={110} height={34} rx={8}
                  fill="rgba(6,13,26,0.9)"
                  stroke="rgba(16,185,129,0.2)" strokeWidth={1}
                />
                <text x={p.x} y={p.yHigh - 28} textAnchor="middle" className="fill-[#3DA9D1] font-mono" fontSize="9" fontWeight="500">
                  {formatRand(p.mrrHigh / 1000)} MRR
                </text>
                <text x={p.x} y={p.yHigh - 16} textAnchor="middle" className="fill-white/40 font-mono" fontSize="7">
                  {p.label} Stage
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Y axis label */}
        <text x={12} y={svgH / 2} textAnchor="middle" className="fill-white/15 font-mono" fontSize="8" transform={`rotate(-90, 12, ${svgH / 2})`}>
          Monthly Recurring Revenue
        </text>
      </svg>
    </div>
  );
}
