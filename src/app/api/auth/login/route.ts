import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { demoUsers, demoUser } from "@/lib/demo-data";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "auth/login", { limit: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });

  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    // Demo mode — accept Netcare demo credentials (multiple users)
    if (isDemoMode) {
      const validDemoLogins = [
        { email: "thirushen.pillay@netcare.co.za", password: "Netcare2026!" },
        { email: "sara.nayager@netcare.co.za", password: "Netcare2026!" },
        { email: "chris.mathew@netcare.co.za", password: "Netcare2026!" },
        { email: "demo@netcare.co.za", password: "Netcare2026!" },
      ];
      const match = validDemoLogins.find(d => d.email === email.toLowerCase() && d.password === password);
      if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      // Look up the specific demo user or fall back to default
      const matchedUser = demoUsers[email.toLowerCase()] || demoUser;

      const { createSession } = await import("@/lib/auth");
      await createSession(matchedUser.id);
      return NextResponse.json({ user: { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role } });
    }

    const { createSession } = await import("@/lib/auth");
    const bcrypt = (await import("bcryptjs")).default;

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
