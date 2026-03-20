import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

// GET: Get activity log for a specific team member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "team/[id]/activity", { roles: ["admin", "platform_admin"] });
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (isDemoMode) {
    const logs = demoStore.getAuditLogs(id);
    return NextResponse.json({ logs });
  }

  const { supabaseAdmin, tables } = await import("@/lib/supabase");
  const { data, error } = await supabaseAdmin
    .from(tables.auditLogs)
    .select("*")
    .eq("user_id", id)
    .eq("practice_id", guard.practiceId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 });
  }

  return NextResponse.json({ logs: data || [] });
}
