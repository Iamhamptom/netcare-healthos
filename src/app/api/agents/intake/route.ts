export const maxDuration = 60;
import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/agents/intake — AI pre-appointment intake */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "agents-intake", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const message = String(body.message || "").trim();
  const patientName = String(body.patientName || "Patient");
  const history = (body.history || []) as { role: string; content: string }[];

  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });

  if (isDemoMode || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here") {
    return NextResponse.json(mockIntake(message, patientName, history.length));
  }

  try {
    const { runIntake } = await import("@/lib/agents");
    const result = await runIntake(message, patientName, history);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function mockIntake(message: string, patientName: string, step: number) {
  const firstName = patientName.split(" ")[0];

  const questions = [
    `Hi ${firstName}! Before your appointment, I need to collect a few details. What brings you in today — what's your main concern?`,
    `Thanks for sharing that. On a scale of 1-10, how would you rate any pain or discomfort you're experiencing right now?`,
    `Got it. Have there been any changes to your medications since your last visit?`,
    `Do you have any allergies we should be aware of? Including food, medications, and latex.`,
    `Last question — any recent symptoms like fever, cough, or feeling unwell in the past few days?`,
    `Perfect, ${firstName}! We've got all we need. Dr. Mitchell will review your details before your appointment. See you soon!`,
  ];

  const questionIdx = Math.min(step, questions.length - 1);

  return {
    agent: "intake",
    response: questions[questionIdx],
    actions: [],
    confidence: 0.85,
    escalate: false,
    complete: questionIdx >= questions.length - 1,
    step: questionIdx + 1,
    totalSteps: questions.length,
  };
}
