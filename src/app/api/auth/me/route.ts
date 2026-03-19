import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { getSession } = await import("@/lib/auth");

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

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
