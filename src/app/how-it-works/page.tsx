"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const industries = [
  { slug: "dental", name: "Dental Practice", color: "#4ADE80", description: "Automate your front desk, manage patient recalls, and grow your practice with AI-powered booking." },
  { slug: "radiology", name: "Radiology Centre", color: "#2DD4BF", description: "Streamline referral intake, prep automation, and report delivery across multiple modalities." },
  { slug: "wellness", name: "Wellness & Spa", color: "#86EFAC", description: "Manage bookings, client preferences, treatment plans, and product sales in one platform." },
  { slug: "hospital", name: "Hospital & Clinic", color: "#22C55E", description: "Multi-department scheduling, ward management, and cross-facility patient tracking." },
  { slug: "gp", name: "General Practice", color: "#16A34A", description: "Patient management, chronic care follow-ups, medical aid claims, and POPIA compliance." },
  { slug: "salon", name: "Salon & Beauty", color: "#15803D", description: "Client booking, stylist scheduling, product tracking, and automated reminders." },
];

const steps = [
  { title: "Patient Reaches Out", description: "Via WhatsApp, phone, email, or your website. Our AI handles the first contact automatically." },
  { title: "AI Agent Takes Over", description: "Checks availability, answers FAQs, collects patient info, and creates a booking — all pending your approval." },
  { title: "You Approve & Confirm", description: "Review the booking in your dashboard. One tap to confirm. Patient gets a WhatsApp confirmation automatically." },
  { title: "Patient Arrives", description: "Check them in with one tap. Digital consent forms. Vitals captured. Doctor sees them in the queue." },
  { title: "Bill & Get Paid", description: "Generate invoices with ICD-10 codes. Submit to medical aid. Accept card, EFT, or cash. All tracked." },
  { title: "Grow & Retain", description: "AI sends follow-ups, recall reminders, and review requests. Analytics show what's working." },
];

const channels = [
  { name: "WhatsApp", description: "AI booking agent chats with patients 24/7" },
  { name: "Emergency Line", description: "After-hours IVR with on-call routing" },
  { name: "Email", description: "Automated confirmations, reminders, invoices" },
  { name: "Website Chat", description: "Embedded chatbot for your website" },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <div className="pt-24 bg-[#030F07]">
        {/* Hero */}
        <section className="px-6 md:px-12 lg:px-24 py-20 max-w-7xl mx-auto relative">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#4ADE80] rounded-full blur-[300px] opacity-[0.04] pointer-events-none" />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto relative">
            <span className="text-[13px] text-[#4ADE80] mb-4 block font-mono tracking-wider uppercase">How It Works</span>
            <h1 className="text-5xl md:text-7xl tracking-[-0.03em] text-white font-bold mb-6">
              From <span className="text-gradient-green text-glow">message</span> to{" "}
              <span className="text-gradient-green text-glow">payment</span>
            </h1>
            <p className="text-white/40 text-[15px] leading-relaxed">
              Netcare Health OS Ops automates every step of your practice — from the first WhatsApp message to the final payment.
              Here&apos;s exactly how it works, from start to finish.
            </p>
          </motion.div>
        </section>

        {/* 6-Step Flow */}
        <section className="px-6 md:px-12 lg:px-24 pb-20 max-w-6xl mx-auto">
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-6 bg-[#071A0E] border border-[#4ADE80]/[0.06] rounded-2xl p-6 md:p-8 hover:border-[#4ADE80]/15 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-mono font-bold text-[#4ADE80]">0{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-mono text-[#4ADE80]/50 uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-white/30 text-[14px] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Communication Channels */}
        <section className="px-6 md:px-12 lg:px-24 py-20 bg-[#FAFAF8]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-[#1A1A1A] font-bold text-center mb-12">
              Every <span className="text-gradient-green">channel</span> connected
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {channels.map((ch, i) => (
                <motion.div
                  key={ch.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glow-card p-6 text-center bg-white rounded-2xl border border-[#F0F0EC]"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1">{ch.name}</h3>
                  <p className="text-[12px] text-[#9B9B9B]">{ch.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="px-6 md:px-12 lg:px-24 py-20 bg-[#030F07]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-6 h-6 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl text-white font-bold mb-4">POPIA Compliant</h2>
            <p className="text-white/30 text-[14px] mb-8">Health data is classified as &quot;Special Personal Information&quot; — we treat it with the highest standard of care.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Audit Logging", "Role-Based Access", "Consent Tracking", "Data Encryption"].map(item => (
                <div key={item} className="flex items-center gap-2 justify-center bg-[#071A0E] border border-[#4ADE80]/[0.06] rounded-xl py-3 px-4">
                  <svg className="w-4 h-4 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[12px] text-white/50">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Pages */}
        <section className="px-6 md:px-12 lg:px-24 py-20 bg-[#FAFAF8]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[13px] text-[#4ADE80] mb-4 block font-mono tracking-wider uppercase">Built For You</span>
              <h2 className="text-3xl md:text-4xl text-[#1A1A1A] font-bold">
                Your industry, <span className="text-gradient-green">your way</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((ind, i) => (
                <motion.div
                  key={ind.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={`/how-it-works/${ind.slug}`}
                    className="group block glow-card bg-white rounded-2xl border border-[#F0F0EC] hover:border-[#4ADE80]/20 p-6 transition-all duration-300 h-full"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${ind.color}15` }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ind.color }} />
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#16A34A] transition-colors">{ind.name}</h3>
                    <p className="text-[13px] text-[#9B9B9B] leading-relaxed mb-4">{ind.description}</p>
                    <span className="text-[13px] text-[#4ADE80] font-medium flex items-center gap-1 group-hover:gap-2 transition-all font-mono">
                      See how it works
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-12 lg:px-24 py-20 bg-[#030F07]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-white font-bold mb-6">
              Ready to <span className="text-gradient-green text-glow">automate</span>?
            </h2>
            <p className="text-white/30 text-[14px] mb-8">14-day free trial. No credit card required. Set up in 10 minutes.</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#4ADE80] text-[#030F07] font-semibold text-[15px] rounded-full hover:bg-[#86EFAC] transition-all duration-300 shadow-[0_0_30px_rgba(52,211,153,0.3)]"
            >
              Start Free Trial
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
