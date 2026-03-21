import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendSignupAlerts } from "@/lib/signup-alerts";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  // Rate limit registration — 5 per minute per IP
  const rl = await rateLimitByIp(request, "auth/register", { limit: 5 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  try {
    const { createSession } = await import("@/lib/auth");
    const bcrypt = (await import("bcryptjs")).default;

    const { name, email, password } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: "All fields required" }, { status: 400 });
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters with 1 uppercase and 1 number" }, { status: 400 });
    }
    if (!email.includes("@") || !email.includes(".")) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    const existing = await db.getUserByEmail(email);
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({ name, email, passwordHash }) as Record<string, unknown>;
    await createSession(user.id as string);

    // Notify Dr. Hampton — fire and forget (won't block response)
    sendSignupAlerts({ name: user.name as string, email: user.email as string, userId: user.id as string });

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
