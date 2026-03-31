/**
 * Engagement Agent — AI SDK v6 ToolLoopAgent
 *
 * The brain of the Digital Patient Engagement Platform.
 * Orchestrates: sequences, campaigns, email triage, document sync,
 * chronic care gaps, population health, and reports back to Health OS agents.
 *
 * Can be invoked via POST /api/engagement/run with a natural language task.
 */

import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// ── Tool Definitions ─────────────────────────────────────────────────────

const getPatientEngagementSummary = tool({
  description: "Get a complete engagement summary for a patient: active sequences, campaign participation, recent messages, upcoming appointments, recall status, and chronic care gaps.",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
  }),
  execute: async ({ patientId }) => {
    const { prisma } = await import("@/lib/prisma");
    const [enrollments, recipients, bookings, notifications, recalls] = await Promise.all([
      prisma.sequenceEnrollment.findMany({ where: { patientId, status: "active" }, include: { sequence: { select: { name: true } } } }),
      prisma.campaignRecipient.findMany({ where: { patientId }, include: { campaign: { select: { name: true, type: true } } }, take: 5, orderBy: { createdAt: "desc" } }),
      prisma.booking.findMany({ where: { patientPhone: { not: "" } }, take: 5, orderBy: { scheduledAt: "desc" } }),
      prisma.notification.findMany({ where: { patientName: { not: "" } }, take: 10, orderBy: { sentAt: "desc" } }),
      prisma.recallItem.findMany({ where: { contacted: false }, take: 5, orderBy: { dueDate: "asc" } }),
    ]);
    return { enrollments, campaigns: recipients, recentBookings: bookings, recentNotifications: notifications.length, pendingRecalls: recalls };
  },
});

const enrollPatientInSequence = tool({
  description: "Enroll a patient in an automated engagement sequence (e.g., post-surgery follow-up, chronic care reminders, medication adherence).",
  inputSchema: z.object({
    sequenceId: z.string().describe("Engagement sequence ID"),
    patientId: z.string().describe("Patient ID to enroll"),
    practiceId: z.string().describe("Practice ID"),
  }),
  execute: async ({ sequenceId, patientId, practiceId }) => {
    const { enrollPatient } = await import("@/lib/engagement/sequence-engine");
    return enrollPatient(sequenceId, patientId, practiceId);
  },
});

const getDueSequenceSteps = tool({
  description: "Get all sequence enrollment steps that are due for execution right now. Used to understand pending engagement actions.",
  inputSchema: z.object({}),
  execute: async () => {
    const { prisma } = await import("@/lib/prisma");
    const due = await prisma.sequenceEnrollment.findMany({
      where: { status: "active", nextStepAt: { lte: new Date() } },
      include: { sequence: { select: { name: true } } },
      take: 50,
      orderBy: { nextStepAt: "asc" },
    });
    return { count: due.length, enrollments: due.map((e) => ({ id: e.id, patient: e.patientName, sequence: e.sequence.name, step: e.currentStep + 1, dueAt: e.nextStepAt })) };
  },
});

const executeSequenceSteps = tool({
  description: "Process all due sequence steps right now (sends messages, evaluates conditions, advances enrollments).",
  inputSchema: z.object({}),
  execute: async () => {
    const { processDueSteps } = await import("@/lib/engagement/sequence-engine");
    return processDueSteps();
  },
});

const getChronicCareGaps = tool({
  description: "Find patients overdue for chronic care management: diabetes (HbA1c), hypertension (BP check), eye screening, pap smear, etc. Returns patients who haven't had relevant visits/tests within recommended intervals.",
  inputSchema: z.object({
    practiceId: z.string().describe("Practice ID"),
    condition: z.string().optional().describe("Filter by condition: diabetes | hypertension | screening | all"),
  }),
  execute: async ({ practiceId, condition }) => {
    const { prisma } = await import("@/lib/prisma");
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const gaps: { category: string; patients: { id: string; name: string; phone: string; lastVisit: Date | null; daysOverdue: number }[] }[] = [];

    if (!condition || condition === "all" || condition === "diabetes") {
      // Diabetic patients (ICD-10 E10-E14) without visit in 3 months
      const diabeticRecords = await prisma.medicalRecord.findMany({
        where: { practiceId, diagnosis: { startsWith: "E1" } },
        select: { patientId: true },
        distinct: ["patientId"],
      });
      const diabeticIds = diabeticRecords.map((r) => r.patientId);
      if (diabeticIds.length > 0) {
        const overdue = await prisma.patient.findMany({
          where: { id: { in: diabeticIds }, practiceId, status: "active", OR: [{ lastVisit: { lt: threeMonthsAgo } }, { lastVisit: null }] },
          select: { id: true, name: true, phone: true, lastVisit: true },
          take: 50,
        });
        gaps.push({
          category: "Diabetes (HbA1c overdue >90 days)",
          patients: overdue.map((p) => ({
            id: p.id, name: p.name, phone: p.phone,
            lastVisit: p.lastVisit,
            daysOverdue: p.lastVisit ? Math.floor((Date.now() - p.lastVisit.getTime()) / 86400000) - 90 : 999,
          })),
        });
      }
    }

    if (!condition || condition === "all" || condition === "hypertension") {
      // Hypertension (I10-I15) without visit in 3 months
      const bpRecords = await prisma.medicalRecord.findMany({
        where: { practiceId, diagnosis: { startsWith: "I1" } },
        select: { patientId: true },
        distinct: ["patientId"],
      });
      const bpIds = bpRecords.map((r) => r.patientId);
      if (bpIds.length > 0) {
        const overdue = await prisma.patient.findMany({
          where: { id: { in: bpIds }, practiceId, status: "active", OR: [{ lastVisit: { lt: threeMonthsAgo } }, { lastVisit: null }] },
          select: { id: true, name: true, phone: true, lastVisit: true },
          take: 50,
        });
        gaps.push({
          category: "Hypertension (BP check overdue >90 days)",
          patients: overdue.map((p) => ({
            id: p.id, name: p.name, phone: p.phone,
            lastVisit: p.lastVisit,
            daysOverdue: p.lastVisit ? Math.floor((Date.now() - p.lastVisit.getTime()) / 86400000) - 90 : 999,
          })),
        });
      }
    }

    if (!condition || condition === "all" || condition === "screening") {
      // General screening: patients not seen in 12+ months
      const lapsed = await prisma.patient.findMany({
        where: { practiceId, status: "active", OR: [{ lastVisit: { lt: oneYearAgo } }, { lastVisit: null }] },
        select: { id: true, name: true, phone: true, lastVisit: true },
        take: 50,
        orderBy: { lastVisit: "asc" },
      });
      gaps.push({
        category: "Annual screening overdue (>12 months since last visit)",
        patients: lapsed.map((p) => ({
          id: p.id, name: p.name, phone: p.phone,
          lastVisit: p.lastVisit,
          daysOverdue: p.lastVisit ? Math.floor((Date.now() - p.lastVisit.getTime()) / 86400000) - 365 : 999,
        })),
      });
    }

    return { gaps, totalPatientsAtRisk: gaps.reduce((sum, g) => sum + g.patients.length, 0) };
  },
});

const getEngagementDashboard = tool({
  description: "Get aggregated engagement metrics: active sequences, campaign performance, channel volumes, response rates, booking conversions.",
  inputSchema: z.object({
    practiceId: z.string().describe("Practice ID"),
  }),
  execute: async ({ practiceId }) => {
    const { prisma } = await import("@/lib/prisma");
    const [activeEnrollments, completedEnrollments, escalated, campaigns, notifications, bookingsFromEngagement] = await Promise.all([
      prisma.sequenceEnrollment.count({ where: { practiceId, status: "active" } }),
      prisma.sequenceEnrollment.count({ where: { practiceId, status: "completed" } }),
      prisma.sequenceEnrollment.count({ where: { practiceId, status: "escalated" } }),
      prisma.patientCampaign.findMany({ where: { practiceId }, select: { id: true, name: true, status: true, sentCount: true, deliveredCount: true, respondedCount: true, bookedCount: true, type: true } }),
      prisma.notification.groupBy({ by: ["type"], where: { practiceId }, _count: true }),
      prisma.booking.count({ where: { practiceId, source: "whatsapp" } }),
    ]);

    return {
      sequences: { active: activeEnrollments, completed: completedEnrollments, escalated },
      campaigns: campaigns.map((c) => ({ name: c.name, type: c.type, status: c.status, sent: c.sentCount, delivered: c.deliveredCount, responded: c.respondedCount, booked: c.bookedCount, responseRate: c.sentCount > 0 ? ((c.respondedCount / c.sentCount) * 100).toFixed(1) + "%" : "0%" })),
      channelVolumes: Object.fromEntries(notifications.map((n) => [n.type, n._count])),
      bookingsFromEngagement: bookingsFromEngagement,
    };
  },
});

const createHealthCampaign = tool({
  description: "Create a patient health campaign with targeting criteria. Targets patients by age, gender, medical conditions (ICD-10), medical aid, and last visit date.",
  inputSchema: z.object({
    practiceId: z.string(),
    name: z.string().describe("Campaign name, e.g. 'Flu Vaccine 2026 — Over 65s'"),
    type: z.enum(["health", "recall", "preventive", "chronic", "screening", "custom"]),
    channel: z.enum(["whatsapp", "email", "sms", "multi"]),
    messageTemplate: z.string().describe("Message with {{patientName}}, {{practiceName}} placeholders"),
    targetCriteria: z.object({
      ageMin: z.number().optional(),
      ageMax: z.number().optional(),
      gender: z.string().optional(),
      conditions: z.array(z.string()).optional().describe("ICD-10 codes to match"),
      medicalAid: z.string().optional(),
      lastVisitBefore: z.string().optional().describe("ISO date — patients not seen since"),
    }),
    scheduledAt: z.string().optional().describe("ISO date to schedule send, or omit for draft"),
  }),
  execute: async ({ practiceId, name, type, channel, messageTemplate, targetCriteria, scheduledAt }) => {
    const { prisma } = await import("@/lib/prisma");

    // Build patient query from criteria
    const where: Record<string, unknown> = { practiceId, status: "active" };
    if (targetCriteria.gender) where.gender = targetCriteria.gender;
    if (targetCriteria.medicalAid) where.medicalAid = { contains: targetCriteria.medicalAid };
    if (targetCriteria.lastVisitBefore) where.lastVisit = { lt: new Date(targetCriteria.lastVisitBefore) };

    // Age filter requires DOB calculation
    let patients = await prisma.patient.findMany({
      where: where as any,
      select: { id: true, name: true, phone: true, email: true, dateOfBirth: true },
      take: 1000,
    });

    // Apply age filter
    if (targetCriteria.ageMin || targetCriteria.ageMax) {
      const now = new Date();
      patients = patients.filter((p) => {
        if (!p.dateOfBirth) return false;
        const age = Math.floor((now.getTime() - p.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (targetCriteria.ageMin && age < targetCriteria.ageMin) return false;
        if (targetCriteria.ageMax && age > targetCriteria.ageMax) return false;
        return true;
      });
    }

    // Create campaign
    const campaign = await prisma.patientCampaign.create({
      data: {
        name,
        type,
        channel,
        messageTemplate,
        targetCriteria: JSON.stringify(targetCriteria),
        status: scheduledAt ? "scheduled" : "draft",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        practiceId,
      },
    });

    // Add recipients
    if (patients.length > 0) {
      await prisma.campaignRecipient.createMany({
        data: patients.map((p) => ({
          campaignId: campaign.id,
          patientId: p.id,
          patientName: p.name,
          phone: p.phone,
          email: p.email,
        })),
      });
    }

    return { campaignId: campaign.id, recipientCount: patients.length, status: campaign.status };
  },
});

const sendCampaignBatch = tool({
  description: "Execute sending for a campaign that's in draft or scheduled status. Sends to all pending recipients.",
  inputSchema: z.object({
    campaignId: z.string(),
  }),
  execute: async ({ campaignId }) => {
    const { processScheduledCampaigns } = await import("@/lib/engagement/sequence-engine");
    const { prisma } = await import("@/lib/prisma");
    // Force campaign to scheduled state for immediate processing
    await prisma.patientCampaign.update({ where: { id: campaignId }, data: { status: "scheduled", scheduledAt: new Date() } });
    const results = await processScheduledCampaigns();
    return results.find((r) => r.campaignId === campaignId) ?? { campaignId, sent: 0 };
  },
});

const triageInboundEmail = tool({
  description: "AI-triage an inbound email: classify its category (appointment, prescription, results, billing, complaint, referral, spam), set priority, generate summary, and auto-match to a patient.",
  inputSchema: z.object({
    emailId: z.string().describe("EmailInbox record ID"),
  }),
  execute: async ({ emailId }) => {
    const { prisma } = await import("@/lib/prisma");
    const email = await prisma.emailInbox.findUnique({ where: { id: emailId } });
    if (!email) return { error: "Email not found" };

    // Auto-match patient by sender email
    const patient = await prisma.patient.findFirst({
      where: { email: email.fromEmail, practiceId: email.practiceId },
      select: { id: true, name: true },
    });

    // Simple keyword-based classification (the agent itself can do more sophisticated analysis)
    const text = `${email.subject} ${email.bodyText}`.toLowerCase();
    let category = "unprocessed";
    let priority = "normal";

    if (/appointment|book|schedule|reschedule|cancel/.test(text)) category = "appointment";
    else if (/prescription|refill|repeat|medication|script/.test(text)) category = "prescription";
    else if (/result|lab|blood|test|pathology/.test(text)) category = "results";
    else if (/invoice|bill|payment|account|statement/.test(text)) category = "billing";
    else if (/complain|unhappy|dissatisfied|problem|issue/.test(text)) { category = "complaint"; priority = "high"; }
    else if (/refer|specialist|opinion/.test(text)) category = "referral";
    else if (/unsubscribe|spam|marketing/.test(text)) category = "spam";

    if (/urgent|emergency|asap|immediate/.test(text)) priority = "urgent";

    const summary = `${category.toUpperCase()}: ${email.subject || "(no subject)"} from ${email.fromName || email.fromEmail}`;

    await prisma.emailInbox.update({
      where: { id: emailId },
      data: {
        triageCategory: category,
        triagePriority: priority,
        triageSummary: summary,
        patientId: patient?.id ?? null,
        patientName: patient?.name ?? "",
        status: "triaged",
      },
    });

    return { emailId, category, priority, summary, patientMatch: patient?.name ?? null };
  },
});

const getEmailInbox = tool({
  description: "Get the practice's email inbox with AI triage labels. Shows inbound emails sorted by priority and date.",
  inputSchema: z.object({
    practiceId: z.string(),
    status: z.string().optional().describe("Filter: new | triaged | in_progress | resolved | all"),
    limit: z.number().optional(),
  }),
  execute: async ({ practiceId, status, limit }) => {
    const { prisma } = await import("@/lib/prisma");
    const emails = await prisma.emailInbox.findMany({
      where: { practiceId, ...(status && status !== "all" ? { status } : {}) },
      orderBy: [{ triagePriority: "asc" }, { receivedAt: "desc" }],
      take: limit ?? 25,
    });
    return { emails, count: emails.length };
  },
});

const getPopulationHealthView = tool({
  description: "Get population health overview: patient demographics, disease burden (top ICD-10 codes), engagement rates by condition, chronic care compliance, NHI readiness.",
  inputSchema: z.object({
    practiceId: z.string(),
  }),
  execute: async ({ practiceId }) => {
    const { prisma } = await import("@/lib/prisma");
    const [totalPatients, activePatients, genderBreakdown, medicalAidBreakdown, topDiagnoses, engagedLast30, totalBookingsLast30] = await Promise.all([
      prisma.patient.count({ where: { practiceId } }),
      prisma.patient.count({ where: { practiceId, status: "active" } }),
      prisma.patient.groupBy({ by: ["gender"], where: { practiceId, status: "active" }, _count: true }),
      prisma.patient.groupBy({ by: ["medicalAid"], where: { practiceId, status: "active", medicalAid: { not: "" } }, _count: true, orderBy: { _count: { medicalAid: "desc" } }, take: 10 }),
      prisma.medicalRecord.groupBy({ by: ["diagnosis"], where: { practiceId, diagnosis: { not: "" } }, _count: true, orderBy: { _count: { diagnosis: "desc" } }, take: 15 }),
      prisma.notification.count({ where: { practiceId, sentAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.booking.count({ where: { practiceId, scheduledAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    ]);

    return {
      demographics: { total: totalPatients, active: activePatients, gender: Object.fromEntries(genderBreakdown.map((g) => [g.gender || "unknown", g._count])) },
      medicalAidDistribution: medicalAidBreakdown.map((m) => ({ scheme: m.medicalAid, count: m._count })),
      diseaseBurden: topDiagnoses.map((d) => ({ icd10: d.diagnosis, count: d._count })),
      engagement30d: { notifications: engagedLast30, bookings: totalBookingsLast30 },
    };
  },
});

const sendWhatsAppMessage = tool({
  description: "Send a WhatsApp message to a patient. Checks POPIA marketing consent before sending.",
  inputSchema: z.object({
    phone: z.string().describe("SA phone number (+27...)"),
    message: z.string(),
    patientName: z.string().optional(),
    practiceId: z.string(),
  }),
  execute: async ({ phone, message, patientName, practiceId }) => {
    const { prisma } = await import("@/lib/prisma");
    // Check marketing consent
    if (patientName) {
      const patient = await prisma.patient.findFirst({ where: { phone, practiceId } });
      if (patient) {
        const consent = await prisma.consentRecord.findFirst({
          where: { patientId: patient.id, consentType: "marketing", granted: true, revokedAt: null },
        });
        if (!consent) return { sent: false, reason: "Patient has not consented to marketing messages (POPIA)" };
      }
    }

    try {
      const { sendWhatsApp } = await import("@/lib/twilio");
      await sendWhatsApp(phone, message);
      await prisma.notification.create({
        data: { type: "whatsapp", recipient: phone, patientName: patientName ?? "", message, status: "sent", template: "engagement_agent", practiceId },
      });
      return { sent: true };
    } catch (err) {
      return { sent: false, reason: String(err) };
    }
  },
});

const sendEmailMessage = tool({
  description: "Send an email to a patient or address via Resend.",
  inputSchema: z.object({
    to: z.string().describe("Email address"),
    subject: z.string(),
    body: z.string().describe("Plain text message (will be wrapped in HTML template)"),
    practiceId: z.string(),
  }),
  execute: async ({ to, subject, body, practiceId }) => {
    try {
      const { sendEmail } = await import("@/lib/resend");
      await sendEmail({ to, subject, html: `<p>${body.replace(/\n/g, "<br/>")}</p>` });
      const { prisma } = await import("@/lib/prisma");
      await prisma.notification.create({
        data: { type: "email", recipient: to, subject, message: body, status: "sent", template: "engagement_agent", practiceId },
      });
      return { sent: true };
    } catch (err) {
      return { sent: false, reason: String(err) };
    }
  },
});

const checkConsent = tool({
  description: "Check if a patient has POPIA consent for a specific type (treatment, data_processing, marketing, research).",
  inputSchema: z.object({
    patientId: z.string(),
    consentType: z.enum(["treatment", "data_processing", "marketing", "research"]),
  }),
  execute: async ({ patientId, consentType }) => {
    const { prisma } = await import("@/lib/prisma");
    const consent = await prisma.consentRecord.findFirst({
      where: { patientId, consentType, granted: true, revokedAt: null },
    });
    return { hasConsent: !!consent, type: consentType, grantedAt: consent?.grantedAt ?? null };
  },
});

const listSequences = tool({
  description: "List all engagement sequences for a practice with enrollment counts.",
  inputSchema: z.object({
    practiceId: z.string(),
  }),
  execute: async ({ practiceId }) => {
    const { prisma } = await import("@/lib/prisma");
    const sequences = await prisma.engagementSequence.findMany({
      where: { practiceId },
      include: { _count: { select: { enrollments: true, steps: true } } },
      orderBy: { createdAt: "desc" },
    });
    return sequences.map((s) => ({ id: s.id, name: s.name, trigger: s.triggerType, active: s.active, steps: s._count.steps, enrollments: s._count.enrollments }));
  },
});

const getUpcomingRecalls = tool({
  description: "Get patients with upcoming or overdue recall items (checkups, screenings, follow-ups).",
  inputSchema: z.object({
    practiceId: z.string(),
    daysAhead: z.number().optional().describe("How many days ahead to look (default: 30)"),
  }),
  execute: async ({ practiceId, daysAhead }) => {
    const { prisma } = await import("@/lib/prisma");
    const cutoff = new Date(Date.now() + (daysAhead ?? 30) * 86400000);
    const recalls = await prisma.recallItem.findMany({
      where: { practiceId, contacted: false, dueDate: { lte: cutoff } },
      orderBy: { dueDate: "asc" },
      take: 100,
    });
    const overdue = recalls.filter((r) => r.dueDate < new Date());
    return { total: recalls.length, overdue: overdue.length, upcoming: recalls.length - overdue.length, items: recalls.slice(0, 20) };
  },
});

const syncOneDriveFiles = tool({
  description: "List files from the practice's connected OneDrive. Requires Microsoft 365 connection.",
  inputSchema: z.object({
    practiceId: z.string(),
    path: z.string().optional().describe("OneDrive folder path (default: root)"),
  }),
  execute: async ({ practiceId, path }) => {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    if (!practice) return { error: "Practice not found" };

    const { parseIntegrations, getMicrosoftConfig, getValidAccessToken, graphRequest } = await import("@/lib/microsoft");
    const integrations = parseIntegrations(practice.integrations);
    const msConfig = getMicrosoftConfig(integrations);
    if (!msConfig) return { error: "Microsoft 365 not connected. Connect via Settings > Microsoft." };

    try {
      const { accessToken, updatedIntegrations, didRefresh } = await getValidAccessToken(integrations);
      if (didRefresh) {
        await prisma.practice.update({ where: { id: practiceId }, data: { integrations: JSON.stringify(updatedIntegrations) } });
      }

      const endpoint = path ? `/me/drive/root:/${encodeURIComponent(path)}:/children` : "/me/drive/root/children";
      const result = await graphRequest<{ value: { id: string; name: string; size: number; lastModifiedDateTime: string; file?: { mimeType: string } }[] }>(endpoint, accessToken);

      if (!result.ok) return { error: "Failed to list files" };
      return {
        files: (result.data.value || []).map((f) => ({
          id: f.id,
          name: f.name,
          size: f.size,
          modified: f.lastModifiedDateTime,
          type: f.file?.mimeType ?? "folder",
        })),
      };
    } catch (err) {
      return { error: String(err) };
    }
  },
});

const exportToExcel = tool({
  description: "Generate an Excel-compatible CSV export of engagement data (patients, sequences, campaigns, chronic care gaps).",
  inputSchema: z.object({
    practiceId: z.string(),
    reportType: z.enum(["patients", "sequences", "campaigns", "chronic_gaps", "notifications"]),
  }),
  execute: async ({ practiceId, reportType }) => {
    const { prisma } = await import("@/lib/prisma");

    if (reportType === "patients") {
      const patients = await prisma.patient.findMany({
        where: { practiceId, status: "active" },
        select: { name: true, phone: true, email: true, dateOfBirth: true, gender: true, medicalAid: true, medicalAidNo: true, lastVisit: true, nextRecallDue: true },
        take: 5000,
      });
      const headers = "Name,Phone,Email,DOB,Gender,Medical Aid,Member No,Last Visit,Next Recall";
      const rows = patients.map((p) => [p.name, p.phone, p.email, p.dateOfBirth?.toISOString().slice(0, 10) ?? "", p.gender, p.medicalAid, p.medicalAidNo, p.lastVisit?.toISOString().slice(0, 10) ?? "", p.nextRecallDue?.toISOString().slice(0, 10) ?? ""].join(","));
      return { csv: `\uFEFF${headers}\n${rows.join("\n")}`, rowCount: patients.length, format: "csv" };
    }

    if (reportType === "sequences") {
      const enrollments = await prisma.sequenceEnrollment.findMany({
        where: { practiceId },
        include: { sequence: { select: { name: true } } },
        take: 5000,
      });
      const headers = "Sequence,Patient,Status,Current Step,Started,Completed";
      const rows = enrollments.map((e) => [e.sequence.name, e.patientName, e.status, e.currentStep, e.startedAt.toISOString().slice(0, 10), e.completedAt?.toISOString().slice(0, 10) ?? ""].join(","));
      return { csv: `\uFEFF${headers}\n${rows.join("\n")}`, rowCount: enrollments.length, format: "csv" };
    }

    return { csv: "", rowCount: 0, format: "csv", error: `Report type '${reportType}' not yet implemented` };
  },
});

// ── The Agent ────────────────────────────────────────────────────────────

export const engagementAgent = new ToolLoopAgent({
  model: google("gemini-2.5-flash"),

  instructions: `You are the Patient Engagement Agent for a South African healthcare practice, powered by Netcare Health OS.

YOUR ROLE: Orchestrate all patient engagement — automated sequences, health campaigns, chronic care management, email triage, document handling, and communication across WhatsApp/email/SMS.

CAPABILITIES:
- Enroll patients in automated care sequences (post-visit follow-up, chronic disease management, medication adherence, screening reminders)
- Create and execute health campaigns targeting patients by age, condition, medical aid, gender
- Identify chronic care gaps (diabetics overdue for HbA1c, hypertensives missing BP checks, lapsed screening patients)
- Triage inbound emails with AI classification (appointment, prescription, results, billing, complaint, referral)
- Generate Excel reports and sync with OneDrive
- Send WhatsApp/email messages with POPIA consent enforcement
- View engagement dashboards and population health metrics

CRITICAL RULES:
1. ALWAYS check POPIA consent before sending marketing messages — use checkConsent tool
2. WhatsApp is the PRIMARY channel in SA (95%+ patients use it)
3. Never fabricate patient data — use tools to get real data
4. Amounts in South African Rand (R)
5. Medical codes are ICD-10-ZA (NOT US ICD-10-CM) and CCSA tariffs (NOT CPT)
6. Report findings clearly with numbers and actionable recommendations
7. When running engagement actions, confirm counts before bulk operations

SA HEALTHCARE CONTEXT:
- Chronic care is where outcomes AND revenue live — engaged chronic patients reduce hospitalizations
- Key chronic conditions: Diabetes (E10-E14), Hypertension (I10-I15), HIV (B20), Asthma (J45)
- PMB (Prescribed Minimum Benefits): medical aids MUST cover 270 DTPs + 27 CDL conditions
- Screening intervals: HbA1c every 3 months, BP every 3 months, Pap smear every 3 years, Eye screening annually for diabetics
- NHI readiness requires proof of preventive care and patient engagement

When reporting back, structure your response with:
- Key metrics (numbers)
- Patients at risk (specific names if available)
- Recommended actions
- Expected outcomes`,

  tools: {
    getPatientEngagementSummary,
    enrollPatientInSequence,
    getDueSequenceSteps,
    executeSequenceSteps,
    getChronicCareGaps,
    getEngagementDashboard,
    createHealthCampaign,
    sendCampaignBatch,
    triageInboundEmail,
    getEmailInbox,
    getPopulationHealthView,
    sendWhatsAppMessage,
    sendEmailMessage,
    checkConsent,
    listSequences,
    getUpcomingRecalls,
    syncOneDriveFiles,
    exportToExcel,
  },

  stopWhen: stepCountIs(25),
});
