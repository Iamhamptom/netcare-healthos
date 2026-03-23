"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Image, File, Trash2, Download, Loader2, X } from "lucide-react";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  category: string;
  size: number;
  createdAt: string;
}

const CATEGORIES = [
  { value: "referral", label: "Referral Letter", icon: FileText },
  { value: "lab_result", label: "Lab Result", icon: File },
  { value: "id_document", label: "ID Document", icon: File },
  { value: "insurance", label: "Insurance / Medical Aid", icon: FileText },
  { value: "other", label: "Other", icon: File },
];

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FileText;
  if (["jpg", "jpeg", "png"].includes(ext || "")) return Image;
  return File;
}

interface Props {
  selectedPatient: string;
}

export default function DocumentsTab({ selectedPatient }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("referral");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/intake/files")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.files)) setFiles(data.files); })
      .catch(() => {});
  }, []);

  const uploadFile = useCallback(async (file: globalThis.File) => {
    if (file.size > MAX_SIZE) {
      setError(`File too large: ${formatFileSize(file.size)}. Max 10MB.`);
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (selectedPatient) formData.append("patientId", selectedPatient);

      const res = await fetch("/api/intake/files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setFiles(prev => [data.file, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [category, selectedPatient]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/intake/files?id=${id}`, { method: "DELETE" });
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch {
      setError("Delete failed");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between"
          >
            <span className="text-sm text-red-300">{error}</span>
            <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-400" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category selector */}
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-semibold">
          Document Type
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat.value
                  ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                  : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-teal-500/50 bg-teal-500/5"
            : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-3" />
        ) : (
          <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
        )}
        <p className="text-sm text-white/60 font-medium">
          {uploading ? "Uploading..." : "Drop file here or click to browse"}
        </p>
        <p className="text-xs text-white/30 mt-1">
          PDF, JPG, PNG, DOC, DOCX — Max 10MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Uploaded Documents ({files.length})
          </h3>
          {files.map((file) => {
            const Icon = getFileIcon(file.originalName);
            const catLabel = CATEGORIES.find(c => c.value === file.category)?.label || file.category;
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 truncate">{file.originalName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-teal-400/60">{catLabel}</span>
                    <span className="text-[10px] text-white/20">{formatFileSize(file.size)}</span>
                    <span className="text-[10px] text-white/20">{new Date(file.createdAt).toLocaleDateString("en-ZA")}</span>
                  </div>
                </div>
                <a
                  href={`/uploads/intake/${file.filename}`}
                  download={file.originalName}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg hover:bg-white/[0.04] text-white/30 hover:text-white/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
