"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Loader2, CheckCircle2, XCircle, AlertCircle, Search, Clock,
} from "lucide-react";

const SCHEMES = [
  "Discovery Health", "GEMS", "Bonitas", "Medihelp", "Momentum Health",
  "Bestmed", "Fedhealth", "CompCare", "Sizwe Hosmed",
];

interface Benefit {
  category: string;
  available: boolean;
  remainingAmount?: number;
  usedAmount?: number;
  annualLimit?: number;
}

interface EligibilityResult {
  eligible: boolean;
  scheme: string;
  option: string;
  memberName?: string;
  benefits: Benefit[];
  preAuthRequired?: boolean;
  waitingPeriod?: boolean;
  effectiveDate?: string;
}

interface EligibilityCheck {
  id: string;
  patientName: string;
  membershipNumber: string;
  scheme: string;
  eligible: boolean;
  option: string;
  benefits: string;
  checkedAt: string;
}

export default function EligibilityPage() {
  const [form, setForm] = useState({
    patientName: "", membershipNumber: "", dependentCode: "00", scheme: "", patientDob: "",
  });
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [history, setHistory] = useState<EligibilityCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/healthbridge/eligibility");
      const data = await res.json();
      setHistory(data.checks || []);
      setHistoryLoaded(true);
    } catch { /* empty */ }
  }

  async function checkEligibility(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/healthbridge/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result || null);
        // Refresh history
        setHistoryLoaded(false);
        loadHistory();
      }
    } catch {
      setError("Request failed — check your connection");
    } finally {
      setLoading(false);
    }
  }

  // Load history on first render
  if (!historyLoaded) loadHistory();

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-5">
          <Heart className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">Benefit Check</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">Real-time Eligibility</span>
        </div>

        {/* Check Form */}
        <form onSubmit={checkEligibility} className="rounded-xl glass-panel p-5 space-y-4">
          <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Patient Lookup</div>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" placeholder="Patient name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="input-glass" />
            <select value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value })} className="input-glass" required>
              <option value="">Select scheme *</option>
              {SCHEMES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Membership number *" required value={form.membershipNumber} onChange={(e) => setForm({ ...form, membershipNumber: e.target.value })} className="input-glass" />
            <input type="text" placeholder="Dependent code (00)" value={form.dependentCode} onChange={(e) => setForm({ ...form, dependentCode: e.target.value })} className="input-glass" />
            <input type="date" placeholder="Date of birth" value={form.patientDob} onChange={(e) => setForm({ ...form, patientDob: e.target.value })} className="input-glass" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--teal)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Checking..." : "Check Eligibility"}
            </button>
          </div>
        </form>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mt-4">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-5 space-y-4 mt-5">
            <div className="flex items-center gap-3">
              {result.eligible ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
              <span className="text-[15px] font-semibold text-[var(--ivory)]">
                {result.eligible ? "Member Active" : "Member Not Active"}
              </span>
              <span className="text-[12px] text-[var(--text-secondary)]">
                {result.scheme} — {result.option}
              </span>
              {result.preAuthRequired && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium ml-auto">Pre-auth Required</span>
              )}
            </div>

            {/* Benefits Breakdown */}
            {result.benefits && result.benefits.length > 0 && (
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-2">Benefit Breakdown</div>
                {result.benefits.map((b, i) => {
                  const usedPct = b.annualLimit && b.annualLimit > 0 ? Math.round(((b.usedAmount || 0) / b.annualLimit) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-[12px] py-2.5 border-t border-[var(--border)]">
                      <span className="text-[var(--ivory)] font-medium">{b.category}</span>
                      <div className="flex items-center gap-4">
                        {b.available ? (
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Available</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Exhausted</span>
                        )}
                        {b.remainingAmount != null && b.annualLimit != null && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-[var(--charcoal)]/30 overflow-hidden">
                              <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${Math.min(usedPct, 100)}%` }} />
                            </div>
                            <span className="text-[var(--text-tertiary)] text-[11px]">
                              R{(b.remainingAmount / 100).toLocaleString()} of R{(b.annualLimit / 100).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Recent Checks */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Recent Eligibility Checks
            </div>
            <div className="rounded-xl glass-panel overflow-hidden divide-y divide-[var(--border)]">
              {history.slice(0, 10).map((check) => (
                <div key={check.id} className="flex items-center gap-4 p-3.5 hover:bg-white/[0.02]">
                  {check.eligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--ivory)]">{check.patientName || check.membershipNumber}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{check.scheme} — {check.option}</div>
                  </div>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {new Date(check.checkedAt).toLocaleDateString("en-ZA")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
