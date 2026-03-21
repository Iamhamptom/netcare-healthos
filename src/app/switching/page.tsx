"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

/* ═══════════════════════════════════════════════════════════════════════
   FADE-IN ANIMATION WRAPPER
   ═══════════════════════════════════════════════════════════════════════ */
function FadeIn({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const howItWorks = [
  {
    step: "01",
    title: "Validate",
    description: "AI catches rejections before submission — ICD-10 cross-matching, modifier validation, PMB/CDL detection, and clinical-financial alignment checks.",
    saving: "Saves R50K–R200K/year per practice",
    color: "from-emerald-500 to-teal-500",
  },
  {
    step: "02",
    title: "Route",
    description: "Automatically selects the correct switch for each medical aid scheme. 30+ schemes mapped to administrators, routed to the optimal clearing house.",
    saving: "30+ schemes auto-routed",
    color: "from-teal-500 to-cyan-500",
  },
  {
    step: "03",
    title: "Submit",
    description: "Real-time or batch submission. EDIFACT MEDCLM or XML format. Retry logic with exponential backoff ensures every claim reaches its destination.",
    saving: "3 retries, exponential backoff",
    color: "from-cyan-500 to-blue-500",
  },
  {
    step: "04",
    title: "Reconcile",
    description: "eRA parsing, 3-tier auto-matching (exact → fuzzy → manual), variance analysis, and automatic dispute generation for underpayments.",
    saving: "45→21 day payment cycle",
    color: "from-blue-500 to-indigo-500",
  },
];

const architectureModules = [
  { name: "EDIFACT MEDCLM Engine", detail: "Parser + Generator", icon: "⚡" },
  { name: "Multi-Switch Router", detail: "Scheme → Admin → Switch mapping", icon: "🔀" },
  { name: "Switch Clients", detail: "Healthbridge · MediKredit · SwitchOn", icon: "🔌" },
  { name: "Pre-Auth Engine", detail: "7 rule categories, PMB/CDL detection", icon: "🛡️" },
  { name: "Batch Processor", detail: "5 concurrent, 3 retries, exp. backoff", icon: "📦" },
  { name: "eRA Reconciliation", detail: "3-tier matching, variance analysis", icon: "🧮" },
  { name: "Resubmission Workflow", detail: "15 rejection codes, auto-fix", icon: "🔄" },
  { name: "PMS Accreditation", detail: "12 tests, 5 categories", icon: "✅" },
];

const impactStats = [
  { value: "R50K–R200K", label: "Annual savings per practice", sublabel: "From pre-submission validation" },
  { value: "45→21", label: "Days — payment cycle reduction", sublabel: "Average across all schemes" },
  { value: "8–15%→2–4%", label: "Rejection rate reduction", sublabel: "AI-powered pre-validation" },
  { value: "30+", label: "Medical aid schemes routed", sublabel: "Full SA market coverage" },
  { value: "99.99%", label: "Target uptime SLA", sublabel: "Enterprise-grade reliability" },
  { value: "3,662", label: "Lines of engine code", sublabel: "Purpose-built from scratch" },
];

const schemes = [
  { scheme: "Discovery Health", administrator: "Discovery Health (Pty) Ltd", switch: "Healthbridge" },
  { scheme: "Bonitas", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Medihelp", administrator: "Medihelp", switch: "Healthbridge" },
  { scheme: "Momentum Health", administrator: "Momentum Health Solutions", switch: "MediKredit" },
  { scheme: "GEMS", administrator: "GEMS (Gov)", switch: "Healthbridge" },
  { scheme: "Bestmed", administrator: "Bestmed", switch: "Healthbridge" },
  { scheme: "Fedhealth", administrator: "Fedhealth (Discovery)", switch: "Healthbridge" },
  { scheme: "Medshield", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Sizwe Hosmed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "CompCare", administrator: "Universal Healthcare", switch: "MediKredit" },
  { scheme: "Profmed", administrator: "PPS Healthcare Admin", switch: "Healthbridge" },
  { scheme: "KeyHealth", administrator: "Key Health", switch: "Healthbridge" },
  { scheme: "LA Health", administrator: "Discovery Health", switch: "Healthbridge" },
  { scheme: "Bankmed", administrator: "Bankmed", switch: "Healthbridge" },
  { scheme: "Polmed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Sasolmed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Remedi", administrator: "Remedi", switch: "SwitchOn" },
  { scheme: "Hosmed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Umvuzo Health", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Transmed", administrator: "Discovery Health", switch: "Healthbridge" },
  { scheme: "Mbmed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Samwumed", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "AECI Medical Aid", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Netcare Medical", administrator: "Discovery Health", switch: "Healthbridge" },
  { scheme: "Selfmed", administrator: "Selfmed", switch: "SwitchOn" },
  { scheme: "Resolution Health", administrator: "Resolution Health", switch: "SwitchOn" },
  { scheme: "Spectramed", administrator: "Spectramed", switch: "SwitchOn" },
  { scheme: "Platinum Health", administrator: "Platinum Health", switch: "SwitchOn" },
  { scheme: "Tiger Brands", administrator: "Medscheme", switch: "MediKredit" },
  { scheme: "Makoti Medical", administrator: "Universal Healthcare", switch: "MediKredit" },
  { scheme: "Libcare", administrator: "Universal Healthcare", switch: "MediKredit" },
];

const accreditationTests = [
  { category: "Claim Submission", tests: "Format validation, field mapping, modifier handling" },
  { category: "Eligibility Checks", tests: "Real-time member lookup, benefit verification" },
  { category: "Pre-Authorisation", tests: "Request submission, status polling, approval handling" },
  { category: "eRA Processing", tests: "Payment file parsing, auto-matching, variance detection" },
  { category: "Error Handling", tests: "Rejection codes, retry logic, fallback behaviour" },
];

const onboardingSteps = [
  { step: "1", title: "Register", detail: "Submit vendor details and PMS specifications" },
  { step: "2", title: "Sandbox Access", detail: "Receive test credentials and EDIFACT samples" },
  { step: "3", title: "Integration Build", detail: "Implement against switching engine API" },
  { step: "4", title: "Accreditation Tests", detail: "Pass 12 automated tests across 5 categories" },
  { step: "5", title: "UAT Sign-Off", detail: "End-to-end testing with live scheme data" },
  { step: "6", title: "Production Launch", detail: "Go live with monitoring and support" },
];

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function SwitchingEnginePage() {
  return (
    <div className="min-h-screen bg-[#0A1A24] text-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-medium tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Built by VisioCorp
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extralight tracking-tight mb-6"
          >
            Medical Aid{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent font-light">
              Switching Engine
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            SA&apos;s first AI-powered multi-switch claims platform —{" "}
            <span className="text-teal-400 font-mono text-base">EDIFACT MEDCLM v0:912:ZA</span> compliant
          </motion.p>

          {/* Animated Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 text-sm">
                {[
                  { label: "Practice", sub: "PMS System", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                  { label: "Validation", sub: "AI Pre-Check", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
                  { label: "Router", sub: "Scheme Mapping", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
                  { label: "Switch", sub: "HB · MK · SO", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                  { label: "Medical Aid", sub: "Adjudication", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
                  { label: "eRA Payment", sub: "Reconciliation", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                ].map((node, i) => (
                  <div key={node.label} className="flex items-center gap-2 md:gap-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
                      className={`px-4 py-3 rounded-xl border ${node.color} text-center min-w-[100px]`}
                    >
                      <div className="font-medium text-[13px]">{node.label}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{node.sub}</div>
                    </motion.div>
                    {i < 5 && (
                      <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 + i * 0.12 }}
                        className="hidden md:block"
                      >
                        <svg width="24" height="12" viewBox="0 0 24 12" className="text-white/70">
                          <path d="M0 6h20m-4-4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">HOW IT WORKS</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                Four steps. Zero manual intervention.
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {howItWorks.map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-white/[0.12] transition-all duration-500 h-full">
                  <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`w-full h-full bg-gradient-to-r ${item.color}`} />
                  </div>
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-mono text-sm font-bold`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                      <p className="text-white/50 text-[15px] leading-relaxed mb-4">{item.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[12px] font-mono">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        {item.saving}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">ARCHITECTURE</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                Purpose-built. Every module.
              </h2>
              <p className="text-white/60 mt-4 max-w-2xl mx-auto">
                Eight interconnected modules forming SA&apos;s most complete medical aid switching stack
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {architectureModules.map((mod, i) => (
              <FadeIn key={mod.name} delay={i * 0.06}>
                <div className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 h-full">
                  <div className="text-2xl mb-3">{mod.icon}</div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">{mod.name}</h3>
                  <p className="text-[12px] text-white/60 font-mono">{mod.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Architecture visual diagram */}
          <FadeIn delay={0.3}>
            <div className="mt-12 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <span className="font-mono text-[11px] tracking-wider text-white/70">SYSTEM FLOW</span>
              </div>

              {/* Top layer */}
              <div className="flex justify-center mb-6">
                <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-medium">
                  PMS Integration Layer
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gradient-to-b from-emerald-500/40 to-teal-500/40" />
              </div>

              {/* Middle layer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="px-5 py-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-center">
                  <div className="text-teal-400 text-sm font-medium">EDIFACT Engine</div>
                  <div className="text-[11px] text-white/70 mt-1">MEDCLM v0:912:ZA</div>
                </div>
                <div className="px-5 py-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-center">
                  <div className="text-cyan-400 text-sm font-medium">Pre-Auth Engine</div>
                  <div className="text-[11px] text-white/70 mt-1">7 Rule Categories</div>
                </div>
                <div className="px-5 py-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                  <div className="text-blue-400 text-sm font-medium">Batch Processor</div>
                  <div className="text-[11px] text-white/70 mt-1">5 concurrent workers</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gradient-to-b from-cyan-500/40 to-blue-500/40" />
              </div>

              {/* Switch layer */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <div className="text-indigo-400 text-[13px] font-medium">Healthbridge</div>
                </div>
                <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <div className="text-indigo-400 text-[13px] font-medium">MediKredit</div>
                </div>
                <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                  <div className="text-indigo-400 text-[13px] font-medium">SwitchOn</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <div className="w-px h-8 bg-gradient-to-b from-indigo-500/40 to-purple-500/40" />
              </div>

              {/* Bottom layer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="px-5 py-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                  <div className="text-purple-400 text-sm font-medium">eRA Reconciliation</div>
                  <div className="text-[11px] text-white/70 mt-1">3-tier matching + disputes</div>
                </div>
                <div className="px-5 py-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                  <div className="text-purple-400 text-sm font-medium">Resubmission Workflow</div>
                  <div className="text-[11px] text-white/70 mt-1">15 rejection codes, auto-fix</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FINANCIAL IMPACT ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">FINANCIAL IMPACT</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                Numbers that move the board.
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactStats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 text-center hover:border-emerald-500/20 transition-all duration-500 h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="text-3xl md:text-4xl font-light bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
                      {stat.value}
                    </div>
                    <div className="text-white/70 text-sm font-medium mb-1">{stat.label}</div>
                    <div className="text-white/70 text-[12px]">{stat.sublabel}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUPPORTED SCHEMES ─── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">SCHEME COVERAGE</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                30+ schemes. Fully mapped.
              </h2>
              <p className="text-white/60 mt-4 max-w-2xl mx-auto">
                Every major South African medical aid scheme routed to the correct administrator and clearing house
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-wider text-teal-400/60">Medical Aid Scheme</th>
                      <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-wider text-teal-400/60">Administrator</th>
                      <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-wider text-teal-400/60">Primary Switch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map((s, i) => (
                      <tr key={s.scheme} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                        <td className="px-6 py-3 text-[13px] text-white/80 font-medium">{s.scheme}</td>
                        <td className="px-6 py-3 text-[13px] text-white/50">{s.administrator}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                            s.switch === "Healthbridge"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : s.switch === "MediKredit"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              s.switch === "Healthbridge" ? "bg-emerald-400" : s.switch === "MediKredit" ? "bg-blue-400" : "bg-purple-400"
                            }`} />
                            {s.switch}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── PMS VENDOR ACCREDITATION ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">VENDOR INTEGRATION</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                PMS Accreditation Program
              </h2>
              <p className="text-white/60 mt-4 max-w-2xl mx-auto">
                Third-party practice management systems can integrate with our switching engine through a structured accreditation process
              </p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Accreditation Tests */}
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full">
                <h3 className="text-lg font-medium mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm">12</span>
                  Accreditation Tests — 5 Categories
                </h3>
                <div className="space-y-4">
                  {accreditationTests.map((test, i) => (
                    <div key={test.category} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-mono font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/80">{test.category}</div>
                        <div className="text-[12px] text-white/60 mt-0.5">{test.tests}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Onboarding Flow */}
            <FadeIn delay={0.2}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full">
                <h3 className="text-lg font-medium mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">6</span>
                  Onboarding Steps
                </h3>
                <div className="space-y-5">
                  {onboardingSteps.map((step, i) => (
                    <div key={step.step} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 flex items-center justify-center text-teal-400 text-[12px] font-mono font-bold">
                          {step.step}
                        </div>
                        {i < onboardingSteps.length - 1 && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-5 bg-white/[0.06]" />
                        )}
                      </div>
                      <div className="pt-1">
                        <div className="text-sm font-medium text-white/80">{step.title}</div>
                        <div className="text-[12px] text-white/60 mt-0.5">{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── VISIOCORP INNOVATION ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="font-mono text-[13px] tracking-wider text-teal-400/60">VISIOCORP INNOVATION</span>
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mt-3">
                First in South Africa.
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-6">
            {[
              {
                title: "Complete EDIFACT engine — built from scratch",
                description: "No third-party EDIFACT library. We parsed the MEDCLM v0:912:ZA specification and built a full parser/generator that handles every segment, element, and composite. This is the foundation everything else runs on.",
                accent: "border-emerald-500/30",
              },
              {
                title: "AI-powered rejection prevention",
                description: "Not just format validation — clinical cross-matching. The engine checks ICD-10 codes against procedure modifiers, validates PMB/CDL eligibility, and catches the 15 most common rejection patterns before the claim ever leaves the practice.",
                accent: "border-teal-500/30",
              },
              {
                title: "Open multi-switch routing",
                description: "Practices choose their clearing house — not locked to a single switch vendor. The router maps every scheme to its administrator and optimal switch route, with automatic failover if a switch is down.",
                accent: "border-cyan-500/30",
              },
              {
                title: "Competition Tribunal precedent",
                description: "The 2023 Competition Tribunal ruling opened the medical aid switching market to new entrants. VisioCorp is the first to build a complete, independent switching engine that takes advantage of this precedent.",
                accent: "border-blue-500/30",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className={`bg-white/[0.03] backdrop-blur-sm border-l-4 ${item.accent} border border-white/[0.06] rounded-xl p-8`}>
                  <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                  <p className="text-white/50 text-[15px] leading-relaxed">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-12 text-center">
              <blockquote className="text-2xl md:text-3xl font-extralight text-white/60 italic max-w-3xl mx-auto leading-relaxed">
                &ldquo;The technology was always buildable.{" "}
                <span className="text-emerald-400 not-italic font-light">We just built it.</span>&rdquo;
              </blockquote>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto relative">
          <FadeIn>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-extralight tracking-tight mb-4">
                Ready to{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent font-light">
                  switch
                </span>
                ?
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
                Whether you&apos;re a practice manager, hospital group, or PMS vendor — we&apos;d love to show you how the switching engine can transform your claims workflow.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Link
                  href="/book"
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                >
                  Request a Demo
                </Link>
                <Link
                  href="/research/vrl-002"
                  className="px-8 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/70 hover:text-white font-medium rounded-xl transition-all duration-300"
                >
                  Read VRL-001 Research
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/70 font-mono">
                <span>EDIFACT MEDCLM v0:912:ZA</span>
                <span className="w-px h-3 bg-white/10" />
                <span>Multi-Switch Router</span>
                <span className="w-px h-3 bg-white/10" />
                <span>AI Pre-Validation</span>
                <span className="w-px h-3 bg-white/10" />
                <span>eRA Reconciliation</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
