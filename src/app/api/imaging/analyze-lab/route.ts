/**
 * POST /api/imaging/analyze-lab
 *
 * Lab Report Image/PDF → Structured lab results with abnormals flagged
 * Accepts: base64 image or text extraction of lab report
 * Returns: structured results, abnormal flags, clinical significance
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimitByIp(req, "imaging-lab", { limit: 15, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    let textContent = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
      }
      textContent = (formData.get("text") as string) || "";
    } else {
      const body = await req.json();
      imageBase64 = body.image || "";
      textContent = body.text || "";
    }

    if (!imageBase64 && !textContent) {
      return NextResponse.json({ error: "Provide either an image (base64) or text content of the lab report" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });

    const prompt = `You are a SA clinical pathology expert. Extract ALL results from this lab report into structured data. Flag any abnormal values.

${textContent ? `LAB REPORT TEXT:\n${textContent}` : "Analyze the attached lab report image."}

Return JSON:
{
  "patient": {"name": "if visible", "idNumber": "if visible", "age": null, "gender": null},
  "laboratory": "lab name if visible",
  "reportDate": "YYYY-MM-DD",
  "orderingDoctor": "if visible",
  "results": [
    {
      "test": "Full Blood Count",
      "component": "Haemoglobin",
      "value": "12.5",
      "unit": "g/dL",
      "referenceRange": "12.0-17.5",
      "status": "normal" or "low" or "high" or "critical",
      "loincCode": "718-7"
    }
  ],
  "abnormals": [
    {"test": "Haemoglobin", "value": "8.2 g/dL", "significance": "Moderate anaemia — investigate cause", "urgency": "routine" or "urgent" or "critical"}
  ],
  "suggestedICD10": [
    {"code": "D64.9", "description": "Anaemia, unspecified", "basedOn": "Low haemoglobin"}
  ],
  "summary": "Brief clinical summary of findings",
  "followUp": "Recommended follow-up actions"
}`;

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      });
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
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to analyze lab report" }, { status: 500 });
  }
}
