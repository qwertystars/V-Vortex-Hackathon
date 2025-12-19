# Specification: Database Schema & RLS Setup for Users and Teams

## 1. Overview
This track focuses on designing and implementing the PostgreSQL database schema for the V-Vortex platform. The goal is to set up the `users` and `teams` tables along with necessary lookup tables (`domains`, `problem_statements`), automate unique code generation, enforce team size limits (2-4 members), and secure data using Row Level Security (RLS) policies.

## 2. Functional Requirements

### 2.1 Database Schema
The following tables must be created with appropriate data types and constraints:

1.  **`domains` (Lookup Table)**
    *   `id` (Primary Key)
    *   `name` (Text, Unique)

2.  **`problem_statements` (Lookup Table)**
    *   `id` (Primary Key)
    *   `title` (Text)
    *   `description` (Text)
    *   `domain_id` (Foreign Key -> `domains.id`)

3.  **`users`**
    *   `id` (Primary Key, References `auth.users.id` to link with Supabase Auth)
    *   `name` (Text)
    *   `email` (Text, Unique)
    *   `phone` (Text, Nullable)
    *   `role` (Text)
    *   `university_name` (Text)
    *   `event_hub_id` (Text, Nullable - for non-VIT students)
    *   `created_at` (Timestamp, Default: `now()`)

4.  **`teams`**
    *   `id` (Primary Key, UUID)
    *   `team_name` (Text)
    *   `team_code` (Text, Unique, Auto-generated)
    *   `problem_statement_id` (Integer, Nullable, Foreign Key -> `problem_statements.id`)
    *   `domain_id` (Integer, Nullable, Foreign Key -> `domains.id`)
    *   `payment_link` (Text)
    *   `payment_verified` (Boolean, Default: `false`)
    *   `created_at` (Timestamp, Default: `now()`)
    *   `updated_at` (Timestamp, Default: `now()`)

5.  **`team_members` (Junction Table)**
    *   `team_id` (Foreign Key -> `teams.id`)
    *   `user_id` (Foreign Key -> `users.id`)
    *   Primary Key: (`team_id`, `user_id`)

### 2.2 Automation & Logic
*   **Team Code Generation:** A database trigger/function must automatically generate a unique `team_code` upon team insertion.
*   **Team Size Validation:** A database trigger must enforce the team size limit (Min 2, Max 4).
    *   *Note:* The trigger should prevent adding a 5th member. (The "Min 2" requirement is typically a business logic check at submission time, but the "Max 4" can be a hard database constraint).
*   **Timestamps:** An automated trigger should update the `updated_at` column in the `teams` table on modification.

### 2.3 Row Level Security (RLS)
*   Enable RLS on all created tables.
*   **Users Table:** Users can view and edit ONLY their own profile.
*   **Teams Table:**
    *   Users can view details of the team they belong to.
    *   Team Leaders (derived from role/membership) can update team details.

## 3. Documentation
*   Create a `docs/` folder.
*   Add a `database_schema.md` documenting the tables, columns, relationships, and policies.

## 4. Out of Scope
*   Frontend integration (React code changes).
*   Edge Function implementation (e.g., the registration logic itself).
