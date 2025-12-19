# Product Guide: V-Vortex Hackathon Platform

## Initial Concept
A web application for handling attendee registration, team formation, project submission, real-time scorekeeping, and administrative tools for a hackathon.

## Product Vision
To provide a seamless, secure, and user-friendly platform for V-Vortex hackathon participants to register, form teams, and manage their participation, powered by a robust Supabase-only backend.

## Target Audience
*   **Hackathon Participants:**
    *   **Team Leaders:** Responsible for creating teams, managing team details, and inviting members.
    *   **Team Members:** Join existing teams via invitation and complete their individual profiles.

## Core Features (Phase 1: Authentication & Registration)

### 1. Authentication (Supabase Auth)
*   **Method:** Passwordless authentication using Email OTP (Magic Link template adapted for code entry).
*   **Identity:** Email is the primary unique identifier. One user record per authenticated email.
*   **Session Management:** Secure session creation, persistence, expiry handling, and explicit logout.

### 2. User Roles & Access Control
*   **Roles:**
    *   `team_leader`: Assigned to the user who creates a team.
    *   `team_member`: Assigned to users invited to a team.
*   **Access Rules:**
    *   **Unauthenticated:** Public pages only.
    *   **Team Leader (Pre-team):** Access to team creation flow.
    *   **Team Leader (Post-team):** Access to Leader Dashboard, ability to invite members.
    *   **Team Member (Pre-onboarding):** Restricted to onboarding flow.
    *   **Team Member (Post-onboarding):** Access to Member Dashboard, read-only team view.

### 3. Registration & Onboarding Flow
*   **Unified Login:** Single entry point for all users via Email + OTP.
*   **Post-Login Routing:**
    *   Leader w/ Team -> Leader Dashboard
    *   Leader w/o Team -> Team Creation
    *   Member w/ Profile -> Member Dashboard
    *   Member w/o Profile -> Member Onboarding
*   **Team Creation:** Leaders authenticate first, then create team data.
*   **Member Onboarding:** Members accept invites, authenticate, and then fill out their own profile details.

### 4. Team Management (Invite System)
*   **Invitation:** Leaders invite members via email from the dashboard.
*   **Mechanism:** Uses Supabase `inviteUserByEmail` via Edge Functions (Service Role).
*   **Acceptance:** Members click invite link -> authenticate/create account -> linked to team.
*   **Constraints:**
    *   Prevent duplicate invites.
    *   Prevent accept re-use.
    *   One active OTP per email.

### 5. Technical Constraints (Hard Rules)
*   **Backend:** 100% Supabase (Auth, DB, RLS, Edge Functions). No external backend server.
*   **Auth:** No passwords, no social login.
*   **Data Integrity:** No team data created before authentication. No registration without verified email.

## Out of Scope (Phase 1)
*   Admin & Judge roles/workflows.
*   Payment verification.
*   Project submission portals.
*   Leaderboards & Scoring.
*   Account deletion & Email changes.
