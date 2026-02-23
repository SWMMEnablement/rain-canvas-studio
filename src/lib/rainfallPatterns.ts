export type PatternType = 'block' | 'scs1' | 'scs1a' | 'scs2' | 'scs3' | 'double' | 'custom' | 'triangular' | 'trapezoidal' | 'fsr' | 'chicago' | 'huff1' | 'huff2' | 'huff3' | 'huff4' | 'desbordes' | 'arr' | 'jma' | 'china' | 'sa_huff' | 'dwa' | 'dutch' | 'italian' | 'balanced' | 'fdot1' | 'fdot2' | 'fdot3' | 'fdot4' | 'fdot5' | 'txdot' | 'yen_chow' | 'noaa_a14';

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

    case 'scs1': {
      // SCS Type I distribution - Pacific maritime climate
      // Peak occurs earlier (around 40% of duration)
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // SCS Type I cumulative distribution approximation
        if (t <= 0.4) {
          cumulativeFraction = 0.50 * Math.pow(t / 0.4, 0.8);
        } else if (t <= 0.6) {
          cumulativeFraction = 0.50 + 0.35 * ((t - 0.4) / 0.2);
        } else {
          cumulativeFraction = 0.85 + 0.15 * ((t - 0.6) / 0.4);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.4) {
          nextCumulative = 0.50 * Math.pow(nextT / 0.4, 0.8);
        } else if (nextT <= 0.6) {
          nextCumulative = 0.50 + 0.35 * ((nextT - 0.4) / 0.2);
        } else {
          nextCumulative = 0.85 + 0.15 * ((nextT - 0.6) / 0.4);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'scs1a': {
      // SCS Type IA distribution - Pacific Northwest coastal
      // Very early peak (around 35% of duration)
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // SCS Type IA cumulative distribution approximation
        if (t <= 0.35) {
          cumulativeFraction = 0.55 * Math.pow(t / 0.35, 0.75);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.55 + 0.30 * ((t - 0.35) / 0.2);
        } else {
          cumulativeFraction = 0.85 + 0.15 * ((t - 0.55) / 0.45);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.35) {
          nextCumulative = 0.55 * Math.pow(nextT / 0.35, 0.75);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.55 + 0.30 * ((nextT - 0.35) / 0.2);
        } else {
          nextCumulative = 0.85 + 0.15 * ((nextT - 0.55) / 0.45);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'scs2': {
      // SCS Type II distribution - Most of US (moderate climate)
      // Peak at approximately 50% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // SCS Type II cumulative distribution approximation
        if (t <= 0.5) {
          cumulativeFraction = 0.35 * Math.pow(t / 0.5, 0.9);
        } else if (t <= 0.6) {
          cumulativeFraction = 0.35 + 0.45 * ((t - 0.5) / 0.1);
        } else {
          cumulativeFraction = 0.80 + 0.20 * ((t - 0.6) / 0.4);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.5) {
          nextCumulative = 0.35 * Math.pow(nextT / 0.5, 0.9);
        } else if (nextT <= 0.6) {
          nextCumulative = 0.35 + 0.45 * ((nextT - 0.5) / 0.1);
        } else {
          nextCumulative = 0.80 + 0.20 * ((nextT - 0.6) / 0.4);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'scs3': {
      // SCS Type III distribution - Gulf Coast and high rainfall areas
      // Very sharp peak at approximately 50% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // SCS Type III cumulative distribution approximation
        if (t <= 0.5) {
          cumulativeFraction = 0.25 * Math.pow(t / 0.5, 1.0);
        } else if (t <= 0.58) {
          cumulativeFraction = 0.25 + 0.50 * ((t - 0.5) / 0.08);
        } else {
          cumulativeFraction = 0.75 + 0.25 * ((t - 0.58) / 0.42);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.5) {
          nextCumulative = 0.25 * Math.pow(nextT / 0.5, 1.0);
        } else if (nextT <= 0.58) {
          nextCumulative = 0.25 + 0.50 * ((nextT - 0.5) / 0.08);
        } else {
          nextCumulative = 0.75 + 0.25 * ((nextT - 0.58) / 0.42);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
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

    case 'jma': {
      // Japan Meteorological Agency (JMA) pattern
      // Center-peaked pattern typical of Japanese typhoon-based design storms
      const peakPosition = 0.5;
      const peakIntensity = (2.4 * totalDepth) / duration;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        // Sharp center peak with asymmetric limbs (steeper rise than fall)
        if (t <= peakPosition) {
          // Rising limb - power curve for rapid intensification
          intensity = peakIntensity * Math.pow(t / peakPosition, 1.2);
        } else {
          // Falling limb - exponential decay typical of typhoon passage
          const decay = Math.exp(-2.5 * (t - peakPosition) / (1 - peakPosition));
          intensity = peakIntensity * decay;
        }
        
        data.push(intensity);
      }
      break;
    }

    case 'china': {
      // China Design Storm (Pillow-shaped / 枕形)
      // Peak-centered triangular pattern used in Chinese drainage standards
      const peakPosition = 0.4;
      const r = 0.4; // Peak position ratio commonly used in China
      const peakIntensity = (2 * totalDepth) / (duration * (r + (1 - r) * 0.5));
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= peakPosition) {
          // Rising limb
          intensity = peakIntensity * (t / peakPosition);
        } else {
          // Falling limb (gentler slope)
          intensity = peakIntensity * (1 - t) / (1 - peakPosition);
        }
        
        data.push(intensity);
      }
      break;
    }

    case 'sa_huff': {
      // South African adapted Huff curve
      // Modified 2nd quartile pattern calibrated for South African conditions
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // South African modification: slightly earlier peak than standard Huff 2nd quartile
        if (t <= 0.2) {
          cumulativeFraction = 0.15 * (t / 0.2);
        } else if (t <= 0.45) {
          // Peak slightly earlier and more pronounced
          cumulativeFraction = 0.15 + 0.55 * Math.pow((t - 0.2) / 0.25, 0.65);
        } else if (t <= 0.7) {
          cumulativeFraction = 0.70 + 0.20 * ((t - 0.45) / 0.25);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.7) / 0.3);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.2) {
          nextCumulative = 0.15 * (nextT / 0.2);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.15 + 0.55 * Math.pow((nextT - 0.2) / 0.25, 0.65);
        } else if (nextT <= 0.7) {
          nextCumulative = 0.70 + 0.20 * ((nextT - 0.45) / 0.25);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.7) / 0.3);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'dwa': {
      // German DWA-A 531 Euler Type II
      // Center-peaked pattern per German drainage standards
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // DWA Euler Type II cumulative distribution
        if (t <= 0.25) {
          cumulativeFraction = 0.09 * (t / 0.25);
        } else if (t <= 0.375) {
          cumulativeFraction = 0.09 + 0.11 * ((t - 0.25) / 0.125);
        } else if (t <= 0.5) {
          // Sharp peak at center
          cumulativeFraction = 0.20 + 0.38 * ((t - 0.375) / 0.125);
        } else if (t <= 0.625) {
          cumulativeFraction = 0.58 + 0.23 * ((t - 0.5) / 0.125);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.81 + 0.11 * ((t - 0.625) / 0.125);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        
        if (nextT <= 0.25) {
          nextCumulative = 0.09 * (nextT / 0.25);
        } else if (nextT <= 0.375) {
          nextCumulative = 0.09 + 0.11 * ((nextT - 0.25) / 0.125);
        } else if (nextT <= 0.5) {
          nextCumulative = 0.20 + 0.38 * ((nextT - 0.375) / 0.125);
        } else if (nextT <= 0.625) {
          nextCumulative = 0.58 + 0.23 * ((nextT - 0.5) / 0.125);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.81 + 0.11 * ((nextT - 0.625) / 0.125);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        const intensity = incrementalDepth / (timeStep / 60);
        data.push(intensity);
      }
      break;
    }

    case 'dutch': {
      // Dutch NEERSLAG/STOWA pattern
      // Asymmetric pattern for low-lying polder regions
      const peakPosition = 0.35;
      const peakIntensity = (2.5 * totalDepth) / duration;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= peakPosition) {
          // Rapid rise (steeper than triangular)
          intensity = peakIntensity * Math.pow(t / peakPosition, 0.8);
        } else {
          // Extended gradual recession (characteristic of Dutch patterns)
          const decay = Math.exp(-1.5 * (t - peakPosition) / (1 - peakPosition));
          intensity = peakIntensity * decay;
        }
        
        data.push(intensity);
      }
      break;
    }

    case 'italian': {
      // Italian Mediterranean convective storm pattern
      // Very sharp peak representing intense convective events
      const peakPosition = 0.45;
      const peakIntensity = (3.2 * totalDepth) / duration;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        // Sharp Gaussian peak representing intense Mediterranean convection
        const sigma = 0.12; // Narrow peak
        intensity = peakIntensity * Math.exp(-Math.pow((t - peakPosition) / sigma, 2));
        
        data.push(intensity);
      }
      break;
    }

    case 'balanced': {
      // Balanced Storm / Alternating Block Method
      // Derived from simplified IDF curve: i = a / (d + b)^c
      // Arranges incremental depths in alternating blocks around center peak
      const blocks: number[] = [];
      
      for (let i = 0; i < numSteps; i++) {
        const d1 = ((i) * timeStep) / 60;     // duration in hours
        const d2 = ((i + 1) * timeStep) / 60;
        // Cumulative depth from IDF: P(d) = totalDepth * (d/D)^0.6
        const cumDepth1 = i === 0 ? 0 : totalDepth * Math.pow(d1 / duration, 0.6);
        const cumDepth2 = totalDepth * Math.pow(d2 / duration, 0.6);
        blocks.push(cumDepth2 - cumDepth1);
      }
      
      // Sort descending
      blocks.sort((a, b) => b - a);
      
      // Place in alternating block arrangement around center
      const centerIdx = Math.floor(numSteps / 2);
      const result: number[] = new Array(numSteps).fill(0);
      result[centerIdx] = blocks[0] / (timeStep / 60);
      
      let left = centerIdx - 1;
      let right = centerIdx + 1;
      
      for (let i = 1; i < blocks.length; i++) {
        const intensity = blocks[i] / (timeStep / 60);
        if (i % 2 === 1 && right < numSteps) {
          result[right] = intensity;
          right++;
        } else if (left >= 0) {
          result[left] = intensity;
          left--;
        } else if (right < numSteps) {
          result[right] = intensity;
          right++;
        }
      }
      
      return result;
    }

    case 'fdot1': {
      // FDOT Zone 1 (NW Florida) - Modified Type II, slightly front-loaded
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.42) {
          cumulativeFraction = 0.40 * Math.pow(t / 0.42, 0.85);
        } else if (t <= 0.54) {
          cumulativeFraction = 0.40 + 0.38 * ((t - 0.42) / 0.12);
        } else {
          cumulativeFraction = 0.78 + 0.22 * ((t - 0.54) / 0.46);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.42) {
          nextCumulative = 0.40 * Math.pow(nextT / 0.42, 0.85);
        } else if (nextT <= 0.54) {
          nextCumulative = 0.40 + 0.38 * ((nextT - 0.42) / 0.12);
        } else {
          nextCumulative = 0.78 + 0.22 * ((nextT - 0.54) / 0.46);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'fdot2': {
      // FDOT Zone 2 (NE Florida) - Modified Type II
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.45) {
          cumulativeFraction = 0.38 * Math.pow(t / 0.45, 0.88);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.38 + 0.40 * ((t - 0.45) / 0.10);
        } else {
          cumulativeFraction = 0.78 + 0.22 * ((t - 0.55) / 0.45);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.45) {
          nextCumulative = 0.38 * Math.pow(nextT / 0.45, 0.88);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.38 + 0.40 * ((nextT - 0.45) / 0.10);
        } else {
          nextCumulative = 0.78 + 0.22 * ((nextT - 0.55) / 0.45);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'fdot3': {
      // FDOT Zone 3 (Central FL) - Unique tropical distribution
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.35) {
          cumulativeFraction = 0.30 * Math.pow(t / 0.35, 0.80);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.30 + 0.45 * ((t - 0.35) / 0.15);
        } else {
          cumulativeFraction = 0.75 + 0.25 * ((t - 0.50) / 0.50);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.35) {
          nextCumulative = 0.30 * Math.pow(nextT / 0.35, 0.80);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.30 + 0.45 * ((nextT - 0.35) / 0.15);
        } else {
          nextCumulative = 0.75 + 0.25 * ((nextT - 0.50) / 0.50);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'fdot4': {
      // FDOT Zone 4 (SE Florida) - Heavily front-loaded, convective
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          cumulativeFraction = 0.35 * Math.pow(t / 0.25, 0.75);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.35 + 0.40 * ((t - 0.25) / 0.15);
        } else {
          cumulativeFraction = 0.75 + 0.25 * Math.pow((t - 0.40) / 0.60, 0.7);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.25) {
          nextCumulative = 0.35 * Math.pow(nextT / 0.25, 0.75);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.35 + 0.40 * ((nextT - 0.25) / 0.15);
        } else {
          nextCumulative = 0.75 + 0.25 * Math.pow((nextT - 0.40) / 0.60, 0.7);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'fdot5': {
      // FDOT Zone 5 (SW Florida) - Similar to Zone 4, slightly less front-loaded
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.28) {
          cumulativeFraction = 0.33 * Math.pow(t / 0.28, 0.78);
        } else if (t <= 0.42) {
          cumulativeFraction = 0.33 + 0.40 * ((t - 0.28) / 0.14);
        } else {
          cumulativeFraction = 0.73 + 0.27 * Math.pow((t - 0.42) / 0.58, 0.7);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.28) {
          nextCumulative = 0.33 * Math.pow(nextT / 0.28, 0.78);
        } else if (nextT <= 0.42) {
          nextCumulative = 0.33 + 0.40 * ((nextT - 0.28) / 0.14);
        } else {
          nextCumulative = 0.73 + 0.27 * Math.pow((nextT - 0.42) / 0.58, 0.7);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'txdot': {
      // TxDOT empirical Texas hyetograph
      // Based on USGS Texas rainfall studies (SIR 2004-5075)
      // Characterized by a broad central peak with moderate front-loading
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.30) {
          cumulativeFraction = 0.20 * Math.pow(t / 0.30, 0.9);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.20 + 0.45 * ((t - 0.30) / 0.15);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.65 + 0.20 * ((t - 0.45) / 0.20);
        } else {
          cumulativeFraction = 0.85 + 0.15 * ((t - 0.65) / 0.35);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.30) {
          nextCumulative = 0.20 * Math.pow(nextT / 0.30, 0.9);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.20 + 0.45 * ((nextT - 0.30) / 0.15);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.65 + 0.20 * ((nextT - 0.45) / 0.20);
        } else {
          nextCumulative = 0.85 + 0.15 * ((nextT - 0.65) / 0.35);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'yen_chow': {
      // Yen & Chow Triangular Hyetograph
      // Variable time-to-peak ratio r (default r=0.375 for SCS-like advance)
      const r = 0.375; // time-to-peak as fraction of duration
      const peakIntensity = (2 * totalDepth) / duration;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= r) {
          intensity = peakIntensity * (t / r);
        } else {
          intensity = peakIntensity * (1 - t) / (1 - r);
        }
        data.push(intensity);
      }
      break;
    }

    case 'noaa_a14': {
      // NOAA Atlas 14 Temporal Distribution (50th percentile)
      // Representative distribution derived from recording rain gage data
      // Based on Atlas 14 Volume 10 temporal patterns for 6-24hr storms
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // NOAA Atlas 14 50th percentile cumulative distribution
        if (t <= 0.10) {
          cumulativeFraction = 0.04 * (t / 0.10);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.04 + 0.10 * ((t - 0.10) / 0.15);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.14 + 0.18 * ((t - 0.25) / 0.15);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.32 + 0.35 * Math.pow((t - 0.40) / 0.15, 0.8);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.67 + 0.18 * ((t - 0.55) / 0.15);
        } else if (t <= 0.85) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.70) / 0.15);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.85) / 0.15);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.04 * (nextT / 0.10);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.04 + 0.10 * ((nextT - 0.10) / 0.15);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.14 + 0.18 * ((nextT - 0.25) / 0.15);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.32 + 0.35 * Math.pow((nextT - 0.40) / 0.15, 0.8);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.67 + 0.18 * ((nextT - 0.55) / 0.15);
        } else if (nextT <= 0.85) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.70) / 0.15);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.85) / 0.15);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
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
