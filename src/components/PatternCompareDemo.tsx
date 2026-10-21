import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, LayersIcon, Link2 } from "lucide-react";
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
const STEP_OPTIONS = [1, 5, 10, 15, 30, 60];
function readNum(key: string, def: number, min: number, max: number) {
  try {
    const v = parseFloat(new URLSearchParams(window.location.search).get(key) ?? "");
    return Number.isFinite(v) && v >= min && v <= max ? v : def;
  } catch { return def; }
}

interface Props {
  onSelectPattern: (patternId: string, patternName: string) => void;
}

export const PatternCompareDemo = ({ onSelectPattern }: Props) => {
  const options = useMemo(
    () => [...patterns].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const [DEPTH_MM, setDepth] = useState(() => readNum("cmpDepthMm", 50, 1, 2000));
  const [DURATION_H, setDuration] = useState(() => readNum("cmpDurationH", 6, 0.5, 72));
  const [STEP_MIN, setStep] = useState(() => { const v = readNum("cmpStepMin", 15, 1, 60); return STEP_OPTIONS.includes(v) ? v : 15; });
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
  }, [selected, DEPTH_MM, DURATION_H, STEP_MIN]);

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
      PageUp: cursor + Math.max(1, Math.round(60 / STEP_MIN)), PageDown: cursor - Math.max(1, Math.round(60 / STEP_MIN)), Home: 0, End: last,
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

  /** Open a printable, self-documenting report page (chart + parameters + metrics + data table). */
  const openReport = () => {
    const r = buildSvg();
    if (!r) return;
    const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const dtH = STEP_MIN / 60;
    const metrics = selected.map((id) => {
      let peak = 0, at = "0", sum = 0;
      data.forEach((row) => { const v = Number(row[id]); sum += v; if (v > peak) { peak = v; at = String(row.time); } });
      const vol = sum * dtH;
      return { name: nameOf(id), peak, at, vol, ratio: peak / (DEPTH_MM / DURATION_H) };
    });
    const link = new URL(window.location.origin + "/");
    link.searchParams.set("compare", selected.join(","));
    link.searchParams.set("cmpDepthMm", String(DEPTH_MM));
    link.searchParams.set("cmpDurationH", String(DURATION_H));
    link.searchParams.set("cmpStepMin", String(STEP_MIN));
    link.hash = "compare";
    const names = selected.map(nameOf);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pattern comparison report — ${esc(names.join(", "))}</title>
<style>body{font-family:Georgia,serif;color:#111;background:#fff;max-width:900px;margin:24px auto;padding:0 24px;font-size:13px}h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #999}table{border-collapse:collapse;width:100%;font-family:monospace;font-size:12px}th,td{border:1px solid #bbb;padding:3px 6px;text-align:right}th{background:#eee}td:first-child,th:first-child{text-align:left}.fig svg{max-width:100%;height:auto}.no-print{margin:12px 0}@media print{.no-print{display:none}}</style></head><body>
<div class="no-print"><button onclick="window.print()">Print / Save as PDF</button></div>
<h1>Design storm temporal pattern comparison</h1>
<p>Generated ${esc(new Date().toISOString())} · World Rainfall Pattern Painter</p>
<h2>1. Inputs</h2><table><tr><th>Parameter</th><th>Value</th></tr>
<tr><td>Total depth</td><td>${DEPTH_MM} mm</td></tr><tr><td>Duration</td><td>${DURATION_H} h</td></tr><tr><td>Time step</td><td>${STEP_MIN} min</td></tr>
<tr><td>Patterns</td><td>${esc(names.join("; "))}</td></tr><tr><td>Permalink</td><td style="word-break:break-all">${esc(link.toString())}</td></tr></table>
<h2>2. Figure 1 — Hyetograph overlay (intensity mm/h vs time h)</h2><div class="fig">${r.svg}</div>
<h2>3. Summary metrics</h2><table><tr><th>Pattern</th><th>Peak i (mm/h)</th><th>Time to peak (h)</th><th>Peak / mean ratio</th><th>Σ i·Δt (mm)</th></tr>
${metrics.map((m) => `<tr><td>${esc(m.name)}</td><td>${m.peak.toFixed(3)}</td><td>${m.at}</td><td>${m.ratio.toFixed(2)}</td><td>${m.vol.toFixed(3)}</td></tr>`).join("")}</table>
<p>Mean intensity \u012B = P / D = ${(DEPTH_MM / DURATION_H).toFixed(3)} mm/h. Volume check Σ i·Δt with Δt = ${dtH.toFixed(4)} h should equal ${DEPTH_MM} mm.</p>
<h2>4. Tabulated intensities (mm/h)</h2><table><tr><th>t (h)</th>${names.map((n) => `<th>${esc(n)}</th>`).join("")}</tr>
${data.map((row) => `<tr><td>${row.time}</td>${selected.map((id) => `<td>${Number(row[id]).toFixed(3)}</td>`).join("")}</tr>`).join("")}</table>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow pop-ups to open the report"); return; }
    w.document.write(html);
    w.document.close();
  };

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

        <fieldset className="grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">Storm inputs for the comparison</legend>
          <div className="space-y-1">
            <label htmlFor={`${uid}-depth`} className="text-xs uppercase tracking-wide text-muted-foreground">Depth (mm)</label>
            <input id={`${uid}-depth`} type="number" min={1} max={2000} step={1} value={DEPTH_MM}
              onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 1 && v <= 2000) setDepth(v); }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${uid}-dur`} className="text-xs uppercase tracking-wide text-muted-foreground">Duration (h)</label>
            <input id={`${uid}-dur`} type="number" min={0.5} max={72} step={0.5} value={DURATION_H}
              onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 0.5 && v <= 72) setDuration(v); }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor={`${uid}-step`} className="text-xs uppercase tracking-wide text-muted-foreground">Time step (min)</label>
            <Select value={String(STEP_MIN)} onValueChange={(v) => setStep(Number(v))}>
              <SelectTrigger id={`${uid}-step`} aria-label={`Time step: ${STEP_MIN} minutes`}><SelectValue /></SelectTrigger>
              <SelectContent>{STEP_OPTIONS.map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}</SelectContent>
            </Select>
          </div>
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
          <Button size="sm" variant="outline" onClick={openReport} aria-label="Open printable comparison report with chart, inputs, metrics and data table">
            <FileText className="w-4 h-4 mr-1" aria-hidden="true" /> Report
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
