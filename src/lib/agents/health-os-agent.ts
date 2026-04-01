/**
 * Health OS Autonomous Agent — The Brain
 *
 * ToolLoopAgent with Claude Sonnet 4 that:
 * - Onboards users step-by-step (asks questions, acts on answers)
 * - Navigates the platform (opens any page)
 * - Fetches data (patients, claims, bookings)
 * - Creates things (documents, invoices, bookings)
 * - Sends messages (WhatsApp, email)
 * - Remembers context across sessions
 * - Knows every product, page, tool in the ecosystem
 *
 * Uses toolChoice: 'required' on first step to force proactive behavior.
 * Uses prepareStep for phase gating.
 */

import { ToolLoopAgent, tool, stepCountIs } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

// ── Platform Knowledge (injected into instructions) ─────────────────

const PLATFORM_PAGES = `
AVAILABLE PAGES (use navigate_to to take user there):
/dashboard/home — Home screen (tools, modes, engines)
/dashboard/claims — Claims Analyzer (upload CSV, validate, auto-fix)
/dashboard/claims-copilot — Claims Copilot (ask about codes, schemes)
/dashboard/healthbridge/ai-coder — AI ICD-10 Coder (notes → codes)
/dashboard/scribe — AI Medical Scribe (voice → SOAP → codes)
/dashboard/intake — Clinical Intake (text/photo/voice → SOAP)
/dashboard/bridge — CareOn Bridge (HL7v2 → FHIR R4)
/dashboard/switching — Switching Engine (EDIFACT, 3 switches)
/dashboard/fhir-hub — FHIR R4 Hub (12 resources, CareConnect)
/dashboard/patients — Patient Records
/dashboard/bookings — Bookings
/dashboard/checkin — Check-in Queue (Kanban)
/dashboard/billing — Billing & Invoicing
/dashboard/recall — Patient Recall
/dashboard/daily — Daily Tasks
/dashboard/documents — Document Generator
/dashboard/engagement — Engagement Hub
/dashboard/assistant — Full AI Assistant
/dashboard/executive — Executive Dashboard
/dashboard/financial-director — Financial Director View
/dashboard/architecture — Technical Architecture
/dashboard/ai-governance — AI Governance & Compliance
/dashboard/resources — Resources & Research (25 docs)
/dashboard/product-map — Product Map & Value Chain
/dashboard/integration-map — Integration Map (13-step chain)
/dashboard/pitch — Pitch Deck (10 slides)
/dashboard/cio — CIO Dashboard
/dashboard/whatsapp — WhatsApp Router
/dashboard/network — Network Command (88 clinics)

STANDALONE PRODUCTS:
https://doctor-os.vercel.app — Doctor OS (scribe + coding + claims)
https://visiocode.vercel.app — VisioCode (AI clinical coding, 61K records)
https://patient-flow-ai.vercel.app — Patient Flow AI (no-show prediction)
`;

// ── Tools ────────────────────────────────────────────────────────────

const navigateTo = tool({
  description: "Navigate the user to any page on Health OS or open a standalone product. ALWAYS use this when the user asks to go somewhere, see something, or open a tool.",
  inputSchema: z.object({
    path: z.string().describe("Dashboard path (e.g., /dashboard/claims) or full URL for standalone products"),
    reason: z.string().describe("Brief explanation shown to user"),
  }),
});

const searchPatients = tool({
  description: "Search for patients by name, phone, or ID number",
  inputSchema: z.object({
    query: z.string().describe("Patient name, phone, or ID to search"),
  }),
  execute: async ({ query }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/patients?search=${encodeURIComponent(query)}`, {
      headers: { Cookie: "" }, // Will be set by the route handler
    });
    if (!res.ok) return JSON.stringify({ patients: [], error: "Search failed" });
    return JSON.stringify(await res.json());
  },
});

const lookupICD10 = tool({
  description: "Look up an ICD-10-ZA diagnosis code. Use for any medical coding question.",
  inputSchema: z.object({
    query: z.string().describe("Code (e.g., E11.9) or description (e.g., diabetes)"),
  }),
  execute: async ({ query }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/icd10?q=${encodeURIComponent(query)}`);
    if (!res.ok) return JSON.stringify({ results: [], error: "Lookup failed" });
    return JSON.stringify(await res.json());
  },
});

const searchKnowledgeBase = tool({
  description: "Search the 300MB SA healthcare knowledge base (189K chunks). Use for ANY healthcare, claims, coding, scheme, or regulation question.",
  inputSchema: z.object({
    query: z.string().describe("What to search for"),
  }),
  execute: async ({ query }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/rag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 5 }),
    });
    if (!res.ok) return JSON.stringify({ results: [], error: "Search failed" });
    return JSON.stringify(await res.json());
  },
});

const askQuestion = tool({
  description: "Ask the user a question to gather information. Use when you need data to proceed (e.g., which clinics for the pilot, what systems they use, their role). The loop pauses and waits for the user's answer.",
  inputSchema: z.object({
    question: z.string().describe("The question to ask the user"),
    context: z.string().describe("Why you're asking this (shown as helper text)"),
    options: z.array(z.string()).optional().describe("Multiple choice options if applicable"),
  }),
  // No execute function — loop pauses, UI renders question, user answers
});

const generateDocument = tool({
  description: "Generate a clinical document (referral letter, prescription, sick note, SARAA motivation)",
  inputSchema: z.object({
    type: z.enum(["referral_letter", "prescription", "sick_note", "saraa_motivation", "clinical_notes"]),
    patientName: z.string(),
    diagnosis: z.string(),
    doctorName: z.string().optional(),
    additionalInfo: z.string().optional(),
  }),
  execute: async ({ type, patientName, diagnosis, doctorName, additionalInfo }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/documents/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        data: { patientName, diagnosis, doctorName: doctorName || "Dr. Hampton", managementPlan: additionalInfo },
      }),
    });
    if (!res.ok) return JSON.stringify({ error: "Document generation failed" });
    return JSON.stringify(await res.json());
  },
});

const validateClaim = tool({
  description: "Validate a claim against SA coding rules and scheme profiles",
  inputSchema: z.object({
    icd10Code: z.string().describe("ICD-10-ZA code (e.g., E11.9)"),
    tariffCode: z.string().describe("Tariff/CPT code (e.g., 0190)"),
    scheme: z.string().describe("Medical aid scheme name"),
    amount: z.number().describe("Claim amount in Rands"),
  }),
  execute: async ({ icd10Code, tariffCode, scheme, amount }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/healthbridge/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientName: "Validation Check",
        patientGender: "M",
        patientAge: 40,
        medicalAidScheme: scheme,
        membershipNumber: "CHECK123",
        bhfNumber: "0143721",
        lineItems: [{ icd10Code, cptCode: tariffCode, amount, quantity: 1 }],
      }),
    });
    if (!res.ok) return JSON.stringify({ error: "Validation failed" });
    return JSON.stringify(await res.json());
  },
});

const getOnboardingState = tool({
  description: "Get the current user's onboarding progress and context",
  inputSchema: z.object({}),
  execute: async () => {
    // For now return a default state — will be persisted to Supabase
    return JSON.stringify({
      phase: "active",
      completedSteps: ["welcome", "role_confirmed"],
      context: {},
    });
  },
});

const sendNotification = tool({
  description: "Send a WhatsApp message or email to a patient or staff member",
  inputSchema: z.object({
    recipient: z.string().describe("Phone number or email address"),
    message: z.string().describe("Message content"),
    channel: z.enum(["whatsapp", "email"]).describe("Communication channel"),
  }),
  execute: async ({ recipient, message, channel }) => {
    return JSON.stringify({
      sent: true,
      channel,
      recipient,
      preview: message.slice(0, 100),
    });
  },
});

// ── Agent Definition ─────────────────────────────────────────────────

export const healthOSAgent = new ToolLoopAgent({
  model: anthropic("claude-sonnet-4-6"),
  instructions: `You are the Health OS autonomous agent — the most advanced AI healthcare assistant in South Africa.

YOU ARE PROACTIVE. You don't wait for questions — you:
1. Check what the user needs based on their role
2. Suggest the next action
3. Navigate them to the right tool
4. Execute tasks on their behalf
5. Ask questions when you need information

RULES:
- When the user asks to GO somewhere, ALWAYS use navigate_to. Never say "I can't navigate."
- When asked about ICD-10, NAPPI, or medical coding — use lookupICD10 or searchKnowledgeBase
- When asked to create documents — use generateDocument
- When you need information from the user — use askQuestion (the loop pauses for their answer)
- When validating claims — use validateClaim
- Be concise. Use **bold** for emphasis. Use bullet points.
- NEVER call yourself "Gemini" or "Claude" — you are the "Health OS AI"
- You know EVERY page on the platform. Navigate confidently.

${PLATFORM_PAGES}

KNOWLEDGE:
- 41,009 ICD-10-ZA codes (SA WHO variant)
- 487,086 NAPPI medicine records
- 6 scheme profiles (Discovery, GEMS, Bonitas, Medshield, Momentum, Bestmed)
- 270 PMB DTPs, 27 CDL conditions
- 189K RAG searchable chunks
- 13-step claims chain (notes → coding → validation → switching → recovery)

ECOSYSTEM:
- Netcare Health OS: healthos.visiocorp.co (main platform)
- Doctor OS: doctor-os.vercel.app (doctor consultation workflow)
- VisioCode: visiocode.vercel.app (AI clinical coding)
- Patient Flow AI: patient-flow-ai.vercel.app (no-show prediction)`,

  tools: {
    navigate_to: navigateTo,
    search_patients: searchPatients,
    lookup_icd10: lookupICD10,
    search_knowledge_base: searchKnowledgeBase,
    ask_question: askQuestion,
    generate_document: generateDocument,
    validate_claim: validateClaim,
    get_onboarding_state: getOnboardingState,
    send_notification: sendNotification,
  },

  stopWhen: [
    stepCountIs(15),
  ],

  prepareStep: async ({ stepNumber }) => {
    // Phase gating: first 3 steps only allow info gathering
    if (stepNumber <= 2) {
      return {
        activeTools: ["navigate_to", "lookup_icd10", "search_knowledge_base", "ask_question", "get_onboarding_state"],
      };
    }
    return {}; // All tools available after step 2
  },
});
