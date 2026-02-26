import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '@/lib/rainfallPatterns';

describe('SA SCS Type 1-4 Volume Conservation', () => {
  const depth = 2; // inches
  const duration = 24; // hours (fixed for SCS-SA)
  const timeStep = 5; // minutes (5-min intervals as per spec)
  const tolerance = 0.02;

  (['sa_scs1', 'sa_scs2', 'sa_scs3', 'sa_scs4'] as const).forEach(patternId => {
    it(`${patternId} conserves volume within ${tolerance * 100}%`, () => {
      const intensities = generateRainfallData(patternId, depth, duration, timeStep);
      const timeStepHours = timeStep / 60;
      const totalVolume = intensities.reduce((sum, v) => sum + v * timeStepHours, 0);
      const error = Math.abs(totalVolume - depth) / depth;

      console.log(`${patternId}: ${intensities.length} steps, volume=${totalVolume.toFixed(6)}, error=${(error*100).toFixed(4)}%, peak=${Math.max(...intensities).toFixed(4)}`);

      expect(intensities.length).toBe(288); // 24h / 5min = 288
      expect(intensities.every(v => v >= 0)).toBe(true);
      expect(error).toBeLessThan(tolerance);
    });
  });

  it('all 4 types produce distinct peak intensities', () => {
    const peaks = (['sa_scs1', 'sa_scs2', 'sa_scs3', 'sa_scs4'] as const).map(p => {
      const i = generateRainfallData(p, depth, duration, timeStep);
      return Math.max(...i);
    });
    // All peaks should be different
    const unique = new Set(peaks.map(p => p.toFixed(4)));
    expect(unique.size).toBe(4);
  });
});
