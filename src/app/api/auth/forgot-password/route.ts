import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { resetTokens } from "@/lib/reset-tokens";

export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "auth/forgot-password", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Demo mode — always return success (don't reveal if email exists)
    if (isDemoMode) {
      const demoEmails = [
        "sara.nayager@netcare.co.za",
        "thirushen.pillay@netcare.co.za",
        "chris.mathew@netcare.co.za",
        "demo@netcare.co.za",
      ];

      if (demoEmails.includes(normalizedEmail)) {
        // Generate a demo token
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("hex");
        resetTokens.set(token, {
          email: normalizedEmail,
          expiresAt: Date.now() + 3600000, // 1 hour
        });

        console.log(`[auth/forgot-password] Demo reset token for ${normalizedEmail}: ${token}`);
      }

      return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Production: check user exists
    const { db } = await import("@/lib/db");
    const user = await db.getUserByEmail(normalizedEmail) as Record<string, unknown> | null;

    if (user) {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 3600000; // 1 hour

      // Store token (in production, store in DB)
      resetTokens.set(token, { email: normalizedEmail, expiresAt });

      // Send email via Resend
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://netcare-healthos.vercel.app"}/reset-password?token=${token}`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Netcare Health OS <noreply@netcare-healthos.vercel.app>",
            to: normalizedEmail,
            subject: "Reset your Netcare Health OS password",
            html: `
              <h2>Password Reset</h2>
              <p>You requested a password reset for your Netcare Health OS account.</p>
              <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1D3443;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a></p>
              <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            `,
          }),
        });
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

