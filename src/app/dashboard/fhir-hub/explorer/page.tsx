"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TestTube, ChevronLeft, Play, FileJson, Check, AlertCircle,
  Loader2, Copy, ArrowRight,
} from "lucide-react";

const SAMPLE_PATIENT = JSON.stringify({
  resourceType: "Patient",
  name: [{ use: "official", family: "Nkosi", given: ["Sipho"] }],
  gender: "male",
  birthDate: "1985-07-15",
  identifier: [
    { system: "http://health.gov.za/id/said", value: "8507155123087" },
    { system: "http://health.gov.za/id/medical-aid-member", value: "MA123456" },
  ],
  telecom: [
    { system: "phone", value: "+27601234567", use: "mobile" },
    { system: "email", value: "sipho.nkosi@example.co.za" },
  ],
  address: [{ line: ["42 Nelson Mandela Drive"], city: "Johannesburg", state: "Gauteng", postalCode: "2001", country: "ZA" }],
}, null, 2);

const SAMPLE_OBSERVATION = JSON.stringify({
  resourceType: "Observation",
  status: "final",
  category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
  code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood Pressure" }] },
  subject: { reference: "Patient/example-id" },
  effectiveDateTime: "2026-03-20T10:30:00+02:00",
  component: [
    { code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic" }] }, valueQuantity: { value: 132, unit: "mmHg" } },
    { code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic" }] }, valueQuantity: { value: 85, unit: "mmHg" } },
  ],
}, null, 2);

const SAMPLE_HL7 = `MSH|^~\\&|CAREON|NETCARE_MILPARK|HEALTHOPS|VISIO|20260320120000||ADT^A01|MSG00001|P|2.3
EVN|A01|20260320120000
PID|1||12345^^^NETCARE_MRN||NKOSI^SIPHO^A||19850715|M|||42 Nelson Mandela Dr^^Johannesburg^^2001^ZA|||||||8507155123087
PV1|1|I|ICU^001^01||||5678^VAN_DER_MERWE^JANA^DR`;

const ENDPOINTS = [
  { method: "GET", path: "/api/fhir/metadata", desc: "Capability Statement", auth: "Public" },
  { method: "GET", path: "/api/fhir/Patient", desc: "Search patients", auth: "Session / SMART / API Key" },
  { method: "POST", path: "/api/fhir/Patient", desc: "Create patient", auth: "Session / SMART / API Key" },
  { method: "GET", path: "/api/fhir/Patient/{id}", desc: "Read patient", auth: "Session / SMART / API Key" },
  { method: "PUT", path: "/api/fhir/Patient/{id}", desc: "Update patient", auth: "Session / SMART / API Key" },
  { method: "DELETE", path: "/api/fhir/Patient/{id}", desc: "Delete patient", auth: "Session / SMART / API Key" },
  { method: "GET", path: "/api/fhir/Patient/{id}/_history", desc: "Version history", auth: "Session / SMART / API Key" },
  { method: "POST", path: "/api/fhir/validate", desc: "Validate resource", auth: "Session / SMART / API Key" },
  { method: "POST", path: "/api/integration/webhook/{channel}", desc: "Inbound data (HL7v2/FHIR/CSV)", auth: "Webhook Secret" },
  { method: "POST", path: "/api/integration/sync", desc: "Sync HealthOps → FHIR", auth: "Platform Admin" },
  { method: "GET", path: "/api/smart/.well-known/smart-configuration", desc: "SMART discovery", auth: "Public" },
];

export default function ExplorerPage() {
  const [input, setInput] = useState(SAMPLE_PATIENT);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"validate" | "create">("validate");
  const [activeTemplate, setActiveTemplate] = useState<"patient" | "observation" | "hl7">("patient");

  const runTest = async () => {
    setLoading(true);
    setOutput("");
    try {
      const body = JSON.parse(input);
      const url = action === "validate"
        ? "/api/fhir/validate"
        : `/api/fhir/${body.resourceType || "Patient"}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/fhir+json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  };

  const loadTemplate = (template: "patient" | "observation" | "hl7") => {
    setActiveTemplate(template);
    switch (template) {
      case "patient": setInput(SAMPLE_PATIENT); break;
      case "observation": setInput(SAMPLE_OBSERVATION); break;
      case "hl7": setInput(SAMPLE_HL7); break;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Link href="/dashboard/fhir-hub" className="flex items-center gap-1.5 text-[12px] text-[#1D3443]/40 hover:text-teal-600 transition-colors mb-2">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to FHIR Hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-bold text-[#1D3443] flex items-center gap-3">
          <TestTube className="w-6 h-6 text-amber-500" />
          FHIR API Explorer
        </h1>
        <p className="text-[13px] text-[#1D3443]/50 mt-1">Test FHIR endpoints, validate resources, and explore the API</p>
      </motion.div>

      {/* API Endpoints Reference */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-4 flex items-center gap-2">
            <FileJson className="w-4 h-4 text-teal-500" /> API Endpoints
          </h3>
          <div className="space-y-1">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-[#1D3443]/[0.02] transition-colors">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-14 text-center ${
                  ep.method === "GET" ? "bg-blue-50 text-blue-600" :
                  ep.method === "POST" ? "bg-emerald-50 text-emerald-600" :
                  ep.method === "PUT" ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-[12px] text-[#1D3443]/70 flex-1">{ep.path}</span>
                <span className="text-[11px] text-[#1D3443]/30">{ep.desc}</span>
                <span className="text-[9px] text-[#1D3443]/20 font-mono">{ep.auth}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Test Console */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-4">Interactive Test Console</h3>

          {/* Templates */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "patient", label: "Sample Patient" },
              { key: "observation", label: "Blood Pressure" },
              { key: "hl7", label: "HL7v2 Message" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => loadTemplate(t.key)}
                className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTemplate === t.key
                    ? "bg-[#1D3443] text-white"
                    : "bg-[#1D3443]/5 text-[#1D3443]/50 hover:bg-[#1D3443]/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-[#1D3443]/40">Input</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setAction("validate")}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      action === "validate" ? "bg-blue-500 text-white" : "bg-[#1D3443]/5 text-[#1D3443]/40"
                    }`}
                  >
                    Validate
                  </button>
                  <button
                    onClick={() => setAction("create")}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      action === "create" ? "bg-emerald-500 text-white" : "bg-[#1D3443]/5 text-[#1D3443]/40"
                    }`}
                  >
                    Create
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-[400px] bg-[#1D3443]/[0.03] border border-[#1D3443]/10 rounded-xl p-4 font-mono text-[12px] text-[#1D3443]/70 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30"
                spellCheck={false}
              />
              <button
                onClick={runTest}
                disabled={loading}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-[#1D3443] hover:bg-[#152736] text-white rounded-xl text-[13px] font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {action === "validate" ? "Validate Resource" : "Create Resource"}
              </button>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-medium text-[#1D3443]/40">Response</span>
                {output && (
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="text-[10px] px-2 py-1 rounded-md bg-[#1D3443]/5 text-[#1D3443]/40 hover:text-[#1D3443]/60 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                )}
              </div>
              <pre className="w-full h-[400px] bg-[#1D3443]/[0.03] border border-[#1D3443]/10 rounded-xl p-4 font-mono text-[12px] text-[#1D3443]/60 overflow-auto whitespace-pre-wrap">
                {output || "Run a test to see results..."}
              </pre>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Supported Resource Types */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-4">Supported Resource Types</h3>
          <p className="text-[12px] text-[#1D3443]/40 mb-3">
            Replace <span className="font-mono bg-[#1D3443]/5 px-1.5 py-0.5 rounded">{"{resourceType}"}</span> in any endpoint with one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {["Patient", "Encounter", "Observation", "Condition", "MedicationRequest", "DiagnosticReport", "AllergyIntolerance", "Immunization", "Procedure", "Consent", "Organization", "Practitioner"].map((type) => (
              <span key={type} className="font-mono text-[11px] px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100">
                {type}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}
