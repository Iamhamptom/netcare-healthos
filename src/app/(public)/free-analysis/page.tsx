"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight, Shield, Zap } from "lucide-react";

export default function FreeAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scheme", "Discovery Health");

      const res = await fetch("/api/claims/validate", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [file]);

  const totalClaims = (result?.totalClaims as number) || 0;
  const rejected = (result?.invalidClaims as number) || 0;
  const warnings = (result?.warningClaims as number) || 0;
  const valid = (result?.validClaims as number) || 0;
  const rejectionRate = totalClaims > 0 ? Math.round((rejected / totalClaims) * 100) : 0;
  const estimatedLoss = (result?.summary as Record<string, unknown>)?.estimatedSavings as number || 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-lg">Netcare Health OS</span>
          </div>
          <a href="/login" className="text-sm text-zinc-400 hover:text-white transition">Sign In</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {!result ? (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
                <Zap className="w-3 h-3" /> Free Claims Analysis
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                How much revenue are you<br />
                <span className="text-emerald-400">losing to rejected claims?</span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                Upload your rejected claims CSV. Our AI analyzes every rejection, identifies
                recoverable revenue, and shows you exactly how to fix each one. Free, no signup required.
              </p>
            </div>

            {/* Upload */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-700 hover:border-zinc-500"
                }`}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-400" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                    <p className="text-zinc-300 font-medium">Drop your rejected claims CSV here</p>
                    <p className="text-zinc-500 text-sm mt-1">Or click to browse. Supports CSV from MediSwitch, Healthbridge, GoodX.</p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || analyzing}
                className="w-full mt-6 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing claims... (AI reasoning takes 30-60 seconds)
                  </>
                ) : (
                  <>
                    Analyze My Claims <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-zinc-600 text-xs mt-4">
                Your data is processed securely and never stored. POPIA compliant.
              </p>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: Shield, label: "92%+ precision", sub: "When we flag, we're right" },
                { icon: Zap, label: "AI-powered", sub: "7-tool reasoning engine" },
                { icon: TrendingDown, label: "R5K-R50K/mo", sub: "Typical recovery per practice" },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 text-center">
                  <item.icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-zinc-500 text-xs">{item.sub}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Claims Analysis Complete</h2>
              <p className="text-zinc-400 mt-1">{totalClaims} claims analyzed</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{totalClaims}</p>
                <p className="text-xs text-zinc-500">Total Claims</p>
              </div>
              <div className="bg-zinc-900 border border-emerald-800/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{valid}</p>
                <p className="text-xs text-zinc-500">Valid</p>
              </div>
              <div className="bg-zinc-900 border border-red-800/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{rejected}</p>
                <p className="text-xs text-zinc-500">Will Be Rejected</p>
              </div>
              <div className="bg-zinc-900 border border-amber-800/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{warnings}</p>
                <p className="text-xs text-zinc-500">Warnings</p>
              </div>
            </div>

            {/* Revenue Impact */}
            <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold">Revenue Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold text-red-400">{rejectionRate}%</p>
                  <p className="text-sm text-zinc-400">Rejection rate</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">R{estimatedLoss.toLocaleString()}</p>
                  <p className="text-sm text-zinc-400">Recoverable if fixed</p>
                </div>
              </div>
            </div>

            {/* Top Issues */}
            {(result.batchInsights as Array<Record<string, unknown>>)?.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Top Issues Found</h3>
                <div className="space-y-3">
                  {(result.batchInsights as Array<Record<string, unknown>>).slice(0, 5).map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{insight.rule as string}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{insight.explanation as string}</p>
                        <p className="text-xs text-emerald-400 mt-1">{insight.fix as string}</p>
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{insight.affectedCount as number} claims</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Stop losing R{estimatedLoss.toLocaleString()}/batch</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Get continuous claim validation before submission. Fix errors before they become rejections.
              </p>
              <div className="flex gap-3 justify-center">
                <a href="/login" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium text-sm transition">
                  Start Free Trial
                </a>
                <button
                  onClick={() => { setResult(null); setFile(null); }}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-medium text-sm transition"
                >
                  Analyze Another File
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
