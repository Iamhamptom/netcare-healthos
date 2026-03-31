"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const webkitSpeechRecognition: any;

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, 
  Paperclip, FileUp, X, CheckCircle2, Copy, FileText,
  User, Server, RefreshCcw
} from "lucide-react";

interface Message { 
  id: string; 
  role: "user" | "assistant"; 
  content: string; 
  toolsUsed?: string[]; 
  timestamp: Date;
  attachments?: string[];
}

const SUGGESTIONS = [
  "Summarize the latest CareOn Bridge capabilities.",
  "What is our current recoverable revenue pipeline?",
  "Validate the claims batch for Medicross Sandton.",
  "Check the availability of Dr. Gathiram for this Friday."
];

export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(false);
  const [mic, setMic] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, size: string}[]>([]);
  
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
        content: d.reply || d.response || d.error || "I could not formulate a response based on the constraints.",
        toolsUsed: d.toolsUsed,
        timestamp: new Date()
      }]);

      // Handle UI actions — navigate to tools/pages the agent pulls up
      if (d.actions && Array.isArray(d.actions) && d.actions.length > 0) {
        for (const action of d.actions) {
          if (action.type === "navigate" && action.target) {
            // Small delay so user sees the response first
            setTimeout(() => {
              window.location.href = action.target;
            }, 1500);
            break; // Only navigate to first action
          }
        }
      }
      
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
        content: "Error communicating with the assistant service.", 
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex-none px-6 py-3 flex items-center justify-between border-b border-slate-200 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-lg text-slate-900 border border-slate-200 rounded-md">
            H
          </div>
          <div>
            <h1 className="text-[14px] font-semibold text-slate-900">HealthOS Assistant</h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              Claude + Gemini AI • Dual-Provider
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <button 
            onClick={() => setVoice(!voice)} 
            className={`flex items-center gap-1.5 px-3 py-1.5 justify-center rounded-md border transition-colors ${
              voice ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {voice ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
            {voice ? "Voice" : "Muted"}
          </button>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth bg-[#F9FAFB]">
        {msgs.length === 0 ? (
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              How can I help you?
            </h2>
            <p className="text-slate-500 text-sm mb-10 text-center">
              A clean, focused environment for enterprise healthcare intelligence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => send(s)} 
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition text-left h-full flex flex-col justify-center"
                >
                  <span className="text-sm font-medium text-slate-700 leading-snug">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-32">
            {msgs.map((m, i) => (
              <div 
                key={m.id} 
                className={`flex w-full gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Assistant Icon */}
                {m.role === "assistant" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  
                  {/* Attachments rendering */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1 justify-end">
                      {m.attachments.map((att, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-medium text-slate-800">{att}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bubble body */}
                  <div className={`px-5 py-3.5 text-[15px] leading-relaxed break-words shadow-sm ${
                    m.role === "user" 
                      ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm" 
                      : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm ring-1 ring-slate-900/5"
                  }`}>
                    {m.content}
                  </div>

                  {/* Tool execution pills */}
                  {m.role === "assistant" && m.toolsUsed && m.toolsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {m.toolsUsed.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600">
                          <Server className="w-3 h-3 text-emerald-600" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions for Assistant messages */}
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <button className="text-slate-400 hover:text-slate-700 transition" title="Copy Message">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* User Icon */}
                {m.role === "user" && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex w-full justify-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm ring-1 ring-slate-900/5 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-[13px] font-medium text-slate-500">Processing request...</span>
                </div>
              </div>
            )}
            <div ref={endRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto flex flex-col gap-2 relative">
          
          {/* Active Connectors Indicator (Clean) */}
          <div className="absolute -top-10 left-0 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Connected to 25 Endpoints
            </span>
          </div>

          {/* Attachments preview list */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1">
              {attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 group">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-slate-700 max-w-[150px] truncate">{att.name}</span>
                  </div>
                  <button onClick={() => removeAttachment(idx)} className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 p-1.5 border border-slate-300 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-slate-900/20 focus-within:border-slate-500 transition-all">
            
            <div className="shrink-0">
              <input type="file" id="fileup" multiple className="hidden" onChange={handleFileUpload} />
              <button 
                onClick={() => document.getElementById("fileup")?.click()} 
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
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
              className="flex-1 max-h-40 min-h-[44px] py-2.5 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 focus:outline-none resize-none no-scrollbar leading-relaxed"
              rows={1}
            />
            
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={startMic} 
                className={`p-2.5 rounded-xl transition ${
                  mic ? "bg-red-50 text-red-600 animate-pulse" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
                title="Voice input"
              >
                {mic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => send(input)} 
                disabled={(!input.trim() && attachments.length === 0) || loading} 
                className="p-2.5 rounded-xl bg-slate-900 flex items-center justify-center min-w-[44px] text-white shadow hover:bg-slate-800 disabled:opacity-50 disabled:bg-slate-300 transition-all"
                title="Send message"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-px" />}
              </button>
            </div>
          </div>
          
          <div className="text-center mt-1 text-[11px] text-slate-400 font-medium">
            Responses may be inaccurate. Validate clinical and financial figures via core modules.
          </div>
        </div>
      </div>
    </div>
  );
}
