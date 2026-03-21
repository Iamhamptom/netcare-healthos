"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, BarChart3, DollarSign, TrendingUp, Shield,
  Building2, Target, Users, Zap, Clock, CheckCircle2, Globe,
} from "lucide-react";

const BOARD_SECTIONS = [
  {
    title: "Executive Summary",
    icon: FileText,
    color: "#1D3443",
    content: [
      "Netcare Primary Healthcare Division (R662M revenue, 24.5% EBITDA margin) has engaged VisioHealth OS to deploy AI-powered operations technology across the 88-clinic network.",
      "The platform addresses three critical challenges: (1) 15% claims first-pass rejection rate costing R3.85M/month, (2) fragmented financial reporting across 568 practitioners, and (3) manual eRA reconciliation consuming significant FTE capacity.",
      "Projected annual impact: R100M+ in addressable savings through claims pre-validation, automated reconciliation, debtor intelligence, capitation analytics, compliance automation, and pharmacy optimisation.",
    ],
  },
  {
    title: "Financial Impact Analysis",
    icon: DollarSign,
    color: "#10B981",
    content: [
      "Claims rejection: 15% to <5% = R21.6M/year recovered revenue",
      "Debtor days: 42 to 28 = R14M freed working capital",
      "Collection ratio: 91.3% to 96% = R33M/year additional collections",
      "Medical loss ratio (Prime Cure): 86% to 82% = R11.5M/year savings",
      "eRA reconciliation automation: R840K/month = R10.1M/year labour savings",
      "POPIA compliance automation: R480K/month = R5.8M/year",
      "Pharmacy inventory optimisation: R1.4M freed working capital",
      "TOTAL ADDRESSABLE: R100M+ per annum",
    ],
  },
  {
    title: "Strategic Alignment",
    icon: Target,
    color: "#3DA9D1",
    content: [
      "Aligns with Netcare 10-Year Digital Strategy Phase 2: 'Data and AI Driven'",
      "Fills the primary care technology gap — CareOn covers hospitals, VisioHealth OS covers the 88-clinic network",
      "Addresses Keith Gibson's priorities: EBITDA margin expansion, cash conversion >100%, working capital discipline",
      "Positions Netcare ahead of Discovery Flexicare (Clicks partnership) in primary care innovation",
      "Comparable to HCA Healthcare (191 hospitals, 85% autonomous AI coding) — global best practice for healthcare finance automation",
    ],
  },
  {
    title: "Implementation Approach",
    icon: Clock,
    color: "#E3964C",
    content: [
      "Phase 1 (Weeks 1-8): Regional pilot — 1 region, 3-5 clinics, prove ROI",
      "Phase 2 (Months 3-6): Regional rollout — expand to full pilot region",
      "Phase 3 (Months 6-12): Network-wide deployment — all 88 clinics",
      "Phase 4 (Year 2): Advanced modules — Placeo Health marketplace, Payer Connect, VisioMed AI",
      "No disruption to existing systems — integrates with CareOn, SAP, SwitchOn, MediSwitch",
      "Regional data isolation — each region visible only to authorised personnel",
    ],
  },
  {
    title: "Risk Mitigation",
    icon: Shield,
    color: "#8B5CF6",
    content: [
      "No upfront capital expenditure — SaaS model with monthly subscription",
      "8-week pilot with no commitment beyond pilot period",
      "POPIA compliant from day one — automated consent tracking across all clinics",
      "No replacement of existing systems — additive layer on top of CareOn, SAP, SwitchOn",
      "Babylon Health cautionary tale acknowledged — our approach integrates, not replaces",
      "Full audit trail for CMS, HPCSA, and King IV governance compliance",
    ],
  },
  {
    title: "Competitive Positioning",
    icon: Globe,
    color: "#1D3443",
    content: [
      "Discovery Health + Clicks: Launching Flexicare — affordable primary care through retail. Direct threat to Medicross walk-in model.",
      "Life Healthcare: Deploying MEDITECH Expanse — AI-enabled cloud EHR. Advancing digital capabilities.",
      "Global benchmark: HCA Healthcare (USA) achieving 85% autonomous AI coding across 191 hospitals.",
      "VisioHealth OS gives Netcare Primary Care a technology moat — AI claims intelligence that competitors do not have.",
      "First-mover advantage in African healthcare AI operations — mPharma ($80M) and Helium Health ($30M) focus on other verticals.",
    ],
  },
];

const CEO_HIGHLIGHTS = [
  { metric: "R100M+", desc: "Annual addressable savings", icon: DollarSign },
  { metric: "8 weeks", desc: "To prove ROI with regional pilot", icon: Clock },
  { metric: "<5%", desc: "Target claims rejection (from 15%)", icon: TrendingUp },
  { metric: "88 clinics", desc: "Network-wide scalability", icon: Building2 },
];

export default function BoardPackPage() {
  const [generating, setGenerating] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/netcare-logo.png" alt="Netcare" className="h-4" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Board Presentation Pack</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Business Case for the Board
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Present this to Keith Gibson (Group CFO) and Dr Richard Friedland (CEO). Every number is backed by research.
          </p>
        </div>
        <button
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1D3443] text-white font-semibold text-[13px] rounded-xl hover:bg-[#152736] transition-colors"
        >
          <Download className="w-4 h-4" />
          {generating ? "Generating..." : "Export Board Pack"}
        </button>
      </div>

      {/* CEO Quick View */}
      <div className="p-5 rounded-xl bg-[#1D3443]">
        <h3 className="text-[13px] text-white/60 uppercase tracking-wider font-semibold mb-3">CEO Quick View — Dr Richard Friedland</h3>
        <div className="grid grid-cols-4 gap-4">
          {CEO_HIGHLIGHTS.map((h, i) => (
            <motion.div key={h.metric} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
              <h.icon className="w-5 h-5 mx-auto mb-1.5 text-[#3DA9D1]" />
              <div className="text-xl font-bold text-white">{h.metric}</div>
              <div className="text-[10px] text-white/50">{h.desc}</div>
            </motion.div>
          ))}
        </div>
        <p className="text-[11px] text-white/70 mt-3 text-center">
          This is the one-slide version for Dr Friedland. Full detail below for Keith Gibson.
        </p>
      </div>

      {/* Board Pack Sections */}
      <div className="space-y-4">
        {BOARD_SECTIONS.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <section.icon className="w-4 h-4" style={{ color: section.color }} />
              <h3 className="text-[14px] font-semibold text-gray-900">
                {i + 1}. {section.title}
              </h3>
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {section.content.map((line, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1] mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scenario Modelling */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-[14px] font-semibold text-gray-900">
            7. Scenario Modelling — 3-Year ROI
          </h3>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left p-3 font-semibold text-gray-500">Scenario</th>
              <th className="text-right p-3 font-semibold text-gray-500">Year 1</th>
              <th className="text-right p-3 font-semibold text-gray-500">Year 2</th>
              <th className="text-right p-3 font-semibold text-gray-500">Year 3</th>
              <th className="text-right p-3 font-semibold text-gray-500">3-Year Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-3 font-medium text-gray-900">Conservative (30% of addressable)</td>
              <td className="p-3 text-right">R30M</td>
              <td className="p-3 text-right">R35M</td>
              <td className="p-3 text-right">R40M</td>
              <td className="p-3 text-right font-bold text-[#1D3443]">R105M</td>
            </tr>
            <tr className="border-b border-gray-100 bg-[#3DA9D1]/5">
              <td className="p-3 font-medium text-gray-900">Base Case (60% of addressable)</td>
              <td className="p-3 text-right">R60M</td>
              <td className="p-3 text-right">R75M</td>
              <td className="p-3 text-right">R85M</td>
              <td className="p-3 text-right font-bold text-[#3DA9D1]">R220M</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 font-medium text-gray-900">Aggressive (85% of addressable)</td>
              <td className="p-3 text-right">R85M</td>
              <td className="p-3 text-right">R100M</td>
              <td className="p-3 text-right">R110M</td>
              <td className="p-3 text-right font-bold text-[#E3964C]">R295M</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Call to Action */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[#1D3443] to-[#3DA9D1] text-center">
        <h3 className="text-lg font-bold text-white mb-2">
          Recommendation: Start 8-Week Regional Pilot
        </h3>
        <p className="text-[13px] text-white/60 max-w-lg mx-auto mb-4">
          Zero capital risk. Proven ROI in 8 weeks. Board-ready results report at completion.
          If pilot succeeds, network-wide rollout generates R60-100M+ annual savings.
        </p>
        <a href="/dashboard/pilot" className="inline-flex items-center gap-2 px-8 py-3 bg-[#E3964C] text-white font-semibold text-[14px] rounded-xl hover:bg-[#D4843A] transition-colors">
          <Zap className="w-4 h-4" />
          Start Regional Pilot
        </a>
        <p className="text-[10px] text-white/70 mt-3">
          Powered by VisioHealth OS | Visio Research Labs | 120+ peer-reviewed citations
        </p>
      </div>
    </div>
  );
}
