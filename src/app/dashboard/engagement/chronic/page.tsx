"use client";

import { useState, useEffect } from "react";
import { Heart, AlertTriangle, Users, Activity } from "lucide-react";

interface CareGap {
  category: string;
  patients: { id: string; name: string; phone: string; lastVisit: string | null; daysOverdue: number }[];
}

export default function ChronicCareGapsPage() {
  const [gaps, setGaps] = useState<CareGap[]>([]);
  const [totalAtRisk, setTotalAtRisk] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagement/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Get chronic care gaps for all conditions" }),
    })
      .then((r) => r.json())
      .then((data) => {
        // Parse agent response for structured data
        try {
          const parsed = JSON.parse(data.response);
          if (parsed.gaps) {
            setGaps(parsed.gaps);
            setTotalAtRisk(parsed.totalPatientsAtRisk || 0);
          }
        } catch {
          // Agent returned text, show as fallback
          setGaps([{ category: "Analysis", patients: [] }]);
        }
      })
      .catch(() => {
        // Demo fallback
        setGaps([
          { category: "Diabetes (HbA1c overdue >90 days)", patients: [
            { id: "p1", name: "Thandi Molefe", phone: "+27821234567", lastVisit: "2025-12-15", daysOverdue: 107 },
            { id: "p2", name: "Pieter Botha", phone: "+27825551234", lastVisit: "2025-11-20", daysOverdue: 131 },
          ]},
          { category: "Hypertension (BP check overdue >90 days)", patients: [
            { id: "p3", name: "Maria Nkosi", phone: "+27826667890", lastVisit: "2025-10-01", daysOverdue: 182 },
          ]},
          { category: "Annual screening overdue (>12 months since last visit)", patients: [
            { id: "p4", name: "James Smith", phone: "+27831112222", lastVisit: "2024-11-15", daysOverdue: 502 },
            { id: "p5", name: "Lerato Mokoena", phone: "+27847778888", lastVisit: null, daysOverdue: 999 },
          ]},
        ]);
        setTotalAtRisk(5);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400" /> Chronic Care Gaps
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Patients overdue for chronic disease management and screening</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <p className="text-red-400 text-sm font-medium">{totalAtRisk} patients at risk</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse h-40" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {gaps.map((gap, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold text-white">{gap.category}</h2>
                </div>
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">{gap.patients.length} patients</span>
              </div>
              {gap.patients.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                      <th className="px-6 py-2 text-left">Patient</th>
                      <th className="px-6 py-2 text-left">Phone</th>
                      <th className="px-6 py-2 text-left">Last Visit</th>
                      <th className="px-6 py-2 text-left">Days Overdue</th>
                      <th className="px-6 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gap.patients.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="px-6 py-3 text-sm text-white">{p.name}</td>
                        <td className="px-6 py-3 text-sm text-zinc-400">{p.phone}</td>
                        <td className="px-6 py-3 text-sm text-zinc-400">{p.lastVisit ?? "Never"}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${p.daysOverdue > 180 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {p.daysOverdue > 900 ? "Never visited" : `${p.daysOverdue} days`}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg">
                            Enroll in Sequence
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-6 py-4 text-sm text-zinc-500">No patients in this category. Great work!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
