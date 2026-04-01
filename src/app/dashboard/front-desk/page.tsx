"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark, UserCheck, CalendarCheck, Clock, Stethoscope,
  LogOut, AlertTriangle, Plus, Search, PlugZap, HeartPulse,
  Phone, Shield, Send, Footprints, ChevronRight, ArrowRight,
  Loader2, RefreshCw, CheckCircle2, XCircle, Circle,
  Bot, MessageSquare, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/lib/tenant-context";

// ── Types ────────────────────────────────────────────────────────────────

interface CheckIn {
  id: string;
  patientName: string;
  patientId: string;
  status: string;
  arrivedAt: string;
  seenAt: string | null;
  leftAt: string | null;
  notes: string;
}

interface Booking {
  id: string;
  patientName: string;
  patientPhone?: string;
  service: string;
  scheduledAt: string;
  status: string;
}

interface IntegrationStatus {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "pending";
}

interface Enrollment {
  id: string;
  patientName: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextStepAt: string | null;
  escalated: boolean;
  lastResponse: string | null;
}

interface RecallItem {
  id: string;
  patientName: string;
  reason: string;
  dueDate: string;
  contacted: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function timeSince(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function timeUntil(dateStr: string) {
  const mins = Math.floor((new Date(dateStr).getTime() - Date.now()) / 60000);
  if (mins < 0) return "Overdue";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

const statusColors: Record<string, { dot: string; bg: string }> = {
  waiting: { dot: "#E8C84A", bg: "rgba(232,200,74,0.08)" },
  in_consultation: { dot: "#2DD4BF", bg: "rgba(45,212,191,0.08)" },
  checked_out: { dot: "rgba(253,252,240,0.3)", bg: "rgba(255,255,255,0.03)" },
  no_show: { dot: "#8A0303", bg: "rgba(138,3,3,0.08)" },
};

const statusIcons: Record<string, typeof Clock> = {
  waiting: Clock,
  in_consultation: Stethoscope,
  checked_out: LogOut,
  no_show: AlertTriangle,
};

// ── Main Page ────────────────────────────────────────────────────────────

export default function FrontDeskPage() {
  const brand = useBrand();
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recalls, setRecalls] = useState<RecallItem[]>([]);

  // Modals
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  // Agent state
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: string; content: string }[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);

  // Form state
  const [walkInName, setWalkInName] = useState("");
  const [walkInNotes, setWalkInNotes] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [eligMember, setEligMember] = useState("");
  const [eligScheme, setEligScheme] = useState("");
  const [eligResult, setEligResult] = useState<Record<string, unknown> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [ciRes, bkRes, intRes, engRes, recRes] = await Promise.all([
        fetch("/api/checkin"),
        fetch("/api/bookings?limit=20"),
        fetch("/api/front-desk/connections"),
        fetch("/api/front-desk/engagement"),
        fetch("/api/recall"),
      ]);
      const [ciData, bkData, intData, engData, recData] = await Promise.all([
        ciRes.json(), bkRes.json(), intRes.json(), engRes.json(), recRes.json(),
      ]);
      setCheckIns(ciData.checkIns || []);
      setBookings((bkData.bookings || []).filter((b: Booking) => {
        const d = new Date(b.scheduledAt);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      }));
      setIntegrations(intData.integrations || []);
      setEnrollments(engData.enrollments || []);
      setRecalls((recData.recalls || recData.items || []).filter((r: RecallItem) => !r.contacted));
    } catch (err) {
      console.error("Failed to load front desk data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ──────────────────────────────────────────────────────────

  async function updateCheckInStatus(id: string, status: string) {
    await fetch("/api/checkin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchAll();
  }

  async function handleWalkIn(e: React.FormEvent) {
    e.preventDefault();
    if (!walkInName.trim()) return;
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: walkInName, service: "Walk-in", scheduledAt: new Date().toISOString(), source: "dashboard" }),
    });
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: walkInName, notes: walkInNotes }),
    });
    setWalkInName(""); setWalkInNotes(""); setShowWalkIn(false);
    fetchAll();
  }

  async function handleNewBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingName.trim() || !bookingService.trim() || !bookingTime) return;
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: bookingName, service: bookingService, scheduledAt: bookingTime, source: "dashboard" }),
    });
    setBookingName(""); setBookingService(""); setBookingTime(""); setShowNewBooking(false);
    fetchAll();
  }

  async function handleEligibilityCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!eligMember.trim() || !eligScheme.trim()) return;
    setEligResult(null);
    const res = await fetch("/api/healthbridge/eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipNumber: eligMember, scheme: eligScheme }),
    });
    const data = await res.json();
    setEligResult(data);
  }

  async function confirmBooking(id: string) {
    await fetch(`/api/bookings/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    fetchAll();
  }

  async function handleAgentSend() {
    if (!agentInput.trim() || agentLoading) return;
    const msg = agentInput.trim();
    setAgentInput("");
    setAgentMessages(prev => [...prev, { role: "user", content: msg }]);
    setAgentLoading(true);
    try {
      const res = await fetch("/api/agents/front-desk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: agentMessages.slice(-10) }),
      });
      const data = await res.json();
      setAgentMessages(prev => [...prev, { role: "assistant", content: data.response || data.error || "No response" }]);
      if (data.actions?.length > 0) fetchAll();
    } catch {
      setAgentMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setAgentLoading(false);
    }
  }

  // ── Computed Stats ───────────────────────────────────────────────────

  const waiting = checkIns.filter(c => c.status === "waiting").length;
  const inConsult = checkIns.filter(c => c.status === "in_consultation").length;
  const done = checkIns.filter(c => c.status === "checked_out").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const connected = integrations.filter(i => i.status === "connected").length;
  const totalIntegrations = integrations.length;
  const activeEngagements = enrollments.filter(e => e.status === "active").length;
  const escalated = enrollments.filter(e => e.escalated).length;
  const overdueRecalls = recalls.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(253,252,240,0.3)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "rgba(253,252,240,0.95)" }}>
            <Landmark className="inline w-6 h-6 mr-2 -mt-1" style={{ color: "#2DD4BF" }} />
            Front Desk
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(253,252,240,0.4)" }}>
            Everything your reception needs — in one place
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchAll()} className="p-2 rounded-lg transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
            <RefreshCw className="w-4 h-4" style={{ color: "rgba(253,252,240,0.5)" }} />
          </button>
          <button onClick={() => setShowAgent(!showAgent)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all" style={{ background: "linear-gradient(135deg, #2DD4BF20, #2DD4BF10)", color: "#2DD4BF", border: "1px solid rgba(45,212,191,0.2)" }}>
            <Bot className="w-4 h-4" /> AI Agent
          </button>
        </div>
      </div>

      {/* ── Integration Status Strip ──────────────────────────── */}
      <Link href="/dashboard/front-desk/connections">
        <motion.div
          className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.005]"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <PlugZap className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(253,252,240,0.4)" }} />
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            {integrations.map(int => (
              <div key={int.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-2 h-2 rounded-full" style={{
                  background: int.status === "connected" ? "#2DD4BF" : int.status === "pending" ? "#E8C84A" : "rgba(253,252,240,0.15)",
                }} />
                <span className="text-xs whitespace-nowrap" style={{ color: "rgba(253,252,240,0.5)" }}>
                  {int.name.split(" (")[0].split(" /")[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs font-medium" style={{ color: "#2DD4BF" }}>{connected}/{totalIntegrations}</span>
            <ChevronRight className="w-3 h-3" style={{ color: "rgba(253,252,240,0.3)" }} />
          </div>
        </motion.div>
      </Link>

      {/* ── Quick Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Waiting", value: waiting, icon: Clock, color: "#E8C84A", sub: `${inConsult} in consult` },
          { label: "Today's Bookings", value: bookings.length, icon: CalendarCheck, color: "#2DD4BF", sub: `${pendingBookings} pending` },
          { label: "Active Care", value: activeEngagements, icon: HeartPulse, color: "#818CF8", sub: escalated > 0 ? `${escalated} escalated` : "sequences running" },
          { label: "Overdue Recalls", value: overdueRecalls, icon: RotateCcw, color: overdueRecalls > 0 ? "#F87171" : "#2DD4BF", sub: overdueRecalls > 0 ? "need follow-up" : "all clear" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-2xl font-bold" style={{ color: "rgba(253,252,240,0.95)" }}>{stat.value}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "rgba(253,252,240,0.6)" }}>{stat.label}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(253,252,240,0.3)" }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Mini Check-In Kanban ──────────────────────────────── */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "rgba(253,252,240,0.8)" }}>
            <UserCheck className="inline w-4 h-4 mr-1.5 -mt-0.5" style={{ color: "#2DD4BF" }} />
            Check-In Board
          </h2>
          <Link href="/dashboard/checkin" className="text-xs flex items-center gap-1" style={{ color: "rgba(253,252,240,0.4)" }}>
            Full Board <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["waiting", "in_consultation", "checked_out"] as const).map(status => {
            const items = checkIns.filter(c => c.status === status);
            const labels: Record<string, string> = { waiting: "Waiting", in_consultation: "In Consult", checked_out: "Done" };
            const colors = statusColors[status] || { dot: "#888", bg: "rgba(255,255,255,0.03)" };
            return (
              <div key={status} className="rounded-lg p-2" style={{ background: colors.bg, minHeight: 80 }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
                  <span className="text-xs font-medium" style={{ color: "rgba(253,252,240,0.6)" }}>{labels[status]}</span>
                  <span className="text-xs ml-auto" style={{ color: "rgba(253,252,240,0.3)" }}>{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {items.slice(0, 5).map(ci => {
                      const Icon = statusIcons[ci.status] || Clock;
                      const nextStatus = ci.status === "waiting" ? "in_consultation" : ci.status === "in_consultation" ? "checked_out" : null;
                      return (
                        <motion.div
                          key={ci.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-2 rounded-md cursor-pointer group transition-all"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)" }}
                          onClick={() => nextStatus && updateCheckInStatus(ci.id, nextStatus)}
                          title={nextStatus ? `Move to ${nextStatus.replace("_", " ")}` : "Complete"}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3 h-3 flex-shrink-0" style={{ color: colors.dot }} />
                            <span className="text-xs truncate" style={{ color: "rgba(253,252,240,0.8)" }}>{ci.patientName}</span>
                          </div>
                          <span className="text-[10px]" style={{ color: "rgba(253,252,240,0.3)" }}>{timeSince(ci.arrivedAt)}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <p className="text-[10px] text-center py-2" style={{ color: "rgba(253,252,240,0.2)" }}>Empty</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today's Appointments ──────────────────────────────── */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "rgba(253,252,240,0.8)" }}>
            <CalendarCheck className="inline w-4 h-4 mr-1.5 -mt-0.5" style={{ color: "#818CF8" }} />
            Today&apos;s Appointments
          </h2>
          <Link href="/dashboard/bookings" className="text-xs flex items-center gap-1" style={{ color: "rgba(253,252,240,0.4)" }}>
            All Bookings <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "rgba(253,252,240,0.3)" }}>No appointments today</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 8).map(bk => (
              <div key={bk.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "rgba(253,252,240,0.85)" }}>{bk.patientName}</p>
                  <p className="text-xs" style={{ color: "rgba(253,252,240,0.4)" }}>
                    {bk.service} &middot; {new Date(bk.scheduledAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                    background: bk.status === "confirmed" ? "rgba(45,212,191,0.1)" : bk.status === "pending" ? "rgba(232,200,74,0.1)" : "rgba(255,255,255,0.05)",
                    color: bk.status === "confirmed" ? "#2DD4BF" : bk.status === "pending" ? "#E8C84A" : "rgba(253,252,240,0.4)",
                  }}>
                    {bk.status}
                  </span>
                  {bk.status === "pending" && (
                    <button onClick={() => confirmBooking(bk.id)} className="text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{ background: "rgba(45,212,191,0.15)", color: "#2DD4BF" }}>
                      Confirm
                    </button>
                  )}
                  {bk.status === "confirmed" && !checkIns.some(ci => ci.patientName === bk.patientName && ci.status !== "checked_out") && (
                    <button onClick={async () => {
                      await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: bk.patientName, bookingId: bk.id }) });
                      fetchAll();
                    }} className="text-[10px] px-2 py-0.5 rounded-full transition-colors" style={{ background: "rgba(232,200,74,0.15)", color: "#E8C84A" }}>
                      Check In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Engagement Sequences ───────────────────────── */}
      {enrollments.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "rgba(253,252,240,0.8)" }}>
              <HeartPulse className="inline w-4 h-4 mr-1.5 -mt-0.5" style={{ color: "#818CF8" }} />
              Patient Care Sequences
            </h2>
            <Link href="/dashboard/front-desk/engagement" className="text-xs flex items-center gap-1" style={{ color: "rgba(253,252,240,0.4)" }}>
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {enrollments.slice(0, 5).map(en => (
              <div key={en.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{
                background: en.escalated ? "rgba(248,113,113,0.05)" : "rgba(255,255,255,0.03)",
                border: en.escalated ? "1px solid rgba(248,113,113,0.15)" : "1px solid rgba(255,255,255,0.04)",
              }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "rgba(253,252,240,0.85)" }}>{en.patientName}</p>
                    {en.escalated && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(248,113,113,0.15)", color: "#F87171" }}>
                        ESCALATED
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "rgba(253,252,240,0.4)" }}>
                    Step {en.currentStep}/{en.totalSteps}
                    {en.nextStepAt && ` · Next: ${timeUntil(en.nextStepAt)}`}
                    {en.lastResponse && ` · "${en.lastResponse.slice(0, 40)}..."`}
                  </p>
                </div>
                {/* Step progress dots */}
                <div className="flex gap-1">
                  {Array.from({ length: en.totalSteps }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                      background: i < en.currentStep ? "#2DD4BF" : i === en.currentStep && en.escalated ? "#F87171" : "rgba(255,255,255,0.1)",
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions (sticky bottom bar) ─────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:pl-[280px]" style={{ background: "linear-gradient(to top, rgba(10,10,12,0.98), rgba(10,10,12,0.9), transparent)" }}>
        <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
          {[
            { label: "New Booking", icon: CalendarCheck, color: "#2DD4BF", onClick: () => setShowNewBooking(true) },
            { label: "Walk-In", icon: Footprints, color: "#E8C84A", onClick: () => setShowWalkIn(true) },
            { label: "Verify MA", icon: Shield, color: "#818CF8", onClick: () => setShowEligibility(true) },
            { label: "Import Queue", icon: RefreshCw, color: "#F97316", onClick: async () => { await fetch("/api/checkin/from-bookings", { method: "POST" }); fetchAll(); } },
          ].map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: `${action.color}15`, color: action.color, border: `1px solid ${action.color}25` }}
            >
              <action.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Agent Chat Panel ──────────────────────────────────── */}
      <AnimatePresence>
        {showAgent && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-20 bottom-24 w-[380px] z-50 rounded-2xl flex flex-col overflow-hidden"
            style={{ background: "rgba(15,15,18,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" style={{ color: "#2DD4BF" }} />
                <span className="text-sm font-semibold" style={{ color: "rgba(253,252,240,0.9)" }}>Front Desk Agent</span>
              </div>
              <button onClick={() => setShowAgent(false)} className="text-xs" style={{ color: "rgba(253,252,240,0.4)" }}>Close</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {agentMessages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(253,252,240,0.1)" }} />
                  <p className="text-sm" style={{ color: "rgba(253,252,240,0.4)" }}>Ask me anything about today&apos;s front desk operations</p>
                  <div className="mt-3 space-y-1.5">
                    {["How many patients are waiting?", "Check in Thandi Mokoena", "What's the schedule for today?"].map(q => (
                      <button key={q} onClick={() => { setAgentInput(q); }} className="block w-full text-left text-xs p-2 rounded-lg transition-colors" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(253,252,240,0.5)" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {agentMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%] p-3 rounded-xl text-sm" style={{
                    background: msg.role === "user" ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.04)",
                    color: "rgba(253,252,240,0.85)",
                    border: msg.role === "user" ? "1px solid rgba(45,212,191,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {agentLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#2DD4BF" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                <input
                  value={agentInput}
                  onChange={e => setAgentInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAgentSend()}
                  placeholder="Ask the front desk agent..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <button onClick={handleAgentSend} disabled={agentLoading} className="p-2 rounded-lg" style={{ background: "rgba(45,212,191,0.15)", color: "#2DD4BF" }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Walk-In Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showWalkIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowWalkIn(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgba(253,252,240,0.9)" }}>Walk-In Patient</h3>
              <form onSubmit={handleWalkIn} className="space-y-3">
                <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Patient Name *" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <input value={walkInNotes} onChange={e => setWalkInNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowWalkIn(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "rgba(253,252,240,0.5)" }}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(232,200,74,0.15)", color: "#E8C84A" }}>Check In Walk-In</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Booking Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showNewBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowNewBooking(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgba(253,252,240,0.9)" }}>New Booking</h3>
              <form onSubmit={handleNewBooking} className="space-y-3">
                <input value={bookingName} onChange={e => setBookingName(e.target.value)} placeholder="Patient Name *" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <input value={bookingService} onChange={e => setBookingService(e.target.value)} placeholder="Service (e.g. Consultation) *" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <input type="datetime-local" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowNewBooking(false)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "rgba(253,252,240,0.5)" }}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(45,212,191,0.15)", color: "#2DD4BF" }}>Create Booking</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Eligibility Check Modal ───────────────────────────── */}
      <AnimatePresence>
        {showEligibility && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => { setShowEligibility(false); setEligResult(null); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgba(253,252,240,0.9)" }}>
                <Shield className="inline w-5 h-5 mr-2 -mt-0.5" style={{ color: "#818CF8" }} />
                Medical Aid Verification
              </h3>
              <form onSubmit={handleEligibilityCheck} className="space-y-3">
                <input value={eligMember} onChange={e => setEligMember(e.target.value)} placeholder="Member Number *" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <input value={eligScheme} onChange={e => setEligScheme(e.target.value)} placeholder="Scheme (e.g. Discovery, GEMS) *" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} required />
                <button type="submit" className="w-full px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8" }}>Verify Eligibility</button>
              </form>
              {eligResult && (
                <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    {eligResult.eligible ? (
                      <><CheckCircle2 className="w-4 h-4" style={{ color: "#2DD4BF" }} /><span className="text-sm font-medium" style={{ color: "#2DD4BF" }}>Eligible</span></>
                    ) : (
                      <><XCircle className="w-4 h-4" style={{ color: "#F87171" }} /><span className="text-sm font-medium" style={{ color: "#F87171" }}>Not Eligible</span></>
                    )}
                  </div>
                  {eligResult.option ? <p className="text-xs" style={{ color: "rgba(253,252,240,0.6)" }}>Option: {String(eligResult.option)}</p> : null}
                  {eligResult.preAuthRequired ? <p className="text-xs mt-1" style={{ color: "#E8C84A" }}>Pre-authorisation required</p> : null}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
