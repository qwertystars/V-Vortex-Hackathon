# Plan: Authentication & Registration Flow

## Phase 1: Supabase & Project Configuration [checkpoint: 6d25503]
- [x] Task: Initialize Supabase client and AuthContext [57d9c9a]
    - [x] Subtask: Configure `supabaseClient.js` with environment variables.
    - [x] Subtask: Create/Update `AuthContext.jsx` to handle session persistence and exposure of auth state.
    - [x] Subtask: Write unit tests for `AuthContext` (mocking Supabase).

## Phase 1.5: Edge Function Initialization
- [x] Task: Initialize Edge Functions & Create Hello World [81763ad]
    - [x] Subtask: Create `supabase/functions/hello-world` structure.
    - [x] Subtask: Deploy/Verify function.
    - [ ] Subtask: Deploy/Verify function.

## Phase 2: Database Schema & RLS
- [ ] Task: Set up Database Schema
    - [ ] Subtask: Create migration for `profiles` and `teams` tables.
    - [ ] Subtask: Create triggers for handling new user creation (linking `auth.users` to `public.profiles`).
- [ ] Task: Implement Row Level Security (RLS)
    - [ ] Subtask: Define RLS policies for `profiles` (Users can read/update own data; Team members can read team data).
    - [ ] Subtask: Define RLS policies for `teams` (Leaders can insert/update own team; Members can read).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Database Schema & RLS' (Protocol in workflow.md)

## Phase 3: Unified Login & Routing
- [ ] Task: Implement Login Page
    - [ ] Subtask: Create `LoginPage.jsx` with Email input and "Send OTP" button.
    - [ ] Subtask: Implement "Verify OTP" form state.
    - [ ] Subtask: Write integration test for the Login flow.
- [ ] Task: Implement Protected Routes & Redirection Logic
    - [ ] Subtask: Create a `ProtectedRoute` component that checks auth state.
    - [ ] Subtask: Implement the routing logic in `App.jsx` to handle the 4 redirection scenarios (Leader/Member x Pre/Post state).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Unified Login & Routing' (Protocol in workflow.md)

## Phase 4: Team Creation (Leader Flow)
- [ ] Task: Implement Team Creation Form
    - [ ] Subtask: Create `CreateTeam.jsx` page.
    - [ ] Subtask: Connect form submission to `teams` table insert.
    - [ ] Subtask: Update user profile role to `team_leader` upon success.
    - [ ] Subtask: Write tests for team creation logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Team Creation (Leader Flow)' (Protocol in workflow.md)

## Phase 5: Member Invitation & Onboarding
- [ ] Task: Implement Invitation Logic (Edge Function)
    - [ ] Subtask: Create Supabase Edge Function `invite-member` that uses `auth.admin.inviteUserByEmail`.
    - [ ] Subtask: Implement UI in Leader Dashboard to call this function.
- [ ] Task: Implement Member Onboarding Form
    - [ ] Subtask: Create `MemberOnboarding.jsx` page.
    - [ ] Subtask: Form to capture user details.
    - [ ] Subtask: On submit, update `profiles` table and set `onboarding_completed` to true.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Member Invitation & Onboarding' (Protocol in workflow.md)
