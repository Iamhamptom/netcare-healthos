"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Users, Zap, Workflow } from "lucide-react";

interface Sequence { id: string; name: string; description: string; triggerType: string; active: boolean; stepsCount: number; enrollmentsCount: number; }

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/engagement/sequences").then((r) => r.json()).then((d) => setSequences(d.sequences || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const triggerStyle: Record<string, { label: string; color: string }> = {
    booking_completed: { label: "Post-Visit", color: "#10B981" },
    recall_due: { label: "Recall Due", color: "#F59E0B" },
    condition_match: { label: "Condition", color: "#3DA9D1" },
    manual: { label: "Manual", color: "#6B7280" },
    campaign: { label: "Campaign", color: "#8B5CF6" },
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Engagement Sequences</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Automated patient journeys — follow-ups, chronic care, medication adherence</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Sequence
        </button>
      </div>

      {showCreate && <CreateSequenceForm onCreated={(s) => { setSequences([s, ...sequences]); setShowCreate(false); }} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="bg-white/60 border border-gray-100 rounded-xl p-5 animate-pulse h-24" />)}</div>
      ) : sequences.length === 0 ? (
        <div className="bg-white/90 border border-gray-200/80 rounded-xl p-12 text-center">
          <Workflow className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">No sequences yet. Create one to automate patient engagement.</p>
          <p className="text-[11px] text-gray-400 mt-2">Examples: Post-Surgery Recovery, Diabetes Care, Medication Adherence</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sequences.map((s, i) => {
            const trigger = triggerStyle[s.triggerType] || { label: s.triggerType, color: "#6B7280" };
            return (
              <motion.div key={s.id} {...fade(i)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-4 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[13px] font-semibold text-gray-900">{s.name}</h3>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {s.description && <p className="text-[11px] text-gray-500 mb-2.5">{s.description}</p>}
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trigger.color }} />
                    {trigger.label}
                  </span>
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {s.stepsCount} steps</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrollmentsCount} enrolled</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateSequenceForm({ onCreated }: { onCreated: (s: Sequence) => void }) {
  const [form, setForm] = useState({ name: "", description: "", triggerType: "manual" });
  const [steps, setSteps] = useState([{ channel: "whatsapp", delayMinutes: 0, messageTemplate: "", actionType: "message" }]);
  const [creating, setCreating] = useState(false);
  const inputClass = "bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors";

  const submit = async () => {
    setCreating(true);
    const res = await fetch("/api/engagement/sequences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, steps }) });
    const data = await res.json();
    setCreating(false);
    if (data.sequence) onCreated({ ...data.sequence, stepsCount: steps.length, enrollmentsCount: 0 });
  };

  return (
    <motion.div {...fade(0)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5 space-y-4">
      <h2 className="text-[14px] font-semibold text-gray-900">Create Sequence</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input placeholder="Sequence name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
        <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })} className={inputClass}>
          <option value="manual">Manual</option><option value="booking_completed">Post-Visit</option><option value="recall_due">Recall Due</option><option value="condition_match">Condition Match</option>
        </select>
      </div>
      <div className="space-y-2">
        <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Steps</h3>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
            <span className="text-[11px] text-gray-400 w-5 font-mono">#{i + 1}</span>
            <input type="number" placeholder="Delay (min)" value={step.delayMinutes} onChange={(e) => { const s = [...steps]; s[i].delayMinutes = parseInt(e.target.value) || 0; setSteps(s); }} className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-900" />
            <select value={step.channel} onChange={(e) => { const s = [...steps]; s[i].channel = e.target.value; setSteps(s); }} className="bg-white border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-900">
              <option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option>
            </select>
            <input placeholder="Message template..." value={step.messageTemplate} onChange={(e) => { const s = [...steps]; s[i].messageTemplate = e.target.value; setSteps(s); }} className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-900 placeholder-gray-400" />
          </div>
        ))}
        <button onClick={() => setSteps([...steps, { channel: "whatsapp", delayMinutes: 1440, messageTemplate: "", actionType: "message" }])} className="text-[11px] text-gray-500 hover:text-gray-700">+ Add Step</button>
      </div>
      <div className="flex justify-end">
        <button disabled={creating || !form.name} onClick={submit} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg text-[13px] font-medium transition-colors">
          {creating ? "Creating..." : "Create Sequence"}
        </button>
      </div>
    </motion.div>
  );
}
