export type MissionSummary = {
  reps: number;
  power: number;
  distance: number;
  nutritionScore: number;
};

export function useMissionSummary() {
  return {
    loading: false,
    summary: {
      reps: 8,
      power: 86,
      distance: 5.2,
      nutritionScore: 92
    } as MissionSummary
  };
}
