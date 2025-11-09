import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PatternType = 'block' | 'scs2' | 'double' | 'custom';

interface PatternOption {
  id: PatternType;
  name: string;
  icon: string;
  description: string;
}

const patterns: PatternOption[] = [
  {
    id: 'block',
    name: 'Block Pattern',
    icon: '▯',
    description: 'Uniform intensity throughout the storm duration. Simple and commonly used for preliminary analysis.',
  },
  {
    id: 'scs2',
    name: 'SCS Type II',
    icon: '⏐',
    description: 'Standard NRCS (SCS) 24-hour rainfall distribution with peak intensity around the middle of the storm. Most common for design storms in the US.',
  },
  {
    id: 'double',
    name: 'Double Peak',
    icon: '⩗',
    description: 'Pattern with two intensity peaks, simulating complex storm systems with multiple convective cells.',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✎',
    description: 'Draw your own rainfall distribution using the interactive chart. Click and drag to adjust intensities.',
  },
];

interface PatternSelectorProps {
  selectedPattern: PatternType;
  onPatternChange: (pattern: PatternType) => void;
}

export function PatternSelector({ selectedPattern, onPatternChange }: PatternSelectorProps) {
  const selectedPatternInfo = patterns.find(p => p.id === selectedPattern);

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Pattern Type</CardTitle>
        <CardDescription>Select a rainfall distribution pattern</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onPatternChange(pattern.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-300
                flex flex-col items-center gap-2 text-center
                hover:scale-105 hover:shadow-md
                ${
                  selectedPattern === pattern.id
                    ? 'border-primary bg-accent shadow-md'
                    : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="text-3xl">{pattern.icon}</div>
              <div className="text-sm font-medium">{pattern.name}</div>
            </button>
          ))}
        </div>
        
        {selectedPatternInfo && (
          <div className="rounded-lg bg-accent/50 p-4 border-l-4 border-primary">
            <p className="text-sm">
              <strong>{selectedPatternInfo.name}:</strong> {selectedPatternInfo.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
