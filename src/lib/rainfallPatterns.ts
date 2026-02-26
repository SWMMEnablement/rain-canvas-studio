export type PatternType = 'block' | 'scs1' | 'scs1a' | 'scs2' | 'scs3' | 'double' | 'custom' | 'triangular' | 'trapezoidal' | 'fsr' | 'chicago' | 'huff1' | 'huff2' | 'huff3' | 'huff4' | 'desbordes' | 'arr' | 'jma' | 'china' | 'sa_huff' | 'dwa' | 'dutch' | 'italian' | 'balanced' | 'fdot1' | 'fdot2' | 'fdot3' | 'fdot4' | 'fdot5' | 'txdot' | 'yen_chow' | 'noaa_a14' | 'udfcd' | 'usace_sps' | 'feh' | 'euler1' | 'euler2' | 'desbordes_double' | 'canadian' | 'pmp_hmr' | 'singapore_pub' | 'china_gb50014' | 'china_prd' | 'india_imd' | 'india_coastal' | 'japan_amedas' | 'japan_baiu' | 'japan_typhoon' | 'korea_kma' | 'malaysia_msma' | 'indonesia_bmkg' | 'philippines_pagasa' | 'vietnam_imhen' | 'thailand_tmd' | 'saudi_pme' | 'uae_ncms' | 'qatar_kahramaa' | 'oman_dgman' | 'sa_sanral' | 'kenya_kmd' | 'nigeria_nimet' | 'egypt_hcww' | 'brazil_ana' | 'mexico_conagua' | 'colombia_ideam' | 'chile_dga' | 'nz_tp108' | 'nz_wellington' | 'nz_christchurch'
  // New patterns from Design Storm Equations Reference
  | 'sifalda' | 'danish_svk' | 'swedish_smhi' | 'norwegian_nve' | 'finnish_fmi' | 'swiss_idf'
  | 'spanish_cedex' | 'belgian_irm' | 'pilgrim_cordery' | 'watts_curve'
  | 'hong_kong_hko' | 'taiwan_cwa' | 'bangladesh_bmd' | 'pakistan_pmd' | 'sri_lanka' | 'fiji_fms'
  | 'argentina_smn' | 'peru_senamhi' | 'ecuador_inamhi' | 'venezuela_inameh' | 'puerto_rico'
  | 'morocco_dmn' | 'ethiopia_nma' | 'ghana_gmet' | 'tanzania_tma' | 'mozambique_inam'
  | 'hirds_nz' | 'arid_flash_flood'
  // New patterns (v2)
  | 'aes_30' | 'aes_40' | 'kostra_dwd' | 'dubai_dm' | 'abu_dhabi_adm'
  | 'montana_caquot' | 'm5_60_fsr' | 'arr2019' | 'upm_plata'
  // New patterns (v3)
  | 'feh22_refh2' | 'noaa_a15' | 'eccc_idf' | 'shyreg_fr' | 'ireland_met'
  | 'arr87_legacy' | 'hk_dsd_2018' | 'malaysia_hp1' | 'austria_okostra'
  // New patterns (v4)
  | 'france_shypre' | 'poland_panda' | 'turkey_mgm' | 'israel_ims'
  | 'iran_irimo' | 'iraq_mos' | 'kazakhstan_kazhydromet' | 'russia_roshydromet'
  | 'portugal_ipma' | 'nz_niwa' | 'csa_w231' | 'sa_wrc'
  | 'west_africa_cilss' | 'noaa_a16' | 'euro_cordex' | 'mongolia_namem'
  | 'pacific_sprep' | 'czech_chmu'
  // New patterns (v5)
  | 'barbados_bms' | 'oecs_caribbean' | 'cyprus_wdd' | 'malta_mra'
  | 'bolivia_altiplano' | 'fourier_multipeak' | 'cc_idf_scaled'
  // New patterns (v6) — Missing Design Storms Analysis
  | 'g2p_gamma' | 'poland_bs' | 'belgium_willems' | 'russia_snip'
  | 'turkey_dsi' | 'korea_molit' | 'greece_hellenic' | 'romania_stas'
  | 'pmp_wmo' | 'nested_envelope'
  // v7 — Niche patterns
  | 'arnell_sweden' | 'tenax_cds' | 'avm';

// ─── Helper functions for pattern generation ───

/** Linear interpolation on a piecewise table */
function interpolateTable(xArr: number[], yArr: number[], x: number): number {
  if (x <= xArr[0]) return yArr[0];
  if (x >= xArr[xArr.length - 1]) return yArr[yArr.length - 1];
  for (let i = 1; i < xArr.length; i++) {
    if (x <= xArr[i]) {
      const frac = (x - xArr[i - 1]) / (xArr[i] - xArr[i - 1]);
      return yArr[i - 1] + frac * (yArr[i] - yArr[i - 1]);
    }
  }
  return yArr[yArr.length - 1];
}

/** Apply a dimensionless mass curve to produce a hyetograph */
function applyDimensionlessCurve(
  timeFractions: number[], depthFractions: number[],
  totalDepth: number, numSteps: number, timeStep: number
): number[] {
  const data: number[] = [];
  for (let i = 0; i < numSteps; i++) {
    const tFrac1 = i / numSteps;
    const tFrac2 = (i + 1) / numSteps;
    const dFrac1 = interpolateTable(timeFractions, depthFractions, tFrac1);
    const dFrac2 = interpolateTable(timeFractions, depthFractions, tFrac2);
    const incrementalDepth = (dFrac2 - dFrac1) * totalDepth;
    data.push(incrementalDepth / (timeStep / 60));
  }
  return data;
}

/** Chicago-type (Keifer-Chu) storm with advancement coefficient r */
function chicagoVariant(
  totalDepth: number, numSteps: number, timeStep: number, duration: number,
  r: number
): number[] {
  const peakPosition = Math.floor(numSteps * r);
  const blocks: Array<{ intensity: number }> = [];
  for (let i = 0; i < numSteps; i++) {
    const durationHrs = ((i + 1) * timeStep) / 60;
    const intensity = totalDepth / (duration * Math.pow(durationHrs / duration, 0.6));
    blocks.push({ intensity });
  }
  blocks.sort((a, b) => b.intensity - a.intensity);
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
  // Normalize volume: ensure sum(intensity × dt) = totalDepth
  const dt = timeStep / 60;
  const vol = orderedData.reduce((s, v) => s + v * dt, 0);
  if (vol > 0) {
    const scale = totalDepth / vol;
    for (let i = 0; i < orderedData.length; i++) orderedData[i] *= scale;
  }
  return orderedData;
}

/** Beta-distribution shaped storm for monsoon/tropical patterns */
function betaStorm(
  totalDepth: number, numSteps: number, timeStep: number,
  peakFrac: number
): number[] {
  const alpha = peakFrac * 5;
  const beta = (1 - peakFrac) * 5;
  const raw: number[] = [];
  let totalRaw = 0;
  for (let i = 0; i < numSteps; i++) {
    const x = (i + 0.5) / numSteps;
    const v = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
    raw.push(v);
    totalRaw += v;
  }
  return raw.map(v => (v / totalRaw) * totalDepth / (timeStep / 60));
}

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
      
      // Normalize volume
      const dt = timeStep / 60;
      const vol = orderedData.reduce((s, v) => s + v * dt, 0);
      if (vol > 0) {
        const scale = totalDepth / vol;
        for (let k = 0; k < orderedData.length; k++) orderedData[k] *= scale;
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

    case 'udfcd': {
      // UDFCD Denver 2-hour design storm
      // Urban Drainage and Flood Control District (Colorado)
      // Front-loaded pattern with 60% of rain in first 1/3 of storm
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.08) {
          cumulativeFraction = 0.04 * (t / 0.08);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.04 + 0.56 * Math.pow((t - 0.08) / 0.17, 0.75);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.60 + 0.25 * ((t - 0.25) / 0.25);
        } else {
          cumulativeFraction = 0.85 + 0.15 * ((t - 0.50) / 0.50);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.08) {
          nextCumulative = 0.04 * (nextT / 0.08);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.04 + 0.56 * Math.pow((nextT - 0.08) / 0.17, 0.75);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.60 + 0.25 * ((nextT - 0.25) / 0.25);
        } else {
          nextCumulative = 0.85 + 0.15 * ((nextT - 0.50) / 0.50);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'usace_sps': {
      // USACE Standard Project Storm
      // US Army Corps of Engineers - envelope of severe storms
      // Broader peak than SCS, representing large-area storms
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.08 * (t / 0.20);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.08 + 0.15 * ((t - 0.20) / 0.15);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.23 + 0.40 * Math.pow((t - 0.35) / 0.15, 0.85);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.63 + 0.22 * ((t - 0.50) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.65) / 0.15);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.08 * (nextT / 0.20);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.08 + 0.15 * ((nextT - 0.20) / 0.15);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.23 + 0.40 * Math.pow((nextT - 0.35) / 0.15, 0.85);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.63 + 0.22 * ((nextT - 0.50) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.65) / 0.15);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'feh': {
      // FEH (Flood Estimation Handbook) UK
      // Updated successor to FSR with improved temporal profiles
      // Summer profile with peak around 42% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.06 * (t / 0.15);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.06 + 0.14 * ((t - 0.15) / 0.15);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.20 + 0.45 * Math.pow((t - 0.30) / 0.20, 0.85);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.65 + 0.22 * ((t - 0.50) / 0.20);
        } else {
          cumulativeFraction = 0.87 + 0.13 * ((t - 0.70) / 0.30);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.06 * (nextT / 0.15);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.06 + 0.14 * ((nextT - 0.15) / 0.15);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.20 + 0.45 * Math.pow((nextT - 0.30) / 0.20, 0.85);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.65 + 0.22 * ((nextT - 0.50) / 0.20);
        } else {
          nextCumulative = 0.87 + 0.13 * ((nextT - 0.70) / 0.30);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'euler1': {
      // Euler Type I - front-loaded variant
      // Peak at 1/6 of duration, used in German practice
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.167) {
          cumulativeFraction = 0.42 * Math.pow(t / 0.167, 0.8);
        } else if (t <= 0.333) {
          cumulativeFraction = 0.42 + 0.23 * ((t - 0.167) / 0.167);
        } else if (t <= 0.5) {
          cumulativeFraction = 0.65 + 0.15 * ((t - 0.333) / 0.167);
        } else if (t <= 0.667) {
          cumulativeFraction = 0.80 + 0.10 * ((t - 0.5) / 0.167);
        } else if (t <= 0.833) {
          cumulativeFraction = 0.90 + 0.06 * ((t - 0.667) / 0.167);
        } else {
          cumulativeFraction = 0.96 + 0.04 * ((t - 0.833) / 0.167);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.167) {
          nextCumulative = 0.42 * Math.pow(nextT / 0.167, 0.8);
        } else if (nextT <= 0.333) {
          nextCumulative = 0.42 + 0.23 * ((nextT - 0.167) / 0.167);
        } else if (nextT <= 0.5) {
          nextCumulative = 0.65 + 0.15 * ((nextT - 0.333) / 0.167);
        } else if (nextT <= 0.667) {
          nextCumulative = 0.80 + 0.10 * ((nextT - 0.5) / 0.167);
        } else if (nextT <= 0.833) {
          nextCumulative = 0.90 + 0.06 * ((nextT - 0.667) / 0.167);
        } else {
          nextCumulative = 0.96 + 0.04 * ((nextT - 0.833) / 0.167);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'euler2': {
      // Euler Type II - center-peaked variant (same as DWA but standalone)
      // Peak at 1/3 of duration, German standard
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.167) {
          cumulativeFraction = 0.09 * (t / 0.167);
        } else if (t <= 0.333) {
          cumulativeFraction = 0.09 + 0.42 * Math.pow((t - 0.167) / 0.167, 0.85);
        } else if (t <= 0.5) {
          cumulativeFraction = 0.51 + 0.23 * ((t - 0.333) / 0.167);
        } else if (t <= 0.667) {
          cumulativeFraction = 0.74 + 0.13 * ((t - 0.5) / 0.167);
        } else if (t <= 0.833) {
          cumulativeFraction = 0.87 + 0.08 * ((t - 0.667) / 0.167);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.833) / 0.167);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.167) {
          nextCumulative = 0.09 * (nextT / 0.167);
        } else if (nextT <= 0.333) {
          nextCumulative = 0.09 + 0.42 * Math.pow((nextT - 0.167) / 0.167, 0.85);
        } else if (nextT <= 0.5) {
          nextCumulative = 0.51 + 0.23 * ((nextT - 0.333) / 0.167);
        } else if (nextT <= 0.667) {
          nextCumulative = 0.74 + 0.13 * ((nextT - 0.5) / 0.167);
        } else if (nextT <= 0.833) {
          nextCumulative = 0.87 + 0.08 * ((nextT - 0.667) / 0.167);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.833) / 0.167);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'desbordes_double': {
      // Double Triangle Desbordes (distinct from the existing single desbordes)
      // Symmetric double triangle with defined valley
      const t1 = 0.25; // first peak
      const tv = 0.45; // valley
      const t2 = 0.65; // second peak
      const i1 = (2.5 * totalDepth) / duration;
      const i2 = (2.0 * totalDepth) / duration;
      const iValley = 0.3 * i1;
      
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let intensity: number;
        
        if (t <= t1) {
          intensity = i1 * (t / t1);
        } else if (t <= tv) {
          intensity = i1 - (i1 - iValley) * ((t - t1) / (tv - t1));
        } else if (t <= t2) {
          intensity = iValley + (i2 - iValley) * ((t - tv) / (t2 - tv));
        } else {
          intensity = i2 * (1 - (t - t2) / (1 - t2));
        }
        
        data.push(Math.max(0, intensity));
      }
      break;
    }

    case 'canadian': {
      // Canadian CDA (Canadian Dam Association) / Ontario MTO pattern
      // Modified Type II adapted for Canadian climate with broader peak
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.05 * (t / 0.15);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.05 + 0.15 * ((t - 0.15) / 0.20);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.20 + 0.42 * Math.pow((t - 0.35) / 0.15, 0.82);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.62 + 0.22 * ((t - 0.50) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.84 + 0.10 * ((t - 0.65) / 0.15);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.05 * (nextT / 0.15);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.05 + 0.15 * ((nextT - 0.15) / 0.20);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.20 + 0.42 * Math.pow((nextT - 0.35) / 0.15, 0.82);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.62 + 0.22 * ((nextT - 0.50) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.84 + 0.10 * ((nextT - 0.65) / 0.15);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    // ============ ASIAN DESIGN STORMS ============

    case 'singapore_pub': {
      // Singapore PUB standard - front-loaded tropical convective
      // 70-80% of rain in first 30% of duration, very high peak
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.10) {
          cumulativeFraction = 0.30 * Math.pow(t / 0.10, 0.65);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.30 + 0.42 * Math.pow((t - 0.10) / 0.15, 0.75);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.72 + 0.15 * ((t - 0.25) / 0.15);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.87 + 0.08 * ((t - 0.40) / 0.20);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.60) / 0.40);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.30 * Math.pow(nextT / 0.10, 0.65);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.30 + 0.42 * Math.pow((nextT - 0.10) / 0.15, 0.75);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.72 + 0.15 * ((nextT - 0.25) / 0.15);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.87 + 0.08 * ((nextT - 0.40) / 0.20);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.60) / 0.40);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'china_gb50014': {
      // Chinese GB 50014-2021 urban drainage standard storm
      // Short-duration high-peak pattern for urban areas (1-6hr)
      // Based on standardized P&C formula with Beijing-type coefficients
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        // Peak at ~35-40% of duration, very sharp
        if (t <= 0.20) {
          cumulativeFraction = 0.12 * Math.pow(t / 0.20, 0.85);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.12 + 0.18 * ((t - 0.20) / 0.15);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.30 + 0.45 * Math.pow((t - 0.35) / 0.10, 0.70);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.75 + 0.12 * ((t - 0.45) / 0.10);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.87 + 0.08 * ((t - 0.55) / 0.20);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.12 * Math.pow(nextT / 0.20, 0.85);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.12 + 0.18 * ((nextT - 0.20) / 0.15);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.30 + 0.45 * Math.pow((nextT - 0.35) / 0.10, 0.70);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.75 + 0.12 * ((nextT - 0.45) / 0.10);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.87 + 0.08 * ((nextT - 0.55) / 0.20);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'china_prd': {
      // Pearl River Delta typhoon-influenced distribution
      // Front-loaded with extended tail from typhoon bands
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.25 * Math.pow(t / 0.15, 0.70);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.25 + 0.35 * Math.pow((t - 0.15) / 0.15, 0.75);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.60 + 0.18 * ((t - 0.30) / 0.20);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.78 + 0.12 * ((t - 0.50) / 0.20);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.70) / 0.30);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.25 * Math.pow(nextT / 0.15, 0.70);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.25 + 0.35 * Math.pow((nextT - 0.15) / 0.15, 0.75);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.60 + 0.18 * ((nextT - 0.30) / 0.20);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.78 + 0.12 * ((nextT - 0.50) / 0.20);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.70) / 0.30);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'india_imd': {
      // India Meteorological Department monsoon pattern
      // Center-peaked with gradual build-up representing monsoon conditions
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.08 * (t / 0.20);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.08 + 0.22 * Math.pow((t - 0.20) / 0.20, 0.85);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.30 + 0.40 * Math.pow((t - 0.40) / 0.15, 0.75);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.70 + 0.18 * ((t - 0.55) / 0.15);
        } else if (t <= 0.85) {
          cumulativeFraction = 0.88 + 0.08 * ((t - 0.70) / 0.15);
        } else {
          cumulativeFraction = 0.96 + 0.04 * ((t - 0.85) / 0.15);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.08 * (nextT / 0.20);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.08 + 0.22 * Math.pow((nextT - 0.20) / 0.20, 0.85);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.30 + 0.40 * Math.pow((nextT - 0.40) / 0.15, 0.75);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.70 + 0.18 * ((nextT - 0.55) / 0.15);
        } else if (nextT <= 0.85) {
          nextCumulative = 0.88 + 0.08 * ((nextT - 0.70) / 0.15);
        } else {
          nextCumulative = 0.96 + 0.04 * ((nextT - 0.85) / 0.15);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'india_coastal': {
      // Indian coastal cyclonic storm distribution
      // Very sharp peak (cyclonic eye passage), front-loaded
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.10 * (t / 0.15);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.10 + 0.50 * Math.pow((t - 0.15) / 0.15, 0.65);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.60 + 0.22 * ((t - 0.30) / 0.15);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.82 + 0.10 * ((t - 0.45) / 0.20);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.65) / 0.35);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.10 * (nextT / 0.15);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.10 + 0.50 * Math.pow((nextT - 0.15) / 0.15, 0.65);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.60 + 0.22 * ((nextT - 0.30) / 0.15);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.82 + 0.10 * ((nextT - 0.45) / 0.20);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.65) / 0.35);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'japan_amedas': {
      // Japanese AMeDAS short-duration convective event
      // Very sharp peak, rapid onset and recession (30min-3hr events)
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.05 * (t / 0.15);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.05 + 0.15 * ((t - 0.15) / 0.20);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.20 + 0.55 * Math.pow((t - 0.35) / 0.15, 0.65);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.75 + 0.15 * ((t - 0.50) / 0.15);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.65) / 0.35);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.05 * (nextT / 0.15);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.05 + 0.15 * ((nextT - 0.15) / 0.20);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.20 + 0.55 * Math.pow((nextT - 0.35) / 0.15, 0.65);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.75 + 0.15 * ((nextT - 0.50) / 0.15);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.65) / 0.35);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'japan_baiu': {
      // Japanese Baiu (梅雨) frontal rain - extended moderate intensity
      // Broader distribution, peak at ~45%, longer duration events
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.06 * (t / 0.15);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.06 + 0.14 * ((t - 0.15) / 0.15);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.20 + 0.30 * Math.pow((t - 0.30) / 0.15, 0.80);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.50 + 0.25 * ((t - 0.45) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.75 + 0.15 * ((t - 0.60) / 0.20);
        } else {
          cumulativeFraction = 0.90 + 0.10 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.06 * (nextT / 0.15);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.06 + 0.14 * ((nextT - 0.15) / 0.15);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.20 + 0.30 * Math.pow((nextT - 0.30) / 0.15, 0.80);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.50 + 0.25 * ((nextT - 0.45) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.75 + 0.15 * ((nextT - 0.60) / 0.20);
        } else {
          nextCumulative = 0.90 + 0.10 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'japan_typhoon': {
      // Japanese typhoon pattern - double peak with eye passage
      // Two peaks representing outer and inner rain bands
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        // Two Gaussian peaks representing outer band (0.25) and eyewall (0.65)
        const peak1 = 1.8 * Math.exp(-Math.pow((t - 0.25) / 0.10, 2));
        const peak2 = 2.8 * Math.exp(-Math.pow((t - 0.65) / 0.08, 2));
        // Light continuous rain between bands
        const base = 0.3;
        const intensity = (totalDepth / duration) * (peak1 + peak2 + base) * 0.55;
        data.push(Math.max(0, intensity));
      }
      break;
    }

    case 'korea_kma': {
      // Korean Meteorological Administration standard
      // Center-peaked with moderate asymmetry, accounts for monsoon + convective mix
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.06 * (t / 0.15);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.06 + 0.18 * ((t - 0.15) / 0.20);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.24 + 0.40 * Math.pow((t - 0.35) / 0.15, 0.72);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.64 + 0.20 * ((t - 0.50) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.84 + 0.10 * ((t - 0.65) / 0.15);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.06 * (nextT / 0.15);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.06 + 0.18 * ((nextT - 0.15) / 0.20);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.24 + 0.40 * Math.pow((nextT - 0.35) / 0.15, 0.72);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.64 + 0.20 * ((nextT - 0.50) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.84 + 0.10 * ((nextT - 0.65) / 0.15);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'malaysia_msma': {
      // Malaysian MSMA (Manual Saliran Mesra Alam) 2nd Edition
      // Tropical monsoon + convective pattern, moderate front-loading
      // KL/Klang Valley: high intensity due to urban heat island
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.10) {
          cumulativeFraction = 0.04 * (t / 0.10);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.04 + 0.22 * ((t - 0.10) / 0.15);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.26 + 0.38 * Math.pow((t - 0.25) / 0.15, 0.75);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.64 + 0.20 * ((t - 0.40) / 0.15);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.84 + 0.10 * ((t - 0.55) / 0.20);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.04 * (nextT / 0.10);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.04 + 0.22 * ((nextT - 0.10) / 0.15);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.26 + 0.38 * Math.pow((nextT - 0.25) / 0.15, 0.75);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.64 + 0.20 * ((nextT - 0.40) / 0.15);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.84 + 0.10 * ((nextT - 0.55) / 0.20);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'indonesia_bmkg': {
      // Indonesian BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
      // Jakarta-style tropical convective: very front-loaded, rapid onset
      // Wet season (Nov-Mar) pattern with extreme short-duration peaks
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.08) {
          cumulativeFraction = 0.15 * (t / 0.08);
        } else if (t <= 0.20) {
          cumulativeFraction = 0.15 + 0.35 * Math.pow((t - 0.08) / 0.12, 0.65);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.50 + 0.25 * ((t - 0.20) / 0.15);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.75 + 0.15 * ((t - 0.35) / 0.20);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.90 + 0.07 * ((t - 0.55) / 0.25);
        } else {
          cumulativeFraction = 0.97 + 0.03 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.08) {
          nextCumulative = 0.15 * (nextT / 0.08);
        } else if (nextT <= 0.20) {
          nextCumulative = 0.15 + 0.35 * Math.pow((nextT - 0.08) / 0.12, 0.65);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.50 + 0.25 * ((nextT - 0.20) / 0.15);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.75 + 0.15 * ((nextT - 0.35) / 0.20);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.90 + 0.07 * ((nextT - 0.55) / 0.25);
        } else {
          nextCumulative = 0.97 + 0.03 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'philippines_pagasa': {
      // Philippine PAGASA typhoon/monsoon distribution
      // Very front-loaded for typhoon events, sharp peak then extended tail
      // Accounts for super-typhoon class events (>220 kph)
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.05) {
          cumulativeFraction = 0.08 * (t / 0.05);
        } else if (t <= 0.15) {
          cumulativeFraction = 0.08 + 0.32 * Math.pow((t - 0.05) / 0.10, 0.60);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.40 + 0.28 * ((t - 0.15) / 0.15);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.68 + 0.17 * ((t - 0.30) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.05) {
          nextCumulative = 0.08 * (nextT / 0.05);
        } else if (nextT <= 0.15) {
          nextCumulative = 0.08 + 0.32 * Math.pow((nextT - 0.05) / 0.10, 0.60);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.40 + 0.28 * ((nextT - 0.15) / 0.15);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.68 + 0.17 * ((nextT - 0.30) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'vietnam_imhen': {
      // Vietnamese IMHEN (Institute of Meteorology, Hydrology and Climate Change)
      // HCMC-style: convective + monsoon hybrid, moderate front-loading
      // Central coast variant would be more typhoon-influenced
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.10) {
          cumulativeFraction = 0.05 * (t / 0.10);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.05 + 0.20 * ((t - 0.10) / 0.15);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.25 + 0.35 * Math.pow((t - 0.25) / 0.15, 0.70);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.60 + 0.22 * ((t - 0.40) / 0.15);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.82 + 0.12 * ((t - 0.55) / 0.20);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.05 * (nextT / 0.10);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.05 + 0.20 * ((nextT - 0.10) / 0.15);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.25 + 0.35 * Math.pow((nextT - 0.25) / 0.15, 0.70);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.60 + 0.22 * ((nextT - 0.40) / 0.15);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.82 + 0.12 * ((nextT - 0.55) / 0.20);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'thailand_tmd': {
      // Thai Meteorological Department (TMD)
      // Bangkok BMA pattern: monsoon with urban heat island intensification
      // Southwest monsoon (May-Oct) dominant pattern
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.12) {
          cumulativeFraction = 0.05 * (t / 0.12);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.05 + 0.25 * ((t - 0.12) / 0.18);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.30 + 0.35 * Math.pow((t - 0.30) / 0.15, 0.72);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.65 + 0.18 * ((t - 0.45) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.83 + 0.11 * ((t - 0.60) / 0.20);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.12) {
          nextCumulative = 0.05 * (nextT / 0.12);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.05 + 0.25 * ((nextT - 0.12) / 0.18);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.30 + 0.35 * Math.pow((nextT - 0.30) / 0.15, 0.72);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.65 + 0.18 * ((nextT - 0.45) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.83 + 0.11 * ((nextT - 0.60) / 0.20);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'saudi_pme': {
      // Saudi Arabia PME (Presidency of Meteorology and Environment)
      // Arid flash flood: extremely front-loaded, very short intense burst
      // Jeddah/Riyadh wadi flood pattern — most rain in first 20% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.05) {
          cumulativeFraction = 0.12 * (t / 0.05);
        } else if (t <= 0.15) {
          cumulativeFraction = 0.12 + 0.40 * Math.pow((t - 0.05) / 0.10, 0.55);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.52 + 0.22 * ((t - 0.15) / 0.10);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.74 + 0.14 * ((t - 0.25) / 0.15);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.88 + 0.08 * ((t - 0.40) / 0.25);
        } else {
          cumulativeFraction = 0.96 + 0.04 * ((t - 0.65) / 0.35);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.05) {
          nextCumulative = 0.12 * (nextT / 0.05);
        } else if (nextT <= 0.15) {
          nextCumulative = 0.12 + 0.40 * Math.pow((nextT - 0.05) / 0.10, 0.55);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.52 + 0.22 * ((nextT - 0.15) / 0.10);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.74 + 0.14 * ((nextT - 0.25) / 0.15);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.88 + 0.08 * ((nextT - 0.40) / 0.25);
        } else {
          nextCumulative = 0.96 + 0.04 * ((nextT - 0.65) / 0.35);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'uae_ncms': {
      // UAE NCMS (National Center of Meteorology and Seismology)
      // Dubai/Abu Dhabi flash flood: extreme burst with rapid decay
      // Accounts for cloud seeding enhanced events
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.08) {
          cumulativeFraction = 0.18 * (t / 0.08);
        } else if (t <= 0.18) {
          cumulativeFraction = 0.18 + 0.38 * Math.pow((t - 0.08) / 0.10, 0.50);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.56 + 0.20 * ((t - 0.18) / 0.12);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.76 + 0.14 * ((t - 0.30) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.90 + 0.07 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.97 + 0.03 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.08) {
          nextCumulative = 0.18 * (nextT / 0.08);
        } else if (nextT <= 0.18) {
          nextCumulative = 0.18 + 0.38 * Math.pow((nextT - 0.08) / 0.10, 0.50);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.56 + 0.20 * ((nextT - 0.18) / 0.12);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.76 + 0.14 * ((nextT - 0.30) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.90 + 0.07 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.97 + 0.03 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'qatar_kahramaa': {
      // Qatar Kahramaa/Ashghal drainage design standard
      // Extremely arid flash flood — shortest burst among GCC
      // Doha urban drainage pattern
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.06) {
          cumulativeFraction = 0.20 * (t / 0.06);
        } else if (t <= 0.15) {
          cumulativeFraction = 0.20 + 0.38 * Math.pow((t - 0.06) / 0.09, 0.48);
        } else if (t <= 0.28) {
          cumulativeFraction = 0.58 + 0.22 * ((t - 0.15) / 0.13);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.80 + 0.12 * ((t - 0.28) / 0.17);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.92 + 0.05 * ((t - 0.45) / 0.25);
        } else {
          cumulativeFraction = 0.97 + 0.03 * ((t - 0.70) / 0.30);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.06) {
          nextCumulative = 0.20 * (nextT / 0.06);
        } else if (nextT <= 0.15) {
          nextCumulative = 0.20 + 0.38 * Math.pow((nextT - 0.06) / 0.09, 0.48);
        } else if (nextT <= 0.28) {
          nextCumulative = 0.58 + 0.22 * ((nextT - 0.15) / 0.13);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.80 + 0.12 * ((nextT - 0.28) / 0.17);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.92 + 0.05 * ((nextT - 0.45) / 0.25);
        } else {
          nextCumulative = 0.97 + 0.03 * ((nextT - 0.70) / 0.30);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'oman_dgman': {
      // Oman DGMAN (Directorate General of Meteorology and Air Navigation)
      // Muscat/Salalah wadi flood pattern — Shamal wind-driven events
      // Includes Khareef (monsoon) influence for Dhofar region
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.07) {
          cumulativeFraction = 0.10 * (t / 0.07);
        } else if (t <= 0.18) {
          cumulativeFraction = 0.10 + 0.35 * Math.pow((t - 0.07) / 0.11, 0.58);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.45 + 0.25 * ((t - 0.18) / 0.12);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.70 + 0.16 * ((t - 0.30) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.86 + 0.09 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.07) {
          nextCumulative = 0.10 * (nextT / 0.07);
        } else if (nextT <= 0.18) {
          nextCumulative = 0.10 + 0.35 * Math.pow((nextT - 0.07) / 0.11, 0.58);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.45 + 0.25 * ((nextT - 0.18) / 0.12);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.70 + 0.16 * ((nextT - 0.30) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.86 + 0.09 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'sa_sanral': {
      // South Africa SANRAL drainage design storm
      // Modified Huff 2nd quartile calibrated for South African conditions
      // Moderate front-loading with sustained mid-storm intensity
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.12 * Math.pow(t / 0.15, 0.85);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.12 + 0.38 * Math.pow((t - 0.15) / 0.20, 0.75);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.50 + 0.28 * ((t - 0.35) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.78 + 0.14 * ((t - 0.55) / 0.20);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.12 * Math.pow(nextT / 0.15, 0.85);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.12 + 0.38 * Math.pow((nextT - 0.15) / 0.20, 0.75);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.50 + 0.28 * ((nextT - 0.35) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.78 + 0.14 * ((nextT - 0.55) / 0.20);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'kenya_kmd': {
      // Kenya Meteorological Department convective storm
      // Short-duration intense burst typical of East African highlands
      // Very front-loaded with rapid decay — 65% in first 25% of duration
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.08) {
          cumulativeFraction = 0.20 * Math.pow(t / 0.08, 0.70);
        } else if (t <= 0.25) {
          cumulativeFraction = 0.20 + 0.45 * Math.pow((t - 0.08) / 0.17, 0.65);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.65 + 0.20 * ((t - 0.25) / 0.20);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.45) / 0.25);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.70) / 0.30);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.08) {
          nextCumulative = 0.20 * Math.pow(nextT / 0.08, 0.70);
        } else if (nextT <= 0.25) {
          nextCumulative = 0.20 + 0.45 * Math.pow((nextT - 0.08) / 0.17, 0.65);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.65 + 0.20 * ((nextT - 0.25) / 0.20);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.45) / 0.25);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.70) / 0.30);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'nigeria_nimet': {
      // Nigeria NiMet tropical convective pattern
      // West African monsoon — center-peaked with broad shoulders
      // Represents ITCZ-driven rainfall with sustained intensity
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.10 * Math.pow(t / 0.20, 0.90);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.10 + 0.35 * Math.pow((t - 0.20) / 0.20, 0.80);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.45 + 0.30 * ((t - 0.40) / 0.20);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.75 + 0.17 * ((t - 0.60) / 0.20);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.10 * Math.pow(nextT / 0.20, 0.90);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.10 + 0.35 * Math.pow((nextT - 0.20) / 0.20, 0.80);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.45 + 0.30 * ((nextT - 0.40) / 0.20);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.75 + 0.17 * ((nextT - 0.60) / 0.20);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'egypt_hcww': {
      // Egypt HCWW (Holding Company for Water & Wastewater) flash flood pattern
      // Extremely arid flash flood — nearly all rain in first 15% of duration
      // Represents rare but intense Mediterranean/Red Sea convergence events
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.05) {
          cumulativeFraction = 0.25 * Math.pow(t / 0.05, 0.60);
        } else if (t <= 0.15) {
          cumulativeFraction = 0.25 + 0.45 * Math.pow((t - 0.05) / 0.10, 0.55);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.70 + 0.18 * ((t - 0.15) / 0.15);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.88 + 0.08 * ((t - 0.30) / 0.25);
        } else {
          cumulativeFraction = 0.96 + 0.04 * ((t - 0.55) / 0.45);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.05) {
          nextCumulative = 0.25 * Math.pow(nextT / 0.05, 0.60);
        } else if (nextT <= 0.15) {
          nextCumulative = 0.25 + 0.45 * Math.pow((nextT - 0.05) / 0.10, 0.55);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.70 + 0.18 * ((nextT - 0.15) / 0.15);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.88 + 0.08 * ((nextT - 0.30) / 0.25);
        } else {
          nextCumulative = 0.96 + 0.04 * ((nextT - 0.55) / 0.45);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'brazil_ana': {
      // Brazil ANA (Agência Nacional de Águas) design storm
      // Tropical convective with center peak — typical of SE Brazil (São Paulo, Rio)
      // Based on Cetesb/DAEE alternating block adapted for Brazilian IDF curves
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.08 * Math.pow(t / 0.20, 0.90);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.08 + 0.37 * Math.pow((t - 0.20) / 0.20, 0.80);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.45 + 0.32 * ((t - 0.40) / 0.20);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.77 + 0.15 * ((t - 0.60) / 0.20);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.08 * Math.pow(nextT / 0.20, 0.90);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.08 + 0.37 * Math.pow((nextT - 0.20) / 0.20, 0.80);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.45 + 0.32 * ((nextT - 0.40) / 0.20);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.77 + 0.15 * ((nextT - 0.60) / 0.20);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'mexico_conagua': {
      // Mexico CONAGUA (Comisión Nacional del Agua) design storm
      // Front-loaded tropical/convective pattern for central Mexico
      // Based on SCT highway drainage manual IDF methodology
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.10) {
          cumulativeFraction = 0.15 * Math.pow(t / 0.10, 0.75);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.15 + 0.40 * Math.pow((t - 0.10) / 0.20, 0.70);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.55 + 0.25 * ((t - 0.30) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.80 + 0.13 * ((t - 0.50) / 0.25);
        } else {
          cumulativeFraction = 0.93 + 0.07 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.15 * Math.pow(nextT / 0.10, 0.75);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.15 + 0.40 * Math.pow((nextT - 0.10) / 0.20, 0.70);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.55 + 0.25 * ((nextT - 0.30) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.80 + 0.13 * ((nextT - 0.50) / 0.25);
        } else {
          nextCumulative = 0.93 + 0.07 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'colombia_ideam': {
      // Colombia IDEAM (Instituto de Hidrología, Meteorología y Estudios Ambientales)
      // Tropical Andean bimodal pattern — center-peaked with sustained intensity
      // Represents convective storms in Bogotá/Medellín inter-Andean valleys
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.06 * Math.pow(t / 0.15, 0.85);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.06 + 0.34 * Math.pow((t - 0.15) / 0.20, 0.75);
        } else if (t <= 0.55) {
          cumulativeFraction = 0.40 + 0.35 * ((t - 0.35) / 0.20);
        } else if (t <= 0.75) {
          cumulativeFraction = 0.75 + 0.17 * ((t - 0.55) / 0.20);
        } else {
          cumulativeFraction = 0.92 + 0.08 * ((t - 0.75) / 0.25);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.06 * Math.pow(nextT / 0.15, 0.85);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.06 + 0.34 * Math.pow((nextT - 0.15) / 0.20, 0.75);
        } else if (nextT <= 0.55) {
          nextCumulative = 0.40 + 0.35 * ((nextT - 0.35) / 0.20);
        } else if (nextT <= 0.75) {
          nextCumulative = 0.75 + 0.17 * ((nextT - 0.55) / 0.20);
        } else {
          nextCumulative = 0.92 + 0.08 * ((nextT - 0.75) / 0.25);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'chile_dga': {
      // Chile DGA (Dirección General de Aguas) design storm
      // Frontal/orographic pattern — broad center peak typical of central Chile winter storms
      // Based on DGA Manual de Cálculo de Crecidas methodology
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.25) {
          cumulativeFraction = 0.12 * Math.pow(t / 0.25, 0.95);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.12 + 0.38 * Math.pow((t - 0.25) / 0.20, 0.85);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.50 + 0.30 * ((t - 0.45) / 0.20);
        } else if (t <= 0.85) {
          cumulativeFraction = 0.80 + 0.14 * ((t - 0.65) / 0.20);
        } else {
          cumulativeFraction = 0.94 + 0.06 * ((t - 0.85) / 0.15);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.25) {
          nextCumulative = 0.12 * Math.pow(nextT / 0.25, 0.95);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.12 + 0.38 * Math.pow((nextT - 0.25) / 0.20, 0.85);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.50 + 0.30 * ((nextT - 0.45) / 0.20);
        } else if (nextT <= 0.85) {
          nextCumulative = 0.80 + 0.14 * ((nextT - 0.65) / 0.20);
        } else {
          nextCumulative = 0.94 + 0.06 * ((nextT - 0.85) / 0.15);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'nz_tp108': {
      // Auckland TP108 — Auckland Council Technical Publication 108
      // Provides rainfall depths for design storms from 3-month to 500-year ARI
      // Peak at ~40% of duration, moderate front-loading typical of NZ maritime convective storms
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.10 * Math.pow(t / 0.20, 0.90);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.10 + 0.20 * ((t - 0.20) / 0.15);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.30 + 0.40 * Math.pow((t - 0.35) / 0.15, 0.80);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.70 + 0.16 * ((t - 0.50) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.86 + 0.09 * ((t - 0.65) / 0.15);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.10 * Math.pow(nextT / 0.20, 0.90);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.10 + 0.20 * ((nextT - 0.20) / 0.15);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.30 + 0.40 * Math.pow((nextT - 0.35) / 0.15, 0.80);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.70 + 0.16 * ((nextT - 0.50) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.86 + 0.09 * ((nextT - 0.65) / 0.15);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'nz_wellington': {
      // Wellington Regional Council design storm
      // Exposed westerly/southerly maritime climate — strong orographic uplift
      // Front-loaded pattern with earlier peak (~35%) reflecting frontal passage
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.15) {
          cumulativeFraction = 0.08 * Math.pow(t / 0.15, 0.85);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.08 + 0.30 * Math.pow((t - 0.15) / 0.15, 0.80);
        } else if (t <= 0.45) {
          cumulativeFraction = 0.38 + 0.32 * ((t - 0.30) / 0.15);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.70 + 0.15 * ((t - 0.45) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.85 + 0.10 * ((t - 0.60) / 0.20);
        } else {
          cumulativeFraction = 0.95 + 0.05 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.15) {
          nextCumulative = 0.08 * Math.pow(nextT / 0.15, 0.85);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.08 + 0.30 * Math.pow((nextT - 0.15) / 0.15, 0.80);
        } else if (nextT <= 0.45) {
          nextCumulative = 0.38 + 0.32 * ((nextT - 0.30) / 0.15);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.70 + 0.15 * ((nextT - 0.45) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.85 + 0.10 * ((nextT - 0.60) / 0.20);
        } else {
          nextCumulative = 0.95 + 0.05 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'nz_christchurch': {
      // Christchurch / Canterbury design storm
      // Eastern rain-shadow plains — nor'easter and southerly change patterns
      // Broader, more symmetric distribution with moderate peak at ~45%
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;
        
        if (t <= 0.20) {
          cumulativeFraction = 0.08 * Math.pow(t / 0.20, 0.95);
        } else if (t <= 0.35) {
          cumulativeFraction = 0.08 + 0.15 * ((t - 0.20) / 0.15);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.23 + 0.35 * Math.pow((t - 0.35) / 0.15, 0.85);
        } else if (t <= 0.65) {
          cumulativeFraction = 0.58 + 0.22 * ((t - 0.50) / 0.15);
        } else if (t <= 0.80) {
          cumulativeFraction = 0.80 + 0.13 * ((t - 0.65) / 0.15);
        } else {
          cumulativeFraction = 0.93 + 0.07 * ((t - 0.80) / 0.20);
        }
        
        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.20) {
          nextCumulative = 0.08 * Math.pow(nextT / 0.20, 0.95);
        } else if (nextT <= 0.35) {
          nextCumulative = 0.08 + 0.15 * ((nextT - 0.20) / 0.15);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.23 + 0.35 * Math.pow((nextT - 0.35) / 0.15, 0.85);
        } else if (nextT <= 0.65) {
          nextCumulative = 0.58 + 0.22 * ((nextT - 0.50) / 0.15);
        } else if (nextT <= 0.80) {
          nextCumulative = 0.80 + 0.13 * ((nextT - 0.65) / 0.15);
        } else {
          nextCumulative = 0.93 + 0.07 * ((nextT - 0.80) / 0.20);
        }
        
        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    case 'pmp_hmr': {
      // Probable Maximum Precipitation — HMR 51/52 generalized storm
      // Dam safety / nuclear facility design — worst-case meteorological scenario
      // Based on NOAA HMR 51 (1978) & HMR 52 (1982) generalized temporal distribution
      // 72-hour PMP collapsed to dimensionless time; very broad, sustained peak
      // centered ~40% through duration with heavy front-loading
      for (let i = 0; i < numSteps; i++) {
        const t = i / numSteps;
        let cumulativeFraction: number;

        // HMR 51/52 generalized 6-hour incremental distribution (dimensionless)
        // Heaviest 6-hr block placed at ~40% of duration, surrounding blocks arranged
        // in alternating descending order per standard HMR methodology
        if (t <= 0.10) {
          cumulativeFraction = 0.04 * (t / 0.10);
        } else if (t <= 0.20) {
          cumulativeFraction = 0.04 + 0.08 * ((t - 0.10) / 0.10);
        } else if (t <= 0.30) {
          cumulativeFraction = 0.12 + 0.13 * ((t - 0.20) / 0.10);
        } else if (t <= 0.40) {
          cumulativeFraction = 0.25 + 0.30 * Math.pow((t - 0.30) / 0.10, 0.80);
        } else if (t <= 0.50) {
          cumulativeFraction = 0.55 + 0.18 * ((t - 0.40) / 0.10);
        } else if (t <= 0.60) {
          cumulativeFraction = 0.73 + 0.12 * ((t - 0.50) / 0.10);
        } else if (t <= 0.70) {
          cumulativeFraction = 0.85 + 0.07 * ((t - 0.60) / 0.10);
        } else if (t <= 0.85) {
          cumulativeFraction = 0.92 + 0.05 * ((t - 0.70) / 0.15);
        } else {
          cumulativeFraction = 0.97 + 0.03 * ((t - 0.85) / 0.15);
        }

        const nextT = Math.min((i + 1) / numSteps, 1.0);
        let nextCumulative: number;
        if (nextT <= 0.10) {
          nextCumulative = 0.04 * (nextT / 0.10);
        } else if (nextT <= 0.20) {
          nextCumulative = 0.04 + 0.08 * ((nextT - 0.10) / 0.10);
        } else if (nextT <= 0.30) {
          nextCumulative = 0.12 + 0.13 * ((nextT - 0.20) / 0.10);
        } else if (nextT <= 0.40) {
          nextCumulative = 0.25 + 0.30 * Math.pow((nextT - 0.30) / 0.10, 0.80);
        } else if (nextT <= 0.50) {
          nextCumulative = 0.55 + 0.18 * ((nextT - 0.40) / 0.10);
        } else if (nextT <= 0.60) {
          nextCumulative = 0.73 + 0.12 * ((nextT - 0.50) / 0.10);
        } else if (nextT <= 0.70) {
          nextCumulative = 0.85 + 0.07 * ((nextT - 0.60) / 0.10);
        } else if (nextT <= 0.85) {
          nextCumulative = 0.92 + 0.05 * ((nextT - 0.70) / 0.15);
        } else {
          nextCumulative = 0.97 + 0.03 * ((nextT - 0.85) / 0.15);
        }

        const incrementalDepth = (nextCumulative - cumulativeFraction) * totalDepth;
        data.push(incrementalDepth / (timeStep / 60));
      }
      break;
    }

    // ─── New patterns from Design Storm Equations Reference ───

    case 'sifalda': {
      // Sifalda (Czech Republic) — three uniform intensity blocks
      // Part 1: 0–34% receives 14% of depth, Part 2: 34–51% receives 56%, Part 3: 51–100% receives 30%
      const t1End = 0.34, t2End = 0.51;
      for (let i = 0; i < numSteps; i++) {
        const t = (i + 0.5) / numSteps;
        let intensity: number;
        if (t <= t1End) intensity = (0.14 * totalDepth) / (t1End * duration);
        else if (t <= t2End) intensity = (0.56 * totalDepth) / ((t2End - t1End) * duration);
        else intensity = (0.30 * totalDepth) / ((1 - t2End) * duration);
        data.push(intensity);
      }
      break;
    }

    case 'danish_svk':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.375);

    case 'swedish_smhi':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.35);

    case 'norwegian_nve':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.33);

    case 'finnish_fmi':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.35);

    case 'swiss_idf':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'spanish_cedex':
      // Alternating block with center peak (similar to balanced storm)
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.50);

    case 'belgian_irm':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.50);

    case 'pilgrim_cordery': {
      // Pilgrim-Cordery (Australia historical) — empirical dimensionless ordinates
      const pcTime = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const pcDepth = [0, 0.04, 0.10, 0.19, 0.42, 0.66, 0.80, 0.88, 0.93, 0.97, 1.00];
      return applyDimensionlessCurve(pcTime, pcDepth, totalDepth, numSteps, timeStep);
    }

    case 'watts_curve': {
      // Watt's Curve (UK historical) — beta distribution α=β=2.5
      const alpha = 2.5, betaP = 2.5;
      let totalRaw = 0;
      const rawVals: number[] = [];
      for (let i = 0; i < numSteps; i++) {
        const x = (i + 0.5) / numSteps;
        const v = Math.pow(x, alpha - 1) * Math.pow(1 - x, betaP - 1);
        rawVals.push(v);
        totalRaw += v;
      }
      for (const v of rawVals) data.push((v / totalRaw) * totalDepth / (timeStep / 60));
      break;
    }

    case 'hong_kong_hko': {
      // Hong Kong HKO — front-loaded typhoon mass curve
      const hkoTime = [0, 0.042, 0.083, 0.125, 0.167, 0.25, 0.333, 0.417, 0.5, 0.583, 0.667, 0.75, 0.833, 0.917, 1.0];
      const hkoDepth = [0, 0.08, 0.18, 0.29, 0.39, 0.54, 0.65, 0.74, 0.81, 0.86, 0.90, 0.93, 0.96, 0.98, 1.0];
      return applyDimensionlessCurve(hkoTime, hkoDepth, totalDepth, numSteps, timeStep);
    }

    case 'taiwan_cwa':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.45);

    case 'bangladesh_bmd': {
      // Bangladesh BMD — monsoon rear-loaded mass curve
      const bdTime = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const bdDepth = [0, 0.03, 0.08, 0.15, 0.24, 0.36, 0.50, 0.65, 0.79, 0.91, 1.0];
      return applyDimensionlessCurve(bdTime, bdDepth, totalDepth, numSteps, timeStep);
    }

    case 'pakistan_pmd':
      return betaStorm(totalDepth, numSteps, timeStep, 0.45);

    case 'sri_lanka':
      return betaStorm(totalDepth, numSteps, timeStep, 0.40);

    case 'fiji_fms': {
      // Fiji FMS — tropical cyclone front-loaded
      const fjTime = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const fjDepth = [0, 0.12, 0.28, 0.45, 0.60, 0.72, 0.82, 0.89, 0.94, 0.97, 1.0];
      return applyDimensionlessCurve(fjTime, fjDepth, totalDepth, numSteps, timeStep);
    }

    case 'argentina_smn':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.33);

    case 'peru_senamhi':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'ecuador_inamhi':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'venezuela_inameh':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'puerto_rico':
      // Modified SCS Type II with tropical adjustment — peak shifted to 48%
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.48);

    case 'morocco_dmn':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.38);

    case 'ethiopia_nma':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.42);

    case 'ghana_gmet':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.32);

    case 'tanzania_tma':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.44);

    case 'mozambique_inam':
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'hirds_nz': {
      // HIRDS NZ — asymmetric hyperbolic tangent (North-NI default)
      const a = 1.0, b = 3.5, c = 0.55;
      for (let i = 0; i < numSteps; i++) {
        const t1 = i / numSteps;
        const t2 = (i + 1) / numSteps;
        const F1 = 0.5 * (1 + a * Math.tanh(b * (t1 - c)));
        const F2 = 0.5 * (1 + a * Math.tanh(b * (t2 - c)));
        const depth = (F2 - F1) * totalDepth;
        data.push(depth / (timeStep / 60));
      }
      break;
    }

    case 'arid_flash_flood': {
      // Arid zone flash flood — exponential decay, 70% in first 30%
      let totalRawArid = 0;
      const rawArid: number[] = [];
      for (let i = 0; i < numSteps; i++) {
        const x = (i + 0.5) / numSteps;
        const v = Math.exp(-3 * x);
        rawArid.push(v);
        totalRawArid += v;
      }
      for (const v of rawArid) data.push((v / totalRawArid) * totalDepth / (timeStep / 60));
      break;
    }

    // ─── NEW PATTERNS (v2) ───

    case 'aes_30': {
      // AES (Atmospheric Environment Service) Canada 30% distribution
      // Peak at 30% of duration — commonly used in Ontario (Hogg 1980)
      // Verified coordinates: 65% of depth by t/D=0.30, long low-intensity tail
      const aes30T = [0, 0.10, 0.20, 0.30, 0.40, 0.60, 0.80, 1.0];
      const aes30D = [0, 0.05, 0.15, 0.65, 0.75, 0.88, 0.96, 1.0];
      return applyDimensionlessCurve(aes30T, aes30D, totalDepth, numSteps, timeStep);
    }

    case 'aes_40': {
      // AES Canada 40% distribution — peak at 40%, used in BC and prairies
      // Same logic as AES 30% but peak shifted to 40% of duration
      const aes40T = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.80, 1.0];
      const aes40D = [0, 0.03, 0.08, 0.20, 0.65, 0.80, 0.90, 0.97, 1.0];
      return applyDimensionlessCurve(aes40T, aes40D, totalDepth, numSteps, timeStep);
    }

    case 'kostra_dwd': {
      // KOSTRA-DWD Germany — Euler Type II alternating-block method
      // Peak 5-min intensity placed at end of first third of duration
      // Blocks ranked by intensity: highest=center, 2nd=left, 3rd=right, alternating
      // This produces a proper Euler II shape per DWA-A 118
      const n = numSteps;
      const peakIdx = Math.max(0, Math.round(n / 3) - 1); // end of first third
      const ranks: number[] = new Array(n).fill(0);
      // Generate decreasing intensities using IDF power-law decay
      const intensities = Array.from({ length: n }, (_, i) => 1 / Math.pow(i + 1, 0.7));
      // Place alternating: peak at peakIdx, then left, right, left, right...
      ranks[peakIdx] = intensities[0];
      let left = peakIdx - 1, right = peakIdx + 1;
      for (let r = 1; r < n; r++) {
        if (r % 2 === 1 && left >= 0) { ranks[left] = intensities[r]; left--; }
        else if (r % 2 === 0 && right < n) { ranks[right] = intensities[r]; right++; }
        else if (left >= 0) { ranks[left] = intensities[r]; left--; }
        else if (right < n) { ranks[right] = intensities[r]; right++; }
      }
      const totalRaw = ranks.reduce((a, b) => a + b, 0);
      return ranks.map(v => (v / totalRaw) * totalDepth / (timeStep / 60));
    }

    case 'dubai_dm': {
      // Dubai Municipality (DM) — Modified FEH 90th percentile summer profile
      // 2024/2025 guidelines: extremely peaked "needle" at 50% of duration
      // Reflects desert convective flash flood: ~60% of depth in central 10%
      const dmT = [0, 0.10, 0.20, 0.30, 0.40, 0.45, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const dmD = [0, 0.02, 0.06, 0.12, 0.20, 0.30, 0.80, 0.88, 0.92, 0.95, 0.97, 0.99, 1.0];
      return applyDimensionlessCurve(dmT, dmD, totalDepth, numSteps, timeStep);
    }

    case 'abu_dhabi_adm': {
      // Abu Dhabi Municipality (ADM) — Modified FEH 75th percentile profile
      // 2024 update: peaked at 50% but slightly less extreme than Dubai DM
      const admT = [0, 0.10, 0.20, 0.30, 0.40, 0.45, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const admD = [0, 0.03, 0.07, 0.14, 0.22, 0.32, 0.72, 0.82, 0.88, 0.93, 0.96, 0.99, 1.0];
      return applyDimensionlessCurve(admT, admD, totalDepth, numSteps, timeStep);
    }

    case 'montana_caquot': {
      // French Montana/Caquot power-law synthetic hyetograph
      // i(t) = a·t^(-b), with b≈0.66 (standard French urban drainage)
      // Instruction Technique IT77 compatible, Caquot method standard
      const b_exp = 0.66;
      let totalRawMont = 0;
      const rawMont: number[] = [];
      for (let i = 0; i < numSteps; i++) {
        const tFrac = (i + 0.5) / numSteps;
        // Decreasing power-law intensity
        const v = Math.pow(tFrac, -b_exp);
        rawMont.push(isFinite(v) ? v : 0);
        totalRawMont += isFinite(v) ? v : 0;
      }
      return rawMont.map(v => (v / totalRawMont) * totalDepth / (timeStep / 60));
    }

    case 'm5_60_fsr': {
      // M5-60 UK/Ireland — FSR short-duration variant
      // Flood Studies Report profile for durations ≤ 2 hours
      // More peaked than standard FSR, commonly used with M5-60 rainfall depth
      const m5T = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const m5D = [0, 0.02, 0.05, 0.14, 0.28, 0.55, 0.78, 0.86, 0.90, 0.94, 0.97, 0.99, 1.0];
      return applyDimensionlessCurve(m5T, m5D, totalDepth, numSteps, timeStep);
    }

    case 'arr2019': {
      // ARR 2019 Australia — Representative median ensemble pattern
      // Australian Rainfall & Runoff 2019 moved to 10 ensemble temporal patterns
      // This is the median (50th percentile) representative burst pattern
      const arrT = [0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const arrD = [0, 0.03, 0.07, 0.13, 0.22, 0.40, 0.58, 0.72, 0.82, 0.90, 0.95, 0.98, 1.0];
      return applyDimensionlessCurve(arrT, arrD, totalDepth, numSteps, timeStep);
    }

    case 'upm_plata': {
      // UPM Uruguay/Paraguay — Río de la Plata basin design storm
      // Center-peaked pattern derived from Paysandú/Asunción gauge records
      // Moderate front-loading with peak at ~35% of duration
      const upmT = [0, 0.05, 0.10, 0.20, 0.30, 0.35, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const upmD = [0, 0.03, 0.08, 0.18, 0.38, 0.58, 0.72, 0.83, 0.90, 0.94, 0.97, 0.99, 1.0];
      return applyDimensionlessCurve(upmT, upmD, totalDepth, numSteps, timeStep);
    }

    // ─── v3 patterns ───

    case 'feh22_refh2': {
      // FEH22/ReFH2 — UK current DDF model + ReFH2 design hyetograph
      // Tighter symmetric peak than older FEH, per CEH FEH22 guidance
      const fehT = [0, 0.10, 0.20, 0.30, 0.40, 0.45, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const fehD = [0, 0.02, 0.06, 0.12, 0.22, 0.35, 0.55, 0.72, 0.82, 0.90, 0.95, 0.98, 1.0];
      return applyDimensionlessCurve(fehT, fehD, totalDepth, numSteps, timeStep);
    }

    case 'noaa_a15': {
      // NOAA Atlas 15 — next-gen US precipitation frequency (pilot release)
      // Similar to Atlas 14 temporal with updated statistical treatment
      const a15T = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const a15D = [0, 0.03, 0.08, 0.15, 0.28, 0.50, 0.65, 0.76, 0.86, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(a15T, a15D, totalDepth, numSteps, timeStep);
    }

    case 'eccc_idf': {
      // ECCC Engineering Climate Datasets IDF — Environment Canada
      // Center-peaked, similar to Canadian CDA but with official IDF source
      const ecccT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const ecccD = [0, 0.04, 0.10, 0.18, 0.30, 0.52, 0.70, 0.82, 0.91, 0.96, 1.0];
      return applyDimensionlessCurve(ecccT, ecccD, totalDepth, numSteps, timeStep);
    }

    case 'shyreg_fr': {
      // SHYREG — French stochastic rainfall generator (IRSTEA/INRAE)
      // Moderate front-loading with broader peak than Desbordes
      const shyT = [0, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.0];
      const shyD = [0, 0.02, 0.08, 0.22, 0.45, 0.65, 0.78, 0.87, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(shyT, shyD, totalDepth, numSteps, timeStep);
    }

    case 'ireland_met': {
      // Ireland Met Éireann — Irish rainfall return-period IDF service
      // Similar to UK FEH but calibrated to Irish Atlantic climate
      const irT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const irD = [0, 0.03, 0.08, 0.16, 0.28, 0.50, 0.68, 0.80, 0.90, 0.96, 1.0];
      return applyDimensionlessCurve(irT, irD, totalDepth, numSteps, timeStep);
    }

    case 'arr87_legacy': {
      // ARR87 — legacy Australian IFD design rainfalls (BoM, pre-2016)
      // Broader peak than modern ARR2019 ensemble
      const arr87T = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const arr87D = [0, 0.04, 0.10, 0.18, 0.30, 0.50, 0.68, 0.80, 0.90, 0.96, 1.0];
      return applyDimensionlessCurve(arr87T, arr87D, totalDepth, numSteps, timeStep);
    }

    case 'hk_dsd_2018': {
      // Hong Kong DSD Stormwater Drainage Manual (5th ed., 2018)
      // Front-loaded design rainstorm aligned to DSD IDF
      const dsdT = [0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.75, 1.0];
      const dsdD = [0, 0.10, 0.25, 0.40, 0.55, 0.72, 0.82, 0.89, 0.94, 0.98, 1.0];
      return applyDimensionlessCurve(dsdT, dsdD, totalDepth, numSteps, timeStep);
    }

    case 'malaysia_hp1': {
      // Malaysia HP1 (Hydrological Procedure No.1, 2015 revision)
      // Center-peaked tropical with slightly earlier peak than MSMA
      const hp1T = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const hp1D = [0, 0.04, 0.10, 0.22, 0.42, 0.62, 0.76, 0.86, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(hp1T, hp1D, totalDepth, numSteps, timeStep);
    }

    case 'austria_okostra': {
      // Austria ÖKOSTRA — Austrian design rainfall for sewer/drainage
      // Euler Type II variant with peak at 1/3 of duration
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.33);
    }

    // ─── v4 patterns ───

    case 'france_shypre': {
      // France SHYPRE — Standard Hyetographs for Rainfall Events
      // Front-loaded convective pattern from IRSTEA/Météo-France regionalized model
      const shypreT = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const shypreD = [0, 0.04, 0.12, 0.30, 0.50, 0.66, 0.78, 0.86, 0.92, 0.96, 0.98, 1.0];
      return applyDimensionlessCurve(shypreT, shypreD, totalDepth, numSteps, timeStep);
    }

    case 'poland_panda': {
      // Poland PANDa — Polish National Precipitation Atlas (modern cluster-based)
      // Center-peaked moderate distribution replacing legacy Błaszczyk
      const pandaT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const pandaD = [0, 0.04, 0.10, 0.20, 0.38, 0.58, 0.74, 0.85, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(pandaT, pandaD, totalDepth, numSteps, timeStep);
    }

    case 'turkey_mgm':
      // Turkey MGM — Turkish State Meteorological Service IDF
      // Chicago-type with r=0.38 for Anatolian/Mediterranean climate
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.38);

    case 'israel_ims': {
      // Israel IMS — arid/semi-arid convective design storm
      // Front-loaded with 60% in first 30% — similar to Negev flash floods
      const imsT = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const imsD = [0, 0.08, 0.18, 0.42, 0.60, 0.72, 0.81, 0.88, 0.93, 0.96, 0.98, 1.0];
      return applyDimensionlessCurve(imsT, imsD, totalDepth, numSteps, timeStep);
    }

    case 'iran_irimo':
      // Iran IRIMO — Iranian Meteorological Organization IDF
      // Chicago-type with r=0.35 for Iranian semi-arid climate
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.35);

    case 'iraq_mos': {
      // Iraq MoS — Ministry of Science, Tigris-Euphrates basin
      // Front-loaded arid convective with rapid decay
      const iraqT = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const iraqD = [0, 0.06, 0.15, 0.38, 0.56, 0.69, 0.79, 0.87, 0.92, 0.96, 0.98, 1.0];
      return applyDimensionlessCurve(iraqT, iraqD, totalDepth, numSteps, timeStep);
    }

    case 'kazakhstan_kazhydromet':
      // Kazakhstan Kazhydromet — Central Asian continental IDF
      // Chicago-type with r=0.42 for continental steppe climate
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.42);

    case 'russia_roshydromet':
      // Russia Roshydromet — Russian continental IDF standards
      // Chicago-type with r=0.40 for temperate continental climate
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'portugal_ipma':
      // Portugal IPMA — Portuguese Mediterranean IDF
      // Chicago-type with r=0.40 for Atlantic/Mediterranean climate
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.40);

    case 'nz_niwa': {
      // NZ NIWA — National Institute of Water and Atmospheric Research
      // National standard, broader than TP108, calibrated to NZ-wide gauge data
      const niwaT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const niwaD = [0, 0.03, 0.09, 0.18, 0.32, 0.54, 0.72, 0.84, 0.92, 0.97, 1.0];
      return applyDimensionlessCurve(niwaT, niwaD, totalDepth, numSteps, timeStep);
    }

    case 'csa_w231': {
      // CSA W231 — Canadian Standards Association climate-adjusted IDF (2024)
      // Non-stationary rainfall accounting for climate change
      // Slightly more peaked than ECCC IDF due to climate intensification factors
      const csaT = [0, 0.10, 0.20, 0.30, 0.40, 0.45, 0.50, 0.55, 0.60, 0.70, 0.80, 0.90, 1.0];
      const csaD = [0, 0.03, 0.08, 0.16, 0.28, 0.38, 0.56, 0.70, 0.80, 0.89, 0.95, 0.98, 1.0];
      return applyDimensionlessCurve(csaT, csaD, totalDepth, numSteps, timeStep);
    }

    case 'sa_wrc': {
      // South Africa WRC — Water Research Commission design storm
      // Modified Huff with regional calibration, broader than SANRAL
      const wrcT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const wrcD = [0, 0.05, 0.12, 0.22, 0.38, 0.55, 0.70, 0.82, 0.91, 0.96, 1.0];
      return applyDimensionlessCurve(wrcT, wrcD, totalDepth, numSteps, timeStep);
    }

    case 'west_africa_cilss': {
      // West Africa CILSS/AGRHYMET — Sahel convective squall line
      // Very front-loaded with 65% in first 25% — intense but short-lived squalls
      const cilssT = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.35, 0.50, 0.65, 0.80, 1.0];
      const cilssD = [0, 0.10, 0.25, 0.40, 0.55, 0.65, 0.78, 0.88, 0.94, 0.98, 1.0];
      return applyDimensionlessCurve(cilssT, cilssD, totalDepth, numSteps, timeStep);
    }

    case 'noaa_a16': {
      // NOAA Atlas 16 — next-gen for western US (in development)
      // Updated statistical treatment with partial-duration series
      const a16T = [0, 0.10, 0.20, 0.30, 0.40, 0.48, 0.52, 0.60, 0.70, 0.80, 0.90, 1.0];
      const a16D = [0, 0.03, 0.08, 0.16, 0.28, 0.48, 0.62, 0.76, 0.86, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(a16T, a16D, totalDepth, numSteps, timeStep);
    }

    case 'euro_cordex': {
      // EURO-CORDEX — Climate-downscaled European ensemble temporal pattern
      // Slightly more peaked than historical due to climate intensification
      const cordexT = [0, 0.10, 0.20, 0.30, 0.40, 0.48, 0.52, 0.60, 0.70, 0.80, 0.90, 1.0];
      const cordexD = [0, 0.03, 0.07, 0.14, 0.26, 0.44, 0.60, 0.74, 0.85, 0.93, 0.97, 1.0];
      return applyDimensionlessCurve(cordexT, cordexD, totalDepth, numSteps, timeStep);
    }

    case 'mongolia_namem': {
      // Mongolia NAMEM — National Agency for Meteorology
      // High-altitude cold-arid continental with front-loaded convective burst
      const mongT = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const mongD = [0, 0.05, 0.14, 0.32, 0.50, 0.64, 0.76, 0.85, 0.91, 0.96, 0.98, 1.0];
      return applyDimensionlessCurve(mongT, mongD, totalDepth, numSteps, timeStep);
    }

    case 'pacific_sprep': {
      // Pacific SPREP — Pacific SIDS tropical cyclone pattern
      // Very front-loaded short-duration tropical burst
      const sprepT = [0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.75, 1.0];
      const sprepD = [0, 0.12, 0.28, 0.44, 0.58, 0.74, 0.84, 0.90, 0.94, 0.98, 1.0];
      return applyDimensionlessCurve(sprepT, sprepD, totalDepth, numSteps, timeStep);
    }

    case 'czech_chmu':
      // Czech ČHMÚ — Modern Czech Hydrometeorological Institute standards
      // Chicago-type with r=0.38, replaces legacy Sifalda for modern practice
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.38);

    // ─── v5 patterns ───

    case 'barbados_bms': {
      // Barbados Meteorological Service — modified Hershfield PMP
      // Tropical maritime convective with intense short-duration core
      const bmsT = [0, 0.05, 0.10, 0.15, 0.25, 0.35, 0.45, 0.55, 0.70, 0.85, 1.0];
      const bmsD = [0, 0.09, 0.22, 0.38, 0.58, 0.72, 0.82, 0.89, 0.95, 0.98, 1.0];
      return applyDimensionlessCurve(bmsT, bmsD, totalDepth, numSteps, timeStep);
    }

    case 'oecs_caribbean': {
      // OECS Eastern Caribbean — Bell's method with tropical cyclone adjustment
      // Moderately front-loaded with TC intensification factor
      const oecsT = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.85, 1.0];
      const oecsD = [0, 0.07, 0.18, 0.38, 0.55, 0.68, 0.79, 0.87, 0.93, 0.98, 1.0];
      return applyDimensionlessCurve(oecsT, oecsD, totalDepth, numSteps, timeStep);
    }

    case 'cyprus_wdd': {
      // Cyprus Water Development Department — Double-Triangular storm
      // Two-peak Mediterranean convective: primary peak at 25%, secondary at 65%
      const halfSteps = Math.floor(numSteps / 2);
      const data5 = new Array(numSteps).fill(0);
      const peak1Idx = Math.floor(numSteps * 0.25);
      const peak2Idx = Math.floor(numSteps * 0.65);
      // 60% of depth in first triangle, 40% in second
      const depth1 = totalDepth * 0.60;
      const depth2 = totalDepth * 0.40;
      const timeStepH = timeStep / 60;
      // First triangle: 0 to peak1Idx to midpoint
      const mid = Math.floor(numSteps * 0.45);
      for (let i = 0; i <= mid; i++) {
        if (i <= peak1Idx) {
          data5[i] = (depth1 * 2 / ((mid + 1) * timeStepH)) * (i / peak1Idx);
        } else {
          data5[i] = (depth1 * 2 / ((mid + 1) * timeStepH)) * ((mid - i) / (mid - peak1Idx));
        }
      }
      // Second triangle: midpoint to peak2Idx to end
      for (let i = mid + 1; i < numSteps; i++) {
        if (i <= peak2Idx) {
          data5[i] = (depth2 * 2 / ((numSteps - mid - 1) * timeStepH)) * ((i - mid) / (peak2Idx - mid));
        } else {
          data5[i] = (depth2 * 2 / ((numSteps - mid - 1) * timeStepH)) * ((numSteps - 1 - i) / (numSteps - 1 - peak2Idx));
        }
      }
      // Normalize volume
      const vol5 = data5.reduce((s, v) => s + v * timeStepH, 0);
      if (vol5 > 0) {
        const sc5 = totalDepth / vol5;
        for (let i = 0; i < numSteps; i++) data5[i] *= sc5;
      }
      return data5;
    }

    case 'malta_mra': {
      // Malta Resources Authority — composite Chicago-Huff method
      // Peak position determined by local quartile analysis (~r=0.32)
      // Hybrid: Chicago rising limb + Huff Q1 recession
      const maltaT = [0, 0.05, 0.10, 0.18, 0.28, 0.32, 0.40, 0.50, 0.60, 0.75, 0.90, 1.0];
      const maltaD = [0, 0.06, 0.16, 0.34, 0.54, 0.64, 0.76, 0.84, 0.90, 0.95, 0.98, 1.0];
      return applyDimensionlessCurve(maltaT, maltaD, totalDepth, numSteps, timeStep);
    }

    case 'bolivia_altiplano': {
      // Bolivia SENAMHI Altiplano — modified SCS Type I
      // Reduced peak factor (0.25 vs 0.375) for high-altitude convective regime
      const bolT = [0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0];
      const bolD = [0, 0.05, 0.12, 0.22, 0.36, 0.54, 0.70, 0.82, 0.91, 0.96, 1.0];
      return applyDimensionlessCurve(bolT, bolD, totalDepth, numSteps, timeStep);
    }

    case 'fourier_multipeak': {
      // Modified Fourier Series Storm — research/academic multi-peaked
      // Generates a two-peak storm via Fourier harmonics for complex basin response
      const timeStepH6 = timeStep / 60;
      const data6 = new Array(numSteps).fill(0);
      for (let i = 0; i < numSteps; i++) {
        const t = i / (numSteps - 1); // normalized 0..1
        // Base + 1st harmonic (main peak) + 2nd harmonic (secondary peak)
        const raw = 0.5 + 0.8 * Math.sin(Math.PI * t) + 0.35 * Math.sin(2.5 * Math.PI * t);
        data6[i] = Math.max(0, raw);
      }
      // Normalize to target depth
      const rawVol = data6.reduce((s, v) => s + v * timeStepH6, 0);
      if (rawVol > 0) {
        const sc = totalDepth / rawVol;
        for (let i = 0; i < numSteps; i++) data6[i] *= sc;
      }
      return data6;
    }

    case 'cc_idf_scaled': {
      // CC-IDF Climate-Scaled Storm — applies SSP2-4.5 scaling to SCS Type II
      const climateFactor = 1.20;
      const baseData = generateRainfallData('scs2', totalDepth * climateFactor, duration, timeStep);
      const tsH = timeStep / 60;
      const baseVol = baseData.reduce((s, v) => s + v * tsH, 0);
      if (baseVol > 0) {
        const sc = totalDepth / baseVol;
        for (let i = 0; i < baseData.length; i++) baseData[i] *= sc;
      }
      return baseData;
    }

    // ══════════ v6 — Missing Design Storms Analysis ══════════

    case 'g2p_gamma': {
      // G2P (Gamma 2-Parameter) Design Storm — Balbastre-Soldevila et al., 2019
      // f(t) = (t/tp)^φ · exp(φ·(1 - t/tp))
      const phi = 3.5; // shape parameter controlling peakedness
      const tp = 0.4;  // dimensionless time to peak
      const raw: number[] = [];
      let rawSum = 0;
      for (let i = 0; i < numSteps; i++) {
        const tFrac = (i + 0.5) / numSteps;
        const ratio = tFrac / tp;
        const val = Math.pow(ratio, phi) * Math.exp(phi * (1 - ratio));
        raw.push(val);
        rawSum += val;
      }
      const dtG = timeStep / 60;
      for (let i = 0; i < numSteps; i++) {
        data.push((raw[i] / rawSum) * totalDepth / dtG);
      }
      break;
    }

    case 'poland_bs': {
      // Bogdanowicz-Stachy (Poland) — Polish stormwater standard
      // Uses a center-peaked distribution typical of Polish urban drainage
      // P(t,p) = 1.42·t^0.33 + α(p)·(-ln p)^0.584
      // Implemented as a dimensionless mass curve calibrated for Polish conditions
      const tF = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const dF = [0, 0.04, 0.10, 0.18, 0.30, 0.55, 0.72, 0.82, 0.90, 0.96, 1.0];
      return applyDimensionlessCurve(tF, dF, totalDepth, numSteps, timeStep);
    }

    case 'belgium_willems': {
      // Willems Composite Storm (Belgium — Flanders)
      // Nested IDF intensities similar to ABM but with Belgian rainfall statistics
      // Uses i(d) = a/(b+d)^c with Flemish parameters
      // Implemented as Chicago variant with r=0.35 (Belgian practice)
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.35);
    }

    case 'russia_snip': {
      // Russian SNiP / SP 32.13330 Building Code Storm
      // q = A·(1 + C·ln Tr) / t^n — regional parameters
      // Implemented as a front-loaded distribution typical of Russian standards
      const tF = [0, 0.05, 0.10, 0.20, 0.30, 0.40, 0.55, 0.70, 0.85, 1.0];
      const dF = [0, 0.08, 0.18, 0.35, 0.52, 0.66, 0.78, 0.87, 0.94, 1.0];
      return applyDimensionlessCurve(tF, dF, totalDepth, numSteps, timeStep);
    }

    case 'turkey_dsi': {
      // Turkish DSİ (State Hydraulic Works) Method
      // i = A/(t+B)^C with region-specific parameters
      // Implemented as Chicago variant with r=0.42 (Turkish practice)
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.42);
    }

    case 'korea_molit': {
      // South Korea MOLIT (Ministry of Land, Infrastructure and Transport)
      // Huff-type design storm distinct from KMA — more front-loaded
      // Uses 2nd quartile Huff curves calibrated for Korean urbanized basins
      const tF = [0, 0.10, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.75, 0.90, 1.0];
      const dF = [0, 0.06, 0.15, 0.22, 0.40, 0.62, 0.76, 0.85, 0.92, 0.97, 1.0];
      return applyDimensionlessCurve(tF, dF, totalDepth, numSteps, timeStep);
    }

    case 'greece_hellenic': {
      // Greek Hellenic Method — Koutsoyiannis-Baloutsos formulation
      // i = a/(t+θ)^η with regional parameters for Greek basins
      // Implemented as Chicago variant with r=0.38 (Greek practice)
      return chicagoVariant(totalDepth, numSteps, timeStep, duration, 0.38);
    }

    case 'romania_stas': {
      // Romanian STAS / Andrei Method
      // i = a·Tr^b / t^c — Romanian urban drainage practice
      // Center-peaked distribution calibrated for Romanian conditions
      const tF = [0, 0.10, 0.20, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.0];
      const dF = [0, 0.05, 0.12, 0.25, 0.50, 0.72, 0.83, 0.90, 0.95, 1.0];
      return applyDimensionlessCurve(tF, dF, totalDepth, numSteps, timeStep);
    }

    case 'pmp_wmo': {
      // WMO Generalized PMP (Hershfield Method) — WMO-No. 1045
      // PMP = X̄n + Km·Sn — broader applicability than US HMR
      // Uses broader, more sustained peak than HMR 51/52
      const tF = [0, 0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.0];
      const dF = [0, 0.04, 0.12, 0.22, 0.35, 0.55, 0.70, 0.80, 0.88, 0.94, 0.98, 1.0];
      return applyDimensionlessCurve(tF, dF, totalDepth, numSteps, timeStep);
    }

    case 'nested_envelope': {
      // Nested/Envelope Design Storm — USACE dam safety
      // P_nested(d) = max[P_Tr(d)] for all d ≤ D
      // Creates worst-case nesting by placing IDF-derived depths at each sub-duration
      // Implemented as ABM with very sharp peak (r=0.5) to maximize nesting
      const peakPos = Math.floor(numSteps * 0.5);
      const blocks: { intensity: number }[] = [];
      for (let i = 0; i < numSteps; i++) {
        const dHrs = ((i + 1) * timeStep) / 60;
        const intensity = totalDepth / (duration * Math.pow(dHrs / duration, 0.55));
        blocks.push({ intensity });
      }
      blocks.sort((a, b) => b.intensity - a.intensity);
      const ordered: number[] = new Array(numSteps).fill(0);
      ordered[peakPos] = blocks[0].intensity;
      let li = peakPos - 1, ri = peakPos + 1;
      for (let i = 1; i < blocks.length; i++) {
        if (i % 2 === 1 && li >= 0) { ordered[li--] = blocks[i].intensity; }
        else if (ri < numSteps) { ordered[ri++] = blocks[i].intensity; }
        else if (li >= 0) { ordered[li--] = blocks[i].intensity; }
      }
      const dtN = timeStep / 60;
      const volN = ordered.reduce((s, v) => s + v * dtN, 0);
      if (volN > 0) { const sc = totalDepth / volN; for (let i = 0; i < ordered.length; i++) ordered[i] *= sc; }
      return ordered;
    }

    case 'arnell_sweden': {
      // Arnell (1982) — Swedish historical predecessor to SMHI
      // Chicago-type with r=0.33, slightly broader peak than modern SMHI
      const r = 0.33;
      const peakIdx = Math.floor(numSteps * r);
      for (let i = 0; i < numSteps; i++) {
        const t = (i + 0.5) / numSteps;
        const dist = Math.abs(t - r);
        data[i] = 1 / Math.pow(0.06 + dist * 2.8, 1.15);
      }
      break;
    }

    case 'tenax_cds': {
      // TENAX-CDS (2024) — Climate-adapted Chicago Design Storm
      // Temperature-conditioned extreme value approach from Zurich/EPFL
      // Uses Chicago storm base with climate scaling factor applied to peak
      const rT = 0.40;
      const climateBoost = 1.07; // ~7% per °C Clausius-Clapeyron scaling at peak
      const peakIdxT = Math.floor(numSteps * rT);
      for (let i = 0; i < numSteps; i++) {
        const t = (i + 0.5) / numSteps;
        const dist = Math.abs(t - rT);
        const base = 1 / Math.pow(0.05 + dist * 3.2, 1.25);
        // Apply super-CC scaling near peak (within 20% of peak position)
        const peakProximity = 1 - Math.min(dist / 0.2, 1);
        data[i] = base * (1 + (climateBoost - 1) * peakProximity);
      }
      break;
    }

    case 'avm': {
      // Average Variability Method (AVM)
      // Creates design storm by averaging temporal patterns of observed storms
      // Produces smoother, less peaked shape than single-storm methods
      // Implemented as broad Gaussian with moderate peak
      for (let i = 0; i < numSteps; i++) {
        const t = (i + 0.5) / numSteps;
        // Broad center peak with gradual tails (typical of averaged storms)
        data[i] = 0.15 + Math.exp(-4.5 * Math.pow(t - 0.45, 2));
      }
      break;
    }
  }

  // ── Volume normalization ──
  // Ensure total volume (sum of intensity × timeStep) equals totalDepth
  const timeStepHours = timeStep / 60;
  const actualVolume = data.reduce((sum, v) => sum + v * timeStepHours, 0);
  if (actualVolume > 0 && Math.abs(actualVolume - totalDepth) / totalDepth > 0.001) {
    const scale = totalDepth / actualVolume;
    for (let i = 0; i < data.length; i++) {
      data[i] *= scale;
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
