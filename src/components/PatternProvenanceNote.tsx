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
}

const VARIANT = { high: "default", medium: "secondary", low: "outline" } as const;

/** Source note and confidence badge for one pattern. */
export function PatternProvenanceNote({ id, name, description, explain = false, className = "" }: Props) {
  const { source, confidence } = getPatternProvenance(id, name, description);
  return (
    <div className={`text-xs text-muted-foreground space-y-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <span tabIndex={0} className="inline-flex">
              <Badge
                variant={VARIANT[confidence]}
                className="text-xs"
                aria-label={`Confidence ${CONFIDENCE_LABELS[confidence]}: ${CONFIDENCE_MEANING[confidence]}`}
              >
                Confidence: {CONFIDENCE_LABELS[confidence]}
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{CONFIDENCE_MEANING[confidence]}</TooltipContent>
        </Tooltip>
      </div>
      <p>
        <span className="font-medium text-foreground">Source:</span> {source}
      </p>
      {explain && <p className="italic">{CONFIDENCE_MEANING[confidence]}</p>}
    </div>
  );
}
