"use client";

import { useState } from "react";
import { DEMO_BRANDS } from "@/lib/tenant";

const BRANDS = Object.entries(DEMO_BRANDS);

export default function BrandDemoPage() {
  const [active, setActive] = useState("healthbridge");
  const brand = DEMO_BRANDS[active]?.brand;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Health OS — Brand Switcher</h1>
      <p className="text-zinc-400 mb-8">Click a brand to preview. Each one is a separate skin on the same platform.</p>

      {/* Brand selector */}
      <div className="flex flex-wrap gap-3 mb-10">
        {BRANDS.map(([slug, config]) => (
          <button
            key={slug}
            onClick={() => setActive(slug)}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor: active === slug ? config.brand?.primaryColor : "transparent",
              border: `2px solid ${config.brand?.primaryColor || "#666"}`,
              color: active === slug ? "#fff" : config.brand?.primaryColor,
            }}
          >
            {config.brand?.name || slug}
          </button>
        ))}
      </div>

      {/* Preview */}
      {brand && (
        <div className="rounded-2xl overflow-hidden border border-zinc-800 max-w-4xl">
          {/* Header bar */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: brand.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                {brand.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{brand.name}</div>
                <div className="text-white/70 text-sm">{brand.tagline}</div>
              </div>
            </div>
            <div className="text-white/60 text-xs">Powered by Visio Research Labs</div>
          </div>

          {/* Dashboard mock */}
          <div className="bg-zinc-900 p-6">
            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {["Recovery Rate", "Claims Today", "Rejection Rate", "Avg Days"].map((label, i) => (
                <div key={label} className="rounded-xl p-4 border border-zinc-800 bg-zinc-900">
                  <div className="text-zinc-500 text-xs mb-1">{label}</div>
                  <div className="text-2xl font-bold" style={{ color: i === 0 ? brand.primaryColor : "#fff" }}>
                    {["94.2%", "1,247", "5.8%", "12.4"][i]}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar nav mock */}
            <div className="flex gap-6">
              <div className="w-48 space-y-1">
                {["Dashboard", "Claims Analyzer", "FHIR Hub", "Switching", "WhatsApp", "Billing", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className="px-3 py-2 rounded-lg text-sm cursor-pointer transition-all"
                    style={{
                      backgroundColor: i === 0 ? `${brand.primaryColor}20` : "transparent",
                      color: i === 0 ? brand.primaryColor : "#a1a1aa",
                      borderLeft: i === 0 ? `3px solid ${brand.primaryColor}` : "3px solid transparent",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="flex-1 rounded-xl border border-zinc-800 p-6 bg-zinc-950">
                <h2 className="text-xl font-bold mb-4" style={{ color: brand.primaryColor }}>
                  Claims Intelligence Dashboard
                </h2>
                <div className="text-zinc-400 text-sm mb-4">
                  Powered by VRL-Claims — proprietary AI model fine-tuned on SA healthcare claims data.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 border border-zinc-800">
                    <div className="text-zinc-500 text-xs mb-1">Model Accuracy</div>
                    <div className="text-lg font-bold text-emerald-400">87.3%</div>
                    <div className="text-zinc-600 text-xs">Rejection prediction (ICD-10-ZA)</div>
                  </div>
                  <div className="rounded-lg p-4 border border-zinc-800">
                    <div className="text-zinc-500 text-xs mb-1">Claims Scrubbed Today</div>
                    <div className="text-lg font-bold" style={{ color: brand.secondaryColor }}>3,842</div>
                    <div className="text-zinc-600 text-xs">Pattern-loop analysis active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-zinc-900 border-t border-zinc-800 flex justify-between text-xs text-zinc-600">
            <span>© 2026 {brand.name}. Powered by Visio Research Labs.</span>
            <span>{brand.websiteUrl}</span>
          </div>
        </div>
      )}

      {/* Demo link instructions */}
      <div className="mt-10 p-4 rounded-xl border border-zinc-800 max-w-4xl">
        <h3 className="font-bold text-sm mb-2">Sales Demo Links</h3>
        <p className="text-zinc-400 text-xs mb-3">Use these URLs to show clients their branded version:</p>
        <div className="space-y-1 font-mono text-xs">
          {BRANDS.map(([slug, config]) => (
            <div key={slug} className="text-zinc-500">
              <span style={{ color: config.brand?.primaryColor }}>{config.brand?.name}</span>
              {" → "}
              <span className="text-zinc-300">healthos.visiocorp.co?brand={slug}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
