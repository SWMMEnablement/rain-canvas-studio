import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDepth, formatIntensity, convertDepth, convertIntensity, type UnitSystem } from "@/lib/unitConversions";
import { Scale } from "lucide-react";

interface UnitComparisonTableProps {
  depth: number;
  duration: number;
  unitSystem: UnitSystem;
}

export function UnitComparisonTable({ depth, duration, unitSystem }: UnitComparisonTableProps) {
  // Calculate average intensity
  const avgIntensity = depth / duration;

  // Get values in both systems
  const depthUSA = unitSystem === 'USA' ? depth : convertDepth(depth, 'SI', 'USA');
  const depthSI = unitSystem === 'SI' ? depth : convertDepth(depth, 'USA', 'SI');
  const intensityUSA = unitSystem === 'USA' ? avgIntensity : convertIntensity(avgIntensity, 'SI', 'USA');
  const intensitySI = unitSystem === 'SI' ? avgIntensity : convertIntensity(avgIntensity, 'USA', 'SI');

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Unit Comparison
        </CardTitle>
        <CardDescription>Current parameters in both unit systems</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Parameter</TableHead>
              <TableHead>USA Units</TableHead>
              <TableHead>SI Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Total Rainfall Depth</TableCell>
              <TableCell className="font-mono">{formatDepth(depthUSA, 'USA')}</TableCell>
              <TableCell className="font-mono">{formatDepth(depthSI, 'SI')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Storm Duration</TableCell>
              <TableCell className="font-mono">{duration.toFixed(1)} hours</TableCell>
              <TableCell className="font-mono">{duration.toFixed(1)} hours</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Average Intensity</TableCell>
              <TableCell className="font-mono">{formatIntensity(intensityUSA, 'USA')}</TableCell>
              <TableCell className="font-mono">{formatIntensity(intensitySI, 'SI')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Currently using:</span> {unitSystem === 'USA' ? 'USA (inches)' : 'SI (mm)'} units
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
