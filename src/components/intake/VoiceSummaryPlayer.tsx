"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Pause, Play, Square, Loader2 } from "lucide-react";

interface Props {
  text: string;
  label?: string;
}

export default function VoiceSummaryPlayer({ text, label = "Listen to Summary" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [configured, setConfigured] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const fetchAndPlay = useCallback(async () => {
    if (!text.trim()) return;
    setState("loading");

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3000) }),
      });

      if (res.status === 503) {
        setConfigured(false);
        setState("idle");
        return;
      }
      if (!res.ok) {
        setState("idle");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setState("idle");
      audio.onerror = () => setState("idle");

      await audio.play();
      setState("playing");
    } catch {
      setState("idle");
    }
  }, [text]);

  const handleToggle = useCallback(() => {
    const audio = audioRef.current;
    if (state === "idle") {
      fetchAndPlay();
    } else if (state === "playing" && audio) {
      audio.pause();
      setState("paused");
    } else if (state === "paused" && audio) {
      audio.play();
      setState("playing");
    }
  }, [state, fetchAndPlay]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState("idle");
  }, []);

  if (!configured) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={state === "loading"}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-medium transition-colors disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : state === "playing" ? (
          <Pause className="w-3.5 h-3.5" />
        ) : state === "paused" ? (
          <Play className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
        {state === "idle" ? label : state === "loading" ? "Loading..." : state === "playing" ? "Pause" : "Resume"}
      </button>

      {(state === "playing" || state === "paused") && (
        <>
          <button
            onClick={handleStop}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>

          {state === "playing" && (
            <motion.div className="flex items-center gap-[2px] ml-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-[2px] rounded-full bg-teal-400/60"
                  animate={{ height: ["3px", "10px", "3px"] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
