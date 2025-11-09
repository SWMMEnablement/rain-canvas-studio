export type PatternType = 'block' | 'scs2' | 'double' | 'custom' | 'triangular' | 'trapezoidal' | 'fsr' | 'chicago' | 'huff1' | 'huff2' | 'huff3' | 'huff4' | 'desbordes' | 'arr';

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

    case 'chicago': {
      // Chicago/Alternating Block Method - widely used internationally
      // Peak positioned at 40% of duration (r = 0.4)
      const r = 0.4; // advancement coefficient
      const peakPosition = Math.floor(numSteps * r);
      
      // Generate IDF-based intensities and sort
      const blocks: Array<{ time: number; intensity: number }> = [];
      
      for (let i = 0; i < numSteps; i++) {
        const durationHrs = ((i + 1) * timeStep) / 60;
        // Simplified IDF: i = a / (duration + b)^c, normalized to match total depth
        const intensity = totalDepth / (duration * Math.pow(durationHrs / duration, 0.6));
        blocks.push({ time: i, intensity });
      }
      
      // Sort by intensity descending
      blocks.sort((a, b) => b.intensity - a.intensity);
      
      // Alternate placement around peak
      const orderedData: number[] = new Array(numSteps).fill(0);
      orderedData[peakPosition] = blocks[0].intensity;
      
      let leftIdx = peakPosition - 1;
      let rightIdx = peakPosition + 1;
      
      for (let i = 1; i < blocks.length; i++) {
        if (i % 2 === 1 && leftIdx >= 0) {
          orderedData[leftIdx] = blocks[i].intensity;
          leftIdx--;
        } else if (rightIdx < numSteps) {
          orderedData[rightIdx] = blocks[i].intensity;
          rightIdx++;
        } else if (leftIdx >= 0) {
          orderedData[leftIdx] = blocks[i].intensity;
          leftIdx--;
        }
      }
      
      return orderedData;
    }

    case 'huff1': {
      // Huff 1st Quartile - peak in first 25% of storm
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          // Most rainfall in first quartile - rapid rise
          cumulativeFraction = 0.65 * Math.pow(t / 0.25, 0.7);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.65 + 0.20 * ((t - 0.25) / 0.25);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.25) {
          nextCumulative = 0.65 * Math.pow(nextT / 0.25, 0.7);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.65 + 0.20 * ((nextT - 0.25) / 0.25);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'huff2': {
      // Huff 2nd Quartile - peak in 25-50% of storm
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          cumulativeFraction = 0.20 * (t / 0.25);
        } else if (t <= 0.50) {
          // Peak in second quartile
          cumulativeFraction = 0.20 + 0.50 * Math.pow((t - 0.25) / 0.25, 0.7);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.70 + 0.20 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.25) {
          nextCumulative = 0.20 * (nextT / 0.25);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.20 + 0.50 * Math.pow((nextT - 0.25) / 0.25, 0.7);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.70 + 0.20 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'huff3': {
      // Huff 3rd Quartile - peak in 50-75% of storm
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          cumulativeFraction = 0.15 * (t / 0.25);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.15 + 0.20 * ((t - 0.25) / 0.25);
        } else if (t <= 0.75) {
          // Peak in third quartile
          cumulativeFraction = 0.35 + 0.45 * Math.pow((t - 0.50) / 0.25, 0.7);
        } else {
          cumulativeFraction = 0.80 + 0.20 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.25) {
          nextCumulative = 0.15 * (nextT / 0.25);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.15 + 0.20 * ((nextT - 0.25) / 0.25);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.35 + 0.45 * Math.pow((nextT - 0.50) / 0.25, 0.7);
        } else {
          nextCumulative = 0.80 + 0.20 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'huff4': {
      // Huff 4th Quartile - peak in final 25% of storm
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          cumulativeFraction = 0.10 * (t / 0.25);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.10 + 0.15 * ((t - 0.25) / 0.25);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.25 + 0.15 * ((t - 0.50) / 0.25);
        } else {
          // Peak in fourth quartile
          cumulativeFraction = 0.40 + 0.60 * Math.pow((t - 0.75) / 0.25, 0.7);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.25) {
          nextCumulative = 0.10 * (nextT / 0.25);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.10 + 0.15 * ((nextT - 0.25) / 0.25);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.25 + 0.15 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.40 + 0.60 * Math.pow((nextT - 0.75) / 0.25, 0.7);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'desbordes': {
      // Desbordes double-triangle pattern (French standard)
      const peak1Time = 0.3;
      const valley = 0.5;
      const peak2Time = 0.7;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= peak1Time) {
          // Rising to first peak
          intensity = (2.2 * totalDepth / duration) * (t / peak1Time);
        } else if (t <= valley) {
          // Falling from first peak to valley
          intensity = (2.2 * totalDepth / duration) * (1 - (t - peak1Time) / (valley - peak1Time)) * 0.5;
        } else if (t <= peak2Time) {
          // Rising to second peak
          intensity = (1.8 * totalDepth / duration) * ((t - valley) / (peak2Time - valley)) * 0.8;
        } else {
          // Falling from second peak
          intensity = (1.8 * totalDepth / duration) * (1 - (t - peak2Time) / (1 - peak2Time)) * 0.8;
        }
        
        data.push(Math.max(0, intensity));
      }
      break;
    }

    case 'arr': {
      // Australian Rainfall & Runoff - ensemble temporal pattern
      // Using median pattern with characteristic Australian distribution
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // ARR temporal pattern (simplified median)
        if (t <= 0.1) {
          cumulativeFraction = 0.03 * (t / 0.1);
        } else if (t <= 0.3) {
          cumulativeFraction = 0.03 + 0.12 * ((t - 0.1) / 0.2);
        } else if (t <= 0.5) {
          cumulativeFraction = 0.15 + 0.50 * Math.pow((t - 0.3) / 0.2, 0.8);
        } else if (t <= 0.7) {
          cumulativeFraction = 0.65 + 0.25 * ((t - 0.5) / 0.2);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.7) / 0.3);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.1) {
          nextCumulative = 0.03 * (nextT / 0.1);
        } else if (nextT <= 0.3) {
          nextCumulative = 0.03 + 0.12 * ((nextT - 0.1) / 0.2);
        } else if (nextT <= 0.5) {
          nextCumulative = 0.15 + 0.50 * Math.pow((nextT - 0.3) / 0.2, 0.8);
        } else if (nextT <= 0.7) {
          nextCumulative = 0.65 + 0.25 * ((nextT - 0.5) / 0.2);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.7) / 0.3);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
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
