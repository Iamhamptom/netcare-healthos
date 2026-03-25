import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import type { ICD10Suggestion } from "@/lib/scribe/types";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "scribe-save", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const { patientId, soap, transcript, icd10Codes, redFlags, chiefComplaint } = body;

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
    }
    if (!soap || !transcript) {
      return NextResponse.json({ error: "SOAP note and transcript required" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        type: "consultation",
        title: "AI Scribe - " + (chiefComplaint || "Consultation"),
        description: JSON.stringify({ soap, transcript, redFlags: redFlags || [] }),
        diagnosis: (icd10Codes || []).map((c: ICD10Suggestion) => c.code + ": " + c.description).join("; "),
        treatment: soap.plan || "",
        provider: "AI Clinical Scribe",
        patientId,
        practiceId: guard.practiceId,
        date: new Date(),
      },
    });

    return NextResponse.json({ record, saved: true });
  } catch (err) {
    console.error("[scribe/save] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 }
    );
  }
}
