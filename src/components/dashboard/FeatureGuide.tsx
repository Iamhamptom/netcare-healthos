"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Eye, EyeOff, Sparkles, Zap } from "lucide-react";
import { usePathname } from "next/navigation";

// ─── NDA / T&C Popup ──────
function NDAPopup({ onAccept }: { onAccept: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1D3443]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#1D3443]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Confidentiality Agreement</h2>
            <p className="text-[11px] text-gray-400">VisioHealth OS &times; Netcare Primary Healthcare</p>
          </div>
        </div>

        <div className="text-[12px] text-gray-600 leading-relaxed space-y-3 max-h-[40vh] overflow-y-auto pr-2">
          <p>
            This platform demonstration contains <span className="font-semibold">proprietary technology, trade secrets, and confidential business intelligence</span> developed
            by VisioHealth OS (Visio Research Labs, Touchline Agency (Pty) Ltd).
          </p>
          <p>By accessing this platform, you agree to:</p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>Keep all platform features, data, pricing, and technology confidential</li>
            <li>Not share screenshots, recordings, or descriptions with third parties</li>
            <li>Not reverse-engineer, copy, or replicate any features or algorithms</li>
            <li>Use the demo solely for evaluating a partnership between Netcare and VisioHealth OS</li>
          </ul>
          <p>
            All AI models, claims intelligence algorithms, patient routing systems, and financial analytics are the intellectual property
            of Visio Research Labs. The research data (120+ citations) is proprietary.
          </p>
          <p className="text-[11px] text-gray-400">
            Governed by the laws of the Republic of South Africa. High Court of Gauteng, Johannesburg.
          </p>
        </div>

        <button
          onClick={onAccept}
          className="w-full mt-5 py-3 bg-[#1D3443] text-white font-semibold text-[13px] rounded-xl hover:bg-[#152736] transition-colors"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          I Agree — Enter Platform
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-3">
          By clicking above, you accept the terms of this confidentiality agreement.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Page-Specific Feature Guides ──────
const PAGE_GUIDES: Record<string, { title: string; sections: { heading: string; text: string }[]; value: string }> = {
  "/dashboard": {
    title: "Welcome to Your Dashboard",
    sections: [
      { heading: "What You're Looking At", text: "This is your operational command center — a real-time view of patient flow, revenue, bookings, and daily tasks across the entire Netcare Primary Healthcare network." },
      { heading: "The Welcome Banner", text: "Uses your Netcare brand colours (#1D3443 dark teal, #3DA9D1 sky blue). Shows network-wide impact metrics: 30% tech cost reduction, 50% faster claims processing, 10x scale capacity, R33M+ addressable claims." },
      { heading: "Stat Cards", text: "Patient counts, today's bookings, waiting room status, daily revenue, task completion — all pulled from live data across your clinics." },
      { heading: "Quick Actions", text: "One-click access to daily tasks, check-in queue, patients, billing, conversations, bookings, and recall management." },
    ],
    value: "This single view replaces 5+ Excel spreadsheets that clinic managers currently maintain independently.",
  },
  "/dashboard/network": {
    title: "Network Financial Command Center",
    sections: [
      { heading: "Division Revenue (MTD)", text: "R55.2M against target — tracking your R662M annual Primary Care division revenue. EBITDA at 24.5% margin (up 1.5% YoY). Revenue breakdown by Gauteng North, South, East, Western Cape, KZN, and National." },
      { heading: "Claims Intelligence", text: "34,892 claims submitted via MediSwitch this month. 5,234 first-pass rejections (15% rate). The Claims Intelligence tab shows the top 5 rejection codes with AI-recommended fixes — each fix has a Rand value attached." },
      { heading: "Cost Savings Potential", text: "R8.4M/month addressable through 6 AI automation areas. The biggest: ICD-10-ZA + NAPPI pre-validation (R1.8M), eRA auto-reconciliation (R840K), and debtor aging intelligence (R3.2M recoverable)." },
      { heading: "Financial Alerts", text: "Three live alerts: Medicross Soweto's 10% rejection spike, Prime Cure capitation overspend (R1.1M over PMPM cap), and GEMS eRA reconciliation backlog (R890K, 21-day avg)." },
    ],
    value: "Replaces fragmented Excel reporting across 568 practitioners. Saves R840K/month in manual reconciliation. Every number here maps to a real Netcare financial line item.",
  },
  "/dashboard/suite": {
    title: "Your Custom-Built Suite",
    sections: [
      { heading: "10 AI Modules", text: "Claims Intelligence, WhatsApp Router, Financial Dashboard, Booking Engine, Patient Management, POPIA Compliance, Capitation Analytics, AI Triage, Pharmacy Intelligence, and eRA Auto-Reconciliation. Each with individual ROI." },
      { heading: "Value Chain Integration", text: "Shows exactly how we connect to CareOn (26+ hospitals), SAP (R100M ERP), Altron SwitchOn, MediSwitch, IBM Watson Micromedex, Corsano wearables, and the Netcare App." },
      { heading: "Branch Deployment", text: "Deploy to every Netcare branch — 49 hospitals, 55 clinics, 15 day theatres. Doctors use under the Netcare umbrella. All data routes back to this command center." },
      { heading: "Resell Opportunity", text: "568 independent practitioners, 200+ corporate clients, 20+ medical schemes — each is a potential licensing revenue stream for Netcare." },
    ],
    value: "R8.4M/month = R100M+/year in addressable savings. Plus recurring SaaS revenue from licensing to your ecosystem.",
  },
  "/dashboard/kpi": {
    title: "Financial Director KPI Dashboard",
    sections: [
      { heading: "Your KPI Framework", text: "30+ KPIs across 5 categories — Revenue, Profitability, Working Capital, Managed Care (Prime Cure), and Occupational Health. Each mapped to your actual divisional reporting requirements." },
      { heading: "Traffic Light System", text: "Green (on track), Amber (watch), Red (attention required). At a glance, see which metrics need your focus today." },
      { heading: "Where AI Moves the Needle", text: "For each underperforming KPI, VisioHealth OS shows the specific module that fixes it and the Rand impact. Claims rejection 15% to <5% = R21.6M/year. Debtor days 42 to 28 = R14M freed cash flow." },
      { heading: "Group CFO Alignment", text: "This dashboard maps directly to what Keith Gibson expects in your quarterly divisional pack: EBITDA margin, cash conversion, working capital discipline, digital transformation ROI." },
    ],
    value: "Every KPI here is one Keith Gibson will ask about. This dashboard generates your quarterly board pack automatically.",
  },
  "/dashboard/onboarding": {
    title: "Your Platform Tour",
    sections: [
      { heading: "8 Key Areas", text: "Follow the numbered steps to see the full platform. Each step links directly to the feature with a description and ROI." },
      { heading: "Coming Soon Modules", text: "6 expansion products being built: Placeo Health (patient marketplace), Visio Integrator (middleware), Waiting Room (digital check-in), VisioMed AI (clinical co-pilot), Payer Connect (scheme coordination), Pharmacy Intelligence." },
    ],
    value: "Each Coming Soon module is designed for the Netcare ecosystem specifically. Licensing creates additional revenue streams.",
  },
  "/dashboard/daily": {
    title: "Financial Director Daily Tasks",
    sections: [
      { heading: "Morning", text: "Review overnight claims rejections (AI auto-flagged), check divisional revenue vs R55M target, review Prime Cure capitation utilisation, flag high-value outstanding claims." },
      { heading: "During Day", text: "Process tariff reconciliations, review ICD-10 rejection analytics (top 10 codes), monitor occupational health billing accuracy, approve pharmacy purchase orders." },
      { heading: "End of Day", text: "Review daily collection ratios per region, generate EBITDA variance report for Group reporting, check POPIA consent compliance dashboard across all 88 clinics." },
    ],
    value: "Structured workflow designed for a Financial Director managing a R662M division. AI handles overnight analysis — you review and decide.",
  },
  "/dashboard/patients": {
    title: "Multi-Site Patient Management",
    sections: [
      { heading: "Cross-Network Records", text: "Patients from Discovery, GEMS, Bonitas, Momentum, Polmed, Anglo Medical, Prime Cure capitation, and NetcarePlus prepaid — all in one view with medical aid details." },
      { heading: "Clinical Data", text: "ICD-10 diagnoses, medications (Metformin, Jardiance, Amlodipine, Symbicort), allergies (severity tracked), vitals, and POPIA consent status." },
      { heading: "Multi-Site Visibility", text: "A patient at Medicross Sandton can be referenced at Medicross Fourways — no duplicate records, no lost history." },
    ],
    value: "Eliminates fragmented patient records across 568 practitioners using different PMS systems (Healthbridge, GoodX, Elixir).",
  },
  "/dashboard/conversations": {
    title: "WhatsApp Patient Router",
    sections: [
      { heading: "How It Works", text: "Patients message one WhatsApp number. AI identifies: service needed, location preference, availability. Routes to nearest Medicross branch. Books and confirms automatically." },
      { heading: "AI Suggestions", text: "AI drafts responses to patient queries. Your team reviews and approves before sending. Full conversation history tracked." },
    ],
    value: "24/7 patient access. 60% fewer phone calls. Fills the gap Netcare's current systems don't cover — no WhatsApp integration exists today.",
  },
  "/dashboard/intel": {
    title: "Netcare × Visio Intelligence Terminal",
    sections: [
      { heading: "Market Data", text: "SA Healthcare IT market ($2.76B → $5.71B by 2034), medical aid beneficiaries (9.7M), claims rejection rates, health inflation trends. Plus Netcare's 10-year digital strategy timeline." },
      { heading: "Health News", text: "Curated articles: Corsano wearable partnership, NHI constitutional challenge, Discovery Flexicare competition, FY2025 results, balance billing crisis." },
      { heading: "Research Papers", text: "VRL-001 (routing crisis, 120 citations), Digital Health Evidence Base, ICD-10 coding quality analysis, capitation actuarial research." },
      { heading: "Subscription Tier", text: "Daily intelligence, real-time CMS data, competitor pricing, NHI impact modelling — available with subscription." },
    ],
    value: "Bloomberg-level health industry intelligence. Daily briefings for Netcare leadership. Competitive edge over Discovery, Life, Mediclinic.",
  },
  "/dashboard/analytics": {
    title: "Practice Analytics",
    sections: [
      { heading: "What's Here", text: "Patient counts, booking trends, service popularity, review scores, recall management, and conversation volumes." },
    ],
    value: "Data-driven operational insights across the network.",
  },
  "/dashboard/billing": {
    title: "AI Claims & Billing",
    sections: [
      { heading: "Invoice Tracking", text: "Every invoice with ICD-10-ZA codes, NAPPI codes, medical aid claim reference, payment status (submitted/partial/rejected/paid), and patient portion." },
      { heading: "Claims Status", text: "See exactly which claims were rejected, why (ICD-10 mismatch, benefits exhausted, NAPPI error), and the AI recommendation to fix it." },
    ],
    value: "R1.8M/month recovered through AI pre-validation. Each rejected claim costs R50-R150 in rework — we eliminate 75% before submission.",
  },
};

// ─── Full Right-Side Panel ──────
function GuidePanel({ guide, onClose }: { guide: { title: string; sections: { heading: string; text: string }[]; value: string }; onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 bottom-0 z-[9998] w-[420px] bg-white border-l border-gray-200 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#1D3443] to-[#3DA9D1]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E3964C]" />
            <span className="text-[11px] text-white/60 uppercase tracking-widest font-semibold">Jess — Your Guide</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>{guide.title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {guide.sections.map((section, i) => (
          <motion.div
            key={section.heading}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <h3 className="text-[13px] font-semibold text-[#1D3443] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{section.heading}</h3>
            <p className="text-[12px] text-gray-600 leading-relaxed">{section.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Value Footer */}
      <div className="p-5 border-t border-gray-200 bg-[#E3964C]/5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[#E3964C]" />
          <span className="text-[11px] text-[#E3964C] font-semibold uppercase tracking-wide">Value for Netcare</span>
        </div>
        <p className="text-[13px] text-[#1D3443] font-medium leading-relaxed">{guide.value}</p>
      </div>

      {/* Powered by */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">
          Powered by <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> &middot; Visio Research Labs
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────
export default function FeatureGuide() {
  const pathname = usePathname();
  const [ndaAccepted, setNdaAccepted] = useState(true);
  const [guidesEnabled, setGuidesEnabled] = useState(true);
  const [currentGuide, setCurrentGuide] = useState<string | null>(null);
  const [dismissedPages, setDismissedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const accepted = localStorage.getItem("netcare-nda-accepted");
    const guidePref = localStorage.getItem("netcare-guides-enabled");
    setNdaAccepted(accepted === "true");
    if (guidePref === "false") setGuidesEnabled(false);
  }, []);

  useEffect(() => {
    if (!ndaAccepted || !guidesEnabled) return;
    if (dismissedPages.has(pathname)) return;
    if (PAGE_GUIDES[pathname]) {
      setCurrentGuide(pathname);
    } else {
      setCurrentGuide(null);
    }
  }, [pathname, ndaAccepted, guidesEnabled, dismissedPages]);

  const handleAcceptNDA = () => {
    setNdaAccepted(true);
    localStorage.setItem("netcare-nda-accepted", "true");
  };

  const handleDismissGuide = () => {
    setDismissedPages(prev => new Set([...prev, pathname]));
    setCurrentGuide(null);
  };

  const toggleGuides = () => {
    const next = !guidesEnabled;
    setGuidesEnabled(next);
    localStorage.setItem("netcare-guides-enabled", String(next));
    if (!next) setCurrentGuide(null);
  };

  return (
    <>
      {/* NDA Popup */}
      <AnimatePresence>
        {!ndaAccepted && <NDAPopup onAccept={handleAcceptNDA} />}
      </AnimatePresence>

      {/* Full Right-Side Guide Panel */}
      <AnimatePresence>
        {currentGuide && PAGE_GUIDES[currentGuide] && (
          <GuidePanel guide={PAGE_GUIDES[currentGuide]} onClose={handleDismissGuide} />
        )}
      </AnimatePresence>

      {/* Toggle button — positioned in header area, not bottom-left */}
      {ndaAccepted && (
        <button
          onClick={toggleGuides}
          className="fixed top-[18px] right-[220px] z-[9997] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D3443]/5 border border-[#1D3443]/10 text-[11px] font-semibold text-[#1D3443] hover:bg-[#1D3443]/10 transition-colors"
          title={guidesEnabled ? "Turn off Jess guide" : "Turn on Jess guide"}
        >
          {guidesEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {guidesEnabled ? "Jess: On" : "Jess: Off"}
        </button>
      )}
    </>
  );
}
