import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "reviews");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ reviews: demoStore.getReviews() });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({ where: { practiceId: guard.practiceId }, orderBy: { createdAt: "desc" }, take: limit, skip }),
    prisma.review.count({ where: { practiceId: guard.practiceId } }),
  ]);
  return NextResponse.json({ reviews, total, page, limit });
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
