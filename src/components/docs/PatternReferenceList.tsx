import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { PatternReferenceCard } from "./PatternReferenceCard";
import { PATTERN_REFERENCE_DATA } from "./patternReferenceData";

const REGION_ORDER = [
  "US Agency",
  "UK/ICM",
  "European",
  "Nordic",
  "International",
  "Asian",
  "Middle East",
  "African",
  "Latin American",
  "Oceania",
];

export function PatternReferenceList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const regions = useMemo(() => {
    const unique = Array.from(new Set(PATTERN_REFERENCE_DATA.map((p) => p.region)));
    return REGION_ORDER.filter((r) => unique.includes(r)).concat(
      unique.filter((r) => !REGION_ORDER.includes(r))
    );
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return PATTERN_REFERENCE_DATA.filter((p) => {
      if (selectedRegions.length > 0 && !selectedRegions.includes(p.region)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.characteristicShape.toLowerCase().includes(q) ||
        p.applicableRegions.some((r) => r.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedRegions]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRegions([]);
  };

  const hasFilters = searchQuery.length > 0 || selectedRegions.length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patterns by name, region, shape..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Region filter badges */}
      <div className="flex flex-wrap gap-1.5">
        {regions.map((region) => {
          const count = PATTERN_REFERENCE_DATA.filter((p) => p.region === region).length;
          const active = selectedRegions.includes(region);
          return (
            <Badge
              key={region}
              variant={active ? "default" : "outline"}
              className={`cursor-pointer text-xs transition-all ${
                active ? "" : "hover:bg-muted"
              }`}
              onClick={() => toggleRegion(region)}
            >
              {region} ({count})
            </Badge>
          );
        })}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {PATTERN_REFERENCE_DATA.length} patterns
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No patterns match your search. Try a different term or clear filters.
        </p>
      ) : (
        filtered.map((pattern) => (
          <PatternReferenceCard key={pattern.id} pattern={pattern} />
        ))
      )}
    </div>
  );
}
