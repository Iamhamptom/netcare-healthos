"use client";

import { useState } from "react";
import { Pill, FileText, Clock, CheckCircle, AlertTriangle, Send, Shield } from "lucide-react";

/* ── Biologic Drug Registry (SA-approved for rheumatology) ── */

interface BiologicDrug {
  name: string;
  genericName: string;
  class: string;
  nappiCode: string;
  icd10Codes: string[];
  infusionDuration: string;
  frequency: string;
  preAuthRequirements: string[];
  saraaMotivation: boolean;
  estimatedCost: string;
  monitoringRequired: string[];
}

const BIOLOGICS: BiologicDrug[] = [
  {
    name: "MabThera / Rituxan",
    genericName: "Rituximab",
    class: "Anti-CD20",
    nappiCode: "717355001",
    icd10Codes: ["M05.8", "M06.0", "M31.3", "M31.1"],
    infusionDuration: "4-6 hours (first), 3-4 hours (subsequent)",
    frequency: "2x 1000mg infusions, 2 weeks apart, every 6 months",
    preAuthRequirements: [
      "Failed 2 DMARDs including Methotrexate at adequate dose (15-25mg/week) for ≥3 months each",
      "DAS28-ESR > 5.1 (or > 3.2 if prior biologic failure)",
      "Current DAS28 score documented within 4 weeks",
      "TB screening (QuantiFERON Gold or Mantoux) within 6 months",
      "Hepatitis B surface antigen + anti-HBc within 12 months",
      "SARAA motivation letter from treating rheumatologist",
      "CD4 count or immunoglobulin levels (IgG, IgM) at baseline",
    ],
    saraaMotivation: true,
    estimatedCost: "R25,000 - R35,000 per infusion cycle",
    monitoringRequired: ["FBC before each cycle", "Immunoglobulins every 6 months", "Hepatitis B monitoring if anti-HBc positive"],
  },
  {
    name: "Actemra",
    genericName: "Tocilizumab",
    class: "Anti-IL-6R",
    nappiCode: "715812001",
    icd10Codes: ["M05.8", "M06.0", "M08.0"],
    infusionDuration: "1 hour",
    frequency: "8mg/kg IV every 4 weeks (or 162mg SC weekly)",
    preAuthRequirements: [
      "Failed ≥1 DMARD including Methotrexate at adequate dose for ≥3 months",
      "DAS28-ESR > 3.2",
      "TB screening within 6 months",
      "LFTs (ALT/AST) within 4 weeks — must be < 3x ULN",
      "Fasting lipid panel at baseline",
      "Neutrophil count > 2.0 x 10⁹/L, Platelets > 100 x 10⁹/L",
    ],
    saraaMotivation: true,
    estimatedCost: "R8,000 - R15,000 per infusion",
    monitoringRequired: ["LFTs every 4-8 weeks for first 6 months", "Lipid panel at 4-8 weeks", "FBC + neutrophils every 4-8 weeks"],
  },
  {
    name: "Revellex",
    genericName: "Infliximab (biosimilar)",
    class: "Anti-TNFα",
    nappiCode: "719742001",
    icd10Codes: ["M05.8", "M06.0", "M45", "M07.3", "L40.5"],
    infusionDuration: "2-3 hours",
    frequency: "3-5mg/kg IV at weeks 0, 2, 6, then every 8 weeks",
    preAuthRequirements: [
      "Failed ≥2 DMARDs including Methotrexate for ≥3 months each",
      "DAS28-ESR > 5.1 (RA) or BASDAI > 4.0 (AS)",
      "TB screening within 6 months (active TB excluded)",
      "Chest X-ray within 12 months",
      "Hepatitis B + C screening",
      "No history of demyelinating disease or heart failure NYHA III/IV",
    ],
    saraaMotivation: true,
    estimatedCost: "R6,000 - R12,000 per infusion",
    monitoringRequired: ["TB screening annually", "FBC every 3 months", "LFTs every 3 months", "ANA if new symptoms suggest lupus-like syndrome"],
  },
  {
    name: "Humira / Hadlima",
    genericName: "Adalimumab",
    class: "Anti-TNFα",
    nappiCode: "714488001",
    icd10Codes: ["M05.8", "M06.0", "M45", "M07.3", "L40.5"],
    infusionDuration: "Self-inject (subcutaneous)",
    frequency: "40mg SC every 2 weeks",
    preAuthRequirements: [
      "Failed ≥2 DMARDs for ≥3 months each",
      "DAS28-ESR > 5.1 or BASDAI > 4.0",
      "TB screening within 6 months",
      "Hepatitis B + C screening",
      "Patient training on self-injection technique",
    ],
    saraaMotivation: true,
    estimatedCost: "R4,500 - R7,000 per injection",
    monitoringRequired: ["TB screening annually", "FBC + LFTs every 3 months", "Injection site monitoring"],
  },
];

/* ── Pre-Auth Status Types ── */

type PreAuthStatus = "draft" | "pending_saraa" | "pending_scheme" | "approved" | "denied" | "expired";

interface PreAuthRequest {
  id: string;
  patientName: string;
  drug: string;
  scheme: string;
  status: PreAuthStatus;
  submittedDate: string;
  das28Score: number;
  icd10: string;
}

const MOCK_REQUESTS: PreAuthRequest[] = [
  { id: "PA-001", patientName: "Mrs N. Mokoena", drug: "Rituximab", scheme: "Discovery Classic", status: "pending_scheme", submittedDate: "2026-03-20", das28Score: 5.8, icd10: "M05.8" },
  { id: "PA-002", patientName: "Mr T. Dlamini", drug: "Tocilizumab", scheme: "GEMS Emerald", status: "approved", submittedDate: "2026-03-15", das28Score: 4.2, icd10: "M06.0" },
  { id: "PA-003", patientName: "Ms L. Sibanda", drug: "Infliximab", scheme: "Bonitas Standard", status: "pending_saraa", submittedDate: "2026-03-22", das28Score: 6.1, icd10: "M45" },
  { id: "PA-004", patientName: "Mrs J. van der Merwe", drug: "Adalimumab", scheme: "Momentum Ingwe", status: "draft", submittedDate: "", das28Score: 5.3, icd10: "L40.5" },
];

const statusConfig: Record<PreAuthStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
  pending_saraa: { label: "Pending SARAA", color: "bg-purple-100 text-purple-700", icon: Clock },
  pending_scheme: { label: "Pending Scheme", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  denied: { label: "Denied", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-500", icon: Clock },
};

export default function BiologicsPage() {
  const [selectedDrug, setSelectedDrug] = useState<BiologicDrug | null>(null);
  const [tab, setTab] = useState<"tracker" | "drugs" | "motivate">("tracker");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
          <Pill className="w-6 h-6 text-teal-600" />
          Biologic Pre-Authorisation
        </h1>
        <p className="text-sm text-[#1D3443]/60 mt-1">
          Manage biologic motivations, SARAA submissions, and scheme pre-authorisations
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-[#1D3443]/5 rounded-lg p-1 w-fit">
        {[
          { key: "tracker" as const, label: "Pre-Auth Tracker" },
          { key: "drugs" as const, label: "Drug Registry" },
          { key: "motivate" as const, label: "Generate Motivation" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-teal-700 shadow-sm" : "text-[#1D3443]/60 hover:text-[#1D3443]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tracker" && (
        <div className="bg-white rounded-xl border border-[#1D3443]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1D3443]/5 flex items-center justify-between">
            <h2 className="font-semibold text-[#1D3443]">Active Pre-Authorisation Requests</h2>
            <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" /> New Request
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-[#1D3443]/[0.03]">
              <tr className="text-left text-xs text-[#1D3443]/50 uppercase tracking-wider">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Drug</th>
                <th className="px-6 py-3">Scheme</th>
                <th className="px-6 py-3">DAS28</th>
                <th className="px-6 py-3">ICD-10</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D3443]/5">
              {MOCK_REQUESTS.map(req => {
                const st = statusConfig[req.status];
                const StIcon = st.icon;
                return (
                  <tr key={req.id} className="hover:bg-[#1D3443]/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-teal-600">{req.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1D3443]">{req.patientName}</td>
                    <td className="px-6 py-4 text-sm text-[#1D3443]/70">{req.drug}</td>
                    <td className="px-6 py-4 text-sm text-[#1D3443]/70">{req.scheme}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-bold ${req.das28Score > 5.1 ? "text-red-600" : req.das28Score > 3.2 ? "text-amber-600" : "text-emerald-600"}`}>
                        {req.das28Score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-[#1D3443]/60">{req.icd10}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                        <StIcon className="w-3.5 h-3.5" />
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "drugs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BIOLOGICS.map(drug => (
            <div
              key={drug.name}
              onClick={() => setSelectedDrug(selectedDrug?.name === drug.name ? null : drug)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${selectedDrug?.name === drug.name ? "border-teal-500 ring-2 ring-teal-500/20" : "border-[#1D3443]/10 hover:border-teal-300"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#1D3443]">{drug.name}</h3>
                  <p className="text-sm text-[#1D3443]/60">{drug.genericName} — {drug.class}</p>
                </div>
                {drug.saraaMotivation && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">SARAA</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#1D3443]/60">
                <div><span className="font-medium">Frequency:</span> {drug.frequency}</div>
                <div><span className="font-medium">Duration:</span> {drug.infusionDuration}</div>
                <div><span className="font-medium">Cost:</span> {drug.estimatedCost}</div>
                <div><span className="font-medium">NAPPI:</span> <span className="font-mono">{drug.nappiCode}</span></div>
              </div>

              {selectedDrug?.name === drug.name && (
                <div className="mt-4 pt-4 border-t border-[#1D3443]/10 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1D3443]/70 uppercase mb-1">Pre-Auth Requirements</h4>
                    <ul className="text-xs text-[#1D3443]/60 space-y-1">
                      {drug.preAuthRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Shield className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1D3443]/70 uppercase mb-1">ICD-10 Codes</h4>
                    <div className="flex flex-wrap gap-1">
                      {drug.icd10Codes.map(code => (
                        <span key={code} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-mono rounded">{code}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#1D3443]/70 uppercase mb-1">Monitoring Required</h4>
                    <ul className="text-xs text-[#1D3443]/60 space-y-0.5">
                      {drug.monitoringRequired.map((m, i) => <li key={i}>- {m}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "motivate" && (
        <div className="bg-white rounded-xl border border-[#1D3443]/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="font-semibold text-[#1D3443]">SARAA Motivation Generator</h2>
              <p className="text-sm text-[#1D3443]/60">Auto-generate motivation letters for biologic pre-authorisation</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Patient Name</label>
                <input type="text" placeholder="e.g., Mrs N. Mokoena" className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Diagnosis (ICD-10)</label>
                <select className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                  <option value="">Select diagnosis...</option>
                  <option value="M05.8">M05.8 — Seropositive RA</option>
                  <option value="M06.0">M06.0 — Seronegative RA</option>
                  <option value="M45">M45 — Ankylosing Spondylitis</option>
                  <option value="M07.3">M07.3 — Psoriatic Arthritis</option>
                  <option value="L40.5">L40.5 — Arthropathic Psoriasis</option>
                  <option value="M31.3">M31.3 — Granulomatosis with Polyangiitis</option>
                  <option value="M32.1">M32.1 — SLE with Organ Involvement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Biologic Requested</label>
                <select className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                  <option value="">Select drug...</option>
                  {BIOLOGICS.map(d => <option key={d.genericName} value={d.genericName}>{d.name} ({d.genericName})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Current DAS28-ESR Score</label>
                <input type="number" step="0.01" placeholder="e.g., 5.8" className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Medical Aid Scheme</label>
                <input type="text" placeholder="e.g., Discovery Classic Comprehensive" className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D3443]/70 mb-1">Previous DMARDs Failed</label>
                <textarea placeholder="e.g., Methotrexate 20mg/week x 6 months — inadequate response. Leflunomide 20mg/day x 4 months — adverse effects (hepatotoxicity)." rows={3} className="w-full rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
            </div>
            <div className="bg-[#1D3443]/[0.03] rounded-lg p-4 text-sm text-[#1D3443]/60">
              <h3 className="font-semibold text-[#1D3443] mb-2">Motivation Preview</h3>
              <p className="text-xs italic">Fill in the form to generate a SARAA-compliant motivation letter. The AI will structure the letter according to SARAA requirements including:</p>
              <ul className="text-xs mt-2 space-y-1">
                <li>- Patient demographics and medical aid details</li>
                <li>- Diagnosis with ICD-10 code and disease duration</li>
                <li>- DMARD treatment history with dates and outcomes</li>
                <li>- Current disease activity (DAS28/CDAI scores)</li>
                <li>- Clinical justification for biologic therapy</li>
                <li>- Requested drug, dose, and treatment plan</li>
                <li>- Specialist signature block (Dr J. Ziki, FCP(SA), Cert Rheum)</li>
              </ul>
              <button className="mt-4 w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Generate Motivation Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
