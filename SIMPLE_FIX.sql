-- =====================================================
-- COMPLETE FIX - Addresses all 26 issues
-- Run this in Supabase SQL Editor
-- =====================================================

-- Fix 1: Remove SECURITY DEFINER from leaderboard view (Security Issue)
DROP VIEW IF EXISTS leaderboard_view;

CREATE VIEW leaderboard_view AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY COALESCE(s.total_score, 0) DESC, t.team_name ASC) as position,
  t.team_name,
  COALESCE(s.total_score, 0) as score,
  t.id as team_id,
  s.innovation_score,
  s.implementation_score,
  s.presentation_score,
  s.impact_score,
  COALESCE(s.total_score, 0) as total_score
FROM teams t
LEFT JOIN scorecards s ON t.id = s.team_id
ORDER BY COALESCE(s.total_score, 0) DESC, t.team_name ASC;

-- Fix 2: Add search_path to functions (Security Issue)
CREATE OR REPLACE FUNCTION get_score_delta(p_team_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  current_score INTEGER;
  previous_score INTEGER;
BEGIN
  SELECT total_score INTO current_score FROM scorecards WHERE team_id = p_team_id;
  SELECT total_score INTO previous_score FROM scorecard_history 
  WHERE team_id = p_team_id ORDER BY recorded_at DESC OFFSET 1 LIMIT 1;
  RETURN COALESCE(current_score - previous_score, 0);
END;
$$;

CREATE OR REPLACE FUNCTION record_scorecard_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO scorecard_history (
    team_id, innovation_score, implementation_score, 
    presentation_score, impact_score, total_score, snapshot_type
  ) VALUES (
    NEW.team_id, NEW.innovation_score, NEW.implementation_score,
    NEW.presentation_score, NEW.impact_score, NEW.total_score,
    CASE WHEN TG_OP = 'INSERT' THEN 'initial' ELSE 'update' END
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_scorecard_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_team_owner(team_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams WHERE id = team_uuid 
    AND (lead_email = auth.jwt() ->> 'email' OR user_id = auth.uid())
  );
END;
$$;

CREATE OR REPLACE FUNCTION check_email_uniqueness(email_to_check TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM teams WHERE lead_email = email_to_check) THEN
    RETURN FALSE;
  END IF;
  IF EXISTS (SELECT 1 FROM team_members WHERE member_email = email_to_check) THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;

-- Fix 3: Remove ALL duplicate indexes
DROP INDEX IF EXISTS idx_scorecard_history_team_id;
DROP INDEX IF EXISTS scorecard_history_team_id_idx;
DROP INDEX IF EXISTS idx_scorecards_team_lookup;
DROP INDEX IF EXISTS idx_team_members_team_lookup;

-- Keep only the optimal ones
CREATE INDEX IF NOT EXISTS idx_scorecard_history_team_time ON scorecard_history(team_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_scorecards_team_id ON scorecards(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Fix 4: Drop profiles table (not used)
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- Fix 5: Drop conflicting policies and recreate properly
-- =====================================================

-- TEAMS: Drop all policies
DROP POLICY IF EXISTS "teams_insert" ON teams;
DROP POLICY IF EXISTS "teams_update" ON teams;
DROP POLICY IF EXISTS "teams_delete" ON teams;
DROP POLICY IF EXISTS "teams_select" ON teams;
DROP POLICY IF EXISTS "Optimized teams select policy" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Leaders can update their own team" ON teams;
DROP POLICY IF EXISTS "Only service can delete teams" ON teams;

-- TEAMS: Create fixed policies with (select auth.<function>())
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);

CREATE POLICY "teams_insert" ON teams FOR INSERT 
  WITH CHECK ((select auth.role()) = 'authenticated' AND (select auth.uid()) = user_id);

CREATE POLICY "teams_update" ON teams FOR UPDATE 
  USING ((select auth.uid()) = user_id OR lead_email = (select auth.jwt() ->> 'email'))
  WITH CHECK ((select auth.uid()) = user_id OR lead_email = (select auth.jwt() ->> 'email'));

CREATE POLICY "teams_delete" ON teams FOR DELETE 
  USING ((select auth.role()) = 'service_role');

-- SCORECARDS: Drop all policies
DROP POLICY IF EXISTS "scorecards_select" ON scorecards;
DROP POLICY IF EXISTS "scorecards_modify" ON scorecards;
DROP POLICY IF EXISTS "scorecards_insert" ON scorecards;
DROP POLICY IF EXISTS "scorecards_update" ON scorecards;
DROP POLICY IF EXISTS "scorecards_delete" ON scorecards;
DROP POLICY IF EXISTS "Optimized scorecards select policy" ON scorecards;
DROP POLICY IF EXISTS "Service role manages scorecards" ON scorecards;

-- SCORECARDS: Create fixed policies (separate SELECT from INSERT/UPDATE/DELETE)
CREATE POLICY "scorecards_select" ON scorecards FOR SELECT USING (true);

CREATE POLICY "scorecards_insert" ON scorecards FOR INSERT 
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "scorecards_update" ON scorecards FOR UPDATE 
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "scorecards_delete" ON scorecards FOR DELETE 
  USING ((select auth.role()) = 'service_role');

-- SCORECARD_HISTORY: Drop all policies
DROP POLICY IF EXISTS "scorecard_history_select" ON scorecard_history;
DROP POLICY IF EXISTS "scorecard_history_modify" ON scorecard_history;
DROP POLICY IF EXISTS "scorecard_history_insert" ON scorecard_history;
DROP POLICY IF EXISTS "scorecard_history_update" ON scorecard_history;
DROP POLICY IF EXISTS "scorecard_history_delete" ON scorecard_history;
DROP POLICY IF EXISTS "Public can view scorecard history" ON scorecard_history;
DROP POLICY IF EXISTS "Service role manages scorecard history" ON scorecard_history;

-- SCORECARD_HISTORY: Create fixed policies (separate SELECT from INSERT/UPDATE/DELETE)
CREATE POLICY "scorecard_history_select" ON scorecard_history FOR SELECT USING (true);

CREATE POLICY "scorecard_history_insert" ON scorecard_history FOR INSERT 
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "scorecard_history_update" ON scorecard_history FOR UPDATE 
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "scorecard_history_delete" ON scorecard_history FOR DELETE 
  USING ((select auth.role()) = 'service_role');

-- TEAM_MEMBERS: Drop all policies
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_modify" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;
DROP POLICY IF EXISTS "team_members_update" ON team_members;
DROP POLICY IF EXISTS "team_members_delete" ON team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON team_members;
DROP POLICY IF EXISTS "Service role manages team members" ON team_members;

-- TEAM_MEMBERS: Create fixed policies (separate SELECT from INSERT/UPDATE/DELETE)
CREATE POLICY "team_members_select" ON team_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND (teams.lead_email = (select auth.jwt() ->> 'email') 
           OR teams.user_id = (select auth.uid()))
    )
    OR member_email = (select auth.jwt() ->> 'email')
  );

CREATE POLICY "team_members_insert" ON team_members FOR INSERT 
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "team_members_update" ON team_members FOR UPDATE 
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

CREATE POLICY "team_members_delete" ON team_members FOR DELETE 
  USING ((select auth.role()) = 'service_role');

-- =====================================================
-- DONE! All 26 issues should be resolved:
-- ✅ Security DEFINER on view removed
-- ✅ Function search paths fixed
-- ✅ All duplicate indexes removed
-- ✅ Profiles table dropped
-- ✅ All auth.<function>() wrapped with (select ...)
-- ✅ Multiple permissive policies fixed (separate by operation)
-- =====================================================
