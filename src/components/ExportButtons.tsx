import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileText, Droplets, FileSpreadsheet, Loader2, Layers, Settings, Database, Copy, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";
import { buildIcmEventCsv } from "@/lib/icmCsvExport";
import { PdfReportGenerator } from "@/components/PdfReportGenerator";
import { HecHmsExportPanel } from "@/components/HecHmsExportPanel";
import { type PatternType, generateRainfallData, prepareExportData } from "@/lib/rainfallPatterns";
import { CANONICAL_PATTERN_IDS, PATTERN_NAMES } from "../../supabase/functions/_shared/patternCatalog";

interface RainfallDataPoint {
  time: number;
  intensity: number;
}

interface ExportButtonsProps {
  data: RainfallDataPoint[];
  pattern: string;
  patternKey?: PatternType;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

/** Map of all computational pattern keys to display names (excludes 'custom') */
// Derived from the shared catalogue so the batch export always contains exactly the canonical predefined set.
const ALL_PATTERN_NAMES: Record<string, string> = Object.fromEntries(
  CANONICAL_PATTERN_IDS.filter((id) => id !== 'custom').map((id) => [id, PATTERN_NAMES[id] ?? id]),
);

export function ExportButtons({ data, pattern, patternKey, totalDepth, duration, timeStep, unitSystem }: ExportButtonsProps) {
  const [batchExporting, setBatchExporting] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [copiedSwmm, setCopiedSwmm] = useState(false);
  const [copiedIcm, setCopiedIcm] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHcr, setCopiedHcr] = useState(false);
  const [copiedDat, setCopiedDat] = useState(false);

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

  const generateHeader = (format: string) => {
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const depthUnit = getDepthUnit(unitSystem);
    const intensityUnit = getIntensityUnit(unitSystem);
    const peakIntensity = Math.max(...data.map(d => convertIntensity(d.intensity, 'USA', unitSystem)));
    const peakIndex = data.findIndex(d => d.intensity === Math.max(...data.map(d => d.intensity)));
    const peakTime = peakIndex >= 0 ? data[peakIndex].time : 0;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
    const prefix = format === 'csv' ? '# ' : '; ';

    const lines = [
      `${prefix}==========================================`,
      `${prefix}Rain Canvas Studio Export`,
      `${prefix}Generated: ${timestamp}`,
      `${prefix}==========================================`,
    ];
    if (projectName) lines.push(`${prefix}Project:        ${projectName}`);
    if (engineerName) lines.push(`${prefix}Engineer:       ${engineerName}`);
    if (companyName) lines.push(`${prefix}Company:        ${companyName}`);
    if (projectName || engineerName || companyName) lines.push(`${prefix}------------------------------------------`);
    lines.push(
      `${prefix}Total Depth:    ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${depthUnit}`,
      `${prefix}Duration:       ${duration} hours`,
      `${prefix}Time Step:      ${timeStep} minutes`,
      `${prefix}Pattern:        ${pattern}`,
      `${prefix}Peak Intensity: ${peakIntensity.toFixed(2)} ${intensityUnit} at t=${peakTime.toFixed(2)} hr`,
      `${prefix}Unit System:    ${unitSystem}`,
      `${prefix}==========================================`,
      '',
    );
    return lines.join('\n');
  };

  const buildCsvContent = () => {
    const intensityUnit = getIntensityUnit(unitSystem);
    let csvContent = generateHeader('csv');
    csvContent += `Time (hr),Intensity (${intensityUnit})\n`;
    data.forEach(point => {
      const intensity = convertIntensity(point.intensity, 'USA', unitSystem);
      const decimals = unitSystem === 'USA' ? 4 : 2;
      csvContent += `${point.time.toFixed(2)},${intensity.toFixed(decimals)}\n`;
    });
    return csvContent;
  };

  const exportAsCsv = () => {
    downloadFile(buildCsvContent(), 'rainfall_pattern.csv', 'text/csv');
    toast.success("Exported as CSV");
  };

  const buildJsonContent = () => {
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const peakIntensity = Math.max(...data.map(d => convertIntensity(d.intensity, 'USA', unitSystem)));
    const peakIndex = data.findIndex(d => d.intensity === Math.max(...data.map(d => d.intensity)));
    const peakTime = peakIndex >= 0 ? data[peakIndex].time : 0;
    const jsonData: Record<string, any> = {
      _generator: "Rain Canvas Studio",
      _generated: new Date().toISOString(),
      ...(projectName && { projectName }),
      ...(engineerName && { engineer: engineerName }),
      ...(companyName && { company: companyName }),
      pattern,
      totalDepth: exportDepth,
      depthUnit: getDepthUnit(unitSystem),
      duration,
      timeStep,
      unitSystem,
      peakIntensity,
      peakIntensityUnit: getIntensityUnit(unitSystem),
      timeToPeak: peakTime,
      timeseries: data.map(point => ({
        time: point.time,
        intensity: convertIntensity(point.intensity, 'USA', unitSystem)
      })),
    };
    return JSON.stringify(jsonData, null, 2);
  };

  const exportAsJson = () => {
    downloadFile(buildJsonContent(), 'rainfall_pattern.json', 'application/json');
    toast.success("Exported as JSON");
  };

  const buildSwmmScript = () => {
    const intensityUnit = getIntensityUnit(unitSystem);
    
    let script = generateHeader('swmm');
    script += `[TIMESERIES]\n`;
    script += `;Name       Date       Time       Value (${intensityUnit})\n`;

    data.forEach(point => {
      const hours = Math.floor(point.time);
      const minutes = Math.round((point.time - hours) * 60);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const intensity = convertIntensity(point.intensity, 'USA', unitSystem);
      const decimals = unitSystem === 'USA' ? 4 : 2;
      script += `RainPattern             ${timeStr}     ${intensity.toFixed(decimals)}\n`;
    });

    return script;
  };

  const exportIcmCsv = () => {
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const csv = buildIcmEventCsv({
      title: pattern,
      description: `${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)} over ${duration} h at ${timeStep} min - Rain Canvas Studio`,
      intensities: data.map(p => convertIntensity(p.intensity, 'USA', unitSystem)),
      timeStepMin: timeStep,
      units: unitSystem === 'USA' ? 'in/hr' : 'mm/hr',
    });
    const safe = (patternKey || 'storm').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(csv, `icm_rainfall_event_${safe}.csv`, 'text/csv');
    toast.success("Exported InfoWorks ICM event CSV");
  };

  const generateSwmmScript = () => {
    downloadFile(buildSwmmScript(), 'swmm_rainfall_pattern.txt', 'text/plain');
    toast.success("Generated SWMM script");
  };

  const buildSwmmDatContent = () => {
    const depthUnit = getDepthUnit(unitSystem);
    const totalDepthConverted = convertDepth(totalDepth, 'USA', unitSystem);
    const timeStepHr = timeStep / 60;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

    let dat = '';
    dat += `; EPA SWMM Rainfall Data File (.dat)\n`;
    dat += `; Generated by Rain Canvas Studio\n`;
    dat += `; ${timestamp}\n`;
    dat += `;\n`;
    if (projectName) dat += `; Project:    ${projectName}\n`;
    if (engineerName) dat += `; Engineer:   ${engineerName}\n`;
    if (companyName) dat += `; Company:    ${companyName}\n`;
    if (projectName || engineerName || companyName) dat += `;\n`;
    dat += `; Pattern:    ${pattern}\n`;
    dat += `; Total Depth: ${totalDepthConverted.toFixed(unitSystem === 'USA' ? 2 : 1)} ${depthUnit}\n`;
    dat += `; Duration:   ${duration} hours\n`;
    dat += `; Time Step:  ${timeStep} minutes\n`;
    dat += `; Units:      ${unitSystem === 'USA' ? 'IN (inches)' : 'MM (millimeters)'}\n`;
    dat += `;\n`;
    dat += `; Format: Station Year Month Day Hour Minute Value\n`;
    dat += `; Value = incremental depth per timestep (${depthUnit})\n`;
    dat += `;\n`;

    const baseDate = new Date(2025, 0, 1, 0, 0, 0);
    const stationId = 'STA001';

    data.forEach(d => {
      const intensity = convertIntensity(d.intensity, 'USA', unitSystem);
      const depth = intensity * timeStepHr;
      const currentDate = new Date(baseDate.getTime() + d.time * 3600000);
      const yr = currentDate.getFullYear();
      const mo = String(currentDate.getMonth() + 1).padStart(2, ' ');
      const dy = String(currentDate.getDate()).padStart(2, ' ');
      const hr = String(currentDate.getHours()).padStart(2, ' ');
      const mn = String(currentDate.getMinutes()).padStart(2, '0');
      const decimals = unitSystem === 'USA' ? 4 : 2;
      dat += `${stationId}  ${yr}  ${mo}  ${dy}  ${hr}  ${mn}  ${depth.toFixed(decimals)}\n`;
    });

    return dat;
  };

  const exportSwmmDat = () => {
    downloadFile(buildSwmmDatContent(), `swmm_rainfall_${pattern.replace(/\s+/g, '_')}.dat`, 'text/plain');
    toast.success("Exported EPA SWMM .dat file");
  };

  const buildInfoWorksScript = () => {
    const totalDepthMm = convertDepth(totalDepth, 'USA', 'SI');
    
    let script = `; InfoWorks ICM Rainfall Profile Generated by Rain Canvas Studio
; Pattern: ${pattern}
; Total Depth: ${totalDepthMm.toFixed(2)} mm
; Duration: ${duration} hours
; Time Step: ${timeStep} minutes
; Source Unit System: ${unitSystem}
`;
    if (projectName) script += `; Project: ${projectName}\n`;
    if (engineerName) script += `; Engineer: ${engineerName}\n`;
    if (companyName) script += `; Company: ${companyName}\n`;
    script += `
[RAINFALL PROFILE]
;Time(mins)  Intensity(mm/hr)
0            0.0000\n`;

    data.forEach(point => {
      const timeMinutes = (point.time * 60).toFixed(1);
      const intensityMmHr = convertIntensity(point.intensity, 'USA', 'SI');
      script += `${timeMinutes.padStart(12)}  ${intensityMmHr.toFixed(2)}\n`;
    });

    const peakIntensityMm = Math.max(...data.map(d => convertIntensity(d.intensity, 'USA', 'SI')));
    const peakTime = data[data.findIndex(d => d.intensity === Math.max(...data.map(d => d.intensity)))].time;
    
    script += `\n; Summary Statistics
; Total Depth: ${totalDepthMm.toFixed(2)} mm
; Peak Intensity: ${peakIntensityMm.toFixed(2)} mm/hr
; Time to Peak: ${peakTime.toFixed(2)} hours
; Storm Duration: ${duration} hours`;

    return script;
  };

  const generateInfoWorksScript = () => {
    downloadFile(buildInfoWorksScript(), 'infoworks_rainfall_profile.txt', 'text/plain');
    toast.success("Generated InfoWorks ICM profile");
  };

  const buildHydroCADContent = () => {
    const depthUnit = getDepthUnit(unitSystem);
    const totalDepthConverted = convertDepth(totalDepth, 'USA', unitSystem);
    const timeStepHr = timeStep / 60;

    const depths = data.map(d => {
      const intensity = convertIntensity(d.intensity, 'USA', unitSystem);
      return intensity * timeStepHr;
    });

    let hcr = `; HydroCAD Rainfall Data File (.hcr)\n`;
    hcr += `; Generated by Rain Canvas Studio\n`;
    hcr += `; ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC\n`;
    hcr += `;\n`;
    if (projectName) hcr += `; Project: ${projectName}\n`;
    if (engineerName) hcr += `; Engineer: ${engineerName}\n`;
    if (companyName) hcr += `; Company: ${companyName}\n`;
    if (projectName || engineerName || companyName) hcr += `;\n`;
    hcr += `; Pattern: ${pattern}\n`;
    hcr += `; Total Depth: ${totalDepthConverted.toFixed(unitSystem === 'USA' ? 2 : 1)} ${depthUnit}\n`;
    hcr += `; Duration: ${duration} hours\n`;
    hcr += `; Time Step: ${timeStep} minutes\n`;
    hcr += `;\n`;
    hcr += `; Time(hr)  Depth(${depthUnit})\n`;

    data.forEach((point, i) => {
      const timeStr = point.time.toFixed(4).padStart(10);
      const depthStr = depths[i].toFixed(4).padStart(10);
      hcr += `${timeStr}${depthStr}\n`;
    });

    return hcr;
  };

  const exportHydroCAD = () => {
    downloadFile(buildHydroCADContent(), 'rainfall.hcr', 'text/plain');
    toast.success("Exported HydroCAD .hcr file");
  };

  const copyToClipboard = (content: string, label: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Clipboard not available — try manually selecting the text");
    });
  };

  /** Generate a single SWMM5 file with ALL patterns */
  const exportAllPatternsSwmm5 = () => {
    setBatchExporting(true);
    try {
      const intensityUnit = getIntensityUnit(unitSystem);
      const depthUnit = getDepthUnit(unitSystem);
      const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

      let script = '';
      script += `; ==========================================\n`;
      script += `; Rain Canvas Studio — All Patterns SWMM5 Export\n`;
      script += `; Generated: ${timestamp}\n`;
      script += `; ==========================================\n`;
      script += `; Total Depth:  ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${depthUnit}\n`;
      script += `; Duration:     ${duration} hours\n`;
      script += `; Time Step:    ${timeStep} minutes\n`;
      script += `; Unit System:  ${unitSystem}\n`;
      script += `; Patterns:     ${Object.keys(ALL_PATTERN_NAMES).length}\n`;
      script += `; ==========================================\n\n`;
      script += `[TIMESERIES]\n`;
      script += `;Name                    Time       Value (${intensityUnit})\n`;

      let successCount = 0;
      let failCount = 0;

      for (const [key, name] of Object.entries(ALL_PATTERN_NAMES)) {
        try {
          const intensities = generateRainfallData(key as PatternType, totalDepth, duration, timeStep);
          if (!intensities || intensities.length === 0) {
            failCount++;
            continue;
          }

          const exportPoints = prepareExportData(intensities, timeStep);
          const tsName = `TS_${name}`.slice(0, 30); // SWMM5 name limit

          script += `;\n; --- ${name} ---\n`;

          exportPoints.forEach(point => {
            const hours = Math.floor(point.time);
            const minutes = Math.round((point.time - hours) * 60);
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const intensity = convertIntensity(point.intensity, 'USA', unitSystem);
            const decimals = unitSystem === 'USA' ? 4 : 2;
            script += `${tsName.padEnd(24)} ${timeStr}     ${intensity.toFixed(decimals)}\n`;
          });

          successCount++;
        } catch (err) {
          failCount++;
          console.warn(`Skipped pattern ${key}:`, err);
        }
      }

      script += `\n; ==========================================\n`;
      script += `; Export Summary: ${successCount} patterns exported`;
      if (failCount > 0) script += `, ${failCount} skipped`;
      script += `\n; ==========================================\n`;

      downloadFile(script, `all_patterns_${exportDepth.toFixed(1)}${depthUnit}_${duration}hr.inp`, 'text/plain');
      toast.success(`Exported ${successCount} patterns to SWMM5 file`);
    } catch (err) {
      console.error("Batch SWMM5 export error:", err);
      toast.error("Failed to export all patterns");
    } finally {
      setBatchExporting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Project Details (shared across all exports) */}
      <Collapsible open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground h-7 px-2">
            <Settings className="w-3 h-3" />
            {showProjectDetails ? "Hide" : "Add"} project details
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg mt-1">
            <div>
              <Label className="text-xs">Project Name</Label>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Project name..." className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Engineer</Label>
              <Input value={engineerName} onChange={e => setEngineerName(e.target.value)} placeholder="Engineer name..." className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Company</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name..." className="mt-1 h-8 text-xs" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="flex items-center">
          <Button onClick={exportAsCsv} variant="secondary" className="gap-2 rounded-r-none flex-1">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy CSV to clipboard"
            onClick={() => copyToClipboard(buildCsvContent(), 'CSV', setCopiedCsv)}
          >
            {copiedCsv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center">
          <Button onClick={exportAsJson} variant="secondary" className="gap-2 rounded-r-none flex-1">
            <FileJson className="w-4 h-4" />
            Export JSON
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy JSON to clipboard"
            onClick={() => copyToClipboard(buildJsonContent(), 'JSON', setCopiedJson)}
          >
            {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center">
          <Button onClick={generateSwmmScript} variant="secondary" className="gap-2 rounded-r-none flex-1">
            <FileText className="w-4 h-4" />
            SWMM Script
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy SWMM script to clipboard"
            onClick={() => copyToClipboard(buildSwmmScript(), 'SWMM script', setCopiedSwmm)}
          >
            {copiedSwmm ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <Button onClick={exportIcmCsv} className="gap-2" title="Native InfoWorks ICM rainfall event CSV (type=RED) — import via Rainfall Event › Import › CSV">
          <Droplets className="w-4 h-4" />
          ICM Rainfall Event CSV (native import)
        </Button>
        <div className="flex items-center">
          <Button onClick={generateInfoWorksScript} className="gap-2 rounded-r-none flex-1">
            <Droplets className="w-4 h-4" />
            ICM Profile Text (reference, paste manually)
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy InfoWorks ICM to clipboard"
            onClick={() => copyToClipboard(buildInfoWorksScript(), 'InfoWorks ICM profile', setCopiedIcm)}
          >
            {copiedIcm ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center">
          <Button onClick={exportHydroCAD} variant="secondary" className="gap-2 rounded-r-none flex-1">
            <FileSpreadsheet className="w-4 h-4" />
            HydroCAD .hcr
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy HydroCAD to clipboard"
            onClick={() => copyToClipboard(buildHydroCADContent(), 'HydroCAD', setCopiedHcr)}
          >
            {copiedHcr ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="flex items-center">
          <Button onClick={exportSwmmDat} variant="secondary" className="gap-2 rounded-r-none flex-1">
            <Database className="w-4 h-4" />
            SWMM .dat
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-l-none border-l-0 w-9 shrink-0"
            title="Copy SWMM .dat to clipboard"
            onClick={() => copyToClipboard(buildSwmmDatContent(), 'SWMM .dat', setCopiedDat)}
          >
            {copiedDat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <PdfReportGenerator
            data={data}
            pattern={pattern}
            patternKey={patternKey}
            totalDepth={totalDepth}
            duration={duration}
            timeStep={timeStep}
            unitSystem={unitSystem}
            projectName={projectName}
            engineerName={engineerName}
            companyName={companyName}
          />
        </div>
      </div>

      {/* Batch SWMM5 All-Patterns Export */}
      <Button
        onClick={exportAllPatternsSwmm5}
        disabled={batchExporting}
        variant="outline"
        className="gap-2 w-full border-dashed"
      >
        {batchExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Layers className="w-4 h-4" />
        )}
        {batchExporting ? "Generating all patterns…" : "Download All Patterns to SWMM5 (.inp)"}
      </Button>

      {/* HEC-HMS Export Panel */}
      <HecHmsExportPanel
        data={data}
        pattern={pattern}
        totalDepth={totalDepth}
        duration={duration}
        timeStep={timeStep}
        unitSystem={unitSystem}
        projectName={projectName}
        engineerName={engineerName}
        companyName={companyName}
      />
    </div>
  );
}
