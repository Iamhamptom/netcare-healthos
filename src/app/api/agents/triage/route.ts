import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/agents/triage — AI triage assessment */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "agents-triage", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const message = String(body.message || "").trim();
  const patientName = String(body.patientName || "Patient");

  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });

  if (isDemoMode || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    return NextResponse.json(mockTriage(message, patientName));
  }

  try {
    const { triageMessage } = await import("@/lib/agents");
    const result = await triageMessage(message, patientName);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function mockTriage(message: string, patientName: string) {
  const lower = message.toLowerCase();
  const firstName = patientName.split(" ")[0];

  if (lower.includes("chest") || lower.includes("breathing") || lower.includes("unconscious") || lower.includes("bleeding")) {
    return {
      agent: "triage",
      response: `EMERGENCY: ${firstName}, please call emergency services (10177) or go to the nearest ER immediately. Do not wait.`,
      actions: [{ type: "flag_urgent", data: { urgency: "EMERGENCY" } }, { type: "notify_staff", data: { message: `EMERGENCY triage for ${patientName}` } }],
      urgency: "EMERGENCY",
      confidence: 0.95,
      escalate: true,
    };
  }
  if (lower.includes("severe pain") || lower.includes("fever") || lower.includes("swelling") || lower.includes("infection")) {
    return {
      agent: "triage",
      response: `${firstName}, this sounds urgent. We recommend a same-day appointment. Please call us at +27 11 783 4500 so we can fit you in today.`,
      actions: [{ type: "flag_urgent", data: { urgency: "URGENT" } }],
      urgency: "URGENT",
      confidence: 0.85,
      escalate: true,
    };
  }
  if (lower.includes("pain") || lower.includes("ache") || lower.includes("sensitive")) {
    return {
      agent: "triage",
      response: `${firstName}, we should see you within 24-48 hours. Take an anti-inflammatory in the meantime. Shall I check available slots?`,
      actions: [],
      urgency: "SEMI-URGENT",
      confidence: 0.80,
      escalate: false,
    };
  }
  return {
    agent: "triage",
    response: `Thanks ${firstName}! This sounds like a routine enquiry. Would you like to book an appointment at your convenience?`,
    actions: [],
    urgency: "ROUTINE",
    confidence: 0.90,
    escalate: false,
  };
}
