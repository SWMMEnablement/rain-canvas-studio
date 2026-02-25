import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  desbordes:         { name: "Desbordes (IT77)",           region: "France",           description: "French double-triangle per Instruction Technique IT77" },
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
  euler1:            { name: "Euler Type I",               region: "Europe",           description: "Euler Type I synthetic storm" },
  euler2:            { name: "Euler Type II",              region: "Europe",           description: "Euler Type II synthetic storm" },
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
  nz_tp108:          { name: "Auckland TP108",              region: "New Zealand",      description: "Auckland Council TP108 design storm (3-month to 500-yr ARI)" },
  nz_wellington:     { name: "Wellington Regional",         region: "New Zealand",      description: "Wellington Regional Council frontal/orographic design storm" },
  nz_christchurch:   { name: "Christchurch Canterbury",     region: "New Zealand",      description: "Canterbury rain-shadow plains design storm" },
};

// ── Lightweight hyetograph generator (server-side) ──────────────────────

function generateHyetograph(
  pattern: PatternType,
  totalDepth: number,
  durationHr: number,
  timeStepMin: number,
): { time_min: number; intensity: number; cumulative: number }[] {
  const numSteps = Math.ceil((durationHr * 60) / timeStepMin);
  const intensities: number[] = [];

  // Core distributions (most commonly requested)
  switch (pattern) {
    case 'block': {
      const i = totalDepth / durationHr;
      for (let s = 0; s < numSteps; s++) intensities.push(i);
      break;
    }
    case 'scs2': {
      for (let s = 0; s < numSteps; s++) {
        const t = s / numSteps;
        const tN = Math.min((s + 1) / numSteps, 1);
        const cf = scs2Cum(t);
        const cn = scs2Cum(tN);
        intensities.push(((cn - cf) * totalDepth) / (timeStepMin / 60));
      }
      break;
    }
    case 'triangular': {
      const peakPos = 0.33;
      for (let s = 0; s < numSteps; s++) {
        const t = (s + 0.5) / numSteps;
        const frac = t <= peakPos ? t / peakPos : (1 - t) / (1 - peakPos);
        intensities.push(frac * 2 * totalDepth / durationHr);
      }
      break;
    }
    case 'chicago': {
      const r = 0.4; // peak ratio
      for (let s = 0; s < numSteps; s++) {
        const t = (s + 0.5) / numSteps;
        const dist = Math.abs(t - r);
        intensities.push(Math.exp(-8 * dist * dist) * 2.5 * totalDepth / durationHr);
      }
      // Normalise
      const sum = intensities.reduce((a, b) => a + b, 0) * (timeStepMin / 60);
      const scale = totalDepth / sum;
      for (let s = 0; s < numSteps; s++) intensities[s] *= scale;
      break;
    }
    default: {
      // Generic peaked distribution via beta-like shape
      const peakPos = 0.4;
      for (let s = 0; s < numSteps; s++) {
        const t = (s + 0.5) / numSteps;
        const a = 3, b = 4;
        const frac = Math.pow(t, a - 1) * Math.pow(1 - t, b - 1);
        intensities.push(frac);
      }
      const rawSum = intensities.reduce((a, b) => a + b, 0) * (timeStepMin / 60);
      const sc = totalDepth / rawSum;
      for (let s = 0; s < numSteps; s++) intensities[s] *= sc;
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

function scs2Cum(t: number): number {
  if (t <= 0.4) return 0.20 * Math.pow(t / 0.4, 0.75);
  if (t <= 0.5) return 0.20 + 0.51 * ((t - 0.4) / 0.1);
  if (t <= 0.6) return 0.71 + 0.13 * ((t - 0.5) / 0.1);
  return 0.84 + 0.16 * ((t - 0.6) / 0.4);
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
  data.forEach((d, i) => {
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
        version: '1.0.0',
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
