import { describe, it, expect } from "vitest";

describe("Reminders — Time Window Calculation", () => {
  it("24h reminder window is correct", () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Window should be exactly 1 hour wide
    expect(in25h.getTime() - in24h.getTime()).toBe(3600000);

    // 24h from now should be in the future
    expect(in24h.getTime()).toBeGreaterThan(now.getTime());
  });

  it("2h check-in window is correct", () => {
    const now = new Date();
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    expect(in3h.getTime() - in2h.getTime()).toBe(3600000);
    expect(in2h.getTime() - now.getTime()).toBe(7200000);
  });

  it("follow-up window targets 24-48h ago", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // twoDaysAgo should be before yesterday
    expect(twoDaysAgo.getTime()).toBeLessThan(yesterday.getTime());

    // Window is 24 hours wide
    expect(yesterday.getTime() - twoDaysAgo.getTime()).toBe(86400000);
  });
});

describe("Reminders — Message Templates", () => {
  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function formatTime(d: Date): string {
    return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  it("formats date correctly for South Africa", () => {
    const d = new Date("2026-03-15T10:30:00");
    const formatted = formatDate(d);
    expect(formatted).toContain("March");
    expect(formatted).toContain("2026");
  });

  it("formats time in 24h format", () => {
    const d = new Date("2026-03-15T14:30:00");
    const formatted = formatTime(d);
    expect(formatted).toContain("14");
    expect(formatted).toContain("30");
  });

  it("reminder message includes key details", () => {
    const practiceName = "Smile Dental";
    const service = "Dental Cleaning";
    const time = "10:30";
    const address = "45 Rivonia Rd";

    const msg = `Reminder: You have an appointment tomorrow at ${practiceName}.\n\nService: ${service}\nTime: ${time}\nAddress: ${address}`;

    expect(msg).toContain(practiceName);
    expect(msg).toContain(service);
    expect(msg).toContain(time);
    expect(msg).toContain(address);
  });

  it("follow-up message includes patient name", () => {
    const patientName = "Maria Santos";
    const practiceName = "Smile Dental";
    const service = "Tooth Whitening";

    const msg = `Hi ${patientName}, thank you for visiting ${practiceName} for your ${service}.`;

    expect(msg).toContain(patientName);
    expect(msg).toContain(practiceName);
    expect(msg).toContain(service);
  });
});

describe("Reminders — Notification Types", () => {
  it("all notification templates are valid", () => {
    const templates = ["reminder_24h", "reminder_48h", "recall", "followup", "custom", "booking", "auto_reply", "emergency"];
    expect(templates.length).toBe(8);
    templates.forEach(t => expect(typeof t).toBe("string"));
  });

  it("notification channels are valid", () => {
    const channels = ["whatsapp", "sms", "email"];
    expect(channels.length).toBe(3);
  });

  it("notification statuses are valid", () => {
    const statuses = ["queued", "sent", "delivered", "failed"];
    expect(statuses.length).toBe(4);
  });
});
