"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Building2, Radio, Globe, MessageSquare,
  Search, ExternalLink, Star, TrendingUp, Mic,
  BookOpen, Heart, Stethoscope, Pill, Eye, Brain,
  Smartphone, Dna, Activity, Laptop,
} from "lucide-react";

// ── Intelligence Data ──

const FOUNDERS = [
  { name: "Neo Hutiri", company: "Pelebox", what: "Smart medicine-dispensing lockers", funding: "Africa Prize, TIME 100", priority: 1 },
  { name: "Nneile Nkholise", company: "iMed Tech / Likoebe", what: "3D-printed medical prosthetics", funding: "Forbes 30 Under 30", priority: 1 },
  { name: "De Wet Swanepoel", company: "hearX / LXE Hearing", what: "Mobile hearing care", funding: "$100M merger with Eargo", priority: 1 },
  { name: "Dr Yael Joffe", company: "3X4 Genetics", what: "Nutrigenomics DNA testing", funding: "$2.5M raised", priority: 2 },
  { name: "Kathryn Malherbe", company: "MedSol AI", what: "AI breast cancer detection", funding: "SAB Foundation winner", priority: 2 },
  { name: "Saul Kornik", company: "Healthforce / Kena Health", what: "Nurse-led telehealth in pharmacies", funding: "$3.03M + $2M", priority: 1 },
  { name: "Sheraan Amod", company: "RecoMed", what: "Patient booking platform", funding: "$1.5M, 550K+ bookings", priority: 1 },
  { name: "David Chen", company: "Kapsule", what: "Healthcare data aggregation", funding: "—", priority: 3 },
  { name: "Onkgopotse Khumalo", company: "The Pocket Couch", what: "Mental health tech", funding: "—", priority: 3 },
  { name: "Marc Gregory Knowles", company: "Ollie Health", what: "Mental health credits", funding: "Launch Africa invested", priority: 3 },
  { name: "Ernest Mhlongo", company: "Remote Doctors 4 Africa", what: "Cross-border telehealth", funding: "—", priority: 3 },
  { name: "Sylvia Klopper", company: "CareChamp", what: "Elderly home care tech", funding: "—", priority: 3 },
  { name: "Avian Bell", company: "Quantumed", what: "Personal healthcare / sexual health", funding: "Forbes Africa 30 Under 30", priority: 2 },
  { name: "Greg Gallagher", company: "Snuza", what: "Baby breathing monitors", funding: "Est. 2007", priority: 3 },
  { name: "Mphati Jezile", company: "BusyMed", what: "Pharmacy delivery for rural communities", funding: "E4E Africa", priority: 2 },
  { name: "Sizwe Nzima", company: "Iyeza Health", what: "Medicine delivery", funding: "Cape Town", priority: 3 },
  { name: "Werner Vorster", company: "Vitls", what: "Health wearable tech", funding: "—", priority: 3 },
  { name: "Dr Jaishree Naidoo", company: "Envisionit Deep AI", what: "AI radiology (25 pathologies)", funding: "$1.65M", priority: 1 },
  { name: "Dr Oliver Preisig", company: "Inqaba Biotec", what: "Africa's Genomics Company", funding: "9 countries", priority: 2 },
  { name: "Simon Travers", company: "Hyrax Biosciences", what: "HIV drug resistance testing", funding: "UCT/UWC spin-out", priority: 3 },
  { name: "Njabulo Skhosana", company: "HealthDart", what: "Google-backed healthtech", funding: "Google Black Founders 2023", priority: 1 },
];

const EXECUTIVES = [
  { name: "Dr Dumani Kula", title: "CEO", org: "Busamed", note: "BHF 2025 speaker" },
  { name: "Kerissa Naidoo", title: "Chief Medical Officer", org: "Old Mutual Limited", note: "" },
  { name: "Bernadette Breton", title: "CEO", org: "Alliance International Medical Services", note: "" },
  { name: "Gerrit Benecke", title: "Group COO", org: "Africa Health Care", note: "" },
  { name: "Anton Fatti", title: "CTO", org: "Healthbridge", note: "Former SARS Chief Tech Officer" },
  { name: "Refiloe Mogale", title: "Executive Director", org: "PSSA", note: "Pharmaceutical Society" },
  { name: "Dr Morwesi Mahlangu", title: "Senior Manager, Medical Advisory", org: "GEMS", note: "" },
  { name: "Theo Leonard", title: "CIO", org: "PMSA", note: "" },
  { name: "Francilene Baartman", title: "Director of Nursing", org: "Tygerberg Hospital", note: "Largest in Western Cape" },
  { name: "Samkele Mkumbuzi", title: "Digital Health Pharmacist", org: "AMR Youth Ambassador", note: "" },
  { name: "Dr Brett Lyndall Singh", title: "Healthcare Equity Leader", org: "Forbes 30 Under 30", note: "" },
  { name: "Dr Alveera Singh", title: "Postdoctoral Fellow", org: "AHRI", note: "M&G 200 Young SA" },
];

const COMPETITORS = [
  { company: "GoodX", est: "1985", strength: "40+ years, multi-specialty", threat: "HIGH" },
  { company: "Healthbridge", est: "25+ yrs", strength: "Cloud leader, 7K+ practices, claims", threat: "HIGH" },
  { company: "Altron HealthTech", est: "2016", strength: "JSE-listed, first on SA HIE", threat: "HIGH" },
  { company: "Solumed", est: "—", strength: "Multi-specialty PMS", threat: "MEDIUM" },
  { company: "Health Focus (Eminance)", est: "1988", strength: "Optometry niche (1,000+ optoms)", threat: "MEDIUM" },
  { company: "Bookem", est: "Recent", strength: "Cloud-first, AI Assist, POPIA", threat: "MEDIUM" },
  { company: "XDENT (CGM)", est: "—", strength: "German multinational, AI AutoScriber", threat: "MEDIUM" },
  { company: "Unisolv (BCX/Telkom)", est: "—", strength: "50%+ of SA pharmacies", threat: "LOW" },
  { company: "MediKredit", est: "—", strength: "3,436 pharmacies, 5,559 doctors", threat: "LOW" },
];

const FUNDED = [
  { company: "LifeQ", amount: "$47M", what: "Wearables/biosensing, Samsung partner" },
  { company: "hearX/LXE Hearing", amount: "$100M merger", what: "Mobile hearing care + Eargo" },
  { company: "BroadReach", amount: "Significant", what: "Population health" },
  { company: "Healthforce", amount: "$3.03M", what: "Nurse-led telehealth" },
  { company: "3X4 Genetics", amount: "$2.5M", what: "At-home DNA test, 134+ genes" },
  { company: "Kena Health", amount: "$2M", what: "300K+ downloads, #1 Google Play" },
  { company: "Envisionit Deep AI", amount: "$1.65M", what: "25 pathologies on chest X-ray" },
  { company: "RecoMed", amount: "$1.5M", what: "550K+ patient bookings" },
];

const PLATFORMS = [
  { name: "EMGuidance", reach: "80,000 HCPs", usage: "87% daily, 1.6M searches/month", rank: 1 },
  { name: "WhatsApp", reach: "96% of doctors", usage: "Clinical consults, peer groups", rank: 2 },
  { name: "HealthBridge/GoodX", reach: "7,000+ practices", usage: "Billing, scheduling, claims", rank: 3 },
  { name: "MedicalBrief", reach: "50,000 subscribers", usage: "Weekly Thursday email", rank: 4 },
  { name: "Discovery HealthID", reach: "50% of Discovery doctors", usage: "Patient records, claims", rank: 5 },
  { name: "Medscape", reach: "62% of paediatric doctors", usage: "Drug info, CME", rank: 6 },
  { name: "Facebook", reach: "70.7% of HCPs", usage: "SAMA, JUDASA groups", rank: 7 },
  { name: "LinkedIn", reach: "52.2% of HCPs", usage: "Professional networking", rank: 8 },
  { name: "deNovo Medica", reach: "20,000 HCPs/year", usage: "Free CPD (mandatory)", rank: 9 },
  { name: "MedPages", reach: "720,000 visits/month", usage: "Doctor directory", rank: 10 },
  { name: "Vula Mobile", reach: "14,200+ users", usage: "Specialist referrals (15-min)", rank: 11 },
  { name: "RecoMed", reach: "550,000+ bookings", usage: "Patient appointment booking", rank: 12 },
];

const COMMUNITIES = [
  { name: "SAdocs Hub", platform: "Web", size: "THE doctor forum", type: "doctors" },
  { name: "SAMA Facebook", platform: "Facebook", size: "Official medical association", type: "doctors" },
  { name: "JUDASA", platform: "Facebook", size: "Junior doctors — interns, registrars", type: "doctors" },
  { name: "AfroPHC Google Group", platform: "Google Groups", size: "1,300+ members, 64 countries", type: "doctors" },
  { name: "SAPPF WhatsApp", platform: "WhatsApp", size: "Private practitioners direct", type: "doctors" },
  { name: "DENOSA", platform: "Facebook", size: "82K union members", type: "nursing" },
  { name: "SASP Physiotherapy", platform: "Facebook", size: "~8K likes", type: "allied" },
  { name: "OTASA Occupational Therapy", platform: "Facebook", size: "~8.6K likes", type: "allied" },
  { name: "Dentists in South Africa", platform: "Facebook", size: "Practice mgmt + clinical", type: "allied" },
  { name: "ZATech Slack", platform: "Slack", size: "SA's largest tech community", type: "tech" },
  { name: "HealthTech Hub Africa", platform: "Slack", size: "Accelerator members", type: "tech" },
  { name: "#hcsmSA", platform: "Twitter/X", size: "Monthly health social media chats", type: "tech" },
  { name: "SA with Diabetes", platform: "Facebook", size: "~37K likes", type: "patient" },
  { name: "SADAG Mental Health", platform: "Facebook + Phone", size: "180+ groups, 400 calls/day", type: "patient" },
];

const DISTRIBUTION_PRIORITY = [
  { target: "MedicalBrief", contact: "mbenquiries@juta.co.za", reach: "50K doctors", timing: "This week", done: false },
  { target: "LinkedIn article", contact: "Post VRL-001 summary", reach: "Tag #hcsmSA", timing: "This week", done: false },
  { target: "Spotlight", contact: "Editors@SpotlightNSP.co.za", reach: "NCD angle", timing: "Next week", done: false },
  { target: "Bhekisisa", contact: "Editors", reach: "Routing crisis narrative", timing: "Next week", done: false },
  { target: "The Conversation Africa", contact: "Submit academic summary", reach: "Academic audience", timing: "Next week", done: false },
  { target: "deNovo Medica", contact: "CPD module proposal", reach: "20K captive", timing: "Week 3", done: false },
  { target: "mediBytes podcast", contact: "Guest spot pitch", reach: "Podcast audience", timing: "Week 3", done: false },
  { target: "HISA Conference", contact: "Abstract submission", reach: "May 27-28 JHB", timing: "Month 2", done: false },
  { target: "BHF Conference", contact: "Programme Director", reach: "July 4-8 Cape Town", timing: "Month 2", done: false },
  { target: "WCPH Conference", contact: "Abstract Committee", reach: "Sep 6-9 Cape Town", timing: "Month 2", done: false },
];

type Tab = "founders" | "executives" | "competitors" | "funded" | "platforms" | "communities" | "distribution";

export default function HealthMediaPage() {
  const [tab, setTab] = useState<Tab>("founders");
  const [search, setSearch] = useState("");

  const tabs: { key: Tab; label: string; icon: typeof Users; count: number }[] = [
    { key: "founders", label: "Founders", icon: Users, count: FOUNDERS.length },
    { key: "executives", label: "Executives", icon: Building2, count: EXECUTIVES.length },
    { key: "competitors", label: "Competitors", icon: Activity, count: COMPETITORS.length },
    { key: "funded", label: "Top Funded", icon: TrendingUp, count: FUNDED.length },
    { key: "platforms", label: "Platforms", icon: Smartphone, count: PLATFORMS.length },
    { key: "communities", label: "Communities", icon: MessageSquare, count: COMMUNITIES.length },
    { key: "distribution", label: "VRL-001 Distribution", icon: Radio, count: DISTRIBUTION_PRIORITY.length },
  ];

  const q = search.toLowerCase();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--ivory)]">Health Media SA</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
            SA health sector intelligence — 75 founders, 32 executives, 100+ companies, 80+ communities
          </p>
        </div>
        <div className="text-[10px] text-[var(--text-tertiary)] text-right">
          Source: 600+ web queries, 3 deep search agents<br />Compiled March 2026
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPI icon={Users} label="Named Leaders" value="167" color="#8B5CF6" />
        <KPI icon={Building2} label="Companies Mapped" value="100+" color="#10b981" />
        <KPI icon={MessageSquare} label="Communities" value="80+" color="#0ea5e9" />
        <KPI icon={TrendingUp} label="Funding Tracked" value="$160M+" color="#D4AF37" />
        <KPI icon={Radio} label="Distribution Targets" value="10" color="#ef4444" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search across all intelligence..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--obsidian)]/50 border border-[var(--border)] text-[var(--ivory)] text-[13px] focus:outline-none focus:border-[var(--gold)]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? "bg-[var(--ivory)] text-[var(--obsidian)]"
                : "bg-[var(--obsidian)]/50 text-[var(--text-secondary)] hover:text-[var(--ivory)]"
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel overflow-hidden">
        {tab === "founders" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Company</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Focus</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Funding / Recognition</th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Priority</th>
            </tr></thead>
            <tbody>
              {FOUNDERS.filter(f => !q || f.name.toLowerCase().includes(q) || f.company.toLowerCase().includes(q) || f.what.toLowerCase().includes(q)).map((f, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{f.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{f.company}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{f.what}</td>
                  <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{f.funding}</td>
                  <td className="px-4 py-3 text-center">
                    <PriorityBadge p={f.priority} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "executives" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Name</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Title</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Organization</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Notes</th>
            </tr></thead>
            <tbody>
              {EXECUTIVES.filter(e => !q || e.name.toLowerCase().includes(q) || e.org.toLowerCase().includes(q)).map((e, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{e.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{e.title}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{e.org}</td>
                  <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)]">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "competitors" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Company</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Est.</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Strength</th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Threat</th>
            </tr></thead>
            <tbody>
              {COMPETITORS.filter(c => !q || c.company.toLowerCase().includes(q)).map((c, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{c.company}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{c.est}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{c.strength}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      c.threat === "HIGH" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                      c.threat === "MEDIUM" ? "bg-[#f97316]/10 text-[#f97316]" :
                      "bg-[#10b981]/10 text-[#10b981]"
                    }`}>{c.threat}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "funded" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">#</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Company</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Funding</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">What</th>
            </tr></thead>
            <tbody>
              {FUNDED.map((f, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[12px] text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{f.company}</td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[#D4AF37]">{f.amount}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{f.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "platforms" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-center px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Rank</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Platform</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Reach</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Daily Usage</th>
            </tr></thead>
            <tbody>
              {PLATFORMS.filter(p => !q || p.name.toLowerCase().includes(q)).map((p) => (
                <tr key={p.rank} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[12px] font-bold ${p.rank <= 3 ? "text-[#D4AF37]" : "text-[var(--text-tertiary)]"}`}>#{p.rank}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{p.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{p.reach}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{p.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "communities" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Community</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Platform</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Size / Notes</th>
              <th className="text-center px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Type</th>
            </tr></thead>
            <tbody>
              {COMMUNITIES.filter(c => !q || c.name.toLowerCase().includes(q) || c.type.includes(q)).map((c, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{c.name}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{c.platform}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{c.size}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      c.type === "doctors" ? "bg-[#8B5CF6]/10 text-[#8B5CF6]" :
                      c.type === "nursing" ? "bg-[#ec4899]/10 text-[#ec4899]" :
                      c.type === "allied" ? "bg-[#10b981]/10 text-[#10b981]" :
                      c.type === "tech" ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" :
                      "bg-[#f97316]/10 text-[#f97316]"
                    }`}>{c.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "distribution" && (
          <table className="w-full">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Target</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Contact / Action</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Reach / Angle</th>
              <th className="text-left px-4 py-3 text-[11px] font-medium text-[var(--text-tertiary)] uppercase">Timing</th>
            </tr></thead>
            <tbody>
              {DISTRIBUTION_PRIORITY.map((d, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--obsidian)]/20">
                  <td className="px-4 py-3 text-[13px] font-medium text-[var(--ivory)]">{d.target}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)] font-mono">{d.contact}</td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-secondary)]">{d.reach}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      d.timing === "This week" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                      d.timing === "Next week" ? "bg-[#f97316]/10 text-[#f97316]" :
                      "bg-[var(--obsidian)] text-[var(--text-tertiary)]"
                    }`}>{d.timing}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl glass-panel p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-lg font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)]">{label}</div>
    </motion.div>
  );
}

function PriorityBadge({ p }: { p: number }) {
  const config = p === 1
    ? { label: "P1", color: "#ef4444" }
    : p === 2
    ? { label: "P2", color: "#f97316" }
    : { label: "P3", color: "#666" };
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: config.color, backgroundColor: `${config.color}15` }}>
      {config.label}
    </span>
  );
}
