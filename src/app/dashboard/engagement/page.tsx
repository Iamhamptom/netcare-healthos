"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Users, MessageSquare, Mail, Target, Heart, TrendingUp, AlertTriangle, Send, Calendar, Inbox, Workflow } from "lucide-react";

interface AnalyticsData {
  sequences: { active: number; completed: number; escalated: number; paused: number };
  campaigns: { total: number; active: number; totalSent: number; totalResponded: number; totalBooked: number; overallResponseRate: string; overallBookingRate: string };
  channels: Record<string, number>;
  engagement30d: { notifications: number; bookings: number; newEnrollments: number };
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

export default function EngagementDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagement/analytics").then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-5">
        <h1 className="text-[22px] font-semibold text-gray-900">Patient Engagement</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse h-24 border border-gray-100" />)}
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Patient Engagement</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Sequences, campaigns, chronic care, population health</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/engagement/campaigns" className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors">
            <Target className="w-3.5 h-3.5" /> New Campaign
          </Link>
          <Link href="/dashboard/engagement/sequences" className="px-3.5 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors">
            <Workflow className="w-3.5 h-3.5" /> Sequences
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat i={0} icon={Activity} color="#3DA9D1" label="Active Sequences" value={d.sequences.active} sub={`${d.sequences.completed} completed`} />
        <Stat i={1} icon={Send} color="#111827" label="Campaign Sent" value={d.campaigns.totalSent} sub={`${d.campaigns.overallResponseRate} response`} />
        <Stat i={2} icon={Calendar} color="#E3964C" label="Bookings (30d)" value={d.engagement30d.bookings} sub={`${d.campaigns.overallBookingRate} conversion`} />
        <Stat i={3} icon={AlertTriangle} color="#EF4444" label="Escalations" value={d.sequences.escalated} sub="Needs attention" />
      </div>

      {/* 30-Day Activity */}
      <div className="grid grid-cols-3 gap-3">
        <Stat i={4} icon={Send} color="#3DA9D1" label="Messages Sent" value={d.engagement30d.notifications} />
        <Stat i={5} icon={Calendar} color="#111827" label="Bookings" value={d.engagement30d.bookings} />
        <Stat i={6} icon={Users} color="#8B5CF6" label="New Enrollments" value={d.engagement30d.newEnrollments} />
      </div>

      {/* Channels */}
      <motion.div {...fade(7)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-4 uppercase tracking-wider">Channel Volume (30d)</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, label: "WhatsApp", value: d.channels.whatsapp ?? 0, color: "#25D366" },
            { icon: Mail, label: "Email", value: d.channels.email ?? 0, color: "#3DA9D1" },
            { icon: Send, label: "SMS", value: d.channels.sms ?? 0, color: "#E3964C" },
          ].map((ch) => (
            <div key={ch.label} className="text-center">
              <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${ch.color}10` }}>
                <ch.icon className="w-4.5 h-4.5" style={{ color: ch.color }} />
              </div>
              <p className="text-xl font-bold text-gray-900 font-metric">{ch.value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-500">{ch.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/dashboard/engagement/chronic", icon: Heart, title: "Chronic Care Gaps", desc: "Overdue patients", color: "#EF4444" },
          { href: "/dashboard/engagement/population", icon: TrendingUp, title: "Population Health", desc: "Demographics & burden", color: "#3DA9D1" },
          { href: "/dashboard/engagement/inbox", icon: Inbox, title: "AI Email Inbox", desc: "Triaged inbound", color: "#8B5CF6" },
          { href: "/dashboard/engagement/campaigns", icon: Target, title: "Campaigns", desc: "Health outreach", color: "#111827" },
        ].map((link, i) => (
          <motion.div key={link.href} {...fade(8 + i)}>
            <Link href={link.href} className="block bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-4 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ backgroundColor: `${link.color}10` }}>
                <link.icon className="w-4 h-4" style={{ color: link.color }} />
              </div>
              <p className="text-[13px] font-semibold text-gray-900">{link.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{link.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Stat({ i, icon: Icon, color, label, value, sub }: { i: number; icon: any; color: string; label: string; value: number | string; sub?: string }) {
  return (
    <motion.div {...fade(i)} className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:border-gray-300 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-0.5 transition-all duration-300">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${color}10` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <p className="text-xl font-bold text-gray-900 font-metric">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}
