/**
 * Symmetry Analyzer — compares left vs. right side joint angles
 * to detect muscular imbalances.
 */

import { Keypoint } from './poseDetector';

type LimbPair = {
  label: string;
  left: [string, string, string]; // [jointA, vertex, jointB]
  right: [string, string, string];
};

const LIMB_PAIRS: LimbPair[] = [
  {
    label: 'Arm',
    left: ['left_shoulder', 'left_elbow', 'left_wrist'],
    right: ['right_shoulder', 'right_elbow', 'right_wrist'],
  },
  {
    label: 'Leg',
    left: ['left_hip', 'left_knee', 'left_ankle'],
    right: ['right_hip', 'right_knee', 'right_ankle'],
  },
  {
    label: 'Hip',
    left: ['left_shoulder', 'left_hip', 'left_knee'],
    right: ['right_shoulder', 'right_hip', 'right_knee'],
  },
];

function angle(a: Keypoint, v: Keypoint, b: Keypoint): number {
  const av = { x: a.x - v.x, y: a.y - v.y };
  const bv = { x: b.x - v.x, y: b.y - v.y };
  const dot = av.x * bv.x + av.y * bv.y;
  const mag = Math.sqrt(av.x ** 2 + av.y ** 2) * Math.sqrt(bv.x ** 2 + bv.y ** 2);
  if (mag === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}

export type LimbSymmetry = {
  label: string;
  leftAngle: number;
  rightAngle: number;
  delta: number;    // degrees difference
  score: number;    // 0–100, 100 = perfect symmetry
  dominant: 'left' | 'right' | 'balanced';
};

export type SymmetryResult = {
  pairs: LimbSymmetry[];
  overallScore: number;
};

export function analyzeSymmetry(keypoints: Keypoint[]): SymmetryResult {
  const kpMap = new Map(keypoints.map((k) => [k.name, k]));
  const pairs: LimbSymmetry[] = [];

  for (const pair of LIMB_PAIRS) {
    const la = kpMap.get(pair.left[0]);
    const lv = kpMap.get(pair.left[1]);
    const lb = kpMap.get(pair.left[2]);
    const ra = kpMap.get(pair.right[0]);
    const rv = kpMap.get(pair.right[1]);
    const rb = kpMap.get(pair.right[2]);

    if (!la || !lv || !lb || !ra || !rv || !rb) continue;
    if (
      la.score < 0.3 || lv.score < 0.3 || lb.score < 0.3 ||
      ra.score < 0.3 || rv.score < 0.3 || rb.score < 0.3
    ) continue;

    const leftAngle = angle(la, lv, lb);
    const rightAngle = angle(ra, rv, rb);
    const delta = Math.abs(leftAngle - rightAngle);
    const score = Math.max(0, Math.round(100 - delta * 1.5));
    const dominant =
      delta < 5 ? 'balanced' : leftAngle < rightAngle ? 'left' : 'right';

    pairs.push({ label: pair.label, leftAngle, rightAngle, delta, score, dominant });
  }

  const overallScore =
    pairs.length > 0
      ? Math.round(pairs.reduce((s, p) => s + p.score, 0) / pairs.length)
      : 0;

  return { pairs, overallScore };
}
