"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "R2,999.99",
    setup: "R5,000",
    period: "/month",
    description: "Start for R2,999.99 — upgrade as you grow.",
    badge: "PROMO",
    features: ["Patient management (up to 200 patients)", "Basic booking engine", "WhatsApp/SMS reminders (100/mo)", "Email notifications", "Basic analytics", "R500 AI credits included/mo", "20 qualified leads at onboarding", "3-month minimum contract"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Core",
    price: "R15,000",
    setup: "R15,000",
    period: "/month",
    description: "Everything you need to run a modern practice.",
    features: ["Everything in Starter, unlimited patients", "ICD-10 billing & invoicing", "POPIA compliance & audit logs", "Daily workflow automation", "Basic white-labeled website", "R1,000 AI credits included/mo", "50 qualified leads at onboarding", "12-month minimum contract"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "R35,000",
    setup: "R25,000",
    period: "/month",
    description: "Full AI suite for growing practices.",
    features: ["Everything in Core", "5 AI Agents (triage, intake, follow-up, billing, scheduler)", "Advanced analytics & reporting", "Medical aid claim management", "Full white-labeled website (SEO + booking + referral + AI symptom checker)", "GP referral portal & Google Business optimization", "R3,000 AI credits included/mo", "100 qualified leads at onboarding", "Staff AI training (5 courses)", "Priority support", "12-month minimum contract"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "R55,000",
    setup: "R40,000",
    period: "/month",
    description: "Full suite for multi-location practices.",
    features: ["Everything in Professional", "Multi-location support", "Custom integrations & API access", "Dedicated account manager", "Advanced recall & campaigns", "R8,000 AI credits included/mo", "200 qualified leads at onboarding", "Staff AI training included", "24-month minimum contract"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const opacityTitle = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section id="pricing" ref={containerRef} className="relative w-full bg-white py-32 md:py-40 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div style={{ opacity: opacityTitle }} className="mb-20 md:mb-24 text-center">
          <span className="text-xs text-[#1D8AB5] font-mono uppercase tracking-[0.3em] mb-6 block">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mb-5">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-sm font-light max-w-md mx-auto">
            3-24 month contracts. Start from R2,999.99/mo — AI credits included with every plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative bg-white rounded-2xl p-8 transition-all duration-400 hover:shadow-lg hover:shadow-[#3DA9D1]/[0.04] ${
                plan.popular
                  ? "border border-[#BAE6FD] shadow-lg shadow-[#3DA9D1]/5 animate-[pulseGlow_3s_ease-in-out_infinite]"
                  : "border border-gray-100 shadow-sm"
              }`}
              style={plan.popular ? {
                animation: "pulseGlow 3s ease-in-out infinite",
              } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-8">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-[#1D3443] bg-[#F0F9FF] rounded-full">
                    Recommended
                  </span>
                </div>
              )}
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3 left-8">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-amber-700 bg-amber-50 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-mono text-gray-500 mb-1 tracking-wide">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-6 font-light">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extralight text-gray-900 tracking-tight">{plan.price}</span>
                  <span className="text-sm text-gray-400 font-mono">{plan.period}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-mono">Setup from {plan.setup}</p>
              </div>

              <div className="space-y-3 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <div className="flex items-center gap-1.5 mt-1 shrink-0">
                      <svg className="w-4 h-4 text-[#3DA9D1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="#get-in-touch"
                className={`block text-center py-3 text-sm font-mono rounded-full transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#1D8AB5] text-white hover:bg-[#1D3443] hover:shadow-lg hover:shadow-[#3DA9D1]/10"
                    : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Radiology add-on */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-sm font-mono text-gray-900 mb-1">Radiology Ops Add-on</h3>
            <p className="text-sm text-gray-500 font-light">
              Referral intake, prep automation, report delivery — from R10,000/month
            </p>
          </div>
          <Link
            href="#get-in-touch"
            className="shrink-0 group px-8 py-3 text-sm font-mono text-gray-700 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300 inline-flex items-center gap-2"
          >
            Learn More
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
