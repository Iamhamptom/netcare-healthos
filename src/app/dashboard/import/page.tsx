"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle, Check, ArrowRight, Download, X, Users } from "lucide-react";

interface ParsedRow {
  [key: string]: string;
}

const PATIENT_FIELDS = [
  { key: "name", label: "Full Name", required: true },
  { key: "phone", label: "Phone Number", required: true },
  { key: "email", label: "Email", required: false },
  { key: "idNumber", label: "SA ID Number", required: false },
  { key: "dateOfBirth", label: "Date of Birth", required: false },
  { key: "gender", label: "Gender", required: false },
  { key: "medicalAid", label: "Medical Aid", required: false },
  { key: "medicalAidNumber", label: "Medical Aid Number", required: false },
  { key: "bloodType", label: "Blood Type", required: false },
  { key: "address", label: "Address", required: false },
];

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: ParsedRow = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });

  return { headers, rows };
}

export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "result">("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const [fileError, setFileError] = useState("");

  const handleFile = useCallback((file: File) => {
    setFileError("");
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 5MB.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCSV(text);
      setHeaders(h);
      setRows(r);

      // Auto-map by fuzzy matching
      const autoMap: Record<string, string> = {};
      for (const field of PATIENT_FIELDS) {
        const match = h.find(header => {
          const hl = header.toLowerCase();
          const fl = field.label.toLowerCase();
          const fk = field.key.toLowerCase();
          return hl === fk || hl === fl || hl.includes(fk) || hl.includes(fl.split(" ")[0]);
        });
        if (match) autoMap[field.key] = match;
      }
      setMapping(autoMap);
      setStep("map");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      handleFile(file);
    }
  }, [handleFile]);

  const mappedRows = rows.map(row => {
    const mapped: Record<string, string> = {};
    for (const [field, header] of Object.entries(mapping)) {
      mapped[field] = row[header] || "";
    }
    return mapped;
  });

  const validRows = mappedRows.filter(r => r.name && r.phone);

  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch("/api/patients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      setResult({ imported: 0, skipped: 0, errors: ["Import request failed"] });
      setStep("result");
    }
    setImporting(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Import Patients</h1>
        <p className="text-sm text-gray-500 mt-1">Migrate patients from your existing system via CSV or Excel export</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-[12px]">
        {["Upload", "Map Columns", "Preview", "Done"].map((label, i) => {
          const stepIdx = ["upload", "map", "preview", "result"].indexOf(step);
          const isActive = i === stepIdx;
          const isDone = i < stepIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${isDone ? "bg-[#3DA9D1]" : "bg-gray-200"}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
                isActive ? "bg-[#3DA9D1] text-[#1D3443] border border-[#3DA9D1]" :
                isDone ? "bg-[#3DA9D1] text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                <span>{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-[#3DA9D1] hover:bg-[#3DA9D1]/30 transition-all cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">Drop your CSV file here, or click to browse</p>
            <p className="text-xs text-gray-400">Supports .csv files exported from GoodX, Healthbridge, Elixir, or any spreadsheet</p>
            {fileError && (
              <p className="text-xs text-red-500 mt-2 font-medium">{fileError}</p>
            )}
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {/* Template downloads */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { name: "Generic Template", desc: "Standard CSV format" },
              { name: "GoodX Export", desc: "For GoodX users" },
              { name: "Healthbridge Export", desc: "For Healthbridge users" },
            ].map(tmpl => (
              <button
                key={tmpl.name}
                onClick={() => {
                  const csv = "Name,Phone,Email,SA ID Number,Date of Birth,Gender,Medical Aid,Blood Type,Address\n";
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${tmpl.name.toLowerCase().replace(/\s/g, "-")}-template.csv`;
                  a.click();
                }}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-[#3DA9D1] hover:bg-[#3DA9D1]/30 transition-all text-left"
              >
                <Download className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-[12px] font-medium text-gray-700">{tmpl.name}</div>
                  <div className="text-[11px] text-gray-400">{tmpl.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Map columns */}
      {step === "map" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#3DA9D1]" />
              <span className="text-sm font-medium text-gray-700">{fileName}</span>
              <span className="text-xs text-gray-400">{rows.length} rows found</span>
            </div>
            <button onClick={() => setStep("upload")} className="text-xs text-gray-400 hover:text-gray-600">Change file</button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500">Map your columns to patient fields. We auto-matched what we could.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {PATIENT_FIELDS.map(field => (
                <div key={field.key} className="flex items-center px-4 py-3 gap-4">
                  <div className="w-48">
                    <div className="text-[13px] font-medium text-gray-700">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                  <select
                    value={mapping[field.key] || ""}
                    onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-700 bg-white focus:border-[#3DA9D1] focus:outline-none"
                  >
                    <option value="">— Skip this field —</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {mapping[field.key] && (
                    <div className="flex items-center gap-1 text-[#3DA9D1]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setStep("upload")} className="text-sm text-gray-400 hover:text-gray-600">Back</button>
            <button
              onClick={() => setStep("preview")}
              disabled={!mapping.name || !mapping.phone}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Preview Import
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">{validRows.length} patients ready to import</p>
              {rows.length - validRows.length > 0 && (
                <p className="text-xs text-amber-500">{rows.length - validRows.length} rows skipped (missing name or phone)</p>
              )}
            </div>
            <button onClick={() => setStep("map")} className="text-xs text-gray-400 hover:text-gray-600">Back to mapping</button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Phone</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Email</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Medical Aid</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">ID Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {validRows.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800 font-medium">{row.name}</td>
                    <td className="px-3 py-2 text-gray-600">{row.phone}</td>
                    <td className="px-3 py-2 text-gray-600">{row.email || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">{row.medicalAid || "—"}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono">{row.idNumber || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validRows.length > 50 && (
              <div className="px-3 py-2 text-center text-xs text-gray-400 bg-gray-50">
                + {validRows.length - 50} more rows
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-[12px] text-blue-700">
              <p className="font-medium">SA ID numbers will be auto-parsed</p>
              <p>Date of birth and gender will be extracted automatically from valid SA ID numbers.</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep("map")} className="text-sm text-gray-400 hover:text-gray-600">Back</button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] disabled:opacity-50 transition-all"
            >
              {importing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Importing...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Import {validRows.length} Patients
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Result */}
      {step === "result" && result && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#3DA9D1] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-[#3DA9D1]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Import Complete</h2>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-2xl font-bold text-[#3DA9D1]">{result.imported}</div>
                <div className="text-xs text-gray-500">Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{result.skipped}</div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="text-left bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-[11px] text-red-600">{err}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <a href="/dashboard/patients" className="px-6 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] transition-all">
              View Patients
            </a>
            <button
              onClick={() => { setStep("upload"); setResult(null); setRows([]); setHeaders([]); setMapping({}); }}
              className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-gray-300 transition-all"
            >
              Import More
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
