"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, Receipt, Clock, Star, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const PRACTITIONERS = [
  { name: "Dr R. Govender", type: "GP", clinic: "Medicross Sandton", revenue: 142000, target: 150000, patients: 312, rejection: 3.2, utilisation: 89, rating: 4.8, trend: "up" },
  { name: "Dr A. Patel", type: "GP", clinic: "Medicross Fourways", revenue: 128000, target: 130000, patients: 287, rejection: 4.1, utilisation: 82, rating: 4.6, trend: "up" },
  { name: "Dr M. Sithole", type: "GP", clinic: "Medicross Soweto", revenue: 156000, target: 140000, patients: 410, rejection: 8.7, utilisation: 95, rating: 4.3, trend: "down" },
  { name: "Dr L. van der Merwe", type: "Dentist", clinic: "Medicross Rosebank", revenue: 118000, target: 120000, patients: 198, rejection: 2.8, utilisation: 76, rating: 4.9, trend: "stable" },
  { name: "Dr N. Naidoo", type: "GP", clinic: "Medicross Pretoria East", revenue: 95000, target: 110000, patients: 245, rejection: 6.5, utilisation: 68, rating: 4.4, trend: "down" },
  { name: "Dr S. Mokoena", type: "GP", clinic: "Medicross Cape Town", revenue: 134000, target: 130000, patients: 298, rejection: 3.8, utilisation: 85, rating: 4.7, trend: "up" },
  { name: "Dr J. Botha", type: "Dentist", clinic: "Medicross Sandton", revenue: 108000, target: 100000, patients: 176, rejection: 2.1, utilisation: 78, rating: 4.8, trend: "up" },
  { name: "Dr T. Dlamini", type: "GP", clinic: "Medicross Soweto", revenue: 162000, target: 140000, patients: 445, rejection: 9.2, utilisation: 97, rating: 4.1, trend: "up" },
  { name: "Dr P. Mabena", type: "GP", clinic: "Medicross Durban", revenue: 112000, target: 120000, patients: 267, rejection: 5.4, utilisation: 73, rating: 4.5, trend: "down" },
  { name: "Dr K. Steenkamp", type: "Optometrist", clinic: "Medicross Fourways", revenue: 78000, target: 80000, patients: 156, rejection: 1.9, utilisation: 71, rating: 4.7, trend: "stable" },
];

function formatR(n: number) { return "R" + (n / 1000).toFixed(0) + "K"; }

export default function PractitionersPage() {
  const [sortBy, setSortBy] = useState<"revenue" | "rejection" | "utilisation" | "rating">("revenue");

  const sorted = [...PRACTITIONERS].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "rejection") return b.rejection - a.rejection;
    if (sortBy === "utilisation") return b.utilisation - a.utilisation;
    return b.rating - a.rating;
  });

  const avgRevenue = PRACTITIONERS.reduce((s, p) => s + p.revenue, 0) / PRACTITIONERS.length;
  const avgRejection = PRACTITIONERS.reduce((s, p) => s + p.rejection, 0) / PRACTITIONERS.length;
  const avgUtilisation = PRACTITIONERS.reduce((s, p) => s + p.utilisation, 0) / PRACTITIONERS.length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-[#1D3443]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Practitioner Intelligence</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">568 Practitioners — Performance Dashboard</h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          They are independent — you cannot tell them what to do. But you CAN give them data that changes behaviour.
          Revenue, rejection rates, utilisation, and patient ratings per practitioner.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avg Revenue / Practitioner", value: formatR(avgRevenue) + "/mo", color: "#1D3443", icon: DollarSign },
          { label: "Avg Rejection Rate", value: avgRejection.toFixed(1) + "%", color: avgRejection > 5 ? "#EF4444" : "#10B981", icon: Receipt },
          { label: "Avg Utilisation", value: avgUtilisation.toFixed(0) + "%", color: "#3DA9D1", icon: Clock },
          { label: "Practitioners Tracked", value: "568", color: "#E3964C", icon: Users },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white">
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <div className="text-xl font-bold font-metric text-gray-900">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-gray-500 font-medium">Sort by:</span>
        {[
          { key: "revenue" as const, label: "Revenue" },
          { key: "rejection" as const, label: "Rejection Rate" },
          { key: "utilisation" as const, label: "Utilisation" },
          { key: "rating" as const, label: "Rating" },
        ].map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              sortBy === s.key ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-600">Practitioner</th>
              <th className="text-left p-3 font-semibold text-gray-600">Type</th>
              <th className="text-left p-3 font-semibold text-gray-600">Clinic</th>
              <th className="text-right p-3 font-semibold text-gray-600">Revenue (MTD)</th>
              <th className="text-right p-3 font-semibold text-gray-600">Patients</th>
              <th className="text-right p-3 font-semibold text-gray-600">Rejection %</th>
              <th className="text-right p-3 font-semibold text-gray-600">Utilisation</th>
              <th className="text-right p-3 font-semibold text-gray-600">Rating</th>
              <th className="text-right p-3 font-semibold text-gray-600">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.name} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                <td className="p-3 font-medium text-gray-900">{p.name}</td>
                <td className="p-3 text-gray-500">{p.type}</td>
                <td className="p-3 text-gray-500">{p.clinic}</td>
                <td className={`p-3 text-right font-metric font-semibold ${p.revenue >= p.target ? "text-green-600" : "text-gray-900"}`}>{formatR(p.revenue)}</td>
                <td className="p-3 text-right font-metric">{p.patients}</td>
                <td className={`p-3 text-right font-metric font-semibold ${p.rejection > 7 ? "text-red-600" : p.rejection > 5 ? "text-amber-600" : "text-green-600"}`}>{p.rejection}%</td>
                <td className={`p-3 text-right font-metric ${p.utilisation > 90 ? "text-green-600 font-semibold" : p.utilisation < 70 ? "text-red-500" : ""}`}>{p.utilisation}%</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="font-metric">{p.rating}</span>
                  </div>
                </td>
                <td className="p-3 text-right">
                  {p.trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500 ml-auto" />}
                  {p.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500 ml-auto" />}
                  {p.trend === "stable" && <span className="text-gray-400 text-[11px]">&mdash;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-[13px] font-semibold text-amber-700">High Rejection Practitioners</span>
          </div>
          <div className="space-y-1">
            {PRACTITIONERS.filter(p => p.rejection > 7).map(p => (
              <div key={p.name} className="text-[12px] text-gray-600">
                {p.name} at {p.clinic}: <span className="font-semibold text-red-600">{p.rejection}%</span> — ICD-10 coding training recommended
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-green-200 bg-green-50/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-[13px] font-semibold text-green-700">Top Performers</span>
          </div>
          <div className="space-y-1">
            {PRACTITIONERS.filter(p => p.revenue >= p.target && p.rejection < 4).map(p => (
              <div key={p.name} className="text-[12px] text-gray-600">
                {p.name}: {formatR(p.revenue)}/mo, {p.rejection}% rejection, {p.rating} rating
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#1D3443] text-center">
        <p className="text-[12px] text-white/60">
          Showing 10 of 568 practitioners. Full network data available with VisioHealth OS deployment.
          Each practitioner gets anonymised peer benchmarking to drive improvement.
        </p>
      </div>
    </div>
  );
}
