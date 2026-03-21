import { describe, it, expect, vi, beforeEach } from "vitest";

class MockNextResponse {
  body: unknown;
  status: number;
  constructor(body: unknown, status: number) {
    this.body = body;
    this.status = status;
  }
  json() { return Promise.resolve(this.body); }
  static json(body: unknown, init?: { status?: number }) {
    return new MockNextResponse(body, init?.status || 200);
  }
}

vi.mock("next/server", () => ({
  NextResponse: MockNextResponse,
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

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => ({ value: "demo-token" }),
    set: () => {},
    delete: () => {},
  }),
}));

vi.mock("@/lib/auth", () => ({
  getSession: () => Promise.resolve({ userId: "platform-admin" }),
  verifyToken: () => Promise.resolve({ userId: "platform-admin" }),
  SESSION_COOKIE: "healthops-session",
}));

vi.mock("@/lib/db", () => ({
  db: {
    getUserById: () => Promise.resolve({ id: "platform-admin", role: "platform_admin", name: "Demo Admin", practiceId: "demo-practice" }),
    listPractices: () => Promise.resolve([
      { id: "demo-practice", name: "Netcare Primary", type: "primary_care_network", plan: "enterprise", planStatus: "active", createdAt: "2026-01-01" },
      { id: "prac-2", name: "Medicross Sandton", type: "medicross_gp", plan: "professional", planStatus: "active", createdAt: "2026-02-01" },
      { id: "prac-3", name: "Akeso Clinic", type: "mental_health", plan: "starter", planStatus: "trial", createdAt: "2026-03-01" },
    ]),
    listPatients: () => Promise.resolve([{ id: "p1" }, { id: "p2" }]),
    listBookings: () => Promise.resolve([{ id: "b1" }]),
  },
}));

describe("Admin — Analytics API", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns platform overview in demo mode", async () => {
    const { GET } = await import("@/app/api/admin/analytics/route");
    const request = new Request("http://localhost/api/admin/analytics");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.overview).toBeDefined();
    expect(data.overview.totalPractices).toBeGreaterThan(0);
    expect(typeof data.overview.totalPatients).toBe("number");
    expect(typeof data.overview.totalBookings).toBe("number");
    expect(data.byPlan).toBeDefined();
    expect(data.byType).toBeDefined();
    expect(data.recentSignups).toBeDefined();
    expect(Array.isArray(data.recentSignups)).toBe(true);
  });

  it("returns plan breakdown", async () => {
    const { GET } = await import("@/app/api/admin/analytics/route");
    const request = new Request("http://localhost/api/admin/analytics");
    const response = await GET(request);
    const data = await response.json();

    expect(data.byPlan.starter).toBeDefined();
    expect(data.byPlan.professional).toBeDefined();
    expect(data.byPlan.enterprise).toBeDefined();
    const totalByPlan = data.byPlan.starter + data.byPlan.professional + data.byPlan.enterprise;
    expect(totalByPlan).toBe(data.overview.totalPractices);
  });
});

describe("Admin — Practices API", () => {
  beforeEach(() => { vi.resetModules(); });

  it("lists all practices in demo mode", async () => {
    const { GET } = await import("@/app/api/admin/practices/route");
    const request = new Request("http://localhost/api/admin/practices");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.practices).toBeDefined();
    expect(data.practices.length).toBeGreaterThan(0);

    const practice = data.practices[0];
    expect(practice.id).toBeDefined();
    expect(practice.name).toBeDefined();
    expect(practice.type).toBeDefined();
    expect(practice.plan).toBeDefined();
    expect(practice.planStatus).toBeDefined();
  });

  it("allows PATCH to update practice plan in demo mode", async () => {
    const { PATCH } = await import("@/app/api/admin/practices/route");
    const request = new Request("http://localhost/api/admin/practices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "demo-practice", plan: "enterprise" }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.practice.plan).toBe("enterprise");
  });

  it("rejects PATCH without practice ID", async () => {
    const { PATCH } = await import("@/app/api/admin/practices/route");
    const request = new Request("http://localhost/api/admin/practices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "enterprise" }),
    });
    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("filters out unsafe fields from PATCH", async () => {
    const { PATCH } = await import("@/app/api/admin/practices/route");
    const request = new Request("http://localhost/api/admin/practices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "demo-practice", plan: "enterprise", paystackSubId: "HACKED", passwordHash: "evil" }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.practice.plan).toBe("enterprise");
    // paystackSubId and passwordHash should NOT be in the response
    expect(data.practice.paystackSubId).toBeUndefined();
    expect(data.practice.passwordHash).toBeUndefined();
  });
});

describe("Admin — Usage API", () => {
  beforeEach(() => { vi.resetModules(); });

  it("returns usage data per practice in demo mode", async () => {
    const { GET } = await import("@/app/api/admin/usage/route");
    const request = new Request("http://localhost/api/admin/usage");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.usage).toBeDefined();
    expect(data.usage.length).toBeGreaterThan(0);

    const row = data.usage[0];
    expect(row.id).toBeDefined();
    expect(row.name).toBeDefined();
    expect(typeof row.patients).toBe("number");
    expect(typeof row.aiConversations).toBe("number");
    expect(typeof row.whatsappMessages).toBe("number");
  });
});
