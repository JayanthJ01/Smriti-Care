/**
 * Phase 2 — centralized tunable thresholds.
 * Elderly-friendly: tolerant angles, smoothing, consecutive-frame confirmation.
 * No numeric thresholds scattered in UI components.
 */

export const FACE_DETECTION_CONFIG = {
  /** Minimum landmark confidence to treat a face as present (0..1). */
  minPresenceScore: 0.5,
  /** How often to run landmark detection (ms). Keeps tablets smooth. */
  detectIntervalMs: 120,
  /** Max faces allowed — more than 1 triggers gentle multiple-faces guidance. */
  maxFaces: 1,
  /** Bounding-box width fraction below which we suggest moving closer. */
  minFaceWidthFraction: 0.16,
  /** Center tolerance (fraction of frame) before suggesting to recenter. */
  centerToleranceFraction: 0.28,
  /** Model asset URL (MediaPipe Tasks Vision, loaded locally in browser, no uploads). */
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  /** WASM asset base for Tasks Vision runtime. */
  wasmBasePath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm',
} as const;

export const HEAD_MOVEMENT_CONFIG = {
  /**
   * Yaw proxy thresholds (radians-ish, derived from landmarks).
   * Positive = user's right on mirrored preview; tuned tolerant for elders.
   */
  leftYawThreshold: 0.14,
  rightYawThreshold: 0.14,
  /** Consecutive valid frames required before accepting LEFT / RIGHT. */
  requiredConsecutiveFrames: 4,
  /** Exponential smoothing factor for yaw signal (0..1, higher = smoother). */
  smoothingAlpha: 0.45,
  /** Max time to hold waiting_for_left/right before gentle re-prompt (ms, 0 = no timeout). */
  stepTimeoutMs: 45000,
} as const;

export type VerificationStep = 'face' | 'left' | 'right';
