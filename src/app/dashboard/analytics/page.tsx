"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, CalendarCheck, Star, RotateCcw,
  FileText, Activity, TrendingUp, AlertTriangle,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

interface Analytics {
  patients: { total: number; active: number; newThisMonth: number };
  bookings: { total: number; today: number; pending: number; confirmed: number; cancelled: number; completed: number };
  topServices: { name: string; count: number }[];
  reviews: { total: number; avgRating: number; bySource: Record<string, number> };
  recall: { due: number; overdue: number };
  conversations: { total: number; active: number };
  records: { total: number; byType: Record<string, number> };
  vitals: { total: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="p-6 text-[var(--text-secondary)]">Loading analytics...</div>;

  const bookingRate = data.bookings.total > 0
    ? Math.round(((data.bookings.confirmed + data.bookings.completed) / data.bookings.total) * 100)
    : 0;

  const recallRate = (data.recall.due + data.recall.overdue) > 0
    ? Math.round((data.recall.due / (data.recall.due + data.recall.overdue)) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
        <h2 className="text-lg font-semibold">Practice Analytics</h2>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Total Patients" value={data.patients.total} icon={Users} color="#2DD4BF" delay={0} />
        <StatCard label="New This Month" value={data.patients.newThisMonth} icon={TrendingUp} color="#10b981" delay={0.05} />
        <StatCard label="Bookings Today" value={data.bookings.today} icon={CalendarCheck} color="#D4AF37" delay={0.1} />
        <StatCard label="Avg Rating" value={data.reviews.avgRating || "—"} icon={Star} color="#E8C84A" delay={0.15} />
        <StatCard label="Recall Due" value={data.recall.due} icon={RotateCcw} color="#D4AF37" delay={0.2} />
        <StatCard label="Medical Records" value={data.records.total} icon={FileText} color="#8B5CF6" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-[var(--teal)]" /> Booking Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Pending", value: data.bookings.pending, color: "#f59e0b" },
              { label: "Confirmed", value: data.bookings.confirmed, color: "#10b981" },
              { label: "Completed", value: data.bookings.completed, color: "#0ea5e9" },
              { label: "Cancelled", value: data.bookings.cancelled, color: "#ef4444" },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg bg-[var(--obsidian)]/40">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{item.label}</div>
                <div className="text-xl font-semibold mt-1" style={{ color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Confirmation rate:</span>
            <span className="font-semibold text-[var(--gold)]">{bookingRate}%</span>
          </div>
        </motion.div>

        {/* Top services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel rounded-xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[var(--gold)]" /> Top Services</h3>
          {data.topServices.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {data.topServices.map((svc, i) => {
                const maxCount = data.topServices[0].count;
                const pct = Math.round((svc.count / maxCount) * 100);
                return (
                  <div key={svc.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--ivory)]">{svc.name}</span>
                      <span className="text-[var(--text-secondary)]">{svc.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--obsidian)]/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="h-full rounded-full bg-[var(--gold)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Reviews by source */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel rounded-xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> Reviews by Source</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.reviews.bySource).map(([source, count]) => (
              <div key={source} className="p-3 rounded-lg bg-[var(--obsidian)]/40 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] capitalize">{source}</span>
                <span className="text-sm font-semibold text-[var(--ivory)]">{count}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            Total: {data.reviews.total} reviews · Avg: <span className="text-[var(--gold)] font-semibold">{data.reviews.avgRating}/5</span>
          </div>
        </motion.div>

        {/* Records by type */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass-panel rounded-xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-purple-400" /> Medical Records</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.records.byType).map(([type, count]) => (
              <div key={type} className="p-3 rounded-lg bg-[var(--obsidian)]/40 flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] capitalize">{type.replace("_", " ")}</span>
                <span className="text-sm font-semibold text-[var(--ivory)]">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span>Total records: <span className="font-semibold text-[var(--ivory)]">{data.records.total}</span></span>
            <span>Vitals logged: <span className="font-semibold text-[var(--ivory)]">{data.vitals.total}</span></span>
          </div>
        </motion.div>

        {/* Recall status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel rounded-xl p-5 space-y-4 lg:col-span-2"
        >
          <h3 className="text-sm font-semibold flex items-center gap-2"><RotateCcw className="w-4 h-4 text-purple-400" /> Recall & Follow-up</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[var(--obsidian)]/40 text-center">
              <div className="text-2xl font-semibold text-[var(--gold)]">{data.recall.due}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase mt-1">Pending</div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--obsidian)]/40 text-center">
              <div className="text-2xl font-semibold text-red-400">{data.recall.overdue}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase mt-1 flex items-center justify-center gap-1">
                {data.recall.overdue > 0 && <AlertTriangle className="w-3 h-3 text-red-400" />} Overdue
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--obsidian)]/40 text-center">
              <div className="text-2xl font-semibold text-[var(--teal)]">{recallRate}%</div>
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase mt-1">On-time Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
