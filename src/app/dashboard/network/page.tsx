"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  DollarSign, FileWarning, Activity, Users, Receipt, Shield, BarChart3,
  ArrowUpRight, ArrowDownRight, Clock, Zap, Globe, ChevronRight, Loader2,
} from "lucide-react";
import type { DivisionKPI, ClinicPerformance, RejectionCode, SchemeMetric } from "@/lib/data-sources/types";

// Icon map for KPIs from API
const ICON_MAP: Record<string, typeof DollarSign> = {
  DollarSign, Receipt, FileWarning, TrendingUp, BarChart3, Clock, Activity, Users, Shield, Zap,
};

function formatRand(n: number) {
  if (n >= 1000000) return `R${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `R${(n / 1000).toFixed(0)}K`;
  return `R${n.toLocaleString()}`;
}

function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export default function NetworkFinancialPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "clinics" | "claims" | "savings" | "schemes">("overview");
  const [kpis, setKpis] = useState<DivisionKPI[]>([]);
  const [clinics, setClinics] = useState<ClinicPerformance[]>([]);
  const [rejections, setRejections] = useState<RejectionCode[]>([]);
  const [schemes, setSchemes] = useState<SchemeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/network?tab=${tab}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      switch (tab) {
        case "kpis": setKpis(data); break;
        case "clinics": setClinics(data); break;
        case "rejections": setRejections(data); break;
        case "schemes": setSchemes(data); break;
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err);
      setError(`Failed to load data. The database may not be seeded yet.`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data for current tab
  useEffect(() => {
    const tabMap: Record<string, string> = {
      overview: "kpis",
      clinics: "clinics",
      claims: "rejections",
      schemes: "schemes",
    };
    const apiTab = tabMap[selectedTab];
    if (apiTab) fetchData(apiTab);
    else setLoading(false);
  }, [selectedTab, fetchData]);

  // Pre-fetch clinics for overview revenue breakdown
  useEffect(() => {
    if (clinics.length === 0) {
      fetch("/api/network?tab=clinics")
        .then(r => r.ok ? r.json() : [])
        .then(d => { if (Array.isArray(d) && d.length > 0) setClinics(d); })
        .catch(() => {});
    }
  }, [clinics.length]);

  const totalRevenue = clinics.reduce((s, c) => s + c.revenue, 0);
  const totalTarget = clinics.reduce((s, c) => s + c.target, 0);
  const totalClaims = clinics.reduce((s, c) => s + c.claimsSubmitted, 0);
  const totalRejected = clinics.reduce((s, c) => s + c.claimsRejected, 0);
  const networkRejectionRate = totalClaims > 0 ? ((totalRejected / totalClaims) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="/images/netcare-logo.png" alt="Netcare" className="h-5" />
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Financial Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Network Financial Overview</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {clinics.length > 0 ? `${clinics.length} clinics` : "88 clinics"} &middot; 41 pharmacies &middot; 12 day theatres &middot; 568 practitioners &middot; 3.5M patients/year
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">DEMO</span>
          </div>
          <span className="text-[11px] text-gray-400">Sample data &middot; March 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "overview" as const, label: "Overview", icon: BarChart3 },
          { key: "clinics" as const, label: "Clinic Performance", icon: Building2 },
          { key: "claims" as const, label: "Claims Intelligence", icon: FileWarning },
          { key: "savings" as const, label: "Cost Savings", icon: Zap },
          { key: "schemes" as const, label: "Medical Schemes", icon: Shield },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              selectedTab === tab.key ? "bg-white text-[#1D3443] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[13px]">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {loading && kpis.length === 0 ? <LoadingSkeleton rows={2} /> : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {kpis.map((kpi, i) => {
                  const Icon = ICON_MAP[kpi.icon] || BarChart3;
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl border ${kpi.status === "attention" ? "border-red-200 bg-red-50/30" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.trend.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                          {kpi.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {kpi.trend}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 font-metric">{kpi.value}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(kpi.pct, 100)}%`, backgroundColor: kpi.status === "attention" ? "#EF4444" : kpi.color }}
                        />
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">Target: {kpi.target}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Two column — Revenue vs Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Region */}
                <div className="p-5 rounded-xl border border-gray-200 bg-white">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#3DA9D1]" /> Revenue by Region
                  </h3>
                  <div className="space-y-3">
                    {Array.from(new Set(clinics.map(c => c.region))).map(region => {
                      const regionClinics = clinics.filter(c => c.region === region);
                      const rev = regionClinics.reduce((s, c) => s + c.revenue, 0);
                      const tgt = regionClinics.reduce((s, c) => s + c.target, 0);
                      if (regionClinics.length === 0) return null;
                      return (
                        <div key={region}>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-gray-700 font-medium">{region} <span className="text-gray-400">({regionClinics.length} sites)</span></span>
                            <span className="font-semibold text-gray-900">{formatRand(rev)}</span>
                          </div>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#3DA9D1] rounded-full" style={{ width: `${tgt > 0 ? (rev / tgt) * 100 : 0}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[13px] text-gray-500">Network Total</span>
                    <span className="text-lg font-bold text-[#1D3443]">{formatRand(totalRevenue)}</span>
                  </div>
                </div>

                {/* Alerts */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                  <h3 className="text-[13px] font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Financial Alerts — Requires Attention
                  </h3>
                  <div className="space-y-3">
                    {clinics.filter(c => c.rejectionRate > 8).slice(0, 3).map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-white border border-amber-200">
                        <div className="text-[11px] text-amber-600 font-semibold uppercase">High Rejection Rate</div>
                        <div className="text-[13px] text-gray-700 mt-1">
                          {c.name}: <span className="font-bold text-red-600">{c.rejectionRate}% rejection rate</span> — {c.claimsRejected} claims rejected out of {c.claimsSubmitted}.
                        </div>
                      </div>
                    ))}
                    {clinics.filter(c => c.rejectionRate > 8).length === 0 && (
                      <div className="p-3 rounded-lg bg-white border border-green-200 text-[13px] text-green-700">
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                        No clinics above 8% rejection threshold
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Clinics Tab */}
      {selectedTab === "clinics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {loading && clinics.length === 0 ? <LoadingSkeleton rows={6} /> : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-600">Clinic</th>
                    <th className="text-left p-3 font-semibold text-gray-600">Region</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Revenue</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Target</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Claims</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Rejected</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Rej. Rate</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Collection</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Patients</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((clinic, i) => (
                    <tr key={clinic.id || i} className={`border-b border-gray-100 hover:bg-gray-50/50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="p-3 font-medium text-gray-900">{clinic.name}</td>
                      <td className="p-3 text-gray-500">{clinic.region}</td>
                      <td className="p-3 text-right font-semibold">{formatRand(clinic.revenue)}</td>
                      <td className="p-3 text-right text-gray-400">{formatRand(clinic.target)}</td>
                      <td className="p-3 text-right">{clinic.claimsSubmitted.toLocaleString()}</td>
                      <td className="p-3 text-right text-red-600 font-medium">{clinic.claimsRejected}</td>
                      <td className={`p-3 text-right font-semibold ${clinic.rejectionRate > 7 ? "text-red-600" : clinic.rejectionRate > 5 ? "text-amber-600" : "text-green-600"}`}>
                        {clinic.rejectionRate}%
                      </td>
                      <td className={`p-3 text-right font-semibold ${clinic.collectionRatio >= 95 ? "text-green-600" : clinic.collectionRatio >= 90 ? "text-amber-600" : "text-red-600"}`}>
                        {clinic.collectionRatio}%
                      </td>
                      <td className="p-3 text-right text-gray-600">{clinic.patientCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#1D3443] text-white font-semibold">
                    <td className="p-3" colSpan={2}>Network Total ({clinics.length} clinics)</td>
                    <td className="p-3 text-right">{formatRand(totalRevenue)}</td>
                    <td className="p-3 text-right">{formatRand(totalTarget)}</td>
                    <td className="p-3 text-right">{totalClaims.toLocaleString()}</td>
                    <td className="p-3 text-right">{totalRejected.toLocaleString()}</td>
                    <td className="p-3 text-right">{networkRejectionRate}%</td>
                    <td className="p-3 text-right">—</td>
                    <td className="p-3 text-right">{clinics.reduce((s, c) => s + c.patientCount, 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Claims Intelligence Tab */}
      {selectedTab === "claims" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {loading && rejections.length === 0 ? <LoadingSkeleton rows={4} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">Total Claims</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{totalClaims.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
                  <div className="text-[11px] text-red-600 uppercase font-semibold">Rejected</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{totalRejected.toLocaleString()}</div>
                  <div className="text-[11px] text-gray-500 font-medium mt-1">{networkRejectionRate}% rejection rate</div>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                  <div className="text-[11px] text-amber-600 uppercase font-semibold">Value at Risk</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {formatRand(rejections.reduce((s, r) => s + r.value, 0))}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-green-200 bg-green-50/30">
                  <div className="text-[11px] text-green-600 uppercase font-semibold">AI Preventable</div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {formatRand(Math.floor(rejections.reduce((s, r) => s + r.value, 0) * 0.75))}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium mt-1">75% recoverable with AI</div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-[14px] font-semibold text-gray-900">Top Rejection Reasons — AI Action Plan</h3>
                  <p className="text-[12px] text-gray-500">Claims rejected via switching — ranked by recoverable value</p>
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-600">Code</th>
                      <th className="text-left p-3 font-semibold text-gray-600">Reason</th>
                      <th className="text-right p-3 font-semibold text-gray-600">Count</th>
                      <th className="text-right p-3 font-semibold text-gray-600">Value</th>
                      <th className="text-left p-3 font-semibold text-gray-600">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejections.map((code, i) => (
                      <tr key={code.code} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                        <td className="p-3 font-mono text-[12px] text-red-600 font-medium">{code.code}</td>
                        <td className="p-3 text-gray-700">{code.description}</td>
                        <td className="p-3 text-right font-semibold">{code.count}</td>
                        <td className="p-3 text-right font-semibold text-red-600">{formatRand(code.value)}</td>
                        <td className="p-3 text-[12px] text-[#3DA9D1] font-medium">{code.aiRecommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Cost Savings Tab — links to /dashboard/savings */}
      {selectedTab === "savings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <Zap className="w-8 h-8 text-[#E3964C] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Savings Analysis</h3>
          <p className="text-[13px] text-gray-500 mb-4">Detailed savings breakdown with projections</p>
          <a href="/dashboard/savings" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D3443] text-white text-[13px] font-semibold hover:bg-[#2a4a5e] transition-colors">
            View Savings Dashboard <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      )}

      {/* Medical Schemes Tab */}
      {selectedTab === "schemes" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {loading && schemes.length === 0 ? <LoadingSkeleton rows={6} /> : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-[14px] font-semibold text-gray-900">Medical Scheme Performance — Netcare Primary Healthcare</h3>
                <p className="text-[12px] text-gray-500">Claims volume, rejection rates, and payment turnaround by scheme</p>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-600">Scheme</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Lives Covered</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Claims Volume</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Rejection Rate</th>
                    <th className="text-right p-3 font-semibold text-gray-600">Avg Payment (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.map((scheme, i) => (
                    <tr key={scheme.schemeName} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="p-3 font-medium text-gray-900">{scheme.schemeName}</td>
                      <td className="p-3 text-right">{scheme.livesCovered.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold">{formatRand(scheme.claimsVolume)}</td>
                      <td className={`p-3 text-right font-semibold ${scheme.rejectionRate > 6 ? "text-red-600" : scheme.rejectionRate > 4 ? "text-amber-600" : "text-green-600"}`}>
                        {scheme.rejectionRate}%
                      </td>
                      <td className={`p-3 text-right ${scheme.avgPaymentDays > 20 ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                        {scheme.avgPaymentDays === 0 ? "N/A" : `${scheme.avgPaymentDays} days`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Tech Stack Footer */}
      <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-[#3DA9D1]" />
          <span className="text-[12px] font-semibold text-gray-700">Planned Integrations</span>
          <span className="text-[10px] text-gray-400 ml-2">Requires Netcare API access</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            "CareOn EMR (Hospital Division)",
            "Healthbridge / GoodX (Clinic PMS)",
            "Altron SwitchOn (Claims Switch)",
            "MediSwitch EDI (eRA Processing)",
            "IBM Watson Micromedex (Drug Interactions)",
            "POPIA Compliance Engine",
            "ICD-10-ZA + NAPPI Validation",
          ].map(sys => (
            <span key={sys} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-gray-300" /> {sys}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
