/**
 * Engagement Sequence Engine — Automated Patient Journeys
 *
 * Handles: enrollment, step execution, template resolution, condition evaluation,
 * cron processing, patient response handling, and auto-trigger rules.
 */

import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";

// ── Types ────────────────────────────────────────────────────────────────

export interface SequenceStepResult {
  enrollmentId: string;
  stepOrder: number;
  channel: string;
  status: "sent" | "skipped" | "escalated" | "error";
  error?: string;
}

export interface TriggerConfig {
  conditions?: string[];   // ICD-10 codes on patient records
  icd10Codes?: string[];   // Match specific diagnoses
  ageMin?: number;
  ageMax?: number;
  medicalAid?: string;     // Match medical aid provider
  gender?: string;
  lastVisitBefore?: string; // ISO date — patient hasn't visited since
}

// ── Template Resolution ──────────────────────────────────────────────────

interface TemplateContext {
  patientName?: string;
  patientPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  service?: string;
  practiceName?: string;
  practicePhone?: string;
  practiceAddress?: string;
  lastResponse?: string;
  [key: string]: string | undefined;
}

export function resolveTemplate(template: string, ctx: TemplateContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? `{{${key}}}`);
}

// ── Condition Evaluation ─────────────────────────────────────────────────

export function evaluateCondition(condition: string, context: { response?: string; painLevel?: number; [key: string]: unknown }): boolean {
  if (!condition || !condition.trim()) return true; // Empty condition = always run

  const c = condition.trim();

  // Simple equality: response == 'YES'
  const eqMatch = c.match(/^(\w+)\s*==\s*'([^']+)'$/);
  if (eqMatch) {
    const [, field, value] = eqMatch;
    return String(context[field] ?? "").toUpperCase() === value.toUpperCase();
  }

  // Not-equal: response != 'NO'
  const neqMatch = c.match(/^(\w+)\s*!=\s*'([^']+)'$/);
  if (neqMatch) {
    const [, field, value] = neqMatch;
    return String(context[field] ?? "").toUpperCase() !== value.toUpperCase();
  }

  // Greater than: painLevel > 7
  const gtMatch = c.match(/^(\w+)\s*>\s*(\d+)$/);
  if (gtMatch) {
    const [, field, threshold] = gtMatch;
    return Number(context[field] ?? 0) > Number(threshold);
  }

  // Less than: painLevel < 3
  const ltMatch = c.match(/^(\w+)\s*<\s*(\d+)$/);
  if (ltMatch) {
    const [, field, threshold] = ltMatch;
    return Number(context[field] ?? 0) < Number(threshold);
  }

  // Contains: response contains 'BOOK'
  const containsMatch = c.match(/^(\w+)\s+contains\s+'([^']+)'$/i);
  if (containsMatch) {
    const [, field, substring] = containsMatch;
    return String(context[field] ?? "").toUpperCase().includes(substring.toUpperCase());
  }

  // Default: treat as truthy
  return true;
}

// ── Enrollment ───────────────────────────────────────────────────────────

export async function enrollPatient(
  sequenceId: string,
  patientId: string,
  practiceId: string,
  metadata?: Record<string, unknown>,
): Promise<{ enrollmentId: string }> {
  // Check for existing active enrollment in same sequence
  const existing = await prisma.sequenceEnrollment.findFirst({
    where: { sequenceId, patientId, status: "active" },
  });
  if (existing) return { enrollmentId: existing.id };

  // Get patient info for denormalized fields
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, phone: true },
  });

  // Get first step delay
  const firstStep = await prisma.sequenceStep.findFirst({
    where: { sequenceId, stepOrder: 1 },
  });

  const nextStepAt = firstStep
    ? new Date(Date.now() + firstStep.delayMinutes * 60 * 1000)
    : null;

  const enrollment = await prisma.sequenceEnrollment.create({
    data: {
      sequenceId,
      patientId,
      patientName: patient?.name ?? "",
      patientPhone: patient?.phone ?? "",
      currentStep: 0,
      status: "active",
      nextStepAt,
      metadata: JSON.stringify(metadata ?? {}),
      practiceId,
    },
  });

  return { enrollmentId: enrollment.id };
}

// ── Step Execution ───────────────────────────────────────────────────────

export async function processNextStep(enrollmentId: string): Promise<SequenceStepResult> {
  const enrollment = await prisma.sequenceEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { sequence: { include: { steps: { orderBy: { stepOrder: "asc" } } } } },
  });

  if (!enrollment || enrollment.status !== "active") {
    return { enrollmentId, stepOrder: 0, channel: "", status: "skipped", error: "Not active" };
  }

  const nextStepOrder = enrollment.currentStep + 1;
  const step = enrollment.sequence.steps.find((s) => s.stepOrder === nextStepOrder);

  if (!step) {
    // No more steps — mark completed
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: { status: "completed", completedAt: new Date(), nextStepAt: null },
    });
    return { enrollmentId, stepOrder: nextStepOrder, channel: "", status: "skipped", error: "Sequence completed" };
  }

  // Evaluate condition (if any)
  if (step.conditionLogic) {
    const meta = JSON.parse(enrollment.metadata || "{}");
    const conditionCtx = {
      response: enrollment.lastResponse,
      ...meta,
    };
    if (!evaluateCondition(step.conditionLogic, conditionCtx)) {
      // Condition not met — skip to next step
      const followingStep = enrollment.sequence.steps.find((s) => s.stepOrder === nextStepOrder + 1);
      await prisma.sequenceEnrollment.update({
        where: { id: enrollmentId },
        data: {
          currentStep: nextStepOrder,
          nextStepAt: followingStep
            ? new Date(Date.now() + followingStep.delayMinutes * 60 * 1000)
            : null,
          ...(!followingStep ? { status: "completed", completedAt: new Date() } : {}),
        },
      });
      return { enrollmentId, stepOrder: nextStepOrder, channel: step.channel, status: "skipped" };
    }
  }

  // Get practice info for template
  const practice = await prisma.practice.findUnique({
    where: { id: enrollment.practiceId },
    select: { name: true, phone: true, address: true },
  });

  // Resolve message template
  const message = resolveTemplate(step.messageTemplate, {
    patientName: enrollment.patientName,
    patientPhone: enrollment.patientPhone,
    practiceName: practice?.name ?? "",
    practicePhone: practice?.phone ?? "",
    practiceAddress: practice?.address ?? "",
    lastResponse: enrollment.lastResponse,
  });

  // Execute based on action type
  try {
    if (step.actionType === "escalate") {
      await prisma.sequenceEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "escalated", currentStep: nextStepOrder, nextStepAt: null },
      });
      // Log notification for staff
      await prisma.notification.create({
        data: {
          type: "email",
          recipient: "staff",
          patientName: enrollment.patientName,
          subject: `ESCALATION: ${enrollment.sequence.name}`,
          message: `Patient ${enrollment.patientName} requires attention. Last response: "${enrollment.lastResponse}"`,
          status: "sent",
          template: "escalation",
          practiceId: enrollment.practiceId,
        },
      });
      return { enrollmentId, stepOrder: nextStepOrder, channel: "escalation", status: "escalated" };
    }

    // Send the message via the right channel
    if (step.channel === "whatsapp" && enrollment.patientPhone) {
      try {
        await sendWhatsApp(enrollment.patientPhone, message);
      } catch (err) {
        console.error(`[sequence-engine] WhatsApp send failed: ${enrollment.patientPhone}`, err);
        await prisma.notification.create({
          data: { type: "whatsapp", recipient: enrollment.patientPhone, patientName: enrollment.patientName, message: `FAILED: ${message.slice(0, 200)}`, status: "failed", template: `sequence_step_${nextStepOrder}_failed`, practiceId: enrollment.practiceId },
        }).catch(() => {});
      }
    }

    if (step.channel === "email") {
      // Look up patient email
      const patient = await prisma.patient.findUnique({
        where: { id: enrollment.patientId },
        select: { email: true },
      });
      if (patient?.email) {
        try {
          await sendEmail({
            to: patient.email,
            subject: `${practice?.name ?? "Your Practice"} — ${enrollment.sequence.name}`,
            html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
          });
        } catch {
          // Log but don't fail
        }
      }
    }

    // Log notification
    await prisma.notification.create({
      data: {
        type: step.channel as "whatsapp" | "sms" | "email",
        recipient: enrollment.patientPhone || enrollment.patientId,
        patientName: enrollment.patientName,
        subject: enrollment.sequence.name,
        message,
        status: "sent",
        template: `sequence_step_${nextStepOrder}`,
        practiceId: enrollment.practiceId,
      },
    });

    // Advance to next step
    const followingStep = enrollment.sequence.steps.find((s) => s.stepOrder === nextStepOrder + 1);
    await prisma.sequenceEnrollment.update({
      where: { id: enrollmentId },
      data: {
        currentStep: nextStepOrder,
        nextStepAt: followingStep
          ? new Date(Date.now() + followingStep.delayMinutes * 60 * 1000)
          : null,
        ...(!followingStep ? { status: "completed", completedAt: new Date() } : {}),
      },
    });

    return { enrollmentId, stepOrder: nextStepOrder, channel: step.channel, status: "sent" };
  } catch (err) {
    return { enrollmentId, stepOrder: nextStepOrder, channel: step.channel, status: "error", error: String(err) };
  }
}

// ── Cron: Process All Due Steps ──────────────────────────────────────────

export async function processDueSteps(): Promise<SequenceStepResult[]> {
  const now = new Date();
  const dueEnrollments = await prisma.sequenceEnrollment.findMany({
    where: {
      status: "active",
      nextStepAt: { lte: now },
    },
    take: 100,
    orderBy: { nextStepAt: "asc" },
  });

  const results: SequenceStepResult[] = [];
  for (const enrollment of dueEnrollments) {
    // Race condition guard: atomically claim this enrollment by setting nextStepAt to future
    const claimed = await prisma.sequenceEnrollment.updateMany({
      where: { id: enrollment.id, status: "active", nextStepAt: { lte: now } },
      data: { nextStepAt: new Date(Date.now() + 5 * 60 * 1000) }, // Claim for 5 min
    });
    if (claimed.count === 0) continue; // Another cron already claimed it

    const result = await processNextStep(enrollment.id);
    results.push(result);
  }
  return results;
}

// ── Patient Response Handling ────────────────────────────────────────────

export async function handlePatientResponse(
  patientId: string,
  practiceId: string,
  response: string,
): Promise<{ handled: boolean; enrollmentId?: string }> {
  // Find active enrollment for this patient
  const enrollment = await prisma.sequenceEnrollment.findFirst({
    where: { patientId, practiceId, status: "active" },
    include: { sequence: { include: { steps: { orderBy: { stepOrder: "asc" } } } } },
    orderBy: { updatedAt: "desc" },
  });

  if (!enrollment) return { handled: false };

  // Parse numeric responses (e.g., pain scale 1-10)
  const numericMatch = response.trim().match(/^(\d+)$/);
  const painLevel = numericMatch ? parseInt(numericMatch[1], 10) : undefined;

  // Update enrollment with response
  const meta = JSON.parse(enrollment.metadata || "{}");
  meta.stepResults = meta.stepResults || [];
  meta.stepResults.push({
    step: enrollment.currentStep,
    response,
    painLevel,
    respondedAt: new Date().toISOString(),
  });

  if (painLevel !== undefined) {
    meta.painLevel = painLevel;
  }

  await prisma.sequenceEnrollment.update({
    where: { id: enrollment.id },
    data: {
      lastResponse: response,
      metadata: JSON.stringify(meta),
    },
  });

  // Check if current step has a conditional next step that can now proceed
  const currentStep = enrollment.sequence.steps.find((s) => s.stepOrder === enrollment.currentStep);
  const nextStep = enrollment.sequence.steps.find((s) => s.stepOrder === enrollment.currentStep + 1);

  if (nextStep) {
    // Schedule next step immediately (response received)
    await prisma.sequenceEnrollment.update({
      where: { id: enrollment.id },
      data: {
        nextStepAt: new Date(Date.now() + Math.max(nextStep.delayMinutes * 60 * 1000, 60000)), // min 1 minute
      },
    });
  }

  return { handled: true, enrollmentId: enrollment.id };
}

// ── Auto-Trigger Evaluation ──────────────────────────────────────────────

export async function evaluateAutoTriggers(practiceId: string): Promise<number> {
  const sequences = await prisma.engagementSequence.findMany({
    where: { practiceId, active: true, triggerType: { not: "manual" } },
  });

  let enrolled = 0;

  for (const sequence of sequences) {
    const config: TriggerConfig = JSON.parse(sequence.triggerConfig || "{}");

    if (sequence.triggerType === "recall_due") {
      // Find patients with overdue recalls
      const patients = await prisma.patient.findMany({
        where: {
          practiceId,
          nextRecallDue: { lte: new Date() },
          status: "active",
        },
        take: 50,
      });

      for (const patient of patients) {
        const result = await enrollPatient(sequence.id, patient.id, practiceId, {
          triggerSource: "recall_due",
          recallDue: patient.nextRecallDue?.toISOString(),
        });
        if (result.enrollmentId) enrolled++;
      }
    }

    if (sequence.triggerType === "condition_match" && config.icd10Codes?.length) {
      // Find patients with matching diagnosis codes
      const records = await prisma.medicalRecord.findMany({
        where: {
          practiceId,
          diagnosis: { in: config.icd10Codes },
        },
        select: { patientId: true },
        distinct: ["patientId"],
        take: 50,
      });

      for (const record of records) {
        await enrollPatient(sequence.id, record.patientId, practiceId, {
          triggerSource: "condition_match",
          matchedCodes: config.icd10Codes,
        });
        enrolled++;
      }
    }

    if (sequence.triggerType === "booking_completed") {
      // Find recently completed bookings (last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const bookings = await prisma.booking.findMany({
        where: {
          practiceId,
          status: "completed",
          scheduledAt: { gte: twoHoursAgo },
          followupSentAt: null,
        },
        take: 50,
      });

      for (const booking of bookings) {
        if (booking.patientPhone) {
          // Find patient by phone
          const patient = await prisma.patient.findFirst({
            where: { practiceId, phone: booking.patientPhone },
          });
          if (patient) {
            await enrollPatient(sequence.id, patient.id, practiceId, {
              triggerSource: "booking_completed",
              bookingId: booking.id,
              service: booking.service,
            });
            enrolled++;
          }
        }
      }
    }
  }

  return enrolled;
}

// ── Campaign Execution ───────────────────────────────────────────────────

export async function processScheduledCampaigns(practiceId?: string): Promise<{ campaignId: string; sent: number }[]> {
  const now = new Date();
  const campaigns = await prisma.patientCampaign.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
      ...(practiceId ? { practiceId } : {}),
    },
  });

  const results: { campaignId: string; sent: number }[] = [];

  for (const campaign of campaigns) {
    await prisma.patientCampaign.update({
      where: { id: campaign.id },
      data: { status: "sending" },
    });

    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: campaign.id, status: "pending" },
      take: 200, // Batch size
    });

    let sent = 0;
    const practice = await prisma.practice.findUnique({
      where: { id: campaign.practiceId },
      select: { name: true, phone: true, primaryColor: true },
    });

    for (const recipient of recipients) {
      // POPIA: Check marketing consent before sending campaign messages
      const consent = await prisma.consentRecord.findFirst({
        where: { patientId: recipient.patientId, consentType: "marketing", granted: true, revokedAt: null },
      });
      if (!consent) {
        await prisma.campaignRecipient.update({ where: { id: recipient.id }, data: { status: "opted_out" } });
        continue;
      }

      const message = resolveTemplate(campaign.messageTemplate, {
        patientName: recipient.patientName,
        practiceName: practice?.name ?? "",
        practicePhone: practice?.phone ?? "",
      });

      try {
        if ((campaign.channel === "whatsapp" || campaign.channel === "multi") && recipient.phone) {
          await sendWhatsApp(recipient.phone, message);
        }
        if ((campaign.channel === "email" || campaign.channel === "multi") && recipient.email) {
          await sendEmail({
            to: recipient.email,
            subject: campaign.name,
            html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
          });
        }

        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "sent", sentAt: new Date() },
        });
        sent++;
      } catch {
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: { status: "failed" },
        });
      }
    }

    // Update campaign counts
    const pendingLeft = await prisma.campaignRecipient.count({
      where: { campaignId: campaign.id, status: "pending" },
    });

    await prisma.patientCampaign.update({
      where: { id: campaign.id },
      data: {
        sentCount: { increment: sent },
        status: pendingLeft === 0 ? "completed" : "sending",
      },
    });

    results.push({ campaignId: campaign.id, sent });
  }

  return results;
}
