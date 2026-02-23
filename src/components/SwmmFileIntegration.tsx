import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useMemo } from "react";
import { Upload, Download, FileText, Plus, Eye, Edit, Layers, FileInput, Droplets, Wrench, CloudRain, FileCode, Package, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { toast } from "@/hooks/use-toast";
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";

interface ImportedTimeSeries {
  name: string;
  data: Array<{ date: string; time: string; value: number }>;
  validation?: TimeSeriesValidation;
}

interface TimeSeriesValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  stats: {
    totalPoints: number;
    totalDepth: number;
    maxValue: number;
    minValue: number;
    avgValue: number;
    hasNegatives: boolean;
    hasZeros: boolean;
    durationMinutes: number;
  };
}

interface SwmmFileIntegrationProps {
  selectedPattern: PatternType;
  patternName: string;
  totalDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
}

const allPatterns: Array<{ id: PatternType; name: string; category: string }> = [
  { id: 'scs1a', name: 'SCS Type IA', category: 'SCS' },
  { id: 'scs1', name: 'SCS Type I', category: 'SCS' },
  { id: 'scs2', name: 'SCS Type II', category: 'SCS' },
  { id: 'scs3', name: 'SCS Type III', category: 'SCS' },
  { id: 'balanced', name: 'Balanced Storm', category: 'SCS' },
  { id: 'yen_chow', name: 'Yen & Chow', category: 'SCS' },
  { id: 'huff1', name: 'Huff 1st Quartile', category: 'Huff' },
  { id: 'huff2', name: 'Huff 2nd Quartile', category: 'Huff' },
  { id: 'huff3', name: 'Huff 3rd Quartile', category: 'Huff' },
  { id: 'huff4', name: 'Huff 4th Quartile', category: 'Huff' },
  { id: 'chicago', name: 'Chicago Storm', category: 'Other' },
  { id: 'block', name: 'Block (Uniform)', category: 'Other' },
  { id: 'fdot1', name: 'FDOT Zone 1 (NW FL)', category: 'US Agency' },
  { id: 'fdot2', name: 'FDOT Zone 2 (NE FL)', category: 'US Agency' },
  { id: 'fdot3', name: 'FDOT Zone 3 (Central FL)', category: 'US Agency' },
  { id: 'fdot4', name: 'FDOT Zone 4 (SE FL)', category: 'US Agency' },
  { id: 'fdot5', name: 'FDOT Zone 5 (SW FL)', category: 'US Agency' },
  { id: 'txdot', name: 'TxDOT', category: 'US Agency' },
  { id: 'noaa_a14', name: 'NOAA Atlas 14', category: 'US Agency' },
  { id: 'desbordes', name: 'Desbordes (France)', category: 'International' },
  { id: 'arr', name: 'Australian ARR', category: 'International' },
  { id: 'dwa', name: 'German DWA', category: 'International' },
  { id: 'jma', name: 'Japan JMA', category: 'International' },
  { id: 'china', name: 'Chinese P&C', category: 'International' },
  { id: 'sa_huff', name: 'South Africa Huff', category: 'International' },
  { id: 'dutch', name: 'Dutch KNMI', category: 'International' },
  { id: 'italian', name: 'Italian (LSPP)', category: 'International' },
];

export function SwmmFileIntegration({
  selectedPattern,
  patternName,
  totalDepth,
  duration,
  timeStep,
  unitSystem,
}: SwmmFileIntegrationProps) {
  const [inpFile, setInpFile] = useState<File | null>(null);
  const [inpContent, setInpContent] = useState<string>("");
  const [timeSeriesName, setTimeSeriesName] = useState<string>("");
  const [previewData, setPreviewData] = useState<string>("");
  const [editedData, setEditedData] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Batch processing state
  const [selectedBatchPatterns, setSelectedBatchPatterns] = useState<PatternType[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  
  // Import state
  const [importedTimeSeries, setImportedTimeSeries] = useState<ImportedTimeSeries[]>([]);
  const [selectedImportSeries, setSelectedImportSeries] = useState<string>("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // ICM export state
  const [icmEventName, setIcmEventName] = useState<string>("");
  
  // EPA SWMM template customization
  const [swmmParams, setSwmmParams] = useState({
    subcatchArea: 10,
    imperviousness: 50,
    width: 500,
    slope: 0.5,
    nImperv: 0.01,
    nPerv: 0.1,
    sImperv: 0.05,
    sPerv: 0.05,
    pctZero: 25,
    maxInfil: 3.0,
    minInfil: 0.5,
    decay: 4,
    dryTime: 7,
    conduitLength: 400,
    conduitRoughness: 0.01,
    conduitDiameter: 2,
    junctionDepth: 4,
  });
  const [showSwmmParams, setShowSwmmParams] = useState(false);
  
  // Land use presets for SWMM parameters
  const landUsePresets = {
    residential_low: {
      name: 'Low-Density Residential',
      params: {
        subcatchArea: 10, imperviousness: 25, width: 400, slope: 1.0,
        nImperv: 0.011, nPerv: 0.15, sImperv: 0.06, sPerv: 0.15,
        pctZero: 25, maxInfil: 3.0, minInfil: 0.5, decay: 4, dryTime: 7,
        conduitLength: 400, conduitRoughness: 0.013, conduitDiameter: 1.5, junctionDepth: 4
      }
    },
    residential_med: {
      name: 'Medium-Density Residential',
      params: {
        subcatchArea: 5, imperviousness: 50, width: 300, slope: 0.8,
        nImperv: 0.012, nPerv: 0.12, sImperv: 0.05, sPerv: 0.10,
        pctZero: 30, maxInfil: 2.5, minInfil: 0.4, decay: 4, dryTime: 7,
        conduitLength: 350, conduitRoughness: 0.013, conduitDiameter: 2.0, junctionDepth: 5
      }
    },
    residential_high: {
      name: 'High-Density Residential',
      params: {
        subcatchArea: 3, imperviousness: 70, width: 250, slope: 0.5,
        nImperv: 0.012, nPerv: 0.10, sImperv: 0.05, sPerv: 0.08,
        pctZero: 40, maxInfil: 2.0, minInfil: 0.3, decay: 4, dryTime: 7,
        conduitLength: 300, conduitRoughness: 0.013, conduitDiameter: 2.5, junctionDepth: 6
      }
    },
    commercial: {
      name: 'Commercial',
      params: {
        subcatchArea: 8, imperviousness: 85, width: 500, slope: 0.5,
        nImperv: 0.011, nPerv: 0.10, sImperv: 0.05, sPerv: 0.06,
        pctZero: 50, maxInfil: 2.0, minInfil: 0.3, decay: 4, dryTime: 7,
        conduitLength: 400, conduitRoughness: 0.012, conduitDiameter: 3.0, junctionDepth: 8
      }
    },
    industrial: {
      name: 'Industrial',
      params: {
        subcatchArea: 15, imperviousness: 90, width: 600, slope: 0.3,
        nImperv: 0.011, nPerv: 0.08, sImperv: 0.04, sPerv: 0.05,
        pctZero: 60, maxInfil: 1.5, minInfil: 0.2, decay: 3, dryTime: 7,
        conduitLength: 500, conduitRoughness: 0.012, conduitDiameter: 4.0, junctionDepth: 10
      }
    },
    park: {
      name: 'Park / Open Space',
      params: {
        subcatchArea: 20, imperviousness: 5, width: 800, slope: 2.0,
        nImperv: 0.02, nPerv: 0.25, sImperv: 0.10, sPerv: 0.30,
        pctZero: 10, maxInfil: 4.5, minInfil: 1.0, decay: 4, dryTime: 5,
        conduitLength: 500, conduitRoughness: 0.02, conduitDiameter: 1.5, junctionDepth: 3
      }
    },
    agricultural: {
      name: 'Agricultural',
      params: {
        subcatchArea: 50, imperviousness: 2, width: 1000, slope: 1.5,
        nImperv: 0.02, nPerv: 0.20, sImperv: 0.10, sPerv: 0.25,
        pctZero: 5, maxInfil: 4.0, minInfil: 0.8, decay: 4, dryTime: 5,
        conduitLength: 600, conduitRoughness: 0.025, conduitDiameter: 1.5, junctionDepth: 3
      }
    },
    parking_lot: {
      name: 'Parking Lot',
      params: {
        subcatchArea: 2, imperviousness: 98, width: 200, slope: 0.5,
        nImperv: 0.011, nPerv: 0.10, sImperv: 0.03, sPerv: 0.05,
        pctZero: 80, maxInfil: 1.0, minInfil: 0.1, decay: 3, dryTime: 7,
        conduitLength: 200, conduitRoughness: 0.012, conduitDiameter: 2.0, junctionDepth: 4
      }
    },
    forest: {
      name: 'Forest / Woods',
      params: {
        subcatchArea: 100, imperviousness: 1, width: 1500, slope: 5.0,
        nImperv: 0.02, nPerv: 0.40, sImperv: 0.15, sPerv: 0.40,
        pctZero: 5, maxInfil: 5.0, minInfil: 1.5, decay: 4, dryTime: 4,
        conduitLength: 800, conduitRoughness: 0.03, conduitDiameter: 1.0, junctionDepth: 2
      }
    },
    highway: {
      name: 'Highway / Road',
      params: {
        subcatchArea: 5, imperviousness: 95, width: 150, slope: 2.0,
        nImperv: 0.011, nPerv: 0.08, sImperv: 0.03, sPerv: 0.05,
        pctZero: 70, maxInfil: 1.5, minInfil: 0.2, decay: 3, dryTime: 7,
        conduitLength: 300, conduitRoughness: 0.012, conduitDiameter: 2.5, junctionDepth: 5
      }
    }
  };
  
  const applyLandUsePreset = (presetKey: keyof typeof landUsePresets) => {
    const preset = landUsePresets[presetKey];
    setSwmmParams(preset.params);
    toast({
      title: "Preset applied",
      description: `Applied "${preset.name}" parameters`
    });
  };
  
  // Soil type presets (USDA/NRCS Hydrologic Soil Groups)
  const soilTypePresets = {
    A: {
      name: 'Type A - Sand/Gravel',
      description: 'High infiltration, low runoff potential',
      params: { maxInfil: 5.0, minInfil: 1.2, decay: 4, dryTime: 4, sPerv: 0.30, nPerv: 0.20 }
    },
    B: {
      name: 'Type B - Sandy Loam',
      description: 'Moderate infiltration',
      params: { maxInfil: 3.0, minInfil: 0.6, decay: 4, dryTime: 5, sPerv: 0.20, nPerv: 0.15 }
    },
    C: {
      name: 'Type C - Clay Loam',
      description: 'Low infiltration',
      params: { maxInfil: 1.5, minInfil: 0.3, decay: 3, dryTime: 7, sPerv: 0.12, nPerv: 0.12 }
    },
    D: {
      name: 'Type D - Clay',
      description: 'Very low infiltration, high runoff potential',
      params: { maxInfil: 0.8, minInfil: 0.1, decay: 2, dryTime: 10, sPerv: 0.08, nPerv: 0.10 }
    }
  };
  
  const applySoilTypePreset = (soilType: keyof typeof soilTypePresets) => {
    const preset = soilTypePresets[soilType];
    setSwmmParams(prev => ({
      ...prev,
      ...preset.params
    }));
    toast({
      title: "Soil type applied",
      description: `Applied "${preset.name}" infiltration parameters`
    });
  };
  
  // Parameter validation with realistic ranges
  const parameterValidation = useMemo(() => {
    const warnings: Array<{ param: string; message: string; severity: 'warning' | 'error' }> = [];
    
    // Subcatchment Area
    if (swmmParams.subcatchArea <= 0) {
      warnings.push({ param: 'subcatchArea', message: 'Subcatchment area must be positive', severity: 'error' });
    } else if (swmmParams.subcatchArea > 1000) {
      warnings.push({ param: 'subcatchArea', message: 'Subcatchment area >1000 acres is unusually large', severity: 'warning' });
    }
    
    // Imperviousness
    if (swmmParams.imperviousness < 0 || swmmParams.imperviousness > 100) {
      warnings.push({ param: 'imperviousness', message: 'Imperviousness must be 0-100%', severity: 'error' });
    } else if (swmmParams.imperviousness > 98) {
      warnings.push({ param: 'imperviousness', message: 'Imperviousness >98% is rarely realistic', severity: 'warning' });
    }
    
    // Width
    if (swmmParams.width <= 0) {
      warnings.push({ param: 'width', message: 'Width must be positive', severity: 'error' });
    } else if (swmmParams.width > 5000) {
      warnings.push({ param: 'width', message: 'Width >5000 ft is unusually large', severity: 'warning' });
    }
    
    // Slope
    if (swmmParams.slope <= 0) {
      warnings.push({ param: 'slope', message: 'Slope must be positive', severity: 'error' });
    } else if (swmmParams.slope > 20) {
      warnings.push({ param: 'slope', message: 'Slope >20% indicates steep terrain', severity: 'warning' });
    } else if (swmmParams.slope < 0.1) {
      warnings.push({ param: 'slope', message: 'Slope <0.1% may cause drainage issues', severity: 'warning' });
    }
    
    // Manning's n (impervious)
    if (swmmParams.nImperv < 0.001 || swmmParams.nImperv > 0.05) {
      warnings.push({ param: 'nImperv', message: 'n-Imperv typically 0.01-0.02 for smooth surfaces', severity: 'warning' });
    }
    
    // Manning's n (pervious)
    if (swmmParams.nPerv < 0.01 || swmmParams.nPerv > 0.8) {
      warnings.push({ param: 'nPerv', message: 'n-Pervious typically 0.1-0.4 for natural surfaces', severity: 'warning' });
    }
    
    // Depression storage (impervious)
    if (swmmParams.sImperv < 0) {
      warnings.push({ param: 'sImperv', message: 'Depression storage cannot be negative', severity: 'error' });
    } else if (swmmParams.sImperv > 0.3) {
      warnings.push({ param: 'sImperv', message: 'S-Imperv >0.3 in is unusually high', severity: 'warning' });
    }
    
    // Depression storage (pervious)
    if (swmmParams.sPerv < 0) {
      warnings.push({ param: 'sPerv', message: 'Depression storage cannot be negative', severity: 'error' });
    } else if (swmmParams.sPerv > 0.5) {
      warnings.push({ param: 'sPerv', message: 'S-Pervious >0.5 in is unusually high', severity: 'warning' });
    }
    
    // Percent zero imperv
    if (swmmParams.pctZero < 0 || swmmParams.pctZero > 100) {
      warnings.push({ param: 'pctZero', message: '% Zero-Imperv must be 0-100%', severity: 'error' });
    }
    
    // Infiltration parameters
    if (swmmParams.maxInfil <= 0) {
      warnings.push({ param: 'maxInfil', message: 'Max infiltration must be positive', severity: 'error' });
    } else if (swmmParams.maxInfil > 10) {
      warnings.push({ param: 'maxInfil', message: 'Max infiltration >10 in/hr is very high (sand/gravel)', severity: 'warning' });
    }
    
    if (swmmParams.minInfil < 0) {
      warnings.push({ param: 'minInfil', message: 'Min infiltration cannot be negative', severity: 'error' });
    } else if (swmmParams.minInfil > swmmParams.maxInfil) {
      warnings.push({ param: 'minInfil', message: 'Min infiltration exceeds max infiltration', severity: 'error' });
    }
    
    if (swmmParams.decay <= 0) {
      warnings.push({ param: 'decay', message: 'Decay constant must be positive', severity: 'error' });
    } else if (swmmParams.decay > 10) {
      warnings.push({ param: 'decay', message: 'Decay >10/hr is unusually rapid', severity: 'warning' });
    }
    
    if (swmmParams.dryTime < 0) {
      warnings.push({ param: 'dryTime', message: 'Dry time cannot be negative', severity: 'error' });
    } else if (swmmParams.dryTime > 30) {
      warnings.push({ param: 'dryTime', message: 'Dry time >30 days is very long', severity: 'warning' });
    }
    
    // Conduit parameters
    if (swmmParams.conduitLength <= 0) {
      warnings.push({ param: 'conduitLength', message: 'Conduit length must be positive', severity: 'error' });
    } else if (swmmParams.conduitLength > 2000) {
      warnings.push({ param: 'conduitLength', message: 'Conduit length >2000 ft is unusually long', severity: 'warning' });
    }
    
    if (swmmParams.conduitRoughness < 0.008 || swmmParams.conduitRoughness > 0.03) {
      warnings.push({ param: 'conduitRoughness', message: 'Manning n typically 0.01-0.015 for pipes', severity: 'warning' });
    }
    
    if (swmmParams.conduitDiameter <= 0) {
      warnings.push({ param: 'conduitDiameter', message: 'Diameter must be positive', severity: 'error' });
    } else if (swmmParams.conduitDiameter > 15) {
      warnings.push({ param: 'conduitDiameter', message: 'Diameter >15 ft indicates large tunnel', severity: 'warning' });
    } else if (swmmParams.conduitDiameter < 0.5) {
      warnings.push({ param: 'conduitDiameter', message: 'Diameter <6 inches may clog easily', severity: 'warning' });
    }
    
    if (swmmParams.junctionDepth <= 0) {
      warnings.push({ param: 'junctionDepth', message: 'Junction depth must be positive', severity: 'error' });
    } else if (swmmParams.junctionDepth > 30) {
      warnings.push({ param: 'junctionDepth', message: 'Junction depth >30 ft is very deep', severity: 'warning' });
    }
    
    return warnings;
  }, [swmmParams]);

  const hasValidationErrors = parameterValidation.some(w => w.severity === 'error');
  const hasValidationWarnings = parameterValidation.length > 0;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.inp')) {
      toast({
        title: "Invalid file",
        description: "Please select a SWMM5 .inp file",
        variant: "destructive"
      });
      return;
    }

    setInpFile(file);
    const content = await file.text();
    setInpContent(content);
    
    // Generate default time series name from pattern
    const defaultName = `TS_${patternName.replace(/\s+/g, '_')}`;
    setTimeSeriesName(defaultName);
    
    toast({
      title: "File loaded",
      description: `Loaded ${file.name}`
    });
    
    // Parse existing timeseries from the file
    parseTimeSeriesFromInp(content);
  };

  // Parse existing SWMM5 timeseries from .inp content
  const parseTimeSeriesFromInp = (content: string) => {
    const lines = content.split('\n');
    const timeSeriesMap: Record<string, ImportedTimeSeries> = {};
    let inTimeSeriesSection = false;
    let parseErrors: string[] = [];
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();
      
      // Check for section headers
      if (trimmed.startsWith('[')) {
        inTimeSeriesSection = trimmed.toUpperCase() === '[TIMESERIES]';
        continue;
      }
      
      // Skip comments and empty lines
      if (!inTimeSeriesSection || trimmed.startsWith(';') || trimmed === '') {
        continue;
      }
      
      // Parse timeseries line: Name Date Time Value
      const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
      if (parts.length >= 4) {
        const [name, date, time, value] = parts;
        const numValue = parseFloat(value);
        
        // Validate date format (MM/DD/YYYY or similar)
        const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        if (!dateRegex.test(date)) {
          parseErrors.push(`Line ${lineNumber}: Invalid date format "${date}" for series "${name}"`);
        }
        
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;
        if (!timeRegex.test(time)) {
          parseErrors.push(`Line ${lineNumber}: Invalid time format "${time}" for series "${name}"`);
        }
        
        if (!isNaN(numValue)) {
          if (!timeSeriesMap[name]) {
            timeSeriesMap[name] = { name, data: [] };
          }
          timeSeriesMap[name].data.push({ date, time, value: numValue });
        } else {
          parseErrors.push(`Line ${lineNumber}: Invalid numeric value "${value}" for series "${name}"`);
        }
      } else if (parts.length > 0 && parts.length < 4) {
        parseErrors.push(`Line ${lineNumber}: Incomplete data (expected: Name Date Time Value)`);
      }
    }
    
    // Validate each timeseries
    const parsed = Object.values(timeSeriesMap).map(ts => ({
      ...ts,
      validation: validateTimeSeries(ts)
    }));
    
    setImportedTimeSeries(parsed);
    
    if (parseErrors.length > 0) {
      toast({
        title: "Parse warnings",
        description: `${parseErrors.length} issue(s) found while parsing. Some data may be incomplete.`,
        variant: "destructive"
      });
      console.warn("SWMM5 Parse Errors:", parseErrors);
    }
    
    if (parsed.length > 0) {
      const validCount = parsed.filter(ts => ts.validation?.isValid).length;
      toast({
        title: "Timeseries found",
        description: `Found ${parsed.length} timeseries (${validCount} valid)`
      });
    }
  };

  // Validate a timeseries
  const validateTimeSeries = (ts: ImportedTimeSeries): TimeSeriesValidation => {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    const values = ts.data.map(d => d.value);
    const totalPoints = values.length;
    const totalDepth = values.reduce((sum, v) => sum + v, 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = totalDepth / totalPoints;
    const hasNegatives = values.some(v => v < 0);
    const hasZeros = values.some(v => v === 0);
    
    // Calculate duration from time values
    let durationMinutes = 0;
    if (ts.data.length >= 2) {
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
      };
      const startMinutes = parseTime(ts.data[0].time);
      const endMinutes = parseTime(ts.data[ts.data.length - 1].time);
      durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle day wrap
    }
    
    // Validation checks
    if (totalPoints === 0) {
      errors.push("No data points found");
    }
    
    if (totalPoints < 3) {
      warnings.push(`Only ${totalPoints} data points - may be too sparse`);
    }
    
    if (hasNegatives) {
      errors.push("Contains negative values - rainfall cannot be negative");
    }
    
    if (maxValue > 50) {
      warnings.push(`Max value (${maxValue.toFixed(2)}) seems unusually high - verify units`);
    }
    
    if (totalDepth > 100) {
      warnings.push(`Total depth (${totalDepth.toFixed(2)}) seems very high - verify data`);
    }
    
    if (durationMinutes > 0 && durationMinutes < 5) {
      warnings.push("Duration less than 5 minutes - may be incomplete");
    }
    
    // Check for monotonic time progression
    let timeIssues = 0;
    for (let i = 1; i < ts.data.length; i++) {
      const prev = ts.data[i - 1].time;
      const curr = ts.data[i].time;
      if (curr <= prev) {
        timeIssues++;
      }
    }
    if (timeIssues > 0) {
      warnings.push(`${timeIssues} non-monotonic time step(s) detected`);
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      warnings,
      errors,
      stats: {
        totalPoints,
        totalDepth,
        maxValue,
        minValue,
        avgValue,
        hasNegatives,
        hasZeros,
        durationMinutes
      }
    };
  };

  // Repair functions for common issues
  const repairTimeSeries = (seriesName: string, repairType: 'negatives' | 'sort' | 'normalize' | 'all') => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      let repairedData = [...ts.data];
      let repairsApplied: string[] = [];
      
      // Fix negative values
      if (repairType === 'negatives' || repairType === 'all') {
        const negCount = repairedData.filter(d => d.value < 0).length;
        if (negCount > 0) {
          repairedData = repairedData.map(d => ({
            ...d,
            value: Math.max(0, d.value)
          }));
          repairsApplied.push(`Fixed ${negCount} negative value(s)`);
        }
      }
      
      // Sort by time (fix non-monotonic)
      if (repairType === 'sort' || repairType === 'all') {
        const parseTime = (timeStr: string): number => {
          const parts = timeStr.split(':').map(Number);
          return parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0);
        };
        
        const originalOrder = repairedData.map(d => d.time).join(',');
        repairedData.sort((a, b) => parseTime(a.time) - parseTime(b.time));
        const newOrder = repairedData.map(d => d.time).join(',');
        
        if (originalOrder !== newOrder) {
          repairsApplied.push('Sorted data by time');
        }
      }
      
      // Normalize high values (assume mm->inches or vice versa)
      if (repairType === 'normalize' || repairType === 'all') {
        const maxVal = Math.max(...repairedData.map(d => d.value));
        if (maxVal > 50) {
          // Likely mm, convert to inches
          repairedData = repairedData.map(d => ({
            ...d,
            value: d.value / 25.4
          }));
          repairsApplied.push('Normalized values (mm → inches)');
        }
      }
      
      if (repairsApplied.length === 0) {
        toast({ title: "No repairs needed", description: "Data appears to be correct" });
        return ts;
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: repairedData
      };
      
      // Re-validate
      const newValidation = validateTimeSeries(repairedTs);
      
      toast({
        title: "Repairs applied",
        description: repairsApplied.join(', ')
      });
      
      return {
        ...repairedTs,
        validation: newValidation
      };
    }));
  };

  // Remove zero values
  const removeZeroValues = (seriesName: string) => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      const originalCount = ts.data.length;
      const filteredData = ts.data.filter(d => d.value > 0);
      const removedCount = originalCount - filteredData.length;
      
      if (removedCount === 0) {
        toast({ title: "No zeros found", description: "Data has no zero values to remove" });
        return ts;
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: filteredData
      };
      
      toast({
        title: "Zeros removed",
        description: `Removed ${removedCount} zero-value data point(s)`
      });
      
      return {
        ...repairedTs,
        validation: validateTimeSeries(repairedTs)
      };
    }));
  };

  // Interpolate missing timesteps
  const interpolateMissingSteps = (seriesName: string, targetStepMinutes: number = 5) => {
    setImportedTimeSeries(prev => prev.map(ts => {
      if (ts.name !== seriesName) return ts;
      
      if (ts.data.length < 2) {
        toast({ title: "Cannot interpolate", description: "Need at least 2 data points", variant: "destructive" });
        return ts;
      }
      
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':').map(Number);
        return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
      };
      
      const formatTime = (minutes: number): string => {
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      
      const startMinutes = parseTime(ts.data[0].time);
      const endMinutes = parseTime(ts.data[ts.data.length - 1].time);
      const baseDate = ts.data[0].date;
      
      const interpolatedData: typeof ts.data = [];
      
      for (let t = startMinutes; t <= endMinutes; t += targetStepMinutes) {
        // Find surrounding data points
        let before = ts.data[0];
        let after = ts.data[ts.data.length - 1];
        
        for (let i = 0; i < ts.data.length - 1; i++) {
          const t1 = parseTime(ts.data[i].time);
          const t2 = parseTime(ts.data[i + 1].time);
          if (t1 <= t && t2 >= t) {
            before = ts.data[i];
            after = ts.data[i + 1];
            break;
          }
        }
        
        const t1 = parseTime(before.time);
        const t2 = parseTime(after.time);
        const ratio = t2 === t1 ? 0 : (t - t1) / (t2 - t1);
        const interpolatedValue = before.value + ratio * (after.value - before.value);
        
        interpolatedData.push({
          date: baseDate,
          time: formatTime(t),
          value: Math.max(0, interpolatedValue)
        });
      }
      
      const repairedTs: ImportedTimeSeries = {
        name: ts.name,
        data: interpolatedData
      };
      
      toast({
        title: "Interpolation complete",
        description: `Created ${interpolatedData.length} points at ${targetStepMinutes}-min intervals`
      });
      
      return {
        ...repairedTs,
        validation: validateTimeSeries(repairedTs)
      };
    }));
  };

  // Import a timeseries for editing
  const importTimeSeriesForEditing = () => {
    const series = importedTimeSeries.find(ts => ts.name === selectedImportSeries);
    if (!series) return;
    
    // Convert to editable format
    const lines: string[] = [];
    lines.push(`; Imported time series: ${series.name}`);
    lines.push(`${series.name}`);
    
    for (const point of series.data) {
      lines.push(`${series.name}  ${point.date}  ${point.time}  ${point.value.toFixed(6)}`);
    }
    
    setEditedData(lines.join('\n'));
    setPreviewData(lines.join('\n'));
    setTimeSeriesName(series.name);
    setIsImportDialogOpen(false);
    setIsPreviewOpen(true);
    
    toast({
      title: "Timeseries imported",
      description: `Loaded "${series.name}" for editing`
    });
  };

  // Generate ICM rainfall event format (SWMM5 compatible)
  const generateIcmRainfallEvent = (pattern: PatternType, patternDisplayName: string, eventName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const lines: string[] = [];
    
    // Use SWMM5 timeseries format for ICM compatibility
    lines.push(`; InfoWorks ICM Rainfall Timeseries (SWMM5 Format)`);
    lines.push(`; Generated by Pattern Painter`);
    lines.push(`; Pattern: ${patternDisplayName}`);
    lines.push(`; Total depth: ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)}, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    lines.push(`; Units: ${getDepthUnit(unitSystem)} (incremental depth per time step)`);
    lines.push(`;`);
    lines.push(`[TIMESERIES]`);
    lines.push(`;;Name           Date       Time       Value`);
    lines.push(`;;-------------- ---------- ---------- ----------`);
    
    const startDate = "01/01/2024";
    const tsName = eventName || `ICM_${patternDisplayName.replace(/\s+/g, '_')}`;
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      lines.push(`${tsName}  ${startDate}  ${timeStr}  ${depthIncrement.toFixed(6)}`);
    }
    
    return lines.join('\n');
  };

  // Generate batch ICM data
  const generateBatchIcmData = (): string => {
    const allEvents: string[] = [];
    
    selectedBatchPatterns.forEach((pattern) => {
      const patternInfo = allPatterns.find(p => p.id === pattern);
      if (!patternInfo) return;
      
      const eventName = `RF_${patternInfo.name.replace(/\s+/g, '_')}`;
      const eventData = generateIcmRainfallEvent(pattern, patternInfo.name, eventName);
      allEvents.push(eventData);
    });
    
    return allEvents.join('\n\n');
  };

  // Export as ICM file
  const exportAsIcm = () => {
    const eventName = icmEventName || `RF_${patternName.replace(/\s+/g, '_')}`;
    const icmData = batchMode ? generateBatchIcmData() : generateIcmRainfallEvent(selectedPattern, patternName, eventName);
    
    const blob = new Blob([icmData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode 
      ? 'batch_rainfall_events.icm'
      : `${eventName}.icm`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "ICM file generated",
      description: batchMode
        ? `Created ${selectedBatchPatterns.length} rainfall events for ICM`
        : `Created rainfall event "${eventName}" for ICM`
    });
  };

  // Generate HEC-HMS precipitation gage format
  const generateHecHmsData = (pattern: PatternType, patternDisplayName: string, gageName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const lines: string[] = [];
    
    // HEC-HMS DSS-style precipitation gage format
    const gName = gageName || `GAGE_${patternDisplayName.replace(/\s+/g, '_')}`;
    
    lines.push(`# HEC-HMS Precipitation Gage Data`);
    lines.push(`# Generated by Pattern Painter`);
    lines.push(`# Pattern: ${patternDisplayName}`);
    lines.push(`# Total Depth: ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)}`);
    lines.push(`# Duration: ${duration} hours`);
    lines.push(`# Time Step: ${timeStep} minutes`);
    lines.push(`#`);
    lines.push(`Gage: ${gName}`);
    lines.push(`Units: ${unitSystem === 'USA' ? 'IN' : 'MM'}`);
    lines.push(`Type: INCREMENTAL`);
    lines.push(`Time Interval: ${timeStep} MIN`);
    lines.push(`#`);
    lines.push(`# Date        Time      Precip`);
    lines.push(`# ----------  --------  ------`);
    
    const startDate = "01Jan2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      lines.push(`${startDate}  ${timeStr}     ${depthIncrement.toFixed(4)}`);
    }
    
    lines.push(`# End of Data`);
    
    return lines.join('\n');
  };

  // Generate batch HEC-HMS data
  const generateBatchHecHmsData = (): string => {
    const allGages: string[] = [];
    
    selectedBatchPatterns.forEach((pattern) => {
      const patternInfo = allPatterns.find(p => p.id === pattern);
      if (!patternInfo) return;
      
      const gageName = `GAGE_${patternInfo.name.replace(/\s+/g, '_')}`;
      const gageData = generateHecHmsData(pattern, patternInfo.name, gageName);
      allGages.push(gageData);
    });
    
    return allGages.join('\n\n');
  };

  // Export as HEC-HMS file
  const exportAsHecHms = () => {
    const gageName = icmEventName || `GAGE_${patternName.replace(/\s+/g, '_')}`;
    const hmsData = batchMode ? generateBatchHecHmsData() : generateHecHmsData(selectedPattern, patternName, gageName);
    
    const blob = new Blob([hmsData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode 
      ? 'batch_precipitation_gages.gage'
      : `${gageName}.gage`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "HEC-HMS file generated",
      description: batchMode
        ? `Created ${selectedBatchPatterns.length} precipitation gages`
        : `Created precipitation gage "${gageName}"`
    });
  };

  // Generate XP-SWMM/PCSWMM format (extended SWMM5 format with metadata)
  const generateXpSwmmData = (pattern: PatternType, patternDisplayName: string, tsName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const lines: string[] = [];
    
    // XP-SWMM/PCSWMM enhanced format with additional metadata
    lines.push(`;;; XP-SWMM / PCSWMM Compatible Rainfall Data`);
    lines.push(`;;; Generated by Pattern Painter`);
    lines.push(`;;; Pattern: ${patternDisplayName}`);
    lines.push(`;;; Total Depth: ${exportDepth.toFixed(2)} ${getDepthUnit(unitSystem)}`);
    lines.push(`;;; Duration: ${duration} hours`);
    lines.push(`;;; Time Step: ${timeStep} minutes`);
    lines.push(`;;; Data Type: Incremental Depth`);
    lines.push(``);
    lines.push(`[TIMESERIES]`);
    lines.push(`;;Name           Date       Time       Value`);
    lines.push(`;;-------------- ---------- ---------- ----------`);
    
    const startDate = "01/01/2024";
    const name = tsName || `TS_${patternDisplayName.replace(/\s+/g, '_')}`;
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      lines.push(`${name.padEnd(16)} ${startDate}  ${timeStr}      ${depthIncrement.toFixed(6)}`);
    }
    
    // Add RAINGAGES section for XP-SWMM compatibility
    lines.push(``);
    lines.push(`[RAINGAGES]`);
    lines.push(`;;Name           Format    Interval SCF      Source`);
    lines.push(`;;-------------- --------- -------- -------- ----------`);
    lines.push(`RG_${name.substring(0, 12).padEnd(12)} INTENSITY ${timeStep.toString().padStart(2, '0')}:00    1.0      TIMESERIES ${name}`);
    
    return lines.join('\n');
  };

  // Export as XP-SWMM/PCSWMM file
  const exportAsXpSwmm = () => {
    const tsName = timeSeriesName || `TS_${patternName.replace(/\s+/g, '_')}`;
    let xpData: string;
    
    if (batchMode && selectedBatchPatterns.length > 0) {
      const allData: string[] = [];
      selectedBatchPatterns.forEach((pattern) => {
        const patternInfo = allPatterns.find(p => p.id === pattern);
        if (!patternInfo) return;
        const name = `TS_${patternInfo.name.replace(/\s+/g, '_')}`;
        allData.push(generateXpSwmmData(pattern, patternInfo.name, name));
      });
      xpData = allData.join('\n\n');
    } else {
      xpData = generateXpSwmmData(selectedPattern, patternName, tsName);
    }
    
    const blob = new Blob([xpData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode ? 'batch_xpswmm.inp' : `${tsName}_xpswmm.inp`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "XP-SWMM file generated",
      description: batchMode
        ? `Created ${selectedBatchPatterns.length} timeseries for XP-SWMM/PCSWMM`
        : `Created timeseries "${tsName}" for XP-SWMM/PCSWMM`
    });
  };

  // Generate complete EPA SWMM model template
  const generateEpaSwmmTemplate = (): string => {
    const intensities = generateRainfallData(selectedPattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const tsName = timeSeriesName || `TS_${patternName.replace(/\s+/g, '_')}`;
    const endHours = Math.floor(duration);
    const endMinutes = Math.floor((duration % 1) * 60);
    
    // Build timeseries data
    const tsLines: string[] = [];
    const startDate = "01/01/2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      tsLines.push(`${tsName.padEnd(16)} ${startDate}  ${timeStr}      ${depthIncrement.toFixed(6)}`);
    }

    return `[TITLE]
;;Project Title/Notes
EPA SWMM Model Template
Generated by Pattern Painter
Pattern: ${patternName}
Total Depth: ${exportDepth.toFixed(2)} ${getDepthUnit(unitSystem)}
Duration: ${duration} hours

[OPTIONS]
;;Option             Value
FLOW_UNITS           ${unitSystem === 'USA' ? 'CFS' : 'CMS'}
INFILTRATION         HORTON
FLOW_ROUTING         DYNWAVE
LINK_OFFSETS         DEPTH
MIN_SLOPE            0.001
ALLOW_PONDING        NO
SKIP_STEADY_STATE    NO
START_DATE           01/01/2024
START_TIME           00:00:00
REPORT_START_DATE    01/01/2024
REPORT_START_TIME    00:00:00
END_DATE             01/01/2024
END_TIME             ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00
SWEEP_START          01/01
SWEEP_END            12/31
DRY_DAYS             0
REPORT_STEP          00:${timeStep.toString().padStart(2, '0')}:00
WET_STEP             00:${Math.min(timeStep, 5).toString().padStart(2, '0')}:00
DRY_STEP             01:00:00
ROUTING_STEP         0:00:30
INERTIAL_DAMPING     PARTIAL
NORMAL_FLOW_LIMITED  BOTH
FORCE_MAIN_EQUATION  H-W
VARIABLE_STEP        0.75
LENGTHENING_STEP     0
MIN_SURFAREA         12.566
MAX_TRIALS           8
HEAD_TOLERANCE       0.005
SYS_FLOW_TOL         5
LAT_FLOW_TOL         5
MINIMUM_STEP         0.5
THREADS              1

[EVAPORATION]
;;Data Source    Parameters
;;-------------- ----------------
CONSTANT         0.0
DRY_ONLY         NO

[RAINGAGES]
;;Name           Format    Interval SCF      Source
;;-------------- --------- -------- -------- ----------
RG1              INTENSITY ${timeStep.toString().padStart(2, '0')}:00    1.0      TIMESERIES ${tsName}

[SUBCATCHMENTS]
;;Name           Rain Gage        Outlet           Area     %Imperv  Width    %Slope   CurbLen  SnowPack
;;-------------- ---------------- ---------------- -------- -------- -------- -------- -------- ----------------
S1               RG1              J1               ${swmmParams.subcatchArea}       ${swmmParams.imperviousness}       ${swmmParams.width}      ${swmmParams.slope}      0

[SUBAREAS]
;;Subcatchment   N-Imperv   N-Perv     S-Imperv   S-Perv     PctZero    RouteTo    PctRouted
;;-------------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
S1               ${swmmParams.nImperv}       ${swmmParams.nPerv}        ${swmmParams.sImperv}       ${swmmParams.sPerv}       ${swmmParams.pctZero}         OUTLET

[INFILTRATION]
;;Subcatchment   MaxRate    MinRate    Decay      DryTime    MaxInfil
;;-------------- ---------- ---------- ---------- ---------- ----------
S1               ${swmmParams.maxInfil}        ${swmmParams.minInfil}        ${swmmParams.decay}          ${swmmParams.dryTime}          0

[JUNCTIONS]
;;Name           Elevation  MaxDepth   InitDepth  SurDepth   Aponded
;;-------------- ---------- ---------- ---------- ---------- ----------
J1               100        ${swmmParams.junctionDepth}          0          0          0
J2               98         ${swmmParams.junctionDepth}          0          0          0

[OUTFALLS]
;;Name           Elevation  Type       Stage Data       Gated    Route To
;;-------------- ---------- ---------- ---------------- -------- ----------------
OUT1             96         FREE                        NO

[CONDUITS]
;;Name           From Node        To Node          Length     Roughness  InOffset   OutOffset  InitFlow   MaxFlow
;;-------------- ---------------- ---------------- ---------- ---------- ---------- ---------- ---------- ----------
C1               J1               J2               ${swmmParams.conduitLength}        ${swmmParams.conduitRoughness}       0          0          0          0
C2               J2               OUT1             ${swmmParams.conduitLength}        ${swmmParams.conduitRoughness}       0          0          0          0

[XSECTIONS]
;;Link           Shape        Geom1            Geom2      Geom3      Geom4      Barrels    Culvert
;;-------------- ------------ ---------------- ---------- ---------- ---------- ---------- ----------
C1               CIRCULAR     ${swmmParams.conduitDiameter}                0          0          0          1
C2               CIRCULAR     ${swmmParams.conduitDiameter}                0          0          0          1

[TIMESERIES]
;;Name           Date       Time       Value
;;-------------- ---------- ---------- ----------
; ${patternName} rainfall timeseries
; Total depth: ${exportDepth.toFixed(2)} ${getDepthUnit(unitSystem)}, Duration: ${duration} hrs
${tsLines.join('\n')}

[REPORT]
;;Reporting Options
SUBCATCHMENTS ALL
NODES ALL
LINKS ALL

[TAGS]

[MAP]
DIMENSIONS       0.000            0.000            10000.000        10000.000
Units            None

[COORDINATES]
;;Node           X-Coord            Y-Coord
;;-------------- ------------------ ------------------
J1               2000.000           5000.000
J2               5000.000           5000.000
OUT1             8000.000           5000.000

[VERTICES]

[Polygons]
;;Subcatchment   X-Coord            Y-Coord
;;-------------- ------------------ ------------------
S1               1000.000           6000.000
S1               3000.000           6000.000
S1               3000.000           4000.000
S1               1000.000           4000.000

[SYMBOLS]
;;Gage           X-Coord            Y-Coord
;;-------------- ------------------ ------------------
RG1              2000.000           7000.000

[BACKDROP]

[END]
`;
  };

  // Export complete EPA SWMM template
  const exportEpaSwmmTemplate = () => {
    const template = generateEpaSwmmTemplate();
    const tsName = timeSeriesName || `TS_${patternName.replace(/\s+/g, '_')}`;
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tsName}_complete_model.inp`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "EPA SWMM template generated",
      description: "Complete model template with subcatchment, junctions, and conduits"
    });
  };

  const generateTimeSeriesData = (pattern: PatternType, patternDisplayName: string, tsName: string): string => {
    const intensities = generateRainfallData(pattern, totalDepth, duration, timeStep);
    const exportDepth = convertDepth(totalDepth, 'USA', unitSystem);
    const timeSeriesLines: string[] = [];
    
    timeSeriesLines.push(`; Generated time series for ${patternDisplayName}`);
    timeSeriesLines.push(`; Total depth: ${exportDepth.toFixed(unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(unitSystem)}, Duration: ${duration} hrs, Time step: ${timeStep} min`);
    timeSeriesLines.push(`${tsName}`);
    
    const startDate = "01/01/2024";
    
    for (let i = 0; i < intensities.length; i++) {
      const timeMinutes = i * timeStep;
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const intensity = convertIntensity(intensities[i], 'USA', unitSystem);
      const depthIncrement = intensity * (timeStep / 60);
      timeSeriesLines.push(`${tsName}  ${startDate}  ${timeStr}  ${depthIncrement.toFixed(6)}`);
    }
    
    return timeSeriesLines.join('\n');
  };

  const generateBatchTimeSeriesData = (): string => {
    const allTimeSeries: string[] = [];
    
    selectedBatchPatterns.forEach((pattern) => {
      const patternInfo = allPatterns.find(p => p.id === pattern);
      if (!patternInfo) return;
      
      const tsName = `TS_${patternInfo.name.replace(/\s+/g, '_')}`;
      const tsData = generateTimeSeriesData(pattern, patternInfo.name, tsName);
      allTimeSeries.push(tsData);
    });
    
    return allTimeSeries.join('\n\n');
  };

  const toggleBatchPattern = (pattern: PatternType) => {
    setSelectedBatchPatterns(prev => 
      prev.includes(pattern) 
        ? prev.filter(p => p !== pattern)
        : [...prev, pattern]
    );
  };

  const previewTimeSeriesData = () => {
    let data: string;
    if (batchMode && selectedBatchPatterns.length > 0) {
      data = generateBatchTimeSeriesData();
    } else {
      data = generateTimeSeriesData(selectedPattern, patternName, timeSeriesName || `TS_${patternName.replace(/\s+/g, '_')}`);
    }
    setPreviewData(data);
    setEditedData(data);
    setIsPreviewOpen(true);
  };

  const appendToInpFile = (useEditedData = false) => {
    if (!inpContent) {
      toast({
        title: "No file loaded",
        description: "Please load a SWMM5 .inp file first",
        variant: "destructive"
      });
      return;
    }

    if (!batchMode && !timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    if (batchMode && selectedBatchPatterns.length === 0) {
      toast({
        title: "No patterns selected",
        description: "Please select at least one pattern for batch processing",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = useEditedData ? editedData : (batchMode ? generateBatchTimeSeriesData() : generateTimeSeriesData(selectedPattern, patternName, timeSeriesName));
    let modifiedContent = inpContent;

    // Find the [TIMESERIES] section
    const timeseriesRegex = /\[TIMESERIES\]/i;
    const match = timeseriesRegex.exec(modifiedContent);

    if (match) {
      // Find the end of the TIMESERIES section (next section or end of file)
      const nextSectionRegex = /\n\[/;
      const startPos = match.index + match[0].length;
      const remainingContent = modifiedContent.substring(startPos);
      const nextSectionMatch = nextSectionRegex.exec(remainingContent);
      
      let insertPos: number;
      if (nextSectionMatch) {
        insertPos = startPos + nextSectionMatch.index;
      } else {
        insertPos = modifiedContent.length;
      }

      // Insert the new time series
      modifiedContent = 
        modifiedContent.substring(0, insertPos) +
        '\n' + timeSeriesData + '\n' +
        modifiedContent.substring(insertPos);
    } else {
      // No [TIMESERIES] section exists, create one
      // Try to insert before [PATTERNS] or at the end
      const patternsRegex = /\[PATTERNS\]/i;
      const patternsMatch = patternsRegex.exec(modifiedContent);
      
      const timeseriesSection = '\n[TIMESERIES]\n' +
        ';;Name           Date       Time       Value     \n' +
        ';;-------------- ---------- ---------- ----------\n' +
        timeSeriesData + '\n';
      
      if (patternsMatch) {
        modifiedContent = 
          modifiedContent.substring(0, patternsMatch.index) +
          timeseriesSection +
          modifiedContent.substring(patternsMatch.index);
      } else {
        modifiedContent += '\n' + timeseriesSection;
      }
    }

    // Download the modified file
    const blob = new Blob([modifiedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = inpFile ? inpFile.name.replace('.inp', '_modified.inp') : 'swmm_modified.inp';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "File generated",
      description: batchMode 
        ? `${selectedBatchPatterns.length} time series appended to SWMM5 file`
        : `Time series "${timeSeriesName}" appended to SWMM5 file`
    });
    
    setIsPreviewOpen(false);
  };

  const generateNewInpFile = (useEditedData = false) => {
    if (!batchMode && !timeSeriesName.trim()) {
      toast({
        title: "Missing time series name",
        description: "Please enter a name for the time series",
        variant: "destructive"
      });
      return;
    }

    if (batchMode && selectedBatchPatterns.length === 0) {
      toast({
        title: "No patterns selected",
        description: "Please select at least one pattern for batch processing",
        variant: "destructive"
      });
      return;
    }

    const timeSeriesData = useEditedData ? editedData : (batchMode ? generateBatchTimeSeriesData() : generateTimeSeriesData(selectedPattern, patternName, timeSeriesName));
    
    // Create a minimal SWMM5 file with just the time series
    const minimalInp = `[TITLE]
;;Project Title/Notes
Rainfall Time Series - ${patternName}

[OPTIONS]
;;Option             Value
FLOW_UNITS           CFS
INFILTRATION         HORTON
FLOW_ROUTING         KINWAVE
START_DATE           01/01/2024
START_TIME           00:00:00
REPORT_START_DATE    01/01/2024
REPORT_START_TIME    00:00:00
END_DATE             01/01/2024
END_TIME             ${Math.floor(duration).toString().padStart(2, '0')}:${Math.floor((duration % 1) * 60).toString().padStart(2, '0')}:00
SWEEP_START          01/01
SWEEP_END            12/31
DRY_DAYS             0
REPORT_STEP          00:01:00
WET_STEP             00:01:00
DRY_STEP             01:00:00
ROUTING_STEP         0:00:30

[TIMESERIES]
;;Name           Date       Time       Value     
;;-------------- ---------- ---------- ----------
${timeSeriesData}

[REPORT]
;;Reporting Options
INPUT      YES
CONTROLS   YES
SUBCATCHMENTS ALL
NODES ALL
LINKS ALL

[END]
`;

    const blob = new Blob([minimalInp], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = batchMode 
      ? 'batch_timeseries.inp'
      : `${timeSeriesName}_timeseries.inp`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "File generated",
      description: batchMode
        ? `New SWMM5 file created with ${selectedBatchPatterns.length} time series`
        : `New SWMM5 file created with time series "${timeSeriesName}"`
    });
    
    setIsPreviewOpen(false);
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          SWMM5 & ICM Integration
        </CardTitle>
        <CardDescription>
          Import, edit, and export rainfall time series for SWMM5 and InfoWorks ICM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <Tabs value={batchMode ? "batch" : "single"} onValueChange={(v) => setBatchMode(v === "batch")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Pattern</TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Batch Mode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            {/* Time Series Name */}
            <div className="space-y-2">
              <Label htmlFor="ts-name">Time Series Name (SWMM5)</Label>
              <Input
                id="ts-name"
                placeholder="e.g., TS_SCS_Type_II"
                value={timeSeriesName}
                onChange={(e) => setTimeSeriesName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icm-name">Event Name (ICM)</Label>
              <Input
                id="icm-name"
                placeholder="e.g., RF_Design_Storm"
                value={icmEventName}
                onChange={(e) => setIcmEventName(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-4 mt-4">
            {/* Batch Pattern Selection */}
            <div className="space-y-3">
              <Label>Select Patterns for Batch Processing</Label>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border border-border rounded-lg">
                {allPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`batch-${pattern.id}`}
                      checked={selectedBatchPatterns.includes(pattern.id)}
                      onCheckedChange={() => toggleBatchPattern(pattern.id)}
                    />
                    <Label
                      htmlFor={`batch-${pattern.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {pattern.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedBatchPatterns.length} pattern(s) selected. Each will generate a separate time series.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload Existing SWMM5 File (Optional)</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".inp"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {inpFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInpFile(null);
                  setInpContent("");
                  setImportedTimeSeries([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {inpFile && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Loaded: {inpFile.name}
            </p>
          )}
        </div>

        {/* Import Existing Timeseries */}
        {importedTimeSeries.length > 0 && (
          <div className="space-y-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2">
              <FileInput className="w-4 h-4 text-primary" />
              <Label className="text-sm font-semibold">Import Existing Timeseries</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Found {importedTimeSeries.length} timeseries. Select one to import and edit.
            </p>
            <div className="flex gap-2">
              <Select value={selectedImportSeries} onValueChange={setSelectedImportSeries}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select timeseries to import" />
                </SelectTrigger>
                <SelectContent>
                  {importedTimeSeries.map((ts) => (
                    <SelectItem key={ts.name} value={ts.name}>
                      <span className="flex items-center gap-2">
                        {ts.validation?.isValid ? (
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                        {ts.name} ({ts.data.length} pts)
                        {ts.validation?.warnings.length ? (
                          <span className="text-amber-500 text-xs">⚠</span>
                        ) : null}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!selectedImportSeries}
                onClick={importTimeSeriesForEditing}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            
            {/* Validation Results */}
            {selectedImportSeries && (() => {
              const selected = importedTimeSeries.find(ts => ts.name === selectedImportSeries);
              if (!selected?.validation) return null;
              const { validation } = selected;
              
              return (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.isValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Points</p>
                      <p className="font-mono font-semibold">{validation.stats.totalPoints}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Total Depth</p>
                      <p className="font-mono font-semibold">{validation.stats.totalDepth.toFixed(3)}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Max Value</p>
                      <p className="font-mono font-semibold">{validation.stats.maxValue.toFixed(4)}</p>
                    </div>
                    <div className="p-2 rounded bg-background/50">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-mono font-semibold">{validation.stats.durationMinutes.toFixed(0)} min</p>
                    </div>
                  </div>
                  
                  {/* Errors */}
                  {validation.errors.length > 0 && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-xs font-semibold text-red-600 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-0.5">
                        {validation.errors.map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs font-semibold text-amber-600 mb-1">Warnings:</p>
                      <ul className="text-xs text-amber-600 space-y-0.5">
                        {validation.warnings.map((warn, i) => (
                          <li key={i}>• {warn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Repair Tools */}
                  {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                    <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-600">Auto-Repair Tools</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {validation.stats.hasNegatives && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'negatives')}
                          >
                            Fix Negatives
                          </Button>
                        )}
                        {validation.warnings.some(w => w.includes('non-monotonic')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'sort')}
                          >
                            Sort by Time
                          </Button>
                        )}
                        {validation.warnings.some(w => w.includes('high')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => repairTimeSeries(selectedImportSeries, 'normalize')}
                          >
                            Normalize (mm→in)
                          </Button>
                        )}
                        {validation.stats.hasZeros && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => removeZeroValues(selectedImportSeries)}
                          >
                            Remove Zeros
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => interpolateMissingSteps(selectedImportSeries, 5)}
                        >
                          Interpolate (5-min)
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => repairTimeSeries(selectedImportSeries, 'all')}
                        >
                          Fix All Issues
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">SWMM5 Export</p>
          <Button
            onClick={previewTimeSeriesData}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview & Edit Time Series
          </Button>
          
          <Button
            onClick={() => appendToInpFile(false)}
            disabled={!inpFile || (!batchMode && !timeSeriesName.trim()) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {batchMode ? `Append ${selectedBatchPatterns.length} Series to File` : 'Append to Existing File'}
          </Button>
          
          <Button
            onClick={() => generateNewInpFile(false)}
            variant="outline"
            disabled={(!batchMode && !timeSeriesName.trim()) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? 'Generate Batch SWMM5 File' : 'Generate New SWMM5 File'}
          </Button>
        </div>

        {/* ICM Export */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            InfoWorks ICM Export
          </p>
          <Button
            onClick={exportAsIcm}
            variant="outline"
            disabled={(!batchMode && !icmEventName.trim() && !patternName) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? `Export ${selectedBatchPatterns.length} ICM Events` : 'Export ICM Rainfall Event'}
          </Button>
          <p className="text-xs text-muted-foreground">
            SWMM5-compatible timeseries format for ICM import
          </p>
        </div>

        {/* HEC-HMS Export */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <CloudRain className="w-3 h-3" />
            HEC-HMS Export
          </p>
          <Button
            onClick={exportAsHecHms}
            variant="outline"
            disabled={(!batchMode && !icmEventName.trim() && !patternName) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? `Export ${selectedBatchPatterns.length} Gages` : 'Export Precipitation Gage'}
          </Button>
          <p className="text-xs text-muted-foreground">
            HEC-HMS precipitation gage format (.gage)
          </p>
        </div>

        {/* XP-SWMM / PCSWMM Export */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            XP-SWMM / PCSWMM Export
          </p>
          <Button
            onClick={exportAsXpSwmm}
            variant="outline"
            disabled={(!batchMode && !timeSeriesName.trim() && !patternName) || (batchMode && selectedBatchPatterns.length === 0)}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {batchMode ? `Export ${selectedBatchPatterns.length} XP-SWMM Series` : 'Export XP-SWMM File'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Extended format with RAINGAGES section
          </p>
        </div>

        {/* EPA SWMM Complete Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3" />
              EPA SWMM Complete Template
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setShowSwmmParams(!showSwmmParams)}
            >
              {hasValidationWarnings && !showSwmmParams && (
                <AlertTriangle className={`w-3 h-3 mr-1 ${hasValidationErrors ? 'text-destructive' : 'text-yellow-500'}`} />
              )}
              {showSwmmParams ? 'Hide' : 'Customize'} Parameters
            </Button>
          </div>
          
          {/* Customizable Parameters */}
          {showSwmmParams && (
            <div className="p-3 rounded-lg border border-border bg-accent/10 space-y-3">
              {/* Land Use Presets */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Land Use Presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(landUsePresets).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => applyLandUsePreset(key as keyof typeof landUsePresets)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Validation Warnings */}
              {parameterValidation.length > 0 && (
                <Alert variant={hasValidationErrors ? "destructive" : "default"} className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <span className="font-semibold block mb-1">
                      {hasValidationErrors ? 'Parameter Errors' : 'Parameter Warnings'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {parameterValidation.slice(0, 5).map((w, i) => (
                        <li key={i} className={w.severity === 'error' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'}>
                          {w.message}
                        </li>
                      ))}
                      {parameterValidation.length > 5 && (
                        <li className="text-muted-foreground">...and {parameterValidation.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-foreground">Subcatchment Parameters</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Area ({unitSystem === 'USA' ? 'acres' : 'ha'})</Label>
                  <Input
                    type="number"
                    value={swmmParams.subcatchArea}
                    onChange={(e) => setSwmmParams(p => ({ ...p, subcatchArea: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Imperviousness (%)</Label>
                  <Input
                    type="number"
                    value={swmmParams.imperviousness}
                    onChange={(e) => setSwmmParams(p => ({ ...p, imperviousness: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Width ({unitSystem === 'USA' ? 'ft' : 'm'})</Label>
                  <Input
                    type="number"
                    value={swmmParams.width}
                    onChange={(e) => setSwmmParams(p => ({ ...p, width: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Slope (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={swmmParams.slope}
                    onChange={(e) => setSwmmParams(p => ({ ...p, slope: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <p className="text-xs font-semibold text-foreground pt-2">Surface Properties</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">N-Imperv</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={swmmParams.nImperv}
                    onChange={(e) => setSwmmParams(p => ({ ...p, nImperv: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">N-Perv</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={swmmParams.nPerv}
                    onChange={(e) => setSwmmParams(p => ({ ...p, nPerv: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dstore-Imperv ({unitSystem === 'USA' ? 'in' : 'mm'})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={swmmParams.sImperv}
                    onChange={(e) => setSwmmParams(p => ({ ...p, sImperv: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dstore-Perv ({unitSystem === 'USA' ? 'in' : 'mm'})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={swmmParams.sPerv}
                    onChange={(e) => setSwmmParams(p => ({ ...p, sPerv: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-foreground">Infiltration (Horton)</p>
                  <div className="flex gap-1">
                    {Object.entries(soilTypePresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => applySoilTypePreset(key as keyof typeof soilTypePresets)}
                        title={preset.description}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Soil Type: A (Sand) → D (Clay) | Click to apply NRCS hydrologic soil group
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Max Rate ({unitSystem === 'USA' ? 'in/hr' : 'mm/hr'})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={swmmParams.maxInfil}
                    onChange={(e) => setSwmmParams(p => ({ ...p, maxInfil: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Rate ({unitSystem === 'USA' ? 'in/hr' : 'mm/hr'})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={swmmParams.minInfil}
                    onChange={(e) => setSwmmParams(p => ({ ...p, minInfil: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Decay (1/hr)</Label>
                  <Input
                    type="number"
                    value={swmmParams.decay}
                    onChange={(e) => setSwmmParams(p => ({ ...p, decay: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dry Time (days)</Label>
                  <Input
                    type="number"
                    value={swmmParams.dryTime}
                    onChange={(e) => setSwmmParams(p => ({ ...p, dryTime: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <p className="text-xs font-semibold text-foreground pt-2">Conduit Properties</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Length ({unitSystem === 'USA' ? 'ft' : 'm'})</Label>
                  <Input
                    type="number"
                    value={swmmParams.conduitLength}
                    onChange={(e) => setSwmmParams(p => ({ ...p, conduitLength: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Roughness (n)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={swmmParams.conduitRoughness}
                    onChange={(e) => setSwmmParams(p => ({ ...p, conduitRoughness: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Diameter ({unitSystem === 'USA' ? 'ft' : 'm'})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={swmmParams.conduitDiameter}
                    onChange={(e) => setSwmmParams(p => ({ ...p, conduitDiameter: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Junction Depth ({unitSystem === 'USA' ? 'ft' : 'm'})</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={swmmParams.junctionDepth}
                    onChange={(e) => setSwmmParams(p => ({ ...p, junctionDepth: parseFloat(e.target.value) || 0 }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={exportEpaSwmmTemplate}
            variant="outline"
            disabled={!batchMode && !timeSeriesName.trim() && !patternName}
            className="w-full flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Complete Model Template
          </Button>
          <p className="text-xs text-muted-foreground">
            Full .inp file with subcatchment, junctions, conduits, and rainfall
          </p>
        </div>

        {/* Preview/Edit Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Preview & Edit SWMM5 Time Series
              </DialogTitle>
              <DialogDescription>
                Review and edit the time series data before exporting. Changes will be used for the next export.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                value={editedData}
                onChange={(e) => setEditedData(e.target.value)}
                className="font-mono text-xs h-96 resize-none"
                placeholder="Time series data will appear here..."
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Lines: {editedData.split('\n').length}</span>
                <span>Characters: {editedData.length}</span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditedData(previewData)}>
                Reset Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(editedData);
                  toast({ title: "Copied to clipboard" });
                }}
              >
                Copy to Clipboard
              </Button>
              <Button onClick={() => appendToInpFile(true)} disabled={!inpFile}>
                <Plus className="w-4 h-4 mr-2" />
                Append to File
              </Button>
              <Button onClick={() => generateNewInpFile(true)}>
                <Download className="w-4 h-4 mr-2" />
                Generate New File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info */}
        <div className="p-3 rounded-lg border border-border bg-accent/20 space-y-1">
          <p className="text-xs font-semibold text-foreground">Current Settings</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Pattern: {patternName}</p>
            <p>Total Depth: {totalDepth} inches</p>
            <p>Duration: {duration} hours</p>
            <p>Time Step: {timeStep} minutes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
