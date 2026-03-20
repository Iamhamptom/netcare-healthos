import { NextResponse, NextRequest } from "next/server";
import { guardRoute } from "@/lib/api-helpers";
import { getWhatsAppSource } from "@/lib/data-sources";

export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "whatsapp-directory");
  if (guard instanceof NextResponse) return guard;

  const source = getWhatsAppSource();
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  const service = url.searchParams.get("service") || undefined;

  try {
    if (lat && lng) {
      const nearest = await source.findNearestClinic(Number(lat), Number(lng), service);
      return NextResponse.json({ clinics: nearest });
    }

    const directory = await source.getClinicDirectory();
    return NextResponse.json({ clinics: directory });
  } catch (err) {
    console.error("WhatsApp directory error:", err);
    return NextResponse.json({ error: "Failed to fetch clinic directory" }, { status: 500 });
  }
}
