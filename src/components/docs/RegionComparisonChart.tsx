import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, X, Layers, Percent } from "lucide-react";
import type { MacroRegion } from "./PatternCoverageMap";

const REGION_COLORS: Record<MacroRegion, string> = {
  'North America': 'hsl(204, 70%, 53%)',
  'Latin America': 'hsl(210, 80%, 55%)',
  'Europe': 'hsl(145, 60%, 45%)',
  'Middle East': 'hsl(35, 90%, 55%)',
  'Africa': 'hsl(15, 85%, 55%)',
  'Asia-Pacific': 'hsl(270, 60%, 55%)',
  'Universal': 'hsl(210, 15%, 55%)',
};

const ALL_REGIONS: MacroRegion[] = [
  'North America', 'Latin America', 'Europe', 'Middle East', 'Africa', 'Asia-Pacific',
];

interface RegionComparisonChartProps {
  familyBreakdown: Record<MacroRegion, Record<string, number>>;
  onBarClick?: (family: string, region: MacroRegion) => void;
}

export function RegionComparisonChart({ familyBreakdown, onBarClick }: RegionComparisonChartProps) {
  const [selected, setSelected] = useState<MacroRegion[]>(['North America', 'Europe', 'Asia-Pacific']);
  const [stacked, setStacked] = useState(false);
  const [percentage, setPercentage] = useState(false);

  const toggle = (r: MacroRegion) => {
    setSelected(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : prev.length < 4 ? [...prev, r] : prev
    );
  };

  const chartData = useMemo(() => {
    const allFamilies = new Set<string>();
    for (const r of selected) {
      if (familyBreakdown[r]) {
        Object.keys(familyBreakdown[r]).forEach(f => allFamilies.add(f));
      }
    }
    return Array.from(allFamilies)
      .map(family => {
        const entry: Record<string, string | number> = { family };
        if (stacked && percentage) {
          const total = selected.reduce((s, r) => s + (familyBreakdown[r]?.[family] || 0), 0);
          for (const r of selected) {
            entry[r] = total > 0 ? Math.round(((familyBreakdown[r]?.[family] || 0) / total) * 100) : 0;
          }
        } else {
          for (const r of selected) {
            entry[r] = familyBreakdown[r]?.[family] || 0;
          }
        }
        return entry;
      })
      .sort((a, b) => {
        const sumA = selected.reduce((s, r) => s + ((a[r] as number) || 0), 0);
        const sumB = selected.reduce((s, r) => s + ((b[r] as number) || 0), 0);
        return sumB - sumA;
      });
  }, [selected, familyBreakdown, stacked, percentage]);

  if (!familyBreakdown || Object.keys(familyBreakdown).length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BarChart3 className="w-4 h-4 text-primary" />
          Region Comparison
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <Label htmlFor="stack-toggle" className="text-[10px] text-muted-foreground cursor-pointer">Stacked</Label>
            <Switch id="stack-toggle" checked={stacked} onCheckedChange={(v) => { setStacked(v); if (!v) setPercentage(false); }} className="scale-75" />
          </div>
          {stacked && (
            <div className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-muted-foreground" />
              <Label htmlFor="pct-toggle" className="text-[10px] text-muted-foreground cursor-pointer">%</Label>
              <Switch id="pct-toggle" checked={percentage} onCheckedChange={setPercentage} className="scale-75" />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground">Select 2–4 regions</span>
        </div>
      </div>

      {/* Region selector chips */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_REGIONS.map(r => {
          const isActive = selected.includes(r);
          const count = familyBreakdown[r] ? Object.values(familyBreakdown[r]).reduce((a, b) => a + b, 0) : 0;
          return (
            <Badge
              key={r}
              variant={isActive ? 'default' : 'outline'}
              className={`text-[10px] px-2 py-0.5 cursor-pointer transition-colors gap-1 ${
                isActive ? '' : 'hover:bg-accent'
              } ${!isActive && selected.length >= 4 ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (!isActive && selected.length >= 4) return;
                if (isActive && selected.length <= 2) return;
                toggle(r);
              }}
              style={isActive ? { backgroundColor: REGION_COLORS[r], borderColor: REGION_COLORS[r] } : undefined}
            >
              {r} ({count})
              {isActive && selected.length > 2 && <X className="w-3 h-3 ml-0.5" />}
            </Badge>
          );
        })}
      </div>

      {/* Chart */}
      {selected.length >= 2 && chartData.length > 0 && (
        <div className="rounded-lg border bg-card/50 p-3">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="family"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                angle={-30}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                allowDecimals={false}
                domain={stacked && percentage ? [0, 100] : undefined}
                tickFormatter={stacked && percentage ? (v: number) => `${v}%` : undefined}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={stacked && percentage ? (value: number) => `${value}%` : undefined}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
                iconSize={8}
              />
              {selected.map(r => (
                <Bar
                  key={r}
                  dataKey={r}
                  fill={REGION_COLORS[r]}
                  stackId={stacked ? 'stack' : undefined}
                  radius={stacked ? undefined : [3, 3, 0, 0]}
                  maxBarSize={stacked ? 40 : 28}
                  cursor={onBarClick ? 'pointer' : undefined}
                  onClick={(data: any, _index: number, e: any) => {
                    e?.stopPropagation?.();
                    const family = data?.family || data?.payload?.family;
                    if (onBarClick && family) {
                      onBarClick(family, r);
                    }
                  }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
