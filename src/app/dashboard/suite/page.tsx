"use client";

import { motion } from "framer-motion";
import {
  MessageSquare, CalendarCheck, Receipt, Users, BarChart3, Shield,
  Bot, Phone, Globe, Building2, Pill, Eye, Stethoscope, Heart,
  Ambulance, GraduationCap, ArrowRight, CheckCircle2, Zap, Target,
  Smartphone, FileText, TrendingUp, Clock, ArrowLeftRight, Network, Activity,
} from "lucide-react";

// ─── What VisioHealth OS Built for Netcare ──────
const SUITE_MODULES = [
  {
    name: "Network Financial Command Center",
    desc: "Real-time divisional P&L across all 88 clinics, 41 pharmacies, and 12 day theatres. EBITDA tracking, revenue by region, debtor aging, and medical scheme performance — replacing fragmented Excel-based reporting.",
    icon: BarChart3,
    color: "#3DA9D1",
    status: "live",
    saves: "R840K/month in manual reconciliation",
  },
  {
    name: "AI Claims Intelligence Engine",
    desc: "Pre-validates ICD-10-ZA codes, NAPPI codes, and PMB benefit limits before claims hit the Altron SwitchOn/MediSwitch switch. Catches 75% of rejectable claims before submission — turning 15-25% first-pass rejection into <5%.",
    icon: Receipt,
    color: "#E3964C",
    status: "live",
    saves: "R1.8M/month in recovered claims",
  },
  {
    name: "WhatsApp Patient Router",
    desc: "Netcare patients message one WhatsApp number and AI routes them to the right Medicross branch based on location, service needed, and availability. Book GP, dental, pharmacy, optometry — all via chat. Integrates with existing Netcare appointment systems.",
    icon: MessageSquare,
    color: "#25D366",
    status: "live",
    saves: "24/7 patient access, 60% fewer phone calls",
  },
  {
    name: "Smart Booking Engine",
    desc: "AI manages appointment calendars across all 568 practitioners. Patients book online or via WhatsApp, conflicts are prevented, slots are optimized for revenue. No-show prediction with automated WhatsApp reminders.",
    icon: CalendarCheck,
    color: "#3DA9D1",
    status: "live",
    saves: "40% reduction in no-shows",
  },
  {
    name: "Multi-Site Patient Management",
    desc: "Unified patient records across Medicross clinics — a patient seen in Sandton can be referenced in Fourways. Medical history, allergies, medications, vitals, POPIA consent — all shared securely within the network.",
    icon: Users,
    color: "#8B5CF6",
    status: "live",
    saves: "Eliminates duplicate records across sites",
  },
  {
    name: "POPIA + HPCSA Compliance Engine",
    desc: "Automated consent tracking (s18-s72 POPIA), HPCSA Booklet 10 alignment, role-based access controls, audit logging, and breach detection across all 88 clinics and 8 provinces. Real-time compliance dashboard for the Information Officer.",
    icon: Shield,
    color: "#10B981",
    status: "live",
    saves: "R480K/month in compliance labour",
  },
  {
    name: "Capitation & Managed Care Analytics",
    desc: "Real-time monitoring of Prime Cure per-member-per-month spend against capitation rates. Alerts when clinics exceed thresholds. Fee-for-service vs capitation comparison. Actuarial-grade utilization reporting.",
    icon: TrendingUp,
    color: "#E3964C",
    status: "live",
    saves: "R660K/month in early overspend detection",
  },
  {
    name: "AI Triage & Virtual Care",
    desc: "WhatsApp-based AI triage routes patients to the right level of care — GP, dental, emergency, or virtual consultation. Integrates with Netcare 911 for emergencies. HEAL Virtual Care-compatible.",
    icon: Bot,
    color: "#3DA9D1",
    status: "live",
    saves: "Reduces unnecessary ER visits by 30%",
  },
  {
    name: "Pharmacy Inventory Intelligence",
    desc: "AI demand forecasting for all 41 Netcare pharmacies. NAPPI code sync with scheme formularies. Dead stock alerts, auto-reorder triggers, CDL (Chronic Disease List) medication monitoring.",
    icon: Pill,
    color: "#F59E0B",
    status: "coming_soon",
    saves: "R1.4M freed working capital",
  },
  {
    name: "eRA Auto-Reconciliation",
    desc: "Automated electronic Remittance Advice matching across 568 practitioners — replacing the Excel-based reconciliation that each clinic runs independently. Shows scheme tariff vs provider charge gaps in real-time.",
    icon: FileText,
    color: "#8B5CF6",
    status: "live",
    saves: "R840K/month, replaces 12 FTEs",
  },
];

// ─── Netcare's Existing Value Chain — How We Connect ──────
const VALUE_CHAIN = [
  {
    category: "Netcare Divisions We Serve",
    items: [
      { name: "55 Medicross Clinics", icon: Building2, desc: "GP, Dental, Optometry, Radiology, Pathology, Psychology, Physio — full suite" },
      { name: "15 Day Theatres", icon: Stethoscope, desc: "Same-day surgery billing, theatre scheduling, claims" },
      { name: "37 Clicks Pharmacies", icon: Pill, desc: "Inventory intelligence, NAPPI/CDL sync (Clicks partnership since 2016)" },
      { name: "Netcare 911 (082 911)", icon: Ambulance, desc: "200+ vehicles, 3 helicopters, WhatsApp emergency routing" },
      { name: "71 National Renal Care Clinics", icon: Heart, desc: "860 dialysis stations, chronic billing, scheme benefit tracking" },
      { name: "15 Akeso Mental Health Facilities", icon: Heart, desc: "Psychiatric care billing, crisis line integration" },
      { name: "Netcare Occupational Health", icon: Stethoscope, desc: "Mining, auto, finance, govt — employer wellness packages" },
      { name: "Quro Medical (Hospital-at-Home)", icon: Building2, desc: "Remote patient monitoring, home-based acute care (acquired)" },
    ],
  },
  {
    category: "Confirmed Systems We Integrate With",
    items: [
      { name: "CareOn EMR (26+ hospitals)", icon: FileText, desc: "Deutsche Telekom — 34,000 users, R82M invested. We extend to primary care." },
      { name: "SAP for Healthcare (R100M)", icon: Globe, desc: "Finance, billing, procurement, materials, ADT. We add AI analytics layer." },
      { name: "Netcare App (iOS/Android/Huawei)", icon: Smartphone, desc: "Booking, 911, pre-admission, health records. We add WhatsApp channel." },
      { name: "IBM Watson Micromedex", icon: Shield, desc: "Drug interactions on 1.8M+ scripts/year. We surface in booking flow." },
      { name: "Corsano Wearables (6,000 beds)", icon: Activity, desc: "Continuous vitals monitoring. We integrate alerts into primary care." },
      { name: "A2D24 VirtualCare (50 centres)", icon: Globe, desc: "Telehealth platform. We route WhatsApp patients to virtual consults." },
    ],
  },
  {
    category: "What We Replace / Upgrade",
    items: [
      { name: "Excel Reporting → Real-time Dashboards", icon: FileText, desc: "568 practitioners doing manual eRA reconciliation → unified divisional P&L" },
      { name: "Phone Booking → WhatsApp + Online", icon: Phone, desc: "Extends Netcare App + Appointmed with WhatsApp AI routing to nearest branch" },
      { name: "Manual Claims → AI Pre-validation", icon: Clock, desc: "15-25% first-pass rejection → <5% with ICD-10-ZA + NAPPI + PMB checks" },
      { name: "Per-Clinic Audits → Compliance Engine", icon: Shield, desc: "POPIA s18-s72 + HPCSA Booklet 10 automated across 8 provinces" },
      { name: "Fragmented PMS → Unified View", icon: Users, desc: "Healthbridge/GoodX silos → cross-site patient records for 3.5M patients" },
      { name: "Manual Recall → AI Sequences", icon: Target, desc: "Automated WhatsApp recall for chronic care, dental, wellness screenings" },
    ],
  },
];

// ─── Resell Opportunity ──────
const RESELL_TARGETS = [
  { name: "Independent GPs in Medicross", count: "568", desc: "Deploy to each practitioner under the Netcare umbrella — one license, network-wide access" },
  { name: "49 Netcare Hospitals", count: "49", desc: "Deploy to every hospital branch — doctors use under the Netcare umbrella, branded as Netcare's own system" },
  { name: "Corporate Occ Health Clients", count: "200+", desc: "White-label for corporate clients — mining, auto, finance, govt wellness contracts" },
  { name: "Medical Scheme Partners", count: "20+", desc: "Claims intelligence modules for Discovery, GEMS, Bonitas, Momentum — sold as Netcare tools" },
  { name: "Netcare Education Graduates", count: "2,000+/yr", desc: "Train new nurses and paramedics on AI-powered systems from day one" },
];

export default function SuitePage() {
  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <img src="/images/netcare-logo.png" alt="Netcare" className="h-5" />
          <ArrowLeftRight className="w-4 h-4 text-gray-300" />
          <span className="text-[13px] font-bold text-[#1D3443]">VisioHealth OS</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Custom-Built Suite
        </h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          Everything below was purpose-built for Netcare Primary Healthcare by <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> —
          backed by our research at <span className="text-[#3DA9D1] font-semibold">Visio Research Labs</span> (120+ peer-reviewed citations, VRL-001 healthcare routing research).
        </p>
      </div>

      {/* Suite Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          10 AI Modules — Built for Netcare
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUITE_MODULES.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 rounded-xl border border-gray-200 bg-white hover:border-[#3DA9D1]/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${mod.color}12` }}>
                    <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-900 group-hover:text-[#1D3443]">{mod.name}</h3>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  mod.status === "live" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {mod.status === "live" ? "Live" : "Coming Soon"}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{mod.desc}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E3964C]">
                <Zap className="w-3 h-3" />
                {mod.saves}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Value Chain Integration */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          How We Connect Across Your Value Chain
        </h2>
        {VALUE_CHAIN.map((section) => (
          <div key={section.category}>
            <h3 className="text-[13px] font-semibold text-[#3DA9D1] uppercase tracking-wide mb-3">{section.category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all">
                  <item.icon className="w-4 h-4 text-[#1D3443] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{item.name}</div>
                    <div className="text-[11px] text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp Patient Router Feature */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#152736] text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">WhatsApp Patient Router</h3>
            <p className="text-[12px] text-white/50">One number for all 88 clinics — AI routes patients to the right branch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[
            { step: "1", title: "Patient messages", desc: "\"I need a dentist near Sandton\" via WhatsApp" },
            { step: "2", title: "AI identifies", desc: "Service: dental. Location: Sandton. Availability: today 14:00" },
            { step: "3", title: "Routes to branch", desc: "Medicross Sandton City — dental slot available" },
            { step: "4", title: "Books & confirms", desc: "Appointment confirmed, reminders scheduled, directions sent" },
          ].map((s) => (
            <div key={s.step} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#3DA9D1]/20 text-[#3DA9D1] text-[11px] font-bold flex items-center justify-center mb-2">{s.step}</div>
              <div className="text-[13px] font-semibold text-white mb-1">{s.title}</div>
              <div className="text-[11px] text-white/50">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[12px] text-white/40">
            Also handles: find nearest clinic, check pharmacy stock, enquire about services, get operating hours, request repeat scripts, check medical aid coverage, emergency routing to Netcare 911
          </p>
        </div>
      </div>

      {/* Resell Opportunity */}
      <div className="p-6 rounded-xl border border-[#E3964C]/20 bg-[#E3964C]/5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Resell Opportunity — Extend to Your Ecosystem
        </h3>
        <p className="text-[13px] text-gray-500 mb-4">
          VisioHealth OS can be white-labeled and resold to Netcare&apos;s broader ecosystem — each entity becomes a revenue stream.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {RESELL_TARGETS.map((target) => (
            <div key={target.name} className="p-3 rounded-lg bg-white border border-gray-200">
              <div className="text-xl font-bold text-[#E3964C]">{target.count}</div>
              <div className="text-[12px] font-semibold text-gray-900 mt-1">{target.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{target.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Deployment & Ecosystem */}
      <div className="p-5 rounded-xl border border-[#3DA9D1]/20 bg-[#3DA9D1]/5">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
          Branch Deployment &amp; Doctor Umbrella Licensing
        </h3>
        <p className="text-[12px] text-gray-600 mb-2">
          Deploy VisioHealth OS to every Netcare branch — 49 hospitals, 55 Medicross clinics, 15 day theatres.
          Each doctor uses the platform under the <span className="font-semibold">Netcare umbrella</span> — branded as Netcare&apos;s own AI system.
          All data routes back to the main command center, giving you full visibility across the network.
        </p>
        <p className="text-[12px] text-gray-600 mb-2">
          <span className="font-semibold">Netcare becomes the ecosystem.</span> Existing systems (CareOn, SAP, Healthbridge, GoodX)
          integrate through our middleware layer. Need a custom integration? Request it — we build connectors to any system in your stack.
        </p>
        <p className="text-[12px] text-gray-500">
          Enterprise umbrella license: one agreement covers all 568 practitioners. No individual subscriptions needed.
        </p>
      </div>

      {/* Visio Research Labs badge */}
      <div className="p-4 rounded-xl bg-[#1D3443] text-center">
        <p className="text-[12px] text-white/60">
          Built by <span className="text-white font-semibold">Visio Research Labs</span> &middot; Johannesburg, South Africa &middot;{" "}
          <span className="text-[#3DA9D1]">120+ peer-reviewed citations</span> &middot;{" "}
          <span className="text-[#E3964C]">VRL-001 Healthcare Routing Research</span>
        </p>
      </div>
    </div>
  );
}
