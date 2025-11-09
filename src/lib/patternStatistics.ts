export interface PatternStatistics {
  peakIntensity: number;
  timeToPeak: number;
  centroid: number;
  skewness: number;
  totalVolume: number;
}

export function calculatePatternStatistics(
  intensities: number[],
  timeStep: number
): PatternStatistics {
  const timeStepHours = timeStep / 60;
  
  // Peak intensity and time to peak
  const peakIntensity = Math.max(...intensities);
  const peakIndex = intensities.indexOf(peakIntensity);
  const timeToPeak = peakIndex * timeStepHours;
  
  // Total volume (area under curve)
  const totalVolume = intensities.reduce((sum, intensity) => sum + intensity * timeStepHours, 0);
  
  // Centroid (center of mass of the hyetograph)
  let momentSum = 0;
  for (let i = 0; i < intensities.length; i++) {
    const time = i * timeStepHours;
    const volume = intensities[i] * timeStepHours;
    momentSum += time * volume;
  }
  const centroid = totalVolume > 0 ? momentSum / totalVolume : 0;
  
  // Skewness (measure of asymmetry)
  // Using moment-based skewness
  let m2 = 0; // Second central moment (variance)
  let m3 = 0; // Third central moment
  
  for (let i = 0; i < intensities.length; i++) {
    const time = i * timeStepHours;
    const volume = intensities[i] * timeStepHours;
    const deviation = time - centroid;
    m2 += Math.pow(deviation, 2) * volume;
    m3 += Math.pow(deviation, 3) * volume;
  }
  
  m2 = totalVolume > 0 ? m2 / totalVolume : 0;
  m3 = totalVolume > 0 ? m3 / totalVolume : 0;
  
  const skewness = m2 > 0 ? m3 / Math.pow(m2, 1.5) : 0;
  
  return {
    peakIntensity: parseFloat(peakIntensity.toFixed(3)),
    timeToPeak: parseFloat(timeToPeak.toFixed(2)),
    centroid: parseFloat(centroid.toFixed(2)),
    skewness: parseFloat(skewness.toFixed(3)),
    totalVolume: parseFloat(totalVolume.toFixed(3)),
  };
}
