"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Mic, MicOff, Paperclip, Sparkles, Activity,
  ChevronRight, Server, X, Loader2
} from "lucide-react";

export default function AgentChatPage() {
  const router = useRouter();
  const [voiceActive, setVoiceActive] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [localInput, setLocalInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
      credentials: "include",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for navigation tool calls in the latest message
  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;

    for (const part of last.parts || []) {
      // v6: tool parts use "tool-<toolName>" pattern
      if (part.type === "tool-navigate_to") {
        const toolPart = part as { type: string; toolInvocation?: { args?: Record<string, unknown> } };
        const path = toolPart.toolInvocation?.args?.path as string;
        if (path) {
          setTimeout(() => {
            if (path.startsWith("http")) {
              window.open(path, "_blank");
            } else {
              router.push(path);
            }
          }, 1000);
        }
      }
    }
  }, [messages, router]);

  const handleSend = () => {
    if (!localInput.trim() || isLoading) return;
    sendMessage({ text: localInput.trim() });
    setLocalInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="flex-none px-6 py-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Health OS Agent</h1>
            <p className="text-[10px] text-[#3DA9D1] font-bold uppercase tracking-wider">
              Claude Sonnet 4.6 • {messages.length > 0 ? "Active" : "Ready"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">9 tools • 189K knowledge chunks</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Health OS Agent</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
                I can navigate the platform, look up codes, validate claims, generate documents, search the knowledge base, and guide you through onboarding.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  "Take me to the claims analyzer",
                  "What ICD-10 code for diabetes with neuropathy?",
                  "Show me the executive dashboard",
                  "Help me onboard a new doctor",
                ].map((s, i) => (
                  <button key={i} onClick={() => { setLocalInput(s); setTimeout(handleSend, 100); }}
                    className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-left text-sm text-slate-300 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] flex items-center justify-center shrink-0 mt-1">
                  <Activity className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] ${m.role === "user" ? "order-first" : ""}`}>
                {/* Text parts */}
                {m.parts?.filter(p => p.type === "text").map((part, i) => (
                  <div key={i} className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#3DA9D1] text-white rounded-tr-sm ml-auto"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}>
                    {part.text}
                  </div>
                ))}

                {/* Tool parts — v6 uses tool-<toolName> pattern */}
                {m.parts?.filter(p => typeof p.type === "string" && p.type.startsWith("tool-")).map((part, i) => {
                  const toolName = part.type.replace("tool-", "");
                  const toolPart = part as { type: string; toolInvocation?: { state?: string; args?: Record<string, unknown> } };
                  const state = toolPart.toolInvocation?.state;
                  const args = toolPart.toolInvocation?.args;
                  return (
                    <div key={i} className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                      <Server className="w-3 h-3 text-[#3DA9D1]" />
                      <span className="text-[#3DA9D1] font-bold">{toolName}</span>
                      {state === "result" && <span className="text-emerald-400">done</span>}
                      {state === "call" && <Loader2 className="w-3 h-3 animate-spin text-[#3DA9D1]" />}
                      {toolName === "navigate_to" && args?.path ? (
                        <span className="text-slate-400">→ {String(args.path)}</span>
                      )}
                    </div>
                  );
                })}

                {/* Fallback for messages without parts */}
                {(!m.parts || m.parts.length === 0) && m.content && (
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#3DA9D1] text-white rounded-tr-sm"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}>
                    {m.content}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-slate-400 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-none px-6 py-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={localInput}
              onChange={e => setLocalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the Health OS Agent..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-[#3DA9D1]/50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!localInput.trim() || isLoading}
            className="p-3 rounded-xl bg-[#3DA9D1] hover:bg-[#3DA9D1]/80 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">Health OS Agent • Claude Sonnet 4.6 • 9 tools • navigate_to enabled</p>
      </div>
    </div>
  );
}
