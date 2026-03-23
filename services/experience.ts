// Experience service - returns mock data when Supabase is not configured
// This service will be replaced with actual API calls once backend is set up

export type ExperienceRecord = {
  id: string;
  name: string;
  status: string;
  goal: string;
  created_at: string;
  updated_at: string;
};

export async function fetchExperience(): Promise<ExperienceRecord> {
  // Return mock data for development
  // In production, this would fetch from Supabase
  return {
    id: 'mock-experience-id',
    name: 'Daily Workout',
    status: 'active',
    goal: 'Build strength and consistency with today\'s workout plan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
