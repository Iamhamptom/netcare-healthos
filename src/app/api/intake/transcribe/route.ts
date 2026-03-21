/**
 * POST /api/intake/transcribe
 * Receives audio blob, returns transcription via Gemini 2.0 Flash multimodal.
 * Supports both full-file and chunked streaming transcription.
 */

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`intake-transcribe:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Transcription service not configured" }, { status: 503 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let audioBase64: string;
    let mimeType: string;

    if (contentType.includes("multipart/form-data")) {
      // FormData with audio file
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile) {
        return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
      }
      const buffer = await audioFile.arrayBuffer();
      audioBase64 = Buffer.from(buffer).toString("base64");
      mimeType = audioFile.type || "audio/webm";
    } else {
      // Raw binary audio
      const buffer = await req.arrayBuffer();
      if (buffer.byteLength === 0) {
        return NextResponse.json({ error: "Empty audio" }, { status: 400 });
      }
      audioBase64 = Buffer.from(buffer).toString("base64");
      mimeType = contentType.includes("audio") ? contentType : "audio/webm";
    }

    // Use Gemini 2.0 Flash multimodal for transcription
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
      {
        text: `You are a medical transcription specialist. Transcribe this audio recording of a healthcare consultation accurately.

Rules:
- Transcribe EXACTLY what is said, word for word
- Use proper medical terminology where spoken
- Preserve the natural flow of conversation
- Mark speaker changes if multiple speakers are detected: "Doctor:" and "Patient:"
- If audio is unclear, mark with [inaudible]
- Include filler words only if they affect meaning
- Use proper punctuation and paragraph breaks for readability
- Do NOT add any commentary, summary, or analysis — ONLY the transcription

Return ONLY the transcription text, nothing else.`,
      },
    ]);

    const transcript = result.response.text().trim();

    return NextResponse.json({
      transcript,
      duration: null, // Gemini doesn't return duration metadata
      model: "gemini-2.0-flash",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[intake/transcribe] Error:", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
