import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { type UnitSystem, convertIntensity, getIntensityUnit } from "@/lib/unitConversions";

interface SensitivityTableProps {
  depth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

interface PatternRow {
  id: PatternType;
  name: string;
  category: string;
  peakIntensity: number;
  timeToPeak: number;
  ratioToUniform: number;
}

const patterns: { id: PatternType; name: string; category: string }[] = [
  { id: 'block', name: 'Uniform (Block)', category: 'Baseline' },
  { id: 'scs1a', name: 'SCS Type IA', category: 'SCS' },
  { id: 'scs1', name: 'SCS Type I', category: 'SCS' },
  { id: 'scs2', name: 'SCS Type II', category: 'SCS' },
  { id: 'scs3', name: 'SCS Type III', category: 'SCS' },
  { id: 'huff1', name: 'Huff 1st Quartile', category: 'Huff' },
  { id: 'huff2', name: 'Huff 2nd Quartile', category: 'Huff' },
  { id: 'huff3', name: 'Huff 3rd Quartile', category: 'Huff' },
  { id: 'huff4', name: 'Huff 4th Quartile', category: 'Huff' },
  { id: 'chicago', name: 'Chicago Storm', category: 'Other' },
  { id: 'triangular', name: 'Triangular', category: 'Other' },
  { id: 'desbordes', name: 'Desbordes (France)', category: 'International' },
  { id: 'arr', name: 'Australian ARR', category: 'International' },
  { id: 'dwa', name: 'German DWA', category: 'International' },
  { id: 'jma', name: 'Japan JMA', category: 'International' },
  { id: 'china', name: 'Chinese P&C', category: 'International' },
  { id: 'sa_huff', name: 'South Africa Huff', category: 'International' },
  { id: 'dutch', name: 'Dutch KNMI', category: 'International' },
  { id: 'italian', name: 'Italian (LSPP)', category: 'International' },
];

export function SensitivityTable({ depth, duration, timeStep, unitSystem }: SensitivityTableProps) {
  const rows = useMemo((): PatternRow[] => {
    const uniformIntensity = depth / duration;
    const timeStepHours = timeStep / 60;

    return patterns.map(p => {
      const intensities = generateRainfallData(p.id, depth, duration, timeStep);
      const peak = Math.max(...intensities);
      const peakIndex = intensities.indexOf(peak);
      const timeToPeak = (peakIndex * timeStep) / 60;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        peakIntensity: peak,
        timeToPeak,
        ratioToUniform: peak / uniformIntensity,
      };
    }).sort((a, b) => b.peakIntensity - a.peakIntensity);
  }, [depth, duration, timeStep]);

  const intensityUnit = getIntensityUnit(unitSystem);
  const highest = rows[0];
  const lowest = rows[rows.length - 1];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Baseline': return 'bg-muted text-muted-foreground';
      case 'SCS': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Huff': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'Other': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'International': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Peak Intensity Sensitivity Analysis
        </CardTitle>
        <CardDescription>
          Storm: {unitSystem === 'USA' ? `${depth.toFixed(2)} in` : `${depth.toFixed(1)} mm`},{" "}
          {duration.toFixed(1)} hr, {timeStep}-min timestep — How does pattern choice affect peak intensity?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key insight */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-1 text-xs text-destructive mb-1">
              <ArrowUp className="w-3 h-3" /> Highest Peak
            </div>
            <p className="font-bold text-sm">{highest.name}</p>
            <p className="text-xs text-muted-foreground">
              {convertIntensity(highest.peakIntensity, 'USA', unitSystem).toFixed(2)} {intensityUnit} ({highest.ratioToUniform.toFixed(1)}× uniform)
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1 text-xs text-primary mb-1">
              <ArrowDown className="w-3 h-3" /> Lowest Peak
            </div>
            <p className="font-bold text-sm">{lowest.name}</p>
            <p className="text-xs text-muted-foreground">
              {convertIntensity(lowest.peakIntensity, 'USA', unitSystem).toFixed(2)} {intensityUnit} ({lowest.ratioToUniform.toFixed(1)}× uniform)
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Pattern</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-right">Peak ({intensityUnit})</TableHead>
                <TableHead className="text-right">Time to Peak (hr)</TableHead>
                <TableHead className="text-right">Ratio to Uniform</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className={idx === 0 ? "bg-destructive/5 font-medium" : row.id === 'block' ? "bg-muted/30" : ""}
                >
                  <TableCell className="font-medium text-sm">
                    {row.name}
                    {idx === 0 && <span className="ml-1 text-xs text-destructive">← HIGHEST</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-xs ${getCategoryColor(row.category)}`}>
                      {row.category}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          This table compares all {patterns.length} patterns using identical storm parameters. 
          The "Ratio to Uniform" column shows how much more intense the peak is compared to a constant-intensity storm.
          Use this for sensitivity analysis in engineering reports.
        </p>
      </CardContent>
    </Card>
  );
}
