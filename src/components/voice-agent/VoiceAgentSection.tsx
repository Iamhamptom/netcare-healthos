"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import — no SSR (needs browser APIs: microphone, WebSocket)
const VoiceAgent = dynamic(() => import("./VoiceAgent"), { ssr: false });

const features = [
  { icon: "mic", label: "Voice-first", desc: "Just talk — no typing needed" },
  { icon: "brain", label: "Knows everything", desc: "Pricing, features, bookings, POPIA" },
  { icon: "globe", label: "Multilingual", desc: "English, Afrikaans, Zulu & more" },
  { icon: "clock", label: "24/7 available", desc: "Always on, never puts you on hold" },
];

export default function VoiceAgentSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-[#1D3443]">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3DA9D1]/[0.04] rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-6">
              <span className="uppercase tracking-[0.3em] text-[10px] text-[#3DA9D1]/60 font-mono">
                AI Voice Assistant
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white mb-6 leading-[1.1]">
              Talk to our AI.
              <br />
              <span className="text-white/60">Right now.</span>
            </h2>

            <p className="text-[15px] text-white/60 leading-relaxed max-w-md mb-10">
              Our voice AI knows everything about Netcare Health OS — pricing, features,
              how it works, integrations, POPIA compliance. Ask anything, in your
              language.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#3DA9D1]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FeatureIcon type={f.icon} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white/80">{f.label}</div>
                    <div className="text-[11px] text-white/70">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust line */}
            <div className="mt-10 flex items-center gap-4 text-[11px] text-white/70 font-mono">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                End-to-end encrypted
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>Powered by ElevenLabs</span>
            </div>
          </motion.div>

          {/* Right — Voice Agent widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <VoiceAgent inline />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ type }: { type: string }) {
  const cls = "w-4 h-4 text-[#3DA9D1]";
  switch (type) {
    case "mic":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      );
    case "brain":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
    case "globe":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    case "clock":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}
