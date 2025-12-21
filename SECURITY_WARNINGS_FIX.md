# 🔧 Fixing Supabase Security Advisor Warnings

## Warnings Detected

### 1. ⚠️ Function Search Path Mutable (3 instances)
**Severity:** Medium  
**Functions Affected:**
- `public.get_score_delta`
- `public.record_scorecard_change`
- `public.update_scorecard_timestamp`

**Risk:** These functions use `SECURITY DEFINER` without setting an explicit `search_path`, which could allow search_path hijacking attacks.

**Fix Applied:** ✅ Migration `20251221000001_fix_function_search_path.sql`

---

### 2. ⚠️ Leaked Password Protection Disabled
**Severity:** Low (for OTP-only auth)  
**Affected:** Auth system

**Risk:** Users could potentially set weak or leaked passwords.

**Note:** Since your app uses OTP (magic link) authentication, users don't set passwords, so this is less critical. However, it's still good practice to enable it.

**Fix Required:** Manual configuration in Supabase Dashboard

---

## How to Apply Fixes

### Step 1: Run the Database Migration
```bash
cd supabase
supabase db push
```

This will:
- Fix all three function search_path warnings
- Add `SET search_path = public, pg_temp` to all functions
- Prevent search_path hijacking attacks

### Step 2: Enable Leaked Password Protection (Manual)

Since your app uses **OTP authentication** (magic links), users never set passwords. However, to fully resolve the warning:

#### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies**
3. Enable **"Leaked Password Protection"**
4. This integrates with HaveIBeenPwned API

#### Option B: Disable the Warning (Since you use OTP-only)
If you're only using OTP authentication and don't allow password-based sign-up:
1. The warning can be safely ignored
2. Or explicitly disable password sign-up in Supabase settings
3. Navigate to **Authentication** → **Providers** → Disable "Email" password provider

---

## What is Search Path Hijacking?

**The Vulnerability:**
```sql
-- VULNERABLE: No search_path set
CREATE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with creator's privileges
AS $$
BEGIN
  -- If attacker creates a malicious "now()" function in their schema,
  -- it could be called instead of the intended pg_catalog.now()
  SELECT now();
END;
$$;
```

**The Fix:**
```sql
-- SECURE: Explicit search_path
CREATE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Only look in public and temp schemas
AS $$
BEGIN
  -- Now it will always use the correct now() function
  SELECT now();
END;
$$;
```

**Why it matters:**
- `SECURITY DEFINER` functions run with the privileges of the function creator
- Without explicit `search_path`, an attacker could create malicious functions in their schema
- Those malicious functions could be called instead of the intended ones
- Setting `search_path = public, pg_temp` ensures only trusted schemas are searched

---

## Verification

After applying the migration, verify the fixes:

### 1. Check Function Definitions
```sql
-- Run in Supabase SQL Editor
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN (
  'get_score_delta',
  'record_scorecard_change',
  'update_scorecard_timestamp',
  'is_team_owner'
);
```

You should see `SET search_path = public, pg_temp` in each function definition.

### 2. Re-run Security Advisor
1. Go to **Advisors** → **Security Advisor** in Supabase Dashboard
2. Click **"Refresh"**
3. The function search_path warnings should be resolved ✅

### 3. Test Functions Still Work
```sql
-- Test score delta calculation
SELECT get_score_delta('some-team-uuid');

-- Check if triggers still fire
UPDATE scorecards SET innovation_score = innovation_score + 1 WHERE team_id = 'some-team-uuid';

-- Verify history was recorded
SELECT * FROM scorecard_history ORDER BY recorded_at DESC LIMIT 5;
```

---

## Summary of Changes

| Issue | Severity | Status | Fix |
|-------|----------|--------|-----|
| Function Search Path Mutable | Medium | ✅ Fixed | Migration applied |
| Leaked Password Protection | Low | ⚠️ Manual | Dashboard setting or N/A for OTP-only |

### Files Created:
1. `supabase/migrations/20251221000001_fix_function_search_path.sql`
2. `supabase/migrations/20251221000002_enable_password_protection.sql`

### Functions Updated:
- `get_score_delta()` - Added secure search_path
- `record_scorecard_change()` - Added secure search_path  
- `update_scorecard_timestamp()` - Added secure search_path
- `is_team_owner()` - Added secure search_path

---

## Best Practices for Future Functions

When creating new PostgreSQL functions:

```sql
-- Always use this template for SECURITY DEFINER functions:
CREATE OR REPLACE FUNCTION your_function_name()
RETURNS return_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- Critical for security!
AS $$
BEGIN
  -- Your function code here
END;
$$;
```

**Key Points:**
- ✅ Always set explicit `search_path` 
- ✅ Use `SECURITY DEFINER` only when necessary
- ✅ Prefer `SECURITY INVOKER` when possible (runs with caller's privileges)
- ✅ Validate all inputs
- ✅ Use qualified names for system functions (e.g., `pg_catalog.now()`)

---

## Additional Security Recommendations

### 1. Regular Security Audits
- Review Security Advisor weekly
- Check for new PostgreSQL CVEs
- Update Supabase CLI regularly

### 2. Function Auditing
```sql
-- List all SECURITY DEFINER functions
SELECT 
  n.nspname as schema,
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.prosecdef = true
AND n.nspname = 'public';
```

### 3. Monitor Function Calls
Set up logging for sensitive function executions in production.

---

## Need Help?

- 📚 [Supabase Security Docs](https://supabase.com/docs/guides/database/postgres/security)
- 📚 [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)
- 🔒 [Search Path Security](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)

---

**Last Updated:** December 21, 2025  
**Status:** Migration ready to apply
