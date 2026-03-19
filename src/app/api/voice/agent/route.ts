import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "";

/**
 * POST /api/voice/agent
 * Returns a signed URL (or agent ID) for the ElevenLabs Conversational AI widget.
 * The signed URL approach keeps the agent ID server-side for security.
 */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "voice/agent", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  if (!ELEVENLABS_AGENT_ID) {
    return NextResponse.json({ error: "Voice agent not configured yet. Coming soon!" }, { status: 503 });
  }

  // If we have an API key, generate a signed URL (recommended for production)
  if (ELEVENLABS_API_KEY) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: { "xi-api-key": ELEVENLABS_API_KEY },
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("ElevenLabs signed URL error:", res.status, errText);
        // Fall back to agent ID if signed URL fails
        return NextResponse.json({ agentId: ELEVENLABS_AGENT_ID });
      }

      const data = await res.json();
      return NextResponse.json({ signedUrl: data.signed_url });
    } catch (err) {
      console.error("ElevenLabs signed URL fetch failed:", err);
      // Fall back to agent ID
      return NextResponse.json({ agentId: ELEVENLABS_AGENT_ID });
    }
  }

  // No API key — expose agent ID directly (less secure but works for demos)
  return NextResponse.json({ agentId: ELEVENLABS_AGENT_ID });
}
