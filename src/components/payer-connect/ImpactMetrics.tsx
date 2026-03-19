"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const metrics = [
  {
    label: "Eligibility Check Time",
    before: "2–4 hours",
    after: "< 3 seconds",
    improvement: "99.9%",
    color: "#3b82f6",
    barBefore: 90,
    barAfter: 2,
  },
  {
    label: "Pre-Auth Turnaround",
    before: "3–5 days",
    after: "< 30 minutes",
    improvement: "99%",
    color: "#10b981",
    barBefore: 85,
    barAfter: 5,
  },
  {
    label: "Claim Rejection Rate",
    before: "15–25%",
    after: "< 3%",
    improvement: "85%",
    color: "#f59e0b",
    barBefore: 75,
    barAfter: 10,
  },
  {
    label: "Admin Overhead",
    before: "40% of staff time",
    after: "< 10%",
    improvement: "75%",
    color: "#8b5cf6",
    barBefore: 80,
    barAfter: 15,
  },
  {
    label: "Patient Routing Errors",
    before: "30%+ misrouted",
    after: "< 2%",
    improvement: "93%",
    color: "#06b6d4",
    barBefore: 70,
    barAfter: 5,
  },
  {
    label: "Payer Visibility Lag",
    before: "Days behind",
    after: "Real-time",
    improvement: "100%",
    color: "#22c55e",
    barBefore: 95,
    barAfter: 0,
  },
];

function AnimatedPercent({ value, delay, color }: { value: string; delay: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const numVal = parseFloat(value);
  const spring = useSpring(0, { duration: 2000 });
  const display = useTransform(spring, (v) => `${v.toFixed(1)}%`);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => spring.set(numVal), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, numVal, spring, delay]);

  return (
    <span ref={ref} className="font-mono text-[13px] font-medium" style={{ color }}>
      <motion.span>{display}</motion.span>
    </span>
  );
}

export default function ImpactMetrics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="space-y-4">
      {/* Header row */}
      <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-mono text-white/20 uppercase tracking-wider">
        <div className="col-span-3">Metric</div>
        <div className="col-span-2 text-center">Before</div>
        <div className="col-span-4 text-center">Improvement</div>
        <div className="col-span-2 text-center">After</div>
        <div className="col-span-1 text-right">Gain</div>
      </div>

      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          className="grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-400"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
        >
          {/* Label */}
          <div className="col-span-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: metric.color }} />
              <span className="text-[12px] text-white/50 font-light">{metric.label}</span>
            </div>
          </div>

          {/* Before value */}
          <div className="col-span-2 text-center">
            <span className="text-[11px] font-mono text-red-400/60">{metric.before}</span>
          </div>

          {/* Visual bar comparison */}
          <div className="col-span-4">
            <div className="space-y-1.5">
              {/* Before bar */}
              <div className="h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-red-400/20"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${metric.barBefore}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                />
              </div>
              {/* After bar */}
              <div className="h-2.5 rounded-full bg-white/[0.03] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: `${metric.color}50` }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${Math.max(metric.barAfter, 3)}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                />
              </div>
            </div>
          </div>

          {/* After value */}
          <div className="col-span-2 text-center">
            <span className="text-[11px] font-mono" style={{ color: metric.color }}>
              {metric.after}
            </span>
          </div>

          {/* Improvement % */}
          <div className="col-span-1 text-right">
            <AnimatedPercent value={metric.improvement} delay={0.8 + i * 0.1} color={metric.color} />
          </div>
        </motion.div>
      ))}

      {/* Summary bar */}
      <motion.div
        className="rounded-xl border border-blue-400/10 bg-blue-400/[0.03] p-5 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ boxShadow: "0 0 10px rgba(59,130,246,0.5)" }}
            />
            <span className="text-[13px] font-mono text-white/50">Average operational improvement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extralight text-blue-400">92%</span>
            <span className="text-[10px] font-mono text-white/25">reduction in<br />friction points</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
