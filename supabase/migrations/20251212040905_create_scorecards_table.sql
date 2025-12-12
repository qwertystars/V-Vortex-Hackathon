-- Create scorecards table
CREATE TABLE scorecards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  
  -- Scoring fields (adjust based on your hackathon criteria)
  innovation_score integer DEFAULT 0 CHECK (innovation_score >= 0 AND innovation_score <= 100),
  implementation_score integer DEFAULT 0 CHECK (implementation_score >= 0 AND implementation_score <= 100),
  presentation_score integer DEFAULT 0 CHECK (presentation_score >= 0 AND presentation_score <= 100),
  impact_score integer DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  
  total_score integer GENERATED ALWAYS AS (innovation_score + implementation_score + presentation_score + impact_score) STORED,
  
  judge_comments text,
  
  UNIQUE(team_id)
);

-- Enable RLS
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Teams can view their own scorecard"
  ON scorecards FOR SELECT
  USING (team_id IN (
    SELECT id FROM teams WHERE lead_email = auth.jwt() ->> 'email'
  ));

CREATE POLICY "Everyone can view all scorecards (for leaderboard)"
  ON scorecards FOR SELECT
  USING (true);

-- Admin can insert/update scorecards (you'll need to add admin role later)
CREATE POLICY "Service role can manage scorecards"
  ON scorecards FOR ALL
  USING (auth.role() = 'service_role');
