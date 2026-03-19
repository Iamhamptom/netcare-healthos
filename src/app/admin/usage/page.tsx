"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Users, MessageSquare, Volume2, HardDrive,
  Calendar, Building2,
} from "lucide-react";

interface UsageRow {
  id: string;
  name: string;
  type: string;
  plan: string;
  planStatus: string;
  primaryColor: string;
  patients: number;
  bookingsThisMonth: number;
  revenue: number;
  mrr: number;
  aiConversations: number;
  whatsappMessages: number;
  voiceCalls: number;
  storageUsedMB: number;
}

export default function AdminUsagePage() {
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [sortBy, setSortBy] = useState<"patients" | "bookingsThisMonth" | "aiConversations" | "whatsappMessages">("patients");

  useEffect(() => {
    fetch("/api/admin/usage").then(r => r.json()).then(d => setUsage(d.usage || [])).catch(() => setUsage([]));
  }, []);

  const sorted = [...usage].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  const totals = usage.reduce((acc, u) => ({
    patients: acc.patients + u.patients,
    bookings: acc.bookings + u.bookingsThisMonth,
    aiConvos: acc.aiConvos + u.aiConversations,
    whatsapp: acc.whatsapp + u.whatsappMessages,
    voice: acc.voice + (u.voiceCalls || 0),
    storage: acc.storage + (u.storageUsedMB || 0),
  }), { patients: 0, bookings: 0, aiConvos: 0, whatsapp: 0, voice: 0, storage: 0 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 text-[#ef4444]" />
        <h2 className="text-lg font-semibold">Usage & Metrics</h2>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <UsageStat icon={Users} label="Total Patients" value={totals.patients} color="#2DD4BF" />
        <UsageStat icon={Calendar} label="Bookings/mo" value={totals.bookings} color="#D4AF37" />
        <UsageStat icon={MessageSquare} label="AI Conversations" value={totals.aiConvos} color="#8B5CF6" />
        <UsageStat icon={MessageSquare} label="WhatsApp Msgs" value={totals.whatsapp} color="#10b981" />
        <UsageStat icon={Volume2} label="Voice Calls" value={totals.voice} color="#E8C84A" />
        <UsageStat icon={HardDrive} label="Storage (MB)" value={totals.storage} color="#0ea5e9" />
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        <span className="text-[12px] text-[var(--text-tertiary)] mt-1.5">Sort by:</span>
        {[
          { key: "patients", label: "Patients" },
          { key: "bookingsThisMonth", label: "Bookings" },
          { key: "aiConversations", label: "AI Usage" },
          { key: "whatsappMessages", label: "WhatsApp" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key as typeof sortBy)}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${sortBy === s.key ? "bg-[#ef4444]/10 text-[#ef4444]" : "text-[var(--text-tertiary)] hover:text-[var(--ivory)]"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Usage table */}
      <div className="rounded-xl glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Practice</th>
                <th className="text-center px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Plan</th>
                <th className="text-right px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Patients</th>
                <th className="text-right px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Bookings</th>
                <th className="text-right px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">AI Convos</th>
                <th className="text-right px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">WhatsApp</th>
                <th className="text-right px-3 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Voice</th>
                <th className="text-right px-4 py-3 text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Storage</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--text-tertiary)] text-sm">No usage data yet</td></tr>
              )}
              {sorted.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: row.primaryColor || "#D4AF37" }}>
                        {row.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-[var(--ivory)]">{row.name}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{row.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-medium capitalize text-[var(--text-secondary)]">{row.plan}</span>
                  </td>
                  <td className="px-3 py-3 text-right text-[13px] text-[var(--ivory)]">{row.patients}</td>
                  <td className="px-3 py-3 text-right text-[13px] text-[var(--ivory)]">{row.bookingsThisMonth}</td>
                  <td className="px-3 py-3 text-right text-[13px] text-[var(--ivory)]">{row.aiConversations}</td>
                  <td className="px-3 py-3 text-right text-[13px] text-[var(--ivory)]">{row.whatsappMessages}</td>
                  <td className="px-3 py-3 text-right text-[13px] text-[var(--ivory)]">{row.voiceCalls ?? 0}</td>
                  <td className="px-4 py-3 text-right text-[13px] text-[var(--ivory)]">{row.storageUsedMB ?? 0}MB</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsageStat({ icon: Icon, label, value, color }: { icon: typeof Building2; label: string; value: number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-3 text-center">
      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
      <div className="text-lg font-bold text-[var(--ivory)]">{value.toLocaleString()}</div>
      <div className="text-[10px] text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}
