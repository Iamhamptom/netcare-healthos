"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Step {
  step: string;
  title: string;
  description: string;
}

export default function JourneyTimeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const colors = [
    "#3b82f6", "#10b981", "#8b5cf6", "#06b6d4",
    "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  ];

  return (
    <div ref={ref} className="relative">
      {/* SVG connecting line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
        <motion.div
          className="w-full bg-gradient-to-b from-blue-400/30 via-[#3DA9D1]/20 to-purple-400/30"
          initial={{ height: "0%" }}
          animate={inView ? { height: "100%" } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="space-y-6 md:space-y-0">
        {steps.map((s, i) => {
          const isLeft = i % 2 === 0;
          const color = colors[i];
          const isActive = activeStep === i;

          return (
            <motion.div
              key={s.step}
              className={`relative flex items-center gap-6 md:gap-0 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              } md:mb-0 mb-2`}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
            >
              {/* Timeline node */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                <motion.div
                  className="relative"
                  animate={isActive ? { scale: 1.3 } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: color,
                      backgroundColor: isActive ? color : `${color}20`,
                      boxShadow: isActive ? `0 0 12px ${color}60` : "none",
                      transition: "all 0.3s",
                    }}
                  />
                  {/* Pulse ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `1px solid ${color}` }}
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </div>

              {/* Content card */}
              <div
                className={`ml-16 md:ml-0 md:w-[calc(50%-32px)] ${
                  isLeft ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"
                }`}
              >
                <motion.div
                  className={`rounded-xl border p-5 transition-all duration-400 cursor-pointer ${
                    isActive
                      ? "border-white/15 bg-white/[0.06] scale-[1.02]"
                      : "border-white/[0.04] bg-white/[0.02]"
                  }`}
                  style={{
                    borderColor: isActive ? `${color}30` : undefined,
                    boxShadow: isActive ? `0 0 30px ${color}08` : "none",
                  }}
                >
                  <div className={`flex items-center gap-3 mb-2 ${isLeft ? "md:justify-end" : ""}`}>
                    <span
                      className="text-[20px] font-extralight font-mono"
                      style={{ color: `${color}80` }}
                    >
                      {s.step}
                    </span>
                    <h4 className="text-[14px] font-medium text-white/80">{s.title}</h4>
                  </div>
                  <p className="text-[12px] text-white/70 font-light leading-relaxed">{s.description}</p>

                  {/* Progress indicator */}
                  <motion.div
                    className="mt-3 h-[2px] rounded-full"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: `${color}50` }}
                      initial={{ width: "0%" }}
                      animate={inView ? { width: "100%" } : {}}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.12 }}
                    />
                  </motion.div>
                </motion.div>
              </div>

              {/* Spacer for opposite side */}
              <div className="hidden md:block md:w-[calc(50%-32px)]" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
