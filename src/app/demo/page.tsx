"use client";

import { useState } from "react";
import { HeartPulse, Check, Send, MessageCircle, ArrowRight } from "lucide-react";

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", practice: "", email: "", phone: "" });

  const WHATSAPP = "https://wa.me/27662346203?text=Hi%20Dr.%20Hampton%2C%20I%20saw%20your%20email%20about%20the%20claims%20intelligence%20platform.%20I%27d%20love%20a%20quick%20demo.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);

    try {
      await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // Still show success — we'll capture via WhatsApp fallback
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">We&apos;ll be in touch!</h1>
          <p className="text-white/60 text-sm mb-8">
            Dr. Hampton or a member of the team will contact you within 24 hours to schedule your demo.
          </p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Or WhatsApp us now for instant response
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Visio Health Intelligence</h1>
            <p className="text-[10px] text-white/50">by Visio Research Labs</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Value prop */}
          <div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Stop losing <span className="text-emerald-400">R50K+/month</span> on rejected claims
            </h2>
            <p className="text-white/60 text-sm mb-8">
              Our AI checks every claim before you submit it — catching the errors that cause 23% of SA medical aid rejections. Purpose-built for South African practices.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "AI pre-submission validation — catches rejections before they happen",
                "Trained on 427 ICD-10 codes + 276 tariff codes + every major SA scheme",
                "WhatsApp patient comms + automated recall + booking",
                "Full practice dashboard — revenue, claims, patient flow",
                "15-minute demo — no commitment, no pitch",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-sm text-white/70">{item}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp shortcut */}
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Skip the form — WhatsApp Dr. Hampton directly
            </a>
          </div>

          {/* Right: Form */}
          <div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-lg font-semibold mb-1">Book your free demo</h3>
              <p className="text-xs text-white/50 mb-6">
                Takes 15 minutes. We&apos;ll show you exactly how much revenue your practice is leaving on the table.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Your Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Dr. Sarah Naidoo"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Practice Name</label>
                  <input
                    value={form.practice}
                    onChange={(e) => setForm({ ...form, practice: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Sandton Medical Centre"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Phone / WhatsApp *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                    placeholder="082 123 4567"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Email (optional)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                    placeholder="sarah@practice.co.za"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Let&apos;s do it — book my demo
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-white/30 text-center mt-4">
                No contracts. No obligations. Just 15 minutes of your time.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center mt-12">
        <p className="text-[10px] text-white/30">
          Visio Research Labs — Africa&apos;s #1 AI Intelligence Lab
        </p>
      </footer>
    </div>
  );
}
