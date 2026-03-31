"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Send, Search, FileText, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, XCircle, Clock, ArrowRight,
  DollarSign, TrendingUp, Pill, Activity, RefreshCw,
  Building2, Heart, Info, Plus, BarChart3, Zap,
  Brain, Upload, Sparkles, FileUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface ClaimLineItem {
  icd10Code: string;
  cptCode: string;
  nappiCode?: string;
  description: string;
  quantity: number;
  amount: number;
}

interface Claim {
  id: string;
  patientName: string;
  medicalAidScheme: string;
  membershipNumber: string;
  dependentCode: string;
  dateOfService: string;
  lineItems: string;
  totalAmount: number;
  approvedAmount: number;
  paidAmount: number;
  status: string;
  transactionRef: string;
  rejectionCode: string;
  rejectionReason: string;
  submittedAt: string | null;
  createdAt: string;
}

interface SchemeAnalytic {
  scheme: string;
  totalClaims: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  rejectionRate: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  collectionRate: number;
  avgDaysToPayment: number;
  topRejections: { code: string; reason: string; count: number }[];
}

interface AgingBucket {
  bucket: string;
  count: number;
  amountFormatted: string;
}

interface NAPPIResult {
  nappiCode: string;
  name: string;
  dosageForm: string;
  manufacturer: string;
  sepFormatted: string;
  dispensingFeeFormatted: string;
  totalFormatted: string;
  schedule: string;
}

interface ValidationResult {
  valid: boolean;
  errors: number;
  warnings: number;
  estimatedRejectionRisk: string;
  pmbDetected: boolean;
  issues: { line?: number; field: string; severity: string; code: string; message: string; suggestion?: string }[];
}

// ─── Status Colors ───────────────────────────────────────────────

const statusColors: Record<string, string> = {
  draft: "#94a3b8",
  submitted: "#3b82f6",
  accepted: "#10b981",
  rejected: "#ef4444",
  partial: "#f59e0b",
  pending_payment: "#8b5cf6",
  paid: "#10b981",
  short_paid: "#f97316",
  reversed: "#6b7280",
  resubmitted: "#06b6d4",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
  partial: "Partial",
  pending_payment: "Awaiting Payment",
  paid: "Paid",
  short_paid: "Short Paid",
  reversed: "Reversed",
  resubmitted: "Resubmitted",
};

// ─── KPI Card ────────────────────────────────────────────────────

function KPICard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: typeof DollarSign; color: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
      {sub && <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function HealthbridgePage() {
  const [tab, setTab] = useState<"claims" | "analytics" | "nappi" | "ai-coder" | "batch">("claims");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [analytics, setAnalytics] = useState<{ summary: Record<string, string>; schemeAnalytics: SchemeAnalytic[]; aging: AgingBucket[] } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [nappiResults, setNappiResults] = useState<NAPPIResult[]>([]);
  const [nappiQuery, setNappiQuery] = useState("");
  const [nappiLoading, setNappiLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // AI Coder
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{ icd10Codes: { code: string; description: string; confidence: string; isPMB: boolean; isCDL: boolean; cdlCondition?: string; reasoning: string }[]; cptCodes: { code: string; description: string; estimatedTariff: number; reasoning: string }[]; clinicalSummary: string; warnings: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Batch upload
  const [batchCsv, setBatchCsv] = useState("");
  const [batchResult, setBatchResult] = useState<{ action: string; validation: { totalRows: number; validRows: number; invalidRows: number; rows: { rowNumber: number; patientName: string; valid: boolean }[] }; submission?: { submitted: number; failed: number } } | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Claim form
  const [claimForm, setClaimForm] = useState({
    patientName: "", patientDob: "", patientIdNumber: "", patientGender: "",
    medicalAidScheme: "", membershipNumber: "", dependentCode: "00",
    dateOfService: new Date().toISOString().slice(0, 10), placeOfService: "11",
    treatingProvider: "", providerNumber: "", authorizationNumber: "",
    icd10Code: "", cptCode: "", description: "", amount: "",
  });

  // Eligibility form
  const [eligForm, setEligForm] = useState({
    patientName: "", membershipNumber: "", dependentCode: "00", scheme: "", patientDob: "",
  });
  const [eligResult, setEligResult] = useState<Record<string, unknown> | null>(null);

  // ── Data Fetching ──
  const loadClaims = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/healthbridge/claims?${params}`);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch (err) {
      void err;
    }
  }, [statusFilter]);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/healthbridge/analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      void err;
    }
  }, []);

  useEffect(() => {
    Promise.all([loadClaims(), loadAnalytics()]).then(() => setLoading(false));
  }, [loadClaims, loadAnalytics]);

  // ── Validate Before Submit ──
  async function validateClaim() {
    const lineItems = [{
      icd10Code: claimForm.icd10Code, cptCode: claimForm.cptCode,
      description: claimForm.description, quantity: 1,
      amount: Math.round(parseFloat(claimForm.amount || "0") * 100),
    }];
    const res = await fetch("/api/healthbridge/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...claimForm, lineItems }),
    });
    const data = await res.json();
    setValidationResult(data.validation);
    return data.validation.valid;
  }

  // ── Submit Claim ──
  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const isValid = await validateClaim();
    if (!isValid) { setSubmitting(false); return; }

    const lineItems: ClaimLineItem[] = [{
      icd10Code: claimForm.icd10Code, cptCode: claimForm.cptCode,
      description: claimForm.description, quantity: 1,
      amount: Math.round(parseFloat(claimForm.amount || "0") * 100),
    }];

    const res = await fetch("/api/healthbridge/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...claimForm, lineItems, submit: true }),
    });
    const data = await res.json();
    if (data.claim) {
      setClaims(prev => [data.claim, ...prev]);
      setClaimForm({
        patientName: "", patientDob: "", patientIdNumber: "", patientGender: "",
        medicalAidScheme: "", membershipNumber: "", dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10), placeOfService: "11",
        treatingProvider: "", providerNumber: "", authorizationNumber: "",
        icd10Code: "", cptCode: "", description: "", amount: "",
      });
      setShowNewClaim(false);
      setValidationResult(null);
      loadAnalytics();
    }
    setSubmitting(false);
  }

  // ── Eligibility Check ──
  async function checkEligibility(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/healthbridge/eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eligForm),
    });
    const data = await res.json();
    setEligResult(data.result || null);
  }

  // ── NAPPI Search ──
  async function searchNAPPI() {
    if (!nappiQuery.trim()) return;
    setNappiLoading(true);
    try {
      const res = await fetch(`/api/healthbridge/nappi?q=${encodeURIComponent(nappiQuery)}`);
      const data = await res.json();
      setNappiResults(data.medicines || []);
    } catch (err) {
      void err;
    }
    setNappiLoading(false);
  }

  // ── Reconcile ──
  async function runReconcile() {
    await fetch("/api/healthbridge/reconcile", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    loadClaims();
    loadAnalytics();
  }

  // ── AI Code Suggestion ──
  async function runAiCoder() {
    if (!clinicalNotes.trim() || clinicalNotes.length < 10) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/healthbridge/ai-code", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicalNotes }),
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion || null);
    } catch (err) {
      void err;
    }
    setAiLoading(false);
  }

  // ── Batch Upload ──
  async function runBatch(action: "validate" | "submit") {
    if (!batchCsv.trim()) return;
    setBatchLoading(true);
    try {
      const res = await fetch("/api/healthbridge/batch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: batchCsv, action }),
      });
      const data = await res.json();
      setBatchResult(data);
      if (action === "submit") { loadClaims(); loadAnalytics(); }
    } catch (err) {
      void err;
    }
    setBatchLoading(false);
  }

  // Filtering
  const filteredClaims = claims.filter(c => {
    if (search && !c.patientName.toLowerCase().includes(search.toLowerCase()) && !c.membershipNumber.includes(search)) return false;
    return true;
  });

  // KPI values
  const totalBilled = claims.reduce((s, c) => s + c.totalAmount, 0);
  const totalPaid = claims.reduce((s, c) => s + c.paidAmount, 0);
  const accepted = claims.filter(c => ["accepted", "pending_payment", "paid", "short_paid"].includes(c.status)).length;
  const rejected = claims.filter(c => c.status === "rejected").length;
  const acceptanceRate = claims.length > 0 ? Math.round((accepted / claims.length) * 100) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 animate-spin text-[var(--teal)]" />
        <span className="ml-2 text-[13px] text-[var(--text-secondary)]">Loading Healthbridge...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold">Healthbridge Switching</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">SA Medical Aid Claims</span>
        </div>
        <div className="flex gap-2">
          <button onClick={runReconcile} className="flex items-center gap-2 px-3 py-2 bg-[var(--charcoal)]/30 border border-[var(--border)] rounded-lg text-[12px] text-[var(--text-secondary)] hover:text-[var(--ivory)]">
            <RefreshCw className="w-3.5 h-3.5" /> Reconcile eRAs
          </button>
          <button onClick={() => { setShowNewClaim(!showNewClaim); setShowEligibility(false); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">
            <Send className="w-4 h-4" /> Submit Claim
          </button>
          <button onClick={() => { setShowEligibility(!showEligibility); setShowNewClaim(false); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--teal)]/10 text-[var(--teal)] rounded-lg text-[13px] font-medium hover:bg-[var(--teal)]/20">
            <Heart className="w-4 h-4" /> Check Benefits
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Total Billed" value={`R${(totalBilled / 100).toLocaleString()}`} icon={DollarSign} color="#D4AF37" />
        <KPICard label="Total Collected" value={`R${(totalPaid / 100).toLocaleString()}`} icon={TrendingUp} color="#10b981" />
        <KPICard label="Outstanding" value={`R${((totalBilled - totalPaid) / 100).toLocaleString()}`} icon={AlertCircle} color="#ef4444" />
        <KPICard label="Acceptance Rate" value={`${acceptanceRate}%`} icon={CheckCircle2} color="#3DA9D1" sub={`${accepted} of ${claims.length} claims`} />
        <KPICard label="Rejected" value={String(rejected)} icon={XCircle} color="#ef4444" sub={claims.length > 0 ? `${Math.round((rejected / claims.length) * 100)}% rejection rate` : ""} />
      </div>

      {/* ── Claim Submission Form ── */}
      <AnimatePresence>
        {showNewClaim && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={submitClaim} className="rounded-xl glass-panel p-5 space-y-4 overflow-hidden">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--gold)]" />
              <h3 className="text-sm font-medium text-[var(--ivory)]">Submit Medical Aid Claim</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Patient name *" required value={claimForm.patientName} onChange={e => setClaimForm({ ...claimForm, patientName: e.target.value })} className="input-glass" />
              <input type="date" placeholder="Date of birth" value={claimForm.patientDob} onChange={e => setClaimForm({ ...claimForm, patientDob: e.target.value })} className="input-glass" />
              <input type="text" placeholder="SA ID number" value={claimForm.patientIdNumber} onChange={e => setClaimForm({ ...claimForm, patientIdNumber: e.target.value })} className="input-glass" />
              <select value={claimForm.medicalAidScheme} onChange={e => setClaimForm({ ...claimForm, medicalAidScheme: e.target.value })} className="input-glass" required>
                <option value="">Select scheme *</option>
                <option>Discovery Health</option><option>GEMS</option><option>Bonitas</option>
                <option>Medihelp</option><option>Momentum Health</option><option>Bestmed</option>
                <option>Fedhealth</option><option>CompCare</option><option>Sizwe Hosmed</option>
              </select>
              <input type="text" placeholder="Membership number *" required value={claimForm.membershipNumber} onChange={e => setClaimForm({ ...claimForm, membershipNumber: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Dependent code (00)" value={claimForm.dependentCode} onChange={e => setClaimForm({ ...claimForm, dependentCode: e.target.value })} className="input-glass" />
              <input type="date" required value={claimForm.dateOfService} onChange={e => setClaimForm({ ...claimForm, dateOfService: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Authorization # (if required)" value={claimForm.authorizationNumber} onChange={e => setClaimForm({ ...claimForm, authorizationNumber: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Treating provider" value={claimForm.treatingProvider} onChange={e => setClaimForm({ ...claimForm, treatingProvider: e.target.value })} className="input-glass" />
            </div>
            <div className="border-t border-[var(--border)] pt-3">
              <div className="text-[11px] text-[var(--text-tertiary)] mb-2 font-medium">LINE ITEM</div>
              <div className="grid grid-cols-4 gap-3">
                <input type="text" placeholder="ICD-10 code *" required value={claimForm.icd10Code} onChange={e => setClaimForm({ ...claimForm, icd10Code: e.target.value })} className="input-glass" />
                <input type="text" placeholder="CPT code *" required value={claimForm.cptCode} onChange={e => setClaimForm({ ...claimForm, cptCode: e.target.value })} className="input-glass" />
                <input type="text" placeholder="Description *" required value={claimForm.description} onChange={e => setClaimForm({ ...claimForm, description: e.target.value })} className="input-glass" />
                <input type="number" placeholder="Amount (R) *" required step="0.01" value={claimForm.amount} onChange={e => setClaimForm({ ...claimForm, amount: e.target.value })} className="input-glass" />
              </div>
            </div>
            {/* Validation result */}
            {validationResult && (
              <div className={`rounded-lg p-3 border ${validationResult.valid ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-[12px] font-medium text-[var(--ivory)]">
                    {validationResult.valid ? "Claim valid — ready to submit" : `${validationResult.errors} error(s) must be fixed`}
                  </span>
                  {validationResult.pmbDetected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">PMB Detected — Must Pay</span>
                  )}
                </div>
                {validationResult.issues.filter(i => i.severity !== "info").slice(0, 5).map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] py-1">
                    {issue.severity === "error" ? <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" /> : <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />}
                    <div>
                      <span className="text-[var(--ivory)]">{issue.message}</span>
                      {issue.suggestion && <div className="text-[var(--text-tertiary)] mt-0.5">{issue.suggestion}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={validateClaim} className="px-5 py-2 bg-[var(--charcoal)]/30 border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--ivory)]">
                <Zap className="w-3.5 h-3.5 inline mr-1" /> Validate
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit to Switch"}
              </button>
              <button type="button" onClick={() => { setShowNewClaim(false); setValidationResult(null); }} className="px-5 py-2 text-[13px] text-[var(--text-secondary)]">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Eligibility Check Form ── */}
      <AnimatePresence>
        {showEligibility && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={checkEligibility} className="rounded-xl glass-panel p-5 space-y-4 overflow-hidden">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[var(--teal)]" />
              <h3 className="text-sm font-medium text-[var(--ivory)]">Check Patient Benefits</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Patient name" value={eligForm.patientName} onChange={e => setEligForm({ ...eligForm, patientName: e.target.value })} className="input-glass" />
              <select value={eligForm.scheme} onChange={e => setEligForm({ ...eligForm, scheme: e.target.value })} className="input-glass" required>
                <option value="">Select scheme *</option>
                <option>Discovery Health</option><option>GEMS</option><option>Bonitas</option>
                <option>Medihelp</option><option>Momentum Health</option>
              </select>
              <input type="text" placeholder="Membership number *" required value={eligForm.membershipNumber} onChange={e => setEligForm({ ...eligForm, membershipNumber: e.target.value })} className="input-glass" />
              <input type="text" placeholder="Dependent code (00)" value={eligForm.dependentCode} onChange={e => setEligForm({ ...eligForm, dependentCode: e.target.value })} className="input-glass" />
              <input type="date" placeholder="Date of birth" value={eligForm.patientDob} onChange={e => setEligForm({ ...eligForm, patientDob: e.target.value })} className="input-glass" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2 bg-[var(--teal)] rounded-lg text-[13px] font-medium text-[var(--obsidian)]">Check Eligibility</button>
              <button type="button" onClick={() => { setShowEligibility(false); setEligResult(null); }} className="px-5 py-2 text-[13px] text-[var(--text-secondary)]">Cancel</button>
            </div>
            {eligResult && (
              <div className="rounded-lg p-4 border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[13px] font-medium text-[var(--ivory)]">
                    {(eligResult as { eligible?: boolean }).eligible ? "Member Active" : "Member Not Active"}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    {(eligResult as { scheme?: string }).scheme} — {(eligResult as { option?: string }).option}
                  </span>
                </div>
                {((eligResult as { benefits?: { category: string; available: boolean; remainingAmount?: number; annualLimit?: number }[] }).benefits || []).map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] py-1 border-t border-[var(--border)]">
                    <span className="text-[var(--ivory)]">{b.category}</span>
                    <div className="flex items-center gap-3">
                      {b.available ? <span className="text-emerald-400">Available</span> : <span className="text-red-400">Exhausted</span>}
                      {b.remainingAmount != null && <span className="text-[var(--text-tertiary)]">R{(b.remainingAmount / 100).toLocaleString()} remaining of R{((b.annualLimit || 0) / 100).toLocaleString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="flex gap-4 border-b border-[var(--border)]">
        {([
          { key: "claims" as const, label: `Claims (${claims.length})` },
          { key: "analytics" as const, label: "Analytics" },
          { key: "ai-coder" as const, label: "AI Coder" },
          { key: "batch" as const, label: "Batch Upload" },
          { key: "nappi" as const, label: "NAPPI Lookup" },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${tab === t.key ? "border-[var(--teal)] text-[var(--teal)]" : "border-transparent text-[var(--text-secondary)]"}`}>
            {t.key === "ai-coder" && <Brain className="w-3.5 h-3.5 inline mr-1" />}
            {t.key === "batch" && <Upload className="w-3.5 h-3.5 inline mr-1" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ CLAIMS TAB ═══ */}
      {tab === "claims" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input type="text" placeholder="Search by patient name or membership number..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--teal)]/30" />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); }} className="input-glass text-[12px] w-40">
              <option value="">All statuses</option>
              <option value="draft">Draft</option><option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option><option value="rejected">Rejected</option>
              <option value="paid">Paid</option><option value="short_paid">Short Paid</option>
            </select>
          </div>

          <div className="rounded-xl glass-panel overflow-hidden">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[var(--text-tertiary)]">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No claims yet — submit your first claim above
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredClaims.map(claim => {
                  const lines: ClaimLineItem[] = (() => { try { return JSON.parse(claim.lineItems); } catch { return []; } })();
                  return (
                    <div key={claim.id}>
                      <button onClick={() => setExpanded(expanded === claim.id ? null : claim.id)} className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] text-left">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${statusColors[claim.status] || "#6b7280"}15` }}>
                          {claim.status === "rejected" ? <XCircle className="w-4 h-4 text-red-400" /> :
                           claim.status === "paid" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                           claim.status === "accepted" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                           <Clock className="w-4 h-4" style={{ color: statusColors[claim.status] || "#6b7280" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-[var(--ivory)]">{claim.patientName}</div>
                          <div className="text-[11px] text-[var(--text-tertiary)]">
                            {claim.medicalAidScheme} · {claim.membershipNumber} · {claim.dateOfService}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[14px] font-semibold text-[var(--ivory)]">R{(claim.totalAmount / 100).toLocaleString()}</div>
                          {claim.paidAmount > 0 && claim.paidAmount < claim.totalAmount && (
                            <div className="text-[11px] text-[#f97316]">R{((claim.totalAmount - claim.paidAmount) / 100).toLocaleString()} outstanding</div>
                          )}
                          {claim.paidAmount > 0 && claim.paidAmount >= claim.totalAmount && (
                            <div className="text-[11px] text-emerald-400">Fully paid</div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium px-2 py-1 rounded-full shrink-0" style={{ color: statusColors[claim.status], backgroundColor: `${statusColors[claim.status]}15` }}>
                          {statusLabels[claim.status] || claim.status}
                        </span>
                        {expanded === claim.id ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />}
                      </button>
                      <AnimatePresence>
                        {expanded === claim.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--border)]">
                            <div className="p-4 bg-white/[0.01] space-y-3">
                              {/* Line items */}
                              <div className="text-[11px]">
                                {lines.map((item, i) => (
                                  <div key={i} className="flex justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[var(--teal)] font-mono">{item.icd10Code}</span>
                                      <span className="text-[var(--text-tertiary)]">·</span>
                                      <span className="text-[var(--gold)] font-mono">{item.cptCode}</span>
                                      <span className="text-[var(--text-tertiary)]">·</span>
                                      <span className="text-[var(--ivory)]">{item.description}</span>
                                    </div>
                                    <span className="text-[var(--ivory)] font-medium">R{(item.amount / 100).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Claim details */}
                              <div className="grid grid-cols-4 gap-3 text-[11px]">
                                <div><span className="text-[var(--text-tertiary)]">Ref:</span> <span className="text-[var(--ivory)] ml-1 font-mono">{claim.transactionRef || "—"}</span></div>
                                <div><span className="text-[var(--text-tertiary)]">Approved:</span> <span className="text-[var(--ivory)] ml-1">R{(claim.approvedAmount / 100).toLocaleString()}</span></div>
                                <div><span className="text-[var(--text-tertiary)]">Paid:</span> <span className="text-emerald-400 ml-1">R{(claim.paidAmount / 100).toLocaleString()}</span></div>
                                <div><span className="text-[var(--text-tertiary)]">Submitted:</span> <span className="text-[var(--ivory)] ml-1">{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString("en-ZA") : "—"}</span></div>
                              </div>
                              {/* Rejection reason */}
                              {claim.rejectionCode && (
                                <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/20 text-[11px]">
                                  <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
                                    <XCircle className="w-3 h-3" /> Rejection Code {claim.rejectionCode}
                                  </div>
                                  <div className="text-[var(--ivory)]">{claim.rejectionReason}</div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {tab === "analytics" && analytics && (
        <div className="space-y-5">
          {/* Scheme breakdown */}
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--teal)]" /> Revenue by Scheme
            </h3>
            <div className="space-y-2">
              {analytics.schemeAnalytics.map((scheme) => (
                <div key={scheme.scheme} className="rounded-xl glass-panel p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-[var(--gold)]" />
                      <span className="text-[13px] font-semibold text-[var(--ivory)]">{scheme.scheme}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)]">{scheme.totalClaims} claims</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-emerald-400">{scheme.acceptanceRate}% accepted</span>
                      <span className="text-red-400">{scheme.rejectionRate}% rejected</span>
                      {scheme.avgDaysToPayment > 0 && <span className="text-[var(--text-tertiary)]">{scheme.avgDaysToPayment}d avg payment</span>}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-[var(--charcoal)]/30 overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[var(--teal)]" style={{ width: `${scheme.collectionRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
                    <span>Billed: R{(scheme.totalBilled / 100).toLocaleString()}</span>
                    <span>Collected: R{(scheme.totalPaid / 100).toLocaleString()} ({scheme.collectionRate}%)</span>
                    <span>Outstanding: R{(scheme.totalOutstanding / 100).toLocaleString()}</span>
                  </div>
                  {/* Top rejections */}
                  {scheme.topRejections.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                      <div className="text-[10px] text-[var(--text-tertiary)] mb-1">Top rejection reasons:</div>
                      {scheme.topRejections.slice(0, 3).map((r, i) => (
                        <div key={i} className="text-[10px] text-red-400 flex items-center gap-1">
                          <ArrowRight className="w-2.5 h-2.5" /> Code {r.code}: {r.reason} ({r.count}x)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Aging Report */}
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--ivory)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f59e0b]" /> Outstanding Claims Aging
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {analytics.aging.map((bucket) => {
                const isAlert = bucket.bucket.includes("91") || bucket.bucket.includes("120+");
                return (
                  <div key={bucket.bucket} className={`rounded-xl glass-panel p-4 text-center ${isAlert ? "border-red-500/20" : ""}`}>
                    <div className={`text-[18px] font-bold ${isAlert ? "text-red-400" : "text-[var(--ivory)]"}`}>{bucket.count}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{bucket.bucket}</div>
                    <div className={`text-[12px] font-medium mt-1 ${isAlert ? "text-red-400" : "text-[var(--gold)]"}`}>{bucket.amountFormatted}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ NAPPI TAB ═══ */}
      {tab === "nappi" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Pill className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search medicines by name (e.g. metformin, amlodipine, amoxicillin)..."
                value={nappiQuery}
                onChange={e => setNappiQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchNAPPI()}
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ivory)] focus:outline-none focus:border-[var(--teal)]/30"
              />
            </div>
            <button onClick={searchNAPPI} disabled={nappiLoading} className="px-5 py-2.5 bg-[var(--teal)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
              {nappiLoading ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
            <Info className="w-3 h-3" /> Powered by medicineprices.org.za — SA Single Exit Price database (free, open-source)
          </div>

          {nappiResults.length > 0 && (
            <div className="rounded-xl glass-panel overflow-hidden divide-y divide-[var(--border)]">
              {nappiResults.map((med, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[var(--ivory)]">{med.name}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[var(--teal)]">{med.nappiCode}</span>
                      <span>·</span><span>{med.dosageForm}</span>
                      <span>·</span><span>{med.manufacturer}</span>
                      {med.schedule && <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-medium">{med.schedule}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-[var(--gold)]">{med.sepFormatted}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">SEP + {med.dispensingFeeFormatted} fee = {med.totalFormatted}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ AI CODER TAB ═══ */}
      {tab === "ai-coder" && (
        <div className="space-y-4">
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#8b5cf6]" />
              <h3 className="text-sm font-medium text-[var(--ivory)]">AI ICD-10 + CPT Coder</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium">VRL AI</span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Paste clinical notes from a consultation. AI will suggest ICD-10-ZA and CPT/CCSA codes with PMB/CDL flags, confidence levels, and reasoning.
            </p>
            <textarea
              placeholder={"Paste clinical notes here...\n\nExample: 52-year-old male presenting with persistent headache and elevated BP 160/100. History of hypertension. On amlodipine 5mg. ECG done — normal sinus rhythm. Bloods: HbA1c 7.2%, fasting glucose 8.1. Assessment: Uncontrolled hypertension, newly diagnosed type 2 diabetes. Plan: Add losartan 50mg, start metformin 500mg BD, lifestyle counseling. Follow-up 2 weeks."}
              value={clinicalNotes}
              onChange={e => setClinicalNotes(e.target.value)}
              rows={8}
              className="w-full input-glass resize-none text-[13px]"
            />
            <div className="flex gap-3">
              <button onClick={runAiCoder} disabled={aiLoading || clinicalNotes.length < 10} className="flex items-center gap-2 px-5 py-2 bg-[#8b5cf6] rounded-lg text-[13px] font-medium text-white disabled:opacity-50">
                <Sparkles className="w-4 h-4" /> {aiLoading ? "Analyzing..." : "Suggest Codes"}
              </button>
              {aiSuggestion && <button onClick={() => setAiSuggestion(null)} className="px-5 py-2 text-[13px] text-[var(--text-secondary)]">Clear</button>}
            </div>
          </div>

          {aiSuggestion && (
            <div className="space-y-3">
              {/* Clinical Summary */}
              {aiSuggestion.clinicalSummary && (
                <div className="rounded-xl glass-panel p-4">
                  <div className="text-[11px] text-[var(--text-tertiary)] mb-1 font-medium">CLINICAL SUMMARY</div>
                  <div className="text-[13px] text-[var(--ivory)]">{aiSuggestion.clinicalSummary}</div>
                </div>
              )}

              {/* ICD-10 Suggestions */}
              <div className="rounded-xl glass-panel p-4">
                <div className="text-[11px] text-[var(--text-tertiary)] mb-3 font-medium">ICD-10 CODE SUGGESTIONS</div>
                <div className="space-y-2">
                  {aiSuggestion.icd10Codes.map((code, i) => (
                    <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border)]">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[14px] font-mono font-bold text-[var(--teal)]">{code.code}</span>
                          <span className="text-[12px] text-[var(--ivory)]">{code.description}</span>
                          {code.isPMB && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">PMB</span>}
                          {code.isCDL && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">CDL: {code.cdlCondition}</span>}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{code.reasoning}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
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
                <div className="text-[11px] text-[var(--text-tertiary)] mb-3 font-medium">CPT/TARIFF CODE SUGGESTIONS</div>
                <div className="space-y-2">
                  {aiSuggestion.cptCodes.map((code, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-[var(--border)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-mono font-bold text-[var(--gold)]">{code.code}</span>
                          <span className="text-[12px] text-[var(--ivory)]">{code.description}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)]">{code.reasoning}</div>
                      </div>
                      {code.estimatedTariff > 0 && (
                        <span className="text-[12px] font-medium text-[var(--gold)]">~R{code.estimatedTariff}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {aiSuggestion.warnings.length > 0 && (
                <div className="rounded-lg p-3 border border-amber-500/20 bg-amber-500/5">
                  {aiSuggestion.warnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-amber-400 py-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ BATCH TAB ═══ */}
      {tab === "batch" && (
        <div className="space-y-4">
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileUp className="w-4 h-4 text-[var(--gold)]" />
              <h3 className="text-sm font-medium text-[var(--ivory)]">Batch Claim Upload</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] font-medium">CSV</span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Upload a CSV with claim data. Required columns: <span className="text-[var(--ivory)]">patient_name, scheme, membership, icd10, amount</span>.
              Optional: dob, id_number, dependent, date_of_service, cpt, description, authorization.
            </p>
            <textarea
              placeholder={"patient_name,scheme,membership,icd10,cpt,description,amount\nJohn Mokoena,Discovery Health,900012345,I10,0190,GP consultation - hypertension,520\nPriya Naidoo,Bonitas,800067890,J06.9,0190,GP consultation - URTI,520\nThabo Molefe,GEMS,000012345,E11.9,0193,Extended consultation - diabetes,780"}
              value={batchCsv}
              onChange={e => setBatchCsv(e.target.value)}
              rows={8}
              className="w-full input-glass resize-none text-[12px] font-mono"
            />
            <div className="flex gap-3">
              <button onClick={() => runBatch("validate")} disabled={batchLoading || !batchCsv.trim()} className="flex items-center gap-2 px-5 py-2 bg-[var(--charcoal)]/30 border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--ivory)] disabled:opacity-50">
                <Shield className="w-4 h-4" /> {batchLoading ? "Processing..." : "Validate Only"}
              </button>
              <button onClick={() => runBatch("submit")} disabled={batchLoading || !batchCsv.trim()} className="flex items-center gap-2 px-5 py-2 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
                <Send className="w-4 h-4" /> Validate & Submit
              </button>
            </div>
          </div>

          {batchResult && (
            <div className="rounded-xl glass-panel p-5 space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-medium text-[var(--ivory)]">Results</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{batchResult.validation.validRows} valid</span>
                {batchResult.validation.invalidRows > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">{batchResult.validation.invalidRows} invalid</span>}
                {batchResult.submission && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{batchResult.submission.submitted} submitted</span>}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg p-3 bg-white/[0.02]">
                  <div className="text-[18px] font-bold text-[var(--ivory)]">{batchResult.validation.totalRows}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Total Rows</div>
                </div>
                <div className="rounded-lg p-3 bg-emerald-500/5">
                  <div className="text-[18px] font-bold text-emerald-400">{batchResult.validation.validRows}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Valid</div>
                </div>
                <div className="rounded-lg p-3 bg-red-500/5">
                  <div className="text-[18px] font-bold text-red-400">{batchResult.validation.invalidRows}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Invalid</div>
                </div>
              </div>
              {/* Per-row results */}
              <div className="divide-y divide-[var(--border)]">
                {batchResult.validation.rows.slice(0, 20).map((row) => (
                  <div key={row.rowNumber} className="flex items-center gap-3 py-2 text-[12px]">
                    {row.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <span className="text-[var(--text-tertiary)] w-8">#{row.rowNumber}</span>
                    <span className="text-[var(--ivory)] flex-1">{row.patientName}</span>
                    <span className={row.valid ? "text-emerald-400" : "text-red-400"}>{row.valid ? "Valid" : "Invalid"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
