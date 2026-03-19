import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// Broadcast WhatsApp message to multiple patients
export async function POST(request: Request) {
  const guard = await guardRoute(request, "whatsapp/broadcast", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  const { message, filter } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  if (isDemoMode) {
    const patients = demoStore.getPatients() as Array<Record<string, unknown>>;
    const recipients = patients.filter(p => p.phone).map(p => ({ name: String(p.name), phone: String(p.phone) }));
    return NextResponse.json({
      success: true,
      sent: recipients.length,
      results: recipients.map(r => ({ to: r.phone, name: r.name, sid: "demo-" + Date.now(), status: "sent" })),
      message: `[DEMO] Would broadcast to ${recipients.length} patients`,
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // Get patients with phone numbers for this practice
    const where: Record<string, unknown> = { practiceId: guard.practiceId, phone: { not: "" } };

    // Apply filters
    if (filter === "upcoming_bookings") {
      // Get patients with phone numbers, then check which have upcoming bookings
      const patients = await prisma.patient.findMany({ where });
      const upcomingBookings = await prisma.booking.findMany({
        where: { practiceId: guard.practiceId, scheduledAt: { gte: new Date() }, status: "confirmed" },
        select: { patientName: true },
      });
      const bookedNames = new Set(upcomingBookings.map(b => b.patientName));
      const withBookings = patients.filter(p => bookedNames.has(p.name));
      const phones = withBookings.map(p => p.phone).filter(Boolean);

      const { broadcastWhatsApp } = await import("@/lib/twilio");
      const results = await broadcastWhatsApp(phones, message);
      return NextResponse.json({ success: true, sent: results.length, results });
    }

    // Default: all patients with phone numbers
    const patients = await prisma.patient.findMany({ where });
    const phones = patients.map(p => p.phone).filter(Boolean);

    const { broadcastWhatsApp } = await import("@/lib/twilio");
    const results = await broadcastWhatsApp(phones, message);
    return NextResponse.json({ success: true, sent: results.length, results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Broadcast failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
