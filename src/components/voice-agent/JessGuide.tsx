"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const VoiceAgent = dynamic(() => import("./VoiceAgent"), { ssr: false });

interface JessGuideProps {
  /** Context hint shown to user about what Jess will explain */
  context: string;
  /** Accent color for the section */
  color?: string;
}

/**
 * A toggleable Jess voice agent that appears inline within a section.
 * Users click to expand, and Jess explains the section they're viewing.
 */
export default function JessGuide({ context, color = "#3b82f6" }: JessGuideProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
    >
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="group w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300"
        style={{
          borderColor: expanded ? `${color}30` : "rgba(255,255,255,0.06)",
          backgroundColor: expanded ? `${color}08` : "rgba(255,255,255,0.02)",
        }}
      >
        {/* Jess avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
          style={{ backgroundColor: `${color}15` }}
        >
          {expanded ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M12 12h.008v.007H12V12z" />
              </svg>
            </motion.div>
          ) : (
            <svg className="w-4.5 h-4.5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-white/70">
              {expanded ? "Jess is listening" : "Ask Jess about this"}
            </span>
            {expanded && (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            )}
          </div>
          <span className="text-[11px] text-white/70 font-mono">{context}</span>
        </div>

        {/* Toggle icon */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/70"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.div>
      </button>

      {/* Expandable voice agent */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <VoiceAgent inline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
