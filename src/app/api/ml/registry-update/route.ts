import { NextResponse } from "next/server";
import { checkForUpdates, getRegistryHealth } from "@/lib/claims/registry-updater";
import { getRegistryStats } from "@/lib/claims/registry-lookup";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = checkForUpdates();
    const health = getRegistryHealth();
    const stats = getRegistryStats();

    return NextResponse.json({
      status: "complete",
      registry: { ...stats, health },
      updates: {
        checksPerformed: updates.checksPerformed,
        proposalsGenerated: updates.proposalsGenerated.length,
        proposals: updates.proposalsGenerated,
        sourcesChecked: updates.sourcesChecked,
      },
      schedule: {
        lastChecked: updates.lastChecked,
        nextCheck: updates.nextCheck,
        frequency: "weekly",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Check failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "health") {
      return NextResponse.json(getRegistryHealth());
    }
    if (body.action === "check") {
      return NextResponse.json(checkForUpdates());
    }
    return NextResponse.json({ actions: ["health", "check"] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
