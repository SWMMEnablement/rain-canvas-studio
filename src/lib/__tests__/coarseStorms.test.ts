import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '../rainfallPatterns';
import { CANONICAL_PATTERN_IDS } from '../../../supabase/functions/_shared/patternCatalog';

// Every pattern must give finite, non-negative rainfall that adds up to the requested depth,
// even for 1-hour storms split into one, two or three intervals (e.g. Cyprus WDD used to return NaN).
describe.each([[1, 60], [1, 30], [1, 20]])('2 in over %s h at %s min', (d, s) => {
  it.each(CANONICAL_PATTERN_IDS.filter((id) => id !== 'custom'))('%s', (id) => {
    const v = generateRainfallData(id as never, 2, d, s);
    expect(v.every((x) => Number.isFinite(x) && x >= 0)).toBe(true);
    expect(v.reduce((a, x) => a + (x * s) / 60, 0)).toBeCloseTo(2, 1);
  });
});
