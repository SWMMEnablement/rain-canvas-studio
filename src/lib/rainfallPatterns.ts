export type PatternType = 'block' | 'scs2' | 'double' | 'custom';

export function generateRainfallData(
  pattern: PatternType,
  totalDepth: number,
  duration: number,
  timeStep: number
): number[] {
  const numSteps = Math.ceil((duration * 60) / timeStep);
  const data: number[] = [];

  switch (pattern) {
    case 'block': {
      // Uniform intensity
      const intensity = totalDepth / duration;
      for (let i = 0; i < numSteps; i++) {
        data.push(intensity);
      }
      break;
    }

    case 'scs2': {
      // SCS Type II distribution (approximated)
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t < 0.5) {
          // Rising limb - exponential increase
          intensity = (totalDepth / duration) * 0.5 * Math.pow(t / 0.5, 1.5);
        } else {
          // Peak and falling limb
          const peakFactor = Math.exp(-Math.pow((t - 0.5) / 0.15, 2));
          intensity = (totalDepth / duration) * (1.5 + 3.5 * peakFactor);
        }
        data.push(intensity);
      }
      break;
    }

    case 'double': {
      // Double peak distribution
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        // Two Gaussian peaks
        const peak1 = 2.5 * Math.exp(-Math.pow((t - 0.3) / 0.08, 2));
        const peak2 = 2.0 * Math.exp(-Math.pow((t - 0.7) / 0.08, 2));
        const intensity = (totalDepth / duration) * (peak1 + peak2) * 0.8;
        data.push(intensity);
      }
      break;
    }

    case 'custom': {
      // Start with a simple sinusoidal distribution
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        const intensity = (totalDepth / duration) * (1 + Math.sin(t * Math.PI));
        data.push(intensity);
      }
      break;
    }
  }

  return data;
}

export function prepareChartData(
  intensities: number[],
  timeStep: number
): Array<{ time: string; intensity: number }> {
  return intensities.map((intensity, index) => ({
    time: ((index * timeStep) / 60).toFixed(1),
    intensity: parseFloat(intensity.toFixed(4)),
  }));
}

export function prepareExportData(
  intensities: number[],
  timeStep: number
): Array<{ time: number; intensity: number }> {
  return intensities.map((intensity, index) => ({
    time: (index * timeStep) / 60,
    intensity: parseFloat(intensity.toFixed(4)),
  }));
}
