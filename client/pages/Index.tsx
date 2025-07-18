import { useState, useCallback } from "react";
import {
  Upload,
  Play,
  Sparkles,
  Zap,
  Box,
  ArrowRight,
  Menu,
  Star,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Always use FUSION mode with MAXIMUM SETTINGS - Cinema Grade Only!
  const processingMode = "fusion";
  const quality = "insane"; // Fixed: INSANE quality only (50,000 iterations)
  const fusionMode = "ultimate"; // Fixed: Ultimate enhancement only

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const processVideo = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    try {
      // Upload video with processing mode settings
      const formData = new FormData();
      formData.append("video", uploadedFile);
      formData.append("mode", processingMode);
      formData.append("quality", quality);
      formData.append("maxFrames", "192");
      if (processingMode === "fusion") {
        formData.append("fusionMode", fusionMode);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log(
        `🎬 Starting ${processingMode.toUpperCase()}-level conversion...`,
        result,
      );

      // Simulate processing time while real AI works
      const estimatedTime =
        processingMode === "fusion"
          ? 8000
          : processingMode === "hollywood"
            ? 6000
            : 3000;
      await new Promise((resolve) => setTimeout(resolve, estimatedTime));

      // Navigate to 3D viewer with job ID
      navigate(`/viewer?jobId=${result.jobId}&mode=${processingMode}`);
    } catch (error) {
      console.error("❌ Processing failed:", error);
      alert("Processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Box className="h-8 w-8 text-gradient" />
              <span className="text-xl font-bold text-gradient">Dimension</span>
            </div>
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#features"
                className="text-foreground/80 hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-foreground/80 hover:text-foreground"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-foreground/80 hover:text-foreground"
              >
                Pricing
              </a>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
            <div className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="text-gradient block">2D Videos</span>
              Into 3D Worlds
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Revolutionary FUSION technology combining lightning-fast AI with
              Hollywood-grade Gaussian Splatting. Upload any 2D video and watch
              it transform into a cinema-quality 3D world with INSANE detail and
              realism.
            </p>
          </div>

          {/* FUSION Quality Settings */}
          <div className="max-w-3xl mx-auto mb-8">
            <Card className="p-8 glass border border-violet-500/30 glow">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <span className="text-4xl">🔥</span>
                  <h3 className="text-3xl font-bold text-red-400">
                    INSANE FUSION
                  </h3>
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse text-lg px-4 py-2">
                    CINEMA GRADE
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  Maximum quality 50,000 iteration processing with ultimate
                  enhancement - Hollywood standard
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Fixed INSANE Quality */}
                <div className="text-center p-6 bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-lg border-2 border-red-400/50 glow">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <span className="text-3xl">����</span>
                    <h4 className="text-xl font-bold text-red-300">
                      INSANE Quality
                    </h4>
                  </div>
                  <div className="text-red-200 space-y-1">
                    <p className="text-lg font-semibold">50,000 Iterations</p>
                    <p className="text-sm">Cinema Grade</p>
                    <p className="text-sm">30 minutes</p>
                  </div>
                </div>

                {/* Enhancement Mode */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    🚀 Ultimate Enhancement (Fixed)
                  </Label>
                  <Select
                    value={fusionMode}
                    onValueChange={(value: "fast" | "balanced" | "ultimate") =>
                      setFusionMode(value)
                    }
                    disabled
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select enhancement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">⚡ Fast Enhancement</SelectItem>
                      <SelectItem value="balanced">
                        ⚖�� Balanced Enhancement
                      </SelectItem>
                      <SelectItem value="ultimate">
                        🚀 Ultimate Enhancement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FUSION Pipeline Preview */}
              <div className="mt-6 p-4 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 rounded-lg border border-violet-500/20">
                <h4 className="text-sm font-medium mb-3 text-violet-300">
                  FUSION Pipeline:
                </h4>
                <div className="grid grid-cols-5 gap-2 text-xs text-violet-200">
                  <div className="text-center">⚡ AI Preprocessing</div>
                  <div className="text-center">🧠 Depth Analysis</div>
                  <div className="text-center">🔮 Enhancement</div>
                  <div className="text-center">🎬 Gaussian Training</div>
                  <div className="text-center">✨ Fusion Output</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 glass glow">
              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-border hover:border-primary/50 hover:bg-accent/5"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">
                    Upload Your Video
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload">
                    <Button className="gradient-primary glow">
                      Choose Video File
                    </Button>
                  </label>
                  <p className="text-sm text-muted-foreground mt-4">
                    Supports MP4, MOV, AVI, WebM • Max 500MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-accent/10 rounded-lg p-6 mb-6">
                    <Play className="h-12 w-12 text-primary mx-auto mb-3" />
                    <h3 className="text-xl font-semibold mb-1">
                      {uploadedFile.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setUploadedFile(null)}
                    >
                      Choose Different File
                    </Button>
                    <Button
                      onClick={processVideo}
                      disabled={isProcessing}
                      className={`glow ${
                        processingMode === "fusion"
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                          : processingMode === "hollywood"
                            ? "gradient-primary"
                            : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          {processingMode === "fusion"
                            ? "🚀 FUSION Processing..."
                            : processingMode === "hollywood"
                              ? "Hollywood Processing..."
                              : "Standard Processing..."}
                        </>
                      ) : (
                        <>
                          {processingMode === "fusion" ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              🚀 FUSION Conversion
                            </>
                          ) : processingMode === "hollywood" ? (
                            <>
                              <Award className="mr-2 h-4 w-4" />
                              Hollywood Conversion
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Standard Conversion
                            </>
                          )}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Revolutionary FUSION Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powered by our exclusive FUSION algorithm that combines AI depth
              estimation with Gaussian Splatting for results that surpass
              anything available today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 glass hover:glow transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Award className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Gaussian Splatting</h3>
              <p className="text-muted-foreground">
                Hollywood-grade 3D reconstruction using the same technology
                behind blockbuster films and AAA video games
              </p>
            </Card>

            <Card className="p-8 glass hover:glow transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Sparkles className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">COLMAP Calibration</h3>
              <p className="text-muted-foreground">
                Professional camera calibration and structure-from-motion
                algorithms for pixel-perfect 3D accuracy
              </p>
            </Card>

            <Card className="p-8 glass hover:glow transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Zap className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">GPU Acceleration</h3>
              <p className="text-muted-foreground">
                25,000 iteration neural training with CUDA acceleration for
                photorealistic results in minutes, not hours
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How FUSION Works</h2>
            <p className="text-xl text-muted-foreground">
              Five revolutionary stages to transform your 2D videos into
              cinema-quality 3D worlds
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">
                ⚡ AI Preprocessing
              </h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast frame extraction and AI enhancement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">🧠 Depth Analysis</h3>
              <p className="text-sm text-muted-foreground">
                AI depth estimation provides intelligent guidance
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-pink-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">🔮 Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                AI-enhanced frame preparation for optimal quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">
                🎬 Gaussian Training
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-guided Gaussian Splatting with up to 50K iterations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                5
              </div>
              <h3 className="text-lg font-semibold mb-2">✨ Fusion Output</h3>
              <p className="text-sm text-muted-foreground">
                Revolutionary fusion creates cinema-quality 3D worlds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Box className="h-6 w-6 text-primary" />
              <span className="font-semibold">Dimension</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 Dimension. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
