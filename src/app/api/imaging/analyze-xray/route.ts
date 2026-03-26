/**
 * POST /api/imaging/analyze-xray
 *
 * X-ray Image → AI analysis with findings, ICD-10 suggestions
 * Accepts: base64 image of X-ray
 * Returns: findings, abnormalities, suggested ICD-10 codes, urgency
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await rateLimitByIp(req, "imaging-xray", { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    let bodyRegion = "";
    let clinicalHistory = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const buffer = await file.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
      }
      bodyRegion = (formData.get("bodyRegion") as string) || "";
      clinicalHistory = (formData.get("clinicalHistory") as string) || "";
    } else {
      const body = await req.json();
      imageBase64 = body.image || "";
      bodyRegion = body.bodyRegion || "";
      clinicalHistory = body.clinicalHistory || "";
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "X-ray image required (base64)" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });

    const prompt = `You are a SA radiologist providing an AI-assisted preliminary reading. This is NOT a final diagnosis — it assists the clinician.

${bodyRegion ? "BODY REGION: " + bodyRegion : ""}
${clinicalHistory ? "CLINICAL HISTORY: " + clinicalHistory : ""}

Analyze this X-ray image and provide structured findings.

DISCLAIMER: This is an AI-assisted preliminary analysis tool. It does NOT replace radiologist reporting. All findings must be confirmed by a qualified radiologist per HPCSA guidelines.

Return JSON:
{
  "disclaimer": "AI-assisted preliminary analysis. Not a diagnostic report. Must be confirmed by qualified radiologist.",
  "bodyRegion": "Chest PA" or "Left hand AP" etc,
  "technicalQuality": "adequate" or "suboptimal" with reason,
  "findings": [
    {
      "structure": "Lungs",
      "finding": "Clear lung fields bilaterally",
      "significance": "normal",
      "confidence": "high"
    },
    {
      "structure": "Heart",
      "finding": "Cardiothoracic ratio within normal limits",
      "significance": "normal",
      "confidence": "high"
    }
  ],
  "abnormalities": [
    {
      "finding": "Right lower lobe consolidation",
      "significance": "Suggestive of pneumonia",
      "urgency": "routine" or "urgent" or "emergency",
      "confidence": "medium",
      "differentials": ["Community-acquired pneumonia", "Atelectasis"]
    }
  ],
  "suggestedICD10": [
    {"code": "J18.1", "description": "Lobar pneumonia", "confidence": "medium"}
  ],
  "suggestedTariff": "5101",
  "impression": "Brief radiological impression",
  "recommendation": "Clinical correlation recommended. Consider CT if symptoms persist."
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          ] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 3000, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) return NextResponse.json({ error: "AI service error" }, { status: 502 });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    return NextResponse.json({ success: true, ...parsed, provider: "gemini" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to analyze X-ray" }, { status: 500 });
  }
}
