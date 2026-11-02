import { CheckCircle2, AlertTriangle } from "lucide-react";
import { type UnitSystem, getDepthUnit } from "@/lib/unitConversions";
import { type PatternType, generateRainfallDataDetailed } from "@/lib/rainfallPatterns";
import { getPatternProvenance, CONFIDENCE_LABELS } from "@/lib/patternProvenance";

interface StormCheckPanelProps {
  /** Engine output in display units per hour. */
  intensities: number[];
  requestedDepth: number;
  durationHr: number;
  timeStepMin: number;
  unitSystem: UnitSystem;
  patternName: string;
  /** Pattern id, used to report calculator adjustments and source confidence. */
  patternId?: string;
  source: "api" | "local";
}

const FALLBACK_LABEL = {
  none: "Formula used as published",
  depth_adjusted: "Depth scaled to match (shape unchanged)",
  single_interval: "Single block (one interval)",
  refined_grid: "Built on a finer grid, then summed",
  rescaled: "Invalid values removed and rescaled",
  uniform: "Uniform block substituted",
} as const;

export const RELEASE_VERSION = "3.1.0";

/** Shows that the storm about to be exported is the one that was requested. */
export function StormCheckPanel({ intensities, requestedDepth, durationHr, timeStepMin, unitSystem, patternName, patternId, source }: StormCheckPanelProps) {
  // Same shared calculator the API runs, so the adjustment reported here applies to API results too.
  const gen = patternId && patternId !== "custom" && durationHr > 0 && timeStepMin > 0
    ? generateRainfallDataDetailed(patternId as PatternType, 1, durationHr, timeStepMin)
    : null;
  const prov = patternId && patternId !== "custom" ? getPatternProvenance(patternId, patternName) : null;
  const shapeChanged = gen?.fallback === "rescaled" || gen?.fallback === "uniform";
  const unit = getDepthUnit(unitSystem);
  const dec = unitSystem === "USA" ? 3 : 2;
  const generated = intensities.reduce((s, v) => s + (Number.isFinite(v) ? v : 0) * (timeStepMin / 60), 0);
  const representedMin = intensities.length * timeStepMin;
  const requestedMin = Math.round(durationHr * 60);
  const allFinite = intensities.every((v) => Number.isFinite(v) && v >= 0);
  const depthErr = requestedDepth > 0 ? Math.abs(generated - requestedDepth) / requestedDepth : 0;
  const checks = [
    { label: "Depth balance (≤ 1%)", ok: depthErr <= 0.01 },
    { label: "Duration matches", ok: representedMin === requestedMin },
    { label: "All values finite and ≥ 0", ok: allFinite },
    ...(gen ? [{ label: "Pattern shape kept", ok: !shapeChanged }] : []),
  ];
  const allOk = checks.every((c) => c.ok);
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-mono text-right">{v}</dd></div>
  );

  return (
    <section aria-label="Storm check before export" className="rounded-lg border bg-muted/30 p-3 text-xs space-y-2">
      <div className="flex items-center gap-2 font-semibold text-sm">
        {allOk ? <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden /> : <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden />}
        Storm check {allOk ? "— ready to export" : "— review before export"}
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {row("Requested depth", `${requestedDepth.toFixed(dec)} ${unit}`)}
        {row("Generated depth", `${generated.toFixed(dec)} ${unit} (${(depthErr * 100).toFixed(2)}%)`)}
        {row("Requested duration", `${requestedMin} min`)}
        {row("Represented duration", `${representedMin} min (${intensities.length} × ${timeStepMin} min)`)}
        {row("Interval convention", "Value = mean intensity over interval; time = interval start")}
        {row("Source", `${patternName} · engine ${source === "api" ? "via API" : "in browser"} · v${RELEASE_VERSION}`)}
        {gen && row("Calculator", FALLBACK_LABEL[gen.fallback])}
        {prov && row("Confidence", CONFIDENCE_LABELS[prov.confidence])}
      </dl>
      {gen?.reason && (
        <p role="note" className={shapeChanged ? "text-destructive" : "text-muted-foreground"}>
          <span className="font-medium">Why: </span>{gen.reason}
        </p>
      )}
      {prov?.approximation && (
        <p className="text-muted-foreground"><span className="font-medium">How the app differs from the source: </span>{prov.approximation}</p>
      )}
      <ul className="flex flex-wrap gap-3">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "text-primary" : "text-destructive"}>{c.ok ? "✓" : "✗"} {c.label}</li>
        ))}
      </ul>
    </section>
  );
}
