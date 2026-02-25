import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '@/lib/rainfallPatterns';
import { patterns } from '@/components/PatternSelector';

describe('Volume Conservation - All Patterns', () => {
  const depth = 2; // inches
  const duration = 6; // hours
  const timeStep = 15; // minutes
  const tolerance = 0.02; // 2% tolerance

  const testPatterns = patterns.filter(p => p.id !== 'custom');

  it(`should have at least 100 patterns`, () => {
    expect(testPatterns.length).toBeGreaterThanOrEqual(100);
  });

  testPatterns.forEach(p => {
    it(`${p.name} (${p.id}) conserves volume within ${tolerance * 100}%`, () => {
      const intensities = generateRainfallData(p.id, depth, duration, timeStep);
      
      // Volume = sum of (intensity * timeStep_in_hours)
      const volume = intensities.reduce((sum, v) => sum + v * (timeStep / 60), 0);
      const error = Math.abs(volume - depth) / depth;

      expect(intensities.length).toBeGreaterThan(0);
      expect(intensities.every(v => v >= 0)).toBe(true);
      expect(error).toBeLessThan(tolerance);
    });
  });
});
