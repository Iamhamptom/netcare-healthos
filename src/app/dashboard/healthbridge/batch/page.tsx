"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload, Loader2, Shield, Send, CheckCircle2, XCircle, FileUp, AlertCircle,
} from "lucide-react";

interface BatchRow {
  rowNumber: number;
  patientName: string;
  valid: boolean;
  errors?: string[];
}

interface BatchValidation {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: BatchRow[];
}

interface BatchSubmission {
  submitted: number;
  failed: number;
  skipped: number;
  results: { rowNumber: number; patientName: string; status: string; transactionRef: string }[];
  failures: { rowNumber: number; patientName: string; error: string }[];
}

interface BatchResult {
  action: string;
  validation: BatchValidation;
  submission?: BatchSubmission;
}

export default function BatchUploadPage() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runBatch(action: "validate" | "submit") {
    if (!csv.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/healthbridge/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, action }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv") && !file.type.includes("csv") && !file.type.includes("text")) {
      setError("Please upload a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setCsv(text);
        setResult(null);
        setError(null);
      }
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  const rowCount = csv.trim() ? csv.trim().split("\n").length - 1 : 0;

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Upload className="w-5 h-5 text-[var(--gold)]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">Batch Claim Upload</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-medium">CSV</span>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-[var(--teal)] bg-[var(--teal)]/5" : "border-[var(--border)] hover:border-[var(--teal)]/30"
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
          <FileUp className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[var(--teal)]" : "text-[var(--text-tertiary)]"}`} />
          <div className="text-[13px] text-[var(--ivory)] font-medium mb-1">
            {dragOver ? "Drop CSV file here" : "Drag & drop a CSV file, or click to browse"}
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)]">
            Required columns: <span className="text-[var(--ivory)]">patient_name, scheme, membership, icd10, amount</span>
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Optional: dob, id_number, dependent, date_of_service, cpt, description, authorization
          </div>
        </div>

        {/* CSV Textarea */}
        <div className="rounded-xl glass-panel p-5 space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">CSV Content</div>
            {rowCount > 0 && (
              <span className="text-[11px] text-[var(--text-tertiary)]">{rowCount} data row{rowCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          <textarea
            placeholder={"patient_name,scheme,membership,icd10,cpt,description,amount\nJohn Mokoena,Discovery Health,900012345,I10,0190,GP consultation - hypertension,520\nPriya Naidoo,Bonitas,800067890,J06.9,0190,GP consultation - URTI,520\nThabo Molefe,GEMS,000012345,E11.9,0193,Extended consultation - diabetes,780"}
            value={csv}
            onChange={(e) => { setCsv(e.target.value); setResult(null); }}
            rows={8}
            className="w-full input-glass resize-none text-[12px] font-mono"
          />
          <div className="flex gap-3">
            <button onClick={() => runBatch("validate")} disabled={loading || !csv.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--charcoal)]/30 border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--ivory)] disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? "Processing..." : "Validate Only"}
            </button>
            <button onClick={() => runBatch("submit")} disabled={loading || !csv.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Validate & Submit
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5 space-y-4 mt-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-medium text-[var(--ivory)]">Results</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{result.validation.validRows} valid</span>
              {result.validation.invalidRows > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{result.validation.invalidRows} invalid</span>
              )}
              {result.submission && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{result.submission.submitted} submitted</span>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg p-3 bg-white/[0.02]">
                <div className="text-[18px] font-bold text-[var(--ivory)]">{result.validation.totalRows}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Total Rows</div>
              </div>
              <div className="rounded-lg p-3 bg-emerald-500/5">
                <div className="text-[18px] font-bold text-emerald-400">{result.validation.validRows}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Valid</div>
              </div>
              <div className="rounded-lg p-3 bg-red-500/5">
                <div className="text-[18px] font-bold text-red-400">{result.validation.invalidRows}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Invalid</div>
              </div>
            </div>

            {/* Submission results */}
            {result.submission && result.submission.results.length > 0 && (
              <div>
                <div className="text-[11px] text-[var(--text-tertiary)] font-medium mb-2 uppercase tracking-wider">Submitted Claims</div>
                {result.submission.results.map((r) => (
                  <div key={r.rowNumber} className="flex items-center gap-3 py-2 text-[12px] border-b border-[var(--border)] last:border-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[var(--text-tertiary)] w-8">#{r.rowNumber}</span>
                    <span className="text-[var(--ivory)] flex-1">{r.patientName}</span>
                    <span className="text-[var(--teal)] font-mono text-[11px]">{r.transactionRef}</span>
                    <span className="text-emerald-400">{r.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Per-row validation */}
            <div>
              <div className="text-[11px] text-[var(--text-tertiary)] font-medium mb-2 uppercase tracking-wider">Row Validation</div>
              <div className="divide-y divide-[var(--border)]">
                {result.validation.rows.slice(0, 50).map((row) => (
                  <div key={row.rowNumber} className="flex items-center gap-3 py-2 text-[12px]">
                    {row.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <span className="text-[var(--text-tertiary)] w-8">#{row.rowNumber}</span>
                    <span className="text-[var(--ivory)] flex-1">{row.patientName}</span>
                    <span className={row.valid ? "text-emerald-400" : "text-red-400"}>{row.valid ? "Valid" : "Invalid"}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
