import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "recall");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ recallItems: demoStore.getRecallItems() });

  const { prisma } = await import("@/lib/prisma");
  const recallItems = await prisma.recallItem.findMany({ where: { practiceId: guard.practiceId }, orderBy: { dueDate: "asc" } });
  return NextResponse.json({ recallItems });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "recall");
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  const err = validateRequired(body, ["patientName", "reason", "dueDate"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  if (isDemoMode) {
    const item = demoStore.addRecallItem(body);
    return NextResponse.json({ recallItem: item });
  }

  const { prisma } = await import("@/lib/prisma");
  const item = await prisma.recallItem.create({
    data: { patientName: sanitize(body.patientName), reason: sanitize(body.reason), dueDate: new Date(body.dueDate), phone: sanitize(body.phone || ""), practiceId: guard.practiceId },
  });
  return NextResponse.json({ recallItem: item });
}
