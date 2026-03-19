"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, CalendarCheck, Star, RotateCcw, Users, FileText,
  DollarSign, UserCheck, ClipboardList, Receipt, Shield,
  TrendingUp, TrendingDown, ArrowUpRight, Building2, Zap,
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
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {firstName}
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {branding?.name} \u2014 {branding?.tagline || "AI-Powered Operations Platform"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-green-700 font-medium">All Systems Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl bg-[#1D3443] p-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Annual Savings Potential", value: "R95M+", icon: Zap, trend: "addressable" },
            { label: "Claims Processing", value: "50% faster", icon: TrendingUp, trend: "vs manual" },
            { label: "Clinics Connected", value: "88", icon: Building2, trend: "network-wide" },
            { label: "POPIA Compliance", value: "100%", icon: Shield, trend: "all provinces" },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white/5 rounded-lg p-3">
              <item.icon className="w-4 h-4 text-[#3DA9D1] mb-1.5" />
              <div className="text-xl font-bold text-white font-metric">{item.value}</div>
              <div className="text-[10px] text-white/40 font-medium mt-0.5">{item.label}</div>
              <div className="text-[9px] text-[#E3964C] mt-0.5">{item.trend}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Patients", value: stats?.totalPatients ?? "\u2014", icon: Users, color: "#1D3443" },
          { label: "Bookings Today", value: stats?.bookingsToday ?? "\u2014", icon: CalendarCheck, color: "#3DA9D1" },
          { label: "Waiting Room", value: stats?.waitingPatients ?? "\u2014", icon: UserCheck, color: "#1D3443" },
          { label: "Revenue Today", value: stats ? "R" + stats.todayRevenue.toLocaleString() : "\u2014", icon: DollarSign, color: "#10B981" },
          { label: "Tasks Done", value: stats ? stats.taskProgress + "%" : "\u2014", icon: ClipboardList, color: "#3DA9D1" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.03 }}
            className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div className="text-xl font-bold text-gray-900 font-metric">{item.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Conversations", value: stats?.conversations ?? "\u2014", icon: MessageSquare, color: "#1D3443" },
          { label: "Avg Rating", value: stats?.avgRating ?? "\u2014", icon: Star, color: "#E3964C" },
          { label: "Recall Due", value: stats?.recallDue ?? "\u2014", icon: RotateCcw, color: "#3DA9D1" },
          { label: "Outstanding", value: stats ? "R" + stats.outstanding.toLocaleString() : "\u2014", icon: Receipt, color: "#EF4444" },
          { label: "Records", value: stats?.totalRecords ?? "\u2014", icon: FileText, color: "#1D3443" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.03 }}
            className="p-4 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div className="text-xl font-bold text-gray-900 font-metric">{item.value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Network Finance", icon: Building2, href: "/dashboard/network", desc: "Divisional P&L", color: "#1D3443" },
            { label: "FD KPIs", icon: TrendingUp, href: "/dashboard/kpi", desc: "30+ metrics", color: "#3DA9D1" },
            { label: "Savings Tracker", icon: Zap, href: "/dashboard/savings", desc: "R7.6M+ saved", color: "#E3964C" },
            { label: "Board Pack", icon: FileText, href: "/dashboard/board-pack", desc: "Export ready", color: "#1D3443" },
            { label: "Start Pilot", icon: CalendarCheck, href: "/dashboard/pilot", desc: "8-week program", color: "#10B981" },
            { label: "Your Suite", icon: Shield, href: "/dashboard/suite", desc: "10 AI modules", color: "#3DA9D1" },
            { label: "Intel Terminal", icon: Star, href: "/dashboard/intel", desc: "Market data", color: "#1D3443" },
            { label: "Daily Tasks", icon: ClipboardList, href: "/dashboard/daily", desc: "FD workflow", color: "#E3964C" },
          ].map((item, i) => (
            <Link key={item.label} href={item.href}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.03 }}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#3DA9D1]/30 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + "08" }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900 group-hover:text-[#1D3443]">{item.label}</div>
                    <div className="text-[10px] text-gray-400">{item.desc}</div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-[#3DA9D1] transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
