import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { type UnitSystem, convertIntensity, convertDepth, getIntensityUnit, getDepthUnit, formatIntensity } from "@/lib/unitConversions";

interface RainfallChartProps {
  data: Array<{ time: string; intensity: number }>;
  unitSystem: UnitSystem;
}

export function RainfallChart({ data, unitSystem }: RainfallChartProps) {
  const [showCumulative, setShowCumulative] = useState(false);

  const convertedData = useMemo(() => {
    let cumDepth = 0;
    // Assume each bar represents one equal time step
    const stepHours = data.length >= 2
      ? parseFloat(data[1].time) - parseFloat(data[0].time)
      : 1;

    return data.map((point) => {
      const intensity = convertIntensity(point.intensity, "USA", unitSystem);
      // depth = intensity (depth/hr) × step (hr)
      const depthIncrement = convertIntensity(point.intensity, "USA", unitSystem) * stepHours;
      cumDepth += depthIncrement;
      return {
        time: point.time,
        intensity,
        cumulative: parseFloat(cumDepth.toFixed(4)),
      };
    });
  }, [data, unitSystem]);

  const depthUnit = getDepthUnit(unitSystem);
  const intensityUnit = getIntensityUnit(unitSystem);

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Rainfall Hyetograph</CardTitle>
        <div className="flex items-center gap-2">
          <Switch
            id="cumulative-toggle"
            checked={showCumulative}
            onCheckedChange={setShowCumulative}
          />
          <Label htmlFor="cumulative-toggle" className="text-sm cursor-pointer">
            Cumulative Curve
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full" role="img" aria-label={`Rainfall hyetograph chart showing intensity in ${intensityUnit} over time in hours${showCumulative ? ', with cumulative depth curve' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={convertedData} margin={{ top: 20, right: showCumulative ? 60 : 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                label={{ value: "Time (hours)", position: "insideBottom", offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="left"
                label={{ value: `Intensity (${intensityUnit})`, angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              {showCumulative && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: `Cumulative (${depthUnit})`, angle: 90, position: "insideRight" }}
                  tick={{ fontSize: 12 }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "cumulative") {
                    const decimals = unitSystem === "USA" ? 3 : 1;
                    return [`${value.toFixed(decimals)} ${depthUnit}`, "Cumulative Depth"];
                  }
                  return [formatIntensity(value, unitSystem), "Intensity"];
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="intensity"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              {showCumulative && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
