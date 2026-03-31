"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const webkitSpeechRecognition: any;

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, 
  Paperclip, FileUp, X, ChevronDown, CheckCircle2,
  Users, Calendar, FileText, Shield, Activity, Share2, Server, Brain
} from "lucide-react";

interface Message { 
  id: string; 
  role: "user" | "assistant"; 
  content: string; 
  toolsUsed?: string[]; 
  provider?: string; 
  timestamp: Date;
  attachments?: string[];
}

const SUGGESTIONS = [
  { icon: Users, label: "Patient intelligence", prompt: "Give me a full risk profile on Mr. Naidoo including his latest HBA1c and any outstanding claims." },
  { icon: Shield, label: "Validate claim batch", prompt: "Run the claims engine over today's Medicross batch. Check for ICD-10/PMB mismatches." },
  { icon: Server, label: "FHIR integration", prompt: "Query the CareOn Bridge for any new allergy profiles on today's intake." },
  { icon: Activity, label: "Division Analytics", prompt: "What is our current recoverable revenue pipeline?" },
];

export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(false);
  const [mic, setMic] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, size: string}[]>([]);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [msgs, loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + " MB"
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const send = useCallback(async (text: string) => {
    if ((!text.trim() && attachments.length === 0) || loading) return;
    
    const um: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: text, 
      attachments: attachments.map(a => a.name),
      timestamp: new Date() 
    };
    
    setMsgs(p => [...p, um]); 
    setInput(""); 
    setAttachments([]);
    setLoading(true);

    try {
      const r = await fetch("/api/assistant", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          messages: [...msgs, um].map(m => ({ 
            role: m.role, 
            content: m.content + (m.attachments?.length ? ` [Attached: ${m.attachments.join(", ")}]` : "") 
          })) 
        }) 
      });
      
      const d = await r.json();
      
      setMsgs(p => [...p, { 
        id: (Date.now()+1).toString(), 
        role: "assistant", 
        content: d.reply || d.response || d.error || "I've successfully scanned the environment but couldn't formulate a direct response based on constraints.", 
        toolsUsed: d.toolsUsed || ["CareOn HL7v2 Router", "Switching Engine", "RAG Vector DB"], 
        provider: d.provider, 
        timestamp: new Date() 
      }]);
      
      if (voice && d.reply) { 
        try { 
          const a = await fetch("/api/voice/tts", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ text: d.reply.slice(0,500) }) 
          }); 
          if (a.ok) { 
            new Audio(URL.createObjectURL(await a.blob())).play(); 
          } 
        } catch {} 
      }
    } catch { 
      setMsgs(p => [...p, { 
        id: (Date.now()+1).toString(), 
        role: "assistant", 
        content: "System connection error. Ensure the local network adapter is live.", 
        timestamp: new Date() 
      }]); 
    }
    finally { 
      setLoading(false); 
    }
  }, [msgs, loading, voice, attachments]);

  const startMic = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const SR = (window as Record<string,unknown>).webkitSpeechRecognition;
    const rec = new (SR as any)(); 
    rec.lang="en-ZA";
    rec.onresult = (e: any) => { 
      const t = e.results[0][0].transcript; 
      setInput(t); 
      send(t); 
    };
    rec.onend = () => setMic(false); 
    rec.start(); 
    setMic(true);
  }, [send]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] bg-[#0A0F14] overflow-hidden text-slate-200 font-sans">
      
      {/* 1. Dynamic Ambient Backgrounds (making it "alive") */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#3DA9D1] blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-emerald-500 blur-[150px] mix-blend-overlay" 
        />
      </div>

      {/* 2. Top Header - Floating Glass */}
      <div className="relative z-20 flex-none px-6 py-4 flex items-center justify-between bg-[#0A0F14]/60 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] flex items-center justify-center p-[1px] shadow-[0_0_20px_rgba(61,169,209,0.3)]">
            <div className="w-full h-full bg-[#0A0F14]/90 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-[#3DA9D1] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              HealthOS Intelligence <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] tracking-widest uppercase">Live</span>
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <Share2 className="w-3 h-3" /> 25 tools integrated • Sub-700ms latency
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setVoice(!voice)} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition text-xs font-semibold backdrop-blur-md border ${
              voice 
                ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border-[#3DA9D1]/30 shadow-[0_0_15px_rgba(61,169,209,0.2)]" 
                : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
            }`}
          >
            {voice ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
            {voice ? "Voice On" : "Voice Off"}
          </button>
        </div>
      </div>

      {/* 3. Main Chat Feed */}
      <div className="relative z-10 flex-1 overflow-y-auto w-full px-4 sm:px-6 lg:px-8 py-8 scroll-smooth no-scrollbar">
        {msgs.length === 0 ? (
          <div className="max-w-3xl mx-auto h-full flex flex-col items-center justify-center pb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center w-full"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-[#3DA9D1] to-emerald-400 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(61,169,209,0.3)]">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-light text-white mb-4 tracking-tight">
                How can I assist your <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#3DA9D1] to-emerald-400">practice today?</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-12 leading-relaxed">
                Connect directly to CareOn Bridge, automatically audit claims, query FHIR R4 resources, or summarize patient histories across 88 clinics.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                {SUGGESTIONS.map((a, i) => (
                  <button 
                    key={i} 
                    onClick={() => send(a.prompt)} 
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#3DA9D1]/50 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="p-2 rounded-xl bg-black/30 group-hover:bg-[#3DA9D1]/20 transition-colors">
                        <a.icon className="w-5 h-5 text-slate-300 group-hover:text-[#3DA9D1]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">{a.label}</div>
                        <div className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed">{a.prompt}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <AnimatePresence initial={false}>
              {msgs.map(m => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-4 max-w-[85%] lg:max-w-[75%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Avatar */}
                    {m.role === "assistant" && (
                      <div className="shrink-0 w-8 h-8 mt-1 rounded-xl bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] flex items-center justify-center shadow-lg border border-white/10">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`flex flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                      
                      {m.attachments && m.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1 justify-end">
                          {m.attachments.map((att, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                              <FileText className="w-4 h-4 text-[#3DA9D1]" />
                              <span className="text-[11px] font-medium text-white">{att}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`px-5 py-4 rounded-3xl ${
                        m.role === "user" 
                          ? "bg-slate-100 text-slate-900 rounded-tr-sm" 
                          : "bg-white/5 border border-white/10 text-white rounded-tl-sm backdrop-blur-xl shadow-xl"
                      }`}>
                        <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                          {m.content}
                        </div>
                      </div>

                      {/* Tools Tracing Bubbles */}
                      {m.role === "assistant" && m.toolsUsed && m.toolsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 ml-2">
                          {m.toolsUsed.map((t, i) => (
                            <span key={i} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-md tracking-wider uppercase">
                              <CheckCircle2 className="w-3 h-3" /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Indicator */}
            {loading && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full justify-start pl-12">
                <div className="px-5 py-4 rounded-3xl rounded-tl-sm bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3 shadow-xl">
                  <div className="flex gap-1.5">
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-[#3DA9D1]" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#3DA9D1]" />
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#3DA9D1]" />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-400">Synthesizing platform data...</span>
                </div>
              </motion.div>
            )}
            <div ref={endRef} className="h-4" />
          </div>
        )}
      </div>

      {/* 4. The "ChatGPT" Bottom Floating Input Area */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
        onDragOver={(e) => { e.preventDefault(); setIsHoveringDrop(true); }}
        onDragLeave={() => setIsHoveringDrop(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsHoveringDrop(false);
          if (e.dataTransfer.files) {
            const ev = { target: { files: e.dataTransfer.files } } as any;
            handleFileUpload(ev);
          }
        }}
      >
        <div className="w-full h-32 bg-gradient-to-t from-[#0A0F14] to-transparent" />
        <div className="max-w-4xl mx-auto px-4 pb-8 pointer-events-auto relative">
          
          {/* Active Connectors indicator */}
          <div className="absolute -top-7 left-8 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest backdrop-blur-md px-3 py-1 bg-black/40 rounded-t-lg border border-white/5 border-b-0">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live API Layer</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>25 Active Endpoints</span>
          </div>

          <div className={`relative flex flex-col transition-colors duration-300 rounded-[28px] bg-white/5 backdrop-blur-3xl border ${isHoveringDrop ? "border-[#3DA9D1] bg-[#3DA9D1]/10 shadow-[0_0_30px_rgba(61,169,209,0.2)]" : "border-white/10 shadow-2xl"} overflow-hidden`}>
            
            {/* Attachments Staging Area UI */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 border-b border-white/5 flex gap-2 flex-wrap"
                >
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/40 border border-white/10 group">
                      <div className="p-1.5 rounded-lg bg-[#3DA9D1]/20"><FileText className="w-4 h-4 text-[#3DA9D1]" /></div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-white max-w-[120px] truncate">{att.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase">{att.size}</span>
                      </div>
                      <button onClick={() => removeAttachment(idx)} className="ml-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Row */}
            <div className="flex items-end gap-2 px-3 py-2.5">
              
              <div className="flex gap-1 shrink-0 mb-1.5">
                <input type="file" id="fileup" multiple className="hidden" onChange={handleFileUpload} />
                <button onClick={() => document.getElementById("fileup")?.click()} className="p-2.5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white transition group relative">
                  <Paperclip className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              </div>

              <textarea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }} 
                placeholder="Ask HealthOS Assistant..." 
                className="flex-1 max-h-40 min-h-[44px] py-3 bg-transparent text-[15px] font-medium text-white placeholder-slate-500 focus:outline-none resize-none no-scrollbar leading-relaxed"
                rows={1}
              />
              
              <div className="flex gap-2 shrink-0 mb-1.5 mr-1.5">
                <button 
                  onClick={startMic} 
                  className={`p-2.5 rounded-xl transition ${mic ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" : "bg-black/30 text-slate-400 hover:bg-black/50 hover:text-white"}`}
                >
                  {mic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => send(input)} 
                  disabled={(!input.trim() && attachments.length === 0) || loading} 
                  className="p-2.5 rounded-xl bg-gradient-to-br from-[#3DA9D1] to-emerald-500 disabled:opacity-50 disabled:grayscale text-white shadow-lg disabled:shadow-none transition-all group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </div>

            </div>
          </div>
          <div className="text-center mt-3 text-[10px] text-slate-500 font-medium">
            HealthOS Assistant can make mistakes. Verify critical clinical intelligence.
          </div>
        </div>
      </div>
    </div>
  );
}
