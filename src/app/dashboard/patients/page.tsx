"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Search, Loader2, Phone, Mail, AlertTriangle, Trash2, Eye } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  medicalAid: string;
  bloodType: string;
  status: string;
  lastVisit: string | null;
  allergies?: { id: string; name: string; severity: string }[];
  medications?: { id: string; name: string; active: boolean }[];
}

const emptyForm = {
  name: "", phone: "", email: "", dateOfBirth: "", gender: "",
  address: "", medicalAid: "", medicalAidNo: "", bloodType: "",
  emergencyName: "", emergencyPhone: "", idNumber: "",
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function fetchPatients() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter && filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/patients?${params}`);
    const data = await res.json();
    setPatients(data.patients || []);
  }

  useEffect(() => { fetchPatients().catch(() => setError("Unable to load data. Check your connection.")).finally(() => setInitialLoading(false)); }, [filter]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await fetchPatients();
  }

  async function createPatient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save. Please try again.");
        setLoading(false);
        return;
      }
      setForm(emptyForm);
      setModalOpen(false);
      await fetchPatients();
    } catch {
      setError("Failed to save. Please try again.");
    }
    setLoading(false);
  }

  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);

  async function executeDeletePatient(id: string) {
    await fetch(`/api/patients/${id}`, { method: "DELETE" });
    await fetchPatients();
  }

  const severityColor: Record<string, string> = {
    mild: "text-yellow-400",
    moderate: "text-orange-400",
    severe: "text-red-400",
    "life-threatening": "text-red-600",
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--teal)]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[var(--teal)]" />
          <h2 className="text-lg font-semibold">Patients</h2>
          <span className="text-xs text-[var(--text-secondary)]">({patients.length})</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--charcoal)]/20 border border-[var(--border)] rounded-lg text-sm text-[var(--ivory)] focus:outline-none focus:border-[var(--gold)]/40"
          />
        </form>
        <div className="flex gap-1">
          {["active", "inactive", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-[var(--text-secondary)] hover:text-[var(--ivory)]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patient list */}
      {patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="Add your first patient or adjust your search" />
      ) : (
        <div className="space-y-2">
          {patients.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-xl bg-[var(--charcoal)]/30 border border-[var(--border)] hover:border-[var(--gold)]/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--teal)]/10 flex items-center justify-center text-[11px] font-semibold text-[var(--teal)] shrink-0">
                    {patient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{patient.name}</span>
                      {patient.bloodType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">{patient.bloodType}</span>
                      )}
                      {patient.allergies && patient.allergies.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">
                          <AlertTriangle className="w-3 h-3" />
                          {patient.allergies.length} {patient.allergies.length === 1 ? "allergy" : "allergies"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-secondary)]">
                      {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>}
                      {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>}
                      {patient.medicalAid && <span>{patient.medicalAid}</span>}
                      {patient.lastVisit && <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>}
                    </div>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="flex gap-2 mt-1.5">
                        {patient.allergies.map(a => (
                          <span key={a.id} className={`text-[10px] ${severityColor[a.severity] || "text-orange-400"}`}>
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[var(--gold)]/10 text-[var(--gold)] rounded-lg hover:bg-[var(--gold)]/20"
                  >
                    <Eye className="w-3 h-3" /> View
                  </Link>
                  <button aria-label="Delete patient" onClick={() => setConfirmAction({ type: "delete", id: patient.id })} className="p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Confirm deletion">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
            <p className="text-[13px] text-gray-500 mt-2">This will permanently delete this patient and all their records. This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => { executeDeletePatient(confirmAction.id); setConfirmAction(null); }} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Patient">
        <form onSubmit={createPatient} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Full Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone *</label>
              <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27 82 000 0000" className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-glass">
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">ID / Passport</label>
              <input type="text" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Blood Type</label>
              <select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="input-glass">
                <option value="">—</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Medical Aid</label>
              <input type="text" value={form.medicalAid} onChange={(e) => setForm({ ...form, medicalAid: e.target.value })} placeholder="e.g. Discovery Health" className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Medical Aid No.</label>
              <input type="text" value={form.medicalAidNo} onChange={(e) => setForm({ ...form, medicalAidNo: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Emergency Contact</label>
              <input type="text" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Emergency Phone</label>
              <input type="text" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} className="input-glass" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--gold)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Patient
          </button>
        </form>
      </Modal>
    </div>
  );
}
