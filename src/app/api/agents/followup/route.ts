export const maxDuration = 60;
import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/agents/followup — Generate AI follow-up messages */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "agents-followup", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const patientName = String(body.patientName || "");
  const appointmentType = String(body.appointmentType || "appointment");
  const daysSince = Number(body.daysSince || 1);

  if (!patientName) return NextResponse.json({ error: "Missing patientName" }, { status: 400 });

  if (isDemoMode || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    return NextResponse.json(mockFollowup(patientName, appointmentType, daysSince));
  }

  try {
    const { generateFollowup } = await import("@/lib/agents");
    const result = await generateFollowup(patientName, appointmentType, daysSince);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function mockFollowup(patientName: string, appointmentType: string, daysSince: number) {
  const firstName = patientName.split(" ")[0];

  if (daysSince <= 1) {
    return {
      agent: "followup",
      response: `Hi ${firstName}! Just checking in after your ${appointmentType} yesterday. How are you feeling? If you have any concerns, don't hesitate to call us at +27 11 783 4500. Take care!`,
      actions: [{ type: "send_reminder", data: { type: "post_procedure_24hr" } }],
      confidence: 0.90,
      escalate: false,
    };
  }
  if (daysSince <= 3) {
    return {
      agent: "followup",
      response: `Hi ${firstName}, it's been a few days since your ${appointmentType}. We hope you're recovering well! If you're experiencing any discomfort or have questions, please reach out. We're here for you.`,
      actions: [{ type: "send_reminder", data: { type: "post_procedure_72hr" } }],
      confidence: 0.90,
      escalate: false,
    };
  }
  return {
    agent: "followup",
    response: `Hi ${firstName}! It's been ${daysSince} days since your ${appointmentType}. Time for a follow-up check to make sure everything looks great. Shall we book you in? Reply YES or call +27 11 783 4500.`,
    actions: [{ type: "schedule_followup", data: { type: "routine_followup" } }],
    confidence: 0.85,
    escalate: false,
  };
}
