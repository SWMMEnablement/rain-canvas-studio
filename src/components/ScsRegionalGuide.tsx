import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function ScsRegionalGuide() {
  const regions = [
    {
      type: "Type IA",
      color: "bg-blue-500",
      states: "Pacific Northwest coastal areas",
      description: "Washington, Oregon coastal regions",
    },
    {
      type: "Type I",
      color: "bg-cyan-500",
      states: "Pacific maritime climate",
      description: "California, Hawaii, Alaska coastal areas",
    },
    {
      type: "Type II",
      color: "bg-green-500",
      states: "Most of the continental US",
      description: "Midwest, Northeast, Mid-Atlantic, Plains, Mountain states",
    },
    {
      type: "Type III",
      color: "bg-orange-500",
      states: "Gulf Coast and Atlantic coastal areas",
      description: "Texas, Louisiana, Mississippi, Alabama, Florida, Georgia, South Carolina coastal regions",
    },
  ];

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          SCS Pattern Regional Guide
        </CardTitle>
        <CardDescription>
          Select the appropriate NRCS (SCS) pattern based on your project location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Map Representation */}
        <div className="bg-muted/30 rounded-lg p-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map((region) => (
              <div
                key={region.type}
                className="flex gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className={`w-4 h-4 rounded-full ${region.color} mt-1 flex-shrink-0`} />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    SCS {region.type}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Climate:</strong> {region.states}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {region.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Notes */}
        <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
          <h4 className="font-semibold text-sm mb-2">Usage Guidelines:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Type IA: Wettest maritime climates, earliest peak</li>
            <li>Type I: Pacific maritime, early peak (~40% duration)</li>
            <li>Type II: Default for most US locations, mid-storm peak (~50%)</li>
            <li>Type III: High-intensity tropical storms, sharpest peak (~50%)</li>
          </ul>
        </div>

        {/* Map Legend */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Based on NRCS Technical Release 55 (TR-55) guidelines
        </div>
      </CardContent>
    </Card>
  );
}
