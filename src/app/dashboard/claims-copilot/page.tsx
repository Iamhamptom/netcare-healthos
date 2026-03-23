"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Table,
  Download,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  Zap,
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  source?: string;
}

const STARTER_PROMPTS = [
  {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Fix a rejected claim",
    prompt: "My claim was rejected by Discovery with rejection code for insufficient ICD-10 specificity. The code I used was E11. How do I fix this?",
  },
  {
    icon: <Stethoscope className="w-4 h-4" />,
    label: "Code from clinical notes",
    prompt: "Patient presents with acute upper respiratory tract infection, productive cough, low-grade fever. Female, 34 years old. What ICD-10-ZA codes and tariff should I use?",
  },
  {
    icon: <Table className="w-4 h-4" />,
    label: "Compare scheme rules",
    prompt: "Generate a comparison table of claim submission windows, acceptance rates, and top rejection reasons for Discovery, GEMS, and Bonitas.",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: "CDL claim guidance",
    prompt: "A patient with Type 2 diabetes (CDL) on GEMS has exhausted their day-to-day benefits but needs insulin. Can the scheme refuse? What codes do I need?",
  },
  {
    icon: <ClipboardList className="w-4 h-4" />,
    label: "Generate correction letter",
    prompt: "Generate a professional correction letter to Bonitas for a claim that was rejected for missing external cause code. Original claim: S52.50 (fracture of distal radius), tariff 0190.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    label: "Validate a claim",
    prompt: "Validate this claim: ICD-10 J06.9, secondary R50.9, tariff 0190, modifier 0011 (after-hours), male patient age 45, submitted to Momentum Health.",
  },
];

export default function ClaimsCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Welcome to **Claims Copilot**. I'm your SA healthcare claims expert.\n\nI can help you:\n- **Validate** ICD-10-ZA codes, tariffs, and claims\n- **Fix** rejected claims with specific corrections\n- **Code** clinical notes into proper ICD-10 + tariff codes\n- **Compare** scheme rules and rates\n- **Generate** reports, correction letters, and audit documents\n- **Explain** CDL/PMB rules, POPIA compliance, and coding standards\n\nWhat would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: idRef.current++,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages
          .filter((m) => m.id > 0)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/claims-copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history,
          }),
        });

        const data = await res.json();
        const assistantMsg: Message = {
          id: idRef.current++,
          role: "assistant",
          content: data.reply || data.error || "No response received.",
          timestamp: new Date(),
          source: data.source,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: idRef.current++,
            role: "assistant",
            content: "Connection error. Please check your network and try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[#1D3443]/10 bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D8AB5] to-[#1D3443] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1D3443]">
              Claims Copilot
            </h1>
            <p className="text-xs text-[#1D3443]/50">
              SA Healthcare Claims AI — ICD-10-ZA, Tariffs, Schemes, CDL/PMB
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#1D8AB5] to-[#3DA9D1] flex items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#1D3443] text-white rounded-br-md"
                    : "bg-white border border-[#1D3443]/10 text-[#1D3443] rounded-bl-md shadow-sm"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  <MessageContent content={msg.content} />
                </div>

                {msg.role === "assistant" && msg.id > 0 && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#1D3443]/5">
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="flex items-center gap-1 text-xs text-[#1D3443]/40 hover:text-[#1D8AB5] transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedId === msg.id ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() =>
                        downloadAsFile(
                          msg.content,
                          `claims-copilot-${msg.id}.md`
                        )
                      }
                      className="flex items-center gap-1 text-xs text-[#1D3443]/40 hover:text-[#1D8AB5] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1D3443]/10 flex items-center justify-center mt-1">
                  <User className="w-4 h-4 text-[#1D3443]" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1D8AB5] to-[#3DA9D1] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-[#1D3443]/10 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-[#1D3443]/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />

        {/* Starter prompts — only show when no user messages */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {STARTER_PROMPTS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.prompt)}
                className="text-left p-4 rounded-xl border border-[#1D3443]/10 bg-white hover:border-[#1D8AB5]/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-2 text-[#1D8AB5]">
                  {s.icon}
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-xs text-[#1D3443]/60 line-clamp-2 group-hover:text-[#1D3443]/80">
                  {s.prompt}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-[#1D3443]/10 bg-white/80 backdrop-blur-sm px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about claims, codes, rejections, scheme rules..."
              rows={1}
              className="w-full resize-none rounded-xl border border-[#1D3443]/15 bg-white px-4 py-3 pr-12 text-sm text-[#1D3443] placeholder:text-[#1D3443]/30 focus:outline-none focus:ring-2 focus:ring-[#1D8AB5]/30 focus:border-[#1D8AB5]/50 transition-all"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#1D8AB5] to-[#1D3443] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-[#1D3443]/30 mt-2">
          HealthOS-Med — Fine-tuned for SA healthcare claims intelligence
        </p>
      </div>
    </div>
  );
}

/** Render markdown-like content (bold, tables, code blocks, headers) */
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```|\*\*[^*]+\*\*|\|[^\n]+\|)/g);

  return (
    <>
      {parts.map((part, i) => {
        // Code blocks
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part.slice(3, -3).replace(/^\w+\n/, "");
          return (
            <pre
              key={i}
              className="bg-[#1D3443]/5 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto border border-[#1D3443]/10"
            >
              <code>{code}</code>
            </pre>
          );
        }
        // Bold text
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        // Table rows
        if (part.startsWith("|") && part.endsWith("|")) {
          const cells = part.split("|").filter((c) => c.trim());
          const isHeader = cells.some((c) => /^[-:]+$/.test(c.trim()));
          if (isHeader) return null;
          return (
            <div key={i} className="flex gap-0 my-0.5 text-xs">
              {cells.map((cell, j) => (
                <span
                  key={j}
                  className="flex-1 px-2 py-1 border border-[#1D3443]/10 bg-[#1D3443]/[0.02] first:rounded-l last:rounded-r"
                >
                  {cell.trim()}
                </span>
              ))}
            </div>
          );
        }
        // Regular text
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
