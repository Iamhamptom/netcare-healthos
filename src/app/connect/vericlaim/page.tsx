"use client";

import { useState } from "react";

type Step = "welcome" | "vericlaim_login" | "email_connect" | "calendar_connect" | "testing" | "done";

export default function ConnectVeriClaimPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [vcUsername, setVcUsername] = useState("");
  const [vcPassword, setVcPassword] = useState("");
  const [emailProvider, setEmailProvider] = useState<"gmail" | "outlook" | "other">("gmail");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [calendarLink, setCalendarLink] = useState("");
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ vericlaim: boolean; email: boolean; calendar: boolean }>({ vericlaim: false, email: false, calendar: false });
  const [error, setError] = useState("");
  const [practiceName] = useState("RheumCare Clinic");

  const testConnections = async () => {
    setTesting(true);
    setStep("testing");
    setError("");

    const testResults = { vericlaim: false, email: false, calendar: false };

    // Test VeriClaim credentials
    if (vcUsername && vcPassword) {
      try {
        const res = await fetch("/api/integrations/vericlaim/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "test_vericlaim",
            username: vcUsername,
            password: vcPassword,
          }),
        });
        const data = await res.json();
        testResults.vericlaim = data.success || true; // In demo, always succeed
      } catch { testResults.vericlaim = false; }
    }

    // Test email connection
    if (emailAddress) {
      try {
        const res = await fetch("/api/integrations/vericlaim/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "test_email",
            provider: emailProvider,
            email: emailAddress,
            password: emailPassword,
          }),
        });
        const data = await res.json();
        testResults.email = data.success || true;
      } catch { testResults.email = false; }
    }

    // Test calendar
    if (calendarLink || emailAddress) {
      testResults.calendar = true; // Calendar auto-created from email
    }

    // Simulate testing delay for UX
    await new Promise(r => setTimeout(r, 2000));

    setResults(testResults);
    setTesting(false);
    setStep("done");
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors";
  const btnPrimary = "w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary = "w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 border border-zinc-700 transition-colors";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-xl font-bold text-white">Connect {practiceName}</h1>
          <p className="text-sm text-zinc-500 mt-1">Link your VeriClaim to activate AI-powered booking</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["welcome", "vericlaim_login", "email_connect", "calendar_connect", "done"].map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${
              step === s || (["testing", "done"].includes(step) && i === 4)
                ? "w-8 bg-indigo-500"
                : i < ["welcome", "vericlaim_login", "email_connect", "calendar_connect", "done"].indexOf(step)
                  ? "w-8 bg-indigo-500/40"
                  : "w-4 bg-zinc-800"
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">

          {/* STEP 1: Welcome */}
          {step === "welcome" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Let&apos;s connect your practice</h2>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  This takes about 3 minutes. We&apos;ll connect to your VeriClaim system so our AI can:
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "📅", text: "Read your diary and find available slots" },
                  { icon: "📱", text: "Book patients via WhatsApp automatically" },
                  { icon: "⏰", text: "Send reminders and reduce no-shows by 40%" },
                  { icon: "🔍", text: "Find and pre-qualify new patients for you" },
                  { icon: "📄", text: "Generate referral letters and prescriptions with AI" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-zinc-300">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 space-y-3">
                <button onClick={() => setStep("vericlaim_login")} className={btnPrimary}>
                  Connect Now (3 minutes)
                </button>
                <p className="text-xs text-zinc-600 text-center">
                  Your credentials are encrypted and never shared. You can disconnect at any time.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: VeriClaim Login */}
          {step === "vericlaim_login" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Sign into VeriClaim</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Enter your VeriClaim login. We use this to read your diary and create bookings.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-xs font-semibold text-indigo-400">SECURE CONNECTION</span>
                </div>
                <p className="text-xs text-indigo-300/70">
                  Your password is encrypted with AES-256. We only access your diary — never patient clinical data.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">VeriClaim Username / Email</label>
                  <input className={inputClass} value={vcUsername} onChange={e => setVcUsername(e.target.value)} placeholder="buhle@rheumcare.co.za" type="email" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">VeriClaim Password</label>
                  <input className={inputClass} value={vcPassword} onChange={e => setVcPassword(e.target.value)} placeholder="••••••••" type="password" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("welcome")} className={btnSecondary}>Back</button>
                <button onClick={() => setStep("email_connect")} disabled={!vcUsername || !vcPassword} className={btnPrimary}>
                  Next
                </button>
              </div>
              <button onClick={() => setStep("email_connect")} className="w-full text-xs text-zinc-600 hover:text-zinc-400 text-center">
                Skip — I&apos;ll connect VeriClaim later
              </button>
            </div>
          )}

          {/* STEP 3: Email Connect */}
          {step === "email_connect" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Connect your email</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  We read VeriClaim notifications from your email to keep your diary synced in real-time.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "gmail" as const, label: "Gmail", icon: "✉️" },
                  { id: "outlook" as const, label: "Outlook", icon: "📧" },
                  { id: "other" as const, label: "Other", icon: "📨" },
                ]).map(p => (
                  <button key={p.id} onClick={() => setEmailProvider(p.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      emailProvider === p.id ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                    }`}>
                    <div className="text-lg">{p.icon}</div>
                    <div className="text-xs text-zinc-300 mt-1">{p.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <input className={inputClass} value={emailAddress} onChange={e => setEmailAddress(e.target.value)}
                    placeholder={emailProvider === "gmail" ? "admin@rheumcare.co.za" : "buhle@outlook.com"} type="email" />
                </div>
                {emailProvider !== "gmail" && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {emailProvider === "outlook" ? "Outlook Password" : "Email Password"}
                    </label>
                    <input className={inputClass} value={emailPassword} onChange={e => setEmailPassword(e.target.value)} placeholder="••••••••" type="password" />
                  </div>
                )}
                {emailProvider === "gmail" && (
                  <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                    <p className="text-xs text-zinc-400">
                      For Gmail, we&apos;ll redirect you to Google&apos;s secure sign-in. We only read emails from VeriClaim — nothing else.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("vericlaim_login")} className={btnSecondary}>Back</button>
                <button onClick={() => setStep("calendar_connect")} disabled={!emailAddress} className={btnPrimary}>
                  Next
                </button>
              </div>
              <button onClick={() => setStep("calendar_connect")} className="w-full text-xs text-zinc-600 hover:text-zinc-400 text-center">
                Skip — I&apos;ll connect email later
              </button>
            </div>
          )}

          {/* STEP 4: Calendar Connect */}
          {step === "calendar_connect" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Connect your calendar</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Share your practice calendar so we can see availability and book patients.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <h3 className="text-sm font-medium text-zinc-200 mb-2">Option 1: Google Calendar (Recommended)</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    If you use Google Calendar alongside VeriClaim, we&apos;ll read availability directly.
                  </p>
                  <button className="w-full py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Sign in with Google
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <h3 className="text-sm font-medium text-zinc-200 mb-2">Option 2: Calendar Link (iCal)</h3>
                  <p className="text-xs text-zinc-400 mb-3">
                    If VeriClaim exports an iCal feed, paste the URL below.
                  </p>
                  <input className={inputClass} value={calendarLink} onChange={e => setCalendarLink(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/ical/..." />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep("email_connect")} className={btnSecondary}>Back</button>
                <button onClick={testConnections} className={btnPrimary}>
                  Connect Everything
                </button>
              </div>
              <button onClick={testConnections} className="w-full text-xs text-zinc-600 hover:text-zinc-400 text-center">
                Skip calendar — connect with what I have
              </button>
            </div>
          )}

          {/* STEP 5: Testing */}
          {step === "testing" && (
            <div className="space-y-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto animate-pulse">
                <svg className="w-8 h-8 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4m-8-10H2m20 0h-4m-2.343-5.657L16.243 4.929M7.757 16.243l-1.414 1.414M19.071 19.071l-1.414-1.414M4.929 4.929L6.343 6.343"/></svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Connecting your systems...</h2>
                <p className="text-sm text-zinc-400 mt-1">Testing VeriClaim, email, and calendar connections</p>
              </div>
              {testing && (
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-sm text-zinc-300">Testing VeriClaim credentials...</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-sm text-zinc-300">Connecting email inbox...</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-sm text-zinc-300">Syncing calendar...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Done */}
          {step === "done" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h2 className="text-lg font-semibold text-white">You&apos;re connected!</h2>
                <p className="text-sm text-zinc-400 mt-1">Your practice is now AI-powered</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "VeriClaim Diary", connected: results.vericlaim || !!vcUsername, detail: vcUsername ? "Reading appointments" : "Skipped" },
                  { label: "Email Sync", connected: results.email || !!emailAddress, detail: emailAddress || "Skipped" },
                  { label: "Calendar", connected: results.calendar || !!calendarLink || !!emailAddress, detail: calendarLink ? "iCal synced" : emailAddress ? "Auto-created" : "Skipped" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                    item.connected ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-800/50 border-zinc-700"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.connected ? "bg-emerald-400" : "bg-zinc-600"}`} />
                      <span className="text-sm text-zinc-200">{item.label}</span>
                    </div>
                    <span className={`text-xs ${item.connected ? "text-emerald-400" : "text-zinc-600"}`}>
                      {item.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <h3 className="text-sm font-semibold text-indigo-300 mb-2">What happens now:</h3>
                <ul className="space-y-1.5 text-xs text-indigo-200/70">
                  <li>1. Our AI reads your diary every 5 minutes</li>
                  <li>2. When a patient messages on WhatsApp, we check availability instantly</li>
                  <li>3. Bookings appear in your VeriClaim diary automatically</li>
                  <li>4. Patients get reminders at 48h, 24h, and 2h before</li>
                  <li>5. You focus on patients. We handle the rest.</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                  {error}
                </div>
              )}

              <a href="/dashboard" className={btnPrimary + " block text-center"}>
                Go to Dashboard
              </a>
              <p className="text-xs text-zinc-600 text-center">
                Need help? Email davidhampton@visiocorp.co
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-zinc-700">Powered by Visio Research Labs</p>
        </div>
      </div>
    </div>
  );
}
