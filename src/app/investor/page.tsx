"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Building2, Plug, Clock, CreditCard, Brain,
  ChevronRight, CheckCircle2, AlertCircle, Lightbulb,
  Users, TrendingUp, Shield, Globe, Zap, Target,
} from "lucide-react";

const products = [
  {
    id: "visiohealth-os",
    name: "Netcare Health OS",
    tagline: "The Core — AI-Powered Practice Management",
    icon: HeartPulse,
    status: "Market Ready",
    statusColor: "bg-[#3DA9D1]",
    color: "#10b981",
    image: "/images/investor/product-visiohealth-os.png",
    description: "Full digital practice transformation — not just software, but a complete operating system with white-labeled website, booking engine, GP referral portal, AI symptom checker, qualified leads, staff AI training, and practice management. Every client gets the full stack.",
    problem: "SA doctors run practices on paper, WhatsApp groups, and fragmented Excel sheets. No single system handles patients + billing + compliance + communication. Their online presence doesn\u2019t convert. They lose patients to competitors with better digital experiences.",
    solution: "One platform that replaces 5-7 separate tools. AI agents handle triage, intake, follow-ups, and scheduling. Built-in POPIA consent tracking, ICD-10 billing, medical aid claim management. Plus a full digital presence: white-labeled website, public booking engine, GP referral portal, AI symptom checker, qualified leads, and staff AI training.",
    features: [
      "Patient Management (records, allergies, medications, vitals)",
      "AI Agents (triage, intake, follow-up, billing, scheduler)",
      "ICD-10 Billing with medical aid claim tracking",
      "POPIA Compliance (consent records, audit logs)",
      "WhatsApp/SMS/Email notifications & reminders",
      "Public booking engine with deposit collection",
      "Daily task checklists (morning/during/end-of-day)",
      "Patient check-in Kanban queue",
      "White-labeled practice website (SEO-optimized landing page)",
      "GP referral portal (digital referral intake)",
      "AI symptom checker (patient \u2192 booking funnel)",
      "50\u2013200 qualified leads at onboarding",
      "Staff AI training programme (5 courses)",
      "Google Business Profile optimization",
      "Medical directory listings (Medpages, RecoMed)",
      "Multi-tenant with subscription tiers",
    ],
    compliance: [
      "POPIA — Full consent tracking (treatment, data, marketing, research)",
      "HPCSA — Audit logging for all patient data access",
      "ICD-10 — SA Master Industry Table compliant billing codes",
      "CPA — Transparent fee disclosure & informed financial consent",
    ],
    market: "~12,000 private medical practices in SA, R180B healthcare market",
    revenue: "Full digital practice transformation: Starter R2,999.99/mo (promo entry) | Core R15,000/mo | Professional R35,000/mo | Enterprise R55,000/mo + AI credits. Includes white-labeled website, booking engine, referral portal, SEO landing page, AI symptom checker, qualified leads, and staff AI training.",
  },
  {
    id: "placeo-health",
    name: "Placeo Health",
    tagline: "Patient Placement & Referral Network",
    icon: Building2,
    status: "Concept",
    statusColor: "bg-purple-500",
    color: "#8B5CF6",
    image: "/images/investor/product-placeo-health.png",
    description: "Intelligent patient placement system connecting patients to the right practice based on location, specialty, availability, and medical aid coverage.",
    problem: "Patients Google \"doctor near me\" and get outdated results. Doctors lose referrals because there's no structured referral network between practices, specialists, and hospitals.",
    solution: "A smart directory and referral engine. Patients find verified, HPCSA-registered practitioners filtered by specialty, location, medical aid acceptance, and real-time availability. Doctors refer within the network with full patient handoff.",
    features: [
      "HPCSA-verified practitioner directory",
      "Real-time availability from Netcare Health OS",
      "Medical aid compatibility matching",
      "Structured referral workflow (GP → Specialist)",
      "Patient reviews (compliant — no canvassing/touting)",
      "Location-based search with Google Maps",
      "Waiting time estimates from Visio Waiting Room data",
    ],
    compliance: [
      "HPCSA — No canvassing/touting; factual directory only",
      "HPCSA — Referral rules maintained (no kickbacks per Booklet 11)",
      "POPIA — Patient consent before data shared in referral",
      "CPA — Accurate, non-misleading practice information",
    ],
    market: "Patients spend 45+ min finding the right doctor. R2B+ annual patient acquisition market.",
    revenue: "Freemium directory + premium placement fees + referral commission per booking",
  },
  {
    id: "visio-health-integrator",
    name: "Visio Health Integrator",
    tagline: "Connect Labs, Pharmacies, Hospitals & Medical Aids",
    icon: Plug,
    status: "Concept",
    statusColor: "bg-purple-500",
    color: "#6366F1",
    image: "/images/investor/product-integrator.png",
    description: "Integration hub that connects medical practices to external healthcare systems — labs (PathCare, Lancet), pharmacies (Dis-Chem, Clicks), hospitals, and medical aid schemes.",
    problem: "Results come via fax. Prescriptions are handwritten. Medical aid claims are manually submitted. Every touchpoint between a practice and the broader health system is a manual, error-prone process.",
    solution: "API-first integration layer. Lab results flow directly into patient records. eScripts go to pharmacies digitally. Medical aid pre-authorisations and claims are automated. Hospital admissions sync in real-time.",
    features: [
      "Lab results integration (PathCare, Lancet, Ampath APIs)",
      "eScript/ePrescription to pharmacy networks",
      "Medical aid pre-authorisation automation",
      "Hospital admission/discharge sync",
      "NHLS (National Health Lab Service) integration",
      "HL7 FHIR health data interoperability",
      "Automated claim submission to major schemes",
    ],
    compliance: [
      "POPIA — Cross-border data transfer rules for cloud-hosted labs",
      "HPCSA — Scope of practice maintained in referral/lab ordering",
      "Medicines Act — ePrescription compliance with SAHPRA",
      "Medical Schemes Act — Claim submission rules per CMS",
    ],
    market: "Healthcare data interoperability is a R5B+ global market growing 15% YoY",
    revenue: "Per-transaction fees on lab orders, claims, prescriptions + monthly integration subscription",
  },
  {
    id: "visio-waiting-room",
    name: "Visio Waiting Room",
    tagline: "Digital Queue & Virtual Waiting Experience",
    icon: Clock,
    status: "Concept",
    statusColor: "bg-purple-500",
    color: "#0ea5e9",
    image: "/images/investor/product-waiting-room.png",
    description: "Transform the waiting room experience. Patients check in digitally, see their queue position in real-time, complete intake forms on their phone, and get notified when it's their turn.",
    problem: "SA waiting rooms are overcrowded, patients wait 2+ hours with no updates, paper intake forms are filled out every visit, and practices can't manage queue flow efficiently.",
    solution: "QR code check-in → digital intake forms (pre-filled from Netcare Health OS records) → real-time queue display → SMS/WhatsApp notification when doctor is ready. Waiting time analytics for practice optimization.",
    features: [
      "QR code self-check-in (no receptionist bottleneck)",
      "Digital intake forms (pre-filled from patient history)",
      "Real-time queue position display (TV/phone)",
      "SMS/WhatsApp \"Doctor is ready\" notifications",
      "Waiting time analytics & staff optimization",
      "Virtual waiting room (wait from your car/home)",
      "Multi-provider queue management",
      "Patient satisfaction surveys post-visit",
    ],
    compliance: [
      "POPIA — Digital consent for data collection at check-in",
      "HPCSA — Patient dignity maintained (no public health info display)",
      "CPA — Transparent waiting time communication",
      "ECTA — Electronic consent forms legally valid",
    ],
    market: "1.2M+ daily patient visits across SA private practices",
    revenue: "Per-practice monthly fee + per-check-in micro-fees for high-volume practices",
  },
  {
    id: "visiohealth-payer-connect",
    name: "Netcare Health OS Payer Connect",
    tagline: "Medical Aid Claims & Payment Bridge",
    icon: CreditCard,
    status: "Idea",
    statusColor: "bg-amber-500",
    color: "#f59e0b",
    image: "/images/investor/product-payer-connect.png",
    description: "Direct bridge between medical practices and medical aid schemes. Real-time eligibility checks, automated claims submission, payment tracking, and gap cover management.",
    problem: "Doctors submit claims manually (paper/fax). 30% of claims are rejected due to coding errors. Practices wait 30-90 days for payment. Patients don't know their co-pay until after treatment.",
    solution: "Real-time medical aid eligibility check before appointment. Auto-generate compliant ICD-10 + tariff code claims. Submit electronically. Track payment status. Calculate patient co-pay instantly.",
    features: [
      "Real-time member eligibility verification",
      "Automated ICD-10 + tariff code claim generation",
      "Electronic claim submission to all major schemes",
      "Claim status tracking & rejection management",
      "Patient co-pay calculator (before treatment)",
      "PMB (Prescribed Minimum Benefits) auto-detection",
      "Gap cover integration",
      "Revenue cycle analytics for practices",
    ],
    compliance: [
      "Medical Schemes Act — Compliant claim submission format",
      "ICD-10 SA MIT — Only valid Master Industry Table codes",
      "CMS Rules — External Cause Codes mandatory with injury claims",
      "HPCSA Booklet 19 — Ethical billing, informed financial consent",
      "POPIA — Patient financial data protection",
    ],
    market: "8.9M medical aid members in SA, R230B+ annual medical scheme expenditure",
    revenue: "Per-claim transaction fee (R5-R15/claim) + monthly subscription for practices",
  },
  {
    id: "visiomed-ai",
    name: "VisioMed AI",
    tagline: "Clinical Decision Support & AI Diagnostics",
    icon: Brain,
    status: "Concept",
    statusColor: "bg-purple-500",
    color: "#ec4899",
    image: "/images/investor/product-visiomed-ai.png",
    description: "AI-powered clinical decision support for doctors. Symptom analysis, differential diagnosis suggestions, drug interaction checks, treatment protocol recommendations — all evidence-based and SA-guideline compliant.",
    problem: "Doctors see 30-50 patients/day. Diagnostic errors account for ~10% of adverse events. Drug interactions are hard to track manually. SA treatment guidelines change frequently and aren't easily accessible at point of care.",
    solution: "AI assistant that sits alongside the doctor during consultations. Suggests differential diagnoses based on symptoms + patient history. Flags drug interactions. References SA treatment guidelines (Essential Drugs List, STGs). Never replaces clinical judgment — augments it.",
    features: [
      "Symptom-to-diagnosis AI (differential diagnosis list)",
      "Drug interaction checker (SA formulary)",
      "SA Essential Drugs List & Standard Treatment Guidelines",
      "ICD-10 code suggestion from clinical notes",
      "Clinical decision trees for common conditions",
      "Voice-to-notes (ElevenLabs integration)",
      "Medical literature search (PubMed, SA journals)",
      "Continuing Professional Development (CPD) tracking",
    ],
    compliance: [
      "HPCSA — AI as decision SUPPORT only, not replacement",
      "SAHPRA — No diagnostic claims without clinical validation",
      "Medicines Act — Drug information from SAHPRA-registered sources",
      "HPCSA Booklet 10 — Telehealth guidelines for remote AI use",
      "POPIA — Patient data used for AI never leaves SA jurisdiction",
    ],
    market: "Global clinical decision support market: $2.5B, growing 12% CAGR",
    revenue: "Per-seat monthly license (per doctor) + API access for hospital networks",
  },
];

const ecosystemStats = [
  { label: "Total Addressable Market", value: "R180B+", icon: Globe, desc: "SA private healthcare" },
  { label: "Target Practices", value: "12,000+", icon: Building2, desc: "Private practices in SA" },
  { label: "Medical Aid Members", value: "8.9M", icon: Users, desc: "Potential patient base" },
  { label: "Products in Ecosystem", value: "6", icon: Zap, desc: "One platform, one login" },
];

export default function InvestorEcosystem() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white">
        {/* Background image if available */}
        <img
          src="/images/investor/hero-ecosystem.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-lighten"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-6 h-6 text-[#8B5CF6]" />
            <span className="text-[#8B5CF6] font-medium text-sm uppercase tracking-wider">Netcare Health OS</span>
          </div>
          <h1 className="text-3xl font-bold font-serif mb-2">The Healthcare Operating System for Africa</h1>
          <p className="text-gray-300 text-base max-w-2xl mb-6">
            6 products. One ecosystem. One login. Replacing fragmented, manual healthcare workflows
            with AI-powered automation — from patient intake to medical aid claim settlement.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Valuation</p>
              <p className="text-lg font-bold text-[#8B5CF6]">R10,000,000</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">This Round</p>
              <p className="text-lg font-bold text-[#3DA9D1]">R1,000,000 for 10%</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Stage</p>
              <p className="text-lg font-bold text-white">Pre-Seed</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-gray-400">Core Product</p>
              <p className="text-lg font-bold text-[#3DA9D1]">Market Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ecosystemStats.map((stat) => (
          <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 font-serif">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Why This Matters */}
      <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-lg font-bold text-gray-900">Why Netcare Health OS Exists</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-1">The Problem</p>
            <p className="text-gray-600">SA&apos;s 12,000+ private practices run on paper, WhatsApp, fax machines, and 5-7 disconnected tools. Billing errors lose R2B+ annually. POPIA compliance is an afterthought.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Our Approach</p>
            <p className="text-gray-600">One AI-powered ecosystem that handles everything — from the moment a patient books to when the medical aid pays. Built for SA regulations from day one (HPCSA, POPIA, ICD-10, CPA).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">The Opportunity</p>
            <p className="text-gray-600">R180B healthcare market. No dominant SA-built practice management platform. International tools don&apos;t handle medical aids, ICD-10 SA MIT, or POPIA. We do.</p>
          </div>
        </div>
      </div>

      {/* Product Ecosystem Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">The Ecosystem — 6 Products</h2>
        <p className="text-sm text-gray-500 mb-6">Click any product to see full details, features, compliance mapping, and revenue model.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                expanded === product.id
                  ? "col-span-full border-[#8B5CF6]/30 bg-white shadow-lg"
                  : "border-gray-200 bg-white hover:border-[#8B5CF6]/30 hover:shadow-md"
              }`}
              onClick={() => setExpanded(expanded === product.id ? null : product.id)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${product.color}15` }}
                    >
                      <product.icon className="w-5 h-5" style={{ color: product.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-medium ${product.statusColor}`}>
                      {product.status}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${expanded === product.id ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <AnimatePresence>
                {expanded === product.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      {/* Product Image */}
                      {product.image && (
                        <div className="mb-4 rounded-lg overflow-hidden bg-gray-900 h-40">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      {/* Tabs */}
                      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-0.5">
                        {["overview", "features", "compliance", "market"].map((tab) => (
                          <button
                            key={tab}
                            onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                            className={`flex-1 text-xs font-medium py-1.5 rounded-md capitalize transition-all ${
                              activeTab === tab
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {activeTab === "overview" && (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <p className="text-sm font-semibold text-gray-900">The Problem</p>
                            </div>
                            <p className="text-sm text-gray-600">{product.problem}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-[#3DA9D1]" />
                              <p className="text-sm font-semibold text-gray-900">Our Solution</p>
                            </div>
                            <p className="text-sm text-gray-600">{product.solution}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === "features" && (
                        <div className="space-y-1.5">
                          {product.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-[#3DA9D1] mt-0.5 shrink-0" />
                              <span className="text-sm text-gray-700">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "compliance" && (
                        <div className="space-y-2">
                          {product.compliance.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3">
                              <Shield className="w-4 h-4 text-[#3DA9D1] mt-0.5 shrink-0" />
                              <span className="text-sm text-[#152736]">{c}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === "market" && (
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <p className="text-sm font-semibold text-blue-900">Market Opportunity</p>
                            </div>
                            <p className="text-sm text-blue-700">{product.market}</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-4 h-4 text-purple-600" />
                              <p className="text-sm font-semibold text-purple-900">Revenue Model</p>
                            </div>
                            <p className="text-sm text-purple-700">{product.revenue}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ecosystem Flow Diagram */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 font-serif">How It All Connects</h2>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <div className="bg-[#3DA9D1] text-[#152736] px-4 py-2 rounded-lg font-medium border border-[#3DA9D1]">
            Patient Books via Placeo
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-sky-100 text-sky-800 px-4 py-2 rounded-lg font-medium border border-sky-200">
            Checks In via Waiting Room
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-[#3DA9D1] text-[#152736] px-4 py-2 rounded-lg font-medium border border-[#3DA9D1]">
            Managed in Netcare Health OS
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg font-medium border border-pink-200">
            AI Assist via VisioMed AI
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-medium border border-indigo-200">
            Labs/Scripts via Integrator
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium border border-amber-200">
            Paid via Payer Connect
          </div>
        </div>
      </div>
    </div>
  );
}
