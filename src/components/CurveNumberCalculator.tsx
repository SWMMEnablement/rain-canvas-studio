import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface LandUseCategory {
  category: string;
  description: string;
  cnValues: { A: number; B: number; C: number; D: number };
}

const landUseData: LandUseCategory[] = [
  { category: 'residential_1_8', description: 'Residential - 1/8 acre lots (65% impervious)', cnValues: { A: 77, B: 85, C: 90, D: 92 } },
  { category: 'residential_1_4', description: 'Residential - 1/4 acre lots (38% impervious)', cnValues: { A: 61, B: 75, C: 83, D: 87 } },
  { category: 'residential_1_3', description: 'Residential - 1/3 acre lots (30% impervious)', cnValues: { A: 57, B: 72, C: 81, D: 86 } },
  { category: 'residential_1_2', description: 'Residential - 1/2 acre lots (25% impervious)', cnValues: { A: 54, B: 70, C: 80, D: 85 } },
  { category: 'residential_1', description: 'Residential - 1 acre lots (20% impervious)', cnValues: { A: 51, B: 68, C: 79, D: 84 } },
  { category: 'residential_2', description: 'Residential - 2 acre lots (12% impervious)', cnValues: { A: 46, B: 65, C: 77, D: 82 } },
  { category: 'commercial', description: 'Commercial/Business (85% impervious)', cnValues: { A: 89, B: 92, C: 94, D: 95 } },
  { category: 'industrial', description: 'Industrial (72% impervious)', cnValues: { A: 81, B: 88, C: 91, D: 93 } },
  { category: 'open_space_good', description: 'Open Space - Good condition (>75% grass)', cnValues: { A: 39, B: 61, C: 74, D: 80 } },
  { category: 'open_space_fair', description: 'Open Space - Fair condition (50-75% grass)', cnValues: { A: 49, B: 69, C: 79, D: 84 } },
  { category: 'open_space_poor', description: 'Open Space - Poor condition (<50% grass)', cnValues: { A: 68, B: 79, C: 86, D: 89 } },
  { category: 'parking', description: 'Paved parking, roofs, driveways', cnValues: { A: 98, B: 98, C: 98, D: 98 } },
  { category: 'streets_paved', description: 'Streets/Roads - Paved with curbs', cnValues: { A: 98, B: 98, C: 98, D: 98 } },
  { category: 'streets_gravel', description: 'Streets/Roads - Gravel', cnValues: { A: 76, B: 85, C: 89, D: 91 } },
  { category: 'streets_dirt', description: 'Streets/Roads - Dirt', cnValues: { A: 72, B: 82, C: 87, D: 89 } },
  { category: 'pasture_good', description: 'Pasture - Good condition', cnValues: { A: 39, B: 61, C: 74, D: 80 } },
  { category: 'pasture_fair', description: 'Pasture - Fair condition', cnValues: { A: 49, B: 69, C: 79, D: 84 } },
  { category: 'pasture_poor', description: 'Pasture - Poor condition', cnValues: { A: 68, B: 79, C: 86, D: 89 } },
  { category: 'meadow', description: 'Meadow (continuous grass)', cnValues: { A: 30, B: 58, C: 71, D: 78 } },
  { category: 'woods_good', description: 'Woods - Good condition', cnValues: { A: 30, B: 55, C: 70, D: 77 } },
  { category: 'woods_fair', description: 'Woods - Fair condition', cnValues: { A: 36, B: 60, C: 73, D: 79 } },
  { category: 'woods_poor', description: 'Woods - Poor condition', cnValues: { A: 45, B: 66, C: 77, D: 83 } },
  { category: 'farmstead', description: 'Farmstead buildings', cnValues: { A: 59, B: 74, C: 82, D: 86 } },
  { category: 'row_crops_sr_good', description: 'Row Crops - Straight row, good', cnValues: { A: 67, B: 78, C: 85, D: 89 } },
  { category: 'row_crops_sr_poor', description: 'Row Crops - Straight row, poor', cnValues: { A: 72, B: 81, C: 88, D: 91 } },
  { category: 'row_crops_ct_good', description: 'Row Crops - Contoured, good', cnValues: { A: 65, B: 75, C: 82, D: 86 } },
  { category: 'row_crops_ct_poor', description: 'Row Crops - Contoured, poor', cnValues: { A: 70, B: 79, C: 84, D: 88 } },
  { category: 'small_grain_sr_good', description: 'Small Grain - Straight row, good', cnValues: { A: 63, B: 75, C: 83, D: 87 } },
  { category: 'small_grain_ct_good', description: 'Small Grain - Contoured, good', cnValues: { A: 61, B: 73, C: 81, D: 84 } },
  { category: 'brush_good', description: 'Brush/Shrub - Good condition', cnValues: { A: 30, B: 48, C: 65, D: 73 } },
  { category: 'brush_fair', description: 'Brush/Shrub - Fair condition', cnValues: { A: 35, B: 56, C: 70, D: 77 } },
  { category: 'brush_poor', description: 'Brush/Shrub - Poor condition', cnValues: { A: 48, B: 67, C: 77, D: 83 } },
];

type SoilGroup = 'A' | 'B' | 'C' | 'D';

interface LandUseEntry {
  id: number;
  category: string;
  soilGroup: SoilGroup;
  area: number;
}

const CurveNumberCalculator: React.FC = () => {
  const [entries, setEntries] = useState<LandUseEntry[]>([
    { id: 1, category: '', soilGroup: 'B', area: 0 }
  ]);
  const [nextId, setNextId] = useState(2);

  const addEntry = () => {
    setEntries([...entries, { id: nextId, category: '', soilGroup: 'B', area: 0 }]);
    setNextId(nextId + 1);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: number, field: keyof LandUseEntry, value: string | number) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const getCN = (category: string, soilGroup: SoilGroup): number | null => {
    const landUse = landUseData.find(l => l.category === category);
    return landUse ? landUse.cnValues[soilGroup] : null;
  };

  const calculateWeightedCN = (): { weightedCN: number; totalArea: number } | null => {
    let totalArea = 0;
    let weightedSum = 0;

    for (const entry of entries) {
      if (!entry.category || entry.area <= 0) continue;
      const cn = getCN(entry.category, entry.soilGroup);
      if (cn === null) continue;
      totalArea += entry.area;
      weightedSum += cn * entry.area;
    }

    if (totalArea === 0) return null;
    return { weightedCN: weightedSum / totalArea, totalArea };
  };

  const result = calculateWeightedCN();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Curve Number (CN) Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Estimate composite curve numbers for watersheds using TR-55 land use categories and hydrologic soil groups.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Land Use Areas</Label>
            <Button variant="outline" size="sm" onClick={addEntry}>
              <Plus className="h-4 w-4 mr-1" /> Add Area
            </Button>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label className="text-xs">Land Use</Label>
                  <Select
                    value={entry.category}
                    onValueChange={(value) => updateEntry(entry.id, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select land use..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {landUseData.map((lu) => (
                        <SelectItem key={lu.category} value={lu.category}>
                          {lu.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Soil Group</Label>
                  <Select
                    value={entry.soilGroup}
                    onValueChange={(value) => updateEntry(entry.id, 'soilGroup', value as SoilGroup)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Low runoff</SelectItem>
                      <SelectItem value="B">B - Moderate</SelectItem>
                      <SelectItem value="C">C - High</SelectItem>
                      <SelectItem value="D">D - Very high</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Area (acres)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={entry.area || ''}
                    onChange={(e) => updateEntry(entry.id, 'area', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">CN</Label>
                  <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                    {entry.category ? getCN(entry.category, entry.soilGroup) ?? '-' : '-'}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length === 1}
                    className="h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Area</p>
                  <p className="text-2xl font-bold">{result.totalArea.toFixed(2)} acres</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Composite CN</p>
                  <p className="text-2xl font-bold text-primary">{result.weightedCN.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <h4 className="font-semibold mb-3">Hydrologic Soil Group Reference</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Infiltration Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">A</TableCell>
                <TableCell>Deep, well-drained sands and gravels</TableCell>
                <TableCell>&gt; 0.30 in/hr</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">B</TableCell>
                <TableCell>Moderately deep, well-drained soils</TableCell>
                <TableCell>0.15 - 0.30 in/hr</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">C</TableCell>
                <TableCell>Soils with slow infiltration, fine texture</TableCell>
                <TableCell>0.05 - 0.15 in/hr</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">D</TableCell>
                <TableCell>Clay soils, high water table, shallow bedrock</TableCell>
                <TableCell>&lt; 0.05 in/hr</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurveNumberCalculator;
