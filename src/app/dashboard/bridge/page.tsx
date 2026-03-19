"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, XCircle, Zap, FileText, Receipt,
  Stethoscope, Pill, AlertTriangle, Clock, Building2,
} from "lucide-react";

const BEFORE_STEPS = [
  { step: "Doctor sees patient", system: "CareOn EMR", icon: Stethoscope, detail: "Clinical notes, vitals, lab orders on iPad" },
  { step: "Doctor finishes consult", system: "CareOn EMR", icon: FileText, detail: "Discharge summary, prescriptions written" },
  { step: "Doctor opens SEPARATE system", system: "Own PMS", icon: Receipt, detail: "Healthbridge / GoodX / Elixir on desktop" },
  { step: "Re-enters diagnosis codes", system: "Own PMS", icon: AlertTriangle, detail: "Manually types ICD-10 codes (error-prone)" },
  { step: "Submits claim", system: "Own PMS", icon: Receipt, detail: "Via SwitchOn to medical aid" },
  { step: "Claim rejected", system: "Medical Aid", icon: XCircle, detail: "15-25% rejection rate. R50-R150 rework cost." },
];

const AFTER_STEPS = [
  { step: "Doctor sees patient", system: "CareOn EMR", icon: Stethoscope, detail: "Clinical notes, vitals, lab orders on iPad" },
  { step: "AI extracts billing data", system: "VisioHealth OS", icon: Zap, detail: "ICD-10-ZA codes auto-suggested from clinical notes" },
  { step: "AI validates claim", system: "VisioHealth OS", icon: CheckCircle2, detail: "NAPPI, PMB benefits, scheme rules checked instantly" },
  { step: "Clean claim submitted", system: "SwitchOn", icon: Receipt, detail: "Pre-validated. Under 5% rejection rate." },
  { step: "eRA auto-reconciled", system: "VisioHealth OS", icon: CheckCircle2, detail: "Payment matched automatically. No Excel." },
];

export default function BridgePage() {
  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-[#E3964C]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">The Integration Gap</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">CareOn + PMS Bridge</h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          Doctors work in two systems that do not talk to each other. CareOn for clinical work, their own PMS for billing.
          VisioHealth OS bridges this gap with AI.
        </p>
      </div>

      {/* Before/After comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* BEFORE */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-[15px] font-semibold text-red-600">Before — Two Disconnected Systems</h2>
          </div>
          <div className="space-y-2">
            {BEFORE_STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-red-100 bg-red-50/30">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{step.step}</div>
                  <div className="text-[11px] text-gray-500">{step.detail}</div>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">{step.system}</span>
                </div>
                <step.icon className="w-4 h-4 text-red-400 shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-[12px] text-red-700 font-semibold">Impact</div>
            <div className="text-[11px] text-red-600 mt-1">15-20 min wasted per encounter. 5-15% revenue leakage from coding errors. R50-R150 per rejected claim rework.</div>
          </div>
        </div>

        {/* AFTER */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-[15px] font-semibold text-green-600">After — AI-Bridged Workflow</h2>
          </div>
          <div className="space-y-2">
            {AFTER_STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-green-100 bg-green-50/30">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-600 shrink-0 mt-0.5">{i + 1}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{step.step}</div>
                  <div className="text-[11px] text-gray-500">{step.detail}</div>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">{step.system}</span>
                </div>
                <step.icon className="w-4 h-4 text-green-500 shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-[12px] text-green-700 font-semibold">Impact</div>
            <div className="text-[11px] text-green-600 mt-1">15-20 min saved per encounter. Under 5% rejection rate. R21.6M/year recovered. Zero double-entry.</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Time Saved Per Encounter", value: "15-20 min", color: "#3DA9D1" },
          { label: "Rejection Rate Reduction", value: "15% to <5%", color: "#10B981" },
          { label: "Annual Revenue Recovered", value: "R21.6M", color: "#E3964C" },
          { label: "Practitioners Affected", value: "568", color: "#1D3443" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <div className="text-2xl font-bold font-metric" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-[#1D3443] text-center">
        <p className="text-[12px] text-white/60">
          This is the #1 pain point for every doctor at Netcare. VisioHealth OS is the only platform that bridges CareOn and private PMS billing.
        </p>
      </div>
    </div>
  );
}
