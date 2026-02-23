import { useState, useEffect, useCallback, useMemo } from "react";
import { Check, ChevronRight, CloudRain, Layers, Download, Settings, ArrowLeft, ArrowRight, Pencil, FlaskConical, ChevronDown, ChevronUp, Thermometer } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  generateRainfallData,
  prepareChartData,
  prepareExportData,
  type PatternType,
} from "@/lib/rainfallPatterns";
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
];

interface StormWizardProps {
  externalStormParams?: { depth: number; duration: number } | null;
  onExternalParamsConsumed?: () => void;
}

export function StormWizard({ externalStormParams, onExternalParamsConsumed }: StormWizardProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('block');
  const [depth, setDepth] = useState(2.0);
  const [duration, setDuration] = useState(6.0);
  const [timeStep, setTimeStep] = useState(15);
  const [showEquations, setShowEquations] = useState(false);
  const [climateScenario, setClimateScenario] = useState<string>('none');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
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

  // Update chart data when parameters change
  useEffect(() => {
    let intensities: number[];
    
    if (selectedPattern === 'custom' && customIntensities && customIntensities.length > 0) {
      intensities = customIntensities;
    } else {
      intensities = generateRainfallData(selectedPattern, effectiveDepth, duration, timeStep);
    }
    
    const formattedChartData = prepareChartData(intensities, timeStep);
    const formattedExportData = prepareExportData(intensities, timeStep);
    setChartData(formattedChartData);
    setExportData(formattedExportData);
  }, [selectedPattern, effectiveDepth, duration, timeStep, customIntensities]);

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

            {/* Chart */}
            <RainfallChart data={chartData} unitSystem={unitSystem} />

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
            Next
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
