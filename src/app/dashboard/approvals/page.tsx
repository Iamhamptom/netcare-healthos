"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Bell, Phone, MapPin,
  Calendar, User, MessageSquare, PhoneCall, Loader2, Sparkles,
} from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";

interface Booking {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  service: string;
  scheduledAt: string;
  status: string;
  source: string;
  notes: string;
  depositAmount: number;
  depositPaid: boolean;
  createdAt: string;
}

const sourceLabels: Record<string, string> = {
  public: "Online Booking",
  whatsapp: "WhatsApp",
  dashboard: "Staff",
  phone: "Phone Call",
};

export default function ApprovalsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<"pending" | "recent">("pending");
  const [callLoading, setCallLoading] = useState<string | null>(null);

  async function fetchBookings() {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => { fetchBookings(); }, []);

  const pending = bookings.filter(b => b.status === "pending").sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  const recent = bookings.filter(b => b.status !== "pending").slice(0, 20);
  const displayed = filter === "pending" ? pending : recent;

  async function handleApprove(id: string) {
    setActionLoading(id);
    await fetch(`/api/bookings/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    await fetchBookings();
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await fetch(`/api/bookings/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectReason }),
    });
    setRejectId(null);
    setRejectReason("");
    await fetchBookings();
    setActionLoading(null);
  }

  async function handleCall(booking: Booking) {
    setCallLoading(booking.id);
    const dateStr = new Date(booking.scheduledAt).toLocaleDateString("en-ZA", { weekday: "long", month: "long", day: "numeric" });
    const timeStr = new Date(booking.scheduledAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

    await fetch("/api/voice/call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: booking.patientPhone,
        message: `Hello ${booking.patientName}. This is a call from your healthcare practice to confirm your ${booking.service} appointment on ${dateStr} at ${timeStr}. `,
        bookingId: booking.id,
        patientName: booking.patientName,
      }),
    });
    setCallLoading(null);
  }

  function timeUntil(date: string): string {
    const diff = new Date(date).getTime() - Date.now();
    if (diff < 0) return "Past due";
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m away`;
    if (hours < 24) return `${hours}h away`;
    return `${Math.floor(hours / 24)}d away`;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Approvals</h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              {pending.length} pending {pending.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            filter === "pending" ? "bg-amber-500/10 text-amber-400" : "text-[var(--text-secondary)] hover:text-[var(--ivory)]"
          }`}
        >
          <Clock className="w-3 h-3" /> Pending ({pending.length})
        </button>
        <button
          onClick={() => setFilter("recent")}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === "recent" ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--ivory)]"
          }`}
        >
          Recent
        </button>
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={filter === "pending" ? Sparkles : Calendar}
          title={filter === "pending" ? "No pending bookings" : "No recent bookings"}
          description={filter === "pending" ? "All caught up! New bookings will appear here." : "Approved and rejected bookings will show here."}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl glass-panel overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Patient info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{booking.patientName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/60">
                        {sourceLabels[booking.source] || booking.source}
                      </span>
                    </div>

                    {/* Service + time */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.scheduledAt).toLocaleDateString("en-ZA", { weekday: "short", month: "short", day: "numeric" })}
                        {" "}
                        {new Date(booking.scheduledAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>{booking.service}</span>
                      {booking.patientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {booking.patientPhone}
                        </span>
                      )}
                    </div>

                    {/* Urgency indicator */}
                    {booking.status === "pending" && (
                      <div className="mt-2 text-[10px] font-medium text-amber-400/70">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {timeUntil(booking.scheduledAt)}
                      </div>
                    )}

                    {booking.notes && (
                      <p className="mt-2 text-xs text-white/70 italic">&quot;{booking.notes}&quot;</p>
                    )}

                    {booking.depositAmount > 0 && (
                      <div className="mt-2 text-[10px]">
                        <span className={booking.depositPaid ? "text-[#3DA9D1]" : "text-amber-400"}>
                          Deposit: R{booking.depositAmount} {booking.depositPaid ? "(Paid)" : "(Unpaid)"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {booking.status === "pending" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* AI Call button */}
                      {booking.patientPhone && (
                        <button
                          onClick={() => handleCall(booking)}
                          disabled={callLoading === booking.id}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="AI voice call to confirm"
                        >
                          {callLoading === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PhoneCall className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleApprove(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 rounded-lg bg-[#3DA9D1]/10 text-[#3DA9D1] hover:bg-[#3DA9D1]/20 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectId(booking.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className="text-xs px-2.5 py-1 rounded-full shrink-0"
                      style={{
                        backgroundColor: booking.status === "confirmed" ? "rgba(16,185,129,0.1)" : booking.status === "cancelled" ? "rgba(239,68,68,0.1)" : "rgba(14,165,233,0.1)",
                        color: booking.status === "confirmed" ? "#10b981" : booking.status === "cancelled" ? "#ef4444" : "#0ea5e9",
                      }}
                    >
                      {booking.status}
                    </span>
                  )}
                </div>

                {/* Reject reason input */}
                <AnimatePresence>
                  {rejectId === booking.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                        <input
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection (optional)"
                          className="flex-1 px-3 py-2 rounded-lg bg-[var(--charcoal)]/30 border border-white/10 text-xs text-white placeholder-white/60 focus:outline-none"
                        />
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30"
                        >
                          Confirm Reject
                        </button>
                        <button
                          onClick={() => { setRejectId(null); setRejectReason(""); }}
                          className="px-3 py-2 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
