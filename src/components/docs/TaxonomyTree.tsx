import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, FolderTree, Layers } from "lucide-react";
import { TAXONOMY_TREE, type TaxonomyNode } from "./taxonomyData";
import { cn } from "@/lib/utils";

function TreeNode({ node, depth = 0 }: { node: TaxonomyNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const patternCount = countPatterns(node);

  return (
    <div className={cn("border-l-2 border-muted", depth > 0 && "ml-4")}>
      {hasChildren ? (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/50 rounded-r-md transition-colors text-left group">
            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform shrink-0", open && "rotate-90")} />
            <span className="font-medium text-sm">{node.id}.</span>
            <span className="text-sm font-medium">{node.label}</span>
            <Badge variant="outline" className="ml-auto text-[10px] px-1.5 shrink-0">
              {patternCount}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {node.description && (
              <p className="text-xs text-muted-foreground ml-10 mb-1">{node.description}</p>
            )}
            {node.children!.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="px-3 py-1.5 ml-6">
          <div className="flex items-center gap-2">
            <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-sm">{node.id}. {node.label}</span>
            {node.patterns && (
              <Badge variant="outline" className="ml-auto text-[10px] px-1.5 shrink-0">
                {node.patterns.length}
              </Badge>
            )}
          </div>
          {node.patterns && node.patterns.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 ml-5">
              {node.patterns.map(p => (
                <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function countPatterns(node: TaxonomyNode): number {
  let count = node.patterns?.length ?? 0;
  if (node.children) {
    for (const child of node.children) {
      count += countPatterns(child);
    }
  }
  return count;
}

export function TaxonomyTree() {
  const totalPatterns = TAXONOMY_TREE.reduce((sum, n) => sum + countPatterns(n), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-primary" />
          Design Storm Taxonomy
        </CardTitle>
        <CardDescription>
          Hierarchical classification of {totalPatterns} design storm methods into 5 families
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {TAXONOMY_TREE.map(node => (
          <TreeNode key={node.id} node={node} />
        ))}
      </CardContent>
    </Card>
  );
}
