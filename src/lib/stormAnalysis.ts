/**
 * Storm Analysis & Pattern Derivation Engine
 * Analyzes real storm data and matches to synthetic patterns
 */

import { type RainfallDataPoint } from './rainfallParsers';
import { type PatternType, generateRainfallData } from './rainfallPatterns';

export interface StormStatistics {
  // Basic metrics
  totalDepth: number;
  duration: number; // minutes
  peakIntensity: number;
  peakTime: number; // minutes from start
  peakPosition: number; // 0-1 fraction of duration
  
  // Distribution metrics
  centroid: number; // center of mass (0-1)
  skewness: number; // asymmetry measure
  kurtosis: number; // peakedness measure
  
  // Quartile analysis (Huff-style)
  q1Fraction: number; // % of rain in first quartile
  q2Fraction: number;
  q3Fraction: number;
  q4Fraction: number;
  dominantQuartile: 1 | 2 | 3 | 4;
  
  // Shape characteristics
  riseDuration: number; // time to peak (minutes)
  fallDuration: number; // time after peak (minutes)
  riseSlope: number; // average rise rate
  fallSlope: number; // average fall rate
  asymmetryRatio: number; // rise/fall ratio
}

export interface PatternMatch {
  pattern: PatternType;
  patternName: string;
  similarity: number; // 0-1, higher is better
  rmse: number; // root mean square error
  correlation: number; // Pearson correlation
  peakPositionDiff: number; // difference in peak position
  description: string;
}

export interface AnalysisResult {
  statistics: StormStatistics;
  matches: PatternMatch[];
  bestMatch: PatternMatch;
  recommendations: string[];
}

// Pattern metadata for matching
const patternMetadata: Record<PatternType, { name: string; peakPosition: number; description: string }> = {
  block: { name: 'Uniform Block', peakPosition: 0.5, description: 'Constant intensity throughout' },
  scs1: { name: 'SCS Type I', peakPosition: 0.4, description: 'Pacific maritime climate' },
  scs1a: { name: 'SCS Type IA', peakPosition: 0.35, description: 'Pacific Northwest coastal' },
  scs2: { name: 'SCS Type II', peakPosition: 0.5, description: 'Most of US (moderate climate)' },
  scs3: { name: 'SCS Type III', peakPosition: 0.5, description: 'Gulf Coast high rainfall' },
  double: { name: 'Double Peak', peakPosition: 0.5, description: 'Bimodal storm pattern' },
  custom: { name: 'Custom', peakPosition: 0.5, description: 'User-defined pattern' },
  triangular: { name: 'Triangular', peakPosition: 0.33, description: 'UK practice standard' },
  trapezoidal: { name: 'Trapezoidal', peakPosition: 0.425, description: 'Sustained peak pattern' },
  fsr: { name: 'FSR (UK)', peakPosition: 0.4, description: 'Flood Studies Report' },
  chicago: { name: 'Chicago', peakPosition: 0.4, description: 'Alternating block method' },
  huff1: { name: 'Huff Q1', peakPosition: 0.125, description: 'Peak in first quartile' },
  huff2: { name: 'Huff Q2', peakPosition: 0.375, description: 'Peak in second quartile' },
  huff3: { name: 'Huff Q3', peakPosition: 0.625, description: 'Peak in third quartile' },
  huff4: { name: 'Huff Q4', peakPosition: 0.875, description: 'Peak in fourth quartile' },
  desbordes: { name: 'Desbordes', peakPosition: 0.3, description: 'French double-triangle' },
  arr: { name: 'ARR (Australia)', peakPosition: 0.4, description: 'Australian Rainfall & Runoff' },
  jma: { name: 'JMA (Japan)', peakPosition: 0.5, description: 'Japan Meteorological Agency' },
  china: { name: 'China Design', peakPosition: 0.4, description: 'Chinese drainage standard' },
  sa_huff: { name: 'SA Huff', peakPosition: 0.35, description: 'South African adapted Huff' },
  dwa: { name: 'DWA (Germany)', peakPosition: 0.5, description: 'German Euler Type II' },
  dutch: { name: 'Dutch STOWA', peakPosition: 0.35, description: 'Netherlands polder regions' },
  italian: { name: 'Italian Mediterranean', peakPosition: 0.45, description: 'Intense convective storms' },
  balanced: { name: 'Balanced Storm', peakPosition: 0.5, description: 'IDF-derived alternating block' },
  fdot1: { name: 'FDOT Zone 1', peakPosition: 0.42, description: 'NW Florida modified Type II' },
  fdot2: { name: 'FDOT Zone 2', peakPosition: 0.45, description: 'NE Florida modified Type II' },
  fdot3: { name: 'FDOT Zone 3', peakPosition: 0.35, description: 'Central FL tropical distribution' },
  fdot4: { name: 'FDOT Zone 4', peakPosition: 0.25, description: 'SE Florida convective front-loaded' },
  fdot5: { name: 'FDOT Zone 5', peakPosition: 0.28, description: 'SW Florida convective' },
  txdot: { name: 'TxDOT', peakPosition: 0.38, description: 'Texas DOT empirical hyetograph' },
  yen_chow: { name: 'Yen & Chow', peakPosition: 0.375, description: 'Variable triangular hyetograph' },
  noaa_a14: { name: 'NOAA Atlas 14', peakPosition: 0.48, description: 'Atlas 14 50th percentile temporal' },
  udfcd: { name: 'UDFCD Denver', peakPosition: 0.2, description: 'Colorado front-loaded 2-hour storm' },
  usace_sps: { name: 'USACE SPS', peakPosition: 0.45, description: 'Corps of Engineers standard project storm' },
  pmp_hmr: { name: 'PMP (HMR 51/52)', peakPosition: 0.38, description: 'Probable Maximum Precipitation generalized storm' },
  feh: { name: 'FEH (UK)', peakPosition: 0.42, description: 'Flood Estimation Handbook temporal' },
  euler1: { name: 'Euler Type I', peakPosition: 0.167, description: 'Front-loaded German Euler' },
  euler2: { name: 'Euler Type II', peakPosition: 0.33, description: 'Center-peaked German Euler' },
  desbordes_double: { name: 'Double Triangle', peakPosition: 0.25, description: 'Desbordes double triangle' },
  canadian: { name: 'Canadian CDA', peakPosition: 0.45, description: 'Canadian Dam Association pattern' },
  singapore_pub: { name: 'Singapore PUB', peakPosition: 0.15, description: 'Singapore tropical convective' },
  china_gb50014: { name: 'China GB 50014', peakPosition: 0.40, description: 'Chinese urban drainage standard' },
  china_prd: { name: 'China PRD', peakPosition: 0.22, description: 'Pearl River Delta typhoon' },
  india_imd: { name: 'India IMD', peakPosition: 0.47, description: 'IMD monsoon standard' },
  india_coastal: { name: 'India Coastal', peakPosition: 0.25, description: 'Coastal cyclonic storm' },
  japan_amedas: { name: 'Japan AMeDAS', peakPosition: 0.42, description: 'Short-duration convective' },
  japan_baiu: { name: 'Japan Baiu', peakPosition: 0.38, description: 'Baiu frontal rain pattern' },
  japan_typhoon: { name: 'Japan Typhoon', peakPosition: 0.65, description: 'Typhoon double-band pattern' },
  korea_kma: { name: 'Korea KMA', peakPosition: 0.42, description: 'Korean standard monsoon/convective' },
  malaysia_msma: { name: 'Malaysia MSMA', peakPosition: 0.35, description: 'Malaysian MSMA tropical monsoon' },
  indonesia_bmkg: { name: 'Indonesia BMKG', peakPosition: 0.18, description: 'Indonesian tropical convective' },
  philippines_pagasa: { name: 'Philippines PAGASA', peakPosition: 0.15, description: 'Philippine typhoon/monsoon' },
  vietnam_imhen: { name: 'Vietnam IMHEN', peakPosition: 0.35, description: 'Vietnamese monsoon/convective' },
  thailand_tmd: { name: 'Thailand TMD', peakPosition: 0.38, description: 'Thai monsoon with urban heat island' },
  saudi_pme: { name: 'Saudi Arabia PME', peakPosition: 0.12, description: 'Arid wadi flash flood' },
  uae_ncms: { name: 'UAE NCMS', peakPosition: 0.14, description: 'Dubai/Abu Dhabi flash flood' },
  qatar_kahramaa: { name: 'Qatar Kahramaa', peakPosition: 0.12, description: 'Doha arid flash flood' },
  oman_dgman: { name: 'Oman DGMAN', peakPosition: 0.15, description: 'Muscat wadi/Khareef flood' },
  sa_sanral: { name: 'South Africa SANRAL', peakPosition: 0.30, description: 'SANRAL road drainage design storm' },
  kenya_kmd: { name: 'Kenya KMD', peakPosition: 0.15, description: 'East African highland convective' },
  nigeria_nimet: { name: 'Nigeria NiMet', peakPosition: 0.45, description: 'West African monsoon ITCZ pattern' },
  egypt_hcww: { name: 'Egypt HCWW', peakPosition: 0.08, description: 'Arid flash flood Nile Delta' },
  brazil_ana: { name: 'Brazil ANA', peakPosition: 0.45, description: 'Tropical convective SE Brazil' },
  mexico_conagua: { name: 'Mexico CONAGUA', peakPosition: 0.20, description: 'Front-loaded tropical convective' },
  colombia_ideam: { name: 'Colombia IDEAM', peakPosition: 0.45, description: 'Andean valley convective' },
  chile_dga: { name: 'Chile DGA', peakPosition: 0.40, description: 'Frontal/orographic central Chile' },
};

/**
 * Calculate comprehensive statistics for a storm timeseries
 */
export function analyzeStorm(data: RainfallDataPoint[]): StormStatistics {
  if (data.length === 0) {
    throw new Error('Empty storm data');
  }
  
  const duration = data[data.length - 1].time - data[0].time;
  const timeStep = data.length > 1 ? data[1].time - data[0].time : 15;
  
  // Basic metrics
  let totalDepth = 0;
  let peakIntensity = 0;
  let peakTime = 0;
  let peakIndex = 0;
  
  for (let i = 0; i < data.length; i++) {
    const intensity = data[i].intensity;
    totalDepth += intensity * (timeStep / 60);
    
    if (intensity > peakIntensity) {
      peakIntensity = intensity;
      peakTime = data[i].time;
      peakIndex = i;
    }
  }
  
  const peakPosition = duration > 0 ? peakTime / duration : 0.5;
  
  // Normalize intensities for statistical calculations
  const normalized = data.map(d => d.intensity / (peakIntensity || 1));
  
  // Calculate centroid (center of mass)
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < data.length; i++) {
    const t = data[i].time / duration;
    weightedSum += t * data[i].intensity;
    totalWeight += data[i].intensity;
  }
  const centroid = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  
  // Calculate moments for skewness and kurtosis
  const n = data.length;
  const mean = normalized.reduce((a, b) => a + b, 0) / n;
  
  let m2 = 0, m3 = 0, m4 = 0;
  for (const val of normalized) {
    const diff = val - mean;
    m2 += diff * diff;
    m3 += diff * diff * diff;
    m4 += diff * diff * diff * diff;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  
  const stdDev = Math.sqrt(m2);
  const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;
  const kurtosis = stdDev > 0 ? m4 / Math.pow(stdDev, 4) - 3 : 0;
  
  // Quartile analysis
  const q1End = Math.floor(n * 0.25);
  const q2End = Math.floor(n * 0.5);
  const q3End = Math.floor(n * 0.75);
  
  let q1Depth = 0, q2Depth = 0, q3Depth = 0, q4Depth = 0;
  
  for (let i = 0; i < n; i++) {
    const depth = data[i].intensity * (timeStep / 60);
    if (i < q1End) q1Depth += depth;
    else if (i < q2End) q2Depth += depth;
    else if (i < q3End) q3Depth += depth;
    else q4Depth += depth;
  }
  
  const q1Fraction = totalDepth > 0 ? q1Depth / totalDepth : 0.25;
  const q2Fraction = totalDepth > 0 ? q2Depth / totalDepth : 0.25;
  const q3Fraction = totalDepth > 0 ? q3Depth / totalDepth : 0.25;
  const q4Fraction = totalDepth > 0 ? q4Depth / totalDepth : 0.25;
  
  const fractions = [q1Fraction, q2Fraction, q3Fraction, q4Fraction];
  const maxFraction = Math.max(...fractions);
  const dominantQuartile = (fractions.indexOf(maxFraction) + 1) as 1 | 2 | 3 | 4;
  
  // Rise and fall characteristics
  const riseDuration = peakTime;
  const fallDuration = duration - peakTime;
  
  const riseSlope = riseDuration > 0 ? peakIntensity / riseDuration : 0;
  const fallSlope = fallDuration > 0 ? peakIntensity / fallDuration : 0;
  const asymmetryRatio = fallSlope > 0 ? riseSlope / fallSlope : 1;
  
  return {
    totalDepth,
    duration,
    peakIntensity,
    peakTime,
    peakPosition,
    centroid,
    skewness,
    kurtosis,
    q1Fraction,
    q2Fraction,
    q3Fraction,
    q4Fraction,
    dominantQuartile,
    riseDuration,
    fallDuration,
    riseSlope,
    fallSlope,
    asymmetryRatio
  };
}

/**
 * Calculate similarity between two intensity arrays
 */
function calculateSimilarity(actual: number[], synthetic: number[]): {
  rmse: number;
  correlation: number;
  similarity: number;
} {
  // Resample to same length if needed
  const targetLen = Math.min(actual.length, synthetic.length);
  const resampleArray = (arr: number[], targetLen: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < targetLen; i++) {
      const srcIndex = (i / targetLen) * arr.length;
      const lower = Math.floor(srcIndex);
      const upper = Math.min(lower + 1, arr.length - 1);
      const fraction = srcIndex - lower;
      result.push(arr[lower] * (1 - fraction) + arr[upper] * fraction);
    }
    return result;
  };
  
  const a = resampleArray(actual, targetLen);
  const s = resampleArray(synthetic, targetLen);
  
  // Normalize both to 0-1 range for comparison
  const maxA = Math.max(...a);
  const maxS = Math.max(...s);
  const normA = a.map(v => maxA > 0 ? v / maxA : 0);
  const normS = s.map(v => maxS > 0 ? v / maxS : 0);
  
  // Calculate RMSE
  let sumSqErr = 0;
  for (let i = 0; i < targetLen; i++) {
    sumSqErr += Math.pow(normA[i] - normS[i], 2);
  }
  const rmse = Math.sqrt(sumSqErr / targetLen);
  
  // Calculate Pearson correlation
  const meanA = normA.reduce((acc, v) => acc + v, 0) / targetLen;
  const meanS = normS.reduce((acc, v) => acc + v, 0) / targetLen;
  
  let numerator = 0;
  let denomA = 0;
  let denomS = 0;
  
  for (let i = 0; i < targetLen; i++) {
    const diffA = normA[i] - meanA;
    const diffS = normS[i] - meanS;
    numerator += diffA * diffS;
    denomA += diffA * diffA;
    denomS += diffS * diffS;
  }
  
  const correlation = (denomA > 0 && denomS > 0) 
    ? numerator / Math.sqrt(denomA * denomS)
    : 0;
  
  // Composite similarity score (0-1)
  const rmseScore = Math.max(0, 1 - rmse * 2);
  const corrScore = Math.max(0, (correlation + 1) / 2);
  const similarity = 0.4 * rmseScore + 0.6 * corrScore;
  
  return { rmse, correlation, similarity };
}

/**
 * Match storm against all synthetic patterns
 */
export function matchPatterns(
  data: RainfallDataPoint[],
  statistics: StormStatistics
): PatternMatch[] {
  const patterns: PatternType[] = [
    'scs1', 'scs1a', 'scs2', 'scs3',
    'huff1', 'huff2', 'huff3', 'huff4',
    'chicago', 'fsr', 'triangular', 'trapezoidal',
    'arr', 'jma', 'china', 'sa_huff', 'dwa', 'dutch', 'italian',
    'desbordes', 'double', 'block',
    'balanced', 'yen_chow', 'noaa_a14',
    'fdot1', 'fdot2', 'fdot3', 'fdot4', 'fdot5', 'txdot',
    'udfcd', 'usace_sps', 'pmp_hmr', 'feh', 'euler1', 'euler2', 'desbordes_double', 'canadian',
    'singapore_pub', 'china_gb50014', 'china_prd', 'india_imd', 'india_coastal',
    'japan_amedas', 'japan_baiu', 'japan_typhoon', 'korea_kma'
  ];
  
  // Extract intensities from data
  const actualIntensities = data.map(d => d.intensity);
  const timeStep = data.length > 1 ? data[1].time - data[0].time : 15;
  
  const matches: PatternMatch[] = patterns.map(pattern => {
    const meta = patternMetadata[pattern];
    
    // Generate synthetic pattern with same parameters
    const syntheticIntensities = generateRainfallData(
      pattern,
      statistics.totalDepth,
      statistics.duration / 60, // Convert to hours
      timeStep
    );
    
    const { rmse, correlation, similarity } = calculateSimilarity(
      actualIntensities,
      syntheticIntensities
    );
    
    const peakPositionDiff = Math.abs(statistics.peakPosition - meta.peakPosition);
    
    // Adjust similarity based on peak position match
    const peakBonus = Math.max(0, 1 - peakPositionDiff * 2) * 0.2;
    const adjustedSimilarity = Math.min(1, similarity + peakBonus);
    
    return {
      pattern,
      patternName: meta.name,
      similarity: adjustedSimilarity,
      rmse,
      correlation,
      peakPositionDiff,
      description: meta.description
    };
  });
  
  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);
  
  return matches;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  statistics: StormStatistics,
  bestMatch: PatternMatch
): string[] {
  const recommendations: string[] = [];
  
  // Quartile-based recommendation
  if (statistics.dominantQuartile === 1 && bestMatch.pattern !== 'huff1') {
    recommendations.push(`Storm has 1st quartile dominance (${(statistics.q1Fraction * 100).toFixed(0)}%). Consider Huff Q1 pattern.`);
  } else if (statistics.dominantQuartile === 4 && bestMatch.pattern !== 'huff4') {
    recommendations.push(`Storm has 4th quartile dominance (${(statistics.q4Fraction * 100).toFixed(0)}%). Consider Huff Q4 pattern.`);
  }
  
  // Asymmetry recommendation
  if (statistics.asymmetryRatio > 2) {
    recommendations.push(`Storm has steep rise/slow fall (ratio: ${statistics.asymmetryRatio.toFixed(1)}). Typical of frontal systems.`);
  } else if (statistics.asymmetryRatio < 0.5) {
    recommendations.push(`Storm has slow rise/steep fall (ratio: ${statistics.asymmetryRatio.toFixed(1)}). Typical of convective events.`);
  }
  
  // Peak position recommendation
  if (statistics.peakPosition < 0.3) {
    recommendations.push(`Early peak (${(statistics.peakPosition * 100).toFixed(0)}% of duration). Consider SCS Type IA or Huff Q1.`);
  } else if (statistics.peakPosition > 0.7) {
    recommendations.push(`Late peak (${(statistics.peakPosition * 100).toFixed(0)}% of duration). Consider Huff Q4.`);
  }
  
  // Match quality recommendation
  if (bestMatch.similarity < 0.6) {
    recommendations.push(`Best match similarity is low (${(bestMatch.similarity * 100).toFixed(0)}%). Storm may have unique characteristics not captured by standard patterns.`);
  } else if (bestMatch.similarity > 0.85) {
    recommendations.push(`Excellent match with ${bestMatch.patternName} (${(bestMatch.similarity * 100).toFixed(0)}% similarity). Safe to use this pattern for modeling.`);
  }
  
  // Skewness recommendation
  if (Math.abs(statistics.skewness) > 1.5) {
    const direction = statistics.skewness > 0 ? 'right-skewed' : 'left-skewed';
    recommendations.push(`Storm distribution is ${direction} (skewness: ${statistics.skewness.toFixed(2)}). May represent unusual meteorological conditions.`);
  }
  
  return recommendations;
}

/**
 * Perform complete storm analysis
 */
export function analyzeStormComplete(data: RainfallDataPoint[]): AnalysisResult {
  const statistics = analyzeStorm(data);
  const matches = matchPatterns(data, statistics);
  const bestMatch = matches[0];
  const recommendations = generateRecommendations(statistics, bestMatch);
  
  return {
    statistics,
    matches,
    bestMatch,
    recommendations
  };
}

/**
 * Get pattern metadata for display
 */
export function getPatternInfo(pattern: PatternType) {
  return patternMetadata[pattern];
}
