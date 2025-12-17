-- Create a view for the leaderboard that combines teams and scorecards
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY s.total_score DESC, t.team_name ASC) as position,
  t.id as team_id,
  t.team_name,
  COALESCE(s.total_score, 0) as total_score,
  s.innovation_score,
  s.implementation_score,
  s.presentation_score,
  s.impact_score
FROM teams t
LEFT JOIN scorecards s ON t.id = s.team_id
ORDER BY s.total_score DESC NULLS LAST, t.team_name ASC;

-- Grant access to the view
GRANT SELECT ON leaderboard_view TO authenticated;
GRANT SELECT ON leaderboard_view TO anon;

COMMENT ON VIEW leaderboard_view IS 'Leaderboard ranking teams by total score with position numbers';
