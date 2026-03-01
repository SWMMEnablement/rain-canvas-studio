import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Download, ArrowUpDown, Filter, MapPin, CloudRain, Scale } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { COMPARISON_DATA, PEAK_POSITION_LABELS, type ComparisonRow, type PeakPosition } from "./taxonomyData";
import { PATTERN_REFERENCE_DATA } from "./patternReferenceData";
import { PatternCoverageMap, toMacroRegion, type MacroRegion } from "./PatternCoverageMap";
import { RegionComparisonChart } from "./RegionComparisonChart";
import { SavedFilters, type FilterState } from "./SavedFilters";

// ── Climate type mapping ──
type ClimateType = "Tropical" | "Arid" | "Temperate" | "Continental" | "Monsoon" | "Mediterranean" | "Maritime" | "Universal";

const CLIMATE_MAP: Record<string, ClimateType> = {
  // Asia-Pacific
  'Japan': 'Temperate', 'South Korea': 'Monsoon', 'China': 'Monsoon',
  'India': 'Monsoon', 'Malaysia': 'Tropical', 'Indonesia': 'Tropical',
  'Singapore': 'Tropical', 'Philippines': 'Tropical', 'Hong Kong': 'Tropical',
  'Taiwan': 'Tropical', 'Vietnam': 'Monsoon', 'Thailand': 'Tropical',
  'Bangladesh': 'Monsoon', 'Pakistan': 'Monsoon', 'Sri Lanka': 'Tropical',
  'Fiji': 'Tropical', 'Australia': 'Continental',
  // Middle East
  'Saudi Arabia': 'Arid', 'UAE': 'Arid', 'Qatar': 'Arid', 'Oman': 'Arid',
  'Turkey': 'Mediterranean', 'Iran': 'Arid', 'Iraq': 'Arid', 'Israel': 'Mediterranean',
  // Africa
  'South Africa': 'Temperate', 'Nigeria': 'Tropical', 'Kenya': 'Tropical',
  'Egypt': 'Arid', 'Ethiopia': 'Tropical', 'Ghana': 'Tropical',
  'Morocco': 'Mediterranean', 'Mozambique': 'Tropical', 'Tanzania': 'Tropical',
  // Europe
  'Germany': 'Temperate', 'Germany/Europe': 'Temperate', 'France': 'Temperate',
  'UK': 'Maritime', 'Europe': 'Temperate', 'Czech Republic': 'Continental',
  'Sweden': 'Continental', 'Netherlands': 'Maritime', 'Italy': 'Mediterranean',
  // Americas
  'United States': 'Continental', 'US (Pacific)': 'Maritime', 'US (NW Coast)': 'Maritime',
  'US (East/Central)': 'Continental', 'US (Gulf/Atlantic)': 'Tropical',
  'US Midwest': 'Continental', 'Texas, US': 'Continental',
  'Brazil': 'Tropical', 'Mexico': 'Tropical', 'Colombia': 'Tropical',
  'Chile': 'Mediterranean', 'Argentina': 'Temperate',
  // Universal
  'Universal': 'Universal',
};

function getClimateType(region: string): ClimateType {
  return CLIMATE_MAP[region] || 'Temperate';
}

// ── Regulatory standards extracted from reference data ──
function getRegStandards(patternId: string): string[] {
  const ref = PATTERN_REFERENCE_DATA.find(p => p.id === patternId);
  if (!ref) return [];
  return ref.regulatoryAcceptance
    .filter(r => r.status === 'required' || r.status === 'accepted')
    .map(r => r.jurisdiction);
}

const CLIMATE_COLORS: Record<ClimateType, string> = {
  Tropical: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Arid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Temperate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Continental: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  Monsoon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  Mediterranean: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Maritime: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Universal: 'bg-muted text-muted-foreground',
};

const PEAK_COLORS: Record<PeakPosition, string> = {
  front: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  center: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  back: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  variable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

type SortField = 'name' | 'region' | 'climate' | 'peakPosition' | 'equationFamily' | 'durationRange';

interface EnrichedRow extends ComparisonRow {
  climate: ClimateType;
  standards: string[];
  macro: MacroRegion;
}

export function PatternSearchTable() {
  const [search, setSearch] = useState("");
  const [filterClimate, setFilterClimate] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterFamily, setFilterFamily] = useState<string>("all");
  const [filterMacro, setFilterMacro] = useState<MacroRegion | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Enrich rows with climate + regulatory data
  const enrichedData = useMemo<EnrichedRow[]>(() =>
    COMPARISON_DATA.map(row => ({
      ...row,
      climate: getClimateType(row.region),
      standards: getRegStandards(row.id),
      macro: toMacroRegion(row.region),
    }))
  , []);

  const regions = useMemo(() => {
    const unique = Array.from(new Set(enrichedData.map(r => r.region)));
    return unique.sort();
  }, [enrichedData]);

  const climates = useMemo(() => {
    const unique = Array.from(new Set(enrichedData.map(r => r.climate)));
    return unique.sort();
  }, [enrichedData]);

  const families = useMemo(() => {
    const unique = Array.from(new Set(enrichedData.map(r => r.equationFamily)));
    return unique.sort();
  }, [enrichedData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enrichedData
      .filter(r => {
        if (filterMacro && r.macro !== filterMacro) return false;
        if (filterClimate !== 'all' && r.climate !== filterClimate) return false;
        if (filterRegion !== 'all' && r.region !== filterRegion) return false;
        if (filterFamily !== 'all' && r.equationFamily !== filterFamily) return false;
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          r.climate.toLowerCase().includes(q) ||
          r.equationFamily.toLowerCase().includes(q) ||
          r.sourceDoc.toLowerCase().includes(q) ||
          r.standards.some(s => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let va: string, vb: string;
        if (sortField === 'climate') {
          va = a.climate; vb = b.climate;
        } else {
          va = String(a[sortField]); vb = String(b[sortField]);
        }
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [search, filterClimate, filterRegion, filterFamily, filterMacro, sortField, sortAsc, enrichedData]);

  // Macro-region counts for the map (unfiltered)
  const regionCounts = useMemo(() => {
    const counts: Record<MacroRegion, number> = {} as any;
    for (const r of enrichedData) {
      counts[r.macro] = (counts[r.macro] || 0) + 1;
    }
    return counts;
  }, [enrichedData]);

  // Family breakdown per macro-region for map tooltips
  const familyBreakdown = useMemo(() => {
    const bd: Record<MacroRegion, Record<string, number>> = {} as any;
    for (const r of enrichedData) {
      if (!bd[r.macro]) bd[r.macro] = {};
      bd[r.macro][r.equationFamily] = (bd[r.macro][r.equationFamily] || 0) + 1;
    }
    return bd;
  }, [enrichedData]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const hasFilters = search || filterClimate !== 'all' || filterRegion !== 'all' || filterFamily !== 'all' || filterMacro !== null;

  const clearFilters = () => {
    setSearch("");
    setFilterClimate("all");
    setFilterRegion("all");
    setFilterFamily("all");
    setFilterMacro(null);
  };

  const applyFilters = (f: FilterState) => {
    setSearch(f.search);
    setFilterClimate(f.filterClimate);
    setFilterRegion(f.filterRegion);
    setFilterFamily(f.filterFamily);
    setFilterMacro(f.filterMacro);
  };

  const handleCsvExport = () => {
    const headers = ['Name', 'Region', 'Climate Type', 'Equation Family', 'Peak Position', 'r', 'Duration Range', 'IDF Required', 'Source', 'Regulatory Standards'];
    const rows = filtered.map(r => [
      r.name, r.region, r.climate, r.equationFamily, PEAK_POSITION_LABELS[r.peakPosition],
      r.advancementRatio, r.durationRange, r.idfRequired, r.sourceDoc,
      r.standards.join('; ') || '—',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pattern-search-results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Pattern Finder
            </CardTitle>
            <CardDescription>
              Search {enrichedData.length} patterns by region, climate, or regulatory standard
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <SavedFilters
              currentFilters={{ search, filterClimate, filterRegion, filterFamily, filterMacro }}
              onApply={applyFilters}
              hasActiveFilters={!!hasFilters}
            />
            <Button variant="outline" size="sm" onClick={handleCsvExport} className="gap-1.5">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, region, standard, source..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-44 h-9">
              <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterClimate} onValueChange={setFilterClimate}>
            <SelectTrigger className="w-44 h-9">
              <CloudRain className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Climate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Climates</SelectItem>
              {climates.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterFamily} onValueChange={setFilterFamily}>
            <SelectTrigger className="w-44 h-9">
              <Scale className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Eq. Family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              {families.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interactive Map */}
        <PatternCoverageMap
          regionCounts={regionCounts}
          activeMacro={filterMacro}
          onMacroClick={setFilterMacro}
          totalPatterns={enrichedData.length}
          familyBreakdown={familyBreakdown}
        />

        {/* Region Comparison Chart */}
        <RegionComparisonChart
          familyBreakdown={familyBreakdown}
          activeFamily={filterFamily !== 'all' ? filterFamily : undefined}
          activeRegion={filterMacro || undefined}
          onBarClick={(family, region) => {
            if (!family) {
              setFilterFamily('all');
              setFilterMacro(null);
            } else {
              setFilterFamily(family);
              setFilterMacro(region);
            }
          }}
        />

        {/* Results summary + Reset all */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {enrichedData.length} patterns
            {filterMacro && <span className="ml-1 font-medium text-primary">· {filterMacro}</span>}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-7 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
              <X className="w-3.5 h-3.5" /> Reset All Filters
            </Button>
          )}
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap items-center gap-1.5">
        {search && (() => {
              const count = enrichedData.filter(r => { const q = search.toLowerCase(); return r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.climate.toLowerCase().includes(q) || r.equationFamily.toLowerCase().includes(q) || r.sourceDoc.toLowerCase().includes(q) || r.standards.some(s => s.toLowerCase().includes(q)); }).length;
              return (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5">
                Search: <span className="font-semibold">"{search}"</span>
                <Tooltip><TooltipTrigger asChild><span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1 text-[9px] cursor-default">{count}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{((count / enrichedData.length) * 100).toFixed(1)}% of {enrichedData.length} patterns</TooltipContent></Tooltip>
                <button onClick={() => setSearch("")} className="ml-0.5 rounded-full hover:bg-muted p-0.5"><X className="w-3 h-3" /></button>
              </Badge>);
            })()}
            {filterRegion !== 'all' && (() => {
              const count = enrichedData.filter(r => r.region === filterRegion).length;
              return (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5">
                <MapPin className="w-3 h-3" /> {filterRegion}
                <Tooltip><TooltipTrigger asChild><span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1 text-[9px] cursor-default">{count}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{((count / enrichedData.length) * 100).toFixed(1)}% of {enrichedData.length} patterns</TooltipContent></Tooltip>
                <button onClick={() => setFilterRegion('all')} className="ml-0.5 rounded-full hover:bg-muted p-0.5"><X className="w-3 h-3" /></button>
              </Badge>);
            })()}
            {filterClimate !== 'all' && (() => {
              const count = enrichedData.filter(r => r.climate === filterClimate).length;
              return (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5">
                <CloudRain className="w-3 h-3" /> {filterClimate}
                <Tooltip><TooltipTrigger asChild><span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1 text-[9px] cursor-default">{count}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{((count / enrichedData.length) * 100).toFixed(1)}% of {enrichedData.length} patterns</TooltipContent></Tooltip>
                <button onClick={() => setFilterClimate('all')} className="ml-0.5 rounded-full hover:bg-muted p-0.5"><X className="w-3 h-3" /></button>
              </Badge>);
            })()}
            {filterFamily !== 'all' && (() => {
              const count = enrichedData.filter(r => r.equationFamily === filterFamily).length;
              return (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5">
                <Scale className="w-3 h-3" /> {filterFamily}
                <Tooltip><TooltipTrigger asChild><span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1 text-[9px] cursor-default">{count}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{((count / enrichedData.length) * 100).toFixed(1)}% of {enrichedData.length} patterns</TooltipContent></Tooltip>
                <button onClick={() => setFilterFamily('all')} className="ml-0.5 rounded-full hover:bg-muted p-0.5"><X className="w-3 h-3" /></button>
              </Badge>);
            })()}
            {filterMacro && (() => {
              const count = enrichedData.filter(r => r.macro === filterMacro).length;
              return (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5">
                Region: <span className="font-semibold">{filterMacro}</span>
                <Tooltip><TooltipTrigger asChild><span className="ml-0.5 rounded-full bg-muted-foreground/20 px-1 text-[9px] cursor-default">{count}</span></TooltipTrigger><TooltipContent side="top" className="text-xs">{((count / enrichedData.length) * 100).toFixed(1)}% of {enrichedData.length} patterns</TooltipContent></Tooltip>
                <button onClick={() => setFilterMacro(null)} className="ml-0.5 rounded-full hover:bg-muted p-0.5"><X className="w-3 h-3" /></button>
              </Badge>);
            })()}
          </div>
          </TooltipProvider>
        )}

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                {([
                  { field: 'name' as SortField, label: 'Pattern' },
                  { field: 'region' as SortField, label: 'Region' },
                  { field: 'climate' as SortField, label: 'Climate' },
                  { field: 'equationFamily' as SortField, label: 'Equation Family' },
                  { field: 'peakPosition' as SortField, label: 'Peak' },
                  { field: 'durationRange' as SortField, label: 'Duration' },
                ] as const).map(col => (
                  <TableHead key={col.field}>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-7 text-xs" onClick={() => toggleSort(col.field)}>
                      {col.label} <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </TableHead>
                ))}
                <TableHead className="text-xs">IDF?</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Regulatory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                    No patterns match your filters. Try adjusting or clearing them.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-sm whitespace-nowrap">{row.name}</TableCell>
                    <TableCell className="text-xs">{row.region}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${CLIMATE_COLORS[row.climate]}`}>
                        {row.climate}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] px-1.5">{row.equationFamily}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${PEAK_COLORS[row.peakPosition]}`}>
                        {PEAK_POSITION_LABELS[row.peakPosition]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{row.durationRange}</TableCell>
                    <TableCell className="text-xs text-center">{row.idfRequired}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate" title={row.sourceDoc}>
                      {row.sourceDoc}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      {row.standards.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.standards.slice(0, 2).map(s => (
                            <Badge key={s} variant="secondary" className="text-[9px] px-1">
                              {s.length > 20 ? s.slice(0, 18) + '…' : s}
                            </Badge>
                          ))}
                          {row.standards.length > 2 && (
                            <Badge variant="secondary" className="text-[9px] px-1">
                              +{row.standards.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Climate types are inferred from pattern region. Regulatory standards shown for patterns with detailed reference cards. Export CSV for full offline analysis.
        </p>
      </CardContent>
    </Card>
  );
}
