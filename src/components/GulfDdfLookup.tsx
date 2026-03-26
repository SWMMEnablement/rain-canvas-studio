import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Zap } from "lucide-react";
import { type UnitSystem, convertDepth, formatDepth } from "@/lib/unitConversions";

/* ------------------------------------------------------------------ */
/*  Gulf-state DDF tables                                              */
/* ------------------------------------------------------------------ */

interface DdfTable {
  label: string;
  source: string;
  durations: readonly number[];       // minutes
  aris: readonly number[];            // years
  depths: number[][];                 // [ariIdx][durIdx] in mm
}

const DUBAI: DdfTable = {
  label: "Dubai Municipality",
  source: "Dubai Municipality Modified FEH Guidelines (2024)",
  durations: [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 720, 1440],
  aris: [2, 5, 10, 20, 25, 50, 100],
  depths: [
    [4.68, 7.02, 8.82, 9.92, 11.36, 12.64, 13.44, 14.78, 16.04, 17.63, 18.84, 19.69, 20.38, 24.70, 25.70],
    [7.62, 11.73, 14.80, 16.84, 19.61, 22.20, 23.89, 26.49, 28.68, 31.52, 33.63, 35.16, 36.41, 43.14, 46.20],
    [9.87, 15.56, 19.72, 22.64, 26.73, 30.67, 33.33, 37.20, 40.18, 44.17, 47.06, 49.21, 50.99, 59.37, 65.00],
    [13.05, 21.14, 26.91, 31.21, 37.40, 43.54, 47.78, 53.69, 57.88, 63.62, 67.69, 70.81, 73.39, 83.92, 94.00],
    [13.90, 22.72, 28.98, 33.73, 40.62, 47.51, 52.31, 58.91, 63.46, 69.75, 74.18, 77.62, 80.44, 91.46, 103.20],
    [18.31, 29.93, 38.16, 44.41, 53.49, 62.57, 68.89, 77.57, 83.56, 91.85, 97.68, 102.21, 105.93, 120.43, 135.90],
    [23.79, 38.89, 49.59, 57.71, 69.51, 81.31, 89.52, 100.80, 108.59, 119.36, 126.94, 132.82, 137.66, 156.50, 176.60],
  ],
};

const ABU_DHABI: DdfTable = {
  label: "Abu Dhabi (ADM)",
  source: "Abu Dhabi Drainage Master Plan — ADM/UPC IDF (2020)",
  durations: [5, 10, 15, 20, 30, 60, 120, 180, 360, 720, 1440],
  aris: [2, 5, 10, 25, 50, 100],
  depths: [
    [3.8, 5.7, 7.2, 8.1, 9.4, 11.2, 13.4, 14.8, 17.2, 20.6, 23.0],
    [6.4, 9.9, 12.5, 14.3, 16.8, 20.4, 24.8, 27.6, 32.5, 38.4, 43.8],
    [8.5, 13.4, 17.1, 19.7, 23.4, 29.0, 35.6, 39.8, 47.0, 55.0, 63.5],
    [11.8, 19.3, 24.8, 28.9, 34.8, 43.8, 54.2, 60.8, 72.0, 84.0, 97.5],
    [14.6, 24.2, 31.1, 36.4, 44.0, 55.8, 69.5, 78.0, 92.5, 107.5, 125.0],
    [17.8, 29.6, 38.2, 44.8, 54.4, 69.5, 87.0, 98.0, 116.0, 135.0, 157.0],
  ],
};

const QATAR: DdfTable = {
  label: "Qatar (Kahramaa/Ashghal)",
  source: "Qatar Public Works Authority (Ashghal) Drainage Design Manual (2020)",
  durations: [5, 10, 15, 20, 30, 60, 120, 180, 360, 720, 1440],
  aris: [2, 5, 10, 25, 50, 100],
  depths: [
    [3.2, 4.9, 6.2, 7.0, 8.2, 10.0, 12.2, 13.6, 16.0, 19.2, 21.6],
    [5.6, 8.8, 11.2, 12.9, 15.2, 18.8, 23.2, 26.0, 31.0, 36.8, 42.0],
    [7.6, 12.2, 15.6, 18.0, 21.6, 27.0, 33.6, 37.8, 45.0, 53.0, 61.0],
    [10.8, 17.6, 22.8, 26.6, 32.2, 41.0, 51.5, 58.0, 69.0, 81.0, 94.0],
    [13.4, 22.2, 28.8, 33.8, 41.0, 52.5, 66.0, 74.5, 89.0, 104.0, 121.0],
    [16.4, 27.4, 35.6, 41.8, 50.8, 65.5, 82.5, 93.5, 112.0, 131.0, 152.0],
  ],
};

const KUWAIT: DdfTable = {
  label: "Kuwait (MEW)",
  source: "Kuwait Ministry of Electricity & Water — IDF Guidelines (2019)",
  durations: [5, 10, 15, 20, 30, 60, 120, 180, 360, 720, 1440],
  aris: [2, 5, 10, 25, 50, 100],
  depths: [
    [2.8, 4.3, 5.5, 6.2, 7.3, 9.0, 11.0, 12.4, 14.8, 17.8, 20.2],
    [4.8, 7.6, 9.8, 11.3, 13.4, 16.8, 21.0, 23.6, 28.4, 33.6, 38.8],
    [6.6, 10.6, 13.7, 15.9, 19.1, 24.2, 30.4, 34.2, 41.0, 48.5, 56.2],
    [9.4, 15.4, 20.0, 23.4, 28.4, 36.4, 46.0, 52.0, 62.5, 74.0, 86.0],
    [11.8, 19.6, 25.4, 29.8, 36.2, 46.8, 59.2, 67.0, 80.5, 95.0, 110.5],
    [14.4, 24.0, 31.2, 36.8, 44.8, 58.0, 73.5, 83.5, 100.5, 118.5, 138.0],
  ],
};

const BAHRAIN: DdfTable = {
  label: "Bahrain (MET)",
  source: "Bahrain Meteorological Service — Rainfall IDF Analysis (2018)",
  durations: [5, 10, 15, 20, 30, 60, 120, 180, 360, 720, 1440],
  aris: [2, 5, 10, 25, 50, 100],
  depths: [
    [3.0, 4.6, 5.8, 6.6, 7.8, 9.5, 11.6, 13.0, 15.4, 18.5, 21.0],
    [5.2, 8.2, 10.5, 12.1, 14.3, 17.8, 22.0, 24.8, 29.6, 35.2, 40.5],
    [7.1, 11.4, 14.7, 17.0, 20.4, 25.6, 32.0, 36.0, 43.0, 50.8, 58.5],
    [10.2, 16.6, 21.5, 25.1, 30.4, 38.8, 49.0, 55.5, 66.0, 78.0, 90.5],
    [12.8, 21.2, 27.5, 32.3, 39.2, 50.2, 63.5, 71.8, 86.0, 101.0, 117.5],
    [15.6, 26.0, 33.8, 39.8, 48.4, 62.5, 79.0, 89.5, 107.5, 126.5, 147.0],
  ],
};

const OMAN: DdfTable = {
  label: "Oman (DGMAN)",
  source: "Oman Directorate General of Meteorology & Air Navigation — IDF Curves (2021)",
  durations: [5, 10, 15, 20, 30, 60, 120, 180, 360, 720, 1440],
  aris: [2, 5, 10, 25, 50, 100],
  depths: [
    [3.5, 5.3, 6.7, 7.6, 8.9, 10.8, 13.0, 14.5, 17.0, 20.2, 22.8],
    [6.0, 9.4, 12.0, 13.8, 16.2, 20.0, 24.5, 27.4, 32.5, 38.0, 43.5],
    [8.2, 13.0, 16.6, 19.2, 23.0, 28.5, 35.2, 39.5, 47.0, 55.0, 63.5],
    [11.5, 18.8, 24.2, 28.2, 34.0, 42.8, 53.5, 60.2, 71.5, 84.0, 97.0],
    [14.2, 23.6, 30.5, 35.8, 43.4, 55.0, 69.0, 77.5, 92.0, 108.0, 125.5],
    [17.4, 29.0, 37.6, 44.2, 53.8, 68.5, 86.5, 97.5, 116.0, 136.0, 158.0],
  ],
};

export const GULF_DDF_TABLES: { key: string; table: DdfTable }[] = [
  { key: "dubai", table: DUBAI },
  { key: "abudhabi", table: ABU_DHABI },
  { key: "qatar", table: QATAR },
  { key: "kuwait", table: KUWAIT },
  { key: "bahrain", table: BAHRAIN },
  { key: "oman", table: OMAN },
];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */
function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  if (min === 60) return "1 hr";
  if (min < 1440) return `${min / 60} hr`;
  return "24 hr";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface GulfDdfLookupProps {
  unitSystem: UnitSystem;
  onApply: (depthMm: number, durationHr: number) => void;
}

export function GulfDdfLookup({ unitSystem, onApply }: GulfDdfLookupProps) {
  const [activeRegion, setActiveRegion] = useState<string>("dubai");
  const [selectedAri, setSelectedAri] = useState<number | null>(null);
  const [selectedDur, setSelectedDur] = useState<number | null>(null);

  const table = useMemo(
    () => GULF_DDF_TABLES.find((t) => t.key === activeRegion)!.table,
    [activeRegion],
  );

  // Reset selections when region changes
  const handleRegionChange = (key: string) => {
    setActiveRegion(key);
    setSelectedAri(null);
    setSelectedDur(null);
  };

  const ariIdx = selectedAri !== null ? (table.aris as readonly number[]).indexOf(selectedAri) : -1;
  const durIdx = selectedDur !== null ? (table.durations as readonly number[]).indexOf(selectedDur) : -1;
  const selectedDepthMm = ariIdx >= 0 && durIdx >= 0 ? table.depths[ariIdx][durIdx] : null;

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
          Gulf Region DDF Lookup
        </CardTitle>
        <CardDescription className="text-xs">
          Auto-populate depth from official regional DDF/IDF tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Region
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GULF_DDF_TABLES.map(({ key, table: t }) => (
              <Button
                key={key}
                variant={activeRegion === key ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2.5"
                onClick={() => handleRegionChange(key)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* ARI Selection */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Return Period (ARI)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {table.aris.map((ari) => (
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
            {table.durations.map((dur) => (
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
              Source: {table.source}
            </p>
          </div>
        )}

        {/* Full DDF + IDF Table */}
        {selectedAri !== null && ariIdx >= 0 && (
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              View full {selectedAri}-yr DDF &amp; IDF table
            </summary>
            <div className="mt-2 overflow-x-auto rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-1 px-2 whitespace-nowrap">Duration</TableHead>
                    {table.durations.map((d) => (
                      <TableHead
                        key={d}
                        className={`text-xs py-1 px-1.5 text-center whitespace-nowrap ${d === selectedDur ? "bg-primary/10" : ""}`}
                      >
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
                    {table.durations.map((d, i) => {
                      const depthMm = table.depths[ariIdx][i];
                      const display = unitSystem === "SI" ? depthMm : convertDepth(depthMm, "SI", "USA");
                      return (
                        <TableCell
                          key={d}
                          className={`text-xs py-1 px-1.5 text-center tabular-nums ${d === selectedDur ? "bg-primary/10 font-bold text-primary" : ""}`}
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
                    {table.durations.map((d, i) => {
                      const depthMm = table.depths[ariIdx][i];
                      const intensityMmHr = depthMm / (d / 60);
                      const display = unitSystem === "SI" ? intensityMmHr : convertDepth(intensityMmHr, "SI", "USA");
                      return (
                        <TableCell
                          key={d}
                          className={`text-xs py-1 px-1.5 text-center tabular-nums ${d === selectedDur ? "bg-primary/10 font-bold text-primary" : ""}`}
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
