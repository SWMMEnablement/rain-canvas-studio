import { describe, it, expect } from 'vitest';
import { fitTimeStep } from '../stormValidation';
import { generateRainfallData } from '../rainfallPatterns';

describe('time step must split the storm into whole intervals', () => {
  it('25 min on a 1 h storm snaps to 20 min', () => {
    expect(fitTimeStep(1, 25)).toBe(20);
  });
  it('compatible steps are left alone', () => {
    expect(fitTimeStep(6, 15)).toBe(15);
    expect(fitTimeStep(1, 60)).toBe(60);
  });
  it('balanced storm conserves 2 in over 1 h after snapping', () => {
    const step = fitTimeStep(1, 25);
    const v = generateRainfallData('balanced' as never, 2, 1, step);
    expect(v.length * step).toBe(60);
    expect(v.reduce((s, x) => s + x * step / 60, 0)).toBeCloseTo(2, 3);
  });
});
