import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";

/** Generate a center-peaked shape */
function centerPeaked(n: number, sharpness = 1.4, center = 0.5): number[] {
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    vals.push(1 / (0.1 + Math.abs(t - center) * 4) ** sharpness);
  }
  return normalizeToCumulative(vals);
}

/** Generate a front-loaded exponential shape */
function frontLoaded(n: number, rate = 3.5): number[] {
  const raw = Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n;
    return 1 - Math.exp(-rate * t);
  });
  const max = raw[raw.length - 1];
  return raw.map((v) => v / max);
}

/** Generate a double-peak shape */
function doublePeak(n: number, p1 = 0.3, p2 = 0.75): number[] {
  const vals: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const v1 = 1 / (0.1 + Math.abs(t - p1) * 5) ** 1.3;
    const v2 = 0.7 / (0.1 + Math.abs(t - p2) * 5) ** 1.3;
    vals.push(v1 + v2);
  }
  return normalizeToCumulative(vals);
}

/** Normalize incremental values to cumulative [0..1] */
function normalizeToCumulative(vals: number[]): number[] {
  const sum = vals.reduce((a, b) => a + b, 0);
  let cum = 0;
  return vals.map((v) => { cum += v / sum; return cum; });
}

/** Gaussian-peaked shape */
function gaussianPeaked(n: number, center = 0.5, width = 6): number[] {
  const vals = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return Math.exp(-width * (t - center) ** 2);
  });
  return normalizeToCumulative(vals);
}

/** Triangular shape */
function triangularShape(n: number, peak = 0.375): number[] {
  const vals = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    if (t <= peak) return t / peak;
    return 1 - 0.7 * ((t - peak) / (1 - peak));
  });
  const clamped = vals.map(v => Math.max(v, 0.05));
  return normalizeToCumulative(clamped);
}

/** All 66 pattern shapes keyed by their badge name */
const PATTERN_SHAPES: Record<string, { label: string; ratios: number[] }> = {
  // === SWMM / Core ===
  "Block Pattern": {
    label: "Block Pattern — uniform intensity",
    ratios: Array.from({ length: 48 }, (_, i) => (i + 1) / 48),
  },
  "SCS Type I": {
    label: "SCS Type I — Pacific maritime, peak at 40%",
    ratios: centerPeaked(48, 1.3, 0.4),
  },
  "SCS Type IA": {
    label: "SCS Type IA — Pacific NW, early peak at 35%",
    ratios: centerPeaked(48, 1.2, 0.35),
  },
  "SCS Type II": {
    label: "SCS Type II — 24-hour center-peaked design storm",
    ratios: [
      0.005, 0.006, 0.007, 0.008, 0.010, 0.012, 0.014, 0.017,
      0.020, 0.024, 0.029, 0.035, 0.042, 0.050, 0.060, 0.075,
      0.095, 0.12, 0.16, 0.22, 0.32, 0.48, 0.66, 0.74,
      0.80, 0.84, 0.87, 0.90, 0.92, 0.94, 0.95, 0.96,
      0.965, 0.97, 0.975, 0.98, 0.984, 0.987, 0.99, 0.992,
      0.994, 0.995, 0.996, 0.997, 0.998, 0.9985, 0.999, 1.0,
    ],
  },
  "SCS Type III": {
    label: "SCS Type III — Gulf Coast tropical",
    ratios: centerPeaked(48, 1.3, 0.48),
  },
  "Balanced Storm": {
    label: "Balanced Storm — IDF-derived symmetric",
    ratios: centerPeaked(48, 1.5, 0.5),
  },
  "Yen & Chow": {
    label: "Yen & Chow — triangular, r = 0.375",
    ratios: triangularShape(48, 0.375),
  },
  "Double Peak": {
    label: "Double Peak — dual convective cells",
    ratios: doublePeak(48, 0.3, 0.7),
  },
  "Custom": {
    label: "Custom — user-defined distribution",
    ratios: Array.from({ length: 48 }, (_, i) => (i + 1) / 48),
  },
  // === US Agency ===
  "FDOT Zone 1": { label: "FDOT Zone 1 — NW Florida", ratios: centerPeaked(48, 1.3, 0.45) },
  "FDOT Zone 2": { label: "FDOT Zone 2 — NE Florida", ratios: centerPeaked(48, 1.3, 0.44) },
  "FDOT Zone 3": { label: "FDOT Zone 3 — Central Florida", ratios: centerPeaked(48, 1.4, 0.40) },
  "FDOT Zone 4": { label: "FDOT Zone 4 — SE Florida", ratios: frontLoaded(48, 4.0) },
  "FDOT Zone 5": { label: "FDOT Zone 5 — SW Florida", ratios: frontLoaded(48, 3.5) },
  "TxDOT": { label: "TxDOT — Texas DOT empirical", ratios: centerPeaked(48, 1.4, 0.48) },
  "NOAA Atlas 14": { label: "NOAA Atlas 14 — 50th percentile", ratios: centerPeaked(48, 1.3, 0.50) },
  "UDFCD Denver": { label: "UDFCD Denver — 2-hour front-loaded", ratios: frontLoaded(48, 4.5) },
  "USACE SPS": { label: "USACE SPS — Standard Project Storm", ratios: centerPeaked(48, 1.3, 0.5) },
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
  // === UK/ICM ===
  "Triangular": { label: "Triangular — linear rise/fall", ratios: triangularShape(48, 0.5) },
  "Trapezoidal": {
    label: "Trapezoidal — sustained peak period",
    ratios: (() => {
      const n = 48;
      const vals = Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        if (t < 0.25) return t / 0.25;
        if (t < 0.75) return 1.0;
        return 1 - (t - 0.75) / 0.25;
      });
      return normalizeToCumulative(vals.map(v => Math.max(v, 0.1)));
    })(),
  },
  "FSR Profile": { label: "FSR — UK Flood Studies Report", ratios: gaussianPeaked(48, 0.5, 6) },
  "FEH (UK)": { label: "FEH UK — symmetric summer profile (75%)", ratios: gaussianPeaked(48, 0.5, 8) },
  // === European ===
  "Euler Type I": { label: "Euler Type I — front-loaded, peak at start", ratios: frontLoaded(48, 4.0) },
  "Euler Type II": { label: "Euler Type II — peak at 30% of duration", ratios: centerPeaked(48, 1.4, 0.3) },
  "Double Triangle": { label: "Desbordes Double Triangle — dual peaks", ratios: doublePeak(48, 0.3, 0.75) },
  // === International ===
  "Canadian CDA": { label: "Canadian CDA — modified Type II", ratios: centerPeaked(48, 1.2, 0.50) },
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
      return normalizeToCumulative(vals);
    })(),
  },
  "Huff 1st Quartile": {
    label: "Huff 1st Quartile — early peak",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        if (t < 0.25) return 0.60 * (t / 0.25);
        if (t < 0.50) return 0.60 + 0.20 * ((t - 0.25) / 0.25);
        return 0.80 + 0.20 * ((t - 0.50) / 0.50);
      });
    })(),
  },
  "Huff 2nd Quartile": {
    label: "Huff 2nd Quartile — 2nd quarter peak",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        if (t < 0.25) return 0.15 * (t / 0.25);
        if (t < 0.50) return 0.15 + 0.50 * ((t - 0.25) / 0.25);
        if (t < 0.75) return 0.65 + 0.25 * ((t - 0.50) / 0.25);
        return 0.90 + 0.10 * ((t - 0.75) / 0.25);
      });
    })(),
  },
  "Huff 3rd Quartile": {
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
  "Huff 4th Quartile": {
    label: "Huff 4th Quartile — late peak",
    ratios: (() => {
      const n = 48;
      return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / n;
        if (t < 0.50) return 0.10 * (t / 0.50);
        if (t < 0.75) return 0.10 + 0.25 * ((t - 0.50) / 0.25);
        return 0.35 + 0.65 * ((t - 0.75) / 0.25);
      });
    })(),
  },
  "Desbordes": {
    label: "Desbordes IT77 — French double-triangle, peak at 37.5%",
    ratios: triangularShape(48, 0.375),
  },
  "German DWA": { label: "German DWA-A 531 — Euler Type II variant", ratios: centerPeaked(48, 1.4, 0.3) },
  "Dutch NEERSLAG": { label: "Dutch NEERSLAG — asymmetric polder", ratios: centerPeaked(48, 1.3, 0.3) },
  "Italian Pattern": { label: "Italian — Mediterranean convective", ratios: centerPeaked(48, 1.5, 0.4) },
  "Australian ARR": { label: "ARR 2019 — ensemble temporal pattern", ratios: centerPeaked(48, 1.2, 0.45) },
  "Japan JMA": { label: "Japan JMA — center-peaked typhoon", ratios: centerPeaked(48, 1.4, 0.5) },
  "China Design Storm": { label: "China — pillow-shaped center peak", ratios: gaussianPeaked(48, 0.5, 5) },
  "South African Huff": { label: "South African Huff — modified 2nd quartile", ratios: centerPeaked(48, 1.3, 0.4) },
  // === Asian ===
  "Singapore PUB": { label: "Singapore PUB — tropical convective burst", ratios: frontLoaded(48, 5.0) },
  "China GB 50014": { label: "China GB 50014 — urban drainage standard", ratios: centerPeaked(48, 1.5, 0.4) },
  "China PRD": { label: "China PRD — typhoon Pearl River Delta", ratios: frontLoaded(48, 3.0) },
  "India IMD": { label: "India IMD — monsoon front-loaded", ratios: frontLoaded(48, 2.2) },
  "India Coastal": { label: "India Coastal — cyclonic sharp peak", ratios: frontLoaded(48, 5.0) },
  "Japan AMeDAS": { label: "Japan AMeDAS — convective sharp peak", ratios: frontLoaded(48, 3.5) },
  "Japan Baiu": { label: "Japan Baiu 梅雨 — broad frontal rain", ratios: gaussianPeaked(48, 0.5, 3) },
  "Japan Typhoon": { label: "Japan Typhoon — double rain band", ratios: doublePeak(48, 0.35, 0.7) },
  "Korea KMA": { label: "Korea KMA — monsoon/convective hybrid", ratios: centerPeaked(48, 1.3, 0.6) },
  "Malaysia MSMA": { label: "Malaysia MSMA — tropical center-peaked", ratios: gaussianPeaked(48, 0.5, 6) },
  "Indonesia BMKG": { label: "Indonesia BMKG — tropical front-loaded", ratios: frontLoaded(48, 4.5) },
  "Philippines PAGASA": { label: "Philippines PAGASA — super-typhoon", ratios: frontLoaded(48, 4.0) },
  "Vietnam IMHEN": { label: "Vietnam IMHEN — monsoon/convective", ratios: centerPeaked(48, 1.3, 0.4) },
  "Thailand TMD": { label: "Thailand TMD — Bangkok monsoon", ratios: centerPeaked(48, 1.3, 0.45) },
  // === Middle East ===
  "Saudi Arabia PME": { label: "Saudi PME — extreme flash flood", ratios: frontLoaded(48, 6.0) },
  "UAE NCMS": { label: "UAE NCMS — Dubai extreme burst", ratios: frontLoaded(48, 5.5) },
  "Qatar Kahramaa": { label: "Qatar Kahramaa — shortest GCC burst", ratios: frontLoaded(48, 7.0) },
  "Oman DGMAN": { label: "Oman DGMAN — Shamal/Khareef wadi flood", ratios: frontLoaded(48, 4.5) },
  // === African ===
  "South Africa SANRAL": { label: "SANRAL — South African highway design", ratios: centerPeaked(48, 1.3, 0.4) },
  "Kenya KMD": { label: "Kenya KMD — East African highland", ratios: frontLoaded(48, 4.0) },
  "Nigeria NiMet": { label: "Nigeria NiMet — West African monsoon", ratios: centerPeaked(48, 1.2, 0.5) },
  "Egypt HCWW": { label: "Egypt HCWW — arid flash flood", ratios: frontLoaded(48, 6.0) },
  // === Latin America ===
  "Brazil ANA": { label: "Brazil ANA — tropical convective", ratios: centerPeaked(48, 1.4, 0.5) },
  "Mexico CONAGUA": { label: "Mexico CONAGUA — front-loaded tropical", ratios: centerPeaked(48, 1.5, 0.48) },
  "Colombia IDEAM": { label: "Colombia IDEAM — Andean convective", ratios: centerPeaked(48, 1.3, 0.5) },
  "Chile DGA": { label: "Chile DGA — frontal/orographic", ratios: gaussianPeaked(48, 0.5, 4) },
  "Auckland TP108": { label: "Auckland TP108 — NZ maritime convective", ratios: centerPeaked(48, 1.4, 0.42) },
  "Wellington Regional": { label: "Wellington — frontal/orographic", ratios: centerPeaked(48, 1.6, 0.35) },
  "Christchurch Canterbury": { label: "Christchurch — rain-shadow plains", ratios: centerPeaked(48, 1.2, 0.47) },
  // New patterns
  "HIRDS NZ": { label: "HIRDS NZ — hyperbolic tangent temporal", ratios: (() => {
    const n = 48, a = 1.0, b = 3.5, c = 0.55;
    const vals: number[] = [];
    for (let i = 0; i < n; i++) {
      const t1 = i / n, t2 = (i + 1) / n;
      vals.push(0.5 * (1 + a * Math.tanh(b * (t2 - c))) - 0.5 * (1 + a * Math.tanh(b * (t1 - c))));
    }
    let cum = 0;
    return vals.map(v => { cum += v; return cum; });
  })() },
  "Sifalda (Czech)": { label: "Sifalda — Czech 3-part storm", ratios: (() => {
    const n = 48;
    const vals = Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      if (t <= 0.34) return 0.14 / 0.34;
      if (t <= 0.51) return 0.56 / 0.17;
      return 0.30 / 0.49;
    });
    return normalizeToCumulative(vals);
  })() },
  "Denmark SVK": { label: "Denmark SVK — Chicago r=0.375", ratios: (() => {
    const n = 48, r = 0.375;
    const vals = Array.from({ length: n }, (_, i) => 1 / (0.05 + Math.abs((i + 1) / n - r) * 3) ** 1.2);
    return normalizeToCumulative(vals);
  })() },
  "Sweden SMHI": { label: "Sweden SMHI — Chicago r=0.35", ratios: (() => {
    const n = 48, r = 0.35;
    const vals = Array.from({ length: n }, (_, i) => 1 / (0.05 + Math.abs((i + 1) / n - r) * 3) ** 1.2);
    return normalizeToCumulative(vals);
  })() },
  "Norway NVE": { label: "Norway NVE — Chicago r=0.33", ratios: (() => {
    const n = 48, r = 0.33;
    const vals = Array.from({ length: n }, (_, i) => 1 / (0.05 + Math.abs((i + 1) / n - r) * 3) ** 1.2);
    return normalizeToCumulative(vals);
  })() },
  "Finland FMI": { label: "Finland FMI — Chicago r=0.35", ratios: (() => {
    const n = 48, r = 0.35;
    const vals = Array.from({ length: n }, (_, i) => 1 / (0.05 + Math.abs((i + 1) / n - r) * 3) ** 1.2);
    return normalizeToCumulative(vals);
  })() },
  "Swiss IDF": { label: "Swiss IDF — cantonal Chicago r=0.40", ratios: centerPeaked(48, 1.4, 0.40) },
  "Spain CEDEX": { label: "Spain CEDEX — alternating block", ratios: centerPeaked(48, 1.5, 0.50) },
  "Belgium IRM": { label: "Belgium IRM — center-peaked r=0.50", ratios: centerPeaked(48, 1.3, 0.50) },
  "Pilgrim-Cordery": { label: "Pilgrim-Cordery — Australian historical", ratios: (() => {
    const pcDepth = [0, 0.04, 0.10, 0.19, 0.42, 0.66, 0.80, 0.88, 0.93, 0.97, 1.00];
    const n = 48;
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 1) / n;
      const idx = Math.min(Math.floor(t * 10), 9);
      const frac = (t * 10) - idx;
      return pcDepth[idx] + frac * (pcDepth[idx + 1] - pcDepth[idx]);
    });
  })() },
  "Watt's Curve (UK)": { label: "Watt's Curve — UK historical bell", ratios: gaussianPeaked(48, 0.5, 4) },
  "Hong Kong HKO": { label: "Hong Kong HKO — typhoon front-loaded", ratios: frontLoaded(48, 3.0) },
  "Taiwan CWA": { label: "Taiwan CWA — typhoon r=0.45", ratios: centerPeaked(48, 1.3, 0.45) },
  "Bangladesh BMD": { label: "Bangladesh BMD — monsoon rear-loaded", ratios: (() => {
    const bdDepth = [0, 0.03, 0.08, 0.15, 0.24, 0.36, 0.50, 0.65, 0.79, 0.91, 1.00];
    const n = 48;
    return Array.from({ length: n }, (_, i) => {
      const t = (i + 1) / n;
      const idx = Math.min(Math.floor(t * 10), 9);
      const frac = (t * 10) - idx;
      return bdDepth[idx] + frac * (bdDepth[idx + 1] - bdDepth[idx]);
    });
  })() },
  "Pakistan PMD": { label: "Pakistan PMD — monsoon β peak at 45%", ratios: gaussianPeaked(48, 0.45, 4) },
  "Sri Lanka": { label: "Sri Lanka — monsoon β peak at 40%", ratios: gaussianPeaked(48, 0.40, 4) },
  "Fiji FMS": { label: "Fiji FMS — tropical cyclone", ratios: frontLoaded(48, 3.5) },
  "Argentina SMN": { label: "Argentina SMN — Buenos Aires r=0.33", ratios: (() => {
    const n = 48, r = 0.33;
    const vals = Array.from({ length: n }, (_, i) => 1 / (0.05 + Math.abs((i + 1) / n - r) * 3) ** 1.2);
    return normalizeToCumulative(vals);
  })() },
  "Peru SENAMHI": { label: "Peru SENAMHI — Andean r=0.40", ratios: centerPeaked(48, 1.3, 0.40) },
  "Ecuador INAMHI": { label: "Ecuador INAMHI — Andean r=0.40", ratios: centerPeaked(48, 1.3, 0.40) },
  "Venezuela INAMEH": { label: "Venezuela INAMEH — Andean r=0.40", ratios: centerPeaked(48, 1.3, 0.40) },
  "Puerto Rico": { label: "Puerto Rico — tropical modified SCS II", ratios: centerPeaked(48, 1.3, 0.48) },
  "Morocco DMN": { label: "Morocco DMN — Mediterranean r=0.38", ratios: centerPeaked(48, 1.3, 0.38) },
  "Ethiopia NMA": { label: "Ethiopia NMA — East African r=0.42", ratios: centerPeaked(48, 1.3, 0.42) },
  "Ghana GMet": { label: "Ghana GMet — West African squall r=0.32", ratios: centerPeaked(48, 1.4, 0.32) },
  "Tanzania TMA": { label: "Tanzania TMA — East African r=0.44", ratios: centerPeaked(48, 1.3, 0.44) },
  "Mozambique INAM": { label: "Mozambique INAM — SE African r=0.40", ratios: centerPeaked(48, 1.3, 0.40) },
  "Arid Flash Flood": { label: "Arid Flash Flood — exponential decay burst", ratios: frontLoaded(48, 6.0) },
};

const DEFAULT_KEY = "SCS Type II";

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
