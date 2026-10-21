import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, LayersIcon, Link2 } from "lucide-react";
import { resolvePatternSlug } from "@/components/StormWizard";
import { toast } from "sonner";

/** Read ?compare=a,b,c (slugs, ids or names) from the URL. */
function readComparePermalink(): string[] | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("compare");
    if (!raw) return null;
    const ids = raw.split(",").map((s) => resolvePatternSlug(s.trim())).filter(Boolean) as string[];
    return ids.length === 3 ? ids : null;
  } catch {
    return null;
  }
}
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
  const [selected, setSelected] = useState<string[]>(() => readComparePermalink() ?? ["scs2", "chicago", "huff2"]);

  const copyLink = async () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("compare", selected.join(","));
    url.searchParams.set("cmpDepthMm", String(DEPTH_MM));
    url.searchParams.set("cmpDurationH", String(DURATION_H));
    url.searchParams.set("cmpStepMin", String(STEP_MIN));
    url.hash = "compare";
    const link = url.toString();
    window.history.replaceState(null, "", link);
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Comparison link copied");
    } catch {
      toast.message("Copy this link", { description: link });
    }
  };

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

  const chartRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [cursor, setCursor] = useState(0);
  const [chartFocused, setChartFocused] = useState(false);
  const [announce, setAnnounce] = useState("");

  const peakSummary = () =>
    selected
      .map((id) => {
        let best = 0, at = "0";
        data.forEach((r) => { const v = Number(r[id]); if (v > best) { best = v; at = String(r.time); } });
        return `${nameOf(id)} peaks at ${best.toFixed(1)} mm/h at ${at} h`;
      })
      .join("; ");

  const describeRow = (i: number) => {
    const r = data[i];
    if (!r) return "";
    return `t = ${r.time} h: ` + selected.map((id) => `${nameOf(id)} ${r[id]} mm/h`).join(", ");
  };

  const onChartKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = data.length - 1;
    const map: Record<string, number> = {
      ArrowRight: cursor + 1, ArrowUp: cursor + 1, ArrowLeft: cursor - 1, ArrowDown: cursor - 1,
      PageUp: cursor + 4, PageDown: cursor - 4, Home: 0, End: last,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(last, map[e.key]));
    setCursor(next);
    setAnnounce(describeRow(next));
  };


  /** Build a self-contained SVG (resolved colours, title, legend, metadata). */
  const buildSvg = (): { svg: string; w: number; h: number } | null => {
    const src = chartRef.current?.querySelector("svg.recharts-surface") as SVGSVGElement | null;
    if (!src) return null;
    const w = src.clientWidth, chartH = src.clientHeight, top = 40, legendH = 22 * selected.length + 30;
    const h = chartH + top + legendH;
    const clone = src.cloneNode(true) as SVGSVGElement;
    const origEls = src.querySelectorAll("*"), cloneEls = clone.querySelectorAll("*");
    origEls.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const c = cloneEls[i] as SVGElement;
      ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-size", "font-family", "opacity"].forEach((prop) => {
        const v = cs.getPropertyValue(prop);
        if (v) c.setAttribute(prop, v);
      });
      c.removeAttribute("class");
    });
    const root = getComputedStyle(document.documentElement);
    const bg = `hsl(${root.getPropertyValue("--card").trim() || "0 0% 100%"})`;
    const fg = `hsl(${root.getPropertyValue("--foreground").trim() || "0 0% 0%"})`;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const lineColor = (id: string) =>
      (src.querySelector(`.recharts-line path[name="${CSS.escape(nameOf(id))}"]`) as SVGElement | null)?.getAttribute("stroke") ??
      getComputedStyle(src.querySelectorAll(".recharts-line-curve")[selected.indexOf(id)] ?? src).stroke;
    const legend = selected
      .map((id, k) => `<rect x="16" y="${top + chartH + 16 + k * 22}" width="14" height="4" fill="${lineColor(id)}"/><text x="38" y="${top + chartH + 22 + k * 22}" font-size="13" font-family="sans-serif" fill="${fg}">${esc(nameOf(id))}</text>`)
      .join("");
    const meta = `Depth ${DEPTH_MM} mm | Duration ${DURATION_H} h | Step ${STEP_MIN} min | Intensity mm/hr vs time h | ${selected.map(nameOf).join(", ")}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><desc>${esc(meta)}</desc><rect width="100%" height="100%" fill="${bg}"/><text x="16" y="26" font-size="16" font-weight="600" font-family="sans-serif" fill="${fg}">${esc(`Pattern comparison — ${DEPTH_MM} mm / ${DURATION_H} h / ${STEP_MIN}-min`)}</text><g transform="translate(0 ${top})">${clone.innerHTML}</g>${legend}</svg>`;
    return { svg, w, h };
  };

  const fileBase = () => `pattern-compare_${selected.join("_")}_${DEPTH_MM}mm_${DURATION_H}h`;
  const save = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };
  const exportSvg = () => {
    const r = buildSvg();
    if (r) save(new Blob([r.svg], { type: "image/svg+xml" }), `${fileBase()}.svg`);
  };
  const exportPng = () => {
    const r = buildSvg();
    if (!r) return;
    const img = new Image();
    const url = URL.createObjectURL(new Blob([r.svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const scale = 2, c = document.createElement("canvas");
      c.width = r.w * scale; c.height = r.h * scale;
      const ctx = c.getContext("2d")!;
      ctx.scale(scale, scale); ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      c.toBlob((b) => b && save(b, `${fileBase()}.png`), "image/png");
    };
    img.src = url;
  };

  const nameOf = (id: string) => options.find((p) => p.id === id)?.name ?? id;

  return (
    <Card id="compare" className="border-border scroll-mt-20" role="region" aria-labelledby={`${uid}-title`}>
      <CardHeader className="pb-3">
        <CardTitle id={`${uid}-title`} className="flex items-center gap-2 text-xl">
          <LayersIcon className="w-5 h-5 text-primary" aria-hidden="true" />
          Compare 3 patterns
        </CardTitle>
        <CardDescription>
          Overlay any three design storms at {DEPTH_MM} mm over {DURATION_H} h ({STEP_MIN}-minute steps) to see how
          peak timing and intensity differ before you commit to one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <fieldset className="grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">Choose three patterns to compare</legend>
          {selected.map((id, idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor={`cmp-${idx}`}>
                Pattern {idx + 1}
              </label>
              <Select
                value={id}
                onValueChange={(v) => { setSelected((prev) => prev.map((p, i) => (i === idx ? v : p))); setAnnounce(`Pattern ${idx + 1} set to ${nameOf(v)}`); }}
              >
                <SelectTrigger id={`cmp-${idx}`} aria-label={`Comparison pattern ${idx + 1}: ${nameOf(id)}`}>
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
        </fieldset>

        <div className="flex flex-wrap justify-end gap-2" role="toolbar" aria-label="Comparison chart actions">
          <Button size="sm" variant="outline" onClick={copyLink} aria-label="Copy a shareable link to this comparison">
            <Link2 className="w-4 h-4 mr-1" aria-hidden="true" /> Copy link
          </Button>
          <Button size="sm" variant="outline" onClick={exportPng} aria-label="Download comparison chart as PNG">
            <Download className="w-4 h-4 mr-1" aria-hidden="true" /> PNG
          </Button>
          <Button size="sm" variant="outline" onClick={exportSvg} aria-label="Download comparison chart as SVG">
            <Download className="w-4 h-4 mr-1" aria-hidden="true" /> SVG
          </Button>
        </div>

        <p id={`${uid}-help`} className="text-xs text-muted-foreground">
          Tip: focus the chart and use the arrow keys to step through time (Page Up/Down jumps 1 h, Home/End go to start/end).
        </p>
        <div
          ref={chartRef}
          className="h-[280px] w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          tabIndex={0}
          role="img"
          aria-roledescription="interactive chart"
          aria-label={`Hyetograph comparison, ${DEPTH_MM} mm over ${DURATION_H} hours. ${peakSummary()}.`}
          aria-describedby={`${uid}-help`}
          onKeyDown={onChartKey}
          onFocus={() => { setChartFocused(true); setAnnounce(describeRow(cursor)); }}
          onBlur={() => setChartFocused(false)}
        >
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
              {chartFocused && data[cursor] && (
                <ReferenceLine x={data[cursor].time as string} stroke="hsl(var(--foreground))" strokeDasharray="4 2" />
              )}
              {selected.map((id, i) => (
                <Line key={id + i} type="monotone" dataKey={id} stroke={COLORS[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announce}</div>
        {chartFocused && <p className="text-xs text-foreground" aria-hidden="true">{describeRow(cursor)}</p>}

        <div className="flex flex-wrap gap-2" role="group" aria-label="Send a pattern to the storm wizard">
          {selected.map((id, i) => (
            <Button key={id + i} size="sm" variant="outline" onClick={() => onSelectPattern(id, nameOf(id))} aria-label={`Use ${nameOf(id)} in the storm wizard`}>
              Use {nameOf(id)} in wizard
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
