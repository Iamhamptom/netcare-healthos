import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit — 5 per minute per IP
  const rl = await rateLimitByIp(request, "gp/register", { limit: 5 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  if (isDemoMode) {
    const body = await request.json();
    return NextResponse.json({
      user: { id: "demo-gp", name: body.name, email: body.email, role: "gp_referrer" },
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const { createSession } = await import("@/lib/auth");
    const bcrypt = (await import("bcryptjs")).default;

    const body = await request.json();
    const { name, practiceName, hpcsaNumber, email, phone, areasOfPractice, password } = body;

    // Validation
    if (!name || !practiceName || !hpcsaNumber || !email || !phone || !password) {
      return NextResponse.json({ error: "All required fields must be completed." }, { status: 400 });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    // Create a practice for the GP (free tier)
    const practice = await prisma.practice.create({
      data: {
        name: practiceName,
        type: "gp",
        phone: phone,
        plan: "gp_referrer",
        planStatus: "active", // free tier is always active
        tagline: `HPCSA: ${hpcsaNumber}`,
      },
    });

    // Create user with gp_referrer role
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "gp_referrer",
        practiceId: practice.id,
      },
    });

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        practiceId: practice.id,
      },
    });
  } catch (err) {
    console.error("GP registration error:", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
