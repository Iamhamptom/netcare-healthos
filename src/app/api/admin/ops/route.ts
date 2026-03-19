import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-ops");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const documents = await db.listOpsDocuments(category || undefined) as Record<string, unknown>[];

  // Sort: pinned first, then by createdAt desc
  documents.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
  });

  return NextResponse.json({ documents, total: documents.length });
}

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-ops", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { category, title, content, metadata, pinned } = body;

  if (!category || !title || !content) {
    return NextResponse.json({ error: "category, title, and content are required" }, { status: 400 });
  }

  if (db.useSupabase) {
    const { data: document, error } = await supabaseAdmin.from(tables.opsDocuments).insert({
      category,
      title,
      content,
      metadata: metadata || "{}",
      pinned: pinned ?? false,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ document }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const document = await prisma.opsDocument.create({
    data: { category, title, content, metadata: metadata || "{}", pinned: pinned ?? false },
  });
  return NextResponse.json({ document }, { status: 201 });
}

export async function PATCH(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-ops", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (db.useSupabase) {
    // Convert camelCase keys to snake_case for Supabase
    const snakeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      snakeUpdates[snakeKey] = value;
    }
    snakeUpdates.updated_at = new Date().toISOString();
    const { data: document, error } = await supabaseAdmin.from(tables.opsDocuments).update(snakeUpdates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    return NextResponse.json({ document });
  }

  const { prisma } = await import("@/lib/prisma");
  const document = await prisma.opsDocument.update({ where: { id }, data: updates });
  return NextResponse.json({ document });
}

export async function DELETE(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-ops", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });

  if (db.useSupabase) {
    const { error } = await supabaseAdmin.from(tables.opsDocuments).delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.opsDocument.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
