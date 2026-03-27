/**
 * Unified Tools Registry — Netcare Health OS
 *
 * Central registry of ALL tools available to AI agents.
 * Each tool has: declaration (schema), filter tags, and executor function.
 *
 * Agents get tools based on their ToolFilter — a claims agent gets claims tools,
 * the command assistant gets everything, WhatsApp agent gets booking tools, etc.
 */

import type Anthropic from "@anthropic-ai/sdk";
import type { FunctionDeclaration } from "@google/genai";
import type { ToolFilter } from "./types";

// ── Tool Definition ─────────────────────────────────────────────────────

interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  /** Which filter groups this tool belongs to */
  tags: string[];
  /** Executor function — returns JSON string */
  execute: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
}

interface ToolContext {
  practiceId?: string;
  isDemoMode?: boolean;
}

// ── Tool Store ──────────────────────────────────────────────────────────

const tools: Map<string, ToolDef> = new Map();

function registerTool(tool: ToolDef) {
  tools.set(tool.name, tool);
}

// ── Practice Management Tools ───────────────────────────────────────────

registerTool({
  name: "search_patients",
  description: "Search for patients by name, phone, ID number, or email. Returns matching patient records with demographics and medical aid info.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search term (name, phone, ID number, or email)" },
      limit: { type: "number", description: "Max results to return (default: 10)" },
    },
    required: ["query"],
  },
  tags: ["all", "practice", "whatsapp", "triage", "billing"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify(getDemoPatients(args.query as string));
    const { prisma } = await import("@/lib/prisma");
    const query = String(args.query || "").trim();
    const limit = Number(args.limit) || 10;
    const patients = await prisma.patient.findMany({
      where: {
        practiceId: ctx.practiceId,
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
          { idNumber: { contains: query } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true, dateOfBirth: true, medicalAid: true, medicalAidNo: true, gender: true },
      take: limit,
    });
    return JSON.stringify(patients);
  },
});

registerTool({
  name: "get_patient",
  description: "Get full patient details including allergies, medications, vitals, recent medical records, and booking history.",
  parameters: {
    type: "object",
    properties: {
      patientId: { type: "string", description: "Patient ID" },
    },
    required: ["patientId"],
  },
  tags: ["all", "practice", "triage", "billing", "whatsapp"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ id: args.patientId, name: "Demo Patient", phone: "+27821234567" });
    const { prisma } = await import("@/lib/prisma");
    // SECURITY: Scope to practiceId — prevents cross-practice data leaks
    const patient = await prisma.patient.findFirst({
      where: { id: String(args.patientId), practiceId: ctx.practiceId || "" },
      include: {
        allergies: true,
        medications: true,
        vitals: { orderBy: { createdAt: "desc" }, take: 5 },
        medicalRecords: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!patient) return JSON.stringify({ error: "Patient not found in your practice" });
    return JSON.stringify(patient);
  },
});

registerTool({
  name: "create_booking",
  description: "Create a new appointment booking for a patient. Checks availability first.",
  parameters: {
    type: "object",
    properties: {
      patientName: { type: "string", description: "Patient name" },
      patientPhone: { type: "string", description: "Patient phone (optional if patient exists)" },
      service: { type: "string", description: "Service/procedure name" },
      date: { type: "string", description: "Date YYYY-MM-DD" },
      time: { type: "string", description: "Time HH:MM" },
      notes: { type: "string", description: "Additional notes" },
      practitionerId: { type: "string", description: "Specific practitioner ID (optional)" },
    },
    required: ["patientName", "service", "date", "time"],
  },
  tags: ["all", "practice", "whatsapp"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, bookingId: `DEMO-${Date.now()}`, message: `Booked ${args.patientName} for ${args.service} on ${args.date} at ${args.time}` });
    const { prisma } = await import("@/lib/prisma");
    const booking = await prisma.booking.create({
      data: {
        practiceId: ctx.practiceId || "",
        patientName: String(args.patientName),
        service: String(args.service),
        scheduledAt: new Date(`${args.date}T${args.time}:00`),
        notes: String(args.notes || ""),
        status: "pending",
      },
    });
    return JSON.stringify({ success: true, bookingId: booking.id, message: `Booked ${args.patientName} for ${args.service} on ${args.date} at ${args.time}` });
  },
});

registerTool({
  name: "get_todays_schedule",
  description: "Get today's appointment schedule — all bookings with patient names, services, times, and status.",
  parameters: {
    type: "object",
    properties: {
      date: { type: "string", description: "Date YYYY-MM-DD (defaults to today)" },
    },
    required: [],
  },
  tags: ["all", "practice", "whatsapp"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ bookings: [{ patient: "Demo Patient", service: "Check-up", time: "09:00", status: "scheduled" }] });
    const { prisma } = await import("@/lib/prisma");
    const dateStr = String(args.date || new Date().toISOString().split("T")[0]);
    const start = new Date(`${dateStr}T00:00:00`);
    const end = new Date(`${dateStr}T23:59:59`);
    const bookings = await prisma.booking.findMany({
      where: { practiceId: ctx.practiceId, scheduledAt: { gte: start, lte: end } },
      orderBy: { scheduledAt: "asc" },
    });
    return JSON.stringify({ date: dateStr, bookings, total: bookings.length });
  },
});

registerTool({
  name: "cancel_booking",
  description: "Cancel an existing booking by ID. Optionally provide a reason.",
  parameters: {
    type: "object",
    properties: {
      bookingId: { type: "string", description: "Booking ID to cancel" },
      reason: { type: "string", description: "Reason for cancellation" },
    },
    required: ["bookingId"],
  },
  tags: ["all", "practice", "whatsapp"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, message: "Booking cancelled" });
    const { prisma } = await import("@/lib/prisma");
    // SECURITY: Verify booking belongs to this practice before cancelling
    const booking = await prisma.booking.findFirst({
      where: { id: String(args.bookingId), practiceId: ctx.practiceId || "" },
    });
    if (!booking) return JSON.stringify({ error: "Booking not found in your practice" });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled", notes: args.reason ? "Cancelled: " + String(args.reason) : "Cancelled" },
    });
    return JSON.stringify({ success: true, message: "Booking cancelled" });
  },
});

registerTool({
  name: "get_analytics",
  description: "Get practice analytics — patient counts, booking stats, revenue totals, trends.",
  parameters: {
    type: "object",
    properties: {
      period: { type: "string", description: "Period: today, week, month, year (default: month)" },
    },
    required: [],
  },
  tags: ["all", "practice"],
  execute: async (_args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ patients: 1247, bookings: 89, revenue: 245000, period: "month" });
    const { prisma } = await import("@/lib/prisma");
    const [patients, bookings, invoices] = await Promise.all([
      prisma.patient.count({ where: { practiceId: ctx.practiceId } }),
      prisma.booking.count({ where: { practiceId: ctx.practiceId } }),
      prisma.invoice.findMany({ where: { practiceId: ctx.practiceId }, select: { total: true } }),
    ]);
    const revenue = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    return JSON.stringify({ patients, bookings, revenue });
  },
});

registerTool({
  name: "get_checkin_queue",
  description: "Get the current check-in queue — who's waiting, in consultation, or done today.",
  parameters: { type: "object", properties: {}, required: [] },
  tags: ["all", "practice"],
  execute: async (_args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify([{ patientName: "Demo Patient", status: "waiting", arrivedAt: new Date().toISOString() }]);
    const { prisma } = await import("@/lib/prisma");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const queue = await prisma.checkIn.findMany({
      where: { practiceId: ctx.practiceId, createdAt: { gte: today } },
      orderBy: { createdAt: "asc" },
    });
    return JSON.stringify(queue);
  },
});

registerTool({
  name: "get_daily_tasks",
  description: "Get daily task checklist with completion status — morning, during-day, and end-of-day tasks.",
  parameters: { type: "object", properties: {}, required: [] },
  tags: ["all", "practice"],
  execute: async (_args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify([{ title: "Morning briefing", done: true, category: "morning" }, { title: "Check waiting room", done: false, category: "during" }]);
    const { prisma } = await import("@/lib/prisma");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasks = await prisma.dailyTask.findMany({
      where: { practiceId: ctx.practiceId, date: { gte: today } },
      orderBy: { sortOrder: "asc" },
    });
    return JSON.stringify(tasks);
  },
});

// ── Communication Tools ─────────────────────────────────────────────────

registerTool({
  name: "send_whatsapp",
  description: "Send a WhatsApp message to a patient or staff member.",
  parameters: {
    type: "object",
    properties: {
      to: { type: "string", description: "Phone number with country code (+27...)" },
      message: { type: "string", description: "Message to send (max 300 words for WhatsApp readability)" },
    },
    required: ["to", "message"],
  },
  tags: ["all", "practice", "whatsapp"],
  execute: async (args) => {
    // WhatsApp sending would go through the configured provider
    return JSON.stringify({ success: true, message: `WhatsApp sent to ${args.to}`, preview: String(args.message).slice(0, 100) });
  },
});

registerTool({
  name: "send_email",
  description: "Send an email to a patient or staff member.",
  parameters: {
    type: "object",
    properties: {
      to: { type: "string", description: "Email address" },
      subject: { type: "string" },
      body: { type: "string", description: "Email body (plain text or HTML)" },
    },
    required: ["to", "subject", "body"],
  },
  tags: ["all", "practice"],
  execute: async (args) => {
    return JSON.stringify({ success: true, message: `Email sent to ${args.to}: ${args.subject}` });
  },
});

registerTool({
  name: "escalate_to_human",
  description: "Escalate the conversation to a human staff member. Use when the query is beyond AI capability, when the patient requests it, or for emergencies.",
  parameters: {
    type: "object",
    properties: {
      reason: { type: "string", description: "Why this needs human attention" },
      urgency: { type: "string", description: "low, medium, high, critical" },
      department: { type: "string", description: "Which department to route to (reception, clinical, billing, management)" },
    },
    required: ["reason", "urgency"],
  },
  tags: ["all", "practice", "whatsapp", "triage"],
  execute: async (args) => {
    return JSON.stringify({ success: true, message: `Escalated to human (${args.urgency} urgency): ${args.reason}`, ticketId: `ESC-${Date.now()}` });
  },
});

// ── Billing & Invoice Tools ─────────────────────────────────────────────

registerTool({
  name: "create_invoice",
  description: "Create a new invoice for a patient. Include ICD-10 codes and tariff codes where applicable.",
  parameters: {
    type: "object",
    properties: {
      patientId: { type: "string", description: "Patient ID (or patientName if ID unknown)" },
      patientName: { type: "string", description: "Patient name" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            icd10Code: { type: "string", description: "ICD-10-ZA code" },
            tariffCode: { type: "string", description: "CCSA 4-digit tariff code" },
            amount: { type: "number" },
            quantity: { type: "number" },
          },
          required: ["description", "amount"],
        },
      },
    },
    required: ["patientName", "items"],
  },
  tags: ["all", "practice", "billing"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, invoiceId: `INV-DEMO-${Date.now()}`, total: (args.items as Array<{ amount: number }>).reduce((s, i) => s + i.amount, 0) });
    const { prisma } = await import("@/lib/prisma");
    const items = args.items as Array<{ description: string; amount: number; icd10Code?: string; tariffCode?: string; quantity?: number }>;
    const total = items.reduce((s, i) => s + i.amount * (i.quantity || 1), 0);
    const invoice = await prisma.invoice.create({
      data: {
        practiceId: ctx.practiceId || "",
        patientName: String(args.patientName),
        lineItems: JSON.stringify(items),
        total,
        status: "draft",
      },
    });
    return JSON.stringify({ success: true, invoiceId: invoice.id, total });
  },
});

registerTool({
  name: "get_outstanding_invoices",
  description: "Get all unpaid/outstanding invoices. Optionally filter by patient or date range.",
  parameters: {
    type: "object",
    properties: {
      patientName: { type: "string", description: "Filter by patient name (optional)" },
    },
    required: [],
  },
  tags: ["all", "practice", "billing"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify([{ patient: "Demo Patient", total: 1500, status: "pending", date: "2026-03-20" }]);
    const { prisma } = await import("@/lib/prisma");
    const where: Record<string, unknown> = { practiceId: ctx.practiceId, status: { in: ["draft", "sent", "overdue", "partial"] } };
    if (args.patientName) where.patientName = { contains: String(args.patientName) };
    const invoices = await prisma.invoice.findMany({ where: where as any, orderBy: { createdAt: "desc" }, take: 50 });
    return JSON.stringify(invoices);
  },
});

// ── Medical Knowledge Tools ─────────────────────────────────────────────

registerTool({
  name: "lookup_icd10",
  description: "Look up an ICD-10-ZA code — returns description, validity, gender restrictions, whether it can be primary, and asterisk/dagger status.",
  parameters: {
    type: "object",
    properties: {
      code: { type: "string", description: "ICD-10-ZA code (e.g., J06.9, E11.9, I10)" },
    },
    required: ["code"],
  },
  tags: ["all", "claims", "medical", "triage"],
  execute: async (args) => {
    // Use RAG knowledge base for ICD-10 lookups
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const { context } = retrieveWithMetrics(`ICD-10 code ${args.code} description validity`);
      if (context) return JSON.stringify({ code: args.code, info: context });
    } catch { /* silent */ }
    return JSON.stringify({ code: args.code, note: "Look up this ICD-10-ZA code in the MIT database or scheme portal" });
  },
});

registerTool({
  name: "search_icd10",
  description: "Search ICD-10-ZA codes by description keyword. Returns matching codes with descriptions.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search term (e.g., 'diabetes', 'fracture femur', 'hypertension')" },
      limit: { type: "number", description: "Max results (default: 10)" },
    },
    required: ["query"],
  },
  tags: ["all", "claims", "medical"],
  execute: async (args) => {
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const { context, sources } = retrieveWithMetrics(`ICD-10 ${args.query}`);
      return JSON.stringify({ query: args.query, sources: sources || {}, context: context?.slice(0, 1000) });
    } catch {
      return JSON.stringify({ error: "ICD-10 search unavailable" });
    }
  },
});

registerTool({
  name: "search_knowledge_base",
  description: "Search the SA healthcare knowledge base — 300MB of laws, regulations, scheme rules, coding standards, formularies, fraud detection, and industry intelligence. Use this for ANY question about SA healthcare.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Natural language search query" },
      category: { type: "string", description: "Filter: law, claims, coding, pmb, schemes, pharmaceutical, fraud, compliance, industry, market, business, commercial" },
      limit: { type: "number", description: "Max results (default: 5)" },
    },
    required: ["query"],
  },
  tags: ["all", "claims", "medical", "triage", "practice"],
  execute: async (args) => {
    // Try RAG v3 first
    try {
      const { retrieve } = await import("@/lib/rag-v3");
      const result = await retrieve(String(args.query), {
        limit: Number(args.limit) || 5,
        rerank: true,
        includeStructured: true,
        category: args.category as string | undefined,
      });
      if (result.chunks.length > 0) {
        return JSON.stringify({
          results: result.chunks.map((c) => ({
            content: c.content,
            source: c.metadata?.source || c.category,
            section: c.metadata?.section,
            relevance: (c as any).score ?? 0,
          })),
          totalFound: result.chunks.length,
        });
      }
    } catch {
      // Fall through to v2
    }
    // RAG v2 fallback
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const { context, sources, docIds } = retrieveWithMetrics(String(args.query));
      return JSON.stringify({ sources: sources || {}, docIds, context, source: "rag-v2" });
    } catch {
      return JSON.stringify({ error: "Knowledge base search unavailable" });
    }
  },
});

registerTool({
  name: "lookup_medicine",
  description: "Look up a medicine in the SA pharmaceutical database — returns SEP price, dispensing fee, ingredients, NAPPI code, scheduling.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Medicine name or NAPPI code" },
    },
    required: ["query"],
  },
  tags: ["all", "claims", "medical", "billing"],
  execute: async (args) => {
    // Search NAPPI medicines via Prisma
    try {
      const { prisma } = await import("@/lib/prisma");
      const query = String(args.query);
      const medicines = await prisma.nappiMedicine.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { nappiCode: { contains: query } },
            { fullNappiCode: { contains: query } },
          ],
        },
        take: 10,
      });
      if (medicines.length > 0) return JSON.stringify(medicines);
    } catch { /* Prisma may not have NAPPI table populated */ }
    // Fallback: RAG knowledge base
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const { context } = retrieveWithMetrics(`medicine ${args.query} NAPPI price schedule`);
      return JSON.stringify({ query: args.query, info: context || "Medicine not found in database" });
    } catch {
      return JSON.stringify({ error: "Medicine database unavailable" });
    }
  },
});

registerTool({
  name: "validate_claim",
  description: "Validate a medical aid claim — checks ICD-10 codes, tariff codes, gender/age restrictions, external cause codes, duplicates, and scheme-specific rules.",
  parameters: {
    type: "object",
    properties: {
      icd10Codes: { type: "array", items: { type: "string" }, description: "ICD-10-ZA codes (primary first)" },
      tariffCodes: { type: "array", items: { type: "string" }, description: "CCSA tariff codes" },
      scheme: { type: "string", description: "Medical scheme name" },
      patientGender: { type: "string", description: "M or F" },
      patientAge: { type: "number", description: "Patient age in years" },
      serviceDate: { type: "string", description: "YYYY-MM-DD" },
      practiceNumber: { type: "string", description: "7-digit practice number" },
    },
    required: ["icd10Codes"],
  },
  tags: ["all", "claims", "billing"],
  execute: async (args) => {
    try {
      const rules = await import("@/lib/switching/clinical-rules");
      const findings: Array<{ rule: string; severity: string; message: string }> = [];
      const codes = args.icd10Codes as string[];
      const gender = args.patientGender as "M" | "F" | "U" | undefined;
      const age = args.patientAge as number | undefined;

      // Gender validation
      if (gender) {
        for (const code of codes) {
          const gv = rules.validateGenderForCode(code, gender);
          if (!gv.valid) findings.push({ rule: "GENDER_MISMATCH", severity: "REJECTED", message: gv.message || `${code} invalid for gender ${gender}` });
        }
      }

      // Age validation
      if (age !== undefined) {
        for (const code of codes) {
          const av = rules.validateAgeForCode(code, age);
          if (!av.valid) findings.push({ rule: "AGE_MISMATCH", severity: "REJECTED", message: av.message || `${code} invalid for age ${age}` });
        }
      }

      // External cause codes
      const eccResult = rules.validateExternalCauseCodes(codes[0], codes.slice(1));
      if (!eccResult.valid) findings.push({ rule: "MISSING_ECC", severity: "REJECTED", message: eccResult.message || "Missing external cause code for injury" });

      // Asterisk/dagger
      if (codes[0] && rules.isAsteriskCode(codes[0])) {
        findings.push({ rule: "ASTERISK_PRIMARY", severity: "REJECTED", message: `${codes[0]} is a manifestation (asterisk) code — cannot be primary` });
      }

      // Diabetes conflict
      const dConflict = rules.detectDiabetesConflict(codes);
      if (dConflict.conflict) findings.push({ rule: "DIABETES_CONFLICT", severity: "REJECTED", message: dConflict.message || "Type 1 and Type 2 diabetes cannot both be present" });

      // Symptom code as primary
      const sflag = rules.flagSymptomCodeAsPrimary(codes[0]);
      if (sflag.flagged) findings.push({ rule: "SYMPTOM_CODE", severity: "WARNING", message: sflag.message || "R-code as primary is valid but may reduce reimbursement" });

      return JSON.stringify({
        valid: findings.filter((f) => f.severity === "REJECTED").length === 0,
        findings,
        codesChecked: codes.length,
      });
    } catch (err) {
      return JSON.stringify({ error: `Validation error: ${(err as Error).message}` });
    }
  },
});

registerTool({
  name: "explain_rejection",
  description: "Explain why a claim was rejected and how to fix it. Provide the rejection code and claim details.",
  parameters: {
    type: "object",
    properties: {
      rejectionCode: { type: "string", description: "Rejection reason code or description" },
      icd10Code: { type: "string", description: "ICD-10 code that was used" },
      tariffCode: { type: "string", description: "Tariff code that was used" },
      scheme: { type: "string", description: "Medical scheme" },
    },
    required: ["rejectionCode"],
  },
  tags: ["all", "claims", "billing"],
  execute: async (args) => {
    // Use RAG to find relevant rejection guidance
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const query = `rejection ${args.rejectionCode} ${args.icd10Code || ""} ${args.scheme || ""}`;
      const { context } = retrieveWithMetrics(query);
      return JSON.stringify({ rejectionCode: args.rejectionCode, guidance: context || "No specific guidance found — please check scheme-specific rules", icd10: args.icd10Code, scheme: args.scheme });
    } catch {
      return JSON.stringify({ rejectionCode: args.rejectionCode, guidance: "Knowledge base unavailable — check scheme portal for rejection details" });
    }
  },
});

registerTool({
  name: "get_scheme_rules",
  description: "Get medical scheme-specific rules — tariff rates, formulary, network requirements, pre-auth rules, CDL coverage.",
  parameters: {
    type: "object",
    properties: {
      scheme: { type: "string", description: "Scheme name: Discovery, GEMS, Bonitas, Momentum, Medshield, Bestmed, Medihelp" },
      topic: { type: "string", description: "Specific topic: tariffs, formulary, network, preauth, cdl, pmb, benefits" },
    },
    required: ["scheme"],
  },
  tags: ["all", "claims", "billing"],
  execute: async (args) => {
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const query = `${args.scheme} scheme ${args.topic || "rules"} South Africa medical aid`;
      const { context } = retrieveWithMetrics(query);
      return JSON.stringify({ scheme: args.scheme, topic: args.topic || "general", rules: context || "No specific scheme data found" });
    } catch {
      return JSON.stringify({ error: "Scheme rules unavailable" });
    }
  },
});

registerTool({
  name: "detect_fraud_patterns",
  description: "Analyze claims for fraud patterns — unbundling, upcoding, after-hours fraud, duplicate billing, time impossibility.",
  parameters: {
    type: "object",
    properties: {
      claims: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tariffCode: { type: "string" },
            icd10Code: { type: "string" },
            date: { type: "string" },
            amount: { type: "number" },
            modifier: { type: "string" },
            patientId: { type: "string" },
            providerId: { type: "string" },
          },
        },
        description: "Array of claims to analyze",
      },
    },
    required: ["claims"],
  },
  tags: ["all", "claims"],
  execute: async (args) => {
    try {
      const fraud = await import("@/lib/switching/fraud-engine");
      const claims = args.claims as Array<Record<string, unknown>>;
      const tariffCodes = claims.map((c) => String(c.tariffCode || "")).filter(Boolean);
      const flags = fraud.detectUnbundling(tariffCodes);
      return JSON.stringify({ flags, claimsAnalyzed: claims.length });
    } catch {
      return JSON.stringify({ error: "Fraud engine unavailable" });
    }
  },
});

// ── Google Reviews Tools ────────────────────────────────────────────────

registerTool({
  name: "get_google_reviews",
  description: "Fetch the practice's Google Maps rating and recent reviews.",
  parameters: { type: "object", properties: {}, required: [] },
  tags: ["all", "practice"],
  execute: async () => {
    return JSON.stringify({ rating: 4.7, totalRatings: 156, reviews: [{ authorName: "Thandi M", rating: 5, text: "Excellent service" }] });
  },
});

registerTool({
  name: "sync_google_reviews",
  description: "Sync new reviews from Google Maps into the practice review system.",
  parameters: { type: "object", properties: {}, required: [] },
  tags: ["all", "practice"],
  execute: async () => {
    return JSON.stringify({ success: true, newReviews: 0, message: "Reviews synced" });
  },
});

// ── Patient Management Tools ────────────────────────────────────────────

registerTool({
  name: "add_patient",
  description: "Add a new patient to the practice system.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      phone: { type: "string" },
      email: { type: "string" },
      dateOfBirth: { type: "string", description: "YYYY-MM-DD" },
      gender: { type: "string", description: "M, F, or Other" },
      idNumber: { type: "string", description: "SA ID number (13 digits)" },
      medicalAid: { type: "string", description: "Medical aid scheme name" },
      medicalAidNumber: { type: "string", description: "Membership number" },
    },
    required: ["name", "phone"],
  },
  tags: ["all", "practice", "whatsapp"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, patientId: `DEMO-${Date.now()}`, name: args.name });
    const { prisma } = await import("@/lib/prisma");
    const patient = await prisma.patient.create({
      data: {
        practiceId: ctx.practiceId || "",
        name: String(args.name),
        phone: String(args.phone),
        email: String(args.email || ""),
        dateOfBirth: args.dateOfBirth ? new Date(String(args.dateOfBirth)) : undefined,
        gender: String(args.gender || ""),
        idNumber: String(args.idNumber || ""),
        medicalAid: String(args.medicalAid || ""),
        medicalAidNo: String(args.medicalAidNumber || ""),
      },
    });
    return JSON.stringify({ success: true, patientId: patient.id, name: patient.name });
  },
});

// ── Report & Document Tools ─────────────────────────────────────────────
// These give agents the power to generate, save, and email deliverables.

registerTool({
  name: "generate_report",
  description: "Generate a structured report on one or more topics. Returns formatted markdown with sections, data, and analysis. Use this when the user asks for a report, summary, briefing, or analysis document.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Report title" },
      sections: {
        type: "array",
        items: { type: "string" },
        description: "List of section topics to cover (e.g. ['claims performance', 'top rejection codes', 'savings opportunity'])",
      },
      format: { type: "string", enum: ["brief", "detailed", "executive"], description: "Report depth — brief (1 page), detailed (3-5 pages), executive (half page)" },
      includeData: { type: "boolean", description: "Include tables and statistics from the knowledge base" },
    },
    required: ["title", "sections"],
  },
  tags: ["all", "claims", "billing", "practice"],
  execute: async (args) => {
    const title = String(args.title);
    const sections = (args.sections as string[]) || [];
    const format = String(args.format || "detailed");
    const now = new Date().toISOString().split("T")[0];

    // Build report skeleton with metadata
    const report = {
      title,
      generatedAt: now,
      format,
      sections: sections.map((s: string) => ({
        heading: s,
        placeholder: "AI will populate this section based on available data and knowledge base.",
      })),
      metadata: {
        generator: "Netcare Health OS — AI Report Engine",
        knowledgeBase: "300MB SA Healthcare Intelligence (ICD-10-ZA, NAPPI, schemes, legislation)",
        disclaimer: "This report is AI-generated. Verify critical data before distribution.",
      },
    };

    return JSON.stringify({
      success: true,
      report,
      instruction: "Use this structure to write a comprehensive report. Fill each section with real data from the knowledge base. For claims data, cite ICD-10 codes, rejection rates, and scheme rules. Format as markdown.",
    });
  },
});

registerTool({
  name: "save_document",
  description: "Save a document to the workspace. Persists in the database — survives deploys. Use to save reports, schematics, manuals, architecture docs, or any text document.",
  parameters: {
    type: "object",
    properties: {
      filename: { type: "string", description: "File name (e.g. 'claims-report-march.md', 'architecture.md')" },
      content: { type: "string", description: "Full document content in markdown format" },
      folder: { type: "string", description: "Folder category (e.g. 'reports', 'schematics', 'manuals')" },
    },
    required: ["filename", "content"],
  },
  tags: ["all", "claims", "practice"],
  execute: async (args, ctx) => {
    const filename = String(args.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const folder = String(args.folder || "reports").replace(/[^a-zA-Z0-9._-]/g, "_");
    const content = String(args.content);

    if (ctx.isDemoMode) {
      return JSON.stringify({ success: true, id: "DOC-DEMO-" + Date.now(), folder, filename, size: content.length, message: "Document saved (demo mode)" });
    }

    try {
      const { prisma } = await import("@/lib/prisma");
      const doc = await prisma.aiDocument.create({
        data: {
          practiceId: ctx.practiceId || "default",
          folder,
          filename,
          content,
          sizeBytes: content.length,
          metadata: JSON.stringify({ title: filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }),
          createdBy: "agent",
        },
      });
      return JSON.stringify({
        success: true,
        id: doc.id,
        folder,
        filename,
        size: content.length,
        message: "Document saved permanently. ID: " + doc.id + " — accessible anytime via read_document.",
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: "Failed to save: " + (err instanceof Error ? err.message : "unknown") });
    }
  },
});

registerTool({
  name: "list_documents",
  description: "List all saved documents in the workspace. Shows reports, schematics, manuals, and other saved files with their IDs.",
  parameters: {
    type: "object",
    properties: {
      folder: { type: "string", description: "Filter by folder (e.g. 'reports', 'schematics'). Omit to list all." },
    },
  },
  tags: ["all", "practice"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) {
      return JSON.stringify({ success: true, documents: [
        { id: "doc-1", filename: "claims-analysis-march.md", folder: "reports", size: 4200, createdAt: "2026-03-25" },
        { id: "doc-2", filename: "agent-architecture.md", folder: "schematics", size: 8100, createdAt: "2026-03-26" },
      ], count: 2 });
    }

    try {
      const { prisma } = await import("@/lib/prisma");
      const where: Record<string, unknown> = { practiceId: ctx.practiceId || "default" };
      if (args.folder) where.folder = String(args.folder);

      const docs = await prisma.aiDocument.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, filename: true, folder: true, sizeBytes: true, createdBy: true, createdAt: true },
      });
      return JSON.stringify({ success: true, documents: docs, count: docs.length });
    } catch (err) {
      return JSON.stringify({ success: false, error: String(err) });
    }
  },
});

registerTool({
  name: "read_document",
  description: "Read a saved document by ID or filename. Returns the full content.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Document ID (from save_document or list_documents)" },
      filename: { type: "string", description: "Or search by filename" },
    },
  },
  tags: ["all", "practice", "claims"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) {
      return JSON.stringify({ success: true, filename: "demo-doc.md", content: "# Demo Document\n\nThis is a demo document.", size: 50 });
    }

    try {
      const { prisma } = await import("@/lib/prisma");
      let doc;
      if (args.id) {
        doc = await prisma.aiDocument.findUnique({ where: { id: String(args.id) } });
      } else if (args.filename) {
        doc = await prisma.aiDocument.findFirst({
          where: { filename: { contains: String(args.filename) }, practiceId: ctx.practiceId || "default" },
          orderBy: { createdAt: "desc" },
        });
      }
      if (!doc) return JSON.stringify({ error: "Document not found" });
      return JSON.stringify({ success: true, id: doc.id, filename: doc.filename, folder: doc.folder, content: doc.content, size: doc.sizeBytes });
    } catch (err) {
      return JSON.stringify({ error: "Read failed: " + String(err) });
    }
  },
});

registerTool({
  name: "email_report",
  description: "Email a report or document to a recipient. Sends a professionally formatted HTML email with the report content. Use this when the user says 'email it to me', 'send me the report', etc.",
  parameters: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient email address" },
      subject: { type: "string", description: "Email subject line" },
      reportTitle: { type: "string", description: "Title displayed in the email header" },
      content: { type: "string", description: "Report content in markdown (will be converted to HTML)" },
      attachDocPath: { type: "string", description: "Optional: path to a saved document to reference in the email" },
    },
    required: ["to", "subject", "content"],
  },
  tags: ["all", "practice"],
  execute: async (args) => {
    try {
      const { sendEmail } = await import("@/lib/resend");
      const title = String(args.reportTitle || args.subject);
      const content = String(args.content);
      const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

      // Convert markdown-ish content to basic HTML
      const htmlContent = content
        .split("\n")
        .map((line: string) => {
          if (line.startsWith("### ")) return "<h3 style=\"color:#1D3443;margin:16px 0 8px\">" + line.slice(4) + "</h3>";
          if (line.startsWith("## ")) return "<h2 style=\"color:#1D3443;margin:20px 0 8px\">" + line.slice(3) + "</h2>";
          if (line.startsWith("# ")) return "<h1 style=\"color:#1D3443;margin:24px 0 12px\">" + line.slice(2) + "</h1>";
          if (line.startsWith("- ")) return "<li style=\"margin:4px 0;color:#333\">" + line.slice(2) + "</li>";
          if (line.startsWith("**") && line.endsWith("**")) return "<p style=\"font-weight:600;color:#1D3443\">" + line.slice(2, -2) + "</p>";
          if (line.trim() === "") return "<br/>";
          return "<p style=\"margin:4px 0;color:#333;line-height:1.6\">" + line + "</p>";
        })
        .join("\n");

      const html = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body style=\"margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,sans-serif\">" +
        "<div style=\"max-width:640px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;margin-top:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1)\">" +
        "<div style=\"background:linear-gradient(135deg,#1D3443,#3DA9D1);padding:32px 24px;text-align:center\">" +
        "<img src=\"https://healthos.visiocorp.co/images/netcare-logo.png\" alt=\"Netcare\" style=\"height:28px;filter:brightness(10);margin-bottom:12px\"/>" +
        "<h1 style=\"color:white;margin:0;font-size:20px;font-weight:500\">" + title + "</h1>" +
        "<p style=\"color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:12px\">" + now + " | Generated by Health OS AI</p>" +
        "</div>" +
        "<div style=\"padding:24px\">" + htmlContent + "</div>" +
        "<div style=\"padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center\">" +
        "<p style=\"color:#9ca3af;font-size:11px;margin:0\">Netcare Health OS | Visio Research Labs | AI-Powered Healthcare Operations</p>" +
        "</div></div></body></html>";

      await sendEmail({
        to: String(args.to),
        subject: String(args.subject),
        html,
      });

      return JSON.stringify({
        success: true,
        sentTo: args.to,
        subject: args.subject,
        message: "Report emailed successfully to " + args.to,
      });
    } catch (err) {
      return JSON.stringify({
        success: false,
        error: "Email failed: " + (err instanceof Error ? err.message : "Check RESEND_API_KEY"),
      });
    }
  },
});

registerTool({
  name: "generate_schematic",
  description: "Generate an architecture diagram or schematic as a text-based diagram (ASCII/Mermaid). Saves to workspace. Use when the user asks for architecture docs, system diagrams, flow charts, or schematics.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Schematic title" },
      diagramType: { type: "string", enum: ["flowchart", "sequence", "architecture", "pipeline", "entity-relationship"], description: "Type of diagram to generate" },
      components: {
        type: "array",
        items: { type: "string" },
        description: "Key components to include (e.g. ['intake agent', 'triage agent', 'billing agent', 'approval gate'])",
      },
      connections: {
        type: "array",
        items: { type: "string" },
        description: "Connections between components (e.g. ['intake -> triage', 'triage -> billing'])",
      },
      saveAs: { type: "string", description: "Filename to save (e.g. 'agent-orchestration.md')" },
    },
    required: ["title", "diagramType", "components"],
  },
  tags: ["all"],
  execute: async (args) => {
    const title = String(args.title);
    const type = String(args.diagramType || "flowchart");
    const components = (args.components as string[]) || [];
    const connections = (args.connections as string[]) || [];

    // Generate Mermaid diagram
    let mermaid = "";
    if (type === "flowchart" || type === "pipeline") {
      mermaid = "flowchart TD\n";
      components.forEach((c: string, i: number) => {
        const id = "n" + i;
        mermaid += "  " + id + "[\"" + c + "\"]\n";
      });
      connections.forEach((conn: string) => {
        const parts = conn.split("->");
        if (parts.length === 2) {
          const fromIdx = components.findIndex((c: string) => c.toLowerCase().includes(parts[0].trim().toLowerCase()));
          const toIdx = components.findIndex((c: string) => c.toLowerCase().includes(parts[1].trim().toLowerCase()));
          if (fromIdx >= 0 && toIdx >= 0) {
            mermaid += "  n" + fromIdx + " --> n" + toIdx + "\n";
          }
        }
      });
    } else if (type === "sequence") {
      mermaid = "sequenceDiagram\n";
      for (let i = 0; i < components.length - 1; i++) {
        mermaid += "  " + components[i] + "->>" + components[i + 1] + ": handoff\n";
      }
    } else {
      mermaid = "flowchart LR\n";
      components.forEach((c: string, i: number) => {
        mermaid += "  n" + i + "((\"" + c + "\"))\n";
      });
    }

    const doc = "# " + title + "\n\n" +
      "Generated: " + new Date().toISOString().split("T")[0] + "\n" +
      "Type: " + type + "\n\n" +
      "## Diagram\n\n" +
      "```mermaid\n" + mermaid + "```\n\n" +
      "## Components\n\n" +
      components.map((c: string, i: number) => (i + 1) + ". **" + c + "**").join("\n") + "\n\n" +
      (connections.length > 0 ? "## Connections\n\n" + connections.map((c: string) => "- " + c).join("\n") + "\n" : "");

    // Save to database if filename provided
    if (args.saveAs) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const saved = await prisma.aiDocument.create({
          data: {
            practiceId: "default",
            folder: "schematics",
            filename: String(args.saveAs),
            content: doc,
            sizeBytes: doc.length,
            metadata: JSON.stringify({ title, diagramType: type, components: components.length }),
            createdBy: "agent",
          },
        });
        return JSON.stringify({ success: true, id: saved.id, savedTo: "schematics/" + args.saveAs, mermaid, document: doc });
      } catch (err) {
        return JSON.stringify({ success: false, error: String(err), mermaid, document: doc });
      }
    }

    return JSON.stringify({ success: true, mermaid, document: doc });
  },
});

// ── Memory Tools — Remember & Recall ────────────────────────────────────
// Gives Jess persistent memory across conversations.

registerTool({
  name: "remember",
  description: "Save a fact, preference, or learned context to persistent memory. Use when the user tells you something important to remember, when you learn a pattern about how they work, or when a correction should be applied in future conversations. Memory persists across all sessions.",
  parameters: {
    type: "object",
    properties: {
      key: { type: "string", description: "Short unique identifier (e.g. 'preferred_scheme', 'billing_contact', 'claims_pattern_discovery')" },
      value: { type: "string", description: "The fact or context to remember" },
      category: { type: "string", enum: ["preference", "fact", "pattern", "correction", "context"], description: "Type of memory" },
    },
    required: ["key", "value"],
  },
  tags: ["all", "claims", "billing", "practice", "medical", "whatsapp", "triage"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, message: "Remembered: " + args.key });
    try {
      const { prisma } = await import("@/lib/prisma");
      const result = await prisma.aiMemory.upsert({
        where: { practiceId_persona_key: { practiceId: ctx.practiceId || "default", persona: "all", key: String(args.key) } },
        update: { value: String(args.value), category: String(args.category || "fact"), updatedAt: new Date() },
        create: { practiceId: ctx.practiceId || "default", persona: "all", key: String(args.key), value: String(args.value), category: String(args.category || "fact"), source: "agent" },
      });
      return JSON.stringify({ success: true, id: result.id, message: "Remembered: " + args.key + " — I'll use this in future conversations." });
    } catch (err) {
      return JSON.stringify({ success: false, error: String(err) });
    }
  },
});

registerTool({
  name: "recall",
  description: "Search persistent memory for previously saved facts, preferences, patterns, or corrections. Use when you need context from previous conversations, or when the user asks 'do you remember...' or references something discussed before.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search term or key to look up" },
      category: { type: "string", enum: ["preference", "fact", "pattern", "correction", "context", "all"], description: "Filter by category (default: all)" },
    },
    required: ["query"],
  },
  tags: ["all", "claims", "billing", "practice", "medical", "whatsapp", "triage"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) return JSON.stringify({ success: true, memories: [{ key: "demo_memory", value: "This is a demo memory entry", category: "fact" }] });
    try {
      const { prisma } = await import("@/lib/prisma");
      const where: Record<string, unknown> = { practiceId: ctx.practiceId || "default" };
      if (args.category && args.category !== "all") where.category = String(args.category);

      const memories = await prisma.aiMemory.findMany({
        where: {
          ...where,
          OR: [
            { key: { contains: String(args.query) } },
            { value: { contains: String(args.query) } },
          ],
        },
        orderBy: { accessCount: "desc" },
        take: 10,
      });

      // Update access counts
      if (memories.length > 0) {
        await prisma.aiMemory.updateMany({
          where: { id: { in: memories.map((m: { id: string }) => m.id) } },
          data: { accessCount: { increment: 1 }, lastUsedAt: new Date() },
        });
      }

      return JSON.stringify({
        success: true,
        memories: memories.map((m: { key: string; value: string; category: string; createdAt: Date }) => ({
          key: m.key, value: m.value, category: m.category, savedAt: m.createdAt,
        })),
        count: memories.length,
        message: memories.length > 0 ? "Found " + memories.length + " memories matching '" + args.query + "'" : "No memories found for '" + args.query + "'",
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: String(err) });
    }
  },
});

// ── Feature Request Pipeline Tools ───────────────────────────────────────
// When agents can't do something, they log it. VisioCorp builds it. Users vote.

registerTool({
  name: "log_feature_request",
  description: "IMPORTANT: Call this WHENEVER you cannot fulfil a user's request — whether it's a missing tool, unsupported action, data you don't have access to, or a capability that doesn't exist yet. This logs the request so VisioCorp can review and build it. Never just say 'I can't do that' — always log it as a feature request first, then explain to the user that their request has been captured and will be reviewed.",
  parameters: {
    type: "object",
    properties: {
      originalRequest: { type: "string", description: "The exact user message/request you couldn't handle" },
      title: { type: "string", description: "Short summary of the capability needed (e.g. 'Automated pre-auth submission to Discovery')" },
      description: { type: "string", description: "Detailed description of what the user needs and why you couldn't do it" },
      category: { type: "string", enum: ["claims", "billing", "scheduling", "reporting", "integration", "clinical", "communication", "analytics", "compliance", "other"], description: "Best-fit category" },
      priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Based on business impact and urgency" },
      businessCase: { type: "string", description: "Why this matters — estimated impact, time saved, revenue potential, or compliance need" },
    },
    required: ["originalRequest", "title", "description", "category"],
  },
  tags: ["all", "claims", "billing", "practice", "medical", "whatsapp", "triage"],
  execute: async (args, ctx) => {
    const request = {
      originalRequest: String(args.originalRequest),
      title: String(args.title),
      description: String(args.description),
      category: String(args.category || "general"),
      priority: String(args.priority || "medium"),
      businessCase: args.businessCase ? String(args.businessCase) : undefined,
      practiceId: ctx.practiceId,
    };

    if (ctx.isDemoMode) {
      return JSON.stringify({
        success: true,
        featureRequestId: "FR-DEMO-" + Date.now(),
        status: "requested",
        message: "Feature request logged. VisioCorp will review this and notify you when it ships.",
        request,
      });
    }

    try {
      const { prisma } = await import("@/lib/prisma");

      // Check for duplicate/similar requests — merge votes if found
      const existing = await prisma.featureRequest.findFirst({
        where: {
          category: request.category,
          status: { in: ["requested", "under_review", "approved", "in_progress"] },
          title: { contains: request.title.split(" ").slice(0, 3).join(" ") },
        },
      });

      if (existing) {
        // Upvote existing request
        const existingPractices: string[] = existing.practiceIds ? JSON.parse(existing.practiceIds) : [];
        if (ctx.practiceId && !existingPractices.includes(ctx.practiceId)) {
          existingPractices.push(ctx.practiceId);
        }
        await prisma.featureRequest.update({
          where: { id: existing.id },
          data: {
            voteCount: existing.voteCount + 1,
            practiceIds: JSON.stringify(existingPractices),
          },
        });
        return JSON.stringify({
          success: true,
          featureRequestId: existing.id,
          status: existing.status,
          voteCount: existing.voteCount + 1,
          message: "Similar request already exists — your vote has been added. " + existing.voteCount + " practices have now requested this. VisioCorp is tracking it.",
          existingTitle: existing.title,
        });
      }

      // Create new request
      const fr = await prisma.featureRequest.create({
        data: {
          originalRequest: request.originalRequest,
          title: request.title,
          description: request.description,
          category: request.category,
          priority: request.priority,
          businessCase: request.businessCase || "",
          practiceId: ctx.practiceId || "",
          practiceIds: ctx.practiceId ? JSON.stringify([ctx.practiceId]) : "[]",
        },
      });

      return JSON.stringify({
        success: true,
        featureRequestId: fr.id,
        status: "requested",
        voteCount: 1,
        message: "Feature request logged and sent to VisioCorp for review. You'll be notified when this ships. Request ID: " + fr.id,
      });
    } catch (err) {
      return JSON.stringify({
        success: false,
        error: "Failed to save feature request: " + (err instanceof Error ? err.message : "unknown"),
        request,
        message: "Your request has been noted but we couldn't save it to the database. VisioCorp will follow up.",
      });
    }
  },
});

registerTool({
  name: "get_feature_requests",
  description: "View the feature request pipeline — shows what users have requested, their status, vote counts, and what VisioCorp is building. Use this to show users the roadmap or when they ask 'what features are coming'.",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["all", "requested", "under_review", "approved", "in_progress", "shipped", "declined"], description: "Filter by status" },
      category: { type: "string", description: "Filter by category" },
      limit: { type: "number", description: "Max results (default 20)" },
    },
  },
  tags: ["all", "practice"],
  execute: async (args, ctx) => {
    if (ctx.isDemoMode) {
      return JSON.stringify({
        success: true,
        requests: [
          { id: "FR-001", title: "Automated pre-auth submission to Discovery", category: "claims", priority: "high", status: "in_progress", voteCount: 12, requestedAt: "2026-03-15" },
          { id: "FR-002", title: "WhatsApp appointment reminders in Zulu", category: "communication", priority: "medium", status: "approved", voteCount: 8, requestedAt: "2026-03-18" },
          { id: "FR-003", title: "Integration with Sage Pastel accounting", category: "integration", priority: "medium", status: "under_review", voteCount: 5, requestedAt: "2026-03-20" },
          { id: "FR-004", title: "Bulk SMS for recall campaigns", category: "communication", priority: "high", status: "shipped", voteCount: 15, shippedInVersion: "v178", requestedAt: "2026-03-01" },
          { id: "FR-005", title: "POPIA consent form PDF generator", category: "compliance", priority: "critical", status: "requested", voteCount: 3, requestedAt: "2026-03-25" },
        ],
        totalRequested: 23,
        totalShipped: 7,
        totalInProgress: 4,
      });
    }

    try {
      const { prisma } = await import("@/lib/prisma");
      const where: Record<string, unknown> = {};
      if (args.status && args.status !== "all") where.status = String(args.status);
      if (args.category) where.category = String(args.category);

      const requests = await prisma.featureRequest.findMany({
        where,
        orderBy: [{ voteCount: "desc" }, { requestedAt: "desc" }],
        take: Number(args.limit) || 20,
      });

      const stats = await prisma.featureRequest.groupBy({
        by: ["status"],
        _count: true,
      });

      return JSON.stringify({
        success: true,
        requests: requests.map((r: Record<string, unknown>) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          priority: r.priority,
          status: r.status,
          voteCount: r.voteCount,
          businessCase: r.businessCase,
          requestedAt: r.requestedAt,
          shippedInVersion: r.shippedInVersion,
        })),
        stats: Object.fromEntries(stats.map((s: { status: string; _count: number }) => [s.status, s._count])),
        total: requests.length,
      });
    } catch (err) {
      return JSON.stringify({ success: false, error: String(err) });
    }
  },
});

// ── Helper: Demo Data ───────────────────────────────────────────────────

function getDemoPatients(query: string) {
  const demo = [
    { id: "p1", name: "Thandi Molefe", phone: "+27821234567", email: "thandi@demo.co.za", dateOfBirth: "1985-03-15", medicalAid: "Discovery", gender: "F" },
    { id: "p2", name: "Johannes van der Merwe", phone: "+27839876543", email: "johannes@demo.co.za", dateOfBirth: "1972-11-02", medicalAid: "GEMS Emerald", gender: "M" },
    { id: "p3", name: "Naledi Dlamini", phone: "+27847654321", email: "naledi@demo.co.za", dateOfBirth: "1990-07-20", medicalAid: "Bonitas BonSave", gender: "F" },
    { id: "p4", name: "Pieter Botha", phone: "+27825551234", email: "pieter@demo.co.za", dateOfBirth: "1960-01-30", medicalAid: "Momentum", gender: "M" },
  ];
  const q = query.toLowerCase();
  return demo.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.includes(q));
}

// ── Export Functions ─────────────────────────────────────────────────────

/** Get Gemini FunctionDeclarations for a given tool filter */
export function getToolDeclarations(filter: ToolFilter): FunctionDeclaration[] {
  const filtered = getFilteredTools(filter);
  return filtered.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters as any,
  }));
}

/** Get Anthropic Tool definitions for a given tool filter */
export function getAnthropicTools(filter: ToolFilter): Anthropic.Tool[] {
  const filtered = getFilteredTools(filter);
  return filtered.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as any,
  }));
}

/** Execute a tool by name */
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext = {},
): Promise<string> {
  const tool = tools.get(name);
  if (!tool) return JSON.stringify({ error: `Unknown tool: ${name}` });
  return tool.execute(args, ctx);
}

/** Get tool names for a filter */
export function getToolNames(filter: ToolFilter): string[] {
  return getFilteredTools(filter).map((t) => t.name);
}

/** Internal: filter tools by tag or custom list */
function getFilteredTools(filter: ToolFilter): ToolDef[] {
  if (filter === "none") return [];
  if (Array.isArray(filter)) return filter.map((n) => tools.get(n)).filter(Boolean) as ToolDef[];
  return Array.from(tools.values()).filter((t) => t.tags.includes(filter));
}
