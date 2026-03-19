import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// GET — fetch Google reviews for the practice
// POST — sync Google reviews into our reviews table
export async function GET(request: Request) {
  const guard = await guardRoute(request, "google/reviews", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      place: {
        name: "Smile Dental Sandton",
        rating: 4.7,
        totalRatings: 89,
        address: "123 Rivonia Road, Sandton, Johannesburg",
      },
      reviews: [
        { authorName: "Thabo M.", rating: 5, text: "Best dentist in Sandton! Dr. Mitchell is amazing.", relativeTimeDescription: "2 weeks ago" },
        { authorName: "Naledi K.", rating: 5, text: "Very professional. WhatsApp reminders are so convenient.", relativeTimeDescription: "1 month ago" },
        { authorName: "James W.", rating: 4, text: "Great service, but parking is limited.", relativeTimeDescription: "2 months ago" },
      ],
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
    if (!practice?.address) {
      return NextResponse.json({ error: "Practice address not set. Update it in Settings." }, { status: 400 });
    }

    const { findPlace, getPlaceDetails } = await import("@/lib/google");
    const query = `${practice.name} ${practice.address}`;
    const placeId = await findPlace(query);
    if (!placeId) {
      return NextResponse.json({ error: "Could not find practice on Google Maps. Check your address." }, { status: 404 });
    }

    const details = await getPlaceDetails(placeId);
    if (!details) {
      return NextResponse.json({ error: "Could not load place details" }, { status: 500 });
    }

    return NextResponse.json({
      place: { name: details.name, rating: details.rating, totalRatings: details.totalRatings, address: details.address },
      reviews: details.reviews,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST — sync Google reviews into our reviews table
export async function POST(request: Request) {
  const guard = await guardRoute(request, "google/reviews/sync", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ synced: 3, message: "[DEMO] Would sync 3 Google reviews" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
    if (!practice?.address) {
      return NextResponse.json({ error: "Practice address not set" }, { status: 400 });
    }

    const { findPlace, getPlaceDetails } = await import("@/lib/google");
    const placeId = await findPlace(`${practice.name} ${practice.address}`);
    if (!placeId) return NextResponse.json({ error: "Practice not found on Google" }, { status: 404 });

    const details = await getPlaceDetails(placeId);
    if (!details?.reviews?.length) return NextResponse.json({ synced: 0 });

    // Get existing Google reviews to avoid duplicates
    const existing = await prisma.review.findMany({
      where: { practiceId: guard.practiceId, source: "google" },
      select: { authorName: true },
    });
    const existingNames = new Set(existing.map(r => r.authorName));

    const newReviews = details.reviews.filter(r => !existingNames.has(r.authorName));
    for (const r of newReviews) {
      await prisma.review.create({
        data: {
          practiceId: guard.practiceId,
          rating: r.rating,
          comment: r.text,
          authorName: r.authorName,
          source: "google",
        },
      });
    }

    return NextResponse.json({ synced: newReviews.length, total: details.reviews.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
