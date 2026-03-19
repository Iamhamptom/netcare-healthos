"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useConversation } from "@11labs/react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceAgentProps {
  /** If true, render inline (landing page section). If false, render as floating overlay. */
  inline?: boolean;
}

export default function VoiceAgent({ inline = false }: VoiceAgentProps) {
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "agent"; text: string }>>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      setErrorMsg("");
      setTranscript([]);
    },
    onDisconnect: () => {},
    onMessage: (msg) => {
      if (msg.message) {
        setTranscript((prev) => [
          ...prev,
          { role: msg.source === "user" ? "user" : "agent", text: msg.message },
        ]);
      }
    },
    onError: (err) => {
      console.error("VoiceAgent error:", err);
      setErrorMsg("Connection lost. Please try again.");
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const startConversation = useCallback(async () => {
    try {
      // Request microphone
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from our backend (secure — never expose agent ID to client)
      const res = await fetch("/api/voice/agent", { method: "POST" });
      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
        return;
      }

      if (data.signedUrl) {
        await conversation.startSession({ signedUrl: data.signedUrl, connectionType: "websocket" });
      } else if (data.agentId) {
        await conversation.startSession({ agentId: data.agentId, connectionType: "websocket" });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMsg("Microphone access is required. Please allow it and try again.");
      } else {
        setErrorMsg("Failed to connect. Please try again.");
      }
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  // Floating mode — button + overlay
  if (!inline) {
    return (
      <>
        {/* Floating mic button */}
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => { setOpen(true); startConversation(); }}
              className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-[#3DA9D1] shadow-lg shadow-[#3DA9D1]/20 flex items-center justify-center hover:bg-[#1D3443] hover:shadow-[#3DA9D1]/30 transition-all duration-300 z-50"
              title="Talk to Netcare Health OS AI"
            >
              <MicIcon className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Full overlay */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => { if (e.target === e.currentTarget) { stopConversation(); setOpen(false); } }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <AgentUI
                  isConnected={isConnected}
                  isSpeaking={isSpeaking}
                  transcript={transcript}
                  errorMsg={errorMsg}
                  scrollRef={scrollRef}
                  onStart={startConversation}
                  onStop={() => { stopConversation(); setOpen(false); }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline mode — embedded in landing page
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
        <AgentUI
          isConnected={isConnected}
          isSpeaking={isSpeaking}
          transcript={transcript}
          errorMsg={errorMsg}
          scrollRef={scrollRef}
          onStart={startConversation}
          onStop={stopConversation}
          dark
        />
      </div>
    </div>
  );
}

/* ─── Inner agent UI ─── */

function AgentUI({
  isConnected, isSpeaking, transcript, errorMsg, scrollRef, onStart, onStop, dark = false,
}: {
  isConnected: boolean;
  isSpeaking: boolean;
  transcript: Array<{ role: "user" | "agent"; text: string }>;
  errorMsg: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onStart: () => void;
  onStop: () => void;
  dark?: boolean;
}) {
  const bg = dark ? "bg-transparent" : "bg-white";
  const textPrimary = dark ? "text-white" : "text-gray-900";
  const textSecondary = dark ? "text-white/50" : "text-gray-500";
  const textTertiary = dark ? "text-white/30" : "text-gray-400";
  const borderColor = dark ? "border-white/10" : "border-gray-200";
  const bubbleAgent = dark ? "bg-white/10 text-white/80" : "bg-gray-100 text-gray-700";
  const bubbleUser = "bg-[#3DA9D1] text-white";

  return (
    <div className={`${bg} flex flex-col`}>
      {/* Header */}
      <div className={`p-5 border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#3DA9D1] flex items-center justify-center">
                <MicIcon className="w-5 h-5 text-white" />
              </div>
              {isConnected && (
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#3DA9D1] border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <div className={`text-[14px] font-semibold ${textPrimary}`}>Netcare Health OS AI</div>
              <div className={`text-[11px] ${textSecondary} flex items-center gap-1.5`}>
                {isConnected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] animate-pulse" />
                    {isSpeaking ? "Speaking..." : "Listening..."}
                  </>
                ) : (
                  "Ready to talk"
                )}
              </div>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={onStop}
              className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
              title="End conversation"
            >
              <PhoneOffIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Visualizer + Transcript */}
      <div className="flex flex-col items-center min-h-[320px]">
        {/* Voice orb */}
        <div className="py-8 flex flex-col items-center gap-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer rings */}
            {isConnected && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#3DA9D1]/20"
                  animate={isSpeaking ? { scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] } : { scale: 1, opacity: 0.2 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-[#3DA9D1]/30"
                  animate={isSpeaking ? { scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] } : { scale: 1, opacity: 0.3 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border border-[#3DA9D1]/40"
                  animate={isSpeaking ? { scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] } : { scale: 1, opacity: 0.4 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                />
              </>
            )}
            {/* Core orb */}
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] shadow-lg shadow-[#3DA9D1]/30 flex items-center justify-center"
              animate={
                isConnected
                  ? isSpeaking
                    ? { scale: [1, 1.08, 1], boxShadow: ["0 10px 30px rgba(16,185,129,0.3)", "0 10px 50px rgba(16,185,129,0.5)", "0 10px 30px rgba(16,185,129,0.3)"] }
                    : { scale: [1, 1.03, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isConnected ? (
                <WaveIcon className="w-8 h-8 text-white" />
              ) : (
                <MicIcon className="w-8 h-8 text-white" />
              )}
            </motion.div>
          </div>

          {/* Status text */}
          {!isConnected && !errorMsg && (
            <p className={`text-[12px] ${textTertiary} text-center max-w-[220px]`}>
              Talk to our AI assistant about the platform, features, pricing, or anything else
            </p>
          )}
          {errorMsg && (
            <p className="text-[12px] text-red-500 text-center max-w-[260px]">{errorMsg}</p>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div
            ref={scrollRef}
            className={`w-full max-h-[160px] overflow-y-auto px-5 pb-4 space-y-2 border-t ${borderColor} pt-3`}
          >
            {transcript.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
                    msg.role === "user"
                      ? `${bubbleUser} rounded-br-md`
                      : `${bubbleAgent} rounded-bl-md`
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Action */}
      <div className={`p-5 border-t ${borderColor}`}>
        {isConnected ? (
          <button
            onClick={onStop}
            className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <PhoneOffIcon className="w-4 h-4" />
            End Conversation
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-full py-3 rounded-2xl bg-[#3DA9D1] hover:bg-[#1D3443] text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#3DA9D1]/20 hover:shadow-[#3DA9D1]/30"
          >
            <MicIcon className="w-4 h-4" />
            Start Conversation
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Icons ─── */

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function PhoneOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M3 3l18 18M10.586 10.586A2 2 0 0112 9V5a2 2 0 00-4 0v4c0 .256.048.5.135.724" />
    </svg>
  );
}

function WaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
