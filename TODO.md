# Robust Auth Flow TODO (ordered)

## Step 0 — Freeze spec (acceptance criteria)
### Auth State Matrix (desired)
#### Signals (inputs you can trust)
- **Supabase session:** `supabase.auth.getSession()` / `supabase.auth.getUser()`
- **JWT role (routing hint, not authorization):** `user.app_metadata.role` ∈ `{team_leader, team_member}`
- **DB truth (authorization + routing):**
  - `team_id` the user belongs to (from `team_members`)
  - `is_leader` (either `teams.leader_user_id == auth.uid()` or membership + role rule)
  - `onboarding_complete` (from `profiles/users`)

#### Routing matrix (post-auth routing)
- **S0 — Unauthenticated**
  - **Condition:** no valid session
  - **Expected:** allow only public routes (`/`, `/login`, `/otp`); redirect any protected route to `/login`
  - **Sanity checks:**
    - `/otp` without a pending login email/context → redirect to `/login` (don’t allow OTP verify UX to start “cold”).

- **S1 — OTP requested (pre-verify)**
  - **Condition:** no session yet; user just requested OTP (email known in-memory or temporary storage)
  - **Expected:** user can proceed to `/otp`; nothing team-related is queried yet
  - **Sanity checks:**
    - OTP request for **member login** must use `shouldCreateUser: false` so non-invited emails cannot create accounts.
    - OTP request for **leader registration** may use `shouldCreateUser: true` (controlled entry point).

- **S2 — Authenticated, context unknown**
  - **Condition:** session exists, but app does not yet know `{role, team_id, onboarding_complete}`
  - **Expected:** call a single “context” fetch (`get-my-context`) and decide routing from DB truth
  - **Sanity checks:**
    - Never read `role`/`team_id` from `sessionStorage` for routing (tamperable).
    - If JWT role exists, it must be treated as a hint and cross-checked with DB membership.

- **S3 — Authenticated leader, team exists**
  - **Condition:** session exists AND DB says user is leader AND `team_id` exists
  - **Expected:** route to Leader Dashboard (`/dashboard` or `/dashboard/:teamId` derived from context)
  - **Sanity checks:**
    - If URL contains a different `:teamId` than context, redirect to the context teamId (or show “not authorized”).
    - Leader dashboard actions (invite/update team) must be server-validated (Edge Function + DB checks), not client-trusted.

- **S4 — Authenticated leader, no team yet**
  - **Condition:** session exists AND role is leader BUT DB has no team for this leader
  - **Expected:** route to Team Creation flow
  - **Sanity checks:**
    - “Create team” must require an authenticated session (no team creation pre-auth).

- **S5 — Authenticated member, assigned to a team, onboarding incomplete**
  - **Condition:** session exists AND member has `team_id` AND `onboarding_complete == false`
  - **Expected:** route to Member Onboarding (`/onboarding`)
  - **Sanity checks:**
    - Onboarding writes must be protected by RLS (`profiles/users` update only for `auth.uid()`).

- **S6 — Authenticated member, assigned to a team, onboarding complete**
  - **Condition:** session exists AND member has `team_id` AND `onboarding_complete == true`
  - **Expected:** route to Member Dashboard (`/member`)
  - **Sanity checks:**
    - Member dashboard must be route-guarded (no “static” member UI without auth).

- **S7 — Authenticated but not assigned / not enabled**
  - **Condition:** session exists but DB shows no team membership AND not a leader with a team
  - **Expected:** show a “Not in a team yet” screen with next steps (contact leader / wait for invite)
  - **Sanity checks:**
    - This should be rare if “invite enables them” is implemented correctly (membership created at invite time).

#### Invite semantics (member enablement)
- **Goal:** inviting a member both (1) emails them and (2) makes them immediately eligible to OTP-login (link optional).
- **At invite time (server-side, Edge Function):**
  - Create or fetch `auth.users` for the invited email.
  - Set `app_metadata.role = team_member` (and optionally `app_metadata.team_id`).
  - Create `team_members` row linking the invited user to the team.
  - Send Supabase invite email template (notification + convenience link).
- **Sanity checks:**
  - Inviting the same email twice is idempotent (no duplicate membership rows; no unlimited email spam).
  - Enforce max team size (2–4) at DB level + in the invite function.

#### Hard rules (robustness + security)
- **Authorization lives in DB/RLS, not in the client:**
  - RLS prevents reading/updating teams/memberships outside the user’s team.
  - Leader-only operations happen through Edge Functions that validate the caller.
- **JWT role is set only by the server:**
  - Use `app_metadata`, not `user_metadata`.
  - Treat JWT role as a routing hint; always cross-check with DB membership.
- **No pre-auth team queries:**
  - Login is email → OTP only.
  - Team membership checks happen only after session exists.
- **No hardcoded Supabase backend values:**
  - Frontend uses `.env` only (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, plus an optional `VITE_SITE_URL`).
  - Edge Functions use secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL/APP_URL`) and never embed `*.supabase.co` or keys in code.

#### Step 0 tests (must pass before coding)
- Walk through S0–S7 and confirm there is exactly one correct redirect destination per state.
- Confirm “invite enables login” requirement: invited email must be able to OTP-login without clicking invite link.

## Step 1 — Baseline audit (current state; document gaps)
### Supabase DB (current state from live schema)
- Public tables present: `domains`, `problem_statements`, `users`, `teams`, `team_members` (no invite table).
- No Edge Functions are deployed in Supabase right now (project reports none).
- `teams` columns: `id`, `team_name`, `team_code` (auto), `problem_statement_id`, `domain_id`, `payment_link`, `payment_verified`, `created_at`, `updated_at` (no leader reference).
- `team_members` columns: `team_id`, `user_id` with FK **to `public.users(id)`** (not `auth.users(id)`).
- `users` (profile) has hard `NOT NULL` fields: `name`, `email`, `role`, `university_name` (so “invited but not onboarded” cannot exist cleanly today).
- Triggers exist: team code generation, `updated_at`, max team size (4).
- RLS policies are currently too permissive for the desired auth flow:
  - `team_members` `SELECT` is allowed for any authenticated user (not scoped to “my team”).
  - `team_members` `INSERT` is allowed for any authenticated user (so any user can join/forge memberships without an invite).
  - `teams` `UPDATE` is allowed for any team member (not leader-only).

### Frontend (what’s missing today)
- **Unify login UI:** remove leader/member selector + team-name checks in `src/pages/login.jsx`; login should be email-only OTP.
- **Member vs leader creation rule:** use `shouldCreateUser:false` for member login; keep `shouldCreateUser:true` only for an explicit leader registration/signup flow.
- **No pre-auth DB reads:** delete/replace pre-auth `teams`/`team_members` queries currently done in `src/pages/login.jsx`.
- **Post-login routing by server truth:** remove `sessionStorage`-based routing in `src/pages/otp.jsx`; after OTP verify, fetch `{role, teamId, onboardingComplete}` from server (e.g., `get-my-context`) and route from that.
- **Leader registration flow alignment:** `src/pages/register.jsx` currently invokes `register-team` pre-auth; expected flow needs OTP-first, then team creation while authenticated.
- **Invite members UI:** leader dashboard needs a form (member name + email) and wiring to an Edge Function (`invite-member`) that enables the member + sends email.
- **Member onboarding UI:** add an onboarding route/page to collect member details and mark `onboarding_complete` in DB.
- **Route guards:** protect `/member` (currently unguarded) and leader dashboards; ensure unauthorized users are redirected consistently.
- **Central auth state:** wire `AuthProvider` (currently unused) into `src/main.jsx` or add an equivalent auth gate so pages don’t duplicate auth checks.
- **Dashboard URL safety:** avoid trusting `:teamId` from the URL as the primary selector; derive teamId from context or handle mismatches cleanly.
- **Env-only Supabase config:** keep all client config in `.env`/`import.meta.env` (no hardcoded `*.supabase.co`); consider adding `VITE_SITE_URL` if you implement redirects/invite landing pages.

#### Step 1 tests (must pass before migrations)
- Confirm the live schema matches the repo’s assumptions (list columns used by frontend; verify they exist).
- Confirm RLS currently allows/blocks the operations you expect (so you understand what will break when tightening policies).

## Step 2 — Database schema changes (make the flow possible)
### Required schema changes to support “invite enables + OTP login + role-from-JWT routing”
- Add a server-truth leader link on the team:
  - Add `teams.leader_user_id uuid` referencing `auth.users(id)` (canonical leader indicator).
- Decouple team membership from “profile completeness” (required for invited members):
  - Recommended: change `team_members.user_id` FK to reference `auth.users(id)` instead of `public.users(id)`.
  - Alternative (more fragile): keep FK to `public.users(id)` but make `users.name/university_name/role` nullable or add safe defaults so placeholder profiles can exist until onboarding.
- Add onboarding state (needed for post-login routing):
  - Add `users.onboarding_complete boolean not null default false` (or create a dedicated `profiles` table with this flag).
- Add an invites/audit table (strongly recommended for idempotency + admin visibility even if the link is optional):
  - Create `team_invites` with at least: `team_id`, `email`, `invited_by`, `invited_user_id` (nullable until created), `status`, `created_at`, `accepted_at`.
  - Add `unique(team_id, email)` to prevent duplicate invites.
- Optional integrity constraints (recommended):
  - If “one user = one team”, add a uniqueness constraint on membership (e.g., `unique(user_id)` in `team_members`).

#### Step 2 tests (DB-level)
- Create team + membership rows and verify triggers still work (team code, size limit, updated_at).
- Ensure an invited member can exist in DB before onboarding (membership exists; profile may be incomplete by design).

## Step 3 — RLS hardening (make it safe)
### Required RLS changes (minimum)
- `team_members`:
  - `SELECT`: restrict to rows in teams the user belongs to (no global membership enumeration).
  - `INSERT`: remove client-side insert; membership should be created only by an invite/registration function.
- `teams`:
  - `UPDATE`: restrict to leader only (`auth.uid() = teams.leader_user_id`).
  - `INSERT`: ideally only via a controlled “create-team” path that enforces invariants.
- `users`/profiles:
  - Ensure there is a safe path to create a profile row (trigger on `auth.users` insert, or a restricted `INSERT` policy for `id = auth.uid()`).
  - Keep onboarding as `UPDATE` only for `auth.uid()`.

#### Step 3 tests (policy-level)
- Signed-in user can only see their own team + roster.
- Member cannot update team; leader can.
- Member cannot insert into `team_members` directly; only server path can.

## Step 4 — Edge Functions (privileged operations; service role lives here)
- Deploy functions (none exist today) to cover:
  - `create-team` (authenticated): create team + leader membership + set leader role in `app_metadata`.
  - `invite-member` (leader-only): create/reuse `auth.users`, set member role in `app_metadata`, create membership, send invite email.
  - `get-my-context` (authenticated): return `{ role, teamId, onboardingComplete }` for post-login routing.
- Ensure functions use secrets (no hardcoded Supabase URL/keys) and validate the caller JWT on every request.

#### Step 4 tests (function-level)
- Non-leader cannot call `invite-member`.
- Invited member can OTP-login with `shouldCreateUser:false` without clicking invite link.
- `get-my-context` returns consistent values across refresh/relogin.

## Step 5 — Frontend implementation (routing by server truth)
- Make login email-only; remove role selector and any pre-auth team queries.
- In OTP verify flow, route based on `get-my-context` (never `sessionStorage` role/teamId).
- Add onboarding route/page; write profile + `onboarding_complete`.
- Add route guards for leader/member pages (auth + role checks).
- Centralize session state (use `AuthProvider` or a small auth gate) so auth checks aren’t duplicated inconsistently.

#### Step 5 tests (frontend)
- Unit tests for OTP routing matrix (leader → dashboard; member incomplete → onboarding; member complete → member dashboard).
- Tamper tests: changing `sessionStorage` and URL params does not change authorization or leak data.

## Step 6 — Final audits (config + security)
- No hardcoded Supabase URLs/keys; frontend uses `.env` only (currently `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`).
- Ensure service role is never shipped to the browser (no `VITE_` service key).
- Verify RLS is the ultimate enforcement layer (client-side checks are only UX).

## End-to-end verification checklist (human + CI)
- **Member enablement:** invite a new email → member can request OTP with `shouldCreateUser:false` → verify OTP → routed to onboarding.
- **No-link requirement:** invited member can OTP-login without clicking invite link.
- **Role routing:** leader always routes to leader dashboard; member routes to onboarding/dashboard based on `onboarding_complete`.
- **Tamper resistance:** changing `sessionStorage`, URL params, or local state cannot grant cross-team access (RLS blocks; UI redirects).
- **Config hygiene:** ripgrep confirms no hardcoded Supabase URLs/keys in `src/` or functions; only env lookups exist.
