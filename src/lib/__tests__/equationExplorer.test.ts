import { describe, it, expect } from "vitest";
import { explorerValues } from "@/lib/equationExplorer";
import { generateRainfallData } from "@/lib/rainfallPatterns";

describe("equation explorer matches the storm calculator", () => {
  it("SCS Type II, 100 mm / 24 h: 66.3 mm accumulated at hour 12", () => {
    const v = explorerValues("scs2", 0.5, 100, 24, 15)!;
    expect(v.cumulativeDepth).toBeCloseTo(66.3, 1);
  });

  it("SCS Type II reference ordinates at hours 11 and 13", () => {
    expect(explorerValues("scs2", 11 / 24, 100, 24, 6)!.cumulativeDepth).toBeCloseTo(23.5, 1);
    expect(explorerValues("scs2", 13 / 24, 100, 24, 6)!.cumulativeDepth).toBeCloseTo(77.2, 1);
  });

  it("triangular reaches the full 100 mm at the end of the storm", () => {
    expect(explorerValues("triangular", 1, 100, 6, 15)!.cumulativeDepth).toBeCloseTo(100, 6);
  });

  it.each(["scs2", "triangular"] as const)("%s explorer equals cumulative generated rainfall at every interval boundary", (p) => {
    const series = generateRainfallData(p, 100, 6, 15);
    let cum = 0;
    series.forEach((v, k) => {
      cum += v * 0.25;
      const e = explorerValues(p, (k + 1) / series.length, 100, 6, 15)!;
      expect(e.cumulativeDepth).toBeCloseTo(cum, 9);
      expect(explorerValues(p, (k + 0.5) / series.length, 100, 6, 15)!.i).toBeCloseTo(v, 9);
    });
  });
});
