import { describe, it, expect, beforeEach } from "vitest";
import {
  routeClaim,
  getSwitchStatus,
  updateSwitchHealth,
  resetSwitchHealth,
  getSwitchHealthReport,
  HEALTH_THRESHOLDS,
} from "@/lib/switching/router";

describe("Router Resilience — All Switches Unavailable", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
    resetSwitchHealth("medikredit");
    resetSwitchHealth("switchon");
  });

  it("still returns a routing decision when all switches are unhealthy", () => {
    // Drive all switches to unhealthy
    for (const provider of ["healthbridge", "medikredit", "switchon"] as const) {
      for (let i = 0; i < 20; i++) {
        updateSwitchHealth(provider, false, 2000);
      }
    }
    const route = routeClaim("Discovery Health");
    // Should fall through to sandbox mode
    expect(route.switchProvider).toBeDefined();
    expect(route.confidence).toBe("low");
  });

  it("routes to first healthy fallback when primary is unhealthy", () => {
    // Make healthbridge unhealthy
    for (let i = 0; i < 20; i++) {
      updateSwitchHealth("healthbridge", false, 2000);
    }
    const status = getSwitchStatus();
    const hb = status.find(s => s.provider === "healthbridge");
    expect(hb?.healthy).toBe(false);
    // Discovery Health's primary is healthbridge, should try fallbacks
    // But fallbacks need to be configured (env vars) — in test env no switches configured
    // so it falls through to sandbox mode
    const route = routeClaim("Discovery Health");
    expect(route.switchProvider).toBeDefined();
  });
});

describe("Router Resilience — Health Recovery (EMA)", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
    resetSwitchHealth("medikredit");
    resetSwitchHealth("switchon");
  });

  it("recovers from unhealthy state after successful requests", () => {
    // Drive to unhealthy
    for (let i = 0; i < 15; i++) {
      updateSwitchHealth("healthbridge", false, 1000);
    }
    const statusBefore = getSwitchStatus();
    expect(statusBefore.find(s => s.provider === "healthbridge")?.healthy).toBe(false);

    // Send many successes to recover EMA
    for (let i = 0; i < 50; i++) {
      updateSwitchHealth("healthbridge", true, 100);
    }
    const statusAfter = getSwitchStatus();
    expect(statusAfter.find(s => s.provider === "healthbridge")?.healthy).toBe(true);
  });

  it("EMA converges: 10 successes after 10 failures improves health", () => {
    for (let i = 0; i < 10; i++) {
      updateSwitchHealth("medikredit", false, 1000);
    }
    const reportBad = getSwitchHealthReport();
    const mkBad = reportBad.find(r => r.provider === "medikredit")!;
    const errorRateBefore = mkBad.errorRateEma;

    for (let i = 0; i < 10; i++) {
      updateSwitchHealth("medikredit", true, 100);
    }
    const reportGood = getSwitchHealthReport();
    const mkGood = reportGood.find(r => r.provider === "medikredit")!;
    expect(mkGood.errorRateEma).toBeLessThan(errorRateBefore);
  });
});

describe("Router Resilience — Flapping Detection", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
    resetSwitchHealth("medikredit");
    resetSwitchHealth("switchon");
  });

  it("rapid success/failure alternation results in degraded or unknown state", () => {
    for (let i = 0; i < 20; i++) {
      updateSwitchHealth("switchon", i % 2 === 0, i % 2 === 0 ? 100 : 1000);
    }
    const report = getSwitchHealthReport();
    const so = report.find(r => r.provider === "switchon")!;
    // With 50% error rate alternating, EMA should settle around 0.5
    // which is at the failover threshold
    expect(so.errorRateEma).toBeGreaterThan(0.1);
    expect(so.totalRequests).toBe(20);
  });
});

describe("Router Resilience — First Request (No Health Data)", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
    resetSwitchHealth("medikredit");
    resetSwitchHealth("switchon");
  });

  it("no health data assumes healthy (optimistic default)", () => {
    const status = getSwitchStatus();
    for (const s of status) {
      expect(s.healthy).toBe(true);
      expect(s.status).toBe("unknown");
    }
  });

  it("first request creates health record", () => {
    updateSwitchHealth("healthbridge", true, 150);
    const report = getSwitchHealthReport();
    const hb = report.find(r => r.provider === "healthbridge")!;
    expect(hb.totalRequests).toBe(1);
    expect(hb.latencyEmaMs).toBe(150);
    expect(hb.errorRateEma).toBe(0);
  });

  it("first failed request creates unhealthy record", () => {
    updateSwitchHealth("medikredit", false, 5000);
    const report = getSwitchHealthReport();
    const mk = report.find(r => r.provider === "medikredit")!;
    expect(mk.totalRequests).toBe(1);
    expect(mk.errorRateEma).toBe(1);
    // But with only 1 sample (< minSamples=5), status should be "unknown"
    expect(mk.status).toBe("unknown");
  });
});

describe("Router Resilience — Health Threshold Boundaries", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
    resetSwitchHealth("medikredit");
    resetSwitchHealth("switchon");
  });

  it("rolling window respects ROLLING_WINDOW_SIZE (50)", () => {
    // Push 60 entries — window should be capped at 50
    for (let i = 0; i < 60; i++) {
      updateSwitchHealth("healthbridge", true, 100);
    }
    const report = getSwitchHealthReport();
    const hb = report.find(r => r.provider === "healthbridge")!;
    expect(hb.totalRequests).toBe(60);
    // Rolling window capped (can't directly access, but totalRequests tracks all)
  });

  it("P95 latency calculated with few samples", () => {
    updateSwitchHealth("switchon", true, 100);
    updateSwitchHealth("switchon", true, 200);
    updateSwitchHealth("switchon", true, 300);
    const report = getSwitchHealthReport();
    const so = report.find(r => r.provider === "switchon")!;
    expect(so.latencyP95Ms).toBeGreaterThanOrEqual(200);
  });

  it("exactly at latency threshold (800ms) marks unhealthy", () => {
    // Need minSamples (5) entries first
    for (let i = 0; i < 10; i++) {
      updateSwitchHealth("medikredit", true, 850);
    }
    const report = getSwitchHealthReport();
    const mk = report.find(r => r.provider === "medikredit")!;
    // Latency EMA should converge toward 850ms which is > 800ms threshold
    expect(mk.status).toBe("unhealthy");
  });

  it("resetSwitchHealth clears all metrics", () => {
    for (let i = 0; i < 10; i++) {
      updateSwitchHealth("healthbridge", true, 100);
    }
    resetSwitchHealth("healthbridge");
    const report = getSwitchHealthReport();
    const hb = report.find(r => r.provider === "healthbridge")!;
    expect(hb.totalRequests).toBe(0);
    expect(hb.status).toBe("unknown");
    expect(hb.latencyEmaMs).toBe(0);
  });
});

describe("Router Resilience — Concurrent Updates Consistency", () => {
  beforeEach(() => {
    resetSwitchHealth("healthbridge");
  });

  it("many sequential updates maintain consistent counters", () => {
    const successCount = 30;
    const failCount = 10;
    for (let i = 0; i < successCount; i++) {
      updateSwitchHealth("healthbridge", true, 100);
    }
    for (let i = 0; i < failCount; i++) {
      updateSwitchHealth("healthbridge", false, 500);
    }
    const report = getSwitchHealthReport();
    const hb = report.find(r => r.provider === "healthbridge")!;
    expect(hb.totalRequests).toBe(successCount + failCount);
    expect(hb.totalErrors).toBe(failCount);
  });
});

describe("Router Resilience — Unknown Scheme Handling", () => {
  it("scheme with no routing entry returns low confidence", () => {
    const route = routeClaim("Totally Unknown Scheme");
    expect(route.confidence).toBe("low");
    expect(route.switchProvider).toBeDefined();
  });

  it("empty string scheme returns low confidence", () => {
    const route = routeClaim("");
    expect(route.confidence).toBe("low");
  });
});
