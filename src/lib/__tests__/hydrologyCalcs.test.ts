import { describe, it, expect } from "vitest";
import {
  toRunoffTransfer, scsRunoff, routeModifiedPuls, unitHydrograph, incrementalExcess, convolve, accountLid,
} from "@/lib/hydrologyCalcs";

describe("runoff → detention transfer", () => {
  it("CN 75, 100 mm metric runoff (≈41.137 mm) reaches detention as ≈1.6196 in", () => {
    const Q = scsRunoff(100, 75, 0.2, true);
    expect(Q).toBeCloseTo(41.137, 2);
    const t = toRunoffTransfer(Q, 4, "metric")!;
    expect(t.depthIn).toBeCloseTo(1.6196, 3);
    expect(t.areaAcres).toBeCloseTo(9.884, 2);
  });

  it("detention storage with correct units is ≈1.026 ac-ft (10 ac, 0.5 in pre, SF 1.1)", () => {
    const t = toRunoffTransfer(scsRunoff(100, 75, 0.2, true), 10 / 2.471053814671653, "metric")!;
    const storageAcFt = ((t.depthIn - 0.5) * t.areaAcres * 1.1) / 12;
    expect(storageAcFt).toBeCloseTo(1.026, 2);
  });

  it("a zero-runoff result is passed on, not ignored", () => {
    expect(toRunoffTransfer(0, 10, "us")).toEqual({ depthIn: 0, areaAcres: 10 });
  });
});

describe("Modified Puls", () => {
  it("keeps inflow as storage below an elevated outlet (review case: 1,800 ft³ retained)", () => {
    const sso = [
      { stage: 0, storage: 0, outflow: 0 },
      { stage: 1, storage: 2500, outflow: 0 },
      { stage: 2, storage: 10000, outflow: 8 },
    ];
    const inflow = [{ time: 0, inflow: 0 }, { time: 360 / 3600, inflow: 10 }];
    const r = routeModifiedPuls(inflow, sso);
    expect(r.inflowVolume).toBeCloseTo(1800, 6);
    expect(r.rows[1].outflow).toBe(0);
    expect(r.finalStorage).toBeCloseTo(1800, 6);
    expect(Math.abs(r.continuityResidual)).toBeLessThan(1e-6);
  });

  it("closes the water balance for a full hydrograph", () => {
    const sso = Array.from({ length: 11 }, (_, i) => ({ stage: i, storage: i * 20000, outflow: i * i * 2 }));
    const inflow = Array.from({ length: 25 }, (_, i) => ({ time: i * 0.25, inflow: i <= 8 ? i * 10 : Math.max(0, 80 - (i - 8) * 5) }));
    const r = routeModifiedPuls(inflow, sso);
    expect(Math.abs(r.continuityResidual)).toBeLessThan(1e-6 * r.inflowVolume);
    expect(r.tableExceeded).toBe(false);
  });

  it("flags a hydrograph that overtops the storage table", () => {
    const sso = [{ stage: 0, storage: 0, outflow: 0 }, { stage: 1, storage: 1000, outflow: 1 }];
    const r = routeModifiedPuls([{ time: 0, inflow: 0 }, { time: 1, inflow: 100 }], sso);
    expect(r.tableExceeded).toBe(true);
  });
});

describe("unit hydrograph convolution", () => {
  const uh = unitHydrograph({ areaAcres: 100, tcHours: 0.5, dtHours: 0.1, method: "dimensionless" });

  it("unit hydrograph holds exactly one inch over the watershed", () => {
    const vol = uh.ordinates.reduce((a, q) => a + q, 0) * 0.1 * 3600;
    expect(vol).toBeCloseTo((1 / 12) * 100 * 43560, 6);
  });

  it("storm hydrograph volume equals SCS runoff depth × area", () => {
    const depths = new Array(60).fill(4 / 60);
    const ex = incrementalExcess(depths, 75);
    const q = convolve(ex, uh.ordinates);
    const vol = q.reduce((a, v) => a + v, 0) * 0.1 * 3600;
    expect(vol).toBeCloseTo((scsRunoff(4, 75) / 12) * 100 * 43560, 3);
  });

  it("storm duration changes the hydrograph: a 6-h storm peaks lower than a 1-h storm of the same depth", () => {
    const peak = (hours: number) => {
      const n = Math.round(hours / 0.1);
      const q = convolve(incrementalExcess(new Array(n).fill(4 / n), 75), uh.ordinates);
      return Math.max(...q);
    };
    expect(peak(6)).toBeLessThan(peak(1));
  });
});

describe("LID accounting", () => {
  it("nine 5,000 ft² BMPs on a 1-acre site never capture more than the site runoff", () => {
    const units = Array.from({ length: 9 }, (_, i) => ({ id: String(i), tributaryArea: 5000, capacity: 1e6, overflowTo: null }));
    const depth = scsRunoff(1, 85);
    const r = accountLid(units, 43560, depth);
    expect(r.overAllocated).toBe(true);
    expect(r.totalCaptured).toBeLessThanOrEqual(r.siteRunoff + 1e-9);
    expect(r.netRunoff).toBeGreaterThanOrEqual(0);
  });

  it("overflow passed downstream is captured once, not twice", () => {
    const r = accountLid(
      [
        { id: "a", tributaryArea: 10000, capacity: 100, overflowTo: "b" },
        { id: "b", tributaryArea: 0, capacity: 1e6, overflowTo: null },
      ],
      43560, 1.2,
    );
    expect(r.units[1].upstreamInflow).toBeCloseTo(1000 - 100, 9);
    expect(r.totalCaptured).toBeCloseTo(1000, 9);
  });
});
