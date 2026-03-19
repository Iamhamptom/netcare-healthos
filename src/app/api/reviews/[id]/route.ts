import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "reviews/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  if (isDemoMode) { demoStore.deleteReview(id); return NextResponse.json({ ok: true }); }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
