"use client";

import { motion } from "framer-motion";
import {
  FileText, Shield, Heart, Clock, Building2, Users,
  CheckCircle, AlertTriangle, Target, Zap, Server,
  Phone, Mail, Globe, ArrowRight,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export default function GovernmentTenderPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div {...fadeUp} className="rounded-xl glass-panel p-8 text-center border border-[var(--border)]">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#D4AF37]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ivory)] mb-2">
          Government Partnership Proposal
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] mb-4">
          Netcare Health OSOS Digital Health Platform
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
          <Shield className="w-4 h-4 text-[#8B5CF6]" />
          <span className="text-[12px] font-medium text-[#8B5CF6]">
            Prepared for: National Department of Health | Provincial Health Departments
          </span>
        </div>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-3">March 2026 | Confidential</p>
      </motion.div>

      {/* 1. Executive Summary */}
      <Section number={1} title="Executive Summary" icon={Target} color="#D4AF37" delay={0.05}>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
          South Africa&apos;s public healthcare system serves over <strong className="text-[var(--ivory)]">40 million people</strong> who
          depend on government facilities as their primary source of care. The system spends approximately <strong className="text-[var(--ivory)]">$140 per person</strong> annually
          on healthcare &mdash; compared to $4,000+ in OECD nations &mdash; while processing <strong className="text-[var(--ivory)]">R125.3 billion</strong> in
          medical scheme claims and managing a disease burden that includes the world&apos;s largest HIV program, rising NCDs,
          and persistent maternal mortality above WHO targets.
        </p>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
          <strong className="text-[var(--ivory)]">Netcare Health OSOS</strong> is an AI-powered digital health platform that provides intelligent
          triage, clinical routing, appointment management, billing automation, and real-time operational oversight for
          healthcare facilities. The platform deploys 5 specialized AI agents (triage, intake, billing, scheduling,
          follow-up) alongside 22 integrated clinical and administrative features, purpose-built for the South African
          healthcare context.
        </p>
        <div className="rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 p-4">
          <div className="flex items-start gap-3">
            <ArrowRight className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
            <p className="text-[13px] text-[var(--text-secondary)]">
              <strong className="text-[#10b981]">The Ask:</strong> We propose a phased pilot deployment beginning
              with <strong className="text-[var(--ivory)]">100 facilities</strong> in Gauteng and Western Cape, scaling to
              national rollout across <strong className="text-[var(--ivory)]">3,000+ facilities</strong> over 36 months &mdash; with
              measurable mortality reduction, cost savings, and NHI readiness outcomes at each gate.
            </p>
          </div>
        </div>
      </Section>

      {/* 2. Problem Statement */}
      <Section number={2} title="Problem Statement" icon={AlertTriangle} color="#ef4444" delay={0.1}>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
          The following table summarizes the critical failure points in South Africa&apos;s public health system
          that Netcare Health OSOS is designed to address:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Crisis Area</th>
                <th className="text-left py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Current State</th>
                <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">Impact</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {[
                ["Emergency Response Time", "Average ambulance arrival: 1-6 hours in rural areas", "Preventable deaths from delayed trauma care"],
                ["Surgical Backlogs", "200,000+ patients on waiting lists nationally", "Disease progression, increased mortality"],
                ["Triage Failures", "Manual paper-based triage in most facilities", "Mis-prioritization of critical patients, ED overcrowding"],
                ["Maternal Mortality", "119 per 100,000 live births (2022)", "3x higher than WHO Sustainable Development Goal target"],
                ["Sepsis Detection", "Average detection delay: 6-12 hours", "30-50% mortality once septic shock develops"],
                ["TB Case Finding", "Only 61% of estimated TB cases detected", "Ongoing community transmission, drug resistance"],
                ["Mental Health Access", "<1% of health budget allocated to mental health", "24% depression prevalence, rising suicide rates"],
                ["Chronic Disease Management", "2.8M orphans, many from AIDS-related deaths", "Fragmented care, poor treatment adherence"],
                ["Staff-to-Patient Ratio", "1 doctor per 3,198 public sector patients", "Burnout, medical errors, poor continuity of care"],
                ["Medico-Legal Claims", "R125.3B in outstanding claims against state", "Crippling fiscal burden, defensive medicine"],
              ].map(([area, state, impact], i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="py-2.5 pr-4 font-medium text-[var(--ivory)]">{area}</td>
                  <td className="py-2.5 pr-4">{state}</td>
                  <td className="py-2.5">{impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 3. Proposed Solution */}
      <Section number={3} title="Proposed Solution — 3 Phase Rollout" icon={Zap} color="#2DD4BF" delay={0.15}>
        <div className="space-y-4">
          {[
            {
              phase: "Phase 1",
              period: "Months 1-6",
              title: "Proof of Concept — Gauteng & Western Cape",
              budget: "R15,000,000",
              color: "#E8C84A",
              details: [
                "100 primary healthcare clinics in Gauteng and Western Cape",
                "Full Netcare Health OSOS deployment: AI triage, scheduling, billing, follow-up",
                "WhatsApp-based patient communication (95% smartphone penetration in metros)",
                "Integration with District Health Information System (DHIS)",
                "Real-time dashboard for provincial health department oversight",
                "Baseline measurement: patient wait times, triage accuracy, referral completion",
              ],
            },
            {
              phase: "Phase 2",
              period: "Months 7-18",
              title: "Metro Expansion — All 8 Metropolitans",
              budget: "R75,000,000",
              color: "#2DD4BF",
              details: [
                "Scale to 1,000 clinics across all metropolitan municipalities",
                "Add community health worker (CHW) mobile integration",
                "Deploy predictive analytics for disease outbreak early warning",
                "Integrate with NHI patient registration system",
                "Multi-language support: English, Zulu, Xhosa, Afrikaans, Sotho, Tswana",
                "Train 5,000+ healthcare workers on platform use",
              ],
            },
            {
              phase: "Phase 3",
              period: "Months 19-36",
              title: "National Rollout — All 9 Provinces",
              budget: "R200,000,000",
              color: "#8B5CF6",
              details: [
                "National deployment to 3,000+ facilities including district hospitals",
                "Offline-first capability for rural facilities with intermittent connectivity",
                "Provincial health department real-time operational dashboards",
                "Integration with HPCSA practitioner verification",
                "Telemedicine routing for specialist consultations",
                "Full NHI interoperability and compliance certification",
              ],
            },
          ].map((p) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-lg border border-[var(--border)] p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                  {p.phase}
                </div>
                <span className="text-[12px] text-[var(--text-tertiary)]">{p.period}</span>
                <span className="ml-auto text-[14px] font-bold text-[var(--ivory)]">{p.budget}</span>
              </div>
              <h4 className="text-[14px] font-semibold text-[var(--ivory)] mb-3">{p.title}</h4>
              <ul className="space-y-1.5">
                {p.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: p.color }} />
                    {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 4. Evidence Base */}
      <Section number={4} title="Evidence Base" icon={FileText} color="#0ea5e9" delay={0.2}>
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
          The following peer-reviewed evidence supports the projected impact of digital health triage
          and routing interventions:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Intervention</th>
                <th className="text-left py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Mortality Reduction</th>
                <th className="text-left py-2 text-[var(--text-tertiary)] font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {[
                ["AI-assisted triage in emergency departments", "15-25% reduction in preventable ED deaths", "Liu et al., Nature Medicine (2023)"],
                ["Digital early warning scores (DEWS)", "20-30% reduction in failure-to-rescue events", "Escobar et al., NEJM (2020)"],
                ["Automated sepsis screening", "18.2% mortality reduction in hospitals", "Adams et al., Nature Medicine (2022)"],
                ["mHealth appointment reminders", "34% reduction in missed appointments", "Gurol-Urganci et al., Cochrane Review (2013)"],
                ["Clinical decision support systems", "12-20% improvement in guideline adherence", "Kawamoto et al., BMJ (2005)"],
                ["Digital referral management", "40% reduction in referral-to-treatment time", "WHO Digital Health Interventions Guidelines (2019)"],
                ["Real-time bed management", "15% reduction in ED boarding time", "Bai et al., Health Affairs (2021)"],
                ["Predictive readmission algorithms", "21% reduction in 30-day readmissions", "Rajkomar et al., npj Digital Medicine (2018)"],
              ].map(([intervention, reduction, source], i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="py-2.5 pr-4 text-[var(--ivory)]">{intervention}</td>
                  <td className="py-2.5 pr-4 font-medium text-[#10b981]">{reduction}</td>
                  <td className="py-2.5 text-[var(--text-tertiary)] italic">{source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 5. Expected Outcomes */}
      <Section number={5} title="Expected Outcomes" icon={Heart} color="#ef4444" delay={0.25}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <OutcomeCard
            title="Lives Saved"
            items={[
              { label: "Phase 1 (100 clinics)", value: "500-1,000 lives/year", color: "#E8C84A" },
              { label: "Phase 2 (1,000 clinics)", value: "5,000-12,000 lives/year", color: "#2DD4BF" },
              { label: "Phase 3 (3,000+ facilities)", value: "15,000-30,000 lives/year", color: "#8B5CF6" },
            ]}
          />
          <OutcomeCard
            title="Cost Savings"
            items={[
              { label: "Medico-legal claim reduction", value: "R5-15B over 10 years", color: "#10b981" },
              { label: "Reduced unnecessary referrals", value: "R2-5B annually at scale", color: "#2DD4BF" },
              { label: "Operational efficiency gains", value: "R1-3B annually at scale", color: "#0ea5e9" },
            ]}
          />
          <OutcomeCard
            title="NHI Readiness"
            items={[
              { label: "Digital patient registration", value: "100% enrolled facilities", color: "#D4AF37" },
              { label: "Standardized clinical coding", value: "ICD-10 across all sites", color: "#E8C84A" },
              { label: "Interoperable health records", value: "FHIR-ready data model", color: "#8B5CF6" },
            ]}
          />
          <OutcomeCard
            title="Patient Experience"
            items={[
              { label: "Average wait time reduction", value: "40-60% decrease", color: "#ef4444" },
              { label: "Appointment adherence", value: "34% improvement", color: "#10b981" },
              { label: "Patient satisfaction score", value: "Target: 80%+ (from ~45%)", color: "#2DD4BF" },
            ]}
          />
        </div>
      </Section>

      {/* 6. Technical Specifications */}
      <Section number={6} title="Technical Specifications" icon={Server} color="#8B5CF6" delay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">Platform Capabilities (22 Features)</h4>
            <div className="space-y-1.5">
              {[
                "AI Triage Agent (5-level acuity scoring)",
                "Intelligent Appointment Scheduling",
                "Patient Intake Automation",
                "ICD-10 Billing & Medical Aid Claims",
                "Follow-up & Recall Management",
                "WhatsApp / SMS Patient Communication",
                "Real-time Operational Dashboard",
                "Multi-practice Management Console",
                "White-label Per-facility Branding",
                "Patient Check-in / Check-out Queue",
                "Daily Task & Workflow Automation",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                  <CheckCircle className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">Continued</h4>
            <div className="space-y-1.5">
              {[
                "ElevenLabs Voice AI for Accessibility",
                "Notification Engine (WhatsApp/SMS/Email)",
                "POPIA Consent & Audit Trail",
                "Role-based Access Control",
                "Revenue Analytics & Reporting",
                "Morning Briefing Dashboard",
                "Compliance Dashboard",
                "Patient Portal & Self-service",
                "Telemedicine Routing (Phase 2+)",
                "Predictive Outbreak Analytics (Phase 2+)",
                "Offline-first Mode (Phase 3)",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                  <CheckCircle className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">5 Specialized AI Agents</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: "Triage Agent", desc: "5-level acuity scoring, symptom analysis", color: "#ef4444" },
              { name: "Intake Agent", desc: "Patient registration, history collection", color: "#2DD4BF" },
              { name: "Billing Agent", desc: "ICD-10 coding, claim generation", color: "#10b981" },
              { name: "Scheduler Agent", desc: "Smart booking, resource allocation", color: "#E8C84A" },
              { name: "Follow-up Agent", desc: "Recall, reminders, care continuity", color: "#8B5CF6" },
            ].map((a) => (
              <div key={a.name} className="rounded-lg border border-[var(--border)] p-3 text-center">
                <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${a.color}15` }}>
                  <Zap className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <div className="text-[11px] font-semibold text-[var(--ivory)]">{a.name}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">Infrastructure & Compliance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Hosting", value: "Vercel Edge Network (Cape Town PoP) — 99.99% uptime SLA" },
              { label: "Database", value: "Supabase (PostgreSQL) — encrypted at rest and in transit" },
              { label: "Communication", value: "WhatsApp Business API, SMS via Twilio, Resend email" },
              { label: "AI Models", value: "Claude Sonnet 4 (Anthropic) — no patient data sent to LLM" },
              { label: "POPIA Compliance", value: "Full consent tracking, audit logging, data minimization" },
              { label: "Architecture", value: "Multi-tenant — each facility isolated with own branding and data" },
              { label: "Interoperability", value: "FHIR R4 ready, HL7 compatible, DHIS2 integration planned" },
              { label: "Security", value: "SOC 2 Type II (Vercel), row-level security, encrypted backups" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="text-[var(--text-tertiary)] font-medium w-28 shrink-0">{item.label}:</span>
                <span className="text-[var(--text-secondary)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 7. Budget Summary */}
      <Section number={7} title="Budget Summary" icon={Building2} color="#10b981" delay={0.35}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Line Item</th>
                <th className="text-right py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Phase 1</th>
                <th className="text-right py-2 pr-4 text-[var(--text-tertiary)] font-semibold">Phase 2</th>
                <th className="text-right py-2 text-[var(--text-tertiary)] font-semibold">Phase 3</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {[
                ["Platform Licensing & Hosting", "R3,000,000", "R18,000,000", "R50,000,000"],
                ["Implementation & Configuration", "R4,000,000", "R15,000,000", "R35,000,000"],
                ["Training & Change Management", "R2,500,000", "R12,000,000", "R30,000,000"],
                ["Integration (DHIS, NHI, WhatsApp)", "R2,000,000", "R10,000,000", "R25,000,000"],
                ["Support & Maintenance (12 months)", "R1,500,000", "R10,000,000", "R30,000,000"],
                ["Project Management & Governance", "R1,000,000", "R5,000,000", "R15,000,000"],
                ["Monitoring, Evaluation & Reporting", "R1,000,000", "R5,000,000", "R15,000,000"],
              ].map(([item, p1, p2, p3], i) => (
                <tr key={i} className="border-b border-[var(--border)]/50">
                  <td className="py-2.5 pr-4 text-[var(--ivory)]">{item}</td>
                  <td className="py-2.5 pr-4 text-right">{p1}</td>
                  <td className="py-2.5 pr-4 text-right">{p2}</td>
                  <td className="py-2.5 text-right">{p3}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--border)]">
                <td className="py-3 pr-4 font-bold text-[var(--ivory)] text-[13px]">Total</td>
                <td className="py-3 pr-4 text-right font-bold text-[#E8C84A] text-[13px]">R15,000,000</td>
                <td className="py-3 pr-4 text-right font-bold text-[#2DD4BF] text-[13px]">R75,000,000</td>
                <td className="py-3 text-right font-bold text-[#8B5CF6] text-[13px]">R200,000,000</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4">
          <p className="text-[12px] text-[var(--text-secondary)]">
            <strong className="text-[#D4AF37]">Total Programme Investment:</strong>{" "}
            <strong className="text-[var(--ivory)]">R290,000,000</strong> over 36 months &mdash;
            against projected savings of <strong className="text-[var(--ivory)]">R5-15 billion</strong> in
            medico-legal claims reduction and <strong className="text-[var(--ivory)]">15,000-30,000 lives saved annually</strong> at
            full scale. Cost per life saved: approximately <strong className="text-[var(--ivory)]">R3,200-R6,400</strong>.
          </p>
        </div>
      </Section>

      {/* 8. Contact & Next Steps */}
      <Section number={8} title="Contact & Next Steps" icon={Users} color="#D4AF37" delay={0.4}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h4 className="text-[14px] font-semibold text-[var(--ivory)] mb-1">Netcare Health OS Ops</h4>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
              Netcare Technology (Pty) Ltd
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                partnerships@visiohealth.co.za
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                +27 (0) 10 XXX XXXX
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <Globe className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                www.visiohealth.co.za
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">Proposed Next Steps</h4>
            <div className="space-y-2">
              {[
                "Stakeholder briefing with NDoH Digital Health Directorate",
                "Technical demonstration and pilot site selection",
                "MOU and data sharing agreement execution",
                "Phase 1 deployment planning and timeline confirmation",
                "Monitoring & evaluation framework agreement",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-[var(--text-secondary)]">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#D4AF37]">{i + 1}</span>
                  </div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
          <p className="text-[11px] text-[var(--text-tertiary)] italic">
            &quot;The question is not whether digital health can save lives in South Africa &mdash;
            the evidence is overwhelming. The question is how fast we deploy it.&quot;
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
            Document Reference: VHO-GOV-PROP-2026-001 | Classification: Confidential
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  number,
  title,
  icon: Icon,
  color,
  delay,
  children,
}: {
  number: number;
  title: string;
  icon: typeof FileText;
  color: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl glass-panel p-6 border border-[var(--border)]"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
            {number}
          </span>
          <h2 className="text-[15px] font-semibold text-[var(--ivory)]">{title}</h2>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function OutcomeCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string; color: string }[];
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <h4 className="text-[13px] font-semibold text-[var(--ivory)] mb-3">{title}</h4>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--text-secondary)]">{item.label}</span>
            <span className="text-[12px] font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
