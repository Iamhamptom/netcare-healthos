"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { moduleRegistry } from "@/lib/modules/registry";
import { ChevronLeft, Sparkles, Send } from "lucide-react";
import { useState } from "react";

export default function ModuleAgentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const mod = moduleRegistry.getModule(moduleId);
  const [input, setInput] = useState("");

  if (!mod) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#1D3443]/40 mb-6">
        <Link href="/dashboard" className="hover:text-[#1D3443]/60 transition-colors">
          Health OS
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link href={mod.pages[0]?.href || "/dashboard"} className="hover:text-[#1D3443]/60 transition-colors">
          {mod.name}
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-[#1D3443]/60">Agent</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1D3443] tracking-tight">
          {mod.name} Agent
        </h1>
        <p className="text-[14px] text-[#1D3443]/50 mt-1">
          {mod.agentContext.scope}
        </p>
      </div>

      {/* Capabilities */}
      <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-[#1D3443]/[0.03] to-transparent border border-[#1D3443]/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: mod.color }} />
          <span className="text-[12px] font-semibold text-[#1D3443]/70 uppercase tracking-wider">
            What I can do in this module
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {mod.agentContext.capabilities.map((cap, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: mod.color }}
              />
              <span className="text-[13px] text-[#1D3443]/60">{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area (placeholder — will connect to real agent) */}
      <div className="rounded-xl border border-[#1D3443]/[0.06] overflow-hidden">
        <div className="h-[400px] flex items-center justify-center bg-[#1D3443]/[0.02]">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: mod.color + "15" }}
            >
              <Sparkles className="w-8 h-8" style={{ color: mod.color }} />
            </div>
            <p className="text-[15px] font-medium text-[#1D3443]/70">
              Ask me anything about {mod.name}
            </p>
            <p className="text-[12px] text-[#1D3443]/40 mt-1">
              I have full access to all {mod.name.toLowerCase()} tools and data
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1D3443]/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the ${mod.shortName} agent...`}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#1D3443]/[0.03] border border-[#1D3443]/[0.06] text-[13px] text-[#1D3443] placeholder:text-[#1D3443]/30 focus:outline-none focus:border-[#3DA9D1]/30 transition-colors"
            />
            <button
              className="p-2.5 rounded-lg text-white transition-colors"
              style={{ backgroundColor: mod.color }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
