import { useEffect, useRef, memo, useState } from "react";
import type katexType from "katex";
import { ExternalLink, BookOpen, FlaskConical, Info, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type PatternType } from "@/lib/rainfallPatterns";
import { getPatternEquation, type PatternEquation } from "@/lib/patternEquations";
import { InteractiveEquationExplorer } from "./InteractiveEquationExplorer";
interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

const LatexRenderer = memo(function LatexRenderer({ 
  latex, 
  displayMode = true,
  className = ""
}: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          trust: true,
          strict: false
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        containerRef.current.innerHTML = `<span class="text-destructive text-sm">${latex}</span>`;
      }
    }
  }, [latex, displayMode]);

  return <div ref={containerRef} className={className} />;
});

interface PatternEquationDisplayProps {
  pattern: PatternType;
  showReferences?: boolean;
  compact?: boolean;
  totalDepth?: number;
  duration?: number;
}

export function PatternEquationDisplay({ 
  pattern, 
  showReferences = true,
  compact = false,
  totalDepth = 2.0,
  duration = 6.0
}: PatternEquationDisplayProps) {
  const equation = getPatternEquation(pattern);
  const [showExplorer, setShowExplorer] = useState(false);

  if (!equation) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No equation documentation available for this pattern</p>
        </CardContent>
      </Card>
    );
  }

  const categoryColor = {
    cumulative: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    intensity: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    empirical: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
  };

  const categoryLabel = {
    cumulative: 'Cumulative Distribution',
    intensity: 'Intensity Function',
    empirical: 'Empirical Method'
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryColor[equation.category]}>
            {categoryLabel[equation.category]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {equation.reference.citation} ({equation.reference.year})
          </span>
        </div>
        
        {equation.equations.slice(0, 1).map((eq, index) => (
          <div key={index} className="p-3 bg-muted/50 rounded-lg overflow-x-auto">
            <LatexRenderer latex={eq.latex} className="text-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {equation.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Mathematical formulation and methodology
            </CardDescription>
          </div>
          <Badge variant="outline" className={categoryColor[equation.category]}>
            {categoryLabel[equation.category]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Equations */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Equations
          </h4>
          {equation.equations.map((eq, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{eq.label}</Badge>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border overflow-x-auto">
                <LatexRenderer latex={eq.latex} />
              </div>
              <p className="text-sm text-muted-foreground pl-1">{eq.description}</p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Interactive Explorer Toggle */}
        <Collapsible open={showExplorer} onOpenChange={setShowExplorer}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Interactive Equation Explorer
              </span>
              {showExplorer ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <InteractiveEquationExplorer 
              pattern={pattern} 
              totalDepth={totalDepth}
              duration={duration}
            />
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Variables */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Variables
          </h4>
          <div className="grid gap-2">
            {equation.variables.map((variable, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="min-w-[80px] font-mono bg-muted px-2 py-1 rounded text-center shrink-0">
                  <LatexRenderer latex={variable.symbol} displayMode={false} className="text-xs" />
                </div>
                <span className="text-muted-foreground">{variable.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {equation.notes && (
          <>
            <Separator />
            <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">{equation.notes}</p>
            </div>
          </>
        )}

        {/* Reference */}
        {showReferences && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Reference
              </h4>
              <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                <p className="font-medium text-sm">{equation.reference.title}</p>
                <p className="text-sm text-muted-foreground">
                  {equation.reference.citation} ({equation.reference.year})
                </p>
                {equation.reference.link && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 mt-1 text-primary"
                    asChild
                  >
                    <a href={equation.reference.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface PatternEquationsPanelProps {
  selectedPattern: PatternType;
}

export function PatternEquationsPanel({ selectedPattern }: PatternEquationsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FlaskConical className="w-4 h-4" />
        <span>The mathematical basis for this pattern:</span>
      </div>
      <PatternEquationDisplay pattern={selectedPattern} />
    </div>
  );
}
