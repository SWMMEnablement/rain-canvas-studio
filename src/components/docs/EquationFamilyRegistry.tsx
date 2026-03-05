import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Download } from "lucide-react";
import { EQUATION_FAMILIES } from "./taxonomyData";
import { downloadEquationsMarkdown } from "@/lib/equationsMarkdownExport";
import { patternEquations } from "@/lib/patternEquations";
import { toast } from "sonner";

function LaTeXBlock({ latex }: { latex: string }) {
  // Simple LaTeX-to-HTML for display (KaTeX would be ideal but we keep it light)
  return (
    <code className="block bg-muted/50 px-3 py-2 rounded text-sm font-mono whitespace-pre-wrap break-all">
      {latex}
    </code>
  );
}

export function EquationFamilyRegistry() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Equation Family Registry
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>{EQUATION_FAMILIES.length} canonical equation families covering all {EQUATION_FAMILIES.reduce((s, f) => s + f.members.length, 0)}+ design storm methods</span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 ml-4 shrink-0"
            onClick={() => {
              downloadEquationsMarkdown();
              toast.success(`Downloaded ${patternEquations.length} equations as Markdown`);
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download All Equations (.md)
          </Button>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {EQUATION_FAMILIES.map(family => (
            <AccordionItem key={family.id} value={family.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-3 text-left">
                  <Badge variant="outline" className="shrink-0 font-mono text-xs">
                    {family.id.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{family.name}</p>
                    <p className="text-xs text-muted-foreground">{family.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                {/* Equations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Equations</h4>
                  {family.equations.map((eq, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs font-medium text-foreground">{eq.label}</p>
                      <LaTeXBlock latex={eq.latex} />
                      <p className="text-xs text-muted-foreground">{eq.description}</p>
                    </div>
                  ))}
                </div>

                {/* Variables */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Variables</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {family.variables.map((v, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <code className="font-mono text-primary shrink-0">{v.symbol}</code>
                        <span className="text-muted-foreground">— {v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Members</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {family.members.map(m => (
                      <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 italic">
                  {family.notes}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
