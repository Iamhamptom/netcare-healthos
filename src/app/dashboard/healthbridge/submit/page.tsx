"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send, Loader2, CheckCircle2, XCircle, AlertCircle, Zap, Shield,
} from "lucide-react";

const SCHEMES = [
  "Discovery Health", "GEMS", "Bonitas", "Medihelp",
  "Momentum Health", "Bestmed", "Fedhealth", "CompCare", "Sizwe Hosmed",
];

interface ValidationIssue {
  line?: number;
  field: string;
  severity: string;
  code: string;
  message: string;
  suggestion?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: number;
  warnings: number;
  estimatedRejectionRisk: string;
  pmbDetected: boolean;
  issues: ValidationIssue[];
}

export default function SubmitClaimPage() {
  const [form, setForm] = useState({
    patientName: "", patientDob: "", patientIdNumber: "", patientGender: "",
    medicalAidScheme: "", membershipNumber: "", dependentCode: "00",
    dateOfService: new Date().toISOString().slice(0, 10), placeOfService: "11",
    treatingProvider: "", providerNumber: "", authorizationNumber: "",
    icd10Code: "", cptCode: "", description: "", amount: "",
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function validateClaim() {
    setValidating(true);
    setError(null);
    try {
      const lineItems = [{
        icd10Code: form.icd10Code, cptCode: form.cptCode,
        description: form.description, quantity: 1,
        amount: Math.round(parseFloat(form.amount || "0") * 100),
      }];
      const res = await fetch("/api/healthbridge/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lineItems }),
      });
      const data = await res.json();
      setValidation(data.validation || null);
      return data.validation?.valid ?? false;
    } catch {
      setError("Validation request failed");
      return false;
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const isValid = await validateClaim();
    if (!isValid) { setSubmitting(false); return; }

    try {
      const lineItems = [{
        icd10Code: form.icd10Code, cptCode: form.cptCode,
        description: form.description, quantity: 1,
        amount: Math.round(parseFloat(form.amount || "0") * 100),
      }];
      const res = await fetch("/api/healthbridge/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lineItems, submit: true }),
      });
      const data = await res.json();
      if (data.claim) {
        setSuccess(`Claim submitted — Ref: ${data.claim.transactionRef || data.claim.id}`);
        setForm({
          patientName: "", patientDob: "", patientIdNumber: "", patientGender: "",
          medicalAidScheme: "", membershipNumber: "", dependentCode: "00",
          dateOfService: new Date().toISOString().slice(0, 10), placeOfService: "11",
          treatingProvider: "", providerNumber: "", authorizationNumber: "",
          icd10Code: "", cptCode: "", description: "", amount: "",
        });
        setValidation(null);
      } else {
        setError(data.error || "Submission failed");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-5">
          <Send className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold text-[var(--ivory)]">Submit Medical Aid Claim</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] font-medium">Healthbridge Switch</span>
        </div>

        {success && (
          <div className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3 mb-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[13px] text-emerald-400 font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3 mb-5">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Details */}
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Patient Details</div>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Patient name *" required value={form.patientName} onChange={(e) => update("patientName", e.target.value)} className="input-glass" />
              <input type="date" placeholder="Date of birth" value={form.patientDob} onChange={(e) => update("patientDob", e.target.value)} className="input-glass" />
              <input type="text" placeholder="SA ID number" value={form.patientIdNumber} onChange={(e) => update("patientIdNumber", e.target.value)} className="input-glass" />
            </div>
          </div>

          {/* Medical Aid Details */}
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Medical Aid Details</div>
            <div className="grid grid-cols-3 gap-3">
              <select value={form.medicalAidScheme} onChange={(e) => update("medicalAidScheme", e.target.value)} className="input-glass" required>
                <option value="">Select scheme *</option>
                {SCHEMES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Membership number *" required value={form.membershipNumber} onChange={(e) => update("membershipNumber", e.target.value)} className="input-glass" />
              <input type="text" placeholder="Dependent code (00)" value={form.dependentCode} onChange={(e) => update("dependentCode", e.target.value)} className="input-glass" />
            </div>
          </div>

          {/* Service Details */}
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Service Details</div>
            <div className="grid grid-cols-3 gap-3">
              <input type="date" required value={form.dateOfService} onChange={(e) => update("dateOfService", e.target.value)} className="input-glass" />
              <input type="text" placeholder="Authorization # (if required)" value={form.authorizationNumber} onChange={(e) => update("authorizationNumber", e.target.value)} className="input-glass" />
              <input type="text" placeholder="Treating provider" value={form.treatingProvider} onChange={(e) => update("treatingProvider", e.target.value)} className="input-glass" />
            </div>
          </div>

          {/* Line Item */}
          <div className="rounded-xl glass-panel p-5 space-y-4">
            <div className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Line Item</div>
            <div className="grid grid-cols-4 gap-3">
              <input type="text" placeholder="ICD-10 code *" required value={form.icd10Code} onChange={(e) => update("icd10Code", e.target.value)} className="input-glass" />
              <input type="text" placeholder="CPT / tariff code *" required value={form.cptCode} onChange={(e) => update("cptCode", e.target.value)} className="input-glass" />
              <input type="text" placeholder="Description *" required value={form.description} onChange={(e) => update("description", e.target.value)} className="input-glass" />
              <input type="number" placeholder="Amount (R) *" required step="0.01" min="0" value={form.amount} onChange={(e) => update("amount", e.target.value)} className="input-glass" />
            </div>
          </div>

          {/* Validation Result */}
          {validation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className={`rounded-xl p-4 border ${validation.valid ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {validation.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="text-[12px] font-medium text-[var(--ivory)]">
                  {validation.valid ? "Claim valid — ready to submit" : `${validation.errors} error(s) must be fixed`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-tertiary)] ml-auto">
                  Risk: {validation.estimatedRejectionRisk}
                </span>
                {validation.pmbDetected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">PMB Detected</span>
                )}
              </div>
              {validation.issues.filter((i) => i.severity !== "info").slice(0, 8).map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] py-1">
                  {issue.severity === "error" ? <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" /> : <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-[var(--ivory)]">{issue.message}</span>
                    {issue.suggestion && <div className="text-[var(--text-tertiary)] mt-0.5">{issue.suggestion}</div>}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={validateClaim} disabled={validating} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--charcoal)]/30 border border-[var(--border)] rounded-lg text-[13px] text-[var(--text-secondary)] hover:text-[var(--ivory)] disabled:opacity-50">
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {validating ? "Validating..." : "Validate First"}
            </button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--gold)] rounded-lg text-[13px] font-medium text-[var(--obsidian)] disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Submit to Switch"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
