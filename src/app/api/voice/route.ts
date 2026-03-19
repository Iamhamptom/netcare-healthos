import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isElevenLabsConfigured, textToSpeech } from "@/lib/elevenlabs";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/voice — Convert text to speech via ElevenLabs */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "voice", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const text = String(body.text || "").trim();

  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Text too long (max 2000 chars)" }, { status: 400 });

  if (isDemoMode || !isElevenLabsConfigured()) {
    return NextResponse.json({
      audio: null,
      demo: true,
      message: "ElevenLabs not configured. Set ELEVENLABS_API_KEY in .env to enable voice.",
    });
  }

  try {
    const audioBuffer = await textToSpeech(text, {
      voiceId: body.voiceId,
      stability: body.stability,
      similarity: body.similarity,
    });

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** GET /api/voice — Check voice config status */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "voice");
  if (isErrorResponse(guard)) return guard;

  return NextResponse.json({
    configured: isElevenLabsConfigured(),
    defaultVoice: process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL",
  });
}
