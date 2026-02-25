import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { type RainfallDataPoint } from "@/lib/rainfallParsers";

interface EventHyetographProps {
  data: RainfallDataPoint[];
  height?: number;
}

export function EventHyetograph({ data, height = 160 }: EventHyetographProps) {
  if (data.length === 0) return null;

  const chartData = data.map(d => ({
    time: (d.time / 60).toFixed(1),
    intensity: d.intensity,
  }));

  // Show ~20 tick labels max
  const tickInterval = Math.max(1, Math.floor(chartData.length / 20));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            interval={tickInterval}
            label={{ value: "hr", position: "insideBottomRight", offset: -2, fontSize: 10 }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            width={36}
            label={{ value: "in/hr", angle: -90, position: "insideLeft", fontSize: 10 }}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(3)} in/hr`, "Intensity"]}
            labelFormatter={(l) => `${l} hr`}
          />
          <Bar dataKey="intensity" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
