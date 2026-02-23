import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Plus, Download, GitCompareArrows } from "lucide-react";
import {
  chinaRainstormDatabase,
  searchCities,
  calculateIntensity,
  intensityToMmPerHr,
  type CityRainstormParams,
} from "@/lib/chinaRainstormData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const CITY_COLORS = [
  "hsl(var(--primary))",
  "#ef4444",
  "#f59e0b",
];

const CITY_COLOR_CLASSES = [
  "bg-primary text-primary-foreground",
  "bg-red-500 text-white",
  "bg-amber-500 text-white",
];

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 360];
const RETURN_PERIODS = [2, 5, 10, 20, 50, 100];

export function ChinaCityComparison() {
  const [selectedCities, setSelectedCities] = useState<CityRainstormParams[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [returnPeriod, setReturnPeriod] = useState(10);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return chinaRainstormDatabase.slice(0, 20);
    return searchCities(searchQuery);
  }, [searchQuery]);

  const addCity = useCallback((city: CityRainstormParams) => {
    setSelectedCities(prev => {
      if (prev.length >= 3) return prev;
      if (prev.some(c => c.name === city.name && c.province === city.province)) return prev;
      return [...prev, city];
    });
    setSearchQuery("");
  }, []);

  const removeCity = useCallback((index: number) => {
    setSelectedCities(prev => prev.filter((_, i) => i !== index));
  }, []);

  // IDF comparison chart data
  const comparisonData = useMemo(() => {
    if (selectedCities.length === 0) return [];
    return DURATIONS.map(t => {
      const point: Record<string, number | string> = { duration: t };
      selectedCities.forEach((city, i) => {
        const q = calculateIntensity(city, returnPeriod, t);
        point[`city${i}`] = parseFloat(intensityToMmPerHr(q).toFixed(1));
      });
      return point;
    });
  }, [selectedCities, returnPeriod]);

  // Coefficient comparison table
  const coefficientTable = useMemo(() => {
    return selectedCities.map(city => ({
      name: `${city.nameCN} ${city.name}`,
      province: city.province,
      A1: city.A1,
      C: city.C,
      b: city.b,
      n: city.n,
      reference: city.reference,
    }));
  }, [selectedCities]);

  const handleExportCSV = useCallback(() => {
    if (selectedCities.length === 0) return;
    const cityNames = selectedCities.map(c => c.name);
    const header = `Duration (min),${cityNames.map(n => `${n} (mm/hr)`).join(",")}\n`;
    const rows = DURATIONS.map(t => {
      const values = selectedCities.map(city => {
        const q = calculateIntensity(city, returnPeriod, t);
        return intensityToMmPerHr(q).toFixed(1);
      });
      return `${t},${values.join(",")}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `China_IDF_Compare_P${returnPeriod}_${cityNames.join("_vs_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCities, returnPeriod]);

  return (
    <div className="space-y-4">
      {/* City Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCities.map((city, i) => (
            <Badge key={`${city.name}-${city.province}`} className={`${CITY_COLOR_CLASSES[i]} gap-1 text-sm py-1 px-3`}>
              {city.nameCN} {city.name}
              <button onClick={() => removeCity(i)} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {selectedCities.length < 3 && (
          <div className="relative">
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Add city ${selectedCities.length + 1} of 3...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-56 h-8 text-sm"
              />
            </div>
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-72 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                {searchResults.slice(0, 10).map(city => {
                  const alreadySelected = selectedCities.some(c => c.name === city.name && c.province === city.province);
                  return (
                    <button
                      key={`${city.name}-${city.province}`}
                      onClick={() => !alreadySelected && addCity(city)}
                      disabled={alreadySelected}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent disabled:opacity-40 flex justify-between"
                    >
                      <span>{city.nameCN} {city.name}</span>
                      <span className="text-muted-foreground text-xs">{city.province}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedCities.length >= 2 && (
          <div className="ml-auto flex items-center gap-2">
            <Select value={String(returnPeriod)} onValueChange={v => setReturnPeriod(Number(v))}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETURN_PERIODS.map(p => (
                  <SelectItem key={p} value={String(p)}>P={p} yr</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>
        )}
      </div>

      {selectedCities.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <GitCompareArrows className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Select 2–3 cities to compare IDF curves</p>
          <p className="text-xs mt-1">e.g., Beijing vs Shanghai vs Guangzhou</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Coefficient Comparison */}
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">City</th>
                  <th className="px-3 py-2 text-right font-medium">A₁</th>
                  <th className="px-3 py-2 text-right font-medium">C</th>
                  <th className="px-3 py-2 text-right font-medium">b</th>
                  <th className="px-3 py-2 text-right font-medium">n</th>
                  <th className="px-3 py-2 text-right font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {coefficientTable.map((row, i) => (
                  <tr key={row.name} className="border-t border-border/50">
                    <td className="px-3 py-1.5 font-medium">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: CITY_COLORS[i] }} />
                      {row.name}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.A1}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.C}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.b}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{row.n}</td>
                    <td className="px-3 py-1.5 text-right text-muted-foreground">{row.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* IDF Comparison Chart */}
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="duration"
                  label={{ value: "Duration (min)", position: "insideBottom", offset: -5 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Intensity (mm/hr)", angle: -90, position: "insideLeft" }}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const idx = parseInt(name.replace("city", ""));
                    const city = selectedCities[idx];
                    return [`${value} mm/hr`, city ? `${city.nameCN} ${city.name}` : name];
                  }}
                  labelFormatter={label => `t = ${label} min`}
                />
                <Legend
                  formatter={(value: string) => {
                    const idx = parseInt(value.replace("city", ""));
                    const city = selectedCities[idx];
                    return city ? `${city.nameCN} ${city.name}` : value;
                  }}
                />
                {selectedCities.map((_, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`city${i}`}
                    stroke={CITY_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Intensity Comparison Table */}
          <div className="overflow-auto max-h-[250px] rounded-md border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">t (min)</th>
                  {selectedCities.map((city, i) => (
                    <th key={i} className="px-2 py-1.5 text-right font-medium">
                      <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: CITY_COLORS[i] }} />
                      {city.nameCN}
                    </th>
                  ))}
                  {selectedCities.length >= 2 && (
                    <th className="px-2 py-1.5 text-right font-medium">Δ Max</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map(t => {
                  const intensities = selectedCities.map(city => {
                    const q = calculateIntensity(city, returnPeriod, t);
                    return intensityToMmPerHr(q);
                  });
                  const maxI = Math.max(...intensities);
                  const minI = Math.min(...intensities);
                  const diff = maxI > 0 ? ((maxI - minI) / minI * 100).toFixed(0) : "0";
                  
                  return (
                    <tr key={t} className="border-t border-border/50 hover:bg-accent/30">
                      <td className="px-2 py-1 font-medium">{t}</td>
                      {intensities.map((val, i) => {
                        const isMax = val === maxI && intensities.filter(v => v === maxI).length === 1;
                        return (
                          <td key={i} className={`px-2 py-1 text-right font-mono ${isMax ? "font-bold text-primary" : ""}`}>
                            {val.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 text-right font-mono text-muted-foreground">
                        +{diff}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground text-center py-1 bg-muted/30">
              P={returnPeriod}yr | All values in mm/hr | Δ Max = difference between highest and lowest city
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
