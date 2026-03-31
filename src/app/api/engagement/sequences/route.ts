import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

/** GET /api/engagement/sequences — List engagement sequences */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "engagement-sequences");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      sequences: [
        { id: "s1", name: "Post-Visit Follow-Up", triggerType: "booking_completed", active: true, stepsCount: 4, enrollmentsCount: 23, description: "Automated follow-up after any appointment: satisfaction check → review request → recall reminder" },
        { id: "s2", name: "Diabetes Care Pathway", triggerType: "condition_match", active: true, stepsCount: 6, enrollmentsCount: 12, description: "Chronic diabetes management: HbA1c reminders, medication adherence, annual eye screening" },
        { id: "s3", name: "Post-Surgery Recovery", triggerType: "manual", active: true, stepsCount: 5, enrollmentsCount: 3, description: "Wound care check → pain assessment → follow-up booking → stitches removal reminder" },
        { id: "s4", name: "New Patient Welcome", triggerType: "manual", active: false, stepsCount: 3, enrollmentsCount: 0, description: "Welcome message → practice info → first appointment prompt" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const sequences = await prisma.engagementSequence.findMany({
    where: { practiceId: guard.practiceId },
    include: { _count: { select: { steps: true, enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    sequences: sequences.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      triggerType: s.triggerType,
      triggerConfig: JSON.parse(s.triggerConfig || "{}"),
      active: s.active,
      stepsCount: s._count.steps,
      enrollmentsCount: s._count.enrollments,
      createdAt: s.createdAt,
    })),
  });
}

/** POST /api/engagement/sequences — Create a new engagement sequence */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "engagement-sequences", { limit: 10 });
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  const err = validateRequired(body, ["name", "triggerType"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    return NextResponse.json({ sequence: { id: "demo-seq", ...body } });
  }

  const { prisma } = await import("@/lib/prisma");
  const sequence = await prisma.engagementSequence.create({
    data: {
      name: sanitize(body.name),
      description: sanitize(body.description || ""),
      triggerType: body.triggerType,
      triggerConfig: JSON.stringify(body.triggerConfig || {}),
      active: body.active ?? true,
      practiceId: guard.practiceId,
      steps: body.steps?.length
        ? {
            create: body.steps.map((step: Record<string, unknown>, i: number) => ({
              stepOrder: i + 1,
              delayMinutes: Number(step.delayMinutes) || 0,
              channel: String(step.channel || "whatsapp"),
              messageTemplate: String(step.messageTemplate || ""),
              actionType: String(step.actionType || "message"),
              actionConfig: JSON.stringify(step.actionConfig || {}),
              conditionLogic: String(step.conditionLogic || ""),
            })),
          }
        : undefined,
    },
    include: { steps: { orderBy: { stepOrder: "asc" } }, _count: { select: { enrollments: true } } },
  });

  return NextResponse.json({ sequence });
}
