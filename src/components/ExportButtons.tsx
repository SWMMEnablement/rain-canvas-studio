import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileJson, FileText, Droplets, FileSpreadsheet, Loader2, Layers, Settings, Database, Copy, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  // v4 — Global expansion
  'france_shypre': 'France_SHYPRE', 'poland_panda': 'Poland_PANDA', 'turkey_mgm': 'Turkey_MGM',
  'israel_ims': 'Israel_IMS', 'iran_irimo': 'Iran_IRIMO', 'iraq_mos': 'Iraq_MoS',
  'kazakhstan_kazhydromet': 'Kazakhstan_Kazhydromet', 'russia_roshydromet': 'Russia_Roshydromet',
  'portugal_ipma': 'Portugal_IPMA', 'nz_niwa': 'NZ_NIWA', 'csa_w231': 'CSA_W231', 'sa_wrc': 'SA_WRC',
  'west_africa_cilss': 'West_Africa_CILSS', 'noaa_a16': 'NOAA_Atlas_16', 'euro_cordex': 'Euro_CORDEX',
  'mongolia_namem': 'Mongolia_NAMEM', 'pacific_sprep': 'Pacific_SPREP', 'czech_chmu': 'Czech_CHMU',
  // v5 — Caribbean, Mediterranean, Parametric
  'barbados_bms': 'Barbados_BMS', 'oecs_caribbean': 'OECS_Caribbean', 'cyprus_wdd': 'Cyprus_WDD',
  'malta_mra': 'Malta_MRA', 'bolivia_altiplano': 'Bolivia_Altiplano',
  'fourier_multipeak': 'Fourier_Multipeak', 'cc_idf_scaled': 'CC_IDF_Scaled',
  // v6 — Missing Design Storms
  'g2p_gamma': 'G2P_Gamma', 'poland_bs': 'Poland_Bogdanowicz_Stachy',
  'belgium_willems': 'Belgium_Willems', 'russia_snip': 'Russia_SNiP',
  'turkey_dsi': 'Turkey_DSI', 'korea_molit': 'Korea_MOLIT',
  'greece_hellenic': 'Greece_Hellenic', 'romania_stas': 'Romania_STAS',
  'pmp_wmo': 'PMP_WMO_Generalized', 'nested_envelope': 'Nested_Envelope',
  'arnell_sweden': 'Arnell_Sweden', 'tenax_cds': 'TENAX_CDS', 'avm': 'Average_Variability',
  'sa_scs1': 'SA_SCS_Type_1', 'sa_scs2': 'SA_SCS_Type_2', 'sa_scs3': 'SA_SCS_Type_3', 'sa_scs4': 'SA_SCS_Type_4',
  // v10 — Poland & Eastern Europe
  'atv_a121': 'ATV_A_121', 'dwa_a118': 'DWA_A_118', 'blaszczyk': 'Blaszczyk',
  'imgw_cluster1': 'IMGW_Cluster_1', 'imgw_cluster2': 'IMGW_Cluster_2', 'imgw_cluster3': 'IMGW_Cluster_3',
  'imgw_cluster4': 'IMGW_Cluster_4', 'imgw_cluster5': 'IMGW_Cluster_5',
  'wroclaw_2050': 'Wroclaw_2050', 'trupl': 'Trupl_Czech', 'samaj_valovic': 'Samaj_Valovic',
  'hungarian_msz': 'Hungarian_MSZ', 'budapest_convective': 'Budapest_Convective', 'owav_rb11': 'OWAV_Regelblatt_11',
  // v11 — High-value additions
  'croatian_dhmz': 'Croatian_DHMZ', 'beta_distribution': 'Beta_Distribution',
  'cc_clausius': 'Clausius_Clapeyron', 'bartlett_lewis': 'Bartlett_Lewis',
  'tropical_cyclone': 'Tropical_Cyclone_Rainband', 'atmospheric_river': 'Atmospheric_River',
  'algeria_anrh': 'Algeria_ANRH', 'west_africa_cieh': 'West_Africa_CIEH',
  'portugal_lnec': 'Portugal_LNEC', 'costa_rica_imn': 'Costa_Rica_IMN',
  'nepal_dhm': 'Nepal_DHM', 'nyc_dep': 'NYC_DEP',
  'post_wildfire': 'Post_Wildfire', 'bimodal_gaussian': 'Bimodal_Gaussian',
  // v12 — Massive expansion
  'serbian_rhmz': 'Serbian_RHMZ', 'bulgarian_nimh': 'Bulgarian_NIMH', 'slovenian_arso': 'Slovenian_ARSO',
  'ukrainian_dbn': 'Ukrainian_DBN', 'lithuanian_hms': 'Lithuanian_HMS', 'latvian_lvgmc': 'Latvian_LVGMC',
  'estonian_emhi': 'Estonian_EMHI', 'soviet_snip_legacy': 'Soviet_SNiP_Legacy', 'belarusian_tkp': 'Belarusian_TKP',
  'icelandic_imo': 'Icelandic_IMO', 'svensson_jones': 'Svensson_Jones', 'reunion_mf': 'Reunion_Meteo_France',
  'azores_ipma': 'Azores_Madeira_IPMA',
  'jordan_jmd': 'Jordan_JMD', 'lebanon_cav': 'Lebanon_Civil_Aviation', 'kuwait_mew': 'Kuwait_MEW',
  'bahrain_met': 'Bahrain_MET', 'yemen_cama': 'Yemen_CAMA',
  'myanmar_dmh': 'Myanmar_DMH', 'mekong_mrc': 'Mekong_MRC', 'mononobe': 'Mononobe_Japan',
  'uzbekistan_uhm': 'Uzbekistan_UHM',
  'tunisia_inm': 'Tunisia_INM', 'uganda_unma': 'Uganda_UNMA', 'cameroon_ird': 'Cameroon_IRD',
  'madagascar_dgm': 'Madagascar_DGM', 'mauritius_mms': 'Mauritius_MMS', 'cote_ivoire': 'Cote_dIvoire_SODEXAM',
  'namibia_nms': 'Namibia_NMS', 'sudan_sma': 'Sudan_SMA',
  'guatemala_insivumeh': 'Guatemala_INSIVUMEH', 'cuba_insmet': 'Cuba_INSMET',
  'dominican_onamet': 'Dominican_ONAMET', 'jamaica_msj': 'Jamaica_MSJ',
  'trinidad_tobago': 'Trinidad_Tobago', 'panama_etesa': 'Panama_ETESA', 'honduras_smn': 'Honduras_SMN',
  'paraguay_dmh': 'Paraguay_DMH', 'uruguay_inumet': 'Uruguay_INUMET', 'sao_paulo_daee': 'Sao_Paulo_DAEE',
  'bogota_eaab': 'Bogota_EAAB', 'lima_senamhi': 'Lima_SENAMHI',
  'png_nws': 'Papua_New_Guinea_NWS', 'samoa_met': 'Samoa_MET', 'hawaii_distinct': 'Hawaii_Distinct',
  'caltrans': 'Caltrans_CA', 'harris_county_fcd': 'Harris_County_FCD', 'maricopa_fcd': 'Maricopa_FCD',
  'la_county': 'LA_County_LACDPW', 'clark_county_nv': 'Clark_County_NV',
  'philadelphia_pwd': 'Philadelphia_PWD', 'illinois_b75': 'Illinois_SWS_B75',
  'parabolic': 'Parabolic', 'cosine_storm': 'Raised_Cosine', 'lognormal_temporal': 'LogNormal_Temporal',
  'exponential_decay_storm': 'Exponential_Decay', 'power_curve_storm': 'Power_Curve',
  'weibull_temporal': 'Weibull_Temporal', 'instantaneous_burst': 'Instantaneous_Burst',
  'sigmoid_mass': 'Sigmoid_Logistic',
  'medicane': 'Medicane', 'polar_low': 'Polar_Low', 'cutoff_low': 'CutOff_Low',
  'mcs_storm': 'MCS_Storm', 'supercell': 'Supercell', 'orographic_enhanced': 'Orographic_Enhanced',
  'urban_heat_island': 'Urban_Heat_Island', 'monsoon_burst': 'Monsoon_Burst', 'squall_line': 'Squall_Line',
  'sea_breeze': 'Sea_Breeze', 'nocturnal_mcs': 'Nocturnal_MCS', 'rain_on_snow': 'Rain_on_Snow',
  'derecho': 'Derecho', 'ukcp18_enhanced': 'UKCP18_Enhanced', 'super_cc': 'Super_CC',
  'neyman_scott': 'Neyman_Scott', 'temez_spain': 'Temez_Spain', 'bonta_usda': 'Bonta_USDA',
  // v12 addition
  'georgian_nea': 'Georgia_NEA', 'albanian_igewe': 'Albanian_IGEWE',
};

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
    script += `RainPattern             00:00     0.0000\n`;

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
        <div className="flex items-center">
          <Button onClick={generateInfoWorksScript} className="gap-2 rounded-r-none flex-1">
            <Droplets className="w-4 h-4" />
            InfoWorks ICM
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
