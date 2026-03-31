"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Heart, Activity, BarChart3 } from "lucide-react";

interface PopulationData {
  demographics: { total: number; active: number; gender: Record<string, number> };
  medicalAidDistribution: { scheme: string; count: number }[];
  diseaseBurden: { icd10: string; count: number }[];
  engagement30d: { notifications: number; bookings: number };
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

export default function PopulationHealthPage() {
  const [data, setData] = useState<PopulationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo fallback
    setData({
      demographics: { total: 1842, active: 1654, gender: { F: 956, M: 698 } },
      medicalAidDistribution: [
        { scheme: "Discovery Health", count: 487 }, { scheme: "GEMS", count: 312 },
        { scheme: "Bonitas", count: 198 }, { scheme: "Momentum", count: 156 },
        { scheme: "Medshield", count: 89 }, { scheme: "Self-pay", count: 412 },
      ],
      diseaseBurden: [
        { icd10: "I10 — Hypertension", count: 234 }, { icd10: "E11 — Type 2 Diabetes", count: 178 },
        { icd10: "J06 — Acute URI", count: 156 }, { icd10: "M54 — Back pain", count: 98 },
        { icd10: "J45 — Asthma", count: 67 }, { icd10: "E78 — Hyperlipidemia", count: 56 },
        { icd10: "B20 — HIV", count: 45 }, { icd10: "K21 — GERD", count: 34 },
      ],
      engagement30d: { notifications: 1240, bookings: 198 },
    });
    setLoading(false);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 lg:p-8 space-y-5">
        <h1 className="text-[22px] font-semibold text-gray-900">Population Health</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white/60 border border-gray-100 rounded-xl p-4 animate-pulse h-24" />)}</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Population Health</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Demographics, disease burden, engagement, NHI readiness</p>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, color: "#3DA9D1", label: "Total Patients", value: data.demographics.total },
          { icon: Activity, color: "#10B981", label: "Active", value: data.demographics.active },
          { icon: Heart, color: "#EC4899", label: "Female", value: data.demographics.gender.F ?? 0 },
          { icon: Users, color: "#111827", label: "Male", value: data.demographics.gender.M ?? 0 },
        ].map((stat, i) => (
          <motion.div key={stat.label} {...fade(i)} className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/80 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${stat.color}10` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-xl font-bold text-gray-900 font-metric">{stat.value.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Disease Burden */}
        <motion.div {...fade(4)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-red-500" /> Disease Burden (Top ICD-10)
          </h2>
          <div className="space-y-2.5">
            {data.diseaseBurden.map((d, i) => {
              const max = data.diseaseBurden[0]?.count || 1;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-700">{d.icd10}</span>
                    <span className="text-[12px] font-semibold text-gray-900 font-metric">{d.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-gray-900 rounded-full h-1.5 transition-all" style={{ width: `${(d.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Medical Aid */}
        <motion.div {...fade(5)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-blue-500" /> Medical Aid Distribution
          </h2>
          <div className="space-y-2.5">
            {data.medicalAidDistribution.map((m, i) => {
              const max = data.medicalAidDistribution[0]?.count || 1;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-gray-700">{m.scheme}</span>
                    <span className="text-[12px] font-semibold text-gray-900 font-metric">{m.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#3DA9D1] rounded-full h-1.5 transition-all" style={{ width: `${(m.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* NHI Readiness */}
      <motion.div {...fade(6)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-gray-900 mb-1 uppercase tracking-wider">NHI Readiness</h2>
        <p className="text-[11px] text-gray-500 mb-4">Preventive care engagement, chronic management, digital interaction</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-[28px] font-bold text-gray-900 font-metric">{Math.round((data.demographics.active / data.demographics.total) * 100)}%</p>
            <p className="text-[11px] text-gray-500">Patient Retention</p>
          </div>
          <div className="text-center">
            <p className="text-[28px] font-bold text-gray-900 font-metric">{data.engagement30d.notifications.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500">Touchpoints (30d)</p>
          </div>
          <div className="text-center">
            <p className="text-[28px] font-bold text-gray-900 font-metric">{data.engagement30d.bookings}</p>
            <p className="text-[11px] text-gray-500">Bookings (30d)</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
