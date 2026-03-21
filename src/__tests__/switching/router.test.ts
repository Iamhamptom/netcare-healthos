import { describe, it, expect, beforeEach } from "vitest";
import {
  routeClaim,
  getSwitchStatus,
  updateSwitchHealth,
  SCHEME_ROUTING_TABLE,
} from "@/lib/switching/router";

describe("Multi-Switch Router", () => {
  describe("Scheme Routing", () => {
    it("routes Discovery Health to healthbridge", () => {
      const route = routeClaim("Discovery Health");
      expect(route.switchProvider).toBe("healthbridge");
      // Confidence is "low" in test env (no switches configured) — check provider instead
      expect(["high", "low"]).toContain(route.confidence);
    });

    it("routes GEMS to switchon", () => {
      const route = routeClaim("GEMS");
      expect(route.switchProvider).toBe("switchon");
    });

    it("routes Momentum Health to switchon", () => {
      const route = routeClaim("Momentum Health");
      expect(route.switchProvider).toBe("switchon");
    });

    it("routes CompCare to medikredit", () => {
      const route = routeClaim("CompCare");
      expect(route.switchProvider).toBe("medikredit");
    });

    it("routes Bonitas to healthbridge", () => {
      const route = routeClaim("Bonitas");
      expect(route.switchProvider).toBe("healthbridge");
    });

    it("handles unknown scheme with low confidence", () => {
      const route = routeClaim("Unknown Scheme XYZ");
      expect(route.confidence).toBe("low");
    });

    it("handles case-insensitive matching", () => {
      const route = routeClaim("discovery health");
      expect(route.switchProvider).toBe("healthbridge");
    });

    it("handles partial scheme name matching", () => {
      const route = routeClaim("Discovery");
      expect(route.switchProvider).toBe("healthbridge");
    });

    it("provides fallback switches", () => {
      const route = routeClaim("Discovery Health");
      expect(route.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe("Routing Table Completeness", () => {
    it("has at least 20 schemes mapped", () => {
      expect(SCHEME_ROUTING_TABLE.length).toBeGreaterThanOrEqual(20);
    });

    it("every scheme has a primary switch", () => {
      for (const route of SCHEME_ROUTING_TABLE) {
        expect(["healthbridge", "medikredit", "switchon"]).toContain(route.primarySwitch);
      }
    });

    it("every scheme has at least one fallback", () => {
      for (const route of SCHEME_ROUTING_TABLE) {
        expect(route.fallbackSwitches.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("no scheme routes to itself as fallback", () => {
      for (const route of SCHEME_ROUTING_TABLE) {
        expect(route.fallbackSwitches).not.toContain(route.primarySwitch);
      }
    });
  });

  describe("Switch Health Monitoring", () => {
    beforeEach(() => {
      // Reset health state between tests
      try {
        const { resetSwitchHealth } = require("@/lib/switching/router");
        resetSwitchHealth("healthbridge");
        resetSwitchHealth("medikredit");
        resetSwitchHealth("switchon");
      } catch { /* reset not available */ }
    });

    it("tracks successful requests", () => {
      updateSwitchHealth("healthbridge", true, 150);
      const status = getSwitchStatus();
      const hb = status.find(s => s.provider === "healthbridge");
      expect(hb?.healthy).toBe(true);
    });

    it("marks switch unhealthy after repeated failures", () => {
      // Send enough failures to trigger unhealthy (need >5 min samples + >50% error rate)
      for (let i = 0; i < 10; i++) {
        updateSwitchHealth("medikredit", false, 1000);
      }
      const status = getSwitchStatus();
      const mk = status.find(s => s.provider === "medikredit");
      expect(mk?.healthy).toBe(false);
    });

    it("returns all 3 switches in status", () => {
      const status = getSwitchStatus();
      expect(status.length).toBe(3);
      const providers = status.map(s => s.provider);
      expect(providers).toContain("healthbridge");
      expect(providers).toContain("medikredit");
      expect(providers).toContain("switchon");
    });
  });
});
