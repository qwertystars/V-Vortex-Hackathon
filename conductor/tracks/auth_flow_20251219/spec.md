# Specification: Authentication & Registration Flow

## Goal
Implement a secure, seamless, and Supabase-only authentication and registration system for the V-Vortex Hackathon platform. This ensures team leaders can create teams and members can join via secure invites.

## Core Features

### 1. Unified OTP Login
*   **Single Entry Point:** A unified `/login` page for all users.
*   **Mechanism:** Email + OTP (One-Time Password) via Supabase Auth Magic Link (configured as code).
*   **Session:** Persistent sessions handled by `AuthContext`.

### 2. Intelligent Post-Login Routing
*   **Logic:** Upon successful login, the user is redirected based on their role and onboarding status:
    *   **New User / Leader (Pre-Team):** Redirect to Team Creation (`/team/create`).
    *   **Leader (Post-Team):** Redirect to Leader Dashboard (`/dashboard/leader`).
    *   **Member (Pre-Onboarding):** Redirect to Member Onboarding (`/member/onboard`).
    *   **Member (Post-Onboarding):** Redirect to Member Dashboard (`/dashboard/member`).

### 3. Team Management (Leader)
*   **Create Team:** Form to input team details (Name, Description, etc.).
    *   *Constraint:* User must be authenticated.
    *   *Action:* Creates a record in `teams` table and links user as `team_leader`.
*   **Invite Members:** Feature in Leader Dashboard to invite users by email.
    *   *Backend:* Supabase Edge Function to securely call `inviteUserByEmail`.

### 4. Member Onboarding
*   **Accept Invite:** Users click email link -> Auth/Create Account -> Linked to team as `team_member`.
*   **Profile Completion:** Mandatory step for members to fill in their details (Name, Skills, GitHub, etc.) before accessing the dashboard.

## Database Schema (Supabase)

### `profiles` Table
*   `id` (uuid, PK, references `auth.users`)
*   `email` (text)
*   `full_name` (text)
*   `role` (text: 'team_leader' | 'team_member')
*   `team_id` (uuid, references `teams.id`)
*   `onboarding_completed` (boolean)

### `teams` Table
*   `id` (uuid, PK)
*   `name` (text, unique)
*   `created_by` (uuid, references `profiles.id`)

## Technical Constraints
*   **Supabase Only:** No custom backend servers.
*   **Security:** RLS policies must strictly enforce access (e.g., members can only edit their own profile).
