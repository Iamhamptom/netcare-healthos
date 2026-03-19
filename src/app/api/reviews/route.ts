import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "reviews");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ reviews: demoStore.getReviews() });

  const { prisma } = await import("@/lib/prisma");
  const reviews = await prisma.review.findMany({ where: { practiceId: guard.practiceId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "reviews");
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  const rating = clampInt(body.rating, 1, 5);
  if (!rating) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  if (isDemoMode) {
    const review = demoStore.addReview({ ...body, rating });
    return NextResponse.json({ review });
  }

  const { prisma } = await import("@/lib/prisma");
  const review = await prisma.review.create({
    data: { rating, comment: sanitize(body.comment || ""), source: sanitize(body.source || "google"), authorName: sanitize(body.authorName || ""), practiceId: guard.practiceId },
  });
  return NextResponse.json({ review });
}
