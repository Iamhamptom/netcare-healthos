import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
// Direct prisma import: Booking/availability models are Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";
import { getAvailability } from "@/lib/booking-engine";

/** GET /api/public/availability — Public endpoint for checking practice availability */
export async function GET(request: Request) {
  const rl = rateLimitByIp(request, "public/availability", { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const date = searchParams.get("date");
  const duration = Number(searchParams.get("duration")) || 30;
  const infoOnly = searchParams.get("info") === "true";

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  // Demo mode
  if (isDemoMode) {
    const demoServices = [
      { name: "Consultation", duration: 30, price: 450 },
      { name: "Dental Cleaning", duration: 45, price: 650 },
      { name: "Tooth Whitening", duration: 60, price: 2500 },
      { name: "Check-up", duration: 30, price: 350 },
      { name: "Emergency", duration: 30, price: 800 },
    ];
    const practice = {
      id: "demo",
      name: "Smile Dental — Sandton",
      type: "dental",
      address: "45 Rivonia Rd, Sandton, 2196",
      phone: "+27 11 783 4500",
      hours: "Mon-Fri 8:00-17:00, Sat 8:00-13:00",
      primaryColor: "#D4AF37",
      secondaryColor: "#2DD4BF",
      tagline: "Your smile, our priority",
      logoUrl: "",
      bookingServices: demoServices,
      bookingWelcomeMsg: "Book your appointment online. We'll confirm via WhatsApp.",
      bookingDepositEnabled: false,
      bookingDepositAmount: 0,
    };

    if (infoOnly) return NextResponse.json({ practice });

    // Generate demo slots
    const slots = [];
    for (let h = 8; h < 17; h++) {
      for (const m of [0, 30]) {
        if (h === 16 && m === 30) continue;
        const available = Math.random() > 0.3;
        slots.push({ time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, available });
      }
    }
    return NextResponse.json({ slots, practice });
  }

  // Live mode — find practice by subdomain
  const practice = await prisma.practice.findFirst({
    where: { subdomain: slug, bookingEnabled: true },
  });

  if (!practice) return NextResponse.json({ error: "Practice not found or booking disabled" }, { status: 404 });

  // Parse services
  let bookingServices: { name: string; duration: number; price: number }[] = [];
  try { bookingServices = JSON.parse(practice.bookingServices || "[]"); } catch { bookingServices = []; }

  const practiceInfo = {
    id: practice.id,
    name: practice.name,
    type: practice.type,
    address: practice.address,
    phone: practice.phone,
    hours: practice.hours,
    primaryColor: practice.primaryColor,
    secondaryColor: practice.secondaryColor,
    tagline: practice.tagline,
    logoUrl: practice.logoUrl,
    bookingServices,
    bookingWelcomeMsg: practice.bookingWelcomeMsg,
    bookingDepositEnabled: practice.bookingDepositEnabled,
    bookingDepositAmount: practice.bookingDepositAmount,
  };

  if (infoOnly || !date) return NextResponse.json({ practice: practiceInfo });

  const slots = await getAvailability(practice.id, date, duration);
  return NextResponse.json({ slots, practice: practiceInfo });
}
