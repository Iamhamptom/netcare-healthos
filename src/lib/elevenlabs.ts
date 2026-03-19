// ElevenLabs integration for patient voice assistant

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Default: Sarah (warm, professional)
const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";

export interface VoiceConfig {
  voiceId?: string;
  stability?: number; // 0-1, higher = more consistent
  similarity?: number; // 0-1, higher = closer to original voice
  style?: number; // 0-1, higher = more expressive
}

/** Convert text to speech using ElevenLabs */
export async function textToSpeech(
  text: string,
  config?: VoiceConfig
): Promise<ArrayBuffer> {
  const voiceId = config?.voiceId || VOICE_ID;

  const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: config?.stability ?? 0.6,
        similarity_boost: config?.similarity ?? 0.8,
        style: config?.style ?? 0.3,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error: ${res.status} — ${err}`);
  }

  return res.arrayBuffer();
}

/** Stream text-to-speech (for real-time responses) */
export async function textToSpeechStream(
  text: string,
  config?: VoiceConfig
): Promise<ReadableStream<Uint8Array>> {
  const voiceId = config?.voiceId || VOICE_ID;

  const res = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}/stream`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: config?.stability ?? 0.6,
        similarity_boost: config?.similarity ?? 0.8,
        style: config?.style ?? 0.3,
      },
      output_format: "mp3_44100_128",
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`ElevenLabs stream error: ${res.status}`);
  }

  return res.body;
}

/** Get available voices */
export async function getVoices() {
  const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  });
  if (!res.ok) throw new Error("Failed to fetch voices");
  return res.json();
}

/** Check if ElevenLabs is configured */
export function isElevenLabsConfigured(): boolean {
  return ELEVENLABS_API_KEY.length > 0 && ELEVENLABS_API_KEY !== "your-elevenlabs-api-key-here";
}
