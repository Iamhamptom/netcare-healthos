"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { useAudioRecorder, formatDuration } from "@/hooks/useAudioRecorder";
import WaveformVisualizer from "@/components/intake/WaveformVisualizer";
import IntakeReview from "@/components/intake/IntakeReview";
import type { IntakeAnalysis } from "@/lib/intake-analyzer";

type Stage = "idle" | "recording" | "transcribing" | "analyzing" | "review";

export default function VoiceIntakePage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<IntakeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const recorder = useAudioRecorder({
    chunkInterval: 2000,
  });

  // Load patients list
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

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleStartRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    setAnalysis(null);
    setStage("recording");
    await recorder.start();
  }, [recorder]);

  const handleStopAndProcess = useCallback(async () => {
    setStage("transcribing");
    const blob = await recorder.stop();
    if (!blob) {
      setError("No audio recorded");
      setStage("idle");
      return;
    }
    audioBlobRef.current = blob;

    // Step 1: Transcribe
    try {
      const formData = new FormData();
      formData.append("audio", blob, "intake.webm");

      const transcribeRes = await fetch("/api/intake/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json().catch(() => ({ error: "Transcription failed" }));
        throw new Error(err.error || "Transcription failed");
      }

      const { transcript: text } = await transcribeRes.json();
      setTranscript(text);

      // Step 2: Analyze
      setStage("analyzing");
      const analyzeRes = await fetch("/api/intake/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, patientId: selectedPatient || undefined }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error || "Analysis failed");
      }

      const { analysis: result } = await analyzeRes.json();
      setAnalysis(result);
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setStage(transcript ? "review" : "idle");
    }
  }, [recorder, selectedPatient, transcript]);

  const handleReRecord = useCallback(() => {
    setStage("idle");
    setTranscript("");
    setAnalysis(null);
    setError(null);
    audioBlobRef.current = null;
  }, []);

  const handleSave = useCallback(async (a: IntakeAnalysis) => {
    if (!selectedPatient) {
      setError("Please select a patient first");
      return;
    }
    setSaving(true);
    try {
      // Save as medical record
      await fetch(`/api/patients/${selectedPatient}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "consultation",
          title: `AI Voice Intake — ${a.chiefComplaint}`,
          description: transcript,
          diagnosis: a.icd10Suggestions.map(c => `${c.code}: ${c.description}`).join("; "),
          treatment: a.recommendedActions.join("; "),
          provider: "AI Voice Intake",
        }),
      });

      // Save allergies
      for (const allergy of a.allergies) {
        await fetch(`/api/patients/${selectedPatient}/allergies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(allergy),
        });
      }

      // Save medications
      for (const med of a.medications) {
        await fetch(`/api/patients/${selectedPatient}/medications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...med, active: true }),
        });
      }

      // Save vitals if mentioned
      const v = a.vitalsMentioned;
      if (Object.values(v).some(val => val != null)) {
        await fetch(`/api/patients/${selectedPatient}/vitals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(v),
        });
      }

      setError(null);
      alert("Saved to patient record successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [selectedPatient, transcript]);

  const handleExport = useCallback((format: "pdf" | "fhir") => {
    // TODO: Implement export
    alert(`Export as ${format.toUpperCase()} — coming soon`);
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Voice Intake</h1>
          <p className="text-sm text-white/40 mt-1">Record consultations. AI transcribes and extracts clinical data in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-teal-400 font-semibold">Powered by VRL-Claims</span>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="mb-6">
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-semibold">Patient</label>
        <div className="relative">
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full md:w-80 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">Select patient (optional)</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-400/60 hover:text-red-400 mt-1">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Panel */}
      <AnimatePresence mode="wait">
        {(stage === "idle" || stage === "recording") && (
          <motion.div
            key="recorder"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 mb-6"
          >
            {stage === "idle" ? (
              /* ── Idle: Big record button ── */
              <div className="text-center py-12">
                <motion.button
                  onClick={handleStartRecording}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-shadow"
                >
                  <Mic className="w-10 h-10 text-white" />
                </motion.button>
                <p className="text-white/50 text-sm mt-6">Tap to start recording</p>
                <p className="text-white/30 text-xs mt-1">Speak naturally — AI will transcribe and analyze the consultation</p>
              </div>
            ) : (
              /* ── Recording: Waveform + controls ── */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold text-white/80">
                      {recorder.isPaused ? "PAUSED" : "RECORDING"}
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-white/90 tracking-wider">
                    {formatDuration(recorder.duration)}
                  </span>
                </div>

                {/* Waveform */}
                <div className="bg-white/[0.02] rounded-xl p-4 mb-6">
                  <WaveformVisualizer
                    audioLevel={recorder.audioLevel}
                    isRecording={recorder.isRecording}
                    isPaused={recorder.isPaused}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {recorder.isPaused ? (
                    <button
                      onClick={recorder.resume}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={recorder.pause}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}

                  <button
                    onClick={handleStopAndProcess}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop & Analyze
                  </button>

                  <button
                    onClick={() => { recorder.cancel(); setStage("idle"); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/10 text-white/40 hover:text-red-400 text-sm transition-colors"
                  >
                    <MicOff className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Processing State */}
        {(stage === "transcribing" || stage === "analyzing") && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-12 mb-6 text-center"
          >
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-4" />
            <p className="text-white/80 text-lg font-semibold mb-1">
              {stage === "transcribing" ? "Transcribing audio..." : "Analyzing consultation..."}
            </p>
            <p className="text-white/40 text-sm">
              {stage === "transcribing"
                ? "Gemini is converting speech to text"
                : "Extracting symptoms, ICD-10 codes, medications, and clinical data"}
            </p>

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className={`flex items-center gap-2 ${stage === "transcribing" ? "text-teal-400" : "text-white/30"}`}>
                <div className={`w-2 h-2 rounded-full ${stage === "transcribing" ? "bg-teal-400 animate-pulse" : "bg-teal-400"}`} />
                <span className="text-xs font-medium">Transcribe</span>
              </div>
              <div className="w-8 h-px bg-white/10" />
              <div className={`flex items-center gap-2 ${stage === "analyzing" ? "text-teal-400" : "text-white/20"}`}>
                <div className={`w-2 h-2 rounded-full ${stage === "analyzing" ? "bg-teal-400 animate-pulse" : "bg-white/20"}`} />
                <span className="text-xs font-medium">Analyze</span>
              </div>
              <div className="w-8 h-px bg-white/10" />
              <div className="flex items-center gap-2 text-white/20">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-xs font-medium">Review</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Review Stage */}
        {stage === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Transcript */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Transcript</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTranscript(!editingTranscript)}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    {editingTranscript ? "Done" : "Edit"}
                  </button>
                  <button
                    onClick={handleReRecord}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Re-record
                  </button>
                </div>
              </div>

              {editingTranscript ? (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-transparent border border-white/[0.08] rounded-xl p-4 text-sm text-white/70 leading-relaxed resize-y min-h-[120px] focus:outline-none focus:border-teal-500/40"
                />
              ) : (
                <div
                  ref={transcriptRef}
                  className="max-h-[200px] overflow-y-auto text-sm text-white/60 leading-relaxed whitespace-pre-wrap pr-2"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
                >
                  {transcript || "No transcript available"}
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {analysis && (
              <IntakeReview
                analysis={analysis}
                transcript={transcript}
                patientName={patients.find(p => p.id === selectedPatient)?.name}
                onSave={handleSave}
                onExport={handleExport}
                saving={saving}
              />
            )}

            {/* Re-analyze button (if transcript was edited) */}
            {editingTranscript && (
              <div className="mt-4">
                <button
                  onClick={async () => {
                    setEditingTranscript(false);
                    setStage("analyzing");
                    try {
                      const res = await fetch("/api/intake/analyze", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transcript }),
                      });
                      const { analysis: result } = await res.json();
                      setAnalysis(result);
                      setStage("review");
                    } catch {
                      setError("Re-analysis failed");
                      setStage("review");
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Re-analyze edited transcript
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic permission error helper */}
      {recorder.error && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-300">{recorder.error}</p>
        </div>
      )}
    </div>
  );
}
