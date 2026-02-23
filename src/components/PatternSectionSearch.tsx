import { useState, useMemo, Children, isValidElement, ReactNode, ReactElement } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PatternSectionSearchProps {
  children: ReactNode;
  placeholder?: string;
}

/**
 * Wraps a list of pattern card children and provides a local search filter.
 * Expects children to be a mix of:
 *  - <div> pattern cards (with text content to search)
 *  - <p> intro paragraphs
 *  - reference/info boxes
 * Only <div> cards with bg-muted/50 are filtered; everything else passes through.
 */
export function PatternSectionSearch({ children, placeholder = "Filter storms in this section..." }: PatternSectionSearchProps) {
  const [query, setQuery] = useState("");

  const { filteredChildren, totalCards, matchCount } = useMemo(() => {
    const q = query.toLowerCase().trim();
    let totalCards = 0;
    let matchCount = 0;

    const filtered = Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      const el = child as ReactElement<{ className?: string; children?: ReactNode }>;

      // Check if this is a grid container with pattern cards
      if (el.props.className?.includes("grid gap-4") || el.props.className?.includes("grid gap-3")) {
        const gridChildren = Children.map(el.props.children, (gridChild) => {
          if (!isValidElement(gridChild)) return gridChild;
          const gc = gridChild as ReactElement<{ className?: string; children?: ReactNode }>;

          // Pattern cards have bg-muted/50
          if (gc.props.className?.includes("bg-muted")) {
            totalCards++;
            if (!q) {
              matchCount++;
              return gridChild;
            }
            // Extract all text content for search
            const text = extractText(gc.props.children).toLowerCase();
            if (text.includes(q)) {
              matchCount++;
              return gridChild;
            }
            return null; // filtered out
          }
          return gridChild;
        });

        // Clone grid with filtered children
        const validGridChildren = gridChildren?.filter(Boolean);
        if (q && validGridChildren?.length === 0) return null;
        return <div className={el.props.className}>{validGridChildren}</div>;
      }

      return child;
    });

    return { filteredChildren: filtered, totalCards, matchCount };
  }, [children, query]);

  // Only show search if there are 3+ cards
  if (totalCards < 3) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
        {query && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {matchCount}/{totalCards}
          </span>
        )}
      </div>
      {query && matchCount === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No storms match "{query}" in this section.
        </p>
      )}
      {filteredChildren}
    </div>
  );
}

/** Recursively extract text content from React children */
function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}
