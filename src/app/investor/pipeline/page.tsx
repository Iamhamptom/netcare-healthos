"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Building2, Stethoscope, Headphones,
  Briefcase, ChevronDown, CheckCircle2, Clock, Target,
  ArrowRight, Zap, BarChart3, Globe, MessageSquare,
  HeartPulse, GraduationCap, Shield,
} from "lucide-react";

/* ── Lead Pipeline Data ── */

const leadCategories = [
  {
    name: "General Practitioners",
    icon: Users,
    color: "#10b981",
    count: 59,
    status: "Identified & Ready",
    areas: "Parktown, Sandton, Fourways, Bryanston, Midrand, Rosebank, Randburg",
    priority: "HIGH — GPs are the #1 source of ENT patient referrals",
    highlights: [
      "12 practices in Sandton/Morningside corridor",
      "12 practices in Fourways/Lonehill/Dainfern",
      "7 practices in Parktown (walking distance from your rooms)",
      "Includes Intercare (3 branches), NHC Health Centres (2 branches)",
      "Multi-doctor practices = multiple referral sources per visit",
    ],
  },
  {
    name: "Paediatricians",
    icon: Stethoscope,
    color: "#8B5CF6",
    count: 20,
    status: "Identified & Ready",
    areas: "Netcare Park Lane, Sandton, Morningside, Fourways, Houghton",
    priority: "CRITICAL — 6 paediatricians at YOUR hospital (Netcare Park Lane)",
    highlights: [
      "6 paediatricians at Netcare Park Lane — same corridors as you",
      "Dr Diar, Dr Ndiweni, Dr Stoykova, Dr Basson, Dr Khan, Dr Lucic",
      "7 in Sandton/Morningside (Dr Maraschin, Dr Jones, Dr Naicker, Dr Hay)",
      "Paediatric referrals = tonsils, grommets, adenoids, hearing — your bread and butter",
      "One relationship with a busy paediatrician = 5-10 referrals/month",
    ],
  },
  {
    name: "Audiologists",
    icon: Headphones,
    color: "#0ea5e9",
    count: 15,
    status: "Identified & Ready",
    areas: "Rosebank, Bryanston, Sandton, Fourways, Northcliff",
    priority: "HIGH — Audiologists refer grommets, cochlear implants, complex hearing cases",
    highlights: [
      "Ear Institute (Rosebank + Bryanston branches) — largest audiology group",
      "Sandton Hearing & Balance — high-end clientele",
      "HEARCARE PLUS (3 Joburg branches) — volume referrer",
      "Audiologists need an ENT they trust for surgical cases",
      "Bidirectional: you refer hearing assessments back to them",
    ],
  },
  {
    name: "Corporate & Occupational Health",
    icon: Briefcase,
    color: "#f59e0b",
    count: 15,
    status: "Identified & Ready",
    areas: "Sandton CBD, Gauteng industrial zones",
    priority: "MEDIUM — Longer sales cycle but high volume when landed",
    highlights: [
      "Sibanye-Stillwater, AngloGold Ashanti (HQ near Park Lane), Harmony Gold",
      "Mining companies = mandatory audiometric screening = ENT referrals",
      "6 occupational health providers (Health with Heart, Workforce Healthcare, etc.)",
      "Tiger Brands, Nampak — factory noise exposure",
      "Banks (Nedbank, Standard Bank) — corporate wellness hearing screening days",
    ],
  },
];

/* ── Growth Strategy ── */

const strategyPhases = [
  {
    phase: "Phase 1 — Foundation (Month 1-2)",
    color: "#10b981",
    actions: [
      {
        title: "Park Lane Paediatrician Blitz",
        description: "Personal visits to all 6 paediatricians at Netcare Park Lane. Same hospital, same corridors — introduce yourself, leave referral cards with your /refer/joburg-ent link.",
        impact: "5-10 referrals/month from paediatricians alone",
        cost: "R0 (your time + printed referral cards R500)",
      },
      {
        title: "GP Referral Pack Distribution",
        description: "Create a one-page referral guide (what to refer, how to refer digitally via /refer/joburg-ent, your contact details). Distribute to 20 GP practices in Parktown, Rosebank, Sandton.",
        impact: "20 GPs aware of your digital referral portal",
        cost: "R2,000 (printing + fuel)",
      },
      {
        title: "Medical Directory Optimisation",
        description: "Update Medpages, TopDocs, SA Doctors App, Google Business Profile. Fix your Medical Network listing (currently shows 'GP' instead of 'ENT'). Add joburg-ent.co.za booking link.",
        impact: "Patients finding you via Google 'ENT specialist Johannesburg'",
        cost: "R0-R5,000 (free listings + optional premium)",
      },
      {
        title: "Netcare Health OS OS Go-Live",
        description: "Platform fully configured: AI agents active, booking page live, WhatsApp reminders on, daily tasks running. 20 patients already loaded.",
        impact: "Operational efficiency from day 1",
        cost: "Included in subscription",
      },
    ],
  },
  {
    phase: "Phase 2 — Network Building (Month 3-4)",
    color: "#8B5CF6",
    actions: [
      {
        title: "Monthly CPD Lunch-and-Learn",
        description: "Host a monthly educational session at Park Lane for GPs. Topics: 'When to refer to ENT', 'Red flags in paediatric hearing', 'Managing chronic sinusitis'. Offer CPD points.",
        impact: "10-15 GPs per event, deep relationship building",
        cost: "R3,000-R5,000/session (catering for 15)",
      },
      {
        title: "Audiologist Partnership Programme",
        description: "Visit all 15 audiologists. Establish bidirectional referral: they refer surgical cases to you, you refer hearing assessments back. Share your /refer/joburg-ent link.",
        impact: "3-5 grommet/cochlear referrals per month",
        cost: "R0 (your time)",
      },
      {
        title: "GP Portal Rollout",
        description: "Invite referring GPs to register on Netcare Health OS GP portal (/gp). Free tier — they can track referral status and get feedback digitally.",
        impact: "GPs locked into the Netcare Health OS ecosystem",
        cost: "R0 (platform feature)",
      },
      {
        title: "Content Marketing Launch",
        description: "Monthly educational articles on joburg-ent.co.za. Topics: 'Does my child need grommets?', 'When is a sinus operation necessary?', 'Sleep apnoea and snoring'. SEO-optimised.",
        impact: "Google ranking for ENT keywords in Joburg",
        cost: "R3,000/article if outsourced, R0 if written in-house",
      },
    ],
  },
  {
    phase: "Phase 3 — Scale (Month 5-12)",
    color: "#f59e0b",
    actions: [
      {
        title: "Corporate Hearing Screening Programme",
        description: "Partner with occupational health providers to offer workplace hearing screenings. Target mining companies (mandatory under MHSA) and manufacturing (noise exposure).",
        impact: "50-100 employees per screening day, 5-10% need ENT follow-up",
        cost: "R5,000-R10,000/event (equipment hire + travel)",
      },
      {
        title: "Multi-Hospital Expansion",
        description: "Apply for privileges at Netcare Milpark, Sunninghill, Olivedale. Different geographic catchments = different GP referral pools.",
        impact: "3x geographic coverage without hiring another doctor",
        cost: "R3,000-R5,000/hospital (credentialing fees)",
      },
      {
        title: "School Hearing Screening Initiative",
        description: "Partner with SAAA (audiologists) to offer hearing screenings at schools in northern Joburg suburbs. Paediatric ENT cases funnel to your practice.",
        impact: "200-500 children screened per event, 10-15% need ENT",
        cost: "R2,000-R5,000/school (logistics)",
      },
      {
        title: "Head & Neck Cancer MDT",
        description: "Join the Morningside Mediclinic Multidisciplinary Tumour Board. Every case discussed = every oncologist, surgeon, and radiologist knows your name.",
        impact: "High-value surgical referrals (head & neck cancer)",
        cost: "R0 (your time, 1-2 hours/week)",
      },
    ],
  },
];

/* ── Key Metrics ── */

const metrics = [
  { label: "Total Leads Identified", value: "108", icon: Target, color: "#10b981" },
  { label: "Referral Portal", value: "Live", icon: Globe, color: "#8B5CF6" },
  { label: "GP Landing Page", value: "Live", icon: Users, color: "#0ea5e9" },
  { label: "Booking Page", value: "Live", icon: HeartPulse, color: "#f59e0b" },
];

export default function InvestorPipelinePage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("General Practitioners");
  const [expandedPhase, setExpandedPhase] = useState<string | null>(strategyPhases[0].phase);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#3DA9D1] animate-pulse" />
          <span className="text-xs text-[#3DA9D1] font-medium uppercase tracking-wider">Active</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Lead Generation Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          We&rsquo;ve already started. 108 qualified referral leads identified across 4 categories,
          referral portal live, GP funnel active. Here&rsquo;s where we are and what&rsquo;s next.
        </p>
      </div>

      {/* Active Status Banner */}
      <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-[#3DA9D1]" />
          <h2 className="font-bold text-[#1A2F3E]">Generation Already In Progress</h2>
        </div>
        <p className="text-sm text-[#1D3443]">
          Your referral infrastructure is live. GPs can submit referrals at{" "}
          <span className="font-mono text-[#1A2F3E] bg-[#3DA9D1] px-1.5 py-0.5 rounded">/refer/joburg-ent</span>,
          your booking page is at{" "}
          <span className="font-mono text-[#1A2F3E] bg-[#3DA9D1] px-1.5 py-0.5 rounded">/book/joburg-ent</span>,
          and the GP portal is recruiting at{" "}
          <span className="font-mono text-[#1A2F3E] bg-[#3DA9D1] px-1.5 py-0.5 rounded">/gp</span>.
          108 leads are ready for outreach.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
              <span className="text-xs text-gray-500">{m.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 font-serif">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Lead Categories */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 font-serif mb-4">Referral Lead Pipeline — 108 Leads</h2>
        <div className="space-y-3">
          {leadCategories.map((cat) => {
            const isExpanded = expandedCategory === cat.name;
            return (
              <motion.div
                key={cat.name}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? "border-gray-300 shadow-md" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{cat.name}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{cat.areas}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-4 pb-4 border-t border-gray-100 pt-3"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-bold text-amber-800">{cat.priority}</p>
                    </div>
                    <div className="space-y-1.5">
                      {cat.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: cat.color }} />
                          <span className="text-sm text-gray-700">{h}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Status: {cat.status}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* The Flywheel */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h2 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
          The Referral Flywheel
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {[
            { text: "108 leads contacted", bg: "bg-[#3DA9D1]/20 text-[#3DA9D1]" },
            { text: "GPs visit /gp", bg: "bg-blue-500/20 text-blue-300" },
            { text: "Register free", bg: "bg-purple-500/20 text-purple-300" },
            { text: "Refer via /refer/joburg-ent", bg: "bg-[#3DA9D1]/20 text-[#3DA9D1]" },
            { text: "You manage in dashboard", bg: "bg-blue-500/20 text-blue-300" },
            { text: "Send feedback to GP", bg: "bg-purple-500/20 text-purple-300" },
            { text: "GP trusts system", bg: "bg-[#3DA9D1]/20 text-[#3DA9D1]" },
            { text: "Refers more patients", bg: "bg-amber-500/20 text-amber-300" },
            { text: "GP upgrades to paid", bg: "bg-pink-500/20 text-pink-300" },
            { text: "Network grows", bg: "bg-[#3DA9D1]/20 text-[#3DA9D1]" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg font-medium text-xs ${step.bg}`}>
                {step.text}
              </span>
              {i < 9 && <ArrowRight className="w-3 h-3 text-gray-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Growth Strategy */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 font-serif mb-2">12-Month Growth Strategy</h2>
        <p className="text-sm text-gray-500 mb-4">
          Your practice growth roadmap — phased, costed, and HPCSA-compliant. Every strategy builds on the referral network.
        </p>
        <div className="space-y-4">
          {strategyPhases.map((phase) => {
            const isExpanded = expandedPhase === phase.phase;
            return (
              <div key={phase.phase} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                    <h3 className="font-bold text-gray-900 text-sm">{phase.phase}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{phase.actions.length} actions</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {phase.actions.map((action, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{action.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{action.description}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1 text-xs">
                            <BarChart3 className="w-3 h-3 text-[#3DA9D1]" />
                            <span className="text-[#1D3443] font-medium">Impact:</span>
                            <span className="text-gray-600">{action.impact}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-amber-700 font-medium">Cost:</span>
                            <span className="text-gray-600">{action.cost}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* What's Already Live */}
      <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#8B5CF6]" />
          Infrastructure Already Live
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: "Digital Referral Portal", path: "/refer/joburg-ent", desc: "GPs submit referrals in 2 minutes", icon: MessageSquare },
            { label: "Public Booking Page", path: "/book/joburg-ent", desc: "Patients book directly online", icon: HeartPulse },
            { label: "GP Registration Portal", path: "/gp", desc: "GPs join free, refer digitally", icon: Users },
            { label: "ENT Landing Page", path: "/how-it-works/ent", desc: "SEO-optimised for 'ENT specialist Johannesburg'", icon: Globe },
            { label: "AI Agents Active", path: "/dashboard/agents", desc: "Triage, intake, follow-up, billing, scheduler", icon: Zap },
            { label: "AI Training Programme", path: "/investor/courses", desc: "5 courses for you and your staff", icon: GraduationCap },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <item.icon className="w-4 h-4 text-[#8B5CF6] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
                <p className="text-[10px] font-mono text-[#8B5CF6] mt-0.5">{item.path}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
