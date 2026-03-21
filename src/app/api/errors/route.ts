import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { rateLimitByIp } from "@/lib/rate-limit";
import { captureError, getRecentErrors, getErrorStats } from "@/lib/error-tracking";

/** GET: Retrieve recent errors (platform admin only) */
export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "errors/list");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

  return NextResponse.json({
    errors: getRecentErrors(limit),
    stats: getErrorStats(),
  });
}

/** POST: Capture an error event from client-side */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "errors/capture", { limit: 50 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { message, stack, url, severity } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const event = captureError(
      stack ? Object.assign(new Error(message), { stack }) : message,
      {
        url: typeof url === "string" ? url : undefined,
        severity: ["error", "warning", "info"].includes(severity) ? severity : "error",
        metadata: body.metadata,
      }
    );

    return NextResponse.json({ captured: true, timestamp: event.timestamp });
  } catch {
    return NextResponse.json({ error: "Failed to capture error" }, { status: 500 });
  }
}
