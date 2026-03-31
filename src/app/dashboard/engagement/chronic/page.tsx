"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, AlertTriangle } from "lucide-react";

interface CareGap {
  category: string;
  patients: { id: string; name: string; phone: string; lastVisit: string | null; daysOverdue: number }[];
}

const fade = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } });

export default function ChronicCareGapsPage() {
  const [gaps, setGaps] = useState<CareGap[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo fallback
    setGaps([
      { category: "Diabetes — HbA1c overdue (>90 days)", patients: [
        { id: "p1", name: "Thandi Molefe", phone: "+27821234567", lastVisit: "2025-12-15", daysOverdue: 107 },
        { id: "p2", name: "Pieter Botha", phone: "+27825551234", lastVisit: "2025-11-20", daysOverdue: 131 },
      ]},
      { category: "Hypertension — BP check overdue (>90 days)", patients: [
        { id: "p3", name: "Maria Nkosi", phone: "+27826667890", lastVisit: "2025-10-01", daysOverdue: 182 },
      ]},
      { category: "Annual screening — Not seen in 12+ months", patients: [
        { id: "p4", name: "James Smith", phone: "+27831112222", lastVisit: "2024-11-15", daysOverdue: 502 },
        { id: "p5", name: "Lerato Mokoena", phone: "+27847778888", lastVisit: null, daysOverdue: 999 },
      ]},
    ]);
    setTotalAtRisk(5);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Chronic Care Gaps</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Patients overdue for chronic disease management and screening</p>
        </div>
        {totalAtRisk > 0 && (
          <div className="px-3.5 py-1.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[13px] font-medium text-red-600">{totalAtRisk} patients at risk</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white/60 border border-gray-100 rounded-xl p-6 animate-pulse h-36" />)}</div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap, gi) => (
            <motion.div key={gi} {...fade(gi)} className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <h2 className="text-[13px] font-semibold text-gray-900">{gap.category}</h2>
                </div>
                <span className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{gap.patients.length} patients</span>
              </div>
              {gap.patients.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-50">
                      <th className="px-5 py-2 text-left font-medium">Patient</th>
                      <th className="px-5 py-2 text-left font-medium">Phone</th>
                      <th className="px-5 py-2 text-left font-medium">Last Visit</th>
                      <th className="px-5 py-2 text-left font-medium">Overdue</th>
                      <th className="px-5 py-2 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gap.patients.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-[13px] font-medium text-gray-900">{p.name}</td>
                        <td className="px-5 py-3 text-[13px] text-gray-500 font-mono text-[12px]">{p.phone}</td>
                        <td className="px-5 py-3 text-[13px] text-gray-500">{p.lastVisit ?? "Never"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${p.daysOverdue > 180 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                            {p.daysOverdue > 900 ? "Never visited" : `${p.daysOverdue} days`}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-[11px] font-medium bg-gray-900 hover:bg-gray-800 text-white px-3 py-1 rounded-lg transition-colors">
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-4 text-[13px] text-gray-400">No patients in this category.</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
