"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Building2, Palette, Bot, Globe, CreditCard,
  Check, AlertTriangle, Loader2, Copy, Eye, EyeOff,
  ChevronRight, Shield, Send, FileText,
} from "lucide-react";

interface OnboardResult {
  success: boolean;
  practice: { id: string; name: string; plan: string; subdomain: string };
  user: { id: string; email: string; credential: string };
  message: string;
}

const PRACTICE_TYPES = [
  { value: "dental", label: "Dental Practice" },
  { value: "gp", label: "General Practice (GP)" },
  { value: "radiology", label: "Radiology" },
  { value: "wellness", label: "Wellness / Aesthetic" },
  { value: "physiotherapy", label: "Physiotherapy" },
  { value: "optometry", label: "Optometry" },
  { value: "dermatology", label: "Dermatology" },
  { value: "ent", label: "ENT Specialist" },
  { value: "orthopaedic", label: "Orthopaedic" },
  { value: "paediatric", label: "Paediatric" },
  { value: "psychiatric", label: "Psychiatric / Psychology" },
  { value: "cardiology", label: "Cardiology" },
  { value: "hospital", label: "Hospital / Clinic Group" },
  { value: "salon", label: "Beauty Salon / Spa" },
  { value: "other", label: "Other" },
];

const AI_PERSONALITIES = [
  { value: "professional", label: "Professional", desc: "Formal, clinical, precise. Best for specialists & hospitals." },
  { value: "friendly", label: "Friendly", desc: "Warm, approachable, conversational. Best for GP & wellness." },
  { value: "concise", label: "Concise", desc: "Short, efficient, to-the-point. Best for high-volume practices." },
  { value: "empathetic", label: "Empathetic", desc: "Caring, supportive, patient-first. Best for mental health & paediatrics." },
];

const BOT_TYPES = [
  { value: "healthcare_assistant", label: "Healthcare Assistant", desc: "General-purpose: bookings, reminders, follow-ups, triage. Suits most practices." },
  { value: "dental_specialist", label: "Dental Specialist", desc: "Dental-specific terminology, procedure prep instructions, post-op care." },
  { value: "wellness_concierge", label: "Wellness Concierge", desc: "Luxury tone, treatment menus, product recommendations, aftercare." },
  { value: "radiology_intake", label: "Radiology Intake", desc: "Pre-scan checklists, contrast prep, referral verification, results delivery." },
  { value: "gp_triage", label: "GP Triage & Booking", desc: "Symptom assessment, urgency routing, slot recommendations, chronic med reminders." },
  { value: "custom", label: "Custom Bot", desc: "We will configure a bespoke bot based on your practice unique workflows." },
];

const PLANS = [
  { value: "starter", label: "Starter", price: "R2,999.99", setup: "R5,000", term: "3-month min", color: "#E8C84A", leads: 20 },
  { value: "core", label: "Core", price: "R15,000", setup: "R15,000", term: "12-month min", color: "#3b82f6", leads: 50 },
  { value: "professional", label: "Professional", price: "R35,000", setup: "R25,000", term: "12-month min", color: "#16a34a", leads: 100, recommended: true },
  { value: "enterprise", label: "Enterprise", price: "R55,000", setup: "R40,000", term: "24-month min", color: "#8B5CF6", leads: 200 },
];

const DOMAIN_OPTIONS = [
  { value: "subdomain", label: "Free Subdomain", desc: "practicename.healthops.co.za" },
  { value: "custom_cname", label: "Custom Domain (CNAME)", desc: "bookings.your-practice.co.za" },
  { value: "full_domain", label: "Full Domain Delegation", desc: "your-practice.co.za (premium)" },
];

const STEPS = [
  { id: 1, label: "Practice Details", icon: Building2 },
  { id: 2, label: "Branding", icon: Palette },
  { id: 3, label: "AI Bot Setup", icon: Bot },
  { id: 4, label: "Plan & Domain", icon: Globe },
  { id: 5, label: "Review & Send", icon: Send },
];

function Field({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      <input
        type={type || "text"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20 focus:border-[#3DA9D1]"
      />
    </div>
  );
}

function ReviewSection({ title, items, colorPreview }: { title: string; items: [string, string][]; colorPreview?: string }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-2 mb-3">
        {colorPreview && <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: colorPreview }} />}
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="space-y-1.5">
        {items.map(([label, val]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-900 font-medium text-right max-w-[60%] truncate">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOnboardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OnboardResult | null>(null);
  const [error, setError] = useState("");
  const [showCred, setShowCred] = useState(false);
  const [copied, setCopied] = useState("");

  const [form, setForm] = useState({
    practiceName: "",
    practiceType: "dental",
    doctorName: "",
    doctorEmail: "",
    doctorPhone: "",
    address: "",
    hours: "Mon-Fri 08:00-17:00, Sat 08:00-13:00",
    specialty: "",
    primaryColor: "#16a34a",
    secondaryColor: "#2DD4BF",
    subdomain: "",
    tagline: "",
    logoUrl: "",
    aiPersonality: "professional",
    botType: "healthcare_assistant",
    plan: "professional",
    domainPreference: "subdomain",
    notes: "",
  });

  function updateForm(key: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "practiceName") {
        next.subdomain = value.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!prev.tagline) next.tagline = value + " — Powered by Netcare Health OS";
      }
      return next;
    });
  }

  async function handleOnboard() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");
      setResult({
        success: data.success,
        practice: data.practice,
        user: { id: data.user.id, email: data.user.email, credential: data.user.tempCredential },
        message: data.message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  }

  const canProceed = step === 1 ? !!form.practiceName && !!form.doctorName && !!form.doctorEmail : true;

  if (result) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border-2 border-[#3DA9D1] bg-[#3DA9D1] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#3DA9D1] flex items-center justify-center"><Check className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-[#1A2F3E]">Practice Onboarded</h2>
              <p className="text-sm text-[#1D3443]">{result.message}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-[#3DA9D1]">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Practice Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">Name:</span> <span className="font-medium text-gray-900">{result.practice.name}</span></div>
                <div><span className="text-gray-400">Plan:</span> <span className="font-medium text-gray-900 capitalize">{result.practice.plan}</span></div>
                <div><span className="text-gray-400">Subdomain:</span> <span className="font-medium text-gray-900">{result.practice.subdomain}.healthops.co.za</span></div>
                <div><span className="text-gray-400">ID:</span> <span className="font-mono text-xs text-gray-500">{result.practice.id}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-gray-700">Login Credentials (sent via email)</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-900">{result.user.email}</span></div>
                  <button onClick={() => copyText(result.user.email, "email")} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> {copied === "email" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Temp credential:</span>
                    <span className="font-mono font-medium text-gray-900">{showCred ? result.user.credential : "············"}</span>
                    <button onClick={() => setShowCred(!showCred)} className="text-gray-400 hover:text-gray-600">
                      {showCred ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button onClick={() => copyText(result.user.credential, "cred")} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Copy className="w-3 h-3" /> {copied === "cred" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Next Steps</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">1.</span> Verify the doctor received the welcome email</li>
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">2.</span> Connect Twilio WhatsApp number to this practice</li>
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">3.</span> Pre-load qualified leads into the practice</li>
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">4.</span> Configure the AI bot personality and responses</li>
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">5.</span> Send NDA + Commercial Agreement for signature</li>
                <li className="flex items-start gap-2"><span className="font-bold text-[#3DA9D1] shrink-0">6.</span> Schedule 30-day onboarding check-in calls</li>
              </ol>
            </div>
            <div className="flex gap-3 pt-2">
              <a href="/admin/practices" className="flex-1 text-center py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">View All Practices</a>
              <button onClick={() => { setResult(null); setStep(1); }} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Onboard Another</button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-5 h-5 text-[#3DA9D1]" />
        <h1 className="text-lg font-bold text-gray-900">Onboard New Practice</h1>
        <span className="text-xs text-gray-400 ml-auto">Step {step} of {STEPS.length}</span>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full ${
                s.id === step ? "bg-[#3DA9D1] text-[#1D3443] border border-[#3DA9D1]"
                  : s.id < step ? "bg-[#3DA9D1] text-white cursor-pointer"
                  : "bg-gray-50 text-gray-400 border border-gray-100"
              }`}
            >
              <s.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline truncate">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 mx-0.5" />}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3DA9D1]" /> Practice & Doctor Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Practice Name *" value={form.practiceName} onChange={v => updateForm("practiceName", v)} placeholder="e.g. Dr Lamola Practice" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Practice Type *</label>
                <select value={form.practiceType} onChange={e => updateForm("practiceType", e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20 focus:border-[#3DA9D1]">
                  {PRACTICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <Field label="Doctor Full Name *" value={form.doctorName} onChange={v => updateForm("doctorName", v)} placeholder="e.g. Dr Lamola" />
              <Field label="Doctor Email *" value={form.doctorEmail} onChange={v => updateForm("doctorEmail", v)} placeholder="e.g. doctor@practice.co.za" type="email" />
              <Field label="Phone Number" value={form.doctorPhone} onChange={v => updateForm("doctorPhone", v)} placeholder="e.g. +27 82 123 4567" />
              <Field label="Specialty" value={form.specialty} onChange={v => updateForm("specialty", v)} placeholder="e.g. Orthodontics" />
              <div className="col-span-2"><Field label="Practice Address" value={form.address} onChange={v => updateForm("address", v)} placeholder="e.g. 123 Rivonia Road, Sandton" /></div>
              <div className="col-span-2"><Field label="Operating Hours" value={form.hours} onChange={v => updateForm("hours", v)} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Palette className="w-4 h-4 text-[#3DA9D1]" /> White-Label Branding</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Primary Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.primaryColor} onChange={e => updateForm("primaryColor", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <input type="text" value={form.primaryColor} onChange={e => updateForm("primaryColor", e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Secondary Color</label>
                <div className="flex gap-2">
                  <input type="color" value={form.secondaryColor} onChange={e => updateForm("secondaryColor", e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <input type="text" value={form.secondaryColor} onChange={e => updateForm("secondaryColor", e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20" />
                </div>
              </div>
              <Field label="Subdomain" value={form.subdomain} onChange={v => updateForm("subdomain", v)} placeholder="Auto-generated" />
              <Field label="Logo URL" value={form.logoUrl} onChange={v => updateForm("logoUrl", v)} placeholder="https://..." />
              <div className="col-span-2"><Field label="Tagline" value={form.tagline} onChange={v => updateForm("tagline", v)} placeholder="e.g. Your smile, our priority" /></div>
            </div>
            <div className="mt-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 mb-3">Live Preview</p>
              <div className="rounded-lg overflow-hidden shadow-sm">
                <div style={{ backgroundColor: form.primaryColor }} className="px-5 py-3"><span className="text-white font-semibold text-sm">{form.practiceName || "Practice Name"}</span></div>
                <div className="bg-white p-4">
                  <p className="text-sm text-gray-500">{form.tagline || "Tagline"}</p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">{form.subdomain || "subdomain"}.healthops.co.za</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Bot className="w-4 h-4 text-[#3DA9D1]" /> AI Bot Configuration</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">Bot Personality</label>
              <div className="grid grid-cols-2 gap-3">
                {AI_PERSONALITIES.map(p => (
                  <button key={p.value} onClick={() => updateForm("aiPersonality", p.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${form.aiPersonality === p.value ? "border-[#3DA9D1] bg-[#3DA9D1] ring-2 ring-[#3DA9D1]/20" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className={`text-sm font-semibold ${form.aiPersonality === p.value ? "text-[#1D3443]" : "text-gray-900"}`}>{p.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">WhatsApp Bot Type</label>
              <div className="grid grid-cols-2 gap-3">
                {BOT_TYPES.map(b => (
                  <button key={b.value} onClick={() => updateForm("botType", b.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${form.botType === b.value ? "border-purple-400 bg-purple-50 ring-2 ring-purple-500/20" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className={`text-sm font-semibold ${form.botType === b.value ? "text-purple-700" : "text-gray-900"}`}>{b.label}</span>
                    <p className="text-xs text-gray-500 mt-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-800"><strong>Note:</strong> The bot will be pre-loaded by our team within 24 hours. The doctor selects the type — we handle Twilio connection and training.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#3DA9D1]" /> Subscription Plan & Domain</h2>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">Subscription Plan</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {PLANS.map(p => (
                  <button key={p.value} onClick={() => updateForm("plan", p.value)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${form.plan === p.value ? "border-2 ring-2 ring-opacity-20" : "border-gray-200 hover:border-gray-300"}`}
                    style={form.plan === p.value ? { borderColor: p.color, boxShadow: `0 0 0 4px ${p.color}20` } : {}}>
                    {"recommended" in p && p.recommended && <span className="absolute -top-2 right-3 px-2 py-0.5 bg-[#3DA9D1] text-white text-[10px] font-bold rounded-full">RECOMMENDED</span>}
                    <span className="text-sm font-bold text-gray-900">{p.label}</span>
                    <div className="mt-2"><span className="text-lg font-bold" style={{ color: p.color }}>{p.price}</span><span className="text-xs text-gray-400">/month</span></div>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <p>Setup: {p.setup}</p><p>{p.term}</p><p className="font-medium text-gray-700">{p.leads} leads included</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-3">Domain Preference</label>
              <div className="space-y-2">
                {DOMAIN_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => updateForm("domainPreference", d.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${form.domainPreference === d.value ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500/20" : "border-gray-200 hover:border-gray-300"}`}>
                    <Globe className={`w-5 h-5 shrink-0 ${form.domainPreference === d.value ? "text-blue-600" : "text-gray-400"}`} />
                    <div>
                      <span className={`text-sm font-semibold ${form.domainPreference === d.value ? "text-blue-700" : "text-gray-900"}`}>{d.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Internal Notes</label>
              <textarea value={form.notes} onChange={e => updateForm("notes", e.target.value)} rows={3} placeholder="Internal notes (not sent to doctor)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/20 resize-none" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Send className="w-4 h-4 text-[#3DA9D1]" /> Review & Onboard</h2>
            <div className="grid grid-cols-2 gap-4">
              <ReviewSection title="Practice" items={[["Name", form.practiceName], ["Type", PRACTICE_TYPES.find(t => t.value === form.practiceType)?.label || form.practiceType], ["Doctor", form.doctorName], ["Email", form.doctorEmail], ["Phone", form.doctorPhone || "—"], ["Address", form.address || "—"]]} />
              <ReviewSection title="Branding" items={[["Primary Color", form.primaryColor], ["Subdomain", form.subdomain + ".healthops.co.za"], ["Tagline", form.tagline || "—"]]} colorPreview={form.primaryColor} />
              <ReviewSection title="AI Bot" items={[["Personality", AI_PERSONALITIES.find(p => p.value === form.aiPersonality)?.label || form.aiPersonality], ["Bot Type", BOT_TYPES.find(b => b.value === form.botType)?.label || form.botType]]} />
              <ReviewSection title="Plan & Domain" items={[["Plan", (PLANS.find(p => p.value === form.plan)?.label || "") + " — " + (PLANS.find(p => p.value === form.plan)?.price || "") + "/mo"], ["Setup Fee", PLANS.find(p => p.value === form.plan)?.setup || "—"], ["Leads", (PLANS.find(p => p.value === form.plan)?.leads || 0) + " pre-loaded"], ["Domain", DOMAIN_OPTIONS.find(d => d.value === form.domainPreference)?.label || form.domainPreference]]} />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-blue-800">When you click Onboard Practice:</p>
              <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                <li>Practice created in database with all details</li>
                <li>Admin user account created with temporary credentials</li>
                <li>Welcome email sent to <strong>{form.doctorEmail}</strong> with login info, ToS, features</li>
                <li>Client pipeline entry created for tracking</li>
                <li>Alert sent to Dr. Hampton</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-gray-500" /><p className="text-xs font-semibold text-gray-700">Legal Documents (send separately)</p></div>
              <ul className="text-xs text-gray-600 space-y-1 ml-6 list-disc">
                <li>Non-Disclosure Agreement (NDA)</li>
                <li>Memorandum of Understanding (MoU)</li>
                <li>IP Assignment & Protection Agreement</li>
                <li>Service Level Agreement (SLA)</li>
                <li>Commercial Terms of Engagement</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Back</button>
          {step < STEPS.length ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed} className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleOnboard} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-[#3DA9D1] text-white rounded-xl text-sm font-semibold hover:bg-[#1D3443] disabled:opacity-60 transition-colors shadow-lg shadow-[#3DA9D1]/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? "Onboarding..." : "Onboard Practice"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
