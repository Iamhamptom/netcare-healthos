import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";

// Handle digit press from emergency IVR
export async function POST(request: Request) {
  const formData = await request.formData();
  const digit = formData.get("Digits") as string || "0";

  if (isDemoMode) {
    return new Response(
      `<Response><Say voice="alice">Demo mode — you pressed ${digit}.</Say></Response>`,
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findFirst();
    const practiceName = practice?.name || "Netcare Health OS Practice";

    const { routeCallTwiml } = await import("@/lib/twilio");
    const twiml = routeCallTwiml(digit, practiceName);

    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch {
    return new Response(
      "<Response><Say>Error routing your call. Please try again.</Say></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
