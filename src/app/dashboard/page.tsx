"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, CalendarCheck, Star, RotateCcw, Users, FileText,
  DollarSign, UserCheck, ClipboardList, Receipt, Shield,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Link from "next/link";
import PracticeMap from "@/components/dashboard/PracticeMap";

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

function WelcomeBanner({ branding }: { branding: PracticeBranding }) {
  const firstName = branding.userName?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden bg-[#1D3443]"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Welcome back, {firstName}</h2>
            <p className="text-white/50 text-[12px]">
              {branding.name} &mdash; AI-powered financial analytics, claims intelligence, and network operations
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/8 rounded-lg px-2.5 py-1">
            <Shield className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white/60 text-[10px] font-medium">POPIA Compliant</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Cost Reduction", value: "30%", desc: "vs fragmented tools" },
            { label: "Claims Speed", value: "50%", desc: "faster processing" },
            { label: "Scale", value: "10x", desc: "capacity without headcount" },
            { label: "Claims Addressable", value: "R33M+", desc: "annually" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-white/5 rounded-lg p-3"
            >
              <div className="text-white text-lg font-bold">{stat.value}</div>
              <div className="text-white/60 text-[10px] font-medium">{stat.label}</div>
              <div className="text-white/30 text-[9px]">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branding, setBranding] = useState<PracticeBranding | null>(null);
  const [recentConversations, setRecentConversations] = useState<
    { id: string; patient: { name: string }; messages: { content: string; createdAt: string }[]; updatedAt: string }[]
  >([]);

  useEffect(() => {
    // Fetch user + practice branding
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user?.practice) {
        const p = data.user.practice;
        setBranding({
          name: p.name || p.practiceName || "Netcare Health OS",
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
      const avgRating = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : "—";
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

      setRecentConversations((convos.conversations || []).slice(0, 5));
    }).catch(() => {});
  }, []);

  const pc = branding?.primaryColor || "#1D3443";
  const sc = branding?.secondaryColor || "#3DA9D1";

  return (
    <div className="p-6 space-y-5">
      {/* Welcome banner with branding */}
      {branding && <WelcomeBanner branding={branding} />}

      {/* Stats — 2 rows of 5, clean corporate palette */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Patients" value={stats?.totalPatients ?? "—"} icon={Users} color="#1D3443" delay={0} />
        <StatCard label="Bookings Today" value={stats?.bookingsToday ?? "—"} icon={CalendarCheck} color="#3DA9D1" delay={0.03} />
        <StatCard label="Waiting Room" value={stats?.waitingPatients ?? "—"} icon={UserCheck} color="#1D3443" delay={0.06} />
        <StatCard label="Revenue Today" value={stats ? `R${stats.todayRevenue.toLocaleString()}` : "—"} icon={DollarSign} color="#10b981" delay={0.09} />
        <StatCard label="Daily Tasks" value={stats ? `${stats.taskProgress}%` : "—"} icon={ClipboardList} color="#3DA9D1" delay={0.12} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Conversations" value={stats?.conversations ?? "—"} icon={MessageSquare} color="#1D3443" delay={0.15} />
        <StatCard label="Avg Rating" value={stats?.avgRating ?? "—"} icon={Star} color="#E3964C" delay={0.18} />
        <StatCard label="Recall Due" value={stats?.recallDue ?? "—"} icon={RotateCcw} color="#3DA9D1" delay={0.21} />
        <StatCard label="Outstanding" value={stats ? `R${stats.outstanding.toLocaleString()}` : "—"} icon={Receipt} color="#ef4444" delay={0.24} />
        <StatCard label="Records" value={stats?.totalRecords ?? "—"} icon={FileText} color="#1D3443" delay={0.27} />
      </div>

      {/* Recent conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1D3443]" />
            <span className="text-[13px] font-semibold text-gray-900">Recent Conversations</span>
          </div>
          <Link href="/dashboard/conversations" className="text-[12px] text-[#3DA9D1] hover:underline font-medium">
            View all
          </Link>
        </div>

        {recentConversations.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-400">
            No conversations yet. Use the Conversations page to simulate patient messages.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentConversations.map((convo) => {
              const lastMsg = convo.messages?.[convo.messages.length - 1];
              return (
                <Link
                  key={convo.id}
                  href="/dashboard/conversations"
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1D3443]/8 flex items-center justify-center text-[11px] font-semibold text-[#1D3443] shrink-0">
                    {convo.patient.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900">{convo.patient.name}</div>
                    <p className="text-[12px] text-gray-500 truncate">
                      {lastMsg?.content || "No messages yet"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {[
          { label: "Daily Tasks", icon: ClipboardList, color: "#1D3443", href: "/dashboard/daily" },
          { label: "Check-In", icon: UserCheck, color: "#3DA9D1", href: "/dashboard/checkin" },
          { label: "Patients", icon: Users, color: "#1D3443", href: "/dashboard/patients" },
          { label: "Billing", icon: Receipt, color: "#3DA9D1", href: "/dashboard/billing" },
          { label: "Conversations", icon: MessageSquare, color: "#1D3443", href: "/dashboard/conversations" },
          { label: "Bookings", icon: CalendarCheck, color: "#3DA9D1", href: "/dashboard/bookings" },
          { label: "Recall", icon: RotateCcw, color: "#1D3443", href: "/dashboard/recall" },
        ].map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${action.color}15` }}>
              <action.icon className="w-4 h-4" style={{ color: action.color }} />
            </div>
            <span className="text-[13px] font-medium text-gray-600">{action.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Practice Map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <PracticeMap />
      </motion.div>
    </div>
  );
}
