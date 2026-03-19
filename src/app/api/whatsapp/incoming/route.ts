import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

// Twilio WhatsApp webhook — receives messages from patients
export async function POST(request: Request) {
  if (isDemoMode) {
    return NextResponse.json({ message: "WhatsApp incoming (demo)" });
  }

  const formData = await request.formData();
  const from = (formData.get("From") as string || "").replace("whatsapp:", "");
  const body = formData.get("Body") as string || "";
  const profileName = formData.get("ProfileName") as string || "";

  if (!from || !body) {
    return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // Find practice by matching patient phone number, or use default
    const patient = await prisma.patient.findFirst({
      where: { phone: { contains: from.slice(-9) } }, // match last 9 digits
      include: { practice: true },
    });

    const practice = patient?.practice || await prisma.practice.findFirst();
    if (!practice) {
      return new Response("<Response><Message>Practice not found.</Message></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // Load conversation history (last 20 messages)
    let conversation = await prisma.conversation.findFirst({
      where: { patientId: patient?.id, practiceId: practice.id },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 20 } },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation && patient) {
      conversation = await prisma.conversation.create({
        data: { patientId: patient.id, practiceId: practice.id, channel: "whatsapp" },
        include: { messages: true },
      });
    }

    // Save incoming message
    if (conversation) {
      await prisma.message.create({
        data: { conversationId: conversation.id, role: "patient", content: body },
      });
    }

    // Run WhatsApp agent
    const { processWhatsAppMessage } = await import("@/lib/whatsapp-agent");

    const history = (conversation?.messages || [])
      .reverse()
      .map(m => ({
        role: (m.role === "patient" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));
    history.push({ role: "user", content: body });

    const agentReply = await processWhatsAppMessage(
      {
        practiceName: practice.name,
        practiceType: practice.type,
        practiceHours: practice.hours,
        practicePhone: practice.phone,
        practiceAddress: practice.address,
        aiPersonality: practice.aiPersonality,
        patientName: patient?.name || profileName,
        patientPhone: from,
        conversationHistory: history,
      },
      async (toolName, input) => {
        // Tool executor — connects agent tools to real data
        switch (toolName) {
          case "check_availability": {
            const date = input.date as string;
            const bookings = await prisma.booking.findMany({
              where: { practiceId: practice.id, scheduledAt: { gte: new Date(`${date}T00:00:00`), lt: new Date(`${date}T23:59:59`) } },
            });
            const bookedTimes = bookings.map(b => new Date(b.scheduledAt).toTimeString().slice(0, 5));
            const allSlots = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];
            const available = allSlots.filter(s => !bookedTimes.includes(s));
            return JSON.stringify({ date, available, booked: bookedTimes.length });
          }
          case "create_booking": {
            const booking = await prisma.booking.create({
              data: {
                practiceId: practice.id,
                patientName: input.patientName as string,
                service: input.service as string,
                scheduledAt: new Date(`${input.date}T${input.time}:00`),
                notes: (input.notes as string) || "",
                status: "pending",
              },
            });
            return JSON.stringify({ success: true, bookingId: booking.id, status: "pending", message: "Booking created — awaiting practice approval" });
          }
          case "lookup_patient": {
            const phone = input.phone as string;
            const found = await prisma.patient.findFirst({
              where: { phone: { contains: phone.slice(-9) } },
            });
            if (!found) return JSON.stringify({ found: false });
            const patientBookings = await prisma.booking.findMany({
              where: { practiceId: practice.id, patientName: found.name, status: { not: "cancelled" } },
              orderBy: { scheduledAt: "desc" }, take: 5,
            });
            return JSON.stringify({ found: true, name: found.name, upcomingBookings: patientBookings.length });
          }
          case "cancel_booking": {
            await prisma.booking.update({
              where: { id: input.bookingId as string },
              data: { status: "cancelled" },
            });
            return JSON.stringify({ success: true });
          }
          case "escalate_to_human": {
            // Create a notification for staff
            if (conversation) {
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  role: "system",
                  content: `⚠️ ESCALATED: ${input.reason} (Urgency: ${input.urgency})`,
                },
              });
            }
            return JSON.stringify({ escalated: true });
          }
          default:
            return JSON.stringify({ error: "Unknown tool" });
        }
      }
    );

    // Save agent reply
    if (conversation) {
      await prisma.message.create({
        data: { conversationId: conversation.id, role: "practice", content: agentReply, approved: true },
      });
    }

    // Send reply back via Twilio (TwiML response)
    const twiml = `<Response><Message>${agentReply.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c))}</Message></Response>`;
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });

  } catch (err) {
    console.error("WhatsApp agent error:", err);
    return new Response(
      "<Response><Message>Sorry, something went wrong. Please call us directly.</Message></Response>",
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
