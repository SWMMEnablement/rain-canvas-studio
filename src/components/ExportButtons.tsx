import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Droplets, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";
import { PdfReportGenerator } from "@/components/PdfReportGenerator";
import { HecHmsExportPanel } from "@/components/HecHmsExportPanel";

interface RainfallDataPoint {
  time: number;
  intensity: number;
}

interface ExportButtonsProps {
  data: RainfallDataPoint[];
  pattern: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

export function ExportButtons({ data, pattern, totalDepth, duration, timeStep, unitSystem }: ExportButtonsProps) {
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

    return [
      `${prefix}==========================================`,
      `${prefix}Rain Canvas Studio Export`,
      `${prefix}Generated: ${timestamp}`,
      `${prefix}==========================================`,
      `${prefix}Total Depth:    ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${depthUnit}`,
      `${prefix}Duration:       ${duration} hours`,
      `${prefix}Time Step:      ${timeStep} minutes`,
      `${prefix}Pattern:        ${pattern}`,
      `${prefix}Peak Intensity: ${peakIntensity.toFixed(2)} ${intensityUnit} at t=${peakTime.toFixed(2)} hr`,
      `${prefix}Unit System:    ${unitSystem}`,
      `${prefix}==========================================`,
      '',
    ].join('\n');
  };

  const exportAsCsv = () => {
    const intensityUnit = getIntensityUnit(unitSystem);
    let csvContent = generateHeader('csv');
    csvContent += `Time (hr),Intensity (${intensityUnit})\n`;
    data.forEach(point => {
      const intensity = convertIntensity(point.intensity, 'USA', unitSystem);
      const decimals = unitSystem === 'USA' ? 4 : 2;
      csvContent += `${point.time.toFixed(2)},${intensity.toFixed(decimals)}\n`;
    });
    downloadFile(csvContent, 'rainfall_pattern.csv', 'text/csv');
    toast.success("Exported as CSV");
  };

  const exportAsJson = () => {
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const peakIntensity = Math.max(...data.map(d => convertIntensity(d.intensity, 'USA', unitSystem)));
    const peakIndex = data.findIndex(d => d.intensity === Math.max(...data.map(d => d.intensity)));
    const peakTime = peakIndex >= 0 ? data[peakIndex].time : 0;
    const jsonData = {
      _generator: "Rain Canvas Studio",
      _generated: new Date().toISOString(),
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
    downloadFile(JSON.stringify(jsonData, null, 2), 'rainfall_pattern.json', 'application/json');
    toast.success("Exported as JSON");
  };

  const generateSwmmScript = () => {
    const intensityUnit = getIntensityUnit(unitSystem);
    
    let script = generateHeader('swmm');
    script += `[TIMESERIES]\n`;
    script += `;Name       Date       Time       Value (${intensityUnit})\n`;
    script += `RainPattern             00:00     0.0000\n`;

    data.forEach(point => {
      const hours = Math.floor(point.time);
      const minutes = Math.round((point.time - hours) * 60);
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const intensity = convertIntensity(point.intensity, 'USA', unitSystem);
      const decimals = unitSystem === 'USA' ? 4 : 2;
      script += `RainPattern             ${timeStr}     ${intensity.toFixed(decimals)}\n`;
    });

    downloadFile(script, 'swmm_rainfall_pattern.txt', 'text/plain');
    toast.success("Generated SWMM script");
  };

  const generateInfoWorksScript = () => {
    // InfoWorks ICM always uses mm/hr
    const totalDepthMm = convertDepth(totalDepth, 'USA', 'SI');
    
    let script = `; InfoWorks ICM Rainfall Profile Generated by Pattern Painter
; Pattern: ${pattern}
; Total Depth: ${totalDepthMm.toFixed(2)} mm
; Duration: ${duration} hours
; Time Step: ${timeStep} minutes
; Source Unit System: ${unitSystem}

[RAINFALL PROFILE]
;Time(mins)  Intensity(mm/hr)
0            0.0000\n`;

    data.forEach(point => {
      const timeMinutes = (point.time * 60).toFixed(1);
      const intensityMmHr = convertIntensity(point.intensity, 'USA', 'SI');
      script += `${timeMinutes.padStart(12)}  ${intensityMmHr.toFixed(2)}\n`;
    });

    // Add summary statistics
    const peakIntensityMm = Math.max(...data.map(d => convertIntensity(d.intensity, 'USA', 'SI')));
    const peakTime = data[data.findIndex(d => d.intensity === Math.max(...data.map(d => d.intensity)))].time;
    
    script += `\n; Summary Statistics
; Total Depth: ${totalDepthMm.toFixed(2)} mm
; Peak Intensity: ${peakIntensityMm.toFixed(2)} mm/hr
; Time to Peak: ${peakTime.toFixed(2)} hours
; Storm Duration: ${duration} hours`;

    downloadFile(script, 'infoworks_rainfall_profile.txt', 'text/plain');
    toast.success("Generated InfoWorks ICM profile");
  };


  const exportHydroCAD = () => {
    const depthUnit = getDepthUnit(unitSystem);
    const totalDepthConverted = convertDepth(totalDepth, 'USA', unitSystem);
    const timeStepHr = timeStep / 60;

    // HydroCAD uses a simple two-column format: elapsed time (hr) and incremental depth per step
    const depths = data.map(d => {
      const intensity = convertIntensity(d.intensity, 'USA', unitSystem);
      return intensity * timeStepHr;
    });

    let hcr = `; HydroCAD Rainfall Data File (.hcr)\n`;
    hcr += `; Generated by Rain Canvas Studio\n`;
    hcr += `; ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC\n`;
    hcr += `;\n`;
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

    downloadFile(hcr, 'rainfall.hcr', 'text/plain');
    toast.success("Exported HydroCAD .hcr file");
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportAsCsv} variant="secondary" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button onClick={exportAsJson} variant="secondary" className="gap-2">
          <FileJson className="w-4 h-4" />
          Export JSON
        </Button>
        <Button onClick={generateSwmmScript} variant="secondary" className="gap-2">
          <FileText className="w-4 h-4" />
          SWMM Script
        </Button>
        <Button onClick={generateInfoWorksScript} className="gap-2">
          <Droplets className="w-4 h-4" />
          InfoWorks ICM
        </Button>
        <Button onClick={exportHydroCAD} variant="secondary" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          HydroCAD .hcr
        </Button>
        <PdfReportGenerator
          data={data}
          pattern={pattern}
          totalDepth={totalDepth}
          duration={duration}
          timeStep={timeStep}
          unitSystem={unitSystem}
        />
      </div>

      {/* HEC-HMS Export Panel */}
      <HecHmsExportPanel
        data={data}
        pattern={pattern}
        totalDepth={totalDepth}
        duration={duration}
        timeStep={timeStep}
        unitSystem={unitSystem}
      />
    </div>
  );
}