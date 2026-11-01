import { describe, it, expect } from "vitest";
import { generateRainfallData } from "@/lib/rainfallPatterns";
import { CANONICAL_PATTERN_IDS } from "../../../supabase/functions/_shared/patternCatalog";

const steps = [1, 2, 5, 10, 15, 20, 25, 30, 60];

describe("storms with one or a few intervals give a valid series", () => {
  for (const step of steps) {
    for (const k of [1, 2, 3]) {
      it(`${k} interval(s) of ${step} min: finite, non-negative, conserves 50 mm for every pattern`, () => {
        const bad: string[] = [];
        for (const id of CANONICAL_PATTERN_IDS) {
          const r = generateRainfallData(id as never, 50, (k * step) / 60, step);
          const depth = r.reduce((a, v) => a + (v * step) / 60, 0);
          if (r.length !== k || !r.every((v) => Number.isFinite(v) && v >= 0) || Math.abs(depth - 50) > 1e-6) bad.push(id);
        }
        expect(bad).toEqual([]);
      });
    }
  }

  it("a single 60-min interval of a 1-h, 50 mm storm is 50 mm/hr", () => {
    expect(generateRainfallData("scs2", 50, 1, 60)).toEqual([50]);
  });
});
