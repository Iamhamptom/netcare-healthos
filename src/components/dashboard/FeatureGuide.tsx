"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, ChevronRight, Eye, EyeOff } from "lucide-react";
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
            <li>Not share screenshots, recordings, or descriptions of the platform with third parties</li>
            <li>Not reverse-engineer, copy, or replicate any features or algorithms</li>
            <li>Use the demo solely for evaluating a potential partnership between Netcare Primary Healthcare and VisioHealth OS</li>
          </ul>
          <p>
            All AI models, claims intelligence algorithms, patient routing systems, and financial analytics dashboards are the intellectual property
            of Visio Research Labs. The research data (120+ citations) is proprietary.
          </p>
          <p className="text-[11px] text-gray-400">
            This agreement is governed by the laws of the Republic of South Africa. Disputes shall be resolved in the High Court of Gauteng.
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

// ─── Feature Guide Popups ──────
const PAGE_GUIDES: Record<string, { title: string; description: string; value: string }> = {
  "/dashboard": {
    title: "Welcome to Your Dashboard",
    description: "This is your operational command center. See real-time stats across patients, bookings, revenue, and daily tasks. The welcome banner uses your Netcare brand colours and shows network impact metrics.",
    value: "30% tech cost reduction, 50% faster claims processing, R33M+ addressable claims annually.",
  },
  "/dashboard/network": {
    title: "Network Financial Command Center",
    description: "Real-time divisional P&L across all 88 clinics. Five tabs: Overview (KPIs + alerts), Clinic Performance (revenue per site), Claims Intelligence (rejection analysis + AI recommendations), Cost Savings (R8.4M/month addressable), and Medical Scheme performance.",
    value: "Replaces fragmented Excel reporting across 568 practitioners. Saves R840K/month in manual reconciliation alone.",
  },
  "/dashboard/suite": {
    title: "Your Custom-Built Suite",
    description: "See all 10 AI modules built specifically for Netcare, how they integrate with your existing systems (CareOn, SAP, SwitchOn, MediSwitch), and the resell opportunity to your network.",
    value: "R8.4M/month total addressable savings. Each module can be deployed to branches under your umbrella license.",
  },
  "/dashboard/onboarding": {
    title: "Getting Started Guide",
    description: "A step-by-step tour of every area of the platform with links and ROI. Plus 6 Coming Soon modules being built for the Netcare ecosystem.",
    value: "Follow the numbered steps to see the full platform in 10 minutes.",
  },
  "/dashboard/daily": {
    title: "Financial Director Daily Tasks",
    description: "Your structured daily workflow — morning claims review, midday tariff reconciliation, end-of-day EBITDA reporting. Tailored for a Financial Director managing 88 clinics.",
    value: "Never miss a critical financial task. AI auto-completes overnight claims analysis.",
  },
  "/dashboard/patients": {
    title: "Multi-Site Patient Management",
    description: "Unified patient records across Medicross clinics. Discovery, GEMS, Bonitas, Momentum, Polmed patients — with medical aid details, ICD-10 diagnoses, medications, allergies, and POPIA consent.",
    value: "A patient seen at Medicross Sandton can be referenced at Medicross Fourways — eliminating duplicate records.",
  },
  "/dashboard/conversations": {
    title: "WhatsApp Patient Router",
    description: "See live patient conversations handled by the AI WhatsApp agent. Patients ask to book, find clinics, check services — AI responds instantly. Your team reviews and approves AI suggestions.",
    value: "24/7 patient access via WhatsApp. 60% fewer phone calls to clinics.",
  },
  "/dashboard/intel": {
    title: "Netcare × Visio Intelligence Terminal",
    description: "Bloomberg-style health industry data — market indicators, live news, research papers, and competitive intelligence. Daily industry digest for Netcare leadership.",
    value: "Stay ahead of Discovery's Flexicare, NHI changes, and health inflation trends. Deep intelligence available with subscription.",
  },
  "/dashboard/analytics": {
    title: "Practice Analytics",
    description: "Operational metrics — patient counts, booking patterns, service popularity, review scores, recall management, and conversation volumes across the network.",
    value: "Data-driven insights for operational decision-making.",
  },
  "/dashboard/billing": {
    title: "AI Claims & Billing",
    description: "View invoices with ICD-10-ZA codes, NAPPI codes, medical aid claim status, and payment tracking. See exactly which claims were rejected and why.",
    value: "R1.8M/month in claims recovered through AI pre-validation. ICD-10-ZA + NAPPI checks before submission.",
  },
};

function FeaturePopup({ guide, onClose }: { guide: { title: string; description: string; value: string }; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[9998] w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      <div className="p-1 bg-gradient-to-r from-[#1D3443] to-[#3DA9D1]" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[15px] font-bold text-gray-900 pr-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{guide.title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{guide.description}</p>
        <div className="p-3 rounded-lg bg-[#E3964C]/5 border border-[#E3964C]/15">
          <div className="text-[10px] text-[#E3964C] font-semibold uppercase mb-0.5">Value for Netcare</div>
          <div className="text-[12px] text-[#1D3443] font-medium">{guide.value}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────
export default function FeatureGuide() {
  const pathname = usePathname();
  const [ndaAccepted, setNdaAccepted] = useState(true); // Default true to not block
  const [guidesEnabled, setGuidesEnabled] = useState(true);
  const [currentGuide, setCurrentGuide] = useState<string | null>(null);
  const [dismissedPages, setDismissedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check localStorage for NDA acceptance and guide preferences
    const accepted = localStorage.getItem("netcare-nda-accepted");
    const guidePref = localStorage.getItem("netcare-guides-enabled");
    setNdaAccepted(accepted === "true");
    if (guidePref === "false") setGuidesEnabled(false);
  }, []);

  // Show guide when navigating to a new page
  useEffect(() => {
    if (!ndaAccepted || !guidesEnabled) return;
    if (dismissedPages.has(pathname)) return;
    if (PAGE_GUIDES[pathname]) {
      setCurrentGuide(pathname);
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

      {/* Feature Guide Popup */}
      <AnimatePresence>
        {currentGuide && PAGE_GUIDES[currentGuide] && (
          <FeaturePopup guide={PAGE_GUIDES[currentGuide]} onClose={handleDismissGuide} />
        )}
      </AnimatePresence>

      {/* Toggle button */}
      {ndaAccepted && (
        <button
          onClick={toggleGuides}
          className="fixed bottom-6 left-6 z-[9997] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-lg text-[11px] font-medium text-gray-500 hover:text-[#1D3443] transition-colors"
          title={guidesEnabled ? "Turn off feature guides" : "Turn on feature guides"}
        >
          {guidesEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {guidesEnabled ? "Hide Guides" : "Show Guides"}
        </button>
      )}
    </>
  );
}
