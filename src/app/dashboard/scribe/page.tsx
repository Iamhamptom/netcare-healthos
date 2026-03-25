"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { useScribeSession } from "@/hooks/useScribeSession";
import ScribeControls from "@/components/scribe/ScribeControls";
import LiveTranscript from "@/components/scribe/LiveTranscript";
import SOAPNotePanel from "@/components/scribe/SOAPNotePanel";
import ScribeActionBar from "@/components/scribe/ScribeActionBar";

export default function ScribePage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);

  const scribe = useScribeSession();

  // Load patients
  useEffect(() => {
    fetch("/api/patients")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPatients(data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedPatient || !scribe.analysis) return;

    setSaving(true);
    try {
      const res = await fetch("/api/scribe/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          soap: scribe.analysis.soap,
          transcript: scribe.segments.map(s => s.text).join("\n"),
          icd10Codes: scribe.analysis.icd10Codes,
          redFlags: scribe.analysis.redFlags,
          chiefComplaint: scribe.analysis.chiefComplaint,
        }),
      });

      if (res.ok) {
        alert("Consultation saved to patient record");
      } else {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        alert(err.error || "Save failed");
      }
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }, [selectedPatient, scribe.analysis, scribe.segments]);

  const emptySOAP = { subjective: "", objective: "", assessment: "", plan: "" };
  const soap = scribe.analysis?.soap || emptySOAP;
  const icd10Codes = scribe.analysis?.icd10Codes || [];
  const redFlags = scribe.analysis?.redFlags || [];
  const transcript = scribe.segments.map(s => s.text).join("\n");
  const patientName = patients.find(p => p.id === selectedPatient)?.name;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 -m-[1px] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Brain className="w-6 h-6 text-teal-400" />
            AI Clinical Scribe
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Ambient consultation recording with live SOAP note generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-teal-400 font-semibold">Powered by Gemini 2.5</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4">
        <ScribeControls
          state={scribe.state}
          duration={scribe.duration}
          audioLevel={scribe.audioLevel}
          selectedPatient={selectedPatient}
          patients={patients}
          onPatientChange={setSelectedPatient}
          onStart={scribe.start}
          onPause={scribe.pause}
          onResume={scribe.resume}
          onStop={scribe.stop}
        />
      </div>

      {/* Error */}
      {scribe.error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
        >
          <p className="text-sm text-red-300">{scribe.error}</p>
        </motion.div>
      )}

      {/* Main 2-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4" style={{ minHeight: "calc(100vh - 380px)" }}>
        {/* Left: Live Transcript */}
        <LiveTranscript
          segments={scribe.segments}
          voiceCommands={scribe.voiceCommands}
          isListening={scribe.state === "listening"}
        />

        {/* Right: SOAP Notes */}
        <SOAPNotePanel
          soap={soap}
          icd10Codes={icd10Codes}
          redFlags={redFlags}
          isAnalyzing={scribe.isAnalyzing}
          onSOAPEdit={scribe.updateSOAP}
        />
      </div>

      {/* Action Bar */}
      <ScribeActionBar
        state={scribe.state}
        soap={soap}
        transcript={transcript}
        icd10Codes={icd10Codes}
        selectedPatient={selectedPatient}
        patientName={patientName}
        onSave={handleSave}
        onDiscard={scribe.reset}
        saving={saving}
      />
      </div>
    </div>
  );
}
