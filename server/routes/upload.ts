import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { videoProcessingService } from "../services/VideoProcessingService";

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"));
    }
  },
});

export const uploadMiddleware = upload.single("video");

export const handleVideoUpload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    // Get processing options from request body or use defaults
    const mode = req.body.mode || "hollywood"; // Default to Hollywood!
    const quality = req.body.quality || "high";
    const maxFrames = parseInt(req.body.maxFrames) || 192;

    console.log(
      `🎬 Starting ${mode.toUpperCase()}-level processing for: ${req.file.originalname}`,
    );
    console.log(`⚙️ Settings: Quality=${quality}, Frames=${maxFrames}`);

    // Start real Gaussian Splatting or standard processing
    const jobId = await videoProcessingService.startProcessing(req.file.path, {
      mode,
      quality,
      maxFrames,
    });

    res.json({
      message: `Video uploaded successfully - Starting ${mode.toUpperCase()} conversion`,
      jobId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mode,
      quality,
      maxFrames,
      status: "processing",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
};

export const handleProcessingStatus: RequestHandler = (req, res) => {
  const { jobId } = req.params;
  const job = videoProcessingService.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    metadata: job.metadata,
    startTime: job.startTime,
    estimatedCompletion: job.estimatedCompletion,
    error: job.error,
  });
};

export interface VideoUploadResponse {
  message: string;
  jobId: string;
  filename: string;
  originalName: string;
  size: number;
  status: string;
}
