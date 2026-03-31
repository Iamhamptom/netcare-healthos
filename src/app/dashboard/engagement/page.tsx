"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Users, MessageSquare, Mail, Target, Heart, TrendingUp, AlertTriangle, Send, Calendar } from "lucide-react";

interface AnalyticsData {
  sequences: { active: number; completed: number; escalated: number; paused: number };
  campaigns: { total: number; active: number; totalSent: number; totalResponded: number; totalBooked: number; overallResponseRate: string; overallBookingRate: string };
  channels: Record<string, number>;
  engagement30d: { notifications: number; bookings: number; newEnrollments: number };
}

export default function EngagementDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagement/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-[#0f1721] space-y-6">
        <h1 className="text-2xl font-bold text-white">Patient Engagement</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="p-6 min-h-screen bg-[#0f1721] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Patient Engagement</h1>
          <p className="text-zinc-400 text-sm mt-1">Automated sequences, campaigns, chronic care management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/engagement/campaigns" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" /> New Campaign
          </Link>
          <Link href="/dashboard/engagement/sequences" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" /> Sequences
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity className="w-5 h-5 text-emerald-400" />} label="Active Sequences" value={d.sequences.active} sub={`${d.sequences.completed} completed`} />
        <StatCard icon={<Target className="w-5 h-5 text-blue-400" />} label="Campaign Sent" value={d.campaigns.totalSent} sub={`${d.campaigns.overallResponseRate} response rate`} />
        <StatCard icon={<Calendar className="w-5 h-5 text-amber-400" />} label="Bookings from Engagement" value={d.campaigns.totalBooked} sub={`${d.campaigns.overallBookingRate} conversion`} />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-400" />} label="Escalations" value={d.sequences.escalated} sub="Requires attention" />
      </div>

      {/* 30-Day Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Send className="w-5 h-5 text-emerald-400" />} label="Messages Sent (30d)" value={d.engagement30d.notifications} />
        <StatCard icon={<Calendar className="w-5 h-5 text-blue-400" />} label="Bookings (30d)" value={d.engagement30d.bookings} />
        <StatCard icon={<Users className="w-5 h-5 text-purple-400" />} label="New Enrollments (30d)" value={d.engagement30d.newEnrollments} />
      </div>

      {/* Channel Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Channel Volume (30 days)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{d.channels.whatsapp ?? 0}</p>
            <p className="text-xs text-zinc-400">WhatsApp</p>
          </div>
          <div className="text-center">
            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{d.channels.email ?? 0}</p>
            <p className="text-xs text-zinc-400">Email</p>
          </div>
          <div className="text-center">
            <Send className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{d.channels.sms ?? 0}</p>
            <p className="text-xs text-zinc-400">SMS</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLink href="/dashboard/engagement/chronic" icon={<Heart />} title="Chronic Care Gaps" desc="Patients overdue for care" color="text-red-400" />
        <QuickLink href="/dashboard/engagement/population" icon={<TrendingUp />} title="Population Health" desc="Demographics & disease burden" color="text-blue-400" />
        <QuickLink href="/dashboard/engagement/inbox" icon={<Mail />} title="Email Inbox" desc="AI-triaged inbound emails" color="text-purple-400" />
        <QuickLink href="/dashboard/engagement/campaigns" icon={<Target />} title="Campaigns" desc="Health outreach campaigns" color="text-emerald-400" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-zinc-400">{label}</span></div>
      <p className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function QuickLink({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <Link href={href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
    </Link>
  );
}
