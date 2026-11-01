import { describe, it, expect } from 'vitest';
import { buildIcmEventCsv } from '../icmCsvExport';

describe('InfoWorks ICM event CSV', () => {
  const csv = buildIcmEventCsv({ title: 'SCS II, 50mm', description: '6 h', intensities: [10, 20, 30, 40], timeStepMin: 15, units: 'mm/hr' });
  const lines = csv.trim().split('\r\n');

  it('declares the rainfall event header, units and timestep', () => {
    expect(lines[0]).toBe('!Version=2,type=RED,charset=UTF8');
    expect(lines).toContain('UserSettingsValues,mm/hr,dd-mm-yyyy hh:mm');
    expect(lines).toContain('01/01/2025 00:00,15m,1');
  });

  it('writes unique increasing timestamps and closes with a zero at the end time', () => {
    const rows = lines.slice(lines.indexOf('P_DATETIME,1') + 1);
    expect(rows.map(r => r.split(',')[0])).toEqual([
      '01/01/2025 00:00', '01/01/2025 00:15', '01/01/2025 00:30', '01/01/2025 00:45', '01/01/2025 01:00',
    ]);
    expect(rows[rows.length - 1].split(',')[1]).toBe('0.0000');
  });

  it('commas in the title cannot break columns', () => {
    expect(lines[2]).toBe('0,SCS II  50mm');
  });
});
