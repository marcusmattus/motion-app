// src/state/sessionStore.ts
// Active-session state. Keep pose data out of here (too hot) — only summary stats.

import { create } from 'zustand';
import { ExerciseId } from '../vision/poseRules';
import { Calibration } from '../vision/calibration';

export interface RepRecord { index: number; formScore: number; at: number }
export interface CueTally { id: string; text: string; severity: string; count: number }
export interface PastSession {
  exercise: ExerciseId; reps: number; avgForm: number; consistency: number; at: number;
}

interface SessionState {
  exercise: ExerciseId;
  active: boolean;
  reps: RepRecord[];
  currentFormScore: number;
  trackingQuality: number;
  startedAt: number | null;
  endedAt: number | null;
  calibration: Calibration | null;
  cueTally: Record<string, CueTally>; // how many reps each issue showed up in
  history: PastSession[];             // in-memory; persist to Supabase for real history

  setExercise: (e: ExerciseId) => void;
  setCalibration: (c: Calibration) => void;
  start: () => void;
  stop: () => void;
  pushRep: (formScore: number) => void;
  logRepCues: (cues: { id: string; text: string; severity: string }[]) => void;
  setLive: (formScore: number, quality: number) => void;
  reset: () => void;

  // derived
  avgForm: () => number;
  consistency: () => number; // 100 - stddev, higher = steadier
  durationSec: () => number;
}

export const useSession = create<SessionState>((set, get) => ({
  exercise: 'squat',
  active: false,
  reps: [],
  currentFormScore: 100,
  trackingQuality: 0,
  startedAt: null,
  endedAt: null,
  calibration: null,
  cueTally: {},
  history: [],

  setExercise: (e) => set({ exercise: e }),
  setCalibration: (c) => set({ calibration: c }),
  start: () => set({ active: true, startedAt: Date.now(), endedAt: null, reps: [], cueTally: {} }),
  stop: () => {
    const s = get();
    const snapshot: PastSession = {
      exercise: s.exercise, reps: s.reps.length, avgForm: s.avgForm(),
      consistency: s.consistency(), at: Date.now(),
    };
    set({ active: false, endedAt: Date.now(), history: [...s.history, snapshot] });
  },
  pushRep: (formScore) =>
    set((s) => ({ reps: [...s.reps, { index: s.reps.length + 1, formScore, at: Date.now() }] })),
  logRepCues: (cues) =>
    set((s) => {
      const t = { ...s.cueTally };
      for (const c of cues) {
        t[c.id] = t[c.id]
          ? { ...t[c.id], count: t[c.id].count + 1 }
          : { id: c.id, text: c.text, severity: c.severity, count: 1 };
      }
      return { cueTally: t };
    }),
  setLive: (formScore, quality) => set({ currentFormScore: formScore, trackingQuality: quality }),
  reset: () => set({ reps: [], currentFormScore: 100, startedAt: null, endedAt: null, active: false, cueTally: {} }),

  avgForm: () => {
    const r = get().reps;
    if (!r.length) return 0;
    return Math.round(r.reduce((s, x) => s + x.formScore, 0) / r.length);
  },
  consistency: () => {
    const r = get().reps;
    if (r.length < 2) return 100;
    const mean = r.reduce((s, x) => s + x.formScore, 0) / r.length;
    const variance = r.reduce((s, x) => s + (x.formScore - mean) ** 2, 0) / r.length;
    return Math.max(0, Math.round(100 - Math.sqrt(variance)));
  },
  durationSec: () => {
    const s = get();
    if (!s.startedAt) return 0;
    return Math.round(((s.endedAt ?? Date.now()) - s.startedAt) / 1000);
  },
}));
