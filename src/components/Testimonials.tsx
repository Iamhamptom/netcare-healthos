"use client";

import { motion } from "framer-motion";

const impactCards = [
  {
    stat: "R95M+",
    label: "Annual savings addressable",
    detail: "Across claims recovery, debtor management, eRA reconciliation, capitation analytics, compliance, and pharmacy optimisation.",
    color: "#E3964C",
  },
  {
    stat: "15% → <5%",
    label: "Claims rejection rate",
    detail: "AI pre-validates ICD-10-ZA codes, NAPPI codes, and PMB benefits before claims hit Altron SwitchOn. 75% of rejections prevented.",
    color: "#3DA9D1",
  },
  {
    stat: "42 → 28",
    label: "Debtor days reduction",
    detail: "Automated follow-up sequences and scheme-specific collection strategies. GEMS 21-day, Medihelp 24-day payment cycles targeted.",
    color: "#10B981",
  },
  {
    stat: "88",
    label: "Clinics unified",
    detail: "One command center for all Medicross clinics, day theatres, and pharmacies. Regional data isolation with group-level consolidation.",
    color: "#1D3443",
  },
  {
    stat: "3.5M",
    label: "Patients served annually",
    detail: "WhatsApp patient routing connects patients to the nearest Medicross — GP, dental, optometry, pharmacy — 24/7.",
    color: "#8B5CF6",
  },
  {
    stat: "8 weeks",
    label: "Pilot to prove ROI",
    detail: "Start with one region, measure results, generate board-ready report. Zero capital risk. 3.2X average ROI within 14 months globally.",
    color: "#E3964C",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full bg-white py-32 md:py-40 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-[0.3em] text-xs text-[#3DA9D1] font-semibold mb-6 block">
            Impact at Scale
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900">
            The numbers that matter.
          </h2>
          <p className="text-[15px] text-gray-400 mt-4 max-w-xl mx-auto">
            Every metric below is backed by our research and modelled on Netcare Primary Healthcare&apos;s actual divisional data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {impactCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
            >
              <div className="text-3xl font-bold mb-2" style={{ color: card.color, fontFamily: 'Montserrat, sans-serif' }}>
                {card.stat}
              </div>
              <div className="text-[14px] font-semibold text-gray-900 mb-2">{card.label}</div>
              <p className="text-[12px] text-gray-500 leading-relaxed">{card.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-[12px] text-gray-300">
            Powered by <span className="text-[#1D3443] font-semibold">VisioHealth OS</span> &middot;
            Visio Research Labs &middot; 120+ peer-reviewed citations &middot;
            African-native, built in Johannesburg
          </p>
        </motion.div>
      </div>
    </section>
  );
}
