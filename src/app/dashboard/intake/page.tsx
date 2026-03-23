"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MessageSquare, FileUp, Sparkles, ChevronDown } from "lucide-react";
import VoiceIntakeTab from "@/components/intake/VoiceIntakeTab";
import ChatIntakeTab from "@/components/intake/ChatIntakeTab";
import DocumentsTab from "@/components/intake/DocumentsTab";

type Tab = "voice" | "chat" | "documents";

const TABS: { id: Tab; label: string; icon: typeof Mic; desc: string }[] = [
  { id: "voice", label: "Voice", icon: Mic, desc: "Record & analyze" },
  { id: "chat", label: "Chat", icon: MessageSquare, desc: "AI assistant" },
  { id: "documents", label: "Documents", icon: FileUp, desc: "Upload files" },
];

export default function IntakePage() {
  const [activeTab, setActiveTab] = useState<Tab>("voice");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [patients, setPatients] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/patients")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPatients(data.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch(() => {});
  }, []);

  // Handle hash-based tab switching (from chat "Generate Summary" button)
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as Tab;
    if (["voice", "chat", "documents"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Intake Suite</h1>
          <p className="text-sm text-white/40 mt-1">Voice recording, AI chat, document management, and clinical analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-xs text-teal-400 font-semibold">Powered by VRL-Claims</span>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="mb-6">
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2 font-semibold">Patient</label>
        <div className="relative">
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full md:w-80 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="">Select patient (optional)</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className="hidden md:inline text-[10px] opacity-60">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "voice" && (
            <VoiceIntakeTab
              selectedPatient={selectedPatient}
              patients={patients}
            />
          )}
          {activeTab === "chat" && (
            <ChatIntakeTab
              selectedPatient={selectedPatient}
              patients={patients}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsTab
              selectedPatient={selectedPatient}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
