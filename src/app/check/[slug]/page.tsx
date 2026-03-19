"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Loader2, AlertCircle, Calendar, ChevronRight,
  ShieldCheck, Activity, Sparkles, ArrowRight, HeartPulse,
} from "lucide-react";

interface SymptomResult {
  urgency: string;
  assessment: string;
  recommendedService: string;
  selfCare: string[];
  shouldBook: boolean;
  warning: string | null;
}

const COMMON_SYMPTOMS = [
  { label: "Blocked nose", icon: "🫁" },
  { label: "Sinus headache / facial pressure", icon: "🤕" },
  { label: "Post-nasal drip", icon: "💧" },
  { label: "Loss of smell or taste", icon: "👃" },
  { label: "Recurring sinus infections", icon: "🔄" },
  { label: "Snoring / sleep issues", icon: "😴" },
  { label: "Ear pain or hearing loss", icon: "👂" },
  { label: "Sore throat / voice changes", icon: "🗣️" },
  { label: "Allergies / hay fever", icon: "🤧" },
  { label: "Nosebleeds", icon: "🩸" },
];

export default function SymptomCheckerPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [practiceName, setPracticeName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#D4AF37");
  const [symptoms, setSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { params.then(p => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/refer?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.practice) {
          setPracticeName(data.practice.name);
          setPrimaryColor(data.practice.primaryColor || "#D4AF37");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  function toggleSymptom(label: string) {
    setSelectedSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  }

  async function handleCheck() {
    const combinedSymptoms = [
      ...selectedSymptoms,
      symptoms.trim() ? symptoms.trim() : "",
    ].filter(Boolean).join(". ");

    if (combinedSymptoms.length < 5) {
      setError("Please select symptoms or describe what you're experiencing");
      return;
    }

    setChecking(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/public/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: combinedSymptoms, slug }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setChecking(false); return; }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setChecking(false);
  }

  const pc = primaryColor;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc + "20" }}>
              <Activity className="w-4 h-4" style={{ color: pc }} />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{practiceName || "Netcare Health OS"}</h1>
              <p className="text-[10px] text-white/40">AI Symptom Checker</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-blue-400 font-medium">Not a diagnosis</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Hero */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">What&apos;s bothering you?</h2>
                <p className="text-sm text-white/50">
                  Select your symptoms or describe them below. Our AI will recommend the right type of consultation.
                </p>
              </div>

              {/* Common Symptoms Grid */}
              <div className="mb-6">
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Common Symptoms</h3>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_SYMPTOMS.map(symptom => (
                    <button
                      key={symptom.label}
                      onClick={() => toggleSymptom(symptom.label)}
                      className={`p-3 rounded-xl border text-left transition-all text-sm flex items-center gap-2.5 ${
                        selectedSymptoms.includes(symptom.label)
                          ? "border-transparent text-black font-medium"
                          : "border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                      style={selectedSymptoms.includes(symptom.label) ? { backgroundColor: pc } : undefined}
                    >
                      <span className="text-base">{symptom.icon}</span>
                      <span className="text-xs">{symptom.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free text */}
              <div className="mb-6">
                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Describe in your own words</h3>
                <textarea
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="e.g. I've had a blocked nose and headaches for 3 months. Antibiotics helped temporarily but symptoms came back. It's worse in the mornings and when I bend forward..."
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </div>
              )}

              <button
                onClick={handleCheck}
                disabled={checking}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: pc }}
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Check My Symptoms
                  </>
                )}
              </button>

              <p className="text-[10px] text-white/20 text-center mt-4">
                This tool provides guidance only — it does not replace professional medical advice.
                For emergencies, call 10177 or go to your nearest ER.
              </p>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Emergency Warning */}
              {result.warning && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Important</p>
                    <p className="text-xs text-red-400/80 mt-1">{result.warning}</p>
                  </div>
                </div>
              )}

              {/* Assessment */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5" style={{ color: pc }} />
                  <h2 className="text-lg font-semibold">Your Assessment</h2>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">{result.assessment}</p>

                {/* Urgency badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      result.urgency === "EMERGENCY" ? "#EF444420" :
                      result.urgency === "URGENT" ? "#F59E0B20" :
                      result.urgency === "SEMI-URGENT" ? "#3B82F620" : pc + "20",
                    color:
                      result.urgency === "EMERGENCY" ? "#EF4444" :
                      result.urgency === "URGENT" ? "#F59E0B" :
                      result.urgency === "SEMI-URGENT" ? "#3B82F6" : pc,
                  }}
                >
                  <Activity className="w-3 h-3" />
                  {result.urgency}
                </div>
              </div>

              {/* Recommended Service */}
              {result.shouldBook && (
                <div className="rounded-xl border-2 p-6 mb-6" style={{ borderColor: pc + "40", backgroundColor: pc + "08" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: pc }} />
                    <h3 className="text-sm font-semibold">Recommended</h3>
                  </div>
                  <p className="text-lg font-bold mb-3" style={{ color: pc }}>{result.recommendedService}</p>
                  <a
                    href={`/book/${slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-all"
                    style={{ backgroundColor: pc }}
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Self-Care Tips */}
              {result.selfCare && result.selfCare.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartPulse className="w-4 h-4 text-[#3DA9D1]" />
                    <h3 className="text-sm font-semibold">In the meantime...</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.selfCare.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <ChevronRight className="w-3.5 h-3.5 text-[#3DA9D1] shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setResult(null); setSymptoms(""); setSelectedSymptoms([]); }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/[0.03]"
                >
                  Check different symptoms
                </button>
                <a
                  href={`/book/${slug}`}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-black text-center hover:opacity-90"
                  style={{ backgroundColor: pc }}
                >
                  Book Appointment
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-[10px] text-white/20">Powered by Netcare Health OS Ops</p>
      </footer>
    </div>
  );
}
