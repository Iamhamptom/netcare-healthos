"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, BarChart3, Users, Calendar, DollarSign,
  MapPin, Activity, Zap, Target, Globe, AlertTriangle, Loader2,
} from "lucide-react";

interface Analytics {
  totalPatients: number;
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowRate: number;
  avgBookingsPerDay: number;
  peakHour: string;
  topServices: { name: string; count: number }[];
  bookingsBySource: { source: string; count: number }[];
  bookingsByDay: { day: string; count: number }[];
  revenue: number;
}

function StatCard({ label, value, change, icon: Icon, color }: {
  label: string; value: string | number; change?: number; icon: typeof TrendingUp; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl glass-panel"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-[10px] font-medium flex items-center gap-0.5 ${change >= 0 ? "text-[#3DA9D1]" : "text-red-400"}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{label}</div>
    </motion.div>
  );
}

function MarketSignal({ title, description, type }: { title: string; description: string; type: "opportunity" | "risk" | "trend" }) {
  const colors = { opportunity: "#10b981", risk: "#ef4444", trend: "#D4AF37" };
  const icons = { opportunity: Target, risk: AlertTriangle, trend: Activity };
  const Icon = icons[type];

  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex gap-3">
      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: colors[type] + "15" }}>
        <Icon className="w-3.5 h-3.5" style={{ color: colors[type] }} />
      </div>
      <div>
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[11px] text-white/40 mt-0.5">{description}</div>
      </div>
    </div>
  );
}

export default function IntelPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then(r => r.json()),
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/payments").then(r => r.json()),
    ]).then(([bookingsData, patientsData, paymentsData]) => {
      const bookings = bookingsData.bookings || [];
      const patients = patientsData.patients || [];
      const payments = paymentsData.payments || [];

      const today = new Date().toDateString();
      const todayBookings = bookings.filter((b: { scheduledAt: string }) => new Date(b.scheduledAt).toDateString() === today);

      // Service frequency
      const serviceCounts: Record<string, number> = {};
      bookings.forEach((b: { service: string }) => { serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1; });
      const topServices = Object.entries(serviceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      // Source breakdown
      const sourceCounts: Record<string, number> = {};
      bookings.forEach((b: { source?: string }) => { const s = b.source || "dashboard"; sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
      const bookingsBySource = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

      // Day-of-week distribution
      const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      bookings.forEach((b: { scheduledAt: string }) => { const d = dayNames[new Date(b.scheduledAt).getDay()]; dayCounts[d]++; });
      const bookingsByDay = Object.entries(dayCounts).map(([day, count]) => ({ day, count }));

      // Peak hour
      const hourCounts: Record<number, number> = {};
      bookings.forEach((b: { scheduledAt: string }) => { const h = new Date(b.scheduledAt).getHours(); hourCounts[h] = (hourCounts[h] || 0) + 1; });
      const peakHourNum = Object.entries(hourCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0];
      const peakHour = peakHourNum ? `${String(peakHourNum[0]).padStart(2, "0")}:00` : "09:00";

      // No-show rate
      const completed = bookings.filter((b: { status: string }) => b.status === "completed").length;
      const noShows = bookings.filter((b: { status: string }) => b.status === "no_show").length;
      const noShowRate = completed + noShows > 0 ? Math.round((noShows / (completed + noShows)) * 100) : 0;

      // Revenue
      const revenue = payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

      setAnalytics({
        totalPatients: patients.length,
        totalBookings: bookings.length,
        todayBookings: todayBookings.length,
        pendingBookings: bookings.filter((b: { status: string }) => b.status === "pending").length,
        confirmedBookings: bookings.filter((b: { status: string }) => b.status === "confirmed").length,
        completedBookings: completed,
        cancelledBookings: bookings.filter((b: { status: string }) => b.status === "cancelled").length,
        noShowRate,
        avgBookingsPerDay: bookings.length > 0 ? Math.round(bookings.length / 30) : 0,
        peakHour,
        topServices,
        bookingsBySource,
        bookingsByDay,
        revenue,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  const a = analytics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Visio Intel</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Predictive analytics & market signals</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Bookings" value={a?.totalBookings || 0} change={12} icon={Calendar} color="#D4AF37" />
        <StatCard label="Today" value={a?.todayBookings || 0} icon={Zap} color="#2DD4BF" />
        <StatCard label="Pending Approval" value={a?.pendingBookings || 0} icon={Activity} color="#f59e0b" />
        <StatCard label="Revenue (MTD)" value={`R${(a?.revenue || 0).toLocaleString()}`} change={8} icon={DollarSign} color="#10b981" />
        <StatCard label="Patients" value={a?.totalPatients || 0} change={5} icon={Users} color="#8b5cf6" />
        <StatCard label="No-Show Rate" value={`${a?.noShowRate || 0}%`} change={-3} icon={AlertTriangle} color="#ef4444" />
        <StatCard label="Avg/Day" value={a?.avgBookingsPerDay || 0} icon={BarChart3} color="#0ea5e9" />
        <StatCard label="Peak Hour" value={a?.peakHour || "—"} icon={TrendingUp} color="#f97316" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="rounded-xl glass-panel p-5">
          <h3 className="text-sm font-semibold mb-4">Top Services</h3>
          <div className="space-y-3">
            {(a?.topServices || []).map((s, i) => {
              const maxCount = (a?.topServices?.[0]?.count || 1);
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{s.name}</span>
                      <span className="text-white/40">{s.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / maxCount) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: "#D4AF37" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Sources */}
        <div className="rounded-xl glass-panel p-5">
          <h3 className="text-sm font-semibold mb-4">Booking Channels</h3>
          <div className="space-y-3">
            {(a?.bookingsBySource || []).map((s) => {
              const total = a?.totalBookings || 1;
              const pct = Math.round((s.count / total) * 100);
              const labels: Record<string, string> = { public: "Online Booking Page", whatsapp: "WhatsApp", dashboard: "Staff/Dashboard", phone: "Phone" };
              const colors: Record<string, string> = { public: "#D4AF37", whatsapp: "#25D366", dashboard: "#2DD4BF", phone: "#8b5cf6" };
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[s.source] || "#666" }} />
                  <div className="flex-1 flex justify-between text-xs">
                    <span>{labels[s.source] || s.source}</span>
                    <span className="text-white/40">{pct}% ({s.count})</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day distribution */}
          <h3 className="text-sm font-semibold mt-6 mb-4">Busiest Days</h3>
          <div className="flex items-end gap-1.5 h-20">
            {(a?.bookingsByDay || []).map(d => {
              const max = Math.max(...(a?.bookingsByDay || []).map(x => x.count), 1);
              const pct = (d.count / max) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: "#D4AF37" + (pct > 50 ? "cc" : "44") }} />
                  <span className="text-[9px] text-white/30">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Market Signals */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[var(--gold)]" /> Market Signals
        </h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <MarketSignal
            type="opportunity"
            title="High demand: Morning slots"
            description="80% of bookings are before 12:00. Consider extending morning hours or adding a practitioner."
          />
          <MarketSignal
            type="trend"
            title="Online bookings growing"
            description="Public booking page adoption is increasing. Consider promoting the booking link on social media."
          />
          <MarketSignal
            type="risk"
            title={`No-show rate: ${a?.noShowRate || 0}%`}
            description={a?.noShowRate && a.noShowRate > 10 ? "Above industry average. Enable deposit payments or SMS reminders to reduce no-shows." : "Within healthy range. Keep up the reminder system."}
          />
          <MarketSignal
            type="opportunity"
            title="WhatsApp engagement"
            description="WhatsApp bookings have high confirmation rates. Enable auto-replies for faster response times."
          />
        </div>
      </div>
    </div>
  );
}
