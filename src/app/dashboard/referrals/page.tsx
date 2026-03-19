"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Clock, CheckCircle, XCircle, CalendarCheck, ChevronDown,
  ChevronUp, Send, Filter, AlertTriangle, TrendingUp, ArrowRight, Loader2,
  BarChart3, MessageSquare,
} from "lucide-react";

interface Referral {
  id: string;
  referringDoctor: string;
  referringPractice: string;
  referringPhone: string;
  referringEmail: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  dateOfBirth: string;
  medicalAid: string;
  medicalAidNo: string;
  reason: string;
  urgency: string;
  clinicalNotes: string;
  icd10Code: string;
  status: string;
  feedbackSent: boolean;
  feedbackNote: string;
  feedbackSentAt: string | null;
  appointmentDate: string | null;
  practiceId: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  accepted: { label: "Accepted", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: CheckCircle },
  booked: { label: "Booked", color: "text-[#3DA9D1]", bg: "bg-[#3DA9D1] border-[#3DA9D1]", icon: CalendarCheck },
  completed: { label: "Completed", color: "text-gray-600", bg: "bg-gray-50 border-gray-200", icon: CheckCircle },
  declined: { label: "Declined", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  routine: { label: "Routine", color: "text-[#1D3443]", bg: "bg-[#3DA9D1]" },
  urgent: { label: "Urgent", color: "text-amber-700", bg: "bg-amber-100" },
  emergency: { label: "Emergency", color: "text-red-700", bg: "bg-red-100" },
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  async function fetchReferrals() {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterUrgency !== "all") params.set("urgency", filterUrgency);
      const res = await fetch(`/api/referrals?${params.toString()}`);
      const data = await res.json();
      setReferrals(data.referrals || []);
      setPendingCount(data.pendingCount || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReferrals(); }, [filterStatus, filterUrgency]);

  async function updateReferral(id: string, updates: Record<string, string>) {
    setActionLoading(id);
    try {
      await fetch("/api/referrals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchReferrals();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  async function sendFeedback(id: string) {
    const note = feedbackDraft[id];
    if (!note?.trim()) return;
    await updateReferral(id, { feedbackNote: note });
    setFeedbackDraft((prev) => ({ ...prev, [id]: "" }));
  }

  // Weekly summary calculations
  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const weekReferrals = referrals.filter((r) => new Date(r.createdAt) >= weekAgo);
    const pendingAction = referrals.filter((r) => r.status === "pending");
    const feedbackPending = referrals.filter((r) => r.status === "accepted" && !r.feedbackSent);
    const booked = referrals.filter((r) => ["booked", "completed"].includes(r.status));
    const conversionRate = referrals.length > 0 ? Math.round((booked.length / referrals.length) * 100) : 0;

    return {
      weekCount: weekReferrals.length,
      pendingAction: pendingAction.length,
      feedbackPending: feedbackPending.length,
      conversionRate,
    };
  }, [referrals]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#3DA9D1]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3DA9D1] flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#3DA9D1]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">GP Referrals</h1>
            <p className="text-xs text-gray-500">
              {pendingCount > 0 ? `${pendingCount} pending review` : "All referrals up to date"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {(filterStatus !== "all" || filterUrgency !== "all") && (
            <span className="w-2 h-2 rounded-full bg-[#3DA9D1]" />
          )}
        </button>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard icon={TrendingUp} label="This Week" value={weeklySummary.weekCount} color="emerald" />
        <SummaryCard icon={Clock} label="Pending Action" value={weeklySummary.pendingAction} color={weeklySummary.pendingAction > 0 ? "amber" : "gray"} />
        <SummaryCard icon={MessageSquare} label="Feedback Due" value={weeklySummary.feedbackPending} color={weeklySummary.feedbackPending > 0 ? "blue" : "gray"} />
        <SummaryCard icon={BarChart3} label="Conversion Rate" value={`${weeklySummary.conversionRate}%`} color="emerald" />
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Urgency</label>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20"
                >
                  <option value="all">All Urgencies</option>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              {(filterStatus !== "all" || filterUrgency !== "all") && (
                <button
                  onClick={() => { setFilterStatus("all"); setFilterUrgency("all"); }}
                  className="self-end text-xs text-[#3DA9D1] hover:text-[#1D3443] font-medium pb-1.5"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral List */}
      {referrals.length === 0 ? (
        <div className="text-center py-16">
          <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No Referrals</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {filterStatus !== "all" || filterUrgency !== "all"
              ? "No referrals match the current filters."
              : "Share your referral portal link with GPs to start receiving referrals."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref) => {
            const isExpanded = expandedId === ref.id;
            const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.pending;
            const urgencyCfg = URGENCY_CONFIG[ref.urgency] || URGENCY_CONFIG.routine;
            const StatusIcon = statusCfg.icon;
            const isActionLoading = actionLoading === ref.id;

            return (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Row Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  {/* Urgency indicator */}
                  <div className={`w-1 h-12 rounded-full shrink-0 ${
                    ref.urgency === "emergency" ? "bg-red-500" : ref.urgency === "urgent" ? "bg-amber-400" : "bg-[#3DA9D1]"
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">{ref.patientName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${urgencyCfg.bg} ${urgencyCfg.color}`}>
                        {urgencyCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>From: {ref.referringDoctor}</span>
                      {ref.referringPractice && <span className="text-gray-300">|</span>}
                      {ref.referringPractice && <span>{ref.referringPractice}</span>}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-400">{new Date(ref.createdAt).toLocaleDateString("en-ZA")}</div>
                    {ref.icd10Code && <div className="text-[10px] text-gray-400 font-mono mt-0.5">{ref.icd10Code}</div>}
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-4 py-5 space-y-5">
                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <DetailSection title="Referring Doctor">
                            <DetailRow label="Name" value={ref.referringDoctor} />
                            <DetailRow label="Practice" value={ref.referringPractice} />
                            <DetailRow label="Phone" value={ref.referringPhone} />
                            <DetailRow label="Email" value={ref.referringEmail} />
                          </DetailSection>
                          <DetailSection title="Patient">
                            <DetailRow label="Name" value={ref.patientName} />
                            <DetailRow label="Phone" value={ref.patientPhone} />
                            <DetailRow label="DOB" value={ref.dateOfBirth} />
                            <DetailRow label="Medical Aid" value={ref.medicalAid ? `${ref.medicalAid}${ref.medicalAidNo ? ` (${ref.medicalAidNo})` : ""}` : ""} />
                          </DetailSection>
                        </div>

                        {/* Clinical */}
                        <DetailSection title="Clinical Details">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{ref.reason}</p>
                          </div>
                          {ref.clinicalNotes && (
                            <div className="mt-2 bg-gray-50 rounded-lg p-3">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Notes</p>
                              <p className="text-xs text-gray-600">{ref.clinicalNotes}</p>
                            </div>
                          )}
                        </DetailSection>

                        {/* Feedback (if sent) */}
                        {ref.feedbackSent && ref.feedbackNote && (
                          <DetailSection title="Feedback to GP">
                            <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3">
                              <p className="text-xs text-[#152736]">{ref.feedbackNote}</p>
                              {ref.feedbackSentAt && (
                                <p className="text-[10px] text-[#3DA9D1] mt-2">
                                  Sent {new Date(ref.feedbackSentAt).toLocaleDateString("en-ZA")}
                                </p>
                              )}
                            </div>
                          </DetailSection>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          {ref.status === "pending" && (
                            <>
                              <ActionButton
                                loading={isActionLoading}
                                onClick={() => updateReferral(ref.id, { status: "accepted" })}
                                variant="primary"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Accept
                              </ActionButton>
                              <ActionButton
                                loading={isActionLoading}
                                onClick={() => updateReferral(ref.id, { status: "declined" })}
                                variant="danger"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </ActionButton>
                            </>
                          )}
                          {ref.status === "accepted" && (
                            <ActionButton
                              loading={isActionLoading}
                              onClick={() => updateReferral(ref.id, { status: "booked" })}
                              variant="primary"
                            >
                              <CalendarCheck className="w-3.5 h-3.5" /> Mark as Booked
                            </ActionButton>
                          )}
                          {ref.status === "booked" && (
                            <ActionButton
                              loading={isActionLoading}
                              onClick={() => updateReferral(ref.id, { status: "completed" })}
                              variant="primary"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                            </ActionButton>
                          )}

                          {/* Feedback form */}
                          {["accepted", "booked", "completed"].includes(ref.status) && !ref.feedbackSent && (
                            <div className="w-full mt-3">
                              <label className="text-[10px] text-gray-400 uppercase font-semibold mb-1.5 block flex items-center gap-1">
                                <Send className="w-3 h-3" /> Send Feedback to GP
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={feedbackDraft[ref.id] || ""}
                                  onChange={(e) => setFeedbackDraft((prev) => ({ ...prev, [ref.id]: e.target.value }))}
                                  rows={2}
                                  placeholder="e.g. Patient seen on [date]. Diagnosis confirmed. Plan: [treatment]. Follow-up in [weeks]."
                                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20 focus:border-[#3DA9D1] resize-none"
                                />
                                <button
                                  onClick={() => sendFeedback(ref.id)}
                                  disabled={!feedbackDraft[ref.id]?.trim() || isActionLoading}
                                  className="self-end px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" /> Send
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-[#3DA9D1] text-[#3DA9D1]",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-50 text-gray-400",
  };
  const iconColor = colorMap[color] || colorMap.gray;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-gray-400 w-16 shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  loading,
  variant,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  variant: "primary" | "danger";
  children: React.ReactNode;
}) {
  const styles = {
    primary: "bg-[#3DA9D1] hover:bg-[#1D3443] text-white",
    danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 ${styles[variant]}`}
    >
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      {children}
    </button>
  );
}
