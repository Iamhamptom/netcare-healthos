import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";

// GET — List all rules for the practice (global + practice-specific)
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "rules", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const { data, error } = await supabaseAdmin
      .from("claims_rule")
      .select("*")
      .or(`practice_id.eq.,practice_id.eq.${auth.practiceId}`)
      .order("category", { ascending: true });

    if (error) throw error;

    const rules = (data || []).map(r => ({
      id: r.id,
      practiceId: r.practice_id,
      ruleCode: r.rule_code,
      name: r.name,
      description: r.description,
      severity: r.severity,
      enabled: r.enabled,
      category: r.category,
      metadata: r.metadata,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Rules error:", error);
    return NextResponse.json({ rules: [] });
  }
}

// POST — Create or update a rule
export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "rules/update", { limit: 20 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { ruleCode, name, description, severity, enabled, category, metadata } = body;

    if (!ruleCode || !name) {
      return NextResponse.json({ error: "ruleCode and name are required" }, { status: 400 });
    }

    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from("claims_rule")
      .select("id")
      .eq("practice_id", auth.practiceId)
      .eq("rule_code", ruleCode)
      .single();

    if (existing) {
      // Update
      const { error } = await supabaseAdmin
        .from("claims_rule")
        .update({
          name,
          description: description || "",
          severity: severity || "error",
          enabled: enabled !== false,
          metadata: metadata ? JSON.stringify(metadata) : "{}",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      // Create
      const { error } = await supabaseAdmin
        .from("claims_rule")
        .insert({
          practice_id: auth.practiceId,
          rule_code: ruleCode,
          name,
          description: description || "",
          severity: severity || "error",
          enabled: enabled !== false,
          category: category || "custom",
          metadata: metadata ? JSON.stringify(metadata) : "{}",
        });
      if (error) throw error;
    }

    return NextResponse.json({ saved: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Rule save error:", msg);
    return NextResponse.json({ error: `Failed to save rule: ${msg}` }, { status: 500 });
  }
}

// DELETE — Remove a practice-specific rule
export async function DELETE(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "rules/delete", { limit: 10 });
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const ruleCode = searchParams.get("ruleCode");
    if (!ruleCode) return NextResponse.json({ error: "ruleCode required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("claims_rule")
      .delete()
      .eq("practice_id", auth.practiceId)
      .eq("rule_code", ruleCode);

    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Rule delete error:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
