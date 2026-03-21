"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, Building2, DollarSign,
  Users, Zap, AlertTriangle, ArrowRight, Download,
} from "lucide-react";

// ── Netcare Primary Care constants (from FY2025 audited results) ──
const NETCARE_DEFAULTS = {
  clinics: 88,
  practitioners: 568,
  avgEncountersPerDay: 18,        // per practitioner
  avgClaimValue: 850,             // ZAR per encounter
  currentRejectionRate: 0.15,     // 15% industry average
  targetRejectionRate: 0.05,      // 5% with bridge
  reworkCostPerRejection: 95,     // ZAR (staff time + resubmission)
  adminMinPerEncounter: 15,       // minutes wasted on double-entry
  adminCostPerHour: 180,          // ZAR (billing clerk hourly rate)
  workingDaysPerYear: 250,
  drgUpliftPercent: 0.12,         // 12% average DRG uplift from better coding
  avgInpatientValue: 45000,       // ZAR
  inpatientEncountersPerClinic: 5, // referrals per day across network
  cdlEnrollmentValue: 8400,       // ZAR per patient per year
  cdlDetectionRate: 0.08,         // 8% of encounters detect undiagnosed chronic
};

export default function ROICalculatorPage() {
  const [clinics, setClinics] = useState(NETCARE_DEFAULTS.clinics);
  const [practitioners, setPractitioners] = useState(NETCARE_DEFAULTS.practitioners);
  const [encountersPerDay, setEncountersPerDay] = useState(NETCARE_DEFAULTS.avgEncountersPerDay);
  const [avgClaimValue, setAvgClaimValue] = useState(NETCARE_DEFAULTS.avgClaimValue);
  const [currentRejection, setCurrentRejection] = useState(NETCARE_DEFAULTS.currentRejectionRate * 100);
  const [targetRejection, setTargetRejection] = useState(NETCARE_DEFAULTS.targetRejectionRate * 100);

  const roi = useMemo(() => {
    const d = NETCARE_DEFAULTS;
    const totalEncountersYear = practitioners * encountersPerDay * d.workingDaysPerYear;

    // 1. Rejection reduction savings
    const currentRejections = totalEncountersYear * (currentRejection / 100);
    const targetRejections = totalEncountersYear * (targetRejection / 100);
    const rejectionsSaved = currentRejections - targetRejections;
    const revenueRecovered = rejectionsSaved * avgClaimValue;
    const reworkSaved = rejectionsSaved * d.reworkCostPerRejection;

    // 2. Admin time savings
    const minutesSavedPerYear = totalEncountersYear * d.adminMinPerEncounter;
    const hoursSavedPerYear = minutesSavedPerYear / 60;
    const adminCostSaved = hoursSavedPerYear * d.adminCostPerHour;
    const fteSaved = hoursSavedPerYear / (d.workingDaysPerYear * 8); // 8hr workday

    // 3. AI coding uplift (better DRG grouping from additional codes)
    const inpatientEncountersYear = clinics * d.inpatientEncountersPerClinic * d.workingDaysPerYear;
    const codingUplift = inpatientEncountersYear * d.avgInpatientValue * d.drgUpliftPercent;

    // 4. Chronic disease detection revenue
    const newCDLPatients = totalEncountersYear * d.cdlDetectionRate;
    const cdlRevenue = newCDLPatients * d.cdlEnrollmentValue;

    // Totals
    const totalAnnualBenefit = revenueRecovered + reworkSaved + adminCostSaved + codingUplift + cdlRevenue;
    const estimatedCost = clinics * 4500 * 12; // R4,500/clinic/month (enterprise)
    const netBenefit = totalAnnualBenefit - estimatedCost;
    const roiPercent = estimatedCost > 0 ? (netBenefit / estimatedCost) * 100 : 0;
    const paybackMonths = estimatedCost > 0 ? Math.ceil(estimatedCost / (totalAnnualBenefit / 12)) : 0;

    return {
      totalEncountersYear,
      revenueRecovered,
      reworkSaved,
      adminCostSaved,
      fteSaved: Math.round(fteSaved),
      codingUplift,
      newCDLPatients: Math.round(newCDLPatients),
      cdlRevenue,
      totalAnnualBenefit,
      estimatedCost,
      netBenefit,
      roiPercent,
      paybackMonths,
    };
  }, [clinics, practitioners, encountersPerDay, avgClaimValue, currentRejection, targetRejection]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-[#E3964C]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Business Case</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">CareOn Bridge — ROI Calculator</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Pre-populated with Netcare Primary Care FY2025 actuals. Adjust the inputs to model your pilot scope.
            </p>
          </div>
          <a
            href="/api/bridge/careon/export-pdf"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D3443] text-white text-[12px] font-medium hover:bg-[#1D3443]/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Inputs Panel ── */}
        <div className="col-span-1 space-y-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
            <h3 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1D3443]" />
              Scale Inputs
            </h3>

            <InputSlider label="Clinics in Scope" value={clinics} min={1} max={88} step={1} onChange={setClinics} unit="" />
            <InputSlider label="Practitioners" value={practitioners} min={1} max={568} step={1} onChange={setPractitioners} unit="" />
            <InputSlider label="Encounters/Day/Practitioner" value={encountersPerDay} min={5} max={40} step={1} onChange={setEncountersPerDay} unit="" />
            <InputSlider label="Avg Claim Value" value={avgClaimValue} min={200} max={5000} step={50} onChange={setAvgClaimValue} unit="R" />
            <InputSlider label="Current Rejection Rate" value={currentRejection} min={5} max={30} step={0.5} onChange={setCurrentRejection} unit="%" />
            <InputSlider label="Target Rejection Rate" value={targetRejection} min={1} max={15} step={0.5} onChange={setTargetRejection} unit="%" />
          </div>

          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Source</div>
            <div className="text-[11px] text-gray-600">
              Defaults from Netcare FY2025 Audited Results Booklet.
              R662M Primary Care Revenue, 88 clinics, 568 practitioners.
            </div>
          </div>
        </div>

        {/* ── Results Panel ── */}
        <div className="col-span-2 space-y-4">
          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-3">
            <HeroCard
              label="Total Annual Benefit"
              value={`R${(roi.totalAnnualBenefit / 1_000_000).toFixed(1)}M`}
              color="#10B981"
              icon={TrendingUp}
            />
            <HeroCard
              label="Net ROI"
              value={`${Math.round(roi.roiPercent)}%`}
              color="#3DA9D1"
              icon={DollarSign}
            />
            <HeroCard
              label="Payback Period"
              value={`${roi.paybackMonths} months`}
              color="#E3964C"
              icon={Zap}
            />
          </div>

          {/* Breakdown */}
          <div className="p-4 rounded-xl border border-gray-200 bg-white">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Annual Benefit Breakdown</h3>
            <div className="space-y-3">
              <BenefitRow
                label="Revenue Recovered (Rejection Reduction)"
                value={roi.revenueRecovered}
                description={`${currentRejection}% → ${targetRejection}% rejection rate = ${Math.round(roi.revenueRecovered / avgClaimValue).toLocaleString()} fewer rejected claims`}
                color="#10B981"
                percent={(roi.revenueRecovered / roi.totalAnnualBenefit) * 100}
              />
              <BenefitRow
                label="Rework Cost Savings"
                value={roi.reworkSaved}
                description={`R95/rejection staff cost eliminated`}
                color="#3DA9D1"
                percent={(roi.reworkSaved / roi.totalAnnualBenefit) * 100}
              />
              <BenefitRow
                label="Admin Time Savings"
                value={roi.adminCostSaved}
                description={`15 min/encounter double-entry eliminated = ${roi.fteSaved} FTE equivalent`}
                color="#1D3443"
                percent={(roi.adminCostSaved / roi.totalAnnualBenefit) * 100}
              />
              <BenefitRow
                label="AI Coding Uplift (DRG)"
                value={roi.codingUplift}
                description={`12% average inpatient DRG improvement from AI-suggested additional codes`}
                color="#E3964C"
                percent={(roi.codingUplift / roi.totalAnnualBenefit) * 100}
              />
              <BenefitRow
                label="Chronic Disease Detection"
                value={roi.cdlRevenue}
                description={`${roi.newCDLPatients.toLocaleString()} new CDL patients detected at R8,400/yr chronic management revenue`}
                color="#8B5CF6"
                percent={(roi.cdlRevenue / roi.totalAnnualBenefit) * 100}
              />
            </div>
          </div>

          {/* Cost vs Benefit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
              <div className="text-[10px] text-green-600 font-semibold uppercase tracking-wider mb-1">Annual Benefit</div>
              <div className="text-2xl font-bold text-green-700 font-metric">R{(roi.totalAnnualBenefit / 1_000_000).toFixed(2)}M</div>
              <div className="text-[11px] text-green-600 mt-1">{roi.totalEncountersYear.toLocaleString()} encounters/year analyzed</div>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Estimated Platform Cost</div>
              <div className="text-2xl font-bold text-gray-700 font-metric">R{(roi.estimatedCost / 1_000_000).toFixed(2)}M</div>
              <div className="text-[11px] text-gray-500 mt-1">{clinics} clinics x R4,500/month (enterprise)</div>
            </div>
          </div>

          {/* Pilot Recommendation */}
          <div className="p-4 rounded-xl bg-[#1D3443]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#E3964C]" />
              <span className="text-[12px] font-semibold text-white">Recommended Pilot</span>
            </div>
            <p className="text-[12px] text-white/70 leading-relaxed">
              Start with <strong className="text-white">5 Medicross clinics in Gauteng</strong> (Sandton, Fourways, Rosebank, Pretoria East, Centurion).
              32 practitioners, ~{(32 * encountersPerDay * 20).toLocaleString()} encounters/month.
              Expected pilot ROI: R{((roi.totalAnnualBenefit / clinics * 5) / 1_000_000 / 12).toFixed(1)}M/month.
              6-week implementation. Full rollout decision at 90 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Components ──

function InputSlider({ label, value, min, max, step, onChange, unit }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-600">{label}</span>
        <span className="text-[12px] font-semibold text-[#1D3443] font-metric">
          {unit === "R" ? `R${value.toLocaleString()}` : unit === "%" ? `${value}%` : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#3DA9D1]"
      />
    </div>
  );
}

function HeroCard({ label, value, color, icon: Icon }: {
  label: string; value: string; color: string; icon: typeof TrendingUp;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-gray-200 bg-white"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold font-metric" style={{ color }}>{value}</div>
    </motion.div>
  );
}

function BenefitRow({ label, value, description, color, percent }: {
  label: string; value: number; description: string; color: string; percent: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-gray-900">{label}</span>
          <span className="text-[13px] font-bold font-metric" style={{ color }}>
            R{(value / 1_000_000).toFixed(2)}M
          </span>
        </div>
        <div className="text-[10px] text-gray-500">{description}</div>
        <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percent, 100)}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <span className="text-[10px] text-gray-400 font-semibold w-10 text-right">{Math.round(percent)}%</span>
    </div>
  );
}
