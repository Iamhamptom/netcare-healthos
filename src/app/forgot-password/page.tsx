"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1D3443] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-[14px] text-gray-500 mb-6">
              If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="text-[13px] text-[#3DA9D1] font-semibold hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Link href="/login" className="text-[13px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Reset your password</h1>
              <p className="text-[14px] text-gray-500 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sara.nayager@netcare.co.za"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3DA9D1]/30 focus:border-[#3DA9D1]"
                  />
                </div>
              </div>
              {error && <p className="text-[12px] text-red-500">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#1D3443] text-white text-[14px] font-semibold hover:bg-[#2a4a5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
