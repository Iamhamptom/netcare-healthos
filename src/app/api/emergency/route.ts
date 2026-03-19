import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";

// Emergency line — Twilio voice webhook
// When a patient calls the emergency number, this generates TwiML IVR
export async function POST(request: Request) {
  if (isDemoMode) {
    return new Response(
      `<Response><Say voice="alice">This is the ${demoPractice.name} emergency line demo.</Say></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findFirst();
    const practiceName = practice?.name || "Netcare Health OS Practice";

    const { emergencyCallTwiml } = await import("@/lib/twilio");
    const twiml = emergencyCallTwiml(practiceName);

    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch {
    return new Response(
      "<Response><Say>We are experiencing technical difficulties. Please call emergency services at 10177.</Say></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}

// GET handler for Twilio webhook verification
export async function GET() {
  return new Response("<Response><Say>Netcare Health OS Emergency Line active.</Say></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}
