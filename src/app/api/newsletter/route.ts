import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
// Direct prisma import: Newsletter model is Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

// POST — subscribe to newsletter
export async function POST(req: NextRequest) {
  // Rate limit: 5 subscribes per minute per IP
  const rl = await rateLimitByIp(req, "newsletter/subscribe", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const { email, source, name } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({
        message: "Already subscribed",
        status: "existing",
      });
    }

    // Create subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || null,
        source: source || "website",
        status: "active",
      },
    });

    return NextResponse.json({
      message: "Subscribed successfully",
      status: "new",
      id: subscriber.id,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

// GET — list subscribers (admin only, gateway key auth)
export async function GET(req: NextRequest) {
  // Rate limit: 30 per minute
  const rl = await rateLimitByIp(req, "newsletter/list", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const key = process.env.VISIO_GATEWAY_KEY;
  if (!key || authHeader !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ total: subscribers.length, subscribers });
}
