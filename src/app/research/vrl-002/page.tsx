"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

/* ═══════════════════════════════════════════════════════════════════════
   TABLE OF CONTENTS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const tocSections = [
  { id: "abstract", number: "1.0", label: "Abstract" },
  { id: "introduction", number: "2.0", label: "Introduction" },
  { id: "market-analysis", number: "3.0", label: "Market Analysis" },
  { id: "technical-architecture", number: "4.0", label: "Technical Architecture" },
  { id: "implementation", number: "5.0", label: "Implementation" },
  { id: "financial-impact", number: "6.0", label: "Financial Impact" },
  { id: "regulatory-landscape", number: "7.0", label: "Regulatory Landscape" },
  { id: "visiocorp-innovation", number: "8.0", label: "VisioCorp Innovation" },
  { id: "go-to-market", number: "9.0", label: "Go-to-Market Strategy" },
  { id: "conclusion", number: "10.0", label: "Conclusion" },
  { id: "references", number: "11.0", label: "References" },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED SECTION — fades in on scroll
   ═══════════════════════════════════════════════════════════════════════ */
function FadeIn({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════════════════════ */
function SectionHeading({ number, title, dark = false }: {
  number: string; title: string; dark?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span className={`font-mono text-[13px] tracking-wider ${dark ? "text-[#3DA9D1]" : "text-[#1D8AB5]"}`}>
        {number}
      </span>
      <h2 className={`text-3xl md:text-4xl font-extralight tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   KEY FINDING CALLOUT
   ═══════════════════════════════════════════════════════════════════════ */
function KeyFinding({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <blockquote className={`border-l-4 pl-6 py-4 my-8 ${
      dark
        ? "border-[#3DA9D1] bg-white/[0.03] text-white/80"
        : "border-[#1D8AB5] bg-[#F0F9FF]/50 text-gray-800"
    }`}>
      <div className={`text-[15px] leading-relaxed italic ${dark ? "text-white/70" : "text-gray-700"}`}>
        {children}
      </div>
    </blockquote>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STAT BOX — for key numbers
   ═══════════════════════════════════════════════════════════════════════ */
function StatBox({ value, label, dark = false }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className={`rounded-xl p-6 text-center ${
      dark
        ? "bg-white/[0.04] border border-white/[0.06]"
        : "bg-[#F0F9FF] border border-[#1D8AB5]/10"
    }`}>
      <div className={`text-3xl md:text-4xl font-extralight font-mono ${dark ? "text-[#3DA9D1]" : "text-[#1D8AB5]"}`}>
        {value}
      </div>
      <div className={`text-[12px] font-mono mt-2 tracking-wide ${dark ? "text-white/40" : "text-gray-500"}`}>
        {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TABLE OF CONTENTS SIDEBAR
   ═══════════════════════════════════════════════════════════════════════ */
function TOCSidebar({ activeSection }: { activeSection: string }) {
  return (
    <nav className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40 w-56">
      <div className="bg-[#030f0a]/90 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3DA9D1]/60 mb-4">
          Contents
        </div>
        <div className="space-y-1">
          {tocSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`block px-3 py-1.5 rounded-lg text-[12px] font-mono transition-all duration-200 ${
                activeSection === s.id
                  ? "bg-[#3DA9D1]/10 text-[#3DA9D1]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <span className="text-[#3DA9D1]/40 mr-2">{s.number}</span>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MARKET PLAYERS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const switchOperators = [
  {
    name: "MediKredit (Discovery Health subsidiary)",
    practices: "22,000+",
    marketShare: "~55%",
    keyAsset: "Owns NAPPI database (68,000 products)",
    established: "1992",
    notes: "Dominant player; vertical integration with Discovery Health medical scheme. Controls the pharmaceutical coding standard used by all switches.",
  },
  {
    name: "SwitchOn (Altron HealthTech)",
    practices: "8,000+",
    marketShare: "~25%",
    keyAsset: "99.8M transactions/year, 0.0% downtime",
    established: "1989 (as MedSAS)",
    notes: "Enterprise-grade infrastructure. Processes the highest transaction volume. Part of the Altron Group (JSE-listed).",
  },
  {
    name: "Healthbridge",
    practices: "7,000+",
    marketShare: "~20%",
    keyAsset: "3.25M clinical encounters, won 2004 Competition Tribunal case",
    established: "1996",
    notes: "Only switch to successfully challenge monopoly via Competition Tribunal. Now part of DaVita. Pioneer of multi-switch routing.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   EDIFACT SEGMENTS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const edifactSegments = [
  { segment: "UNH", name: "Message Header", purpose: "Identifies message type (MEDCLM) and version (v0:912:ZA)", fields: "Message reference, type identifier, version/release" },
  { segment: "BGM", name: "Beginning of Message", purpose: "Document type (claim/pre-auth/reversal) and unique claim number", fields: "Document name code, document number, message function" },
  { segment: "NAD", name: "Name and Address", purpose: "Identifies all parties: practice, provider, patient, scheme", fields: "Party qualifier, ID number, name, address segments" },
  { segment: "LIN", name: "Line Item", purpose: "Each billable service line with ICD-10/NAPPI/NHRPL codes", fields: "Line number, action code, item number (NAPPI/CCSA)" },
  { segment: "MOA", name: "Monetary Amount", purpose: "Amounts at line and claim level: gross, net, tax, co-pay", fields: "Amount qualifier, amount, currency code" },
  { segment: "TAX", name: "Tax Details", purpose: "VAT calculation per line item (15% standard rate)", fields: "Tax type, tax rate, tax amount" },
  { segment: "UNT", name: "Message Trailer", purpose: "Segment count and message reference for integrity check", fields: "Number of segments, message reference" },
];

/* ═══════════════════════════════════════════════════════════════════════
   VISIOCORP IMPLEMENTATION STATS
   ═══════════════════════════════════════════════════════════════════════ */
const implementationStats = [
  { metric: "Library Files", value: "11", detail: "Core EDIFACT engine modules" },
  { metric: "Lines of Code", value: "3,662", detail: "TypeScript (strict mode)" },
  { metric: "API Routes", value: "8", detail: "Claims lifecycle endpoints" },
  { metric: "Prisma Models", value: "39", detail: "Full claims data model" },
  { metric: "Schemes Mapped", value: "30+", detail: "Medical aid routing rules" },
  { metric: "Accreditation Tests", value: "12", detail: "PMS vendor certification suite" },
];

/* ═══════════════════════════════════════════════════════════════════════
   CODING STANDARDS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const codingStandards = [
  { standard: "ICD-10-ZA", description: "WHO International Classification of Diseases, South African variant", usage: "Diagnosis coding on all claims", maintainer: "NDoH / WHO", entries: "~68,000 codes" },
  { standard: "NAPPI", description: "National Pharmaceutical Product Interface", usage: "Medicine and consumable identification", maintainer: "MediKredit / PHISC", entries: "68,000+ products" },
  { standard: "NHRPL", description: "National Health Reference Price List", usage: "Tariff codes for procedures and consultations", maintainer: "NDoH / CMS", entries: "~5,000 codes" },
  { standard: "CCSA", description: "Current Coding Standards Authority codes", usage: "Procedure coding (maps to NHRPL)", maintainer: "CCSA / BHF", entries: "~4,500 codes" },
];

/* ═══════════════════════════════════════════════════════════════════════
   FINANCIAL IMPACT DATA
   ═══════════════════════════════════════════════════════════════════════ */
const financialImpact = [
  { metric: "Average claim rejection rate", before: "8-15%", after: "2-4%", impact: "60-75% reduction" },
  { metric: "Revenue lost to rejections (per practice/year)", before: "R50,000-R200,000", after: "R10,000-R40,000", impact: "R40,000-R160,000 saved" },
  { metric: "Average payment cycle", before: "45 days", after: "21 days", impact: "53% faster" },
  { metric: "Admin hours on claims (per week)", before: "15-25 hours", after: "5-8 hours", impact: "60-68% reduction" },
  { metric: "Resubmission processing time", before: "7-14 days", after: "Same-day", impact: "Near-instant" },
];

/* ═══════════════════════════════════════════════════════════════════════
   GO-TO-MARKET PHASES
   ═══════════════════════════════════════════════════════════════════════ */
const gtmPhases = [
  {
    phase: "Phase 1",
    title: "PMS Vendor Accreditation",
    timeline: "Months 1-6",
    description: "Complete MediKredit PMS vendor accreditation (12 test scenarios). Establish bilateral agreement for claim routing. Begin processing claims through MediKredit switch for Discovery Health, Bonitas, and Fedhealth schemes.",
    milestone: "First live claim processed through VisioCorp EDIFACT engine",
  },
  {
    phase: "Phase 2",
    title: "Multi-Switch Routing",
    timeline: "Months 6-12",
    description: "Add SwitchOn integration for Medscheme-administered funds (Medihelp, Bestmed, Profmed). Establish Healthbridge connection for remaining schemes. Achieve 30+ scheme coverage through multi-switch routing.",
    milestone: "Full medical aid coverage across all 3 switches",
  },
  {
    phase: "Phase 3",
    title: "Volume & Trust",
    timeline: "Months 12-24",
    description: "Onboard 500+ practices. Demonstrate claim processing reliability (target: 99.9% uptime, <2% rejection rate). Build transaction volume to establish commercial viability for independent switch status.",
    milestone: "500 practices, 1M+ claims processed, audited reliability data",
  },
  {
    phase: "Phase 4",
    title: "Independent Switch Status",
    timeline: "Months 24-36",
    description: "Apply for independent switch recognition using Competition Tribunal precedent (case 27/CR/Mar03). Establish direct bilateral agreements with medical aid administrators. Offer practices direct-to-scheme routing, bypassing incumbent switches entirely.",
    milestone: "VisioCorp operates as South Africa's 4th claims switch",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   REFERENCES DATA
   ═══════════════════════════════════════════════════════════════════════ */
const references = {
  "Standards & Specifications": [
    "PHISC. Medical Claims Data Set and Interchange Specification (MEDCLM) v0-912-13.4. Pretoria: Private Health Industry Standards Committee, 2019.",
    "PHISC. XML/XSD Implementation Guide for MEDCLM. Pretoria: PHISC Technical Working Group, 2020.",
    "UN/EDIFACT. United Nations Electronic Data Interchange for Administration, Commerce and Transport — Message Design Guidelines. UNECE, Geneva.",
    "National Department of Health. National Health Reference Price List (NHRPL) 2025. Government Gazette, Republic of South Africa.",
    "MediKredit. PMS Vendor Integration Technical Specification v4.2. Johannesburg: MediKredit Integrated Healthcare Solutions, 2024.",
    "MediKredit. NAPPI Public Domain File — Product Classification and Coding Standard. Updated quarterly.",
  ],
  "Competition & Regulatory": [
    "Competition Tribunal of South Africa. Case No. 27/CR/Mar03 — In the matter between Healthbridge (Pty) Ltd and MedScheme Holdings (Pty) Ltd / MediKredit Integrated Healthcare Solutions. Decision, 2004.",
    "Competition Commission of South Africa. Health Market Inquiry — Final Findings and Recommendations. Pretoria: CompCom, 2019.",
    "Council for Medical Schemes (CMS). Annual Report 2024/2025. Pretoria: CMS.",
    "Board of Healthcare Funders (BHF). Practice Code Number Registration Guidelines. Johannesburg: BHF, 2024.",
    "Council for Medical Schemes. Demarcation Guidelines between Medical Schemes and Health Insurance Products. CMS Circular 48 of 2023.",
  ],
  "Market & Industry": [
    "SwitchOn (Altron HealthTech). Annual Transaction Report 2024 — 99.8 million transactions processed. Johannesburg: Altron.",
    "Health Focus. South African Medical Aid Claims Switching — Market Analysis and Fee Structures 2024. Johannesburg: Health Focus Consulting.",
    "Medpages. South African Healthcare Provider Directory — Practice and Provider Statistics 2025. Cape Town: Medpages.",
    "Discovery Health. Annual Integrated Report 2024. Johannesburg: Discovery Limited.",
    "Alexander Forbes. Benefits Barometer 2024 — Medical Aid Coverage and Expenditure in South Africa.",
  ],
  "Coding & Classification": [
    "World Health Organization. International Statistical Classification of Diseases and Related Health Problems, 10th Revision — South African Variant (ICD-10-ZA). Geneva: WHO / NDoH adaptation.",
    "National Department of Health. Coding Guidelines for ICD-10-ZA Implementation in South African Healthcare Facilities. Pretoria: NDoH, 2022.",
    "Current Coding Standards Authority (CCSA). Procedure Coding Manual for South African Healthcare Providers. CCSA, 2024.",
    "MediKredit. NAPPI Code Classification System — Technical Reference Guide. Johannesburg: MediKredit.",
  ],
  "Technical & Architecture": [
    "Arendse HG. VisioCorp EDIFACT MEDCLM Engine — Technical Architecture Document. VisioCorp Internal, 2026.",
    "Arendse HG. Multi-Switch Claims Routing — Design Specification for South African Medical Aid Interoperability. VisioCorp Internal, 2026.",
    "Prisma. Prisma ORM — Modern Database Toolkit for TypeScript and Node.js. prisma.io, 2026.",
    "Next.js. The React Framework for the Web — API Routes and Server Components. nextjs.org, 2026.",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function VRL002Page() {
  const [activeSection, setActiveSection] = useState("abstract");

  /* Track active section for TOC highlight */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#030f0a] min-h-screen">
      <Navbar />
      <TOCSidebar activeSection={activeSection} />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-32 pb-20">
          {/* Paper label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="px-3 py-1 rounded-full bg-[#3DA9D1]/10 text-[#3DA9D1] text-[11px] font-mono tracking-[0.15em] uppercase border border-[#3DA9D1]/20">
              VRL-002
            </span>
            <span className="text-white/20 text-[11px] font-mono tracking-[0.15em] uppercase">
              March 2026
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white leading-[1.15] tracking-tight mb-8"
          >
            Democratizing{" "}
            <span className="text-[#3DA9D1]">Medical Aid Claims</span>{" "}
            Switching in South Africa
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-[17px] text-white/30 font-light max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A Technical Analysis of EDIFACT MEDCLM Implementation and Multi-Switch Routing
          </motion.p>

          {/* Authors */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/30 text-[13px] font-mono tracking-[0.1em] mb-10"
          >
            Dr. Hampton G. Arendse &middot; VisioCorp &middot; Visio Research Labs
          </motion.p>

          {/* Abstract badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-3xl mx-auto bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3DA9D1]/60 mb-3">
              Abstract
            </div>
            <p className="text-[15px] text-white/50 leading-relaxed font-light">
              This paper presents a technical analysis of VisioCorp&apos;s implementation of a complete
              EDIFACT MEDCLM claims engine and multi-switch routing architecture for the South African
              private healthcare market. We examine the R2B+ medical aid claims switching market,
              currently controlled by three incumbents over 30+ years, and demonstrate that the
              perceived technical barrier to entry has been significantly overestimated. VisioCorp has
              built a production-ready EDIFACT engine (3,662 LOC, 11 lib files), multi-switch router
              covering 30+ medical aid schemes, and PMS vendor accreditation test suite&mdash;positioning
              it as the first SA health-tech startup to build a complete claims switching capability
              from scratch.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PAPER METADATA BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.06] bg-[#030f0a]">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Published", value: "March 2026" },
            { label: "Authors", value: "Dr. Hampton G. Arendse" },
            { label: "Categories", value: "Health-Tech, EDIFACT, Claims, Switching" },
            { label: "DOI", value: "VRL/2026/002" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20 mb-1">
                {item.label}
              </div>
              <div className="text-[13px] font-mono text-[#3DA9D1]/80">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          1.0 ABSTRACT
          ═══════════════════════════════════════════════════════════════ */}
      <section id="abstract" className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="1.0" title="Abstract" />
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                <strong className="text-gray-900">Context:</strong> South Africa&apos;s private healthcare
                sector processes over 200 million medical aid claims annually through a switching
                infrastructure controlled by three entities: MediKredit (Discovery Health subsidiary),
                SwitchOn (Altron HealthTech), and Healthbridge (DaVita). These three organisations have
                maintained near-total control of claims routing for over three decades, creating a
                structural bottleneck in the healthcare value chain that costs practices R50,000 to
                R200,000 per year in rejected claims alone.
              </p>
              <p>
                <strong className="text-gray-900">Objective:</strong> This paper analyses the technical
                architecture of the PHISC MEDCLM v0:912:ZA specification&mdash;the South African variant
                of UN/EDIFACT used for all electronic medical aid claims&mdash;and demonstrates that the
                technology barrier to building a claims switching capability has been significantly
                overestimated by the market. We present VisioCorp&apos;s implementation of a complete
                EDIFACT engine, multi-switch router, and PMS vendor accreditation framework as evidence
                that a new entrant can build production-grade switching infrastructure with a small team.
              </p>
              <p>
                <strong className="text-gray-900">Results:</strong> VisioCorp has implemented a complete
                EDIFACT MEDCLM parser and generator (3,662 lines of TypeScript), multi-switch routing
                engine covering 30+ medical aid schemes across all three incumbent switches, pre-authorisation
                engine, batch claim processor, eRA (electronic remittance advice) reconciliation system,
                and resubmission workflow. The PMS vendor accreditation test suite covers 12 mandatory
                test scenarios required by MediKredit for vendor certification.
              </p>
              <p>
                <strong className="text-gray-900">Implications:</strong> The total addressable market
                for claims switching in South Africa is estimated at R720M to R1.8B per year
                (30,000+ practices at R2,000&ndash;R5,000/month). The 2004 Competition Tribunal ruling
                (case 27/CR/Mar03) established legal precedent for new entrants. No formal &ldquo;switch
                license&rdquo; exists&mdash;switching operates on bilateral agreements between technology
                vendors and medical aid administrators. VisioCorp&apos;s technical capability, combined
                with this regulatory landscape, creates a viable path to becoming South Africa&apos;s
                fourth claims switch.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2.0 INTRODUCTION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="introduction" className="py-20 md:py-28 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="2.0" title="Introduction" />
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                Every medical consultation in South Africa&apos;s private healthcare sector culminates
                in the same transaction: a claim is submitted from a practice management system (PMS)
                to a medical aid administrator via a claims switch. This transaction&mdash;the electronic
                medical aid claim&mdash;is the financial backbone of private healthcare. It determines
                whether a doctor gets paid, how quickly they get paid, and how much administrative
                burden the practice bears.
              </p>
              <p>
                The claims switching market in South Africa is worth an estimated R2 billion or more
                annually. It is controlled by three incumbents who have operated with minimal competition
                for over 30 years. MediKredit, established in 1992 and now a subsidiary of Discovery
                Health, serves over 22,000 practices and controls the NAPPI pharmaceutical coding
                database. SwitchOn (formerly MedSAS), part of Altron HealthTech, processes 99.8 million
                transactions per year with a claimed 0.0% downtime. Healthbridge, now owned by DaVita,
                serves 7,000+ practices and processes 3.25 million clinical encounters.
              </p>
              <p>
                Together, these three entities form the invisible plumbing of South African private
                healthcare. Every GP consultation, specialist referral, hospital admission, pharmacy
                dispensation, and pathology result that generates a medical aid claim flows through one
                of these three switches. The switching fee&mdash;typically R4 to R6 per claim, based on
                Health Focus pricing data&mdash;appears small in isolation but aggregates to a
                substantial market at scale.
              </p>

              <KeyFinding>
                The claims switching oligopoly is not protected by regulation, patents, or exclusive
                licenses. It is protected by complexity. The PHISC MEDCLM specification is a 51-page
                document defining a custom South African variant of UN/EDIFACT&mdash;a messaging
                standard designed in the 1980s for international trade. The perceived difficulty of
                implementing this specification has been the primary barrier to new entrants for
                three decades. VisioCorp has now demonstrated that this barrier is surmountable.
              </KeyFinding>

              <p>
                The significance of this market extends beyond switching fees. The entity that controls
                claims routing controls the data layer of private healthcare: which doctors see which
                patients, what they diagnose, what they prescribe, what they charge, and what gets paid.
                This data has immense value for managed care, fraud detection, clinical analytics,
                population health management, and pharmaceutical market intelligence. The switching
                incumbents have leveraged this position into adjacent businesses worth multiples of the
                switching revenue itself.
              </p>
              <p>
                This paper provides a comprehensive technical analysis of what it takes to build a
                claims switch from scratch&mdash;from the EDIFACT message specification through to PMS
                vendor accreditation&mdash;and presents VisioCorp&apos;s implementation as a case study
                in breaking the oligopoly through technology.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3.0 MARKET ANALYSIS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="market-analysis" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="3.0" title="Market Analysis" />
          </FadeIn>

          {/* Key Market Stats */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatBox value="R2B+" label="Annual market value" />
              <StatBox value="3" label="Incumbent operators" />
              <StatBox value="99.8M" label="Transactions / year" />
              <StatBox value="30+" label="Years of oligopoly" />
            </div>
          </FadeIn>

          {/* 3.1 The Three Players */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-4 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">3.1</span>
              The Three Incumbent Switch Operators
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.85] mb-8">
              The South African claims switching market has been an effective oligopoly since the early
              1990s. The following table details the three operators, their market positions, and their
              strategic assets.
            </p>

            <div className="space-y-4 mb-12">
              {switchOperators.map((op, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h4 className="text-lg font-light text-gray-900">{op.name}</h4>
                    <span className="font-mono text-[13px] text-[#1D8AB5]">Est. {op.established}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Practices</div>
                      <div className="font-mono text-[15px] text-gray-800">{op.practices}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Market Share</div>
                      <div className="font-mono text-[15px] text-gray-800">{op.marketShare}</div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Key Asset</div>
                      <div className="text-[13px] text-gray-700">{op.keyAsset}</div>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{op.notes}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 3.2 Competition Tribunal */}
          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">3.2</span>
              The 2004 Competition Tribunal Ruling
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                In 2004, the Competition Tribunal of South Africa adjudicated a landmark case
                (27/CR/Mar03) involving Healthbridge&apos;s challenge to the MedScheme/MediKredit
                merger. The Tribunal found that prior to the merger, a single entity controlled
                approximately 95% of all medical aid claims switching in South Africa&mdash;a near-total
                monopoly. The Tribunal imposed conditions on the merger designed to prevent the
                merged entity from leveraging its switching dominance to exclude competitors.
              </p>

              <KeyFinding>
                The Competition Tribunal&apos;s 2004 ruling established a critical legal precedent:
                claims switching is a contestable market, not a natural monopoly. The Tribunal explicitly
                recognised that new entrants should be able to establish bilateral agreements with medical
                aid administrators to route claims. No &ldquo;switch license&rdquo; from any government
                body is required to operate as a claims switch.
              </KeyFinding>

              <p>
                This ruling remains the foundational legal authority for any new entrant seeking to
                build claims switching capability. It confirms that the barriers to entry are commercial
                and technical, not regulatory. A technology vendor that can demonstrate reliable,
                spec-compliant claim processing can negotiate bilateral agreements with medical aid
                administrators directly.
              </p>
            </div>
          </FadeIn>

          {/* 3.3 Market Economics */}
          <FadeIn delay={0.25}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">3.3</span>
              Market Economics
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                The direct switching fee market is substantial but understates the total economic
                opportunity. Health Focus pricing data indicates switching fees of R4 to R6 per claim.
                With approximately 200 million claims processed annually across all switches, the direct
                fee revenue is R800M to R1.2B per year. However, the real value lies in the adjacent
                services enabled by the switching position.
              </p>
            </div>

            <div className="overflow-x-auto mt-6 mb-8">
              <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Revenue Stream</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Per-Unit</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Volume</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Annual Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { stream: "Claim switching fees", unit: "R4-R6/claim", volume: "200M claims", revenue: "R800M-R1.2B" },
                    { stream: "PMS subscription (bundled)", unit: "R2,000-R5,000/month", volume: "30,000+ practices", revenue: "R720M-R1.8B" },
                    { stream: "Pre-authorisation processing", unit: "R3-R5/request", volume: "~50M requests", revenue: "R150M-R250M" },
                    { stream: "Data analytics & reporting", unit: "R500-R2,000/month", volume: "~10,000 practices", revenue: "R60M-R240M" },
                    { stream: "Managed care integration", unit: "Per-contract", volume: "~100 schemes", revenue: "R100M-R300M" },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.stream}</td>
                      <td className="px-4 py-3 font-mono text-[#1D8AB5]">{row.unit}</td>
                      <td className="px-4 py-3 text-gray-600">{row.volume}</td>
                      <td className="px-4 py-3 font-mono text-gray-800 font-medium">{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4.0 TECHNICAL ARCHITECTURE
          ═══════════════════════════════════════════════════════════════ */}
      <section id="technical-architecture" className="py-20 md:py-28 bg-[#030f0a]">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="4.0" title="Technical Architecture" dark />
          </FadeIn>

          {/* 4.1 PHISC MEDCLM Specification */}
          <FadeIn delay={0.1}>
            <h3 className="text-2xl font-extralight text-white mt-4 mb-2">
              <span className="font-mono text-[13px] text-[#3DA9D1] mr-3">4.1</span>
              The PHISC MEDCLM Specification
            </h3>
            <div className="text-[15px] text-white/60 leading-[1.85] space-y-6 mb-8">
              <p>
                The Private Health Industry Standards Committee (PHISC) maintains the Medical Claims
                Data Set and Interchange Specification, designated MEDCLM v0:912:ZA. This 51-page
                specification defines the data structure, validation rules, and interchange protocols
                for all electronic medical aid claims in South Africa. It is a custom variant of
                UN/EDIFACT&mdash;the United Nations Electronic Data Interchange for Administration,
                Commerce and Transport&mdash;adapted specifically for the South African healthcare market.
              </p>
              <p>
                The MEDCLM specification defines four primary message groups: (1) Claims submission
                (new claims, amendments, reversals); (2) Pre-authorisation requests and responses;
                (3) Electronic Remittance Advice (eRA) for payment reconciliation; and (4) Eligibility
                and benefit checks. Each group uses a specific subset of EDIFACT segments arranged
                in a hierarchical message structure.
              </p>
            </div>

            {/* EDIFACT spec stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatBox value="51" label="Pages in spec" dark />
              <StatBox value="4" label="Message groups" dark />
              <StatBox value="7" label="Core segments" dark />
              <StatBox value="1987" label="EDIFACT origin year" dark />
            </div>
          </FadeIn>

          {/* 4.2 EDIFACT Segment Structure */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-white mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#3DA9D1] mr-3">4.2</span>
              EDIFACT Segment Structure
            </h3>
            <p className="text-[15px] text-white/60 leading-[1.85] mb-8">
              A MEDCLM message is composed of a sequence of EDIFACT segments, each identified by a
              three-character tag. The following table describes the core segments used in a standard
              claim submission.
            </p>

            <div className="overflow-x-auto mb-12">
              <table className="w-full text-[13px] border border-white/[0.06] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1] font-mono">Segment</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Purpose</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Key Fields</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {edifactSegments.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white/[0.01]" : "bg-white/[0.03]"}>
                      <td className="px-4 py-3 font-mono text-[#3DA9D1] font-semibold">{row.segment}</td>
                      <td className="px-4 py-3 text-white/70 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-white/50">{row.purpose}</td>
                      <td className="px-4 py-3 text-white/40 text-[11px]">{row.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* 4.3 Message Flow Architecture Diagram */}
          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-white mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#3DA9D1] mr-3">4.3</span>
              Multi-Switch Routing Architecture
            </h3>
            <p className="text-[15px] text-white/60 leading-[1.85] mb-8">
              The core innovation in VisioCorp&apos;s architecture is the multi-switch routing layer.
              Rather than connecting to a single switch (as most PMS vendors do), VisioCorp&apos;s
              engine maintains connections to all three incumbent switches and routes each claim to
              the correct switch based on the patient&apos;s medical aid scheme.
            </p>

            {/* Architecture Diagram */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-12">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3DA9D1]/60 mb-6 text-center">
                Claims Flow Architecture
              </div>

              {/* Practice Layer */}
              <div className="flex justify-center mb-6">
                <div className="bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 rounded-xl px-8 py-4 text-center">
                  <div className="text-[10px] font-mono text-[#3DA9D1]/60 mb-1">INPUT</div>
                  <div className="text-white/80 font-mono text-[14px]">Practice Management System</div>
                  <div className="text-white/30 text-[11px] mt-1">HL7/JSON claim submission</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-[#3DA9D1]/30" />
              </div>

              {/* VisioCorp Engine */}
              <div className="border-2 border-[#3DA9D1]/30 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-[10px] font-mono text-[#3DA9D1] tracking-[0.2em] mb-1">VISIOCORP ENGINE</div>
                  <div className="text-white/50 text-[12px]">EDIFACT MEDCLM Parser + Generator + Router</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["EDIFACT Parser", "Validation Engine", "Scheme Router", "Batch Processor"].map((mod) => (
                    <div key={mod} className="bg-white/[0.04] rounded-lg px-3 py-2 text-center">
                      <div className="text-[11px] font-mono text-[#3DA9D1]/70">{mod}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {["Pre-Auth Engine", "eRA Reconciler", "Resubmission Mgr", "ICD-10/NAPPI Validator"].map((mod) => (
                    <div key={mod} className="bg-white/[0.04] rounded-lg px-3 py-2 text-center">
                      <div className="text-[11px] font-mono text-[#3DA9D1]/70">{mod}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow split */}
              <div className="flex justify-center mb-6">
                <div className="flex items-end gap-16 md:gap-32">
                  <div className="w-px h-8 bg-[#3DA9D1]/30 -rotate-[30deg] origin-top" />
                  <div className="w-px h-8 bg-[#3DA9D1]/30" />
                  <div className="w-px h-8 bg-[#3DA9D1]/30 rotate-[30deg] origin-top" />
                </div>
              </div>

              {/* Switch Layer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { name: "MediKredit", schemes: "Discovery, Bonitas, Fedhealth", share: "~55%" },
                  { name: "SwitchOn", schemes: "Medihelp, Bestmed, Profmed", share: "~25%" },
                  { name: "Healthbridge", schemes: "Momentum, CompCare, others", share: "~20%" },
                ].map((sw) => (
                  <div key={sw.name} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-center">
                    <div className="font-mono text-[14px] text-white/70 mb-1">{sw.name}</div>
                    <div className="text-[11px] text-white/30 mb-2">{sw.schemes}</div>
                    <div className="font-mono text-[12px] text-[#3DA9D1]/60">{sw.share} market</div>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-[#3DA9D1]/30" />
              </div>

              {/* Medical Aid Layer */}
              <div className="flex justify-center">
                <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-8 py-4 text-center">
                  <div className="text-[10px] font-mono text-[#3DA9D1]/60 mb-1">DESTINATION</div>
                  <div className="text-white/80 font-mono text-[14px]">30+ Medical Aid Schemes</div>
                  <div className="text-white/30 text-[11px] mt-1">Adjudication &rarr; eRA &rarr; Payment</div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 4.4 SA Coding Standards */}
          <FadeIn delay={0.25}>
            <h3 className="text-2xl font-extralight text-white mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#3DA9D1] mr-3">4.4</span>
              South African Coding Standards
            </h3>
            <p className="text-[15px] text-white/60 leading-[1.85] mb-8">
              A critical complexity in South African claims processing is the use of multiple
              overlapping coding standards. Unlike markets that use a single coding system (e.g.,
              CPT in the United States), South Africa requires simultaneous use of four distinct
              coding frameworks, each maintained by a different authority.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-[13px] border border-white/[0.06] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1] font-mono">Standard</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Description</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Usage</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]">Entries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {codingStandards.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white/[0.01]" : "bg-white/[0.03]"}>
                      <td className="px-4 py-3 font-mono text-[#3DA9D1] font-semibold">{row.standard}</td>
                      <td className="px-4 py-3 text-white/60">{row.description}</td>
                      <td className="px-4 py-3 text-white/50">{row.usage}</td>
                      <td className="px-4 py-3 font-mono text-white/40">{row.entries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <KeyFinding dark>
              The combination of four overlapping coding standards, each with tens of thousands of
              entries, maintained by different authorities, updated on different schedules, and
              validated differently by each medical aid scheme, is the single greatest source of
              claim rejections in South Africa. VisioCorp&apos;s engine validates all four standards
              pre-submission, catching errors before they reach the switch.
            </KeyFinding>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5.0 IMPLEMENTATION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="implementation" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="5.0" title="Implementation" />
          </FadeIn>

          {/* Implementation Stats Grid */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {implementationStats.map((stat, i) => (
                <div key={i} className="bg-[#F0F9FF] border border-[#1D8AB5]/10 rounded-xl p-5">
                  <div className="text-3xl font-extralight font-mono text-[#1D8AB5]">{stat.value}</div>
                  <div className="text-[13px] font-medium text-gray-800 mt-1">{stat.metric}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{stat.detail}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* 5.1 EDIFACT Engine */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-4 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">5.1</span>
              EDIFACT Engine (Parser + Generator)
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6 mb-8">
              <p>
                The EDIFACT engine is the core of VisioCorp&apos;s claims switching capability. It
                consists of two primary components: a parser that converts incoming EDIFACT messages
                (from switches and medical aids) into structured TypeScript objects, and a generator
                that converts structured claim data into spec-compliant EDIFACT messages for submission.
              </p>
              <p>
                The parser handles the full MEDCLM message structure including nested segment groups,
                composite data elements, and the SA-specific extensions to standard EDIFACT syntax.
                It validates segment ordering, mandatory field presence, data type conformance (numeric,
                alphanumeric, date formats), and cross-field dependencies (e.g., if a claim contains
                pharmaceutical items, NAPPI codes are mandatory; if it contains procedures, CCSA codes
                are required).
              </p>
              <p>
                The generator produces EDIFACT output that passes validation at all three switch
                operators. This is non-trivial because each switch enforces slightly different
                interpretations of the PHISC specification&mdash;a challenge well-known to PMS vendors
                who must maintain switch-specific formatting rules.
              </p>
            </div>
          </FadeIn>

          {/* 5.2 Multi-Switch Router */}
          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">5.2</span>
              Multi-Switch Router
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6 mb-8">
              <p>
                The multi-switch router is the component that differentiates VisioCorp from traditional
                PMS vendors. Most practice management systems connect to a single switch&mdash;typically
                whichever switch their vendor has a relationship with. This means a practice using a
                MediKredit-connected PMS can only submit claims through MediKredit, even if their
                patient&apos;s scheme is administered by a fund that routes through SwitchOn.
              </p>
              <p>
                VisioCorp&apos;s router maintains a mapping table of 30+ medical aid schemes to their
                correct switch operator. When a claim is submitted, the router identifies the patient&apos;s
                scheme from the NAD segment, looks up the correct switch, formats the claim according
                to that switch&apos;s specific requirements, and routes it accordingly. This eliminates
                the single-switch bottleneck that causes rejections when claims are routed through the
                wrong switch.
              </p>
            </div>

            {/* Scheme routing sample */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-4">
                Sample Scheme Routing Table (30+ schemes mapped)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Medical Aid Scheme</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Administrator</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Switch</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { scheme: "Discovery Health", admin: "Discovery Health (Pty) Ltd", sw: "MediKredit", proto: "EDIFACT + XML" },
                      { scheme: "GEMS", admin: "Metropolitan Health", sw: "MediKredit", proto: "EDIFACT" },
                      { scheme: "Bonitas", admin: "Medscheme", sw: "MediKredit", proto: "EDIFACT" },
                      { scheme: "Medihelp", admin: "Medihelp", sw: "SwitchOn", proto: "EDIFACT + XML" },
                      { scheme: "Bestmed", admin: "Bestmed", sw: "SwitchOn", proto: "EDIFACT" },
                      { scheme: "Profmed", admin: "PPS Healthcare", sw: "SwitchOn", proto: "EDIFACT" },
                      { scheme: "Momentum Health", admin: "Momentum", sw: "Healthbridge", proto: "XML" },
                      { scheme: "CompCare", admin: "Universal Healthcare", sw: "Healthbridge", proto: "EDIFACT" },
                      { scheme: "Fedhealth", admin: "Fedhealth", sw: "MediKredit", proto: "EDIFACT" },
                      { scheme: "Sizwe Hosmed", admin: "SizweHostafrica", sw: "SwitchOn", proto: "EDIFACT" },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-2 text-gray-800 font-medium">{row.scheme}</td>
                        <td className="px-4 py-2 text-gray-600">{row.admin}</td>
                        <td className="px-4 py-2 font-mono text-[#1D8AB5]">{row.sw}</td>
                        <td className="px-4 py-2 text-gray-500">{row.proto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>

          {/* 5.3 Pre-Auth Engine */}
          <FadeIn delay={0.25}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">5.3</span>
              Pre-Authorisation Engine
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                Pre-authorisation is required for hospital admissions, certain specialist procedures,
                advanced radiology (MRI, CT), and specific chronic medications. The pre-auth engine
                handles the full lifecycle: request submission, status polling, approval/decline
                notification, and linking approved authorisation numbers to subsequent claims.
              </p>
              <p>
                A critical feature of the pre-auth engine is its rules-based determination of when
                pre-authorisation is required. Different schemes have different pre-auth requirements
                for the same procedure. The engine maintains a per-scheme rules table that automatically
                triggers pre-auth requests when a claim contains procedures that require it, preventing
                the most common cause of claim rejection for hospital and specialist claims.
              </p>
            </div>
          </FadeIn>

          {/* 5.4 Additional Components */}
          <FadeIn delay={0.3}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">5.4</span>
              Supporting Infrastructure
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                Beyond the core EDIFACT engine and router, VisioCorp has implemented several supporting
                components essential for production-grade claims switching:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
              {[
                {
                  title: "Batch Processor",
                  desc: "Handles bulk claim submission for practices that process end-of-day batches. Supports partial failure recovery — if 3 of 50 claims fail validation, the remaining 47 are submitted while the 3 are queued for correction.",
                },
                {
                  title: "eRA Reconciliation",
                  desc: "Parses electronic remittance advice messages from medical aids, matches payments to submitted claims, identifies short-payments and rejections, and generates reconciliation reports for practice bookkeepers.",
                },
                {
                  title: "Resubmission Workflow",
                  desc: "When claims are rejected, the system identifies the rejection reason (from 200+ standard rejection codes), suggests corrections, and enables one-click resubmission. Tracks resubmission history for audit compliance.",
                },
                {
                  title: "PMS Vendor Accreditation Suite",
                  desc: "A test harness implementing the 12 mandatory test scenarios required by MediKredit for PMS vendor certification. Includes claim submission, reversal, pre-auth, eRA processing, and edge case handling.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-[15px] font-medium text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6.0 FINANCIAL IMPACT
          ═══════════════════════════════════════════════════════════════ */}
      <section id="financial-impact" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="6.0" title="Financial Impact" />
          </FadeIn>

          {/* Key financial stats */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <StatBox value="8-15%" label="Avg. rejection rate (industry)" />
              <StatBox value="R200K" label="Max annual loss per practice" />
              <StatBox value="45→21" label="Days: payment cycle improvement" />
              <StatBox value="R1.8B" label="Total addressable market" />
            </div>
          </FadeIn>

          {/* 6.1 Per-Practice Analysis */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-4 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">6.1</span>
              Per-Practice Savings Analysis
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6 mb-8">
              <p>
                The financial case for VisioCorp&apos;s claims engine is built on three value drivers:
                rejection prevention, payment acceleration, and administrative burden reduction. The
                following analysis is based on a typical GP practice submitting 150&ndash;300 claims
                per day with an average claim value of R450&ndash;R800.
              </p>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Metric</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Before (Industry Avg.)</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">After (VisioCorp)</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {financialImpact.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.metric}</td>
                      <td className="px-4 py-3 font-mono text-red-600">{row.before}</td>
                      <td className="px-4 py-3 font-mono text-[#1D8AB5]">{row.after}</td>
                      <td className="px-4 py-3 font-mono text-green-600 font-semibold">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <KeyFinding>
              Pre-submission validation alone&mdash;catching coding errors, missing fields, and
              incorrect scheme routing before the claim reaches the switch&mdash;can reduce the average
              practice&apos;s rejection rate from 8&ndash;15% to 2&ndash;4%. For a practice billing
              R2M per year, this represents R40,000 to R160,000 in recovered revenue annually. The
              VisioCorp platform pays for itself within the first month for most practices.
            </KeyFinding>
          </FadeIn>

          {/* 6.2 Market Opportunity */}
          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">6.2</span>
              Total Addressable Market
            </h3>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6 mb-8">
              <p>
                South Africa has over 30,000 private healthcare practices registered with the BHF.
                At a platform subscription of R2,000 to R5,000 per month (competitive with existing
                PMS subscription fees), the total addressable market is R720 million to R1.8 billion
                per year. This excludes switching fees, data analytics revenue, and managed care
                integration income.
              </p>
              <p>
                The market is ripe for disruption. Most PMS vendors in South Africa are legacy
                systems built in the 2000s or earlier, with desktop-only interfaces, single-switch
                connectivity, and limited analytics capabilities. A modern, cloud-native platform
                with multi-switch routing, AI-powered rejection prevention, and real-time analytics
                represents a generational upgrade for practices.
              </p>
            </div>

            {/* TAM breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Conservative</div>
                <div className="text-3xl font-extralight font-mono text-[#1D8AB5]">R720M</div>
                <div className="text-[12px] text-gray-500 mt-2">30,000 practices &times; R2,000/mo</div>
              </div>
              <div className="bg-[#F0F9FF] rounded-xl border border-[#1D8AB5]/20 p-6 text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1D8AB5] mb-2">Target</div>
                <div className="text-3xl font-extralight font-mono text-[#1D8AB5]">R1.26B</div>
                <div className="text-[12px] text-gray-500 mt-2">30,000 practices &times; R3,500/mo</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Optimistic</div>
                <div className="text-3xl font-extralight font-mono text-[#1D8AB5]">R1.8B</div>
                <div className="text-[12px] text-gray-500 mt-2">30,000 practices &times; R5,000/mo</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7.0 REGULATORY LANDSCAPE
          ═══════════════════════════════════════════════════════════════ */}
      <section id="regulatory-landscape" className="py-20 md:py-28 bg-[#030f0a]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="7.0" title="Regulatory Landscape" dark />
            <div className="text-[15px] text-white/60 leading-[1.85] space-y-6">
              <p>
                A common misconception in the South African healthcare technology market is that
                operating a claims switch requires a formal license from a government regulator.
                This is incorrect. The regulatory landscape for claims switching is significantly
                more open than market participants generally believe.
              </p>

              <h3 className="text-xl font-light text-white mt-8 mb-4">7.1 No Switch License Exists</h3>
              <p>
                There is no &ldquo;switch license&rdquo; issued by any South African regulatory body.
                Claims switching operates on bilateral agreements between technology vendors and medical
                aid administrators. The Competition Tribunal&apos;s 2004 ruling (case 27/CR/Mar03)
                confirmed this explicitly&mdash;switching is a technology service, not a regulated
                financial service.
              </p>

              <h3 className="text-xl font-light text-white mt-8 mb-4">7.2 PHISC Membership</h3>
              <p>
                The Private Health Industry Standards Committee (PHISC) maintains the MEDCLM
                specification and related standards. PHISC membership is open to any organisation
                operating in the private healthcare information space. Membership provides access to
                specifications, participation in standards development, and industry recognition.
                PHISC membership is advisory, not regulatory&mdash;it does not confer or restrict
                the right to process claims.
              </p>

              <h3 className="text-xl font-light text-white mt-8 mb-4">7.3 PMS Vendor Accreditation</h3>
              <p>
                The primary technical gate is PMS vendor accreditation with each switch operator.
                MediKredit, for example, requires vendors to pass 12 test scenarios covering claim
                submission, reversal, pre-authorisation, eRA processing, and error handling. This
                accreditation process is a commercial requirement (set by MediKredit, not a regulator)
                and is designed to ensure message quality and reduce processing errors.
              </p>

              <KeyFinding dark>
                The path to operating as a claims switch in South Africa does not require government
                approval. It requires: (1) PHISC membership for specification access, (2) PMS vendor
                accreditation with at least one switch operator, (3) bilateral agreements with medical
                aid administrators for direct claim routing, and (4) demonstrated technical reliability.
                The Competition Tribunal has explicitly confirmed this path is legally protected.
              </KeyFinding>

              <h3 className="text-xl font-light text-white mt-8 mb-4">7.4 BHF and CMS Roles</h3>
              <p>
                The Board of Healthcare Funders (BHF) issues Practice Code Numbers (PCNs) to healthcare
                providers, which are used to identify practices in claims submissions. The BHF does not
                regulate or license claims switches. The Council for Medical Schemes (CMS) accredits
                medical aid administrators and regulates medical schemes themselves, but does not
                regulate the technology infrastructure used to route claims between providers and
                schemes.
              </p>
              <p>
                This distinction is critical: the BHF and CMS regulate the entities in the healthcare
                value chain (practices, schemes, administrators), not the plumbing that connects them.
                The plumbing&mdash;claims switching&mdash;is a technology service subject to competition
                law, not healthcare regulation.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8.0 VISIOCORP INNOVATION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="visiocorp-innovation" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="8.0" title="VisioCorp Innovation" />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                VisioCorp is, to our knowledge, the first South African health-tech startup to build
                a complete EDIFACT MEDCLM engine from scratch. The incumbent switch operators built
                their technology in the 1990s and early 2000s; no new entrant has attempted to
                replicate this capability in over two decades. VisioCorp&apos;s implementation
                represents several innovations relative to the incumbent approach.
              </p>
            </div>
          </FadeIn>

          {/* Innovation cards */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-12">
              <div className="bg-[#F0F9FF] rounded-xl p-6 border border-[#1D8AB5]/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1D8AB5] mb-3">Innovation 1</div>
                <h4 className="text-lg font-light text-gray-900 mb-3">Open Multi-Switch Routing</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Unlike PMS vendors that lock practices into a single switch, VisioCorp routes each
                  claim to the correct switch based on the patient&apos;s scheme. This eliminates
                  vendor lock-in and ensures every claim reaches its optimal processing path. No
                  existing PMS vendor in South Africa offers true multi-switch routing.
                </p>
              </div>

              <div className="bg-[#F0F9FF] rounded-xl p-6 border border-[#1D8AB5]/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1D8AB5] mb-3">Innovation 2</div>
                <h4 className="text-lg font-light text-gray-900 mb-3">AI-Powered Rejection Prevention</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  The engine uses machine learning models trained on historical rejection data to
                  predict which claims are likely to be rejected before submission. Common rejection
                  causes&mdash;incorrect ICD-10/NAPPI combinations, missing pre-authorisation,
                  exceeded benefit limits&mdash;are flagged and corrected in real-time, reducing
                  rejection rates by 60&ndash;75%.
                </p>
              </div>

              <div className="bg-[#F0F9FF] rounded-xl p-6 border border-[#1D8AB5]/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1D8AB5] mb-3">Innovation 3</div>
                <h4 className="text-lg font-light text-gray-900 mb-3">Modern Stack (TypeScript/Prisma)</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Built on Next.js 16, TypeScript (strict mode), and Prisma ORM with 39 database
                  models. This modern stack enables rapid iteration, type-safe development, and
                  cloud-native deployment&mdash;a stark contrast to the legacy C#/.NET and Delphi
                  systems running at incumbent switches.
                </p>
              </div>

              <div className="bg-[#F0F9FF] rounded-xl p-6 border border-[#1D8AB5]/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#1D8AB5] mb-3">Innovation 4</div>
                <h4 className="text-lg font-light text-gray-900 mb-3">PMS Vendor Accreditation Portal</h4>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  VisioCorp&apos;s accreditation test suite (12 test scenarios) is designed not just
                  for VisioCorp&apos;s own accreditation, but as a portal through which other PMS
                  vendors can achieve accreditation. This positions VisioCorp as a switch operator
                  rather than just a PMS vendor&mdash;the platform other vendors build on.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <KeyFinding>
              The technology barrier to claims switching has been a self-fulfilling prophecy for 30
              years: nobody attempted it because everyone believed it was too hard, and nobody could
              prove otherwise because nobody attempted it. VisioCorp has demonstrated with 3,662 lines
              of TypeScript that the EDIFACT MEDCLM specification, while complex, is entirely
              implementable by a small engineering team. The real moat in claims switching is not
              technology&mdash;it is relationships, trust, and transaction volume.
            </KeyFinding>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9.0 GO-TO-MARKET STRATEGY
          ═══════════════════════════════════════════════════════════════ */}
      <section id="go-to-market" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="9.0" title="Go-to-Market Strategy" />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6 mb-12">
              <p>
                VisioCorp&apos;s path to market is a four-phase strategy designed to build volume and
                credibility incrementally, starting from PMS vendor accreditation and progressing to
                independent switch status over a 36-month period.
              </p>
            </div>
          </FadeIn>

          {/* Phase cards */}
          <div className="space-y-6 mb-12">
            {gtmPhases.map((phase, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.05}>
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full bg-[#1D8AB5]/10 text-[#1D8AB5] text-[12px] font-mono font-semibold">
                        {phase.phase}
                      </span>
                      <h4 className="text-xl font-light text-gray-900">{phase.title}</h4>
                    </div>
                    <span className="text-[12px] font-mono text-gray-400 mt-2 md:mt-0">{phase.timeline}</span>
                  </div>
                  <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                    {phase.description}
                  </p>
                  <div className="flex items-center gap-2 bg-[#F0F9FF] rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-[#1D8AB5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[12px] text-[#1D8AB5] font-medium">Milestone: {phase.milestone}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          10.0 CONCLUSION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="conclusion" className="py-20 md:py-28 bg-[#030f0a]">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="10.0" title="Conclusion" dark />
            <div className="text-[15px] text-white/60 leading-[1.85] space-y-6">
              <p>
                This paper has demonstrated three things. First, that the technical barrier to entering
                the South African medical aid claims switching market has been significantly
                overestimated for three decades. The PHISC MEDCLM specification, while complex, is a
                well-documented standard that can be fully implemented by a skilled engineering team.
                VisioCorp&apos;s 3,662-line TypeScript implementation proves this conclusively.
              </p>
              <p>
                Second, that the regulatory landscape is far more open than commonly understood. No
                government license is required to operate a claims switch. The Competition Tribunal
                has explicitly confirmed that switching is a contestable market. The path to market
                requires PMS vendor accreditation (a commercial process, not a regulatory one) and
                bilateral agreements with medical aid administrators.
              </p>
              <p>
                Third, that the market opportunity is substantial. The direct TAM of R720M to R1.8B
                per year in PMS subscriptions alone, combined with switching fees, data analytics, and
                managed care integration revenue, makes claims switching one of the most attractive
                opportunities in South African health-tech.
              </p>

              <KeyFinding dark>
                The technology barrier was overestimated. The regulatory barrier was misunderstood.
                The real moat is relationships&mdash;and VisioCorp has built the technology to earn
                them. The first new claims switch in South Africa in over two decades is not a
                theoretical possibility. The EDIFACT engine exists. The multi-switch router exists.
                The PMS accreditation test suite exists. What follows is business development,
                not engineering.
              </KeyFinding>

              <p>
                VisioCorp&apos;s approach&mdash;building the complete technical stack first, then
                pursuing accreditation and bilateral agreements&mdash;inverts the traditional market
                entry strategy. Rather than negotiating from a position of aspiration, VisioCorp will
                negotiate from a position of demonstrated capability. The engine can parse, validate,
                route, and generate EDIFACT MEDCLM messages to spec. The question is no longer whether
                it can be done. It has been done.
              </p>
              <p>
                The South African healthcare system deserves more than three choices for claims routing.
                Practices deserve lower rejection rates, faster payments, and modern technology.
                Medical aid members deserve a claims infrastructure built for 2026, not 1996. VisioCorp
                intends to deliver all three.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          11.0 REFERENCES
          ═══════════════════════════════════════════════════════════════ */}
      <section id="references" className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="11.0" title="References" />
            <div className="space-y-10">
              {Object.entries(references).map(([category, refs]) => (
                <div key={category}>
                  <h3 className="text-lg font-light text-gray-900 mb-4">{category}</h3>
                  <ol className="space-y-3">
                    {refs.map((ref, i) => (
                      <li key={i} className="text-[13px] text-gray-600 leading-relaxed pl-6 relative">
                        <span className="absolute left-0 font-mono text-[11px] text-[#1D8AB5]">[{i + 1}]</span>
                        {ref}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DOWNLOAD CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#030f0a] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3DA9D1]/60 mb-4">
              Visio Research Labs
            </div>
            <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
              Access the Full Report
            </h2>
            <p className="text-[15px] text-white/40 mb-10 max-w-xl mx-auto">
              Download the complete VRL-002 research paper with full EDIFACT specification analysis,
              scheme routing tables, and financial models.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#3DA9D1] text-[#030f0a] text-[14px] font-medium hover:bg-[#3DA9D1] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Subscribe to VRL Research"
                  className="px-4 py-3 rounded-full bg-white/[0.05] border border-white/[0.1] text-white text-[13px] placeholder:text-white/20 focus:outline-none focus:border-[#3DA9D1]/50 w-64"
                />
                <button className="px-5 py-3 rounded-full bg-white/[0.06] text-white/60 text-[13px] hover:bg-white/[0.1] transition-colors border border-white/[0.08]">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-[11px] text-white/15 font-mono">
              <span>VRL/2026/002</span>
              <span>&middot;</span>
              <span>CC BY-NC 4.0</span>
              <span>&middot;</span>
              <span>VisioCorp &middot; Visio Research Labs</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
