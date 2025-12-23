# 05 - FEATURE-BY-FEATURE IMPLEMENTATION

## Table of Contents
1. [Overview](#overview)
2. [A) Core Platform](#a-core-platform)
3. [B) Team Registration](#b-team-registration)
4. [C) Problem Statement Selection](#c-problem-statement-selection)
5. [D) Ideathon Submissions](#d-ideathon-submissions)
6. [E) Hackathon Reviews](#e-hackathon-reviews)
7. [F) Judge Management](#f-judge-management)
8. [G) Scoring & Rubrics](#g-scoring--rubrics)
9. [H) Results & Leaderboards](#h-results--leaderboards)
10. [I) Finals (Shark Tank & Bug Bounty)](#i-finals-shark-tank--bug-bounty)
11. [J) Admin Dashboard](#j-admin-dashboard)
12. [K) Email & Notifications](#k-email--notifications)
13. [Related Documents](#related-documents)

---

## Overview

This document provides implementation details for each feature in the V-Vortex Platform.

---

## A) Core Platform

### A1. Multi-Event Support

**Status**: ❌ Missing - Needs Implementation

**Description**: Support multiple concurrent hackathons with isolated databases.

**Implementation**:

1. **Database** (`01-database-schema.md`):
   - Create `events` table
   - Add `event_id` foreign key to all existing tables
   - Implement RLS policies for event isolation

2. **Backend** (`02-backend-api.md`):
   - Update all Edge Functions to verify event access
   - Add `get-current-event` function

3. **Frontend** (`03-frontend-architecture.md`):
   - Add `EventContext` for event state
   - Event selector for admins

**Files to Modify**:
- `supabase/migrations/XXXX_create_events.sql`
- `supabase/functions/shared/auth.ts` - Add event access check
- `src/contexts/EventContext.jsx` - New file
- `src/pages/admin/AdminDashboard.jsx` - Add event selector

---

### A2. Phase State Machine

**Status**: ❌ Missing - Needs Implementation

**Description**: Events progress through phases: Registration → Ideathon → Hackathon → Finals → Archive

**Implementation**:

1. **Database**:
   - `events.current_phase` field
   - `event_phases` table for phase windows
   - Phase transition validation

2. **Backend**:
   - `admin-change-phase` Edge Function
   - Phase validation in all functions

3. **Frontend**:
   - Phase indicator component
   - Deadline countdowns

**Files**:
- `supabase/migrations/XXXX_add_phases.sql`
- `supabase/functions/admin/change-phase`
- `src/components/ui/PhaseIndicator.jsx`

---

### A3. Global Deadline Enforcement

**Status**: 🔄 Partial - Exists for some features

**Description**: Hard locks at UI and backend level when deadlines pass.

**Implementation**:

1. **Database**:
   - Phase deadline fields in `events` table
   - Check constraints for submissions

2. **Backend**:
   - Deadline validation in all submission functions
   - Return error if deadline passed

3. **Frontend**:
   - `Countdown` component
   - Disable submit buttons after deadline

**Files**:
- `src/components/ui/Countdown.jsx`
- Update submission Edge Functions with deadline checks

---

## B) Team Registration

### B1. Team Leader Registration

**Status**: 🔄 Partial - Exists, needs enhancement

**Enhancements Needed**:
1. Add admin approval workflow
2. Add team uniqueness validation
3. Add registration states (draft, submitted, approved, rejected)
4. Improve error handling

**Implementation**:

1. **Database**:
   - Add `registration_status` field to `teams`
   - Add `registration_submitted_at`, `registration_approved_at`

2. **Backend**:
   - Enhance `register-team` function
   - Add `admin-approve-team` function

3. **Frontend**:
   - Add registration states UI
   - Add status indicator

**Files**:
- `supabase/migrations/XXXX_enhance_registration.sql`
- `supabase/functions/register-team`
- `supabase/functions/admin/approve-team`
- `src/pages/team/Registration.jsx`

---

### B2. Team Building (Members)

**Status**: 🔄 Partial - Exists, needs enhancement

**Enhancements Needed**:
1. Team member invitation flow via email
2. Acceptance/rejection workflow
3. Team size validation (2-4)
4. QR code generation

**Implementation**:

1. **Database**:
   - Add `status` field to `team_members` (invited, accepted, rejected)
   - Add `invited_at`, `accepted_at`

2. **Backend**:
   - Enhance `build-team` to send invitations
   - Add `accept-invitation` function

3. **Frontend**:
   - Team member management UI
   - Invitation acceptance page

**Files**:
- `supabase/functions/build-team`
- `supabase/functions/accept-invitation`
- `src/pages/team/TeamManagement.jsx`
- `src/pages/team/AcceptInvitation.jsx`

---

## C) Problem Statement Selection

### C1. FCFS PS Selection

**Status**: ❌ Missing - Needs Implementation

**Description**: First-Come-First-Serve PS allocation with live availability tracking.

**Implementation**:

1. **Database**:
   - `problem_statements` table with `max_teams`, `current_teams`
   - `teams.problem_statement_id` for selection
   - Trigger to update `current_teams` count

2. **Backend**:
   - `select-ps` Edge Function with atomic allocation
   - `get-ps-availability` function
   - RPC function `allocate_ps` for transaction safety

3. **Frontend**:
   - `ProblemStatementSelection` page
   - Live availability indicator
   - Slots remaining display

**Files**:
- `supabase/migrations/XXXX_create_ps_tables.sql`
- `supabase/functions/select-ps`
- `supabase/functions/get-ps-availability`
- `src/pages/team/ProblemStatementSelection.jsx`
- `src/components/ui/PSAvailabilityBadge.jsx`

**UI Flow**:
```
1. Team leader views available PS
2. Sees "X/Y slots available" for each PS
3. Clicks "Select" on desired PS
4. Backend atomically allocates
5. On success: "PS allocated! 3 slots remaining"
6. On failure: "PS no longer available"
```

---

### C2. PS Locking

**Status**: ❌ Missing - Needs Implementation

**Description**: Once selected, PS is locked. Cannot change without admin override.

**Implementation**:

1. **Database**:
   - `teams.ps_locked` field
   - Validation in RLS

2. **Backend**:
   - Check `ps_locked` before allowing change
   - Admin override function

3. **Frontend**:
   - Display selected PS
   - Disable selection if already selected
   - Admin unlock option

**Files**:
- `supabase/functions/admin/unlock-ps`

---

## D) Ideathon Submissions

**Status**: ❌ Missing - Needs Implementation

**Description**: Round 1 submission of PPT/PDF or Drive link.

**Implementation**:

1. **Database**:
   - `teams.ideathon_submitted_at`
   - `teams.ideathon_submission_url`
   - `submissions` table

2. **Backend**:
   - `submit-ideathon` Edge Function
   - Validate deadline
   - Validate URL format

3. **Frontend**:
   - `IdeathonSubmission` page
   - File upload or Drive link input
   - Countdown timer
   - Confirmation display

**Files**:
- `supabase/migrations/XXXX_add_ideathon_fields.sql`
- `supabase/functions/submit-ideathon`
- `src/pages/team/IdeathonSubmission.jsx`

**Validation**:
- File type: PDF, PPT, PPTX
- File size: Max 25MB
- Or: Google Drive link validation

---

## E) Hackathon Reviews

### E1. Review 1 (30%)

**Status**: ❌ Missing - Needs Implementation

**Required Fields**: GitHub repo link

**Implementation**:
- `submit-review` Edge Function with `round: 'review1'`
- Frontend: `ReviewSubmission` page with GitHub URL input

### E2. Review 2 (50%)

**Status**: ❌ Missing - Needs Implementation

**Required Fields**: GitHub repo link, Deployed app link

**Implementation**:
- Same as Review 1, with additional required field

### E3. Review 3 (Final + Code Freeze)

**Status**: ❌ Missing - Needs Implementation

**Required Fields**: GitHub repo, Deployed app, Final PPT, ZIP

**Special**: Code freeze - no more commits allowed after deadline

**Implementation**:
1. **Database**:
   - `teams.code_frozen_at`
   - `teams.review3_*` fields

2. **Backend**:
   - Validate GitHub commit timestamp ≤ deadline
   - Set `code_frozen_at`

3. **Frontend**:
   - Display "Code Frozen" status after deadline

**Files**:
- `supabase/migrations/XXXX_add_review_fields.sql`
- `supabase/functions/submit-review`
- `src/pages/team/ReviewSubmission.jsx`
- `src/utils/githubValidator.js` - Validate commit timestamps

---

## F) Judge Management

### F1. Judge Accounts

**Status**: ❌ Missing - Needs Implementation

**Implementation**:

1. **Database**:
   - `judges` table
   - Link to `auth.users`

2. **Backend**:
   - `admin-create-judge` function
   - Send invitation email

3. **Frontend**:
   - Admin: Judge management page
   - Judge: Dashboard

**Files**:
- `supabase/migrations/XXXX_create_judges.sql`
- `supabase/functions/admin/create-judge`
- `src/pages/admin/AdminJudges.jsx`

---

### F2. Judge Assignment

**Status**: ❌ Missing - Needs Implementation

**Description**: Assign judges to teams for specific rounds.

**Implementation**:

1. **Database**:
   - `judge_assignments` table
   - Domain-based assignment

2. **Backend**:
   - `admin-assign-judge` function

3. **Frontend**:
   - Admin: Assignment UI
   - Judge: View assigned teams

**Files**:
- `supabase/migrations/XXXX_create_judge_assignments.sql`
- `supabase/functions/admin/assign-judge`
- `src/pages/admin/AdminJudgeAssignments.jsx`

---

### F3. Judge Dashboard

**Status**: ❌ Missing - Needs Implementation

**Features**:
- View assigned teams
- View team submissions
- Score teams
- Track progress

**Implementation**:
- `src/pages/judge/JudgeDashboard.jsx`
- `src/components/judge/ScoringForm.jsx`

---

## G) Scoring & Rubrics

### G1. Rubric Configuration

**Status**: ❌ Missing - Needs Implementation

**Description**: Configurable scoring rubrics per round.

**Implementation**:

1. **Database**:
   - `rubrics` table
   - JSONB `categories` field

2. **Backend**:
   - `admin-create-rubric` function

3. **Frontend**:
   - Admin: Rubric builder UI

**Files**:
- `supabase/migrations/XXXX_create_rubrics.sql`
- `src/pages/admin/AdminRubrics.jsx`

---

### G2. Score Submission

**Status**: 🔄 Partial - Basic exists, needs enhancement

**Enhancements**:
1. Draft scores (auto-save)
2. Final submit (locks score)
3. Multi-judge aggregation
4. Score history

**Implementation**:

1. **Database**:
   - `scorecards` table with `is_draft`, `locked_at`

2. **Backend**:
   - `submit-score` Edge Function
   - Draft save vs final submit

3. **Frontend**:
   - Auto-save drafts
   - Confirmation on final submit

**Files**:
- `supabase/functions/submit-score`
- `src/components/judge/ScoringForm.jsx`

---

### G3. Score Locking

**Status**: ❌ Missing - Needs Implementation

**Description**: Scores locked after final submit. Cannot be modified.

**Implementation**:

1. **Database**:
   - Check `locked_at IS NULL` before allowing updates
   - RLS policy: Judges cannot update locked scores

2. **Backend**:
   - Return error if attempting to modify locked score

3. **Frontend**:
   - Disable form for locked scores
   - Display "Locked" status

---

## H) Results & Leaderboards

### H1. Automated Score Aggregation

**Status**: 🔄 Partial - Basic exists, needs enhancement

**Enhancements**:
1. Multi-judge average
2. Tie-break logic
3. Round-wise totals

**Implementation**:

1. **Database**:
   - View or materialized view for aggregated scores
   - Tie-break logic (e.g., prefer higher innovation score)

2. **Backend**:
   - `calculate-rankings` function

3. **Frontend**:
   - Leaderboard with rank display

**Files**:
- `supabase/migrations/XXXX_create_leaderboard_view.sql`
- `supabase/functions/calculate-rankings`
- `src/components/LeaderboardTable.jsx`

---

### H2. Phase-wise Publication

**Status**: ❌ Missing - Needs Implementation

**Description**: Admin controls when results are visible to participants.

**Implementation**:

1. **Database**:
   - `events.show_results` flag
   - Round-specific visibility

2. **Backend**:
   - Check visibility before returning scores

3. **Frontend**:
   - Hide scores until published
   - Display "Results coming soon"

**Files**:
- `supabase/migrations/XXXX_add_result_visibility.sql`
- `src/pages/team/Scores.jsx`

---

## I) Finals (Shark Tank & Bug Bounty)

### I1. Shark Tank

**Status**: ❌ Missing - Needs Implementation

**Description**: Judges invest virtual credits in finalist teams.

**Implementation**:

1. **Database**:
   - `shark_tank_investments` table
   - `judges.shark_tank_credits`

2. **Backend**:
   - `allocate-shark-tank-investments` function
   - Validate credit limit

3. **Frontend**:
   - Investment allocation UI
   - Investment leaderboard

**Files**:
- `supabase/migrations/XXXX_create_shark_tank.sql`
- `supabase/functions/allocate-shark-tank-investments`
- `src/pages/finals/SharkTank.jsx`

---

### I2. Bug Bounty

**Status**: ❌ Missing - Needs Implementation

**Description**: Teams find bugs in randomly assigned projects.

**Implementation**:

1. **Database**:
   - `bug_reports` table
   - Random assignment logic

2. **Backend**:
   - `submit-bug-report` function
   - `get-bug-bounty-assignment` function

3. **Frontend**:
   - Bug submission form
   - Bug bounty leaderboard

**Files**:
- `supabase/migrations/XXXX_create_bug_bounty.sql`
- `supabase/functions/submit-bug-report`
- `src/pages/finals/BugBounty.jsx`

---

## J) Admin Dashboard

### J1. Team Management

**Status**: 🔄 Partial - Basic export exists

**Enhancements**:
1. View all teams with filters
2. Approve/reject registrations
3. Verify payments
4. Assign PS override
5. Override deadline extensions

**Files**:
- `src/pages/admin/AdminTeams.jsx`

---

### J2. Phase Controls

**Status**: ❌ Missing - Needs Implementation

**Features**:
- Change current phase
- View phase progress
- Extend deadlines (emergency)

**Files**:
- `src/pages/admin/AdminPhases.jsx`
- `supabase/functions/admin/change-phase`

---

### J3. Data Export

**Status**: 🔄 Partial - Basic Excel export exists

**Enhancements**:
1. Export by entity type
2. Multiple formats (CSV, JSON, XLSX)
3. Filtered exports

**Files**:
- `supabase/functions/admin/export-data`

---

## K) Email & Notifications

### K1. Email Templates

**Status**: 🔄 Partial - Only OTP emails

**Templates to Add**:
1. Registration confirmation
2. Team member invitation
3. Payment status update
4. Submission confirmation
5. Deadline reminder
6. Results announcement
7. Judge briefing

**Implementation**:
- Use Supabase Auth emails or external service (SendGrid, Resend)
- Template system in Edge Functions

**Files**:
- `supabase/functions/shared/email-templates.ts`

---

### K2. In-App Notifications

**Status**: ❌ Missing - Needs Implementation

**Implementation**:

1. **Database**:
   - `notifications` table
   - Realtime subscription

2. **Frontend**:
   - Notifications panel
   - Unread badge
   - Mark as read

**Files**:
- `supabase/migrations/XXXX_create_notifications.sql`
- `src/contexts/NotificationContext.jsx`
- `src/components/ui/NotificationsPanel.jsx`

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`01-database-schema.md`](./01-database-schema.md) | All table definitions |
| [`02-backend-api.md`](./02-backend-api.md) | Edge Functions |
| [`03-frontend-architecture.md`](./03-frontend-architecture.md) | Frontend components |
| [`09-phased-roadmap.md`](./09-phased-roadmap.md) | Implementation order |

---

**Next**: Read [`09-phased-roadmap.md`](./09-phased-roadmap.md) for implementation phases.
