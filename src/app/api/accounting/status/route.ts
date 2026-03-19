import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { parseIntegrations, getAccountingConfig } from "@/lib/accounting";

/** GET /api/accounting/status — Check accounting integration status */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "accounting-status");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      connected: true,
      provider: "sage",
      connectedAt: "2026-03-01T10:00:00Z",
      lastSync: "2026-03-10T14:30:00Z",
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    select: { integrations: true },
  });

  const integrations = parseIntegrations(practice?.integrations);
  const config = getAccountingConfig(integrations);

  if (!config?.provider || !config.accessToken) {
    return NextResponse.json({ connected: false, provider: null });
  }

  return NextResponse.json({
    connected: true,
    provider: config.provider,
    connectedAt: config.connectedAt ?? null,
    lastSync: config.lastSyncAt ?? null,
  });
}
