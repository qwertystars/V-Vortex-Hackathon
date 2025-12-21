-- =====================================================
-- COMPREHENSIVE FIX - Addresses Root Causes
-- This fixes both security and performance issues properly
-- =====================================================

-- =====================================================
-- STEP 1: Fix Security Definer Functions
-- =====================================================

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

-- =====================================================
-- STEP 2: Fix Leaderboard View (Remove SECURITY DEFINER)
-- =====================================================

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

-- =====================================================
-- STEP 3: Clean ALL Existing Policies (Fresh Start)
-- =====================================================

-- Teams table
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(format('DROP POLICY IF EXISTS %I ON teams', policyname), '; ')
    FROM pg_policies WHERE tablename = 'teams'
  );
END $$;

-- Scorecards table
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(format('DROP POLICY IF EXISTS %I ON scorecards', policyname), '; ')
    FROM pg_policies WHERE tablename = 'scorecards'
  );
END $$;

-- Scorecard_history table
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(format('DROP POLICY IF EXISTS %I ON scorecard_history', policyname), '; ')
    FROM pg_policies WHERE tablename = 'scorecard_history'
  );
END $$;

-- Team_members table
DO $$ 
BEGIN
  EXECUTE (
    SELECT string_agg(format('DROP POLICY IF EXISTS %I ON team_members', policyname), '; ')
    FROM pg_policies WHERE tablename = 'team_members'
  );
END $$;

-- =====================================================
-- STEP 4: Create SINGLE Optimized Policy Per Table Per Operation
-- =====================================================

-- TEAMS: Single SELECT policy
CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);

-- TEAMS: INSERT policy
CREATE POLICY "teams_insert" ON teams FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- TEAMS: UPDATE policy
CREATE POLICY "teams_update" ON teams FOR UPDATE 
  USING (auth.uid() = user_id OR lead_email = auth.jwt() ->> 'email')
  WITH CHECK (auth.uid() = user_id OR lead_email = auth.jwt() ->> 'email');

-- TEAMS: DELETE policy
CREATE POLICY "teams_delete" ON teams FOR DELETE 
  USING (auth.role() = 'service_role');

-- SCORECARDS: Single SELECT policy
CREATE POLICY "scorecards_select" ON scorecards FOR SELECT USING (true);

-- SCORECARDS: All modifications restricted to service role
CREATE POLICY "scorecards_modify" ON scorecards 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- SCORECARD_HISTORY: Single SELECT policy
CREATE POLICY "scorecard_history_select" ON scorecard_history FOR SELECT USING (true);

-- SCORECARD_HISTORY: All modifications restricted to service role
CREATE POLICY "scorecard_history_modify" ON scorecard_history
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- TEAM_MEMBERS: Restricted SELECT policy
CREATE POLICY "team_members_select" ON team_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND (teams.lead_email = auth.jwt() ->> 'email' OR teams.user_id = auth.uid())
    )
    OR member_email = auth.jwt() ->> 'email'
  );

-- TEAM_MEMBERS: All modifications restricted to service role
CREATE POLICY "team_members_modify" ON team_members
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- STEP 5: Optimize Indexes
-- =====================================================

-- Remove duplicate indexes first
DO $$
DECLARE idx_name TEXT;
BEGIN
  FOR idx_name IN 
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'scorecard_history' 
    AND indexname LIKE '%team%' 
    AND indexname != 'idx_scorecard_history_team_time'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', idx_name);
  END LOOP;
END $$;

-- Create optimal indexes
CREATE INDEX IF NOT EXISTS idx_scorecard_history_team_time ON scorecard_history(team_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_lead_email ON teams(lead_email);
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(member_email);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_team_id ON scorecards(team_id);

-- =====================================================
-- STEP 6: Remove Profiles Table
-- =====================================================

DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- DONE! This should resolve ALL 27 issues
-- =====================================================
