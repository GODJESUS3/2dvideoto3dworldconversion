import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleVideoUpload,
  uploadMiddleware,
  handleProcessingStatus,
} from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  app.post("/api/upload", uploadMiddleware, handleVideoUpload);
  app.get("/api/status/:jobId", handleProcessingStatus);

  return app;
}
