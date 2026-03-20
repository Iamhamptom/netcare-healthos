"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  DollarSign, TrendingUp, Clock, Users, Zap, Heart,
  Building2, ChevronLeft, ArrowDown, ArrowUp, Target,
  ShieldCheck, Stethoscope, Activity, Globe,
} from "lucide-react";

const CURRENCY = (n: number) => `R${(n / 1_000_000).toFixed(1)}M`;

export default function ImpactPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Link href="/dashboard/fhir-hub" className="flex items-center gap-1.5 text-[12px] text-[#1D3443]/40 hover:text-teal-600 transition-colors mb-2">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to FHIR Hub
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[22px] font-bold text-[#1D3443] flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-emerald-500" />
          Financial Impact for Netcare
        </h1>
        <p className="text-[13px] text-[#1D3443]/50 mt-1">Projected revenue impact, cost savings, and ROI analysis</p>
      </motion.div>

      {/* Top-Line Numbers */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Annual Revenue Impact", value: "R139M+", change: "+18%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Claims Processing Savings", value: "R42M", change: "-65% cost", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Admin Hours Saved/Year", value: "180K+", change: "88+ clinics", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Patient Data Connected", value: "5.2M", change: "CareConnect", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i}>
            <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="font-metric text-[24px] font-bold text-[#1D3443]">{stat.value}</div>
            <div className="text-[11px] text-[#1D3443]/40 mt-0.5">{stat.label}</div>
            <div className="text-[10px] font-semibold text-emerald-600 mt-1">{stat.change}</div>
          </Card>
        ))}
      </motion.div>

      {/* Revenue Breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Revenue Impact Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { category: "Claims Processing Automation", current: "R65M/yr manual processing", projected: "R23M/yr automated", saving: 42, desc: "HL7v2 + FHIR auto-routing eliminates manual claim entry, re-keying, and phone follow-ups across 88 Medicross clinics" },
              { category: "Lab Result Integration", current: "R18M/yr manual entry", projected: "R3M/yr automated", saving: 15, desc: "HL7v2 ORU feeds from PathCare/Lancet/Ampath flow directly into patient records — no re-typing, no transcription errors" },
              { category: "Reduced Claim Rejections", current: "12-18% rejection rate", projected: "3-5% rejection rate", saving: 35, desc: "Real-time eligibility checks via SwitchOn/MediSwitch + AI-powered ICD-10 code validation before submission" },
              { category: "Inter-Hospital Data Sharing", current: "R25M/yr duplicate tests", projected: "R8M/yr via CareConnect", saving: 17, desc: "CareConnect HIE connection means patient history follows them — no unnecessary repeat scans, blood work, or imaging" },
              { category: "NHI Compliance Readiness", current: "R0 (not compliant)", projected: "R30M+ NHI contract value", saving: 30, desc: "Government is mandating FHIR interoperability. Being first positions Netcare for NHI preferred provider contracts" },
            ].map((item, i) => (
              <div key={i} className="border border-[#1D3443]/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[14px] text-[#1D3443]">{item.category}</h4>
                  <span className="font-metric text-[16px] font-bold text-emerald-600">{CURRENCY(item.saving * 1_000_000)}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[12px] text-[#1D3443]/50"><strong className="text-red-500/70">Before:</strong> {item.current}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[12px] text-[#1D3443]/50"><strong className="text-emerald-600/70">After:</strong> {item.projected}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#1D3443]/40">{item.desc}</p>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-[#1D3443]/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.saving / 42 * 100, 100)}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-semibold text-emerald-700">Total Projected Annual Impact</span>
                <p className="text-[11px] text-emerald-600/60 mt-0.5">Across all 88+ Medicross clinics and 45 hospitals</p>
              </div>
              <span className="font-metric text-[28px] font-bold text-emerald-700">R139M+</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ROI Timeline */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-500" /> Implementation Timeline & ROI
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { phase: "Phase 1", period: "Month 1-3", title: "FHIR Server + Pilot", items: ["Deploy FHIR R4 API", "Connect 5 pilot clinics", "Synthetic data testing", "SMART auth for internal apps"], investment: "R2.5M", roi: "Foundation" },
              { phase: "Phase 2", period: "Month 4-6", title: "CareConnect HIE", items: ["CareConnect integration", "Patient record sharing", "Claims auto-routing", "Lab result feeds"], investment: "R4M", roi: "R15M/yr savings" },
              { phase: "Phase 3", period: "Month 7-12", title: "Full Network Rollout", items: ["All 88 Medicross clinics", "45 hospital connections", "MediSwitch certification", "Real-time eligibility"], investment: "R6M", roi: "R85M/yr savings" },
              { phase: "Phase 4", period: "Year 2+", title: "NHI & Scale", items: ["NHI compliance certification", "Third-party app marketplace", "Cross-hospital records", "AI-powered insights"], investment: "R3M/yr", roi: "R139M+/yr" },
            ].map((phase, i) => (
              <div key={i} className="border border-[#1D3443]/5 rounded-xl p-4 relative">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-500 mb-1">{phase.phase}</div>
                <div className="text-[11px] text-[#1D3443]/30 mb-2">{phase.period}</div>
                <h4 className="font-semibold text-[14px] text-[#1D3443] mb-3">{phase.title}</h4>
                <ul className="space-y-1.5 mb-4">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-[11px] text-[#1D3443]/50 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-[#1D3443]/5 pt-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1D3443]/35">Investment</span>
                    <span className="font-metric font-semibold text-[#1D3443]/60">{phase.investment}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#1D3443]/35">ROI</span>
                    <span className="font-metric font-semibold text-emerald-600">{phase.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Competitive Advantage */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h3 className="font-bold text-[15px] text-[#1D3443] mb-5 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Why Netcare Should Move Now
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "NHI is Mandating Interoperability", desc: "The National Health Insurance Act requires all providers to share data electronically. FHIR compliance is becoming a requirement, not an option. First movers get preferred provider status.", icon: ShieldCheck },
              { title: "CareConnect HIE Gives Instant Scale", desc: "Netcare is already a founding member. The technical bridge is built — connecting costs months, not years. 5.2M patient records become accessible across Netcare + Discovery + Life + Mediclinic.", icon: Globe },
              { title: "A2D24/HEAL Can't Do This Alone", desc: "HEAL is built on proprietary AWS infrastructure with no public APIs. Our FHIR facade wraps Netcare's data in standard APIs without requiring changes to HEAL's closed codebase.", icon: Building2 },
              { title: "R82M Already Invested in CareOn", desc: "Netcare has spent R82M+ on CareOn (Deutsche Telekom). The FHIR Integration Hub makes that investment work harder by connecting CareOn's HL7v2 output to the broader ecosystem.", icon: Activity },
            ].map((item, i) => (
              <div key={i} className="border border-[#1D3443]/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-[#1D3443] mb-1">{item.title}</h4>
                    <p className="text-[12px] text-[#1D3443]/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm border border-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}
