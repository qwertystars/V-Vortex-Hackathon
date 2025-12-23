# 04 - AUTHENTICATION & RBAC

## Table of Contents
1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Roles & Permissions](#roles--permissions)
4. [User Profile Schema](#user-profile-schema)
5. [JWT Claims & Metadata](#jwt-claims--metadata)
6. [Session Management](#session-management)
7. [Protected Routes](#protected-routes)
8. [Authorization Middleware](#authorization-middleware)
9. [Related Documents](#related-documents)

---

## Overview

This document defines the authentication and role-based access control (RBAC) system for the V-Vortex Platform.

### Authentication Method

- **Type**: Email OTP (One-Time Password)
- **Provider**: Supabase Auth
- **Passwordless**: No user-set passwords

### Key Features

1. **Passwordless Authentication**: Email OTP only
2. **Multi-Role System**: Team Leader, Team Member, Judge, Admin
3. **Event Isolation**: Users belong to specific events
4. **JWT-Based**: Claims stored in JWT for role-based access
5. **Session Management**: Configurable expiry with refresh tokens

---

## Authentication Flow

### Registration Flow (Team Leader)

```
┌────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. User fills registration form:                              │
│     - Team name                                                │
│     - Leader name, email, phone                                │
│     - Institution (VIT Chennai check)                          │
│     - Payment reference + receipt upload                       │
│                                                                │
│  2. Frontend calls register-team Edge Function                 │
│                                                                │
│  3. Backend validates:                                         │
│     - Event is in registration phase                           │
│     - Team name is unique                                      │
│     - Email is not already registered                          │
│     - Payment receipt URL is valid                             │
│                                                                │
│  4. Backend creates:                                           │
│     - auth.users entry (with temp password)                    │
│     - teams entry                                              │
│     - user_profiles entry (role: team_leader)                  │
│                                                                │
│  5. Backend sends OTP via Supabase Auth                        │
│                                                                │
│  6. User receives email with OTP                               │
│                                                                │
│  7. User enters OTP on verification page                       │
│                                                                │
│  8. Supabase Auth verifies OTP                                 │
│                                                                │
│  9. User is logged in and redirected to dashboard              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Login Flow

```
┌────────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. User enters email on login page                            │
│                                                                │
│  2. Frontend calls Supabase Auth:                              │
│     supabase.auth.signInWithOtp({ email })                     │
│                                                                │
│  3. Backend checks:                                            │
│     - User exists in system                                    │
│     - Determine user role from user_profiles                   │
│                                                                │
│  4. Supabase sends OTP email                                   │
│                                                                │
│  5. User enters OTP                                            │
│                                                                │
│  6. Supabase verifies OTP and creates session                  │
│                                                                │
│  7. Frontend redirects based on role:                          │
│     - team_leader → /dashboard                                 │
│     - team_member → /member                                    │
│     - judge → /judge                                           │
│     - admin → /admin                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Team Member Join Flow

```
┌────────────────────────────────────────────────────────────────┐
│                  TEAM MEMBER JOIN FLOW                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Team Leader shares team code with members                  │
│                                                                │
│  2. Member goes to /join/{teamCode}                            │
│                                                                │
│  3. Member enters:                                             │
│     - Name, email, phone                                       │
│     - Registration number (if applicable)                      │
│     - Institution                                              │
│                                                                │
│  4. Frontend calls build-team Edge Function                    │
│                                                                │
│  5. Backend validates:                                         │
│     - Team exists and is not locked                            │
│     - Team size < 4                                            │
│     - Email not already in system                              │
│                                                                │
│  6. Backend creates:                                           │
│     - team_members entry                                       │
│     - QR code for member                                       │
│     - auth.users entry (if not exists)                         │
│     - user_profiles entry (role: team_member)                  │
│                                                                │
│  7. Backend sends invitation email with OTP                    │
│                                                                │
│  8. Member verifies OTP and gains access                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

### Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Team Leader** | Primary team contact | Full team control: register, build team, select PS, submit, view scores |
| **Team Member** | Team participant | Read-only access to team dashboard |
| **Judge** | Evaluator | View assigned teams, submit scores, view assigned only |
| **Admin** | Event organizer | Full system access, overrides, reports, phase controls |

### Permission Matrix

| Action | Team Leader | Team Member | Judge | Admin |
|--------|-------------|-------------|-------|-------|
| **Team Management** |
| View team dashboard | ✅ | ✅ | ❌ | ✅ |
| Edit team details | ✅ | ❌ | ❌ | ✅ |
| Add team members | ✅ | ❌ | ❌ | ✅ |
| Remove team members | ✅ | ❌ | ❌ | ✅ |
| **Problem Statements** |
| View PS catalog | ✅ | ✅ | ✅ | ✅ |
| Select PS | ✅ | ❌ | ❌ | ✅ |
| Change PS (admin override) | ❌ | ❌ | ❌ | ✅ |
| **Submissions** |
| Submit Ideathon | ✅ | ❌ | ❌ | ❌ |
| Submit Review | ✅ | ❌ | ❌ | ❌ |
| View own submissions | ✅ | ✅ | ❌ | ✅ |
| View all submissions | ❌ | ❌ | ❌ | ✅ |
| **Scoring** |
| Submit scores | ❌ | ❌ | ✅ | ❌ |
| View own scores | ✅ | ✅ | ❌ | ✅ |
| View all scores (after publish) | ✅ | ✅ | ✅ | ✅ |
| Lock scores | ❌ | ❌ | ✅ | ✅ |
| **Admin Functions** |
| Verify payments | ❌ | ❌ | ❌ | ✅ |
| Approve registrations | ❌ | ❌ | ❌ | ✅ |
| Assign judges | ❌ | ❌ | ❌ | ✅ |
| Change phase | ❌ | ❌ | ❌ | ✅ |
| Send announcements | ❌ | ❌ | ❌ | ✅ |
| Export data | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |
| Emergency overrides | ❌ | ❌ | ❌ | ✅ |

---

## User Profile Schema

### `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auth Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT NOT NULL CHECK (role IN ('team_leader', 'team_member', 'judge', 'admin')),

  -- Profile Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Organization
  institution TEXT,
  designation TEXT,

  -- Team Association (for participants)
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Judge Association (for judges)
  judge_id UUID REFERENCES judges(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_team_id ON user_profiles(team_id);
```

### RLS Policies for User Profiles

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND NOT (role IS DISTINCT FROM OLD.role) -- Cannot change own role
);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Service role can do everything
CREATE POLICY "Service role full access"
ON user_profiles FOR ALL
USING (auth.role() = 'service_role');
```

---

## JWT Claims & Metadata

### Supabase Auth Custom Claims

When a user signs in, we include custom claims in the JWT:

```typescript
// In register-team Edge Function
const { data, error } = await supabase.auth.admin.updateUserById(user_id, {
  user_metadata: {
    role: 'team_leader',
    event_id: event_id,
    team_id: team_id,
    full_name: leader_name,
  },
  app_metadata: {
    provider: 'email',
    roles: ['team_leader'],
  }
});
```

### Accessing Claims in Client

```javascript
// Frontend - Get current user's role
const { data: { user } } = await supabase.auth.getUser();

const userRole = user?.user_metadata?.role;
const teamId = user?.user_metadata?.team_id;

// Use for routing decisions
if (userRole === 'team_leader') {
  navigate('/dashboard');
} else if (userRole === 'judge') {
  navigate('/judge');
} else if (userRole === 'admin') {
  navigate('/admin');
}
```

### Accessing Claims in Edge Functions

```typescript
// Edge Function - Extract user info
const authHeader = req.headers.get('Authorization');
const token = authHeader.replace('Bearer ', '');

const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}

const role = user.user_metadata.role;

// Check role-based access
if (role !== 'admin') {
  return new Response('Forbidden', { status: 403 });
}
```

---

## Session Management

### Supabase Auth Configuration

```javascript
// supabase/config.toml
[auth]
# Session settings
session_refresh_token_validity = 604800  # 7 days
session_access_token_validity = 3600     # 1 hour

# Email settings
enable_email_signups = true
enable_email_autoconfirm = false  # Require OTP
email_max_frequency = "2s"

# Rate limiting
rate_limit_email = "2/hour"
rate_limit_sms = "30/5 minutes"
rate_limit_token_verify = "30/5 minutes"
rate_limit_signin = "30/5 minutes"

# Password settings (though we use OTP)
minimum_password_length = 6
```

### Session Refresh Strategy

```javascript
// src/contexts/AuthContext.jsx
useEffect(() => {
  // Initial session check
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      } else if (_event === 'SIGNED_OUT') {
        // Clear local state
        navigate('/login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Session Expiry Handling

```javascript
// src/utils/sessionManager.js
export function setupSessionExpiryHandler() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Session refreshed');
    } else if (event === 'SIGNED_OUT') {
      // Redirect to login
      window.location.href = '/login';
    }
  });

  // Check session every 5 minutes
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
    }
  }, 300000); // 5 minutes
}
```

---

## Protected Routes

### Route Protection Component

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, role, fallback }) {
  const { user, role: userRole, loading } = useAuth();

  if (loading) {
    return <Preloader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (role && userRole !== role) {
    return <Navigate to={fallback || '/unauthorized'} replace />;
  }

  return children;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute role="team_leader">
    <TeamDashboard />
  </ProtectedRoute>
} />
```

### Role-Based Routing

```javascript
// src/utils/authRouting.js
export function getRedirectForRole(role) {
  const redirects = {
    team_leader: '/dashboard',
    team_member: '/member',
    judge: '/judge',
    admin: '/admin'
  };
  return redirects[role] || '/unauthorized';
}

export function canAccessRoute(userRole, route) {
  const routeAccess = {
    '/dashboard': ['team_leader'],
    '/member': ['team_member'],
    '/judge': ['judge'],
    '/admin': ['admin'],
  };

  const allowedRoles = routeAccess[route];
  return allowedRoles?.includes(userRole) || false;
}
```

---

## Authorization Middleware

### Edge Function Authorization Helper

```typescript
// supabase/functions/_shared/auth.ts
import { supabase } from './supabase';

export interface AuthContext {
  user: any;
  role: string;
  eventId: string;
  teamId?: string;
}

export async function authorizeRequest(
  req: Request,
  allowedRoles: string[] = []
): Promise<AuthContext> {
  // Extract token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Invalid token');
  }

  // Extract role from metadata
  const role = user.user_metadata?.role;
  if (!role) {
    throw new Error('User role not found');
  }

  // Check role access
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }

  // Check event access
  const eventId = user.user_metadata?.event_id;
  if (!eventId) {
    throw new Error('User not associated with an event');
  }

  return {
    user,
    role,
    eventId,
    teamId: user.user_metadata?.team_id
  };
}

// Usage in Edge Functions
export async function handler(req: Request) {
  try {
    const auth = await authorizeRequest(req, ['team_leader', 'admin']);

    // Proceed with function logic
    return new Response(JSON.stringify({ success: true }));

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 401 }
    );
  }
}
```

### Frontend Authorization Hook

```javascript
// src/hooks/useAuthorization.js
import { useAuth } from '../contexts/AuthContext';

export function useAuthorization() {
  const { user, role } = useAuth();

  const hasRole = (requiredRole) => {
    return role === requiredRole;
  };

  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.includes(role);
  };

  const can = (action, resource) => {
    // Permission matrix
    const permissions = {
      team_leader: {
        'edit.team': true,
        'select.ps': true,
        'submit.ideathon': true,
        'submit.review': true,
        'view.scores': true,
      },
      team_member: {
        'view.team': true,
        'view.scores': true,
      },
      judge: {
        'submit.scores': true,
        'view.assigned': true,
      },
      admin: {
        '*': true, // Wildcard for all actions
      }
    };

    const userPermissions = permissions[role] || {};
    return userPermissions[action] || userPermissions['*'] || false;
  };

  return {
    user,
    role,
    hasRole,
    hasAnyRole,
    can,
    isAdmin: role === 'admin',
    isTeamLeader: role === 'team_leader',
    isTeamMember: role === 'team_member',
    isJudge: role === 'judge',
  };
}

// Usage in components
function TeamSettings() {
  const { can } = useAuthorization();

  if (!can('edit.team')) {
    return <p>You don't have permission to edit team settings.</p>;
  }

  return <TeamSettingsForm />;
}
```

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`01-database-schema.md`](./01-database-schema.md) | `user_profiles` table schema |
| [`02-backend-api.md`](./02-backend-api.md) | Edge Functions with authorization |
| [`03-frontend-architecture.md`](./03-frontend-architecture.md) | Protected routes and auth context |
| [`06-security-audit.md`](./06-security-audit.md) | Security best practices |

---

**Next**: Read [`05-feature-breakdown.md`](./05-feature-breakdown.md) for feature implementation details.
