/**
 * MallOS Enterprise - Mock Computer Vision Service
 * Temporary mock to avoid compilation errors while native dependencies are not available
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface CameraConfig {
  cameraId: string;
  mallId: string;
  url: string;
  location: string;
  type: 'security' | 'analytics';
  enabled: boolean;
}

export interface DetectionResult {
  id: string;
  timestamp: Date;
  cameraId: string;
  type: string;
  confidence: number;
  data: any;
}

export interface AlertConfig {
  type: string;
  enabled: boolean;
  threshold: number;
  cooldown: number;
}

export class ComputerVisionService extends EventEmitter {
  private cameras: Map<string, CameraConfig> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    logger.info('🎥 Mock Computer Vision Service initialized');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    logger.info('📹 Initializing Mock Computer Vision Service...');
    // Mock initialization
    this.isInitialized = true;
    logger.info('✅ Mock Computer Vision Service initialized');
  }

  async addCamera(config: CameraConfig): Promise<boolean> {
    logger.info(`📹 Adding mock camera: ${config.cameraId}`);
    this.cameras.set(config.cameraId, config);
    return true;
  }

  async removeCamera(cameraId: string): Promise<boolean> {
    logger.info(`📹 Removing mock camera: ${cameraId}`);
    return this.cameras.delete(cameraId);
  }

  async startDetection(cameraId: string): Promise<boolean> {
    logger.info(`▶️ Starting mock detection for camera: ${cameraId}`);
    
    // Emit mock detection events periodically
    setInterval(() => {
      const mockDetection: DetectionResult = {
        id: uuidv4(),
        timestamp: new Date(),
        cameraId,
        type: 'person',
        confidence: 0.85,
        data: { mockData: true }
      };
      
      this.emit('detection', mockDetection);
    }, 30000); // Every 30 seconds
    
    return true;
  }

  async stopDetection(cameraId: string): Promise<boolean> {
    logger.info(`⏹️ Stopping mock detection for camera: ${cameraId}`);
    return true;
  }

  async processFrame(cameraId: string, frameData: Buffer): Promise<DetectionResult[]> {
    // Mock frame processing
    return [{
      id: uuidv4(),
      timestamp: new Date(),
      cameraId,
      type: 'mock_detection',
      confidence: 0.75,
      data: { mockProcessing: true }
    }];
  }

  getCameraStatus(cameraId: string): any {
    const camera = this.cameras.get(cameraId);
    return {
      cameraId,
      connected: !!camera,
      status: camera ? 'active' : 'offline',
      lastFrame: new Date(),
      mockService: true
    };
  }

  getStatistics(): any {
    return {
      totalCameras: this.cameras.size,
      activeCameras: this.cameras.size,
      detectionsToday: 42, // Mock data
      alertsToday: 3,
      mockService: true
    };
  }

  async cleanup(): Promise<void> {
    logger.info('🧹 Cleaning up Mock Computer Vision Service...');
    this.cameras.clear();
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const computerVisionService = new ComputerVisionService();
