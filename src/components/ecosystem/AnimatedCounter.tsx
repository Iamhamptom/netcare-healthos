"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
  delay = 0,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const springVal = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(springVal, (v) => {
    if (value >= 1000) return `${(v / 1000).toFixed(1)}K`;
    if (value >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    return Math.round(v).toLocaleString();
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => springVal.set(value), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, value, springVal, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
