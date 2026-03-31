import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPatientRoute, isPatientErrorResponse } from "@/lib/patient-auth";

/** GET /api/portal/profile — Get patient's own profile */
export async function GET(request: Request) {
  const guard = await guardPatientRoute(request, "profile");
  if (isPatientErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      patient: {
        id: "demo-patient-1",
        name: "Thandi Molefe",
        phone: "+27821234567",
        email: "thandi@demo.co.za",
        dateOfBirth: "1985-03-15",
        gender: "F",
        medicalAid: "Discovery Health",
        medicalAidNo: "DH12345678",
        bloodType: "O+",
        allergies: [
          { id: "a1", name: "Penicillin", severity: "severe", reaction: "Anaphylaxis" },
        ],
        medications: [
          { id: "m1", name: "Metformin 500mg", dosage: "1 tablet", frequency: "twice daily", active: true },
          { id: "m2", name: "Amlodipine 5mg", dosage: "1 tablet", frequency: "daily", active: true },
        ],
        lastVisit: "2026-03-15",
        nextRecallDue: "2026-06-15",
      },
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const patient = await prisma.patient.findUnique({
    where: { id: guard.patientId },
    include: {
      allergies: { select: { id: true, name: true, severity: true, reaction: true } },
      medications: {
        where: { active: true },
        select: { id: true, name: true, dosage: true, frequency: true, active: true },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({
    patient: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalAid: patient.medicalAid,
      medicalAidNo: patient.medicalAidNo,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medications: patient.medications,
      lastVisit: patient.lastVisit,
      nextRecallDue: patient.nextRecallDue,
    },
  });
}
