import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Award } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { type RainfallDataPoint } from "@/lib/rainfallParsers";

interface HistoricalStormMatchingProps {
  data: RainfallDataPoint[];
  metadata: {
    filename: string;
    totalDepth?: number;
    peakIntensity?: number;
    peakTime?: number;
    timeStep?: number;
  };
}

interface MatchResult {
  id: PatternType;
  name: string;
  r2: number;
  rmse: number;
  peakError: number; // % error in peak intensity
}

const syntheticPatterns: { id: PatternType; name: string }[] = [
  { id: 'scs1a', name: 'SCS Type IA' },
  { id: 'scs1', name: 'SCS Type I' },
  { id: 'scs2', name: 'SCS Type II' },
  { id: 'scs3', name: 'SCS Type III' },
  { id: 'huff1', name: 'Huff 1st Quartile' },
  { id: 'huff2', name: 'Huff 2nd Quartile' },
  { id: 'huff3', name: 'Huff 3rd Quartile' },
  { id: 'huff4', name: 'Huff 4th Quartile' },
  { id: 'chicago', name: 'Chicago Storm' },
  { id: 'block', name: 'Block (Uniform)' },
  { id: 'triangular', name: 'Triangular' },
  { id: 'desbordes', name: 'Desbordes' },
  { id: 'arr', name: 'Australian ARR' },
  { id: 'dwa', name: 'German DWA' },
  { id: 'jma', name: 'Japan JMA' },
  { id: 'china', name: 'Chinese P&C' },
  { id: 'sa_huff', name: 'South Africa Huff' },
  { id: 'dutch', name: 'Dutch KNMI' },
  { id: 'italian', name: 'Italian (LSPP)' },
];

export function HistoricalStormMatching({ data, metadata }: HistoricalStormMatchingProps) {
  const matches = useMemo((): MatchResult[] => {
    if (data.length < 3) return [];

    // Normalize observed data to cumulative fractions [0-1] over normalized time [0-1]
    const totalDepth = metadata.totalDepth || data.reduce((sum, d) => sum + d.intensity * ((metadata.timeStep || 15) / 60), 0);
    const durationMin = data[data.length - 1].time - data[0].time;
    if (durationMin <= 0 || totalDepth <= 0) return [];

    const durationHr = durationMin / 60;
    const timeStep = metadata.timeStep || Math.round(durationMin / (data.length - 1));
    const numSteps = data.length;

    // Compute observed cumulative fractions
    const observedCumFractions: number[] = [];
    let cumDepth = 0;
    for (const d of data) {
      cumDepth += d.intensity * (timeStep / 60);
      observedCumFractions.push(cumDepth / totalDepth);
    }

    // For each synthetic pattern, generate same number of steps, compute cumulative fractions, then R²
    return syntheticPatterns.map(p => {
      const synIntensities = generateRainfallData(p.id, totalDepth, durationHr, timeStep);

      // Compute synthetic cumulative fractions
      const synCumFractions: number[] = [];
      let synCum = 0;
      const synTotal = synIntensities.reduce((s, v) => s + v * (timeStep / 60), 0);
      const effectiveTotal = synTotal > 0 ? synTotal : 1;

      // Match lengths
      const len = Math.min(numSteps, synIntensities.length);
      for (let i = 0; i < len; i++) {
        synCum += synIntensities[i] * (timeStep / 60);
        synCumFractions.push(synCum / effectiveTotal);
      }

      // R² calculation on cumulative fractions
      const obsMean = observedCumFractions.slice(0, len).reduce((s, v) => s + v, 0) / len;
      let ssRes = 0, ssTot = 0, sumSqErr = 0;
      for (let i = 0; i < len; i++) {
        const obs = observedCumFractions[i] ?? 0;
        const syn = synCumFractions[i] ?? 0;
        ssRes += (obs - syn) ** 2;
        ssTot += (obs - obsMean) ** 2;
        sumSqErr += (obs - syn) ** 2;
      }
      const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
      const rmse = Math.sqrt(sumSqErr / len);

      // Peak error
      const obsPeak = Math.max(...data.map(d => d.intensity));
      const synPeak = Math.max(...synIntensities.slice(0, len));
      const peakError = obsPeak > 0 ? Math.abs(synPeak - obsPeak) / obsPeak * 100 : 0;

      return { id: p.id, name: p.name, r2, rmse, peakError };
    }).sort((a, b) => b.r2 - a.r2);
  }, [data, metadata]);

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Import at least 3 data points to run storm matching analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const best = matches[0];
  const second = matches[1];
  const third = matches[2];

  const getR2Color = (r2: number) => {
    if (r2 >= 0.9) return 'text-emerald-600 dark:text-emerald-400';
    if (r2 >= 0.75) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };

  const getR2Badge = (r2: number) => {
    if (r2 >= 0.9) return 'Excellent';
    if (r2 >= 0.75) return 'Good';
    if (r2 >= 0.5) return 'Fair';
    return 'Poor';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Historical Storm Matching
        </CardTitle>
        <CardDescription>
          Comparing <strong>{metadata.filename}</strong> against {syntheticPatterns.length} synthetic patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 results */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h4 className="font-bold">Best Match</h4>
          </div>
          <div className="grid gap-2">
            {[best, second, third].map((m, i) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded bg-background">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                  <span className="font-medium text-sm">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={i === 0 ? "default" : "secondary"} className="text-xs">
                    R² = {m.r2.toFixed(3)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{getR2Badge(m.r2)}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Recommendation:</strong> For design storms representing this event type, 
            use <strong>{best.name}</strong> distribution.
          </p>
        </div>

        {/* Full table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead className="text-right">R²</TableHead>
                <TableHead className="text-right">RMSE</TableHead>
                <TableHead className="text-right">Peak Error</TableHead>
                <TableHead className="text-right">Fit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m, idx) => (
                <TableRow key={m.id} className={idx === 0 ? "bg-primary/5" : ""}>
                  <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-medium text-sm">{m.name}</TableCell>
                  <TableCell className={`text-right font-mono text-sm ${getR2Color(m.r2)}`}>
                    {m.r2.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {m.rmse.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {m.peakError.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={`text-xs ${getR2Color(m.r2)}`}>
                      {getR2Badge(m.r2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          R² is computed on cumulative rainfall fractions (mass curve), which is the standard approach 
          for temporal distribution fitting. RMSE and peak error provide additional diagnostics.
        </p>
      </CardContent>
    </Card>
  );
}
