# 02 - BACKEND API (SUPABASE EDGE FUNCTIONS)

## Table of Contents
1. [Overview](#overview)
2. [Edge Functions Architecture](#edge-functions-architecture)
3. [Existing Edge Functions](#existing-edge-functions)
4. [New Edge Functions to Implement](#new-edge-functions-to-implement)
5. [API Specification](#api-specification)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Related Documents](#related-documents)

---

## Overview

This document defines all Supabase Edge Functions (Deno runtime) for the V-Vortex Platform. Edge Functions handle business logic, validation, and enforcement that cannot be done through RLS policies alone.

### Architecture Principles

1. **Validation First**: All inputs validated at Edge Function boundary
2. **Authorization**: Check user roles and event access before business logic
3. **Atomic Operations**: Use database transactions for multi-step operations
4. **Audit Logging**: All significant actions logged to `audit_logs`
5. **Error Handling**: Consistent error responses with proper HTTP status codes

### Function Naming Convention

`{action}-{entity}` or `{entity}-{action}`
- Examples: `register-team`, `select-ps`, `submit-ideathon`

---

## Edge Functions Architecture

### Request Flow

```
Client Request
    │
    ▼
┌─────────────────────────┐
│  Supabase Client        │
│  (supabase-js)          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Edge Function Entry    │
│  - Verify JWT           │
│  - Extract User ID      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Authorization Check    │
│  - Get user roles       │
│  - Verify event access  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Input Validation       │
│  - Schema validation    │
│  - Business rules       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Business Logic         │
│  - Database operations  │
│  - External calls       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Audit Logging          │
│  - Log action           │
│  - Track changes        │
└──────────┬──────────────┘
           │
           ▼
    Response
```

---

## Existing Edge Functions

### `register-team` - Team Leader Registration

**Endpoint**: `POST /functions/v1/register-team`

**Request**:
```typescript
{
  event_id: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone?: string;
  leader_reg_no?: string;
  institution: string;
  is_vit_chennai: boolean;
  payment_reference: string;
  payment_receipt_url: string;
}
```

**Response**:
```typescript
{
  success: true;
  team_id: string;
  team_code: string;
  user_id: string;
}
```

**Validation**:
- Event exists and is in registration phase
- Team name is unique within event
- Leader email is not already registered
- If VIT Chennai: `leader_reg_no` is required
- Payment receipt URL is valid

**Business Logic**:
1. Generate unique team code (for member joins)
2. Create auth user with temp password
3. Create team record
4. Log to audit

---

### `build-team` - Add Team Members

**Endpoint**: `POST /functions/v1/build-team`

**Request**:
```typescript
{
  team_code: string;
  members: Array<{
    member_name: string;
    member_email: string;
    member_reg_no?: string;
    institution: string;
  }>;
}
```

**Response**:
```typescript
{
  success: true;
  team_id: string;
  members_added: number;
  qr_codes: Array<{
    email: string;
    qr_code: string;
  }>;
}
```

**Validation**:
- Team exists and is not locked
- Team size (including leader) ≤ 4
- Member emails are unique across system
- Team leader cannot be added as member

**Business Logic**:
1. Verify team exists
2. Check team size constraint
3. Create member records
4. Generate QR codes
5. Send invitation emails

---

## New Edge Functions to Implement

### 1. `select-ps` - Problem Statement Selection (FCFS)

**Endpoint**: `POST /functions/v1/select-ps`

**Auth Required**: Team Leader

**Request**:
```typescript
{
  problem_statement_id: string;
}
```

**Response**:
```typescript
{
  success: true;
  ps_allocated: boolean;
  slots_remaining: number;
}
```

**Validation**:
- Event is in Ideathon phase
- Team has not already selected a PS (or admin override)
- Problem statement is active and has available slots
- Team is eligible (payment verified, registration approved)

**Business Logic**:
```typescript
// Atomic FCFS allocation
const { data, error } = await supabase.rpc('allocate_ps', {
  p_team_id: team_id,
  p_ps_id: problem_statement_id,
  p_user_id: user_id
});
```

**RPC Function** (`allocate_ps`):
```sql
CREATE OR REPLACE FUNCTION allocate_ps(
  p_team_id UUID,
  p_ps_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_current_teams INTEGER;
  v_max_teams INTEGER;
  v_is_allocated BOOLEAN;
BEGIN
  -- Lock PS row
  SELECT current_teams, max_teams
  INTO v_current_teams, v_max_teams
  FROM problem_statements
  WHERE id = p_ps_id
  FOR UPDATE;

  -- Check availability
  IF v_current_teams >= v_max_teams THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No slots available'
    );
  END IF;

  -- Allocate to team
  UPDATE teams
  SET problem_statement_id = p_ps_id,
      ps_selected_at = NOW(),
      ps_locked = TRUE,
      updated_at = NOW()
  WHERE id = p_team_id
  AND problem_statement_id IS NULL;

  -- Audit log
  INSERT INTO audit_logs (
    event_id, action, entity_type, entity_id, user_id, new_values
  )
  SELECT event_id, 'SELECT_PS', 'team', p_team_id, p_user_id,
    jsonb_build_object('problem_statement_id', p_ps_id)
  FROM teams WHERE id = p_team_id;

  -- Get updated count
  v_current_teams := v_current_teams + 1;

  RETURN jsonb_build_object(
    'success', true,
    'ps_allocated', true,
    'slots_remaining', v_max_teams - v_current_teams
  );
END;
$$ LANGUAGE plpgsql;
```

---

### 2. `submit-ideathon` - Ideathon Submission

**Endpoint**: `POST /functions/v1/submit-ideathon`

**Auth Required**: Team Leader

**Request**:
```typescript
{
  submission_url: string; // PPT/PDF upload URL or Drive link
  submission_type: 'upload' | 'drive_link';
}
```

**Response**:
```typescript
{
  success: true;
  submitted_at: string;
}
```

**Validation**:
- Event is in Ideathon phase
- Current time ≤ ideathon deadline
- Team has selected PS
- Submission URL is valid
- If Drive link: validate Google Drive URL format

**Business Logic**:
1. Store submission URL
2. Timestamp submission
3. Send confirmation email
4. Log to audit

---

### 3. `submit-review` - Hackathon Review Submission

**Endpoint**: `POST /functions/v1/submit-review`

**Auth Required**: Team Leader

**Request**:
```typescript
{
  round: 'review1' | 'review2' | 'review3';
  github_url: string;
  deploy_url?: string;
  ppt_url?: string;
  zip_url?: string;
}
```

**Response**:
```typescript
{
  success: true;
  submitted_at: string;
  code_frozen: boolean; // For review3
}
```

**Validation**:
- Event is in Hackathon phase
- Current time ≤ review deadline
- Required fields per round:
  - Review 1: github_url
  - Review 2: github_url, deploy_url
  - Review 3: github_url, deploy_url, ppt_url, zip_url (code freeze)

**Business Logic**:
```typescript
// Validate and store
const submission = {
  round,
  github_url,
  deploy_url,
  ppt_url,
  zip_url,
  submitted_at: new Date().toISOString()
};

// Code freeze for review3
if (round === 'review3') {
  submission.code_frozen_at = new Date().toISOString();
}

await supabase.from('submissions').insert(submission);
await supabase.from('teams').update({
  [`review${round.slice(-1)}_submitted_at`]: new Date().toISOString(),
  code_frozen_at: round === 'review3' ? new Date().toISOString() : null
}).eq('id', team_id);
```

---

### 4. `submit-score` - Judge Score Submission

**Endpoint**: `POST /functions/v1/submit-score`

**Auth Required**: Judge

**Request**:
```typescript
{
  team_id: string;
  round: string;
  scores: {
    innovation_score?: number;
    implementation_score?: number;
    presentation_score?: number;
    impact_score?: number;
    technical_score?: number;
    design_score?: number;
    business_score?: number;
    demo_score?: number;
  };
  comments?: string;
  is_final_submit: boolean; // true = lock score, false = save draft
}
```

**Response**:
```typescript
{
  success: true;
  scorecard_id: string;
  total_score: number;
  is_locked: boolean;
}
```

**Validation**:
- Judge is authenticated
- Judge is assigned to this team for this round
- Score is not already locked
- Scores are within rubric bounds
- All required categories have scores

**Business Logic**:
```typescript
if (is_final_submit) {
  // Lock the score
  const { data } = await supabase.from('scorecards')
    .update({
      ...scores,
      judge_comments: comments,
      submitted_at: new Date().toISOString(),
      locked_at: new Date().toISOString(),
      is_draft: false
    })
    .eq('judge_id', judge_id)
    .eq('team_id', team_id)
    .eq('round', round);
} else {
  // Save as draft
  await supabase.from('scorecards')
    .upsert({
      judge_id,
      team_id,
      round,
      ...scores,
      judge_comments: comments,
      is_draft: true,
      updated_at: new Date().toISOString()
    });
}
```

---

### 5. `allocate-shark-tank-investments` - Shark Tank

**Endpoint**: `POST /functions/v1/allocate-shark-tank-investments`

**Auth Required**: Judge

**Request**:
```typescript
{
  investments: Array<{
    team_id: string;
    amount: number;
    notes?: string;
  }>;
}
```

**Response**:
```typescript
{
  success: true;
  total_invested: number;
  remaining_credits: number;
}
```

**Validation**:
- Event is in Finals phase
- Total investment ≤ judge's available credits
- All teams are finalists

**Business Logic**:
```typescript
// Validate total investment
const total = investments.reduce((sum, inv) => sum + inv.amount, 0);

const { data: judge } = await supabase.from('judges')
  .select('shark_tank_credits')
  .eq('user_id', user_id)
  .single();

if (total > judge.shark_tank_credits) {
  throw new Error('Insufficient credits');
}

// Atomic investment
await supabase.from('shark_tank_investments').insert(
  investments.map(inv => ({
    judge_id: judge_id,
    team_id: inv.team_id,
    amount: inv.amount,
    investment_notes: inv.notes
  }))
);

// Deduct credits
await supabase.from('judges')
  .update({ shark_tank_credits: judge.shark_tank_credits - total })
  .eq('id', judge_id);
```

---

### 6. `submit-bug-report` - Bug Bounty

**Endpoint**: `POST /functions/v1/submit-bug-report`

**Auth Required**: Team Leader

**Request**:
```typescript
{
  target_team_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps_to_reproduce: string;
  poc_url?: string;
  screenshot_urls?: string[];
}
```

**Response**:
```typescript
{
  success: true;
  bug_report_id: string;
}
```

**Validation**:
- Event is in Finals phase
- Bug Bounty feature is enabled
- Target team is different from submitting team
- Target team is a finalist

**Business Logic**:
```typescript
// Create bug report
const { data } = await supabase.from('bug_reports').insert({
  team_id,
  target_team_id,
  title,
  description,
  severity,
  steps_to_reproduce,
  poc_url,
  screenshot_urls
});

// Notify target team
await supabase.from('notifications').insert({
  user_id: target_team_leader_id,
  title: 'Bug Report Submitted',
  message: `Your project has received a bug report: ${title}`,
  type: 'info',
  action_url: `/bug-reports/${bug_report_id}`
});
```

---

### 7. `admin-verify-payment` - Payment Verification

**Endpoint**: `POST /functions/v1/admin-verify-payment`

**Auth Required**: Admin

**Request**:
```typescript
{
  team_id: string;
  status: 'verified' | 'rejected';
  notes?: string;
}
```

**Response**:
```typescript
{
  success: true;
  team_id: string;
}
```

**Validation**:
- User has admin role for this event
- Team exists

**Business Logic**:
```typescript
await supabase.from('teams').update({
  payment_status: status,
  updated_at: new Date().toISOString()
}).eq('id', team_id);

// Send email notification
await sendEmail(team_leader_email, 'Payment Status Update', {
  status,
  notes
});
```

---

### 8. `admin-approve-team` - Team Registration Approval

**Endpoint**: `POST /functions/v1/admin-approve-team`

**Auth Required**: Admin

**Request**:
```typescript
{
  team_id: string;
  status: 'approved' | 'rejected';
  reason?: string;
}
```

**Response**:
```typescript
{
  success: true;
  team_id: string;
}
```

**Validation**:
- User has admin role
- Team is in 'submitted' status

---

### 9. `admin-assign-judge` - Judge Assignment

**Endpoint**: `POST /functions/v1/admin-assign-judge`

**Auth Required**: Admin

**Request**:
```typescript
{
  judge_id: string;
  team_ids: string[];
  round: string;
}
```

**Response**:
```typescript
{
  success: true;
  assignments_created: number;
}
```

**Business Logic**:
```typescript
const assignments = team_ids.map(team_id => ({
  judge_id,
  team_id,
  round
}));

await supabase.from('judge_assignments').insert(assignments);
```

---

### 10. `admin-change-phase` - Phase Transition

**Endpoint**: `POST /functions/v1/admin-change-phase`

**Auth Required**: Admin

**Request**:
```typescript
{
  new_phase: 'ideathon' | 'hackathon' | 'finals' | 'archive';
  reason?: string;
}
```

**Response**:
```typescript
{
  success: true;
  previous_phase: string;
  new_phase: string;
}
```

**Validation**:
- User has admin role
- Phase transition is valid (no skipping phases)
- All deadlines for current phase have passed (or emergency override)

**Business Logic**:
```typescript
const { data: event } = await supabase.from('events')
  .select('current_phase')
  .eq('id', event_id)
  .single();

// Validate transition
const validTransitions = {
  'registration': ['ideathon'],
  'ideathon': ['hackathon'],
  'hackathon': ['finals'],
  'finals': ['archive'],
  'archive': []
};

if (!validTransitions[event.current_phase].includes(new_phase)) {
  throw new Error(`Cannot transition from ${event.current_phase} to ${new_phase}`);
}

// Update phase
await supabase.from('events').update({
  current_phase: new_phase,
  updated_at: new Date().toISOString()
}).eq('id', event_id);

// Audit log
await supabase.from('audit_logs').insert({
  event_id,
  action: 'PHASE_CHANGE',
  entity_type: 'event',
  entity_id: event_id,
  user_id,
  old_values: { phase: event.current_phase },
  new_values: { phase: new_phase }
});

// Notify all participants
await sendPhaseChangeNotifications(event_id, new_phase);
```

---

### 11. `admin-send-announcement` - Broadcast Announcement

**Endpoint**: `POST /functions/v1/admin-send-announcement`

**Auth Required**: Admin

**Request**:
```typescript
{
  title: string;
  content: string;
  priority: 'info' | 'warning' | 'urgent';
  target_role?: 'team_leader' | 'judge' | 'admin' | null;
  send_email: boolean;
}
```

**Response**:
```typescript
{
  success: true;
  announcement_id: string;
  recipients_count: number;
}
```

---

### 12. `admin-export-data` - Data Export

**Endpoint**: `POST /functions/v1/admin-export-data`

**Auth Required**: Admin

**Request**:
```typescript
{
  export_type: 'teams' | 'submissions' | 'scores' | 'all';
  format: 'csv' | 'json' | 'xlsx';
}
```

**Response**:
```typescript
{
  success: true;
  download_url: string;
  expires_at: string;
}
```

**Business Logic**:
```typescript
// Query data based on export_type
const data = await exportData(event_id, export_type);

// Convert to requested format
let file;
if (format === 'csv') {
  file = convertToCSV(data);
} else if (format === 'json') {
  file = JSON.stringify(data);
} else if (format === 'xlsx') {
  file = await convertToExcel(data);
}

// Upload to storage
const filename = `${event_id}_${export_type}_${Date.now()}.${format}`;
const { data: uploadData } = await supabase.storage
  .from('exports')
  .upload(filename, file);

// Generate signed URL (valid for 1 hour)
const { data: urlData } = await supabase.storage
  .from('exports')
  .createSignedUrl(filename, 3600);

return {
  download_url: urlData.signedUrl,
  expires_at: new Date(Date.now() + 3600000).toISOString()
};
```

---

### 13. `get-leaderboard` - Public Leaderboard

**Endpoint**: `POST /functions/v1/get-leaderboard`

**Auth Required**: None (Public)

**Request**:
```typescript
{
  event_id: string;
  round?: string;
}
```

**Response**:
```typescript
{
  success: true;
  leaderboard: Array<{
    rank: number;
    team_id: string;
    team_name: string;
    total_score: number;
    score_delta?: number;
  }>;
}
```

---

### 14. `get-availability` - PS Availability Check

**Endpoint**: `POST /functions/v1/get-ps-availability`

**Auth Required**: Team Leader

**Request**:
```typescript
{
  domain_id?: string;
}
```

**Response**:
```typescript
{
  success: true;
  problem_statements: Array<{
    id: string;
    title: string;
    domain_id: string;
    domain_name: string;
    max_teams: number;
    current_teams: number;
    slots_remaining: number;
    availability_status: 'available' | 'limited' | 'full';
  }>;
}
```

---

## API Specification

### Standard Response Format

**Success**:
```typescript
{
  success: true;
  data?: any;
  message?: string;
}
```

**Error**:
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., PS allocation race condition) |
| 422 | Unprocessable Entity (business logic error) |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Error Handling

### Error Types

```typescript
enum ErrorCode {
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Business logic errors
  EVENT_NOT_FOUND = 'EVENT_NOT_FOUND',
  EVENT_PHASE_INVALID = 'EVENT_PHASE_INVALID',
  DEADLINE_PASSED = 'DEADLINE_PASSED',
  TEAM_NOT_FOUND = 'TEAM_NOT_FOUND',
  TEAM_SIZE_EXCEEDED = 'TEAM_SIZE_EXCEEDED',
  PS_FULL = 'PS_FULL',
  PS_ALREADY_SELECTED = 'PS_ALREADY_SELECTED',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  REGISTRATION_NOT_APPROVED = 'REGISTRATION_NOT_APPROVED',
  SCORE_LOCKED = 'SCORE_LOCKED',

  // System errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Error Response Example

```typescript
{
  success: false,
  error: {
    code: 'PS_FULL',
    message: 'This problem statement is no longer available',
    details: {
      ps_id: 'uuid-here',
      title: 'AI-Powered Healthcare',
      current_teams: 10,
      max_teams: 10
    }
  }
}
```

---

## Rate Limiting

### Implementation

```typescript
// Supabase Edge Function with rate limiting
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const rateLimits = {
  'register-team': { requests: 3, window: 3600 }, // 3/hour
  'select-ps': { requests: 10, window: 3600 },
  'submit-score': { requests: 100, window: 3600 },
  'default': { requests: 60, window: 60 }
};

serve(async (req) => {
  // Check rate limit
  const limit = rateLimits[functionName] || rateLimits.default;
  const key = `${functionName}:${userId}`;

  const { error } = await checkRateLimit(key, limit);
  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: error.message }
      }),
      { status: 429 }
    );
  }

  // Proceed with function logic
});
```

### Rate Limiting by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `register-team` | 3/hour | 3600s |
| `build-team` | 10/hour | 3600s |
| `select-ps` | 10/hour | 3600s |
| `submit-*` | 30/hour | 3600s |
| `submit-score` | 100/hour | 3600s |
| `admin-*` | 1000/hour | 3600s |
| `get-*` | 60/minute | 60s |

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`01-database-schema.md`](./01-database-schema.md) | Database schema for tables referenced |
| [`04-auth-rbac.md`](./04-auth-rbac.md) | Authentication and authorization |
| [`05-feature-breakdown.md`](./05-feature-breakdown.md) | Feature implementation details |
| [`06-security-audit.md`](./06-security-audit.md) | Security considerations |

---

**Next**: Read [`03-frontend-architecture.md`](./03-frontend-architecture.md) for frontend structure.
