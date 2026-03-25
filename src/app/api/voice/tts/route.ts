import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { voiceTTS, voiceTTSStream, isVoiceConfigured, preprocessForTTS } from "@/lib/ai";

/**
 * POST /api/voice/tts — Text-to-Speech
 *
 * Production-grade TTS with:
 * - Medical term pronunciation dictionary (ICD-10, NAPPI, SA healthcare terms)
 * - Emotion-aware voice (adapts tone to urgent/empathetic/professional content)
 * - Streaming audio delivery (chunked response)
 * - Multi-voice support (Claire SA female default, Dr. Nkosi male)
 * - Markdown stripping for clean speech
 *
 * Query params:
 *   ?stream=true   — Return streaming audio (chunked transfer)
 *   ?voice=claire   — Select voice profile (claire, dr_nkosi)
 *   ?speed=0.92    — Override speech speed (0.5-2.0)
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "voice/tts", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  if (!isVoiceConfigured()) {
    return NextResponse.json({ error: "TTS not configured — set ELEVENLABS_API_KEY" }, { status: 503 });
  }

  const body = await request.json();
  const text = String(body.text || "").trim();
  const voice = body.voice as string | undefined;
  const speed = body.speed as number | undefined;
  const stream = body.stream === true;
  const emotionAware = body.emotionAware !== false;
  const medicalPreprocess = body.medicalPreprocess !== false;

  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
  if (text.length > 5000) return NextResponse.json({ error: "Text too long (max 5000 chars)" }, { status: 400 });

  try {
    const options = { voice, speed, emotionAware, medicalPreprocess };

    if (stream) {
      // Streaming audio — chunked transfer for faster first-byte
      const audioStream = await voiceTTSStream(text, options);
      return new NextResponse(audioStream, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Standard: full audio buffer
    const audioBuffer = await voiceTTS(text, options);
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Preprocessed": medicalPreprocess ? "true" : "false",
        "X-TTS-Voice": voice || "claire",
      },
    });
  } catch (err) {
    console.error("[voice/tts] Error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
  }
}

/**
 * GET /api/voice/tts?text=...&voice=claire
 * Quick TTS for short phrases (e.g., button clicks, notifications)
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "voice/tts-get", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  if (!isVoiceConfigured()) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const text = url.searchParams.get("text")?.trim();
  const voice = url.searchParams.get("voice") || undefined;

  if (!text) return NextResponse.json({ error: "Missing ?text= parameter" }, { status: 400 });
  if (text.length > 500) return NextResponse.json({ error: "Text too long for GET (max 500 chars)" }, { status: 400 });

  try {
    const audioBuffer = await voiceTTS(text, { voice, medicalPreprocess: true, emotionAware: true });
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[voice/tts-get] Error:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}
