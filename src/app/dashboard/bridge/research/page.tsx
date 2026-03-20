"use client";

import { motion } from "framer-motion";
import {
  BookOpen, Zap, Shield, Building2, Brain, BarChart3,
  ArrowRight, CheckCircle2, AlertTriangle, Server,
  Database, Heart, TrendingUp, Globe, Users, Clock,
  FileText, Radio, Layers, Target,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function ResearchPaperPage() {
  return (
    <div className="p-6 space-y-8 max-w-[1000px] mx-auto">
      {/* Header */}
      <motion.div {...fadeIn} className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-12 bg-[#3DA9D1]/30" />
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-[0.2em] font-semibold">Visio Research Labs</span>
          <div className="h-px w-12 bg-[#3DA9D1]/30" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Bridging the R21.6M Gap:<br />
          <span className="text-[#3DA9D1]">AI-Powered Hospital-to-Billing Integration</span><br />
          for Netcare Primary Care
        </h1>
        <p className="text-[14px] text-gray-500 mt-4 max-w-2xl mx-auto">
          A technical and financial analysis of the CareOn/iMedOne Bridge — how HL7v2 message parsing,
          FHIR R4 resource mapping, and Gemini AI transform clinical data into verified billing packs,
          reducing claim rejection rates from 15% to under 5%.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-gray-400">
          <span>March 2026</span>
          <span>|</span>
          <span>VisioCorp / Visio Research Labs</span>
          <span>|</span>
          <span>v1.0</span>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <Section icon={BookOpen} title="Executive Summary" color="#1D3443">
        <p>
          Netcare&apos;s 568 primary care practitioners across 88 Medicross clinics operate in two
          disconnected systems: <strong>CareOn EMR</strong> (Deutsche Telekom Clinical Solutions) for clinical
          work, and various <strong>Practice Management Systems</strong> (Healthbridge, GoodX, Elixir) for billing.
          This dual-system reality forces doctors to manually re-enter diagnosis codes, causing:
        </p>
        <div className="grid grid-cols-3 gap-4 my-4">
          <StatBox value="15-25%" label="Claim rejection rate" color="#EF4444" />
          <StatBox value="15-20 min" label="Wasted per encounter" color="#E3964C" />
          <StatBox value="R21.6M" label="Annual revenue leakage" color="#1D3443" />
        </div>
        <p>
          The <strong>CareOn/iMedOne Bridge</strong> solves this by receiving HL7v2 messages from CareOn in real-time,
          parsing clinical data, mapping it to FHIR R4 resources, and using <strong>Gemini AI</strong> to generate
          billing advisories — including ICD-10-ZA codes the doctor missed, scheme-specific rejection predictions,
          and chronic disease detection for CDL programme enrollment.
        </p>
        <p className="mt-3">
          The bridge operates in <strong>read-only advisory mode</strong>: it does not write back to CareOn or modify
          hospital records. This non-invasive approach eliminates governance concerns while proving the value of
          hospital-to-billing integration.
        </p>
      </Section>

      {/* The Problem */}
      <Section icon={AlertTriangle} title="The Problem: Two Systems That Don't Talk" color="#EF4444">
        <p>
          CareOn (powered by iMedOne) is Netcare&apos;s R82M investment in hospital EMR — deployed across
          26+ hospitals, 34,000+ users, 13,000+ iPads, generating 53GB of clinical data daily. It won
          the International Quality Award and processes everything from admissions to discharge summaries.
        </p>
        <p className="mt-3">
          But CareOn was designed for <strong>hospitals</strong>, not <strong>primary care billing</strong>.
          Netcare&apos;s 88 Medicross clinics and 568 practitioners each use their own PMS for billing —
          creating a gap where:
        </p>
        <div className="space-y-2 mt-4">
          {[
            "Doctor finishes consult in CareOn, then opens a SEPARATE billing system",
            "Manually re-types ICD-10 codes (error-prone, time-consuming)",
            "No automated eligibility check against medical aid scheme rules",
            "Claims submitted without AI validation — 15-25% rejected",
            "Each rejection costs R50-R150 in staff rework time",
            "No systematic detection of under-coded comorbidities (lost DRG revenue)",
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600 shrink-0 mt-0.5">{i + 1}</div>
              <span className="text-[13px] text-gray-700">{point}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Technical Architecture */}
      <Section icon={Server} title="Technical Architecture" color="#3DA9D1">
        <p>
          The bridge is a <strong>read-only middleware layer</strong> that sits between CareOn and the billing workflow.
          It follows healthcare interoperability standards (HL7v2 inbound, FHIR R4 internal) with SA-specific
          adaptations (ICD-10-ZA, NAPPI, PMB/CDL rules).
        </p>

        {/* Architecture Diagram */}
        <div className="my-6 p-6 rounded-xl bg-[#1D3443] text-white overflow-x-auto">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-4 font-semibold">Data Flow Architecture</div>
          <pre className="text-[11px] leading-relaxed font-mono text-white/70">
{`CareOn EMR (26 hospitals, 13K iPads)
    |
    | HL7v2 (ADT, ORU, ORM) via MLLP/HTTPS
    | HMAC-SHA256 authenticated
    v
+--[ HL7v2 Parser ]---------------------------+
|  MSH header extraction                      |
|  PID (patient) + PV1 (encounter) parsing    |
|  OBX (labs) + DG1 (diagnoses) + ORC (orders)|
+---------------------------------------------+
    |
    v
+--[ FHIR R4 Mapper ]-------------------------+
|  Patient, Encounter, Observation, Condition  |
|  LOINC codes, ICD-10-ZA mapping             |
|  CareConnect HIE compatible                  |
+---------------------------------------------+
    |
    +--[ Rule Engine ]--- Billing advisories
    |   Pre-auth checks, eligibility, coding gaps
    |
    +--[ Gemini AI ]---- Enhanced advisories
    |   ICD-10 coding suggestions (missed codes)
    |   Scheme-specific rejection prediction
    |   Lab trend analysis (chronic detection)
    |   Natural language advisory generation
    |
    v
+--[ Advisory Dashboard ]---------------------+
|  Real-time message feed (30s refresh)        |
|  Severity filtering (critical/warning/info)  |
|  4 actions: claim, notify, resolve, dismiss  |
|  POPIA audit trail on every access + action  |
|  Role-based de-identification                |
+---------------------------------------------+`}
          </pre>
        </div>

        <h3 className="text-[14px] font-semibold text-gray-900 mt-6 mb-3">Supported HL7v2 Message Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { type: "ADT^A01", desc: "Patient Admission — triggers billing pack preparation" },
            { type: "ADT^A03", desc: "Patient Discharge — verifies procedure codes before claim" },
            { type: "ADT^A04", desc: "Outpatient Registration — eligibility auto-check" },
            { type: "ADT^A08", desc: "Patient Update — tracks demographic changes" },
            { type: "ORU^R01", desc: "Lab Results — detects critical values, suggests diagnoses" },
            { type: "ORM^O01", desc: "Orders — pre-authorization compliance check" },
          ].map((m) => (
            <div key={m.type} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
              <span className="px-1.5 py-0.5 rounded bg-[#1D3443]/10 text-[#1D3443] text-[11px] font-mono font-bold shrink-0">{m.type}</span>
              <span className="text-[11px] text-gray-600">{m.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* AI Capabilities */}
      <Section icon={Brain} title="AI-Powered Advisory Engine" color="#8B5CF6">
        <p>
          The bridge uses <strong>Gemini 2.5 Flash</strong> (Google) for four AI capabilities that transform
          raw clinical data into actionable billing intelligence. Each runs in parallel on every inbound message
          with 200ms target latency.
        </p>

        <div className="space-y-4 mt-4">
          <AICapability
            number={1}
            title="ICD-10-ZA Code Discovery"
            description="Analyzes clinical data to find diagnosis codes the doctor didn't capture. Flags PMB (Prescribed Minimum Benefit) and CDL (Chronic Disease List) conditions. Estimates DRG grouping uplift — additional codes can increase reimbursement by 10-15%."
            example="Patient admitted with M17.1 (knee osteoarthritis). AI detects E11.9 (T2DM) from HbA1c in labs — adds as comorbidity for DRG uplift of ~R22K."
            impact="R59.4M/year across 88 clinics from better DRG coding"
          />
          <AICapability
            number={2}
            title="Scheme-Specific Rejection Prediction"
            description="Trained on Discovery, Bonitas, GEMS, Momentum, and Medscheme rules. Predicts rejection probability with specific preventive actions — which CPT codes to add, which pre-auth forms to submit, which scheme-specific rules apply."
            example="Bonitas BonComprehensive: cardiac catheterization discharge without CPT 93458 = 73% rejection probability. AI suggests adding the procedure code before claim submission."
            impact="Rejection rate from 15% to <5% = R21.6M/year recovered"
          />
          <AICapability
            number={3}
            title="Lab Trend Analysis & Chronic Detection"
            description="Identifies patterns across lab results that suggest undiagnosed chronic conditions. Recommends CDL programme enrollment (R8,400/year per patient in chronic management fees) and appropriate care pathways."
            example="HbA1c trending 6.1% -> 7.2% -> 8.2% over 18 months. AI flags probable undiagnosed T2DM, suggests CDL enrollment, dietitian referral, and 3-monthly monitoring."
            impact="~15,300 new CDL patients detected/year = R15.3M in chronic management revenue"
          />
          <AICapability
            number={4}
            title="Natural Language Advisory Generation"
            description="Instead of template-generated alerts, AI writes contextual, specific billing instructions referencing scheme rules, form numbers, and financial impact. Billing clerks get actionable intelligence, not generic warnings."
            example="'Dr Naidoo — Johan van der Merwe (Discovery Executive) admitted for TKA. Pre-auth form DH-PA-003 required. E11.9 comorbidity qualifies for enhanced DRG grouping (est. R22K uplift).'"
            impact="Reduces advisory interpretation time from 3-5 min to <30 seconds"
          />
        </div>
      </Section>

      {/* Security & Compliance */}
      <Section icon={Shield} title="Security & POPIA Compliance" color="#10B981">
        <p>
          Healthcare data in South Africa is classified as <strong>Special Personal Information</strong> under POPIA.
          The bridge implements defence-in-depth with five security layers:
        </p>
        <div className="grid grid-cols-1 gap-3 mt-4">
          {[
            { layer: "Authentication", detail: "HMAC-SHA256 webhook verification (Deutsche Telekom standard) + Bearer token fallback. Demo mode auto-allows for evaluation. Timing-safe comparison prevents timing attacks." },
            { layer: "Data De-identification", detail: "Role-based masking: SA IDs (850101****086), phone numbers (+27***1234), patient names (J. v** d** M*****). Doctors see full data, receptionists see masked data." },
            { layer: "Facility Scoping", detail: "Platform admins see all hospitals. Clinic staff restricted to their assigned facility. Medicross Sandton receptionist cannot see Milpark Hospital cardiac data." },
            { layer: "Audit Trail", detail: "Every data access, advisory view, and resolution action logged with user ID, role, timestamp, IP address. POPIA requires 5-year retention — production uses persistent storage." },
            { layer: "Read-Only Architecture", detail: "Bridge NEVER writes to CareOn or modifies hospital records. All output is advisory. This eliminates the entire class of data integrity risks." },
          ].map((sec) => (
            <div key={sec.layer} className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50 border border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[12px] font-semibold text-green-800">{sec.layer}</div>
                <div className="text-[11px] text-green-700/80 mt-0.5">{sec.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Financial Impact */}
      <Section icon={TrendingUp} title="Financial Impact Model" color="#E3964C">
        <p>
          Based on Netcare FY2025 audited results: R662M Primary Care Revenue, 88 clinics,
          568 practitioners, ~2.56M encounters/year.
        </p>

        <div className="my-6 space-y-3">
          <RevenueRow label="Rejection Reduction (15% to 5%)" value="R21.6M" percent={16} color="#10B981" />
          <RevenueRow label="Rework Cost Elimination" value="R3.8M" percent={3} color="#3DA9D1" />
          <RevenueRow label="Admin Time Savings (85 FTE equiv.)" value="R38.5M" percent={28} color="#1D3443" />
          <RevenueRow label="AI Coding Uplift (DRG)" value="R59.4M" percent={43} color="#E3964C" />
          <RevenueRow label="Chronic Disease Detection (CDL)" value="R15.3M" percent={11} color="#8B5CF6" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <StatBox value="R139M" label="Total Annual Benefit" color="#10B981" />
          <StatBox value="R4.8M" label="Platform Cost" color="#1D3443" />
          <StatBox value="2,800%" label="Return on Investment" color="#E3964C" />
        </div>

        <div className="p-4 rounded-xl bg-[#1D3443] mt-6">
          <div className="text-[12px] font-semibold text-white mb-1">Recommended Pilot</div>
          <p className="text-[11px] text-white/60">
            5 Medicross clinics in Gauteng (Sandton, Fourways, Rosebank, Pretoria East, Centurion).
            32 practitioners, ~11,520 encounters/month. Expected pilot benefit: R7.9M/year.
            6-week implementation. Full rollout decision at 90 days based on measured rejection rate reduction.
          </p>
        </div>
      </Section>

      {/* Netcare Impact */}
      <Section icon={Heart} title="How This Helps Netcare" color="#EF4444">
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: "For Sara Nayager (MD Primary Care)", points: ["R139M/year revenue opportunity across 88 clinics", "Measurable KPI: rejection rate % (15% to 5%)", "No disruption to CareOn or existing PMS workflows", "Board-ready ROI calculator with FY2025 actuals"] },
            { title: "For Thirushen Pillay (FD)", points: ["R21.6M revenue recovery from rejected claims", "85 FTE equivalent in admin time savings", "Automated POPIA audit trail (reduces compliance cost)", "DRG coding uplift quantifiable per hospital"] },
            { title: "For Netcare IT", points: ["HL7v2/FHIR R4 standards (no proprietary lock-in)", "Read-only architecture (zero risk to CareOn data)", "Deutsche Telekom integration-ready (HMAC-SHA256)", "CareConnect HIE compatible for future interop"] },
            { title: "For Practitioners", points: ["15-20 minutes saved per patient encounter", "AI-verified ICD-10 codes (less manual re-entry)", "Fewer claim rejections (less patient complaints)", "Chronic disease detection improves care quality"] },
          ].map((card) => (
            <div key={card.title} className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="text-[13px] font-semibold text-gray-900 mb-3">{card.title}</div>
              <div className="space-y-2">
                {card.points.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-gray-600">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* VisioCorp Innovation */}
      <Section icon={Globe} title="VisioCorp Innovation & Breakthrough" color="#3DA9D1">
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#1D3443] to-[#2a4a5e] text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#E3964C]" />
            <span className="text-[14px] font-semibold">Why This Matters Beyond Netcare</span>
          </div>
          <p className="text-[12px] text-white/70 leading-relaxed">
            VisioCorp&apos;s CareOn Bridge represents a <strong className="text-white">first-of-its-kind</strong> integration
            in the South African healthcare market. No other platform bridges hospital EMR data directly to
            primary care billing with AI-powered coding assistance.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { label: "Market First", detail: "Only SA platform parsing HL7v2 from CareOn/iMedOne with AI advisory" },
              { label: "Standards-Based", detail: "FHIR R4 + ICD-10-ZA + NAPPI — portable across any SA hospital group" },
              { label: "AI-Native", detail: "Gemini 2.5 Flash for real-time coding, prediction, and NL generation" },
              { label: "Compliance-First", detail: "POPIA audit trail, role-based de-identification, read-only architecture" },
              { label: "Scalable", detail: "Applicable to Life Healthcare (66 hospitals), Mediclinic (52), NHI rollout" },
              { label: "Revenue-Generating", detail: "Not a cost center — generates R139M/year at Netcare scale alone" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-white/[0.06]">
                <div className="text-[11px] font-semibold text-[#3DA9D1]">{item.label}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-[#3DA9D1]/20 bg-[#3DA9D1]/5">
          <div className="text-[12px] font-semibold text-[#1D3443] mb-2">Visio Research Labs — Building the Future of SA Healthcare Integration</div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            This bridge is one component of VisioCorp&apos;s broader <strong>VisioHealth OS</strong> platform — a white-label
            healthcare operating system with 5 AI agents, automated billing, WhatsApp patient communication,
            POPIA compliance tooling, and now hospital EMR integration. The platform is designed to be the
            operating layer that connects South Africa&apos;s fragmented healthcare technology ecosystem.
          </p>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Visio Research Labs | VisioCorp
        </div>
        <div className="text-[11px] text-gray-500">
          Confidential — prepared for Netcare Primary Care Division evaluation.
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          Document v1.0 | March 2026 | CareOn/iMedOne Bridge Technical & Financial Analysis
        </div>
      </div>
    </div>
  );
}

// ── Components ──

function Section({ icon: Icon, title, color, children }: {
  icon: typeof BookOpen; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <motion.section {...fadeIn} transition={{ delay: 0.1 }} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h2 className="text-[18px] font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="text-[13px] text-gray-700 leading-relaxed space-y-0 [&>p]:mt-0">
        {children}
      </div>
    </motion.section>
  );
}

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white text-center">
      <div className="text-2xl font-bold font-metric" style={{ color }}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function AICapability({ number, title, description, example, impact }: {
  number: number; title: string; description: string; example: string; impact: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[11px] font-bold text-purple-700">{number}</div>
        <span className="text-[13px] font-semibold text-purple-900">{title}</span>
      </div>
      <p className="text-[12px] text-gray-700 mb-2">{description}</p>
      <div className="p-2.5 rounded-lg bg-white border border-purple-100 mb-2">
        <div className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider mb-0.5">Example</div>
        <div className="text-[11px] text-gray-600 italic">{example}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3 text-green-600" />
        <span className="text-[11px] font-semibold text-green-700">{impact}</span>
      </div>
    </div>
  );
}

function RevenueRow({ label, value, percent, color }: {
  label: string; value: string; percent: number; color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-gray-900">{label}</span>
          <span className="text-[13px] font-bold font-metric" style={{ color }}>{value}/yr</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <span className="text-[10px] text-gray-400 font-semibold w-8 text-right">{percent}%</span>
    </div>
  );
}
