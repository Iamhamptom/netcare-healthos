"use client";

import { useState } from "react";
import Link from "next/link";

const REQUEST_TYPES = [
  { value: "access", label: "Access — Request a copy of my personal data" },
  { value: "correction", label: "Correction — Correct inaccurate data" },
  { value: "deletion", label: "Deletion — Delete my personal data" },
  { value: "objection", label: "Objection — Object to processing of my data" },
];

export default function DataRequestPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    requestType: "access",
    details: "",
    idNumber: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1D3443] text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-[#3DA9D1] text-4xl mb-4">&#x2713;</div>
          <h1 className="text-xl font-light mb-4">Request Submitted</h1>
          <p className="text-sm text-white/60 font-light leading-relaxed mb-6">
            Your data subject request has been received. We will respond within 30 days as
            required by POPIA. You will receive a confirmation email at {form.email}.
          </p>
          <Link
            href="/"
            className="text-xs text-white/70 font-mono hover:text-white/60 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D3443] text-white">
      <div className="mx-auto max-w-lg px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/70 font-mono hover:text-white/60 transition-colors mb-8 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Data Subject Request
        </h1>
        <p className="text-xs text-white/70 font-mono mb-2">
          POPIA s23-25 — Your data rights
        </p>
        <p className="text-sm text-white/70 leading-relaxed font-light mb-10">
          Use this form to exercise your rights under the Protection of Personal Information
          Act. We will verify your identity and respond within 30 days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-white/50 font-mono mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#3DA9D1]/30 transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 font-mono mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#3DA9D1]/30 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 font-mono mb-2">
              ID Number (for identity verification)
            </label>
            <input
              type="text"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#3DA9D1]/30 transition-colors"
              placeholder="Optional — last 4 digits only"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 font-mono mb-2">Request Type *</label>
            <select
              required
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3DA9D1]/30 transition-colors"
            >
              {REQUEST_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#1D3443]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/50 font-mono mb-2">Details</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:border-[#3DA9D1]/30 transition-colors resize-none"
              placeholder="Provide any additional details about your request..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 font-light">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 text-[#3DA9D1] rounded-lg py-3 text-sm font-mono hover:bg-[#3DA9D1]/20 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          <p className="text-[11px] text-white/70 font-mono text-center">
            We will verify your identity before processing. Response within 30 days (POPIA).
          </p>
        </form>
      </div>
    </div>
  );
}
