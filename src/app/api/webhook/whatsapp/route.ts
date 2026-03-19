import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || "";

/** GET /api/webhook/whatsapp — Verification endpoint for WhatsApp webhook */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WEBHOOK_SECRET) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/** POST /api/webhook/whatsapp — Receive WhatsApp messages and route to conversation system */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "webhook-whatsapp", { limit: 100, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await request.json();

    // WhatsApp Cloud API webhook payload structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      // Status update or other non-message event
      return NextResponse.json({ status: "ok" });
    }

    const msg = value.messages[0];
    const contact = value.contacts?.[0];

    const incomingMessage = {
      from: msg.from, // phone number
      name: contact?.profile?.name || "Unknown",
      text: msg.text?.body || "",
      type: msg.type, // text, image, audio, etc.
      timestamp: msg.timestamp,
      messageId: msg.id,
    };

    console.log("[WhatsApp Webhook]", JSON.stringify(incomingMessage));

    // Only process text messages for now
    if (msg.type !== "text" || !incomingMessage.text) {
      return NextResponse.json({ status: "received", type: msg.type });
    }

    if (isDemoMode) {
      return NextResponse.json({ status: "received_demo", message: incomingMessage });
    }

    // ─── Full Conversation Pipeline ───────────────────────
    const { prisma } = await import("@/lib/prisma");

    // 1. Find patient by phone number (normalize: strip spaces, ensure +)
    const phone = normalizePhone(incomingMessage.from);
    let patient = await prisma.patient.findFirst({
      where: { phone: { contains: phone.slice(-9) } }, // match last 9 digits
      include: { practice: true },
    });

    // 2. If no patient found, create one linked to the first practice
    let practice;
    if (!patient) {
      practice = await prisma.practice.findFirst();
      if (!practice) {
        return NextResponse.json({ status: "no_practice_configured" });
      }
      patient = await prisma.patient.create({
        data: {
          name: incomingMessage.name,
          phone,
          practiceId: practice.id,
          notes: "Auto-created from WhatsApp",
        },
        include: { practice: true },
      });
    } else {
      practice = patient.practice;
    }

    // 3. Find or create an active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        patientId: patient.id,
        practiceId: practice.id,
        status: "active",
        channel: "whatsapp",
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          patientId: patient.id,
          practiceId: practice.id,
          channel: "whatsapp",
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    // 4. Add patient message to conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "patient",
        content: incomingMessage.text,
        approved: true,
      },
    });

    // 5. Run triage agent to assess urgency
    const { triageMessage } = await import("@/lib/agents");
    const triage = await triageMessage(incomingMessage.text, patient.name).catch(() => null);

    const isEmergency = triage?.actions?.some(a => a.type === "flag_urgent");
    if (isEmergency) {
      // Log emergency notification
      await prisma.notification.create({
        data: {
          type: "whatsapp",
          recipient: phone,
          patientName: patient.name,
          message: `EMERGENCY TRIAGE: ${triage?.response || incomingMessage.text}`,
          status: "sent",
          template: "emergency",
          practiceId: practice.id,
        },
      });
    }

    // 6. Generate AI reply
    const { generateAIReply } = await import("@/lib/claude");
    const history = conversation.messages
      .filter(m => m.role !== "ai_suggestion")
      .map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "patient", content: incomingMessage.text });

    let aiReply: string;
    try {
      aiReply = await generateAIReply(
        incomingMessage.text,
        patient.name,
        practice.type,
        practice.aiPersonality,
        history,
      );
    } catch {
      aiReply = `Thank you for your message, ${patient.name}. A staff member will get back to you shortly.`;
    }

    // Save AI reply as suggestion (staff can approve before sending in dashboard)
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ai_suggestion",
        content: aiReply,
        approved: false,
      },
    });

    // 7. Auto-send reply via WhatsApp (if practice has auto-reply enabled)
    // For now, always send the AI reply — practices can disable via settings later
    try {
      const { sendWhatsApp } = await import("@/lib/twilio");
      await sendWhatsApp(phone, aiReply);

      // Mark as approved + sent
      await prisma.message.updateMany({
        where: { conversationId: conversation.id, role: "ai_suggestion", content: aiReply },
        data: { approved: true },
      });

      // Log notification
      await prisma.notification.create({
        data: {
          type: "whatsapp",
          recipient: phone,
          patientName: patient.name,
          message: aiReply,
          status: "sent",
          template: "auto_reply",
          practiceId: practice.id,
        },
      });
    } catch (err) {
      // WhatsApp send failed (no Twilio config) — reply stays as unapproved suggestion in dashboard
      console.error("[WhatsApp Auto-Reply Failed]", err);
    }

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      status: "processed",
      patientId: patient.id,
      conversationId: conversation.id,
      triageUrgency: triage?.response?.includes("EMERGENCY") ? "EMERGENCY" : "ROUTINE",
    });
  } catch (err) {
    console.error("[WhatsApp Webhook Error]", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-()]/g, "");
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}
