"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cable, CheckCircle2, Clock, XCircle, ExternalLink, Settings } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "connected" | "pending" | "disconnected";
  description: string;
  lastSync?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "healthbridge", name: "Healthbridge", type: "Claims Switch", status: "connected", description: "Primary claims switching house — Discovery, Bonitas, Momentum, GEMS", lastSync: "2 min ago" },
  { id: "medikredit", name: "MediKredit", type: "Claims Switch", status: "connected", description: "Secondary switch — CompCare, Medshield, Makoti, PPS", lastSync: "5 min ago" },
  { id: "switchon", name: "SwitchOn (Altron)", type: "Claims Switch", status: "connected", description: "Tertiary switch — Polmed, Bestmed, Fedhealth, GEMS overflow", lastSync: "8 min ago" },
  { id: "fhir", name: "FHIR R4 Server", type: "Interoperability", status: "connected", description: "HL7 FHIR R4 compliant server for health data exchange", lastSync: "1 min ago" },
  { id: "hl7", name: "HL7v2 Parser", type: "Interoperability", status: "connected", description: "ADT, ORM, ORU message parsing and routing" },
  { id: "careconnect", name: "CareConnect HIE", type: "Health Information Exchange", status: "pending", description: "National Health Information Exchange — awaiting accreditation" },
  { id: "whatsapp", name: "WhatsApp Business", type: "Communication", status: "connected", description: "Patient messaging, appointment reminders, follow-ups", lastSync: "Just now" },
  { id: "elevenlabs", name: "ElevenLabs", type: "Voice AI", status: "connected", description: "Text-to-speech for AI voice intake and clinical scribe", lastSync: "Active" },
  { id: "gemini", name: "VRL AI Engine", type: "AI Engine", status: "connected", description: "Clinical transcription, SOAP generation, claims analysis", lastSync: "Active" },
  { id: "mediswitch", name: "MediSwitch", type: "Claims Certification", status: "pending", description: "Claims switch certification — in progress" },
  { id: "sms", name: "SMS Gateway", type: "Communication", status: "disconnected", description: "Bulk SMS for recall campaigns and notifications" },
  { id: "email", name: "Email (SMTP)", type: "Communication", status: "disconnected", description: "Transactional email for reports and statements" },
];

const statusConfig = {
  connected: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Connected" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending" },
  disconnected: { icon: XCircle, color: "text-zinc-500", bg: "bg-zinc-800", label: "Not Connected" },
};

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const types = ["all", ...new Set(INTEGRATIONS.map(i => i.type))];
  const filtered = filter === "all" ? INTEGRATIONS : INTEGRATIONS.filter(i => i.type === filter);
  const connected = INTEGRATIONS.filter(i => i.status === "connected").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 -m-[1px] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Cable className="w-6 h-6 text-teal-400" />
              Integrations Hub
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {connected}/{INTEGRATIONS.length} integrations connected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              {connected} Active
            </span>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === t
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                  : "bg-zinc-900 text-white/40 border border-zinc-800 hover:text-white/60"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((integration, i) => {
            const status = statusConfig[integration.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">{integration.type}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${status.color}`} />
                    <span className={`text-[10px] font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                <p className="text-xs text-white/40 leading-relaxed mb-3">{integration.description}</p>

                <div className="flex items-center justify-between">
                  {integration.lastSync && (
                    <span className="text-[10px] text-white/20">Last sync: {integration.lastSync}</span>
                  )}
                  <div className="flex-1" />
                  <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-white/30 hover:text-white/60 transition-all">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
