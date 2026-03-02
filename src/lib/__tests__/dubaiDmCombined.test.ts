import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '../rainfallPatterns';

describe('Dubai DM Combined peak intensity', () => {
  it('should produce ~98.7 mm/hr peak at 33.3mm/60min/5min', () => {
    const intensities = generateRainfallData('dubai_dm_combined', 33.3, 1, 5);
    console.log('Intensities:', intensities);
    console.log('Peak:', Math.max(...intensities));
    console.log('NumSteps:', intensities.length);
    
    expect(intensities.length).toBe(12);
    
    const peak = Math.max(...intensities);
    // Peak should be around 98.7 mm/hr, not 2600
    expect(peak).toBeGreaterThan(80);
    expect(peak).toBeLessThan(120);
  });
});
