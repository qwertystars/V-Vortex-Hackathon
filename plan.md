# V‑VORTEX: Login/Logout Testing + “Correct” Team Registration (Async UX) Plan

## 0) What you asked for (requirements checklist)

1. Use MCP tools for **Supabase** and **Playwright** to test **login** and **logout**.
2. Fix team registration so that **team members are actually registered** (not just the leader).
3. Make registration **async/instant-feeling**:
   - UI should “feel” like it registered instantly (during the vortex animation).
   - Backend should still be registering during the animation.
   - If an error occurs, we must **surface it** and allow the user to recover.
4. Produce a **very detailed** `plan.md` describing the above.

This document is that detailed plan, and it also references the concrete implementation points that satisfy it.

---

## 1) Root cause(s) of “leader registered, members not”

### 1.1 Non-atomic writes (partial registration)
The old registration flow did:
1) `INSERT teams ...`
2) `INSERT team_members ...`
3) (optional) `fetch(GOOGLE_SHEETS_WEBHOOK_URL, ...)`

If step (2) fails (RLS, constraint, bad payload, etc.) the team row from (1) remains, producing the exact symptom: “leader/team exists but members are missing.”

### 1.2 RLS mismatch: `team_members` insert is not allowed for `anon`
Supabase RLS policies currently allow anon insert into `teams`, but `team_members` insert policy requires `authenticated`.

That means:
- Any attempt to insert members from a non-authenticated context will fail.
- Even if you “fixed” the frontend, you’ll still fail unless you use:
  - a Service Role key (Edge Function), OR
  - a SECURITY DEFINER Postgres function that can bypass RLS safely.

### 1.3 Leader/member roster consistency
Several UI screens treat `team_members` as the “team roster” (and display team size from `teamMembers.length`).

If the leader exists only in `teams` and not in `team_members`, the roster and “team size” UI is misleading.

### 1.4 Non‑VIT payload mismatch (already broken)
Frontend sends `eventHubId` for non‑VIT teams, while backend expects `institution`.
This makes non‑VIT registrations fail validation and is part of “things have gone sideways.”

---

## 2) Target architecture (the “correct” fix)

### 2.1 Single atomic DB operation for team + roster
Create a Postgres RPC function that:
- Validates the payload.
- Inserts the `teams` row.
- Inserts *leader + all members* into `team_members` (leader has `is_leader = true`).
- Runs as `SECURITY DEFINER` so it can bypass RLS safely.
- Executes in a single transaction so it can never partially register.

Result:
- Either **everything** is inserted, or **nothing** is inserted.
- The “leader registered but members not” state can’t happen.

### 2.2 Edge Function becomes a thin orchestrator
The Edge Function should:
- Parse/normalize the request.
- Call the atomic RPC (`register_team_v1`).
- Send Google Sheets webhook **best-effort** (do not fail registration if Sheets is down).
- Return a concise result:
  - `teamId`
  - `insertedMemberCount`
  - `sheetsOk`

### 2.3 Frontend: optimistic/async UX with real error recovery
Frontend should:
- Start the vortex animation immediately on submit (optimistic UX).
- Kick off the backend registration in parallel.
- During the animation:
  - Show a “registered/locked-in” feel (success framing).
  - Still track the backend promise.
- If backend finishes late:
  - Show a “Finalizing…” state instead of navigating early.
- If backend fails:
  - Stop/slow the animation, bring the form back, and show an overlay error with a “Back to form / retry” action.

---

## 3) Concrete implementation plan (step-by-step)

### 3.1 Supabase (DB): add atomic RPC + uniqueness

**Goal:** Guarantee team + members write is atomic and safe under anon callers.

1) Add unique constraint/index:
   - `teams.lead_email` should be unique case-insensitively so one leader email cannot register multiple times.
   - Use: `CREATE UNIQUE INDEX ... ON teams (lower(lead_email))`

2) Add RPC function:
   - Name: `public.register_team_v1(...)`
   - Type: `SECURITY DEFINER`, `plpgsql`, `SET search_path = public`
   - Inputs:
     - `team_name`, `team_size`, `is_vit_chennai`, `institution` (or EventHub ID), leader fields, receipt link
     - members as JSONB array of `{ name, email, reg, institution }`
   - Validations:
     - required fields
     - `team_size` is 2–4
     - members count equals `team_size - 1`
     - no duplicate emails within the team payload
     - reject if any email already exists as a leader or as any member (case-insensitive)
   - Inserts:
     - Insert into `teams` and capture `team_id`
     - Insert leader row into `team_members` with `is_leader=true`
     - Insert all other members into `team_members` with `is_leader=false`
   - Returns:
     - `team_id`
     - `inserted_member_count` (includes leader row)

3) Grant RPC execute to anon/authenticated:
   - `GRANT EXECUTE ON FUNCTION ... TO anon, authenticated;`

**Why this fixes the bug:**
- The function executes as one transaction; an error inserting any member rolls back the entire team insert.
- It bypasses RLS in a controlled way (SECURITY DEFINER), so anon registration can still insert into `team_members` even though the table’s RLS policy blocks anon inserts directly.

### 3.2 Supabase (Edge Function): call RPC + make Sheets best-effort

1) Parse request body.
2) Backward compatibility:
   - accept both `institution` and `eventHubId` (use `institution ?? eventHubId`)
3) Call `supabase.rpc('register_team_v1', ...)`.
4) Error mapping:
   - `22023` → HTTP `400`
   - `23505` → HTTP `409`
   - else → HTTP `500`
5) Google Sheets webhook:
   - wrap in `try/catch`
   - if it fails, log warning but return success to user (`sheetsOk: false`)

**Why this matters:**
- If Sheets fails after DB insertion, you avoid the “it failed but it actually registered” disaster.

### 3.3 Frontend: async/instant-feeling registration flow

**Goal:** Start animation immediately, register in the background, and still handle errors.

1) On submit:
   - Validate the form (same as now).
   - Generate `submissionId` (to ignore stale async results).
   - Start animation immediately:
     - set “sucked” state on
     - increase vortex speed
     - optionally play SFX
   - Show the overlay after a short delay (existing UX timing).
   - Trigger backend call *without waiting for animation*.

2) While backend promise runs:
   - Keep showing the vortex overlay.
   - After the “minimum animation” window ends:
     - if backend is still pending, switch overlay copy to `FINALIZING…`.

3) On backend success:
   - Save response (`teamId`, `insertedMemberCount`, etc.)
   - Wait until minimum animation time has passed (if necessary).
   - Navigate to `/login`.

4) On backend error:
   - Switch overlay to error state.
   - Bring the form back (undo `sucked` state).
   - Allow retry (reset relevant state, keep user on the page).

---

## 4) Testing plan (MCP + manual)

### 4.1 Supabase MCP checks (schema + correctness)
Use MCP Supabase tooling to:
1) Confirm policies and schema:
   - Verify `team_members` has RLS and insert policy is authenticated-only (expected).
2) Confirm RPC exists and privileges:
   - `register_team_v1` is callable by anon/authenticated.
3) Confirm atomicity:
   - Try a registration payload that will fail member validation (e.g., missing member email).
   - Expected: no `teams` row is created.
4) Confirm roster correctness:
   - For a successful registration, `team_members` rows should equal `team_size` (leader + others).

### 4.2 Playwright MCP checks (UI flows)
Because OTP delivery is email-based, full automation is limited without access to the mailbox. The plan is:

1) **Login (real):**
   - Navigate to `/login`
   - Fill team name + email for a known team, submit
   - Verify modal appears (“battle code dispatched”) and navigation to `/otp` works

2) **Logout (UI-level):**
   - Navigate to a dashboard with a stubbed/mocked Supabase session and stubbed REST responses
   - Click `DISCONNECT`
   - Verify navigation back to `/`

### 4.3 Manual verification (you can do this)
1) Register a team of 3–4 members:
   - Confirm UI instantly starts vortex animation
   - Wait until it redirects to `/login`
2) Verify DB result:
   - `teams` row exists
   - `team_members` has **team_size rows**, with exactly one `is_leader=true`
3) Login as leader (Team Leader role):
   - Receive OTP, verify, land in dashboard
4) Logout:
   - Click `DISCONNECT`, confirm you’re back at `/` and future dashboard access requires login again
5) Login as a member (Team Member role):
   - Receive OTP, verify, land in `/member`
   - Team roster should show leader badge and correct team size

---

## 5) Rollout plan

1) Apply DB migration (RPC + leader email unique index).
2) Deploy Edge Function update.
3) Deploy frontend update.
4) Monitor:
   - Edge Function logs for RPC errors (400/409/500)
   - New teams should always have `team_members` count == `team_size`
5) If something goes wrong:
   - Disable the new Edge Function version (roll back)
   - The DB function is “create or replace” and safe to keep; errors will be surfaced as 400/409/500.

---

## 6) Notes / non-goals

- This plan prioritizes correctness and atomicity over “best effort inserts.”
- Google Sheets sync is treated as non-critical so it cannot break registration.
- Full end-to-end OTP automation is not feasible without mailbox access; the plan provides both Playwright UI checks and a manual verification sequence.

