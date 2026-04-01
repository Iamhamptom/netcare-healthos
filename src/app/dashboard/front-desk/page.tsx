"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  UserCheck, CalendarCheck, Clock, Stethoscope, LogOut,
  AlertTriangle, Plus, PlugZap, HeartPulse, Send, RefreshCw,
  Loader2, Bot, RotateCcw, ArrowRight, Wrench,
  Footprints, Shield, ChevronRight, Search,
} from "lucide-react";

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
  if (mins < 1) return "now";
  if (mins < 60) return mins + "m";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function FrontDeskPage() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recalls, setRecalls] = useState<RecallItem[]>([]);

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Agent
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<{ role: string; content: string; tools?: string[] }[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const agentEndRef = useRef<HTMLDivElement>(null);

  // Forms
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
  useEffect(() => { agentEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [agentMessages]);

  // ── Actions ────────────────────────────────────────────────────────────

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
      body: JSON.stringify({ patientName: walkInName, service: "Walk-in", scheduledAt: new Date().toISOString(), source: "front-desk" }),
    });
    await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: walkInName, notes: walkInNotes }),
    });
    setWalkInName(""); setWalkInNotes(""); setActiveModal(null);
    fetchAll();
  }

  async function handleNewBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingName.trim() || !bookingService.trim() || !bookingTime) return;
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: bookingName, service: bookingService, scheduledAt: bookingTime, source: "front-desk" }),
    });
    setBookingName(""); setBookingService(""); setBookingTime(""); setActiveModal(null);
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
    await fetch("/api/bookings/" + id + "/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    fetchAll();
  }

  async function importToCheckin() {
    const pending = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
    for (const b of pending) {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: b.patientName, bookingId: b.id, notes: b.service }),
      });
    }
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
      setAgentMessages(prev => [...prev, { role: "assistant", content: data.response || data.error || "No response", tools: data.toolsUsed }]);
      if (data.actions?.length > 0) fetchAll();
    } catch {
      setAgentMessages(prev => [...prev, { role: "assistant", content: "Agent error. Try again." }]);
    } finally {
      setAgentLoading(false);
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  const waiting = checkIns.filter(c => c.status === "waiting").length;
  const inConsult = checkIns.filter(c => c.status === "in_consultation").length;
  const done = checkIns.filter(c => c.status === "checked_out").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const connected = integrations.filter(i => i.status === "connected").length;
  const totalIntegrations = integrations.length || 7;
  const activeEngagements = enrollments.filter(e => e.status === "active").length;
  const escalated = enrollments.filter(e => e.escalated).length;
  const overdueRecalls = recalls.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 pb-28 text-neutral-200">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-neutral-100">Front Desk</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">reception</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
            {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => fetchAll()} className="h-7 px-2 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors">
            <RefreshCw className="w-3 h-3 text-neutral-400" />
          </button>
          <button
            onClick={() => setAgentOpen(!agentOpen)}
            className={"h-7 px-3 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors " + (agentOpen ? "bg-neutral-100 text-neutral-900" : "border border-neutral-800 text-neutral-400 hover:bg-neutral-800")}
          >
            <Bot className="w-3 h-3" /> Agent
          </button>
        </div>
      </div>

      {/* ── Integration Strip ──────────────────────────────────── */}
      <Link href="/dashboard/front-desk/connections">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors mb-6">
          <PlugZap className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            {integrations.map(int => (
              <div key={int.id} className="flex items-center gap-1.5 shrink-0">
                <div className={"w-1.5 h-1.5 rounded-full " + (int.status === "connected" ? "bg-emerald-400" : int.status === "pending" ? "bg-amber-400" : "bg-neutral-600")} />
                <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                  {int.name.split(" (")[0].split(" /")[0]}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono text-emerald-400 shrink-0">{connected}/{totalIntegrations}</span>
          <ChevronRight className="w-3 h-3 text-neutral-600" />
        </div>
      </Link>

      {/* ── Stat Grid (VisioCode gap-px border pattern) ────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-neutral-800 rounded-lg overflow-hidden mb-6">
        {[
          { label: "WAITING", value: waiting, mono: true },
          { label: "IN CONSULT", value: inConsult, mono: true },
          { label: "DONE", value: done, mono: true },
          { label: "BOOKINGS", value: bookings.length, sub: pendingBookings + " pending" },
          { label: "CARE SEQ", value: activeEngagements, sub: escalated > 0 ? escalated + " escalated" : "running" },
          { label: "RECALL", value: overdueRecalls, sub: overdueRecalls > 0 ? "overdue" : "clear" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 p-3">
            <div className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 mb-1">{s.label}</div>
            <div className={"text-xl font-semibold " + (s.mono ? "font-mono" : "") + " text-neutral-100"}>{s.value}</div>
            {s.sub && <div className="text-[10px] font-mono text-neutral-500 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Check-In Board (left 2 cols) ──────────────────────── */}
        <div className="lg:col-span-2 border border-neutral-800 rounded-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[13px] font-semibold text-neutral-200">Check-In Board</span>
            </div>
            <Link href="/dashboard/checkin" className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
              Full board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-px bg-neutral-800">
            {(["waiting", "in_consultation", "checked_out"] as const).map(status => {
              const items = checkIns.filter(c => c.status === status);
              const labels: Record<string, string> = { waiting: "Waiting", in_consultation: "In Consult", checked_out: "Done" };
              const icons: Record<string, typeof Clock> = { waiting: Clock, in_consultation: Stethoscope, checked_out: LogOut };
              const Icon = icons[status] || Clock;
              return (
                <div key={status} className="bg-neutral-900 p-2 min-h-[120px]">
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Icon className="w-3 h-3 text-neutral-500" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">{labels[status]}</span>
                    <span className="text-[10px] font-mono text-neutral-600 ml-auto">{items.length}</span>
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 6).map(ci => {
                      const nextStatus = ci.status === "waiting" ? "in_consultation" : ci.status === "in_consultation" ? "checked_out" : null;
                      return (
                        <button
                          key={ci.id}
                          onClick={() => nextStatus && updateCheckInStatus(ci.id, nextStatus)}
                          className="w-full text-left px-2 py-1.5 rounded border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors"
                          title={nextStatus ? "Click to move to " + nextStatus.replace("_", " ") : "Complete"}
                        >
                          <div className="text-[12px] text-neutral-200 truncate">{ci.patientName}</div>
                          <div className="text-[10px] font-mono text-neutral-500">{timeSince(ci.arrivedAt)}</div>
                        </button>
                      );
                    })}
                    {items.length === 0 && (
                      <p className="text-[10px] font-mono text-neutral-600 text-center py-4">empty</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Quick Actions (right col) ─────────────────────────── */}
        <div className="border border-neutral-800 rounded-lg">
          <div className="px-3 py-2 border-b border-neutral-800">
            <span className="text-[13px] font-semibold text-neutral-200">Quick Actions</span>
          </div>
          <div className="p-2 space-y-1">
            {[
              { label: "New Booking", icon: CalendarCheck, key: "booking" },
              { label: "Walk-In", icon: Footprints, key: "walkin" },
              { label: "Verify Medical Aid", icon: Shield, key: "eligibility" },
              { label: "Import Queue", icon: Plus, key: "import", action: importToCheckin },
              { label: "Find Patient", icon: Search, href: "/dashboard/patients" },
              { label: "Recall List", icon: RotateCcw, href: "/dashboard/recall" },
              { label: "Engagement", icon: HeartPulse, href: "/dashboard/front-desk/engagement" },
              { label: "Connections", icon: PlugZap, href: "/dashboard/front-desk/connections" },
            ].map(act => {
              if (act.href) {
                return (
                  <Link key={act.label} href={act.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors border border-transparent hover:border-neutral-700">
                    <act.icon className="w-3.5 h-3.5 text-neutral-500" />
                    {act.label}
                  </Link>
                );
              }
              return (
                <button
                  key={act.label}
                  onClick={() => act.action ? act.action() : setActiveModal(act.key!)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 transition-colors border border-transparent hover:border-neutral-700 text-left"
                >
                  <act.icon className="w-3.5 h-3.5 text-neutral-500" />
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Today's Appointments ──────────────────────────────── */}
      <div className="border border-neutral-800 rounded-lg mt-4">
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[13px] font-semibold text-neutral-200">Today&apos;s Appointments</span>
            <span className="text-[10px] font-mono text-neutral-500">{bookings.length}</span>
          </div>
          <Link href="/dashboard/bookings" className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-[11px] font-mono text-neutral-600 text-center py-6">No bookings today</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {bookings.slice(0, 10).map(b => (
              <div key={b.id} className="flex items-center px-3 py-2 hover:bg-neutral-800/30 transition-colors">
                <span className="text-[12px] font-mono text-neutral-400 w-14 shrink-0">{fmtTime(b.scheduledAt)}</span>
                <span className="text-[13px] text-neutral-200 flex-1 truncate">{b.patientName}</span>
                <span className="text-[11px] font-mono text-neutral-500 mx-3">{b.service}</span>
                <span className={"text-[10px] font-mono px-1.5 py-0.5 rounded " + (b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>{b.status}</span>
                {b.status === "pending" && (
                  <button onClick={() => confirmBooking(b.id)} className="ml-2 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 px-1.5 py-0.5 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors">
                    confirm
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recall Alerts ──────────────────────────────────────── */}
      {overdueRecalls > 0 && (
        <div className="border border-neutral-800 rounded-lg mt-4">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[13px] font-semibold text-neutral-200">Overdue Recalls</span>
              <span className="text-[10px] font-mono text-amber-400">{overdueRecalls}</span>
            </div>
            <Link href="/dashboard/recall" className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {recalls.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center px-3 py-2">
                <span className="text-[13px] text-neutral-200 flex-1">{r.patientName}</span>
                <span className="text-[11px] font-mono text-neutral-500">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveModal(null)}>
          <div className="w-full max-w-md border border-neutral-800 rounded-xl bg-neutral-900 p-5" onClick={e => e.stopPropagation()}>
            {activeModal === "walkin" && (
              <form onSubmit={handleWalkIn} className="space-y-3">
                <h3 className="text-[15px] font-semibold text-neutral-100">Walk-In</h3>
                <input
                  value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Patient name"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <input
                  value={walkInNotes} onChange={e => setWalkInNotes(e.target.value)} placeholder="Notes (optional)"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 h-8 rounded-lg border border-neutral-700 text-[13px] text-neutral-400 hover:bg-neutral-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-[13px] font-medium hover:bg-neutral-200 transition-colors">Check In</button>
                </div>
              </form>
            )}
            {activeModal === "booking" && (
              <form onSubmit={handleNewBooking} className="space-y-3">
                <h3 className="text-[15px] font-semibold text-neutral-100">New Booking</h3>
                <input
                  value={bookingName} onChange={e => setBookingName(e.target.value)} placeholder="Patient name"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <input
                  value={bookingService} onChange={e => setBookingService(e.target.value)} placeholder="Service (e.g. GP Consult)"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <input
                  type="datetime-local" value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 focus:outline-none focus:border-neutral-600"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 h-8 rounded-lg border border-neutral-700 text-[13px] text-neutral-400 hover:bg-neutral-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-[13px] font-medium hover:bg-neutral-200 transition-colors">Book</button>
                </div>
              </form>
            )}
            {activeModal === "eligibility" && (
              <form onSubmit={handleEligibilityCheck} className="space-y-3">
                <h3 className="text-[15px] font-semibold text-neutral-100">Verify Medical Aid</h3>
                <input
                  value={eligMember} onChange={e => setEligMember(e.target.value)} placeholder="Member number"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <input
                  value={eligScheme} onChange={e => setEligScheme(e.target.value)} placeholder="Scheme (e.g. Discovery)"
                  className="w-full h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 h-8 rounded-lg border border-neutral-700 text-[13px] text-neutral-400 hover:bg-neutral-800 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 h-8 rounded-lg bg-neutral-100 text-neutral-900 text-[13px] font-medium hover:bg-neutral-200 transition-colors">Verify</button>
                </div>
                {eligResult && (
                  <div className="mt-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                    <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-40">
                      {JSON.stringify(eligResult, null, 2)}
                    </pre>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Agent Panel (slide-in right) ───────────────────────── */}
      {agentOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-full max-w-md z-40 border-l border-neutral-800 bg-neutral-900 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-neutral-700 flex items-center justify-center">
                <Bot className="w-3 h-3 text-neutral-400" />
              </div>
              <span className="text-[13px] font-semibold text-neutral-200">Front Desk Agent</span>
            </div>
            <button onClick={() => setAgentOpen(false)} className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded border border-neutral-800 hover:bg-neutral-800">close</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {agentMessages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-4 h-4 text-neutral-500" />
                </div>
                <p className="text-[13px] text-neutral-400 mb-1">Front Desk Agent</p>
                <p className="text-[11px] text-neutral-600 mb-4 font-mono">bookings, check-in, eligibility, recalls</p>
                <div className="space-y-1.5 max-w-xs mx-auto">
                  {["Who is waiting?", "Book a GP consult for tomorrow", "Check recall list", "Import today's bookings"].map(q => (
                    <button key={q} onClick={() => { setAgentInput(q); }} className="w-full text-left px-3 py-2 rounded-lg border border-neutral-800 text-[12px] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {agentMessages.map((msg, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="h-5 w-5 rounded-full border border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                  {msg.role === "user" ? (
                    <UserCheck className="w-2.5 h-2.5 text-neutral-400" />
                  ) : (
                    <Bot className="w-2.5 h-2.5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[13px] text-neutral-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.tools && msg.tools.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Wrench className="w-2.5 h-2.5 text-neutral-600" />
                      {msg.tools.map((t, j) => (
                        <span key={j} className="text-[9px] font-mono text-neutral-600 bg-neutral-800 px-1 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {agentLoading && (
              <div className="flex gap-2.5">
                <div className="h-5 w-5 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                  <Bot className="w-2.5 h-2.5 text-neutral-400" />
                </div>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500 mt-0.5" />
              </div>
            )}
            <div ref={agentEndRef} />
          </div>

          <div className="p-3 border-t border-neutral-800">
            <div className="flex gap-2">
              <input
                value={agentInput}
                onChange={e => setAgentInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAgentSend()}
                placeholder="Ask the front desk agent..."
                className="flex-1 h-8 px-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[13px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
              />
              <button onClick={handleAgentSend} disabled={!agentInput.trim() || agentLoading} className="h-8 px-3 rounded-lg bg-neutral-100 text-neutral-900 disabled:opacity-30 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] font-mono text-neutral-600 mt-1.5 px-1">front-desk-agent v1.0 | tools: practice, whatsapp, billing</p>
          </div>
        </div>
      )}
    </div>
  );
}
