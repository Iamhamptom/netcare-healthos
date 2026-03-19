import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// Send email — supports raw and templated emails
export async function POST(request: Request) {
  const guard = await guardRoute(request, "email/send");
  if (isErrorResponse(guard)) return guard;

  const { to, subject, body, template, templateData } = await request.json();

  if (!to) return NextResponse.json({ error: "to required" }, { status: 400 });

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      id: "demo-email-" + Date.now(),
      message: `[DEMO] Email to ${to}: ${subject || template}`,
    });
  }

  try {
    const resend = await import("@/lib/resend");
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
    const practiceName = practice?.name || "Netcare Health OS Ops";
    const primaryColor = practice?.primaryColor || "#D4AF37";

    let emailSubject = subject;
    let emailHtml = `<p>${body}</p>`;

    // Use templates if specified
    if (template && templateData) {
      switch (template) {
        case "appointment_confirmation": {
          const email = resend.appointmentConfirmationEmail({
            practiceName, primaryColor,
            patientName: templateData.patientName,
            service: templateData.service,
            date: templateData.date,
            time: templateData.time,
            address: practice?.address || "",
          });
          emailSubject = email.subject;
          emailHtml = email.html;
          break;
        }
        case "appointment_reminder": {
          const email = resend.appointmentReminderEmail({
            practiceName, primaryColor,
            patientName: templateData.patientName,
            service: templateData.service,
            date: templateData.date,
            time: templateData.time,
            hoursUntil: templateData.hoursUntil || 24,
          });
          emailSubject = email.subject;
          emailHtml = email.html;
          break;
        }
        case "invoice": {
          const email = resend.invoiceEmail({
            practiceName, primaryColor,
            patientName: templateData.patientName,
            invoiceNumber: templateData.invoiceNumber,
            total: templateData.total,
            items: templateData.items,
            dueDate: templateData.dueDate,
          });
          emailSubject = email.subject;
          emailHtml = email.html;
          break;
        }
        case "follow_up": {
          const email = resend.followUpEmail({
            practiceName, primaryColor,
            patientName: templateData.patientName,
            service: templateData.service,
            message: templateData.message,
          });
          emailSubject = email.subject;
          emailHtml = email.html;
          break;
        }
      }
    }

    if (!emailSubject) return NextResponse.json({ error: "subject required" }, { status: 400 });

    const result = await resend.sendEmail({
      to,
      subject: emailSubject,
      html: emailHtml,
      replyTo: practice?.phone ? undefined : undefined,
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Email failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
