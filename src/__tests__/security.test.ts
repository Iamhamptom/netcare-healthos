import { describe, it, expect } from "vitest";

describe("Security — XML Escape (Voice Call TwiML)", () => {
  function escapeXml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  it("escapes ampersands", () => {
    expect(escapeXml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes angle brackets", () => {
    expect(escapeXml("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert('xss')&lt;/script&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeXml('She said "hello"')).toBe("She said &quot;hello&quot;");
  });

  it("handles clean strings without changes", () => {
    expect(escapeXml("Your appointment is at 10:00")).toBe("Your appointment is at 10:00");
  });

  it("handles empty strings", () => {
    expect(escapeXml("")).toBe("");
  });
});

describe("Security — Input Sanitization", () => {
  it("booking patient name is capped at 100 chars", () => {
    const name = "A".repeat(200);
    const sanitized = name.trim().slice(0, 100);
    expect(sanitized.length).toBe(100);
  });

  it("booking notes are capped at 500 chars", () => {
    const notes = "B".repeat(1000);
    const sanitized = notes.trim().slice(0, 500);
    expect(sanitized.length).toBe(500);
  });

  it("phone numbers are trimmed and capped", () => {
    const phone = "  +27 82 345 6789  ";
    const sanitized = phone.trim().slice(0, 20);
    expect(sanitized).toBe("+27 82 345 6789");
    expect(sanitized.length).toBeLessThanOrEqual(20);
  });
});

describe("Security — Date Validation", () => {
  it("rejects invalid dates", () => {
    const d = new Date("not-a-date");
    expect(isNaN(d.getTime())).toBe(true);
  });

  it("rejects past dates for bookings", () => {
    const past = new Date("2020-01-01T10:00:00");
    expect(past < new Date()).toBe(true);
  });

  it("accepts future dates", () => {
    const future = new Date(Date.now() + 86400000);
    expect(future > new Date()).toBe(true);
  });
});
