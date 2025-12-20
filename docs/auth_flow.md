# Auth Flow

This document describes the current authentication and registration flow for V-Vortex.

## Entry Points
- `/register`: public entry for new teams and members. Users verify email via OTP, then complete leader or member registration.
- `/login`: public entry for returning users. Sends OTP and routes based on context.
- `/otp`: verifies OTP and routes to `/register` (registration flow) or the appropriate dashboard.

## Registration: Team Leader
1. User selects "Team Leader" on `/register` and verifies email via OTP.
2. User submits team and leader details (team name, VIT toggle, leader name, battle ID if VIT, payment link, optional phone).
3. Edge function `create-team`:
   - Creates the team.
   - Inserts leader into `team_members`.
   - Upserts leader profile in `users`.
   - Updates auth metadata (`role`, `team_id`).
4. UI refreshes context and routes to `/dashboard`.
5. Team code is displayed in the leader dashboard (Team Code tab).

## Registration: Team Member
1. User selects "Team Member" on `/register` and verifies email via OTP.
2. User submits member details plus team code.
3. Edge function `join-team`:
   - Validates the team code and team capacity.
   - Prevents users from joining multiple teams.
   - Inserts into `team_members`.
   - Upserts profile in `users`.
   - Updates auth metadata (`role`, `team_id`).
4. UI refreshes context and routes to `/member`.

## Login
1. User enters email on `/login` and receives OTP.
2. `/otp` verifies the code and calls `get-my-context`.
3. Routing happens via `routeForContext`:
   - Leader with team -> `/dashboard`.
   - Member with team -> `/member`.
   - No team -> `/register`.

## Context + Routing Rules
- `get-my-context` derives role/team by checking:
  - `teams.leader_user_id` (leader)
  - `team_members.user_id` (member)
- `routeForContext` sends users without a team to `/register`.

## Removed Flows
- Invite links and `/invite`.
- `/onboarding` and `/waiting`.
- Team membership is now based on team code through `/register`.
