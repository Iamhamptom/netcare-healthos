import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

// Mock rate limiter
vi.mock("@/lib/rate-limit", () => ({
  rateLimitByIp: () => ({ allowed: true }),
}));

// Mock demo mode
vi.mock("@/lib/is-demo", () => ({
  isDemoMode: true,
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

describe("API Routes — Public Availability", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 400 when slug is missing", async () => {
    const { GET } = await import("@/app/api/public/availability/route");
    const request = new Request("http://localhost/api/public/availability");
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toContain("slug");
  });

  it("returns practice info in demo mode", async () => {
    const { GET } = await import("@/app/api/public/availability/route");
    const request = new Request("http://localhost/api/public/availability?slug=smiledental&info=true");
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.practice).toBeDefined();
    expect(data.practice.name).toContain("Smile Dental");
    expect(data.practice.bookingServices).toBeDefined();
  });

  it("returns slots for a date in demo mode", async () => {
    const { GET } = await import("@/app/api/public/availability/route");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const request = new Request(`http://localhost/api/public/availability?slug=smiledental&date=${tomorrow}`);
    const response = await GET(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.slots).toBeDefined();
    expect(data.slots.length).toBeGreaterThan(0);
    expect(data.slots[0]).toHaveProperty("time");
    expect(data.slots[0]).toHaveProperty("available");
  });
});

describe("API Routes — Public Booking", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 400 when required fields are missing", async () => {
    const { POST } = await import("@/app/api/public/book/route");
    const request = new Request("http://localhost/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "smiledental" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toContain("required");
  });

  it("returns 400 for past dates", async () => {
    const { POST } = await import("@/app/api/public/book/route");
    const request = new Request("http://localhost/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "smiledental",
        service: "Consultation",
        date: "2020-01-01",
        time: "10:00",
        patientName: "Test Patient",
        patientPhone: "+27820001111",
      }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toContain("past");
  });

  it("creates booking in demo mode", async () => {
    const { POST } = await import("@/app/api/public/book/route");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const request = new Request("http://localhost/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "smiledental",
        service: "Consultation",
        date: tomorrow,
        time: "10:00",
        patientName: "Test Patient",
        patientPhone: "+27820001111",
      }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.bookingId).toBeTruthy();
    expect(data.status).toBe("pending");
  });

  it("rejects inputs that are too long", async () => {
    const { POST } = await import("@/app/api/public/book/route");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const request = new Request("http://localhost/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "smiledental",
        service: "Consultation",
        date: tomorrow,
        time: "10:00",
        patientName: "A".repeat(200), // > 100 chars
        patientPhone: "+27820001111",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe("API Routes — Chatbot", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 400 when message is missing", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
  });

  it("returns mock reply for booking query in demo mode", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I want to book an appointment" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toBeTruthy();
    expect(data.reply.toLowerCase()).toContain("book");
  });

  it("returns mock reply for hours query", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What are your opening hours?" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("8:00");
  });

  it("returns mock reply for pricing query", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "How much does a cleaning cost?" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply).toContain("R");
  });

  it("returns mock reply for emergency", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I'm in severe pain, it's an emergency" }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.reply.toLowerCase()).toContain("pain");
  });

  it("rejects messages that are too long", async () => {
    const { POST } = await import("@/app/api/chatbot/route");
    const request = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "A".repeat(1500) }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
