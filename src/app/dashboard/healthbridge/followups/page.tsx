"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, Loader2, AlertCircle, CheckCircle2, Mail, Phone, Building2,
  ChevronDown, ChevronUp, XCircle, Copy, Check,
} from "lucide-react";

interface FollowUpAction {
  claimId: string;
  patientName: string;
  scheme: string;
  daysOld: number;
  urgency: "low" | "medium" | "high" | "critical";
  action: string;
  emailTemplate?: string;
  schemeContact?: string;
}

interface FollowUpSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const urgencyConfig = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", label: "120+ days", border: "border-red-500/20" },
  high: { color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", label: "90+ days", border: "border-amber-500/20" },
  medium: { color: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-400", label: "60+ days", border: "border-blue-500/20" },
  low: { color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "30+ days", border: "border-emerald-500/20" },
};

export default function FollowupsPage() {
  const [followUps, setFollowUps] = useState<FollowUpAction[]>([]);
  const [summary, setSummary] = useState<FollowUpSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/healthbridge/followups");
        const data = await res.json();
        setFollowUps(data.followUps || []);
        setSummary(data.summary || null);
      } catch {
        setError("Failed to load follow-ups");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function copyEmail(claimId: string, email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(claimId);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  const filtered = filter === "all" ? followUps : followUps.filter((f) => f.urgency === filter);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--teal)]" />
        <span className="ml-2 text-[13px] text-[var(--text-secondary)]">Generating follow-up actions...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--teal)]" />
            <h2 className="text-lg font-semibold text-[var(--ivory)]">Follow-up Actions</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">Outstanding Claims</span>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-glass text-[12px] w-36">
            <option value="all">All Urgencies</option>
            <option value="critical">Critical (120+)</option>
            <option value="high">High (90+)</option>
            <option value="medium">Medium (60+)</option>
            <option value="low">Low (30+)</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mb-5">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: "Total", value: summary.total, color: "#3DA9D1" },
              { label: "Critical", value: summary.critical, color: "#ef4444" },
              { label: "High", value: summary.high, color: "#f59e0b" },
              { label: "Medium", value: summary.medium, color: "#3b82f6" },
              { label: "Low", value: summary.low, color: "#10b981" },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4 text-center">
                <div className="text-[20px] font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-[11px] text-[var(--text-tertiary)]">{card.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Follow-up List */}
        {filtered.length === 0 ? (
          <div className="rounded-xl glass-panel p-8 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-40" />
            <div className="text-[13px] text-[var(--text-tertiary)]">No outstanding follow-ups</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">All claims are up to date</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((fu) => {
              const config = urgencyConfig[fu.urgency];
              const isExpanded = expanded === fu.claimId;
              return (
                <motion.div key={fu.claimId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl glass-panel overflow-hidden border ${config.border}`}
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : fu.claimId)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] text-left"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                      {fu.urgency === "critical" ? <XCircle className="w-4 h-4 text-red-400" /> :
                       fu.urgency === "high" ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                       <Clock className="w-4 h-4" style={{ color: config.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--ivory)]">{fu.patientName}</div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">
                        {fu.scheme} — {fu.daysOld} days outstanding
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full shrink-0 ${config.bg} ${config.text}`}>
                      {fu.urgency.toUpperCase()}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
                  </button>

                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-[var(--border)] p-4 space-y-3 bg-white/[0.01]">
                      {/* Recommended Action */}
                      <div>
                        <div className="text-[11px] text-[var(--text-tertiary)] font-medium mb-1 uppercase tracking-wider">Recommended Action</div>
                        <div className="text-[13px] text-[var(--ivory)]">{fu.action}</div>
                      </div>

                      {/* Scheme Contact */}
                      {fu.schemeContact && (
                        <div className="rounded-lg p-3 bg-white/[0.02] border border-[var(--border)]">
                          <div className="text-[11px] text-[var(--text-tertiary)] font-medium mb-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Scheme Contact
                          </div>
                          <div className="text-[12px] text-[var(--ivory)] flex items-center gap-3">
                            <Phone className="w-3 h-3 text-[var(--teal)]" />
                            <span>{fu.schemeContact}</span>
                          </div>
                        </div>
                      )}

                      {/* Draft Email */}
                      {fu.emailTemplate && (
                        <div className="rounded-lg p-3 bg-white/[0.02] border border-[var(--border)]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[11px] text-[var(--text-tertiary)] font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Draft Follow-up Email
                            </div>
                            <button onClick={() => copyEmail(fu.claimId, fu.emailTemplate || "")} className="flex items-center gap-1 text-[11px] text-[var(--teal)] hover:opacity-80">
                              {copiedEmail === fu.claimId ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                          </div>
                          <pre className="text-[11px] text-[var(--ivory)] whitespace-pre-wrap font-sans leading-relaxed">{fu.emailTemplate}</pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
