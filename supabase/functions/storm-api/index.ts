import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Pattern types and metadata ──────────────────────────────────────────

const VALID_PATTERNS = [
  'block','scs1','scs1a','scs2','scs3','double','triangular','trapezoidal',
  'fsr','chicago','huff1','huff2','huff3','huff4','desbordes','arr','jma',
  'china','sa_huff','dwa','dutch','italian','balanced','fdot1','fdot2',
  'fdot3','fdot4','fdot5','txdot','yen_chow','noaa_a14','udfcd','usace_sps',
  'feh','euler1','euler2','desbordes_double','canadian','pmp_hmr','singapore_pub',
  'china_gb50014','china_prd','india_imd','india_coastal','japan_amedas',
  'japan_baiu','japan_typhoon','korea_kma','malaysia_msma','indonesia_bmkg',
  'philippines_pagasa','vietnam_imhen','thailand_tmd','saudi_pme','uae_ncms',
  'qatar_kahramaa','oman_dgman','sa_sanral','kenya_kmd','nigeria_nimet',
  'egypt_hcww','brazil_ana','mexico_conagua','colombia_ideam','chile_dga',
  'nz_tp108','nz_wellington','nz_christchurch',
] as const;

type PatternType = typeof VALID_PATTERNS[number];

const patternMeta: Record<string, { name: string; region: string; description: string }> = {
  block:             { name: "Uniform Block",              region: "Universal",        description: "Constant intensity throughout" },
  scs1:              { name: "SCS Type I",                 region: "US Pacific",       description: "Pacific maritime climate" },
  scs1a:             { name: "SCS Type IA",                region: "US Pacific NW",    description: "Pacific Northwest coastal" },
  scs2:              { name: "SCS Type II",                region: "US General",       description: "Most of US (moderate climate)" },
  scs3:              { name: "SCS Type III",               region: "US Gulf Coast",    description: "Gulf Coast high rainfall" },
  double:            { name: "Double Peak",                region: "Universal",        description: "Bimodal storm pattern" },
  triangular:        { name: "Triangular",                 region: "UK",               description: "UK practice standard" },
  trapezoidal:       { name: "Trapezoidal",                region: "Universal",        description: "Sustained peak pattern" },
  fsr:               { name: "FSR (UK)",                   region: "UK",               description: "Flood Studies Report" },
  chicago:           { name: "Chicago",                    region: "US Urban",         description: "Alternating block IDF method" },
  huff1:             { name: "Huff Q1",                    region: "US Midwest",       description: "Peak in first quartile" },
  huff2:             { name: "Huff Q2",                    region: "US Midwest",       description: "Peak in second quartile" },
  huff3:             { name: "Huff Q3",                    region: "US Midwest",       description: "Peak in third quartile" },
  huff4:             { name: "Huff Q4",                    region: "US Midwest",       description: "Peak in fourth quartile" },
  desbordes:         { name: "Desbordes (IT77)",           region: "France",           description: "French double-triangle per IT77" },
  arr:               { name: "ARR (Australia)",            region: "Australia",        description: "Australian Rainfall & Runoff" },
  jma:               { name: "JMA",                        region: "Japan",            description: "Japan Meteorological Agency standard" },
  china:             { name: "China Standard",             region: "China",            description: "Chinese national design storm" },
  sa_huff:           { name: "South Africa Huff",          region: "South Africa",     description: "Huff-type distribution for South Africa" },
  dwa:               { name: "DWA (Germany)",              region: "Germany",          description: "German Water Association standard" },
  dutch:             { name: "Dutch Standard",             region: "Netherlands",      description: "Netherlands design storm" },
  italian:           { name: "Italian Standard",           region: "Italy",            description: "Italian hydrological practice" },
  balanced:          { name: "Balanced Storm",             region: "Universal",        description: "IDF-derived alternating block" },
  fdot1:             { name: "FDOT Zone 1",                region: "US Florida",       description: "Florida DOT Zone 1 (NW Panhandle)" },
  fdot2:             { name: "FDOT Zone 2",                region: "US Florida",       description: "Florida DOT Zone 2 (NE/North Central)" },
  fdot3:             { name: "FDOT Zone 3",                region: "US Florida",       description: "Florida DOT Zone 3 (Central)" },
  fdot4:             { name: "FDOT Zone 4",                region: "US Florida",       description: "Florida DOT Zone 4 (SW Coast)" },
  fdot5:             { name: "FDOT Zone 5",                region: "US Florida",       description: "Florida DOT Zone 5 (SE Coast/Keys)" },
  txdot:             { name: "TxDOT",                      region: "US Texas",         description: "Texas DOT design storm" },
  yen_chow:          { name: "Yen & Chow",                 region: "Universal",        description: "Yen–Chow triangular hyetograph" },
  noaa_a14:          { name: "NOAA Atlas 14",              region: "US",               description: "NOAA Atlas 14 precipitation frequency" },
  udfcd:             { name: "UDFCD",                      region: "US Colorado",      description: "Urban Drainage & Flood Control District" },
  usace_sps:         { name: "USACE SPS",                  region: "US",               description: "US Army Corps standard project storm" },
  feh:               { name: "FEH (UK)",                   region: "UK",               description: "Flood Estimation Handbook" },
  euler1:            { name: "Euler Type I",               region: "Europe",           description: "Euler Type I – peak at start (r≈0)" },
  euler2:            { name: "Euler Type II",              region: "Europe",           description: "Euler Type II – peak at r=0.30 per DWA-A 118" },
  desbordes_double:  { name: "Desbordes Double Peak",      region: "France",           description: "Mediterranean double-peak variant (IT77)" },
  canadian:          { name: "Canadian Standard",          region: "Canada",           description: "Environment Canada design storm" },
  pmp_hmr:           { name: "PMP (HMR)",                  region: "US",               description: "Probable Maximum Precipitation per HMR" },
  singapore_pub:     { name: "Singapore PUB",              region: "Singapore",        description: "Public Utilities Board design storm" },
  china_gb50014:     { name: "China GB 50014",             region: "China",            description: "National outdoor drainage standard" },
  china_prd:         { name: "China PRD",                  region: "China",            description: "Pearl River Delta regional pattern" },
  india_imd:         { name: "India IMD",                  region: "India",            description: "India Meteorological Department standard" },
  india_coastal:     { name: "India Coastal",              region: "India",            description: "Indian coastal monsoon pattern" },
  japan_amedas:      { name: "Japan AMeDAS",               region: "Japan",            description: "Automated Meteorological Data network" },
  japan_baiu:        { name: "Japan Baiu",                 region: "Japan",            description: "Baiu (plum rain) frontal pattern" },
  japan_typhoon:     { name: "Japan Typhoon",              region: "Japan",            description: "Typhoon bimodal rainfall pattern" },
  korea_kma:         { name: "Korea KMA",                  region: "South Korea",      description: "Korea Meteorological Administration" },
  malaysia_msma:     { name: "Malaysia MSMA",              region: "Malaysia",         description: "Manual Saliran Mesra Alam design storm" },
  indonesia_bmkg:    { name: "Indonesia BMKG",             region: "Indonesia",        description: "BMKG tropical convective pattern" },
  philippines_pagasa:{ name: "Philippines PAGASA",         region: "Philippines",      description: "PAGASA typhoon belt design storm" },
  vietnam_imhen:     { name: "Vietnam IMHEN",              region: "Vietnam",          description: "Institute of Meteorology design storm" },
  thailand_tmd:      { name: "Thailand TMD",               region: "Thailand",         description: "Thai Meteorological Department standard" },
  saudi_pme:         { name: "Saudi PME",                  region: "Saudi Arabia",     description: "Presidency of Meteorology arid climate" },
  uae_ncms:          { name: "UAE NCMS",                   region: "UAE",              description: "National Center of Meteorology design storm" },
  qatar_kahramaa:    { name: "Qatar Kahramaa",             region: "Qatar",            description: "Kahramaa burst-type arid storm" },
  oman_dgman:        { name: "Oman DGMAN",                 region: "Oman",             description: "Directorate General of Meteorology" },
  sa_sanral:         { name: "South Africa SANRAL",        region: "South Africa",     description: "SANRAL road drainage design storm" },
  kenya_kmd:         { name: "Kenya KMD",                  region: "Kenya",            description: "Kenya Meteorological Department" },
  nigeria_nimet:     { name: "Nigeria NiMet",              region: "Nigeria",          description: "Nigerian Meteorological Agency" },
  egypt_hcww:        { name: "Egypt HCWW",                 region: "Egypt",            description: "Holding Company for Water & Wastewater" },
  brazil_ana:        { name: "Brazil ANA",                 region: "Brazil",           description: "Agência Nacional de Águas standard" },
  mexico_conagua:    { name: "Mexico CONAGUA",             region: "Mexico",           description: "Comisión Nacional del Agua design storm" },
  colombia_ideam:    { name: "Colombia IDEAM",             region: "Colombia",         description: "IDEAM tropical Andean pattern" },
  chile_dga:         { name: "Chile DGA",                  region: "Chile",            description: "Dirección General de Aguas standard" },
  nz_tp108:          { name: "Auckland TP108",              region: "New Zealand",      description: "Auckland Council TP108 design storm" },
  nz_wellington:     { name: "Wellington Regional",         region: "New Zealand",      description: "Wellington Regional Council frontal/orographic" },
  nz_christchurch:   { name: "Christchurch Canterbury",     region: "New Zealand",      description: "Canterbury rain-shadow plains design storm" },
};

// ── Utility helpers ─────────────────────────────────────────────────────

/** Linear interpolation on a cumulative curve defined by (t, P) pairs (0→1) */
function lerpCum(t: number, pts: [number, number][]): number {
  if (t <= pts[0][0]) return pts[0][1];
  if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const f = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1]);
    }
  }
  return pts[pts.length - 1][1];
}

/** Generate intensities from a cumulative fraction function */
function fromCumulative(
  cumFn: (t: number) => number,
  numSteps: number,
  totalDepth: number,
  durationHr: number,
  timeStepMin: number,
): number[] {
  const intensities: number[] = [];
  for (let s = 0; s < numSteps; s++) {
    const t0 = s / numSteps;
    const t1 = Math.min((s + 1) / numSteps, 1);
    const depthFrac = cumFn(t1) - cumFn(t0);
    intensities.push((depthFrac * totalDepth) / (timeStepMin / 60));
  }
  return intensities;
}

/** Generate from a peaked shape function, then normalise to totalDepth */
function fromShape(
  shapeFn: (t: number) => number,
  numSteps: number,
  totalDepth: number,
  timeStepMin: number,
): number[] {
  const raw: number[] = [];
  for (let s = 0; s < numSteps; s++) {
    const t = (s + 0.5) / numSteps;
    raw.push(shapeFn(t));
  }
  const sum = raw.reduce((a, b) => a + b, 0) * (timeStepMin / 60);
  const scale = sum > 0 ? totalDepth / sum : 0;
  return raw.map(v => v * scale);
}

/** Gaussian shape centered at peakPos with given sigma */
function gaussian(t: number, peakPos: number, sigma: number): number {
  const d = t - peakPos;
  return Math.exp(-0.5 * (d / sigma) * (d / sigma));
}

/** Triangular shape peaking at peakPos */
function triShape(t: number, peakPos: number): number {
  if (t <= peakPos) return peakPos > 0 ? t / peakPos : 1;
  return (1 - peakPos) > 0 ? (1 - t) / (1 - peakPos) : 1;
}

// ── SCS cumulative curves ───────────────────────────────────────────────

// NRCS 24-hr cumulative mass curves (fraction of total depth vs fraction of time)
const SCS1_CUM: [number, number][] = [
  [0,0],[0.083,0.035],[0.167,0.076],[0.25,0.125],[0.333,0.194],
  [0.375,0.250],[0.417,0.425],[0.458,0.520],[0.5,0.577],[0.542,0.601],
  [0.583,0.624],[0.667,0.664],[0.75,0.735],[0.833,0.811],[0.917,0.886],[1,1]
];

const SCS1A_CUM: [number, number][] = [
  [0,0],[0.083,0.050],[0.167,0.116],[0.25,0.206],[0.292,0.268],
  [0.333,0.425],[0.375,0.480],[0.417,0.520],[0.458,0.550],[0.5,0.577],
  [0.583,0.624],[0.667,0.664],[0.75,0.735],[0.833,0.811],[0.917,0.886],[1,1]
];

function scs2Cum(t: number): number {
  if (t <= 0.4) return 0.20 * Math.pow(t / 0.4, 0.75);
  if (t <= 0.5) return 0.20 + 0.51 * ((t - 0.4) / 0.1);
  if (t <= 0.6) return 0.71 + 0.13 * ((t - 0.5) / 0.1);
  return 0.84 + 0.16 * ((t - 0.6) / 0.4);
}

const SCS3_CUM: [number, number][] = [
  [0,0],[0.083,0.020],[0.167,0.048],[0.25,0.080],[0.333,0.120],
  [0.417,0.180],[0.458,0.298],[0.5,0.500],[0.542,0.702],[0.583,0.751],
  [0.667,0.811],[0.75,0.886],[0.833,0.940],[0.917,0.972],[1,1]
];

// ── Huff quartile cumulative curves ─────────────────────────────────────

const HUFF1_CUM: [number, number][] = [
  [0,0],[0.05,0.063],[0.1,0.178],[0.15,0.333],[0.2,0.488],[0.25,0.600],
  [0.3,0.650],[0.4,0.725],[0.5,0.780],[0.6,0.830],[0.7,0.870],[0.8,0.920],[0.9,0.960],[1,1]
];
const HUFF2_CUM: [number, number][] = [
  [0,0],[0.1,0.020],[0.2,0.080],[0.25,0.150],[0.3,0.260],[0.35,0.420],
  [0.4,0.520],[0.45,0.580],[0.5,0.640],[0.6,0.750],[0.7,0.830],[0.8,0.900],[0.9,0.955],[1,1]
];
const HUFF3_CUM: [number, number][] = [
  [0,0],[0.1,0.020],[0.2,0.050],[0.3,0.100],[0.4,0.180],[0.45,0.260],
  [0.5,0.380],[0.55,0.520],[0.6,0.640],[0.65,0.720],[0.7,0.780],[0.8,0.880],[0.9,0.945],[1,1]
];
const HUFF4_CUM: [number, number][] = [
  [0,0],[0.1,0.010],[0.2,0.030],[0.3,0.060],[0.4,0.100],[0.5,0.160],
  [0.6,0.260],[0.7,0.420],[0.75,0.520],[0.8,0.640],[0.85,0.760],[0.9,0.880],[0.95,0.940],[1,1]
];

// ── FDOT cumulative curves (Florida zones 1-5) ──────────────────────────

const FDOT1_CUM: [number, number][] = [
  [0,0],[0.083,0.035],[0.167,0.085],[0.25,0.150],[0.333,0.240],
  [0.417,0.500],[0.5,0.700],[0.583,0.800],[0.667,0.865],[0.75,0.910],[0.833,0.950],[0.917,0.978],[1,1]
];
const FDOT2_CUM: [number, number][] = [
  [0,0],[0.083,0.030],[0.167,0.075],[0.25,0.140],[0.333,0.230],
  [0.417,0.480],[0.5,0.680],[0.583,0.790],[0.667,0.855],[0.75,0.905],[0.833,0.945],[0.917,0.975],[1,1]
];
const FDOT3_CUM: [number, number][] = [
  [0,0],[0.083,0.025],[0.167,0.065],[0.25,0.130],[0.333,0.220],
  [0.417,0.460],[0.5,0.660],[0.583,0.780],[0.667,0.850],[0.75,0.900],[0.833,0.940],[0.917,0.973],[1,1]
];
const FDOT4_CUM: [number, number][] = [
  [0,0],[0.083,0.020],[0.167,0.055],[0.25,0.120],[0.333,0.200],
  [0.417,0.440],[0.5,0.640],[0.583,0.770],[0.667,0.840],[0.75,0.895],[0.833,0.935],[0.917,0.970],[1,1]
];
const FDOT5_CUM: [number, number][] = [
  [0,0],[0.083,0.015],[0.167,0.045],[0.25,0.100],[0.333,0.185],
  [0.417,0.420],[0.5,0.620],[0.583,0.760],[0.667,0.835],[0.75,0.890],[0.833,0.932],[0.917,0.968],[1,1]
];

// ── Lightweight hyetograph generator (server-side) ──────────────────────

function generateHyetograph(
  pattern: PatternType,
  totalDepth: number,
  durationHr: number,
  timeStepMin: number,
): { time_min: number; intensity: number; cumulative: number }[] {
  const numSteps = Math.ceil((durationHr * 60) / timeStepMin);
  let intensities: number[];

  switch (pattern) {
    // ── Universal / US patterns ────────────────────────────────────────
    case 'block': {
      const i = totalDepth / durationHr;
      intensities = Array(numSteps).fill(i);
      break;
    }
    case 'scs1':
      intensities = fromCumulative(t => lerpCum(t, SCS1_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'scs1a':
      intensities = fromCumulative(t => lerpCum(t, SCS1A_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'scs2':
      intensities = fromCumulative(scs2Cum, numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'scs3':
      intensities = fromCumulative(t => lerpCum(t, SCS3_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'double':
      intensities = fromShape(t => gaussian(t, 0.3, 0.08) + 0.7 * gaussian(t, 0.7, 0.08), numSteps, totalDepth, timeStepMin);
      break;
    case 'triangular':
      intensities = fromShape(t => triShape(t, 0.33), numSteps, totalDepth, timeStepMin);
      break;
    case 'trapezoidal':
      intensities = fromShape(t => t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1, numSteps, totalDepth, timeStepMin);
      break;
    case 'fsr':
      // UK FSR winter profile – peak at 42%
      intensities = fromShape(t => triShape(t, 0.42), numSteps, totalDepth, timeStepMin);
      break;
    case 'chicago':
      intensities = fromShape(t => gaussian(t, 0.4, 0.08), numSteps, totalDepth, timeStepMin);
      break;

    // ── Huff quartile distributions ────────────────────────────────────
    case 'huff1':
      intensities = fromCumulative(t => lerpCum(t, HUFF1_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'huff2':
      intensities = fromCumulative(t => lerpCum(t, HUFF2_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'huff3':
      intensities = fromCumulative(t => lerpCum(t, HUFF3_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'huff4':
      intensities = fromCumulative(t => lerpCum(t, HUFF4_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;

    // ── France ─────────────────────────────────────────────────────────
    case 'desbordes':
      // IT77 double-triangle: peak at 30%, steep rise, gradual decay
      intensities = fromShape(t => {
        if (t <= 0.3) return t / 0.3;
        if (t <= 0.5) return 1 - 0.3 * ((t - 0.3) / 0.2);
        return 0.7 * (1 - t) / 0.5;
      }, numSteps, totalDepth, timeStepMin);
      break;
    case 'desbordes_double':
      // Mediterranean double-peak IT77 variant
      intensities = fromShape(t => {
        const p1 = gaussian(t, 0.25, 0.07);
        const p2 = gaussian(t, 0.65, 0.10);
        return p1 + 0.6 * p2;
      }, numSteps, totalDepth, timeStepMin);
      break;

    // ── Australia ──────────────────────────────────────────────────────
    case 'arr':
      // ARR ensemble median – center-peaked
      intensities = fromShape(t => gaussian(t, 0.5, 0.12), numSteps, totalDepth, timeStepMin);
      break;

    // ── Japan ──────────────────────────────────────────────────────────
    case 'jma':
      // JMA standard – center-peaked with moderate flanks
      intensities = fromShape(t => gaussian(t, 0.5, 0.15), numSteps, totalDepth, timeStepMin);
      break;
    case 'japan_amedas':
      // AMeDAS convective – sharp center peak
      intensities = fromShape(t => gaussian(t, 0.45, 0.10), numSteps, totalDepth, timeStepMin);
      break;
    case 'japan_baiu':
      // Baiu frontal – broad mid-duration peak with slow buildup
      intensities = fromShape(t => {
        if (t < 0.2) return 0.3 * t / 0.2;
        if (t < 0.6) return 0.3 + 0.7 * gaussian(t, 0.5, 0.12);
        return gaussian(t, 0.5, 0.18);
      }, numSteps, totalDepth, timeStepMin);
      break;
    case 'japan_typhoon':
      // Typhoon bimodal – outer rainband then eyewall
      intensities = fromShape(t => {
        const outerBand = gaussian(t, 0.3, 0.08);
        const eyewall = 1.5 * gaussian(t, 0.7, 0.06);
        return outerBand + eyewall;
      }, numSteps, totalDepth, timeStepMin);
      break;

    // ── China ──────────────────────────────────────────────────────────
    case 'china':
      // Chinese national design storm – peak around 40%
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin);
      break;
    case 'china_gb50014':
      // GB 50014 – Chicago-style with r=0.4
      intensities = fromShape(t => gaussian(t, 0.40, 0.09), numSteps, totalDepth, timeStepMin);
      break;
    case 'china_prd':
      // Pearl River Delta – slightly earlier peak, tropical
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin);
      break;

    // ── South Africa ──────────────────────────────────────────────────
    case 'sa_huff':
      // South African Huff median (50% quartile 2 dominant)
      intensities = fromCumulative(t => lerpCum(t, HUFF2_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'sa_sanral':
      // SANRAL road drainage – SCS-style with earlier peak
      intensities = fromShape(t => gaussian(t, 0.42, 0.10), numSteps, totalDepth, timeStepMin);
      break;

    // ── Germany / Europe ──────────────────────────────────────────────
    case 'dwa':
      // DWA-A 118 model rain – Euler Type II variant
      intensities = fromShape(t => gaussian(t, 0.30, 0.09), numSteps, totalDepth, timeStepMin);
      break;
    case 'euler1':
      // Euler Type I – peak at start, decreasing intensity
      intensities = fromShape(t => Math.exp(-3 * t), numSteps, totalDepth, timeStepMin);
      break;
    case 'euler2':
      // Euler Type II – peak at r=0.30 per DWA-A 118
      intensities = fromShape(t => {
        if (t <= 0.30) return Math.exp(-4 * (0.30 - t));
        return Math.exp(-3 * (t - 0.30));
      }, numSteps, totalDepth, timeStepMin);
      break;

    // ── Netherlands ───────────────────────────────────────────────────
    case 'dutch':
      // Dutch NEERSLAG – uniform with slight center peak
      intensities = fromShape(t => 0.6 + 0.4 * gaussian(t, 0.5, 0.20), numSteps, totalDepth, timeStepMin);
      break;

    // ── Italy ─────────────────────────────────────────────────────────
    case 'italian':
      // Italian standard – exponential decay (a/n method)
      intensities = fromShape(t => Math.exp(-2.5 * t), numSteps, totalDepth, timeStepMin);
      break;

    // ── Balanced / Alternating Block ──────────────────────────────────
    case 'balanced':
      intensities = fromShape(t => gaussian(t, 0.5, 0.10), numSteps, totalDepth, timeStepMin);
      break;
    case 'noaa_a14':
      // NOAA Atlas 14 – balanced storm at center
      intensities = fromShape(t => gaussian(t, 0.5, 0.11), numSteps, totalDepth, timeStepMin);
      break;

    // ── Florida DOT zones ─────────────────────────────────────────────
    case 'fdot1':
      intensities = fromCumulative(t => lerpCum(t, FDOT1_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'fdot2':
      intensities = fromCumulative(t => lerpCum(t, FDOT2_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'fdot3':
      intensities = fromCumulative(t => lerpCum(t, FDOT3_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'fdot4':
      intensities = fromCumulative(t => lerpCum(t, FDOT4_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;
    case 'fdot5':
      intensities = fromCumulative(t => lerpCum(t, FDOT5_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;

    // ── Texas ─────────────────────────────────────────────────────────
    case 'txdot':
      // TxDOT – balanced storm, center peak
      intensities = fromShape(t => gaussian(t, 0.5, 0.12), numSteps, totalDepth, timeStepMin);
      break;

    // ── Universal simple shapes ───────────────────────────────────────
    case 'yen_chow':
      // Yen & Chow – symmetrical triangular
      intensities = fromShape(t => triShape(t, 0.5), numSteps, totalDepth, timeStepMin);
      break;

    // ── US regional ───────────────────────────────────────────────────
    case 'udfcd':
      // UDFCD Denver – 2-hr design storm, peak at 33%
      intensities = fromShape(t => gaussian(t, 0.33, 0.08), numSteps, totalDepth, timeStepMin);
      break;
    case 'usace_sps':
      // USACE Standard Project Storm – center-peaked
      intensities = fromShape(t => gaussian(t, 0.5, 0.13), numSteps, totalDepth, timeStepMin);
      break;

    // ── UK ─────────────────────────────────────────────────────────────
    case 'feh':
      // FEH/ReFH2 – summer 75% winter 50% profile, using 50% as default
      intensities = fromShape(t => triShape(t, 0.50), numSteps, totalDepth, timeStepMin);
      break;

    // ── Canada ─────────────────────────────────────────────────────────
    case 'canadian':
      // Environment Canada – AES 30% pattern (peak at 30%)
      intensities = fromShape(t => gaussian(t, 0.30, 0.10), numSteps, totalDepth, timeStepMin);
      break;

    // ── PMP ────────────────────────────────────────────────────────────
    case 'pmp_hmr':
      // HMR 51/52 PMP – extremely center-peaked
      intensities = fromShape(t => gaussian(t, 0.5, 0.07), numSteps, totalDepth, timeStepMin);
      break;

    // ── Southeast Asia ────────────────────────────────────────────────
    case 'singapore_pub':
      // PUB design storm – sharp peak, tropical burst
      intensities = fromShape(t => gaussian(t, 0.35, 0.08), numSteps, totalDepth, timeStepMin);
      break;
    case 'malaysia_msma':
      // MSMA – peak at ~33%, tropical convective
      intensities = fromShape(t => gaussian(t, 0.33, 0.09), numSteps, totalDepth, timeStepMin);
      break;
    case 'indonesia_bmkg':
      // BMKG – sharp tropical convective burst
      intensities = fromShape(t => gaussian(t, 0.30, 0.07), numSteps, totalDepth, timeStepMin);
      break;
    case 'philippines_pagasa':
      // PAGASA – typhoon belt, extended peak
      intensities = fromShape(t => {
        const main = gaussian(t, 0.45, 0.12);
        const tail = 0.3 * gaussian(t, 0.75, 0.10);
        return main + tail;
      }, numSteps, totalDepth, timeStepMin);
      break;
    case 'vietnam_imhen':
      // IMHEN – monsoon-influenced, center peak
      intensities = fromShape(t => gaussian(t, 0.45, 0.11), numSteps, totalDepth, timeStepMin);
      break;
    case 'thailand_tmd':
      // TMD – tropical convective, early-to-mid peak
      intensities = fromShape(t => gaussian(t, 0.38, 0.10), numSteps, totalDepth, timeStepMin);
      break;

    // ── South Asia ────────────────────────────────────────────────────
    case 'india_imd':
      // IMD standard – monsoon burst, peak ~35%
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin);
      break;
    case 'india_coastal':
      // Coastal monsoon – sustained with late secondary
      intensities = fromShape(t => {
        const monsoon = gaussian(t, 0.35, 0.10);
        const secondary = 0.4 * gaussian(t, 0.70, 0.08);
        return monsoon + secondary;
      }, numSteps, totalDepth, timeStepMin);
      break;

    // ── South Korea ───────────────────────────────────────────────────
    case 'korea_kma':
      // KMA Huff 3rd quartile variant
      intensities = fromCumulative(t => lerpCum(t, HUFF3_CUM), numSteps, totalDepth, durationHr, timeStepMin);
      break;

    // ── Middle East / Arid ────────────────────────────────────────────
    case 'saudi_pme':
      // PME arid – very sharp burst, peak ~25%
      intensities = fromShape(t => gaussian(t, 0.25, 0.06), numSteps, totalDepth, timeStepMin);
      break;
    case 'uae_ncms':
      // NCMS – short sharp arid burst
      intensities = fromShape(t => gaussian(t, 0.30, 0.06), numSteps, totalDepth, timeStepMin);
      break;
    case 'qatar_kahramaa':
      // Kahramaa – extreme front-loaded burst
      intensities = fromShape(t => gaussian(t, 0.20, 0.05), numSteps, totalDepth, timeStepMin);
      break;
    case 'oman_dgman':
      // DGMAN – arid flash, very early peak
      intensities = fromShape(t => gaussian(t, 0.22, 0.06), numSteps, totalDepth, timeStepMin);
      break;

    // ── Africa ─────────────────────────────────────────────────────────
    case 'kenya_kmd':
      // KMD – tropical with mid-duration peak
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin);
      break;
    case 'nigeria_nimet':
      // NiMet – West African squall line, front-loaded
      intensities = fromShape(t => gaussian(t, 0.28, 0.08), numSteps, totalDepth, timeStepMin);
      break;
    case 'egypt_hcww':
      // HCWW – Mediterranean arid, sharp burst
      intensities = fromShape(t => gaussian(t, 0.25, 0.07), numSteps, totalDepth, timeStepMin);
      break;

    // ── Latin America ─────────────────────────────────────────────────
    case 'brazil_ana':
      // ANA – tropical convective, peak ~35%
      intensities = fromShape(t => gaussian(t, 0.35, 0.09), numSteps, totalDepth, timeStepMin);
      break;
    case 'mexico_conagua':
      // CONAGUA – SCS-style with peak at 40%
      intensities = fromShape(t => gaussian(t, 0.40, 0.10), numSteps, totalDepth, timeStepMin);
      break;
    case 'colombia_ideam':
      // IDEAM – tropical Andean bimodal
      intensities = fromShape(t => {
        return gaussian(t, 0.35, 0.08) + 0.5 * gaussian(t, 0.70, 0.08);
      }, numSteps, totalDepth, timeStepMin);
      break;
    case 'chile_dga':
      // DGA – frontal system, gradual ramp then peak at 60%
      intensities = fromShape(t => {
        if (t < 0.3) return 0.2 * t / 0.3;
        return 0.2 + 0.8 * gaussian(t, 0.60, 0.12);
      }, numSteps, totalDepth, timeStepMin);
      break;

    // ── New Zealand ───────────────────────────────────────────────────
    case 'nz_tp108':
      // Auckland TP108 – center-peaked design storm
      intensities = fromShape(t => gaussian(t, 0.50, 0.11), numSteps, totalDepth, timeStepMin);
      break;
    case 'nz_wellington':
      // Wellington – frontal/orographic, gradual buildup, peak at 55%
      intensities = fromShape(t => {
        if (t < 0.2) return 0.3 * t / 0.2;
        return 0.3 + 0.7 * gaussian(t, 0.55, 0.12);
      }, numSteps, totalDepth, timeStepMin);
      break;
    case 'nz_christchurch':
      // Canterbury – rain shadow, symmetric moderate peak
      intensities = fromShape(t => gaussian(t, 0.50, 0.15), numSteps, totalDepth, timeStepMin);
      break;

    default: {
      // Should never reach here since we validate patterns above
      intensities = fromShape(t => gaussian(t, 0.4, 0.12), numSteps, totalDepth, timeStepMin);
      break;
    }
  }

  // Build output with cumulative
  let cumulative = 0;
  return intensities.map((intensity, i) => {
    cumulative += intensity * (timeStepMin / 60);
    return {
      time_min: i * timeStepMin,
      intensity: Math.round(intensity * 10000) / 10000,
      cumulative: Math.round(cumulative * 10000) / 10000,
    };
  });
}

// ── Storm statistics from raw timeseries ────────────────────────────────

function analyzeTimeseries(data: { time_min: number; intensity: number }[]) {
  if (data.length < 2) return null;

  const totalDepth = data.reduce((sum, d, i) => {
    const dt = i > 0 ? (d.time_min - data[i - 1].time_min) / 60 : 0;
    return sum + d.intensity * dt;
  }, 0);
  const duration = data[data.length - 1].time_min - data[0].time_min;
  const peakIntensity = Math.max(...data.map(d => d.intensity));
  const peakIdx = data.findIndex(d => d.intensity === peakIntensity);
  const peakTime = data[peakIdx].time_min;
  const peakPosition = duration > 0 ? (peakTime - data[0].time_min) / duration : 0.5;

  // Centroid
  let weightedSum = 0, totalWeight = 0;
  data.forEach((d) => {
    const t = duration > 0 ? (d.time_min - data[0].time_min) / duration : 0;
    weightedSum += t * d.intensity;
    totalWeight += d.intensity;
  });
  const centroid = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

  // Quartile fractions
  const quarters = [0, 0, 0, 0];
  data.forEach((d, i) => {
    const t = duration > 0 ? (d.time_min - data[0].time_min) / duration : 0;
    const q = Math.min(Math.floor(t * 4), 3);
    const dt = i > 0 ? (d.time_min - data[i - 1].time_min) / 60 : 0;
    quarters[q] += d.intensity * dt;
  });
  const qTotal = quarters.reduce((a, b) => a + b, 0) || 1;
  const qFractions = quarters.map(q => Math.round((q / qTotal) * 1000) / 10);

  return {
    total_depth: Math.round(totalDepth * 1000) / 1000,
    duration_min: duration,
    peak_intensity: Math.round(peakIntensity * 1000) / 1000,
    peak_time_min: peakTime,
    peak_position: Math.round(peakPosition * 1000) / 1000,
    centroid: Math.round(centroid * 1000) / 1000,
    quartile_fractions_pct: { q1: qFractions[0], q2: qFractions[1], q3: qFractions[2], q4: qFractions[3] },
    dominant_quartile: qFractions.indexOf(Math.max(...qFractions)) + 1,
  };
}

// ── Request router ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean).pop() || '';

  try {
    // GET /storm-api/patterns – list available patterns
    if (path === 'patterns' && req.method === 'GET') {
      const patterns = VALID_PATTERNS.map(p => ({
        id: p,
        ...(patternMeta[p] || { name: p, region: 'Various', description: '' }),
      }));
      return json({ patterns, count: patterns.length });
    }

    // POST /storm-api/generate – generate a hyetograph
    if (path === 'generate' && req.method === 'POST') {
      const body = await req.json();
      const { pattern, total_depth, duration_hr, time_step_min } = body;

      if (!pattern || !VALID_PATTERNS.includes(pattern)) {
        return json({ error: `Invalid pattern. Use GET /patterns for the list.` }, 400);
      }
      const depth = Number(total_depth);
      const dur = Number(duration_hr);
      const ts = Number(time_step_min) || 15;

      if (!depth || depth <= 0 || depth > 100) return json({ error: 'total_depth must be 0-100' }, 400);
      if (!dur || dur <= 0 || dur > 72) return json({ error: 'duration_hr must be 0-72' }, 400);
      if (ts < 1 || ts > 360) return json({ error: 'time_step_min must be 1-360' }, 400);

      const data = generateHyetograph(pattern, depth, dur, ts);
      return json({
        pattern,
        total_depth: depth,
        duration_hr: dur,
        time_step_min: ts,
        data_points: data.length,
        data,
      });
    }

    // POST /storm-api/analyze – analyze a timeseries
    if (path === 'analyze' && req.method === 'POST') {
      const body = await req.json();
      const { data } = body;

      if (!Array.isArray(data) || data.length < 2) {
        return json({ error: 'Provide an array "data" with [{time_min, intensity}, ...] (min 2 points)' }, 400);
      }

      const validated = data.map((d: any) => ({
        time_min: Number(d.time_min),
        intensity: Number(d.intensity),
      }));

      if (validated.some((d: any) => isNaN(d.time_min) || isNaN(d.intensity))) {
        return json({ error: 'Each data point must have numeric time_min and intensity' }, 400);
      }

      const stats = analyzeTimeseries(validated);
      if (!stats) return json({ error: 'Could not analyze data' }, 400);

      return json({ analysis: stats });
    }

    // GET /storm-api – docs / health
    if (!path || path === 'storm-api') {
      return json({
        name: 'Storm API',
        version: '2.0.0',
        patterns_count: VALID_PATTERNS.length,
        endpoints: [
          { method: 'GET',  path: '/storm-api/patterns', description: 'List all available rainfall distribution patterns' },
          { method: 'POST', path: '/storm-api/generate',  description: 'Generate a design-storm hyetograph', body: { pattern: 'scs2', total_depth: 4, duration_hr: 6, time_step_min: 15 } },
          { method: 'POST', path: '/storm-api/analyze',   description: 'Analyze a rainfall timeseries', body: { data: [{ time_min: 0, intensity: 0.5 }, { time_min: 15, intensity: 1.2 }] } },
        ],
      });
    }

    return json({ error: 'Not found. GET /storm-api for docs.' }, 404);
  } catch (err) {
    console.error('Storm API error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
