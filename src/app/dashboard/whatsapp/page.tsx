"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, MapPin, Calendar, CheckCircle2, Phone, Clock, Zap } from "lucide-react";

// Simulated conversations showing the intended patient experience
const DEMO_CONVERSATIONS = [
  {
    title: "Find a GP near me",
    messages: [
      { from: "patient", text: "Hi, I need to see a GP near Sandton today", time: "09:14" },
      { from: "jess", text: "I can help! I found 3 Medicross clinics near Sandton with same-day GP availability:\n\n1. Medicross Sandton City \u2014 14:00, 15:30\n2. Medicross Rosebank \u2014 14:30\n3. Medicross Fourways \u2014 10:30, 16:00\n\nWhich would you prefer?", time: "09:14" },
      { from: "patient", text: "Sandton City at 14:00 please", time: "09:15" },
      { from: "jess", text: "Booked! \u2705 GP consultation at Medicross Sandton City, today at 14:00.\n\nPlease bring your medical aid card and ID.\nAddress: Sandton City Mall, Rivonia Rd\n\nI will send a reminder at 13:00. Is there anything else?", time: "09:15" },
    ],
  },
  {
    title: "Repeat prescription",
    messages: [
      { from: "patient", text: "My blood pressure meds are running out. Amlodipine 10mg", time: "11:32" },
      { from: "jess", text: "I can see your script for Amlodipine 10mg is on file at Medicross Sandton.\n\nThe Clicks pharmacy at Medicross Sandton has stock. Shall I send the repeat script there?\n\nAlternatively, Clicks Fourways and Clicks Rosebank also have stock.", time: "11:32" },
      { from: "patient", text: "Sandton please", time: "11:33" },
      { from: "jess", text: "Done! \u2705 Your Amlodipine 10mg script has been sent to Clicks Pharmacy, Medicross Sandton.\n\nYou can collect anytime during pharmacy hours (Mon-Fri 8am-6pm, Sat 8am-1pm).\n\nYour next check-up is due in 6 weeks. Shall I book it now?", time: "11:33" },
    ],
  },
  {
    title: "Emergency routing",
    messages: [
      { from: "patient", text: "My father is having chest pains, what do I do", time: "15:47" },
      { from: "jess", text: "\u26a0\ufe0f This sounds like it could be a medical emergency.\n\nPlease call Netcare 911 immediately: 082 911\n\nThey have 200+ rapid response vehicles and helicopters. Your location will be shared automatically.\n\nIf the chest pain is mild and not an emergency, the nearest Medicross with an urgent care slot is Medicross Sandton City \u2014 16:00 today.\n\nShall I book the urgent slot as backup?", time: "15:47" },
    ],
  },
];

export default function WhatsAppPage() {
  const [activeConvo, setActiveConvo] = useState(0);

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">WhatsApp Patient Router</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">One Number. 88 Clinics. 24/7.</h1>
        <p className="text-[14px] text-gray-500 mt-1 max-w-2xl">
          Patients message one WhatsApp number. AI identifies the service needed, finds the nearest Medicross with availability, and books instantly.
          No app download. No phone queue. No clinic-specific numbers.
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
          Simulated conversations — Twilio backend built, pending deployment
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Clinics Covered", value: "88", icon: MapPin, color: "#1D3443" },
          { label: "Available 24/7", value: "Always", icon: Clock, color: "#3DA9D1" },
          { label: "Avg Response Time", value: "<10 sec", icon: Zap, color: "#E3964C" },
          { label: "Phone Calls Reduced", value: "60%", icon: Phone, color: "#10B981" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-gray-200 bg-white text-center">
            <s.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: s.color }} />
            <div className="text-xl font-bold font-metric text-gray-900">{s.value}</div>
            <div className="text-[11px] text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Demo conversation selector */}
      <div className="flex gap-2">
        {DEMO_CONVERSATIONS.map((c, i) => (
          <button key={i} onClick={() => setActiveConvo(i)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeConvo === i ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>
            {c.title}
          </button>
        ))}
      </div>

      {/* WhatsApp mockup */}
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          {/* WhatsApp header */}
          <div className="bg-[#1D3443] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3DA9D1]/20 flex items-center justify-center">
              <img src="/images/netcare-logo.png" alt="Netcare" className="h-4" />
            </div>
            <div>
              <div className="text-white text-[13px] font-semibold">Netcare Medicross</div>
              <div className="text-white/40 text-[10px]">Online \u2022 AI-powered</div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-[#ECE5DD] p-4 space-y-2 min-h-[400px]">
            <AnimatePresence mode="wait">
              {DEMO_CONVERSATIONS[activeConvo].messages.map((msg, i) => (
                <motion.div
                  key={`${activeConvo}-${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.3 }}
                  className={`flex ${msg.from === "patient" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
                    msg.from === "patient" ? "bg-[#DCF8C6] text-gray-800" : "bg-white text-gray-700"
                  }`}>
                    {msg.text.split("\n").map((line, j) => (
                      <span key={j}>{line}{j < msg.text.split("\n").length - 1 && <br />}</span>
                    ))}
                    <div className="text-[9px] text-gray-400 text-right mt-1">{msg.time}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-3 gap-3">
        {[
          "Find nearest clinic", "Book GP / dental / optometry", "Check medical aid benefits",
          "Request repeat scripts", "Get operating hours", "Emergency routing to 911",
          "Check pharmacy stock", "Reschedule appointments", "Post-visit follow-up",
        ].map((cap, i) => (
          <motion.div key={cap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className="text-[12px] text-gray-600">{cap}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
