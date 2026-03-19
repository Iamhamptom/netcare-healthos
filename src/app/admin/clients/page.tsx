"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Search, DollarSign, TrendingUp, AlertTriangle, Plus, X,
  Phone, Mail, MapPin, Clock, ChevronRight,
} from "lucide-react";

interface Client {
  id: string;
  practiceName: string;
  doctorName: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  stage: string;
  planTier: string;
  monthlyValue: number;
  source: string;
  assignedTo: string;
  nextAction: string;
  nextActionDue: string | null;
  lastContactAt: string | null;
  lastContactMethod: string;
  createdAt: string;
}

interface Stats {
  totalValue: number;
  countByStage: Record<string, number>;
}

const STAGES = [
  { value: "lead", label: "Lead", color: "#94a3b8" },
  { value: "contacted", label: "Contacted", color: "#60a5fa" },
  { value: "demo_scheduled", label: "Demo Scheduled", color: "#a78bfa" },
  { value: "proposal_sent", label: "Proposal Sent", color: "#E8C84A" },
  { value: "won", label: "Won", color: "#10b981" },
  { value: "onboarding", label: "Onboarding", color: "#2DD4BF" },
  { value: "active", label: "Active", color: "#22c55e" },
  { value: "at_risk", label: "At Risk", color: "#ef4444" },
  { value: "churned", label: "Churned", color: "#6b7280" },
];

const stageMap = Object.fromEntries(STAGES.map(s => [s.value, s]));

function stageBadge(stage: string) {
  const s = stageMap[stage] || { label: stage, color: "#94a3b8" };
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ color: s.color, backgroundColor: `${s.color}15` }}
    >
      {s.label}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
}

function formatCurrency(v: number) {
  if (v >= 1000000) return `R${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R${(v / 1000).toFixed(0)}k`;
  return `R${v}`;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats>({ totalValue: 0, countByStage: {} });
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    practiceName: "", doctorName: "", specialty: "", location: "",
    phone: "", email: "", planTier: "professional", monthlyValue: 35000,
    source: "", assignedTo: "Dr. Hampton", nextAction: "",
  });

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStage !== "all") params.set("stage", filterStage);
    if (filterPlan !== "all") params.set("planTier", filterPlan);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/clients?${params}`);
    const data = await res.json();
    setClients(data.clients || []);
    setStats(data.stats || { totalValue: 0, countByStage: {} });
  }, [filterStage, filterPlan, search]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ practiceName: "", doctorName: "", specialty: "", location: "", phone: "", email: "", planTier: "professional", monthlyValue: 35000, source: "", assignedTo: "Dr. Hampton", nextAction: "" });
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  const activeCount = (stats.countByStage?.active || 0) + (stats.countByStage?.onboarding || 0);
  const totalLeads = Object.values(stats.countByStage || {}).reduce((a, b) => a + b, 0);
  const wonCount = (stats.countByStage?.won || 0) + (stats.countByStage?.onboarding || 0) + (stats.countByStage?.active || 0);
  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
  const needingAction = clients.filter(c => {
    if (!c.nextActionDue) return false;
    return new Date(c.nextActionDue) <= new Date();
  }).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">Client Pipeline</h2>
          <span className="text-[13px] text-[var(--text-tertiary)]">{clients.length} clients</span>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20 transition-colors"
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? "Cancel" : "Add Client"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#E8C84A]" />
            <span className="text-[11px] text-[var(--text-tertiary)]">Total Pipeline Value</span>
          </div>
          <div className="text-[20px] font-bold text-[var(--ivory)]">{formatCurrency(stats.totalValue)}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">/month potential</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#22c55e]" />
            <span className="text-[11px] text-[var(--text-tertiary)]">Active Clients</span>
          </div>
          <div className="text-[20px] font-bold text-[#22c55e]">{activeCount}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">onboarding + live</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#a78bfa]" />
            <span className="text-[11px] text-[var(--text-tertiary)]">Conversion Rate</span>
          </div>
          <div className="text-[20px] font-bold text-[var(--ivory)]">{conversionRate}%</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">lead → won+</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
            <span className="text-[11px] text-[var(--text-tertiary)]">Needing Action</span>
          </div>
          <div className="text-[20px] font-bold text-[#ef4444]">{needingAction}</div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">overdue next action</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search doctors, practices, specialties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
          />
        </div>
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none"
        >
          <option value="all">All Stages</option>
          {STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label} ({stats.countByStage?.[s.value] || 0})</option>
          ))}
        </select>
        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Add Client Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="rounded-xl glass-panel p-5 space-y-4"
          >
            <div className="text-[13px] font-semibold text-[var(--ivory)] mb-2">New Client</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                required
                placeholder="Doctor Name *"
                value={form.doctorName}
                onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                required
                placeholder="Practice Name *"
                value={form.practiceName}
                onChange={e => setForm(f => ({ ...f, practiceName: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                placeholder="Specialty"
                value={form.specialty}
                onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                placeholder="Source (e.g. outbound)"
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <input
                placeholder="Next Action"
                value={form.nextAction}
                onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[#10b981]/30"
              />
              <select
                value={form.planTier}
                onChange={e => setForm(f => ({ ...f, planTier: e.target.value }))}
                className="px-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none"
              >
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-[12px] font-medium bg-[#10b981] text-white hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add to Pipeline"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Client List */}
      <div className="space-y-2">
        {clients.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/admin/clients/${c.id}`}
              className="block rounded-xl glass-panel p-4 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Stage indicator */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stageMap[c.stage]?.color || "#94a3b8" }}
                />

                {/* Doctor + Practice */}
                <div className="min-w-[200px] flex-1">
                  <div className="text-[13px] font-semibold text-[var(--ivory)] group-hover:text-[#10b981] transition-colors">
                    {c.doctorName}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{c.practiceName}</div>
                </div>

                {/* Specialty + Location */}
                <div className="hidden md:block min-w-[160px]">
                  <div className="text-[11px] text-[var(--text-secondary)]">{c.specialty || "—"}</div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    <MapPin className="w-3 h-3" /> {c.location || "—"}
                  </div>
                </div>

                {/* Stage */}
                <div className="min-w-[110px]">
                  {stageBadge(c.stage)}
                </div>

                {/* Plan + Value */}
                <div className="hidden lg:block min-w-[100px] text-right">
                  <div className="text-[12px] font-semibold text-[var(--ivory)]">R{c.monthlyValue.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{c.planTier}</div>
                </div>

                {/* Last Contact */}
                <div className="hidden lg:block min-w-[90px] text-right">
                  <div className="text-[11px] text-[var(--text-secondary)]">{formatDate(c.lastContactAt)}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{c.lastContactMethod || "no contact"}</div>
                </div>

                {/* Next Action */}
                <div className="hidden xl:block min-w-[160px]">
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">{c.nextAction || "—"}</div>
                  {c.nextActionDue && (
                    <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                      <Clock className="w-3 h-3" /> Due {formatDate(c.nextActionDue)}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[#10b981] transition-colors shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-20 text-[var(--text-tertiary)]">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No clients match your filters</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 text-[12px] text-[#10b981] hover:underline"
          >
            Add your first client
          </button>
        </div>
      )}
    </div>
  );
}
