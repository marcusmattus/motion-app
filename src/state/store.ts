import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  unitSystem: 'metric' | 'imperial';
  bodyProportions?: Record<string, number>;
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

  // Coach state
  selectedExercise: string | null;
  setSelectedExercise: (exercise: string | null) => void;
}

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

      // Coach
      selectedExercise: null,
      setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
    }),
    {
      name: 'motion-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasCompletedCalibration: state.hasCompletedCalibration,
        user: state.user,
        momentumScore: state.momentumScore,
      }),
    }
  )
);
