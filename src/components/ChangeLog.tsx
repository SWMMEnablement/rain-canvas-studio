import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CHANGELOG, MONTHLY_ACTIVITY, type ChangeArea } from "@/lib/changelog";

const ALL_AREAS = Array.from(new Set(CHANGELOG.flatMap((e) => e.areas))).sort((a, b) => a.localeCompare(b)) as ChangeArea[];

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ChangeLog() {
  const [area, setArea] = useState<ChangeArea | null>(null);
  const [query, setQuery] = useState("");
  const total = MONTHLY_ACTIVITY.reduce((s, m) => s + m.changes, 0);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CHANGELOG.filter((e) => (!area || e.areas.includes(area)))
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.changes.some((c) => c.toLowerCase().includes(q)));
  }, [area, query]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Changes over time</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {CHANGELOG.length} releases and {total.toLocaleString()} saved changes since {formatDate(CHANGELOG[CHANGELOG.length - 1].date)}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity by month</CardTitle>
          <CardDescription>Number of saved code changes each month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56" role="img" aria-label={`Saved changes per month: ${MONTHLY_ACTIVITY.map((m) => `${m.month} ${m.changes}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ACTIVITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="changes" name="Changes" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          aria-label="Search changes"
          placeholder="Search changes (e.g. SWMM, Euler, climate)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by area">
          <button type="button" onClick={() => setArea(null)} aria-pressed={area === null}>
            <Badge variant={area === null ? "default" : "outline"}>All</Badge>
          </button>
          {ALL_AREAS.map((a) => (
            <button key={a} type="button" onClick={() => setArea(area === a ? null : a)} aria-pressed={area === a}>
              <Badge variant={area === a ? "default" : "outline"}>{a}</Badge>
            </button>
          ))}
        </div>
      </div>

      <ol className="relative border-l border-border ml-3 space-y-6">
        {entries.map((e) => (
          <li key={e.version} className="ml-6">
            <span className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" aria-hidden="true" />
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="font-semibold text-foreground">v{e.version} — {e.title}</h3>
              <time dateTime={e.date} className="text-sm text-muted-foreground">{formatDate(e.date)}</time>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {[...e.areas].sort((a, b) => a.localeCompare(b)).map((a) => (
                <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </div>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {e.changes.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </li>
        ))}
        {entries.length === 0 && <li className="ml-6 text-sm text-muted-foreground">No changes match.</li>}
      </ol>
    </div>
  );
}
