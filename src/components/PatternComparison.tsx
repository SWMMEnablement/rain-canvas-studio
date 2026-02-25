import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimationExport } from "@/components/AnimationExport";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Download, TrendingUp, Settings, RotateCcw, FileText, BarChart3, Activity, MapPin, Lightbulb, Gauge, Play, Pause, SkipBack, ChevronDown, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { calculatePatternStatistics, type PatternStatistics } from "@/lib/patternStatistics";
import { toast } from "@/hooks/use-toast";
import { type UnitSystem, convertIntensity, convertDepth, getIntensityUnit, getDepthUnit, formatIntensity, formatDepth } from "@/lib/unitConversions";

interface PatternComparisonProps {
  depth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

interface ComparisonPattern {
  id: PatternType;
  name: string;
  color: string;
  category: string;
}

const comparisonPatterns: ComparisonPattern[] = [
  // SCS Patterns
  { id: 'scs1a', name: 'SCS Type IA', color: '#3b82f6', category: 'SCS' },
  { id: 'scs1', name: 'SCS Type I', color: '#06b6d4', category: 'SCS' },
  { id: 'scs2', name: 'SCS Type II', color: '#10b981', category: 'SCS' },
  { id: 'scs3', name: 'SCS Type III', color: '#f97316', category: 'SCS' },
  { id: 'balanced', name: 'Balanced Storm', color: '#0d9488', category: 'SCS' },
  { id: 'yen_chow', name: 'Yen & Chow', color: '#7c3aed', category: 'SCS' },
  // Huff Patterns
  { id: 'huff1', name: 'Huff 1st Quartile', color: '#8b5cf6', category: 'Huff' },
  { id: 'huff2', name: 'Huff 2nd Quartile', color: '#ec4899', category: 'Huff' },
  { id: 'huff3', name: 'Huff 3rd Quartile', color: '#f43f5e', category: 'Huff' },
  { id: 'huff4', name: 'Huff 4th Quartile', color: '#ef4444', category: 'Huff' },
  // Chicago & Block
  { id: 'chicago', name: 'Chicago Storm', color: '#14b8a6', category: 'Other' },
  { id: 'block', name: 'Block (Uniform)', color: '#737373', category: 'Other' },
  { id: 'triangular', name: 'Triangular (UK)', color: '#2dd4bf', category: 'Other' },
  { id: 'trapezoidal', name: 'Trapezoidal (UK)', color: '#5eead4', category: 'Other' },
  { id: 'fsr', name: 'FSR (UK)', color: '#99f6e4', category: 'Other' },
  // US Agency
  { id: 'fdot1', name: 'FDOT Zone 1 (NW FL)', color: '#f59e0b', category: 'US Agency' },
  { id: 'fdot2', name: 'FDOT Zone 2 (NE FL)', color: '#d97706', category: 'US Agency' },
  { id: 'fdot3', name: 'FDOT Zone 3 (Central FL)', color: '#b45309', category: 'US Agency' },
  { id: 'fdot4', name: 'FDOT Zone 4 (SE FL)', color: '#92400e', category: 'US Agency' },
  { id: 'fdot5', name: 'FDOT Zone 5 (SW FL)', color: '#78350f', category: 'US Agency' },
  { id: 'txdot', name: 'TxDOT', color: '#be185d', category: 'US Agency' },
  { id: 'noaa_a14', name: 'NOAA Atlas 14', color: '#1d4ed8', category: 'US Agency' },
  { id: 'udfcd', name: 'UDFCD Denver', color: '#7e22ce', category: 'US Agency' },
  { id: 'usace_sps', name: 'USACE SPS', color: '#155e75', category: 'US Agency' },
  { id: 'pmp_hmr', name: 'PMP (HMR 51/52)', color: '#991b1b', category: 'US Agency' },
  // International
  { id: 'desbordes', name: 'Desbordes (France)', color: '#6366f1', category: 'International' },
  { id: 'arr', name: 'Australian ARR', color: '#a855f7', category: 'International' },
  { id: 'dwa', name: 'German DWA', color: '#84cc16', category: 'International' },
  { id: 'jma', name: 'Japan JMA', color: '#0ea5e9', category: 'International' },
  { id: 'china', name: 'Chinese P&C', color: '#dc2626', category: 'International' },
  { id: 'sa_huff', name: 'South Africa Huff', color: '#fbbf24', category: 'International' },
  { id: 'dutch', name: 'Dutch KNMI', color: '#f97316', category: 'International' },
  { id: 'italian', name: 'Italian (LSPP)', color: '#059669', category: 'International' },
  { id: 'canadian', name: 'Canadian CDA', color: '#e11d48', category: 'International' },
  // European
  { id: 'euler1', name: 'Euler Type I', color: '#65a30d', category: 'European' },
  { id: 'euler2', name: 'Euler Type II', color: '#16a34a', category: 'European' },
  { id: 'feh', name: 'FEH (UK)', color: '#0369a1', category: 'European' },
  { id: 'desbordes_double', name: 'Double Triangle', color: '#9333ea', category: 'European' },
  // Asian
  { id: 'singapore_pub', name: 'Singapore PUB', color: '#e11d48', category: 'Asian' },
  { id: 'china_gb50014', name: 'China GB 50014', color: '#dc2626', category: 'Asian' },
  { id: 'china_prd', name: 'China PRD (Typhoon)', color: '#b91c1c', category: 'Asian' },
  { id: 'india_imd', name: 'India IMD (Monsoon)', color: '#f59e0b', category: 'Asian' },
  { id: 'india_coastal', name: 'India Coastal', color: '#d97706', category: 'Asian' },
  { id: 'japan_amedas', name: 'Japan AMeDAS', color: '#0ea5e9', category: 'Asian' },
  { id: 'japan_baiu', name: 'Japan Baiu (梅雨)', color: '#06b6d4', category: 'Asian' },
  { id: 'japan_typhoon', name: 'Japan Typhoon', color: '#0284c7', category: 'Asian' },
  { id: 'korea_kma', name: 'Korea KMA', color: '#2563eb', category: 'Asian' },
  { id: 'malaysia_msma', name: 'Malaysia MSMA', color: '#0d9488', category: 'Asian' },
  { id: 'indonesia_bmkg', name: 'Indonesia BMKG', color: '#dc2626', category: 'Asian' },
  { id: 'philippines_pagasa', name: 'Philippines PAGASA', color: '#7c3aed', category: 'Asian' },
  { id: 'vietnam_imhen', name: 'Vietnam IMHEN', color: '#ea580c', category: 'Asian' },
  { id: 'thailand_tmd', name: 'Thailand TMD', color: '#0369a1', category: 'Asian' },
  // Middle East / GCC
  { id: 'saudi_pme', name: 'Saudi Arabia PME', color: '#16a34a', category: 'Middle East' },
  { id: 'uae_ncms', name: 'UAE NCMS', color: '#dc2626', category: 'Middle East' },
  { id: 'qatar_kahramaa', name: 'Qatar Kahramaa', color: '#7c2d12', category: 'Middle East' },
  { id: 'oman_dgman', name: 'Oman DGMAN', color: '#b45309', category: 'Middle East' },
  { id: 'sa_sanral', name: 'SA SANRAL', color: '#059669', category: 'African' },
  { id: 'kenya_kmd', name: 'Kenya KMD', color: '#10b981', category: 'African' },
  { id: 'nigeria_nimet', name: 'Nigeria NiMet', color: '#047857', category: 'African' },
  { id: 'egypt_hcww', name: 'Egypt HCWW', color: '#065f46', category: 'African' },
  { id: 'brazil_ana', name: 'Brazil ANA', color: '#ca8a04', category: 'Latin American' },
  { id: 'mexico_conagua', name: 'Mexico CONAGUA', color: '#a16207', category: 'Latin American' },
  { id: 'colombia_ideam', name: 'Colombia IDEAM', color: '#854d0e', category: 'Latin American' },
  { id: 'chile_dga', name: 'Chile DGA', color: '#713f12', category: 'Latin American' },
];

interface PresetGroup {
  name: string;
  patterns: PatternType[];
  description: string;
}

const presetGroups: PresetGroup[] = [
  {
    name: 'All SCS',
    patterns: ['scs1a', 'scs1', 'scs2', 'scs3', 'balanced', 'yen_chow'],
    description: 'Compare all NRCS (SCS) and universal patterns',
  },
  {
    name: 'All Huff',
    patterns: ['huff1', 'huff2', 'huff3', 'huff4'],
    description: 'Compare all Huff quartiles',
  },
  {
    name: 'All International',
    patterns: ['desbordes', 'arr', 'dwa', 'jma', 'china', 'sa_huff', 'dutch', 'italian', 'canadian', 'nz_tp108', 'nz_wellington', 'nz_christchurch'],
    description: 'Compare all international patterns',
  },
  {
    name: 'Asian',
    patterns: ['singapore_pub', 'china_gb50014', 'china_prd', 'india_imd', 'india_coastal', 'japan_amedas', 'japan_baiu', 'japan_typhoon', 'korea_kma', 'malaysia_msma', 'indonesia_bmkg', 'philippines_pagasa', 'vietnam_imhen', 'thailand_tmd'],
    description: 'All 14 Asian design storm patterns',
  },
  {
    name: 'SE Asia',
    patterns: ['singapore_pub', 'malaysia_msma', 'indonesia_bmkg', 'philippines_pagasa', 'vietnam_imhen', 'thailand_tmd'],
    description: 'Southeast Asian design storms',
  },
  {
    name: 'Japan All',
    patterns: ['japan_amedas', 'japan_baiu', 'japan_typhoon', 'jma'],
    description: 'All Japanese storm patterns',
  },
  {
    name: 'China All',
    patterns: ['china', 'china_gb50014', 'china_prd'],
    description: 'All Chinese storm patterns',
  },
  {
    name: 'India All',
    patterns: ['india_imd', 'india_coastal'],
    description: 'Indian monsoon and cyclonic patterns',
  },
  {
    name: 'European',
    patterns: ['desbordes', 'dwa', 'dutch', 'italian', 'euler1', 'euler2', 'feh', 'desbordes_double'],
    description: 'European design patterns',
  },
  {
    name: 'US Standard',
    patterns: ['scs2', 'balanced', 'chicago', 'noaa_a14', 'huff2'],
    description: 'Common US design storms',
  },
  {
    name: 'Florida FDOT',
    patterns: ['fdot1', 'fdot2', 'fdot3', 'fdot4', 'fdot5'],
    description: 'All FDOT rainfall zones',
  },
  {
    name: 'Euler Types',
    patterns: ['euler1', 'euler2', 'dwa'],
    description: 'German Euler distributions',
  },
  {
    name: 'UK Methods',
    patterns: ['fsr', 'feh', 'triangular', 'trapezoidal'],
    description: 'UK design storm methods',
  },
  {
    name: 'Typhoon/Cyclone',
    patterns: ['japan_typhoon', 'china_prd', 'india_coastal', 'philippines_pagasa'],
    description: 'Tropical cyclone patterns',
  },
  {
    name: 'GCC Flash Flood',
    patterns: ['saudi_pme', 'uae_ncms', 'qatar_kahramaa', 'oman_dgman'],
    description: 'GCC/Middle East arid flash flood patterns',
  },
  {
    name: 'African',
    patterns: ['sa_sanral', 'kenya_kmd', 'nigeria_nimet', 'egypt_hcww', 'sa_huff'],
    description: 'All African design storm patterns',
  },
  {
    name: 'Latin American',
    patterns: ['brazil_ana', 'mexico_conagua', 'colombia_ideam', 'chile_dga'],
    description: 'All Latin American design storm patterns',
  },
  {
    name: 'Monsoon Belt',
    patterns: ['india_imd', 'india_coastal', 'japan_baiu', 'philippines_pagasa', 'vietnam_imhen', 'thailand_tmd'],
    description: 'Monsoon-influenced patterns across South & Southeast Asia',
  },
  {
    name: 'New Zealand',
    patterns: ['nz_tp108', 'nz_wellington', 'nz_christchurch'],
    description: 'All three NZ regional design storms (Auckland, Wellington, Christchurch)',
  },
];

export function PatternComparison({ depth: totalDepth, duration, timeStep, unitSystem }: PatternComparisonProps) {
  const [selectedPatterns, setSelectedPatterns] = useState<PatternType[]>([
    'scs1a',
    'scs1',
    'scs2',
    'scs3',
  ]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'intensity' | 'cumulative' | 'delta'>('intensity');
  
  // Watershed characteristics for recommendations
  const [location, setLocation] = useState<string>('');
  const [soilType, setSoilType] = useState<string>('');
  const [watershedSize, setWatershedSize] = useState<string>('');
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x, 2x, 4x speed
  const animationIntervalRef = useRef<number | null>(null);

  const chartData = useMemo(() => {
    const numSteps = Math.ceil((duration * 60) / timeStep);
    const data: any[] = [];
    const timeStepHours = timeStep / 60;

    // Store cumulative values and all intensities for each pattern
    const cumulatives: Record<string, number> = {};
    const allIntensities: Record<string, number[]> = {};
    
    // Pre-generate all pattern data
    selectedPatterns.forEach((patternId) => {
      const pattern = comparisonPatterns.find((p) => p.id === patternId);
      if (pattern) {
        allIntensities[pattern.name] = generateRainfallData(patternId, totalDepth, duration, timeStep);
      }
    });

    for (let i = 0; i < numSteps; i++) {
      const time = ((i * timeStep) / 60).toFixed(1);
      const point: any = { time };

      selectedPatterns.forEach((patternId) => {
        const pattern = comparisonPatterns.find((p) => p.id === patternId);
        if (!pattern) return;
        
        const intensities = allIntensities[pattern.name];
        
        if (viewMode === 'cumulative') {
          // Calculate cumulative depth
          if (!cumulatives[pattern.name]) {
            cumulatives[pattern.name] = 0;
          }
          cumulatives[pattern.name] += intensities[i] * timeStepHours;
          point[pattern.name] = parseFloat(cumulatives[pattern.name].toFixed(3));
        } else if (viewMode === 'delta' && selectedPatterns.length === 2) {
          // Calculate delta between two patterns (only works with exactly 2 patterns)
          const patterns = selectedPatterns.map(id => comparisonPatterns.find(p => p.id === id)).filter(Boolean);
          if (patterns.length === 2) {
            const intensities1 = allIntensities[patterns[0]!.name];
            const intensities2 = allIntensities[patterns[1]!.name];
            const delta = intensities1[i] - intensities2[i];
            point[`${patterns[0]!.name} - ${patterns[1]!.name}`] = parseFloat(delta.toFixed(3));
          }
        } else {
          // Use intensity (default)
          point[pattern.name] = intensities[i];
        }
      });

      data.push(point);
    }

    return data;
  }, [selectedPatterns, totalDepth, duration, timeStep, viewMode]);

  // Calculate statistics for each selected pattern
  const patternStats = useMemo(() => {
    const stats: Record<string, PatternStatistics> = {};
    
    selectedPatterns.forEach((patternId) => {
      const intensities = generateRainfallData(patternId, totalDepth, duration, timeStep);
      const pattern = comparisonPatterns.find((p) => p.id === patternId);
      if (pattern) {
        stats[pattern.name] = calculatePatternStatistics(intensities, timeStep);
      }
    });
    
    return stats;
  }, [selectedPatterns, totalDepth, duration, timeStep]);

  // Auto-analysis summary
  const analysisSummary = useMemo(() => {
    if (Object.keys(patternStats).length === 0) return null;

    const entries = Object.entries(patternStats);
    
    const earliestPeak = entries.reduce((min, [name, stats]) => 
      stats.timeToPeak < min.stats.timeToPeak ? { name, stats } : min
    , { name: entries[0][0], stats: entries[0][1] });

    const latestPeak = entries.reduce((max, [name, stats]) => 
      stats.timeToPeak > max.stats.timeToPeak ? { name, stats } : max
    , { name: entries[0][0], stats: entries[0][1] });

    const highestIntensity = entries.reduce((max, [name, stats]) => 
      stats.peakIntensity > max.stats.peakIntensity ? { name, stats } : max
    , { name: entries[0][0], stats: entries[0][1] });

    const lowestIntensity = entries.reduce((min, [name, stats]) => 
      stats.peakIntensity < min.stats.peakIntensity ? { name, stats } : min
    , { name: entries[0][0], stats: entries[0][1] });

    return {
      earliestPeak,
      latestPeak,
      highestIntensity,
      lowestIntensity,
    };
  }, [patternStats]);

  // Pattern recommendation engine
  const recommendedPattern = useMemo(() => {
    if (!location || !soilType || !watershedSize) return null;

    const loc = location.toLowerCase();
    const soil = soilType.toLowerCase();
    const size = watershedSize.toLowerCase();

    // Location-based recommendations
    if (loc.includes('pacific') || loc.includes('west coast') || loc.includes('california') || loc.includes('oregon') || loc.includes('washington')) {
      return {
        pattern: 'scs1a' as PatternType,
        name: 'SCS Type IA',
        reason: 'Type IA is recommended for Pacific maritime climates with mild, wet winters. It represents storms with less intense rainfall distributed more evenly throughout the storm duration.'
      };
    }
    
    if (loc.includes('hawaii') || loc.includes('alaska')) {
      return {
        pattern: 'scs1' as PatternType,
        name: 'SCS Type I',
        reason: 'Type I is suitable for Hawaii, Alaska, and coastal areas with maritime climates featuring moderate rainfall intensities.'
      };
    }
    
    if (loc.includes('midwest') || loc.includes('great plains') || loc.includes('central') || loc.includes('south') || loc.includes('southeast') || loc.includes('east')) {
      // Further refine based on soil and size for Type II regions
      if (soil.includes('clay') || soil.includes('d') || size.includes('large')) {
        return {
          pattern: 'scs2' as PatternType,
          name: 'SCS Type II',
          reason: 'Type II is recommended for the majority of the US (except Pacific and arid West). It features a peak intensity near the middle of the storm, suitable for clay soils and larger watersheds with slower response times.'
        };
      }
      return {
        pattern: 'scs2' as PatternType,
        name: 'SCS Type II',
        reason: 'Type II is the most commonly used pattern in the US, representing typical storm behavior in the eastern two-thirds of the country with a strong central peak.'
      };
    }
    
    if (loc.includes('southwest') || loc.includes('desert') || loc.includes('arid') || loc.includes('arizona') || loc.includes('new mexico') || loc.includes('nevada')) {
      // Sandy soils or small watersheds favor Type III
      if (soil.includes('sand') || soil.includes('a') || soil.includes('b') || size.includes('small')) {
        return {
          pattern: 'scs3' as PatternType,
          name: 'SCS Type III',
          reason: 'Type III is ideal for the arid Southwest with sandy/permeable soils and small watersheds. It features an extreme peak intensity (77% in 15 minutes) representing intense thunderstorm activity.'
        };
      }
      return {
        pattern: 'scs3' as PatternType,
        name: 'SCS Type III',
        reason: 'Type III is designed for the arid/semi-arid Southwest (Gulf of Mexico to California), featuring very intense, short-duration storm peaks typical of desert thunderstorms.'
      };
    }

    // Chicago method for urban areas
    if (loc.includes('urban') || loc.includes('city') || size.includes('small')) {
      return {
        pattern: 'chicago' as PatternType,
        name: 'Chicago Storm',
        reason: 'Chicago method is excellent for small urban watersheds with fast response times. It features a sharp peak with symmetric rainfall distribution around the peak.'
      };
    }

    // Huff quartile recommendations based on soil and size
    if (soil.includes('sand') || soil.includes('a')) {
      return {
        pattern: 'huff1' as PatternType,
        name: 'Huff 1st Quartile',
        reason: 'Huff 1st Quartile is recommended for highly permeable sandy soils (Type A). Early-peaked storms allow more infiltration before peak runoff occurs.'
      };
    }

    if (size.includes('large') || soil.includes('clay') || soil.includes('d')) {
      return {
        pattern: 'huff4' as PatternType,
        name: 'Huff 4th Quartile',
        reason: 'Huff 4th Quartile is suitable for large watersheds or clay soils (Type D) with slow response. Late-peaked storms account for soil saturation over time.'
      };
    }

    // Default to SCS Type II (most common)
    return {
      pattern: 'scs2' as PatternType,
      name: 'SCS Type II',
      reason: 'SCS Type II is the most widely applicable pattern for general use in the continental US, representing typical mid-storm peak behavior.'
    };
  }, [location, soilType, watershedSize]);

  const togglePattern = (patternId: PatternType) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const loadPreset = (preset: PresetGroup) => {
    setSelectedPatterns(preset.patterns);
    toast({ title: "Preset loaded", description: `Loaded preset: ${preset.name}` });
  };

  const applyRecommendation = () => {
    if (recommendedPattern) {
      setSelectedPatterns([recommendedPattern.pattern]);
      toast({ 
        title: "Recommendation applied", 
        description: `Selected ${recommendedPattern.name} based on watershed characteristics` 
      });
    }
  };

  const resetToDefaults = () => {
    setViewMode('intensity');
    toast({ title: "View mode reset", description: "Switched back to intensity view" });
  };

  // Animation controls
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setCurrentTimeIndex(0);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setCurrentTimeIndex(0);
  }, []);

  // Animation loop
  useEffect(() => {
    if (isAnimating) {
      const numSteps = Math.ceil((duration * 60) / timeStep);
      const interval = (100 / animationSpeed); // Base speed: 100ms per frame
      
      animationIntervalRef.current = window.setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= numSteps - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);

      return () => {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
        }
      };
    }
  }, [isAnimating, duration, timeStep, animationSpeed]);

  // Get current time for animation marker
  const currentTime = useMemo(() => {
    return ((currentTimeIndex * timeStep) / 60).toFixed(1);
  }, [currentTimeIndex, timeStep]);

  // Get current intensities for display
  const currentIntensities = useMemo(() => {
    if (!isAnimating && currentTimeIndex === 0) return null;
    
    const intensities: Record<string, number> = {};
    selectedPatterns.forEach((patternId) => {
      const pattern = comparisonPatterns.find((p) => p.id === patternId);
      if (pattern) {
        const data = generateRainfallData(patternId, totalDepth, duration, timeStep);
        intensities[pattern.name] = data[currentTimeIndex] || 0;
      }
    });
    return intensities;
  }, [selectedPatterns, currentTimeIndex, totalDepth, duration, timeStep, isAnimating]);

  const exportChartAsPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'rainfall-pattern-comparison.png';
      link.href = canvas.toDataURL();
      link.click();
      
      toast({ title: "Export successful", description: "Chart exported as PNG" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to export chart", variant: "destructive" });
      console.error(error);
    }
  };

  const exportChartAsSVG = () => {
    if (!chartRef.current) return;
    
    try {
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        toast({ title: "Export failed", description: "Chart not found", variant: "destructive" });
        return;
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.download = 'rainfall-pattern-comparison.svg';
      link.href = svgUrl;
      link.click();
      
      URL.revokeObjectURL(svgUrl);
      toast({ title: "Export successful", description: "Chart exported as SVG" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to export chart", variant: "destructive" });
      console.error(error);
    }
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf')
      ]);

      toast({ title: "Generating PDF", description: "Please wait..." });

      // Capture the chart
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const chartImage = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rainfall Pattern Comparison Report', margin, yPosition);
      yPosition += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 8;

      // Storm Parameters
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Storm Parameters', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Depth: ${totalDepth.toFixed(1)} inches`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Duration: ${duration.toFixed(1)} hours`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Time Step: ${timeStep} minutes`, margin, yPosition);
      yPosition += 10;

      // Selected Patterns
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Selected Patterns', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const patternNames = selectedPatterns.map(id => 
        comparisonPatterns.find(p => p.id === id)?.name || id
      ).join(', ');
      const splitPatterns = pdf.splitTextToSize(patternNames, pageWidth - 2 * margin);
      pdf.text(splitPatterns, margin, yPosition);
      yPosition += splitPatterns.length * 5 + 8;

      // Chart
      const chartWidth = pageWidth - 2 * margin;
      const chartHeight = (canvas.height * chartWidth) / canvas.width;
      
      if (yPosition + chartHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(chartImage, 'PNG', margin, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 10;

      // Statistics Table
      if (yPosition + 60 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pattern Statistics', margin, yPosition);
      yPosition += 8;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const colWidth = (pageWidth - 2 * margin) / 5;
      pdf.text('Pattern', margin, yPosition);
      pdf.text('Peak (in/hr)', margin + colWidth, yPosition);
      pdf.text('Time to Peak', margin + 2 * colWidth, yPosition);
      pdf.text('Centroid', margin + 3 * colWidth, yPosition);
      pdf.text('Skewness', margin + 4 * colWidth, yPosition);
      yPosition += 6;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      Object.entries(patternStats).forEach(([name, stats]) => {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;
        }

        const shortName = name.length > 18 ? name.substring(0, 15) + '...' : name;
        pdf.text(shortName, margin, yPosition);
        pdf.text(stats.peakIntensity.toString(), margin + colWidth, yPosition);
        pdf.text(`${stats.timeToPeak} hrs`, margin + 2 * colWidth, yPosition);
        pdf.text(`${stats.centroid} hrs`, margin + 3 * colWidth, yPosition);
        pdf.text((stats.skewness > 0 ? '+' : '') + stats.skewness.toString(), margin + 4 * colWidth, yPosition);
        yPosition += 5;
      });

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      pdf.save('rainfall-pattern-comparison-report.pdf');
      toast({ title: "Export successful", description: "PDF report generated successfully" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to generate PDF report", variant: "destructive" });
      console.error(error);
    }
  };

  const groupedPatterns = comparisonPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, ComparisonPattern[]>);

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Pattern Comparison</CardTitle>
        <CardDescription>
          Overlay multiple rainfall patterns to compare their temporal distributions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Recommendation Engine */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Pattern Recommendation Engine</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter watershed characteristics to receive pattern recommendations based on regional and site-specific conditions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location/Region
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pacific West Coast">Pacific West Coast</SelectItem>
                  <SelectItem value="Hawaii/Alaska">Hawaii/Alaska</SelectItem>
                  <SelectItem value="Midwest">Midwest</SelectItem>
                  <SelectItem value="Southeast">Southeast</SelectItem>
                  <SelectItem value="Northeast">Northeast</SelectItem>
                  <SelectItem value="Southwest Desert">Southwest Desert</SelectItem>
                  <SelectItem value="Central Plains">Central Plains</SelectItem>
                  <SelectItem value="Urban Area">Urban Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Type A - Sand">Type A - Sand (High infiltration)</SelectItem>
                  <SelectItem value="Type B - Loam">Type B - Loam (Moderate infiltration)</SelectItem>
                  <SelectItem value="Type C - Silt">Type C - Silt (Low infiltration)</SelectItem>
                  <SelectItem value="Type D - Clay">Type D - Clay (Very low infiltration)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Watershed Size</Label>
              <Select value={watershedSize} onValueChange={setWatershedSize}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small (<1 sq mi)">Small (&lt;1 sq mi)</SelectItem>
                  <SelectItem value="Medium (1-10 sq mi)">Medium (1-10 sq mi)</SelectItem>
                  <SelectItem value="Large (>10 sq mi)">Large (&gt;10 sq mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recommendedPattern && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: comparisonPatterns.find(p => p.id === recommendedPattern.pattern)?.color }}
                  />
                  <p className="text-sm font-semibold text-foreground">
                    Recommended: {recommendedPattern.name}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={applyRecommendation}>
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {recommendedPattern.reason}
              </p>
            </div>
          )}
        </div>

        {/* Storm Parameters */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Storm Parameters</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Total Depth</Label>
                <span className="text-xs font-mono text-muted-foreground">{convertDepth(totalDepth, 'USA', unitSystem).toFixed(unitSystem === 'USA' ? 1 : 0)} {getDepthUnit(unitSystem)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Duration</Label>
                <span className="text-xs font-mono text-muted-foreground">{duration.toFixed(1)} hrs</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Time Step</Label>
                <span className="text-xs font-mono text-muted-foreground">{timeStep} min</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full md:w-auto flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Preset Groups */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Quick Presets</h4>
          <div className="flex flex-wrap gap-2">
            {presetGroups.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => loadPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Pattern Selection with Collapsible Categories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">Pattern Selection</h4>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedPatterns(comparisonPatterns.map(p => p.id))}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedPatterns([])}
              >
                Clear All
              </Button>
            </div>
          </div>
          
          {Object.entries(groupedPatterns).map(([category, patterns]) => {
            const categoryPatternIds = patterns.map(p => p.id);
            const selectedInCategory = categoryPatternIds.filter(id => selectedPatterns.includes(id));
            const allSelected = selectedInCategory.length === categoryPatternIds.length;
            const someSelected = selectedInCategory.length > 0 && !allSelected;
            
            const toggleCategory = () => {
              if (allSelected) {
                setSelectedPatterns(prev => prev.filter(id => !categoryPatternIds.includes(id)));
              } else {
                setSelectedPatterns(prev => [...new Set([...prev, ...categoryPatternIds])]);
              }
            };
            
            return (
              <Collapsible key={category} defaultOpen className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=closed]:hidden" />
                    <ChevronRight className="w-4 h-4 transition-transform group-data-[state=open]:hidden" />
                    <span className="text-sm font-semibold text-foreground">{category}</span>
                    <span className="text-xs text-muted-foreground">
                      ({selectedInCategory.length}/{categoryPatternIds.length} selected)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory();
                    }}
                  >
                    {allSelected ? 'Deselect All' : someSelected ? 'Select Rest' : 'Select All'}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 pt-0 border-t border-border bg-accent/10">
                    {patterns.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`compare-${pattern.id}`}
                          checked={selectedPatterns.includes(pattern.id)}
                          onCheckedChange={() => togglePattern(pattern.id)}
                        />
                        <Label
                          htmlFor={`compare-${pattern.id}`}
                          className="text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: pattern.color }}
                          />
                          {pattern.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Comparison Chart */}
        {selectedPatterns.length > 0 ? (
          <>
            <div ref={chartRef} className="bg-card rounded-lg border border-border p-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    label={{ value: "Time (hours)", position: "insideBottom", offset: -5 }}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    label={{ 
                      value: viewMode === 'cumulative' ? `Cumulative Depth (${getDepthUnit(unitSystem)})` : 
                             viewMode === 'delta' ? `Intensity Difference (${getIntensityUnit(unitSystem)})` : 
                             `Intensity (${getIntensityUnit(unitSystem)})`, 
                      angle: -90, 
                      position: "insideLeft" 
                    }}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {/* Animation marker */}
                  {(isAnimating || currentTimeIndex > 0) && (
                    <ReferenceLine
                      x={currentTime}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{
                        value: `t = ${currentTime} hrs`,
                        position: 'top',
                        fill: 'hsl(var(--primary))',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                  {viewMode === 'delta' && selectedPatterns.length === 2 ? (
                    // Delta view: show single line representing difference
                    <Line
                      key="delta"
                      type="monotone"
                      dataKey={`${comparisonPatterns.find(p => p.id === selectedPatterns[0])?.name} - ${comparisonPatterns.find(p => p.id === selectedPatterns[1])?.name}`}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : (
                    // Regular view: show all selected patterns
                    selectedPatterns.map((patternId) => {
                      const pattern = comparisonPatterns.find((p) => p.id === patternId);
                      return pattern ? (
                        <Line
                          key={pattern.id}
                          type="monotone"
                          dataKey={pattern.name}
                          stroke={pattern.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      ) : null;
                    })
                  )}
                </LineChart>
              </ResponsiveContainer>
              
              {/* Animation Controls */}
              <div className="mt-3 pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isAnimating ? pauseAnimation : startAnimation}
                      className="flex items-center gap-2"
                    >
                      {isAnimating ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play Animation
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAnimation}
                      disabled={currentTimeIndex === 0 && !isAnimating}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1 rounded border border-border bg-accent/20">
                      <span className="text-xs text-muted-foreground">Speed:</span>
                      <Select value={animationSpeed.toString()} onValueChange={(val) => setAnimationSpeed(Number(val))}>
                        <SelectTrigger className="h-7 w-16 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                          <SelectItem value="4">4x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {currentIntensities && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">Current Time: {currentTime} hrs</span>
                      <div className="flex items-center gap-2">
                        {selectedPatterns.map((patternId) => {
                          const pattern = comparisonPatterns.find(p => p.id === patternId);
                          if (!pattern) return null;
                          return (
                            <div key={pattern.id} className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border bg-card">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: pattern.color }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {currentIntensities[pattern.name]?.toFixed(3)} in/hr
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border flex-wrap gap-3">
                <p className="text-xs text-muted-foreground">
                  Comparison parameters: {totalDepth} inches total depth, {duration} hour duration, {timeStep} minute time step
                </p>
                <div className="flex items-center gap-3">
                  <RadioGroup value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="intensity" id="view-intensity" />
                      <Label htmlFor="view-intensity" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
                        <Activity className="w-3.5 h-3.5" />
                        Intensity
                      </Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="cumulative" id="view-cumulative" />
                      <Label htmlFor="view-cumulative" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Cumulative
                      </Label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value="delta" id="view-delta" disabled={selectedPatterns.length !== 2} />
                      <Label htmlFor="view-delta" className={`text-xs flex items-center gap-1 cursor-pointer ${selectedPatterns.length !== 2 ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        <Gauge className="w-3.5 h-3.5" />
                        Delta {selectedPatterns.length !== 2 && '(select 2)'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportChartAsPNG}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChartAsSVG}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export SVG
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={exportAsPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Full Report (PDF)
              </Button>
            </div>

            {/* Analysis Summary */}
            {analysisSummary && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Auto-Analysis Summary</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Earliest Peak</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.earliestPeak.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.earliestPeak.name)?.color }}
                            />
                          )}
                          {analysisSummary.earliestPeak.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          at {analysisSummary.earliestPeak.stats.timeToPeak} hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Latest Peak</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.latestPeak.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.latestPeak.name)?.color }}
                            />
                          )}
                          {analysisSummary.latestPeak.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          at {analysisSummary.latestPeak.stats.timeToPeak} hours
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Highest Intensity</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.highestIntensity.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.highestIntensity.name)?.color }}
                            />
                          )}
                          {analysisSummary.highestIntensity.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {analysisSummary.highestIntensity.stats.peakIntensity} in/hr
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Lowest Intensity</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.lowestIntensity.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.lowestIntensity.name)?.color }}
                            />
                          )}
                          {analysisSummary.lowestIntensity.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {analysisSummary.lowestIntensity.stats.peakIntensity} in/hr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pattern Statistics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Pattern Statistics</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-semibold text-foreground">Pattern</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Peak Intensity</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Time to Peak</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Centroid</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Skewness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(patternStats).map(([name, stats]) => {
                      const pattern = comparisonPatterns.find((p) => p.name === name);
                      return (
                        <tr key={name} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="py-2 px-2 flex items-center gap-2">
                            {pattern && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: pattern.color }}
                              />
                            )}
                            <span className="text-foreground">{name}</span>
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.peakIntensity} in/hr
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.timeToPeak} hrs
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.centroid} hrs
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.skewness > 0 ? '+' : ''}{stats.skewness}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p><strong>Peak Intensity:</strong> Maximum rainfall rate during the storm</p>
                <p><strong>Time to Peak:</strong> Duration from storm start to maximum intensity</p>
                <p><strong>Centroid:</strong> Center of mass of the rainfall distribution (temporal balance point)</p>
                <p><strong>Skewness:</strong> Measure of asymmetry (negative = left-skewed, positive = right-skewed)</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Select at least one pattern to display the comparison chart
          </div>
        )}

        {/* Animation Export */}
        {selectedPatterns.length > 0 && (
          <AnimationExport
            chartRef={chartRef}
            isAnimating={isAnimating}
            currentTimeIndex={currentTimeIndex}
            totalSteps={Math.ceil((duration * 60) / timeStep)}
            onStartAnimation={startAnimation}
            onPauseAnimation={pauseAnimation}
            onResetAnimation={resetAnimation}
          />
        )}
      </CardContent>
    </Card>
  );
}
