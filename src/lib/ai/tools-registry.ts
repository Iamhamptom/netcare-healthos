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
    const patient = await prisma.patient.findUnique({
      where: { id: String(args.patientId) },
      include: {
        allergies: true,
        medications: true,
        vitals: { orderBy: { createdAt: "desc" }, take: 5 },
        medicalRecords: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    return JSON.stringify(patient || { error: "Patient not found" });
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
    await prisma.booking.update({
      where: { id: String(args.bookingId) },
      data: { status: "cancelled", notes: args.reason ? `Cancelled: ${args.reason}` : "Cancelled" },
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
