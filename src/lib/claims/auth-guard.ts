// Claims route auth guard + PII sanitization
// Enforces authentication, rate limiting, practice scoping, and POPIA compliance

import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";

interface AuthResult {
  authorized: boolean;
  userId: string;
  practiceId: string;
  response?: NextResponse;
}

const DEMO_USER = { userId: "demo-user", practiceId: "demo-practice" };

/**
 * Authenticate a claims API request.
 * Returns userId and practiceId if authorized, or an error response.
 */
export async function requireClaimsAuth(
  request: Request,
  routeName: string,
  rateOpts: { limit?: number; windowMs?: number } = { limit: 20, windowMs: 60_000 },
): Promise<AuthResult> {
  // Rate limit first (even before auth)
  const rl = await rateLimitByIp(request, `claims/${routeName}`, rateOpts);
  if (!rl.allowed) {
    return {
      authorized: false,
      userId: "",
      practiceId: "",
      response: NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 }),
    };
  }

  // Demo mode bypass
  if (isDemoMode) {
    return { authorized: true, ...DEMO_USER };
  }

  // Authenticate via session cookie
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) {
    return {
      authorized: false,
      userId: "",
      practiceId: "",
      response: NextResponse.json({ error: "Unauthorized — please log in" }, { status: 401 }),
    };
  }

  // Get user's practice
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, practiceId: true, role: true },
  });

  if (!user) {
    return {
      authorized: false,
      userId: "",
      practiceId: "",
      response: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  // Only admin and receptionist roles can access claims
  if (!["admin", "receptionist", "platform_admin"].includes(user.role)) {
    return {
      authorized: false,
      userId: user.id,
      practiceId: user.practiceId || "",
      response: NextResponse.json({ error: "Insufficient permissions for claims analysis" }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    userId: user.id,
    practiceId: user.practiceId || "default",
  };
}

/**
 * Strip patient names from validation results before storage.
 * POPIA compliance: we only store anonymized data.
 */
export function sanitizeResultForStorage(result: Record<string, unknown>): Record<string, unknown> {
  const sanitized = JSON.parse(JSON.stringify(result));

  // Anonymize patient names in line results
  if (Array.isArray(sanitized.lineResults)) {
    for (const lr of sanitized.lineResults) {
      if (lr.claimData?.patientName) {
        lr.claimData.patientName = anonymizeName(lr.claimData.patientName);
      }
    }
  }

  return sanitized;
}

/**
 * Anonymize a name to initials: "Sarah Naidoo" → "S.N."
 */
function anonymizeName(name: string): string {
  if (!name) return "";
  return name
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() || "")
    .filter(Boolean)
    .join(".") + ".";
}

/**
 * Validate uploaded file size (max 5MB for claims CSV)
 */
export function validateFileSize(file: File, maxBytes = 5 * 1024 * 1024): string | null {
  if (file.size > maxBytes) {
    const maxMB = Math.round(maxBytes / 1024 / 1024);
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${maxMB}MB.`;
  }
  return null;
}
