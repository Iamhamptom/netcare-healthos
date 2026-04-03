import { NextResponse } from "next/server";

// POST /api/demo-request — Capture demo requests from health leads
// Sends WhatsApp notification to Dr. Hampton + stores in DB

export async function POST(req: Request) {
  let body: { name?: string; practice?: string; email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, practice, email, phone } = body;
  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
  }

  // Store in DB if Prisma is available
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.notification.create({
      data: {
        type: "demo_request",
        title: `Demo Request: ${name}`,
        message: `${name} from ${practice || "Unknown practice"} wants a demo. Phone: ${phone}. Email: ${email || "N/A"}`,
        channel: "system",
        status: "pending",
      },
    });
    await prisma.$disconnect();
  } catch {
    // DB write is non-critical — notification via Resend is the primary channel
  }

  // Send email notification to Dr. Hampton via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Visio Health <david@visiocorp.co>",
          to: "davidhampton@visiocorp.co",
          subject: `🔥 Demo Request: ${name} — ${practice || "Health Practice"}`,
          html: `<div style="font-family:sans-serif;max-width:500px;">
            <h2 style="color:#10b981;">New Demo Request</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Practice</td><td style="padding:8px 0;font-weight:600;">${practice || "Not provided"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;font-weight:600;"><a href="tel:${phone}">${phone}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;">${email || "Not provided"}</td></tr>
            </table>
            <p style="margin-top:20px;"><a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}" style="background:#25D366;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">WhatsApp them now</a></p>
            <p style="color:#999;font-size:12px;margin-top:16px;">From: healthops-platform.vercel.app/demo</p>
          </div>`,
        }),
      });
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ success: true });
}
