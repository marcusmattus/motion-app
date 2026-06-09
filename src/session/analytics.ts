// src/session/analytics.ts
// Pure post-session analytics. No React, no network, no store import — it takes
// plain data so it's trivially testable and reusable (the report screen and the
// LLM debrief both feed off `buildSummary`).
//
// What it computes:
//   - average form + consistency + duration
//   - best / worst rep
//   - a least-squares FATIGUE SLOPE (form points lost per 10 reps) + trend line
//   - the top recurring faults (from per-rep cue tallies)
//   - form delta vs the last in-session set of the same exercise

import { RepRecord, CueTally, PastSession } from '../state/sessionStore';
import { ExerciseId, EXERCISES, Severity } from '../vision/poseRules';

export interface TrendLine { slope: number; intercept: number }

export interface RankedIssue {
  id: string;
  text: string;
  severity: string;
  count: number;
  totalReps: number;
  /** Human-readable frequency, e.g. "6/10 reps". */
  label: string;
}

export interface SessionSummary {
  exercise: ExerciseId;
  exerciseLabel: string;
  reps: number;
  durationSec: number;
  avgForm: number;
  consistency: number;
  bestRep: number | null;   // 1-based rep index
  worstRep: number | null;  // 1-based rep index
  /** Form points lost across 10 reps (negative = fatiguing). */
  fatiguePer10: number;
  /** Least-squares line over (repIndex, formScore) for the chart overlay. */
  trend: TrendLine;
  topIssues: RankedIssue[];
  /** Avg-form change vs the previous in-session set of this exercise, or null. */
  deltaVsLast: number | null;
}

const SEVERITY_RANK: Record<string, number> = { critical: 3, warn: 2, info: 1 };

/** Ordinary least-squares fit of y = slope*x + intercept. */
export function linregress(points: { x: number; y: number }[]): TrendLine {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: n === 1 ? points[0].y : 0 };
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of points) {
    sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return { slope: 0, intercept: sy / n };
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept };
}

/** Fatigue trend over the set, as form points per 10 reps (negative = decline). */
export function fatiguePer10(reps: RepRecord[]): { value: number; trend: TrendLine } {
  const pts = reps.map((r) => ({ x: r.index, y: r.formScore }));
  const trend = linregress(pts);
  return { value: Math.round(trend.slope * 10 * 10) / 10, trend };
}

/** Top-N recurring faults, ranked by frequency then severity. */
export function topIssues(
  cueTally: Record<string, CueTally>,
  totalReps: number,
  n = 3,
): RankedIssue[] {
  return Object.values(cueTally)
    .sort((a, b) => b.count - a.count || (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0))
    .slice(0, n)
    .map((c) => ({
      id: c.id,
      text: c.text,
      severity: c.severity,
      count: c.count,
      totalReps,
      label: `${c.text} · ${c.count}/${totalReps} reps`,
    }));
}

/** Best/worst rep by form score (1-based index; ties → earliest). */
export function bestWorst(reps: RepRecord[]): { best: number | null; worst: number | null } {
  if (!reps.length) return { best: null, worst: null };
  let best = reps[0], worst = reps[0];
  for (const r of reps) {
    if (r.formScore > best.formScore) best = r;
    if (r.formScore < worst.formScore) worst = r;
  }
  return { best: best.index, worst: worst.index };
}

/**
 * Avg-form delta vs the most recent prior session of the same exercise.
 * `history` is expected to already include the just-finished set as its last
 * entry (that's how the store snapshots on `stop()`), so we compare the last
 * two matching entries.
 */
export function deltaVsLast(history: PastSession[], exercise: ExerciseId): number | null {
  const matching = history.filter((h) => h.exercise === exercise);
  if (matching.length < 2) return null;
  const current = matching[matching.length - 1];
  const prev = matching[matching.length - 2];
  return current.avgForm - prev.avgForm;
}

export interface SummaryInput {
  exercise: ExerciseId;
  reps: RepRecord[];
  cueTally: Record<string, CueTally>;
  durationSec: number;
  avgForm: number;
  consistency: number;
  history: PastSession[];
}

/** Fold everything into the structured summary the report + LLM consume. */
export function buildSummary(input: SummaryInput): SessionSummary {
  const { value: fatigue, trend } = fatiguePer10(input.reps);
  const { best, worst } = bestWorst(input.reps);
  return {
    exercise: input.exercise,
    exerciseLabel: EXERCISES[input.exercise].label,
    reps: input.reps.length,
    durationSec: input.durationSec,
    avgForm: input.avgForm,
    consistency: input.consistency,
    bestRep: best,
    worstRep: worst,
    fatiguePer10: fatigue,
    trend,
    topIssues: topIssues(input.cueTally, input.reps.length),
    deltaVsLast: deltaVsLast(input.history, input.exercise),
  };
}

// Re-exported for callers that want the cue severity union.
export type { Severity };
