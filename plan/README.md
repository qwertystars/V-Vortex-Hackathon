# V-VORTEX PLATFORM - IMPLEMENTATION PLAN

## Overview

This is the comprehensive implementation plan for the V-Vortex Hackathon Platform - a hackathon management system built with **Supabase** (backend) and **React 19 + Vite** (frontend).

## Current State Assessment

### Existing Foundation
- ✅ Supabase backend with PostgreSQL 17
- ✅ React 19.2.0 + Vite 7.2.4 frontend
- ✅ Email OTP authentication
- ✅ Team registration (2-4 members)
- ✅ Basic scoring system
- ✅ Leaderboard
- ✅ Admin dashboard with Excel export

### Gaps to Fill
- ❌ Problem Statement FCFS selection
- ❌ Ideathon & Hackathon submission portals
- ❌ Judge management & dashboard
- ❌ Rubric-based scoring system
- ❌ Finals (Shark Tank & Bug Bounty)
- ❌ Comprehensive email notifications
- ❌ Full RBAC implementation

---

## Plan Structure

This plan is organized into the following documents:

```
plan/
├── README.md                      # THIS FILE - Main index
├── 00-overview.md                 # Executive summary & architecture
├── 01-database-schema.md          # Complete database design
├── 02-backend-api.md              # Supabase Edge Functions
├── 03-frontend-architecture.md    # React components & routing
├── 04-auth-rbac.md                # Authentication & permissions
├── 05-feature-breakdown.md        # Feature-by-feature implementation
├── 06-security-audit.md           # Security & audit logging
├── 07-testing-strategy.md         # Testing approach
├── 08-deployment.md               # Deployment & operations
└── 09-phased-roadmap.md           # Implementation phases
```

---

## Quick Navigation

### By Role

| For... | Read These First |
|--------|------------------|
| **Backend Developers** | `01-database-schema.md`, `02-backend-api.md`, `04-auth-rbac.md` |
| **Frontend Developers** | `03-frontend-architecture.md`, `05-feature-breakdown.md` |
| **DevOps/SRE** | `08-deployment.md`, `06-security-audit.md` |
| **Project Managers** | `00-overview.md`, `09-phased-roadmap.md` |
| **QA Engineers** | `07-testing-strategy.md` |

### By Topic

| Topic | Document |
|-------|----------|
| **System Architecture** | `00-overview.md` |
| **Database Design** | `01-database-schema.md` |
| **API Design** | `02-backend-api.md` |
| **Frontend Structure** | `03-frontend-architecture.md` |
| **Authentication** | `04-auth-rbac.md` |
| **Feature Implementation** | `05-feature-breakdown.md` |
| **Security** | `06-security-audit.md` |
| **Testing** | `07-testing-strategy.md` |
| **Deployment** | `08-deployment.md` |
| **Implementation Phases** | `09-phased-roadmap.md` |

---

## Tech Stack

### Backend
- **Database**: PostgreSQL 17 (via Supabase)
- **Auth**: Supabase Auth (Email OTP)
- **API**: Supabase Edge Functions (Deno)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.10.1
- **State**: React Context API + useState
- **Styling**: CSS Modules (custom cyberpunk theme)
- **Optimization**: React Compiler 1.0.0

---

## Key Features to Implement

### A) Core Platform
- [ ] Phase state machine (Registration → Ideathon → Hackathon → Finals → Archive)
- [ ] Global deadline enforcement
- [ ] Feature flags configuration
- [ ] Full data export (CSV/JSON)

### B) Authentication & RBAC
- [ ] Email OTP authentication (✅ exists, needs enhancement)
- [ ] Role-based access control (Team Leader, Team Member, Judge, Admin)
- [ ] Session management with expiry
- [ ] Rate limiting on auth endpoints

### C) Team Registration
- [ ] Team-based registration (2-4 members) (✅ partial)
- [ ] Team leader profile creation
- [ ] Team member invitations via email
- [ ] Team member acceptance flow
- [ ] Admin approval workflow

### D) Payment Verification
- [ ] External payment reference capture
- [ ] Admin verification UI
- [ ] Payment-gated participation

### E) Problem Statements (FCFS)
- [ ] PS management with max team limits
- [ ] First-come-first-serve selection
- [ ] Live availability tracking
- [ ] PS locking after selection

### F) Ideathon Submissions
- [ ] PPT/PDF upload OR Drive link
- [ ] Timestamped submissions
- [ ] Hard deadline lock

### G) Hackathon Reviews
- [ ] Review 1 (30%), Review 2 (50%), Review 3 (Final)
- [ ] GitHub repo link
- [ ] Deployed app link
- [ ] Code freeze enforcement

### H) Judge Management
- [ ] Judge account creation
- [ ] Domain/PS-based assignment
- [ ] Judge dashboard with evaluation timers
- [ ] Score submission & locking

### I) Scoring & Rubrics
- [ ] Configurable rubrics per round
- [ ] Multi-judge aggregation
- [ ] Score locking rules
- [ ] Peer score visibility (configurable)

### J) Results & Leaderboards
- [ ] Automated score aggregation
- [ ] Ranking & tie-break logic
- [ ] Phase-wise result publication
- [ ] Public leaderboard toggles

### K) Finals (Shark Tank & Bug Bounty)
- [ ] Shark Tank credit wallet system
- [ ] Bug Bounty random assignment
- [ ] PoC attachments

### L) Admin Dashboard
- [ ] Global overview
- [ ] Team management & overrides
- [ ] Judge assignment
- [ ] Phase controls
- [ ] Emergency extensions

### M) Email & Notifications
- [ ] Registration confirmations
- [ ] Team invitations
- [ ] Payment updates
- [ ] Submission confirmations
- [ ] Deadline reminders
- [ ] Results announcements

### N) Security
- [ ] Strict data isolation
- [ ] Input & link validation
- [ ] Rate limiting
- [ ] Audit logging

---

## Implementation Approach

The implementation will follow the **phased roadmap** outlined in `09-phased-roadmap.md`:

1. **Phase 1**: Foundation (Database, Auth, RBAC)
2. **Phase 2**: Registration & Onboarding
3. **Phase 3**: Problem Statement Management
4. **Phase 4**: Submission Systems
5. **Phase 5**: Judge & Scoring System
6. **Phase 6**: Results & Leaderboards
7. **Phase 7**: Finals (Shark Tank, Bug Bounty)
8. **Phase 8**: Email & Notifications
9. **Phase 9**: Admin Dashboard Enhancement
10. **Phase 10**: Testing, Security Audit, Deployment

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         V-VORTEX PLATFORM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC WEBSITE                             │   │
│  │  (Homepage, Timeline, Domains, PS Catalog, Rules, FAQ)       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AUTH GATEWAY                               │   │
│  │  (Email OTP, Role Detection, Session Management)             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│         ┌─────────────┬──────┴──────┬─────────────┐                 │
│         │             │             │             │                 │
│  ┌──────▼──────┐ ┌───▼─────┐ ┌────▼────┐ ┌──────▼──────┐          │
│  │  TEAM       │ │  JUDGE  │ │  ADMIN  │ │   PUBLIC    │          │
│  │  DASHBOARD  │ │ DASHBOARD│ │DASHBOARD│ │   PAGES     │          │
│  └─────────────┘ └─────────┘ └─────────┘ └─────────────┘          │
│         │             │             │                               │
│  ┌──────▼──────┐ ┌───▼─────┐ ┌────▼────────────────────────────┐   │
│  │  REGISTRATION│ │SCORING  │ │    ADMIN CONTROLS               │   │
│  │  SUBMISSION  │ │RUBRICS  │ │    - User Management            │   │
│  │  PS SELECTION│ │LOCKING  │ │    - Event Configuration        │   │
│  │  TEAM BUILD  │ │         │ │    - Phase Controls             │   │
│  └──────────────┘ └─────────┘ │    - Data Export                │   │
│                             └──────────────────────────────────┘   │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  SUPABASE BACKEND                                                    │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno)                                        │   │
│  │  - Auth endpoints                                             │   │
│  │  - Business logic                                             │   │
│  │  - Validation & enforcement                                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 17 + RLS                                          │   │
│  │  - Row-level security                                         │   │
│  │  - Audit logging                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Storage                                                       │   │
│  │  - Payment receipts                                           │   │
│  │  - Submission files                                           │   │
│  │  - Documents                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Auth                                                          │   │
│  │  - Email OTP                                                  │   │
│  │  - Session management                                         │   │
│  │  - Role-based JWT claims                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

1. **Read the Overview**: `00-overview.md` - Understand the big picture
2. **Review Database Schema**: `01-database-schema.md` - See the complete data model
3. **Check Your Area**: Focus on the documents relevant to your role
4. **Follow the Roadmap**: Use `09-phased-roadmap.md` for implementation order

---

## Document References

Each document links to related documents:

| Document | References |
|----------|------------|
| `00-overview.md` | All documents |
| `01-database-schema.md` | `02-backend-api.md`, `04-auth-rbac.md` |
| `02-backend-api.md` | `01-database-schema.md`, `06-security-audit.md` |
| `03-frontend-architecture.md` | `05-feature-breakdown.md` |
| `04-auth-rbac.md` | `01-database-schema.md`, `02-backend-api.md` |
| `05-feature-breakdown.md` | `01-database-schema.md`, `03-frontend-architecture.md` |
| `06-security-audit.md` | `01-database-schema.md`, `02-backend-api.md`, `04-auth-rbac.md` |
| `07-testing-strategy.md` | All implementation documents |
| `08-deployment.md` | `06-security-audit.md` |
| `09-phased-roadmap.md` | All documents |

---

## Conventions Used

- ✅ = Feature already implemented
- 🔄 = Feature partially implemented
- ❌ = Feature missing
- 📋 = Planned feature
- 🔒 = Security consideration
- ⚠️ = Warning or risk
- 💡 = Suggestion or tip

---

**Last Updated**: 2025-12-24
**Version**: 1.0
**Status**: Planning Phase
