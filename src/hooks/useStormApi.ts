import { useState, useEffect, useCallback, useRef } from "react";
import { type PatternType, generateRainfallData } from "@/lib/rainfallPatterns";

interface StormApiParams {
  pattern: PatternType;
  depth: number;
  duration: number;
  timeStep: number;
  customIntensities?: number[] | null;
}

interface StormApiResult {
  intensities: number[];
  isLoading: boolean;
  source: "api" | "local";
}

/**
 * Hook that fetches rainfall data from the Storm API with local fallback.
 * Custom patterns always use local generation.
 */
export function useStormApi({ pattern, depth, duration, timeStep, customIntensities }: StormApiParams): StormApiResult {
  const [intensities, setIntensities] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<"api" | "local">("local");
  const abortRef = useRef<AbortController | null>(null);

  const fetchFromApi = useCallback(async (
    p: PatternType, d: number, dur: number, ts: number, signal: AbortSignal
  ): Promise<number[] | null> => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!projectId || !apiKey) return null;

      const url = `https://${projectId}.supabase.co/functions/v1/storm-api/generate`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiKey,
        },
        body: JSON.stringify({
          pattern: p,
          total_depth: d,
          duration_hr: dur,
          time_step_min: ts,
        }),
        signal,
      });

      if (!res.ok) return null;

      const json = await res.json();
      if (!Array.isArray(json.data)) return null;

      return json.data.map((pt: { intensity: number }) => pt.intensity);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Custom patterns always use local
    if (pattern === "custom" && customIntensities && customIntensities.length > 0) {
      setIntensities(customIntensities);
      setSource("local");
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Show local data immediately for responsiveness
    const localData = generateRainfallData(pattern, depth, duration, timeStep);
    setIntensities(localData);
    setSource("local");
    setIsLoading(true);

    // Fetch from API in background
    fetchFromApi(pattern, depth, duration, timeStep, controller.signal).then((apiData) => {
      if (controller.signal.aborted) return;
      if (apiData && apiData.length > 0) {
        setIntensities(apiData);
        setSource("api");
      }
      setIsLoading(false);
    });

    return () => controller.abort();
  }, [pattern, depth, duration, timeStep, customIntensities, fetchFromApi]);

  return { intensities, isLoading, source };
}
