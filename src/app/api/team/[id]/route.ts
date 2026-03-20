import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

// GET: Get individual team member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "team/[id]", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (isDemoMode) {
    const member = demoStore.getTeamMember(id);
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ member });
  }

  const { supabaseAdmin, tables } = await import("@/lib/supabase");
  const { data, error } = await supabaseAdmin
    .from(tables.users)
    .select("*")
    .eq("id", id)
    .eq("practice_id", guard.practiceId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ member: data });
}

// PATCH: Update individual team member
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "team/[id]", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  try {
    const body = await request.json();
    const { role, status, name } = body;

    if (isDemoMode) {
      const updates: Record<string, unknown> = {};
      if (role) updates.role = role;
      if (status) updates.status = status;
      if (name) updates.name = name;

      const member = demoStore.updateTeamMember(id, updates);
      if (!member) {
        return NextResponse.json({ error: "Team member not found" }, { status: 404 });
      }

      demoStore.addAuditLog({
        action: "team_member_update",
        details: `Updated ${member.name}: ${Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(", ")}`,
        userId: guard.user.id,
        userName: guard.user.name,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      });

      return NextResponse.json({ member });
    }

    const { supabaseAdmin, tables } = await import("@/lib/supabase");
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (name) updates.name = name;

    const { data, error } = await supabaseAdmin
      .from(tables.users)
      .update(updates)
      .eq("id", id)
      .eq("practice_id", guard.practiceId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
    }

    return NextResponse.json({ member: data });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// DELETE: Soft-delete individual team member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "team/[id]", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  // Prevent self-deletion
  if (id === guard.user.id) {
    return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
  }

  if (isDemoMode) {
    const member = demoStore.deleteTeamMember(id);
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    demoStore.addAuditLog({
      action: "team_member_deactivate",
      details: `Deactivated ${member.name} (${member.email})`,
      userId: guard.user.id,
      userName: guard.user.name,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    });

    return NextResponse.json({ message: "Team member deactivated" });
  }

  const { supabaseAdmin, tables } = await import("@/lib/supabase");
  const { error } = await supabaseAdmin
    .from(tables.users)
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("practice_id", guard.practiceId);

  if (error) {
    return NextResponse.json({ error: "Failed to deactivate team member" }, { status: 500 });
  }

  return NextResponse.json({ message: "Team member deactivated" });
}
