import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Target, TrendingUp, Award, AlertCircle, Scissors, CloudRain } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { type RainfallDataPoint } from "@/lib/rainfallParsers";
import { extractStormEvents, type StormEvent } from "@/lib/stormEventExtractor";
import { EventHyetograph } from "@/components/EventHyetograph";

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
  peakError: number;
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
  { id: 'balanced', name: 'Balanced Storm' },
  { id: 'fdot1', name: 'FDOT Zone 1' },
  { id: 'fdot2', name: 'FDOT Zone 2' },
  { id: 'fdot3', name: 'FDOT Zone 3' },
  { id: 'fdot4', name: 'FDOT Zone 4' },
  { id: 'fdot5', name: 'FDOT Zone 5' },
  { id: 'txdot', name: 'TxDOT' },
  { id: 'yen_chow', name: 'Yen & Chow' },
  { id: 'noaa_a14', name: 'NOAA Atlas 14' },
  { id: 'udfcd', name: 'UDFCD Denver' },
  { id: 'usace_sps', name: 'USACE SPS' },
  { id: 'feh', name: 'FEH (UK)' },
  { id: 'euler1', name: 'Euler Type I' },
  { id: 'euler2', name: 'Euler Type II' },
  { id: 'desbordes_double', name: 'Double Triangle' },
  { id: 'canadian', name: 'Canadian CDA' },
  { id: 'singapore_pub', name: 'Singapore PUB' },
  { id: 'china_gb50014', name: 'China GB 50014' },
  { id: 'china_prd', name: 'China PRD' },
  { id: 'india_imd', name: 'India IMD' },
  { id: 'india_coastal', name: 'India Coastal' },
  { id: 'japan_amedas', name: 'Japan AMeDAS' },
  { id: 'japan_baiu', name: 'Japan Baiu' },
  { id: 'japan_typhoon', name: 'Japan Typhoon' },
  { id: 'korea_kma', name: 'Korea KMA' },
];

// Duration threshold: records longer than 48 hours need event extraction
const LONG_RECORD_THRESHOLD_MIN = 48 * 60;

function runMatching(data: RainfallDataPoint[], timeStep: number): MatchResult[] {
  if (data.length < 3) return [];

  const durationMin = data[data.length - 1].time - data[0].time;
  const durationHr = durationMin / 60;
  const totalDepth = data.reduce((sum, d) => sum + d.intensity * (timeStep / 60), 0);
  if (durationMin <= 0 || totalDepth <= 0) return [];

  const numSteps = data.length;

  // Compute observed cumulative fractions
  const observedCumFractions: number[] = [];
  let cumDepth = 0;
  for (const d of data) {
    cumDepth += d.intensity * (timeStep / 60);
    observedCumFractions.push(cumDepth / totalDepth);
  }

  return syntheticPatterns.map(p => {
    const synIntensities = generateRainfallData(p.id, totalDepth, durationHr, timeStep);

    const synCumFractions: number[] = [];
    let synCum = 0;
    const synTotal = synIntensities.reduce((s, v) => s + v * (timeStep / 60), 0);
    const effectiveTotal = synTotal > 0 ? synTotal : 1;

    const len = Math.min(numSteps, synIntensities.length);
    for (let i = 0; i < len; i++) {
      synCum += synIntensities[i] * (timeStep / 60);
      synCumFractions.push(synCum / effectiveTotal);
    }

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

    const obsPeak = Math.max(...data.map(d => d.intensity));
    const synPeak = Math.max(...synIntensities.slice(0, len));
    const peakError = obsPeak > 0 ? Math.abs(synPeak - obsPeak) / obsPeak * 100 : 0;

    return { id: p.id, name: p.name, r2, rmse, peakError };
  }).sort((a, b) => b.r2 - a.r2);
}

export function HistoricalStormMatching({ data, metadata }: HistoricalStormMatchingProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [dryGapHours, setDryGapHours] = useState(6);

  const durationMin = data.length > 1 ? data[data.length - 1].time - data[0].time : 0;
  const isLongRecord = durationMin > LONG_RECORD_THRESHOLD_MIN;
  const timeStep = metadata.timeStep || (data.length > 1 ? Math.round((data[data.length - 1].time - data[0].time) / (data.length - 1)) : 5);

  // Extract storm events from long records
  const events = useMemo((): StormEvent[] => {
    if (!isLongRecord) return [];
    return extractStormEvents(data, dryGapHours * 60, 0.01, 3);
  }, [data, isLongRecord, dryGapHours]);

  // Auto-select largest event
  const activeEventId = selectedEventId || (events.length > 0 ? String(events[0].id) : '');

  // Determine which data to match
  const matchData = useMemo((): RainfallDataPoint[] => {
    if (!isLongRecord) return data;
    const event = events.find(e => String(e.id) === activeEventId);
    return event ? event.dataPoints : [];
  }, [data, isLongRecord, events, activeEventId]);

  const matches = useMemo((): MatchResult[] => {
    if (matchData.length < 3) return [];
    const effectiveTimeStep = isLongRecord ? timeStep : (metadata.timeStep || timeStep);
    return runMatching(matchData, effectiveTimeStep);
  }, [matchData, isLongRecord, timeStep, metadata.timeStep]);

  // If long record with no events found
  if (isLongRecord && events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground space-y-4">
          <Scissors className="w-8 h-8 mx-auto opacity-50" />
          <p className="font-medium">No storm events detected</p>
          <p className="text-sm">
            Your record spans {(durationMin / 60).toFixed(0)} hours. 
            Try reducing the dry gap threshold to detect smaller events.
          </p>
          <div className="max-w-xs mx-auto space-y-2">
            <label className="text-xs">Dry gap threshold: {dryGapHours} hours</label>
            <Slider
              value={[dryGapHours]}
              onValueChange={([v]) => setDryGapHours(v)}
              min={1}
              max={24}
              step={1}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0 && !isLongRecord) {
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

  const selectedEvent = events.find(e => String(e.id) === activeEventId);

  return (
    <div className="space-y-4">
      {/* Event extraction panel for long records */}
      {isLongRecord && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-600" />
              Storm Event Extraction
            </CardTitle>
            <CardDescription>
              Your record spans <strong>{(durationMin / 60).toFixed(0)} hours</strong> ({(durationMin / 60 / 24).toFixed(1)} days). 
              Individual storm events have been automatically extracted for matching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Select storm event</label>
                <Select value={activeEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={String(event.id)}>
                        Event {event.id}: {event.totalDepth.toFixed(2)} in, {(event.duration / 60).toFixed(1)} hr, 
                        peak {event.peakIntensity.toFixed(2)} in/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48 space-y-2">
                <label className="text-xs text-muted-foreground">
                  Dry gap: {dryGapHours} hr
                </label>
                <Slider
                  value={[dryGapHours]}
                  onValueChange={([v]) => { setDryGapHours(v); setSelectedEventId(''); }}
                  min={1}
                  max={24}
                  step={1}
                />
              </div>
            </div>

            {/* Event summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Events Found</p>
                <p className="font-bold text-primary">{events.length}</p>
              </div>
              {selectedEvent && (
                <>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{(selectedEvent.duration / 60).toFixed(1)} hr</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Depth</p>
                    <p className="font-semibold">{selectedEvent.totalDepth.toFixed(2)} in</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Data Points</p>
                    <p className="font-semibold">{selectedEvent.dataPoints.length}</p>
                  </div>
                </>
              )}
            </div>

            {/* Hyetograph preview */}
            {selectedEvent && selectedEvent.dataPoints.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Event Hyetograph Preview</p>
                <EventHyetograph data={selectedEvent.dataPoints} height={140} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Match results */}
      {matches.length > 0 && best && second && third && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Historical Storm Matching
            </CardTitle>
            <CardDescription>
              Comparing {isLongRecord && selectedEvent
                ? <><strong>Event {selectedEvent.id}</strong> ({selectedEvent.dataPoints.length} points, {(selectedEvent.duration / 60).toFixed(1)} hr)</>
                : <strong>{metadata.filename}</strong>
              } against {syntheticPatterns.length} synthetic patterns
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
      )}

      {matches.length === 0 && isLongRecord && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select a storm event above to run matching analysis.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
