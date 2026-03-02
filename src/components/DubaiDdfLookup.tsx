import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Zap } from "lucide-react";
import { type UnitSystem, convertDepth, formatDepth } from "@/lib/unitConversions";

/** Dubai Municipality New DDF Table (mm) — from 2024/2025 DM Guidelines */
const DUBAI_DDF_DURATIONS_MIN = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 720, 1440] as const;
const DUBAI_DDF_ARI = [2, 5, 10, 20, 25, 50, 100] as const;

/** Depth in mm indexed by [ariIndex][durationIndex] */
const DUBAI_DDF_DEPTHS: number[][] = [
  // 2-yr
  [4.68, 7.02, 8.82, 9.92, 11.36, 12.64, 13.44, 14.78, 16.04, 17.63, 18.84, 19.69, 20.38, 24.70, 25.70],
  // 5-yr
  [7.62, 11.73, 14.80, 16.84, 19.61, 22.20, 23.89, 26.49, 28.68, 31.52, 33.63, 35.16, 36.41, 43.14, 46.20],
  // 10-yr
  [9.87, 15.56, 19.72, 22.64, 26.73, 30.67, 33.33, 37.20, 40.18, 44.17, 47.06, 49.21, 50.99, 59.37, 65.00],
  // 20-yr
  [13.05, 21.14, 26.91, 31.21, 37.40, 43.54, 47.78, 53.69, 57.88, 63.62, 67.69, 70.81, 73.39, 83.92, 94.00],
  // 25-yr
  [13.90, 22.72, 28.98, 33.73, 40.62, 47.51, 52.31, 58.91, 63.46, 69.75, 74.18, 77.62, 80.44, 91.46, 103.20],
  // 50-yr
  [18.31, 29.93, 38.16, 44.41, 53.49, 62.57, 68.89, 77.57, 83.56, 91.85, 97.68, 102.21, 105.93, 120.43, 135.90],
  // 100-yr
  [23.79, 38.89, 49.59, 57.71, 69.51, 81.31, 89.52, 100.80, 108.59, 119.36, 126.94, 132.82, 137.66, 156.50, 176.60],
];

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  if (min === 60) return "1 hr";
  if (min < 1440) return `${min / 60} hr`;
  return "24 hr";
}

interface DubaiDdfLookupProps {
  unitSystem: UnitSystem;
  onApply: (depthMm: number, durationHr: number) => void;
}

export function DubaiDdfLookup({ unitSystem, onApply }: DubaiDdfLookupProps) {
  const [selectedAri, setSelectedAri] = useState<number | null>(null);
  const [selectedDur, setSelectedDur] = useState<number | null>(null);

  const ariIdx = selectedAri !== null ? DUBAI_DDF_ARI.indexOf(selectedAri as any) : -1;
  const durIdx = selectedDur !== null ? DUBAI_DDF_DURATIONS_MIN.indexOf(selectedDur as any) : -1;

  const selectedDepthMm = ariIdx >= 0 && durIdx >= 0 ? DUBAI_DDF_DEPTHS[ariIdx][durIdx] : null;

  const displayDepth = useMemo(() => {
    if (selectedDepthMm === null) return null;
    return unitSystem === "SI" ? selectedDepthMm : convertDepth(selectedDepthMm, "SI", "USA");
  }, [selectedDepthMm, unitSystem]);

  const handleApply = () => {
    if (selectedDepthMm !== null && selectedDur !== null) {
      onApply(selectedDepthMm, selectedDur / 60);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="w-4 h-4 text-primary" />
          Dubai DDF Lookup
        </CardTitle>
        <CardDescription className="text-xs">
          Auto-populate depth from Dubai Municipality 2024 DDF table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ARI Selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Return Period (ARI)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DUBAI_DDF_ARI.map((ari) => (
              <Button
                key={ari}
                variant={selectedAri === ari ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2.5"
                onClick={() => setSelectedAri(ari)}
              >
                {ari}-yr
              </Button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Storm Duration
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DUBAI_DDF_DURATIONS_MIN.map((dur) => (
              <Button
                key={dur}
                variant={selectedDur === dur ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setSelectedDur(dur)}
              >
                {formatDuration(dur)}
              </Button>
            ))}
          </div>
        </div>

        {/* Result */}
        {displayDepth !== null && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground">
                  {selectedAri}-yr, {formatDuration(selectedDur!)} storm
                </span>
                <div className="text-lg font-bold text-primary">
                  {formatDepth(displayDepth, unitSystem)}
                </div>
              </div>
              <Button size="sm" onClick={handleApply} className="gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Source: Dubai Municipality Modified FEH Guidelines (2024)
            </p>
          </div>
        )}

        {/* Compact DDF + IDF Table */}
        {selectedAri !== null && (
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              View full {selectedAri}-yr DDF &amp; IDF table
            </summary>
            <div className="mt-2 overflow-x-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-1 px-2 whitespace-nowrap">Duration</TableHead>
                    {DUBAI_DDF_DURATIONS_MIN.map((d) => (
                      <TableHead key={d} className={`text-xs py-1 px-1.5 text-center whitespace-nowrap ${d === selectedDur ? 'bg-primary/10' : ''}`}>
                        {formatDuration(d)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-xs py-1 px-2 font-medium whitespace-nowrap">
                      Depth ({unitSystem === "SI" ? "mm" : "in"})
                    </TableCell>
                    {DUBAI_DDF_DURATIONS_MIN.map((d, i) => {
                      const depthMm = DUBAI_DDF_DEPTHS[ariIdx][i];
                      const display = unitSystem === "SI" ? depthMm : convertDepth(depthMm, "SI", "USA");
                      return (
                        <TableCell
                          key={d}
                          className={`text-xs py-1 px-1.5 text-center tabular-nums ${d === selectedDur ? 'bg-primary/10 font-bold text-primary' : ''}`}
                        >
                          {display.toFixed(unitSystem === "SI" ? 1 : 2)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-1 px-2 font-medium whitespace-nowrap">
                      Intensity ({unitSystem === "SI" ? "mm/hr" : "in/hr"})
                    </TableCell>
                    {DUBAI_DDF_DURATIONS_MIN.map((d, i) => {
                      const depthMm = DUBAI_DDF_DEPTHS[ariIdx][i];
                      const intensityMmHr = depthMm / (d / 60);
                      const display = unitSystem === "SI" ? intensityMmHr : convertDepth(intensityMmHr, "SI", "USA");
                      return (
                        <TableCell
                          key={d}
                          className={`text-xs py-1 px-1.5 text-center tabular-nums ${d === selectedDur ? 'bg-primary/10 font-bold text-primary' : ''}`}
                        >
                          {display.toFixed(unitSystem === "SI" ? 1 : 2)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
