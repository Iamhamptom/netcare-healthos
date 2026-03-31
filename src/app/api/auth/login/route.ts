import { NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { demoUsers, demoUser } from "@/lib/demo-data";
import { db } from "@/lib/db";
import { storeTempToken } from "@/app/api/auth/mfa/verify/route";

// --- Account lockout mechanism (OWASP brute-force protection) ---
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

// Clean up stale entries every 30 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [email, attempt] of loginAttempts) {
      if (
        (attempt.lockedUntil && attempt.lockedUntil < now) ||
        (!attempt.lockedUntil && now - attempt.firstAttemptAt > LOCKOUT_WINDOW_MS)
      ) {
        loginAttempts.delete(email);
      }
    }
  }, 30 * 60 * 1000);
}

function checkLockout(email: string): { locked: boolean; minutesRemaining: number } {
  const attempt = loginAttempts.get(email.toLowerCase());
  if (!attempt) return { locked: false, minutesRemaining: 0 };

  const now = Date.now();

  // Check if currently locked
  if (attempt.lockedUntil && attempt.lockedUntil > now) {
    const minutesRemaining = Math.ceil((attempt.lockedUntil - now) / 60_000);
    return { locked: true, minutesRemaining };
  }

  // Reset if lockout has expired
  if (attempt.lockedUntil && attempt.lockedUntil <= now) {
    loginAttempts.delete(email.toLowerCase());
    return { locked: false, minutesRemaining: 0 };
  }

  return { locked: false, minutesRemaining: 0 };
}

function recordFailedAttempt(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt || now - attempt.firstAttemptAt > LOCKOUT_WINDOW_MS) {
    // Start new window
    loginAttempts.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null });
    return;
  }

  attempt.count++;
  if (attempt.count >= MAX_FAILED_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

function resetAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase());
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "auth/login", { limit: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });

  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    // Check account lockout before processing
    const lockout = checkLockout(email);
    if (lockout.locked) {
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${lockout.minutesRemaining} minute${lockout.minutesRemaining === 1 ? "" : "s"}.` },
        { status: 429 }
      );
    }

    // Demo mode — accept demo credentials (multiple users + generic demo login)
    if (isDemoMode) {
      const DEMO_PASSWORDS = ["Netcare2026!", "Demo2026!"];
      const validDemoLogins = [
        { email: "thirushen.pillay@netcare.co.za" },
        { email: "sara.nayager@netcare.co.za" },
        { email: "chris.mathew@netcare.co.za" },
        { email: "demo@netcare.co.za" },
        { email: "drrahul.gathiram@medicross.co.za" },
        { email: "cathelijn.zeijlemaker@netcare.co.za" },
        { email: "muhammad_simjee@a2d24.com" },
        { email: "travis.dewing@netcare.co.za" },
        { email: "gurshen@netcare.co.za" },
        { email: "matsie.mpshane@netcare.co.za" },
      ];
      // Accept any "demo@*" email with a valid demo password (for white-label brands)
      const isDemoEmail = email.toLowerCase().startsWith("demo@");
      const isKnownEmail = validDemoLogins.some(d => d.email === email.toLowerCase());
      const isValidPassword = DEMO_PASSWORDS.includes(password);
      const match = (isDemoEmail || isKnownEmail) && isValidPassword;
      if (!match) {
        recordFailedAttempt(email);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Look up the specific demo user or fall back to default (works for any demo@*.co.za)
      const matchedUser = demoUsers[email.toLowerCase()] || demoUser;

      resetAttempts(email);
      const { createSession } = await import("@/lib/auth");
      await createSession(matchedUser.id);
      return NextResponse.json({ user: { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role } });
    }

    const { createSession } = await import("@/lib/auth");
    const bcrypt = (await import("bcryptjs")).default;

    const user = await db.getUserByEmail(email) as Record<string, unknown> | null;
    if (!user) {
      recordFailedAttempt(email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      recordFailedAttempt(email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    resetAttempts(email);

    // Check if user has MFA enabled
    if (user.mfaEnabled && user.mfaSecret) {
      // Don't create a full session yet — issue a temp token for MFA verification
      const tempToken = crypto.randomBytes(32).toString("hex");
      storeTempToken(tempToken, user.id as string);
      return NextResponse.json({
        requiresMFA: true,
        tempToken,
      });
    }

    await createSession(user.id as string);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
