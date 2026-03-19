"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Megaphone, Send, Users, Eye, MessageSquare,
  CalendarCheck, TrendingUp, Plus, ChevronRight,
  Clock, Target,
} from "lucide-react";

const SEGMENT_COLORS: Record<string, string> = {
  A: "#ef4444", B: "#f97316", C: "#8B5CF6", D: "#0ea5e9",
  E: "#10b981", F: "#D4AF37", G: "#ec4899", H: "#14b8a6",
  I: "#a855f7", J: "#2DD4BF",
};

const SEGMENT_LABELS: Record<string, string> = {
  A: "Media", B: "Founders", C: "Hospitals", D: "Schemes",
  E: "Associations", F: "Investors", G: "Conferences", H: "CPD",
  I: "Consultants", J: "Champions",
};

interface Campaign {
  id: string;
  name: string;
  segment: string;
  description: string;
  status: string;
  targetCount: number;
  sentCount: number;
  openCount: number;
  responseCount: number;
  meetingCount: number;
  conversionCount: number;
  createdAt: string;
  _count: { targets: number; emails: number };
}

interface Stats {
  overview: {
    totalTargets: number;
    totalSent: number;
    totalOpened: number;
    openRate: number;
    totalResponded: number;
    responseRate: number;
    totalMeetings: number;
    totalConverted: number;
    conversionRate: number;
    followUpsDue: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeSegment, setActiveSegment] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", segment: "A", description: "" });

  useEffect(() => {
    fetch("/api/outreach/campaigns").then(r => r.json()).then(d => setCampaigns(d.campaigns || []));
    fetch("/api/outreach/stats").then(r => r.json()).then(d => setStats(d));
  }, []);

  const filtered = activeSegment === "all"
    ? campaigns
    : campaigns.filter(c => c.segment === activeSegment);

  async function handleCreate() {
    if (!form.name || !form.segment) return;
    setCreating(true);
    const res = await fetch("/api/outreach/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { campaign } = await res.json();
      setCampaigns(prev => [{ ...campaign, _count: { targets: 0, emails: 0 } }, ...prev]);
      setShowCreate(false);
      setForm({ name: "", segment: "A", description: "" });
    }
    setCreating(false);
  }

  const o = stats?.overview;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ivory)]">Campaign Command Center</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">VRL outreach across 10 segments — media, founders, hospitals, investors & more</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-[#1a1a2e] text-[13px] font-semibold hover:bg-[#D4AF37]/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI icon={Users} label="Total Targets" value={o?.totalTargets ?? 0} color="#8B5CF6" />
        <KPI icon={Send} label="Emails Sent" value={`${o?.totalSent ?? 0} (${o?.openRate ?? 0}% open)`} color="#10b981" />
        <KPI icon={MessageSquare} label="Responded" value={`${o?.totalResponded ?? 0} (${o?.responseRate ?? 0}%)`} color="#0ea5e9" />
        <KPI icon={CalendarCheck} label="Meetings" value={o?.totalMeetings ?? 0} color="#D4AF37" />
        <KPI icon={TrendingUp} label="Converted" value={`${o?.totalConverted ?? 0} (${o?.conversionRate ?? 0}%)`} color="#ef4444" />
      </div>

      {/* Follow-ups due alert */}
      {o && o.followUpsDue > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
          <Clock className="w-4 h-4 text-[#f97316]" />
          <span className="text-[13px] text-[#f97316] font-medium">{o.followUpsDue} follow-up{o.followUpsDue > 1 ? "s" : ""} due today</span>
        </motion.div>
      )}

      {/* Segment Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSegment("all")}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
            activeSegment === "all"
              ? "bg-[var(--ivory)] text-[var(--obsidian)]"
              : "bg-[var(--obsidian)] text-[var(--text-secondary)] hover:text-[var(--ivory)]"
          }`}
        >
          All ({campaigns.length})
        </button>
        {Object.entries(SEGMENT_LABELS).map(([seg, label]) => {
          const count = campaigns.filter(c => c.segment === seg).length;
          return (
            <button
              key={seg}
              onClick={() => setActiveSegment(seg)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
                activeSegment === seg
                  ? "text-white"
                  : "bg-[var(--obsidian)] text-[var(--text-secondary)] hover:text-[var(--ivory)]"
              }`}
              style={activeSegment === seg ? { backgroundColor: SEGMENT_COLORS[seg] } : {}}
            >
              {seg}: {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((campaign) => (
          <Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl glass-panel p-5 hover:border-[var(--gold)]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ backgroundColor: SEGMENT_COLORS[campaign.segment] || "#666" }}
                  >
                    {campaign.segment}
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[var(--ivory)] group-hover:text-[var(--gold)] transition-colors">{campaign.name}</h3>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{SEGMENT_LABELS[campaign.segment]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    campaign.status === "active" ? "bg-[#10b981]/10 text-[#10b981]" :
                    campaign.status === "completed" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                    campaign.status === "paused" ? "bg-[#f97316]/10 text-[#f97316]" :
                    "bg-[var(--obsidian)] text-[var(--text-tertiary)]"
                  }`}>
                    {campaign.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--gold)] transition-colors" />
                </div>
              </div>

              {campaign.description && (
                <p className="text-[11px] text-[var(--text-tertiary)] mb-3 line-clamp-2">{campaign.description}</p>
              )}

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mb-1">
                  <span>{campaign.sentCount}/{campaign._count.targets || campaign.targetCount} sent</span>
                  <span>{campaign.targetCount > 0 ? Math.round((campaign.sentCount / (campaign._count.targets || campaign.targetCount || 1)) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-[var(--obsidian)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${campaign.targetCount > 0 ? Math.min(100, (campaign.sentCount / (campaign._count.targets || campaign.targetCount)) * 100) : 0}%`,
                      backgroundColor: SEGMENT_COLORS[campaign.segment],
                    }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 text-[10px]">
                <span className="text-[var(--text-tertiary)]"><Target className="w-3 h-3 inline mr-1" />{campaign._count.targets || campaign.targetCount} targets</span>
                <span className="text-[var(--text-tertiary)]"><Eye className="w-3 h-3 inline mr-1" />{campaign.openCount} opened</span>
                <span className="text-[var(--text-tertiary)]"><MessageSquare className="w-3 h-3 inline mr-1" />{campaign.responseCount} replied</span>
                <span className="text-[var(--text-tertiary)]"><CalendarCheck className="w-3 h-3 inline mr-1" />{campaign.meetingCount} meetings</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          <Megaphone className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">No campaigns{activeSegment !== "all" ? ` in segment ${activeSegment}` : ""}</p>
          <p className="text-[12px] mt-1">Create your first campaign to start outreach</p>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreate(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[var(--charcoal)] border border-[var(--border)] p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold text-[var(--ivory)] mb-4">New Campaign</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">Campaign Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. VRL Media Blitz Q1"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[var(--ivory)] text-[13px] focus:outline-none focus:border-[var(--gold)]"
                />
              </div>

              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">Segment</label>
                <select
                  value={form.segment}
                  onChange={e => setForm(f => ({ ...f, segment: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[var(--ivory)] text-[13px] focus:outline-none focus:border-[var(--gold)]"
                >
                  {Object.entries(SEGMENT_LABELS).map(([seg, label]) => (
                    <option key={seg} value={seg}>{seg}: {label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Campaign goals and notes..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--obsidian)] border border-[var(--border)] text-[var(--ivory)] text-[13px] focus:outline-none focus:border-[var(--gold)] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-[13px] hover:text-[var(--ivory)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.name}
                className="flex-1 px-4 py-2 rounded-lg bg-[#D4AF37] text-[#1a1a2e] text-[13px] font-semibold hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number | string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-lg font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}
