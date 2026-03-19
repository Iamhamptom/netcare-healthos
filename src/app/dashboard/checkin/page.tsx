"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, Clock, Stethoscope, LogOut as LogOutIcon,
  AlertTriangle, Plus, Search, ChevronRight,
} from "lucide-react";

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

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  waiting: { label: "Waiting", color: "#E8C84A", bg: "rgba(232,200,74,0.1)", icon: Clock },
  in_consultation: { label: "With Doctor", color: "#2DD4BF", bg: "rgba(45,212,191,0.1)", icon: Stethoscope },
  checked_out: { label: "Checked Out", color: "rgba(253,252,240,0.3)", bg: "rgba(255,255,255,0.03)", icon: LogOutIcon },
  no_show: { label: "No Show", color: "#8A0303", bg: "rgba(138,3,3,0.1)", icon: AlertTriangle },
};

function timeSince(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "Just arrived";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function CheckInPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/checkin").then(r => r.json()).then(d => setCheckIns(d.checkIns || []));
  }, []);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: name.trim(), notes: notes.trim() }),
    });
    const data = await res.json();
    setCheckIns(prev => [...prev, data.checkIn]);
    setName("");
    setNotes("");
    setShowAdd(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/checkin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setCheckIns(prev => prev.map(ci =>
      ci.id === id ? { ...ci, status, seenAt: status === "in_consultation" ? new Date().toISOString() : ci.seenAt, leftAt: status === "checked_out" ? new Date().toISOString() : ci.leftAt } : ci
    ));
  }

  const waiting = checkIns.filter(c => c.status === "waiting");
  const withDoctor = checkIns.filter(c => c.status === "in_consultation");
  const done = checkIns.filter(c => c.status === "checked_out" || c.status === "no_show");
  const filtered = search
    ? checkIns.filter(c => c.patientName.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="text-lg font-semibold">Patient Check-In</h2>
          <span className="text-xs text-[var(--text-tertiary)] ml-2">
            {waiting.length} waiting &middot; {withDoctor.length} with doctor
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/30 w-48"
            />
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Check In Patient
          </button>
        </div>
      </div>

      {/* Add patient form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCheckIn}
            className="rounded-xl glass-panel p-5 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-[var(--ivory)]">Check In New Patient</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Patient name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/30"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/30"
              />
            </div>
            <button type="submit" className="px-5 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">
              Confirm Arrival
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search results */}
      {filtered ? (
        <div className="rounded-xl glass-panel overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">Search results: {filtered.length}</span>
          </div>
          {filtered.map(ci => <CheckInRow key={ci.id} ci={ci} onUpdate={updateStatus} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Waiting column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Clock className="w-4 h-4 text-[#E8C84A]" />
              <span className="text-[13px] font-semibold text-[var(--ivory)]">Waiting Room</span>
              <span className="text-[11px] bg-[#E8C84A]/10 text-[#E8C84A] px-2 py-0.5 rounded-full font-medium">{waiting.length}</span>
            </div>
            {waiting.map(ci => <CheckInCard key={ci.id} ci={ci} onUpdate={updateStatus} />)}
            {waiting.length === 0 && (
              <div className="rounded-xl glass-panel p-6 text-center text-[13px] text-[var(--text-tertiary)]">
                No patients waiting
              </div>
            )}
          </div>

          {/* With Doctor column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Stethoscope className="w-4 h-4 text-[var(--teal)]" />
              <span className="text-[13px] font-semibold text-[var(--ivory)]">In Consultation</span>
              <span className="text-[11px] bg-[var(--teal)]/10 text-[var(--teal)] px-2 py-0.5 rounded-full font-medium">{withDoctor.length}</span>
            </div>
            {withDoctor.map(ci => <CheckInCard key={ci.id} ci={ci} onUpdate={updateStatus} />)}
            {withDoctor.length === 0 && (
              <div className="rounded-xl glass-panel p-6 text-center text-[13px] text-[var(--text-tertiary)]">
                No patients in consultation
              </div>
            )}
          </div>

          {/* Completed column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <UserCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[13px] font-semibold text-[var(--ivory)]">Done Today</span>
              <span className="text-[11px] bg-white/5 text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-medium">{done.length}</span>
            </div>
            {done.map(ci => <CheckInCard key={ci.id} ci={ci} onUpdate={updateStatus} />)}
            {done.length === 0 && (
              <div className="rounded-xl glass-panel p-6 text-center text-[13px] text-[var(--text-tertiary)]">
                No patients checked out yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckInCard({ ci, onUpdate }: { ci: CheckIn; onUpdate: (id: string, status: string) => void }) {
  const cfg = statusConfig[ci.status] || statusConfig.waiting;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl glass-panel p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-semibold text-[var(--ivory)]">{ci.patientName}</div>
          <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            Arrived {timeSince(ci.arrivedAt)}
            {ci.seenAt && ` · Seen ${timeSince(ci.seenAt)}`}
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
          {cfg.label}
        </span>
      </div>
      {ci.notes && (
        <p className="text-[12px] text-[var(--text-secondary)] bg-white/3 rounded-lg p-2">{ci.notes}</p>
      )}
      <div className="flex gap-2">
        {ci.status === "waiting" && (
          <>
            <button onClick={() => onUpdate(ci.id, "in_consultation")} className="flex-1 text-[11px] py-1.5 rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] font-medium hover:bg-[var(--teal)]/20 flex items-center justify-center gap-1">
              <Stethoscope className="w-3 h-3" /> See Patient
            </button>
            <button onClick={() => onUpdate(ci.id, "no_show")} className="text-[11px] py-1.5 px-3 rounded-lg bg-white/5 text-[var(--text-tertiary)] hover:text-[var(--crimson)] hover:bg-[var(--crimson)]/10">
              No Show
            </button>
          </>
        )}
        {ci.status === "in_consultation" && (
          <button onClick={() => onUpdate(ci.id, "checked_out")} className="flex-1 text-[11px] py-1.5 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] font-medium hover:bg-[var(--gold)]/20 flex items-center justify-center gap-1">
            <ChevronRight className="w-3 h-3" /> Check Out
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CheckInRow({ ci, onUpdate }: { ci: CheckIn; onUpdate: (id: string, status: string) => void }) {
  const cfg = statusConfig[ci.status] || statusConfig.waiting;
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--border)] last:border-0">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
        {ci.patientName.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-[var(--ivory)]">{ci.patientName}</div>
        <div className="text-[11px] text-[var(--text-tertiary)]">{timeSince(ci.arrivedAt)} · {cfg.label}</div>
      </div>
      <div className="flex gap-2">
        {ci.status === "waiting" && (
          <button onClick={() => onUpdate(ci.id, "in_consultation")} className="text-[11px] px-3 py-1.5 rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] font-medium">
            See
          </button>
        )}
        {ci.status === "in_consultation" && (
          <button onClick={() => onUpdate(ci.id, "checked_out")} className="text-[11px] px-3 py-1.5 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] font-medium">
            Check Out
          </button>
        )}
      </div>
    </div>
  );
}
