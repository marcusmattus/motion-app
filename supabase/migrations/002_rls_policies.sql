-- Motion App Row Level Security Policies
-- Version: 1.0.0

-- Enable RLS on all tables
ALTER TABLE users_public ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consistency_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheers ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_reps ENABLE ROW LEVEL SECURITY;

-- Users public profile policies
CREATE POLICY upsert_own_user ON users_public
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Workouts policies
CREATE POLICY select_own_workouts ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mutate_own_workouts ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sets policies
CREATE POLICY select_own_sets ON sets
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM workouts w WHERE w.id = sets.workout_id AND w.user_id = auth.uid())
  );

CREATE POLICY mutate_own_sets ON sets
  FOR ALL USING (
    EXISTS(SELECT 1 FROM workouts w WHERE w.id = sets.workout_id AND w.user_id = auth.uid())
  )
  WITH CHECK (TRUE);

-- Body metrics policies
CREATE POLICY select_own_metrics ON body_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mutate_own_metrics ON body_metrics
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Body photos policies
CREATE POLICY select_own_photos ON body_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY mutate_own_photos ON body_photos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Consistency daily policies
CREATE POLICY select_own_consistency ON consistency_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY upsert_own_consistency ON consistency_daily
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Circles policies
CREATE POLICY read_circles_on_membership ON circles
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS(
      SELECT 1 FROM circle_members m
      WHERE m.circle_id = circles.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY write_own_circles ON circles
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Circle members policies
CREATE POLICY read_memberships ON circle_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS(
      SELECT 1 FROM circles c
      WHERE c.id = circle_members.circle_id
      AND (
        c.owner_id = auth.uid()
        OR EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id = c.id AND m.user_id = auth.uid())
      )
    )
  );

CREATE POLICY write_own_membership ON circle_members
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Posts policies
CREATE POLICY read_posts_in_circles ON posts
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS(
      SELECT 1 FROM circles c
      WHERE c.id = posts.circle_id
      AND (
        c.owner_id = auth.uid()
        OR EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id = c.id AND m.user_id = auth.uid())
      )
    )
  );

CREATE POLICY write_own_posts ON posts
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Cheers policies
CREATE POLICY read_cheers_on_posts ON cheers
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM posts p
      WHERE p.id = cheers.post_id
      AND (
        p.user_id = auth.uid()
        OR EXISTS(
          SELECT 1 FROM circles c
          WHERE c.id = p.circle_id
          AND (
            c.owner_id = auth.uid()
            OR EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id = c.id AND m.user_id = auth.uid())
          )
        )
      )
    )
  );

CREATE POLICY write_own_cheers ON cheers
  FOR ALL USING (from_user_id = auth.uid())
  WITH CHECK (from_user_id = auth.uid());

-- Form rule sets policies (public read, owner write)
CREATE POLICY read_rule_sets ON form_rule_sets
  FOR SELECT USING (TRUE);

CREATE POLICY write_own_rule_sets ON form_rule_sets
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Form rules policies
CREATE POLICY read_rules ON form_rules
  FOR SELECT USING (TRUE);

CREATE POLICY write_rules_on_owned_sets ON form_rules
  FOR ALL USING (
    EXISTS(SELECT 1 FROM form_rule_sets s WHERE s.id = rule_set_id AND s.owner_id = auth.uid())
  );

-- Form sessions policies
CREATE POLICY read_own_sessions ON form_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY write_own_sessions ON form_sessions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Form reps policies
CREATE POLICY read_reps_on_own_sessions ON form_reps
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM form_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

CREATE POLICY write_reps_on_own_sessions ON form_reps
  FOR ALL USING (
    EXISTS(SELECT 1 FROM form_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  )
  WITH CHECK (TRUE);

-- Exercises policies (public read for built-in, owner write for custom)
CREATE POLICY read_all_exercises ON exercises
  FOR SELECT USING (TRUE);

CREATE POLICY write_own_exercises ON exercises
  FOR ALL USING (created_by = auth.uid() OR created_by IS NULL)
  WITH CHECK (created_by = auth.uid());
