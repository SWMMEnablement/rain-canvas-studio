import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayersIcon } from "lucide-react";
import { patterns } from "@/components/PatternSelector";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981"];
const DEPTH_MM = 50;
const DURATION_H = 6;
const STEP_MIN = 15;

interface Props {
  onSelectPattern: (patternId: string, patternName: string) => void;
}

export const PatternCompareDemo = ({ onSelectPattern }: Props) => {
  const options = useMemo(
    () => [...patterns].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const [selected, setSelected] = useState<string[]>(["scs2", "chicago", "huff2"]);

  const data = useMemo(() => {
    const series = selected.map((id) =>
      generateRainfallData(id as PatternType, DEPTH_MM, DURATION_H, STEP_MIN)
    );
    const n = Math.max(...series.map((s) => s.length), 0);
    return Array.from({ length: n }, (_, i) => {
      const row: Record<string, number | string> = { time: ((i * STEP_MIN) / 60).toFixed(2) };
      selected.forEach((id, k) => {
        row[id] = Number((series[k][i] ?? 0).toFixed(3));
      });
      return row;
    });
  }, [selected]);

  const nameOf = (id: string) => options.find((p) => p.id === id)?.name ?? id;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <LayersIcon className="w-5 h-5 text-primary" aria-hidden="true" />
          Compare 3 patterns
        </CardTitle>
        <CardDescription>
          Overlay any three design storms at {DEPTH_MM} mm over {DURATION_H} h ({STEP_MIN}-minute steps) to see how
          peak timing and intensity differ before you commit to one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {selected.map((id, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor={`cmp-${idx}`}>
                Pattern {idx + 1}
              </label>
              <Select
                value={id}
                onValueChange={(v) => setSelected((prev) => prev.map((p, i) => (i === idx ? v : p)))}
              >
                <SelectTrigger id={`cmp-${idx}`} aria-label={`Comparison pattern ${idx + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {options.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))"
                label={{ value: "Time (h)", position: "insideBottom", offset: -4, fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))"
                label={{ value: "Intensity (mm/h)", angle: -90, position: "insideLeft", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, key: string) => [`${v} mm/h`, nameOf(key)]}
                labelFormatter={(l) => `t = ${l} h`}
              />
              <Legend formatter={(key: string) => nameOf(key)} wrapperStyle={{ fontSize: 12 }} />
              {selected.map((id, i) => (
                <Line key={id + i} type="monotone" dataKey={id} stroke={COLORS[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2">
          {selected.map((id, i) => (
            <Button key={id + i} size="sm" variant="outline" onClick={() => onSelectPattern(id, nameOf(id))}>
              Use {nameOf(id)} in wizard
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
