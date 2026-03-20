"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, ArrowRight, HeartPulse,
  TrendingUp, Shield, Users, CreditCard, Settings,
  FileText, GraduationCap, Stethoscope, BarChart3,
} from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  details: string[];
  status: "complete" | "current" | "upcoming";
};

const investorSteps: Step[] = [
  {
    id: "welcome",
    title: "Welcome & Introduction",
    description: "Meet the Netcare Health OS team, understand the vision, and review the ecosystem.",
    icon: HeartPulse,
    color: "#8B5CF6",
    details: [
      "Founder introduction call with David Hampton",
      "Walk through the investor portal (this platform)",
      "Review the 6-product ecosystem and roadmap",
      "Discuss the \"Saving Time Saves Lives\" mission",
    ],
    status: "complete",
  },
  {
    id: "due-diligence",
    title: "Due Diligence & Review",
    description: "Review all documentation, compliance, and platform capabilities.",
    icon: FileText,
    color: "#3B82F6",
    details: [
      "Review Terms & Conditions, Privacy Policy, DPA",
      "Review HPCSA Compliance Statement",
      "Examine compliance mapping across all 7 SA regulations",
      "Access research portal — market intelligence and competitive analysis",
      "Product demo — full walkthrough of Netcare Health OS",
    ],
    status: "current",
  },
  {
    id: "investment",
    title: "Investment Agreement",
    description: "Formalise the investment terms and complete the transaction.",
    icon: TrendingUp,
    color: "#10b981",
    details: [
      "Review and sign investment agreement (R1,000,000 for 10%)",
      "Shareholder agreement execution",
      "CIPC registration update (if applicable)",
      "Bank transfer and confirmation",
      "Welcome as a Netcare Health OS shareholder",
    ],
    status: "upcoming",
  },
  {
    id: "advisory",
    title: "Advisory Role Setup",
    description: "Establish your advisory role and communication channels.",
    icon: Shield,
    color: "#f59e0b",
    details: [
      "Define advisory scope and focus areas",
      "Set up regular check-in schedule (monthly/quarterly)",
      "Access to notes system for ongoing feedback",
      "Introductions to key team members",
      "Access to platform analytics and growth metrics",
    ],
    status: "upcoming",
  },
  {
    id: "ongoing",
    title: "Ongoing Partnership",
    description: "Regular updates, quarterly reviews, and strategic input.",
    icon: BarChart3,
    color: "#ec4899",
    details: [
      "Monthly investor updates (MRR, clients, growth)",
      "Quarterly board/advisory meetings",
      "Access to research portal for new market intelligence",
      "Input on product roadmap and healthcare strategy",
      "Network introductions and partnership facilitation",
    ],
    status: "upcoming",
  },
];

const clientSteps: Step[] = [
  {
    id: "signup",
    title: "Practice Registration",
    description: "Create your Netcare Health OS account and set up your practice profile.",
    icon: Users,
    color: "#10b981",
    details: [
      "Register with your HPCSA-verified email",
      "Complete practice profile (name, type, address, phone)",
      "Set up white-label branding (logo, colours, subdomain)",
      "Choose subscription plan (Starter / Core / Professional / Enterprise)",
    ],
    status: "complete",
  },
  {
    id: "configuration",
    title: "Practice Configuration",
    description: "Configure your booking page, services, and staff accounts.",
    icon: Settings,
    color: "#3B82F6",
    details: [
      "Set up booking services (consultation types, durations, prices)",
      "Configure booking page (welcome message, deposit settings)",
      "Add staff accounts (doctors, nurses, receptionists) with role-based access",
      "Set up notification preferences (WhatsApp, SMS, email)",
      "Configure daily task templates",
    ],
    status: "current",
  },
  {
    id: "data",
    title: "Data Import & Setup",
    description: "Import existing patient data and set up your practice records.",
    icon: FileText,
    color: "#8B5CF6",
    details: [
      "Bulk import patients via CSV (name, phone, email, medical aid)",
      "Set up ICD-10 billing codes for your specialty",
      "Configure medical aid scheme preferences",
      "Import existing appointment history (optional)",
      "Set up POPIA consent templates",
    ],
    status: "upcoming",
  },
  {
    id: "training",
    title: "AI Training & Education",
    description: "Private hands-on training for you and your entire staff.",
    icon: GraduationCap,
    color: "#f59e0b",
    details: [
      "AI in Healthcare Fundamentals (2 hours) — for doctors",
      "Platform Mastery (4 hours) — full feature walkthrough",
      "Staff AI Literacy (1.5 hours) — for all team members",
      "POPIA & Data Protection training (1.5 hours)",
      "Ongoing support and refresher sessions",
    ],
    status: "upcoming",
  },
  {
    id: "leads",
    title: "Client Acquisition Launch",
    description: "Qualified leads packaged into your plan — loaded directly into your pipeline.",
    icon: Stethoscope,
    color: "#ec4899",
    details: [
      "Starter plan: 20 qualified leads included at onboarding",
      "Core plan: 50 qualified leads included at onboarding",
      "Professional plan: 100 qualified leads included at onboarding",
      "Enterprise plan: 200 qualified leads + GP referral network setup",
      "Leads loaded directly into Netcare Health OS patient pipeline",
      "Medical directory optimisation (Medpages, TopDocs, Google Business)",
      "Compliant digital presence audit and recommendations",
      "Additional leads available at R50-R150 per qualified lead",
    ],
    status: "upcoming",
  },
  {
    id: "golive",
    title: "Go Live",
    description: "Your full digital practice goes live — website, booking, referrals, AI, and all.",
    icon: HeartPulse,
    color: "#10b981",
    details: [
      "White-labeled practice website live (SEO-optimized landing page)",
      "Public booking engine live with deposit collection",
      "GP referral portal active — GPs can refer digitally",
      "AI symptom checker live (patient \u2192 booking funnel)",
      "AI agents active (triage, intake, follow-up, billing, scheduler)",
      "Google Business Profile optimized and verified",
      "Medical directory listings live (Medpages, RecoMed)",
      "WhatsApp/SMS reminders configured",
      "First week support — daily check-ins",
      "30-day review and optimisation session",
    ],
    status: "upcoming",
  },
  {
    id: "payment",
    title: "Payment & Billing Setup",
    description: "Set up payment collection via Yoco or bank transfer.",
    icon: CreditCard,
    color: "#f59e0b",
    details: [
      "Connect payment method (Yoco card machine / bank EFT)",
      "Configure subscription billing (monthly auto-debit)",
      "Set up patient payment collection (deposits, co-pays)",
      "API key issued for credit-based usage billing",
      "First invoice generated and sent",
    ],
    status: "upcoming",
  },
];

function StepCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const statusStyles = {
    complete: "border-[#3DA9D1] bg-[#3DA9D1]/50",
    current: "border-[#8B5CF6]/30 bg-[#8B5CF6]/5 shadow-md",
    upcoming: "border-gray-200 bg-white",
  };

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step.status === "complete"
              ? "bg-[#3DA9D1] text-white"
              : step.status === "current"
              ? "bg-[#8B5CF6] text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {step.status === "complete" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <span className="text-xs font-bold">{index + 1}</span>
          )}
        </div>
        {index < total - 1 && (
          <div className={`w-0.5 flex-1 my-1 ${
            step.status === "complete" ? "bg-[#3DA9D1]" : "bg-gray-200"
          }`} />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex-1 border rounded-xl p-4 mb-3 ${statusStyles[step.status]}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <step.icon className="w-4 h-4" style={{ color: step.color }} />
          <h3 className="font-bold text-gray-900 text-sm">{step.title}</h3>
          {step.status === "current" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#8B5CF6] text-white font-medium">
              Current Step
            </span>
          )}
          {step.status === "complete" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#3DA9D1] text-[#1D3443] font-medium">
              Done
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mb-2">{step.description}</p>
        <div className="space-y-1">
          {step.details.map((detail, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              {step.status === "complete" ? (
                <CheckCircle2 className="w-3 h-3 text-[#3DA9D1] mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-3 h-3 text-gray-300 mt-0.5 shrink-0" />
              )}
              {detail}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function InvestorOnboardingPage() {
  const [activeTab, setActiveTab] = useState<"investor" | "client">("investor");
  const steps = activeTab === "investor" ? investorSteps : clientSteps;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Onboarding Journey</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your complete path — from investor due diligence to practice go-live. Every step tracked, nothing missed.
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setActiveTab("investor")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "investor"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Investor Path
        </button>
        <button
          onClick={() => setActiveTab("client")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "client"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Client Path
        </button>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#1D3443] font-serif">
            {steps.filter(s => s.status === "complete").length}
          </p>
          <p className="text-xs text-[#3DA9D1]">Completed</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-700 font-serif">
            {steps.filter(s => s.status === "current").length}
          </p>
          <p className="text-xs text-purple-600">In Progress</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-700 font-serif">
            {steps.filter(s => s.status === "upcoming").length}
          </p>
          <p className="text-xs text-gray-500">Upcoming</p>
        </div>
      </div>

      {/* Steps Timeline */}
      <div>
        {steps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} total={steps.length} />
        ))}
      </div>

      {/* Next Action */}
      <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-5 h-5 text-[#8B5CF6]" />
          <h3 className="font-bold text-gray-900">Next Action</h3>
        </div>
        <p className="text-sm text-gray-700">
          {activeTab === "investor"
            ? "Review the compliance mapping and policies. Add your notes and questions on anything that needs clarification. When ready, we'll proceed to the investment agreement."
            : "Complete your practice configuration — set up booking services, staff accounts, and notification preferences. Then we'll schedule your AI training sessions."
          }
        </p>
      </div>
    </div>
  );
}
