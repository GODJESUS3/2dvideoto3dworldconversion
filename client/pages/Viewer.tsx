import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Share2,
  Settings,
  Fullscreen,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import HollywoodViewer from "@/components/HollywoodViewer";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ProcessingStatus {
  jobId: string;
  status: "processing" | "completed" | "failed";
  progress: {
    stage: "extracting" | "estimating" | "reconstructing" | "rendering";
    progress: number;
    currentFrame?: number;
    totalFrames?: number;
  };
  error?: string;
}

export default function Viewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const mode = searchParams.get("mode") || "hollywood";

  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState([75]);
  const [enableShadows, setEnableShadows] = useState(true);
  const [enableParticles, setEnableParticles] = useState(true);
  const [processingStatus, setProcessingStatus] =
    useState<ProcessingStatus | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (response.ok) {
          const status = await response.json();
          setProcessingStatus(status);

          // Continue polling if still processing
          if (status.status === "processing") {
            setTimeout(pollStatus, 1000);
          }
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };

    pollStatus();
  }, [jobId]);

  const handleBack = () => {
    navigate("/");
  };

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    alert("Download functionality coming soon!");
  };

  const handleShare = () => {
    // Placeholder for share functionality
    alert("Share functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center">
                  {mode === "hollywood" ? (
                    <>
                      <Award className="h-5 w-5 text-purple-400 mr-2" />
                      Hollywood Gaussian Splatting
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 text-blue-400 mr-2" />
                      Standard AI Conversion
                    </>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {processingStatus?.status === "processing"
                    ? `${mode === "hollywood" ? "Gaussian Splatting" : "AI Processing"}: ${processingStatus.progress.stage}`
                    : `${mode === "hollywood" ? "Cinema-Quality" : "High-Quality"} 3D World Generated`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Controls
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleFullscreen}>
                <Fullscreen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 h-screen flex flex-col lg:flex-row">
        {/* Hollywood-Level 3D Viewer */}
        <div className="flex-1 relative">
          <HollywoodViewer
            jobId={jobId || undefined}
            className="w-full h-full"
          />

          {/* Processing Progress Overlay */}
          {processingStatus?.status === "processing" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Card className="p-8 glass max-w-md w-full mx-4">
                <div className="text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                  <p className="text-muted-foreground mb-4 capitalize">
                    {processingStatus.progress.stage.replace(/([A-Z])/g, " $1")}
                  </p>
                  <Progress
                    value={processingStatus.progress.progress}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {Math.round(processingStatus.progress.progress)}%
                    </span>
                    {processingStatus.progress.currentFrame && (
                      <span>
                        Frame {processingStatus.progress.currentFrame} /{" "}
                        {processingStatus.progress.totalFrames}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        {showControls && (
          <div className="w-full lg:w-80 p-4 lg:p-6 glass border-t lg:border-t-0 lg:border-l border-border overflow-y-auto max-h-96 lg:max-h-none">
            <h2 className="text-xl font-semibold mb-6">Scene Settings</h2>

            <div className="space-y-6">
              {/* Quality Settings */}
              <Card className="p-4 glass">
                <h3 className="font-medium mb-4">Rendering Quality</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Quality: {quality[0]}%</Label>
                    <Slider
                      value={quality}
                      onValueChange={setQuality}
                      max={100}
                      min={25}
                      step={25}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shadows">Shadows</Label>
                    <Switch
                      id="shadows"
                      checked={enableShadows}
                      onCheckedChange={setEnableShadows}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="particles">Particles</Label>
                    <Switch
                      id="particles"
                      checked={enableParticles}
                      onCheckedChange={setEnableParticles}
                    />
                  </div>
                </div>
              </Card>

              {/* Camera Settings */}
              <Card className="p-4 glass">
                <h3 className="font-medium mb-4">Camera</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    Reset View
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Top View
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Side View
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Front View
                  </Button>
                </div>
              </Card>

              {/* Animation Settings */}
              <Card className="p-4 glass">
                <h3 className="font-medium mb-4">Animation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-rotate">Auto Rotate</Label>
                    <Switch id="auto-rotate" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="floating-objects">Floating Animation</Label>
                    <Switch id="floating-objects" defaultChecked />
                  </div>
                </div>
              </Card>

              {/* Export Options */}
              <Card className="p-4 glass">
                <h3 className="font-medium mb-4">Export</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Download as GLB
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Export as OBJ
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Share Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gradient-primary text-white"
                  >
                    Create New Project
                  </Button>
                </div>
              </Card>

              {/* Information */}
              <Card className="p-4 glass">
                <h3 className="font-medium mb-4">Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Vertices:</span>
                    <span>45,892</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Faces:</span>
                    <span>89,654</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span>2m 34s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span>15.2 MB</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
