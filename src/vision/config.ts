/**
 * Shared constants for the vision tracking pipeline.
 *
 * DETECTION_INTERVAL_MS: pose detection is polled at 2 fps (500ms).
 * This balances UI responsiveness with CPU/battery usage on mid-range
 * devices. For high-performance devices the native TF backend can drive
 * this down to ~100ms (10 fps) once the GPU delegate is enabled.
 */
export const DETECTION_INTERVAL_MS = 500;
