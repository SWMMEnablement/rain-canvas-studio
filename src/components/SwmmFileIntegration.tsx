import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { Upload, Download, FileText, Plus } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { toast } from "@/hooks/use-toast";

interface SwmmFileIntegrationProps {
  selectedPattern: PatternType;
  patternName: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
}

export function SwmmFileIntegration({
  selectedPattern,
  patternName,
  totalDepth,
  duration,
  timeStep,
}: SwmmFileIntegrationProps) {
  const [inpFile, setInpFile] = useState<File | null>(null);
  const [inpContent, setInpContent] = useState<string>("");
  const [timeSeriesName, setTimeSeriesName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const generateTimeSeriesData = (): string => {
    const intensities = generateRainfallData(selectedPattern, totalDepth, duration, timeStep);
    const timeSeriesLines: string[] = [];
    
    timeSeriesLines.push(`; Generated time series for ${patternName}`);
    timeSeriesLines.push(`; Total depth: ${totalDepth} in, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    timeSeriesLines.push(`${timeSeriesName}`);
    
    // Convert to SWMM5 time series format
    // Format: TIME SERIES_NAME  DATE  TIME  VALUE
    const startDate = "01/01/2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // SWMM expects rainfall in inches (for intensity, multiply by time step to get depth per interval)
      const depthIncrement = intensities[i] * (timeStep / 60);
      
      timeSeriesLines.push(`${timeSeriesName}  ${startDate}  ${timeStr}  ${depthIncrement.toFixed(6)}`);
    }
    
    return timeSeriesLines.join('\n');
  };

  const appendToInpFile = () => {
    if (!inpContent) {
      toast({
        title: "No file loaded",
        description: "Please load a SWMM5 .inp file first",
        variant: "destructive"
      });
      return;
    }

    if (!timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = generateTimeSeriesData();
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
      description: `Time series "${timeSeriesName}" appended to SWMM5 file`
    });
  };

  const generateNewInpFile = () => {
    if (!timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = generateTimeSeriesData();
    
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
    link.download = `${timeSeriesName}_timeseries.inp`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "File generated",
      description: `New SWMM5 file created with time series "${timeSeriesName}"`
    });
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          SWMM5 File Integration
        </CardTitle>
        <CardDescription>
          Append generated rainfall time series to existing SWMM5 .inp files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Series Name */}
        <div className="space-y-2">
          <Label htmlFor="ts-name">Time Series Name</Label>
          <Input
            id="ts-name"
            placeholder="e.g., TS_SCS_Type_II"
            value={timeSeriesName}
            onChange={(e) => setTimeSeriesName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Name for the time series in the SWMM5 file
          </p>
        </div>

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

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={appendToInpFile}
            disabled={!inpFile}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Append to Existing File
          </Button>
          
          <Button
            onClick={generateNewInpFile}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate New SWMM5 File
          </Button>
        </div>

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
