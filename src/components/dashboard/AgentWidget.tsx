"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Send, X, Maximize2, Minimize2, Paperclip,
  Mic, MicOff, Activity, Server, Loader2, ArrowRight, Upload,
  Sparkles, FileText, ChevronUp
} from "lucide-react";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools?: string[];
  files?: string[];
  timestamp: Date;
}

let counter = 0;

// Navigation map — instant client-side
const NAV_MAP: Record<string, { path: string; label: string }> = {
  "intake": { path: "/dashboard/intake", label: "Clinical Intake" },
  "scribe": { path: "/dashboard/scribe", label: "AI Scribe" },
  "claim": { path: "/dashboard/claims", label: "Claims Analyzer" },
  "copilot": { path: "/dashboard/claims-copilot", label: "Claims Copilot" },
  "bridge": { path: "/dashboard/bridge", label: "CareOn Bridge" },
  "careon": { path: "/dashboard/bridge", label: "CareOn Bridge" },
  "switch": { path: "/dashboard/switching", label: "Switching Engine" },
  "fhir": { path: "/dashboard/fhir-hub", label: "FHIR Hub" },
  "patient": { path: "/dashboard/patients", label: "Patients" },
  "booking": { path: "/dashboard/bookings", label: "Bookings" },
  "checkin": { path: "/dashboard/checkin", label: "Check-in" },
  "check-in": { path: "/dashboard/checkin", label: "Check-in" },
  "billing": { path: "/dashboard/billing", label: "Billing" },
  "invoice": { path: "/dashboard/billing", label: "Billing" },
  "recall": { path: "/dashboard/recall", label: "Recall" },
  "daily": { path: "/dashboard/daily", label: "Daily Tasks" },
  "document": { path: "/dashboard/documents", label: "Documents" },
  "referral": { path: "/dashboard/referrals", label: "Referrals" },
  "prescription": { path: "/dashboard/documents", label: "Documents" },
  "assistant": { path: "/dashboard/assistant", label: "AI Assistant" },
  "engagement": { path: "/dashboard/engagement", label: "Engagement Hub" },
  "notification": { path: "/dashboard/notifications", label: "Notifications" },
  "executive": { path: "/dashboard/executive", label: "Executive Dashboard" },
  "financial": { path: "/dashboard/financial-director", label: "Financial Director" },
  "governance": { path: "/dashboard/ai-governance", label: "AI Governance" },
  "architecture": { path: "/dashboard/architecture", label: "Architecture" },
  "resource": { path: "/dashboard/resources", label: "Resources" },
  "research": { path: "/dashboard/resources", label: "Resources" },
  "pitch": { path: "/dashboard/pitch", label: "Pitch Deck" },
  "product map": { path: "/dashboard/product-map", label: "Product Map" },
  "integration": { path: "/dashboard/integration-map", label: "Integration Map" },
  "cio": { path: "/dashboard/cio", label: "CIO Dashboard" },
  "healthbridge": { path: "/dashboard/healthbridge", label: "Healthbridge" },
  "coder": { path: "/dashboard/healthbridge/ai-coder", label: "AI Coder" },
  "whatsapp": { path: "/dashboard/whatsapp", label: "WhatsApp" },
  "home": { path: "/dashboard/home", label: "Home" },
  "network": { path: "/dashboard/network", label: "Network Command" },
  "agent": { path: "/dashboard/agent-chat", label: "Agent Chat" },
  "setting": { path: "/dashboard/settings", label: "Settings" },
  "doctor": { path: "https://doctor-os.vercel.app", label: "Doctor OS" },
  "visiocode": { path: "https://visiocode.vercel.app", label: "VisioCode" },
  "flow": { path: "https://patient-flow-ai.vercel.app", label: "Patient Flow AI" },
};

export default function AgentWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [userName, setUserName] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const initDone = useRef(false);

  // Fetch user on mount
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.name) setUserName(d.user.name.split(" ")[0]); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const handleNav = useCallback((query: string): boolean => {
    const lower = query.toLowerCase();
    const isNav = /(take me|go to|open|show|navigate|bring up|pull up)/.test(lower);
    if (!isNav) return false;

    for (const [kw, nav] of Object.entries(NAV_MAP)) {
      if (lower.includes(kw)) {
        setMsgs(prev => [...prev, { id: `m-${++counter}`, role: "assistant", content: `Taking you to **${nav.label}**...`, timestamp: new Date() }]);
        setTimeout(() => {
          if (nav.path.startsWith("http")) window.open(nav.path, "_blank");
          else router.push(nav.path);
        }, 800);
        return true;
      }
    }
    return false;
  }, [router]);

  const send = useCallback(async () => {
    if (!input.trim() && files.length === 0) return;
    if (loading) return;

    const query = input.trim();
    const attachedFiles = files.map(f => f.name);
    setMsgs(prev => [...prev, { id: `m-${++counter}`, role: "user", content: query, files: attachedFiles, timestamp: new Date() }]);
    setInput("");
    setFiles([]);
    setLoading(true);

    // Fast nav check
    if (query && handleNav(query)) {
      setLoading(false);
      return;
    }

    // Call SDK agent
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: [
            ...msgs.filter(m => m.role === "user" || m.role === "assistant").slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: query + (attachedFiles.length ? ` [Files attached: ${attachedFiles.join(", ")}]` : "") },
          ],
        }),
      });

      if (!res.ok) throw new Error("Agent failed");

      // Read streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        // Add placeholder message
        const msgId = `m-${++counter}`;
        setMsgs(prev => [...prev, { id: msgId, role: "assistant", content: "", timestamp: new Date() }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          // Extract text from AI SDK stream format: 0:"text"
          const matches = chunk.match(/0:"([^"]*)"/g);
          if (matches) {
            for (const m of matches) {
              fullText += m.slice(3, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
            }
            setMsgs(prev => prev.map(msg => msg.id === msgId ? { ...msg, content: fullText } : msg));
          }
        }

        // If no text was extracted, show the raw response
        if (!fullText) {
          setMsgs(prev => prev.map(msg => msg.id === msgId ? { ...msg, content: "I processed your request. Check the dashboard for updates." } : msg));
        }
      }
    } catch {
      // Fallback: try /api/assistant
      try {
        const res2 = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: query }),
        });
        if (res2.ok) {
          const data = await res2.json();
          const reply = data.reply || data.response || "I couldn't process that. Try asking differently.";
          setMsgs(prev => [...prev, { id: `m-${++counter}`, role: "assistant", content: reply, timestamp: new Date() }]);

          if (data.actions?.length > 0) {
            const nav = data.actions[0];
            if (nav.type === "navigate") {
              setTimeout(() => { window.location.href = nav.target; }, 1000);
            }
          }
        } else {
          setMsgs(prev => [...prev, { id: `m-${++counter}`, role: "assistant", content: "I'm having trouble connecting. Try asking 'take me to [tool name]' for navigation, or visit /dashboard/agent-chat for the full agent experience.", timestamp: new Date() }]);
        }
      } catch {
        setMsgs(prev => [...prev, { id: `m-${++counter}`, role: "assistant", content: "Connection issue. Please try again.", timestamp: new Date() }]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, files, loading, msgs, handleNav]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const widgetSize = expanded ? "w-[600px] h-[80vh]" : "w-[400px] h-[500px]";

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" className="hidden" multiple accept=".csv,.pdf,.jpg,.png,.txt,.doc,.docx"
        onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />

      {/* Floating trigger */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <Activity className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-[9990] ${widgetSize} bg-[#0f1721] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3DA9D1] to-[#1D3443] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Health OS Agent</div>
                  <div className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online • 10 tools
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => router.push("/dashboard/agent-chat")} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Full agent chat">
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {msgs.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-[#3DA9D1] mx-auto mb-3" />
                  <p className="text-sm text-white font-bold mb-1">
                    {userName ? `Hey ${userName}!` : "Health OS Agent"}
                  </p>
                  <p className="text-xs text-slate-500 mb-4">Navigate, search, validate, generate — just ask.</p>
                  <div className="space-y-2">
                    {["Take me to claims", "What ICD-10 for diabetes?", "Show executive dashboard", "Help me onboard"].map((s, i) => (
                      <button key={i} onClick={() => { setInput(s); }}
                        className="block w-full text-left px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-xs text-slate-400 hover:text-white transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "gap-2"}`}>
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-md bg-[#3DA9D1]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-3 h-3 text-[#3DA9D1]" />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#3DA9D1] text-white rounded-tr-sm"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-sm"
                  }`}>
                    {m.files && m.files.length > 0 && (
                      <div className="flex gap-1 mb-1">
                        {m.files.map((f, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-white/70 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" /> {f}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#3DA9D1]/20 flex items-center justify-center shrink-0">
                    <Activity className="w-3 h-3 text-[#3DA9D1] animate-pulse" />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-[#3DA9D1] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* File chips */}
            {files.length > 0 && (
              <div className="px-4 pb-1 flex gap-1 flex-wrap">
                {files.map((f, i) => (
                  <span key={i} className="text-[9px] px-2 py-1 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-lg text-[#3DA9D1] flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5" /> {f.name}
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10 shrink-0">
              <div className="flex items-end gap-2">
                <button onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 resize-none focus:outline-none focus:border-[#3DA9D1]/50"
                  />
                </div>
                <button onClick={send} disabled={(!input.trim() && files.length === 0) || loading}
                  className="p-2 rounded-lg bg-[#3DA9D1] hover:bg-[#3DA9D1]/80 disabled:opacity-30 text-white transition-all shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
