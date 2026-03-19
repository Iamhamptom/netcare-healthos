"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeartPulse, Check, ArrowLeft } from "lucide-react";

const practiceAreas = [
  "General Practice",
  "Family Medicine",
  "Internal Medicine",
  "Paediatrics",
  "Geriatrics",
  "Occupational Health",
  "Sports Medicine",
  "Other",
];

export default function GPRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    practiceName: "",
    hpcsaNumber: "",
    email: "",
    phone: "",
    areasOfPractice: [] as string[],
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggleArea(area: string) {
    setForm((prev) => ({
      ...prev,
      areasOfPractice: prev.areasOfPractice.includes(area)
        ? prev.areasOfPractice.filter((a) => a !== area)
        : [...prev.areasOfPractice, area],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/gp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1D3443] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#3DA9D1]/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#3DA9D1]" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">Registration Successful</h1>
          <p className="text-[#3DA9D1]/60 text-sm mb-8 leading-relaxed">
            Your GP Referral Portal account has been created. You can now log in and submit
            your first digital referral.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="block w-full py-3.5 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#3DA9D1] transition-colors text-center"
            >
              Log In to Your Dashboard
            </Link>
            <Link
              href="/gp"
              className="block w-full py-3.5 bg-white/5 text-[#3DA9D1] font-medium text-sm rounded-xl hover:bg-white/10 transition-colors text-center border border-white/10"
            >
              Back to GP Portal
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-gradient-to-br from-[#1D3443] via-[#1A2F3E] to-[#152736] relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className="relative z-10">
          <Link href="/gp" className="flex items-center gap-2 text-[#3DA9D1] hover:text-[#3DA9D1] transition-colors text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to GP Portal
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-5 h-5 text-[#3DA9D1]" />
            <span className="text-lg font-semibold text-white tracking-tight">Netcare Health OS</span>
          </div>
          <span className="text-[#3DA9D1]/50 text-[11px] font-mono uppercase tracking-widest">
            GP Referral Portal
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-semibold text-white leading-snug">
            Join the referral<br />network. Free.
          </h2>
          <p className="text-[#3DA9D1]/60 text-sm leading-relaxed max-w-xs">
            Register as a referring GP and start submitting digital referrals to specialist
            practices on the Netcare Health OS network.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Submit referrals digitally",
              "Track referral status",
              "Receive specialist feedback",
              "Search specialist directory",
              "POPIA-compliant data sharing",
              "No cost, no commitment",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#3DA9D1]/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#3DA9D1]" />
                </div>
                <span className="text-[#3DA9D1]/70 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[#3DA9D1]/30 text-xs">
            HPCSA-registered practitioners only. Your data is protected under POPIA.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HeartPulse className="w-5 h-5 text-[#3DA9D1]" />
              <span className="text-base font-semibold text-gray-900 tracking-tight">Netcare Health OS</span>
            </div>
            <span className="text-gray-400 text-xs font-mono">GP Referral Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
              Register as a Referring GP
            </h1>
            <p className="text-sm text-gray-500">
              Free access to the referral portal. No payment required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="Dr. James Nkosi"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                Practice Name
              </label>
              <input
                type="text"
                value={form.practiceName}
                onChange={(e) => setForm({ ...form, practiceName: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="Nkosi Family Practice"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                HPCSA Number
              </label>
              <input
                type="text"
                value={form.hpcsaNumber}
                onChange={(e) => setForm({ ...form, hpcsaNumber: e.target.value })}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="MP 0123456"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                  placeholder="dr@practice.co.za"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                  placeholder="082 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:bg-white focus:border-[#3DA9D1] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/10 transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-medium uppercase tracking-[0.1em] mb-3">
                Areas of Practice
              </label>
              <div className="flex flex-wrap gap-2">
                {practiceAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      form.areasOfPractice.includes(area)
                        ? "bg-[#3DA9D1] border-[#3DA9D1] text-[#1D3443]"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 mt-2 bg-[#3DA9D1] text-white font-medium text-sm rounded-xl hover:bg-[#1D3443] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#3DA9D1]/20"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Register as Referring GP
            </motion.button>

            <p className="text-center text-xs text-gray-400 pt-2">
              Already registered?{" "}
              <Link href="/login" className="text-[#3DA9D1] hover:text-[#1D3443] transition-colors">
                Sign in
              </Link>
            </p>
          </form>

          <p className="text-center text-[11px] text-gray-300 mt-8">
            By registering you agree to our Terms of Service and POPIA-compliant Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
