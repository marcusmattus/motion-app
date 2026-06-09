// src/vision/poseRules.ts
// Reflex layer for the terminal build: rep counting + form scoring + cues.
// Pure math, zero network — runs every frame. The conversational/voice layer
// (voiceCoach.ts) and the post-session report consume `ExerciseId`/`EXERCISES`
// and the `Cue` shape produced here.
//
// To add an exercise: add an `EXERCISES` entry and a `case` in `analyze()`.

import { Pose, L, angle, visible } from './landmarks';

export type ExerciseId = 'squat' | 'pushup' | 'deadlift' | 'ohp';

export type Severity = 'info' | 'warn' | 'critical';

export interface Cue {
  id: string;
  text: string;
  severity: Severity;
}

export interface ExerciseDef {
  id: ExerciseId;
  label: string;
  /** Joint angle that drives rep detection. */
  driver: 'knee' | 'elbow' | 'hip';
  /** Default "you are in the bottom/contracted position" threshold (deg). */
  downBelow: number;
  /** Default "rep complete / locked out" threshold (deg). */
  upAbove: number;
}

export const EXERCISES: Record<ExerciseId, ExerciseDef> = {
  squat: { id: 'squat', label: 'Back Squat', driver: 'knee', downBelow: 95, upAbove: 165 },
  pushup: { id: 'pushup', label: 'Push-Up', driver: 'elbow', downBelow: 95, upAbove: 160 },
  deadlift: { id: 'deadlift', label: 'Deadlift', driver: 'hip', downBelow: 110, upAbove: 168 },
  ohp: { id: 'ohp', label: 'Overhead Press', driver: 'elbow', downBelow: 95, upAbove: 168 },
};

/** Per-athlete thresholds, derived from calibration (see calibration.ts). */
export interface RepThresholds {
  downBelow: number;
  upAbove: number;
}

export interface FrameAnalysis {
  /** Driving joint angle this frame, or null if not trackable. */
  driverAngle: number | null;
  /** 0..100 instantaneous form quality. */
  formScore: number;
  /** Cues firing this frame. */
  cues: Cue[];
}

// ---- driving-joint readout ----
function driverAngle(ex: ExerciseDef, pose: Pose): number | null {
  const get = (i: number) => pose[i];
  switch (ex.driver) {
    case 'knee': {
      const hip = get(L.LEFT_HIP), knee = get(L.LEFT_KNEE), ankle = get(L.LEFT_ANKLE);
      if (!visible(hip) || !visible(knee) || !visible(ankle)) return null;
      return angle(hip, knee, ankle);
    }
    case 'elbow': {
      const sh = get(L.LEFT_SHOULDER), el = get(L.LEFT_ELBOW), wr = get(L.LEFT_WRIST);
      if (!visible(sh) || !visible(el) || !visible(wr)) return null;
      return angle(sh, el, wr);
    }
    case 'hip': {
      const sh = get(L.LEFT_SHOULDER), hip = get(L.LEFT_HIP), knee = get(L.LEFT_KNEE);
      if (!visible(sh) || !visible(hip) || !visible(knee)) return null;
      return angle(sh, hip, knee);
    }
  }
}

// ---- back/torso flexion proxy (shared by squat/deadlift) ----
function torsoAngle(pose: Pose): number | null {
  const sh = pose[L.LEFT_SHOULDER], hip = pose[L.LEFT_HIP], knee = pose[L.LEFT_KNEE];
  if (!visible(sh) || !visible(hip) || !visible(knee)) return null;
  return angle(sh, hip, knee);
}

/**
 * Evaluate a single frame: returns the driving angle, an instantaneous form
 * score, and any cues. The thresholds are the athlete's calibrated targets.
 */
export function analyze(ex: ExerciseDef, pose: Pose, th: RepThresholds): FrameAnalysis {
  const a = driverAngle(ex, pose);
  const cues: Cue[] = [];
  let score = 100;

  if (a == null) {
    return { driverAngle: null, formScore: 0, cues: [] };
  }

  // Depth / ROM: are we reaching the contracted position when we go down?
  // Only judge depth near the bottom of the movement.
  const nearBottom = a < (th.downBelow + th.upAbove) / 2;

  switch (ex.id) {
    case 'squat':
    case 'pushup': {
      if (nearBottom && a > th.downBelow + 12) {
        cues.push({ id: 'depth', text: 'go deeper', severity: 'warn' });
        score -= 18;
      }
      const torso = torsoAngle(pose);
      if (ex.id === 'squat' && torso != null && torso < 60) {
        cues.push({ id: 'back', text: 'chest up, flatten your back', severity: 'critical' });
        score -= 22;
      }
      break;
    }
    case 'deadlift': {
      const torso = torsoAngle(pose);
      if (torso != null && torso < 55) {
        cues.push({ id: 'back', text: 'flatten your back', severity: 'critical' });
        score -= 25;
      }
      if (nearBottom && a > th.downBelow + 14) {
        cues.push({ id: 'depth', text: 'hinge deeper to the bar', severity: 'warn' });
        score -= 14;
      }
      break;
    }
    case 'ohp': {
      if (!nearBottom && a < th.upAbove - 14) {
        cues.push({ id: 'lockout', text: 'press to full lockout', severity: 'warn' });
        score -= 16;
      }
      break;
    }
  }

  return { driverAngle: a, formScore: Math.max(0, Math.round(score)), cues };
}

/**
 * Stateful rep detector. Feed it the latest driving angle and its previous
 * phase; it returns the new phase and whether a rep just completed (a full
 * down→up cycle). Kept tiny so the hook owns the state.
 */
export type RepPhase = 'up' | 'down';

export function countRep(
  angleNow: number,
  phase: RepPhase,
  th: RepThresholds,
): { phase: RepPhase; completed: boolean } {
  if (phase === 'up' && angleNow < th.downBelow) {
    return { phase: 'down', completed: false };
  }
  if (phase === 'down' && angleNow > th.upAbove) {
    return { phase: 'up', completed: true };
  }
  return { phase, completed: false };
}
