"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const bold = (t: string) => `<b>${t}</b>`;

function getResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("revenue") || q.includes("r662") || q.includes("turnover")) {
    return `${bold("Division Revenue (FY2025):")} R662M (-7.0% headline, +2.8% underlying excl. lost occ health contract).\n\n${bold("MTD March 2026:")} R55.2M on track.\n${bold("EBITDA Margin:")} 24.5% (up 150bps YoY).\n${bold("Group context:")} Primary Care = 2.5% of R26.3B group, but high-margin.\n\nWant breakdown by region or clinic?`;
  }

  if (q.includes("claim") || q.includes("rejection") || q.includes("icd")) {
    return `${bold("Claims MTD:")}\n- Submitted via MediSwitch: 34,892\n- First-pass rejections: 5,234 (15%)\n- Value at risk: R3.85M\n- Preventable by AI: R2.9M (75%)\n\n${bold("Top Rejections:")}\n1. E11.9 (DM) missing HbA1c: R1.2M\n2. Z00.0 (Screening) not covered: R890K\n3. J06.9 (URTI) duplicate: R420K\n4. K04.0 (Dental) exhausted: R780K\n5. NAPPI mismatch: R560K`;
  }

  if (q.includes("sav") || q.includes("cost") || q.includes("reduce")) {
    return `${bold("Total Savings: R8.4M/month (R100M+/year)")}\n\n1. ICD-10-ZA + NAPPI pre-validation: R1.8M/month\n2. eRA auto-reconciliation: R840K/month\n3. Debtor aging intelligence: R3.2M recoverable\n4. Capitation analytics: R660K/month\n5. POPIA compliance engine: R480K/month\n6. Pharmacy inventory: R1.4M freed capital\n\nWhich area to explore?`;
  }

  if (q.includes("patient") || q.includes("how many")) {
    return `${bold("Network Patients:")}\n- Annual: ~3.5 million\n- Capitated (Prime Cure): 254,000\n- NetcarePlus prepaid: ~35,000\n- Discovery: 89K, GEMS: 42K, Bonitas: 31K, Momentum: 24K\n\n${bold("Growth:")} WhatsApp booking could increase utilisation 15-20%.`;
  }

  if (q.includes("debtor") || q.includes("outstanding") || q.includes("aging")) {
    return `${bold("Debtor Aging:")}\n- Total >60 days: R8.9M (target: <R7M)\n- GEMS: R890K, 21-day avg\n- Medihelp: R620K, 24-day avg\n- Patient balances: R1.2M >30 days\n\n${bold("AI fix:")} Automated follow-up. Recovery: R3.2M.`;
  }

  if (q.includes("clinic") || q.includes("branch") || q.includes("performance")) {
    return `${bold("Top Clinics (revenue MTD):")}\n1. Prime Cure Occ Health: R3.2M (107%)\n2. Medicross Sandton: R2.45M (88%)\n3. Medicross Cape Town: R2.1M (88%)\n4. Medicross Fourways: R1.98M (90%)\n5. Medicross Soweto: R1.89M (95%)\n\n${bold("Attention:")}\n- Soweto: 10% rejection rate\n- Fourways: 8% rejection rate`;
  }

  if (q.includes("capitat") || q.includes("prime cure") || q.includes("pmpm")) {
    return `${bold("Prime Cure:")}\n- Lives: 254,000\n- PMPM rate: R287\n- Monthly income: ~R72.9M\n- Utilisation: R74M (R1.1M over)\n\n${bold("Risk:")} Post contract loss, capitation is key revenue. Stay within bounds.`;
  }

  if (q.includes("popia") || q.includes("compliance")) {
    return `${bold("Compliance:")}\n- POPIA consent: Active, 88 clinics\n- Score: 90%+\n- HPCSA Booklet 10: Aligned\n- Audit logging: All access tracked\n\n${bold("Risk:")} 2 KZN clinics still paper-only.`;
  }

  if (q.includes("tech") || q.includes("system") || q.includes("careon")) {
    return `${bold("Tech Stack:")}\n- CareOn EMR (Deutsche Telekom, 34K users)\n- SAP Healthcare ERP (R100M)\n- Altron SwitchOn + MediSwitch\n- IBM Watson Micromedex\n- Corsano wearables (6,000 beds)\n- A2D24 VirtualCare (50 centres)\n\n${bold("Gap:")} CareOn = hospitals. Primary care = fragmented. We unify.`;
  }

  if (q.includes("discovery") || q.includes("compet")) {
    return `${bold("Competition:")}\n\nDiscovery + Clicks (Flexicare): Direct threat via 800+ Clicks stores.\nLife Healthcare: MEDITECH Expanse EHR.\nMediclinic: Global ops (Switzerland, UAE).\n\n${bold("Our edge:")} None have AI claims pre-validation or WhatsApp routing for primary care.`;
  }

  return `I can help with:\n\n- Revenue and financials\n- Claims intelligence\n- Cost savings (R8.4M/month)\n- Patient data and growth\n- Clinic performance\n- Debtor analysis\n- Capitation analytics\n- POPIA compliance\n- Technology stack\n- Competitive intel\n\nWhat would you like to explore?`;
}

let msgCounter = 0;

export default function NetcareAssistant() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your Netcare Health OS assistant. I can pull data across the network: financials, claims, patients, compliance, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `msg-${++msgCounter}`, role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(userMsg.content);
      setMessages(prev => [...prev, { id: `msg-${++msgCounter}`, role: "assistant", content: response, timestamp: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 400);
  };

  return (
    <>
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D3443] to-[#3DA9D1] text-white shadow-xl shadow-[#1D3443]/30 hover:shadow-2xl hover:shadow-[#3DA9D1]/40 hover:scale-105 transition-all flex items-center justify-center ring-2 ring-white/20"
        >
          <Bot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#3DA9D1] animate-pulse" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-[9990] glass-chatbot rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden ${
              expanded ? "bottom-4 right-4 left-[20%] top-4" : "bottom-6 right-6 w-[400px] h-[540px]"
            }`}
          >
            <div className="px-4 py-3 bg-[#1D3443] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#E3964C]" />
                </div>
                <div>
                  <div className="text-[13px] text-white font-semibold">Netcare AI Assistant</div>
                  <div className="text-[10px] text-white/40">Powered by VisioHealth OS</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-white/40 hover:text-white rounded transition-colors">
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 text-white/40 hover:text-white rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user" ? "bg-[#1D3443] text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }}
                  />
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-[13px] text-gray-400">
                    <span className="animate-pulse">Analysing data...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about revenue, claims, patients..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3DA9D1]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-[#1D3443] text-white flex items-center justify-center hover:bg-[#152736] transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {["Show revenue", "Claims analysis", "Cost savings", "Clinic performance", "Debtors"].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#3DA9D1]/10 hover:text-[#1D3443] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
