import { EventEmitter } from "events";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { spawn } from "child_process";

interface SystemResources {
  cpuCount: number;
  totalMemory: number;
  availableMemory: number;
  gpuAvailable: boolean;
  gpuMemory?: number;
}

interface ProcessingQueue {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedDuration: number;
  resourceRequirement: "cpu" | "gpu" | "mixed";
}

export class ProductionOptimizations extends EventEmitter {
  private maxConcurrentJobs: number = 2;
  private activeJobs = new Map<string, ProcessingQueue>();
  private jobQueue: ProcessingQueue[] = [];
  private systemResources: SystemResources;
  private isMonitoring = false;

  constructor() {
    super();
    this.systemResources = this.getSystemResources();
    this.startResourceMonitoring();
  }

  private getSystemResources(): SystemResources {
    const cpuCount = os.cpus().length;
    const totalMemory = os.totalmem();
    const availableMemory = os.freemem();

    return {
      cpuCount,
      totalMemory,
      availableMemory,
      gpuAvailable: false, // Will be updated by GPU check
    };
  }

  private async checkGPUAvailability(): Promise<void> {
    try {
      const pythonScript = `
import torch
import json
import sys

def check_gpu():
    result = {
        'available': torch.cuda.is_available(),
        'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
        'memory': 0
    }
    
    if result['available']:
        try:
            result['memory'] = torch.cuda.get_device_properties(0).total_memory
            result['device_name'] = torch.cuda.get_device_name(0)
        except:
            pass
    
    print(json.dumps(result))

if __name__ == "__main__":
    check_gpu()
`;

      const scriptPath = path.join(os.tmpdir(), "check_gpu.py");
      await fs.writeFile(scriptPath, pythonScript);

      const pythonProcess = spawn("python", [scriptPath]);
      let output = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        try {
          await fs.unlink(scriptPath);
          if (code === 0) {
            const gpuInfo = JSON.parse(output.trim());
            this.systemResources.gpuAvailable = gpuInfo.available;
            this.systemResources.gpuMemory = gpuInfo.memory;

            if (gpuInfo.available) {
              console.log(
                `🚀 GPU Available: ${gpuInfo.device_name} (${Math.round(gpuInfo.memory / 1024 / 1024 / 1024)}GB)`,
              );
              this.maxConcurrentJobs = Math.min(
                4,
                this.systemResources.cpuCount,
              );
            } else {
              console.log("💻 GPU not available, using CPU processing");
              this.maxConcurrentJobs = Math.max(
                1,
                Math.floor(this.systemResources.cpuCount / 2),
              );
            }
          }
        } catch (error) {
          console.log("⚠️  GPU check failed, assuming CPU-only");
        }
      });
    } catch (error) {
      console.log("⚠️  Unable to check GPU, assuming CPU-only");
    }
  }

  private startResourceMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.checkGPUAvailability();

    // Monitor system resources every 30 seconds
    setInterval(() => {
      this.updateSystemResources();
      this.processQueue();
    }, 30000);

    console.log("📊 Resource monitoring started");
  }

  private updateSystemResources(): void {
    this.systemResources.availableMemory = os.freemem();

    // Adjust max concurrent jobs based on available memory
    const memoryUsagePercent =
      ((this.systemResources.totalMemory -
        this.systemResources.availableMemory) /
        this.systemResources.totalMemory) *
      100;

    if (memoryUsagePercent > 85) {
      this.maxConcurrentJobs = Math.max(1, this.maxConcurrentJobs - 1);
      console.log("⚠️  High memory usage, reducing concurrent jobs");
    } else if (
      memoryUsagePercent < 50 &&
      this.activeJobs.size < this.maxConcurrentJobs
    ) {
      this.maxConcurrentJobs = Math.min(
        this.systemResources.gpuAvailable ? 4 : 2,
        this.maxConcurrentJobs + 1,
      );
    }
  }

  async queueJob(
    jobId: string,
    priority: "low" | "medium" | "high" | "critical",
    estimatedDuration: number,
    resourceRequirement: "cpu" | "gpu" | "mixed",
  ): Promise<boolean> {
    const job: ProcessingQueue = {
      id: jobId,
      priority,
      estimatedDuration,
      resourceRequirement,
    };

    // Check if we can start immediately
    if (this.activeJobs.size < this.maxConcurrentJobs) {
      this.activeJobs.set(jobId, job);
      this.emit("jobStarted", jobId);
      console.log(
        `🚀 Starting job ${jobId} immediately (${this.activeJobs.size}/${this.maxConcurrentJobs})`,
      );
      return true;
    }

    // Add to queue with priority sorting
    this.jobQueue.push(job);
    this.jobQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log(`📋 Job ${jobId} queued (${this.jobQueue.length} in queue)`);
    this.emit("jobQueued", jobId, this.jobQueue.length);
    return false;
  }

  private processQueue(): void {
    while (
      this.jobQueue.length > 0 &&
      this.activeJobs.size < this.maxConcurrentJobs
    ) {
      const job = this.jobQueue.shift()!;
      this.activeJobs.set(job.id, job);
      this.emit("jobStarted", job.id);
      console.log(
        `🚀 Starting queued job ${job.id} (${this.activeJobs.size}/${this.maxConcurrentJobs})`,
      );
    }
  }

  completeJob(jobId: string): void {
    if (this.activeJobs.has(jobId)) {
      this.activeJobs.delete(jobId);
      console.log(
        `✅ Job ${jobId} completed (${this.activeJobs.size}/${this.maxConcurrentJobs})`,
      );
      this.emit("jobCompleted", jobId);

      // Process next job in queue
      setImmediate(() => this.processQueue());
    }
  }

  failJob(jobId: string, error: string): void {
    if (this.activeJobs.has(jobId)) {
      this.activeJobs.delete(jobId);
      console.log(`❌ Job ${jobId} failed: ${error}`);
      this.emit("jobFailed", jobId, error);

      // Process next job in queue
      setImmediate(() => this.processQueue());
    }
  }

  getQueueStatus(): {
    activeJobs: number;
    queuedJobs: number;
    maxConcurrent: number;
    systemResources: SystemResources;
  } {
    return {
      activeJobs: this.activeJobs.size,
      queuedJobs: this.jobQueue.length,
      maxConcurrent: this.maxConcurrentJobs,
      systemResources: this.systemResources,
    };
  }

  // Memory management utilities
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    const tempDir = path.join(process.cwd(), "temp");
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

    try {
      const entries = await fs.readdir(tempDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(tempDir, entry.name);
        const stats = await fs.stat(fullPath);

        if (stats.mtime.getTime() < cutoffTime) {
          if (entry.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
            console.log(`🗑️  Cleaned up old temp directory: ${entry.name}`);
          } else {
            await fs.unlink(fullPath);
            console.log(`🗑️  Cleaned up old temp file: ${entry.name}`);
          }
        }
      }
    } catch (error) {
      console.log("⚠️  Temp cleanup failed:", error);
    }
  }

  // Error handling utilities
  createErrorHandler(context: string) {
    return (error: any) => {
      const errorInfo = {
        context,
        message: error.message || "Unknown error",
        stack: error.stack,
        timestamp: new Date().toISOString(),
        systemResources: this.systemResources,
      };

      console.error(`❌ ${context}:`, errorInfo);
      this.emit("error", errorInfo);

      // Log to file for production
      this.logError(errorInfo);
    };
  }

  private async logError(errorInfo: any): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), "logs");
      await fs.mkdir(logsDir, { recursive: true });

      const logFile = path.join(
        logsDir,
        `errors_${new Date().toISOString().split("T")[0]}.log`,
      );

      const logEntry = JSON.stringify(errorInfo) + "\n";
      await fs.appendFile(logFile, logEntry);
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
  }

  // Performance monitoring
  measurePerformance<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    return fn()
      .then((result) => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        console.log(
          `⚡ ${operation}: ${duration}ms, Memory: ${this.formatBytes(memoryDelta)}`,
        );

        this.emit("performance", {
          operation,
          duration,
          memoryDelta,
          timestamp: new Date().toISOString(),
        });

        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        console.log(`❌ ${operation} failed after ${duration}ms`);
        throw error;
      });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
  }

  // Health check
  getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy";
    details: any;
  } {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent =
      ((this.systemResources.totalMemory -
        this.systemResources.availableMemory) /
        this.systemResources.totalMemory) *
      100;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (
      memoryUsagePercent > 90 ||
      this.activeJobs.size >= this.maxConcurrentJobs
    ) {
      status = "degraded";
    }

    if (memoryUsagePercent > 95) {
      status = "unhealthy";
    }

    return {
      status,
      details: {
        activeJobs: this.activeJobs.size,
        queuedJobs: this.jobQueue.length,
        maxConcurrentJobs: this.maxConcurrentJobs,
        memoryUsage: {
          used: this.formatBytes(memoryUsage.heapUsed),
          total: this.formatBytes(memoryUsage.heapTotal),
          external: this.formatBytes(memoryUsage.external),
        },
        systemMemory: {
          used: this.formatBytes(
            this.systemResources.totalMemory -
              this.systemResources.availableMemory,
          ),
          total: this.formatBytes(this.systemResources.totalMemory),
          usagePercent: memoryUsagePercent.toFixed(1) + "%",
        },
        gpu: {
          available: this.systemResources.gpuAvailable,
          memory: this.systemResources.gpuMemory
            ? this.formatBytes(this.systemResources.gpuMemory)
            : "N/A",
        },
      },
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log("🛑 Initiating graceful shutdown...");

    // Wait for active jobs to complete (with timeout)
    const shutdownTimeout = 5 * 60 * 1000; // 5 minutes
    const startTime = Date.now();

    while (
      this.activeJobs.size > 0 &&
      Date.now() - startTime < shutdownTimeout
    ) {
      console.log(`⏳ Waiting for ${this.activeJobs.size} jobs to complete...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (this.activeJobs.size > 0) {
      console.log("⚠️  Force stopping remaining jobs due to timeout");
    }

    // Cleanup temp files
    await this.cleanupTempFiles(0); // Clean all temp files

    console.log("✅ Graceful shutdown completed");
  }
}

// Global instance
export const productionOptimizations = new ProductionOptimizations();

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  console.log("📡 Received SIGTERM");
  await productionOptimizations.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("📡 Received SIGINT");
  await productionOptimizations.shutdown();
  process.exit(0);
});

// Unhandled error handlers
process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);
  productionOptimizations.createErrorHandler("uncaughtException")(error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  productionOptimizations.createErrorHandler("unhandledRejection")(reason);
});
