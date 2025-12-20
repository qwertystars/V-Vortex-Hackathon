# Plan: Baseline Audit (Robust Auth Flow Step 1)

## Phase 1: Environment & Tooling Setup [checkpoint: 06aecb5]
- [x] Task: Verify Supabase Connectivity and Test Environment 521c393
- [x] Task: Create Baseline Test Utility (helpers for checking table/column/RLS state) 39aace7
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup' (Protocol in workflow.md) 06aecb5

## Phase 2: Database Schema & RLS Audit (Automated)
- [ ] Task: Implement Automated Tests for Schema Verification (Tables, Columns, FKs)
- [ ] Task: Implement Automated Tests for Current RLS Policies (Verifying current permissions)
- [ ] Task: Implement Automated Tests for Database Triggers and Constraints
- [ ] Task: Conductor - User Manual Verification 'Phase 2: DB Audit' (Protocol in workflow.md)

## Phase 3: Frontend Code Audit & Documentation
- [ ] Task: Audit Frontend for Pre-auth DB Reads and Role Selectors
- [ ] Task: Audit Frontend for SessionStorage Routing and Context Gaps
- [ ] Task: Update `docs/database_schema.md` with Current Reality and Gap Annotations
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Audit' (Protocol in workflow.md)

## Phase 4: Finalization
- [ ] Task: Final Review of Identified Gaps against `TODO.md` Step 1
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Finalization' (Protocol in workflow.md)
