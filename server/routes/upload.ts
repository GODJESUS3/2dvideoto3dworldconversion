import { RequestHandler } from "express";
import multer from "multer";
import path from "path";

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

    // Simulate video processing
    const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds

    setTimeout(() => {
      // In a real application, this would trigger actual 3D conversion processing
      console.log(`Processing video: ${req.file!.filename}`);
    }, processingTime);

    res.json({
      message: "Video uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      processingTime: Math.ceil(processingTime / 1000),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
};

export interface VideoUploadResponse {
  message: string;
  filename: string;
  originalName: string;
  size: number;
  processingTime: number;
}
