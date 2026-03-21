import { NextRequest, NextResponse } from "next/server";
import { codeFromNotes, batchCodeFromNotes } from "@/lib/claims/clinical-coder";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";

// POST — Code consultation notes into complete claim lines
export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "code-from-notes", { limit: 15, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();

    // Single note
    if (body.text) {
      const result = await codeFromNotes({
        text: body.text,
        patientGender: body.patientGender,
        patientAge: body.patientAge ? Number(body.patientAge) : undefined,
        patientName: body.patientName,
        practitionerType: body.practitionerType || "gp",
        schemeCode: body.schemeCode,
        dateOfService: body.dateOfService,
      });

      return NextResponse.json(result);
    }

    // Batch notes
    if (Array.isArray(body.notes)) {
      if (body.notes.length > 20) {
        return NextResponse.json({ error: "Maximum 20 notes per batch" }, { status: 400 });
      }
      const results = await batchCodeFromNotes(body.notes);
      const clean = results.filter(r => r.isClean).length;
      const total = results.length;

      // Combine Healthbridge export
      const hbHeaders = "DATE,ICD10_1,ICD10_2,ICD10_3,ICD10_4,TARIFF_CODE,NAPPI_CODE,MODIFIER,QTY,AMOUNT";
      const hbLines = results
        .filter(r => r.healthbridgeFormat)
        .map(r => r.healthbridgeFormat!.split("\n")[1])
        .join("\n");

      return NextResponse.json({
        results,
        summary: { total, clean, needsReview: total - clean },
        healthbridgeExport: `${hbHeaders}\n${hbLines}`,
      });
    }

    return NextResponse.json({ error: "Provide 'text' for single note or 'notes' array for batch" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Clinical coding error:", msg);
    return NextResponse.json({ error: `Clinical coding failed: ${msg}` }, { status: 500 });
  }
}
