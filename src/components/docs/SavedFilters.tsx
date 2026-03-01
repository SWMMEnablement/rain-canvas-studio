import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bookmark, Plus, Trash2, X } from "lucide-react";
import type { MacroRegion } from "./PatternCoverageMap";

export interface FilterState {
  search: string;
  filterClimate: string;
  filterRegion: string;
  filterFamily: string;
  filterMacro: MacroRegion | null;
}

interface SavedFilter {
  name: string;
  filters: FilterState;
}

const STORAGE_KEY = "pattern-search-saved-filters";

function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistFilters(filters: SavedFilter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

function describeFilter(f: FilterState): string {
  const parts: string[] = [];
  if (f.search) parts.push(`"${f.search}"`);
  if (f.filterRegion !== "all") parts.push(f.filterRegion);
  if (f.filterClimate !== "all") parts.push(f.filterClimate);
  if (f.filterFamily !== "all") parts.push(f.filterFamily);
  if (f.filterMacro) parts.push(f.filterMacro);
  return parts.join(", ") || "No filters";
}

interface SavedFiltersProps {
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  hasActiveFilters: boolean;
}

export function SavedFilters({ currentFilters, onApply, hasActiveFilters }: SavedFiltersProps) {
  const [saved, setSaved] = useState<SavedFilter[]>(loadSavedFilters);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { persistFilters(saved); }, [saved]);

  const handleSave = () => {
    const name = newName.trim();
    if (!name || !hasActiveFilters) return;
    setSaved(prev => [...prev.filter(s => s.name !== name), { name, filters: { ...currentFilters } }]);
    setNewName("");
  };

  const handleDelete = (name: string) => {
    setSaved(prev => prev.filter(s => s.name !== name));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Bookmark className="w-4 h-4" />
          Saved{saved.length > 0 && ` (${saved.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <p className="text-xs font-medium mb-2">Saved Filters</p>

        {saved.length === 0 && (
          <p className="text-xs text-muted-foreground mb-3">No saved filters yet. Apply some filters, then save them here.</p>
        )}

        {saved.length > 0 && (
          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
            {saved.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start h-auto py-1.5 px-2 text-left"
                  onClick={() => { onApply(s.filters); setOpen(false); }}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-medium block truncate">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground block truncate">{describeFilter(s.filters)}</span>
                  </div>
                </Button>
                <button
                  onClick={() => handleDelete(s.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex gap-1.5">
            <Input
              placeholder="Filter name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              className="h-7 text-xs"
            />
            <Button size="sm" className="h-7 px-2" onClick={handleSave} disabled={!newName.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
