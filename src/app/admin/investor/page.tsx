"use client";

import { motion } from "framer-motion";
import {
  Heart, Users, Activity, Clock, Building2, Stethoscope,
  DollarSign, TrendingUp, Shield, Smartphone, Globe,
  Zap, Brain, MessageSquare, Layers, Target,
  ArrowRight, CheckCircle2, AlertTriangle,
} from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function InvestorPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Hero Statement */}
      <motion.div {...fadeUp} className="rounded-xl glass-panel p-8 border-l-4 border-[#3DA9D1]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#3DA9D1]/15 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-[#3DA9D1]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--ivory)] mb-3">Netcare Health OSOS</h1>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              Netcare Health OSOS addresses the <span className="text-[#3DA9D1] font-semibold">routing layer</span> — the gap between a patient arriving and receiving the right care. In South Africa, that gap kills <span className="text-[#3DA9D1] font-semibold">10,000–20,000 people annually</span> who could be saved.
            </p>
          </div>
        </div>
      </motion.div>

      {/* The Problem */}
      <div>
        <SectionHeader icon={AlertTriangle} label="The Problem" color="#ef4444" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <InvestorKPI
            icon={Users}
            value="40M+"
            label="People on R140/yr healthcare"
            sublabel="Public sector patients"
            color="#ef4444"
            delay={0}
          />
          <InvestorKPI
            icon={Activity}
            value="91.1%"
            label="Hypertensives uncontrolled"
            sublabel="Lancet, 2023"
            color="#ef4444"
            delay={0.05}
          />
          <InvestorKPI
            icon={Brain}
            value="<1%"
            label="Stroke thrombolysis rate"
            sublabel="vs 10-15% in developed nations"
            color="#ef4444"
            delay={0.1}
          />
          <InvestorKPI
            icon={Clock}
            value="6 hours"
            label="To sepsis antibiotics"
            sublabel="Target: 1 hour"
            color="#ef4444"
            delay={0.15}
          />
        </div>
      </div>

      {/* The Market */}
      <div>
        <SectionHeader icon={Globe} label="The Market" color="#0ea5e9" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <InvestorKPI
            icon={Building2}
            value="470+"
            label="Public hospitals"
            sublabel="3,000+ clinics nationwide"
            color="#0ea5e9"
            delay={0}
          />
          <InvestorKPI
            icon={Users}
            value="129M+"
            label="Clinic visits per year"
            sublabel="SA public health system"
            color="#0ea5e9"
            delay={0.05}
          />
          <InvestorKPI
            icon={DollarSign}
            value="R125.3B"
            label="Medico-legal claims"
            sublabel="The cost of NOT fixing this"
            color="#0ea5e9"
            delay={0.1}
          />
          <InvestorKPI
            icon={Shield}
            value="NHI"
            label="Digital health mandated"
            sublabel="National Health Insurance incoming"
            color="#0ea5e9"
            delay={0.15}
          />
        </div>
      </div>

      {/* The Evidence */}
      <div>
        <SectionHeader icon={CheckCircle2} label="The Evidence" color="#10b981" />
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-xl glass-panel p-5 mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold pb-3 pr-4">Intervention</th>
                <th className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold pb-3 pr-4">Impact</th>
                <th className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold pb-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <EvidenceRow intervention="AI Triage" impact="75% mortality reduction" source="Uganda, PLOS Digital Health" />
              <EvidenceRow intervention="Telehealth" impact="45% mortality reduction" source="UK NHS, BMJ" />
              <EvidenceRow intervention="Digital Check-in" impact="14% mortality reduction" source="IFS / Cornell / MIT" />
              <EvidenceRow intervention="SMS Reminders" impact="40–50% attendance improvement" source="KZN study" />
              <EvidenceRow intervention="AI Dispatch" impact="43% fewer missed cardiac arrests" source="Copenhagen EMS" />
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* The Product */}
      <div>
        <SectionHeader icon={Layers} label="The Product — Netcare Health OSOS" color="#8B5CF6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <ProductFeature
            icon={Zap}
            title="22 Clinical Features"
            description="AI triage, symptom checker, digital check-in, recall system, billing, POPIA compliance"
            color="#8B5CF6"
            delay={0}
          />
          <ProductFeature
            icon={Brain}
            title="5 AI Agents"
            description="Triage, follow-up, intake, billing, and scheduler — autonomous clinical support"
            color="#8B5CF6"
            delay={0.05}
          />
          <ProductFeature
            icon={Stethoscope}
            title="41 API Routes"
            description="Complete clinical workflow automation from patient intake to billing"
            color="#8B5CF6"
            delay={0.1}
          />
          <ProductFeature
            icon={Smartphone}
            title="WhatsApp-Native"
            description="Built for SA — WhatsApp is ubiquitous, no app download required"
            color="#10b981"
            delay={0.15}
          />
          <ProductFeature
            icon={Building2}
            title="Multi-Tenant White-Label"
            description="Each practice gets their own brand, logo, colors, and subdomain"
            color="#10b981"
            delay={0.2}
          />
          <ProductFeature
            icon={Shield}
            title="POPIA Compliant"
            description="Consent tracking, audit logging, role-based access, compliance dashboard"
            color="#10b981"
            delay={0.25}
          />
        </div>
      </div>

      {/* Revenue Model */}
      <div>
        <SectionHeader icon={DollarSign} label="Revenue Model" color="#D4AF37" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <PricingCard
            tier="Starter"
            price="R7,500"
            features={["AI triage", "Digital check-in", "Basic analytics", "5 staff seats"]}
            color="#E8C84A"
            delay={0}
          />
          <PricingCard
            tier="Professional"
            price="R15,000"
            features={["All Starter features", "5 AI agents", "WhatsApp integration", "White-label branding", "20 staff seats"]}
            color="#2DD4BF"
            highlight
            delay={0.05}
          />
          <PricingCard
            tier="Enterprise"
            price="R30,000"
            features={["All Professional features", "Custom integrations", "Dedicated support", "Unlimited staff", "SLA guarantee"]}
            color="#8B5CF6"
            delay={0.1}
          />
        </div>

        <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="rounded-xl glass-panel p-5 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-4 h-4 text-[#3DA9D1]" />
            <h3 className="text-[13px] font-semibold text-[var(--ivory)]">Scale Target</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[14px] text-[var(--text-secondary)]">1,000 practices</span>
            <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-[18px] font-bold text-[#3DA9D1]">R15M MRR</span>
            <span className="text-[12px] text-[var(--text-tertiary)]">(R180M ARR)</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <h4 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">6-Product Ecosystem</h4>
            <div className="flex flex-wrap gap-2">
              {[
                "Netcare Health OSOS (Clinics)",
                "Netcare Health OSOS (Hospitals)",
                "Patient Portal",
                "Pharmacy Module",
                "Lab Integration",
                "Telehealth Platform",
              ].map((product) => (
                <span
                  key={product}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-[#3DA9D1]/10 text-[#3DA9D1] font-medium"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Impact at Scale */}
      <div>
        <SectionHeader icon={Heart} label="Impact at Scale" color="#10b981" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <ImpactCard
            phase="Phase 1"
            subtitle="100 Clinics"
            value="1,500–3,000"
            unit="lives saved per year"
            color="#10b981"
            delay={0}
          />
          <ImpactCard
            phase="Phase 2"
            subtitle="1,000 Clinics"
            value="5,000–10,000"
            unit="lives saved per year"
            color="#22c55e"
            delay={0.05}
          />
          <ImpactCard
            phase="Phase 3"
            subtitle="National Rollout"
            value="10,000–20,000"
            unit="lives saved per year"
            color="#4ade80"
            delay={0.1}
          />
        </div>
      </div>

      {/* 10-Year Projection */}
      <div>
        <SectionHeader icon={TrendingUp} label="10-Year Projection" color="#D4AF37" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <motion.div
            {...fadeUp}
            transition={{ delay: 0 }}
            className="rounded-xl glass-panel p-6 text-center border border-[#3DA9D1]/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#3DA9D1]/15 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-[#3DA9D1]" />
            </div>
            <div className="text-3xl font-bold text-[#3DA9D1] mb-1">100K–200K</div>
            <div className="text-[13px] text-[var(--text-secondary)]">Lives Saved</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Cumulative over 10 years</div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.05 }}
            className="rounded-xl glass-panel p-6 text-center border border-[#3DA9D1]/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#3DA9D1]/15 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-7 h-7 text-[#3DA9D1]" />
            </div>
            <div className="text-3xl font-bold text-[#3DA9D1] mb-1">R50–100B</div>
            <div className="text-[13px] text-[var(--text-secondary)]">Economic Value</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Reduced claims, productivity gains</div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="rounded-xl glass-panel p-6 text-center border border-[#3DA9D1]/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#3DA9D1]/15 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-[#3DA9D1]" />
            </div>
            <div className="text-3xl font-bold text-[#3DA9D1] mb-1">50K–100K</div>
            <div className="text-[13px] text-[var(--text-secondary)]">Orphans Prevented</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-1">Families kept whole</div>
          </motion.div>
        </div>
      </div>

      {/* The Ask */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        className="rounded-xl glass-panel p-8 border border-[#3DA9D1]/30 bg-gradient-to-r from-[#3DA9D1]/5 to-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#3DA9D1]/15 flex items-center justify-center shrink-0">
            <ArrowRight className="w-5 h-5 text-[#3DA9D1]" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">The Ask</h3>
            <p className="text-[16px] text-[var(--ivory)] leading-relaxed font-medium max-w-2xl">
              The question is not whether digital health saves lives in South Africa. The question is <span className="text-[#3DA9D1]">how fast we deploy it</span>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({ icon: Icon, label, color }: { icon: typeof Heart; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5" style={{ color }} />
      <h2 className="text-[15px] font-semibold text-[var(--ivory)]">{label}</h2>
    </div>
  );
}

function InvestorKPI({
  icon: Icon,
  value,
  label,
  sublabel,
  color,
  delay,
}: {
  icon: typeof Heart;
  value: string;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl glass-panel p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-secondary)]">{label}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{sublabel}</div>
    </motion.div>
  );
}

function EvidenceRow({
  intervention,
  impact,
  source,
}: {
  intervention: string;
  impact: string;
  source: string;
}) {
  return (
    <tr>
      <td className="text-[13px] text-[var(--ivory)] font-medium py-3 pr-4">{intervention}</td>
      <td className="text-[13px] text-[#3DA9D1] font-semibold py-3 pr-4">{impact}</td>
      <td className="text-[12px] text-[var(--text-tertiary)] py-3">{source}</td>
    </tr>
  );
}

function ProductFeature({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl glass-panel p-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h4 className="text-[13px] font-semibold text-[var(--ivory)]">{title}</h4>
      </div>
      <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">{description}</p>
    </motion.div>
  );
}

function PricingCard({
  tier,
  price,
  features,
  color,
  highlight,
  delay,
}: {
  tier: string;
  price: string;
  features: string[];
  color: string;
  highlight?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl glass-panel p-5 ${highlight ? "border border-[#3DA9D1]/30" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          {tier}
        </span>
      </div>
      <div className="text-2xl font-bold text-[var(--ivory)] mb-1">
        {price}<span className="text-[13px] font-normal text-[var(--text-tertiary)]">/mo</span>
      </div>
      <div className="space-y-2 mt-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1] shrink-0" />
            <span className="text-[12px] text-[var(--text-secondary)]">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ImpactCard({
  phase,
  subtitle,
  value,
  unit,
  color,
  delay,
}: {
  phase: string;
  subtitle: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl glass-panel p-5 text-center"
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-wider mb-1"
        style={{ color }}
      >
        {phase}
      </div>
      <div className="text-[12px] text-[var(--text-tertiary)] mb-3">{subtitle}</div>
      <div className="text-2xl font-bold text-[var(--ivory)]">{value}</div>
      <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{unit}</div>
    </motion.div>
  );
}
