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
  const [processingMode, setProcessingMode] = useState<
    "hollywood" | "standard"
  >("hollywood");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("high");

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
      // Upload video with Hollywood/Standard mode settings
      const formData = new FormData();
      formData.append("video", uploadedFile);
      formData.append("mode", processingMode);
      formData.append("quality", quality);
      formData.append("maxFrames", "192");

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
      const estimatedTime = processingMode === "hollywood" ? 6000 : 3000;
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
              Experience the future of content creation. Upload any 2D video and
              watch it come alive as an immersive 3D environment powered by
              cutting-edge AI technology.
            </p>
          </div>

          {/* Processing Mode Selection */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-6 glass border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Choose Your Processing Mode
              </h3>

              <RadioGroup
                value={processingMode}
                onValueChange={(value: "hollywood" | "standard") =>
                  setProcessingMode(value)
                }
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Hollywood Mode */}
                <div className="relative">
                  <RadioGroupItem
                    value="hollywood"
                    id="hollywood"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="hollywood"
                    className="flex flex-col p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border-2 border-purple-500/30 cursor-pointer hover:border-purple-400/50 peer-checked:border-purple-400 peer-checked:bg-gradient-to-br peer-checked:from-purple-900/40 peer-checked:to-pink-900/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Award className="h-6 w-6 text-purple-400" />
                        <span className="text-lg font-semibold">
                          Hollywood Mode
                        </span>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Premium
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Real Gaussian Splatting with COLMAP calibration.
                      Professional-grade 3D reconstruction used in Hollywood
                      films.
                    </p>
                    <div className="text-xs text-purple-300 space-y-1">
                      <div>• Real GPU-accelerated processing</div>
                      <div>• 25,000 iteration training</div>
                      <div>• Cinema-quality results</div>
                      <div>• Processing time: 5-15 minutes</div>
                    </div>
                  </Label>
                </div>

                {/* Standard Mode */}
                <div className="relative">
                  <RadioGroupItem
                    value="standard"
                    id="standard"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="standard"
                    className="flex flex-col p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border-2 border-blue-500/30 cursor-pointer hover:border-blue-400/50 peer-checked:border-blue-400 peer-checked:bg-gradient-to-br peer-checked:from-blue-900/40 peer-checked:to-cyan-900/40 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-6 w-6 text-blue-400" />
                        <span className="text-lg font-semibold">
                          Standard Mode
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-blue-400 text-blue-400"
                      >
                        Fast
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI-powered depth estimation with advanced algorithms.
                      High-quality 3D reconstruction for quick results.
                    </p>
                    <div className="text-xs text-blue-300 space-y-1">
                      <div>• Advanced depth estimation</div>
                      <div>• Smart point cloud generation</div>
                      <div>• High-quality results</div>
                      <div>• Processing time: 1-3 minutes</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Quality Selection */}
              {processingMode === "hollywood" && (
                <div className="mt-6 pt-6 border-t border-border">
                  <Label className="text-sm font-medium mb-3 block">
                    Quality Settings
                  </Label>
                  <Select
                    value={quality}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setQuality(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        Low Quality (5,000 iterations - 2 min)
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium Quality (15,000 iterations - 8 min)
                      </SelectItem>
                      <SelectItem value="high">
                        High Quality (25,000 iterations - 15 min)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                      className={`glow ${processingMode === "hollywood" ? "gradient-primary" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          {processingMode === "hollywood"
                            ? "Hollywood Processing..."
                            : "Standard Processing..."}
                        </>
                      ) : (
                        <>
                          {processingMode === "hollywood" ? (
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
              World-Class 3D Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose between lightning-fast AI processing or cinema-grade
              Gaussian Splatting used in Hollywood productions for
              photorealistic 3D reconstruction
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

            <Card className="p-8 glass hover:glow transition-all duration-300">
              <Box className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Interactive 3D</h3>
              <p className="text-muted-foreground">
                Navigate through your converted videos in full 3D space with
                mouse and keyboard controls
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to transform your videos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Video</h3>
              <p className="text-muted-foreground">
                Simply drag and drop your 2D video file into our secure upload
                interface
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Processing</h3>
              <p className="text-muted-foreground">
                Our AI analyzes depth, motion, and spatial relationships to
                reconstruct 3D geometry
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Explore 3D</h3>
              <p className="text-muted-foreground">
                Navigate and interact with your video content in an immersive 3D
                environment
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
