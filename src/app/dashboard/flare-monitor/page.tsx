"use client";

import { useState } from "react";
import { Heart, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, Phone, Bell } from "lucide-react";

/* ── Flare Monitoring Dashboard ── */

interface PatientFlareData {
  id: string;
  name: string;
  diagnosis: string;
  lastCheckIn: string;
  stiffnessScore: number;    // 0-10
  swellingScore: number;     // 0-10
  fatigueScore: number;      // 0-10
  painScore: number;         // 0-10
  overallTrend: "improving" | "stable" | "worsening" | "flare";
  currentDMARDs: string[];
  nextAppointment: string;
  whatsappActive: boolean;
}

const MOCK_PATIENTS: PatientFlareData[] = [
  {
    id: "P001", name: "Mrs N. Mokoena", diagnosis: "RA (M05.8)",
    lastCheckIn: "2026-03-22", stiffnessScore: 8, swellingScore: 7, fatigueScore: 6, painScore: 7,
    overallTrend: "flare", currentDMARDs: ["Methotrexate 20mg/wk", "Folic Acid 5mg"], nextAppointment: "2026-03-28",
    whatsappActive: true,
  },
  {
    id: "P002", name: "Mr T. Dlamini", diagnosis: "AS (M45)",
    lastCheckIn: "2026-03-21", stiffnessScore: 3, swellingScore: 2, fatigueScore: 4, painScore: 3,
    overallTrend: "stable", currentDMARDs: ["Tocilizumab 8mg/kg IV q4w"], nextAppointment: "2026-04-15",
    whatsappActive: true,
  },
  {
    id: "P003", name: "Ms L. Sibanda", diagnosis: "SLE (M32.1)",
    lastCheckIn: "2026-03-20", stiffnessScore: 5, swellingScore: 4, fatigueScore: 8, painScore: 5,
    overallTrend: "worsening", currentDMARDs: ["Hydroxychloroquine 400mg", "Azathioprine 100mg"], nextAppointment: "2026-04-02",
    whatsappActive: true,
  },
  {
    id: "P004", name: "Mrs P. Zwane", diagnosis: "PsA (M07.3)",
    lastCheckIn: "2026-03-23", stiffnessScore: 2, swellingScore: 1, fatigueScore: 2, painScore: 2,
    overallTrend: "improving", currentDMARDs: ["Adalimumab 40mg SC q2w", "Methotrexate 15mg/wk"], nextAppointment: "2026-05-01",
    whatsappActive: false,
  },
  {
    id: "P005", name: "Mr K. Mthembu", diagnosis: "RA (M06.0)",
    lastCheckIn: "2026-03-18", stiffnessScore: 0, swellingScore: 0, fatigueScore: 1, painScore: 1,
    overallTrend: "stable", currentDMARDs: ["Rituximab q6m", "Methotrexate 20mg/wk"], nextAppointment: "2026-06-15",
    whatsappActive: true,
  },
];

const trendConfig = {
  flare: { label: "Active Flare", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle, priority: 0 },
  worsening: { label: "Worsening", color: "bg-amber-100 text-amber-700 border-amber-200", icon: TrendingUp, priority: 1 },
  stable: { label: "Stable", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle, priority: 2 },
  improving: { label: "Improving", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, priority: 3 },
};

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "bg-red-500" : score >= 4 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#1D3443]/50 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#1D3443]/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-[#1D3443]/70 w-6 text-right">{score}</span>
    </div>
  );
}

export default function FlareMonitorPage() {
  const sorted = [...MOCK_PATIENTS].sort((a, b) => trendConfig[a.overallTrend].priority - trendConfig[b.overallTrend].priority);
  const flaring = MOCK_PATIENTS.filter(p => p.overallTrend === "flare").length;
  const worsening = MOCK_PATIENTS.filter(p => p.overallTrend === "worsening").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
          <Heart className="w-6 h-6 text-teal-600" />
          Flare Monitoring
        </h1>
        <p className="text-sm text-[#1D3443]/60 mt-1">
          WhatsApp-based symptom tracking between visits — early flare detection
        </p>
      </div>

      {/* Alert Banner */}
      {(flaring > 0 || worsening > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-red-800">
              {flaring > 0 && `${flaring} patient${flaring > 1 ? "s" : ""} reporting active flare. `}
              {worsening > 0 && `${worsening} patient${worsening > 1 ? "s" : ""} trending worse.`}
            </span>
            <span className="text-sm text-red-600 ml-2">Consider early review.</span>
          </div>
          <button className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
            Contact All
          </button>
        </div>
      )}

      {/* WhatsApp Check-In Template */}
      <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-[#1D3443]">Weekly WhatsApp Check-In</h2>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-sm text-[#1D3443]/70 font-mono text-xs">
          <p>Hi [Patient], this is RheumCare. Your weekly check-in:</p>
          <p className="mt-1">1. Morning stiffness (0=none, 10=severe): _</p>
          <p>2. Joint swelling (0=none, 10=severe): _</p>
          <p>3. Fatigue (0=none, 10=severe): _</p>
          <p>4. Pain level (0=none, 10=worst): _</p>
          <p>5. Any new symptoms? (yes/no): _</p>
          <p className="mt-1">Reply with your numbers, e.g.: 3 2 4 3 no</p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#1D3443]/50">
          <Bell className="w-3.5 h-3.5" />
          Sent automatically every Monday at 9:00 AM to patients with WhatsApp enabled
        </div>
      </div>

      {/* Patient Cards */}
      <div className="space-y-3">
        {sorted.map(patient => {
          const trend = trendConfig[patient.overallTrend];
          const TrendIcon = trend.icon;
          const avgScore = ((patient.stiffnessScore + patient.swellingScore + patient.fatigueScore + patient.painScore) / 4).toFixed(1);
          return (
            <div key={patient.id} className={`bg-white rounded-xl border p-5 transition-colors ${patient.overallTrend === "flare" ? "border-red-300 ring-1 ring-red-100" : "border-[#1D3443]/10"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1D3443]">{patient.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${trend.color}`}>
                      <TrendIcon className="w-3 h-3 inline mr-1" />
                      {trend.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#1D3443]/60">{patient.diagnosis} — Last check-in: {patient.lastCheckIn}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#1D3443]">{avgScore}</div>
                  <div className="text-[10px] text-[#1D3443]/40">avg symptom score</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                <ScoreBar score={patient.stiffnessScore} label="Stiffness" />
                <ScoreBar score={patient.swellingScore} label="Swelling" />
                <ScoreBar score={patient.fatigueScore} label="Fatigue" />
                <ScoreBar score={patient.painScore} label="Pain" />
              </div>

              <div className="mt-3 pt-3 border-t border-[#1D3443]/5 flex items-center justify-between">
                <div className="text-xs text-[#1D3443]/50">
                  <span className="font-medium">Current Rx:</span> {patient.currentDMARDs.join(" + ")}
                </div>
                <div className="flex items-center gap-2">
                  {patient.whatsappActive && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </span>
                  )}
                  <span className="text-xs text-[#1D3443]/40">Next: {patient.nextAppointment}</span>
                  {patient.overallTrend === "flare" && (
                    <button className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Contact
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
