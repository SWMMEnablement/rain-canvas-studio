import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export type MacroRegion = 
  | "North America" 
  | "Latin America" 
  | "Europe" 
  | "Middle East" 
  | "Africa" 
  | "Asia-Pacific" 
  | "Universal";

// Maps individual COMPARISON_DATA region strings → macro-region
const REGION_TO_MACRO: Record<string, MacroRegion> = {
  'Universal': 'Universal',
  // North America
  'United States': 'North America', 'US (Pacific)': 'North America', 'US (NW Coast)': 'North America',
  'US (East/Central)': 'North America', 'US (Gulf/Atlantic)': 'North America',
  'US Midwest': 'North America', 'Texas, US': 'North America',
  'Florida NW, US': 'North America', 'Florida NE, US': 'North America',
  'Florida Central, US': 'North America', 'Florida SE, US': 'North America',
  'Florida SW, US': 'North America', 'Colorado, US': 'North America',
  'Canada': 'North America',
  // Latin America
  'Brazil': 'Latin America', 'Mexico': 'Latin America', 'Colombia': 'Latin America',
  'Chile': 'Latin America', 'Argentina': 'Latin America',
  // Europe
  'France': 'Europe', 'Europe': 'Europe', 'Germany': 'Europe', 'Germany/Europe': 'Europe',
  'UK': 'Europe', 'Czech Republic': 'Europe', 'Sweden': 'Europe',
  'Netherlands': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe',
  'Denmark': 'Europe', 'Norway': 'Europe', 'Belgium': 'Europe',
  'Switzerland': 'Europe', 'Poland': 'Europe', 'Finland': 'Europe',
  // Middle East
  'Saudi Arabia': 'Middle East', 'UAE': 'Middle East', 'Qatar': 'Middle East',
  'Oman': 'Middle East', 'Turkey': 'Middle East', 'Iran': 'Middle East',
  'Iraq': 'Middle East', 'Israel': 'Middle East', 'Bahrain': 'Middle East',
  'Kuwait': 'Middle East',
  // Africa
  'South Africa': 'Africa', 'Nigeria': 'Africa', 'Kenya': 'Africa',
  'Egypt': 'Africa', 'Ethiopia': 'Africa', 'Ghana': 'Africa',
  'Morocco': 'Africa', 'Mozambique': 'Africa', 'Tanzania': 'Africa',
  // Asia-Pacific
  'Japan': 'Asia-Pacific', 'South Korea': 'Asia-Pacific', 'China': 'Asia-Pacific',
  'India': 'Asia-Pacific', 'Malaysia': 'Asia-Pacific', 'Indonesia': 'Asia-Pacific',
  'Singapore': 'Asia-Pacific', 'Philippines': 'Asia-Pacific', 'Hong Kong': 'Asia-Pacific',
  'Taiwan': 'Asia-Pacific', 'Vietnam': 'Asia-Pacific', 'Thailand': 'Asia-Pacific',
  'Bangladesh': 'Asia-Pacific', 'Pakistan': 'Asia-Pacific', 'Sri Lanka': 'Asia-Pacific',
  'Fiji': 'Asia-Pacific', 'Australia': 'Asia-Pacific', 'New Zealand': 'Asia-Pacific',
};

export function toMacroRegion(region: string): MacroRegion {
  return REGION_TO_MACRO[region] || 'Universal';
}

// Simplified continent SVG paths (mercator-ish projection, viewBox 0 0 1000 500)
const MACRO_REGIONS: {
  id: MacroRegion;
  label: string;
  path: string;
  labelPos: { x: number; y: number };
  color: string;
  hoverColor: string;
  activeColor: string;
}[] = [
  {
    id: 'North America',
    label: 'N. America',
    path: 'M100,40 L180,35 L220,60 L250,80 L260,120 L250,160 L230,190 L210,200 L190,210 L160,220 L140,210 L120,190 L100,170 L80,140 L70,110 L75,80 L85,55 Z',
    labelPos: { x: 165, y: 130 },
    color: 'hsl(var(--primary) / 0.12)',
    hoverColor: 'hsl(var(--primary) / 0.25)',
    activeColor: 'hsl(var(--primary) / 0.40)',
  },
  {
    id: 'Latin America',
    label: 'L. America',
    path: 'M190,220 L220,225 L240,240 L260,260 L270,290 L280,320 L280,360 L270,390 L250,420 L230,440 L210,450 L195,440 L185,410 L180,370 L175,330 L175,290 L180,260 L185,240 Z',
    labelPos: { x: 225, y: 330 },
    color: 'hsl(210 80% 55% / 0.12)',
    hoverColor: 'hsl(210 80% 55% / 0.25)',
    activeColor: 'hsl(210 80% 55% / 0.40)',
  },
  {
    id: 'Europe',
    label: 'Europe',
    path: 'M430,50 L470,45 L510,50 L540,65 L550,90 L545,115 L530,135 L510,150 L485,155 L460,150 L440,140 L425,120 L420,95 L422,70 Z',
    labelPos: { x: 485, y: 100 },
    color: 'hsl(145 60% 45% / 0.12)',
    hoverColor: 'hsl(145 60% 45% / 0.25)',
    activeColor: 'hsl(145 60% 45% / 0.40)',
  },
  {
    id: 'Middle East',
    label: 'Middle East',
    path: 'M540,140 L580,130 L620,140 L640,160 L640,190 L630,210 L610,220 L580,225 L555,215 L540,195 L535,170 Z',
    labelPos: { x: 588, y: 180 },
    color: 'hsl(35 90% 55% / 0.12)',
    hoverColor: 'hsl(35 90% 55% / 0.25)',
    activeColor: 'hsl(35 90% 55% / 0.40)',
  },
  {
    id: 'Africa',
    label: 'Africa',
    path: 'M440,170 L480,165 L520,175 L540,200 L545,240 L540,290 L530,340 L510,380 L490,400 L465,405 L445,395 L430,370 L420,330 L415,280 L420,230 L425,195 Z',
    labelPos: { x: 478, y: 290 },
    color: 'hsl(15 85% 55% / 0.12)',
    hoverColor: 'hsl(15 85% 55% / 0.25)',
    activeColor: 'hsl(15 85% 55% / 0.40)',
  },
  {
    id: 'Asia-Pacific',
    label: 'Asia-Pacific',
    path: 'M600,50 L700,40 L780,50 L850,70 L900,100 L920,140 L910,190 L880,230 L850,260 L810,280 L770,290 L740,310 L720,340 L700,370 L720,390 L760,380 L800,360 L840,350 L870,340 L880,310 L870,280 L850,260 L900,260 L930,280 L940,320 L930,350 L910,370 L880,380 L850,390 L820,400 L790,400 L760,400 L730,410 L700,400 L680,370 L660,330 L650,280 L640,240 L635,210 L640,170 L620,145 L580,130 L600,100 L610,70 Z',
    labelPos: { x: 760, y: 180 },
    color: 'hsl(270 60% 55% / 0.12)',
    hoverColor: 'hsl(270 60% 55% / 0.25)',
    activeColor: 'hsl(270 60% 55% / 0.40)',
  },
];

interface PatternCoverageMapProps {
  regionCounts: Record<MacroRegion, number>;
  activeMacro: MacroRegion | null;
  onMacroClick: (macro: MacroRegion | null) => void;
  totalPatterns: number;
}

export function PatternCoverageMap({ regionCounts, activeMacro, onMacroClick, totalPatterns }: PatternCoverageMapProps) {
  const universalCount = regionCounts['Universal'] || 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Globe className="w-4 h-4 text-primary" />
          Geographic Coverage
        </div>
        {activeMacro && (
          <button
            onClick={() => onMacroClick(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear map filter
          </button>
        )}
      </div>

      <div className="relative rounded-lg border bg-muted/20 overflow-hidden">
        <svg viewBox="0 0 1000 460" className="w-full h-auto" style={{ maxHeight: 280 }}>
          {/* Grid lines for visual interest */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
            <line key={`vl-${x}`} x1={x} y1={0} x2={x} y2={460} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 8" opacity={0.3} />
          ))}
          {[100, 200, 300, 400].map(y => (
            <line key={`hl-${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 8" opacity={0.3} />
          ))}

          {/* Continent shapes */}
          {MACRO_REGIONS.map(region => {
            const count = regionCounts[region.id] || 0;
            const isActive = activeMacro === region.id;
            const fill = isActive ? region.activeColor : region.color;

            return (
              <g
                key={region.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onMacroClick(isActive ? null : region.id)}
              >
                <path
                  d={region.path}
                  fill={fill}
                  stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={isActive ? 2 : 1}
                  className="transition-all duration-200 hover:opacity-90"
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))' : undefined,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.target as SVGPathElement).style.fill = region.hoverColor;
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.target as SVGPathElement).style.fill = region.color;
                  }}
                />
                {/* Label */}
                <text
                  x={region.labelPos.x}
                  y={region.labelPos.y - 10}
                  textAnchor="middle"
                  className="text-[11px] font-semibold fill-foreground pointer-events-none select-none"
                >
                  {region.label}
                </text>
                {/* Count badge */}
                <text
                  x={region.labelPos.x}
                  y={region.labelPos.y + 8}
                  textAnchor="middle"
                  className="text-[13px] font-bold fill-primary pointer-events-none select-none"
                >
                  {count}
                </text>
              </g>
            );
          })}

          {/* Equator */}
          <line x1={0} y1={230} x2={1000} y2={230} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} strokeDasharray="6 4" opacity={0.25} />
        </svg>
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {MACRO_REGIONS.map(r => {
          const count = regionCounts[r.id] || 0;
          const isActive = activeMacro === r.id;
          return (
            <Badge
              key={r.id}
              variant={isActive ? 'default' : 'outline'}
              className={`text-[10px] px-1.5 cursor-pointer transition-colors ${
                isActive ? '' : 'hover:bg-accent'
              }`}
              onClick={() => onMacroClick(isActive ? null : r.id)}
            >
              {r.label} ({count})
            </Badge>
          );
        })}
        {universalCount > 0 && (
          <Badge
            variant={activeMacro === 'Universal' ? 'default' : 'outline'}
            className="text-[10px] px-1.5 cursor-pointer transition-colors hover:bg-accent"
            onClick={() => onMacroClick(activeMacro === 'Universal' ? null : 'Universal')}
          >
            Universal ({universalCount})
          </Badge>
        )}
      </div>
    </div>
  );
}
