import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

/** Cumulative ratio sets for representative hero chart shapes */
const PATTERN_SHAPES: Record<string, { ratios: number[]; label: string }> = {
  "SCS Type I/IA/II/III": {
    label: "SCS Type II — 24-hour design storm",
    ratios: [
      0.005, 0.006, 0.007, 0.008, 0.010, 0.012, 0.014, 0.017,
      0.020, 0.024, 0.029, 0.035, 0.042, 0.050, 0.060, 0.075,
      0.095, 0.12, 0.16, 0.22, 0.32, 0.48, 0.66, 0.74,
      0.80, 0.84, 0.87, 0.90, 0.92, 0.94, 0.95, 0.96,
      0.965, 0.97, 0.975, 0.98, 0.984, 0.987, 0.99, 0.992,
      0.994, 0.995, 0.996, 0.997, 0.998, 0.9985, 0.999, 1.0,
    ],
  },
  "Huff Quartiles": {
    label: "Huff 3rd Quartile — center-to-late peak",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        if (t < 0.5) return 0.25 * (t / 0.5);
        if (t < 0.75) return 0.25 + 0.55 * ((t - 0.5) / 0.25);
        return 0.80 + 0.20 * ((t - 0.75) / 0.25);
      });
    })(),
  },
  "Chicago Storm": {
    label: "Chicago Storm — IDF-derived, r = 0.375",
    ratios: (() => {
      const n = 48;
      const r = 0.375;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 1) / n;
        const dist = Math.abs(t - r);
        vals.push(1 / (0.05 + dist * 3) ** 1.2);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Alternating Block": {
    label: "Alternating Block — center-peaked symmetric",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.1 + Math.abs(t - 0.5) * 4) ** 1.5);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "PMP (HMR 51/52)": {
    label: "PMP HMR 51/52 — extreme precipitation",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        if (t < 0.25) return 0.05 * (t / 0.25);
        if (t < 0.45) return 0.05 + 0.70 * ((t - 0.25) / 0.20);
        if (t < 0.55) return 0.75 + 0.15 * ((t - 0.45) / 0.10);
        return 0.90 + 0.10 * ((t - 0.55) / 0.45);
      });
    })(),
  },
  "UK FSR/FEH": {
    label: "FEH UK — symmetric summer profile (75%)",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(Math.exp(-8 * (t - 0.5) ** 2));
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Japan AMeDAS": {
    label: "Japan AMeDAS — typhoon front-loaded burst",
    ratios: (() => {
      const n = 48;
      const raw = Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        return 1 - Math.exp(-3.5 * t);
      });
      const max = raw[raw.length - 1];
      return raw.map((v) => v / max);
    })(),
  },
  "Euler Type I/II": {
    label: "Euler Type II — peak at 30% of duration",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.08 + Math.abs(t - 0.3) * 4) ** 1.4);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "FHWA/USACE": {
    label: "FHWA/USACE — federal highway standard",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.12 + Math.abs(t - 0.5) * 3.5) ** 1.3);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Korea MOLIT": {
    label: "Korea MOLIT — Huff 3rd Quartile variant",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.1 + Math.abs(t - 0.6) * 4) ** 1.3);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "India IMD": {
    label: "India IMD — monsoon front-loaded",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        return 1 - (1 - t) ** 2.2;
      });
    })(),
  },
  "Australia ARR": {
    label: "ARR 2019 — ensemble temporal pattern",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.15 + Math.abs(t - 0.45) * 3) ** 1.2);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Singapore PUB": {
    label: "Singapore PUB — tropical convective burst",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.06 + Math.abs(t - 0.35) * 5) ** 1.5);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Malaysia MSMA": {
    label: "Malaysia MSMA — tropical center-peaked",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(Math.exp(-6 * (t - 0.5) ** 2));
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "GCC Arid": {
    label: "GCC Arid — flash flood front-loaded",
    ratios: (() => {
      const n = 48;
      const raw = Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        return 1 - Math.exp(-5 * t);
      });
      const max = raw[raw.length - 1];
      return raw.map((v) => v / max);
    })(),
  },
  "South Africa SANRAL": {
    label: "SANRAL — South African highway design",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.12 + Math.abs(t - 0.4) * 3.5) ** 1.3);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Brazil ANA": {
    label: "Brazil ANA — alternating block variant",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.1 + Math.abs(t - 0.5) * 3.8) ** 1.4);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Mexico CONAGUA": {
    label: "Mexico CONAGUA — SCS Type II variant",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.08 + Math.abs(t - 0.48) * 4) ** 1.5);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Scandinavian SVK": {
    label: "Scandinavian SVK — moderate center peak",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(Math.exp(-5 * (t - 0.5) ** 2));
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Netherlands RIONED": {
    label: "Netherlands RIONED — Euler Type II variant",
    ratios: (() => {
      const n = 48;
      const vals: number[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        vals.push(1 / (0.1 + Math.abs(t - 0.3) * 3.5) ** 1.3);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      let cum = 0;
      return vals.map((v) => { cum += v / sum; return cum; });
    })(),
  },
  "Custom": {
    label: "Custom — user-defined distribution",
    ratios: Array.from({ length: 48 }, (_, i) => (i + 1) / 48),
  },
};

const DEFAULT_KEY = "SCS Type I/IA/II/III";

interface HeroHyetographProps {
  patternName?: string;
}

/** A small, decorative hyetograph for the hero section. No axes, no interaction. */
export function HeroHyetograph({ patternName }: HeroHyetographProps) {
  const key = patternName && PATTERN_SHAPES[patternName] ? patternName : DEFAULT_KEY;
  const shape = PATTERN_SHAPES[key];

  const data = useMemo(() => {
    const ratios = shape.ratios;
    return ratios.map((r, i) => ({
      i,
      v: (r - (i > 0 ? ratios[i - 1] : 0)) * 100,
    }));
  }, [shape]);

  return (
    <div className="w-56 h-24 mx-auto opacity-80 transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="v" fill="rgba(255,255,255,0.7)" radius={[1, 1, 0, 0]} isAnimationActive animationDuration={500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function getHeroPatternLabel(patternName?: string): string {
  if (!patternName || !PATTERN_SHAPES[patternName]) return PATTERN_SHAPES[DEFAULT_KEY].label;
  return PATTERN_SHAPES[patternName].label;
}
