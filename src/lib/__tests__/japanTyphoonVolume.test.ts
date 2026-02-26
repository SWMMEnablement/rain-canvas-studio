import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '@/lib/rainfallPatterns';

describe('Japan Typhoon CSV Export & Volume Conservation', () => {
  const depth = 2; // inches
  const duration = 6; // hours
  const timeStep = 15; // minutes

  it('generates correct data and total depth matches input', () => {
    const intensities = generateRainfallData('japan_typhoon', depth, duration, timeStep);
    const timeStepHours = timeStep / 60;
    
    // Calculate total volume (depth) = sum of intensity * timeStep in hours
    const totalVolume = intensities.reduce((sum, v) => sum + v * timeStepHours, 0);
    
    console.log(`Pattern: Japan Typhoon`);
    console.log(`Input depth: ${depth} in`);
    console.log(`Duration: ${duration} h, Time step: ${timeStep} min`);
    console.log(`Number of intervals: ${intensities.length}`);
    console.log(`Computed total depth: ${totalVolume.toFixed(6)} in`);
    console.log(`Error: ${((Math.abs(totalVolume - depth) / depth) * 100).toFixed(4)}%`);
    console.log(`Peak intensity: ${Math.max(...intensities).toFixed(4)} in/hr`);
    console.log(`Min intensity: ${Math.min(...intensities).toFixed(4)} in/hr`);
    
    // Build CSV rows for manual inspection
    const csvRows = intensities.map((intensity, i) => {
      const timeHr = (i * timeStep / 60).toFixed(2);
      const incrementalDepth = (intensity * timeStepHours).toFixed(6);
      return `${timeHr},${intensity.toFixed(6)},${incrementalDepth}`;
    });
    console.log('\nCSV Preview (Time_hr, Intensity_in_hr, Incremental_Depth_in):');
    console.log('time_hr,intensity_in_hr,depth_in');
    csvRows.forEach(row => console.log(row));
    console.log(`\nSum of incremental depths: ${totalVolume.toFixed(6)} in`);

    // Volume should be within 2% of input depth
    expect(intensities.length).toBe(24); // 6h / 15min = 24
    expect(intensities.every(v => v >= 0)).toBe(true);
    const error = Math.abs(totalVolume - depth) / depth;
    expect(error).toBeLessThan(0.02);
  });
});
