# Database Schema Documentation

This document describes the PostgreSQL database schema for the V-Vortex platform.

## Tables

### 1. `domains`
Lookup table for project domains (e.g., AI/ML, Cybersecurity).
- `id`: (bigint) Primary Key, Identity.
- `name`: (text) Unique, Not Null.

### 2. `problem_statements`
Lookup table for hackathon problem statements.
- `id`: (bigint) Primary Key, Identity.
- `title`: (text) Not Null.
- `description`: (text) Not Null.
- `domain_id`: (bigint) Foreign Key -> `domains(id)`.

### 3. `users`
Profile table for registered users, linked to Supabase Auth.
- `id`: (uuid) Primary Key, References `auth.users(id)`.
- `name`: (text) Not Null.
- `email`: (text) Unique, Not Null.
- `phone`: (text) Nullable.
- `role`: (text) Not Null (e.g., 'team_member', 'team_leader').
- `university_name`: (text) Not Null.
- `event_hub_id`: (text) Nullable.
- `created_at`: (timestamptz) Default: `now()`.
- `onboarding_complete`: (boolean) Not Null, Default: `false`.

### 4. `teams`
Table for storing team information.
- `id`: (uuid) Primary Key, Default: `gen_random_uuid()`.
- `team_name`: (text) Not Null.
- `team_code`: (text) Unique, Auto-generated (6-char alphanumeric).
- `problem_statement_id`: (bigint) Foreign Key -> `problem_statements(id)`.
- `domain_id`: (bigint) Foreign Key -> `domains(id)`.
- `payment_link`: (text) Nullable.
- `payment_verified`: (boolean) Default: `false`.
- `created_at`: (timestamptz) Default: `now()`.
- `updated_at`: (timestamptz) Default: `now()`.
- `leader_user_id`: (uuid) Foreign Key -> `auth.users(id)` (canonical leader indicator, unique per team).
- `lead_email`: (text) Observed in legacy code; not used for robust auth flow.

### 5. `team_members`
Junction table linking users to teams.
- `team_id`: (uuid) Foreign Key -> `teams(id)`.
- `user_id`: (uuid) Foreign Key -> `auth.users(id)` (allows invite-before-profile).
- Primary Key: (`team_id`, `user_id`).

### 6. `team_invites`
Invite tracking table (idempotent and auditable).
- `id`: (uuid) Primary Key, Default: `gen_random_uuid()`.
- `team_id`: (uuid) Foreign Key -> `teams(id)`.
- `email`: (text) Invited email.
- `invited_by`: (uuid) Foreign Key -> `auth.users(id)` (leader).
- `invited_user_id`: (uuid) Foreign Key -> `auth.users(id)` (nullable until created).
- `status`: (text) Default: `pending`.
- `created_at`: (timestamptz) Default: `now()`.
- `accepted_at`: (timestamptz) Nullable.
- Unique constraint: (`team_id`, `email`).

## Automation (Triggers & Functions)

### Team Code Generation
- **Function:** `generate_unique_team_code()`
- **Trigger:** `set_team_code` on `BEFORE INSERT` to `teams`.
- **Logic:** Generates a unique 6-character alphanumeric string if `team_code` is NULL.

### Updated At Timestamp
- **Function:** `handle_updated_at()`
- **Trigger:** `on_team_update` on `BEFORE UPDATE` to `teams`.
- **Logic:** Sets `updated_at` to `now()` on every update.

### Team Size Constraint
- **Function:** `check_team_size_limit()`
- **Trigger:** `enforce_team_size` on `BEFORE INSERT` to `team_members`.
- **Logic:** Prevents adding more than 4 members to a single team.

## Row Level Security (RLS)

RLS is enabled on all tables.

### Policies:
- **`domains` / `problem_statements`**: 
    - `SELECT`: Allowed for all users (public read).
- **`users`**:
    - `SELECT`: Users can view only their own row; leaders can view their team members.
    - `UPDATE`: Users can update only their own row.
    - `INSERT`: Users can insert their own profile row.
- **`teams`**:
    - `SELECT`: Users can view teams they are members of or lead.
    - `UPDATE`: Restricted to leader only.
    - `INSERT`: Restricted to leader creating their own team.
- **`team_members`**:
    - `SELECT`: Scoped to the user’s own team.
    - `INSERT`: Server-controlled (invite/create-team only).
- **`team_invites`**:
    - `SELECT`: Leader only (own team).
    - `INSERT/UPDATE/DELETE`: Server-controlled.
