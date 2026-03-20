import { NextResponse } from "next/server";
import { guardRoute } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
// Direct prisma import: Voice/Twilio models are Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

/** POST /api/voice/call — Initiate an AI voice call to a patient
 *  Uses Twilio to call + ElevenLabs TTS or Twilio <Say> for the message.
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "voice/call");
  if (guard instanceof NextResponse) return guard;

  const body = await request.json();
  const { to, message, bookingId } = body;

  if (!to || !message) {
    return NextResponse.json({ error: "Missing 'to' (phone) and 'message'" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({ success: true, sid: "demo-call-sid", message: "Demo mode — no real call made" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const voiceNumber = process.env.TWILIO_VOICE_NUMBER || process.env.TWILIO_SMS_NUMBER;

  if (!accountSid || !authToken || !voiceNumber) {
    return NextResponse.json({ error: "Voice calling not configured (Twilio)" }, { status: 503 });
  }

  try {
    // Use Twilio REST API to initiate an outbound call with TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-ZA">${escapeXml(message)}</Say>
  <Pause length="1"/>
  <Say voice="alice" language="en-ZA">If you need to respond, please press 1 to confirm or 2 to reschedule.</Say>
  <Gather numDigits="1" action="${process.env.NEXT_PUBLIC_APP_URL}/api/voice/respond${bookingId ? `?bookingId=${bookingId}` : ""}" method="POST">
    <Say voice="alice" language="en-ZA">Press 1 to confirm. Press 2 to reschedule.</Say>
  </Gather>
  <Say voice="alice" language="en-ZA">Thank you. Goodbye.</Say>
</Response>`;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: voiceNumber,
        To: to,
        Twiml: twiml,
      }).toString(),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Twilio error ${res.status}`);

    // Log notification
    await prisma.notification.create({
      data: {
        type: "sms", // closest type for voice
        recipient: to,
        patientName: body.patientName || "",
        message: `Voice call: ${message.slice(0, 200)}`,
        status: "sent",
        template: "voice_call",
        practiceId: guard.practiceId,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, sid: data.sid, status: data.status });
  } catch (err) {
    console.error("Voice call error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Call failed" }, { status: 500 });
  }
}

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
