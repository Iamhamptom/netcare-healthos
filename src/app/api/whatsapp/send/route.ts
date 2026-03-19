import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// Send a single WhatsApp message
export async function POST(request: Request) {
  const guard = await guardRoute(request, "whatsapp/send");
  if (isErrorResponse(guard)) return guard;

  const { to, message } = await request.json();
  if (!to || !message) {
    return NextResponse.json({ error: "to and message required" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      sid: "demo-msg-" + Date.now(),
      message: `[DEMO] WhatsApp to ${to}: ${message.slice(0, 50)}...`,
    });
  }

  try {
    const { sendWhatsApp } = await import("@/lib/twilio");
    const result = await sendWhatsApp(to, message);
    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
