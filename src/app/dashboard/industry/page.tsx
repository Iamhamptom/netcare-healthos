"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper, Shield, TrendingUp, BarChart3, Users, Activity,
  ChevronDown, ChevronRight, ExternalLink, AlertTriangle, Zap,
  Building2, Heart, Brain, Stethoscope, Pill, MapPin,
  Scale, FileText, Wifi, BatteryCharging, DollarSign,
  ArrowUpRight, CheckCircle2, Clock, Info,
} from "lucide-react";

// ─── Practice types ────────────────────────────────────────────────
type PracticeType = "gp" | "dental" | "specialist" | "hospital" | "pharmacy";

const PRACTICE_TYPES: { id: PracticeType; label: string; icon: typeof Stethoscope }[] = [
  { id: "gp", label: "GP", icon: Stethoscope },
  { id: "dental", label: "Dental", icon: Heart },
  { id: "specialist", label: "Specialist", icon: Brain },
  { id: "hospital", label: "Hospital", icon: Building2 },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
];

// ─── NHI Data ──────────────────────────────────────────────────────
const NHI_DATA = {
  status: "ON HOLD",
  statusColor: "#f59e0b",
  headline: "Constitutional Court Hearing: 5-7 May 2026",
  phases: [
    { label: "Phase 1", status: "current", desc: "Registration & contracting" },
    { label: "Phase 2", status: "upcoming", desc: "PHC services rollout" },
    { label: "Full Implementation", status: "future", desc: "Universal coverage" },
  ],
  impacts: {
    gp: "GPs will be contracted as NHI service providers. Capitation-based reimbursement likely replaces fee-for-service. Build chronic disease management capacity now — NHI prioritizes PHC.",
    dental: "Basic dental services included in Phase 1 benefits package. Cosmetic and orthodontic work stays private. Position for dual-stream revenue: NHI basic + private premium.",
    specialist: "Specialist referral pathways change under NHI — patients must come through contracted GPs. Build strong GP referral networks now before the gate closes.",
    hospital: "Private hospitals face regulated tariffs under NHI. Occupancy models will shift. Day-surgery and outpatient capacity becomes more valuable than inpatient beds.",
    pharmacy: "NHI centralizes pharmaceutical procurement. Independent pharmacies must differentiate through clinical services, chronic dispensing, and primary care services.",
  },
};

// ─── Regulations ───────────────────────────────────────────────────
interface Regulation {
  title: string;
  authority: string;
  authorityColor: string;
  status: string;
  statusColor: string;
  effectiveDate?: string;
  practiceTypes: PracticeType[];
  impact: Record<PracticeType, string>;
  urgency: "critical" | "high" | "medium" | "low";
}

const REGULATIONS: Regulation[] = [
  {
    title: "National Health Insurance Act",
    authority: "Department of Health",
    authorityColor: "#3b82f6",
    status: "Constitutional Challenge",
    statusColor: "#f59e0b",
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    urgency: "critical",
    impact: {
      gp: "Your practice will be contracted under NHI. Prepare capitation-based billing systems and chronic disease management protocols.",
      dental: "Basic dental included in Phase 1. Prepare for split revenue: NHI-funded basics + private cosmetic/ortho.",
      specialist: "Referral pathways will change. Strengthen GP networks now — NHI requires gatekeeper referrals.",
      hospital: "Tariff regulation incoming. Shift focus to day-surgery and outpatient to maintain margins.",
      pharmacy: "Centralized procurement will change your supply chain. Diversify into clinical services.",
    },
  },
  {
    title: "HPCSA Fee Guidelines 2026",
    authority: "HPCSA",
    authorityColor: "#8b5cf6",
    status: "Published",
    statusColor: "#10b981",
    effectiveDate: "1 January 2026",
    practiceTypes: ["gp", "dental", "specialist"],
    urgency: "high",
    impact: {
      gp: "New fee schedule in effect. Review your practice management system billing codes. Average increase: 5.2% — below healthcare inflation of 8.5%.",
      dental: "Dental procedure codes updated. ADA code mapping changed for 14 procedures. Update your billing system immediately.",
      specialist: "Specialist consultation fees updated. Ensure your rooms rate aligns with new guidelines to avoid medical aid rejections.",
      hospital: "Facility fees updated in line with new HPCSA guidelines.",
      pharmacy: "Dispensing fees adjusted in new schedule.",
    },
  },
  {
    title: "POPIA Health Data Compliance",
    authority: "Information Regulator",
    authorityColor: "#ef4444",
    status: "ENFORCED — NO Grace Period",
    statusColor: "#ef4444",
    effectiveDate: "6 March 2026",
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    urgency: "critical",
    impact: {
      gp: "Patient records are special personal information under POPIA. You need explicit consent for processing, proper encryption, and a designated Information Officer. Fines up to R10M.",
      dental: "Digital X-rays, treatment plans, and patient photos all fall under POPIA. Ensure your imaging software has proper access controls and consent workflows.",
      specialist: "Sharing patient data with referring doctors requires documented consent. Your referral workflows must include POPIA-compliant data sharing agreements.",
      hospital: "Multi-department access to patient records requires role-based access control. Audit trail logging is mandatory. Data breach notification within 72 hours.",
      pharmacy: "Prescription records and chronic medication data are protected. Implement proper data retention policies and secure disposal procedures.",
    },
  },
  {
    title: "SAHPRA Medical Device Registration",
    authority: "SAHPRA",
    authorityColor: "#0ea5e9",
    status: "Transitional",
    statusColor: "#f59e0b",
    practiceTypes: ["dental", "specialist", "hospital"],
    urgency: "medium",
    impact: {
      gp: "Diagnostic devices must be SAHPRA registered. Check your point-of-care testing equipment compliance.",
      dental: "Dental implant systems and materials must be SAHPRA registered. Verify your supplier compliance — unregistered devices = personal liability.",
      specialist: "Surgical instruments and implantable devices face new registration requirements. Lead times increasing to 6-12 months for new device approvals.",
      hospital: "Full medical device audit required. Theatre equipment, monitoring systems, and consumables all need SAHPRA registration verification.",
      pharmacy: "OTC medical devices you stock must be SAHPRA compliant. Check glucose monitors, blood pressure devices, nebulizers.",
    },
  },
  {
    title: "Telemedicine Guidelines",
    authority: "HPCSA",
    authorityColor: "#8b5cf6",
    status: "Active",
    statusColor: "#10b981",
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    urgency: "medium",
    impact: {
      gp: "Teleconsultations are billable. 35% of GP consultations can be done remotely. Implement a video platform to capture after-hours revenue.",
      dental: "Limited to triage and follow-up consultations. Use for post-op checks and emergency triage — saves chair time for procedures.",
      specialist: "Follow-up consultations and second opinions can be done via telemedicine. Reduces DNA rates by 40% for follow-ups.",
      hospital: "Remote monitoring and virtual ward rounds now permitted. Reduces unnecessary admissions and improves discharge follow-up.",
      pharmacy: "Telepharmacy consultations permitted for chronic medication management. Opportunity for chronic dispensing service expansion.",
    },
  },
  {
    title: "OHSC Norms and Standards",
    authority: "OHSC",
    authorityColor: "#10b981",
    status: "Active",
    statusColor: "#10b981",
    practiceTypes: ["gp", "hospital"],
    urgency: "high",
    impact: {
      gp: "Clinic infrastructure standards enforced. Waiting room capacity, infection control, and emergency equipment requirements apply. Inspections can be unannounced.",
      dental: "Sterilization protocols and infection control under scrutiny. Autoclave logs and instrument tracking are auditable.",
      specialist: "Procedure room standards apply if you perform office-based procedures. Ensure compliance with equipment maintenance schedules.",
      hospital: "Full compliance required. 7 domains assessed: patient rights, clinical governance, clinical care, patient safety, positive care environment, leadership, operational management.",
      pharmacy: "Good Pharmacy Practice standards enforced by SAPC. Temperature monitoring for cold-chain medications is inspected.",
    },
  },
  {
    title: "Certificate of Need (Proposed)",
    authority: "Department of Health",
    authorityColor: "#3b82f6",
    status: "Proposed — Not Yet Enacted",
    statusColor: "#6b7280",
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    urgency: "low",
    impact: {
      gp: "If enacted, new practice openings will require government approval based on area need. Existing practices grandfathered. Expansion plans should accelerate now.",
      dental: "New dental practices may need Certificate of Need approval. If you plan to open a second practice or relocate, consider doing it before enactment.",
      specialist: "Specialist practice establishment in over-served areas could be restricted. Rural and township practices would get priority approval.",
      hospital: "New hospital beds and facility expansions would require government authorization. Current bed licenses become extremely valuable assets.",
      pharmacy: "New pharmacy licenses already regulated by SAPC. Certificate of Need would add another layer. Current license holders are protected.",
    },
  },
  {
    title: "CMS LCBO Regulations",
    authority: "Council for Medical Schemes",
    authorityColor: "#d946ef",
    status: "Under Review",
    statusColor: "#f59e0b",
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    urgency: "medium",
    impact: {
      gp: "Low Cost Benefit Options expanding coverage to lower-income groups. New patient pool but at lower tariffs. Volume-based strategy needed.",
      dental: "Basic dental included in LCBO packages. Preventive care emphasis — scale and clean revenue increases but complex procedures excluded.",
      specialist: "Limited specialist access in LCBO plans — referral requirements strict. Build strong GP networks to capture LCBO referrals.",
      hospital: "LCBO patients have day-surgery preference. Adjust capacity planning. Lower tariffs but higher volumes expected.",
      pharmacy: "LCBO formularies are restricted. Stock accordingly. Generics and biosimilars prioritized over originator brands.",
    },
  },
];

// ─── Trends ────────────────────────────────────────────────────────
interface Trend {
  name: string;
  stat: string;
  impact: "HIGH" | "MEDIUM";
  impactColor: string;
  icon: typeof TrendingUp;
  practiceTypes: PracticeType[];
  affects: Record<PracticeType, string>;
}

const TRENDS: Trend[] = [
  {
    name: "Telemedicine Adoption",
    stat: "35% adoption",
    impact: "HIGH",
    impactColor: "#ef4444",
    icon: Wifi,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "Patients expect virtual consultations. Practices without telemedicine lose after-hours revenue and chronic management patients to digital-first competitors.",
      dental: "Use for triage and post-op follow-ups. Saves 2-3 chair hours per week. Patients under 35 prefer booking through apps, not phone calls.",
      specialist: "Virtual second opinions and follow-ups reduce DNA rates by 40%. Cross-border consultations open new revenue streams.",
      hospital: "Virtual ward rounds and remote monitoring reduce unnecessary admissions by 15%. Discharge follow-up compliance improves 60%.",
      pharmacy: "Telepharmacy enables chronic medication management at scale. Remote counseling for new prescriptions reduces returns.",
    },
  },
  {
    name: "AI in Healthcare",
    stat: "64% exploring",
    impact: "HIGH",
    impactColor: "#ef4444",
    icon: Brain,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "AI-assisted diagnosis improves accuracy for common conditions by 20%. Automated triage, clinical decision support, and coding optimization are immediate wins.",
      dental: "AI-powered X-ray analysis detects caries and periodontal disease with 95% accuracy. Reduces diagnostic time and improves treatment planning consistency.",
      specialist: "AI imaging analysis for radiology, pathology, and dermatology is production-ready. Early adopters see 30% efficiency gains in reporting.",
      hospital: "Predictive analytics for bed management, sepsis detection, and readmission risk are reducing costs by 8-12% in early-adopter hospitals.",
      pharmacy: "AI drug interaction checking and dose optimization reduce adverse events. Inventory management AI cuts waste by 25%.",
    },
  },
  {
    name: "Mental Health Demand",
    stat: "30% demand rise",
    impact: "HIGH",
    impactColor: "#ef4444",
    icon: Heart,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "1 in 3 GP consultations now have a mental health component. Screen for depression/anxiety routinely — medical aids are funding integrated mental health care.",
      dental: "Dental anxiety affects 36% of patients. Practices offering sedation and anxiety management see 25% higher case acceptance.",
      specialist: "Psychiatry and psychology wait times at 8-12 weeks. Opportunity for shared care models with GPs for mild-moderate cases.",
      hospital: "Psychiatric bed demand up 25%. Emergency department mental health presentations require dedicated pathways and trained staff.",
      pharmacy: "Antidepressant prescriptions up 18% YoY. Pharmacist-led mental health screening and medication therapy management opportunities.",
    },
  },
  {
    name: "Dental Market Growth",
    stat: "7.2% CAGR",
    impact: "MEDIUM",
    impactColor: "#f59e0b",
    icon: TrendingUp,
    practiceTypes: ["dental"],
    affects: {
      gp: "Refer dental cases proactively — oral health screening at GP visits builds referral relationships.",
      dental: "Market growing faster than GDP. Cosmetic dentistry +15%, clear aligners +25%. Urban practices should offer premium services. Rural areas severely under-served — opportunity for mobile clinics.",
      specialist: "Maxillofacial surgery demand growing with dental implant market. Cross-referral partnerships with dental practices are valuable.",
      hospital: "Dental theatre time demand increasing for complex cases. Day-surgery dental suites are high-margin additions.",
      pharmacy: "Oral care product category growing 9%. Stock premium oral care, whitening products, and orthodontic accessories.",
    },
  },
  {
    name: "Digital Patient Engagement",
    stat: "78% prefer online booking",
    impact: "HIGH",
    impactColor: "#ef4444",
    icon: Activity,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "Patients under 40 will not call to book. Online booking, WhatsApp communication, and digital forms are table stakes. Practices without them lose 30% of potential new patients.",
      dental: "Online reviews drive 65% of new dental patient decisions. Automated review requests and a strong Google Business presence are essential.",
      specialist: "Digital referral portals that give GPs real-time status updates generate 3x more referrals than fax-based systems.",
      hospital: "Patient portals with lab results, appointment scheduling, and billing reduce admin staff workload by 25%. Patient satisfaction scores improve 15%.",
      pharmacy: "Chronic medication ordering via app reduces dispensing queue times by 40%. Delivery services are expected by urban patients.",
    },
  },
  {
    name: "Healthcare Cost Inflation",
    stat: "8.5% vs 5.3% CPI",
    impact: "HIGH",
    impactColor: "#ef4444",
    icon: DollarSign,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "Practice costs rising faster than fee increases. Staff salaries (+9%), medical supplies (+12%), and electricity (+15%) squeeze margins. Automation and efficiency are survival strategies.",
      dental: "Material costs up 14% (imported supplies + rand weakness). Lab fees up 11%. Review pricing quarterly, not annually. Offer payment plans for larger cases.",
      specialist: "Consumable and implant costs rising 10-15% annually. Medical aid tariff increases at 5.2% create a growing gap. Negotiate supplier contracts aggressively.",
      hospital: "Staff costs (65% of expenses) rising above inflation. Agency nursing costs up 20%. Invest in retention and training to reduce reliance on agencies.",
      pharmacy: "Medicine price inflation managed by SEP, but operational costs rising 8-10%. Dispensing fee increases lag behind cost inflation. Diversify revenue streams.",
    },
  },
  {
    name: "Doctor Emigration Risk",
    stat: "12% considering",
    impact: "MEDIUM",
    impactColor: "#f59e0b",
    icon: MapPin,
    practiceTypes: ["gp", "specialist", "hospital"],
    affects: {
      gp: "1 in 8 GPs considering emigration. Creates opportunity for remaining practices to absorb patient panels. Locum costs rising 15% as supply tightens.",
      dental: "Dental emigration lower than medical (8%). SA dental qualifications recognized in UK, Australia, Canada. Retention through practice ownership and lifestyle.",
      specialist: "Specialist emigration highest in surgical disciplines. Creates referral consolidation — fewer specialists means more referrals per practice.",
      hospital: "Doctor shortages affect theatre utilization and call rosters. Competitive retention packages and flexible working arrangements are essential.",
      pharmacy: "Pharmacist emigration at 6%. Community pharmacy ownership model provides stronger retention than hospital pharmacy.",
    },
  },
  {
    name: "Load Shedding Impact",
    stat: "R4.2B annual cost",
    impact: "MEDIUM",
    impactColor: "#f59e0b",
    icon: BatteryCharging,
    practiceTypes: ["gp", "dental", "specialist", "hospital", "pharmacy"],
    affects: {
      gp: "Generator/inverter is now a practice essential, not a luxury. Patient no-shows increase 20% during load shedding. Solar ROI is 3-4 years for most practices.",
      dental: "Dental equipment requires stable power. Inverter systems must handle compressors, suction, and autoclaves simultaneously. Budget R80K-R150K for adequate backup.",
      specialist: "Sensitive diagnostic equipment needs UPS protection. Appointment scheduling should account for load shedding schedules to protect equipment and patient flow.",
      hospital: "Generator fuel costs up 300% over 3 years. Solar + battery hybrid systems are being adopted by leading hospital groups. ICU and theatre backup is non-negotiable.",
      pharmacy: "Cold chain integrity for vaccines and biologics at risk. Temperature monitoring and backup power for fridges are regulatory requirements, not optional.",
    },
  },
];

// ─── Market Snapshot ───────────────────────────────────────────────
const MARKET_STATS = [
  { label: "Total SA Hospitals", value: "624", icon: Building2, color: "#3b82f6" },
  { label: "Medical Scheme Members", value: "9.17M", subtitle: "14.8% of population", icon: Shield, color: "#8b5cf6" },
  { label: "Healthcare Spend", value: "R580B", subtitle: "8.5% of GDP", icon: DollarSign, color: "#10b981" },
  { label: "Registered Doctors", value: "45,000", icon: Stethoscope, color: "#f59e0b" },
  { label: "Registered Dentists", value: "12,500", icon: Heart, color: "#ec4899" },
  { label: "Nurse Shortage by 2030", value: "131K-166K", icon: Users, color: "#ef4444" },
  { label: "Dental Market CAGR", value: "7.2%", icon: TrendingUp, color: "#14b8a6" },
  { label: "Private Hospital Beds", value: "~35,000", icon: Building2, color: "#6366f1" },
];

// ─── Competitive Landscape ─────────────────────────────────────────
const LANDSCAPE: Record<PracticeType, { summary: string; bullets: string[] }> = {
  gp: {
    summary: "45,000 GPs serve 62M people. The primary care landscape is shifting toward chronic disease management and integrated care.",
    bullets: [
      "35% of patients have undiagnosed hypertension — screening = recurring revenue",
      "Chronic disease management (diabetes, hypertension, HIV) is the most reliable revenue stream under NHI",
      "Digital-first practices capturing 30% more new patients than phone-only practices",
      "After-hours telemedicine adds R15K-R25K/month in revenue for early adopters",
    ],
  },
  dental: {
    summary: "12,500 dentists serve 62M people (1:4,960 ratio). The dental market is one of the fastest-growing healthcare segments in South Africa.",
    bullets: [
      "Cosmetic dentistry growing 15% — teeth whitening and veneers highest demand",
      "Clear aligner market +25% YoY — Invisalign and local alternatives both growing",
      "Rural areas severely under-served — mobile dental clinics have 6-month waiting lists",
      "Dental tourism from SADC countries is a R200M+ opportunity in border regions",
    ],
  },
  specialist: {
    summary: "22,000 registered specialists. The specialist landscape is being reshaped by emigration, task-shifting, and digital health.",
    bullets: [
      "12% emigration risk — creates consolidation opportunity for remaining specialists",
      "Task-shifting to nurse practitioners is changing primary care referral patterns",
      "Digital referral platforms generate 3x more referrals than traditional fax/phone",
      "Sub-specialization is the strongest differentiator — generalist specialists face margin pressure",
    ],
  },
  hospital: {
    summary: "624 hospitals (216 private, 408 public). Private hospital groups face margin pressure from medical aid negotiations and NHI uncertainty.",
    bullets: [
      "Day-surgery volumes growing 12% annually — lower cost, faster turnover",
      "Occupancy rates averaging 65% — below the 75% profitability threshold for many facilities",
      "Nurse staffing is the #1 operational challenge — agency costs up 20% YoY",
      "Hospital-at-home models being piloted by Netcare and Mediclinic — potential 30% cost reduction",
    ],
  },
  pharmacy: {
    summary: "4,200 retail pharmacies. The pharmacy model is evolving from dispensing-focused to clinical service provider.",
    bullets: [
      "Pharmacist-initiated therapy (PIT) for common conditions now permitted — new revenue stream",
      "Chronic dispensing license (CDL) holders have 40% higher revenue per patient",
      "E-commerce pharmacy growing 35% — Clicks, Dis-Chem, and independents all investing",
      "Vaccination services now a permanent revenue stream post-COVID — flu, HPV, travel vaccines",
    ],
  },
};

// ─── Components ────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, icon: Icon, iconColor }: {
  title: string; subtitle?: string; icon: typeof TrendingUp; iconColor: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + "15" }}>
        <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function RegulationCard({ reg, practiceType }: { reg: Regulation; practiceType: PracticeType }) {
  const [expanded, setExpanded] = useState(false);
  const urgencyColors = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#6b7280" };
  const urgencyLabels = { critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW" };

  return (
    <motion.div
      layout
      className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300"
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight">{reg.title}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: urgencyColors[reg.urgency] + "15", color: urgencyColors[reg.urgency] }}
            >
              {urgencyLabels[reg.urgency]}
            </span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: reg.authorityColor + "12", color: reg.authorityColor }}
          >
            {reg.authority}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: reg.statusColor + "12", color: reg.statusColor }}
          >
            {reg.status}
          </span>
          {reg.effectiveDate && (
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {reg.effectiveDate}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-teal-500" />
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">Impact on Your Practice</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-teal-200 bg-teal-50/50 rounded-r-lg p-3">
                  {reg.impact[practiceType]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TrendCard({ trend, practiceType }: { trend: Trend; practiceType: PracticeType }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = trend.icon;

  return (
    <motion.div
      layout
      className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-300"
    >
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-50">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">{trend.name}</h4>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                style={{ backgroundColor: trend.impactColor + "15", color: trend.impactColor }}
              >
                {trend.impact}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{trend.stat}</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded-full bg-teal-500" />
                  <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">How This Affects Your Practice</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pl-3 border-l-2 border-teal-200 bg-teal-50/50 rounded-r-lg p-3">
                  {trend.affects[practiceType]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function IndustryIntelligencePage() {
  const [practiceType, setPracticeType] = useState<PracticeType>("gp");
  const [nhiExpanded, setNhiExpanded] = useState(false);

  const filteredRegulations = REGULATIONS.filter(
    (r) => r.practiceTypes.includes(practiceType)
  );
  const filteredTrends = TRENDS.filter(
    (t) => t.practiceTypes.includes(practiceType)
  );
  const landscape = LANDSCAPE[practiceType];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3DA9D1] flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-[#3DA9D1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Industry Intelligence</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">South African Healthcare Sector</span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#3DA9D1] text-[#3DA9D1] border border-[#3DA9D1]">
                Powered by Visio Intel
              </span>
            </div>
          </div>
        </div>

        {/* Practice Type Selector */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {PRACTICE_TYPES.map((pt) => {
            const Icon = pt.icon;
            const isActive = practiceType === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => setPracticeType(pt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#1D3443] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{pt.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Section 1: NHI Tracker Banner ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900">National Health Insurance</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 uppercase tracking-wider">
                    {NHI_DATA.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-amber-700 mt-0.5">{NHI_DATA.headline}</p>
              </div>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex items-center gap-2 mb-3">
            {NHI_DATA.phases.map((phase, i) => (
              <div key={phase.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  phase.status === "current"
                    ? "bg-amber-200 text-amber-800"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {phase.status === "current" && <div className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
                  {phase.label}
                </div>
                {i < NHI_DATA.phases.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          {/* Collapsible Impact */}
          <button
            onClick={() => setNhiExpanded(!nhiExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            What this means for your practice
            <motion.div animate={{ rotate: nhiExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence>
            {nhiExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mt-3 p-3 bg-white/60 rounded-lg border border-amber-200/50">
                  <p className="text-sm text-gray-700 leading-relaxed">{NHI_DATA.impacts[practiceType]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Section 2: Regulations ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SectionHeader
          title="Regulations That Affect You"
          subtitle={`${filteredRegulations.length} active regulations for ${PRACTICE_TYPES.find(p => p.id === practiceType)?.label} practices`}
          icon={FileText}
          iconColor="#8b5cf6"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredRegulations.map((reg) => (
            <RegulationCard key={reg.title} reg={reg} practiceType={practiceType} />
          ))}
        </div>
      </motion.div>

      {/* ── Section 3: Industry Trends ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionHeader
          title="Industry Trends"
          subtitle="Curated trends relevant to your practice type"
          icon={TrendingUp}
          iconColor="#10b981"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredTrends.map((trend) => (
            <TrendCard key={trend.name} trend={trend} practiceType={practiceType} />
          ))}
        </div>
      </motion.div>

      {/* ── Section 4: Market Snapshot ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <SectionHeader
          title="Market Snapshot"
          subtitle="South African healthcare at a glance"
          icon={BarChart3}
          iconColor="#3b82f6"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MARKET_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                className="p-4 rounded-xl border border-gray-200 bg-white transition-all"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: stat.color + "12" }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                {"subtitle" in stat && stat.subtitle && (
                  <div className="text-[10px] text-gray-500 mt-0.5">{stat.subtitle}</div>
                )}
                <div className="text-[11px] text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Section 5: Competitive Landscape ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SectionHeader
          title="Your Competitive Landscape"
          subtitle={`Intelligence for ${PRACTICE_TYPES.find(p => p.id === practiceType)?.label} practices`}
          icon={Users}
          iconColor="#f59e0b"
        />
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{landscape.summary}</p>
          <div className="space-y-2.5">
            {landscape.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Section 6: CTA ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-xl border border-[#3DA9D1] bg-gradient-to-r from-[#3DA9D1] to-teal-50 p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Want deeper intelligence?</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
              Access the full Health Sector Portal on Visio Intel — includes 42 facility profiles,
              17 medical scheme comparisons, 24 regulations, 22 trends, workforce data, and disease burden analysis.
            </p>
          </div>
          <a
            href="https://visio-intel.vercel.app/intelligence/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#3DA9D1] text-white text-sm font-semibold hover:bg-[#1D3443] transition-colors shadow-sm shrink-0"
          >
            Open Visio Intel
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* ── Footer Note ────────────────────────────────────────── */}
      <div className="text-center pb-4">
        <p className="text-[11px] text-gray-400">
          Data curated from HPCSA, CMS, SAHPRA, Department of Health, OHSC, StatsSA, and industry sources.
          Last updated: March 2026.
        </p>
      </div>
    </div>
  );
}
