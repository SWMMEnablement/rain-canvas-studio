import { describe, it, expect } from 'vitest';
import { getPatternProvenance, NAMED_SOURCE_IDS } from '@/lib/patternProvenance';
import { patterns } from '@/components/PatternSelector';
import { CANONICAL_PATTERN_IDS } from '../../../supabase/functions/_shared/patternCatalog';

describe('pattern source notes and confidence', () => {
  it('every pattern in the catalogue has a source note and a confidence level', () => {
    for (const p of patterns) {
      const v = getPatternProvenance(p.id, p.name, p.description);
      expect(v.source.length, p.id).toBeGreaterThan(10);
      expect(['high', 'medium', 'low'], p.id).toContain(v.confidence);
    }
  });

  it('named sources only refer to patterns that exist in the catalogue', () => {
    const ids = new Set<string>(CANONICAL_PATTERN_IDS);
    expect(NAMED_SOURCE_IDS.filter((id) => !ids.has(id))).toEqual([]);
  });

  it('SCS Type II (TR-55 table) is high; app-written synthetic profiles are low', () => {
    expect(getPatternProvenance('scs2').confidence).toBe('high');
    const synthetic = patterns.find((p) => /^Synthetic/.test(p.description))!;
    expect(getPatternProvenance(synthetic.id, synthetic.name, synthetic.description).confidence).toBe('low');
  });
});
