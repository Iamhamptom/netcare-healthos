"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Heart, Pill, FileText, Activity, Plus, Loader2,
  AlertTriangle, Trash2, Phone, Mail, MapPin, Shield,
} from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import Link from "next/link";

interface PatientFull {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  address: string;
  medicalAid: string;
  medicalAidNo: string;
  bloodType: string;
  emergencyName: string;
  emergencyPhone: string;
  notes: string;
  status: string;
  lastVisit: string | null;
  allergies: { id: string; name: string; severity: string; reaction: string }[];
  medications: { id: string; name: string; dosage: string; frequency: string; active: boolean; prescriber: string }[];
  medicalRecords: { id: string; type: string; title: string; description: string; diagnosis: string; treatment: string; provider: string; date: string }[];
  vitals: { id: string; bloodPressureSys: number | null; bloodPressureDia: number | null; heartRate: number | null; temperature: number | null; weight: number | null; oxygenSat: number | null; bloodGlucose: number | null; painLevel: number | null; recordedAt: string; recordedBy: string; notes: string }[];
}

type ModalType = "allergy" | "medication" | "record" | "vitals" | null;

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Forms
  const [allergyForm, setAllergyForm] = useState({ name: "", severity: "moderate", reaction: "" });
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", prescriber: "" });
  const [recordForm, setRecordForm] = useState({ type: "consultation", title: "", description: "", diagnosis: "", treatment: "", provider: "" });
  const [vitalsForm, setVitalsForm] = useState({ bloodPressureSys: "", bloodPressureDia: "", heartRate: "", temperature: "", weight: "", oxygenSat: "", bloodGlucose: "", painLevel: "", notes: "" });

  async function fetchPatient() {
    const res = await fetch(`/api/patients/${id}`);
    if (!res.ok) { router.replace("/dashboard/patients"); return; }
    const data = await res.json();
    setPatient(data.patient);
  }

  useEffect(() => { fetchPatient(); }, [id]);

  async function addAllergy(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/patients/${id}/allergies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(allergyForm) });
    setAllergyForm({ name: "", severity: "moderate", reaction: "" });
    setModal(null);
    await fetchPatient();
    setLoading(false);
  }

  async function deleteAllergy(allergyId: string) {
    await fetch(`/api/patients/${id}/allergies?allergyId=${allergyId}`, { method: "DELETE" });
    await fetchPatient();
  }

  async function addMedication(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/patients/${id}/medications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(medForm) });
    setMedForm({ name: "", dosage: "", frequency: "", prescriber: "" });
    setModal(null);
    await fetchPatient();
    setLoading(false);
  }

  async function toggleMedication(medId: string, active: boolean) {
    await fetch(`/api/patients/${id}/medications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ medicationId: medId, active: !active, endDate: active ? new Date().toISOString() : null }) });
    await fetchPatient();
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/patients/${id}/records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recordForm) });
    setRecordForm({ type: "consultation", title: "", description: "", diagnosis: "", treatment: "", provider: "" });
    setModal(null);
    await fetchPatient();
    setLoading(false);
  }

  async function addVitals(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(vitalsForm)) {
      if (v !== "") data[k] = k === "notes" ? v : Number(v);
    }
    await fetch(`/api/patients/${id}/vitals`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setVitalsForm({ bloodPressureSys: "", bloodPressureDia: "", heartRate: "", temperature: "", weight: "", oxygenSat: "", bloodGlucose: "", painLevel: "", notes: "" });
    setModal(null);
    await fetchPatient();
    setLoading(false);
  }

  if (!patient) return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "records", label: "Records", icon: FileText },
    { id: "vitals", label: "Vitals", icon: Activity },
  ];

  const severityColor: Record<string, string> = {
    mild: "bg-yellow-500/10 text-yellow-400",
    moderate: "bg-orange-500/10 text-orange-400",
    severe: "bg-red-500/10 text-red-400",
    "life-threatening": "bg-red-600/20 text-red-500",
  };

  const recordTypeColor: Record<string, string> = {
    consultation: "bg-blue-500/10 text-blue-400",
    procedure: "bg-purple-500/10 text-purple-400",
    lab_result: "bg-[#3DA9D1]/10 text-[#3DA9D1]",
    imaging: "bg-cyan-500/10 text-cyan-400",
    referral: "bg-orange-500/10 text-orange-400",
    note: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="p-2 rounded-lg hover:bg-[var(--charcoal)]/30 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{patient.name}</h2>
            {patient.bloodType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">{patient.bloodType}</span>}
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${patient.status === "active" ? "bg-[#3DA9D1]/10 text-[#3DA9D1]" : "bg-gray-500/10 text-gray-400"}`}>
              {patient.status}
            </span>
          </div>
          <div className="flex gap-4 mt-1 text-xs text-[var(--text-secondary)]">
            {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>}
            {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>}
            {patient.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{patient.address}</span>}
          </div>
        </div>
      </div>

      {/* Alert bar for allergies */}
      {patient.allergies.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-semibold text-red-400">ALLERGIES: </span>
            <span className="text-xs text-red-300">
              {patient.allergies.map(a => `${a.name} (${a.severity})`).join(" · ")}
            </span>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] pb-px">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-[var(--gold)] text-[var(--gold)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--ivory)]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal info */}
          <div className="glass-panel rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--ivory)] flex items-center gap-2"><User className="w-4 h-4 text-[var(--gold)]" /> Personal Info</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["Date of Birth", patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "—"],
                ["Gender", patient.gender || "—"],
                ["ID / Passport", patient.idNumber || "—"],
                ["Medical Aid", patient.medicalAid || "—"],
                ["Member No.", patient.medicalAidNo || "—"],
                ["Last Visit", patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[var(--text-tertiary)]">{label}</div>
                  <div className="text-[var(--ivory)] font-medium">{value}</div>
                </div>
              ))}
            </div>
            {patient.emergencyName && (
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Emergency Contact</div>
                <div className="text-xs text-[var(--ivory)]">{patient.emergencyName} — {patient.emergencyPhone}</div>
              </div>
            )}
            {patient.notes && (
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Notes</div>
                <div className="text-xs text-[var(--text-secondary)]">{patient.notes}</div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="glass-panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--ivory)] flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /> Allergies</h3>
              <button onClick={() => setModal("allergy")} className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {patient.allergies.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No known allergies</p>
            ) : (
              <div className="space-y-2">
                {patient.allergies.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--obsidian)]/40">
                    <div>
                      <span className="text-xs font-medium">{a.name}</span>
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${severityColor[a.severity]}`}>{a.severity}</span>
                      {a.reaction && <span className="ml-2 text-[10px] text-[var(--text-secondary)]">{a.reaction}</span>}
                    </div>
                    <button onClick={() => deleteAllergy(a.id)} className="p-1 text-[var(--text-tertiary)] hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="glass-panel rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--ivory)] flex items-center gap-2"><Pill className="w-4 h-4 text-[var(--teal)]" /> Medications</h3>
              <button onClick={() => setModal("medication")} className="text-xs text-[var(--gold)] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {patient.medications.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No medications recorded</p>
            ) : (
              <div className="space-y-2">
                {patient.medications.map(m => (
                  <div key={m.id} className={`flex items-center justify-between p-2 rounded-lg bg-[var(--obsidian)]/40 ${!m.active ? "opacity-50" : ""}`}>
                    <div>
                      <span className="text-xs font-medium">{m.name}</span>
                      {m.dosage && <span className="text-[10px] text-[var(--text-secondary)] ml-2">{m.dosage}</span>}
                      {m.frequency && <span className="text-[10px] text-[var(--text-tertiary)] ml-1">({m.frequency})</span>}
                    </div>
                    <button
                      onClick={() => toggleMedication(m.id, m.active)}
                      className={`text-[10px] px-2 py-1 rounded ${m.active ? "bg-[var(--teal)]/10 text-[var(--teal)]" : "bg-gray-500/10 text-gray-400"}`}
                    >
                      {m.active ? "Active" : "Stopped"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency info + medical aid */}
          <div className="glass-panel rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--ivory)] flex items-center gap-2"><Shield className="w-4 h-4 text-[var(--gold)]" /> Insurance & Emergency</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><div className="text-[var(--text-tertiary)]">Medical Aid</div><div className="text-[var(--ivory)] font-medium">{patient.medicalAid || "None"}</div></div>
              <div><div className="text-[var(--text-tertiary)]">Member No.</div><div className="text-[var(--ivory)] font-medium">{patient.medicalAidNo || "—"}</div></div>
              <div><div className="text-[var(--text-tertiary)]">Emergency Contact</div><div className="text-[var(--ivory)] font-medium">{patient.emergencyName || "—"}</div></div>
              <div><div className="text-[var(--text-tertiary)]">Emergency Phone</div><div className="text-[var(--ivory)] font-medium">{patient.emergencyPhone || "—"}</div></div>
            </div>
          </div>
        </div>
      )}

      {tab === "records" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal("record")} className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Record
            </button>
          </div>
          {patient.medicalRecords.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">No medical records yet</p>
          ) : (
            <div className="space-y-3">
              {patient.medicalRecords.map((rec, i) => (
                <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-[var(--charcoal)]/30 border border-[var(--border)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${recordTypeColor[rec.type] || "bg-gray-500/10 text-gray-400"}`}>
                          {rec.type.replace("_", " ")}
                        </span>
                        <span className="text-sm font-medium">{rec.title}</span>
                      </div>
                      {rec.description && <p className="text-xs text-[var(--text-secondary)] mt-1">{rec.description}</p>}
                      {rec.diagnosis && <p className="text-xs mt-1"><span className="text-[var(--text-tertiary)]">Dx:</span> <span className="text-orange-300">{rec.diagnosis}</span></p>}
                      {rec.treatment && <p className="text-xs mt-1"><span className="text-[var(--text-tertiary)]">Tx:</span> <span className="text-[var(--teal)]">{rec.treatment}</span></p>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-[var(--text-tertiary)]">{new Date(rec.date).toLocaleDateString()}</div>
                      {rec.provider && <div className="text-[10px] text-[var(--text-secondary)]">{rec.provider}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "vitals" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal("vitals")} className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Record Vitals
            </button>
          </div>
          {patient.vitals.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">No vitals recorded yet</p>
          ) : (
            <div className="space-y-3">
              {patient.vitals.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-[var(--charcoal)]/30 border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-[var(--text-secondary)]">
                      {new Date(v.recordedAt).toLocaleString()}
                      {v.recordedBy && <span className="ml-2 text-[var(--text-tertiary)]">by {v.recordedBy}</span>}
                    </div>
                    {v.painLevel !== null && v.painLevel > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${v.painLevel >= 7 ? "bg-red-500/10 text-red-400" : v.painLevel >= 4 ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        Pain: {v.painLevel}/10
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {v.bloodPressureSys && v.bloodPressureDia && (
                      <div><div className="text-[10px] text-[var(--text-tertiary)]">Blood Pressure</div><div className="text-sm font-medium">{v.bloodPressureSys}/{v.bloodPressureDia} <span className="text-[10px] text-[var(--text-tertiary)]">mmHg</span></div></div>
                    )}
                    {v.heartRate && <div><div className="text-[10px] text-[var(--text-tertiary)]">Heart Rate</div><div className="text-sm font-medium">{v.heartRate} <span className="text-[10px] text-[var(--text-tertiary)]">bpm</span></div></div>}
                    {v.temperature && <div><div className="text-[10px] text-[var(--text-tertiary)]">Temperature</div><div className="text-sm font-medium">{v.temperature} <span className="text-[10px] text-[var(--text-tertiary)]">°C</span></div></div>}
                    {v.oxygenSat && <div><div className="text-[10px] text-[var(--text-tertiary)]">SpO2</div><div className="text-sm font-medium">{v.oxygenSat}<span className="text-[10px] text-[var(--text-tertiary)]">%</span></div></div>}
                    {v.weight && <div><div className="text-[10px] text-[var(--text-tertiary)]">Weight</div><div className="text-sm font-medium">{v.weight} <span className="text-[10px] text-[var(--text-tertiary)]">kg</span></div></div>}
                    {v.bloodGlucose && <div><div className="text-[10px] text-[var(--text-tertiary)]">Glucose</div><div className="text-sm font-medium">{v.bloodGlucose} <span className="text-[10px] text-[var(--text-tertiary)]">mmol/L</span></div></div>}
                  </div>
                  {v.notes && <p className="text-xs text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--border)]">{v.notes}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === "allergy"} onClose={() => setModal(null)} title="Add Allergy">
        <form onSubmit={addAllergy} className="space-y-4">
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Allergen *</label><input type="text" required value={allergyForm.name} onChange={e => setAllergyForm({ ...allergyForm, name: e.target.value })} placeholder="e.g. Penicillin" className="input-glass" /></div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Severity</label>
            <select value={allergyForm.severity} onChange={e => setAllergyForm({ ...allergyForm, severity: e.target.value })} className="input-glass">
              <option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option><option value="life-threatening">Life-threatening</option>
            </select>
          </div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Reaction</label><input type="text" value={allergyForm.reaction} onChange={e => setAllergyForm({ ...allergyForm, reaction: e.target.value })} placeholder="e.g. Rash, Anaphylaxis" className="input-glass" /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add Allergy
          </button>
        </form>
      </Modal>

      <Modal open={modal === "medication"} onClose={() => setModal(null)} title="Add Medication">
        <form onSubmit={addMedication} className="space-y-4">
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Medication Name *</label><input type="text" required value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} placeholder="e.g. Metformin 500mg" className="input-glass" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Dosage</label><input type="text" value={medForm.dosage} onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} placeholder="e.g. 1 tablet" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Frequency</label><input type="text" value={medForm.frequency} onChange={e => setMedForm({ ...medForm, frequency: e.target.value })} placeholder="e.g. Twice daily" className="input-glass" /></div>
          </div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Prescriber</label><input type="text" value={medForm.prescriber} onChange={e => setMedForm({ ...medForm, prescriber: e.target.value })} className="input-glass" /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add Medication
          </button>
        </form>
      </Modal>

      <Modal open={modal === "record"} onClose={() => setModal(null)} title="Add Medical Record">
        <form onSubmit={addRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Type *</label>
              <select value={recordForm.type} onChange={e => setRecordForm({ ...recordForm, type: e.target.value })} className="input-glass">
                <option value="consultation">Consultation</option><option value="procedure">Procedure</option><option value="lab_result">Lab Result</option><option value="imaging">Imaging</option><option value="referral">Referral</option><option value="note">Note</option>
              </select>
            </div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Provider</label><input type="text" value={recordForm.provider} onChange={e => setRecordForm({ ...recordForm, provider: e.target.value })} className="input-glass" /></div>
          </div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Title *</label><input type="text" required value={recordForm.title} onChange={e => setRecordForm({ ...recordForm, title: e.target.value })} className="input-glass" /></div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label><textarea value={recordForm.description} onChange={e => setRecordForm({ ...recordForm, description: e.target.value })} rows={2} className="input-glass" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Diagnosis</label><input type="text" value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Treatment</label><input type="text" value={recordForm.treatment} onChange={e => setRecordForm({ ...recordForm, treatment: e.target.value })} className="input-glass" /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Add Record
          </button>
        </form>
      </Modal>

      <Modal open={modal === "vitals"} onClose={() => setModal(null)} title="Record Vitals">
        <form onSubmit={addVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">BP Systolic (mmHg)</label><input type="number" value={vitalsForm.bloodPressureSys} onChange={e => setVitalsForm({ ...vitalsForm, bloodPressureSys: e.target.value })} placeholder="120" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">BP Diastolic (mmHg)</label><input type="number" value={vitalsForm.bloodPressureDia} onChange={e => setVitalsForm({ ...vitalsForm, bloodPressureDia: e.target.value })} placeholder="80" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Heart Rate (bpm)</label><input type="number" value={vitalsForm.heartRate} onChange={e => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })} placeholder="72" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Temperature (°C)</label><input type="number" step="0.1" value={vitalsForm.temperature} onChange={e => setVitalsForm({ ...vitalsForm, temperature: e.target.value })} placeholder="36.5" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">SpO2 (%)</label><input type="number" value={vitalsForm.oxygenSat} onChange={e => setVitalsForm({ ...vitalsForm, oxygenSat: e.target.value })} placeholder="98" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Weight (kg)</label><input type="number" step="0.1" value={vitalsForm.weight} onChange={e => setVitalsForm({ ...vitalsForm, weight: e.target.value })} placeholder="70" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Glucose (mmol/L)</label><input type="number" step="0.1" value={vitalsForm.bloodGlucose} onChange={e => setVitalsForm({ ...vitalsForm, bloodGlucose: e.target.value })} placeholder="5.5" className="input-glass" /></div>
            <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Pain (0-10)</label><input type="number" min="0" max="10" value={vitalsForm.painLevel} onChange={e => setVitalsForm({ ...vitalsForm, painLevel: e.target.value })} placeholder="0" className="input-glass" /></div>
          </div>
          <div><label className="block text-sm text-[var(--text-secondary)] mb-1">Notes</label><input type="text" value={vitalsForm.notes} onChange={e => setVitalsForm({ ...vitalsForm, notes: e.target.value })} className="input-glass" /></div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--gold)] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Vitals
          </button>
        </form>
      </Modal>
    </div>
  );
}
