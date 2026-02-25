import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Info, X, CloudRain, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseRainfallFile, type ParsedRainfallData } from "@/lib/rainfallParsers";

const sampleFiles = {
  csv: { path: "/sample-data/sample-rainfall.csv", name: "sample-rainfall.csv" },
  noaa: { path: "/sample-data/sample-noaa.dat", name: "sample-noaa.dat" },
  swmm: { path: "/sample-data/sample-swmm.inp", name: "sample-swmm.inp" },
  hec: { path: "/sample-data/sample-hec.gage", name: "sample-hec.gage" }
};
interface RealDataImporterProps {
  onDataImported: (data: ParsedRainfallData) => void;
}

const formatDescriptions = {
  csv: {
    title: "CSV (Comma-Separated)",
    description: "Standard CSV with time and intensity columns",
    example: "time,intensity\n0,0.5\n15,1.2\n30,2.1",
    extensions: [".csv"]
  },
  noaa: {
    title: "NOAA/NCEI Precipitation",
    description: "National Weather Service gauge data formats",
    example: "STATION,DATE,HPCP\nUSW00013874,2024-01-15,0.25",
    extensions: [".dat", ".csv"]
  },
  swmm: {
    title: "EPA SWMM Input",
    description: "Timeseries from SWMM .inp files",
    example: "[TIMESERIES]\nSTORM1 0:00 0.5\nSTORM1 0:15 1.2",
    extensions: [".inp", ".txt"]
  },
  hec: {
    title: "HEC-HMS Gage",
    description: "US Army Corps precipitation gage format",
    example: "Gage: MyGage\nTime Interval: 15 MIN\n0.5 1.2 2.1 1.8",
    extensions: [".gage", ".txt"]
  }
};

export function RealDataImporter({ onDataImported }: RealDataImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedRainfallData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setParseResult(null);

    try {
      const content = await file.text();
      const result = parseRainfallFile(content, file.name);
      setParseResult(result);

      if (result.data.length > 0 && result.errors.length === 0) {
        onDataImported(result);
      }
    } catch (error) {
      setParseResult({
        data: [],
        metadata: { source: 'csv', filename: file.name },
        warnings: [],
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsLoading(false);
    }
  }, [onDataImported]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const loadSample = useCallback(async (path: string, filename: string) => {
    setIsLoading(true);
    setParseResult(null);
    try {
      const response = await fetch(path);
      const content = await response.text();
      const result = parseRainfallFile(content, filename);
      setParseResult(result);
      if (result.data.length > 0 && result.errors.length === 0) {
        onDataImported(result);
      }
    } catch (error) {
      setParseResult({
        data: [],
        metadata: { source: 'csv', filename },
        warnings: [],
        errors: [`Failed to load sample: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsLoading(false);
    }
  }, [onDataImported]);

  const clearResult = () => setParseResult(null);

  return (
    <div className="space-y-6">
      {/* Format Guide */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Supported Formats
          </CardTitle>
          <CardDescription>
            Import rainfall data from common engineering and weather service formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="csv" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="noaa">NOAA</TabsTrigger>
              <TabsTrigger value="swmm">SWMM</TabsTrigger>
              <TabsTrigger value="hec">HEC</TabsTrigger>
            </TabsList>
            {Object.entries(formatDescriptions).map(([key, format]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{format.title}</h4>
                      <p className="text-sm text-muted-foreground">{format.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={sampleFiles[key as keyof typeof sampleFiles].path} 
                          download={sampleFiles[key as keyof typeof sampleFiles].name}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Sample
                        </a>
                      </Button>
                      {key === 'csv' && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a 
                            href="/sample-data/sample-month.csv" 
                            download="sample-month.csv"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Multi-Day
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {format.extensions.map(ext => (
                      <Badge key={ext} variant="secondary">{ext}</Badge>
                    ))}
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Example format:</p>
                    <pre className="text-xs font-mono whitespace-pre-wrap">{format.example}</pre>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Card
        className={`transition-all duration-200 ${
          isDragging 
            ? 'border-primary border-2 bg-primary/5' 
            : 'border-dashed border-2 hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-full mb-4 transition-colors ${
              isDragging ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {isDragging ? 'Drop your file here' : 'Import Rainfall Data'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a file, or click to browse
            </p>
            <Button variant="outline" disabled={isLoading} asChild>
              <label className="cursor-pointer">
                {isLoading ? 'Processing...' : 'Select File'}
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.dat,.inp,.gage,.txt"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
              </label>
            </Button>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Or try a sample:</span>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => loadSample('/sample-data/sample-rainfall.csv', 'sample-rainfall.csv')}
              >
                <Zap className="w-3 h-3 mr-1" />
                Single Storm
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => loadSample('/sample-data/sample-month.csv', 'sample-month.csv')}
              >
                <Zap className="w-3 h-3 mr-1" />
                Multi-Day Record
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parse Result */}
      {parseResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {parseResult.errors.length > 0 ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                Import Result
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearResult}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Parse Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {parseResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {parseResult.warnings.slice(0, 5).map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                    {parseResult.warnings.length > 5 && (
                      <li className="text-muted-foreground">
                        ...and {parseResult.warnings.length - 5} more warnings
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Summary */}
            {parseResult.data.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Data Points</p>
                  <p className="font-semibold text-primary">{parseResult.data.length}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Depth</p>
                  <p className="font-semibold text-primary">
                    {parseResult.metadata.totalDepth?.toFixed(2)} {parseResult.metadata.units === 'mm' ? 'mm' : 'in'}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Peak Intensity</p>
                  <p className="font-semibold text-primary">
                    {parseResult.metadata.peakIntensity?.toFixed(2)} {parseResult.metadata.units === 'mm' ? 'mm/hr' : 'in/hr'}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Time Step</p>
                  <p className="font-semibold text-primary">{parseResult.metadata.timeStep} min</p>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudRain className="w-4 h-4" />
              <span>{parseResult.metadata.filename}</span>
              <Badge variant="outline">{parseResult.metadata.source.toUpperCase()}</Badge>
              {parseResult.metadata.station && (
                <Badge variant="secondary">Station: {parseResult.metadata.station}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
