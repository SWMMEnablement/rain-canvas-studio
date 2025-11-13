import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useMemo } from "react";
import { Upload, Download, FileText, Plus, Eye, Edit, Layers } from "lucide-react";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { toast } from "@/hooks/use-toast";

interface SwmmFileIntegrationProps {
  selectedPattern: PatternType;
  patternName: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
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
  { id: 'desbordes', name: 'Desbordes', category: 'International' },
  { id: 'arr', name: 'Australian ARR', category: 'International' },
  { id: 'dwa', name: 'German DWA', category: 'International' },
];

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
  const [previewData, setPreviewData] = useState<string>("");
  const [editedData, setEditedData] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Batch processing state
  const [selectedBatchPatterns, setSelectedBatchPatterns] = useState<PatternType[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  
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

  const generateTimeSeriesData = (pattern: PatternType, patternDisplayName: string, tsName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const timeSeriesLines: string[] = [];
    
    timeSeriesLines.push(`; Generated time series for ${patternDisplayName}`);
    timeSeriesLines.push(`; Total depth: ${totalDepth} in, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    timeSeriesLines.push(`${tsName}`);
    
    // Convert to SWMM5 time series format
    const startDate = "01/01/2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const depthIncrement = intensities[i] * (timeStep / 60);
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
          SWMM5 File Integration
        </CardTitle>
        <CardDescription>
          Append generated rainfall time series to existing SWMM5 .inp files
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
