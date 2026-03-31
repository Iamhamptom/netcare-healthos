"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Shield, Scale, Globe, Heart, Lock, BookOpen,
  Download, ExternalLink, Search, Filter, Layers, Brain,
  Activity, Code2, Building2, AlertTriangle, CheckCircle2,
  Microscope, Stethoscope, Zap
} from "lucide-react";

type DocCategory = "all" | "compliance" | "research" | "technical" | "legal" | "policy";

interface Document {
  title: string;
  category: DocCategory;
  description: string;
  reference: string;
  date: string;
  status: "published" | "draft" | "in_review";
  icon: typeof FileText;
  color: string;
  link?: string;
  badge?: string;
}

const DOCUMENTS: Document[] = [
  // === COMPLIANCE ===
  {
    title: "POPIA Health Data Compliance Statement",
    category: "compliance",
    description: "Full compliance with POPIA health-specific regulations enforced 6 March 2026. Covers consent flows, encryption, audit logging, Section 71 human-in-the-loop, data retention, cross-border transfer, and DPA framework.",
    reference: "VRL-POPIA-HEALTH-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Lock,
    color: "#10B981",
    badge: "ACTIVE",
  },
  {
    title: "HPCSA Booklet 20 — AI Ethics Alignment",
    category: "compliance",
    description: "First SA health tech vendor to formally align product to the HPCSA Ethical Guidelines for AI in Healthcare (November 2025). Maps platform to all three pillars: Ethics, Legal, Technical.",
    reference: "VRL-HPCSA-AI-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Heart,
    color: "#3DA9D1",
    badge: "FIRST IN SA",
  },
  {
    title: "King V Principle 10 — AI Governance Brief",
    category: "compliance",
    description: "How the Netcare Health OS supports Netcare's board-level AI governance obligations under King V (effective January 2026). 5-tier precedence framework, risk matrix, audit trail, board-reportable metrics.",
    reference: "VRL-KINGV-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Scale,
    color: "#8B5CF6",
    badge: "ACTIVE",
  },
  {
    title: "SAHPRA MD08-2025/2026 Classification Analysis",
    category: "compliance",
    description: "Formal self-assessment under SAHPRA AI/ML device guidelines. System classified as administrative claims processing tool — NOT a Software as Medical Device. 0 of 6 SaMD criteria met.",
    reference: "VRL-SAHPRA-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Shield,
    color: "#10B981",
    badge: "NOT SaMD",
  },
  {
    title: "CareConnect HIE Integration Readiness Report",
    category: "compliance",
    description: "FHIR R4 server with 12 resource types, SMART on FHIR auth, HL7v2 → FHIR translation. Compatible with CareConnect's InterSystems HealthShare platform. Netcare co-founded CareConnect — we speak the same standard.",
    reference: "VRL-HIE-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Globe,
    color: "#3DA9D1",
    badge: "READY",
  },
  {
    title: "SA National AI Policy Alignment",
    category: "compliance",
    description: "Alignment with the DCDT National AI Policy Framework (SEIAS-certified February 2026). Covers all 5 pillars: responsible governance, ethical AI, skills development, human-centred design, cultural preservation.",
    reference: "VRL-NAIP-2026-001",
    date: "31 March 2026",
    status: "published",
    icon: Brain,
    color: "#F59E0B",
    badge: "5 PILLARS",
  },
  {
    title: "ISO 27001 Alignment Assessment",
    category: "compliance",
    description: "Information Security Management System assessment against ISO 27001 controls. Documented: InfoSec policy, BCP, key rotation, SDLC, encryption, RBAC, audit logging. Formal certification Q3 2026.",
    reference: "VRL-ISO-2026-001",
    date: "31 March 2026",
    status: "in_review",
    icon: Shield,
    color: "#F59E0B",
    badge: "Q3 2026",
  },
  // === RESEARCH PAPERS ===
  {
    title: "VRL-001: CareOn Bridge Research Paper",
    category: "research",
    description: "HL7v2 to FHIR R4 translation for Netcare's CareOn EMR. R139M/yr operational benefit. ROI methodology, clinical advisory engine, drug interaction detection.",
    reference: "VRL-001",
    date: "March 2026",
    status: "published",
    icon: Activity,
    color: "#10B981",
    link: "/dashboard/bridge/research",
  },
  {
    title: "VRL-002: Claims Switching Engine Research",
    category: "research",
    description: "Multi-switch routing across Healthbridge, SwitchOn, MediKredit. EDIFACT MEDCLM v0:912:ZA. Circuit breaker failover. 30+ scheme routing table.",
    reference: "VRL-002",
    date: "March 2026",
    status: "published",
    icon: Layers,
    color: "#7C3AED",
    link: "/research/vrl-002",
  },
  {
    title: "Claims Intelligence Whitepaper",
    category: "research",
    description: "The R40 billion claims gap in SA healthcare. 10-layer validation pipeline. AI-assisted coding accuracy. Revenue recovery methodology.",
    reference: "VRL-CIW-2026",
    date: "March 2026",
    status: "published",
    icon: Microscope,
    color: "#EF4444",
    link: "/research/claims-intelligence",
  },
  {
    title: "FHIR Integration Hub — VRL Research",
    category: "research",
    description: "FHIR R4 server architecture, CareConnect HIE compatibility, SA National Digital Health Strategy alignment, interoperability framework.",
    reference: "VRL-FHIR-2026",
    date: "March 2026",
    status: "published",
    icon: Globe,
    color: "#3DA9D1",
    link: "/dashboard/fhir-hub/research",
  },
  {
    title: "Healthbridge AI Claims — R40B Gap Analysis",
    category: "research",
    description: "The R40 billion gap between claims submitted and claims paid in SA private healthcare. Root cause analysis, rejection patterns, AI intervention opportunities.",
    reference: "VRL-HB-2026",
    date: "March 2026",
    status: "published",
    icon: Building2,
    color: "#F59E0B",
    link: "/dashboard/healthbridge/research",
  },
  {
    title: "VRL-003: Healthcare AI Tools Paper",
    category: "research",
    description: "Landscape analysis of AI tools in SA healthcare. Nora AI, RADIFY, Healthbridge AI, Discovery Vitality AI. Market gaps and opportunities.",
    reference: "VRL-003",
    date: "March 2026",
    status: "published",
    icon: Brain,
    color: "#8B5CF6",
  },
  // === TECHNICAL ===
  {
    title: "CareOn Integration Technical Specification",
    category: "technical",
    description: "HL7v2 MLLP interface specification. Message types supported (ADT, ORU, ORM, DFT, SIU, MDM). FHIR resource mappings. Zero modifications to CareOn required.",
    reference: "VRL-TECH-CAREON-001",
    date: "March 2026",
    status: "published",
    icon: Code2,
    color: "#3DA9D1",
  },
  {
    title: "Technical API Specifications",
    category: "technical",
    description: "Full API surface documentation: 216 endpoints across claims, FHIR, switching, patients, billing, agents, and administration. Authentication, rate limiting, response formats.",
    reference: "VRL-API-2026-001",
    date: "March 2026",
    status: "published",
    icon: Code2,
    color: "#6366F1",
    link: "/dashboard/architecture",
  },
  {
    title: "SA Competitor Feature Matrix",
    category: "technical",
    description: "20-capability comparison across all SA health tech vendors. Confirmed: no SA vendor has more than 5 of our 20 capabilities. 'First in SA' defensible.",
    reference: "VRL-COMP-2026",
    date: "March 2026",
    status: "published",
    icon: Stethoscope,
    color: "#EF4444",
  },
  {
    title: "Accuracy Methodology & Test Results",
    category: "technical",
    description: "Claims validation accuracy across 2,300+ SA claims. Test methodology, blind test results, false positive/negative analysis, scheme-specific performance.",
    reference: "VRL-ACCURACY-2026",
    date: "March 2026",
    status: "published",
    icon: CheckCircle2,
    color: "#10B981",
  },
  // === POLICY ===
  {
    title: "Information Security Policy",
    category: "policy",
    description: "Comprehensive information security policy covering access control, encryption, incident response, business continuity, and third-party risk management.",
    reference: "VRL-ISP-001",
    date: "March 2026",
    status: "published",
    icon: Shield,
    color: "#1D3443",
  },
  {
    title: "Business Continuity Plan",
    category: "policy",
    description: "Disaster recovery, data backup, failover procedures, RPO/RTO targets, incident escalation, and communication plan.",
    reference: "VRL-BCP-001",
    date: "March 2026",
    status: "published",
    icon: AlertTriangle,
    color: "#F59E0B",
  },
  {
    title: "Key Rotation Policy",
    category: "policy",
    description: "API key management, rotation schedules, credential lifecycle, secrets management, and revocation procedures.",
    reference: "VRL-KRP-001",
    date: "March 2026",
    status: "published",
    icon: Lock,
    color: "#6366F1",
  },
  {
    title: "Secure SDLC Documentation",
    category: "policy",
    description: "Secure software development lifecycle: code review, dependency scanning, security testing, deployment controls, and vulnerability management.",
    reference: "VRL-SDLC-001",
    date: "March 2026",
    status: "published",
    icon: Code2,
    color: "#10B981",
  },
  // === LEGAL ===
  {
    title: "Data Processing Agreement (Template)",
    category: "legal",
    description: "Draft DPA between VRL and Netcare covering processing purposes, sub-processor disclosure, breach notification, audit rights, and data deletion on termination.",
    reference: "VRL-DPA-2026",
    date: "March 2026",
    status: "draft",
    icon: FileText,
    color: "#64748B",
  },
  {
    title: "Mutual Non-Disclosure Agreement",
    category: "legal",
    description: "Standard mutual NDA for confidential information exchange between VRL and Netcare during the evaluation and pilot phases.",
    reference: "VRL-NDA-2026",
    date: "March 2026",
    status: "published",
    icon: Lock,
    color: "#1D3443",
  },
  {
    title: "Consulting Services Agreement",
    category: "legal",
    description: "Master services agreement template for the pilot engagement. Covers scope, SLAs, liability, IP ownership, and termination.",
    reference: "VRL-CSA-2026",
    date: "March 2026",
    status: "draft",
    icon: FileText,
    color: "#64748B",
  },
  {
    title: "Enterprise Compliance Pack",
    category: "legal",
    description: "Consolidated compliance bundle: POPIA, HPCSA, King V, SAHPRA, ISO 27001 alignment, CareConnect readiness. Single document for vendor due diligence.",
    reference: "VRL-ECP-2026",
    date: "March 2026",
    status: "published",
    icon: Shield,
    color: "#10B981",
    badge: "COMPLETE",
  },
];

export default function ResourcesPage() {
  const [category, setCategory] = useState<DocCategory>("all");
  const [search, setSearch] = useState("");

  const filtered = DOCUMENTS.filter(d => {
    if (category !== "all" && d.category !== category) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: DOCUMENTS.length,
    compliance: DOCUMENTS.filter(d => d.category === "compliance").length,
    research: DOCUMENTS.filter(d => d.category === "research").length,
    technical: DOCUMENTS.filter(d => d.category === "technical").length,
    policy: DOCUMENTS.filter(d => d.category === "policy").length,
    legal: DOCUMENTS.filter(d => d.category === "legal").length,
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,169,209,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(61,169,209,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#3DA9D1] uppercase tracking-[0.3em]">Visio Research Labs</div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Resources & Research Library</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Compliance documentation, research papers, technical specifications, and legal templates.
            All documents prepared for Netcare AI Committee and stakeholder review.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Documents", count: counts.all, color: "#3DA9D1" },
            { label: "Compliance", count: counts.compliance, color: "#10B981" },
            { label: "Research Papers", count: counts.research, color: "#8B5CF6" },
            { label: "Technical", count: counts.technical, color: "#6366F1" },
            { label: "Policies", count: counts.policy, color: "#F59E0B" },
            { label: "Legal", count: counts.legal, color: "#64748B" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#3DA9D1]/50"
            />
          </div>
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-max">
            {(["all", "compliance", "research", "technical", "policy", "legal"] as DocCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  category === cat ? "bg-[#3DA9D1]/20 text-[#3DA9D1] border border-[#3DA9D1]/30" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat} ({counts[cat]})
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((doc, i) => {
            const Icon = doc.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${doc.color}15`, color: doc.color, border: `1px solid ${doc.color}25` }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white text-sm">{doc.title}</h3>
                      {doc.badge && (
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${doc.color}20`, color: doc.color, border: `1px solid ${doc.color}30` }}>{doc.badge}</span>
                      )}
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        doc.status === "published" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        doc.status === "draft" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>{doc.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{doc.reference}</span>
                        <span>{doc.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.link && (
                          <Link href={doc.link} className="flex items-center gap-1 text-[10px] font-bold text-[#3DA9D1] hover:text-[#3DA9D1]/80 transition-colors">
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                        )}
                        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 rounded-xl bg-[#3DA9D1]/10 border border-[#3DA9D1]/20">
          <p className="text-xs text-[#3DA9D1] font-bold">All documents are prepared by Visio Research Labs for Netcare stakeholder review. Compliance documents reflect the platform state as deployed at healthos.visiocorp.co. For questions or document requests, contact davidhampton@visiocorp.co</p>
        </div>
      </div>
    </div>
  );
}
