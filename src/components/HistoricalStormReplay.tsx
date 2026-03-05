import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Download, Play, Info, MapPin, Calendar, Droplets, Clock, FileDown } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// ── Curated historical storm data ──────────────────────────────────

interface HistoricalStorm {
  id: string;
  name: string;
  category: string;
  location: string;
  date: string;
  totalDepthMm: number;
  durationHr: number;
  peakIntensityMmHr: number;
  description: string;
  significance: string;
  /** Cumulative fraction of total depth at each fractional time step */
  cumulativeFractions: number[];
  timeStepMin: number;
  color: string;
}

const HISTORICAL_STORMS: HistoricalStorm[] = [
  {
    id: "harvey_2017",
    name: "Hurricane Harvey",
    category: "Tropical Cyclone",
    location: "Houston, TX, USA",
    date: "August 25–30, 2017",
    totalDepthMm: 1043,
    durationHr: 96,
    peakIntensityMmHr: 76,
    description:
      "Category 4 hurricane stalled over southeast Texas producing record rainfall. Cedar Bayou gauge recorded 1,318 mm (51.88 in) over 5 days — the highest tropical cyclone rainfall in US history.",
    significance:
      "Drove adoption of Atlas-14 updates for Harris County. The event exceeded the 1,000-year design storm for most of the Houston metro area.",
    // 96-hr profile simplified to 30-min steps (192 steps) — using characteristic double-peak pattern
    cumulativeFractions: generateHarveyCurve(),
    timeStepMin: 30,
    color: "hsl(0, 80%, 50%)",
  },
  {
    id: "hagibis_2019",
    name: "Typhoon Hagibis",
    category: "Typhoon",
    location: "Hakone, Kanagawa, Japan",
    date: "October 12, 2019",
    totalDepthMm: 922.5,
    durationHr: 24,
    peakIntensityMmHr: 113,
    description:
      "Super Typhoon Hagibis made landfall on Honshu bringing record 24-hr rainfall to multiple prefectures. Hakone recorded 922.5 mm in 24 hours — the highest daily total ever observed in Japan.",
    significance:
      "Triggered levee breaches on 140 rivers, prompted revision of Japanese flood design standards. Demonstrated compound flood risk from simultaneous rainfall and storm surge.",
    cumulativeFractions: generateHagibisCurve(),
    timeStepMin: 15,
    color: "hsl(220, 80%, 50%)",
  },
  {
    id: "boxing_day_2015",
    name: "Storm Desmond / Boxing Day",
    category: "Extratropical Cyclone",
    location: "Cumbria & Yorkshire, UK",
    date: "December 5 & 26, 2015",
    totalDepthMm: 341.4,
    durationHr: 24,
    peakIntensityMmHr: 35,
    description:
      "Storm Desmond (Dec 5) set the UK 24-hr rainfall record at 341.4 mm in Honister Pass, Cumbria. Three weeks later, Boxing Day flooding devastated Yorkshire and Lancashire with 100+ mm in 24 hours.",
    significance:
      "Led to the UK's £2.3 billion flood defence programme. Demonstrated that AR6-projected rainfall intensification was already observable in UK winter storms.",
    cumulativeFractions: generateBoxingDayCurve(),
    timeStepMin: 15,
    color: "hsl(160, 70%, 40%)",
  },
  {
    id: "dubai_2024",
    name: "UAE Deluge",
    category: "Mesoscale Convective System",
    location: "Dubai, UAE",
    date: "April 16, 2024",
    totalDepthMm: 254,
    durationHr: 12,
    peakIntensityMmHr: 68,
    description:
      "An exceptional mesoscale convective system dropped nearly two years' worth of average rainfall on Dubai in under 12 hours. Al Ain recorded 254 mm — the highest daily total in UAE history since records began in 1949.",
    significance:
      "Exposed critical drainage infrastructure gaps in arid-region urban planning. Triggered re-evaluation of IDF curves for Gulf Cooperation Council (GCC) nations.",
    cumulativeFractions: generateDubaiCurve(),
    timeStepMin: 15,
    color: "hsl(35, 90%, 50%)",
  },
  {
    id: "zhengzhou_2021",
    name: "Zhengzhou Rainstorm",
    category: "Mesoscale Convective System",
    location: "Zhengzhou, Henan, China",
    date: "July 20, 2021",
    totalDepthMm: 624.1,
    durationHr: 24,
    peakIntensityMmHr: 201.9,
    description:
      "Zhengzhou received 201.9 mm in a single hour (17:00–18:00 local), shattering China's hourly rainfall record. The 24-hr total of 624.1 mm was roughly equal to the city's average annual rainfall.",
    significance:
      "Caused deadly subway flooding, prompting nationwide review of urban flood resilience under GB 50014. The 1-hr intensity exceeded the 5,000-year design value.",
    cumulativeFractions: generateZhengzhouCurve(),
    timeStepMin: 15,
    color: "hsl(0, 70%, 45%)",
  },
];

// ── Characteristic cumulative curves ───────────────────────────────

function generateHarveyCurve(): number[] {
  // 96-hr storm at 30-min steps = 192 steps
  // Harvey: slow ramp, two major bursts around 30% and 65% of duration
  const n = 192;
  const fracs: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Double-peaked sigmoid
    const base = 0.3 * sigmoid(t, 0.15, 15) + 0.4 * sigmoid(t, 0.55, 12) + 0.3 * sigmoid(t, 0.85, 10);
    fracs.push(Math.min(1, base));
  }
  // Normalize
  const max = fracs[fracs.length - 1];
  return fracs.map(f => f / max);
}

function generateHagibisCurve(): number[] {
  // 24-hr at 15-min = 96 steps, front-loaded with peak around 40%
  const n = 96;
  const fracs: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const base = 0.6 * sigmoid(t, 0.35, 18) + 0.4 * sigmoid(t, 0.7, 12);
    fracs.push(Math.min(1, base));
  }
  const max = fracs[fracs.length - 1];
  return fracs.map(f => f / max);
}

function generateBoxingDayCurve(): number[] {
  // 24-hr at 15-min = 96 steps, steady orographic rainfall with moderate peak around 50%
  const n = 96;
  const fracs: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // More uniform distribution characteristic of frontal/orographic rain
    const base = 0.15 * t + 0.85 * sigmoid(t, 0.5, 8);
    fracs.push(Math.min(1, base));
  }
  const max = fracs[fracs.length - 1];
  return fracs.map(f => f / max);
}

function generateDubaiCurve(): number[] {
  // 12-hr at 15-min = 48 steps, very sharp convective burst around 45%
  const n = 48;
  const fracs: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const base = 0.2 * sigmoid(t, 0.25, 20) + 0.7 * sigmoid(t, 0.45, 25) + 0.1 * sigmoid(t, 0.8, 12);
    fracs.push(Math.min(1, base));
  }
  const max = fracs[fracs.length - 1];
  return fracs.map(f => f / max);
}

function generateZhengzhouCurve(): number[] {
  // 24-hr at 15-min = 96 steps, extreme burst around 70% of duration (hour 17)
  const n = 96;
  const fracs: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // Slow buildup then extreme spike
    const base = 0.15 * sigmoid(t, 0.3, 10) + 0.7 * sigmoid(t, 0.7, 30) + 0.15 * sigmoid(t, 0.9, 12);
    fracs.push(Math.min(1, base));
  }
  const max = fracs[fracs.length - 1];
  return fracs.map(f => f / max);
}

function sigmoid(t: number, center: number, steepness: number): number {
  return 1 / (1 + Math.exp(-steepness * (t - center)));
}

// ── Timeseries generation ──────────────────────────────────────────

interface TimeseriesPoint {
  time: number;       // minutes
  intensity: number;  // mm/hr
  cumulative: number; // mm
  fraction: number;   // 0–1
}

function generateTimeseries(storm: HistoricalStorm): TimeseriesPoint[] {
  const fracs = storm.cumulativeFractions;
  const dt = storm.timeStepMin;
  const points: TimeseriesPoint[] = [];

  for (let i = 0; i < fracs.length; i++) {
    const time = i * dt;
    const cumDepth = fracs[i] * storm.totalDepthMm;
    const prevCum = i > 0 ? fracs[i - 1] * storm.totalDepthMm : 0;
    const incrementalMm = cumDepth - prevCum;
    const intensity = (incrementalMm / dt) * 60; // mm/hr

    points.push({
      time,
      intensity: Math.max(0, intensity),
      cumulative: cumDepth,
      fraction: fracs[i],
    });
  }
  return points;
}

// ── SWMM Export ────────────────────────────────────────────────────

function exportToSwmm(storm: HistoricalStorm, timeseries: TimeseriesPoint[]): string {
  const lines: string[] = [];
  const stationId = storm.id.toUpperCase().replace(/_/g, "");
  const safeName = storm.name.replace(/[^a-zA-Z0-9 ]/g, "");

  lines.push("[TITLE]");
  lines.push(`;;Historical Storm Replay: ${storm.name}`);
  lines.push(`;;Location: ${storm.location}`);
  lines.push(`;;Date: ${storm.date}`);
  lines.push(`;;Total Depth: ${storm.totalDepthMm.toFixed(1)} mm`);
  lines.push(`;;Peak Intensity: ${storm.peakIntensityMmHr.toFixed(1)} mm/hr`);
  lines.push(`;;Generated by RainCanvas Studio`);
  lines.push("");

  lines.push("[OPTIONS]");
  lines.push("FLOW_UNITS           LPS");
  lines.push("INFILTRATION         HORTON");
  lines.push(`START_DATE           01/01/2000`);
  lines.push(`START_TIME           00:00:00`);
  lines.push(`END_DATE             01/${String(Math.ceil(storm.durationHr / 24) + 1).padStart(2, "0")}/2000`);
  lines.push(`END_TIME             00:00:00`);
  lines.push(`REPORT_START_DATE    01/01/2000`);
  lines.push(`REPORT_START_TIME    00:00:00`);
  lines.push(`REPORT_STEP          00:${String(storm.timeStepMin).padStart(2, "0")}:00`);
  lines.push("");

  lines.push("[RAINGAGES]");
  lines.push(";;Name           Format    Interval  SCF      Source");
  lines.push(";;-------------- --------- --------- -------- ----------");
  lines.push(
    `${stationId.padEnd(17)}INTENSITY ${String(storm.timeStepMin).padStart(2, "0")}:00      1.0      TIMESERIES ${safeName}`
  );
  lines.push("");

  lines.push("[TIMESERIES]");
  lines.push(`;;Name           Date       Time       Value`);
  lines.push(";;-------------- ---------- ---------- ----------");

  for (const pt of timeseries) {
    if (pt.intensity <= 0 && pt.time > 0 && pt.time < storm.durationHr * 60) continue;
    const hrs = Math.floor(pt.time / 60);
    const mins = pt.time % 60;
    const timeStr = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    // Determine date
    const day = Math.floor(pt.time / 1440) + 1;
    const dateStr = `01/${String(day).padStart(2, "0")}/2000`;
    lines.push(
      `${safeName.padEnd(17)}${dateStr.padEnd(11)}${timeStr.padEnd(11)}${pt.intensity.toFixed(2)}`
    );
  }
  lines.push("");

  return lines.join("\n");
}

function exportToCsv(storm: HistoricalStorm, timeseries: TimeseriesPoint[]): string {
  const header = "time_min,intensity_mm_hr,cumulative_mm,fraction";
  const rows = timeseries.map(
    (pt) => `${pt.time},${pt.intensity.toFixed(4)},${pt.cumulative.toFixed(2)},${pt.fraction.toFixed(6)}`
  );
  return [header, ...rows].join("\n");
}

// ── Component ──────────────────────────────────────────────────────

export function HistoricalStormReplay() {
  const [selectedStorm, setSelectedStorm] = useState<HistoricalStorm>(HISTORICAL_STORMS[0]);
  const [showDetails, setShowDetails] = useState(false);

  const timeseries = useMemo(() => generateTimeseries(selectedStorm), [selectedStorm]);

  const chartData = useMemo(() => {
    return timeseries.map((pt) => ({
      time: pt.time,
      timeLabel: pt.time >= 60 ? `${(pt.time / 60).toFixed(1)}h` : `${pt.time}m`,
      intensity: pt.intensity,
      cumulative: pt.cumulative,
    }));
  }, [timeseries]);

  const handleDownloadSwmm = () => {
    const content = exportToSwmm(selectedStorm, timeseries);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStorm.id}_replay.inp`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedStorm.name} to SWMM5 .inp`);
  };

  const handleDownloadCsv = () => {
    const content = exportToCsv(selectedStorm, timeseries);
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStorm.id}_replay.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedStorm.name} to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Storm Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {HISTORICAL_STORMS.map((storm) => (
          <Card
            key={storm.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedStorm.id === storm.id
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-primary/40"
            }`}
            onClick={() => setSelectedStorm(storm)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <CloudRain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {storm.category.split(" ")[0]}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm leading-tight">{storm.name}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{storm.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  <span>{storm.totalDepthMm} mm / {storm.durationHr} hr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Storm Detail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                {selectedStorm.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {selectedStorm.location} — {selectedStorm.date}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                <Info className="w-4 h-4 mr-1" />
                {showDetails ? "Hide" : "Show"} Details
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button size="sm" onClick={handleDownloadSwmm}>
                <FileDown className="w-4 h-4 mr-1" />
                SWMM5 .inp
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedStorm.totalDepthMm}</p>
              <p className="text-xs text-muted-foreground">Total Depth (mm)</p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedStorm.peakIntensityMmHr}</p>
              <p className="text-xs text-muted-foreground">Peak Intensity (mm/hr)</p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedStorm.durationHr}</p>
              <p className="text-xs text-muted-foreground">Duration (hr)</p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedStorm.timeStepMin}</p>
              <p className="text-xs text-muted-foreground">Time Step (min)</p>
            </div>
          </div>

          {showDetails && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <p>{selectedStorm.description}</p>
              <p className="text-muted-foreground italic">{selectedStorm.significance}</p>
            </div>
          )}

          {/* Hyetograph */}
          <Tabs defaultValue="hyetograph" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hyetograph">Intensity Hyetograph</TabsTrigger>
              <TabsTrigger value="cumulative">Cumulative Depth</TabsTrigger>
            </TabsList>
            <TabsContent value="hyetograph">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -15 }} tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: "Intensity (mm/hr)", angle: -90, position: "insideLeft", offset: 5 }} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(2)} mm/hr`, "Intensity"]} labelFormatter={(l) => `t = ${l} min`} />
                    <Bar dataKey="intensity" fill={selectedStorm.color} opacity={0.8} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="cumulative">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -15 }} tick={{ fontSize: 11 }} />
                    <YAxis label={{ value: "Cumulative Depth (mm)", angle: -90, position: "insideLeft", offset: 5 }} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(1)} mm`, "Cumulative"]} labelFormatter={(l) => `t = ${l} min`} />
                    <Line type="monotone" dataKey="cumulative" stroke={selectedStorm.color} strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          {/* Data Table Preview */}
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              View first 20 timeseries rows ({timeseries.length} total)
            </summary>
            <div className="mt-2 max-h-60 overflow-auto border rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Time (min)</th>
                    <th className="p-2 text-right">Intensity (mm/hr)</th>
                    <th className="p-2 text-right">Cumulative (mm)</th>
                    <th className="p-2 text-right">Fraction</th>
                  </tr>
                </thead>
                <tbody>
                  {timeseries.slice(0, 20).map((pt, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="p-2">{pt.time}</td>
                      <td className="p-2 text-right">{pt.intensity.toFixed(2)}</td>
                      <td className="p-2 text-right">{pt.cumulative.toFixed(2)}</td>
                      <td className="p-2 text-right">{(pt.fraction * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
