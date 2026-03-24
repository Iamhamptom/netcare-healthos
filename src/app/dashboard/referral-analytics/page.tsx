"use client";

import { TrendingUp, Users, MapPin, Stethoscope, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ── Referral Analytics Dashboard ── */

interface ReferralMetric {
  location: string;
  city: string;
  totalReferrals: number;
  thisMonth: number;
  trend: number; // % change
  topReferrers: { name: string; count: number }[];
  conversionRate: number;
  avgWaitDays: number;
}

const METRICS: ReferralMetric[] = [
  {
    location: "Wits Donald Gordon", city: "Parktown",
    totalReferrals: 45, thisMonth: 8, trend: 12,
    topReferrers: [
      { name: "Dr M. Ndlovu", count: 12 },
      { name: "Dr L. van Wyk", count: 8 },
      { name: "Dr P. Singh", count: 6 },
    ],
    conversionRate: 78, avgWaitDays: 12,
  },
  {
    location: "Netcare Sunward Park", city: "Boksburg",
    totalReferrals: 32, thisMonth: 5, trend: -3,
    topReferrers: [
      { name: "Dr S. Patel", count: 9 },
      { name: "Dr A. Moyo", count: 7 },
      { name: "Dr T. Khumalo", count: 5 },
    ],
    conversionRate: 82, avgWaitDays: 10,
  },
  {
    location: "Life Groenkloof", city: "Pretoria",
    totalReferrals: 28, thisMonth: 6, trend: 25,
    topReferrers: [
      { name: "Dr T. Mahlangu", count: 8 },
      { name: "Dr J. Botha", count: 5 },
      { name: "Dr F. Molefe", count: 4 },
    ],
    conversionRate: 71, avgWaitDays: 14,
  },
  {
    location: "Mediclinic Highveld", city: "Trichardt",
    totalReferrals: 15, thisMonth: 3, trend: 50,
    topReferrers: [
      { name: "Dr K. Shabangu", count: 6 },
      { name: "Dr N. Dube", count: 4 },
    ],
    conversionRate: 87, avgWaitDays: 7,
  },
  {
    location: "Linamandla Medical", city: "Eswatini",
    totalReferrals: 10, thisMonth: 2, trend: 0,
    topReferrers: [
      { name: "Dr M. Dlamini", count: 4 },
      { name: "Dr S. Nkambule", count: 3 },
    ],
    conversionRate: 90, avgWaitDays: 21,
  },
];

const totalRefs = METRICS.reduce((sum, m) => sum + m.totalReferrals, 0);
const totalMonth = METRICS.reduce((sum, m) => sum + m.thisMonth, 0);
const avgConversion = Math.round(METRICS.reduce((sum, m) => sum + m.conversionRate, 0) / METRICS.length);
const avgWait = Math.round(METRICS.reduce((sum, m) => sum + m.avgWaitDays, 0) / METRICS.length);

export default function ReferralAnalyticsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-teal-600" />
          Referral Analytics
        </h1>
        <p className="text-sm text-[#1D3443]/60 mt-1">
          Track GP referral patterns across all 5 locations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: totalRefs, sub: "All time", icon: Users },
          { label: "This Month", value: totalMonth, sub: "March 2026", icon: Calendar },
          { label: "Avg Conversion", value: `${avgConversion}%`, sub: "Referral → Patient", icon: Stethoscope },
          { label: "Avg Wait Time", value: `${avgWait} days`, sub: "Referral → First Consult", icon: Calendar },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#1D3443]/10 p-4">
            <div className="flex items-center gap-2 text-[#1D3443]/50 mb-1">
              <stat.icon className="w-4 h-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-[#1D3443]">{stat.value}</div>
            <div className="text-[10px] text-[#1D3443]/40">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Per-Location Cards */}
      <div className="space-y-4">
        {METRICS.map(m => (
          <div key={m.location} className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-semibold text-[#1D3443]">{m.location}</h3>
                  <p className="text-xs text-[#1D3443]/50">{m.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1D3443]">{m.thisMonth}</div>
                  <div className="text-[10px] text-[#1D3443]/40">this month</div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${m.trend > 0 ? "text-emerald-600" : m.trend < 0 ? "text-red-600" : "text-[#1D3443]/40"}`}>
                  {m.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : m.trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                  {m.trend > 0 ? "+" : ""}{m.trend}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Top Referrers */}
              <div>
                <h4 className="text-xs font-semibold text-[#1D3443]/50 uppercase mb-2">Top Referring GPs</h4>
                <div className="space-y-1.5">
                  {m.topReferrers.map((ref, i) => (
                    <div key={ref.name} className="flex items-center justify-between text-sm">
                      <span className="text-[#1D3443]/70">{i + 1}. {ref.name}</span>
                      <span className="font-bold text-teal-600">{ref.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion */}
              <div className="text-center">
                <h4 className="text-xs font-semibold text-[#1D3443]/50 uppercase mb-2">Conversion Rate</h4>
                <div className={`text-3xl font-bold ${m.conversionRate >= 80 ? "text-emerald-600" : m.conversionRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                  {m.conversionRate}%
                </div>
                <div className="text-[10px] text-[#1D3443]/40">Referral → Ongoing Patient</div>
              </div>

              {/* Wait Time */}
              <div className="text-center">
                <h4 className="text-xs font-semibold text-[#1D3443]/50 uppercase mb-2">Avg Wait Time</h4>
                <div className={`text-3xl font-bold ${m.avgWaitDays <= 10 ? "text-emerald-600" : m.avgWaitDays <= 14 ? "text-amber-600" : "text-red-600"}`}>
                  {m.avgWaitDays}d
                </div>
                <div className="text-[10px] text-[#1D3443]/40">Referral → First Consult</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
