/**
 * Inbound Email Processor — AI triage for practice emails
 *
 * Processes emails from Gmail, Outlook, and Resend webhooks.
 * Auto-matches senders to patients, classifies category, sets priority.
 */

import { prisma } from "@/lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────

export interface InboundEmail {
  source: "gmail" | "outlook" | "resend_webhook";
  externalId?: string;
  fromEmail: string;
  fromName?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  practiceId: string;
  receivedAt?: Date;
}

export interface TriageResult {
  emailId: string;
  category: string;
  priority: string;
  summary: string;
  patientId: string | null;
  patientName: string;
}

// ── Category Classification ──────────────────────────────────────────────

const CATEGORY_PATTERNS: { category: string; patterns: RegExp; priority?: string }[] = [
  { category: "appointment", patterns: /\b(appointment|book|schedule|reschedule|cancel|confirm|slot|time|date|available|booking)\b/i },
  { category: "prescription", patterns: /\b(prescription|refill|repeat|medication|script|medicine|pharmacy|dispens|chronic)\b/i },
  { category: "results", patterns: /\b(result|lab|blood|test|pathology|report|finding|specimen|hba1c|cholesterol|glucose)\b/i },
  { category: "billing", patterns: /\b(invoice|bill|payment|account|statement|outstanding|receipt|claim|medical aid|scheme)\b/i },
  { category: "complaint", patterns: /\b(complain|unhappy|dissatisfied|problem|issue|poor|terrible|unacceptable|rude|wait)\b/i, priority: "high" },
  { category: "referral", patterns: /\b(refer|specialist|opinion|consultation|second opinion|transfer)\b/i },
  { category: "spam", patterns: /\b(unsubscribe|spam|marketing|newsletter|promotion|offer|deal|winner|congratulations)\b/i, priority: "low" },
];

const URGENT_PATTERNS = /\b(urgent|emergency|asap|immediate|critical|severe|bleeding|pain|chest|breathe|ambulance)\b/i;

export function classifyEmail(subject: string, body: string): { category: string; priority: string } {
  const text = `${subject} ${body}`;
  for (const { category, patterns, priority } of CATEGORY_PATTERNS) {
    if (patterns.test(text)) {
      return { category, priority: URGENT_PATTERNS.test(text) ? "urgent" : (priority ?? "normal") };
    }
  }
  return { category: "unprocessed", priority: URGENT_PATTERNS.test(text) ? "urgent" : "normal" };
}

// ── Patient Matching ─────────────────────────────────────────────────────

export async function matchEmailToPatient(fromEmail: string, practiceId: string): Promise<{ id: string; name: string } | null> {
  return prisma.patient.findFirst({
    where: { email: fromEmail, practiceId, status: "active" },
    select: { id: true, name: true },
  });
}

// ── Process Inbound Email ────────────────────────────────────────────────

export async function processInboundEmail(email: InboundEmail): Promise<TriageResult> {
  if (email.externalId) {
    const existing = await prisma.emailInbox.findFirst({
      where: { externalId: email.externalId, practiceId: email.practiceId },
    });
    if (existing) {
      return { emailId: existing.id, category: existing.triageCategory, priority: existing.triagePriority, summary: existing.triageSummary, patientId: existing.patientId, patientName: existing.patientName };
    }
  }

  const patient = await matchEmailToPatient(email.fromEmail, email.practiceId);
  const { category, priority } = classifyEmail(email.subject ?? "", email.bodyText ?? "");
  const summary = `${category.toUpperCase()}: ${email.subject || "(no subject)"} from ${email.fromName || email.fromEmail}`;

  const saved = await prisma.emailInbox.create({
    data: {
      source: email.source, externalId: email.externalId ?? "", fromEmail: email.fromEmail,
      fromName: email.fromName ?? "", subject: email.subject ?? "",
      bodyText: (email.bodyText ?? "").slice(0, 10000), bodyHtml: (email.bodyHtml ?? "").slice(0, 50000),
      patientId: patient?.id ?? null, patientName: patient?.name ?? "",
      triageCategory: category, triagePriority: priority, triageSummary: summary,
      status: "triaged", practiceId: email.practiceId, receivedAt: email.receivedAt ?? new Date(),
    },
  });

  return { emailId: saved.id, category, priority, summary, patientId: patient?.id ?? null, patientName: patient?.name ?? "" };
}

// ── Poll Gmail Inbox ─────────────────────────────────────────────────────

export async function pollGmailInbox(practiceId: string): Promise<TriageResult[]> {
  const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
  if (!practice) return [];
  const integrations = JSON.parse(practice.integrations || "{}");
  if (!integrations.gmailAccessToken) return [];

  try {
    const gmail = await import("@/lib/gmail");
    const authResult = await gmail.getValidAccessToken(integrations);
    if (authResult.didRefresh) {
      await prisma.practice.update({ where: { id: practiceId }, data: { integrations: JSON.stringify(authResult.updatedIntegrations) } });
    }
    const messageList = await gmail.fetchGmailMessages(authResult.accessToken, "is:unread", 10);
    const results: TriageResult[] = [];
    for (const msgRef of messageList.messages) {
      const msg = await gmail.getGmailMessage(authResult.accessToken, msgRef.id);
      if (!msg) continue;
      const result = await processInboundEmail({
        source: "gmail", externalId: msg.id, fromEmail: msg.from, fromName: "",
        subject: msg.subject, bodyText: msg.body, practiceId, receivedAt: new Date(msg.date),
      });
      results.push(result);
    }
    return results;
  } catch (err) {
    console.error("[email-processor] Gmail poll error:", err);
    return [];
  }
}

// ── Poll Outlook Inbox ───────────────────────────────────────────────────

export async function pollOutlookInbox(practiceId: string): Promise<TriageResult[]> {
  const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
  if (!practice) return [];
  const ms = await import("@/lib/microsoft");
  const integrations = ms.parseIntegrations(practice.integrations);
  const msConfig = ms.getMicrosoftConfig(integrations);
  if (!msConfig) return [];

  try {
    const authResult = await ms.getValidAccessToken(integrations);
    if (authResult.didRefresh) {
      await prisma.practice.update({ where: { id: practiceId }, data: { integrations: JSON.stringify(authResult.updatedIntegrations) } });
    }
    type MailMsg = { id: string; from: { emailAddress: { address: string; name: string } }; subject: string; bodyPreview: string; receivedDateTime: string };
    const result = await ms.graphRequest<{ value: MailMsg[] }>(
      "/me/mailFolders/inbox/messages?$filter=isRead eq false&$top=10&$select=id,from,subject,bodyPreview,receivedDateTime",
      authResult.accessToken,
    );
    if (!result.ok || !result.data.value) return [];
    const results: TriageResult[] = [];
    for (const msg of result.data.value) {
      const triaged = await processInboundEmail({
        source: "outlook", externalId: msg.id, fromEmail: msg.from.emailAddress.address,
        fromName: msg.from.emailAddress.name, subject: msg.subject, bodyText: msg.bodyPreview,
        practiceId, receivedAt: new Date(msg.receivedDateTime),
      });
      results.push(triaged);
    }
    return results;
  } catch (err) {
    console.error("[email-processor] Outlook poll error:", err);
    return [];
  }
}
