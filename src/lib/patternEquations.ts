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
];

export function getPatternEquation(pattern: PatternType): PatternEquation | undefined {
  return patternEquations.find(eq => eq.pattern === pattern);
}

export function getPatternsByCategory(category: 'cumulative' | 'intensity' | 'empirical'): PatternEquation[] {
  return patternEquations.filter(eq => eq.category === category);
}
