import { describe, it, expect } from 'vitest';
import { generateRainfallData } from '../rainfallPatterns';
import { convertDepth } from '../unitConversions';

// A 1-inch storm and a 25.4-mm storm must be the same physical event once
// the wizard normalises engine output (display units) to in/hr for chart/exports.
describe('metric storm is converted once', () => {
  it('25.4 mm one-hour block storm equals 1 in after normalisation', () => {
    const mm = generateRainfallData('block' as never, 25.4, 1, 15);
    const inches = mm.map(v => convertDepth(v, 'SI', 'USA'));
    const totalIn = inches.reduce((s, v) => s + v * 0.25, 0);
    expect(totalIn).toBeCloseTo(1, 4);
    // Re-display in SI must give 25.4 mm, not 645.16 mm
    const totalMm = inches.reduce((s, v) => s + convertDepth(v, 'USA', 'SI') * 0.25, 0);
    expect(totalMm).toBeCloseTo(25.4, 3);
  });
});
