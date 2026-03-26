"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Loader2, Sparkles, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CommandAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI assistant. I can search patients, book appointments, check your schedule, send messages, pull analytics — anything you need. Just ask." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  // Keyboard shortcut: Ctrl+K to toggle
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        setMinimized(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const allMessages = [...messages, { role: "user" as const, content: userMsg }];
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--gold)] shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Bot className="w-6 h-6 text-[#050505]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shortcut hint */}
      {!open && (
        <div className="fixed bottom-[88px] right-6 z-50 text-[10px] text-[var(--text-tertiary)] bg-[var(--charcoal)] px-2 py-1 rounded-lg border border-[var(--border)]">
          ⌘K
        </div>
      )}

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 bg-[var(--obsidian)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              minimized
                ? "bottom-6 right-6 w-72 h-12"
                : "bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh]"
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--charcoal)]/50 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-[13px] font-semibold text-[var(--ivory)]">AI Assistant</span>
                <span className="text-[9px] text-[var(--text-tertiary)] bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(!minimized)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <Minimize2 className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--gold)]/10 text-[var(--ivory)] rounded-br-md"
                          : "bg-white/5 text-[var(--text-secondary)] rounded-bl-md"
                      }`}>
                        {msg.content.split("\n").map((line, j) => (
                          <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                            {line.replace(/\*\*(.*?)\*\*/g, "«$1»").split("«").map((part, k) => {
                              if (part.includes("»")) {
                                const [bold, rest] = part.split("»");
                                return <span key={k}><strong className="text-[var(--ivory)]">{bold}</strong>{rest}</span>;
                              }
                              return <span key={k}>{part}</span>;
                            })}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 px-4 py-3 rounded-xl rounded-bl-md">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[var(--border)] shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2.5 text-[13px] text-[var(--ivory)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--gold)]/30"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="w-10 h-10 rounded-lg bg-[var(--gold)] flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity"
                    >
                      <Send className="w-4 h-4 text-[#050505]" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {["Who's waiting?", "Today's schedule", "Revenue this month"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
