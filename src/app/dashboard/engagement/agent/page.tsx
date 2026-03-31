"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Loader2, Sparkles, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  toolsUsed?: string[];
  stepsUsed?: number;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Find all diabetic patients overdue for HbA1c",
  "Create a flu vaccine campaign for patients over 65",
  "Show me the engagement dashboard metrics",
  "Which patients haven't been seen in 12 months?",
  "List all active engagement sequences",
  "Get population health overview",
  "Check upcoming recalls for the next 30 days",
  "Export patient list to Excel",
];

export default function EngagementAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/engagement/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        content: data.response || data.error || "No response",
        toolsUsed: data.toolsUsed,
        stepsUsed: data.stepsUsed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `e-${Date.now()}`, role: "agent",
        content: `Error: ${err instanceof Error ? err.message : "Failed to reach agent"}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/engagement" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-semibold text-gray-900">Engagement Agent</h1>
            <p className="text-[11px] text-gray-500">AI SDK v6 | 18 tools | Gemini 2.5 Flash</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-[16px] font-semibold text-gray-900 mb-1">Patient Engagement Agent</h2>
            <p className="text-[13px] text-gray-500 max-w-md mb-6">
              I orchestrate patient engagement: sequences, campaigns, chronic care, email triage, population health. Ask me anything.
            </p>

            <div className="grid grid-cols-2 gap-2 max-w-lg mb-6">
              {[
                "Enroll patients in care sequences",
                "Create targeted health campaigns",
                "Find chronic care gaps",
                "Triage inbound emails",
                "View population health metrics",
                "Send WhatsApp/email (POPIA safe)",
                "Sync OneDrive documents",
                "Export data to Excel",
              ].map((cap) => (
                <div key={cap} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <Zap className="w-3 h-3 text-gray-400 shrink-0" />
                  {cap}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 max-w-lg">
              {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%]`}>
                {msg.role === "agent" && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Agent</span>
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <span className="text-[10px] text-gray-400">| {msg.toolsUsed.length} tools | {msg.stepsUsed} steps</span>
                    )}
                  </div>
                )}
                <div className={`rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {msg.toolsUsed.map((tool, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{tool}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[12px] text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Agent is thinking...
          </motion.div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="px-6 pb-2 flex gap-1.5 overflow-x-auto">
          {QUICK_PROMPTS.slice(0, 6).map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] text-gray-500 hover:border-gray-300 whitespace-nowrap shrink-0 transition-colors disabled:opacity-40"
            >
              {prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask the engagement agent anything..."
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
