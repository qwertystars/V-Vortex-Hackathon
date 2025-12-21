-- Force fix the leaderboard view
DROP VIEW IF EXISTS leaderboard_view CASCADE;

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

GRANT SELECT ON leaderboard_view TO authenticated;
GRANT SELECT ON leaderboard_view TO anon;
