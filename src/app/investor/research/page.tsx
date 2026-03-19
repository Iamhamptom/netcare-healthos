"use client";

import { Search, FileText, TrendingUp, Shield, Users, Brain, Calendar, ExternalLink } from "lucide-react";

const researchCategories = [
  {
    title: "SA Healthcare Compliance",
    icon: Shield,
    color: "#10b981",
    papers: [
      {
        title: "SA Healthcare Marketing Compliance Guide",
        description: "Complete guide covering POPIA, HPCSA, ICD-10, CPA, Medical Schemes Act, Medicines Act, and ECTA. Includes ENT societies, T-codes reference, marketing rules, and compliance checklist.",
        type: "Internal Research",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "POPIA Health Information Regulations Analysis",
        description: "Analysis of the new regulations on processing health data (Government Gazette 54268, March 2026) and their impact on healthcare platforms.",
        type: "Regulatory Analysis",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "HPCSA Digital Marketing Rules for Medical Practices",
        description: "Comprehensive breakdown of what is and isn't allowed when marketing medical practices digitally in South Africa. Covers Google Ads, social media, SEO, email, and SMS.",
        type: "Compliance Guide",
        date: "March 2026",
        status: "Complete",
      },
    ],
  },
  {
    title: "ENT Market Intelligence",
    icon: Users,
    color: "#8B5CF6",
    papers: [
      {
        title: "SA ENT Market Research Report",
        description: "Market size (R3-5B), specialist distribution (380-420 nationally), paediatric ENT demand, tonsillectomy rates (highest in the world), revenue per specialist, medical aid coverage.",
        type: "Market Research",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "Johannesburg ENT Competitive Landscape",
        description: "25-30 identified ENT specialists in greater Joburg. Practice-by-practice analysis of services, hospitals, digital presence, and competitive gaps.",
        type: "Competitive Analysis",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "ENT Practice Growth Strategy — Joburg",
        description: "10-channel patient acquisition plan covering GP referral networks, paediatric pipeline, hospital strategy, compliant digital marketing, and Netcare Health OS OS integration.",
        type: "Strategy Document",
        date: "March 2026",
        status: "Complete",
      },
    ],
  },
  {
    title: "Oncology Market Intelligence",
    icon: TrendingUp,
    color: "#ec4899",
    papers: [
      {
        title: "SA Oncology Market Research Report",
        description: "R12B+ market growing at 14% CAGR. Only ~200 oncologists nationally. Severe public sector shortage. Medical aid coverage analysis, treatment costs, and key trends.",
        type: "Market Research",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "SA Oncology Competitive Landscape",
        description: "Icon Oncology (160 oncologists, market leader), Cancercare, OncoCare, Sandton Oncology, ABJ Inc. Hospital-based units, academic centres, technology gaps.",
        type: "Competitive Analysis",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "Specialist Practice Growth Strategy",
        description: "Universal strategies for growing specialist practices in SA — GP referral networks, hospital relationships, medical aid contracting, compliant digital marketing, clinical trials.",
        type: "Strategy Document",
        date: "March 2026",
        status: "Complete",
      },
    ],
  },
  {
    title: "AI & Digital Health",
    icon: Brain,
    color: "#0ea5e9",
    papers: [
      {
        title: "AI in SA Healthcare — Opportunity Assessment",
        description: "AI adoption gaps across ENT, oncology, and general practice. No SA medical practice has AI triage, patient portals, or automated follow-ups.",
        type: "Market Gap Analysis",
        date: "March 2026",
        status: "Complete",
      },
      {
        title: "ICD-10 T-Codes Reference for South Africa",
        description: "Complete T-code categories (T00-T98), SA-specific coding rules, ENT-specific codes, medical aid scheme requirements, and official resources.",
        type: "Technical Reference",
        date: "March 2026",
        status: "Complete",
      },
    ],
  },
  {
    title: "Coming Soon",
    icon: Calendar,
    color: "#f59e0b",
    papers: [
      {
        title: "SA Primary Care Market Report",
        description: "Market sizing for GPs, community health centres, and primary care clinics. Digital adoption, billing patterns, and Netcare Health OS opportunity.",
        type: "Market Research",
        date: "Q2 2026",
        status: "Planned",
      },
      {
        title: "Dental Practice Market Intelligence",
        description: "SA dental market analysis. Private practice landscape, medical aid dental coverage, digital gaps, and patient acquisition strategies.",
        type: "Market Research",
        date: "Q2 2026",
        status: "Planned",
      },
      {
        title: "Netcare Health OS OS — Clinical Outcomes Whitepaper",
        description: "First 6-month impact report from Netcare Health OS client practices. Time savings, patient throughput, billing accuracy, and compliance improvements.",
        type: "Whitepaper",
        date: "Q3 2026",
        status: "Planned",
      },
    ],
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Complete: { bg: "bg-[#3DA9D1]", text: "text-[#1D3443]" },
  Planned: { bg: "bg-amber-100", text: "text-amber-700" },
};

export default function InvestorResearchPage() {
  const totalPapers = researchCategories.reduce((sum, cat) => sum + cat.papers.length, 0);
  const completePapers = researchCategories.reduce(
    (sum, cat) => sum + cat.papers.filter((p) => p.status === "Complete").length, 0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Research Portal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Market intelligence, compliance research, and strategic analysis powering the Netcare Health OS ecosystem.
          All research is conducted with live data and verified sources.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#3DA9D1] border border-[#3DA9D1] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#1D3443] font-serif">{completePapers}</p>
          <p className="text-xs text-[#3DA9D1]">Reports Complete</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-700 font-serif">{totalPapers - completePapers}</p>
          <p className="text-xs text-amber-600">In Pipeline</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-700 font-serif">{researchCategories.length}</p>
          <p className="text-xs text-purple-600">Research Areas</p>
        </div>
      </div>

      {/* Research Categories */}
      <div className="space-y-6">
        {researchCategories.map((category) => (
          <div key={category.title}>
            <div className="flex items-center gap-2 mb-3">
              <category.icon className="w-5 h-5" style={{ color: category.color }} />
              <h2 className="text-lg font-bold text-gray-900">{category.title}</h2>
              <span className="text-xs text-gray-400">({category.papers.length} reports)</span>
            </div>

            <div className="space-y-2">
              {category.papers.map((paper) => {
                const status = statusColors[paper.status] || statusColors.Planned;
                return (
                  <div
                    key={paper.title}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{paper.title}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
                            {paper.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{paper.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {paper.type}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {paper.date}
                          </span>
                        </div>
                      </div>
                      {paper.status === "Complete" && (
                        <span className="text-[10px] px-2 py-1 rounded bg-[#3DA9D1] text-[#3DA9D1] font-medium shrink-0">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
