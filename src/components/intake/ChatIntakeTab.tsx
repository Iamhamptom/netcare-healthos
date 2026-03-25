"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Volume2, Sparkles, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Props {
  selectedPatient: string;
  patients: Array<{ id: string; name: string }>;
}

export default function ChatIntakeTab({ selectedPatient, patients }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(6);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 0) {
      sendToAgent("Hello, I am here for my appointment.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendToAgent = useCallback(async (text: string) => {
    setLoading(true);
    const patientName = patients.find(p => p.id === selectedPatient)?.name || "Patient";
    const history = messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    try {
      const res = await fetch("/api/agents/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, patientName, history }),
      });
      if (!res.ok) throw new Error("Agent failed");
      const data = await res.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.response || data.question || "I am here to help with your intake.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setStep(data.step || step + 1);
      setTotalSteps(data.totalSteps || 6);
      setComplete(!!data.complete);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I am having trouble connecting. Please try again.",
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, patients, selectedPatient, step]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    await sendToAgent(text);
    inputRef.current?.focus();
  }, [input, loading, sendToAgent]);

  const handlePlayTTS = useCallback(async (msg: Message) => {
    if (playingId === msg.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    setPlayingId(msg.id);

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.content.slice(0, 3000) }),
      });
      if (!res.ok) { setPlayingId(null); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch {
      setPlayingId(null);
    }
  }, [playingId]);

  const handleGenerateSummary = useCallback(() => {
    const transcript = messages
      .map(m => `${m.role === "user" ? "Patient" : "Intake Agent"}: ${m.content}`)
      .join("\n\n");
    sessionStorage.setItem("intake-chat-transcript", transcript);
    alert("Chat transcript saved. Switch to Voice tab and paste it for AI analysis.");
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      {/* Progress bar */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-zinc-800">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors ${
              i < step ? "bg-teal-500/60" : "bg-zinc-800"
            }`}
          />
        ))}
        <span className="text-[10px] text-white/30 ml-2 font-mono">{step}/{totalSteps}</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-teal-500/20" : "bg-zinc-800"
            }`}>
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-white/50" />
              )}
            </div>

            <div className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
              <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-teal-500/20 text-teal-100 rounded-br-md"
                  : "bg-zinc-900/50 text-white/70 border border-zinc-800 rounded-bl-md"
              }`}>
                {msg.content}
              </div>

              {msg.role === "assistant" && (
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => handlePlayTTS(msg)}
                    className="p-1 rounded hover:bg-zinc-900/50 text-white/20 hover:text-teal-400 transition-colors"
                    title="Listen"
                  >
                    <Volume2 className={`w-3 h-3 ${playingId === msg.id ? "text-teal-400" : ""}`} />
                  </button>
                  <span className="text-[10px] text-white/15">
                    {new Date(msg.timestamp).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white/50" />
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/30"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {complete && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4" />
              Intake Complete
            </div>
            <p className="text-xs text-white/40 mb-4">All pre-appointment information collected</p>
            <button
              onClick={handleGenerateSummary}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              Generate Clinical Summary
            </button>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={complete ? "Intake complete" : "Type your response..."}
            disabled={loading || complete}
            className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40 disabled:opacity-40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || complete}
            className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-600 flex items-center justify-center text-white transition-colors disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
