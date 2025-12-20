# Track Spec: Database Schema Update (Step 2)

## Overview
This track implements the database schema changes required for the "Robust Auth Flow" as outlined in Step 2 of the `TODO.md`. The goal is to establish a solid database foundation for leadership tracking, invitation-based onboarding, and post-authentication routing.

## Functional Requirements
- **Team Leadership:** Establish `teams.leader_user_id` as the source of truth for who owns a team.
- **Membership Decoupling:** Allow users to be part of a team (via `team_members`) using their `auth.users` identity before they have completed their full profile.
- **Onboarding Tracking:** Add a mechanism to track if a user has completed the onboarding process.
- **Invitation System:** Implement a dedicated table to track team invitations, ensuring idempotency and enforcing limits on pending invites.
- **Automated Profile Creation:** Ensure every authenticated user has a corresponding "shell" entry in the `public.users` table immediately upon signup.

## Technical Implementation Details

### 1. Schema Modifications
- **`public.users` Table:**
    - Add `onboarding_complete` (boolean, not null, default: `false`).
    - Ensure columns like `name`, `university_name`, and `role` are nullable to allow for initial "shell" profiles.
- **`public.teams` Table:**
    - Add `leader_user_id` (uuid, referencing `auth.users(id)`).
- **`public.team_members` Table:**
    - Update `user_id` foreign key to reference `auth.users(id)` instead of `public.users(id)`.
    - Add a unique constraint on `user_id` to ensure one user can only belong to one team.

### 2. New Table: `public.team_invites`
- Columns:
    - `id` (uuid, primary key).
    - `team_id` (uuid, referencing `teams(id)`).
    - `email` (text, not null).
    - `invited_by` (uuid, referencing `auth.users(id)`).
    - `status` (text: `pending`, `accepted`, `declined`, `expired`; default: `pending`).
    - `created_at` / `updated_at`.
- Constraint: Unique pair of `(team_id, email)` to prevent duplicate active invites for the same person to the same team.

### 3. Triggers & Automation
- **Profile Shell Trigger:** Create a trigger on `auth.users` (after insert) that automatically inserts a row into `public.users` with the `id` and `email`.
- **Pending Invite Limit:** Implement a trigger on `public.team_invites` to prevent a team from having more than 3 `pending` invites at a time (aligning with the max team size of 4).
- **Existing Triggers:** Ensure `team_code` generation and `updated_at` triggers remain functional.

## Acceptance Criteria
- [ ] Database successfully reset and migrated to the new schema.
- [ ] Creating a new user in Supabase Auth automatically creates a row in `public.users`.
- [ ] A team can be created with a `leader_user_id`.
- [ ] Members can be added to `team_members` referencing their `auth.users` ID.
- [ ] Invitations can be recorded in `team_invites`, and the "max 3 pending" limit is enforced.
- [ ] Unit tests (SQL or integration) verify these constraints and triggers.

## Out of Scope
- Implementing RLS policies (this is Step 3).
- Frontend UI development for login or onboarding.
- Implementation of Edge Functions.
