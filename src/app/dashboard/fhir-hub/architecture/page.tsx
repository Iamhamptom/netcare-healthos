"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Workflow, ArrowDown, ArrowRight, Database, Server, Shield, Globe,
  FileJson, FileText, Layers, Lock, Eye, Cpu, HardDrive,
  Cable, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight,
  ChevronLeft,
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Link href="/dashboard/fhir-hub" className="flex items-center gap-1.5 text-[12px] text-[#1D3443]/40 hover:text-teal-600 transition-colors mb-2">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to FHIR Hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-bold text-[#1D3443] flex items-center gap-3">
          <Workflow className="w-6 h-6 text-teal-500" />
          System Architecture
        </h1>
        <p className="text-[13px] text-[#1D3443]/50 mt-1">Complete technical architecture of the FHIR Integration Hub</p>
      </motion.div>

      {/* 4-Layer Architecture Diagram */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5">4-Layer Architecture</h3>
          <div className="space-y-3">
            {/* Layer 1 */}
            <ArchLayer
              num="1"
              title="FHIR R4 REST API"
              color="bg-blue-50 border-blue-200"
              titleColor="text-blue-700"
              items={["GET/POST /api/fhir/Patient", "GET/PUT/DELETE /api/fhir/{type}/{id}", "GET /api/fhir/{type}/{id}/_history", "POST /api/fhir/validate", "GET /api/fhir/metadata (CapabilityStatement)"]}
              desc="15 Next.js API routes, triple auth (JWT + SMART + API Key), FHIR-compliant responses with ETag/Location headers"
            />
            <div className="flex justify-center"><ArrowDown className="w-5 h-5 text-[#1D3443]/15" /></div>

            {/* Layer 2 */}
            <ArchLayer
              num="2"
              title="Integration Engine (Adapter Pattern)"
              color="bg-amber-50 border-amber-200"
              titleColor="text-amber-700"
              items={["HL7v2 Parser — ADT/ORU/ORM/SIU → FHIR (zero deps)", "FHIR Bridge — Bundle ingest from CareConnect HIE", "CSV Mapper — Field mapping config for legacy imports", "CareConnect Adapter — InterSystems HealthShare compatible"]}
              desc="Routes messages through adapters, handles retry/dead-letter, full correlation ID tracking"
            />
            <div className="flex justify-center"><ArrowDown className="w-5 h-5 text-[#1D3443]/15" /></div>

            {/* Layer 3 */}
            <ArchLayer
              num="3"
              title="Message Queue + POPIA Audit Trail"
              color="bg-purple-50 border-purple-200"
              titleColor="text-purple-700"
              items={["Every message logged with correlation_id", "Status tracking: received → processing → completed/failed", "Processing time tracked in milliseconds", "Dead-letter queue for failed messages with retry"]}
              desc="ho_message_transactions table — immutable audit log satisfying POPIA Section 26-33 requirements"
            />
            <div className="flex justify-center"><ArrowDown className="w-5 h-5 text-[#1D3443]/15" /></div>

            {/* Layer 4 */}
            <ArchLayer
              num="4"
              title="FHIR Data Store (Supabase PostgreSQL + JSONB)"
              color="bg-emerald-50 border-emerald-200"
              titleColor="text-emerald-700"
              items={["ho_fhir_resources — GIN-indexed JSONB, 7 B-tree indexes", "ho_fhir_resources_history — Append-only version archive", "ho_integration_channels — Channel config with CHECK constraints", "ho_message_transactions — Full audit trail"]}
              desc="Complete FHIR resources stored as JSONB with extracted search columns for fast queries"
            />
          </div>
        </Card>
      </motion.div>

      {/* Data Flow */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5">Data Flow — Hospital to Platform</h3>
          <div className="grid md:grid-cols-5 gap-3 items-center">
            <FlowBox icon={<Server className="w-5 h-5" />} title="Hospital EMR" sub="HEAL / CareOn" color="bg-gray-100" />
            <FlowArrow label="HL7v2 ADT/ORU" />
            <FlowBox icon={<Cable className="w-5 h-5" />} title="Webhook Endpoint" sub="/api/integration/webhook/{channel}" color="bg-amber-50" />
            <FlowArrow label="FHIR R4 Resources" />
            <FlowBox icon={<Database className="w-5 h-5" />} title="FHIR Store" sub="Supabase JSONB" color="bg-emerald-50" />
          </div>
          <div className="mt-6 grid md:grid-cols-5 gap-3 items-center">
            <FlowBox icon={<Globe className="w-5 h-5" />} title="CareConnect HIE" sub="InterSystems HealthShare" color="bg-blue-50" />
            <FlowArrow label="FHIR Bundle" />
            <FlowBox icon={<Layers className="w-5 h-5" />} title="FHIR Bridge" sub="Integration Engine" color="bg-amber-50" />
            <FlowArrow label="Validated + Stored" />
            <FlowBox icon={<Eye className="w-5 h-5" />} title="Dashboard" sub="Real-time visibility" color="bg-purple-50" />
          </div>
          <div className="mt-6 grid md:grid-cols-5 gap-3 items-center">
            <FlowBox icon={<FileText className="w-5 h-5" />} title="Legacy CSV" sub="Practice exports" color="bg-gray-100" />
            <FlowArrow label="CSV with field map" />
            <FlowBox icon={<Cpu className="w-5 h-5" />} title="CSV Adapter" sub="Configurable mapping" color="bg-amber-50" />
            <FlowArrow label="FHIR Patient/Obs" />
            <FlowBox icon={<HardDrive className="w-5 h-5" />} title="Versioned Store" sub="Full history" color="bg-emerald-50" />
          </div>
        </Card>
      </motion.div>

      {/* Resource Types */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5">12 FHIR R4 Resource Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: "Patient", desc: "Demographics, SA ID, medical aid", count: "Core" },
              { type: "Encounter", desc: "Visits, admissions, appointments", count: "Core" },
              { type: "Observation", desc: "Vitals, lab results (LOINC coded)", count: "Core" },
              { type: "Condition", desc: "Diagnoses (ICD-10 SA coded)", count: "Core" },
              { type: "MedicationRequest", desc: "Prescriptions, dispensing", count: "Clinical" },
              { type: "DiagnosticReport", desc: "Lab reports, imaging results", count: "Clinical" },
              { type: "AllergyIntolerance", desc: "Drug & food allergies", count: "Clinical" },
              { type: "Immunization", desc: "Vaccination records", count: "Clinical" },
              { type: "Procedure", desc: "Surgical & clinical procedures", count: "Clinical" },
              { type: "Consent", desc: "POPIA consent management", count: "Compliance" },
              { type: "Organization", desc: "Practices, hospitals, schemes", count: "Admin" },
              { type: "Practitioner", desc: "Clinicians, HPCSA numbers", count: "Admin" },
            ].map((r, i) => (
              <div key={i} className="border border-[#1D3443]/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[12px] font-bold text-[#1D3443]">{r.type}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#1D3443]/25">{r.count}</span>
                </div>
                <span className="text-[11px] text-[#1D3443]/45">{r.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Security Model */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-500" /> Security & Authentication
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="border border-[#1D3443]/5 rounded-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-2">Layer 1: SMART on FHIR</div>
              <p className="text-[12px] text-[#1D3443]/50">OAuth2 Authorization Code flow with PKCE. External EMR apps authenticate via SMART App Launch Framework. Patient/encounter context in token.</p>
            </div>
            <div className="border border-[#1D3443]/5 rounded-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Layer 2: API Key Auth</div>
              <p className="text-[12px] text-[#1D3443]/50">SHA-256 hashed API keys for integration channels. Per-practice scoping. Automatic last-used tracking. Webhook secret validation.</p>
            </div>
            <div className="border border-[#1D3443]/5 rounded-xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-2">Layer 3: Session JWT</div>
              <p className="text-[12px] text-[#1D3443]/50">HealthOps session cookies (httpOnly, secure, SameSite). Role-based access control. Practice-scoped data isolation via RLS policies.</p>
            </div>
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

function ArchLayer({ num, title, color, titleColor, items, desc }: {
  num: string; title: string; color: string; titleColor: string; items: string[]; desc: string;
}) {
  return (
    <div className={`border rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center text-[12px] font-bold text-[#1D3443]/40">{num}</span>
        <h4 className={`font-bold text-[14px] ${titleColor}`}>{title}</h4>
      </div>
      <div className="grid md:grid-cols-2 gap-1.5 mb-3">
        {items.map((item, i) => (
          <div key={i} className="text-[11px] text-[#1D3443]/50 flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#1D3443]/20 mt-1.5 shrink-0" />
            <span className="font-mono">{item}</span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[#1D3443]/35 italic">{desc}</p>
    </div>
  );
}

function FlowBox({ icon, title, sub, color }: { icon: React.ReactNode; title: string; sub: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center border border-[#1D3443]/5`}>
      <div className="flex justify-center mb-1.5 text-[#1D3443]/50">{icon}</div>
      <div className="font-semibold text-[12px] text-[#1D3443]">{title}</div>
      <div className="text-[10px] text-[#1D3443]/40 mt-0.5">{sub}</div>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <ArrowRight className="w-4 h-4 text-[#1D3443]/15" />
      <span className="text-[9px] text-[#1D3443]/25 font-mono">{label}</span>
    </div>
  );
}
