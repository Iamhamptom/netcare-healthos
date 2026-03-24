"use client";

import { useState } from "react";
import { Globe, FileText, Pill, Activity, TestTube, MapPin, Download, QrCode, Shield } from "lucide-react";

/* ── Cross-Border Patient Passport ── */

interface PatientPassport {
  id: string;
  name: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  medicalAid: string;
  memberNumber: string;
  primaryDiagnosis: string;
  icd10: string;
  diseaseOnset: string;
  currentDAS28: number;
  currentMedications: { drug: string; dose: string; frequency: string }[];
  allergies: string[];
  latestLabs: { test: string; value: string; date: string; flag?: string }[];
  treatmentHistory: { drug: string; period: string; outcome: string }[];
  consultationLocations: string[];
  emergencyContact: { name: string; phone: string; relation: string };
  lastUpdated: string;
}

const SAMPLE_PASSPORT: PatientPassport = {
  id: "RHEUM-001",
  name: "Ms Lindiwe Sibanda",
  dateOfBirth: "1988-05-14",
  nationality: "Eswatini",
  idNumber: "880514XXXX",
  medicalAid: "Bonitas Standard Option",
  memberNumber: "BON-884521-00",
  primaryDiagnosis: "Systemic Lupus Erythematosus with renal involvement",
  icd10: "M32.1",
  diseaseOnset: "2022-03",
  currentDAS28: 4.2,
  currentMedications: [
    { drug: "Hydroxychloroquine", dose: "400mg", frequency: "Daily" },
    { drug: "Azathioprine", dose: "100mg", frequency: "Daily" },
    { drug: "Prednisone", dose: "7.5mg", frequency: "Daily (tapering)" },
    { drug: "Calcium + Vitamin D", dose: "1000mg/800IU", frequency: "Daily" },
  ],
  allergies: ["Sulfonamides", "Ibuprofen (photosensitivity reaction)"],
  latestLabs: [
    { test: "ANA", value: "1:640 Homogeneous", date: "2026-01-10" },
    { test: "dsDNA", value: "Positive (120 IU/mL)", date: "2026-01-10", flag: "elevated" },
    { test: "C3 Complement", value: "0.42 g/L", date: "2026-01-10", flag: "low" },
    { test: "C4 Complement", value: "0.18 g/L", date: "2026-01-10" },
    { test: "Urine PCR", value: "0.08 g/mmol", date: "2026-01-10" },
    { test: "Creatinine", value: "68 umol/L", date: "2026-01-10" },
    { test: "eGFR", value: ">90 mL/min", date: "2026-01-10" },
    { test: "FBC WCC", value: "3.8 x10⁹/L", date: "2026-03-15", flag: "low" },
    { test: "Hb", value: "11.2 g/dL", date: "2026-03-15" },
    { test: "Platelets", value: "165 x10⁹/L", date: "2026-03-15" },
  ],
  treatmentHistory: [
    { drug: "Methotrexate 15mg/wk", period: "Mar 2023 — Aug 2023", outcome: "Discontinued — persistent nausea + hepatotoxicity (ALT 3x ULN)" },
    { drug: "Mycophenolate 2g/day", period: "Sep 2023 — Feb 2024", outcome: "Inadequate response — persistent proteinuria" },
    { drug: "Azathioprine 100mg/day", period: "Mar 2024 — present", outcome: "Maintained remission with HCQ + low-dose pred" },
  ],
  consultationLocations: ["Linamandla Medical Centre, Eswatini", "Wits Donald Gordon, Parktown", "Netcare Sunward Park, Boksburg"],
  emergencyContact: { name: "Mr S. Sibanda", phone: "+268 7612 3456", relation: "Husband" },
  lastUpdated: "2026-03-23",
};

export default function PatientPassportPage() {
  const p = SAMPLE_PASSPORT;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
            <Globe className="w-6 h-6 text-teal-600" />
            Patient Passport
          </h1>
          <p className="text-sm text-[#1D3443]/60 mt-1">
            Portable patient summary for cross-border care — Eswatini, Zimbabwe, South Africa
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="px-4 py-2 bg-white border border-[#1D3443]/10 text-[#1D3443] text-sm rounded-lg hover:bg-[#1D3443]/5 transition-colors flex items-center gap-2">
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-teal-200 mb-1">RheumCare Patient Passport</div>
            <h2 className="text-2xl font-bold">{p.name}</h2>
            <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-teal-100">
              <div>DOB: {p.dateOfBirth}</div>
              <div>Nationality: {p.nationality}</div>
              <div>Medical Aid: {p.medicalAid}</div>
              <div>Member: {p.memberNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-teal-200">Passport ID</div>
            <div className="font-mono text-lg font-bold">{p.id}</div>
            <div className="text-xs text-teal-200 mt-2">Updated: {p.lastUpdated}</div>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
        <h3 className="font-semibold text-[#1D3443] flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-teal-600" />
          Primary Diagnosis
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-medium text-[#1D3443]">{p.primaryDiagnosis}</div>
            <div className="text-sm text-[#1D3443]/60">ICD-10: <span className="font-mono">{p.icd10}</span> — Onset: {p.diseaseOnset}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#1D3443]/50">Current DAS28</div>
            <div className={`text-2xl font-bold ${p.currentDAS28 > 5.1 ? "text-red-600" : p.currentDAS28 > 3.2 ? "text-amber-600" : "text-emerald-600"}`}>
              {p.currentDAS28}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Medications */}
        <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
          <h3 className="font-semibold text-[#1D3443] flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-teal-600" />
            Current Medications
          </h3>
          <div className="space-y-2">
            {p.currentMedications.map(med => (
              <div key={med.drug} className="flex items-center justify-between p-2 bg-[#1D3443]/[0.02] rounded-lg">
                <div>
                  <div className="text-sm font-medium text-[#1D3443]">{med.drug}</div>
                  <div className="text-xs text-[#1D3443]/50">{med.dose} — {med.frequency}</div>
                </div>
              </div>
            ))}
          </div>
          {p.allergies.length > 0 && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-xs font-semibold text-red-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> ALLERGIES
              </div>
              {p.allergies.map(a => <div key={a} className="text-xs text-red-600 mt-0.5">- {a}</div>)}
            </div>
          )}
        </div>

        {/* Latest Labs */}
        <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
          <h3 className="font-semibold text-[#1D3443] flex items-center gap-2 mb-3">
            <TestTube className="w-5 h-5 text-teal-600" />
            Latest Laboratory Results
          </h3>
          <div className="space-y-1.5">
            {p.latestLabs.map(lab => (
              <div key={lab.test} className="flex items-center justify-between text-sm">
                <span className="text-[#1D3443]/70">{lab.test}</span>
                <span className={`font-mono text-xs ${lab.flag === "elevated" ? "text-red-600 font-bold" : lab.flag === "low" ? "text-amber-600 font-bold" : "text-[#1D3443]"}`}>
                  {lab.value}
                </span>
              </div>
            ))}
            <div className="text-[10px] text-[#1D3443]/40 pt-1 border-t border-[#1D3443]/5">
              Last updated: {p.latestLabs[0]?.date}
            </div>
          </div>
        </div>
      </div>

      {/* Treatment History */}
      <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
        <h3 className="font-semibold text-[#1D3443] flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-teal-600" />
          Treatment History
        </h3>
        <div className="space-y-3">
          {p.treatmentHistory.map((tx, i) => (
            <div key={i} className="flex gap-4 p-3 bg-[#1D3443]/[0.02] rounded-lg">
              <div className="min-w-[140px] text-xs font-mono text-[#1D3443]/50">{tx.period}</div>
              <div>
                <div className="text-sm font-medium text-[#1D3443]">{tx.drug}</div>
                <div className="text-xs text-[#1D3443]/60">{tx.outcome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Locations */}
      <div className="bg-white rounded-xl border border-[#1D3443]/10 p-5">
        <h3 className="font-semibold text-[#1D3443] flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-teal-600" />
          Consultation Locations
        </h3>
        <div className="flex flex-wrap gap-2">
          {p.consultationLocations.map(loc => (
            <span key={loc} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-200">
              {loc}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1D3443]/[0.03] rounded-xl p-4 text-center">
        <p className="text-xs text-[#1D3443]/40">
          This patient passport is generated by RheumCare Clinic Inc. POPIA compliant.
          For emergency use only — full records available via secure portal.
          Treating physician: <span className="font-medium">Dr Joyce Ziki — MBChB, FCP(SA), MMed, Cert Rheum</span>
        </p>
      </div>
    </div>
  );
}
