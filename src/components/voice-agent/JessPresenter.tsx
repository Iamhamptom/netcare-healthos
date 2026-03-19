"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionNarration {
  id: string;
  label: string;
  narration: string;
  color: string;
}

interface JessPresenterProps {
  sections: SectionNarration[];
}

export default function JessPresenter({ sections }: JessPresenterProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const prevSectionRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlock = () => {
      setAudioUnlocked(true);
      window.removeEventListener("click", unlock);
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("scroll", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("scroll", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Pre-fetch audio for a section (returns cached blob URL)
  const prefetchAudio = useCallback(async (sectionId: string, text: string, signal?: AbortSignal): Promise<string | null> => {
    const cached = audioCacheRef.current.get(sectionId);
    if (cached) return cached;

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal,
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(sectionId, blobUrl);
      return blobUrl;
    } catch {
      return null;
    }
  }, []);

  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  // Play TTS immediately for a section
  const playTTS = useCallback(async (sectionId: string, text: string) => {
    stopAudio();

    const controller = new AbortController();
    abortRef.current = controller;

    const blobUrl = await prefetchAudio(sectionId, text, controller.signal);
    if (!blobUrl) return;

    const audio = new Audio(blobUrl);
    audioRef.current = audio;
    setIsSpeaking(true);

    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };

    try {
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  }, [stopAudio, prefetchAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stopAudio]);

  // IntersectionObserver to track visible section
  useEffect(() => {
    const entries = new Map<string, number>();

    const observer = new IntersectionObserver(
      (observedEntries) => {
        observedEntries.forEach((entry) => {
          const id = entry.target.getAttribute("data-jess");
          if (id) entries.set(id, entry.intersectionRatio);
        });

        let maxRatio = 0;
        let maxId: string | null = null;
        entries.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        });

        if (maxId && maxRatio > 0.1) {
          setActiveSection(maxId);
          if (!hasScrolled) setHasScrolled(true);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8], rootMargin: "-5% 0px -5% 0px" }
    );

    sections.forEach((s) => {
      const el = document.querySelector(`[data-jess="${s.id}"]`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, hasScrolled]);

  // TTS fires IMMEDIATELY on section change — no typewriter delay
  useEffect(() => {
    if (activeSection === prevSectionRef.current) return;
    prevSectionRef.current = activeSection;

    const section = sections.find((s) => s.id === activeSection);
    if (!section) return;

    // Play TTS immediately if unmuted and audio unlocked
    if (!muted && audioUnlocked) {
      playTTS(section.id, section.narration);
    }

    // Pre-fetch NEXT section's audio in background so it's instant when they scroll
    const currentIdx = sections.findIndex((s) => s.id === activeSection);
    const nextSection = sections[currentIdx + 1];
    if (nextSection) {
      prefetchAudio(nextSection.id, nextSection.narration);
    }
  }, [activeSection, sections, muted, audioUnlocked, playTTS, prefetchAudio]);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (!prev) {
        stopAudio();
      } else if (activeSection) {
        const section = sections.find((s) => s.id === activeSection);
        if (section && audioUnlocked) {
          playTTS(section.id, section.narration);
        }
      }
      return !prev;
    });
  }, [stopAudio, activeSection, sections, audioUnlocked, playTTS]);

  const currentSection = sections.find((s) => s.id === activeSection);
  const currentIndex = sections.findIndex((s) => s.id === activeSection);

  if (dismissed) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setDismissed(false)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-blue-500/50 transition-all group"
        title="Bring Jess back"
      >
        <span className="text-xl">J</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3DA9D1] border-2 border-[#1D3443] group-hover:animate-pulse" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {hasScrolled && currentSection && (
        <motion.div
          key="jess-panel"
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-[#071f0e]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-blue-500/20">
                    J
                  </div>
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#3DA9D1] border-2 border-[#071f0e]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-semibold text-white/90">Jess</span>
                    {isSpeaking && (
                      <motion.div className="flex items-center gap-[2px] ml-1">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-[3px] rounded-full bg-[#3DA9D1]/70"
                            animate={{ height: ["4px", "12px", "4px"] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">your AI guide</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Mute/Unmute toggle */}
                <button
                  onClick={toggleMute}
                  className={`p-1.5 rounded-lg transition-all ${
                    muted
                      ? "text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                      : "text-[#3DA9D1]/60 hover:text-[#3DA9D1] hover:bg-[#3DA9D1]/10"
                  }`}
                  title={muted ? "Unmute Jess" : "Mute Jess"}
                >
                  {muted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.15a.75.75 0 011.28.53v13.74a.75.75 0 01-1.28.53L6.75 14.25H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.15a.75.75 0 011.28.53v12.74a.75.75 0 01-1.28.53l-4.72-3.15H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>

                {/* Minimize */}
                <button
                  onClick={() => {
                    stopAudio();
                    setDismissed(true);
                  }}
                  className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
                  title="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-b border-white/[0.04]">
              {sections.map((s, i) => (
                <motion.div
                  key={s.id}
                  className="h-1 rounded-full flex-1"
                  animate={{
                    backgroundColor: i <= currentIndex ? `${s.color}99` : "rgba(255,255,255,0.04)",
                  }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>

            {/* Section label */}
            <div className="px-4 pt-3 pb-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection.id + "-label"}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentSection.color }}
                  />
                  <span
                    className="text-[10px] font-mono tracking-[0.2em] uppercase font-semibold"
                    style={{ color: currentSection.color }}
                  >
                    {currentSection.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/15 ml-auto">
                    {currentIndex + 1}/{sections.length}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Narration text — shown instantly, no typewriter */}
            <div className="px-4 pb-4 pt-2">
              <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 min-h-[60px] max-h-[120px] overflow-y-auto scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSection.id + "-text"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[13px] text-white/65 font-light leading-relaxed"
                  >
                    {currentSection.narration}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Quick actions */}
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={() => {
                  const nextIdx = currentIndex + 1;
                  if (nextIdx < sections.length) {
                    const el = document.querySelector(`[data-jess="${sections[nextIdx].id}"]`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                disabled={currentIndex >= sections.length - 1}
                className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-400/70 text-[11px] font-mono hover:bg-blue-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                Next section
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const prevIdx = currentIndex - 1;
                  if (prevIdx >= 0) {
                    const el = document.querySelector(`[data-jess="${sections[prevIdx].id}"]`);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }}
                disabled={currentIndex <= 0}
                className="py-2 px-3 rounded-xl bg-white/[0.04] text-white/30 text-[11px] font-mono hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
