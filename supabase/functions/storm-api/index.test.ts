import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/storm-api`;

async function generate(pattern: string, depth: number, duration: number, timeStep: number) {
  const res = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ pattern, total_depth: depth, duration_hr: duration, time_step_min: timeStep }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

// Fetch all pattern IDs
Deno.test("GET /patterns returns pattern list", async () => {
  const res = await fetch(`${BASE}/patterns`, { headers: { apikey: SUPABASE_ANON_KEY } });
  const body = await res.json();
  assertEquals(res.status, 200);
  assert(Array.isArray(body.patterns));
  assert(body.count >= 265, `Expected >=265 patterns, got ${body.count}`);
});

// Volume conservation for every pattern
Deno.test("All patterns conserve volume within 2%", async () => {
  // First get the pattern list
  const listRes = await fetch(`${BASE}/patterns`, { headers: { apikey: SUPABASE_ANON_KEY } });
  const listBody = await listRes.json();
  const patternIds: string[] = listBody.patterns.map((p: { id: string }) => p.id);

  const depth = 4;
  const duration = 6;
  const timeStep = 15;
  const tolerance = 0.02; // 2%
  const failures: string[] = [];

  // Test in batches of 10 to avoid overwhelming the function
  for (let i = 0; i < patternIds.length; i += 10) {
    const batch = patternIds.slice(i, i + 10);
    const results = await Promise.all(batch.map(id => generate(id, depth, duration, timeStep)));

    for (let j = 0; j < batch.length; j++) {
      const id = batch[j];
      const { status, body } = results[j];

      if (status !== 200) {
        failures.push(`${id}: HTTP ${status} - ${body.error || "unknown error"}`);
        continue;
      }

      // Check data array exists
      if (!Array.isArray(body.data) || body.data.length === 0) {
        failures.push(`${id}: empty data array`);
        continue;
      }

      // Volume = sum(intensity * timeStep_hours)
      const timeStepHr = timeStep / 60;
      const volume = body.data.reduce((sum: number, pt: { intensity: number }) => sum + pt.intensity * timeStepHr, 0);
      const error = Math.abs(volume - depth) / depth;

      if (error >= tolerance) {
        failures.push(`${id}: volume=${volume.toFixed(4)}, error=${(error * 100).toFixed(2)}%`);
      }

      // Check all intensities non-negative
      const hasNeg = body.data.some((pt: { intensity: number }) => pt.intensity < 0);
      if (hasNeg) {
        failures.push(`${id}: negative intensities found`);
      }

      // Check cumulative is monotonically non-decreasing
      for (let k = 1; k < body.data.length; k++) {
        if (body.data[k].cumulative < body.data[k - 1].cumulative - 0.0001) {
          failures.push(`${id}: cumulative not monotonic at step ${k}`);
          break;
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error("Volume conservation failures:\n" + failures.join("\n"));
  }
  assertEquals(failures.length, 0, `${failures.length} pattern(s) failed:\n${failures.join("\n")}`);
});

// Spot-check specific pattern shapes
Deno.test("SCS Type II peaks near center", async () => {
  const { status, body } = await generate("scs2", 4, 6, 15);
  assertEquals(status, 200);
  const intensities: number[] = body.data.map((p: { intensity: number }) => p.intensity);
  const peakIdx = intensities.indexOf(Math.max(...intensities));
  const peakPos = peakIdx / (intensities.length - 1);
  assert(peakPos >= 0.3 && peakPos <= 0.7, `SCS2 peak at ${(peakPos * 100).toFixed(0)}%, expected 30-70%`);
});

Deno.test("Euler Type II peaks near 30%", async () => {
  const { status, body } = await generate("euler2", 4, 6, 15);
  assertEquals(status, 200);
  const intensities: number[] = body.data.map((p: { intensity: number }) => p.intensity);
  const peakIdx = intensities.indexOf(Math.max(...intensities));
  const peakPos = peakIdx / (intensities.length - 1);
  assert(peakPos >= 0.2 && peakPos <= 0.4, `Euler2 peak at ${(peakPos * 100).toFixed(0)}%, expected 20-40%`);
});

Deno.test("Huff Q1 peaks in first quartile", async () => {
  const { status, body } = await generate("huff1", 4, 6, 15);
  assertEquals(status, 200);
  const intensities: number[] = body.data.map((p: { intensity: number }) => p.intensity);
  const peakIdx = intensities.indexOf(Math.max(...intensities));
  const peakPos = peakIdx / (intensities.length - 1);
  assert(peakPos <= 0.35, `Huff Q1 peak at ${(peakPos * 100).toFixed(0)}%, expected <=35%`);
});

Deno.test("Block pattern is uniform", async () => {
  const { status, body } = await generate("block", 4, 6, 15);
  assertEquals(status, 200);
  const intensities: number[] = body.data.map((p: { intensity: number }) => p.intensity);
  const min = Math.min(...intensities);
  const max = Math.max(...intensities);
  assert(max - min < 0.01, `Block range ${max - min} too wide, expected uniform`);
});
