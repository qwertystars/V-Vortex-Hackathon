-- Delete all existing records from the database
-- Run this in Supabase SQL Editor or via CLI

-- Delete in order respecting foreign key constraints
DELETE FROM team_members;
DELETE FROM scorecards;
DELETE FROM teams;

-- Optional: Reset sequences if you want IDs to start from 1 again
-- (Not necessary since we use UUIDs, but included for completeness)

-- Verify deletion
SELECT COUNT(*) as team_count FROM teams;
SELECT COUNT(*) as member_count FROM team_members;
SELECT COUNT(*) as scorecard_count FROM scorecards;
