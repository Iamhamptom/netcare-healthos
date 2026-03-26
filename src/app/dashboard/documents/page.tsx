"use client";

import { useState } from "react";

const DOC_TYPES = [
  { id: "referral_letter", label: "Referral Letter", icon: "📨", desc: "Letter back to referring GP with diagnosis, plan, and follow-up" },
  { id: "prescription", label: "Prescription", icon: "💊", desc: "Formal Rp. with medications, dosing, and dispensing instructions" },
  { id: "sick_note", label: "Medical Certificate", icon: "📋", desc: "HPCSA-compliant sick note / fitness certificate" },
  { id: "saraa_motivation", label: "SARAA Biologics Motivation", icon: "🧬", desc: "Motivation to SARAA panel for biologic therapy approval" },
  { id: "clinical_notes", label: "Clinical Notes (SOAP)", icon: "📝", desc: "Structured consultation notes from scribe transcript" },
] as const;

type DocType = typeof DOC_TYPES[number]["id"];

interface Medication { name: string; dose: string; frequency: string; duration: string }
interface DmardHistory { drug: string; dose: string; duration: string; reason_stopped: string }

export default function DocumentsPage() {
  const [selectedType, setSelectedType] = useState<DocType>("referral_letter");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientDOB, setPatientDOB] = useState("");
  const [patientID, setPatientID] = useState("");
  const [patientGender, setPatientGender] = useState("female");
  const [medicalAid, setMedicalAid] = useState("");
  const [medicalAidNo, setMedicalAidNo] = useState("");
  const [referringDoctorName, setReferringDoctorName] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [das28Score, setDas28Score] = useState("");
  const [tenderJoints, setTenderJoints] = useState("");
  const [swollenJoints, setSwollenJoints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [icd10Code, setIcd10Code] = useState("");
  const [managementPlan, setManagementPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [scribeTranscript, setScribeTranscript] = useState("");
  const [medications, setMedications] = useState<Medication[]>([{ name: "", dose: "", frequency: "", duration: "" }]);

  // Sick note
  const [incapacityFrom, setIncapacityFrom] = useState("");
  const [incapacityTo, setIncapacityTo] = useState("");

  // SARAA
  const [dmardHistory, setDmardHistory] = useState<DmardHistory[]>([{ drug: "", dose: "", duration: "", reason_stopped: "" }]);
  const [tbScreening, setTbScreening] = useState("");
  const [hivStatus, setHivStatus] = useState("");
  const [hepBStatus, setHepBStatus] = useState("");
  const [proposedBiologic, setProposedBiologic] = useState("");

  const addMedication = () => setMedications([...medications, { name: "", dose: "", frequency: "", duration: "" }]);
  const updateMed = (i: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[i][field] = value;
    setMedications(updated);
  };

  const addDmard = () => setDmardHistory([...dmardHistory, { drug: "", dose: "", duration: "", reason_stopped: "" }]);
  const updateDmard = (i: number, field: keyof DmardHistory, value: string) => {
    const updated = [...dmardHistory];
    updated[i][field] = value;
    setDmardHistory(updated);
  };

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          data: {
            patientName, patientDOB, patientID, patientGender,
            medicalAid: medicalAid || "Private/Cash", medicalAidNo,
            referringDoctorName, chiefComplaint, examinationFindings,
            das28Score, das28Interpretation: getDAS28Interpretation(das28Score),
            tenderJointCount: tenderJoints, swollenJointCount: swollenJoints,
            diagnosis, icd10Code, managementPlan, followUpDate,
            medications: medications.filter(m => m.name),
            scribeTranscript,
            incapacityFrom, incapacityTo,
            dmardHistory: dmardHistory.filter(d => d.drug),
            tbScreening, hivStatus, hepBStatus, proposedBiologic,
          },
        }),
      });
      const data = await res.json();
      setResult(data.document || data.error || "Generation failed");
    } catch {
      setResult("Error generating document. Please try again.");
    }
    setGenerating(false);
  };

  const getDAS28Interpretation = (score: string): string => {
    const n = parseFloat(score);
    if (isNaN(n)) return "";
    if (n < 2.6) return "Remission";
    if (n <= 3.2) return "Low disease activity";
    if (n <= 5.1) return "Moderate disease activity";
    return "High disease activity";
  };

  const copyToClipboard = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Document Generator</h1>
        <p className="text-sm text-zinc-500 mt-1">Auto-generate clinical documents from consultation data</p>
      </div>

      {/* Document type selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {DOC_TYPES.map(dt => (
          <button
            key={dt.id}
            onClick={() => { setSelectedType(dt.id); setResult(null); }}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedType === dt.id
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
            }`}
          >
            <div className="text-xl mb-1">{dt.icon}</div>
            <div className="text-sm font-medium text-zinc-200">{dt.label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{dt.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="space-y-4">
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Patient Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Full Name</label><input className={inputClass} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Maria Santos" /></div>
              <div><label className={labelClass}>Date of Birth</label><input className={inputClass} type="date" value={patientDOB} onChange={e => setPatientDOB(e.target.value)} /></div>
              <div><label className={labelClass}>ID Number</label><input className={inputClass} value={patientID} onChange={e => setPatientID(e.target.value)} placeholder="SA ID or Passport" /></div>
              <div><label className={labelClass}>Gender</label><select className={inputClass} value={patientGender} onChange={e => setPatientGender(e.target.value)}><option value="female">Female</option><option value="male">Male</option></select></div>
              <div><label className={labelClass}>Medical Aid</label><input className={inputClass} value={medicalAid} onChange={e => setMedicalAid(e.target.value)} placeholder="Discovery / GEMS / Cash" /></div>
              <div><label className={labelClass}>Member No.</label><input className={inputClass} value={medicalAidNo} onChange={e => setMedicalAidNo(e.target.value)} placeholder="DH-445567" /></div>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Clinical Details</h3>
            <div className="space-y-3">
              {selectedType === "referral_letter" && (
                <div><label className={labelClass}>Referring Doctor</label><input className={inputClass} value={referringDoctorName} onChange={e => setReferringDoctorName(e.target.value)} placeholder="Dr. Smith" /></div>
              )}
              <div><label className={labelClass}>Chief Complaint</label><input className={inputClass} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="e.g. Bilateral hand joint pain and morning stiffness for 3 months" /></div>
              <div><label className={labelClass}>Examination Findings</label><textarea className={inputClass + " h-20"} value={examinationFindings} onChange={e => setExaminationFindings(e.target.value)} placeholder="e.g. Swelling of MCP 2,3 bilateral. Tender PIP 2,3,4 bilateral..." /></div>
              <div className="grid grid-cols-4 gap-2">
                <div><label className={labelClass}>DAS28</label><input className={inputClass} value={das28Score} onChange={e => setDas28Score(e.target.value)} placeholder="4.2" /></div>
                <div><label className={labelClass}>Tender /28</label><input className={inputClass} value={tenderJoints} onChange={e => setTenderJoints(e.target.value)} placeholder="8" /></div>
                <div><label className={labelClass}>Swollen /28</label><input className={inputClass} value={swollenJoints} onChange={e => setSwollenJoints(e.target.value)} placeholder="5" /></div>
                <div><label className={labelClass}>ESR/CRP</label><input className={inputClass} placeholder="ESR 42" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Diagnosis</label><input className={inputClass} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Seropositive Rheumatoid Arthritis" /></div>
                <div><label className={labelClass}>ICD-10 Code</label><input className={inputClass} value={icd10Code} onChange={e => setIcd10Code(e.target.value)} placeholder="M05.79" /></div>
              </div>
              <div><label className={labelClass}>Management Plan</label><textarea className={inputClass + " h-16"} value={managementPlan} onChange={e => setManagementPlan(e.target.value)} placeholder="Start Methotrexate 15mg weekly, Folic acid 5mg 6 days/week..." /></div>
              <div><label className={labelClass}>Follow-up Date</label><input className={inputClass} type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} /></div>
            </div>
          </div>

          {/* Medications section */}
          {(selectedType === "prescription" || selectedType === "referral_letter" || selectedType === "clinical_notes") && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-300">Medications</h3>
                <button onClick={addMedication} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
              </div>
              {medications.map((med, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input className={inputClass} value={med.name} onChange={e => updateMed(i, "name", e.target.value)} placeholder="Drug name" />
                  <input className={inputClass} value={med.dose} onChange={e => updateMed(i, "dose", e.target.value)} placeholder="15mg" />
                  <input className={inputClass} value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} placeholder="Weekly" />
                  <input className={inputClass} value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} placeholder="3 months" />
                </div>
              ))}
            </div>
          )}

          {/* Sick note fields */}
          {selectedType === "sick_note" && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Incapacity Period</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>From</label><input className={inputClass} type="date" value={incapacityFrom} onChange={e => setIncapacityFrom(e.target.value)} /></div>
                <div><label className={labelClass}>To</label><input className={inputClass} type="date" value={incapacityTo} onChange={e => setIncapacityTo(e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* SARAA fields */}
          {selectedType === "saraa_motivation" && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">SARAA Biologics Motivation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>DMARD History (failed therapies)</label>
                  <button onClick={addDmard} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
                </div>
                {dmardHistory.map((d, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input className={inputClass} value={d.drug} onChange={e => updateDmard(i, "drug", e.target.value)} placeholder="Methotrexate" />
                    <input className={inputClass} value={d.dose} onChange={e => updateDmard(i, "dose", e.target.value)} placeholder="25mg/week" />
                    <input className={inputClass} value={d.duration} onChange={e => updateDmard(i, "duration", e.target.value)} placeholder="6 months" />
                    <input className={inputClass} value={d.reason_stopped} onChange={e => updateDmard(i, "reason_stopped", e.target.value)} placeholder="Inadequate response" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelClass}>TB Screening</label><input className={inputClass} value={tbScreening} onChange={e => setTbScreening(e.target.value)} placeholder="QuantiFERON negative, CXR clear" /></div>
                  <div><label className={labelClass}>HIV Status</label><input className={inputClass} value={hivStatus} onChange={e => setHivStatus(e.target.value)} placeholder="Negative (tested 2026-03)" /></div>
                  <div><label className={labelClass}>Hep B (HBsAg)</label><input className={inputClass} value={hepBStatus} onChange={e => setHepBStatus(e.target.value)} placeholder="Negative" /></div>
                </div>
                <div><label className={labelClass}>Proposed Biologic Agent</label><input className={inputClass} value={proposedBiologic} onChange={e => setProposedBiologic(e.target.value)} placeholder="Adalimumab (Humira) 40mg SC fortnightly" /></div>
              </div>
            </div>
          )}

          {/* Scribe transcript (for clinical notes) */}
          {selectedType === "clinical_notes" && (
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Scribe Transcript (optional)</h3>
              <textarea className={inputClass + " h-32"} value={scribeTranscript} onChange={e => setScribeTranscript(e.target.value)} placeholder="Paste the AI scribe output or consultation transcript here. The AI will extract structured SOAP notes from it." />
            </div>
          )}

          <button onClick={generate} disabled={generating} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {generating ? "Generating..." : `Generate ${DOC_TYPES.find(d => d.id === selectedType)?.label}`}
          </button>
        </div>

        {/* Output panel */}
        <div>
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-300">Generated Document</h3>
              {result && (
                <button onClick={copyToClipboard} className="text-xs text-indigo-400 hover:text-indigo-300">Copy to clipboard</button>
              )}
            </div>
            {result ? (
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-zinc-300 leading-relaxed text-sm font-mono bg-black/30 rounded-lg p-4 max-h-[70vh] overflow-y-auto">
                {result}
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-600">
                <div className="text-4xl mb-3">{DOC_TYPES.find(d => d.id === selectedType)?.icon}</div>
                <p className="text-sm">Fill in the details and click Generate.</p>
                <p className="text-xs mt-1">The AI will produce a professional, SA-compliant document.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
