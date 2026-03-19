import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoUser, demoUsers } from "@/lib/demo-data";
import { db } from "@/lib/db";

export async function GET() {
  const { getSession } = await import("@/lib/auth");

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Demo mode — return the specific demo user based on session userId
  if (isDemoMode) {
    // Find which demo user matches the session
    const matchedUser = Object.values(demoUsers).find(u => u.id === session.userId) || demoUser;
    return NextResponse.json({
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        practice: matchedUser.practice,
      },
    });
  }

  const user = await db.getUserById(session.userId) as Record<string, unknown> | null;
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let practice = null;
  if (user.practiceId) {
    practice = await db.getPractice(user.practiceId as string);
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, practice },
  });
}
