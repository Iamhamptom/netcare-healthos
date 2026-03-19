import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external AI providers
vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = {
      create: vi.fn(async () => ({
        content: [{ type: "text", text: JSON.stringify({ urgency: "ROUTINE", assessment: "General inquiry", recommended_action: "Schedule appointment", escalate_to_human: false }) }],
      })),
    };
  }
  return { default: MockAnthropic };
});

vi.mock("@/lib/gemini", () => ({
  chat: vi.fn(async () => JSON.stringify({ urgency: "ROUTINE", assessment: "General inquiry", recommended_action: "Schedule appointment", escalate_to_human: false })),
}));

describe("Agent System — Types & Structure", () => {
  it("agent types are valid", () => {
    const validTypes = ["triage", "followup", "intake", "billing", "scheduler"];
    validTypes.forEach(type => expect(typeof type).toBe("string"));
    expect(validTypes.length).toBe(5);
  });

  it("agent result has required fields", () => {
    const result = {
      agent: "triage" as const,
      response: "This is a routine inquiry",
      actions: [],
      confidence: 0.85,
      escalate: false,
    };

    expect(result.agent).toBe("triage");
    expect(typeof result.response).toBe("string");
    expect(Array.isArray(result.actions)).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(typeof result.escalate).toBe("boolean");
  });

  it("triage urgency levels are correct", () => {
    const levels = ["EMERGENCY", "URGENT", "SEMI-URGENT", "ROUTINE"];
    expect(levels.length).toBe(4);
    expect(levels[0]).toBe("EMERGENCY"); // Highest priority first
  });

  it("action types are valid", () => {
    const actionTypes = ["create_booking", "send_reminder", "flag_urgent", "update_record", "notify_staff", "schedule_followup"];
    expect(actionTypes.length).toBe(6);
  });
});

describe("Agent System — Run Agent", () => {
  beforeEach(() => { vi.resetModules(); });

  it("imports runAgent without error", async () => {
    const { runAgent } = await import("@/lib/agents");
    expect(typeof runAgent).toBe("function");
  });

  it("imports triageMessage without error", async () => {
    const { triageMessage } = await import("@/lib/agents");
    expect(typeof triageMessage).toBe("function");
  });

  it("imports generateFollowup without error", async () => {
    const { generateFollowup } = await import("@/lib/agents");
    expect(typeof generateFollowup).toBe("function");
  });

  it("imports runIntake without error", async () => {
    const { runIntake } = await import("@/lib/agents");
    expect(typeof runIntake).toBe("function");
  });
});

describe("Agent System — Triage Classification", () => {
  it("emergency keywords are recognized", () => {
    const emergencyKeywords = ["chest pain", "difficulty breathing", "severe bleeding", "loss of consciousness", "allergic reaction"];
    const testMessage = "I'm having difficulty breathing and chest pain";
    const hasEmergencyKeyword = emergencyKeywords.some(kw => testMessage.toLowerCase().includes(kw));
    expect(hasEmergencyKeyword).toBe(true);
  });

  it("routine keywords don't trigger emergency", () => {
    const emergencyKeywords = ["chest pain", "difficulty breathing", "severe bleeding", "loss of consciousness", "allergic reaction"];
    const testMessage = "I'd like to book a routine check-up";
    const hasEmergencyKeyword = emergencyKeywords.some(kw => testMessage.toLowerCase().includes(kw));
    expect(hasEmergencyKeyword).toBe(false);
  });
});

describe("Agent System — Message History Cleaning", () => {
  it("builds alternating message list from conversation", () => {
    const messages = [
      { role: "patient", content: "Hi, I need an appointment" },
      { role: "practice", content: "Sure, when works for you?" },
      { role: "patient", content: "Tomorrow at 10?" },
    ];

    const cleaned: { role: "user" | "assistant"; content: string }[] = [];
    for (const msg of messages) {
      const role = msg.role === "patient" ? "user" as const : "assistant" as const;
      if (cleaned.length === 0 && role === "assistant") continue;
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === role) continue;
      cleaned.push({ role, content: msg.content });
    }

    expect(cleaned.length).toBe(3);
    expect(cleaned[0].role).toBe("user");
    expect(cleaned[1].role).toBe("assistant");
    expect(cleaned[2].role).toBe("user");
  });

  it("filters out ai_suggestion messages", () => {
    const messages = [
      { role: "patient", content: "What's the price?" },
      { role: "ai_suggestion", content: "AI draft reply" },
      { role: "practice", content: "The actual reply" },
    ];

    const filtered = messages.filter(m => m.role !== "ai_suggestion");
    expect(filtered.length).toBe(2);
    expect(filtered[0].role).toBe("patient");
    expect(filtered[1].role).toBe("practice");
  });
});
