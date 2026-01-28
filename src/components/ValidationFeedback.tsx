import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Gauge } from "lucide-react";
import { type ValidationWarning } from "@/lib/stormValidation";
import { cn } from "@/lib/utils";

interface ValidationFeedbackProps {
  warnings: ValidationWarning[];
  isValid: boolean;
  intensityClass?: { label: string; color: string };
  estimatedReturnPeriod?: string;
  className?: string;
}

export function ValidationFeedback({ 
  warnings, 
  isValid, 
  intensityClass,
  estimatedReturnPeriod,
  className 
}: ValidationFeedbackProps) {
  const errors = warnings.filter(w => w.type === 'error');
  const warningItems = warnings.filter(w => w.type === 'warning');
  const infoItems = warnings.filter(w => w.type === 'info');

  if (warnings.length === 0 && isValid) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Intensity indicator when valid */}
        {intensityClass && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Storm Intensity:</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("font-medium", intensityClass.color)}>
                {intensityClass.label}
              </Badge>
              {estimatedReturnPeriod && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="text-xs">
                        ~{estimatedReturnPeriod}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimated return period (approximate)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border border-primary/20">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Parameters look good!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Intensity indicator */}
      {intensityClass && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Storm Intensity:</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("font-medium", intensityClass.color)}>
              {intensityClass.label}
            </Badge>
            {estimatedReturnPeriod && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">
                      ~{estimatedReturnPeriod}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated return period (approximate)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Parameters</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warningItems.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Attention</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-warning/80">
              {warningItems.map((warning, index) => (
                <li key={index} className="text-sm">{warning.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Info */}
      {infoItems.length > 0 && (
        <Alert className="border-primary/50 bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Information</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2 text-primary/80">
              {infoItems.map((info, index) => (
                <li key={index} className="text-sm">{info.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
