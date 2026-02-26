import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, ChevronRight, CloudRain, Layers, Download, Settings, ArrowLeft, ArrowRight, Pencil, FlaskConical, ChevronDown, ChevronUp, Thermometer, Share2, Copy, CheckCheck, FlaskRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { type UnitSystem } from "@/lib/unitConversions";

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
  { id: 4, title: "Test All", description: "Compare all 66 patterns", icon: <FlaskRound className="w-5 h-5" /> },
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
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
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
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
          
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
