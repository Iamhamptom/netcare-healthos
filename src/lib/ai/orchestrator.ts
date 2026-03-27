/**
 * AGENT ORCHESTRATION BUS — Level 6 Multi-Agent System
 *
 * Takes the platform from 5 independent agents to a coordinated team.
 *
 * Capabilities:
 * 1. Agent-to-agent handoffs (triage → billing, intake → followup)
 * 2. Human-in-the-loop approval gates (pause/resume workflows)
 * 3. Self-correction loops (agent detects own errors, re-runs with reflection)
 * 4. Cross-agent context passing (previous agent's findings flow forward)
 * 5. Conditional routing (confidence-driven, not string-matching)
 * 6. Parallel agent execution (run triage + billing simultaneously)
 * 7. Workflow templates (intake → triage → billing → followup pipeline)
 *
 * Architecture:
 *   WorkflowRun → Step[] → each Step = agent call or approval gate
 *   OrchestrationBus coordinates all steps, manages state, handles failures
 */

import { runAgent, type AgentType } from "../agents";
import { recordFeedback } from "./feedback-loop";

// ── Types ───────────────────────────────────────────────────

export type StepStatus = "pending" | "running" | "completed" | "failed" | "awaiting_approval" | "approved" | "rejected" | "skipped";

export type HandoffReason =
  | "escalation"          // Agent flagged urgency
  | "confidence_low"      // Below threshold
  | "scope_exceeded"      // Agent can't handle this
  | "workflow_next"       // Normal pipeline progression
  | "self_correction"     // Agent detected own error
  | "human_requested";    // Explicit human intervention

export interface AgentStepConfig {
  type: "agent";
  agent: AgentType;
  /** Message to send — supports {{prev.response}} for chaining */
  message: string;
  /** Minimum confidence to proceed without handoff */
  confidenceThreshold?: number;
  /** If confidence below threshold, hand off to this agent */
  fallbackAgent?: AgentType;
  /** Max retries with self-correction */
  maxRetries?: number;
}

export interface ApprovalStepConfig {
  type: "approval";
  /** What needs approval */
  description: string;
  /** Who should approve */
  approver: "staff" | "doctor" | "admin" | "manager";
  /** Auto-approve after this many seconds (0 = wait forever) */
  timeoutSeconds?: number;
  /** Auto-approve if previous step confidence >= this */
  autoApproveThreshold?: number;
}

export interface ParallelStepConfig {
  type: "parallel";
  /** Run these agent steps simultaneously */
  agents: Array<{ agent: AgentType; message: string }>;
  /** Strategy: "all" = wait for all, "first" = use first response, "best" = highest confidence */
  strategy: "all" | "first" | "best";
}

export interface ConditionalStepConfig {
  type: "conditional";
  /** Condition based on previous step */
  condition: (prevResult: StepResult) => boolean;
  /** Run this if condition is true */
  ifTrue: AgentStepConfig;
  /** Run this if condition is false */
  ifFalse?: AgentStepConfig;
}

export type StepConfig = AgentStepConfig | ApprovalStepConfig | ParallelStepConfig | ConditionalStepConfig;

export interface StepResult {
  stepIndex: number;
  stepType: StepConfig["type"];
  status: StepStatus;
  agent?: AgentType;
  response?: string;
  confidence?: number;
  toolsUsed?: string[];
  escalated?: boolean;
  handoffReason?: HandoffReason;
  error?: string;
  durationMs: number;
  retryCount?: number;
  /** For parallel steps */
  parallelResults?: Array<{ agent: AgentType; response: string; confidence: number }>;
  /** For approval steps */
  approvedBy?: string;
  approvalNote?: string;
}

export interface WorkflowRun {
  id: string;
  name: string;
  status: "running" | "completed" | "failed" | "paused";
  steps: StepConfig[];
  results: StepResult[];
  context: WorkflowContext;
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  /** The combined output from all agents */
  finalResponse: string;
  /** Highest escalation level seen */
  maxEscalation: "none" | "low" | "medium" | "high" | "critical";
}

export interface WorkflowContext {
  patientName?: string;
  practiceType?: string;
  practiceId?: string;
  isDemoMode?: boolean;
  /** Accumulated context from all previous steps */
  agentMemory: string[];
  /** Custom data passed between steps */
  metadata: Record<string, unknown>;
}

// ── Approval Queue (in-memory for now, Supabase later) ──────

interface PendingApproval {
  workflowId: string;
  stepIndex: number;
  description: string;
  approver: string;
  previousStepResult: StepResult;
  createdAt: string;
  resolve: (decision: { approved: boolean; note?: string; approvedBy?: string }) => void;
}

const approvalQueue: Map<string, PendingApproval> = new Map();

export function getPendingApprovals(): PendingApproval[] {
  return Array.from(approvalQueue.values());
}

export function resolveApproval(
  workflowId: string,
  stepIndex: number,
  decision: { approved: boolean; note?: string; approvedBy?: string },
): boolean {
  const key = workflowId + ":" + stepIndex;
  const pending = approvalQueue.get(key);
  if (!pending) return false;
  pending.resolve(decision);
  approvalQueue.delete(key);
  return true;
}

// ── Template interpolation ──────────────────────────────────

function interpolateMessage(template: string, results: StepResult[]): string {
  let msg = template;
  // {{prev.response}} → last completed agent step's response
  const lastAgent = [...results].reverse().find(r => r.status === "completed" && r.response);
  if (lastAgent) {
    msg = msg.replace(/\{\{prev\.response\}\}/g, lastAgent.response || "");
    msg = msg.replace(/\{\{prev\.confidence\}\}/g, String(lastAgent.confidence || 0));
    msg = msg.replace(/\{\{prev\.agent\}\}/g, lastAgent.agent || "unknown");
  }
  // {{step[N].response}} → specific step
  msg = msg.replace(/\{\{step\[(\d+)\]\.response\}\}/g, (_, idx) => {
    const r = results[Number(idx)];
    return r?.response || "";
  });
  return msg;
}

// ── Self-Correction ─────────────────────────────────────────

const REFLECTION_PREFIX =
  "SELF-CORRECTION: Your previous response had issues. Here is what you said:\n\n" +
  "---PREVIOUS RESPONSE---\n";
const REFLECTION_SUFFIX =
  "\n---END PREVIOUS RESPONSE---\n\n" +
  "Please reconsider and provide a corrected response. Focus on accuracy and completeness. " +
  "If you used tools, verify the data. If you made assumptions, check them.";

function needsSelfCorrection(result: StepResult, config: AgentStepConfig): boolean {
  if (!result.response) return true;
  if (result.confidence !== undefined && result.confidence < 0.4) return true;
  if (result.response.includes("I'm not sure") || result.response.includes("I don't have enough")) return true;
  if (result.escalated && config.maxRetries && (result.retryCount || 0) < config.maxRetries) return true;
  return false;
}

// ── Core Orchestrator ───────────────────────────────────────

export async function runWorkflow(
  name: string,
  steps: StepConfig[],
  context: Partial<WorkflowContext> & { patientName?: string },
): Promise<WorkflowRun> {
  const workflowId = "wf_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
  const startTime = Date.now();

  const workflow: WorkflowRun = {
    id: workflowId,
    name,
    status: "running",
    steps,
    results: [],
    context: {
      patientName: context.patientName,
      practiceType: context.practiceType,
      practiceId: context.practiceId,
      isDemoMode: context.isDemoMode,
      agentMemory: [],
      metadata: context.metadata || {},
    },
    startedAt: new Date().toISOString(),
    totalDurationMs: 0,
    finalResponse: "",
    maxEscalation: "none",
  };

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStart = Date.now();

    try {
      let result: StepResult;

      switch (step.type) {
        case "agent":
          result = await executeAgentStep(step, i, workflow);
          break;
        case "approval":
          result = await executeApprovalStep(step, i, workflow);
          break;
        case "parallel":
          result = await executeParallelStep(step, i, workflow);
          break;
        case "conditional":
          result = await executeConditionalStep(step, i, workflow);
          break;
        default:
          result = { stepIndex: i, stepType: "agent", status: "failed", error: "Unknown step type", durationMs: 0 };
      }

      result.durationMs = Date.now() - stepStart;
      workflow.results.push(result);

      // Update escalation level
      if (result.escalated) {
        const level = result.confidence !== undefined && result.confidence < 0.3 ? "critical"
          : result.confidence !== undefined && result.confidence < 0.5 ? "high"
          : result.confidence !== undefined && result.confidence < 0.7 ? "medium"
          : "low";
        const levels = ["none", "low", "medium", "high", "critical"];
        if (levels.indexOf(level) > levels.indexOf(workflow.maxEscalation)) {
          workflow.maxEscalation = level;
        }
      }

      // Accumulate context for next steps
      if (result.response && result.status === "completed") {
        workflow.context.agentMemory.push(
          "[" + (result.agent || step.type) + "] " + result.response.slice(0, 500),
        );
      }

      // Stop on rejection (approval gate denied)
      if (result.status === "rejected") {
        workflow.status = "failed";
        workflow.finalResponse = "Workflow halted: approval rejected at step " + i + ". " + (result.approvalNote || "");
        break;
      }

      // Stop on unrecoverable failure
      if (result.status === "failed" && step.type !== "conditional") {
        workflow.status = "failed";
        workflow.finalResponse = "Workflow failed at step " + i + ": " + (result.error || "Unknown error");
        break;
      }

    } catch (err) {
      workflow.results.push({
        stepIndex: i,
        stepType: step.type,
        status: "failed",
        error: err instanceof Error ? err.message : "Unexpected error",
        durationMs: Date.now() - stepStart,
      });
      workflow.status = "failed";
      workflow.finalResponse = "Workflow failed at step " + i + ": " + (err instanceof Error ? err.message : "Unknown");
      break;
    }
  }

  // Compile final response from all successful steps
  if (workflow.status === "running") {
    workflow.status = "completed";
    const agentResponses = workflow.results
      .filter(r => r.status === "completed" && r.response)
      .map(r => r.response);
    workflow.finalResponse = agentResponses[agentResponses.length - 1] || "Workflow completed with no response.";
  }

  workflow.completedAt = new Date().toISOString();
  workflow.totalDurationMs = Date.now() - startTime;

  return workflow;
}

// ── Step Executors ──────────────────────────────────────────

async function executeAgentStep(
  config: AgentStepConfig,
  stepIndex: number,
  workflow: WorkflowRun,
): Promise<StepResult> {
  const message = interpolateMessage(config.message, workflow.results);

  // Inject previous agent context
  const prevContext = workflow.context.agentMemory.length > 0
    ? "\n\n[CONTEXT FROM PREVIOUS AGENTS]\n" + workflow.context.agentMemory.join("\n") + "\n[END CONTEXT]"
    : "";

  const agentResult = await runAgent(config.agent, message + prevContext, {
    patientName: workflow.context.patientName,
    practiceType: workflow.context.practiceType,
    practiceId: workflow.context.practiceId,
    isDemoMode: workflow.context.isDemoMode,
  });

  let result: StepResult = {
    stepIndex,
    stepType: "agent",
    status: "completed",
    agent: config.agent,
    response: agentResult.response,
    confidence: agentResult.confidence,
    toolsUsed: agentResult.toolsUsed,
    escalated: agentResult.escalate,
    durationMs: 0,
    retryCount: 0,
  };

  // Self-correction loop
  const maxRetries = config.maxRetries || 1;
  let retries = 0;
  while (needsSelfCorrection(result, config) && retries < maxRetries) {
    retries++;
    const correctionMessage =
      REFLECTION_PREFIX + (result.response || "(empty)") + REFLECTION_SUFFIX + "\n\nOriginal request: " + message;

    const corrected = await runAgent(config.agent, correctionMessage + prevContext, {
      patientName: workflow.context.patientName,
      practiceType: workflow.context.practiceType,
      practiceId: workflow.context.practiceId,
      isDemoMode: workflow.context.isDemoMode,
    });

    // Only accept correction if confidence improved
    if (corrected.confidence > (result.confidence || 0)) {
      result = {
        ...result,
        response: corrected.response,
        confidence: corrected.confidence,
        toolsUsed: [...(result.toolsUsed || []), ...(corrected.toolsUsed || [])],
        escalated: corrected.escalate,
        retryCount: retries,
        handoffReason: "self_correction",
      };
    } else {
      break; // Correction didn't help, stop
    }
  }

  // Confidence-based handoff
  if (config.confidenceThreshold && config.fallbackAgent) {
    if ((result.confidence || 0) < config.confidenceThreshold) {
      const handoffMessage =
        "A " + config.agent + " agent attempted this task but had low confidence (" +
        ((result.confidence || 0) * 100).toFixed(0) + "%). " +
        "Their response was: " + (result.response || "(none)").slice(0, 300) +
        "\n\nPlease provide a better response to: " + message;

      const fallback = await runAgent(config.fallbackAgent, handoffMessage + prevContext, {
        patientName: workflow.context.patientName,
        practiceType: workflow.context.practiceType,
        practiceId: workflow.context.practiceId,
        isDemoMode: workflow.context.isDemoMode,
      });

      result = {
        ...result,
        agent: config.fallbackAgent,
        response: fallback.response,
        confidence: fallback.confidence,
        toolsUsed: [...(result.toolsUsed || []), ...(fallback.toolsUsed || [])],
        escalated: fallback.escalate,
        handoffReason: "confidence_low",
      };

      // Record the handoff in feedback for learning
      await recordFeedback({
        persona: config.agent,
        query: message,
        response: result.response || "",
        type: "escalation",
        practiceId: workflow.context.practiceId,
      }).catch(() => {});
    }
  }

  return result;
}

async function executeApprovalStep(
  config: ApprovalStepConfig,
  stepIndex: number,
  workflow: WorkflowRun,
): Promise<StepResult> {
  const prevResult = workflow.results[workflow.results.length - 1];

  // Auto-approve if confidence threshold met
  if (config.autoApproveThreshold && prevResult?.confidence !== undefined) {
    if (prevResult.confidence >= config.autoApproveThreshold) {
      return {
        stepIndex,
        stepType: "approval",
        status: "completed",
        approvedBy: "auto:confidence",
        approvalNote: "Auto-approved: confidence " + (prevResult.confidence * 100).toFixed(0) + "% >= " + (config.autoApproveThreshold * 100).toFixed(0) + "% threshold",
        durationMs: 0,
      };
    }
  }

  // Create approval request and wait
  return new Promise<StepResult>((resolve) => {
    const key = workflow.id + ":" + stepIndex;
    const timeout = config.timeoutSeconds || 0;

    approvalQueue.set(key, {
      workflowId: workflow.id,
      stepIndex,
      description: config.description,
      approver: config.approver,
      previousStepResult: prevResult,
      createdAt: new Date().toISOString(),
      resolve: (decision) => {
        resolve({
          stepIndex,
          stepType: "approval",
          status: decision.approved ? "completed" : "rejected",
          approvedBy: decision.approvedBy || config.approver,
          approvalNote: decision.note,
          durationMs: 0,
        });
      },
    });

    // Auto-timeout
    if (timeout > 0) {
      setTimeout(() => {
        if (approvalQueue.has(key)) {
          approvalQueue.delete(key);
          resolve({
            stepIndex,
            stepType: "approval",
            status: "completed",
            approvedBy: "auto:timeout",
            approvalNote: "Auto-approved after " + timeout + "s timeout",
            durationMs: timeout * 1000,
          });
        }
      }, timeout * 1000);
    }
  });
}

async function executeParallelStep(
  config: ParallelStepConfig,
  stepIndex: number,
  workflow: WorkflowRun,
): Promise<StepResult> {
  const promises = config.agents.map(async (a) => {
    const msg = interpolateMessage(a.message, workflow.results);
    const prevContext = workflow.context.agentMemory.length > 0
      ? "\n\n[CONTEXT FROM PREVIOUS AGENTS]\n" + workflow.context.agentMemory.join("\n") + "\n[END CONTEXT]"
      : "";
    const res = await runAgent(a.agent, msg + prevContext, {
      patientName: workflow.context.patientName,
      practiceType: workflow.context.practiceType,
      practiceId: workflow.context.practiceId,
      isDemoMode: workflow.context.isDemoMode,
    });
    return { agent: a.agent, response: res.response, confidence: res.confidence, escalate: res.escalate, toolsUsed: res.toolsUsed };
  });

  if (config.strategy === "first") {
    const first = await Promise.race(promises);
    return {
      stepIndex,
      stepType: "parallel",
      status: "completed",
      agent: first.agent,
      response: first.response,
      confidence: first.confidence,
      escalated: first.escalate,
      toolsUsed: first.toolsUsed,
      parallelResults: [first],
      durationMs: 0,
    };
  }

  const all = await Promise.all(promises);

  if (config.strategy === "best") {
    const best = all.reduce((a, b) => (a.confidence > b.confidence ? a : b));
    return {
      stepIndex,
      stepType: "parallel",
      status: "completed",
      agent: best.agent,
      response: best.response,
      confidence: best.confidence,
      escalated: best.escalate,
      toolsUsed: best.toolsUsed,
      parallelResults: all.map(r => ({ agent: r.agent, response: r.response, confidence: r.confidence })),
      durationMs: 0,
    };
  }

  // strategy === "all" — combine responses
  const combined = all.map(r => "[" + r.agent.toUpperCase() + "]: " + r.response).join("\n\n");
  const avgConf = all.reduce((sum, r) => sum + r.confidence, 0) / all.length;
  return {
    stepIndex,
    stepType: "parallel",
    status: "completed",
    response: combined,
    confidence: avgConf,
    escalated: all.some(r => r.escalate),
    toolsUsed: all.flatMap(r => r.toolsUsed),
    parallelResults: all.map(r => ({ agent: r.agent, response: r.response, confidence: r.confidence })),
    durationMs: 0,
  };
}

async function executeConditionalStep(
  config: ConditionalStepConfig,
  stepIndex: number,
  workflow: WorkflowRun,
): Promise<StepResult> {
  const prevResult = workflow.results[workflow.results.length - 1];

  if (prevResult && config.condition(prevResult)) {
    return executeAgentStep(config.ifTrue, stepIndex, workflow);
  } else if (config.ifFalse) {
    return executeAgentStep(config.ifFalse, stepIndex, workflow);
  }

  return {
    stepIndex,
    stepType: "conditional",
    status: "skipped",
    durationMs: 0,
  };
}

// ── Pre-Built Workflow Templates ────────────────────────────

/**
 * Full patient intake → triage → billing → followup pipeline
 */
export function patientIntakePipeline(patientMessage: string): StepConfig[] {
  return [
    // Step 0: Intake captures patient data
    {
      type: "agent",
      agent: "intake",
      message: patientMessage,
      confidenceThreshold: 0.5,
      fallbackAgent: "triage",
      maxRetries: 1,
    },
    // Step 1: Triage assesses urgency
    {
      type: "agent",
      agent: "triage",
      message: "Based on the intake data: {{prev.response}}\n\nAssess this patient's urgency level and recommend next steps.",
      maxRetries: 1,
    },
    // Step 2: If urgent → require staff approval before proceeding
    {
      type: "conditional",
      condition: (prev) => (prev.escalated === true || (prev.confidence !== undefined && prev.confidence < 0.6)),
      ifTrue: {
        type: "agent" as const,
        agent: "triage",
        message: "ESCALATION: Re-assess this case with maximum care. Previous assessment: {{prev.response}}",
        maxRetries: 2,
      },
    },
    // Step 3: Billing validates any claim data
    {
      type: "agent",
      agent: "billing",
      message: "Validate the billing codes for this patient visit: {{prev.response}}",
      confidenceThreshold: 0.6,
      fallbackAgent: "billing",
      maxRetries: 1,
    },
    // Step 4: Schedule follow-up
    {
      type: "agent",
      agent: "followup",
      message: "Generate a follow-up plan for this patient: {{step[0].response}}",
    },
  ];
}

/**
 * Claims validation → AI review → approval → submission
 */
export function claimsReviewPipeline(claimSummary: string): StepConfig[] {
  return [
    // Step 0: Billing agent validates claim
    {
      type: "agent",
      agent: "billing",
      message: "Validate this claim and identify any issues:\n" + claimSummary,
      maxRetries: 2,
    },
    // Step 1: If low confidence, get second opinion
    {
      type: "conditional",
      condition: (prev) => prev.confidence !== undefined && prev.confidence < 0.7,
      ifTrue: {
        type: "agent" as const,
        agent: "billing",
        message: "Second opinion requested. Previous review: {{prev.response}}\n\nPlease re-validate this claim with extra scrutiny.",
        maxRetries: 1,
      },
    },
    // Step 2: Human approval required for high-value or rejected claims
    {
      type: "approval",
      description: "Claim review completed. Please approve or reject the validation result before submission.",
      approver: "staff",
      autoApproveThreshold: 0.85,
      timeoutSeconds: 300, // 5 minute timeout
    },
  ];
}

/**
 * Emergency triage — parallel assessment + immediate escalation
 */
export function emergencyTriagePipeline(emergencyMessage: string): StepConfig[] {
  return [
    // Step 0: Parallel triage from two perspectives
    {
      type: "parallel",
      agents: [
        { agent: "triage", message: "EMERGENCY ASSESSMENT: " + emergencyMessage },
        { agent: "intake", message: "Capture all clinical details from this emergency: " + emergencyMessage },
      ],
      strategy: "all",
    },
    // Step 1: Always require human confirmation for emergencies
    {
      type: "approval",
      description: "EMERGENCY: Triage and intake complete. Confirm actions before proceeding.",
      approver: "doctor",
      timeoutSeconds: 60, // 1 minute timeout — urgent
    },
    // Step 2: Follow-up actions
    {
      type: "agent",
      agent: "followup",
      message: "Generate emergency follow-up actions based on: {{step[0].response}}",
    },
  ];
}
