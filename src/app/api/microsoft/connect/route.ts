import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { getMicrosoftAuthUrl } from "@/lib/microsoft";
import { logger } from "@/lib/logger";

/** GET /api/microsoft/connect — Redirects to Microsoft OAuth consent page */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "microsoft-connect", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    if (isDemoMode) {
      return NextResponse.json({
        url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?demo=true`,
        demo: true,
      });
    }

    if (!process.env.MICROSOFT_CLIENT_ID) {
      return NextResponse.json(
        { error: "Microsoft 365 not configured. Contact your administrator to set up Microsoft integration." },
        { status: 501 },
      );
    }

    const authUrl = getMicrosoftAuthUrl(guard.practiceId);
    logger.info("[microsoft] OAuth flow started", { practiceId: guard.practiceId });

    return NextResponse.redirect(authUrl);
  } catch (err) {
    logger.error("[microsoft] Failed to start OAuth flow", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to initiate Microsoft OAuth flow" },
      { status: 500 },
    );
  }
}
