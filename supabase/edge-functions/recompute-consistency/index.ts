// Supabase Edge Function: Recompute Consistency Score
// Calculates daily momentum score based on workout, nutrition, recovery factors

import 'https://deno.land/x/xhr@0.3.0/mod.ts';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ConsistencyComponents {
  workout_completed: number;
  workout_duration: number;
  volume_score: number;
  recovery_score: number;
  social_score: number;
  streak_bonus: number;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id, date } = await req.json();

    if (!user_id || !date) {
      return new Response(
        JSON.stringify({ error: 'user_id and date are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch workouts for the day
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, started_at, ended_at')
      .eq('user_id', user_id)
      .gte('started_at', `${date}T00:00:00`)
      .lte('started_at', `${date}T23:59:59`);

    if (workoutsError) {
      throw new Error(`Failed to fetch workouts: ${workoutsError.message}`);
    }

    // Calculate workout duration
    let totalDurationMinutes = 0;
    if (workouts && workouts.length > 0) {
      for (const workout of workouts) {
        if (workout.ended_at) {
          const start = new Date(workout.started_at).getTime();
          const end = new Date(workout.ended_at).getTime();
          totalDurationMinutes += (end - start) / 1000 / 60;
        }
      }
    }

    // Fetch sets for volume calculation
    const workoutIds = workouts?.map(w => w.id) || [];
    let totalSets = 0;
    if (workoutIds.length > 0) {
      const { count } = await supabase
        .from('sets')
        .select('*', { count: 'exact', head: true })
        .in('workout_id', workoutIds);
      totalSets = count || 0;
    }

    // Check for streak
    const { data: recentDays } = await supabase
      .from('consistency_daily')
      .select('date, score')
      .eq('user_id', user_id)
      .lt('date', date)
      .order('date', { ascending: false })
      .limit(7);

    let streakDays = 0;
    if (recentDays) {
      const sorted = recentDays.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      for (const day of sorted) {
        if (day.score >= 30) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Calculate component scores
    const components: ConsistencyComponents = {
      workout_completed: workouts && workouts.length > 0 ? 25 : 0,
      workout_duration: Math.min(15, Math.floor(totalDurationMinutes / 4)),
      volume_score: Math.min(20, totalSets * 2),
      recovery_score: 15, // Default, could be expanded with sleep data
      social_score: 5, // Default, could check for circle activity
      streak_bonus: Math.min(20, streakDays * 3),
    };

    const totalScore = Object.values(components).reduce((a, b) => a + b, 0);
    const finalScore = Math.min(100, totalScore);

    // Upsert consistency record
    const { error: upsertError } = await supabase
      .from('consistency_daily')
      .upsert({
        user_id,
        date,
        score: finalScore,
        components,
      });

    if (upsertError) {
      throw new Error(`Failed to save score: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: finalScore,
        components,
        streak_days: streakDays,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
