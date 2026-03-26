"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const webkitSpeechRecognition: any;
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Search, Users, Calendar, FileText, Shield, Mail, ClipboardList, TrendingDown, Brain, Sparkles, ChevronRight, Plus, MessageSquare, Activity } from "lucide-react";
interface Message { id: string; role: "user"|"assistant"; content: string; toolsUsed?: string[]; provider?: string; timestamp: Date; }
const QA = [
  { icon: Users, label: "Find patient", prompt: "Search for patient", c: "text-blue-400" },
  { icon: Calendar, label: "Today's schedule", prompt: "Show me today's schedule", c: "text-emerald-400" },
  { icon: ClipboardList, label: "Check-in queue", prompt: "Show the check-in queue", c: "text-amber-400" },
  { icon: TrendingDown, label: "Outstanding invoices", prompt: "List outstanding invoices", c: "text-red-400" },
  { icon: FileText, label: "Daily tasks", prompt: "What are today's daily tasks?", c: "text-purple-400" },
  { icon: Shield, label: "Validate claim", prompt: "Help me validate a claim", c: "text-cyan-400" },
  { icon: Search, label: "Look up ICD-10", prompt: "Look up ICD-10 code", c: "text-pink-400" },
  { icon: Activity, label: "Analytics", prompt: "Show practice analytics for this month", c: "text-orange-400" },
  { icon: Mail, label: "Send reminder", prompt: "Send a patient reminder", c: "text-indigo-400" },
  { icon: MessageSquare, label: "WhatsApp patient", prompt: "Send a WhatsApp message", c: "text-green-400" },
  { icon: Brain, label: "Explain rejection", prompt: "Explain why a claim was rejected", c: "text-violet-400" },
  { icon: Sparkles, label: "Ask anything", prompt: "", c: "text-zinc-400" },
];
export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState(false);
  const [mic, setMic] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const um: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMsgs(p => [...p, um]); setInput(""); setLoading(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...msgs, um].map(m => ({ role: m.role, content: m.content })) }) });
      const d = await r.json();
      setMsgs(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: d.reply||d.response||d.error||"No response", toolsUsed: d.toolsUsed||[], provider: d.provider, timestamp: new Date() }]);
      if (voice && d.reply) { try { const a = await fetch("/api/voice/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: d.reply.slice(0,500) }) }); if (a.ok) { new Audio(URL.createObjectURL(await a.blob())).play(); } } catch {} }
    } catch { setMsgs(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: "Connection error.", timestamp: new Date() }]); }
    finally { setLoading(false); }
  }, [msgs, loading, voice]);
  const startMic = useCallback(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const SR = (window as Record<string,unknown>).webkitSpeechRecognition;
    const rec = new (SR as any)(); rec.lang="en-ZA";
    rec.onresult = (e: any) => { const t=e.results[0][0].transcript; setInput(t); send(t); };
    rec.onend = () => setMic(false); rec.start(); setMic(true);
  }, [send]);
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-950">
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-[15px] font-semibold text-white">HealthOS Assistant</h1><p className="text-[11px] text-zinc-500">25 tools | RAG | Voice | Full access</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setVoice(!voice)} className={`p-2 rounded-lg transition ${voice?"bg-emerald-500/10 text-emerald-400":"bg-zinc-800 text-zinc-500"}`}>{voice?<Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}</button>
          <button onClick={()=>setMsgs([])} className="p-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-white transition"><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {msgs.length===0?(
          <div className="max-w-2xl mx-auto pt-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4"><Sparkles className="w-8 h-8 text-white"/></div>
              <h2 className="text-xl font-semibold text-white mb-2">What can I help with?</h2>
              <p className="text-zinc-500 text-sm">Search patients, manage bookings, validate claims, look up codes, send WhatsApp, check invoices, and more.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">{QA.map((a,i)=>(<button key={i} onClick={()=>a.prompt&&send(a.prompt)} className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition text-left group"><a.icon className={`w-4 h-4 ${a.c} shrink-0`}/><span className="text-[12px] text-zinc-300 group-hover:text-white transition">{a.label}</span><ChevronRight className="w-3 h-3 text-zinc-700 ml-auto"/></button>))}</div>
          </div>
        ):(
          <div className="max-w-2xl mx-auto space-y-4">
            <AnimatePresence>{msgs.map(m=>(
              <motion.div key={m.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role==="user"?"bg-violet-600 text-white":"bg-zinc-900 border border-zinc-800 text-zinc-200"}`}>
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</div>
                  {m.toolsUsed&&m.toolsUsed.length>0&&(<div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-zinc-700/50">{m.toolsUsed.map((t,i)=>(<span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{t}</span>))}</div>)}
                </div>
              </motion.div>
            ))}</AnimatePresence>
            {loading&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-zinc-500 text-sm"><Loader2 className="w-4 h-4 animate-spin"/>Thinking...</motion.div>}
            <div ref={endRef}/>
          </div>
        )}
      </div>
      <div className="border-t border-zinc-800 px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button onClick={startMic} className={`p-2.5 rounded-xl transition shrink-0 ${mic?"bg-red-500/10 text-red-400 animate-pulse":"bg-zinc-800 text-zinc-500 hover:text-white"}`}>{mic?<MicOff className="w-4 h-4"/>:<Mic className="w-4 h-4"/>}</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Ask anything..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition"/>
          <button onClick={()=>send(input)} disabled={!input.trim()||loading} className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition shrink-0"><Send className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}
