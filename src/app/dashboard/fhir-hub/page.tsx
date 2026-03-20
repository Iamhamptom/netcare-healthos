"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Cable, ArrowRight, Check, Globe, Shield, Zap, Heart,
  FileJson, Server, Activity, Database, Lock, Eye,
  Building2, Workflow, TestTube, DollarSign, Microscope,
  BookOpen, Layers, ArrowDownToLine, ArrowUpFromLine,
  ChevronRight, Sparkles,
} from "lucide-react";

export default function FhirHubOverview() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D3443] via-[#1a3d50] to-[#152736] p-8 md:p-10 text-white"
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400">
              VisioCorp Innovation
            </span>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-500/20 text-teal-400">
              FHIR R4 Compliant
            </span>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400">
              CareConnect Ready
            </span>
          </div>
          <h1 className="text-[28px] font-bold mb-2">FHIR Integration Hub</h1>
          <p className="text-white/50 text-[15px] max-w-2xl leading-relaxed">
            South Africa&apos;s first AI-powered healthcare interoperability platform.
            Connect Netcare&apos;s 88+ Medicross clinics, 45 hospitals, and 5.2M CareConnect patients
            through standards-compliant FHIR R4, HL7v2, and SMART on FHIR APIs.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/dashboard/fhir-hub/architecture" className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-[13px] font-semibold transition-colors">
              <Workflow className="w-4 h-4" /> View Architecture
            </Link>
            <Link href="/dashboard/fhir-hub/impact" className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-[13px] font-semibold transition-colors">
              <DollarSign className="w-4 h-4" /> Financial Impact
            </Link>
            <Link href="/dashboard/fhir-hub/research" className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-[13px] font-semibold transition-colors">
              <Microscope className="w-4 h-4" /> VRL Research Paper
            </Link>
          </div>
        </div>
      </motion.div>

      {/* What Is This */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <SectionTitle icon={<Cable className="w-5 h-5 text-teal-500" />} title="What Is the FHIR Integration Hub?" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-[15px] text-[#1D3443] mb-3">The Problem</h3>
            <p className="text-[13px] text-[#1D3443]/60 leading-relaxed">
              Netcare&apos;s HEAL EMR (built by A2D24) is a closed, proprietary system with no public APIs.
              CareOn (hospital EMR) runs on Deutsche Telekom infrastructure. Neither system can talk to
              third-party platforms, creating data silos across 88+ clinics and 45 hospitals.
            </p>
            <div className="mt-4 space-y-2">
              {["No standard data exchange between systems", "Manual claims processing costs R40M+/year", "Lab results require manual entry", "No real-time patient record sharing"].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-red-500/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-semibold text-[15px] text-[#1D3443] mb-3">Our Solution</h3>
            <p className="text-[13px] text-[#1D3443]/60 leading-relaxed">
              Instead of hacking into HEAL, we built the platform hospitals <em>want</em> to connect to.
              A standards-compliant FHIR R4 server with HL7v2 adapters that plugs directly into
              CareConnect HIE — South Africa&apos;s private-sector Health Information Exchange.
            </p>
            <div className="mt-4 space-y-2">
              {["FHIR R4 API — any system can connect", "HL7v2 parser for legacy hospital feeds", "CareConnect HIE compatible (5.2M patients)", "SMART on FHIR auth for third-party apps"].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-emerald-600/80">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionTitle icon={<Workflow className="w-5 h-5 text-teal-500" />} title="How It Works" />
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Data Arrives", desc: "HL7v2 messages from hospital EMRs, FHIR bundles from CareConnect, CSV imports from legacy systems", icon: ArrowDownToLine, color: "bg-blue-50 text-blue-600" },
            { step: "02", title: "Engine Processes", desc: "Integration engine routes to the correct adapter — HL7v2 parser, FHIR bridge, or CSV mapper — with full audit trail", icon: Workflow, color: "bg-amber-50 text-amber-600" },
            { step: "03", title: "FHIR Stored", desc: "Resources validated against SA coding standards (ICD-10, LOINC, NAPPI), stored as JSONB with version history", icon: Database, color: "bg-emerald-50 text-emerald-600" },
            { step: "04", title: "Data Shared", desc: "SMART on FHIR apps query patient data. Claims sent to MediSwitch. Lab results flow to practitioners in real-time", icon: ArrowUpFromLine, color: "bg-purple-50 text-purple-600" },
          ].map((s, i) => (
            <Card key={i} className="text-center relative">
              {i < 3 && <ArrowRight className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D3443]/15 hidden md:block" />}
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-teal-500 tracking-wider mb-1">STEP {s.step}</div>
              <h4 className="font-semibold text-[14px] text-[#1D3443] mb-2">{s.title}</h4>
              <p className="text-[12px] text-[#1D3443]/50 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Standards & Compliance */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionTitle icon={<Shield className="w-5 h-5 text-teal-500" />} title="Standards & Compliance" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "FHIR R4", version: "4.0.1", status: "active", desc: "12 resource types, full REST API" },
            { name: "SMART on FHIR", version: "v2", status: "active", desc: "OAuth2 + PKCE for EMR apps" },
            { name: "HL7v2", version: "2.3+", status: "active", desc: "ADT, ORU, ORM, SIU messages" },
            { name: "SA HNSF", version: "2022", status: "active", desc: "National interop framework" },
            { name: "POPIA", version: "2026", status: "active", desc: "Full audit trail, consent mgmt" },
            { name: "ICD-10 (SA)", version: "2024", status: "active", desc: "Diagnosis coding standard" },
            { name: "LOINC", version: "2.77", status: "active", desc: "Lab & vitals observation codes" },
            { name: "CareConnect HIE", version: "v1", status: "ready", desc: "InterSystems HealthShare" },
          ].map((s, i) => (
            <Card key={i} className="!p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[13px] text-[#1D3443]">{s.name}</span>
                <span className={`w-2 h-2 rounded-full ${s.status === "active" ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
              <div className="text-[11px] text-[#1D3443]/40 mb-1">v{s.version}</div>
              <div className="text-[11px] text-[#1D3443]/50">{s.desc}</div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* VisioCorp Innovation */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <SectionTitle icon={<Sparkles className="w-5 h-5 text-amber-500" />} title="VisioCorp Innovation & Breakthrough" />
        <Card className="!p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1D3443] to-[#1a3d50] p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">VisioCorp / VisioHealth</span>
            </div>
            <h3 className="text-[18px] font-bold mb-2">First-Mover Advantage in SA Healthcare Interoperability</h3>
            <p className="text-white/50 text-[13px] leading-relaxed max-w-3xl">
              VisioCorp has built something that doesn&apos;t exist in the South African private healthcare market:
              a complete FHIR R4 integration platform designed specifically for the SA regulatory landscape
              (HNSF, POPIA, NHI) with native connectors for the systems hospitals actually use.
            </p>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-[14px] text-[#1D3443] mb-2">What We Reverse-Engineered</h4>
              <ul className="space-y-2 text-[12px] text-[#1D3443]/60">
                <li className="flex items-start gap-2"><Eye className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> A2D24&apos;s tech stack: Python + AWS Lambda + DynamoDB + React (from their GitHub repos & 10 PyPI packages)</li>
                <li className="flex items-start gap-2"><Eye className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> HEAL&apos;s architecture: Serverless, NLP clinical notes, medication safety AI</li>
                <li className="flex items-start gap-2"><Eye className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> CareConnect HIE: InterSystems HealthShare, FHIR-native, 5.2M patients (Netcare is founding member)</li>
                <li className="flex items-start gap-2"><Eye className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> Capsule MDIP (Philips): HL7v2 + IHE profiles for 1,000+ medical device models in CareOn</li>
                <li className="flex items-start gap-2"><Eye className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> Key people: Muhammad Simjee (COO Netcare Digital), Imtiaz Mangerah (ex-CSIR, Head of Dev at A2D24)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[14px] text-[#1D3443] mb-2">What We Built</h4>
              <ul className="space-y-2 text-[12px] text-[#1D3443]/60">
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> FHIR R4 REST API — 15 endpoints, 12 resource types, JSONB + GIN indexed</li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> HL7v2 parser — Zero-dependency, handles ADT/ORU/ORM/SIU → FHIR mapping</li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> Integration engine — Adapter pattern, message queuing, full POPIA audit trail</li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> SMART on FHIR auth — OAuth2 + PKCE for external EMR app connections</li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> Synthea SA — Synthetic patient generator with real SA demographics</li>
                <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> 28 files, 0 new dependencies — production-ready, zero bloat</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[14px] text-[#1D3443] mb-2">Why This Matters</h4>
              <ul className="space-y-2 text-[12px] text-[#1D3443]/60">
                <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> No SA company has built a FHIR-native integration platform for private healthcare</li>
                <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> CareConnect HIE connection unlocks Netcare + Discovery + Life + Mediclinic + Medscheme</li>
                <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> NHI compliance — government is mandating FHIR interoperability for all providers</li>
                <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> R139M+/year potential revenue impact for Netcare through reduced manual processes</li>
                <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> Position as the interoperability layer for the entire SA private health sector</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Connected Systems */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionTitle icon={<Globe className="w-5 h-5 text-teal-500" />} title="Connected Systems & Integration Paths" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "CareConnect HIE", org: "InterSystems HealthShare", status: "ready", patients: "5.2M", protocol: "FHIR R4", members: "Netcare, Discovery, Life Healthcare, Mediclinic, Medscheme, Momentum", color: "emerald" },
            { name: "HEAL EMR", org: "A2D24 / Netcare Digital", status: "research", patients: "2M+/yr", protocol: "Proprietary (AWS)", members: "88+ Medicross clinics", color: "amber" },
            { name: "CareOn EMR", org: "Deutsche Telekom + Netcare", status: "adapter", patients: "34K users", protocol: "HL7v2 via Capsule MDIP", members: "45 hospitals, 13K+ iPads", color: "blue" },
            { name: "SwitchOn / MediSwitch", org: "Altron HealthTech", status: "planned", patients: "5.8M tx/mo", protocol: "SOAP/XML", members: "12,000+ healthcare businesses", color: "purple" },
            { name: "PathCare / Lancet / Ampath", org: "SA Pathology Labs", status: "planned", patients: "Millions/yr", protocol: "HL7v2 ORU", members: "National coverage", color: "rose" },
            { name: "OpenHIM", org: "Jembi Health Systems", status: "compatible", patients: "National", protocol: "FHIR + Mediators", members: "SA public health infrastructure", color: "teal" },
          ].map((sys, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[14px] text-[#1D3443]">{sys.name}</h4>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                  sys.status === "ready" ? "bg-emerald-50 text-emerald-600" :
                  sys.status === "adapter" ? "bg-blue-50 text-blue-600" :
                  sys.status === "compatible" ? "bg-teal-50 text-teal-600" :
                  sys.status === "research" ? "bg-amber-50 text-amber-600" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {sys.status}
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#1D3443]/50">
                <div><span className="text-[#1D3443]/30">Org:</span> {sys.org}</div>
                <div><span className="text-[#1D3443]/30">Scale:</span> {sys.patients}</div>
                <div><span className="text-[#1D3443]/30">Protocol:</span> {sys.protocol}</div>
                <div><span className="text-[#1D3443]/30">Scope:</span> {sys.members}</div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Netcare Offer */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
        <SectionTitle icon={<Heart className="w-5 h-5 text-rose-500" />} title="Netcare Partnership Offer" />
        <Card className="!p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20">Exclusive Offer</span>
            </div>
            <h3 className="text-[20px] font-bold">FHIR Integration Hub — Pilot Programme</h3>
            <p className="text-white/70 text-[13px] mt-1 max-w-2xl">
              Deploy SA&apos;s first FHIR-native healthcare interoperability platform across Netcare Medicross clinics.
              Connect CareConnect HIE, automate claims, and eliminate manual lab result entry.
            </p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-[#1D3443]/5 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Phase 1 — Pilot (3 months)</div>
                <div className="font-metric text-[24px] font-bold text-[#1D3443]">R250K</div>
                <div className="text-[11px] text-[#1D3443]/40 mb-3">Setup + 3 months platform access</div>
                <ul className="space-y-1.5 text-[11px] text-[#1D3443]/50">
                  {["5 Medicross clinics connected", "FHIR R4 API fully deployed", "Claims auto-routing (MediSwitch)", "Lab result feeds (PathCare HL7v2)", "CareConnect HIE sandbox testing", "Dedicated technical support"].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="border-2 border-teal-500 rounded-xl p-4 relative">
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[9px] font-bold uppercase bg-teal-500 text-white rounded-full">Recommended</span>
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-2">Phase 2 — Full Rollout (12 months)</div>
                <div className="font-metric text-[24px] font-bold text-[#1D3443]">R1.5M/yr</div>
                <div className="text-[11px] text-[#1D3443]/40 mb-3">All 88 clinics + 10 hospitals</div>
                <ul className="space-y-1.5 text-[11px] text-[#1D3443]/50">
                  {["All 88 Medicross clinics", "10 hospital CareOn connections", "CareConnect HIE production (5.2M patients)", "MediSwitch certified claims routing", "SMART on FHIR app access", "NHI compliance certification", "24/7 SLA with R42M savings guarantee"].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" /> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-[#1D3443]/5 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mb-2">Enterprise — Full Platform</div>
                <div className="font-metric text-[24px] font-bold text-[#1D3443]">Custom</div>
                <div className="text-[11px] text-[#1D3443]/40 mb-3">White-label + all hospitals</div>
                <ul className="space-y-1.5 text-[11px] text-[#1D3443]/50">
                  {["White-label platform (Netcare branded)", "All 133 facilities connected", "Custom adapter development", "Population health analytics", "Third-party developer marketplace", "Pan-network data exchange", "Dedicated engineering team"].map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check className="w-3 h-3 text-purple-500 mt-0.5 shrink-0" /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 p-4 bg-emerald-50 rounded-xl text-center">
              <p className="text-[13px] text-emerald-700 font-semibold">
                Projected return: R139M+/year in cost savings — 93x ROI on Phase 2 investment
              </p>
              <p className="text-[11px] text-emerald-600/60 mt-1">
                Contact: Dr Hampton George-Sobremisana | hampton@visiocorp.co | VisioCorp
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { href: "/dashboard/fhir-hub/architecture", icon: Workflow, title: "Architecture", desc: "Data flow diagrams, system design, adapter patterns", color: "bg-blue-50 text-blue-600" },
            { href: "/dashboard/fhir-hub/impact", icon: DollarSign, title: "Netcare Impact", desc: "R139M+/yr revenue impact, ROI analysis, cost savings", color: "bg-emerald-50 text-emerald-600" },
            { href: "/dashboard/fhir-hub/research", icon: Microscope, title: "VRL Research", desc: "Deep intelligence on A2D24, HEAL, CareConnect HIE, SA standards", color: "bg-purple-50 text-purple-600" },
            { href: "/dashboard/fhir-hub/explorer", icon: TestTube, title: "API Explorer", desc: "Test FHIR endpoints, validate resources, browse data", color: "bg-amber-50 text-amber-600" },
          ].map((link, i) => (
            <Link key={i} href={link.href}>
              <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center mb-3`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-[14px] text-[#1D3443] mb-1 flex items-center gap-2">
                  {link.title}
                  <ChevronRight className="w-3.5 h-3.5 text-[#1D3443]/20 group-hover:text-teal-500 transition-colors" />
                </h4>
                <p className="text-[12px] text-[#1D3443]/50">{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Reusable Components ───────────────────────────────────────

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {icon}
      <h2 className="text-[17px] font-bold text-[#1D3443]">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}
