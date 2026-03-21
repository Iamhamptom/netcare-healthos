"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Calendar, Clock, User, Phone, Mail, ChevronLeft,
  ChevronRight, Check, MapPin, CreditCard, Loader2, AlertCircle, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────

interface PracticeInfo {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  hours: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  logoUrl: string;
  bookingServices: { name: string; duration: number; price: number }[];
  bookingWelcomeMsg: string;
  bookingDepositEnabled: boolean;
  bookingDepositAmount: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

type Step = "service" | "date" | "time" | "details" | "confirm" | "done";

const STEPS: Step[] = ["service", "date", "time", "details", "confirm", "done"];

// ─── Component ────────────────────────────────────────

export default function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [practice, setPractice] = useState<PracticeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("service");
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Form state
  const [selectedService, setSelectedService] = useState<PracticeInfo["bookingServices"][0] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [leadSource, setLeadSource] = useState("");

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  // Resolve params + capture lead source from URL
  useEffect(() => {
    params.then(p => setSlug(p.slug));
    // Capture UTM/lead source from URL: ?src=google_ads or ?utm_source=google
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const src = sp.get("src") || sp.get("utm_source") || sp.get("ref") || "";
      if (src) setLeadSource(src);
    }
  }, [params]);

  // Fetch practice info
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/availability?slug=${slug}&info=true`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setPractice(data.practice);
        setLoading(false);
      })
      .catch(() => { setError("Unable to load booking page"); setLoading(false); });
  }, [slug]);

  // Fetch slots when date changes
  const fetchSlots = useCallback(async (date: string) => {
    if (!practice) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/public/availability?slug=${slug}&date=${date}&duration=${selectedService?.duration || 30}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch { setSlots([]); }
    setLoadingSlots(false);
  }, [practice, slug, selectedService]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  // Submit booking
  async function handleSubmit() {
    if (!practice || !selectedService) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          service: selectedService.name,
          date: selectedDate,
          time: selectedTime,
          patientName: form.name,
          patientPhone: form.phone,
          patientEmail: form.email,
          notes: form.notes,
          leadSource,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSubmitting(false); return; }
      setBookingRef(data.bookingId);
      setStep("done");
    } catch {
      setError("Booking failed. Please try again.");
    }
    setSubmitting(false);
  }

  const stepIndex = STEPS.indexOf(step);
  const canGoBack = stepIndex > 0 && step !== "done";

  // ─── Render ───────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (error && !practice) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!practice) return null;
  const pc = practice.primaryColor || "#D4AF37";

  // Calendar generation
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {practice.logoUrl ? (
              <img src={practice.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc + "20" }}>
                <HeartPulse className="w-4 h-4" style={{ color: pc }} />
              </div>
            )}
            <div>
              <h1 className="text-sm font-semibold">{practice.name}</h1>
              <p className="text-[10px] text-white/60">{practice.tagline || `${practice.type} practice`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <MapPin className="w-3 h-3" />
            <span className="hidden sm:inline">{practice.address}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-1 mb-8">
            {STEPS.filter(s => s !== "done").map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    STEPS.indexOf(s) < stepIndex ? "scale-100" : STEPS.indexOf(s) === stepIndex ? "scale-125" : "scale-75 opacity-30"
                  }`}
                  style={{ backgroundColor: STEPS.indexOf(s) <= stepIndex ? pc : "rgba(255,255,255,0.2)" }}
                />
                {i < 4 && <div className="w-8 h-px" style={{ backgroundColor: STEPS.indexOf(s) < stepIndex ? pc + "60" : "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Back button */}
        {canGoBack && (
          <button
            onClick={() => setStep(STEPS[stepIndex - 1])}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white/70 mb-6 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}

        {/* Error banner */}
        <AnimatePresence>
          {error && step !== "done" && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Service Selection ── */}
          {step === "service" && (
            <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {practice.bookingWelcomeMsg && (
                <p className="text-sm text-white/50 mb-6">{practice.bookingWelcomeMsg}</p>
              )}
              <h2 className="text-lg font-semibold mb-4">Select a service</h2>
              <div className="grid gap-3">
                {(practice.bookingServices.length > 0 ? practice.bookingServices : [
                  { name: "Consultation", duration: 30, price: 0 },
                  { name: "Check-up", duration: 30, price: 0 },
                  { name: "Follow-up", duration: 15, price: 0 },
                ]).map((service) => (
                  <button
                    key={service.name}
                    onClick={() => { setSelectedService(service); setStep("date"); }}
                    className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium group-hover:text-white transition-colors">{service.name}</div>
                        <div className="text-xs text-white/60 mt-0.5">{service.duration} min</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {service.price > 0 && (
                          <span className="text-xs font-medium" style={{ color: pc }}>R{service.price}</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-white/70 group-hover:text-white/50 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Date Selection (Calendar) ── */}
          {step === "date" && (
            <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold mb-4">Pick a date</h2>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                      else setCalMonth(calMonth - 1);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white/70"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">
                    {new Date(calYear, calMonth).toLocaleString("en-ZA", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => {
                      if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                      else setCalMonth(calMonth + 1);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white/70"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="text-center text-[10px] text-white/70 py-1">{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(calYear, calMonth, day);
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isPast = date < today;
                    const isSunday = date.getDay() === 0;
                    const isSelected = selectedDate === dateStr;
                    const isDisabled = isPast || isSunday;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); setStep("time"); }}
                        className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "text-black font-semibold scale-105"
                            : isDisabled
                              ? "text-white/60 cursor-not-allowed"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                        style={isSelected ? { backgroundColor: pc } : undefined}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Time Selection ── */}
          {step === "time" && (
            <motion.div key="time" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold mb-1">Pick a time</h2>
              <p className="text-xs text-white/60 mb-4">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "long", month: "long", day: "numeric" })}
              </p>

              {loadingSlots ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: pc }} />
                </div>
              ) : slots.filter(s => s.available).length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-white/70 mx-auto mb-2" />
                  <p className="text-sm text-white/60">No available slots on this date</p>
                  <button onClick={() => setStep("date")} className="mt-3 text-xs hover:underline" style={{ color: pc }}>
                    Choose another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.filter(s => s.available).map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => { setSelectedTime(slot.time); setStep("details"); }}
                      className={`py-2.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedTime === slot.time
                          ? "border-transparent text-black"
                          : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                      style={selectedTime === slot.time ? { backgroundColor: pc } : undefined}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 4: Patient Details ── */}
          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold mb-4">Your details</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
                    <User className="w-3 h-3" /> Full Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/30"
                    placeholder="e.g. Thandi Molefe"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
                    <Phone className="w-3 h-3" /> WhatsApp / Phone *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/30"
                    placeholder="+27 82 123 4567"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
                    <Mail className="w-3 h-3" /> Email (optional)
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/30"
                    placeholder="thandi@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/30 resize-none"
                    placeholder="Any concerns or special requirements..."
                  />
                </div>
                <button
                  onClick={() => {
                    if (!form.name || !form.phone) { setError("Name and phone are required"); return; }
                    setError("");
                    setStep("confirm");
                  }}
                  className="w-full py-3 rounded-lg text-sm font-semibold text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: pc }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Confirmation ── */}
          {step === "confirm" && selectedService && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold mb-4">Confirm your booking</h2>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Service</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Date</span>
                  <span className="font-medium">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "short", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Duration</span>
                  <span className="font-medium">{selectedService.duration} min</span>
                </div>
                {selectedService.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Price</span>
                    <span className="font-medium" style={{ color: pc }}>R{selectedService.price}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Name</span>
                    <span className="font-medium">{form.name}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-white/50">Phone</span>
                    <span className="font-medium">{form.phone}</span>
                  </div>
                  {form.email && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-white/50">Email</span>
                      <span className="font-medium">{form.email}</span>
                    </div>
                  )}
                </div>

                {practice.bookingDepositEnabled && practice.bookingDepositAmount > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-400/5 p-3 rounded-lg">
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>A deposit of R{practice.bookingDepositAmount} may be required to confirm.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-white/70 flex items-start gap-2">
                <Clock className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Your booking will be pending until confirmed by the practice. You&apos;ll receive a WhatsApp confirmation.</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-4 py-3 rounded-lg text-sm font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: pc }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </motion.div>
          )}

          {/* ── Step 6: Done ── */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: pc + "20" }}
              >
                <Sparkles className="w-7 h-7" style={{ color: pc }} />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">Booking Submitted!</h2>
              <p className="text-sm text-white/50 max-w-sm mx-auto mb-6">
                Your appointment request has been sent to {practice.name}. You&apos;ll receive a WhatsApp confirmation once it&apos;s approved.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 max-w-xs mx-auto text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Reference</span>
                  <span className="font-mono text-white/70">{bookingRef?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Status</span>
                  <span className="text-amber-400 font-medium">Pending Confirmation</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center gap-3">
                <a href={`tel:${practice.phone}`} className="text-xs hover:underline" style={{ color: pc }}>
                  Call {practice.phone}
                </a>
                <button
                  onClick={() => {
                    setStep("service");
                    setSelectedService(null);
                    setSelectedDate("");
                    setSelectedTime("");
                    setForm({ name: "", phone: "", email: "", notes: "" });
                    setBookingRef("");
                    setError("");
                  }}
                  className="text-xs text-white/70 hover:text-white/50"
                >
                  Book another appointment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-[10px] text-white/70">Powered by Netcare Health OS Ops</p>
      </footer>
    </div>
  );
}
