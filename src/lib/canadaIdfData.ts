/**
 * Canada IDF (Intensity-Duration-Frequency) Database
 * 
 * Based on Environment and Climate Change Canada (ECCC) IDF curves
 * derived from historical recording rain gauge data.
 * 
 * Standard IDF formula (Gumbel-fitted):
 *   i = a / (t + b)^c
 * Where:
 *   i = rainfall intensity (mm/hr)
 *   t = rainfall duration (min)
 *   a = intensity coefficient (varies by return period)
 *   b = time offset (min)
 *   c = time exponent
 * 
 * Each city stores coefficients per return period.
 * Sources: ECCC IDF v3.50+, municipal drainage standards, 
 * and provincial design guides.
 */

export interface CanadaIdfCoefficients {
  /** Return period in years */
  returnPeriod: number;
  /** a coefficient */
  a: number;
  /** b coefficient (min) */
  b: number;
  /** c exponent */
  c: number;
}

export interface CanadaCityIdf {
  /** City name */
  name: string;
  /** Province abbreviation */
  province: string;
  /** Province full name */
  provinceFull: string;
  /** ECCC station ID or reference */
  stationId: string;
  /** Climate region */
  climateRegion: string;
  /** Valid duration range [min, max] in minutes */
  validDuration: [number, number];
  /** IDF coefficients per return period */
  coefficients: CanadaIdfCoefficients[];
  /** Data source */
  reference: string;
}

/**
 * Canadian city IDF database — coefficients derived from ECCC IDF tables
 * and fitted to i = a / (t + b)^c form.
 * 
 * These are representative engineering-grade fits to published IDF data.
 * For official design use, always verify against the latest ECCC IDF curves
 * at https://climate.weather.gc.ca/prods_servs/engineering_e.html
 */
export const canadaIdfDatabase: CanadaCityIdf[] = [
  // ===== Ontario =====
  {
    name: 'Toronto', province: 'ON', provinceFull: 'Ontario',
    stationId: '6158355', climateRegion: 'Great Lakes',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 740, b: 6.0, c: 0.81 },
      { returnPeriod: 5, a: 1020, b: 6.5, c: 0.82 },
      { returnPeriod: 10, a: 1220, b: 6.8, c: 0.82 },
      { returnPeriod: 25, a: 1480, b: 7.0, c: 0.83 },
      { returnPeriod: 50, a: 1680, b: 7.2, c: 0.83 },
      { returnPeriod: 100, a: 1890, b: 7.5, c: 0.84 },
    ],
    reference: 'ECCC IDF Toronto Pearson (6158355)',
  },
  {
    name: 'Ottawa', province: 'ON', provinceFull: 'Ontario',
    stationId: '6105976', climateRegion: 'Eastern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 660, b: 5.8, c: 0.79 },
      { returnPeriod: 5, a: 920, b: 6.2, c: 0.80 },
      { returnPeriod: 10, a: 1100, b: 6.5, c: 0.81 },
      { returnPeriod: 25, a: 1340, b: 6.8, c: 0.82 },
      { returnPeriod: 50, a: 1530, b: 7.0, c: 0.82 },
      { returnPeriod: 100, a: 1720, b: 7.2, c: 0.83 },
    ],
    reference: 'ECCC IDF Ottawa CDA (6105976)',
  },
  {
    name: 'Hamilton', province: 'ON', provinceFull: 'Ontario',
    stationId: '6153194', climateRegion: 'Great Lakes',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 710, b: 5.8, c: 0.80 },
      { returnPeriod: 5, a: 990, b: 6.2, c: 0.81 },
      { returnPeriod: 10, a: 1180, b: 6.5, c: 0.82 },
      { returnPeriod: 25, a: 1440, b: 6.8, c: 0.83 },
      { returnPeriod: 50, a: 1640, b: 7.0, c: 0.83 },
      { returnPeriod: 100, a: 1850, b: 7.2, c: 0.84 },
    ],
    reference: 'ECCC IDF Hamilton RBG (6153194)',
  },
  {
    name: 'London', province: 'ON', provinceFull: 'Ontario',
    stationId: '6144475', climateRegion: 'Southwestern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 700, b: 5.5, c: 0.79 },
      { returnPeriod: 5, a: 975, b: 6.0, c: 0.80 },
      { returnPeriod: 10, a: 1160, b: 6.3, c: 0.81 },
      { returnPeriod: 25, a: 1410, b: 6.6, c: 0.82 },
      { returnPeriod: 50, a: 1610, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1810, b: 7.0, c: 0.83 },
    ],
    reference: 'ECCC IDF London (6144475)',
  },
  {
    name: 'Kitchener-Waterloo', province: 'ON', provinceFull: 'Ontario',
    stationId: '6144239', climateRegion: 'Southwestern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 690, b: 5.6, c: 0.79 },
      { returnPeriod: 5, a: 960, b: 6.0, c: 0.80 },
      { returnPeriod: 10, a: 1150, b: 6.3, c: 0.81 },
      { returnPeriod: 25, a: 1400, b: 6.6, c: 0.82 },
      { returnPeriod: 50, a: 1590, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1790, b: 7.0, c: 0.83 },
    ],
    reference: 'ECCC IDF Waterloo-Wellington (6144239)',
  },
  {
    name: 'Thunder Bay', province: 'ON', provinceFull: 'Ontario',
    stationId: '6048261', climateRegion: 'Northwestern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 580, b: 5.5, c: 0.78 },
      { returnPeriod: 5, a: 820, b: 6.0, c: 0.79 },
      { returnPeriod: 10, a: 990, b: 6.3, c: 0.80 },
      { returnPeriod: 25, a: 1200, b: 6.6, c: 0.81 },
      { returnPeriod: 50, a: 1370, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1540, b: 7.0, c: 0.82 },
    ],
    reference: 'ECCC IDF Thunder Bay (6048261)',
  },

  // ===== Quebec =====
  {
    name: 'Montreal', province: 'QC', provinceFull: 'Quebec',
    stationId: '7025250', climateRegion: 'St. Lawrence Valley',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 720, b: 5.5, c: 0.80 },
      { returnPeriod: 5, a: 1000, b: 6.0, c: 0.81 },
      { returnPeriod: 10, a: 1200, b: 6.3, c: 0.82 },
      { returnPeriod: 25, a: 1460, b: 6.6, c: 0.83 },
      { returnPeriod: 50, a: 1660, b: 6.8, c: 0.83 },
      { returnPeriod: 100, a: 1870, b: 7.0, c: 0.84 },
    ],
    reference: 'ECCC IDF Montreal Trudeau (7025250)',
  },
  {
    name: 'Quebec City', province: 'QC', provinceFull: 'Quebec',
    stationId: '7016294', climateRegion: 'St. Lawrence Valley',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 620, b: 5.5, c: 0.78 },
      { returnPeriod: 5, a: 870, b: 6.0, c: 0.79 },
      { returnPeriod: 10, a: 1040, b: 6.3, c: 0.80 },
      { returnPeriod: 25, a: 1270, b: 6.5, c: 0.81 },
      { returnPeriod: 50, a: 1450, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1640, b: 7.0, c: 0.82 },
    ],
    reference: 'ECCC IDF Quebec Jean Lesage (7016294)',
  },
  {
    name: 'Gatineau', province: 'QC', provinceFull: 'Quebec',
    stationId: '7031780', climateRegion: 'Ottawa Valley',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 650, b: 5.6, c: 0.79 },
      { returnPeriod: 5, a: 910, b: 6.0, c: 0.80 },
      { returnPeriod: 10, a: 1090, b: 6.3, c: 0.81 },
      { returnPeriod: 25, a: 1320, b: 6.6, c: 0.82 },
      { returnPeriod: 50, a: 1510, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1700, b: 7.0, c: 0.83 },
    ],
    reference: 'ECCC IDF Gatineau (7031780)',
  },

  // ===== British Columbia =====
  {
    name: 'Vancouver', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1108395', climateRegion: 'Pacific Coast',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 490, b: 4.8, c: 0.74 },
      { returnPeriod: 5, a: 680, b: 5.2, c: 0.75 },
      { returnPeriod: 10, a: 820, b: 5.5, c: 0.76 },
      { returnPeriod: 25, a: 1010, b: 5.8, c: 0.77 },
      { returnPeriod: 50, a: 1160, b: 6.0, c: 0.78 },
      { returnPeriod: 100, a: 1320, b: 6.2, c: 0.78 },
    ],
    reference: 'ECCC IDF Vancouver Intl (1108395)',
  },
  {
    name: 'Victoria', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1018620', climateRegion: 'Pacific Coast',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 420, b: 4.5, c: 0.73 },
      { returnPeriod: 5, a: 590, b: 4.8, c: 0.74 },
      { returnPeriod: 10, a: 710, b: 5.0, c: 0.75 },
      { returnPeriod: 25, a: 880, b: 5.3, c: 0.76 },
      { returnPeriod: 50, a: 1010, b: 5.5, c: 0.77 },
      { returnPeriod: 100, a: 1150, b: 5.7, c: 0.77 },
    ],
    reference: 'ECCC IDF Victoria Gonzales (1018620)',
  },
  {
    name: 'Kelowna', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1123970', climateRegion: 'Interior BC',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 380, b: 4.5, c: 0.72 },
      { returnPeriod: 5, a: 540, b: 4.8, c: 0.73 },
      { returnPeriod: 10, a: 650, b: 5.0, c: 0.74 },
      { returnPeriod: 25, a: 810, b: 5.3, c: 0.75 },
      { returnPeriod: 50, a: 930, b: 5.5, c: 0.76 },
      { returnPeriod: 100, a: 1060, b: 5.7, c: 0.76 },
    ],
    reference: 'ECCC IDF Kelowna (1123970)',
  },
  {
    name: 'Prince George', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1096450', climateRegion: 'Interior BC',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 340, b: 4.2, c: 0.71 },
      { returnPeriod: 5, a: 480, b: 4.5, c: 0.72 },
      { returnPeriod: 10, a: 580, b: 4.8, c: 0.73 },
      { returnPeriod: 25, a: 720, b: 5.0, c: 0.74 },
      { returnPeriod: 50, a: 830, b: 5.2, c: 0.75 },
      { returnPeriod: 100, a: 950, b: 5.4, c: 0.75 },
    ],
    reference: 'ECCC IDF Prince George (1096450)',
  },

  // ===== Alberta =====
  {
    name: 'Calgary', province: 'AB', provinceFull: 'Alberta',
    stationId: '3031093', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 520, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 730, b: 5.5, c: 0.77 },
      { returnPeriod: 10, a: 880, b: 5.8, c: 0.78 },
      { returnPeriod: 25, a: 1080, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1240, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1400, b: 6.5, c: 0.80 },
    ],
    reference: 'ECCC IDF Calgary Intl (3031093)',
  },
  {
    name: 'Edmonton', province: 'AB', provinceFull: 'Alberta',
    stationId: '3012205', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 540, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 760, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 910, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1110, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1270, b: 6.4, c: 0.80 },
      { returnPeriod: 100, a: 1430, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Edmonton Intl (3012205)',
  },
  {
    name: 'Red Deer', province: 'AB', provinceFull: 'Alberta',
    stationId: '3025480', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 500, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 700, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 850, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1040, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1190, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1340, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Red Deer (3025480)',
  },

  // ===== Saskatchewan =====
  {
    name: 'Saskatoon', province: 'SK', provinceFull: 'Saskatchewan',
    stationId: '4057120', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 480, b: 5.0, c: 0.75 },
      { returnPeriod: 5, a: 680, b: 5.4, c: 0.76 },
      { returnPeriod: 10, a: 820, b: 5.7, c: 0.77 },
      { returnPeriod: 25, a: 1010, b: 6.0, c: 0.78 },
      { returnPeriod: 50, a: 1160, b: 6.2, c: 0.79 },
      { returnPeriod: 100, a: 1310, b: 6.4, c: 0.79 },
    ],
    reference: 'ECCC IDF Saskatoon (4057120)',
  },
  {
    name: 'Regina', province: 'SK', provinceFull: 'Saskatchewan',
    stationId: '4016560', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 500, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 700, b: 5.5, c: 0.77 },
      { returnPeriod: 10, a: 840, b: 5.8, c: 0.78 },
      { returnPeriod: 25, a: 1030, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1180, b: 6.3, c: 0.80 },
      { returnPeriod: 100, a: 1340, b: 6.5, c: 0.80 },
    ],
    reference: 'ECCC IDF Regina (4016560)',
  },

  // ===== Manitoba =====
  {
    name: 'Winnipeg', province: 'MB', provinceFull: 'Manitoba',
    stationId: '5023222', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 560, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 790, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 950, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1160, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1330, b: 6.4, c: 0.81 },
      { returnPeriod: 100, a: 1500, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Winnipeg Richardson (5023222)',
  },

  // ===== Atlantic Canada =====
  {
    name: 'Halifax', province: 'NS', provinceFull: 'Nova Scotia',
    stationId: '8202200', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 580, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 810, b: 5.5, c: 0.77 },
      { returnPeriod: 10, a: 970, b: 5.8, c: 0.78 },
      { returnPeriod: 25, a: 1190, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1360, b: 6.3, c: 0.80 },
      { returnPeriod: 100, a: 1530, b: 6.5, c: 0.80 },
    ],
    reference: 'ECCC IDF Halifax Stanfield (8202200)',
  },
  {
    name: 'Saint John', province: 'NB', provinceFull: 'New Brunswick',
    stationId: '8104900', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 540, b: 4.8, c: 0.75 },
      { returnPeriod: 5, a: 760, b: 5.2, c: 0.76 },
      { returnPeriod: 10, a: 910, b: 5.5, c: 0.77 },
      { returnPeriod: 25, a: 1110, b: 5.8, c: 0.78 },
      { returnPeriod: 50, a: 1280, b: 6.0, c: 0.79 },
      { returnPeriod: 100, a: 1440, b: 6.2, c: 0.79 },
    ],
    reference: 'ECCC IDF Saint John (8104900)',
  },
  {
    name: 'Moncton', province: 'NB', provinceFull: 'New Brunswick',
    stationId: '8103200', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 550, b: 4.8, c: 0.75 },
      { returnPeriod: 5, a: 770, b: 5.2, c: 0.76 },
      { returnPeriod: 10, a: 920, b: 5.5, c: 0.77 },
      { returnPeriod: 25, a: 1130, b: 5.8, c: 0.78 },
      { returnPeriod: 50, a: 1290, b: 6.0, c: 0.79 },
      { returnPeriod: 100, a: 1460, b: 6.2, c: 0.79 },
    ],
    reference: 'ECCC IDF Moncton (8103200)',
  },
  {
    name: 'Charlottetown', province: 'PE', provinceFull: 'Prince Edward Island',
    stationId: '8300300', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 520, b: 4.8, c: 0.74 },
      { returnPeriod: 5, a: 730, b: 5.2, c: 0.75 },
      { returnPeriod: 10, a: 880, b: 5.5, c: 0.76 },
      { returnPeriod: 25, a: 1080, b: 5.8, c: 0.77 },
      { returnPeriod: 50, a: 1240, b: 6.0, c: 0.78 },
      { returnPeriod: 100, a: 1400, b: 6.2, c: 0.78 },
    ],
    reference: 'ECCC IDF Charlottetown (8300300)',
  },
  {
    name: "St. John's", province: 'NL', provinceFull: 'Newfoundland and Labrador',
    stationId: '8403505', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 510, b: 4.5, c: 0.74 },
      { returnPeriod: 5, a: 710, b: 5.0, c: 0.75 },
      { returnPeriod: 10, a: 860, b: 5.3, c: 0.76 },
      { returnPeriod: 25, a: 1050, b: 5.5, c: 0.77 },
      { returnPeriod: 50, a: 1210, b: 5.8, c: 0.78 },
      { returnPeriod: 100, a: 1370, b: 6.0, c: 0.78 },
    ],
    reference: "ECCC IDF St. John's (8403505)",
  },

  // ===== Northern Territories =====
  {
    name: 'Whitehorse', province: 'YT', provinceFull: 'Yukon',
    stationId: '2101300', climateRegion: 'Northern',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 260, b: 4.0, c: 0.70 },
      { returnPeriod: 5, a: 370, b: 4.3, c: 0.71 },
      { returnPeriod: 10, a: 450, b: 4.5, c: 0.72 },
      { returnPeriod: 25, a: 560, b: 4.8, c: 0.73 },
      { returnPeriod: 50, a: 650, b: 5.0, c: 0.74 },
      { returnPeriod: 100, a: 740, b: 5.2, c: 0.74 },
    ],
    reference: 'ECCC IDF Whitehorse (2101300)',
  },
  {
    name: 'Yellowknife', province: 'NT', provinceFull: 'Northwest Territories',
    stationId: '2204100', climateRegion: 'Northern',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 280, b: 4.0, c: 0.70 },
      { returnPeriod: 5, a: 400, b: 4.3, c: 0.71 },
      { returnPeriod: 10, a: 480, b: 4.5, c: 0.72 },
      { returnPeriod: 25, a: 600, b: 4.8, c: 0.73 },
      { returnPeriod: 50, a: 690, b: 5.0, c: 0.74 },
      { returnPeriod: 100, a: 790, b: 5.2, c: 0.74 },
    ],
    reference: 'ECCC IDF Yellowknife (2204100)',
  },
  // ===== Ontario (additional) =====
  {
    name: 'Sudbury', province: 'ON', provinceFull: 'Ontario',
    stationId: '6068150', climateRegion: 'Northern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 650, b: 5.6, c: 0.79 },
      { returnPeriod: 5, a: 910, b: 6.0, c: 0.80 },
      { returnPeriod: 10, a: 1090, b: 6.3, c: 0.81 },
      { returnPeriod: 25, a: 1330, b: 6.6, c: 0.82 },
      { returnPeriod: 50, a: 1520, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1710, b: 7.0, c: 0.83 },
    ],
    reference: 'ECCC IDF Sudbury (6068150)',
  },
  {
    name: 'Barrie', province: 'ON', provinceFull: 'Ontario',
    stationId: '6110557', climateRegion: 'Great Lakes',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 690, b: 5.8, c: 0.80 },
      { returnPeriod: 5, a: 960, b: 6.2, c: 0.81 },
      { returnPeriod: 10, a: 1150, b: 6.5, c: 0.82 },
      { returnPeriod: 25, a: 1400, b: 6.8, c: 0.83 },
      { returnPeriod: 50, a: 1600, b: 7.0, c: 0.83 },
      { returnPeriod: 100, a: 1800, b: 7.2, c: 0.84 },
    ],
    reference: 'ECCC IDF Barrie (6110557)',
  },
  {
    name: 'Kingston', province: 'ON', provinceFull: 'Ontario',
    stationId: '6104025', climateRegion: 'Eastern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 640, b: 5.6, c: 0.79 },
      { returnPeriod: 5, a: 890, b: 6.0, c: 0.80 },
      { returnPeriod: 10, a: 1070, b: 6.3, c: 0.81 },
      { returnPeriod: 25, a: 1300, b: 6.6, c: 0.82 },
      { returnPeriod: 50, a: 1490, b: 6.8, c: 0.82 },
      { returnPeriod: 100, a: 1680, b: 7.0, c: 0.83 },
    ],
    reference: 'ECCC IDF Kingston (6104025)',
  },
  {
    name: 'Windsor', province: 'ON', provinceFull: 'Ontario',
    stationId: '6139525', climateRegion: 'Great Lakes',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 720, b: 5.8, c: 0.80 },
      { returnPeriod: 5, a: 1000, b: 6.2, c: 0.81 },
      { returnPeriod: 10, a: 1200, b: 6.5, c: 0.82 },
      { returnPeriod: 25, a: 1460, b: 6.8, c: 0.83 },
      { returnPeriod: 50, a: 1660, b: 7.0, c: 0.83 },
      { returnPeriod: 100, a: 1870, b: 7.2, c: 0.84 },
    ],
    reference: 'ECCC IDF Windsor (6139525)',
  },
  {
    name: 'Peterborough', province: 'ON', provinceFull: 'Ontario',
    stationId: '6116132', climateRegion: 'Eastern Ontario',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 670, b: 5.7, c: 0.79 },
      { returnPeriod: 5, a: 940, b: 6.1, c: 0.80 },
      { returnPeriod: 10, a: 1120, b: 6.4, c: 0.81 },
      { returnPeriod: 25, a: 1370, b: 6.7, c: 0.82 },
      { returnPeriod: 50, a: 1560, b: 6.9, c: 0.83 },
      { returnPeriod: 100, a: 1760, b: 7.1, c: 0.83 },
    ],
    reference: 'ECCC IDF Peterborough (6116132)',
  },
  // ===== New Brunswick =====
  {
    name: 'Fredericton', province: 'NB', provinceFull: 'New Brunswick',
    stationId: '8101500', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 560, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 790, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 950, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1160, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1330, b: 6.4, c: 0.81 },
      { returnPeriod: 100, a: 1500, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Fredericton (8101500)',
  },
  {
    name: 'Bathurst', province: 'NB', provinceFull: 'New Brunswick',
    stationId: '8100500', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 530, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 750, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 900, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1100, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1260, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1420, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Bathurst (8100500)',
  },
  // ===== British Columbia (additional) =====
  {
    name: 'Kamloops', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1163780', climateRegion: 'Interior BC',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 380, b: 4.8, c: 0.74 },
      { returnPeriod: 5, a: 540, b: 5.2, c: 0.76 },
      { returnPeriod: 10, a: 660, b: 5.5, c: 0.77 },
      { returnPeriod: 25, a: 810, b: 5.8, c: 0.78 },
      { returnPeriod: 50, a: 930, b: 6.0, c: 0.79 },
      { returnPeriod: 100, a: 1050, b: 6.2, c: 0.79 },
    ],
    reference: 'ECCC IDF Kamloops (1163780)',
  },
  {
    name: 'Nanaimo', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1025370', climateRegion: 'Pacific Maritime',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 480, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 680, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 830, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1010, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1160, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1310, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Nanaimo (1025370)',
  },
  {
    name: 'Cranbrook', province: 'BC', provinceFull: 'British Columbia',
    stationId: '1151890', climateRegion: 'Interior BC',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 340, b: 4.5, c: 0.73 },
      { returnPeriod: 5, a: 480, b: 4.9, c: 0.74 },
      { returnPeriod: 10, a: 590, b: 5.2, c: 0.75 },
      { returnPeriod: 25, a: 720, b: 5.5, c: 0.76 },
      { returnPeriod: 50, a: 830, b: 5.7, c: 0.77 },
      { returnPeriod: 100, a: 940, b: 5.9, c: 0.77 },
    ],
    reference: 'ECCC IDF Cranbrook (1151890)',
  },
  // ===== Alberta (additional) =====
  {
    name: 'Lethbridge', province: 'AB', provinceFull: 'Alberta',
    stationId: '3033880', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 520, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 740, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 890, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1090, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1250, b: 6.4, c: 0.81 },
      { returnPeriod: 100, a: 1410, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Lethbridge (3033880)',
  },
  {
    name: 'Medicine Hat', province: 'AB', provinceFull: 'Alberta',
    stationId: '3034480', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 490, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 690, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 840, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1030, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1180, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1330, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Medicine Hat (3034480)',
  },
  {
    name: 'Grande Prairie', province: 'AB', provinceFull: 'Alberta',
    stationId: '3072920', climateRegion: 'Northern Alberta',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 430, b: 4.8, c: 0.75 },
      { returnPeriod: 5, a: 610, b: 5.2, c: 0.76 },
      { returnPeriod: 10, a: 740, b: 5.5, c: 0.77 },
      { returnPeriod: 25, a: 910, b: 5.8, c: 0.78 },
      { returnPeriod: 50, a: 1040, b: 6.0, c: 0.79 },
      { returnPeriod: 100, a: 1180, b: 6.2, c: 0.79 },
    ],
    reference: 'ECCC IDF Grande Prairie (3072920)',
  },
  // ===== Manitoba (additional) =====
  {
    name: 'Brandon', province: 'MB', provinceFull: 'Manitoba',
    stationId: '5010480', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 500, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 710, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 860, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1050, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1200, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1360, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Brandon (5010480)',
  },
  // ===== Saskatchewan (additional) =====
  {
    name: 'Prince Albert', province: 'SK', provinceFull: 'Saskatchewan',
    stationId: '4056240', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 460, b: 4.8, c: 0.75 },
      { returnPeriod: 5, a: 650, b: 5.2, c: 0.76 },
      { returnPeriod: 10, a: 790, b: 5.5, c: 0.77 },
      { returnPeriod: 25, a: 970, b: 5.8, c: 0.78 },
      { returnPeriod: 50, a: 1110, b: 6.0, c: 0.79 },
      { returnPeriod: 100, a: 1260, b: 6.2, c: 0.79 },
    ],
    reference: 'ECCC IDF Prince Albert (4056240)',
  },
  {
    name: 'Moose Jaw', province: 'SK', provinceFull: 'Saskatchewan',
    stationId: '4015320', climateRegion: 'Prairie',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 480, b: 4.9, c: 0.75 },
      { returnPeriod: 5, a: 680, b: 5.3, c: 0.76 },
      { returnPeriod: 10, a: 820, b: 5.6, c: 0.77 },
      { returnPeriod: 25, a: 1000, b: 5.9, c: 0.78 },
      { returnPeriod: 50, a: 1150, b: 6.1, c: 0.79 },
      { returnPeriod: 100, a: 1300, b: 6.3, c: 0.79 },
    ],
    reference: 'ECCC IDF Moose Jaw (4015320)',
  },
  // ===== Nova Scotia (additional) =====
  {
    name: 'Sydney', province: 'NS', provinceFull: 'Nova Scotia',
    stationId: '8204700', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 540, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 760, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 920, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1120, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1280, b: 6.4, c: 0.81 },
      { returnPeriod: 100, a: 1450, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Sydney NS (8204700)',
  },
  {
    name: 'Truro', province: 'NS', provinceFull: 'Nova Scotia',
    stationId: '8205600', climateRegion: 'Atlantic',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 520, b: 5.0, c: 0.76 },
      { returnPeriod: 5, a: 730, b: 5.4, c: 0.77 },
      { returnPeriod: 10, a: 880, b: 5.7, c: 0.78 },
      { returnPeriod: 25, a: 1080, b: 6.0, c: 0.79 },
      { returnPeriod: 50, a: 1230, b: 6.2, c: 0.80 },
      { returnPeriod: 100, a: 1390, b: 6.4, c: 0.80 },
    ],
    reference: 'ECCC IDF Truro (8205600)',
  },
  // ===== Quebec (additional) =====
  {
    name: 'Sherbrooke', province: 'QC', provinceFull: 'Quebec',
    stationId: '7028124', climateRegion: 'Eastern Townships',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 620, b: 5.5, c: 0.78 },
      { returnPeriod: 5, a: 870, b: 5.9, c: 0.79 },
      { returnPeriod: 10, a: 1050, b: 6.2, c: 0.80 },
      { returnPeriod: 25, a: 1280, b: 6.5, c: 0.81 },
      { returnPeriod: 50, a: 1460, b: 6.7, c: 0.82 },
      { returnPeriod: 100, a: 1650, b: 6.9, c: 0.82 },
    ],
    reference: 'ECCC IDF Sherbrooke (7028124)',
  },
  {
    name: 'Trois-Rivières', province: 'QC', provinceFull: 'Quebec',
    stationId: '7018564', climateRegion: 'St. Lawrence',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 610, b: 5.4, c: 0.78 },
      { returnPeriod: 5, a: 860, b: 5.8, c: 0.79 },
      { returnPeriod: 10, a: 1030, b: 6.1, c: 0.80 },
      { returnPeriod: 25, a: 1260, b: 6.4, c: 0.81 },
      { returnPeriod: 50, a: 1440, b: 6.6, c: 0.82 },
      { returnPeriod: 100, a: 1620, b: 6.8, c: 0.82 },
    ],
    reference: 'ECCC IDF Trois-Rivières (7018564)',
  },
  {
    name: 'Saguenay', province: 'QC', provinceFull: 'Quebec',
    stationId: '7060400', climateRegion: 'Northern Quebec',
    validDuration: [5, 1440],
    coefficients: [
      { returnPeriod: 2, a: 580, b: 5.2, c: 0.77 },
      { returnPeriod: 5, a: 820, b: 5.6, c: 0.78 },
      { returnPeriod: 10, a: 990, b: 5.9, c: 0.79 },
      { returnPeriod: 25, a: 1210, b: 6.2, c: 0.80 },
      { returnPeriod: 50, a: 1380, b: 6.4, c: 0.81 },
      { returnPeriod: 100, a: 1560, b: 6.6, c: 0.81 },
    ],
    reference: 'ECCC IDF Saguenay (7060400)',
  },
];

// ===== Utility Functions =====

/**
 * Calculate rainfall intensity using i = a / (t + b)^c
 * @returns intensity in mm/hr
 */
export function calculateCanadaIntensity(
  city: CanadaCityIdf,
  returnPeriod: number,
  durationMin: number
): number {
  // Find exact or interpolate between return periods
  const coeffs = city.coefficients;
  
  // Exact match
  const exact = coeffs.find(c => c.returnPeriod === returnPeriod);
  if (exact) {
    return exact.a / Math.pow(durationMin + exact.b, exact.c);
  }
  
  // Interpolate (log-linear on return period)
  let lower = coeffs[0];
  let upper = coeffs[coeffs.length - 1];
  
  for (let i = 0; i < coeffs.length - 1; i++) {
    if (returnPeriod >= coeffs[i].returnPeriod && returnPeriod <= coeffs[i + 1].returnPeriod) {
      lower = coeffs[i];
      upper = coeffs[i + 1];
      break;
    }
  }
  
  if (returnPeriod <= lower.returnPeriod) return lower.a / Math.pow(durationMin + lower.b, lower.c);
  if (returnPeriod >= upper.returnPeriod) return upper.a / Math.pow(durationMin + upper.b, upper.c);
  
  const logRatio = Math.log(returnPeriod / lower.returnPeriod) / Math.log(upper.returnPeriod / lower.returnPeriod);
  const a = lower.a + (upper.a - lower.a) * logRatio;
  const b = lower.b + (upper.b - lower.b) * logRatio;
  const c = lower.c + (upper.c - lower.c) * logRatio;
  
  return a / Math.pow(durationMin + b, c);
}

/**
 * Calculate total depth in mm
 */
export function calculateCanadaDepth(
  city: CanadaCityIdf,
  returnPeriod: number,
  durationMin: number
): number {
  const intensityMmHr = calculateCanadaIntensity(city, returnPeriod, durationMin);
  return intensityMmHr * (durationMin / 60);
}

/**
 * Generate IDF table for a city
 */
export function generateCanadaIdfTable(city: CanadaCityIdf): Array<{
  returnPeriod: number;
  duration: number;
  intensity: number;
  depthMm: number;
}> {
  const results: Array<{ returnPeriod: number; duration: number; intensity: number; depthMm: number }> = [];
  const periods = [2, 5, 10, 25, 50, 100];
  const durations = [5, 10, 15, 30, 60, 120, 360, 720, 1440];
  
  for (const P of periods) {
    for (const t of durations) {
      const intensity = calculateCanadaIntensity(city, P, t);
      const depthMm = intensity * (t / 60);
      results.push({ returnPeriod: P, duration: t, intensity, depthMm });
    }
  }
  
  return results;
}

/**
 * Generate alternating block hyetograph from IDF coefficients
 */
export function generateCanadaHyetograph(
  city: CanadaCityIdf,
  returnPeriod: number,
  totalDuration: number, // minutes
  timeStep: number       // minutes
): number[] {
  const numSteps = Math.floor(totalDuration / timeStep);
  
  // Cumulative depths for increasing durations
  const cumulativeDepths: number[] = [];
  for (let i = 1; i <= numSteps; i++) {
    const t = i * timeStep;
    const intensity = calculateCanadaIntensity(city, returnPeriod, t);
    const depthMm = intensity * (t / 60);
    cumulativeDepths.push(depthMm);
  }
  
  // Incremental depths
  const incrementalDepths: number[] = [];
  incrementalDepths.push(cumulativeDepths[0]);
  for (let i = 1; i < cumulativeDepths.length; i++) {
    incrementalDepths.push(cumulativeDepths[i] - cumulativeDepths[i - 1]);
  }
  
  // Sort descending
  incrementalDepths.sort((a, b) => b - a);
  
  // Alternating block arrangement (peak in center)
  const arranged: number[] = new Array(numSteps).fill(0);
  const center = Math.floor(numSteps / 2);
  
  for (let i = 0; i < incrementalDepths.length; i++) {
    let position: number;
    if (i === 0) {
      position = center;
    } else if (i % 2 === 1) {
      position = center - Math.ceil(i / 2);
    } else {
      position = center + Math.floor(i / 2);
    }
    
    if (position >= 0 && position < numSteps) {
      arranged[position] = incrementalDepths[i];
    }
  }
  
  // Convert depth (mm) to intensity (mm/hr)
  return arranged.map(d => d / (timeStep / 60));
}

/**
 * Get all unique provinces from the database
 */
export function getCanadaProvinces(): string[] {
  const provinces = new Set(canadaIdfDatabase.map(c => c.province));
  return Array.from(provinces).sort();
}

/**
 * Search Canadian cities by name or province
 */
export function searchCanadaCities(query: string): CanadaCityIdf[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return canadaIdfDatabase.filter(
    c => c.name.toLowerCase().includes(q) ||
         c.province.toLowerCase().includes(q) ||
         c.provinceFull.toLowerCase().includes(q) ||
         c.climateRegion.toLowerCase().includes(q)
  );
}
