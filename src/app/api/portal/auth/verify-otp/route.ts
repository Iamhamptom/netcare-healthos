import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";
import { PORTAL_COOKIE_NAME } from "@/lib/patient-auth";

/** POST /api/portal/auth/verify-otp — Verify OTP and create patient session */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "portal-otp-verify", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const { phone, practiceId, otp } = await request.json();

  if (!phone || !practiceId || !otp) {
    return NextResponse.json({ error: "Phone, practice ID, and OTP code are required" }, { status: 400 });
  }

  if (isDemoMode) {
    if (otp === "123456") {
      const response = NextResponse.json({
        success: true,
        patientId: "demo-patient-1",
        message: "Welcome to your patient portal",
      });
      response.cookies.set(PORTAL_COOKIE_NAME, "demo-patient-token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
      return response;
    }
    return NextResponse.json({ error: "Invalid code. Demo code is 123456." }, { status: 400 });
  }

  const { verifyOTPAndCreateSession } = await import("@/lib/patient-auth");
  const result = await verifyOTPAndCreateSession(phone, practiceId, otp);

  if (!result.success || !result.token) {
    return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 });
  }

  const response = NextResponse.json({
    success: true,
    patientId: result.patientId,
    message: "Welcome to your patient portal",
  });

  response.cookies.set(PORTAL_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
}
