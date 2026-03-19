import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "daily-tasks");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    const tasks = demoStore.getDailyTasks();
    const morning = tasks.filter(t => t.category === "morning");
    const duringDay = tasks.filter(t => t.category === "during_day");
    const endOfDay = tasks.filter(t => t.category === "end_of_day");
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return NextResponse.json({
      tasks: { morning, duringDay, endOfDay },
      progress: { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 },
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks = await prisma.dailyTask.findMany({
    where: { practiceId: guard.practiceId, date: { gte: today } },
    orderBy: { sortOrder: "asc" },
  });
  const morning = tasks.filter(t => t.category === "morning");
  const duringDay = tasks.filter(t => t.category === "during_day");
  const endOfDay = tasks.filter(t => t.category === "end_of_day");
  const completed = tasks.filter(t => t.completed).length;

  return NextResponse.json({
    tasks: { morning, duringDay, endOfDay },
    progress: { completed, total: tasks.length, percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0 },
  });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "daily-tasks");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (isDemoMode) {
    const task = demoStore.addDailyTask({
      title: sanitize(body.title),
      category: body.category || "during_day",
      isRecurring: body.isRecurring !== false,
    });
    return NextResponse.json({ task }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const count = await prisma.dailyTask.count({ where: { practiceId: guard.practiceId } });
  const task = await prisma.dailyTask.create({
    data: {
      title: sanitize(body.title),
      category: body.category || "during_day",
      isRecurring: body.isRecurring !== false,
      sortOrder: count + 1,
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(request: Request) {
  const guard = await guardRoute(request, "daily-tasks");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  if (isDemoMode) {
    const task = demoStore.toggleDailyTask(body.id, "Reception");
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.dailyTask.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.dailyTask.update({
    where: { id: body.id },
    data: {
      completed: !existing.completed,
      completedBy: !existing.completed ? (body.completedBy || "Staff") : "",
      completedAt: !existing.completed ? new Date() : null,
    },
  });
  return NextResponse.json({ task });
}

export async function DELETE(request: Request) {
  const guard = await guardRoute(request, "daily-tasks");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (isDemoMode) {
    demoStore.deleteDailyTask(id);
    return NextResponse.json({ success: true });
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.dailyTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
