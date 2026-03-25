"use client";

import { useState, useCallback } from "react";
import { Save, FileDown, Trash2, Loader2 } from "lucide-react";
import VoiceSummaryPlayer from "@/components/intake/VoiceSummaryPlayer";
import type { SOAPNote, ICD10Suggestion } from "@/lib/scribe/types";

interface Props {
  state: "idle" | "listening" | "paused" | "completed";
  soap: SOAPNote;
  transcript: string;
  icd10Codes: ICD10Suggestion[];
  selectedPatient: string;
  patientName?: string;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
}

export default function ScribeActionBar({
  state, soap, transcript, icd10Codes, selectedPatient, patientName,
  onSave, onDiscard, saving,
}: Props) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const handleExportPDF = useCallback(() => {
    try {
      sessionStorage.setItem("scribe-print-data", JSON.stringify({
        soap, transcript, icd10Codes,
        patientName: patientName || "Unknown",
        date: new Date().toISOString(),
      }));
      window.open("/dashboard/scribe/print", "_blank");
    } catch {
      alert("Failed to prepare PDF data");
    }
  }, [soap, transcript, icd10Codes, patientName]);

  const handleDiscard = useCallback(() => {
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      setTimeout(() => setConfirmDiscard(false), 3000);
      return;
    }
    setConfirmDiscard(false);
    onDiscard();
  }, [confirmDiscard, onDiscard]);

  if (state === "idle") return null;

  const showActions = state === "completed" || state === "paused";
  const summaryText = soap.assessment
    ? "Assessment: " + soap.assessment + ". Plan: " + soap.plan
    : "";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {showActions ? (
          <>
            <button
              onClick={onSave}
              disabled={saving || !selectedPatient}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save to Record"}
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white/70 text-sm font-medium transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>

            {summaryText && (
              <VoiceSummaryPlayer text={summaryText} label="Read Summary" />
            )}

            <div className="flex-1" />

            <button
              onClick={handleDiscard}
              className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors " + (
                confirmDiscard
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-zinc-900/50 text-white/40 hover:bg-red-500/10 hover:text-red-400"
              )}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDiscard ? "Confirm Discard?" : "Discard"}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-white/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium">Recording in progress...</span>
          </div>
        )}
      </div>
    </div>
  );
}
