import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
// Direct prisma import: Booking models are Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

/** POST /api/public/book — Public booking submission (no auth required) */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "public/book", { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });

  const body = await request.json();
  const { slug, service, date, time, patientName, patientPhone, patientEmail, notes, leadSource, referralId } = body;

  // Validate
  if (!slug || !service || !date || !time || !patientName || !patientPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (patientName.length > 100 || service.length > 100 || (notes && notes.length > 500)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  // Parse scheduled datetime
  const scheduledAt = new Date(`${date}T${time}:00`);
  if (isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }
  if (scheduledAt < new Date()) {
    return NextResponse.json({ error: "Cannot book in the past" }, { status: 400 });
  }

  // Demo mode
  if (isDemoMode) {
    const fakeId = "demo-" + Math.random().toString(36).slice(2, 10);
    return NextResponse.json({
      bookingId: fakeId,
      status: "pending",
      message: "Booking submitted! You'll receive a WhatsApp confirmation.",
    });
  }

  // Live — find practice
  const practice = await prisma.practice.findFirst({
    where: { subdomain: slug, bookingEnabled: true },
  });

  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  // Check for duplicate booking (same patient, same time)
  const existing = await prisma.booking.findFirst({
    where: {
      practiceId: practice.id,
      patientPhone: patientPhone,
      scheduledAt,
      status: { in: ["pending", "confirmed"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You already have a booking at this time" }, { status: 409 });
  }

  // Get deposit settings
  const depositAmount = practice.bookingDepositEnabled ? practice.bookingDepositAmount : 0;

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      patientName: patientName.trim().slice(0, 100),
      patientPhone: patientPhone.trim().slice(0, 20),
      patientEmail: (patientEmail || "").trim().slice(0, 100),
      service: service.trim().slice(0, 100),
      scheduledAt,
      status: "pending",
      source: "public",
      leadSource: (leadSource || "").trim().slice(0, 50),
      referralId: (referralId || "").trim().slice(0, 50),
      notes: (notes || "").trim().slice(0, 500),
      depositAmount,
      practiceId: practice.id,
    },
  });

  // Send pending notification to patient
  if (patientPhone) {
    try {
      const { sendWhatsApp } = await import("@/lib/twilio");
      const msg = `Hi ${patientName}! Your booking at ${practice.name} has been received.\n\n` +
        `Service: ${service}\n` +
        `Date: ${scheduledAt.toLocaleDateString("en-ZA", { weekday: "long", month: "long", day: "numeric" })}\n` +
        `Time: ${time}\n\n` +
        `Status: Pending confirmation\n` +
        `We'll WhatsApp you once it's confirmed.`;
      await sendWhatsApp(patientPhone, msg);
    } catch (err) {
      console.error("WhatsApp pending notification error:", err);
    }
  }

  // Log notification
  await prisma.notification.create({
    data: {
      type: "whatsapp",
      recipient: patientPhone,
      patientName,
      message: `Booking pending: ${service} on ${date} at ${time}`,
      status: "sent",
      template: "booking_pending",
      practiceId: practice.id,
    },
  }).catch(() => {});

  return NextResponse.json({
    bookingId: booking.id,
    status: "pending",
    message: "Booking submitted! You'll receive a WhatsApp confirmation.",
  });
}
