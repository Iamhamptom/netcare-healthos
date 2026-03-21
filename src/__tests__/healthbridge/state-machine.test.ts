import { describe, it, expect } from "vitest";
import { isValidTransition, getNextStates, validateTransition } from "@/lib/healthbridge/state-machine";

describe("Claim State Machine — isValidTransition", () => {
  // ── Valid transitions ──
  it("should allow draft → submitted", () => {
    expect(isValidTransition("draft", "submitted")).toBe(true);
  });

  it("should allow draft → reversed", () => {
    expect(isValidTransition("draft", "reversed")).toBe(true);
  });

  it("should allow submitted → accepted", () => {
    expect(isValidTransition("submitted", "accepted")).toBe(true);
  });

  it("should allow submitted → rejected", () => {
    expect(isValidTransition("submitted", "rejected")).toBe(true);
  });

  it("should allow submitted → partial", () => {
    expect(isValidTransition("submitted", "partial")).toBe(true);
  });

  it("should allow submitted → reversed", () => {
    expect(isValidTransition("submitted", "reversed")).toBe(true);
  });

  it("should allow accepted → pending_payment", () => {
    expect(isValidTransition("accepted", "pending_payment")).toBe(true);
  });

  it("should allow accepted → paid", () => {
    expect(isValidTransition("accepted", "paid")).toBe(true);
  });

  it("should allow accepted → short_paid", () => {
    expect(isValidTransition("accepted", "short_paid")).toBe(true);
  });

  it("should allow accepted → reversed", () => {
    expect(isValidTransition("accepted", "reversed")).toBe(true);
  });

  it("should allow rejected → resubmitted", () => {
    expect(isValidTransition("rejected", "resubmitted")).toBe(true);
  });

  it("should allow rejected → reversed", () => {
    expect(isValidTransition("rejected", "reversed")).toBe(true);
  });

  it("should allow partial → pending_payment", () => {
    expect(isValidTransition("partial", "pending_payment")).toBe(true);
  });

  it("should allow partial → resubmitted", () => {
    expect(isValidTransition("partial", "resubmitted")).toBe(true);
  });

  it("should allow pending_payment → paid", () => {
    expect(isValidTransition("pending_payment", "paid")).toBe(true);
  });

  it("should allow pending_payment → short_paid", () => {
    expect(isValidTransition("pending_payment", "short_paid")).toBe(true);
  });

  it("should allow paid → reversed", () => {
    expect(isValidTransition("paid", "reversed")).toBe(true);
  });

  it("should allow short_paid → paid", () => {
    expect(isValidTransition("short_paid", "paid")).toBe(true);
  });

  it("should allow short_paid → reversed", () => {
    expect(isValidTransition("short_paid", "reversed")).toBe(true);
  });

  it("should allow resubmitted → accepted", () => {
    expect(isValidTransition("resubmitted", "accepted")).toBe(true);
  });

  it("should allow resubmitted → rejected", () => {
    expect(isValidTransition("resubmitted", "rejected")).toBe(true);
  });

  it("should allow resubmitted → partial", () => {
    expect(isValidTransition("resubmitted", "partial")).toBe(true);
  });

  // ── Invalid transitions ──
  it("should NOT allow draft → paid", () => {
    expect(isValidTransition("draft", "paid")).toBe(false);
  });

  it("should NOT allow draft → accepted", () => {
    expect(isValidTransition("draft", "accepted")).toBe(false);
  });

  it("should NOT allow reversed → accepted (terminal state)", () => {
    expect(isValidTransition("reversed", "accepted")).toBe(false);
  });

  it("should NOT allow reversed → anything (terminal)", () => {
    expect(isValidTransition("reversed", "submitted")).toBe(false);
    expect(isValidTransition("reversed", "draft")).toBe(false);
    expect(isValidTransition("reversed", "paid")).toBe(false);
  });

  it("should NOT allow paid → accepted", () => {
    expect(isValidTransition("paid", "accepted")).toBe(false);
  });

  it("should NOT allow same state → same state", () => {
    expect(isValidTransition("draft", "draft")).toBe(false);
    expect(isValidTransition("submitted", "submitted")).toBe(false);
    expect(isValidTransition("accepted", "accepted")).toBe(false);
    expect(isValidTransition("paid", "paid")).toBe(false);
  });

  it("should return false for unknown 'from' status", () => {
    expect(isValidTransition("nonexistent", "accepted")).toBe(false);
  });

  it("should return false for unknown 'to' status", () => {
    expect(isValidTransition("draft", "nonexistent")).toBe(false);
  });
});

describe("Claim State Machine — getNextStates", () => {
  it("should return valid next states for draft", () => {
    const next = getNextStates("draft");
    expect(next).toContain("submitted");
    expect(next).toContain("reversed");
    expect(next).not.toContain("paid");
  });

  it("should return empty array for reversed (terminal)", () => {
    const next = getNextStates("reversed");
    expect(next).toHaveLength(0);
  });

  it("should return empty array for unknown status", () => {
    const next = getNextStates("nonexistent");
    expect(next).toHaveLength(0);
  });

  it("should return multiple options for submitted", () => {
    const next = getNextStates("submitted");
    expect(next).toEqual(expect.arrayContaining(["accepted", "rejected", "partial", "reversed"]));
  });
});

describe("Claim State Machine — validateTransition", () => {
  it("should return valid:true for allowed transitions", () => {
    const result = validateTransition("draft", "submitted");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should return error for invalid transitions", () => {
    const result = validateTransition("draft", "paid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid transition");
    expect(result.error).toContain("Allowed transitions");
  });

  it("should return specific error for terminal state", () => {
    const result = validateTransition("reversed", "submitted");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("terminal");
  });

  it("should return error for unknown from status", () => {
    const result = validateTransition("fantasy", "submitted");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown claim status");
  });
});
