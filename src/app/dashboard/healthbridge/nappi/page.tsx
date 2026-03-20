"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Pill, Loader2, Search, Info, Copy, Check, AlertCircle,
} from "lucide-react";

interface NAPPIResult {
  nappiCode: string;
  name: string;
  dosageForm: string;
  manufacturer: string;
  sepPrice: number;
  dispensingFee: number;
  sepFormatted: string;
  dispensingFeeFormatted: string;
  totalFormatted: string;
  schedule: string;
}

export default function NappiLookupPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NAPPIResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function searchNAPPI() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch(`/api/healthbridge/nappi?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.medicines || []);
      }
      setSearched(true);
    } catch {
      setError("Search failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Pill className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">NAPPI Code Lookup</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">Medicine Prices</span>
        </div>

        {/* Search */}
        <div className="rounded-xl glass-panel p-5 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search by medicine name (e.g. metformin, amlodipine, amoxicillin)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchNAPPI()}
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--teal)]/30"
              />
            </div>
            <button onClick={searchNAPPI} disabled={loading || !query.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--teal)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
            <Info className="w-3 h-3" /> Powered by medicineprices.org.za — SA Single Exit Price database (free, open-source)
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[var(--text-tertiary)]">{results.length} result{results.length !== 1 ? "s" : ""} found</span>
            </div>
            <div className="rounded-xl glass-panel overflow-hidden divide-y divide-[var(--border)]">
              {results.map((med, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[var(--ivory)]">{med.name}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-2 mt-0.5 flex-wrap">
                      <button onClick={() => copyCode(med.nappiCode)} className="flex items-center gap-1 font-mono text-[var(--teal)] hover:opacity-80" title="Copy NAPPI code">
                        {med.nappiCode}
                        {copiedCode === med.nappiCode ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                      <span>·</span>
                      <span>{med.dosageForm}</span>
                      <span>·</span>
                      <span>{med.manufacturer}</span>
                      {med.schedule && (
                        <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-medium">{med.schedule}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-[14px] font-semibold text-[var(--gold)]">{med.sepFormatted}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">
                      SEP + {med.dispensingFeeFormatted} fee = {med.totalFormatted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {searched && results.length === 0 && !error && !loading && (
          <div className="rounded-xl glass-panel p-8 text-center">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <div className="text-[13px] text-[var(--text-tertiary)]">No medicines found for &ldquo;{query}&rdquo;</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Try a generic name or active ingredient</div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
