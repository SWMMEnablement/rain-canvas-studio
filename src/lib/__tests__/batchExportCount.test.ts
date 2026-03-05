import { describe, it, expect } from 'vitest';
import { patterns } from '@/components/PatternSelector';
import { generateRainfallData, type PatternType } from '@/lib/rainfallPatterns';

describe('Batch SWMM5 Export Verification', () => {
  const computationalPatterns = patterns.filter(p => p.id !== 'custom');

  it('should have exactly 263 computational patterns', () => {
    console.log(`Total patterns: ${patterns.length}, Computational: ${computationalPatterns.length}`);
    expect(computationalPatterns.length).toBe(263);
  });

  it('all 263 patterns generate valid rainfall data for export', () => {
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
    expect(success).toBe(263);
  });
});
