"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
    { label: "Conversations", value: stats?.conversations ?? "\u2014", icon: MessageSquare },
    { label: "Avg Rating", value: stats?.avgRating ?? "\u2014", icon: Star },
    { label: "Recall Due", value: stats?.recallDue ?? "\u2014", icon: RotateCcw },
    { label: "Outstanding", value: stats ? "R" + stats.outstanding.toLocaleString() : "\u2014", icon: Receipt },
    { label: "Records", value: stats?.totalRecords ?? "\u2014", icon: FileText },
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

  return (
    <div className="relative min-h-full bg-[#f8f9fa]">
      {/* Subtle living background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #3DA9D1 0%, transparent 70%)", animation: "morph-gradient 20s ease infinite" }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, #1D3443 0%, transparent 70%)", animation: "morph-gradient 25s ease infinite" }} />
      </div>

      <div className="relative p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">

        {/* ─── Welcome Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-[22px] font-semibold text-[#1D3443] tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5 font-light">
              {branding?.name} &middot; {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60">
              <div className="w-[6px] h-[6px] rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-[11px] text-emerald-700 font-medium">Systems Online</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Impact Banner — Dark glass panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Glass background */}
          <div className="absolute inset-0 bg-[#1D3443]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D3443] via-[#1a3040] to-[#1D3443]" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Subtle gradient sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/30" />
                <span className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold">Network Overview</span>
              </div>
              <span className="text-[10px] text-white/20 font-mono">FY2026</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Annual Savings Potential", value: "R95M+", sub: "addressable" },
                { label: "Claims Processing", value: "50%", sub: "faster" },
                { label: "Clinics Connected", value: "88", sub: "network-wide" },
                { label: "POPIA Compliance", value: "100%", sub: "all provinces" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <div className="text-[28px] font-semibold text-white font-metric tracking-tight leading-none">{item.value}</div>
                  <div className="text-[11px] text-white/25 mt-1.5 font-medium">{item.label}</div>
                  <div className="text-[10px] text-white/15 mt-0.5">{item.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Glossy Tab Switcher ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-200/60 shadow-sm w-fit"
        >
          {(["overview", "operations"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-lg text-[12px] font-semibold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? "text-[#1D3443]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gray-100/80 rounded-lg border border-gray-200/40"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-5 gap-3">
          {(activeTab === "overview" ? primaryStats : secondaryStats).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.03 }}
              className="group relative p-5 rounded-2xl bg-white border border-gray-200/60 overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:border-gray-300/60 hover:-translate-y-0.5"
            >
              {/* Top shimmer line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {/* Glass reflection */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-700 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f4f5f6] flex items-center justify-center">
                    <item.icon className="w-[15px] h-[15px] text-[#1D3443]/50" />
                  </div>
                  {"change" in item && (item as typeof primaryStats[0]).change && (
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      {(item as typeof primaryStats[0]).change}
                    </span>
                  )}
                </div>
                <div className="text-[22px] font-semibold text-[#1D3443] font-metric tracking-tight">{item.value}</div>
                <div className="text-[11px] text-gray-400 mt-1 font-medium">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Quick Access ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">Quick Access</span>
            </div>
            <Link href="/dashboard/suite" className="text-[11px] text-gray-400 hover:text-[#1D3443] font-medium transition-colors flex items-center gap-1">
              View all modules <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map((item, i) => (
              <Link key={item.label} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.025 }}
                  className="group relative p-4 rounded-2xl bg-white border border-gray-200/60 overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] hover:border-gray-300/60 hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Hover glow */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-gradient-to-br from-[#3DA9D1]/5 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none" />

                  <div className="relative flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f4f5f6] flex items-center justify-center shrink-0 group-hover:bg-[#1D3443]/[0.06] transition-colors duration-300">
                      <item.icon className="w-[15px] h-[15px] text-[#1D3443]/40 group-hover:text-[#1D3443]/70 transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1D3443] mb-0.5">{item.label}</div>
                      <div className="text-[11px] text-gray-400 leading-snug">{item.desc}</div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-[#1D3443]/40 mt-0.5 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
