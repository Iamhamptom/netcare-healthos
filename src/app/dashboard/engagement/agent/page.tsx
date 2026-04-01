"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Loader2, Sparkles, Plus, MessageSquare, Search,
  Settings, Trash2, ChevronDown, ChevronRight, Zap, Clock,
  Inbox, Users, Target, Heart, Mail, Calendar, FileText,
  MoreHorizontal, X, Download,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  toolsUsed?: string[];
  stepsUsed?: number;
  timestamp: Date;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Quick Prompts ────────────────────────────────────────────

const CATEGORIES = [
  {
    label: "Hospital Setup",
    icon: Settings,
    prompts: [
      "Set up a new Medicross clinic with CareOn bridge",
      "List all hospitals and their connection status",
      "Show me hospital details for the main practice",
    ],
  },
  {
    label: "Patient Engagement",
    icon: Heart,
    prompts: [
      "Find all diabetic patients overdue for HbA1c",
      "Create a flu vaccine campaign for patients over 65",
      "List all active engagement sequences",
    ],
  },
  {
    label: "Communication",
    icon: MessageSquare,
    prompts: [
      "Show me recent patient chats",
      "Check upcoming recalls for next 30 days",
      "Get the email inbox with triage status",
    ],
  },
  {
    label: "Analytics",
    icon: Target,
    prompts: [
      "Get network-wide analytics across all hospitals",
      "Show engagement dashboard metrics",
      "Get population health overview",
    ],
  },
  {
    label: "Data & Export",
    icon: FileText,
    prompts: [
      "Export patient list to Excel",
      "Sync OneDrive files",
      "Show campaign results funnel",
    ],
  },
];

// ── Main Component ───────────────────────────────────────────

export default function EngagementAgentPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread?.messages || [];

  // Load threads from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("healthos-agent-threads");
      if (saved) {
        const parsed = JSON.parse(saved).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          messages: t.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        setThreads(parsed);
        if (parsed.length > 0) setActiveThreadId(parsed[0].id);
      }
    } catch {}
  }, []);

  // Save threads to localStorage
  const saveThreads = useCallback((updated: Thread[]) => {
    setThreads(updated);
    try { localStorage.setItem("healthos-agent-threads", JSON.stringify(updated)); } catch {}
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const createThread = () => {
    const thread: Thread = {
      id: `t-${Date.now()}`,
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [thread, ...threads];
    saveThreads(updated);
    setActiveThreadId(thread.id);
    inputRef.current?.focus();
  };

  const deleteThread = (id: string) => {
    const updated = threads.filter((t) => t.id !== id);
    saveThreads(updated);
    if (activeThreadId === id) setActiveThreadId(updated[0]?.id || null);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    // Create thread if none active
    let threadId = activeThreadId;
    let currentThreads = [...threads];
    if (!threadId) {
      const thread: Thread = {
        id: `t-${Date.now()}`, title: msg.slice(0, 50),
        messages: [], createdAt: new Date(), updatedAt: new Date(),
      };
      currentThreads = [thread, ...currentThreads];
      threadId = thread.id;
      setActiveThreadId(threadId);
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: msg, timestamp: new Date() };
    const updatedThreads = currentThreads.map((t) =>
      t.id === threadId
        ? { ...t, messages: [...t.messages, userMsg], title: t.messages.length === 0 ? msg.slice(0, 50) : t.title, updatedAt: new Date() }
        : t,
    );
    saveThreads(updatedThreads);
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
        id: `a-${Date.now()}`, role: "agent",
        content: data.response || data.error || "No response",
        toolsUsed: data.toolsUsed, stepsUsed: data.stepsUsed,
        timestamp: new Date(),
      };

      const final = updatedThreads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, agentMsg], updatedAt: new Date() } : t,
      );
      saveThreads(final);
    } catch (err) {
      const errMsg: Message = {
        id: `e-${Date.now()}`, role: "agent",
        content: `Error: ${err instanceof Error ? err.message : "Connection failed"}`,
        timestamp: new Date(),
      };
      const final = updatedThreads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, errMsg], updatedAt: new Date() } : t,
      );
      saveThreads(final);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const filteredThreads = sidebarSearch
    ? threads.filter((t) => t.title.toLowerCase().includes(sidebarSearch.toLowerCase()))
    : threads;

  const toggleTools = (msgId: string) => {
    const next = new Set(expandedTools);
    next.has(msgId) ? next.delete(msgId) : next.add(msgId);
    setExpandedTools(next);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-white">
      {/* ── Left Sidebar ────────────────────────────── */}
      <div className="w-64 border-r border-gray-200 flex flex-col shrink-0 bg-gray-50/50">
        {/* New Chat */}
        <div className="p-3 border-b border-gray-100">
          <button onClick={createThread} className="w-full flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search threads..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-700 placeholder-gray-400 focus:border-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {filteredThreads.length === 0 && (
            <p className="text-[11px] text-gray-400 text-center py-8">No conversations yet</p>
          )}
          {filteredThreads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] flex items-start gap-2 group transition-colors ${
                thread.id === activeThreadId ? "bg-white border border-gray-200 shadow-sm" : "hover:bg-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{thread.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {thread.messages.length} msgs · {timeAgo(thread.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-gray-400" />
              </button>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>24 tools · Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-[13px] font-semibold text-gray-900">Engagement Agent</h1>
              <p className="text-[10px] text-gray-500">Set up hospitals, manage patients, run campaigns, triage emails</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onSend={sendMessage} />
          ) : (
            <div className="p-5 space-y-4 max-w-3xl mx-auto">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-gray-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[70%] text-[13px] leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Bot className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">Agent</span>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] text-[13px] text-gray-800 leading-relaxed">
                          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                        </div>
                        {/* Tool Usage (collapsible) */}
                        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                          <div className="mt-1.5 max-w-[85%]">
                            <button onClick={() => toggleTools(msg.id)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                              {expandedTools.has(msg.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              <Zap className="w-3 h-3" />
                              {msg.toolsUsed.length} tools · {msg.stepsUsed} steps
                            </button>
                            {expandedTools.has(msg.id) && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-1 flex flex-wrap gap-1">
                                {msg.toolsUsed.map((tool, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{tool}</span>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[12px] text-gray-400 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Agent is working...
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-2 shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Quick prompts (when in conversation) */}
            {messages.length > 0 && (
              <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                {["Show patient chats", "Chronic care gaps", "Campaign results", "Network analytics", "Export to Excel"].map((p) => (
                  <button key={p} onClick={() => sendMessage(p)} disabled={loading}
                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] text-gray-500 hover:border-gray-300 whitespace-nowrap shrink-0 disabled:opacity-40 transition-colors">
                    {p}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-xl p-2 focus-within:border-gray-400 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask the agent anything — set up hospitals, find patients, run campaigns..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 px-2 py-1 max-h-32"
                style={{ minHeight: "36px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-gray-900 hover:bg-gray-800 disabled:opacity-20 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              24 tools · Gemini 2.5 Flash · POPIA compliant · Connected to Netcare Health OS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty State (Manus-style) ────────────────────────────────

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-gray-400" />
      </div>
      <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Health OS Agent</h2>
      <p className="text-[12px] text-gray-500 max-w-md text-center mb-8">
        I can set up hospitals, manage patient engagement, run campaigns, triage emails, find chronic care gaps, and export data. What do you need?
      </p>

      <div className="w-full max-w-2xl space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <cat.icon className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{cat.label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
