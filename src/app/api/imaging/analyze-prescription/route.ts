/**
 * POST /api/imaging/analyze-prescription
 *
 * Prescription Image/Text → Structured medication list + interaction check
 * Accepts: base64 image or text of prescription
 * Returns: medications, dosages, interactions, allergy warnings
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimitByIp(req, "imaging-rx", { limit: 15, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    let textContent = "";
    let patientAllergies: string[] = [];
    let currentMedications: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
      }
      textContent = (formData.get("text") as string) || "";
      try { patientAllergies = JSON.parse((formData.get("allergies") as string) || "[]"); } catch { /* */ }
      try { currentMedications = JSON.parse((formData.get("currentMeds") as string) || "[]"); } catch { /* */ }
    } else {
      const body = await req.json();
      imageBase64 = body.image || "";
      textContent = body.text || "";
      patientAllergies = body.allergies || [];
      currentMedications = body.currentMedications || [];
    }

    if (!imageBase64 && !textContent) {
      return NextResponse.json({ error: "Provide prescription image or text" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });

    const prompt = `You are a SA pharmacist. Extract all medications from this prescription, check for interactions, and flag safety concerns.

${textContent ? "PRESCRIPTION TEXT:\n" + textContent : "Analyze the attached prescription image."}

${patientAllergies.length > 0 ? "PATIENT ALLERGIES: " + patientAllergies.join(", ") : ""}
${currentMedications.length > 0 ? "CURRENT MEDICATIONS: " + currentMedications.join(", ") : ""}

SA CONTEXT:
- Use NAPPI codes (7-digit) where possible
- SA scheduling: S0 (OTC) through S8 (controlled)
- Check against SA Essential Medicines List
- Flag schedule 5+ medications that need prescriber details

Return JSON:
{
  "prescriber": {"name": "if visible", "practiceNumber": "if visible", "qualification": "if visible"},
  "medications": [
    {
      "name": "Amoxicillin",
      "strength": "500mg",
      "dosage": "1 capsule TDS",
      "duration": "5 days",
      "quantity": 15,
      "nappiCode": "0701380",
      "schedule": "S2",
      "genericAvailable": true,
      "genericAlternative": "Amoxicillin (generic) — same efficacy, lower cost"
    }
  ],
  "interactions": [
    {"drug1": "Warfarin", "drug2": "Amoxicillin", "severity": "moderate", "effect": "May increase INR", "action": "Monitor INR closely"}
  ],
  "allergyWarnings": [
    {"medication": "Amoxicillin", "allergy": "Penicillin", "severity": "severe", "action": "DO NOT DISPENSE — cross-reactivity"}
  ],
  "dosageWarnings": [
    {"medication": "Metformin", "issue": "Dose exceeds maximum (>2g/day)", "recommendation": "Verify with prescriber"}
  ],
  "schedulingNotes": "Any S5+ medications require valid prescription with prescriber details",
  "estimatedCost": {"total": "R450", "withGeneric": "R280", "savings": "R170"},
  "summary": "Brief summary of the prescription"
}`;

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 3000, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ error: "AI service error" }, { status: 502 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let jsonStr = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonStr = fenceMatch[1];
    jsonStr = jsonStr.replace(/\n/g, " ").replace(/\t/g, " ");
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, ...parsed, provider: "gemini" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to analyze prescription" }, { status: 500 });
  }
}
