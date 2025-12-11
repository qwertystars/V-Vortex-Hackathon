-- Add team_size column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_size integer NOT NULL DEFAULT 2;

-- Add constraint for team size validation (2-4 members)
ALTER TABLE teams DROP CONSTRAINT IF EXISTS valid_team_size;
ALTER TABLE teams ADD CONSTRAINT valid_team_size CHECK (team_size >= 2 AND team_size <= 4);
