"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse, Building2, Plug, Clock, CreditCard, Brain,
  ChevronDown, Users, Calendar, MessageSquare, FileText,
  BarChart3, Settings, Shield, Bell, ClipboardCheck,
  Stethoscope, Receipt, UserCheck, Import, Zap,
  Monitor, Database, Lock, Globe, Smartphone,
} from "lucide-react";

type SitemapNode = {
  name: string;
  icon: React.ElementType;
  description: string;
  status: "live" | "concept" | "idea";
  children?: SitemapNode[];
};

const sitemap: SitemapNode[] = [
  {
    name: "Netcare Health OS",
    icon: HeartPulse,
    description: "Core practice management platform",
    status: "live",
    children: [
      {
        name: "Dashboard",
        icon: Monitor,
        description: "KPIs, quick actions, morning briefing",
        status: "live",
        children: [
          { name: "Daily Tasks", icon: ClipboardCheck, description: "Morning/during/end-of-day checklists", status: "live" },
          { name: "Check-In Queue", icon: UserCheck, description: "Patient arrival Kanban board", status: "live" },
          { name: "Analytics", icon: BarChart3, description: "Practice performance metrics", status: "live" },
        ],
      },
      {
        name: "Patient Management",
        icon: Users,
        description: "Full patient lifecycle",
        status: "live",
        children: [
          { name: "Patient Records", icon: FileText, description: "Demographics, allergies, medications, vitals", status: "live" },
          { name: "Medical Records", icon: Stethoscope, description: "Consultations, procedures, lab results, ICD-10", status: "live" },
          { name: "Import Tool", icon: Import, description: "Bulk CSV patient import", status: "live" },
        ],
      },
      {
        name: "Scheduling",
        icon: Calendar,
        description: "Appointments & availability",
        status: "live",
        children: [
          { name: "Calendar View", icon: Calendar, description: "Day/week/month scheduling", status: "live" },
          { name: "Public Booking", icon: Globe, description: "Patient-facing booking page", status: "live" },
          { name: "Approvals", icon: Shield, description: "Pending booking approvals", status: "live" },
        ],
      },
      {
        name: "Billing & Payments",
        icon: Receipt,
        description: "ICD-10 invoicing & medical aid claims",
        status: "live",
        children: [
          { name: "Invoices", icon: FileText, description: "Create, send, track invoices with ICD-10 codes", status: "live" },
          { name: "Payments", icon: CreditCard, description: "Record cash/card/EFT/medical aid payments", status: "live" },
          { name: "Medical Aid Claims", icon: Shield, description: "Claim submission & status tracking", status: "live" },
        ],
      },
      {
        name: "Communication",
        icon: MessageSquare,
        description: "Patient messaging & notifications",
        status: "live",
        children: [
          { name: "Conversations", icon: MessageSquare, description: "Patient chat (web, WhatsApp, phone)", status: "live" },
          { name: "Notifications", icon: Bell, description: "WhatsApp/SMS/email reminders & follow-ups", status: "live" },
          { name: "Recall System", icon: Calendar, description: "Patient recall management", status: "live" },
        ],
      },
      {
        name: "AI Agents",
        icon: Brain,
        description: "5 autonomous AI assistants",
        status: "live",
        children: [
          { name: "Triage Agent", icon: Zap, description: "Symptom assessment & urgency routing", status: "live" },
          { name: "Intake Agent", icon: UserCheck, description: "New patient data collection", status: "live" },
          { name: "Follow-up Agent", icon: MessageSquare, description: "Post-visit follow-up automation", status: "live" },
          { name: "Billing Agent", icon: Receipt, description: "Invoice & claim assistance", status: "live" },
          { name: "Scheduler Agent", icon: Calendar, description: "Smart appointment scheduling", status: "live" },
        ],
      },
      {
        name: "Compliance & Security",
        icon: Shield,
        description: "POPIA, audit logging, consent",
        status: "live",
        children: [
          { name: "Consent Records", icon: Shield, description: "POPIA consent tracking (treatment, data, marketing)", status: "live" },
          { name: "Audit Logs", icon: Database, description: "Full activity audit trail", status: "live" },
          { name: "Role-Based Access", icon: Lock, description: "Admin, doctor, nurse, receptionist roles", status: "live" },
        ],
      },
      {
        name: "Practice Settings",
        icon: Settings,
        description: "White-label branding & config",
        status: "live",
        children: [
          { name: "Branding", icon: Monitor, description: "Logo, colors, subdomain, tagline", status: "live" },
          { name: "Integrations", icon: Plug, description: "Gmail, accounting, external APIs", status: "live" },
          { name: "Booking Config", icon: Settings, description: "Services, deposits, approval rules", status: "live" },
        ],
      },
      {
        name: "Platform Admin",
        icon: Shield,
        description: "Netcare Health OS team management panel",
        status: "live",
        children: [
          { name: "All Practices", icon: Building2, description: "Manage all tenant practices", status: "live" },
          { name: "Platform Analytics", icon: BarChart3, description: "MRR, ARR, revenue by plan", status: "live" },
          { name: "Usage & Billing", icon: Receipt, description: "Per-practice usage tracking", status: "live" },
        ],
      },
    ],
  },
  {
    name: "Placeo Health",
    icon: Building2,
    description: "Patient placement & referral network",
    status: "concept",
    children: [
      { name: "Practitioner Directory", icon: Users, description: "HPCSA-verified doctor search", status: "concept" },
      { name: "Smart Matching", icon: Zap, description: "Specialty + location + medical aid matching", status: "concept" },
      { name: "Referral Workflow", icon: MessageSquare, description: "GP → Specialist structured referrals", status: "concept" },
      { name: "Availability Feed", icon: Calendar, description: "Real-time slots from Netcare Health OS", status: "concept" },
    ],
  },
  {
    name: "Visio Health Integrator",
    icon: Plug,
    description: "Labs, pharmacies, hospitals, medical aids",
    status: "concept",
    children: [
      { name: "Lab Integration", icon: Stethoscope, description: "PathCare, Lancet, Ampath, NHLS", status: "concept" },
      { name: "ePrescription", icon: FileText, description: "Digital scripts to pharmacy networks", status: "concept" },
      { name: "Hospital Sync", icon: Building2, description: "Admission/discharge data exchange", status: "concept" },
      { name: "FHIR Gateway", icon: Database, description: "HL7 FHIR health data interoperability", status: "concept" },
    ],
  },
  {
    name: "Visio Waiting Room",
    icon: Clock,
    description: "Digital queue & check-in experience",
    status: "concept",
    children: [
      { name: "QR Check-In", icon: Smartphone, description: "Scan to check in, no receptionist needed", status: "concept" },
      { name: "Queue Display", icon: Monitor, description: "Real-time position on TV/phone", status: "concept" },
      { name: "Digital Intake", icon: ClipboardCheck, description: "Pre-filled forms from patient history", status: "concept" },
      { name: "Wait Analytics", icon: BarChart3, description: "Wait time optimization data", status: "concept" },
    ],
  },
  {
    name: "Netcare Health OS Payer Connect",
    icon: CreditCard,
    description: "Medical aid claims & payment bridge",
    status: "idea",
    children: [
      { name: "Eligibility Check", icon: Shield, description: "Real-time medical aid verification", status: "idea" },
      { name: "Auto Claims", icon: FileText, description: "ICD-10 + tariff code claim generation", status: "idea" },
      { name: "Co-Pay Calculator", icon: Receipt, description: "Patient portion before treatment", status: "idea" },
      { name: "Revenue Cycle", icon: BarChart3, description: "Claims analytics & rejection tracking", status: "idea" },
    ],
  },
  {
    name: "VisioMed AI",
    icon: Brain,
    description: "Clinical decision support & AI diagnostics",
    status: "concept",
    children: [
      { name: "Differential Diagnosis", icon: Stethoscope, description: "AI-suggested diagnosis from symptoms", status: "concept" },
      { name: "Drug Interactions", icon: Shield, description: "SA formulary interaction checker", status: "concept" },
      { name: "Treatment Guidelines", icon: FileText, description: "SA Essential Drugs List & STGs", status: "concept" },
      { name: "Voice Notes", icon: MessageSquare, description: "ElevenLabs voice-to-clinical-notes", status: "concept" },
    ],
  },
];

const statusColors = {
  live: { bg: "bg-[#3DA9D1]", text: "text-[#1D3443]", dot: "bg-[#3DA9D1]", label: "Live" },
  concept: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", label: "Concept" },
  idea: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Idea" },
};

function SitemapItem({ node, depth = 0 }: { node: SitemapNode; depth?: number }) {
  const [open, setOpen] = useState(depth === 0);
  const status = statusColors[node.status];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={depth === 0 ? "" : "ml-6 border-l-2 border-gray-100 pl-4"}>
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
          hasChildren ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
        } ${depth === 0 ? "bg-gray-50 border border-gray-200 mb-2" : "mb-1"}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          depth === 0 ? "bg-[#8B5CF6]/10" : "bg-gray-100"
        }`}>
          <node.icon className={`w-4 h-4 ${depth === 0 ? "text-[#8B5CF6]" : "text-gray-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${depth === 0 ? "text-base text-gray-900" : "text-sm text-gray-800"}`}>
              {node.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{node.description}</p>
        </div>
        {hasChildren && (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "" : "-rotate-90"}`} />
        )}
      </button>

      <AnimatePresence>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children!.map((child) => (
              <SitemapItem key={child.name} node={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InvestorSitemap() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Product Map</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete sitemap of the Netcare Health OS ecosystem. Click any product or module to expand its features.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {Object.entries(statusColors).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${val.dot}`} />
            <span className="text-gray-600 font-medium">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#1D3443] font-serif">1</p>
          <p className="text-xs text-[#3DA9D1]">Product Live</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-700 font-serif">4</p>
          <p className="text-xs text-purple-600">In Concept</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-700 font-serif">1</p>
          <p className="text-xs text-amber-600">Idea Stage</p>
        </div>
      </div>

      {/* Tree */}
      <div className="space-y-3">
        {sitemap.map((product) => (
          <SitemapItem key={product.name} node={product} />
        ))}
      </div>
    </div>
  );
}
