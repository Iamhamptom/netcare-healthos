"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, BarChart3, Receipt, MessageSquare, Shield, Users,
  ArrowRight, CheckCircle2, Zap, TrendingUp, Bot, Phone,
  Boxes, FileText, Pill, Heart, Ambulance, Target, Eye,
  Rocket, Clock, Globe,
} from "lucide-react";

const TOUR_STEPS = [
  {
    title: "Network Financial Command Center",
    desc: "Your real-time divisional P&L. Revenue by region, EBITDA tracking, debtor aging, claims analytics, and medical scheme performance — all in one view. This replaces your Excel-based reporting across 568 practitioners.",
    href: "/dashboard/network",
    icon: BarChart3,
    color: "#3DA9D1",
    saves: "R840K/month in manual reconciliation",
  },
  {
    title: "Your Custom-Built Suite",
    desc: "See all 10 AI modules VisioHealth OS built for Netcare — claims intelligence, WhatsApp router, eRA reconciliation, capitation analytics, and more. Plus the full value chain integration map.",
    href: "/dashboard/suite",
    icon: Boxes,
    color: "#E3964C",
    saves: "R8.4M/month total addressable savings",
  },
  {
    title: "AI Claims Intelligence",
    desc: "View invoices with ICD-10-ZA codes, claims status (submitted, partial, rejected, paid), and medical aid claim references. See exactly where money is being lost to rejections.",
    href: "/dashboard/billing",
    icon: Receipt,
    color: "#3DA9D1",
    saves: "R1.8M/month in recovered claims",
  },
  {
    title: "Patient Management",
    desc: "Unified patient records across Medicross clinics — Discovery, GEMS, Bonitas, Momentum, Medihelp, Polmed patients with medical history, allergies, medications, and POPIA consent.",
    href: "/dashboard/patients",
    icon: Users,
    color: "#8B5CF6",
    saves: "Cross-site patient visibility",
  },
  {
    title: "Daily Operations",
    desc: "Your Financial Director daily checklist — claims rejections review, revenue dashboard check, Prime Cure capitation reports, tariff reconciliations, EBITDA variance reports.",
    href: "/dashboard/daily",
    icon: CheckCircle2,
    color: "#10B981",
    saves: "Structured FD workflow",
  },
  {
    title: "WhatsApp Conversations",
    desc: "See how the WhatsApp Patient Router handles patient inquiries — booking requests, service queries, emergency routing. AI suggests responses, your team approves.",
    href: "/dashboard/conversations",
    icon: MessageSquare,
    color: "#25D366",
    saves: "24/7 patient access",
  },
  {
    title: "POPIA Compliance",
    desc: "Consent tracking dashboard across all patients — treatment consent, data processing consent, marketing opt-outs. POPIA s18-s72 and HPCSA Booklet 10 aligned.",
    href: "/dashboard/settings",
    icon: Shield,
    color: "#1D3443",
    saves: "100% audit-ready across 8 provinces",
  },
  {
    title: "Practice Analytics",
    desc: "Top services, booking trends, review scores, recall due items, conversation volumes, medical record counts. High-level operational health of the network.",
    href: "/dashboard/analytics",
    icon: TrendingUp,
    color: "#E3964C",
    saves: "Data-driven decision making",
  },
];

const COMING_SOON = [
  {
    name: "Placeo Health — Patient Marketplace",
    desc: "A patient-facing marketplace where Netcare patients can discover and book across your entire network — GP, dental, pharmacy, optometry, specialists. Think 'Uber for healthcare appointments' with ratings, availability, and medical aid benefit checking. Netcare becomes the platform, not just the provider.",
    icon: Globe,
    color: "#3DA9D1",
    netcareValue: "Turn 3.5M patients into a marketplace revenue stream. Each booking = transaction fee.",
  },
  {
    name: "Visio Integrator — Enterprise Middleware",
    desc: "Connects CareOn, SAP, Healthbridge, GoodX, Altron SwitchOn, and MediSwitch into one unified data layer. Real-time sync between hospital EMR and primary care PMS. No more fragmented data silos.",
    icon: Target,
    color: "#8B5CF6",
    netcareValue: "The missing integration layer between CareOn (hospitals) and Medicross (clinics).",
  },
  {
    name: "Visio Waiting Room — Digital Check-in",
    desc: "Patients check in via WhatsApp when they arrive. Real-time queue visibility for staff. Estimated wait times sent to patients. Walk-in management with priority routing.",
    icon: Clock,
    color: "#E3964C",
    netcareValue: "Solve the queue problem at busy Medicross clinics — especially Soweto, Fourways, and CBD.",
  },
  {
    name: "VisioMed AI — Clinical Co-Pilot",
    desc: "AI clinical decision support for GPs and dentists. Drug interaction checking (augments IBM Watson Micromedex), ICD-10-ZA coding assistance, treatment protocol suggestions, clinical note generation.",
    icon: Bot,
    color: "#10B981",
    netcareValue: "Extend Micromedex drug safety to primary care. Reduce ICD-10 coding errors at source.",
  },
  {
    name: "Payer Connect — Scheme Coordination",
    desc: "Live coordination layer between Netcare and medical schemes. Real-time benefit checking, pre-authorization, gap cover integration, and claims status tracking. Discovery, GEMS, Bonitas, Momentum — all connected.",
    icon: Heart,
    color: "#EF4444",
    netcareValue: "Turn 21-day GEMS payment cycles into 7-day cycles. Pre-auth before the patient sits down.",
  },
  {
    name: "Pharmacy Intelligence — NAPPI Sync",
    desc: "AI-powered inventory management for 37 Clicks-operated pharmacies. NAPPI code sync with scheme formularies. CDL (Chronic Disease List) medication monitoring. Dead stock detection and demand forecasting.",
    icon: Pill,
    color: "#F59E0B",
    netcareValue: "R1.4M freed working capital from dead stock elimination across 37 pharmacies.",
  },
];

export default function OnboardingPage() {
  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-5" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">x</span>
          <span className="text-[13px] font-bold text-[#1D3443]">VisioHealth OS</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Your Platform
        </h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          This platform was purpose-built for Netcare Primary Healthcare by VisioHealth OS.
          Here&apos;s a guided tour of what&apos;s been built for you — and where you&apos;ll save the most money.
        </p>
      </motion.div>

      {/* Tour Steps */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          <Rocket className="w-5 h-5 inline mr-2 text-[#E3964C]" />
          Your Platform Tour — 8 Key Areas
        </h2>
        <div className="space-y-3">
          {TOUR_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={step.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-[#3DA9D1]/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-bold text-[13px] shrink-0 group-hover:bg-[#3DA9D1]/10 group-hover:text-[#3DA9D1] transition-colors">
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${step.color}12` }}>
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-[#1D3443]">{step.title}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{step.desc}</div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block text-[10px] font-semibold text-[#E3964C] bg-[#E3964C]/10 px-2 py-0.5 rounded-full">
                    {step.saves}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#3DA9D1] shrink-0 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coming Soon Tools */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          <Zap className="w-5 h-5 inline mr-2 text-[#E3964C]" />
          Coming Soon — Expansion Modules
        </h2>
        <p className="text-[13px] text-gray-500 mb-4">
          These additional products are being developed by VisioHealth OS specifically for the Netcare ecosystem.
          Each can be licensed to your network of 568 independent practitioners as an additional revenue stream.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMING_SOON.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="p-5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 hover:border-[#3DA9D1]/30 hover:bg-white transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tool.color}12` }}>
                  <tool.icon className="w-4.5 h-4.5" style={{ color: tool.color }} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-900">{tool.name}</h3>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">COMING SOON</span>
                </div>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{tool.desc}</p>
              <div className="p-2.5 rounded-lg bg-[#1D3443]/5 border border-[#1D3443]/10">
                <div className="text-[10px] text-[#3DA9D1] font-semibold uppercase mb-0.5">Value for Netcare</div>
                <div className="text-[12px] text-[#1D3443] font-medium">{tool.netcareValue}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Licensing Note */}
        <div className="mt-4 p-4 rounded-xl border border-[#E3964C]/20 bg-[#E3964C]/5">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-[#E3964C]" />
            <span className="text-[13px] font-semibold text-gray-900">Licensing Opportunity</span>
          </div>
          <p className="text-[12px] text-gray-600">
            Each module above can be white-labeled and resold to Netcare&apos;s network of 568 independent practitioners,
            49 hospital groups, and 200+ corporate occupational health clients — creating a recurring SaaS revenue stream
            for Netcare Primary Healthcare. Contact VisioHealth OS for enterprise licensing terms.
          </p>
        </div>
      </div>

      {/* For More */}
      <div className="p-4 rounded-xl bg-[#1D3443] text-center">
        <p className="text-[13px] text-white/70">
          For full pricing, enterprise licensing, and custom module development —{" "}
          <span className="text-[#3DA9D1] font-semibold">contact VisioHealth OS</span>
        </p>
        <p className="text-[11px] text-white/60 mt-1">
          Powered by Visio Research Labs &middot; 120+ peer-reviewed citations &middot; VRL-001 Healthcare Routing Research
        </p>
      </div>
    </div>
  );
}
