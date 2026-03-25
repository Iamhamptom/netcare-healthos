"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { TranscriptSegment, VoiceCommand } from "@/lib/scribe/types";

interface Props {
  segments: TranscriptSegment[];
  voiceCommands: VoiceCommand[];
  isListening: boolean;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
}

export default function LiveTranscript({ segments, voiceCommands, isListening }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstTimestamp = segments[0]?.timestamp || 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  const getCommandInSegment = (text: string): VoiceCommand | undefined => {
    const lower = text.toLowerCase();
    return voiceCommands.find(cmd =>
      lower.includes(cmd.content.toLowerCase().slice(0, 20))
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800">
        <MessageSquare className="w-4 h-4 text-white/40" />
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Live Transcript</span>
        {segments.length > 0 && (
          <span className="ml-auto text-[10px] text-white/30 font-mono">{segments.length} segments</span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-zinc-900/50 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-white/20" />
            </div>
            <p className="text-sm text-white/30">Start recording to see live transcript</p>
            <p className="text-xs text-white/15 mt-1">Words will appear as the doctor and patient speak</p>
          </div>
        ) : (
          segments.map((seg, i) => {
            const cmd = getCommandInSegment(seg.text);
            const showTimeMarker = i === 0 || (seg.timestamp - segments[i - 1].timestamp > 60000);

            return (
              <div key={seg.timestamp + "-" + i}>
                {showTimeMarker && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-zinc-900/50" />
                    <span className="text-[10px] text-white/20 font-mono">
                      {formatTime(seg.timestamp - firstTimestamp)}
                    </span>
                    <div className="flex-1 h-px bg-zinc-900/50" />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cmd ? "bg-teal-500/5 border border-teal-500/10 rounded-lg px-3 py-2 -mx-1" : ""}
                >
                  {seg.speaker === "doctor" ? (
                    <span className="text-teal-400 text-xs font-semibold mr-2">Doctor:</span>
                  ) : seg.speaker === "patient" ? (
                    <span className="text-amber-400/70 text-xs font-semibold mr-2">Patient:</span>
                  ) : null}
                  <span className="text-sm text-white/60 leading-relaxed">
                    {seg.text.replace(/^(Doctor|Patient):\s*/i, "")}
                  </span>
                  {cmd && (
                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-teal-500/15 text-[10px] text-teal-400 font-semibold">
                      CMD: {cmd.type.replace("add_", "")}
                    </span>
                  )}
                </motion.div>
              </div>
            );
          })
        )}

        {isListening && segments.length > 0 && (
          <motion.div
            className="flex items-center gap-1 pt-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1.5 h-4 bg-teal-400/40 rounded-sm" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
