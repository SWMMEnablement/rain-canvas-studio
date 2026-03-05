import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, ArrowUpDown, TableIcon, Check, X, Minus } from "lucide-react";
import { COMPARISON_DATA, PEAK_POSITION_LABELS, type ComparisonRow, type PeakPosition } from "./taxonomyData";

type SortField = keyof ComparisonRow;

const PEAK_COLORS: Record<PeakPosition, string> = {
  front: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  center: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  back: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  variable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

function BoolCell({ value }: { value: boolean | null }) {
  if (value === null) return <Minus className="w-3.5 h-3.5 text-muted-foreground mx-auto" />;
  return value
    ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
    : <X className="w-3.5 h-3.5 text-muted-foreground mx-auto" />;
}

function CompatBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    Direct: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Conversion: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'N/A': 'bg-muted text-muted-foreground',
  };
  return <Badge variant="outline" className={`text-[10px] px-1.5 ${colors[value] || ''}`}>{value}</Badge>;
}

export function ComparisonMatrix() {
  const [search, setSearch] = useState("");
  const [filterFamily, setFilterFamily] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('taxonomyClass');
  const [sortAsc, setSortAsc] = useState(true);

  const families = useMemo(() => {
    const unique = Array.from(new Set(COMPARISON_DATA.map(r => r.equationFamily)));
    return unique.sort();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COMPARISON_DATA
      .filter(r => {
        if (filterFamily !== 'all' && r.equationFamily !== filterFamily) return false;
        if (!q) return true;
        return r.name.toLowerCase().includes(q)
          || r.region.toLowerCase().includes(q)
          || r.equationFamily.toLowerCase().includes(q)
          || r.taxonomyClass.includes(q);
      })
      .sort((a, b) => {
        const va = String(a[sortField]);
        const vb = String(b[sortField]);
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [search, filterFamily, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleCsvExport = () => {
    const headers = [
      'ID', 'Name', 'Taxonomy Class', 'Region', 'IDF Required', 'Temporal Res',
      'Duration Range', 'Key Parameters', 'Peak Position', 'Advancement Ratio',
      'Nested IDF', 'Dimensionless', 'Source Document', 'Equation Family',
      'Use Case', 'SWMM Compatible', 'ICM Compatible',
    ];
    const rows = filtered.map(r => [
      r.id, r.name, r.taxonomyClass, r.region, r.idfRequired, r.temporalRes,
      r.durationRange, r.keyParams, PEAK_POSITION_LABELS[r.peakPosition], r.advancementRatio,
      r.nestedIdf === null ? 'N/A' : r.nestedIdf ? 'Yes' : 'No',
      r.dimensionless ? 'Yes' : 'No', r.sourceDoc, r.equationFamily,
      r.useCase, r.swmmCompat, r.icmCompat,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'design-storm-comparison-matrix.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-primary" />
              Comparison Matrix
            </CardTitle>
            <CardDescription>
              {filtered.length} of {COMPARISON_DATA.length} methods — filter, sort, and export
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleCsvExport} className="gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, region, or family..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={filterFamily} onValueChange={setFilterFamily}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue placeholder="Equation Family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              {families.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {[
                  { field: 'taxonomyClass' as SortField, label: 'Class' },
                  { field: 'name' as SortField, label: 'Name' },
                  { field: 'region' as SortField, label: 'Region' },
                  { field: 'equationFamily' as SortField, label: 'Equation Family' },
                  { field: 'idfRequired' as SortField, label: 'IDF?' },
                  { field: 'peakPosition' as SortField, label: 'Peak' },
                  { field: 'advancementRatio' as SortField, label: 'r' },
                  { field: 'durationRange' as SortField, label: 'Duration' },
                ].map(col => (
                  <TableHead key={col.field}>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-7 text-xs" onClick={() => toggleSort(col.field)}>
                      {col.label} <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-center text-xs">Nested</TableHead>
                <TableHead className="text-center text-xs">Dim-less</TableHead>
                <TableHead className="text-center text-xs">SWMM</TableHead>
                <TableHead className="text-center text-xs">ICM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.taxonomyClass}</TableCell>
                  <TableCell className="font-medium text-sm whitespace-nowrap">{row.name}</TableCell>
                  <TableCell className="text-xs">{row.region}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-1.5">{row.equationFamily}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-center">{row.idfRequired}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] px-1.5 ${PEAK_COLORS[row.peakPosition]}`}>
                      {PEAK_POSITION_LABELS[row.peakPosition]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-center">{row.advancementRatio}</TableCell>
                  <TableCell className="text-xs">{row.durationRange}</TableCell>
                  <TableCell className="text-center"><BoolCell value={row.nestedIdf} /></TableCell>
                  <TableCell className="text-center"><BoolCell value={row.dimensionless} /></TableCell>
                  <TableCell className="text-center"><CompatBadge value={row.swmmCompat} /></TableCell>
                  <TableCell className="text-center"><CompatBadge value={row.icmCompat} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {COMPARISON_DATA.length} representative methods shown. "Nested" = preserves IDF at sub-durations. 
          "Dim-less" = scalable to any depth. Use CSV export for full offline reference.
        </p>
      </CardContent>
    </Card>
  );
}
