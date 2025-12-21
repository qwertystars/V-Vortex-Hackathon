-- =====================================================
-- Fix all remaining advisor issues
-- Migration: 20251222000000
-- =====================================================

-- Fix security functions with search_path
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

-- Remove duplicate indexes
DROP INDEX IF EXISTS idx_scorecard_history_team_id;
DROP INDEX IF EXISTS scorecard_history_team_id_idx;
DROP INDEX IF EXISTS idx_scorecards_team_lookup;
DROP INDEX IF EXISTS idx_team_members_team_lookup;

-- Drop profiles table if exists
DROP TABLE IF EXISTS profiles CASCADE;
