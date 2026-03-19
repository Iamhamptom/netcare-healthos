import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { exchangeGmailCode, parseIntegrations } from "@/lib/gmail";

/** GET /api/gmail/callback — OAuth2 callback from Google */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const practiceId = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/settings`;

  if (error) {
    return NextResponse.redirect(`${settingsUrl}?tab=integrations&error=${encodeURIComponent(error)}`);
  }

  if (!code || !practiceId) {
    return NextResponse.redirect(`${settingsUrl}?tab=integrations&error=missing_params`);
  }

  if (isDemoMode) {
    return NextResponse.redirect(`${settingsUrl}?tab=integrations&connected=gmail`);
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeGmailCode(code);

    // Fetch the user's email address via userinfo
    let gmailEmail = "";
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json();
        gmailEmail = userInfo.email ?? "";
      }
    } catch {
      // Non-critical — we can proceed without the email
    }

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Load and update the practice's integrations field
    const { prisma } = await import("@/lib/prisma");
    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      select: { integrations: true },
    });

    const integrations = parseIntegrations(practice?.integrations ?? "{}");

    const updated = {
      ...integrations,
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token,
      gmailEmail,
      gmailConnectedAt: new Date().toISOString(),
      gmailTokenExpiry: tokenExpiry,
    };

    await prisma.practice.update({
      where: { id: practiceId },
      data: { integrations: JSON.stringify(updated) },
    });

    return NextResponse.redirect(`${settingsUrl}?tab=integrations&connected=gmail`);
  } catch (err) {
    console.error("[gmail/callback] Error:", err);
    return NextResponse.redirect(
      `${settingsUrl}?tab=integrations&error=${encodeURIComponent("Failed to connect Gmail")}`,
    );
  }
}
