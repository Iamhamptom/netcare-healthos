import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { demoUsers, demoUser } from "@/lib/demo-data";
import { db } from "@/lib/db";

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
  const rl = rateLimitByIp(request, "auth/login", { limit: 10 });
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

    // Demo mode — accept Netcare demo credentials (multiple users)
    if (isDemoMode) {
      const validDemoLogins = [
        { email: "thirushen.pillay@netcare.co.za", password: "Netcare2026!" },
        { email: "sara.nayager@netcare.co.za", password: "Netcare2026!" },
        { email: "chris.mathew@netcare.co.za", password: "Netcare2026!" },
        { email: "demo@netcare.co.za", password: "Netcare2026!" },
      ];
      const match = validDemoLogins.find(d => d.email === email.toLowerCase() && d.password === password);
      if (!match) {
        recordFailedAttempt(email);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Look up the specific demo user or fall back to default
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
    await createSession(user.id as string);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
