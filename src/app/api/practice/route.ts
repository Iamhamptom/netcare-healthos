import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";
import { rateLimitByIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { parseIntegrations } from "@/lib/microsoft";

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "practice", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (isDemoMode) return NextResponse.json({ practice: demoPractice });

  const { prisma } = await import("@/lib/prisma");
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { practice: true } });
  return NextResponse.json({ practice: user?.practice || null });
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "practice/create", { limit: 5 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (isDemoMode) return NextResponse.json({ practice: demoPractice });

  const { prisma } = await import("@/lib/prisma");
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.practiceId) return NextResponse.json({ error: "Not allowed" }, { status: 400 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "My Practice";
  const type = typeof body.type === "string" ? body.type.trim().slice(0, 50) : "dental";
  const address = typeof body.address === "string" ? body.address.trim().slice(0, 500) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const hours = typeof body.hours === "string" ? body.hours.trim().slice(0, 200) : "";
  const aiPersonality = typeof body.aiPersonality === "string" ? body.aiPersonality.trim().slice(0, 50) : "professional";

  if (!name) return NextResponse.json({ error: "Practice name required" }, { status: 400 });

  const practice = await prisma.practice.create({ data: { name, type, address, phone, hours, aiPersonality } });
  await prisma.user.update({ where: { id: user.id }, data: { practiceId: practice.id } });
  return NextResponse.json({ practice });
}

export async function PUT(request: Request) {
  const rl = await rateLimitByIp(request, "practice/update", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (isDemoMode) return NextResponse.json({ practice: demoPractice });

  const { prisma } = await import("@/lib/prisma");
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.practiceId) return NextResponse.json({ error: "No practice" }, { status: 400 });

  const body = await request.json();
  // Only allow known fields to be updated — prevent injection of arbitrary fields
  const allowed: Record<string, string | undefined> = {};
  const stringFields = ["name", "type", "address", "phone", "hours", "aiPersonality", "logoUrl", "primaryColor", "secondaryColor", "subdomain", "tagline"];
  for (const field of stringFields) {
    if (typeof body[field] === "string") {
      allowed[field] = body[field].trim().slice(0, 500);
    }
  }

  if (Object.keys(allowed).length === 0) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const practice = await prisma.practice.update({ where: { id: user.practiceId }, data: allowed });
  return NextResponse.json({ practice });
}

/** PATCH /api/practice — Update integrations JSON (used by Microsoft settings) */
export async function PATCH(request: Request) {
  const rl = await rateLimitByIp(request, "practice/patch", { limit: 20 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (isDemoMode) return NextResponse.json({ practice: demoPractice });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user?.practiceId) return NextResponse.json({ error: "No practice" }, { status: 400 });

  const practiceId = user.practiceId as string;

  try {
    const body = await request.json();

    // Load current integrations
    const practice = await db.getPractice(practiceId) as Record<string, unknown> | null;
    const current = parseIntegrations((practice?.integrations as string) ?? "{}");

    // Merge updates into integrations
    if (body.integrations && typeof body.integrations === "object") {
      const merged = { ...current, ...body.integrations };
      await db.updatePractice(practiceId, { integrations: JSON.stringify(merged) });
      return NextResponse.json({ success: true, integrations: merged });
    }

    // Clear integrations (disconnect)
    if (body.clearIntegrations === true) {
      await db.updatePractice(practiceId, { integrations: JSON.stringify({}) });
      return NextResponse.json({ success: true, integrations: {} });
    }

    return NextResponse.json({ error: "No valid update provided" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update practice" }, { status: 500 });
  }
}
