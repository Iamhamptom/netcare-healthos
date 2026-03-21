import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

// Demo specialist practices
const demoPractices = [
  { id: "demo-ent-1", name: "Dr. Lamola ENT Practice", type: "ent", address: "Sandton, Johannesburg", subdomain: "lamola-ent" },
  { id: "demo-dental-1", name: "Smile Dental Studio", type: "dental", address: "Rosebank, Johannesburg", subdomain: "smile-dental" },
  { id: "demo-dental-2", name: "Waterfall Dental Care", type: "dental", address: "Midrand, Gauteng", subdomain: "waterfall-dental" },
  { id: "demo-oncology-1", name: "Gauteng Oncology Centre", type: "oncology", address: "Pretoria, Gauteng", subdomain: "gauteng-oncology" },
  { id: "demo-radio-1", name: "Precision Radiology", type: "radiology", address: "Fourways, Johannesburg", subdomain: "precision-rad" },
  { id: "demo-ortho-1", name: "ProMotion Orthopaedics", type: "orthopaedics", address: "Cape Town, Western Cape", subdomain: "promotion-ortho" },
];

export async function GET(request: Request) {
  // Rate limit — 30 per minute per IP
  const rl = await rateLimitByIp(request, "public/specialists", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type")?.toLowerCase() || "";

  if (isDemoMode) {
    const filtered = type
      ? demoPractices.filter((p) => p.type === type)
      : demoPractices;
    return NextResponse.json({ practices: filtered });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }
    // Exclude GP referrer practices from the specialist directory
    where.plan = { not: "gp_referrer" };

    const practices = await prisma.practice.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        subdomain: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ practices });
  } catch (err) {
    console.error("Fetch specialists error:", err);
    return NextResponse.json({ error: "Failed to fetch specialists." }, { status: 500 });
  }
}
