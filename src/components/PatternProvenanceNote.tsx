import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CONFIDENCE_LABELS,
  CONFIDENCE_MEANING,
  getPatternProvenance,
} from "@/lib/patternProvenance";

interface Props {
  id: string;
  name?: string;
  description?: string;
  /** Show the meaning of the confidence level as text instead of only in a tooltip. */
  explain?: boolean;
  className?: string;
  /** Set false inside buttons or links, where a focusable tooltip trigger would be nested. */
  tooltip?: boolean;
}

const VARIANT = { high: "default", medium: "secondary", low: "outline" } as const;

/** Source note and confidence badge for one pattern. */
export function PatternProvenanceNote({ id, name, description, explain = false, className = "", tooltip = true }: Props) {
  const { source, confidence, approximation } = getPatternProvenance(id, name, description);
  const badge = (
    <Badge
      variant={VARIANT[confidence]}
      className="text-xs"
      aria-label={`Confidence ${CONFIDENCE_LABELS[confidence]}: ${CONFIDENCE_MEANING[confidence]}`}
    >
      Confidence: {CONFIDENCE_LABELS[confidence]}
    </Badge>
  );
  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {tooltip ? (
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex">{badge}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{CONFIDENCE_MEANING[confidence]}</TooltipContent>
          </Tooltip>
        ) : (
          badge
        )}
      </div>
      <p>
        <span className="font-medium text-foreground">Source:</span> {source}
      </p>
      {approximation && (
        <p>
          <span className="font-medium text-foreground">How the app differs:</span> {approximation}
        </p>
      )}
      {explain && <p className="italic">{CONFIDENCE_MEANING[confidence]}</p>}
    </div>
  );
}
