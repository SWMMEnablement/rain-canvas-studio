import { type PatternType } from './rainfallPatterns';

export interface PatternEquation {
  pattern: PatternType;
  name: string;
  category: 'cumulative' | 'intensity' | 'empirical';
  equations: {
    label: string;
    latex: string;
    description: string;
  }[];
  variables: {
    symbol: string;
    meaning: string;
  }[];
  reference: {
    title: string;
    citation: string;
    year: number;
    link?: string;
  };
  notes?: string;
}

export const patternEquations: PatternEquation[] = [
  // ============ Block Pattern ============
  {
    pattern: 'block',
    name: 'Block (Uniform)',
    category: 'intensity',
    equations: [
      {
        label: 'Intensity',
        latex: 'i(t) = \\frac{P}{D}',
        description: 'Constant intensity throughout the storm duration'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' }
    ],
    reference: {
      title: 'Uniform Design Storm',
      citation: 'Standard hydrologic practice',
      year: 1950
    },
    notes: 'Simplest distribution; useful for preliminary calculations and pipe sizing.'
  },

  // ============ SCS Type I ============
  {
    pattern: 'scs1',
    name: 'SCS Type I',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.50 \\cdot \\left(\\frac{t}{0.4}\\right)^{0.8} & t \\leq 0.4 \\\\ 0.50 + 0.35 \\cdot \\frac{t - 0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.85 + 0.15 \\cdot \\frac{t - 0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Piecewise cumulative rainfall fraction (t = fraction of total duration)'
      },
      {
        label: 'Incremental Depth',
        latex: '\\Delta P_i = [F(t_{i+1}) - F(t_i)] \\cdot P',
        description: 'Rainfall depth in each time increment'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction (0 to 1)' },
      { symbol: 't', meaning: 'Dimensionless time (0 to 1)' },
      { symbol: 'P', meaning: 'Total 24-hour precipitation depth' },
      { symbol: '\\Delta P_i', meaning: 'Incremental precipitation in interval i' }
    ],
    reference: {
      title: 'TR-55: Urban Hydrology for Small Watersheds',
      citation: 'USDA NRCS (SCS), Technical Release 55',
      year: 1986,
      link: 'https://www.nrcs.usda.gov/wps/portal/nrcs/detailfull/national/water/manage/hydrology/?cid=stelprdb1042925'
    },
    notes: 'Pacific maritime climate (wet winters, dry summers). Peak at ~40% of duration.'
  },

  // ============ SCS Type IA ============
  {
    pattern: 'scs1a',
    name: 'SCS Type IA',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.55 \\cdot \\left(\\frac{t}{0.35}\\right)^{0.75} & t \\leq 0.35 \\\\ 0.55 + 0.30 \\cdot \\frac{t - 0.35}{0.2} & 0.35 < t \\leq 0.55 \\\\ 0.85 + 0.15 \\cdot \\frac{t - 0.55}{0.45} & t > 0.55 \\end{cases}',
        description: 'Earlier and more intense peak than Type I'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'TR-55: Urban Hydrology for Small Watersheds',
      citation: 'USDA NRCS (SCS), Technical Release 55',
      year: 1986,
      link: 'https://www.nrcs.usda.gov/wps/portal/nrcs/detailfull/national/water/manage/hydrology/?cid=stelprdb1042925'
    },
    notes: 'Pacific Northwest coastal areas. Very early peak at ~35% of duration.'
  },

  // ============ SCS Type II ============
  {
    pattern: 'scs2',
    name: 'SCS Type II',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.35 \\cdot \\left(\\frac{t}{0.5}\\right)^{0.9} & t \\leq 0.5 \\\\ 0.35 + 0.45 \\cdot \\frac{t - 0.5}{0.1} & 0.5 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t - 0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Standard US distribution with mid-storm peak'
      },
      {
        label: 'Peak Intensity Ratio',
        latex: 'i_{peak} \\approx 4.8 \\cdot \\bar{i}',
        description: 'Peak is approximately 4.8 times the average intensity'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 'i_{peak}', meaning: 'Peak rainfall intensity' },
      { symbol: '\\bar{i}', meaning: 'Average rainfall intensity (P/D)' }
    ],
    reference: {
      title: 'TR-55: Urban Hydrology for Small Watersheds',
      citation: 'USDA NRCS (SCS), Technical Release 55',
      year: 1986,
      link: 'https://www.nrcs.usda.gov/wps/portal/nrcs/detailfull/national/water/manage/hydrology/?cid=stelprdb1042925'
    },
    notes: 'Most common US distribution. Covers ~95% of the continental US. Peak at 50% of duration.'
  },

  // ============ SCS Type III ============
  {
    pattern: 'scs3',
    name: 'SCS Type III',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.25 \\cdot \\frac{t}{0.5} & t \\leq 0.5 \\\\ 0.25 + 0.50 \\cdot \\frac{t - 0.5}{0.08} & 0.5 < t \\leq 0.58 \\\\ 0.75 + 0.25 \\cdot \\frac{t - 0.58}{0.42} & t > 0.58 \\end{cases}',
        description: 'Very sharp peak representing tropical storm characteristics'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'TR-55: Urban Hydrology for Small Watersheds',
      citation: 'USDA NRCS (SCS), Technical Release 55',
      year: 1986,
      link: 'https://www.nrcs.usda.gov/wps/portal/nrcs/detailfull/national/water/manage/hydrology/?cid=stelprdb1042925'
    },
    notes: 'Gulf Coast and tropical areas. Sharp mid-storm peak (50-58% of duration).'
  },

  // ============ Triangular ============
  {
    pattern: 'triangular',
    name: 'Triangular',
    category: 'intensity',
    equations: [
      {
        label: 'Intensity (Rising Limb)',
        latex: 'i(t) = i_{peak} \\cdot \\frac{t}{t_p}, \\quad t \\leq t_p',
        description: 'Linear rise to peak'
      },
      {
        label: 'Intensity (Falling Limb)',
        latex: 'i(t) = i_{peak} \\cdot \\frac{D - t}{D - t_p}, \\quad t > t_p',
        description: 'Linear recession from peak'
      },
      {
        label: 'Peak Intensity',
        latex: 'i_{peak} = \\frac{2P}{D}',
        description: 'Peak intensity for volume conservation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Intensity at time t' },
      { symbol: 'i_{peak}', meaning: 'Peak intensity' },
      { symbol: 't_p', meaning: 'Time to peak (typically 0.33D in UK)' },
      { symbol: 'D', meaning: 'Total duration' },
      { symbol: 'P', meaning: 'Total depth' }
    ],
    reference: {
      title: 'Flood Studies Report',
      citation: 'Institute of Hydrology, UK',
      year: 1975
    },
    notes: 'Common in UK practice. Peak typically at 1/3 of duration.'
  },

  // ============ Trapezoidal ============
  {
    pattern: 'trapezoidal',
    name: 'Trapezoidal',
    category: 'intensity',
    equations: [
      {
        label: 'Intensity',
        latex: 'i(t) = \\begin{cases} i_{peak} \\cdot \\frac{t}{t_1} & t \\leq t_1 \\\\ i_{peak} & t_1 < t \\leq t_2 \\\\ i_{peak} \\cdot \\frac{D-t}{D-t_2} & t > t_2 \\end{cases}',
        description: 'Rising limb, sustained peak, falling limb'
      },
      {
        label: 'Peak Intensity',
        latex: 'i_{peak} = \\frac{P}{\\frac{t_1}{2} + (t_2-t_1) + \\frac{D-t_2}{2}}',
        description: 'Peak intensity for volume conservation'
      }
    ],
    variables: [
      { symbol: 't_1', meaning: 'End of rising limb (typically 0.25D)' },
      { symbol: 't_2', meaning: 'Start of falling limb (typically 0.6D)' },
      { symbol: 'i_{peak}', meaning: 'Sustained peak intensity' }
    ],
    reference: {
      title: 'InfoWorks ICM Technical Review',
      citation: 'Innovyze (now Autodesk)',
      year: 2015
    },
    notes: 'Useful when sustained peak intensity is expected or for conservative design.'
  },

  // ============ FSR ============
  {
    pattern: 'fsr',
    name: 'FSR Profile',
    category: 'cumulative',
    equations: [
      {
        label: 'Summer Profile (75%)',
        latex: 'F(t) = \\sum_{k=1}^{5} a_k \\cdot H(t - t_k) \\cdot \\frac{t - t_k}{\\Delta t_k}',
        description: 'Piecewise linear cumulative distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative fraction' },
      { symbol: 'a_k', meaning: 'Segment slopes: [0.05, 0.15, 0.40, 0.25, 0.15]' },
      { symbol: 't_k', meaning: 'Breakpoints: [0.1, 0.3, 0.5, 0.7, 1.0]' },
      { symbol: 'H(x)', meaning: 'Heaviside step function' }
    ],
    reference: {
      title: 'Flood Studies Report',
      citation: 'Natural Environment Research Council (NERC), UK',
      year: 1975,
      link: 'https://webarchive.nationalarchives.gov.uk/ukgwa/20160107162634/http://www.ceh.ac.uk/products/publications/fsr.html'
    },
    notes: 'Standard UK design storm. 75% summer profile is most commonly used.'
  },

  // ============ Chicago Storm ============
  {
    pattern: 'chicago',
    name: 'Chicago Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Before Peak (t < tb)',
        latex: 'i(t) = \\frac{a \\left[\\frac{(1-c) \\cdot t_b}{r} + b\\right]}{\\left(\\frac{t_b}{r} + b\\right)^{1+c}}',
        description: 'Rising limb derived from IDF curve'
      },
      {
        label: 'After Peak (t > tb)',
        latex: 'i(t) = \\frac{a \\left[\\frac{(1-c) \\cdot t_a}{1-r} + b\\right]}{\\left(\\frac{t_a}{1-r} + b\\right)^{1+c}}',
        description: 'Falling limb derived from IDF curve'
      },
      {
        label: 'IDF Relationship',
        latex: 'i = \\frac{a}{(d + b)^c}',
        description: 'Underlying IDF curve parameters'
      }
    ],
    variables: [
      { symbol: 'r', meaning: 'Advancement coefficient (typically 0.3–0.5)' },
      { symbol: 't_b', meaning: 'Time before peak (= t_p - t)' },
      { symbol: 't_a', meaning: 'Time after peak (= t - t_p)' },
      { symbol: 'a, b, c', meaning: 'Regional IDF curve coefficients' }
    ],
    reference: {
      title: 'A Method for Estimating Volume and Rate of Runoff in Small Urban Watersheds',
      citation: 'Keifer & Chu, ASCE',
      year: 1957
    },
    notes: 'Alternating block method. Creates nested storm from IDF curve. r=0.4 is common.'
  },

  // ============ Huff Quartiles ============
  {
    pattern: 'huff1',
    name: 'Huff 1st Quartile',
    category: 'cumulative',
    equations: [
      {
        label: 'Median Curve',
        latex: 'F(t) = \\begin{cases} 0.65 \\cdot \\left(\\frac{t}{0.25}\\right)^{0.7} & t \\leq 0.25 \\\\ 0.65 + 0.20 \\cdot \\frac{t-0.25}{0.25} & 0.25 < t \\leq 0.50 \\\\ 0.85 + 0.10 \\cdot \\frac{t-0.50}{0.25} & 0.50 < t \\leq 0.75 \\\\ 0.95 + 0.05 \\cdot \\frac{t-0.75}{0.25} & t > 0.75 \\end{cases}',
        description: '65% of rainfall in first quartile'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Time Distribution of Rainfall in Heavy Storms',
      citation: 'Huff, F.A., Water Resources Research',
      year: 1967,
      link: 'https://doi.org/10.1029/WR003i004p01007'
    },
    notes: 'Short-duration convective storms (<6 hr). Peak in first 25%.'
  },

  {
    pattern: 'huff2',
    name: 'Huff 2nd Quartile',
    category: 'cumulative',
    equations: [
      {
        label: 'Median Curve',
        latex: 'F(t) = \\begin{cases} 0.20 \\cdot \\frac{t}{0.25} & t \\leq 0.25 \\\\ 0.20 + 0.50 \\cdot \\left(\\frac{t-0.25}{0.25}\\right)^{0.7} & 0.25 < t \\leq 0.50 \\\\ 0.70 + 0.20 \\cdot \\frac{t-0.50}{0.25} & 0.50 < t \\leq 0.75 \\\\ 0.90 + 0.10 \\cdot \\frac{t-0.75}{0.25} & t > 0.75 \\end{cases}',
        description: 'Peak intensity in second quartile (25-50% of duration)'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Time Distribution of Rainfall in Heavy Storms',
      citation: 'Huff, F.A., Water Resources Research',
      year: 1967,
      link: 'https://doi.org/10.1029/WR003i004p01007'
    },
    notes: 'Most common for frontal storms. Good for medium-duration events.'
  },

  {
    pattern: 'huff3',
    name: 'Huff 3rd Quartile',
    category: 'cumulative',
    equations: [
      {
        label: 'Median Curve',
        latex: 'F(t) = \\begin{cases} 0.15 \\cdot \\frac{t}{0.25} & t \\leq 0.25 \\\\ 0.15 + 0.20 \\cdot \\frac{t-0.25}{0.25} & 0.25 < t \\leq 0.50 \\\\ 0.35 + 0.45 \\cdot \\left(\\frac{t-0.50}{0.25}\\right)^{0.7} & 0.50 < t \\leq 0.75 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.75}{0.25} & t > 0.75 \\end{cases}',
        description: 'Peak intensity in third quartile (50-75% of duration)'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Time Distribution of Rainfall in Heavy Storms',
      citation: 'Huff, F.A., Water Resources Research',
      year: 1967,
      link: 'https://doi.org/10.1029/WR003i004p01007'
    },
    notes: 'Late-developing storms. Common for longer-duration events.'
  },

  {
    pattern: 'huff4',
    name: 'Huff 4th Quartile',
    category: 'cumulative',
    equations: [
      {
        label: 'Median Curve',
        latex: 'F(t) = \\begin{cases} 0.10 \\cdot \\frac{t}{0.25} & t \\leq 0.25 \\\\ 0.10 + 0.15 \\cdot \\frac{t-0.25}{0.25} & 0.25 < t \\leq 0.50 \\\\ 0.25 + 0.15 \\cdot \\frac{t-0.50}{0.25} & 0.50 < t \\leq 0.75 \\\\ 0.40 + 0.60 \\cdot \\left(\\frac{t-0.75}{0.25}\\right)^{0.7} & t > 0.75 \\end{cases}',
        description: 'Peak intensity in final quartile (75-100% of duration)'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Time Distribution of Rainfall in Heavy Storms',
      citation: 'Huff, F.A., Water Resources Research',
      year: 1967,
      link: 'https://doi.org/10.1029/WR003i004p01007'
    },
    notes: 'Extended build-up storms. Less common but important for some regions.'
  },

  // ============ Double Peak ============
  {
    pattern: 'double',
    name: 'Double Peak',
    category: 'intensity',
    equations: [
      {
        label: 'Dual Gaussian',
        latex: 'i(t) = \\frac{P}{D} \\cdot \\alpha \\left[ A_1 e^{-\\left(\\frac{t-\\mu_1}{\\sigma}\\right)^2} + A_2 e^{-\\left(\\frac{t-\\mu_2}{\\sigma}\\right)^2} \\right]',
        description: 'Superposition of two Gaussian peaks'
      }
    ],
    variables: [
      { symbol: '\\mu_1, \\mu_2', meaning: 'Peak positions (0.3D and 0.7D typical)' },
      { symbol: 'A_1, A_2', meaning: 'Relative peak amplitudes (2.5 and 2.0)' },
      { symbol: '\\sigma', meaning: 'Peak width (0.08D typical)' },
      { symbol: '\\alpha', meaning: 'Normalization factor for volume' }
    ],
    reference: {
      title: 'Complex Storm Modeling',
      citation: 'Various urban hydrology texts',
      year: 1990
    },
    notes: 'Represents multi-cell convective systems or frontal passage with embedded cells.'
  },

  // ============ Desbordes ============
  {
    pattern: 'desbordes',
    name: 'Desbordes',
    category: 'intensity',
    equations: [
      {
        label: 'Double Triangle',
        latex: 'i(t) = \\begin{cases} i_1 \\cdot \\frac{t}{t_1} & t \\leq t_1 \\\\ i_1 \\cdot \\frac{t_v - t}{t_v - t_1} & t_1 < t \\leq t_v \\\\ i_2 \\cdot \\frac{t - t_v}{t_2 - t_v} & t_v < t \\leq t_2 \\\\ i_2 \\cdot \\frac{D - t}{D - t_2} & t > t_2 \\end{cases}',
        description: 'Two triangular peaks with valley between'
      }
    ],
    variables: [
      { symbol: 't_1', meaning: 'First peak position (0.3D)' },
      { symbol: 't_v', meaning: 'Valley position (0.5D)' },
      { symbol: 't_2', meaning: 'Second peak position (0.7D)' },
      { symbol: 'i_1, i_2', meaning: 'Peak intensities' }
    ],
    reference: {
      title: 'Réseaux d\'assainissement',
      citation: 'Desbordes, M., Laboratoire d\'Hydrologie Mathématique',
      year: 1974
    },
    notes: 'French standard. Used with Caquot method for urban drainage design.'
  },

  // ============ German DWA ============
  {
    pattern: 'dwa',
    name: 'German DWA-A 531',
    category: 'cumulative',
    equations: [
      {
        label: 'Euler Type II',
        latex: 'F(t) = \\sum_{k=1}^{6} \\Delta F_k \\cdot H(t - t_k)',
        description: 'Stepwise cumulative distribution with central peak'
      },
      {
        label: 'Increments',
        latex: '\\Delta F = [0.09, 0.11, 0.38, 0.23, 0.11, 0.08]',
        description: 'Rainfall fraction in each segment'
      }
    ],
    variables: [
      { symbol: 't_k', meaning: 'Breakpoints at [0.25, 0.375, 0.5, 0.625, 0.75, 1.0]' },
      { symbol: '\\Delta F_k', meaning: 'Incremental fraction per segment' }
    ],
    reference: {
      title: 'DWA-A 531: Starkniederschläge in Abhängigkeit von Wiederkehrzeit und Dauer',
      citation: 'Deutsche Vereinigung für Wasserwirtschaft',
      year: 2012,
      link: 'https://www.dwa.de'
    },
    notes: 'German standard for urban drainage. Euler Type II is most common.'
  },

  // ============ Dutch NEERSLAG ============
  {
    pattern: 'dutch',
    name: 'Dutch NEERSLAG/STOWA',
    category: 'intensity',
    equations: [
      {
        label: 'Asymmetric Profile',
        latex: 'i(t) = \\begin{cases} i_{peak} \\cdot \\left(\\frac{t}{t_p}\\right)^{0.8} & t \\leq t_p \\\\ i_{peak} \\cdot e^{-1.5 \\cdot \\frac{t-t_p}{D-t_p}} & t > t_p \\end{cases}',
        description: 'Power-law rise with exponential decay'
      }
    ],
    variables: [
      { symbol: 't_p', meaning: 'Time to peak (0.35D)' },
      { symbol: 'i_{peak}', meaning: 'Peak intensity (2.5P/D)' }
    ],
    reference: {
      title: 'Stichting Toegepast Onderzoek Waterbeheer (STOWA)',
      citation: 'Dutch Water Authority Guidelines',
      year: 2019,
      link: 'https://www.stowa.nl'
    },
    notes: 'Optimized for low-lying polder regions. Extended recession for drainage.'
  },

  // ============ Italian ============
  {
    pattern: 'italian',
    name: 'Italian Mediterranean',
    category: 'intensity',
    equations: [
      {
        label: 'Gaussian Peak',
        latex: 'i(t) = i_{peak} \\cdot e^{-\\left(\\frac{t - t_p}{\\sigma}\\right)^2}',
        description: 'Sharp Gaussian peak representing convective bursts'
      }
    ],
    variables: [
      { symbol: 't_p', meaning: 'Peak position (0.45D)' },
      { symbol: '\\sigma', meaning: 'Peak width (0.12D)' },
      { symbol: 'i_{peak}', meaning: 'Peak intensity (3.2P/D)' }
    ],
    reference: {
      title: 'Mediterranean Convective Storm Analysis',
      citation: 'Italian Hydrological Society',
      year: 2010
    },
    notes: 'Very sharp peak for intense Mediterranean convection.'
  },

  // ============ Australian ARR ============
  {
    pattern: 'arr',
    name: 'Australian ARR',
    category: 'cumulative',
    equations: [
      {
        label: 'Ensemble Median',
        latex: 'F(t) = \\int_0^t p(\\tau) \\, d\\tau',
        description: 'Cumulative from probabilistic temporal patterns'
      },
      {
        label: 'Implementation',
        latex: 'F(t) \\approx \\text{median of 10 ensemble patterns}',
        description: 'Statistical ensemble approach'
      }
    ],
    variables: [
      { symbol: 'p(\\tau)', meaning: 'Probability-weighted intensity' }
    ],
    reference: {
      title: 'Australian Rainfall and Runoff: A Guide to Flood Estimation',
      citation: 'Geoscience Australia',
      year: 2019,
      link: 'http://arr.ga.gov.au/'
    },
    notes: 'Modern ensemble-based approach. Accounts for storm variability.'
  },

  // ============ Japan JMA ============
  {
    pattern: 'jma',
    name: 'Japan JMA',
    category: 'intensity',
    equations: [
      {
        label: 'Typhoon Profile',
        latex: 'i(t) = \\begin{cases} i_{peak} \\cdot \\left(\\frac{t}{t_p}\\right)^{1.2} & t \\leq t_p \\\\ i_{peak} \\cdot e^{-2.5 \\cdot \\frac{t-t_p}{D-t_p}} & t > t_p \\end{cases}',
        description: 'Power-law rise with steep exponential decay'
      }
    ],
    variables: [
      { symbol: 't_p', meaning: 'Time to peak (0.5D)' },
      { symbol: 'i_{peak}', meaning: 'Peak intensity (2.4P/D)' }
    ],
    reference: {
      title: 'Technical Guidelines for River Design Rainfall',
      citation: 'Japan Meteorological Agency / MLIT',
      year: 2018
    },
    notes: 'Center-peaked for typhoon characteristics. Steep decay after passage.'
  },

  // ============ China Design Storm ============
  {
    pattern: 'china',
    name: 'China Design Storm',
    category: 'intensity',
    equations: [
      {
        label: 'Pillow Shape (枕形)',
        latex: 'i(t) = \\begin{cases} i_{peak} \\cdot \\frac{t}{r \\cdot D} & t \\leq r \\cdot D \\\\ i_{peak} \\cdot \\frac{D - t}{(1-r) \\cdot D} & t > r \\cdot D \\end{cases}',
        description: 'Asymmetric triangular with r = 0.4'
      },
      {
        label: 'Chicago Variant',
        latex: 'i = \\frac{a \\cdot (1 + c \\cdot \\ln T)}{(t + b)^n}',
        description: 'Alternative IDF-based formulation'
      }
    ],
    variables: [
      { symbol: 'r', meaning: 'Peak position ratio (typically 0.4)' },
      { symbol: 'T', meaning: 'Return period (years)' },
      { symbol: 'a, b, c, n', meaning: 'Regional IDF parameters' }
    ],
    reference: {
      title: 'Code for Design of Outdoor Wastewater Engineering (GB 50014)',
      citation: 'Ministry of Housing and Urban-Rural Development, China',
      year: 2021
    },
    notes: 'National standard for urban flood control. Peak at 40% of duration.'
  },

  // ============ South African Huff ============
  {
    pattern: 'sa_huff',
    name: 'South African Huff',
    category: 'cumulative',
    equations: [
      {
        label: 'Modified 2nd Quartile',
        latex: 'F(t) = \\begin{cases} 0.15 \\cdot \\frac{t}{0.2} & t \\leq 0.2 \\\\ 0.15 + 0.55 \\cdot \\left(\\frac{t-0.2}{0.25}\\right)^{0.65} & 0.2 < t \\leq 0.45 \\\\ 0.70 + 0.20 \\cdot \\frac{t-0.45}{0.25} & 0.45 < t \\leq 0.70 \\\\ 0.90 + 0.10 \\cdot \\frac{t-0.70}{0.30} & t > 0.70 \\end{cases}',
        description: 'Earlier and more pronounced peak than standard Huff 2nd'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Design Rainfall and Flood Estimation',
      citation: 'South African National Roads Agency (SANRAL)',
      year: 2013
    },
    notes: 'Calibrated for South African convective storms. Earlier peak than US Huff.'
  },

  // ============ Custom ============
  {
    pattern: 'custom',
    name: 'Custom Pattern',
    category: 'empirical',
    equations: [
      {
        label: 'User-Defined',
        latex: 'i(t) = f(t) \\quad \\text{subject to} \\quad \\int_0^D i(t)\\,dt = P',
        description: 'Any distribution satisfying volume constraint'
      }
    ],
    variables: [
      { symbol: 'f(t)', meaning: 'User-defined intensity function' },
      { symbol: 'P', meaning: 'Total precipitation depth' },
      { symbol: 'D', meaning: 'Storm duration' }
    ],
    reference: {
      title: 'Site-Specific Design',
      citation: 'User-defined based on local data',
      year: 2024
    },
    notes: 'Draw your own distribution based on local data or specific requirements.'
  },

  // ============ Balanced Storm ============
  {
    pattern: 'balanced',
    name: 'Balanced Storm (Alternating Block)',
    category: 'empirical',
    equations: [
      {
        label: 'IDF Relationship',
        latex: 'P(d) = P_{total} \\cdot \\left(\\frac{d}{D}\\right)^{0.6}',
        description: 'Cumulative depth from simplified IDF curve'
      },
      {
        label: 'Incremental Depth',
        latex: '\\Delta P_i = P(d_{i+1}) - P(d_i)',
        description: 'Rainfall depth in each interval from IDF'
      },
      {
        label: 'Block Arrangement',
        latex: '\\text{Sort } \\Delta P_i \\text{ descending, alternate L-R around center}',
        description: 'Blocks placed symmetrically around peak'
      }
    ],
    variables: [
      { symbol: 'P(d)', meaning: 'Cumulative depth for duration d' },
      { symbol: 'P_{total}', meaning: 'Total storm depth' },
      { symbol: 'D', meaning: 'Total storm duration' },
      { symbol: '\\Delta P_i', meaning: 'Incremental depth for interval i' }
    ],
    reference: {
      title: 'Applied Hydrology',
      citation: 'Chow, V.T., Maidment, D.R., & Mays, L.W.',
      year: 1988,
      link: 'https://www.mheducation.com/highered/product/applied-hydrology-chow-maidment/M9780073397269.html'
    },
    notes: 'Theoretically superior to SCS types — uses site-specific IDF data. Standard textbook method. Peak always at center of storm.'
  },

  // ============ FDOT Zone 1 ============
  {
    pattern: 'fdot1',
    name: 'FDOT Zone 1 (NW Florida)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.40 \\cdot \\left(\\frac{t}{0.42}\\right)^{0.85} & t \\leq 0.42 \\\\ 0.40 + 0.38 \\cdot \\frac{t - 0.42}{0.12} & 0.42 < t \\leq 0.54 \\\\ 0.78 + 0.22 \\cdot \\frac{t - 0.54}{0.46} & t > 0.54 \\end{cases}',
        description: 'Modified Type II — slightly front-loaded for NW Florida'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'FDOT Drainage Manual, Chapter 2',
      citation: 'Florida Department of Transportation',
      year: 2021,
      link: 'https://www.fdot.gov/roadway/drainage/manualsandhandbooks.shtm'
    },
    notes: 'Required for all FDOT projects in the panhandle region (Zone 1). Rejects using standard SCS types.'
  },

  // ============ FDOT Zone 2 ============
  {
    pattern: 'fdot2',
    name: 'FDOT Zone 2 (NE Florida)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.38 \\cdot \\left(\\frac{t}{0.45}\\right)^{0.88} & t \\leq 0.45 \\\\ 0.38 + 0.40 \\cdot \\frac{t - 0.45}{0.10} & 0.45 < t \\leq 0.55 \\\\ 0.78 + 0.22 \\cdot \\frac{t - 0.55}{0.45} & t > 0.55 \\end{cases}',
        description: 'Modified Type II for NE Florida'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'FDOT Drainage Manual, Chapter 2',
      citation: 'Florida Department of Transportation',
      year: 2021,
      link: 'https://www.fdot.gov/roadway/drainage/manualsandhandbooks.shtm'
    },
    notes: 'Required for FDOT projects in northeastern Florida (Zone 2).'
  },

  // ============ FDOT Zone 3 ============
  {
    pattern: 'fdot3',
    name: 'FDOT Zone 3 (Central FL)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.30 \\cdot \\left(\\frac{t}{0.35}\\right)^{0.80} & t \\leq 0.35 \\\\ 0.30 + 0.45 \\cdot \\frac{t - 0.35}{0.15} & 0.35 < t \\leq 0.50 \\\\ 0.75 + 0.25 \\cdot \\frac{t - 0.50}{0.50} & t > 0.50 \\end{cases}',
        description: 'Unique tropical distribution for Central FL'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'FDOT Drainage Manual, Chapter 2',
      citation: 'Florida Department of Transportation',
      year: 2021,
      link: 'https://www.fdot.gov/roadway/drainage/manualsandhandbooks.shtm'
    },
    notes: 'Required for FDOT projects in central Florida (Zone 3). Tropical characteristics with earlier peak.'
  },

  // ============ FDOT Zone 4 ============
  {
    pattern: 'fdot4',
    name: 'FDOT Zone 4 (SE Florida)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.35 \\cdot \\left(\\frac{t}{0.25}\\right)^{0.75} & t \\leq 0.25 \\\\ 0.35 + 0.40 \\cdot \\frac{t - 0.25}{0.15} & 0.25 < t \\leq 0.40 \\\\ 0.75 + 0.25 \\cdot \\left(\\frac{t - 0.40}{0.60}\\right)^{0.7} & t > 0.40 \\end{cases}',
        description: 'Heavily front-loaded convective pattern for SE Florida'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'FDOT Drainage Manual, Chapter 2',
      citation: 'Florida Department of Transportation',
      year: 2021,
      link: 'https://www.fdot.gov/roadway/drainage/manualsandhandbooks.shtm'
    },
    notes: 'Required for FDOT projects in SE Florida including Miami-Dade (Zone 4). Most front-loaded of all FL zones.'
  },

  // ============ FDOT Zone 5 ============
  {
    pattern: 'fdot5',
    name: 'FDOT Zone 5 (SW Florida)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.33 \\cdot \\left(\\frac{t}{0.28}\\right)^{0.78} & t \\leq 0.28 \\\\ 0.33 + 0.40 \\cdot \\frac{t - 0.28}{0.14} & 0.28 < t \\leq 0.42 \\\\ 0.73 + 0.27 \\cdot \\left(\\frac{t - 0.42}{0.58}\\right)^{0.7} & t > 0.42 \\end{cases}',
        description: 'Convective pattern for SW Florida, similar to Zone 4'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'FDOT Drainage Manual, Chapter 2',
      citation: 'Florida Department of Transportation',
      year: 2021,
      link: 'https://www.fdot.gov/roadway/drainage/manualsandhandbooks.shtm'
    },
    notes: 'Required for FDOT projects in SW Florida (Zone 5). Slightly less front-loaded than Zone 4.'
  },

  // ============ TxDOT ============
  {
    pattern: 'txdot',
    name: 'TxDOT Empirical',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.20 \\cdot \\left(\\frac{t}{0.30}\\right)^{0.9} & t \\leq 0.30 \\\\ 0.20 + 0.45 \\cdot \\frac{t - 0.30}{0.15} & 0.30 < t \\leq 0.45 \\\\ 0.65 + 0.20 \\cdot \\frac{t - 0.45}{0.20} & 0.45 < t \\leq 0.65 \\\\ 0.85 + 0.15 \\cdot \\frac{t - 0.65}{0.35} & t > 0.65 \\end{cases}',
        description: 'Empirical distribution from USGS Texas rainfall studies'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'TxDOT Hydraulic Design Manual & USGS SIR 2004-5075',
      citation: 'Texas Department of Transportation / USGS',
      year: 2019,
      link: 'https://www.txdot.gov/business/resources/hydraulic.html'
    },
    notes: 'Required for TxDOT hydraulic design submittals. Broad central peak with moderate front-loading characteristic of Texas storms.'
  },

  // ============ Yen & Chow ============
  {
    pattern: 'yen_chow',
    name: 'Yen & Chow Triangular',
    category: 'intensity',
    equations: [
      {
        label: 'Intensity (Rising)',
        latex: 'i(t) = i_{peak} \\cdot \\frac{t}{r \\cdot D}, \\quad t \\leq r \\cdot D',
        description: 'Linear rise to peak'
      },
      {
        label: 'Intensity (Falling)',
        latex: 'i(t) = i_{peak} \\cdot \\frac{D - t}{(1-r) \\cdot D}, \\quad t > r \\cdot D',
        description: 'Linear recession from peak'
      },
      {
        label: 'Peak Intensity',
        latex: 'i_{peak} = \\frac{2P}{D}',
        description: 'Peak for volume conservation under triangular profile'
      }
    ],
    variables: [
      { symbol: 'r', meaning: 'Time-to-peak ratio (0.375 default, SCS-like advance)' },
      { symbol: 'i_{peak}', meaning: 'Peak intensity' },
      { symbol: 'P', meaning: 'Total precipitation depth' },
      { symbol: 'D', meaning: 'Storm duration' }
    ],
    reference: {
      title: 'Stormwater Runoff on Urban Surfaces',
      citation: 'Yen, B.C. & Chow, V.T., in Urban Stormwater Hydraulics and Hydrology (Ed. B.C. Yen)',
      year: 1980
    },
    notes: 'Simplest non-uniform distribution. r=0.5 (symmetric), r=0.375 (SCS-like), r=0.25 (front-loaded), r=0.75 (back-loaded). Excellent for sensitivity analysis.'
  },

  // ============ NOAA Atlas 14 ============
  {
    pattern: 'noaa_a14',
    name: 'NOAA Atlas 14 Temporal',
    category: 'cumulative',
    equations: [
      {
        label: '50th Percentile Distribution',
        latex: 'F(t) = \\sum_{k=1}^{7} a_k \\cdot H(t - t_k) \\cdot \\frac{t - t_k}{\\Delta t_k}',
        description: 'Piecewise linear cumulative from recording gage data'
      },
      {
        label: 'Increments',
        latex: '\\Delta F = [0.04, 0.10, 0.18, 0.35, 0.18, 0.10, 0.05]',
        description: 'Rainfall fraction in each segment'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't_k', meaning: 'Breakpoints at [0.10, 0.25, 0.40, 0.55, 0.70, 0.85, 1.0]' },
      { symbol: '\\Delta F_k', meaning: 'Incremental fraction per segment' }
    ],
    reference: {
      title: 'NOAA Atlas 14: Precipitation-Frequency Atlas, Volume 10, Chapter 6',
      citation: 'National Oceanic and Atmospheric Administration',
      year: 2018,
      link: 'https://www.weather.gov/owp/hdsc_currentpf'
    },
    notes: 'Derived from actual measured temporal distributions at recording rain gages. Supersedes SCS types where Atlas 14 data exists. Represents the future of design storm specification.'
  },

  // ============ UDFCD Denver ============
  {
    pattern: 'udfcd',
    name: 'UDFCD Denver',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.04 \\cdot \\frac{t}{0.08} & t \\leq 0.08 \\\\ 0.04 + 0.56 \\cdot \\left(\\frac{t-0.08}{0.17}\\right)^{0.75} & 0.08 < t \\leq 0.25 \\\\ 0.60 + 0.25 \\cdot \\frac{t-0.25}{0.25} & 0.25 < t \\leq 0.50 \\\\ 0.85 + 0.15 \\cdot \\frac{t-0.50}{0.50} & t > 0.50 \\end{cases}',
        description: 'Front-loaded distribution with 60% of rainfall in first quarter'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Urban Storm Drainage Criteria Manual, Volume 1',
      citation: 'Urban Drainage and Flood Control District (UDFCD), Denver, CO',
      year: 2016,
      link: 'https://udfcd.org/criteria-manual'
    },
    notes: 'Required for all projects in Denver metropolitan area. Front-loaded pattern characteristic of Rocky Mountain thunderstorms.'
  },

  // ============ USACE SPS ============
  {
    pattern: 'usace_sps',
    name: 'USACE Standard Project Storm',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.08 \\cdot \\frac{t}{0.20} & t \\leq 0.20 \\\\ 0.08 + 0.15 \\cdot \\frac{t-0.20}{0.15} & 0.20 < t \\leq 0.35 \\\\ 0.23 + 0.40 \\cdot \\left(\\frac{t-0.35}{0.15}\\right)^{0.85} & 0.35 < t \\leq 0.50 \\\\ 0.63 + 0.22 \\cdot \\frac{t-0.50}{0.15} & 0.50 < t \\leq 0.65 \\\\ 0.85 + 0.10 \\cdot \\frac{t-0.65}{0.15} & 0.65 < t \\leq 0.80 \\\\ 0.95 + 0.05 \\cdot \\frac{t-0.80}{0.20} & t > 0.80 \\end{cases}',
        description: 'Envelope distribution from severe historical storms'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'EM 1110-2-1411: Standard Project Flood Determinations',
      citation: 'US Army Corps of Engineers',
      year: 1965,
      link: 'https://www.publications.usace.army.mil/'
    },
    notes: 'Used for dam safety and major flood control projects. Represents envelope of severe storms observed across the US.'
  },

  // ============ PMP (HMR 51/52) ============
  {
    pattern: 'pmp_hmr',
    name: 'Probable Maximum Precipitation (HMR 51/52)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.04 \\cdot \\frac{t}{0.10} & t \\leq 0.10 \\\\ 0.04 + 0.08 \\cdot \\frac{t-0.10}{0.10} & 0.10 < t \\leq 0.20 \\\\ 0.12 + 0.13 \\cdot \\frac{t-0.20}{0.10} & 0.20 < t \\leq 0.30 \\\\ 0.25 + 0.30 \\cdot \\left(\\frac{t-0.30}{0.10}\\right)^{0.80} & 0.30 < t \\leq 0.40 \\\\ 0.55 + 0.18 \\cdot \\frac{t-0.40}{0.10} & 0.40 < t \\leq 0.50 \\\\ 0.73 + 0.12 \\cdot \\frac{t-0.50}{0.10} & 0.50 < t \\leq 0.60 \\\\ 0.85 + 0.07 \\cdot \\frac{t-0.60}{0.10} & 0.60 < t \\leq 0.70 \\\\ 0.92 + 0.05 \\cdot \\frac{t-0.70}{0.15} & 0.70 < t \\leq 0.85 \\\\ 0.97 + 0.03 \\cdot \\frac{t-0.85}{0.15} & t > 0.85 \\end{cases}',
        description: 'HMR 51/52 generalized temporal distribution for PMP events'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'HMR 51: Probable Maximum Precipitation Estimates, United States East of the 105th Meridian',
      citation: 'NOAA Hydrometeorological Report No. 51 & 52',
      year: 1978,
      link: 'https://www.weather.gov/owp/hdsc_pmp'
    },
    notes: 'Worst-case meteorological scenario used for dam safety (FERC/NRC) and nuclear facility design. The generalized 6-hour incremental blocks are arranged per the standard HMR alternating block methodology with heaviest block at ~40% of duration. HMR 52 (1982) provides application procedures for specific basins.'
  },

  // ============ FEH (UK) ============
  {
    pattern: 'feh',
    name: 'FEH Temporal Profile',
    category: 'cumulative',
    equations: [
      {
        label: 'Summer Profile',
        latex: 'F(t) = \\begin{cases} 0.06 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.06 + 0.14 \\cdot \\frac{t-0.15}{0.15} & 0.15 < t \\leq 0.30 \\\\ 0.20 + 0.45 \\cdot \\left(\\frac{t-0.30}{0.20}\\right)^{0.85} & 0.30 < t \\leq 0.50 \\\\ 0.65 + 0.22 \\cdot \\frac{t-0.50}{0.20} & 0.50 < t \\leq 0.70 \\\\ 0.87 + 0.13 \\cdot \\frac{t-0.70}{0.30} & t > 0.70 \\end{cases}',
        description: 'Modern UK temporal profile superseding FSR'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Flood Estimation Handbook (FEH)',
      citation: 'Centre for Ecology & Hydrology, UK',
      year: 2013,
      link: 'https://www.ceh.ac.uk/services/flood-estimation-handbook'
    },
    notes: 'Modern successor to FSR. Improved temporal distributions based on updated UK rainfall analysis. Standard for current UK flood estimation.'
  },

  // ============ Euler Type I ============
  {
    pattern: 'euler1',
    name: 'Euler Type I',
    category: 'cumulative',
    equations: [
      {
        label: 'Front-Loaded Distribution',
        latex: 'F(t) = \\begin{cases} 0.42 \\cdot \\left(\\frac{t}{D/6}\\right)^{0.8} & t \\leq D/6 \\\\ 0.42 + 0.23 \\cdot \\frac{t - D/6}{D/6} & D/6 < t \\leq 2D/6 \\\\ 0.65 + 0.15 \\cdot \\frac{t - 2D/6}{D/6} & 2D/6 < t \\leq 3D/6 \\\\ \\text{etc.} & \\end{cases}',
        description: 'Peak intensity in first 1/6 interval — maximum stress design'
      },
      {
        label: 'Increments',
        latex: '\\Delta F = [0.42, 0.23, 0.15, 0.10, 0.06, 0.04]',
        description: 'Rainfall fraction per 1/6 interval (front-loaded)'
      }
    ],
    variables: [
      { symbol: 'D', meaning: 'Total storm duration' },
      { symbol: '\\Delta F', meaning: 'Incremental fraction per 1/6 interval' }
    ],
    reference: {
      title: 'DWA-A 118: Hydraulische Bemessung und Nachweis',
      citation: 'Deutsche Vereinigung für Wasserwirtschaft',
      year: 2006,
      link: 'https://www.dwa.de'
    },
    notes: 'Conservative front-loaded pattern for maximum sewer stress. Peak at start. Used alongside Euler Type II for sensitivity analysis.'
  },

  // ============ Euler Type II ============
  {
    pattern: 'euler2',
    name: 'Euler Type II',
    category: 'cumulative',
    equations: [
      {
        label: 'Center-Front Distribution',
        latex: 'F(t) = \\begin{cases} 0.09 \\cdot \\frac{t}{D/6} & t \\leq D/6 \\\\ 0.09 + 0.42 \\cdot \\left(\\frac{t - D/6}{D/6}\\right)^{0.85} & D/6 < t \\leq 2D/6 \\\\ 0.51 + 0.23 \\cdot \\frac{t - 2D/6}{D/6} & 2D/6 < t \\leq 3D/6 \\\\ \\text{etc.} & \\end{cases}',
        description: 'Peak in second 1/6 interval — standard German design storm'
      },
      {
        label: 'Increments',
        latex: '\\Delta F = [0.09, 0.42, 0.23, 0.13, 0.08, 0.05]',
        description: 'Rainfall fraction per 1/6 interval'
      }
    ],
    variables: [
      { symbol: 'D', meaning: 'Total storm duration' },
      { symbol: '\\Delta F', meaning: 'Incremental fraction per 1/6 interval' }
    ],
    reference: {
      title: 'DWA-A 118: Hydraulische Bemessung und Nachweis',
      citation: 'Deutsche Vereinigung für Wasserwirtschaft',
      year: 2006,
      link: 'https://www.dwa.de'
    },
    notes: 'Standard German design storm. Peak early but not at start. More realistic than Type I for drainage verification.'
  },

  // ============ Double Triangle Desbordes ============
  {
    pattern: 'desbordes_double',
    name: 'Desbordes Double Triangle',
    category: 'intensity',
    equations: [
      {
        label: 'Double Triangle',
        latex: 'i(t) = \\begin{cases} i_1 \\cdot \\frac{t}{t_1} & t \\leq t_1 \\\\ i_1 - (i_1 - i_v) \\cdot \\frac{t - t_1}{t_v - t_1} & t_1 < t \\leq t_v \\\\ i_v + (i_2 - i_v) \\cdot \\frac{t - t_v}{t_2 - t_v} & t_v < t \\leq t_2 \\\\ i_2 \\cdot \\frac{D - t}{D - t_2} & t > t_2 \\end{cases}',
        description: 'Two triangular peaks with explicit valley between them'
      }
    ],
    variables: [
      { symbol: 't_1', meaning: 'First peak time (0.25D)' },
      { symbol: 't_v', meaning: 'Valley time (0.45D)' },
      { symbol: 't_2', meaning: 'Second peak time (0.65D)' },
      { symbol: 'i_1', meaning: 'First peak intensity (2.5P/D)' },
      { symbol: 'i_2', meaning: 'Second peak intensity (2.0P/D)' },
      { symbol: 'i_v', meaning: 'Valley intensity (0.3 × i₁)' }
    ],
    reference: {
      title: 'Réseaux d\'assainissement: Calcul, modélisation, conception',
      citation: 'Desbordes, M., Lavoisier',
      year: 1984
    },
    notes: 'Explicit double-triangle with defined valley. Represents complex multi-cell storms. Used in French and European drainage design.'
  },

  // ============ Canadian CDA ============
  {
    pattern: 'canadian',
    name: 'Canadian CDA/MTO',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.05 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.05 + 0.15 \\cdot \\frac{t-0.15}{0.20} & 0.15 < t \\leq 0.35 \\\\ 0.20 + 0.42 \\cdot \\left(\\frac{t-0.35}{0.15}\\right)^{0.82} & 0.35 < t \\leq 0.50 \\\\ 0.62 + 0.22 \\cdot \\frac{t-0.50}{0.15} & 0.50 < t \\leq 0.65 \\\\ 0.84 + 0.10 \\cdot \\frac{t-0.65}{0.15} & 0.65 < t \\leq 0.80 \\\\ 0.94 + 0.06 \\cdot \\frac{t-0.80}{0.20} & t > 0.80 \\end{cases}',
        description: 'Modified Type II adapted for Canadian climate'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Dam Safety Guidelines',
      citation: 'Canadian Dam Association (CDA)',
      year: 2013,
      link: 'https://www.cda.ca/EN/Publications_Pages/dam-safety-guidelines.aspx'
    },
    notes: 'Broader central peak and extended tails compared to SCS Type II. Accounts for Canadian climatic conditions including snowmelt-rain interactions.'
  },

  // ============ Singapore PUB ============
  {
    pattern: 'singapore_pub',
    name: 'Singapore PUB',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.30 \\cdot \\left(\\frac{t}{0.10}\\right)^{0.65} & t \\leq 0.10 \\\\ 0.30 + 0.42 \\cdot \\left(\\frac{t-0.10}{0.15}\\right)^{0.75} & 0.10 < t \\leq 0.25 \\\\ 0.72 + 0.15 \\cdot \\frac{t-0.25}{0.15} & 0.25 < t \\leq 0.40 \\\\ 0.87 + 0.08 \\cdot \\frac{t-0.40}{0.20} & 0.40 < t \\leq 0.60 \\\\ 0.95 + 0.05 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}',
        description: 'Front-loaded tropical convective distribution (72% in first 25%)'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Code of Practice on Surface Water Drainage',
      citation: 'PUB (Public Utilities Board), Singapore',
      year: 2018,
      link: 'https://www.pub.gov.sg'
    },
    notes: 'Tropical convective events with 70-80% of rain in first 30 minutes. Very high peak intensities (>100 mm/hr). Required for all Singapore drainage design.'
  },

  // ============ China GB 50014 ============
  {
    pattern: 'china_gb50014',
    name: 'China GB 50014-2021',
    category: 'cumulative',
    equations: [
      {
        label: 'Rainstorm Intensity Formula',
        latex: 'i = \\frac{A(1 + C \\log T)}{(t + b)^n}',
        description: 'City-specific intensity formula (500+ cities)'
      },
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.12 \\cdot \\left(\\frac{t}{0.20}\\right)^{0.85} & t \\leq 0.20 \\\\ 0.30 + 0.45 \\cdot \\left(\\frac{t-0.35}{0.10}\\right)^{0.70} & 0.35 < t \\leq 0.45 \\\\ 0.95 + 0.05 \\cdot \\frac{t-0.75}{0.25} & t > 0.75 \\end{cases}',
        description: 'Standardized temporal distribution for urban drainage'
      }
    ],
    variables: [
      { symbol: 'i', meaning: 'Rainfall intensity (mm/min)' },
      { symbol: 'A, C, b, n', meaning: 'City-specific empirical coefficients' },
      { symbol: 'T', meaning: 'Return period (years)' },
      { symbol: 't', meaning: 'Duration (minutes)' }
    ],
    reference: {
      title: 'GB 50014-2021: Code for Design of Outdoor Wastewater Engineering',
      citation: 'Ministry of Housing and Urban-Rural Development, China',
      year: 2021
    },
    notes: 'National standard for all public infrastructure. City-specific coefficients for 500+ cities. Short-duration (1-6hr) with very high peaks.'
  },

  // ============ China PRD ============
  {
    pattern: 'china_prd',
    name: 'China Pearl River Delta',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.25 \\cdot \\left(\\frac{t}{0.15}\\right)^{0.70} & t \\leq 0.15 \\\\ 0.25 + 0.35 \\cdot \\left(\\frac{t-0.15}{0.15}\\right)^{0.75} & 0.15 < t \\leq 0.30 \\\\ 0.60 + 0.18 \\cdot \\frac{t-0.30}{0.20} & 0.30 < t \\leq 0.50 \\\\ 0.90 + 0.10 \\cdot \\frac{t-0.70}{0.30} & t > 0.70 \\end{cases}',
        description: 'Front-loaded typhoon-influenced distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'Pearl River Delta Rainstorm Analysis',
      citation: 'China Meteorological Administration (CMA)',
      year: 2019
    },
    notes: 'Typhoon-influenced with extended tail from outer rain bands. For Guangzhou, Shenzhen, Hong Kong, Macau region.'
  },

  // ============ India IMD ============
  {
    pattern: 'india_imd',
    name: 'India IMD Monsoon',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.08 \\cdot \\frac{t}{0.20} & t \\leq 0.20 \\\\ 0.08 + 0.22 \\cdot \\left(\\frac{t-0.20}{0.20}\\right)^{0.85} & 0.20 < t \\leq 0.40 \\\\ 0.30 + 0.40 \\cdot \\left(\\frac{t-0.40}{0.15}\\right)^{0.75} & 0.40 < t \\leq 0.55 \\\\ 0.96 + 0.04 \\cdot \\frac{t-0.85}{0.15} & t > 0.85 \\end{cases}',
        description: 'Monsoon-characteristic center-peaked distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'Rainfall Atlas of India',
      citation: 'India Meteorological Department (IMD)',
      year: 2020,
      link: 'https://www.imd.gov.in'
    },
    notes: 'Based on 6,000+ raingauges. Center-peaked with gradual build-up. Used for Smart Cities Mission and CWC dam design.'
  },

  // ============ India Coastal ============
  {
    pattern: 'india_coastal',
    name: 'India Coastal Cyclonic',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.10 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.10 + 0.50 \\cdot \\left(\\frac{t-0.15}{0.15}\\right)^{0.65} & 0.15 < t \\leq 0.30 \\\\ 0.60 + 0.22 \\cdot \\frac{t-0.30}{0.15} & 0.30 < t \\leq 0.45 \\\\ 0.92 + 0.08 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}',
        description: 'Very sharp early peak from cyclone eyewall passage'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Cyclonic Storm Design Standards',
      citation: 'Central Water Commission (CWC), India',
      year: 2018
    },
    notes: 'Sharp peak representing cyclone eye passage. For Tamil Nadu, Andhra Pradesh, Odisha, and Kerala coastal infrastructure.'
  },

  // ============ Japan AMeDAS ============
  {
    pattern: 'japan_amedas',
    name: 'Japan AMeDAS Convective',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.05 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.20 + 0.55 \\cdot \\left(\\frac{t-0.35}{0.15}\\right)^{0.65} & 0.35 < t \\leq 0.50 \\\\ 0.90 + 0.10 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}',
        description: 'Short-duration convective with very sharp center peak'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'AMeDAS Rainfall Analysis Guidelines',
      citation: 'Japan Meteorological Agency (JMA)',
      year: 2020,
      link: 'https://www.jma.go.jp'
    },
    notes: 'Based on 1,300 AMeDAS automated stations. Short-duration (30min-3hr) convective events. 55% of rain falls within 15% of duration around the peak.'
  },

  // ============ Japan Baiu ============
  {
    pattern: 'japan_baiu',
    name: 'Japan Baiu (梅雨) Frontal',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.06 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.20 + 0.30 \\cdot \\left(\\frac{t-0.30}{0.15}\\right)^{0.80} & 0.30 < t \\leq 0.45 \\\\ 0.50 + 0.25 \\cdot \\frac{t-0.45}{0.15} & 0.45 < t \\leq 0.60 \\\\ 0.90 + 0.10 \\cdot \\frac{t-0.80}{0.20} & t > 0.80 \\end{cases}',
        description: 'Broader moderate-intensity frontal rain distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' }
    ],
    reference: {
      title: 'Baiu Frontal Rainfall Characteristics',
      citation: 'Japan Society of Civil Engineers (JSCE)',
      year: 2017
    },
    notes: 'Baiu (梅雨/plum rain) season June-July. Extended moderate-intensity frontal precipitation. Used for longer-duration drainage and river basin design.'
  },

  // ============ Japan Typhoon ============
  {
    pattern: 'japan_typhoon',
    name: 'Japan Typhoon',
    category: 'intensity',
    equations: [
      {
        label: 'Dual Rain Band Model',
        latex: 'i(t) = \\frac{P}{D} \\cdot \\alpha \\left[ 1.8 \\, e^{-\\left(\\frac{t-0.25}{0.10}\\right)^2} + 2.8 \\, e^{-\\left(\\frac{t-0.65}{0.08}\\right)^2} + 0.3 \\right]',
        description: 'Outer rain band peak at 0.25D, eyewall peak at 0.65D'
      }
    ],
    variables: [
      { symbol: 'P', meaning: 'Total storm depth' },
      { symbol: 'D', meaning: 'Storm duration' },
      { symbol: '\\alpha', meaning: 'Volume normalization factor (≈0.55)' },
      { symbol: '0.25D', meaning: 'Outer rain band peak position' },
      { symbol: '0.65D', meaning: 'Eyewall rain band peak position' }
    ],
    reference: {
      title: 'Typhoon Flood Control Design Guidelines',
      citation: 'Japan Society of Civil Engineers (JSCE)',
      year: 2019
    },
    notes: 'Double-peak representing outer band and inner eyewall. Used for G-Cans flood control and super-levee design. August-September typhoon season.'
  },

  // ============ Korea KMA ============
  {
    pattern: 'korea_kma',
    name: 'Korea KMA Standard',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.06 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.06 + 0.18 \\cdot \\frac{t-0.15}{0.20} & 0.15 < t \\leq 0.35 \\\\ 0.24 + 0.40 \\cdot \\left(\\frac{t-0.35}{0.15}\\right)^{0.72} & 0.35 < t \\leq 0.50 \\\\ 0.94 + 0.06 \\cdot \\frac{t-0.80}{0.20} & t > 0.80 \\end{cases}',
        description: 'Center-peaked monsoon/convective hybrid distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'Urban Flood Control Design Standards',
      citation: 'Korean Meteorological Administration (KMA) / Ministry of Environment',
      year: 2019,
      link: 'https://www.kma.go.kr'
    },
    notes: 'Center-peaked with moderate asymmetry. Accounts for monsoon + convective mix. Required for Ministry of Environment urban flood control design.'
  },

  // ============ KOSTRA-DWD ============
  {
    pattern: 'kostra_dwd',
    name: 'KOSTRA-DWD (Germany)',
    category: 'empirical',
    equations: [
      {
        label: 'Return Level Equation (DWA-A 531)',
        latex: '\\text{RL}_{\\text{RP}} = u_p + w_p \\cdot \\ln(\\text{RP})',
        description: 'Exponential return level model for design rainfall depths'
      },
      {
        label: 'Plotting Position (Partial Series)',
        latex: '\\text{RP}_k = \\frac{L + 0.2}{k - 0.4} \\cdot M',
        description: 'Return period estimation for ranked extreme values'
      },
      {
        label: 'Euler Type II Peak Placement',
        latex: 't_{peak} = \\frac{D}{3}',
        description: 'Peak 5-min block placed at one-third of storm duration per DWA-A 118'
      }
    ],
    variables: [
      { symbol: '\\text{RL}_{\\text{RP}}', meaning: 'Return level for return period RP (mm)' },
      { symbol: 'u_p, w_p', meaning: 'Offset and slope parameters (fitted per grid cell)' },
      { symbol: '\\text{RP}', meaning: 'Return period (years)' },
      { symbol: 'L', meaning: 'Sample size' },
      { symbol: 'M', meaning: 'Length of time series (years)' },
      { symbol: 'k', meaning: 'Rank index' }
    ],
    reference: {
      title: 'DWA-A 531 / DWA-A 118: KOSTRA-DWD Regionalized Heavy Precipitation',
      citation: 'Deutsche Vereinigung für Wasserwirtschaft / DWD',
      year: 2020,
      link: 'https://www.dwa.de'
    },
    notes: 'KOSTRA-DWD provides regionalized design rainfall for all of Germany on a 5 km² grid. Uses Euler Type II alternating-block method with steeper peak per DWA-A 118 compared to standard Euler II.'
  },

  // ============ Austria ÖKOSTRA ============
  {
    pattern: 'austria_okostra',
    name: 'Austria ÖKOSTRA',
    category: 'empirical',
    equations: [
      {
        label: 'Chicago Variant (Euler Type II)',
        latex: 'i_{before}(t) = \\frac{a\\left[\\frac{(1-c) \\cdot t_b}{r} + b\\right]}{\\left(\\frac{t_b}{r} + b\\right)^{1+c}}, \\quad r = 0.33',
        description: 'Rising limb with Euler II peak position at 1/3 duration'
      },
      {
        label: 'Falling Limb',
        latex: 'i_{after}(t) = \\frac{a\\left[\\frac{(1-c) \\cdot t_a}{1-r} + b\\right]}{\\left(\\frac{t_a}{1-r} + b\\right)^{1+c}}',
        description: 'Recession from peak using Chicago method'
      }
    ],
    variables: [
      { symbol: 'r', meaning: 'Advancement coefficient = 0.33 (peak at 1/3 duration)' },
      { symbol: 't_b', meaning: 'Time before peak' },
      { symbol: 't_a', meaning: 'Time after peak' },
      { symbol: 'a, b, c', meaning: 'Austrian IDF regionalization parameters' }
    ],
    reference: {
      title: 'ÖKOSTRA: Österreichische Koordinierte Starkniederschlagsregionalisierung und -auswertung',
      citation: 'Bundesministerium für Land- und Forstwirtschaft, Austria',
      year: 2018,
      link: 'https://ehyd.gv.at'
    },
    notes: 'Austrian coordinated design rainfall for sewer/drainage design. Uses Euler Type II variant with Austrian IDF regionalization coefficients.'
  },

  // ============ SHYREG (France) ============
  {
    pattern: 'shyreg_fr',
    name: 'SHYREG / Desbordes (France)',
    category: 'intensity',
    equations: [
      {
        label: 'Desbordes Double Triangle',
        latex: 'i_M = \\frac{2P(t_1, T)}{t_1} - i_m, \\quad i_m = \\frac{P(t_3, T) - P(t_1, T)}{t_2}',
        description: 'Peak and base intensities from IDF-derived depths'
      },
      {
        label: 'Montana Formula (IDF)',
        latex: 'i_T(d) = a_T \\cdot d^{-b_T}',
        description: 'Underlying French IDF relationship (Montana coefficients)'
      },
      {
        label: 'LCPC/Desbordes IDF',
        latex: 'i(t, T) = \\frac{a(T)}{(t + b)^{c}}',
        description: 'General French IDF form for intensity estimation'
      }
    ],
    variables: [
      { symbol: 'i_M', meaning: 'Maximum intensity of peak rainfall (mm/h)' },
      { symbol: 'i_m', meaning: 'Maximum intensity before intense period (mm/h)' },
      { symbol: 'P(t, T)', meaning: 'Rainfall depth for duration t and return period T' },
      { symbol: 't_1', meaning: 'Intense period duration' },
      { symbol: 't_2', meaning: 'Half of non-intense period: (t₃ − t₁)/2' },
      { symbol: 't_3', meaning: 'Total storm duration' },
      { symbol: 'a_T, b_T', meaning: 'Montana coefficients for return period T' }
    ],
    reference: {
      title: 'Instruction Technique IT77 / SHYPRE Simulation',
      citation: 'Desbordes & Raous; ORSTOM/Cemagref/IRSTEA',
      year: 1976,
      link: 'https://www.irstea.fr'
    },
    notes: 'SHYREG (Simulation d\'Hydrogrammes de crues par REGionalisation) uses stochastic hourly rainfall generators calibrated to local climatology. The Desbordes double triangle is the standard temporal pattern for French urban drainage per IT77.'
  },

  // ============ FEH22/ReFH2 ============
  {
    pattern: 'feh22_refh2',
    name: 'FEH22 / ReFH2 (UK)',
    category: 'cumulative',
    equations: [
      {
        label: 'Generalized Logistic (GLO) Distribution',
        latex: 'f(x) = \\alpha^{-1} \\exp\\left[-(1-\\kappa)y\\right] \\cdot \\left[1 + \\exp(-y)\\right]^{-2}',
        description: 'Primary frequency distribution for UK rainfall extremes'
      },
      {
        label: 'Quantile Function',
        latex: 'y = -\\kappa^{-1}\\log\\left(1-\\kappa\\frac{x-\\xi}{\\alpha}\\right), \\quad \\kappa \\neq 0',
        description: 'GLO reduced variate for return period estimation'
      },
      {
        label: 'ReFH2 Net Rainfall',
        latex: 'Q = C_v \\cdot C_R \\cdot i \\cdot A',
        description: 'Rainfall-runoff model: volumetric × routing coefficient'
      }
    ],
    variables: [
      { symbol: '\\xi', meaning: 'Location parameter' },
      { symbol: '\\alpha', meaning: 'Scale parameter' },
      { symbol: '\\kappa', meaning: 'Shape parameter' },
      { symbol: 'C_v', meaning: 'Volumetric runoff coefficient' },
      { symbol: 'C_R', meaning: 'Routing coefficient' },
      { symbol: 'A', meaning: 'Catchment area' }
    ],
    reference: {
      title: 'Flood Estimation Handbook (FEH) 2022 Update',
      citation: 'Centre for Ecology & Hydrology (CEH), UK',
      year: 2022,
      link: 'https://fehweb.ceh.ac.uk'
    },
    notes: 'FEH22 supersedes FEH99 with updated DDF models, areal reduction factors, and climate change allowances. GLO distribution is the standard for UK rainfall frequency analysis.'
  },

  // ============ ECCC IDF ============
  {
    pattern: 'eccc_idf',
    name: 'ECCC IDF (Canada)',
    category: 'empirical',
    equations: [
      {
        label: 'CSA W231:25 Climate Scaling',
        latex: 'I_{fut} = I_{ref} \\times (CC_{adj})^{\\Delta T}',
        description: 'Temperature-scaled IDF for climate change adaptation'
      },
      {
        label: 'Default Scaling Factor',
        latex: 'CC_{adj} = 1.07 \\quad \\text{(Clausius-Clapeyron: 7\\%/°C)}',
        description: 'Based on thermodynamic moisture-holding capacity increase'
      },
      {
        label: 'Tabled IDF Form',
        latex: 'i = \\frac{A}{(t_c + B)^C}',
        description: 'Standard ECCC IDF equation with fitted parameters A, B, C'
      }
    ],
    variables: [
      { symbol: 'I_{fut}', meaning: 'Future rainfall intensity (mm/h)' },
      { symbol: 'I_{ref}', meaning: 'Historical reference intensity (mm/h)' },
      { symbol: 'CC_{adj}', meaning: 'Climate change adjustment factor (default 1.07)' },
      { symbol: '\\Delta T', meaning: 'Projected temperature change (°C)' },
      { symbol: 'A, B, C', meaning: 'Station-specific IDF parameters' }
    ],
    reference: {
      title: 'CSA W231:25 / ECCC IDF Curves',
      citation: 'Environment and Climate Change Canada / CSA Group',
      year: 2025,
      link: 'https://climate.weather.gc.ca/prods_servs/engineering_e.html'
    },
    notes: 'CSA W231:25 is Canada\'s new standard requiring climate-change adjusted IDF curves. Uses upper 95% CI for reference intensity and 75th-90th percentile climate model warming for ΔT.'
  },

  // ============ NOAA Atlas 15 ============
  {
    pattern: 'noaa_a15',
    name: 'NOAA Atlas 15',
    category: 'cumulative',
    equations: [
      {
        label: 'Precipitation Frequency Estimate',
        latex: 'P(D, T) = \\hat{P}_D \\cdot K_T',
        description: 'Design depth from mean annual maximum and frequency factor'
      },
      {
        label: 'Temporal Distribution',
        latex: 'F(t) = \\sum_{k} w_k \\cdot F_k(t)',
        description: 'Weighted ensemble of observed temporal patterns'
      }
    ],
    variables: [
      { symbol: 'P(D,T)', meaning: 'Precipitation depth for duration D and return period T' },
      { symbol: '\\hat{P}_D', meaning: 'Mean annual maximum precipitation for duration D' },
      { symbol: 'K_T', meaning: 'Frequency factor for return period T' },
      { symbol: 'w_k', meaning: 'Regional weighting factors' },
      { symbol: 'F_k(t)', meaning: 'Component temporal distributions' }
    ],
    reference: {
      title: 'NOAA Atlas 15: Precipitation-Frequency Atlas of the United States',
      citation: 'NOAA National Weather Service',
      year: 2024,
      link: 'https://www.weather.gov/owp/hdsc_currentpf'
    },
    notes: 'Successor to Atlas 14 with updated precipitation frequency estimates, new temporal distributions, and improved spatial interpolation methods.'
  },

  // ============ Ireland Met Éireann ============
  {
    pattern: 'ireland_met',
    name: 'Ireland Met Éireann',
    category: 'empirical',
    equations: [
      {
        label: 'Irish IDF Equation',
        latex: 'i = \\frac{a}{(t + b)^n}',
        description: 'Sherman-type IDF with Irish regional parameters'
      },
      {
        label: 'Chicago Variant (r = 0.375)',
        latex: 'i_{before}(t) = \\frac{a\\left[\\frac{(1-n) \\cdot t_b}{r} + b\\right]}{\\left(\\frac{t_b}{r} + b\\right)^{1+n}}, \\quad r = 0.375',
        description: 'Keifer-Chu with Irish advancement coefficient'
      }
    ],
    variables: [
      { symbol: 'a, b, n', meaning: 'Irish regional IDF parameters' },
      { symbol: 'r', meaning: 'Advancement coefficient = 0.375' },
      { symbol: 't_b, t_a', meaning: 'Time before/after peak' }
    ],
    reference: {
      title: 'Rainfall Frequency Analysis for Ireland',
      citation: 'Met Éireann / OPW Flood Studies Update',
      year: 2019,
      link: 'https://www.met.ie'
    },
    notes: 'Irish design storms use a Chicago-method variant with r=0.375. Flood Studies Update (FSU) provides updated rainfall frequency analysis for Ireland.'
  },

  // ============ Montana/Caquot (France) ============
  {
    pattern: 'montana_caquot',
    name: 'Montana/Caquot (France)',
    category: 'intensity',
    equations: [
      {
        label: 'Montana Formula',
        latex: 'i_T(d) = a_T \\cdot d^{-b_T}',
        description: 'Power-law IDF relationship (French standard form)'
      },
      {
        label: 'Caquot Rational Method',
        latex: 'Q_T = \\frac{1}{6.6} \\cdot I^{\\frac{1}{(1+0.287b)}} \\cdot C^{\\frac{1}{(1+0.287b)}} \\cdot \\mu^{\\frac{0.84b}{(1+0.287b)}} \\cdot A^{\\frac{1-0.05b}{(1+0.287b)}}',
        description: 'Caquot formula for peak runoff with Montana exponent b'
      }
    ],
    variables: [
      { symbol: 'i_T(d)', meaning: 'Intensity for duration d and return period T (mm/h)' },
      { symbol: 'a_T', meaning: 'Montana coefficient for return period T' },
      { symbol: 'b_T', meaning: 'Montana exponent (typically 0.5–0.8)' },
      { symbol: 'I', meaning: 'Average slope (m/m)' },
      { symbol: 'C', meaning: 'Runoff coefficient' },
      { symbol: '\\mu', meaning: 'Elongation coefficient' },
      { symbol: 'A', meaning: 'Catchment area (ha)' }
    ],
    reference: {
      title: 'Instruction Technique Relative aux Réseaux d\'Assainissement (IT77)',
      citation: 'Circulaire 77-284, Ministère de l\'Équipement, France',
      year: 1977,
      link: 'https://www.cerema.fr'
    },
    notes: 'The Montana formula is the standard French IDF parameterization. The Caquot method extends it to a rational-type runoff equation widely used in French urban drainage design.'
  },

  // ============ AES Canada 30% ============
  {
    pattern: 'aes_30',
    name: 'AES Canada 30%',
    category: 'empirical',
    equations: [
      {
        label: 'Chicago Variant (r = 0.30)',
        latex: 'i_{before}(t) = \\frac{a\\left[\\frac{(1-c)t_b}{0.30} + b\\right]}{\\left(\\frac{t_b}{0.30} + b\\right)^{1+c}}',
        description: 'Keifer-Chu with 30% advancement coefficient (Ontario/ECCC)'
      },
      {
        label: 'AES IDF Base',
        latex: 'i = \\frac{A}{(t_c + B)^C}',
        description: 'Atmospheric Environment Service IDF parameters'
      }
    ],
    variables: [
      { symbol: 'r = 0.30', meaning: 'Peak at 30% of duration (early-peaked)' },
      { symbol: 'A, B, C', meaning: 'ECCC/AES station-specific IDF parameters' }
    ],
    reference: {
      title: 'AES IDF Rainfall Curves',
      citation: 'Environment Canada, Atmospheric Environment Service',
      year: 1990,
      link: 'https://climate.weather.gc.ca'
    },
    notes: 'Used primarily in Ontario and eastern Canada. The 30% distribution represents convective-dominated storms with early peak.'
  },

  // ============ AES Canada 40% ============
  {
    pattern: 'aes_40',
    name: 'AES Canada 40%',
    category: 'empirical',
    equations: [
      {
        label: 'Chicago Variant (r = 0.40)',
        latex: 'i_{before}(t) = \\frac{a\\left[\\frac{(1-c)t_b}{0.40} + b\\right]}{\\left(\\frac{t_b}{0.40} + b\\right)^{1+c}}',
        description: 'Keifer-Chu with 40% advancement coefficient (BC/prairies)'
      }
    ],
    variables: [
      { symbol: 'r = 0.40', meaning: 'Peak at 40% of duration (moderate advancement)' },
      { symbol: 'A, B, C', meaning: 'ECCC/AES station-specific IDF parameters' }
    ],
    reference: {
      title: 'AES IDF Rainfall Curves',
      citation: 'Environment Canada, Atmospheric Environment Service',
      year: 1990,
      link: 'https://climate.weather.gc.ca'
    },
    notes: 'Used in British Columbia and prairie provinces. The 40% distribution is more symmetric than the 30% variant.'
  },

  // ============ ARR 2019 Ensemble ============
  {
    pattern: 'arr2019',
    name: 'ARR 2019 Ensemble (Australia)',
    category: 'cumulative',
    equations: [
      {
        label: 'Ensemble Temporal Pattern',
        latex: 'F_{ens}(t) = \\frac{1}{N} \\sum_{j=1}^{N} F_j(t)',
        description: 'Average of N ensemble member temporal patterns'
      },
      {
        label: 'Areal Reduction Factor',
        latex: 'P_{areal} = \\text{ARF}(D, A) \\cdot P_{point}',
        description: 'Point-to-area depth conversion'
      }
    ],
    variables: [
      { symbol: 'F_{ens}(t)', meaning: 'Ensemble-averaged cumulative distribution' },
      { symbol: 'N', meaning: 'Number of ensemble members (typically 10)' },
      { symbol: 'F_j(t)', meaning: 'Individual temporal pattern from observed storms' },
      { symbol: '\\text{ARF}', meaning: 'Areal Reduction Factor' },
      { symbol: 'A', meaning: 'Catchment area' }
    ],
    reference: {
      title: 'Australian Rainfall and Runoff: A Guide to Flood Estimation (2019)',
      citation: 'Ball et al., Geoscience Australia',
      year: 2019,
      link: 'https://arr.ga.gov.au'
    },
    notes: 'ARR 2019 replaces single design storms with an ensemble of 10 temporal patterns derived from observed storms, run in parallel to capture uncertainty.'
  },

  // ============ ARR87 Legacy ============
  {
    pattern: 'arr87_legacy',
    name: 'ARR87 Legacy (Australia)',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.10 \\cdot \\frac{t}{0.2} & t \\leq 0.2 \\\\ 0.10 + 0.55 \\cdot \\left(\\frac{t-0.20}{0.30}\\right)^{0.8} & 0.20 < t \\leq 0.50 \\\\ 0.65 + 0.35 \\cdot \\frac{t-0.50}{0.50} & t > 0.50 \\end{cases}',
        description: 'Pre-2019 Australian design storm temporal distribution'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Australian Rainfall and Runoff (1987 Edition)',
      citation: 'Institution of Engineers Australia',
      year: 1987,
      link: 'https://arr.ga.gov.au'
    },
    notes: 'Legacy single-pattern design storm superseded by ARR 2019 ensemble approach. Still referenced for comparison with older designs.'
  },

  // ============ M5-60 (UK/Ireland) ============
  {
    pattern: 'm5_60_fsr',
    name: 'M5-60 (UK/Ireland FSR)',
    category: 'empirical',
    equations: [
      {
        label: 'M5-60 Scaling',
        latex: 'P(D, T) = M5_{60} \\cdot r_D \\cdot g_T',
        description: 'Design depth from M5-60 index rainfall, duration ratio, and growth factor'
      },
      {
        label: 'Duration Ratio',
        latex: 'r_D = \\left(\\frac{D}{60}\\right)^{1-b}',
        description: 'Duration scaling relative to 60-minute rainfall'
      }
    ],
    variables: [
      { symbol: 'M5_{60}', meaning: '5-year return period, 60-minute rainfall (mm)' },
      { symbol: 'r_D', meaning: 'Duration ratio for duration D' },
      { symbol: 'g_T', meaning: 'Growth factor for return period T' },
      { symbol: 'b', meaning: 'Duration scaling exponent' }
    ],
    reference: {
      title: 'Flood Studies Report Volume II',
      citation: 'Natural Environment Research Council (NERC), UK',
      year: 1975
    },
    notes: 'M5-60 is the index rainfall used in the FSR method. Maps of M5-60 cover the UK and Ireland. Superseded by FEH DDF model but still referenced.'
  },

  // ============ HK DSD 2018 ============
  {
    pattern: 'hk_dsd_2018',
    name: 'Hong Kong DSD 2018',
    category: 'cumulative',
    equations: [
      {
        label: 'Cumulative Distribution',
        latex: 'F(t) = \\begin{cases} 0.06 \\cdot \\frac{t}{0.15} & t \\leq 0.15 \\\\ 0.06 + 0.55 \\cdot \\left(\\frac{t-0.15}{0.10}\\right)^{0.65} & 0.15 < t \\leq 0.25 \\\\ 0.61 + 0.25 \\cdot \\frac{t-0.25}{0.25} & 0.25 < t \\leq 0.50 \\\\ 0.86 + 0.14 \\cdot \\frac{t-0.50}{0.50} & t > 0.50 \\end{cases}',
        description: 'Early-peaked tropical storm distribution per Stormwater Drainage Manual 5th Edition'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Stormwater Drainage Manual, 5th Edition',
      citation: 'Hong Kong Drainage Services Department (DSD)',
      year: 2018,
      link: 'https://www.dsd.gov.hk'
    },
    notes: 'Peak at 25% of duration reflecting Hong Kong\'s intense subtropical convective rainfall. Required for all drainage design submissions in Hong Kong.'
  },

  // ============ Malaysia HP1 ============
  {
    pattern: 'malaysia_hp1',
    name: 'Malaysia HP1 (MSMA)',
    category: 'empirical',
    equations: [
      {
        label: 'Chicago Variant (r = 0.40)',
        latex: 'i_{before}(t) = \\frac{a\\left[\\frac{(1-c)t_b}{0.40} + b\\right]}{\\left(\\frac{t_b}{0.40} + b\\right)^{1+c}}',
        description: 'Keifer-Chu with Malaysian advancement coefficient'
      },
      {
        label: 'Malaysian IDF',
        latex: 'i = \\frac{\\lambda T^\\kappa}{(d + \\theta)^\\eta}',
        description: 'HP1 IDF equation with return period scaling'
      }
    ],
    variables: [
      { symbol: 'r = 0.40', meaning: 'Peak at 40% of duration' },
      { symbol: '\\lambda, \\kappa, \\theta, \\eta', meaning: 'Regional IDF fitting parameters' },
      { symbol: 'T', meaning: 'Return period (years)' },
      { symbol: 'd', meaning: 'Storm duration (minutes)' }
    ],
    reference: {
      title: 'Hydrological Procedure No.1 (HP1) - Estimation of Design Rainstorm',
      citation: 'Department of Irrigation and Drainage, Malaysia',
      year: 2015,
      link: 'https://www.water.gov.my'
    },
    notes: 'HP1 (2015 revision) is the standard Malaysian design rainfall estimation method. Required for all MSMA (Manual Saliran Mesra Alam) drainage design.'
  },

  // ============ UPM Río de la Plata ============
  {
    pattern: 'upm_plata',
    name: 'UPM Río de la Plata',
    category: 'intensity',
    equations: [
      {
        label: 'Triangular Hyetograph',
        latex: 'i(t) = \\begin{cases} i_{peak} \\cdot \\frac{t}{t_p} & t \\leq t_p \\\\ i_{peak} \\cdot \\frac{D-t}{D-t_p} & t > t_p \\end{cases}',
        description: 'Triangular distribution with early peak for Río de la Plata basin'
      },
      {
        label: 'Peak Position',
        latex: 't_p = 0.30 \\cdot D',
        description: 'Peak at 30% of duration (convective subtropical storms)'
      }
    ],
    variables: [
      { symbol: 'i_{peak}', meaning: 'Peak intensity = 2P/D (triangular)' },
      { symbol: 't_p', meaning: 'Time to peak = 0.30D' },
      { symbol: 'D', meaning: 'Storm duration' }
    ],
    reference: {
      title: 'Diseño Hidrológico Urbano en la Cuenca del Plata',
      citation: 'Universidad Politécnica de Madrid / FICH-UNL',
      year: 2010
    },
    notes: 'Used for urban drainage design in the Río de la Plata basin (Argentina, Uruguay). Early peak reflects convective subtropical storm characteristics.'
  },

  // ============ WMO PMP ============
  {
    pattern: 'pmp_hmr',
    name: 'WMO PMP (HMR 51/52)',
    category: 'empirical',
    equations: [
      {
        label: 'Statistical PMP Estimation',
        latex: '\\text{PMP} = \\bar{X}_n + K_m \\cdot \\sigma_n',
        description: 'Hershfield statistical method for Probable Maximum Precipitation'
      },
      {
        label: 'Frequency Factor',
        latex: 'K_m = \\frac{X_m - \\bar{X}_{n-1}}{\\sigma_{n-1}}',
        description: 'Maximum observed deviation from mean in standard deviation units'
      },
      {
        label: 'Alternative Form',
        latex: '\\text{PMP} = \\bar{X}_n(1 + K_m \\cdot C_v)',
        description: 'Using coefficient of variation'
      }
    ],
    variables: [
      { symbol: '\\text{PMP}', meaning: 'Probable Maximum Precipitation (mm)' },
      { symbol: 'X_m', meaning: 'Maximum observed storm value' },
      { symbol: '\\bar{X}_n', meaning: 'Mean of n annual maxima' },
      { symbol: '\\sigma_n', meaning: 'Standard deviation of annual maxima' },
      { symbol: 'K_m', meaning: 'Hershfield frequency factor (typically 15-20)' },
      { symbol: 'C_v', meaning: 'Coefficient of variation' }
    ],
    reference: {
      title: 'WMO No. 589: Manual on Estimation of PMP / HMR 51 & 52',
      citation: 'World Meteorological Organization / US National Weather Service',
      year: 2009,
      link: 'https://www.wmo.int'
    },
    notes: 'WMO No. 589 provides global guidance on PMP estimation. HMR 51 (east of 105°W) and HMR 52 (west of 105°W) cover the contiguous US.'
  },

  // ══════════ v6 — Missing Design Storms Analysis ══════════

  // ============ G2P Gamma ============
  {
    pattern: 'g2p_gamma',
    name: 'G2P (Gamma 2-Parameter)',
    category: 'intensity',
    equations: [
      {
        label: 'Intensity Function',
        latex: 'f(t) = \\left(\\frac{t}{t_p}\\right)^{\\phi} \\cdot e^{\\phi\\left(1 - \\frac{t}{t_p}\\right)}',
        description: 'Gamma-shaped dimensionless intensity with max = 1 at t = tp'
      },
      {
        label: 'Design Intensity',
        latex: 'i(t) = i_0 \\cdot f(t)',
        description: 'Scaled by maximum rainfall intensity'
      }
    ],
    variables: [
      { symbol: 'i_0', meaning: 'Maximum rainfall intensity' },
      { symbol: 't_p', meaning: 'Time to peak (dimensionless, typically 0.4)' },
      { symbol: '\\phi', meaning: 'Shape parameter controlling peakedness (typically 3–5)' },
      { symbol: 'f(t)', meaning: 'Dimensionless Gamma function (max = 1)' }
    ],
    reference: {
      title: 'Rainfall Temporal Distribution for Urban Drainage Design',
      citation: 'Balbastre-Soldevila, R., García-Bartual, R., Andrés-Doménech, I., MDPI Water',
      year: 2019,
      link: 'https://doi.org/10.3390/w11122611'
    },
    notes: 'Flexible single-parameter control of peakedness. Higher φ → sharper peak. Useful for Mediterranean/semi-arid climates.'
  },

  // ============ Poland Bogdanowicz-Stachy ============
  {
    pattern: 'poland_bs',
    name: 'Poland Bogdanowicz-Stachy',
    category: 'empirical',
    equations: [
      {
        label: 'Rainfall Depth',
        latex: 'P(t, p) = 1.42 \\cdot t^{0.33} + \\alpha(p) \\cdot (-\\ln p)^{0.584}',
        description: 'Polish standard rainfall depth formula'
      }
    ],
    variables: [
      { symbol: 'P(t, p)', meaning: 'Rainfall depth for duration t and probability p (mm)' },
      { symbol: 't', meaning: 'Storm duration (minutes)' },
      { symbol: 'p', meaning: 'Exceedance probability (1/Tr)' },
      { symbol: '\\alpha(p)', meaning: 'Regional coefficient dependent on location' }
    ],
    reference: {
      title: 'Bogdanowicz-Stachy Rainfall Model',
      citation: 'Bogdanowicz, E. & Stachy, J., IMGW Polish Institute of Meteorology',
      year: 1998
    },
    notes: 'Standard for Polish urban stormwater design. Various regional forms exist across voivodeships.'
  },

  // ============ Belgium Willems ============
  {
    pattern: 'belgium_willems',
    name: 'Belgium Willems Composite',
    category: 'empirical',
    equations: [
      {
        label: 'IDF Relationship',
        latex: 'i(d) = \\frac{a}{(b + d)^c}',
        description: 'Belgian IDF curve with Flemish regional parameters'
      },
      {
        label: 'Composite Storm Construction',
        latex: '\\Delta P_i = P(i \\cdot \\Delta t) - P((i-1) \\cdot \\Delta t)',
        description: 'Nested incremental depths from IDF, placed with r ≈ 0.35'
      }
    ],
    variables: [
      { symbol: 'a, b, c', meaning: 'Flemish regional IDF parameters' },
      { symbol: 'd', meaning: 'Rainfall duration' },
      { symbol: '\\Delta P_i', meaning: 'Incremental depth for interval i' },
      { symbol: 'r', meaning: 'Advancement ratio (~0.35 for Flanders)' }
    ],
    reference: {
      title: 'Composite Storm Method for Flemish Urban Drainage',
      citation: 'Willems, P., Journal of Hydrology',
      year: 2000
    },
    notes: 'Distinct from IRM standard. Widely used in Flemish urban drainage practice with specific Belgian rainfall statistics.'
  },

  // ============ Russia SNiP ============
  {
    pattern: 'russia_snip',
    name: 'Russia SNiP / SP 32.13330',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'q = \\frac{A \\cdot (1 + C \\cdot \\ln T_r)}{t^n}',
        description: 'Russian building code storm intensity formula'
      }
    ],
    variables: [
      { symbol: 'q', meaning: 'Design intensity (L/s·ha)' },
      { symbol: 'A', meaning: 'Regional intensity parameter' },
      { symbol: 'C', meaning: 'Climate coefficient' },
      { symbol: 'T_r', meaning: 'Return period (years)' },
      { symbol: 't', meaning: 'Storm duration (minutes)' },
      { symbol: 'n', meaning: 'Regional exponent (typically 0.6–0.8)' }
    ],
    reference: {
      title: 'SP 32.13330.2018 (Updated SNiP 2.04.03-85)',
      citation: 'Ministry of Construction of Russia',
      year: 2018
    },
    notes: 'Mandatory Russian building code for sewer and drainage design. Front-loaded distribution typical of continental climate.'
  },

  // ============ Turkey DSİ ============
  {
    pattern: 'turkey_dsi',
    name: 'Turkey DSİ',
    category: 'empirical',
    equations: [
      {
        label: 'IDF Relationship',
        latex: 'i = \\frac{A}{(t + B)^C}',
        description: 'Turkish DSİ regional IDF formula'
      }
    ],
    variables: [
      { symbol: 'i', meaning: 'Design rainfall intensity (mm/hr)' },
      { symbol: 'A, B, C', meaning: 'Region-specific parameters (DSİ gauge network)' },
      { symbol: 't', meaning: 'Storm duration (minutes)' }
    ],
    reference: {
      title: 'DSİ Hydrology Manual',
      citation: 'State Hydraulic Works (Devlet Su İşleri), Turkey',
      year: 2012
    },
    notes: 'Distinct from Turkey MGM (meteorological). DSİ focuses on hydraulic infrastructure design with region-specific gauge calibration.'
  },

  // ============ Korea MOLIT ============
  {
    pattern: 'korea_molit',
    name: 'Korea MOLIT',
    category: 'cumulative',
    equations: [
      {
        label: 'Huff Curve (MOLIT calibration)',
        latex: 'F(t) = \\sum_{k=0}^{4} a_k \\cdot \\left(\\frac{t}{D}\\right)^k',
        description: '4th-order polynomial Huff curve fit for Korean urban basins'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 'a_k', meaning: 'MOLIT-calibrated polynomial coefficients' },
      { symbol: 'D', meaning: 'Total storm duration' }
    ],
    reference: {
      title: 'Design Flood Estimation Guidelines',
      citation: 'Ministry of Land, Infrastructure and Transport (MOLIT), South Korea',
      year: 2019
    },
    notes: 'More front-loaded than KMA standard. Calibrated for urbanized Seoul metropolitan and other major basins.'
  },

  // ============ Greece Hellenic ============
  {
    pattern: 'greece_hellenic',
    name: 'Greece Hellenic',
    category: 'empirical',
    equations: [
      {
        label: 'Koutsoyiannis-Baloutsos IDF',
        latex: 'i = \\frac{a}{(t + \\theta)^{\\eta}}',
        description: 'Greek IDF formulation with regional parameters'
      }
    ],
    variables: [
      { symbol: 'i', meaning: 'Design rainfall intensity (mm/hr)' },
      { symbol: 'a', meaning: 'Regional scaling parameter' },
      { symbol: '\\theta', meaning: 'Duration offset parameter (minutes)' },
      { symbol: '\\eta', meaning: 'Duration exponent' }
    ],
    reference: {
      title: 'Analysis of IDF Curves for Attica Region',
      citation: 'Koutsoyiannis, D. & Baloutsos, G., Journal of Hydrology',
      year: 2000
    },
    notes: 'Standard for Greek urban drainage. Regional parameters available for major Greek cities and basins.'
  },

  // ============ Romania STAS ============
  {
    pattern: 'romania_stas',
    name: 'Romania STAS / Andrei Method',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i = \\frac{a \\cdot T_r^b}{t^c}',
        description: 'Romanian standard rainfall intensity formula'
      }
    ],
    variables: [
      { symbol: 'i', meaning: 'Design intensity (mm/hr)' },
      { symbol: 'a, b, c', meaning: 'Regional parameters' },
      { symbol: 'T_r', meaning: 'Return period (years)' },
      { symbol: 't', meaning: 'Storm duration (minutes)' }
    ],
    reference: {
      title: 'Romanian STAS Standards for Urban Drainage',
      citation: 'Andrei, I., Romanian Standardization Institute',
      year: 1990
    },
    notes: 'Standard Romanian urban drainage practice. Parameters calibrated for major Romanian cities.'
  },

  // ============ PMP WMO Generalized ============
  {
    pattern: 'pmp_wmo',
    name: 'PMP WMO Generalized (Hershfield)',
    category: 'empirical',
    equations: [
      {
        label: 'Hershfield Method',
        latex: 'PMP = \\bar{X}_n + K_m \\cdot S_n',
        description: 'Statistical frequency factor approach'
      },
      {
        label: 'Alternative Form',
        latex: 'PMP = \\bar{X}_n(1 + K_m \\cdot C_v)',
        description: 'Using coefficient of variation'
      }
    ],
    variables: [
      { symbol: 'PMP', meaning: 'Probable Maximum Precipitation (mm)' },
      { symbol: '\\bar{X}_n', meaning: 'Mean of n annual maxima' },
      { symbol: 'S_n', meaning: 'Standard deviation of annual maxima' },
      { symbol: 'K_m', meaning: 'Hershfield frequency factor (typically 15–20)' },
      { symbol: 'C_v', meaning: 'Coefficient of variation' }
    ],
    reference: {
      title: 'WMO-No. 1045: Manual on Estimation of PMP',
      citation: 'World Meteorological Organization',
      year: 2009,
      link: 'https://www.wmo.int'
    },
    notes: 'Global framework for PMP estimation. Broader applicability than US-specific HMR 51/52. Includes generalized temporal distribution.'
  },

  // ============ Nested Envelope ============
  {
    pattern: 'nested_envelope',
    name: 'Nested/Envelope Design Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Nesting Criterion',
        latex: 'P_{nested}(d) = \\max\\left[P_{T_r}(d)\\right] \\quad \\forall \\; d \\leq D',
        description: 'Sub-duration depths match IDF values creating worst-case nesting'
      },
      {
        label: 'Alternating Block Placement',
        latex: '\\Delta P_i = P(i \\cdot \\Delta t) - P((i-1) \\cdot \\Delta t)',
        description: 'Incremental depths placed symmetrically around storm center'
      }
    ],
    variables: [
      { symbol: 'P_{nested}(d)', meaning: 'Nested depth for sub-duration d' },
      { symbol: 'P_{T_r}(d)', meaning: 'IDF depth for return period Tr and duration d' },
      { symbol: 'D', meaning: 'Total storm duration' },
      { symbol: '\\Delta P_i', meaning: 'Incremental depth for interval i' }
    ],
    reference: {
      title: 'EM 1110-2-1411: Standard Project Flood Determinations',
      citation: 'US Army Corps of Engineers',
      year: 1965
    },
    notes: 'Conservative worst-case storm for dam safety and critical infrastructure. Ensures maximum runoff for all sub-catchment travel times.'
  },
  // ============ Arnell (Sweden historical) ============
  {
    pattern: 'arnell_sweden',
    name: 'Arnell Design Storm (Sweden 1982)',
    category: 'intensity',
    equations: [
      {
        label: 'Arnell Chicago-type',
        latex: 'i(t) = \\frac{1}{(0.06 + |t - r| \\cdot 2.8)^{1.15}}',
        description: 'Chicago-type intensity with broader peak than modern SMHI'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t' },
      { symbol: 't', meaning: 'Dimensionless time (0–1)' },
      { symbol: 'r', meaning: 'Advancement ratio = 0.33' },
    ],
    reference: {
      title: 'Dimensionering av dagvattensystem — regn och bräddning',
      citation: 'Arnell, V.',
      year: 1982
    },
    notes: 'Historical predecessor to modern Sweden SMHI. Uses Chicago-type formulation with r=0.33 and broader peak than current practice. Still referenced in older Swedish municipal drainage standards.'
  },
  // ============ TENAX-CDS ============
  {
    pattern: 'tenax_cds',
    name: 'TENAX Climate-Adapted Chicago Design Storm',
    category: 'intensity',
    equations: [
      {
        label: 'Climate-scaled Chicago',
        latex: 'i(t) = i_{Chicago}(t) \\cdot \\left[1 + (\\alpha_{CC} - 1) \\cdot \\phi(t)\\right]',
        description: 'Chicago storm with Clausius-Clapeyron scaling at peak'
      }
    ],
    variables: [
      { symbol: 'i_{Chicago}(t)', meaning: 'Base Chicago storm intensity' },
      { symbol: '\\alpha_{CC}', meaning: 'Climate scaling factor (~1.07/°C Clausius-Clapeyron)' },
      { symbol: '\\phi(t)', meaning: 'Peak proximity function (1 at peak, 0 far)' },
      { symbol: 'r', meaning: 'Advancement ratio = 0.40' },
    ],
    reference: {
      title: 'Temperature-conditioned extremes and the TENAX model',
      citation: 'Marra, F. et al. (ETH Zurich / EPFL)',
      year: 2024
    },
    notes: 'Very recent framework for climate-adapting IDF curves. Applies super-Clausius-Clapeyron scaling concentrated near the storm peak, reflecting observed intensification of extreme rainfall cores under warming.'
  },
  // ============ Average Variability Method ============
  {
    pattern: 'avm',
    name: 'Average Variability Method (AVM)',
    category: 'empirical',
    equations: [
      {
        label: 'AVM averaging',
        latex: '\\bar{i}(t_j) = \\frac{1}{N} \\sum_{k=1}^{N} i_k(t_j)',
        description: 'Design intensity from averaging N observed storm patterns'
      }
    ],
    variables: [
      { symbol: '\\bar{i}(t_j)', meaning: 'Design intensity at time step j' },
      { symbol: 'N', meaning: 'Number of observed storms in sample' },
      { symbol: 'i_k(t_j)', meaning: 'Intensity of storm k at time step j' },
      { symbol: 't_j', meaning: 'Dimensionless time step' },
    ],
    reference: {
      title: 'Australian Rainfall and Runoff (ARR) — temporal patterns',
      citation: 'Pilgrim, D.H. & Cordery, I.',
      year: 1975
    },
    notes: 'Creates design storms by averaging temporal patterns of multiple observed storms at each time step. Produces smoother distributions than single-storm methods. Related to but distinct from Pilgrim-Cordery ranking approach.'
  },
  // ============ Sifalda (Czech) ============
  {
    pattern: 'sifalda',
    name: 'Sifalda Design Storm (Czech Republic)',
    category: 'intensity',
    equations: [
      {
        label: 'First Quarter (0 ≤ t < 0.34T)',
        latex: 'i_1(t) = \\frac{0.14 \\cdot P}{0.34 \\cdot T}',
        description: 'Low uniform intensity in the initial phase'
      },
      {
        label: 'Central Burst (0.34T ≤ t < 0.51T)',
        latex: 'i_2(t) = \\frac{0.56 \\cdot P}{0.17 \\cdot T}',
        description: 'High-intensity core containing 56% of total depth in 17% of duration'
      },
      {
        label: 'Recession (0.51T ≤ t ≤ T)',
        latex: 'i_3(t) = \\frac{0.30 \\cdot P}{0.49 \\cdot T}',
        description: 'Moderate declining intensity in the final phase'
      }
    ],
    variables: [
      { symbol: 'i_1, i_2, i_3', meaning: 'Uniform intensity in each phase (mm/hr)' },
      { symbol: 'P', meaning: 'Total precipitation depth' },
      { symbol: 'T', meaning: 'Total storm duration' }
    ],
    reference: {
      title: 'Úprava intenzit srážek pro městské odvodnění',
      citation: 'Sifalda, V.',
      year: 1973
    },
    notes: 'Three-block step function from analysis of Czech urban storms. 56% of depth falls in only 17% of duration (central burst). Still used in Czech/Slovak drainage codes alongside modern ČHMÚ Chicago-type.'
  },
  // ============ Pilgrim-Cordery ============
  {
    pattern: 'pilgrim_cordery',
    name: 'Pilgrim-Cordery Method',
    category: 'empirical',
    equations: [
      {
        label: 'Ranked Average',
        latex: 'i^*(t_j) = \\frac{1}{N} \\sum_{k=1}^{N} \\text{rank}_j(i_k)',
        description: 'Average of ranked intensities at each time position'
      },
      {
        label: 'Dimensionless Hyetograph',
        latex: 'F(t) = \\frac{P(t)}{P_{total}}',
        description: 'Cumulative fraction from empirical ordinate table'
      }
    ],
    variables: [
      { symbol: 'i^*(t_j)', meaning: 'Design intensity at time step j from ranked averaging' },
      { symbol: 'N', meaning: 'Number of historical storms in sample' },
      { symbol: 'F(t)', meaning: 'Cumulative dimensionless precipitation fraction' },
      { symbol: 'P_{total}', meaning: 'Total storm depth' }
    ],
    reference: {
      title: 'Rainfall Temporal Patterns for Design Floods',
      citation: 'Pilgrim, D.H. & Cordery, I., ASCE J. Hydraulic Division',
      year: 1975
    },
    notes: 'Pre-ARR2016 Australian standard. Ranks observed storm increments independently at each time position, then averages ranks. Produces front-loaded design storm with peak at ~40% of duration. Superseded by ARR2019 ensemble approach.'
  },
  // ============ Watt's Curve (UK) ============
  {
    pattern: 'watts_curve',
    name: "Watt's Curve (UK)",
    category: 'intensity',
    equations: [
      {
        label: 'Rising Limb (t ≤ tₚ)',
        latex: 'i(t) = i_0 \\cdot \\frac{t}{t_p}',
        description: 'Linear rise to peak intensity'
      },
      {
        label: 'Falling Limb (t > tₚ)',
        latex: 'i(t) = i_0 \\cdot \\exp\\left[-k \\cdot \\frac{t - t_p}{t_p}\\right]',
        description: 'Exponential decay after peak'
      },
      {
        label: 'Beta Approximation',
        latex: 'f(t) = t^{\\alpha-1}(1-t)^{\\beta-1} / B(\\alpha, \\beta)',
        description: 'Symmetrical bell shape when α = β = 2.5'
      }
    ],
    variables: [
      { symbol: 'i_0', meaning: 'Peak intensity (mm/hr)' },
      { symbol: 't_p', meaning: 'Time to peak' },
      { symbol: 'k', meaning: 'Decay constant (typically 1.5–3.0)' },
      { symbol: '\\alpha, \\beta', meaning: 'Beta distribution shape parameters (2.5 each for symmetric)' }
    ],
    reference: {
      title: 'A Study of the Time-Area-Concentration Diagram',
      citation: 'Watt, W.E. & Chow, K.C.A.',
      year: 1985
    },
    notes: 'Historical UK method predating the Flood Estimation Handbook (FEH). Produces symmetrical bell-shaped profile. Now largely superseded by FEH summer/winter profiles but still referenced in older UK drainage manuals and academic literature.'
  },
  // ============ Dubai Municipality ============
  {
    pattern: 'dubai_dm' as PatternType,
    name: 'Dubai Municipality',
    category: 'empirical' as const,
    equations: [
      {
        label: 'Front-Loaded Profile',
        latex: 'P(t) = P_{total} \\cdot F_{DM}(t/D)',
        description: 'Sharp front-loaded summer convective profile based on Dubai Municipality guidelines'
      }
    ],
    variables: [
      { symbol: 'P(t)', meaning: 'Cumulative depth at time t (mm)' },
      { symbol: 'P_{total}', meaning: 'Total storm depth (mm)' },
      { symbol: 'F_{DM}', meaning: 'Dubai Municipality dimensionless mass curve' },
      { symbol: 'D', meaning: 'Storm duration (hr)' }
    ],
    reference: {
      title: 'Dubai Municipality Stormwater Design Guidelines',
      citation: 'Dubai Municipality, Infrastructure & Renewables Sector',
      year: 2024,
      link: 'https://www.dm.gov.ae'
    },
    notes: 'Sharp, front-loaded summer peak profile for Dubai convective storms. Uses empirical dimensionless mass curve from DM guidelines.'
  },

  // ============ Dubai DM Combined ============
  {
    pattern: 'dubai_dm_combined' as PatternType,
    name: 'Dubai DM Combined (Modified FEH)',
    category: 'cumulative' as const,
    equations: [
      {
        label: 'Symmetric S-Curve',
        latex: 'P(t) = P_{total} \\cdot S_{DM}(t/D)',
        description: '101-point symmetric dimensionless mass curve from the Modified FEH for DXB methodology'
      },
      {
        label: 'Intensity from S-Curve',
        latex: 'i(t_k) = \\frac{P_{total} \\cdot [S_{DM}(t_k/D) - S_{DM}(t_{k-1}/D)]}{\\Delta t}',
        description: 'Incremental intensity derived from successive S-curve values'
      }
    ],
    variables: [
      { symbol: 'P(t)', meaning: 'Cumulative depth at time t (mm)' },
      { symbol: 'P_{total}', meaning: 'Total storm depth (mm)' },
      { symbol: 'S_{DM}', meaning: 'Dubai Municipality Combined dimensionless mass curve (0 to 1)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: '\\Delta t', meaning: 'Time step interval (hr)' },
      { symbol: 'i(t_k)', meaning: 'Rainfall intensity at time step k (mm/hr)' }
    ],
    reference: {
      title: 'Dubai Municipality Modified FEH Guidelines for DXB',
      citation: 'Dubai Municipality, 2024/2025 DM Stormwater Design Guidelines',
      year: 2024,
      link: 'https://www.dm.gov.ae'
    },
    notes: 'Center-peaked symmetric profile using a 101-point dimensionless S-curve. Verified against 2024/2025 DM guidelines to produce ~98.7 mm/hr peak intensity at 33.3 mm depth / 60-min duration with 30-min time step.'
  },
  // ============ v10: Poland & Eastern Europe ============

  {
    pattern: 'atv_a121',
    name: 'ATV-A 121 (DWA-A 118)',
    category: 'empirical',
    equations: [
      { label: 'ATV-A 121 Model Rain', latex: 'P_k = \\sum_{i=1}^{k} \\Delta P_i, \\quad k = 1 \\ldots 12', description: '12-interval 5-minute step distribution for 60-min storm' },
      { label: 'Peak Interval', latex: 'P_6 = 24\\% \\text{ of total depth}', description: 'Peak at interval 6 of 12 (~45-50% of duration)' },
    ],
    variables: [
      { symbol: 'P_k', meaning: 'Cumulative rainfall fraction at interval k' },
      { symbol: 'ΔP_i', meaning: 'Incremental depth at interval i (% of total)' },
    ],
    reference: { title: 'ATV-A 121: Niederschlag-Abfluss-Modelle', citation: 'Abwassertechnische Vereinigung', year: 1985 },
    notes: 'German sewer design standard extensively adopted in Poland. Peak ratio ~2.9×. Superseded by DWA-A 118 but still widely referenced.'
  },

  {
    pattern: 'dwa_a118',
    name: 'DWA-A 118 Symmetric Model Rain',
    category: 'empirical',
    equations: [
      { label: 'Symmetric Distribution', latex: 'F(t) = \\begin{cases} 0.625 \\cdot (t/0.4D)^{1.5} & t \\le 0.4D \\\\ 0.5 + 2.5 \\cdot (t/D - 0.4) & 0.4D < t \\le 0.6D \\\\ 1 - 0.625 \\cdot ((D-t)/0.4D)^{1.5} & t > 0.6D \\end{cases}', description: '40% rising, 20% peak, 40% falling — symmetric about center' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction at time t' },
      { symbol: 'D', meaning: 'Total storm duration' },
    ],
    reference: { title: 'DWA-A 118: Hydraulische Bemessung und Nachweis von Entwässerungssystemen', citation: 'Deutsche Vereinigung für Wasserwirtschaft', year: 2006, link: 'https://www.dwa.de' },
    notes: 'Updated 2006 German standard with symmetric distribution. Peak ratio 2.5×.'
  },

  {
    pattern: 'blaszczyk',
    name: 'Błaszczyk Distribution',
    category: 'empirical',
    equations: [
      { label: 'Błaszczyk 4-Quarter', latex: 'P(t) = \\begin{cases} 0.60t & 0 \\le t \\le 0.25 \\\\ 1.8(t-0.25)+0.15 & 0.25 < t \\le 0.50 \\\\ t + 0.10 & 0.50 < t \\le 0.75 \\\\ 0.60t + 0.40 & 0.75 < t \\le 1.0 \\end{cases}', description: 'Traditional 4-quarter distribution: 15%, 45%, 25%, 15%' },
    ],
    variables: [
      { symbol: 'P(t)', meaning: 'Cumulative fraction at dimensionless time t' },
    ],
    reference: { title: 'Kanalizacja (Sewerage)', citation: 'Błaszczyk, W.', year: 1954 },
    notes: 'Traditional Polish method still in some municipal standards. Peak ratio 1.8×. Moderate center-peaked distribution.'
  },

  {
    pattern: 'imgw_cluster1',
    name: 'IMGW Cluster 1 — Front-Loaded',
    category: 'empirical',
    equations: [
      { label: 'Front-Loaded Profile', latex: 't_{peak} \\in [0, 0.2D]', description: 'Rapid onset storm with peak in first 20% of duration' },
    ],
    variables: [
      { symbol: 't_{peak}', meaning: 'Time of peak intensity' },
      { symbol: 'D', meaning: 'Total storm duration' },
    ],
    reference: { title: 'Heavy rainfalls in Poland and their hyetographs', citation: 'IMGW-PIB, Ambio', year: 2024 },
    notes: 'From analysis of 31,646 heavy rainfall events at 100 gauges across Poland. Occurrence: ~18% of heavy storms.'
  },

  {
    pattern: 'imgw_cluster2',
    name: 'IMGW Cluster 2 — Early Peak',
    category: 'empirical',
    equations: [
      { label: 'Early-Peak Profile', latex: 't_{peak} \\in [0.2D, 0.35D]', description: 'Peak in first third of storm duration' },
    ],
    variables: [
      { symbol: 't_{peak}', meaning: 'Time of peak intensity' },
    ],
    reference: { title: 'Heavy rainfalls in Poland and their hyetographs', citation: 'IMGW-PIB, Ambio', year: 2024 },
    notes: 'Occurrence: ~25% of Polish heavy storms. Second most common cluster.'
  },

  {
    pattern: 'imgw_cluster3',
    name: 'IMGW Cluster 3 — Central Peak',
    category: 'empirical',
    equations: [
      { label: 'Central Peak Profile', latex: 't_{peak} \\in [0.35D, 0.50D]', description: 'DVWK-like central peak — most common pattern in Poland' },
    ],
    variables: [
      { symbol: 't_{peak}', meaning: 'Time of peak intensity' },
    ],
    reference: { title: 'Heavy rainfalls in Poland and their hyetographs', citation: 'IMGW-PIB, Ambio', year: 2024 },
    notes: 'Most common cluster: ~28% of Polish heavy storms. Validates DVWK Euler Type II as representative.'
  },

  {
    pattern: 'imgw_cluster4',
    name: 'IMGW Cluster 4 — Late Peak',
    category: 'empirical',
    equations: [
      { label: 'Late-Peak Profile', latex: 't_{peak} \\in [0.50D, 0.70D]', description: 'Peak in second half of storm' },
    ],
    variables: [
      { symbol: 't_{peak}', meaning: 'Time of peak intensity' },
    ],
    reference: { title: 'Heavy rainfalls in Poland and their hyetographs', citation: 'IMGW-PIB, Ambio', year: 2024 },
    notes: 'Occurrence: ~17% of heavy storms.'
  },

  {
    pattern: 'imgw_cluster5',
    name: 'IMGW Cluster 5 — End-Loaded',
    category: 'empirical',
    equations: [
      { label: 'End-Loaded Profile', latex: 't_{peak} \\in [0.70D, 0.90D]', description: 'Delayed peak near end of storm' },
    ],
    variables: [
      { symbol: 't_{peak}', meaning: 'Time of peak intensity' },
    ],
    reference: { title: 'Heavy rainfalls in Poland and their hyetographs', citation: 'IMGW-PIB, Ambio', year: 2024 },
    notes: 'Rarest cluster: ~12% of heavy storms. Important for long-duration runoff analysis.'
  },

  {
    pattern: 'wroclaw_2050',
    name: 'Wrocław 2050 Climate-Adjusted',
    category: 'empirical',
    equations: [
      { label: 'Climate-Adjusted Peak', latex: 'r_{2050} \\approx 2.8 \\bar{i}, \\quad t_{peak} \\approx 0.30D', description: 'Earlier, sharper peak with +15-20% depth increase vs baseline' },
    ],
    variables: [
      { symbol: 'r_{2050}', meaning: 'Peak ratio under 2050 climate projection' },
      { symbol: '\\bar{i}', meaning: 'Average intensity' },
    ],
    reference: { title: 'Model Hyetographs of Short-Term Rainfall for Wrocław in the Perspective of 2050', citation: 'Mikołajewski, K. et al., Atmosphere', year: 2020 },
    notes: 'Forward-looking infrastructure design. Baseline peak ratio 2.2× shifts to 2.8× with earlier peak under climate change.'
  },

  {
    pattern: 'trupl',
    name: 'Trupl Design Storm (Czech)',
    category: 'cumulative',
    equations: [
      { label: 'Trupl Cumulative Curve', latex: 'P(t) \\text{ — 13-point table from 0 to 100\\%}', description: 'Sharper peak than DVWK (3.1× ratio), peak at 40-50% of duration' },
    ],
    variables: [
      { symbol: 'P(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Intenzity krátkodobých dešťů v povodích Labe, Odry a Moravy', citation: 'Trupl, J.', year: 1958 },
    notes: 'Standard Czech/Slovak design storm. Sharper peak reflects Central European convective patterns.'
  },

  {
    pattern: 'samaj_valovic',
    name: 'Šamaj-Valovič (Slovak)',
    category: 'empirical',
    equations: [
      { label: 'Šamaj-Valovič Distribution', latex: 'P_{35\\text{-}50\\%} = 45\\% \\text{ of total depth}', description: 'Peak at 35-50% of duration, 45% of depth in 15% of time' },
    ],
    variables: [
      { symbol: 'P', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Výdatnosť krátkodobých dažďov na Slovensku', citation: 'Šamaj, F. & Valovič, Š.', year: 1973 },
    notes: 'Slovak design storm from Bratislava and Košice records. Peak ratio 3.0×.'
  },

  {
    pattern: 'hungarian_msz',
    name: 'Hungarian MSZ Standard',
    category: 'empirical',
    equations: [
      { label: 'MSZ 5-Segment', latex: 'P = [10\\%, 20\\%, 40\\%, 20\\%, 10\\%]', description: '5 equal-duration segments with 40% peak in center segment' },
    ],
    variables: [
      { symbol: 'P', meaning: 'Rainfall depth fraction per segment' },
    ],
    reference: { title: 'MSZ Hungarian Standard for Urban Drainage', citation: 'Magyar Szabványügyi Testület', year: 1990 },
    notes: 'Peak ratio 2.7×. Also referenced in Romania and Serbia.'
  },

  {
    pattern: 'budapest_convective',
    name: 'Budapest Convective Storm',
    category: 'empirical',
    equations: [
      { label: 'Budapest Peak', latex: 'P_{peak} = 35\\% \\text{ of depth in } 10\\% \\text{ of duration}', description: 'Very sharp convective peak (3.5× ratio) at 30-40% of duration' },
    ],
    variables: [
      { symbol: 'P_{peak}', meaning: 'Peak burst rainfall fraction' },
    ],
    reference: { title: 'Budapest Long-Term Pluviograph Analysis', citation: 'Országos Meteorológiai Szolgálat (OMSZ)', year: 2005 },
    notes: 'Derived from Budapest pluviograph records. Very sharp peak (3.5× average) — among the most peaky European profiles.'
  },

  {
    pattern: 'owav_rb11',
    name: 'ÖWAV Regelblatt 11 (Austrian)',
    category: 'empirical',
    equations: [
      { label: 'ÖWAV 12-Interval', latex: 'P_7 = 27\\% \\text{ of total depth}', description: '12-interval distribution with peak at interval 7 (~50-58% of duration)' },
    ],
    variables: [
      { symbol: 'P_k', meaning: 'Rainfall depth fraction at interval k' },
    ],
    reference: { title: 'ÖWAV Regelblatt 11: Niederschlagsdaten für die Siedlungsentwässerung', citation: 'Österreichischer Wasser- und Abfallwirtschaftsverband', year: 2009, link: 'https://www.oewav.at' },
    notes: 'Later peak than DVWK — characteristic of orographic rainfall in Alpine/Carpathian regions. Peak ratio 3.2×. Sometimes used in southern Poland.'
  },

  // ══════════ v11 — High-value additions ══════════

  // ============ Croatian DHMZ ============
  {
    pattern: 'croatian_dhmz',
    name: 'Croatian DHMZ',
    category: 'empirical',
    equations: [
      {
        label: 'Adriatic Convective Profile',
        latex: 'F(t) = \\sum_{k=1}^{10} \\Delta F_k \\cdot H(t - t_k)',
        description: 'Stepwise cumulative distribution derived from Adriatic coastal pluviograph records'
      },
      {
        label: 'Peak Segment',
        latex: '\\Delta F_{\\max} = 0.22 \\quad \\text{at } t/D \\in [0.3, 0.4]',
        description: '22% of total depth falls in a single 10% duration segment'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction (0–1)' },
      { symbol: '\\Delta F_k', meaning: 'Incremental fraction in segment k' },
      { symbol: 't/D', meaning: 'Dimensionless time' }
    ],
    reference: {
      title: 'Analiza oborinskih podataka jadranskog priobalja',
      citation: 'Državni Hidrometeorološki Zavod (DHMZ)',
      year: 2015,
      link: 'https://meteo.hr'
    },
    notes: 'Adriatic coastal convective pattern. Peak at 30–40% of duration (peak ratio ~2.8×). Influenced by orographic lifting along Dinaric Alps.'
  },

  // ============ Algeria ANRH ============
  {
    pattern: 'algeria_anrh',
    name: 'Algeria ANRH',
    category: 'empirical',
    equations: [
      {
        label: 'Mediterranean Front-Loaded Profile',
        latex: 'F(t) = \\begin{cases} 0.50 \\cdot \\left(\\frac{t}{0.3}\\right)^{0.85} & t \\leq 0.3 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Semi-arid Mediterranean convective profile with early peak'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Étude des pluies de courte durée en Algérie du Nord',
      citation: 'Agence Nationale des Ressources Hydrauliques (ANRH)',
      year: 2010
    },
    notes: 'North African Mediterranean climate. Front-loaded convective bursts typical of Tell Atlas region. Peak at 20–30% of duration.'
  },

  // ============ West Africa CIEH ============
  {
    pattern: 'west_africa_cieh',
    name: 'West Africa CIEH',
    category: 'empirical',
    equations: [
      {
        label: 'Sahelian Squall Line',
        latex: 'F(t) = \\begin{cases} 0.60 \\cdot \\left(\\frac{t}{0.2}\\right)^{0.65} & t \\leq 0.2 \\\\ 0.60 + 0.25 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.85 + 0.15 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}',
        description: 'Extremely front-loaded profile representing Sahelian squall line passage'
      },
      {
        label: 'Peak Burst',
        latex: 'P_{burst} = 60\\% \\text{ of depth in first } 20\\% \\text{ of duration}',
        description: 'Intense leading convective burst followed by stratiform tail'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 'P_{burst}', meaning: 'Fraction of depth in convective burst' }
    ],
    reference: {
      title: 'Pluies et crues au Sahel — Manuel de drainage urbain',
      citation: 'Comité Inter-États d\'Études Hydrauliques (CIEH)',
      year: 1985,
      link: 'https://horizon.documentation.ird.fr'
    },
    notes: 'Covers 14 ECOWAS member states. Sahelian squall lines produce peak ratios of 4–5×. Used for drainage design across West Africa.'
  },

  // ============ Portugal LNEC ============
  {
    pattern: 'portugal_lnec',
    name: 'Portuguese LNEC',
    category: 'empirical',
    equations: [
      {
        label: 'Mediterranean Convective Profile',
        latex: 'F(t) = \\begin{cases} 0.45 \\cdot \\left(\\frac{t}{0.3}\\right)^{0.80} & t \\leq 0.3 \\\\ 0.45 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Lisbon/Algarve-based Mediterranean convective design storm'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Drenagem de Águas Pluviais Urbanas — Manual de Saneamento Básico',
      citation: 'Laboratório Nacional de Engenharia Civil (LNEC)',
      year: 2000
    },
    notes: 'Portuguese standard for urban drainage. Peak at 20–30% of duration. Moderate front-loading typical of Atlantic-influenced Mediterranean storms.'
  },

  // ============ Costa Rica IMN ============
  {
    pattern: 'costa_rica_imn',
    name: 'Costa Rica IMN',
    category: 'empirical',
    equations: [
      {
        label: 'Tropical Convective Profile',
        latex: 'F(t) = \\begin{cases} 0.55 \\cdot \\left(\\frac{t}{0.3}\\right)^{0.75} & t \\leq 0.3 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Pacific-slope tropical convective profile for Central America'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' }
    ],
    reference: {
      title: 'Curvas IDF y distribución temporal para Costa Rica',
      citation: 'Instituto Meteorológico Nacional (IMN)',
      year: 2008
    },
    notes: 'Pacific slope convective storms. Peak at 20–30% of duration with rapid onset. Applicable to Panama and Nicaragua as well.'
  },

  // ============ Nepal DHM ============
  {
    pattern: 'nepal_dhm',
    name: 'Nepal DHM',
    category: 'empirical',
    equations: [
      {
        label: 'Orographic Monsoon Profile',
        latex: 'F(t) = \\begin{cases} 0.30 \\cdot \\frac{t}{0.4} & t \\leq 0.4 \\\\ 0.30 + 0.45 \\cdot \\left(\\frac{t-0.4}{0.2}\\right)^{0.7} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Extreme orographic monsoon with intense mid-storm peak'
      },
      {
        label: 'Peak Intensity Ratio',
        latex: 'i_{peak} \\approx 3.5 \\cdot \\bar{i}',
        description: 'Peak is ~3.5 times the average intensity due to orographic enhancement'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 'i_{peak}', meaning: 'Peak rainfall intensity' },
      { symbol: '\\bar{i}', meaning: 'Average intensity (P/D)' }
    ],
    reference: {
      title: 'Precipitation Climatology of Nepal',
      citation: 'Department of Hydrology and Meteorology (DHM), Nepal',
      year: 2015,
      link: 'https://dhm.gov.np'
    },
    notes: 'Extreme orographic lifting along Himalayan front range. Peak at 40–60% of duration. Peak ratios up to 3.5× in Terai–Churia Hills transition zone.'
  },

  // ============ NYC DEP ============
  {
    pattern: 'nyc_dep',
    name: 'NYC DEP Design Storm',
    category: 'cumulative',
    equations: [
      {
        label: 'Modified SCS Type III',
        latex: 'F(t) = \\begin{cases} 0.20 \\cdot \\frac{t}{0.4} & t \\leq 0.4 \\\\ 0.20 + 0.55 \\cdot \\left(\\frac{t-0.4}{0.2}\\right)^{0.8} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}',
        description: 'Modified SCS Type III adapted for NYC combined sewer system design'
      },
      {
        label: 'Design Depth',
        latex: 'P_{10yr,6hr} = 3.5 \\text{ in (89 mm)}',
        description: 'Standard NYC DEP design event for combined sewer overflow analysis'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' },
      { symbol: 'P_{10yr,6hr}', meaning: 'NYC 10-year, 6-hour design depth' }
    ],
    reference: {
      title: 'NYC DEP Guidelines for the Design and Construction of Stormwater Management Systems',
      citation: 'New York City Department of Environmental Protection',
      year: 2012,
      link: 'https://www.nyc.gov/site/dep'
    },
    notes: 'Required for all NYC combined sewer areas. Center-peaked distribution (40–60% of duration). Based on modified SCS Type III with NYC-specific IDF data.'
  },

  // ============ Beta Distribution ============
  {
    pattern: 'beta_distribution',
    name: 'Beta Distribution Storm',
    category: 'cumulative',
    equations: [
      {
        label: 'Beta CDF',
        latex: 'F(t) = I_t(\\alpha, \\beta) = \\frac{B(t; \\alpha, \\beta)}{B(\\alpha, \\beta)}',
        description: 'Regularized incomplete beta function as cumulative rainfall distribution'
      },
      {
        label: 'Beta PDF (Intensity)',
        latex: 'f(t) = \\frac{t^{\\alpha-1}(1-t)^{\\beta-1}}{B(\\alpha,\\beta)}',
        description: 'Probability density function giving dimensionless intensity'
      },
      {
        label: 'Peak Position',
        latex: 't_{peak} = \\frac{\\alpha - 1}{\\alpha + \\beta - 2}',
        description: 'Mode of the Beta distribution (peak time as fraction of duration)'
      }
    ],
    variables: [
      { symbol: '\\alpha', meaning: 'Shape parameter (controls rising limb; default 3)' },
      { symbol: '\\beta', meaning: 'Shape parameter (controls falling limb; default 4)' },
      { symbol: 'B(\\alpha,\\beta)', meaning: 'Beta function = Γ(α)Γ(β)/Γ(α+β)' },
      { symbol: 'I_t(\\alpha,\\beta)', meaning: 'Regularized incomplete beta function' },
      { symbol: 't_{peak}', meaning: 'Peak position (0.40 for α=3, β=4)' }
    ],
    reference: {
      title: 'Temporal Rainfall Disaggregation Using a Beta Distribution',
      citation: 'Koutsoyiannis, D., Hydrological Sciences Journal',
      year: 2003,
      link: 'https://doi.org/10.1623/hysj.48.2.299.44699'
    },
    notes: 'Highly flexible: α=β gives symmetric storm; α<β gives front-loaded; α>β gives rear-loaded. Subsumes many empirical profiles as special cases.'
  },

  // ============ Clausius-Clapeyron Scaled ============
  {
    pattern: 'cc_clausius',
    name: 'Clausius-Clapeyron Scaled Storm',
    category: 'intensity',
    equations: [
      {
        label: 'CC Scaling Law',
        latex: '\\frac{dP}{dT} \\approx 7\\%/°\\text{C}',
        description: 'Clausius-Clapeyron relation: extreme precipitation increases ~7% per degree Celsius of warming'
      },
      {
        label: 'Scaled Depth',
        latex: 'P_{future} = P_{baseline} \\cdot (1.07)^{\\Delta T}',
        description: 'Future design depth scaled by temperature change'
      },
      {
        label: 'Peak Intensification',
        latex: 'i_{peak,future} = i_{peak,base} \\cdot (1.07)^{\\Delta T} \\cdot \\gamma',
        description: 'Peak intensifies faster than total depth (super-CC scaling factor γ)'
      }
    ],
    variables: [
      { symbol: '\\Delta T', meaning: 'Temperature change from baseline (°C; default +3°C)' },
      { symbol: 'P_{baseline}', meaning: 'Historical design storm depth' },
      { symbol: 'P_{future}', meaning: 'Climate-adjusted design storm depth' },
      { symbol: '\\gamma', meaning: 'Super-CC scaling factor for peak intensity (1.0–1.4)' }
    ],
    reference: {
      title: 'Scaling of Extreme Rainfall with Temperature',
      citation: 'Lenderink, G. & van Meijgaard, E., Journal of Climate',
      year: 2008,
      link: 'https://doi.org/10.1175/2007JCLI2037.1'
    },
    notes: 'Applies Euler Type II base pattern with CC-scaled depths. At +3°C warming → 1.21× total depth uplift. Peak interval may show super-CC scaling (up to 14%/°C).'
  },

  // ============ Bartlett-Lewis Stochastic ============
  {
    pattern: 'bartlett_lewis',
    name: 'Bartlett-Lewis Rectangular Pulse',
    category: 'intensity',
    equations: [
      {
        label: 'Storm Arrival (Poisson)',
        latex: 'N(t) \\sim \\text{Poisson}(\\lambda t)',
        description: 'Storm origins arrive as a Poisson process with rate λ'
      },
      {
        label: 'Cell Arrivals (Poisson)',
        latex: 'C_j \\sim \\text{Poisson}(\\beta \\cdot L_j)',
        description: 'Rain cells arrive within each storm at rate β over storm lifetime L'
      },
      {
        label: 'Cell Duration',
        latex: 'L_{cell} \\sim \\text{Exp}(\\eta)',
        description: 'Each rectangular pulse has exponentially distributed duration'
      },
      {
        label: 'Superposition',
        latex: 'i(t) = \\sum_j \\sum_k X_k \\cdot \\mathbb{1}_{[t_{j,k},\\, t_{j,k}+L_k]}(t)',
        description: 'Total intensity is superposition of all active rectangular pulses'
      }
    ],
    variables: [
      { symbol: '\\lambda', meaning: 'Storm arrival rate (storms/hr)' },
      { symbol: '\\beta', meaning: 'Cell arrival rate within storm (cells/hr)' },
      { symbol: '\\eta', meaning: 'Cell duration parameter (1/mean duration)' },
      { symbol: 'X_k', meaning: 'Cell intensity (Gamma-distributed)' },
      { symbol: 'L_j', meaning: 'Storm lifetime (Exponential)' }
    ],
    reference: {
      title: 'A Point Process Model for Rainfall: Further Developments',
      citation: 'Rodriguez-Iturbe, I., Cox, D.R. & Isham, V., Proc. R. Soc. Lond.',
      year: 1988,
      link: 'https://doi.org/10.1098/rspa.1988.0045'
    },
    notes: 'Stochastic model producing irregular multi-burst patterns. Approximated as a fixed realization for design applications. 5 parameters fitted to regional statistics.'
  },

  // ============ Tropical Cyclone Rainband ============
  {
    pattern: 'tropical_cyclone',
    name: 'Tropical Cyclone Rainband',
    category: 'intensity',
    equations: [
      {
        label: 'Composite Rainband Structure',
        latex: 'i(t) = i_{bg}(t) + \\sum_{k=1}^{N} A_k \\cdot \\exp\\left(-\\frac{(t-\\mu_k)^2}{2\\sigma_k^2}\\right)',
        description: 'Background stratiform rain plus embedded Gaussian spiral rainband peaks'
      },
      {
        label: 'Background Rain',
        latex: 'i_{bg}(t) = \\bar{i} \\cdot \\left[0.5 + 0.5\\sin\\left(\\pi\\frac{t}{D}\\right)\\right]',
        description: 'Sinusoidal envelope representing broad-scale cyclonic circulation'
      }
    ],
    variables: [
      { symbol: 'i_{bg}(t)', meaning: 'Background stratiform intensity' },
      { symbol: 'A_k', meaning: 'Amplitude of rainband k' },
      { symbol: '\\mu_k', meaning: 'Position of rainband peak k' },
      { symbol: '\\sigma_k', meaning: 'Width of rainband k' },
      { symbol: 'N', meaning: 'Number of spiral rainbands (typically 2–4)' },
      { symbol: '\\bar{i}', meaning: 'Mean storm intensity (P/D)' }
    ],
    reference: {
      title: 'The Structure and Dynamics of Mature Tropical Cyclones',
      citation: 'Willoughby, H.E., Marks, F.D. & Feinberg, R.J., J. Atmos. Sci.',
      year: 1984,
      link: 'https://doi.org/10.1175/1520-0469(1984)041<0395:SOADOM>2.0.CO;2'
    },
    notes: 'Models hurricane/typhoon rainfall. Double-banded structure: outer rainband approach + eyewall passage. Total duration typically 12–48 hours.'
  },

  // ============ Atmospheric River ============
  {
    pattern: 'atmospheric_river',
    name: 'Atmospheric River',
    category: 'cumulative',
    equations: [
      {
        label: 'Sustained Frontal Profile',
        latex: 'F(t) = \\frac{1 - \\cos(\\pi t)}{2} \\cdot \\left(1 + 0.3\\sin(2\\pi t)\\right) \\cdot \\alpha',
        description: 'Cosine-based sustained profile with embedded frontal modulation'
      },
      {
        label: 'IVT Scaling',
        latex: 'P \\propto \\text{IVT} = \\frac{1}{g}\\int_{sfc}^{300\\text{hPa}} q \\cdot \\mathbf{V} \\, dp',
        description: 'Total depth scales with integrated vapor transport'
      }
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: '\\alpha', meaning: 'Normalization constant' },
      { symbol: '\\text{IVT}', meaning: 'Integrated Vapor Transport (kg/m/s)' },
      { symbol: 'q', meaning: 'Specific humidity' },
      { symbol: '\\mathbf{V}', meaning: 'Horizontal wind vector' }
    ],
    reference: {
      title: 'Atmospheric Rivers: A Mini-Review',
      citation: 'Ralph, F.M., Dettinger, M.D. et al., Water',
      year: 2017,
      link: 'https://doi.org/10.3390/w9060447'
    },
    notes: 'Sustained 24–72 hour events. Late broad peak at 60–70% of duration. Dominant flood mechanism for US West Coast, Chile, Norway, and New Zealand.'
  },

  // ============ Post-Wildfire ============
  {
    pattern: 'post_wildfire',
    name: 'Post-Wildfire Design Storm',
    category: 'intensity',
    equations: [
      {
        label: 'Front-Loaded Burst',
        latex: 'i(t) = i_{peak} \\cdot e^{-k \\cdot t/D}',
        description: 'Exponential decay from initial burst — models debris flow triggering rainfall'
      },
      {
        label: 'Peak Intensity',
        latex: 'i_{peak} = \\frac{P \\cdot k}{D \\cdot (1 - e^{-k})}',
        description: 'Peak intensity derived from volume conservation'
      },
      {
        label: 'Debris Flow Threshold',
        latex: 'I_{15} \\geq I_{thresh} = f(\\text{burn severity, slope, soil})',
        description: '15-minute intensity must exceed site-specific threshold for debris flow initiation'
      }
    ],
    variables: [
      { symbol: 'i_{peak}', meaning: 'Initial peak intensity' },
      { symbol: 'k', meaning: 'Decay constant (typically 3–5)' },
      { symbol: 'D', meaning: 'Storm duration' },
      { symbol: 'I_{15}', meaning: '15-minute rainfall intensity' },
      { symbol: 'I_{thresh}', meaning: 'Debris flow triggering threshold (site-specific)' }
    ],
    reference: {
      title: 'Emergency Assessment of Post-Fire Debris-Flow Hazards',
      citation: 'USGS Landslide Hazards Program',
      year: 2016,
      link: 'https://landslides.usgs.gov/hazards/postfire_debrisflow/'
    },
    notes: 'Extremely front-loaded (peak ratio ~5×). Used for burned watershed emergency response. 15-minute intensity is the critical design metric for debris flow risk.'
  },

  // ============ Bimodal Gaussian ============
  {
    pattern: 'bimodal_gaussian',
    name: 'Bimodal Gaussian',
    category: 'intensity',
    equations: [
      {
        label: 'Bimodal Intensity',
        latex: 'i(t) = \\frac{P}{D} \\cdot \\alpha \\left[\\exp\\left(-\\frac{(t-\\mu_1)^2}{2\\sigma_1^2}\\right) + \\exp\\left(-\\frac{(t-\\mu_2)^2}{2\\sigma_2^2}\\right)\\right]',
        description: 'Sum of two equal-weight Gaussian peaks'
      },
      {
        label: 'Normalization',
        latex: '\\alpha = \\frac{1}{\\sigma_1\\sqrt{2\\pi} + \\sigma_2\\sqrt{2\\pi}}',
        description: 'Ensures total area integrates to P'
      },
      {
        label: 'Peak Positions',
        latex: '\\mu_1 = 0.30D, \\quad \\mu_2 = 0.70D',
        description: 'Symmetric bimodal peak placement'
      }
    ],
    variables: [
      { symbol: '\\mu_1, \\mu_2', meaning: 'Peak centers (default 0.30D, 0.70D)' },
      { symbol: '\\sigma_1, \\sigma_2', meaning: 'Peak widths (default 0.08D each)' },
      { symbol: '\\alpha', meaning: 'Normalization constant for volume conservation' },
      { symbol: 'P', meaning: 'Total precipitation depth' },
      { symbol: 'D', meaning: 'Total storm duration' }
    ],
    reference: {
      title: 'Multi-Cell Convective Storm Modeling',
      citation: 'Various urban hydrology references',
      year: 2000
    },
    notes: 'Models double-peak storms from multi-cell convective complexes or frontal passages with embedded convection. Equal-weight peaks at 30% and 70% of duration.'
  },

  // ══════════ v12 — Massive expansion ══════════

  // ──── Eastern Europe ────

  {
    pattern: 'serbian_rhmz',
    name: 'Serbian RHMZ',
    category: 'empirical',
    equations: [
      { label: 'Belgrade IDF', latex: 'i(t,T) = \\frac{a(T)}{(t + b)^n}', description: 'Sherman-type IDF formula (i in mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & n \\\\ 2 & 698.5 & 8.0 & 0.65 \\\\ 10 & 1078.4 & 9.0 & 0.67 \\\\ 50 & 1465.2 & 10.0 & 0.69 \\\\ 100 & 1635.8 & 10.5 & 0.70 \\end{array}', description: 'Belgrade station IDF coefficients by return period' },
      { label: 'Temporal', latex: '\\text{Euler Type II, } r = 0.375', description: 'Peak at 37.5% of storm duration' },
    ],
    variables: [
      { symbol: 'i(t,T)', meaning: 'Intensity (mm/hr) for duration t and return period T' },
      { symbol: 'a(T)', meaning: 'IDF numerator coefficient (varies with return period)' },
      { symbol: 'b', meaning: 'Time offset (minutes)' },
      { symbol: 'n', meaning: 'Duration exponent' },
      { symbol: 'r', meaning: 'Euler peak position ratio (0.375)' },
    ],
    reference: { title: 'Analiza padavina za urbanu kanalizaciju', citation: 'Republički Hidrometeorološki Zavod Srbije (RHMZ)', year: 2012 },
    notes: 'Continental Pannonian climate. Euler Type II redistribution with r=0.375. Peak ratio ~2.5×.'
  },

  {
    pattern: 'bulgarian_nimh',
    name: 'Bulgarian NIMH',
    category: 'empirical',
    equations: [
      { label: 'Sofia IDF', latex: 'i(t,T) = a(T) \\cdot t^{-n}', description: 'Power-law IDF (i in mm/hr, t in minutes, t ≥ 5 min)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & a & n \\\\ 2 & 28.5 & 0.58 \\\\ 10 & 45.6 & 0.60 \\\\ 50 & 63.4 & 0.62 \\\\ 100 & 71.2 & 0.63 \\end{array}', description: 'Sofia IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Euler Type II, } r = 0.35', description: 'Peak at 35% of storm duration' },
      { label: 'Black Sea variant', latex: 'a_{coast} \\approx 1.15 \\cdot a_{Sofia}, \\quad n_{coast} \\approx n_{Sofia} - 0.02', description: 'Coastal IDF adjustment' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF coefficient (varies with return period)' },
      { symbol: 'n', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Интензивни валежи над България', citation: 'Национален Институт по Метеорология и Хидрология (NIMH)', year: 2010 },
    notes: 'Continental/Mediterranean transition climate. Black Sea coast: 15% higher intensities, slightly flatter IDF slope.'
  },

  {
    pattern: 'slovenian_arso',
    name: 'Slovenian ARSO',
    category: 'empirical',
    equations: [
      { label: 'Ljubljana IDF', latex: 'i(t,T) = \\frac{a(T) + b(T) \\cdot \\ln(t)}{t}', description: 'Logarithmic IDF form (i in mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & a & b \\\\ 2 & 18.42 & 5.63 \\\\ 10 & 29.34 & 8.45 \\\\ 50 & 40.12 & 11.15 \\\\ 100 & 44.89 & 12.38 \\end{array}', description: 'Ljubljana IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Modified Euler Type II, } r = 0.40', description: 'Slightly later peak than standard Euler' },
      { label: 'Alpine correction', latex: 'i_{adj} = i \\cdot (1 + 0.0003 \\cdot (z - 1000)), \\quad z > 1000\\text{m}', description: 'Orographic enhancement for stations above 1000m' },
    ],
    variables: [
      { symbol: 'a(T), b(T)', meaning: 'Logarithmic IDF coefficients' },
      { symbol: 'z', meaning: 'Station elevation (m)' },
    ],
    reference: { title: 'Nalivi in poplave v Sloveniji', citation: 'Agencija RS za okolje (ARSO)', year: 2014, link: 'https://www.arso.gov.si' },
    notes: 'Julian Alps orographic enhancement. Modified Euler II with later peak. Peak ratio ~3.0×.'
  },

  {
    pattern: 'ukrainian_dbn',
    name: 'Ukrainian DBN (ДБН В.2.5-75)',
    category: 'empirical',
    equations: [
      { label: 'Ukrainian IDF', latex: 'q(t,T) = q_{20}(T) \\cdot (t/20)^{-n}', description: 'Updated Soviet formula (q in L/s/ha, t in minutes)' },
      { label: 'Regional Parameters', latex: '\\begin{array}{ccc} \\text{City} & q_{20}(T{=}1) & n \\\\ \\text{Kyiv} & 80 & 0.59 \\\\ \\text{Odesa} & 90 & 0.62 \\\\ \\text{Lviv} & 75 & 0.57 \\\\ \\text{Kharkiv} & 85 & 0.61 \\end{array}', description: 'Regional intensity parameters' },
      { label: 'Temporal Distribution', latex: '\\tau = [0, 0.20, 0.35, 0.50, 0.70, 1.00], \\quad M = [0, 0.10, 0.30, 0.70, 0.90, 1.00]', description: '5-segment mass curve with peak in segment 3' },
    ],
    variables: [
      { symbol: 'q_{20}', meaning: '20-minute intensity for T=1yr (L/s/ha)' },
      { symbol: 'n', meaning: 'Climatic exponent' },
      { symbol: '\\tau', meaning: 'Dimensionless time' },
      { symbol: 'M', meaning: 'Dimensionless cumulative depth' },
    ],
    reference: { title: 'ДБН В.2.5-75 Каналізація', citation: 'Мінрегіон України', year: 2013 },
    notes: '5-segment distribution: f_d = [0.20, 0.15, 0.15, 0.20, 0.30], f_p = [0.10, 0.20, 0.40, 0.20, 0.10]. Peak in segment 3 (40% of depth).'
  },

  {
    pattern: 'lithuanian_hms',
    name: 'Lithuanian HMS',
    category: 'empirical',
    equations: [
      { label: 'Vilnius IDF', latex: 'i(t,T) = \\frac{a(T)}{(t + b)^c}', description: 'Sherman-type IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & c \\\\ 2 & 520 & 7.5 & 0.62 \\\\ 10 & 805 & 8.5 & 0.64 \\\\ 50 & 1095 & 9.5 & 0.66 \\\\ 100 & 1225 & 10.0 & 0.67 \\end{array}', description: 'Vilnius IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Euler Type II, } r = 0.375', description: 'Standard Baltic temporal redistribution' },
      { label: 'Coastal correction', latex: 'a_{Klaip\\dot{e}da} = 1.12 \\cdot a_{Vilnius}', description: 'Maritime enhancement for Baltic coast (Klaipėda)' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF numerator coefficient' },
      { symbol: 'b', meaning: 'Time offset (minutes)' },
      { symbol: 'c', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Lietuvos klimato atlasas', citation: 'Lietuvos Hidrometeorologijos Tarnyba (HMS)', year: 2013 },
    notes: 'Baltic maritime climate. Klaipėda coastal stations: 12% higher intensities. Euler II redistribution.'
  },

  {
    pattern: 'latvian_lvgmc',
    name: 'Latvian LVĢMC',
    category: 'empirical',
    equations: [
      { label: 'Riga IDF', latex: 'i(t,T) = \\frac{a(T)}{(t + b)^c}', description: 'Sherman-type IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & c \\\\ 2 & 490 & 7.0 & 0.61 \\\\ 10 & 765 & 8.0 & 0.63 \\\\ 50 & 1050 & 9.0 & 0.65 \\\\ 100 & 1175 & 9.5 & 0.66 \\end{array}', description: 'Riga IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Euler Type II, } r = 0.375', description: 'Baltic standard redistribution' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF numerator coefficient' },
      { symbol: 'b', meaning: 'Time offset (minutes)' },
      { symbol: 'c', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Lietus intensitātes dati Latvijā', citation: 'Latvijas Vides, Ģeoloģijas un Meteoroloģijas Centrs (LVGMC)', year: 2015 },
    notes: 'Baltic maritime climate. Euler II redistribution, r=0.375. Similar to Lithuanian HMS with slightly lower intensities.'
  },

  {
    pattern: 'estonian_emhi',
    name: 'Estonian EMHI',
    category: 'empirical',
    equations: [
      { label: 'Tallinn IDF', latex: 'i(t,T) = \\frac{a(T)}{(t + b)^c}', description: 'Sherman-type IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & c \\\\ 2 & 460 & 7.0 & 0.60 \\\\ 10 & 725 & 8.0 & 0.62 \\\\ 50 & 1000 & 9.0 & 0.64 \\\\ 100 & 1120 & 9.5 & 0.65 \\end{array}', description: 'Tallinn IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Euler Type II, } r = 0.375', description: 'Baltic redistribution' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF numerator coefficient' },
      { symbol: 'b', meaning: 'Time offset (minutes)' },
      { symbol: 'c', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Eesti sademete klimatoloogia', citation: 'Eesti Meteoroloogia ja Hüdroloogia Instituut (EMHI)', year: 2014 },
    notes: 'Northern Baltic maritime. Slightly lower intensities than Lithuanian/Latvian due to higher latitude. Euler II, r=0.375.'
  },

  {
    pattern: 'soviet_snip_legacy',
    name: 'Soviet SNiP 2.04.03-85',
    category: 'empirical',
    equations: [
      { label: 'Soviet IDF', latex: 'q = q_{20} \\cdot (20/t)^n \\cdot (1 + \\lg(T \\cdot p))', description: 'Standard Soviet drainage IDF formula' },
      { label: 'Climatic Zones', latex: '\\begin{array}{cccc} \\text{Zone} & q_{20}(T{=}1) & n \\\\ \\text{I Arctic} & 50\\text{-}60 & 0.50\\text{-}0.55 \\\\ \\text{II Continental} & 60\\text{-}80 & 0.55\\text{-}0.62 \\\\ \\text{III Temperate} & 70\\text{-}100 & 0.58\\text{-}0.65 \\\\ \\text{IV Subtropical} & 80\\text{-}120 & 0.62\\text{-}0.70 \\\\ \\text{V Arid} & 40\\text{-}70 & 0.65\\text{-}0.80 \\end{array}', description: '5 climatic zones with parameter ranges' },
      { label: 'Mass Curve', latex: '\\tau = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]', description: 'Standard temporal distribution' },
      { label: 'Cumulative', latex: 'M = [0, 0.03, 0.08, 0.18, 0.38, 0.65, 0.80, 0.88, 0.93, 0.97, 1.0]', description: 'Center-peaked mass curve' },
    ],
    variables: [
      { symbol: 'q_{20}', meaning: '20-minute intensity for T=1yr (L/s/ha)' },
      { symbol: 'n', meaning: 'Climatic duration exponent' },
      { symbol: 'p', meaning: 'Probability coefficient' },
      { symbol: '\\lg', meaning: 'Base-10 logarithm' },
    ],
    reference: { title: 'СНиП 2.04.03-85 Канализация', citation: 'Госстрой СССР', year: 1985 },
    notes: 'Still used across former Soviet states (Central Asia, Caucasus, Belarus). 5 climatic zones. Center-peaked mass curve. Peak ratio ~2.7×.'
  },

  {
    pattern: 'belarusian_tkp',
    name: 'Belarusian TKP',
    category: 'empirical',
    equations: [
      { label: 'TKP 45 Profile', latex: 'F(t) = \\begin{cases} 0.28 \\cdot (t/0.4)^{0.85} & t \\leq 0.4 \\\\ 0.28 + 0.42 \\cdot \\frac{t-0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Belarusian technical code design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'ТКП 45-4.01-57 Канализация', citation: 'Министерство архитектуры и строительства Беларуси', year: 2012 },
    notes: 'Updated from Soviet SNiP for Belarusian conditions. Continental climate. Peak at 40–60%.'
  },

  // ──── Nordic/Atlantic Islands ────

  {
    pattern: 'icelandic_imo',
    name: 'Icelandic IMO',
    category: 'empirical',
    equations: [
      { label: 'Subarctic Frontal Profile', latex: 'F(t) = \\frac{1-\\cos(\\pi t)}{2}', description: 'Cosine-based sustained frontal profile for subarctic maritime climate' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' },
    ],
    reference: { title: 'Úrkoma á Íslandi', citation: 'Icelandic Meteorological Office (IMO)', year: 2018, link: 'https://en.vedur.is' },
    notes: 'Low-intensity sustained frontal rainfall. Nearly symmetric cosine distribution. Peak ratio ~1.6×.'
  },

  {
    pattern: 'svensson_jones',
    name: 'Svensson-Jones Climate-Adjusted',
    category: 'empirical',
    equations: [
      { label: 'Climate-Adjusted Profile', latex: 'P_{future}(d) = P_{base}(d) \\cdot (1 + \\Delta_T \\cdot f_d)', description: 'Duration-dependent climate change uplift factor' },
      { label: 'Uplift Factor', latex: 'f_d = a + b \\cdot \\ln(d)', description: 'Log-linear scaling factor varying with duration d' },
    ],
    variables: [
      { symbol: 'P_{future}', meaning: 'Climate-adjusted rainfall depth' },
      { symbol: 'P_{base}', meaning: 'Baseline (historical) rainfall depth' },
      { symbol: '\\Delta_T', meaning: 'Temperature change (°C)' },
      { symbol: 'f_d', meaning: 'Duration-dependent uplift factor' },
      { symbol: 'a, b', meaning: 'Regional regression parameters' },
    ],
    reference: { title: 'Updated UK Rainfall Frequency Estimates for Climate Change', citation: 'Svensson, C. & Jones, D.A., CEH Wallingford', year: 2010 },
    notes: 'UK-specific climate change uplift method. Applied on top of FEH design storm. Used for UKCP09/18 projections.'
  },

  {
    pattern: 'reunion_mf',
    name: 'Réunion Météo-France',
    category: 'empirical',
    equations: [
      { label: 'Réunion IDF', latex: 'i(t,T) = a(T) \\cdot t^{-b} + c(T)', description: 'Power-law + offset IDF (EXTREMELY high — world record territory)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & c \\\\ 2 & 185 & 0.52 & 5.0 \\\\ 10 & 325 & 0.55 & 9.0 \\\\ 50 & 485 & 0.58 & 14.0 \\\\ 100 & 560 & 0.59 & 16.0 \\end{array}', description: 'i in mm/hr — world record rainfall territory' },
      { label: 'Cyclone Profile (24-hr)', latex: '\\tau = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 1.00]', description: 'High-resolution 24-hour cyclone mass curve' },
      { label: 'Mass Curve', latex: 'M = [0, 0.01, 0.03, 0.05, 0.08, 0.12, 0.18, 0.28, 0.42, 0.56, 0.67, 0.75, 0.81, 0.86, 0.90, 0.93, 0.95, 0.97, 0.98, 0.99, 1.00]', description: 'Peak at 35–50% of duration; peak ratio ~3.5×' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF power coefficient (mm/hr)' },
      { symbol: 'b', meaning: 'Duration exponent' },
      { symbol: 'c(T)', meaning: 'IDF offset constant (mm/hr)' },
    ],
    reference: { title: 'Pluies extrêmes à La Réunion', citation: 'Météo-France, Direction Interrégionale de La Réunion', year: 2009 },
    notes: 'World record rainfall location. Cilaos: 1825 mm in 24 hr. Extreme sustained cyclonic events (72–96 hr). Center-late peak.'
  },

  {
    pattern: 'azores_ipma',
    name: 'Azores IPMA',
    category: 'empirical',
    equations: [
      { label: 'Atlantic Subtropical', latex: 'F(t) = \\begin{cases} 0.35 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.35 + 0.35 \\cdot \\frac{t-0.3}{0.35} & 0.3 < t \\leq 0.65 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'Atlantic subtropical island storm profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Precipitação Intensa nos Açores', citation: 'Instituto Português do Mar e da Atmosfera (IPMA)', year: 2016 },
    notes: 'Mid-Atlantic subtropical. Frontal systems with embedded convection. Peak at 25–35% of duration.'
  },

  // ──── Middle East Expansion ────

  {
    pattern: 'jordan_jmd',
    name: 'Jordan JMD',
    category: 'empirical',
    equations: [
      { label: 'Amman IDF', latex: 'i(t,T) = a(T) \\cdot t^{-n}', description: 'Power-law IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & a & n \\\\ 2 & 22.8 & 0.48 \\\\ 10 & 45.2 & 0.53 \\\\ 50 & 69.4 & 0.57 \\\\ 100 & 80.6 & 0.58 \\end{array}', description: 'Amman IDF coefficients' },
      { label: 'Temporal', latex: '\\text{Chicago, } r = 0.25', description: 'Front-loaded arid flash flood character' },
      { label: 'Wadi variant', latex: 'r = 0.15, \\quad D = 1\\text{–}3 \\text{ hours}', description: 'Very front-loaded wadi flash flood design' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF coefficient' },
      { symbol: 'n', meaning: 'Duration exponent' },
      { symbol: 'r', meaning: 'Chicago advancement ratio' },
    ],
    reference: { title: 'Flash Flood Design Standards for Jordan', citation: 'Jordan Meteorological Department (JMD)', year: 2010 },
    notes: 'Arid flash flood design. Wadi variant uses r=0.15 for extreme front-loading. Duration limited to 1–3 hours.'
  },

  {
    pattern: 'lebanon_cav',
    name: 'Lebanon Civil Aviation',
    category: 'empirical',
    equations: [
      { label: 'Beirut IDF', latex: 'i(t,T) = \\frac{a(T)}{(t + b)^c}', description: 'Sherman-type IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{cccc} T & a & b & c \\\\ 2 & 520 & 6.5 & 0.58 \\\\ 10 & 875 & 7.5 & 0.62 \\\\ 50 & 1250 & 8.5 & 0.65 \\\\ 100 & 1425 & 9.0 & 0.66 \\end{array}', description: 'Beirut Airport IDF coefficients' },
      { label: 'Coastal temporal', latex: '\\text{Chicago, } r = 0.35', description: 'Mediterranean front-loaded convective' },
      { label: 'Mountain correction', latex: 'i_{mtn} = i_{coast} \\cdot (1 + 0.35 \\cdot \\Delta z / 1000)', description: 'Mt. Lebanon orographic enhancement (Δz = elevation diff from coast)' },
      { label: 'Mountain temporal', latex: '\\text{Euler Type II, } r = 0.45', description: 'Later peak for orographic enhancement' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF numerator coefficient' },
      { symbol: 'b', meaning: 'Time offset' },
      { symbol: 'c', meaning: 'Duration exponent' },
      { symbol: '\\Delta z', meaning: 'Elevation difference from coastal station (m)' },
    ],
    reference: { title: 'Climat et Hydrologie du Liban', citation: 'Conseil pour l\'Aménagement des Villes (CAV)', year: 2005 },
    notes: 'Mt. Lebanon 35% orographic boost. Coastal uses Chicago r=0.35; mountain uses Euler II r=0.45. 900+ mm annual on western slopes.'
  },

  {
    pattern: 'kuwait_mew',
    name: 'Kuwait MEW',
    category: 'empirical',
    equations: [
      { label: 'Kuwait IDF', latex: 'i(t,T) = K(T) \\cdot t^{-n}', description: 'Power-law IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & K & n \\\\ 2 & 18.5 & 0.42 \\\\ 10 & 43.8 & 0.49 \\\\ 50 & 74.2 & 0.54 \\\\ 100 & 89.1 & 0.56 \\end{array}', description: 'Kuwait City IDF coefficients' },
      { label: 'Segment Distribution', latex: '\\Delta f_d = [0.15, 0.15, 0.20, 0.25, 0.25], \\quad \\Delta f_p = [0.40, 0.25, 0.15, 0.12, 0.08]', description: '5-segment arid flash flood: 40% in first 15% of duration' },
      { label: 'Mass Curve', latex: '\\tau = [0, 0.15, 0.30, 0.50, 0.75, 1.00], \\quad M = [0, 0.40, 0.65, 0.80, 0.92, 1.00]', description: 'Extremely front-loaded cumulative' },
    ],
    variables: [
      { symbol: 'K(T)', meaning: 'IDF coefficient by return period' },
      { symbol: 'n', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Kuwait Stormwater Drainage Manual', citation: 'Ministry of Electricity and Water (MEW)', year: 2008 },
    notes: 'Extremely front-loaded. 40% of depth in first 15% of duration. <120 mm annual mean. Peak ratio 2.67×.'
  },

  {
    pattern: 'bahrain_met',
    name: 'Bahrain Met',
    category: 'empirical',
    equations: [
      { label: 'Gulf Arid Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.25)^{0.70} & t \\leq 0.25 \\\\ 0.55 + 0.30 \\cdot \\frac{t-0.25}{0.35} & 0.25 < t \\leq 0.60 \\\\ 0.85 + 0.15 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Gulf arid storm profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Bahrain Rainfall Analysis for Urban Drainage', citation: 'Bahrain Meteorological Directorate', year: 2012 },
    notes: 'Gulf arid climate (~77 mm/yr). Front-loaded convective. Similar to Kuwait MEW. Peak ratio ~4×.'
  },

  {
    pattern: 'yemen_cama',
    name: 'Yemen CAMA',
    category: 'empirical',
    equations: [
      { label: 'Wadi Flash Profile', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.2)^{0.7} & t \\leq 0.2 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}', description: 'Yemen wadi flash flood storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Wadi Flood Design for Yemen Highlands', citation: 'Civil Aviation and Meteorology Authority (CAMA)', year: 2000 },
    notes: 'Extremely front-loaded. Wadi flash flood design for Hadhramaut and Tihama regions. Peak ratio ~4.5×.'
  },

  // ──── Southeast Asia ────

  {
    pattern: 'myanmar_dmh',
    name: 'Myanmar DMH',
    category: 'empirical',
    equations: [
      { label: 'Yangon IDF', latex: 'i(t,T) = a(T) \\cdot t^{-n}', description: 'Power-law IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & a & n \\\\ 2 & 125.0 & 0.55 \\\\ 10 & 200.0 & 0.58 \\\\ 50 & 280.0 & 0.61 \\\\ 100 & 318.0 & 0.62 \\end{array}', description: 'Yangon IDF coefficients' },
      { label: 'Monsoon mass curve', latex: '\\tau = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]', description: 'Standard monsoon temporal' },
      { label: 'Cumulative', latex: 'M = [0, 0.04, 0.10, 0.20, 0.38, 0.60, 0.76, 0.86, 0.92, 0.97, 1.0]', description: 'Center-peaked monsoon, peak ratio ~2.5×' },
      { label: 'Cyclone Nargis profile', latex: 'M_{Nargis} = [0, 0.02, 0.06, 0.15, 0.35, 0.58, 0.74, 0.85, 0.92, 0.97, 1.0]', description: '12-hr cyclone variant, peak ratio ~3.0×' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF coefficient' },
      { symbol: 'n', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Myanmar Rainfall Climatology', citation: 'Department of Meteorology and Hydrology (DMH), Myanmar', year: 2012 },
    notes: 'Bay of Bengal monsoon. Two temporal profiles: standard monsoon and Cyclone Nargis extreme. Peak at 40–50%.'
  },

  {
    pattern: 'mekong_mrc',
    name: 'Mekong MRC',
    category: 'empirical',
    equations: [
      { label: 'Phnom Penh IDF', latex: 'i(t,T) = a(T) \\cdot t^{-n}', description: 'Power-law IDF (mm/hr, t in minutes)' },
      { label: 'IDF Parameters', latex: '\\begin{array}{ccc} T & a & n \\\\ 2 & 110.0 & 0.54 \\\\ 10 & 176.0 & 0.57 \\\\ 50 & 246.0 & 0.60 \\\\ 100 & 280.0 & 0.61 \\end{array}', description: 'Phnom Penh IDF coefficients' },
      { label: 'MRC mass curve', latex: '\\tau = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]', description: 'Standard MRC regional temporal' },
      { label: 'Cumulative', latex: 'M = [0, 0.04, 0.11, 0.22, 0.40, 0.60, 0.75, 0.86, 0.93, 0.97, 1.0]', description: 'Center-peaked, peak ratio ~2.2×' },
    ],
    variables: [
      { symbol: 'a(T)', meaning: 'IDF coefficient' },
      { symbol: 'n', meaning: 'Duration exponent' },
    ],
    reference: { title: 'Mekong Basin Flood Management Strategy', citation: 'Mekong River Commission (MRC)', year: 2011, link: 'https://www.mrcmekong.org' },
    notes: 'Covers Laos, Thailand, Cambodia, Vietnam. Center-peaked monsoon. 6 countries collaborate. Peak at 40–50%.'
  },

  {
    pattern: 'mononobe',
    name: 'Mononobe (Japan)',
    category: 'intensity',
    equations: [
      { label: 'Classic Mononobe', latex: 'i(t) = \\frac{R_{24}}{24} \\cdot \\left(\\frac{24}{t}\\right)^{2/3}', description: 'Japanese IDF formula (i in mm/hr, t in hours)' },
      { label: 'Generalized', latex: 'i(t) = \\frac{R_a}{a} \\cdot \\left(\\frac{a}{t}\\right)^n', description: 'Generalized form with regional exponent' },
      { label: 'City design depths', latex: '\\begin{array}{cc} \\text{City} & R_{24}(T{=}100) \\\\ \\text{Tokyo} & 350 \\\\ \\text{Osaka} & 300 \\\\ \\text{Nagoya} & 320 \\\\ \\text{Fukuoka} & 380 \\\\ \\text{Naha} & 450 \\end{array}', description: '24-hour design depths (mm) for T=100yr' },
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity (mm/hr)' },
      { symbol: 'R_{24}', meaning: '24-hour design rainfall depth (mm)' },
      { symbol: 't', meaning: 'Duration (hours)' },
      { symbol: 'n', meaning: 'Regional exponent (standard = 2/3)' },
    ],
    reference: { title: 'Mononobe Rainfall Intensity Formula', citation: 'Mononobe, N., Journal of JSCE', year: 1932 },
    notes: 'Classic Japanese IDF. Exponent 2/3 is standard. Use alternating block method for temporal distribution. Still widely used for small-catchment drainage design.'
  },

  {
    pattern: 'uzbekistan_uhm',
    name: 'Uzbekistan UHM',
    category: 'empirical',
    equations: [
      { label: 'Central Asian Arid Profile', latex: 'F(t) = \\begin{cases} 0.45 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.45 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Central Asian arid convective profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Ливневые дожди Узбекистана', citation: 'Узбекское Управление Гидрометеорологии (UHM)', year: 2005 },
    notes: 'Continental arid. Intense short-burst convective. Based on Soviet SNiP with local adaptation. Peak ratio ~3.5×.'
  },

  // ──── Africa Expansion ────

  {
    pattern: 'tunisia_inm',
    name: 'Tunisia INM',
    category: 'empirical',
    equations: [
      { label: 'Tunisian Mediterranean Profile', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Tunisian Mediterranean convective profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Pluies intenses en Tunisie', citation: 'Institut National de la Météorologie (INM), Tunis', year: 2008 },
    notes: 'North African Mediterranean. Front-loaded with peak at 20–30%. Similar to Algeria ANRH. Tell Atlas influence.'
  },

  {
    pattern: 'uganda_unma',
    name: 'Uganda UNMA',
    category: 'empirical',
    equations: [
      { label: 'Equatorial Convective', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.25)^{0.7} & t \\leq 0.25 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.25}{0.35} & 0.25 < t \\leq 0.60 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Equatorial East African convective storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Uganda Rainfall Climatology and Design Standards', citation: 'Uganda National Meteorological Authority (UNMA)', year: 2015 },
    notes: 'Lake Victoria basin influence. Intense convective with peak at 15–25%. Two rainy seasons. Peak ratio ~3.5×.'
  },

  {
    pattern: 'cameroon_ird',
    name: 'Cameroon IRD',
    category: 'empirical',
    equations: [
      { label: 'Tropical Humid Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.2)^{0.65} & t \\leq 0.2 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}', description: 'Tropical humid design storm for Cameroon/Central Africa' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Pluies et crues au Cameroun', citation: 'Institut de Recherche pour le Développement (IRD)', year: 2002 },
    notes: 'Tropical humid zone (Douala, Yaoundé). Very front-loaded squall type. Peak ratio ~4×. Used across Central African Francophone countries.'
  },

  {
    pattern: 'madagascar_dgm',
    name: 'Madagascar DGM',
    category: 'empirical',
    equations: [
      { label: 'Cyclonic Tropical Profile', latex: 'F(t) = \\begin{cases} 0.20 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.20 + 0.50 \\cdot \\frac{t-0.3}{0.35} & 0.3 < t \\leq 0.65 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'Cyclone-influenced tropical profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Cyclones et précipitations à Madagascar', citation: 'Direction Générale de la Météorologie (DGM)', year: 2010 },
    notes: 'SW Indian Ocean cyclone corridor. Center-peaked sustained rainfall. 3–5 cyclones per season. Peak ratio ~2.5×.'
  },

  {
    pattern: 'mauritius_mms',
    name: 'Mauritius MMS',
    category: 'empirical',
    equations: [
      { label: 'Island Cyclonic Profile', latex: 'F(t) = \\begin{cases} 0.25 \\cdot (t/0.35)^{0.8} & t \\leq 0.35 \\\\ 0.25 + 0.45 \\cdot \\frac{t-0.35}{0.3} & 0.35 < t \\leq 0.65 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'Mauritius tropical cyclone design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Mauritius Rainfall and Cyclone Study', citation: 'Mauritius Meteorological Services (MMS)', year: 2014 },
    notes: 'Small island with intense cyclone exposure. Center-peaked. Orographic enhancement on windward side. Peak ratio ~2.8×.'
  },

  {
    pattern: 'cote_ivoire',
    name: 'Côte d\'Ivoire SODECI',
    category: 'empirical',
    equations: [
      { label: 'West African Tropical', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.2)^{0.65} & t \\leq 0.2 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}', description: 'West African tropical convective profile for Abidjan drainage' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Drainage Urbain d\'Abidjan', citation: 'SODECI / Ministère des Infrastructures', year: 2005 },
    notes: 'Abidjan coastal tropical. Very front-loaded squall (60% in first 20%). Similar to CIEH pattern. Peak ratio ~4.5×.'
  },

  {
    pattern: 'namibia_nms',
    name: 'Namibia NMS',
    category: 'empirical',
    equations: [
      { label: 'Semi-Arid Convective', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.25)^{0.7} & t \\leq 0.25 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.25}{0.35} & 0.25 < t \\leq 0.60 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Southern African semi-arid convective' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Namibia Rainfall and Drainage Design', citation: 'Namibia Meteorological Service (NMS)', year: 2012 },
    notes: 'Semi-arid. Front-loaded convective. Peak at 15–25%. Similar to SANRAL for southern Africa.'
  },

  {
    pattern: 'sudan_sma',
    name: 'Sudan SMA',
    category: 'empirical',
    equations: [
      { label: 'Sahel-Savanna Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.2)^{0.65} & t \\leq 0.2 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}', description: 'Sudanese Sahel-savanna haboob and convective storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Khartoum Flood and Drainage Study', citation: 'Sudan Meteorological Authority (SMA)', year: 2008 },
    notes: 'Sahel transitional climate. Extremely front-loaded squall lines. Peak ratio ~5×. Khartoum flash flood design basis.'
  },

  // ──── Latin America & Caribbean ────

  {
    pattern: 'guatemala_insivumeh',
    name: 'Guatemala INSIVUMEH',
    category: 'empirical',
    equations: [
      { label: 'Central American Tropical', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Guatemalan tropical volcanic highland convective' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Análisis de lluvias intensas en Guatemala', citation: 'INSIVUMEH', year: 2010 },
    notes: 'Volcanic highland convective. Peak at 20–30%. Orographic enhancement on Pacific slope. Peak ratio ~3.5×.'
  },

  {
    pattern: 'cuba_insmet',
    name: 'Cuba INSMET',
    category: 'empirical',
    equations: [
      { label: 'Caribbean Tropical Profile', latex: 'F(t) = \\begin{cases} 0.40 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.40 + 0.35 \\cdot \\frac{t-0.3}{0.25} & 0.3 < t \\leq 0.55 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.55}{0.45} & t > 0.55 \\end{cases}', description: 'Cuban Caribbean tropical convective storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Lluvias intensas en Cuba', citation: 'Instituto de Meteorología (INSMET)', year: 2007 },
    notes: 'Caribbean island tropical. Front-loaded convective + hurricane influence. Peak at 25–35%. Peak ratio ~3.0×.'
  },

  {
    pattern: 'dominican_onamet',
    name: 'Dominican Republic ONAMET',
    category: 'empirical',
    equations: [
      { label: 'Hispaniola Tropical', latex: 'F(t) = \\begin{cases} 0.45 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.45 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Hispaniola tropical convective/orographic profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Análisis de precipitaciones de la República Dominicana', citation: 'Oficina Nacional de Meteorología (ONAMET)', year: 2012 },
    notes: 'Hispaniola tropical. Orographic enhancement on Cordillera Central. Peak at 20–30%. Peak ratio ~3.5×.'
  },

  {
    pattern: 'jamaica_msj',
    name: 'Jamaica MSJ',
    category: 'empirical',
    equations: [
      { label: 'Caribbean Island Profile', latex: 'F(t) = \\begin{cases} 0.45 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.45 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Jamaican Blue Mountain convective/orographic profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Jamaica Rainfall and Flood Study', citation: 'Meteorological Service of Jamaica (MSJ)', year: 2010 },
    notes: 'Blue Mountain orographic enhancement. Front-loaded tropical. Peak at 20–30%. Hurricane-adjusted design criteria.'
  },

  {
    pattern: 'trinidad_tobago',
    name: 'Trinidad & Tobago',
    category: 'empirical',
    equations: [
      { label: 'Southern Caribbean', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.25)^{0.7} & t \\leq 0.25 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.25}{0.35} & 0.25 < t \\leq 0.60 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Southern Caribbean ITCZ-influenced convective' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Trinidad Rainfall Intensity-Duration-Frequency', citation: 'Trinidad & Tobago Meteorological Service', year: 2009 },
    notes: 'ITCZ-influenced tropical. Very front-loaded. Peak at 15–25%. Peak ratio ~4.0×. South of hurricane belt.'
  },

  {
    pattern: 'panama_etesa',
    name: 'Panama ETESA',
    category: 'empirical',
    equations: [
      { label: 'Isthmian Tropical', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Panama isthmus tropical convective profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Análisis de lluvias intensas — Cuenca del Canal de Panamá', citation: 'Empresa de Transmisión Eléctrica S.A. (ETESA)', year: 2011 },
    notes: 'Panama Canal watershed design basis. Front-loaded tropical. Peak at 20–30%. 2500+ mm annual on Caribbean slope.'
  },

  {
    pattern: 'honduras_smn',
    name: 'Honduras SMN',
    category: 'empirical',
    equations: [
      { label: 'Central American Tropical', latex: 'F(t) = \\begin{cases} 0.50 \\cdot (t/0.3)^{0.75} & t \\leq 0.3 \\\\ 0.50 + 0.30 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Honduran tropical convective profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Lluvias máximas en Honduras', citation: 'Servicio Meteorológico Nacional (SMN), Honduras', year: 2008 },
    notes: 'Central American tropical. Hurricane corridor (Mitch, Eta). Peak at 20–30%. Peak ratio ~3.5×.'
  },

  {
    pattern: 'paraguay_dmh',
    name: 'Paraguay DMH',
    category: 'empirical',
    equations: [
      { label: 'South American Subtropical', latex: 'F(t) = \\begin{cases} 0.40 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.40 + 0.35 \\cdot \\frac{t-0.3}{0.3} & 0.3 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Paraguay subtropical continental convective' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Precipitaciones intensas del Paraguay', citation: 'Dirección de Meteorología e Hidrología (DMH)', year: 2010 },
    notes: 'Subtropical continental (Chaco/Paraná). Front-loaded convective. Peak at 20–30%. Peak ratio ~3.0×.'
  },

  {
    pattern: 'uruguay_inumet',
    name: 'Uruguay INUMET',
    category: 'empirical',
    equations: [
      { label: 'Río de la Plata Profile', latex: 'F(t) = \\begin{cases} 0.35 \\cdot (t/0.35)^{0.85} & t \\leq 0.35 \\\\ 0.35 + 0.35 \\cdot \\frac{t-0.35}{0.3} & 0.35 < t \\leq 0.65 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'Montevideo subtropical maritime profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Curvas IDF para Uruguay', citation: 'Instituto Uruguayo de Meteorología (INUMET)', year: 2015 },
    notes: 'Subtropical maritime. Center-peaked at 35–65%. Mesoscale convective complexes. Peak ratio ~2.5×.'
  },

  {
    pattern: 'sao_paulo_daee',
    name: 'São Paulo DAEE',
    category: 'empirical',
    equations: [
      { label: 'DAEE Tropical Urban', latex: 'F(t) = \\begin{cases} 0.40 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.40 + 0.35 \\cdot \\frac{t-0.3}{0.25} & 0.3 < t \\leq 0.55 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.55}{0.45} & t > 0.55 \\end{cases}', description: 'São Paulo metropolitan tropical urban design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Equações de Chuvas Intensas do Estado de São Paulo', citation: 'DAEE/CETESB', year: 2014, link: 'https://www.daee.sp.gov.br' },
    notes: 'Brazilian tropical megacity. Urban heat island enhanced convective. Peak at 25–35%. Basis for Tietê/Pinheiros flood management.'
  },

  {
    pattern: 'bogota_eaab',
    name: 'Bogotá EAAB',
    category: 'empirical',
    equations: [
      { label: 'Andean Highland Profile', latex: 'F(t) = \\begin{cases} 0.35 \\cdot (t/0.35)^{0.8} & t \\leq 0.35 \\\\ 0.35 + 0.35 \\cdot \\frac{t-0.35}{0.25} & 0.35 < t \\leq 0.60 \\\\ 0.70 + 0.30 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Bogotá high-altitude Andean convective profile' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Curvas IDF para Bogotá', citation: 'Empresa de Acueducto y Alcantarillado de Bogotá (EAAB)', year: 2011 },
    notes: '2,600 m altitude. Andean convective storms. Center-peaked at 35–60%. Bimodal annual (Apr–May, Oct–Nov). Peak ratio ~2.8×.'
  },

  {
    pattern: 'lima_senamhi',
    name: 'Lima SENAMHI',
    category: 'empirical',
    equations: [
      { label: 'El Niño Extreme Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.25)^{0.7} & t \\leq 0.25 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.25}{0.3} & 0.25 < t \\leq 0.55 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.55}{0.45} & t > 0.55 \\end{cases}', description: 'Coastal desert extreme event driven by El Niño' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Precipitaciones extremas asociadas a El Niño costero', citation: 'SENAMHI Perú', year: 2017, link: 'https://www.senamhi.gob.pe' },
    notes: 'Coastal desert (<10 mm/yr normal) but El Niño Costero produces catastrophic rainfall. Extremely front-loaded. Peak ratio ~4×.'
  },

  // ──── Oceania ────

  {
    pattern: 'png_nws',
    name: 'Papua New Guinea NWS',
    category: 'empirical',
    equations: [
      { label: 'Tropical Maritime', latex: 'F(t) = \\begin{cases} 0.40 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.40 + 0.35 \\cdot \\frac{t-0.3}{0.35} & 0.3 < t \\leq 0.65 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'Tropical maritime design storm for PNG highlands and coastal' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'PNG National Weather Service Design Rainfall', citation: 'PNG National Weather Service (NWS)', year: 2010 },
    notes: 'Tropical maritime with extreme orography. Highland regions receive 4000+ mm/yr. Front-loaded at 20–30%.'
  },

  {
    pattern: 'samoa_met',
    name: 'Samoa Meteorology',
    category: 'empirical',
    equations: [
      { label: 'Pacific Island Tropical', latex: 'F(t) = \\begin{cases} 0.35 \\cdot (t/0.3)^{0.8} & t \\leq 0.3 \\\\ 0.35 + 0.40 \\cdot \\frac{t-0.3}{0.35} & 0.3 < t \\leq 0.65 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.65}{0.35} & t > 0.65 \\end{cases}', description: 'South Pacific tropical cyclone/SPCZ design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Samoa Meteorological Service Climate Data', citation: 'Samoa Meteorology Division', year: 2012 },
    notes: 'South Pacific Convergence Zone (SPCZ) influence. Cyclone and SPCZ rainfall. Center-peaked. 3000+ mm/yr.'
  },

  {
    pattern: 'hawaii_distinct',
    name: 'Hawaii Distinct',
    category: 'empirical',
    equations: [
      { label: 'Orographic Trade Wind', latex: 'F(t) = \\frac{1 - \\cos(\\pi t)}{2}', description: 'Sustained trade wind orographic rainfall (cosine distribution)' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' },
    ],
    reference: { title: 'Rainfall Atlas of Hawaii', citation: 'Giambelluca, T.W. et al., University of Hawaii', year: 2013, link: 'http://rainfall.geography.hawaii.edu' },
    notes: 'Trade wind orographic: sustained, nearly uniform. Kona storms are convective. Mt Waialeale wettest spot on Earth. Peak ratio ~1.6×.'
  },

  // ──── US Regional ────

  {
    pattern: 'caltrans',
    name: 'Caltrans',
    category: 'empirical',
    equations: [
      { label: 'California IDF Profile', latex: 'F(t) = \\begin{cases} 0.30 \\cdot (t/0.4)^{0.85} & t \\leq 0.4 \\\\ 0.30 + 0.45 \\cdot \\frac{t-0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Caltrans highway drainage design storm for California' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Caltrans Highway Design Manual — Hydrology', citation: 'California Department of Transportation', year: 2019, link: 'https://dot.ca.gov/programs/design' },
    notes: 'California highway drainage. Center-peaked (40–60%). Mediterranean climate adaptation. Used statewide for DOT projects.'
  },

  {
    pattern: 'harris_county_fcd',
    name: 'Harris County FCD',
    category: 'empirical',
    equations: [
      { label: 'Houston Profile', latex: 'F(t) = \\begin{cases} 0.25 \\cdot (t/0.4)^{0.9} & t \\leq 0.4 \\\\ 0.25 + 0.50 \\cdot \\frac{t-0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Harris County (Houston) flood control design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Harris County Flood Control District Hydrology & Hydraulics Guidance Manual', citation: 'Harris County FCD', year: 2018 },
    notes: 'Houston/Gulf Coast tropical. Center-peaked (40–60%). Post-Harvey updated criteria. Peak ratio ~4.5×.'
  },

  {
    pattern: 'maricopa_fcd',
    name: 'Maricopa County FCD',
    category: 'empirical',
    equations: [
      { label: 'Desert Southwest Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.25)^{0.7} & t \\leq 0.25 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.25}{0.35} & 0.25 < t \\leq 0.60 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.60}{0.40} & t > 0.60 \\end{cases}', description: 'Phoenix/Maricopa monsoon flash flood design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Drainage Design Manual for Maricopa County', citation: 'Flood Control District of Maricopa County (FCDMC)', year: 2020, link: 'https://www.maricopa.gov/625' },
    notes: 'Arizona desert monsoon. Extremely front-loaded. Peak at 15–25%. North American Monsoon thunderstorms. Peak ratio ~4.5×.'
  },

  {
    pattern: 'la_county',
    name: 'LA County DPW',
    category: 'empirical',
    equations: [
      { label: 'Los Angeles Profile', latex: 'F(t) = \\begin{cases} 0.30 \\cdot (t/0.4)^{0.85} & t \\leq 0.4 \\\\ 0.30 + 0.45 \\cdot \\frac{t-0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'LA County Department of Public Works drainage design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Hydrology Manual', citation: 'Los Angeles County Department of Public Works', year: 2006, link: 'https://dpw.lacounty.gov/wrd/publication/engineering/2006_Hydrology_Manual' },
    notes: 'Mediterranean climate. Center-peaked (40–60%). Post-fire debris flow considerations. Used with LA County IDF curves.'
  },

  {
    pattern: 'clark_county_nv',
    name: 'Clark County NV',
    category: 'empirical',
    equations: [
      { label: 'Las Vegas Desert Profile', latex: 'F(t) = \\begin{cases} 0.55 \\cdot (t/0.2)^{0.65} & t \\leq 0.2 \\\\ 0.55 + 0.25 \\cdot \\frac{t-0.2}{0.3} & 0.2 < t \\leq 0.5 \\\\ 0.80 + 0.20 \\cdot \\frac{t-0.5}{0.5} & t > 0.5 \\end{cases}', description: 'Las Vegas Valley desert flash flood design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Clark County Regional Flood Control District Hydrologic Criteria', citation: 'CCRFCD', year: 2017 },
    notes: 'Mojave Desert monsoon/convective. Extremely front-loaded. Peak at 10–20%. 100 mm annual mean. Peak ratio ~5×.'
  },

  {
    pattern: 'philadelphia_pwd',
    name: 'Philadelphia PWD',
    category: 'empirical',
    equations: [
      { label: 'Northeast US Profile', latex: 'F(t) = \\begin{cases} 0.25 \\cdot (t/0.4)^{0.9} & t \\leq 0.4 \\\\ 0.25 + 0.50 \\cdot \\frac{t-0.4}{0.2} & 0.4 < t \\leq 0.6 \\\\ 0.75 + 0.25 \\cdot \\frac{t-0.6}{0.4} & t > 0.6 \\end{cases}', description: 'Philadelphia Water Department combined sewer design storm' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
    ],
    reference: { title: 'Philadelphia Stormwater Management Guidance Manual', citation: 'Philadelphia Water Department (PWD)', year: 2018, link: 'https://www.phila.gov/water' },
    notes: 'Northeast US combined sewer system. Center-peaked at 40–60%. Green infrastructure design basis. Peak ratio ~4×.'
  },

  {
    pattern: 'illinois_b75',
    name: 'Illinois Bulletin 75',
    category: 'empirical',
    equations: [
      { label: 'Huff-Based Midwest', latex: 'F(t) = \\text{Huff 2nd Quartile (50\\% probability)}', description: 'Illinois State Water Survey Bulletin 75 design storm (Huff 2nd quartile basis)' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction (Huff 2nd quartile median curve)' },
    ],
    reference: { title: 'Bulletin 75: Frequency Distributions and Hydroclimatic Characteristics of Heavy Rainstorms in Illinois', citation: 'Huff, F.A. & Angel, J.R., Illinois State Water Survey', year: 1992, link: 'https://www.isws.illinois.edu' },
    notes: 'Illinois/Midwest standard. Uses Huff 2nd quartile median curve. Required for IDOT highway drainage. Peak at 25–50% of duration.'
  },

  // ──── Mathematical/Parametric & Storm Mechanisms ────
  // (Detailed entries with full LaTeX, mass curves, and IDF parameters are in the sections below)

  // ──── Climate Change Variants ────

  {
    pattern: 'ukcp18_enhanced',
    name: 'UKCP18 Enhanced',
    category: 'empirical',
    equations: [
      { label: 'Climate Uplift', latex: 'P_{2080} = P_{base} \\cdot (1 + U_{rcp85})', description: 'UKCP18 RCP8.5 2080s climate uplift applied to FEH design storm' },
      { label: 'Uplift Factor', latex: 'U_{rcp85} = 0.20 \\text{ to } 0.40 \\text{ (region-dependent)}', description: '20–40% rainfall depth increase for 2080s high-emission scenario' },
    ],
    variables: [
      { symbol: 'P_{2080}', meaning: 'Climate-adjusted design depth for 2080s' },
      { symbol: 'P_{base}', meaning: 'Current baseline design depth' },
      { symbol: 'U_{rcp85}', meaning: 'UKCP18 RCP8.5 uplift factor' },
    ],
    reference: { title: 'UKCP18 Science Overview Report', citation: 'Met Office Hadley Centre', year: 2018, link: 'https://www.metoffice.gov.uk/research/approach/collaboration/ukcp' },
    notes: 'UK-specific climate projection. Applied to FEH design storm base. Required for Environment Agency flood risk assessments. Uses RCP8.5 2080s.'
  },

  {
    pattern: 'super_cc',
    name: 'Super Clausius-Clapeyron (14%/°C)',
    category: 'intensity',
    equations: [
      { label: 'Super-CC Scaling', latex: '\\frac{di_{peak}}{dT} \\approx 14\\%/°\\text{C}', description: 'Sub-hourly intensities scale at ~14%/°C (2× Clausius-Clapeyron)' },
      { label: 'Scaled Peak', latex: 'i_{peak,future} = i_{peak,base} \\cdot (1.14)^{\\Delta T}', description: 'Future peak intensity with super-CC scaling' },
    ],
    variables: [
      { symbol: 'i_{peak,future}', meaning: 'Future peak intensity' },
      { symbol: 'i_{peak,base}', meaning: 'Historical peak intensity' },
      { symbol: '\\Delta T', meaning: 'Temperature change (°C)' },
    ],
    reference: { title: 'Increase in Hourly Precipitation Extremes Beyond Expectations from Temperature Changes', citation: 'Lenderink, G. & van Meijgaard, E., Nature Geoscience', year: 2008, link: 'https://doi.org/10.1038/ngeo262' },
    notes: 'Sub-hourly rainfall intensities can exceed CC scaling (7%/°C). Observed 14%/°C in Netherlands, Belgium. Critical for urban drainage future-proofing.'
  },

  {
    pattern: 'neyman_scott',
    name: 'Neyman-Scott Rectangular Pulse',
    category: 'intensity',
    equations: [
      { label: 'Cluster Process', latex: 'N(t) \\sim \\text{Poisson}(\\lambda)', description: 'Storm origins arrive as Poisson process' },
      { label: 'Cell Generation', latex: 'C_j \\sim \\text{Poisson}(\\mu_c)', description: 'Each storm generates random number of cells' },
      { label: 'Superposition', latex: 'i(t) = \\sum_j \\sum_k X_k \\cdot \\mathbb{1}_{[t_{j,k},\\, t_{j,k}+L_k]}(t)', description: 'Total intensity from overlapping rectangular pulses' },
    ],
    variables: [
      { symbol: '\\lambda', meaning: 'Storm arrival rate' },
      { symbol: '\\mu_c', meaning: 'Mean number of cells per storm' },
      { symbol: 'X_k', meaning: 'Cell intensity (Exponentially distributed)' },
      { symbol: 'L_k', meaning: 'Cell duration (Exponentially distributed)' },
    ],
    reference: { title: 'A Stochastic Model of Rainfall for Hydrological Simulation', citation: 'Cowpertwait, P.S.P., J. Hydrol.', year: 1991 },
    notes: 'Cluster point process model. More structured than Bartlett-Lewis. 5 parameters. Used for continuous simulation. Produces realistic temporal patterns.'
  },

  // ──── Spanish & US Research ────

  {
    pattern: 'temez_spain',
    name: 'Témez (Spain)',
    category: 'cumulative',
    equations: [
      { label: 'Témez Cumulative', latex: 'F(t) = 1 - \\left(1 - \\frac{t}{D}\\right)^{\\beta}', description: 'Spanish power-law cumulative distribution' },
      { label: 'Exponent', latex: '\\beta = \\frac{I_d}{\\bar{i}} = \\frac{I_d \\cdot D}{P}', description: 'Shape exponent from IDF curve intensity ratio' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: '\\beta', meaning: 'Shape exponent (typically 3–6)' },
      { symbol: 'I_d', meaning: 'IDF curve intensity for duration d' },
      { symbol: '\\bar{i}', meaning: 'Average intensity (P/D)' },
    ],
    reference: { title: 'Cálculo Hidrometeorológico de Caudales Máximos en Pequeñas Cuencas Naturales', citation: 'Témez, J.R., Dirección General de Carreteras', year: 1991 },
    notes: 'Spanish standard for highway drainage. IDF-derived shape. Required by Dirección General de Carreteras. Front-loaded power-law.'
  },

  {
    pattern: 'bonta_usda',
    name: 'Bonta USDA',
    category: 'empirical',
    equations: [
      { label: 'Dimensionless Hyetograph', latex: 'F(t) = \\sum_{j=1}^{4} a_j \\cdot t^j', description: '4th-order polynomial fit to dimensionless mass curve' },
    ],
    variables: [
      { symbol: 'F(t)', meaning: 'Cumulative rainfall fraction' },
      { symbol: 'a_j', meaning: 'Polynomial coefficients (fitted to regional data)' },
      { symbol: 't', meaning: 'Dimensionless time (t/D)' },
    ],
    reference: { title: 'Development and Evaluation of Dimensionless Design Hyetographs', citation: 'Bonta, J.V. & Rao, A.R., USDA-ARS', year: 1988 },
    notes: 'USDA Agricultural Research Service. Data-driven polynomial fit to observed storms. Midwest US agricultural watersheds. Quartile-classified.'
  },

  // ════════════════════════════════════════════════════
  // MATHEMATICAL DISTRIBUTIONS (#138–#152)
  // ════════════════════════════════════════════════════

  {
    pattern: 'parabolic' as PatternType,
    name: 'Parabolic',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\frac{6P}{D^2} \\cdot t \\cdot (D - t)', description: 'Symmetric parabolic intensity profile' },
      { label: 'Cumulative Mass', latex: 'M(t) = 3\\left(\\frac{t}{D}\\right)^2 - 2\\left(\\frac{t}{D}\\right)^3', description: 'S-curve cumulative distribution' },
      { label: 'Peak Intensity', latex: 'i_{peak} = \\frac{3P}{2D} = 1.5\\bar{i}', description: 'Peak at centre is 1.5× average' },
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Intensity at time t' },
      { symbol: 'P', meaning: 'Total storm depth' },
      { symbol: 'D', meaning: 'Total duration' },
    ],
    reference: { title: 'Synthetic Storm Profiles', citation: 'Standard hydrologic textbooks', year: 1970 },
    notes: 'Symmetric, smooth, peak at D/2. Peak ratio 1.5×. Zero intensity at boundaries. Special case of Power Curve (n=1, m=1).'
  },

  {
    pattern: 'cosine_storm' as PatternType,
    name: 'Cosine / Raised Cosine',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\frac{P}{D}\\left[1 + A\\cos\\left(\\frac{2\\pi(t - t_p)}{D}\\right)\\right]', description: 'Cosine modulation around average intensity' },
      { label: 'Cumulative', latex: 'M(t) = \\frac{t}{D} + \\frac{A \\cdot D}{2\\pi}\\left[\\sin\\!\\frac{2\\pi(t-t_p)}{D} - \\sin\\!\\frac{-2\\pi t_p}{D}\\right]', description: 'Integrated cumulative mass curve' },
    ],
    variables: [
      { symbol: 'A', meaning: 'Amplitude (0 < A ≤ 1); A=0 → uniform, A=1 → peak 2× avg' },
      { symbol: 't_p', meaning: 'Time of peak intensity' },
    ],
    reference: { title: 'Harmonic Storm Profiles', citation: 'Signal processing approach to hydrology', year: 1985 },
    notes: 'C∞ continuous — no discontinuities. A=1 gives peak ratio 2.0×. A=0.5 gives 1.5×. Smooth everywhere.'
  },

  {
    pattern: 'lognormal_temporal' as PatternType,
    name: 'Log-Normal Temporal',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\frac{P}{t \\sigma \\sqrt{2\\pi}} \\exp\\!\\left(-\\frac{(\\ln t - \\mu)^2}{2\\sigma^2}\\right)', description: 'Log-normal PDF scaled to total depth' },
      { label: 'Cumulative', latex: 'M(t) = P \\cdot \\Phi\\!\\left(\\frac{\\ln t - \\mu}{\\sigma}\\right)', description: 'Standard normal CDF of log-transformed time' },
      { label: 'Peak Time', latex: 't_p = e^{\\mu - \\sigma^2}', description: 'Mode of the distribution' },
    ],
    variables: [
      { symbol: '\\mu', meaning: 'Log-mean parameter: μ = ln(tₚ) + σ²' },
      { symbol: '\\sigma', meaning: 'Shape: 0.3 mild skew, 0.5 moderate, 0.8 strong' },
      { symbol: '\\Phi', meaning: 'Standard normal CDF' },
    ],
    reference: { title: 'Statistical Methods in Hydrology', citation: 'Stedinger, Vogel & Foufoula-Georgiou', year: 1993 },
    notes: 'Right-skewed — realistic for convective storms. σ controls peakedness (0.3→2.0×, 0.5→2.5×, 0.8→3.5× peak ratio).'
  },

  {
    pattern: 'exponential_decay_storm' as PatternType,
    name: 'Exponential Decay',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = i_0 \\cdot e^{-kt}', description: 'Exponentially decaying intensity from maximum at t=0' },
      { label: 'Initial Intensity', latex: 'i_0 = \\frac{Pk}{1 - e^{-kD}}', description: 'Normalised so total depth = P' },
      { label: 'Cumulative Mass', latex: 'M(t) = \\frac{1 - e^{-kt}}{1 - e^{-kD}}', description: 'Dimensionless cumulative fraction' },
      { label: 'Peak Ratio', latex: '\\text{ratio} = \\frac{kD}{1 - e^{-kD}}', description: 'kD=1→1.58×, kD=2→2.31×, kD=3→3.16×, kD=5→5.03×' },
    ],
    variables: [
      { symbol: 'k', meaning: 'Decay rate parameter (1/time)' },
      { symbol: 'i_0', meaning: 'Initial (peak) intensity at t=0' },
    ],
    reference: { title: 'Exponential Storm Decay Models', citation: 'Various hydrology references', year: 1975 },
    notes: 'Always front-loaded (peak at t=0). kD controls peakedness. Common for short convective bursts and post-frontal decay.'
  },

  {
    pattern: 'inverse_exponential' as PatternType,
    name: 'Inverse Exponential (Rise-Decay)',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = C\\left(1 - e^{-\\alpha t}\\right) e^{-\\beta(t-t_p)^2}', description: 'Gradual onset with Gaussian-shaped peak and recession' },
      { label: 'Normalisation', latex: 'C = \\frac{P}{\\int_0^D (1-e^{-\\alpha t})\\,e^{-\\beta(t-t_p)^2}\\,dt}', description: 'Constant ensuring total depth equals P' },
    ],
    variables: [
      { symbol: '\\alpha', meaning: 'Rise rate — controls onset steepness' },
      { symbol: '\\beta', meaning: 'Decay rate — controls recession width' },
      { symbol: 't_p', meaning: 'Nominal peak time' },
      { symbol: 'C', meaning: 'Normalising constant (numerical integration)' },
    ],
    reference: { title: 'Frontal Storm Modelling', citation: 'Synthetic hyetograph research', year: 1995 },
    notes: 'Models slow-building frontal storms with gradual rise and peaked recession. 3 shape parameters give high flexibility.'
  },

  {
    pattern: 'power_curve_storm' as PatternType,
    name: 'Power Curve (Beta-type)',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = C \\cdot t^n (D-t)^m', description: 'Generalised beta-type intensity profile' },
      { label: 'Normalisation', latex: 'C = \\frac{P \\cdot \\Gamma(n+m+2)}{D^{n+m+1} \\cdot \\Gamma(n+1) \\cdot \\Gamma(m+1)}', description: 'Normalising constant via Gamma functions' },
      { label: 'Cumulative', latex: 'M(t) = I_{t/D}(n+1,\\, m+1)', description: 'Regularised incomplete beta function' },
      { label: 'Peak Time', latex: 't_p = D \\cdot \\frac{n}{n+m}', description: 'Peak position controlled by exponent ratio' },
    ],
    variables: [
      { symbol: 'n', meaning: 'Rising limb exponent' },
      { symbol: 'm', meaning: 'Falling limb exponent' },
      { symbol: '\\Gamma', meaning: 'Gamma function' },
      { symbol: 'I_x(a,b)', meaning: 'Regularised incomplete beta function' },
    ],
    reference: { title: 'Beta Distribution in Hydrology', citation: 'Chow, Maidment & Mays, Applied Hydrology', year: 1988 },
    notes: 'n=m symmetric; n<m front-loaded; n>m back-loaded. Special cases: n=m=1 → parabolic, n=0,m=0 → block, n=2,m=1 ≈ SCS Type II.'
  },

  {
    pattern: 'weibull_temporal' as PatternType,
    name: 'Weibull Temporal',
    category: 'cumulative',
    equations: [
      { label: 'CDF (Mass Curve)', latex: 'M(t) = \\frac{1 - e^{-(t/\\lambda)^k}}{1 - e^{-(D/\\lambda)^k}}', description: 'Normalised Weibull CDF over storm duration' },
      { label: 'Intensity (PDF)', latex: 'i(t) = P \\cdot \\frac{k}{\\lambda}\\left(\\frac{t}{\\lambda}\\right)^{k-1} \\frac{e^{-(t/\\lambda)^k}}{1-e^{-(D/\\lambda)^k}}', description: 'Weibull PDF scaled to total depth' },
      { label: 'Peak Time', latex: 't_p = \\lambda\\left(\\frac{k-1}{k}\\right)^{1/k}, \\quad k > 1', description: 'Mode of the distribution' },
    ],
    variables: [
      { symbol: 'k', meaning: 'Shape: k=1 exponential, k=2 Rayleigh, k=3.6 ≈ normal' },
      { symbol: '\\lambda', meaning: 'Scale parameter (controls peak timing)' },
    ],
    reference: { title: 'Weibull Distribution in Rainfall Analysis', citation: 'Sivapalan & Blöschl, Water Resources Research', year: 1998 },
    notes: 'k=1 reduces to exponential decay. k=2 Rayleigh-like moderate peak. k>3.6 platykurtic (broad, flat). Very flexible 2-parameter model.'
  },

  {
    pattern: 'instantaneous_burst' as PatternType,
    name: 'Instantaneous Burst',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\begin{cases} P/\\Delta t & t_0 \\leq t < t_0 + \\Delta t \\\\ 0 & \\text{otherwise} \\end{cases}', description: 'All rainfall delivered in single time step' },
      { label: 'Cumulative', latex: 'M(t) = \\begin{cases} 0 & t < t_0 \\\\ P(t-t_0)/\\Delta t & t_0 \\leq t < t_0+\\Delta t \\\\ P & t \\geq t_0+\\Delta t \\end{cases}', description: 'Step function mass curve' },
      { label: 'Peak Ratio', latex: '\\text{ratio} = D / \\Delta t \\to \\infty', description: 'Approaches infinity as time step decreases' },
    ],
    variables: [
      { symbol: 't_0', meaning: 'Burst start time (default: 0)' },
      { symbol: '\\Delta t', meaning: 'Minimum model time step' },
    ],
    reference: { title: 'Impulse Response Testing', citation: 'Numerical methods in hydrology', year: 1980 },
    notes: 'Theoretical worst-case impulse. Use for pipe surcharge testing, numerical stability testing, and system impulse response analysis.'
  },

  {
    pattern: 'uniform_random' as PatternType,
    name: 'Uniform Random (Stochastic)',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(j) = \\frac{P \\cdot X_j}{\\Delta t \\cdot \\sum_k X_k}, \\quad X_j \\sim U(0,1)', description: 'Normalised random intensities preserving total depth' },
    ],
    variables: [
      { symbol: 'X_j', meaning: 'Independent uniform random variables on [0,1]' },
      { symbol: 'P', meaning: 'Total depth (preserved exactly)' },
      { symbol: '\\Delta t', meaning: 'Time step' },
    ],
    reference: { title: 'Monte Carlo Methods in Hydrology', citation: 'Bras & Rodriguez-Iturbe', year: 1985 },
    notes: 'Each realisation is different. Average profile → uniform (block rain). For Monte Carlo uncertainty analysis. Set seed for reproducibility.'
  },

  {
    pattern: 'bimodal_gaussian' as PatternType,
    name: 'Bimodal Gaussian',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = C\\left[w_1 e^{-\\frac{(t-\\mu_1)^2}{2\\sigma_1^2}} + w_2 e^{-\\frac{(t-\\mu_2)^2}{2\\sigma_2^2}}\\right]', description: 'Weighted sum of two Gaussian peaks' },
      { label: 'Normalisation', latex: 'C = \\frac{P}{\\int_0^D [w_1 G_1(t) + w_2 G_2(t)]\\,dt}', description: 'Ensures total depth = P' },
    ],
    variables: [
      { symbol: '\\mu_1, \\mu_2', meaning: 'Peak times (defaults: 0.30D, 0.70D)' },
      { symbol: '\\sigma_1, \\sigma_2', meaning: 'Peak widths (defaults: 0.08D, 0.10D)' },
      { symbol: 'w_1, w_2', meaning: 'Weights (w₁+w₂=1; defaults: 0.60, 0.40)' },
    ],
    reference: { title: 'Multi-Peak Storm Analysis', citation: 'Various urban hydrology research', year: 1990 },
    notes: 'Models frontal passage (warm + cold front) or tropical squall + trailing stratiform. 5 degrees of freedom for flexible double-peak shapes.'
  },

  {
    pattern: 'piecewise_linear' as PatternType,
    name: 'Piecewise Linear',
    category: 'cumulative',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\frac{P}{D} \\cdot \\frac{m_{k+1} - m_k}{\\tau_{k+1} - \\tau_k}, \\quad \\tau_k \\leq \\frac{t}{D} < \\tau_{k+1}', description: 'Constant intensity within each segment (slope of mass curve)' },
    ],
    variables: [
      { symbol: '(\\tau_k, m_k)', meaning: 'User-defined breakpoints on dimensionless mass curve' },
      { symbol: '\\tau', meaning: 'Dimensionless time t/D ∈ [0,1]' },
      { symbol: 'm', meaning: 'Dimensionless cumulative depth M(τ)/P ∈ [0,1]' },
    ],
    reference: { title: 'Custom Hyetograph Construction', citation: 'Standard engineering practice', year: 1970 },
    notes: 'User defines N breakpoints. Constraints: τ₁=0,m₁=0; τₙ=1,mₙ=1; monotonically increasing. Linear interpolation between points.'
  },

  {
    pattern: 'gamma_distribution' as PatternType,
    name: 'Gamma Distribution',
    category: 'intensity',
    equations: [
      { label: 'Intensity (PDF)', latex: 'i(t) = \\frac{P \\cdot t^{\\alpha-1} e^{-t/\\beta}}{\\beta^\\alpha \\Gamma(\\alpha) \\cdot \\int_0^D f(s)\\,ds}', description: 'Gamma PDF normalised over storm duration' },
      { label: 'Cumulative', latex: 'M(t) = P \\cdot \\frac{\\gamma(\\alpha, t/\\beta)}{\\gamma(\\alpha, D/\\beta)}', description: 'Lower incomplete gamma function ratio' },
      { label: 'Peak Time', latex: 't_p = (\\alpha - 1)\\beta, \\quad \\alpha \\geq 1', description: 'Mode of the gamma distribution' },
    ],
    variables: [
      { symbol: '\\alpha', meaning: 'Shape: α=1 exponential, α=2 right-skewed, α→∞ normal' },
      { symbol: '\\beta', meaning: 'Scale parameter (controls timing)' },
      { symbol: '\\gamma(a,x)', meaning: 'Lower incomplete gamma function' },
    ],
    reference: { title: 'Gamma Distribution in Rainfall Modelling', citation: 'Wilks, D.S., Statistical Methods in the Atmospheric Sciences', year: 2011 },
    notes: 'α=1 exponential decay; α=2 right-skewed peak at β; α=5 moderately peaked. Very flexible 2-parameter family.'
  },

  {
    pattern: 'gumbel_temporal' as PatternType,
    name: 'Gumbel Temporal',
    category: 'intensity',
    equations: [
      { label: 'Intensity (PDF)', latex: 'i(t) = \\frac{P}{\\beta} \\cdot \\frac{\\exp\\!\\left[-\\frac{t-\\mu}{\\beta} - e^{-(t-\\mu)/\\beta}\\right]}{M_{norm}}', description: 'Gumbel PDF as temporal distribution' },
      { label: 'CDF (Mass Curve)', latex: 'M(t) = P \\cdot \\frac{\\exp(-e^{-(t-\\mu)/\\beta})}{\\exp(-e^{-(D-\\mu)/\\beta})}', description: 'Normalised Gumbel CDF' },
    ],
    variables: [
      { symbol: '\\mu', meaning: 'Location parameter (peak time, mode of Gumbel)' },
      { symbol: '\\beta', meaning: 'Scale parameter (controls spread)' },
      { symbol: 'M_{norm}', meaning: 'Normalisation constant over [0, D]' },
    ],
    reference: { title: 'Extreme Value Theory in Rainfall', citation: 'Coles, S., An Introduction to Statistical Modeling of Extreme Values', year: 2001 },
    notes: 'Right-skewed with heavy right tail. Good for modeling extreme rainfall events. Peak at t=μ.'
  },

  {
    pattern: 'sigmoid_mass' as PatternType,
    name: 'Sigmoid / Logistic Mass Curve',
    category: 'cumulative',
    equations: [
      { label: 'Cumulative', latex: 'M(t) = P \\cdot \\frac{L(t) - L(0)}{L(D) - L(0)}, \\quad L(t) = \\frac{1}{1+e^{-k(t-t_0)}}', description: 'Logistic S-curve normalised to [0, P]' },
      { label: 'Intensity', latex: 'i(t) = \\frac{Pk \\cdot e^{-k(t-t_0)}}{(1+e^{-k(t-t_0)})^2 \\cdot [L(D)-L(0)]}', description: 'Derivative of logistic function' },
      { label: 'Peak Ratio', latex: '\\text{ratio} \\approx kD/4', description: 'Approximate peak-to-average ratio for kD ≫ 1' },
    ],
    variables: [
      { symbol: 'k', meaning: 'Steepness: k→0 uniform, k→∞ instantaneous burst' },
      { symbol: 't_0', meaning: 'Inflection point (time of peak intensity)' },
    ],
    reference: { title: 'Logistic Growth Curves in Storm Modelling', citation: 'Applied mathematics approach', year: 2000 },
    notes: 'Elegant S-curve mass curve. Peak at t=t₀. k controls sharpness. Smooth and differentiable everywhere.'
  },

  {
    pattern: 'bezier_curve' as PatternType,
    name: 'Bézier Curve',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve', latex: 'M(\\tau) = (1-u)^3 P_0 + 3(1-u)^2 u\\,P_1 + 3(1-u)u^2\\,P_2 + u^3 P_3', description: 'Cubic Bézier between control points' },
      { label: 'Intensity', latex: 'i(t) = \\frac{P}{D} \\cdot \\frac{dM}{d\\tau}', description: 'Slope of mass curve scaled to physical units' },
      { label: 'Derivative', latex: '\\frac{dM}{d\\tau} = 3(1-u)^2(P_1-P_0) + 6(1-u)u(P_2-P_1) + 3u^2(P_3-P_2)', description: 'Tangent vector gives local intensity' },
    ],
    variables: [
      { symbol: 'P_0, P_3', meaning: 'Endpoint control points (fixed at (0,0) and (1,1))' },
      { symbol: 'P_1, P_2', meaning: 'Handle points controlling curvature (user-draggable)' },
      { symbol: 'u', meaning: 'Local parameter within segment [0,1]' },
    ],
    reference: { title: 'Parametric Curve Methods', citation: 'Computer-aided design applied to hydrology', year: 2010 },
    notes: 'User drags control points in GUI. Constraints: M(0)=0, M(1)=1, dM/dτ≥0 (monotonicity). Exported as (τ,M) lookup table.'
  },

  // ════════════════════════════════════════════════════
  // SPECIALIZED STORM SCENARIOS (#153–#170)
  // ════════════════════════════════════════════════════

  {
    pattern: 'atmospheric_river' as PatternType,
    name: 'Atmospheric River',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (48-hr)', latex: 'M(\\tau) = \\text{interp}(\\tau_{AR},\\, M_{AR})', description: 'Tabulated dimensionless mass curve for atmospheric river events' },
    ],
    variables: [
      { symbol: '\\tau_{AR}', meaning: 'τ=[0,.02,.04,.06,.08,.10,.15,.20,.25,.30,.35,.40,.45,.50,.55,.60,.65,.70,.75,.80,.85,.90,.95,1]' },
      { symbol: 'M_{AR}', meaning: 'M=[0,.01,.02,.03,.05,.07,.12,.18,.25,.33,.42,.51,.59,.66,.72,.78,.83,.87,.91,.94,.96,.98,.99,1]' },
    ],
    reference: { title: 'Atmospheric Rivers and Extreme Precipitation', citation: 'Ralph, F.M. et al., Nature Geoscience', year: 2006 },
    notes: 'Peak 35–55% of duration (broad). Peak ratio ~1.6×. Duration 24–72 hr. Sustained moderate intensity. Total depths 200–400+ mm.'
  },

  {
    pattern: 'medicane' as PatternType,
    name: 'Medicane (Mediterranean Hurricane)',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (18-hr)', latex: 'M(\\tau) = \\text{interp}(\\tau_{med},\\, M_{med})', description: 'Medicane temporal profile with concentrated core rainfall' },
    ],
    variables: [
      { symbol: '\\tau_{med}', meaning: '19-point dimensionless time array' },
      { symbol: 'M_{med}', meaning: 'M=[0,.01,.03,.05,.08,.14,.24,.38,.52,.64,.73,.80,.85,.89,.92,.95,.97,.99,1]' },
    ],
    reference: { title: 'Medicane Climatology and Impact', citation: 'Cavicchia et al., J. Climate', year: 2014 },
    notes: 'Peak 30–45% of duration. Peak ratio ~2.8×. Multi-peak possible (outer + inner bands). Rare but devastating Mediterranean events.'
  },

  {
    pattern: 'polar_low' as PatternType,
    name: 'Polar Low',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (6-hr)', latex: 'M = [0, 0.05, 0.15, 0.30, 0.50, 0.68, 0.80, 0.88, 0.94, 0.98, 1.0]', description: 'Compact intense storm at high latitudes' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '[0, 0.1, 0.2, ..., 1.0] dimensionless time' },
    ],
    reference: { title: 'Polar Lows: Mesoscale Weather Systems in the Polar Regions', citation: 'Rasmussen & Turner, Cambridge UP', year: 2003 },
    notes: 'Peak 30–40%. Peak ratio ~2.2×. Duration 3–12 hr. Mixed precipitation (snow possible). Arctic/sub-Arctic maritime.'
  },

  {
    pattern: 'cutoff_low' as PatternType,
    name: 'Cut-Off Low',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (72-hr)', latex: 'M(\\tau) = \\text{interp}(\\tau_{COL},\\, M_{COL})', description: 'Very long duration, broad peak, extreme total depths' },
    ],
    variables: [
      { symbol: '\\tau_{COL}', meaning: '25-point dimensionless time array' },
      { symbol: 'M_{COL}', meaning: 'M=[0,.01,.02,.04,.06,.09,.12,.16,.21,.27,.33,.40,.48,.55,.62,.68,.74,.79,.84,.88,.92,.95,.97,.99,1]' },
    ],
    reference: { title: 'Cut-Off Low Systems and Extreme Rainfall', citation: 'Singleton & Reason, Int. J. Climatol.', year: 2007 },
    notes: 'Peak 45–55% (centred). Peak ratio ~1.4× (very broad). Duration 48–120 hr. Extreme total depths despite low intensity.'
  },

  {
    pattern: 'mcs_storm' as PatternType,
    name: 'Mesoscale Convective System (MCS)',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (12-hr)', latex: 'M = [0,.01,.03,.06,.12,.22,.38,.54,.66,.78,.85,.90,.93,.96,.98,.99,1]', description: 'Leading convective line with trailing stratiform' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '17-point dimensionless time array' },
    ],
    reference: { title: 'Mesoscale Convective Systems', citation: 'Houze, R.A., Cloud Dynamics', year: 2014 },
    notes: 'Peak 20–35%. Peak ratio ~3.0×. Multiple embedded cells create sub-peaks. Optional noise for cell variability.'
  },

  {
    pattern: 'supercell' as PatternType,
    name: 'Supercell Thunderstorm',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (1-hr)', latex: 'M = [0,.02,.08,.25,.52,.72,.83,.91,.94,.96,.97,.98,.99,1]', description: 'Extremely front-loaded, very high peak intensity' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '14-point dimensionless time' },
    ],
    reference: { title: 'The Structure and Dynamics of Supercell Thunderstorms', citation: 'Markowski & Richardson, Cambridge UP', year: 2010 },
    notes: 'Peak 15–25%. Peak ratio ~4.0×. Duration 30–90 min. Extreme intensities >150 mm/hr possible.'
  },

  {
    pattern: 'orographic_enhanced' as PatternType,
    name: 'Orographic Enhanced',
    category: 'intensity',
    equations: [
      { label: 'Enhancement', latex: 'i_{enh}(t) = i_{base}(t) \\cdot \\text{OEF}(t)', description: 'Base distribution multiplied by orographic factor' },
      { label: 'OEF', latex: '\\text{OEF} = 1 + \\alpha \\cdot \\bar{w} \\cdot \\frac{dz}{dx}', description: 'Orographic Enhancement Factor for constant wind' },
      { label: 'Mass Curve', latex: 'M = [0,.04,.10,.19,.31,.47,.63,.77,.88,.95,1]', description: 'Broader peak than convective baseline' },
    ],
    variables: [
      { symbol: '\\alpha', meaning: 'Enhancement coefficient (~0.0002–0.0005 per m/km)' },
      { symbol: '\\bar{w}', meaning: 'Mean wind speed (m/s)' },
      { symbol: 'dz/dx', meaning: 'Terrain slope in wind direction (m/km)' },
    ],
    reference: { title: 'Orographic Rainfall and Rain-Shadow Effects', citation: 'Roe, G.H., Annual Review Earth & Planetary Sci.', year: 2005 },
    notes: 'Windward OEF 1.3–2.0, leeward 0.5–0.8 (rain shadow). Broader peak than convective storms.'
  },

  {
    pattern: 'urban_heat_island' as PatternType,
    name: 'Urban Heat Island Enhanced',
    category: 'intensity',
    equations: [
      { label: 'Enhancement', latex: 'i_{urban}(t) = i_{rural}(t) \\cdot \\text{UHI}', description: 'Rural baseline scaled by urban heat island factor' },
      { label: 'UHI Factor', latex: '\\text{UHI} = 1 + 0.07 \\cdot \\Delta T_{UHI}', description: 'Simplified constant enhancement factor' },
      { label: 'Peak Enhancement', latex: 'i_{peak,urban} = i_{peak,rural} \\cdot (1 + 0.12 \\cdot \\Delta T_{UHI})', description: 'Convective peak preferentially enhanced' },
    ],
    variables: [
      { symbol: '\\Delta T_{UHI}', meaning: 'Urban–rural temperature difference (°C): small 1–2, medium 2–4, large 4–8' },
    ],
    reference: { title: 'Urban Modification of Thunderstorms', citation: 'Shepherd, J.M., Phys. Geogr.', year: 2005 },
    notes: 'Small city UHI 1.07–1.14, medium 1.14–1.28, large 1.28–1.56. Peak enhancement exceeds mean enhancement.'
  },

  {
    pattern: 'monsoon_burst' as PatternType,
    name: 'Monsoon Burst',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (12-hr)', latex: 'M = [0,.02,.04,.07,.11,.16,.23,.32,.42,.52,.61,.69,.76,.81,.86,.90,.93,.96,.98,.99,1]', description: 'Active monsoon phase with broad peak and embedded convection' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '21-point dimensionless time array' },
    ],
    reference: { title: 'The Asian Monsoon', citation: 'Wang, B., Springer Praxis', year: 2006 },
    notes: 'Broad peak 25–55%. Peak ratio ~1.8×. Fluctuating intensity within envelope. Optional: superimpose random noise for embedded convection.'
  },

  {
    pattern: 'monsoon_break' as PatternType,
    name: 'Monsoon Break',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (24-hr)', latex: 'M = [0, 0.08, 0.17, 0.26, 0.36, 0.47, 0.57, 0.68, 0.79, 0.89, 1.0]', description: 'Nearly uniform light rainfall during monsoon break' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '[0, 0.1, 0.2, ..., 1.0]' },
    ],
    reference: { title: 'Monsoon Break and Active Phases', citation: 'Rajeevan, M. et al., Current Science', year: 2010 },
    notes: 'Nearly uniform (peak ratio ~1.2×). Low total depth 5–15 mm. Drizzle character.'
  },

  {
    pattern: 'squall_line' as PatternType,
    name: 'Squall Line',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (90-min)', latex: 'M = [0,.05,.18,.42,.62,.75,.83,.90,.94,.96,.97,.98,.99,1]', description: 'Very front-loaded with trailing stratiform' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '14-point dimensionless time' },
    ],
    reference: { title: 'Squall Lines and Bow Echoes', citation: 'Weisman, M.L. & Trapp, R.J., J. Atmos. Sci.', year: 2003 },
    notes: 'Peak 10–20%. Peak ratio ~3.8×. Gust front precedes rainfall. Trailing stratiform is low intensity final 60%.'
  },

  {
    pattern: 'sea_breeze' as PatternType,
    name: 'Sea Breeze Convergence',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (3-hr)', latex: 'M = [0,.01,.03,.06,.10,.18,.28,.45,.62,.76,.85,.91,.95,.98,1]', description: 'Late-peak afternoon convective storm' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '15-point dimensionless time' },
    ],
    reference: { title: 'Sea Breeze Convection', citation: 'Simpson, J.E., Annual Review Fluid Mech.', year: 1994 },
    notes: 'Late peak 55–70%. Peak ratio ~3.2×. Triggered by afternoon heating + sea breeze convergence. Florida, tropical coasts, Mediterranean summer.'
  },

  {
    pattern: 'nocturnal_mcs' as PatternType,
    name: 'Nocturnal MCS',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (8-hr)', latex: 'M = [0,.01,.02,.04,.07,.12,.20,.32,.48,.62,.74,.83,.89,.93,.96,.98,1]', description: 'Night-time mesoscale convective system' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '17-point dimensionless time (starting ~10 PM)' },
    ],
    reference: { title: 'Nocturnal Convection over the Great Plains', citation: 'Carbone et al., J. Atmos. Sci.', year: 2002 },
    notes: 'Peak 40–55% (midnight–2AM typically). Peak ratio ~2.5×. US Great Plains, Sahel West Africa.'
  },

  {
    pattern: 'rain_on_snow' as PatternType,
    name: 'Rain-on-Snow (Compound Event)',
    category: 'intensity',
    equations: [
      { label: 'Combined Inflow', latex: 'i_{total}(t) = i_{rain}(t) + q_{melt}(t)', description: 'Rainfall plus snowmelt components' },
      { label: 'Snowmelt', latex: 'q_{melt}(t) = C_m \\cdot T_{air}(t)', description: 'Degree-day melt method' },
      { label: 'Temperature', latex: 'T_{air}(t) = T_{base} + \\Delta T \\sin(\\pi t / D)', description: 'Warming profile during event' },
      { label: 'Total Depth', latex: 'P_{total} = P_{rain} + C_m \\int_0^D \\max(T_{air}(t), 0)\\,dt', description: 'Combined effective precipitation' },
    ],
    variables: [
      { symbol: 'C_m', meaning: 'Melt coefficient: 2–5 mm/°C/day for rain-on-snow' },
      { symbol: 'T_{base}', meaning: 'Base temperature (typically 0°C)' },
      { symbol: '\\Delta T', meaning: 'Temperature rise during event (3–5°C typical)' },
    ],
    reference: { title: 'Rain-on-Snow Events in the Western US', citation: 'Marks et al., J. Hydrometeorology', year: 1998 },
    notes: 'Compound event — rainfall atop snowpack. Melt only when T>0°C. Critical for flood design in mountainous regions.'
  },

  {
    pattern: 'post_wildfire' as PatternType,
    name: 'Post-Wildfire Design Storm',
    category: 'intensity',
    equations: [
      { label: 'Debris Flow Threshold', latex: 'I_{15} = 24 \\cdot (p \\cdot x)^{-0.59}', description: 'Peak 15-min intensity triggering debris flow (mm/hr)' },
      { label: 'Mass Curve (1–3 hr)', latex: 'M = [0, 0.10, 0.30, 0.55, 0.72, 0.83, 0.89, 0.95, 0.98, 1.0]', description: 'Short-duration front-loaded profile' },
    ],
    variables: [
      { symbol: 'p', meaning: 'Proportion of catchment burned at moderate-high severity' },
      { symbol: 'x', meaning: 'Soil KF-factor (erodibility)' },
      { symbol: 'I_{15}', meaning: '15-minute peak intensity threshold' },
    ],
    reference: { title: 'Post-Fire Debris-Flow Hazard Assessment', citation: 'Staley, D.M. et al., USGS, Landslides', year: 2017 },
    notes: '2-yr storm triggers debris flows on severely burned areas (vs 25–100 yr unburned). Peak ratio ~3.5×. Duration 1–3 hr.'
  },

  {
    pattern: 'dam_safety_pmf' as PatternType,
    name: 'Dam Safety PMF Storm',
    category: 'cumulative',
    equations: [
      { label: '6-hr PMP', latex: 'M = [0, 0.045, 0.205, 0.710, 0.880, 0.955, 1.0]', description: '6-hr PMP distribution (US east of 105th meridian)' },
      { label: '24-hr PMP', latex: 'M = [0,.005,.012,.020,.030,.043,.058,.080,.115,.170,.265,.500,.735,.830,.885,.920,.942,.958,.970,.978,.985,.990,.994,.997,1]', description: '24-hr PMP with extreme mid-storm peak' },
      { label: '72-hr Nesting', latex: '\\text{First 24hr: 15\\%} \\;|\\; \\text{Middle 24hr: 65\\%} \\;|\\; \\text{Last 24hr: 20\\%}', description: '24-hr PMP nested within 72-hr envelope' },
    ],
    variables: [
      { symbol: 'PMP', meaning: 'Probable Maximum Precipitation' },
      { symbol: 'PMF', meaning: 'Probable Maximum Flood' },
    ],
    reference: { title: 'EM 1110-2-1411: Standard Project Flood Determination', citation: 'US Army Corps of Engineers', year: 1965 },
    notes: 'Dam safety standard. Extreme mid-storm peak. 72-hr variant nests 24-hr pattern in middle day. East of 105th meridian (US).'
  },

  {
    pattern: 'tropical_cyclone' as PatternType,
    name: 'Tropical Cyclone Rainband',
    category: 'cumulative',
    equations: [
      { label: 'Multi-Band Structure (24-hr)', latex: 'M = [0,.03,.07,.12,.15,.17,.22,.35,.52,.65,.70,.71,.74,.80,.86,.90,.93,.96,.98,.99,1]', description: 'Outer bands → moat → eye wall → eye → second wall → trailing' },
      { label: 'Eye Wall', latex: 'i_{ew}(t) = 3.5\\bar{i} \\cdot e^{-(t-11)^2/4}', description: 'Primary eye wall passage — ~55% of total depth' },
      { label: 'Second Eye Wall', latex: 'i_{ew2}(t) = 2.0\\bar{i} \\cdot e^{-(t-18)^2/4}', description: 'Secondary eye wall — ~20% of total depth' },
    ],
    variables: [
      { symbol: '\\bar{i}', meaning: 'Average intensity (P/D)' },
    ],
    reference: { title: 'The Structure and Precipitation of Tropical Cyclones', citation: 'Houze, R.A., Q.J.R. Meteorol. Soc.', year: 2010 },
    notes: 'Multi-band structure: outer bands 15%, moat 3%, eye wall 55%, eye 1%, second wall 20%, trailing 6%.'
  },

  {
    pattern: 'derecho' as PatternType,
    name: 'Derecho',
    category: 'cumulative',
    equations: [
      { label: 'Mass Curve (2-hr)', latex: 'M = [0, 0.08, 0.28, 0.52, 0.70, 0.84, 0.90, 0.93, 0.95, 0.97, 0.98, 0.99, 1.0]', description: 'Extremely front-loaded — destructive straight-line wind event' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '13-point dimensionless time' },
    ],
    reference: { title: 'A Climatology and Model of Derechos', citation: 'Corfidi, S.F. et al., Weather and Forecasting', year: 2016 },
    notes: 'Peak 5–15%. Peak ratio ~4.5×. Duration 1–3 hr at any point. Accompanied by destructive straight-line winds.'
  },

  // ════════════════════════════════════════════════════
  // CLIMATE CHANGE VARIANTS (#171–#180)
  // ════════════════════════════════════════════════════

  {
    pattern: 'ukcp18_enhanced' as PatternType,
    name: 'UKCP18 Climate-Enhanced',
    category: 'intensity',
    equations: [
      { label: 'Climate Factor', latex: 'i_{future}(t) = i_{baseline}(t) \\cdot CF(T, d, \\text{season}, \\text{scenario})', description: 'Baseline distribution scaled by climate change factor' },
      { label: 'Shape-Preserving', latex: 'CF_{uniform} = 1 + \\Delta', description: 'Uniform scaling preserves temporal shape' },
      { label: 'Peak-Preferential', latex: 'CF(t) = 1 + (CF-1) \\cdot \\frac{i_{base}(t)}{i_{max}}', description: 'Peak sharpening — higher intensities scaled more' },
    ],
    variables: [
      { symbol: 'CF', meaning: '2050 RCP8.5 winter 1-hr: 1.20; summer 1-hr: 1.35; 2080 summer 1-hr: 1.55' },
    ],
    reference: { title: 'UKCP18 Climate Projections', citation: 'Met Office Hadley Centre', year: 2018, link: 'https://www.metoffice.gov.uk/research/approach/collaboration/ukcp' },
    notes: 'UK Climate Projections 2018. Summer sub-daily intensities increase faster than winter or daily totals. Peak-preferential sharpens storms.'
  },

  {
    pattern: 'rcp45_adjusted' as PatternType,
    name: 'RCP 4.5 Adjusted (Generic)',
    category: 'intensity',
    equations: [
      { label: 'Clausius-Clapeyron Scaling', latex: 'CF(d) = 1 + \\left(0.07 - 0.03\\log_{10}\\frac{d}{1\\text{hr}}\\right) \\cdot \\Delta T', description: 'Duration-dependent climate factor' },
      { label: 'Short Duration', latex: 'CF_{<6hr} = 1 + 0.07 \\cdot 1.8 = 1.126', description: '12.6% increase for ΔT = 1.8°C (RCP 4.5 median 2100)' },
      { label: 'Long Duration', latex: 'CF_{>24hr} = 1 + 0.04 \\cdot 1.8 = 1.072', description: '7.2% increase' },
    ],
    variables: [
      { symbol: '\\Delta T', meaning: 'Global temperature change (°C); RCP 4.5 median 2100 = +1.8°C' },
      { symbol: 'd', meaning: 'Storm duration (hours)' },
    ],
    reference: { title: 'IPCC AR5: Climate Change 2014', citation: 'Intergovernmental Panel on Climate Change', year: 2014 },
    notes: 'RCP 4.5 moderate mitigation pathway. CC scaling ~7%/°C for sub-daily, ~4%/°C for multi-day. Duration-interpolated.'
  },

  {
    pattern: 'rcp85_adjusted' as PatternType,
    name: 'RCP 8.5 Adjusted',
    category: 'intensity',
    equations: [
      { label: 'Short Duration', latex: 'CF_{<6hr} = 1 + 0.07 \\times 4.3 = 1.301', description: '30.1% increase for ΔT = 4.3°C (RCP 8.5 median 2100)' },
      { label: 'Long Duration', latex: 'CF_{>24hr} = 1 + 0.04 \\times 4.3 = 1.172', description: '17.2% increase' },
    ],
    variables: [
      { symbol: '\\Delta T', meaning: '+4.3°C by 2100 (RCP 8.5 median)' },
    ],
    reference: { title: 'IPCC AR5: Climate Change 2014', citation: 'IPCC Working Group I', year: 2014 },
    notes: 'RCP 8.5 high-emissions pathway. Significant intensification of short-duration extreme rainfall.'
  },

  {
    pattern: 'ssp245_cmip6' as PatternType,
    name: 'SSP2-4.5 (CMIP6)',
    category: 'intensity',
    equations: [
      { label: 'Short Duration', latex: 'CF_{<6hr} = 1 + 0.07 \\times 2.1 = 1.147', description: '14.7% increase (IPCC AR6 median)' },
      { label: 'Long Duration', latex: 'CF_{>24hr} = 1 + 0.04 \\times 2.1 = 1.084', description: '8.4% increase' },
    ],
    variables: [
      { symbol: '\\Delta T', meaning: '+2.1°C by 2100 (SSP2-4.5 median, IPCC AR6)' },
    ],
    reference: { title: 'IPCC AR6: Climate Change 2021', citation: 'IPCC Working Group I, Sixth Assessment', year: 2021 },
    notes: 'CMIP6 successor to RCP 4.5. Updated climate sensitivity estimates. "Middle of the road" scenario.'
  },

  {
    pattern: 'ssp585_cmip6' as PatternType,
    name: 'SSP5-8.5 (CMIP6)',
    category: 'intensity',
    equations: [
      { label: 'Short Duration', latex: 'CF_{<6hr} = 1 + 0.07 \\times 4.4 = 1.308', description: '30.8% increase (IPCC AR6 median)' },
      { label: 'Long Duration', latex: 'CF_{>24hr} = 1 + 0.04 \\times 4.4 = 1.176', description: '17.6% increase' },
    ],
    variables: [
      { symbol: '\\Delta T', meaning: '+4.4°C by 2100 (SSP5-8.5 median, IPCC AR6)' },
    ],
    reference: { title: 'IPCC AR6: Climate Change 2021', citation: 'IPCC Working Group I, Sixth Assessment', year: 2021 },
    notes: 'CMIP6 high-emissions scenario. Fossil-fuelled development. Most extreme warming pathway.'
  },

  {
    pattern: 'arr_climate' as PatternType,
    name: 'ARR Climate Change Factor (Australia)',
    category: 'intensity',
    equations: [
      { label: 'Short Duration', latex: 'CF_{best,<6hr} = 1 + 0.07 \\cdot \\Delta T_{local}', description: 'Best-estimate factor for short storms' },
      { label: 'Range', latex: 'CF_{low} = 1 + 0.05\\Delta T, \\quad CF_{high} = 1 + 0.10\\Delta T', description: 'Low and high uncertainty bounds' },
    ],
    variables: [
      { symbol: '\\Delta T_{local}', meaning: 'Local temperature change: Sydney +3.7, Melbourne +3.2, Brisbane +3.5, Perth +3.0 (2090 RCP8.5)' },
    ],
    reference: { title: 'Australian Rainfall and Runoff 2019', citation: 'Ball et al., Geoscience Australia', year: 2019, link: 'http://arr.ga.gov.au' },
    notes: 'Australian interim factors. Three tiers (low/best/high). Sydney 2090 RCP8.5 best-estimate: +26% for short duration.'
  },

  {
    pattern: 'intensity_amplification' as PatternType,
    name: 'Intensity Amplification (Generic)',
    category: 'intensity',
    equations: [
      { label: 'Amplification', latex: 'i_{amp}(t) = i(t) \\cdot \\left[1 + (A-1) \\cdot \\left(\\frac{i(t)}{i_{peak}}\\right)^n\\right]', description: 'Preferential amplification of peak intensities' },
    ],
    variables: [
      { symbol: 'A', meaning: 'Amplification factor (e.g. 1.2 for 20% increase)' },
      { symbol: 'n', meaning: 'Selectivity: n=0 uniform, n=1 linear, n=2 quadratic preferential' },
    ],
    reference: { title: 'Climate-Adjusted Design Storms', citation: 'General engineering practice', year: 2015 },
    notes: 'Volume-preserving variant renormalises so ∫i·dt = P (peakier without depth change). n controls how much peak is amplified vs tails.'
  },

  {
    pattern: 'duration_compression' as PatternType,
    name: 'Duration Compression',
    category: 'intensity',
    equations: [
      { label: 'Compressed Time', latex: 't_{comp} = t \\cdot \\frac{D_{new}}{D_{orig}}', description: 'Rescale time axis' },
      { label: 'Compressed Intensity', latex: 'i_{comp}(t) = i_{orig}\\!\\left(t \\cdot \\frac{D_{orig}}{D_{new}}\\right) \\cdot \\frac{D_{orig}}{D_{new}}', description: 'Intensities increase by 1/CR' },
    ],
    variables: [
      { symbol: 'CR', meaning: 'Compression ratio D_new/D_orig (CR < 1 means shorter, more intense)' },
    ],
    reference: { title: 'Duration-Adjusted Design Storms', citation: 'Climate adaptation methods', year: 2018 },
    notes: 'Same total depth, shorter duration, higher peak. E.g. 6-hr → 4-hr (CR=0.667) increases all intensities by factor 1.5.'
  },

  {
    pattern: 'super_cc' as PatternType,
    name: 'Clausius-Clapeyron Super-CC',
    category: 'intensity',
    equations: [
      { label: 'Scaling Function', latex: 's(d) = 0.14 - 0.074 \\cdot \\log_{10}\\!\\left(\\frac{d}{0.25\\text{hr}}\\right)', description: 'Duration-dependent scaling rate (clamped to [0.03, 0.14])' },
      { label: 'Climate Factor', latex: 'CF = 1 + s(d) \\cdot \\Delta T', description: 'Applied to baseline intensity' },
    ],
    variables: [
      { symbol: 's(d)', meaning: 'd≤15min: 14%/°C (super-CC), 1hr: 10%/°C, 6hr: 7%/°C (CC), 24hr: 5%/°C, ≥72hr: 3%/°C' },
      { symbol: '\\Delta T', meaning: 'Temperature change (°C)' },
    ],
    reference: { title: 'Increase in Hourly Precipitation Extremes Beyond Expectations', citation: 'Lenderink & van Meijgaard, Nature Geoscience', year: 2008, link: 'https://doi.org/10.1038/ngeo262' },
    notes: 'Sub-hourly intensities scale at 2× the CC rate (14%/°C vs 7%/°C). Observed in Netherlands, Belgium. Critical for urban drainage future-proofing.'
  },

  // ════════════════════════════════════════════════════
  // STOCHASTIC GENERATORS (#181–#190)
  // ════════════════════════════════════════════════════

  {
    pattern: 'bartlett_lewis_gamma' as PatternType,
    name: 'Modified Bartlett-Lewis Gamma',
    category: 'intensity',
    equations: [
      { label: 'Storm Arrivals', latex: 'T_k \\sim \\text{Poisson}(\\lambda)', description: 'Storms arrive as Poisson process' },
      { label: 'Cell Intensity', latex: 'X_c \\sim \\text{Gamma}(\\alpha,\\, \\mu_x/\\alpha)', description: 'Gamma-distributed cell intensity (mean μ_x)' },
      { label: 'Superposition', latex: 'I(t) = \\sum_j X_{c,j} \\cdot \\mathbb{1}_{[t_{start},\\, t_{end}]}(t)', description: 'Sum of overlapping rectangular pulses' },
      { label: 'Variable η', latex: '\\eta_k \\sim \\text{Gamma}(\\alpha_\\eta,\\, \\bar{\\eta}/\\alpha_\\eta)', description: 'Storm-to-storm variability in cell duration (Kaczmarska 2014)' },
    ],
    variables: [
      { symbol: '\\lambda', meaning: 'Storm arrival rate (0.01–0.05 /hr)' },
      { symbol: '\\beta', meaning: 'Cell arrival rate within storm (0.1–0.5 /hr)' },
      { symbol: '\\gamma', meaning: 'Storm termination rate (0.02–0.10 /hr)' },
      { symbol: '\\eta', meaning: 'Cell duration parameter (0.5–2.0 /hr)' },
      { symbol: '\\alpha', meaning: 'Gamma shape for cell intensity (α=1 → exponential)' },
    ],
    reference: { title: 'A Point Process Model for Rainfall with Dependent Duration and Intensity', citation: 'Kaczmarska et al., Proc. R. Soc. A', year: 2014 },
    notes: 'Extension of standard Bartlett-Lewis. α>1 thinner tails, α<1 heavier tails. Variable η allows storm-to-storm variability.'
  },

  {
    pattern: 'multiplicative_cascade' as PatternType,
    name: 'Multiplicative Random Cascade',
    category: 'intensity',
    equations: [
      { label: 'Cascade Splitting', latex: 'W_j = \\exp(\\sigma Z_j - \\sigma^2/2), \\quad Z \\sim N(0,1)', description: 'Beta-lognormal weight generator at each level' },
      { label: 'Variance Scaling', latex: '\\sigma^2 = C_1 \\ln(b) \\cdot l', description: 'Variance increases with cascade level l' },
      { label: 'Universal Multifractal', latex: 'K(q) = \\frac{C_1}{\\alpha - 1}(q^\\alpha - q)', description: 'Moment scaling function with Lévy index α' },
    ],
    variables: [
      { symbol: 'b', meaning: 'Branching number (usually 2)' },
      { symbol: 'L', meaning: 'Number of cascade levels; resolution Δt = D/b^L' },
      { symbol: 'C_1', meaning: 'Codimension of mean (~0.12 for Warsaw)' },
      { symbol: '\\alpha', meaning: 'Multifractality index (1 < α ≤ 2; α=2 is log-normal)' },
    ],
    reference: { title: 'Multifractal Analysis of Rainfall Fields', citation: 'Licznar, P., Water Resources Research', year: 2024 },
    notes: 'Downscaling method: starts with total depth, recursively splits. α=1.6, C₁=0.12, b=2, L=10 → ~1 min resolution for 17-hr storm.'
  },

  {
    pattern: 'markov_chain_storm' as PatternType,
    name: 'Markov Chain Storm',
    category: 'intensity',
    equations: [
      { label: 'State Transition', latex: 's_{t+1} \\sim \\text{Categorical}(P[s_t, :])', description: 'Next state drawn from transition probability row' },
      { label: 'Intensity Sampling', latex: 'i(t) \\sim U(\\text{band}[s_{t+1}])', description: 'Intensity sampled uniformly from state band' },
    ],
    variables: [
      { symbol: 'S', meaning: 'States: {dry(0), light(0.1–2), moderate(2–10), heavy(10–30), extreme(30–100)} mm/hr' },
      { symbol: 'P', meaning: '5×5 transition matrix (e.g. P[heavy→extreme]=0.25)' },
    ],
    reference: { title: 'Stochastic Weather Generators', citation: 'Richardson, C.W., Water Resources Research', year: 1981 },
    notes: '5 states with transition matrix. Total depth rescaled to target P. Can model persistence and state transitions realistically.'
  },

  {
    pattern: 'storm_model' as PatternType,
    name: 'STORM Model (Singer)',
    category: 'intensity',
    equations: [
      { label: 'Storm Arrivals', latex: 'N_m \\sim \\text{Poisson}(\\lambda_m \\cdot 30)', description: 'Monthly storm count from seasonal Poisson rate' },
      { label: 'Duration', latex: 'D \\sim \\text{Gamma}(\\alpha_d, \\beta_d)', description: 'Storm duration from fitted Gamma' },
      { label: 'Total Depth', latex: 'P \\sim \\text{Gamma}(\\alpha_p, \\beta_p)', description: 'Storm depth from fitted Gamma' },
      { label: 'Temporal', latex: 'M(\\tau) = I_\\tau(a, b)', description: 'Within-storm pattern from regularised incomplete Beta function' },
    ],
    variables: [
      { symbol: '\\lambda_m', meaning: 'Monthly storm arrival rate' },
      { symbol: '\\alpha_d, \\beta_d', meaning: 'Gamma parameters for duration' },
      { symbol: '\\alpha_p, \\beta_p', meaning: 'Gamma parameters for depth' },
      { symbol: 'a, b', meaning: 'Beta distribution shape parameters for temporal pattern' },
    ],
    reference: { title: 'STORM: A Simple, Flexible Stochastic Rainfall Generator', citation: 'Singer, M.B. et al., Geoscientific Model Development', year: 2018 },
    notes: 'STOchastic Rainfall Model. Parameters fitted monthly. Generates realistic sequences with seasonal variation. Place storms randomly within month.'
  },

  {
    pattern: 'poisson_white_noise' as PatternType,
    name: 'Poisson White Noise',
    category: 'intensity',
    equations: [
      { label: 'Arrival Process', latex: 'N(j) \\sim \\text{Poisson}(\\lambda \\cdot \\Delta t)', description: 'Number of events per time step' },
      { label: 'Intensity', latex: 'i(j) = \\mu_x \\cdot N(j)', description: 'Intensity proportional to event count' },
      { label: 'Constrained', latex: 'i(j) = P \\cdot \\frac{r_j}{\\Delta t \\cdot \\sum r_k}, \\quad r_j \\sim \\text{Exp}(1)', description: 'Fixed total depth variant' },
    ],
    variables: [
      { symbol: '\\lambda', meaning: 'Event rate per unit time' },
      { symbol: '\\mu_x', meaning: 'Mean intensity per event' },
    ],
    reference: { title: 'Point Process Models of Rainfall', citation: 'Rodriguez-Iturbe et al., Proc. R. Soc. Lond.', year: 1987 },
    notes: 'Simplest stochastic model. Constrained variant preserves total depth P exactly. Good for sensitivity testing.'
  },

  // ════════════════════════════════════════════════════
  // HISTORICAL / CLASSICAL METHODS (#191–#198)
  // ════════════════════════════════════════════════════

  {
    pattern: 'keifer_chu_1957' as PatternType,
    name: 'Keifer-Chu (1957) Original',
    category: 'empirical',
    equations: [
      { label: 'Before Peak', latex: 'i(t) = \\frac{a\\left[(1-c)\\frac{t_p-t}{r}+b\\right]}{\\left(\\frac{t_p-t}{r}+b\\right)^{c+1}}', description: 'Rising limb — original Chicago formulation' },
      { label: 'After Peak', latex: 'i(t) = \\frac{a\\left[(1-c)\\frac{t-t_p}{1-r}+b\\right]}{\\left(\\frac{t-t_p}{1-r}+b\\right)^{c+1}}', description: 'Falling limb' },
    ],
    variables: [
      { symbol: 'a, b, c', meaning: 'Original Chicago IL: a=30.8, b=9.56, c=0.776' },
      { symbol: 'r', meaning: 'Advancement ratio = 0.375' },
    ],
    reference: { title: 'Synthetic Storm Pattern for Drainage Design', citation: 'Keifer, C.J. & Chu, H.H., J. Hydraulics Div., ASCE', year: 1957 },
    notes: 'The original 1957 paper that defined the Chicago Design Storm. Parameters specific to Chicago, Illinois. Foundation of all modern CDS implementations.'
  },

  {
    pattern: 'simons_1976_sa' as PatternType,
    name: 'Simons (1976) South Africa',
    category: 'cumulative',
    equations: [
      { label: 'Convective (<6hr)', latex: 'M = [0, 0.05, 0.14, 0.30, 0.54, 0.74, 0.86, 0.92, 0.96, 0.99, 1.0]', description: 'Short-duration convective storms' },
      { label: 'Frontal (6–24hr)', latex: 'M = [0, 0.04, 0.10, 0.19, 0.32, 0.50, 0.67, 0.80, 0.90, 0.96, 1.0]', description: 'Long-duration frontal storms' },
    ],
    variables: [
      { symbol: '\\tau', meaning: '[0, 0.1, 0.2, ..., 1.0] dimensionless time' },
    ],
    reference: { title: 'Design Flood Determination by Direct Statistical Methods', citation: 'Simons, D.B., Dept. Water Affairs, South Africa', year: 1976 },
    notes: 'Original South African method. Distinct from SANRAL (2013 updates). Two profiles by storm mechanism.'
  },

  {
    pattern: 'koutsoyiannis_greece' as PatternType,
    name: 'Koutsoyiannis-Manetas (Greece)',
    category: 'cumulative',
    equations: [
      { label: 'IDF Envelope', latex: 'i(d) = a(d + \\theta)^{\\eta - 1}', description: 'IDF-consistent intensity for duration d' },
      { label: 'Incremental Depth', latex: '\\Delta P(k) = i(k\\Delta t) \\cdot k\\Delta t - i((k-1)\\Delta t) \\cdot (k-1)\\Delta t', description: 'Depth increments from IDF envelope' },
    ],
    variables: [
      { symbol: 'a, \\theta, \\eta', meaning: 'Athens: a=49.5, θ=0.58hr, η=0.635; Thessaloniki: a=38.2, θ=0.50, η=0.620' },
    ],
    reference: { title: 'A Mathematical Framework for Studying Rainfall Intensity-Duration-Frequency Relationships', citation: 'Koutsoyiannis, D. & Manetas, A., J. Hydrol.', year: 1998 },
    notes: 'IDF-consistent: design hyetograph reproduces IDF intensity for ALL sub-durations simultaneously. Then alternating-block rearrangement.'
  },

  {
    pattern: 'wenzel_triangular' as PatternType,
    name: 'Wenzel Asymmetric Triangular',
    category: 'intensity',
    equations: [
      { label: 'Rising', latex: 'i(t) = i_{peak} \\cdot \\frac{t}{t_p}, \\quad t \\leq t_p', description: 'Linear rise to peak' },
      { label: 'Falling', latex: 'i(t) = i_{peak} \\cdot \\frac{D-t}{D-t_p}, \\quad t > t_p', description: 'Linear recession' },
      { label: 'Peak', latex: 'i_{peak} = 2P/D', description: 'Triangle always has peak = 2× average' },
      { label: 'Cumulative (Rising)', latex: 'M(t) = P \\cdot \\frac{t^2}{D \\cdot t_p}, \\quad t \\leq t_p', description: 'Parabolic cumulative on rising limb' },
      { label: 'Cumulative (Falling)', latex: 'M(t) = P\\left[1 - \\frac{(D-t)^2}{D(D-t_p)}\\right], \\quad t > t_p', description: 'Parabolic cumulative on falling limb' },
    ],
    variables: [
      { symbol: 't_p', meaning: 'Time to peak = r·D; r<0.5 front-loaded, r=0.5 symmetric, r>0.5 back-loaded' },
      { symbol: 'r', meaning: 'Advancement ratio (0 to 1)' },
    ],
    reference: { title: 'Rational Method Peak Flow Estimation', citation: 'Wenzel, H.G., Jr., Stormwater Management', year: 1982 },
    notes: 'Generalisation of symmetric triangular with variable peak position. Peak ratio always exactly 2.0× average.'
  },

  {
    pattern: 'izzard_1946' as PatternType,
    name: 'Izzard (1946)',
    category: 'intensity',
    equations: [
      { label: 'Intensity', latex: 'i(t) = \\frac{2P}{D}\\left[1 - \\left(\\frac{2t}{D} - 1\\right)^2\\right]', description: 'Parabolic profile derived from overland flow theory' },
    ],
    variables: [
      { symbol: 'P', meaning: 'Total storm depth' },
      { symbol: 'D', meaning: 'Total duration' },
    ],
    reference: { title: 'Hydraulics of Runoff from Developed Surfaces', citation: 'Izzard, C.F., Proc. Highway Research Board', year: 1946 },
    notes: 'One of the earliest synthetic hyetographs. Derived from overland flow theory. Historical precursor to SCS method.'
  },

  {
    pattern: 'sherman_1931' as PatternType,
    name: 'Sherman (1931)',
    category: 'empirical',
    equations: [
      { label: 'Standard IDF', latex: 'i = \\frac{a}{t + b}', description: 'Original Sherman IDF formula' },
      { label: 'Modified', latex: 'i = \\frac{a}{(t + b)^c}', description: 'Generalised form with exponent' },
      { label: 'Bernard', latex: 'i = a \\cdot t^{-b}', description: 'Power-law variant (no offset)' },
    ],
    variables: [
      { symbol: 'a', meaning: 'Intensity coefficient (region-specific)' },
      { symbol: 'b', meaning: 'Time offset (minutes)' },
      { symbol: 'c', meaning: 'Decay exponent (Modified form only)' },
    ],
    reference: { title: 'Frequency and Intensity of Excessive Rainfalls at Boston', citation: 'Sherman, L.K., Trans. ASCE', year: 1931 },
    notes: 'Foundation of ALL modern IDF-based temporal distributions. Talbot form identical. Apply alternating block method for temporal distribution.'
  },
  // ============ v13 — Canadian Expansion ============
  {
    pattern: 'aes_50',
    name: 'AES Canada 50%',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{AES50}})', description: 'AES 50% dimensionless mass curve — peak at 50% of duration' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Time Distribution of Rainfall in Heavy Storms', citation: 'Hogg, W.D., Proc. Canadian Hydrology Symposium', year: 1980 },
    notes: 'Third AES variant — center-peaked, used in Maritime provinces and Eastern Canada.'
  },
  {
    pattern: 'ontario_mto_4hr',
    name: 'Ontario MTO 4-hr',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{MTO}})', description: 'Ontario MTO dimensionless 4-hour mass curve' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h), typically 4 hours' },
    ],
    reference: { title: 'MTO Drainage Management Technical Guidelines', citation: 'Ontario Ministry of Transportation', year: 1997 },
    notes: 'Standard for Ontario highway drainage design. Front-loaded with sharper peak than CDA.'
  },
  {
    pattern: 'marsalek_1978',
    name: 'Marsalek (1978)',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{Marsalek}})', description: 'Marsalek dimensionless mass curve — 16-point resolution' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Research on the Design Storm Concept', citation: 'Marsalek, J., National Research Council Canada, NRCC-17539', year: 1978 },
    notes: 'Widely cited Canadian urban drainage design storm. Symmetrical center-peaked at t/D=0.5.'
  },
  {
    pattern: 'quebec_melccfp',
    name: 'Quebec MELCCFP',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{QC}})', description: 'Quebec provincial mass curve' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Guide de gestion des eaux pluviales', citation: 'MELCCFP, Gouvernement du Québec', year: 2014 },
    notes: 'Center-peaked, influenced by Great Lakes and St. Lawrence Valley synoptic patterns.'
  },
  {
    pattern: 'alberta_transportation',
    name: 'Alberta Transportation',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{AB}})', description: 'Alberta Transportation mass curve for prairie climate' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Highway Geometric Design Guide', citation: 'Alberta Transportation', year: 1999 },
    notes: 'Adapted for continental prairie climate with intense summer convective thunderstorms.'
  },
  {
    pattern: 'prairie_short',
    name: 'Prairie Short-Duration',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{Prairie}})', description: 'Prairie thunderstorm mass curve — very front-loaded' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Prairie Thunderstorm Rainfall Analysis', citation: 'Watt, W.E. & Nozdryn-Plotnicki, M.J.', year: 1983 },
    notes: 'Very front-loaded convective burst characteristic of prairie thunderstorm cells.'
  },
  {
    pattern: 'bc_moe_coastal',
    name: 'BC MOE Coastal',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{BC}})', description: 'BC coastal orographic mass curve — nearly linear' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Stormwater Planning: A Guidebook for British Columbia', citation: 'BC Ministry of Environment', year: 2002 },
    notes: 'Prolonged orographic/frontal rainfall on Pacific coast. Nearly uniform distribution with gentle central peak.'
  },
  {
    pattern: 'pilgrim_cordery_ca',
    name: 'Pilgrim-Cordery (Canada)',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{PC-CA}})', description: 'Pilgrim-Cordery Canadian adaptation mass curve' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Flood Estimation from Chimney Pot to Computer', citation: 'Pilgrim, D.H. & Cordery, I., Civil Eng Trans IEAust', year: 1975 },
    notes: 'Originally Australian, adopted by some Alberta and Saskatchewan jurisdictions with slight Canadian calibration.'
  },
  {
    pattern: 'adamowski_pacific',
    name: 'Adamowski-Alila Pacific Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{Pacific}})', description: 'Dimensionless mass curve for Pacific climate zone (BC, Yukon)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Prolonged frontal/orographic rainfall with gentle central peak. Derived from Environment Canada rain gauge networks.'
  },
  {
    pattern: 'adamowski_prairie',
    name: 'Adamowski-Alila Prairie Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{Prairie}})', description: 'Dimensionless mass curve for Prairie climate zone (AB, SK, MB)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Sharp convective peak in early-to-mid storm. Reflects continental thunderstorm climatology.'
  },
  {
    pattern: 'adamowski_greatlakes',
    name: 'Adamowski-Alila Great Lakes Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{GL}})', description: 'Dimensionless mass curve for Great Lakes zone (southern Ontario)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Moderate frontal/convective mix influenced by Great Lakes moisture.'
  },
  {
    pattern: 'adamowski_stlawrence',
    name: 'Adamowski-Alila St. Lawrence Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{StL}})', description: 'Dimensionless mass curve for St. Lawrence zone (Quebec, eastern Ontario)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Moderate intensity with central peak. Mixed continental and maritime influences.'
  },
  {
    pattern: 'adamowski_atlantic',
    name: 'Adamowski-Alila Atlantic Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{Atl}})', description: 'Dimensionless mass curve for Atlantic zone (NB, NS, PEI, NL)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Maritime frontal rainfall with gradual, nearly uniform distribution.'
  },
  {
    pattern: 'adamowski_northern',
    name: 'Adamowski-Alila Northern Region',
    category: 'empirical',
    equations: [
      { label: 'Cumulative', latex: 'P(t) = \\text{interp}(t/D,\\; \\mathbf{p}_{\\text{North}})', description: 'Dimensionless mass curve for Northern zone (NWT, Nunavut, northern provinces)' },
    ],
    variables: [
      { symbol: 't', meaning: 'Elapsed time (h)' },
      { symbol: 'D', meaning: 'Storm duration (h)' },
    ],
    reference: { title: 'Regional Rainfall Distributions for Canada', citation: 'Adamowski, K. & Alila, Y., Atmospheric Research', year: 1996 },
    notes: 'Low intensity, very uniform spread. Reflects Arctic and subarctic precipitation patterns.'
  },
  {
    pattern: 'winnipeg_maclaren',
    name: 'Winnipeg MacLaren Drainage',
    category: 'intensity',
    equations: [
      { label: 'Chicago IDF (before peak)', latex: 'i(t_b) = \\frac{a\\,(c\\,t_b^{\\,b-1})}{(t_b^{\\,b}+c)^2}', description: 'Intensity before peak using advancement coefficient r = 0.40' },
      { label: 'Chicago IDF (after peak)', latex: 'i(t_a) = \\frac{a\\,(c\\,t_a^{\\,b-1})}{(t_a^{\\,b}+c)^2}', description: 'Intensity after peak' },
    ],
    variables: [
      { symbol: 'r', meaning: 'Storm advancement coefficient = 0.40' },
      { symbol: 'a,b,c', meaning: 'IDF curve parameters for Winnipeg region' },
      { symbol: 't_b', meaning: 'Time before peak (min)' },
      { symbol: 't_a', meaning: 'Time after peak (min)' },
    ],
    reference: { title: 'City of Winnipeg Drainage Criteria Manual', citation: 'MacLaren Engineers, City of Winnipeg', year: 1984 },
    notes: 'Modified Chicago-type distribution with r=0.40, calibrated for Red River basin climate and Winnipeg IDF curves.'
  },
  // ============ Additional Patterns (auto-generated references) ============
  {
    pattern: 'abu_dhabi_adm',
    name: 'Abu Dhabi ADM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Abu Dhabi ADM Design Storm Standard',
      citation: 'Abu Dhabi ADM',
      year: 2020,
    },
    notes: 'Design storm pattern for FEH 75th pctl peak.'
  },
  {
    pattern: 'abu_dhabi_climate',
    name: 'Abu Dhabi Climate-Adjusted',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Abu Dhabi Climate-Adjusted Design Storm',
      citation: 'Khalifa University / ADM',
      year: 2024,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'abu_dhabi_upc',
    name: 'Abu Dhabi UPC/DM Combined',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Abu Dhabi UPC Stormwater Guidelines',
      citation: 'Abu Dhabi Urban Planning Council',
      year: 2013,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'afghanistan_momp',
    name: 'Afghanistan MOMP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MOMP Public Works Drainage Guidelines',
      citation: 'Ministry of Public Works Afghanistan',
      year: 2014,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'alabama_aldot',
    name: 'Alabama ALDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Alabama DOT Drainage Manual',
      citation: 'Alabama Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'alaska_dotpf',
    name: 'Alaska DOT&PF',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Alaska Highway Drainage Manual',
      citation: 'Alaska DOT & Public Facilities',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'albanian_igewe',
    name: 'Albanian IGEWE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'IGEWE Albanian IDF Standards',
      citation: 'Institute of GeoSciences Albania',
      year: 2016,
    },
    notes: 'Adriatic Mediterranean front-loaded design storm.'
  },
  {
    pattern: 'alberta_esrd',
    name: 'Alberta ESRD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Alberta ESRD IDF Curve Data',
      citation: 'Alberta Environment and Sustainable Resource Development',
      year: 2015,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'algeria_anrh_urban',
    name: 'Algeria ANRH Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ANRH Urban Drainage Design Manual',
      citation: 'ANRH Algeria',
      year: 2015,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'alternating_block',
    name: 'Alternating Block',
    category: 'cumulative',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Alternating Block Method',
      citation: 'NRCS / HEC',
      year: 1982,
    },
    notes: 'Alternating Block Method (ABM) — IDF-derived symmetric arrangement placing highest increment at center'
  },
  {
    pattern: 'angola_dna',
    name: 'Angola DNA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Dimensionamento de Drenagem',
      citation: 'Direcção Nacional de Águas Angola',
      year: 2013,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'angola_inamet',
    name: 'Angola INAMET',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Angola INAMET Design Storm Standard',
      citation: 'Angola INAMET',
      year: 2020,
    },
    notes: 'Design storm pattern for Tropical maritime/continental transition.'
  },
  {
    pattern: 'argentina_adt',
    name: 'Argentina ADT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Normas de Diseño Hidráulico — Provincia de Buenos Aires',
      citation: 'Dirección de Hidráulica',
      year: 2012,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'argentina_ina',
    name: 'Argentina INA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Diseño Hidrológico',
      citation: 'Instituto Nacional del Agua',
      year: 2016,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'argentina_smn',
    name: 'Argentina SMN',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Argentina SMN Design Storm Standard',
      citation: 'Argentina SMN',
      year: 2020,
    },
    notes: 'Design storm pattern for Buenos Aires Chicago variant.'
  },
  {
    pattern: 'arid_flash_flood',
    name: 'Arid Flash Flood',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Arid Flash Flood Design Storm Standard',
      citation: 'Arid Flash Flood',
      year: 2020,
    },
    notes: 'Design storm pattern for Exponential decay burst.'
  },
  {
    pattern: 'arizona_adot',
    name: 'Arizona ADOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Arizona DOT Drainage Design Manual',
      citation: 'Arizona Department of Transportation',
      year: 2014,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'arkansas_ardot',
    name: 'Arkansas ArDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Arkansas DOT Drainage Design Manual',
      citation: 'Arkansas Department of Transportation',
      year: 2021,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'armenia_hydromet',
    name: 'Armenia Hydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Armenian Hydromet IDF Standards',
      citation: 'Armenian Hydrometeorology Service',
      year: 2015,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'aus_act_epsdd',
    name: 'Australian ACT EPSDD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ACT Stormwater Management Guidelines',
      citation: 'ACT Environment, Planning and Sustainable Development',
      year: 2015,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_nsw_oeh',
    name: 'Australian NSW OEH',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NSW Floodplain Development Manual',
      citation: 'NSW Office of Environment and Heritage',
      year: 2005,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_nt_depws',
    name: 'Australian NT DEPWS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NT Stormwater Management Framework',
      citation: 'NT Dept. of Environment, Parks and Water Security',
      year: 2018,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_qld_dnrme',
    name: 'Australian QLD DNRME',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Queensland Urban Drainage Manual',
      citation: 'Queensland Dept. of Natural Resources',
      year: 2013,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_sa_epa',
    name: 'Australian SA EPA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SA Stormwater Pollution Prevention Code of Practice',
      citation: 'SA Environment Protection Authority',
      year: 2003,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_tas_dpiwe',
    name: 'Australian TAS DPIWE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Tasmanian Stormwater Guidelines',
      citation: 'TAS Dept. of Primary Industries, Water and Environment',
      year: 2010,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_vic_delwp',
    name: 'Australian VIC DELWP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Victorian Stormwater Management Guidelines',
      citation: 'Dept. of Environment, Land, Water and Planning',
      year: 2019,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'aus_wa_dwer',
    name: 'Australian WA DWER',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'WA Stormwater Management Manual',
      citation: 'WA Dept. of Water and Environmental Regulation',
      year: 2007,
    },
    notes: 'Australian state/territory design storm based on ARR 2019 ensemble framework with regional adjustments.'
  },
  {
    pattern: 'azerbaijan_nhms',
    name: 'Azerbaijan NHMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NHMS IDF and Drainage Standards',
      citation: 'National Hydrometeorology Service Azerbaijan',
      year: 2016,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'bangladesh_bmd',
    name: 'Bangladesh BMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Bangladesh BMD Design Storm Standard',
      citation: 'Bangladesh BMD',
      year: 2020,
    },
    notes: 'Design storm pattern for Monsoon rear-loaded.'
  },
  {
    pattern: 'bangladesh_dwasa',
    name: 'Bangladesh DWASA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DWASA Drainage Design Standards',
      citation: 'Dhaka WASA',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'barbados_bms',
    name: 'Barbados BMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Barbados BMS Design Storm Standard',
      citation: 'Barbados BMS',
      year: 2020,
    },
    notes: 'Design storm pattern for Tropical maritime Hershfield PMP.'
  },
  {
    pattern: 'bc_moe_interior',
    name: 'BC MOE Interior',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'BC Ministry of Environment Interior Rainfall IDF',
      citation: 'BC Ministry of Environment',
      year: 2015,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'bc_moe_northern',
    name: 'BC MOE Northern',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'BC Ministry of Environment Northern Rainfall IDF',
      citation: 'BC Ministry of Environment',
      year: 2015,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'belgian_irm',
    name: 'Belgium IRM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Belgium IRM Design Storm Standard',
      citation: 'Belgium IRM',
      year: 2020,
    },
    notes: 'Design storm pattern for Belgian center-peaked.'
  },
  {
    pattern: 'belize_flood',
    name: 'Belize Flood Hazard',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Belize Flood Hazard Design Standards',
      citation: 'National Emergency Management Organization',
      year: 2015,
    },
    notes: 'Central American coastal flood design for tropical conditions.'
  },
  {
    pattern: 'bemposta',
    name: 'Bemposta (Portugal)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Bemposta Portuguese Regional Design Storm',
      citation: 'LNEC Portugal',
      year: 1990,
    },
    notes: 'Portuguese dam and drainage design criteria'
  },
  {
    pattern: 'bhutan_scs',
    name: 'Bhutan SCS Design Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Bhutan SCS-Adapted Design Storm',
      citation: 'Royal Government of Bhutan / UNDP',
      year: 2017,
    },
    notes: 'Southern Belt SCS-adapted design storm for Himalayan conditions.'
  },
  {
    pattern: 'bolivia_altiplano',
    name: 'Bolivia Altiplano',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Bolivia Altiplano Design Storm Standard',
      citation: 'Bolivia Altiplano',
      year: 2020,
    },
    notes: 'Design storm pattern for Modified SCS Type I high-altitude.'
  },
  {
    pattern: 'bolivia_sepsa',
    name: 'Bolivia SEPSA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Norma Boliviana de Diseño de Drenaje Pluvial',
      citation: 'SEPSA Bolivia',
      year: 2012,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'bosnia_fhmz',
    name: 'Bosnia & Herzegovina FHMZ',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'FHMZ Bosnia Drainage Design Standards',
      citation: 'Federal Hydrometeorological Institute BiH',
      year: 2014,
    },
    notes: 'Mediterranean-continental transition design storm.'
  },
  {
    pattern: 'botswana_dms',
    name: 'Botswana DMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Botswana Meteorological Design Standards',
      citation: 'DMS Botswana',
      year: 2015,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'brazil_ana',
    name: 'Brazil ANA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Brazil ANA Design Storm Standard',
      citation: 'Brazil ANA',
      year: 2020,
    },
    notes: 'Design storm pattern for Tropical convective SE Brazil.'
  },
  {
    pattern: 'brunei_bdmd',
    name: 'Brunei BDMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Brunei BDMD Design Storm Standard',
      citation: 'Brunei BDMD',
      year: 2020,
    },
    notes: 'Design storm pattern for Equatorial maritime front-loaded tropical burst.'
  },
  {
    pattern: 'bulgarian_nimh_urban',
    name: 'Bulgarian NIMH Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NIMH Urban Drainage Design Criteria',
      citation: 'NIMH Bulgaria',
      year: 2017,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'burkina_anam',
    name: 'Burkina Faso ANAM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Burkina Faso ANAM Design Storm Standard',
      citation: 'Burkina Faso ANAM',
      year: 2020,
    },
    notes: 'Design storm pattern for West African Sahel MCS front-loaded.'
  },
  {
    pattern: 'burundi_igebu',
    name: 'Burundi IGEBU',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'IGEBU Hydrological Design Standards',
      citation: 'IGEBU Burundi',
      year: 2014,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'cambodia_mowram',
    name: 'Cambodia MOWRAM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MOWRAM Drainage Design Standards',
      citation: 'Ministry of Water Resources Cambodia',
      year: 2016,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'canadian_eccc_climate',
    name: 'Canadian ECCC Climate-Adjusted',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ECCC Climate-Adjusted IDF Curves',
      citation: 'Environment and Climate Change Canada',
      year: 2022,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'cape_verde_inmg',
    name: 'Cape Verde INMG',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'INMG Rainfall Design Atlas',
      citation: 'INMG Cape Verde',
      year: 2016,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'caribbean_cdema',
    name: 'Caribbean CDEMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Caribbean Disaster Risk Reduction Design Standards',
      citation: 'CDEMA',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'cascading_failure',
    name: 'Cascading Failure Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Infrastructure Cascading Failure Storm',
      citation: 'Rinaldi et al. (2001)',
      year: 2001,
    },
    notes: 'Sequential infrastructure failure scenario storm profile'
  },
  {
    pattern: 'cc_idf_scaled',
    name: 'CC-IDF Scaled',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CC-IDF Scaled Design Storm Standard',
      citation: 'CC-IDF Scaled',
      year: 2020,
    },
    notes: 'Design storm pattern for Climate-change scaled SCS Type II.'
  },
  {
    pattern: 'chen_1976',
    name: 'Chen (1976)',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rainfall Intensity-Duration-Frequency Formulas',
      citation: 'Chen, C.L.',
      year: 1976,
    },
    notes: 'Generalized IDF formula connecting short and long duration rainfall'
  },
  {
    pattern: 'chile_dga',
    name: 'Chile DGA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Chile DGA Design Storm Standard',
      citation: 'Chile DGA',
      year: 2020,
    },
    notes: 'Design storm pattern for Frontal/orographic central Chile.'
  },
  {
    pattern: 'chile_idic',
    name: 'Chile IDIC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Carreteras — Hidrología y Drenaje',
      citation: 'MOP Chile / IDIC',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'china_beijing',
    name: 'China Beijing',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Beijing Municipal Drainage Design Standard',
      citation: 'Beijing Municipal Commission',
      year: 2020,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'china_guangzhou',
    name: 'China Guangzhou',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Guangzhou Municipal Drainage Design',
      citation: 'Guangzhou Urban Planning Bureau',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'china_mohurd',
    name: 'China MOHURD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MOHURD Urban Drainage Design Standard',
      citation: 'Ministry of Housing and Urban-Rural Development',
      year: 2021,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'china_shanghai',
    name: 'China Shanghai',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Shanghai Municipal Drainage Design Standard',
      citation: 'Shanghai Urban Planning Bureau',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'china_shenzhen',
    name: 'China Shenzhen',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Shenzhen Sponge City Drainage Design',
      citation: 'Shenzhen Municipality',
      year: 2020,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'chocat_1997',
    name: 'Chocat (1997)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Encyclopédie de l\'hydrologie urbaine et de l\'assainissement',
      citation: 'Chocat, B.',
      year: 1997,
    },
    notes: 'French urban drainage methodology comprehensive reference'
  },
  {
    pattern: 'chow_1964',
    name: 'Chow (1964)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Handbook of Applied Hydrology',
      citation: 'Chow, V.T.',
      year: 1964,
    },
    notes: 'Classic hydrology reference including design storm synthesis methods'
  },
  {
    pattern: 'cloudburst',
    name: 'Cloudburst',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Copenhagen Cloudburst Management Plan',
      citation: 'City of Copenhagen',
      year: 2012,
    },
    notes: 'Extreme urban pluvial design based on 2011 Copenhagen cloudbursts'
  },
  {
    pattern: 'cmip6_idf',
    name: 'CMIP6 Derived IDF',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CMIP6 Climate Model Derived IDF Curves',
      citation: 'IPCC AR6 / WMO',
      year: 2021,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'colombia_ideam',
    name: 'Colombia IDEAM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Colombia IDEAM Design Storm Standard',
      citation: 'Colombia IDEAM',
      year: 2020,
    },
    notes: 'Design storm pattern for Andean valley convective.'
  },
  {
    pattern: 'colombia_invias',
    name: 'Colombia INVIAS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Drenaje para Carreteras',
      citation: 'INVIAS Colombia',
      year: 2009,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'comoros_post_kenneth',
    name: 'Comoros Post-Kenneth',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Comoros Post-Cyclone Kenneth Design Standards',
      citation: 'UN-Habitat / Comoros Government',
      year: 2019,
    },
    notes: 'Post-tropical cyclone recovery infrastructure design storm.'
  },
  {
    pattern: 'compound_flood',
    name: 'Compound Flood Storm',
    category: 'cumulative',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Compound Flood Storm Framework',
      citation: 'Zscheischler et al. (2018)',
      year: 2018,
    },
    notes: 'Multivariate framework for joint fluvial-pluvial-coastal events'
  },
  {
    pattern: 'congo_mettelsat',
    name: 'Congo DRC METTELSAT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Congo DRC METTELSAT Design Storm Standard',
      citation: 'Congo DRC METTELSAT',
      year: 2020,
    },
    notes: 'Design storm pattern for Equatorial convective center-peaked.'
  },
  {
    pattern: 'connecticut_ctdot',
    name: 'Connecticut CTDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Connecticut DOT Drainage Manual',
      citation: 'Connecticut Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'costa_rica_mopt',
    name: 'Costa Rica MOPT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Diseño de Obras de Drenaje',
      citation: 'MOPT Costa Rica',
      year: 2015,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'croatian_hv',
    name: 'Croatian HRVATSKE VODE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Pravilnik o odvodnji oborinskih voda',
      citation: 'HRVATSKE VODE Croatia',
      year: 2016,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'csa_w231',
    name: 'CSA W231 (Canada)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CSA W231 (Canada) Design Storm Standard',
      citation: 'CSA W231 (Canada)',
      year: 2020,
    },
    notes: 'Design storm pattern for Canadian climate-adjusted IDF.'
  },
  {
    pattern: 'cyprus_wdd',
    name: 'Cyprus WDD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Cyprus WDD Design Storm Standard',
      citation: 'Cyprus WDD',
      year: 2020,
    },
    notes: 'Design storm pattern for Mediterranean double-triangular.'
  },
  {
    pattern: 'czech_chmu',
    name: 'Czech ČHMÚ',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Czech ČHMÚ Design Storm Standard',
      citation: 'Czech ČHMÚ',
      year: 2020,
    },
    notes: 'Design storm pattern for Czech modern hydrometeorological.'
  },
  {
    pattern: 'czech_dia',
    name: 'Czech DIA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ČSN 73 6101 Road Design Standard — Drainage',
      citation: 'DIA Czech Republic',
      year: 2018,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'danish_dkcip',
    name: 'Danish DKCIP',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Danish Climate Infrastructure Platform',
      citation: 'Danish Meteorological Institute',
      year: 2018,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'danish_svk',
    name: 'Denmark SVK',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Denmark SVK Design Storm Standard',
      citation: 'Denmark SVK',
      year: 2020,
    },
    notes: 'Design storm pattern for Danish Chicago variant.'
  },
  {
    pattern: 'danish_svk_urban',
    name: 'Danish SVK Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Funktionspraksis for afløbssystemer under regn',
      citation: 'SVK Denmark',
      year: 2005,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'delta_change',
    name: 'Delta Change Method',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Delta Change Method for Climate-Adjusted IDF',
      citation: 'Willems (2013)',
      year: 2013,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'desbordes_1978',
    name: 'Desbordes (1978)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'French Double-Triangle Design Storm',
      citation: 'Desbordes, M.',
      year: 1978,
    },
    notes: 'Urban drainage design storm widely adopted in Francophone countries'
  },
  {
    pattern: 'dominica_charim',
    name: 'Dominica CHaRIM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Dominica CHaRIM Flood Hazard Design',
      citation: 'World Bank / CHARIM',
      year: 2015,
    },
    notes: 'Caribbean risk management design storm for volcanic island context.'
  },
  {
    pattern: 'dutch_knmi14',
    name: 'Dutch KNMI-14',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'KNMI\'14 Climate Scenarios for the Netherlands',
      citation: 'KNMI',
      year: 2014,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'dutch_knmi23',
    name: 'Dutch KNMI-23',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'KNMI\'23 Climate Scenarios for the Netherlands',
      citation: 'KNMI',
      year: 2023,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'ecuador_emaapq',
    name: 'Ecuador EMAAP-Q',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Normas de Diseño de Sistemas de Alcantarillado',
      citation: 'EMAAP-Q Quito',
      year: 2009,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'ecuador_inamhi',
    name: 'Ecuador INAMHI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ecuador INAMHI Design Storm Standard',
      citation: 'Ecuador INAMHI',
      year: 2020,
    },
    notes: 'Design storm pattern for Andean convective.'
  },
  {
    pattern: 'egypt_capw',
    name: 'Egypt CAPW',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CAPW Drainage Design Manual',
      citation: 'Cairo and Alexandria Potable Water Authority',
      year: 2012,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'egypt_hcww',
    name: 'Egypt HCWW',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Egypt HCWW Design Storm Standard',
      citation: 'Egypt HCWW',
      year: 2020,
    },
    notes: 'Design storm pattern for Arid flash flood Nile Delta.'
  },
  {
    pattern: 'el_salvador_mop',
    name: 'El Salvador MOP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Drenaje — MOP',
      citation: 'MOP El Salvador',
      year: 2010,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'epa_swmm_cat',
    name: 'EPA SWMM-CAT',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'EPA SWMM Climate Adjustment Tool',
      citation: 'US Environmental Protection Agency',
      year: 2016,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'eritrea_dme',
    name: 'Eritrea DME',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DME Rainfall and Drainage Design Guidelines',
      citation: 'DME Eritrea',
      year: 2012,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'ethiopia_addis',
    name: 'Ethiopia Addis Ababa',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Addis Ababa Stormwater Drainage Master Plan',
      citation: 'City of Addis Ababa',
      year: 2017,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'ethiopia_nma',
    name: 'Ethiopia NMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ethiopia NMA Design Storm Standard',
      citation: 'Ethiopia NMA',
      year: 2020,
    },
    notes: 'Design storm pattern for East African monsoon.'
  },
  {
    pattern: 'euro_cordex',
    name: 'EURO-CORDEX',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'EURO-CORDEX Regional Climate Model Ensemble',
      citation: 'WCRP CORDEX',
      year: 2020,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'faa_airport',
    name: 'FAA Standard (Airport)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'FAA Advisory Circular AC 150/5320-5D — Airport Drainage Design',
      citation: 'Federal Aviation Administration',
      year: 2013,
    },
    notes: 'Airport drainage design using rational method and SCS methodology for airfield facilities.'
  },
  {
    pattern: 'fiji_fms',
    name: 'Fiji FMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Fiji FMS Design Storm Standard',
      citation: 'Fiji FMS',
      year: 2020,
    },
    notes: 'Design storm pattern for Tropical cyclone front-loaded.'
  },
  {
    pattern: 'fiji_ndmo',
    name: 'Fiji NDMO',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Fiji NDMO Flood Risk Design Standards',
      citation: 'National Disaster Management Office',
      year: 2017,
    },
    notes: 'Pacific island design storm using regional IDF data adapted for tropical maritime conditions.'
  },
  {
    pattern: 'finnish_ely',
    name: 'Finnish ELY',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ELY Regional Drainage Design Guidelines',
      citation: 'Finnish ELY Centres',
      year: 2018,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'finnish_fmi',
    name: 'Finland FMI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Finland FMI Design Storm Standard',
      citation: 'Finland FMI',
      year: 2020,
    },
    notes: 'Design storm pattern for Finnish Chicago variant.'
  },
  {
    pattern: 'fourier_multipeak',
    name: 'Fourier Multi-Peak',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Fourier Series Multi-Peak Storm Model',
      citation: 'Research method',
      year: 2010,
    },
    notes: 'Fourier harmonic decomposition for complex multi-peak storms'
  },
  {
    pattern: 'france_shypre',
    name: 'France SHYPRE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'France SHYPRE Design Storm Standard',
      citation: 'France SHYPRE',
      year: 2020,
    },
    notes: 'Design storm pattern for French SHYPRE stochastic hyetograph.'
  },
  {
    pattern: 'french_drias',
    name: 'French DRIAS 2020',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DRIAS 2020: French Climate Projections',
      citation: 'Météo-France',
      year: 2020,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'gabon_francophone',
    name: 'Gabon Francophone',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Gabon Francophone Design Methodology',
      citation: 'ORSTOM/IRD France',
      year: 2010,
    },
    notes: 'French African hydrological design methodology for equatorial regions.'
  },
  {
    pattern: 'gambia_rna',
    name: 'Gambia RNA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Gambia Rapid Needs Assessment Rainfall',
      citation: 'World Bank / UNDP',
      year: 2016,
    },
    notes: 'West African rapid needs assessment design storm.'
  },
  {
    pattern: 'gaussian_storm',
    name: 'Gaussian Storm',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Gaussian (Normal) Design Storm Distribution',
      citation: 'Statistical Methods in Hydrology',
      year: 2000,
    },
    notes: 'Symmetric bell-curve storm using normal distribution'
  },
  {
    pattern: 'gauteng_wrc',
    name: 'Gauteng WRC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'WRC Gauteng Design Storm Report',
      citation: 'Water Research Commission SA',
      year: 2013,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'georgia_gdot',
    name: 'Georgia GDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Georgia DOT Drainage Design Policy Manual',
      citation: 'Georgia Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'georgian_nea',
    name: 'Georgia NEA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NEA Georgia Rainfall Design Standards',
      citation: 'National Environment Agency Georgia',
      year: 2017,
    },
    notes: 'Caucasus design storm with Mediterranean influence.'
  },
  {
    pattern: 'german_dwd_extrem',
    name: 'German DWD-EXTREM',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DWD EXTREM Climate Extremes Analysis',
      citation: 'Deutscher Wetterdienst',
      year: 2020,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'ghana_accra',
    name: 'Ghana Accra AMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'AMA Stormwater Management Guidelines',
      citation: 'Accra Metropolitan Assembly',
      year: 2014,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'ghana_gmet',
    name: 'Ghana GMet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ghana GMet Design Storm Standard',
      citation: 'Ghana GMet',
      year: 2020,
    },
    notes: 'Design storm pattern for West African front-loaded.'
  },
  {
    pattern: 'greek_ye',
    name: 'Greek YE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Technical Guidelines for Storm Drainage',
      citation: 'YPEKA Greece',
      year: 2014,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'grenada_charim',
    name: 'Grenada CHaRIM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Grenada CHaRIM Flood Hazard Design',
      citation: 'World Bank / CHARIM',
      year: 2015,
    },
    notes: 'Caribbean Handbook for Risk Information Management — Grenada component.'
  },
  {
    pattern: 'guatemala_civ',
    name: 'Guatemala CIV',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Drenaje para Carreteras',
      citation: 'CIV Guatemala',
      year: 2011,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'guo_2001',
    name: 'Guo (2001)',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Analytical Probabilistic Approach to Design Storm',
      citation: 'Guo, J.C.Y.',
      year: 2001,
    },
    notes: 'Analytically derived design storm for detention basin sizing'
  },
  {
    pattern: 'guyana_drainage',
    name: 'Guyana Drainage Design',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Guyana Drainage and Irrigation Design',
      citation: 'Ministry of Agriculture Guyana',
      year: 2014,
    },
    notes: 'Modified rational method for South American coastal lowland drainage.'
  },
  {
    pattern: 'haiti_marndr',
    name: 'Haiti MARNDR',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Haiti MARNDR Flood Hazard Design',
      citation: 'MARNDR / World Bank',
      year: 2016,
    },
    notes: 'HEC-HMS alternating block Caribbean post-disaster design storm.'
  },
  {
    pattern: 'heat_enhanced',
    name: 'Heat-Enhanced Convective',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Heat-Enhanced Convective Storm',
      citation: 'Lenderink & Meijgaard (2008)',
      year: 2008,
    },
    notes: 'Climate-adjusted storm for urban heat island convective enhancement'
  },
  {
    pattern: 'hendrick_1973',
    name: 'Hendrick (1973)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Canadian Short-Duration Rainfall Design Storm',
      citation: 'Hendrick, R.L.',
      year: 1973,
    },
    notes: 'Regional temporal distribution for Canadian practice'
  },
  {
    pattern: 'hershfield_1961',
    name: 'Hershfield (1961)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rainfall Frequency Atlas of the United States',
      citation: 'Hershfield, D.M.',
      year: 1961,
    },
    notes: 'Foundation for PMP estimation methodology — TP-40'
  },
  {
    pattern: 'hirds_nz',
    name: 'HIRDS NZ',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HIRDS NZ Design Storm Standard',
      citation: 'HIRDS NZ',
      year: 2020,
    },
    notes: 'Design storm pattern for NZ hyperbolic tangent.'
  },
  {
    pattern: 'honduras_soptravi',
    name: 'Honduras SOPTRAVI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Drenaje Vial',
      citation: 'SOPTRAVI Honduras',
      year: 2008,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'hong_kong_hko',
    name: 'Hong Kong HKO',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Hong Kong HKO Design Storm Standard',
      citation: 'Hong Kong HKO',
      year: 2020,
    },
    notes: 'Design storm pattern for HKO typhoon front-loaded.'
  },
  {
    pattern: 'hungarian_kovizig',
    name: 'Hungarian KÖVÍZIG',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'KÖVÍZIG Regional Water Management IDF',
      citation: 'KÖVÍZIG Hungary',
      year: 2016,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'icelandic_lhf',
    name: 'Icelandic LHF',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Local Flood Hazard Assessment Guidelines',
      citation: 'Icelandic Met Office / VSO',
      year: 2019,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'idaho_itd',
    name: 'Idaho ITD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Idaho Transportation Department Drainage Manual',
      citation: 'Idaho Transportation Department',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'indonesia_bmkg',
    name: 'Indonesia BMKG',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Indonesia BMKG Design Storm Standard',
      citation: 'Indonesia BMKG',
      year: 2020,
    },
    notes: 'Design storm pattern for Indonesian tropical convective.'
  },
  {
    pattern: 'indonesia_jakarta',
    name: 'Indonesia DKI Jakarta',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DKI Jakarta Provincial Drainage Standards',
      citation: 'Jakarta Provincial Government',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'iran_irimo',
    name: 'Iran IRIMO',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Iran IRIMO Design Storm Standard',
      citation: 'Iran IRIMO',
      year: 2020,
    },
    notes: 'Design storm pattern for Iranian meteorological IDF.'
  },
  {
    pattern: 'iran_irimo_regional',
    name: 'Iran IRIMO Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'IRIMO Regional IDF Atlas',
      citation: 'Iran Meteorological Organization',
      year: 2018,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'iraq_mos',
    name: 'Iraq MoS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Iraq MoS Design Storm Standard',
      citation: 'Iraq MoS',
      year: 2020,
    },
    notes: 'Design storm pattern for Iraqi Tigris-Euphrates basin.'
  },
  {
    pattern: 'iraq_mosul',
    name: 'Iraq Mosul',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mosul Region Drainage Design Guidelines',
      citation: 'Iraq Ministry of Construction & Housing',
      year: 2010,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'israel_ims',
    name: 'Israel IMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Israel IMS Design Storm Standard',
      citation: 'Israel IMS',
      year: 2020,
    },
    notes: 'Design storm pattern for Israeli arid/semi-arid convective.'
  },
  {
    pattern: 'italian_ipcc',
    name: 'Italian IPCC-AR6',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Italian IPCC-AR6 Climate Projections',
      citation: 'ISPRA / CMCC',
      year: 2021,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'jamaica_jie',
    name: 'Jamaica JIE Guidelines',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'JIE Guidelines for Stormwater Management',
      citation: 'Jamaica Institution of Engineers',
      year: 2017,
    },
    notes: 'Caribbean engineering design storm guidelines.'
  },
  {
    pattern: 'japan_mlit_urban',
    name: 'Japan MLIT Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MLIT Urban Drainage Technical Standards',
      citation: 'Ministry of Land, Infrastructure, Transport',
      year: 2021,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'japan_osaka',
    name: 'Japan Osaka City',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Osaka City Drainage Design Manual',
      citation: 'Osaka City Government',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'johnson_sb_caribbean',
    name: 'Johnson SB Caribbean',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Johnson SB Distribution for Caribbean Rainfall',
      citation: 'Johnson (1949) / CHARIM (2015)',
      year: 2015,
    },
    notes: 'Flexible 4-parameter probability distribution for Caribbean rainfall extremes.'
  },
  {
    pattern: 'kansas_kdot',
    name: 'Kansas KDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Kansas DOT Design Manual',
      citation: 'Kansas Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'kazakhstan_kazhydromet',
    name: 'Kazakhstan Kazhydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Kazakhstan Kazhydromet Design Storm Standard',
      citation: 'Kazakhstan Kazhydromet',
      year: 2020,
    },
    notes: 'Design storm pattern for Central Asian continental.'
  },
  {
    pattern: 'keifer_1940',
    name: 'Keifer (1940)',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Synthetic Storm Pattern for Drainage Design',
      citation: 'Keifer, C.J.',
      year: 1940,
    },
    notes: 'Precursor to the 1957 Keifer-Chu instantaneous intensity method'
  },
  {
    pattern: 'keifer_chu',
    name: 'Keifer-Chu (1957)',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Synthetic Storm Pattern for Drainage Design',
      citation: 'Keifer, C.J. & Chu, H.H.',
      year: 1957,
    },
    notes: 'Original instantaneous intensity method using IDF relationships'
  },
  {
    pattern: 'kenya_kmd',
    name: 'Kenya KMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Kenya KMD Design Storm Standard',
      citation: 'Kenya KMD',
      year: 2020,
    },
    notes: 'Design storm pattern for East African highland convective.'
  },
  {
    pattern: 'kenya_nairobi',
    name: 'Kenya Nairobi City',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Nairobi City Stormwater Management Manual',
      citation: 'Nairobi City County',
      year: 2015,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'korea_moe_urban',
    name: 'Korea MOE Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MOE Urban Drainage Design Standards',
      citation: 'Korea Ministry of Environment',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'kosovo_nothas',
    name: 'Kosovo NOTHAS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NOTHAS Kosovo IDF Standards',
      citation: 'National Observatory Kosovo',
      year: 2018,
    },
    notes: 'Southeastern European continental design storm.'
  },
  {
    pattern: 'kyrgyzstan_hydromet',
    name: 'Kyrgyzstan Hydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Kyrgyzstan Hydromet Design Standards',
      citation: 'Kyrgyz Hydrometeorology Agency',
      year: 2015,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'laos_dmh',
    name: 'Laos DMH',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Laos DMH Design Storm Standard',
      citation: 'Laos DMH',
      year: 2020,
    },
    notes: 'Design storm pattern for Southeast Asian monsoon early-center peaked.'
  },
  {
    pattern: 'laos_jica',
    name: 'Laos JICA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'JICA Laos Flood Protection Study',
      citation: 'JICA',
      year: 2013,
    },
    notes: 'JICA-developed monsoon design storm for SE Asian conditions.'
  },
  {
    pattern: 'liberia_regional',
    name: 'Liberia Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Liberia Regional Roads IDF',
      citation: 'World Bank / Liberia Roads Authority',
      year: 2016,
    },
    notes: 'West African tropical design storm for road infrastructure.'
  },
  {
    pattern: 'louisiana_dotd',
    name: 'Louisiana DOTD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Louisiana DOTD Hydraulics Manual',
      citation: 'Louisiana Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'maine_mainedot',
    name: 'Maine MaineDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Maine DOT Highway Design Guide',
      citation: 'Maine Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'malaysia_did',
    name: 'Malaysia DID',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DID Urban Drainage Design Manual (MSMA 2nd Ed.)',
      citation: 'Dept. of Irrigation and Drainage Malaysia',
      year: 2012,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'malaysia_msma',
    name: 'Malaysia MSMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Malaysia MSMA Design Storm Standard',
      citation: 'Malaysia MSMA',
      year: 2020,
    },
    notes: 'Design storm pattern for Malaysian MSMA tropical monsoon.'
  },
  {
    pattern: 'maldives_mms',
    name: 'Maldives MMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MMS Climate and Drainage Design',
      citation: 'Maldives Meteorological Service',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'mali_dnm',
    name: 'Mali DNM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mali DNM Design Storm Standard',
      citation: 'Mali DNM',
      year: 2020,
    },
    notes: 'Design storm pattern for Sahel squall line very front-loaded burst.'
  },
  {
    pattern: 'mali_lmoments',
    name: 'Mali L-moments',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mali L-Moments Rainfall Frequency',
      citation: 'Bani Basin Study / ABN',
      year: 2014,
    },
    notes: 'L-moments frequency analysis for Sahel design storms.'
  },
  {
    pattern: 'malta_mra',
    name: 'Malta MRA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Malta MRA Design Storm Standard',
      citation: 'Malta MRA',
      year: 2020,
    },
    notes: 'Design storm pattern for Composite Chicago-Huff hybrid.'
  },
  {
    pattern: 'manitoba_mi',
    name: 'Manitoba MI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manitoba Infrastructure Drainage Standards',
      citation: 'Manitoba Infrastructure',
      year: 2015,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'marshall_islands',
    name: 'Marshall Islands Ebeye',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Marshall Islands Coastal Protection Design',
      citation: 'USACE / RMI Government',
      year: 2018,
    },
    notes: 'Pacific atoll design storm for coastal infrastructure protection.'
  },
  {
    pattern: 'maryland_sha',
    name: 'Maryland SHA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Maryland SHA Drainage Manual',
      citation: 'Maryland State Highway Administration',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'massachusetts_massdot',
    name: 'Massachusetts MassDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MassDOT Highway Drainage Manual',
      citation: 'Massachusetts Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'mauritania_regional',
    name: 'Mauritania Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mauritania Regional Arid Design Storm',
      citation: 'OMVS / Mauritania Met',
      year: 2015,
    },
    notes: 'Saharan-Sahelian arid region design storm.'
  },
  {
    pattern: 'mexico_conagua',
    name: 'Mexico CONAGUA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mexico CONAGUA Design Storm Standard',
      citation: 'Mexico CONAGUA',
      year: 2020,
    },
    notes: 'Design storm pattern for Front-loaded tropical convective.'
  },
  {
    pattern: 'micronesia_fsm',
    name: 'Micronesia FSM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'FSM Infrastructure Design Standards',
      citation: 'Government of Micronesia',
      year: 2016,
    },
    notes: 'Pacific island tropical convective design storm.'
  },
  {
    pattern: 'mississippi_mdot',
    name: 'Mississippi MDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mississippi DOT Drainage Manual',
      citation: 'Mississippi Department of Transportation',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'moldova_shs',
    name: 'Moldova SHS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SHS Moldova Drainage Standards',
      citation: 'State Hydrometeorological Service Moldova',
      year: 2015,
    },
    notes: 'Eastern European continental design storm for drainage infrastructure.'
  },
  {
    pattern: 'moldova_urban',
    name: 'Moldova Urban Drainage',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Moldova Urban Drainage Design Manual',
      citation: 'Municipal Authority of Chișinău',
      year: 2018,
    },
    notes: 'Updated urban drainage design for Moldovan cities.'
  },
  {
    pattern: 'mongolia_namem',
    name: 'Mongolia NAMEM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mongolia NAMEM Design Storm Standard',
      citation: 'Mongolia NAMEM',
      year: 2020,
    },
    notes: 'Design storm pattern for High-altitude cold-arid continental.'
  },
  {
    pattern: 'mongolia_ulaanbaatar',
    name: 'Mongolia Ulaanbaatar',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ulaanbaatar Urban Drainage Master Plan',
      citation: 'City of Ulaanbaatar / ADB',
      year: 2017,
    },
    notes: 'Continental steppe climate urban design storm.'
  },
  {
    pattern: 'montana_mdt',
    name: 'Montana MDT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Montana DOT Drainage Manual',
      citation: 'Montana Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'montenegro_ihms',
    name: 'Montenegro IHMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'IHMS Montenegro Precipitation Design Standards',
      citation: 'Institute of Hydrometeorology Montenegro',
      year: 2015,
    },
    notes: 'Adriatic coast orographic design storm.'
  },
  {
    pattern: 'montenegro_regional',
    name: 'Montenegro Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Montenegro Regional Drainage Standards',
      citation: 'Infrastructure Ministry Montenegro',
      year: 2017,
    },
    notes: 'Municipal drainage design standards.'
  },
  {
    pattern: 'morocco_dmn',
    name: 'Morocco DMN',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Morocco DMN Design Storm Standard',
      citation: 'Morocco DMN',
      year: 2020,
    },
    notes: 'Design storm pattern for North African Mediterranean.'
  },
  {
    pattern: 'morocco_ormvat',
    name: 'Morocco ORMVAT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Guide de conception du drainage',
      citation: 'ORMVAT Morocco',
      year: 2010,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'mozambique_inam',
    name: 'Mozambique INAM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Mozambique INAM Design Storm Standard',
      citation: 'Mozambique INAM',
      year: 2020,
    },
    notes: 'Design storm pattern for SE African coastal.'
  },
  {
    pattern: 'mozambique_maputo',
    name: 'Mozambique Maputo',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Maputo Stormwater Master Plan',
      citation: 'City of Maputo',
      year: 2016,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'myanmar_yangon',
    name: 'Myanmar Yangon IDF',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Yangon IDF-Derived Design Storm',
      citation: 'YCDC / JICA',
      year: 2018,
    },
    notes: 'Monsoon tropical urban IDF design for Myanmar.'
  },
  {
    pattern: 'myanmar_ycdc',
    name: 'Myanmar Yangon YCDC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'YCDC Drainage Design Manual',
      citation: 'Yangon City Development Committee',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'naiad_enhanced',
    name: 'NAIAD Enhanced',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NAIAD: Nature-Based Solutions Design Standards',
      citation: 'EU Horizon 2020 NAIAD Project',
      year: 2019,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'nauru_regional',
    name: 'Nauru Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Nauru Regional Drainage Standards',
      citation: 'Government of Nauru / SPC',
      year: 2017,
    },
    notes: 'Smallest Pacific island state design approach.'
  },
  {
    pattern: 'nebraska_ndot',
    name: 'Nebraska NDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Nebraska DOT Drainage Manual',
      citation: 'Nebraska Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'neom_design',
    name: 'NEOM Design Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NEOM Infrastructure Design Criteria',
      citation: 'NEOM Company',
      year: 2023,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'nepal_kukl',
    name: 'Nepal Kathmandu KUKL',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'KUKL Drainage Design Manual',
      citation: 'Kathmandu Upatyaka Khanepani Limited',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'new_hampshire_nhdot',
    name: 'New Hampshire NHDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'New Hampshire DOT Drainage Manual',
      citation: 'New Hampshire Department of Transportation',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'new_jersey_njdot',
    name: 'New Jersey NJDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'New Jersey DOT Roadway Design Manual',
      citation: 'New Jersey Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'new_mexico_nmdot',
    name: 'New Mexico NMDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'New Mexico DOT Drainage Manual',
      citation: 'New Mexico Department of Transportation',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'new_york_nysdot',
    name: 'New York NYSDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'New York State DOT Highway Design Manual',
      citation: 'New York State Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'nicaragua_ineter',
    name: 'Nicaragua INETER',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Atlas Climatológico Nacional',
      citation: 'INETER Nicaragua',
      year: 2012,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'niger_regional',
    name: 'Niger Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Niger Regional Sahel Design Storm',
      citation: 'ABN / Niger Met',
      year: 2016,
    },
    notes: 'Sahel arid front-loaded design storm for infrastructure.'
  },
  {
    pattern: 'nigeria_abuja',
    name: 'Nigeria Abuja FCDA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'FCDA Infrastructure Design Standards',
      citation: 'Federal Capital Development Authority',
      year: 2017,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'nigeria_lagos',
    name: 'Nigeria Lagos LSWB',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Lagos State Drainage Design Manual',
      citation: 'Lagos State Water Board',
      year: 2019,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'nigeria_nimet',
    name: 'Nigeria NiMet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Nigeria NiMet Design Storm Standard',
      citation: 'Nigeria NiMet',
      year: 2020,
    },
    notes: 'Design storm pattern for West African monsoon ITCZ pattern.'
  },
  {
    pattern: 'noaa_a16',
    name: 'NOAA Atlas 16',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NOAA Atlas 16 Design Storm Standard',
      citation: 'NOAA Atlas 16',
      year: 2020,
    },
    notes: 'Design storm pattern for Next-gen NOAA western US atlas.'
  },
  {
    pattern: 'nonstationary_gev',
    name: 'Non-stationary GEV IDF',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Non-Stationary GEV Analysis of Extreme Precipitation',
      citation: 'Coles (2001) / Cheng & AghaKouchak',
      year: 2014,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'north_carolina_ncdot',
    name: 'North Carolina NCDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'North Carolina DOT Guidelines for Drainage Studies',
      citation: 'North Carolina Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'north_dakota_nddot',
    name: 'North Dakota NDDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'North Dakota DOT Design Manual',
      citation: 'North Dakota Department of Transportation',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'north_macedonia_hms',
    name: 'North Macedonia HMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMS North Macedonia IDF Standards',
      citation: 'Hydrometeorological Service N. Macedonia',
      year: 2016,
    },
    notes: 'Balkan continental-Mediterranean design storm.'
  },
  {
    pattern: 'north_macedonia_regional',
    name: 'North Macedonia Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'North Macedonia Regional Drainage Standards',
      citation: 'Infrastructure Ministry N. Macedonia',
      year: 2017,
    },
    notes: 'Regional drainage design beyond national standards.'
  },
  {
    pattern: 'norwegian_nccs',
    name: 'Norwegian NCCS',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NCCS Climate Adjusted IDF Curves for Norway',
      citation: 'Norwegian Centre for Climate Services',
      year: 2019,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'norwegian_nve',
    name: 'Norway NVE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Norway NVE Design Storm Standard',
      citation: 'Norway NVE',
      year: 2020,
    },
    notes: 'Design storm pattern for Norwegian Chicago variant.'
  },
  {
    pattern: 'norwegian_nve_urban',
    name: 'Norwegian NVE Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Urban Drainage Design — Climate Adapted',
      citation: 'NVE Norway',
      year: 2020,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'nunavut_cws',
    name: 'Nunavut CWS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Nunavut Community and Government Services Technical Guidelines',
      citation: 'Government of Nunavut',
      year: 2019,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'nwt_enr',
    name: 'Northwest Territories ENR',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NWT Environment and Natural Resources Drainage Guidelines',
      citation: 'Government of Northwest Territories',
      year: 2018,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'nz_auckland_ac',
    name: 'New Zealand Auckland AC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Auckland Council Technical Publication TP108',
      citation: 'Auckland Council',
      year: 2013,
    },
    notes: 'New Zealand local council design storm derived from HIRDS v4/NIWA rainfall data with regional frequency analysis.'
  },
  {
    pattern: 'nz_christchurch',
    name: 'Christchurch Canterbury',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Christchurch Canterbury Design Storm Standard',
      citation: 'Christchurch Canterbury',
      year: 2020,
    },
    notes: 'Design storm pattern for Canterbury rain-shadow plains.'
  },
  {
    pattern: 'nz_christchurch_ccc',
    name: 'New Zealand Christchurch CCC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Christchurch City Council Infrastructure Design Standard',
      citation: 'CCC',
      year: 2019,
    },
    notes: 'New Zealand local council design storm derived from HIRDS v4/NIWA rainfall data with regional frequency analysis.'
  },
  {
    pattern: 'nz_niwa',
    name: 'NZ NIWA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NZ NIWA Design Storm Standard',
      citation: 'NZ NIWA',
      year: 2020,
    },
    notes: 'Design storm pattern for NZ national NIWA standard.'
  },
  {
    pattern: 'nz_tp108',
    name: 'Auckland TP108',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Auckland TP108 Design Storm Standard',
      citation: 'Auckland TP108',
      year: 2020,
    },
    notes: 'Design storm pattern for Auckland Council TP108 maritime convective.'
  },
  {
    pattern: 'nz_wellington',
    name: 'Wellington Regional',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Wellington Regional Design Storm Standard',
      citation: 'Wellington Regional',
      year: 2020,
    },
    notes: 'Design storm pattern for Wellington frontal/orographic maritime.'
  },
  {
    pattern: 'nz_wellington_gwrc',
    name: 'New Zealand Wellington GWRC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Greater Wellington Regional Council Stormwater Guidelines',
      citation: 'GWRC',
      year: 2015,
    },
    notes: 'New Zealand local council design storm derived from HIRDS v4/NIWA rainfall data with regional frequency analysis.'
  },
  {
    pattern: 'oecs_caribbean',
    name: 'OECS Caribbean',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'OECS Caribbean Design Storm Standard',
      citation: 'OECS Caribbean',
      year: 2020,
    },
    notes: 'Design storm pattern for Eastern Caribbean Bell method + TC.'
  },
  {
    pattern: 'oklahoma_odot',
    name: 'Oklahoma ODOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Oklahoma DOT Storm Drainage Design Manual',
      citation: 'Oklahoma Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'oman_dgman',
    name: 'Oman DGMAN',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Oman DGMAN Design Storm Standard',
      citation: 'Oman DGMAN',
      year: 2020,
    },
    notes: 'Design storm pattern for Muscat wadi/Khareef flood.'
  },
  {
    pattern: 'ontario_moecp',
    name: 'Ontario MOECP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ontario Stormwater Management Planning and Design Manual',
      citation: 'Ontario MOECP (formerly MOE)',
      year: 2003,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'ontario_mto_12hr',
    name: 'Ontario MTO 12-hr',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ontario MTO Drainage Management Manual — 12-hour Storm',
      citation: 'Ontario Ministry of Transportation',
      year: 2008,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'ontario_mto_2hr',
    name: 'Ontario MTO 2-hr',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Ontario MTO Drainage Management Manual — 2-hour Storm',
      citation: 'Ontario Ministry of Transportation',
      year: 2008,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'pacific_sprep',
    name: 'Pacific SPREP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Pacific SPREP Design Storm Standard',
      citation: 'Pacific SPREP',
      year: 2020,
    },
    notes: 'Design storm pattern for Pacific SIDS tropical cyclone.'
  },
  {
    pattern: 'pakistan_cda',
    name: 'Pakistan CDA Islamabad',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CDA Infrastructure Design Manual',
      citation: 'Capital Development Authority Islamabad',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'pakistan_lda',
    name: 'Pakistan LDA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'LDA Development Standards — Drainage',
      citation: 'Lahore Development Authority',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'pakistan_pmd',
    name: 'Pakistan PMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Pakistan PMD Design Storm Standard',
      citation: 'Pakistan PMD',
      year: 2020,
    },
    notes: 'Design storm pattern for Monsoon beta distribution.'
  },
  {
    pattern: 'palau_usace',
    name: 'Palau USACE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Palau USACE Infrastructure Design',
      citation: 'US Army Corps of Engineers, Pacific Division',
      year: 2015,
    },
    notes: 'USACE TR-55 adapted for Pacific island conditions.'
  },
  {
    pattern: 'panama_mop',
    name: 'Panama MOP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Diseño de Alcantarillado Pluvial',
      citation: 'MOP Panama',
      year: 2014,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'paraguay_dnp',
    name: 'Paraguay DNP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Guía de Diseño de Drenaje',
      citation: 'DNP Paraguay',
      year: 2016,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'partial_duration',
    name: 'Partial Duration Series',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Partial Duration Series Frequency Analysis',
      citation: 'Langbein (1949) / Madsen et al. (1997)',
      year: 1997,
    },
    notes: 'PDS-based frequency analysis using peaks-over-threshold'
  },
  {
    pattern: 'pennsylvania_penndot',
    name: 'Pennsylvania PennDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'PennDOT Design Manual Part 2',
      citation: 'Pennsylvania Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'peru_provias',
    name: 'Peru PROVÍAS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manual de Hidrología, Hidráulica y Drenaje',
      citation: 'PROVÍAS Nacional, MTC',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF relationships and temporal distributions.'
  },
  {
    pattern: 'peru_senamhi',
    name: 'Peru SENAMHI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Peru SENAMHI Design Storm Standard',
      citation: 'Peru SENAMHI',
      year: 2020,
    },
    notes: 'Design storm pattern for Andean convective.'
  },
  {
    pattern: 'philippines_mmda',
    name: 'Philippines MMDA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MMDA Metro Manila Flood Management Standards',
      citation: 'Metro Manila Development Authority',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'philippines_pagasa',
    name: 'Philippines PAGASA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Philippines PAGASA Design Storm Standard',
      citation: 'Philippines PAGASA',
      year: 2020,
    },
    notes: 'Design storm pattern for Philippine typhoon/monsoon.'
  },
  {
    pattern: 'pilgrim_1977',
    name: 'Pilgrim (1977)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Temporal Patterns of Design Rainfall for Sydney',
      citation: 'Pilgrim, D.H. & Cordery, I.',
      year: 1977,
    },
    notes: 'Australian empirical temporal patterns from pluviograph analysis'
  },
  {
    pattern: 'pmp_hmr49',
    name: 'PMP HMR 49',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 49: Probable Maximum Precipitation — Colorado River and Great Basin Drainages',
      citation: 'National Weather Service, Office of Hydrology',
      year: 1977,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr50',
    name: 'PMP HMR 50',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 50: Standard Project Storm and Flood Determinations — East of 105th Meridian',
      citation: 'National Weather Service',
      year: 1978,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr52',
    name: 'PMP HMR 52',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 52: Application of PMP Estimates — United States East of the 105th Meridian',
      citation: 'Hansen, Schreiner, Miller (NWS)',
      year: 1982,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr53',
    name: 'PMP HMR 53',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 53: Seasonal Variation of 10-Square-Mile PMP — US West of 105th Meridian',
      citation: 'National Weather Service',
      year: 1980,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr55',
    name: 'PMP HMR 55',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 55A: PMP — Central and Eastern United States, Texas',
      citation: 'National Weather Service',
      year: 1988,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr57',
    name: 'PMP HMR 57',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 57: PMP — Pacific Northwest States',
      citation: 'National Weather Service',
      year: 1994,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr58',
    name: 'PMP HMR 58',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 58: PMP — California',
      citation: 'National Weather Service',
      year: 1998,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr59',
    name: 'PMP HMR 59',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 59: PMP — Colorado',
      citation: 'National Weather Service',
      year: 1999,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'pmp_hmr60',
    name: 'PMP HMR 60',
    category: 'cumulative',
    equations: [
      {
        label: 'PMP Estimation',
        latex: 'P_{PMP} = P_{mean} + K_m \cdot \sigma',
        description: 'Statistical/meteorological estimation of probable maximum precipitation'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HMR 60: Probable Maximum Precipitation — Hawaii',
      citation: 'National Weather Service',
      year: 2013,
    },
    notes: 'Hydrometeorological report providing PMP estimates for infrastructure design. Uses moisture maximization and storm transposition techniques.'
  },
  {
    pattern: 'png_ncd',
    name: 'PNG NCD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NCD Drainage Design Standards',
      citation: 'PNG National Capital District Commission',
      year: 2016,
    },
    notes: 'Pacific island design storm using regional IDF data adapted for tropical maritime conditions.'
  },
  {
    pattern: 'poland_panda',
    name: 'Poland PANDa',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Poland PANDa Design Storm Standard',
      citation: 'Poland PANDa',
      year: 2020,
    },
    notes: 'Design storm pattern for Polish national precipitation atlas.'
  },
  {
    pattern: 'polish_imgw_urban',
    name: 'Poland IMGW Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'IMGW Urban Drainage Design Storm Guidelines',
      citation: 'IMGW-PIB Poland',
      year: 2019,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'portugal_ipma',
    name: 'Portugal IPMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Portugal IPMA Design Storm Standard',
      citation: 'Portugal IPMA',
      year: 2020,
    },
    notes: 'Design storm pattern for Portuguese Mediterranean IDF.'
  },
  {
    pattern: 'puerto_rico',
    name: 'Puerto Rico',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Puerto Rico Design Storm Standard',
      citation: 'Puerto Rico',
      year: 2020,
    },
    notes: 'Design storm pattern for Tropical modified SCS II.'
  },
  {
    pattern: 'qatar_kahramaa',
    name: 'Qatar Kahramaa',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Qatar Kahramaa Design Storm Standard',
      citation: 'Qatar Kahramaa',
      year: 2020,
    },
    notes: 'Design storm pattern for Doha arid flash flood.'
  },
  {
    pattern: 'qatar_kahramaa_enhanced',
    name: 'Qatar Kahramaa Enhanced',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Qatar Kahramaa Updated Drainage Standards',
      citation: 'Kahramaa',
      year: 2024,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'qatar_qrrc',
    name: 'Qatar QRRC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Qatar Rainfall Runoff Center Design Standards',
      citation: 'QRRC Ministry of Municipality',
      year: 2016,
    },
    notes: 'Qatar climate-specific design storm for drainage infrastructure.'
  },
  {
    pattern: 'quantile_delta',
    name: 'Quantile Delta Mapping',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Quantile Delta Mapping for Bias Correction',
      citation: 'Cannon et al. (2015)',
      year: 2015,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'quebec_mtq',
    name: 'Quebec MTQ',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Manuel de conception des ponceaux',
      citation: 'Ministère des Transports du Québec',
      year: 2012,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'rhode_island_ridot',
    name: 'Rhode Island RIDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rhode Island DOT Design Manual',
      citation: 'Rhode Island Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'romanian_anar',
    name: 'Romanian ANAR',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ANAR Design Storm for Urban Drainage',
      citation: 'ANAR Romania',
      year: 2015,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'russia_roshydromet',
    name: 'Russia Roshydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Russia Roshydromet Design Storm Standard',
      citation: 'Russia Roshydromet',
      year: 2020,
    },
    notes: 'Design storm pattern for Russian continental IDF.'
  },
  {
    pattern: 'russian_sp',
    name: 'Russian SP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SP 32.13330 Building Codes — Sewerage',
      citation: 'Ministry of Construction Russia',
      year: 2018,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'rwanda_meteo',
    name: 'Rwanda Météo',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rwanda Météo Design Storm Standard',
      citation: 'Rwanda Météo',
      year: 2020,
    },
    notes: 'Design storm pattern for Highland tropical convective center-peaked.'
  },
  {
    pattern: 'rwanda_regional_idf',
    name: 'Rwanda Regionalized IDF',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rwanda Regionalized IDF Curves',
      citation: 'Rwanda Meteorology Agency',
      year: 2018,
    },
    notes: '5-region East African IDF design for Rwanda\'s varied topography.'
  },
  {
    pattern: 'sa_cape_town',
    name: 'South Africa Cape Town',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Cape Town Stormwater Management Manual',
      citation: 'City of Cape Town',
      year: 2018,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'sa_johannesburg',
    name: 'South Africa Johannesburg',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Johannesburg Stormwater Design Manual',
      citation: 'City of Johannesburg',
      year: 2019,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'sa_sanral',
    name: 'South Africa SANRAL',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'South Africa SANRAL Design Storm Standard',
      citation: 'South Africa SANRAL',
      year: 2020,
    },
    notes: 'Design storm pattern for SANRAL road drainage design storm.'
  },
  {
    pattern: 'sa_scs1',
    name: 'SA SCS Type 1',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SA SCS Type 1 Design Storm Standard',
      citation: 'SA SCS Type 1',
      year: 2020,
    },
    notes: 'Design storm pattern for South African SCS Type 1 — coastal/orographic, lowest concentration.'
  },
  {
    pattern: 'sa_scs2',
    name: 'SA SCS Type 2',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SA SCS Type 2 Design Storm Standard',
      citation: 'SA SCS Type 2',
      year: 2020,
    },
    notes: 'Design storm pattern for South African SCS Type 2 — moderate concentration.'
  },
  {
    pattern: 'sa_scs3',
    name: 'SA SCS Type 3',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SA SCS Type 3 Design Storm Standard',
      citation: 'SA SCS Type 3',
      year: 2020,
    },
    notes: 'Design storm pattern for South African SCS Type 3 — inland convective.'
  },
  {
    pattern: 'sa_scs4',
    name: 'SA SCS Type 4',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'SA SCS Type 4 Design Storm Standard',
      citation: 'SA SCS Type 4',
      year: 2020,
    },
    notes: 'Design storm pattern for South African SCS Type 4 — extreme convective Highveld.'
  },
  {
    pattern: 'sa_wrc',
    name: 'South Africa WRC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'South Africa WRC Design Storm Standard',
      citation: 'South Africa WRC',
      year: 2020,
    },
    notes: 'Design storm pattern for South African Water Research Commission.'
  },
  {
    pattern: 'saharan_dust',
    name: 'Saharan Dust Storm',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saharan Dust-Enhanced Precipitation',
      citation: 'Twohy et al. (2009)',
      year: 2009,
    },
    notes: 'Dust aerosol enhanced precipitation in Mediterranean regions'
  },
  {
    pattern: 'saint_lucia_charim',
    name: 'Saint Lucia CHaRIM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saint Lucia CHaRIM Design Storm',
      citation: 'World Bank / CHARIM',
      year: 2015,
    },
    notes: 'Caribbean island design storm using Johnson SB distribution.'
  },
  {
    pattern: 'saint_vincent_charim',
    name: 'Saint Vincent CHaRIM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saint Vincent CHaRIM Design Storm',
      citation: 'World Bank / CHARIM',
      year: 2015,
    },
    notes: 'Caribbean LISEM-based design storm for volcanic terrain.'
  },
  {
    pattern: 'samoa_sopac',
    name: 'Samoa SOPAC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Samoa SOPAC Flood Management Guidelines',
      citation: 'Pacific Community (SPC) / SOPAC',
      year: 2014,
    },
    notes: 'Pacific island design storm for flood management infrastructure.'
  },
  {
    pattern: 'saskatchewan_wsa',
    name: 'Saskatchewan WSA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saskatchewan Water Security Agency IDF Curves',
      citation: 'Water Security Agency',
      year: 2016,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'saudi_aramco',
    name: 'Saudi Aramco',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saudi Aramco Engineering Standards — Drainage',
      citation: 'Saudi Aramco',
      year: 2019,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'saudi_momrah',
    name: 'Saudi MoMRAH',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MoMRAH Drainage Design Standards',
      citation: 'Saudi Ministry of Municipal and Rural Affairs',
      year: 2020,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'saudi_pme',
    name: 'Saudi Arabia PME',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Saudi Arabia PME Design Storm Standard',
      citation: 'Saudi Arabia PME',
      year: 2020,
    },
    notes: 'Design storm pattern for Arid wadi flash flood.'
  },
  {
    pattern: 'senegal_anacim',
    name: 'Senegal ANACIM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Senegal ANACIM Design Storm Standard',
      citation: 'Senegal ANACIM',
      year: 2020,
    },
    notes: 'Design storm pattern for Sahel monsoon burst front-loaded pattern.'
  },
  {
    pattern: 'seychelles_scs3',
    name: 'Seychelles SCS Type 3',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Seychelles SCS Type 3 Design Storm Standard',
      citation: 'Seychelles SCS Type 3',
      year: 2020,
    },
    notes: 'Design storm pattern for SA SCS Type 3 adapted for Indian Ocean.'
  },
  {
    pattern: 'seychelles_sma',
    name: 'Seychelles SMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Seychelles Meteorological Authority IDF Standards',
      citation: 'SMA',
      year: 2014,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'sharjah_sewa',
    name: 'Sharjah SEWA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sharjah SEWA Drainage Guidelines',
      citation: 'Sharjah Electricity and Water Authority',
      year: 2018,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'sierra_leone_roads',
    name: 'Sierra Leone Roads Authority',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sierra Leone Low Volume Roads IDF',
      citation: 'Sierra Leone Roads Authority / AfDB',
      year: 2017,
    },
    notes: 'West African tropical design storm for road drainage.'
  },
  {
    pattern: 'silva_brazil',
    name: 'Silva (Brazil)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Brazilian Regional Design Storm Methodology',
      citation: 'Silva, L.P. et al.',
      year: 2003,
    },
    notes: 'Tropical convective design storm for Brazilian urban drainage'
  },
  {
    pattern: 'singapore_pub_urban',
    name: 'Singapore PUB Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'PUB Code of Practice — Urban Drainage',
      citation: 'Public Utilities Board Singapore',
      year: 2020,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'slovak_shmu',
    name: 'Slovak SHMU',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Meteorologické normy pre projektovanie',
      citation: 'SHMÚ Slovakia',
      year: 2015,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'slovenian_mop',
    name: 'Slovenian MOP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Pravilnik o odvajanju odpadnih voda',
      citation: 'MOP Slovenia',
      year: 2012,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'snowmelt_enhanced',
    name: 'Snowmelt-Enhanced',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Rain-on-Snow Enhanced Storm',
      citation: 'McCabe et al. (2007)',
      year: 2007,
    },
    notes: 'Combined rain + snowmelt compound event beyond standard ROS'
  },
  {
    pattern: 'solomon_islands',
    name: 'Solomon Islands Honiara',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Solomon Islands World Bank Drainage Design',
      citation: 'World Bank / SI Government',
      year: 2018,
    },
    notes: 'Honiara design storm for tropical maritime conditions.'
  },
  {
    pattern: 'south_carolina_scdot',
    name: 'South Carolina SCDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'South Carolina DOT Drainage Manual',
      citation: 'South Carolina Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'south_dakota_sddot',
    name: 'South Dakota SDDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'South Dakota DOT Drainage Manual',
      citation: 'South Dakota Department of Transportation',
      year: 2018,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'spanish_aemet',
    name: 'Spanish AEMET-ADAPTA',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'AEMET-ADAPTA Climate Adaptation Scenarios',
      citation: 'AEMET',
      year: 2020,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'spanish_cedex',
    name: 'Spain CEDEX',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Spain CEDEX Design Storm Standard',
      citation: 'Spain CEDEX',
      year: 2020,
    },
    notes: 'Design storm pattern for Spanish alternating block.'
  },
  {
    pattern: 'sri_lanka',
    name: 'Sri Lanka',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sri Lanka Design Storm Standard',
      citation: 'Sri Lanka',
      year: 2020,
    },
    notes: 'Design storm pattern for Monsoon beta distribution.'
  },
  {
    pattern: 'sri_lanka_nbro',
    name: 'Sri Lanka NBRO',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NBRO Stormwater Design Guidelines',
      citation: 'National Building Research Organization',
      year: 2016,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'sst_transposition',
    name: 'Stochastic Storm Transposition',
    category: 'cumulative',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Stochastic Storm Transposition',
      citation: 'Wright et al. (2017)',
      year: 2017,
    },
    notes: 'Probabilistic framework transposing observed storms across regions'
  },
  {
    pattern: 'suriname_paramaribo',
    name: 'Suriname Paramaribo',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Suriname Paramaribo Urban Drainage',
      citation: 'Ministry of Public Works Suriname',
      year: 2016,
    },
    notes: 'Tropical South American urban drainage design storm.'
  },
  {
    pattern: 'swedish_smhi',
    name: 'Sweden SMHI',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sweden SMHI Design Storm Standard',
      citation: 'Sweden SMHI',
      year: 2020,
    },
    notes: 'Design storm pattern for Swedish Chicago variant.'
  },
  {
    pattern: 'swedish_smhi_urban',
    name: 'Swedish SMHI Urban',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Swedish Urban Drainage Design Guidelines',
      citation: 'SMHI / Svenskt Vatten',
      year: 2016,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'swiss_ch2018',
    name: 'Swiss IDF CH2018',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'CH2018: Swiss Climate Change Scenarios',
      citation: 'MeteoSwiss / ETH Zurich',
      year: 2018,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'swiss_idf',
    name: 'Swiss IDF',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Swiss IDF Design Storm Standard',
      citation: 'Swiss IDF',
      year: 2020,
    },
    notes: 'Design storm pattern for Swiss cantonal IDF.'
  },
  {
    pattern: 'taiwan_cwa',
    name: 'Taiwan CWA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Taiwan CWA Design Storm Standard',
      citation: 'Taiwan CWA',
      year: 2020,
    },
    notes: 'Design storm pattern for Taiwan typhoon IDF.'
  },
  {
    pattern: 'taiwan_moiwr',
    name: 'Taiwan MOIWR',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'MOIWR Water Resources Design Standards',
      citation: 'Ministry of Interior, WRA',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'tajikistan_hydromet',
    name: 'Tajikistan Hydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Tajikistan Hydromet IDF Standards',
      citation: 'State Agency for Hydrometeorology',
      year: 2014,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'tank_model',
    name: 'Tank Model (Laos/Myanmar)',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sugawara Tank Model Rainfall Input',
      citation: 'Sugawara, M.',
      year: 1972,
    },
    notes: 'Multi-layer tank model requiring specific temporal input patterns'
  },
  {
    pattern: 'tanzania_dawasa',
    name: 'Tanzania DAWASA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DAWASA Drainage Design Standards',
      citation: 'DAWASA Dar es Salaam',
      year: 2016,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'tanzania_tma',
    name: 'Tanzania TMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Tanzania TMA Design Storm Standard',
      citation: 'Tanzania TMA',
      year: 2020,
    },
    notes: 'Design storm pattern for East African monsoon.'
  },
  {
    pattern: 'thailand_bma',
    name: 'Thailand BMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'BMA Drainage Design Standards',
      citation: 'Bangkok Metropolitan Administration',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'thailand_tmd',
    name: 'Thailand TMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Thailand TMD Design Storm Standard',
      citation: 'Thailand TMD',
      year: 2020,
    },
    notes: 'Design storm pattern for Thai monsoon with urban heat island.'
  },
  {
    pattern: 'timor_leste_dnmg',
    name: 'Timor-Leste DNMG',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DNMG Rainfall Design Standards',
      citation: 'Direcção Nacional de Meteorologia e Geofísica',
      year: 2017,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'tunisia_anpe',
    name: 'Tunisia ANPE',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ANPE Environmental Drainage Standards',
      citation: 'ANPE Tunisia',
      year: 2012,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'turkey_mgm',
    name: 'Turkey MGM',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Turkey MGM Design Storm Standard',
      citation: 'Turkey MGM',
      year: 2020,
    },
    notes: 'Design storm pattern for Turkish meteorological IDF.'
  },
  {
    pattern: 'turkmenistan',
    name: 'Turkmenistan Turkmenhydromet',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Turkmenhydromet Design Standards',
      citation: 'State Committee for Hydrometeorology',
      year: 2015,
    },
    notes: 'Central Asian continental arid design storm.'
  },
  {
    pattern: 'tuvalu_tcap',
    name: 'Tuvalu TCAP/UNDP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Tuvalu Coastal Adaptation Project Design',
      citation: 'UNDP / Government of Tuvalu',
      year: 2017,
    },
    notes: 'Atoll coastal hazard storm modelling for climate adaptation.'
  },
  {
    pattern: 'uae_ncms',
    name: 'UAE NCMS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'UAE NCMS Design Storm Standard',
      citation: 'UAE NCMS',
      year: 2020,
    },
    notes: 'Design storm pattern for Dubai/Abu Dhabi flash flood.'
  },
  {
    pattern: 'uganda_nwsc',
    name: 'Uganda NWSC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'NWSC Technical Design Manual',
      citation: 'National Water and Sewerage Corporation',
      year: 2018,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'ukcp09_legacy',
    name: 'UKCP09 Legacy',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'UKCP09: UK Climate Projections',
      citation: 'UK Met Office',
      year: 2009,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'ukrainian_dstu',
    name: 'Ukrainian DSTU',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'DSTU National Standard — Drainage Design',
      citation: 'DSTU Ukraine',
      year: 2020,
    },
    notes: 'European regional design storm standard derived from national IDF data and frequency analysis.'
  },
  {
    pattern: 'urban_pluvial',
    name: 'Urban Pluvial Flood',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Urban Pluvial Flood Design Storm',
      citation: 'Falconer et al.',
      year: 2009,
    },
    notes: 'Front-loaded pluvial design for surface water flooding assessment'
  },
  {
    pattern: 'us_noaa_climate',
    name: 'US NOAA Climate-Adjusted',
    category: 'cumulative',
    equations: [
      {
        label: 'Climate-Adjusted Design Rainfall',
        latex: 'P_{adj}(T) = P_{hist}(T) \cdot \Delta_{CF}',
        description: 'Historical design rainfall scaled by climate change factor for future projections'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Climate-Adjusted NOAA Atlas 14 Precipitation Frequency',
      citation: 'NOAA / NWS',
      year: 2022,
    },
    notes: 'Climate-adjusted design storm incorporating projected changes in rainfall intensity and frequency.'
  },
  {
    pattern: 'vanuatu_vankirap',
    name: 'Vanuatu Van-KIRAP',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Van-KIRAP Road Design IDF with Climate Scaling',
      citation: 'SPREP / Vanuatu Met',
      year: 2021,
    },
    notes: 'Climate-scaled IDF curves for road infrastructure design.'
  },
  {
    pattern: 'venezuela_inameh',
    name: 'Venezuela INAMEH',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Venezuela INAMEH Design Storm Standard',
      citation: 'Venezuela INAMEH',
      year: 2020,
    },
    notes: 'Design storm pattern for Andean convective.'
  },
  {
    pattern: 'vermont_vtrans',
    name: 'Vermont VTrans',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Vermont Agency of Transportation Hydraulics Manual',
      citation: 'Vermont Agency of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'vietnam_hanoi',
    name: 'Vietnam Hanoi',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Hanoi Urban Drainage Master Plan',
      citation: 'Hanoi People\'s Committee',
      year: 2018,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'vietnam_hcmc',
    name: 'Vietnam HCMC',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'HCMC Drainage and Flood Control Plan',
      citation: 'HCMC Department of Transport',
      year: 2019,
    },
    notes: 'Regional design storm using locally-derived IDF data and temporal distribution patterns.'
  },
  {
    pattern: 'vietnam_imhen',
    name: 'Vietnam IMHEN',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Vietnam IMHEN Design Storm Standard',
      citation: 'Vietnam IMHEN',
      year: 2020,
    },
    notes: 'Design storm pattern for Vietnamese monsoon/convective.'
  },
  {
    pattern: 'virginia_vdot',
    name: 'Virginia VDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'VDOT Drainage Manual',
      citation: 'Virginia Department of Transportation',
      year: 2020,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'volcanic_ash',
    name: 'Volcanic Ash-Enhanced',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Post-Volcanic Eruption Enhanced Precipitation',
      citation: 'Robock (2000)',
      year: 2000,
    },
    notes: 'Post-eruption enhanced precipitation due to aerosol effects'
  },
  {
    pattern: 'west_africa_cilss',
    name: 'West Africa CILSS',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'West Africa CILSS Design Storm Standard',
      citation: 'West Africa CILSS',
      year: 2020,
    },
    notes: 'Design storm pattern for Sahel AGRHYMET convective squall.'
  },
  {
    pattern: 'wyoming_wydot',
    name: 'Wyoming WYDOT',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Wyoming DOT Highway Drainage Manual',
      citation: 'Wyoming Department of Transportation',
      year: 2019,
    },
    notes: 'US state DOT design storm based on NOAA Atlas 14/NRCS methodology adapted for local climate. Uses SCS Type II or III distribution modified for regional rainfall characteristics.'
  },
  {
    pattern: 'xgboost_storm',
    name: 'XGBoost Storm Prediction',
    category: 'intensity',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'XGBoost Machine Learning Storm Prediction',
      citation: 'Tyralis et al.',
      year: 2019,
    },
    notes: 'ML gradient-boosted ensemble for data-driven storm pattern prediction'
  },
  {
    pattern: 'yemen_sanaa',
    name: 'Yemen Sana',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Sanaa Basin Stormwater Master Plan',
      citation: 'Yemen NWRA',
      year: 2005,
    },
    notes: 'Regional arid/semi-arid design storm using IDF relationships adapted for local extreme rainfall events.'
  },
  {
    pattern: 'yukon_highways',
    name: 'Yukon Highways',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Yukon Highways Design Standards',
      citation: 'Yukon Dept. of Highways and Public Works',
      year: 2017,
    },
    notes: 'Canadian provincial/territorial design storm derived from ECCC IDF data, adapted for regional climate patterns.'
  },
  {
    pattern: 'zambia_warma',
    name: 'Zambia WARMA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'WARMA Drainage Design Guidelines',
      citation: 'Water Resources Management Authority Zambia',
      year: 2017,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'zambia_zmd',
    name: 'Zambia ZMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Zambia ZMD Design Storm Standard',
      citation: 'Zambia ZMD',
      year: 2020,
    },
    notes: 'Design storm pattern for ITCZ-influenced tropical wet season center-peaked.'
  },
  {
    pattern: 'zimbabwe_sala',
    name: 'Zimbabwe Sala Manuals',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Zimbabwe Sala Highway Drainage Manuals',
      citation: 'Zimbabwe Roads Authority',
      year: 2013,
    },
    notes: 'Highway stormwater drainage design standards for Zimbabwe.'
  },
  {
    pattern: 'zimbabwe_zinwa',
    name: 'Zimbabwe ZINWA',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'ZINWA Design Standards',
      citation: 'Zimbabwe National Water Authority',
      year: 2015,
    },
    notes: 'Regional African design storm using locally-derived IDF relationships for stormwater infrastructure design.'
  },
  {
    pattern: 'zimbabwe_zmd',
    name: 'Zimbabwe ZMD',
    category: 'empirical',
    equations: [
      {
        label: 'Design Intensity',
        latex: 'i(t) = \frac{P}{D} \cdot f(t/D)',
        description: 'Dimensionless temporal distribution applied to total depth P over duration D'
      }
    ],
    variables: [
      { symbol: 'i(t)', meaning: 'Rainfall intensity at time t (in/hr or mm/hr)' },
      { symbol: 'P', meaning: 'Total storm depth (in or mm)' },
      { symbol: 'D', meaning: 'Storm duration (hr)' },
      { symbol: 'f(t/D)', meaning: 'Dimensionless temporal distribution function' }
    ],
    reference: {
      title: 'Zimbabwe ZMD Design Storm Standard',
      citation: 'Zimbabwe ZMD',
      year: 2020,
    },
    notes: 'Design storm pattern for Subtropical summer thunderstorm early-center peak.'
  },
];

export function getPatternEquation(pattern: PatternType): PatternEquation | undefined {
  return patternEquations.find(eq => eq.pattern === pattern);
}

export function getPatternsByCategory(category: 'cumulative' | 'intensity' | 'empirical'): PatternEquation[] {
  return patternEquations.filter(eq => eq.category === category);
}
