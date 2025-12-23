# 00 - V-VORTEX PLATFORM OVERVIEW

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [System Architecture](#system-architecture)
4. [Technical Stack](#technical-stack)
5. [Key Design Principles](#key-design-principles)
6. [Phase State Machine](#phase-state-machine)
7. [Access Control & Data Security](#access-control--data-security)
8. [Related Documents](#related-documents)

---

## Executive Summary

The **V-Vortex Platform** is a comprehensive hackathon management system built on **Supabase** (backend) and **React 19 + Vite** (frontend), providing end-to-end support for:

- Team registration (2-4 members with leader/member roles)
- Problem Statement marketplace with FCFS (First-Come-First-Serve) allocation
- Multi-round submission tracking (Ideathon → Hackathon Reviews → Finals)
- Judge management and rubric-based scoring
- Real-time leaderboards and results publication
- Admin controls for event orchestration

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Authentication | 🔄 Partial | Email OTP works, RBAC needs enhancement |
| Team Registration | 🔄 Partial | Basic flow exists, needs approval workflow |
| Scoring System | ✅ Complete | Multi-criteria scoring with history |
| Leaderboard | ✅ Complete | Real-time rankings |
| Problem Statement Selection | ❌ Missing | FCFS system needed |
| Submission Portals | ❌ Missing | Ideathon & Hackathon submissions needed |
| Judge Dashboard | ❌ Missing | Scoring interface needed |
| Email Notifications | 🔄 Partial | Only OTP emails |

---

## Problem Statement

### Why V-Vortex?

Managing hackathons at scale presents unique challenges:

1. **Team Dynamics**: Teams of 2-4 with different permission levels (Leader vs Member)
2. **PS Allocation**: First-come-first-serve problem statement selection with live availability
3. **Multi-Round Process**: Ideathon → Review 1 → Review 2 → Review 3 → Finals
4. **Judge Coordination**: Domain-specific assignment with rubric-based evaluation
5. **Deadline Management**: Hard locks across UI and backend
6. **Transparent Results**: Public leaderboards with controlled visibility

### V-Vortex Solutions

| Challenge | Solution |
|-----------|----------|
| Team Roles | RBAC with Team Leader (full control) + Team Member (read-only) |
| PS Selection | FCFS with real-time slot tracking and instant locking |
| Deadline Enforcement | Phase state machine with UI + backend hard locks |
| Judge Management | Domain-based assignment with score locking after submit |
| Results | Automated aggregation with phase-wise publication controls |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC ACCESS LAYER                          │
│  (No Authentication Required)                                   │
│  - Homepage, Timeline, Domains, PS Catalog                      │
│  - Rules, Sponsors, Speakers, FAQ                               │
│  - Read-only Leaderboards                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION GATEWAY                        │
│  - Email OTP (Supabase Auth)                                    │
│  - Role Detection (Leader/Member/Judge/Admin)                   │
│  - Session Management                                           │
│  - Rate Limiting                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────┐   ┌──────────────────┐
│  PARTICIPANTS   │  │   JUDGES    │   │     ADMIN        │
├─────────────────┤  ├─────────────┤   ├──────────────────┤
│ Team Leader    │  │ Dashboard   │   │ Event Control    │
│ - Register     │  │ - Assigned  │   │ - Phase Mgmt     │
│ - Build Team   │  │   Teams     │   │ - User Mgmt      │
│ - Select PS    │  │ - Scoring   │   │ - Verifyments    │
│ - Submit       │  │ - Progress  │   │ - Reports        │
│ - View Scores  │  │ - Briefing  │   │ - Announcements  │
│                │  │             │   │                  │
│ Team Member    │  │             │   │                  │
│ - View Only    │  │             │   │                  │
└─────────────────┘  └─────────────┘   └──────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                             │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │ Edge Functions │  │ PostgreSQL  │  │    Storage       │     │
│  │ - Auth         │  │ + RLS       │  │ - Files          │     │
│  │ - Validation   │  │ - Multi-DB  │  │ - Documents      │     │
│  │ - Logic        │  │ - Audit     │  │                  │     │
│  └────────────────┘  └─────────────┘  └──────────────────┘     │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │     Auth       │  │  Realtime   │  │    Email         │     │
│  │ - Email OTP    │  │ - Live      │  │ - Notifications  │     │
│  │ - Sessions     │  │   Updates   │  │ - Templates      │     │
│  └────────────────┘  └─────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Request
    │
    ▼
┌─────────────────┐
│  React Frontend │ → Check Auth State
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Auth Guard      │ → Redirect if needed
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ API Layer       │ → Supabase Client
│ (supabase.js)   │
└─────────────────┘
    │
    ▼
┌─────────────────┐       ┌─────────────────┐
│ Edge Function   │ ───▶  │  PostgreSQL     │
│ (Business Logic)│       │  + RLS Policies │
└─────────────────┘       └─────────────────┘
    │                            │
    ▼                            ▼
┌─────────────────┐       ┌─────────────────┐
│ Response        │ ◀───  │  Data Return    │
└─────────────────┘       └─────────────────┘
```

---

## Technical Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **Supabase** | Backend-as-a-Service Platform | Latest |
| **PostgreSQL** | Primary Database | 17 |
| **Deno** | Edge Functions Runtime | Latest |
| **Row Level Security (RLS)** | Data Isolation | - |
| **Supabase Auth** | Email OTP Authentication | - |
| **Supabase Storage** | File Storage | - |
| **Supabase Realtime** | Live Updates | - |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.2.0 |
| **Vite** | Build Tool | 7.2.4 |
| **React Router** | Routing | 7.10.1 |
| **Supabase JS** | Backend Client | 2.87.1 |
| **ExcelJS** | Data Export | 4.3.0 |
| **React Compiler** | Performance Optimization | 1.0.0 |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Git | Version Control |
| Supabase CLI | Local Development & Migrations |

---

## Key Design Principles

### 1. Role-Based Access Control

The platform enforces strict role-based access:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Team Leader    │     │  Team Member    │     │     Judge       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • Full team     │     │ • Read-only     │     │ • Evaluate      │
│   control       │     │   access        │     │   assigned only │
│ • Submit PS     │     │ • View team     │     │ • Submit scores │
│ • Submit rounds │     │   dashboard     │     │ • Lock scores   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Implementation**: Custom `user_profiles` table + RLS policies + JWT claims.

### 2. First-Come-First-Serve (FCFS) Allocation

Problem Statements are allocated on FCFS basis with real-time tracking:

```
┌──────────────────────────────────────────────────────────────┐
│              PROBLEM STATEMENT ALLOCATION                     │
├──────────────────────────────────────────────────────────────┤
│  PS: "AI-Powered Healthcare Diagnostics"                     │
│  Domain: AI/ML                                                │
│  Max Teams: 10                                                │
│  Available Slots: 3                                           │
│  Status: 🔴 CRITICAL (few remaining)                          │
├──────────────────────────────────────────────────────────────┤
│  Teams Assigned:                                              │
│  1. Team Alpha    [Selected: 2025-01-15 09:23:11]            │
│  2. Team Beta     [Selected: 2025-01-15 10:45:33]            │
│  3. Team Gamma    [Selected: 2025-01-15 14:12:07]            │
│  4. Team Delta    [Selected: 2025-01-15 16:30:45]            │
│  5. Team Epsilon  [Selected: 2025-01-15 18:55:12]            │
│  6. Team Zeta     [Selected: 2025-01-16 09:10:23]            │
│  7. Team Eta      [Selected: 2025-01-16 11:30:45]            │
└──────────────────────────────────────────────────────────────┘
```

**Implementation**: `ps_allocations` table with `allocated_at` timestamp. Atomic updates with row locks.

### 3. Role-Based Access Control (RBAC)

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Team Leader** | Full team control | Can submit, select PS, edit team |
| **Team Member** | Read-only mirror | Can view team data, no actions |
| **Judge** | Evaluate assigned teams | Score submissions, view assigned only |
| **Admin** | Full system access | All controls, audited overrides |

**Implementation**: Custom `user_roles` table + RLS policies + JWT claims.

### 4. Phase State Machine

Events progress through defined phases with hard locks:

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│REGISTRATION│───▶│ IDEATHON   │───▶│HACKATHON   │───▶│  FINALS    │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
 • Team signup     • PS selection    • Review 1       • Shark Tank
 • Payment verif   • Ideathon sub    • Review 2       • Bug Bounty
 • Team building   • Review & grade  • Review 3
                                        • Code freeze
                                        • Finals prep
```

**Implementation**: `event_phases` table with phase transitions enforced by Edge Functions.

### 5. Global Deadline Enforcement

Deadlines are enforced at **both UI and backend levels**:

```
┌─────────────────────────────────────────────────────────────┐
│  DEADLINE: Ideathon Submission - 2025-01-20 23:59:59       │
├─────────────────────────────────────────────────────────────┤
│  Time Remaining: 02:14:33                                   │
│                                                             │
│  [Submit Ideathon]  ← UI Button (disabled after deadline)   │
│                                                             │
│  Backend Edge Function:                                    │
│  if (now > deadline) {                                      │
│    throw new Error('Submission closed');                   │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

**Implementation**: `phase_deadlines` table + Edge Function validation + React countdown timers.

### 6. Audit Logging

All significant actions are logged with full context:

```sql
INSERT INTO audit_logs (
  action,
  entity_type,
  entity_id,
  user_id,
  event_id,
  old_values,
  new_values,
  ip_address,
  user_agent,
  timestamp
) VALUES (
  'UPDATE',
  'team',
  'uuid-here',
  'user-uuid',
  'event-uuid',
  '{"status": "draft"}',
  '{"status": "approved"}',
  '192.168.1.1',
  'Mozilla/5.0...',
  NOW()
);
```

**Implementation**: `audit_logs` table with triggers + Edge Function logging.

---

---

## Phase State Machine

### Phase Transitions

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE STATE MACHINE                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   ┌──────────────┐      ┌──────────────┐                      │
│   │REGISTRATION  │ ───▶ │  IDEATHON    │                      │
│   └──────────────┘      └──────────────┘                      │
│         │                       │                              │
│         │ - Team signup         │ - PS selection              │
│         │ - Payment verify       │ - Ideathon submit           │
│         │ - Team building        │ - Ideathon grading          │
│         │                       │                              │
│         ▼                       ▼                              │
│   ┌──────────────┐      ┌──────────────┐                      │
│   │    ARCHIVE   │ ◀─── │  HACKATHON   │                      │
│   └──────────────┘      └──────────────┘                      │
│         ▲                       │                              │
│         │                       │ - Review 1 (30%)            │
│         │                       │ - Review 2 (50%)            │
│         │                       │ - Review 3 (Final)          │
│         │                       │ - Code freeze               │
│         │                       │                              │
│         │                       ▼                              │
│         │                 ┌──────────────┐                    │
│         │                 │   FINALS     │                    │
│         │                 └──────────────┘                    │
│         │                       │                              │
│         │                       │ - Shark Tank                │
│         │                       │ - Bug Bounty                │
│         │                       │ - Results                   │
│         │                       │                              │
└────────────────────────────────────────────────────────────────┘
```

### Phase Enforcement

Each phase controls which features are enabled:

```sql
CREATE TABLE phase_features (
  phase TEXT PRIMARY KEY,
  allow_team_registration BOOLEAN DEFAULT FALSE,
  allow_ps_selection BOOLEAN DEFAULT FALSE,
  allow_ideathon_submit BOOLEAN DEFAULT FALSE,
  allow_review1_submit BOOLEAN DEFAULT FALSE,
  allow_review2_submit BOOLEAN DEFAULT FALSE,
  allow_review3_submit BOOLEAN DEFAULT FALSE,
  allow_judge_scoring BOOLEAN DEFAULT FALSE,
  show_leaderboard BOOLEAN DEFAULT FALSE,
  show_results BOOLEAN DEFAULT FALSE
);

-- Example: Ideathon phase
INSERT INTO phase_features (phase, ...) VALUES
  ('ideathon', TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE);

-- Example: Finals phase
INSERT INTO phase_features (phase, ...) VALUES
  ('finals', FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE);
```

---

## Access Control & Data Security

### Row Level Security (RLS)

RLS policies enforce access control at the database level:

```sql
-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team leaders can see their own team
CREATE POLICY "Team leaders can view own team"
ON teams FOR SELECT
USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Admins can see all teams
CREATE POLICY "Admins can view all teams"
ON teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### Role-Based Data Access

- **Team Leaders**: Full access to their team data only
- **Team Members**: Read-only access to their team data
- **Judges**: Access to assigned teams and their own scores
- **Admins**: Full access to all system data

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`01-database-schema.md`](./01-database-schema.md) | Complete database schema design with all tables, relationships, and RLS policies |
| [`02-backend-api.md`](./02-backend-api.md) | Supabase Edge Functions specification |
| [`03-frontend-architecture.md`](./03-frontend-architecture.md) | React component structure and routing |
| [`04-auth-rbac.md`](./04-auth-rbac.md) | Authentication and role-based access control |
| [`05-feature-breakdown.md`](./05-feature-breakdown.md) | Feature-by-feature implementation details |
| [`06-security-audit.md`](./06-security-audit.md) | Security considerations and audit logging |
| [`09-phased-roadmap.md`](./09-phased-roadmap.md) | Implementation phases and timeline |

---

**Next**: Read [`01-database-schema.md`](./01-database-schema.md) for the complete database design.
