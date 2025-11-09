export type PatternType = 'block' | 'scs2' | 'double' | 'custom' | 'triangular' | 'trapezoidal' | 'fsr';

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

    case 'triangular': {
      // Triangular profile - peak at 1/3 of duration (common UK practice)
      const peakPosition = 0.33;
      const peakIntensity = (2 * totalDepth) / duration;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= peakPosition) {
          // Rising limb
          intensity = peakIntensity * (t / peakPosition);
        } else {
          // Falling limb
          intensity = peakIntensity * (1 - t) / (1 - peakPosition);
        }
        data.push(intensity);
      }
      break;
    }

    case 'trapezoidal': {
      // Trapezoidal profile with sustained peak
      const riseEnd = 0.25;
      const peakEnd = 0.6;
      const peakIntensity = totalDepth / (duration * (riseEnd / 2 + (peakEnd - riseEnd) + (1 - peakEnd) / 2));
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= riseEnd) {
          // Rising limb
          intensity = peakIntensity * (t / riseEnd);
        } else if (t <= peakEnd) {
          // Sustained peak
          intensity = peakIntensity;
        } else {
          // Falling limb
          intensity = peakIntensity * (1 - t) / (1 - peakEnd);
        }
        data.push(intensity);
      }
      break;
    }

    case 'fsr': {
      // FSR (Flood Studies Report) profile - commonly used in UK
      // Based on 75% summer profile with peak at around 40% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // FSR cumulative distribution curve
        if (t <= 0.1) {
          cumulativeFraction = 0.05 * (t / 0.1);
        } else if (t <= 0.3) {
          cumulativeFraction = 0.05 + 0.15 * ((t - 0.1) / 0.2);
        } else if (t <= 0.5) {
          cumulativeFraction = 0.20 + 0.40 * ((t - 0.3) / 0.2);
        } else if (t <= 0.7) {
          cumulativeFraction = 0.60 + 0.25 * ((t - 0.5) / 0.2);
        } else {
          cumulativeFraction = 0.85 + 0.15 * ((t - 0.7) / 0.3);
        }
        
        // Calculate intensity from cumulative (derivative approximation)
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.1) {
          nextCumulative = 0.05 * (nextT / 0.1);
        } else if (nextT <= 0.3) {
          nextCumulative = 0.05 + 0.15 * ((nextT - 0.1) / 0.2);
        } else if (nextT <= 0.5) {
          nextCumulative = 0.20 + 0.40 * ((nextT - 0.3) / 0.2);
        } else if (nextT <= 0.7) {
          nextCumulative = 0.60 + 0.25 * ((nextT - 0.5) / 0.2);
        } else {
          nextCumulative = 0.85 + 0.15 * ((nextT - 0.7) / 0.3);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const incrementalTime = (timeStep / 60);
        const intensity = incrementalDepth / incrementalTime;
        
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
