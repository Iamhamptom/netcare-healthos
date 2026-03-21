"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const products = [
  {
    name: "Placeo Health",
    tagline: "Find. Compare. Book.",
    description:
      "A location-based healthcare marketplace where patients discover practices near them, compare ratings and services, and book instantly. Think Google Maps meets Zocdoc — built for Africa.",
    forInvestors:
      "Captures the demand side. Every practice on Netcare Health OS becomes a listing. Patients search by location, specialty, availability, and medical aid acceptance. Revenue: booking fees + featured listings + patient acquisition leads sold to practices.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    color: "#10b981",
    status: "Concept",
    metrics: ["Patient marketplace", "Location search", "Instant booking", "Practice discovery"],
  },
  {
    name: "Visio Health Integrator",
    tagline: "Connect anything. Break nothing.",
    description:
      "Enterprise middleware that bridges Netcare Health OS to any existing healthcare system — GoodX, Healthbridge, hospital HL7/FHIR, lab systems, radiology PACS, and pharmacy dispensing. The universal healthcare API for Africa.",
    forInvestors:
      "This is the moat. Once a hospital connects through the Integrator, switching costs become massive. Revenue: per-connection licensing + data throughput fees + enterprise SaaS contracts. Think MuleSoft for African healthcare.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.915-3.173a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
      </svg>
    ),
    color: "#8b5cf6",
    status: "Concept",
    metrics: ["HL7/FHIR bridge", "GoodX connector", "Lab integration", "Universal API"],
  },
  {
    name: "Visio Waiting Room",
    tagline: "The waiting room, reimagined.",
    description:
      "A digital-first waiting room experience. Patients check in from their car via WhatsApp, see their live queue position, complete intake forms on their phone, and get called in when the doctor is ready. Zero crowding. Zero paper.",
    forInvestors:
      "Post-COVID, patients hate physical waiting rooms. This product is a wedge into every practice — even those not ready for full Netcare Health OS. Standalone pricing at R2,500/month makes it an easy first sale that upsells to the full platform. Viral loop: patients experience it and ask their OTHER doctors why they don't have it.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "#06b6d4",
    status: "Concept",
    metrics: ["WhatsApp check-in", "Live queue position", "Digital intake forms", "Zero crowding"],
  },
  {
    name: "VisioMed AI",
    tagline: "The doctor's AI co-pilot.",
    description:
      "Clinical decision support powered by AI. Auto-suggests ICD-10 codes from consultation notes, checks drug interactions in real-time, flags diagnostic patterns, and generates referral letters. Trained on South African clinical guidelines.",
    forInvestors:
      "This is where the real value is. Clinical AI commands premium pricing — R5,000-R15,000/month addon. Reduces medical errors, speeds up consultations by 30%, and improves claim accuracy (which directly impacts practice revenue). Data flywheel: every consultation makes the AI smarter.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: "#f59e0b",
    status: "Concept",
    metrics: ["Auto ICD-10 coding", "Drug interaction checks", "Clinical decision support", "SA guidelines"],
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function NextLevel() {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden bg-[#1D3443]">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#3DA9D1]/[0.03] rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[11px] font-mono tracking-[0.4em] text-[#3DA9D1]/60 uppercase mb-4">
            Next-Level
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.03em] text-white mb-6">
            The ecosystem is expanding
          </h2>
          <p className="text-base md:text-lg text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
            Four new products are joining the Netcare Health OS platform — each one
            designed to capture a different layer of the healthcare value chain.
          </p>
        </motion.div>

        {/* Product cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.name}
              variants={fadeUp}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500"
            >
              {/* Status badge */}
              <span className="absolute top-6 right-6 text-[10px] font-mono tracking-[0.2em] uppercase text-white/70 px-3 py-1 rounded-full border border-white/[0.06]">
                {product.status}
              </span>

              {/* Icon + Name */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${product.color}15`, color: product.color }}
                >
                  {product.icon}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">{product.name}</h3>
                  <p className="text-[13px] font-mono text-white/70">{product.tagline}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[14px] text-white/50 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Metrics pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.metrics.map((m) => (
                  <span
                    key={m}
                    className="text-[11px] font-mono text-white/70 px-3 py-1 rounded-full border border-white/[0.06]"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Investor angle */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-3.5 h-3.5 text-[#3DA9D1]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#3DA9D1]/50">
                    Investor Angle
                  </span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed">
                  {product.forInvestors}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-20"
        >
          <p className="text-sm text-white/70 font-mono mb-6">
            These products will launch throughout 2026–2027 as part of the Netcare Health OS ecosystem.
          </p>
          <Link
            href="/ecosystem"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 text-white/50 text-sm font-mono hover:border-white/20 hover:text-white/70 transition-all duration-300"
          >
            Explore the Ecosystem
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
