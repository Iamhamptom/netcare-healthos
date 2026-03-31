import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { recordHealthEvent } from "@/lib/ml/system-hooks";

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || "";

// ─── Demo Data ──────────────────────────────────────────

const DEMO_CLINICS = [
  {
    clinicId: "demo-mc-sandton",
    clinicName: "Medicross Sandton",
    address: "Sandton City, Cnr Rivonia Rd & 5th St, Sandton, 2196",
    distanceKm: 1.2,
    nextSlots: ["2026-03-21T08:30:00", "2026-03-21T09:00:00", "2026-03-21T10:30:00"],
    service: "GP Consultation",
    phone: "+27115558001",
  },
  {
    clinicId: "demo-mc-fourways",
    clinicName: "Medicross Fourways",
    address: "Fourways Crossing, William Nicol Dr, Fourways, 2191",
    distanceKm: 5.8,
    nextSlots: ["2026-03-21T09:30:00", "2026-03-21T11:00:00"],
    service: "GP Consultation",
    phone: "+27115558002",
  },
  {
    clinicId: "demo-mc-rosebank",
    clinicName: "Medicross Rosebank",
    address: "The Zone, Oxford Rd, Rosebank, 2196",
    distanceKm: 3.4,
    nextSlots: ["2026-03-21T08:00:00", "2026-03-21T14:00:00"],
    service: "GP Consultation",
    phone: "+27115558003",
  },
];

// ─── Intent Detection ───────────────────────────────────

type Intent =
  | "find_clinic"
  | "book_appointment"
  | "repeat_prescription"
  | "emergency"
  | "confirm_booking"
  | "cancel_booking"
  | "reschedule"
  | "opt_out"
  | "survey_response"
  | "general";

interface DetectedIntent {
  intent: Intent;
  service?: string;
  location?: string;
  clinicChoice?: number; // 1-based index from menu selection
  datePreference?: string;
}

function detectIntent(text: string): DetectedIntent {
  const lower = text.toLowerCase().trim();

  // Emergency keywords
  const emergencyWords = [
    "emergency", "chest pain", "can't breathe", "cannot breathe",
    "difficulty breathing", "severe bleeding", "unconscious", "heart attack",
    "stroke", "choking", "ambulance", "dying", "collapse",
  ];
  if (emergencyWords.some((w) => lower.includes(w))) {
    return { intent: "emergency" };
  }

  // Clinic finder
  const clinicPatterns = [
    /(?:find|need|looking for|nearest|closest|where is)\s+(?:a\s+)?(?:gp|doctor|clinic|medicross|dentist|physio)/i,
    /(?:gp|doctor|clinic|dentist|physio)\s+(?:near|in|around|close to)\s+(\w+)/i,
    /near\s+(\w+)/i,
  ];
  for (const pattern of clinicPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const location = match[1] || undefined;
      const service = lower.includes("dentist") ? "Dentist"
        : lower.includes("physio") ? "Physiotherapy"
        : "GP";
      return { intent: "find_clinic", service, location };
    }
  }

  // Booking — number selection from clinic menu (1, 2, 3)
  const numMatch = lower.match(/^(\d)$/);
  if (numMatch) {
    return { intent: "book_appointment", clinicChoice: parseInt(numMatch[1]) };
  }

  // Explicit booking request
  if (lower.includes("book") || lower.includes("appointment") || lower.includes("schedule")) {
    return { intent: "book_appointment" };
  }

  // Repeat prescription
  if (lower.includes("prescription") || lower.includes("refill") || lower.includes("repeat") || lower.includes("medication")) {
    return { intent: "repeat_prescription" };
  }

  // ── Engagement Reply Intents ──────────────────────────
  // Confirm booking: "yes", "confirm", "confirmed", "Y"
  if (/^(yes|y|confirm|confirmed|ja|1)$/i.test(lower)) {
    return { intent: "confirm_booking" };
  }

  // Cancel: "cancel", "no", "N"
  if (/^(cancel|no|n|cancelled|stop appointment)$/i.test(lower) || lower.includes("cancel my appointment")) {
    return { intent: "cancel_booking" };
  }

  // Reschedule
  if (lower.includes("reschedule") || lower.includes("change time") || lower.includes("different date") || lower.includes("move my appointment")) {
    return { intent: "reschedule" };
  }

  // Opt out of marketing messages
  if (/^(stop|unsubscribe|opt.?out)$/i.test(lower)) {
    return { intent: "opt_out" };
  }

  // Survey/numeric response (pain scale 1-10, satisfaction rating)
  if (/^\d{1,2}$/.test(lower) && parseInt(lower) >= 1 && parseInt(lower) <= 10) {
    return { intent: "survey_response" };
  }

  return { intent: "general" };
}

// ─── Response Generators ────────────────────────────────

function emergencyResponse(patientName: string): string {
  return `🚨 ${patientName}, this sounds like it could be an emergency.

Please call *082 911* (Netcare 911) immediately or go to your nearest emergency room.

If you are with someone who is unconscious or not breathing, call 082 911 NOW.

Do NOT wait for a WhatsApp reply in a medical emergency.`;
}

function clinicListResponse(
  clinics: { clinicName: string; address: string; distanceKm: number; nextSlots: string[] }[],
  service: string,
): string {
  let msg = `🏥 Here are the nearest ${service} clinics:\n\n`;

  clinics.forEach((c, i) => {
    const nextSlot = c.nextSlots[0]
      ? new Date(c.nextSlots[0]).toLocaleString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      : "Call for availability";
    msg += `*${i + 1}. ${c.clinicName}*\n`;
    msg += `   📍 ${c.address}\n`;
    msg += `   📏 ${c.distanceKm} km away\n`;
    msg += `   🕐 Next slot: ${nextSlot}\n\n`;
  });

  msg += `Reply with the *number* (1-${clinics.length}) to book at that clinic.`;
  return msg;
}

function bookingConfirmation(
  patientName: string,
  clinicName: string,
  address: string,
  dateTime: string,
  service: string,
): string {
  const dt = new Date(dateTime);
  const dateStr = dt.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

  return `✅ Booking confirmed, ${patientName}!

*${service}*
📍 ${clinicName}
   ${address}
📅 ${dateStr}
🕐 ${timeStr}

Please arrive 10 minutes early with your ID and medical aid card.

To cancel or reschedule, reply "cancel" or "reschedule".`;
}

function prescriptionResponse(patientName: string): string {
  return `💊 Hi ${patientName}, I can help with your repeat prescription.

Please share the following:
1. Name of the medication(s)
2. Your medical aid details (if applicable)
3. Preferred pharmacy or clinic for collection

A pharmacist will review your request and confirm availability within 2 hours during business hours (Mon-Fri 8:00-17:00).`;
}

// ─── Webhook Handlers ───────────────────────────────────

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
  const rl = await rateLimitByIp(request, "webhook-whatsapp", { limit: 100, windowMs: 60_000 });
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

    // ─── Intent Detection ───────────────────────────
    const detected = detectIntent(incomingMessage.text);

    // ─── Demo Mode ──────────────────────────────────
    if (isDemoMode) {
      return handleDemoMode(incomingMessage, detected);
    }

    // ─── Full Conversation Pipeline ─────────────────
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

    // ─── Intent-Based Routing ───────────────────────

    // ─── Learning Hook: Record WhatsApp interaction ───
    recordHealthEvent("whatsapp_router", "message_received", {
      intent: detected.intent,
      service: detected.service,
      hasPatientRecord: !!patient,
      practiceId: practice.id,
    });

    // EMERGENCY — immediate response, bypass AI
    if (detected.intent === "emergency") {
      recordHealthEvent("whatsapp_router", "emergency_detected", {
        practiceId: practice.id,
        intent: "emergency",
      });
      const reply = emergencyResponse(patient.name);
      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "emergency");
      return NextResponse.json({
        status: "processed",
        patientId: patient.id,
        conversationId: conversation.id,
        triageUrgency: "EMERGENCY",
        intent: "emergency",
      });
    }

    // FIND CLINIC — query directory and return options
    if (detected.intent === "find_clinic") {
      const clinics = await findNearbyClinics(detected.service, detected.location);
      const reply = clinicListResponse(clinics, detected.service || "GP");

      // Store clinic options in conversation metadata for follow-up selection
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "system" as string,
          content: JSON.stringify({ type: "clinic_options", clinics }),
          approved: true,
        },
      });

      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "clinic_finder");
      return NextResponse.json({
        status: "processed",
        patientId: patient.id,
        conversationId: conversation.id,
        intent: "find_clinic",
        clinicsFound: clinics.length,
      });
    }

    // BOOK APPOINTMENT — patient selected a clinic number or explicitly requested booking
    if (detected.intent === "book_appointment" && detected.clinicChoice) {
      const booking = await handleBookingFromSelection(
        prisma, conversation, patient, phone, practice, detected.clinicChoice,
      );
      return NextResponse.json({
        status: "processed",
        patientId: patient.id,
        conversationId: conversation.id,
        intent: "book_appointment",
        bookingId: booking?.id || null,
      });
    }

    // REPEAT PRESCRIPTION
    if (detected.intent === "repeat_prescription") {
      const reply = prescriptionResponse(patient.name);
      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "prescription");
      return NextResponse.json({
        status: "processed",
        patientId: patient.id,
        conversationId: conversation.id,
        intent: "repeat_prescription",
      });
    }

    // ─── Engagement Reply Handlers ──────────────────

    // CONFIRM BOOKING — patient replied "yes" / "confirm" to a reminder
    if (detected.intent === "confirm_booking") {
      const lastBooking = await prisma.booking.findFirst({
        where: { practiceId: practice.id, patientPhone: phone, status: "pending" },
        orderBy: { scheduledAt: "asc" },
      });
      if (lastBooking) {
        await prisma.booking.update({ where: { id: lastBooking.id }, data: { status: "confirmed", confirmedAt: new Date() } });
        const reply = `✅ Great ${patient.name}! Your appointment for ${lastBooking.service} has been confirmed.\n\nWe'll send you a reminder the day before. See you soon!`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "confirm_booking");
      } else {
        const reply = `Thanks ${patient.name}! I don't see a pending booking to confirm. Would you like to book a new appointment?`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "confirm_booking");
      }
      return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "confirm_booking" });
    }

    // CANCEL BOOKING
    if (detected.intent === "cancel_booking") {
      const nextBooking = await prisma.booking.findFirst({
        where: { practiceId: practice.id, patientPhone: phone, status: { in: ["pending", "confirmed"] }, scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
      });
      if (nextBooking) {
        await prisma.booking.update({ where: { id: nextBooking.id }, data: { status: "cancelled" } });
        const reply = `Your appointment for ${nextBooking.service} has been cancelled.\n\nWould you like to reschedule? Just say "reschedule" and I'll help you find a new time.`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "cancel_booking");
      } else {
        const reply = `I don't see any upcoming appointments to cancel. Is there anything else I can help with?`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "cancel_booking");
      }
      return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "cancel_booking" });
    }

    // RESCHEDULE
    if (detected.intent === "reschedule") {
      const reply = `Sure ${patient.name}, I can help you reschedule.\n\nPlease let me know:\n1. Which day works for you?\n2. Morning or afternoon?\n\nOr call us at ${practice.phone} and we'll sort it out.`;
      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "reschedule");
      return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "reschedule" });
    }

    // OPT OUT — revoke marketing consent (POPIA)
    if (detected.intent === "opt_out") {
      await prisma.consentRecord.updateMany({
        where: { patientId: patient.id, consentType: "marketing", granted: true, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      // Cancel active campaign enrollments
      await prisma.campaignRecipient.updateMany({
        where: { patientId: patient.id, status: { in: ["pending", "sent"] } },
        data: { status: "opted_out" },
      });
      const reply = `You've been unsubscribed from marketing messages. You'll still receive appointment reminders and important health notifications.\n\nIf you'd like to re-subscribe, just let us know.`;
      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "opt_out");
      return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "opt_out" });
    }

    // SURVEY RESPONSE — feed into active engagement sequence
    if (detected.intent === "survey_response") {
      const { handlePatientResponse } = await import("@/lib/engagement/sequence-engine");
      const seqResult = await handlePatientResponse(patient.id, practice.id, incomingMessage.text);
      if (seqResult.handled) {
        const reply = `Thank you for your response, ${patient.name}. We've recorded it and your care team will follow up if needed.`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "survey_response");
        return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "survey_response", enrollmentId: seqResult.enrollmentId });
      }
      // If no active sequence, fall through to general handler
    }

    // Check if patient has an active engagement sequence (for any text reply)
    {
      const { handlePatientResponse } = await import("@/lib/engagement/sequence-engine");
      const seqResult = await handlePatientResponse(patient.id, practice.id, incomingMessage.text);
      if (seqResult.handled) {
        // Sequence captured the response — don't send to AI triage
        const reply = `Thanks ${patient.name}, we've received your response. Our team will be in touch.`;
        await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "sequence_response");
        return NextResponse.json({ status: "processed", patientId: patient.id, conversationId: conversation.id, intent: "sequence_response" });
      }
    }

    // ─── General / AI Triage ────────────────────────

    // 5. Run triage agent to assess urgency
    const { triageMessage } = await import("@/lib/agents");
    const triage = await triageMessage(incomingMessage.text, patient.name).catch(() => null);

    // ─── Learning Hook: Record triage outcome ───
    recordHealthEvent("whatsapp_router", "triage_completed", {
      intent: detected.intent,
      triageUrgency: triage?.response?.includes("EMERGENCY") ? "EMERGENCY" : "ROUTINE",
      practiceId: practice.id,
    });

    const isEmergency = triage?.actions?.some((a) => a.type === "flag_urgent");
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

      // Send emergency response immediately
      const reply = emergencyResponse(patient.name);
      await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "emergency");
      return NextResponse.json({
        status: "processed",
        patientId: patient.id,
        conversationId: conversation.id,
        triageUrgency: "EMERGENCY",
      });
    }

    // 6. Generate AI reply with enhanced prompt
    const { generateAIReply } = await import("@/lib/claude");
    const history = conversation.messages
      .filter((m) => m.role !== "ai_suggestion" && m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));
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

    await sendAndLog(prisma, conversation.id, phone, patient.name, aiReply, practice.id, "auto_reply");

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

// ─── Helper Functions ───────────────────────────────────

function normalizePhone(phone: string): string {
  let p = phone.replace(/[\s\-()]/g, "");
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

/** Find nearby clinics via the WhatsApp data source or demo data */
async function findNearbyClinics(service?: string, location?: string) {
  // Map known locations to approximate coordinates (Gauteng focus)
  const locationCoords: Record<string, { lat: number; lng: number }> = {
    sandton: { lat: -26.1076, lng: 28.0567 },
    fourways: { lat: -26.0167, lng: 28.0117 },
    rosebank: { lat: -26.1461, lng: 28.0436 },
    midrand: { lat: -25.9899, lng: 28.1271 },
    pretoria: { lat: -25.7479, lng: 28.2293 },
    centurion: { lat: -25.8603, lng: 28.1894 },
    johannesburg: { lat: -26.2041, lng: 28.0473 },
    randburg: { lat: -26.0936, lng: 28.0011 },
    bryanston: { lat: -26.0583, lng: 28.0233 },
    bedfordview: { lat: -26.1825, lng: 28.1303 },
  };

  const coords = location
    ? locationCoords[location.toLowerCase()] || { lat: -26.1076, lng: 28.0567 }
    : { lat: -26.1076, lng: 28.0567 }; // Default: Sandton

  try {
    const { getWhatsAppSource } = await import("@/lib/data-sources");
    const source = getWhatsAppSource();
    const clinics = await source.findNearestClinic(coords.lat, coords.lng, service);
    return clinics.map((c) => ({
      ...c,
      nextSlots: c.nextSlots.length > 0 ? c.nextSlots : generateDemoSlots(),
    }));
  } catch {
    // Fallback to demo clinics
    return DEMO_CLINICS.filter(
      (c) => !service || c.service.toLowerCase().includes(service.toLowerCase()),
    );
  }
}

/** Generate demo appointment slots for the next 3 business days */
function generateDemoSlots(): string[] {
  const slots: string[] = [];
  const now = new Date();
  for (let d = 1; d <= 3; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    // Skip weekends
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);
    // Morning and afternoon slots
    date.setHours(8, 30, 0, 0);
    slots.push(date.toISOString());
    date.setHours(10, 0, 0, 0);
    slots.push(date.toISOString());
    date.setHours(14, 0, 0, 0);
    slots.push(date.toISOString());
  }
  return slots.slice(0, 5);
}

/** Handle booking when patient selects a clinic number from the list */
async function handleBookingFromSelection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  conversation: { id: string; messages: { role: string; content: string }[] },
  patient: { id: string; name: string },
  phone: string,
  practice: { id: string },
  choice: number,
) {
  // Find the most recent clinic_options message in this conversation
  const optionsMsg = [...conversation.messages]
    .reverse()
    .find((m) => {
      if (m.role !== "system") return false;
      try {
        const data = JSON.parse(m.content);
        return data.type === "clinic_options";
      } catch {
        return false;
      }
    });

  if (!optionsMsg) {
    const reply = `Sorry ${patient.name}, I don't have a clinic list for you yet. Try saying "I need a GP near Sandton" first.`;
    await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "booking_error");
    return null;
  }

  const { clinics } = JSON.parse(optionsMsg.content);
  const selectedClinic = clinics[choice - 1];

  if (!selectedClinic) {
    const reply = `Please reply with a number between 1 and ${clinics.length}.`;
    await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "booking_error");
    return null;
  }

  // Pick the first available slot
  const slot = selectedClinic.nextSlots?.[0] || new Date(Date.now() + 86400000).toISOString();
  const service = selectedClinic.service || "GP Consultation";

  // Create booking in database
  try {
    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const { data: booking } = await supabaseAdmin
      .from(tables.bookings)
      .insert({
        patient_id: patient.id,
        practice_id: practice.id,
        clinic_id: selectedClinic.clinicId,
        service,
        date: slot.split("T")[0],
        time: new Date(slot).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
        status: "confirmed",
        channel: "whatsapp",
        notes: `Booked via WhatsApp. Clinic: ${selectedClinic.clinicName}`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Send confirmation
    const reply = bookingConfirmation(
      patient.name,
      selectedClinic.clinicName,
      selectedClinic.address,
      slot,
      service,
    );
    await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "booking_confirmation");

    // Log audit entry
    await supabaseAdmin.from(tables.auditLogs).insert({
      action: "booking_created",
      entity_type: "booking",
      entity_id: booking?.id || "unknown",
      details: JSON.stringify({
        patient_id: patient.id,
        clinic: selectedClinic.clinicName,
        service,
        date: slot,
        channel: "whatsapp",
      }),
      created_at: new Date().toISOString(),
    });

    return booking;
  } catch (err) {
    console.error("[WhatsApp Booking Error]", err);
    const reply = `Sorry ${patient.name}, there was an issue creating your booking. Please try again or call ${selectedClinic.phone || "the clinic"} directly.`;
    await sendAndLog(prisma, conversation.id, phone, patient.name, reply, practice.id, "booking_error");
    return null;
  }
}

/** Send WhatsApp message, save to conversation, and log notification */
async function sendAndLog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any,
  conversationId: string,
  phone: string,
  patientName: string,
  reply: string,
  practiceId: string,
  template: string,
) {
  // Save AI reply as suggestion
  await prisma.message.create({
    data: {
      conversationId,
      role: "ai_suggestion",
      content: reply,
      approved: false,
    },
  });

  // Send via WhatsApp
  try {
    const { sendWhatsApp } = await import("@/lib/twilio");
    await sendWhatsApp(phone, reply);

    // Mark as approved + sent
    await prisma.message.updateMany({
      where: { conversationId, role: "ai_suggestion", content: reply },
      data: { approved: true },
    });

    // Log notification
    await prisma.notification.create({
      data: {
        type: "whatsapp",
        recipient: phone,
        patientName,
        message: reply,
        status: "sent",
        template,
        practiceId,
      },
    });
  } catch (err) {
    // WhatsApp send failed (no Twilio config) — reply stays as unapproved suggestion in dashboard
    console.error("[WhatsApp Send Failed]", err);
  }

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

/** Handle incoming messages in demo mode — no DB, no Twilio, just return structured response */
function handleDemoMode(
  incomingMessage: { from: string; name: string; text: string },
  detected: DetectedIntent,
) {
  switch (detected.intent) {
    case "emergency":
      return NextResponse.json({
        status: "demo",
        intent: "emergency",
        message: incomingMessage,
        reply: emergencyResponse(incomingMessage.name),
      });

    case "find_clinic":
      return NextResponse.json({
        status: "demo",
        intent: "find_clinic",
        message: incomingMessage,
        clinics: DEMO_CLINICS,
        reply: clinicListResponse(DEMO_CLINICS, detected.service || "GP"),
      });

    case "book_appointment":
      if (detected.clinicChoice && detected.clinicChoice <= DEMO_CLINICS.length) {
        const clinic = DEMO_CLINICS[detected.clinicChoice - 1];
        return NextResponse.json({
          status: "demo",
          intent: "book_appointment",
          message: incomingMessage,
          booking: {
            clinicName: clinic.clinicName,
            address: clinic.address,
            dateTime: clinic.nextSlots[0],
            service: clinic.service,
          },
          reply: bookingConfirmation(
            incomingMessage.name,
            clinic.clinicName,
            clinic.address,
            clinic.nextSlots[0],
            clinic.service,
          ),
        });
      }
      return NextResponse.json({
        status: "demo",
        intent: "book_appointment",
        message: incomingMessage,
        reply: `Hi ${incomingMessage.name}, to book an appointment, first tell me what you need. Try: "I need a GP near Sandton"`,
      });

    case "repeat_prescription":
      return NextResponse.json({
        status: "demo",
        intent: "repeat_prescription",
        message: incomingMessage,
        reply: prescriptionResponse(incomingMessage.name),
      });

    default:
      return NextResponse.json({
        status: "demo",
        intent: "general",
        message: incomingMessage,
        reply: `Hi ${incomingMessage.name}! I'm your Netcare Health assistant. I can help you with:\n\n1. 🏥 Find a clinic — "I need a GP near Sandton"\n2. 📅 Book an appointment\n3. 💊 Repeat prescription\n4. 🚨 Emergency — call 082 911\n\nHow can I help you today?`,
      });
  }
}
