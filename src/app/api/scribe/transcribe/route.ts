export const maxDuration = 60;
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimitByIp } from "@/lib/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TRANSCRIBE_PROMPT = `You are a medical transcription specialist. Transcribe this short audio clip from a healthcare consultation accurately.

Rules:
- Transcribe EXACTLY what is said, word for word
- Use proper medical terminology where spoken
- Mark speaker changes: "Doctor:" and "Patient:" when detectable
- If audio is unclear, mark with [inaudible]
- Do NOT add commentary or analysis - ONLY the transcription
- This may be a short clip (5-10 seconds) so transcribe whatever is present
- If no speech is detected, return "[silence]"

Return ONLY the transcription text.`;

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "scribe-transcribe", { limit: 120 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Transcription not configured" }, { status: 503 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let audioBase64: string;
    let mimeType: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile) {
        return NextResponse.json({ error: "No audio file" }, { status: 400 });
      }
      const buffer = await audioFile.arrayBuffer();
      audioBase64 = Buffer.from(buffer).toString("base64");
      mimeType = audioFile.type || "audio/webm";
    } else {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength === 0) {
        return NextResponse.json({ error: "Empty audio" }, { status: 400 });
      }
      audioBase64 = Buffer.from(buffer).toString("base64");
      mimeType = contentType.includes("audio") ? contentType : "audio/webm";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent([
      { inlineData: { mimeType, data: audioBase64 } },
      { text: TRANSCRIBE_PROMPT },
    ]);

    const transcript = result.response.text().trim();

    return NextResponse.json({
      transcript,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[scribe/transcribe] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
