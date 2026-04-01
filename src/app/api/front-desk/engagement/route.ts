import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize } from "@/lib/validate";

/**
 * Front Desk — Patient Engagement Status & Enrollment
 *
 * GET: List active post-visit care enrollments for this practice.
 * POST: Manually enroll a patient into the post-visit-care sequence.
 */

const ENGAGEMENT_STEPS = [
  { order: 1, label: "Visit Summary", timing: "Immediately", icon: "clipboard" },
  { order: 2, label: "Pharmacy Reminder", timing: "Day 1", icon: "pill" },
  { order: 3, label: "Side Effects Check", timing: "Day 7", icon: "alert-triangle" },
  { order: 4, label: "Refill Prompt", timing: "Day 25", icon: "repeat" },
  { order: 5, label: "Chronic Vitals", timing: "Monthly", icon: "heart-pulse" },
  { order: 6, label: "Lab Test Due", timing: "Quarterly", icon: "flask" },
  { order: 7, label: "Annual Screening", timing: "Annual", icon: "calendar-check" },
];

export async function GET(request: Request) {
  const guard = await guardRoute(request, "front-desk-engagement");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    const demoEnrollments = [
      {
        id: "demo-enroll-1",
        patientName: "Thandi Mokoena",
        patientId: "demo-p-1",
        sequenceName: "Post-Visit Care",
        currentStep: 3,
        totalSteps: 7,
        status: "active",
        nextStepAt: new Date(Date.now() + 2 * 86400000).toISOString(),
        startedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        lastResponse: null,
        escalated: false,
        steps: ENGAGEMENT_STEPS,
      },
      {
        id: "demo-enroll-2",
        patientName: "James van der Merwe",
        patientId: "demo-p-2",
        sequenceName: "Post-Visit Care",
        currentStep: 1,
        totalSteps: 7,
        status: "active",
        nextStepAt: new Date(Date.now() + 86400000).toISOString(),
        startedAt: new Date().toISOString(),
        lastResponse: null,
        escalated: false,
        steps: ENGAGEMENT_STEPS,
      },
      {
        id: "demo-enroll-3",
        patientName: "Fatima Patel",
        patientId: "demo-p-3",
        sequenceName: "Post-Visit Care",
        currentStep: 3,
        totalSteps: 7,
        status: "escalated",
        nextStepAt: null,
        startedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        lastResponse: "YES — experiencing nausea and headaches",
        escalated: true,
        steps: ENGAGEMENT_STEPS,
      },
    ];
    return NextResponse.json({ enrollments: demoEnrollments, steps: ENGAGEMENT_STEPS });
  }

  const { prisma } = await import("@/lib/prisma");

  const sequence = await prisma.engagementSequence.findFirst({
    where: { practiceId: guard.practiceId, triggerType: "booking_completed", active: true },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });

  if (!sequence) {
    return NextResponse.json({ enrollments: [], steps: ENGAGEMENT_STEPS, sequenceExists: false });
  }

  const enrollments = await prisma.sequenceEnrollment.findMany({
    where: { sequenceId: sequence.id, status: { in: ["active", "escalated", "paused"] } },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  const patientIds = enrollments.map((e) => e.patientId).filter(Boolean);
  const patients = patientIds.length > 0
    ? await prisma.patient.findMany({ where: { id: { in: patientIds } }, select: { id: true, name: true } })
    : [];
  const patientMap = new Map(patients.map((p) => [p.id, p.name]));

  const enriched = enrollments.map((e) => ({
    id: e.id,
    patientName: patientMap.get(e.patientId) || "Unknown Patient",
    patientId: e.patientId,
    sequenceName: sequence.name,
    currentStep: e.currentStep,
    totalSteps: sequence.steps.length,
    status: e.status,
    nextStepAt: e.nextStepAt?.toISOString() || null,
    startedAt: e.startedAt.toISOString(),
    lastResponse: (() => { try { const m = JSON.parse(e.metadata || "{}"); return m.lastResponse || null; } catch { return null; } })(),
    escalated: e.status === "escalated",
    steps: ENGAGEMENT_STEPS,
  }));

  return NextResponse.json({ enrollments: enriched, steps: ENGAGEMENT_STEPS, sequenceExists: true });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "front-desk-engagement", { roles: ["admin", "receptionist", "nurse"] });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { patientId, patientName, context } = body as {
    patientId: string;
    patientName?: string;
    context?: Record<string, string>;
  };

  if (!patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      ok: true,
      enrollment: {
        id: `demo-enroll-${Date.now()}`,
        patientName: sanitize(patientName || "Demo Patient"),
        patientId,
        currentStep: 1,
        status: "active",
        startedAt: new Date().toISOString(),
      },
    });
  }

  const { prisma } = await import("@/lib/prisma");

  const sequence = await prisma.engagementSequence.findFirst({
    where: { practiceId: guard.practiceId, triggerType: "booking_completed", active: true },
  });

  if (!sequence) {
    return NextResponse.json({ error: "Post-visit-care sequence not found. Seed it first." }, { status: 404 });
  }

  const existing = await prisma.sequenceEnrollment.findFirst({
    where: { sequenceId: sequence.id, patientId, status: { in: ["active", "paused"] } },
  });

  if (existing) {
    return NextResponse.json({ error: "Patient already enrolled in this sequence", existingId: existing.id }, { status: 409 });
  }

  const firstStep = await prisma.sequenceStep.findFirst({
    where: { sequenceId: sequence.id, stepOrder: 1 },
  });

  const enrollment = await prisma.sequenceEnrollment.create({
    data: {
      sequenceId: sequence.id,
      patientId,
      practiceId: guard.practiceId,
      currentStep: 1,
      status: "active",
      startedAt: new Date(),
      nextStepAt: new Date(Date.now() + (firstStep?.delayMinutes || 0) * 60000),
      metadata: context ? JSON.stringify({ enrollmentContext: context }) : undefined,
    },
  });

  return NextResponse.json({ ok: true, enrollment: { id: enrollment.id, patientId, currentStep: 1, status: "active" } }, { status: 201 });
}
