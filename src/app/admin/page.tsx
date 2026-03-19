"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, CalendarCheck, DollarSign,
  TrendingUp, Activity, ArrowUpRight, Clock,
  Target, Phone, ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface PipelineClient {
  id: string;
  practiceName: string;
  doctorName: string;
  specialty: string;
  phone: string;
  stage: string;
  planTier: string;
  monthlyValue: number;
  nextAction: string;
  nextActionDue: string | null;
}

interface Overview {
  totalPractices: number;
  activePractices: number;
  trialPractices: number;
  totalPatients: number;
  totalBookings: number;
  totalRevenue: number;
  totalMRR: number;
}

interface RecentSignup {
  id: string;
  name: string;
  type: string;
  plan: string;
  planStatus: string;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byPlan, setByPlan] = useState<Record<string, number>>({});
  const [byType, setByType] = useState<Record<string, number>>({});
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [pipeline, setPipeline] = useState<PipelineClient[]>([]);
  const [pipelineStats, setPipelineStats] = useState<{ totalValue: number; countByStage: Record<string, number> }>({ totalValue: 0, countByStage: {} });

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => {
      setOverview(d.overview || null);
      setByPlan(d.byPlan || {});
      setByType(d.byType || {});
      setRecentSignups(d.recentSignups || []);
    });
    fetch("/api/admin/clients").then(r => r.json()).then(d => {
      setPipeline(d.clients || []);
      setPipelineStats(d.stats || { totalValue: 0, countByStage: {} });
    }).catch(() => {});
  }, []);

  const planColors: Record<string, string> = {
    starter: "#E8C84A",
    professional: "#2DD4BF",
    enterprise: "#8B5CF6",
  };

  const statusColors: Record<string, string> = {
    active: "#10b981",
    trial: "#E8C84A",
    past_due: "#ef4444",
    cancelled: "#8A0303",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ivory)]">Platform Overview</h1>
        <p className="text-[13px] text-[var(--text-tertiary)] mt-1">All practices, revenue, and usage across Netcare Health OS Ops</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminKPI icon={Building2} label="Total Practices" value={overview?.totalPractices ?? 0} color="#D4AF37" />
        <AdminKPI icon={Users} label="Total Patients" value={overview?.totalPatients ?? 0} color="#2DD4BF" />
        <AdminKPI icon={DollarSign} label="Platform MRR" value={`R${(overview?.totalMRR ?? 0).toLocaleString()}`} color="#10b981" />
        <AdminKPI icon={TrendingUp} label="Total Revenue" value={`R${(overview?.totalRevenue ?? 0).toLocaleString()}`} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminKPI icon={Activity} label="Active Practices" value={overview?.activePractices ?? 0} color="#10b981" />
        <AdminKPI icon={Clock} label="On Trial" value={overview?.trialPractices ?? 0} color="#E8C84A" />
        <AdminKPI icon={CalendarCheck} label="Total Bookings" value={overview?.totalBookings ?? 0} color="#D4AF37" />
        <AdminKPI icon={ArrowUpRight} label="Avg Revenue/Practice" value={`R${overview && overview.totalPractices > 0 ? Math.round(overview.totalRevenue / overview.totalPractices).toLocaleString() : 0}`} color="#0ea5e9" />
      </div>

      {/* R1M MRR Target Tracker */}
      {(() => {
        const TARGET_MRR = 1000000;
        const TARGET_CLIENTS = 20;
        const activeClients = pipeline.filter(c => c.stage === "active").length;
        const activeMRR = pipeline.filter(c => c.stage === "active").reduce((s, c) => s + c.monthlyValue, 0);
        const pipelineTotal = pipeline.length;
        const leadsToContact = pipeline.filter(c => c.stage === "lead").length;
        const inProgress = pipeline.filter(c => !["lead", "active", "churned"].includes(c.stage)).length;
        const progressPct = Math.min(100, Math.round((activeMRR / TARGET_MRR) * 100));

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-[14px] font-semibold text-[var(--ivory)]">R1M MRR Target</h2>
              </div>
              <Link href="/admin/clients" className="text-[11px] text-[var(--gold)] hover:underline flex items-center gap-1">
                Full Pipeline <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8B5CF6]">{activeClients}/{TARGET_CLIENTS}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Active Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#10b981]">R{activeMRR.toLocaleString()}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Current MRR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E8C84A]">{leadsToContact}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Leads to Contact</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2DD4BF]">{inProgress}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">In Progress</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mb-1">
                <span>R{activeMRR.toLocaleString()} / R{TARGET_MRR.toLocaleString()}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-3 bg-[var(--obsidian)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #8B5CF6, #10b981)" }}
                />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {TARGET_CLIENTS - activeClients} more clients at R50K avg to hit R1M MRR. {pipelineTotal} total in pipeline.
            </p>
          </motion.div>
        );
      })()}

      {/* Leads Ready for Outreach */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-[13px] font-semibold text-[var(--ivory)]">Ready to Outreach</h3>
          </div>
          <Link href="/admin/clients" className="text-[11px] text-[var(--gold)] hover:underline">View All</Link>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {pipeline.filter(c => c.stage === "lead").slice(0, 10).map((client) => (
            <Link key={client.id} href={`/admin/clients/${client.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--obsidian)]/50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[10px] font-bold text-[#8B5CF6]">
                {client.doctorName.split(" ").slice(-1)[0]?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-[var(--ivory)] truncate">{client.doctorName}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{client.specialty} · {client.practiceName}</div>
              </div>
              {client.phone && (
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono group-hover:text-[#10b981] transition-colors">{client.phone}</span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E8C84A]/10 text-[#E8C84A] font-medium">
                R{client.monthlyValue.toLocaleString()}/mo
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* By Plan */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5">
          <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">By Plan</h3>
          <div className="space-y-3">
            {Object.entries(byPlan).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planColors[plan] || "#999" }} />
                  <span className="text-[13px] text-[var(--text-secondary)] capitalize">{plan}</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--ivory)]">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By Type */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-5">
          <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-4">By Practice Type</h3>
          <div className="space-y-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--text-secondary)] capitalize">{type}</span>
                <span className="text-[14px] font-semibold text-[var(--ivory)]">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Signups */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-[var(--ivory)]">Recent Signups</h3>
            <Link href="/admin/practices" className="text-[11px] text-[var(--gold)] hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentSignups.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--gold)]">
                  {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--ivory)] truncate">{p.name}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{p.type} · {p.plan}</div>
                </div>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: statusColors[p.planStatus] || "#999", backgroundColor: `${statusColors[p.planStatus] || "#999"}15` }}>
                  {p.planStatus}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AdminKPI({ icon: Icon, label, value, color }: { icon: typeof Building2; label: string; value: number | string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}
