"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Users, Target, Megaphone, BarChart3, Globe,
  Stethoscope, ChevronRight, ChevronDown, Activity, Star,
  MapPin, Calendar, Search, HeartPulse, Zap, Shield,
  CheckCircle2, ArrowUpRight, Clock, Lightbulb, BookOpen,
} from "lucide-react";

// ─── Data (sanitized for client view — no costs, no GP contacts) ──────

const MARKET_STATS = [
  { label: "Potential Sinus Patients in Gauteng", value: "~1.4M", icon: Users, color: "#3B82F6" },
  { label: "SA Allergic Rhinitis Prevalence", value: "15-40%", icon: HeartPulse, color: "#10B981" },
  { label: "Sinus Device Market Growth", value: "8.6% YoY", icon: TrendingUp, color: "#8B5CF6" },
  { label: "JHB ENTs Running Ads", value: "0", icon: Target, color: "#F59E0B", note: "Opportunity" },
];

const ACQUISITION_CHANNELS = [
  {
    name: "GP Referral Network",
    share: "40-50%",
    status: "Building",
    statusColor: "#F59E0B",
    desc: "Digital referral portal live. Building network of 30-50 GPs in Parktown/Sandton/Fourways corridor. Automated feedback loop sends consultation reports back to referring GPs.",
    icon: Stethoscope,
  },
  {
    name: "Google Search & Ads",
    share: "20-25%",
    status: "Ready to Launch",
    statusColor: "#3B82F6",
    desc: "SEO landing page and symptom checker live. Google Ads campaign designed targeting high-intent keywords. Almost zero competition from JHB ENTs.",
    icon: Search,
  },
  {
    name: "Medical Aid Directories",
    share: "10-15%",
    status: "Action Needed",
    statusColor: "#EF4444",
    desc: "Ensure active registration on Discovery Health, GEMS, Bonitas, Momentum, Medihelp 'Find a Doctor' directories. Register on RecoMed for online booking visibility.",
    icon: Shield,
  },
  {
    name: "Social Media & Content",
    share: "5-10%",
    status: "Content Ready",
    statusColor: "#8B5CF6",
    desc: "4-week content calendar prepared. 10 video scripts written for TikTok/Instagram. 5 SEO blog articles outlined. Focus: educational content that builds trust.",
    icon: Megaphone,
  },
  {
    name: "Online Booking & Reviews",
    share: "5-10%",
    status: "Live",
    statusColor: "#10B981",
    desc: "Public booking page live with 12 services. Automated review collection sends Google review requests 48 hours after every completed visit.",
    icon: Star,
  },
];

const COMPETITOR_ANALYSIS = [
  { name: "Dr. Deon Rossouw", area: "Rosebank", strength: "40 years experience, strong SEO", gap: "No ads, no social, phone-only booking" },
  { name: "Dr. Sibulele Cezula", area: "Midrand", strength: "Transparent pricing, Rutgers fellowship", gap: "No ads, no social media" },
  { name: "Dr. Anton Smit", area: "Johannesburg", strength: "Professional website", gap: "No ads, no booking system" },
  { name: "Dr. Tim Capon", area: "Alberton", strength: "Complex sinus & skull base", gap: "No digital marketing" },
  { name: "ENT Morningside", area: "Morningside", strength: "Two-doctor group practice", gap: "No online presence beyond website" },
];

const SEASONAL_CALENDAR = [
  { period: "May — August", label: "Winter Sinus Season", desc: "Peak demand. Cold air, indoor heating, flu season drive sinus infections. Highest conversion period for Google Ads.", color: "#3B82F6", icon: "❄️" },
  { period: "September — November", label: "Spring Pollen Alert", desc: "Highveld grass pollen explosion. Allergic rhinitis → chronic sinusitis pipeline. Content push on allergy-to-sinus connection.", color: "#F59E0B", icon: "🌸" },
  { period: "January — February", label: "New Year, Breathe Free", desc: "Elective procedure window. Patients schedule surgery during January holiday period. Push surgical consultations.", color: "#10B981", icon: "✨" },
  { period: "March — April", label: "Autumn Allergy Check", desc: "Transition season. Free sinus screening events. Corporate wellness partnerships. GP outreach intensifies.", color: "#8B5CF6", icon: "🍂" },
];

const CONTENT_TOPICS = [
  "5 signs your sinus problem needs surgery, not just medication",
  "What your ENT actually sees inside your nose (endoscopy)",
  "Sinus headache vs migraine — how to tell the difference",
  "Why Joburg's air makes your sinuses worse",
  "What happens during a sinus consultation",
  "3 things to try before seeing an ENT",
  "Why GPs refer patients to an ENT",
  "Balloon sinuplasty explained in 30 seconds",
  "Day in the life: Head of ENT at NMCH",
  "Your nose is not supposed to be blocked 24/7",
];

const DEMAND_FACTS = [
  "Allergic rhinitis affects 15-40% of South Africa's population — 9 to 24 million people",
  "Chronic rhinosinusitis affects ~12% of adults — approximately 1.4 million potential patients in Gauteng alone",
  "Johannesburg's Highveld grass pollen season runs September to May — nearly year-round",
  "Balloon sinuplasty use increased 500% globally from 2011-2015",
  "46% of all Google searches are local — 'ENT near me' is a high-value search",
  "70%+ of patients use online reviews as their FIRST step in choosing a provider",
  "67% of patients prefer booking online over calling",
  "90% of self-diagnosed 'sinus headaches' are actually migraines — huge education opportunity",
  "No JHB ENT surgeons currently run Google Ads — the digital space is wide open",
  "GPs' #1 complaint about specialists: never hearing back after referral",
];

const LIVE_PAGES = [
  { name: "Public Booking", url: "/book/drlamola", desc: "12 services, 6-step wizard, WhatsApp confirmations" },
  { name: "AI Symptom Checker", url: "/check/drlamola", desc: "Patients describe symptoms → AI recommends service → books" },
  { name: "GP Referral Portal", url: "/refer/drlamola", desc: "GPs refer digitally, get consultation reports back" },
  { name: "ENT Landing Page", url: "/ent/drlamola", desc: "SEO-optimized, conversion-focused, FAQ, services" },
];

type Section = "overview" | "channels" | "competitors" | "content" | "calendar" | "demand";

export default function PracticeInsightsPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);

  const sections: { id: Section; label: string; icon: typeof TrendingUp }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "channels", label: "Acquisition Channels", icon: Target },
    { id: "competitors", label: "Competitor Analysis", icon: Search },
    { id: "content", label: "Content Strategy", icon: Megaphone },
    { id: "calendar", label: "Seasonal Calendar", icon: Calendar },
    { id: "demand", label: "Market Demand", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#D4AF37]" />
          Practice Insights
        </h1>
        <p className="text-xs text-gray-500 mt-1">Market research, acquisition strategy, and growth plan — Joburg ENT</p>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSection === section.id
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-gray-600 hover:bg-white/10"
              }`}
            >
              <Icon className="w-3 h-3" />
              {section.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {activeSection === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Market Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MARKET_STATS.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                      {stat.note && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: stat.color + "20", color: stat.color }}>
                          {stat.note}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <p className="text-[10px] text-gray-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Live Pages */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" /> Live Patient-Facing Pages
              </h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {LIVE_PAGES.map(page => (
                  <a
                    key={page.name}
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#3DA9D1]/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#3DA9D1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900">{page.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{page.desc}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Target */}
            <div className="p-5 rounded-xl border-2 border-[#D4AF37]/20 bg-[#D4AF37]/5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-sm font-semibold text-gray-900">Target: 80 Bookings/Month</h2>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Based on market research, the demand exists — 1.4M potential sinus patients in Gauteng, near-zero digital competition from JHB ENTs.
                The strategy combines GP referrals (40-50%), Google Ads (20-25%), medical aid directories (10-15%), social media (5-10%), and automated review collection.
                Full ramp to 80+ bookings expected within 6 months.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── ACQUISITION CHANNELS ── */}
        {activeSection === "channels" && (
          <motion.div key="channels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-gray-500">How patients will find and book with your practice — ranked by expected volume</p>
            {ACQUISITION_CHANNELS.map(channel => {
              const Icon = channel.icon;
              const isExpanded = expandedChannel === channel.name;
              return (
                <div key={channel.name} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setExpandedChannel(isExpanded ? null : channel.name)}
                    className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: channel.statusColor + "15" }}>
                      <Icon className="w-5 h-5" style={{ color: channel.statusColor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">{channel.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: channel.statusColor + "20", color: channel.statusColor }}>
                          {channel.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Expected share: {channel.share} of bookings</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-700 leading-relaxed">{channel.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── COMPETITOR ANALYSIS ── */}
        {activeSection === "competitors" && (
          <motion.div key="competitors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-gray-500">Top ENT practices in Johannesburg — their strengths and the gaps we exploit</p>

            <div className="p-4 rounded-xl border border-[#3DA9D1]/20 bg-[#3DA9D1]/5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#3DA9D1]" />
                <h3 className="text-xs font-semibold text-[#3DA9D1]">Your Competitive Edge</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Head of ENT at Nelson Mandela Children&apos;s Hospital. Daily Maverick press coverage.
                3 practice locations across Gauteng. And now: the only JHB ENT with online booking,
                AI symptom checker, digital GP referral system, and automated review collection.
              </p>
            </div>

            {COMPETITOR_ANALYSIS.map(comp => {
              const isExpanded = expandedCompetitor === comp.name;
              return (
                <div key={comp.name} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setExpandedCompetitor(isExpanded ? null : comp.name)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{comp.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {comp.area}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Strength</p>
                        <p className="text-xs text-gray-700">{comp.strength}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Their Gap</p>
                        <p className="text-xs text-red-400/80">{comp.gap}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── CONTENT STRATEGY ── */}
        {activeSection === "content" && (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <p className="text-xs text-gray-500">Educational content that builds trust and drives patients to book. 10 video scripts ready to film.</p>

            <div className="space-y-2">
              <h3 className="text-xs text-gray-600 uppercase tracking-wider">Video Scripts Ready</h3>
              {CONTENT_TOPICS.map((topic, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#8B5CF6]">{i + 1}</span>
                  </div>
                  <p className="text-xs text-gray-700">{topic}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-semibold text-gray-900">SEO Blog Articles</h3>
              </div>
              <ul className="space-y-2">
                {[
                  "ENT Specialist Johannesburg — When to See One",
                  "Chronic Sinusitis Treatment in South Africa",
                  "Sinus Surgery: What to Expect (FESS Guide)",
                  "Balloon Sinuplasty vs Traditional Sinus Surgery",
                  "Why Your Nose is Always Blocked in Johannesburg",
                ].map((title, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1] shrink-0" />
                    {title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5">
              <h3 className="text-xs font-semibold text-[#8B5CF6] mb-2">Platforms</h3>
              <p className="text-xs text-gray-600">TikTok + Instagram Reels + Facebook. 3-5 posts per week. All content can be batch-filmed in 1-2 hours per month. Professional but approachable — surgeon credibility, not influencer energy.</p>
            </div>
          </motion.div>
        )}

        {/* ── SEASONAL CALENDAR ── */}
        {activeSection === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-gray-500">Sinus demand is seasonal. Each quarter has a different marketing angle.</p>
            {SEASONAL_CALENDAR.map(season => (
              <div key={season.period} className="p-5 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{season.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{season.label}</h3>
                    <p className="text-[10px] flex items-center gap-1" style={{ color: season.color }}>
                      <Clock className="w-3 h-3" /> {season.period}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{season.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── MARKET DEMAND ── */}
        {activeSection === "demand" && (
          <motion.div key="demand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <p className="text-xs text-gray-500">Key data points driving the acquisition strategy</p>
            <div className="space-y-2">
              {DEMAND_FACTS.map((fact, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-3 h-3 text-[#D4AF37]" />
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{fact}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 mt-4">
              <h3 className="text-xs font-semibold text-[#D4AF37] mb-2">Bottom Line</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The demand is massive and the competition is asleep. 1.4 million potential sinus patients in Gauteng,
                zero JHB ENTs running digital ads, and the #1 GP complaint (no specialist feedback) is now automated in your system.
                80 bookings/month is conservative.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
