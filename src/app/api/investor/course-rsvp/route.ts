import { NextResponse } from "next/server";
import { guardInvestor, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";

// In-memory store for demo mode
const demoRsvps: Array<{
  id: string;
  courseId: string;
  name: string;
  email: string;
  userId: string;
  createdAt: string;
}> = [];

export async function POST(request: Request) {
  const guard = await guardInvestor(request, "investor-course-rsvp");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { courseId, name, email } = body;

  if (!courseId || !name || !email) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const rsvp = {
    id: `rsvp-${Date.now()}`,
    courseId,
    name: name.trim(),
    email: email.trim(),
    userId: guard.user.id,
    createdAt: new Date().toISOString(),
  };

  if (isDemoMode) {
    demoRsvps.push(rsvp);
  } else {
    // Store as an investor note with section "course-rsvp"
    const { prisma } = await import("@/lib/prisma");
    await prisma.investorNote.create({
      data: {
        userId: guard.user.id,
        section: `course-rsvp:${courseId}`,
        content: JSON.stringify({ name, email, courseId, rsvpAt: rsvp.createdAt }),
      },
    });
  }

  return NextResponse.json({ ok: true, rsvp });
}

export async function GET(request: Request) {
  const guard = await guardInvestor(request, "investor-course-rsvp");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ rsvps: demoRsvps.filter((r) => r.userId === guard.user.id) });
  }

  const { prisma } = await import("@/lib/prisma");
  const notes = await prisma.investorNote.findMany({
    where: { userId: guard.user.id, section: { startsWith: "course-rsvp:" } },
  });

  const rsvps = notes.map((n) => {
    const data = JSON.parse(n.content);
    return { id: n.id, ...data };
  });

  return NextResponse.json({ rsvps });
}
