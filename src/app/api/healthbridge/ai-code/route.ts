import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { suggestCodes } from "@/lib/healthbridge/ai-coder";

/** POST /api/healthbridge/ai-code — AI-powered ICD-10 + CPT code suggestion
 * The feature NO SA PMS has. Accepts clinical notes, returns suggested codes
 * with PMB/CDL flags, confidence levels, and reasoning.
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-ai-code");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const notes = body.clinicalNotes || body.notes || "";

  if (!notes || notes.trim().length < 10) {
    return NextResponse.json(
      { error: "Clinical notes must be at least 10 characters" },
      { status: 400 }
    );
  }

  const suggestion = await suggestCodes(notes);

  return NextResponse.json({
    suggestion,
    meta: {
      model: process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "keyword-fallback",
      notesLength: notes.length,
    },
  });
}
