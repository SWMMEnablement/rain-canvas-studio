import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";

export interface ExplorerValues {
  /** Cumulative fraction of the total depth at time t (0–1). */
  F: number;
  /** Rainfall intensity of the interval containing t (depth units per hour). */
  i: number;
  /** Cumulative depth at time t (same units as P). */
  cumulativeDepth: number;
  /** Number of intervals and interval length (minutes) used. */
  intervals: number;
  stepMin: number;
}

/**
 * Values for the equation explorer, read from the same storm calculator the wizard and API use,
 * so the explorer can never disagree with the generated hyetograph.
 * Within an interval, rainfall is uniform (block hyetograph), so the cumulative depth is linear there.
 */
export function explorerValues(
  pattern: PatternType,
  t: number,
  P: number,
  D: number,
  timeStepMin = 15
): ExplorerValues | null {
  if (!(P > 0) || !(D > 0) || !Number.isFinite(t)) return null;
  const totalMin = D * 60;
  const requested = timeStepMin > 0 && Number.isFinite(timeStepMin) ? timeStepMin : 15;
  const n = Math.max(1, Math.round(totalMin / requested));
  const stepMin = totalMin / n;
  const series = generateRainfallData(pattern, P, D, stepMin);
  if (!series.length || !series.every((v) => Number.isFinite(v))) return null;
  const dtHr = stepMin / 60;
  const tc = Math.min(1, Math.max(0, t));
  const pos = tc * series.length;
  const k = Math.min(series.length - 1, Math.floor(pos));
  let cum = 0;
  for (let j = 0; j < k; j++) cum += series[j] * dtHr;
  cum += series[k] * dtHr * (pos - k);
  return { F: cum / P, i: series[k], cumulativeDepth: cum, intervals: series.length, stepMin };
}
