import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { db } from "@/lib/db";
import {
  exchangeCodeForTokens,
  getMicrosoftUserProfile,
  parseIntegrations,
} from "@/lib/microsoft";
import { logger } from "@/lib/logger";

/** GET /api/microsoft/callback — Handles OAuth callback from Microsoft */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const practiceId = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/settings/microsoft`;

  if (error) {
    logger.warn("[microsoft] OAuth error returned", { error, errorDescription: errorDescription ?? "" });
    return NextResponse.redirect(
      `${settingsUrl}?error=${encodeURIComponent(errorDescription || error)}`,
    );
  }

  if (!code || !practiceId) {
    return NextResponse.redirect(
      `${settingsUrl}?error=missing_params`,
    );
  }

  if (isDemoMode) {
    return NextResponse.redirect(
      `${settingsUrl}?connected=microsoft`,
    );
  }

  if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${settingsUrl}?error=${encodeURIComponent("Microsoft 365 not configured")}`,
    );
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    logger.info("[microsoft] Token exchange successful", { practiceId });

    // Fetch user profile
    const profile = await getMicrosoftUserProfile(tokens.access_token);
    const email = profile.mail || profile.userPrincipalName;

    // Store tokens in the practice's integrations JSON
    const practice = await db.getPractice(practiceId) as Record<string, unknown> | null;

    const integrations = parseIntegrations((practice?.integrations as string) ?? "{}");

    const updated = {
      ...integrations,
      microsoftAccessToken: tokens.access_token,
      microsoftRefreshToken: tokens.refresh_token,
      microsoftEmail: email,
      microsoftDisplayName: profile.displayName,
      microsoftConnectedAt: new Date().toISOString(),
      microsoftTokenExpiry: new Date(
        Date.now() + tokens.expires_in * 1000,
      ).toISOString(),
      microsoftCalendarSync: true,
      microsoftTeamsNotifications: true,
    };

    await db.updatePractice(practiceId, { integrations: JSON.stringify(updated) });

    logger.info("[microsoft] Connected successfully", {
      practiceId,
      email,
    });

    return NextResponse.redirect(
      `${settingsUrl}?connected=microsoft`,
    );
  } catch (err) {
    logger.error("[microsoft] Callback error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.redirect(
      `${settingsUrl}?error=${encodeURIComponent("Failed to connect Microsoft 365")}`,
    );
  }
}
