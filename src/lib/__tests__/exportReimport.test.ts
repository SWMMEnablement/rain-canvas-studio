import { describe, it, expect } from 'vitest';
import { generateRainfallData, prepareExportData, type PatternType } from '@/lib/rainfallPatterns';
import { parseRainfallFile } from '@/lib/rainfallParsers';
import {
  buildCsvExport, buildSwmmDatExport, buildSwmmScriptExport,
  buildHecGageRows, buildSwmmTimeSeriesRows, buildXpSwmmExport,
} from '@/lib/stormFileExports';
import { generateHecHmsGage, generateHecDssImportCSV } from '@/lib/hecHmsExport';
import { convertDepth } from '@/lib/unitConversions';
import type { UnitSystem } from '@/lib/unitConversions';

// Every file the app exports must load back with the same depth, time step and number of intervals.
const CASES: Array<{ pattern: PatternType; depth: number; duration: number; step: number; units: UnitSystem }> = [
  { pattern: 'scs2', depth: 3, duration: 24, step: 15, units: 'USA' },
  { pattern: 'chicago', depth: 2, duration: 6, step: 5, units: 'SI' },
  { pattern: 'huff2', depth: 1.5, duration: 2, step: 1, units: 'USA' },
  { pattern: 'feh', depth: 4, duration: 48, step: 60, units: 'SI' },
];

type Built = { file: string; content: string; relTol: number };

function exportsFor(c: (typeof CASES)[number]): Built[] {
  const intensities = generateRainfallData(c.pattern, c.depth, c.duration, c.step);
  const hourPoints = prepareExportData(intensities, c.step);
  const meta = { pattern: c.pattern, patternId: c.pattern, totalDepth: c.depth, duration: c.duration, timeStep: c.step, unitSystem: c.units };
  const series = { name: `TS_${c.pattern}`, patternDisplayName: c.pattern, patternId: c.pattern, totalDepth: c.depth, duration: c.duration, timeStep: c.step, unitSystem: c.units };
  const hec = {
    gageName: 'G1', startDate: '01Jan2025', startTime: '00:00', patternName: c.pattern,
    totalDepth: c.depth, durationHours: c.duration, timestepMinutes: c.step, unitSystem: c.units, data: hourPoints,
  };
  // SI values are written with 2 decimals; tiny per-interval rounding is allowed.
  const tol = c.units === 'SI' ? 0.01 : 0.002;
  return [
    { file: 'rainfall_pattern.csv', content: buildCsvExport(hourPoints, meta), relTol: tol },
    { file: 'swmm_rainfall_pattern.txt', content: buildSwmmScriptExport(hourPoints, meta), relTol: tol },
    { file: 'swmm_rainfall.dat', content: buildSwmmDatExport(hourPoints, meta), relTol: tol },
    { file: 'ts_xpswmm.inp', content: buildXpSwmmExport(intensities, series), relTol: tol },
    { file: 'timeseries.txt', content: buildSwmmTimeSeriesRows(intensities, series), relTol: tol },
    { file: 'G1.gage', content: buildHecGageRows(intensities, { ...series, name: 'G1' }), relTol: tol },
    { file: 'G1_hms.gage', content: generateHecHmsGage(hec), relTol: tol },
    { file: 'G1_dss_import.csv', content: generateHecDssImportCSV(hec), relTol: tol },
  ];
}

describe('exported storm files load back without errors', () => {
  for (const c of CASES) {
    const expectedDepth = convertDepth(c.depth, 'USA', c.units);
    const intervals = Math.round((c.duration * 60) / c.step);
    for (const b of exportsFor(c)) {
      it(`${b.file}: ${c.pattern} ${c.depth} in / ${c.duration} h / ${c.step} min (${c.units})`, () => {
        const r = parseRainfallFile(b.content, b.file);
        expect(r.errors).toEqual([]);
        expect(r.metadata.units).toBe(c.units === 'SI' ? 'mm' : 'inches');
        expect(r.metadata.timeStep).toBe(c.step);
        expect(r.data.length).toBe(intervals);
        expect(r.data[0].time).toBe(0);
        expect(r.data[r.data.length - 1].time).toBe((intervals - 1) * c.step);
        expect(Math.abs((r.metadata.totalDepth ?? 0) - expectedDepth) / expectedDepth).toBeLessThan(b.relTol);
      });
    }
  }
});

describe('importer edge cases', () => {
  it('a SWMM model file with several rain series loads the gauged one and says so', () => {
    const a = buildXpSwmmExport([1, 2, 1], { name: 'TS_A', patternDisplayName: 'A', totalDepth: 1, duration: 0.75, timeStep: 15, unitSystem: 'USA' });
    const b = buildSwmmTimeSeriesRows([4, 4, 4], { name: 'TS_B', patternDisplayName: 'B', totalDepth: 3, duration: 0.75, timeStep: 15, unitSystem: 'USA' });
    const r = parseRainfallFile(`${a}\n\n[TIMESERIES]\n${b}`, 'model.inp');
    expect(r.errors).toEqual([]);
    expect(r.metadata.station).toBe('TS_A');
    expect(r.warnings.some((w) => w.includes('2 rain series'))).toBe(true);
    expect(r.metadata.totalDepth).toBeCloseTo(1, 3);
  });

  it('SWMM rows that pass midnight keep counting forward', () => {
    const rows = ['TS 01/01/2024 23:45 0.1', 'TS 01/02/2024 00:00 0.2', 'TS 01/03/2024 00:00 0.3'].join('\n');
    const r = parseRainfallFile(`[RAINGAGES]\nRG1 VOLUME 0:15 1.0 TIMESERIES TS\n[TIMESERIES]\n${rows}`, 'x.inp');
    expect(r.errors).toEqual([]);
    // 23:45 day 1 → 00:00 day 3 is 24 h 15 min; dry intervals between are filled with zeros
    expect(r.data[r.data.length - 1].time).toBe(1455);
    expect(r.metadata.totalDepth).toBeCloseTo(0.6, 6);
  });

  it('CSV with ISO timestamps and incremental depth in mm', () => {
    const csv = '# rain\ntimestamp,depth (mm)\n2025-01-01T00:00:00,1\n2025-01-01T00:10:00,2\n2025-01-01T00:20:00,1\n';
    const r = parseRainfallFile(csv, 'gauge.csv');
    expect(r.errors).toEqual([]);
    expect(r.metadata.units).toBe('mm');
    expect(r.metadata.timeStep).toBe(10);
    expect(r.data.map((d) => d.intensity)).toEqual([6, 12, 6]);
    expect(r.metadata.totalDepth).toBeCloseTo(4, 6);
  });

  it('the Real Data Hub edited-storm CSV loads back in its own units', () => {
    const csv = '# Rain Canvas Studio – edited storm "x"\n# Units: MM\ntime (min),intensity (mm/hr),cumulative depth (mm)\n0,12.0000,3.0000\n15,24.0000,9.0000\n30,0.0000,9.0000\n';
    const r = parseRainfallFile(csv, 'x.csv');
    expect(r.errors).toEqual([]);
    expect(r.metadata.units).toBe('mm');
    expect(r.metadata.timeStep).toBe(15);
    expect(r.metadata.totalDepth).toBeCloseTo(9, 6);
  });
});
