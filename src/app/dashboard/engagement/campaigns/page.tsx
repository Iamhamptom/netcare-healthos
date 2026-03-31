"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Send, Users, BarChart3 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: string;
  sentCount: number;
  deliveredCount: number;
  respondedCount: number;
  bookedCount: number;
  recipientCount?: number;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/engagement/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    draft: "bg-zinc-500/10 text-zinc-400",
    scheduled: "bg-blue-500/10 text-blue-400",
    sending: "bg-amber-500/10 text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    paused: "bg-red-500/10 text-red-400",
  };

  const typeLabels: Record<string, string> = {
    health: "Health", recall: "Recall", preventive: "Preventive",
    chronic: "Chronic", screening: "Screening", custom: "Custom",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" /> Health Campaigns
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Target patients for vaccinations, screenings, chronic care, and recalls</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {showCreate && <CreateCampaignForm onCreated={(c) => { setCampaigns([c, ...campaigns]); setShowCreate(false); }} />}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse h-32" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No campaigns yet. Create one to start engaging patients.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">{typeLabels[c.type] || c.type}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-500 capitalize">{c.channel}</span>
                    <span className="text-zinc-700">·</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status] || "bg-zinc-500/10 text-zinc-400"}`}>{c.status}</span>
                  </div>
                </div>
                {c.status === "draft" && (
                  <button onClick={() => sendCampaign(c.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                    <Send className="w-3 h-3" /> Send Now
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Metric label="Sent" value={c.sentCount} icon={<Send className="w-3.5 h-3.5" />} />
                <Metric label="Delivered" value={c.deliveredCount} icon={<Users className="w-3.5 h-3.5" />} />
                <Metric label="Responded" value={c.respondedCount} icon={<BarChart3 className="w-3.5 h-3.5" />} />
                <Metric label="Booked" value={c.bookedCount} icon={<Target className="w-3.5 h-3.5" />} />
              </div>
              {c.sentCount > 0 && (
                <div className="mt-3 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min((c.respondedCount / c.sentCount) * 100, 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  async function sendCampaign(id: string) {
    await fetch(`/api/engagement/campaigns/${id}/send`, { method: "POST" });
    const updated = campaigns.map((c) => c.id === id ? { ...c, status: "sending" } : c);
    setCampaigns(updated);
  }
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-zinc-500 mb-1">{icon}</div>
      <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function CreateCampaignForm({ onCreated }: { onCreated: (c: Campaign) => void }) {
  const [form, setForm] = useState({ name: "", type: "health", channel: "whatsapp", messageTemplate: "", ageMin: "", ageMax: "", gender: "", medicalAid: "" });
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    setCreating(true);
    const res = await fetch("/api/engagement/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        channel: form.channel,
        messageTemplate: form.messageTemplate,
        targetCriteria: {
          ...(form.ageMin ? { ageMin: parseInt(form.ageMin) } : {}),
          ...(form.ageMax ? { ageMax: parseInt(form.ageMax) } : {}),
          ...(form.gender ? { gender: form.gender } : {}),
          ...(form.medicalAid ? { medicalAid: form.medicalAid } : {}),
        },
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.campaign) onCreated({ ...data.campaign, recipientCount: data.recipientCount });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Create Campaign</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="health">Health</option><option value="recall">Recall</option><option value="preventive">Preventive</option>
          <option value="chronic">Chronic</option><option value="screening">Screening</option><option value="custom">Custom</option>
        </select>
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option><option value="multi">Multi-Channel</option>
        </select>
        <input placeholder="Medical Aid filter" value={form.medicalAid} onChange={(e) => setForm({ ...form, medicalAid: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
        <input type="number" placeholder="Min age" value={form.ageMin} onChange={(e) => setForm({ ...form, ageMin: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
        <input type="number" placeholder="Max age" value={form.ageMax} onChange={(e) => setForm({ ...form, ageMax: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
      </div>
      <textarea placeholder="Message template — use {{patientName}}, {{practiceName}} for personalization" value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500" />
      <div className="flex justify-end gap-2">
        <button disabled={creating || !form.name || !form.messageTemplate} onClick={submit} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
          {creating ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </div>
  );
}
