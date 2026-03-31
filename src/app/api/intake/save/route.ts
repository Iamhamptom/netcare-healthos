/**
 * POST /api/intake/save
 * Persist intake analysis to patient medical record + create claim draft.
 * Closes the gap: intake → patient record → claim pipeline.
 */

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "intake-save", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await request.json();
    const { patientId, analysis, transcript } = body;

    if (!patientId || !analysis) {
      return NextResponse.json({ error: "patientId and analysis required" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // 1. Save SOAP to medical record
    const record = await prisma.medicalRecord.create({
      data: {
        type: "consultation",
        title: "Clinical Intake - " + (analysis.chiefComplaint || "Consultation"),
        description: JSON.stringify({
          soap: analysis.soap,
          transcript: transcript || "",
          redFlags: analysis.redFlags || [],
          medications: analysis.medications || [],
        }),
        diagnosis: (analysis.icd10Codes || []).map((c: { code: string; description: string }) =>
          `${c.code}: ${c.description}`
        ).join("; "),
        treatment: analysis.soap?.plan || analysis.soap?.assessment || "",
        provider: "AI Clinical Intake",
        patientId,
        practiceId: guard.practiceId,
        date: new Date(),
      },
    });

    // 2. Create claim draft from ICD-10 + tariff codes
    let claimDraft = null;
    if (analysis.icd10Codes?.length > 0 || analysis.tariffCodes?.length > 0) {
      claimDraft = {
        patientId,
        patientName: patient.name,
        icd10Codes: analysis.icd10Codes || [],
        tariffCodes: analysis.tariffCodes || [],
        status: "draft",
        createdFrom: "intake",
        recordId: record.id,
        practiceId: guard.practiceId,
        createdAt: new Date().toISOString(),
      };
      // Store as a pending claim in the medical record metadata
      await prisma.medicalRecord.update({
        where: { id: record.id },
        data: {
          description: JSON.stringify({
            ...JSON.parse(record.description || "{}"),
            claimDraft,
          }),
        },
      });
    }

    return NextResponse.json({
      saved: true,
      recordId: record.id,
      claimDraft: claimDraft ? { status: "draft", codes: claimDraft.icd10Codes.length } : null,
    });
  } catch (err) {
    console.error("[intake/save] Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed" }, { status: 500 });
  }
}
