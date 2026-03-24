"use client";

import { useState } from "react";
import { ShieldCheck, Pill, Calendar, AlertTriangle, CheckCircle, Clock, Bell, TestTube } from "lucide-react";

/* ── DMARD Adherence Tracking ── */

interface PatientDMARD {
  id: string;
  name: string;
  diagnosis: string;
  medications: {
    drug: string;
    dose: string;
    frequency: string;
    dayOfWeek?: string; // for weekly meds like MTX
    startDate: string;
    adherenceRate: number; // 0-100%
    lastConfirmed: string;
    nextDue: string;
  }[];
  monitoring: {
    test: string;
    frequency: string;
    lastDone: string;
    nextDue: string;
    overdue: boolean;
    result?: string;
  }[];
}

const PATIENTS: PatientDMARD[] = [
  {
    id: "P001", name: "Mrs N. Mokoena", diagnosis: "RA (M05.8)",
    medications: [
      { drug: "Methotrexate", dose: "20mg", frequency: "Weekly (Thursday)", dayOfWeek: "Thursday", startDate: "2025-06-15", adherenceRate: 85, lastConfirmed: "2026-03-20", nextDue: "2026-03-27" },
      { drug: "Folic Acid", dose: "5mg", frequency: "Daily (except MTX day)", startDate: "2025-06-15", adherenceRate: 70, lastConfirmed: "2026-03-22", nextDue: "2026-03-23" },
    ],
    monitoring: [
      { test: "FBC + Differential", frequency: "Monthly", lastDone: "2026-03-01", nextDue: "2026-04-01", overdue: false, result: "Normal" },
      { test: "LFTs (ALT, AST, GGT)", frequency: "Monthly", lastDone: "2026-03-01", nextDue: "2026-04-01", overdue: false, result: "ALT mildly elevated (48)" },
      { test: "Creatinine + eGFR", frequency: "3-Monthly", lastDone: "2026-01-15", nextDue: "2026-04-15", overdue: false, result: "Normal" },
    ],
  },
  {
    id: "P003", name: "Ms L. Sibanda", diagnosis: "SLE (M32.1)",
    medications: [
      { drug: "Hydroxychloroquine", dose: "400mg", frequency: "Daily", startDate: "2024-11-20", adherenceRate: 95, lastConfirmed: "2026-03-23", nextDue: "2026-03-24" },
      { drug: "Azathioprine", dose: "100mg", frequency: "Daily", startDate: "2025-03-10", adherenceRate: 90, lastConfirmed: "2026-03-23", nextDue: "2026-03-24" },
      { drug: "Prednisone", dose: "7.5mg", frequency: "Daily (tapering)", startDate: "2026-02-01", adherenceRate: 100, lastConfirmed: "2026-03-23", nextDue: "2026-03-24" },
    ],
    monitoring: [
      { test: "FBC + Differential", frequency: "Monthly", lastDone: "2026-02-15", nextDue: "2026-03-15", overdue: true, result: "Pending" },
      { test: "Ophthalmology (retinal)", frequency: "Annual", lastDone: "2025-09-20", nextDue: "2026-09-20", overdue: false, result: "No maculopathy" },
      { test: "dsDNA + Complement (C3/C4)", frequency: "3-Monthly", lastDone: "2026-01-10", nextDue: "2026-04-10", overdue: false, result: "C3 low, C4 normal" },
      { test: "Urine PCR", frequency: "3-Monthly", lastDone: "2026-01-10", nextDue: "2026-04-10", overdue: false, result: "0.08 (normal)" },
    ],
  },
  {
    id: "P004", name: "Mrs P. Zwane", diagnosis: "PsA (M07.3)",
    medications: [
      { drug: "Adalimumab", dose: "40mg SC", frequency: "Every 2 weeks (Monday)", dayOfWeek: "Monday", startDate: "2025-09-01", adherenceRate: 100, lastConfirmed: "2026-03-17", nextDue: "2026-03-31" },
      { drug: "Methotrexate", dose: "15mg", frequency: "Weekly (Wednesday)", dayOfWeek: "Wednesday", startDate: "2025-03-01", adherenceRate: 92, lastConfirmed: "2026-03-19", nextDue: "2026-03-26" },
    ],
    monitoring: [
      { test: "FBC + Differential", frequency: "3-Monthly", lastDone: "2026-01-20", nextDue: "2026-04-20", overdue: false, result: "Normal" },
      { test: "LFTs", frequency: "3-Monthly", lastDone: "2026-01-20", nextDue: "2026-04-20", overdue: false, result: "Normal" },
      { test: "TB Screening", frequency: "Annual", lastDone: "2025-08-15", nextDue: "2026-08-15", overdue: false, result: "Negative" },
    ],
  },
];

function AdherenceRing({ rate }: { rate: number }) {
  const color = rate >= 90 ? "text-emerald-500" : rate >= 70 ? "text-amber-500" : "text-red-500";
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (rate / 100) * circumference;
  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="none" className="text-[#1D3443]/5" />
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="none" className={color}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${color}`}>{rate}%</span>
    </div>
  );
}

export default function DMARDAdherencePage() {
  const overdueTests = PATIENTS.flatMap(p => p.monitoring.filter(m => m.overdue).map(m => ({ patient: p.name, test: m.test, due: m.nextDue })));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
          DMARD Adherence & Monitoring
        </h1>
        <p className="text-sm text-[#1D3443]/60 mt-1">
          Track medication adherence via WhatsApp confirmations + blood test monitoring schedules
        </p>
      </div>

      {/* Overdue Tests Alert */}
      {overdueTests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Overdue Blood Tests</h3>
          </div>
          <div className="space-y-1">
            {overdueTests.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-amber-700">{t.patient} — {t.test}</span>
                <span className="text-xs text-amber-600 font-mono">Due: {t.due}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Cards */}
      <div className="space-y-4">
        {PATIENTS.map(patient => (
          <div key={patient.id} className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#1D3443]">{patient.name}</h3>
                <p className="text-sm text-[#1D3443]/60">{patient.diagnosis}</p>
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-3 mb-4">
              <h4 className="text-xs font-semibold text-[#1D3443]/50 uppercase tracking-wider">Medications</h4>
              {patient.medications.map(med => (
                <div key={med.drug} className="flex items-center gap-4 p-3 bg-[#1D3443]/[0.02] rounded-lg">
                  <AdherenceRing rate={med.adherenceRate} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span className="font-medium text-[#1D3443] text-sm">{med.drug} {med.dose}</span>
                    </div>
                    <div className="text-xs text-[#1D3443]/50 mt-0.5">{med.frequency}</div>
                  </div>
                  <div className="text-right text-xs text-[#1D3443]/50">
                    <div>Last: {med.lastConfirmed}</div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" />
                      Next: <span className="font-medium text-[#1D3443]">{med.nextDue}</span>
                      {med.dayOfWeek && <span className="text-teal-600">({med.dayOfWeek})</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Monitoring */}
            <div>
              <h4 className="text-xs font-semibold text-[#1D3443]/50 uppercase tracking-wider mb-2">Blood Test Monitoring</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {patient.monitoring.map(m => (
                  <div key={m.test} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${m.overdue ? "bg-amber-50 border border-amber-200" : "bg-[#1D3443]/[0.02]"}`}>
                    {m.overdue ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#1D3443] truncate">{m.test}</div>
                      <div className="text-[10px] text-[#1D3443]/40">Every {m.frequency.toLowerCase()} — Next: {m.nextDue}</div>
                    </div>
                    {m.result && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.result.includes("elevated") || m.result.includes("low") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {m.result}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
