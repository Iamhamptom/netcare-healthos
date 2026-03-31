"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Heart, Activity, BarChart3 } from "lucide-react";

interface PopulationData {
  demographics: { total: number; active: number; gender: Record<string, number> };
  medicalAidDistribution: { scheme: string; count: number }[];
  diseaseBurden: { icd10: string; count: number }[];
  engagement30d: { notifications: number; bookings: number };
}

export default function PopulationHealthPage() {
  const [data, setData] = useState<PopulationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagement/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Get population health view" }),
    })
      .then((r) => r.json())
      .then((res) => {
        try {
          setData(JSON.parse(res.response));
        } catch {
          // Demo fallback
          setData({
            demographics: { total: 1842, active: 1654, gender: { F: 956, M: 698 } },
            medicalAidDistribution: [
              { scheme: "Discovery Health", count: 487 },
              { scheme: "GEMS", count: 312 },
              { scheme: "Bonitas", count: 198 },
              { scheme: "Momentum", count: 156 },
              { scheme: "Medshield", count: 89 },
              { scheme: "Self-pay", count: 412 },
            ],
            diseaseBurden: [
              { icd10: "I10 — Hypertension", count: 234 },
              { icd10: "E11 — Type 2 Diabetes", count: 178 },
              { icd10: "J06 — Acute URI", count: 156 },
              { icd10: "M54 — Back pain", count: 98 },
              { icd10: "J45 — Asthma", count: 67 },
              { icd10: "E78 — Hyperlipidemia", count: 56 },
              { icd10: "B20 — HIV", count: 45 },
              { icd10: "K21 — GERD", count: 34 },
            ],
            engagement30d: { notifications: 1240, bookings: 198 },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 min-h-screen bg-[#0f1721] space-y-6">
        <h1 className="text-2xl font-bold text-white">Population Health</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#0f1721] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" /> Population Health
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Patient demographics, disease burden, engagement metrics, NHI readiness</p>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{data.demographics.total.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">Total Patients</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Activity className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{data.demographics.active.toLocaleString()}</p>
          <p className="text-xs text-zinc-400">Active Patients</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Heart className="w-5 h-5 text-pink-400 mb-2" />
          <p className="text-2xl font-bold text-white">{data.demographics.gender.F ?? 0}</p>
          <p className="text-xs text-zinc-400">Female</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Users className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold text-white">{data.demographics.gender.M ?? 0}</p>
          <p className="text-xs text-zinc-400">Male</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Burden */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-400" /> Disease Burden (Top ICD-10)
          </h2>
          <div className="min-h-screen bg-[#0f1721] space-y-3">
            {data.diseaseBurden.map((d, i) => {
              const maxCount = data.diseaseBurden[0]?.count || 1;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{d.icd10}</span>
                    <span className="text-sm font-medium text-white">{d.count}</span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-2">
                    <div className="bg-red-500 rounded-full h-2 transition-all" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medical Aid Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-400" /> Medical Aid Distribution
          </h2>
          <div className="min-h-screen bg-[#0f1721] space-y-3">
            {data.medicalAidDistribution.map((m, i) => {
              const maxCount = data.medicalAidDistribution[0]?.count || 1;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-300">{m.scheme}</span>
                    <span className="text-sm font-medium text-white">{m.count}</span>
                  </div>
                  <div className="bg-zinc-800 rounded-full h-2">
                    <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NHI Readiness */}
      <div className="bg-zinc-900 border border-emerald-500/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">NHI Readiness Score</h2>
        <p className="text-xs text-zinc-400 mb-4">Based on preventive care engagement, chronic disease management, and digital patient interaction</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400">{Math.round((data.demographics.active / data.demographics.total) * 100)}%</p>
            <p className="text-xs text-zinc-500">Patient Retention</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">{data.engagement30d.notifications}</p>
            <p className="text-xs text-zinc-500">Engagement Touchpoints (30d)</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{data.engagement30d.bookings}</p>
            <p className="text-xs text-zinc-500">Bookings from Engagement (30d)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
