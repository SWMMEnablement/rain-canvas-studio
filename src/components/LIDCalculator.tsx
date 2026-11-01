import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Plus, Trash2, Download, Calculator, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { accountLid } from '@/lib/hydrologyCalcs';

interface BMPType {
  id: string;
  name: string;
  description: string;
  defaultPorosity: number;
  defaultInfiltration: number; // in/hr
  captureDepth: number; // typical capture depth in inches
  pollutantRemoval: {
    tss: number;
    tn: number;
    tp: number;
  };
}

const BMP_TYPES: BMPType[] = [
  {
    id: 'bioretention',
    name: 'Bioretention / Rain Garden',
    description: 'Vegetated depression with engineered soil media',
    defaultPorosity: 0.40,
    defaultInfiltration: 1.0,
    captureDepth: 6,
    pollutantRemoval: { tss: 85, tn: 50, tp: 60 }
  },
  {
    id: 'permeable_pavement',
    name: 'Permeable Pavement',
    description: 'Porous asphalt, concrete, or pavers with storage layer',
    defaultPorosity: 0.35,
    defaultInfiltration: 5.0,
    captureDepth: 3,
    pollutantRemoval: { tss: 80, tn: 30, tp: 40 }
  },
  {
    id: 'green_roof',
    name: 'Green Roof',
    description: 'Vegetated rooftop with growing media',
    defaultPorosity: 0.50,
    defaultInfiltration: 0.5,
    captureDepth: 1.5,
    pollutantRemoval: { tss: 70, tn: 40, tp: 50 }
  },
  {
    id: 'infiltration_trench',
    name: 'Infiltration Trench',
    description: 'Stone-filled trench for infiltration',
    defaultPorosity: 0.40,
    defaultInfiltration: 2.0,
    captureDepth: 12,
    pollutantRemoval: { tss: 80, tn: 40, tp: 50 }
  },
  {
    id: 'dry_swale',
    name: 'Dry Swale / Bioswale',
    description: 'Vegetated channel with check dams',
    defaultPorosity: 0.30,
    defaultInfiltration: 1.0,
    captureDepth: 6,
    pollutantRemoval: { tss: 75, tn: 35, tp: 45 }
  },
  {
    id: 'rain_barrel',
    name: 'Rain Barrel / Cistern',
    description: 'Storage container for roof runoff',
    defaultPorosity: 1.0,
    defaultInfiltration: 0,
    captureDepth: 0,
    pollutantRemoval: { tss: 0, tn: 0, tp: 0 }
  },
  {
    id: 'sand_filter',
    name: 'Sand Filter',
    description: 'Filtration through sand media',
    defaultPorosity: 0.35,
    defaultInfiltration: 3.5,
    captureDepth: 4,
    pollutantRemoval: { tss: 85, tn: 35, tp: 55 }
  },
  {
    id: 'tree_box',
    name: 'Tree Box Filter',
    description: 'Street tree with engineered soil media',
    defaultPorosity: 0.40,
    defaultInfiltration: 1.5,
    captureDepth: 4,
    pollutantRemoval: { tss: 80, tn: 45, tp: 55 }
  }
];

interface BMPInstance {
  id: string;
  type: string;
  name: string;
  contributingArea: number; // sq-ft
  bmpArea: number; // sq-ft (or gallons for rain barrels)
  mediaDepth: number; // inches
  porosity: number;
  ponding: number; // inches
  drainTime: number; // hours
  /** id of a BMP further down the list that receives this BMP's overflow; null = leaves the site. */
  overflowTo?: string | null;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

// Map LID BMP types to Treatment Train BMP types
const LID_TO_TRAIN_MAP: Record<string, string> = {
  'bioretention': 'bioretention',
  'permeable_pavement': 'permeable_pavement',
  'green_roof': 'green_roof',
  'infiltration_trench': 'infiltration_trench',
  'dry_swale': 'bioswale',
  'sand_filter': 'sand_filter',
  'tree_box': 'bioretention',
  'rain_barrel': '', // Not applicable for treatment train
};

export interface LIDBMPExport {
  id: string;
  bmpType: string;
  customName: string;
}

interface LIDCalculatorProps {
  onExportToTreatmentTrain?: (bmps: LIDBMPExport[]) => void;
}

const LIDCalculator: React.FC<LIDCalculatorProps> = ({ onExportToTreatmentTrain }) => {
  const [bmps, setBmps] = useState<BMPInstance[]>([
    {
      id: '1',
      type: 'bioretention',
      name: 'Bioretention Area 1',
      contributingArea: 5000,
      bmpArea: 250,
      mediaDepth: 18,
      porosity: 0.40,
      ponding: 6,
      drainTime: 24
    }
  ]);

  // Site parameters
  const [designRainfall, setDesignRainfall] = useState<number>(1.0); // inches
  const [totalSiteArea, setTotalSiteArea] = useState<number>(43560); // sq-ft (1 acre)
  const [imperviousPercent, setImperviousPercent] = useState<number>(60);
  const [preCN, setPreCN] = useState<number>(65);
  const [postCN, setPostCN] = useState<number>(85);

  const addBMP = () => {
    const newId = String(Date.now());
    setBmps([...bmps, {
      id: newId,
      type: 'bioretention',
      name: `BMP ${bmps.length + 1}`,
      contributingArea: 5000,
      bmpArea: 250,
      mediaDepth: 18,
      porosity: 0.40,
      ponding: 6,
      drainTime: 24
    }]);
  };

  const removeBMP = (id: string) => {
    if (bmps.length > 1) {
      setBmps(bmps.filter(b => b.id !== id));
    }
  };

  const updateBMP = (id: string, field: keyof BMPInstance, value: string | number) => {
    setBmps(bmps.map(b => {
      if (b.id === id) {
        const updated = { ...b, [field]: value };
        // Auto-update defaults when type changes
        if (field === 'type') {
          const bmpType = BMP_TYPES.find(t => t.id === value);
          if (bmpType) {
            updated.porosity = bmpType.defaultPorosity;
            updated.ponding = bmpType.captureDepth;
          }
        }
        return updated;
      }
      return b;
    }));
  };

  // Calculate runoff volumes and BMP performance
  const calculations = useMemo(() => {
    // Site runoff calculations (SCS method simplified)
    const imperviousArea = totalSiteArea * (imperviousPercent / 100);
    const perviousArea = totalSiteArea - imperviousArea;
    
    // Pre-development runoff
    const preSPre = (1000 / preCN) - 10;
    const preIa = 0.2 * preSPre;
    const preQ = designRainfall > preIa 
      ? Math.pow(designRainfall - preIa, 2) / (designRainfall - preIa + preSPre)
      : 0;
    const preRunoffVolume = (preQ * totalSiteArea) / 12; // cu-ft

    // Post-development runoff (without BMPs)
    const postS = (1000 / postCN) - 10;
    const postIa = 0.2 * postS;
    const postQ = designRainfall > postIa 
      ? Math.pow(designRainfall - postIa, 2) / (designRainfall - postIa + postS)
      : 0;
    const postRunoffVolume = (postQ * totalSiteArea) / 12; // cu-ft

    // Storage capacity of each BMP (ft³)
    const capacityOf = (bmp: BMPInstance) => bmp.type === 'rain_barrel'
      ? bmp.bmpArea / 7.48 // gallons → ft³
      : bmp.bmpArea * (bmp.mediaDepth / 12) * bmp.porosity + bmp.bmpArea * (bmp.ponding / 12);

    // Route site runoff through the BMPs: tributary areas are capped at the site area, each BMP
    // captures at most its inflow, and overflow can be passed to a downstream BMP.
    const accounting = accountLid(
      bmps.map(b => ({ id: b.id, tributaryArea: b.contributingArea, capacity: capacityOf(b), overflowTo: b.overflowTo ?? null })),
      totalSiteArea,
      postQ,
    );

    const bmpResults = bmps.map((bmp, i) => {
      const bmpType = BMP_TYPES.find(t => t.id === bmp.type)!;
      const acc = accounting.units[i];
      const storageCapacity = capacityOf(bmp);
      const contributingRunoff = acc.inflow;
      const volumeCaptured = acc.captured;
      const captureEfficiency = contributingRunoff > 0 ? (volumeCaptured / contributingRunoff) * 100 : 0;
      const sizingRatio = bmp.contributingArea > 0 ? (bmp.bmpArea / bmp.contributingArea) * 100 : 0;
      // Drawdown: storage depth ÷ the BMP type's typical infiltration rate, checked against drain time.
      const storageDepthIn = bmp.mediaDepth * bmp.porosity + bmp.ponding;
      const drawdownHours = bmp.type !== 'rain_barrel' && bmpType.defaultInfiltration > 0
        ? storageDepthIn / bmpType.defaultInfiltration
        : null;
      return {
        ...bmp,
        bmpType,
        contributingRunoff,
        storageCapacity,
        volumeCaptured,
        captureEfficiency,
        overflow: acc.overflow,
        sizingRatio,
        drawdownHours,
        meetsDrainTime: drawdownHours === null || drawdownHours <= bmp.drainTime,
        tssRemoval: bmpType.pollutantRemoval.tss,
        tnRemoval: bmpType.pollutantRemoval.tn,
        tpRemoval: bmpType.pollutantRemoval.tp
      };
    });

    // Total BMP performance (capture can never exceed site runoff)
    const totalVolumeCaptured = accounting.totalCaptured;
    const totalContributingArea = Math.min(totalSiteArea, bmpResults.reduce((sum, b) => sum + b.contributingArea, 0));
    const treatedAreaPercent = totalSiteArea > 0 ? (totalContributingArea / totalSiteArea) * 100 : 0;
    const netRunoffVolume = accounting.netRunoff;
    const runoffReduction = postRunoffVolume > 0 ? (totalVolumeCaptured / postRunoffVolume) * 100 : 0;
    const areasOverlap = accounting.overAllocated;
    const areaScale = accounting.areaScale;

    // Check if pre-development conditions are matched
    const matchesPreDev = netRunoffVolume <= preRunoffVolume;
    const additionalStorageNeeded = matchesPreDev ? 0 : netRunoffVolume - preRunoffVolume;

    return {
      preRunoffVolume,
      postRunoffVolume,
      preQ,
      postQ,
      bmpResults,
      totalVolumeCaptured,
      totalContributingArea,
      treatedAreaPercent,
      netRunoffVolume,
      runoffReduction,
      matchesPreDev,
      additionalStorageNeeded,
      areasOverlap,
      areaScale
    };
  }, [bmps, designRainfall, totalSiteArea, imperviousPercent, preCN, postCN]);

  // Chart data
  const volumeComparisonData = [
    { name: 'Pre-Dev', volume: Number(calculations.preRunoffVolume.toFixed(0)), fill: '#22c55e' },
    { name: 'Post-Dev (No BMP)', volume: Number(calculations.postRunoffVolume.toFixed(0)), fill: '#ef4444' },
    { name: 'Post-Dev (With BMP)', volume: Number(calculations.netRunoffVolume.toFixed(0)), fill: '#3b82f6' }
  ];

  const bmpPerformanceData = calculations.bmpResults.map((b, i) => ({
    name: b.name,
    captured: Number(b.volumeCaptured.toFixed(1)),
    overflow: Number(b.overflow.toFixed(1)),
    fill: COLORS[i % COLORS.length]
  }));

  const pieData = calculations.bmpResults.map((b, i) => ({
    name: b.name,
    value: Number(b.volumeCaptured.toFixed(1)),
    fill: COLORS[i % COLORS.length]
  }));

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'BMP Name', 'Type', 'Contributing Area (sf)', 'BMP Area (sf)',
      'Media Depth (in)', 'Ponding (in)', 'Storage (cf)', 'Volume Captured (cf)',
      'Capture Efficiency (%)', 'Sizing Ratio (%)', 'TSS Removal (%)', 'TN Removal (%)', 'TP Removal (%)'
    ];
    
    const rows = calculations.bmpResults.map(b => [
      b.name, b.bmpType.name, b.contributingArea, b.bmpArea,
      b.mediaDepth, b.ponding, b.storageCapacity.toFixed(1), b.volumeCaptured.toFixed(1),
      b.captureEfficiency.toFixed(1), b.sizingRatio.toFixed(2), b.tssRemoval, b.tnRemoval, b.tpRemoval
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lid_bmp_calculations.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToTreatmentTrain = () => {
    if (!onExportToTreatmentTrain) return;
    
    const exportBmps: LIDBMPExport[] = bmps
      .filter(bmp => LID_TO_TRAIN_MAP[bmp.type]) // Filter out non-mappable BMPs
      .map(bmp => ({
        id: bmp.id,
        bmpType: LID_TO_TRAIN_MAP[bmp.type],
        customName: bmp.name,
      }));
    
    onExportToTreatmentTrain(exportBmps);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Green Infrastructure / LID Calculator
            <Badge variant="secondary" className="ml-2">BMP Sizing</Badge>
          </CardTitle>
          {onExportToTreatmentTrain && (
            <Button onClick={exportToTreatmentTrain} size="sm" variant="outline">
              <Droplets className="w-4 h-4 mr-2" />
              Send to Treatment Train
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="site" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="bmps">BMPs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="wq">Water Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="site" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Design Rainfall (in)</Label>
                <Input
                  type="number"
                  value={designRainfall}
                  onChange={(e) => setDesignRainfall(Number(e.target.value))}
                  min={0.1}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground mt-1">Water quality event (typically 1" - 1.5")</p>
              </div>
              <div>
                <Label>Total Site Area (sq-ft)</Label>
                <Input
                  type="number"
                  value={totalSiteArea}
                  onChange={(e) => setTotalSiteArea(Number(e.target.value))}
                  min={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{(totalSiteArea / 43560).toFixed(2)} acres</p>
              </div>
              <div>
                <Label htmlFor="lid-impervious">Post-Dev Impervious (%)</Label>
                <Input
                  id="lid-impervious"
                  type="number"
                  value={imperviousPercent}
                  onChange={(e) => setImperviousPercent(Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Reference only — runoff uses the post-development CN. Composite CN for this cover
                  (CN 98 impervious, pre-dev CN pervious): {((Math.min(100, Math.max(0, imperviousPercent)) * 98 + (100 - Math.min(100, Math.max(0, imperviousPercent))) * preCN) / 100).toFixed(1)}
                </p>
              </div>
              <div>
                <Label>Pre-Development CN</Label>
                <Input
                  type="number"
                  value={preCN}
                  onChange={(e) => setPreCN(Number(e.target.value))}
                  min={30}
                  max={98}
                />
              </div>
              <div>
                <Label>Post-Development CN</Label>
                <Input
                  type="number"
                  value={postCN}
                  onChange={(e) => setPostCN(Number(e.target.value))}
                  min={30}
                  max={98}
                />
              </div>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">Pre-Dev Runoff</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {calculations.preRunoffVolume.toFixed(0)} cu-ft
                </p>
                <p className="text-xs text-muted-foreground">{calculations.preQ.toFixed(2)}" depth</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">Post-Dev Runoff (No BMP)</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {calculations.postRunoffVolume.toFixed(0)} cu-ft
                </p>
                <p className="text-xs text-muted-foreground">{calculations.postQ.toFixed(2)}" depth</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">Volume to Manage</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {(calculations.postRunoffVolume - calculations.preRunoffVolume).toFixed(0)} cu-ft
                </p>
                <p className="text-xs text-muted-foreground">Post - Pre difference</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bmps" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">BMP Facilities</h4>
              <Button onClick={addBMP} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add BMP
              </Button>
            </div>

            {bmps.map((bmp, idx) => {
              const bmpType = BMP_TYPES.find(t => t.id === bmp.type);
              return (
                <Card key={bmp.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 mr-4">
                        <Label>BMP Name</Label>
                        <Input
                          value={bmp.name}
                          onChange={(e) => updateBMP(bmp.id, 'name', e.target.value)}
                          className="max-w-xs"
                        />
                      </div>
                      {bmps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBMP(bmp.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label>BMP Type</Label>
                        <Select
                          value={bmp.type}
                          onValueChange={(v) => updateBMP(bmp.id, 'type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BMP_TYPES.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{bmpType?.description}</p>
                      </div>
                      <div>
                        <Label>Contributing Area (sq-ft)</Label>
                        <Input
                          type="number"
                          value={bmp.contributingArea}
                          onChange={(e) => updateBMP(bmp.id, 'contributingArea', Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div>
                        <Label>{bmp.type === 'rain_barrel' ? 'Storage Volume (gal)' : 'BMP Surface Area (sq-ft)'}</Label>
                        <Input
                          type="number"
                          value={bmp.bmpArea}
                          onChange={(e) => updateBMP(bmp.id, 'bmpArea', Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      {bmp.type !== 'rain_barrel' && (
                        <>
                          <div>
                            <Label>Media Depth (in)</Label>
                            <Input
                              type="number"
                              value={bmp.mediaDepth}
                              onChange={(e) => updateBMP(bmp.id, 'mediaDepth', Number(e.target.value))}
                              min={0}
                            />
                          </div>
                          <div>
                            <Label>Porosity</Label>
                            <Input
                              type="number"
                              value={bmp.porosity}
                              onChange={(e) => updateBMP(bmp.id, 'porosity', Number(e.target.value))}
                              min={0.1}
                              max={1.0}
                              step={0.05}
                            />
                          </div>
                          <div>
                            <Label>Surface Ponding (in)</Label>
                            <Input
                              type="number"
                              value={bmp.ponding}
                              onChange={(e) => updateBMP(bmp.id, 'ponding', Number(e.target.value))}
                              min={0}
                            />
                          </div>
                          <div>
                            <Label>Drain Time (hrs)</Label>
                            <Input
                              type="number"
                              value={bmp.drainTime}
                              onChange={(e) => updateBMP(bmp.id, 'drainTime', Number(e.target.value))}
                              min={1}
                              max={72}
                            />
                            {(() => {
                              const r = calculations.bmpResults.find(x => x.id === bmp.id);
                              if (!r || r.drawdownHours === null) return null;
                              return (
                                <p className={`text-xs mt-1 ${r.meetsDrainTime ? 'text-muted-foreground' : 'text-destructive'}`}>
                                  Drawdown ≈ {r.drawdownHours.toFixed(1)} h at {r.bmpType.defaultInfiltration} in/hr
                                  {r.meetsDrainTime ? ' — within drain time' : ' — exceeds drain time'}
                                </p>
                              );
                            })()}
                          </div>
                        </>
                      )}
                      <div>
                        <Label htmlFor={`lid-overflow-${bmp.id}`}>Overflow Goes To</Label>
                        <Select
                          value={bmp.overflowTo || 'none'}
                          onValueChange={(v) => updateBMP(bmp.id, 'overflowTo', v === 'none' ? '' : v)}
                        >
                          <SelectTrigger id={`lid-overflow-${bmp.id}`} aria-label={`Where overflow from ${bmp.name} goes`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Leaves the site</SelectItem>
                            {bmps.slice(idx + 1).map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Only BMPs further down the list can receive overflow.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Overall Performance Summary */}
            <div className={`p-4 rounded-lg border ${calculations.matchesPreDev 
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
              : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                {calculations.matchesPreDev ? (
                  <Badge variant="default" className="bg-green-600">Meets Pre-Dev Conditions</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-600 text-white">Additional Storage Needed</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Volume Captured</p>
                  <p className="text-lg font-semibold">{calculations.totalVolumeCaptured.toFixed(0)} cu-ft</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Runoff Reduction</p>
                  <p className="text-lg font-semibold">{calculations.runoffReduction.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Site Area Treated</p>
                  <p className="text-lg font-semibold">{calculations.treatedAreaPercent.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Net Runoff</p>
                  <p className="text-lg font-semibold">{calculations.netRunoffVolume.toFixed(0)} cu-ft</p>
                </div>
              </div>
              {calculations.areasOverlap && (
                <p role="alert" className="text-sm mt-2 text-destructive">
                  BMP contributing areas add up to more than the site area, so some area is counted twice.
                  Each area has been scaled by {(calculations.areaScale * 100).toFixed(1)}% so capture cannot exceed site runoff —
                  reduce the contributing areas or route overflow from one BMP to another instead.
                </p>
              )}
              {!calculations.matchesPreDev && (
                <p className="text-sm mt-2 text-yellow-700 dark:text-yellow-300">
                  Additional storage of {calculations.additionalStorageNeeded.toFixed(0)} cu-ft needed to match pre-development runoff
                </p>
              )}
            </div>

            {/* BMP Detail Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BMP</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Contributing (sf)</TableHead>
                    <TableHead className="text-right">Storage (cf)</TableHead>
                    <TableHead className="text-right">Captured (cf)</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                    <TableHead className="text-right">Sizing Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.bmpResults.map((bmp) => (
                    <TableRow key={bmp.id}>
                      <TableCell className="font-medium">{bmp.name}</TableCell>
                      <TableCell>{bmp.bmpType.name}</TableCell>
                      <TableCell className="text-right">{bmp.contributingArea.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{bmp.storageCapacity.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{bmp.volumeCaptured.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={bmp.captureEfficiency >= 90 ? "default" : "secondary"}>
                          {bmp.captureEfficiency.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{bmp.sizingRatio.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-4">
            {/* Volume Comparison */}
            <div>
              <h4 className="font-semibold mb-4">Runoff Volume Comparison</h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Volume (cu-ft)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#3b82f6">
                      {volumeComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BMP Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">BMP Capture Performance</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bmpPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Volume (cu-ft)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="captured" stackId="a" fill="#22c55e" name="Captured" />
                      <Bar dataKey="overflow" stackId="a" fill="#ef4444" name="Overflow" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Volume Distribution by BMP</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wq" className="space-y-4 mt-4">
            <h4 className="font-semibold">Pollutant Removal Estimates</h4>
            <p className="text-sm text-muted-foreground">
              Based on typical BMP pollutant removal efficiencies from research literature
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BMP</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">TSS Removal</TableHead>
                    <TableHead className="text-right">Total Nitrogen</TableHead>
                    <TableHead className="text-right">Total Phosphorus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.bmpResults.map((bmp) => (
                    <TableRow key={bmp.id}>
                      <TableCell className="font-medium">{bmp.name}</TableCell>
                      <TableCell>{bmp.bmpType.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{bmp.tssRemoval}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{bmp.tnRemoval}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{bmp.tpRemoval}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* BMP Type Reference */}
            <div className="mt-6">
              <h4 className="font-semibold mb-4">BMP Reference Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BMP_TYPES.map(type => (
                  <div key={type.id} className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium text-sm">{type.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Infiltration: {type.defaultInfiltration} in/hr</span>
                      <span>Porosity: {(type.defaultPorosity * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LIDCalculator;
