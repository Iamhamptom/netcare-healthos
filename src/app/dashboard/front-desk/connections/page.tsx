"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlugZap, Database, MessageSquare, Mail, Calendar,
  Building2, Shield, Bot, CheckCircle2, XCircle, Clock,
  ArrowLeft, ExternalLink, TestTube2, Loader2, Send,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "disconnected" | "pending";
  powers: string[];
  breaksWithout: string;
  configurable: boolean;
  lastSync?: string;
}

// ── Icon mapping ─────────────────────────────────────────────────────────

const categoryIcons: Record<string, typeof Database> = {
  core: Database,
  communication: MessageSquare,
  calendar: Calendar,
  clinical: Shield,
  ai: Bot,
};

const integrationIcons: Record<string, typeof Database> = {
  supabase: Database,
  whatsapp: MessageSquare,
  email: Mail,
  google_calendar: Calendar,
  heal: Building2,
  healthbridge: Shield,
  ai_models: Bot,
};

// ── Page ─────────────────────────────────────────────────────────────────

export default function ConnectionsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [healEndpoint, setHealEndpoint] = useState("");
  const [healApiKey, setHealApiKey] = useState("");

  useEffect(() => {
    fetch("/api/front-desk/connections")
      .then(r => r.json())
      .then(d => setIntegrations(d.integrations || []))
      .finally(() => setLoading(false));
  }, []);

  const connected = integrations.filter(i => i.status === "connected").length;
  const total = integrations.length;

  async function testEmail() {
    setTestingEmail(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email", recipient: "test@example.com", subject: "HealthOS Test", message: "This is a test email from your Front Desk module." }),
      });
    } finally {
      setTestingEmail(false);
    }
  }

  async function saveHealConfig() {
    if (!healEndpoint.trim()) return;
    await fetch("/api/front-desk/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integrationId: "heal", config: { endpoint: healEndpoint, apiKey: healApiKey, connected: true, lastSync: new Date().toISOString() } }),
    });
    setConfiguring(null);
    // Refresh
    const res = await fetch("/api/front-desk/connections");
    const d = await res.json();
    setIntegrations(d.integrations || []);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(253,252,240,0.3)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/front-desk" className="text-xs flex items-center gap-1 mb-3" style={{ color: "rgba(253,252,240,0.4)" }}>
          <ArrowLeft className="w-3 h-3" /> Back to Front Desk
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "rgba(253,252,240,0.95)" }}>
          <PlugZap className="inline w-6 h-6 mr-2 -mt-1" style={{ color: "#2DD4BF" }} />
          Front Desk Connections
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(253,252,240,0.4)" }}>
          {connected} of {total} integrations connected — these power your front desk operations
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(connected / total) * 100}%`, background: "linear-gradient(90deg, #2DD4BF, #818CF8)" }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "rgba(253,252,240,0.6)" }}>{connected}/{total}</span>
      </div>

      {/* Integration Cards */}
      <div className="space-y-3">
        {integrations.map((int, i) => {
          const Icon = integrationIcons[int.id] || Database;
          const statusColor = int.status === "connected" ? "#2DD4BF" : int.status === "pending" ? "#E8C84A" : "rgba(253,252,240,0.2)";
          const statusLabel = int.status === "connected" ? "Connected" : int.status === "pending" ? "Pending Setup" : "Disconnected";

          return (
            <motion.div
              key={int.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${int.status === "connected" ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.06)"}` }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="p-2.5 rounded-xl" style={{ background: `${statusColor}10` }}>
                  <Icon className="w-5 h-5" style={{ color: statusColor }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: "rgba(253,252,240,0.9)" }}>{int.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                      <span className="text-[10px] font-medium" style={{ color: statusColor }}>{statusLabel}</span>
                    </div>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "rgba(253,252,240,0.4)" }}>{int.description}</p>

                  {/* What it powers */}
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(253,252,240,0.3)" }}>Powers</p>
                    <div className="flex flex-wrap gap-1">
                      {int.powers.map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.5)" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* What breaks */}
                  {int.status !== "connected" && (
                    <div className="p-2 rounded-lg mb-3" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)" }}>
                      <p className="text-[10px] font-medium" style={{ color: "#F87171" }}>Without this:</p>
                      <p className="text-xs" style={{ color: "rgba(253,252,240,0.5)" }}>{int.breaksWithout}</p>
                    </div>
                  )}

                  {/* Last sync */}
                  {int.lastSync && (
                    <p className="text-[10px]" style={{ color: "rgba(253,252,240,0.3)" }}>
                      <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
                      Last synced: {new Date(int.lastSync).toLocaleString("en-ZA")}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1.5">
                  {int.id === "email" && int.status === "connected" && (
                    <button onClick={testEmail} disabled={testingEmail} className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-colors" style={{ background: "rgba(45,212,191,0.1)", color: "#2DD4BF" }}>
                      {testingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <><TestTube2 className="inline w-3 h-3 mr-1" />Test</>}
                    </button>
                  )}
                  {int.id === "heal" && int.status === "disconnected" && (
                    <button onClick={() => setConfiguring("heal")} className="text-[10px] px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(129,140,248,0.1)", color: "#818CF8" }}>
                      Configure
                    </button>
                  )}
                  {int.id === "whatsapp" && int.status === "disconnected" && (
                    <div className="text-[10px] px-3 py-1.5 rounded-lg text-center" style={{ background: "rgba(232,200,74,0.1)", color: "#E8C84A" }}>
                      Needs Twilio
                    </div>
                  )}
                  {int.id === "healthbridge" && int.status === "disconnected" && (
                    <div className="text-[10px] px-3 py-1.5 rounded-lg text-center" style={{ background: "rgba(232,200,74,0.1)", color: "#E8C84A" }}>
                      Needs Credentials
                    </div>
                  )}
                  {int.id === "google_calendar" && int.status === "disconnected" && (
                    <div className="text-[10px] px-3 py-1.5 rounded-lg text-center" style={{ background: "rgba(232,200,74,0.1)", color: "#E8C84A" }}>
                      Needs OAuth
                    </div>
                  )}
                  {int.status === "connected" && (
                    <CheckCircle2 className="w-5 h-5" style={{ color: "#2DD4BF" }} />
                  )}
                </div>
              </div>

              {/* HEAL Config Form (inline) */}
              {configuring === "heal" && int.id === "heal" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "rgba(253,252,240,0.7)" }}>HEAL A2D24 Connection</p>
                  <div className="space-y-2">
                    <input value={healEndpoint} onChange={e => setHealEndpoint(e.target.value)} placeholder="HEAL API Endpoint (e.g. https://api.a2d24.com/v1)" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    <input value={healApiKey} onChange={e => setHealApiKey(e.target.value)} placeholder="API Key" type="password" className="w-full px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(253,252,240,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setConfiguring(null)} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "rgba(253,252,240,0.5)" }}>Cancel</button>
                      <button onClick={saveHealConfig} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(129,140,248,0.15)", color: "#818CF8" }}>Save & Connect</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Help text */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-xs" style={{ color: "rgba(253,252,240,0.4)" }}>
          <strong style={{ color: "rgba(253,252,240,0.6)" }}>Need help connecting?</strong> Environment variables (Twilio, Resend, Healthbridge, AI keys) are configured in your Vercel dashboard or .env.local file. Practice-specific configs (HEAL, Google Calendar) are saved per-practice in the database.
        </p>
      </div>
    </div>
  );
}
