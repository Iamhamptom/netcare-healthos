import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  // Rate limit login attempts — 10 per minute per IP
  const rl = rateLimitByIp(request, "auth/login", { limit: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });

  try {
    const { createSession } = await import("@/lib/auth");
    const bcrypt = (await import("bcryptjs")).default;

    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const user = await db.getUserByEmail(email) as Record<string, unknown> | null;
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    await createSession(user.id as string);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
