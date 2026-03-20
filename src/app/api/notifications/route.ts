import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "notifications");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ notifications: demoStore.getNotifications() });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { practiceId: guard.practiceId },
      orderBy: { sentAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.notification.count({ where: { practiceId: guard.practiceId } }),
  ]);
  return NextResponse.json({ notifications, total, page, limit });
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
