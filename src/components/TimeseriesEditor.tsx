import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Scissors, Combine, Download, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  Brush,
} from "recharts";
import {
  type RainfallDataPoint,
  type ParsedRainfallData,
  trimTimeseries,
  resampleTimeseries,
} from "@/lib/rainfallParsers";
import { type UnitSystem } from "@/lib/unitConversions";

interface TimeseriesEditorProps {
  data: ParsedRainfallData;
  unitSystem: UnitSystem;
  onDataChange: (newData: RainfallDataPoint[]) => void;
  onExport?: (data: RainfallDataPoint[], name: string) => void;
}

interface SelectionRange {
  start: number;
  end: number;
}

export function TimeseriesEditor({ data, unitSystem, onDataChange, onExport }: TimeseriesEditorProps) {
  const [editedData, setEditedData] = useState<RainfallDataPoint[]>(data.data);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [history, setHistory] = useState<RainfallDataPoint[][]>([data.data]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [editMode, setEditMode] = useState<'select' | 'draw'>('select');
  const [targetTimeStep, setTargetTimeStep] = useState(data.metadata.timeStep || 15);
  const chartRef = useRef<HTMLDivElement>(null);

  // Sync with parent data changes
  useEffect(() => {
    setEditedData(data.data);
    setHistory([data.data]);
    setHistoryIndex(0);
  }, [data.data]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return editedData.map(d => ({
      time: d.time,
      timeLabel: `${Math.floor(d.time / 60)}:${String(d.time % 60).padStart(2, '0')}`,
      intensity: d.intensity,
      cumulative: d.cumulative || 0,
    }));
  }, [editedData]);

  // Statistics
  const stats = useMemo(() => {
    if (editedData.length === 0) return null;
    
    const intensities = editedData.map(d => d.intensity);
    const maxIntensity = Math.max(...intensities);
    const peakIndex = editedData.findIndex(d => d.intensity === maxIntensity);
    const peakTime = editedData[peakIndex]?.time || 0;
    const totalDepth = editedData[editedData.length - 1]?.cumulative || 0;
    const duration = editedData[editedData.length - 1]?.time || 0;
    
    return { maxIntensity, peakTime, totalDepth, duration };
  }, [editedData]);

  // Push to history
  const pushHistory = useCallback((newData: RainfallDataPoint[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setEditedData(newData);
    onDataChange(newData);
  }, [history, historyIndex, onDataChange]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedData(history[historyIndex - 1]);
      onDataChange(history[historyIndex - 1]);
    }
  }, [history, historyIndex, onDataChange]);

  // Handle chart mouse events for selection
  const handleMouseDown = useCallback((e: any) => {
    if (editMode !== 'select' || !e?.activeLabel) return;
    const time = parseInt(e.activeLabel) || 0;
    setIsSelecting(true);
    setSelectionStart(time);
    setSelection({ start: time, end: time });
  }, [editMode]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isSelecting || selectionStart === null || !e?.activeLabel) return;
    const time = parseInt(e.activeLabel) || 0;
    setSelection({
      start: Math.min(selectionStart, time),
      end: Math.max(selectionStart, time),
    });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // Trim to selection
  const handleTrim = useCallback(() => {
    if (!selection) return;
    const trimmed = trimTimeseries(editedData, selection.start, selection.end);
    pushHistory(trimmed);
    setSelection(null);
  }, [selection, editedData, pushHistory]);

  // Delete selection
  const handleDeleteSelection = useCallback(() => {
    if (!selection) return;
    const filtered = editedData.filter(
      d => d.time < selection.start || d.time > selection.end
    );
    
    // Recalculate time offsets and cumulative
    let cumulative = 0;
    const timeStep = filtered.length > 1 ? filtered[1].time - filtered[0].time : 15;
    const adjusted = filtered.map((d, i) => {
      if (i > 0) cumulative += d.intensity * (timeStep / 60);
      return { ...d, time: i * timeStep, cumulative };
    });
    
    pushHistory(adjusted);
    setSelection(null);
  }, [selection, editedData, pushHistory]);

  // Resample
  const handleResample = useCallback(() => {
    const resampled = resampleTimeseries(editedData, targetTimeStep);
    pushHistory(resampled);
  }, [editedData, targetTimeStep, pushHistory]);

  // Export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(editedData, data.metadata.filename.replace(/\.[^.]+$/, '_edited'));
    }
  }, [editedData, data.metadata.filename, onExport]);

  const intensityUnit = unitSystem === 'USA' ? 'in/hr' : 'mm/hr';
  const depthUnit = unitSystem === 'USA' ? 'in' : 'mm';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={editMode === 'select' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEditMode('select')}
                className="gap-1"
              >
                <Move className="w-4 h-4" />
                <span className="hidden sm:inline">Select</span>
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Selection Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTrim}
              disabled={!selection}
              className="gap-1"
            >
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Trim to Selection</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelection}
              disabled={!selection}
              className="gap-1"
            >
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Selection</span>
            </Button>

            <div className="h-6 w-px bg-border" />

            {/* Resample */}
            <div className="flex items-center gap-2">
              <Label htmlFor="timestep" className="text-sm whitespace-nowrap">
                Resample:
              </Label>
              <Input
                id="timestep"
                type="number"
                value={targetTimeStep}
                onChange={(e) => setTargetTimeStep(parseInt(e.target.value) || 15)}
                className="w-16 h-8"
                min={1}
                max={120}
              />
              <span className="text-sm text-muted-foreground">min</span>
              <Button variant="outline" size="sm" onClick={handleResample}>
                Apply
              </Button>
            </div>

            <div className="flex-1" />

            {/* Undo / Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
              className="gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Undo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-card border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="font-semibold text-primary">
              {(stats.duration / 60).toFixed(1)} hr
            </p>
          </div>
          <div className="text-center p-3 bg-card border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Depth</p>
            <p className="font-semibold text-primary">
              {stats.totalDepth.toFixed(2)} {depthUnit}
            </p>
          </div>
          <div className="text-center p-3 bg-card border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Peak Intensity</p>
            <p className="font-semibold text-primary">
              {stats.maxIntensity.toFixed(2)} {intensityUnit}
            </p>
          </div>
          <div className="text-center p-3 bg-card border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Peak Time</p>
            <p className="font-semibold text-primary">
              {Math.floor(stats.peakTime / 60)}:{String(stats.peakTime % 60).padStart(2, '0')}
            </p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Timeseries Editor</CardTitle>
              <CardDescription>
                {selection 
                  ? `Selection: ${Math.floor(selection.start / 60)}:${String(selection.start % 60).padStart(2, '0')} - ${Math.floor(selection.end / 60)}:${String(selection.end % 60).padStart(2, '0')}`
                  : 'Click and drag to select a time range'}
              </CardDescription>
            </div>
            {selection && (
              <Button variant="ghost" size="sm" onClick={() => setSelection(null)}>
                Clear Selection
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(value) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  yAxisId="intensity"
                  orientation="left"
                  stroke="hsl(var(--primary))"
                  fontSize={12}
                  label={{
                    value: `Intensity (${intensityUnit})`,
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <YAxis
                  yAxisId="cumulative"
                  orientation="right"
                  stroke="hsl(var(--accent-foreground))"
                  fontSize={12}
                  label={{
                    value: `Cumulative (${depthUnit})`,
                    angle: 90,
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(3),
                    name === 'intensity' ? `Intensity (${intensityUnit})` : `Cumulative (${depthUnit})`
                  ]}
                  labelFormatter={(label) => `Time: ${Math.floor(label / 60)}:${String(label % 60).padStart(2, '0')}`}
                />

                {/* Selection highlight */}
                {selection && (
                  <ReferenceArea
                    yAxisId="intensity"
                    x1={selection.start}
                    x2={selection.end}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Peak indicator */}
                {stats && (
                  <ReferenceLine
                    yAxisId="intensity"
                    x={stats.peakTime}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="5 5"
                    label={{
                      value: 'Peak',
                      position: 'top',
                      fill: 'hsl(var(--destructive))',
                      fontSize: 11
                    }}
                  />
                )}

                <Bar
                  yAxisId="intensity"
                  dataKey="intensity"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="cumulative"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={2}
                  dot={false}
                />

                {/* Brush for zooming */}
                <Brush
                  dataKey="time"
                  height={30}
                  stroke="hsl(var(--primary))"
                  tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Move className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Editing Tips</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Click and drag on the chart to select a time range</li>
                <li>• Use "Trim to Selection" to keep only the selected portion</li>
                <li>• Use the brush at the bottom to zoom into specific periods</li>
                <li>• Resample to change the time step (interpolates values)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
