"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Plus, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";

interface Booking {
  id: string;
  patientName: string;
  service: string;
  scheduledAt: string;
  status: string;
  notes: string;
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
  completed: "#0ea5e9",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle,
  cancelled: XCircle,
  completed: CheckCircle,
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ patientName: "", service: "", scheduledAt: "", notes: "" });

  async function fetchBookings() {
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.bookings || []);
  }

  useEffect(() => { fetchBookings().catch(() => setError("Unable to load data. Check your connection.")).finally(() => setInitialLoading(false)); }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save. Please try again.");
        setLoading(false);
        return;
      }
      setForm({ patientName: "", service: "", scheduledAt: "", notes: "" });
      setModalOpen(false);
      await fetchBookings();
    } catch {
      setError("Failed to save. Please try again.");
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await fetchBookings();
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--teal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold">Bookings</h2>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "pending", "confirmed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--ivory)] hover:bg-[var(--charcoal)]/20"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings" description="Create a new booking to get started" />
      ) : (
        <div className="grid gap-3">
          {filtered.map((booking, i) => {
            const StatusIcon = statusIcons[booking.status] || Clock;
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl glass-panel flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${statusColors[booking.status]}15` }}
                  >
                    <StatusIcon className="w-4 h-4" style={{ color: statusColors[booking.status] }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{booking.patientName}</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {booking.service} — {new Date(booking.scheduledAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${statusColors[booking.status]}15`,
                      color: statusColors[booking.status],
                    }}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        className="text-xs px-3 py-1 bg-[var(--accent)]/10 text-[var(--teal)] rounded-lg hover:bg-[var(--accent)]/20"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Booking Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Booking">
        <form onSubmit={createBooking} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Service</label>
            <input
              type="text"
              required
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              placeholder="e.g. Cleaning, Consultation"
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] resize-none focus:outline-none focus:border-[var(--primary)]/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Booking
          </button>
        </form>
      </Modal>
    </div>
  );
}
