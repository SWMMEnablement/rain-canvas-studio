import { describe, it, expect } from 'vitest';
import { generateRainfallData, type PatternType } from '@/lib/rainfallPatterns';
import { PATTERN_ALIASES, canonicalPatternId } from '../../../supabase/functions/_shared/patternCatalog';
import { patterns } from '@/components/PatternSelector';
import { resolvePatternSlug } from '@/components/StormWizard';

describe('Merged duplicate patterns', () => {
  it('merges 234 duplicates', () => {
    expect(Object.keys(PATTERN_ALIASES).length).toBe(234);
  });
  it('every merged pattern gives exactly the canonical storm', () => {
    for (const [alias, canon] of Object.entries(PATTERN_ALIASES)) {
      for (const [d, s] of [[6, 15], [24, 5], [3, 10]]) {
        const a = generateRainfallData(alias as PatternType, 2, d, s);
        const c = generateRainfallData(canon as PatternType, 2, d, s);
        expect(a.length).toBe(c.length);
        expect(Math.max(...a.map((v, i) => Math.abs(v - c[i])))).toBeLessThan(1e-9);
      }
    }
  });
  it('each storm appears once in the catalogue', () => {
    expect(patterns.some((p) => p.id in PATTERN_ALIASES)).toBe(false);
  });
  it('old links open the canonical pattern', () => {
    expect(canonicalPatternId('neom_design')).toBe('neom_design' in PATTERN_ALIASES ? PATTERN_ALIASES.neom_design : 'neom_design');
    expect(resolvePatternSlug('swiss_idf')).toBe('chicago');
  });
});
