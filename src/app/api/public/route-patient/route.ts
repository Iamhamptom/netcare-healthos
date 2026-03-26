import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { routeToNearest, getAllSites } from "@/lib/location-router";

/**
 * Patient Location Routing API
 *
 * POST /api/public/route-patient — route patient to nearest site
 * GET  /api/public/route-patient — list all practice sites
 */

export async function GET() {
  return NextResponse.json({ sites: getAllSites() });
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "public/route-patient", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await request.json();
    const { suburb, city, province, lat, lng, serviceNeeded } = body;

    const result = routeToNearest({ suburb, city, province, lat, lng, serviceNeeded });

    return NextResponse.json({
      recommended: {
        name: result.recommended.name,
        address: result.recommended.address,
        city: result.recommended.city,
        days: result.recommended.days,
        phone: result.recommended.phone,
        services: result.recommended.services,
      },
      distance_km: result.distance_km,
      alternatives: result.alternatives.map(a => ({
        name: a.site.name,
        address: a.site.address,
        city: a.site.city,
        days: a.site.days,
        phone: a.site.phone,
        distance_km: a.distance_km,
      })),
      method: result.method,
    });
  } catch {
    return NextResponse.json({ error: "Routing failed" }, { status: 500 });
  }
}
