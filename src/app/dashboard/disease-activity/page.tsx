"use client";

import { useState } from "react";
import { Activity, Calculator, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

/* ── DAS28 Calculator ── */

interface DAS28Input {
  tenderJoints: number;  // 0-28
  swollenJoints: number; // 0-28
  esr: number;           // mm/hr
  patientGlobal: number; // 0-100 VAS
}

function calculateDAS28(input: DAS28Input): number {
  const { tenderJoints, swollenJoints, esr, patientGlobal } = input;
  return (
    0.56 * Math.sqrt(tenderJoints) +
    0.28 * Math.sqrt(swollenJoints) +
    0.70 * Math.log(esr || 1) +
    0.014 * patientGlobal
  );
}

function getDAS28Category(score: number): { label: string; color: string; icon: any; description: string } {
  if (score < 2.6) return { label: "Remission", color: "emerald", icon: CheckCircle, description: "Disease activity is well controlled. Continue current treatment." };
  if (score < 3.2) return { label: "Low Activity", color: "teal", icon: TrendingDown, description: "Mild disease activity. Monitor at next visit." };
  if (score < 5.1) return { label: "Moderate Activity", color: "amber", icon: AlertTriangle, description: "Consider treatment adjustment. Review DMARD dosing or add biologic." };
  return { label: "High Activity", color: "red", icon: TrendingUp, description: "Urgent treatment escalation needed. Consider biologic initiation or switch." };
}

/* ── CDAI Calculator ── */

interface CDAIInput {
  tenderJoints: number;  // 0-28
  swollenJoints: number; // 0-28
  patientGlobal: number; // 0-10
  providerGlobal: number; // 0-10
}

function calculateCDAI(input: CDAIInput): number {
  return input.tenderJoints + input.swollenJoints + input.patientGlobal + input.providerGlobal;
}

function getCDAICategory(score: number): { label: string; color: string } {
  if (score <= 2.8) return { label: "Remission", color: "emerald" };
  if (score <= 10) return { label: "Low Activity", color: "teal" };
  if (score <= 22) return { label: "Moderate Activity", color: "amber" };
  return { label: "High Activity", color: "red" };
}

/* ── Page ── */

export default function DiseaseActivityPage() {
  const [mode, setMode] = useState<"das28" | "cdai">("das28");

  // DAS28 state
  const [das28, setDas28] = useState<DAS28Input>({ tenderJoints: 0, swollenJoints: 0, esr: 20, patientGlobal: 50 });
  const das28Score = calculateDAS28(das28);
  const das28Cat = getDAS28Category(das28Score);
  const DAS28Icon = das28Cat.icon;

  // CDAI state
  const [cdai, setCdai] = useState<CDAIInput>({ tenderJoints: 0, swollenJoints: 0, patientGlobal: 5, providerGlobal: 5 });
  const cdaiScore = calculateCDAI(cdai);
  const cdaiCat = getCDAICategory(cdaiScore);

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    teal: "bg-teal-500/10 border-teal-500/30 text-teal-400",
    amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    red: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Disease Activity Calculator
          </h1>
          <p className="text-sm text-[#1D3443]/60 mt-1">
            Calculate DAS28-ESR and CDAI scores for treatment decisions
          </p>
        </div>
        <div className="flex rounded-lg border border-[#1D3443]/10 overflow-hidden">
          <button
            onClick={() => setMode("das28")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "das28" ? "bg-teal-600 text-white" : "bg-white text-[#1D3443]/60 hover:bg-[#1D3443]/5"}`}
          >
            DAS28-ESR
          </button>
          <button
            onClick={() => setMode("cdai")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${mode === "cdai" ? "bg-teal-600 text-white" : "bg-white text-[#1D3443]/60 hover:bg-[#1D3443]/5"}`}
          >
            CDAI
          </button>
        </div>
      </div>

      {mode === "das28" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-xl border border-[#1D3443]/10 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#1D3443] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              DAS28-ESR Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">
                  Tender Joint Count (0-28)
                </label>
                <input
                  type="range" min={0} max={28} value={das28.tenderJoints}
                  onChange={e => setDas28({ ...das28, tenderJoints: +e.target.value })}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-xs text-[#1D3443]/50">
                  <span>0</span>
                  <span className="font-bold text-teal-600 text-lg">{das28.tenderJoints}</span>
                  <span>28</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">
                  Swollen Joint Count (0-28)
                </label>
                <input
                  type="range" min={0} max={28} value={das28.swollenJoints}
                  onChange={e => setDas28({ ...das28, swollenJoints: +e.target.value })}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-xs text-[#1D3443]/50">
                  <span>0</span>
                  <span className="font-bold text-teal-600 text-lg">{das28.swollenJoints}</span>
                  <span>28</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">
                  ESR (mm/hr)
                </label>
                <input
                  type="number" min={1} max={200} value={das28.esr}
                  onChange={e => setDas28({ ...das28, esr: +e.target.value || 1 })}
                  className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">
                  Patient Global Assessment (0-100mm VAS)
                </label>
                <input
                  type="range" min={0} max={100} value={das28.patientGlobal}
                  onChange={e => setDas28({ ...das28, patientGlobal: +e.target.value })}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-xs text-[#1D3443]/50">
                  <span>Best (0)</span>
                  <span className="font-bold text-teal-600 text-lg">{das28.patientGlobal}mm</span>
                  <span>Worst (100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="space-y-4">
            <div className={`rounded-xl border p-6 ${colorMap[das28Cat.color]}`}>
              <div className="flex items-center gap-3 mb-4">
                <DAS28Icon className="w-8 h-8" />
                <div>
                  <div className="text-4xl font-bold">{das28Score.toFixed(2)}</div>
                  <div className="text-sm font-semibold uppercase tracking-wide">{das28Cat.label}</div>
                </div>
              </div>
              <p className="text-sm opacity-80">{das28Cat.description}</p>
            </div>

            {/* Reference Scale */}
            <div className="bg-white rounded-xl border border-[#1D3443]/10 p-6">
              <h3 className="text-sm font-semibold text-[#1D3443]/70 mb-3">DAS28-ESR Reference Scale</h3>
              <div className="space-y-2">
                {[
                  { range: "< 2.6", label: "Remission", color: "bg-emerald-500" },
                  { range: "2.6 – 3.2", label: "Low Activity", color: "bg-teal-500" },
                  { range: "3.2 – 5.1", label: "Moderate Activity", color: "bg-amber-500" },
                  { range: "> 5.1", label: "High Activity", color: "bg-red-500" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-[#1D3443]/60 w-24">{item.range}</span>
                    <span className="text-sm font-medium text-[#1D3443]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="bg-white rounded-xl border border-[#1D3443]/10 p-6">
              <h3 className="text-sm font-semibold text-[#1D3443]/70 mb-2">Clinical Guidance</h3>
              <ul className="text-xs text-[#1D3443]/60 space-y-1.5">
                <li>- DAS28 improvement of &gt;1.2 = good EULAR response</li>
                <li>- DAS28 improvement of 0.6-1.2 = moderate EULAR response</li>
                <li>- Treat-to-target: aim for remission (DAS28 &lt; 2.6) or low activity (&lt; 3.2)</li>
                <li>- If DAS28 &gt; 5.1 after 3 months of DMARD: escalate to biologic</li>
                <li>- SARAA biologic motivation requires documented DAS28 scores</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* CDAI Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#1D3443]/10 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-[#1D3443]">CDAI Parameters</h2>
            <div className="space-y-4">
              {[
                { label: "Tender Joints (0-28)", key: "tenderJoints" as const, max: 28 },
                { label: "Swollen Joints (0-28)", key: "swollenJoints" as const, max: 28 },
                { label: "Patient Global (0-10)", key: "patientGlobal" as const, max: 10 },
                { label: "Provider Global (0-10)", key: "providerGlobal" as const, max: 10 },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">{field.label}</label>
                  <input
                    type="range" min={0} max={field.max} value={cdai[field.key]}
                    onChange={e => setCdai({ ...cdai, [field.key]: +e.target.value })}
                    className="w-full accent-teal-600"
                  />
                  <div className="text-center font-bold text-teal-600 text-lg">{cdai[field.key]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={`rounded-xl border p-6 h-fit ${colorMap[cdaiCat.color]}`}>
            <div className="text-4xl font-bold">{cdaiScore.toFixed(1)}</div>
            <div className="text-sm font-semibold uppercase tracking-wide mt-1">{cdaiCat.label}</div>
            <div className="mt-4 text-xs opacity-70 space-y-1">
              <div>Remission: ≤ 2.8 | Low: ≤ 10 | Moderate: ≤ 22 | High: &gt; 22</div>
              <div className="mt-2">CDAI does not require ESR/CRP — useful for same-day treatment decisions.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
