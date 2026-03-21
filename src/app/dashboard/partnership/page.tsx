"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Beaker, Heart, Users, Zap, Shield, Globe, Building2,
  ArrowRight, CheckCircle2, TrendingUp, FileText,
  Mail, MapPin, Brain, Cpu, Network, Layers,
} from "lucide-react";

// Animated background canvas
function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.003;

      // Grid lines
      const spacing = 60;
      ctx.strokeStyle = "rgba(61, 169, 209, 0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Floating nodes
      for (let i = 0; i < 12; i++) {
        const x = (Math.sin(time + i * 1.7) * 0.3 + 0.5) * w;
        const y = (Math.cos(time * 0.7 + i * 2.1) * 0.3 + 0.5) * h;
        const r = 2 + Math.sin(time * 2 + i) * 1;
        const alpha = 0.15 + Math.sin(time + i) * 0.1;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(227, 150, 76, ${alpha})` : `rgba(61, 169, 209, ${alpha})`;
        ctx.fill();

        // Connection lines to nearby nodes
        for (let j = i + 1; j < Math.min(i + 3, 12); j++) {
          const x2 = (Math.sin(time + j * 1.7) * 0.3 + 0.5) * w;
          const y2 = (Math.cos(time * 0.7 + j * 2.1) * 0.3 + 0.5) * h;
          const dist = Math.hypot(x2 - x, y2 - y);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(61, 169, 209, ${0.03 * (1 - dist / 200)})`;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

const ECOSYSTEM = [
  { name: "CareOn EMR", sub: "49 hospitals", type: "Clinical" },
  { name: "HEAL (A2D24)", sub: "55 clinics", type: "Primary" },
  { name: "SAP Healthcare", sub: "R100M ERP", type: "Finance" },
  { name: "Netcare App", sub: "3 platforms", type: "Patient" },
  { name: "SwitchOn", sub: "Claims EDI", type: "Billing" },
  { name: "Micromedex", sub: "4.5M checks", type: "Safety" },
  { name: "Corsano", sub: "6K beds", type: "Vitals" },
  { name: "Clicks Rx", sub: "41 pharmacies", type: "Pharmacy" },
];

const AI_TOOLS = [
  { name: "Claims Intelligence", desc: "Pre-validates across all switches" },
  { name: "WhatsApp Router", desc: "One number, all 88 clinics" },
  { name: "Network Command", desc: "Aggregates all financial data" },
  { name: "Practitioner AI", desc: "Performance across all PMS" },
  { name: "Compliance Engine", desc: "POPIA across every system" },
];

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[#0a1520] text-white -m-6 -mb-20">
      {/* Hero with animated background */}
      <div className="relative overflow-hidden">
        <AnimatedGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1520]" />

        <div className="relative z-10 px-8 pt-16 pb-20 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3DA9D1]/20 bg-[#3DA9D1]/5 mb-6">
              <Beaker className="w-3.5 h-3.5 text-[#3DA9D1]" />
              <span className="text-[11px] text-[#3DA9D1] font-semibold uppercase tracking-widest">Visio Research Labs</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-white leading-tight mb-6">
            A Partnership,<br />
            <span className="text-[#3DA9D1]">Not a Vendor.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[16px] text-white/60 max-w-2xl mx-auto leading-relaxed">
            An AI research lab — in the tradition of Anthropic, OpenAI, and DeepMind — focused on making
            advanced machine learning accessible for African healthcare. We designed a solution for Netcare.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-10 text-[12px] text-white/70 font-medium">
            {["AI Research", "Healthcare Focus", "African Native", "120+ Citations"].map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/10" />}
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* What We Are */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Brain, title: "Research Lab", desc: "Advanced ML and agentic AI applied to healthcare operations" },
            { icon: Layers, title: "Adoption Facilitators", desc: "Understand your landscape, design solutions, facilitate adoption at scale" },
            { icon: TrendingUp, title: "Cost Auditors", desc: "AI audits your cost infrastructure. Shows exactly where money leaks." },
            { icon: Heart, title: "People First", desc: "Make technology accessible. Save lives. Save time. So everyone can do more." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-[#3DA9D1]/20 transition-all duration-500">
              <item.icon className="w-5 h-5 text-[#3DA9D1] mb-3" />
              <h3 className="text-[13px] font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-[11px] text-white/70 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Pitch — David's words */}
      <div className="px-8 max-w-4xl mx-auto py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="relative p-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3DA9D1]/10 to-[#E3964C]/5 rounded-2xl" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-2xl" />
          <div className="relative z-10">
            <p className="text-[16px] text-white/60 leading-relaxed mb-4">
              AI does not stop growing in its capacity. The cost of not adopting it grows every month.
              We are a people-first lab. We want to make the technology accessible and use it to do
              important things — saving lives, and saving your time, so we can all do more.
            </p>
            <p className="text-[16px] text-[#E3964C] leading-relaxed mb-4">
              We used this same AI to find you, research your organisation, read your annual reports,
              map your systems, and build this platform. That is lead generation.
              Imagine what it can do for your patients.
            </p>
            <p className="text-[16px] text-white/60 leading-relaxed">
              We want Netcare to become a partner in our work of making the technology accessible —
              and sharing the data and insights across to help the entire ecosystem.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Ecosystem Aggregation Map */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">Your Ecosystem</span>
          <h2 className="text-2xl font-light text-white mt-2">We aggregate. We do not replace.</h2>
        </div>

        {/* Existing systems */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {ECOSYSTEM.map((sys, i) => (
            <motion.div key={sys.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center backdrop-blur-sm">
              <div className="text-[11px] font-semibold text-white/80">{sys.name}</div>
              <div className="text-[9px] text-white/70 mt-0.5">{sys.sub}</div>
              <div className="text-[8px] text-[#3DA9D1] mt-1 font-medium">{sys.type}</div>
            </motion.div>
          ))}
        </div>

        {/* Aggregation arrow */}
        <div className="flex justify-center py-4">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
            className="w-px h-12 bg-gradient-to-b from-white/10 to-[#E3964C]" />
        </div>
        <div className="text-center mb-4">
          <span className="text-[10px] text-[#E3964C] uppercase tracking-widest font-semibold">VisioHealth OS Aggregation Layer</span>
        </div>
        <div className="flex justify-center py-2">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
            className="w-px h-8 bg-gradient-to-b from-[#E3964C] to-[#3DA9D1]" />
        </div>

        {/* Our AI tools */}
        <div className="grid grid-cols-5 gap-2">
          {AI_TOOLS.map((tool, i) => (
            <motion.div key={tool.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.06 }}
              className="p-3 rounded-lg bg-gradient-to-br from-[#3DA9D1]/10 to-[#E3964C]/5 border border-[#3DA9D1]/15 text-center">
              <div className="text-[10px] font-semibold text-white">{tool.name}</div>
              <div className="text-[8px] text-white/70 mt-0.5">{tool.desc}</div>
            </motion.div>
          ))}
        </div>

        <p className="text-[12px] text-white/70 text-center mt-6">
          Nothing gets replaced. Everything gets connected. Agentic AI tools built on top to automate the gaps.
        </p>
      </div>

      {/* Partnership Model */}
      <div className="px-8 max-w-5xl mx-auto py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] text-[#3DA9D1] uppercase tracking-widest font-semibold">The Model</span>
          <h2 className="text-2xl font-light text-white mt-2">How this works.</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { phase: "01", title: "We deploy. You host.", items: ["Full platform deployment", "AI claims + WhatsApp + dashboards", "Staff training included", "You cover: hosting, tokens, compute"], highlight: "Tools provided at no cost" },
            { phase: "02", title: "Ongoing partner.", items: ["Monthly cost infrastructure audits", "New features built continuously", "AI model training on your data", "Best practices advisory"], highlight: "Reasonable retainer" },
            { phase: "03", title: "Scale together.", items: ["Co-publish healthcare AI research", "Joint ventures on new products", "Share insights across ecosystem", "Netcare data + our AI = breakthroughs"], highlight: "True research partnership" },
          ].map((p, i) => (
            <motion.div key={p.phase} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <span className="text-[28px] font-extralight text-[#3DA9D1]/30">{p.phase}</span>
              <h3 className="text-[15px] font-semibold text-white mt-2 mb-3">{p.title}</h3>
              <div className="space-y-2 mb-4">
                {p.items.map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 text-[#3DA9D1]/50 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-white/60">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#E3964C] font-semibold">{p.highlight}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* The Promise */}
      <div className="px-8 max-w-4xl mx-auto py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="relative p-8 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E3964C]/5 to-[#3DA9D1]/10 rounded-2xl" />
          <div className="absolute inset-0 border border-white/[0.06] rounded-2xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-white mb-4">What we will build.</h3>
            <p className="text-[15px] text-white/50 leading-relaxed mb-4">
              We will probably build the best tools you have ever seen.
              We will unlock insights in the business you did not know existed.
              We will build additional tools and integrate them at no extra cost.
              Keep your costs low. Optimise across the board.
            </p>
            <p className="text-[15px] text-white/50 leading-relaxed mb-4">
              We have worked with doctors who have professionally consulted in the development
              of these products. That is our driver. And you can make requests too —
              we can safely implement anything your teams need.
            </p>
            <p className="text-[15px] text-[#E3964C]/80 leading-relaxed">
              We charge reasonably for using the tools. The research, the data, the insights —
              we would love to share all of it with you. Updates on new technologies across AI.
              Help with adoption. A true research partnership.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Why Now — Stats */}
      <div className="px-8 max-w-5xl mx-auto py-12">
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: "38.6%", label: "AI healthcare CAGR", sub: "Fastest growing technology in history" },
            { value: "53GB", label: "Your daily clinical data", sub: "One of Africa's richest datasets" },
            { value: "R95M+", label: "Annual savings addressable", sub: "The cost of inaction grows monthly" },
            { value: "77%", label: "Flexicare growth", sub: "Discovery is moving. Technology is the moat." },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="text-center p-4">
              <div className="text-3xl font-extralight text-white font-metric">{s.value}</div>
              <div className="text-[11px] text-white/60 mt-1 font-medium">{s.label}</div>
              <div className="text-[9px] text-white/70 mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* David's Sign-off */}
      <div className="px-8 max-w-3xl mx-auto py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3DA9D1]/20 to-[#E3964C]/10 border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-semibold text-lg">DH</span>
          </div>
          <p className="text-[16px] text-white/60 leading-relaxed italic max-w-2xl mx-auto mb-6">
            &ldquo;We are not here to sell you software. We are here to partner with you in making AI
            work for healthcare. We chose Netcare because you are South Africa&rsquo;s largest private
            healthcare provider. The combination of your scale and our AI capability can genuinely
            transform how 3.5 million people receive care. That is worth building together.&rdquo;
          </p>
          <p className="text-[14px] text-white font-semibold">David M. Hampton</p>
          <p className="text-[11px] text-white/70 mt-1">Managing Director, VisioCorp &middot; Founder, Visio Research Labs</p>

          <div className="flex items-center justify-center gap-6 mt-8 text-[11px] text-white/70">
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> davidhampton@visiocorp.co</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> visiocorp.co</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Johannesburg, SA</span>
          </div>
        </motion.div>
      </div>

      {/* Security bar */}
      <div className="px-8 max-w-5xl mx-auto pb-16">
        <div className="flex items-center justify-center gap-8 text-[10px] text-white/70">
          {["POPIA Compliant", "SA Hosting Available", "NDA Ready", "DPA Prepared", "FHIR Compatible"].map((t, i) => (
            <span key={t} className="flex items-center gap-1.5">
              {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-white/10" />}
              <Shield className="w-3 h-3" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
