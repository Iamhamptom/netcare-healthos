import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { getProvider, parseIntegrations } from "@/lib/accounting";

/** GET /api/accounting/callback — OAuth2 callback from accounting provider */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const realmId = url.searchParams.get("realmId"); // QuickBooks passes this

  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/settings`;

  if (error) {
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=${encodeURIComponent(error)}`,
    );
  }

  // Parse state JSON (URL-encoded by getAuthUrl)
  let practiceId = "";
  let providerName = "";
  try {
    const state = JSON.parse(decodeURIComponent(stateRaw ?? ""));
    practiceId = state.practiceId ?? "";
    providerName = state.provider ?? "";
  } catch {
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=invalid_state`,
    );
  }

  if (!code || !practiceId || !providerName) {
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=missing_params`,
    );
  }

  if (!["sage", "quickbooks", "xero"].includes(providerName)) {
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=unknown_provider`,
    );
  }

  if (isDemoMode) {
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&connected=${providerName}`,
    );
  }

  try {
    const provider = getProvider(providerName);
    const tokens = await provider.exchangeCode(code, { realmId: realmId ?? undefined });

    // Load and update the practice's integrations field
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      select: { integrations: true },
    });

    const integrations = parseIntegrations(practice?.integrations ?? "{}");

    const updated = {
      ...integrations,
      accounting: {
        provider: providerName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? "",
        realmId: tokens.realmId ?? "",
        tenantId: tokens.tenantId ?? "",
        companyId: tokens.companyId ?? "",
        connectedAt: new Date().toISOString(),
        lastSyncAt: null,
      },
    };

    await prisma.practice.update({
      where: { id: practiceId },
      data: { integrations: JSON.stringify(updated) },
    });

    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&connected=${providerName}`,
    );
  } catch (err) {
    console.error("[accounting/callback] Error:", err);
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=${encodeURIComponent("Failed to connect accounting provider")}`,
    );
  }
}
