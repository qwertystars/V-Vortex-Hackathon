-- Create scorecard history table to track score changes over time
CREATE TABLE scorecard_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  innovation_score INTEGER NOT NULL CHECK (innovation_score >= 0 AND innovation_score <= 100),
  implementation_score INTEGER NOT NULL CHECK (implementation_score >= 0 AND implementation_score <= 100),
  presentation_score INTEGER NOT NULL CHECK (presentation_score >= 0 AND presentation_score <= 100),
  impact_score INTEGER NOT NULL CHECK (impact_score >= 0 AND impact_score <= 100),
  total_score INTEGER NOT NULL,
  
  snapshot_type TEXT DEFAULT 'update' CHECK (snapshot_type IN ('initial', 'update', 'final'))
);

-- Index for faster queries
CREATE INDEX idx_scorecard_history_team_time ON scorecard_history(team_id, recorded_at DESC);

-- Enable RLS
ALTER TABLE scorecard_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view scorecard history"
  ON scorecard_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage scorecard history"
  ON scorecard_history FOR ALL
  USING (auth.role() = 'service_role');

-- Function to calculate delta (difference from previous snapshot)
CREATE OR REPLACE FUNCTION get_score_delta(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_score INTEGER;
  previous_score INTEGER;
BEGIN
  -- Get current score
  SELECT total_score INTO current_score
  FROM scorecards
  WHERE team_id = p_team_id;
  
  -- Get previous score (second most recent)
  SELECT total_score INTO previous_score
  FROM scorecard_history
  WHERE team_id = p_team_id
  ORDER BY recorded_at DESC
  OFFSET 1
  LIMIT 1;
  
  -- Return delta (0 if no previous score)
  RETURN COALESCE(current_score - previous_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate leaderboard view with delta support
DROP VIEW IF EXISTS leaderboard_view;

CREATE VIEW leaderboard_view AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY COALESCE(s.total_score, 0) DESC, t.team_name ASC) as position,
  t.team_name,
  COALESCE(s.total_score, 0) as score,
  COALESCE(get_score_delta(t.id), 0) as delta,
  t.id as team_id,
  s.innovation_score,
  s.implementation_score,
  s.presentation_score,
  s.impact_score,
  COALESCE(s.total_score, 0) as total_score
FROM teams t
LEFT JOIN scorecards s ON t.id = s.team_id
ORDER BY COALESCE(s.total_score, 0) DESC, t.team_name ASC;

-- Trigger function to record score changes
CREATE OR REPLACE FUNCTION record_scorecard_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Record the new score in history
  INSERT INTO scorecard_history (
    team_id,
    innovation_score,
    implementation_score,
    presentation_score,
    impact_score,
    total_score,
    snapshot_type
  ) VALUES (
    NEW.team_id,
    NEW.innovation_score,
    NEW.implementation_score,
    NEW.presentation_score,
    NEW.impact_score,
    NEW.total_score,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'initial'
      ELSE 'update'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on scorecards table
DROP TRIGGER IF EXISTS scorecard_history_trigger ON scorecards;
CREATE TRIGGER scorecard_history_trigger
  AFTER INSERT OR UPDATE OF innovation_score, implementation_score, presentation_score, impact_score
  ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION record_scorecard_change();

-- Update the scorecards updated_at timestamp
CREATE OR REPLACE FUNCTION update_scorecard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scorecard_timestamp_trigger ON scorecards;
CREATE TRIGGER update_scorecard_timestamp_trigger
  BEFORE UPDATE ON scorecards
  FOR EACH ROW
  EXECUTE FUNCTION update_scorecard_timestamp();

COMMENT ON TABLE scorecard_history IS 'Historical snapshots of team scores for tracking changes and calculating deltas';
COMMENT ON FUNCTION get_score_delta IS 'Calculates the point difference between current and previous score snapshot';
