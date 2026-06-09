import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseId } from '../vision/repCounter';
import { ModelConfig } from '../vision/poseDetector';

export interface UserProfile {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  unitSystem: 'metric' | 'imperial';
  bodyProportions?: Record<string, number>;
}

export interface SetRecord {
  setNumber: number;
  reps: number;
  formScore: number;
  avgTempo: number;
  timestamp: number;
}

export interface SessionRecord {
  id: string;
  exerciseId: ExerciseId;
  sets: SetRecord[];
  startTime: number;
  endTime?: number;
  avgFormScore: number;
  totalReps: number;
  symmetryScore: number;
}

export interface TrackingConfig {
  modelConfig: ModelConfig;
  showSkeleton: boolean;
  showAngles: boolean;
  showConfidence: boolean;
  showScanlines: boolean;
  cameraFacing: 'front' | 'back';
  autoDetect: boolean;
  selectedExercise: ExerciseId;
}

export interface MotionState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  hasCompletedCalibration: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  setCalibrationComplete: (complete: boolean) => void;

  // User profile
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Momentum score
  momentumScore: number;
  setMomentumScore: (score: number) => void;

  // Workout state
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;

  // Coach state (legacy)
  selectedExercise: string | null;
  setSelectedExercise: (exercise: string | null) => void;

  // Tracking config
  trackingConfig: TrackingConfig;
  updateTrackingConfig: (updates: Partial<TrackingConfig>) => void;

  // Session history
  sessions: SessionRecord[];
  addSession: (session: SessionRecord) => void;
  clearSessions: () => void;

  // Live session state (transient — not persisted)
  liveReps: number;
  liveFormScore: number;
  liveSymmetryScore: number;
  liveTempo: number;
  liveSets: SetRecord[];
  isTracking: boolean;
  setLiveReps: (reps: number) => void;
  setLiveFormScore: (score: number) => void;
  setLiveSymmetryScore: (score: number) => void;
  setLiveTempo: (tempo: number) => void;
  addLiveSet: (set: SetRecord) => void;
  setIsTracking: (tracking: boolean) => void;
  resetLiveSession: () => void;
}

const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  modelConfig: {
    modelType: 'MoveNet_Thunder',
    confidenceThreshold: 0.35,
    enableSmoothing: true,
  },
  showSkeleton: true,
  showAngles: false,
  showConfidence: false,
  showScanlines: true,
  cameraFacing: 'back',
  autoDetect: true,
  selectedExercise: 'SQUAT',
};

export const useMotionStore = create<MotionState>()(
  persist(
    (set) => ({
      // Onboarding
      hasCompletedOnboarding: false,
      hasCompletedCalibration: false,
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      setCalibrationComplete: (complete) => set({ hasCompletedCalibration: complete }),

      // User
      user: null,
      setUser: (user) => set({ user }),

      // Momentum
      momentumScore: 0,
      setMomentumScore: (score) => set({ momentumScore: score }),

      // Workout
      activeWorkoutId: null,
      setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),

      // Coach (legacy)
      selectedExercise: null,
      setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),

      // Tracking config
      trackingConfig: DEFAULT_TRACKING_CONFIG,
      updateTrackingConfig: (updates) =>
        set((state) => ({
          trackingConfig: { ...state.trackingConfig, ...updates },
        })),

      // Sessions
      sessions: [],
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions].slice(0, 50) })),
      clearSessions: () => set({ sessions: [] }),

      // Live session
      liveReps: 0,
      liveFormScore: 0,
      liveSymmetryScore: 0,
      liveTempo: 0,
      liveSets: [],
      isTracking: false,
      setLiveReps: (reps) => set({ liveReps: reps }),
      setLiveFormScore: (score) => set({ liveFormScore: score }),
      setLiveSymmetryScore: (score) => set({ liveSymmetryScore: score }),
      setLiveTempo: (tempo) => set({ liveTempo: tempo }),
      addLiveSet: (liveSet) =>
        set((state) => ({ liveSets: [...state.liveSets, liveSet] })),
      setIsTracking: (tracking) => set({ isTracking: tracking }),
      resetLiveSession: () =>
        set({ liveReps: 0, liveFormScore: 0, liveSymmetryScore: 0, liveTempo: 0, liveSets: [], isTracking: false }),
    }),
    {
      name: 'motion-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedCalibration: state.hasCompletedCalibration,
        user: state.user,
        momentumScore: state.momentumScore,
        trackingConfig: state.trackingConfig,
        sessions: state.sessions,
      }),
    }
  )
);

