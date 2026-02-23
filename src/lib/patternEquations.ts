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
];

export function getPatternEquation(pattern: PatternType): PatternEquation | undefined {
  return patternEquations.find(eq => eq.pattern === pattern);
}

export function getPatternsByCategory(category: 'cumulative' | 'intensity' | 'empirical'): PatternEquation[] {
  return patternEquations.filter(eq => eq.category === category);
}
