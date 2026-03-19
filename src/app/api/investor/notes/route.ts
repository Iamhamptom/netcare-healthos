import { NextResponse } from "next/server";
import { guardInvestor, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

export async function GET(request: Request) {
  const guard = await guardInvestor(request, "investor-notes");
  if (isErrorResponse(guard)) return guard;

  const notes = await db.listInvestorNotes(guard.user.id);
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const guard = await guardInvestor(request, "investor-notes");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { content, section } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const note = await db.createInvestorNote({
    userId: guard.user.id,
    section: section || "general",
    content: content.trim(),
  });

  return NextResponse.json({ note });
}

export async function PATCH(request: Request) {
  const guard = await guardInvestor(request, "investor-notes");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { id, pinned } = body;

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  if (db.useSupabase) {
    await supabaseAdmin.from(tables.investorNotes).update({ pinned: pinned ?? false }).eq("id", id);
  } else {
    const { prisma } = await import("@/lib/prisma");
    await prisma.investorNote.update({ where: { id }, data: { pinned: pinned ?? false } });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const guard = await guardInvestor(request, "investor-notes");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
  }

  if (db.useSupabase) {
    await supabaseAdmin.from(tables.investorNotes).delete().eq("id", id);
  } else {
    const { prisma } = await import("@/lib/prisma");
    await prisma.investorNote.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
