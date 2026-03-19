import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// GET — check onboarding progress
export async function GET(request: Request) {
  const guard = await guardRoute(request, "onboarding");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      completed: false,
      steps: {
        practice_setup: true,
        branding: true,
        first_patient: true,
        first_booking: false,
        whatsapp_config: false,
        team_invite: false,
      },
      currentStep: 4,
      totalSteps: 6,
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    include: { _count: { select: { patients: true, bookings: true, users: true } } },
  });

  if (!practice) return NextResponse.json({ error: "No practice" }, { status: 404 });

  const steps = {
    practice_setup: !!(practice.name && practice.type && practice.address),
    branding: !!(practice.primaryColor !== "#D4AF37" || practice.logoUrl || practice.tagline),
    first_patient: (practice._count?.patients || 0) > 0,
    first_booking: (practice._count?.bookings || 0) > 0,
    whatsapp_config: false, // Will be true when Twilio is configured
    team_invite: (practice._count?.users || 0) > 1,
  };

  const completedCount = Object.values(steps).filter(Boolean).length;

  return NextResponse.json({
    completed: completedCount === Object.keys(steps).length,
    steps,
    currentStep: completedCount + 1,
    totalSteps: Object.keys(steps).length,
  });
}

// POST — mark onboarding as completed
export async function POST(request: Request) {
  const guard = await guardRoute(request, "onboarding");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ completed: true });
  }

  // We could store this in practice metadata, but for now just return success
  return NextResponse.json({ completed: true });
}
