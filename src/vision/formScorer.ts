/**
 * Form Scorer — evaluates keypoint positions against exercise-specific
 * ideal ranges and returns a 0–100 form score.
 */

import { Keypoint } from './poseDetector';
import { ExerciseId } from './repCounter';

type JointRule = {
  name: string;
  minScore: number; // minimum keypoint confidence to evaluate
};

type FormRule = {
  minVisible: number; // minimum joints that must be visible
  requiredJoints: JointRule[];
};

const FORM_RULES: Record<ExerciseId, FormRule> = {
  BICEP_CURL: {
    minVisible: 5,
    requiredJoints: [
      { name: 'left_shoulder', minScore: 0.4 },
      { name: 'left_elbow', minScore: 0.4 },
      { name: 'left_wrist', minScore: 0.35 },
      { name: 'right_shoulder', minScore: 0.4 },
      { name: 'right_elbow', minScore: 0.4 },
    ],
  },
  SQUAT: {
    minVisible: 8,
    requiredJoints: [
      { name: 'left_hip', minScore: 0.4 },
      { name: 'left_knee', minScore: 0.4 },
      { name: 'left_ankle', minScore: 0.35 },
      { name: 'right_hip', minScore: 0.4 },
      { name: 'right_knee', minScore: 0.4 },
      { name: 'right_ankle', minScore: 0.35 },
    ],
  },
  PUSH_UP: {
    minVisible: 8,
    requiredJoints: [
      { name: 'left_shoulder', minScore: 0.4 },
      { name: 'left_elbow', minScore: 0.4 },
      { name: 'left_wrist', minScore: 0.35 },
      { name: 'right_shoulder', minScore: 0.4 },
      { name: 'right_elbow', minScore: 0.4 },
      { name: 'left_hip', minScore: 0.35 },
    ],
  },
  SHOULDER_PRESS: {
    minVisible: 6,
    requiredJoints: [
      { name: 'left_shoulder', minScore: 0.4 },
      { name: 'left_elbow', minScore: 0.4 },
      { name: 'left_wrist', minScore: 0.35 },
      { name: 'right_shoulder', minScore: 0.4 },
      { name: 'right_elbow', minScore: 0.4 },
    ],
  },
  DEADLIFT: {
    minVisible: 8,
    requiredJoints: [
      { name: 'left_shoulder', minScore: 0.4 },
      { name: 'left_hip', minScore: 0.4 },
      { name: 'left_knee', minScore: 0.35 },
      { name: 'left_ankle', minScore: 0.35 },
    ],
  },
  LUNGE: {
    minVisible: 8,
    requiredJoints: [
      { name: 'left_hip', minScore: 0.4 },
      { name: 'left_knee', minScore: 0.4 },
      { name: 'left_ankle', minScore: 0.35 },
      { name: 'right_hip', minScore: 0.4 },
      { name: 'right_knee', minScore: 0.4 },
    ],
  },
};

export type FormScore = {
  score: number;          // 0–100
  visibleJoints: number;
  trackedJoints: number;
  feedback: string;
};

export function scoreForm(keypoints: Keypoint[], exercise: ExerciseId): FormScore {
  const rules = FORM_RULES[exercise];
  const kpMap = new Map(keypoints.map((k) => [k.name, k]));

  const visibleJoints = keypoints.filter((k) => k.score >= 0.3).length;

  if (visibleJoints < rules.minVisible) {
    return {
      score: 0,
      visibleJoints,
      trackedJoints: 0,
      feedback: 'Move into frame — more joints needed',
    };
  }

  let trackedJoints = 0;
  let totalConfidence = 0;

  for (const rule of rules.requiredJoints) {
    const kp = kpMap.get(rule.name);
    if (kp && kp.score >= rule.minScore) {
      trackedJoints++;
      totalConfidence += kp.score;
    }
  }

  const jointCoverage = trackedJoints / rules.requiredJoints.length;
  const avgConfidence = trackedJoints > 0 ? totalConfidence / trackedJoints : 0;

  const score = Math.round(jointCoverage * 0.6 * 100 + avgConfidence * 0.4 * 100);

  const feedback =
    score >= 90
      ? 'Excellent form'
      : score >= 75
      ? 'Good — maintain alignment'
      : score >= 55
      ? 'Adjust position for better tracking'
      : 'Poor visibility — reposition camera';

  return { score, visibleJoints, trackedJoints, feedback };
}
