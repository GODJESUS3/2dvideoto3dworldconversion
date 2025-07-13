import { useState, useCallback } from "react";
import {
  Upload,
  Play,
  Sparkles,
  Zap,
  Box,
  ArrowRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);

    // Navigate to 3D viewer
    navigate("/viewer");
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
                      className="gradient-primary glow"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Generate 3D World
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
            <h2 className="text-4xl font-bold mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our cutting-edge technology transforms flat videos into immersive
              3D experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 glass hover:glow transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                AI Depth Estimation
              </h3>
              <p className="text-muted-foreground">
                Advanced machine learning models analyze each frame to
                understand spatial relationships and depth
              </p>
            </Card>

            <Card className="p-8 glass hover:glow transition-all duration-300">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Real-time Processing
              </h3>
              <p className="text-muted-foreground">
                Lightning-fast conversion powered by GPU acceleration and
                optimized algorithms
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
              <Cube className="h-6 w-6 text-primary" />
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
