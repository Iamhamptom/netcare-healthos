"use client";

import { useState } from "react";
import { Heart, Shield, Phone } from "lucide-react";

export default function PatientPortalPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [practiceId] = useState("demo-practice"); // TODO: derive from subdomain or URL param

  const requestOTP = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, practiceId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep("otp");
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, practiceId, otp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    window.location.href = "/portal/dashboard";
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Patient Portal</h1>
          <p className="text-zinc-400 text-sm mt-1">Access your health records, appointments, and messages</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {step === "phone" ? (
            <>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="072 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Enter the phone number registered with your practice</p>
              </div>
              <button
                onClick={requestOTP}
                disabled={loading || phone.length < 10}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium"
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm text-zinc-400 block mb-1">Verification Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-zinc-500 mt-1">Enter the 6-digit code sent to your WhatsApp</p>
              </div>
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium"
              >
                {loading ? "Verifying..." : "Log In"}
              </button>
              <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="w-full text-zinc-400 hover:text-white text-xs">
                Use a different number
              </button>
            </>
          )}

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> POPIA Compliant</span>
          <span>·</span>
          <span>Powered by Health OS</span>
        </div>
      </div>
    </div>
  );
}
