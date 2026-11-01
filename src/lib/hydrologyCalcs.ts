/**
 * Engineering calculations used by the linked calculators (runoff → detention, Modified Puls,
 * unit-hydrograph convolution, LID accounting). Kept free of React so they can be tested directly.
 * US customary internally: inches, acres, cfs, ft³, hours.
 */

export const CUFT_PER_ACRE_FT = 43560;
export const ACRES_PER_HECTARE = 2.471053814671653;

/* ------------------------------------------------------------------ */
/* Runoff → detention transfer                                         */
/* ------------------------------------------------------------------ */

export interface RunoffTransfer {
  /** Runoff depth in inches (converted from mm when the runoff calculator is metric). */
  depthIn: number;
  /** Contributing area in acres (converted from hectares when metric). */
  areaAcres: number;
}

/** Package a runoff result with explicit units so the detention calculator never mixes mm and inches. */
export function toRunoffTransfer(Q: number, area: number, units: "us" | "metric"): RunoffTransfer | null {
  if (!Number.isFinite(Q) || Q < 0 || !Number.isFinite(area) || area < 0) return null;
  return units === "us"
    ? { depthIn: Q, areaAcres: area }
    : { depthIn: Q / 25.4, areaAcres: area * ACRES_PER_HECTARE };
}

/** SCS curve-number runoff depth (same units as P). `metric` uses S in mm. */
export function scsRunoff(P: number, CN: number, iaRatio = 0.2, metric = false): number {
  if (!(P > 0) || !(CN > 0) || CN > 100) return 0;
  const S = metric ? 25400 / CN - 254 : 1000 / CN - 10;
  const Ia = iaRatio * S;
  return P > Ia ? (P - Ia) ** 2 / (P - Ia + S) : 0;
}

/* ------------------------------------------------------------------ */
/* Modified Puls (storage-indication) routing                          */
/* ------------------------------------------------------------------ */

export interface SsoPoint { stage: number; storage: number; outflow: number }
export interface InflowRow { time: number; inflow: number }
export interface RoutedRow { time: number; inflow: number; outflow: number; storage: number; stage: number; exceeded: boolean }

export interface RoutingSummary {
  rows: RoutedRow[];
  /** ∫I dt (ft³), ∫O dt (ft³), final storage (ft³) and the continuity residual ∫I − ∫O − ΔS (ft³). */
  inflowVolume: number;
  outflowVolume: number;
  finalStorage: number;
  continuityResidual: number;
  /** True when the storage-indication value went above the top of the stage–storage–discharge table. */
  tableExceeded: boolean;
}

/**
 * Modified Puls routing. Storage and outflow are read from the SAME bracket of the
 * storage-indication curve (2S/Δt + O), so flat stretches of the outflow curve (e.g. below an
 * elevated outlet) keep their stored water. Above the table the last segment is extrapolated
 * and the row is flagged rather than silently clamped.
 */
export function routeModifiedPuls(inflow: InflowRow[], sso: SsoPoint[]): RoutingSummary {
  const table = [...sso].filter((p) => [p.stage, p.storage, p.outflow].every(Number.isFinite)).sort((a, b) => a.storage - b.storage);
  const rowsIn = [...inflow].filter((r) => Number.isFinite(r.time) && Number.isFinite(r.inflow)).sort((a, b) => a.time - b.time);
  const empty: RoutingSummary = { rows: [], inflowVolume: 0, outflowVolume: 0, finalStorage: 0, continuityResidual: 0, tableExceeded: false };
  if (rowsIn.length < 2 || table.length < 2) return empty;

  const rows: RoutedRow[] = [];
  let S1 = table[0].storage;
  let O1 = table[0].outflow;
  const S0 = S1;
  let inVol = 0, outVol = 0, anyExceeded = false;
  rows.push({ time: rowsIn[0].time, inflow: rowsIn[0].inflow, outflow: O1, storage: S1, stage: table[0].stage, exceeded: false });

  for (let i = 1; i < rowsIn.length; i++) {
    const I1 = rowsIn[i - 1].inflow;
    const I2 = rowsIn[i].inflow;
    const dt = (rowsIn[i].time - rowsIn[i - 1].time) * 3600;
    if (!(dt > 0)) continue;
    const ind = table.map((p) => (2 * p.storage) / dt + p.outflow);
    const target = (2 * S1) / dt - O1 + I1 + I2;

    let k = 0;
    while (k < ind.length - 2 && target > ind[k + 1]) k++;
    const lo = table[k], hi = table[k + 1];
    const span = ind[k + 1] - ind[k];
    let r = span > 0 ? (target - ind[k]) / span : 0;
    const exceeded = r > 1 && k === ind.length - 2;
    if (r < 0) r = 0;
    let S2 = lo.storage + r * (hi.storage - lo.storage);
    let O2 = lo.outflow + r * (hi.outflow - lo.outflow);
    const stage2 = lo.stage + r * (hi.stage - lo.stage);
    // Guard against tiny negative values from round-off.
    S2 = Math.max(0, S2); O2 = Math.max(0, O2);

    inVol += ((I1 + I2) / 2) * dt;
    outVol += ((O1 + O2) / 2) * dt;
    anyExceeded ||= exceeded;
    rows.push({ time: rowsIn[i].time, inflow: I2, outflow: O2, storage: S2, stage: stage2, exceeded });
    S1 = S2; O1 = O2;
  }
  return {
    rows,
    inflowVolume: inVol,
    outflowVolume: outVol,
    finalStorage: S1,
    continuityResidual: inVol - outVol - (S1 - S0),
    tableExceeded: anyExceeded,
  };
}

/* ------------------------------------------------------------------ */
/* Unit hydrograph + convolution                                       */
/* ------------------------------------------------------------------ */

export const NRCS_DIMENSIONLESS_UH: Array<[number, number]> = [
  [0, 0], [0.1, 0.03], [0.2, 0.1], [0.3, 0.19], [0.4, 0.31], [0.5, 0.47], [0.6, 0.66], [0.7, 0.82],
  [0.8, 0.93], [0.9, 0.99], [1.0, 1.0], [1.1, 0.99], [1.2, 0.93], [1.3, 0.86], [1.4, 0.78], [1.5, 0.68],
  [1.6, 0.56], [1.7, 0.46], [1.8, 0.39], [1.9, 0.33], [2.0, 0.28], [2.2, 0.207], [2.4, 0.147],
  [2.6, 0.107], [2.8, 0.077], [3.0, 0.055], [3.2, 0.04], [3.4, 0.029], [3.6, 0.021], [3.8, 0.015],
  [4.0, 0.011], [4.5, 0.005], [5.0, 0],
];

function interpTable(x: number, table: Array<[number, number]>): number {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i], [x1, y1] = table[i + 1];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return table[table.length - 1][1];
}

export interface UnitHydrographParams { areaAcres: number; tcHours: number; dtHours: number; method: "triangular" | "dimensionless"; peakFactor?: number }

/**
 * NRCS unit hydrograph ordinates (cfs per inch of excess) at Δt spacing, for a unit excess of
 * duration Δt. Ordinates are rescaled so their volume is exactly one inch over the watershed.
 */
export function unitHydrograph({ areaAcres, tcHours, dtHours, method, peakFactor = 484 }: UnitHydrographParams) {
  const lag = 0.6 * tcHours;
  const tp = dtHours / 2 + lag;
  const qp = (peakFactor * (areaAcres / 640)) / tp;
  const tb = method === "triangular" ? 2.67 * tp : 5 * tp;
  const ords: number[] = [];
  for (let n = 0; n * dtHours <= tb + 1e-9; n++) {
    const t = n * dtHours;
    const q = method === "triangular"
      ? t <= tp ? (t / tp) * qp : Math.max(0, qp * (1 - (t - tp) / (tb - tp)))
      : qp * interpTable(t / tp, NRCS_DIMENSIONLESS_UH);
    ords.push(q);
  }
  ords.push(0);
  const oneInchCuFt = (1 / 12) * areaAcres * CUFT_PER_ACRE_FT;
  const vol = ords.reduce((a, q) => a + q, 0) * dtHours * 3600;
  const scale = vol > 0 ? oneInchCuFt / vol : 0;
  return { ordinates: ords.map((q) => q * scale), lag, tp, tb, qp };
}

/** Incremental SCS rainfall excess per interval from interval rainfall depths (inches). */
export function incrementalExcess(intervalDepths: number[], CN: number, iaRatio = 0.2): number[] {
  let cumP = 0, prevQ = 0;
  return intervalDepths.map((d) => {
    cumP += Math.max(0, d);
    const Q = scsRunoff(cumP, CN, iaRatio);
    const inc = Q - prevQ;
    prevQ = Q;
    return Math.max(0, inc);
  });
}

/** Discrete convolution Q_n = Σ_k ΔQ_k · U_{n−k}. */
export function convolve(excess: number[], uh: number[]): number[] {
  const out = new Array(excess.length + uh.length - 1).fill(0);
  excess.forEach((e, k) => { if (e) uh.forEach((u, j) => { out[k + j] += e * u; }); });
  return out;
}

/* ------------------------------------------------------------------ */
/* LID accounting                                                      */
/* ------------------------------------------------------------------ */

export interface LidUnit {
  id: string;
  /** Site area draining directly to this BMP (ft²). */
  tributaryArea: number;
  /** Storage capacity (ft³). */
  capacity: number;
  /** id of a BMP later in the list that receives this BMP's overflow, or null when it leaves the site. */
  overflowTo: string | null;
}

export interface LidUnitResult { id: string; directInflow: number; upstreamInflow: number; inflow: number; captured: number; overflow: number; effectiveTributaryArea: number }

export interface LidAccounting {
  units: LidUnitResult[];
  siteRunoff: number;
  totalCaptured: number;
  netRunoff: number;
  /** Factor applied to tributary areas when they add up to more than the site (1 = no overlap). */
  areaScale: number;
  overAllocated: boolean;
}

/**
 * Route site runoff through BMPs in list order. Direct tributary areas are capped at the site
 * area (scaled down proportionally if they overlap), each BMP captures at most its inflow, and
 * overflow can be passed to a downstream BMP. Capture can therefore never exceed site runoff.
 */
export function accountLid(units: LidUnit[], siteArea: number, runoffDepthIn: number): LidAccounting {
  const depthFt = Math.max(0, runoffDepthIn) / 12;
  const site = Math.max(0, siteArea);
  const siteRunoff = depthFt * site;
  const sumAreas = units.reduce((a, u) => a + Math.max(0, u.tributaryArea), 0);
  const areaScale = sumAreas > site && sumAreas > 0 ? site / sumAreas : 1;
  const upstream = new Map<string, number>();
  const index = new Map(units.map((u, i) => [u.id, i]));
  const results: LidUnitResult[] = units.map((u, i) => {
    const effectiveTributaryArea = Math.max(0, u.tributaryArea) * areaScale;
    const directInflow = effectiveTributaryArea * depthFt;
    const upstreamInflow = upstream.get(u.id) ?? 0;
    const inflow = directInflow + upstreamInflow;
    const captured = Math.min(inflow, Math.max(0, u.capacity));
    const overflow = inflow - captured;
    const target = u.overflowTo ? index.get(u.overflowTo) : undefined;
    if (u.overflowTo && target !== undefined && target > i) {
      upstream.set(u.overflowTo, (upstream.get(u.overflowTo) ?? 0) + overflow);
    }
    return { id: u.id, directInflow, upstreamInflow, inflow, captured, overflow, effectiveTributaryArea };
  });
  const totalCaptured = results.reduce((a, r) => a + r.captured, 0);
  return {
    units: results,
    siteRunoff,
    totalCaptured,
    netRunoff: Math.max(0, siteRunoff - totalCaptured),
    areaScale,
    overAllocated: areaScale < 1,
  };
}
