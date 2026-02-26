import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Video, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface HeroGifExportProps {
  patternNames: string[];
  onPatternChange: (name: string) => void;
  captureRef: React.RefObject<HTMLDivElement>;
}

export function HeroGifExport({ patternNames, onPatternChange, captureRef }: HeroGifExportProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPattern, setCurrentPattern] = useState("");
  const cancelRef = useRef(false);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const captureFrame = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!captureRef.current) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      return await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
    } catch {
      return null;
    }
  }, [captureRef]);

  const startRecording = useCallback(async () => {
    if (!captureRef.current) {
      toast.error("Cannot find hyetograph container");
      return;
    }

    setIsRecording(true);
    setProgress(0);
    cancelRef.current = false;

    toast.info(`Recording ${patternNames.length} patterns — please wait...`);

    try {
      const GIF = (await import("gif.js")).default;

      // Fetch the gif.worker.js from CDN and create a blob URL (same-origin requirement)
      const workerResponse = await fetch("https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js");
      if (!workerResponse.ok) throw new Error("Failed to fetch gif.worker.js");
      const workerBlob = await workerResponse.blob();
      const workerUrl = URL.createObjectURL(workerBlob);

      // Capture first frame to determine dimensions
      onPatternChange(patternNames[0]);
      setCurrentPattern(patternNames[0]);
      await sleep(600);

      const firstCanvas = await captureFrame();
      if (!firstCanvas) throw new Error("Failed to capture first frame");

      const w = firstCanvas.width;
      const h = firstCanvas.height;

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: w,
        height: h,
        workerScript: workerUrl,
      });

      // Add first frame
      gif.addFrame(firstCanvas, { delay: 200, copy: true });

      // Cycle through remaining patterns
      for (let i = 1; i < patternNames.length; i++) {
        if (cancelRef.current) {
          toast.info("Recording cancelled");
          setIsRecording(false);
          setProgress(0);
          return;
        }

        const name = patternNames[i];
        onPatternChange(name);
        setCurrentPattern(name);
        setProgress(Math.round(((i + 1) / patternNames.length) * 80));

        await sleep(400); // wait for recharts animation

        const canvas = await captureFrame();
        if (canvas) {
          gif.addFrame(canvas, { delay: 200, copy: true });
        }
      }

      setProgress(85);
      toast.info("Encoding GIF...");

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rainfall-patterns-showcase.gif";
        link.click();
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(workerUrl);

        toast.success(`GIF exported — ${patternNames.length} patterns, ${(blob.size / 1024 / 1024).toFixed(1)} MB`);
        setIsRecording(false);
        setProgress(100);

        // Reset to default
        onPatternChange("");
        setTimeout(() => setProgress(0), 2000);
      });

      gif.on("progress", (p: number) => {
        setProgress(85 + Math.round(p * 15));
      });

      gif.on("error", () => {
        toast.error("GIF encoding failed");
        setIsRecording(false);
        setProgress(0);
      });

      gif.render();
    } catch (error) {
      console.error("GIF recording failed:", error);
      toast.error("Failed to record GIF");
      setIsRecording(false);
      setProgress(0);
    }
  }, [patternNames, onPatternChange, captureFrame, captureRef]);

  const cancelRecording = () => {
    cancelRef.current = true;
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {isRecording ? (
        <div className="flex flex-col items-center gap-2 w-full max-w-md">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelRecording}
              className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-white/70 animate-pulse">
            <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
            Recording: {currentPattern} ({progress}%)
          </p>
        </div>
      ) : (
        <Button
          onClick={startRecording}
          variant="ghost"
          size="sm"
          className="text-white/80 hover:text-white hover:bg-white/20 gap-2 backdrop-blur-sm border border-white/20"
        >
          <Video className="w-4 h-4" />
          Export All Patterns as GIF
          <Download className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
