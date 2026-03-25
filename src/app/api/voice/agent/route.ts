import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { runIntelligence, COMMAND_ASSISTANT, voiceTTS, isVoiceConfigured, getConversationalAgentUrl } from "@/lib/ai";

/**
 * POST /api/voice/agent — Voice AI Agent
 *
 * Two modes:
 * 1. Conversational widget: Returns a signed URL for ElevenLabs ConvAI (for real-time voice chat)
 * 2. Voice command: Processes text input through the intelligence engine and returns spoken audio
 *
 * Body:
 *   { mode: "widget" }  — Get signed URL for ElevenLabs ConvAI widget
 *   { mode: "command", text: "Who's waiting?", voice: "claire" }  — Process command, return audio + text
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "voice/agent", { limit: 15 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const mode = body.mode || "widget";

  // Mode 1: ConvAI widget — return signed URL
  if (mode === "widget") {
    const result = await getConversationalAgentUrl();
    if (result.error && !result.agentId) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }
    return NextResponse.json(result);
  }

  // Mode 2: Voice command — process through intelligence engine + return audio
  const text = String(body.text || "").trim();
  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const history = (body.history || []) as { role: string; content: string }[];
  const voice = body.voice as string | undefined;
  const practiceId = body.practiceId as string | undefined;
  const returnAudio = body.returnAudio !== false && isVoiceConfigured();

  try {
    // Process through the intelligence engine (full AI with RAG + tools)
    const result = await runIntelligence({
      persona: {
        ...COMMAND_ASSISTANT,
        name: "voice-agent",
        displayName: "HealthOS Voice Assistant",
        voiceStyle: "friendly",
        // Shorter responses for voice
        systemPrompt: COMMAND_ASSISTANT.systemPrompt + `\n\nIMPORTANT — VOICE MODE:
- Keep responses under 150 words — this will be spoken aloud
- Use natural speech patterns, not bullet points or markdown
- Say numbers naturally: "twelve hundred rand" not "R1,200"
- Spell out abbreviations on first use
- Be conversational and warm
- Start responses directly — no "Sure!" or "Of course!" filler`,
      },
      message: text,
      history: history.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: m.content,
      })),
      practiceId,
      maxSteps: 6,
    });

    // Generate audio if ElevenLabs is configured
    let audioBase64: string | null = null;
    if (returnAudio) {
      try {
        const audioBuffer = await voiceTTS(result.response, {
          voice,
          emotionAware: true,
          medicalPreprocess: true,
        });
        audioBase64 = Buffer.from(audioBuffer).toString("base64");
      } catch (err) {
        console.error("[voice/agent] TTS error:", err);
        // Continue without audio — text response still works
      }
    }

    return NextResponse.json({
      text: result.response,
      audio: audioBase64,
      audioFormat: audioBase64 ? "audio/mpeg" : null,
      toolsUsed: result.toolsUsed,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[voice/agent] Error:", err);
    return NextResponse.json({
      text: "I'm sorry, I had trouble processing that. Could you try again?",
      audio: null,
      toolsUsed: [],
    });
  }
}
