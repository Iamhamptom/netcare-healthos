import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getProvider } from "@/lib/accounting";

/** GET /api/accounting/connect?provider=sage|quickbooks|xero — Start OAuth flow */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "accounting-connect");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const providerName = url.searchParams.get("provider");

  if (!providerName || !["sage", "quickbooks", "xero"].includes(providerName)) {
    return NextResponse.json(
      { error: "Invalid provider. Supported: sage, quickbooks, xero" },
      { status: 400 },
    );
  }

  if (isDemoMode) {
    return NextResponse.json({
      url: `https://demo.healthops.co.za/oauth/authorize?provider=${providerName}&demo=true`,
    });
  }

  const provider = getProvider(providerName);
  const authUrl = provider.getAuthUrl(guard.practiceId);
  return NextResponse.json({ url: authUrl });
}
