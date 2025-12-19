# Implementation Plan: Database Schema & RLS Setup

This plan covers the creation of the core database schema for users and teams, including lookup tables, automation triggers, and RLS policies.

## Phase 1: Core Schema & Lookup Tables [checkpoint: a2b0467]
- [x] Task: Create `domains` and `problem_statements` tables. 4f9ae63
- [x] Task: Create `users` table with link to `auth.users`. e51a6a3
- [x] Task: Create `teams` table and `team_members` junction table. d40dc06
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Schema & Lookup Tables' (Protocol in workflow.md)

## Phase 2: Automation & Constraints
- [ ] Task: Implement `team_code` auto-generation function and trigger.
- [ ] Task: Implement `updated_at` timestamp trigger for `teams`.
- [ ] Task: Implement Team Size Constraint trigger (Max 4 members).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Automation & Constraints' (Protocol in workflow.md)

## Phase 3: Security (RLS) & Documentation
- [ ] Task: Enable RLS and define policies for `users`, `teams`, and `team_members`.
- [ ] Task: Create `docs/database_schema.md` with complete schema documentation.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Security (RLS) & Documentation' (Protocol in workflow.md)
