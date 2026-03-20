import { describe, it, expect } from "vitest";
import { demoPractice, demoPatients, demoBookings, demoReviews, demoConversations, demoRecallItems } from "@/lib/demo-data";

describe("Demo Data — Integrity", () => {
  it("practice has all required fields", () => {
    expect(demoPractice.id).toBe("demo-practice");
    expect(demoPractice.name).toBeTruthy();
    expect(demoPractice.address).toBeTruthy();
    expect(demoPractice.phone).toBeTruthy();
    expect(demoPractice.hours).toBeTruthy();
    expect(demoPractice.subdomain).toBe("netcare-primarycare");
  });

  it("practice has booking settings", () => {
    expect(demoPractice.bookingEnabled).toBe(true);
    expect(demoPractice.bookingRequiresApproval).toBe(false);
    expect(typeof demoPractice.bookingDepositAmount).toBe("number");
    const services = JSON.parse(demoPractice.bookingServices);
    expect(services.length).toBeGreaterThan(0);
    expect(services[0]).toHaveProperty("name");
    expect(services[0]).toHaveProperty("duration");
    expect(services[0]).toHaveProperty("price");
  });

  it("has 5 patients", () => {
    expect(demoPatients.length).toBe(5);
    demoPatients.forEach(p => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.phone).toBeTruthy();
      expect(p.practiceId).toBe("demo-practice");
    });
  });

  it("has 7 bookings with business-hour times", () => {
    expect(demoBookings.length).toBe(7);
    demoBookings.forEach(b => {
      expect(b.id).toBeTruthy();
      expect(b.patientName).toBeTruthy();
      expect(b.service).toBeTruthy();
      expect(b.practiceId).toBe("demo-practice");
      expect(["pending", "confirmed", "completed", "cancelled"]).toContain(b.status);
      expect(["public", "dashboard", "whatsapp", "phone"]).toContain(b.source);

      // Verify business hours (8:00-17:00)
      const hour = new Date(b.scheduledAt).getHours();
      expect(hour).toBeGreaterThanOrEqual(8);
      expect(hour).toBeLessThanOrEqual(17);
    });
  });

  it("bookings have required booking-suite fields", () => {
    demoBookings.forEach(b => {
      expect(b).toHaveProperty("patientPhone");
      expect(b).toHaveProperty("patientEmail");
      expect(b).toHaveProperty("source");
      expect(b).toHaveProperty("depositAmount");
      expect(b).toHaveProperty("depositPaid");
      expect(b).toHaveProperty("reminderSentAt");
      expect(b).toHaveProperty("followupSentAt");
      expect(b).toHaveProperty("checkinSentAt");
    });
  });

  it("has 4 pending bookings (for approvals page)", () => {
    const pending = demoBookings.filter(b => b.status === "pending");
    expect(pending.length).toBe(4);
  });

  it("has 3 confirmed bookings", () => {
    const confirmed = demoBookings.filter(b => b.status === "confirmed");
    expect(confirmed.length).toBe(3);
  });

  it("has reviews with valid ratings", () => {
    expect(demoReviews.length).toBeGreaterThan(0);
    demoReviews.forEach(r => {
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
      expect(r.practiceId).toBe("demo-practice");
    });
  });

  it("has conversations with messages", () => {
    expect(demoConversations.length).toBeGreaterThan(0);
    demoConversations.forEach(c => {
      expect(c.patient).toBeTruthy();
      expect(c.messages).toBeTruthy();
      expect(Array.isArray(c.messages)).toBe(true);
      expect(c.messages.length).toBeGreaterThan(0);
    });
  });

  it("has recall items", () => {
    expect(demoRecallItems.length).toBeGreaterThan(0);
    demoRecallItems.forEach(r => {
      expect(r.patientName).toBeTruthy();
      expect(r.reason).toBeTruthy();
      expect(r.practiceId).toBe("demo-practice");
    });
  });

  it("booking sources are diverse", () => {
    const sources = new Set(demoBookings.map(b => b.source));
    expect(sources.size).toBeGreaterThanOrEqual(3);
    expect(sources.has("public")).toBe(true);
    expect(sources.has("whatsapp")).toBe(true);
  });
});
