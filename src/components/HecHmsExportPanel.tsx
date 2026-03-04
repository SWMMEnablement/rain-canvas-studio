import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileText, Database, BookOpen, ChevronDown, Info, Package, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { type UnitSystem } from "@/lib/unitConversions";
import { exportHecHmsFile, type HecHmsFormat, type HecHmsGageOptions } from "@/lib/hecHmsExport";

interface RainfallDataPoint {
  time: number;
  intensity: number;
}

interface HecHmsExportPanelProps {
  data: RainfallDataPoint[];
  pattern: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
  projectName?: string;
  engineerName?: string;
  companyName?: string;
}

const FORMAT_OPTIONS: { id: HecHmsFormat; icon: typeof FileText; title: string; ext: string; desc: string; recommended?: boolean }[] = [
  { id: 'gage', icon: FileText, title: 'HEC-HMS Gage File', ext: '.gage', desc: 'Direct import into HEC-HMS Time-Series Data Manager', recommended: true },
  { id: 'dss-csv', icon: Database, title: 'HEC-DSS Import CSV', ext: '.csv', desc: 'Import via HEC-DSSVue into DSS database' },
  { id: 'setup-guide', icon: BookOpen, title: 'Setup Guide', ext: '.txt', desc: 'Step-by-step HEC-HMS configuration instructions' },
];

export function HecHmsExportPanel({ data, pattern, totalDepth, duration, timeStep, unitSystem, projectName, engineerName, companyName }: HecHmsExportPanelProps) {
  const [gageName, setGageName] = useState("DesignStorm_001");
  const [startDate, setStartDate] = useState("01Jan2025");
  const [startTime, setStartTime] = useState("00:00");
  const [selectedFormat, setSelectedFormat] = useState<HecHmsFormat>("gage");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const options: HecHmsGageOptions = useMemo(() => ({
    gageName, startDate, startTime, patternName: pattern,
    totalDepth, durationHours: duration, timestepMinutes: timeStep,
    unitSystem, data, projectName, engineerName, companyName,
  }), [gageName, startDate, startTime, pattern, totalDepth, duration, timeStep, unitSystem, data, projectName, engineerName, companyName]);

  const preview = useMemo(() => {
    try {
      return exportHecHmsFile(selectedFormat, options).content;
    } catch { return ""; }
  }, [selectedFormat, options]);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: HecHmsFormat) => {
    const file = exportHecHmsFile(format, options);
    downloadFile(file.content, file.filename, file.mimeType);
    toast.success(`Exported ${file.filename}`);
  };

  const handleExportAll = () => {
    for (const fmt of FORMAT_OPTIONS) {
      const file = exportHecHmsFile(fmt.id, options);
      downloadFile(file.content, file.filename, file.mimeType);
    }
    toast.success("Downloaded all HEC-HMS files");
  };

  return (
    <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-xl">🏗️</span>
          Export for HEC-HMS
          <Badge variant="secondary" className="text-xs">NEW</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          US Army Corps of Engineers Hydrologic Modeling System
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gage Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Gage Name</Label>
            <Input
              value={gageName}
              onChange={(e) => setGageName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_'))}
              placeholder="DesignStorm_001"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Start Date (DDMonYYYY)</Label>
            <Input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="01Jan2025"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Start Time (HH:MM)</Label>
            <Input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="00:00"
              className="mt-1"
            />
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label className="text-xs">Export Format</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                  selectedFormat === fmt.id
                    ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/50 ring-2 ring-orange-300 dark:ring-orange-700'
                    : 'border-border hover:border-orange-300 bg-card'
                }`}
              >
                <fmt.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  selectedFormat === fmt.id ? 'text-orange-600' : 'text-muted-foreground'
                }`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">{fmt.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">{fmt.ext}</span>
                    {fmt.recommended && (
                      <Badge className="text-[10px] px-1 py-0 bg-orange-500 text-white">★</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-orange-700 dark:text-orange-300 font-medium hover:underline cursor-pointer">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPreview ? 'rotate-180' : ''}`} />
            Preview file contents
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1.5 right-1.5 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(preview).then(() => {
                    setCopied(true);
                    toast.success("Copied to clipboard");
                    setTimeout(() => setCopied(false), 2000);
                  }).catch(() => {
                    toast.error("Clipboard not available — try manually selecting the text");
                  });
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <pre className="p-3 bg-muted rounded-md text-xs overflow-x-auto max-h-48 overflow-y-auto font-mono">
                {preview.slice(0, 1500)}{preview.length > 1500 ? '\n... (truncated)' : ''}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Compatibility Note */}
        <div className="flex items-start gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-md text-xs text-blue-700 dark:text-blue-300">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>Tested with HEC-HMS 4.9–4.12. Compatible with HEC-DSSVue 3.x for DSS imports.</span>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => handleExport(selectedFormat)} className="gap-2 flex-1 bg-orange-600 hover:bg-orange-700 text-white">
            <Download className="w-4 h-4" />
            Download {FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.title}
          </Button>
          <Button onClick={handleExportAll} variant="outline" className="gap-2" title="Download all 3 formats">
            <Package className="w-4 h-4" />
            All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
