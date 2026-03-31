"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Send, Users, BarChart3 } from "lucide-react";

interface Campaign {
  id: string; name: string; type: string; channel: string; status: string;
  sentCount: number; deliveredCount: number; respondedCount: number; bookedCount: number;
  recipientCount?: number; createdAt: string;
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/engagement/campaigns").then((r) => r.json()).then((d) => setCampaigns(d.campaigns || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusStyle: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600", scheduled: "bg-blue-50 text-blue-600",
    sending: "bg-amber-50 text-amber-600", completed: "bg-green-50 text-green-700", paused: "bg-red-50 text-red-600",
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Health Campaigns</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Target patients for vaccinations, screenings, chronic care, recalls</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </button>
      </div>

      {showCreate && <CreateCampaignForm onCreated={(c) => { setCampaigns([c, ...campaigns]); setShowCreate(false); }} />}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="bg-white/60 border border-gray-100 rounded-xl p-5 animate-pulse h-28" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white/90 border border-gray-200/80 rounded-xl p-12 text-center">
          <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">No campaigns yet. Create one to start engaging patients.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c, i) => (
            <motion.div key={c.id} {...fade(i)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-gray-500 capitalize">{c.type}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[11px] text-gray-500 capitalize">{c.channel}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusStyle[c.status] || "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                  </div>
                </div>
                {c.status === "draft" && (
                  <button onClick={() => sendCampaign(c.id)} className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors">
                    <Send className="w-3 h-3" /> Send
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Sent", value: c.sentCount },
                  { label: "Delivered", value: c.deliveredCount },
                  { label: "Responded", value: c.respondedCount },
                  { label: "Booked", value: c.bookedCount },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-[16px] font-bold text-gray-900 font-metric">{m.value.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>
              {c.sentCount > 0 && (
                <div className="mt-3 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${Math.min((c.respondedCount / c.sentCount) * 100, 100)}%` }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  async function sendCampaign(id: string) {
    await fetch(`/api/engagement/campaigns/${id}/send`, { method: "POST" });
    setCampaigns(campaigns.map((c) => c.id === id ? { ...c, status: "sending" } : c));
  }
}

function CreateCampaignForm({ onCreated }: { onCreated: (c: Campaign) => void }) {
  const [form, setForm] = useState({ name: "", type: "health", channel: "whatsapp", messageTemplate: "", ageMin: "", ageMax: "", gender: "", medicalAid: "" });
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    setCreating(true);
    const res = await fetch("/api/engagement/campaigns", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, type: form.type, channel: form.channel, messageTemplate: form.messageTemplate, targetCriteria: { ...(form.ageMin ? { ageMin: parseInt(form.ageMin) } : {}), ...(form.ageMax ? { ageMax: parseInt(form.ageMax) } : {}), ...(form.gender ? { gender: form.gender } : {}), ...(form.medicalAid ? { medicalAid: form.medicalAid } : {}) } }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.campaign) onCreated({ ...data.campaign, recipientCount: data.recipientCount });
  };

  const inputClass = "bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none transition-colors";

  return (
    <motion.div {...fade(0)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5 space-y-4">
      <h2 className="text-[14px] font-semibold text-gray-900">Create Campaign</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
          <option value="health">Health</option><option value="recall">Recall</option><option value="preventive">Preventive</option>
          <option value="chronic">Chronic</option><option value="screening">Screening</option><option value="custom">Custom</option>
        </select>
        <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={inputClass}>
          <option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option><option value="multi">Multi-Channel</option>
        </select>
        <input placeholder="Medical Aid filter" value={form.medicalAid} onChange={(e) => setForm({ ...form, medicalAid: e.target.value })} className={inputClass} />
        <input type="number" placeholder="Min age" value={form.ageMin} onChange={(e) => setForm({ ...form, ageMin: e.target.value })} className={inputClass} />
        <input type="number" placeholder="Max age" value={form.ageMax} onChange={(e) => setForm({ ...form, ageMax: e.target.value })} className={inputClass} />
      </div>
      <textarea placeholder="Message template — use {{patientName}}, {{practiceName}}" value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} rows={3} className={`w-full ${inputClass}`} />
      <div className="flex justify-end">
        <button disabled={creating || !form.name || !form.messageTemplate} onClick={submit} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg text-[13px] font-medium transition-colors">
          {creating ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </motion.div>
  );
}
