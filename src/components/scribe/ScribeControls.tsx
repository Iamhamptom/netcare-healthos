"use client";

import { motion } from "framer-motion";
import { Mic, Pause, Play, Square, ChevronDown } from "lucide-react";
import { formatDuration } from "@/hooks/useAudioRecorder";
import WaveformVisualizer from "@/components/intake/WaveformVisualizer";

interface Props {
  state: "idle" | "listening" | "paused" | "completed";
  duration: number;
  audioLevel: number;
  selectedPatient: string;
  patients: Array<{ id: string; name: string }>;
  onPatientChange: (id: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const STATUS_CONFIG = {
  idle: { color: "bg-white/30", label: "READY", textColor: "text-white/40" },
  listening: { color: "bg-red-500 animate-pulse", label: "LISTENING", textColor: "text-red-400" },
  paused: { color: "bg-amber-500", label: "PAUSED", textColor: "text-amber-400" },
  completed: { color: "bg-teal-500", label: "COMPLETED", textColor: "text-teal-400" },
};

export default function ScribeControls({
  state, duration, audioLevel, selectedPatient, patients,
  onPatientChange, onStart, onPause, onResume, onStop,
}: Props) {
  const status = STATUS_CONFIG[state];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-shrink-0">
          <select
            value={selectedPatient}
            onChange={(e) => onPatientChange(e.target.value)}
            disabled={state === "listening"}
            className="bg-zinc-900/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-teal-500/50 disabled:opacity-40 w-52"
          >
            <option value="">Select patient</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
          <span className={`text-xs font-semibold tracking-wider ${status.textColor}`}>{status.label}</span>
        </div>

        <span className="text-xl font-mono font-bold text-white/80 tracking-wider flex-shrink-0">
          {formatDuration(duration)}
        </span>

        {(state === "listening" || state === "paused") && (
          <div className="flex-1 max-w-[200px]">
            <WaveformVisualizer
              audioLevel={audioLevel}
              isRecording={state === "listening"}
              isPaused={state === "paused"}
            />
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {state === "idle" && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors"
            >
              <Mic className="w-4 h-4" />
              Start Session
            </motion.button>
          )}

          {state === "listening" && (
            <>
              <button onClick={onPause} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white/70 text-sm font-medium transition-colors">
                <Pause className="w-4 h-4" /> Pause
              </button>
              <button onClick={onStop} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors">
                <Square className="w-4 h-4" /> End
              </button>
            </>
          )}

          {state === "paused" && (
            <>
              <button onClick={onResume} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm font-medium transition-colors">
                <Play className="w-4 h-4" /> Resume
              </button>
              <button onClick={onStop} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors">
                <Square className="w-4 h-4" /> End
              </button>
            </>
          )}

          {state === "completed" && (
            <span className="text-xs text-teal-400 font-medium">Session ended</span>
          )}
        </div>
      </div>
    </div>
  );
}
