import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Pencil, 
  RotateCcw, 
  Download, 
  Upload,
  Eraser,
  MousePointer2,
  Grid3X3,
  Undo2,
  Redo2,
  Mountain,
  TrendingUp,
  TrendingDown,
  Equal
} from "lucide-react";
import { type UnitSystem, formatDepth } from "@/lib/unitConversions";
import { cn } from "@/lib/utils";

interface CustomPatternEditorProps {
  duration: number;
  timeStep: number;
  totalDepth: number;
  unitSystem: UnitSystem;
  onPatternChange: (intensities: number[]) => void;
  initialPattern?: number[];
}

type EditorTool = 'draw' | 'smooth' | 'select';
type PresetShape = 'flat' | 'peak-center' | 'peak-early' | 'peak-late' | 'double-peak';

const PRESET_SHAPES: { id: PresetShape; name: string; icon: React.ReactNode }[] = [
  { id: 'flat', name: 'Flat', icon: <Equal className="w-4 h-4" /> },
  { id: 'peak-center', name: 'Center Peak', icon: <Mountain className="w-4 h-4" /> },
  { id: 'peak-early', name: 'Early Peak', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'peak-late', name: 'Late Peak', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'double-peak', name: 'Double Peak', icon: <span className="text-xs font-bold">⩗</span> },
];

export function CustomPatternEditor({
  duration,
  timeStep,
  totalDepth,
  unitSystem,
  onPatternChange,
  initialPattern,
}: CustomPatternEditorProps) {
  const numSteps = Math.ceil((duration * 60) / timeStep);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Initialize with flat distribution
  const [intensities, setIntensities] = useState<number[]>(() => {
    if (initialPattern && initialPattern.length === numSteps) {
      return [...initialPattern];
    }
    const baseIntensity = totalDepth / duration;
    return Array(numSteps).fill(baseIntensity);
  });
  
  const [history, setHistory] = useState<number[][]>([intensities]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<EditorTool>('draw');
  const [brushSize, setBrushSize] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Recalculate when parameters change
  useEffect(() => {
    const newNumSteps = Math.ceil((duration * 60) / timeStep);
    if (newNumSteps !== intensities.length) {
      const baseIntensity = totalDepth / duration;
      const newIntensities = Array(newNumSteps).fill(baseIntensity);
      setIntensities(newIntensities);
      setHistory([newIntensities]);
      setHistoryIndex(0);
    }
  }, [duration, timeStep, totalDepth]);

  // Notify parent of changes
  useEffect(() => {
    onPatternChange(intensities);
  }, [intensities, onPatternChange]);

  const saveToHistory = useCallback((newIntensities: number[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newIntensities]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setIntensities([...history[historyIndex - 1]]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setIntensities([...history[historyIndex + 1]]);
    }
  }, [historyIndex, history]);

  const applyPreset = useCallback((preset: PresetShape) => {
    const baseIntensity = totalDepth / duration;
    let newIntensities: number[] = [];

    switch (preset) {
      case 'flat':
        newIntensities = Array(numSteps).fill(baseIntensity);
        break;
      case 'peak-center':
        newIntensities = Array(numSteps).fill(0).map((_, i) => {
          const t = i / (numSteps - 1);
          const peak = 2 * baseIntensity * (1 - Math.abs(2 * t - 1));
          return Math.max(peak, baseIntensity * 0.2);
        });
        break;
      case 'peak-early':
        newIntensities = Array(numSteps).fill(0).map((_, i) => {
          const t = i / (numSteps - 1);
          const peak = 2 * baseIntensity * Math.exp(-3 * t);
          return Math.max(peak, baseIntensity * 0.2);
        });
        break;
      case 'peak-late':
        newIntensities = Array(numSteps).fill(0).map((_, i) => {
          const t = i / (numSteps - 1);
          const peak = 2 * baseIntensity * Math.exp(-3 * (1 - t));
          return Math.max(peak, baseIntensity * 0.2);
        });
        break;
      case 'double-peak':
        newIntensities = Array(numSteps).fill(0).map((_, i) => {
          const t = i / (numSteps - 1);
          const peak1 = 1.5 * baseIntensity * Math.exp(-Math.pow((t - 0.3) * 5, 2));
          const peak2 = 1.8 * baseIntensity * Math.exp(-Math.pow((t - 0.7) * 5, 2));
          return Math.max(peak1 + peak2, baseIntensity * 0.2);
        });
        break;
    }

    // Normalize to maintain total depth
    const sum = newIntensities.reduce((a, b) => a + b, 0) * (timeStep / 60);
    const scale = totalDepth / sum;
    newIntensities = newIntensities.map(v => v * scale);

    setIntensities(newIntensities);
    saveToHistory(newIntensities);
  }, [numSteps, totalDepth, duration, timeStep, saveToHistory]);

  const reset = useCallback(() => {
    const baseIntensity = totalDepth / duration;
    const newIntensities = Array(numSteps).fill(baseIntensity);
    setIntensities(newIntensities);
    saveToHistory(newIntensities);
  }, [numSteps, totalDepth, duration, saveToHistory]);

  const smoothPattern = useCallback(() => {
    const smoothed = intensities.map((val, i) => {
      const start = Math.max(0, i - 1);
      const end = Math.min(numSteps, i + 2);
      const slice = intensities.slice(start, end);
      return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
    
    // Re-normalize
    const sum = smoothed.reduce((a, b) => a + b, 0) * (timeStep / 60);
    const scale = totalDepth / sum;
    const normalized = smoothed.map(v => v * scale);
    
    setIntensities(normalized);
    saveToHistory(normalized);
  }, [intensities, numSteps, totalDepth, timeStep, saveToHistory]);

  const handleBarInteraction = useCallback((index: number, clientY: number) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const chartTop = rect.top + 40; // Account for header area
    const chartHeight = rect.height - 80; // Account for header and footer
    
    // Calculate intensity based on Y position
    const maxIntensity = Math.max(...intensities) * 1.5 || (totalDepth / duration) * 2;
    const yRatio = 1 - Math.max(0, Math.min(1, (clientY - chartTop) / chartHeight));
    const newIntensity = yRatio * maxIntensity;

    setIntensities(prev => {
      const newIntensities = [...prev];
      
      // Apply brush size
      const halfBrush = Math.floor(brushSize / 2);
      for (let offset = -halfBrush; offset <= halfBrush; offset++) {
        const targetIndex = index + offset;
        if (targetIndex >= 0 && targetIndex < prev.length) {
          const distance = Math.abs(offset);
          const falloff = 1 - (distance / (brushSize + 1));
          newIntensities[targetIndex] = prev[targetIndex] + (newIntensity - prev[targetIndex]) * falloff;
        }
      }
      
      return newIntensities;
    });
  }, [intensities, totalDepth, duration, brushSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (selectedTool !== 'draw') return;
    setIsDrawing(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const barWidth = rect.width / numSteps;
    const index = Math.floor(x / barWidth);
    
    if (index >= 0 && index < numSteps) {
      handleBarInteraction(index, e.clientY);
    }
  }, [selectedTool, numSteps, handleBarInteraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || selectedTool !== 'draw') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const barWidth = rect.width / numSteps;
    const index = Math.floor(x / barWidth);
    
    if (index >= 0 && index < numSteps) {
      handleBarInteraction(index, e.clientY);
    }
  }, [isDrawing, selectedTool, numSteps, handleBarInteraction]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory(intensities);
    }
  }, [isDrawing, intensities, saveToHistory]);

  // Calculate chart dimensions
  const maxIntensity = Math.max(...intensities) * 1.2 || (totalDepth / duration) * 2;
  const chartHeight = 250;
  const unit = unitSystem === 'USA' ? 'in/hr' : 'mm/hr';
  const currentTotal = intensities.reduce((a, b) => a + b, 0) * (timeStep / 60);

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Custom Pattern Editor
            </CardTitle>
            <CardDescription>
              Draw your rainfall distribution by clicking and dragging
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Depth</p>
            <p className={cn(
              "text-lg font-bold",
              Math.abs(currentTotal - totalDepth) < 0.01 ? "text-primary" : "text-warning"
            )}>
              {formatDepth(currentTotal, unitSystem)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
          {/* Tools */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2 border-border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'draw' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedTool('draw')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Draw</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={smoothPattern}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Smooth</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-2 border-r pr-2 mr-2 border-border">
            <Label className="text-xs">Brush:</Label>
            <Slider
              value={[brushSize]}
              onValueChange={(v) => setBrushSize(v[0])}
              min={1}
              max={5}
              step={1}
              className="w-16"
            />
            <span className="text-xs w-4">{brushSize}</span>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2 border-border">
            <Select onValueChange={(v) => applyPreset(v as PresetShape)}>
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="Presets" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_SHAPES.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <span>{preset.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Grid3X3 className={cn("h-4 w-4", showGrid && "text-primary")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Grid</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={reset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={cn(
            "relative w-full rounded-lg border bg-card overflow-hidden select-none",
            selectedTool === 'draw' && "cursor-crosshair"
          )}
          style={{ height: chartHeight }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-muted-foreground p-1">
            <span>{maxIntensity.toFixed(1)}</span>
            <span>{(maxIntensity / 2).toFixed(1)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="absolute left-12 right-2 top-2 bottom-8 flex items-end">
            {/* Grid lines */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                {[0.25, 0.5, 0.75].map(ratio => (
                  <div
                    key={ratio}
                    className="absolute w-full border-t border-dashed border-border/50"
                    style={{ bottom: `${ratio * 100}%` }}
                  />
                ))}
                {numSteps <= 24 && Array.from({ length: numSteps - 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full border-l border-dashed border-border/30"
                    style={{ left: `${((i + 1) / numSteps) * 100}%` }}
                  />
                ))}
              </div>
            )}

            {/* Bars */}
            {intensities.map((intensity, index) => {
              const heightPercent = (intensity / maxIntensity) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end px-[1px]"
                  style={{ height: '100%' }}
                >
                  <div
                    className={cn(
                      "w-full bg-primary/80 rounded-t transition-all duration-75",
                      isDrawing && "transition-none"
                    )}
                    style={{ height: `${Math.max(heightPercent, 1)}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute left-12 right-2 bottom-0 h-6 flex justify-between text-xs text-muted-foreground px-1">
            <span>0</span>
            <span>{(duration / 2).toFixed(1)}h</span>
            <span>{duration}h</span>
          </div>

          {/* Y-axis unit */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
            {unit}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Peak Intensity</p>
            <p className="font-semibold text-primary">
              {Math.max(...intensities).toFixed(2)} {unit}
            </p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Avg Intensity</p>
            <p className="font-semibold text-primary">
              {(intensities.reduce((a, b) => a + b, 0) / numSteps).toFixed(2)} {unit}
            </p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Time Steps</p>
            <p className="font-semibold text-primary">{numSteps}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
