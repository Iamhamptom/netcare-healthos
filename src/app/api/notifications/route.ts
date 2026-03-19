import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "notifications");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ notifications: demoStore.getNotifications() });
  }

  const { prisma } = await import("@/lib/prisma");
  const notifications = await prisma.notification.findMany({
    where: { practiceId: guard.practiceId },
    orderBy: { sentAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "notifications");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.recipient || !body.message) {
    return NextResponse.json({ error: "Recipient and message are required" }, { status: 400 });
  }

  const types = ["whatsapp", "sms", "email"];
  const type = types.includes(body.type) ? body.type : "whatsapp";

  if (isDemoMode) {
    const n = demoStore.addNotification({
      type,
      recipient: sanitize(body.recipient),
      patientName: sanitize(body.patientName || ""),
      subject: sanitize(body.subject || ""),
      message: sanitize(body.message),
      template: body.template || "custom",
    });
    return NextResponse.json({ notification: n }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const notification = await prisma.notification.create({
    data: {
      type,
      recipient: sanitize(body.recipient),
      patientName: sanitize(body.patientName || ""),
      subject: sanitize(body.subject || ""),
      message: sanitize(body.message),
      template: body.template || "custom",
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ notification }, { status: 201 });
}
