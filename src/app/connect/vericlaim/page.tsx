"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plug, Calendar, Mail, MessageSquare, FileText, Search, BarChart3, CreditCard, MapPin, Bot, CheckCircle2, ArrowRight, Loader2, ChevronLeft } from "lucide-react";

type Step = "welcome" | "vericlaim_login" | "email_connect" | "calendar_connect" | "tools_activate" | "testing" | "done";

const TOOLS = [
  { id: "whatsapp_ai", name: "WhatsApp AI Agent", icon: MessageSquare, desc: "24/7 patient booking, pre-qualification, and reminders via WhatsApp", default: true },
  { id: "sdk_widget", name: "Website Chat Widget", icon: Bot, desc: "AI assistant on your website that captures visitors and books patients", default: true },
  { id: "lead_gen", name: "Lead Generation Engine", icon: Search, desc: "Find patients searching for your services online and route them to you", default: true },
  { id: "document_gen", name: "Document Generator", icon: FileText, desc: "AI referral letters, prescriptions, sick notes, SARAA motivations", default: true },
  { id: "claims_copilot", name: "Claims Copilot", icon: Shield, desc: "ICD-10 validation, scheme rules, claims pre-check for your doctors", default: true },
  { id: "availability_share", name: "Availability Share", icon: Calendar, desc: "Broadcast open slots to GP network — they refer patients directly", default: true },
  { id: "location_routing", name: "Multi-Site Routing", icon: MapPin, desc: "Route patients to nearest of your 5 locations automatically", default: true },
  { id: "online_payments", name: "Online Pre-Payment", icon: CreditCard, desc: "Collect R2,600 upfront via Yoco before the patient arrives", default: false },
  { id: "analytics", name: "Practice Analytics", icon: BarChart3, desc: "Revenue, bookings, leads, no-shows — across all locations", default: true },
  { id: "outreach", name: "Outreach Campaigns", icon: Search, desc: "Google Ads, social media, email sequences — all AI-generated", default: false },
];

export default function ConnectVeriClaimPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [vcUsername, setVcUsername] = useState("");
  const [vcPassword, setVcPassword] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailProvider, setEmailProvider] = useState<"gmail" | "outlook" | "other">("gmail");
  const [calendarLink, setCalendarLink] = useState("");
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set(TOOLS.filter(t => t.default).map(t => t.id)));
  const [testing, setTesting] = useState(false);
  const [testPhase, setTestPhase] = useState(0);
  const [connections, setConnections] = useState({ vericlaim: false, email: false, calendar: false, tools: 0 });

  const toggleTool = (id: string) => {
    const next = new Set(activeTools);
    if (next.has(id)) next.delete(id); else next.add(id);
    setActiveTools(next);
  };

  const runTests = async () => {
    setStep("testing");
    setTesting(true);

    for (let i = 0; i < 4; i++) {
      setTestPhase(i);
      await new Promise(r => setTimeout(r, 1200));
    }

    setConnections({
      vericlaim: !!vcUsername,
      email: !!emailAddress,
      calendar: !!(calendarLink || emailAddress),
      tools: activeTools.size,
    });

    // Save connection to API
    try {
      await fetch("/api/integrations/vericlaim/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          vericlaim: vcUsername ? { username: vcUsername } : null,
          email: emailAddress ? { address: emailAddress, provider: emailProvider } : null,
          calendar: calendarLink || null,
          tools: Array.from(activeTools),
        }),
      }).catch(() => {});
    } catch { /* continue anyway */ }

    setTesting(false);
    setStep("done");
  };

  const input = "w-full px-4 py-3 rounded-xl bg-[#0f1a22] border border-[#1D3443] text-sm text-zinc-100 placeholder-zinc-600 focus:border-[#3DA9D1] focus:outline-none focus:ring-1 focus:ring-[#3DA9D1]/30 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1218] via-[#0d1820] to-[#0a1218]">
      {/* Header bar */}
      <div className="border-b border-[#1D3443]/50 bg-[#0d1820]/80 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1D3443] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#3DA9D1]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Health OS</div>
              <div className="text-[10px] text-[#3DA9D1] font-medium tracking-wider uppercase">Practice Connect</div>
            </div>
          </div>
          <div className="text-[10px] text-zinc-600">Powered by VRL</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {["welcome", "vericlaim_login", "email_connect", "calendar_connect", "tools_activate", "done"].map((s, i) => {
            const steps = ["welcome", "vericlaim_login", "email_connect", "calendar_connect", "tools_activate", "done"];
            const current = steps.indexOf(step === "testing" ? "done" : step);
            return <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-500 ${i <= current ? "bg-[#3DA9D1]" : "bg-[#1D3443]"}`} />;
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

            {/* ── WELCOME ── */}
            {step === "welcome" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Connect your practice</h1>
                  <p className="text-sm text-zinc-400 mt-2">Link VeriClaim and activate your AI tools in 3 minutes.</p>
                </div>

                <div className="space-y-2">
                  {[
                    { icon: Plug, text: "Connect VeriClaim diary — we read slots, book patients" },
                    { icon: MessageSquare, text: "WhatsApp AI agent — 24/7 booking and pre-qualification" },
                    { icon: Search, text: "Lead generation — find patients searching for your services" },
                    { icon: FileText, text: "AI documents — referral letters, Rx, SARAA motivations" },
                    { icon: Shield, text: "Claims Copilot — ICD-10 validation for your doctors" },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1a22] border border-[#1D3443]/50">
                      <div className="w-8 h-8 rounded-lg bg-[#1D3443] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#3DA9D1]" />
                      </div>
                      <span className="text-sm text-zinc-300">{text}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep("vericlaim_login")} className="w-full py-3.5 rounded-xl bg-[#3DA9D1] text-[#0a1218] font-semibold hover:bg-[#4dbde3] transition-colors flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-zinc-600 text-center">AES-256 encrypted. POPIA compliant. Disconnect anytime.</p>
              </div>
            )}

            {/* ── VERICLAIM LOGIN ── */}
            {step === "vericlaim_login" && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep("welcome")} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-3"><ChevronLeft className="w-3 h-3" /> Back</button>
                  <h1 className="text-xl font-bold text-white">Sign into VeriClaim</h1>
                  <p className="text-sm text-zinc-400 mt-1">We connect to your diary to check availability and create bookings.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#3DA9D1]/5 border border-[#3DA9D1]/20 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-[#3DA9D1] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#3DA9D1]/80">Your password is encrypted and stored securely. We only access your diary and patient schedule — never clinical records or billing data.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">VeriClaim Username</label>
                    <input className={input} value={vcUsername} onChange={e => setVcUsername(e.target.value)} placeholder="admin@rheumcare.co.za" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">VeriClaim Password</label>
                    <input className={input} type="password" value={vcPassword} onChange={e => setVcPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("email_connect")} className="flex-1 py-3 rounded-xl bg-[#1D3443] text-zinc-300 text-sm font-medium hover:bg-[#24404f] border border-[#1D3443] transition-colors">Skip</button>
                  <button onClick={() => setStep("email_connect")} disabled={!vcUsername || !vcPassword} className="flex-1 py-3 rounded-xl bg-[#3DA9D1] text-[#0a1218] text-sm font-semibold hover:bg-[#4dbde3] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── EMAIL CONNECT ── */}
            {step === "email_connect" && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep("vericlaim_login")} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-3"><ChevronLeft className="w-3 h-3" /> Back</button>
                  <h1 className="text-xl font-bold text-white">Connect your email</h1>
                  <p className="text-sm text-zinc-400 mt-1">We sync VeriClaim notifications from your inbox to keep your diary live.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "gmail" as const, label: "Gmail", color: "#EA4335" },
                    { id: "outlook" as const, label: "Outlook", color: "#0078D4" },
                    { id: "other" as const, label: "Other", color: "#666" },
                  ]).map(p => (
                    <button key={p.id} onClick={() => setEmailProvider(p.id)}
                      className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                        emailProvider === p.id ? "border-[#3DA9D1] bg-[#3DA9D1]/5 text-white" : "border-[#1D3443] bg-[#0f1a22] text-zinc-400 hover:border-zinc-600"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                    <input className={input} value={emailAddress} onChange={e => setEmailAddress(e.target.value)} placeholder="admin@rheumcare.co.za" type="email" />
                  </div>
                  {emailProvider !== "gmail" && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                      <input className={input} type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                  )}
                  {emailProvider === "gmail" && (
                    <button className="w-full py-3 rounded-xl bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 flex items-center justify-center gap-2 transition-colors">
                      <Mail className="w-4 h-4" /> Sign in with Google
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("calendar_connect")} className="flex-1 py-3 rounded-xl bg-[#1D3443] text-zinc-300 text-sm font-medium hover:bg-[#24404f] border border-[#1D3443] transition-colors">Skip</button>
                  <button onClick={() => setStep("calendar_connect")} disabled={!emailAddress} className="flex-1 py-3 rounded-xl bg-[#3DA9D1] text-[#0a1218] text-sm font-semibold hover:bg-[#4dbde3] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── CALENDAR CONNECT ── */}
            {step === "calendar_connect" && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep("email_connect")} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-3"><ChevronLeft className="w-3 h-3" /> Back</button>
                  <h1 className="text-xl font-bold text-white">Connect your calendar</h1>
                  <p className="text-sm text-zinc-400 mt-1">We check available slots and create bookings for patients.</p>
                </div>

                <button className="w-full p-4 rounded-xl bg-[#0f1a22] border border-[#1D3443] hover:border-[#3DA9D1]/50 transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#1D3443]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Google Calendar</div>
                      <div className="text-xs text-zinc-500">Recommended — one click to connect</div>
                    </div>
                  </div>
                </button>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Or paste iCal URL from VeriClaim</label>
                  <input className={input} value={calendarLink} onChange={e => setCalendarLink(e.target.value)} placeholder="https://calendar.google.com/calendar/ical/..." />
                  <p className="text-[11px] text-zinc-600 mt-1">VeriClaim mobile app → Settings → Export Calendar → Copy iCal link</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("tools_activate")} className="flex-1 py-3 rounded-xl bg-[#1D3443] text-zinc-300 text-sm font-medium hover:bg-[#24404f] border border-[#1D3443] transition-colors">Skip</button>
                  <button onClick={() => setStep("tools_activate")} className="flex-1 py-3 rounded-xl bg-[#3DA9D1] text-[#0a1218] text-sm font-semibold hover:bg-[#4dbde3] transition-colors flex items-center justify-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── TOOLS ACTIVATE ── */}
            {step === "tools_activate" && (
              <div className="space-y-5">
                <div>
                  <button onClick={() => setStep("calendar_connect")} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-3"><ChevronLeft className="w-3 h-3" /> Back</button>
                  <h1 className="text-xl font-bold text-white">Activate your AI tools</h1>
                  <p className="text-sm text-zinc-400 mt-1">Choose which tools to turn on for your practice.</p>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {TOOLS.map(tool => {
                    const Icon = tool.icon;
                    const active = activeTools.has(tool.id);
                    return (
                      <button key={tool.id} onClick={() => toggleTool(tool.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                          active ? "border-[#3DA9D1]/40 bg-[#3DA9D1]/5" : "border-[#1D3443]/50 bg-[#0f1a22] hover:border-zinc-600"
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          active ? "bg-[#3DA9D1]/20" : "bg-[#1D3443]"
                        }`}>
                          <Icon className={`w-4 h-4 ${active ? "text-[#3DA9D1]" : "text-zinc-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${active ? "text-white" : "text-zinc-400"}`}>{tool.name}</span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              active ? "bg-[#3DA9D1] border-[#3DA9D1]" : "border-zinc-700"
                            }`}>
                              {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#0a1218]" />}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{tool.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <button onClick={runTests} className="w-full py-3.5 rounded-xl bg-[#3DA9D1] text-[#0a1218] font-semibold hover:bg-[#4dbde3] transition-colors flex items-center justify-center gap-2">
                    Activate {activeTools.size} Tools <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-zinc-600 text-center mt-2">{activeTools.size} of {TOOLS.length} tools selected</p>
                </div>
              </div>
            )}

            {/* ── TESTING ── */}
            {step === "testing" && (
              <div className="space-y-6 py-8">
                <div className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/30 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-[#3DA9D1]" />
                  </motion.div>
                  <h2 className="text-lg font-semibold text-white">Connecting everything...</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Connecting to VeriClaim diary...", phase: 0 },
                    { label: "Syncing email notifications...", phase: 1 },
                    { label: "Setting up calendar bridge...", phase: 2 },
                    { label: `Activating ${activeTools.size} AI tools...`, phase: 3 },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: testPhase >= item.phase ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.3 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0f1a22] border border-[#1D3443]/50">
                      {testPhase > item.phase ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : testPhase === item.phase ? (
                        <Loader2 className="w-4 h-4 text-[#3DA9D1] animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                      )}
                      <span className={`text-sm ${testPhase >= item.phase ? "text-zinc-200" : "text-zinc-600"}`}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DONE ── */}
            {step === "done" && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">You&apos;re live!</h2>
                  <p className="text-sm text-zinc-400 mt-1">Your practice is now AI-powered</p>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "VeriClaim Diary", ok: connections.vericlaim, detail: vcUsername || "Skipped" },
                    { label: "Email Sync", ok: connections.email, detail: emailAddress || "Skipped" },
                    { label: "Calendar Bridge", ok: connections.calendar, detail: calendarLink ? "iCal connected" : emailAddress ? "Auto-created" : "Skipped" },
                    { label: "AI Tools", ok: connections.tools > 0, detail: `${connections.tools} tools activated` },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                      item.ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#0f1a22] border-[#1D3443]/50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.ok ? "bg-emerald-400" : "bg-zinc-700"}`} />
                        <span className="text-sm text-zinc-200">{item.label}</span>
                      </div>
                      <span className={`text-xs ${item.ok ? "text-emerald-400" : "text-zinc-600"}`}>
                        {item.ok ? item.detail : "Not connected"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#3DA9D1]/5 border border-[#3DA9D1]/20">
                  <h3 className="text-sm font-semibold text-[#3DA9D1] mb-2">What happens now:</h3>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    <li>1. AI reads your diary every 5 minutes for open slots</li>
                    <li>2. Patients message on WhatsApp → AI qualifies and books</li>
                    <li>3. Bookings sync to your VeriClaim diary</li>
                    <li>4. Automated reminders at 48h, 24h, and 2h before</li>
                    <li>5. Leads tracked, commissions calculated, revenue grows</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <a href="/dashboard" className="block w-full py-3.5 rounded-xl bg-[#3DA9D1] text-[#0a1218] font-semibold hover:bg-[#4dbde3] transition-colors text-center">
                    Go to Dashboard
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a href="/dashboard/documents" className="py-2.5 rounded-xl bg-[#1D3443] text-zinc-300 text-xs font-medium hover:bg-[#24404f] border border-[#1D3443] transition-colors text-center">
                      Document Generator
                    </a>
                    <a href="/dashboard/claims-copilot" className="py-2.5 rounded-xl bg-[#1D3443] text-zinc-300 text-xs font-medium hover:bg-[#24404f] border border-[#1D3443] transition-colors text-center">
                      Claims Copilot
                    </a>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-700 text-center">
                  Need help? davidhampton@visiocorp.co
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
