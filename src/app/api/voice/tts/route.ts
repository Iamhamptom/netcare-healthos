import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "gsm4lUH9bnZ3pjR1Pw7w"; // Claire — South African female

/**
 * POST /api/voice/tts
 * Converts text to speech using ElevenLabs TTS API.
 * Returns audio/mpeg stream. No mic needed — just plays in browser.
 *
 * Voice: Claire — South African female, warm and informative
 * - Stability (0.40) = expressive but clear SA diction
 * - High similarity boost (0.85) = stays true to Claire's natural SA tone
 * - Style exaggeration (0.40) = warmth, care, and excitement come through naturally
 * - Speed (0.92) = softer, deliberate, commercial-quality delivery
 */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "voice/tts", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const { text } = await request.json();
  if (!text || typeof text !== "string" || text.length > 3000) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.40,
          similarity_boost: 0.85,
          style: 0.40,
          use_speaker_boost: true,
          speed: 0.92,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs TTS error:", res.status, errText);
      return NextResponse.json({ error: "TTS failed" }, { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("TTS fetch failed:", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }
}
