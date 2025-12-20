# Implementation Plan - Database Schema Update (Step 2)

This plan outlines the steps to implement the database schema changes required for the robust auth flow, including leadership tracking, invitation management, and automated profile creation.

## Phase 1: Preparation and Environment Reset
- [x] Task: Reset local database and verify connectivity
    - [ ] Action: Execute database reset (migration to clean state)
    - [ ] Action: Verify connectivity to the local Supabase instance
- [x] Task: Conductor - User Manual Verification 'Phase 1: Preparation' (Protocol in workflow.md)
## [checkpoint: a7e5a15]

## Phase 2: Schema Modifications (TDD)
- [x] Task: Modify `public.users` table d8fc81b
    - [ ] Write failing test: Verify that `onboarding_complete` does not exist and name/university are NOT NULL.
    - [ ] Implement: Add `onboarding_complete` column and make existing profile fields nullable.
    - [ ] Verify: Tests pass.
- [ ] Task: Modify `public.teams` table
    - [ ] Write failing test: Verify that `leader_user_id` does not exist.
    - [ ] Implement: Add `leader_user_id` referencing `auth.users(id)`.
    - [ ] Verify: Tests pass.
- [ ] Task: Modify `public.team_members` table
    - [ ] Write failing test: Verify `user_id` references `public.users` and lacks a unique constraint.
    - [ ] Implement: Update FK to `auth.users(id)` and add `UNIQUE(user_id)`.
    - [ ] Verify: Tests pass.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Schema Modifications' (Protocol in workflow.md)

## Phase 3: New Tables and Automation (TDD)
- [ ] Task: Create `public.team_invites` table
    - [ ] Write failing test: Verify table does not exist.
    - [ ] Implement: Create `team_invites` table with specified columns and unique constraint on `(team_id, email)`.
    - [ ] Verify: Tests pass.
- [ ] Task: Implement Shell Profile Trigger
    - [ ] Write failing test: Verify creating an auth user does NOT create a `public.users` row.
    - [ ] Implement: Create trigger function and trigger on `auth.users`.
    - [ ] Verify: Creating a user via `auth.signUp` results in a row in `public.users`.
- [ ] Task: Implement Invite Limit Trigger
    - [ ] Write failing test: Verify more than 3 pending invites can be created for a team.
    - [ ] Implement: Create trigger to enforce max 3 pending invites per team.
    - [ ] Verify: Attempting to add a 4th pending invite fails.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: New Tables and Automation' (Protocol in workflow.md)

## Phase 4: Final Verification
- [ ] Task: Execute comprehensive database audit tests
    - [ ] Action: Run all schema-related tests (`src/test/db_schema.test.js` and new tests).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
