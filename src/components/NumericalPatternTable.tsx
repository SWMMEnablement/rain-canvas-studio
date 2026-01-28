import { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Table2, 
  Download, 
  Upload,
  Copy,
  Check,
  RefreshCw,
  Lock,
  LockOpen,
  AlertTriangle
} from "lucide-react";
import { type UnitSystem, convertIntensity, getIntensityUnit, formatDepth } from "@/lib/unitConversions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NumericalPatternTableProps {
  intensities: number[];
  duration: number;
  timeStep: number;
  totalDepth: number;
  unitSystem: UnitSystem;
  onIntensitiesChange: (intensities: number[]) => void;
}

export function NumericalPatternTable({
  intensities,
  duration,
  timeStep,
  totalDepth,
  unitSystem,
  onIntensitiesChange,
}: NumericalPatternTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [lockNormalization, setLockNormalization] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numSteps = intensities.length;
  const intensityUnit = getIntensityUnit(unitSystem);

  // Calculate current total depth from intensities
  const currentTotal = useMemo(() => {
    return intensities.reduce((sum, val) => sum + val, 0) * (timeStep / 60);
  }, [intensities, timeStep]);

  // Check if depth matches target
  const depthMismatch = useMemo(() => {
    return Math.abs(currentTotal - totalDepth) > 0.01;
  }, [currentTotal, totalDepth]);

  // Generate time labels for each step
  const timeLabels = useMemo(() => {
    return intensities.map((_, index) => {
      const totalMinutes = index * timeStep;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });
  }, [intensities.length, timeStep]);

  // Handle cell click to start editing
  const handleCellClick = useCallback((index: number, currentValue: number) => {
    const displayValue = unitSystem === 'USA' 
      ? currentValue.toFixed(4)
      : convertIntensity(currentValue, 'USA', 'SI').toFixed(2);
    setEditingIndex(index);
    setEditValue(displayValue);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [unitSystem]);

  // Handle value change during editing
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  // Handle blur or enter to commit edit
  const handleCommitEdit = useCallback(() => {
    if (editingIndex === null) return;

    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Invalid intensity value");
      setEditingIndex(null);
      return;
    }

    // Convert back to internal units (in/hr) if needed
    const internalValue = unitSystem === 'SI' 
      ? convertIntensity(newValue, 'SI', 'USA')
      : newValue;

    const newIntensities = [...intensities];
    newIntensities[editingIndex] = internalValue;

    // Optionally normalize to maintain total depth
    if (lockNormalization) {
      const newSum = newIntensities.reduce((a, b) => a + b, 0) * (timeStep / 60);
      if (newSum > 0) {
        const scale = totalDepth / newSum;
        for (let i = 0; i < newIntensities.length; i++) {
          newIntensities[i] *= scale;
        }
      }
    }

    onIntensitiesChange(newIntensities);
    setEditingIndex(null);
  }, [editingIndex, editValue, intensities, unitSystem, lockNormalization, totalDepth, timeStep, onIntensitiesChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    } else if (e.key === 'Tab' && editingIndex !== null) {
      e.preventDefault();
      handleCommitEdit();
      const nextIndex = e.shiftKey 
        ? Math.max(0, editingIndex - 1)
        : Math.min(numSteps - 1, editingIndex + 1);
      setTimeout(() => {
        handleCellClick(nextIndex, intensities[nextIndex]);
      }, 0);
    }
  }, [editingIndex, numSteps, handleCommitEdit, handleCellClick, intensities]);

  // Normalize all values to match target depth
  const normalizeToDepth = useCallback(() => {
    const sum = intensities.reduce((a, b) => a + b, 0) * (timeStep / 60);
    if (sum <= 0) return;
    
    const scale = totalDepth / sum;
    const normalized = intensities.map(v => v * scale);
    onIntensitiesChange(normalized);
    toast.success("Pattern normalized to target depth");
  }, [intensities, totalDepth, timeStep, onIntensitiesChange]);

  // Copy table to clipboard
  const copyToClipboard = useCallback(() => {
    let text = `Time (HH:MM)\tIntensity (${intensityUnit})\n`;
    intensities.forEach((intensity, index) => {
      const displayIntensity = unitSystem === 'USA' 
        ? intensity
        : convertIntensity(intensity, 'USA', 'SI');
      const decimals = unitSystem === 'USA' ? 4 : 2;
      text += `${timeLabels[index]}\t${displayIntensity.toFixed(decimals)}\n`;
    });
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Table copied to clipboard");
  }, [intensities, timeLabels, unitSystem, intensityUnit]);

  // Export as CSV
  const exportCsv = useCallback(() => {
    let csv = `Time (HH:MM),Time (hr),Intensity (${intensityUnit})\n`;
    intensities.forEach((intensity, index) => {
      const displayIntensity = unitSystem === 'USA' 
        ? intensity
        : convertIntensity(intensity, 'USA', 'SI');
      const decimals = unitSystem === 'USA' ? 4 : 2;
      const timeHours = (index * timeStep) / 60;
      csv += `${timeLabels[index]},${timeHours.toFixed(4)},${displayIntensity.toFixed(decimals)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rainfall_data_${duration}h_${timeStep}min.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported as CSV");
  }, [intensities, timeLabels, duration, timeStep, unitSystem, intensityUnit]);

  // Import from CSV
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        const importedIntensities: number[] = [];
        
        for (const line of dataLines) {
          const parts = line.split(',');
          // Look for intensity value (last numeric column)
          let intensityValue: number | null = null;
          for (let i = parts.length - 1; i >= 0; i--) {
            const val = parseFloat(parts[i].trim());
            if (!isNaN(val) && val >= 0) {
              intensityValue = val;
              break;
            }
          }
          if (intensityValue !== null) {
            // Assume imported values are in current unit system
            const internalValue = unitSystem === 'SI'
              ? convertIntensity(intensityValue, 'SI', 'USA')
              : intensityValue;
            importedIntensities.push(internalValue);
          }
        }

        if (importedIntensities.length === 0) {
          toast.error("No valid intensity data found in CSV");
          return;
        }

        // Resample if needed
        let finalIntensities: number[];
        if (importedIntensities.length !== numSteps) {
          finalIntensities = [];
          for (let i = 0; i < numSteps; i++) {
            const sourceIndex = (i / (numSteps - 1)) * (importedIntensities.length - 1);
            const lowerIndex = Math.floor(sourceIndex);
            const upperIndex = Math.min(lowerIndex + 1, importedIntensities.length - 1);
            const fraction = sourceIndex - lowerIndex;
            const interpolated = importedIntensities[lowerIndex] * (1 - fraction) + 
                                 importedIntensities[upperIndex] * fraction;
            finalIntensities.push(interpolated);
          }
          toast.info(`Resampled from ${importedIntensities.length} to ${numSteps} time steps`);
        } else {
          finalIntensities = importedIntensities;
        }

        // Normalize to target depth if lock is on
        if (lockNormalization) {
          const sum = finalIntensities.reduce((a, b) => a + b, 0) * (timeStep / 60);
          if (sum > 0) {
            const scale = totalDepth / sum;
            finalIntensities = finalIntensities.map(v => v * scale);
          }
        }

        onIntensitiesChange(finalIntensities);
        toast.success("CSV imported successfully");
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file");
      }
    };

    reader.readAsText(file);
    if (event.target) event.target.value = '';
  }, [numSteps, unitSystem, lockNormalization, totalDepth, timeStep, onIntensitiesChange]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="w-5 h-5 text-primary" />
              Numerical Data Table
            </CardTitle>
            <CardDescription>
              Click any cell to type precise intensity values
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Computed Depth</p>
            <p className={cn(
              "text-lg font-bold flex items-center gap-2",
              depthMismatch ? "text-warning" : "text-primary"
            )}>
              {depthMismatch && <AlertTriangle className="w-4 h-4" />}
              {formatDepth(currentTotal, unitSystem)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileImport}
            className="hidden"
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImportClick}
                  className="gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import time-intensity data from CSV</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportCsv}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data as CSV file</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-1"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy table to clipboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="border-l border-border h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={lockNormalization ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLockNormalization(!lockNormalization)}
                  className="gap-1"
                >
                  {lockNormalization ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                  {lockNormalization ? "Depth Locked" : "Depth Unlocked"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {lockNormalization 
                  ? "Edits will automatically normalize to maintain total depth"
                  : "Edits will change the total depth"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {depthMismatch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={normalizeToDepth}
                    className="gap-1 border-warning text-warning hover:bg-warning/10"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Normalize
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Scale all values to match target depth of {formatDepth(totalDepth, unitSystem)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Data Table */}
        <ScrollArea className="h-[300px] border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-20 text-center">Step</TableHead>
                <TableHead className="w-24 text-center">Time</TableHead>
                <TableHead className="text-center">
                  Intensity ({intensityUnit})
                </TableHead>
                <TableHead className="w-28 text-center">
                  Cumulative Depth
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intensities.map((intensity, index) => {
                const displayIntensity = unitSystem === 'USA' 
                  ? intensity
                  : convertIntensity(intensity, 'USA', 'SI');
                const decimals = unitSystem === 'USA' ? 4 : 2;
                
                // Calculate cumulative depth up to this point
                const cumulativeDepth = intensities
                  .slice(0, index + 1)
                  .reduce((sum, val) => sum + val * (timeStep / 60), 0);

                return (
                  <TableRow key={index}>
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {timeLabels[index]}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingIndex === index ? (
                        <Input
                          ref={inputRef}
                          type="number"
                          step="any"
                          value={editValue}
                          onChange={handleValueChange}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="h-8 w-28 mx-auto text-center"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => handleCellClick(index, intensity)}
                          className={cn(
                            "w-28 h-8 mx-auto flex items-center justify-center",
                            "font-mono rounded border border-transparent",
                            "hover:bg-accent hover:border-border transition-colors",
                            "cursor-text"
                          )}
                        >
                          {displayIntensity.toFixed(decimals)}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono">
                      {formatDepth(cumulativeDepth, unitSystem)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Time Steps</p>
            <p className="font-semibold">{numSteps}</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Target Depth</p>
            <p className="font-semibold">{formatDepth(totalDepth, unitSystem)}</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Peak Intensity</p>
            <p className="font-semibold">
              {unitSystem === 'USA' 
                ? Math.max(...intensities).toFixed(2)
                : convertIntensity(Math.max(...intensities), 'USA', 'SI').toFixed(1)
              } {intensityUnit}
            </p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-xs">Avg Intensity</p>
            <p className="font-semibold">
              {unitSystem === 'USA' 
                ? (intensities.reduce((a, b) => a + b, 0) / numSteps).toFixed(2)
                : convertIntensity(intensities.reduce((a, b) => a + b, 0) / numSteps, 'USA', 'SI').toFixed(1)
              } {intensityUnit}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
