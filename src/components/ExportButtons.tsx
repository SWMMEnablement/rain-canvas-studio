import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Droplets, FileSpreadsheet, Loader2, Layers } from "lucide-react";
import { toast } from "sonner";
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";
import { PdfReportGenerator } from "@/components/PdfReportGenerator";
import { HecHmsExportPanel } from "@/components/HecHmsExportPanel";
import { type PatternType, generateRainfallData, prepareExportData } from "@/lib/rainfallPatterns";

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
const ALL_PATTERN_NAMES: Record<string, string> = {
  'scs1a': 'SCS_Type_IA', 'scs1': 'SCS_Type_I', 'scs2': 'SCS_Type_II', 'scs3': 'SCS_Type_III',
  'huff1': 'Huff_1st_Quartile', 'huff2': 'Huff_2nd_Quartile', 'huff3': 'Huff_3rd_Quartile', 'huff4': 'Huff_4th_Quartile',
  'chicago': 'Chicago_Storm', 'desbordes': 'Desbordes', 'arr': 'Australian_ARR', 'dwa': 'German_DWA',
  'block': 'Block', 'triangular': 'Triangular', 'double': 'Double_Peak', 'trapezoidal': 'Trapezoidal',
  'fsr': 'FSR', 'jma': 'JMA', 'china': 'China', 'sa_huff': 'SA_Huff', 'dutch': 'Dutch', 'italian': 'Italian',
  'balanced': 'Balanced_Storm',
  'fdot1': 'FDOT_Zone_1', 'fdot2': 'FDOT_Zone_2', 'fdot3': 'FDOT_Zone_3', 'fdot4': 'FDOT_Zone_4', 'fdot5': 'FDOT_Zone_5',
  'txdot': 'TxDOT', 'yen_chow': 'Yen_Chow', 'noaa_a14': 'NOAA_Atlas_14', 'udfcd': 'UDFCD_Denver',
  'usace_sps': 'USACE_SPS', 'pmp_hmr': 'PMP_HMR', 'feh': 'FEH_UK',
  'euler1': 'Euler_Type_I', 'euler2': 'Euler_Type_II', 'desbordes_double': 'Double_Triangle',
  'canadian': 'Canadian_CDA', 'singapore_pub': 'Singapore_PUB',
  'china_gb50014': 'China_GB50014', 'china_prd': 'China_PRD',
  'india_imd': 'India_IMD', 'india_coastal': 'India_Coastal',
  'japan_amedas': 'Japan_AMeDAS', 'japan_baiu': 'Japan_Baiu', 'japan_typhoon': 'Japan_Typhoon',
  'korea_kma': 'Korea_KMA', 'malaysia_msma': 'Malaysia_MSMA',
  'indonesia_bmkg': 'Indonesia_BMKG', 'philippines_pagasa': 'Philippines_PAGASA',
  'vietnam_imhen': 'Vietnam_IMHEN', 'thailand_tmd': 'Thailand_TMD',
  'saudi_pme': 'Saudi_Arabia_PME', 'uae_ncms': 'UAE_NCMS',
  'qatar_kahramaa': 'Qatar_Kahramaa', 'oman_dgman': 'Oman_DGMAN',
  'sa_sanral': 'SA_SANRAL', 'kenya_kmd': 'Kenya_KMD',
  'nigeria_nimet': 'Nigeria_NiMet', 'egypt_hcww': 'Egypt_HCWW',
  'brazil_ana': 'Brazil_ANA', 'mexico_conagua': 'Mexico_CONAGUA',
  'colombia_ideam': 'Colombia_IDEAM', 'chile_dga': 'Chile_DGA',
  'nz_tp108': 'Auckland_TP108', 'nz_wellington': 'Wellington_Regional',
  'nz_christchurch': 'Christchurch_Canterbury',
  'sifalda': 'Sifalda_Czech', 'danish_svk': 'Denmark_SVK',
  'swedish_smhi': 'Sweden_SMHI', 'norwegian_nve': 'Norway_NVE',
  'finnish_fmi': 'Finland_FMI', 'swiss_idf': 'Swiss_IDF',
  'spanish_cedex': 'Spain_CEDEX', 'belgian_irm': 'Belgium_IRM',
  'pilgrim_cordery': 'Pilgrim_Cordery', 'watts_curve': 'Watts_Curve',
  'hong_kong_hko': 'Hong_Kong_HKO', 'taiwan_cwa': 'Taiwan_CWA',
  'bangladesh_bmd': 'Bangladesh_BMD', 'pakistan_pmd': 'Pakistan_PMD',
  'sri_lanka': 'Sri_Lanka', 'fiji_fms': 'Fiji_FMS',
  'argentina_smn': 'Argentina_SMN', 'peru_senamhi': 'Peru_SENAMHI',
  'ecuador_inamhi': 'Ecuador_INAMHI', 'venezuela_inameh': 'Venezuela_INAMEH',
  'puerto_rico': 'Puerto_Rico', 'morocco_dmn': 'Morocco_DMN',
  'ethiopia_nma': 'Ethiopia_NMA', 'ghana_gmet': 'Ghana_GMet',
  'tanzania_tma': 'Tanzania_TMA', 'mozambique_inam': 'Mozambique_INAM',
  'hirds_nz': 'HIRDS_NZ', 'arid_flash_flood': 'Arid_Flash_Flood',
  'aes_30': 'AES_Canada_30', 'aes_40': 'AES_Canada_40',
  'kostra_dwd': 'KOSTRA_DWD', 'dubai_dm': 'Dubai_Municipality',
  'dubai_dm_combined': 'Dubai_DM_Combined', 'abu_dhabi_adm': 'Abu_Dhabi_ADM',
  'montana_caquot': 'Montana_Caquot_FR', 'm5_60_fsr': 'M5_60_UK_Ireland',
  'arr2019': 'ARR_2019_Ensemble', 'upm_plata': 'UPM_Rio_de_la_Plata',
  'feh22_refh2': 'FEH22_ReFH2', 'noaa_a15': 'NOAA_Atlas_15', 'eccc_idf': 'ECCC_IDF',
  'shyreg_fr': 'SHYREG_FR', 'ireland_met': 'Ireland_Met_Eireann',
  'arr87_legacy': 'ARR87_Legacy', 'hk_dsd_2018': 'HK_DSD_2018',
  'malaysia_hp1': 'Malaysia_HP1', 'austria_okostra': 'Austria_OKOSTRA',
  'g2p_gamma': 'G2P_Gamma', 'poland_bs': 'Poland_Bogdanowicz_Stachy',
  'belgium_willems': 'Belgium_Willems', 'russia_snip': 'Russia_SNiP',
  'turkey_dsi': 'Turkey_DSI', 'korea_molit': 'Korea_MOLIT',
  'greece_hellenic': 'Greece_Hellenic', 'romania_stas': 'Romania_STAS',
  'pmp_wmo': 'PMP_WMO_Generalized', 'nested_envelope': 'Nested_Envelope',
  'arnell_sweden': 'Arnell_Sweden', 'tenax_cds': 'TENAX_CDS', 'avm': 'Average_Variability',
  'sa_scs1': 'SA_SCS_Type_1', 'sa_scs2': 'SA_SCS_Type_2', 'sa_scs3': 'SA_SCS_Type_3', 'sa_scs4': 'SA_SCS_Type_4',
};

export function ExportButtons({ data, pattern, patternKey, totalDepth, duration, timeStep, unitSystem }: ExportButtonsProps) {
  const [batchExporting, setBatchExporting] = useState(false);

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
          script += `${tsName.padEnd(24)} 00:00     0.0000\n`;

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
          patternKey={patternKey}
          totalDepth={totalDepth}
          duration={duration}
          timeStep={timeStep}
          unitSystem={unitSystem}
        />
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
      />
    </div>
  );
}
