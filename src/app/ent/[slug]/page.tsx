"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope, Calendar, Phone, MapPin, Star, ChevronRight,
  Activity, Shield, Award, Clock, Users, HeartPulse, Loader2,
  ArrowRight, CheckCircle2,
} from "lucide-react";

interface PracticeInfo {
  name: string;
  type: string;
  address: string;
  phone: string;
  primaryColor: string;
  tagline: string;
  logoUrl: string;
}

const SINUS_SERVICES = [
  {
    name: "Sinus Consultation",
    desc: "Comprehensive assessment of your sinus symptoms with nasal endoscopy",
    duration: "30 min",
    icon: Stethoscope,
  },
  {
    name: "FESS Surgery",
    desc: "Functional Endoscopic Sinus Surgery — the gold standard for chronic sinusitis",
    duration: "Day procedure",
    icon: Activity,
  },
  {
    name: "Balloon Sinuplasty",
    desc: "Minimally invasive sinus dilation — faster recovery, no cutting",
    duration: "Day procedure",
    icon: HeartPulse,
  },
  {
    name: "Septoplasty",
    desc: "Deviated septum correction to restore nasal breathing",
    duration: "Day procedure",
    icon: Shield,
  },
];

const SYMPTOMS_WE_TREAT = [
  "Chronic blocked nose",
  "Sinus headaches & facial pressure",
  "Post-nasal drip",
  "Loss of smell or taste",
  "Recurring sinus infections",
  "Nasal polyps",
  "Snoring & sleep apnea",
  "Deviated septum",
  "Allergic rhinitis / hay fever",
  "Ear infections & hearing loss",
  "Tonsillitis & adenoid problems",
  "Nosebleeds",
];

const STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "5000+", label: "Procedures Performed" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "4.9", label: "Google Rating" },
];

const FAQ = [
  {
    q: "Do I need a GP referral to see an ENT?",
    a: "You can book directly without a referral. However, some medical aids (like Discovery and GEMS) may require a GP referral for specialist reimbursement. Check with your scheme or ask us — we'll help you navigate it.",
  },
  {
    q: "What does an ENT consultation involve?",
    a: "The specialist will review your history, examine your ears, nose, and throat, and may perform a nasal endoscopy (a quick, painless camera examination). Based on findings, they'll discuss treatment options — from medication to surgery if needed.",
  },
  {
    q: "Is sinus surgery painful?",
    a: "Modern sinus surgery (FESS) is performed under general anaesthesia — you won't feel anything during the procedure. Post-operative discomfort is manageable with standard pain medication. Most patients return to work within 5-7 days.",
  },
  {
    q: "Does my medical aid cover sinus surgery?",
    a: "Most medical aid plans cover FESS and related procedures when medically indicated. We handle pre-authorisation on your behalf. Self-pay options are also available.",
  },
  {
    q: "How do I know if I need surgery vs medication?",
    a: "Most sinus problems are treated with medication first (nasal sprays, antibiotics). Surgery is considered when medical treatment fails after 3-6 months, or when structural issues (polyps, deviated septum) are present. The consultation will determine the best path.",
  },
];

export default function ENTLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [practice, setPractice] = useState<PracticeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { params.then(p => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/availability?slug=${slug}&info=true`)
      .then(r => r.json())
      .then(data => {
        if (data.practice) setPractice(data.practice);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const pc = practice?.primaryColor || "#D4AF37";
  const name = practice?.name || "ENT Specialist";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: pc + "20" }}>
              <Stethoscope className="w-4 h-4" style={{ color: pc }} />
            </div>
            <span className="text-sm font-semibold">{name}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`/check/${slug}`} className="text-xs text-white/50 hover:text-white/80 hidden sm:inline">Symptom Checker</a>
            <a href={`tel:${practice?.phone || ""}`} className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1">
              <Phone className="w-3 h-3" /> Call
            </a>
            <a
              href={`/book/${slug}`}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-black"
              style={{ backgroundColor: pc }}
            >
              Book Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 mb-6">
              <Award className="w-3 h-3" style={{ color: pc }} />
              ENT Specialist &middot; Sinus &amp; Nasal Surgery
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Breathe freely.<br />
              <span style={{ color: pc }}>Live fully.</span>
            </h1>
            <p className="text-lg text-white/50 mb-8 max-w-lg">
              Expert diagnosis and treatment for sinus, ear, nose &amp; throat conditions.
              From chronic sinusitis to sleep apnea — get the care you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`/book/${slug}`}
                className="px-8 py-3.5 rounded-xl text-sm font-semibold text-black flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor: pc }}
              >
                <Calendar className="w-4 h-4" /> Book a Consultation
              </a>
              <a
                href={`/check/${slug}`}
                className="px-8 py-3.5 rounded-xl text-sm font-medium border border-white/10 text-white/70 hover:bg-white/[0.03] flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" /> Check Your Symptoms
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: pc }}>{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Symptoms We Treat */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Symptoms We Treat</h2>
          <p className="text-sm text-white/40 text-center mb-10">If any of these sound familiar, we can help</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SYMPTOMS_WE_TREAT.map(symptom => (
              <div key={symptom} className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: pc }} />
                <span className="text-xs text-white/70">{symptom}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href={`/check/${slug}`}
              className="inline-flex items-center gap-2 text-sm hover:underline"
              style={{ color: pc }}
            >
              Not sure? Try our AI Symptom Checker <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white/[0.01] border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Our Services</h2>
          <p className="text-sm text-white/40 text-center mb-10">Advanced ENT procedures with proven results</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SINUS_SERVICES.map(service => {
              const Icon = service.icon;
              return (
                <div key={service.name} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: pc + "15" }}>
                      <Icon className="w-5 h-5" style={{ color: pc }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{service.name}</h3>
                      <p className="text-xs text-white/50 mb-2">{service.desc}</p>
                      <div className="flex items-center gap-3 text-[10px] text-white/30">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-10 text-center">Why Choose Us</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Award,
                title: "Fellowship-Trained Specialist",
                desc: "Head of ENT at Nelson Mandela Children's Hospital with advanced training in sinus and skull base surgery.",
              },
              {
                icon: Users,
                title: "Patient-First Approach",
                desc: "Thorough consultations, clear explanations, and treatment plans tailored to your needs and budget.",
              },
              {
                icon: Star,
                title: "World-Class Facilities",
                desc: "Operating at Netcare Park Lane Hospital — one of Johannesburg's premier surgical facilities.",
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center p-6">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: pc + "15" }}>
                    <Icon className="w-6 h-6" style={{ color: pc }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white/[0.01] border-y border-white/10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Common Questions</h2>
          <p className="text-sm text-white/40 text-center mb-10">Everything you need to know before your visit</p>
          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="overflow-hidden">
                    <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GP Referral CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Referring a Patient?</h2>
          <p className="text-sm text-white/50 mb-6">
            GPs: use our digital referral portal for seamless patient handoff.
            We&apos;ll send you a consultation report after every visit.
          </p>
          <a
            href={`/refer/${slug}`}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold border-2 hover:bg-white/[0.03] transition-all"
            style={{ borderColor: pc, color: pc }}
          >
            <Stethoscope className="w-4 h-4" /> GP Referral Portal
          </a>
        </div>
      </section>

      {/* Location + CTA */}
      <section className="py-16 bg-white/[0.01] border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          {practice?.address && (
            <div className="flex items-center justify-center gap-2 text-sm text-white/50 mb-6">
              <MapPin className="w-4 h-4" />
              {practice.address}
            </div>
          )}
          <h2 className="text-3xl font-bold mb-4">Ready to breathe better?</h2>
          <p className="text-sm text-white/50 mb-8">Book your consultation today. Most patients are seen within 1-2 weeks.</p>
          <a
            href={`/book/${slug}`}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold text-black hover:opacity-90"
            style={{ backgroundColor: pc }}
          >
            <Calendar className="w-5 h-5" /> Book Now
          </a>
          {practice?.phone && (
            <p className="text-xs text-white/30 mt-4">
              Or call us at <a href={`tel:${practice.phone}`} className="underline hover:text-white/50">{practice.phone}</a>
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-white/20">Powered by Netcare Health OS Ops</p>
          <div className="flex items-center gap-6 text-[10px] text-white/20">
            <a href={`/book/${slug}`} className="hover:text-white/40">Book</a>
            <a href={`/check/${slug}`} className="hover:text-white/40">Symptom Checker</a>
            <a href={`/refer/${slug}`} className="hover:text-white/40">GP Referral</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
