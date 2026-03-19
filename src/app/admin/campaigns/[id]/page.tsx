"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Send, Eye, MessageSquare, CalendarCheck,
  TrendingUp, Users, Clock, MoreVertical, CheckCircle,
  Mail, Target, AlertCircle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#666", queued: "#f97316", sent: "#0ea5e9",
  opened: "#10b981", responded: "#8B5CF6", meeting_booked: "#D4AF37",
  converted: "#ef4444", opted_out: "#444",
};

const SEGMENT_COLORS: Record<string, string> = {
  A: "#ef4444", B: "#f97316", C: "#8B5CF6", D: "#0ea5e9",
  E: "#10b981", F: "#D4AF37", G: "#ec4899", H: "#14b8a6",
  I: "#a855f7", J: "#2DD4BF",
};

interface TargetRow {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  status: string;
  priority: number;
  followUpStep: number;
  nextFollowUpAt: string | null;
  lastEmailSentAt: string | null;
  notes: string;
}

interface CampaignDetail {
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
  targets: TargetRow[];
  _count: { targets: number; emails: number };
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [statusModal, setStatusModal] = useState<{ targetId: string; current: string } | null>(null);

  function load() {
    fetch(`/api/outreach/campaigns/${id}`).then(r => r.json()).then(d => setCampaign(d.campaign || null));
  }

  useEffect(() => { load(); }, [id]);

  async function handleSend(targetId: string, isFollowUp = false) {
    setSending(targetId);
    await fetch("/api/outreach/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, campaignId: id, isFollowUp }),
    });
    load();
    setSending(null);
  }

  async function handleBulkSend(type: "pending" | "followup") {
    if (!campaign) return;
    const targets = type === "pending"
      ? campaign.targets.filter(t => t.status === "pending" && t.email)
      : campaign.targets.filter(t => t.nextFollowUpAt && new Date(t.nextFollowUpAt) <= new Date() && ["sent", "opened"].includes(t.status));

    for (const target of targets) {
      await handleSend(target.id, type === "followup");
    }
  }

  async function updateTargetStatus(targetId: string, newStatus: string) {
    await fetch(`/api/outreach/targets/${targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusModal(null);
    load();
  }

  async function toggleCampaignStatus() {
    if (!campaign) return;
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await fetch(`/api/outreach/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  if (!campaign) {
    return <div className="p-6 text-[var(--text-tertiary)]">Loading...</div>;
  }

  const c = campaign;
  const targets = filter === "all" ? c.targets : c.targets.filter(t => t.status === filter);
  const followUpsDue = c.targets.filter(t => t.nextFollowUpAt && new Date(t.nextFollowUpAt) <= new Date() && ["sent", "opened"].includes(t.status));
  const pendingWithEmail = c.targets.filter(t => t.status === "pending" && t.email);

  // Funnel numbers
  const funnelSteps = [
    { label: "Targets", count: c._count.targets, color: "#8B5CF6" },
    { label: "Sent", count: c.sentCount, color: "#0ea5e9" },
    { label: "Opened", count: c.openCount, color: "#10b981" },
    { label: "Responded", count: c.responseCount, color: "#D4AF37" },
    { label: "Meetings", count: c.meetingCount, color: "#ec4899" },
    { label: "Converted", count: c.conversionCount, color: "#ef4444" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns" className="p-2 rounded-lg hover:bg-[var(--obsidian)] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                style={{ backgroundColor: SEGMENT_COLORS[c.segment] || "#666" }}
              >
                {c.segment}
              </span>
              <h1 className="text-xl font-semibold text-[var(--ivory)]">{c.name}</h1>
            </div>
            {c.description && <p className="text-[12px] text-[var(--text-tertiary)] mt-1 ml-9">{c.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleCampaignStatus}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              c.status === "active"
                ? "bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20"
                : "bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20"
            }`}
          >
            {c.status === "active" ? "Pause" : "Activate"}
          </button>
        </div>
      </div>

      {/* Funnel Visualization */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5">
        <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">Conversion Funnel</h3>
        <div className="flex items-end gap-2">
          {funnelSteps.map((step, i) => {
            const maxCount = Math.max(...funnelSteps.map(s => s.count), 1);
            const height = Math.max(20, (step.count / maxCount) * 120);
            return (
              <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[16px] font-bold text-[var(--ivory)]">{step.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full rounded-t-lg"
                  style={{ backgroundColor: step.color }}
                />
                <span className="text-[10px] text-[var(--text-tertiary)]">{step.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Follow-Ups Due + Bulk Actions */}
      <div className="flex gap-3">
        {followUpsDue.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f97316]" />
              <span className="text-[13px] text-[#f97316] font-medium">{followUpsDue.length} follow-up{followUpsDue.length > 1 ? "s" : ""} due</span>
            </div>
            <button
              onClick={() => handleBulkSend("followup")}
              className="px-3 py-1 rounded-lg bg-[#f97316] text-white text-[11px] font-medium hover:bg-[#f97316]/80"
            >
              Send All Follow-Ups
            </button>
          </motion.div>
        )}
        {pendingWithEmail.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-between px-4 py-3 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-[13px] text-[#8B5CF6] font-medium">{pendingWithEmail.length} ready to send</span>
            </div>
            <button
              onClick={() => handleBulkSend("pending")}
              className="px-3 py-1 rounded-lg bg-[#8B5CF6] text-white text-[11px] font-medium hover:bg-[#8B5CF6]/80"
            >
              Send to All Pending
            </button>
          </motion.div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "sent", "opened", "responded", "meeting_booked", "converted", "opted_out"].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
              filter === s
                ? "bg-[var(--ivory)] text-[var(--obsidian)]"
                : "bg-[var(--obsidian)] text-[var(--text-secondary)] hover:text-[var(--ivory)]"
            }`}
          >
            {s === "all" ? `All (${c.targets.length})` : `${s.replace("_", " ")} (${c.targets.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Target Table */}
      <div className="rounded-xl glass-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Organization</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Follow-Up</th>
              <th className="text-right px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const isDue = target.nextFollowUpAt && new Date(target.nextFollowUpAt) <= new Date() && ["sent", "opened"].includes(target.status);
              return (
                <tr key={target.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium text-[var(--ivory)]">{target.name}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{target.title}</div>
                    {target.email && <div className="text-[10px] text-[var(--text-tertiary)] font-mono">{target.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{target.organization}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setStatusModal({ targetId: target.id, current: target.status })}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80"
                      style={{
                        color: STATUS_COLORS[target.status] || "#666",
                        backgroundColor: `${STATUS_COLORS[target.status] || "#666"}15`,
                      }}
                    >
                      {target.status.replace("_", " ")}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      Step {target.followUpStep}/4
                    </div>
                    {isDue && (
                      <span className="text-[10px] text-[#f97316] font-medium">Due now</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {target.status === "pending" && target.email && (
                        <button
                          onClick={() => handleSend(target.id)}
                          disabled={sending === target.id}
                          className="px-2 py-1 rounded-lg bg-[#10b981]/10 text-[#10b981] text-[11px] font-medium hover:bg-[#10b981]/20 disabled:opacity-50"
                        >
                          {sending === target.id ? "..." : "Send"}
                        </button>
                      )}
                      {isDue && (
                        <button
                          onClick={() => handleSend(target.id, true)}
                          disabled={sending === target.id}
                          className="px-2 py-1 rounded-lg bg-[#f97316]/10 text-[#f97316] text-[11px] font-medium hover:bg-[#f97316]/20 disabled:opacity-50"
                        >
                          {sending === target.id ? "..." : "Follow Up"}
                        </button>
                      )}
                      {!target.email && target.status === "pending" && (
                        <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> No email
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {targets.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-[13px]">
            No targets {filter !== "all" ? `with status "${filter.replace("_", " ")}"` : "yet"}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setStatusModal(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xs rounded-xl bg-[var(--charcoal)] border border-[var(--border)] p-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-[14px] font-semibold text-[var(--ivory)] mb-3">Update Status</h3>
            <div className="space-y-1">
              {["pending", "sent", "opened", "responded", "meeting_booked", "converted", "opted_out"].map(s => (
                <button
                  key={s}
                  onClick={() => updateTargetStatus(statusModal.targetId, s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors ${
                    statusModal.current === s
                      ? "bg-[var(--obsidian)] text-[var(--ivory)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--obsidian)]/50"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: STATUS_COLORS[s] }} />
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
