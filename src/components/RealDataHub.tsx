import { useState, useCallback } from "react";
import { Database, Upload, Edit3, FolderOpen, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RealDataImporter } from "@/components/RealDataImporter";
import { TimeseriesEditor } from "@/components/TimeseriesEditor";
import { StormEventLibrary, type SavedStormEvent } from "@/components/StormEventLibrary";
import { PatternDerivationEngine } from "@/components/PatternDerivationEngine";
import { type ParsedRainfallData, type RainfallDataPoint } from "@/lib/rainfallParsers";
import { type UnitSystem } from "@/lib/unitConversions";

export function RealDataHub() {
  const [currentData, setCurrentData] = useState<ParsedRainfallData | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem('preferredUnitSystem');
    return (saved === 'SI' || saved === 'USA') ? saved : 'USA';
  });
  const [activeTab, setActiveTab] = useState('import');

  // Handle imported data
  const handleDataImported = useCallback((data: ParsedRainfallData) => {
    setCurrentData(data);
    // Auto-switch to editor tab when data is imported
    setActiveTab('edit');
  }, []);

  // Handle data changes from editor
  const handleDataChange = useCallback((newData: RainfallDataPoint[]) => {
    if (currentData) {
      // Recalculate metadata
      const totalDepth = newData[newData.length - 1]?.cumulative || 0;
      const peakIntensity = Math.max(...newData.map(d => d.intensity));
      const peakTime = newData.find(d => d.intensity === peakIntensity)?.time;
      const duration = newData[newData.length - 1]?.time || 0;
      const timeSteps = newData.slice(1).map((d, i) => d.time - newData[i].time);
      const avgTimeStep = timeSteps.length > 0 
        ? timeSteps.reduce((a, b) => a + b, 0) / timeSteps.length 
        : currentData.metadata.timeStep || 15;

      setCurrentData({
        ...currentData,
        data: newData,
        metadata: {
          ...currentData.metadata,
          totalDepth,
          peakIntensity,
          peakTime,
          timeStep: Math.round(avgTimeStep),
        }
      });
    }
  }, [currentData]);

  // Handle export from editor
  const handleExport = useCallback((data: RainfallDataPoint[], name: string) => {
    // Export as CSV
    const header = 'time_minutes,intensity,cumulative_depth';
    const rows = data.map(d => `${d.time},${d.intensity.toFixed(4)},${d.cumulative?.toFixed(4) || ''}`);
    const csv = [header, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Handle loading from library
  const handleLoadEvent = useCallback((event: SavedStormEvent) => {
    setCurrentData({
      data: event.data,
      metadata: event.metadata,
      warnings: [],
      errors: [],
    });
    setActiveTab('edit');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="w-7 h-7" />
            Real Data Hub
          </CardTitle>
          <CardDescription className="text-base">
            Import, edit, and analyze real-world rainfall data from gauges and weather services.
            Work with actual storm events for model calibration and validation.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!currentData}>
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2" disabled={!currentData}>
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analyze</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-6">
          <RealDataImporter onDataImported={handleDataImported} />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {currentData ? (
            <TimeseriesEditor
              data={currentData}
              unitSystem={unitSystem}
              onDataChange={handleDataChange}
              onExport={handleExport}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Edit3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
                <p className="text-muted-foreground">
                  Import a rainfall data file or load from your library to begin editing
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="mt-6">
          {currentData ? (
            <PatternDerivationEngine data={currentData.data} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Data Loaded</h3>
                <p className="text-muted-foreground">
                  Import storm data to analyze patterns and find best-fit synthetic distributions
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <StormEventLibrary 
            currentData={currentData}
            onLoadEvent={handleLoadEvent}
          />
        </TabsContent>
      </Tabs>

      {/* Current Data Summary */}
      {currentData && currentData.data.length > 0 && (
        <Card className="bg-accent/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{currentData.metadata.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentData.data.length} data points • 
                    {((currentData.data[currentData.data.length - 1]?.time || 0) / 60).toFixed(1)} hr duration • 
                    {currentData.metadata.totalDepth?.toFixed(2)} {currentData.metadata.units === 'mm' ? 'mm' : 'in'} total
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Source: {currentData.metadata.source.toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
