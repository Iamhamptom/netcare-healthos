"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, CheckCircle2, ArrowRight, Users, Receipt,
  Shield, Zap, Clock, BarChart3, Target, Rocket,
} from "lucide-react";

const REGIONS = [
  {
    name: "Gauteng North",
    clinics: ["Medicross Sandton City", "Medicross Fourways", "Medicross Rosebank", "Medicross Sunninghill", "Medicross Randburg"],
    patients: 18400,
    practitioners: 142,
    monthlyRevenue: "R8.8M",
  },
  {
    name: "Gauteng South",
    clinics: ["Medicross Soweto", "Medicross Vereeniging", "Medicross Vanderbijlpark", "Medicross Verwoerdpark"],
    patients: 12800,
    practitioners: 89,
    monthlyRevenue: "R5.2M",
  },
  {
    name: "Gauteng East",
    clinics: ["Medicross Pretoria East", "Medicross Pretoria North", "Medicross Die Hoewes", "Medicross Centurion"],
    patients: 11200,
    practitioners: 78,
    monthlyRevenue: "R4.8M",
  },
  {
    name: "Western Cape",
    clinics: ["Medicross Cape Town CBD", "Medicross Bellville", "Medicross Brackenfell", "Medicross Fish Hoek", "Medicross Kenilworth", "Medicross Table View"],
    patients: 16200,
    practitioners: 112,
    monthlyRevenue: "R7.4M",
  },
  {
    name: "KwaZulu-Natal",
    clinics: ["Medicross Umhlanga", "Medicross Pinetown", "Medicross Pietermaritzburg", "Medicross Richards Bay", "Medicross Margate"],
    patients: 9800,
    practitioners: 68,
    monthlyRevenue: "R4.1M",
  },
  {
    name: "National (Prime Cure Occ Health)",
    clinics: ["Prime Cure HQ — Sandton", "Mobile units — National"],
    patients: 8900,
    practitioners: 45,
    monthlyRevenue: "R3.2M",
  },
];

const PILOT_PHASES = [
  { phase: "Week 1-2", title: "Setup & Integration", items: ["Connect to clinic PMS (Healthbridge/GoodX)", "Import patient data (POPIA consent)", "Configure ICD-10-ZA + NAPPI validation rules", "Set up eRA reconciliation feeds", "Train 2-3 clinic admin staff"] },
  { phase: "Week 3-6", title: "Live Pilot", items: ["AI claims pre-validation active on all submissions", "WhatsApp patient routing live for pilot clinics", "Daily financial dashboard populated", "eRA auto-reconciliation running", "Weekly performance reports to FD"] },
  { phase: "Week 7-8", title: "Measure & Report", items: ["Calculate claims rejection rate reduction", "Measure debtor days improvement", "Quantify time saved on reconciliation", "Generate board-ready ROI report", "Plan regional expansion"] },
];

export default function PilotPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedClinics, setSelectedClinics] = useState<Set<string>>(new Set());
  const [pilotStarted, setPilotStarted] = useState(false);

  const region = REGIONS.find(r => r.name === selectedRegion);

  const toggleClinic = (clinic: string) => {
    setSelectedClinics(prev => {
      const next = new Set(prev);
      if (next.has(clinic)) next.delete(clinic);
      else next.add(clinic);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Rocket className="w-4 h-4 text-[#E3964C]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Regional Pilot Program</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Start Your Pilot
        </h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          Begin with one region, prove the ROI, then expand network-wide.
          Data is isolated per region — you control visibility and access.
          Pick your pilot region and select which clinics to include.
        </p>
      </div>

      {/* Pilot success metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Typical Pilot Duration", value: "8 weeks", icon: Clock, color: "#3DA9D1" },
          { label: "Expected Claims Improvement", value: "15% → <5%", icon: Receipt, color: "#10B981" },
          { label: "Expected ROI", value: "3.2X in 14 months", icon: Zap, color: "#E3964C" },
          { label: "Global Benchmark", value: "HCA, Mayo, Cleveland", icon: Target, color: "#8B5CF6" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <m.icon className="w-5 h-5 mx-auto mb-2" style={{ color: m.color }} />
            <div className="text-lg font-bold text-gray-900">{m.value}</div>
            <div className="text-[11px] text-gray-500">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {!pilotStarted ? (
        <>
          {/* Step 1: Select Region */}
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 mb-3">
              Step 1: Select Your Pilot Region
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {REGIONS.map((r) => (
                <button
                  key={r.name}
                  onClick={() => { setSelectedRegion(r.name); setSelectedClinics(new Set(r.clinics)); }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedRegion === r.name
                      ? "border-[#3DA9D1] bg-[#3DA9D1]/5 ring-1 ring-[#3DA9D1]/20"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#1D3443]" />
                    <span className="text-[13px] font-semibold text-gray-900">{r.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                    <span>{r.clinics.length} clinics</span>
                    <span>{r.practitioners} practitioners</span>
                    <span>{r.patients.toLocaleString()} patients</span>
                    <span>{r.monthlyRevenue}/month</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Clinics */}
          <AnimatePresence>
            {region && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-[15px] font-semibold text-gray-900 mb-3">
                  Step 2: Select Clinics in {region.name}
                </h2>
                <div className="space-y-2">
                  {region.clinics.map((clinic) => (
                    <button
                      key={clinic}
                      onClick={() => toggleClinic(clinic)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        selectedClinics.has(clinic)
                          ? "border-[#3DA9D1] bg-[#3DA9D1]/5"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${selectedClinics.has(clinic) ? "text-[#3DA9D1]" : "text-gray-300"}`} />
                      <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-[13px] font-medium text-gray-900">{clinic}</span>
                    </button>
                  ))}
                </div>

                {/* Step 3: Launch */}
                <div className="mt-6 p-5 rounded-xl border border-[#E3964C]/20 bg-[#E3964C]/5">
                  <h3 className="text-[14px] font-semibold text-gray-900 mb-2">Pilot Summary</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-[12px]">
                    <div>
                      <span className="text-gray-500">Region:</span>
                      <div className="font-semibold text-gray-900">{region.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Clinics:</span>
                      <div className="font-semibold text-gray-900">{selectedClinics.size} selected</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-semibold text-gray-900">8 weeks</div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 rounded-lg bg-white border border-gray-200">
                    <div className="text-[11px] text-[#E3964C] font-semibold uppercase mb-1">Projected Pilot Impact</div>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <span className="text-gray-600">Claims rejection reduction:</span>
                      <span className="font-semibold text-gray-900">15% to &lt;5% (-67%)</span>
                      <span className="text-gray-600">Monthly savings (pilot region):</span>
                      <span className="font-semibold text-[#E3964C]">~R{(parseFloat(region.monthlyRevenue.replace(/[^0-9.]/g, "")) * 0.08).toFixed(1)}M</span>
                      <span className="text-gray-600">Annualised (full network):</span>
                      <span className="font-semibold text-[#E3964C]">R100M+</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPilotStarted(true)}
                    className="w-full py-3 bg-[#1D3443] text-white font-semibold text-[14px] rounded-xl hover:bg-[#152736] transition-colors flex items-center justify-center gap-2"
                   
                  >
                    <Rocket className="w-4 h-4" />
                    Start 8-Week Pilot in {region.name}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    No commitment beyond pilot. Full ROI report generated at week 8.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Pilot Started Confirmation */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pilot Request Submitted
          </h2>
          <p className="text-[14px] text-gray-500 max-w-md mx-auto mb-6">
            Your {selectedClinics.size}-clinic pilot in {selectedRegion} has been submitted to the VisioHealth OS team.
            We will contact you within 24 hours to begin the 8-week implementation.
          </p>

          {/* 8-Week Timeline */}
          <div className="max-w-2xl mx-auto text-left">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Your 8-Week Pilot Roadmap</h3>
            <div className="space-y-4">
              {PILOT_PHASES.map((phase, i) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white"
                >
                  <div className="shrink-0">
                    <div className="w-16 text-center">
                      <div className="text-[11px] font-bold text-[#3DA9D1] uppercase">{phase.phase}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900 mb-2">{phase.title}</div>
                    <ul className="space-y-1">
                      {phase.items.map(item => (
                        <li key={item} className="text-[12px] text-gray-500 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-gray-300 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-[#1D3443]">
            <p className="text-[12px] text-white/60">
              At week 8, you will receive a board-ready ROI report showing exact savings, KPI improvements, and a recommended network-wide rollout plan.
              <span className="text-[#E3964C] font-semibold"> This is your business case for Keith Gibson.</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
