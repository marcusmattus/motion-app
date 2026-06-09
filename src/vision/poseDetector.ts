/**
 * Pose Detector — wraps @tensorflow-models/pose-detection with MoveNet.
 *
 * NOTE: Full TensorFlow.js execution requires @tensorflow/tfjs-react-native
 * and a platform-specific GPU delegate. This module provides the correct
 * API surface and falls back to mock keypoints when the native TF backend
 * is not available, enabling UI development without the native build step.
 */

export type Keypoint = {
  x: number; // normalized 0–1
  y: number; // normalized 0–1
  score: number; // confidence 0–1
  name: string;
};

export type PoseResult = {
  keypoints: Keypoint[];
  score: number;
};

export type ModelConfig = {
  modelType: 'MoveNet_Lightning' | 'MoveNet_Thunder';
  confidenceThreshold: number;
  enableSmoothing: boolean;
};

const DEFAULT_CONFIG: ModelConfig = {
  modelType: 'MoveNet_Thunder',
  confidenceThreshold: 0.35,
  enableSmoothing: true,
};

const KEYPOINT_NAMES = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

// Simulated idle keypoints representing a standing person (centered frame)
const STANDING_POSE: Array<[number, number]> = [
  [0.50, 0.10], // nose
  [0.48, 0.09], // left_eye
  [0.52, 0.09], // right_eye
  [0.46, 0.10], // left_ear
  [0.54, 0.10], // right_ear
  [0.44, 0.22], // left_shoulder
  [0.56, 0.22], // right_shoulder
  [0.40, 0.35], // left_elbow
  [0.60, 0.35], // right_elbow
  [0.38, 0.48], // left_wrist
  [0.62, 0.48], // right_wrist
  [0.45, 0.50], // left_hip
  [0.55, 0.50], // right_hip
  [0.44, 0.68], // left_knee
  [0.56, 0.68], // right_knee
  [0.43, 0.86], // left_ankle
  [0.57, 0.86], // right_ankle
];

let _config: ModelConfig = { ...DEFAULT_CONFIG };
let _initialized = false;

export async function initPoseDetector(config?: Partial<ModelConfig>): Promise<void> {
  if (config) {
    _config = { ..._config, ...config };
  }
  // In production: load TF model here
  _initialized = true;
}

export function getPoseDetectorConfig(): ModelConfig {
  return { ..._config };
}

export function updatePoseDetectorConfig(updates: Partial<ModelConfig>): void {
  _config = { ..._config, ...updates };
}

/**
 * Returns a simulated pose result for UI development.
 * Replace the body of this function with real TF inference
 * once @tensorflow/tfjs-react-native is set up.
 */
export async function detectPose(_frameData?: unknown): Promise<PoseResult | null> {
  if (!_initialized) return null;

  const noise = () => (Math.random() - 0.5) * 0.015;
  const keypoints: Keypoint[] = KEYPOINT_NAMES.map((name, i) => {
    const [bx, by] = STANDING_POSE[i];
    const score = 0.65 + Math.random() * 0.35;
    return { name, x: bx + noise(), y: by + noise(), score };
  });

  return {
    keypoints,
    score: keypoints.reduce((s, k) => s + k.score, 0) / keypoints.length,
  };
}

export function isInitialized(): boolean {
  return _initialized;
}
