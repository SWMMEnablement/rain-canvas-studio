import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowDown, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface BMPType {
  id: string;
  name: string;
  tss: number;
  tn: number;
  tp: number;
  metals: number;
  bacteria: number;
  oil: number;
}

interface TrainBMP {
  id: string;
  bmpType: string;
  customName: string;
}

const BMP_TYPES: BMPType[] = [
  { id: 'bioretention', name: 'Bioretention', tss: 85, tn: 45, tp: 60, metals: 80, bacteria: 70, oil: 85 },
  { id: 'permeable_pavement', name: 'Permeable Pavement', tss: 80, tn: 30, tp: 40, metals: 70, bacteria: 60, oil: 90 },
  { id: 'green_roof', name: 'Green Roof', tss: 70, tn: 35, tp: 45, metals: 60, bacteria: 50, oil: 60 },
  { id: 'infiltration_trench', name: 'Infiltration Trench', tss: 90, tn: 50, tp: 55, metals: 85, bacteria: 75, oil: 80 },
  { id: 'bioswale', name: 'Vegetated Bioswale', tss: 75, tn: 40, tp: 50, metals: 65, bacteria: 60, oil: 75 },
  { id: 'sand_filter', name: 'Sand Filter', tss: 85, tn: 35, tp: 50, metals: 75, bacteria: 65, oil: 85 },
  { id: 'wet_pond', name: 'Wet Detention Pond', tss: 80, tn: 35, tp: 55, metals: 70, bacteria: 70, oil: 70 },
  { id: 'dry_pond', name: 'Dry Detention Basin', tss: 60, tn: 20, tp: 30, metals: 50, bacteria: 50, oil: 50 },
  { id: 'constructed_wetland', name: 'Constructed Wetland', tss: 85, tn: 55, tp: 65, metals: 75, bacteria: 80, oil: 75 },
  { id: 'grass_channel', name: 'Grass Channel', tss: 50, tn: 25, tp: 30, metals: 40, bacteria: 40, oil: 60 },
  { id: 'hydrodynamic_separator', name: 'Hydrodynamic Separator', tss: 50, tn: 5, tp: 10, metals: 40, bacteria: 20, oil: 85 },
  { id: 'media_filter', name: 'Media Filter', tss: 90, tn: 40, tp: 55, metals: 85, bacteria: 70, oil: 90 },
];

const POLLUTANT_LABELS: Record<string, string> = {
  tss: 'TSS (Sediment)',
  tn: 'Total Nitrogen',
  tp: 'Total Phosphorus',
  metals: 'Heavy Metals',
  bacteria: 'Bacteria',
  oil: 'Oil & Grease',
};

export interface ImportedBMP {
  id: string;
  bmpType: string;
  customName: string;
}

interface TreatmentTrainCalculatorProps {
  importedBMPs?: ImportedBMP[];
}

const TreatmentTrainCalculator: React.FC<TreatmentTrainCalculatorProps> = ({ importedBMPs }) => {
  const [trainBMPs, setTrainBMPs] = useState<TrainBMP[]>([
    { id: '1', bmpType: 'grass_channel', customName: 'Pre-treatment Swale' },
    { id: '2', bmpType: 'bioretention', customName: 'Main Bioretention' },
  ]);
  
  // Import BMPs from LID Calculator
  React.useEffect(() => {
    if (importedBMPs && importedBMPs.length > 0) {
      const validBmps = importedBMPs.filter(bmp => 
        BMP_TYPES.some(type => type.id === bmp.bmpType)
      );
      if (validBmps.length > 0) {
        setTrainBMPs(validBmps.map((bmp, index) => ({
          id: String(index + 1),
          bmpType: bmp.bmpType,
          customName: bmp.customName,
        })));
      }
    }
  }, [importedBMPs]);
  const [influentConcentrations, setInfluentConcentrations] = useState({
    tss: 150,
    tn: 3.5,
    tp: 0.4,
    metals: 0.15,
    bacteria: 50000,
    oil: 15,
  });
  const [flowRate, setFlowRate] = useState(100); // L/s

  const addBMP = () => {
    const newId = (Math.max(...trainBMPs.map(b => parseInt(b.id)), 0) + 1).toString();
    setTrainBMPs([...trainBMPs, { id: newId, bmpType: 'bioretention', customName: `BMP ${newId}` }]);
  };

  const removeBMP = (id: string) => {
    if (trainBMPs.length > 1) {
      setTrainBMPs(trainBMPs.filter(b => b.id !== id));
    }
  };

  const updateBMP = (id: string, field: keyof TrainBMP, value: string) => {
    setTrainBMPs(trainBMPs.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const calculateCumulativeRemoval = useMemo(() => {
    const pollutants = ['tss', 'tn', 'tp', 'metals', 'bacteria', 'oil'] as const;
    const results: Array<{
      bmpName: string;
      bmpType: string;
      concentrations: Record<string, number>;
      individualRemoval: Record<string, number>;
      cumulativeRemoval: Record<string, number>;
    }> = [];

    let currentConcentrations = { ...influentConcentrations };
    
    // Add influent as first entry
    results.push({
      bmpName: 'Influent',
      bmpType: 'influent',
      concentrations: { ...currentConcentrations },
      individualRemoval: { tss: 0, tn: 0, tp: 0, metals: 0, bacteria: 0, oil: 0 },
      cumulativeRemoval: { tss: 0, tn: 0, tp: 0, metals: 0, bacteria: 0, oil: 0 },
    });

    trainBMPs.forEach((trainBMP) => {
      const bmpData = BMP_TYPES.find(b => b.id === trainBMP.bmpType);
      if (!bmpData) return;

      const newConcentrations: Record<string, number> = {};
      const individualRemoval: Record<string, number> = {};
      const cumulativeRemoval: Record<string, number> = {};

      pollutants.forEach(pollutant => {
        const removalRate = bmpData[pollutant] / 100;
        const previousConc = currentConcentrations[pollutant];
        const newConc = previousConc * (1 - removalRate);
        
        newConcentrations[pollutant] = newConc;
        individualRemoval[pollutant] = bmpData[pollutant];
        cumulativeRemoval[pollutant] = ((influentConcentrations[pollutant] - newConc) / influentConcentrations[pollutant]) * 100;
      });

      results.push({
        bmpName: trainBMP.customName,
        bmpType: trainBMP.bmpType,
        concentrations: newConcentrations,
        individualRemoval,
        cumulativeRemoval,
      });

      currentConcentrations = newConcentrations as typeof influentConcentrations;
    });

    return results;
  }, [trainBMPs, influentConcentrations]);

  const chartData = calculateCumulativeRemoval.map((result, index) => ({
    name: result.bmpName,
    tss: result.cumulativeRemoval.tss,
    tn: result.cumulativeRemoval.tn,
    tp: result.cumulativeRemoval.tp,
    metals: result.cumulativeRemoval.metals,
    bacteria: result.cumulativeRemoval.bacteria,
    oil: result.cumulativeRemoval.oil,
  }));

  const concentrationChartData = calculateCumulativeRemoval.map((result) => ({
    name: result.bmpName,
    tss: result.concentrations.tss,
    tn: result.concentrations.tn * 100,
    tp: result.concentrations.tp * 1000,
  }));

  const finalResults = calculateCumulativeRemoval[calculateCumulativeRemoval.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Treatment Train Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Influent Concentrations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Influent Concentrations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label>TSS (mg/L)</Label>
                <Input
                  type="number"
                  value={influentConcentrations.tss}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, tss: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>TN (mg/L)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={influentConcentrations.tn}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, tn: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>TP (mg/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={influentConcentrations.tp}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, tp: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Metals (mg/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={influentConcentrations.metals}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, metals: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Bacteria (CFU/100mL)</Label>
                <Input
                  type="number"
                  value={influentConcentrations.bacteria}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, bacteria: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Oil (mg/L)</Label>
                <Input
                  type="number"
                  value={influentConcentrations.oil}
                  onChange={(e) => setInfluentConcentrations({...influentConcentrations, oil: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Treatment Train Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Treatment Train Configuration</h3>
              <Button onClick={addBMP} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add BMP
              </Button>
            </div>
            
            <div className="space-y-2">
              {trainBMPs.map((bmp, index) => (
                <div key={bmp.id} className="flex items-center gap-3">
                  {index > 0 && (
                    <div className="flex justify-center w-8">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  {index === 0 && <div className="w-8" />}
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-muted/30">
                    <div>
                      <Label className="text-xs">Step {index + 1}</Label>
                      <Input
                        value={bmp.customName}
                        onChange={(e) => updateBMP(bmp.id, 'customName', e.target.value)}
                        placeholder="BMP Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">BMP Type</Label>
                      <Select value={bmp.bmpType} onValueChange={(v) => updateBMP(bmp.id, 'bmpType', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BMP_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBMP(bmp.id)}
                        disabled={trainBMPs.length <= 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Final Effluent Quality Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(POLLUTANT_LABELS).map(([key, label]) => {
              const removal = finalResults?.cumulativeRemoval[key] || 0;
              return (
                <div key={key} className="p-3 border rounded-lg text-center bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className={`text-2xl font-bold ${
                    removal >= 80 ? 'text-green-600' : 
                    removal >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {removal.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Total Removal</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Pollutant Removal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treatment Step</TableHead>
                  <TableHead className="text-right">TSS (mg/L)</TableHead>
                  <TableHead className="text-right">TN (mg/L)</TableHead>
                  <TableHead className="text-right">TP (mg/L)</TableHead>
                  <TableHead className="text-right">Metals (mg/L)</TableHead>
                  <TableHead className="text-right">Bacteria (CFU)</TableHead>
                  <TableHead className="text-right">Oil (mg/L)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculateCumulativeRemoval.map((result, index) => (
                  <TableRow key={index} className={index === 0 ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium">
                      {result.bmpName}
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({BMP_TYPES.find(b => b.id === result.bmpType)?.name})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{result.concentrations.tss.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{result.concentrations.tn.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{result.concentrations.tp.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{result.concentrations.metals.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{Math.round(result.concentrations.bacteria).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{result.concentrations.oil.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Removal Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis domain={[0, 100]} label={{ value: 'Removal (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="tss" stroke="#2563eb" strokeWidth={2} name="TSS" />
                <Line type="monotone" dataKey="tn" stroke="#16a34a" strokeWidth={2} name="TN" />
                <Line type="monotone" dataKey="tp" stroke="#dc2626" strokeWidth={2} name="TP" />
                <Line type="monotone" dataKey="metals" stroke="#9333ea" strokeWidth={2} name="Metals" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Individual BMP Removal Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(1)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis domain={[0, 100]} label={{ value: 'Removal (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="tss" fill="#2563eb" name="TSS" />
                <Bar dataKey="tn" fill="#16a34a" name="TN" />
                <Bar dataKey="tp" fill="#dc2626" name="TP" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Design Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Train Design Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Series Treatment Principle:</strong> Cumulative removal is calculated as sequential reduction through each BMP. 
            If BMP 1 removes 60% and BMP 2 removes 80%, the total removal is: 1 - (1-0.60) × (1-0.80) = 92%</p>
          <p><strong>Pre-treatment Importance:</strong> Placing coarse treatment (grass channels, hydrodynamic separators) first 
            protects downstream BMPs from clogging and extends maintenance intervals.</p>
          <p><strong>Pollutant-Specific Design:</strong> Select BMPs based on target pollutants. Bioretention excels at nutrient removal, 
            while sand filters are optimal for sediment and oil/grease.</p>
          <p><strong>Typical Treatment Trains:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Parking lots: Hydrodynamic separator → Sand filter → Bioretention</li>
            <li>Residential: Grass channel → Bioswale → Wet pond</li>
            <li>Industrial: Oil/grit separator → Media filter → Constructed wetland</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreatmentTrainCalculator;
