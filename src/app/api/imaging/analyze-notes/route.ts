/**
 * POST /api/imaging/analyze-notes
 *
 * Clinical Notes → Structured SOAP + ICD-10 + Tariff suggestions
 * Accepts: text (doctor's notes) or audio transcription
 * Returns: structured SOAP note, suggested ICD-10 codes, tariff codes
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimitByIp(req, "imaging-notes", { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const body = await req.json();
    const notes = String(body.notes || "").trim();
    const patientAge = body.patientAge as number | undefined;
    const patientGender = body.patientGender as string | undefined;

    if (!notes) return NextResponse.json({ error: "Clinical notes required" }, { status: 400 });
    if (notes.length > 10000) return NextResponse.json({ error: "Notes too long (max 10,000 chars)" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });

    const prompt = `You are a SA medical coding expert. Convert these clinical notes into a structured SOAP note with ICD-10-ZA codes and CCSA tariff suggestions.

CLINICAL NOTES:
${notes}

${patientAge ? `Patient age: ${patientAge}` : ""}
${patientGender ? `Patient gender: ${patientGender}` : ""}

IMPORTANT:
- Use ICD-10-ZA (WHO variant), NOT US ICD-10-CM
- Use 4-digit CCSA tariff codes, NOT US CPT codes
- Suggest the most specific ICD-10 code available
- Include external cause codes (V/W/X/Y) for any injuries
- Flag if PMB/CDL conditions are present

Return JSON:
{
  "soap": {
    "subjective": "patient's complaints and history",
    "objective": "examination findings, vitals",
    "assessment": "diagnosis/differential diagnosis",
    "plan": "treatment plan, medications, follow-up"
  },
  "icd10Codes": [
    {"code": "J06.9", "description": "Acute upper respiratory infection", "isPrimary": true, "isPMB": false}
  ],
  "tariffCodes": [
    {"code": "0190", "description": "GP consultation", "amount": "R450"}
  ],
  "medications": [
    {"name": "Amoxicillin 500mg", "dosage": "TDS x 5 days", "nappiCode": "0701380"}
  ],
  "followUp": "Review in 5 days if symptoms persist",
  "redFlags": ["any clinical red flags noted"],
  "cdlConditions": ["any CDL conditions detected"]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ error: "AI service error" }, { status: 502 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) { try { parsed = JSON.parse(fenceMatch[1]); } catch { /* */ } }
      if (!parsed.soap) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start >= 0 && end > start) {
          try { parsed = JSON.parse(text.slice(start, end + 1)); } catch { /* */ }
        }
      }
    }

    return NextResponse.json({ success: true, ...parsed, provider: "gemini" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to analyze notes" }, { status: 500 });
  }
}
