"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PlugZap, CheckCircle2, AlertCircle, Clock, XCircle,
  Database, MessageSquare, Mail, Calendar, Building2,
  Shield, Brain, Loader2, ChevronDown, ExternalLink,
  Cloud, Inbox, HeartPulse,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "pending" | "disconnected";
  powers: string[];
  breaksWithout: string;
  configurable?: boolean;
  lastSync?: string;
}

const ICON_MAP: Record<string, typeof Database> = {
  supabase: Database,
  whatsapp: MessageSquare,
  email: Mail,
  resend: Mail,
  google_calendar: Calendar,
  "google-calendar": Calendar,
  heal: Building2,
  healthbridge: Shield,
  ai_models: Brain,
  "ai-model": Brain,
  microsoft365: Cloud,
  gmail: Inbox,
  careon_bridge: HeartPulse,
};

// OAuth integrations that need a "Connect" button instead of config form
const OAUTH_INTEGRATIONS: Record<string, { connectUrl: string; label: string }> = {
  microsoft365: { connectUrl: "/api/microsoft/connect", label: "Connect Microsoft 365" },
  gmail: { connectUrl: "/api/gmail/connect", label: "Connect Gmail" },
};

const STATUS_MAP = {
  connected: { label: "connected", icon: CheckCircle2, classes: "bg-emerald-500/10 text-emerald-400" },
  pending: { label: "pending", icon: Clock, classes: "bg-amber-500/10 text-amber-400" },
  disconnected: { label: "disconnected", icon: XCircle, classes: "bg-neutral-500/10 text-neutral-500" },
} as const;

export default function FrontDeskConnectionsPage() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // HEAL config state
  const [healEndpoint, setHealEndpoint] = useState("");
  const [healKey, setHealKey] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/front-desk/connections");
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function saveHealConfig() {
    await fetch("/api/front-desk/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integrationId: "heal", config: { endpoint: healEndpoint, apiKey: healKey } }),
    });
    fetchData();
  }

  async function testIntegration(id: string) {
    // Trigger a test ping for the integration
    try {
      const res = await fetch("/api/front-desk/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId: id, action: "test" }),
      });
      await res.json();
      fetchData();
    } catch {
      // silent
    }
  }

  const connected = integrations.filter(i => i.status === "connected").length;
  const total = integrations.length || 7;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 text-neutral-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 mb-4">
        <Link href="/dashboard/front-desk" className="hover:text-neutral-300 transition-colors">front-desk</Link>
        <span>/</span>
        <span className="text-neutral-400">connections</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Connections</h1>
          <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
            Services powering the front desk module
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono text-neutral-300">{connected}/{total}</span>
          {/* Progress bar */}
          <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={"h-full rounded-full transition-all " + (connected === total ? "bg-emerald-400" : "bg-amber-400")}
              style={{ width: (connected / total * 100) + "%" }}
            />
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="space-y-2">
        {integrations.map(int => {
          const Icon = ICON_MAP[int.id] || PlugZap;
          const statusCfg = STATUS_MAP[int.status] || STATUS_MAP.disconnected;
          const StatusIcon = statusCfg.icon;
          const isExpanded = expandedId === int.id;

          return (
            <div key={int.id} className="border border-neutral-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : int.id)}
                className="w-full flex items-center px-4 py-3 hover:bg-neutral-800/30 transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-neutral-400 shrink-0 mr-3" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-neutral-200">{int.name}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{int.description}</div>
                </div>
                <div className={"flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono mr-2 " + statusCfg.classes}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </div>
                <ChevronDown className={"w-3.5 h-3.5 text-neutral-600 transition-transform " + (isExpanded ? "rotate-180" : "")} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-neutral-800 bg-neutral-900/50">
                  <div className="pt-3 space-y-2">
                    {/* Powers */}
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 w-20 shrink-0 pt-0.5">Powers</span>
                      <div className="flex flex-wrap gap-1">
                        {int.powers.map(p => (
                          <span key={p} className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 w-20 shrink-0 pt-0.5">Impact</span>
                      <span className="text-[11px] text-neutral-400">{int.breaksWithout}</span>
                    </div>

                    {/* Last sync */}
                    {int.lastSync && (
                      <div className="flex gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 w-20 shrink-0 pt-0.5">Last sync</span>
                        <span className="text-[11px] font-mono text-neutral-500">{int.lastSync}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {int.status === "connected" && (
                        <button
                          onClick={() => testIntegration(int.id)}
                          className="text-[11px] font-mono text-neutral-400 hover:text-neutral-200 px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors"
                        >
                          test connection
                        </button>
                      )}
                      {int.id === "heal" && int.configurable && (
                        <div className="w-full space-y-2 mt-2">
                          <input
                            value={healEndpoint} onChange={e => setHealEndpoint(e.target.value)} placeholder="HEAL API endpoint"
                            className="w-full h-7 px-2.5 rounded bg-neutral-800 border border-neutral-700 text-[12px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                          />
                          <input
                            type="password" value={healKey} onChange={e => setHealKey(e.target.value)} placeholder="API key"
                            className="w-full h-7 px-2.5 rounded bg-neutral-800 border border-neutral-700 text-[12px] text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
                          />
                          <button onClick={saveHealConfig} className="text-[11px] font-mono text-neutral-900 bg-neutral-100 px-3 py-1 rounded hover:bg-neutral-200 transition-colors">
                            save & connect
                          </button>
                        </div>
                      )}
                      {/* OAuth connect buttons (Microsoft 365, Gmail) */}
                      {int.status === "disconnected" && OAUTH_INTEGRATIONS[int.id] && (
                        <a
                          href={OAUTH_INTEGRATIONS[int.id].connectUrl}
                          className="text-[11px] font-mono text-neutral-900 bg-neutral-100 px-3 py-1 rounded hover:bg-neutral-200 transition-colors inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {OAUTH_INTEGRATIONS[int.id].label}
                        </a>
                      )}
                      {/* CareOn Bridge config */}
                      {int.id === "careon_bridge" && int.status === "disconnected" && (
                        <button
                          onClick={async () => {
                            await fetch("/api/front-desk/connections", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ integrationId: "careon_bridge", config: { enabled: true, connectedAt: new Date().toISOString() } }),
                            });
                            fetchData();
                          }}
                          className="text-[11px] font-mono text-neutral-900 bg-neutral-100 px-3 py-1 rounded hover:bg-neutral-200 transition-colors"
                        >
                          enable CareOn Bridge
                        </button>
                      )}
                      {/* Disconnect button for connected OAuth */}
                      {int.status === "connected" && OAUTH_INTEGRATIONS[int.id] && (
                        <button className="text-[11px] font-mono text-red-400 hover:text-red-300 px-2 py-1 rounded border border-neutral-700 hover:bg-neutral-800 transition-colors">
                          disconnect
                        </button>
                      )}
                      {/* Generic fallback */}
                      {int.status === "disconnected" && !OAUTH_INTEGRATIONS[int.id] && int.id !== "heal" && int.id !== "careon_bridge" && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
                          <AlertCircle className="w-3 h-3" />
                          Setup required — contact admin
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
