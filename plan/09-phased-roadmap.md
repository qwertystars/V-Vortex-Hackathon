# 09 - PHASED IMPLEMENTATION ROADMAP

## Table of Contents
1. [Overview](#overview)
2. [Implementation Strategy](#implementation-strategy)
3. [Phase 1: Foundation](#phase-1-foundation)
4. [Phase 2: Registration & Onboarding](#phase-2-registration--onboarding)
5. [Phase 3: Problem Statement Management](#phase-3-problem-statement-management)
6. [Phase 4: Submission Systems](#phase-4-submission-systems)
7. [Phase 5: Judge & Scoring System](#phase-5-judge--scoring-system)
8. [Phase 6: Results & Leaderboards](#phase-6-results--leaderboards)
9. [Phase 7: Finals (Shark Tank & Bug Bounty)](#phase-7-finals-shark-tank--bug-bounty)
10. [Phase 8: Email & Notifications](#phase-8-email--notifications)
11. [Phase 9: Admin Dashboard Enhancement](#phase-9-admin-dashboard-enhancement)
12. [Phase 10: Testing, Security Audit, Deployment](#phase-10-testing-security-audit-deployment)
13. [Dependencies](#dependencies)
14. [Related Documents](#related-documents)

---

## Overview

This document outlines the phased implementation roadmap for the V-Vortex Platform.

### Implementation Strategy

**Approach**: Incremental development with continuous deployment

**Principles**:
1. Build foundation first (database, auth, RBAC)
2. Implement core user flows (registration → submission → scoring)
3. Add advanced features (finals, notifications)
4. Test, audit, and deploy

**Team Structure Recommendations**:
- 1-2 Backend Developers (Supabase, Edge Functions)
- 1-2 Frontend Developers (React, UI)
- 1 QA Engineer (testing)
- 1 DevOps/SRE (deployment, monitoring)

---

## Phase 1: Foundation

**Goal**: Establish core infrastructure

**Duration**: Week 1-2

### Tasks

#### 1.1 Database Schema Setup
- [ ] Create `event_config` table
- [ ] Create `user_profiles` table
- [ ] Create `domains` table
- [ ] Create `problem_statements` table
- [ ] Create `judges` table
- [ ] Create all missing tables (see `01-database-schema.md`)
- [ ] Set up RLS policies for all tables
- [ ] Create indexes for performance

**Files**:
- `supabase/migrations/202501240001_create_event_config.sql`
- `supabase/migrations/202501240002_create_user_profiles.sql`
- etc.

#### 1.2 Authentication & RBAC
- [ ] Update `register-team` to create `user_profiles`
- [ ] Update JWT claims to include role
- [ ] Implement authorization helper in Edge Functions
- [ ] Test RBAC across all roles
- [ ] Set up protected routes in frontend

**Files**:
- `supabase/functions/_shared/auth.ts`
- `src/contexts/AuthContext.jsx`
- `src/components/ProtectedRoute.jsx`

#### 1.3 Event Configuration
- [ ] Create event configuration UI (admin only)
- [ ] Implement phase state machine
- [ ] Add deadline fields to event_config
- [ ] Create `admin-update-config` function

**Files**:
- `supabase/functions/admin/update-config`
- `src/pages/admin/AdminConfig.jsx`

---

## Phase 2: Registration & Onboarding

**Goal**: Complete team registration flow

**Duration**: Week 2-3

### Tasks

#### 2.1 Team Registration Enhancement
- [ ] Add registration states (draft, submitted, approved, rejected)
- [ ] Implement admin approval workflow
- [ ] Add registration confirmation email
- [ ] Improve error messages

**Files**:
- `supabase/functions/register-team` (update)
- `supabase/functions/admin/approve-team` (new)
- `src/pages/team/Registration.jsx` (update)

#### 2.2 Team Building
- [ ] Implement team member invitation flow
- [ ] Send invitation emails with OTP
- [ ] Create invitation acceptance page
- [ ] Enforce team size limits (2-4)
- [ ] Generate QR codes for members

**Files**:
- `supabase/functions/build-team` (update)
- `supabase/functions/accept-invitation` (new)
- `src/pages/team/TeamManagement.jsx`
- `src/pages/team/AcceptInvitation.jsx`

#### 2.3 Payment Verification
- [ ] Implement `admin-verify-payment` function
- [ ] Create payment verification UI
- [ ] Send payment status emails
- [ ] Add payment status to team dashboard

**Files**:
- `supabase/functions/admin/verify-payment`
- `src/pages/admin/AdminPayments.jsx`

---

## Phase 3: Problem Statement Management

**Goal**: FCFS PS selection system

**Duration**: Week 3-4

### Tasks

#### 3.1 PS Catalog
- [ ] Create PS management UI (admin)
- [ ] Implement PS CRUD operations
- [ ] Add domain organization
- [ ] Set max team limits per PS
- [ ] Create PS availability tracker

**Files**:
- `supabase/functions/admin/create-ps`
- `supabase/functions/admin/update-ps`
- `src/pages/admin/AdminProblemStatements.jsx`

#### 3.2 FCFS Selection
- [ ] Implement `select-ps` Edge Function
- [ ] Create atomic allocation RPC function
- [ ] Add `current_teams` counter trigger
- [ ] Implement PS availability API

**Files**:
- `supabase/functions/select-ps`
- `supabase/functions/get-ps-availability`
- `supabase/migrations/XXXX_add_ps_trigger.sql`

#### 3.3 PS Selection UI
- [ ] Create PS selection page for teams
- [ ] Display availability indicators
- [ ] Handle allocation race conditions
- [ ] Implement PS locking

**Files**:
- `src/pages/team/ProblemStatementSelection.jsx`
- `src/components/ui/PSAvailabilityBadge.jsx`

---

## Phase 4: Submission Systems

**Goal**: Ideathon and Hackathon review submissions

**Duration**: Week 4-5

### Tasks

#### 4.1 Ideathon Submissions
- [ ] Create `submit-ideathon` function
- [ ] Implement deadline validation
- [ ] Add file upload to Supabase Storage
- [ ] Validate Drive links
- [ ] Create submission UI

**Files**:
- `supabase/functions/submit-ideathon`
- `src/pages/team/IdeathonSubmission.jsx`

#### 4.2 Review Submissions
- [ ] Create `submit-review` function (all rounds)
- [ ] Implement GitHub repo validation
- [ ] Add deployed URL validation
- [ ] Implement code freeze for Review 3
- [ ] Create submission UI per round

**Files**:
- `supabase/functions/submit-review`
- `src/pages/team/ReviewSubmission.jsx`

#### 4.3 File Storage
- [ ] Configure Supabase Storage buckets
- [ ] Set up storage policies
- [ ] Implement file upload UI
- [ ] Add file size/type validation

**Files**:
- `supabase/migrations/XXXX_create_storage_buckets.sql`
- `src/components/ui/FileUpload.jsx`

---

## Phase 5: Judge & Scoring System

**Goal**: Complete judge workflow

**Duration**: Week 5-6

### Tasks

#### 5.1 Judge Management
- [ ] Create judge accounts
- [ ] Implement judge assignment system
- [ ] Create judge dashboard
- [ ] Add judge briefing materials

**Files**:
- `supabase/functions/admin/create-judge`
- `supabase/functions/admin/assign-judge`
- `src/pages/admin/AdminJudges.jsx`
- `src/pages/judge/JudgeDashboard.jsx`

#### 5.2 Scoring Interface
- [ ] Create scoring form component
- [ ] Implement draft save
- [ ] Implement final submit with locking
- [ ] Add rubric display
- [ ] Implement validation

**Files**:
- `supabase/functions/submit-score`
- `src/components/judge/ScoringForm.jsx`

#### 5.3 Rubric Configuration
- [ ] Create rubric management UI
- [ ] Implement customizable rubrics
- [ ] Add round-specific rubrics
- [ ] Configure max scores per category

**Files**:
- `supabase/functions/admin/create-rubric`
- `src/pages/admin/AdminRubrics.jsx`

---

## Phase 6: Results & Leaderboards

**Goal**: Automated scoring and results

**Duration**: Week 6-7

### Tasks

#### 6.1 Score Aggregation
- [ ] Implement multi-judge averaging
- [ ] Add tie-break logic
- [ ] Create leaderboard view
- [ ] Implement ranking calculations

**Files**:
- `supabase/migrations/XXXX_create_leaderboard_view.sql`
- `supabase/functions/calculate-rankings`

#### 6.2 Leaderboard Display
- [ ] Create public leaderboard page
- [ ] Add team rankings display
- [ ] Show score deltas
- [ ] Implement filtering

**Files**:
- `src/pages/public/Leaderboard.jsx`
- `src/components/LeaderboardTable.jsx`

#### 6.3 Result Publication
- [ ] Implement phase-wise result visibility
- [ ] Create admin result review
- [ ] Add result publishing controls
- [ ] Send result announcement emails

**Files**:
- `supabase/functions/admin/publish-results`
- `src/pages/admin/AdminResults.jsx`

---

## Phase 7: Finals (Shark Tank & Bug Bounty)

**Goal**: Finals features

**Duration**: Week 7-8

### Tasks

#### 7.1 Shark Tank
- [ ] Implement credit system
- [ ] Create investment allocation UI
- [ ] Add investment leaderboard
- [ ] Implement credit validation

**Files**:
- `supabase/migrations/XXXX_create_shark_tank.sql`
- `supabase/functions/allocate-shark-tank-investments`
- `src/pages/finals/SharkTank.jsx`

#### 7.2 Bug Bounty
- [ ] Implement random project assignment
- [ ] Create bug submission form
- [ ] Add PoC file upload
- [ ] Implement bug bounty leaderboard
- [ ] Create bug scoring rubric

**Files**:
- `supabase/migrations/XXXX_create_bug_bounty.sql`
- `supabase/functions/submit-bug-report`
- `src/pages/finals/BugBounty.jsx`

#### 7.3 Finalist Management
- [ ] Implement finalist tagging
- [ ] Create finalist announcement
- [ ] Add finals eligibility checks

**Files**:
- `supabase/functions/admin/tag-finalists`

---

## Phase 8: Email & Notifications

**Goal**: Complete communication system

**Duration**: Week 8-9

### Tasks

#### 8.1 Email Templates
- [ ] Create all email templates
- [ ] Implement email sending service
- [ ] Add email scheduling
- [ ] Create email logs

**Files**:
- `supabase/functions/_shared/email-templates.ts`
- `supabase/functions/send-email`

#### 8.2 In-App Notifications
- [ ] Create notifications table
- [ ] Implement real-time notifications
- [ ] Create notification panel
- [ ] Add unread badge
- [ ] Implement mark as read

**Files**:
- `supabase/migrations/XXXX_create_notifications.sql`
- `src/contexts/NotificationContext.jsx`
- `src/components/ui/NotificationsPanel.jsx`

#### 8.3 Announcements
- [ ] Create announcement system
- [ ] Implement announcement broadcasting
- [ ] Add announcement targeting
- [ ] Create announcement history

**Files**:
- `supabase/functions/admin/send-announcement`
- `src/pages/admin/AdminAnnouncements.jsx`

---

## Phase 9: Admin Dashboard Enhancement

**Goal**: Complete admin controls

**Duration**: Week 9-10

### Tasks

#### 9.1 Admin Overview
- [ ] Create dashboard with metrics
- [ ] Add registration stats
- [ ] Show payment verification status
- [ ] Display submission progress
- [ ] Add phase progress indicators

**Files**:
- `src/pages/admin/AdminOverview.jsx`

#### 9.2 Advanced Controls
- [ ] Implement deadline extensions
- [ ] Add PS reassignment
- [ ] Create emergency override tools
- [ ] Implement bulk operations
- [ ] Add incident handling

**Files**:
- `supabase/functions/admin/override-deadline`
- `supabase/functions/admin/reassign-ps`

#### 9.3 Data Export
- [ ] Implement export by entity type
- [ ] Add multiple formats (CSV, JSON, XLSX)
- [ ] Create filtered exports
- [ ] Add export scheduling

**Files**:
- `supabase/functions/admin/export-data`
- `src/pages/admin/AdminExport.jsx`

---

## Phase 10: Testing, Security Audit, Deployment

**Goal**: Production-ready system

**Duration**: Week 10-12

### Tasks

#### 10.1 Testing
- [ ] Unit tests for Edge Functions
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Load testing for submissions
- [ ] Security testing

**Files**:
- `supabase/tests/*.test.ts`
- `src/tests/*.test.jsx`

#### 10.2 Security Audit
- [ ] Review RLS policies
- [ ] Audit edge function security
- [ ] Check for vulnerabilities
- [ ] Validate input sanitization
- [ ] Review audit logging

**Reference**: `06-security-audit.md`

#### 10.3 Deployment
- [ ] Set up production environment
- [ ] Configure domain and SSL
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Create deployment runbook
- [ ] Set up alerting

**Files**:
- `DEPLOYMENT.md`
- `docs/runbook.md`

---

## Dependencies

### Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Registration) - Requires Phase 1
    ↓
Phase 3 (PS Management) - Requires Phase 2
    ↓
Phase 4 (Submissions) - Requires Phase 3
    ↓
Phase 5 (Judges) - Can run parallel to Phase 4
    ↓
Phase 6 (Results) - Requires Phase 5
    ↓
Phase 7 (Finals) - Requires Phase 6
    ↓
Phase 8 (Notifications) - Can run parallel to Phase 7
    ↓
Phase 9 (Admin) - Can run parallel to Phase 8
    ↓
Phase 10 (Testing) - Requires all phases
```

### Critical Path

1. **Foundation** → **Registration** → **PS Management** → **Submissions** → **Judges** → **Results**

### Can Run in Parallel

- Phase 5 (Judges) can start once Phase 3 (PS Management) is done
- Phase 8 (Notifications) can be developed alongside Phases 7-9
- Testing (Phase 10) should happen incrementally after each phase

---

## Related Documents

| Document | Description |
|----------|-------------|
| [`00-overview.md`](./00-overview.md) | System overview |
| [`01-database-schema.md`](./01-database-schema.md) | All database tables |
| [`02-backend-api.md`](./02-backend-api.md) | Edge Functions |
| [`03-frontend-architecture.md`](./03-frontend-architecture.md) | Frontend components |
| [`05-feature-breakdown.md`](./05-feature-breakdown.md) | Feature details |
| [`06-security-audit.md`](./06-security-audit.md) | Security checklist |

---

## Summary

**Total Estimated Duration**: 12 weeks (3 months)

**Team Recommended**: 4-5 people
- 2 Backend Developers
- 2 Frontend Developers
- 1 QA Engineer (part-time)
- 1 DevOps (part-time)

**MVP Minimum**: Phases 1-6 (Foundation through Results) = 7 weeks

---

**End of Implementation Roadmap**
