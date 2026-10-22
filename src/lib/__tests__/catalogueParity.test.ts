import { describe, expect, it } from 'vitest';
import { patterns, stormPatterns, stormPatternCount } from '@/components/PatternSelector';
import { CANONICAL_PATTERN_IDS } from '../../../supabase/functions/_shared/patternCatalog';
import { generateRainfallData } from '@/lib/rainfallPatterns';

const addedIds = ['angola_inamet', 'brunei_bdmd', 'burkina_anam', 'congo_mettelsat', 'laos_dmh', 'mali_dnm', 'rwanda_meteo', 'senegal_anacim', 'zambia_zmd', 'zimbabwe_zmd'];

describe('App and API catalogue parity', () => {
  it('lists exactly the same predefined storm IDs as the API', () => {
    expect(stormPatterns.map(p => p.id).sort()).toEqual([...CANONICAL_PATTERN_IDS].sort());
    expect(new Set(stormPatterns.map(p => p.id)).size).toBe(stormPatternCount);
  });
  it('counts 339 storms without counting the Custom editor', () => {
    expect(stormPatternCount).toBe(339);
    expect(patterns.filter(p => p.id === 'custom')).toHaveLength(1);
    expect(stormPatterns.some(p => p.id === 'custom')).toBe(false);
  });
  it.each(addedIds)('makes %s selectable with conserved rainfall depth', id => {
    const pattern = stormPatterns.find(p => p.id === id);
    expect(pattern).toBeDefined();
    if (!pattern) throw new Error(`Missing catalogue storm: ${id}`);
    const data = generateRainfallData(pattern.id, 2, 6, 15);
    expect(data).toHaveLength(24);
    expect(data.every(value => Number.isFinite(value) && value >= 0)).toBe(true);
    expect(data.reduce((sum, intensity) => sum + intensity * 15 / 60, 0)).toBeCloseTo(2, 9);
  });
});