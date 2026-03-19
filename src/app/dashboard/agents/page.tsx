"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, AlertTriangle, Heart, ClipboardList, Loader2,
  Send, Volume2,
} from "lucide-react";

interface AgentResult {
  agent: string;
  response: string;
  actions?: { type: string; data: Record<string, unknown> }[];
  urgency?: string;
  confidence?: number;
  escalate?: boolean;
  complete?: boolean;
  step?: number;
  totalSteps?: number;
}

const agents = [
  {
    id: "triage",
    name: "Triage Agent",
    icon: AlertTriangle,
    color: "#ef4444",
    description: "Assess patient message urgency — EMERGENCY, URGENT, SEMI-URGENT, or ROUTINE",
    placeholder: "Enter a patient message to triage... (e.g. 'I have severe chest pain')",
  },
  {
    id: "followup",
    name: "Follow-up Agent",
    icon: Heart,
    color: "#10b981",
    description: "Generate personalized post-appointment follow-up messages",
    placeholder: "",
  },
  {
    id: "intake",
    name: "Intake Agent",
    icon: ClipboardList,
    color: "#8B5CF6",
    description: "Pre-appointment intake — collects symptoms, medications, allergies",
    placeholder: "Start the intake by typing a patient response...",
  },
];

const urgencyColors: Record<string, string> = {
  EMERGENCY: "bg-red-500/20 text-red-400 border-red-500/30",
  URGENT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "SEMI-URGENT": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  ROUTINE: "bg-[#3DA9D1]/20 text-[#3DA9D1] border-[#3DA9D1]/30",
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState("triage");
  const [input, setInput] = useState("");
  const [patientName, setPatientName] = useState("Maria Santos");
  const [appointmentType, setAppointmentType] = useState("cleaning");
  const [daysSince, setDaysSince] = useState("1");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [intakeHistory, setIntakeHistory] = useState<{ role: string; content: string }[]>([]);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const agent = agents.find(a => a.id === selectedAgent)!;

  async function runAgent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let res: Response;

      if (selectedAgent === "triage") {
        res = await fetch("/api/agents/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, patientName }),
        });
      } else if (selectedAgent === "followup") {
        res = await fetch("/api/agents/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientName, appointmentType, daysSince: Number(daysSince) }),
        });
      } else {
        const newHistory = [...intakeHistory, { role: "user", content: input }];
        res = await fetch("/api/agents/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input, patientName, history: newHistory }),
        });
        setIntakeHistory(newHistory);
      }

      const data = await res.json();
      setResult(data);

      if (selectedAgent === "intake" && data.response) {
        setIntakeHistory(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch {
      setResult({ agent: selectedAgent, response: "Agent error — please try again.", actions: [] });
    }
    setLoading(false);
    setInput("");
  }

  async function playVoice() {
    if (!result?.response) return;
    setVoiceLoading(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.response }),
      });
      if (res.headers.get("content-type")?.includes("audio")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
      }
    } catch { /* voice not configured */ }
    setVoiceLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-5 h-5 text-[var(--gold)]" />
        <h2 className="text-lg font-semibold">AI Agents</h2>
        <span className="text-xs text-[var(--text-secondary)]">Healthcare intelligence at your fingertips</span>
      </div>

      {/* Agent selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map(a => (
          <button
            key={a.id}
            onClick={() => { setSelectedAgent(a.id); setResult(null); setIntakeHistory([]); }}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedAgent === a.id
                ? "glass-panel-strong border-[var(--gold)]/20"
                : "bg-[var(--charcoal)]/20 border border-[var(--border)] hover:border-[var(--gold)]/10"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${a.color}15` }}>
                <a.icon className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <span className="text-sm font-semibold">{a.name}</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{a.description}</p>
          </button>
        ))}
      </div>

      {/* Agent workspace */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        {/* Config */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Patient Name</label>
            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="input-glass text-sm" />
          </div>
          {selectedAgent === "followup" && (
            <>
              <div className="flex-1">
                <label className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Appointment Type</label>
                <input type="text" value={appointmentType} onChange={e => setAppointmentType(e.target.value)} className="input-glass text-sm" />
              </div>
              <div className="w-24">
                <label className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Days Since</label>
                <input type="number" value={daysSince} onChange={e => setDaysSince(e.target.value)} min="1" className="input-glass text-sm" />
              </div>
            </>
          )}
        </div>

        {/* Intake conversation history */}
        {selectedAgent === "intake" && intakeHistory.length > 0 && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {intakeHistory.map((msg, i) => (
              <div key={i} className={`text-xs p-2 rounded-lg ${msg.role === "user" ? "bg-[var(--gold)]/5 text-[var(--ivory)] ml-8" : "bg-[var(--charcoal)]/30 text-[var(--text-secondary)] mr-8"}`}>
                {msg.content}
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        {selectedAgent !== "followup" && (
          <form onSubmit={runAgent} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={agent.placeholder}
              required
              className="flex-1 input-glass text-sm"
            />
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Run
            </button>
          </form>
        )}

        {selectedAgent === "followup" && (
          <button onClick={runAgent as unknown as () => void} disabled={loading} className="px-4 py-2 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            Generate Follow-up
          </button>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Urgency badge */}
            {result.urgency && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${urgencyColors[result.urgency] || urgencyColors.ROUTINE}`}>
                <AlertTriangle className="w-3 h-3" />
                {result.urgency}
                {result.escalate && <span className="text-[10px] opacity-70">· ESCALATE TO HUMAN</span>}
              </div>
            )}

            {/* Response */}
            <div className="p-4 rounded-xl bg-[var(--charcoal)]/30 border border-[var(--border)]">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-[var(--ivory)] leading-relaxed">{result.response}</p>
                <button onClick={playVoice} disabled={voiceLoading} className="shrink-0 p-2 rounded-lg hover:bg-[var(--gold)]/10 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors" title="Play as voice (requires ElevenLabs)">
                  {voiceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            {result.actions && result.actions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {result.actions.map((action, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 rounded bg-[var(--gold)]/10 text-[var(--gold)] font-medium">
                    {action.type.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Intake progress */}
            {result.step && result.totalSteps && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--charcoal)]/30 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${(result.step / result.totalSteps) * 100}%` }} />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)]">{result.step}/{result.totalSteps}</span>
              </div>
            )}

            {/* Confidence */}
            {result.confidence && (
              <div className="text-[10px] text-[var(--text-tertiary)]">
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
