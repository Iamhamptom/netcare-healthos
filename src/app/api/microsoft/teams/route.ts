import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeamsNotificationBody {
  title: string;
  severity: "info" | "warning" | "critical";
  details: string;
  category?: "advisory" | "claim_rejection" | "system_alert" | "general";
  actionUrl?: string;
  actionLabel?: string;
  facts?: Array<{ name: string; value: string }>;
}

interface AdaptiveCard {
  type: string;
  attachments: Array<{
    contentType: string;
    content: Record<string, unknown>;
  }>;
}

// ---------------------------------------------------------------------------
// Severity config
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  info: "Good",
  warning: "Warning",
  critical: "Attention",
};

const SEVERITY_EMOJI: Record<string, string> = {
  info: "INFO",
  warning: "WARNING",
  critical: "CRITICAL",
};

// ---------------------------------------------------------------------------
// Adaptive Card builder
// ---------------------------------------------------------------------------

function buildAdaptiveCard(notification: TeamsNotificationBody): AdaptiveCard {
  const cardBody: Array<Record<string, unknown>> = [
    {
      type: "TextBlock",
      size: "Large",
      weight: "Bolder",
      text: notification.title,
      wrap: true,
    },
    {
      type: "ColumnSet",
      columns: [
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: `**Severity:** ${SEVERITY_EMOJI[notification.severity] || "INFO"}`,
              color: SEVERITY_COLORS[notification.severity] || "Default",
              weight: "Bolder",
              wrap: true,
            },
          ],
        },
        {
          type: "Column",
          width: "auto",
          items: [
            {
              type: "TextBlock",
              text: `**Category:** ${notification.category || "general"}`,
              wrap: true,
            },
          ],
        },
      ],
    },
    {
      type: "TextBlock",
      text: notification.details,
      wrap: true,
    },
  ];

  // Add facts table if provided
  if (notification.facts && notification.facts.length > 0) {
    cardBody.push({
      type: "FactSet",
      facts: notification.facts.map((f) => ({
        title: f.name,
        value: f.value,
      })),
    });
  }

  // Add timestamp
  cardBody.push({
    type: "TextBlock",
    text: `Sent: ${new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}`,
    size: "Small",
    isSubtle: true,
    wrap: true,
  });

  // Build actions
  const actions: Array<Record<string, unknown>> = [];
  if (notification.actionUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: notification.actionLabel || "View in Dashboard",
      url: notification.actionUrl,
    });
  }

  // Always add a link to the dashboard
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://netcare-healthos.vercel.app";
  actions.push({
    type: "Action.OpenUrl",
    title: "Open Health OS",
    url: `${dashboardUrl}/dashboard`,
  });

  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: cardBody,
          actions,
        },
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// POST — Send a Teams notification via Incoming Webhook
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const guard = await guardRoute(request, "microsoft-teams", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    const body: TeamsNotificationBody = await request.json();

    if (!body.title || !body.severity || !body.details) {
      return NextResponse.json(
        { error: "Missing required fields: title, severity, details" },
        { status: 400 },
      );
    }

    if (!["info", "warning", "critical"].includes(body.severity)) {
      return NextResponse.json(
        { error: "severity must be one of: info, warning, critical" },
        { status: 400 },
      );
    }

    if (isDemoMode || !process.env.TEAMS_WEBHOOK_URL) {
      logger.info("[teams] Demo mode — notification not sent", {
        title: body.title,
        severity: body.severity,
      });
      return NextResponse.json({
        sent: false,
        demo: true,
        card: buildAdaptiveCard(body),
        message: "Teams webhook not configured — notification logged only",
      });
    }

    const card = buildAdaptiveCard(body);

    const res = await fetch(process.env.TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logger.error("[teams] Webhook delivery failed", {
        status: String(res.status),
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to deliver Teams notification", status: res.status },
        { status: 502 },
      );
    }

    logger.info("[teams] Notification sent", {
      title: body.title,
      severity: body.severity,
      category: body.category ?? "general",
    });

    return NextResponse.json({
      sent: true,
      demo: false,
      title: body.title,
      severity: body.severity,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error("[teams] POST error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to send Teams notification" },
      { status: 500 },
    );
  }
}
