import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore, demoPractice } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "assistant", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const { messages } = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  // Get practice context
  let practiceName = demoPractice.name;
  let practiceType = demoPractice.type;
  let userName = "User";
  let userRole = "admin";

  if (isDemoMode) {
    userName = "Dr. Sarah Mitchell";
    userRole = "admin";
  } else {
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: guard.user.id },
        include: { practice: true },
      });
      if (user?.practice) {
        practiceName = user.practice.name;
        practiceType = user.practice.type;
      }
      userName = user?.name || "User";
      userRole = user?.role || "admin";
    } catch { /* use defaults */ }
  }

  try {
    const { runAssistant, buildAssistantSystemPrompt } = await import("@/lib/command-assistant");

    const systemPrompt = buildAssistantSystemPrompt(practiceName, practiceType, userName, userRole);

    const result = await runAssistant(
      messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      systemPrompt,
      async (toolName, input) => {
        // Tool executor — connects to real data or demo store
        if (isDemoMode) return executeDemoTool(toolName, input);
        return executeLiveTool(toolName, input, guard.practiceId);
      }
    );

    return NextResponse.json({ reply: result.reply, toolsUsed: result.toolsUsed });
  } catch (err) {
    console.error("Assistant error:", err);
    return NextResponse.json({
      reply: "Sorry, I hit an error. Please try again or rephrase your request.",
      toolsUsed: [],
    });
  }
}

// Demo mode tool executor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function executeDemoTool(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "search_patients": {
      const query = (input.query as string || "").toLowerCase();
      const patients = demoStore.getPatients() as Array<Record<string, unknown>>;
      const filtered = patients.filter(p =>
        String(p.name || "").toLowerCase().includes(query) || String(p.phone || "").includes(query) || String(p.email || "").toLowerCase().includes(query)
      );
      return JSON.stringify(filtered.map(p => ({ id: p.id, name: p.name, phone: p.phone, email: p.email })));
    }
    case "get_patient": {
      const patient = demoStore.getPatient(input.patientId as string) as Record<string, unknown> | null;
      if (!patient) return JSON.stringify({ error: "Not found" });
      return JSON.stringify({ name: patient.name, phone: patient.phone, email: patient.email, allergies: patient.allergies, medications: patient.medications });
    }
    case "create_booking": {
      const booking = demoStore.addBooking({
        patientName: input.patientName as string,
        service: input.service as string,
        scheduledAt: `${input.date}T${input.time}:00`,
        notes: (input.notes as string) || "",
      });
      return JSON.stringify({ success: true, id: booking.id, status: "pending" });
    }
    case "get_todays_schedule": {
      const bookings = demoStore.getBookings() as Array<Record<string, unknown>>;
      return JSON.stringify({ bookings: bookings.slice(0, 10).map(b => ({ id: b.id, patient: b.patientName, service: b.service, time: b.scheduledAt, status: b.status })) });
    }
    case "get_analytics": {
      const analytics = demoStore.getAnalytics();
      return JSON.stringify({ patients: analytics.patients.total, bookings: analytics.bookings.total, revenue: analytics.billing.totalRevenue });
    }
    case "get_checkin_queue": {
      const checkIns = demoStore.getCheckIns();
      return JSON.stringify(checkIns.map(c => ({ patient: c.patientName, status: c.status, arrivedAt: c.arrivedAt })));
    }
    case "get_daily_tasks": {
      const tasks = demoStore.getDailyTasks();
      return JSON.stringify(tasks.map(t => ({ title: t.title, done: t.done, category: t.category })));
    }
    case "send_whatsapp":
      return JSON.stringify({ success: true, message: `[DEMO] WhatsApp sent to ${input.to}` });
    case "send_email":
      return JSON.stringify({ success: true, message: `[DEMO] Email sent to ${input.to}` });
    case "create_invoice":
      return JSON.stringify({ success: true, id: "inv-demo-" + Date.now() });
    case "get_outstanding_invoices": {
      const invoices = demoStore.getInvoices().filter(i => i.status !== "paid");
      return JSON.stringify(invoices.map(i => ({ id: i.id, patient: i.patientName, total: i.total, status: i.status })));
    }
    case "add_patient": {
      const patient = demoStore.addPatient({
        name: input.name as string,
        email: (input.email as string) || "",
        phone: (input.phone as string) || "",
        dateOfBirth: (input.dateOfBirth as string) || "",
        medicalAid: (input.medicalAid as string) || "",
        medicalAidNumber: (input.medicalAidNumber as string) || "",
      });
      return JSON.stringify({ success: true, id: patient.id, name: patient.name });
    }
    case "sync_google_reviews":
      return JSON.stringify({ success: true, synced: 3, message: "[DEMO] Would sync 3 Google reviews" });
    case "get_google_reviews":
      return JSON.stringify({ rating: 4.7, totalRatings: 89, reviews: [
        { authorName: "Thabo M.", rating: 5, text: "Best dentist in Sandton!" },
        { authorName: "Naledi K.", rating: 5, text: "Very professional service." },
        { authorName: "James W.", rating: 4, text: "Great service, limited parking." },
      ]});
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

// Live mode tool executor
async function executeLiveTool(name: string, input: Record<string, unknown>, practiceId: string): Promise<string> {
  const { prisma } = await import("@/lib/prisma");

  switch (name) {
    case "search_patients": {
      const query = input.query as string;
      const patients = await prisma.patient.findMany({
        where: {
          practiceId,
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { email: { contains: query } },
          ],
        },
        take: 10,
      });
      return JSON.stringify(patients.map(p => ({ id: p.id, name: p.name, phone: p.phone, email: p.email })));
    }
    case "get_patient": {
      const patient = await prisma.patient.findUnique({
        where: { id: input.patientId as string },
        include: { allergies: true, medications: true, vitals: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (!patient) return JSON.stringify({ error: "Not found" });
      return JSON.stringify(patient);
    }
    case "create_booking": {
      const booking = await prisma.booking.create({
        data: {
          practiceId,
          patientName: input.patientName as string,
          service: input.service as string,
          scheduledAt: new Date(`${input.date}T${input.time}:00`),
          notes: (input.notes as string) || "",
          status: "pending",
        },
      });
      return JSON.stringify({ success: true, id: booking.id, status: "pending" });
    }
    case "get_todays_schedule": {
      const date = (input.date as string) || new Date().toISOString().split("T")[0];
      const bookings = await prisma.booking.findMany({
        where: {
          practiceId,
          scheduledAt: { gte: new Date(`${date}T00:00:00`), lt: new Date(`${date}T23:59:59`) },
        },
        orderBy: { scheduledAt: "asc" },
      });
      return JSON.stringify(bookings.map(b => ({ id: b.id, patient: b.patientName, service: b.service, time: b.scheduledAt, status: b.status })));
    }
    case "get_analytics": {
      const [patientCount, bookingCount] = await Promise.all([
        prisma.patient.count({ where: { practiceId } }),
        prisma.booking.count({ where: { practiceId } }),
      ]);
      return JSON.stringify({ patients: patientCount, bookings: bookingCount });
    }
    case "get_checkin_queue": {
      const today = new Date().toISOString().split("T")[0];
      const checkIns = await prisma.checkIn.findMany({
        where: { practiceId, arrivedAt: { gte: new Date(`${today}T00:00:00`) } },
        orderBy: { arrivedAt: "asc" },
      });
      return JSON.stringify(checkIns);
    }
    case "get_daily_tasks": {
      const tasks = await prisma.dailyTask.findMany({
        where: { practiceId },
        orderBy: { category: "asc" },
      });
      return JSON.stringify(tasks.map(t => ({ title: t.title, done: t.completed, category: t.category })));
    }
    case "send_whatsapp": {
      try {
        const { sendWhatsApp } = await import("@/lib/twilio");
        const result = await sendWhatsApp(input.to as string, input.message as string);
        return JSON.stringify({ success: true, sid: result.sid });
      } catch (err) {
        return JSON.stringify({ error: err instanceof Error ? err.message : "Failed" });
      }
    }
    case "send_email": {
      try {
        const { sendEmail } = await import("@/lib/resend");
        const result = await sendEmail({
          to: input.to as string,
          subject: input.subject as string,
          html: `<p>${input.body}</p>`,
        });
        return JSON.stringify({ success: true, id: result.data?.id });
      } catch (err) {
        return JSON.stringify({ error: err instanceof Error ? err.message : "Failed" });
      }
    }
    case "create_invoice": {
      const invoice = await prisma.invoice.create({
        data: {
          practiceId,
          patientName: input.patientName as string,
          lineItems: JSON.stringify(input.items),
          total: (input.items as Array<{ amount: number }>).reduce((s, i) => s + i.amount, 0),
          status: "draft",
        },
      });
      return JSON.stringify({ success: true, id: invoice.id });
    }
    case "get_outstanding_invoices": {
      const invoices = await prisma.invoice.findMany({
        where: { practiceId, status: { not: "paid" } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return JSON.stringify(invoices.map(i => ({ id: i.id, patient: i.patientName, total: i.total, status: i.status })));
    }
    case "add_patient": {
      const patient = await prisma.patient.create({
        data: {
          practiceId,
          name: input.name as string,
          email: (input.email as string) || "",
          phone: (input.phone as string) || "",
          dateOfBirth: (input.dateOfBirth as string) || "",
          medicalAid: (input.medicalAid as string) || "",
          medicalAidNo: (input.medicalAidNumber as string) || "",
        },
      });
      return JSON.stringify({ success: true, id: patient.id, name: patient.name });
    }
    case "sync_google_reviews": {
      try {
        const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
        if (!practice?.address) return JSON.stringify({ error: "Practice address not set" });
        const { findPlace, getPlaceDetails } = await import("@/lib/google");
        const placeId = await findPlace(`${practice.name} ${practice.address}`);
        if (!placeId) return JSON.stringify({ error: "Practice not found on Google Maps" });
        const details = await getPlaceDetails(placeId);
        if (!details?.reviews?.length) return JSON.stringify({ synced: 0 });
        const existing = await prisma.review.findMany({ where: { practiceId, source: "google" }, select: { authorName: true } });
        const existingNames = new Set(existing.map(r => r.authorName));
        const newReviews = details.reviews.filter(r => !existingNames.has(r.authorName));
        for (const r of newReviews) {
          await prisma.review.create({ data: { practiceId, rating: r.rating, comment: r.text, authorName: r.authorName, source: "google" } });
        }
        return JSON.stringify({ success: true, synced: newReviews.length, total: details.reviews.length });
      } catch (err) { return JSON.stringify({ error: err instanceof Error ? err.message : "Sync failed" }); }
    }
    case "get_google_reviews": {
      try {
        const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
        if (!practice?.address) return JSON.stringify({ error: "Practice address not set" });
        const { findPlace, getPlaceDetails } = await import("@/lib/google");
        const placeId = await findPlace(`${practice.name} ${practice.address}`);
        if (!placeId) return JSON.stringify({ error: "Practice not found on Google Maps" });
        const details = await getPlaceDetails(placeId);
        if (!details) return JSON.stringify({ error: "Could not load place details" });
        return JSON.stringify({ rating: details.rating, totalRatings: details.totalRatings, reviews: details.reviews.slice(0, 5) });
      } catch (err) { return JSON.stringify({ error: err instanceof Error ? err.message : "Failed" }); }
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}
