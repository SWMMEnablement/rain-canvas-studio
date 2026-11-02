import { describe, it, expect } from 'vitest';
import { generateRainfallData, generateRainfallDataDetailed, eulerTypeIIArrange } from '@/lib/rainfallPatterns';
import { getPatternProvenance } from '@/lib/patternProvenance';
import { stormPatterns } from '@/components/PatternSelector';

const cumulative = (v: number[], dtHr: number) => {
  let c = 0;
  return v.map((x) => (c += x * dtHr));
};

describe('Euler Type II (DWA-A 118)', () => {
  // DWD KOSTRA model-rain printout, Göllheim (RP), T = 5 a, Euler Typ 2, 5-min intervals
  // (Landesamt RLP, Anhang III). 15 min: 4.44, 9.51, 3.00 mm; 30 min: 4.44, 9.51, 3.00, 2.23, 1.76, 1.44 mm.
  const h = [9.51, 13.95, 16.95, 19.18, 20.94, 22.38]; // depth-duration values implied by those blocks

  it('reproduces the DWD 30-minute example block order exactly', () => {
    const out = eulerTypeIIArrange(h);
    [4.44, 9.51, 3.0, 2.23, 1.76, 1.44].forEach((v, i) => expect(out[i]).toBeCloseTo(v, 6));
  });

  it('reproduces the DWD 15-minute example block order exactly', () => {
    const out = eulerTypeIIArrange(h.slice(0, 3));
    [4.44, 9.51, 3.0].forEach((v, i) => expect(out[i]).toBeCloseTo(v, 6));
  });

  it.each([
    [24, 5],
    [24, 15],
    [6, 15],
    [6, 5],
    [2, 5],
  ])('%sh storm at %s-min steps peaks in the interval containing 30%% of the duration', (dur, step) => {
    const v = generateRainfallData('euler2', 1, dur, step);
    const peak = v.indexOf(Math.max(...v));
    const startMin = peak * step;
    const at30 = 0.3 * dur * 60;
    expect(startMin).toBeLessThanOrEqual(at30);
    expect(startMin + step).toBeGreaterThan(at30);
  });

  it('24 h / 5 min peak is at ~7.2 h, not hour 4 (the old bug)', () => {
    const v = generateRainfallData('euler2', 1, 24, 5);
    const peakHr = (v.indexOf(Math.max(...v)) * 5) / 60;
    expect(peakHr).toBeGreaterThan(7);
    expect(peakHr).toBeLessThan(7.3);
  });

  it('rises to the peak and falls after it, conserving depth', () => {
    const v = generateRainfallData('euler2', 2, 6, 15);
    const p = v.indexOf(Math.max(...v));
    for (let i = 1; i <= p; i++) expect(v[i]).toBeGreaterThanOrEqual(v[i - 1]);
    for (let i = p + 1; i < v.length; i++) expect(v[i]).toBeLessThanOrEqual(v[i - 1]);
    expect(cumulative(v, 0.25).at(-1)).toBeCloseTo(2, 9);
  });
});

describe('High-confidence patterns match published ordinates', () => {
  // NRCS WinTR-55 24-h cumulative fractions at whole hours.
  const typeII: Record<number, number> = { 2: 0.022, 4: 0.048, 6: 0.080, 8: 0.120, 10: 0.181, 11: 0.235, 12: 0.663, 13: 0.772, 14: 0.820, 16: 0.880, 18: 0.921, 20: 0.952, 22: 0.977, 24: 1.0 };
  const typeIA: Record<number, number> = { 2: 0.050, 4: 0.116, 6: 0.206, 7: 0.268, 8: 0.425, 9: 0.520, 10: 0.577, 12: 0.664, 16: 0.801, 20: 0.913, 24: 1.0 };

  it.each([
    ['scs2', typeII],
    ['scs1a', typeIA],
  ] as const)('%s cumulative depth at whole hours equals WinTR-55', (id, table) => {
    const cum = cumulative(generateRainfallData(id, 1, 24, 60), 1);
    for (const [hr, frac] of Object.entries(table)) expect(cum[Number(hr) - 1], `${id} @ ${hr} h`).toBeCloseTo(frac, 3);
  });

  it('block storm is exactly uniform', () => {
    const v = generateRainfallData('block', 3, 6, 15);
    v.forEach((x) => expect(x).toBeCloseTo(0.5, 12));
  });

  it('only benchmarked patterns are labelled high', () => {
    const high = stormPatterns.filter((p) => getPatternProvenance(p.id, p.name, p.description).confidence === 'high').map((p) => p.id).sort();
    expect(high).toEqual(['block', 'scs1a', 'scs2']);
  });

  it('Chicago and Huff are not labelled high and state their approximation', () => {
    for (const id of ['chicago', 'huff1', 'huff2', 'huff3', 'huff4']) {
      const p = getPatternProvenance(id);
      expect(p.confidence, id).toBe('medium');
      expect(p.approximation, id).toBeTruthy();
    }
  });
});

describe('fallback behaviour is reported', () => {
  it('normal storms report no fallback', () => {
    expect(generateRainfallDataDetailed('scs2', 1, 24, 15)).toMatchObject({ fallback: 'none', reason: null });
  });

  it('a single-interval storm says the shape cannot show', () => {
    const r = generateRainfallDataDetailed('scs2', 1, 1, 60);
    expect(r.fallback).toBe('single_interval');
    expect(r.values).toEqual([1]);
    expect(r.reason).toMatch(/one interval/);
  });

  it('a formula that breaks at a coarse step says it was rebuilt on a finer grid', () => {
    const r = generateRainfallDataDetailed('desbordes', 1, 2, 60);
    expect(r.fallback).toBe('refined_grid');
    expect(r.reason).toMatch(/finer|resolution/);
    expect(r.values.reduce((a, v) => a + v, 0)).toBeCloseTo(1, 9);
  });
});

describe('exports state source and confidence', () => {
  it('CSV header carries source, confidence, approximation and calculator lines that still re-import', async () => {
    const { buildCsvExport } = await import('@/lib/stormFileExports');
    const { parseRainfallFile } = await import('@/lib/rainfallParsers').catch(() => ({ parseRainfallFile: undefined as any }));
    const v = generateRainfallData('chicago', 2, 6, 15);
    const csv = buildCsvExport(v.map((intensity, i) => ({ time: (i * 15) / 60, intensity })), {
      pattern: 'Chicago Storm', patternId: 'chicago', totalDepth: 2, duration: 6, timeStep: 15, unitSystem: 'USA',
    });
    expect(csv).toMatch(/# Source: +Keifer & Chu/);
    expect(csv).toMatch(/# Confidence: +Medium/);
    expect(csv).toMatch(/# Approximation: +.*r = 0\.4/);
    expect(csv).toMatch(/# Calculator: +pattern formula used directly/);
    if (parseRainfallFile) expect(parseRainfallFile).toBeTypeOf('function');
  });
});
