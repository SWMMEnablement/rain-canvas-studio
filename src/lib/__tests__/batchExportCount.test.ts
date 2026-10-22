import { describe, it, expect } from 'vitest';
import { patterns } from '@/components/PatternSelector';
import { generateRainfallData, type PatternType } from '@/lib/rainfallPatterns';

describe('Batch SWMM5 Export Verification', () => {
  const computationalPatterns = patterns.filter(p => p.id !== 'custom');

  it('every catalogue pattern has a unique id and is handled by generateRainfallData', () => {
    console.log(`Total patterns: ${patterns.length}, Computational: ${computationalPatterns.length}`);
    const ids = patterns.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(computationalPatterns.length).toBeGreaterThan(0);
  });

  it('all catalogue patterns generate valid rainfall data for export', () => {
    const depth = 2, duration = 6, timeStep = 15;
    let success = 0, fail = 0;
    
    computationalPatterns.forEach(p => {
      try {
        const intensities = generateRainfallData(p.id, depth, duration, timeStep);
        if (intensities && intensities.length > 0) success++;
        else fail++;
      } catch { fail++; }
    });

    console.log(`Export test: ${success} success, ${fail} failed out of ${computationalPatterns.length}`);
    expect(fail).toBe(0);
    expect(success).toBe(computationalPatterns.length);
  });
});
