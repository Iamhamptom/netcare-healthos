import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getGmailAuthUrl } from "@/lib/gmail";

/** GET /api/gmail/connect — Start Gmail OAuth flow */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "gmail-connect");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      url: "https://accounts.google.com/o/oauth2/v2/auth?demo=true",
    });
  }

  const url = getGmailAuthUrl(guard.practiceId);
  return NextResponse.json({ url });
}
