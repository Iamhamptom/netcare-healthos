"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";

interface IndustryPageProps {
  name: string;
  tagline: string;
  color: string;
  icon: LucideIcon;
  description: string;
  painPoints: string[];
  solutions: { title: string; description: string; icon: LucideIcon }[];
  workflows: { step: string; description: string }[];
  testimonialQuote?: string;
  testimonialAuthor?: string;
}

export default function IndustryPage({
  name, tagline, color, icon: Icon, description, painPoints, solutions, workflows, testimonialQuote, testimonialAuthor,
}: IndustryPageProps) {
  return (
    <>
      <Navbar />
      <div className="pt-24 bg-[#050505]">
        {/* Hero */}
        <section className="px-6 md:px-12 lg:px-24 py-20 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-xs tracking-[0.3em] uppercase" style={{ color }}>{name}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl text-[#FDFCF0] uppercase tracking-wider mb-4">{tagline}</h1>
              <p className="text-[#FDFCF0]/50 text-sm md:text-base leading-relaxed mb-8">{description}</p>
              <div className="flex gap-4">
                <Link href="/register" className="px-8 py-3 bg-[#D4AF37] text-[#050505] uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#FDFCF0] transition-colors">
                  Start Free Trial
                </Link>
                <Link href="/how-it-works" className="px-8 py-3 border border-white/10 text-[#FDFCF0]/60 uppercase tracking-[0.2em] text-xs font-bold hover:border-white/20 transition-colors flex items-center gap-2">
                  All Industries <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="text-sm font-semibold text-[#FDFCF0] mb-4 uppercase tracking-wider">Common Pain Points We Solve</h3>
                <div className="space-y-3">
                  {painPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                      <span className="text-[13px] text-[#FDFCF0]/60">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solutions */}
        <section className="px-6 md:px-12 lg:px-24 py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl text-[#FDFCF0] uppercase tracking-wider text-center mb-12">
              Built for <span style={{ color }}>{name}s</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solutions.map((sol, i) => (
                <motion.div
                  key={sol.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-panel p-6"
                >
                  <sol.icon className="w-6 h-6 mb-3" style={{ color }} />
                  <h3 className="text-sm font-semibold text-[#FDFCF0] mb-2">{sol.title}</h3>
                  <p className="text-[12px] text-[#FDFCF0]/40 leading-relaxed">{sol.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="px-6 md:px-12 lg:px-24 py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl text-[#FDFCF0] uppercase tracking-wider text-center mb-12">
              Your <span style={{ color }}>Daily Workflow</span>
            </h2>
            <div className="space-y-4">
              {workflows.map((wf, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 glass-panel p-5"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold" style={{ backgroundColor: `${color}15`, color }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#FDFCF0] mb-1">{wf.step}</h3>
                    <p className="text-[12px] text-[#FDFCF0]/40">{wf.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        {testimonialQuote && (
          <section className="px-6 md:px-12 lg:px-24 py-20 border-t border-white/5">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-4xl mb-6" style={{ color }}>&ldquo;</div>
              <p className="text-lg text-[#FDFCF0]/70 italic leading-relaxed mb-4">{testimonialQuote}</p>
              {testimonialAuthor && <p className="text-sm" style={{ color }}>— {testimonialAuthor}</p>}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-6 md:px-12 lg:px-24 py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl text-[#FDFCF0] uppercase tracking-wider mb-6">
              Ready to Transform Your <span style={{ color }}>{name}</span>?
            </h2>
            <p className="text-[#FDFCF0]/40 text-sm mb-8">14-day free trial. Full AI automation. Set up in 10 minutes.</p>
            <Link href="/register" className="inline-block px-10 py-4 bg-[#D4AF37] text-[#050505] uppercase tracking-[0.3em] text-xs font-bold hover:bg-[#FDFCF0] transition-colors">
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
