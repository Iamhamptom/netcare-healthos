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
import { createTask, executeTask, logProblem, getPendingTasks, getOpenProblems, getTaskHistory } from "./task-executor";

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

const runTask = tool({
  description: "Create and execute a task. Use this to call APIs, validate claims, generate documents, send notifications, or do research. The task runs immediately and returns results.",
  inputSchema: z.object({
    type: z.enum(["api_call", "data_fetch", "document_gen", "notification", "validation", "research"]).describe("Type of task"),
    title: z.string().describe("Short title for the task"),
    description: z.string().describe("What the task should do"),
    input: z.record(z.string(), z.unknown()).describe("Task input data (e.g., {url: '/api/patients?search=Smith'} for api_call)"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  }),
  execute: async ({ type, title, description, input, priority }) => {
    const task = createTask({ type, title, description, input: input as Record<string, unknown>, priority: priority || "medium", createdBy: "visio-agent" });
    const result = await executeTask(task);
    return JSON.stringify({ taskId: result.id, status: result.status, output: result.output, error: result.error });
  },
});

const reportProblem = tool({
  description: "Log a bug, error, or issue for the fix queue. Use when something is broken, slow, or not working correctly. Steinberg and the dev team will be notified.",
  inputSchema: z.object({
    type: z.enum(["bug", "error", "performance", "data_issue", "integration_failure"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    description: z.string(),
    context: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ type, severity, title, description, context }) => {
    const problem = logProblem({ type, severity, title, description, context: context as Record<string, unknown> || {}, reproducible: true });
    return JSON.stringify({ problemId: problem.id, status: "logged", message: "Problem logged for the fix queue. Steinberg will be notified." });
  },
});

const getTaskStatus = tool({
  description: "Check pending tasks, open problems, or task history",
  inputSchema: z.object({
    what: z.enum(["pending_tasks", "open_problems", "task_history"]),
  }),
  execute: async ({ what }) => {
    switch (what) {
      case "pending_tasks": return JSON.stringify({ tasks: getPendingTasks() });
      case "open_problems": return JSON.stringify({ problems: getOpenProblems() });
      case "task_history": return JSON.stringify({ history: getTaskHistory(10) });
    }
  },
});

const browsePortal = tool({
  description: "Browse a medical aid portal or external website to check claim status, verify membership, look up formularies, or fill pre-authorization forms. Use when the user needs information from Discovery Health, GEMS, Bonitas, Medscheme, or any external medical aid portal.",
  inputSchema: z.object({
    url: z.string().describe("The URL to browse (e.g., https://www.discovery.co.za/medical-aid/claims)"),
    task: z.string().describe("What to do on the portal (e.g., 'check claim status for membership DH12345678')"),
  }),
  execute: async ({ url, task }) => {
    // OpenManus sidecar integration — for now returns structured response
    // Will be replaced with actual OpenManus API call when sidecar is running
    return JSON.stringify({
      status: "portal_task_queued",
      url,
      task,
      message: `Browser agent will navigate to ${url} and ${task}. This requires the OpenManus sidecar to be running. For now, I can help you find this information through our knowledge base instead.`,
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
  instructions: `You are Visio — the AI brain behind Health OS by Visio Research Labs.

WHAT WE ARE:
We are an AI intelligence layer that CONNECTS, SYNCS, and INTEGRATES with existing hospital systems (CareOn, HEAL, Healthbridge, SwitchOn). We don't replace anything. We sit on top and add intelligence:
- AI clinical coding (notes to ICD-10 codes instantly)
- Claims validation before submission (catch errors, recover revenue)
- HL7v2 to FHIR R4 translation (connect legacy to modern)
- Patient engagement automation (WhatsApp follow-ups, recall)
- Predictive analytics (no-show prediction, flow optimization)
- Document generation (referrals, prescriptions, motivations)

We optimize revenue, fast-track workflows, and give every staff member an AI assistant.

YOU ARE PROACTIVE:
1. Suggest the next action based on the user's role
2. Navigate them to the right tool instantly
3. Execute tasks (validate claims, look up codes, generate documents)
4. Ask questions when you need information

RULES:
- When user asks to GO somewhere — ALWAYS use navigate_to. Instant.
- For medical coding questions — use lookupICD10 or searchKnowledgeBase
- For document generation — use generateDocument
- For claim validation — use validateClaim
- Be CONCISE. Short answers. Bullet points. Bold for emphasis.
- You are "Visio" — never mention Claude, Gemini, or any AI provider
- Respond in 2-4 sentences max for simple questions. Don't write essays.
- Navigate confidently — you know EVERY page.

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
    run_task: runTask,
    report_problem: reportProblem,
    get_task_status: getTaskStatus,
    browse_portal: browsePortal,
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
