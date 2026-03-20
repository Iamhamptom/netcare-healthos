"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, User, Phone, Mail, FileText, AlertTriangle,
  ChevronRight, Check, Loader2, Building2, HeartPulse, Shield, Clock,
} from "lucide-react";

interface PracticeInfo {
  name: string;
  type: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  logoUrl: string;
  services: string[];
}

type Step = "gp" | "patient" | "clinical" | "confirm" | "done";
const STEPS: Step[] = ["gp", "patient", "clinical", "confirm", "done"];
const STEP_LABELS = ["Referring Doctor", "Patient", "Clinical", "Review"];

export default function GPReferralPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [practice, setPractice] = useState<PracticeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("gp");
  const [submitting, setSubmitting] = useState(false);
  const [referralId, setReferralId] = useState("");

  const [form, setForm] = useState({
    referringDoctor: "",
    referringPractice: "",
    referringEmail: "",
    referringPhone: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    dateOfBirth: "",
    medicalAid: "",
    medicalAidNo: "",
    reason: "",
    urgency: "routine",
    clinicalNotes: "",
    icd10Code: "",
  });

  useEffect(() => { params.then(p => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/refer?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setPractice(data.practice);
        setLoading(false);
      })
      .catch(() => { setError("Unable to load referral form"); setLoading(false); });
  }, [slug]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/public/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...form }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setSubmitting(false); return; }
      setReferralId(data.referralId);
      setStep("done");
    } catch {
      setError("Submission failed. Please try again.");
    }
    setSubmitting(false);
  }

  const stepIndex = STEPS.indexOf(step);
  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3DA9D1]" />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Practice Not Found</h1>
          <p className="text-sm text-gray-500">
            {error || "The referral portal you are looking for does not exist. Please verify the URL with the receiving practice."}
          </p>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20 focus:border-[#3DA9D1] transition-colors";
  const labelCls = "flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1A2F3E] text-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#152736] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <h1 className="text-base font-semibold">{practice.name}</h1>
              <p className="text-xs text-[#3DA9D1]">Secure Referral Portal</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#152736]/60 border border-[#1D3443]">
            <Shield className="w-3 h-3 text-[#3DA9D1]" />
            <span className="text-[10px] text-[#3DA9D1] font-medium">HPCSA Compliant</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Steps */}
        {step !== "done" && (
          <div className="flex items-center justify-between mb-8 px-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < stepIndex
                        ? "bg-[#3DA9D1] text-white"
                        : i === stepIndex
                        ? "bg-[#3DA9D1] text-[#1D3443] ring-2 ring-[#3DA9D1]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${i <= stepIndex ? "text-[#1D3443]" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-px mx-2 ${i < stepIndex ? "bg-[#3DA9D1]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        {stepIndex > 0 && step !== "done" && (
          <button onClick={() => setStep(STEPS[stepIndex - 1])} className="text-xs text-gray-500 hover:text-[#1D3443] mb-5 transition-colors">
            &larr; Back
          </button>
        )}

        {/* Error */}
        {error && step !== "done" && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: GP Details */}
          {step === "gp" && (
            <motion.div key="gp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Referring Practitioner</h2>
              <p className="text-sm text-gray-500 mb-6">Your details for the referral record and feedback loop</p>
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-sm">
                <div>
                  <label className={labelCls}><User className="w-3 h-3" /> Doctor Name <span className="text-red-500">*</span></label>
                  <input value={form.referringDoctor} onChange={e => update("referringDoctor", e.target.value)} className={inputCls} placeholder="Dr. Sarah Nkosi" />
                </div>
                <div>
                  <label className={labelCls}><Building2 className="w-3 h-3" /> Practice / Clinic</label>
                  <input value={form.referringPractice} onChange={e => update("referringPractice", e.target.value)} className={inputCls} placeholder="Sandton Family Practice" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><Phone className="w-3 h-3" /> Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={form.referringPhone} onChange={e => update("referringPhone", e.target.value)} className={inputCls} placeholder="011 234 5678" />
                  </div>
                  <div>
                    <label className={labelCls}><Mail className="w-3 h-3" /> Email</label>
                    <input type="email" value={form.referringEmail} onChange={e => update("referringEmail", e.target.value)} className={inputCls} placeholder="dr.nkosi@practice.co.za" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                  <Shield className="w-3 h-3 text-[#3DA9D1]" />
                  We will send you a consultation report after the patient&apos;s visit
                </p>
              </div>
              <button
                onClick={() => {
                  if (!form.referringDoctor.trim()) { setError("Doctor name is required"); return; }
                  if (!form.referringPhone.trim()) { setError("Phone number is required"); return; }
                  setError(""); setStep("patient");
                }}
                className="w-full mt-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1D3443] hover:bg-[#152736] transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 2: Patient Details */}
          {step === "patient" && (
            <motion.div key="patient" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Patient Information</h2>
              <p className="text-sm text-gray-500 mb-6">Patient details for scheduling and medical aid authorisation</p>
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-sm">
                <div>
                  <label className={labelCls}><User className="w-3 h-3" /> Patient Name <span className="text-red-500">*</span></label>
                  <input value={form.patientName} onChange={e => update("patientName", e.target.value)} className={inputCls} placeholder="Full name" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><Phone className="w-3 h-3" /> Patient Phone <span className="text-red-500">*</span></label>
                    <input type="tel" value={form.patientPhone} onChange={e => update("patientPhone", e.target.value)} className={inputCls} placeholder="082 123 4567" />
                  </div>
                  <div>
                    <label className={labelCls}><Mail className="w-3 h-3" /> Patient Email</label>
                    <input type="email" value={form.patientEmail} onChange={e => update("patientEmail", e.target.value)} className={inputCls} placeholder="patient@example.com" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}><HeartPulse className="w-3 h-3" /> Medical Aid</label>
                    <select value={form.medicalAid} onChange={e => update("medicalAid", e.target.value)} className={inputCls}>
                      <option value="">Select...</option>
                      <option value="Discovery Health">Discovery Health</option>
                      <option value="GEMS">GEMS</option>
                      <option value="Bonitas">Bonitas</option>
                      <option value="Momentum Health">Momentum Health</option>
                      <option value="Medihelp">Medihelp</option>
                      <option value="Bestmed">Bestmed</option>
                      <option value="Fedhealth">Fedhealth</option>
                      <option value="CompCare">CompCare</option>
                      <option value="Sizwe Medical">Sizwe Medical</option>
                      <option value="Self-pay">Self-pay (No medical aid)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Membership Number</label>
                    <input value={form.medicalAidNo} onChange={e => update("medicalAidNo", e.target.value)} className={inputCls} placeholder="e.g. 123456789" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!form.patientName.trim()) { setError("Patient name is required"); return; }
                  if (!form.patientPhone.trim()) { setError("Patient phone is required"); return; }
                  setError(""); setStep("clinical");
                }}
                className="w-full mt-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1D3443] hover:bg-[#152736] transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 3: Clinical Details */}
          {step === "clinical" && (
            <motion.div key="clinical" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Clinical Information</h2>
              <p className="text-sm text-gray-500 mb-6">Reason for referral and clinical context</p>
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-sm">
                <div>
                  <label className={labelCls}><FileText className="w-3 h-3" /> Reason for Referral <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.reason}
                    onChange={e => update("reason", e.target.value)}
                    rows={3}
                    className={inputCls + " resize-none"}
                    placeholder="e.g. Chronic bilateral sinusitis, 6 months duration, failed 2 courses of antibiotics + nasal steroids"
                  />
                </div>
                <div>
                  <label className={labelCls}><AlertTriangle className="w-3 h-3" /> Urgency <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "routine", label: "Routine", desc: "Standard referral", color: "emerald" },
                      { value: "urgent", label: "Urgent", desc: "Within 1 week", color: "amber" },
                      { value: "emergency", label: "Emergency", desc: "Same day", color: "red" },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => update("urgency", opt.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          form.urgency === opt.value
                            ? opt.color === "emerald"
                              ? "border-[#3DA9D1] bg-[#3DA9D1] ring-1 ring-[#3DA9D1]"
                              : opt.color === "amber"
                              ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                              : "border-red-500 bg-red-50 ring-1 ring-red-500"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`text-xs font-semibold ${
                          form.urgency === opt.value
                            ? opt.color === "emerald" ? "text-[#1D3443]" : opt.color === "amber" ? "text-amber-700" : "text-red-700"
                            : "text-gray-700"
                        }`}>{opt.label}</div>
                        <div className={`text-[10px] mt-0.5 ${
                          form.urgency === opt.value
                            ? opt.color === "emerald" ? "text-[#3DA9D1]" : opt.color === "amber" ? "text-amber-500" : "text-red-500"
                            : "text-gray-400"
                        }`}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>ICD-10 Code (optional)</label>
                  <input value={form.icd10Code} onChange={e => update("icd10Code", e.target.value)} className={inputCls} placeholder="e.g. J32.9 — Chronic sinusitis" />
                </div>
                <div>
                  <label className={labelCls}>Clinical Notes / Medications / Investigations</label>
                  <textarea
                    value={form.clinicalNotes}
                    onChange={e => update("clinicalNotes", e.target.value)}
                    rows={3}
                    className={inputCls + " resize-none"}
                    placeholder="Current medications, relevant history, imaging results, allergies..."
                  />
                </div>
              </div>

              {/* Emergency warning */}
              {form.urgency === "emergency" && (
                <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Emergency Referral</p>
                    <p className="text-xs text-red-700 mt-1">
                      For life-threatening emergencies, please contact the practice directly or direct the patient to the nearest emergency department.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (!form.reason.trim()) { setError("Reason for referral is required"); return; }
                  setError(""); setStep("confirm");
                }}
                className="w-full mt-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1D3443] hover:bg-[#152736] transition-colors flex items-center justify-center gap-2"
              >
                Review Referral <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* GP Section */}
                <div className="p-5 border-b border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Referring Doctor</div>
                  <p className="text-sm font-semibold text-gray-900">{form.referringDoctor}</p>
                  {form.referringPractice && <p className="text-xs text-gray-500 mt-0.5">{form.referringPractice}</p>}
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                    {form.referringPhone && <span>{form.referringPhone}</span>}
                    {form.referringEmail && <span>{form.referringEmail}</span>}
                  </div>
                </div>
                {/* Patient Section */}
                <div className="p-5 border-b border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Patient</div>
                  <p className="text-sm font-semibold text-gray-900">{form.patientName}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                    {form.patientPhone && <span>{form.patientPhone}</span>}
                    {form.dateOfBirth && <span>DOB: {form.dateOfBirth}</span>}
                    {form.medicalAid && <span>{form.medicalAid}{form.medicalAidNo ? ` (${form.medicalAidNo})` : ""}</span>}
                  </div>
                </div>
                {/* Clinical Section */}
                <div className="p-5">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Referral Details</div>
                  <p className="text-sm text-gray-700">{form.reason}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      form.urgency === "emergency" ? "bg-red-100 text-red-700" :
                      form.urgency === "urgent" ? "bg-amber-100 text-amber-700" :
                      "bg-[#3DA9D1] text-[#1D3443]"
                    }`}>
                      {form.urgency.charAt(0).toUpperCase() + form.urgency.slice(1)}
                    </span>
                    {form.icd10Code && (
                      <span className="text-xs text-gray-400 font-mono">{form.icd10Code}</span>
                    )}
                  </div>
                  {form.clinicalNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">{form.clinicalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1D3443] hover:bg-[#152736] disabled:bg-[#3DA9D1] transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Referral"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                This referral is transmitted securely and processed in accordance with POPIA.
              </p>
            </motion.div>
          )}

          {/* Step 5: Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-[#3DA9D1] mx-auto mb-6 flex items-center justify-center"
              >
                <Check className="w-7 h-7 text-[#3DA9D1]" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Referral Submitted</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Thank you, {form.referringDoctor}. We have received your referral for {form.patientName} and will contact them to schedule an appointment.
              </p>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 max-w-xs mx-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Reference</span>
                  <span className="font-mono font-semibold text-gray-900">{referralId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Under Review
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Response</span>
                  <span className="text-gray-600">Within 24 hours</span>
                </div>
              </div>
              {form.referringEmail && (
                <p className="text-xs text-gray-400 mt-6">
                  A confirmation has been sent to {form.referringEmail}.<br />
                  We will send you a consultation report after the patient&apos;s visit.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center mt-8">
        <p className="text-xs text-gray-400">Powered by <span className="font-medium text-gray-500">Netcare Health OS</span></p>
      </footer>
    </div>
  );
}
