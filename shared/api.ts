/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Response type for video upload endpoint
 */
export interface VideoUploadResponse {
  message: string;
  jobId: string;
  filename: string;
  originalName: string;
  size: number;
  status: string;
}

/**
 * Request type for video processing
 */
export interface VideoProcessRequest {
  filename: string;
  options?: {
    quality?: "low" | "medium" | "high";
    enableShadows?: boolean;
    enableParticles?: boolean;
  };
}

/**
 * Processing status response
 */
export interface ProcessingStatusResponse {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: {
    stage: "extracting" | "estimating" | "reconstructing" | "rendering";
    progress: number;
    currentFrame?: number;
    totalFrames?: number;
    eta?: number;
  };
  metadata?: {
    duration: number;
    fps: number;
    width: number;
    height: number;
    format: string;
    size: number;
  };
  startTime: string;
  estimatedCompletion?: string;
  error?: string;
}
