import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarChart3, ArrowUp, ArrowDown, Search, ArrowUpDown } from "lucide-react";
import { AllPatternsReportPdf } from "@/components/AllPatternsReportPdf";
import { Button } from "@/components/ui/button";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { type UnitSystem, convertIntensity, getIntensityUnit } from "@/lib/unitConversions";
import { patterns as allPatterns } from "@/components/PatternSelector";

interface AllPatternsTestProps {
  depth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

interface PatternResult {
  id: PatternType;
  name: string;
  icon: string;
  category: string;
  peakIntensity: number;
  timeToPeak: number;
  ratioToUniform: number;
  avgIntensity: number;
  peakToAvgRatio: number;
}

type SortField = 'peakIntensity' | 'timeToPeak' | 'name' | 'ratioToUniform' | 'peakToAvgRatio';

const categoryLabels: Record<string, string> = {
  swmm: 'SWMM / Core',
  us_agency: 'US Agency',
  icm: 'UK / ICM',
  european: 'European',
  scandinavian: 'Nordic',
  international: 'International',
  asian: 'Asian',
  middle_east: 'Middle East',
  african: 'African',
  latam: 'Latin America',
  americas: 'Americas',
  oceania: 'Oceania',
};

const categoryColors: Record<string, string> = {
  swmm: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  us_agency: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  icm: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  european: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  scandinavian: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  international: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  asian: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  middle_east: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  african: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
  latam: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  americas: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  oceania: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

export function AllPatternsTest({ depth, duration, timeStep, unitSystem }: AllPatternsTestProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>('peakIntensity');
  const [sortAsc, setSortAsc] = useState(false);

  const results = useMemo((): PatternResult[] => {
    const uniformIntensity = depth / duration;

    return allPatterns
      .filter(p => p.id !== 'custom')
      .map(p => {
        const intensities = generateRainfallData(p.id, depth, duration, timeStep);
        const peak = Math.max(...intensities);
        const peakIndex = intensities.indexOf(peak);
        const timeToPeak = (peakIndex * timeStep) / 60;
        const avg = intensities.reduce((s, v) => s + v, 0) / intensities.length;

        return {
          id: p.id,
          name: p.name,
          icon: p.icon,
          category: p.category,
          peakIntensity: peak,
          timeToPeak,
          ratioToUniform: peak / uniformIntensity,
          avgIntensity: avg,
          peakToAvgRatio: avg > 0 ? peak / avg : 0,
        };
      });
  }, [depth, duration, timeStep]);

  const sorted = useMemo(() => {
    const filtered = results.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (categoryLabels[r.category] || '').toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [results, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const intensityUnit = getIntensityUnit(unitSystem);
  const highest = results.reduce((max, r) => r.peakIntensity > max.peakIntensity ? r : max, results[0]);
  const lowest = results.reduce((min, r) => r.peakIntensity < min.peakIntensity ? r : min, results[0]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Test All Patterns</h2>
        <p className="text-muted-foreground">
          Compare peak intensities across all {results.length} design storms using your Step 1 parameters
        </p>
        <div className="mt-3">
          <AllPatternsReportPdf depth={depth} duration={duration} timeStep={timeStep} unitSystem={unitSystem} />
        </div>
      </div>

      {/* Storm params summary */}
      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Depth: {unitSystem === 'USA' ? `${depth.toFixed(2)} in` : `${depth.toFixed(1)} mm`}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Duration: {duration.toFixed(1)} hr
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Timestep: {timeStep} min
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key insight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-destructive mb-1">
              <ArrowUp className="w-3 h-3" /> Highest Peak
            </div>
            <p className="font-bold text-lg">{highest.icon} {highest.name}</p>
            <p className="text-sm text-muted-foreground">
              {convertIntensity(highest.peakIntensity, 'USA', unitSystem).toFixed(2)} {intensityUnit}
            </p>
            <p className="text-xs text-muted-foreground">{highest.ratioToUniform.toFixed(1)}× uniform</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-primary mb-1">
              <ArrowDown className="w-3 h-3" /> Lowest Peak
            </div>
            <p className="font-bold text-lg">{lowest.icon} {lowest.name}</p>
            <p className="text-sm text-muted-foreground">
              {convertIntensity(lowest.peakIntensity, 'USA', unitSystem).toFixed(2)} {intensityUnit}
            </p>
            <p className="text-xs text-muted-foreground">{lowest.ratioToUniform.toFixed(1)}× uniform</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-muted/30">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <BarChart3 className="w-3 h-3" /> Range
            </div>
            <p className="font-bold text-lg">
              {(highest.ratioToUniform / lowest.ratioToUniform).toFixed(1)}×
            </p>
            <p className="text-sm text-muted-foreground">spread between patterns</p>
            <p className="text-xs text-muted-foreground">{results.length} patterns tested</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Full Results
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter patterns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-8 text-center">#</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-8" onClick={() => toggleSort('name')}>
                      Pattern <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Region</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 h-8 ml-auto" onClick={() => toggleSort('peakIntensity')}>
                      Peak ({intensityUnit}) <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 h-8 ml-auto" onClick={() => toggleSort('timeToPeak')}>
                      Time to Peak (hr) <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 h-8 ml-auto" onClick={() => toggleSort('ratioToUniform')}>
                      vs Uniform <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 h-8 ml-auto" onClick={() => toggleSort('peakToAvgRatio')}>
                      Peak/Avg <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={
                      row.id === highest.id
                        ? "bg-destructive/5 font-medium"
                        : row.id === lowest.id
                          ? "bg-primary/5"
                          : row.id === 'block'
                            ? "bg-muted/30"
                            : ""
                    }
                  >
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <span className="mr-1.5">{row.icon}</span>
                      {row.name}
                      {row.id === highest.id && (
                        <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">HIGHEST</Badge>
                      )}
                      {row.id === lowest.id && (
                        <Badge className="ml-2 text-[10px] px-1.5 py-0 bg-primary">LOWEST</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${categoryColors[row.category] || ''}`}>
                        {categoryLabels[row.category] || row.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {convertIntensity(row.peakIntensity, 'USA', unitSystem).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.timeToPeak.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.ratioToUniform.toFixed(1)}×
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.peakToAvgRatio.toFixed(1)}×
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All {results.length} patterns tested with identical storm parameters. 
            "vs Uniform" shows how much more intense the peak is vs. constant-intensity. 
            "Peak/Avg" is the peakedness ratio — higher means more concentrated burst.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
