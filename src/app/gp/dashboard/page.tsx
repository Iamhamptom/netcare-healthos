"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  ArrowUpRight,
  Building2,
  Stethoscope,
  Plus,
  FileText,
  Loader2,
} from "lucide-react";

type Referral = {
  id: string;
  patientName: string;
  reason: string;
  urgency: string;
  status: string;
  createdAt: string;
  practiceId: string;
  feedbackSent: boolean;
  feedbackNote: string;
};

type Specialist = {
  id: string;
  name: string;
  type: string;
  address: string;
  subdomain: string;
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  accepted: { icon: CheckCircle2, color: "text-blue-500", label: "Accepted" },
  booked: { icon: CalendarCheck, color: "text-[#3DA9D1]", label: "Booked" },
  completed: { icon: CheckCircle2, color: "text-[#3DA9D1]", label: "Completed" },
  declined: { icon: XCircle, color: "text-red-500", label: "Declined" },
};

export default function GPDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>}>
      <GPDashboardContent />
    </Suspense>
  );
}

function GPDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "specialists" ? "specialists" : "referrals";
  const [tab, setTab] = useState<"referrals" | "specialists">(initialTab);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewReferral, setShowNewReferral] = useState(false);

  // Fetch referrals
  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await fetch("/api/gp/referrals");
        if (res.ok) {
          const data = await res.json();
          setReferrals(data.referrals || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  // Fetch specialists
  useEffect(() => {
    async function fetchSpecialists() {
      try {
        const url = typeFilter
          ? `/api/public/specialists?type=${typeFilter}`
          : "/api/public/specialists";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSpecialists(data.practices || []);
        }
      } catch {
        // silent
      }
    }
    fetchSpecialists();
  }, [typeFilter]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            GP Referral Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit and track referrals to specialist practices.
          </p>
        </div>
        <button
          onClick={() => setShowNewReferral(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Referral
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("referrals")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${
            tab === "referrals"
              ? "bg-white text-gray-900 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          My Referrals
        </button>
        <button
          onClick={() => setTab("specialists")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${
            tab === "specialists"
              ? "bg-white text-gray-900 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Find Specialists
        </button>
      </div>

      {/* Referrals tab */}
      {tab === "referrals" && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : referrals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-2xl border border-gray-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#3DA9D1] flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-[#3DA9D1]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Submit your first digital referral to a specialist practice on the Netcare Health OS network.
              </p>
              <button
                onClick={() => setShowNewReferral(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit First Referral
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {referrals.map((ref, i) => {
                const status = statusConfig[ref.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {ref.patientName}
                          </h3>
                          <div className={`flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-mono">{status.label}</span>
                          </div>
                          {ref.urgency === "urgent" && (
                            <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{ref.reason}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          Submitted {new Date(ref.createdAt).toLocaleDateString("en-ZA")}
                        </p>
                      </div>
                      {ref.feedbackSent && ref.feedbackNote && (
                        <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3 max-w-xs">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#3DA9D1] mb-1">
                            Specialist Feedback
                          </p>
                          <p className="text-xs text-[#152736]">{ref.feedbackNote}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Specialists tab */}
      {tab === "specialists" && (
        <div>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["", "ent", "dental", "gp", "oncology", "radiology", "orthopaedics", "ophthalmology"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    typeFilter === type
                      ? "bg-[#3DA9D1] border-[#3DA9D1] text-[#1D3443]"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {type === "" ? "All Specialties" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>

          {specialists.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No specialist practices found{typeFilter ? ` for "${typeFilter}"` : ""}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialists.map((spec, i) => (
                <motion.div
                  key={spec.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm hover:border-[#3DA9D1] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#3DA9D1] flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-[#3DA9D1]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{spec.name}</h3>
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-mono text-[#3DA9D1]">{spec.type}</span>
                        {spec.address && ` \u2014 ${spec.address}`}
                      </p>
                      {spec.subdomain && (
                        <p className="text-[11px] text-gray-400 font-mono">
                          {spec.subdomain}.healthops.co.za
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNewReferral(true)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs text-[#3DA9D1] hover:text-[#1D3443] hover:bg-[#3DA9D1] rounded-lg transition-colors"
                    >
                      Refer
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upgrade banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 bg-gradient-to-r from-[#3DA9D1] to-teal-50 rounded-2xl border border-[#3DA9D1] p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Ready to manage your own practice on Netcare Health OS?
          </h3>
          <p className="text-xs text-gray-500">
            Upgrade to a paid plan for booking, billing, WhatsApp AI, and full practice management.
          </p>
        </div>
        <a
          href="/#pricing"
          className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-[#3DA9D1] text-white text-sm font-medium rounded-xl hover:bg-[#1D3443] transition-colors"
        >
          View Plans
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </motion.div>

      {/* New referral modal */}
      {showNewReferral && (
        <NewReferralModal onClose={() => setShowNewReferral(false)} onSubmit={(r) => {
          setReferrals(prev => [r, ...prev]);
          setShowNewReferral(false);
        }} />
      )}
    </div>
  );
}

function NewReferralModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (r: Referral) => void;
}) {
  const [form, setForm] = useState({
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
    practiceId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    fetch("/api/public/specialists")
      .then((r) => r.json())
      .then((d) => setSpecialists(d.practices || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/gp/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSubmit(data.referral);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit referral");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Submit Referral">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Submit Referral</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
              Refer To (Specialist Practice)
            </label>
            <select
              value={form.practiceId}
              onChange={(e) => setForm({ ...form, practiceId: e.target.value })}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
            >
              <option value="">Select a specialist practice</option>
              {specialists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                Patient Name
              </label>
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="Patient full name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                Patient Phone
              </label>
              <input
                type="tel"
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="082 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                Medical Aid
              </label>
              <input
                type="text"
                value={form.medicalAid}
                onChange={(e) => setForm({ ...form, medicalAid: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="e.g. Discovery"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                Medical Aid No.
              </label>
              <input
                type="text"
                value={form.medicalAidNo}
                onChange={(e) => setForm({ ...form, medicalAidNo: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="Membership number"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
              Reason for Referral
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all resize-none"
              placeholder="e.g. Chronic sinusitis — 6 months, failed medical management"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                ICD-10 Code
              </label>
              <input
                type="text"
                value={form.icd10Code}
                onChange={(e) => setForm({ ...form, icd10Code: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="e.g. J32.9"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
                Urgency
              </label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-1.5">
              Clinical Notes (optional)
            </label>
            <textarea
              value={form.clinicalNotes}
              onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all resize-none"
              placeholder="Current medications, previous treatments, imaging done, etc."
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 mt-2 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#1D3443] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#3DA9D1]/20"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Submit Referral
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
