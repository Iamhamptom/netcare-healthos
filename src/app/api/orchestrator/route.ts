import { NextRequest, NextResponse } from "next/server";
import {
  runWorkflow,
  patientIntakePipeline,
  claimsReviewPipeline,
  emergencyTriagePipeline,
  getPendingApprovals,
  resolveApproval,
  type StepConfig,
} from "@/lib/ai/orchestrator";

/**
 * POST /api/orchestrator — Run a multi-agent workflow
 *
 * Body: {
 *   workflow: "intake" | "claims" | "emergency" | "custom",
 *   message: string,
 *   context?: { patientName, practiceType, practiceId, isDemoMode },
 *   steps?: StepConfig[]  // only for "custom" workflow
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow: workflowType, message, context, steps } = body;

    if (!workflowType || !message) {
      return NextResponse.json({ error: "workflow and message required" }, { status: 400 });
    }

    let pipelineSteps: StepConfig[];
    let name: string;

    switch (workflowType) {
      case "intake":
        pipelineSteps = patientIntakePipeline(message);
        name = "Patient Intake Pipeline";
        break;
      case "claims":
        pipelineSteps = claimsReviewPipeline(message);
        name = "Claims Review Pipeline";
        break;
      case "emergency":
        pipelineSteps = emergencyTriagePipeline(message);
        name = "Emergency Triage Pipeline";
        break;
      case "custom":
        if (!steps || !Array.isArray(steps)) {
          return NextResponse.json({ error: "custom workflow requires steps array" }, { status: 400 });
        }
        pipelineSteps = steps;
        name = "Custom Workflow";
        break;
      default:
        return NextResponse.json({ error: "Unknown workflow: " + workflowType }, { status: 400 });
    }

    const result = await runWorkflow(name, pipelineSteps, {
      patientName: context?.patientName,
      practiceType: context?.practiceType,
      practiceId: context?.practiceId,
      isDemoMode: context?.isDemoMode ?? true,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Orchestration failed" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/orchestrator — List pending approvals
 */
export async function GET() {
  const pending = getPendingApprovals();
  return NextResponse.json({
    pendingApprovals: pending.map((p) => ({
      workflowId: p.workflowId,
      stepIndex: p.stepIndex,
      description: p.description,
      approver: p.approver,
      createdAt: p.createdAt,
      previousConfidence: p.previousStepResult?.confidence,
    })),
  });
}

/**
 * PATCH /api/orchestrator — Resolve an approval
 *
 * Body: { workflowId, stepIndex, approved: boolean, note?, approvedBy? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflowId, stepIndex, approved, note, approvedBy } = body;

    if (!workflowId || stepIndex === undefined || approved === undefined) {
      return NextResponse.json({ error: "workflowId, stepIndex, and approved required" }, { status: 400 });
    }

    const resolved = resolveApproval(workflowId, stepIndex, { approved, note, approvedBy });

    if (!resolved) {
      return NextResponse.json({ error: "No pending approval found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to resolve approval" },
      { status: 500 },
    );
  }
}
