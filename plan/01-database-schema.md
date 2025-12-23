# 01 - DATABASE SCHEMA DESIGN

## Table of Contents
1. [Overview](#overview)
2. [Existing Tables](#existing-tables)
3. [New Tables to Add](#new-tables-to-add)
4. [Complete Schema](#complete-schema)
5. [Relationships](#relationships)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Indexes & Performance](#indexes--performance)
8. [Migrations](#migrations)
9. [Related Documents](#related-documents)

---

## Overview

This document defines the complete database schema for the V-Vortex Platform hackathon management system.

### Design Principles

1. **FCFS Allocation**: Problem statement allocation with atomic operations
2. **Audit Trail**: All changes tracked in audit logs
3. **Soft Deletes**: Data archived rather than deleted
4. **Time Zone Aware**: All timestamps use `TIMESTAMPTZ`

### Naming Conventions

- Table names: `snake_case`
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `{table}_id`
- Timestamps: `created_at`, `updated_at`, `deleted_at`
- Boolean flags: `is_{condition}` or `has_{feature}`

---

## Existing Tables

### `teams` (Already Exists, Needs Enhancement)

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Team Information
  team_name TEXT NOT NULL,
  team_code TEXT UNIQUE NOT NULL, -- For member joins

  -- Leader Information
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT,
  leader_reg_no TEXT,

  -- Institution
  institution TEXT NOT NULL,
  is_vit_chennai BOOLEAN DEFAULT FALSE,

  -- Team Size
  team_size INTEGER NOT NULL CHECK (team_size BETWEEN 2 AND 4),

  -- Registration Status
  registration_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (registration_status IN ('draft', 'submitted', 'approved', 'rejected')),

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  payment_reference TEXT,
  payment_receipt_url TEXT,

  -- Problem Statement
  problem_statement_id UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
  ps_selected_at TIMESTAMPTZ,
  ps_locked BOOLEAN DEFAULT FALSE,

  -- Submissions
  ideathon_submitted_at TIMESTAMPTZ,
  ideathon_submission_url TEXT,

  review1_submitted_at TIMESTAMPTZ,
  review1_github_url TEXT,
  review1_deploy_url TEXT,

  review2_submitted_at TIMESTAMPTZ,
  review2_github_url TEXT,
  review2_deploy_url TEXT,
  review2_ppt_url TEXT,

  review3_submitted_at TIMESTAMPTZ,
  review3_github_url TEXT,
  review3_deploy_url TEXT,
  review3_ppt_url TEXT,
  review3_zip_url TEXT,
  code_frozen_at TIMESTAMPTZ,

  -- Finals
  is_finalist BOOLEAN DEFAULT FALSE,
  finalist_position INTEGER,

  -- Open Innovation Track
  open_innovation_enabled BOOLEAN DEFAULT FALSE,
  open_innovation_submitted_at TIMESTAMPTZ,
  open_innovation_submission_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
);

CREATE INDEX idx_teams_leader_email ON teams(leader_email);
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_ps_id ON teams(problem_statement_id);
CREATE INDEX idx_teams_payment_status ON teams(payment_status);
CREATE INDEX idx_teams_registration_status ON teams(registration_status);
```

### `team_members` (Already Exists)

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Member Information
  member_name TEXT NOT NULL,
  member_email TEXT NOT NULL,
  member_phone TEXT,
  member_reg_no TEXT,
  institution TEXT NOT NULL,

  -- Auth
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- QR Code for attendance
  qr_code_data TEXT UNIQUE NOT NULL,
  qr_generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'accepted', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(member_email)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_qr_code ON team_members(qr_code_data);
```

### `scorecards` (Already Exists)

```sql
CREATE TABLE scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,

  -- Round
  round TEXT NOT NULL
    CHECK (round IN ('ideathon', 'review1', 'review2', 'review3', 'shark_tank', 'bug_bounty')),

  -- Scores (ideathon, review1, review2)
  innovation_score INTEGER CHECK (innovation_score BETWEEN 0 AND 50),
  implementation_score INTEGER CHECK (implementation_score BETWEEN 0 AND 50),
  presentation_score INTEGER CHECK (presentation_score BETWEEN 0 AND 50),
  impact_score INTEGER CHECK (impact_score BETWEEN 0 AND 50),

  -- Scores (review3)
  technical_score INTEGER CHECK (technical_score BETWEEN 0 AND 30),
  design_score INTEGER CHECK (design_score BETWEEN 0 AND 30),
  business_score INTEGER CHECK (business_score BETWEEN 0 AND 20),
  demo_score INTEGER CHECK (demo_score BETWEEN 0 AND 20),

  -- Scores (shark_tank)
  investment_amount NUMERIC(10, 2),

  -- Scores (bug_bounty)
  bugs_found INTEGER DEFAULT 0,
  critical_bugs INTEGER DEFAULT 0,
  poc_quality_score INTEGER CHECK (poc_quality_score BETWEEN 0 AND 30),
  report_quality_score INTEGER CHECK (report_quality_score BETWEEN 0 AND 25),

  -- Total
  total_score NUMERIC(5, 2) GENERATED ALWAYS AS (
    COALESCE(innovation_score, 0) +
    COALESCE(implementation_score, 0) +
    COALESCE(presentation_score, 0) +
    COALESCE(impact_score, 0) +
    COALESCE(technical_score, 0) +
    COALESCE(design_score, 0) +
    COALESCE(business_score, 0) +
    COALESCE(demo_score, 0) +
    COALESCE(poc_quality_score, 0) +
    COALESCE(report_quality_score, 0)
  ) STORED,

  -- Comments
  judge_comments TEXT,

  -- Status
  is_draft BOOLEAN DEFAULT TRUE,
  submitted_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, judge_id, round)
);

CREATE INDEX idx_scorecards_team_judge ON scorecards(team_id, judge_id);
CREATE INDEX idx_scorecards_judge_id ON scorecards(judge_id);
CREATE INDEX idx_scorecards_round ON scorecards(round);
```

---

## New Tables to Add

### `event_config` - Single Event Configuration

```sql
CREATE TABLE event_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event Information
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  tagline TEXT,
  venue TEXT,
  description TEXT,

  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,

  -- Website & Social
  website_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  discord_url TEXT,

  -- Phase Windows
  registration_start TIMESTAMPTZ NOT NULL,
  registration_end TIMESTAMPTZ NOT NULL,
  ideathon_start TIMESTAMPTZ,
  ideathon_end TIMESTAMPTZ,
  hackathon_review1_start TIMESTAMPTZ,
  hackathon_review1_end TIMESTAMPTZ,
  hackathon_review2_start TIMESTAMPTZ,
  hackathon_review2_end TIMESTAMPTZ,
  hackathon_review3_start TIMESTAMPTZ,
  hackathon_review3_end TIMESTAMPTZ,
  finals_start TIMESTAMPTZ,
  finals_end TIMESTAMPTZ,

  -- Current Phase State Machine
  current_phase TEXT NOT NULL DEFAULT 'registration'
    CHECK (current_phase IN (
      'registration', 'ideathon', 'hackathon', 'finals', 'archive'
    )),

  -- Feature Flags
  enable_open_innovation BOOLEAN DEFAULT FALSE,
  enable_bug_bounty BOOLEAN DEFAULT FALSE,
  enable_shark_tank BOOLEAN DEFAULT FALSE,
  enable_peer_score_visibility BOOLEAN DEFAULT FALSE,

  -- Settings
  payment_required BOOLEAN DEFAULT TRUE,
  min_team_size INTEGER DEFAULT 2,
  max_team_size INTEGER DEFAULT 4,

  -- Public Mode (read-only without login)
  public_mode BOOLEAN DEFAULT FALSE,
  public_leaderboard BOOLEAN DEFAULT FALSE,

  -- Finals Configuration
  finalist_count INTEGER DEFAULT 10,
  shark_tank_credits_per_judge INTEGER DEFAULT 1000,

  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO event_config (
  name, edition, venue,
  registration_start, registration_end,
  current_phase
) VALUES (
  'V-Vortex Hackathon', '2025', 'VIT Chennai',
  '2025-01-01 00:00:00+00', '2025-12-31 23:59:59+00',
  'registration'
);
```

### `domains` - Problem Statement Domains

```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT, -- Hex color for UI

  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(name)
);
```

### `problem_statements` - Problem Statement Catalog

```sql
CREATE TABLE problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,

  -- PS Information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  expected_deliverables TEXT,

  -- Organization
  organization TEXT,
  mentor_name TEXT,
  mentor_email TEXT,

  -- Resources
  dataset_url TEXT,
  reference_links JSONB, -- Array of URLs
  attachments JSONB, -- Array of file URLs

  -- FCFS Allocation
  max_teams INTEGER NOT NULL DEFAULT 5,
  current_teams INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Display
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (current_teams <= max_teams)
);

CREATE INDEX idx_ps_domain_id ON problem_statements(domain_id);
CREATE INDEX idx_ps_published ON problem_statements(is_published);
CREATE INDEX idx_ps_active ON problem_statements(is_active);

-- Trigger to update current_teams count
CREATE OR REPLACE FUNCTION update_ps_team_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE problem_statements
    SET current_teams = current_teams + 1
    WHERE id = NEW.problem_statement_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.problem_statement_id IS DISTINCT FROM NEW.problem_statement_id THEN
    UPDATE problem_statements
    SET current_teams = current_teams - 1
    WHERE id = OLD.problem_statement_id;
    UPDATE problem_statements
    SET current_teams = current_teams + 1
    WHERE id = NEW.problem_statement_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE problem_statements
    SET current_teams = current_teams - 1
    WHERE id = OLD.problem_statement_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ps_team_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_ps_team_count();
```

### `judges` - Judge Accounts

```sql
CREATE TABLE judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Judge Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  bio TEXT,
  profile_image_url TEXT,

  -- Auth
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Assignment
  domain_ids UUID[], -- Array of domain IDs
  is_admin_judge BOOLEAN DEFAULT FALSE, -- Can score any team

  -- Shark Tank
  shark_tank_credits INTEGER DEFAULT 1000,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  briefing_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email)
);
CREATE INDEX idx_judges_user_id ON judges(user_id);
CREATE INDEX idx_judges_domain_ids ON judges USING GIN(domain_ids);
```

### `judge_assignments` - Judge to Team Assignments

```sql
CREATE TABLE judge_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Assignment Details
  round TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),

  UNIQUE(judge_id, team_id, round)
);

CREATE INDEX idx_judge_assignments_judge ON judge_assignments(judge_id);
CREATE INDEX idx_judge_assignments_team ON judge_assignments(team_id);
```

### `rubrics` - Scoring Rubrics Configuration

```sql
CREATE TABLE rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  round TEXT NOT NULL,
  max_score INTEGER NOT NULL,

  -- Rubric Categories (JSON)
  categories JSONB NOT NULL, -- [{name, description, max_score, weight}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(round)
);
```

### `announcements` - Event Announcements

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info'
    CHECK (priority IN ('info', 'warning', 'urgent')),

  -- Targeting
  target_role TEXT, -- NULL = all, 'team_leader', 'judge', 'admin'

  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- Email
  send_email BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);
CREATE INDEX idx_announcements_published ON announcements(is_published);
```

### `audit_logs` - System Audit Trail

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action Details
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entity_type TEXT NOT NULL, -- team, user, scorecard, etc.
  entity_id UUID,

  -- Actor
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT,

  -- Data Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Result
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'partial')),
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### `notifications` - User Notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('info', 'success', 'warning', 'error')),
  action_url TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### `bug_reports` - Bug Bounty Submissions

```sql
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assignment
  judge_id UUID REFERENCES judges(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  target_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE, -- Project being tested

  -- Bug Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  steps_to_reproduce TEXT,

  -- Attachments
  poc_url TEXT, -- Proof of Concept
  screenshot_urls TEXT[],

  -- Status
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'verified', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bug_reports_team_id ON bug_reports(team_id);
CREATE INDEX idx_bug_reports_target_team ON bug_reports(target_team_id);
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);
```

### `shark_tank_investments` - Shark Tank Investment Records

```sql
CREATE TABLE shark_tank_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Investment
  judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,

  -- Notes
  investment_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(judge_id, team_id)
);

CREATE INDEX idx_shark_tank_judge_id ON shark_tank_investments(judge_id);
CREATE INDEX idx_shark_tank_team_id ON shark_tank_investments(team_id);
```

### `submissions` - Unified Submission Tracking

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Submission Type
  round TEXT NOT NULL,
  submission_type TEXT NOT NULL
    CHECK (submission_type IN ('github', 'deploy_url', 'ppt', 'zip', 'document', 'other')),

  -- Submission Data
  submission_url TEXT NOT NULL,
  submission_metadata JSONB,

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, round, submission_type)
);

CREATE INDEX idx_submissions_team_id ON submissions(team_id);
CREATE INDEX idx_submissions_round ON submissions(round);
```

---

## Complete Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   domains   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│problem_statements│
└────────┬────────┘
         │
         ▼
┌──────────────────┐                    ┌─────────────────┐
│     teams        │◀───────────────────│  scorecards     │
└────────┬─────────┘                    └─────────────────┘
         │
         ├──┬────────────────────────────┐
         │  │                            │
         ▼  ▼                            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│team_members  │  │ submissions  │  │    judges     │
└──────────────┘  └──────────────┘  └───────┬──────┘
                                          │
                    ┌─────────────────────┤
                    │                     │
                    ▼                     ▼
           ┌──────────────┐      ┌──────────────┐
           │judge_        │      │shark_tank_   │
           │assignments   │      │investments   │
           └──────────────┘      └──────────────┘

┌──────────────┐  ┌──────────────┐
│  bug_reports │  │ announcements│
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│ audit_logs   │  │notifications │
└──────────────┘  └──────────────┘
```

---

## Relationships

### Primary Relationships

| Table | References | Relationship | Cardinality |
|-------|------------|--------------|-------------|
| `problem_statements` | `domains.id` | Many-to-One | N:1 |
| `teams.problem_statement_id` | `problem_statements.id` | Many-to-One | N:1 |
| `team_members` | `teams.id` | Many-to-One | N:1 |
| `team_members` | `auth.users.id` | Many-to-One (Optional) | N:1 |
| `scorecards` | `teams.id` | Many-to-One | N:1 |
| `scorecards` | `judges.id` | Many-to-One | N:1 |
| `judge_assignments` | `teams.id` | Many-to-One | N:1 |
| `judge_assignments` | `judges.id` | Many-to-One | N:1 |
| `submissions` | `teams.id` | Many-to-One | N:1 |
| `shark_tank_investments` | `teams.id` | Many-to-One | N:1 |
| `shark_tank_investments` | `judges.id` | Many-to-One | N:1 |
| `bug_reports` | `teams.id` | Many-to-One | N:1 |

---

## Row Level Security (RLS)

### Enable RLS on All Tables

```sql
-- Core tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE shark_tank_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
```

### Sample RLS Policies

```sql
-- Teams: Team leaders can view/update their own team
CREATE POLICY "Team leaders can view own team"
ON teams FOR SELECT
USING (
  id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team leaders can update own team"
ON teams FOR UPDATE
USING (
  id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
    AND is_team_leader = TRUE
  )
);

-- Scorecards: Judges can view assigned teams
CREATE POLICY "Judges can view assigned teams"
ON scorecards FOR SELECT
USING (
  judge_id IN (
    SELECT id FROM judges WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Judges can update own scores"
ON scorecards FOR UPDATE
USING (
  judge_id IN (
    SELECT id FROM judges WHERE user_id = auth.uid()
  )
  AND locked_at IS NULL
);

-- Public: Problem statements (read-only during active phase)
CREATE POLICY "Public can view active PS"
ON problem_statements FOR SELECT
USING (
  is_published = TRUE
  AND is_active = TRUE
);

-- Admin: Full access to all data
CREATE POLICY "Admins have full access"
ON teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

---

## Indexes & Performance

### Critical Indexes

```sql
-- Team lookups
CREATE INDEX idx_teams_leader_email ON teams(leader_email);
CREATE INDEX idx_teams_ps ON teams(problem_statement_id);

-- PS availability
CREATE INDEX idx_ps_availability ON problem_statements()
  WHERE is_active = TRUE AND current_teams < max_teams;

-- Scorecards
CREATE INDEX idx_scorecards_team_round ON scorecards(team_id, round);

-- Judge assignments
CREATE INDEX idx_judge_assignments_judge ON judge_assignments(judge_id);

-- Audit logs (for querying recent activity)
CREATE INDEX idx_audit_logs_recent ON audit_logs(created_at DESC);

-- Notifications (for user notification panel)
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = FALSE;
```

---

## Migrations

### Migration 001: Create Event Config Table

```sql
-- File: supabase/migrations/202501240001_create_event_config.sql

CREATE TABLE event_config (
  -- As defined above
);

-- Insert default configuration
INSERT INTO event_config (
  name, edition, venue,
  registration_start, registration_end,
  current_phase
) VALUES (
  'V-Vortex Hackathon', '2025', 'VIT Chennai',
  '2025-01-01 00:00:00+00', '2025-12-31 23:59:59+00',
  'registration'
);
```

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`00-overview.md`](./00-overview.md) | System architecture and design principles |
| [`02-backend-api.md`](./02-backend-api.md) | Edge Functions that interact with database |
| [`04-auth-rbac.md`](./04-auth-rbac.md) | Authentication and role-based access control |
| [`06-security-audit.md`](./06-security-audit.md) | Security considerations |

---

**Next**: Read [`02-backend-api.md`](./02-backend-api.md) for Edge Functions specification.
