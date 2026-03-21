"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Stethoscope,
  Pill,
  ShieldAlert,
  Heart,
  FileText,
  CheckCircle2,
  ChevronDown,
  Save,
  FileDown,
  Activity,
  Brain,
} from "lucide-react";
import type { IntakeAnalysis } from "@/lib/intake-analyzer";

interface Props {
  analysis: IntakeAnalysis;
  transcript: string;
  patientName?: string;
  onSave: (analysis: IntakeAnalysis) => Promise<void>;
  onExport: (format: "pdf" | "fhir") => void;
  saving?: boolean;
}

const severityColors = {
  mild: "bg-green-500/10 text-green-400 border-green-500/20",
  moderate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  severe: "bg-red-500/10 text-red-400 border-red-500/20",
  "life-threatening": "bg-red-600/20 text-red-300 border-red-500/40",
};

function Section({
  title,
  icon: Icon,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: any;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <Icon className="w-4 h-4 text-white/50" />
        <span className="text-sm font-semibold text-white/90 flex-1">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-400">
            {badge}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="px-5 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export default function IntakeReview({ analysis, transcript, patientName, onSave, onExport, saving }: Props) {
  const a = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Red Flags Banner */}
      {a.redFlags.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300 mb-1">Red Flags Detected</p>
            <ul className="space-y-1">
              {a.redFlags.map((flag, i) => (
                <li key={i} className="text-xs text-red-400/80">• {flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Chief Complaint + Summary */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">AI Clinical Summary</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{a.chiefComplaint}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{a.clinicalSummary}</p>
        {a.historyOfPresentIllness && (
          <p className="text-sm text-white/50 leading-relaxed mt-3 pt-3 border-t border-white/[0.04]">
            {a.historyOfPresentIllness}
          </p>
        )}
      </div>

      {/* ICD-10 Codes */}
      {a.icd10Suggestions.length > 0 && (
        <Section title="ICD-10 Codes" icon={FileText} badge={`${a.icd10Suggestions.length} suggested`}>
          <div className="space-y-2">
            {a.icd10Suggestions.map((code, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">{code.code}</span>
                  <span className="text-sm text-white/70">{code.description}</span>
                </div>
                <span className="text-xs text-white/40">{code.confidence}% conf</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Symptoms */}
      {a.symptoms.length > 0 && (
        <Section title="Symptoms" icon={Activity} badge={`${a.symptoms.length} identified`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {a.symptoms.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white/80">{s.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[s.severity]}`}>
                    {s.severity}
                  </span>
                </div>
                {s.duration && <p className="text-xs text-white/40">Duration: {s.duration}</p>}
                {s.location && <p className="text-xs text-white/40">Location: {s.location}</p>}
                {s.notes && <p className="text-xs text-white/30 mt-1">{s.notes}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Medications */}
      {a.medications.length > 0 && (
        <Section title="Medications" icon={Pill} badge={`${a.medications.length}`} defaultOpen={false}>
          <div className="space-y-2">
            {a.medications.map((m, i) => (
              <div key={i} className="flex items-center gap-4 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-sm font-medium text-white/80 flex-1">{m.name}</span>
                <span className="text-xs text-white/40">{m.dosage}</span>
                <span className="text-xs text-white/40">{m.frequency}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Allergies */}
      {a.allergies.length > 0 && (
        <Section title="Allergies" icon={ShieldAlert} badge={`${a.allergies.length}`} defaultOpen={false}>
          <div className="space-y-2">
            {a.allergies.map((al, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <span className="text-sm font-medium text-white/80">{al.name}</span>
                  {al.reaction && <span className="text-xs text-white/40 ml-2">→ {al.reaction}</span>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[al.severity]}`}>
                  {al.severity}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Vitals Mentioned */}
      {Object.values(a.vitalsMentioned).some(v => v != null) && (
        <Section title="Vitals Mentioned" icon={Heart} defaultOpen={false}>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {a.vitalsMentioned.bloodPressureSys && (
              <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-lg font-bold text-white">{a.vitalsMentioned.bloodPressureSys}/{a.vitalsMentioned.bloodPressureDia || "?"}</div>
                <div className="text-[10px] text-white/40 mt-1">Blood Pressure</div>
              </div>
            )}
            {a.vitalsMentioned.heartRate && (
              <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-lg font-bold text-white">{a.vitalsMentioned.heartRate}</div>
                <div className="text-[10px] text-white/40 mt-1">Heart Rate</div>
              </div>
            )}
            {a.vitalsMentioned.temperature && (
              <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-lg font-bold text-white">{a.vitalsMentioned.temperature}°C</div>
                <div className="text-[10px] text-white/40 mt-1">Temperature</div>
              </div>
            )}
            {a.vitalsMentioned.painLevel != null && (
              <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-lg font-bold text-white">{a.vitalsMentioned.painLevel}/10</div>
                <div className="text-[10px] text-white/40 mt-1">Pain Level</div>
              </div>
            )}
            {a.vitalsMentioned.oxygenSat && (
              <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div className="text-lg font-bold text-white">{a.vitalsMentioned.oxygenSat}%</div>
                <div className="text-[10px] text-white/40 mt-1">SpO2</div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Recommended Actions */}
      {a.recommendedActions.length > 0 && (
        <Section title="Recommended Actions" icon={Stethoscope} defaultOpen={false}>
          <ul className="space-y-2">
            {a.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/60">{action}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <button
          onClick={() => onSave(analysis)}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save to Patient Record"}
        </button>
        <button
          onClick={() => onExport("pdf")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export PDF
        </button>
        <button
          onClick={() => onExport("fhir")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium transition-colors"
        >
          <FileText className="w-4 h-4" />
          FHIR Bundle
        </button>
      </div>
    </motion.div>
  );
}
