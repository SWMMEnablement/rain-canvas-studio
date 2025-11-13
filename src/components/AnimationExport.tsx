import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useCallback } from "react";
import { Video, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AnimationExportProps {
  chartRef: React.RefObject<HTMLDivElement>;
  isAnimating: boolean;
  currentTimeIndex: number;
  totalSteps: number;
  onStartAnimation: () => void;
  onPauseAnimation: () => void;
  onResetAnimation: () => void;
}

export function AnimationExport({
  chartRef,
  isAnimating,
  currentTimeIndex,
  totalSteps,
  onStartAnimation,
  onPauseAnimation,
  onResetAnimation,
}: AnimationExportProps) {
  const [exportFormat, setExportFormat] = useState<'gif' | 'frames'>('gif');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const capturedFramesRef = useRef<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!chartRef.current) return null;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Frame capture failed:', error);
      return null;
    }
  }, [chartRef]);

  const exportAsGIF = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    capturedFramesRef.current = [];

    try {
      // Reset animation to start
      onResetAnimation();
      
      toast({
        title: "Recording started",
        description: "Animation will play and capture frames. Please wait...",
      });

      // Start animation and capture frames
      onStartAnimation();
      
      // Wait for animation to complete while capturing frames
      const captureInterval = setInterval(async () => {
        const frame = await captureFrame();
        if (frame) {
          capturedFramesRef.current.push(frame);
          setExportProgress(Math.round((capturedFramesRef.current.length / totalSteps) * 100));
        }

        if (capturedFramesRef.current.length >= totalSteps || !isAnimating) {
          clearInterval(captureInterval);
          onPauseAnimation();
          
          // Generate GIF using gif.js
          await generateGIF();
        }
      }, 150); // Capture every 150ms

    } catch (error) {
      console.error('GIF export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to create GIF animation",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  }, [captureFrame, onStartAnimation, onPauseAnimation, onResetAnimation, totalSteps, isAnimating]);

  const generateGIF = async () => {
    try {
      // Note: gif.js requires a worker script. For production use, copy gif.worker.js to public folder
      // For now, we'll use a data URL approach or skip worker
      const GIF = (await import('gif.js')).default;
      
      toast({
        title: "Processing GIF",
        description: "Generating animated GIF from captured frames...",
      });
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 800,
        height: 400,
        workerScript: undefined, // Will use inline worker
      });

      // Load frames as images and add to GIF
      for (const frameData of capturedFramesRef.current) {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = frameData;
        });
        gif.addFrame(img, { delay: 100 });
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rainfall-animation.gif';
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "GIF exported successfully",
          description: `Animation with ${capturedFramesRef.current.length} frames`,
        });
        
        setIsExporting(false);
        setExportProgress(0);
      });

      gif.on('error', (error: any) => {
        console.error('GIF generation error:', error);
        toast({
          title: "GIF generation failed",
          description: "Error creating GIF file. Try exporting as frames instead.",
          variant: "destructive",
        });
        setIsExporting(false);
      });

      gif.render();
    } catch (error) {
      console.error('GIF generation failed:', error);
      toast({
        title: "GIF generation failed",
        description: "Try exporting as PNG frames instead",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  };

  const exportAsFrames = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    capturedFramesRef.current = [];

    try {
      onResetAnimation();
      
      toast({
        title: "Capturing frames",
        description: "Recording animation frames...",
      });

      onStartAnimation();
      
      const captureInterval = setInterval(async () => {
        const frame = await captureFrame();
        if (frame) {
          capturedFramesRef.current.push(frame);
          setExportProgress(Math.round((capturedFramesRef.current.length / totalSteps) * 100));
        }

        if (capturedFramesRef.current.length >= totalSteps) {
          clearInterval(captureInterval);
          onPauseAnimation();
          
          // Download all frames as a zip (simplified: download individually)
          capturedFramesRef.current.forEach((frame, index) => {
            const link = document.createElement('a');
            link.href = frame;
            link.download = `frame_${String(index + 1).padStart(4, '0')}.png`;
            link.click();
          });

          toast({
            title: "Frames exported",
            description: `${capturedFramesRef.current.length} frames downloaded`,
          });
          
          setIsExporting(false);
          setExportProgress(0);
        }
      }, 150);

    } catch (error) {
      console.error('Frame export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to capture animation frames",
        variant: "destructive",
      });
      setIsExporting(false);
    }
  }, [captureFrame, onStartAnimation, onPauseAnimation, onResetAnimation, totalSteps]);

  const startExport = () => {
    if (exportFormat === 'gif') {
      exportAsGIF();
    } else {
      exportAsFrames();
    }
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Animation Export
        </CardTitle>
        <CardDescription>
          Export the storm progression animation as GIF or individual frames
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gif">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Animated GIF
                </div>
              </SelectItem>
              <SelectItem value="frames">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  PNG Frame Sequence
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {exportFormat === 'gif' 
              ? 'Creates a single animated GIF file'
              : 'Downloads individual PNG frames for video editing'}
          </p>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Recording progress</span>
              <span className="font-semibold">{exportProgress}%</span>
            </div>
            <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={startExport}
          disabled={isExporting}
          className="w-full flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Recording Animation...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Animation
            </>
          )}
        </Button>

        {/* Info */}
        <div className="p-3 rounded-lg border border-border bg-accent/20 space-y-1">
          <p className="text-xs font-semibold text-foreground">Export Notes</p>
          <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
            <li>Animation will play automatically during export</li>
            <li>GIF export may take 10-30 seconds to process</li>
            <li>Frame sequence is useful for creating videos in editing software</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
