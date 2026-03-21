import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "contact", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { name, email, practice, message } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Log submission (visible in Vercel logs for lead tracking)
    console.log("[CONTACT_LEAD]", JSON.stringify({ name, email, practice, message, ts: new Date().toISOString() }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
