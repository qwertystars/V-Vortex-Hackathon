# 06 - SECURITY & AUDIT

## Table of Contents
1. [Overview](#overview)
2. [Security Principles](#security-principles)
3. [Authentication Security](#authentication-security)
4. [Authorization & RBAC](#authorization--rbac)
5. [Data Security](#data-security)
6. [API Security](#api-security)
7. [Audit Logging](#audit-logging)
8. [Rate Limiting](#rate-limiting)
9. [Input Validation](#input-validation)
10. [Common Vulnerabilities](#common-vulnerabilities)
11. [Security Checklist](#security-checklist)
12. [Related Documents](#related-documents)

---

## Overview

This document defines security measures and audit logging for the V-Vortex Platform.

### Threat Model

| Threat Type | Description | Mitigation |
|-------------|-------------|------------|
| **Unauthorized Access** | Accessing data without proper authentication | JWT validation, RLS policies |
| **Privilege Escalation** | Performing actions beyond user's role | RBAC, role checks in Edge Functions |
| **Data Leakage** | Exposing sensitive information | Event isolation, field-level RLS |
| **Injection Attacks** | SQL injection, XSS | Parameterized queries, input validation |
| **DoS Attacks** | Overwhelming the system with requests | Rate limiting, request throttling |
| **Session Hijacking** | Stealing user sessions | Secure token storage, short expiry |
| **Data Tampering** | Modifying data in transit | HTTPS, payload signing |

---

## Security Principles

### 1. Defense in Depth

Multiple layers of security:
- **Layer 1**: Authentication (Supabase Auth)
- **Layer 2**: Authorization (RBAC, JWT claims)
- **Layer 3**: RLS Policies (Database-level access control)
- **Layer 4**: Edge Function Validation (Business logic enforcement)
- **Layer 5**: Audit Logging (Detect and investigate)

### 2. Principle of Least Privilege

Users and services have only the minimum access required:
- Team members: Read-only access
- Team leaders: Full access to own team only
- Judges: Access to assigned teams only
- Admins: Full access to their event only

### 3. Fail Securely

All errors default to denying access:
- RLS policies use `USING (false)` by default
- Edge Functions return 403 on authorization failure
- Frontend redirects to login on auth errors

### 4. Audit Everything

Significant actions logged with full context:
- Who (user_id, role)
- What (action, entity_type, entity_id)
- When (timestamp)
- From where (ip_address, user_agent)
- Result (success/failure, error_message)

---

## Authentication Security

### Passwordless Authentication

Using email OTP provides security benefits:
- ✅ No passwords to steal or hash
- ✅ No password reset flows
- ✅ Email verification inherent to auth flow
- ✅ Time-limited tokens (expires quickly)

### Session Security

```javascript
// Supabase Auth configuration
[auth]
session_refresh_token_validity = 604800  // 7 days
session_access_token_validity = 3600     // 1 hour
enable_refresh_token_rotation = true
security_update_password_required = false // N/A for passwordless
```

### Secure Token Storage (Frontend)

```javascript
// Store tokens securely (Supabase handles this automatically)
// Tokens are stored in:
// - Development: localStorage
// - Production: HttpOnly cookies (if configured)

// Additional security measures:
// 1. Use HTTPS in production
// 2. Clear tokens on logout
const handleLogout = async () => {
  await supabase.auth.signOut();
  // Tokens are cleared automatically
};

// 3. Detect token expiry and redirect
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    // Token refreshed successfully
  } else if (event === 'SIGNED_OUT') {
    // Session expired or user logged out
    window.location.href = '/login';
  }
});
```

### Multi-Factor Authentication (Future)

Consider adding:
- TOTP (Time-based One-Time Password)
- SMS verification as backup
- Hardware security keys (WebAuthn)

---

## Authorization & RBAC

### Role Enforcement

```typescript
// Edge Function: Check user role
const { data: { user } } = await supabase.auth.getUser(token);
const userRole = user.user_metadata.role;

const allowedRoles = ['admin', 'team_leader'];
if (!allowedRoles.includes(userRole)) {
  return new Response(
    JSON.stringify({ error: 'Insufficient permissions' }),
    { status: 403 }
  );
}
```

### Event Isolation

```sql
-- RLS Policy: Users can only access data from their event
CREATE POLICY "Event isolation"
ON teams FOR ALL
USING (
  event_id IN (
    SELECT event_id FROM user_profiles
    WHERE user_id = auth.uid()
  )
);
```

### Team-Level Isolation

```sql
-- Team leaders can only access their own team
CREATE POLICY "Team leaders: own team only"
ON teams FOR ALL
USING (
  id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
    AND is_team_leader = TRUE
  )
);
```

### Judge Assignment Isolation

```sql
-- Judges can only score assigned teams
CREATE POLICY "Judges: assigned teams only"
ON scorecards FOR SELECT
USING (
  judge_id IN (
    SELECT id FROM judges WHERE user_id = auth.uid()
  )
);
```

---

## Data Security

### Role-Based Access Control

```sql
-- RLS enforces role-based access
CREATE POLICY "Role-based access control"
ON teams FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
  )
);
```

### Sensitive Data Handling

```sql
-- PII: Personal Identifiable Information
-- Encrypt sensitive fields if needed
CREATE TABLE teams (
  leader_email TEXT, -- PII
  leader_phone TEXT, -- PII
  -- Consider encrypting phone numbers
);

-- Never expose passwords (not applicable for passwordless auth)
-- Never expose internal IDs in public APIs
```

### File Upload Security

```javascript
// Validate file types
const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Validate file size (max 10MB)
const MAX_SIZE = 10 * 1024 * 1024;
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}

// Sanitize filename
const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
```

---

## API Security

### Input Validation

```typescript
// Edge Function: Validate all inputs
const schema = {
  team_name: { type: 'string', minLength: 3, maxLength: 50 },
  leader_email: { type: 'string', format: 'email' },
  payment_reference: { type: 'string', minLength: 5 },
};

function validateInput(data, schema) {
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    if (rules.type && typeof value !== rules.type) {
      throw new Error(`${key} must be ${rules.type}`);
    }

    if (rules.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error(`${key} must be a valid email`);
    }

    if (rules.minLength && value.length < rules.minLength) {
      throw new Error(`${key} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      throw new Error(`${key} must be at most ${rules.maxLength} characters`);
    }
  }
}

validateInput(reqBody, schema);
```

### SQL Injection Prevention

```typescript
// ❌ BAD: String concatenation (vulnerable to SQL injection)
const query = `SELECT * FROM teams WHERE leader_email = '${email}'`;

// ✅ GOOD: Parameterized queries
const { data, error } = await supabase
  .from('teams')
  .select('*')
  .eq('leader_email', email); // Supabase handles parameterization
```

### XSS Prevention

```javascript
// React automatically escapes JSX content
// However, be careful with dangerouslySetInnerHTML

// ❌ BAD: Unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD: Sanitize first (using DOMPurify)
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### CORS Configuration

```javascript
// Supabase Dashboard: Project Settings > API
// Configure allowed origins:

// Development:
http://localhost:5173

// Production:
https://v-vortex.example.com

// Restrict to specific origins only
```

---

## Audit Logging

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  

  -- Action Details
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entity_type TEXT NOT NULL,
  entity_id UUID,

  -- Actor
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT,

  -- Data Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Result
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Logging Significant Actions

```typescript
// Edge Function helper
async function logAuditEntry(supabase, context) {
  const {
    action,
    entity_type,
    entity_id,
    user_id,
    user_role,
    old_values,
    new_values,
    status,
    error_message,
    req
  } = context;

  await supabase.from('audit_logs').insert({
    action,
    entity_type,
    entity_id,
    user_id,
    user_role,
    old_values,
    new_values,
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown',
    status,
    error_message
  });
}

// Usage
await logAuditEntry(supabase, {
  action: 'SELECT_PS',
  entity_type: 'team',
  entity_id: team_id,
  user_id,
  user_role,
  old_values: { problem_statement_id: null },
  new_values: { problem_statement_id: ps_id },
  status: 'success',
  req
});
```

### Actions to Audit

| Action | Entity Type | Description |
|--------|-------------|-------------|
| REGISTER | team | Team registration |
| BUILD_TEAM | team | Team member added |
| SELECT_PS | team | Problem statement selected |
| SUBMIT_IDEATHON | submission | Ideathon submitted |
| SUBMIT_REVIEW | submission | Review submitted |
| SUBMIT_SCORE | scorecard | Judge score submitted |
| VERIFY_PAYMENT | team | Payment verified by admin |
| APPROVE_TEAM | team | Team approved by admin |
| ASSIGN_JUDGE | judge_assignment | Judge assigned to teams |
| CHANGE_PHASE | event | Event phase changed |
| SEND_ANNOUNCEMENT | announcement | Announcement broadcasted |
| LOGIN | user | User logged in |
| LOGOUT | user | User logged out |
| OVERRIDE_* | * | Admin override action |
| EXPORT_DATA | event | Data export |

---

## Rate Limiting

### Edge Function Rate Limiting

```typescript
// Using Supabase's built-in rate limiting or custom implementation
const rateLimits = {
  'register-team': { requests: 3, window: 3600 }, // 3 per hour
  'build-team': { requests: 10, window: 3600 },
  'select-ps': { requests: 10, window: 3600 },
  'submit-*': { requests: 30, window: 3600 },
  'submit-score': { requests: 100, window: 3600 },
  'admin-*': { requests: 1000, window: 3600 },
};

async function checkRateLimit(userId, endpoint) {
  const limit = rateLimits[endpoint] || { requests: 60, window: 60 };

  // Check Redis or Supabase for request count
  const { data } = await supabase
    .from('rate_limit_counters')
    .select('count, window_start')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .single();

  if (!data) {
    // First request
    await supabase.from('rate_limit_counters').insert({
      user_id: userId,
      endpoint,
      count: 1,
      window_start: Date.now()
    });
    return { allowed: true };
  }

  const windowExpiry = data.window_start + (limit.window * 1000);

  if (Date.now() > windowExpiry) {
    // Reset window
    await supabase.from('rate_limit_counters')
      .update({ count: 1, window_start: Date.now() })
      .eq('user_id', userId)
      .eq('endpoint', endpoint);
    return { allowed: true };
  }

  if (data.count >= limit.requests) {
    return {
      allowed: false,
      error: `Rate limit exceeded: ${limit.requests} requests per ${limit.window} seconds`
    };
  }

  // Increment counter
  await supabase.from('rate_limit_counters')
    .update({ count: data.count + 1 })
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  return { allowed: true };
}
```

### Supabase Auth Rate Limits

```javascript
// Built-in rate limits in Supabase Auth
[auth]
rate_limit_email = "2/hour"           // OTP sending
rate_limit_sms = "30/5 minutes"
rate_limit_token_verify = "30/5 minutes"
rate_limit_signin = "30/5 minutes"
```

---

## Input Validation

### Email Validation

```javascript
function validateEmail(email) {
  // RFC 5322 compliant regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Check for common typos
const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
const [local, domain] = email.split('@');

if (!commonDomains.includes(domain)) {
  // Warn user about uncommon domain
}
```

### URL Validation

```javascript
function validateURL(url, allowedProtocols = ['http', 'https']) {
  try {
    const parsed = new URL(url);
    return allowedProtocols.includes(parsed.protocol.replace(':', ''));
  } catch {
    return false;
  }
}

// Google Drive link validation
function validateGoogleDriveLink(url) {
  return url.includes('drive.google.com') && url.includes('/file/d/');
}
```

### File Upload Validation

```javascript
function validateFileUpload(file, allowedTypes, maxSizeMB) {
  // Check type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  // Check size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large. Max size: ${maxSizeMB}MB`);
  }

  // Check extension matches type
  const typeToExtension = {
    'application/pdf': '.pdf',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx'
  };

  const expectedExtension = typeToExtension[file.type];
  if (!file.name.endsWith(expectedExtension)) {
    throw new Error('File extension does not match file type');
  }
}
```

---

## Common Vulnerabilities

### OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| **A01: Broken Access Control** | RLS policies, role checks in Edge Functions |
| **A02: Cryptographic Failures** | HTTPS only, sensitive data encryption |
| **A03: Injection** | Parameterized queries (Supabase handles this) |
| **A04: Insecure Design** | Phase state machine, deadline enforcement |
| **A05: Security Misconfiguration** | Proper CORS, security headers |
| **A06: Vulnerable Components** | Keep dependencies updated |
| **A07: Authentication Failures** | Email OTP, secure session management |
| **A08: Data Integrity Failures** | Audit logging, digital signatures |
| **A09: Security Logging** | Comprehensive audit logs |
| **A10: SSRF** | Validate and sanitize URLs |

### Security Headers

```javascript
// In Supabase Edge Functions
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
});
```

---

## Security Checklist

### Development Phase

- [ ] All environment variables are set
- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] All inputs are validated
- [ ] All queries use parameterized inputs
- [ ] RLS policies enabled on all tables
- [ ] Audit logging implemented
- [ ] Rate limiting configured

### Production Deployment

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS restricted to allowed origins
- [ ] Database backups enabled
- [ ] Monitoring and alerts configured
- [ ] Log retention policy set
- [ ] Dependencies updated
- [ ] Security audit completed

### Ongoing

- [ ] Regular dependency updates
- [ ] Quarterly security audits
- [ ] Review audit logs regularly
- [ ] Monitor for suspicious activity
- [ ] Test disaster recovery procedures
- [ ] Keep Supabase plan updated

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`01-database-schema.md`](./01-database-schema.md) | `audit_logs` table schema |
| [`02-backend-api.md`](./02-backend-api.md) | Edge Function security |
| [`04-auth-rbac.md`](./04-auth-rbac.md) | Authentication and authorization |

---

**Next**: Read [`09-phased-roadmap.md`](./09-phased-roadmap.md) for implementation phases.
