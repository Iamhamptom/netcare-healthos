import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPatientRoute, isPatientErrorResponse } from "@/lib/patient-auth";

/** GET /api/portal/results — Get patient's lab results and medical records */
export async function GET(request: Request) {
  const guard = await guardPatientRoute(request, "results");
  if (isPatientErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      results: [
        { id: "r1", type: "lab_result", title: "HbA1c Test", description: "HbA1c: 7.2% — Diabetes control improved slightly but still above target (<7%)", diagnosis: "E11.9", date: "2026-03-15" },
        { id: "r2", type: "consultation", title: "GP Consultation — Diabetes Review", description: "Blood glucose well-managed. Continue Metformin. Next HbA1c in 3 months.", diagnosis: "E11.9", date: "2026-03-15" },
        { id: "r3", type: "lab_result", title: "Blood Pressure Check", description: "BP: 138/88 mmHg — Slightly elevated. Continue Amlodipine.", diagnosis: "I10", date: "2026-02-28" },
      ],
      vitals: {
        latest: { bloodPressureSys: 138, bloodPressureDia: 88, heartRate: 72, weight: 85.2, bloodGlucose: 8.1, recordedAt: "2026-03-15" },
      },
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const [records, vitals] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { patientId: guard.patientId },
      select: { id: true, type: true, title: true, description: true, diagnosis: true, date: true },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.vitals.findMany({
      where: { patientId: guard.patientId },
      orderBy: { recordedAt: "desc" },
      take: 1,
    }),
  ]);

  return NextResponse.json({
    results: records,
    vitals: { latest: vitals[0] ?? null },
  });
}
