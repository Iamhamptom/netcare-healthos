"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Edit3, Send, ArrowRight, ArrowLeft, FileText, Sparkles, Shield, Download, RotateCcw, ChevronDown, ChevronUp, Loader2, Zap } from "lucide-react";

interface ClaimLine {
  lineNumber: number;
  status: "valid" | "warning" | "error";
  original: Record<string, string>;
  corrections: { field: string; from: string; to: string; reason: string; auto: boolean }[];
  issues: { code: string; severity: string; message: string; suggestion?: string }[];
  edifact?: { ref: string; switchProvider: string; segments: number };
  aiReasoning?: string;
  approved: boolean;
}

type Stage = "upload" | "review" | "approve" | "submitted";

export default function ClaimsReviewPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<ClaimLine[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [scheme, setScheme] = useState("Discovery Health");
  const [summary, setSummary] = useState({ total: 0, valid: 0, rejected: 0, warning: 0, edifactReady: 0 });

  const runValidation = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scheme", scheme);
      const res = await fetch("/api/claims/validate", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setLoading(false); return; }

      const edifactMsgs = data.edifact?.messages || [];
      const lines: ClaimLine[] = (data.lineResults || []).map(function(lr: any, idx: number) {
        const corrections: ClaimLine["corrections"] = [];
        if (data.autoCorrections) {
          const ac = data.autoCorrections.filter(function(c: any) { return c.lineNumber === lr.lineNumber; });
          for (const c of ac) corrections.push({ field: c.field, from: c.from, to: c.to, reason: c.reason, auto: true });
        }
        const edifactMsg = edifactMsgs.find(function(m: any) { return m.lineNumber === lr.lineNumber; }) || (lr.status === "valid" ? edifactMsgs[idx] : undefined);
        return {
          lineNumber: lr.lineNumber,
          status: lr.status,
          original: lr.claimData || {},
          corrections,
          issues: lr.issues || [],
          edifact: edifactMsg ? { ref: edifactMsg.ref || edifactMsg.messageRef || "", switchProvider: edifactMsg.switch || edifactMsg.switchProvider || "", segments: edifactMsg.segments || 0 } : undefined,
          aiReasoning: undefined,
          approved: lr.status === "valid",
        };
      });

      setClaims(lines);
      setSummary({
        total: data.totalClaims || lines.length,
        valid: data.validClaims || 0,
        rejected: data.invalidClaims || 0,
        warning: data.warningClaims || 0,
        edifactReady: data.edifact?.ready || 0,
      });
      setStage("review");
    } catch { /* error */ }
    finally { setLoading(false); }
  }, [file, scheme]);

  const askAI = useCallback(async (lineNum: number, prompt: string) => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    try {
      const claim = claims.find(function(c) { return c.lineNumber === lineNum; });
      if (!claim) return;
      const res = await fetch("/api/claims/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "For claim line " + lineNum + " with ICD-10 " + (claim.original.primaryICD10 || claim.original.icd10_code || "") + " and tariff " + (claim.original.tariffCode || claim.original.tariff_code || "") + ": " + prompt }),
      });
      const data = await res.json();
      setClaims(function(prev) {
        return prev.map(function(c) {
          if (c.lineNumber === lineNum) return { ...c, aiReasoning: data.reply || data.response || "No response" };
          return c;
        });
      });
    } catch { /* */ }
    finally { setAiLoading(false); setAiPrompt(""); }
  }, [claims]);

  const toggleApproval = useCallback(function(lineNum: number) {
    setClaims(function(prev) {
      return prev.map(function(c) {
        if (c.lineNumber === lineNum) return { ...c, approved: !c.approved };
        return c;
      });
    });
  }, []);

  const approveAll = useCallback(function() {
    setClaims(function(prev) {
      return prev.map(function(c) {
        if (c.status === "valid") return { ...c, approved: true };
        return c;
      });
    });
    setStage("approve");
  }, []);

  const submitApproved = useCallback(function() {
    setStage("submitted");
  }, []);

  const approvedCount = claims.filter(function(c) { return c.approved; }).length;
  const statusIcon = function(s: string) {
    if (s === "valid") return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === "error") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-[15px] font-semibold">Claims Review & Approval</h1>
              <p className="text-[11px] text-zinc-500">Validate → Review → Approve → EDIFACT → Submit</p>
            </div>
          </div>
          {stage === "review" && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-400">{summary.valid} valid</span>
              <span className="text-red-400">{summary.rejected} rejected</span>
              <span className="text-amber-400">{summary.warning} warnings</span>
              <span className="text-blue-400">{summary.edifactReady} EDIFACT ready</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* UPLOAD */}
        {stage === "upload" && (
          <div className="max-w-xl mx-auto pt-12">
            <div className="text-center mb-8">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Upload Claims for Review</h2>
              <p className="text-zinc-500 text-sm">CSV will be validated, corrected, and prepared for EDIFACT submission.</p>
            </div>
            <select value={scheme} onChange={function(e) { setScheme(e.target.value); }} className="w-full mb-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm">
              <option>Discovery Health</option><option>GEMS</option><option>Bonitas</option><option>Momentum</option><option>Medihelp</option>
            </select>
            <div className={"border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition " + (file ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-700 hover:border-zinc-500")}
              onClick={function() { document.getElementById("csv-input")?.click(); }}>
              <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={function(e) { setFile(e.target.files?.[0] || null); }} />
              {file ? <p className="text-emerald-400 font-medium">{file.name}</p> : <p className="text-zinc-400">Drop CSV or click to browse</p>}
            </div>
            <button onClick={runValidation} disabled={!file || loading}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-medium flex items-center justify-center gap-2 transition">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Validating + generating EDIFACT...</> : <><Sparkles className="w-4 h-4" /> Validate & Prepare</>}
            </button>
          </div>
        )}

        {/* REVIEW */}
        {stage === "review" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <button onClick={function() { setStage("upload"); setClaims([]); }} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={approveAll} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium flex items-center gap-2 transition">
                <CheckCircle2 className="w-4 h-4" /> Approve All Valid ({summary.valid})
              </button>
            </div>

            {claims.map(function(claim) {
              const expanded = expandedClaim === claim.lineNumber;
              const hasIssues = claim.issues.filter(function(i) { return i.severity === "error" || i.severity === "warning"; }).length > 0;
              return (
                <motion.div key={claim.lineNumber} layout className={"rounded-xl border transition " + (claim.approved ? "border-emerald-500/30 bg-emerald-500/5" : claim.status === "error" ? "border-red-500/30 bg-red-500/5" : claim.status === "warning" ? "border-amber-500/20 bg-amber-500/5" : "border-zinc-800 bg-zinc-900")}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={function() { setExpandedClaim(expanded ? null : claim.lineNumber); }}>
                    <span className="text-xs font-mono text-zinc-500 w-8">#{claim.lineNumber}</span>
                    {statusIcon(claim.status)}
                    <span className="text-sm font-mono text-zinc-300">{claim.original.primaryICD10 || claim.original.icd10_code || "—"}</span>
                    <span className="text-xs text-zinc-500">{claim.original.tariffCode || claim.original.tariff_code || ""}</span>
                    <span className="text-xs text-zinc-600 flex-1 truncate">{claim.original.patientName || claim.original.patient_name || ""}</span>
                    {claim.corrections.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{claim.corrections.length} fixes</span>}
                    {claim.edifact && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">EDIFACT</span>}
                    {claim.approved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {expanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50 pt-3">
                          {/* Issues */}
                          {hasIssues && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Issues Found</p>
                              {claim.issues.filter(function(i) { return i.severity === "error" || i.severity === "warning"; }).map(function(issue, j) {
                                return (
                                  <div key={j} className={"p-2 rounded-lg text-xs " + (issue.severity === "error" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300")}>
                                    <span className="font-mono font-bold">{issue.code}</span>: {issue.message}
                                    {issue.suggestion && <p className="text-zinc-500 mt-1">{issue.suggestion}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Corrections */}
                          {claim.corrections.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Auto-Corrections Applied</p>
                              {claim.corrections.map(function(cor, j) {
                                return (
                                  <div key={j} className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg text-xs">
                                    <span className="text-blue-400 font-medium">{cor.field}</span>
                                    <span className="text-red-400 line-through">{cor.from}</span>
                                    <ArrowRight className="w-3 h-3 text-zinc-500" />
                                    <span className="text-emerald-400">{cor.to}</span>
                                    <span className="text-zinc-600 ml-auto">{cor.reason}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* EDIFACT preview */}
                          {claim.edifact && (
                            <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                              <p className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">EDIFACT Ready</p>
                              <p className="text-xs text-zinc-400">Ref: {claim.edifact.ref} | Switch: {claim.edifact.switchProvider} | {claim.edifact.segments} segments</p>
                            </div>
                          )}

                          {/* AI Reasoning */}
                          {claim.aiReasoning && (
                            <div className="p-2 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                              <p className="text-[10px] font-semibold text-violet-400 uppercase mb-1">AI Analysis</p>
                              <p className="text-xs text-zinc-300">{claim.aiReasoning}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <div className="flex-1 flex items-center gap-2">
                              <input value={claim.lineNumber === selected ? aiPrompt : ""} onChange={function(e) { setSelected(claim.lineNumber); setAiPrompt(e.target.value); }}
                                onFocus={function() { setSelected(claim.lineNumber); }}
                                placeholder="Ask AI to fix something..."
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500/50" />
                              <button onClick={function() { askAI(claim.lineNumber, aiPrompt); }} disabled={aiLoading || !aiPrompt.trim()}
                                className="p-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 rounded-lg transition">
                                {aiLoading && selected === claim.lineNumber ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              </button>
                            </div>
                            <button onClick={function() { toggleApproval(claim.lineNumber); }}
                              className={"px-3 py-1.5 rounded-lg text-xs font-medium transition " + (claim.approved ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700")}>
                              {claim.approved ? "Approved" : "Approve"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            <div className="flex justify-end pt-4">
              <button onClick={function() { setStage("approve"); }} disabled={approvedCount === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-medium flex items-center gap-2 transition">
                Proceed with {approvedCount} approved claims <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* APPROVE */}
        {stage === "approve" && (
          <div className="max-w-xl mx-auto pt-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to Submit</h2>
            <p className="text-zinc-400 text-sm mb-6">{approvedCount} claims approved. EDIFACT messages generated for {claims.filter(function(c) { return c.approved && c.edifact; }).length} claims.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Total claims</span><span>{summary.total}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Approved</span><span className="text-emerald-400">{approvedCount}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Rejected (not submitted)</span><span className="text-red-400">{summary.rejected}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">EDIFACT messages</span><span className="text-blue-400">{claims.filter(function(c) { return c.approved && c.edifact; }).length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Target switch</span><span>Healthbridge</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Scheme</span><span>{scheme}</span></div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={function() { setStage("review"); }} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium flex items-center gap-2 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Review
              </button>
              <button onClick={submitApproved} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium flex items-center gap-2 transition">
                <Send className="w-4 h-4" /> Submit to {scheme} via Healthbridge
              </button>
            </div>
          </div>
        )}

        {/* SUBMITTED */}
        {stage === "submitted" && (
          <div className="max-w-xl mx-auto pt-12 text-center">
            <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}>
              <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Claims Submitted</h2>
            <p className="text-zinc-400 mb-8">{approvedCount} claims submitted to {scheme} via Healthbridge.</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-zinc-500 mb-2">Submission Summary</p>
              <p className="text-sm text-zinc-300">Batch: B{Date.now().toString(36).toUpperCase()}</p>
              <p className="text-sm text-zinc-300">Claims: {approvedCount}</p>
              <p className="text-sm text-zinc-300">Switch: Healthbridge</p>
              <p className="text-sm text-zinc-300">Status: Pending adjudication</p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={function() { setStage("upload"); setClaims([]); setFile(null); }}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium flex items-center gap-2 transition">
                <RotateCcw className="w-4 h-4" /> New Batch
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium flex items-center gap-2 transition">
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
