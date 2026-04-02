import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Log to Vercel runtime logs — visible in dashboard > Logs
    console.log("[RESEARCH-ACCESS]", JSON.stringify({
      email: body.email,
      action: body.action,
      document: body.document || "VRL-003",
      ip,
      timestamp: body.timestamp || new Date().toISOString(),
      userAgent: body.userAgent?.substring(0, 120),
    }));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
