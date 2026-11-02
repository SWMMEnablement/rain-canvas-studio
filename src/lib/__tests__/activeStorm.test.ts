import { describe, it, expect } from "vitest";
import { nextClimateScenario, describeActiveStorm } from "@/lib/activeStorm";
import { buildPermalink, parsePermalinkParams, encodeStormParams, decodeStormParams } from "@/components/StormWizard";

describe("climate setting in share links", () => {
  it("readable permalink keeps the climate scenario", () => {
    const url = buildPermalink(
      { pattern: "singapore_pub" as never, depth: 100, duration: 3, timeStep: 15, unitSystem: "SI", climateScenario: "2100" },
      "https://x.test",
      "/",
    );
    expect(new URL(url).searchParams.get("cc")).toBe("2100");
    expect(parsePermalinkParams(new URL(url).search)?.climateScenario).toBe("2100");
  });

  it("legacy ?storm= links keep the climate scenario", () => {
    const enc = encodeStormParams({ pattern: "feh" as never, depth: 2, duration: 6, timeStep: 15, unitSystem: "USA", climateScenario: "upper_2080" });
    expect(decodeStormParams(enc)?.climateScenario).toBe("upper_2080");
  });

  it("first load keeps the scenario from the link", () => {
    expect(nextClimateScenario(null, "singapore_pub", "2100")).toBe("2100");
  });

  it("re-render with the same pattern keeps the scenario", () => {
    expect(nextClimateScenario("singapore_pub", "singapore_pub", "2100")).toBe("2100");
  });

  it("switching to a different pattern clears the scenario", () => {
    expect(nextClimateScenario("singapore_pub", "scs2", "2100")).toBe("none");
  });
});

describe("active storm summary", () => {
  it("shows the uplifted depth and factor", () => {
    expect(
      describeActiveStorm({
        pattern: "scs2", patternName: "SCS Type II", depth: 2, effectiveDepth: 2.4, duration: 24,
        timeStep: 15, unitSystem: "USA", climateScenario: "x", climateFactor: 1.2,
      }),
    ).toBe("SCS Type II · 2.40 in (climate ×1.20) · 24 h · 15 min");
  });
});
