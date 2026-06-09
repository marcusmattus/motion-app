/**
 * Rep Counter — counts reps by detecting angle threshold crossings
 * on key joints for each supported exercise.
 */

import { Keypoint } from './poseDetector';

export type ExerciseId =
  | 'BICEP_CURL'
  | 'SQUAT'
  | 'PUSH_UP'
  | 'SHOULDER_PRESS'
  | 'DEADLIFT'
  | 'LUNGE';

/** Maximum number of recent rep tempos to keep for the rolling average */
const MAX_TEMPO_HISTORY = 10;

type AngleConfig = {
  jointA: string;
  vertex: string;
  jointB: string;
  bottomAngle: number; // angle that signals "bottom" of rep
  topAngle: number;    // angle that signals "top" of rep
};

const EXERCISE_ANGLES: Record<ExerciseId, AngleConfig> = {
  BICEP_CURL: {
    jointA: 'left_shoulder',
    vertex: 'left_elbow',
    jointB: 'left_wrist',
    bottomAngle: 160,
    topAngle: 45,
  },
  SQUAT: {
    jointA: 'left_hip',
    vertex: 'left_knee',
    jointB: 'left_ankle',
    bottomAngle: 80,
    topAngle: 160,
  },
  PUSH_UP: {
    jointA: 'left_shoulder',
    vertex: 'left_elbow',
    jointB: 'left_wrist',
    bottomAngle: 80,
    topAngle: 160,
  },
  SHOULDER_PRESS: {
    jointA: 'left_elbow',
    vertex: 'left_shoulder',
    jointB: 'left_hip',
    bottomAngle: 80,
    topAngle: 160,
  },
  DEADLIFT: {
    jointA: 'left_shoulder',
    vertex: 'left_hip',
    jointB: 'left_knee',
    bottomAngle: 60,
    topAngle: 170,
  },
  LUNGE: {
    jointA: 'left_hip',
    vertex: 'left_knee',
    jointB: 'left_ankle',
    bottomAngle: 80,
    topAngle: 160,
  },
};

function getAngle(a: Keypoint, v: Keypoint, b: Keypoint): number {
  const vectorAV = { x: a.x - v.x, y: a.y - v.y };
  const vectorBV = { x: b.x - v.x, y: b.y - v.y };
  const dot = vectorAV.x * vectorBV.x + vectorAV.y * vectorBV.y;
  const magAV = Math.sqrt(vectorAV.x ** 2 + vectorAV.y ** 2);
  const magBV = Math.sqrt(vectorBV.x ** 2 + vectorBV.y ** 2);
  if (magAV === 0 || magBV === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magAV * magBV)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

type RepState = {
  count: number;
  phase: 'up' | 'down' | 'idle';
  lastRepTime: number;
  tempos: number[];
};

const repState: Record<string, RepState> = {};

export function getOrCreateRepState(sessionId: string): RepState {
  if (!repState[sessionId]) {
    repState[sessionId] = { count: 0, phase: 'idle', lastRepTime: 0, tempos: [] };
  }
  return repState[sessionId];
}

export function resetRepState(sessionId: string): void {
  repState[sessionId] = { count: 0, phase: 'idle', lastRepTime: 0, tempos: [] };
}

export type RepUpdate = {
  reps: number;
  newRep: boolean;
  currentAngle: number;
  avgTempo: number; // seconds per rep
};

export function processRepFrame(
  keypoints: Keypoint[],
  exercise: ExerciseId,
  sessionId: string
): RepUpdate {
  const config = EXERCISE_ANGLES[exercise];
  const kpMap = new Map(keypoints.map((k) => [k.name, k]));
  const state = getOrCreateRepState(sessionId);

  const a = kpMap.get(config.jointA);
  const v = kpMap.get(config.vertex);
  const b = kpMap.get(config.jointB);

  if (!a || !v || !b || a.score < 0.3 || v.score < 0.3 || b.score < 0.3) {
    return { reps: state.count, newRep: false, currentAngle: 0, avgTempo: avgTempo(state) };
  }

  const angle = getAngle(a, v, b);
  let newRep = false;

  if (angle <= config.bottomAngle && state.phase !== 'down') {
    state.phase = 'down';
  } else if (angle >= config.topAngle && state.phase === 'down') {
    state.phase = 'up';
    state.count += 1;
    newRep = true;
    const now = Date.now();
    if (state.lastRepTime > 0) {
      state.tempos.push((now - state.lastRepTime) / 1000);
      if (state.tempos.length > MAX_TEMPO_HISTORY) state.tempos.shift();
    }
    state.lastRepTime = now;
  }

  return { reps: state.count, newRep, currentAngle: angle, avgTempo: avgTempo(state) };
}

function avgTempo(state: RepState): number {
  if (state.tempos.length === 0) return 0;
  return state.tempos.reduce((s, t) => s + t, 0) / state.tempos.length;
}

export const EXERCISES: Array<{ id: ExerciseId; label: string; muscle: string }> = [
  { id: 'BICEP_CURL', label: 'Bicep Curl', muscle: 'Biceps' },
  { id: 'SQUAT', label: 'Squat', muscle: 'Legs' },
  { id: 'PUSH_UP', label: 'Push Up', muscle: 'Chest' },
  { id: 'SHOULDER_PRESS', label: 'Shoulder Press', muscle: 'Shoulders' },
  { id: 'DEADLIFT', label: 'Deadlift', muscle: 'Back' },
  { id: 'LUNGE', label: 'Lunge', muscle: 'Legs' },
];
