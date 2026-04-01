"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { moduleRegistry } from "@/lib/modules/registry";
import {
  ChevronLeft,
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  RotateCcw,
  Wrench,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  provider?: string;
  timestamp: Date;
}

function MessageContent({ text }: { text: string }) {
  const normalized = text.replace(/\\n/g, "\n");
  const lines = normalized.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={li} className="text-[13px] leading-relaxed">
            {parts.map((part, pi) =>
              pi % 2 === 1 ? (
                <strong key={pi} className="font-semibold">{part}</strong>
              ) : (
                <span key={pi}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function ModuleAgentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const mod = moduleRegistry.getModule(moduleId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!mod) {
    notFound();
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: "user-" + Date.now(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const endpoint = ["/api/modules", moduleId, "chat"].join("/");
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), threadId }),
        });

        const data = await res.json();

        if (data.threadId && !threadId) {
          setThreadId(data.threadId);
        }

        const assistantMsg: Message = {
          id: "assistant-" + Date.now(),
          role: "assistant",
          content: data.reply || "No response received.",
          toolsUsed: data.toolsUsed,
          provider: data.provider,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: Message = {
          id: "error-" + Date.now(),
          role: "assistant",
          content: "Failed to reach the agent. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [moduleId, threadId, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewThread = () => {
    setMessages([]);
    setThreadId(null);
    inputRef.current?.focus();
  };

  const quickActions = mod.agentContext.capabilities.slice(0, 4);
  const accentBg = mod.color + "15";
  const accentLight = mod.color + "12";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-4 shrink-0">
        <Link href="/dashboard" className="hover:text-slate-500 transition-colors">
          Health OS
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link href={mod.pages[0]?.href || "/dashboard"} className="hover:text-slate-500 transition-colors">
          {mod.name}
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-slate-500">Agent</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: accentBg }}
          >
            <Sparkles className="w-5 h-5" style={{ color: mod.color }} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">
              {mod.name} Agent
            </h1>
            <p className="text-[11px] text-slate-400">
              {mod.agentContext.scope}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleNewThread}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            New chat
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden flex flex-col bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: accentLight }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: mod.color }} />
                </div>
                <p className="text-[15px] font-medium text-slate-700 mb-1">
                  {mod.name} Agent
                </p>
                <p className="text-[12px] text-slate-400 mb-6">
                  Full access to all Health OS tools, scoped to {mod.name.toLowerCase()}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action)}
                      className="px-3 py-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all text-left leading-snug"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={"flex gap-3 " + (msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: accentBg }}
                    >
                      <Bot className="w-4 h-4" style={{ color: mod.color }} />
                    </div>
                  )}
                  <div
                    className={"max-w-[80%] rounded-xl px-4 py-3 " + (
                      msg.role === "user"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-50 text-slate-800"
                    )}
                  >
                    <MessageContent text={msg.content} />
                    {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
                        <Wrench className="w-3 h-3 text-slate-300" />
                        {msg.toolsUsed.map((tool, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-100 text-slate-400 rounded"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accentBg }}
                  >
                    <Bot className="w-4 h-4" style={{ color: mod.color }} />
                  </div>
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-[12px] text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Ask the " + mod.shortName + " agent..."}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-lg text-white transition-all disabled:opacity-30"
              style={{ backgroundColor: mod.color }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          {threadId && (
            <div className="mt-1.5 px-1 flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-slate-300 font-mono">
                Thread active
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
