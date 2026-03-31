import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPatientRoute, isPatientErrorResponse } from "@/lib/patient-auth";

/** GET /api/portal/prescriptions — Get patient's active medications */
export async function GET(request: Request) {
  const guard = await guardPatientRoute(request, "prescriptions");
  if (isPatientErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      medications: [
        { id: "m1", name: "Metformin 500mg", dosage: "1 tablet", frequency: "twice daily", prescriber: "Dr. Naidoo", startDate: "2025-06-01", active: true },
        { id: "m2", name: "Amlodipine 5mg", dosage: "1 tablet", frequency: "once daily", prescriber: "Dr. Naidoo", startDate: "2025-08-15", active: true },
        { id: "m3", name: "Vitamin D3 1000IU", dosage: "1 capsule", frequency: "daily", prescriber: "Dr. Naidoo", startDate: "2026-01-10", active: true },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const medications = await prisma.medication.findMany({
    where: { patientId: guard.patientId, active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    medications: medications.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      prescriber: m.prescriber,
      startDate: m.startDate,
      active: m.active,
    })),
  });
}

/** POST /api/portal/prescriptions — Request a prescription refill */
export async function POST(request: Request) {
  const guard = await guardPatientRoute(request, "prescriptions", { limit: 5 });
  if (isPatientErrorResponse(guard)) return guard;

  const { medicationIds, notes } = await request.json();
  if (!medicationIds || !Array.isArray(medicationIds) || medicationIds.length === 0) {
    return NextResponse.json({ error: "Select at least one medication to refill" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      message: "Your refill request has been sent to the practice. They'll prepare your script and notify you when it's ready.",
    });
  }

  const { prisma } = await import("@/lib/prisma");

  // Get patient + medications
  const patient = await prisma.patient.findUnique({
    where: { id: guard.patientId },
    select: { name: true, phone: true },
  });

  const medications = await prisma.medication.findMany({
    where: { id: { in: medicationIds }, patientId: guard.patientId, active: true },
  });

  if (medications.length === 0) {
    return NextResponse.json({ error: "No valid medications found" }, { status: 400 });
  }

  const medList = medications.map((m) => `${m.name} (${m.dosage}, ${m.frequency})`).join(", ");

  // Create a conversation message for the practice
  let conversation = await prisma.conversation.findFirst({
    where: { patientId: guard.patientId, practiceId: guard.practiceId },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { patientId: guard.patientId, practiceId: guard.practiceId, channel: "portal", status: "active" },
    });
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "patient",
      content: `PRESCRIPTION REFILL REQUEST\n\nMedications: ${medList}\n${notes ? `Notes: ${notes}` : ""}`,
      approved: true,
    },
  });

  // Log notification for staff
  await prisma.notification.create({
    data: {
      type: "email",
      recipient: "staff",
      patientName: patient?.name ?? "",
      subject: "Prescription Refill Request",
      message: `${patient?.name} has requested a refill for: ${medList}`,
      status: "sent",
      template: "refill_request",
      practiceId: guard.practiceId,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Your refill request has been sent to the practice. They'll prepare your script and notify you when it's ready.",
  });
}
