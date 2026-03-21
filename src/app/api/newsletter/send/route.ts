import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
// Direct prisma import: Newsletter model is Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  // Rate limit: 5 sends per minute (admin-only, high-impact)
  const rl = await rateLimitByIp(req, "newsletter/send", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  // Auth check — gateway key required
  const authHeader = req.headers.get("authorization");
  const key = process.env.VISIO_GATEWAY_KEY;
  if (!key || authHeader !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, html, previewText } = await req.json();
    if (!subject || !html) {
      return NextResponse.json(
        { error: "subject and html required" },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "active" },
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers" },
        { status: 404 }
      );
    }

    // Send in batches of 50
    const batchSize = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      try {
        await resend.emails.send({
          from: "Netcare Technology <research@visiocorp.co>",
          to: batch.map((s) => s.email),
          subject,
          html,
          headers: {
            "X-Entity-Ref-ID": `vrl-newsletter-${Date.now()}`,
            ...(previewText
              ? { "X-Preview-Text": previewText }
              : {}),
          },
        });
        sent += batch.length;
      } catch (error) {
        console.error(`Newsletter batch ${i} failed:`, error);
        failed += batch.length;
      }
    }

    return NextResponse.json({ sent, failed, total: subscribers.length });
  } catch (error) {
    console.error("Newsletter send error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
