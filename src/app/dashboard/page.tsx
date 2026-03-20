"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  MessageSquare, CalendarCheck, Star, RotateCcw, Users, FileText,
  DollarSign, UserCheck, ClipboardList, Receipt, Shield,
  TrendingUp, ArrowUpRight, Building2, Zap, Activity, Layers,
  BarChart3, ArrowRight,
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

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branding, setBranding] = useState<PracticeBranding | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "operations">("overview");

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

  const primaryStats = [
    { label: "Total Patients", value: stats?.totalPatients ?? "\u2014", icon: Users, change: "+12%" },
    { label: "Today's Bookings", value: stats?.bookingsToday ?? "\u2014", icon: CalendarCheck, change: "" },
    { label: "Waiting Room", value: stats?.waitingPatients ?? "\u2014", icon: UserCheck, change: "" },
    { label: "Revenue Today", value: stats ? "R" + stats.todayRevenue.toLocaleString() : "\u2014", icon: DollarSign, change: "+8%" },
    { label: "Tasks Complete", value: stats ? stats.taskProgress + "%" : "\u2014", icon: ClipboardList, change: "" },
  ];

  const secondaryStats = [
    { label: "Conversations", value: stats?.conversations ?? "\u2014", icon: MessageSquare, change: "" },
    { label: "Avg Rating", value: stats?.avgRating ?? "\u2014", icon: Star, change: "" },
    { label: "Recall Due", value: stats?.recallDue ?? "\u2014", icon: RotateCcw, change: "" },
    { label: "Outstanding", value: stats ? "R" + stats.outstanding.toLocaleString() : "\u2014", icon: Receipt, change: "" },
    { label: "Records", value: stats?.totalRecords ?? "\u2014", icon: FileText, change: "" },
  ];

  const quickLinks = [
    { label: "Network Finance", icon: Building2, href: "/dashboard/network", desc: "Divisional P&L across 88 clinics" },
    { label: "FD KPIs", icon: BarChart3, href: "/dashboard/kpi", desc: "30+ financial metrics" },
    { label: "Savings Tracker", icon: Zap, href: "/dashboard/savings", desc: "R7.6M+ saved" },
    { label: "Board Pack", icon: FileText, href: "/dashboard/board-pack", desc: "Export-ready reports" },
    { label: "Start Pilot", icon: CalendarCheck, href: "/dashboard/pilot", desc: "8-week program" },
    { label: "Your Suite", icon: Layers, href: "/dashboard/suite", desc: "10 AI modules" },
    { label: "Intel Terminal", icon: Activity, href: "/dashboard/intel", desc: "Market intelligence" },
    { label: "Daily Tasks", icon: ClipboardList, href: "/dashboard/daily", desc: "FD workflow" },
  ];

  const currentStats = activeTab === "overview" ? primaryStats : secondaryStats;

  return (
    <div className="relative min-h-full bg-gradient-to-br from-[#f0f2f5] via-[#f5f6f8] to-[#eef0f4]">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#3DA9D1]/[0.03] blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] rounded-full bg-[#1D3443]/[0.03] blur-[100px]" />
      </div>

      <div className="relative p-6 lg:p-8 space-y-5 max-w-[1440px] mx-auto" style={{ perspective: "1200px" }}>

        {/* ─── Welcome ─── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-[22px] font-semibold text-[#1D3443] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[13px] text-[#1D3443]/40 mt-0.5">
              {branding?.name} &middot; {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <span className="text-[11px] text-[#1D3443]/60 font-medium">Systems Online</span>
          </div>
        </motion.div>

        {/* ─── Impact Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(29,52,67,0.25)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D3443] via-[#1a3040] to-[#162a37]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Gradient orb */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#3DA9D1]/[0.08] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />

          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-3.5 h-3.5 text-white/25" />
              <span className="text-[10px] text-white/25 uppercase tracking-[0.2em] font-semibold">Network Overview</span>
              <span className="ml-auto text-[10px] text-white/15 font-mono">FY2026</span>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {[
                { label: "Annual Savings", value: "R95M+", sub: "addressable" },
                { label: "Claims Processing", value: "50%", sub: "faster" },
                { label: "Clinics Connected", value: "88", sub: "network-wide" },
                { label: "POPIA Compliance", value: "100%", sub: "all provinces" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                >
                  <div className="text-[32px] font-semibold text-white font-metric tracking-tight leading-none">{item.value}</div>
                  <div className="text-[11px] text-white/30 mt-2 font-medium">{item.label}</div>
                  <div className="text-[10px] text-white/15 mt-0.5">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Tab Switcher ─── */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/60 backdrop-blur-sm border border-white shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] w-fit">
          {(["overview", "operations"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-lg text-[12px] font-semibold capitalize transition-all duration-300 ${
                activeTab === tab ? "text-[#1D3443]" : "text-[#1D3443]/35 hover:text-[#1D3443]/60"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-5 gap-3">
          {currentStats.map((item, i) => (
            <TiltCard
              key={item.label}
              className="group cursor-default"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 200, damping: 22 }}
                className="relative p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white overflow-hidden transition-shadow duration-500 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                {/* Shine sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full" style={{ transition: "transform 0.8s ease, opacity 0.3s ease" }} />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f0f2f5] to-[#e8eaef] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)]">
                      <item.icon className="w-[15px] h-[15px] text-[#1D3443]/45" />
                    </div>
                    {item.change && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/60">
                        {item.change}
                      </span>
                    )}
                  </div>
                  <div className="text-[24px] font-semibold text-[#1D3443] font-metric tracking-tight leading-none">{item.value}</div>
                  <div className="text-[11px] text-[#1D3443]/35 mt-1.5 font-medium">{item.label}</div>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>

        {/* ─── Quick Access ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#1D3443]/20" />
              <span className="text-[11px] font-semibold text-[#1D3443]/30 uppercase tracking-[0.12em]">Quick Access</span>
            </div>
            <Link href="/dashboard/suite" className="text-[11px] text-[#1D3443]/30 hover:text-[#1D3443]/60 font-medium transition-colors flex items-center gap-1">
              All modules <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map((item, i) => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.03, type: "spring", stiffness: 200, damping: 22 }}
                  className="group relative p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white overflow-hidden cursor-pointer transition-all duration-400 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5"
                >
                  <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f0f2f5] to-[#e8eaef] flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] group-hover:from-[#1D3443]/[0.06] group-hover:to-[#1D3443]/[0.03] transition-all duration-300">
                      <item.icon className="w-[16px] h-[16px] text-[#1D3443]/35 group-hover:text-[#1D3443]/60 transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1D3443] mb-0.5">{item.label}</div>
                      <div className="text-[11px] text-[#1D3443]/35 leading-snug">{item.desc}</div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#1D3443]/15 mt-0.5 shrink-0 transition-all duration-300 group-hover:text-[#1D3443]/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
