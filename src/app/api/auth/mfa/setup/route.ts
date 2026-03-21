import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  generateSecret,
  generateQRUrl,
  generateBackupCodes,
  hashBackupCode,
  encryptSecret,
} from "@/lib/mfa";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/is-demo";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "auth/mfa/setup", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  try {
    // Demo mode — return mock MFA setup
    if (isDemoMode) {
      const mockSecret = "JBSWY3DPEHPK3PXP";
      return NextResponse.json({
        qrUrl: `otpauth://totp/VisioHealth:demo@netcare.co.za?secret=${mockSecret}&issuer=VisioHealth&algorithm=SHA1&digits=6&period=30`,
        backupCodes: [
          "a1b2c3d4",
          "e5f6a7b8",
          "c9d0e1f2",
          "a3b4c5d6",
          "e7f8a9b0",
          "c1d2e3f4",
          "a5b6c7d8",
          "e9f0a1b2",
        ],
        message: "Save these backup codes securely. They will not be shown again.",
      });
    }

    const secret = generateSecret();
    const qrUrl = generateQRUrl(guard.user.email, secret);
    const backupCodes = generateBackupCodes();

    // Hash backup codes for storage
    const hashedCodes = await Promise.all(backupCodes.map((code) => hashBackupCode(code)));

    // Encrypt the secret before storing
    const encryptedSecret = encryptSecret(secret);

    // Store MFA data in user record
    await db.updateUser(guard.user.id, {
      mfaSecret: encryptedSecret,
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(hashedCodes),
    });

    return NextResponse.json({
      qrUrl,
      backupCodes, // Show once only — client must display and warn user to save them
      message: "Save these backup codes securely. They will not be shown again.",
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json({ error: "Failed to set up MFA" }, { status: 500 });
  }
}

/** DELETE: Disable MFA (requires current TOTP verification) */
export async function DELETE(request: Request) {
  const guard = await guardRoute(request, "auth/mfa/disable", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  try {
    if (isDemoMode) {
      return NextResponse.json({ message: "MFA disabled" });
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: "Current TOTP code required to disable MFA" }, { status: 400 });
    }

    // Verify the token before disabling
    const user = (await db.getUserById(guard.user.id)) as Record<string, unknown> | null;
    if (!user?.mfaSecret) {
      return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });
    }

    const { decryptSecret, verifyToken } = await import("@/lib/mfa");
    const secret = decryptSecret(user.mfaSecret as string);
    if (!verifyToken(secret, token)) {
      return NextResponse.json({ error: "Invalid TOTP code" }, { status: 401 });
    }

    await db.updateUser(guard.user.id, {
      mfaSecret: null,
      mfaEnabled: false,
      mfaBackupCodes: null,
    });

    return NextResponse.json({ message: "MFA disabled successfully" });
  } catch (error) {
    console.error("MFA disable error:", error);
    return NextResponse.json({ error: "Failed to disable MFA" }, { status: 500 });
  }
}
