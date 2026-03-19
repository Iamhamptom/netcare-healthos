
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const bold = (t: string) => `<b>${t}</b>`;

// ─── COMPREHENSIVE KNOWLEDGE BASE ──────
// Covers: product, Netcare integration, Sara's pain points, competitors, pricing, tech

function getResponse(query: string): string {
  const q = query.toLowerCase();

  // ═══ SARA'S 3 PAIN POINTS (from email) ═══

  // Pain Point 1: Admin hours eating patient care time
  if (q.includes("admin") || q.includes("patient care") || q.includes("operational drag") || q.includes("time") && q.includes("save")) {
    return `${bold("How We Fix: Admin Hours → Patient Care")}\n\nYour current state: Across 88 clinics, admin staff spend 60%+ of time on manual billing corrections, claims resubmission, eRA reconciliation, and compliance paperwork.\n\n${bold("What VisioHealth OS does:")}\n\n1. ${bold("AI Claims Pre-validation")} — validates ICD-10-ZA codes, NAPPI codes, and PMB benefits BEFORE submission. Catches 75% of errors automatically.\n\n2. ${bold("eRA Auto-Reconciliation")} — replaces the Excel-based payment matching that 568 practitioners do independently. One automated system.\n\n3. ${bold("Automated POPIA Compliance")} — consent tracking, audit logging, breach detection across all clinics. No manual audits.\n\n4. ${bold("WhatsApp Patient Router")} — patients self-serve for bookings, repeat scripts, and queries 24/7. Fewer phone calls for staff.\n\n${bold("Impact:")} Frees up an estimated 40% of admin time across the network. That is time back on patient care.`;
  }

  // Pain Point 2: Billing requiring constant human correction
  if (q.includes("billing") || q.includes("correction") || q.includes("claim") || q.includes("rejection") || q.includes("icd") || q.includes("nappi") || q.includes("coding")) {
    return `${bold("How We Fix: Billing Errors & Claims Rejections")}\n\nYour current state: Industry first-pass rejection rate is 15-25% in SA private healthcare. Each rejected claim costs R50-R150 in rework time plus delayed cash flow.\n\n${bold("Our AI Claims Intelligence Engine:")}\n\n1. ${bold("Pre-submission validation")} — checks every claim against ICD-10-ZA coding rules, NAPPI formulary matching, and PMB benefit limits before it hits Altron SwitchOn\n\n2. ${bold("Top rejection prevention:")}\n   - E11.9 (Type 2 DM) — auto-attaches HbA1c motivation\n   - Z00.0 (Screening) — pre-checks benefit limits\n   - J06.9 (URTI) — flags duplicate claims within 14 days\n   - K04.0 (Dental) — alerts when benefits exhausted\n   - NAPPI mismatches — syncs with scheme formularies monthly\n\n3. ${bold("Auto-resubmission")} — rejected claims are corrected and resubmitted without manual intervention\n\n${bold("Impact:")} Rejection rate drops from 15% to under 5%. That is R21.6M/year in recovered revenue across the division.`;
  }

  // Pain Point 3: Patient communication falling through cracks between facilities
  if (q.includes("communication") || q.includes("between facilities") || q.includes("cracks") || q.includes("patient") && (q.includes("follow") || q.includes("lost") || q.includes("miss"))) {
    return `${bold("How We Fix: Patient Communication Between Facilities")}\n\nYour current state: A patient at Medicross Sandton has no record at Medicross Fourways. Referrals get lost. Follow-ups fall through cracks. Recall reminders are clinic-specific, not network-wide.\n\n${bold("What VisioHealth OS does:")}\n\n1. ${bold("Unified Patient Records")} — one patient profile across all 88 clinics. Medical history, medications, allergies, and consent travel with the patient.\n\n2. ${bold("WhatsApp Patient Router")} — patients message one number, AI routes to the right clinic. No more "call this number for Sandton, that number for Fourways."\n\n3. ${bold("Automated Recall System")} — network-wide recall for chronic care, dental check-ups, wellness screenings. Patients do not fall through cracks.\n\n4. ${bold("Cross-Facility Referrals")} — digital referral tracking from Medicross to specialist to hospital and back. Full visibility.\n\n5. ${bold("Treatment Follow-up Sequences")} — automated WhatsApp check-ins post-consultation, medication reminders, and care plan adherence tracking.\n\n${bold("Impact:")} Zero patients lost between facilities. 60% fewer phone calls. 40% reduction in missed follow-ups.`;
  }

  // ═══ THE 5 AI AGENTS (promised in email) ═══

  if (q.includes("agent") || q.includes("five") || q.includes("5 ai") || q.includes("autonomous")) {
    return `${bold("The 5 AI Agents Running Your Operations")}\n\nAs described in our email to you — five AI agents running autonomously across all facilities:\n\n1. ${bold("Triage Agent")} — WhatsApp-based patient triage. Assesses urgency, routes to right service (GP, dental, optometry, emergency). Integrates with Netcare 911 for emergencies.\n\n2. ${bold("Intake Agent")} — Pre-appointment data collection via WhatsApp. Medical aid details, symptoms, medication history collected BEFORE the patient arrives. Saves 10-15 minutes per consultation.\n\n3. ${bold("Scheduling Agent")} — AI manages calendars across 568 practitioners. Optimises slot utilisation, predicts no-shows, sends automated reminders. Patients book via WhatsApp or online 24/7.\n\n4. ${bold("Billing Agent")} — Claims intelligence engine. Pre-validates ICD-10-ZA, NAPPI, PMB benefits. Auto-corrects coding errors. Manages eRA reconciliation. Tracks debtor aging.\n\n5. ${bold("Follow-up Agent")} — Post-consultation check-ins, medication adherence, recall scheduling, chronic care management. No patient falls through the cracks.\n\n${bold("Group-Level Oversight:")} You see all 5 agents working across all 88 clinics from one dashboard — the Network Financial Command Center.`;
  }

  // ═══ PRODUCT & FEATURES ═══

  if (q.includes("feature") || q.includes("what can") || q.includes("what does") || q.includes("module") || q.includes("suite") || q.includes("overview")) {
    return `${bold("VisioHealth OS — 10 AI Modules for Netcare")}\n\n1. AI Claims Intelligence — ICD-10-ZA + NAPPI pre-validation\n2. WhatsApp Patient Router — one number, 88 clinics\n3. Network Financial Dashboard — real-time divisional P&L\n4. Smart Booking Engine — 568 practitioner calendars\n5. Multi-Site Patient Management — unified records\n6. POPIA Compliance Engine — automated across 8 provinces\n7. Capitation Analytics — Prime Cure PMPM monitoring\n8. AI Triage & Virtual Care — WhatsApp-based assessment\n9. eRA Auto-Reconciliation — replaces Excel matching\n10. Pharmacy Intelligence — NAPPI sync for 41 pharmacies\n\n${bold("All modules run on one platform.")} Sara, you see everything from one dashboard. Each clinic gets the same tools. New facility live in under 48 hours.`;
  }

  // POPIA
  if (q.includes("popia") || q.includes("compliance") || q.includes("privacy") || q.includes("data protection") || q.includes("hpcsa") || q.includes("consent")) {
    return `${bold("POPIA & Compliance")}\n\nVisioHealth OS is POPIA compliant from day one:\n\n- ${bold("Consent Tracking:")} 4 types (treatment, data processing, marketing, research) tracked digitally for every patient across all 88 clinics\n- ${bold("POPIA s18-s72:")} Full compliance with Protection of Personal Information Act\n- ${bold("HPCSA Booklet 10:")} AI clinical disclaimer on all outputs\n- ${bold("Audit Logging:")} Every patient data access logged with timestamp, user, and action\n- ${bold("Breach Detection:")} Automated alerts for unusual data access patterns\n- ${bold("Data Subject Rights:")} Public form for access, correction, deletion requests (30-day SLA)\n- ${bold("Role-Based Access:")} Each staff member sees only what they need\n\n${bold("Compliance across 8 provinces:")} Automated. No manual audits needed. Zero findings target.`;
  }

  // White-label / 48 hours
  if (q.includes("white") || q.includes("label") || q.includes("48 hour") || q.includes("new facility") || q.includes("deploy") || q.includes("rollout") || q.includes("how fast") || q.includes("how long")) {
    return `${bold("White-Label & Speed of Deployment")}\n\nAs promised: ${bold("new facility live in under 48 hours.")}\n\n${bold("How:")}\n1. Connect to clinic PMS (Healthbridge/GoodX) — automated import\n2. Configure ICD-10-ZA + NAPPI validation rules — pre-built for SA\n3. Set up WhatsApp routing for the new facility\n4. Import patient data (POPIA consent included)\n5. Train staff (2-3 hour session)\n\n${bold("White-label:")} The platform runs under Netcare branding. Your staff and patients see Netcare, not VisioHealth OS. Colours, logo, tagline — all yours.\n\n${bold("Regional rollout option:")} Start with 1 region (e.g., Gauteng North — 5 clinics). Prove ROI in 8 weeks. Then expand.`;
  }

  // ═══ NETCARE-SPECIFIC ═══

  // Integration with existing systems
  if (q.includes("integrat") || q.includes("careon") || q.includes("sap") || q.includes("switchon") || q.includes("mediswitch") || q.includes("existing") || q.includes("system")) {
    return `${bold("How We Integrate With Your Existing Systems")}\n\nWe do not replace anything. We connect and enhance.\n\n- ${bold("CareOn EMR")} (26 hospitals, 34K users) — we extend CareOn intelligence to your 88 primary care clinics. The gap CareOn does not cover.\n- ${bold("SAP for Healthcare")} (R100M investment) — we add an AI analytics layer on top. Financial dashboards pull from SAP data.\n- ${bold("Altron SwitchOn")} (claims switching) — we pre-validate claims BEFORE they hit the switch. 75% of rejections caught.\n- ${bold("MediSwitch EDI")} (eRA processing) — we auto-reconcile electronic Remittance Advice. No more manual Excel matching.\n- ${bold("IBM Watson Micromedex")} — we surface drug interaction alerts in the booking and dispensing flow.\n- ${bold("Corsano Wearables")} (6,000 beds) — we integrate continuous vitals alerts into primary care follow-ups.\n- ${bold("Netcare App")} (iOS/Android/Huawei) — we add WhatsApp as a parallel channel.\n\n${bold("Nothing breaks. Everything gets better.")}`;
  }

  // Savings / ROI / cost
  if (q.includes("sav") || q.includes("cost") || q.includes("roi") || q.includes("money") || q.includes("reduce") || q.includes("how much")) {
    return `${bold("Financial Impact — R95M+/Year Addressable")}\n\n1. Claims Pre-validation: ${bold("R21.6M/year")} — rejection rate 15% to under 5%\n2. eRA Reconciliation: ${bold("R10.1M/year")} — replaces manual Excel matching\n3. Debtor Recovery: ${bold("R33M/year")} — debtor days 42 to 28\n4. Capitation Analytics: ${bold("R7.9M/year")} — Prime Cure PMPM overspend detection\n5. Compliance Automation: ${bold("R5.8M/year")} — no more manual POPIA audits\n6. Pharmacy Optimisation: ${bold("R16.8M/year")} — freed working capital\n\n${bold("Total: R95.2M/year addressable.")}\n\n${bold("Pilot ROI:")} 8-week regional pilot. Zero capital risk. Board-ready report at week 8.\n${bold("Global benchmark:")} 3.2X average ROI within 14 months (Johns Hopkins, HCA Healthcare data).`;
  }

  // Revenue / financials
  if (q.includes("revenue") || q.includes("r662") || q.includes("ebitda") || q.includes("financial") || q.includes("division")) {
    return `${bold("Netcare Primary Care Division")}\n\n- Revenue: R662M (FY2025, -7% headline, +2.8% underlying)\n- EBITDA: R162M (24.5% margin, up 150bps)\n- Clinics: 88 (55 Medicross + 5 Prime Cure + others)\n- Pharmacies: 41 (Clicks-operated since 2016)\n- Day theatres: 15\n- Practitioners: 568 independent GPs and dentists\n- Patients: 3.5M annually\n- Capitated lives: 254,000 (Prime Cure)\n\n${bold("Our impact on these numbers:")}\n- Revenue protection: R21.6M/year from claims recovery\n- Margin improvement: compliance and admin automation\n- Cash flow: debtor days 42 to 28 = R14M freed\n- Growth: WhatsApp patient routing increases utilisation 15-20%`;
  }

  // Competition / Discovery / Flexicare
  if (q.includes("discovery") || q.includes("compet") || q.includes("flexicare") || q.includes("life") || q.includes("mediclinic")) {
    return `${bold("Competitive Landscape")}\n\n${bold("Discovery Health + Clicks (Flexicare):")}\nLaunching affordable primary care through 800+ Clicks stores. Direct threat to Medicross walk-in model. VisioHealth OS gives Netcare the technology moat to defend market share.\n\n${bold("Life Healthcare:")}\nDeploying MEDITECH Expanse (AI-enabled cloud EHR). Advancing digital capabilities. Their hospital tech is improving — Netcare needs primary care tech to match.\n\n${bold("Global benchmark:")}\nHCA Healthcare (USA, 191 hospitals) achieving 85% autonomous AI coding. Mayo Clinic licensing AI to other systems. Cleveland Clinic saving 14 min/day per clinician with ambient AI.\n\n${bold("Our edge:")} None of these have AI claims pre-validation for primary care networks, WhatsApp patient routing, or real-time network analytics. We fill the gap.`;
  }

  // Pilot / getting started
  if (q.includes("pilot") || q.includes("start") || q.includes("begin") || q.includes("next step") || q.includes("how do we") || q.includes("onboard")) {
    return `${bold("How to Get Started — 8-Week Regional Pilot")}\n\n${bold("Step 1:")} Choose a region (e.g., Gauteng North — 5 clinics)\n${bold("Step 2:")} We connect to your clinic systems (48 hours)\n${bold("Step 3:")} AI claims validation, WhatsApp routing, and financial dashboard go live\n${bold("Step 4:")} 6 weeks of live operation with weekly progress reports\n${bold("Step 5:")} Board-ready ROI report at week 8\n\n${bold("Zero capital risk.")} SaaS model. Cancel anytime after pilot.\n${bold("Data isolated")} to pilot region — you control visibility.\n${bold("Staff training:")} 2-3 hours per clinic.\n\nThe pilot report becomes your business case for network-wide rollout.\n\nReady to choose your pilot region? Visit the ${bold("Start Pilot")} page in the sidebar.`;
  }

  // About VisioHealth / who built this
  if (q.includes("visio") || q.includes("who built") || q.includes("company") || q.includes("research lab") || q.includes("african")) {
    return `${bold("About VisioHealth OS")}\n\nVisioHealth OS is built by ${bold("Visio Research Labs")} — an African-native AI company headquartered in Johannesburg, South Africa.\n\n- ${bold("120+ peer-reviewed citations")} backing our healthcare research\n- ${bold("VRL-001:")} Our flagship research paper on the healthcare routing crisis\n- ${bold("Purpose-built for SA healthcare:")} ICD-10-ZA, NAPPI, POPIA, medical scheme integration\n- ${bold("Not a Silicon Valley import:")} We understand Netcare, medical aids, and SA healthcare from the inside\n\nThe platform was built specifically for Netcare Primary Healthcare after extensive research into your division, tech stack, and operational challenges.\n\nDavid M. Hampton, Managing Director, VisioCorp\ndavidhampton@visiocorp.co`;
  }

  // Pricing
  if (q.includes("pric") || q.includes("how much does it cost") || q.includes("subscription") || q.includes("license")) {
    return `${bold("Pricing")}\n\nVisioHealth OS uses a SaaS (Software as a Service) model:\n\n- ${bold("Per-clinic monthly subscription")} — scales with your rollout\n- ${bold("Enterprise umbrella license")} available for network-wide deployment\n- ${bold("No upfront capital expenditure")} — operational expense only\n- ${bold("8-week pilot included")} — no commitment beyond pilot\n\nPricing details are shared during the demo walkthrough. Contact David Hampton directly at davidhampton@visiocorp.co for a customised proposal.\n\nThe ROI typically exceeds the subscription cost within 3-4 months.`;
  }

  // Default
  return `I can help you with anything about VisioHealth OS and how it works for Netcare. Try asking about:\n\n- ${bold("How do you fix admin time going to billing instead of patient care?")}\n- ${bold("How does AI claims validation work?")}\n- ${bold("How do patients not fall through cracks between facilities?")}\n- ${bold("What are the 5 AI agents?")}\n- ${bold("How do you integrate with CareOn, SAP, and SwitchOn?")}\n- ${bold("What is the ROI / cost savings?")}\n- ${bold("How do we start a pilot?")}\n- ${bold("Is it POPIA compliant?")}\n- ${bold("How fast can a new facility go live?")}\n- ${bold("Who is VisioHealth OS?")}\n\nOr ask me anything else — I know the Netcare ecosystem inside and out.`;
}

let msgCounter = 0;

export default function NetcareAssistant() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your VisioHealth OS assistant — built specifically for Netcare Primary Healthcare. I can answer any question about the platform, how it solves your operational challenges, integrations with your existing systems, or the pilot process. What would you like to know?",
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
    }, 600 + Math.random() * 400);
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
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E3964C] animate-pulse" />
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
                  <div className="text-[13px] text-white font-semibold">VisioHealth OS Assistant</div>
                  <div className="text-[10px] text-white/40">Ask me anything about the platform</div>
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
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/\\n/g, "<br/>").replace(/\n/g, "<br/>") }}
                  />
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-[13px] text-gray-400">
                    <span className="animate-pulse">Thinking...</span>
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
                  placeholder="Ask about features, savings, compliance..."
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
                {["How do you fix billing?", "5 AI agents", "Integration with CareOn", "Cost savings", "Start a pilot", "POPIA compliance"].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#3DA9D1]/10 hover:text-[#1D3443] transition-colors font-medium"
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
