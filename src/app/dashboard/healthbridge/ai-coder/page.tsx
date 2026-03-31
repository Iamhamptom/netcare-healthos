"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Loader2, Sparkles, AlertCircle, CheckCircle2, XCircle, Copy, Check,
} from "lucide-react";

interface ICD10Code {
  code: string;
  description: string;
  confidence: string;
  isPMB: boolean;
  isCDL: boolean;
  cdlCondition?: string;
  reasoning: string;
}

interface CPTCode {
  code: string;
  description: string;
  estimatedTariff: number;
  reasoning: string;
}

interface AISuggestion {
  icd10Codes: ICD10Code[];
  cptCodes: CPTCode[];
  clinicalSummary: string;
  warnings: string[];
}

export default function AiCoderPage() {
  const [notes, setNotes] = useState("");
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function runCoder() {
    if (!notes.trim() || notes.length < 10) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const res = await fetch("/api/healthbridge/ai-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicalNotes: notes }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuggestion(data.suggestion || null);
      }
    } catch {
      setError("Request failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const estimatedTotal = suggestion?.cptCodes.reduce((sum, c) => sum + (c.estimatedTariff || 0), 0) || 0;

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Brain className="w-5 h-5 text-[#8b5cf6]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">AI ICD-10 + CPT Coder</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium">VRL AI</span>
        </div>

        {/* Input */}
        <div className="rounded-xl glass-panel p-5 space-y-4">
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Paste clinical notes from a consultation. AI will suggest ICD-10-ZA and CPT/CCSA codes with PMB/CDL flags, confidence levels, and reasoning.
          </p>
          <textarea
            placeholder={"Paste clinical notes here...\n\nExample: 52-year-old male presenting with persistent headache and elevated BP 160/100. History of hypertension. On amlodipine 5mg. ECG done — normal sinus rhythm. Bloods: HbA1c 7.2%, fasting glucose 8.1. Assessment: Uncontrolled hypertension, newly diagnosed type 2 diabetes. Plan: Add losartan 50mg, start metformin 500mg BD, lifestyle counseling. Follow-up 2 weeks."}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            className="w-full input-glass resize-none text-[13px]"
          />
          <div className="flex items-center gap-3">
            <button onClick={runCoder} disabled={loading || notes.length < 10} className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6] rounded-lg text-[13px] font-medium text-white disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Suggest Codes"}
            </button>
            {suggestion && (
              <button onClick={() => { setSuggestion(null); setNotes(""); }} className="px-4 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--ivory)]">
                Clear
              </button>
            )}
            <span className="text-[11px] text-[var(--text-tertiary)] ml-auto">{notes.length} characters</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mt-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Results */}
        {suggestion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-5">
            {/* Clinical Summary */}
            {suggestion.clinicalSummary && (
              <div className="rounded-xl glass-panel p-4">
                <div className="text-[11px] text-[var(--text-tertiary)] mb-1 font-medium uppercase tracking-wider">Clinical Summary</div>
                <div className="text-[13px] text-[var(--ivory)]">{suggestion.clinicalSummary}</div>
              </div>
            )}

            {/* ICD-10 Suggestions */}
            <div className="rounded-xl glass-panel p-4">
              <div className="text-[11px] text-[var(--text-tertiary)] mb-3 font-medium uppercase tracking-wider">ICD-10 Code Suggestions</div>
              <div className="space-y-2">
                {suggestion.icd10Codes.map((code, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border)]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => copyCode(code.code)} className="flex items-center gap-1 hover:opacity-80" title="Copy code">
                          <span className="text-[14px] font-mono font-bold text-[var(--teal)]">{code.code}</span>
                          {copiedCode === code.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[var(--text-tertiary)]" />}
                        </button>
                        <span className="text-[12px] text-[var(--ivory)]">{code.description}</span>
                        {code.isPMB && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">PMB</span>}
                        {code.isCDL && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">CDL: {code.cdlCondition}</span>}
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">{code.reasoning}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-3 ${
                      code.confidence === "high" ? "bg-emerald-500/10 text-emerald-400" :
                      code.confidence === "medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>{code.confidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CPT Suggestions */}
            <div className="rounded-xl glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">CPT / Tariff Code Suggestions</div>
                {estimatedTotal > 0 && (
                  <span className="text-[12px] text-[var(--gold)] font-medium">Est. total: ~R{estimatedTotal.toLocaleString()}</span>
                )}
              </div>
              <div className="space-y-2">
                {suggestion.cptCodes.map((code, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyCode(code.code)} className="flex items-center gap-1 hover:opacity-80" title="Copy code">
                          <span className="text-[14px] font-mono font-bold text-[var(--gold)]">{code.code}</span>
                          {copiedCode === code.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[var(--text-tertiary)]" />}
                        </button>
                        <span className="text-[12px] text-[var(--ivory)]">{code.description}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-tertiary)]">{code.reasoning}</div>
                    </div>
                    {code.estimatedTariff > 0 && (
                      <span className="text-[12px] font-medium text-[var(--gold)] shrink-0 ml-3">~R{code.estimatedTariff.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {suggestion.warnings.length > 0 && (
              <div className="rounded-lg p-3 border border-amber-500/20 bg-amber-500/5">
                {suggestion.warnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-amber-400 py-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {w}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
