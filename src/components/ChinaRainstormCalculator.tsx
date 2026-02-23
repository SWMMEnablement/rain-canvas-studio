import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Download, BarChart3, Table as TableIcon, Zap, GitCompareArrows } from "lucide-react";
import { ChinaCityComparison } from "./ChinaCityComparison";
import {
  chinaRainstormDatabase,
  searchCities,
  getProvinces,
  calculateIntensity,
  intensityToMmPerHr,
  intensityToInPerHr,
  generateIdfTable,
  generateFormulaHyetograph,
  type CityRainstormParams,
} from "@/lib/chinaRainstormData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";

export function ChinaRainstormCalculator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityRainstormParams | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [returnPeriod, setReturnPeriod] = useState(10);
  const [duration, setDuration] = useState(60);
  const [timeStep, setTimeStep] = useState(5);
  const [activeTab, setActiveTab] = useState("formula");

  const provinces = useMemo(() => getProvinces(), []);

  const filteredCities = useMemo(() => {
    if (searchQuery.trim()) {
      return searchCities(searchQuery);
    }
    if (selectedProvince !== "all") {
      return chinaRainstormDatabase.filter(c => c.province === selectedProvince);
    }
    return chinaRainstormDatabase;
  }, [searchQuery, selectedProvince]);

  const intensity = useMemo(() => {
    if (!selectedCity) return null;
    const q = calculateIntensity(selectedCity, returnPeriod, duration);
    return {
      lsHa: q,
      mmHr: intensityToMmPerHr(q),
      inHr: intensityToInPerHr(q),
      depthMm: intensityToMmPerHr(q) * (duration / 60),
    };
  }, [selectedCity, returnPeriod, duration]);

  const idfData = useMemo(() => {
    if (!selectedCity) return [];
    return generateIdfTable(selectedCity);
  }, [selectedCity]);

  const hyetographData = useMemo(() => {
    if (!selectedCity) return [];
    const intensities = generateFormulaHyetograph(selectedCity, returnPeriod, duration, timeStep);
    return intensities.map((val, i) => ({
      time: `${(i * timeStep)}`,
      intensity: parseFloat(val.toFixed(2)),
    }));
  }, [selectedCity, returnPeriod, duration, timeStep]);

  const idfChartData = useMemo(() => {
    if (!selectedCity) return [];
    const periods = [2, 5, 10, 20, 50, 100];
    const durations = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 360];
    
    return durations.map(t => {
      const point: Record<string, number | string> = { duration: t };
      for (const P of periods) {
        const q = calculateIntensity(selectedCity, P, t);
        point[`P${P}`] = parseFloat(intensityToMmPerHr(q).toFixed(1));
      }
      return point;
    });
  }, [selectedCity]);

  const handleExportCSV = useCallback(() => {
    if (!selectedCity || hyetographData.length === 0) return;
    const header = "Time (min),Intensity (mm/hr)\n";
    const rows = hyetographData.map(d => `${d.time},${d.intensity}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCity.name}_P${returnPeriod}_${duration}min.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCity, hyetographData, returnPeriod, duration]);

  const handleExportIDF = useCallback(() => {
    if (!selectedCity || idfData.length === 0) return;
    const header = "Return Period (yr),Duration (min),Intensity L/(s·ha),Depth (mm)\n";
    const rows = idfData.map(d => `${d.returnPeriod},${d.duration},${d.intensity.toFixed(2)},${d.depthMm.toFixed(1)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCity.name}_IDF_Table.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCity, idfData]);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* City Search Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Select City 选择城市
            </CardTitle>
            <CardDescription>
              {chinaRainstormDatabase.length} cities available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city (中文/English)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Province Filter */}
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces 全部省份</SelectItem>
                {provinces.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City List */}
            <ScrollArea className="h-[350px] rounded-md border">
              <div className="p-2 space-y-1">
                {filteredCities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No cities found
                  </p>
                ) : (
                  filteredCities.map((city) => (
                    <button
                      key={`${city.name}-${city.province}`}
                      onClick={() => setSelectedCity(city)}
                      className={`w-full text-left p-2.5 rounded-md text-sm transition-colors ${
                        selectedCity?.name === city.name && selectedCity?.province === city.province
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{city.nameCN} {city.name}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {city.province}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Calculator Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {selectedCity 
                ? `${selectedCity.nameCN} ${selectedCity.name} — ${selectedCity.provinceCN}`
                : "Select a city to begin"
              }
            </CardTitle>
            {selectedCity && (
              <CardDescription>
                Source: {selectedCity.reference} | Valid: P={selectedCity.validReturnPeriods[0]}-{selectedCity.validReturnPeriods[1]} yr, t={selectedCity.validDuration[0]}-{selectedCity.validDuration[1]} min
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCity && activeTab !== "compare" ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No city selected</p>
                <p className="text-sm">Search or browse the city list, or use the <button onClick={() => setActiveTab("compare")} className="text-primary underline">Compare</button> tab</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="formula" className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Formula
                  </TabsTrigger>
                  <TabsTrigger value="hyetograph" className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Hyetograph
                  </TabsTrigger>
                  <TabsTrigger value="idf" className="flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    IDF Curves
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="flex items-center gap-1.5">
                    <GitCompareArrows className="w-3.5 h-3.5" />
                    Compare
                  </TabsTrigger>
                </TabsList>

                {/* Formula Tab */}
                <TabsContent value="formula" className="space-y-5 mt-4">
                  {/* Formula Display */}
                  <div className="bg-accent/50 rounded-lg p-4 text-center font-mono">
                    <p className="text-xs text-muted-foreground mb-2">GB 50014 Standard Formula (暴雨强度公式)</p>
                    <p className="text-lg">
                      q = 167 × <span className="text-primary font-bold">{selectedCity.A1}</span> × (1 + <span className="text-primary font-bold">{selectedCity.C}</span> × lgP) / (t + <span className="text-primary font-bold">{selectedCity.b}</span>)<sup className="text-primary font-bold">{selectedCity.n}</sup>
                    </p>
                    <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                      <div className="bg-background rounded p-2">
                        <p className="text-muted-foreground">A₁</p>
                        <p className="font-bold text-primary">{selectedCity.A1}</p>
                      </div>
                      <div className="bg-background rounded p-2">
                        <p className="text-muted-foreground">C</p>
                        <p className="font-bold text-primary">{selectedCity.C}</p>
                      </div>
                      <div className="bg-background rounded p-2">
                        <p className="text-muted-foreground">b (min)</p>
                        <p className="font-bold text-primary">{selectedCity.b}</p>
                      </div>
                      <div className="bg-background rounded p-2">
                        <p className="text-muted-foreground">n</p>
                        <p className="font-bold text-primary">{selectedCity.n}</p>
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Return Period P (years) 重现期</Label>
                      <Select value={String(returnPeriod)} onValueChange={(v) => setReturnPeriod(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 5, 10, 20, 30, 50, 100].map(p => (
                            <SelectItem key={p} value={String(p)}>{p} yr</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration t (min) 历时</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[duration]}
                          onValueChange={([v]) => setDuration(v)}
                          min={5}
                          max={360}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-mono w-16 text-right">{duration} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  {intensity && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Intensity</p>
                        <p className="text-xl font-bold text-primary">{intensity.lsHa.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">L/(s·ha)</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Intensity</p>
                        <p className="text-xl font-bold text-primary">{intensity.mmHr.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">mm/hr</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Intensity</p>
                        <p className="text-xl font-bold text-primary">{intensity.inHr.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">in/hr</p>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Depth</p>
                        <p className="text-xl font-bold text-primary">{intensity.depthMm.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">mm</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Hyetograph Tab */}
                <TabsContent value="hyetograph" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Time Step</Label>
                        <Select value={String(timeStep)} onValueChange={(v) => setTimeStep(Number(v))}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 30].map(ts => (
                              <SelectItem key={ts} value={String(ts)}>{ts} min</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        P={returnPeriod}yr | t={duration}min | Δt={timeStep}min
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hyetographData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (min)', position: 'insideBottom', offset: -5 }}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          label={{ value: 'Intensity (mm/hr)', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value} mm/hr`, 'Intensity']}
                          labelFormatter={(label) => `t = ${label} min`}
                        />
                        <Bar dataKey="intensity" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Alternating Block Method (交替块法) — Peak centered at mid-duration
                  </p>
                </TabsContent>

                {/* IDF Tab */}
                <TabsContent value="idf" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      IDF Curves for {selectedCity.nameCN} {selectedCity.name}
                    </p>
                    <Button variant="outline" size="sm" onClick={handleExportIDF} className="gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Export IDF
                    </Button>
                  </div>

                  {/* IDF Chart */}
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={idfChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="duration" 
                          label={{ value: 'Duration (min)', position: 'insideBottom', offset: -5 }}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          label={{ value: 'Intensity (mm/hr)', angle: -90, position: 'insideLeft' }}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value} mm/hr`]}
                          labelFormatter={(label) => `t = ${label} min`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="P2" name="P=2yr" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="P5" name="P=5yr" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="P10" name="P=10yr" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="P20" name="P=20yr" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="P50" name="P=50yr" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="P100" name="P=100yr" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* IDF Table */}
                  <div className="overflow-auto max-h-[250px] rounded-md border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium">t (min)</th>
                          {[2, 5, 10, 20, 50, 100].map(p => (
                            <th key={p} className="px-2 py-1.5 text-right font-medium">P={p}yr</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 360].map(t => (
                          <tr key={t} className="border-t border-border/50 hover:bg-accent/30">
                            <td className="px-2 py-1 font-medium">{t}</td>
                            {[2, 5, 10, 20, 50, 100].map(p => {
                              const q = calculateIntensity(selectedCity, p, t);
                              return (
                                <td key={p} className="px-2 py-1 text-right font-mono">
                                  {intensityToMmPerHr(q).toFixed(1)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-[10px] text-muted-foreground text-center py-1 bg-muted/30">
                      All values in mm/hr
                    </p>
                  </div>
                </TabsContent>
                {/* Compare Tab */}
                <TabsContent value="compare" className="mt-4">
                  <ChinaCityComparison />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
