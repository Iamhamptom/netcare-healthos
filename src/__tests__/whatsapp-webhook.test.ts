import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimitByIp: () => ({ allowed: true }),
}));

vi.mock("@/lib/is-demo", () => ({
  isDemoMode: true,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

function makeWhatsAppPayload(text: string, from = "27821234567", name = "Test Patient") {
  return {
    entry: [{
      changes: [{
        value: {
          messages: [{ from, text: { body: text }, type: "text", timestamp: Date.now().toString(), id: "wamid_test_123" }],
          contacts: [{ profile: { name } }],
        },
      }],
    }],
  };
}

describe("WhatsApp Webhook — GET Verification", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns challenge when token matches", async () => {
    process.env.WHATSAPP_WEBHOOK_SECRET = "test-secret";
    const { GET } = await import("@/app/api/webhook/whatsapp/route");
    const request = new Request("http://localhost/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=test-secret&hub.challenge=test-challenge-123");
    const response = await GET(request);
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).toBe("test-challenge-123");
  });

  it("returns 403 when token doesn't match", async () => {
    process.env.WHATSAPP_WEBHOOK_SECRET = "test-secret";
    const { GET } = await import("@/app/api/webhook/whatsapp/route");
    const request = new Request("http://localhost/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=test");
    const response = await GET(request);
    expect(response.status).toBe(403);
  });
});

describe("WhatsApp Webhook — POST Message Processing", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns ok for status updates (non-message events)", async () => {
    const { POST } = await import("@/app/api/webhook/whatsapp/route");
    const request = new Request("http://localhost/api/webhook/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: "status1" }] } }] }] }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
  });

  it("processes text messages in demo mode", async () => {
    const { POST } = await import("@/app/api/webhook/whatsapp/route");
    const request = new Request("http://localhost/api/webhook/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeWhatsAppPayload("I need to book an appointment")),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe("demo");
    expect(data.message.text).toBe("I need to book an appointment");
    expect(data.message.from).toBe("27821234567");
  });

  it("skips non-text messages", async () => {
    const { POST } = await import("@/app/api/webhook/whatsapp/route");
    const payload = {
      entry: [{ changes: [{ value: {
        messages: [{ from: "27821234567", type: "image", image: { id: "img_123" }, timestamp: "123", id: "wamid_img" }],
        contacts: [{ profile: { name: "Test" } }],
      } }] }],
    };
    const request = new Request("http://localhost/api/webhook/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe("received");
    expect(data.type).toBe("image");
  });

  it("returns 500 on malformed body", async () => {
    const { POST } = await import("@/app/api/webhook/whatsapp/route");
    const request = new Request("http://localhost/api/webhook/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

describe("WhatsApp Webhook — Phone Normalization", () => {
  it("normalizes phone numbers correctly", () => {
    function normalizePhone(phone: string): string {
      let p = phone.replace(/[\s\-()]/g, "");
      if (!p.startsWith("+")) p = "+" + p;
      return p;
    }

    expect(normalizePhone("27 82 123 4567")).toBe("+27821234567");
    expect(normalizePhone("+27-82-123-4567")).toBe("+27821234567");
    expect(normalizePhone("(082) 123 4567")).toBe("+0821234567");
    expect(normalizePhone("+27821234567")).toBe("+27821234567");
  });
});
