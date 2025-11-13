import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { type UnitSystem, convertIntensity, getIntensityUnit, formatIntensity } from "@/lib/unitConversions";

interface RainfallChartProps {
  data: Array<{ time: string; intensity: number }>;
  unitSystem: UnitSystem;
}

export function RainfallChart({ data, unitSystem }: RainfallChartProps) {
  const convertedData = data.map(point => ({
    time: point.time,
    intensity: convertIntensity(point.intensity, 'USA', unitSystem)
  }));
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Rainfall Hyetograph</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={convertedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="time"
                label={{ value: 'Time (hours)', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: `Intensity (${getIntensityUnit(unitSystem)})`, angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatIntensity(value, unitSystem), 'Intensity']}
              />
              <Bar dataKey="intensity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
