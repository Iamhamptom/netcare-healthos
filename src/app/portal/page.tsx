"use client";

import { useState } from "react";
import { Heart, Shield, Phone } from "lucide-react";

export default function PatientPortalPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [practiceId] = useState("demo-practice");

  const requestOTP = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/portal/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, practiceId }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep("otp");
  };

  const verifyOTP = async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/portal/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, practiceId, otp }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    window.location.href = "/portal/dashboard";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Patient Portal</h1>
          <p className="text-[13px] text-gray-500 mt-1">Access your health records, appointments, and messages</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          {step === "phone" ? (
            <>
              <div>
                <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input type="tel" placeholder="072 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-[14px] text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none" />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Enter the number registered with your practice</p>
              </div>
              <button onClick={requestOTP} disabled={loading || phone.length < 10} className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-[12px] font-medium text-gray-600 block mb-1.5">Verification Code</label>
                <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-center text-xl tracking-[0.4em] font-mono text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:outline-none" maxLength={6} autoFocus />
                <p className="text-[11px] text-gray-400 mt-1.5">6-digit code sent to your WhatsApp</p>
              </div>
              <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors">
                {loading ? "Verifying..." : "Log In"}
              </button>
              <button onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="w-full text-gray-500 hover:text-gray-700 text-[12px] transition-colors">
                Use a different number
              </button>
            </>
          )}
          {error && <p className="text-[12px] text-red-600 text-center">{error}</p>}
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> POPIA Compliant</span>
          <span>·</span>
          <span>Powered by Health OS</span>
        </div>
      </div>
    </div>
  );
}
