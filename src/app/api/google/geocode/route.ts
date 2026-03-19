import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// GET — geocode the practice address for map display
export async function GET(request: Request) {
  const guard = await guardRoute(request, "google/geocode", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    // No valid Maps API key in demo — return location data without embed URL
    return NextResponse.json({
      lat: -26.1076,
      lng: 28.0567,
      formattedAddress: "45 Rivonia Rd, Sandton, 2196, South Africa",
      embedUrl: "",
      staticMapUrl: "",
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
    if (!practice?.address) {
      return NextResponse.json({ error: "Practice address not set" }, { status: 400 });
    }

    const { geocodeAddress, embedMapUrl, staticMapUrl } = await import("@/lib/google");
    const geo = await geocodeAddress(practice.address);
    if (!geo) {
      return NextResponse.json({ error: "Could not geocode address" }, { status: 404 });
    }

    return NextResponse.json({
      lat: geo.lat,
      lng: geo.lng,
      formattedAddress: geo.formattedAddress,
      embedUrl: embedMapUrl(practice.address),
      staticMapUrl: staticMapUrl(practice.address),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Geocode failed" }, { status: 500 });
  }
}
