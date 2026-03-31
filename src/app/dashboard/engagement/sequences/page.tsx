"use client";

import { useState, useEffect } from "react";
import { Activity, Plus, Play, Pause, Users, Zap } from "lucide-react";

interface Sequence {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  active: boolean;
  stepsCount: number;
  enrollmentsCount: number;
}

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/engagement/sequences")
      .then((r) => r.json())
      .then((d) => setSequences(d.sequences || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const triggerLabels: Record<string, { label: string; color: string }> = {
    booking_completed: { label: "Post-Visit", color: "text-emerald-400" },
    recall_due: { label: "Recall Due", color: "text-amber-400" },
    condition_match: { label: "Condition Match", color: "text-blue-400" },
    manual: { label: "Manual", color: "text-zinc-400" },
    campaign: { label: "Campaign", color: "text-purple-400" },
  };

  return (
    <div className="p-6 min-h-screen bg-[#0f1721] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" /> Engagement Sequences
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Automated patient journeys — follow-ups, chronic care, medication adherence</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Sequence
        </button>
      </div>

      {showCreate && <CreateSequenceForm onCreated={(s) => { setSequences([s, ...sequences]); setShowCreate(false); }} />}

      {loading ? (
        <div className="min-h-screen bg-[#0f1721] space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse h-28" />)}</div>
      ) : sequences.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No sequences yet. Create one to automate patient engagement.</p>
          <div className="mt-4 text-xs text-zinc-500 space-y-1">
            <p>Examples: Post-Surgery Recovery, Diabetes Care Pathway, Medication Adherence, New Patient Welcome</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sequences.map((s) => {
            const trigger = triggerLabels[s.triggerType] || { label: s.triggerType, color: "text-zinc-400" };
            return (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{s.name}</h3>
                    {s.description && <p className="text-xs text-zinc-500 mt-1">{s.description}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-500/10 text-zinc-500"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className={`flex items-center gap-1 ${trigger.color}`}>
                    <Zap className="w-3 h-3" /> {trigger.label}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {s.stepsCount} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {s.enrollmentsCount} enrolled
                  </span>
                </div>
              </div>
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

  const addStep = () => setSteps([...steps, { channel: "whatsapp", delayMinutes: 1440, messageTemplate: "", actionType: "message" }]);

  const submit = async () => {
    setCreating(true);
    const res = await fetch("/api/engagement/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, steps }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.sequence) onCreated({ ...data.sequence, stepsCount: steps.length, enrollmentsCount: 0 });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Create Sequence</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input placeholder="Sequence name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
        <select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="manual">Manual Enrollment</option>
          <option value="booking_completed">After Booking Completed</option>
          <option value="recall_due">When Recall Due</option>
          <option value="condition_match">Condition Match (ICD-10)</option>
        </select>
      </div>

      <div className="min-h-screen bg-[#0f1721] space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Steps</h3>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3">
            <span className="text-xs text-zinc-500 w-6">#{i + 1}</span>
            <input type="number" placeholder="Delay (min)" value={step.delayMinutes} onChange={(e) => { const s = [...steps]; s[i].delayMinutes = parseInt(e.target.value) || 0; setSteps(s); }} className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white" />
            <select value={step.channel} onChange={(e) => { const s = [...steps]; s[i].channel = e.target.value; setSteps(s); }} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white">
              <option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option>
            </select>
            <input placeholder="Message template..." value={step.messageTemplate} onChange={(e) => { const s = [...steps]; s[i].messageTemplate = e.target.value; setSteps(s); }} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder-zinc-500" />
          </div>
        ))}
        <button onClick={addStep} className="text-xs text-blue-400 hover:text-blue-300">+ Add Step</button>
      </div>

      <div className="flex justify-end">
        <button disabled={creating || !form.name || steps.every((s) => !s.messageTemplate)} onClick={submit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
          {creating ? "Creating..." : "Create Sequence"}
        </button>
      </div>
    </div>
  );
}
