"use client";

import { useState } from "react";
import {
  Activity, AlertTriangle, TrendingUp, TrendingDown, Users,
  Shield, Pill, FileText, BarChart3, Target, Heart,
  ChevronDown, Search, Filter, ArrowUpRight
} from "lucide-react";

// Simulated practitioner coding quality data across Medicross network
const PRACTITIONERS = [
  { name: "Dr R. Govender", clinic: "Medicross Sandton", type: "GP", patients: 312, rCodeRate: 8.2, rejectionRate: 3.2, cdlCompliance: 96, pmcCompliance: 98, avgSpecificity: 4.1, score: 94, trend: "up" },
  { name: "Dr A. Patel", clinic: "Medicross Fourways", type: "GP", patients: 287, rCodeRate: 12.4, rejectionRate: 4.1, cdlCompliance: 91, pmcCompliance: 95, avgSpecificity: 3.8, score: 88, trend: "up" },
  { name: "Dr M. Sithole", clinic: "Medicross Soweto", type: "GP", patients: 410, rCodeRate: 31.2, rejectionRate: 8.7, cdlCompliance: 72, pmcCompliance: 81, avgSpecificity: 2.9, score: 61, trend: "down" },
  { name: "Dr L. van der Merwe", clinic: "Medicross Rosebank", type: "Dentist", patients: 198, rCodeRate: 2.1, rejectionRate: 2.8, cdlCompliance: 99, pmcCompliance: 100, avgSpecificity: 4.6, score: 97, trend: "stable" },
  { name: "Dr N. Naidoo", clinic: "Medicross Pretoria East", type: "GP", patients: 245, rCodeRate: 22.8, rejectionRate: 6.5, cdlCompliance: 78, pmcCompliance: 85, avgSpecificity: 3.2, score: 72, trend: "down" },
  { name: "Dr S. Mokoena", clinic: "Medicross Benoni", type: "GP", patients: 298, rCodeRate: 9.5, rejectionRate: 3.8, cdlCompliance: 94, pmcCompliance: 96, avgSpecificity: 4.0, score: 91, trend: "up" },
  { name: "Dr J. Botha", clinic: "Medicross Sandton", type: "Dentist", patients: 176, rCodeRate: 1.8, rejectionRate: 2.1, cdlCompliance: 100, pmcCompliance: 100, avgSpecificity: 4.7, score: 98, trend: "stable" },
  { name: "Dr T. Dlamini", clinic: "Medicross Soweto", type: "GP", patients: 445, rCodeRate: 35.1, rejectionRate: 9.2, cdlCompliance: 68, pmcCompliance: 76, avgSpecificity: 2.6, score: 55, trend: "down" },
  { name: "Dr P. Mabena", clinic: "Medicross Durban", type: "GP", patients: 267, rCodeRate: 18.4, rejectionRate: 5.4, cdlCompliance: 82, pmcCompliance: 88, avgSpecificity: 3.4, score: 78, trend: "down" },
  { name: "Dr K. Steenkamp", clinic: "Medicross Fourways", type: "Optometrist", patients: 156, rCodeRate: 3.2, rejectionRate: 1.9, cdlCompliance: 97, pmcCompliance: 99, avgSpecificity: 4.4, score: 96, trend: "stable" },
];

const DRUG_ALERTS = [
  { patient: "Maria S.", drugs: ["Metformin 500mg", "Ciprofloxacin 500mg"], severity: "high", alert: "Ciprofloxacin + Metformin = risk of hypoglycemia and lactic acidosis", practitioner: "Dr M. Sithole", clinic: "Medicross Soweto", time: "2 hours ago" },
  { patient: "James K.", drugs: ["Warfarin 5mg", "Ibuprofen 400mg"], severity: "critical", alert: "NSAIDs + Warfarin = increased bleeding risk. Consider Paracetamol instead.", practitioner: "Dr N. Naidoo", clinic: "Medicross Pretoria East", time: "4 hours ago" },
  { patient: "Thandi M.", drugs: ["Enalapril 10mg", "Potassium supplement"], severity: "moderate", alert: "ACE inhibitor + Potassium = risk of hyperkalemia. Monitor K+ levels.", practitioner: "Dr A. Patel", clinic: "Medicross Fourways", time: "Yesterday" },
  { patient: "David R.", drugs: ["Simvastatin 40mg", "Erythromycin"], severity: "high", alert: "Macrolide + Statin = increased risk of rhabdomyolysis. Switch to Azithromycin.", practitioner: "Dr T. Dlamini", clinic: "Medicross Soweto", time: "Yesterday" },
];

const CDL_CONDITIONS = [
  { condition: "Hypertension", icd10: "I10", patients: 12450, compliant: 11200, percentage: 90 },
  { condition: "Type 2 Diabetes", icd10: "E11", patients: 8320, compliant: 7150, percentage: 86 },
  { condition: "Asthma", icd10: "J45", patients: 5680, compliant: 5200, percentage: 92 },
  { condition: "Hypothyroidism", icd10: "E03", patients: 3240, compliant: 3050, percentage: 94 },
  { condition: "COPD", icd10: "J44", patients: 2180, compliant: 1850, percentage: 85 },
  { condition: "Epilepsy", icd10: "G40", patients: 1560, compliant: 1420, percentage: 91 },
  { condition: "Rheumatoid Arthritis", icd10: "M05", patients: 890, compliant: 820, percentage: 92 },
  { condition: "HIV/AIDS", icd10: "B20", patients: 15200, compliant: 14100, percentage: 93 },
  { condition: "Depression", icd10: "F32", patients: 4120, compliant: 3400, percentage: 83 },
  { condition: "Bipolar Disorder", icd10: "F31", patients: 1240, compliant: 1050, percentage: 85 },
];

const NETWORK_STATS = [
  { label: "Network Avg Rejection Rate", value: "4.8%", target: "<5%", status: "good" },
  { label: "R-Code Overuse Rate", value: "14.2%", target: "<10%", status: "warning" },
  { label: "CDL Registration Rate", value: "89%", target: ">95%", status: "warning" },
  { label: "PMB Compliance", value: "92%", target: ">95%", status: "warning" },
  { label: "ICD-10 Specificity Score", value: "3.7/5", target: ">4.0", status: "warning" },
  { label: "Drug Interaction Alerts (30d)", value: "47", target: "Monitor", status: "alert" },
];

export default function ClinicalQualityPage() {
  const [tab, setTab] = useState<"overview" | "practitioners" | "drugs" | "cdl">("overview");
  const [sortBy, setSortBy] = useState<"score" | "rejectionRate" | "rCodeRate">("score");

  const sorted = [...PRACTITIONERS].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "rejectionRate") return b.rejectionRate - a.rejectionRate;
    return b.rCodeRate - a.rCodeRate;
  });

  const scoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-red-100 text-red-700 border-red-200";
    if (s === "high") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[11px] text-[#3DA9D1] font-semibold uppercase tracking-widest mb-1">
          <Activity className="w-4 h-4" /> Medical Director Dashboard
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Quality Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">Practitioner coding quality, drug safety alerts, CDL compliance — across all 88 sites</p>
      </div>

      {/* Network stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {NETWORK_STATS.map((stat, i) => (
          <div key={i} className={`p-3 rounded-xl border ${
            stat.status === "good" ? "border-emerald-200 bg-emerald-50" :
            stat.status === "warning" ? "border-amber-200 bg-amber-50" :
            "border-red-200 bg-red-50"
          }`}>
            <div className={`text-lg font-bold ${
              stat.status === "good" ? "text-emerald-700" :
              stat.status === "warning" ? "text-amber-700" :
              "text-red-700"
            }`}>{stat.value}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{stat.label}</div>
            <div className="text-[9px] text-gray-400 mt-1">Target: {stat.target}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: "overview" as const, label: "Overview", icon: BarChart3 },
          { id: "practitioners" as const, label: "Practitioners", icon: Users },
          { id: "drugs" as const, label: "Drug Safety Alerts", icon: Pill },
          { id: "cdl" as const, label: "CDL Compliance", icon: Heart },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* At-risk practitioners */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">Practitioners Needing Attention</h3>
            </div>
            <div className="space-y-2">
              {sorted.filter(p => p.score < 75).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.clinic} — {p.type}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-red-600">{p.rCodeRate}%</div>
                      <div className="text-gray-400">R-codes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{p.rejectionRate}%</div>
                      <div className="text-gray-400">Rejections</div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg border font-bold ${scoreColor(p.score)}`}>
                      {p.score}/100
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent drug alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900">Recent Drug Interaction Alerts</h3>
            </div>
            <div className="space-y-2">
              {DRUG_ALERTS.slice(0, 3).map((alert, i) => (
                <div key={i} className={`p-3 rounded-lg border ${severityColor(alert.severity)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        alert.severity === "critical" ? "bg-red-600 text-white" :
                        alert.severity === "high" ? "bg-orange-500 text-white" :
                        "bg-yellow-500 text-white"
                      }`}>{alert.severity}</span>
                      <span className="text-xs font-medium">{alert.patient} — {alert.practitioner}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{alert.time}</span>
                  </div>
                  <div className="text-xs text-gray-600">{alert.drugs.join(" + ")}</div>
                  <div className="text-xs font-medium mt-1">{alert.alert}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top performers */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900">Top Coding Quality Practitioners</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sorted.filter(p => p.score >= 90).slice(0, 3).map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                  <div className="text-lg font-bold text-emerald-700">{p.score}/100</div>
                  <div className="text-xs font-medium text-gray-900 mt-1">{p.name}</div>
                  <div className="text-[10px] text-gray-500">{p.clinic}</div>
                  <div className="text-[10px] text-emerald-600 mt-1">{p.rejectionRate}% rejection • {p.rCodeRate}% R-codes</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRACTITIONERS TAB */}
      {tab === "practitioners" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">All Practitioners — Coding Quality</h3>
            <div className="flex gap-2">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                <option value="score">Sort by Score</option>
                <option value="rejectionRate">Sort by Rejection Rate</option>
                <option value="rCodeRate">Sort by R-Code Usage</option>
              </select>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-3 font-medium text-gray-500">Practitioner</th>
                <th className="text-left p-3 font-medium text-gray-500">Clinic</th>
                <th className="text-center p-3 font-medium text-gray-500">Patients</th>
                <th className="text-center p-3 font-medium text-gray-500">R-Code %</th>
                <th className="text-center p-3 font-medium text-gray-500">Rejection %</th>
                <th className="text-center p-3 font-medium text-gray-500">CDL %</th>
                <th className="text-center p-3 font-medium text-gray-500">Specificity</th>
                <th className="text-center p-3 font-medium text-gray-500">Score</th>
                <th className="text-center p-3 font-medium text-gray-500">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{p.name}</td>
                  <td className="p-3 text-gray-500">{p.clinic}</td>
                  <td className="p-3 text-center text-gray-600">{p.patients}</td>
                  <td className="p-3 text-center">
                    <span className={p.rCodeRate > 15 ? "text-red-600 font-bold" : p.rCodeRate > 10 ? "text-amber-600" : "text-emerald-600"}>
                      {p.rCodeRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={p.rejectionRate > 6 ? "text-red-600 font-bold" : p.rejectionRate > 4 ? "text-amber-600" : "text-emerald-600"}>
                      {p.rejectionRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={p.cdlCompliance < 80 ? "text-red-600 font-bold" : p.cdlCompliance < 90 ? "text-amber-600" : "text-emerald-600"}>
                      {p.cdlCompliance}%
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-600">{p.avgSpecificity}/5</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${scoreColor(p.score)}`}>
                      {p.score}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {p.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> :
                     p.trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-500 mx-auto" /> :
                     <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DRUG SAFETY TAB */}
      {tab === "drugs" && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Drug Interaction Monitoring — Real-Time
            </h3>
            <p className="text-xs text-red-600 mt-1">
              AI cross-references every prescription against the patient&apos;s active medications using NAPPI codes and pharmacological interaction databases. Alerts are generated before the prescription is finalised.
            </p>
          </div>
          {DRUG_ALERTS.map((alert, i) => (
            <div key={i} className={`p-4 rounded-xl border ${severityColor(alert.severity)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === "critical" ? "bg-red-600 text-white" :
                    alert.severity === "high" ? "bg-orange-500 text-white" :
                    "bg-yellow-500 text-white"
                  }`}>{alert.severity}</span>
                  <span className="text-sm font-medium text-gray-900">{alert.patient}</span>
                </div>
                <span className="text-xs text-gray-400">{alert.time}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {alert.drugs.map((drug, j) => (
                  <span key={j} className="px-2 py-0.5 rounded bg-white border text-xs font-medium">{drug}</span>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-800">{alert.alert}</p>
              <div className="text-xs text-gray-500 mt-2">{alert.practitioner} — {alert.clinic}</div>
            </div>
          ))}
        </div>
      )}

      {/* CDL COMPLIANCE TAB */}
      {tab === "cdl" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Chronic Disease List — Network Compliance
            </h3>
            <p className="text-xs text-blue-600 mt-1">
              Tracks PMB chronic condition registration and treatment compliance across all 88 sites. All 27 CDL conditions monitored against CMS requirements.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-3 font-medium text-gray-500">Condition</th>
                  <th className="text-left p-3 font-medium text-gray-500">ICD-10</th>
                  <th className="text-center p-3 font-medium text-gray-500">Total Patients</th>
                  <th className="text-center p-3 font-medium text-gray-500">Compliant</th>
                  <th className="text-center p-3 font-medium text-gray-500">Rate</th>
                  <th className="p-3 font-medium text-gray-500">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {CDL_CONDITIONS.sort((a, b) => a.percentage - b.percentage).map((c, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="p-3 font-medium text-gray-900">{c.condition}</td>
                    <td className="p-3 text-gray-500 font-mono">{c.icd10}</td>
                    <td className="p-3 text-center text-gray-600">{c.patients.toLocaleString()}</td>
                    <td className="p-3 text-center text-gray-600">{c.compliant.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={c.percentage < 85 ? "text-red-600 font-bold" : c.percentage < 90 ? "text-amber-600" : "text-emerald-600"}>
                        {c.percentage}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="w-full h-2 rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${
                          c.percentage >= 90 ? "bg-emerald-500" : c.percentage >= 85 ? "bg-amber-500" : "bg-red-500"
                        }`} style={{ width: `${c.percentage}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Data covers all 27 CDL conditions as per Medical Schemes Act. Top 10 shown by patient volume.
            Total CDL patients across network: {CDL_CONDITIONS.reduce((s, c) => s + c.patients, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
