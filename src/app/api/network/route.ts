import { NextResponse, NextRequest } from "next/server";
import { guardPlatformAdmin } from "@/lib/api-helpers";
import { getNetworkSource } from "@/lib/data-sources";

export async function GET(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "network");
  if (guard instanceof NextResponse) return guard;

  const source = getNetworkSource();
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "kpis";
  const region = url.searchParams.get("region") || undefined;

  try {
    switch (tab) {
      case "kpis":
        return NextResponse.json(await source.getDivisionKPIs());
      case "clinics":
        return NextResponse.json(await source.getClinicPerformance({ region }));
      case "schemes":
        return NextResponse.json(await source.getMedicalSchemeMetrics());
      case "rejections":
        return NextResponse.json(await source.getTopRejections(10));
      default:
        return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }
  } catch (err) {
    console.error("Network API error:", err);
    return NextResponse.json({ error: "Failed to fetch network data" }, { status: 500 });
  }
}
