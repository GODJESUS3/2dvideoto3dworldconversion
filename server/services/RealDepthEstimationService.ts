import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export interface DepthFrame {
  frameIndex: number;
  width: number;
  height: number;
  depthMap: Float32Array;
  confidence?: Float32Array; // Confidence map for depth values
  timestamp: number;
}

export interface ProcessingProgress {
  stage: "extracting" | "estimating" | "reconstructing" | "rendering";
  progress: number;
  currentFrame?: number;
  totalFrames?: number;
}

export interface DepthEstimationOptions {
  model?: "midas" | "zoedepth" | "dpt";
  quality?: "low" | "medium" | "high" | "insane";
  maxFrames?: number;
  skipFrames?: number;
}

export class RealDepthEstimationService {
  private pythonEnv: string;
  private isInitialized = false;

  constructor() {
    // Use conda environment or system python
    this.pythonEnv = process.env.PYTHON_ENV || "python";
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🧠 Initializing Real AI Depth Estimation...");

      // Check if Python environment is available
      await this.checkPythonEnvironment();

      // Download models if needed
      await this.ensureModelsAvailable();

      this.isInitialized = true;
      console.log("✅ Real Depth Estimation initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize depth estimation:", error);
      throw error;
    }
  }

  private async checkPythonEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkCmd = spawn(
        this.pythonEnv,
        ["-c", "import torch, torchvision, cv2, numpy; print('OK')"],
        {
          stdio: "pipe",
        },
      );

      let output = "";
      checkCmd.stdout.on("data", (data) => {
        output += data.toString();
      });

      checkCmd.on("close", (code) => {
        if (code === 0 && output.includes("OK")) {
          console.log("✅ Python environment check passed");
          resolve();
        } else {
          reject(
            new Error(
              "Python environment missing required packages: torch, torchvision, opencv-python, numpy",
            ),
          );
        }
      });
    });
  }

  private async ensureModelsAvailable(): Promise<void> {
    const modelsDir = path.join(process.cwd(), "models");
    await fs.mkdir(modelsDir, { recursive: true });

    // Check if MiDaS model exists
    const midasPath = path.join(modelsDir, "midas_v21_small.pt");
    try {
      await fs.access(midasPath);
      console.log("✅ MiDaS model found");
    } catch {
      console.log("📥 Downloading MiDaS model...");
      await this.downloadMidasModel(midasPath);
    }
  }

  private async downloadMidasModel(targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const downloadScript = `
import torch
import urllib.request
import os

def download_midas():
    url = "https://github.com/intel-isl/MiDaS/releases/download/v2_1/midas_v21_small-70d51b78.pt"
    target = "${targetPath}"
    
    print("Downloading MiDaS model...")
    urllib.request.urlretrieve(url, target)
    print(f"Downloaded to {target}")

if __name__ == "__main__":
    download_midas()
`;

      const scriptPath = path.join(process.cwd(), "temp_download_midas.py");
      fs.writeFile(scriptPath, downloadScript).then(() => {
        const downloadCmd = spawn(this.pythonEnv, [scriptPath]);

        downloadCmd.stdout.on("data", (data) => {
          console.log(`📥 ${data.toString().trim()}`);
        });

        downloadCmd.on("close", async (code) => {
          await fs.unlink(scriptPath).catch(() => {}); // Clean up script
          if (code === 0) {
            resolve();
          } else {
            reject(new Error("Failed to download MiDaS model"));
          }
        });
      });
    });
  }

  async processVideoFrames(
    videoPath: string,
    onProgress?: (progress: ProcessingProgress) => void,
    options: DepthEstimationOptions = {},
  ): Promise<DepthFrame[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      model = "midas",
      quality = "high",
      maxFrames = 100,
      skipFrames = 1,
    } = options;

    console.log(
      `🧠 Starting Real AI Depth Estimation with ${model.toUpperCase()}...`,
    );

    try {
      // Step 1: Extract frames from video
      const framesDir = await this.extractFrames(
        videoPath,
        maxFrames,
        skipFrames,
        onProgress,
      );

      // Step 2: Process frames with real AI model
      const depthFrames = await this.processFramesWithAI(
        framesDir,
        model,
        quality,
        onProgress,
      );

      console.log(
        `🎊 Real AI depth estimation completed: ${depthFrames.length} frames`,
      );
      return depthFrames;
    } catch (error) {
      console.error("❌ Real depth estimation failed:", error);
      throw error;
    }
  }

  private async extractFrames(
    videoPath: string,
    maxFrames: number,
    skipFrames: number,
    onProgress?: (progress: ProcessingProgress) => void,
  ): Promise<string> {
    const framesDir = path.join(
      process.cwd(),
      "temp",
      "frames",
      Date.now().toString(),
    );
    await fs.mkdir(framesDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        "-i",
        videoPath,
        "-vf",
        `select='not(mod(n\\,${skipFrames}))'`,
        "-vsync",
        "vfr",
        "-frames:v",
        maxFrames.toString(),
        "-q:v",
        "2", // High quality
        path.join(framesDir, "frame_%06d.png"),
      ];

      const ffmpegCmd = spawn("ffmpeg", ffmpegArgs);
      let frameCount = 0;

      ffmpegCmd.stderr.on("data", (data) => {
        const output = data.toString();
        const frameMatch = output.match(/frame=\s*(\d+)/);
        if (frameMatch) {
          frameCount = parseInt(frameMatch[1]);
          if (onProgress) {
            onProgress({
              stage: "extracting",
              progress: Math.min((frameCount / maxFrames) * 30, 30),
              currentFrame: frameCount,
              totalFrames: maxFrames,
            });
          }
        }
      });

      ffmpegCmd.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ Extracted ${frameCount} frames`);
          resolve(framesDir);
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });
    });
  }

  private async processFramesWithAI(
    framesDir: string,
    model: string,
    quality: string,
    onProgress?: (progress: ProcessingProgress) => void,
  ): Promise<DepthFrame[]> {
    const depthScript = this.generateDepthProcessingScript(
      framesDir,
      model,
      quality,
    );
    const scriptPath = path.join(process.cwd(), "temp_depth_processing.py");

    await fs.writeFile(scriptPath, depthScript);

    return new Promise((resolve, reject) => {
      const pythonCmd = spawn(this.pythonEnv, [scriptPath]);

      const depthFrames: DepthFrame[] = [];
      let outputBuffer = "";

      pythonCmd.stdout.on("data", (data) => {
        outputBuffer += data.toString();

        // Parse progress and results
        const lines = outputBuffer.split("\n");
        outputBuffer = lines.pop() || ""; // Keep incomplete line

        for (const line of lines) {
          if (line.startsWith("PROGRESS:")) {
            const progressData = JSON.parse(line.substring(9));
            if (onProgress) {
              onProgress({
                stage: "estimating",
                progress: 30 + progressData.progress * 0.5, // 30-80% range
                currentFrame: progressData.frame,
                totalFrames: progressData.total,
              });
            }
          } else if (line.startsWith("RESULT:")) {
            const frameData = JSON.parse(line.substring(7));
            depthFrames.push({
              frameIndex: frameData.index,
              width: frameData.width,
              height: frameData.height,
              depthMap: new Float32Array(frameData.depth),
              confidence: frameData.confidence
                ? new Float32Array(frameData.confidence)
                : undefined,
              timestamp: frameData.timestamp,
            });
          }
        }
      });

      pythonCmd.stderr.on("data", (data) => {
        const error = data.toString();
        if (!error.includes("Warning")) {
          console.error("Python Error:", error);
        }
      });

      pythonCmd.on("close", async (code) => {
        await fs.unlink(scriptPath).catch(() => {}); // Clean up script
        if (code === 0) {
          resolve(depthFrames);
        } else {
          reject(new Error(`Python depth processing failed with code ${code}`));
        }
      });
    });
  }

  private generateDepthProcessingScript(
    framesDir: string,
    model: string,
    quality: string,
  ): string {
    return `
import torch
import torchvision.transforms as transforms
import cv2
import numpy as np
import os
import json
import sys
from pathlib import Path

def load_midas_model():
    """Load MiDaS model for depth estimation"""
    model_path = "${path.join(process.cwd(), "models", "midas_v21_small.pt")}"
    
    # Load MiDaS model
    model = torch.hub.load('intel-isl/MiDaS', 'MiDaS_small', pretrained=True)
    model.eval()
    
    if torch.cuda.is_available():
        model = model.cuda()
        print("🚀 Using GPU acceleration")
    else:
        print("💻 Using CPU processing")
    
    return model

def process_frame(model, frame_path, device):
    """Process single frame with MiDaS"""
    # Load and preprocess image
    img = cv2.imread(frame_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # MiDaS preprocessing
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((384, 384)),  # MiDaS input size
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    input_tensor = transform(img_rgb).unsqueeze(0)
    if torch.cuda.is_available():
        input_tensor = input_tensor.cuda()
    
    # Generate depth map
    with torch.no_grad():
        depth = model(input_tensor)
        
        # Resize to original image dimensions
        depth = torch.nn.functional.interpolate(
            depth.unsqueeze(1),
            size=img.shape[:2],
            mode='bicubic',
            align_corners=False
        ).squeeze()
    
    # Convert to numpy and normalize
    depth_np = depth.cpu().numpy()
    depth_normalized = (depth_np - depth_np.min()) / (depth_np.max() - depth_np.min())
    
    # Generate confidence map (simplified)
    gradient_x = np.abs(np.gradient(depth_normalized, axis=1))
    gradient_y = np.abs(np.gradient(depth_normalized, axis=0))
    confidence = 1.0 - np.clip(gradient_x + gradient_y, 0, 1)
    
    return depth_normalized, confidence

def main():
    frames_dir = "${framesDir}"
    model = load_midas_model()
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Get list of frame files
    frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.png')])
    total_frames = len(frame_files)
    
    print(f"Processing {total_frames} frames with ${model.toUpperCase()} model...")
    
    for i, frame_file in enumerate(frame_files):
        frame_path = os.path.join(frames_dir, frame_file)
        
        # Process frame
        depth, confidence = process_frame(model, frame_path, device)
        
        # Get image dimensions
        img = cv2.imread(frame_path)
        height, width = img.shape[:2]
        
        # Prepare result
        result = {
            'index': i,
            'width': width,
            'height': height,
            'depth': depth.flatten().tolist(),
            'confidence': confidence.flatten().tolist(),
            'timestamp': i * (1/30)  # Assume 30fps
        }
        
        # Output result
        print(f"RESULT:{json.dumps(result)}")
        
        # Output progress
        progress = {
            'frame': i + 1,
            'total': total_frames,
            'progress': ((i + 1) / total_frames) * 100
        }
        print(f"PROGRESS:{json.dumps(progress)}")
        
        sys.stdout.flush()
    
    print("✅ Depth estimation completed!")

if __name__ == "__main__":
    main()
`;
  }

  async cleanup(): Promise<void> {
    // Clean up temporary files
    const tempDir = path.join(process.cwd(), "temp");
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

export const realDepthEstimationService = new RealDepthEstimationService();
