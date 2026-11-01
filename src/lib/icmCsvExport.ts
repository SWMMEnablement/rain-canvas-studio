/**
 * Native InfoWorks ICM rainfall event CSV (type=RED), per Autodesk "Events - CSV File Formats".
 * Fixed timestep via G_TS + G_START; units declared explicitly in UserSettings so ICM does not
 * fall back to display units. Values are mean intensity over each interval starting at P_DATETIME;
 * a trailing zero row closes the event at its end time.
 */
export interface IcmCsvOptions {
  title: string;
  description: string;
  /** Intensities in the export unit per hour (mm/hr or in/hr). */
  intensities: number[];
  timeStepMin: number;
  units: 'mm/hr' | 'in/hr';
  start?: Date; // defaults to 01/01/2025 00:00
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const clean = (s: string) => s.replace(/[",\r\n]/g, ' ').trim();

export function buildIcmEventCsv(o: IcmCsvOptions): string {
  const start = o.start ? new Date(o.start) : new Date(2025, 0, 1, 0, 0, 0);
  const lines: string[] = [
    '!Version=2,type=RED,charset=UTF8',
    'FILECONT,TITLE',
    `0,${clean(o.title)}`,
    'UserSettings,U_VALUES,U_DATETIME',
    `UserSettingsValues,${o.units},dd-mm-yyyy hh:mm`,
    'G_START,G_TS,G_NPROFILES',
    `${fmt(start)},${o.timeStepMin}m,1`,
    'L_PTITLE,L_PDESC',
    `${clean(o.title).slice(0, 30)},${clean(o.description)}`,
    'P_DATETIME,1',
  ];
  const dec = o.units === 'mm/hr' ? 4 : 6;
  const t = new Date(start);
  for (const v of [...o.intensities, 0]) {
    lines.push(`${fmt(t)},${(Number.isFinite(v) && v > 0 ? v : 0).toFixed(dec)}`);
    t.setMinutes(t.getMinutes() + o.timeStepMin);
  }
  return lines.join('\r\n') + '\r\n';
}
