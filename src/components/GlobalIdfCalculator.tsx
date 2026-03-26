import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Download, BarChart3, TableIcon, CloudRain, BookOpen } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { COUNTRIES, RP_COLORS, DURATIONS, SHORT_DURATIONS } from "@/lib/globalIdfData";
import { toast } from "sonner";

interface GlobalIdfCalculatorProps {
  onSendToGenerator?: (depthMm: number, durationMin: number) => void;
}

export function GlobalIdfCalculator({ onSendToGenerator }: GlobalIdfCalculatorProps) {
  const [activeCountry, setActiveCountry] = useState("australia");
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"idf" | "table" | "hyetograph">("idf");
  const [stormDuration, setStormDuration] = useState(60);
  const [timeStep, setTimeStep] = useState(5);
  const [rValue, setRValue] = useState(0.4);

  const country = COUNTRIES[activeCountry];
  const cityNames = Object.keys(country.cities);
  const currentCity = activeCity && country.cities[activeCity] ? activeCity : cityNames[0];
  const cityData = country.cities[currentCity];

  const returnPeriods = useMemo(() => {
    if (country.calcWithT) return [2, 5, 10, 20, 50, 100];
    return Object.keys(cityData.params).map(Number).sort((a, b) => a - b);
  }, [activeCountry, currentCity]);

  const idfData = useMemo(() => {
    const durs = country.isDepth ? SHORT_DURATIONS : DURATIONS;
    return durs.map(t => {
      const point: Record<string, number> = { duration: t };
      returnPeriods.forEach(rp => {
        let intensity: number;
        if (country.calcWithT) {
          intensity = country.calc(cityData.params, t, rp);
        } else {
          if (!cityData.params[rp]) return;
          intensity = country.calc(cityData.params[rp], t);
        }
        point[`rp${rp}`] = Math.round(intensity * 100) / 100;
      });
      return point;
    });
  }, [activeCountry, currentCity]);

  // Chicago hyetograph
  const hyetographData = useMemo(() => {
    const steps = Math.floor(stormDuration / timeStep);
    const data: { time: number; intensity: number; depth: number; timeLabel: string }[] = [];
    const rp = returnPeriods.includes(10) ? 10 : returnPeriods[Math.floor(returnPeriods.length / 2)];

    for (let i = 0; i < steps; i++) {
      const tCenter = (i + 0.5) * timeStep;
      let intensity: number;

      if (country.calcWithT) {
        const dur = Math.max(Math.abs(tCenter - rValue * stormDuration), timeStep / 2);
        intensity = country.calc(cityData.params, dur, rp);
      } else {
        if (!cityData.params[rp]) {
          data.push({ time: tCenter, intensity: 0, depth: 0, timeLabel: `${Math.round(i * timeStep)}` });
          continue;
        }
        if (tCenter <= rValue * stormDuration) {
          const tb = rValue * stormDuration - tCenter;
          const avgDur = Math.max(tb / rValue, timeStep / 2);
          intensity = country.calc(cityData.params[rp], avgDur);
        } else {
          const ta = tCenter - rValue * stormDuration;
          const avgDur = Math.max(ta / (1 - rValue), timeStep / 2);
          intensity = country.calc(cityData.params[rp], avgDur);
        }
      }

      data.push({
        time: Math.round(tCenter * 10) / 10,
        intensity: Math.max(0, Math.round(intensity * 100) / 100),
        depth: Math.max(0, Math.round(intensity * timeStep / 60 * 100) / 100),
        timeLabel: `${Math.round(i * timeStep)}`,
      });
    }

    // Alternating block rearrangement
    const sorted = [...data].sort((a, b) => b.intensity - a.intensity);
    const result: typeof data = new Array(steps);
    const peakIdx = Math.floor(rValue * steps);
    result[peakIdx] = sorted[0];

    let left = peakIdx - 1;
    let right = peakIdx + 1;
    for (let i = 1; i < sorted.length; i++) {
      if (i % 2 === 1 && right < steps) { result[right] = sorted[i]; right++; }
      else if (left >= 0) { result[left] = sorted[i]; left--; }
      else if (right < steps) { result[right] = sorted[i]; right++; }
    }

    return result.filter(Boolean).map((d, i) => ({
      ...d,
      time: (i + 0.5) * timeStep,
      timeLabel: `${Math.round(i * timeStep)}`,
    }));
  }, [activeCountry, currentCity, stormDuration, timeStep, rValue]);

  const totalDepth = useMemo(() => hyetographData.reduce((s, d) => s + d.depth, 0), [hyetographData]);
  const peakIntensity = useMemo(() => Math.max(...hyetographData.map(d => d.intensity)), [hyetographData]);

  const exportCSV = useCallback(() => {
    let csv = "Duration(min)";
    returnPeriods.forEach(rp => csv += `,RP${rp}yr(${country.units})`);
    csv += "\n";
    idfData.forEach(row => {
      csv += row.duration;
      returnPeriods.forEach(rp => csv += `,${row[`rp${rp}`] || ""}`);
      csv += "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IDF_${country.name}_${currentCity}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  }, [idfData, returnPeriods, country, currentCity]);

  const handleSendToGenerator = useCallback(() => {
    if (!onSendToGenerator) return;
    const depthMm = totalDepth;
    const durationMin = stormDuration;
    onSendToGenerator(depthMm, durationMin / 60);
    toast.success(`Sent ${depthMm.toFixed(1)} mm / ${durationMin} min storm to generator`);
  }, [onSendToGenerator, totalDepth, stormDuration]);

  const countryCount = Object.keys(COUNTRIES).length;
  const totalCities = Object.values(COUNTRIES).reduce((s, c) => s + Object.keys(c.cities).length, 0);

  return (
    <div className="space-y-4">
      {/* Country selector */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            Global IDF Calculator
          </CardTitle>
          <CardDescription>
            {countryCount} countries · {totalCities} cities · Real published coefficients · Chicago hyetograph engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Country badges */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Country</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(COUNTRIES).map(([key, c]) => (
                <Button
                  key={key}
                  variant={activeCountry === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2.5"
                  onClick={() => { setActiveCountry(key); setActiveCity(null); setViewMode("idf"); }}
                >
                  {c.flag} {c.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Country info */}
          <div className="p-3 rounded-lg bg-accent/30 border border-border space-y-1">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <div className="font-semibold text-sm">{country.flag} {country.name} — {country.standard}</div>
                <p className="text-xs text-muted-foreground italic">{country.description}</p>
                <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {country.ref}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-primary whitespace-nowrap">
                {country.formula}
              </Badge>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">City / Station</label>
              <Select value={currentCity} onValueChange={v => setActiveCity(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cityNames.map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">View</label>
              <div className="flex gap-1">
                {([
                  { id: "idf" as const, icon: BarChart3, label: "IDF" },
                  { id: "table" as const, icon: TableIcon, label: "Table" },
                  { id: "hyetograph" as const, icon: CloudRain, label: "Hyetograph" },
                ] as const).map(v => (
                  <Button
                    key={v.id}
                    variant={viewMode === v.id ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 px-2.5 gap-1"
                    onClick={() => setViewMode(v.id)}
                  >
                    <v.icon className="w-3.5 h-3.5" />
                    {v.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportCSV}>
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hyetograph controls */}
      {viewMode === "hyetograph" && (
        <Card className="border-border">
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Duration (min)</label>
                <Select value={String(stormDuration)} onValueChange={v => setStormDuration(Number(v))}>
                  <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[15, 30, 60, 120, 180, 360, 720, 1440].map(v => (
                      <SelectItem key={v} value={String(v)} className="text-xs">{v} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Time Step</label>
                <Select value={String(timeStep)} onValueChange={v => setTimeStep(Number(v))}>
                  <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 5, 10, 15].map(v => (
                      <SelectItem key={v} value={String(v)} className="text-xs">{v} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">
                  r = {rValue.toFixed(2)} — Peak at {(rValue * stormDuration).toFixed(0)} min
                </label>
                <Slider
                  value={[rValue]}
                  onValueChange={([v]) => setRValue(v)}
                  min={0.1}
                  max={0.9}
                  step={0.01}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <div className="rounded-md bg-accent/30 border border-border px-3 py-1.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Peak</div>
                  <div className="text-sm font-bold text-primary">{peakIntensity.toFixed(1)} {country.units}</div>
                </div>
                <div className="rounded-md bg-accent/30 border border-border px-3 py-1.5 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Total</div>
                  <div className="text-sm font-bold text-primary">{totalDepth.toFixed(1)} mm</div>
                </div>
              </div>
              {onSendToGenerator && (
                <Button size="sm" className="h-8 text-xs" onClick={handleSendToGenerator}>
                  Send to Generator
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IDF Curves */}
      {viewMode === "idf" && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">IDF Curves — {currentCity}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={idfData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="duration"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  label={{ value: "Duration (min)", position: "insideBottom", offset: -15, fontSize: 11 }}
                  scale="log"
                  domain={["auto", "auto"]}
                  type="number"
                  ticks={[5, 10, 15, 30, 60, 120, 360, 720, 1440]}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  label={{ value: country.units, angle: -90, position: "insideLeft", offset: 5, fontSize: 11 }}
                  scale="log"
                  domain={["auto", "auto"]}
                  type="number"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                  formatter={(val: number, name: string) => [`${val} ${country.units}`, name.replace("rp", "") + "-yr"]}
                  labelFormatter={(v: number) => `Duration: ${v} min`}
                />
                <Legend formatter={(v: string) => v.replace("rp", "") + "-yr"} wrapperStyle={{ fontSize: 10 }} />
                {returnPeriods.map(rp => (
                  <Line
                    key={rp}
                    type="monotone"
                    dataKey={`rp${rp}`}
                    stroke={RP_COLORS[rp] || "hsl(var(--primary))"}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name={`rp${rp}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {viewMode === "table" && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">IDF Data — {currentCity} ({country.units})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Duration (min)</TableHead>
                  {returnPeriods.map(rp => (
                    <TableHead key={rp} className="text-xs text-center whitespace-nowrap" style={{ color: RP_COLORS[rp] }}>
                      {rp}-yr
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {idfData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium tabular-nums">{row.duration}</TableCell>
                    {returnPeriods.map(rp => (
                      <TableCell key={rp} className="text-xs text-center tabular-nums">
                        {row[`rp${rp}`] !== undefined ? row[`rp${rp}`].toFixed(1) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hyetograph */}
      {viewMode === "hyetograph" && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chicago Design Storm — {currentCity} (r = {rValue})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={hyetographData} margin={{ top: 5, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 9 }}
                  className="fill-muted-foreground"
                  label={{ value: "Time (min)", position: "insideBottom", offset: -15, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                  label={{ value: country.units, angle: -90, position: "insideLeft", offset: 5, fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                  formatter={(val: number, name: string) => {
                    if (name === "intensity") return [`${val} ${country.units}`, "Intensity"];
                    return [`${val} mm`, "Depth"];
                  }}
                  labelFormatter={(v: string) => `Time: ${v} min`}
                />
                <Bar dataKey="intensity" name="intensity" radius={[2, 2, 0, 0]}>
                  {hyetographData.map((d, i) => {
                    const maxI = Math.max(...hyetographData.map(x => x.intensity));
                    const ratio = maxI > 0 ? d.intensity / maxI : 0;
                    // Blue to red gradient
                    const r = Math.round(30 + 200 * ratio);
                    const g = Math.round(100 + 80 * (1 - ratio));
                    const b = Math.round(220 - 100 * ratio);
                    return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Stats footer */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { label: "Cities", value: cityNames.length, icon: "🏙️" },
          { label: "Return Periods", value: returnPeriods.length, icon: "📊" },
          { label: "Data Points", value: idfData.length * returnPeriods.length, icon: "🔢" },
          { label: "Formula", value: country.calcWithT ? "4-param" : "3-param", icon: "📐" },
          { label: "Units", value: country.units, icon: "📏" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg bg-accent/30 border border-border p-2 text-center">
            <div className="text-sm">{s.icon}</div>
            <div className="text-xs font-bold text-primary">{s.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center">
        ⚠️ Coefficients are representative values from published literature. Always verify against official local standards for design use.
      </p>
    </div>
  );
}
