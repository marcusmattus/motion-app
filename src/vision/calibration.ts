// src/vision/calibration.ts
// Captures a per-athlete baseline (their real "top" position + neutral posture)
// and derives rep thresholds from it. The depth/ROM target stays fixed for
// safety; only the "rep complete" lockout angle floats with their range so
// athletes with limited mobility still get clean reps.

import { ExerciseId, EXERCISES, RepThresholds } from './poseRules';

export interface Calibration {
  exercise: ExerciseId;
  /** The athlete's measured top/locked-out driving-joint angle (deg). */
  topAngle: number;
  /** Neutral torso angle captured while holding the start position (deg). */
  neutralTorso: number;
  /** When the baseline was captured. */
  at: number;
}

/**
 * Turn a captured calibration into per-athlete rep thresholds.
 * - `downBelow` (depth target) is held at the exercise default for safety.
 * - `upAbove` (rep-complete lockout) is set relative to *their* top angle so a
 *   limited range still registers a clean lockout.
 */
export function deriveThresholds(cal: Calibration | null, exercise: ExerciseId): RepThresholds {
  const def = EXERCISES[exercise];
  if (!cal || cal.exercise !== exercise) {
    return { downBelow: def.downBelow, upAbove: def.upAbove };
  }
  // Require coming within 8° of their measured top to count a rep, but never
  // ask for more than the exercise default (don't punish hypermobility either).
  const upAbove = Math.min(def.upAbove, Math.max(def.downBelow + 30, cal.topAngle - 8));
  return { downBelow: def.downBelow, upAbove };
}
