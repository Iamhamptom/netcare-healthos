import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoUser } from "@/lib/demo-data";
import { db } from "@/lib/db";

export async function GET() {
  const { getSession } = await import("@/lib/auth");

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Demo mode — return Netcare demo user with practice branding
  if (isDemoMode) {
    return NextResponse.json({
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        practice: demoUser.practice,
      },
    });
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Fetch practice if user has one
  let practice = null;
  if (user.practiceId) {
    practice = await db.getPractice(user.practiceId as string);
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, practice },
  });
}
