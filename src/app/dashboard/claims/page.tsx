"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Upload, FileText, AlertTriangle, CheckCircle2,
  Info, ChevronDown, ChevronUp, Search, XCircle, Download,
  ArrowRight, TrendingDown, Zap, AlertCircle, Sparkles,
  FileWarning, BadgeCheck, History, Brain, FileDown,
  BarChart3, ArrowUpRight, RefreshCw, Save, Clock,
  Building2, ChevronRight, Copy, Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
interface ValidationIssue {
  lineNumber: number;
  field: string;
  code: string;
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
  suggestion?: string;
}

interface LineResult {
  lineNumber: number;
  status: "valid" | "error" | "warning";
  issues: ValidationIssue[];
  claimData: {
    lineNumber: number;
    patientName?: string;
    primaryICD10: string;
    secondaryICD10?: string[];
    amount?: number;
    dateOfService?: string;
    patientGender?: string;
    patientAge?: number;
  };
}

interface ValidationResult {
  totalClaims: number;
  validClaims: number;
  invalidClaims: number;
  warningClaims: number;
  issues: ValidationIssue[];
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
    byRule: Record<string, number>;
    estimatedRejectionRate: number;
    estimatedSavings: number;
    topIssues: { rule: string; count: number; severity: string }[];
  };
  lineResults: LineResult[];
  columnMapping: Record<string, string>;
  headers: string[];
  parseErrors?: string[];
  schemeCode?: string;
  schemeList?: { code: string; name: string }[];
  batchInsights?: { rule: string; affectedCount: number; percentage: number; severity: string; explanation: string; fix: string }[];
}

interface ICD10SearchResult {
  code: string;
  description: string;
  chapter: number;
  chapterTitle: string;
  isPMB?: boolean;
  isValid: boolean;
  genderRestriction?: string;
  requiresExternalCause?: boolean;
  isAsterisk?: boolean;
}

interface HistoryEntry {
  id: string;
  fileName: string;
  totalClaims: number;
  validClaims: number;
  invalidClaims: number;
  warningClaims: number;
  rejectionRate: number;
  estimatedSavings: number;
  schemeCode: string;
  analyzedBy: string;
  period: string;
  createdAt: string;
  topIssues: { rule: string; count: number; severity: string }[];
}

interface TrendEntry {
  month: string;
  avgRejectionRate: number;
  totalSavings: number;
  totalClaims: number;
  analysisCount: number;
}

interface CodeSuggestion {
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

// ─── Severity config ─────────────────────────────────────────────
const severityConfig = {
  error: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", icon: XCircle, label: "Rejection" },
  warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", icon: AlertTriangle, label: "Warning" },
  info: { color: "#3DA9D1", bg: "rgba(61,169,209,0.08)", icon: Info, label: "Info" },
};

const SCHEMES = [
  { code: "", name: "No scheme (generic rules)" },
  { code: "DISC", name: "Discovery Health" },
  { code: "GEMS", name: "GEMS" },
  { code: "BONI", name: "Bonitas" },
  { code: "MEDS", name: "Medshield" },
  { code: "MOME", name: "Momentum Health" },
  { code: "BEST", name: "Bestmed" },
];

// ─── Main Component ──────────────────────────────────────────────
export default function ClaimsAnalyzerPage() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "valid">("all");
  const [activeTab, setActiveTab] = useState<"upload" | "search" | "history" | "realtime" | "code">("upload");
  const [scheme, setScheme] = useState("");
  const [saved, setSaved] = useState(false);
  const [popiaConsented, setPopiaConsented] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ICD10SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<Record<number, CodeSuggestion[]>>({});
  const [aiLoading, setAiLoading] = useState<Set<number>>(new Set());
  const [aiExplanation, setAiExplanation] = useState<Record<number, string>>({});

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [trend, setTrend] = useState<TrendEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Real-time single validator
  const [rtCode, setRtCode] = useState("");
  const [rtGender, setRtGender] = useState("");
  const [rtAge, setRtAge] = useState("");
  const [rtResult, setRtResult] = useState<ValidationIssue[] | null>(null);
  const [rtLoading, setRtLoading] = useState(false);

  // Code & Submit
  const [codeNotes, setCodeNotes] = useState("");
  const [codePatientName, setCodePatientName] = useState("");
  const [codeGender, setCodeGender] = useState("");
  const [codeAge, setCodeAge] = useState("");
  const [codeScheme, setCodeScheme] = useState("");
  const [codePractitioner, setCodePractitioner] = useState("gp");
  const [codeDate, setCodeDate] = useState(new Date().toISOString().split("T")[0]);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<{
    codedClaim: {
      primaryICD10: string;
      primaryDescription: string;
      secondaryICD10: string[];
      secondaryDescriptions: string[];
      tariffCode: string;
      tariffDescription: string;
      nappiCode?: string;
      nappiDescription?: string;
      modifier?: string;
      confidence: "high" | "medium" | "low";
      reasoning: string;
      clinicalSummary: string;
    };
    validation: ValidationResult;
    isClean: boolean;
    issues: string[];
    submissionReady: boolean;
    healthbridgeFormat?: string;
  } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeReasoningOpen, setCodeReasoningOpen] = useState(false);

  // Rejection feedback
  const [rejectionCode, setRejectionCode] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionSubmitting, setRejectionSubmitting] = useState(false);
  const [rejectionSent, setRejectionSent] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Load history on tab switch
  useEffect(() => {
    if (activeTab === "history") {
      setHistoryLoading(true);
      fetch("/api/claims/history?practiceId=default")
        .then(r => r.json())
        .then(data => {
          setHistory(data.analyses || []);
          setTrend(data.trend || []);
        })
        .catch(() => setError("Failed to load analysis history"))
        .finally(() => setHistoryLoading(false));
    }
  }, [activeTab]);

  // ── File upload handler ──
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) {
      setError("Please upload a CSV, TSV, or TXT file.");
      return;
    }
    setLoading(true);
    setError(null);
    setFileName(file.name);
    setResult(null);
    setSaved(false);
    setAiSuggestions({});
    setAiExplanation({});

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (scheme) formData.append("scheme", scheme);
      const res = await fetch("/api/claims/validate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Validation failed"); return; }
      setResult(data);
      setExpandedLines(new Set());
      setFilter("all");
    } catch {
      setError("Failed to upload and validate file. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [scheme]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Save analysis ──
  async function saveAnalysis() {
    if (!result) return;
    try {
      const res = await fetch("/api/claims/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceId: "default", fileName, result, schemeCode: scheme }),
      });
      if (res.ok) setSaved(true);
      else setError("Failed to save analysis — please try again.");
    } catch {
      setError("Failed to save analysis — network error.");
    }
  }

  // ── Download PDF ──
  const [pdfLoading, setPdfLoading] = useState(false);
  async function downloadPDF() {
    if (!result) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/claims/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, practiceName: "Netcare Practice" }),
      });
      if (!res.ok) { setError("Failed to generate PDF report."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claims-analysis-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to generate PDF — network error.");
    } finally {
      setPdfLoading(false);
    }
  }

  // ── Export text report ──
  function exportReport() {
    if (!result) return;
    const lines = [
      "Claims Rejection Analysis Report",
      `Generated: ${new Date().toLocaleString("en-ZA")}`,
      `File: ${fileName || "Unknown"}`,
      scheme ? `Scheme: ${SCHEMES.find(s => s.code === scheme)?.name || scheme}` : "",
      "",
      "=== SUMMARY ===",
      `Total Claims: ${result.totalClaims}`,
      `Valid: ${result.validClaims} | Errors: ${result.invalidClaims} | Warnings: ${result.warningClaims}`,
      `Estimated Rejection Rate: ${result.summary.estimatedRejectionRate}%`,
      `Estimated Savings if Fixed: R${result.summary.estimatedSavings.toLocaleString()}`,
      "",
      "=== TOP ISSUES ===",
      ...result.summary.topIssues.map(i => `  [${i.severity.toUpperCase()}] ${i.rule}: ${i.count}x`),
      "",
      "=== DETAIL ===",
      ...result.lineResults
        .filter(lr => lr.status !== "valid")
        .map(lr => [
          `Line ${lr.lineNumber}: ${lr.claimData.primaryICD10} — ${lr.status.toUpperCase()}`,
          ...lr.issues.map(i => `  > [${i.severity}] ${i.message}`),
          ...lr.issues.filter(i => i.suggestion).map(i => `    Fix: ${i.suggestion}`),
        ].join("\n")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claims-analysis-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── ICD-10 search ──
  function handleSearch(q: string) {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/claims/search?q=${encodeURIComponent(q)}&type=icd10`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
  }

  // ── AI suggestions ──
  async function getAISuggestion(lineNumber: number, issue: ValidationIssue, claimData: LineResult["claimData"]) {
    setAiLoading(prev => new Set(prev).add(lineNumber));
    try {
      const res = await fetch("/api/claims/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest",
          currentCode: claimData.primaryICD10,
          patientGender: claimData.patientGender,
          patientAge: claimData.patientAge,
          issues: [issue.message],
        }),
      });
      const data = await res.json();
      if (data.suggestions?.length > 0) {
        setAiSuggestions(prev => ({ ...prev, [lineNumber]: data.suggestions }));
      } else {
        setAiSuggestions(prev => ({ ...prev, [lineNumber]: [{ code: "—", description: "No suggestions available. AI could not determine a better code.", confidence: "low" as const, reason: "Review manually." }] }));
      }
    } catch {
      setAiSuggestions(prev => ({ ...prev, [lineNumber]: [{ code: "—", description: "AI suggestion service unavailable. Check API keys.", confidence: "low" as const, reason: "Service error — try again later." }] }));
    }
    setAiLoading(prev => { const next = new Set(prev); next.delete(lineNumber); return next; });
  }

  async function getAIExplanation(lineNumber: number, issue: ValidationIssue) {
    setAiLoading(prev => new Set(prev).add(lineNumber + 10000));
    try {
      const res = await fetch("/api/claims/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "explain", code: issue.code, rule: issue.rule, message: issue.message }),
      });
      const data = await res.json();
      setAiExplanation(prev => ({ ...prev, [lineNumber]: data.explanation || "Could not generate explanation. Review the issue details above." }));
    } catch {
      setAiExplanation(prev => ({ ...prev, [lineNumber]: "AI explanation service unavailable. The issue details above contain the key information needed to fix this rejection." }));
    }
    setAiLoading(prev => { const next = new Set(prev); next.delete(lineNumber + 10000); return next; });
  }

  // ── Real-time validator ──
  async function validateRealtime() {
    if (!rtCode.trim()) return;
    setRtLoading(true);
    setRtResult(null);
    try {
      const csv = `icd10_code,patient_gender,patient_age\n${rtCode.trim()},${rtGender || "U"},${rtAge || ""}`;
      const res = await fetch("/api/claims/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, scheme }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Validation failed"); }
      else if (data.lineResults?.[0]) {
        setRtResult(data.lineResults[0].issues || []);
      } else {
        setRtResult([]);
      }
    } catch {
      setError("Validation request failed — check your connection.");
    }
    setRtLoading(false);
  }

  // ── Code from notes ──
  async function codeFromNotes() {
    if (!codeNotes.trim()) return;
    setCodeLoading(true);
    setCodeResult(null);
    setError(null);
    setCodeCopied(false);
    setCodeReasoningOpen(false);
    setRejectionSent(false);
    setRejectionCode("");
    setRejectionReason("");
    try {
      const res = await fetch("/api/claims/code-from-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: codeNotes,
          patientName: codePatientName || undefined,
          patientGender: codeGender || undefined,
          patientAge: codeAge ? Number(codeAge) : undefined,
          schemeCode: codeScheme || undefined,
          practitionerType: codePractitioner || "gp",
          dateOfService: codeDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Clinical coding failed"); return; }
      setCodeResult(data);
    } catch {
      setError("Clinical coding request failed — check your connection.");
    } finally {
      setCodeLoading(false);
    }
  }

  function copyHealthbridgeLine() {
    if (!codeResult?.healthbridgeFormat) return;
    navigator.clipboard.writeText(codeResult.healthbridgeFormat);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function downloadClaimCSV() {
    if (!codeResult?.healthbridgeFormat) return;
    const blob = new Blob([codeResult.healthbridgeFormat], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claim-${codeResult.codedClaim.primaryICD10}-${codeDate || "today"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetCodeForm() {
    setCodeNotes("");
    setCodePatientName("");
    setCodeGender("");
    setCodeAge("");
    setCodeScheme("");
    setCodePractitioner("gp");
    setCodeDate(new Date().toISOString().split("T")[0]);
    setCodeResult(null);
    setCodeCopied(false);
    setCodeReasoningOpen(false);
    setRejectionSent(false);
    setRejectionCode("");
    setRejectionReason("");
    setError(null);
  }

  async function submitRejectionFeedback() {
    if (!rejectionCode.trim() || !codeResult) return;
    setRejectionSubmitting(true);
    try {
      const res = await fetch("/api/claims/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryICD10: codeResult.codedClaim.primaryICD10,
          tariffCode: codeResult.codedClaim.tariffCode,
          rejectionCode: rejectionCode.trim(),
          rejectionReason: rejectionReason.trim(),
          schemeCode: codeScheme || "UNKNOWN",
          dateOfService: codeDate || undefined,
        }),
      });
      if (res.ok) setRejectionSent(true);
      else setError("Failed to submit rejection feedback.");
    } catch {
      setError("Feedback submission failed — network error.");
    } finally {
      setRejectionSubmitting(false);
    }
  }

  // ── Toggle line detail ──
  const toggleLine = (ln: number) => {
    setExpandedLines(prev => {
      const next = new Set(prev);
      next.has(ln) ? next.delete(ln) : next.add(ln);
      return next;
    });
  };

  // Filtered results
  const filteredResults = result?.lineResults.filter(lr =>
    filter === "all" ? true : lr.status === filter
  ) || [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3DA9D1]/10 to-[#E3964C]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#3DA9D1]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Claims Rejection Analyzer</h1>
            <p className="text-[12px] text-gray-500">Pre-submission ICD-10 validation — catch rejections before they hit the switch</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["upload", "realtime", "code", "search", "history"] as const).map(tab => {
            const icons = { upload: Upload, realtime: Zap, code: Sparkles, search: Search, history: History };
            const labels = { upload: "Batch Analyze", realtime: "Quick Check", code: "Code & Submit", search: "Code Lookup", history: "History" };
            const Icon = icons[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === tab ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ TAB: REAL-TIME QUICK CHECK ═══ */}
      {activeTab === "realtime" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#E3964C]" />
              Real-Time Code Validator
            </h3>
            <p className="text-[12px] text-gray-500">Check a single ICD-10 code instantly — use this during billing to validate before submission.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">ICD-10 Code *</label>
                <input type="text" value={rtCode} onChange={e => setRtCode(e.target.value.toUpperCase())}
                  placeholder="e.g. J06.9"
                  onKeyDown={e => e.key === "Enter" && validateRealtime()}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-mono focus:border-[#3DA9D1] focus:ring-2 focus:ring-[#3DA9D1]/20 outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Patient Gender</label>
                <select value={rtGender} onChange={e => setRtGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                  <option value="">Not specified</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Patient Age</label>
                <input type="number" value={rtAge} onChange={e => setRtAge(e.target.value)}
                  placeholder="e.g. 45" min={0} max={120}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Scheme</label>
                <select value={scheme} onChange={e => setScheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                  {SCHEMES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <button onClick={validateRealtime} disabled={rtLoading || !rtCode.trim()}
              className="px-4 py-2 rounded-lg bg-[#1D3443] text-white text-[13px] font-medium hover:bg-[#2a4a5e] disabled:opacity-50 transition-colors flex items-center gap-2">
              {rtLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Validate Code
            </button>

            {rtResult !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2 border-t border-gray-100">
                {rtResult.filter(i => i.severity !== "info").length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-[13px] text-green-800 font-medium">Code is valid — no issues detected</span>
                  </div>
                ) : (
                  rtResult.map((issue, idx) => {
                    const config = severityConfig[issue.severity];
                    const Icon = config.icon;
                    return (
                      <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: config.bg }}>
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-semibold" style={{ color: config.color }}>{config.label}</span>
                              <span className="text-[10px] font-mono text-gray-400">{issue.code}</span>
                            </div>
                            <p className="text-[12px] text-gray-700">{issue.message}</p>
                            {issue.suggestion && (
                              <div className="flex items-start gap-1.5 mt-1.5">
                                <ArrowRight className="w-3 h-3 text-[#3DA9D1] shrink-0 mt-0.5" />
                                <p className="text-[11px] text-[#3DA9D1]">{issue.suggestion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {/* PMB info */}
                {rtResult.filter(i => i.code === "PMB_ELIGIBLE").length > 0 && (
                  <div className="rounded-lg p-3 bg-green-50/50 border border-green-100">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-600" />
                      <span className="text-[12px] text-green-700 font-medium">
                        This is a PMB condition — the scheme must cover it regardless of available benefits.
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ TAB: CODE & SUBMIT ═══ */}
      {activeTab === "code" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Form card */}
          {!codeResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E3964C]" />
                AI Clinical Coder — Notes to Claim
              </h3>
              <p className="text-[12px] text-gray-500">Paste your consultation notes below and we&apos;ll generate a fully coded, validated claim line ready for submission.</p>

              {/* Notes textarea */}
              <div>
                <label className="text-[11px] text-gray-500 font-medium mb-1 block">Consultation Notes *</label>
                <textarea
                  value={codeNotes}
                  onChange={e => setCodeNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g. 45M presents with 3-day history of sore throat, runny nose, mild cough. No fever. Examination: pharynx mildly erythematous, no exudate. Lungs clear. Dx: Acute URTI. Rx: Symptomatic — paracetamol 500mg qid x 5 days."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] focus:ring-2 focus:ring-[#3DA9D1]/20 outline-none resize-y min-h-[100px] leading-relaxed"
                />
              </div>

              {/* Patient details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Patient Name</label>
                  <input type="text" value={codePatientName} onChange={e => setCodePatientName(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Gender</label>
                  <select value={codeGender} onChange={e => setCodeGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                    <option value="">Not specified</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Age</label>
                  <input type="number" value={codeAge} onChange={e => setCodeAge(e.target.value)}
                    placeholder="e.g. 45" min={0} max={120}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Scheme</label>
                  <select value={codeScheme} onChange={e => setCodeScheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                    {SCHEMES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Practitioner</label>
                  <select value={codePractitioner} onChange={e => setCodePractitioner(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                    <option value="gp">General Practitioner</option>
                    <option value="specialist">Specialist</option>
                    <option value="dentist">Dentist</option>
                    <option value="physio">Physiotherapist</option>
                    <option value="optometrist">Optometrist</option>
                    <option value="psychologist">Psychologist</option>
                    <option value="psychiatrist">Psychiatrist</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Date of Service</label>
                  <input type="date" value={codeDate} onChange={e => setCodeDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none" />
                </div>
              </div>

              <button onClick={codeFromNotes} disabled={codeLoading || !codeNotes.trim()}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#1D3443] to-[#3DA9D1] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm">
                {codeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {codeLoading ? "Coding claim..." : "Code This Claim"}
              </button>
            </div>
          )}

          {/* Error */}
          {error && activeTab === "code" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-red-800">{error}</p>
                <button onClick={() => setError(null)}
                  className="text-[12px] text-red-600 hover:text-red-800 mt-1 underline">Dismiss</button>
              </div>
            </div>
          )}

          {/* Results */}
          {codeResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Coded claim card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#3DA9D1]" />
                    AI-Coded Claim
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Confidence badge */}
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                      codeResult.codedClaim.confidence === "high"
                        ? "bg-green-100 text-green-700"
                        : codeResult.codedClaim.confidence === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}>
                      {codeResult.codedClaim.confidence === "high" ? "High" : codeResult.codedClaim.confidence === "medium" ? "Medium" : "Low"} confidence
                    </span>
                    {/* Submission Ready badge */}
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 ${
                      codeResult.submissionReady
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {codeResult.submissionReady
                        ? <><CheckCircle2 className="w-3 h-3" /> Submission Ready</>
                        : <><XCircle className="w-3 h-3" /> Has Issues</>
                      }
                    </span>
                  </div>
                </div>

                {/* Primary ICD-10 — big and bold */}
                <div className="bg-gradient-to-r from-[#1D3443]/5 to-[#3DA9D1]/5 rounded-xl p-4 border border-[#3DA9D1]/10">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#1D3443] text-white rounded-xl px-4 py-3 text-center shrink-0">
                      <div className="text-[22px] font-bold font-mono tracking-wide">{codeResult.codedClaim.primaryICD10}</div>
                      <div className="text-[9px] uppercase tracking-wider opacity-70 mt-0.5">Primary ICD-10</div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-[14px] font-semibold text-gray-800">{codeResult.codedClaim.primaryDescription}</p>
                      {codeResult.codedClaim.secondaryICD10.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Secondary:</span>
                          {codeResult.codedClaim.secondaryICD10.map((code, idx) => (
                            <span key={idx} className="font-mono text-[12px] font-medium text-[#1D3443] bg-gray-100 px-2 py-0.5 rounded">
                              {code}{codeResult.codedClaim.secondaryDescriptions[idx] ? ` — ${codeResult.codedClaim.secondaryDescriptions[idx]}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tariff, NAPPI, Modifier grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tariff Code</div>
                    <div className="text-[14px] font-bold font-mono text-[#1D3443]">{codeResult.codedClaim.tariffCode || "—"}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{codeResult.codedClaim.tariffDescription || "Not specified"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">NAPPI Code</div>
                    <div className="text-[14px] font-bold font-mono text-[#1D3443]">{codeResult.codedClaim.nappiCode || "—"}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{codeResult.codedClaim.nappiDescription || "No medication"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Modifier</div>
                    <div className="text-[14px] font-bold font-mono text-[#1D3443]">{codeResult.codedClaim.modifier || "—"}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{codeResult.codedClaim.modifier ? "Applied" : "None"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Clinical Summary</div>
                    <div className="text-[12px] text-gray-700 leading-relaxed">{codeResult.codedClaim.clinicalSummary}</div>
                  </div>
                </div>

                {/* AI Reasoning — expandable */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <button onClick={() => setCodeReasoningOpen(!codeReasoningOpen)}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors text-left">
                    <span className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#E3964C]" />AI Reasoning
                    </span>
                    {codeReasoningOpen ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                  </button>
                  <AnimatePresence>
                    {codeReasoningOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3">
                          <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3">
                            {codeResult.codedClaim.reasoning}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Validation results */}
              {codeResult.issues.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Validation Issues ({codeResult.issues.length})
                  </h3>
                  <div className="space-y-2">
                    {codeResult.issues.map((issue, idx) => {
                      const isError = issue.startsWith("ERROR:");
                      const isWarning = issue.startsWith("WARNING:");
                      const config = isError ? severityConfig.error : isWarning ? severityConfig.warning : severityConfig.info;
                      const Icon = config.icon;
                      return (
                        <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: config.bg }}>
                          <div className="flex items-start gap-2">
                            <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
                            <p className="text-[12px] text-gray-700">{issue}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Validation engine line results if present */}
                  {codeResult.validation.lineResults?.length > 0 && codeResult.validation.lineResults[0].issues.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Detailed Validation</p>
                      {codeResult.validation.lineResults[0].issues.map((vi, idx) => {
                        const config = severityConfig[vi.severity];
                        const Icon = config.icon;
                        return (
                          <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: config.bg }}>
                            <div className="flex items-start gap-2">
                              <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[11px] font-semibold" style={{ color: config.color }}>{config.label}</span>
                                  <span className="text-[10px] font-mono text-gray-400">{vi.code}</span>
                                </div>
                                <p className="text-[12px] text-gray-700">{vi.message}</p>
                                {vi.suggestion && (
                                  <div className="flex items-start gap-1.5 mt-1.5">
                                    <ArrowRight className="w-3 h-3 text-[#3DA9D1] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-[#3DA9D1]">{vi.suggestion}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* No issues — clean */}
              {codeResult.issues.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-[13px] font-medium text-green-800">Claim is clean — no validation issues detected</p>
                    <p className="text-[11px] text-green-600">Ready to submit via Healthbridge or your practice management system.</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={copyHealthbridgeLine}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    codeCopied
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-[#1D3443] text-white hover:bg-[#2a4a5e]"
                  }`}>
                  {codeCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {codeCopied ? "Copied!" : "Copy Healthbridge Line"}
                </button>
                <button onClick={downloadClaimCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-medium hover:bg-gray-200 transition-colors">
                  <Download className="w-3.5 h-3.5" />Download Claim CSV
                </button>
                <button onClick={resetCodeForm}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-medium hover:bg-gray-200 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />Code Another
                </button>
              </div>

              {/* Report Rejection mini-form */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h3 className="text-[13px] font-semibold text-gray-800 flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-400" />
                  Report Rejection — Help Us Improve
                </h3>
                <p className="text-[11px] text-gray-500">
                  If this claim was rejected by your scheme, enter the rejection code and reason below. This helps our engine learn from real-world outcomes.
                </p>
                {rejectionSent ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-[12px] text-green-700 font-medium">Feedback recorded — thank you.</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 font-medium mb-1 block">Rejection Code *</label>
                        <input type="text" value={rejectionCode} onChange={e => setRejectionCode(e.target.value)}
                          placeholder="e.g. 300, E01, NAPPI_INVALID"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-mono focus:border-[#3DA9D1] outline-none" />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 font-medium mb-1 block">Rejection Reason</label>
                        <input type="text" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                          placeholder="e.g. ICD-10 code not covered under this plan option"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none" />
                      </div>
                    </div>
                    <button onClick={submitRejectionFeedback} disabled={rejectionSubmitting || !rejectionCode.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-[12px] font-medium hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                      {rejectionSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit Rejection Feedback
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ═══ TAB: ICD-10 SEARCH ═══ */}
      {activeTab === "search" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)}
                placeholder="Search ICD-10 codes or descriptions (e.g., J06.9, hypertension, diabetes)..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] focus:ring-2 focus:ring-[#3DA9D1]/20 outline-none transition-all" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#3DA9D1]/30 border-t-[#3DA9D1] rounded-full animate-spin" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-1.5 max-h-[500px] overflow-y-auto">
                {searchResults.map(r => (
                  <div key={r.code} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="font-mono text-[13px] font-bold text-[#1D3443] bg-gray-100 px-2 py-0.5 rounded min-w-[60px] text-center">
                      {r.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-800">{r.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Ch.{r.chapter}: {r.chapterTitle}</span>
                        {r.isPMB && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium">PMB</span>}
                        {r.genderRestriction && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">{r.genderRestriction === "M" ? "Male only" : "Female only"}</span>}
                        {r.requiresExternalCause && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">Requires ECC</span>}
                        {r.isAsterisk && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700">* Cannot be primary</span>}
                        {!r.isValid && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700">Needs specificity</span>}
                      </div>
                    </div>
                    <button onClick={() => { setRtCode(r.code); setActiveTab("realtime"); }}
                      className="text-[11px] text-[#3DA9D1] hover:underline shrink-0">
                      Quick Check
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <p className="mt-4 text-center text-[12px] text-gray-400">No matching ICD-10 codes found</p>
            )}
          </div>

          {/* Quick reference */}
          <div className="bg-gradient-to-r from-[#3DA9D1]/5 to-[#E3964C]/5 rounded-xl border border-[#3DA9D1]/10 p-4">
            <h3 className="text-[12px] font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3DA9D1]" />Quick Reference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Common GP Codes</p>
                <p className="text-gray-500">J06.9 — Upper resp. infection</p>
                <p className="text-gray-500">I10 — Hypertension</p>
                <p className="text-gray-500">E11.9 — Type 2 diabetes</p>
                <p className="text-gray-500">M54.5 — Low back pain</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Top Rejections</p>
                <p className="text-gray-500">Missing ICD-10 code</p>
                <p className="text-gray-500">Non-specific codes</p>
                <p className="text-gray-500">S/T without ECC</p>
                <p className="text-gray-500">Gender mismatches</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">ECC Examples</p>
                <p className="text-gray-500">W19 — Fall, unspecified</p>
                <p className="text-gray-500">V89.2 — Motor vehicle</p>
                <p className="text-gray-500">W54 — Dog bite</p>
                <p className="text-gray-500">X59 — Unspecified cause</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">PMB Note</p>
                <p className="text-gray-500">PMB = Prescribed Minimum Benefits. Schemes <strong>must</strong> cover these regardless of available benefits.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ TAB: HISTORY ═══ */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {historyLoading ? (
            <div className="text-center py-12 text-[13px] text-gray-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-[13px] text-gray-500">No saved analyses yet</p>
              <p className="text-[12px] text-gray-400 mt-1">Run a batch analysis and save it to start tracking your rejection rate over time.</p>
            </div>
          ) : (
            <>
              {/* Trend chart (simple bar representation) */}
              {trend.length > 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#3DA9D1]" />Rejection Rate Trend
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    {trend.map((t, idx) => {
                      const maxRate = Math.max(...trend.map(x => x.avgRejectionRate), 1);
                      const height = (t.avgRejectionRate / maxRate) * 100;
                      const color = t.avgRejectionRate > 20 ? "#EF4444" : t.avgRejectionRate > 10 ? "#F59E0B" : "#10B981";
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold" style={{ color }}>{t.avgRejectionRate}%</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(height, 4)}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="w-full rounded-t-md"
                            style={{ backgroundColor: color, minHeight: 4 }}
                          />
                          <span className="text-[9px] text-gray-400">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* History list */}
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          h.rejectionRate > 20 ? "bg-red-50" : h.rejectionRate > 10 ? "bg-amber-50" : "bg-green-50"
                        }`}>
                          <span className={`text-[12px] font-bold ${
                            h.rejectionRate > 20 ? "text-red-600" : h.rejectionRate > 10 ? "text-amber-600" : "text-green-600"
                          }`}>{h.rejectionRate}%</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-gray-800">{h.fileName || "Analysis"}</p>
                          <p className="text-[11px] text-gray-400">
                            {h.totalClaims} claims · {h.invalidClaims} rejected · R{h.estimatedSavings.toLocaleString()} potential savings
                            {h.schemeCode ? ` · ${h.schemeCode}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(h.createdAt).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ═══ TAB: BATCH UPLOAD & RESULTS ═══ */}
      {activeTab === "upload" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* POPIA consent gate — required before upload */}
          {!result && !popiaConsented && (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-xl border border-[#3DA9D1]/20 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3DA9D1]/10">
                    <Shield className="h-5 w-5 text-[#3DA9D1]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">POPIA Compliance — Data Processing Consent</h3>
                    <p className="text-xs text-gray-500">Required before claims data can be uploaded</p>
                  </div>
                </div>
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3DA9D1]">Data Handling</h4>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-gray-600">
                    <li>Data is processed server-side only. Patient names are anonymized before storage.</li>
                    <li>Raw CSV data is not retained after analysis.</li>
                    <li>AI suggestions use diagnosis codes only — no patient names are sent to external services.</li>
                  </ul>
                </div>
                <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-[#3DA9D1]/40">
                  <input
                    type="checkbox"
                    id="popia-consent"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#3DA9D1]"
                    onChange={(e) => { if (e.target.checked) setPopiaConsented(true); }}
                  />
                  <span className="text-xs leading-relaxed text-gray-700">
                    I confirm this data is being processed in accordance with POPIA Section 15 and consent has been obtained from data subjects for medical aid claims processing.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Scheme selector + upload zone */}
          {!result && popiaConsented && (
            <>
              {/* Scheme selector */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <label className="text-[12px] font-medium text-gray-600">Medical Scheme Rules:</label>
                  <select value={scheme} onChange={e => setScheme(e.target.value)}
                    className="flex-1 max-w-xs px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] focus:border-[#3DA9D1] outline-none">
                    {SCHEMES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </select>
                  {scheme && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#3DA9D1]/10 text-[#3DA9D1] rounded-full font-medium">
                      Scheme-specific rules active
                    </span>
                  )}
                </div>
              </div>

              {/* Upload zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragOver ? "border-[#3DA9D1] bg-[#3DA9D1]/5 scale-[1.01]" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleInputChange} className="hidden" />
                {loading ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto border-3 border-[#3DA9D1]/20 border-t-[#3DA9D1] rounded-full animate-spin" />
                    <p className="text-[13px] text-gray-500">Analyzing {fileName}...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#3DA9D1]/10 to-[#E3964C]/10 flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-[#3DA9D1]" />
                    </div>
                    <p className="text-[14px] font-medium text-gray-700 mb-1">Drop your claims CSV here, or click to browse</p>
                    <p className="text-[12px] text-gray-400 mb-4">Supports CSV, TSV, TXT — auto-detects column headers</p>
                    <div className="inline-flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> ICD-10</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Tariff</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> NAPPI</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Patient data</span>
                    </div>
                  </>
                )}
              </div>

              {/* How it works */}
              <div className="bg-gradient-to-br from-[#3DA9D1]/5 via-white to-[#E3964C]/5 rounded-xl border border-[#3DA9D1]/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/10 flex items-center justify-center shrink-0">
                    <FileWarning className="w-5 h-5 text-[#3DA9D1]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-800 mb-1">How it works</h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                      Upload your last month&apos;s claims data. We&apos;ll show you which ones would have been
                      rejected and why — <strong>before they hit the switch</strong>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {[
                        { icon: BadgeCheck, title: "ICD-10 Validation", desc: "Format, specificity, existence — 500+ SA codes" },
                        { icon: Shield, title: "SA Rules Engine", desc: "Gender/age, ECCs, asterisk codes, PMB" },
                        { icon: Building2, title: "Scheme Rules", desc: "Discovery, GEMS, Bonitas — scheme-specific checks" },
                        { icon: Brain, title: "AI Suggestions", desc: "Our fine-tuned models suggest correct codes for flagged items" },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/80 rounded-lg p-3 border border-gray-100">
                          <item.icon className="w-4 h-4 text-[#3DA9D1] mb-1.5" />
                          <p className="text-[12px] font-medium text-gray-700">{item.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-[11px] text-gray-500 font-medium mb-1">Expected CSV columns:</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        icd10_code, patient_name, patient_gender, patient_age, tariff_code, nappi_code, amount, date_of_service
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Only <code className="bg-gray-100 px-1 rounded">icd10_code</code> is required. Auto-detects common variations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-red-800">{error}</p>
                <button onClick={() => { setError(null); setResult(null); setFileName(null); }}
                  className="text-[12px] text-red-600 hover:text-red-800 mt-1 underline">Try again</button>
              </div>
            </div>
          )}

          {/* ═══ RESULTS ═══ */}
          {result && (
            <div className="space-y-5">
              {/* Top actions bar */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-[12px] text-gray-500">{fileName}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{result.totalClaims} claims</span>
                  {scheme && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#3DA9D1]/10 text-[#3DA9D1] rounded-full">
                      {SCHEMES.find(s => s.code === scheme)?.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadPDF} disabled={pdfLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D3443] text-white text-[12px] font-medium hover:bg-[#2a4a5e] transition-colors disabled:opacity-50">
                    {pdfLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    {pdfLoading ? "Generating..." : "PDF Report"}
                  </button>
                  <button onClick={exportReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-medium hover:bg-gray-200 transition-colors">
                    <Download className="w-3.5 h-3.5" />Text Export
                  </button>
                  <button onClick={saveAnalysis} disabled={saved}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                      saved ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    {saved ? "Saved" : "Save"}
                  </button>
                  <button onClick={() => { setResult(null); setFileName(null); setSaved(false); setAiSuggestions({}); setAiExplanation({}); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[12px] font-medium hover:bg-gray-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />New
                  </button>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KPICard label="Total Claims" value={result.totalClaims} icon={FileText} color="#3DA9D1" />
                <KPICard label="Valid" value={result.validClaims} icon={CheckCircle2} color="#10B981"
                  subtitle={result.totalClaims > 0 ? `${Math.round((result.validClaims / result.totalClaims) * 100)}%` : undefined} />
                <KPICard label="Will Be Rejected" value={result.invalidClaims} icon={XCircle} color="#EF4444"
                  subtitle={`${result.summary.estimatedRejectionRate}% rate`} />
                <KPICard label="Warnings" value={result.warningClaims} icon={AlertTriangle} color="#F59E0B" />
                <KPICard label="Savings if Fixed" value={`R${result.summary.estimatedSavings.toLocaleString()}`}
                  icon={TrendingDown} color="#10B981" subtitle="estimated recovery" />
              </div>

              {/* ─── Batch Intelligence Insights ─── */}
              {result.batchInsights && result.batchInsights.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-[14px] font-semibold text-amber-900">
                      AI Batch Analysis — {result.batchInsights.length === 1 ? "Pattern Detected" : `${result.batchInsights.length} Patterns Detected`}
                    </span>
                  </div>
                  <p className="text-[12px] text-amber-800">
                    Instead of reviewing {result.totalClaims} claims one by one, here&apos;s what&apos;s causing the bulk of your rejections:
                  </p>
                  {result.batchInsights.map((insight, i) => (
                    <div key={i} className="bg-white rounded-lg border border-amber-100 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-gray-800">{insight.rule}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          insight.percentage >= 80 ? "bg-red-100 text-red-700" :
                          insight.percentage >= 50 ? "bg-orange-100 text-orange-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {insight.affectedCount}/{result.totalClaims} claims ({insight.percentage}%)
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-600 leading-relaxed">{insight.explanation}</p>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3">
                        <p className="text-[11px] font-semibold text-emerald-700 mb-0.5">How to fix this</p>
                        <p className="text-[12px] text-emerald-800">{insight.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rejection rate bar */}
              {result.summary.estimatedRejectionRate > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-medium text-gray-700">Rejection Risk Score</span>
                    <span className={`text-[13px] font-bold ${
                      result.summary.estimatedRejectionRate > 20 ? "text-red-600" :
                      result.summary.estimatedRejectionRate > 10 ? "text-amber-600" : "text-green-600"
                    }`}>{result.summary.estimatedRejectionRate}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(result.summary.estimatedRejectionRate, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        result.summary.estimatedRejectionRate > 20 ? "bg-gradient-to-r from-red-400 to-red-600" :
                        result.summary.estimatedRejectionRate > 10 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                        "bg-gradient-to-r from-green-400 to-green-600"
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {result.summary.estimatedRejectionRate > 20 ? "High rejection risk — immediate attention required" :
                     result.summary.estimatedRejectionRate > 10 ? "Moderate risk — review flagged items before submission" :
                     "Low risk — claims look well-coded"}
                  </p>
                </div>
              )}

              {/* Top issues */}
              {result.summary.topIssues.filter(i => i.severity !== "info").length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#E3964C]" />Top Issues Found
                  </h3>
                  <div className="space-y-2">
                    {result.summary.topIssues.filter(i => i.severity !== "info").map((issue, idx) => {
                      const config = severityConfig[issue.severity as keyof typeof severityConfig];
                      const Icon = config.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: config.bg }}>
                          <Icon className="w-4 h-4 shrink-0" style={{ color: config.color }} />
                          <span className="text-[12px] text-gray-700 flex-1">{issue.rule}</span>
                          <span className="text-[12px] font-bold" style={{ color: config.color }}>{issue.count}x</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filter tabs */}
              <div className="flex items-center gap-2">
                {([
                  { key: "all", label: "All", count: result.totalClaims },
                  { key: "error", label: "Rejections", count: result.invalidClaims },
                  { key: "warning", label: "Warnings", count: result.warningClaims },
                  { key: "valid", label: "Valid", count: result.validClaims },
                ] as const).map(tab => (
                  <button key={tab.key} onClick={() => setFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                      filter === tab.key ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}>
                    {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Line-by-line results */}
              <div className="space-y-2">
                {filteredResults.length === 0 && (
                  <div className="text-center py-8 text-[13px] text-gray-400">No claims match this filter</div>
                )}
                {filteredResults.map(lr => {
                  const isExpanded = expandedLines.has(lr.lineNumber);
                  const sc = lr.status === "error"
                    ? { color: "#EF4444", bg: "bg-red-50", border: "border-red-200", icon: XCircle }
                    : lr.status === "warning"
                      ? { color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle }
                      : { color: "#10B981", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 };

                  return (
                    <motion.div key={lr.lineNumber}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-xl border ${lr.status === "valid" ? "border-gray-100" : sc.border} overflow-hidden`}>
                      <button onClick={() => toggleLine(lr.lineNumber)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50/50 transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${sc.color}10` }}>
                          <sc.icon className="w-3.5 h-3.5" style={{ color: sc.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 font-mono">#{lr.lineNumber}</span>
                            <span className="font-mono text-[13px] font-bold text-[#1D3443]">{lr.claimData.primaryICD10 || "—"}</span>
                            {lr.claimData.patientName && (
                              <span className="text-[12px] text-gray-500 truncate max-w-[200px]">{lr.claimData.patientName}</span>
                            )}
                          </div>
                          {lr.issues.length > 0 && !isExpanded && (
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              {lr.issues.filter(i => i.severity !== "info").map(i => i.rule).join(" · ") || "PMB eligible"}
                            </p>
                          )}
                        </div>
                        {lr.claimData.amount && (
                          <span className="text-[12px] font-mono text-gray-500">R{lr.claimData.amount.toLocaleString()}</span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                          backgroundColor: `${sc.color}15`, color: sc.color,
                        }}>
                          {lr.issues.filter(i => i.severity === "error").length > 0
                            ? `${lr.issues.filter(i => i.severity === "error").length} error${lr.issues.filter(i => i.severity === "error").length > 1 ? "s" : ""}`
                            : lr.issues.filter(i => i.severity === "warning").length > 0
                              ? `${lr.issues.filter(i => i.severity === "warning").length} warning${lr.issues.filter(i => i.severity === "warning").length > 1 ? "s" : ""}`
                              : "valid"}
                        </span>
                        {lr.issues.length > 0 ? (
                          isExpanded ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />
                        ) : <div className="w-4" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && lr.issues.length > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100 overflow-hidden">
                            <div className="p-3 space-y-2">
                              {lr.issues.map((issue, idx) => {
                                const config = severityConfig[issue.severity];
                                const Icon = config.icon;
                                return (
                                  <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: config.bg }}>
                                    <div className="flex items-start gap-2">
                                      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[11px] font-semibold" style={{ color: config.color }}>{config.label}</span>
                                          <span className="text-[10px] font-mono text-gray-400">{issue.code}</span>
                                        </div>
                                        <p className="text-[12px] text-gray-700">{issue.message}</p>
                                        {issue.suggestion && (
                                          <div className="flex items-start gap-1.5 mt-1.5">
                                            <ArrowRight className="w-3 h-3 text-[#3DA9D1] shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-[#3DA9D1]">{issue.suggestion}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* AI actions */}
                              {lr.status !== "valid" && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => getAISuggestion(lr.lineNumber, lr.issues[0], lr.claimData)}
                                    disabled={aiLoading.has(lr.lineNumber)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#3DA9D1]/10 to-[#E3964C]/10 text-[11px] font-medium text-[#1D3443] hover:from-[#3DA9D1]/20 hover:to-[#E3964C]/20 transition-all disabled:opacity-50"
                                  >
                                    {aiLoading.has(lr.lineNumber) ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Brain className="w-3 h-3" />
                                    )}
                                    AI Suggest Fix
                                  </button>
                                  <button
                                    onClick={() => getAIExplanation(lr.lineNumber, lr.issues[0])}
                                    disabled={aiLoading.has(lr.lineNumber + 10000)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                                  >
                                    {aiLoading.has(lr.lineNumber + 10000) ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-3 h-3" />
                                    )}
                                    Explain
                                  </button>
                                </div>
                              )}

                              {/* AI suggestions display */}
                              {aiSuggestions[lr.lineNumber] && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                  className="rounded-lg p-3 bg-gradient-to-r from-[#3DA9D1]/5 to-[#E3964C]/5 border border-[#3DA9D1]/10">
                                  <p className="text-[11px] font-semibold text-[#1D3443] mb-2 flex items-center gap-1.5">
                                    <Brain className="w-3.5 h-3.5 text-[#3DA9D1]" />AI-Suggested Corrections
                                  </p>
                                  <div className="space-y-1.5">
                                    {aiSuggestions[lr.lineNumber].map((s, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                          s.confidence === "high" ? "bg-green-100 text-green-700" :
                                          s.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                                          "bg-gray-100 text-gray-600"
                                        }`}>{s.confidence}</span>
                                        <span className="font-mono text-[12px] font-bold text-[#1D3443]">{s.code}</span>
                                        <span className="text-[11px] text-gray-600 flex-1">{s.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}

                              {/* AI explanation display */}
                              {aiExplanation[lr.lineNumber] && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                  className="rounded-lg p-3 bg-gray-50 border border-gray-100">
                                  <p className="text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#E3964C]" />AI Explanation
                                  </p>
                                  <p className="text-[12px] text-gray-700 whitespace-pre-line leading-relaxed">{aiExplanation[lr.lineNumber]}</p>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, color, subtitle }: {
  label: string; value: string | number; icon: typeof FileText; color: string; subtitle?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-gray-400 mt-0.5">{subtitle}</div>}
    </motion.div>
  );
}
