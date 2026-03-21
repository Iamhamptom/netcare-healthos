import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/is-demo";
import { verifyToken, decryptSecret, verifyBackupCode } from "@/lib/mfa";

// Temp tokens for MFA flow (in-memory, short-lived)
const tempTokens = new Map<string, { userId: string; expiresAt: number }>();

// Clean up expired temp tokens every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of tempTokens) {
      if (val.expiresAt < now) tempTokens.delete(key);
    }
  }, 300_000);
}

/** Store a temp token for MFA verification (called from login route) */
export function storeTempToken(token: string, userId: string): void {
  tempTokens.set(token, { userId, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
}

/** POST: Verify MFA token during login flow */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "auth/mfa/verify", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { tempToken, mfaCode } = await request.json();

    if (!tempToken || !mfaCode) {
      return NextResponse.json({ error: "Temp token and MFA code required" }, { status: 400 });
    }

    if (typeof mfaCode !== "string" || (mfaCode.length !== 6 && mfaCode.length !== 8)) {
      return NextResponse.json({ error: "Invalid MFA code format" }, { status: 400 });
    }

    // Demo mode
    if (isDemoMode) {
      if (mfaCode === "000000" || mfaCode.length === 8) {
        const { createSession } = await import("@/lib/auth");
        await createSession("demo-user-1");
        return NextResponse.json({
          user: { id: "demo-user-1", name: "Dr. Thirushen Pillay", email: "thirushen.pillay@netcare.co.za", role: "doctor" },
        });
      }
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }

    // Look up temp token
    const tempData = tempTokens.get(tempToken);
    if (!tempData || tempData.expiresAt < Date.now()) {
      tempTokens.delete(tempToken);
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    // Get user
    const user = (await db.getUserById(tempData.userId)) as Record<string, unknown> | null;
    if (!user?.mfaSecret) {
      return NextResponse.json({ error: "MFA not configured" }, { status: 400 });
    }

    const secret = decryptSecret(user.mfaSecret as string);
    let verified = false;

    // Try TOTP first (6-digit code)
    if (mfaCode.length === 6 && /^\d{6}$/.test(mfaCode)) {
      verified = verifyToken(secret, mfaCode);
    }

    // Try backup code (8-char hex)
    if (!verified && mfaCode.length === 8 && user.mfaBackupCodes) {
      const hashedCodes: string[] = JSON.parse(user.mfaBackupCodes as string);
      for (let i = 0; i < hashedCodes.length; i++) {
        if (await verifyBackupCode(hashedCodes[i], mfaCode)) {
          verified = true;
          // Remove used backup code
          hashedCodes.splice(i, 1);
          await db.updateUser(tempData.userId, {
            mfaBackupCodes: JSON.stringify(hashedCodes),
          });
          break;
        }
      }
    }

    if (!verified) {
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }

    // MFA verified — create full session
    tempTokens.delete(tempToken);
    const { createSession } = await import("@/lib/auth");
    await createSession(tempData.userId);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("MFA verify error:", error);
    return NextResponse.json({ error: "MFA verification failed" }, { status: 500 });
  }
}
