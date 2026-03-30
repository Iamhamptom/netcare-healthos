"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Stethoscope, FileText, Activity, Pill, AlertTriangle,
  CheckCircle2, Search, MessageSquare, Calendar, BarChart3,
  Zap, Heart, Brain, ChevronRight, ArrowRight
} from "lucide-react";

const PRODUCTS = [
  {
    id: "claims",
    name: "Claims Rejection Analyzer",
    icon: Shield,
    color: "#3DA9D1",
    tagline: "94-98% accuracy — catches what billing clerks miss",
    description: "Upload a CSV of claims. The AI validates every ICD-10 code against 41,009 SA codes, checks scheme-specific rules for Discovery/GEMS/Bonitas/Medshield/Momentum/Bestmed, flags unbundling violations, missing modifiers, gender/age mismatches, and PMB flags. Auto-fixes what it can. Shows you exactly what's wrong and how to fix the rest.",
    stats: [
      { label: "ICD-10 codes", value: "41,009" },
      { label: "NAPPI codes", value: "487,086" },
      { label: "Schemes profiled", value: "6" },
      { label: "Validation rules", value: "13 categories" },
    ],
    link: "/dashboard/claims",
    demo: "Upload any claims CSV → instant analysis. Try the batch analyzer.",
  },
  {
    id: "copilot",
    name: "Claims Copilot",
    icon: Brain,
    color: "#8B5CF6",
    tagline: "Ask anything about SA healthcare claims — instant expert answers",
    description: "A conversational AI trained on the Medical Schemes Act, 270 DTPs, 27 CDL conditions, all 6 major scheme rule sets, NAPPI codes, tariff codes, and SA coding standards. Ask it to validate a code, explain why a claim was rejected, code clinical notes into ICD-10, or compare how different schemes handle the same condition.",
    stats: [
      { label: "Knowledge sources", value: "120+" },
      { label: "Scheme profiles", value: "6 detailed" },
      { label: "PMB/CDL coverage", value: "27 conditions" },
      { label: "Response time", value: "<5 seconds" },
    ],
    link: "/dashboard/claims-copilot",
    demo: "Ask: 'What ICD-10 code for lobar pneumonia?' or 'Why would Discovery reject code J18?'",
  },
  {
    id: "bridge",
    name: "CareOn Bridge",
    icon: Activity,
    color: "#10B981",
    tagline: "HL7v2 → FHIR R4 translation — connects CareOn to modern systems",
    description: "CareOn sends HL7v2 messages. Our bridge translates them into FHIR R4 — the international interoperability standard mandated by SA's National Digital Health Strategy. Parses PID (patient demographics), DG1 (ICD-10 diagnoses), OBX (lab results with abnormal flags), and RXE (active medications with NAPPI codes). 99%+ translation accuracy.",
    stats: [
      { label: "HL7v2 segments", value: "PID, DG1, OBX, RXE" },
      { label: "FHIR version", value: "R4" },
      { label: "Translation accuracy", value: "99%+" },
      { label: "NHI ready", value: "Yes" },
    ],
    link: "/dashboard/bridge",
    demo: "See the bridge configuration, test with sample HL7v2 messages.",
  },
  {
    id: "switching",
    name: "Switching Engine",
    icon: Zap,
    color: "#F59E0B",
    tagline: "Intelligent claim routing — Healthbridge, MediSwitch, SwitchOn",
    description: "Routes each claim to the optimal switching house based on the patient's scheme. Checks pre-authorisation requirements across 9 procedure categories before submission. If a diagnosis qualifies as PMB, skips pre-auth entirely. Generates EDIFACT (UN/EDIFACT 0:912:ZA) formatted payloads. Monitors switch health and auto-reroutes if latency exceeds 800ms.",
    stats: [
      { label: "Switches supported", value: "3 (HB, MW, SO)" },
      { label: "Pre-auth categories", value: "9" },
      { label: "Output format", value: "EDIFACT ZA" },
      { label: "Failover", value: "Auto-reroute" },
    ],
    link: "/dashboard/switching",
    demo: "See how claims are routed to the right switch with pre-auth checks.",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Patient Router",
    icon: MessageSquare,
    color: "#25D366",
    tagline: "One number. 88 clinics. 24/7 AI booking.",
    description: "Patients message one WhatsApp number. The AI identifies what they need, finds the nearest Medicross with availability, and books instantly. Handles repeat scripts, appointment queries, emergency routing to 10177/082 911. Reduces phone call volume by 60%+ and no-shows by 40%. Pre-qualifies patients before they arrive.",
    stats: [
      { label: "Clinics covered", value: "88" },
      { label: "Available", value: "24/7" },
      { label: "Response time", value: "<10 seconds" },
      { label: "No-show reduction", value: "40%" },
    ],
    link: "/dashboard/whatsapp",
    demo: "See simulated patient conversations and routing logic.",
  },
  {
    id: "documents",
    name: "Document Generator",
    icon: FileText,
    color: "#EC4899",
    tagline: "Referral letters, prescriptions, sick notes — generated in seconds",
    description: "AI generates professional medical documents from consultation data. Referral letters with proper SA formatting, prescriptions with Rp. heading and dispensing instructions, HPCSA-compliant sick notes, SARAA biologics motivations pre-populated with DAS28 scores and DMARD history, and structured SOAP clinical notes from scribe transcriptions.",
    stats: [
      { label: "Document types", value: "5" },
      { label: "Generation time", value: "<10 seconds" },
      { label: "HPCSA compliant", value: "Yes" },
      { label: "SARAA format", value: "Pre-populated" },
    ],
    link: "/dashboard/documents",
    demo: "Generate a referral letter: enter patient name, diagnosis, ICD-10 code → instant letter.",
  },
  {
    id: "fhir",
    name: "FHIR Integration Hub",
    icon: Heart,
    color: "#EF4444",
    tagline: "Full FHIR R4 server — CareConnect HIE ready",
    description: "A complete FHIR R4 implementation that stores and serves Patient, Condition, Observation, and MedicationRequest resources. Connects to CareConnect HIE (SA's first cross-hospital health information exchange — co-founded by Netcare). Supports SMART on FHIR authentication. Ready for NHI interoperability requirements.",
    stats: [
      { label: "FHIR version", value: "R4" },
      { label: "Resource types", value: "4 core" },
      { label: "CareConnect ready", value: "Yes" },
      { label: "SMART on FHIR", value: "Supported" },
    ],
    link: "/dashboard/fhir-hub",
    demo: "Browse the FHIR API, test with sample resources.",
  },
];

const INTEGRATIONS = [
  { name: "CareOn EMR", status: "ready", detail: "HL7v2 → FHIR bridge built. Parses PID, DG1, OBX, RXE segments." },
  { name: "HEAL (A2D24)", status: "ready", detail: "REST API webhook integration. Post-encounter validation." },
  { name: "Healthbridge", status: "ready", detail: "EDIFACT MEDCLM v0-912-13.4 output. Pre-validated claims." },
  { name: "MediSwitch", status: "ready", detail: "Claims switching with real-time benefit checks." },
  { name: "SwitchOn", status: "ready", detail: "Altron switching house support with failover." },
  { name: "Discovery HealthID", status: "planned", detail: "Patient consent + electronic health record access." },
  { name: "Ampath / Lancet / PathCare", status: "planned", detail: "Lab result ingestion for clinical validation." },
  { name: "CareConnect HIE", status: "ready", detail: "FHIR R4 resources available for HIE exchange." },
];

export default function DrCathelijnPage() {
  const [expandedProduct, setExpandedProduct] = useState<string | null>("claims");

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-[#3DA9D1] font-semibold uppercase tracking-widest mb-2">
          <Stethoscope className="w-4 h-4" /> Product Deep Dive
        </div>
        <h1 className="text-2xl font-bold text-gray-900">The Complete Health OS Suite</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">
          Everything we&apos;ve built for Netcare Primary Care — from claims intelligence to patient engagement.
          Click any product to see the details, then try the live demo.
        </p>
      </div>

      {/* Products */}
      <div className="space-y-3">
        {PRODUCTS.map(product => {
          const Icon = product.icon;
          const isExpanded = expandedProduct === product.id;
          return (
            <motion.div key={product.id} layout
              className={`rounded-xl border transition-all ${
                isExpanded ? "border-gray-300 bg-white shadow-sm" : "border-gray-200 bg-gray-50 hover:bg-white"
              }`}>
              <button onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                className="w-full p-4 flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${product.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: product.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{product.tagline}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4 space-y-4">
                  <div className="pl-14">
                    <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {product.stats.map((stat, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                          <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                          <div className="text-[10px] text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Try it now</div>
                      <p className="text-xs text-blue-700">{product.demo}</p>
                    </div>

                    <a href={product.link} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ backgroundColor: product.color }}>
                      Open {product.name} <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Integration status */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INTEGRATIONS.map((intg, i) => (
            <div key={i} className={`p-3 rounded-xl border ${
              intg.status === "ready" ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {intg.status === "ready"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                }
                <span className="text-xs font-semibold text-gray-900">{intg.name}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">{intg.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#1D3443] to-[#2a4f63] text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Ready to see it with your data?</h3>
            <p className="text-xs text-white/70 mt-1">Upload a sample claims CSV or ask the AI assistant any question about SA healthcare claims.</p>
          </div>
          <div className="flex gap-2">
            <a href="/dashboard/claims" className="px-4 py-2 rounded-lg bg-[#3DA9D1] text-white text-xs font-semibold hover:bg-[#4dbde3] transition-colors">
              Upload Claims
            </a>
            <a href="/dashboard/claims-copilot" className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
              Ask Claims AI
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
