"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { moduleRegistry } from "@/lib/modules/registry";
import type { IntegrationStatus, ModuleIntegration } from "@/lib/modules/types";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Plug,
  Bot,
  ExternalLink,
  Key,
  ArrowRight,
} from "lucide-react";

const STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; color: string; bg: string; icon: any; border: string }
> = {
  connected: {
    label: "Connected",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  needs_setup: {
    label: "Needs Setup",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: AlertCircle,
  },
  stubbed: {
    label: "Stubbed",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Clock,
  },
  inactive: {
    label: "Inactive",
    color: "text-white/30",
    bg: "bg-white/[0.03]",
    border: "border-white/[0.06]",
    icon: XCircle,
  },
};

function IntegrationCard({ integration }: { integration: ModuleIntegration }) {
  const config = STATUS_CONFIG[integration.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-5 transition-all hover:border-white/[0.12]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}
          >
            <Plug className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1D3443]">
              {integration.name}
            </h3>
            <p className="text-[12px] text-[#1D3443]/50 mt-0.5">
              {integration.description}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg}`}
        >
          <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
          <span className={`text-[11px] font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Impact & Fallback */}
      <div className="space-y-2 mt-4">
        <div className="flex gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#1D3443]/30 font-semibold w-20 shrink-0 pt-0.5">
            Impact
          </span>
          <p className="text-[12px] text-[#1D3443]/60">{integration.impact}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[#1D3443]/30 font-semibold w-20 shrink-0 pt-0.5">
            Fallback
          </span>
          <p className="text-[12px] text-[#1D3443]/60">
            {integration.fallback}
          </p>
        </div>
        {integration.envKeys && integration.envKeys.length > 0 && (
          <div className="flex gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#1D3443]/30 font-semibold w-20 shrink-0 pt-0.5">
              Env Keys
            </span>
            <div className="flex flex-wrap gap-1">
              {integration.envKeys.map((key) => (
                <span
                  key={key}
                  className="px-2 py-0.5 text-[10px] font-mono bg-[#1D3443]/5 text-[#1D3443]/50 rounded"
                >
                  <Key className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}
        {integration.setupHint && integration.status !== "connected" && (
          <div className="flex gap-2 mt-2 p-3 rounded-lg bg-amber-50/50 border border-amber-200/30">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700">{integration.setupHint}</p>
          </div>
        )}
      </div>

      {/* Connect button for needs_setup */}
      {integration.status === "needs_setup" && (
        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1D3443] text-white text-[12px] font-medium hover:bg-[#1D3443]/90 transition-colors">
          <span>Connect {integration.name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ModuleConnectionsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const mod = moduleRegistry.getModule(moduleId);

  if (!mod) {
    notFound();
  }

  const connected = mod.integrations.filter(
    (i) => i.status === "connected"
  ).length;
  const total = mod.integrations.length;
  const healthPercent = Math.round((connected / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#1D3443]/40 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-[#1D3443]/60 transition-colors"
        >
          Health OS
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link
          href={mod.pages[0]?.href || "/dashboard"}
          className="hover:text-[#1D3443]/60 transition-colors"
        >
          {mod.name}
        </Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-[#1D3443]/60">Connections</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1D3443] tracking-tight">
            {mod.name} — Connections
          </h1>
          <p className="text-[14px] text-[#1D3443]/50 mt-1">
            Integrations powering this module. Connected services are live;
            others need setup.
          </p>
        </div>

        {/* Health ring */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[24px] font-bold text-[#1D3443]">
              {connected}/{total}
            </div>
            <div className="text-[11px] text-[#1D3443]/40 font-medium">
              connected
            </div>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="rgba(29,52,67,0.06)"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke={healthPercent === 100 ? "#34D399" : "#FBBF24"}
                strokeWidth="4"
                strokeDasharray={`${(healthPercent / 100) * 150.8} 150.8`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-[#1D3443]">
              {healthPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Agent prompt */}
      <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[#1D3443]/[0.04] to-[#3DA9D1]/[0.04] border border-[#3DA9D1]/10">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3DA9D1]/10 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-[#3DA9D1]" />
          </div>
          <div>
            <p className="text-[13px] text-[#1D3443]/70">
              {connected === total ? (
                <>
                  All integrations are connected. {mod.name} is fully
                  operational.
                </>
              ) : (
                <>
                  {total - connected} integration
                  {total - connected > 1 ? "s" : ""} need attention. Want me to
                  help set{" "}
                  {total - connected > 1 ? "them" : "it"} up?
                </>
              )}
            </p>
            {connected < total && (
              <button className="mt-2 text-[12px] font-medium text-[#3DA9D1] hover:text-[#3DA9D1]/80 transition-colors flex items-center gap-1">
                <span>Help me connect</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Integration cards */}
      <div className="space-y-4">
        {/* Connected first, then needs_setup, then stubbed, then inactive */}
        {["connected", "needs_setup", "stubbed", "inactive"].map((status) => {
          const items = mod.integrations.filter((i) => i.status === status);
          if (items.length === 0) return null;
          return items.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ));
        })}
      </div>
    </div>
  );
}
