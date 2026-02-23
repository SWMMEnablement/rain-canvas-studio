import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

/** A small, decorative SCS Type II hyetograph for the hero section. No axes, no interaction. */
export function HeroHyetograph() {
  const data = useMemo(() => {
    // Simplified SCS Type II ratios (24-hr, 48 intervals)
    const ratios = [
      0.005, 0.006, 0.007, 0.008, 0.010, 0.012, 0.014, 0.017,
      0.020, 0.024, 0.029, 0.035, 0.042, 0.050, 0.060, 0.075,
      0.095, 0.12, 0.16, 0.22, 0.32, 0.48, 0.66, 0.74,
      0.80, 0.84, 0.87, 0.90, 0.92, 0.94, 0.95, 0.96,
      0.965, 0.97, 0.975, 0.98, 0.984, 0.987, 0.99, 0.992,
      0.994, 0.995, 0.996, 0.997, 0.998, 0.9985, 0.999, 1.0,
    ];
    // Convert cumulative to incremental
    return ratios.map((r, i) => ({
      i,
      v: (r - (i > 0 ? ratios[i - 1] : 0)) * 100,
    }));
  }, []);

  return (
    <div className="w-56 h-24 mx-auto opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="v" fill="rgba(255,255,255,0.7)" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
