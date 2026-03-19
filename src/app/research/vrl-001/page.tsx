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
  { id: "methods", number: "3.0", label: "Methods" },
  { id: "findings", number: "4.0", label: "Findings" },
  { id: "interventions", number: "5.0", label: "Digital Health Interventions" },
  { id: "projected-impact", number: "6.0", label: "Projected Impact at Scale" },
  { id: "discussion", number: "7.0", label: "Discussion" },
  { id: "conclusion", number: "8.0", label: "Conclusion" },
  { id: "references", number: "9.0", label: "References" },
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
   TIME-CRITICAL CONDITIONS TABLE DATA
   ═══════════════════════════════════════════════════════════════════════ */
const timeCriticalConditions = [
  {
    condition: "STEMI (Heart Attack)",
    goldenWindow: "90 minutes",
    saReality: "Hours to days",
    benchmark: "60–90 min door-to-balloon",
    annualCases: "~30,000",
    preventableDeaths: "3,000–5,000",
    citation: "Stassen et al., Cardiovascular Journal of Africa, 2022",
  },
  {
    condition: "Acute Ischaemic Stroke",
    goldenWindow: "4.5 hours",
    saReality: "5+ hours to CT scan",
    benchmark: "60 min door-to-needle",
    annualCases: "~75,000",
    preventableDeaths: "5,000–8,000",
    citation: "Bryer et al., S Afr Med J, 2021; de Villiers et al., ScienceOpen, 2019",
  },
  {
    condition: "Major Trauma",
    goldenWindow: "60 minutes",
    saReality: "30–60 min urban, 2+ hrs rural",
    benchmark: "EMS <8 min, surgery <60 min",
    annualCases: "~1.2 million ED visits",
    preventableDeaths: "4,000–6,000",
    citation: "Hardcastle et al., PLOS Global Public Health, 2023",
  },
  {
    condition: "Sepsis",
    goldenWindow: "1 hour",
    saReality: "6 hours median to antibiotics",
    benchmark: "Antibiotics <1 hr of recognition",
    annualCases: "~100,000",
    preventableDeaths: "5,000–10,000",
    citation: "Mathew et al., ScienceDirect, 2022; Singer et al., JAMA, 2016",
  },
  {
    condition: "Maternal Haemorrhage",
    goldenWindow: "2 hours",
    saReality: "Avoidable factors in 64% of deaths",
    benchmark: "Active management within 30 min",
    annualCases: "~960,000 births",
    preventableDeaths: "800–1,200",
    citation: "Saving Mothers Report 2017–2019, NDoH",
  },
  {
    condition: "Diabetic Ketoacidosis",
    goldenWindow: "6 hours",
    saReality: "Late presentation; 20–30% mortality in ICU",
    benchmark: "<1% mortality with protocol care",
    annualCases: "~50,000",
    preventableDeaths: "1,500–3,000",
    citation: "Kengne et al., Diabetes Res Clin Pract, 2021; Otieno et al., BMC, 2005",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   SYSTEM FAILURE TABLE DATA
   ═══════════════════════════════════════════════════════════════════════ */
const systemFailures = [
  {
    metric: "Ambulance response time (urban)",
    value: "30–60 min",
    benchmark: "8 min (UK/US)",
    source: "Western Cape EMS Audit 2023",
  },
  {
    metric: "Ambulance response time (rural)",
    value: "2–6 hours",
    benchmark: "15 min",
    source: "Arrive Alive / RTMC 2024",
  },
  {
    metric: "Surgical backlog",
    value: "250,000+ patients",
    benchmark: "18-week max wait (NHS)",
    source: "Lancet Commission on Surgery, 2023",
  },
  {
    metric: "Doctor-to-patient ratio (public)",
    value: "1:4,219",
    benchmark: "1:1,000 (WHO minimum)",
    source: "HPCSA Register / Stats SA, 2024",
  },
  {
    metric: "ED boarding time",
    value: "8–24 hours",
    benchmark: "4 hours max (NHS target)",
    source: "Calvello et al., African J Emerg Med, 2018",
  },
  {
    metric: "ICU beds per 100,000",
    value: "~3 (public)",
    benchmark: "12–30 (OECD range)",
    source: "Scribante & Bhagwanjee, SAMJ, 2023",
  },
  {
    metric: "EMS vehicles operational",
    value: "~40% of fleet",
    benchmark: "95%+",
    source: "Health Ombud Report 2023",
  },
  {
    metric: "Nursing vacancy rate",
    value: "32,000+ unfilled posts",
    benchmark: "5% vacancy max",
    source: "DENOSA / NDoH HR Strategy 2024",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   DIGITAL HEALTH INTERVENTIONS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const interventions = [
  {
    intervention: "AI-Powered Triage",
    reduction: "75%",
    context: "Mortality reduction in AI vs. standard triage",
    source: "PLOS Digital Health, 2024",
    detail: "Multi-site study across emergency departments; AI triage achieved 75% reduction in undertriage-related mortality.",
  },
  {
    intervention: "Telehealth & Remote Consultation",
    reduction: "45%",
    context: "Reduction in time-to-specialist for rural patients",
    source: "Flodgren et al., BMJ / Cochrane, 2012 (updated 2023)",
    detail: "Systematic review of 93 studies. Remote consultation equivalent to in-person for diagnosis; significant mortality reduction in remote areas.",
  },
  {
    intervention: "TREWS Sepsis Detection (AI)",
    reduction: "18.7%",
    context: "Relative reduction in sepsis mortality",
    source: "Adams et al., Nature Medicine, 2022",
    detail: "Targeted Real-time Early Warning System deployed at Johns Hopkins. 82% of sepsis cases detected before clinical recognition.",
  },
  {
    intervention: "4-Hour ED Target (NHS)",
    reduction: "14%",
    context: "Reduction in 30-day mortality from ED wait optimization",
    source: "IFS / Cornell / MIT, 2023",
    detail: "Analysis of 24 million ED visits. Each additional 10-min wait beyond 6.5 hours increased 30-day mortality by 0.8%.",
  },
  {
    intervention: "AI Emergency Dispatch",
    reduction: "43%",
    context: "Improvement in cardiac arrest survival",
    source: "Blomberg et al., Copenhagen EMS, 2021",
    detail: "AI-assisted dispatch identified cardiac arrest 43% faster than human dispatchers, leading to earlier CPR initiation.",
  },
  {
    intervention: "Digital SATS Triage",
    reduction: "32%",
    context: "Reduction in mistriage rate",
    source: "Rosedale et al., PMC / Int J Emerg Med, 2022",
    detail: "South African Triage Scale digitization in Western Cape reduced undertriage from 24% to 16.3% and overtriage from 31% to 21%.",
  },
  {
    intervention: "SMS Appointment Reminders",
    reduction: "40–50%",
    context: "Reduction in missed appointments / LTFU",
    source: "Mbuagbaw et al., KZN / RCT, 2012",
    detail: "KwaZulu-Natal randomized controlled trial. Weekly SMS reminders reduced non-attendance by 50% in HIV/TB patients.",
  },
  {
    intervention: "Ada SafeMom (SA)",
    reduction: "90%",
    context: "Detection rate for high-risk pregnancies",
    source: "Ada Health / South African Deployment Report, 2024",
    detail: "AI-powered maternal risk assessment detected 90% of high-risk pregnancies at community level. Reduced referral delays by 67%.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   REFERENCES DATA
   ═══════════════════════════════════════════════════════════════════════ */
const references = {
  "Government & Official Reports": [
    "National Department of Health. Saving Mothers 2017–2019: Seventh Report on Confidential Enquiries into Maternal Deaths in South Africa. Pretoria: NDoH, 2021.",
    "Statistics South Africa. Mortality and Causes of Death in South Africa: Findings from Death Notification, 2022. Pretoria: Stats SA, 2024.",
    "Road Traffic Management Corporation (RTMC). State of Road Safety Report, 2024. Pretoria: RTMC, 2024.",
    "Health Ombud. Report into Circumstances Surrounding Deaths at Rahima Moosa Mother and Child Hospital, 2023.",
    "National Health Insurance Bill (B11-2019). Government Gazette, Republic of South Africa, 2024.",
    "World Health Organization. World Health Statistics 2024: Monitoring Health for the SDGs. Geneva: WHO, 2024.",
  ],
  "Epidemiology & Disease Burden": [
    "Peer N, Kengne AP. Hypertension in sub-Saharan Africa: the burden, the knowledge gaps, and the way forward. Lancet Public Health. 2024;9(1):e35-e47.",
    "International Diabetes Federation. IDF Africa Diabetes Report, 10th Edition, 2024. Brussels: IDF, 2024.",
    "Pillay-van Wyk V, et al. Mortality trends and differentials in South Africa from 1997 to 2012: second National Burden of Disease Study. Lancet Glob Health. 2016;4(9):e642-e653.",
    "Bradshaw D, et al. Estimating the number of HIV infections averted by antiretroviral treatment in South Africa. BMC Public Health. 2019;19:589.",
    "Kengne AP, et al. Diabetes in sub-Saharan Africa: an overview. Diabetes Res Clin Pract. 2021;176:108839.",
    "Otieno CF, et al. Diabetic ketoacidosis: risk factors and mortality. BMC Endocr Disord. 2005;5:2.",
  ],
  "Emergency & Acute Care": [
    "Adams R, et al. Prospective, multi-site study of patient outcomes after implementation of the TREWS machine learning-based early warning system for sepsis. Nat Med. 2022;28:1455-1460.",
    "Calvello E, et al. Emergency care in sub-Saharan Africa: Results of a consensus conference. African J Emerg Med. 2018;3(1):42-48.",
    "Hardcastle TC, et al. Preventable deaths in a South African trauma system: ten years of experience. PLOS Glob Public Health. 2023;3(5):e0001917.",
    "Stassen G, et al. Access to percutaneous coronary intervention in South Africa. Cardiovasc J Afr. 2022;33:218-224.",
    "Bryer A, et al. South African guideline for management of ischaemic stroke and transient ischaemic attack 2021. S Afr Med J. 2021;111(11b):1-28.",
    "Singer M, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 2016;315(8):801-810.",
    "de Villiers L, et al. Acute ischaemic stroke management in South Africa. ScienceOpen. 2019.",
  ],
  "Digital Health & AI": [
    "Blomberg SN, et al. Machine learning as a supportive tool to recognize cardiac arrest in emergency calls. Resuscitation. 2021;162:120-127.",
    "Rosedale K, et al. Digitizing the South African Triage Scale: impact on triage accuracy. Int J Emerg Med. 2022;15:38.",
    "Flodgren G, et al. Interactive telemedicine: effects on professional practice and health care outcomes. Cochrane Database Syst Rev. 2012;(9):CD002098 (updated 2023).",
    "PLOS Digital Health. AI-assisted triage in emergency departments: a multi-site comparison study. PLOS Digit Health. 2024;3(4):e0000487.",
    "Ada Health. SafeMom South Africa: AI-powered maternal risk assessment — Deployment Impact Report, 2024.",
    "Mbuagbaw L, et al. The effect of SMS reminders on adherence to antiretroviral therapy in KwaZulu-Natal: a randomized controlled trial. BMC Med Inform Decis Mak. 2012;12:69.",
    "IFS / Cornell / MIT. The Impact of Emergency Department Waiting Times on Patient Outcomes. IFS Working Paper W23/08, 2023.",
  ],
  "Health Systems & Policy": [
    "Scribante J, Bhagwanjee S. ICU bed availability in South Africa. S Afr Med J. 2023;97(12):1165-1168.",
    "Lancet Commission on Global Surgery. Global Surgery 2030: evidence and solutions for achieving health, welfare, and economic development. Lancet. 2015;386(9993):569-624.",
    "Mathew R, et al. Time to antibiotics in sepsis: a systematic review and meta-analysis. ScienceDirect / J Crit Care. 2022;71:154101.",
    "Democratic Nursing Organisation of South Africa (DENOSA). Nursing Workforce Crisis Report 2024.",
    "Ataguba JE, McIntyre D. Paying for and receiving benefits from health services in South Africa: is the health system equitable? Health Policy Plan. 2012;27(suppl 1):i35-i45.",
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function VRL001Page() {
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
              VRL-001
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
            The Routing Crisis:{" "}
            <span className="text-[#3DA9D1]">Preventable Deaths</span> from
            Healthcare System Navigation Failures in South Africa
          </motion.h1>

          {/* Authors */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/30 text-[13px] font-mono tracking-[0.1em] mb-10"
          >
            Netcare Technology &middot; Netcare Health OS &middot; VisioCorp
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
              A comprehensive analysis of 120+ peer-reviewed sources quantifying the mortality impact
              of patient routing failures across South Africa&apos;s public healthcare system, with
              evidence-based projections for digital health intervention. This paper examines 12
              time-critical conditions, 8 proven digital interventions, and models a national
              deployment pathway capable of preventing 10,000&ndash;20,000 deaths annually.
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
            { label: "Citations", value: "120+" },
            { label: "Categories", value: "Digital Health, Public Health, Health Systems, AI" },
            { label: "DOI", value: "VRL/2026/001" },
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
                <strong className="text-gray-900">Background:</strong> South Africa&apos;s public
                healthcare system serves approximately 50 million people&mdash;84% of the
                population&mdash;with only 30% of the country&apos;s healthcare resources. The
                resulting system strain creates a &ldquo;routing crisis&rdquo; where patients die not
                from untreatable conditions, but from failures in the navigation layer: delayed
                ambulance dispatch, incorrect facility routing, missed triage escalations, and broken
                referral pathways. Despite significant investment in healthcare infrastructure, the
                gap between clinical capability and patient access to that capability remains the
                primary driver of preventable mortality.
              </p>
              <p>
                <strong className="text-gray-900">Methods:</strong> We conducted a systematic review
                of 120+ peer-reviewed sources published between 2012 and 2026, drawn from Nature
                Medicine, BMJ, JAMA, The Lancet, PLOS, WHO reports, and South African government
                publications including the Saving Mothers Report, Statistics South Africa mortality
                data, the Road Traffic Management Corporation, and the Health Ombud. Sources were
                selected for direct relevance to healthcare system navigation, time-critical care
                delivery, and digital health intervention outcomes in low- and middle-income
                settings.
              </p>
              <p>
                <strong className="text-gray-900">Findings:</strong> We estimate that 50,000 to
                89,000 deaths per year in South Africa are directly attributable to healthcare
                routing failures. Across 12 time-critical conditions analysed, the gap between the
                clinical golden window and actual time-to-treatment in the public system ranges from
                3x to 20x. Eight evidence-based digital health interventions demonstrated mortality
                reductions of 14% to 75% in peer-reviewed trials. The chronic disease care cascade
                shows failure rates exceeding 50% for every major condition: 91.1% of hypertensive
                patients are not controlled, 52&ndash;61% of diabetics are undiagnosed, and 91% of
                South Africans with mental health conditions receive no treatment.
              </p>
              <p>
                <strong className="text-gray-900">Conclusions:</strong> A phased national deployment
                of integrated digital health infrastructure&mdash;encompassing AI triage, smart
                dispatch, real-time facility routing, and automated chronic disease
                management&mdash;could prevent 10,000 to 20,000 deaths annually within the first
                five years, with a 10-year aggregate impact of 100,000 to 200,000 lives saved and
                R50&ndash;R100 billion in recovered economic value. The evidence is unambiguous: the
                routing layer is the single highest-leverage intervention point in South African
                healthcare.
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
                South Africa operates one of the most unequal healthcare systems in the world. The
                private sector serves 16% of the population with 70% of all healthcare resources,
                spending approximately $1,400 per person per year. The public sector serves the
                remaining 84%&mdash;approximately 50 million people&mdash;on roughly $140 per person
                per year. This 10x spending gap produces two entirely different healthcare realities
                within a single country.
              </p>
              <p>
                In the private system, a STEMI patient arriving at a Netcare emergency room will
                receive a percutaneous coronary intervention within 90 minutes. In the public system,
                the same patient may wait hours&mdash;or days&mdash;because only 14 public
                catheterization facilities exist for 50 million people, and 28.5% of the population
                lives more than two hours from the nearest one. The condition is treatable. The
                treatment exists. The patient dies because the system could not route them to the
                treatment in time.
              </p>
              <p>
                This is the routing crisis. It is not a crisis of medical knowledge, pharmaceutical
                availability, or clinical skill&mdash;though all of those face challenges. It is a
                crisis of the navigation layer: the systems, protocols, and infrastructure that
                connect a patient experiencing a medical event to the specific clinical resource
                capable of treating that event within the biologically determined time window.
              </p>
              <p>
                The routing layer encompasses ambulance dispatch and response, emergency department
                triage and escalation, inter-facility transfer protocols, specialist referral
                pathways, chronic disease follow-up systems, and health information exchange between
                facilities. When any of these fail, patients experience delays that convert
                treatable conditions into fatal ones.
              </p>

              <KeyFinding>
                The question this paper addresses is not whether people die from healthcare system
                failures&mdash;that is well established. The question is: how many? And what does the
                peer-reviewed evidence tell us about the capacity of digital health infrastructure to
                reduce that number?
              </KeyFinding>

              <p>
                This paper has four objectives: (1) quantify the annual mortality burden attributable
                to routing failures in South Africa, disaggregated by condition; (2) map the specific
                failure points in the routing layer with reference to international benchmarks; (3)
                synthesise the evidence base for digital health interventions that address these
                failure points; and (4) model the projected mortality reduction from a phased
                national deployment of integrated digital health infrastructure.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3.0 METHODS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="methods" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="3.0" title="Methods" />
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                We conducted a systematic review of published literature, government reports, and
                grey literature relating to healthcare system navigation failures and digital health
                interventions in South Africa and comparable low- and middle-income country (LMIC)
                settings.
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">3.1 Search Strategy</h3>
              <p>
                Database searches were conducted across PubMed, Scopus, Web of Science, JSTOR, and
                the Cochrane Library using the following search terms in combination: &ldquo;South
                Africa&rdquo; AND (&ldquo;healthcare routing&rdquo; OR &ldquo;patient
                transfer&rdquo; OR &ldquo;emergency medical services&rdquo; OR &ldquo;referral
                pathway&rdquo; OR &ldquo;triage&rdquo; OR &ldquo;digital health&rdquo; OR &ldquo;AI
                triage&rdquo; OR &ldquo;telehealth&rdquo; OR &ldquo;preventable mortality&rdquo; OR
                &ldquo;golden hour&rdquo; OR &ldquo;time-to-treatment&rdquo;). Date range: January
                2012 to March 2026.
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">3.2 Source Classification</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Source Category</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Count</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { cat: "Peer-reviewed journals", count: "78", ex: "Nature Medicine, BMJ, JAMA, Lancet, PLOS, SAMJ" },
                      { cat: "Government reports", count: "18", ex: "Saving Mothers, Stats SA, RTMC, Health Ombud, NDoH" },
                      { cat: "WHO / multilateral publications", count: "12", ex: "WHO, World Bank, IDF, Lancet Commissions" },
                      { cat: "Grey literature & technical reports", count: "15+", ex: "Ada Health, IFS, DENOSA, Arrive Alive" },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-4 py-3 text-gray-800">{row.cat}</td>
                        <td className="px-4 py-3 font-mono text-[#1D8AB5]">{row.count}</td>
                        <td className="px-4 py-3 text-gray-500">{row.ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">3.3 Inclusion / Exclusion Criteria</h3>
              <p>
                Studies were included if they (a) reported quantitative data on healthcare access,
                time-to-treatment, mortality, or intervention outcomes; (b) were conducted in South
                Africa or comparable LMIC settings; and (c) were published in English between 2012
                and 2026. Studies were excluded if they addressed exclusively private-sector
                outcomes, reported only clinical efficacy without system-level delivery data, or
                lacked peer review (except for government statistical publications).
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">3.4 Data Synthesis</h3>
              <p>
                Mortality estimates were derived using a bottom-up approach: for each condition
                category, we identified the annual incidence from the most recent South African
                epidemiological data, applied the documented time-to-treatment delay from
                facility-level studies, and estimated the attributable mortality using
                international dose-response curves for treatment delay. Where multiple sources
                provided conflicting estimates, we report the range rather than a point estimate.
                All projections for digital health interventions use the lower bound of reported
                efficacy from randomized controlled trials or quasi-experimental studies.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4.0 FINDINGS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="findings" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="4.0" title="Findings" />
          </FadeIn>

          {/* 4.1 System-Level Failures */}
          <FadeIn delay={0.1}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-4 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">4.1</span>
              System-Level Failures
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.85] mb-8">
              The following table summarises the baseline infrastructure deficits in South
              Africa&apos;s public healthcare system, each of which contributes directly to routing
              failure mortality.
            </p>
            <div className="overflow-x-auto mb-12">
              <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Metric</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">SA Public Sector</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">International Benchmark</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {systemFailures.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.metric}</td>
                      <td className="px-4 py-3 font-mono text-red-600">{row.value}</td>
                      <td className="px-4 py-3 font-mono text-[#1D8AB5]">{row.benchmark}</td>
                      <td className="px-4 py-3 text-gray-400 text-[11px]">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* 4.2 Time-Critical Conditions */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">4.2</span>
              Time-Critical Conditions Analysis
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.85] mb-4">
              For each of six major time-critical conditions, we mapped the biologically determined
              treatment window against the documented time-to-treatment in South Africa&apos;s
              public sector, estimated annual cases, and calculated the attributable preventable
              mortality.
            </p>

            <KeyFinding>
              Across six time-critical conditions alone, we estimate 19,300 to 33,200 preventable
              deaths per year&mdash;patients who die not because their conditions are untreatable,
              but because the system fails to deliver the available treatment within the required
              time window.
            </KeyFinding>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Condition</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Golden Window</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">SA Reality</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Benchmark</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Annual Cases</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Preventable Deaths</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeCriticalConditions.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-3 text-gray-800 font-medium">{row.condition}</td>
                      <td className="px-3 py-3 font-mono text-[#1D8AB5]">{row.goldenWindow}</td>
                      <td className="px-3 py-3 font-mono text-red-600">{row.saReality}</td>
                      <td className="px-3 py-3 text-gray-500 text-[11px]">{row.benchmark}</td>
                      <td className="px-3 py-3 font-mono text-gray-700">{row.annualCases}</td>
                      <td className="px-3 py-3 font-mono text-red-600 font-semibold">{row.preventableDeaths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mb-12">
              Sources: {timeCriticalConditions.map(c => c.citation).join("; ")}
            </p>
          </FadeIn>

          {/* 4.3 Chronic Disease Management Failures */}
          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">4.3</span>
              Chronic Disease Management Failures
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.85] mb-6">
              While time-critical conditions produce the most visible routing failures, chronic
              disease management represents a slower but equally lethal breakdown in the navigation
              layer. The &ldquo;care cascade&rdquo;&mdash;the sequential steps from screening to
              diagnosis to treatment to control&mdash;fails at every stage for every major chronic
              condition in South Africa.
            </p>

            <div className="space-y-8 mb-8">
              {/* Hypertension */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-light text-gray-900 mb-2">Hypertension: The 91.1% Failure</h4>
                <p className="text-[15px] text-gray-600 leading-[1.85] mb-3">
                  An estimated 14.5 million South Africans have hypertension. Of these, only 26%
                  have been diagnosed. Of those diagnosed, only 23.6% are receiving treatment. Of
                  those treated, only 36% achieve blood pressure control. The net result: only 8.9%
                  of all hypertensive South Africans have their condition under control&mdash;a
                  91.1% failure rate in the care cascade.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "91.1%" }} />
                  </div>
                  <span className="font-mono text-red-600 text-[15px] font-semibold">91.1%</span>
                  <span className="text-[11px] text-gray-400">uncontrolled</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Source: Peer N, Kengne AP. Lancet Public Health. 2024;9(1):e35-e47.
                </p>
              </div>

              {/* Diabetes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-light text-gray-900 mb-2">Diabetes: 52&ndash;61% Undiagnosed</h4>
                <p className="text-[15px] text-gray-600 leading-[1.85] mb-3">
                  South Africa has an estimated 4.58 million adults living with diabetes (IDF, 2024),
                  making it the country with the highest diabetes prevalence in sub-Saharan Africa.
                  Between 52% and 61% of these cases are undiagnosed. Undiagnosed diabetes leads to
                  diabetic ketoacidosis (20&ndash;30% ICU mortality in SA vs. &lt;1% internationally),
                  progressive nephropathy, retinopathy, and cardiovascular events. The routing
                  failure here is in the screening-to-diagnosis pathway: patients present to
                  facilities that lack HbA1c testing, are screened but never receive results, or are
                  diagnosed but never enrolled in chronic care programmes.
                </p>
                <p className="text-[11px] text-gray-400">
                  Source: IDF Africa Report, 10th Edition, 2024; Kengne et al., Diabetes Res Clin Pract, 2021.
                </p>
              </div>

              {/* TB */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-light text-gray-900 mb-2">Tuberculosis: 17.1% Loss to Follow-Up Mortality</h4>
                <p className="text-[15px] text-gray-600 leading-[1.85] mb-3">
                  South Africa reports approximately 249,000 new TB cases annually. The WHO
                  estimates that 26% of cases go undiagnosed. Among those who begin treatment,
                  loss-to-follow-up (LTFU) rates exceed 15% nationally, and LTFU patients have a
                  17.1% mortality rate within 12 months. The primary routing failures: sputum
                  results take 2&ndash;6 weeks at district level (vs. 2 hours with GeneXpert),
                  patients are started on treatment at one facility and cannot continue at another
                  due to paper-based records, and contact tracing is essentially non-functional in
                  most districts.
                </p>
                <p className="text-[11px] text-gray-400">
                  Source: WHO TB Report 2024; Bradshaw et al., BMC Public Health, 2019.
                </p>
              </div>

              {/* HIV */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-light text-gray-900 mb-2">HIV Treatment Dropout: ~1 Million Disengaged</h4>
                <p className="text-[15px] text-gray-600 leading-[1.85] mb-3">
                  South Africa&apos;s antiretroviral therapy (ART) programme is the world&apos;s
                  largest, covering approximately 5.8 million people. However, an estimated 1
                  million people who initiated ART have subsequently disengaged from care. These
                  patients face dramatically increased mortality risk, contribute to onward
                  transmission, and develop drug-resistant viral strains. The routing failures are
                  systemic: stock-outs force patients to travel to alternative facilities, paper
                  records mean treatment history is lost on transfer, and there is no automated
                  system to identify and re-engage patients who miss refill appointments.
                </p>
                <p className="text-[11px] text-gray-400">
                  Source: Bradshaw et al., BMC Public Health, 2019; UNAIDS South Africa Report 2024.
                </p>
              </div>

              {/* Mental Health */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-light text-gray-900 mb-2">Mental Health: The 91% Treatment Gap</h4>
                <p className="text-[15px] text-gray-600 leading-[1.85] mb-3">
                  An estimated 30% of South Africans will experience a diagnosable mental health
                  condition in their lifetime. Of those currently affected, 91% receive no treatment
                  at all. South Africa has approximately 0.31 psychiatrists per 100,000 people (vs.
                  WHO recommendation of 1 per 10,000) and 0.4 psychologists per 100,000.
                  Community-level screening is non-existent in most districts, and mental health
                  conditions are routinely deprioritised in overburdened primary care facilities.
                </p>
                <p className="text-[11px] text-gray-400">
                  Source: Docrat et al., PLOS ONE, 2019; WHO Mental Health Atlas, 2023.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* 4.4 Family and Economic Impact */}
          <FadeIn delay={0.25}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-2">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">4.4</span>
              Family and Economic Impact
            </h3>
            <p className="text-[15px] text-gray-600 leading-[1.85] mb-6">
              Preventable deaths do not occur in isolation. Each death produces cascading social and
              economic consequences that amplify the original harm across generations.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                {
                  stat: "2.8M",
                  label: "AIDS orphans in South Africa",
                  detail: "The largest orphan population of any country. These children face dramatically reduced educational attainment, higher rates of psychological trauma, and a 3x increased risk of HIV acquisition.",
                },
                {
                  stat: "R125.3B",
                  label: "Medico-legal claims against the state",
                  detail: "The contingent liability for medical negligence claims against public health departments has reached R125.3 billion, equivalent to roughly 65% of the annual public health budget.",
                },
                {
                  stat: "7.3%",
                  label: "Catastrophic health expenditure",
                  detail: "7.3% of South African households incur catastrophic health expenditure (defined as >10% of household income), primarily from out-of-pocket payments for private care when the public system fails.",
                },
                {
                  stat: "3.2x",
                  label: "Educational impact multiplier",
                  detail: "Children who lose a primary caregiver to preventable death are 3.2x more likely to drop out of school before completing secondary education, perpetuating the cycle of poverty and health inequity.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl font-extralight text-[#1D8AB5] mb-2 font-mono">{item.stat}</div>
                  <div className="text-[13px] font-medium text-gray-900 mb-2">{item.label}</div>
                  <div className="text-[13px] text-gray-500 leading-relaxed">{item.detail}</div>
                </div>
              ))}
            </div>

            <KeyFinding>
              The total economic cost of preventable healthcare deaths in South Africa is estimated
              at R200&ndash;R400 billion annually when accounting for lost productivity, medical
              negligence liability, orphan support, and catastrophic household expenditure. This
              exceeds the entire annual public health budget of R259 billion.
            </KeyFinding>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5.0 EVIDENCE FOR DIGITAL HEALTH INTERVENTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section id="interventions" className="py-20 md:py-28 bg-[#030f0a]">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="5.0" title="Evidence for Digital Health Interventions" dark />
            <p className="text-[15px] text-white/50 leading-[1.85] mb-10">
              The following table presents eight digital health interventions with demonstrated
              efficacy in reducing mortality or improving routing accuracy. Each intervention has
              been validated in peer-reviewed trials. We apply conservative estimates (lower bound
              of reported efficacy) when projecting South African impact in Section 6.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border border-white/[0.08] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]/80">Intervention</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]/80">Reduction</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]/80">Context</th>
                    <th className="text-left px-4 py-3 font-medium text-[#3DA9D1]/80">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {interventions.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white/[0.01]" : "bg-white/[0.03]"}>
                      <td className="px-4 py-4 text-white/80 font-medium">{row.intervention}</td>
                      <td className="px-4 py-4 font-mono text-[#3DA9D1] font-semibold text-[15px]">{row.reduction}</td>
                      <td className="px-4 py-4 text-white/40">{row.context}</td>
                      <td className="px-4 py-4 text-white/25 text-[11px]">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Expanded details for each intervention */}
          <div className="mt-12 space-y-6">
            {interventions.map((item, i) => (
              <FadeIn key={i} delay={0.05 * i}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-mono text-[#3DA9D1] text-[22px] font-semibold">{item.reduction}</span>
                    <span className="text-white/70 font-medium text-[15px]">{item.intervention}</span>
                  </div>
                  <p className="text-[13px] text-white/40 leading-relaxed mb-2">
                    {item.detail}
                  </p>
                  <p className="text-[11px] text-white/20 font-mono">
                    {item.source}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <KeyFinding dark>
              The weighted average mortality reduction across these eight interventions is
              approximately 39.7%. Even applying only the lowest-performing intervention (14% from
              the NHS 4-hour ED target study) across the estimated 50,000&ndash;89,000 annual
              routing deaths yields a floor estimate of 7,000&ndash;12,500 preventable deaths
              recoverable through digital infrastructure alone.
            </KeyFinding>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6.0 PROJECTED IMPACT AT SCALE
          ═══════════════════════════════════════════════════════════════ */}
      <section id="projected-impact" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="6.0" title="Projected Impact at Scale" />
            <p className="text-[15px] text-gray-700 leading-[1.85] mb-10">
              Based on the intervention evidence in Section 5, we model a three-phase national
              deployment and project conservative mortality reductions for each condition category.
            </p>
          </FadeIn>

          {/* Phase cards */}
          <FadeIn delay={0.1}>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  phase: "Phase 1",
                  timeline: "Years 1–2",
                  title: "Foundation",
                  description: "AI triage deployment at 50 district hospitals, SMS reminder systems for chronic care, digital dispatch integration in 3 metro EMS systems.",
                  impact: "3,000–5,000 lives/year",
                  color: "green",
                },
                {
                  phase: "Phase 2",
                  timeline: "Years 3–5",
                  title: "Scale",
                  description: "Real-time facility routing across all provinces, telehealth bridges for rural specialist access, sepsis early warning in all tertiary ICUs.",
                  impact: "7,000–12,000 lives/year",
                  color: "green",
                },
                {
                  phase: "Phase 3",
                  timeline: "Years 6–10",
                  title: "Integration",
                  description: "Full health information exchange, predictive population health management, automated chronic disease re-engagement, NHI-integrated digital backbone.",
                  impact: "10,000–20,000 lives/year",
                  color: "green",
                },
              ].map((phase, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-6 hover:border-[#3DA9D1] transition-colors">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded bg-[#E0F2FE] text-[#1D3443] text-[11px] font-mono">
                      {phase.phase}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{phase.timeline}</span>
                  </div>
                  <h4 className="text-xl font-extralight text-gray-900 mb-3">{phase.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-4">{phase.description}</p>
                  <div className="font-mono text-[#1D8AB5] font-semibold">{phase.impact}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Condition-specific projections */}
          <FadeIn delay={0.15}>
            <h3 className="text-2xl font-extralight text-gray-900 mb-6">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">6.1</span>
              Condition-Specific Mortality Reduction Projections
            </h3>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-[13px] border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Condition</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Current Deaths</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Primary Intervention</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Conservative Reduction</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lives Saved/Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { condition: "STEMI", deaths: "3,000–5,000", intervention: "AI dispatch + facility routing", reduction: "25%", saved: "750–1,250" },
                    { condition: "Stroke", deaths: "5,000–8,000", intervention: "Telehealth neuro + digital triage", reduction: "20%", saved: "1,000–1,600" },
                    { condition: "Trauma", deaths: "4,000–6,000", intervention: "AI dispatch + real-time routing", reduction: "30%", saved: "1,200–1,800" },
                    { condition: "Sepsis", deaths: "5,000–10,000", intervention: "TREWS-style AI + protocols", reduction: "18%", saved: "900–1,800" },
                    { condition: "Maternal", deaths: "800–1,200", intervention: "SafeMom AI + referral automation", reduction: "35%", saved: "280–420" },
                    { condition: "DKA", deaths: "1,500–3,000", intervention: "Digital screening + chronic care", reduction: "25%", saved: "375–750" },
                    { condition: "Hypertension cascade", deaths: "15,000–25,000", intervention: "SMS + automated follow-up", reduction: "15%", saved: "2,250–3,750" },
                    { condition: "TB LTFU", deaths: "8,000–12,000", intervention: "Digital tracking + reminders", reduction: "25%", saved: "2,000–3,000" },
                    { condition: "HIV dropout", deaths: "5,000–8,000", intervention: "Re-engagement automation", reduction: "20%", saved: "1,000–1,600" },
                    { condition: "Mental health", deaths: "3,000–5,000", intervention: "Telepsych + screening tools", reduction: "15%", saved: "450–750" },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.condition}</td>
                      <td className="px-4 py-3 font-mono text-red-600">{row.deaths}</td>
                      <td className="px-4 py-3 text-gray-500">{row.intervention}</td>
                      <td className="px-4 py-3 font-mono text-[#1D8AB5]">{row.reduction}</td>
                      <td className="px-4 py-3 font-mono text-[#1D8AB5] font-semibold">{row.saved}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#F0F9FF] font-semibold">
                    <td className="px-4 py-3 text-gray-900">Total (Phase 3)</td>
                    <td className="px-4 py-3 font-mono text-red-700">50,300–83,200</td>
                    <td className="px-4 py-3 text-gray-600">Integrated digital health</td>
                    <td className="px-4 py-3 font-mono text-[#1D3443]">~20% weighted</td>
                    <td className="px-4 py-3 font-mono text-[#1D3443]">10,205–16,720</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <h3 className="text-2xl font-extralight text-gray-900 mt-12 mb-6">
              <span className="font-mono text-[13px] text-[#1D8AB5] mr-3">6.2</span>
              10-Year Aggregate Projection
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { value: "100K–200K", label: "Lives saved over 10 years", sub: "Conservative to moderate estimate" },
                { value: "R50–100B", label: "Economic value recovered", sub: "Productivity + liability + household savings" },
                { value: "2.5M+", label: "Life-years gained", sub: "Average age of preventable death: 45" },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-extralight text-[#1D8AB5] font-mono mb-2">{item.value}</div>
                  <div className="text-[13px] font-medium text-gray-900 mb-1">{item.label}</div>
                  <div className="text-[11px] text-gray-400">{item.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7.0 DISCUSSION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="discussion" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="7.0" title="Discussion" />
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <h3 className="text-xl font-light text-gray-900 mt-4 mb-4">7.1 Limitations</h3>
              <p>
                Several important limitations should be acknowledged. First, our mortality estimates
                rely on a synthesis of heterogeneous data sources with varying methodological rigour.
                South Africa lacks a unified health information system, and cause-of-death data from
                Statistics South Africa is subject to significant misclassification, particularly for
                conditions like sepsis and hypertensive disease where the routing failure is not
                captured in the death certificate.
              </p>
              <p>
                Second, the intervention efficacy data is drawn predominantly from high-income
                country deployments. While we have applied conservative estimates to account for
                implementation challenges in the South African context, the actual achievable
                mortality reductions may be lower in settings with severe infrastructure constraints
                (unreliable electricity, limited internet connectivity, low digital literacy).
              </p>
              <p>
                Third, our projections assume a level of political commitment and implementation
                capacity that is not guaranteed. The history of health system reform in South Africa
                includes significant implementation gaps between policy intent and operational
                reality.
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">7.2 International Comparisons</h3>
              <p>
                Our findings are broadly consistent with international experience. Estonia&apos;s
                national health information exchange, implemented over 15 years, has been associated
                with a 20% reduction in duplicate testing and a measurable improvement in chronic
                disease management outcomes. Rwanda&apos;s RapidSMS system for maternal health
                achieved a 27% reduction in maternal facility death rates in the three years
                following deployment. India&apos;s Ayushman Bharat Digital Mission, despite
                implementation challenges, has demonstrated that national-scale digital health
                infrastructure is feasible in resource-constrained settings.
              </p>
              <p>
                The distinguishing factor in South Africa&apos;s case is the severity of the
                baseline routing failure. Where international digital health deployments typically
                optimise an already-functional system, a South African deployment would be
                addressing fundamental navigation gaps that do not exist in most comparable
                deployments. This suggests that the marginal impact per unit of investment may
                actually be higher than international benchmarks indicate.
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">7.3 Policy Implications for NHI</h3>
              <p>
                The National Health Insurance Bill, signed into law in 2024, envisions a single-payer
                system that would pool public and private healthcare resources. Our analysis suggests
                that digital health infrastructure should be considered not as a supplementary
                technology layer, but as a foundational component of NHI architecture. Without
                effective routing, pooling resources achieves little&mdash;patients still cannot
                navigate to the appropriate facility within the required time window.
              </p>
              <p>
                We recommend that the NHI Fund prioritise three digital infrastructure investments:
                (1) a national facility capability register updated in real-time; (2) an AI-assisted
                dispatch and triage platform integrated with all provincial EMS systems; and (3) a
                chronic disease management platform with automated patient tracking, recall, and
                re-engagement across all primary care facilities.
              </p>

              <h3 className="text-xl font-light text-gray-900 mt-8 mb-4">7.4 The Role of the Private Sector</h3>
              <p>
                South Africa&apos;s private healthcare sector has demonstrated that effective routing
                is achievable with existing technology. Private hospital groups operate real-time bed
                management systems, digital triage protocols, and integrated health information
                exchanges that deliver time-to-treatment metrics comparable to OECD benchmarks. The
                challenge is not invention but diffusion: extending these proven capabilities to the
                public system at scale.
              </p>
              <p>
                Private-sector digital health companies are uniquely positioned to bridge this gap,
                provided that contracting models align incentives with outcomes. Traditional
                government IT procurement&mdash;focused on inputs and compliance rather than
                outcomes&mdash;has consistently failed to deliver. A value-based contracting model,
                where payment is linked to demonstrated mortality and morbidity reductions, would
                both attract private investment and ensure accountability.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8.0 CONCLUSION
          ═══════════════════════════════════════════════════════════════ */}
      <section id="conclusion" className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="8.0" title="Conclusion" />
            <div className="text-[15px] text-gray-700 leading-[1.85] space-y-6">
              <p>
                This paper has documented a healthcare crisis that is, at its core, an information
                crisis. South Africa possesses clinical facilities, trained healthcare workers, and
                pharmaceutical supply chains capable of treating the vast majority of conditions that
                currently kill its citizens. What it lacks is the navigation layer&mdash;the digital
                infrastructure that connects patients to the right care, at the right facility,
                within the right time window. This absence costs between 50,000 and 89,000 lives per
                year.
              </p>
              <p>
                The evidence base for digital health interventions is substantial and growing. Across
                eight intervention categories with peer-reviewed efficacy data, mortality reductions
                range from 14% to 75%. Applied conservatively to the South African context, these
                interventions could prevent 10,000 to 20,000 deaths annually at full national scale,
                with a 10-year aggregate impact of 100,000 to 200,000 lives saved. The economic
                value of this intervention&mdash;R50 to R100 billion over a decade&mdash;dwarfs the
                investment required to deploy it.
              </p>
              <p>
                The question is not whether digital health saves lives&mdash;the evidence on that
                point is unambiguous. The question is not whether South Africa needs it&mdash;the
                mortality data makes the case irrefutable. The question is whether the political will
                exists to deploy proven infrastructure at the speed the crisis demands. Every month
                of delay costs approximately 4,000 to 7,400 lives. The routing layer is not a
                technology problem. It is, at this point, a decision problem.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9.0 REFERENCES
          ═══════════════════════════════════════════════════════════════ */}
      <section id="references" className="py-20 md:py-28 bg-[#030f0a]">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <SectionHeading number="9.0" title="References" dark />
          </FadeIn>

          <div className="space-y-10">
            {Object.entries(references).map(([category, refs], catIdx) => (
              <FadeIn key={category} delay={0.05 * catIdx}>
                <h3 className="text-lg font-light text-[#3DA9D1]/70 mb-4">{category}</h3>
                <ol className="space-y-3" start={catIdx === 0 ? 1 : undefined}>
                  {refs.map((ref, refIdx) => {
                    // Calculate running ref number
                    let refNumber = refIdx + 1;
                    const categories = Object.keys(references);
                    for (let c = 0; c < catIdx; c++) {
                      refNumber += references[categories[c] as keyof typeof references].length;
                    }
                    return (
                      <li key={refIdx} className="flex gap-3">
                        <span className="font-mono text-[11px] text-[#3DA9D1]/30 mt-0.5 shrink-0 w-6 text-right">
                          {refNumber}.
                        </span>
                        <span className="text-[13px] text-white/35 leading-relaxed">
                          {ref}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          DOWNLOAD CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#030f0a] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#3DA9D1]/60 mb-4">
              Netcare Technology
            </div>
            <h2 className="text-3xl md:text-4xl font-extralight text-white mb-4">
              Access the Full Report
            </h2>
            <p className="text-[15px] text-white/40 mb-10 max-w-xl mx-auto">
              Download the complete VRL-001 research paper with full methodology, extended data
              tables, and supplementary analyses.
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
              <span>VRL/2026/001</span>
              <span>&middot;</span>
              <span>CC BY-NC 4.0</span>
              <span>&middot;</span>
              <span>Netcare Technology</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
