import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import { Upload, Download, FileText, Plus, Eye, Edit, Layers, FileInput, Droplets, Wrench } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { toast } from "@/hooks/use-toast";
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";

interface ImportedTimeSeries {
  name: string;
  data: Array<{ date: string; time: string; value: number }>;
  validation?: TimeSeriesValidation;
}

interface TimeSeriesValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  stats: {
    totalPoints: number;
    totalDepth: number;
    maxValue: number;
    minValue: number;
    avgValue: number;
    hasNegatives: boolean;
    hasZeros: boolean;
    durationMinutes: number;
  };
}

interface SwmmFileIntegrationProps {
  selectedPattern: PatternType;
  patternName: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

const allPatterns: Array<{ id: PatternType; name: string; category: string }> = [
  { id: 'scs1a', name: 'SCS Type IA', category: 'SCS' },
  { id: 'scs1', name: 'SCS Type I', category: 'SCS' },
  { id: 'scs2', name: 'SCS Type II', category: 'SCS' },
  { id: 'scs3', name: 'SCS Type III', category: 'SCS' },
  { id: 'huff1', name: 'Huff 1st Quartile', category: 'Huff' },
  { id: 'huff2', name: 'Huff 2nd Quartile', category: 'Huff' },
  { id: 'huff3', name: 'Huff 3rd Quartile', category: 'Huff' },
  { id: 'huff4', name: 'Huff 4th Quartile', category: 'Huff' },
  { id: 'chicago', name: 'Chicago Storm', category: 'Other' },
  { id: 'block', name: 'Block (Uniform)', category: 'Other' },
  { id: 'desbordes', name: 'Desbordes (France)', category: 'International' },
  { id: 'arr', name: 'Australian ARR', category: 'International' },
  { id: 'dwa', name: 'German DWA', category: 'International' },
  { id: 'jma', name: 'Japan JMA', category: 'International' },
  { id: 'china', name: 'Chinese P&C', category: 'International' },
  { id: 'sa_huff', name: 'South Africa Huff', category: 'International' },
  { id: 'dutch', name: 'Dutch KNMI', category: 'International' },
  { id: 'italian', name: 'Italian (LSPP)', category: 'International' },
];

export function SwmmFileIntegration({
  selectedPattern,
  patternName,
  totalDepth,
  duration,
  timeStep,
  unitSystem,
}: SwmmFileIntegrationProps) {
  const [inpFile, setInpFile] = useState<File | null>(null);
  const [inpContent, setInpContent] = useState<string>("");
  const [timeSeriesName, setTimeSeriesName] = useState<string>("");
  const [previewData, setPreviewData] = useState<string>("");
  const [editedData, setEditedData] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Batch processing state
  const [selectedBatchPatterns, setSelectedBatchPatterns] = useState<PatternType[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  
  // Import state
  const [importedTimeSeries, setImportedTimeSeries] = useState<ImportedTimeSeries[]>([]);
  const [selectedImportSeries, setSelectedImportSeries] = useState<string>("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // ICM export state
  const [icmEventName, setIcmEventName] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.inp')) {
      toast({
        title: "Invalid file",
        description: "Please select a SWMM5 .inp file",
        variant: "destructive"
      });
      return;
    }

    setInpFile(file);
    const content = await file.text();
    setInpContent(content);
    
    // Generate default time series name from pattern
    const defaultName = `TS_${patternName.replace(/\s+/g, '_')}`;
    setTimeSeriesName(defaultName);
    
    toast({
      title: "File loaded",
      description: `Loaded ${file.name}`
    });
    
    // Parse existing timeseries from the file
    parseTimeSeriesFromInp(content);
  };

  // Parse existing SWMM5 timeseries from .inp content
  const parseTimeSeriesFromInp = (content: string) => {
    const lines = content.split('\n');
    const timeSeriesMap: Record<string, ImportedTimeSeries> = {};
    let inTimeSeriesSection = false;
    let parseErrors: string[] = [];
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      // Check for section headers
      if (trimmed.startsWith('[')) {
        inTimeSeriesSection = trimmed.toUpperCase() === '[TIMESERIES]';
        continue;
      }
      
      // Skip comments and empty lines
      if (!inTimeSeriesSection || trimmed.startsWith(';') || trimmed === '') {
        continue;
      }
      
      // Parse timeseries line: Name Date Time Value
      const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
      if (parts.length >= 4) {
        const [name, date, time, value] = parts;
        const numValue = parseFloat(value);
        
        // Validate date format (MM/DD/YYYY or similar)
        const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        if (!dateRegex.test(date)) {
          parseErrors.push(`Line ${lineNumber}: Invalid date format "${date}" for series "${name}"`);
        }
        
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
        if (!timeRegex.test(time)) {
          parseErrors.push(`Line ${lineNumber}: Invalid time format "${time}" for series "${name}"`);
        }
        
        if (!isNaN(numValue)) {
          if (!timeSeriesMap[name]) {
            timeSeriesMap[name] = { name, data: [] };
          }
          timeSeriesMap[name].data.push({ date, time, value: numValue });
        } else {
          parseErrors.push(`Line ${lineNumber}: Invalid numeric value "${value}" for series "${name}"`);
        }
      } else if (parts.length > 0 && parts.length < 4) {
        parseErrors.push(`Line ${lineNumber}: Incomplete data (expected: Name Date Time Value)`);
      }
    }
    
    // Validate each timeseries
    const parsed = Object.values(timeSeriesMap).map(ts => ({
      ...ts,
      validation: validateTimeSeries(ts)
    }));
    
    setImportedTimeSeries(parsed);
    
    if (parseErrors.length > 0) {
      toast({
        title: "Parse warnings",
        description: `${parseErrors.length} issue(s) found while parsing. Some data may be incomplete.`,
        variant: "destructive"
      });
      console.warn("SWMM5 Parse Errors:", parseErrors);
    }
    
    if (parsed.length > 0) {
      const validCount = parsed.filter(ts => ts.validation?.isValid).length;
      toast({
        title: "Timeseries found",
        description: `Found ${parsed.length} timeseries (${validCount} valid)`
      });
    }
  };

  // Validate a timeseries
  const validateTimeSeries = (ts: ImportedTimeSeries): TimeSeriesValidation => {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    const values = ts.data.map(d => d.value);
    const totalPoints = values.length;
    const totalDepth = values.reduce((sum, v) => sum + v, 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = totalDepth / totalPoints;
    const hasNegatives = values.some(v => v < 0);
    const hasZeros = values.some(v => v === 0);
    
    // Calculate duration from time values
    let durationMinutes = 0;
    if (ts.data.length >= 2) {
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
      };
      const startMinutes = parseTime(ts.data[0].time);
      const endMinutes = parseTime(ts.data[ts.data.length - 1].time);
      durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle day wrap
    }
    
    // Validation checks
    if (totalPoints === 0) {
      errors.push("No data points found");
    }
    
    if (totalPoints < 3) {
      warnings.push(`Only ${totalPoints} data points - may be too sparse`);
    }
    
    if (hasNegatives) {
      errors.push("Contains negative values - rainfall cannot be negative");
    }
    
    if (maxValue > 50) {
      warnings.push(`Max value (${maxValue.toFixed(2)}) seems unusually high - verify units`);
    }
    
    if (totalDepth > 100) {
      warnings.push(`Total depth (${totalDepth.toFixed(2)}) seems very high - verify data`);
    }
    
    if (durationMinutes > 0 && durationMinutes < 5) {
      warnings.push("Duration less than 5 minutes - may be incomplete");
    }
    
    // Check for monotonic time progression
    let timeIssues = 0;
    for (let i = 1; i < ts.data.length; i++) {
      const prev = ts.data[i - 1].time;
      const curr = ts.data[i].time;
      if (curr <= prev) {
        timeIssues++;
      }
    }
    if (timeIssues > 0) {
      warnings.push(`${timeIssues} non-monotonic time step(s) detected`);
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      warnings,
      errors,
      stats: {
        totalPoints,
        totalDepth,
        maxValue,
        minValue,
        avgValue,
        hasNegatives,
        hasZeros,
        durationMinutes
      }
    };
  };

  // Repair functions for common issues
  const repairTimeSeries = (seriesName: string, repairType: 'negatives' | 'sort' | 'normalize' | 'all') => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      let repairedData = [...ts.data];
      let repairsApplied: string[] = [];
      
      // Fix negative values
      if (repairType === 'negatives' || repairType === 'all') {
        const negCount = repairedData.filter(d => d.value < 0).length;
        if (negCount > 0) {
          repairedData = repairedData.map(d => ({
            ...d,
            value: Math.max(0, d.value)
          }));
          repairsApplied.push(`Fixed ${negCount} negative value(s)`);
        }
      }
      
      // Sort by time (fix non-monotonic)
      if (repairType === 'sort' || repairType === 'all') {
        const parseTime = (timeStr: string): number => {
          const parts = timeStr.split(':').map(Number);
          return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
        };
        
        const originalOrder = repairedData.map(d => d.time).join(',');
        repairedData.sort((a, b) => parseTime(a.time) - parseTime(b.time));
        const newOrder = repairedData.map(d => d.time).join(',');
        
        if (originalOrder !== newOrder) {
          repairsApplied.push('Sorted data by time');
        }
      }
      
      // Normalize high values (assume mm->inches or vice versa)
      if (repairType === 'normalize' || repairType === 'all') {
        const maxVal = Math.max(...repairedData.map(d => d.value));
        if (maxVal > 50) {
          // Likely mm, convert to inches
          repairedData = repairedData.map(d => ({
            ...d,
            value: d.value / 25.4
          }));
          repairsApplied.push('Normalized values (mm → inches)');
        }
      }
      
      if (repairsApplied.length === 0) {
        toast({ title: "No repairs needed", description: "Data appears to be correct" });
        return ts;
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: repairedData
      };
      
      // Re-validate
      const newValidation = validateTimeSeries(repairedTs);
      
      toast({
        title: "Repairs applied",
        description: repairsApplied.join(', ')
      });
      
      return {
        ...repairedTs,
        validation: newValidation
      };
    }));
  };

  // Remove zero values
  const removeZeroValues = (seriesName: string) => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      const originalCount = ts.data.length;
      const filteredData = ts.data.filter(d => d.value > 0);
      const removedCount = originalCount - filteredData.length;
      
      if (removedCount === 0) {
        toast({ title: "No zeros found", description: "Data has no zero values to remove" });
        return ts;
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: filteredData
      };
      
      toast({
        title: "Zeros removed",
        description: `Removed ${removedCount} zero-value data point(s)`
      });
      
      return {
        ...repairedTs,
        validation: validateTimeSeries(repairedTs)
      };
    }));
  };

  // Interpolate missing timesteps
  const interpolateMissingSteps = (seriesName: string, targetStepMinutes: number = 5) => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      if (ts.data.length < 2) {
        toast({ title: "Cannot interpolate", description: "Need at least 2 data points", variant: "destructive" });
        return ts;
      }
      
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
      };
      
      const formatTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      
      const startMinutes = parseTime(ts.data[0].time);
      const endMinutes = parseTime(ts.data[ts.data.length - 1].time);
      const baseDate = ts.data[0].date;
      
      const interpolatedData: typeof ts.data = [];
      
      for (let t = startMinutes; t <= endMinutes; t += targetStepMinutes) {
        // Find surrounding data points
        let before = ts.data[0];
        let after = ts.data[ts.data.length - 1];
        
        for (let i = 0; i < ts.data.length - 1; i++) {
          const t1 = parseTime(ts.data[i].time);
          const t2 = parseTime(ts.data[i + 1].time);
          if (t1 <= t && t2 >= t) {
            before = ts.data[i];
            after = ts.data[i + 1];
            break;
          }
        }
        
        const t1 = parseTime(before.time);
        const t2 = parseTime(after.time);
        const ratio = t2 === t1 ? 0 : (t - t1) / (t2 - t1);
        const interpolatedValue = before.value + ratio * (after.value - before.value);
        
        interpolatedData.push({
          date: baseDate,
          time: formatTime(t),
          value: Math.max(0, interpolatedValue)
        });
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: interpolatedData
      };
      
      toast({
        title: "Interpolation complete",
        description: `Created ${interpolatedData.length} points at ${targetStepMinutes}-min intervals`
      });
      
      return {
        ...repairedTs,
        validation: validateTimeSeries(repairedTs)
      };
    }));
  };

  // Import a timeseries for editing
  const importTimeSeriesForEditing = () => {
    const series = importedTimeSeries.find(ts => ts.name === selectedImportSeries);
    if (!series) return;
    
    // Convert to editable format
    const lines: string[] = [];
    lines.push(`; Imported time series: ${series.name}`);
    lines.push(`${series.name}`);
    
    for (const point of series.data) {
      lines.push(`${series.name}  ${point.date}  ${point.time}  ${point.value.toFixed(6)}`);
    }
    
    setEditedData(lines.join('\n'));
    setPreviewData(lines.join('\n'));
    setTimeSeriesName(series.name);
    setIsImportDialogOpen(false);
    setIsPreviewOpen(true);
    
    toast({
      title: "Timeseries imported",
      description: `Loaded "${series.name}" for editing`
    });
  };

  // Generate ICM rainfall event format (SWMM5 compatible)
  const generateIcmRainfallEvent = (pattern: PatternType, patternDisplayName: string, eventName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const lines: string[] = [];
    
    // Use SWMM5 timeseries format for ICM compatibility
    lines.push(`; InfoWorks ICM Rainfall Timeseries (SWMM5 Format)`);
    lines.push(`; Generated by Pattern Painter`);
    lines.push(`; Pattern: ${patternDisplayName}`);
    lines.push(`; Total depth: ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)}, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    lines.push(`; Units: ${getDepthUnit(unitSystem)} (incremental depth per time step)`);
    lines.push(`;`);
    lines.push(`[TIMESERIES]`);
    lines.push(`;;Name           Date       Time       Value`);
    lines.push(`;;-------------- ---------- ---------- ----------`);
    
    const startDate = "01/01/2024";
    const tsName = eventName || `ICM_${patternDisplayName.replace(/\s+/g, '_')}`;
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      lines.push(`${tsName}  ${startDate}  ${timeStr}  ${depthIncrement.toFixed(6)}`);
    }
    
    return lines.join('\n');
  };

  // Generate batch ICM data
  const generateBatchIcmData = (): string => {
    const allEvents: string[] = [];
    
    selectedBatchPatterns.forEach((pattern) => {
      const patternInfo = allPatterns.find(p => p.id === pattern);
      if (!patternInfo) return;
      
      const eventName = `RF_${patternInfo.name.replace(/\s+/g, '_')}`;
      const eventData = generateIcmRainfallEvent(pattern, patternInfo.name, eventName);
      allEvents.push(eventData);
    });
    
    return allEvents.join('\n\n');
  };

  // Export as ICM file
  const exportAsIcm = () => {
    const eventName = icmEventName || `RF_${patternName.replace(/\s+/g, '_')}`;
    const icmData = batchMode ? generateBatchIcmData() : generateIcmRainfallEvent(selectedPattern, patternName, eventName);
    
    const blob = new Blob([icmData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode 
      ? 'batch_rainfall_events.icm'
      : `${eventName}.icm`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "ICM file generated",
      description: batchMode
        ? `Created ${selectedBatchPatterns.length} rainfall events for ICM`
        : `Created rainfall event "${eventName}" for ICM`
    });
  };

  const generateTimeSeriesData = (pattern: PatternType, patternDisplayName: string, tsName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const timeSeriesLines: string[] = [];
    
    timeSeriesLines.push(`; Generated time series for ${patternDisplayName}`);
    timeSeriesLines.push(`; Total depth: ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)}, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    timeSeriesLines.push(`${tsName}`);
    
    const startDate = "01/01/2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      timeSeriesLines.push(`${tsName}  ${startDate}  ${timeStr}  ${depthIncrement.toFixed(6)}`);
    }
    
    return timeSeriesLines.join('\n');
  };

  const generateBatchTimeSeriesData = (): string => {
    const allTimeSeries: string[] = [];
    
    selectedBatchPatterns.forEach((pattern) => {
      const patternInfo = allPatterns.find(p => p.id === pattern);
      if (!patternInfo) return;
      
      const tsName = `TS_${patternInfo.name.replace(/\s+/g, '_')}`;
      const tsData = generateTimeSeriesData(pattern, patternInfo.name, tsName);
      allTimeSeries.push(tsData);
    });
    
    return allTimeSeries.join('\n\n');
  };

  const toggleBatchPattern = (pattern: PatternType) => {
    setSelectedBatchPatterns(prev => 
      prev.includes(pattern) 
        ? prev.filter(p => p !== pattern)
        : [...prev, pattern]
    );
  };

  const previewTimeSeriesData = () => {
    let data: string;
    if (batchMode && selectedBatchPatterns.length > 0) {
      data = generateBatchTimeSeriesData();
    } else {
      data = generateTimeSeriesData(selectedPattern, patternName, timeSeriesName || `TS_${patternName.replace(/\s+/g, '_')}`);
    }
    setPreviewData(data);
    setEditedData(data);
    setIsPreviewOpen(true);
  };

  const appendToInpFile = (useEditedData = false) => {
    if (!inpContent) {
      toast({
        title: "No file loaded",
        description: "Please load a SWMM5 .inp file first",
        variant: "destructive"
      });
      return;
    }

    if (!batchMode && !timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    if (batchMode && selectedBatchPatterns.length === 0) {
      toast({
        title: "No patterns selected",
        description: "Please select at least one pattern for batch processing",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = useEditedData ? editedData : (batchMode ? generateBatchTimeSeriesData() : generateTimeSeriesData(selectedPattern, patternName, timeSeriesName));
    let modifiedContent = inpContent;

    // Find the [TIMESERIES] section
    const timeseriesRegex = /\[TIMESERIES\]/i;
    const match = timeseriesRegex.exec(modifiedContent);

    if (match) {
      // Find the end of the TIMESERIES section (next section or end of file)
      const nextSectionRegex = /\n\[/;
      const startPos = match.index + match[0].length;
      const remainingContent = modifiedContent.substring(startPos);
      const nextSectionMatch = nextSectionRegex.exec(remainingContent);
      
      let insertPos: number;
      if (nextSectionMatch) {
        insertPos = startPos + nextSectionMatch.index;
      } else {
        insertPos = modifiedContent.length;
      }

      // Insert the new time series
      modifiedContent = 
        modifiedContent.substring(0, insertPos) +
        '\n' + timeSeriesData + '\n' +
        modifiedContent.substring(insertPos);
    } else {
      // No [TIMESERIES] section exists, create one
      // Try to insert before [PATTERNS] or at the end
      const patternsRegex = /\[PATTERNS\]/i;
      const patternsMatch = patternsRegex.exec(modifiedContent);
      
      const timeseriesSection = '\n[TIMESERIES]\n' +
        ';;Name           Date       Time       Value     \n' +
        ';;-------------- ---------- ---------- ----------\n' +
        timeSeriesData + '\n';
      
      if (patternsMatch) {
        modifiedContent = 
          modifiedContent.substring(0, patternsMatch.index) +
          timeseriesSection +
          modifiedContent.substring(patternsMatch.index);
      } else {
        modifiedContent += '\n' + timeseriesSection;
      }
    }

    // Download the modified file
    const blob = new Blob([modifiedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = inpFile ? inpFile.name.replace('.inp', '_modified.inp') : 'swmm_modified.inp';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "File generated",
      description: batchMode 
        ? `${selectedBatchPatterns.length} time series appended to SWMM5 file`
        : `Time series "${timeSeriesName}" appended to SWMM5 file`
    });
    
    setIsPreviewOpen(false);
  };

  const generateNewInpFile = (useEditedData = false) => {
    if (!batchMode && !timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    if (batchMode && selectedBatchPatterns.length === 0) {
      toast({
        title: "No patterns selected",
        description: "Please select at least one pattern for batch processing",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = useEditedData ? editedData : (batchMode ? generateBatchTimeSeriesData() : generateTimeSeriesData(selectedPattern, patternName, timeSeriesName));
    
    // Create a minimal SWMM5 file with just the time series
    const minimalInp = `[TITLE]
;;Project Title/Notes
Rainfall Time Series - ${patternName}

[OPTIONS]
;;Option             Value
FLOW_UNITS           CFS
INFILTRATION         HORTON
FLOW_ROUTING         KINWAVE
START_DATE           01/01/2024
START_TIME           00:00:00
REPORT_START_DATE    01/01/2024
REPORT_START_TIME    00:00:00
END_DATE             01/01/2024
END_TIME             ${Math.floor(duration).toString().padStart(2, '0')}:${Math.floor((duration % 1) * 60).toString().padStart(2, '0')}:00
SWEEP_START          01/01
SWEEP_END            12/31
DRY_DAYS             0
REPORT_STEP          00:01:00
WET_STEP             00:01:00
DRY_STEP             01:00:00
ROUTING_STEP         0:00:30

[TIMESERIES]
;;Name           Date       Time       Value     
;;-------------- ---------- ---------- ----------
${timeSeriesData}

[REPORT]
;;Reporting Options
INPUT      YES
CONTROLS   YES
SUBCATCHMENTS ALL
NODES ALL
LINKS ALL

[END]
`;

    const blob = new Blob([minimalInp], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode 
      ? 'batch_timeseries.inp'
      : `${timeSeriesName}_timeseries.inp`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "File generated",
      description: batchMode
        ? `New SWMM5 file created with ${selectedBatchPatterns.length} time series`
        : `New SWMM5 file created with time series "${timeSeriesName}"`
    });
    
    setIsPreviewOpen(false);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          SWMM5 & ICM Integration
        </CardTitle>
        <CardDescription>
          Import, edit, and export rainfall time series for SWMM5 and InfoWorks ICM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <Tabs value={batchMode ? "batch" : "single"} onValueChange={(v) => setBatchMode(v === "batch")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Pattern</TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Batch Mode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            {/* Time Series Name */}
            <div className="space-y-2">
              <Label htmlFor="ts-name">Time Series Name (SWMM5)</Label>
              <Input
                id="ts-name"
                placeholder="e.g., TS_SCS_Type_II"
                value={timeSeriesName}
                onChange={(e) => setTimeSeriesName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icm-name">Event Name (ICM)</Label>
              <Input
                id="icm-name"
                placeholder="e.g., RF_Design_Storm"
                value={icmEventName}
                onChange={(e) => setIcmEventName(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-4 mt-4">
            {/* Batch Pattern Selection */}
            <div className="space-y-3">
              <Label>Select Patterns for Batch Processing</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border border-border rounded-lg">
                {allPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`batch-${pattern.id}`}
                      checked={selectedBatchPatterns.includes(pattern.id)}
                      onCheckedChange={() => toggleBatchPattern(pattern.id)}
                    />
                    <Label
                      htmlFor={`batch-${pattern.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {pattern.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedBatchPatterns.length} pattern(s) selected. Each will generate a separate time series.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload Existing SWMM5 File (Optional)</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".inp"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {inpFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInpFile(null);
                  setInpContent("");
                  setImportedTimeSeries([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {inpFile && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Loaded: {inpFile.name}
            </p>
          )}
        </div>

        {/* Import Existing Timeseries */}
        {importedTimeSeries.length > 0 && (
          <div className="space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <FileInput className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Import Existing Timeseries</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Found {importedTimeSeries.length} timeseries. Select one to import and edit.
            </p>
            <div className="flex gap-2">
              <Select value={selectedImportSeries} onValueChange={setSelectedImportSeries}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select timeseries to import" />
                </SelectTrigger>
                <SelectContent>
                  {importedTimeSeries.map((ts) => (
                    <SelectItem key={ts.name} value={ts.name}>
                      <span className="flex items-center gap-2">
                        {ts.validation?.isValid ? (
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                        {ts.name} ({ts.data.length} pts)
                        {ts.validation?.warnings.length ? (
                          <span className="text-amber-500 text-xs">⚠</span>
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!selectedImportSeries}
                onClick={importTimeSeriesForEditing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            
            {/* Validation Results */}
            {selectedImportSeries && (() => {
              const selected = importedTimeSeries.find(ts => ts.name === selectedImportSeries);
              if (!selected?.validation) return null;
              const { validation } = selected;
              
              return (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.isValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Points</p>
                      <p className="font-mono font-semibold">{validation.stats.totalPoints}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Total Depth</p>
                      <p className="font-mono font-semibold">{validation.stats.totalDepth.toFixed(3)}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Max Value</p>
                      <p className="font-mono font-semibold">{validation.stats.maxValue.toFixed(4)}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-mono font-semibold">{validation.stats.durationMinutes.toFixed(0)} min</p>
                    </div>
                  </div>
                  
                  {/* Errors */}
                  {validation.errors.length > 0 && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-xs font-semibold text-red-600 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-0.5">
                        {validation.errors.map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs font-semibold text-amber-600 mb-1">Warnings:</p>
                      <ul className="text-xs text-amber-600 space-y-0.5">
                        {validation.warnings.map((warn, i) => (
                          <li key={i}>• {warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Repair Tools */}
                  {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                    <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-600">Auto-Repair Tools</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {validation.stats.hasNegatives && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'negatives')}
                          >
                            Fix Negatives
                          </Button>
                        )}
                        {validation.warnings.some(w => w.includes('non-monotonic')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'sort')}
                          >
                            Sort by Time
                          </Button>
                        )}
                        {validation.warnings.some(w => w.includes('high')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'normalize')}
                          >
                            Normalize (mm→in)
                          </Button>
                        )}
                        {validation.stats.hasZeros && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => removeZeroValues(selectedImportSeries)}
                          >
                            Remove Zeros
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => interpolateMissingSteps(selectedImportSeries, 5)}
                        >
                          Interpolate (5-min)
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => repairTimeSeries(selectedImportSeries, 'all')}
                        >
                          Fix All Issues
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">SWMM5 Export</p>
          <Button
            onClick={previewTimeSeriesData}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview & Edit Time Series
          </Button>
          
          <Button
            onClick={() => appendToInpFile(false)}
            disabled={!inpFile || (!batchMode && !timeSeriesName.trim()) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {batchMode ? `Append ${selectedBatchPatterns.length} Series to File` : 'Append to Existing File'}
          </Button>
          
          <Button
            onClick={() => generateNewInpFile(false)}
            variant="outline"
            disabled={(!batchMode && !timeSeriesName.trim()) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? 'Generate Batch SWMM5 File' : 'Generate New SWMM5 File'}
          </Button>
        </div>

        {/* ICM Export */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            InfoWorks ICM Export
          </p>
          <Button
            onClick={exportAsIcm}
            variant="outline"
            disabled={(!batchMode && !icmEventName.trim() && !patternName) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? `Export ${selectedBatchPatterns.length} ICM Events` : 'Export ICM Rainfall Event'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Generates native ICM rainfall event format (.icm) with timestep data
          </p>
        </div>

        {/* Preview/Edit Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Preview & Edit SWMM5 Time Series
              </DialogTitle>
              <DialogDescription>
                Review and edit the time series data before exporting. Changes will be used for the next export.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                value={editedData}
                onChange={(e) => setEditedData(e.target.value)}
                className="font-mono text-xs h-96 resize-none"
                placeholder="Time series data will appear here..."
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Lines: {editedData.split('\n').length}</span>
                <span>Characters: {editedData.length}</span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditedData(previewData)}>
                Reset Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(editedData);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                Copy to Clipboard
              </Button>
              <Button onClick={() => appendToInpFile(true)} disabled={!inpFile}>
                <Plus className="w-4 h-4 mr-2" />
                Append to File
              </Button>
              <Button onClick={() => generateNewInpFile(true)}>
                <Download className="w-4 h-4 mr-2" />
                Generate New File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info */}
        <div className="p-3 rounded-lg border border-border bg-accent/20 space-y-1">
          <p className="text-xs font-semibold text-foreground">Current Settings</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Pattern: {patternName}</p>
            <p>Total Depth: {totalDepth} inches</p>
            <p>Duration: {duration} hours</p>
            <p>Time Step: {timeStep} minutes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
