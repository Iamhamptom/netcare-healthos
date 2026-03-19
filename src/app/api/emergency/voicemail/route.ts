import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";

// Handle voicemail recording from emergency line
export async function POST(request: Request) {
  const formData = await request.formData();
  const recordingUrl = formData.get("RecordingUrl") as string || "";
  const from = formData.get("From") as string || "";
  const transcription = formData.get("TranscriptionText") as string || "";

  if (isDemoMode) {
    return new Response(
      "<Response><Say voice='alice'>Your message has been recorded. Thank you.</Say></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  try {
    // Log the voicemail as a notification for practice staff
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findFirst();
    if (practice) {
      await prisma.notification.create({
        data: {
          practiceId: practice.id,
          type: "voicemail",
          recipient: from,
          patientName: "Emergency Caller",
          subject: "Emergency Voicemail",
          message: transcription || `Voicemail from ${from}. Recording: ${recordingUrl}`,
          status: "delivered",
        },
      });
    }
  } catch (err) {
    console.error("Voicemail save error:", err);
  }

  return new Response(
    "<Response><Say voice='alice'>Your message has been recorded. The practice will get back to you as soon as possible.</Say></Response>",
    { headers: { "Content-Type": "text/xml" } }
  );
}
