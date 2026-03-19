"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import Modal from "@/components/dashboard/Modal";

interface CalendarBooking {
  id: string;
  patientName: string;
  service: string;
  scheduledAt: string;
  status: string;
  color: string;
}

interface CalendarSlot {
  date: string;
  time: string;
  available: boolean;
}

type ViewMode = "week" | "day";

export default function CalendarPage() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [form, setForm] = useState({ patientName: "", service: "", notes: "" });

  async function fetchCalendar() {
    const start = getWeekStart(currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (view === "week" ? 6 : 0));
    end.setHours(23, 59, 59);

    const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}&view=${view}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setSlots(data.slots || []);
  }

  useEffect(() => { fetchCalendar(); }, [currentDate, view]);

  function navigate(dir: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === "week" ? 7 * dir : dir));
    setCurrentDate(d);
  }

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(): Date[] {
    const start = getWeekStart(currentDate);
    return Array.from({ length: view === "week" ? 7 : 1 }, (_, i) => {
      const d = new Date(start);
      if (view === "day") {
        return new Date(currentDate);
      }
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  const hours = Array.from({ length: 18 }, (_, i) => i + 8).filter(h => h < 17); // 8:00-16:30
  const days = getWeekDays();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function getBookingsForSlot(date: Date, hour: number, min: number): CalendarBooking[] {
    return bookings.filter(b => {
      const d = new Date(b.scheduledAt);
      return d.toDateString() === date.toDateString() && d.getHours() === hour && d.getMinutes() === min;
    });
  }

  function isSlotAvailable(date: Date, hour: number, min: number): boolean {
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    return slots.some(s => s.date === dateStr && s.time === timeStr && s.available);
  }

  function handleSlotClick(date: Date, hour: number, min: number) {
    if (!isSlotAvailable(date, hour, min)) return;
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    setSelectedSlot({ date: dateStr, time: timeStr });
    setModalOpen(true);
  }

  async function createBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setLoading(true);
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scheduledAt: `${selectedSlot.date}T${selectedSlot.time}:00`,
      }),
    });
    setForm({ patientName: "", service: "", notes: "" });
    setModalOpen(false);
    setSelectedSlot(null);
    await fetchCalendar();
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="text-lg font-semibold">Schedule</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(["day", "week"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  view === v ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--ivory)]"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[var(--charcoal)]/30 transition-colors">
              <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-medium text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-lg transition-colors">
              Today
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-[var(--charcoal)]/30 transition-colors">
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
          <span className="text-sm font-medium text-[var(--ivory)]">
            {currentDate.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto glass-panel rounded-xl">
        <div className="min-w-[600px]">
          {/* Day headers */}
          <div className="grid sticky top-0 z-10 bg-[var(--charcoal)]/80 backdrop-blur border-b border-[var(--border)]" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
            <div className="p-2" />
            {days.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`p-2 text-center border-l border-[var(--border)] ${isToday ? "bg-[var(--gold)]/5" : ""}`}>
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase">{dayNames[day.getDay() === 0 ? 6 : day.getDay() - 1]}</div>
                  <div className={`text-sm font-semibold ${isToday ? "text-[var(--gold)]" : "text-[var(--ivory)]"}`}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {hours.map(hour => (
            <div key={hour}>
              {[0, 30].map(min => (
                <div key={`${hour}-${min}`} className="grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
                  <div className="p-1 text-[10px] text-[var(--text-tertiary)] text-right pr-2 border-r border-[var(--border)]">
                    {min === 0 ? `${String(hour).padStart(2, "0")}:00` : ""}
                  </div>
                  {days.map((day, di) => {
                    const slotBookings = getBookingsForSlot(day, hour, min);
                    const available = isSlotAvailable(day, hour, min);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={di}
                        onClick={() => handleSlotClick(day, hour, min)}
                        className={`min-h-[32px] border-l border-b border-[var(--border)] p-0.5 transition-colors ${
                          isToday ? "bg-[var(--gold)]/[0.02]" : ""
                        } ${available ? "cursor-pointer hover:bg-[var(--gold)]/5" : ""}`}
                      >
                        {slotBookings.map(b => (
                          <motion.div
                            key={b.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                            style={{ backgroundColor: `${b.color}20`, color: b.color }}
                          >
                            {b.patientName} — {b.service}
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Quick book modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedSlot(null); }} title={`Book — ${selectedSlot?.date} at ${selectedSlot?.time}`}>
        <form onSubmit={createBooking} className="space-y-4">
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Patient Name *</label><input type="text" required value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} className="input-glass" /></div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Service *</label><input type="text" required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="e.g. Cleaning, Consultation" className="input-glass" /></div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="input-glass" /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Book Appointment
          </button>
        </form>
      </Modal>
    </div>
  );
}
