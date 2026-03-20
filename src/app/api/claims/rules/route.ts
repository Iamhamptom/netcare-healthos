import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";

// GET — List all rules for the practice (global + practice-specific)
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "rules", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const { prisma } = await import("@/lib/prisma");
    const rules = await prisma.claimsRule.findMany({
      where: {
        OR: [
          { practiceId: "" },              // Global rules
          { practiceId: auth.practiceId }, // Practice-specific
        ],
      },
      orderBy: [{ category: "asc" }, { ruleCode: "asc" }],
    });

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

    const { prisma } = await import("@/lib/prisma");
    const rule = await prisma.claimsRule.upsert({
      where: {
        practiceId_ruleCode: {
          practiceId: auth.practiceId,
          ruleCode,
        },
      },
      create: {
        practiceId: auth.practiceId,
        ruleCode,
        name,
        description: description || "",
        severity: severity || "error",
        enabled: enabled !== false,
        category: category || "custom",
        metadata: metadata ? JSON.stringify(metadata) : "{}",
      },
      update: {
        name,
        description: description || undefined,
        severity: severity || undefined,
        enabled: enabled !== undefined ? enabled : undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    return NextResponse.json({ rule, saved: true });
  } catch (error) {
    console.error("Rule save error:", error);
    return NextResponse.json({ error: "Failed to save rule" }, { status: 500 });
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

    const { prisma } = await import("@/lib/prisma");
    await prisma.claimsRule.deleteMany({
      where: { practiceId: auth.practiceId, ruleCode },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Rule delete error:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
