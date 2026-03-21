import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { resetTokens } from "@/lib/reset-tokens";

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "auth/reset-password", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters with 1 uppercase and 1 number" }, { status: 400 });
    }

    // Look up the token
    const tokenData = await resetTokens.get(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    if (tokenData.expiresAt < Date.now()) {
      await resetTokens.delete(token);
      return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
    }

    // Demo mode — just delete the token and return success
    if (isDemoMode) {
      await resetTokens.delete(token);
      console.log(`[auth/reset-password] Demo password reset for ${tokenData.email}`);
      return NextResponse.json({ message: "Password updated successfully. You can now log in." });
    }

    // Production: update the password
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(password, 12);

    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const { error } = await supabaseAdmin
      .from(tables.users)
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq("email", tokenData.email);

    if (error) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    // Invalidate the token
    await resetTokens.delete(token);

    return NextResponse.json({ message: "Password updated successfully. You can now log in." });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
