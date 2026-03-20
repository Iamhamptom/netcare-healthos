"use client";

import { motion } from "framer-motion";
import {
  Beaker, Heart, Users, Zap, Shield, Globe, Building2,
  ArrowRight, CheckCircle2, Lightbulb, TrendingUp, FileText,
  Phone, Mail, MapPin, Clock, Target, Brain,
} from "lucide-react";

const WHAT_WE_ARE = [
  { title: "AI Research Lab", desc: "Like Anthropic or DeepMind, but focused on African healthcare. We study how advanced machine learning and agentic AI can solve real problems in emerging market healthcare systems.", icon: Beaker },
  { title: "Adoption Facilitators", desc: "We do not just build AI. We understand your landscape, design solutions around it, and facilitate adoption at scale. Technology only works when people use it.", icon: Users },
  { title: "Cost Infrastructure Auditors", desc: "We use AI to audit your current cost infrastructure — claims leakage, manual processes, system redundancies — and show you exactly where money is being lost.", icon: TrendingUp },
  { title: "People-First Technologists", desc: "We want to make AI technology accessible. Use it to do important things — like saving lives and saving your time, so everyone can do more.", icon: Heart },
];

const PARTNERSHIP_MODEL = [
  { phase: "Phase 1", title: "We provide the tools, tech stack, and best practices — free", items: ["Full VisioHealth OS platform deployment", "AI claims intelligence engine", "WhatsApp patient router", "Network financial dashboards", "Practitioner performance portal", "POPIA compliance automation"], note: "You cover: data hosting, API tokens, and compute costs only" },
  { phase: "Phase 2", title: "Ongoing retainer — your AI partner on call", items: ["Continuous platform improvement and new features", "AI model training on your specific data patterns", "Monthly cost infrastructure audits", "New module development based on your needs", "Best practices advisory from our research"], note: "Retainer covers: our team's time, R&D, and support" },
  { phase: "Phase 3", title: "Scale together — make the technology accessible", items: ["Netcare becomes a partner in our mission", "Share learnings across the healthcare ecosystem", "Co-publish research on AI in African healthcare", "Joint ventures on new products (Placeo, Payer Connect)", "Netcare's data + our AI = breakthrough insights"], note: "This is bigger than software. This is advancing healthcare." },
];

const WHY_NOW = [
  { stat: "38.6%", label: "AI in healthcare CAGR", detail: "The market is growing faster than any technology in history" },
  { stat: "53GB", label: "Clinical data Netcare generates daily", detail: "You are sitting on one of Africa's richest healthcare datasets" },
  { stat: "R95M+", label: "Annual savings addressable", detail: "The cost of NOT adopting AI grows every month" },
  { stat: "77%", label: "Flexicare growth rate", detail: "Discovery is moving fast. Technology is the only moat." },
];

const WHAT_WE_BRING = [
  "120+ peer-reviewed citations backing every module",
  "Purpose-built AI for South African healthcare (ICD-10-ZA, NAPPI, POPIA)",
  "Working platform — not a pitch deck, not a concept, a live system",
  "Full gap analysis verified against your annual reports",
  "Integration approach for CareOn, SAP, HEAL, SwitchOn",
  "AI lead generation — we used this technology to find and research you",
  "Cost infrastructure audit capability — we show you where money leaks",
  "Agentic AI that learns and improves continuously",
  "Open to co-building: your domain expertise + our AI capability",
  "African-native team that understands your market from the inside",
];

export default function PartnershipPage() {
  return (
    <div className="p-6 space-y-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <Beaker className="w-5 h-5 text-[#3DA9D1]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Visio Research Labs</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">
          A Partnership, Not a Vendor.
        </h1>
        <p className="text-[15px] text-gray-500 mt-2 max-w-2xl leading-relaxed">
          Visio Research Labs is an AI research company — similar to Anthropic, OpenAI, and DeepMind — 
          focused on adoption facilitation of advanced machine learning and agentic AI in healthcare.
          We designed a solution specifically for Netcare. This is our first line of offering.
        </p>
      </motion.div>

      {/* What We Are */}
      <div className="grid grid-cols-2 gap-4">
        {WHAT_WE_ARE.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl border border-gray-200 bg-white">
            <item.icon className="w-5 h-5 text-[#3DA9D1] mb-3" />
            <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-[12px] text-gray-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* The Pitch */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="p-6 rounded-xl bg-[#1D3443]">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">The Proposition</h2>
          <p className="text-[14px] text-white/70 leading-relaxed mb-4">
            AI does not stop growing in its capacity and its trend in reducing overhead. 
            We are a people-first lab. We want to make the technology accessible and use it to do 
            important things — like saving lives, and saving your time, so we can all do more.
          </p>
          <p className="text-[14px] text-white/70 leading-relaxed mb-4">
            We have the research. We have the data. We have the solution. 
            And we can help you audit your current cost infrastructure to show exactly where the value is.
          </p>
          <p className="text-[14px] text-[#E3964C] font-medium leading-relaxed">
            By the way — we used this same AI technology to find you, research your organisation, 
            read your annual reports, map your systems, and build this platform. That is called lead generation. 
            Imagine what it can do for your patients.
          </p>
        </div>
      </motion.div>

      {/* Partnership Model */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">The Partnership Model</h2>
        <div className="space-y-4">
          {PARTNERSHIP_MODEL.map((phase, i) => (
            <motion.div key={phase.phase} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#3DA9D1] bg-[#3DA9D1]/10 px-2 py-0.5 rounded">{phase.phase}</span>
                <h3 className="text-[14px] font-semibold text-gray-900">{phase.title}</h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {phase.items.map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1] mt-0.5 shrink-0" />
                      <span className="text-[12px] text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-[#E3964C]/5 border border-[#E3964C]/15">
                  <span className="text-[11px] text-[#E3964C] font-semibold">{phase.note}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Now */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Now</h2>
        <div className="grid grid-cols-4 gap-4">
          {WHY_NOW.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
              className="p-4 rounded-xl border border-gray-200 bg-white text-center">
              <div className="text-2xl font-bold font-metric text-[#1D3443]">{item.stat}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">{item.label}</div>
              <div className="text-[10px] text-gray-400 mt-1">{item.detail}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What We Bring */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What We Bring to the Table</h2>
        <div className="grid grid-cols-2 gap-2">
          {WHAT_WE_BRING.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.03 }}
              className="flex items-start gap-2 p-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1] mt-0.5 shrink-0" />
              <span className="text-[12px] text-gray-600">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Ask */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#1D3443] to-[#3DA9D1]">
        <h2 className="text-xl font-semibold text-white mb-3">What We Ask of Netcare</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-white/10">
            <h3 className="text-[13px] text-white font-semibold mb-2">Become a Partner</h3>
            <p className="text-[12px] text-white/60">Join us in making AI technology accessible in African healthcare. Your scale + our AI = impact at national level.</p>
          </div>
          <div className="p-4 rounded-lg bg-white/10">
            <h3 className="text-[13px] text-white font-semibold mb-2">Share the Data</h3>
            <p className="text-[12px] text-white/60">Netcare generates 53GB of clinical data daily. Together, we turn that into insights that save lives and reduce costs.</p>
          </div>
          <div className="p-4 rounded-lg bg-white/10">
            <h3 className="text-[13px] text-white font-semibold mb-2">Cover the Infrastructure</h3>
            <p className="text-[12px] text-white/60">Data hosting, API tokens, compute costs. We provide the tools, the tech stack, and the best practices free of charge.</p>
          </div>
          <div className="p-4 rounded-lg bg-white/10">
            <h3 className="text-[13px] text-white font-semibold mb-2">Start with a Pilot</h3>
            <p className="text-[12px] text-white/60">8 weeks. One region. Zero risk. Let the results speak for themselves. Then we scale together.</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900 mb-3">David M. Hampton</h3>
            <p className="text-[12px] text-gray-500 mb-3">Managing Director, VisioCorp<br />Founder, Visio Research Labs</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px] text-gray-600">
                <Mail className="w-3.5 h-3.5 text-[#3DA9D1]" />
                davidhampton@visiocorp.co
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-600">
                <Globe className="w-3.5 h-3.5 text-[#3DA9D1]" />
                visiocorp.co
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#3DA9D1]" />
                Johannesburg, South Africa
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Visio Research Labs</h3>
            <p className="text-[12px] text-gray-500 mb-3">AI Research &middot; Healthcare Focus &middot; African-Native</p>
            <div className="space-y-2 text-[12px] text-gray-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1]" /> 120+ peer-reviewed citations</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1]" /> VRL-001: Healthcare Routing Research</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1]" /> POPIA compliant operations</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#3DA9D1]" /> South African registered entity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Hosting & Security */}
      <div className="p-5 rounded-xl border border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Hosting &amp; Security</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <Shield className="w-4 h-4 text-[#1D3443] mb-2" />
            <div className="text-[12px] font-semibold text-gray-900">POPIA Compliant</div>
            <div className="text-[11px] text-gray-500">Information Officer designated. Consent tracking. Breach notification. Full s18-s72 compliance.</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <Globe className="w-4 h-4 text-[#3DA9D1] mb-2" />
            <div className="text-[12px] font-semibold text-gray-900">Hosting Options</div>
            <div className="text-[11px] text-gray-500">Cloud (Vercel/AWS) or on-premise. Patient data can be hosted in South Africa per your requirements.</div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <FileText className="w-4 h-4 text-[#E3964C] mb-2" />
            <div className="text-[12px] font-semibold text-gray-900">Documentation Ready</div>
            <div className="text-[11px] text-gray-500">Data Processing Agreement, NDA, Pilot Agreement, SLA — all prepared and ready to sign.</div>
          </div>
        </div>
      </div>

      {/* Final line */}
      <div className="text-center py-4">
        <p className="text-[13px] text-gray-400">
          Visio Research Labs &middot; Johannesburg, South Africa &middot; Making AI accessible for African healthcare
        </p>
      </div>
    </div>
  );
}
