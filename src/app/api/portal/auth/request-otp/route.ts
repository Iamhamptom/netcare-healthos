import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

/** POST /api/portal/auth/request-otp — Send OTP to patient's WhatsApp */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "portal-otp-request", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const { phone, practiceId } = await request.json();

  if (!phone || !practiceId) {
    return NextResponse.json({ error: "Phone number and practice ID are required" }, { status: 400 });
  }

  // Normalize SA phone
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: "Invalid South African phone number" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      message: "Demo mode — OTP code is 123456",
      expiresIn: 300,
    });
  }

  const { requestOTP } = await import("@/lib/patient-auth");
  const result = await requestOTP(normalizedPhone, practiceId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "A 6-digit code has been sent to your WhatsApp",
    expiresIn: 300,
  });
}

function normalizePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // SA mobile: +27 6/7/8 XXXXXXXX or 0 6/7/8 XXXXXXXX
  if (/^\+27[6-8]\d{8}$/.test(cleaned)) return cleaned;
  if (/^0[6-8]\d{8}$/.test(cleaned)) return "+27" + cleaned.slice(1);
  if (/^27[6-8]\d{8}$/.test(cleaned)) return "+" + cleaned;
  return null;
}
