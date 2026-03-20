"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, CalendarCheck, Star, RotateCcw, Users, FileText,
  DollarSign, UserCheck, ClipboardList, Receipt, Shield,
  TrendingUp, ArrowUpRight, Building2, Zap, Activity,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  conversations: number;
  bookingsToday: number;
  avgRating: string;
  recallDue: number;
  totalPatients: number;
  totalRecords: number;
  todayRevenue: number;
  outstanding: number;
  waitingPatients: number;
  taskProgress: number;
}

interface PracticeBranding {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  userName: string;
}

function GlossyStatCard({ label, value, icon: Icon, delay }: {
  label: string; value: string | number; icon: React.ElementType; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-gray-200/60 bg-white overflow-hidden transition-all duration-500 hover:border-gray-300/80 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
      style={{ perspective: "800px" }}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {/* Hovering light sweep */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-100/80 transition-colors duration-300">
            <Icon className="w-4 h-4 text-gray-500" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-emerald-400 transition-colors duration-500" />
        </div>
        <div className="text-2xl font-semibold text-gray-900 font-metric tracking-tight">{value}</div>
        <div className="text-[11px] text-gray-400 mt-1 font-medium tracking-wide uppercase">{label}</div>
      </div>
    </motion.div>
  );
}

function QuickAccessCard({ label, desc, icon: Icon, href, delay }: {
  label: string; desc: string; icon: React.ElementType; href: string; delay: number;
}) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="group relative p-4 rounded-2xl border border-gray-200/60 bg-white overflow-hidden transition-all duration-500 hover:border-gray-300/80 hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 cursor-pointer"
      >
        {/* Hover light */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-100/80 transition-colors duration-300">
            <Icon className="w-[18px] h-[18px] text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900">{label}</div>
            <div className="text-[11px] text-gray-400">{desc}</div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branding, setBranding] = useState<PracticeBranding | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.practice) {
        const p = data.user.practice;
        setBranding({
          name: p.name || p.practiceName || "Netcare",
          primaryColor: p.primaryColor || p.primary_color || "#1D3443",
          secondaryColor: p.secondaryColor || p.secondary_color || "#3DA9D1",
          tagline: p.tagline || "",
          userName: data.user.name || "",
        });
      }
    }).catch(() => {});

    Promise.all([
      fetch("/api/conversations").then(r => r.json()),
      fetch("/api/bookings").then(r => r.json()),
      fetch("/api/reviews").then(r => r.json()),
      fetch("/api/recall").then(r => r.json()),
      fetch("/api/patients").then(r => r.json()),
      fetch("/api/analytics").then(r => r.json()).catch(() => null),
      fetch("/api/payments").then(r => r.json()).catch(() => ({ todayRevenue: 0 })),
      fetch("/api/checkin").then(r => r.json()).catch(() => ({ checkIns: [] })),
      fetch("/api/daily-tasks").then(r => r.json()).catch(() => ({ progress: { percent: 0 } })),
    ]).then(([convos, bookings, reviews, recall, patients, analytics, payments, checkins, dailyTasks]) => {
      const today = new Date().toDateString();
      const todayBookings = (bookings.bookings || []).filter(
        (b: { scheduledAt: string }) => new Date(b.scheduledAt).toDateString() === today
      );
      const ratings = (reviews.reviews || []).map((r: { rating: number }) => r.rating);
      const avgRating = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "\u2014";
      const dueRecalls = (recall.recallItems || []).filter((r: { contacted: boolean }) => !r.contacted);

      setStats({
        conversations: (convos.conversations || []).length,
        bookingsToday: todayBookings.length,
        avgRating,
        recallDue: dueRecalls.length,
        totalPatients: (patients.patients || []).length,
        totalRecords: analytics?.records?.total ?? 0,
        todayRevenue: payments.todayRevenue || 0,
        outstanding: analytics?.billing?.outstanding ?? 0,
        waitingPatients: (checkins.checkIns || []).filter((c: { status: string }) => c.status === "waiting").length,
        taskProgress: dailyTasks.progress?.percent ?? 0,
      });
    }).catch(() => {});
  }, []);

  const firstName = branding?.userName?.split(" ")[0] || "there";

  return (
    <div className="relative min-h-full">
      {/* Animated mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gray-100/40 blur-[120px] animate-morph-bg"
          style={{ background: "radial-gradient(circle, rgba(243,244,246,0.5) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full bg-gray-100/30 blur-[100px] animate-morph-bg"
          style={{ animationDelay: "5s", background: "radial-gradient(circle, rgba(229,231,235,0.4) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] animate-morph-bg opacity-20"
          style={{ animationDelay: "10s", background: "radial-gradient(circle, rgba(61,169,209,0.08) 0%, transparent 60%)" }} />
      </div>

      <div className="relative p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {branding?.name} — {branding?.tagline || "Operations Platform"}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200/60 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
            <span className="text-[11px] text-gray-500 font-medium">All Systems Online</span>
          </motion.div>
        </motion.div>

        {/* Impact Banner — Clean, monochrome glass */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative rounded-2xl bg-gray-900 p-6 overflow-hidden"
        >
          {/* Subtle animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-morph-bg" style={{ backgroundSize: "400% 400%" }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative grid grid-cols-4 gap-4">
            {[
              { label: "Annual Savings Potential", value: "R95M+", icon: Zap },
              { label: "Claims Processing", value: "50% faster", icon: TrendingUp },
              { label: "Clinics Connected", value: "88", icon: Building2 },
              { label: "POPIA Compliance", value: "100%", icon: Shield },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="group bg-white/[0.04] hover:bg-white/[0.07] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-500"
              >
                <item.icon className="w-4 h-4 text-white/30 mb-2" />
                <div className="text-xl font-semibold text-white font-metric tracking-tight">{item.value}</div>
                <div className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Primary Stats Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Live Metrics</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <GlossyStatCard label="Patients" value={stats?.totalPatients ?? "\u2014"} icon={Users} delay={0.2} />
            <GlossyStatCard label="Bookings Today" value={stats?.bookingsToday ?? "\u2014"} icon={CalendarCheck} delay={0.23} />
            <GlossyStatCard label="Waiting Room" value={stats?.waitingPatients ?? "\u2014"} icon={UserCheck} delay={0.26} />
            <GlossyStatCard label="Revenue Today" value={stats ? "R" + stats.todayRevenue.toLocaleString() : "\u2014"} icon={DollarSign} delay={0.29} />
            <GlossyStatCard label="Tasks Done" value={stats ? stats.taskProgress + "%" : "\u2014"} icon={ClipboardList} delay={0.32} />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <GlossyStatCard label="Conversations" value={stats?.conversations ?? "\u2014"} icon={MessageSquare} delay={0.25} />
          <GlossyStatCard label="Avg Rating" value={stats?.avgRating ?? "\u2014"} icon={Star} delay={0.28} />
          <GlossyStatCard label="Recall Due" value={stats?.recallDue ?? "\u2014"} icon={RotateCcw} delay={0.31} />
          <GlossyStatCard label="Outstanding" value={stats ? "R" + stats.outstanding.toLocaleString() : "\u2014"} icon={Receipt} delay={0.34} />
          <GlossyStatCard label="Records" value={stats?.totalRecords ?? "\u2014"} icon={FileText} delay={0.37} />
        </div>

        {/* Quick Access */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick Access</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Network Finance", icon: Building2, href: "/dashboard/network", desc: "Divisional P&L" },
              { label: "FD KPIs", icon: TrendingUp, href: "/dashboard/kpi", desc: "30+ metrics" },
              { label: "Savings Tracker", icon: Zap, href: "/dashboard/savings", desc: "R7.6M+ saved" },
              { label: "Board Pack", icon: FileText, href: "/dashboard/board-pack", desc: "Export ready" },
              { label: "Start Pilot", icon: CalendarCheck, href: "/dashboard/pilot", desc: "8-week program" },
              { label: "Your Suite", icon: Shield, href: "/dashboard/suite", desc: "10 AI modules" },
              { label: "Intel Terminal", icon: Star, href: "/dashboard/intel", desc: "Market data" },
              { label: "Daily Tasks", icon: ClipboardList, href: "/dashboard/daily", desc: "FD workflow" },
            ].map((item, i) => (
              <QuickAccessCard key={item.label} {...item} delay={0.35 + i * 0.03} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
