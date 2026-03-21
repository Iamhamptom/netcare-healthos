import { describe, it, expect, beforeEach } from "vitest";
import { routeToSwitch, getSwitchStatus, getSchemesForSwitch } from "@/lib/healthbridge/switch-router";

describe("Switch Router — routeToSwitch", () => {
  it("should route Discovery Health to healthbridge", () => {
    const route = routeToSwitch("Discovery Health");
    expect(route.provider).toBe("healthbridge");
    expect(route.name).toBe("Healthbridge");
  });

  it("should route GEMS to mediswitch", () => {
    const route = routeToSwitch("GEMS");
    expect(route.provider).toBe("mediswitch");
    expect(route.name).toContain("MediSwitch");
  });

  it("should route CompCare to medikred", () => {
    const route = routeToSwitch("CompCare");
    expect(route.provider).toBe("medikred");
    expect(route.name).toContain("MediKredit");
  });

  it("should route Bonitas to healthbridge", () => {
    const route = routeToSwitch("Bonitas");
    expect(route.provider).toBe("healthbridge");
  });

  it("should route Momentum Health to mediswitch", () => {
    const route = routeToSwitch("Momentum Health");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Bestmed to mediswitch", () => {
    const route = routeToSwitch("Bestmed");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Fedhealth to mediswitch", () => {
    const route = routeToSwitch("Fedhealth");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Polmed to mediswitch", () => {
    const route = routeToSwitch("Polmed");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Sizwe Hosmed to mediswitch", () => {
    const route = routeToSwitch("Sizwe Hosmed");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Medihelp to healthbridge", () => {
    const route = routeToSwitch("Medihelp");
    expect(route.provider).toBe("healthbridge");
  });

  it("should default unknown schemes to healthbridge", () => {
    const route = routeToSwitch("Unknown Scheme XYZ");
    expect(route.provider).toBe("healthbridge");
  });

  it("should handle empty string (defaults to healthbridge)", () => {
    const route = routeToSwitch("");
    expect(route.provider).toBe("healthbridge");
  });

  // Fuzzy matching tests
  it("should fuzzy match case-insensitive (discovery health)", () => {
    const route = routeToSwitch("discovery health");
    expect(route.provider).toBe("healthbridge");
  });

  it("should fuzzy match partial (Discovery)", () => {
    const route = routeToSwitch("Discovery");
    expect(route.provider).toBe("healthbridge");
  });

  it("should fuzzy match partial (gems medical)", () => {
    // "gems" is contained in "GEMS"
    const route = routeToSwitch("gems");
    expect(route.provider).toBe("mediswitch");
  });

  it("should return configured=false when env vars not set", () => {
    const route = routeToSwitch("Discovery Health");
    expect(route.configured).toBe(false);
    expect(route.endpoint).toBe("");
  });

  it("should return the route structure with all fields", () => {
    const route = routeToSwitch("Discovery Health");
    expect(route).toHaveProperty("provider");
    expect(route).toHaveProperty("name");
    expect(route).toHaveProperty("description");
    expect(route).toHaveProperty("configured");
    expect(route).toHaveProperty("endpoint");
  });
});

describe("Switch Router — getSwitchStatus", () => {
  it("should return all 3 switches", () => {
    const status = getSwitchStatus();
    expect(status.total).toBe(3);
    expect(status.switches).toHaveLength(3);
  });

  it("should include healthbridge, mediswitch, medikred", () => {
    const status = getSwitchStatus();
    const providers = status.switches.map(s => s.provider);
    expect(providers).toContain("healthbridge");
    expect(providers).toContain("mediswitch");
    expect(providers).toContain("medikred");
  });

  it("should report configured=0 when no env vars set", () => {
    const status = getSwitchStatus();
    expect(status.configured).toBe(0);
  });

  it("should return proper structure for each switch", () => {
    const status = getSwitchStatus();
    for (const sw of status.switches) {
      expect(sw).toHaveProperty("provider");
      expect(sw).toHaveProperty("name");
      expect(sw).toHaveProperty("description");
      expect(sw).toHaveProperty("configured");
      expect(sw).toHaveProperty("endpoint");
    }
  });
});

describe("Switch Router — getSchemesForSwitch", () => {
  it("should list schemes for healthbridge", () => {
    const schemes = getSchemesForSwitch("healthbridge");
    expect(schemes).toContain("Discovery Health");
    expect(schemes).toContain("Bonitas");
    expect(schemes).toContain("Medihelp");
  });

  it("should list schemes for mediswitch", () => {
    const schemes = getSchemesForSwitch("mediswitch");
    expect(schemes).toContain("GEMS");
    expect(schemes).toContain("Momentum Health");
    expect(schemes).toContain("Bestmed");
  });

  it("should list schemes for medikred", () => {
    const schemes = getSchemesForSwitch("medikred");
    expect(schemes).toContain("CompCare");
  });

  it("should not have overlapping schemes across switches", () => {
    const hb = getSchemesForSwitch("healthbridge");
    const ms = getSchemesForSwitch("mediswitch");
    const mk = getSchemesForSwitch("medikred");

    const allSchemes = [...hb, ...ms, ...mk];
    const uniqueSchemes = new Set(allSchemes);
    expect(allSchemes.length).toBe(uniqueSchemes.size);
  });
});
