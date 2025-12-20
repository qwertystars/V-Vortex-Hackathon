# Specification: Baseline Audit (Robust Auth Flow Step 1)

## Overview
This track performs a comprehensive audit of the current project state (Database and Frontend) against the "Robust Auth Flow" requirements defined in `TODO.md` (Step 0). The goal is to identify exactly where the current implementation deviates from the target architecture and to establish a test-backed baseline of current behavior.

## Functional Requirements
1.  **Comprehensive Gap Analysis:**
    *   Audit the live Supabase schema (tables, columns, FKs, triggers, RLS) against the Step 1 requirements in `TODO.md`.
    *   Audit the frontend codebase (`src/pages/`, `src/services/`, etc.) for pre-auth DB reads, role selectors, and `sessionStorage`-based routing.
2.  **Automated Baseline Test Suite:**
    *   Implement a test suite in `src/test/baseline_audit.test.js` (or similar) that verifies:
        *   Existence of tables (`users`, `teams`, `team_members`, etc.).
        *   Presence of specific columns and constraints.
        *   Current RLS behavior (what is currently allowed vs. what should be blocked).
3.  **Documentation Updates:**
    *   Update `docs/database_schema.md` to reflect the *current* live reality.
    *   Annotate `docs/database_schema.md` with clear "GAP" or "TO BE CHANGED" notes identifying necessary migrations for Phase 2.

## Non-Functional Requirements
*   **Accuracy:** The audit must reflect the actual live state of the Supabase project, not just what is in the code.
*   **Idempotency:** The baseline tests should be runnable multiple times without side effects.
*   **Security:** Ensure no sensitive keys (like service role keys) are leaked or hardcoded during the audit process.

## Acceptance Criteria
- [ ] `docs/database_schema.md` is updated and accurately reflects the current state of the database.
- [ ] All gaps identified in `TODO.md` Step 1 are explicitly documented within the project docs.
- [ ] A new automated test suite `src/test/baseline_audit.test.js` is created and passes, confirming the current state of the system.
- [ ] No changes are made to application logic or schema in this track; it is strictly an audit and baselining effort.

## Out of Scope
*   Implementing any schema changes (Step 2).
*   Refactoring RLS policies (Step 3).
*   Deploying Edge Functions (Step 4).
*   Modifying frontend routing logic (Step 5).
