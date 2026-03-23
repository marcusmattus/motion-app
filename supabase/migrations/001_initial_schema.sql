-- Motion App Database Schema
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users public profile
CREATE TABLE IF NOT EXISTS users_public (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  unit_system TEXT DEFAULT 'metric',
  body_proportions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises catalog
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  equipment TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users_public(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sets within workouts
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  set_index INT NOT NULL,
  reps INT,
  weight_kg NUMERIC(6,2),
  rpe NUMERIC(3,1),
  tempo TEXT,
  rest_s INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body metrics tracking
CREATE TABLE IF NOT EXISTS body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  at_date DATE NOT NULL,
  weight_kg NUMERIC(6,2),
  bodyfat_pct NUMERIC(5,2),
  chest_cm NUMERIC(6,2),
  waist_cm NUMERIC(6,2),
  hips_cm NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, at_date)
);

-- Body progress photos
CREATE TABLE IF NOT EXISTS body_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL,
  storage_path TEXT NOT NULL,
  blurhash TEXT,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily consistency scores (Momentum)
CREATE TABLE IF NOT EXISTS consistency_daily (
  user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INT NOT NULL,
  components JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, date)
);

-- Social circles
CREATE TABLE IF NOT EXISTS circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle memberships
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_public(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(circle_id, user_id)
);

-- Social posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  circle_id UUID REFERENCES circles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cheers (social reactions)
CREATE TABLE IF NOT EXISTS cheers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users_public(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, from_user_id)
);

-- Form rule sets for AI Coach
CREATE TABLE IF NOT EXISTS form_rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  owner_id UUID REFERENCES users_public(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual form rules
CREATE TABLE IF NOT EXISTS form_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_set_id UUID REFERENCES form_rule_sets(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  json_rule JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form checking sessions
CREATE TABLE IF NOT EXISTS form_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_public(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  exercise_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  view TEXT,
  model_used TEXT,
  avg_score INT,
  violations JSONB DEFAULT '[]'
);

-- Individual rep tracking within form sessions
CREATE TABLE IF NOT EXISTS form_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES form_sessions(id) ON DELETE CASCADE,
  rep_index INT NOT NULL,
  phase_series JSONB,
  score INT,
  violations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_started ON workouts(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON sets(workout_id, set_index);
CREATE INDEX IF NOT EXISTS idx_consistency_user_date ON consistency_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_circle ON posts(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_sessions_user ON form_sessions(user_id, started_at DESC);
