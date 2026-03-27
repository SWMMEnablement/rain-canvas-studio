import { useState, useEffect, useCallback, useMemo } from "react";
import { GulfDdfLookup } from "@/components/GulfDdfLookup";
import { Check, ChevronRight, CloudRain, Layers, Download, Settings, ArrowLeft, ArrowRight, Pencil, FlaskConical, ChevronDown, ChevronUp, Thermometer, Share2, Copy, CheckCheck, FlaskRound, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PatternSelector } from "@/components/PatternSelector";
import { StormParameters } from "@/components/StormParameters";
import { RainfallChart } from "@/components/RainfallChart";
import { ExportButtons } from "@/components/ExportButtons";
import { SwmmFileIntegration } from "@/components/SwmmFileIntegration";
import { CustomPatternEditor } from "@/components/CustomPatternEditor";
import { IdfComparison } from "@/components/IdfComparison";
import { IdfGuidedSelector } from "@/components/IdfGuidedSelector";
import { PatternEquationDisplay } from "@/components/PatternEquationDisplay";
import { AllPatternsTest } from "@/components/AllPatternsTest";
import { cn } from "@/lib/utils";
import {
  prepareChartData,
  prepareExportData,
  type PatternType,
} from "@/lib/rainfallPatterns";
import { useStormApi } from "@/hooks/useStormApi";
import { type UnitSystem, convertDepth } from "@/lib/unitConversions";

const patternNames: Record<PatternType, string> = {
  'scs1a': 'SCS Type IA',
  'scs1': 'SCS Type I',
  'scs2': 'SCS Type II',
  'scs3': 'SCS Type III',
  'huff1': 'Huff 1st Quartile',
  'huff2': 'Huff 2nd Quartile',
  'huff3': 'Huff 3rd Quartile',
  'huff4': 'Huff 4th Quartile',
  'chicago': 'Chicago Storm',
  'desbordes': 'Desbordes',
  'arr': 'Australian ARR',
  'dwa': 'German DWA',
  'block': 'Block',
  'triangular': 'Triangular',
  'double': 'Double Peak',
  'custom': 'Custom',
  'trapezoidal': 'Trapezoidal',
  'fsr': 'FSR',
  'jma': 'JMA',
  'china': 'China',
  'sa_huff': 'South African Huff',
  'dutch': 'Dutch',
  'italian': 'Italian',
  'balanced': 'Balanced Storm',
  'fdot1': 'FDOT Zone 1',
  'fdot2': 'FDOT Zone 2',
  'fdot3': 'FDOT Zone 3',
  'fdot4': 'FDOT Zone 4',
  'fdot5': 'FDOT Zone 5',
  'txdot': 'TxDOT',
  'yen_chow': 'Yen & Chow',
  'noaa_a14': 'NOAA Atlas 14',
  'udfcd': 'UDFCD Denver',
  'usace_sps': 'USACE SPS',
  'pmp_hmr': 'PMP (HMR 51/52)',
  'feh': 'FEH (UK)',
  'euler1': 'Euler Type I',
  'euler2': 'Euler Type II',
  'desbordes_double': 'Double Triangle',
  'canadian': 'Canadian CDA',
  'singapore_pub': 'Singapore PUB',
  'china_gb50014': 'China GB 50014',
  'china_prd': 'China PRD',
  'india_imd': 'India IMD',
  'india_coastal': 'India Coastal',
  'japan_amedas': 'Japan AMeDAS',
  'japan_baiu': 'Japan Baiu',
  'japan_typhoon': 'Japan Typhoon',
  'korea_kma': 'Korea KMA',
  'malaysia_msma': 'Malaysia MSMA',
  'indonesia_bmkg': 'Indonesia BMKG',
  'philippines_pagasa': 'Philippines PAGASA',
  'vietnam_imhen': 'Vietnam IMHEN',
  'thailand_tmd': 'Thailand TMD',
  'saudi_pme': 'Saudi Arabia PME',
  'uae_ncms': 'UAE NCMS',
  'qatar_kahramaa': 'Qatar Kahramaa',
  'oman_dgman': 'Oman DGMAN',
  'sa_sanral': 'South Africa SANRAL',
  'kenya_kmd': 'Kenya KMD',
  'nigeria_nimet': 'Nigeria NiMet',
  'egypt_hcww': 'Egypt HCWW',
  'brazil_ana': 'Brazil ANA',
  'mexico_conagua': 'Mexico CONAGUA',
  'colombia_ideam': 'Colombia IDEAM',
  'chile_dga': 'Chile DGA',
  'nz_tp108': 'Auckland TP108',
  'nz_wellington': 'Wellington Regional',
  'nz_christchurch': 'Christchurch Canterbury',
  // New patterns
  'sifalda': 'Sifalda (Czech)',
  'danish_svk': 'Denmark SVK',
  'swedish_smhi': 'Sweden SMHI',
  'norwegian_nve': 'Norway NVE',
  'finnish_fmi': 'Finland FMI',
  'swiss_idf': 'Swiss IDF',
  'spanish_cedex': 'Spain CEDEX',
  'belgian_irm': 'Belgium IRM',
  'pilgrim_cordery': 'Pilgrim-Cordery',
  'watts_curve': "Watt's Curve",
  'hong_kong_hko': 'Hong Kong HKO',
  'taiwan_cwa': 'Taiwan CWA',
  'bangladesh_bmd': 'Bangladesh BMD',
  'pakistan_pmd': 'Pakistan PMD',
  'sri_lanka': 'Sri Lanka',
  'fiji_fms': 'Fiji FMS',
  'argentina_smn': 'Argentina SMN',
  'peru_senamhi': 'Peru SENAMHI',
  'ecuador_inamhi': 'Ecuador INAMHI',
  'venezuela_inameh': 'Venezuela INAMEH',
  'puerto_rico': 'Puerto Rico',
  'morocco_dmn': 'Morocco DMN',
  'ethiopia_nma': 'Ethiopia NMA',
  'ghana_gmet': 'Ghana GMet',
  'tanzania_tma': 'Tanzania TMA',
  'mozambique_inam': 'Mozambique INAM',
  'hirds_nz': 'HIRDS NZ',
  'arid_flash_flood': 'Arid Flash Flood',
  'aes_30': 'AES Canada 30%',
  'aes_40': 'AES Canada 40%',
  'kostra_dwd': 'KOSTRA-DWD',
  'dubai_dm': 'Dubai Municipality',
  'dubai_dm_combined': 'Dubai DM Combined',
  'abu_dhabi_adm': 'Abu Dhabi ADM',
  'montana_caquot': 'Montana/Caquot (FR)',
  'm5_60_fsr': 'M5-60 (UK/Ireland)',
  'arr2019': 'ARR 2019 Ensemble',
  'upm_plata': 'UPM Río de la Plata',
  // v3 patterns
  'feh22_refh2': 'FEH22/ReFH2',
  'noaa_a15': 'NOAA Atlas 15',
  'eccc_idf': 'ECCC IDF',
  'shyreg_fr': 'SHYREG (FR)',
  'ireland_met': 'Ireland Met Éireann',
  'arr87_legacy': 'ARR87 Legacy',
  'hk_dsd_2018': 'HK DSD 2018',
  'malaysia_hp1': 'Malaysia HP1',
  'austria_okostra': 'Austria ÖKOSTRA',
  // v4 patterns
  'france_shypre': 'France SHYPRE',
  'poland_panda': 'Poland PANDa',
  'turkey_mgm': 'Turkey MGM',
  'israel_ims': 'Israel IMS',
  'iran_irimo': 'Iran IRIMO',
  'iraq_mos': 'Iraq MoS',
  'kazakhstan_kazhydromet': 'Kazakhstan Kazhydromet',
  'russia_roshydromet': 'Russia Roshydromet',
  'portugal_ipma': 'Portugal IPMA',
  'nz_niwa': 'NZ NIWA',
  'csa_w231': 'CSA W231 (Canada)',
  'sa_wrc': 'South Africa WRC',
  'west_africa_cilss': 'West Africa CILSS',
  'noaa_a16': 'NOAA Atlas 16',
  'euro_cordex': 'EURO-CORDEX',
  'mongolia_namem': 'Mongolia NAMEM',
  'pacific_sprep': 'Pacific SPREP',
  'czech_chmu': 'Czech ČHMÚ',
  // v5 patterns
  'barbados_bms': 'Barbados BMS',
  'oecs_caribbean': 'OECS Caribbean',
  'cyprus_wdd': 'Cyprus WDD',
  'malta_mra': 'Malta MRA',
  'bolivia_altiplano': 'Bolivia Altiplano',
  'fourier_multipeak': 'Fourier Multi-Peak',
  'cc_idf_scaled': 'CC-IDF Scaled',
  // v6 patterns
  'g2p_gamma': 'G2P Gamma',
  'poland_bs': 'Poland Bogdanowicz-Stachy',
  'belgium_willems': 'Belgium Willems',
  'russia_snip': 'Russia SNiP',
  'turkey_dsi': 'Turkey DSİ',
  'korea_molit': 'Korea MOLIT',
  'greece_hellenic': 'Greece Hellenic',
  'romania_stas': 'Romania STAS',
  'pmp_wmo': 'PMP WMO Generalized',
  'nested_envelope': 'Nested Envelope',
  'arnell_sweden': 'Arnell (Sweden)',
  'tenax_cds': 'TENAX-CDS',
  'avm': 'Average Variability',
  'sa_scs1': 'SA SCS Type 1',
  'sa_scs2': 'SA SCS Type 2',
  'sa_scs3': 'SA SCS Type 3',
  'sa_scs4': 'SA SCS Type 4',
  // v10 — Poland & Eastern Europe
  'atv_a121': 'ATV-A 121',
  'dwa_a118': 'DWA-A 118',
  'blaszczyk': 'Błaszczyk',
  'imgw_cluster1': 'IMGW Cluster 1',
  'imgw_cluster2': 'IMGW Cluster 2',
  'imgw_cluster3': 'IMGW Cluster 3',
  'imgw_cluster4': 'IMGW Cluster 4',
  'imgw_cluster5': 'IMGW Cluster 5',
  'wroclaw_2050': 'Wrocław 2050',
  'trupl': 'Trupl (Czech)',
  'samaj_valovic': 'Šamaj-Valovič',
  'hungarian_msz': 'Hungarian MSZ',
  'budapest_convective': 'Budapest Convective',
  'owav_rb11': 'ÖWAV Regelblatt 11',
  // v11 — High-value additions
  'croatian_dhmz': 'Croatian DHMZ',
  'beta_distribution': 'Beta Distribution',
  'cc_clausius': 'Clausius-Clapeyron Scaled',
  'bartlett_lewis': 'Bartlett-Lewis Stochastic',
  'tropical_cyclone': 'Tropical Cyclone Rainband',
  'atmospheric_river': 'Atmospheric River',
  'algeria_anrh': 'Algeria ANRH',
  'west_africa_cieh': 'West Africa CIEH',
  'portugal_lnec': 'Portugal LNEC',
  'costa_rica_imn': 'Costa Rica IMN',
  'nepal_dhm': 'Nepal DHM',
  'nyc_dep': 'NYC DEP',
  'post_wildfire': 'Post-Wildfire',
  'bimodal_gaussian': 'Bimodal Gaussian',
  // v12 — Massive expansion
  'serbian_rhmz': 'Serbian RHMZ',
  'bulgarian_nimh': 'Bulgarian NIMH',
  'slovenian_arso': 'Slovenian ARSO',
  'ukrainian_dbn': 'Ukrainian DBN',
  'lithuanian_hms': 'Lithuanian HMS',
  'latvian_lvgmc': 'Latvian LVĢMC',
  'estonian_emhi': 'Estonian EMHI',
  'soviet_snip_legacy': 'Soviet SNiP Legacy',
  'belarusian_tkp': 'Belarusian TKP',
  'icelandic_imo': 'Icelandic IMO',
  'svensson_jones': 'Svensson-Jones',
  'reunion_mf': 'Réunion Météo-France',
  'azores_ipma': 'Azores/Madeira IPMA',
  'jordan_jmd': 'Jordan JMD',
  'lebanon_cav': 'Lebanon Civil Aviation',
  'kuwait_mew': 'Kuwait MEW',
  'bahrain_met': 'Bahrain MET',
  'yemen_cama': 'Yemen CAMA',
  'myanmar_dmh': 'Myanmar DMH',
  'mekong_mrc': 'Mekong MRC',
  'mononobe': 'Mononobe Formula',
  'uzbekistan_uhm': 'Uzbekistan UHM',
  'tunisia_inm': 'Tunisia INM',
  'uganda_unma': 'Uganda UNMA',
  'cameroon_ird': 'Cameroon IRD',
  'madagascar_dgm': 'Madagascar DGM',
  'mauritius_mms': 'Mauritius MMS',
  'cote_ivoire': "Côte d'Ivoire SODEXAM",
  'namibia_nms': 'Namibia NMS',
  'sudan_sma': 'Sudan SMA',
  'guatemala_insivumeh': 'Guatemala INSIVUMEH',
  'cuba_insmet': 'Cuba INSMET',
  'dominican_onamet': 'Dominican ONAMET',
  'jamaica_msj': 'Jamaica MSJ',
  'trinidad_tobago': 'Trinidad & Tobago',
  'panama_etesa': 'Panama ETESA',
  'honduras_smn': 'Honduras SMN',
  'paraguay_dmh': 'Paraguay DMH',
  'uruguay_inumet': 'Uruguay INUMET',
  'sao_paulo_daee': 'São Paulo DAEE',
  'bogota_eaab': 'Bogotá EAAB',
  'lima_senamhi': 'Lima SENAMHI',
  'png_nws': 'Papua New Guinea NWS',
  'samoa_met': 'Samoa MET',
  'hawaii_distinct': 'Hawaii (Distinct)',
  'caltrans': 'Caltrans',
  'harris_county_fcd': 'Harris County FCD',
  'maricopa_fcd': 'Maricopa County FCD',
  'la_county': 'LA County LACDPW',
  'clark_county_nv': 'Clark County (Las Vegas)',
  'philadelphia_pwd': 'Philadelphia PWD',
  'illinois_b75': 'Illinois SWS B75',
  'parabolic': 'Parabolic',
  'cosine_storm': 'Raised Cosine',
  'lognormal_temporal': 'Log-Normal Temporal',
  'exponential_decay_storm': 'Exponential Decay',
  'power_curve_storm': 'Power Curve',
  'weibull_temporal': 'Weibull Temporal',
  'instantaneous_burst': 'Instantaneous Burst',
  'sigmoid_mass': 'Sigmoid / Logistic',
  'medicane': 'Medicane',
  'polar_low': 'Polar Low',
  'cutoff_low': 'Cut-Off Low',
  'mcs_storm': 'MCS Storm',
  'supercell': 'Supercell',
  'orographic_enhanced': 'Orographic Enhanced',
  'urban_heat_island': 'Urban Heat Island',
  'monsoon_burst': 'Monsoon Burst',
  'squall_line': 'Squall Line',
  'sea_breeze': 'Sea Breeze',
  'nocturnal_mcs': 'Nocturnal MCS',
  'rain_on_snow': 'Rain-on-Snow',
  'derecho': 'Derecho',
  'ukcp18_enhanced': 'UKCP18 Enhanced',
  'super_cc': 'Super-CC 14%/°C',
  'neyman_scott': 'Neyman-Scott',
  'temez_spain': 'Témez (Spain)',
  'bonta_usda': 'Bonta (USDA)',
  'georgian_nea': 'Georgia NEA',
  'albanian_igewe': 'Albanian IGEWE',
  'aes_50': 'AES Canada 50%',
  'ontario_mto_4hr': 'Ontario MTO 4-hr',
  'marsalek_1978': 'Marsalek (1978)',
  'quebec_melccfp': 'Quebec MELCCFP',
  'alberta_transportation': 'Alberta Transportation',
  'prairie_short': 'Prairie Short-Duration',
  'bc_moe_coastal': 'BC MOE Coastal',
  'pilgrim_cordery_ca': 'Pilgrim-Cordery (Canada)',
  'adamowski_pacific': 'Adamowski-Alila Pacific',
  'adamowski_prairie': 'Adamowski-Alila Prairie',
  'adamowski_greatlakes': 'Adamowski-Alila Great Lakes',
  'adamowski_stlawrence': 'Adamowski-Alila St. Lawrence',
  'adamowski_atlantic': 'Adamowski-Alila Atlantic',
  'adamowski_northern': 'Adamowski-Alila Northern',
  'winnipeg_maclaren': 'Winnipeg MacLaren',
  'senegal_anacim': 'Senegal ANACIM',
  'rwanda_meteo': 'Rwanda Météo',
  'zimbabwe_zmd': 'Zimbabwe ZMD',
  'zambia_zmd': 'Zambia ZMD',
  'mali_dnm': 'Mali DNM',
  'burkina_anam': 'Burkina Faso ANAM',
  'angola_inamet': 'Angola INAMET',
  'congo_mettelsat': 'Congo DRC METTELSAT',
  'laos_dmh': 'Laos DMH',
  'brunei_bdmd': 'Brunei BDMD',
  // v16
  'keifer_chu': 'Keifer-Chu (1957)',
  'alternating_block': 'Alternating Block',
  'gauteng_wrc': 'Gauteng WRC',
  'botswana_dms': 'Botswana DMS',
  'cambodia_mowram': 'Cambodia MOWRAM',
  'timor_leste_dnmg': 'Timor-Leste DNMG',
  'armenia_hydromet': 'Armenia Hydromet',
  'azerbaijan_nhms': 'Azerbaijan NHMS',
  'moldova_shs': 'Moldova SHS',
  'north_macedonia_hms': 'North Macedonia HMS',
  'bosnia_fhmz': 'Bosnia & Herzegovina FHMZ',
  'montenegro_ihms': 'Montenegro IHMS',
  'seychelles_sma': 'Seychelles SMA',
  'maldives_mms': 'Maldives MMS',
  'cape_verde_inmg': 'Cape Verde INMG',
  'eritrea_dme': 'Eritrea DME',
  'tajikistan_hydromet': 'Tajikistan Hydromet',
  'kyrgyzstan_hydromet': 'Kyrgyzstan Hydromet',
  'gaussian_storm': 'Gaussian Storm',
  'burundi_igebu': 'Burundi IGEBU',
  // v17
  'bhutan_scs': 'Bhutan SCS Design Storm',
  'belize_flood': 'Belize Flood Hazard',
  'comoros_post_kenneth': 'Comoros Post-Kenneth',
  'delta_change': 'Delta Change Method',
  'dominica_charim': 'Dominica CHaRIM',
  'epa_swmm_cat': 'EPA SWMM-CAT',
  'faa_airport': 'FAA Standard (Airport)',
  'gabon_francophone': 'Gabon Francophone',
  'gambia_rna': 'Gambia RNA',
  'grenada_charim': 'Grenada CHaRIM',
  'guyana_drainage': 'Guyana Drainage Design',
  'haiti_marndr': 'Haiti MARNDR',
  'jamaica_jie': 'Jamaica JIE Guidelines',
  'johnson_sb_caribbean': 'Johnson SB Caribbean',
  'kosovo_nothas': 'Kosovo NOTHAS',
  'laos_jica': 'Laos JICA',
  'liberia_regional': 'Liberia Regional',
  'mali_lmoments': 'Mali L-moments',
  'marshall_islands': 'Marshall Islands Ebeye',
  'mauritania_regional': 'Mauritania Regional',
  'micronesia_fsm': 'Micronesia FSM',
  'moldova_urban': 'Moldova Urban Drainage',
  'mongolia_ulaanbaatar': 'Mongolia Ulaanbaatar',
  'montenegro_regional': 'Montenegro Regional',
  'myanmar_yangon': 'Myanmar Yangon IDF',
  'nauru_regional': 'Nauru Regional',
  'niger_regional': 'Niger Regional',
  'nonstationary_gev': 'Non-stationary GEV IDF',
  'north_macedonia_regional': 'North Macedonia Regional',
  'palau_usace': 'Palau USACE',
  'partial_duration': 'Partial Duration Series',
  'qatar_qrrc': 'Qatar QRRC',
  'quantile_delta': 'Quantile Delta Mapping',
  'rwanda_regional_idf': 'Rwanda Regionalized IDF',
  'saint_lucia_charim': 'Saint Lucia CHaRIM',
  'saint_vincent_charim': 'Saint Vincent CHaRIM',
  'samoa_sopac': 'Samoa SOPAC',
  'seychelles_scs3': 'Seychelles SCS Type 3',
  'sierra_leone_roads': 'Sierra Leone Roads Authority',
  'solomon_islands': 'Solomon Islands Honiara',
  'sst_transposition': 'Stochastic Storm Transposition',
  'suriname_paramaribo': 'Suriname Paramaribo',
  'tank_model': 'Tank Model (Laos/Myanmar)',
  'turkmenistan': 'Turkmenistan Turkmenhydromet',
  'tuvalu_tcap': 'Tuvalu TCAP/UNDP',
  'vanuatu_vankirap': 'Vanuatu Van-KIRAP',
  'xgboost_storm': 'XGBoost Storm Prediction',
  'zimbabwe_sala': 'Zimbabwe Sala Manuals',
};

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { id: 1, title: "Storm Parameters", description: "Set depth, duration & units", icon: <Settings className="w-5 h-5" /> },
  { id: 2, title: "Select Pattern", description: "Choose rainfall distribution", icon: <Layers className="w-5 h-5" /> },
  { id: 3, title: "Review & Export", description: "Visualize and download data", icon: <Download className="w-5 h-5" /> },
  { id: 4, title: "Test All", description: "Compare all 281 patterns", icon: <FlaskRound className="w-5 h-5" /> },
];

export interface StormShareParams {
  pattern: PatternType;
  depth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
  climateScenario?: string;
}

/**
 * Encode storm parameters into a URL-safe hash string
 */
export function encodeStormParams(params: StormShareParams): string {
  const obj: Record<string, string> = {
    p: params.pattern,
    d: params.depth.toString(),
    dur: params.duration.toString(),
    ts: params.timeStep.toString(),
    u: params.unitSystem,
  };
  if (params.climateScenario && params.climateScenario !== 'none') {
    obj.cc = params.climateScenario;
  }
  return btoa(JSON.stringify(obj));
}

/**
 * Decode storm parameters from a URL hash string
 */
export function decodeStormParams(hash: string): StormShareParams | null {
  try {
    const obj = JSON.parse(atob(hash));
    if (!obj.p || !obj.d || !obj.dur || !obj.ts || !obj.u) return null;
    return {
      pattern: obj.p as PatternType,
      depth: parseFloat(obj.d),
      duration: parseFloat(obj.dur),
      timeStep: parseInt(obj.ts, 10),
      unitSystem: obj.u as UnitSystem,
      climateScenario: obj.cc || 'none',
    };
  } catch {
    return null;
  }
}

interface StormWizardProps {
  externalStormParams?: { depth: number; duration: number } | null;
  onExternalParamsConsumed?: () => void;
  initialShareParams?: StormShareParams | null;
  onStormContextChange?: (context: string) => void;
}

export function StormWizard({ externalStormParams, onExternalParamsConsumed, initialShareParams, onStormContextChange }: StormWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(initialShareParams ? 3 : 1);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>(initialShareParams?.pattern || 'block');
  const [depth, setDepth] = useState(initialShareParams?.depth || 2.0);
  const [duration, setDuration] = useState(initialShareParams?.duration || 6.0);
  const [timeStep, setTimeStep] = useState(initialShareParams?.timeStep || 15);
  const [showEquations, setShowEquations] = useState(false);
  const [climateScenario, setClimateScenario] = useState<string>(initialShareParams?.climateScenario || 'none');
  const [shareCopied, setShareCopied] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    if (initialShareParams?.unitSystem) return initialShareParams.unitSystem;
    const saved = localStorage.getItem('preferredUnitSystem');
    return (saved === 'SI' || saved === 'USA') ? saved : 'USA';
  });

  // Apply external storm params from China IDF or other tools
  useEffect(() => {
    if (externalStormParams) {
      setDepth(externalStormParams.depth);
      setDuration(externalStormParams.duration);
      setCurrentStep(1); // Go to step 1 so user can see the values
      onExternalParamsConsumed?.();
    }
  }, [externalStormParams, onExternalParamsConsumed]);
  const [chartData, setChartData] = useState<Array<{ time: string; intensity: number }>>([]);
  const [exportData, setExportData] = useState<Array<{ time: number; intensity: number }>>([]);
  const [customIntensities, setCustomIntensities] = useState<number[] | null>(null);

  // Climate Change Adjustment Factors by pattern
  const allClimateFactors: Record<string, { title: string; description: string; scenarios: Record<string, { label: string; factor: number }> }> = {
    'singapore_pub': {
      title: 'PUB Climate Change Adjustment',
      description: 'Per PUB Code of Practice on Surface Water Drainage (2020), design rainfall shall be multiplied by climate change factors for future scenarios.',
      scenarios: {
        'none': { label: 'Baseline (No Adjustment)', factor: 1.0 },
        '2020_2039': { label: '2020–2039 (+12%)', factor: 1.12 },
        '2040_2069': { label: '2040–2069 (+26%)', factor: 1.26 },
        '2070_2099': { label: '2070–2099 (+40%)', factor: 1.40 },
      },
    },
    'feh': {
      title: 'UK FEH Climate Change Uplift',
      description: 'Per EA guidance on climate change allowances for Flood Risk Assessments. Upper end allowances for peak rainfall intensity.',
      scenarios: {
        'none': { label: 'Baseline (No Adjustment)', factor: 1.0 },
        '2015_2039': { label: '2015–2039 (+10%)', factor: 1.10 },
        '2040_2069': { label: '2040–2069 (+20%)', factor: 1.20 },
        '2070_2115': { label: '2070–2115 (+40%)', factor: 1.40 },
        'upper_2070': { label: '2070–2115 Upper End (+20%)', factor: 1.20 },
      },
    },
    'arr': {
      title: 'Australian ARR Climate Change Factor',
      description: 'Per ARR 2019 Book 1 Chapter 6, interim climate change factors for design rainfall under RCP emission scenarios.',
      scenarios: {
        'none': { label: 'Baseline (No Adjustment)', factor: 1.0 },
        'rcp45_2050': { label: 'RCP 4.5 – 2050 (+5%)', factor: 1.05 },
        'rcp45_2090': { label: 'RCP 4.5 – 2090 (+9%)', factor: 1.09 },
        'rcp85_2050': { label: 'RCP 8.5 – 2050 (+9%)', factor: 1.09 },
        'rcp85_2090': { label: 'RCP 8.5 – 2090 (+16%)', factor: 1.16 },
      },
    },
    'canadian': {
      title: 'Canadian CDA Climate Change Factor',
      description: 'Per CSA PLUS 4013 and CDA Dam Safety Guidelines, recommended climate change factors for IDF uplift in Canadian dam and stormwater design.',
      scenarios: {
        'none': { label: 'Baseline (No Adjustment)', factor: 1.0 },
        '2050_moderate': { label: '2050 Moderate (+10%)', factor: 1.10 },
        '2050_high': { label: '2050 High (+15%)', factor: 1.15 },
        '2100_moderate': { label: '2100 Moderate (+20%)', factor: 1.20 },
        '2100_high': { label: '2100 High (+30%)', factor: 1.30 },
      },
    },
  };

  const activeClimateConfig = allClimateFactors[selectedPattern] || null;

  // Effective depth with climate adjustment
  const effectiveDepth = useMemo(() => {
    if (activeClimateConfig && climateScenario !== 'none') {
      const scenario = activeClimateConfig.scenarios[climateScenario];
      if (scenario) return depth * scenario.factor;
    }
    return depth;
  }, [depth, selectedPattern, climateScenario, activeClimateConfig]);

  // Reset climate scenario when pattern changes
  useEffect(() => {
    setClimateScenario('none');
  }, [selectedPattern]);

  // Save unit system preference
  useEffect(() => {
    localStorage.setItem('preferredUnitSystem', unitSystem);
  }, [unitSystem]);

  // Handle custom pattern changes
  const handleCustomPatternChange = useCallback((intensities: number[]) => {
    setCustomIntensities(intensities);
  }, []);

  // Fetch intensities from Storm API (with local fallback)
  const { intensities: apiIntensities, isLoading: isApiLoading, source: dataSource } = useStormApi({
    pattern: selectedPattern,
    depth: effectiveDepth,
    duration,
    timeStep,
    customIntensities,
  });

  // Update chart data when API intensities change
  useEffect(() => {
    if (apiIntensities.length === 0) return;
    
    const formattedChartData = prepareChartData(apiIntensities, timeStep);
    const formattedExportData = prepareExportData(apiIntensities, timeStep);
    setChartData(formattedChartData);
    setExportData(formattedExportData);

    // Update storm context for chatbot
    const peak = Math.max(...apiIntensities);
    const peakIdx = apiIntensities.indexOf(peak);
    const peakTime = ((peakIdx + 1) * timeStep).toFixed(0);
    const depthUnit = unitSystem === 'SI' ? 'mm' : 'in';
    const intensityUnit = unitSystem === 'SI' ? 'mm/hr' : 'in/hr';
    const patternLabel = patternNames[selectedPattern] || selectedPattern;
    const ctx = `Pattern: ${patternLabel}\nTotal Depth: ${effectiveDepth.toFixed(2)} ${depthUnit}\nDuration: ${duration.toFixed(1)} hr\nTime Step: ${timeStep} min\nUnit System: ${unitSystem}\nPeak Intensity: ${peak.toFixed(2)} ${intensityUnit} at t=${peakTime} min\nNumber of intervals: ${apiIntensities.length}\nData source: ${dataSource}`;
    onStormContextChange?.(ctx);
  }, [apiIntensities, timeStep, unitSystem, selectedPattern, effectiveDepth, duration, dataSource, onStormContextChange]);

  // Calculate peak intensity for IDF comparison
  const peakIntensity = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => d.intensity));
  }, [chartData]);

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return depth > 0 && duration > 0 && timeStep > 0;
      case 2:
        return selectedPattern !== null;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || canProceed()) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          {/* Step Indicators */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => goToStep(step.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 w-full",
                          currentStep === step.id 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : currentStep > step.id
                              ? "bg-accent text-accent-foreground cursor-pointer hover:bg-accent/80"
                              : "bg-muted text-muted-foreground"
                        )}
                        disabled={step.id > currentStep && !canProceed()}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
                          currentStep === step.id 
                            ? "border-primary-foreground bg-primary-foreground/20" 
                            : currentStep > step.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-current"
                        )}>
                          {currentStep > step.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="text-left hidden md:block">
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs opacity-80">{step.description}</p>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-muted-foreground">{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </TooltipProvider>
          
          {/* Progress Bar */}
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Define Storm Parameters</h2>
              <p className="text-muted-foreground">Set the characteristics of your synthetic storm event</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-6">
              {/* IDF-Guided Selection */}
              <IdfGuidedSelector
                unitSystem={unitSystem}
                onApplyDesignStorm={(newDepth, newDuration) => {
                  setDepth(newDepth);
                  setDuration(newDuration);
                }}
              />
              
              {/* Manual Storm Parameters */}
              <StormParameters
                depth={depth}
                duration={duration}
                timeStep={timeStep}
                unitSystem={unitSystem}
                onDepthChange={setDepth}
                onDurationChange={setDuration}
                onTimeStepChange={setTimeStep}
                onUnitSystemChange={setUnitSystem}
              />

              {/* Gulf Region DDF Lookup — collapsed by default */}
              <details className="group">
                <summary className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                  <MapPin className="w-4 h-4 text-primary" />
                  Gulf Region DDF Lookup (Dubai · Abu Dhabi · Qatar · Kuwait · Bahrain · Oman)
                </summary>
                <div className="mt-3">
                  <GulfDdfLookup
                    unitSystem={unitSystem}
                    onApply={(depthMm, durationHr) => {
                      const depthVal = unitSystem === 'SI' ? depthMm : convertDepth(depthMm, 'SI', 'USA');
                      setDepth(depthVal);
                      setDuration(durationHr);
                      if (durationHr <= 0.5) setTimeStep(5);
                      else if (durationHr <= 1) setTimeStep(5);
                      else if (durationHr <= 6) setTimeStep(15);
                      else setTimeStep(30);
                    }}
                  />
                </div>
              </details>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Rainfall Pattern</h2>
              <p className="text-muted-foreground">Choose a temporal distribution for your storm</p>
            </div>
            
            {selectedPattern === 'custom' ? (
              // Custom Pattern Editor View
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPattern('block')}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Patterns
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Pencil className="w-4 h-4" />
                    Custom Pattern Mode
                  </div>
                </div>
                
                <CustomPatternEditor
                  duration={duration}
                  timeStep={timeStep}
                  totalDepth={depth}
                  unitSystem={unitSystem}
                  onPatternChange={handleCustomPatternChange}
                  initialPattern={customIntensities || undefined}
                />
                
                <Card className="bg-accent/30 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Pencil className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Draw Your Distribution</p>
                        <p className="text-xs text-muted-foreground">
                          Click and drag on the chart to shape your rainfall pattern. Use presets as starting points, then customize.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Standard Pattern Selection View
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <PatternSelector
                    selectedPattern={selectedPattern}
                    onPatternChange={setSelectedPattern}
                  />
                  <div className="space-y-4">
                    <RainfallChart data={chartData} unitSystem={unitSystem} />
                    <Card className="bg-accent/30 border-primary/20">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <CloudRain className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Live Preview</p>
                            <p className="text-xs text-muted-foreground">
                              The chart updates in real-time as you select different patterns
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Climate Change Adjustment (for supported patterns) */}
                {activeClimateConfig && (
                  <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Thermometer className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="font-medium text-sm">{activeClimateConfig.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activeClimateConfig.description}
                            </p>
                          </div>
                          <Select value={climateScenario} onValueChange={setClimateScenario}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(activeClimateConfig.scenarios).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {climateScenario !== 'none' && activeClimateConfig.scenarios[climateScenario] && (
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                                ×{activeClimateConfig.scenarios[climateScenario].factor.toFixed(2)}
                              </Badge>
                              <span className="text-muted-foreground">
                                Effective depth: <strong className="text-foreground">
                                  {unitSystem === 'USA' 
                                    ? `${effectiveDepth.toFixed(2)} in` 
                                    : `${effectiveDepth.toFixed(1)} mm`}
                                </strong>
                                {' '}(base: {unitSystem === 'USA' ? `${depth.toFixed(2)} in` : `${depth.toFixed(1)} mm`})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Equation Documentation Panel */}
                <Collapsible open={showEquations} onOpenChange={setShowEquations}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" />
                        View Mathematical Equations & Methodology
                      </span>
                      {showEquations ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <PatternEquationDisplay 
                      pattern={selectedPattern} 
                      totalDepth={depth}
                      duration={duration}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Review & Export</h2>
              <p className="text-muted-foreground">Verify your storm and download in your preferred format</p>
            </div>
            
            {/* Summary Card */}
            <Card className="bg-accent/30 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Storm Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Pattern</p>
                    <p className="font-semibold text-primary">{patternNames[selectedPattern]}</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Total Depth</p>
                    <p className="font-semibold text-primary">
                      {unitSystem === 'USA' ? `${effectiveDepth.toFixed(2)} in` : `${effectiveDepth.toFixed(1)} mm`}
                    </p>
                    {activeClimateConfig && climateScenario !== 'none' && activeClimateConfig.scenarios[climateScenario] && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                        CC ×{activeClimateConfig.scenarios[climateScenario].factor.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold text-primary">{duration} hours</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Time Step</p>
                    <p className="font-semibold text-primary">{timeStep} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extreme Intensity Warning */}
            {(() => {
              const thresholdMmHr = unitSystem === 'SI' ? 300 : 300 / 25.4;
              const unit = unitSystem === 'SI' ? 'mm/hr' : 'in/hr';
              if (peakIntensity > thresholdMmHr) {
                const peakDisplay = peakIntensity.toFixed(1);
                return (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-amber-700 dark:text-amber-400">
                        Extreme Instantaneous Intensity
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Peak intensity of <span className="font-semibold text-foreground">{peakDisplay} {unit}</span> exceeds
                        300 mm/hr — a physically rare threshold. This may result from a highly concentrated profile
                        (e.g., needle-peak distributions) combined with short time steps. Verify this is appropriate
                        for your design scenario.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Share This Storm */}
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Share This Storm</p>
                      <p className="text-xs text-muted-foreground">
                        Copy a link to share this exact configuration with colleagues
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => {
                      const hash = encodeStormParams({
                        pattern: selectedPattern,
                        depth,
                        duration,
                        timeStep,
                        unitSystem,
                        climateScenario,
                      });
                      const url = `${window.location.origin}${window.location.pathname}?storm=${hash}`;
                      navigator.clipboard.writeText(url).then(() => {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      });
                    }}
                  >
                    {shareCopied ? (
                      <>
                        <CheckCheck className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <div className="relative">
              <RainfallChart data={chartData} unitSystem={unitSystem} />
              <div className="flex items-center gap-2 mt-1 justify-end">
                {isApiLoading && (
                  <span className="text-xs text-muted-foreground animate-pulse">Syncing with API…</span>
                )}
                <Badge variant="outline" className="text-xs">
                  {dataSource === "api" ? "☁ API" : "⚡ Local"}
                </Badge>
              </div>
            </div>

            {/* Export Options */}
            <ExportButtons
              data={exportData}
              pattern={patternNames[selectedPattern]}
              patternKey={selectedPattern}
              totalDepth={depth}
              duration={duration}
              timeStep={timeStep}
              unitSystem={unitSystem}
            />

            {/* SWMM Integration */}
            <SwmmFileIntegration
              selectedPattern={selectedPattern}
              patternName={patternNames[selectedPattern]}
              totalDepth={depth}
              duration={duration}
              timeStep={timeStep}
              unitSystem={unitSystem}
            />

            {/* IDF Comparison */}
            <IdfComparison
              stormDepth={depth}
              stormDuration={duration}
              peakIntensity={peakIntensity}
              unitSystem={unitSystem}
            />
          </div>
        )}

        {currentStep === 4 && (
          <AllPatternsTest
            depth={effectiveDepth}
            duration={duration}
            timeStep={timeStep}
            unitSystem={unitSystem}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="gap-2"
          >
            {currentStep === 3 ? 'Test All Patterns' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setCurrentStep(1)} className="gap-2">
            Start New Storm
          </Button>
        )}
      </div>
    </div>
  );
}
