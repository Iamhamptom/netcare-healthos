"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Microscope, ChevronLeft, BookOpen, Eye, Globe, Building2,
  Server, Database, Shield, Users, Zap, FileText, Lock,
  AlertTriangle, Check, ArrowRight, ExternalLink,
} from "lucide-react";

export default function ResearchPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <Link href="/dashboard/fhir-hub" className="flex items-center gap-1.5 text-[12px] text-[#1D3443]/40 hover:text-teal-600 transition-colors mb-2">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to FHIR Hub
      </Link>

      {/* Paper Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="border-b border-[#1D3443]/10 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 text-purple-700">Visio Research Labs</span>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#1D3443]/5 text-[#1D3443]/40">VRL-002 | March 2026</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#1D3443] leading-tight">
            Reverse-Engineering South Africa&apos;s Private Healthcare Data Infrastructure:
            <br />A2D24/HEAL, CareConnect HIE, and the Path to Universal Interoperability
          </h1>
          <p className="text-[13px] text-[#1D3443]/50 mt-3 max-w-3xl leading-relaxed">
            A comprehensive intelligence report on Netcare Digital&apos;s technology stack, the CareConnect Health Information Exchange,
            and a technical blueprint for building a FHIR R4 integration platform that positions VisioHealth as the
            interoperability layer for South African private healthcare.
          </p>
          <div className="flex items-center gap-4 mt-4 text-[11px] text-[#1D3443]/35">
            <span>Authors: VisioCorp Research Division</span>
            <span>|</span>
            <span>Classification: Client Intelligence</span>
            <span>|</span>
            <span>Pages: 12</span>
          </div>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <Section num="1" title="Executive Summary">
        <p>
          This research paper presents the findings of an extensive intelligence-gathering operation into Netcare&apos;s digital
          health infrastructure. Through analysis of open-source code repositories, PyPI packages, patent filings, annual
          reports, and technical job listings, we have mapped the complete technology landscape of South Africa&apos;s largest
          private healthcare group.
        </p>
        <p className="mt-3">
          <strong>Key finding:</strong> While Netcare&apos;s HEAL EMR (primary care) and CareOn (hospital care) are closed
          proprietary systems, the CareConnect Health Information Exchange — which Netcare co-founded — uses InterSystems
          HealthShare with native FHIR R4 support. This creates a standards-compliant pathway to exchange data with Netcare
          (and 5 other major healthcare groups) without requiring direct API access to HEAL or CareOn.
        </p>
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[12px] text-emerald-700 font-semibold">
            Strategic Recommendation: Build a FHIR R4 integration platform and connect through CareConnect HIE.
            This bypasses the closed HEAL/CareOn APIs entirely and positions VisioHealth as the interoperability
            layer for the entire SA private health sector.
          </p>
        </div>
      </Section>

      {/* A2D24 Intelligence */}
      <Section num="2" title="A2D24 / Netcare Digital — Technical Intelligence">
        <h4 className="font-semibold text-[14px] text-[#1D3443] mb-3">2.1 Company Structure</h4>
        <p>
          A2D24 Dot Com (Pty) Ltd is a Johannesburg-based digital innovation lab, described as Africa&apos;s first AWS Advanced
          Technology Partner. In 2021, Netcare and A2D24 formed a joint venture called <strong>Netcare Digital</strong>,
          combining Netcare&apos;s 24 years of healthcare expertise with A2D24&apos;s rapid prototyping capabilities.
        </p>
        <InfoTable data={[
          ["Entity", "Netcare Digital (JV)"],
          ["CEO", "Travis Dewing (Netcare Group CIO)"],
          ["COO", "Muhammad Simjee (A2D24 founder)"],
          ["Head of Dev", "Imtiaz Mangerah (ex-CSIR)"],
          ["AWS Status", "Africa's first Advanced Technology Partner"],
          ["Products", "50+ tech platforms, deployed in 7 countries"],
        ]} />

        <h4 className="font-semibold text-[14px] text-[#1D3443] mb-3 mt-6">2.2 Technology Stack (Reverse-Engineered)</h4>
        <p className="mb-3">
          Through analysis of A2D24&apos;s 6 GitHub repositories and 10 PyPI packages (published by Imtiaz Mangerah), we have
          confirmed the following technology stack:
        </p>
        <InfoTable data={[
          ["Primary Language", "Python (all open-source work)"],
          ["Cloud", "AWS (Lambda + API Gateway + DynamoDB)"],
          ["Database", "DynamoDB (single-table design, custom PK/SK/GSI patterns)"],
          ["Frontend", "React (confirmed for HEAL EMR specifically)"],
          ["Auth/Policy", "Open Policy Agent via WebAssembly (python-opa-wasm)"],
          ["Serialization", "cerealbox (2.69x faster than boto3 for DynamoDB JSON)"],
          ["Data Models", "typed-models (strongly typed serializable models)"],
          ["RPC", "urn (custom micro-RPC framework)"],
          ["Security", "epivault (YubiKey-bound LUKS2 encrypted volumes, published Jan 2026)"],
          ["AI/ML", "NLP for clinical note capture, medication safety checking"],
        ]} />
        <p className="mt-3 text-[11px] text-[#1D3443]/35 italic">
          Critical connection: Imtiaz Mangerah previously worked at the CSIR — the same organization that developed
          SA&apos;s HNSF interoperability framework and the HPRS patient registry. A2D24&apos;s Head of Development
          has direct institutional knowledge of national health interoperability standards.
        </p>
      </Section>

      {/* HEAL EMR */}
      <Section num="3" title="HEAL Electronic Medical Record">
        <p>
          HEAL is Netcare Digital&apos;s primary care EMR, deployed across 100+ Netcare Medicross facilities serving
          approximately 2 million medical consultations per year. It won the BCX Digital Innovation Awards 2023
          (overall winner, corporate category).
        </p>
        <h4 className="font-semibold text-[14px] text-[#1D3443] mb-3 mt-4">3.1 Capabilities</h4>
        <ul className="space-y-1.5 text-[12px] text-[#1D3443]/60">
          {[
            "One-click clinical note capture using NLP — gets smarter over time",
            "Automated medication safety checks (interactions, allergies, dosages)",
            "Billing integration with medical aid schemes",
            "Pathology integration (lab ordering and results)",
            "Patient consent module (digital consent management)",
            "Progressive learning — AI improves with usage data",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" /> {item}
            </li>
          ))}
        </ul>
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700">
              <strong>Integration assessment: CLOSED PLATFORM.</strong> No public APIs, SDKs, or developer documentation.
              No published FHIR or HL7 endpoints. Direct integration would require a formal business partnership
              with Netcare Digital leadership.
            </p>
          </div>
        </div>
      </Section>

      {/* CareConnect HIE */}
      <Section num="4" title="CareConnect HIE — The Critical Integration Layer">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-4">
          <p className="text-[12px] text-emerald-700 font-semibold">
            This is the single most important discovery in our research. CareConnect HIE is the standards-compliant
            pathway into Netcare&apos;s data ecosystem.
          </p>
        </div>
        <p>
          CareConnect is South Africa&apos;s first private-sector Health Information Exchange, founded in 2018 and
          going live in April 2023. It runs on <strong>InterSystems HealthShare</strong> — a platform that natively
          supports FHIR R4, HL7v2, and IHE integration profiles.
        </p>
        <h4 className="font-semibold text-[14px] text-[#1D3443] mb-3 mt-4">4.1 Founding Members</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {["Netcare", "Discovery Health", "Life Healthcare", "Mediclinic", "Medscheme", "Momentum Health"].map((org, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 border border-[#1D3443]/5 rounded-lg">
              <Building2 className="w-4 h-4 text-teal-500" />
              <span className="text-[12px] font-medium text-[#1D3443]">{org}</span>
            </div>
          ))}
        </div>
        <InfoTable data={[
          ["Scale", "5.2 million consented patient lives"],
          ["Platform", "InterSystems HealthShare (Unified Care Record + Patient Index)"],
          ["Standards", "FHIR R4, HL7v2, IHE integration profiles"],
          ["Data Shared", "Demographics, admissions, procedures, diagnoses, medications"],
          ["Compliance", "ISO 27001/27701, POPIA, Medical Schemes Act, GDPR"],
          ["Go-Live", "April 2023"],
        ]} />
        <p className="mt-3">
          <strong>Implication:</strong> Any system that speaks FHIR R4 can potentially exchange data with all 6 founding
          members — covering the majority of South Africa&apos;s private healthcare sector — through a single integration point.
        </p>
      </Section>

      {/* SA Standards Landscape */}
      <Section num="5" title="South African Health Data Standards Landscape">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-[#1D3443]/5 rounded-xl p-4">
            <h4 className="font-semibold text-[13px] text-[#1D3443] mb-2">HNSF (National Normative Standards Framework)</h4>
            <p className="text-[12px] text-[#1D3443]/50">Gazetted October 2022 by CSIR + NDoH. Mandates HL7 CDA, HL7v2.X, DICOM, ICD-10, LOINC, UPFS. All healthcare IT systems must comply.</p>
          </div>
          <div className="border border-[#1D3443]/5 rounded-xl p-4">
            <h4 className="font-semibold text-[13px] text-[#1D3443] mb-2">HPRS (Health Patient Registration System)</h4>
            <p className="text-[12px] text-[#1D3443]/50">CSIR-developed Master Patient Index using SA ID as primary key. Foundation for national EHR. Linked to NHLS lab results.</p>
          </div>
          <div className="border border-[#1D3443]/5 rounded-xl p-4">
            <h4 className="font-semibold text-[13px] text-[#1D3443] mb-2">NHI (National Health Insurance)</h4>
            <p className="text-[12px] text-[#1D3443]/50">Requires electronic data exchange for all providers. FHIR convergence is the direction. Compliance = eligibility for NHI contracts worth billions.</p>
          </div>
          <div className="border border-[#1D3443]/5 rounded-xl p-4">
            <h4 className="font-semibold text-[13px] text-[#1D3443] mb-2">POPIA (Protection of Personal Information Act)</h4>
            <p className="text-[12px] text-[#1D3443]/50">Health data = special personal information. Requires explicit consent, purpose limitation, audit trails, 72-hour breach notification. New 2026 regulations have no grace period.</p>
          </div>
        </div>
      </Section>

      {/* Similar Products */}
      <Section num="6" title="Competitive Landscape — SA Healthcare Integration">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#1D3443]/10">
                <th className="text-left py-2 pr-4 text-[#1D3443]/40 font-medium">Product</th>
                <th className="text-left py-2 pr-4 text-[#1D3443]/40 font-medium">Vendor</th>
                <th className="text-left py-2 pr-4 text-[#1D3443]/40 font-medium">Type</th>
                <th className="text-left py-2 pr-4 text-[#1D3443]/40 font-medium">API Access</th>
                <th className="text-left py-2 text-[#1D3443]/40 font-medium">Threat Level</th>
              </tr>
            </thead>
            <tbody>
              {[
                { product: "HEAL", vendor: "A2D24 / Netcare Digital", type: "Primary Care EMR", api: "Closed", threat: "low" },
                { product: "CareOn", vendor: "Deutsche Telekom + Netcare", type: "Hospital EMR", api: "Closed (HL7v2 internal)", threat: "low" },
                { product: "TrakCare", vendor: "InterSystems", type: "Hospital IS", api: "FHIR-native, all data via API", threat: "medium" },
                { product: "SwitchOn", vendor: "Altron HealthTech", type: "Claims Switching", api: "SOAP/XML (vendor program)", threat: "medium" },
                { product: "OpenHIM", vendor: "Jembi Health Systems", type: "Open-source HIE", api: "Fully open, FHIR endpoints", threat: "partner" },
                { product: "Redox", vendor: "Redox (US)", type: "iPaaS", api: "REST/JSON", threat: "low (not in SA)" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#1D3443]/5">
                  <td className="py-2.5 pr-4 font-medium text-[#1D3443]">{row.product}</td>
                  <td className="py-2.5 pr-4 text-[#1D3443]/50">{row.vendor}</td>
                  <td className="py-2.5 pr-4 text-[#1D3443]/50">{row.type}</td>
                  <td className="py-2.5 pr-4 text-[#1D3443]/50">{row.api}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      row.threat === "low" ? "bg-emerald-50 text-emerald-600" :
                      row.threat === "medium" ? "bg-amber-50 text-amber-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>{row.threat}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-[#1D3443]/40">
          No SA company has built a complete FHIR R4 integration platform for private healthcare.
          The closest is Jembi&apos;s OpenHIM, which is focused on public health. VisioCorp has a clear first-mover advantage.
        </p>
      </Section>

      {/* Recommendations */}
      <Section num="7" title="Strategic Recommendations">
        <div className="space-y-3">
          {[
            { num: "1", title: "Connect to CareConnect HIE first", desc: "Our FHIR API speaks the same language as InterSystems HealthShare. This is the fastest path to 5.2M patient records across 6 major healthcare groups." },
            { num: "2", title: "Certify with MediSwitch/SwitchOn", desc: "Register as a software vendor with Altron HealthTech's claims switching platform. They process 5.8M+ transactions/month from 12,000+ businesses." },
            { num: "3", title: "Deploy HL7v2 feeds for lab integration", desc: "PathCare, Lancet, and Ampath all support HL7v2 ORU result feeds. Our parser is ready — we just need the network connections." },
            { num: "4", title: "Approach Netcare Digital with a working platform", desc: "Don't ask for API access — show them a standards-compliant platform that makes their data more valuable. The FHIR Capability Statement is our calling card." },
            { num: "5", title: "Prepare for NHI compliance audits", desc: "Government is mandating electronic interoperability. Being FHIR-compliant before the deadline positions Netcare (and VisioCorp) for preferred provider contracts." },
          ].map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-4 border border-[#1D3443]/5 rounded-xl">
              <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-[12px] font-bold shrink-0">{rec.num}</span>
              <div>
                <h4 className="font-semibold text-[13px] text-[#1D3443]">{rec.title}</h4>
                <p className="text-[12px] text-[#1D3443]/50 mt-0.5">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="border-t border-[#1D3443]/10 pt-6 text-center">
        <p className="text-[11px] text-[#1D3443]/25">
          VisioCorp Research Labs | VRL-002 | Confidential — Client Intelligence | March 2026
        </p>
        <p className="text-[10px] text-[#1D3443]/15 mt-1">
          Sources: A2D24 GitHub, Netcare Annual Reports 2023-2024, CareConnect HIE documentation,
          InterSystems HealthShare, CSIR HNSF Gazette, SA National Digital Health Strategy, POPIA 2026 Regulations
        </p>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: parseInt(num) * 0.03 }}>
      <div className="bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h3 className="font-bold text-[16px] text-[#1D3443] mb-4 flex items-center gap-2">
          <span className="text-[12px] text-teal-500 font-mono">{num}.</span> {title}
        </h3>
        <div className="text-[13px] text-[#1D3443]/60 leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}

function InfoTable({ data }: { data: string[][] }) {
  return (
    <div className="border border-[#1D3443]/5 rounded-xl overflow-hidden mt-3">
      {data.map(([key, val], i) => (
        <div key={i} className={`flex text-[12px] ${i > 0 ? "border-t border-[#1D3443]/5" : ""}`}>
          <div className="w-40 shrink-0 px-3 py-2 bg-[#1D3443]/[0.02] font-medium text-[#1D3443]/50">{key}</div>
          <div className="px-3 py-2 text-[#1D3443]/70">{val}</div>
        </div>
      ))}
    </div>
  );
}
