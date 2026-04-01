/**
 * Post-Visit Care — 7-Tier Patient Engagement Sequence
 *
 * Fires on booking_completed trigger. Each step has WhatsApp as primary channel
 * with email fallback. Step 3 (Day 7) includes AI triage escalation if patient
 * reports side effects.
 *
 * Timeline:
 *   1. Immediately  — Visit summary
 *   2. Day 1        — Pharmacy reminder
 *   3. Day 7        — Side effects check (AI triage if YES)
 *   4. Day 25       — Refill prompt
 *   5. Monthly      — Chronic vitals check
 *   6. Quarterly    — Lab test due
 *   7. Annual       — Screening reminder
 */

export const POST_VISIT_CARE_SEQUENCE = {
  name: "Post-Visit Care",
  description: "7-tier automated patient engagement after appointment completion. Covers visit summary through annual screening reminders.",
  triggerType: "booking_completed" as const,
  active: true,
  steps: [
    {
      order: 1,
      delayMinutes: 0,
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, thank you for visiting {{practiceName}} today.\n\nYour visit summary:\n• Service: {{service}}\n• Doctor: {{doctorName}}\n• Date: {{appointmentDate}}\n\nIf you have any concerns, reply to this message or call us at {{practicePhone}}.",
      conditionLogic: "",
      actionConfig: "{}",
    },
    {
      order: 2,
      delayMinutes: 1440, // Day 1
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, friendly reminder to collect your prescription. 💊\n\nPharmacy: {{pharmacyName}}\nAddress: {{pharmacyAddress}}\nHours: {{pharmacyHours}}\n\nIf you've already collected, just ignore this message.",
      conditionLogic: "",
      actionConfig: "{}",
    },
    {
      order: 3,
      delayMinutes: 10080, // Day 7
      channel: "whatsapp",
      actionType: "ai_check",
      messageTemplate:
        "Hi {{patientName}}, it's been a week since your visit at {{practiceName}}.\n\nAre you experiencing any side effects from your medication?\n\nReply YES or NO.",
      conditionLogic: "response == 'YES'",
      actionConfig: JSON.stringify({
        escalate: true,
        escalateTo: "triage",
        escalateMessage: "Patient {{patientName}} reported side effects on Day 7 post-visit. Response: {{lastResponse}}. Please review and follow up.",
      }),
    },
    {
      order: 4,
      delayMinutes: 36000, // Day 25
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, your prescription for {{medicationName}} may be running low.\n\nWould you like to book a refill appointment?\n\nReply BOOK to schedule, or call us at {{practicePhone}}.",
      conditionLogic: "",
      actionConfig: JSON.stringify({
        onResponse: "BOOK",
        responseAction: "create_booking",
      }),
    },
    {
      order: 5,
      delayMinutes: 43200, // ~30 days
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, it's time for your monthly chronic care check.\n\nLast recorded vitals:\n• Blood Pressure: {{lastBP}}\n• Glucose: {{lastGlucose}}\n\nReply UPDATE to log new readings, or BOOK to schedule an in-person check.",
      conditionLogic: "",
      actionConfig: "{}",
    },
    {
      order: 6,
      delayMinutes: 129600, // ~90 days
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, you're due for routine lab work.\n\nYour last tests were on {{lastLabDate}}.\n\nReply BOOK to schedule your lab appointment at {{practiceName}}, or call us at {{practicePhone}}.",
      conditionLogic: "",
      actionConfig: "{}",
    },
    {
      order: 7,
      delayMinutes: 525600, // ~365 days
      channel: "whatsapp",
      actionType: "message",
      messageTemplate:
        "Hi {{patientName}}, it's time for your annual health screening. 🏥\n\n{{screeningType}} is recommended based on your profile.\n\nBook online at {{practiceUrl}} or reply BOOK to schedule.\n\nYour health is our priority — {{practiceName}} team.",
      conditionLogic: "",
      actionConfig: "{}",
    },
  ],
};

/**
 * Seed the post-visit-care sequence into the database for a practice.
 * Idempotent — skips if sequence already exists.
 */
export async function seedPostVisitCareSequence(practiceId: string): Promise<{ created: boolean; sequenceId: string }> {
  const { prisma } = await import("@/lib/prisma");

  // Check if already exists
  const existing = await prisma.engagementSequence.findFirst({
    where: { practiceId, name: POST_VISIT_CARE_SEQUENCE.name },
  });

  if (existing) {
    return { created: false, sequenceId: existing.id };
  }

  // Create sequence + steps in a transaction
  const sequence = await prisma.engagementSequence.create({
    data: {
      practiceId,
      name: POST_VISIT_CARE_SEQUENCE.name,
      description: POST_VISIT_CARE_SEQUENCE.description,
      triggerType: POST_VISIT_CARE_SEQUENCE.triggerType,
      active: true,
      steps: {
        create: POST_VISIT_CARE_SEQUENCE.steps.map((step) => ({
          stepOrder: step.order,
          delayMinutes: step.delayMinutes,
          channel: step.channel,
          actionType: step.actionType,
          messageTemplate: step.messageTemplate,
          conditionLogic: step.conditionLogic,
          actionConfig: step.actionConfig,
        })),
      },
    },
  });

  return { created: true, sequenceId: sequence.id };
}
