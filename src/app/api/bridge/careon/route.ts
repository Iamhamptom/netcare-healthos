// CareOn Bridge API — status, advisories, message log, webhook, audit
// GET: fetch bridge status, advisories, messages, connection, resolutions, audit, anomalies
// POST: receive HL7v2 messages from CareOn (webhook endpoint with HMAC/bearer auth)
// PATCH: resolve advisories with action + audit trail

import { NextResponse, NextRequest } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  getBridgeStats, getAdvisories, getMessageLog, getCareOnStatus,
  processHL7Message, processHL7MessageWithAI, resolveAdvisory,
  getResolutionStats, getTrafficAnomalies,
} from "@/lib/careon-bridge";
import { validateBridgeAuth, verifyWebhookSignature, deidentifyAdvisory, logBridgeAudit } from "@/lib/hl7/security";
import { fetchAuditLog } from "@/lib/hl7/bridge-store";
import type { AdvisorySeverity, AdvisoryCategory, AdvisoryAction } from "@/lib/hl7/types";

export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "bridge-careon");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "stats";

  // Log data access for POPIA compliance
  logBridgeAudit({
    action: `view_${view}`,
    userId: guard.user.id,
    userName: guard.user.name,
    userRole: guard.user.role,
    detail: `Accessed bridge ${view} view`,
  });

  try {
    switch (view) {
      case "stats":
        return NextResponse.json(await getBridgeStats());

      case "resolutions":
        return NextResponse.json(await getResolutionStats());

      case "advisories": {
        const severity = searchParams.get("severity") as AdvisorySeverity | null;
        const category = searchParams.get("category") as AdvisoryCategory | null;
        const facility = searchParams.get("facility");
        const limit = parseInt(searchParams.get("limit") ?? "50");
        const raw = await getAdvisories({
          severity: severity ?? undefined,
          category: category ?? undefined,
          facility: facility ?? undefined,
          limit,
        });
        // Apply de-identification based on user role
        const advisories = raw.map((a) => deidentifyAdvisory(a, guard.user.role));
        return NextResponse.json({ advisories });
      }

      case "messages":
        return NextResponse.json({
          messages: await getMessageLog(parseInt(searchParams.get("limit") ?? "50")),
        });

      case "connection":
        return NextResponse.json(getCareOnStatus());

      case "anomalies":
        return NextResponse.json({ anomalies: getTrafficAnomalies() });

      case "audit":
        return NextResponse.json({
          entries: await fetchAuditLog(parseInt(searchParams.get("limit") ?? "50")),
        });

      default:
        return NextResponse.json(
          { error: "Invalid view. Use: stats, advisories, messages, connection, resolutions, anomalies, audit" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("CareOn Bridge API error:", err);
    return NextResponse.json({ error: "Failed to fetch bridge data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Webhook endpoint for CareOn HL7v2 messages
  // Supports HMAC-SHA256 (preferred) and Bearer token authentication
  const authResult = validateBridgeAuth(request.headers);

  if (!authResult.valid) {
    logBridgeAudit({
      action: "webhook_auth_failed",
      userId: "system",
      userName: "CareOn Bridge",
      userRole: "system",
      detail: `Authentication failed: ${authResult.error}. Method: ${authResult.method}`,
    });
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let rawHL7: string;

    if (contentType.includes("x-application/hl7-v2+er7") || contentType.includes("text/plain")) {
      rawHL7 = await request.text();
    } else {
      const body = await request.json();
      rawHL7 = body.message;
    }

    if (!rawHL7) {
      return NextResponse.json({ error: "No HL7 message provided" }, { status: 400 });
    }

    // If HMAC auth was used, verify the signature against the actual payload
    if (authResult.method === "hmac_pending_verify") {
      const hmacSig = request.headers.get("x-careon-hmac-sha256");
      const hmacSecret = process.env.CAREON_HMAC_SECRET!;
      if (!verifyWebhookSignature(rawHL7, hmacSig, hmacSecret)) {
        logBridgeAudit({
          action: "webhook_hmac_invalid",
          userId: "system",
          userName: "CareOn Bridge",
          userRole: "system",
          detail: "HMAC signature verification failed against payload",
        });
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    // Use AI-enhanced processing if Gemini key is available, otherwise fall back to rule-based
    const useAI = !!process.env.GEMINI_API_KEY;
    const searchParams = new URL(request.url).searchParams;
    const forceAI = searchParams.get("ai") === "true";

    let result;
    if (useAI || forceAI) {
      const aiResult = await processHL7MessageWithAI(rawHL7);
      result = {
        ack: aiResult.ack,
        advisoriesGenerated: aiResult.advisories.length,
        advisories: aiResult.enhanced.length > 0 ? aiResult.enhanced : aiResult.advisories,
        logEntry: aiResult.logEntry,
        aiEnhanced: aiResult.enhanced.length > 0,
      };
    } else {
      const baseResult = processHL7Message(rawHL7);
      result = {
        ack: baseResult.ack,
        advisoriesGenerated: baseResult.advisories.length,
        advisories: baseResult.advisories,
        logEntry: baseResult.logEntry,
        aiEnhanced: false,
      };
    }

    logBridgeAudit({
      action: "webhook_processed",
      userId: "system",
      userName: "CareOn Bridge",
      userRole: "system",
      detail: `Processed HL7 message. ${result.advisoriesGenerated} advisories generated. AI: ${result.aiEnhanced}. Auth: ${authResult.method}`,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("CareOn Bridge webhook error:", err);
    return NextResponse.json({ error: "Failed to process HL7 message" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await guardRoute(request, "bridge-careon-resolve");
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { advisoryId, action, notes } = body as {
      advisoryId: string;
      action: AdvisoryAction;
      notes?: string;
    };

    if (!advisoryId || !action) {
      return NextResponse.json({ error: "advisoryId and action are required" }, { status: 400 });
    }

    const validActions: AdvisoryAction[] = ["resolve", "generate_claim", "notify_doctor", "dismiss"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Use: ${validActions.join(", ")}` }, { status: 400 });
    }

    const result = await resolveAdvisory(advisoryId, action, guard.user.name, notes);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      advisory: result.advisory,
      message: ACTION_MESSAGES[action],
    });
  } catch (err) {
    console.error("CareOn Bridge resolve error:", err);
    return NextResponse.json({ error: "Failed to resolve advisory" }, { status: 500 });
  }
}

const ACTION_MESSAGES: Record<AdvisoryAction, string> = {
  resolve: "Advisory marked as resolved. Audit trail created.",
  generate_claim: "Claim draft generated and linked to advisory.",
  notify_doctor: "Notification sent to attending physician.",
  dismiss: "Advisory dismissed.",
};
