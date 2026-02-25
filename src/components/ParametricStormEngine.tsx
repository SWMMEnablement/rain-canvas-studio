import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from "recharts";
import { Download, Copy, Beaker, Zap, TrendingUp, Droplets } from "lucide-react";

// ─── Core Engine Types ───

type EngineMethod = "scs" | "chicago" | "huff";

interface EngineParams {
  method: EngineMethod;
  // SCS params
  peakPosition: number;   // 0–1 (e.g. 0.5 for Type II)
  slope: number;          // sigmoid steepness (10–60)
  // Chicago params
  r: number;              // peak ratio (0.1–0.9)
  n: number;              // decay exponent (0.3–0.9)
  // Huff params
  quartile: number;       // 1–4
  // Common
  totalDepth: number;     // inches
  duration: number;       // hours
  timeStep: number;       // minutes
}

// ─── Presets ───

interface Preset {
  label: string;
  method: EngineMethod;
  params: Partial<EngineParams>;
  region: string;
  icon: string;
}

const PRESETS: Record<string, Preset> = {
  scs_type2: { label: "SCS Type II", method: "scs", params: { peakPosition: 0.5, slope: 25 }, region: "USA", icon: "🇺🇸" },
  scs_type1: { label: "SCS Type I", method: "scs", params: { peakPosition: 0.4, slope: 20 }, region: "USA Pacific", icon: "🇺🇸" },
  scs_type3: { label: "NRCS Type III", method: "scs", params: { peakPosition: 0.55, slope: 22 }, region: "US Gulf/Atlantic", icon: "🇺🇸" },
  aes_30: { label: "AES Canada 30%", method: "scs", params: { peakPosition: 0.3, slope: 30 }, region: "Ontario", icon: "🍁" },
  feh_summer: { label: "UK FEH Summer", method: "scs", params: { peakPosition: 0.5, slope: 40 }, region: "UK/Ireland", icon: "🇬🇧" },
  chicago_front: { label: "Chicago (Front)", method: "chicago", params: { r: 0.35, n: 0.7 }, region: "General", icon: "🌧️" },
  chicago_center: { label: "Chicago (Center)", method: "chicago", params: { r: 0.5, n: 0.7 }, region: "General", icon: "🌧️" },
  vietnam_north: { label: "Vietnam (North)", method: "chicago", params: { r: 0.35, n: 0.7 }, region: "Hanoi", icon: "🇻🇳" },
  dubai_flash: { label: "Dubai Flash", method: "chicago", params: { r: 0.5, n: 0.85 }, region: "Middle East", icon: "🇦🇪" },
  huff_q1: { label: "Huff 1st Quartile", method: "huff", params: { quartile: 1 }, region: "General", icon: "📊" },
  huff_q2: { label: "Huff 2nd Quartile", method: "huff", params: { quartile: 2 }, region: "General", icon: "📊" },
  huff_q3: { label: "Huff 3rd Quartile", method: "huff", params: { quartile: 3 }, region: "General", icon: "📊" },
  huff_q4: { label: "Huff 4th Quartile", method: "huff", params: { quartile: 4 }, region: "General", icon: "📊" },
};

// ─── The Core Engine ───

function generateDesignStorm(params: EngineParams) {
  const steps = 100;
  const cumulative: { t_dim: number; p_dim: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const t_dim = i / steps;
    let p_dim = 0;

    if (params.method === "scs") {
      // Sigmoid approximation for SCS-type curves
      p_dim = 1 / (1 + Math.exp(-params.slope * (t_dim - params.peakPosition)));
      // Normalize so p_dim(0)=0 and p_dim(1)=1
    } else if (params.method === "chicago") {
      // Chicago method — intensity curve, then integrate
      // We compute cumulative directly via the integral form
      const r = params.r;
      const n_exp = params.n;
      const t_peak = r;
      if (t_dim <= t_peak && t_peak > 0) {
        // Before peak: integral of power-law intensity
        const fraction = t_dim / t_peak;
        p_dim = Math.pow(fraction, 2 - n_exp) * 0.5;
      } else if (t_peak < 1) {
        const prePeak = 0.5;
        const fraction = (t_dim - t_peak) / (1 - t_peak);
        p_dim = prePeak + (1 - prePeak) * Math.pow(fraction, 2 - n_exp);
      }
    } else if (params.method === "huff") {
      // Huff quartile curves — polynomial approximation
      const q = params.quartile;
      p_dim = Math.pow(t_dim, 1 / q) * (2 - Math.pow(t_dim, 1 / q));
    }

    cumulative.push({ t_dim, p_dim });
  }

  // Normalize SCS sigmoid to [0, 1]
  if (params.method === "scs") {
    const pMin = cumulative[0].p_dim;
    const pMax = cumulative[cumulative.length - 1].p_dim;
    const range = pMax - pMin || 1;
    cumulative.forEach(pt => {
      pt.p_dim = (pt.p_dim - pMin) / range;
    });
  }

  // Clamp
  cumulative.forEach(pt => {
    pt.p_dim = Math.max(0, Math.min(1, pt.p_dim));
  });

  return cumulative;
}

function cumulativeToIntensity(
  cumulative: { t_dim: number; p_dim: number }[],
  totalDepth: number,
  duration: number,
  timeStep: number
) {
  const numSteps = Math.round((duration * 60) / timeStep);
  const result: { time: number; intensity: number; cumDepth: number }[] = [];

  for (let i = 0; i < numSteps; i++) {
    const t1 = i / numSteps;
    const t2 = (i + 1) / numSteps;

    // Interpolate cumulative at t1 and t2
    const interp = (tFrac: number) => {
      const idx = tFrac * (cumulative.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, cumulative.length - 1);
      const frac = idx - lo;
      return cumulative[lo].p_dim + frac * (cumulative[hi].p_dim - cumulative[lo].p_dim);
    };

    const p1 = interp(t1);
    const p2 = interp(t2);
    const incDepth = (p2 - p1) * totalDepth;
    const intensityInPerHr = incDepth / (timeStep / 60);

    result.push({
      time: ((i + 0.5) * timeStep) / 60, // center of interval in hours
      intensity: Math.max(0, intensityInPerHr),
      cumDepth: p2 * totalDepth,
    });
  }

  return result;
}

// ─── Component ───

export function ParametricStormEngine() {
  const [params, setParams] = useState<EngineParams>({
    method: "scs",
    peakPosition: 0.5,
    slope: 25,
    r: 0.35,
    n: 0.7,
    quartile: 1,
    totalDepth: 2.0,
    duration: 6.0,
    timeStep: 15,
  });

  const [viewMode, setViewMode] = useState<"intensity" | "cumulative">("intensity");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPreset, setOverlayPreset] = useState<string>("scs_type2");

  const updateParam = useCallback(<K extends keyof EngineParams>(key: K, value: EngineParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setParams(prev => ({
      ...prev,
      method: preset.method,
      ...preset.params,
    }));
    toast.success(`Applied preset: ${preset.icon} ${preset.label}`);
  }, []);

  // Generate curves
  const { chartData, cumCurve, overlayCurve, peakIntensity, peakTime } = useMemo(() => {
    const cum = generateDesignStorm(params);
    const data = cumulativeToIntensity(cum, params.totalDepth, params.duration, params.timeStep);

    let overlay: typeof data | null = null;
    if (showOverlay) {
      const preset = PRESETS[overlayPreset];
      if (preset) {
        const overlayParams: EngineParams = { ...params, method: preset.method, ...preset.params };
        const overlayCum = generateDesignStorm(overlayParams);
        overlay = cumulativeToIntensity(overlayCum, params.totalDepth, params.duration, params.timeStep);
      }
    }

    // Merge for chart
    const merged = data.map((d, i) => ({
      time: d.time,
      intensity: viewMode === "intensity" ? d.intensity : undefined,
      cumDepth: viewMode === "cumulative" ? d.cumDepth : undefined,
      overlayIntensity: overlay && viewMode === "intensity" ? overlay[i]?.intensity : undefined,
      overlayCumDepth: overlay && viewMode === "cumulative" ? overlay[i]?.cumDepth : undefined,
    }));

    const peak = data.reduce((max, d) => d.intensity > max.intensity ? d : max, data[0]);

    return {
      chartData: merged,
      cumCurve: cum,
      overlayCurve: overlay,
      peakIntensity: peak?.intensity ?? 0,
      peakTime: peak?.time ?? 0,
    };
  }, [params, viewMode, showOverlay, overlayPreset]);

  // Export as CSV
  const exportCSV = useCallback(() => {
    const cum = generateDesignStorm(params);
    const data = cumulativeToIntensity(cum, params.totalDepth, params.duration, params.timeStep);
    const header = "Time (hr),Intensity (in/hr),Cumulative Depth (in)";
    const rows = data.map(d => `${d.time.toFixed(3)},${d.intensity.toFixed(4)},${d.cumDepth.toFixed(4)}`);
    const csv = [
      `# Parametric Storm Engine Export`,
      `# Method: ${params.method.toUpperCase()}, Depth: ${params.totalDepth} in, Duration: ${params.duration} hr`,
      `# Generated: ${new Date().toISOString()}`,
      header,
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parametric-storm-${params.method}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  }, [params]);

  // Copy dimensionless curve
  const copyDimensionless = useCallback(() => {
    const cum = generateDesignStorm(params);
    const text = cum
      .filter((_, i) => i % 5 === 0 || i === cum.length - 1)
      .map(pt => `(${pt.t_dim.toFixed(2)}, ${pt.p_dim.toFixed(4)})`)
      .join(", ");
    navigator.clipboard.writeText(text);
    toast.success("Dimensionless coordinates copied to clipboard");
  }, [params]);

  const methodInfo: Record<EngineMethod, { label: string; description: string; icon: React.ReactNode; color: string }> = {
    scs: {
      label: "SCS / Sigmoid",
      description: "NRCS dimensionless cumulative curve using sigmoid approximation. Controls: peak position and steepness.",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "hsl(var(--primary))",
    },
    chicago: {
      label: "Chicago Method",
      description: "Keifer-Chu intensity-based distribution. Controls: peak ratio (r) and decay exponent (n).",
      icon: <Zap className="w-4 h-4" />,
      color: "hsl(var(--destructive))",
    },
    huff: {
      label: "Huff Quartile",
      description: "Probabilistic distribution by storm quartile. Based on Illinois State Water Survey research.",
      icon: <Droplets className="w-4 h-4" />,
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Beaker className="w-5 h-5 text-primary" />
            Quick Presets
          </CardTitle>
          <CardDescription>Click a preset to instantly load its parameters into the engine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <Badge
                key={key}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5 text-xs"
                onClick={() => applyPreset(key)}
              >
                {preset.icon} {preset.label}
                <span className="ml-1 text-muted-foreground">({preset.region})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Engine Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Method Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Method</Label>
              <Select value={params.method} onValueChange={(v) => updateParam("method", v as EngineMethod)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border z-50">
                  {(Object.keys(methodInfo) as EngineMethod[]).map(m => (
                    <SelectItem key={m} value={m}>
                      <span className="flex items-center gap-2">{methodInfo[m].icon} {methodInfo[m].label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{methodInfo[params.method].description}</p>
            </div>

            {/* SCS Controls */}
            {params.method === "scs" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    Peak Position (t/D)
                    <span className="font-mono text-primary">{params.peakPosition.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[params.peakPosition]}
                    onValueChange={([v]) => updateParam("peakPosition", v)}
                    min={0.1} max={0.9} step={0.01}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Front-loaded</span>
                    <span>Rear-loaded</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    Steepness
                    <span className="font-mono text-primary">{params.slope.toFixed(0)}</span>
                  </Label>
                  <Slider
                    value={[params.slope]}
                    onValueChange={([v]) => updateParam("slope", v)}
                    min={8} max={60} step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Gradual</span>
                    <span>Aggressive peak</span>
                  </div>
                </div>
              </>
            )}

            {/* Chicago Controls */}
            {params.method === "chicago" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    Peak Ratio (r)
                    <span className="font-mono text-primary">{params.r.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[params.r]}
                    onValueChange={([v]) => updateParam("r", v)}
                    min={0.1} max={0.9} step={0.01}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Front-loaded</span>
                    <span>Rear-loaded</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex justify-between">
                    Decay (n)
                    <span className="font-mono text-primary">{params.n.toFixed(2)}</span>
                  </Label>
                  <Slider
                    value={[params.n]}
                    onValueChange={([v]) => updateParam("n", v)}
                    min={0.3} max={0.95} step={0.01}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Broad distribution</span>
                    <span>Sharp flash</span>
                  </div>
                </div>
              </>
            )}

            {/* Huff Controls */}
            {params.method === "huff" && (
              <div className="space-y-2">
                <Label className="text-sm">Quartile</Label>
                <Select value={String(params.quartile)} onValueChange={(v) => updateParam("quartile", Number(v))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border z-50">
                    <SelectItem value="1">1st Quartile (front-loaded, short storms)</SelectItem>
                    <SelectItem value="2">2nd Quartile (moderate, typical)</SelectItem>
                    <SelectItem value="3">3rd Quartile (moderate rear-loaded)</SelectItem>
                    <SelectItem value="4">4th Quartile (rear-loaded, long storms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Common Storm Params */}
            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Storm Parameters</h4>
              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  Total Depth
                  <span className="font-mono text-primary">{params.totalDepth.toFixed(1)} in</span>
                </Label>
                <Slider
                  value={[params.totalDepth]}
                  onValueChange={([v]) => updateParam("totalDepth", v)}
                  min={0.5} max={12} step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  Duration
                  <span className="font-mono text-primary">{params.duration.toFixed(1)} hr</span>
                </Label>
                <Slider
                  value={[params.duration]}
                  onValueChange={([v]) => updateParam("duration", v)}
                  min={0.5} max={72} step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex justify-between">
                  Time Step
                  <span className="font-mono text-primary">{params.timeStep} min</span>
                </Label>
                <Slider
                  value={[params.timeStep]}
                  onValueChange={([v]) => updateParam("timeStep", v)}
                  min={1} max={60} step={1}
                />
              </div>
            </div>

            {/* Overlay Toggle */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Compare Overlay</Label>
                <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
              </div>
              {showOverlay && (
                <Select value={overlayPreset} onValueChange={setOverlayPreset}>
                  <SelectTrigger className="bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border z-50">
                    {Object.entries(PRESETS).map(([key, preset]) => (
                      <SelectItem key={key} value={key}>
                        {preset.icon} {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={exportCSV} size="sm" variant="outline" className="flex-1">
                <Download className="w-3.5 h-3.5 mr-1" /> CSV
              </Button>
              <Button onClick={copyDimensionless} size="sm" variant="outline" className="flex-1">
                <Copy className="w-3.5 h-3.5 mr-1" /> Coords
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {methodInfo[params.method].icon}
                {methodInfo[params.method].label} — Live Preview
              </CardTitle>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="intensity" className="text-xs px-3 h-7">Intensity</TabsTrigger>
                  <TabsTrigger value="cumulative" className="text-xs px-3 h-7">Cumulative</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              Peak: <strong>{peakIntensity.toFixed(2)} in/hr</strong> at t = <strong>{peakTime.toFixed(2)} hr</strong>
              {" · "}Total: <strong>{params.totalDepth.toFixed(1)} in</strong> over <strong>{params.duration} hr</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === "intensity" ? (
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="time"
                      label={{ value: "Time (hours)", position: "insideBottom", offset: -15 }}
                      tickFormatter={(v: number) => v.toFixed(1)}
                    />
                    <YAxis label={{ value: "Intensity (in/hr)", angle: -90, position: "insideLeft", offset: 5 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(3)} in/hr`,
                        name === "intensity" ? "Primary" : "Overlay",
                      ]}
                      labelFormatter={(v: number) => `t = ${Number(v).toFixed(2)} hr`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="intensity"
                      stroke={methodInfo[params.method].color}
                      fill={methodInfo[params.method].color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Primary"
                      dot={false}
                    />
                    {showOverlay && (
                      <Area
                        type="monotone"
                        dataKey="overlayIntensity"
                        stroke="hsl(var(--muted-foreground))"
                        fill="hsl(var(--muted-foreground))"
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        name="Overlay"
                        dot={false}
                      />
                    )}
                    <ReferenceLine x={peakTime} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="time"
                      label={{ value: "Time (hours)", position: "insideBottom", offset: -15 }}
                      tickFormatter={(v: number) => v.toFixed(1)}
                    />
                    <YAxis label={{ value: "Cumulative Depth (in)", angle: -90, position: "insideLeft", offset: 5 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(3)} in`,
                        name === "cumDepth" ? "Primary" : "Overlay",
                      ]}
                      labelFormatter={(v: number) => `t = ${Number(v).toFixed(2)} hr`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumDepth"
                      stroke={methodInfo[params.method].color}
                      strokeWidth={2.5}
                      dot={false}
                      name="Primary"
                    />
                    {showOverlay && (
                      <Line
                        type="monotone"
                        dataKey="overlayCumDepth"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        name="Overlay"
                      />
                    )}
                    <ReferenceLine y={params.totalDepth} stroke="hsl(var(--secondary))" strokeDasharray="3 3" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Dimensionless Curve Table */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                📐 Dimensionless Coordinates (t/D, P/Ptotal)
              </summary>
              <div className="mt-2 max-h-48 overflow-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">t/D</TableHead>
                      <TableHead className="w-24">P/P<sub>total</sub></TableHead>
                      <TableHead className="w-24">ΔP/ΔD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cumCurve
                      .filter((_, i) => i % 5 === 0 || i === cumCurve.length - 1)
                      .map((pt, i, arr) => {
                        const prev = i > 0 ? arr[i - 1] : pt;
                        const dt = pt.t_dim - prev.t_dim || 0.05;
                        const dp = (pt.p_dim - prev.p_dim) / dt;
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-xs">{pt.t_dim.toFixed(2)}</TableCell>
                            <TableCell className="font-mono text-xs">{pt.p_dim.toFixed(4)}</TableCell>
                            <TableCell className="font-mono text-xs">{dp.toFixed(3)}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>

      {/* Parameter Reference Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Reference: Regional Parameters</CardTitle>
          <CardDescription>Key parameter values for common design storms worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Storm Type</TableHead>
                  <TableHead>Engine</TableHead>
                  <TableHead>Key Param</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Characteristic</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { storm: "AES Canada 30%", engine: "SCS", param: "peakPosition", value: "0.30", char: "Steep rise, long tail" },
                  { storm: "NRCS Type III", engine: "SCS", param: "peakPosition", value: "0.55", char: "Delayed peak vs Type II" },
                  { storm: "Vietnam (North)", engine: "Chicago", param: "r", value: "0.35", char: "Front-loaded monsoon" },
                  { storm: "Vietnam (South)", engine: "Chicago", param: "r", value: "0.50", char: "Center-peaked typhoon" },
                  { storm: "Dubai / Middle East", engine: "Chicago", param: "n", value: "0.85", char: "Hyper-steep flash decay" },
                  { storm: "UK FEH (Summer)", engine: "SCS", param: "slope", value: "40", char: "Aggressive central peak" },
                  { storm: "French Caquot", engine: "Chicago", param: "n", value: "0.66", char: "Power-law t^(-0.66)" },
                  { storm: "KOSTRA-DWD", engine: "SCS", param: "peakPosition", value: "0.33", char: "Euler II, peak at 1/3" },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.storm}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{row.engine}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{row.param}</TableCell>
                    <TableCell className="font-mono text-xs font-bold">{row.value}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.char}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
